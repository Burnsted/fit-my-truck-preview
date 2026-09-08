import { ChevronDown, RefreshCw } from "lucide-react";
import {
  AMBER, MUTED, OLIVE, PANEL_GRADIENT, RUST, ZONE_MID, zoneColor,
} from "../theme";

export function RefreshResultsButton({ onClick, label = "Refresh results" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex items-center justify-center min-h-10 min-w-10 border"
      style={{ borderColor: AMBER, color: AMBER, backgroundColor: "transparent" }}
    >
      <RefreshCw className="w-4 h-4" />
    </button>
  );
}

export function ClearAllButton({ onClick, disabled, label = "Clear all" }) {
  if (disabled) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{ fontFamily: "'JetBrains Mono', monospace", color: AMBER }}
      className="text-[10px] uppercase tracking-wide min-h-10 px-2"
    >
      Clear all
    </button>
  );
}

export function StartChargeControl({
  value,
  onChange,
  min = 10,
  max = 100,
  hint,
}) {
  const apply = (raw) => {
    const next = Number(raw);
    if (!Number.isFinite(next)) return;
    onChange(Math.min(max, Math.max(min, Math.round(next))));
  };
  return (
    <div data-testid="start-charge-control">
      <div className="flex justify-between mb-2">
        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[11px] uppercase tracking-wide">Starting charge</span>
        <span data-testid="start-charge-value" style={{ fontFamily: "'JetBrains Mono', monospace", color: AMBER }} className="text-sm font-semibold">{value}%</span>
      </div>
      <input
        aria-label="Starting charge"
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => apply(event.target.value)}
        className="w-full accent-[#0077B6]"
      />
      <div className="flex items-center gap-2 mt-2">
        <input
          type="number"
          aria-label="Starting charge percent"
          min={min}
          max={max}
          inputMode="numeric"
          value={value}
          onChange={(event) => apply(event.target.value)}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          className="w-20 bg-[#E7F7FB] border border-[#AEDCEA] text-[#0F2A24] text-sm px-2 py-1 focus:outline-none focus:border-[#0077B6]"
        />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px]">%</span>
      </div>
      {hint && <p className="text-[#5A7D77] text-xs leading-relaxed mt-2">{hint}</p>}
    </div>
  );
}

export function MiniField({ label, value, onChange, suffix, min = 0, max }) {
  return (
    <div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide mb-1">{label}</div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          inputMode="decimal"
          aria-label={label}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (Number.isFinite(next)) onChange(Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min, next)));
          }}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          className="w-full bg-[#E7F7FB] border border-[#AEDCEA] text-[#0F2A24] text-sm px-2 py-1 focus:outline-none focus:border-[#0077B6]"
        />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px]">{suffix}</span>
      </div>
    </div>
  );
}

export function CategorySelect({ label, options, value, onChange, color }) {
  const zoneColorFor = (s) => (s < 40 ? RUST : s < 70 ? ZONE_MID : OLIVE);
  const savingsBandFor = (s) => {
    if (s >= 93) return "$2,500–$5,000/yr typical";
    if (s >= 85) return "$2,000–$4,500/yr typical";
    if (s >= 75) return "$1,500–$3,500/yr, duty-cycle dependent";
    return "Highly conditional — model your specific route before assuming savings";
  };
  return (
    <div className="relative">
      <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide mb-1.5">{label}</div>
      <div className="relative">
        <select
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ fontFamily: "'Oswald', sans-serif", borderColor: color, backgroundImage: PANEL_GRADIENT, color: "#0F2A24" }}
          className="w-full appearance-none border-2 text-sm font-semibold uppercase tracking-wide px-4 py-3 pr-10 focus:outline-none"
        >
          {(() => {
            const optionLabel = (o) => {
              if (typeof o !== "object") return o;
              if (o.hasConvertibilityScore === false || o.score == null) return o.name;
              return `${o.name} — ${o.score}% Fit`;
            };
            const optionValue = (o) => (typeof o === "object" ? o.name : o);
            const featured = options.filter((o) => typeof o === "object" && o.featured);
            const rest = options.filter((o) => typeof o !== "object" || !o.featured);
            const renderOpts = (list) => list.map((o) => <option key={optionValue(o)} value={optionValue(o)}>{optionLabel(o)}</option>);
            if (options.length <= 10 || featured.length === 0) return renderOpts(options);
            return (
              <>
                <optgroup label="Starting profiles">{renderOpts(featured)}</optgroup>
                <optgroup label="More trades">{renderOpts(rest)}</optgroup>
              </>
            );
          })()}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color }} />
      </div>
      {typeof options[0] === "object" && (() => {
        const selected = options.find((o) => o.name === value);
        if (!selected) return null;
        if (selected.hasConvertibilityScore === false || selected.score == null) {
          return (
            <div className="mt-1.5" data-testid="trade-convertibility">
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[9px] uppercase tracking-wide">
                No assumed convertibility score for a typed trade
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[9px] mt-0.5">
                Enter your day, kit, and miles below — amounts recalculate live. Generalized savings bands are not applied here.
              </div>
            </div>
          );
        }
        return (
          <div className="mt-1.5" data-testid="trade-convertibility">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: zoneColorFor(selected.score) }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[9px] uppercase tracking-wide">
                {selected.score}% general convertibility fit for this trade
              </span>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[9px] mt-0.5 pl-3.5">
              Generalized savings band: {savingsBandFor(selected.score)} — a starting estimate, not this business's number. Enter your own numbers below to personalize it.
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export function EyebrowBanner({ children, color = AMBER }) {
  return (
    <div
      style={{ fontFamily: "'JetBrains Mono', monospace", backgroundImage: `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`, color: "#FCF6E4" }}
      className="text-xs uppercase tracking-[0.25em] mb-4 inline-block px-3 py-1.5"
    >
      {children}
    </div>
  );
}

export function ScoreBar({ score, label }) {
  const color = zoneColor(score);
  return (
    <div>
      <div className="flex items-end justify-between mb-2">
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
