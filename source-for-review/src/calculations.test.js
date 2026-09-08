import { describe, expect, it } from "vitest";
import { allocateWorkdayLoad, analyzeFleetVehicle, capabilityFit, cargoPenalty, compareWorkdayVehicles, configRange, effectiveRangeFromPenalties, equipmentEnergyKwh, equipmentTrailerLbs, equipmentWeightLbs, findTruckFits, FIT_DOCK, fitDocks, liveFitScore, massRangePenalty, operatingCosts, planRoute, splitEquipmentMass, towingPenalty, workdayAssessment, workdayEnergy } from "./calculations";
import {
  BED_ACCESSORY_OPTIONS,
  CHARGING_OPTIONS,
  DECKED_DRAWER_PRICE_USD,
  DECKED_DRAWER_WEIGHT_LB,
  EXTANG_TONNEAU_LB,
  EXTANG_TONNEAU_PRICE_USD,
  STERILITE_27_TOTE_LB,
  STERILITE_27_TOTE_QTY,
  TOTE_4PACK_PRICE_USD,
  WG_LADDER_RACK_LB,
  WG_LADDER_RACK_PRICE_USD,
  EQUIPMENT_CATALOG,
  GENERIC_FIELD_SERVICE_KIT,
  MISC_PAYLOAD_OPTIONS,
  MAJOR_TRADES,
  TRADES,
  OVERFLOW_TRAILER_16_OPEN_LB,
  OVERFLOW_TRAILER_OPTIONS,
  PLAY_TOWABLE_FISHING_16_LB,
  PLAY_TOWABLE_OPTIONS,
  PLAY_TOWABLE_PONTOON_22_LB,
  VEHICLE_CONFIGS,
  VEHICLE_OPTIONS,
  WATER_LB_PER_GAL,
  WORKING_WIRE_LB,
  bedAccessoriesPriceUsd,
  bedAccessoriesWeightLbs,
  bedAccessoryOption,
  chargingOption,
  clampVehicleYear,
  toggleBedAccessoryId,
  equipmentItemsFromIds,
  equipmentOptionsForTrade,
  findTrade,
  resolveTradeProfile,
  selectableEquipmentForTrade,
  tradeDefaults,
  tradeShowsBedAccessories,
  vehicleYearOptions,
  defaultPlayGearIds,
  defaultPlayTowableId,
  playGearItemsFromIds,
  playTowableById,
} from "./data";

describe("towingPenalty", () => {
  it("returns no penalty without a trailer", () => {
    expect(towingPenalty(0, 10000)).toBe(0);
  });

  it("increases as trailer load approaches capacity", () => {
    expect(towingPenalty(8000, 10000)).toBeGreaterThan(towingPenalty(3000, 10000));
  });
});

describe("capabilityFit", () => {
  it("rewards adequate range, payload, towing, and charging", () => {
    const strong = capabilityFit({ effectiveRange: 280, dailyMiles: 70, trailerWeight: 3000, towingCapacity: 10000, payloadWeight: 600, payloadCapacity: 1800, homeCharging: true, categoryScore: 90 });
    const weak = capabilityFit({ effectiveRange: 120, dailyMiles: 130, trailerWeight: 9000, towingCapacity: 10000, payloadWeight: 1700, payloadCapacity: 1800, homeCharging: false, categoryScore: 55 });
    expect(strong).toBeGreaterThan(weak);
  });

  it("does not apply an assumed convertibility percentage when categoryScore is null", () => {
    const args = { effectiveRange: 280, dailyMiles: 70, trailerWeight: 3000, towingCapacity: 10000, payloadWeight: 600, payloadCapacity: 1800, homeCharging: true };
    const assumed = capabilityFit({ ...args, categoryScore: 96 });
    const none = capabilityFit({ ...args, categoryScore: null });
    const zero = capabilityFit({ ...args, categoryScore: 0 });
    expect(none).not.toBe(assumed);
    expect(none).not.toBe(zero);
  });
});

const cleanDockArgs = {
  payloadOver: false,
  towOver: false,
  energyShort: false,
  payloadNear: false,
  towNear: false,
  rangeTight: false,
  bedWeightLbs: 0,
  kitWeightLbs: 0,
  configRangeHit: false,
  hasOvernight: true,
};

const strongCapability = {
  effectiveRange: 280,
  dailyMiles: 70,
  trailerWeight: 3000,
  towingCapacity: 10000,
  payloadWeight: 600,
  payloadCapacity: 1800,
  homeCharging: true,
  categoryScore: 90,
};

describe("fitDocks", () => {
  it("docks 1 point for bed accessory weight", () => {
    const result = fitDocks({ ...cleanDockArgs, bedWeightLbs: 217 });
    expect(result.docks).toEqual([expect.objectContaining({ id: "bed-weight", points: FIT_DOCK.BED_WEIGHT })]);
    expect(result.total).toBe(1);
    expect(result.docks[0].reason).toMatch(/217/);
  });

  it("docks 1 point for selected kit weight", () => {
    const result = fitDocks({ ...cleanDockArgs, kitWeightLbs: 186 });
    expect(result.docks[0]).toEqual(expect.objectContaining({ id: "kit-weight", points: 1 }));
    expect(result.total).toBe(1);
  });

  it("docks 1 point when the selected config is less efficient than recommended", () => {
    expect(fitDocks({ ...cleanDockArgs, configRangeHit: true }).total).toBe(1);
  });

  it("docks 3 points when payload or towing is near capacity or reserve is thin", () => {
    expect(fitDocks({ ...cleanDockArgs, payloadNear: true }).total).toBe(3);
    expect(fitDocks({ ...cleanDockArgs, towNear: true }).total).toBe(3);
    expect(fitDocks({ ...cleanDockArgs, rangeTight: true }).total).toBe(3);
    expect(fitDocks({ ...cleanDockArgs, hasOvernight: false }).total).toBe(3);
  });

  it("docks 5 points when payload exceeds, towing exceeds, or range misses", () => {
    expect(fitDocks({ ...cleanDockArgs, payloadOver: true }).docks).toEqual([
      expect.objectContaining({ id: "payload-exceed", points: 5 }),
    ]);
    expect(fitDocks({ ...cleanDockArgs, towOver: true }).total).toBe(5);
    expect(fitDocks({ ...cleanDockArgs, energyShort: true }).total).toBe(5);
  });

  it("stacks 1 / 3 / 5 docks instead of replacing them", () => {
    const result = fitDocks({
      ...cleanDockArgs,
      bedWeightLbs: 200,
      payloadNear: true,
      payloadOver: true,
      energyShort: true,
    });
    expect(result.docks.map((dock) => dock.id)).toEqual(["bed-weight", "payload-exceed", "range-miss"]);
    expect(result.total).toBe(1 + 5 + 5);
  });
});

