    id: "lightning", make: "Ford", model: "F-150 Lightning", baseRange: 320, capScore: 87, towing: 10000, payload: 2000, price: 41000,
    firstAvailableYear: 2022, kwhPer100Miles: 48,
    ...yearShot("lightning", 2022, "Elise240SX", "CC BY-SA 4.0", "2022_Ford_F-150_Lightning_Lariat_in_Atlas_Blue_Metallic,_Front_Right,_08-06-2022.jpg"),
    yearImages: {
      2022: yearShot("lightning", 2022, "Elise240SX", "CC BY-SA 4.0", "2022_Ford_F-150_Lightning_Lariat_in_Atlas_Blue_Metallic,_Front_Right,_08-06-2022.jpg"),
      2023: yearShot("lightning", 2023, "Corqe", "CC0", "2023_Denver_Auto_Show_Ford_F-150_Lightning_front_left_quarter.jpg"),
      2024: yearShot("lightning", 2024, "Charles from Port Chester, New York", "CC BY 2.0", "Ford_F-150_Lightning_Platinum_(2024)_(53621481713).jpg"),
      2025: yearShot("lightning", 2025, "Bull-Doser", "Public domain", "Ford_F-150_Lightning_Valkrie_au_Salon_auto_Lanaudière_2025.jpg"),
      2026: yearShot("lightning", 2026, "Bull-Doser", "Public domain", "2026_Ford_F-150_Lightning_au_SIAM_2026.jpg"),
    },
  },
  {
    id: "silveradoev", make: "Chevrolet", model: "Silverado EV", baseRange: 450, capScore: 84, towing: 10000, payload: 1200, price: 52000,
    firstAvailableYear: 2024, kwhPer100Miles: 51,
    ...yearShot("silveradoev", 2024, "Elise240SX", "CC BY-SA 4.0", "2024_Chevrolet_Silverado_EV_4WT_AWD_in_Summit_White,_front_left,_2024-06-30.jpg"),
    yearImages: {
      2024: yearShot("silveradoev", 2024, "Elise240SX", "CC BY-SA 4.0", "2024_Chevrolet_Silverado_EV_4WT_AWD_in_Summit_White,_front_left,_2024-06-30.jpg"),
      2025: yearShot("silveradoev", 2025, "Bull-Doser", "Public domain", "2025_Chevrolet_Silverado_EV_au_salon_auto_Lanaudière_2025.JPG"),
      2026: yearShot("silveradoev", 2026, "Bull-Doser", "Public domain", "2026_Chevrolet_Silverado_EV_au_SIAM_2026.jpg"),
    },
  },
  {
    id: "sierraev", make: "GMC", model: "Sierra EV", baseRange: 440, capScore: 82, towing: 9500, payload: 1290, price: 53000,
    firstAvailableYear: 2024, kwhPer100Miles: 52,
    ...yearShot("sierraev", 2024, "Wlb5V", "CC BY-SA 4.0", "2024_GMC_Sierra_EV_Denali.jpg"),
    yearImages: {
      2024: yearShot("sierraev", 2024, "Wlb5V", "CC BY-SA 4.0", "2024_GMC_Sierra_EV_Denali.jpg"),
      2025: yearShot("sierraev", 2025, "MercurySable99", "CC BY-SA 4.0", "2025_GMC_Sierra_EV_Extended_Range_Denali,_front_right,_05-04-2025.jpg"),
      2026: yearShot("sierraev", 2026, "HJUdall", "CC0", "26_GMC_Sierra_EV_Elevation.jpg"),
    },
  },
  {
    id: "hummerev", make: "GMC", model: "Hummer EV Pickup", baseRange: 329, capScore: 75, towing: 7500, payload: 1300, price: 79000,
    firstAvailableYear: 2022, kwhPer100Miles: 64,
    ...yearShot("hummerev", 2022, "Ethan Llamas", "CC BY-SA 4.0", "GMC_Hummer_EV_Pickup_Edition_1_Interstellar_White.jpg"),
    yearImages: {
      2022: yearShot("hummerev", 2022, "Ethan Llamas", "CC BY-SA 4.0", "GMC_Hummer_EV_Pickup_Edition_1_Interstellar_White.jpg"),
      2023: yearShot("hummerev", 2023, "John Bauld from Toronto, Canada", "CC BY 2.0", "Hummer_EV_(52694929216).jpg"),
      2024: yearShot("hummerev", 2024, "Elise240SX", "CC BY-SA 4.0", "2024_GMC_Hummer_EV_Pickup_2X_4WD_Sport_Package_in_Meteorite_Metallic,_front_left,_2024-03-31.jpg"),
      2025: yearShot("hummerev", 2025, "ShortlineBuickGMC", "CC BY-SA 4.0", "2025_GMC_Hummer_EV_3X_Pickup_in_Meteorite_Gray.jpg"),
      2026: yearShot("hummerev", 2026, "Kidfly182", "CC BY 4.0", "2026_Chicago_Auto_Show_036.jpg"),
    },
  },
];

