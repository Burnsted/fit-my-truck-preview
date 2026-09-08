      label: load.overflowTrailer?.label ?? "None",
      emptyWeightLbs: Math.round(load.overflowEmptyLbs),
      movedCargoLbs: Math.round(load.movedCargoLbs),
    },
    concerns,
    chargingNeeds,
    notAFitReasons,
    whyReasons,
    watchouts,
    flags: {
      needsLargerPack: !energyShort && reservePct < RESERVE_TARGET_PCT,
      needsOvernightCharging: !hasOvernight,
      energyShort,
      payloadOver,
      towOver,
    },
    recommendedConfig: recommendedBits[0] ?? null,
    fitScore,
    fitScoreBase: live.base,
    fitDocks: { docks: live.docks, total: live.total },
    assumptions: workdayAssumptions(),
  };
}

export function compareWorkdayVehicles({ vehicles, configs, workdayInputs }) {
  return (vehicles ?? []).map((vehicle) => {
    const config = configs?.[vehicle.id];
    const recommended = config?.recommended ?? {};
    const range = configRange(vehicle, config, recommended);
    const pack = config?.packs?.find((item) => item.id === recommended.pack);
    const motor = config?.motors?.find((item) => item.id === recommended.motor);
    const wheel = config?.wheels?.find((item) => item.id === recommended.wheel);
    const assessment = workdayAssessment({
      ...workdayInputs,
      configRange: range,
      towingCapacity: vehicle.towing,
      payloadCapacity: vehicle.payload,
      vehicleName: `${vehicle.make} ${vehicle.model}`,
      packLabel: pack?.label,
      motorLabel: motor?.label,
      wheelLabel: wheel?.label,
      evKwhPer100Miles: vehicle.kwhPer100Miles,
      vehicleId: vehicle.id,
      tradeId: workdayInputs?.tradeId,
    });
    return { vehicle, assessment, recommended };
  }).sort((a, b) => {
    const rank = { good: 2, conditional: 1, "not-a-fit": 0 };
    if ((rank[b.assessment.rating] ?? 0) !== (rank[a.assessment.rating] ?? 0)) {
      return (rank[b.assessment.rating] ?? 0) - (rank[a.assessment.rating] ?? 0);
    }
    return b.assessment.fitScore - a.assessment.fitScore;
  });
}

export function applySelectedVehicleFit(rows, selectedId, assessment) {
  if (!assessment || !selectedId) return rows ?? [];
  return [...(rows ?? []).map((row) => (
    row.vehicle.id === selectedId ? { ...row, assessment } : row
  ))].sort((a, b) => {
    const rank = { good: 2, conditional: 1, "not-a-fit": 0 };
    if ((rank[b.assessment.rating] ?? 0) !== (rank[a.assessment.rating] ?? 0)) {
      return (rank[b.assessment.rating] ?? 0) - (rank[a.assessment.rating] ?? 0);
    }
    return b.assessment.fitScore - a.assessment.fitScore;
  });
}