describe("liveFitScore", () => {
  it("subtracts tangible docks from the continuous capabilityFit base", () => {
    const base = capabilityFit(strongCapability);
    const live = liveFitScore(strongCapability, { ...cleanDockArgs, bedWeightLbs: 217 });
    expect(live.base).toBe(base);
    expect(live.score).toBe(base - 1);
    expect(live.total).toBe(1);
  });

  it("clamps a pile of docks at zero", () => {
    const live = liveFitScore(strongCapability, {
      ...cleanDockArgs,
      payloadOver: true,
      towOver: true,
      energyShort: true,
      bedWeightLbs: 200,
      kitWeightLbs: 200,
      hasOvernight: false,
    });
    expect(live.score).toBeGreaterThanOrEqual(0);
    expect(live.total).toBe(1 + 1 + 3 + 5 + 5 + 5);
  });
});

describe("splitEquipmentMass", () => {
  it("keeps bed upfits separate from trade-kit pounds", () => {
    expect(splitEquipmentMass([
      { id: "wire-spools", weightLbs: 128 },
      { id: "bed-drawers", weightLbs: 217 },
    ])).toEqual({ kitWeightLbs: 128, bedWeightLbs: 217 });
  });
});

describe("operatingCosts", () => {
  it("keeps results finite when MPG is zero", () => {
    const result = operatingCosts({ annualMiles: 18000, currentMpg: 0, fuelPrice: 4, electricityRate: 0.15, evPrice: 46000, tradeIn: 20000 });
    expect(Number.isFinite(result.currentAnnual)).toBe(true);
    expect(Number.isFinite(result.annualSavings)).toBe(true);
  });

  it("exposes monthly savings as the annual figure divided by 12", () => {
    const result = operatingCosts({ annualMiles: 18000, currentMpg: 16, fuelPrice: 4.05, electricityRate: 0.15, evPrice: 46000, tradeIn: 22000 });
    expect(result.monthlySavings).toBe(Math.round(result.annualSavings / 12));
    expect(result.netUpfront).toBe(24000);
  });

  it("changes annual fuel savings when EV kWh/100 mi changes", () => {
    const r1t = operatingCosts({
      annualMiles: 18000, currentMpg: 16, fuelPrice: 4.05, electricityRate: 0.15,
      evKwhPer100Miles: 48, evPrice: 46000, tradeIn: 22000,
    });
    const hummer = operatingCosts({
      annualMiles: 18000, currentMpg: 16, fuelPrice: 4.05, electricityRate: 0.15,
      evKwhPer100Miles: 64, evPrice: 79000, tradeIn: 22000,
    });
    expect(hummer.annualSavings).toBeLessThan(r1t.annualSavings);
    expect(hummer.monthlySavings).not.toBe(r1t.monthlySavings);
    expect(hummer.evAnnual).toBeGreaterThan(r1t.evAnnual);
  });

  it("folds an estimated bed upfit into net upfront without changing annual fuel savings", () => {
    const base = operatingCosts({ annualMiles: 18000, currentMpg: 16, fuelPrice: 4.05, electricityRate: 0.15, evPrice: 46000, tradeIn: 22000 });
    const withUpfit = operatingCosts({ annualMiles: 18000, currentMpg: 16, fuelPrice: 4.05, electricityRate: 0.15, evPrice: 46000, tradeIn: 22000, upfitPrice: DECKED_DRAWER_PRICE_USD });
    expect(withUpfit.annualSavings).toBe(base.annualSavings);
    expect(withUpfit.monthlySavings).toBe(base.monthlySavings);
    expect(withUpfit.upfitPrice).toBe(DECKED_DRAWER_PRICE_USD);
    expect(withUpfit.netUpfront).toBe(base.netUpfront + DECKED_DRAWER_PRICE_USD);
  });
});

describe("planRoute", () => {
  const stops = [
    { id: 1, legMiles: 0 },
    { id: 2, legMiles: 90 },
    { id: 3, legMiles: 90 },
    { id: 4, legMiles: 30 },
  ];

  it("carries a fast-charge top-up into later legs", () => {
    const result = planRoute({ stops, vehicleRange: 200, startCharge: 100, coldWeather: false });
    expect(result.chargeStopsNeeded).toBe(1);
    expect(result.stopStates[2].suggestChargeStop).toBe(true);
    expect(result.finalCharge).toBeGreaterThan(50);
  });

  it("derates range more heavily in cold weather", () => {
    const normal = planRoute({ stops, vehicleRange: 300, startCharge: 100, coldWeather: false });
    const cold = planRoute({ stops, vehicleRange: 300, startCharge: 100, coldWeather: true });
    expect(cold.realWorldRange).toBeLessThan(normal.realWorldRange);
  });

  it("recalculates remaining charge when routed miles change", () => {
    const short = planRoute({ stops: [{ id: 1, legMiles: 0 }, { id: 2, legMiles: 12 }], vehicleRange: 328, startCharge: 100, coldWeather: false });
    const long = planRoute({ stops: [{ id: 1, legMiles: 0 }, { id: 2, legMiles: 90 }], vehicleRange: 328, startCharge: 100, coldWeather: false });
    expect(long.finalCharge).toBeLessThan(short.finalCharge);
  });

  it("leaves less battery when the day starts below a full pack", () => {
    const shortStops = [
      { id: 1, legMiles: 0 },
      { id: 2, legMiles: 40 },
      { id: 3, legMiles: 25 },
    ];
    const full = planRoute({ stops: shortStops, vehicleRange: 320, startCharge: 100, coldWeather: false });
    const eighty = planRoute({ stops: shortStops, vehicleRange: 320, startCharge: 80, coldWeather: false });
    expect(full.chargeStopsNeeded).toBe(0);
    expect(eighty.chargeStopsNeeded).toBe(0);
    expect(eighty.finalCharge).toBeLessThan(full.finalCharge);
    expect(full.finalCharge - eighty.finalCharge).toBeGreaterThanOrEqual(18);
    expect(eighty.stopStates[0].chargePct).toBe(80);
    expect(full.stopStates[0].chargePct).toBe(100);
  });
});

describe("featured workday profiles", () => {
  it("includes the three required starting trades", () => {
    const featured = MAJOR_TRADES.filter((trade) => trade.featured).map((trade) => trade.name);
    expect(featured).toEqual(expect.arrayContaining([
      "Electrical",
      "Pool Service",
      "Landscaping / Lawn",
    ]));
    expect(featured.length).toBeGreaterThanOrEqual(3);
  });
});

