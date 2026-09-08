          "react/jsx-dev-runtime": "https://esm.sh/react@19.2.8/jsx-dev-runtime",
          "react-dom": "https://esm.sh/react-dom@19.2.8",
          "react-dom/client": "https://esm.sh/react-dom@19.2.8/client",
          "leaflet": "https://esm.sh/leaflet@1.9.4",
          "leaflet/dist/leaflet.css": "https://esm.sh/leaflet@1.9.4/dist/leaflet.css"
        }
      }
    </script>`;

let html = await readFile(new URL("index.html", out), "utf8");
if (!html.includes("./assets/")) {
  throw new Error("Public preview HTML must use relative asset URLs (build with FIT_MY_TRUCK_PREVIEW=1).");
}
const leafletCss = '\n    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="">';
if (!html.includes("type=\"importmap\"")) {
  html = html.replace("<head>", `<head>${importMap}`);
}
if (!html.includes('rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"')) {
  html = html.replace("</title>", `</title>${leafletCss}`);
}
await writeFile(new URL("index.html", out), html);
await writeFile(new URL("404.html", out), html);


======== FILE: scripts/prepare-sites.mjs ========
import { copyFile, mkdir } from "node:fs/promises";

await mkdir(new URL("../dist/server/", import.meta.url), { recursive: true });
await copyFile(
  new URL("../server/index.js", import.meta.url),
  new URL("../dist/server/index.js", import.meta.url),
);


======== FILE: scripts/preview-pages.workflow.yml ========
name: GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Upload static site
        uses: actions/upload-pages-artifact@v3
        with:
          path: .
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4


======== FILE: server/index.js ========
export default {
  fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};


======== FILE: src/App.jsx ========
import { useState } from "react";
import { ACTIVITIES, DEFAULT_WORK_TRADE, START_CHARGE_DEFAULT, VEHICLE_OPTIONS } from "./data";
import {
  AMBER, BORDER, FONTS, OLIVE, PAPER,
} from "./theme";
import { FTMYLogo } from "./components/brand";
import { PhotoCredits } from "./components/VehiclePhoto";
import { BuildMyWorkdayScreen } from "./screens/BuildMyWorkdayScreen";
import { FindMyTruckScreen } from "./screens/FindMyTruckScreen";
import { FleetScreen } from "./screens/FleetScreen";
import { WaypointScreen } from "./screens/MapMyDayScreen";

export default function FitMyTruckApp() {
  const [screen, setScreen] = useState("workday");
  const [mode, setMode] = useState("work");
  const [trade, setTrade] = useState(DEFAULT_WORK_TRADE.name);
  const [customTrade, setCustomTrade] = useState("");
  const [activity, setActivity] = useState(ACTIVITIES[0]);
  const [dailyMiles, setDailyMiles] = useState(DEFAULT_WORK_TRADE.defaults?.dailyMiles ?? 58);
  const [dayStops, setDayStops] = useState(DEFAULT_WORK_TRADE.defaults?.stops ?? 6);
  const [vehicleId, setVehicleId] = useState(VEHICLE_OPTIONS[0].id);
  const [vehicleYear, setVehicleYear] = useState(String(VEHICLE_OPTIONS[0].firstAvailableYear ?? 2022));
  const [vehicleFits, setVehicleFits] = useState(null);
  const [workdayFitInputs, setWorkdayFitInputs] = useState(null);
  const [startCharge, setStartCharge] = useState(START_CHARGE_DEFAULT);
  const goToMatching = () => setScreen("matching");
  const sharedProps = {
    mode, setMode, trade, setTrade, customTrade, setCustomTrade, activity, setActivity,
    dailyMiles, setDailyMiles, dayStops, setDayStops, vehicleId, setVehicleId, goToMatching,
    vehicleYear, setVehicleYear,
    vehicleFits, onVehicleFitsChange: setVehicleFits,
    workdayFitInputs, onWorkdayInputsChange: setWorkdayFitInputs,
    startCharge, setStartCharge,
  };

  const NAV = [
    { id: "workday", label: "Build My Workday" },
    { id: "playday", label: "Build My Play Day" },
    { id: "map", label: "Map My Day" },
    { id: "fleet", label: "FleetFit" },
  ];
  // "workday" and "playday" both route to the same screen — which one's active depends on mode too
  const activeNavId = screen === "workday" ? (mode === "work" ? "workday" : "playday") : screen;
  const handleNavClick = (id) => {
    if (id === "workday") { setScreen("workday"); setMode("work"); }
    else if (id === "playday") { setScreen("workday"); setMode("recreation"); }
    else setScreen(id);
  };

  return (
    <div className="app-shell min-h-screen" style={{ color: PAPER, fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <style>{FONTS}</style>
      <header className="glass-header sticky top-0 z-10 border-b px-4 sm:px-6 md:px-10 py-4 flex items-center justify-between flex-wrap gap-4" style={{ backgroundImage: "linear-gradient(180deg, rgba(246,252,252,0.92) 0%, rgba(220,239,234,0.86) 100%)", borderColor: BORDER }}>
        <div
          className="brand-pill flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-full"
          style={{ backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0.92) 0%, ${AMBER}18 52%, ${OLIVE}20 100%)`, border: `1px solid ${BORDER}` }}
        >
          <FTMYLogo />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em" }} className="text-2xl leading-none">FIT MY TRUCK</span>
        </div>
        <nav aria-label="Primary" style={{ fontFamily: "'JetBrains Mono', monospace" }} className="grid grid-cols-2 md:flex md:items-center gap-2 text-xs uppercase tracking-wider w-full md:w-auto">
          {NAV.map((n) => {
            const active = activeNavId === n.id;
            return (
              <button
                aria-current={active ? "page" : undefined}
                key={n.id}
                onClick={() => handleNavClick(n.id)}
                className="nav-chip px-4 py-2 rounded-full border-2 transition-all text-center"
                style={{
                  borderColor: OLIVE,
                  backgroundImage: active ? `linear-gradient(90deg, ${AMBER} 0%, ${AMBER}CC 100%)` : "none",
                  backgroundColor: "transparent",
                  color: active ? "#FFFFFF" : OLIVE,
                }}
              >
                {n.label}
              </button>
            );
          })}
        </nav>
      </header>
      <section className="app-stage px-4 sm:px-6 md:px-10 py-8 sm:py-12 md:py-16">
        {screen === "workday" && <BuildMyWorkdayScreen {...sharedProps} />}
        {screen === "map" && <WaypointScreen {...sharedProps} />}
        {screen === "matching" && <FindMyTruckScreen {...sharedProps} />}
        {screen === "fleet" && <FleetScreen vehicleId={vehicleId} setVehicleId={setVehicleId} vehicleFits={vehicleFits} vehicleYear={vehicleYear} />}
        <PhotoCredits />
      </section>
    </div>
  );
}


