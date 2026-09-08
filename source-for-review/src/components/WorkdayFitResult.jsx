import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import {
  AMBER, BORDER, MUTED, OLIVE, PANEL, PANEL_GRADIENT, PAPER, RUST, zoneColor,
} from "../theme";
import { FitWhyTrigger } from "./FitWhyBubble";
import { EyebrowBanner, ScoreBar } from "./ui";
import { VehiclePhoto } from "./VehiclePhoto";

function ratingColor(rating) {
  if (rating === "not-a-fit") return RUST;
  if (rating === "conditional") return AMBER;
  return OLIVE;
}

function RatingIcon({ rating }) {
  const color = ratingColor(rating);
  if (rating === "not-a-fit") return <XCircle className="w-6 h-6 flex-shrink-0" style={{ color }} />;
  if (rating === "conditional") return <AlertCircle className="w-6 h-6 flex-shrink-0" style={{ color }} />;
  return <CheckCircle2 className="w-6 h-6 flex-shrink-0" style={{ color }} />;
}

function fitLabel(label, mode) {
  if (mode !== "recreation") return label;
  return String(label || "").replace(/Workday/g, "Play Day");
}

function Metric({ label, value, hint, color = PAPER }) {
  return (
    <div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", color }} className="text-2xl font-semibold mt-1">{value}</div>
      {hint && <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[9px] mt-0.5">{hint}</div>}
    </div>
  );
}

export function WorkdayFitResult({
  assessment,
  economics,
  vehicleId,
  comparisons,
  onSelectVehicle,
  recommendedNotes,
  mode = "work",
  updatedFlash = false,
}) {
  const color = ratingColor(assessment.rating);
  const reserveColor = assessment.reserve.pct < 0 ? RUST : assessment.reserve.pct < 20 ? AMBER : OLIVE;
  const dayTitle = mode === "recreation" ? "Play Day" : "Workday";
  const ratingLabel = fitLabel(assessment.ratingLabel, mode);

  return (
    <>
      <div id="fit-results" className="scroll-mt-24">
        <EyebrowBanner>
          <span data-testid="day-fit-eyebrow">{dayTitle} Fit</span>
        </EyebrowBanner>
        {updatedFlash && (
          <div data-testid="results-updated" style={{ fontFamily: "'JetBrains Mono', monospace", color: OLIVE }} className="text-[11px] uppercase tracking-wide mb-2">
            Updated
          </div>
        )}
      </div>
      <div className="border p-6 mb-8" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
        <div className="flex items-start gap-3 mb-3">
          <RatingIcon rating={assessment.rating} />
          <div>
            <div className="text-2xl font-semibold uppercase tracking-wide leading-tight">
              {assessment.rating === "good" ? (
                <span style={{ fontFamily: "'Oswald', sans-serif", color }}>{ratingLabel}</span>
              ) : (
                <FitWhyTrigger
                  label={ratingLabel}
                  reasons={assessment.whyReasons ?? assessment.notAFitReasons}
                  docks={assessment.fitDocks?.docks ?? []}
                  color={color}
                />
              )}
            </div>
            <p data-testid="fit-summary" className="text-[#2E5651] text-sm leading-relaxed mt-2">{assessment.summary}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t" style={{ borderColor: BORDER }}>
          <Metric
            label="Driving energy"
            value={`${Math.round((assessment.energy.drivingKwh + assessment.energy.stopKwh) * 10) / 10} kWh`}
            hint={assessment.effectiveRange
              ? `${assessment.effectiveRange} mi real-world after load · ${assessment.energy.drivingKwh} kWh miles + ${assessment.energy.stopKwh} kWh stops`
              : "Miles only — no stop adder"}
          />
          <Metric
            label="Equipment energy"
            value={`${assessment.energy.equipmentKwh} kWh`}
            hint={assessment.energy.kitWeightLbs > 0
              ? `Powered tools plus ~${assessment.energy.kitWeightLbs} lb estimated kit`
              : "Powered tools and chargers drawing from the truck"}
          />
          <Metric
            label="End-of-day reserve"
            value={`${assessment.reserve.pct}%`}
            hint={`${assessment.reserve.miles} mi · ${assessment.reserve.kwh} kWh left`}
            color={reserveColor}
          />
        </div>

        {assessment.concerns.length > 0 && (
          <div className="mt-5">
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide mb-2">Payload / towing</div>
            <ul className="space-y-1.5">
              {assessment.concerns.map((item) => (
                <li key={item} className="text-[#2E5651] text-xs leading-relaxed">{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5">
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide mb-1">Charging needs</div>
          <p className="text-[#2E5651] text-xs leading-relaxed">{assessment.chargingNeeds}</p>
        </div>

        <div className="mt-5">
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide mb-1">Operating-cost comparison</div>
          <p className="text-[#2E5651] text-xs leading-relaxed">
            Roughly {economics.monthlySavings >= 0 ? "+" : "-"}${Math.abs(economics.monthlySavings).toLocaleString()} / mo
            {" "}({economics.annualSavings >= 0 ? "+" : "-"}${Math.abs(economics.annualSavings).toLocaleString()} / yr) versus your current truck.
            {economics.upfitPrice > 0 ? ` Net upfront includes ~$${economics.upfitPrice.toLocaleString()} estimated bed upfit.` : ""}
            {" "}Fuel and maintenance only; details are in the cost panel below.
          </p>
        </div>

        <div className="mt-5">
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide mb-1">Recommended configuration</div>
          <p className="text-[#2E5651] text-xs leading-relaxed">{recommendedNotes}</p>
        </div>

        <div className="mt-5">
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide mb-2">When this is not a good fit</div>
          <ul className="space-y-1.5">
            {assessment.watchouts.map((item) => (
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
