                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ opacity: active ? 0.5 : 0.38 }}
                />
              )}
              <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(180deg, ${PANEL}A6 0%, ${PANEL}88 55%, ${PANEL}C4 100%)` }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-5 h-5" style={{ color: active ? color : MUTED }} strokeWidth={2} />
                  <span style={{ fontFamily: "'Oswald', sans-serif", color: active ? color : TEXT }} className="text-xl font-semibold uppercase tracking-wide">{label}</span>
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[11px]">{sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      {mode === "work" ? (
        <div className="mb-8">
          <CategorySelect label="What's your trade?" options={MAJOR_TRADES} value={trade} onChange={handleTradeChange} color={AMBER} />
          {trade === OTHER_TRADE_NAME && (
            <div className="mt-3">
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide mb-1.5">Enter your trade</div>
              <input
                aria-label="Enter your trade"
                placeholder="e.g. locksmith, appliance repair"
                value={customTrade}
                onChange={(e) => setCustomTrade?.(e.target.value)}
                style={{ fontFamily: "'Oswald', sans-serif", borderColor: AMBER, backgroundImage: "linear-gradient(155deg, #FFFFFF 0%, #D3F3E0 100%)", color: "#0F2A24" }}
                className="w-full border-2 text-sm font-semibold uppercase tracking-wide px-4 py-3 focus:outline-none"
              />
              <p className="text-[#5A7D77] text-[11px] leading-relaxed mt-2">
                {profile.categoryLabel && profile.categoryLabel !== OTHER_TRADE_NAME
                  ? `Showing “${profile.categoryLabel}.” Generic field-service kit stays on the truck. No convertibility percentage is assumed for a typed trade — payload, kit, and savings update live as you type.`
                  : "Type the trade you actually run. Uses the generic field-service kit. No convertibility score is assumed — enter your day below and the numbers stay live."}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8"><CategorySelect label="What's the activity?" options={ACTIVITIES} value={activity} onChange={setActivity} color={TEAL} /></div>
      )}
    </>
  );
}


======== FILE: src/components/PriceRibbon.jsx ========
import { AMBER, BORDER, DATA_LAST_REVIEWED, MUTED } from "../theme";

export function PriceRibbon({ variant = "truck" }) {
  return (
    <div className="price-ribbon px-4 sm:px-6 md:px-10 py-2.5 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 border-b mt-8" style={{ borderColor: BORDER, backgroundColor: "rgba(255,253,246,0.86)" }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">
        {variant === "fleet" ? (
          <>That's the demo. A full FleetFit report is <span style={{ color: "#5A3D9C", fontWeight: 600 }}>$249</span>, founder pricing for early customers.</>
        ) : (
          <>That's the demo estimate. A full expert report for this truck is <span style={{ color: AMBER, fontWeight: 600 }}>$79</span>, founder pricing for early customers.</>
        )}
      </span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px]">
        Demo estimates · vehicle data reviewed {DATA_LAST_REVIEWED}
      </span>
    </div>
  );
}


======== FILE: src/components/TruckVisual.jsx ========
import { BORDER, MUTED, PANEL_GRADIENT, PAPER } from "../theme";
import { VehiclePhoto } from "./VehiclePhoto";

export function TruckVisual({ wheelLabel, modeColor, vehicleLabel, vehicle, year }) {
  const credit = vehicle?.imageCredit;
  const license = vehicle?.imageLicense;
  const sourceUrl = vehicle?.imageSourceUrl;

  return (
    <div className="visual-card border overflow-hidden mb-8" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
      <div className="px-5 pt-4 flex items-center justify-between">
        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">Current build</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: modeColor }} className="text-[10px] uppercase tracking-wide font-semibold">{wheelLabel}</span>
      </div>
      <div className="relative mx-4 mt-3 mb-3 overflow-hidden" style={{ borderRadius: 16, backgroundColor: "#D6F0FA" }}>
        <VehiclePhoto
          vehicle={vehicle}
          year={year}
          size="hero"
          eager
          className="visual-photo w-full h-auto block object-cover aspect-[16/9]"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
          style={{ backgroundImage: "linear-gradient(180deg, transparent 0%, rgba(15,42,36,0.45) 100%)" }}
        />
      </div>
      <div className="px-5 pb-4 flex items-start justify-between gap-3">
        <span style={{ fontFamily: "'Oswald', sans-serif", color: PAPER }} className="text-sm font-semibold uppercase tracking-wide">{vehicleLabel}</span>
        {credit && (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] text-right leading-relaxed">
            {sourceUrl ? (
              <a href={sourceUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                Photo: {credit}
              </a>
            ) : (
              <>Photo: {credit}</>
            )}
            {license ? ` · ${license}` : ""}
            {license && license.startsWith("CC") ? ", via Wikimedia Commons" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

export function SceneBanner({ scene, className = "mb-6" }) {
  if (!scene?.url) return null;
  return (
    <div className={`visual-card border overflow-hidden ${className}`} style={{ borderColor: BORDER }}>
      <img
        src={scene.url}
        alt={scene.alt || ""}
        width={1200}
        height={500}
        loading="lazy"
        decoding="async"
        className="visual-photo w-full h-36 sm:h-44 object-cover block"
      />
    </div>
  );
}


======== FILE: src/components/VehiclePhoto.jsx ========
import { SCENE_IMAGES, VEHICLE_OPTIONS, resolveVehiclePhoto } from "../data";
import { MUTED } from "../theme";

export function vehicleAlt(vehicle) {
  const year = vehicle?.modelYear ? `${vehicle.modelYear} ` : "";
  return `${year}${[vehicle?.make, vehicle?.model].filter(Boolean).join(" ")}` .trim();
}

export function VehiclePhoto({
  vehicle,
  year,
  size = "thumb",
  eager = false,
  className = "",
  decorative = false,
}) {
  const shot = year != null ? resolveVehiclePhoto(vehicle, year) : vehicle;
  if (!shot?.imageUrl && !shot?.imageThumbUrl) return null;
  const src = size === "hero"
    ? (shot.imageUrl || shot.imageThumbUrl)
    : (shot.imageThumbUrl || shot.imageUrl);
  const alt = decorative ? "" : vehicleAlt(shot);

  return (
    <img
      src={src}
      alt={alt}
      data-vehicle-id={shot.id}
      data-model-year={shot.modelYear || ""}
      width={size === "hero" ? 1100 : 480}
      height={size === "hero" ? 618 : 360}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer-when-downgrade"
      fetchPriority={eager ? "high" : "auto"}
      className={className}
    />
  );
}

function creditLine(item) {
  const who = item.imageCredit || item.credit;
  const license = item.imageLicense || item.license;
  const href = item.imageSourceUrl || item.sourceUrl;
  const label = [who, license].filter(Boolean).join(", ");
  if (!label) return null;
  if (href) {
    return <a href={href} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">{label}</a>;
  }
  return label;
}

export function PhotoCredits() {
  return (
    <footer className="max-w-3xl mx-auto mt-10 pt-4 border-t" style={{ borderColor: "rgba(78, 151, 148, 0.28)" }}>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] leading-relaxed">
        Vehicle photos by model year (Wikimedia Commons FilePath, not bundled WebP):{" "}
        {VEHICLE_OPTIONS.map((vehicle, index) => (
          <span key={vehicle.id}>
            {index > 0 ? "; " : ""}
            {vehicle.make} {vehicle.model} — {creditLine(vehicle)}
          </span>
        ))}
        . Distinct licensed photos swap with the year picker. Wheel-trim crops are from the same Commons sources. Scene photos:{" "}
        {Object.values(SCENE_IMAGES).map((scene, index) => (
          <span key={scene.sourceUrl}>
            {index > 0 ? "; " : ""}
            {creditLine(scene)}
          </span>
        ))}
        . Full notes in ATTRIBUTION.md.
      </p>
    </footer>
  );
}


======== FILE: src/components/WorkdayFitResult.jsx ========
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