export function findTruckFits({
  vehicles,
  configs,
  trailerWeight,
  payloadWeight,
  radius,
  startCharge,
  equipmentItems = [],
  categoryScore,
  categoryLabel,
  tradeId,
  overflowTrailerId = "none",
}) {
  const tripMiles = Math.max(0, Number(radius) || 0) * 1.3;
  const start = clamp(Number(startCharge) || 0, 0, 100);
  const load = allocateWorkdayLoad({
    payloadWeight,
    trailerWeight,
    equipmentItems,
    overflowTrailerId,
  });
  const trailer = load.trailerLbs;
  const payload = load.bedPayloadLbs;

  return (vehicles ?? []).map((vehicle) => {
    const config = configs?.[vehicle.id];
    const recommended = config?.recommended ?? {};
    const range = configRange(vehicle, config, recommended);
    const assessment = workdayAssessment({
      dailyMiles: tripMiles,
      stops: 0,
      trailerWeight,
      payloadWeight,
      overflowTrailerId,
      charging: {
        startChargePct: start,
        middayKwh: 0,
        hasOvernight: start >= 95,
        hasDaytime: false,
      },
      equipmentItems,
      categoryScore,
      categoryLabel,
      vehicleName: `${vehicle.make} ${vehicle.model}`,
      vehicleId: vehicle.id,
      tradeId,
      towingCapacity: vehicle.towing,
      payloadCapacity: vehicle.payload,
      configRange: range,
      evKwhPer100Miles: vehicle.kwhPer100Miles,
    });

    const reasons = [];
    if (trailer > vehicle.towing) reasons.push(`Trailer exceeds ${vehicle.towing.toLocaleString()} lb towing limit`);
    if (payload > vehicle.payload) reasons.push(`Payload exceeds ${vehicle.payload.toLocaleString()} lb payload limit`);
    const penalty = towingPenalty(trailer, vehicle.towing);
    const realWorldRange = vehicle.baseRange * (1 - 0.17) * (1 - penalty);
    const usableRange = realWorldRange * (start / 100);
    if (tripMiles > usableRange) {
      reasons.push(`Round trip needs more range than this build delivers (${Math.round(usableRange)} mi usable at ${start}% charge)`);
    }

    return {
      ...vehicle,
      assessment,
      eliminated: reasons.length > 0,
      reasons,
      usableRange: Math.round(usableRange),
      fitScore: assessment.fitScore,
    };
  });
}

export function towingPenalty(trailerWeight, towingCapacity) {
  const trailer = Math.max(0, Number(trailerWeight) || 0);
  const capacity = Math.max(1, Number(towingCapacity) || 1);
  if (trailer === 0) return 0;
  return 0.25 + 0.3 * Math.min(trailer / capacity, 1);
}

export function capabilityFit({ effectiveRange, dailyMiles, trailerWeight, towingCapacity, payloadWeight, payloadCapacity, homeCharging, categoryScore, jobFit }) {
  const miles = Math.max(0, Number(dailyMiles) || 0);
  const trailer = Math.max(0, Number(trailerWeight) || 0);
  const towCapacity = Math.max(1, Number(towingCapacity) || 1);
  const payload = Math.max(0, Number(payloadWeight) || 0);
  const payloadCapacitySafe = Math.max(1, Number(payloadCapacity) || 1);
  const rangeScore = clamp(50 + (Math.max(0, Number(effectiveRange) || 0) - miles * 1.3) / 2, 0, 100);
  const towScore = trailer === 0 ? 100 : clamp(((towCapacity - trailer) / towCapacity) * 100, 0, 100);
  const payloadScore = payload === 0 ? 100 : clamp(((payloadCapacitySafe - payload) / payloadCapacitySafe) * 100, 0, 100);
  const chargeScore = homeCharging ? 100 : 55;
  const known = rangeScore * 0.35 + towScore * 0.2 + payloadScore * 0.15 + chargeScore * 0.1;
  const generic = categoryScore === null
    ? known / 0.8
    : known + clamp(Number(categoryScore) || 0, 0, 100) * 0.2;
  if (jobFit != null && Number.isFinite(Number(jobFit))) {
    // Job-specific vehicle affinity (e.g. landscaping prefers work-truck EVs over lifestyle trucks).
    return Math.round(generic * 0.55 + clamp(Number(jobFit), 0, 100) * 0.45);
  }
  return Math.round(generic);
}

