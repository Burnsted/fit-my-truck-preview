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
    weightLbs: 40,
    note: "Typical single-axle landscape trailer GVWR. Tow uses 2,990 lb — mower + battery bank ride here.",
  }),
  kitItem({
    id: "hedge-trimmer",
    name: "Hedge trimmer",
    weightLbs: 12,
    note: "Battery hedge trimmer on the truck or trailer. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "walk-behind-blower",
    name: "Walk-behind blower",
    weightLbs: 45,
    note: "Crew walk-behind blower. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "broadcast-spreader",
    name: "Broadcast spreader",
    weightLbs: 28,
    note: "Seed or product spreader, empty. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "debris-bags",
    name: "Debris bags / cans (day-load)",
    weightLbs: 20,
    note: "Empty cans and bags before the route fills them. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "extra-blades",
    name: "Extra mower blades",
    weightLbs: 14,
    note: "Spare blades for the walk-behind. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "lawn-ppe-crate",
    name: "Safety / PPE crate",
    weightLbs: 16,
    note: "Glasses, ear protection, and first-aid. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "rake-shovel-set",
    name: "Rakes / shovels / hand tools",
    weightLbs: 24,
    note: "Long-handle set on the trailer. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "trimmer-line",
    name: "Trimmer line / string",
    weightLbs: 8,
    note: "Bulk line for a crew day. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "crew-water-jugs",
    name: "Crew water jugs (3 gal)",
    weightLbs: Math.round(3 * WATER_LB_PER_GAL + 4),
    weightSource: "fact",
    note: `3 gal × ${WATER_LB_PER_GAL} lb/gal + jug tare. Drinking water, not a cooler.`,
  }),
];

export const HVAC_KIT = [
  CORDLESS_CHARGERS,
  kitItem({
    id: "hvac-recovery-pump",
    name: "Recovery machine / vacuum pump",
    watts: 1000,
    typicalHours: 1.2,
    weightLbs: 48,
    note: "Recovery or evacuation from truck power on changeouts",
  }),
  kitItem({
    id: "refrigerant-jugs",
    name: "Worthington 30-lb cylinders (2-pack day-load)",
    weightLbs: HVAC_CYLINDERS_LB,
    weightSource: "fact",
    note: `2 × (16.9 lb tare + ~25 lb fill). Worthington 30-lb recovery cylinder. Cylinders + recovery are the HVAC payload drivers.`,
  }),
  kitItem({
    id: "hvac-gauge-bag",
    name: "Gauges / torch / coil bag",
    weightLbs: 22,
    note: "Manifold, nitrogen, and coil tools",
  }),
  kitItem({
    id: "nitrogen-tank",
    name: "Nitrogen tank + regulator",
    weightLbs: 28,
    note: "Small nitrogen bottle for pressure tests. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "brazing-kit",
    name: "Torch / brazing kit",
    weightLbs: 18,
    note: "Torch, rods, and tips. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "filter-driers",
    name: "Filter-driers / TXVs (day-load)",
    weightLbs: 12,
    note: "Common changeout parts. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "condensate-pump",
    name: "Condensate pump",
    watts: 80,
    typicalHours: 1,
    weightLbs: 8,
    note: "Spare condensate pump. Small electrical draw if tested from the truck.",
  }),
  kitItem({
    id: "sheet-metal-bag",
    name: "Sheet-metal / flex bag",
    weightLbs: 30,
    note: "Short flex, tape, and hangers. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "thermostat-box",
    name: "Thermostats / controls box",
    weightLbs: 10,
    note: "Stats and low-voltage parts. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "coil-cleaner-jugs",
    name: "Coil cleaner jugs",
    weightLbs: 16,
    note: "Labeled cleaner in secondary containment. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "hvac-capacitors",
    name: "Capacitors / contactors bin",
    weightLbs: 8,
    note: "High-turn service parts. Weight is a Sep 2026 estimate.",
  }),
  STEP_LADDER_8,
  TOOL_BAG,
  kitItem({
    id: "recovery-hoses",
    name: "Recovery hoses / core tools",
    weightLbs: 8,
    note: "Hoses and valve cores. Weight is a Sep 2026 estimate.",
  }),
];

export const PLUMBING_KIT = [
  CORDLESS_CHARGERS,
  kitItem({
    id: "drain-machine",
    name: "Drain machine / power snake",
    watts: 800,
    typicalHours: 1,
    weightLbs: 65,
    note: "Drum snake on the truck. Snake + jetter + WH are the plumbing payload drivers.",
  }),
  kitItem({
    id: "jetter",
    name: "Portable jetter",
    watts: 1500,
    typicalHours: 1,
    weightLbs: 70,
    note: "Electric or gas portable jetter. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "pipe-fitting-day-load",
    name: "Pipe and fitting day-load",
    weightLbs: 80,
    note: "P-traps, supply lines, valves, common copper/PEX. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "water-heater-parts",
    name: "40-gal electric water heater (dry) / WH swap",
    weightLbs: 118,
    note: "Typical 40-gal electric dry weight for a swap day. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "pipe-wrench-set",
    name: "Pipe wrench / press-tool set",
