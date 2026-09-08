import { jobFitForTrade, overflowTrailerById } from "./data";

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const DEMO_KWH_PER_100_MI = 48;
export const DEMO_KWH_PER_STOP = 0.4;
export const RESERVE_TARGET_PCT = 20;

// Cargo / kit mass derate — separate from towing and from tool watt-hours.
// A highway trailer is a 25–55% hit (aero + tongue + rolling). In-bed kit
// (ladders, wire, chemical totes, extra packs) is mostly extra mass, so we
// use a milder curve: 12% range loss at the truck's payload rating, 15% if
// the load is piled past rating. Reviewed September 2026; directional only.
export const CARGO_DERATE_AT_CAPACITY = 0.12;
export const CARGO_DERATE_OVER_CAP_EXTRA = 0.03;

// Discrete selection-aware docks subtracted from capabilityFit so every
// vehicle display moves in visible 1 / 3 / 5 point hits.
export const FIT_DOCK = {
  BED_WEIGHT: 1,
  KIT_WEIGHT: 1,
  CONFIG_RANGE: 1,
  PAYLOAD_NEAR: 3,
  TOW_NEAR: 3,
  RANGE_TIGHT: 3,
  NO_OVERNIGHT: 3,
  PAYLOAD_EXCEED: 5,
  TOW_EXCEED: 5,
  RANGE_MISS: 5,
};

export function splitEquipmentMass(equipmentItems = []) {
  let bedWeightLbs = 0;
  let kitWeightLbs = 0;
  for (const item of equipmentItems) {
    const weight = Math.max(0, Number(item.weightLbs) || 0);
    if (String(item.id || "").startsWith("bed-")) bedWeightLbs += weight;
    else kitWeightLbs += weight;
  }
  return { bedWeightLbs, kitWeightLbs };
}

const round1 = (value) => Math.round(value * 10) / 10;

export function configRange(vehicle, config, selection = {}) {
  const packs = config?.packs ?? [];
  const motors = config?.motors ?? [];
  const wheels = config?.wheels ?? [];
  const pack = packs.find((item) => item.id === selection.pack) || packs[0] || { rangeMod: 0 };
  const motor = motors.find((item) => item.id === selection.motor) || motors[0] || { effMod: 0 };
  const wheel = wheels.find((item) => item.id === selection.wheel) || wheels[0] || { effMod: 0 };
  const base = (Number(vehicle?.baseRange) || 0) + (Number(pack.rangeMod) || 0);
  return base * (1 + (Number(motor.effMod) || 0)) * (1 + (Number(wheel.effMod) || 0));
}

export function equipmentEnergyKwh(items = []) {
  return items.reduce((sum, item) => {
    const watts = Math.max(0, Number(item.watts) || 0);
    const hours = Math.max(0, Number(item.hours) || 0);
    return sum + (watts * hours) / 1000;
  }, 0);
}

export function equipmentWeightLbs(items = []) {
  return items.reduce((sum, item) => sum + Math.max(0, Number(item.weightLbs) || 0), 0);
}

export function equipmentTrailerLbs(items = []) {
  return items.reduce((sum, item) => sum + Math.max(0, Number(item.trailerWeightLbs) || 0), 0);
}

