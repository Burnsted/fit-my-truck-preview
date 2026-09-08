import { Hourglass, Search } from "lucide-react";
import { MUTED, OLIVE, PANEL_GRADIENT, PAPER } from "../theme";

export function FindMyTruckCta({ onClick, subtitle }) {
  return (
    <button
      type="button"
      data-testid="find-fits-cta"
      onClick={onClick}
      aria-label={`Find My Truck — ${subtitle}`}
      className="find-truck-cta w-full mt-8 text-left px-4 py-4 sm:px-5 sm:py-5 border-2 flex items-center gap-4"
      style={{
        borderColor: OLIVE,
        backgroundImage: PANEL_GRADIENT,
        color: PAPER,
      }}
    >
      <span
        className="find-truck-cta-icon relative flex-shrink-0 inline-flex items-center justify-center w-12 h-12"
        style={{ backgroundColor: `${OLIVE}22`, color: OLIVE }}
        aria-hidden="true"
      >
        <Search className="w-6 h-6" strokeWidth={2.25} />
        <Hourglass className="w-3.5 h-3.5 absolute bottom-1 right-1" strokeWidth={2.5} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          style={{ fontFamily: "'Oswald', sans-serif" }}
          className="block text-xl font-semibold uppercase tracking-wide leading-none"
        >
          Find My Truck
        </span>
        <span
          style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }}
          className="block text-[11px] uppercase tracking-wide mt-1.5"
        >
          {subtitle}
        </span>
      </span>
    </button>
  );
}
