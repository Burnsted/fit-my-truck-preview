export const FONTS = "@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Poppins:wght@900&family=Permanent+Marker&display=swap');";

export const BG = "#E7F7FB", PANEL = "#FFFFFF", BORDER = "#AEDCEA", AMBER = "#0077B6", RUST = "#B03A1F",
  OLIVE = "#22A559", PAPER = "#0F2A24", MUTED = "#5A7D77", TEXT = "#2E5651", TEAL = "#0E7C86";
export const ZONE_MID = "#0077B6";

export const PANEL_GRADIENT = "linear-gradient(155deg, #FFFFFF 0%, #D3F3E0 100%)";
export const DIAL_GRADIENT_STOPS = { center: "#D6F0FA", edge: "#B0601E" };
export const DATA_LAST_REVIEWED = "August 2026";

export const zoneColor = (s) => (s < 40 ? RUST : s < 70 ? ZONE_MID : OLIVE);