// When an overflow trailer is selected, previously selected kit/bed cargo leaves
// the bed and becomes trailer load. Leftover "payload in truck" (people / leftover
// cargo) stays as payload. Bed overflow must not DQ cargo that moved to the trailer.
export function allocateWorkdayLoad({
  payloadWeight = 0,
  trailerWeight = 0,
  equipmentItems = [],
  overflowTrailerId = "none",
} = {}) {
  const leftoverBedLbs = Math.max(0, Number(payloadWeight) || 0);
  const kitAndBedCargoLbs = equipmentWeightLbs(equipmentItems);
  const existingTrailerLbs = Math.max(0, Number(trailerWeight) || 0) + equipmentTrailerLbs(equipmentItems);
  const overflow = overflowTrailerById(overflowTrailerId);
  const overflowEmptyLbs = Math.max(0, Number(overflow?.emptyWeightLbs) || 0);
  const overflowSelected = overflow?.id && overflow.id !== "none";

  if (!overflowSelected) {
    return {
      overflowSelected: false,
      overflowTrailer: overflow,
      overflowEmptyLbs: 0,
      leftoverBedLbs,
      kitAndBedCargoLbs,
      movedCargoLbs: 0,
      bedPayloadLbs: leftoverBedLbs + kitAndBedCargoLbs,
      trailerLbs: existingTrailerLbs,
    };
  }

  return {
    overflowSelected: true,
    overflowTrailer: overflow,
    overflowEmptyLbs,
    leftoverBedLbs,
    kitAndBedCargoLbs,
    movedCargoLbs: kitAndBedCargoLbs,
    bedPayloadLbs: leftoverBedLbs,
    trailerLbs: existingTrailerLbs + overflowEmptyLbs + kitAndBedCargoLbs,
  };
}

export function cargoPenalty(payloadWeight, payloadCapacity) {
  const payload = Math.max(0, Number(payloadWeight) || 0);
  const capacity = Math.max(1, Number(payloadCapacity) || 1);
  if (payload === 0) return 0;
  const ratio = payload / capacity;
  return CARGO_DERATE_AT_CAPACITY * Math.min(ratio, 1) + CARGO_DERATE_OVER_CAP_EXTRA * clamp(ratio - 1, 0, 1);
}

// Combined mass-based range loss. Independent multipliers, not one blended fudge:
//   remainingRange = configRange * (1 - towing) * (1 - cargo)
//   kWh/mile       = (48/100) * (1 + towing) * (1 + cargo)
// Same sibling style as the existing towing curve — not a physics inverse.
// Electrical tool kWh is added later and is not part of this term.
export function massRangePenalty({ trailerWeight, towingCapacity, payloadWeight, payloadCapacity }) {
  const towingPenaltyPct = towingPenalty(trailerWeight, towingCapacity);
  const cargoPenaltyPct = cargoPenalty(payloadWeight, payloadCapacity);
  return {
    towingPenaltyPct,
    cargoPenaltyPct,
    combinedPenaltyPct: 1 - (1 - towingPenaltyPct) * (1 - cargoPenaltyPct),
  };
}

export function effectiveRangeFromPenalties(configRangeMiles, penalties) {
  return Math.max(0, Number(configRangeMiles) || 0) * (1 - (Number(penalties?.combinedPenaltyPct) || 0));
}

export function workdayEnergy({
  dailyMiles,
  stops,
  trailerWeight,
  towingCapacity,
  payloadWeight = 0,
  payloadCapacity = 2000,
  equipmentItems = [],
  evKwhPer100Miles = DEMO_KWH_PER_100_MI,
  overflowTrailerId = "none",
}) {
  const load = allocateWorkdayLoad({ payloadWeight, trailerWeight, equipmentItems, overflowTrailerId });
  const payload = load.bedPayloadLbs;
  const trailer = load.trailerLbs;
  const mass = massRangePenalty({
    trailerWeight: trailer,
    towingCapacity,
    payloadWeight: payload,
    payloadCapacity,
  });
  const kwhPerMile = (Math.max(0, Number(evKwhPer100Miles) || 0) / 100)
    * (1 + mass.towingPenaltyPct)
    * (1 + mass.cargoPenaltyPct);
  const miles = Math.max(0, Number(dailyMiles) || 0);
  const stopCount = Math.max(0, Number(stops) || 0);
  const drivingKwh = miles * kwhPerMile;
  const stopKwh = stopCount * DEMO_KWH_PER_STOP;
  const equipmentKwh = equipmentEnergyKwh(equipmentItems);
  return {
    kwhPerMile,
    drivingKwh: round1(drivingKwh),
    stopKwh: round1(stopKwh),
    equipmentKwh: round1(equipmentKwh),
    totalKwh: round1(drivingKwh + stopKwh + equipmentKwh),
    towingPenaltyPct: mass.towingPenaltyPct,
    cargoPenaltyPct: mass.cargoPenaltyPct,
    combinedPenaltyPct: mass.combinedPenaltyPct,
    payloadLbs: payload,
    trailerLbs: trailer,
    overflow: load,
  };
}

