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