describe("major trade buckets", () => {
  it("exposes at most 10 majors including type-your-trade and keeps the long list out of the UI set", () => {
    expect(MAJOR_TRADES.length).toBeGreaterThanOrEqual(8);
    expect(MAJOR_TRADES.length).toBeLessThanOrEqual(10);
    expect(MAJOR_TRADES.map((trade) => trade.name)).toEqual([
      "Electrical",
      "Plumbing",
      "HVAC",
      "Pool Service",
      "Landscaping / Lawn",
      "Pest Control",
      "Property Maintenance / Handyman",
      "Construction / Remodel",
      "Type your trade",
    ]);
    expect(MAJOR_TRADES.some((trade) => trade.name === "Locksmith")).toBe(false);
    expect(TRADES.length).toBeGreaterThanOrEqual(80);
    expect(TRADES.some((trade) => trade.name === "Locksmith")).toBe(true);
    expect(TRADES.some((trade) => trade.name === "Electrician")).toBe(true);
    expect(MAJOR_TRADES.find((trade) => trade.id === "electrical").libraryTradeName).toBe("Electrician");
    expect(MAJOR_TRADES.find((trade) => trade.id === "landscaping").libraryTradeName).toBe("Battery-Powered Lawn / Landscaping");
  });

  it("keeps typed trades on the generic kit with no assumed convertibility score", () => {
    const electrician = resolveTradeProfile("Type your trade", "electrician");
    expect(electrician.kitKey).toBe("other");
    expect(electrician.categoryLabel).toBe("electrician");
    expect(electrician.equipmentOptions.map((item) => item.id)).toEqual(GENERIC_FIELD_SERVICE_KIT.map((item) => item.id));
    expect(electrician.equipmentOptions.some((item) => item.id === "wire-spools")).toBe(false);
    expect(electrician.score).toBeNull();
    expect(electrician.hasConvertibilityScore).toBe(false);
    expect(electrician.scoreFromLibrary).toBe(false);
    expect(electrician.libraryMatchName).toBeNull();

    const locksmith = resolveTradeProfile("Other", "locksmith");
    expect(locksmith.kitKey).toBe("other");
    expect(locksmith.score).toBeNull();
    expect(locksmith.hasConvertibilityScore).toBe(false);
    expect(locksmith.categoryLabel).toBe("locksmith");
    expect(locksmith.equipmentOptions.map((item) => item.id)).toEqual(GENERIC_FIELD_SERVICE_KIT.map((item) => item.id));

    const unknown = resolveTradeProfile("Type your trade", "mobile dog grooming");
    expect(unknown.kitKey).toBe("other");
    expect(unknown.score).toBeNull();
    expect(unknown.categoryLabel).toBe("mobile dog grooming");
    expect(unknown.libraryMatchName).toBeNull();
    expect(tradeShowsBedAccessories("Type your trade")).toBe(true);
    expect(tradeShowsBedAccessories("Electrical")).toBe(true);
    expect(tradeShowsBedAccessories("Landscaping / Lawn")).toBe(false);
  });
});

describe("vehicle model years and EPA energy", () => {
  const byId = (id) => VEHICLE_OPTIONS.find((vehicle) => vehicle.id === id);

  it("records FACT first-available years so impossible MYs cannot be selected", () => {
    expect(byId("r1t").firstAvailableYear).toBe(2022);
    expect(byId("lightning").firstAvailableYear).toBe(2022);
    expect(byId("silveradoev").firstAvailableYear).toBe(2024);
    expect(byId("sierraev").firstAvailableYear).toBe(2024);
    expect(byId("hummerev").firstAvailableYear).toBe(2022);
    const silveradoYears = vehicleYearOptions(byId("silveradoev"));
    expect(silveradoYears[0]).toBe(2024);
    expect(silveradoYears).not.toContain(2023);
    expect(vehicleYearOptions(byId("r1t"))).toContain(2022);
    expect(vehicleYearOptions(byId("r1t"))).toContain(2023);
  });

  it("clamps a leftover year to the first year that truck was actually sold", () => {
    expect(clampVehicleYear(2023, byId("silveradoev"))).toBe(2024);
    expect(clampVehicleYear(2023, byId("sierraev"))).toBe(2024);
    expect(clampVehicleYear(2025, byId("silveradoev"))).toBe(2025);
    expect(clampVehicleYear(2022, byId("r1t"))).toBe(2022);
  });

  it("stores distinct EPA kWh/100 mi so savings can move when the truck changes", () => {
    expect(byId("r1t").kwhPer100Miles).toBe(48);
    expect(byId("lightning").kwhPer100Miles).toBe(48);
    expect(byId("silveradoev").kwhPer100Miles).toBe(51);
    expect(byId("sierraev").kwhPer100Miles).toBe(52);
    expect(byId("hummerev").kwhPer100Miles).toBe(64);
  });
});

function optionIds(tradeName) {
  return equipmentOptionsForTrade(tradeName).map((item) => item.id);
}

