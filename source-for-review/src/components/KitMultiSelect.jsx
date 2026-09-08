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