function ratingFrom({ energyShort, payloadOver, towOver, reservePct, hasOvernight }) {
  if (energyShort || payloadOver || towOver) {
    return { rating: "not-a-fit", ratingLabel: "Not a good fit" };
  }
  if (reservePct < RESERVE_TARGET_PCT || !hasOvernight) {
    return { rating: "conditional", ratingLabel: "Conditional Workday Fit" };
  }
  return { rating: "good", ratingLabel: "Good Workday Fit" };
}

function buildSummary({
  vehicleName,
  categoryLabel,
  rating,
  dailyMiles,
  stops,
  reservePct,
  equipmentKwh,
  hasOvernight,
  payloadOver,
  towOver,
  energyShort,
}) {
  const day = `${Math.round(Math.max(0, Number(dailyMiles) || 0))} miles and ${Math.max(0, Number(stops) || 0)} stop${Number(stops) === 1 ? "" : "s"}`;
  const name = vehicleName || "This truck";
  const trade = categoryLabel || "work";
  if (rating === "not-a-fit") {
    if (towOver || payloadOver) {
      return `${name} is not a good fit for this ${trade} day. The load is over what this truck is rated to carry or tow.`;
    }
    if (energyShort) {
      return `${name} is not a good fit for this ${trade} day (${day}). Estimated energy use exceeds what the battery can deliver with the charging you selected.`;
    }
    return `${name} is not a good fit for this ${trade} day (${day}).`;
  }
  if (rating === "conditional") {
    return `${name} can probably finish this ${trade} day (${day}), but the end-of-day reserve is thin — about ${Math.round(reservePct)}% left. A larger pack, fewer powered tools, or a daytime top-up would make the day more comfortable.`;
  }
  return `${name} can finish a typical ${trade} day — about ${day} — and still have roughly ${Math.round(reservePct)}% battery left. ${equipmentKwh > 0.5 ? "Equipment draw is included in that reserve." : "Equipment draw is modest."} ${hasOvernight ? "Overnight charging is enough for this pattern." : "You will want a reliable way to recharge before the next day."}`;
}

export function workdayAssumptions() {
  return [
    `Demonstration vehicle specs reviewed August 2026 — not live inventory or a purchase recommendation.`,
    `Trade-kit weights are modeled estimates reviewed September 2026 — not a scale ticket from a real truck.`,
    `Driving energy uses about ${DEMO_KWH_PER_100_MI} kWh per 100 miles, then scales up with towing and cargo/kit mass.`,
    `Each stop adds about ${DEMO_KWH_PER_STOP} kWh for start-stop and short idle — not measured idle data.`,
    `In-bed cargo and trade-kit weight use a separate ~${Math.round(CARGO_DERATE_AT_CAPACITY * 100)}% range derate at payload rating — not the trailer curve. Electrical tool kWh is counted separately.`,
    `Weather, hills, traffic, and cabin HVAC are not modeled here.`,
    `Operating-cost comparison is fuel + maintenance only. Financing the replacement truck is not included.`,
    `Unknown charging is modeled conservatively: about 70% start charge and no assumed overnight or daytime charger. It is not a precise home or shop model.`,
    `Bed-accessory upfit prices are demo ballparks (list / street sheets reviewed September 2026), not an installed quote.`,
    `A selected overflow trailer uses a FACT-ish empty curb weight plus the kit/bed cargo that moved off the bed. Towing is checked against that total. Leftover bed load (people / leftover cargo) is still payload. Bed overflow does not auto-disqualify cargo that moved to the trailer.`,
    `These numbers are directional estimates. They should not be read as more precise than the demo data supports.`,
  ];
}