describe("trade-scoped equipment kits", () => {
  it("gives each featured trade a distinct kit and default selection", () => {
    const electrician = optionIds("Electrician");
    const pool = optionIds("Pool Service");
    const lawn = optionIds("Battery-Powered Lawn / Landscaping");

    expect(electrician).toEqual(expect.arrayContaining([
      "step-ladder-10",
      "extension-ladder",
      "extension-ladder-24",
      "crew-ladder-set",
      "wire-spools",
      "conduit-sticks",
      "hand-tool-chargers",
    ]));
    expect(pool).toEqual(expect.arrayContaining([
      "telescoping-pole",
      "vacuum-head-hose",
      "leaf-nets-brushes",
      "chemical-day-load",
      "salt-bags",
      "test-kit",
    ]));
    expect(lawn).toEqual(expect.arrayContaining([
      "battery-mower",
      "lawn-pack-chargers",
      "ope-hand-chargers",
      "extra-battery-packs",
      "handheld-ope-kit",
      "crew-trailer",
    ]));

    expect(electrician.filter((id) => !id.startsWith("misc-")).some((id) => pool.includes(id) && lawn.includes(id))).toBe(false);

    for (const name of ["Electrical", "Electrician", "Pool Service", "Landscaping / Lawn", "HVAC", "Plumbing", "Pest Control", "Construction / Remodel", "Locksmith"]) {
      expect(equipmentOptionsForTrade(name).length).toBeGreaterThanOrEqual(12);
      expect(equipmentOptionsForTrade(name).length).toBeLessThanOrEqual(18);
      const selectable = selectableEquipmentForTrade(name);
      expect(selectable.map((item) => item.id)).toEqual(expect.arrayContaining(["misc-300", "misc-500"]));
      expect(selectable.length).toBe(equipmentOptionsForTrade(name).length + MISC_PAYLOAD_OPTIONS.length);
    }
    expect(tradeDefaults("Electrical").equipmentIds).toEqual(["extension-ladder", "wire-spools", "hand-tool-chargers"]);
    expect(tradeDefaults("Electrician").equipmentIds).toEqual(["extension-ladder", "wire-spools", "hand-tool-chargers"]);
    expect(tradeDefaults("Pool Service").equipmentIds).toEqual([
      "telescoping-pole",
      "vacuum-head-hose",
      "leaf-nets-brushes",
      "chemical-day-load",
      "salt-bags",
      "test-kit",
    ]);
    expect(tradeDefaults("Landscaping / Lawn").equipmentIds).toEqual([
      "battery-mower",
      "lawn-pack-chargers",
      "ope-hand-chargers",
      "extra-battery-packs",
      "handheld-ope-kit",
      "crew-trailer",
    ]);
  });

  it("keeps defaults inside that trade's own options and never uses a cooler", () => {
    for (const trade of TRADES) {
      const allowed = new Set(trade.equipmentOptions.map((item) => item.id));
      expect(trade.equipmentOptions.length).toBeGreaterThan(0);
      expect(trade.defaults.equipmentIds.every((id) => allowed.has(id))).toBe(true);
      expect(trade.equipmentOptions.some((item) => item.id === "cooler" || /cooler|fridge/i.test(item.name))).toBe(false);
      expect(trade.defaults.equipmentIds).not.toContain("cooler");
    }
    expect(EQUIPMENT_CATALOG.some((item) => item.id === "cooler" || /cooler|fridge/i.test(item.name))).toBe(false);
    expect(EQUIPMENT_CATALOG.every((item) => (Number(item.weightLbs) || 0) > 0 || (Number(item.trailerWeightLbs) || 0) > 0)).toBe(true);
  });

  it("covers HVAC, plumbing, pest, pressure washing, and irrigation with custom kits", () => {
    expect(optionIds("HVAC")).toEqual(expect.arrayContaining(["hvac-recovery-pump", "refrigerant-jugs"]));
    expect(optionIds("Plumbing")).toEqual(expect.arrayContaining(["drain-machine", "jetter", "water-heater-parts"]));
    expect(optionIds("Pest Control")).toEqual(expect.arrayContaining(["sprayer-tank", "pest-chemical-jugs"]));
    expect(optionIds("Pressure Washing / Exterior Cleaning")).toEqual(expect.arrayContaining(["pressure-washer", "freshwater-tote"]));
    expect(optionIds("Irrigation Contractor")).toEqual(expect.arrayContaining(["irrigation-heads-valves", "irrigation-pipe"]));
  });

  it("hardcodes sourced FACT weights on the biggest payload drivers", () => {
    expect(WATER_LB_PER_GAL).toBe(8.34);
    expect(WORKING_WIRE_LB).toBe(128);
    const byId = Object.fromEntries(EQUIPMENT_CATALOG.map((item) => [item.id, item]));
    expect(byId["step-ladder-10"].weightLbs).toBe(39);
    expect(byId["extension-ladder"].weightLbs).toBe(36.5);
    expect(byId["extension-ladder-24"].weightLbs).toBe(46);
    expect(byId["crew-ladder-set"].weightLbs).toBe(134.5);
    expect(byId["wire-spools"].weightLbs).toBe(128);
    expect(byId["battery-mower"].weightLbs).toBe(62.5);
    expect(byId["extra-battery-packs"].weightLbs).toBe(62);
    expect(byId["refrigerant-jugs"].weightLbs).toBe(84);
    expect(byId["sprayer-tank"].weightLbs).toBe(227);
    expect(byId["salt-bags"].weightLbs).toBe(80);
    expect(byId["crew-trailer"].trailerWeightLbs).toBe(2990);
    expect(byId["step-ladder-6"].weightLbs).toBe(22);
    expect(byId["step-ladder-8"].weightLbs).toBe(30);
    expect(byId["misc-300"].weightLbs).toBe(300);
    expect(byId["misc-500"].weightLbs).toBe(500);
    expect(byId["misc-300"].watts).toBe(0);
    expect(byId["misc-500"].watts).toBe(0);
    expect(findTrade("Electrician").equipmentOptions.some((item) => item.id === "chemical-day-load")).toBe(false);
    expect(findTrade("Pool Service").equipmentOptions.some((item) => item.id === "wire-spools")).toBe(false);
  });

  it("uses the generic field-service kit for trades without a custom set", () => {
    const locksmith = optionIds("Locksmith");
    expect(locksmith).toEqual(GENERIC_FIELD_SERVICE_KIT.map((item) => item.id));
    expect(tradeDefaults("Locksmith").equipmentIds).toEqual(["hand-tool-chargers", "tool-bag"]);
  });
});

describe("configRange", () => {
  it("applies pack, motor, and wheel modifiers", () => {
    const vehicle = { baseRange: 300 };
    const config = {
      packs: [{ id: "large", rangeMod: 20 }],
      motors: [{ id: "dual", effMod: 0 }],
      wheels: [{ id: "at", effMod: -0.1 }],
    };
    expect(configRange(vehicle, config, { pack: "large", motor: "dual", wheel: "at" })).toBeCloseTo(320 * 0.9);
  });
});

describe("equipmentEnergyKwh", () => {
  it("converts watt-hours to kilowatt-hours", () => {
    expect(equipmentEnergyKwh([{ watts: 1000, hours: 2 }, { watts: 500, hours: 1 }])).toBeCloseTo(2.5);
  });

  it("ignores payload-only kit that has no electrical draw", () => {
    expect(equipmentEnergyKwh([{ watts: 0, hours: 0, weightLbs: 185 }])).toBe(0);
  });
});

describe("equipmentWeightLbs", () => {
  it("sums modeled kit payload and trailer weight", () => {
    const items = [
      { weightLbs: 48, trailerWeightLbs: 0 },
      { weightLbs: 185, trailerWeightLbs: 0 },
      { weightLbs: 40, trailerWeightLbs: 2200 },
    ];
    expect(equipmentWeightLbs(items)).toBe(273);
    expect(equipmentTrailerLbs(items)).toBe(2200);
  });
});

describe("cargoPenalty", () => {
  it("is zero with no cargo and rises toward 12% at payload rating", () => {
    expect(cargoPenalty(0, 1800)).toBe(0);
    expect(cargoPenalty(900, 1800)).toBeCloseTo(0.06);
    expect(cargoPenalty(1800, 1800)).toBeCloseTo(0.12);
    expect(cargoPenalty(3600, 1800)).toBeCloseTo(0.15);
  });
});

describe("massRangePenalty", () => {
  it("combines towing and cargo as independent multipliers", () => {
    const mass = massRangePenalty({ trailerWeight: 0, towingCapacity: 10000, payloadWeight: 900, payloadCapacity: 1800 });
    expect(mass.towingPenaltyPct).toBe(0);
    expect(mass.cargoPenaltyPct).toBeCloseTo(0.06);
    expect(mass.combinedPenaltyPct).toBeCloseTo(0.06);
    expect(effectiveRangeFromPenalties(300, mass)).toBeCloseTo(282);
  });
});

