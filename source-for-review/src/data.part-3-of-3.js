export const GENERIC_TRADE_DEFAULTS = {
  dailyMiles: 70,
  stops: 6,
  payloadWeight: 600,
  trailerWeight: 0,
  equipmentIds: ["hand-tool-chargers", "tool-bag"],
};

export const TRADES = TRADES_RAW.map(withTradeKit).sort((a, b) => {
  if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
  return b.score - a.score;
});

export const EQUIPMENT_CATALOG = [...new Map(
  [
    ...GENERIC_FIELD_SERVICE_KIT,
    ...ELECTRICIAN_KIT,
    ...POOL_SERVICE_KIT,
    ...BATTERY_LAWN_KIT,
    ...HVAC_KIT,
    ...PLUMBING_KIT,
    ...PEST_CONTROL_KIT,
    ...PRESSURE_WASHING_KIT,
    ...IRRIGATION_KIT,
    ...CONSTRUCTION_KIT,
    ...MISC_PAYLOAD_OPTIONS,
  ].map((item) => [item.id, item]),
).values()];

function majorFromLibrary(major, libraryTradeName, overrides = {}) {
  const library = libraryTradeName ? TRADES.find((item) => item.name === libraryTradeName) : null;
  const kit = overrides.equipmentOptions ?? library?.equipmentOptions ?? GENERIC_FIELD_SERVICE_KIT;
  const defaults = overrides.defaults ?? library?.defaults ?? GENERIC_TRADE_DEFAULTS;
  const hasConvertibilityScore = overrides.hasConvertibilityScore !== false && overrides.score !== null;
  return {
    ...major,
    libraryTradeName: libraryTradeName ?? null,
    hasConvertibilityScore,
    score: hasConvertibilityScore ? (overrides.score ?? library?.score ?? major.score ?? 86) : null,
    equipmentOptions: kit,
    defaults: {
      dailyMiles: defaults.dailyMiles ?? GENERIC_TRADE_DEFAULTS.dailyMiles,
      stops: defaults.stops ?? GENERIC_TRADE_DEFAULTS.stops,
      payloadWeight: defaults.payloadWeight ?? GENERIC_TRADE_DEFAULTS.payloadWeight,
      trailerWeight: defaults.trailerWeight ?? GENERIC_TRADE_DEFAULTS.trailerWeight,
      equipmentIds: defaultEquipmentIds(kit, defaults.equipmentIds),
    },
  };
}

export const MAJOR_TRADES = [
  majorFromLibrary({ id: "electrical", name: "Electrical", featured: true }, "Electrician"),
  majorFromLibrary({ id: "plumbing", name: "Plumbing" }, "Plumbing"),
  majorFromLibrary({ id: "hvac", name: "HVAC" }, "HVAC"),
  majorFromLibrary({ id: "pool-service", name: "Pool Service", featured: true }, "Pool Service"),
  majorFromLibrary({ id: "landscaping", name: "Landscaping / Lawn", featured: true }, "Battery-Powered Lawn / Landscaping"),
  majorFromLibrary({ id: "pest-control", name: "Pest Control" }, "Pest Control"),
  majorFromLibrary({ id: "property-maintenance", name: "Property Maintenance / Handyman" }, "Property Maintenance"),
  majorFromLibrary(
    { id: "construction", name: "Construction / Remodel" },
    "Home Builder / General Contractor",
    {
      equipmentOptions: CONSTRUCTION_KIT,
      defaults: { dailyMiles: 55, stops: 4, payloadWeight: 750, trailerWeight: 0, equipmentIds: ["hand-tool-chargers", "tool-bag", "step-ladder-8"] },
    },
  ),
  majorFromLibrary(
    { id: "other", name: "Type your trade", custom: true },
    null,
    { score: null, hasConvertibilityScore: false, equipmentOptions: GENERIC_FIELD_SERVICE_KIT, defaults: GENERIC_TRADE_DEFAULTS },
  ),
];

export const OTHER_TRADE_NAME = "Type your trade";

