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
