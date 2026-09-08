// list-or-street ballparks, not installed shop quotes. Reviewed Sep 2026.
// Sources (also in ATTRIBUTION.md):
// - DECKED full-size drawers: mfr compare 208–233 lb, list $1,699.99 → 220 lb / $1,700
// - Sterilite 27-gal tote: True Value 8.0 lb; 4-pack empty 32 lb. Street INFERENCE ~$20 ea / $80
// - Extang Trifecta 2.0 soft cover: retailer sheets ~35 lb, street ~$469.99 → $470
// - BAKFlip MX4 hard fold: retailer sheets 71 lb, list $1,249.99 → $1,250
// - Weather Guard 1245 steel short-bed rack: Nelson Truck 162 lb, $765.68 → $766
// - Backrack Original + hardware: 50 lb ship wt; RealTruck rack+kit $379.98 → $380
// - Weather Guard 124-5-01 aluminum cross box: 78 lb; Home Depot $1,179 → $1,180
// - Husky Guardian Comfort full liner: Amazon 19 lb, $399.99 → $400
// - Gladiator cargo net (fleet kit start): $158 list; ~8 lb empty is an INFERENCE
export const DECKED_DRAWER_WEIGHT_LB = 220;
export const DECKED_DRAWER_PRICE_USD = 1700;
export const STERILITE_27_TOTE_LB = 8;
export const STERILITE_27_TOTE_QTY = 4;
export const TOTE_4PACK_PRICE_USD = 80; // INFERENCE street
export const EXTANG_TONNEAU_LB = 35;
export const EXTANG_TONNEAU_PRICE_USD = 470;
export const BAKFLIP_TONNEAU_LB = 71;
export const BAKFLIP_TONNEAU_PRICE_USD = 1250;
export const WG_LADDER_RACK_LB = 162;
export const WG_LADDER_RACK_PRICE_USD = 766;
export const BACKRACK_HEADACHE_LB = 50;
export const BACKRACK_HEADACHE_PRICE_USD = 380;
export const WG_CROSSBOX_LB = 78;
export const WG_CROSSBOX_PRICE_USD = 1180;
export const HUSKY_LINER_LB = 19;
export const HUSKY_LINER_PRICE_USD = 400;
export const CARGO_NET_LB = 8; // INFERENCE empty kit
export const CARGO_NET_PRICE_USD = 158;

// Overflow / tow-a-trailer empty (curb) weights — FACT-ish manufacturer/retailer
// empty-weight sheets reviewed September 2026. These are curb/empty figures, not GVWR.
// Midpoints of the commonly posted class, not a quote for a specific VIN.
export const OVERFLOW_TRAILER_16_OPEN_LB = 1980; // 16-ft tandem landscape/utility (Carry-On / PJ class ~1,870–2,080)
export const OVERFLOW_TRAILER_12_ENCLOSED_LB = 1560; // 6x12 single-axle enclosed cargo (Pace / Legend class ~1,500–1,620)
export const OVERFLOW_TRAILER_10_ENCLOSED_LB = 1220; // 6x10 single-axle enclosed cargo (Haulmark / Pace class ~1,160–1,280)

export const OVERFLOW_TRAILER_OPTIONS = [
  {
    id: "none",
    label: "None",
    emptyWeightLbs: 0,
    note: "Keep selected kit and bed cargo on the truck. Bed overflow can still disqualify.",
  },
  {
    id: "open-16",
    label: '16-ft open',
    emptyWeightLbs: OVERFLOW_TRAILER_16_OPEN_LB,
    note: "Tandem landscape/utility class. Empty ~1,980 lb. Moves kit/bed cargo onto the trailer.",
  },
  {
    id: "enclosed-12",
    label: '12-ft enclosed',
    emptyWeightLbs: OVERFLOW_TRAILER_12_ENCLOSED_LB,
    note: "6x12 enclosed cargo class. Empty ~1,560 lb. Moves kit/bed cargo onto the trailer.",
  },
  {
    id: "enclosed-10",
    label: '10-ft enclosed',
    emptyWeightLbs: OVERFLOW_TRAILER_10_ENCLOSED_LB,
    note: "6x10 enclosed cargo class. Empty ~1,220 lb. Moves kit/bed cargo onto the trailer.",
  },
];