export function normalizeTradeKey(value) {
  return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const CUSTOM_MAJOR_ALIASES = [
  { majorId: "electrical", keys: ["electrical", "electrician", "electric", "low voltage", "data cabling", "solar"] },
  { majorId: "plumbing", keys: ["plumbing", "plumber"] },
  { majorId: "hvac", keys: ["hvac", "heating", "air conditioning", "cooling"] },
  { majorId: "pool-service", keys: ["pool service", "pool"] },
  { majorId: "landscaping", keys: ["landscaping", "landscape", "lawn", "lawn maintenance"] },
  { majorId: "pest-control", keys: ["pest control", "pest"] },
  { majorId: "property-maintenance", keys: ["property maintenance", "handyman", "facility maintenance"] },
  { majorId: "construction", keys: ["construction", "remodel", "carpenter", "framing", "drywall", "home builder"] },
  { majorId: "other", keys: ["other", "type your trade", "custom"] },
];

function keyMatchesAlias(key, alias) {
  if (key === alias) return true;
  if (alias.includes(" ")) return key.includes(alias);
  return key.split(" ").includes(alias);
}

export function mapTextToMajor(text) {
  const key = normalizeTradeKey(text);
  if (!key) return null;
  const exact = MAJOR_TRADES.find((major) => normalizeTradeKey(major.name) === key);
  if (exact) return exact;
  const alias = CUSTOM_MAJOR_ALIASES.find((entry) => entry.keys.some((item) => keyMatchesAlias(key, item)));
  if (alias) return MAJOR_TRADES.find((major) => major.id === alias.majorId) ?? null;
  return null;
}

export function matchLibraryTrade(text) {
  const key = normalizeTradeKey(text);
  if (!key || key.length < 3) return null;
  const exact = TRADES.find((item) => normalizeTradeKey(item.name) === key);
  if (exact) return exact;
  const ranked = TRADES.map((item) => {
    const nameKey = normalizeTradeKey(item.name);
    const words = nameKey.split(" ");
    let rank = 0;
    if (nameKey === key) rank = 100;
    else if (words.includes(key)) rank = 80;
    else if (key.split(" ").filter((word) => word.length > 2).every((word) => words.includes(word))) rank = 70;
    else if (key.length >= 5 && nameKey.includes(key)) rank = 50;
    return { item, rank };
  }).filter((row) => row.rank > 0).sort((a, b) => b.rank - a.rank || a.item.name.length - b.item.name.length);
  return ranked[0]?.item ?? null;
}

export function resolveTradeProfile(tradeName, customText = "") {
  const other = MAJOR_TRADES.find((major) => major.id === "other");
  const major = MAJOR_TRADES.find((item) => item.name === tradeName) ?? mapTextToMajor(tradeName) ?? other;
  const custom = String(customText ?? "").trim();
  if (major.id === "other") {
    return {
      ...other,
      score: null,
      hasConvertibilityScore: false,
      categoryLabel: custom || other.name,
      kitKey: "other",
      libraryMatchName: null,
      scoreFromLibrary: false,
    };
  }
  return {
    ...major,
    hasConvertibilityScore: major.hasConvertibilityScore !== false,
    categoryLabel: major.name,
    kitKey: major.id,
    libraryMatchName: major.libraryTradeName ?? null,
    scoreFromLibrary: false,
  };
}

export const DEFAULT_WORK_TRADE = MAJOR_TRADES.find((trade) => trade.id === "electrical") ?? MAJOR_TRADES[0];

export function findTrade(tradeName) {
  return MAJOR_TRADES.find((item) => item.name === tradeName)
    ?? TRADES.find((item) => item.name === tradeName);
}

export function equipmentOptionsForTrade(tradeName, customText) {
  if (customText != null && String(customText).trim()) {
    return resolveTradeProfile(tradeName, customText).equipmentOptions ?? GENERIC_FIELD_SERVICE_KIT;
  }
  return findTrade(tradeName)?.equipmentOptions ?? GENERIC_FIELD_SERVICE_KIT;
}

export function selectableEquipmentForTrade(tradeName, customText) {
  return [...equipmentOptionsForTrade(tradeName, customText), ...MISC_PAYLOAD_OPTIONS];
}

export function tradeDefaults(tradeName, customText) {
  if (customText != null && String(customText).trim()) {
    return resolveTradeProfile(tradeName, customText).defaults ?? GENERIC_TRADE_DEFAULTS;
  }
  return findTrade(tradeName)?.defaults ?? GENERIC_TRADE_DEFAULTS;
}

export function equipmentItemsFromIds(ids, options = EQUIPMENT_CATALOG) {
  return (ids ?? [])
    .map((id) => options.find((item) => item.id === id))
    .filter(Boolean)
    .map((item) => ({
      id: item.id,
      name: item.name,
      watts: item.watts ?? 0,
      hours: item.typicalHours ?? 0,
      weightLbs: item.weightLbs ?? 0,
      trailerWeightLbs: item.trailerWeightLbs ?? 0,
    }));
}

export const HOME_CHARGER_SHOP = {
  label: "Shop home chargers",
  href: "https://www.homedepot.com/b/Electrical-Electric-Vehicle-Chargers/N-5yc1vZc5ah",
  helper: "Overnight home charging is usually Level 2.",
};

export const CURRENT_TRUCK_PRESETS = [
  { id: "f150", name: "Ford F-150", mpg: 16 },
  { id: "superduty", name: "Ford Super Duty (F-250 / F-350)", mpg: 13 },
  { id: "silverado", name: "Chevrolet Silverado 1500", mpg: 16 },
  { id: "ram1500", name: "Ram 1500", mpg: 17 },
  { id: "sierra", name: "GMC Sierra 1500", mpg: 16 },
  { id: "tundra", name: "Toyota Tundra", mpg: 18 },
  { id: "titan", name: "Nissan Titan", mpg: 16 },
  { id: "other", name: "Other — type it in", mpg: 16 },
];

export const UNKNOWN_CHARGING_START_PCT = 70;

export const CHARGING_OPTIONS = [
  { id: "home", label: "Home charging overnight", startChargePct: 100, middayKwh: 0, hasOvernight: true, hasDaytime: false },
  { id: "shop", label: "Shop / depot overnight", startChargePct: 100, middayKwh: 0, hasOvernight: true, hasDaytime: false },
  { id: "home-daytime", label: "Home plus a daytime top-up", startChargePct: 100, middayKwh: 18, hasOvernight: true, hasDaytime: true },
  { id: "daytime", label: "Daytime public or depot only", startChargePct: 65, middayKwh: 22, hasOvernight: false, hasDaytime: true },
  { id: "none", label: "No reliable charging yet", startChargePct: 55, middayKwh: 0, hasOvernight: false, hasDaytime: false },
  {
    id: "unknown",
    label: "Unknown — not sure yet",
    startChargePct: UNKNOWN_CHARGING_START_PCT,
    middayKwh: 0,
    hasOvernight: false,
    hasDaytime: false,
    isUnknown: true,
    helper: `Conservative fit: starts around ${UNKNOWN_CHARGING_START_PCT}% and does not assume overnight or daytime charging. Directional only — not a modeled home or shop setup.`,
  },
];

export function chargingOption(id) {
  return CHARGING_OPTIONS.find((option) => option.id === id) ?? CHARGING_OPTIONS[0];
}

export const ACTIVITIES = [
  "Boating / Fishing", "Camping", "Mountain Biking", "ATV / Off-Roading", "Hunting",
  "Snowmobiling", "Skiing / Snowboarding", "Kayaking / Canoeing", "Youth Sports / Team Travel",
  "Tailgating", "RV / Travel Trailer Towing", "Horse / Livestock Trailer", "Motorcycle Hauling",
  "Overlanding", "Lake / Beach Day Trips", "Moving & Hauling for Family",
];

export const PLAY_TOWABLE_FISHING_16_LB = 1450;
export const PLAY_TOWABLE_BASS_19_LB = 2480;
export const PLAY_TOWABLE_PONTOON_22_LB = 3680;
export const PLAY_TOWABLE_SKI_WAKE_21_LB = 4200;
export const PLAY_TOWABLE_PWC_LB = 1020;
export const PLAY_TOWABLE_PWC_DUAL_LB = 1780;
export const PLAY_TOWABLE_POPUP_LB = 1860;
export const PLAY_TOWABLE_TRAVEL_18_LB = 3280;
export const PLAY_TOWABLE_UTILITY_12_LB = 1080;
export const PLAY_TOWABLE_HORSE_2H_LB = 2760;
export const PLAY_TOWABLE_MOTO_LB = 420;
export const PLAY_TOWABLE_SNOW_LB = 780;

export const PLAY_TOWABLE_OPTIONS = [
  { id: "none", label: "None", emptyWeightLbs: 0, note: "Nothing in tow. Play-day gear stays in the bed or cab." },
  { id: "fishing-16", label: "Fishing boat 16–18 ft", emptyWeightLbs: PLAY_TOWABLE_FISHING_16_LB, note: "Aluminum jon / tiller class plus bunk trailer. Empty ~1,450 lb combined." },
  { id: "bass-19", label: "Bass boat 19 ft", emptyWeightLbs: PLAY_TOWABLE_BASS_19_LB, note: "Fiberglass bass boat plus tandem bunk. Empty ~2,480 lb combined." },
  { id: "pontoon-22", label: "Pontoon 22 ft", emptyWeightLbs: PLAY_TOWABLE_PONTOON_22_LB, note: "22-ft party pontoon plus tandem trailer. Empty ~3,680 lb combined." },
  { id: "ski-wake-21", label: "Ski / wake boat 21 ft", emptyWeightLbs: PLAY_TOWABLE_SKI_WAKE_21_LB, note: "21-ft bowrider / ski-wake plus tandem. Empty ~4,200 lb combined." },
  { id: "pwc", label: "PWC + trailer", emptyWeightLbs: PLAY_TOWABLE_PWC_LB, note: "One 2-up personal watercraft plus single trailer. Empty ~1,020 lb." },
  { id: "pwc-dual", label: "Dual PWC + trailer", emptyWeightLbs: PLAY_TOWABLE_PWC_DUAL_LB, note: "Two mid-size PWCs plus dual trailer. Empty ~1,780 lb." },
  { id: "popup-camper", label: "Pop-up camper", emptyWeightLbs: PLAY_TOWABLE_POPUP_LB, note: "Folding tent camper UVW. Empty ~1,860 lb." },
  { id: "travel-18", label: "Travel trailer 16–19 ft", emptyWeightLbs: PLAY_TOWABLE_TRAVEL_18_LB, note: "Small travel trailer UVW. Empty ~3,280 lb." },
  { id: "atv-utility", label: "12-ft utility (ATV/SxS)", emptyWeightLbs: PLAY_TOWABLE_UTILITY_12_LB, note: "Open utility trailer empty only. Put the machine in Play Day gear." },
  { id: "horse-2h", label: "2-horse bumper-pull", emptyWeightLbs: PLAY_TOWABLE_HORSE_2H_LB, note: "Bumper-pull two-horse empty. Empty ~2,760 lb." },
  { id: "moto-trailer", label: "Motorcycle trailer", emptyWeightLbs: PLAY_TOWABLE_MOTO_LB, note: "Folding or small open motorcycle trailer. Empty ~420 lb." },
  { id: "snow-trailer", label: "Snowmobile trailer", emptyWeightLbs: PLAY_TOWABLE_SNOW_LB, note: "Double snowmobile trailer empty. Empty ~780 lb." },
];

export function playTowableById(id) {
  return PLAY_TOWABLE_OPTIONS.find((item) => item.id === id) ?? PLAY_TOWABLE_OPTIONS[0];
}

const PLAY_TOWABLE_DEFAULTS = {
  "Boating / Fishing": "fishing-16",
  "Camping": "popup-camper",
  "Mountain Biking": "none",
  "ATV / Off-Roading": "atv-utility",
  "Hunting": "none",
  "Snowmobiling": "snow-trailer",
  "Skiing / Snowboarding": "none",
  "Kayaking / Canoeing": "none",
  "Youth Sports / Team Travel": "none",
  "Tailgating": "none",
  "RV / Travel Trailer Towing": "travel-18",
  "Horse / Livestock Trailer": "horse-2h",
  "Motorcycle Hauling": "moto-trailer",
  "Overlanding": "none",
  "Lake / Beach Day Trips": "fishing-16",
  "Moving & Hauling for Family": "atv-utility",
};

export function defaultPlayTowableId(activity) {
  return PLAY_TOWABLE_DEFAULTS[activity] ?? "none";
}

export const PLAY_GEAR_SHARED = [
  kitItem({ id: "play-cooler-65", name: "65-qt cooler (loaded day)", weightLbs: 85, weightSource: "estimate", note: "Yeti/RTIC 65-class empty ~29 lb; ice + food for a day ~85 lb loaded." }),
  kitItem({ id: "play-misc-100", name: "Additional 100 lb family cargo", weightLbs: 100, note: "Bags, groceries, leftover weekend cargo. No watt-hours." }),
  kitItem({ id: "play-misc-300", name: "Additional 300 lb family cargo", weightLbs: 300, note: "Heavier leftover weekend cargo. No watt-hours." }),
];

const PLAY_PFDS = kitItem({ id: "play-pfds", name: "4 adult PFDs", weightLbs: 16, weightSource: "estimate", note: "Four Type III life jackets ~3.5–4.5 lb each." });
const PLAY_TACKLE = kitItem({ id: "play-tackle", name: "Tackle + rod bundle", weightLbs: 22, note: "Plano-class box plus a 4-rod day bundle." });
const PLAY_TENT = kitItem({ id: "play-tent-4", name: "4-person tent", weightLbs: 17, weightSource: "fact", note: "REI Kingdom 4-class packed weight ~16.9 lb." });
const PLAY_SLEEP = kitItem({ id: "play-sleep-4", name: "Sleeping bags + pads (4)", weightLbs: 28, note: "Four 3-season bags and pads." });
const PLAY_CAMP_KITCHEN = kitItem({ id: "play-camp-kitchen", name: "Camp kitchen + stove", weightLbs: 24, note: "Stove, cookbox, table kit." });
const PLAY_CHAIRS = kitItem({ id: "play-chairs-4", name: "4 camp / tailgate chairs", weightLbs: 20, note: "Four folding camp chairs." });
const PLAY_CANOPY = kitItem({ id: "play-canopy", name: "10x10 canopy", weightLbs: 41, weightSource: "estimate", note: "Coleman-class 10x10 instant shelter ~35–47 lb." });
const PLAY_BIKES = kitItem({ id: "play-bikes-2", name: "2 trail bikes + hitch rack", weightLbs: 118, weightSource: "estimate", note: "Two 32-lb trail bikes plus Kuat NV 2.0-class 2-bike hitch (~54 lb)." });
const PLAY_KAYAKS = kitItem({ id: "play-kayaks-2", name: "2 recreational kayaks + rack", weightLbs: 144, weightSource: "estimate", note: "Two 10–12 ft sit-ins (~53 lb) plus crossbar saddles and paddles/PFDs." });
const PLAY_ATV = kitItem({ id: "play-atv-sportsman", name: "Sportsman-class ATV", weightLbs: 728, weightSource: "fact", note: "Polaris Sportsman 570-class dry ~728 lb. Bed or trailer deck." });
const PLAY_SXS = kitItem({ id: "play-sxs-ranger", name: "Ranger-class SxS / UTV", weightLbs: 1660, weightSource: "estimate", note: "Polaris Ranger 1000 XP-class ~1,605–1,712 lb dry." });
const PLAY_SKI_SET = kitItem({ id: "play-ski-wake-set", name: "Ski / wakeboard + tube", weightLbs: 30, note: "Combo ski, wakeboard, and towable tube." });
const PLAY_SNOWMOBILE = kitItem({ id: "play-snowmobile", name: "Trail snowmobile", weightLbs: 480, weightSource: "estimate", note: "600–850cc trail sled dry ~450–520 lb." });
const PLAY_SKI_BAGS = kitItem({ id: "play-ski-bags", name: "4 ski / board bags + boots", weightLbs: 56, note: "Four alpine kits in bags." });
const PLAY_HUNT = kitItem({ id: "play-hunt-kit", name: "Gun cases + decoy bag", weightLbs: 42, note: "Two locked cases and a decoy/blind bag." });
const PLAY_TEAM = kitItem({ id: "play-team-bags", name: "Team bags + ball crate", weightLbs: 55, note: "Sideline bags for a youth team." });
const PLAY_GRILL = kitItem({ id: "play-tailgate-grill", name: "Tailgate grill + table", weightLbs: 38, note: "Portable gas grill and folding table." });
const PLAY_RV_KIT = kitItem({ id: "play-rv-hookup", name: "RV hookup + water kit", weightLbs: 45, note: "Hoses, blocks, 20-lb extra water." });
const PLAY_TACK = kitItem({ id: "play-horse-tack", name: "Tack + feed / water", weightLbs: 80, note: "Saddles/tack plus a day of feed and water." });
const PLAY_MOTO = kitItem({ id: "play-motorcycle", name: "Dual-sport / dirt bike", weightLbs: 290, weightSource: "estimate", note: "250–450cc dual-sport wet ~270–320 lb." });
const PLAY_OVERLAND = kitItem({ id: "play-rooftop-tent", name: "Rooftop tent + recovery", weightLbs: 165, note: "Hard-shell RTT class plus boards and straps." });
const PLAY_BEACH = kitItem({ id: "play-beach-kit", name: "Beach wagon + shade", weightLbs: 36, note: "Wagon, umbrella, and towels crate." });
const PLAY_DOLLY = kitItem({ id: "play-dolly-bins", name: "Dolly + moving bins", weightLbs: 70, note: "Appliance dolly and a stack of totes." });

export const PLAY_GEAR_BY_ACTIVITY = {
  "Boating / Fishing": [PLAY_PFDS, PLAY_TACKLE, PLAY_SKI_SET],
  "Camping": [PLAY_TENT, PLAY_SLEEP, PLAY_CAMP_KITCHEN, PLAY_CHAIRS, PLAY_CANOPY],
  "Mountain Biking": [PLAY_BIKES],
  "ATV / Off-Roading": [PLAY_ATV, PLAY_SXS],
  "Hunting": [PLAY_HUNT, PLAY_CHAIRS],
  "Snowmobiling": [PLAY_SNOWMOBILE, PLAY_SKI_BAGS],
  "Skiing / Snowboarding": [PLAY_SKI_BAGS, PLAY_CHAIRS],
  "Kayaking / Canoeing": [PLAY_KAYAKS, PLAY_PFDS],
  "Youth Sports / Team Travel": [PLAY_TEAM, PLAY_CHAIRS, PLAY_CANOPY],
  "Tailgating": [PLAY_GRILL, PLAY_CHAIRS, PLAY_CANOPY],
  "RV / Travel Trailer Towing": [PLAY_RV_KIT, PLAY_CHAIRS],
  "Horse / Livestock Trailer": [PLAY_TACK],
  "Motorcycle Hauling": [PLAY_MOTO],
  "Overlanding": [PLAY_OVERLAND, PLAY_TENT, PLAY_CAMP_KITCHEN],
  "Lake / Beach Day Trips": [PLAY_PFDS, PLAY_BEACH, PLAY_KAYAKS],
  "Moving & Hauling for Family": [PLAY_DOLLY],
};

const PLAY_GEAR_DEFAULTS = {
  "Boating / Fishing": ["play-pfds", "play-cooler-65"],
  "Camping": ["play-tent-4", "play-cooler-65"],
  "Mountain Biking": ["play-bikes-2"],
  "ATV / Off-Roading": ["play-atv-sportsman"],
  "Hunting": ["play-hunt-kit", "play-cooler-65"],
  "Snowmobiling": ["play-snowmobile"],
  "Skiing / Snowboarding": ["play-ski-bags"],
  "Kayaking / Canoeing": ["play-kayaks-2", "play-pfds"],
  "Youth Sports / Team Travel": ["play-team-bags", "play-cooler-65"],
  "Tailgating": ["play-tailgate-grill", "play-cooler-65", "play-chairs-4"],
  "RV / Travel Trailer Towing": ["play-rv-hookup", "play-cooler-65"],
  "Horse / Livestock Trailer": ["play-horse-tack"],
  "Motorcycle Hauling": ["play-motorcycle"],
  "Overlanding": ["play-rooftop-tent", "play-cooler-65"],
  "Lake / Beach Day Trips": ["play-beach-kit", "play-cooler-65"],
  "Moving & Hauling for Family": ["play-dolly-bins"],
};

export function playGearOptionsForActivity(activity) {
  return [...(PLAY_GEAR_BY_ACTIVITY[activity] ?? []), ...PLAY_GEAR_SHARED];
}

export function defaultPlayGearIds(activity) {
  return [...(PLAY_GEAR_DEFAULTS[activity] ?? [])];
}

export function playGearItemsFromIds(ids, activity) {
  return equipmentItemsFromIds(ids, playGearOptionsForActivity(activity));
}



