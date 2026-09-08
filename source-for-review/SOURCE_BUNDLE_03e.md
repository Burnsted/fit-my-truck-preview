        <h2 style={{ fontFamily: "'Oswald', sans-serif", color: PAPER }} className="text-3xl font-bold uppercase tracking-wide leading-none mb-2">My current truck</h2>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[11px] mb-3">The gas or diesel truck you have now.</p>
        <label className="block mb-3">
          <span className="sr-only">My current truck</span>
          <select
            aria-label="My current truck"
            value={currentTruckId}
            onChange={(e) => handleCurrentTruckChange(e.target.value)}
            style={{ fontFamily: "'Oswald', sans-serif", borderColor: AMBER, backgroundImage: PANEL_GRADIENT, color: PAPER }}
            className="w-full appearance-none border-2 text-sm font-semibold uppercase tracking-wide px-4 py-3"
          >
            {CURRENT_TRUCK_PRESETS.map((truck) => (
              <option key={truck.id} value={truck.id}>{truck.name}</option>
            ))}
          </select>
        </label>
        {currentTruckId === "other" && (
          <input
            aria-label="Type your current truck"
            placeholder="e.g. 2018 Ram 2500"
            value={customCurrentTruck}
            onChange={(e) => setCustomCurrentTruck(e.target.value)}
            style={{ fontFamily: "'Oswald', sans-serif", borderColor: AMBER, backgroundImage: PANEL_GRADIENT, color: PAPER }}
            className="w-full border-2 text-sm font-semibold uppercase tracking-wide px-4 py-3 mb-3"
          />
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-1">
          <MiniField label="Current MPG" value={currentMpg} onChange={setCurrentMpg} suffix="mpg" min={1} />
          <MiniField label="Diesel price" value={dieselPrice} onChange={setDieselPrice} suffix="$/gal" />
          <MiniField label="Electricity rate" value={electricityRate} onChange={setElectricityRate} suffix="$/kWh" />
          <MiniField label="Annual miles" value={annualMiles} onChange={setAnnualMiles} suffix="mi" />
          <MiniField label="Used EV price" value={evPrice} onChange={setEvPrice} suffix="$" />
          <MiniField label="Trade-in value" value={tradeIn} onChange={setTradeIn} suffix="$" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: BORDER }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">Current annual cost</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: RUST }} className="text-xl font-semibold mt-1">${economics.dieselAnnual.toLocaleString()}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[9px] mt-0.5">fuel + maintenance only</div>
          </div>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">EV annual cost</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: OLIVE }} className="text-xl font-semibold mt-1">${economics.evAnnual.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">Net upfront cost</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: PAPER }} className="text-xl font-semibold mt-1">${economics.netUpfront.toLocaleString()}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[9px] mt-0.5">
              {economics.upfitPrice > 0
                ? `includes ~$${economics.upfitPrice.toLocaleString()} bed upfit est.`
                : "truck price minus trade-in"}
            </div>
          </div>
        </div>
      </div>

      {/* Home charging economics + curated charger shortlist */}
      <div className="border p-6" style={{ borderColor: BORDER, backgroundColor: "#D3F3E0" }}>
        <div className="flex items-center gap-2 mb-3">
          <BatteryCharging className="w-4 h-4" style={{ color: TEAL }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: TEAL }} className="text-xs uppercase tracking-wide font-semibold">
            {homeCharging ? "Fully charged every morning — no separate errand" : "Add home or shop charging to unlock the full economic case"}
          </span>
        </div>
        <p className="text-[#5A7D77] text-xs leading-relaxed mb-4">
          A Level 2 charger installed at home or the shop means this truck starts every {mode === "work" ? "workday" : "play day"} at 100% — the same way you'd never think twice about a full tank. A few reputable options, not an exhaustive list:
        </p>
        <div className="space-y-2">
          {CHARGERS.map((c) => (
            <div key={c.brand} className="flex items-center justify-between border px-4 py-3" style={{ borderColor: BORDER }}>
              <div>
                <div style={{ fontFamily: "'Oswald', sans-serif" }} className="text-sm font-semibold uppercase">{c.brand} <span className="text-[#5A7D77] font-normal normal-case">{c.model}</span></div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px]">{c.amps} · {c.note}</div>
              </div>
              <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: TEAL }} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <RefreshResultsButton onClick={refreshResults} label="Refresh results" />
      </div>

      <PriceRibbon variant="truck" />

      {/* Final step — after workday/play-day inputs, a search-style card (not a top-nav pill) */}
      <FindMyTruckCta onClick={goToMatching} subtitle={`See What Fits This ${dayTitle}`} />
    </div>
  );
}


======== FILE: src/screens/FindMyTruckScreen.jsx ========
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


======== FILE: src/screens/FleetScreen.jsx ========
import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { analyzeFleetVehicle } from "../calculations";
import { SCENE_IMAGES, VEHICLE_OPTIONS } from "../data";
import {
  AMBER, BORDER, MUTED, OLIVE, PANEL_GRADIENT, PAPER, RUST, ZONE_MID,
} from "../theme";
import { PriceRibbon } from "../components/PriceRibbon";
import { SceneBanner } from "../components/TruckVisual";
import { EyebrowBanner, MiniField, ScoreBar } from "../components/ui";
import { SelectedVehicleBar } from "../components/vehicleConfig";
import { VehiclePhoto } from "../components/VehiclePhoto";

const FLEET_MAX = 20;
const DEFAULT_FLEET = [
  { id: 1, name: "Truck 1 — Lead Crew", fuelType: "diesel", mpg: 15, annualMiles: 19000, trailerWeight: 5000, homeCharging: true },
  { id: 2, name: "Truck 2 — Local Routes", fuelType: "gas", mpg: 17, annualMiles: 14000, trailerWeight: 2500, homeCharging: true },
  { id: 3, name: "Truck 3 — Supply Runs", fuelType: "gas", mpg: 16, annualMiles: 11000, trailerWeight: 0, homeCharging: true },
  { id: 4, name: "Truck 4 — Heavy Equipment", fuelType: "diesel", mpg: 13, annualMiles: 21000, trailerWeight: 9500, homeCharging: false },
  { id: 5, name: "Truck 5 — Backup / Overflow", fuelType: "gas", mpg: 17, annualMiles: 8000, trailerWeight: 1500, homeCharging: true },
];

export function FleetScreen({ vehicleId, setVehicleId, vehicleFits, vehicleYear }) {
  const [tab, setTab] = useState("roster");
  const [fleet, setFleet] = useState(DEFAULT_FLEET);
  const [dieselPrice, setDieselPrice] = useState(4.05);
  const [gasPrice, setGasPrice] = useState(3.35);