describe("workdayEnergy", () => {
  it("increases when the day has more stops or powered equipment", () => {
    const base = workdayEnergy({ dailyMiles: 60, stops: 4, trailerWeight: 0, towingCapacity: 10000, equipmentItems: [] });
    const moreStops = workdayEnergy({ dailyMiles: 60, stops: 12, trailerWeight: 0, towingCapacity: 10000, equipmentItems: [] });
    const withTools = workdayEnergy({
      dailyMiles: 60,
      stops: 4,
      trailerWeight: 0,
      towingCapacity: 10000,
      equipmentItems: [{ watts: 1800, hours: 3 }],
    });
    expect(moreStops.totalKwh).toBeGreaterThan(base.totalKwh);
    expect(withTools.equipmentKwh).toBeGreaterThan(0);
    expect(withTools.totalKwh).toBeGreaterThan(base.totalKwh);
  });

  it("uses the selected truck's kWh per 100 miles for driving energy", () => {
    const r1t = workdayEnergy({ dailyMiles: 100, stops: 0, trailerWeight: 0, towingCapacity: 10000, evKwhPer100Miles: 48 });
    const hummer = workdayEnergy({ dailyMiles: 100, stops: 0, trailerWeight: 0, towingCapacity: 10000, evKwhPer100Miles: 64 });
    expect(hummer.drivingKwh).toBeGreaterThan(r1t.drivingKwh);
  });

  it("raises driving energy from kit mass without treating weight as watt-hours", () => {
    const empty = workdayEnergy({
      dailyMiles: 60,
      stops: 0,
      trailerWeight: 0,
      towingCapacity: 10000,
      payloadWeight: 0,
      payloadCapacity: 1800,
      equipmentItems: [],
    });
    const heavy = workdayEnergy({
      dailyMiles: 60,
      stops: 0,
      trailerWeight: 0,
      towingCapacity: 10000,
      payloadWeight: 0,
      payloadCapacity: 1800,
      equipmentItems: [{ watts: 0, hours: 0, weightLbs: 900 }],
    });
    expect(heavy.equipmentKwh).toBe(0);
    expect(heavy.cargoPenaltyPct).toBeGreaterThan(empty.cargoPenaltyPct);
    expect(heavy.drivingKwh).toBeGreaterThan(empty.drivingKwh);
  });
});

const electricianDay = {
  dailyMiles: 58,
  stops: 6,
  trailerWeight: 0,
  towingCapacity: 11000,
  payloadWeight: 800,
  payloadCapacity: 1764,
  charging: chargingOption("home"),
  equipmentItems: equipmentItemsFromIds(["extension-ladder", "wire-spools", "hand-tool-chargers"]),
  categoryScore: 93,
  categoryLabel: "Electrician",
  vehicleName: "Rivian R1T",
  packLabel: "Large Pack",
  motorLabel: "Dual Motor",
  wheelLabel: '21" Road',
};