export function overflowTrailerById(id) {
  return OVERFLOW_TRAILER_OPTIONS.find((item) => item.id === id) ?? OVERFLOW_TRAILER_OPTIONS[0];
}

export const BED_ACCESSORY_NONE = {
  id: "none",
  name: "None / open bed",
  weightLbs: 0,
  priceEstUsd: 0,
  priceSource: "none",
  weightSource: "fact",
  note: "Leave every box unchecked for an open bed. No added weight or upfit cost.",
};

export const BED_ACCESSORY_OPTIONS = [
  {
    id: "drawers",
    name: "Bed drawers / slide-out storage",
    weightLbs: DECKED_DRAWER_WEIGHT_LB,
    priceEstUsd: DECKED_DRAWER_PRICE_USD,
    priceSource: "fact",
    weightSource: "fact",
    note: `DECKED-class drawer system — ${DECKED_DRAWER_WEIGHT_LB} lb (mfr 208–233 lb), ~$${DECKED_DRAWER_PRICE_USD.toLocaleString()} list. Labor not included.`,
  },
  {
    id: "totes",
    name: "27-gal totes (4-pack, budget path)",
    weightLbs: STERILITE_27_TOTE_LB * STERILITE_27_TOTE_QTY,
    priceEstUsd: TOTE_4PACK_PRICE_USD,
    priceSource: "inference",
    weightSource: "fact",
    note: `Four Sterilite 27-gal totes, ${STERILITE_27_TOTE_LB} lb each empty. Pair with a tonneau for the cheap weather-tight path. Tote price ~$${TOTE_4PACK_PRICE_USD} is an INFERENCE street range.`,
  },
  {
    id: "tonneau",
    name: "Soft tri-fold tonneau",
    weightLbs: EXTANG_TONNEAU_LB,
    priceEstUsd: EXTANG_TONNEAU_PRICE_USD,
    priceSource: "fact",
    weightSource: "fact",
    exclusiveGroup: "tonneau",
    note: `Extang Trifecta 2.0 class — ${EXTANG_TONNEAU_LB} lb, ~$${EXTANG_TONNEAU_PRICE_USD.toLocaleString()} street. Pick this or a hard cover, not both.`,
  },
  {
    id: "tonneau-hard",
    name: "Hard folding tonneau",
    weightLbs: BAKFLIP_TONNEAU_LB,
    priceEstUsd: BAKFLIP_TONNEAU_PRICE_USD,
    priceSource: "fact",
    weightSource: "fact",
    exclusiveGroup: "tonneau",
    note: `BAKFlip MX4 class — ${BAKFLIP_TONNEAU_LB} lb, ~$${BAKFLIP_TONNEAU_PRICE_USD.toLocaleString()} list. Lockable weather cover; pick this or a soft cover, not both.`,
  },
  {
    id: "ladder-rack",
    name: "Ladder / commercial rack",
    weightLbs: WG_LADDER_RACK_LB,
    priceEstUsd: WG_LADDER_RACK_PRICE_USD,
    priceSource: "fact",
    weightSource: "fact",
    note: `Weather Guard 1245-class steel short-bed rack — ${WG_LADDER_RACK_LB} lb, ~$${WG_LADDER_RACK_PRICE_USD.toLocaleString()} street. Common electrician / plumber / HVAC upfit.`,
  },
  {
    id: "headache-rack",
    name: "Headache rack / cab protector",
    weightLbs: BACKRACK_HEADACHE_LB,
    priceEstUsd: BACKRACK_HEADACHE_PRICE_USD,
    priceSource: "fact",
    weightSource: "fact",
    note: `Backrack Original + hardware kit — ${BACKRACK_HEADACHE_LB} lb ship wt, ~$${BACKRACK_HEADACHE_PRICE_USD.toLocaleString()} street. Protects the cab when pipe, ladders, or lumber shift.`,
  },
  {
    id: "toolbox",
    name: "Crossbed toolbox",
    weightLbs: WG_CROSSBOX_LB,
    priceEstUsd: WG_CROSSBOX_PRICE_USD,
    priceSource: "fact",
    weightSource: "fact",
    note: `Weather Guard 124-5-01 aluminum gull-wing — ${WG_CROSSBOX_LB} lb, ~$${WG_CROSSBOX_PRICE_USD.toLocaleString()} street. Lockable curb/street access.`,
  },
  {
    id: "bed-liner",
    name: "Full bed liner",
    weightLbs: HUSKY_LINER_LB,
    priceEstUsd: HUSKY_LINER_PRICE_USD,
    priceSource: "fact",
    weightSource: "fact",
    note: `Husky Guardian Comfort-class full liner — ${HUSKY_LINER_LB} lb, ~$${HUSKY_LINER_PRICE_USD.toLocaleString()} street. Drop-in/mat style; spray-in shops often run $500–$800.`,
  },
  {
    id: "cargo-net",
    name: "Cargo net / tie-down kit",
    weightLbs: CARGO_NET_LB,
    priceEstUsd: CARGO_NET_PRICE_USD,
    priceSource: "fact",
    weightSource: "inference",
    note: `Gladiator-class fleet cargo net starts ~$${CARGO_NET_PRICE_USD}. Empty-kit weight ~${CARGO_NET_LB} lb is an INFERENCE — cost stacks more than range.`,
  },
];

