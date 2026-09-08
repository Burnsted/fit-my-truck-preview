import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { findTruckFits, vehicleFitView } from "../calculations";
import { START_CHARGE_DEFAULT, START_CHARGE_MAX, START_CHARGE_MIN, VEHICLE_CONFIGS, VEHICLE_OPTIONS, resolveTradeProfile } from "../data";
import {
  AMBER, BORDER, MUTED, OLIVE, PANEL, PANEL_GRADIENT, RUST,
} from "../theme";
import { FitWhyTrigger } from "../components/FitWhyBubble";
import { ModeAndTradeSelector } from "../components/ModeAndTradeSelector";
import { PriceRibbon } from "../components/PriceRibbon";
import { EyebrowBanner, StartChargeControl } from "../components/ui";
import { SelectedVehicleBar } from "../components/vehicleConfig";
import { VehiclePhoto } from "../components/VehiclePhoto";

export function FindMyTruckScreen({
  mode,
  setMode,
  trade,
  setTrade,
  customTrade,
  setCustomTrade,
  activity,
  setActivity,
  vehicleId,
  setVehicleId,
  vehicleYear,
  workdayFitInputs,
  startCharge = START_CHARGE_DEFAULT,
  setStartCharge,
}) {
  const [trailerWeight, setTrailerWeight] = useState(6000);
  const [payloadWeight, setPayloadWeight] = useState(800);
  const [radius, setRadius] = useState(60);
  const startPct = Math.min(START_CHARGE_MAX, Math.max(START_CHARGE_MIN, Number(startCharge) || START_CHARGE_DEFAULT));
  const tradeProfile = useMemo(() => resolveTradeProfile(trade, customTrade), [trade, customTrade]);

  const results = useMemo(() => findTruckFits({
    vehicles: VEHICLE_OPTIONS,
    configs: VEHICLE_CONFIGS,
    trailerWeight,
    payloadWeight,
    radius,
    startCharge: startPct,
    equipmentItems: workdayFitInputs?.equipmentItems ?? [],
    overflowTrailerId: workdayFitInputs?.overflowTrailerId ?? "none",
    categoryScore: mode === "work"
      ? (tradeProfile.hasConvertibilityScore === false ? null : (tradeProfile.score ?? 75))
      : 80,
    categoryLabel: mode === "work" ? tradeProfile.categoryLabel : activity,
    tradeId: mode === "work" ? tradeProfile.kitKey : null,
  }), [
    trailerWeight,
    payloadWeight,
    radius,
    startPct,
    workdayFitInputs?.equipmentItems,
    workdayFitInputs?.overflowTrailerId,
    mode,
    tradeProfile.score,
    tradeProfile.hasConvertibilityScore,
    tradeProfile.categoryLabel,
    tradeProfile.kitKey,
    activity,
  ]);
  const remaining = results.filter((r) => !r.eliminated).length;
  const fitByVehicle = useMemo(() => Object.fromEntries(results.map((row) => [
    row.id,
    vehicleFitView(row.assessment, row.eliminated ? row.reasons : []),
  ])), [results]);

  return (
    <div className="max-w-3xl mx-auto">
      <ModeAndTradeSelector mode={mode} setMode={setMode} trade={trade} setTrade={setTrade} customTrade={customTrade} setCustomTrade={setCustomTrade} activity={activity} setActivity={setActivity} />

      <EyebrowBanner>Find My Truck</EyebrowBanner>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif" }} className="text-4xl md:text-5xl mb-2">Everything's in the running</h2>
      <p className="text-[#2E5651] text-sm mb-8">Adjust your numbers below — trucks drop out only when something actually rules them out.</p>
      <SelectedVehicleBar selectedId={vehicleId} onSelect={setVehicleId} label="Your current pick — tap a result to switch" fitByVehicle={fitByVehicle} year={vehicleYear} />

      <div className="border p-6 mb-8" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
        <div className="mb-5">
          <div className="flex justify-between mb-2">
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[11px] uppercase tracking-wide">Trailer weight</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: AMBER }} className="text-sm font-semibold">{trailerWeight.toLocaleString()} lb</span>
          </div>
          <input aria-label="Trailer weight" type="range" min={0} max={13000} step={250} value={trailerWeight} onChange={(e) => setTrailerWeight(Number(e.target.value))} className="w-full accent-[#0077B6]" />
        </div>
        <div className="mb-5">
          <div className="flex justify-between mb-2">
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[11px] uppercase tracking-wide">Payload in truck</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: AMBER }} className="text-sm font-semibold">{payloadWeight.toLocaleString()} lb</span>
          </div>
          <input aria-label="Payload in truck" type="range" min={0} max={3000} step={100} value={payloadWeight} onChange={(e) => setPayloadWeight(Number(e.target.value))} className="w-full accent-[#0077B6]" />
        </div>
        <div className="mb-5">
          <div className="flex justify-between mb-2">
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[11px] uppercase tracking-wide">Round-trip radius</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: AMBER }} className="text-sm font-semibold">{radius} mi</span>
          </div>
          <input aria-label="Round-trip radius" type="range" min={0} max={200} step={5} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-full accent-[#0077B6]" />
        </div>
        <StartChargeControl
          value={startPct}
          onChange={(next) => setStartCharge?.(next)}
          min={START_CHARGE_MIN}
          max={START_CHARGE_MAX}
        />
      </div>

      <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-xs uppercase tracking-wide mb-4">{remaining} of {VEHICLE_OPTIONS.length} still in the running</div>

      <div className="space-y-3">
        {results.map((v) => {
          const isSelected = v.id === vehicleId;
          return (
          <button
            type="button"
            key={v.id}
            onClick={() => setVehicleId?.(v.id)}
            aria-pressed={isSelected}
            className="w-full flex items-center justify-between p-4 border transition-opacity text-left"
            style={{ borderColor: isSelected ? AMBER : v.eliminated ? "#E8C4B8" : BORDER, backgroundColor: v.eliminated ? "#FBEFE9" : isSelected ? "#D6F0FA" : PANEL, opacity: v.eliminated ? 0.55 : 1 }}
          >
            <div className="flex items-center gap-3 min-w-0">
              {v.eliminated ? <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: RUST }} /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: OLIVE }} />}
              <VehiclePhoto vehicle={v} year={vehicleYear} className="w-16 h-12 rounded-md object-cover border flex-shrink-0" />
              <div className="min-w-0">
                <div style={{ fontFamily: "'Oswald', sans-serif" }} className="text-sm font-semibold uppercase">{v.make} {v.model}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px]">
                  Capability Fit <span data-testid="vehicle-fit-score" data-vehicle-id={v.id}>{v.fitScore}</span>
                  {" · "}{v.usableRange} mi usable at {startPct}%
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              {isSelected && (
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color: AMBER }} className="text-[10px] uppercase tracking-wide mb-1">Your pick</div>
              )}
              {v.eliminated ? (
                <div className="flex items-center gap-1.5 justify-end" style={{ color: RUST }}>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <FitWhyTrigger
                    compact
                    label="Not a good fit"
                    reasons={v.reasons}
                    docks={v.assessment.fitDocks?.docks ?? []}
                  />
                </div>
              ) : (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: OLIVE }} className="text-[10px] uppercase tracking-wide">Still qualifies</span>
              )}
            </div>
          </button>
          );
        })}
      </div>

      <PriceRibbon variant="truck" />
    </div>
  );
}