describe("workdayAssessment", () => {
  it("rates a typical electrician day on a long-range truck as a good fit", () => {
    const result = workdayAssessment({ ...electricianDay, configRange: 328 });
    expect(result.rating).toBe("good");
    expect(result.energy.equipmentKwh).toBeGreaterThan(0);
    expect(result.payload.kitWeightLbs).toBeGreaterThan(0);
    expect(result.payload.weight).toBeGreaterThan(800);
    expect(result.reserve.pct).toBeGreaterThan(20);
    expect(result.assumptions.length).toBeGreaterThan(3);
    expect(result.summary.toLowerCase()).toContain("finish");
  });

  it("improves reserve when daytime charging is available", () => {
    const overnight = workdayAssessment({ ...electricianDay, configRange: 250, charging: chargingOption("home") });
    const plusDaytime = workdayAssessment({ ...electricianDay, configRange: 250, charging: chargingOption("home-daytime") });
    expect(plusDaytime.reserve.pct).toBeGreaterThan(overnight.reserve.pct);
  });

  it("marks an overloaded, uncharged day as not a good fit", () => {
    const result = workdayAssessment({
      ...electricianDay,
      configRange: 200,
      dailyMiles: 220,
      stops: 14,
      trailerWeight: 12000,
      towingCapacity: 7500,
      payloadWeight: 2500,
      payloadCapacity: 1300,
      charging: chargingOption("none"),
    });
    expect(result.rating).toBe("not-a-fit");
    expect(result.notAFitReasons.length).toBeGreaterThan(0);
    expect(result.towing.over).toBe(true);
    expect(result.payload.over).toBe(true);
  });

  it("updates energy when stops change", () => {
    const few = workdayAssessment({ ...electricianDay, configRange: 328, stops: 2 });
    const many = workdayAssessment({ ...electricianDay, configRange: 328, stops: 18 });
    expect(many.energy.totalKwh).toBeGreaterThan(few.energy.totalKwh);
    expect(many.reserve.pct).toBeLessThan(few.reserve.pct);
  });

  it("recalculates reserve and fit when Map My Day mileage changes", () => {
    const short = workdayAssessment({ ...electricianDay, configRange: 328, dailyMiles: 12 });
    const long = workdayAssessment({ ...electricianDay, configRange: 328, dailyMiles: 210 });
    expect(long.energy.drivingKwh).toBeGreaterThan(short.energy.drivingKwh);
    expect(long.reserve.pct).toBeLessThan(short.reserve.pct);
    expect(long.fitScore).toBeLessThan(short.fitScore);
  });

  it("drops remaining battery and fit when starting charge is 80 instead of 100", () => {
    const full = workdayAssessment({ ...electricianDay, configRange: 328, charging: chargingOption("home") });
    const eighty = workdayAssessment({
      ...electricianDay,
      configRange: 328,
      charging: { ...chargingOption("home"), startChargePct: 80 },
    });
    expect(full.chargingNeeds).toBeTruthy();
    expect(eighty.reserve.pct).toBeLessThan(full.reserve.pct);
    expect(full.reserve.pct - eighty.reserve.pct).toBeGreaterThanOrEqual(18);
    expect(eighty.availableKwh).toBeCloseTo(full.availableKwh * 0.8, 0);
    expect(eighty.fitScore).toBeLessThanOrEqual(full.fitScore);
  });

  it("adds selected kit trailer weight to the modeled tow load", () => {
    const result = workdayAssessment({
      ...electricianDay,
      configRange: 328,
      trailerWeight: 0,
      equipmentItems: equipmentItemsFromIds(["crew-trailer"]),
    });
    expect(result.towing.weight).toBe(2990);
    expect(result.towing.kitTrailerLbs).toBe(2990);
    expect(result.energy.towingPenaltyPct).toBeGreaterThan(0);
  });

  it("does not auto-DQ on bed capacity once kit/bed cargo moves to an overflow trailer", () => {
    const heavyItems = equipmentItemsFromIds(["wire-spools", "crew-ladder-set", "misc-500"]);
    const drawers = { id: "bed-drawers", name: "Bed drawers", watts: 0, hours: 0, weightLbs: DECKED_DRAWER_WEIGHT_LB };
    const equipmentItems = [...heavyItems, drawers];
    const cargo = equipmentItems.reduce((sum, item) => sum + item.weightLbs, 0);
    const bedOnly = workdayAssessment({
      ...electricianDay,
      configRange: 328,
      payloadWeight: 900,
      payloadCapacity: 1200,
      towingCapacity: 10000,
      trailerWeight: 0,
      equipmentItems,
    });
    expect(bedOnly.payload.weight).toBeGreaterThan(1200);
    expect(bedOnly.payload.over).toBe(true);
    expect(bedOnly.towing.over).toBe(false);
    expect(bedOnly.rating).toBe("not-a-fit");
    expect(bedOnly.notAFitReasons.join(" ")).toMatch(/tow-a-trailer|payload/i);

    const withTrailer = workdayAssessment({
      ...electricianDay,
      configRange: 328,
      payloadWeight: 900,
      payloadCapacity: 1200,
      towingCapacity: 10000,
      trailerWeight: 0,
      equipmentItems,
      overflowTrailerId: "open-16",
    });
    expect(withTrailer.payload.weight).toBe(900);
    expect(withTrailer.payload.over).toBe(false);
    expect(withTrailer.payload.movedCargoLbs).toBe(Math.round(cargo));
    expect(withTrailer.towing.weight).toBe(OVERFLOW_TRAILER_16_OPEN_LB + cargo);
    expect(withTrailer.towing.over).toBe(false);
    expect(withTrailer.rating).not.toBe("not-a-fit");
    expect(["good", "conditional"]).toContain(withTrailer.rating);
    expect(withTrailer.fitScore).toBeGreaterThan(bedOnly.fitScore);
    expect(withTrailer.notAFitReasons.join(" ")).not.toMatch(/payload is over/i);
  });

  it("still DQs leftover bed payload and overflow towing that exceeds ratings", () => {
    const equipmentItems = equipmentItemsFromIds(["misc-500", "wire-spools"]);
    const leftoverOver = workdayAssessment({
      ...electricianDay,
      configRange: 328,
      payloadWeight: 1400,
      payloadCapacity: 1200,
      towingCapacity: 10000,
      equipmentItems,
      overflowTrailerId: "open-16",
    });
    expect(leftoverOver.payload.over).toBe(true);
    expect(leftoverOver.rating).toBe("not-a-fit");
    expect(leftoverOver.notAFitReasons.join(" ")).toMatch(/leftover bed payload/i);

    const towOver = workdayAssessment({
      ...electricianDay,
      configRange: 328,
      payloadWeight: 400,
      payloadCapacity: 1800,
      towingCapacity: 2200,
      trailerWeight: 0,
      equipmentItems,
      overflowTrailerId: "open-16",
    });
    expect(towOver.towing.weight).toBeGreaterThan(2200);
    expect(towOver.towing.over).toBe(true);
    expect(towOver.payload.over).toBe(false);
    expect(towOver.rating).toBe("not-a-fit");
    expect(towOver.notAFitReasons.join(" ")).toMatch(/empty curb weight plus moved/i);
  });

  it("allocates kit/bed cargo onto the selected overflow trailer empty weight", () => {
    const items = [{ id: "misc-500", weightLbs: 500 }, { id: "bed-drawers", weightLbs: 220 }];
    const none = allocateWorkdayLoad({ payloadWeight: 800, trailerWeight: 200, equipmentItems: items, overflowTrailerId: "none" });
    expect(none.bedPayloadLbs).toBe(1520);
    expect(none.trailerLbs).toBe(200);
    expect(none.movedCargoLbs).toBe(0);

    const moved = allocateWorkdayLoad({ payloadWeight: 800, trailerWeight: 200, equipmentItems: items, overflowTrailerId: "enclosed-12" });
    expect(moved.bedPayloadLbs).toBe(800);
    expect(moved.movedCargoLbs).toBe(720);
    expect(moved.trailerLbs).toBe(200 + 1560 + 720);
    expect(OVERFLOW_TRAILER_OPTIONS.map((item) => item.id)).toEqual(["none", "open-16", "enclosed-12", "enclosed-10"]);
  });

  it("reduces effective range when a heavier kit is selected and recovers when it is removed", () => {
    const empty = workdayAssessment({ ...electricianDay, configRange: 328, equipmentItems: [] });
    const withWire = workdayAssessment({
      ...electricianDay,
      configRange: 328,
      equipmentItems: equipmentItemsFromIds(["wire-spools"]),
    });
    const withWireAndLadders = workdayAssessment({
      ...electricianDay,
      configRange: 328,
      equipmentItems: equipmentItemsFromIds(["wire-spools", "crew-ladder-set", "extension-ladder"]),
    });
    expect(empty.effectiveRange).toBeGreaterThan(withWire.effectiveRange);
    expect(withWire.effectiveRange).toBeGreaterThan(withWireAndLadders.effectiveRange);
    expect(withWireAndLadders.energy.cargoPenaltyPct).toBeGreaterThan(withWire.energy.cargoPenaltyPct);
    expect(withWire.fitScore).toBeGreaterThan(withWireAndLadders.fitScore);
    expect(empty.energy.equipmentKwh).toBe(0);
    expect(withWire.energy.equipmentKwh).toBe(0);
  });

  it("derates range from miscellaneous payload without adding watt-hours", () => {
    const empty = workdayAssessment({ ...electricianDay, configRange: 328, equipmentItems: [] });
    const misc300 = workdayAssessment({
      ...electricianDay,
      configRange: 328,
      equipmentItems: equipmentItemsFromIds(["misc-300"]),
    });
    const misc500 = workdayAssessment({
      ...electricianDay,
      configRange: 328,
      equipmentItems: equipmentItemsFromIds(["misc-500"]),
    });
    expect(misc300.energy.equipmentKwh).toBe(0);
    expect(misc500.energy.equipmentKwh).toBe(0);
    expect(misc300.payload.kitWeightLbs).toBe(300);
    expect(misc500.payload.kitWeightLbs).toBe(500);
    expect(empty.effectiveRange).toBeGreaterThan(misc300.effectiveRange);
    expect(misc300.effectiveRange).toBeGreaterThan(misc500.effectiveRange);
    expect(misc500.energy.cargoPenaltyPct).toBeGreaterThan(misc300.energy.cargoPenaltyPct);
  });

  it("models unknown charging conservatively — mid start, no overnight", () => {
    const unknown = chargingOption("unknown");
    expect(unknown.isUnknown).toBe(true);
    expect(unknown.hasOvernight).toBe(false);
    expect(unknown.hasDaytime).toBe(false);
    expect(unknown.startChargePct).toBe(70);
    expect(CHARGING_OPTIONS.some((option) => option.id === "unknown")).toBe(true);

    const home = workdayAssessment({ ...electricianDay, configRange: 328, charging: chargingOption("home") });
    const unknownDay = workdayAssessment({ ...electricianDay, configRange: 328, charging: unknown });
    const none = workdayAssessment({ ...electricianDay, configRange: 328, charging: chargingOption("none") });
    expect(unknownDay.rating).not.toBe("good");
    expect(unknownDay.flags.needsOvernightCharging).toBe(true);
    expect(unknownDay.reserve.pct).toBeLessThan(home.reserve.pct);
    expect(unknownDay.reserve.pct).toBeGreaterThan(none.reserve.pct);
    expect(unknownDay.chargingNeeds.toLowerCase()).toContain("unknown");
    expect(unknownDay.chargingNeeds.toLowerCase()).toContain("70%");
  });

  it("adds bed-drawer weight to the cargo derate and keeps drawers watt-hour free", () => {
    const drawers = bedAccessoryOption("drawers");
    expect(drawers.weightLbs).toBe(DECKED_DRAWER_WEIGHT_LB);
    expect(drawers.priceEstUsd).toBe(DECKED_DRAWER_PRICE_USD);
    const empty = workdayAssessment({ ...electricianDay, configRange: 328, equipmentItems: [] });
    const withDrawers = workdayAssessment({
      ...electricianDay,
      configRange: 328,
      equipmentItems: [{ id: "bed-drawers", name: drawers.name, watts: 0, hours: 0, weightLbs: drawers.weightLbs }],
    });
    expect(withDrawers.energy.equipmentKwh).toBe(0);
    expect(withDrawers.payload.kitWeightLbs).toBe(DECKED_DRAWER_WEIGHT_LB);
    expect(empty.effectiveRange).toBeGreaterThan(withDrawers.effectiveRange);
    expect(withDrawers.fitDocks.docks.some((dock) => dock.id === "bed-weight" && dock.points === 1)).toBe(true);
    expect(withDrawers.fitScore).toBeLessThan(empty.fitScore);
    expect(empty.fitScore).toBe(empty.fitScoreBase - empty.fitDocks.total);
    expect(withDrawers.fitScore).toBe(withDrawers.fitScoreBase - withDrawers.fitDocks.total);
  });

  it("docks 5 for payload exceed and range miss and exposes those reasons", () => {
    const result = workdayAssessment({
      ...electricianDay,
      configRange: 200,
      dailyMiles: 220,
      stops: 14,
      trailerWeight: 12000,
      towingCapacity: 7500,
      payloadWeight: 2500,
      payloadCapacity: 1300,
      charging: chargingOption("none"),
      equipmentItems: [{ id: "bed-drawers", name: "Bed drawers", watts: 0, hours: 0, weightLbs: DECKED_DRAWER_WEIGHT_LB }],
    });
    expect(result.rating).toBe("not-a-fit");
    const dockIds = result.fitDocks.docks.map((dock) => dock.id);
    expect(dockIds).toEqual(expect.arrayContaining(["bed-weight", "payload-exceed", "tow-exceed", "range-miss"]));
    expect(result.fitDocks.docks.find((dock) => dock.id === "payload-exceed").points).toBe(5);
    expect(result.fitDocks.docks.find((dock) => dock.id === "range-miss").points).toBe(5);
    expect(result.fitDocks.docks.find((dock) => dock.id === "tow-exceed").points).toBe(5);
    expect(result.whyReasons.length).toBeGreaterThan(0);
    expect(result.whyReasons.join(" ")).toMatch(/payload|towing|energy/i);
  });

  it("docks 1 when the selected pack or wheels lose range versus the recommended build", () => {
    const recommended = workdayAssessment({ ...electricianDay, configRange: 328, recommendedRange: 328 });
    const worseWheels = workdayAssessment({ ...electricianDay, configRange: 328 * 0.88, recommendedRange: 328 });
    expect(worseWheels.fitDocks.docks.some((dock) => dock.id === "config-range" && dock.points === 1)).toBe(true);
    expect(worseWheels.fitScore).toBeLessThan(recommended.fitScore);
  });
});