// Job-specific vehicle affinity. Landscaping is a crew / work-truck day (trailer + OPE),
// not an adventure-lifestyle day — Silverado EV ranks high, Rivian lands ~60-class.
export const TRADE_VEHICLE_FIT = {
  landscaping: {
    silveradoev: 96,
    sierraev: 90,
    lightning: 84,
    hummerev: 68,
    r1t: 36,
  },
};

export function jobFitForTrade(vehicleId, tradeId) {
  const map = TRADE_VEHICLE_FIT[tradeId];
  if (!map) return null;
  const value = map[vehicleId];
  return Number.isFinite(value) ? value : null;
}

export function resolveVehiclePhoto(vehicle, year) {
  if (!vehicle) return vehicle;
  const clamped = clampVehicleYear(year, vehicle);
  const shot = vehicle.yearImages?.[clamped];
  return shot ? { ...vehicle, ...shot, modelYear: clamped } : { ...vehicle, modelYear: clamped };
}

export function vehicleYearOptions(vehicle) {
  const first = Number(vehicle?.firstAvailableYear) || 2022;
  const last = Number(vehicle?.lastAvailableYear) || CURRENT_MODEL_YEAR;
  const start = Math.min(first, last);
  const end = Math.max(first, last);
  const years = [];
  for (let year = start; year <= end; year += 1) years.push(year);
  return years;
}

export function clampVehicleYear(year, vehicle) {
  const years = vehicleYearOptions(vehicle);
  const numeric = Number.parseInt(String(year), 10);
  if (years.includes(numeric)) return numeric;
  if (!Number.isFinite(numeric)) return years[0];
  if (numeric < years[0]) return years[0];
  return years[years.length - 1];
}

export const SCENE_IMAGES = {
  workday: {
    url: "https://images.unsplash.com/photo-1571986929789-95307bbfa7c2?auto=format&fit=crop&w=1400&q=80",
    alt: "Modern pickup truck parked in open country",
    credit: "Sergio Rota",
    license: "Unsplash License",
    sourceUrl: "https://unsplash.com/photos/parked-black-crew-can-pickup-truck-5saApcjtoaI",
  },
  playday: {
    url: "https://images.unsplash.com/photo-1615383563365-82189c96298d?auto=format&fit=crop&w=1400&q=80",
    alt: "Pickup truck on a snow-covered forest road",
    credit: "via Unsplash",
    license: "Unsplash License",
    sourceUrl: "https://unsplash.com/photos/black-ford-f-150-on-snow-covered-ground-1sOtjZgKfNg",
  },
  fleet: {
    url: "https://images.unsplash.com/photo-1605152322346-bd2391778772?auto=format&fit=crop&w=1400&q=80",
    alt: "White pickup truck in front of a dealership at night",
    credit: "Erik Mclean",
    license: "Unsplash License",
    sourceUrl: "https://unsplash.com/photos/white-ford-f-150-crew-cab-pickup-truck-alqcW58zWmc",
  },
};

