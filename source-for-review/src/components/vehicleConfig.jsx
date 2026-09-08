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