export function fitDocks({
  payloadOver = false,
  towOver = false,
  energyShort = false,
  payloadNear = false,
  towNear = false,
  rangeTight = false,
  bedWeightLbs = 0,
  kitWeightLbs = 0,
  configRangeHit = false,
  hasOvernight = true,
  skipChargingDock = false,
} = {}) {
  const docks = [];
  const bed = Math.max(0, Number(bedWeightLbs) || 0);
  const kit = Math.max(0, Number(kitWeightLbs) || 0);
  if (bed > 0) {
    docks.push({
      id: "bed-weight",
      points: FIT_DOCK.BED_WEIGHT,
      reason: `Bed accessories add ~${Math.round(bed).toLocaleString()} lb of upfit weight.`,
    });
  }
  if (kit > 0) {
    docks.push({
      id: "kit-weight",
      points: FIT_DOCK.KIT_WEIGHT,
      reason: `Selected kit adds ~${Math.round(kit).toLocaleString()} lb of cargo.`,
    });
  }
  if (configRangeHit) {
    docks.push({
      id: "config-range",
      points: FIT_DOCK.CONFIG_RANGE,
      reason: "Pack, motor, or wheels are less efficient than this truck's recommended build.",
    });
  }
  if (payloadNear && !payloadOver) {
    docks.push({
      id: "payload-near",
      points: FIT_DOCK.PAYLOAD_NEAR,
      reason: "Payload is near this truck's rating.",
    });
  }
  if (towNear && !towOver) {
    docks.push({
      id: "tow-near",
      points: FIT_DOCK.TOW_NEAR,
      reason: "Trailer weight is near this truck's towing rating.",
    });
  }
  if (rangeTight && !energyShort) {
    docks.push({
      id: "range-tight",
      points: FIT_DOCK.RANGE_TIGHT,
      reason: "End-of-day reserve is thin for this route.",
    });
  }
  if (!hasOvernight && !skipChargingDock) {
    docks.push({
      id: "no-overnight",
      points: FIT_DOCK.NO_OVERNIGHT,
      reason: "No overnight charging — the day starts short of a full pack.",
    });
  }
  if (payloadOver) {
    docks.push({
      id: "payload-exceed",
      points: FIT_DOCK.PAYLOAD_EXCEED,
      reason: "Payload is over this truck's payload rating. A tow-a-trailer option can move kit/bed cargo off the bed.",
    });
  }
  if (towOver) {
    docks.push({
      id: "tow-exceed",
      points: FIT_DOCK.TOW_EXCEED,
      reason: "The trailer (empty plus cargo) is over this truck's towing rating.",
    });
  }
  if (energyShort) {
    docks.push({
      id: "range-miss",
      points: FIT_DOCK.RANGE_MISS,
      reason: "Estimated energy use exceeds what this battery can deliver with the charging you selected.",
    });
  }
  return {
    docks,
    total: docks.reduce((sum, dock) => sum + dock.points, 0),
  };
}

export function liveFitScore(capabilityArgs, dockArgs = {}) {
  const base = capabilityFit(capabilityArgs);
  const breakdown = fitDocks(dockArgs);
  return {
    score: Math.round(clamp(base - breakdown.total, 0, 100)),
    base,
    docks: breakdown.docks,
    total: breakdown.total,
  };
}

export function vehicleFitView(assessment, extraReasons = []) {
  const reasons = extraReasons.length > 0
    ? extraReasons
    : (assessment?.whyReasons ?? assessment?.notAFitReasons ?? []);
  return {
    score: assessment?.fitScore ?? 0,
    rating: assessment?.rating ?? "good",
    ratingLabel: assessment?.ratingLabel ?? "",
    reasons,
    docks: assessment?.fitDocks?.docks ?? [],
  };
}

export function vehicleFitMap(rows = []) {
  return Object.fromEntries((rows ?? []).map(({ vehicle, assessment }) => [
    vehicle.id,
    vehicleFitView(assessment),
  ]));
}