======== FILE: src/App.test.jsx ========
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import FitMyTruckApp from "./App";

describe("FitMyTruckApp", () => {
  it("renders the primary mobile MVP choices", () => {
    const html = renderToString(<FitMyTruckApp />);
    expect(html).toContain("Build My Workday");
    expect(html).toContain("Build My Play Day");
    expect(html).toContain("Map My Day");
    expect(html).toContain("Find My Truck");
    expect(html).toContain("FleetFit");
  });

  it("keeps Find My Truck out of the primary pill row and shows a bottom search card instead", () => {
    const html = renderToString(<FitMyTruckApp />);
    const nav = html.match(/<nav aria-label="Primary"[^>]*>[\s\S]*?<\/nav>/)?.[0] ?? "";
    expect(nav).toContain("Build My Workday");
    expect(nav).toContain("Build My Play Day");
    expect(nav).toContain("Map My Day");
    expect(nav).toContain("FleetFit");
    expect(nav).not.toContain("Find My Truck");
    expect(html).toContain("find-fits-cta");
    expect(html).toContain("find-truck-cta");
    expect(html).toContain("See What Fits This Workday");
  });

  it("renders the Phase 1 Workday Fit assessment journey", () => {
    const html = renderToString(<FitMyTruckApp />);
    expect(html).toContain("Electrical");
    expect(html).toContain("Pool Service");
    expect(html).toContain("Landscaping / Lawn");
    expect(html).toContain("Property Maintenance / Handyman");
    expect(html).toContain("Construction / Remodel");
    expect(html).toContain("Type your trade");
    expect(html).not.toContain("Battery-Powered Lawn / Landscaping");
    expect(html).not.toContain("Locksmith");
    expect(html).not.toContain("More trades");
    expect(html).toContain("Number of stops");
    expect(html).toContain("Overflow trailer");
    expect(html).toContain("16-ft open");
    expect(html).toContain("12-ft enclosed");
    expect(html).toContain("10-ft enclosed");
    expect(html).toContain("Trade kit on the truck");
    expect(html).toContain("Select the ones that apply.");
    expect(html).toContain("Type IA extension");
    expect(html).toContain("Working wire");
    expect(html).toContain("Additional 300 lb miscellaneous");
    expect(html).toContain("Additional 500 lb miscellaneous");
    expect(html).not.toContain("12V cooler");
    expect(html).toContain("Bed accessories");
    expect(html).toContain("Select all that apply.");
    expect(html).toContain("Bed drawers / slide-out storage");
    expect(html).toContain("27-gal totes");
    expect(html).toContain("Soft tri-fold tonneau");
    expect(html).toContain("Hard folding tonneau");
    expect(html).toContain("Ladder / commercial rack");
    expect(html).toContain("Headache rack");
    expect(html).toContain("Crossbed toolbox");
    expect(html).toContain("Full bed liner");
    expect(html).toContain("Cargo net");
    expect(html).not.toContain("None / open bed");
    expect(html).toContain("Unknown");
    expect(html).toContain("Rough monthly fuel / gas savings");
    expect(html).toContain("Annual savings");
    expect(html).not.toContain("Break-even");
    expect(html).not.toContain("break-even");
    expect(html).toContain("Home, shop, or daytime charging");
    expect(html).toContain("Workday Fit");
    expect(html).toContain("Driving energy");
    expect(html).toContain("Equipment energy");
    expect(html).toContain("End-of-day reserve");
    expect(html).toContain("Load penalty");
    expect(html).toContain("Real-world range");
    expect(html).toContain("How load hits range");
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain("Battery Pack");
    expect(html).toContain("Assumptions and limitations");
    expect(html).toContain("Same workday, other trucks");
    expect(html).toContain("My current truck");
    expect(html).toContain("Shop home chargers");
    expect(html).toContain("Clear all");
    expect(html).toContain("Clear all kit selections");
    expect(html).toContain("Refresh results");
    expect(html).not.toContain("Can an EV Handle Me?");
    expect(html).toContain("When this is not a good fit");
    expect(html).toContain("That&#x27;s the demo estimate");
    expect(html).toContain('alt="2022 Rivian R1T"');
    expect(html).toContain("commons.wikimedia.org/wiki/Special:FilePath");
    expect(html).toContain("2022_Rivian_R1T_Adventure");
    expect(html).not.toContain("vehicles/r1t-2022.webp");
    expect(html).not.toContain("Illustrated build preview");
    expect(html).not.toContain("OUTFITTED BED");
  });
});


