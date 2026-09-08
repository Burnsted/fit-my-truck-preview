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


======== FILE: src/screens/MapMyDayScreen.jsx ========
import { useEffect, useMemo, useRef, useState } from "react";
import { BatteryCharging, ExternalLink, LoaderCircle, MapPin } from "lucide-react";
import { planRoute, workdayAssessment } from "../calculations";
import { chargingOption, START_CHARGE_DEFAULT, START_CHARGE_MAX, START_CHARGE_MIN, VEHICLE_OPTIONS } from "../data";
import {
  applyLegMiles,
  defaultMapStops,
  formatPlaceLabel,
  isGeoNetworkEnabled,
  KEYSTONE_CENTER,
  matchSeedPlaces,
  placedStops,
  placeToStop,
  routeStops,
  SEARCH_DEBOUNCE_MS,
  searchPlaces,
  stopCoords,
  totalRouteMiles,
} from "../geo";
import {
  AMBER, BORDER, MUTED, OLIVE, PANEL_GRADIENT, PAPER, RUST, TEAL, zoneColor,
} from "../theme";
import { ModeAndTradeSelector } from "../components/ModeAndTradeSelector";
import { PriceRibbon } from "../components/PriceRibbon";
import { SelectedVehicleBar } from "../components/vehicleConfig";
import { FindMyTruckCta } from "../components/FindMyTruckCta";
import { EyebrowBanner, MiniField, StartChargeControl } from "../components/ui";

export function MapVisual({ stops, geometry, status }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const layersRef = useRef(null);

  useEffect(() => {
    if (!isGeoNetworkEnabled()) return undefined;
    let cancelled = false;
    let map;

    (async () => {
      const leaflet = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !elRef.current) return;
      const L = leaflet.default || leaflet;
      const topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        maxZoom: 17,
        attribution: "&copy; OpenStreetMap, SRTM &copy; OpenTopoMap (CC-BY-SA)",
      });
      const streets = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      });
      map = L.map(elRef.current, {
        center: [KEYSTONE_CENTER.lat, KEYSTONE_CENTER.lon],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });
      topo.addTo(map);
      L.control.layers({ "Topo map": topo, "Street map": streets }, {}, { position: "topright" }).addTo(map);
      mapRef.current = map;
      layersRef.current = L.layerGroup().addTo(map);
      drawRoute(L, map, layersRef.current, stops, geometry);
    })().catch(() => {
      // jsdom / missing WebGL / blocked tiles — the search list still works.
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layersRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const group = layersRef.current;
    if (!map || !group) return undefined;
    let cancelled = false;
    (async () => {
      const leaflet = await import("leaflet");
      if (cancelled) return;
      drawRoute(leaflet.default || leaflet, map, group, stops, geometry);
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [stops, geometry]);

  const placed = placedStops(stops);

  return (
    <div className="visual-card border mb-2 overflow-hidden relative" style={{ borderColor: BORDER, backgroundColor: "#D7E4D2" }}>
      <div
        ref={elRef}
        data-testid="map-my-day"
        role="img"
        aria-label="Topographic OpenStreetMap of your stops"
        className="map-my-day-canvas relative w-full"
      />
      {!isGeoNetworkEnabled() && (
        <div className="map-my-day-fallback absolute inset-0 flex flex-col justify-end p-3 pointer-events-none">
          <p style={{ fontFamily: "'JetBrains Mono', monospace", color: PAPER }} className="text-[10px] uppercase tracking-wide">
            OpenStreetMap topographic map · {placed.length} placed stop{placed.length === 1 ? "" : "s"}
          </p>
        </div>
      )}
      {status?.busy && (
        <div
          data-testid="map-loading"
          className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1.5"
          style={{ backgroundColor: "rgba(15,42,36,0.78)", color: "#F7FBFC" }}
        >
          <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[10px] uppercase tracking-wide">
            {status.message || "Updating route"}
          </span>
        </div>
      )}
      {status?.error && (
        <div
          data-testid="map-error"
          className="absolute bottom-3 left-3 right-3 px-2.5 py-1.5"
          style={{ backgroundColor: "rgba(176,58,31,0.9)", color: "#FFF8F4" }}
        >
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[10px]">
            {status.error}
          </span>
        </div>
      )}
    </div>
  );
}

function drawRoute(L, map, group, stops, geometry) {
  group.clearLayers();
  const points = placedStops(stops).map((stop, index) => {
