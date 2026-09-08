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
