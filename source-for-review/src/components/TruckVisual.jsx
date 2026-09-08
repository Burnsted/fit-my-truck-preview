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
