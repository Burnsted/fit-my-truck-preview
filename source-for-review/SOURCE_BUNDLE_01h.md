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