describe("bed accessories", () => {
  it("is offered for van-to-pickup field-service trades and hidden for pool/lawn crews", () => {
    expect(tradeShowsBedAccessories("Electrical")).toBe(true);
    expect(tradeShowsBedAccessories("Electrician")).toBe(true);
    expect(tradeShowsBedAccessories("Plumbing")).toBe(true);
    expect(tradeShowsBedAccessories("HVAC")).toBe(true);
    expect(tradeShowsBedAccessories("Locksmith")).toBe(true);
    expect(tradeShowsBedAccessories("Pest Control")).toBe(true);
    expect(tradeShowsBedAccessories("Low-Voltage / Data Cabling Contractor")).toBe(true);
    expect(tradeShowsBedAccessories("Pool Service")).toBe(false);
    expect(tradeShowsBedAccessories("Battery-Powered Lawn / Landscaping")).toBe(false);
    expect(BED_ACCESSORY_OPTIONS.map((item) => item.id)).toEqual([
      "drawers",
      "totes",
      "tonneau",
      "tonneau-hard",
      "ladder-rack",
      "headache-rack",
      "toolbox",
      "bed-liner",
      "cargo-net",
    ]);
    expect(BED_ACCESSORY_OPTIONS.length).toBeGreaterThanOrEqual(8);
    expect(bedAccessoryOption("none").weightLbs).toBe(0);
    expect(bedAccessoryOption("none").priceEstUsd).toBe(0);
    expect(bedAccessoriesWeightLbs([])).toBe(0);
    expect(bedAccessoriesPriceUsd([])).toBe(0);
    expect(bedAccessoriesWeightLbs(["totes", "tonneau"])).toBe(STERILITE_27_TOTE_LB * STERILITE_27_TOTE_QTY + EXTANG_TONNEAU_LB);
    expect(bedAccessoriesPriceUsd(["totes", "tonneau"])).toBe(TOTE_4PACK_PRICE_USD + EXTANG_TONNEAU_PRICE_USD);
    expect(bedAccessoriesWeightLbs(["drawers", "tonneau", "ladder-rack"])).toBe(
      DECKED_DRAWER_WEIGHT_LB + EXTANG_TONNEAU_LB + WG_LADDER_RACK_LB,
    );
    expect(bedAccessoriesPriceUsd(["drawers", "ladder-rack"])).toBe(DECKED_DRAWER_PRICE_USD + WG_LADDER_RACK_PRICE_USD);
    expect(toggleBedAccessoryId(["tonneau"], "tonneau-hard")).toEqual(["tonneau-hard"]);
    expect(toggleBedAccessoryId(["drawers", "tonneau"], "ladder-rack")).toEqual(["drawers", "tonneau", "ladder-rack"]);
  });
});