export function workdayAssessment({
  configRange: ratedRange,
  dailyMiles,
  stops,
  trailerWeight,
  towingCapacity,
  payloadWeight,
  payloadCapacity,
  charging,
  equipmentItems = [],
  categoryScore,
  categoryLabel,
  vehicleId,
  tradeId,
  jobFit: jobFitArg,
  vehicleName,
  packLabel,
  motorLabel,
  wheelLabel,
  recommendedRange,
  evKwhPer100Miles,
  overflowTrailerId = "none",
}) {
  const kitWeightLbs = equipmentWeightLbs(equipmentItems);
  const kitTrailerLbs = equipmentTrailerLbs(equipmentItems);
  const load = allocateWorkdayLoad({ payloadWeight, trailerWeight, equipmentItems, overflowTrailerId });
  const payload = load.bedPayloadLbs;
  const trailer = load.trailerLbs;
  const energy = workdayEnergy({
    dailyMiles,
    stops,
    trailerWeight,
    towingCapacity,
    payloadWeight,
    payloadCapacity,
    equipmentItems,
    evKwhPer100Miles,
    overflowTrailerId,
  });
  const range = Math.max(0, Number(ratedRange) || 0);
  const effectiveRange = effectiveRangeFromPenalties(range, energy);
  const kwhPer100 = Math.max(0, Number(evKwhPer100Miles) || DEMO_KWH_PER_100_MI);
  const packKwh = (range / 100) * kwhPer100;
  const startPct = clamp(Number(charging?.startChargePct) || 0, 0, 100);
  const middayKwh = Math.max(0, Number(charging?.middayKwh) || 0);
  const availableKwh = packKwh * (startPct / 100) + middayKwh;
  const remainingKwh = availableKwh - energy.totalKwh;
  const reservePct = packKwh > 0 ? (remainingKwh / packKwh) * 100 : 0;
  const reserveMiles = energy.kwhPerMile > 0 ? remainingKwh / energy.kwhPerMile : 0;
  const payloadCap = Math.max(1, Number(payloadCapacity) || 1);
  const towCap = Math.max(1, Number(towingCapacity) || 1);
  const payloadOver = payload > payloadCap;
  const towOver = trailer > towCap;
  const energyShort = remainingKwh < 0;
  const hasOvernight = !!charging?.hasOvernight;
  const hasDaytime = !!charging?.hasDaytime;
  const { rating, ratingLabel } = ratingFrom({ energyShort, payloadOver, towOver, reservePct, hasOvernight });

  const overflowNote = load.overflowSelected
    ? ` Overflow ${load.overflowTrailer.label} empty ~${Math.round(load.overflowEmptyLbs).toLocaleString()} lb plus ${Math.round(load.movedCargoLbs).toLocaleString()} lb moved kit/bed cargo.`
    : "";
  const concerns = [];
  if (towOver) concerns.push(`Trailer at ${Math.round(trailer).toLocaleString()} lb is over the ${Math.round(towCap).toLocaleString()} lb towing rating.${overflowNote}`);
  else if (trailer > 0 && trailer >= towCap * 0.85) concerns.push(`Trailer weight is near capacity — expect a steep range penalty and little margin.${overflowNote}`);
  else if (trailer > 0) concerns.push(`Towing ${Math.round(trailer).toLocaleString()} lb is within the ${Math.round(towCap).toLocaleString()} lb rating, with a modeled ${Math.round(energy.towingPenaltyPct * 100)}% range hit.${overflowNote}`);
  const kitPayloadNote = load.overflowSelected
    ? ` Leftover bed load only — ${Math.round(load.movedCargoLbs).toLocaleString()} lb of kit/bed cargo moved to the trailer.`
    : (kitWeightLbs > 0 ? ` (includes ${Math.round(kitWeightLbs)} lb estimated trade kit)` : "");
  if (payloadOver && !load.overflowSelected) concerns.push(`Payload at ${Math.round(payload).toLocaleString()} lb is over the ${Math.round(payloadCap).toLocaleString()} lb rating.${kitPayloadNote} A tow-a-trailer option can move that cargo off the bed.`);
  else if (payloadOver) concerns.push(`Leftover bed payload at ${Math.round(payload).toLocaleString()} lb is still over the ${Math.round(payloadCap).toLocaleString()} lb rating.${kitPayloadNote}`);
  else if (payload > 0 && payload >= payloadCap * 0.85) concerns.push(`Payload is near capacity — keep an eye on people, leftover cargo, and tongue weight together.${kitPayloadNote}`);
  else if (payload > 0) concerns.push(`Payload of ${Math.round(payload).toLocaleString()} lb is within the ${Math.round(payloadCap).toLocaleString()} lb rating.${kitPayloadNote}`);
  if (energy.equipmentKwh > 8) concerns.push("Powered equipment is a large share of the day's energy — confirm those hours before trusting the reserve.");
  if (energy.cargoPenaltyPct > 0) {
    concerns.push(`Cargo/kit mass is modeled as a ${Math.round(energy.cargoPenaltyPct * 100)}% range hit${kitWeightLbs > 0 ? ` (~${Math.round(kitWeightLbs)} lb estimated trade kit)` : ""}.`);
  }

  let chargingNeeds;
  if (charging?.isUnknown) {
    chargingNeeds = "Charging is unknown, so this fit is conservative: about 70% start and no assumed overnight or daytime charger. Confirm home, shop, or a daytime top-up before trusting this number.";
  } else if (!hasOvernight && !hasDaytime) {
    chargingNeeds = "This day needs a charger you do not have yet. Overnight Level 2 at home or the shop is the usual fix.";
  } else if (!hasOvernight && hasDaytime) {
    chargingNeeds = "Plan on a daytime top-up. Without overnight charging the truck may not start the day full.";
  } else if (hasOvernight && reservePct < 25) {
    chargingNeeds = "Overnight charging covers a normal start, but the tight reserve means a mid-day top-up is worth having as backup.";
  } else if (hasDaytime) {
    chargingNeeds = "Overnight charging plus a daytime top-up is more than this day needs — a comfortable setup.";
  } else {
    chargingNeeds = "Home or shop overnight charging is enough — start the day full, the same way you would with a full tank.";
  }

  const notAFitReasons = [];
  if (towOver) {
    notAFitReasons.push(load.overflowSelected
      ? "The trailer (empty curb weight plus moved kit/bed cargo) is over this truck's towing rating."
      : "The trailer is over this truck's towing rating.");
  }
  if (payloadOver) {
    notAFitReasons.push(load.overflowSelected
      ? "Leftover bed payload is still over this truck's payload rating after moving kit/bed cargo to the trailer."
      : "The payload is over this truck's payload rating. A tow-a-trailer option can move kit/bed cargo off the bed.");
  }
  if (energyShort) notAFitReasons.push("Estimated driving + equipment energy exceeds the usable battery with the charging you selected.");
  if (!hasOvernight && !hasDaytime && !charging?.isUnknown) notAFitReasons.push("There is no reliable way to recharge before the next day.");

  const whyReasons = rating === "not-a-fit"
    ? notAFitReasons
    : rating === "conditional"
      ? [
        reservePct < RESERVE_TARGET_PCT
          ? `End-of-day reserve is about ${Math.round(reservePct)}%, under the ${RESERVE_TARGET_PCT}% target.`
          : null,
        !hasOvernight
          ? (charging?.isUnknown
            ? "Charging is unknown, so overnight charging is not assumed."
            : "No overnight charging is selected.")
          : null,
      ].filter(Boolean)
      : [];

  const watchouts = [
    ...notAFitReasons,
    "A much longer route or a lot more powered equipment than you entered",
    trailer === 0 ? "Adding a heavy trailer you did not model — or skipping a tow-a-trailer option when the bed is over capacity" : "Towing more than the empty-plus-cargo trailer weight you modeled, especially at highway speed",
    hasOvernight ? "Losing overnight charging for a stretch of days" : "Still having no reliable overnight charge",
    "Cold weather, hills, or cabin HVAC — none of those are in this estimate",
  ];

  const equipmentMiles = energy.kwhPerMile > 0 ? energy.equipmentKwh / energy.kwhPerMile : 0;
  const stopEquivalentMiles = Math.max(0, Number(stops) || 0) * 0.8;
  const payloadNear = !payloadOver && payload > 0 && payload >= payloadCap * 0.85;
  const towNear = !towOver && trailer > 0 && trailer >= towCap * 0.85;
  const rangeTight = !energyShort && reservePct < RESERVE_TARGET_PCT;
  const massSplit = splitEquipmentMass(equipmentItems);
  const configRangeHit = recommendedRange != null
    && (Number(ratedRange) || 0) < (Number(recommendedRange) || 0) - 0.5;
  const capabilityArgs = {
    effectiveRange,
    dailyMiles: Math.max(0, Number(dailyMiles) || 0) + stopEquivalentMiles + equipmentMiles,
    trailerWeight: trailer,
    towingCapacity,
    payloadWeight: payload,
    payloadCapacity,
    homeCharging: hasOvernight,
    categoryScore,
    jobFit: jobFitArg ?? jobFitForTrade(vehicleId, tradeId),
  };
  const live = liveFitScore(capabilityArgs, {
    payloadOver,
    towOver,
    energyShort,
    payloadNear,
    towNear,
    rangeTight,
    bedWeightLbs: massSplit.bedWeightLbs,
    kitWeightLbs: massSplit.kitWeightLbs,
    configRangeHit,
    hasOvernight,
  });
  const fitScore = live.score;

  const recommendedBits = [];
  if (packLabel || motorLabel || wheelLabel) {
    recommendedBits.push([packLabel, motorLabel, wheelLabel].filter(Boolean).join(" / "));
  }

  return {
    rating,
    ratingLabel,
    summary: buildSummary({
      vehicleName,
      categoryLabel,
      rating,
      dailyMiles,
      stops,
      reservePct,
      equipmentKwh: energy.equipmentKwh,
      hasOvernight,
      payloadOver,
      towOver,
      energyShort,
    }),
    energy: { ...energy, kitWeightLbs: Math.round(kitWeightLbs), kitTrailerLbs: Math.round(kitTrailerLbs) },
    effectiveRange: Math.round(effectiveRange),
    reserve: {
      kwh: round1(remainingKwh),
      miles: Math.round(reserveMiles),
      pct: Math.round(reservePct),
    },
    packKwh: round1(packKwh),
    availableKwh: round1(availableKwh),
    payload: {
      weight: payload,
      capacity: payloadCap,
      over: payloadOver,
      kitWeightLbs: Math.round(kitWeightLbs),
      leftoverBedLbs: Math.round(load.leftoverBedLbs),
      movedCargoLbs: Math.round(load.movedCargoLbs),
    },
    towing: {
      weight: trailer,
      capacity: towCap,
      over: towOver,
      penaltyPct: energy.towingPenaltyPct,
      kitTrailerLbs: Math.round(kitTrailerLbs),
      overflowEmptyLbs: Math.round(load.overflowEmptyLbs),
      movedCargoLbs: Math.round(load.movedCargoLbs),
    },
    overflow: {
      selected: load.overflowSelected,
      id: load.overflowTrailer?.id ?? "none",
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
