    motors: [{ id: "2x", label: "2X Dual Motor", effMod: 0 }, { id: "3x", label: "3X Tri Motor", effMod: -0.10 }],
    wheels: [
      { id: "18", label: '18" All-Terrain', effMod: 0, imageUrl: wheelShot("hummerev", "18", '18" All-Terrain') },
      { id: "20", label: '20" Off-Road', effMod: -0.03, imageUrl: wheelShot("hummerev", "20", '20" Off-Road') },
      { id: "22", label: '22" Extreme', effMod: -0.06, imageUrl: wheelShot("hummerev", "22", '22" Extreme') },
    ],
    recommended: { pack: "standard", motor: "2x", wheel: "18" },
  },
};

export const CHARGERS = [
  { brand: "ChargePoint", model: "Home Flex", amps: "up to 50A", note: "Adjustable amperage, widely reviewed" },
  { brand: "Emporia", model: "Level 2", amps: "up to 48A", note: "Whole-home energy monitoring built in" },
  { brand: "Grizzl-E", model: "Classic", amps: "up to 40A", note: "Rugged, budget-friendly, strong reliability record" },
];

// Convertibility score = a generalized fit estimate from duty-cycle pattern (predictable local
// routes, return-to-depot, moderate payload = high; long-haul/remote/heavy = lower) — not
// per-trade researched data, consistent with the platform's category-level approach.
//
// DATA NOTE — trade kits (reviewed September 2026)
// Research packet: fit-my-truck-research/trade-equipment-toggles-2026-09-05.md
// (file was not on this VM; FACT weights below are from the named manufacturer sheets).
// No prices. weightSource "fact" = hardcoded mfr/catalog number; "estimate" otherwise.
// FACT:
// - Werner Type IA 300-lb: 6206 6-ft 22 lb, 6208 8-ft 30 lb, 6210 10-ft 39 lb,
//   D6216-2 16-ft ext 36.5 lb, D6224-2 24-ft ext 46 lb (mfr shipping / net wt).
// - Southwire Romex SIMpull NM-B lb/1000 ft: 14/2 61, 12/2 87, 14/3 81, 12/3 115, 10/3 168.
// - EGO LM2135SP mower 62.5 lb; BA5600T 56V 10Ah pack 7.72 lb.
// - Worthington 30-lb recovery cylinder nominal tare 16.9 lb (WC 26.1 lb).
// - Water 8.34 lb/gal for spray tanks, totes, and freshwater.
// Biggest payload drivers: multi-ladder + wire; pool chemicals/salt; mower + battery
// bank + trailer GVWR; HVAC cylinders/recovery; snake/jetter/WH; pest spray-tank gallons.
// Coolers omitted. Pool chemicals are labeled totes with acid↔oxidizer split.
// Kit mass feeds cargoPenalty (~12% at payload rating), separate from watt-hours.

export const WATER_LB_PER_GAL = 8.34;
export const SOUTHWIRE_NM_B_LB_PER_1000 = {
  "14/2": 61,
  "12/2": 87,
  "14/3": 81,
  "12/3": 115,
  "10/3": 168,
};
const WORKING_WIRE_FT = 250;
export const WORKING_WIRE_LB = Math.round(
  Object.values(SOUTHWIRE_NM_B_LB_PER_1000).reduce((sum, lb) => sum + lb, 0) * (WORKING_WIRE_FT / 1000),
);
const WERNER_STEP_6_LB = 22;
const WERNER_STEP_8_LB = 30;
const WERNER_STEP_10_LB = 39;
const WERNER_EXT_16_LB = 36.5;
const WERNER_EXT_24_LB = 46;
const CREW_LADDER_SET_LB = WERNER_STEP_6_LB + WERNER_STEP_8_LB + WERNER_EXT_16_LB + WERNER_EXT_24_LB;
const EGO_MOWER_LB = 62.5;
const EGO_BA5600T_LB = 7.72;
const EGO_BANK_QTY = 8;
const EGO_BANK_LB = Math.round(EGO_BA5600T_LB * EGO_BANK_QTY);
const WORTHINGTON_30_TARE_LB = 16.9;
const WORTHINGTON_30_FILL_LB = Math.round(0.8 * 26.1 * 1.2);
const HVAC_CYLINDER_QTY = 2;
const HVAC_CYLINDERS_LB = Math.round(HVAC_CYLINDER_QTY * (WORTHINGTON_30_TARE_LB + WORTHINGTON_30_FILL_LB));
const POOL_LIQUID_GAL = 8;
const POOL_TOTE_TARE_LB = 8;
const POOL_TOTES_LB = Math.round(POOL_LIQUID_GAL * WATER_LB_PER_GAL + POOL_TOTE_TARE_LB);
const SALT_BAG_LB = 40;
const PEST_TANK_GAL = 25;
const PEST_TANK_TARE_LB = 18;
const PEST_TANK_LB = Math.round(PEST_TANK_GAL * WATER_LB_PER_GAL + PEST_TANK_TARE_LB);
const CREW_TRAILER_GVWR_LB = 2990;

