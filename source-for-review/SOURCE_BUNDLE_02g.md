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
    weightLbs: 22,
    note: "Aluminum wrenches and a press tool. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "plumbing-torch",
    name: "Torch / solder kit",
    weightLbs: 10,
    note: "MAPP torch and solder. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "toilet-parts",
    name: "Toilet / faucet parts bin",
    weightLbs: 24,
    note: "Fills, flappers, cartridges. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "pex-copper-coil",
    name: "PEX / copper coil (day-load)",
    weightLbs: 28,
    note: "Short coils for repairs. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "wet-vac",
    name: "Wet vac",
    watts: 1000,
    typicalHours: 1,
    weightLbs: 20,
    note: "Truck-powered wet vac for floods and cut-ins",
  }),
  kitItem({
    id: "inspection-camera",
    name: "Inspection camera",
    watts: 40,
    typicalHours: 1,
    weightLbs: 8,
    note: "Sewer camera head and reel stub. Weight is a Sep 2026 estimate.",
  }),
  STEP_LADDER_6,
  TOOL_BAG,
  kitItem({
    id: "plumbing-water-jug",
    name: "Freshwater jug (5 gal)",
    weightLbs: Math.round(5 * WATER_LB_PER_GAL + 3),
    weightSource: "fact",
    note: `5 gal × ${WATER_LB_PER_GAL} lb/gal + jug tare.`,
  }),
  kitItem({
    id: "fitting-bin",
    name: "Fitting / valve bin",
    weightLbs: 20,
    note: "Valves, unions, and adapters. Weight is a Sep 2026 estimate.",
  }),
];

export const PEST_CONTROL_KIT = [
  CORDLESS_CHARGERS,
  kitItem({
    id: "sprayer-tank",
    name: "25-gal spray tank (filled)",
    watts: 120,
    typicalHours: 2,
    weightLbs: PEST_TANK_LB,
    weightSource: "fact",
    note: `${PEST_TANK_GAL} gal × ${WATER_LB_PER_GAL} lb/gal + ${PEST_TANK_TARE_LB} lb tank tare. Spray-tank gallons are the pest payload driver.`,
  }),
  kitItem({
    id: "pest-chemical-jugs",
    name: "Chemical jugs (day-load)",
    weightLbs: 35,
    note: "Labeled jugs in secondary containment. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "bait-stations",
    name: "Bait stations / applicators",
    weightLbs: 15,
    note: "Stations, dusters, and handheld applicators",
  }),
  kitItem({
    id: "backpack-sprayer",
    name: "Backpack sprayer (4 gal filled)",
    weightLbs: Math.round(4 * WATER_LB_PER_GAL + 8),
    weightSource: "fact",
    note: `4 gal × ${WATER_LB_PER_GAL} lb/gal + sprayer tare.`,
  }),
  kitItem({
    id: "duster",
    name: "Duster / granular spreader",
    weightLbs: 8,
    note: "Handheld duster and granules. Weight is a Sep 2026 estimate.",
  }),
  STEP_LADDER_6,
  kitItem({
    id: "inspection-lights",
    name: "Inspection lights",
    watts: 40,
    typicalHours: 2,
    weightLbs: 4,
    note: "Headlamps and inspection lights charged from the truck",
  }),
  kitItem({
    id: "rodent-traps",
    name: "Rodent stations / traps",
    weightLbs: 18,
    note: "Stations and snap traps. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "pest-ppe",
    name: "PPE / respirator crate",
    weightLbs: 12,
    note: "Respirators, gloves, and coveralls. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "pest-hose-reel",
    name: "Hose / reel",
    weightLbs: 16,
    note: "Spray hose and reel. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "mixing-jugs",
    name: "Mixing / measuring jugs",
    weightLbs: 8,
    note: "Labeled measuring jugs. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "spare-nozzles",
    name: "Spare nozzles / tips",
    weightLbs: 3,
    note: "Tip kit. Weight is a Sep 2026 estimate.",
  }),
  TOOL_BAG,
];

