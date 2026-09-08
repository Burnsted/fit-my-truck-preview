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
