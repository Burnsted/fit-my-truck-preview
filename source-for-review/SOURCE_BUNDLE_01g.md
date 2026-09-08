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
