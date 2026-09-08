              <li key={item} className="text-[#2E5651] text-xs leading-relaxed">— {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <EyebrowBanner>Results — kept separate on purpose</EyebrowBanner>
      <div className="space-y-6 border p-6 mb-8" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
        <ScoreBar score={Math.max(0, Math.min(100, assessment.fitScore))} label="Capability Fit" />
        <ScoreBar score={economics.score} label="Economic Benefit" />
      </div>
      <p className="text-[#5A7D77] text-xs leading-relaxed -mt-4 mb-8 max-w-lg">
        Capability Fit: can this truck physically do the job. Economic Benefit: does switching actually save money. A truck can score high on one and low on the other — that's a real, useful answer, not a bug.
      </p>

      <div className="border p-6 mb-8" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[11px] uppercase tracking-wide mb-1">{mode === "recreation" ? "Same play day, other trucks" : "Same workday, other trucks"}</div>
        <p className="text-[#5A7D77] text-xs leading-relaxed mb-4">Tap a row to try that truck against the day you entered. Other trucks use their most efficient recommended build.</p>
        <div className="space-y-2">
          {comparisons.map(({ vehicle, assessment: row }) => {
            const active = vehicle.id === vehicleId;
            const rowColor = ratingColor(row.rating);
            return (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => onSelectVehicle(vehicle.id)}
                className="w-full flex items-center justify-between gap-3 p-3 border text-left"
                style={{ borderColor: active ? AMBER : BORDER, backgroundColor: active ? "#D6F0FA" : PANEL }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <VehiclePhoto vehicle={vehicle} className="w-16 h-12 rounded-md object-cover border flex-shrink-0" />
                  <div className="min-w-0">
                    <div style={{ fontFamily: "'Oswald', sans-serif", color: PAPER }} className="text-sm font-semibold uppercase truncate">{vehicle.make} {vehicle.model}</div>
                    <div className="text-[10px] uppercase tracking-wide mt-0.5">
                      {row.rating === "good" ? (
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: rowColor }}>{fitLabel(row.ratingLabel, mode)}</span>
                      ) : (
                        <FitWhyTrigger
                          compact
                          label={fitLabel(row.ratingLabel, mode)}
                          reasons={row.whyReasons ?? row.notAFitReasons}
                          docks={row.fitDocks?.docks ?? []}
                          color={rowColor}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", color: zoneColor(row.fitScore) }} className="text-sm font-semibold">{row.fitScore}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[9px]">{row.reserve.pct}% reserve</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border p-6 mb-8" style={{ borderColor: BORDER, backgroundColor: "#D3F3E0" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[11px] uppercase tracking-wide mb-3">Assumptions and limitations</div>
        <ul className="space-y-1.5">
          {assessment.assumptions.map((item) => (
            <li key={item} className="text-[#5A7D77] text-[11px] leading-relaxed">— {item}</li>
          ))}
        </ul>
      </div>
    </>
  );
}


======== FILE: src/components/brand.jsx ========
import { Wrench } from "lucide-react";
import { AMBER, OLIVE, PAPER } from "../theme";

export function FTMYLogo({ size = 36 }) {
  return (
    <div style={{ position: "relative", fontFamily: "'Poppins', sans-serif", fontWeight: 900, lineHeight: 0.82, letterSpacing: "-0.06em" }}>
      {/* faint lightning-bolt watermark behind the mark, for depth and the electrification cue */}
      <svg viewBox="0 0 40 50" style={{ position: "absolute", left: "28%", top: "-35%", width: size * 0.9, height: size * 1.25, opacity: 0.18, zIndex: 0 }}>
        <path d="M24,0 L6,28 L17,28 L11,50 L36,18 L23,18 Z" fill={OLIVE} />
      </svg>
      <div style={{ display: "flex", position: "relative", zIndex: 1, filter: "drop-shadow(0 1.5px 1px rgba(15,42,36,0.25))" }}>
        <span style={{ fontSize: size, color: AMBER }}>F</span>
        <span style={{ fontSize: size, color: OLIVE, marginLeft: size * -0.075 }}>T</span>
      </div>
      <span
        style={{
          fontFamily: "'Permanent Marker', cursive", color: "#F5B400", WebkitTextStroke: `1px ${PAPER}`,
          position: "absolute", left: "2%", top: "42%", fontSize: size * 0.55, transform: "rotate(-3deg)",
          zIndex: 2, filter: "drop-shadow(0 1px 1.5px rgba(15,42,36,0.45))",
        }}
      >
        MY
      </span>
    </div>
  );
}

export function TruckOutfitMark() {
  return (
    <div className="relative w-14 h-10 flex-shrink-0">
      <svg viewBox="0 0 64 36" className="w-full h-full">
        <defs>
          <linearGradient id="truckFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#D6F0FA" />
          </linearGradient>
          <linearGradient id="truckGlass" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#AEDCEA" /><stop offset="100%" stopColor="#7FC3DE" />
          </linearGradient>
        </defs>
        <ellipse cx="31" cy="31.5" rx="27" ry="2.2" fill="#0F2A24" opacity="0.12" />
        {/* topper / cap over the bed — the "outfitting" detail */}
        <rect x="26" y="6.5" width="30" height="10.5" rx="2.5" fill="none" stroke={AMBER} strokeWidth="1.5" strokeDasharray="2.5 2" />
        {/* truck body */}
        <path
          d="M3,27 L3,22.5 Q3,20 5.5,20 L8,20 L13,9.5 Q13.8,8.5 15,8.5 L24,8.5 Q25,8.5 25,9.5 L25,17 L56,17 Q58,17 58,19 L58,27 Z"
          fill="url(#truckFill)" stroke={PAPER} strokeWidth="1.6" strokeLinejoin="round"
        />
        {/* windshield */}
        <path d="M13.6,10 L15.2,9.3 L23.2,9.3 L23.2,16.2 L10.6,16.2 Z" fill="url(#truckGlass)" opacity="0.85" />
        {/* door seam + mirror, subtle detail */}
        <line x1="19" y1="17" x2="19" y2="27" stroke={PAPER} strokeWidth="0.6" opacity="0.35" />
        <path d="M8,17.5 L6,16.8 L6.2,19 Z" fill={PAPER} opacity="0.6" />
        {/* wheels */}
        {[13, 48].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="27" r="4.6" fill={PAPER} />
            <circle cx={cx} cy="27" r="2.6" fill="url(#truckFill)" />
            <line x1={cx - 1.6} y1="27" x2={cx + 1.6} y2="27" stroke={PAPER} strokeWidth="0.6" />
            <line x1={cx} y1="25.4" x2={cx} y2="28.6" stroke={PAPER} strokeWidth="0.6" />
          </g>
        ))}
      </svg>
      <div
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
        style={{ backgroundImage: `linear-gradient(135deg, ${AMBER} 0%, ${OLIVE} 100%)` }}
      >
        <Wrench className="w-3 h-3" style={{ color: "#FCF6E4" }} strokeWidth={2.5} />
      </div>
    </div>
  );
}


======== FILE: src/components/ui.jsx ========
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
