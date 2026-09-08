        <span style={{ fontFamily: "'JetBrains Mono', monospace", color }} className="text-xs uppercase tracking-wide font-semibold">{label}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <span className="text-3xl font-semibold" style={{ color: "#0F2A24" }}>{Math.round(score)}</span>
          <span className="text-sm" style={{ color: MUTED }}> / 100</span>
        </span>
      </div>
      <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: "#AEDCEA" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.max(0, Math.min(100, score))}%`, backgroundImage: `linear-gradient(90deg, ${color}CC 0%, ${color} 100%)` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        {[0, 25, 50, 75, 100].map((t) => (
          <span key={t} style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[9px]">{t}</span>
        ))}
      </div>
    </div>
  );
}


======== FILE: src/components/vehicleConfig.jsx ========
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { VEHICLE_OPTIONS } from "../data";
import {
  AMBER, BORDER, MUTED, OLIVE, PANEL, PANEL_GRADIENT, PAPER, zoneColor,
} from "../theme";
import { FitWhyTrigger, VehicleFitScore } from "./FitWhyBubble";
import { VehiclePhoto } from "./VehiclePhoto";

function scoreOf(vehicle, fitByVehicle) {
  return fitByVehicle?.[vehicle.id]?.score ?? vehicle.capScore;
}

export function SelectedVehicleBar({ selectedId, onSelect, label = "Selected truck", fitByVehicle, year }) {
  const selected = VEHICLE_OPTIONS.find((v) => v.id === selectedId) || VEHICLE_OPTIONS[0];
  return (
    <div className="mb-6">
      <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide mb-1.5">{label}</div>
      {onSelect ? (
        <VehicleDropdown selectedId={selected.id} onSelect={onSelect} fitByVehicle={fitByVehicle} year={year} />
      ) : (
        <div className="flex items-center gap-3 border-2 px-3 py-2.5" style={{ borderColor: AMBER, backgroundImage: PANEL_GRADIENT }}>
          <VehiclePhoto vehicle={selected} year={year} className="w-14 h-10 rounded-md object-cover border" />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif" }} className="text-2xl tracking-wide">{selected.make} {selected.model}</span>
        </div>
      )}
    </div>
  );
}

export function VehicleDropdown({ selectedId, onSelect, fitByVehicle, year }) {
  const [open, setOpen] = useState(false);
  const selected = VEHICLE_OPTIONS.find((v) => v.id === selectedId);
  const ranked = [...VEHICLE_OPTIONS].sort((a, b) => scoreOf(b, fitByVehicle) - scoreOf(a, fitByVehicle));
  const selectedScore = scoreOf(selected, fitByVehicle);

  return (
    <div className="relative flex-1">
      <button aria-expanded={open} aria-haspopup="listbox" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-3 border-2 px-3 sm:px-4 py-2.5" style={{ borderColor: AMBER, backgroundImage: PANEL_GRADIENT }}>
        <span className="flex items-center gap-3 min-w-0">
          <VehiclePhoto vehicle={selected} year={year} eager className="w-14 h-10 rounded-md object-cover border" />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif" }} className="text-2xl md:text-3xl tracking-wide truncate">{selected.make} {selected.model}</span>
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <VehicleFitScore score={selectedScore} color={zoneColor(selectedScore)} vehicleId={selected.id} />
          <ChevronDown className="w-4 h-4" style={{ color: MUTED }} />
        </div>
      </button>
      {open && (
        <div role="listbox" className="absolute z-20 w-full mt-1 border" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
          {ranked.map((v) => {
            const fit = fitByVehicle?.[v.id];
            const score = scoreOf(v, fitByVehicle);
            const needsWhy = fit?.rating === "not-a-fit" || fit?.rating === "conditional";
            return (
              <button key={v.id} role="option" aria-selected={v.id === selectedId} onClick={() => { onSelect(v.id); setOpen(false); }} className="w-full flex items-center justify-between gap-3 px-3 py-2.5 border-b last:border-b-0" style={{ borderColor: BORDER, backgroundColor: v.id === selectedId ? "#D6F0FA" : "transparent" }}>
                <span className="flex items-center gap-3 min-w-0">
                  <VehiclePhoto vehicle={v} year={year} className="w-14 h-10 rounded-md object-cover border" />
                  <span className="min-w-0 text-left">
                    <span style={{ fontFamily: "'Oswald', sans-serif" }} className="block text-sm font-semibold uppercase tracking-wide text-[#0F2A24] truncate">{v.make} {v.model}</span>
                    {needsWhy && (
                      <span className="block mt-0.5">
                        <FitWhyTrigger compact label={fit.ratingLabel} reasons={fit.reasons} docks={fit.docks} />
                      </span>
                    )}
                  </span>
                </span>
                <VehicleFitScore score={score} color={zoneColor(score)} vehicleId={v.id} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function WheelIcon({ chunky, size = 26 }) {
  return (
    <svg viewBox="0 0 26 26" style={{ width: size, height: size }}>
      <circle cx="13" cy="13" r="11.5" fill={chunky ? "#1B1D1A" : "#2E5651"} />
      <circle cx="13" cy="13" r="5.5" fill="#FFFFFF" stroke="#0F2A24" strokeWidth="1" />
      {chunky ? (
        Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <line key={i} x1={13 + Math.cos(a) * 9.5} y1={13 + Math.sin(a) * 9.5} x2={13 + Math.cos(a) * 12} y2={13 + Math.sin(a) * 12} stroke="#F5F0E0" strokeWidth="1.3" />;
        })
      ) : (
        Array.from({ length: 5 }, (_, i) => {
          const a = (i / 5) * Math.PI * 2;
          return <line key={i} x1="13" y1="13" x2={13 + Math.cos(a) * 4.5} y2={13 + Math.sin(a) * 4.5} stroke="#0F2A24" strokeWidth="0.9" />;
        })
      )}
    </svg>
  );
}

export function BatteryPackIcon({ fillPct, size = 26 }) {
  const fillW = 15 * Math.max(0.2, Math.min(1, fillPct));
  return (
    <svg viewBox="0 0 26 26" style={{ width: size, height: size }}>
      <rect x="3" y="8" width="18" height="10" rx="1.5" fill="none" stroke="#0F2A24" strokeWidth="1.4" />
      <rect x="21" y="11" width="2" height="4" rx="0.6" fill="#0F2A24" />
      <rect x="4.5" y="9.5" width={fillW} height="7" rx="0.8" fill={fillPct > 0.7 ? "#22A559" : fillPct > 0.45 ? "#C97F1E" : "#B03A1F"} />
    </svg>
  );
}

export function MotorIcon({ blades, size = 26 }) {
  return (
    <svg viewBox="0 0 26 26" style={{ width: size, height: size }}>
      <circle cx="13" cy="13" r="11" fill="none" stroke="#0F2A24" strokeWidth="1.4" />
      <circle cx="13" cy="13" r="2.6" fill="#0F2A24" />
      {Array.from({ length: blades }, (_, i) => {
        const a = (i / blades) * Math.PI * 2 - Math.PI / 2;
        return (
          <path key={i}
            d={`M13,13 L${13 + Math.cos(a) * 8.5},${13 + Math.sin(a) * 8.5}`}
            stroke="#0077B6" strokeWidth="2.4" strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export function optionIcon(kind, option, allOptions) {
  if (kind === "wheel") {
    const chunky = /All-Terrain|Off-Road|Extreme/i.test(option.label);
    return <WheelIcon chunky={chunky} />;
  }
  if (kind === "pack") {
    const sorted = [...allOptions].sort((a, b) => a.rangeMod - b.rangeMod);
    const rank = sorted.findIndex((o) => o.id === option.id);
    const fillPct = sorted.length > 1 ? (rank / (sorted.length - 1)) * 0.7 + 0.3 : 1;
    return <BatteryPackIcon fillPct={fillPct} />;
  }
  if (kind === "motor") {
    const blades = /Quad/i.test(option.label) ? 4 : /Tri|3X/i.test(option.label) ? 3 : 2;
    return <MotorIcon blades={blades} />;
  }
  return null;
}

export function ConfigGroup({ title, options, selected, onSelect, recommendedId, modKey, format, kind }) {
  const selectedOption = options.find((o) => o.id === selected) || options[0];
  const showWheelPhoto = kind === "wheel" && selectedOption?.imageUrl;

  return (
    <div className="mb-2" data-testid={kind ? `config-group-${kind}` : undefined}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide mb-1">{title}</div>
      <div className={showWheelPhoto ? "flex items-stretch gap-3" : undefined}>
        {showWheelPhoto && (
          <div
            data-testid="wheel-trim-photo"
            className="flex-shrink-0 w-[4.5rem] sm:w-20 border overflow-hidden"
            style={{ borderColor: BORDER, backgroundColor: PANEL }}
          >
            <img
              src={selectedOption.imageUrl}
              alt={selectedOption.label}
              width={160}
              height={160}
              className="w-full h-16 sm:h-20 object-cover block"
            />
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="px-1 py-0.5 text-[8px] uppercase tracking-wide text-center leading-tight">
              {selectedOption.label}
            </div>
          </div>
        )}
        <div
          role="radiogroup"
          aria-label={title}
          className="flex w-full border min-w-0"
          style={{ borderColor: BORDER, backgroundColor: PANEL }}
        >
          {options.map((o, index) => {
            const active = selected === o.id;
            const isRec = o.id === recommendedId;
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSelect(o.id)}
                className="flex-1 min-w-0 min-h-10 px-1 py-1 text-center"
                style={{
                  borderLeft: index === 0 ? "none" : `1px solid ${BORDER}`,
                  backgroundColor: active ? "#D6F0FA" : "transparent",
                  boxShadow: active ? `inset 0 -2px 0 ${AMBER}` : "none",
                }}
              >
                <span style={{ fontFamily: "'Oswald', sans-serif", color: active ? AMBER : PAPER }} className="block text-[11px] font-semibold uppercase leading-tight">
                  {o.label}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: isRec ? OLIVE : MUTED }} className="block text-[8px] leading-tight mt-0.5">
                  {isRec ? "Most efficient" : format(o[modKey])}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


======== FILE: src/data.js ========
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
