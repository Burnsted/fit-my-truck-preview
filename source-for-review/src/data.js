// ============================================================
// Shared vehicle + config data
// ============================================================
// Vehicle photos resolve to Wikimedia Commons FilePath URLs so GitHub Pages
// (and any host that cannot ship binary WebP) still renders real pictures.
// Optional local copies under public/vehicles/ stay for offline / Capacitor dev.
export const COMMONS_FILEPATH = "https://commons.wikimedia.org/wiki/Special:FilePath/";

export function commonsFileName(file) {
  return String(file || "").replace(/^File:/i, "").replace(/ /g, "_");
}

export function commonsFilePath(file, width) {
  const name = commonsFileName(file);
  const url = `${COMMONS_FILEPATH}${encodeURIComponent(name)}`;
  return width ? `${url}?width=${width}` : url;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function wheelShot(vehicleId, wheelId, label = wheelId) {
  const chunky = /All-Terrain|Off-Road|Extreme|Fleet/i.test(label);
  const spokes = chunky ? 8 : /24|Premium|Chrome|Sport/i.test(label) ? 7 : 5;
  const hubs = {
    r1t: "#1B3A34",
    lightning: "#16324F",
    silveradoev: "#2A2F33",
    sierraev: "#3A2A12",
    hummerev: "#2C1810",
  };
  const hub = hubs[vehicleId] || "#0F2A24";
  const title = escapeXml(label);
  const spokeLines = Array.from({ length: spokes }, (_, i) => {
    const a = (i / spokes) * Math.PI * 2 - Math.PI / 2;
    const x1 = (80 + Math.cos(a) * 28).toFixed(1);
    const y1 = (80 + Math.sin(a) * 28).toFixed(1);
    const x2 = (80 + Math.cos(a) * 54).toFixed(1);
    const y2 = (80 + Math.sin(a) * 54).toFixed(1);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#F7FBFC" stroke-width="${chunky ? 6 : 3.5}" stroke-linecap="round"/>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" fill="#D6F0FA"/><circle cx="80" cy="80" r="64" fill="${chunky ? "#141816" : hub}"/><circle cx="80" cy="80" r="58" fill="none" stroke="#5A7D77" stroke-width="4"/>${spokeLines}<circle cx="80" cy="80" r="22" fill="#F7FBFC" stroke="#0F2A24" stroke-width="3"/><circle cx="80" cy="80" r="6" fill="${hub}"/><text x="80" y="152" text-anchor="middle" font-size="10" fill="#0F2A24" font-family="ui-sans-serif,sans-serif">${title}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// First model years and EPA combined kWh/100 mi — FACT, representative recommended builds.
// Reviewed September 2026. Sources:
// - R1T 2022 first MY; EPA 2022 Launch Edition Large Pack 21" = 48 kWh/100 mi (fueleconomy.gov)
// - F-150 Lightning 2022 first MY (deliveries spring 2022); EPA 2022 4WD Extended Range = 48 kWh/100 mi
// - Silverado EV 2024 first MY (no 2022/2023); EPA 2024 3WT-class = 51 kWh/100 mi
// - Sierra EV 2024 first MY (Denali Edition 1); EPA 2025 Sierra EV = 52 kWh/100 mi (closest posted label)
// - Hummer EV Pickup 2022 first MY (Edition 1, Dec 2021 deliveries); EPA 2024 3X 22" ~636 Wh/mi → 64 kWh/100 mi
export const CURRENT_MODEL_YEAR = Math.max(2026, new Date().getFullYear());

export const START_CHARGE_MIN = 10;
export const START_CHARGE_MAX = 100;
export const START_CHARGE_DEFAULT = 100;

export function clampStartCharge(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return START_CHARGE_DEFAULT;
  return Math.min(START_CHARGE_MAX, Math.max(START_CHARGE_MIN, Math.round(numeric)));
}

function yearShot(id, year, credit, license, commonsFile) {
  return {
    imageUrl: commonsFilePath(commonsFile, 1280),
    imageThumbUrl: commonsFilePath(commonsFile, 480),
    imageCredit: credit,
    imageLicense: license,
    imageSourceUrl: `https://commons.wikimedia.org/wiki/File:${commonsFileName(commonsFile)}`,
    commonsFile,
    localSlug: `${id}-${year}`,
  };
}

export const VEHICLE_OPTIONS = [
  {
    id: "r1t", make: "Rivian", model: "R1T", baseRange: 328, capScore: 91, towing: 11000, payload: 1764, price: 46000,
    firstAvailableYear: 2022, kwhPer100Miles: 48,
    ...yearShot("r1t", 2022, "Mr.choppers", "CC BY-SA 3.0", "2022_Rivian_R1T_Adventure_in_Forest_Green,_front_left.jpg"),
    yearImages: {
      2022: yearShot("r1t", 2022, "Mr.choppers", "CC BY-SA 3.0", "2022_Rivian_R1T_Adventure_in_Forest_Green,_front_left.jpg"),
      2023: yearShot("r1t", 2023, "Charles from Port Chester, New York", "CC BY 2.0", "Rivian_R1T_(2023)_(53487999620).jpg"),
      2024: yearShot("r1t", 2024, "GoToVan", "CC BY 2.0", "Everything_Electric_Canada_2024_-_53982523915.jpg"),
      2025: yearShot("r1t", 2025, "Bull-Doser", "Public domain", "2025_Rivian_R1T_au_salon_auto_Lanaudière_2025.jpg"),
      2026: yearShot("r1t", 2026, "Phillip Pessar", "CC BY 4.0", "Newly_Open_Rivian_Showroom_Brickell,_Miami_Florida_Sept_2025_-_blue_pickup_front.jpg"),
    },
  },
  {
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