export const PRESSURE_WASHING_KIT = [
  kitItem({
    id: "pressure-washer",
    name: "Pressure washer",
    watts: 1800,
    typicalHours: 2,
    weightLbs: 85,
    note: "Truck-powered electric washer, or gas unit as payload only",
  }),
  kitItem({
    id: "pw-hose-reel",
    name: "Hose / reel",
    weightLbs: 35,
    note: "Pressure hose and reel — payload, not electrical",
  }),
  kitItem({
    id: "surface-cleaner",
    name: "Surface cleaner",
    weightLbs: 25,
    note: "Walk-behind deck/drive cleaner head",
  }),
  kitItem({
    id: "freshwater-tote",
    name: "Freshwater tote",
    weightLbs: Math.round(25 * WATER_LB_PER_GAL + 10),
    weightSource: "fact",
    note: `25 gal × ${WATER_LB_PER_GAL} lb/gal + tote tare. Onboard when a spigot is not available.`,
  }),
  kitItem({
    id: "pw-tips",
    name: "Tips / nozzles kit",
    weightLbs: 4,
    note: "Spare tips for the wand. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "pw-detergent",
    name: "Detergent / chemical jugs",
    weightLbs: 24,
    note: "Labeled soaps in secondary containment. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "extension-wand",
    name: "Extension wand",
    weightLbs: 8,
    note: "Second-story wand. Weight is a Sep 2026 estimate.",
  }),
  STEP_LADDER_8,
  kitItem({
    id: "pw-wet-vac",
    name: "Wet vac",
    watts: 1000,
    typicalHours: 1,
    weightLbs: 20,
    note: "Pickup after a wash. Truck-powered.",
  }),
  kitItem({
    id: "pw-spare-pump",
    name: "Spare pump / unloader",
    weightLbs: 22,
    note: "Service spare. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "pw-brushes",
    name: "Brush set",
    weightLbs: 10,
    note: "Soft and stiff wash brushes. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "recovery-mat",
    name: "Recovery mat / berm",
    weightLbs: 14,
    note: "Runoff control. Weight is a Sep 2026 estimate.",
  }),
  SAFETY_PPE,
  kitItem({
    id: "pw-extra-hose",
    name: "Extra pressure hose",
    weightLbs: 18,
    note: "Spare 50-ft section. Weight is a Sep 2026 estimate.",
  }),
];

export const IRRIGATION_KIT = [
  CORDLESS_CHARGERS,
  kitItem({
    id: "irrigation-heads-valves",
    name: "Heads / valves / boxes (day-load)",
    weightLbs: 35,
    note: "Common rotors, sprays, and valve boxes",
  }),
  kitItem({
    id: "irrigation-pipe",
    name: "Poly / PVC pipe sticks",
    weightLbs: 50,
    note: "Short sticks for repairs — not a trench trailer. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "valve-wire",
    name: "Valve wire spool",
    weightLbs: 18,
    note: "Low-voltage wire for valve replacements",
  }),
  kitItem({
    id: "solenoid-bag",
    name: "Solenoids / rebuild kit",
    weightLbs: 8,
    note: "Common valve solenoids. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "irrigation-controller",
    name: "Controller / decoder (spare)",
    weightLbs: 6,
    note: "Spare residential controller. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "irrigation-shovels",
    name: "Shovels / probe bar",
    weightLbs: 18,
    note: "Dig kit for valve and head repairs. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "glue-primer",
    name: "Glue / primer / cutter kit",
    weightLbs: 8,
    note: "PVC glue, primer, and cutters. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "irrigation-fittings",
    name: "Fitting bin",
    weightLbs: 16,
    note: "Tees, ells, and adapters. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "valve-boxes",
    name: "Valve boxes (day-load)",
    weightLbs: 20,
    note: "A few boxes for replacements. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "poly-roll",
    name: "Poly roll (short)",
    weightLbs: 22,
    note: "Short poly for laterals — not a trench trailer. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "wire-locator",
    name: "Wire locator",
    watts: 20,
    typicalHours: 1,
    weightLbs: 6,
    note: "Valve-wire locator. Weight is a Sep 2026 estimate.",
  }),
  STEP_LADDER_6,
  TOOL_BAG,
];