======== FILE: src/calculations.js ========
import { jobFitForTrade, overflowTrailerById } from "./data";

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const DEMO_KWH_PER_100_MI = 48;
export const DEMO_KWH_PER_STOP = 0.4;
export const RESERVE_TARGET_PCT = 20;

// Cargo / kit mass derate — separate from towing and from tool watt-hours.
// A highway trailer is a 25–55% hit (aero + tongue + rolling). In-bed kit
// (ladders, wire, chemical totes, extra packs) is mostly extra mass, so we
// use a milder curve: 12% range loss at the truck's payload rating, 15% if
// the load is piled past rating. Reviewed September 2026; directional only.
export const CARGO_DERATE_AT_CAPACITY = 0.12;
export const CARGO_DERATE_OVER_CAP_EXTRA = 0.03;

// Discrete selection-aware docks subtracted from capabilityFit so every
// vehicle display moves in visible 1 / 3 / 5 point hits.
export const FIT_DOCK = {
  BED_WEIGHT: 1,
  KIT_WEIGHT: 1,
  CONFIG_RANGE: 1,
  PAYLOAD_NEAR: 3,
  TOW_NEAR: 3,
  RANGE_TIGHT: 3,
  NO_OVERNIGHT: 3,
  PAYLOAD_EXCEED: 5,
  TOW_EXCEED: 5,
  RANGE_MISS: 5,
};