export function operatingCosts({ annualMiles, currentMpg, fuelPrice, evKwhPer100Miles = 48, electricityRate, evPrice, tradeIn, upfitPrice = 0 }) {
  const miles = Math.max(0, Number(annualMiles) || 0);
  const mpg = Math.max(1, Number(currentMpg) || 1);
  const currentAnnual = (miles / mpg) * Math.max(0, Number(fuelPrice) || 0) + 1300;
  const evAnnual = (miles / 100) * Math.max(0, evKwhPer100Miles) * Math.max(0, Number(electricityRate) || 0) + 400;
  const annualSavings = currentAnnual - evAnnual;
  const upfit = Math.max(0, Number(upfitPrice) || 0);
  const netUpfront = Math.max(0, (Number(evPrice) || 0) + upfit - (Number(tradeIn) || 0));
  const roundedAnnual = Math.round(annualSavings);
  const monthlySavings = Math.round(roundedAnnual / 12);
  const breakEvenMonths = annualSavings > 0 ? Math.round((Math.max(0, netUpfront) / annualSavings) * 12) : null;
  const rawScore = annualSavings <= 0 ? Math.max(10, 40 + annualSavings / 100) : Math.min(100, 55 + annualSavings / 80);
  return {
    currentAnnual: Math.round(currentAnnual),
    evAnnual: Math.round(evAnnual),
    annualSavings: roundedAnnual,
    monthlySavings,
    upfitPrice: Math.round(upfit),
    netUpfront: Math.round(netUpfront),
    breakEvenMonths,
    score: Math.round(clamp(rawScore, 0, 100)),
  };
}

export function planRoute({
  stops,
  vehicleRange,
  startCharge,
  coldWeather,
  chargeThreshold = 20,
  targetCharge = 80,
}) {
  const derate = coldWeather ? 0.35 : 0.17;
  const realWorldRange = Math.max(1, Math.round(Math.max(0, Number(vehicleRange) || 0) * (1 - derate)));
  let runningCharge = clamp(Number(startCharge) || 0, 0, 100);

  const stopStates = stops.map((stop, index) => {
    const legMiles = Math.max(0, Number(stop.legMiles) || 0);
    runningCharge -= (legMiles / realWorldRange) * 100;
    const suggestChargeStop = runningCharge < chargeThreshold && index < stops.length - 1;

    if (suggestChargeStop) {
      const chargeAdded = Math.max(0, targetCharge - runningCharge);
      const result = {
        ...stop,
        chargePct: Math.round(targetCharge),
        suggestChargeStop: true,
        chargeMinutes: Math.round(chargeAdded * 0.55),
        milesAdded: Math.round((chargeAdded / 100) * realWorldRange),
      };
      runningCharge = targetCharge;
      return result;
    }

    return {
      ...stop,
      chargePct: Math.round(runningCharge),
      suggestChargeStop: false,
    };
  });

  return {
    realWorldRange,
    stopStates,
    finalCharge: stopStates.at(-1)?.chargePct ?? Math.round(runningCharge),
    chargeStopsNeeded: stopStates.filter((stop) => stop.suggestChargeStop).length,
  };
}

export function analyzeFleetVehicle(vehicle, vehicleOptions, dieselPrice, gasPrice, electricityRate) {
  const dailyMiles = Math.max(0, Number(vehicle.annualMiles) || 0) / 260;
  let best = null;

  for (const option of vehicleOptions) {
    const effectiveRange = option.baseRange * (1 - towingPenalty(vehicle.trailerWeight, option.towing));
    const fit = capabilityFit({
      effectiveRange,
      dailyMiles,
      trailerWeight: vehicle.trailerWeight,
      towingCapacity: option.towing,
      payloadWeight: 0,
      payloadCapacity: option.payload,
      homeCharging: vehicle.homeCharging,
      categoryScore: 75,
    });
    if (!best || fit > best.capabilityFit) best = { option, capabilityFit: fit };
  }

  const costs = operatingCosts({
    annualMiles: vehicle.annualMiles,
    currentMpg: vehicle.mpg,
    fuelPrice: vehicle.fuelType === "diesel" ? dieselPrice : gasPrice,
    electricityRate,
    evKwhPer100Miles: best?.option.kwhPer100Miles,
    evPrice: best?.option.price ?? 0,
    tradeIn: 0,
  });

  return {
    ...vehicle,
    recommended: best?.option ?? null,
    capabilityFit: best?.capabilityFit ?? 0,
    economicScore: costs.score,
    currentAnnualCost: costs.currentAnnual,
    evAnnualCost: costs.evAnnual,
    annualSavings: costs.annualSavings,
  };
}


======== FILE: src/calculations.test.js ========
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