function kitItem(item) {
  return {
    watts: 0,
    typicalHours: 0,
    weightLbs: 0,
    trailerWeightLbs: 0,
    weightSource: "estimate",
    ...item,
  };
}

const CORDLESS_CHARGERS = kitItem({
  id: "hand-tool-chargers",
  name: "Cordless tool kit + chargers",
  watts: 400,
  typicalHours: 2.5,
  weightLbs: 22,
  note: "Drills, drivers, and pack chargers drawing from the truck",
});

const TOOL_BAG = kitItem({
  id: "tool-bag",
  name: "Hand tools / small-parts bag",
  weightLbs: 28,
  note: "Belts, meters, fasteners — leftover field-service cargo",
});

const STEP_LADDER_6 = kitItem({
  id: "step-ladder-6",
  name: "6-ft Type IA step (Werner 6206)",
  weightLbs: WERNER_STEP_6_LB,
  weightSource: "fact",
  note: "Werner 6206 fiberglass Type IA — 22 lb mfr shipping wt.",
});

const STEP_LADDER_8 = kitItem({
  id: "step-ladder-8",
  name: "8-ft Type IA step (Werner 6208)",
  weightLbs: WERNER_STEP_8_LB,
  weightSource: "fact",
  note: "Werner 6208 fiberglass Type IA — 30 lb mfr shipping wt.",
});

const JOBSITE_INVERTER = kitItem({
  id: "jobsite-inverter",
  name: "Jobsite inverter / 120V tools",
  watts: 1500,
  typicalHours: 1.5,
  weightLbs: 16,
  note: "Truck power for saws and vacuums",
});

const WORK_LIGHTS = kitItem({
  id: "work-lights",
  name: "Work lights",
  watts: 250,
  typicalHours: 2,
  weightLbs: 12,
  note: "LED stands or strings",
});

const COMPRESSOR = kitItem({
  id: "compressor",
  name: "Air compressor",
  watts: 1200,
  typicalHours: 1,
  weightLbs: 32,
  note: "Occasional pneumatic work from the truck",
});

const SHOP_VAC = kitItem({
  id: "shop-vac",
  name: "Shop / jobsite vacuum",
  watts: 1000,
  typicalHours: 1,
  weightLbs: 18,
  note: "Truck-powered vac for cut-in and cleanup",
});

const METER_BAG = kitItem({
  id: "meter-bag",
  name: "Meter / tester bag",
  weightLbs: 12,
  note: "Multimeter, tracer, and testers. Weight is a Sep 2026 estimate.",
});

const FASTENER_BIN = kitItem({
  id: "fastener-bin",
  name: "Fastener / hardware bin",
  weightLbs: 22,
  note: "Screws, anchors, and odd-lot hardware. Weight is a Sep 2026 estimate.",
});

const SAFETY_PPE = kitItem({
  id: "safety-ppe",
  name: "Safety / PPE crate",
  weightLbs: 16,
  note: "Glasses, gloves, ear protection, first-aid. Weight is a Sep 2026 estimate.",
});

const SPARE_PARTS_TOTE = kitItem({
  id: "spare-parts-tote",
  name: "Spare-parts tote",
  weightLbs: 20,
  note: "Leftover service parts that stay on the truck. Weight is a Sep 2026 estimate.",
});

const EXTENSION_CORD_REEL = kitItem({
  id: "extension-cord-reel",
  name: "Extension-cord reel",
  weightLbs: 18,
  note: "12-gauge reel for inverter tools. Weight is a Sep 2026 estimate.",
});

const HELPER_BAG = kitItem({
  id: "helper-bag",
  name: "Second tool / helper bag",
  weightLbs: 24,
  note: "Apprentice or helper bag. Weight is a Sep 2026 estimate.",
});

export const GENERIC_FIELD_SERVICE_KIT = [
  CORDLESS_CHARGERS,
  TOOL_BAG,
  STEP_LADDER_6,
  STEP_LADDER_8,
  JOBSITE_INVERTER,
  WORK_LIGHTS,
  COMPRESSOR,
  SHOP_VAC,
  METER_BAG,
  FASTENER_BIN,
  SAFETY_PPE,
  SPARE_PARTS_TOTE,
  EXTENSION_CORD_REEL,
  HELPER_BAG,
];

// Bed accessories — van-to-pickup field-service trades only. Multi-select;
// selected weights and estimated costs stack. Figures are empty-product /
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