describe("compareWorkdayVehicles", () => {
  it("ranks multiple trucks against the same workday", () => {
    const rows = compareWorkdayVehicles({
      vehicles: VEHICLE_OPTIONS,
      configs: VEHICLE_CONFIGS,
      workdayInputs: {
        dailyMiles: 58,
        stops: 6,
        trailerWeight: 0,
        payloadWeight: 800,
        charging: chargingOption("home"),
        equipmentItems: equipmentItemsFromIds(["hand-tool-chargers"]),
        categoryScore: 93,
        categoryLabel: "Electrician",
      },
    });
    expect(rows.length).toBe(VEHICLE_OPTIONS.length);
    expect(rows[0].assessment.fitScore).toBeGreaterThanOrEqual(rows[rows.length - 1].assessment.fitScore);
    expect(CHARGING_OPTIONS.length).toBeGreaterThanOrEqual(3);
  });

  it("scores Silverado EV high and Rivian ~60-class for a landscaping crew day", () => {
    const trade = MAJOR_TRADES.find((item) => item.id === "landscaping");
    const equipmentItems = equipmentItemsFromIds(
      trade.defaults.equipmentIds,
      selectableEquipmentForTrade(trade.name),
    );
    const rows = compareWorkdayVehicles({
      vehicles: VEHICLE_OPTIONS,
      configs: VEHICLE_CONFIGS,
      workdayInputs: {
        dailyMiles: trade.defaults.dailyMiles,
        stops: trade.defaults.stops,
        trailerWeight: trade.defaults.trailerWeight,
        payloadWeight: trade.defaults.payloadWeight,
        charging: chargingOption("home"),
        equipmentItems,
        categoryScore: trade.score,
        categoryLabel: trade.name,
        tradeId: "landscaping",
      },
    });
    const rivian = rows.find((row) => row.vehicle.id === "r1t").assessment;
    const silverado = rows.find((row) => row.vehicle.id === "silveradoev").assessment;
    expect(silverado.fitScore).toBeGreaterThanOrEqual(80);
    expect(rivian.fitScore).toBeGreaterThanOrEqual(50);
    expect(rivian.fitScore).toBeLessThan(70);
    expect(silverado.fitScore).toBeGreaterThan(rivian.fitScore + 10);
  });

  it("applies the same live docks to every truck when bed weight is added", () => {
    const baseInputs = {
      dailyMiles: 58,
      stops: 6,
      trailerWeight: 0,
      payloadWeight: 800,
      charging: chargingOption("home"),
      equipmentItems: equipmentItemsFromIds(["hand-tool-chargers"]),
      categoryScore: 93,
      categoryLabel: "Electrician",
    };
    const withBed = {
      ...baseInputs,
      equipmentItems: [
        ...baseInputs.equipmentItems,
        { id: "bed-drawers", name: "Bed drawers", watts: 0, hours: 0, weightLbs: DECKED_DRAWER_WEIGHT_LB },
      ],
    };
    const empty = compareWorkdayVehicles({ vehicles: VEHICLE_OPTIONS, configs: VEHICLE_CONFIGS, workdayInputs: baseInputs });
    const loaded = compareWorkdayVehicles({ vehicles: VEHICLE_OPTIONS, configs: VEHICLE_CONFIGS, workdayInputs: withBed });
    for (const vehicle of VEHICLE_OPTIONS) {
      const before = empty.find((row) => row.vehicle.id === vehicle.id).assessment;
      const after = loaded.find((row) => row.vehicle.id === vehicle.id).assessment;
      expect(after.fitScore).toBeLessThan(before.fitScore);
      expect(after.fitDocks.docks.some((dock) => dock.id === "bed-weight" && dock.points === 1)).toBe(true);
    }
  });
});

describe("play day recreational catalogs", () => {
  it("feeds towable empty weight into the tow check without using work overflow trailers", () => {
    const fishing = playTowableById(defaultPlayTowableId("Boating / Fishing"));
    const pontoon = playTowableById("pontoon-22");
    expect(fishing.emptyWeightLbs).toBe(PLAY_TOWABLE_FISHING_16_LB);
    expect(pontoon.emptyWeightLbs).toBe(PLAY_TOWABLE_PONTOON_22_LB);
    expect(PLAY_TOWABLE_OPTIONS.map((item) => item.id)).toEqual(expect.arrayContaining([
      "none", "fishing-16", "pontoon-22", "ski-wake-21", "travel-18", "atv-utility",
    ]));
    expect(PLAY_TOWABLE_OPTIONS.some((item) => /16-ft open|enclosed/.test(item.label))).toBe(false);

    const gear = playGearItemsFromIds(defaultPlayGearIds("Boating / Fishing"), "Boating / Fishing");
    const empty = workdayAssessment({
      ...electricianDay,
      configRange: 328,
      trailerWeight: 0,
      equipmentItems: [],
      overflowTrailerId: "none",
    });
    const withBoat = workdayAssessment({
      ...electricianDay,
      configRange: 328,
      trailerWeight: fishing.emptyWeightLbs,
      equipmentItems: gear,
      overflowTrailerId: "none",
    });
    const withPontoon = workdayAssessment({
      ...electricianDay,
      configRange: 328,
      trailerWeight: pontoon.emptyWeightLbs,
      equipmentItems: gear,
      overflowTrailerId: "none",
    });
    expect(withBoat.towing.weight).toBe(PLAY_TOWABLE_FISHING_16_LB);
    expect(withPontoon.towing.weight).toBe(PLAY_TOWABLE_PONTOON_22_LB);
    expect(withPontoon.effectiveRange).toBeLessThan(withBoat.effectiveRange);
    expect(withBoat.effectiveRange).toBeLessThan(empty.effectiveRange);
    expect(withBoat.overflow.selected).toBe(false);
  });

  it("swaps activity gear loadouts and derates range from bikes, kayaks, and camping", () => {
    const bikes = playGearItemsFromIds(defaultPlayGearIds("Mountain Biking"), "Mountain Biking");
    const kayaks = playGearItemsFromIds(defaultPlayGearIds("Kayaking / Canoeing"), "Kayaking / Canoeing");
    const camping = playGearItemsFromIds(defaultPlayGearIds("Camping"), "Camping");
    expect(bikes.some((item) => /bikes/i.test(item.name))).toBe(true);
    expect(kayaks.some((item) => /kayak/i.test(item.name))).toBe(true);
    expect(camping.some((item) => /tent/i.test(item.name))).toBe(true);
    expect([...bikes, ...kayaks, ...camping].some((item) => /Type IA|wire-spools|crew-trailer/i.test(item.id + item.name))).toBe(false);

    const empty = workdayAssessment({ ...electricianDay, configRange: 328, equipmentItems: [] });
    const withBikes = workdayAssessment({ ...electricianDay, configRange: 328, equipmentItems: bikes });
    expect(withBikes.effectiveRange).toBeLessThan(empty.effectiveRange);
    expect(withBikes.payload.kitWeightLbs).toBeGreaterThan(100);
  });
});

describe("findTruckFits", () => {
  it("keeps the original elimination rules and uses live fit scores", () => {
    const rows = findTruckFits({
      vehicles: VEHICLE_OPTIONS,
      configs: VEHICLE_CONFIGS,
      trailerWeight: 12000,
      payloadWeight: 1800,
      radius: 60,
      startCharge: 100,
      categoryScore: 93,
      categoryLabel: "Electrician",
    });
    const hummer = rows.find((row) => row.id === "hummerev");
    expect(hummer.eliminated).toBe(true);
    expect(hummer.reasons.join(" ")).toMatch(/towing|payload/i);
    expect(hummer.fitScore).toBe(hummer.assessment.fitScore);
    expect(hummer.assessment.fitDocks.docks.some((dock) => dock.points === 5)).toBe(true);
  });
});

describe("analyzeFleetVehicle", () => {
  it("selects the strongest capability match and keeps costs finite", () => {
    const result = analyzeFleetVehicle(
      { id: 1, fuelType: "diesel", mpg: 0, annualMiles: 18000, trailerWeight: 7000, homeCharging: true },
      [
        { id: "light", baseRange: 300, towing: 5000, payload: 1200, price: 40000 },
        { id: "tow", baseRange: 320, towing: 11000, payload: 1800, price: 50000 },
      ],
      4.05,
      3.35,
      0.15,
    );
    expect(result.recommended.id).toBe("tow");
    expect(Number.isFinite(result.annualSavings)).toBe(true);
  });
});
