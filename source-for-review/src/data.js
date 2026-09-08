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
