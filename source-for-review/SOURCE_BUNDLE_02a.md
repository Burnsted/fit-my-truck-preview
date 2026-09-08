======== FILE: src/components/FindMyTruckCta.jsx ========
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


======== FILE: src/components/FitWhyBubble.jsx ========
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


======== FILE: src/components/KitMultiSelect.jsx ========
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AMBER, BORDER, MUTED, PANEL, PANEL_GRADIENT, PAPER } from "../theme";

function optionMeta(item) {
  const bits = [];
  const watts = Number(item.watts) || 0;
  const hours = Number(item.typicalHours) || 0;
  if (watts > 0 && hours > 0) {
    bits.push(`~${((watts * hours) / 1000).toFixed(1)} kWh`);
  } else {
    bits.push("weight only");
  }
  if ((Number(item.weightLbs) || 0) > 0) {
    const tag = item.weightSource === "fact" ? "FACT" : "est.";
    bits.push(`~${Math.round(item.weightLbs)} lb ${tag}`);
  }
  if ((Number(item.trailerWeightLbs) || 0) > 0) {
    const tag = item.weightSource === "fact" ? "FACT" : "est.";
    bits.push(`~${Math.round(item.trailerWeightLbs).toLocaleString()} lb trailer ${tag}`);
  }
  return bits.join(" · ");
}

function OptionRow({ item, checked, onToggle }) {
  return (
    <label
      className="flex items-start gap-3 px-3 py-2 border-b last:border-b-0 cursor-pointer"
      style={{ borderColor: BORDER, backgroundColor: checked ? "#D6F0FA" : "transparent" }}
    >
      <input
        type="checkbox"
        className="accent-[#0077B6] mt-0.5 flex-shrink-0"
        checked={checked}
        onChange={() => onToggle(item.id)}
      />
      <span className="min-w-0">
        <span style={{ fontFamily: "'Oswald', sans-serif", color: checked ? AMBER : PAPER }} className="block text-xs font-semibold uppercase leading-tight">
          {item.name}
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="block text-[10px] mt-0.5 leading-relaxed">
          {optionMeta(item)}
        </span>
      </span>
    </label>
  );
}

function bedMeta(item) {
  const weightTag = item.weightSource === "fact" ? "FACT" : "est.";
  const priceTag = item.priceSource === "fact" ? "list/street" : "est.";
  const weight = (Number(item.weightLbs) || 0) > 0 ? `~${Math.round(item.weightLbs)} lb ${weightTag}` : "0 lb";
  const price = (Number(item.priceEstUsd) || 0) > 0
    ? `~$${item.priceEstUsd.toLocaleString()} ${priceTag}`
    : "no added cost";
  return `${weight} · ${price}`;
}

