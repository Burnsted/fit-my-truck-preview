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
      equipmentIds: ["telescoping-pole", "vacuum-head-hose", "leaf-nets-brushes", "chemical-day-load", "salt-bags", "test-kit"],
    },
  },
  { name: "Locksmith", score: 96 },
  {
    id: "pest-control",
    name: "Pest Control",
    score: 96,
    defaults: { dailyMiles: 70, stops: 10, payloadWeight: 500, trailerWeight: 0, equipmentIds: ["hand-tool-chargers", "sprayer-tank", "pest-chemical-jugs"] },
  },
  { name: "Low-Voltage / Data Cabling Contractor", score: 96 },
  { name: "Security System Installer", score: 96 },
  { name: "Home Inspectors", score: 95 },
  { name: "Energy Audit / Home Efficiency", score: 95 },
  { name: "AV / Home Automation Installer", score: 94 },
  { name: "Alarm / Fire-System Inspection", score: 94 },
  { name: "Cable / Internet Installation", score: 94 },
  { name: "Telecommunications Field Service", score: 94 },
  { name: "Apartment / Community Maintenance Fleets", score: 94 },
  {
    id: "hvac",
    name: "HVAC",
    score: 93,
    defaults: { dailyMiles: 65, stops: 6, payloadWeight: 700, trailerWeight: 0, equipmentIds: ["hand-tool-chargers", "hvac-recovery-pump", "refrigerant-jugs"] },
  },
  {
    id: "electrician",
    name: "Electrician",
    score: 93,
    featured: true,
    defaults: {
      dailyMiles: 58,
      stops: 6,
      payloadWeight: 800,
      trailerWeight: 0,
      equipmentIds: ["extension-ladder", "wire-spools", "hand-tool-chargers"],
    },
  },
  { name: "Property Maintenance", score: 93 },
  { name: "Facility Maintenance Contractor", score: 93 },
  { name: "Commercial Property Management", score: 93 },
  { name: "Hotel / Resort Maintenance", score: 93 },
  { name: "Appliance Repair", score: 92 },
  { name: "IT Field-Service Technicians", score: 92 },
  { name: "Access-Control Installers", score: 92 },
  { name: "Medical-Equipment / Pharmaceutical Field Service", score: 92 },
  { name: "Copier / Printer Service", score: 91 },
  { name: "Commercial Kitchen / Restaurant-Equipment Service", score: 91 },
  { name: "Vending-Machine Service", score: 90 },
  { name: "Automatic-Door Service", score: 90 },
  { name: "Real Estate / Property Inspector", score: 90 },
  { name: "Mobile Notary / Courier / Delivery", score: 90 },
  { name: "Small Local Courier / Service Fleet", score: 90 },
  { name: "Parts Delivery / Service Support", score: 89 },
  { name: "Real-Estate Maintenance / Turn Crews", score: 88 },
  {
    id: "plumbing",
    name: "Plumbing",
    score: 88,
    defaults: { dailyMiles: 60, stops: 6, payloadWeight: 700, trailerWeight: 0, equipmentIds: ["hand-tool-chargers", "drain-machine", "jetter", "water-heater-parts"] },
  },
  { name: "HVAC Controls Technicians", score: 88 },
  { name: "Cabinetry / Trim Carpentry", score: 88 },
  { name: "Flooring Installer", score: 88 },
  { name: "Fire-Extinguisher Inspection / Service", score: 88 },
  { name: "Window Installer", score: 87 },
  { name: "Hurricane Shutter Installer", score: 87 },
  { name: "Solar Installation / Service", score: 87 },
  { name: "Sign Installation", score: 87 },
  { name: "Painting Contractor", score: 87 },
  { name: "Tile Contractor", score: 87 },
  {
    id: "irrigation",