export const VEHICLE_CONFIGS = {
  r1t: {
    packs: [{ id: "standard", label: "Standard Pack", rangeMod: -48 }, { id: "large", label: "Large Pack", rangeMod: 0 }, { id: "max", label: "Max Pack", rangeMod: 42 }],
    motors: [{ id: "dual", label: "Dual Motor", effMod: 0 }, { id: "perfdual", label: "Performance Dual", effMod: -0.03 }, { id: "quad", label: "Quad Motor", effMod: -0.08 }, { id: "tri", label: "Tri Motor", effMod: -0.14 }],
    wheels: [
      { id: "21", label: '21" Road', effMod: 0, imageUrl: wheelShot("r1t", "21", '21" Road') },
      { id: "22range", label: '22" Range', effMod: -0.02, imageUrl: wheelShot("r1t", "22range", '22" Range') },
      { id: "22sport", label: '22" Sport', effMod: -0.05, imageUrl: wheelShot("r1t", "22sport", '22" Sport') },
      { id: "20at", label: '20" All-Terrain', effMod: -0.12, imageUrl: wheelShot("r1t", "20at", '20" All-Terrain') },
    ],
    recommended: { pack: "large", motor: "dual", wheel: "21" },
  },
  lightning: {
    packs: [{ id: "standard", label: "Standard Range", rangeMod: -90 }, { id: "extended", label: "Extended Range", rangeMod: 0 }],
    motors: [{ id: "dual", label: "Dual Motor", effMod: 0 }],
    wheels: [
      { id: "18", label: '18" All-Terrain', effMod: 0, imageUrl: wheelShot("lightning", "18", '18" All-Terrain') },
      { id: "20", label: '20" Chrome', effMod: -0.03, imageUrl: wheelShot("lightning", "20", '20" Chrome') },
      { id: "22", label: '22" Premium', effMod: -0.06, imageUrl: wheelShot("lightning", "22", '22" Premium') },
    ],
    recommended: { pack: "extended", motor: "dual", wheel: "18" },
  },
  silveradoev: {
    packs: [{ id: "wt", label: "WT Max Range", rangeMod: 0 }, { id: "rst", label: "RST Performance", rangeMod: -60 }],
    motors: [{ id: "dual", label: "Dual Motor AWD", effMod: 0 }],
    wheels: [
      { id: "18", label: '18" Fleet', effMod: 0, imageUrl: wheelShot("silveradoev", "18", '18" Fleet') },
      { id: "20", label: '20" All-Terrain', effMod: -0.03, imageUrl: wheelShot("silveradoev", "20", '20" All-Terrain') },
      { id: "24", label: '24" Premium', effMod: -0.08, imageUrl: wheelShot("silveradoev", "24", '24" Premium') },
    ],
    recommended: { pack: "wt", motor: "dual", wheel: "18" },
  },
  sierraev: {
    packs: [{ id: "elevation", label: "Elevation", rangeMod: 0 }, { id: "denali", label: "Denali Edition 1", rangeMod: -50 }],
    motors: [{ id: "dual", label: "Dual Motor AWD", effMod: 0 }],
    wheels: [
      { id: "20", label: '20" All-Terrain', effMod: 0, imageUrl: wheelShot("sierraev", "20", '20" All-Terrain') },
      { id: "22", label: '22" Premium', effMod: -0.04, imageUrl: wheelShot("sierraev", "22", '22" Premium') },
      { id: "24", label: '24" Chrome', effMod: -0.07, imageUrl: wheelShot("sierraev", "24", '24" Chrome') },
    ],
    recommended: { pack: "elevation", motor: "dual", wheel: "20" },
  },
  hummerev: {
    packs: [{ id: "standard", label: "Standard Pack", rangeMod: 0 }],
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