export function BedAccessoryMultiSelect({ items, selectedIds, onToggle }) {
  const [open, setOpen] = useState(true);
  const selected = items.filter((item) => selectedIds.includes(item.id));
  const totalLb = selected.reduce((sum, item) => sum + (Number(item.weightLbs) || 0), 0);
  const totalUsd = selected.reduce((sum, item) => sum + (Number(item.priceEstUsd) || 0), 0);

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        className="w-full flex items-center justify-between border-2 px-4 py-3 text-left"
        style={{ borderColor: AMBER, backgroundImage: PANEL_GRADIENT }}
      >
        <span>
          <span style={{ fontFamily: "'Oswald', sans-serif", color: PAPER }} className="block text-sm font-semibold uppercase tracking-wide">
            {selected.length} selected
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="block text-[10px] mt-0.5">
            {selected.length === 0
              ? "Open bed — select all that apply"
              : `~${Math.round(totalLb).toLocaleString()} lb · ~$${totalUsd.toLocaleString()} est. stacked`}
          </span>
        </span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: MUTED }} />
      </button>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {selected.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item.id)}
              className="border px-2 py-1 text-left"
              style={{ borderColor: AMBER, backgroundColor: "#D6F0FA" }}
              aria-label={`Remove ${item.name}`}
            >
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: AMBER }} className="text-[10px] uppercase tracking-wide">
                {item.name} ×
              </span>
            </button>
          ))}
        </div>
      )}

      <div
        className="mt-3 border max-h-80 overflow-y-auto"
        style={{ borderColor: BORDER, backgroundColor: PANEL, display: open ? "block" : "none" }}
        role="group"
        aria-label="Bed accessories — select all that apply"
      >
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-3 px-3 py-2 border-b last:border-b-0 cursor-pointer"
            style={{ borderColor: BORDER, backgroundColor: selectedIds.includes(item.id) ? "#D6F0FA" : "transparent" }}
          >
            <input
              type="checkbox"
              className="accent-[#0077B6] mt-0.5 flex-shrink-0"
              checked={selectedIds.includes(item.id)}
              onChange={() => onToggle(item.id)}
            />
            <span className="min-w-0">
              <span style={{ fontFamily: "'Oswald', sans-serif", color: selectedIds.includes(item.id) ? AMBER : PAPER }} className="block text-xs font-semibold uppercase leading-tight">
                {item.name}
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="block text-[10px] mt-0.5 leading-relaxed">
                {bedMeta(item)} · {item.note}
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function KitMultiSelect({ tradeItems, miscItems, selectedIds, onToggle, tradeName, subtitle, groupLabel }) {
  const [open, setOpen] = useState(true);
  const selected = [...tradeItems, ...miscItems].filter((item) => selectedIds.includes(item.id));

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
        className="w-full flex items-center justify-between border-2 px-4 py-3 text-left"
        style={{ borderColor: AMBER, backgroundImage: PANEL_GRADIENT }}
      >
        <span>
          <span style={{ fontFamily: "'Oswald', sans-serif", color: PAPER }} className="block text-sm font-semibold uppercase tracking-wide">
            {selected.length} selected
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="block text-[10px] mt-0.5">
            {subtitle ?? `${tradeName} kit + miscellaneous payload`}
          </span>
        </span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: MUTED }} />
      </button>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {selected.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item.id)}
              className="border px-2 py-1 text-left"
              style={{ borderColor: AMBER, backgroundColor: "#D6F0FA" }}
              aria-label={`Remove ${item.name}`}
            >
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: AMBER }} className="text-[10px] uppercase tracking-wide">
                {item.name} ×
              </span>
            </button>
          ))}
        </div>
      )}

      <div
        className="mt-3 border max-h-72 overflow-y-auto"
        style={{ borderColor: BORDER, backgroundColor: PANEL, display: open ? "block" : "none" }}
        role="group"
        aria-label="Select the ones that apply"
      >
        <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED, borderColor: BORDER }} className="text-[10px] uppercase tracking-wide px-3 py-2 border-b">
          {groupLabel ?? tradeName}
        </div>
        {tradeItems.map((item) => (
          <OptionRow key={item.id} item={item} checked={selectedIds.includes(item.id)} onToggle={onToggle} />
        ))}
        {miscItems.length > 0 && (
          <>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED, borderColor: BORDER }} className="text-[10px] uppercase tracking-wide px-3 py-2 border-y">
              Miscellaneous payload
            </div>
            {miscItems.map((item) => (
              <OptionRow key={item.id} item={item} checked={selectedIds.includes(item.id)} onToggle={onToggle} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}


======== FILE: src/components/ModeAndTradeSelector.jsx ========
import { Briefcase, Waves } from "lucide-react";
import { ACTIVITIES, MAJOR_TRADES, OTHER_TRADE_NAME, SCENE_IMAGES, resolveTradeProfile } from "../data";
import {
  AMBER, BORDER, MUTED, PANEL, TEAL, TEXT,
} from "../theme";
import { CategorySelect } from "./ui";

export function ModeAndTradeSelector({ mode, setMode, trade, setTrade, activity, setActivity, customTrade = "", setCustomTrade }) {
  const profile = resolveTradeProfile(trade, customTrade);
  const handleTradeChange = (name) => {
    setTrade(name);
    if (name !== OTHER_TRADE_NAME) setCustomTrade?.("");
  };
  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {[
          { id: "work", label: "Workday", sub: "Jobsite routes, trailers, payload", icon: Briefcase, color: AMBER, scene: SCENE_IMAGES.workday },
          { id: "recreation", label: "Play Day", sub: "Boat, camper, weekend towing", icon: Waves, color: TEAL, scene: SCENE_IMAGES.playday },
        ].map(({ id, label, sub, icon: Icon, color, scene }) => {
          const active = mode === id;
          return (
            <button key={id} onClick={() => setMode(id)} className="relative overflow-hidden text-left p-5 border-2 transition-all" style={{ borderColor: active ? color : BORDER, backgroundColor: active ? `${color}1A` : PANEL }}>
              {scene?.url && (
                <img
                  src={scene.url}
                  alt=""
                  width={1200}
                  height={545}
                  loading="lazy"
                  decoding="async"