export function bedAccessoryOption(id) {
  if (!id || id === "none") return BED_ACCESSORY_NONE;
  return BED_ACCESSORY_OPTIONS.find((option) => option.id === id) ?? BED_ACCESSORY_NONE;
}

export function bedAccessoryOptionsFromIds(ids = []) {
  return [...new Set(ids)].map(bedAccessoryOption).filter((option) => option.id !== "none");
}

export function bedAccessoriesWeightLbs(ids = []) {
  return bedAccessoryOptionsFromIds(ids).reduce((sum, option) => sum + (Number(option.weightLbs) || 0), 0);
}

export function bedAccessoriesPriceUsd(ids = []) {
  return bedAccessoryOptionsFromIds(ids).reduce((sum, option) => sum + (Number(option.priceEstUsd) || 0), 0);
}

export function bedAccessoryItemsFromIds(ids = []) {
  return bedAccessoryOptionsFromIds(ids).map((option) => ({
    id: `bed-${option.id}`,
    name: option.name,
    watts: 0,
    hours: 0,
    weightLbs: option.weightLbs,
    trailerWeightLbs: 0,
  }));
}

export function toggleBedAccessoryId(currentIds, id) {
  const option = bedAccessoryOption(id);
  if (option.id === "none") return currentIds.filter((item) => item !== id);
  const selected = currentIds.includes(id);
  if (selected) return currentIds.filter((item) => item !== id);
  const group = option.exclusiveGroup;
  const cleared = group
    ? currentIds.filter((item) => bedAccessoryOption(item).exclusiveGroup !== group)
    : currentIds;
  return [...cleared, id];
}

const BED_ACCESSORY_HIDE_IDS = new Set(["pool-service", "battery-lawn", "pressure-washing", "landscaping"]);
const BED_ACCESSORY_HIDE_NAME = /landscap|lawn|pool|tree service|junk removal|delivery business|snow|agriculture|mining|waste \/|cemetery|golf-course/i;

function bedAccessoriesRelevant(trade) {
  if (!trade) return false;
  if (trade.id && BED_ACCESSORY_HIDE_IDS.has(trade.id)) return false;
  if (BED_ACCESSORY_HIDE_NAME.test(trade.name ?? "")) return false;
  return true;
}

export function tradeShowsBedAccessories(tradeName) {
  return bedAccessoriesRelevant({ name: tradeName, id: findTrade(tradeName)?.id });
}

