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

export const CURRENT_MODEL_YEAR = Math.max(2026, new Date().getFullYear());
export const START_CHARGE_MIN = 10;
export const START_CHARGE_MAX = 100;
export const START_CHARGE_DEFAULT = 100;

export function clampStartCharge(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return START_CHARGE_DEFAULT;
  return Math.min(START_CHARGE_MAX, Math.max(START_CHARGE_MIN, Math.round(numeric)));
}