export const CONSTRUCTION_KIT = [
  CORDLESS_CHARGERS,
  TOOL_BAG,
  STEP_LADDER_6,
  STEP_LADDER_8,
  JOBSITE_INVERTER,
  WORK_LIGHTS,
  COMPRESSOR,
  SHOP_VAC,
  SAFETY_PPE,
  FASTENER_BIN,
  SPARE_PARTS_TOTE,
  kitItem({
    id: "circular-saw",
    name: "Circular / chop saw",
    watts: 1400,
    typicalHours: 1,
    weightLbs: 22,
    note: "Truck-powered saw for cut-downs. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "lumber-day-load",
    name: "Lumber / sheet-good day-load",
    weightLbs: 80,
    note: "A few boards or a sheet — not a lumber-yard run. Weight is a Sep 2026 estimate.",
  }),
  kitItem({
    id: "drywall-mud",
    name: "Drywall / mud / tape",
    weightLbs: 55,
    note: "Punch-list mud and tape. Weight is a Sep 2026 estimate.",
  }),
  EXTENSION_CORD_REEL,
];

const TRADE_KITS_BY_ID = {
  electrician: ELECTRICIAN_KIT,
  "pool-service": POOL_SERVICE_KIT,
  "battery-lawn": BATTERY_LAWN_KIT,
  hvac: HVAC_KIT,
  plumbing: PLUMBING_KIT,
  "pest-control": PEST_CONTROL_KIT,
  "pressure-washing": PRESSURE_WASHING_KIT,
  irrigation: IRRIGATION_KIT,
};

const TRADE_KITS_BY_NAME = {
  HVAC: HVAC_KIT,
  Plumbing: PLUMBING_KIT,
  "Pest Control": PEST_CONTROL_KIT,
  "Pressure Washing / Exterior Cleaning": PRESSURE_WASHING_KIT,
  "Irrigation Contractor": IRRIGATION_KIT,
};

function kitForTrade(trade) {
  return TRADE_KITS_BY_ID[trade.id] ?? TRADE_KITS_BY_NAME[trade.name] ?? GENERIC_FIELD_SERVICE_KIT;
}

function defaultEquipmentIds(kit, preferredIds) {
  const allowed = new Set(kit.map((item) => item.id));
  const fromPreferred = (preferredIds ?? []).filter((id) => allowed.has(id));
  if (fromPreferred.length) return fromPreferred;
  return kit.slice(0, Math.min(2, kit.length)).map((item) => item.id);
}

function withTradeKit(trade) {
  const equipmentOptions = kitForTrade(trade);
  const base = trade.defaults ?? GENERIC_TRADE_DEFAULTS;
  return {
    ...trade,
    equipmentOptions,
    showsBedAccessories: bedAccessoriesRelevant(trade),
    defaults: {
      dailyMiles: base.dailyMiles ?? GENERIC_TRADE_DEFAULTS.dailyMiles,
      stops: base.stops ?? GENERIC_TRADE_DEFAULTS.stops,
      payloadWeight: base.payloadWeight ?? GENERIC_TRADE_DEFAULTS.payloadWeight,
      trailerWeight: base.trailerWeight ?? GENERIC_TRADE_DEFAULTS.trailerWeight,
      equipmentIds: defaultEquipmentIds(equipmentOptions, base.equipmentIds),
    },
  };
}

// Research / score library — keep the full 80+ catalog. The Workday dropdown
// does not list these; MAJOR_TRADES maps buckets onto library profiles.
const TRADES_RAW = [
  // Convertibility score = a generalized fit estimate from duty-cycle pattern (predictable
  // local routes, return-to-depot, moderate payload = high; long-haul/remote/heavy = lower).
  // Modeled/estimated, not per-trade empirical data — grounded in Geotab's real-world finding
  // (404,652-vehicle study: 76% duty-cycle-capable, 45% capable AND economically favorable).
  {
    id: "pool-service",
    name: "Pool Service",
    score: 96,
    featured: true,
    defaults: {
      dailyMiles: 72,
      stops: 12,
      payloadWeight: 450,
      trailerWeight: 0,