export const MISC_PAYLOAD_OPTIONS = [
  kitItem({
    id: "misc-100",
    name: "Additional 100 lb miscellaneous",
    weightLbs: 100,
    note: "Pure payload — leftover cargo you did not list. No watt-hours.",
  }),
  kitItem({
    id: "misc-300",
    name: "Additional 300 lb miscellaneous",
    weightLbs: 300,
    note: "Pure payload — leftover cargo you did not list. No watt-hours.",
  }),
  kitItem({
    id: "misc-500",
    name: "Additional 500 lb miscellaneous",
    weightLbs: 500,
    note: "Pure payload — leftover cargo you did not list. No watt-hours.",
  }),
];

export const ELECTRICIAN_KIT = [
  kitItem({
    id: "step-ladder-10",
    name: "10-ft Type IA step (Werner 6210)",
    weightLbs: WERNER_STEP_10_LB,
    weightSource: "fact",
    note: "Werner 6210 fiberglass Type IA — 39 lb mfr shipping wt. Common orchard / exterior step.",
  }),
  kitItem({
    id: "extension-ladder",
    name: "16-ft Type IA extension (Werner D6216-2)",
    weightLbs: WERNER_EXT_16_LB,
    weightSource: "fact",
    note: "Werner D6216-2 fiberglass Type IA — 36.5 lb. Default service-truck extension.",
  }),
  kitItem({
    id: "extension-ladder-24",
    name: "24-ft Type IA extension (Werner D6224-2)",
    weightLbs: WERNER_EXT_24_LB,
    weightSource: "fact",
    note: "Werner D6224-2 fiberglass Type IA — 46 lb. Typical rack stick for taller work.",
  }),
  kitItem({
    id: "crew-ladder-set",
    name: "2–4 ladder crew set (6 / 8 / 16 / 24 Type IA)",
    weightLbs: CREW_LADDER_SET_LB,
    weightSource: "fact",
    note: `Werner 6206+6208+D6216-2+D6224-2 = ${CREW_LADDER_SET_LB} lb. Biggest electrical payload driver with wire.`,
  }),
  kitItem({
    id: "wire-spools",
    name: "Working wire (250 ft 14/2, 12/2, 14/3, 12/3, 10/3)",
    weightLbs: WORKING_WIRE_LB,
    weightSource: "fact",
    note: `Southwire NM-B lb/1000 ft × 250 ft each = ${WORKING_WIRE_LB} lb. Working stock, not full specialty reels.`,
  }),
  kitItem({
    id: "conduit-sticks",
    name: "Conduit sticks 1/2–3/4 EMT / PVC (qty 10)",
    weightLbs: 70,
    note: "Ten 10-ft sticks plus fittings — order long runs from the house. Weight is a Sep 2026 estimate.",
  }),
  CORDLESS_CHARGERS,
  JOBSITE_INVERTER,
  WORK_LIGHTS,
  STEP_LADDER_6,
  STEP_LADDER_8,
  kitItem({
    id: "fish-tape",
    name: "Fish tape / pull kit",
    weightLbs: 8,
    note: "Steel or fiberglass fish tape plus lube. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "panel-parts-bin",
    name: "Breakers / devices / mud-ring bin",
    weightLbs: 35,
    note: "Day-load of devices, breakers, and boxes. Weight is a Sep 2026 estimate.",
  }),
  SHOP_VAC,
  METER_BAG,
];

