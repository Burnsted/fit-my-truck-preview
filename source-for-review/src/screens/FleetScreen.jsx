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
  const [elecRate, setElecRate] = useState(0.15);

  const update = (id, field, value) => setFleet((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  const addVehicle = () => {
    if (fleet.length >= FLEET_MAX) return;
    const nextId = Math.max(...fleet.map((v) => v.id)) + 1;
    setFleet((prev) => [...prev, { id: nextId, name: `Truck ${nextId}`, fuelType: "gas", mpg: 16, annualMiles: 12000, trailerWeight: 0, homeCharging: true }]);
  };
  const removeVehicle = (id) => setFleet((prev) => prev.filter((v) => v.id !== id));

  const analyzed = useMemo(() => fleet.map((v) => analyzeFleetVehicle(v, VEHICLE_OPTIONS, dieselPrice, gasPrice, elecRate)), [fleet, dieselPrice, gasPrice, elecRate]);
  const strongCandidates = analyzed.filter((v) => v.capabilityFit >= 70 && v.economicScore >= 55).length;
  const totalAnnualSavings = analyzed.reduce((sum, v) => sum + v.annualSavings, 0);
  const totalUpfront = analyzed.reduce((sum, v) => sum + v.recommended.price, 0);
  const fleetPaybackMonths = totalAnnualSavings > 0 ? Math.round((totalUpfront / totalAnnualSavings) * 12) : null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex gap-2 mb-8">
        {[{ id: "roster", label: "Fleet Roster", color: AMBER }, { id: "analysis", label: "Fleet Analysis", color: OLIVE }].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-full border-2 text-xs uppercase tracking-wide"
            style={{ fontFamily: "'JetBrains Mono', monospace", borderColor: t.color, backgroundImage: tab === t.id ? `linear-gradient(90deg, ${t.color} 0%, ${t.color}CC 100%)` : "none", backgroundColor: "transparent", color: tab === t.id ? "#FCF6E4" : t.color }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "roster" ? (
        <>
          <SceneBanner scene={SCENE_IMAGES.fleet} className="mb-6" />
          <SelectedVehicleBar selectedId={vehicleId} onSelect={setVehicleId} label="Your selected EV for comparison" fitByVehicle={vehicleFits} year={vehicleYear} />
          <EyebrowBanner color={AMBER}>FleetFit</EyebrowBanner>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif" }} className="text-4xl md:text-5xl mb-3">Enter your fleet</h2>
          <p className="text-[#2E5651] text-sm mb-6 max-w-lg">
            Up to {FLEET_MAX} vehicles. Fuel type, typical annual miles, typical trailer/load weight, and whether it can charge at the shop or depot overnight. This preview runs the same logic as a paid FleetFit report — the real report is done by hand, vehicle by vehicle.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 border p-4" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
            <MiniField label="Diesel price" value={dieselPrice} onChange={setDieselPrice} suffix="$/gal" />
            <MiniField label="Gas price" value={gasPrice} onChange={setGasPrice} suffix="$/gal" />
            <MiniField label="Electricity rate" value={elecRate} onChange={setElecRate} suffix="$/kWh" />
          </div>

          <div className="border mb-3" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
            {fleet.map((v) => (
              <div key={v.id} className="p-4 border-b last:border-b-0" style={{ borderColor: BORDER }}>
                <div className="flex items-center justify-between mb-3">
                  <input
                    value={v.name}
                    onChange={(e) => update(v.id, "name", e.target.value)}
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                    className="bg-transparent text-sm font-semibold uppercase tracking-wide flex-1 focus:outline-none border-b border-transparent focus:border-[#0077B6]"
                  />
                  <div className="flex items-center gap-3">
                    <select aria-label={`Fuel type for ${v.name}`} value={v.fuelType} onChange={(e) => update(v.id, "fuelType", e.target.value)} style={{ fontFamily: "'JetBrains Mono', monospace", borderColor: BORDER }} className="bg-transparent border text-[10px] uppercase px-2 py-1">
                      <option value="gas">Gas</option>
                      <option value="diesel">Diesel</option>
                    </select>
                    {fleet.length > 1 && <button aria-label={`Remove ${v.name}`} onClick={() => removeVehicle(v.id)} style={{ color: RUST }} className="min-h-11 min-w-11 text-sm leading-none px-1">×</button>}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MiniField label="MPG" value={v.mpg} onChange={(val) => update(v.id, "mpg", val)} />
                  <MiniField label="Annual mi" value={v.annualMiles} onChange={(val) => update(v.id, "annualMiles", val)} />
                  <MiniField label="Trailer/load" value={v.trailerWeight} onChange={(val) => update(v.id, "trailerWeight", val)} suffix="lb" />
                  <label className="flex flex-col justify-end pb-1">
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[9px] uppercase tracking-wide mb-1">Depot charging</span>
                    <input type="checkbox" checked={v.homeCharging} onChange={(e) => update(v.id, "homeCharging", e.target.checked)} className="accent-[#0077B6] w-4 h-4" />
                  </label>
                </div>
              </div>
            ))}
            {fleet.length < FLEET_MAX && (
              <button onClick={addVehicle} style={{ fontFamily: "'JetBrains Mono', monospace", color: AMBER }} className="w-full text-left text-xs uppercase tracking-wide px-4 py-2.5">
                + Add vehicle ({fleet.length}/{FLEET_MAX})
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <EyebrowBanner color={OLIVE}>Fleet Analysis</EyebrowBanner>
          <SelectedVehicleBar selectedId={vehicleId} onSelect={setVehicleId} label="Your selected EV" fitByVehicle={vehicleFits} year={vehicleYear} />
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif" }} className="text-4xl md:text-5xl mb-6">What your fleet looks like electrified</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="border p-4" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[9px] uppercase tracking-wide">Strong candidates</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: OLIVE }} className="text-2xl font-semibold mt-1">{strongCandidates}<span className="text-sm" style={{ color: MUTED }}> / {analyzed.length}</span></div>
            </div>
            <div className="border p-4" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[9px] uppercase tracking-wide">Fleet annual savings</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: totalAnnualSavings >= 0 ? OLIVE : RUST }} className="text-2xl font-semibold mt-1">
                {totalAnnualSavings >= 0 ? "+" : "-"}${Math.abs(totalAnnualSavings).toLocaleString()}
              </div>
            </div>
            <div className="border p-4" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[9px] uppercase tracking-wide">Est. total upfront</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: PAPER }} className="text-2xl font-semibold mt-1">${totalUpfront.toLocaleString()}</div>
            </div>
            <div className="border p-4" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[9px] uppercase tracking-wide">Fleet payback</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: PAPER }} className="text-2xl font-semibold mt-1">{fleetPaybackMonths === null ? "Never" : `${fleetPaybackMonths} mo`}</div>
            </div>
          </div>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] leading-relaxed mb-8">
            "Est. total upfront" assumes no trade-in credit — a real transition would net that down per vehicle, same as Build My Workday.
          </p>

          <div className="space-y-3">
            {analyzed.map((v) => {
              const isCandidate = v.capabilityFit >= 70 && v.economicScore >= 55;
              return (
                <div key={v.id} className="border p-5" style={{ borderColor: isCandidate ? OLIVE : BORDER, backgroundImage: PANEL_GRADIENT }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {isCandidate ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: OLIVE }} /> : <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: ZONE_MID }} />}
                      <span style={{ fontFamily: "'Oswald', sans-serif" }} className="text-sm font-semibold uppercase tracking-wide truncate">{v.name}</span>
                    </div>
                    <span className="flex items-center gap-2 flex-shrink-0">
                      {v.recommended && <VehiclePhoto vehicle={v.recommended} className="w-14 h-10 rounded-md object-cover border" />}
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase">→ {v.recommended.make} {v.recommended.model}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <ScoreBar score={v.capabilityFit} label="Capability" />
                    <ScoreBar score={v.economicScore} label="Economics" />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: BORDER }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">Annual savings this vehicle</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: v.annualSavings >= 0 ? OLIVE : RUST }} className="text-sm font-semibold">
                      {v.annualSavings >= 0 ? "+" : "-"}${Math.abs(v.annualSavings).toLocaleString()}/yr
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <PriceRibbon variant="fleet" />
        </>
      )}
    </div>
  );
}
