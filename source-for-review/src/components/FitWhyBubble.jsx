import { useEffect, useId, useRef, useState } from "react";
import { BORDER, MUTED, PANEL, PAPER, RUST } from "../theme";

export function FitWhyTrigger({
  label,
  reasons = [],
  docks = [],
  color = RUST,
  compact = false,
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const popRef = useRef(null);
  const dialogId = useId();
  const hasWhy = reasons.length > 0 || docks.length > 0;

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      const target = event.target;
      if (triggerRef.current?.contains(target) || popRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!hasWhy) {
    return (
      <span style={{ fontFamily: compact ? "'JetBrains Mono', monospace" : "'Oswald', sans-serif", color }}>
        {label}
      </span>
    );
  }

  return (
    <span className="relative inline-flex items-center">
      <span
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={dialogId}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            setOpen((current) => !current);
          }
        }}
        className="inline-flex items-center gap-0.5 cursor-pointer underline decoration-dotted underline-offset-2"
        style={{ fontFamily: compact ? "'JetBrains Mono', monospace" : "'Oswald', sans-serif", color }}
      >
        {label}
        <sup aria-hidden="true" className="text-[10px] leading-none no-underline">*</sup>
        <span className="sr-only"> — tap for why</span>
      </span>
      {open && (
        <div
          ref={popRef}
          id={dialogId}
          role="dialog"
          aria-label={`Why ${label}`}
          onClick={(event) => event.stopPropagation()}
          className="absolute z-40 left-0 top-full mt-1.5 w-[min(18rem,calc(100vw-2.5rem))] border p-3 shadow-lg"
          style={{ borderColor: BORDER, backgroundColor: PANEL }}
        >
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide mb-2">
            Why this rating
          </div>
          {reasons.length > 0 && (
            <ul className="space-y-1.5 mb-2">
              {reasons.map((item) => (
                <li key={item} className="text-[#2E5651] text-xs leading-relaxed">— {item}</li>
              ))}
            </ul>
          )}
          {docks.length > 0 && (
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide mb-1.5">
                Score hits
              </div>
              <ul className="space-y-1">
                {docks.map((dock) => (
                  <li key={dock.id} className="text-[#2E5651] text-xs leading-relaxed">
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: PAPER }} className="font-semibold">−{dock.points}</span>
                    {" "}{dock.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </span>
  );
}

export function VehicleFitScore({ score, color, vehicleId }) {
  return (
    <span
      data-testid="vehicle-fit-score"
      data-vehicle-id={vehicleId}
      style={{ fontFamily: "'JetBrains Mono', monospace", color }}
      className="text-sm font-semibold flex-shrink-0"
    >
      {score}
    </span>
  );
}
