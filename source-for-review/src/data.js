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