export const POOL_SERVICE_KIT = [
  kitItem({
    id: "telescoping-pole",
    name: "Telescoping pole 16–24 ft",
    weightLbs: 8,
    note: "Foundation of a route truck — skim, brush, vacuum. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "vacuum-head-hose",
    name: "Vacuum head + hose",
    weightLbs: 18,
    note: "Head plus 35–50 ft hose. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "leaf-nets-brushes",
    name: "Leaf nets / brushes",
    weightLbs: 8,
    note: "Skimmer net and wall/tile brushes. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "pool-pump",
    name: "Portable vacuum pump",
    watts: 1000,
    typicalHours: 2,
    weightLbs: 35,
    note: "Truck-powered portable vac when the equipment pad is not used",
  }),
  kitItem({
    id: "chemical-day-load",
    name: "Labeled chemical totes (chlorine / acid, split containment)",
    weightLbs: POOL_TOTES_LB,
    weightSource: "fact",
    note: `8 gal liquids × ${WATER_LB_PER_GAL} lb/gal + tote tare. Oxidizers and acid in separate secondary containment.`,
  }),
  kitItem({
    id: "salt-bags",
    name: "Salt / tablet bags (2 × 40 lb)",
    weightLbs: SALT_BAG_LB * 2,
    weightSource: "fact",
    note: "Two labeled 40-lb bags. Chemicals and salt are the biggest pool payload drivers.",
  }),
  kitItem({
    id: "test-kit",
    name: "Test kit",
    weightLbs: 3,
    note: "Reagent or digital kit — small payload, used every stop",
  }),
  kitItem({
    id: "filter-cartridges",
    name: "Filter cartridges / grids (day-load)",
    weightLbs: 22,
    note: "Spare cartridges or DE grids. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "shock-bags",
    name: "Shock / oxidizer bags",
    weightLbs: 40,
    note: "Labeled oxidizer bags, split from acid. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "skimmer-baskets",
    name: "Skimmer / pump baskets",
    weightLbs: 6,
    note: "Replacement baskets for route swaps. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "spare-pool-pump",
    name: "Spare circulator pump",
    weightLbs: 38,
    note: "Common swap pump on the truck. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "heater-parts",
    name: "Heater / salt-cell service parts",
    weightLbs: 16,
    note: "Igniters, sensors, and a spare salt cell. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "tile-acid-kit",
    name: "Tile / acid-wash kit (labeled, split)",
    weightLbs: 18,
    note: "Acid kept in separate containment from oxidizers. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "o-ring-parts-bin",
    name: "O-rings / lids / fittings bin",
    weightLbs: 10,
    note: "Pump lids, o-rings, and unions. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "vacuum-cart",
    name: "Vacuum cart / caddy",
    weightLbs: 22,
    note: "Wheeled caddy for hose and head. Weight is a Sep 2026 estimate.",
  }),
];

export const BATTERY_LAWN_KIT = [
  kitItem({
    id: "battery-mower",
    name: "Walk-behind battery mower (EGO 21 in LM2135SP)",
    weightLbs: EGO_MOWER_LB,
    weightSource: "fact",
    note: "EGO LM2135SP — 62.5 lb. Biggest landscape payload with the battery bank and trailer GVWR.",
  }),
  kitItem({
    id: "lawn-pack-chargers",
    name: "Battery mower pack chargers",
    watts: 1800,
    typicalHours: 3,
    weightLbs: 18,
    note: "Shop or trailer-mounted mower chargers drawing from the truck",
  }),
  kitItem({
    id: "ope-hand-chargers",
    name: "Hand-tool chargers (blower / trimmer / edger packs)",
    watts: 400,
    typicalHours: 2.5,
    weightLbs: 12,
    note: "Handheld outdoor-power pack chargers",
  }),
  kitItem({
    id: "extra-battery-packs",
    name: `Battery bank (8 × EGO 56V 10Ah BA5600T)`,
    weightLbs: EGO_BANK_LB,
    weightSource: "fact",
    note: `8 × 7.72 lb EGO BA5600T = ${EGO_BANK_LB} lb. Swap packs for a full crew day.`,
  }),
  kitItem({
    id: "handheld-ope-kit",
    name: "Blowers / trimmers / edgers",
    weightLbs: 55,
    note: "Kit presence for handheld OPE on the truck or trailer. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "crew-trailer",
    name: "Crew trailer (2,990 lb GVWR, loaded)",
    trailerWeightLbs: CREW_TRAILER_GVWR_LB,