export function splitEquipmentMass(equipmentItems = []) {
  let bedWeightLbs = 0;
  let kitWeightLbs = 0;
  for (const item of equipmentItems) {
    const weight = Math.max(0, Number(item.weightLbs) || 0);
    if (String(item.id || "").startsWith("bed-")) bedWeightLbs += weight;
    else kitWeightLbs += weight;
  }
  return { bedWeightLbs, kitWeightLbs };
}

const round1 = (value) => Math.round(value * 10) / 10;

export function configRange(vehicle, config, selection = {}) {
  const packs = config?.packs ?? [];
  const motors = config?.motors ?? [];
  const wheels = config?.wheels ?? [];
  const pack = packs.find((item) => item.id === selection.pack) || packs[0] || { rangeMod: 0 };
  const motor = motors.find((item) => item.id === selection.motor) || motors[0] || { effMod: 0 };
  const wheel = wheels.find((item) => item.id === selection.wheel) || wheels[0] || { effMod: 0 };
  const base = (Number(vehicle?.baseRange) || 0) + (Number(pack.rangeMod) || 0);
  return base * (1 + (Number(motor.effMod) || 0)) * (1 + (Number(wheel.effMod) || 0));
}

export function equipmentEnergyKwh(items = []) {
  return items.reduce((sum, item) => {
    const watts = Math.max(0, Number(item.watts) || 0);
    const hours = Math.max(0, Number(item.hours) || 0);
    return sum + (watts * hours) / 1000;
  }, 0);
}

export function equipmentWeightLbs(items = []) {
  return items.reduce((sum, item) => sum + Math.max(0, Number(item.weightLbs) || 0), 0);
}

export function equipmentTrailerLbs(items = []) {
  return items.reduce((sum, item) => sum + Math.max(0, Number(item.trailerWeightLbs) || 0), 0);
}

// When an overflow trailer is selected, previously selected kit/bed cargo leaves
// the bed and becomes trailer load. Leftover "payload in truck" (people / leftover
// cargo) stays as payload. Bed overflow must not DQ cargo that moved to the trailer.
export function allocateWorkdayLoad({
  payloadWeight = 0,
  trailerWeight = 0,
  equipmentItems = [],
  overflowTrailerId = "none",
} = {}) {
  const leftoverBedLbs = Math.max(0, Number(payloadWeight) || 0);
  const kitAndBedCargoLbs = equipmentWeightLbs(equipmentItems);
  const existingTrailerLbs = Math.max(0, Number(trailerWeight) || 0) + equipmentTrailerLbs(equipmentItems);
  const overflow = overflowTrailerById(overflowTrailerId);
  const overflowEmptyLbs = Math.max(0, Number(overflow?.emptyWeightLbs) || 0);
  const overflowSelected = overflow?.id && overflow.id !== "none";

  if (!overflowSelected) {
    return {
      overflowSelected: false,
      overflowTrailer: overflow,
      overflowEmptyLbs: 0,
      leftoverBedLbs,
      kitAndBedCargoLbs,
      movedCargoLbs: 0,
      bedPayloadLbs: leftoverBedLbs + kitAndBedCargoLbs,
      trailerLbs: existingTrailerLbs,
    };
  }

  return {
    overflowSelected: true,
    overflowTrailer: overflow,
    overflowEmptyLbs,
    leftoverBedLbs,
    kitAndBedCargoLbs,
    movedCargoLbs: kitAndBedCargoLbs,
    bedPayloadLbs: leftoverBedLbs,
    trailerLbs: existingTrailerLbs + overflowEmptyLbs + kitAndBedCargoLbs,
  };
}

export function cargoPenalty(payloadWeight, payloadCapacity) {
  const payload = Math.max(0, Number(payloadWeight) || 0);
  const capacity = Math.max(1, Number(payloadCapacity) || 1);
  if (payload === 0) return 0;
