    charging: chargingOption("home"),
    equipmentItems: equipmentItemsFromIds(["extension-ladder", "wire-spools", "hand-tool-chargers"]),
    categoryScore: 93,
    categoryLabel: "Electrician",
    vehicleName: "Rivian R1T",
  };

  it("drops remaining charge, reserve, and fit when routed miles grow", async () => {
    const wintergreen = SEED_PLACES.find((place) => place.id === "wintergreen-keystone");
    const resort = SEED_PLACES.find((place) => place.id === "keystone-resort");
    const far = { lat: 36.1699, lon: -115.1398 };
    const shortStops = applyLegMiles(
      [placeToStop(1, wintergreen), placeToStop(2, resort)],
      (await routeStops([placeToStop(1, wintergreen), placeToStop(2, resort)])).legs,
    );
    const longStops = applyLegMiles(
      [placeToStop(1, wintergreen), placeToStop(2, { ...resort, ...far, id: "vegas" })],
      (await routeStops([placeToStop(1, wintergreen), placeToStop(2, { ...resort, ...far, id: "vegas" })])).legs,
    );
    const shortMiles = totalRouteMiles(shortStops);
    const longMiles = totalRouteMiles(longStops);
    expect(longMiles).toBeGreaterThan(shortMiles);

    const shortPlan = planRoute({ stops: shortStops, vehicleRange: 328, startCharge: 100, coldWeather: false });
    const longPlan = planRoute({ stops: longStops, vehicleRange: 328, startCharge: 100, coldWeather: false });
    expect(longPlan.finalCharge).toBeLessThan(shortPlan.finalCharge);

    const shortFit = workdayAssessment({ ...electricianDay, dailyMiles: shortMiles, configRange: 328 });
    const longFit = workdayAssessment({ ...electricianDay, dailyMiles: longMiles, configRange: 328 });
    expect(longFit.reserve.pct).toBeLessThan(shortFit.reserve.pct);
    expect(longFit.energy.totalKwh).toBeGreaterThan(shortFit.energy.totalKwh);
    expect(longFit.fitScore).toBeLessThan(shortFit.fitScore);
  });

  it("formats a selected place as the stop label", () => {
    const place = SEED_PLACES[0];
    expect(formatPlaceLabel(place)).toMatch(/Wintergreen/);
    expect(formatPlaceLabel(place)).toMatch(/Keystone/);
  });
});


======== FILE: src/index.css ========
@import "tailwindcss";

:root {
  color-scheme: light;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  --ink: #0f2a24;
  --blue: #0077b6;
  --green: #22a559;
  --sky: #d6f0fa;
  --mint: #d3f3e0;
  --line: rgba(78, 151, 148, 0.28);
}

* {
  box-sizing: border-box;
}

html {
  min-width: 320px;
  background: #e7f7fb;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background: #d9f2ef;
}

button,
input,
select {
  font: inherit;
}

button,
select,
input[type="checkbox"],
input[type="range"] {
  touch-action: manipulation;
}

button:focus-visible,
input:focus-visible,
select:focus-visible,
a:focus-visible {
  outline: 3px solid #0077b6;
  outline-offset: 3px;
}

.app-shell {
  position: relative;
  isolation: isolate;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 8% 8%, rgba(255, 255, 255, 0.92) 0 6%, transparent 30%),
    radial-gradient(circle at 92% 16%, rgba(0, 119, 182, 0.2) 0 8%, transparent 34%),
    radial-gradient(circle at 84% 78%, rgba(34, 165, 89, 0.18) 0 10%, transparent 36%),
    radial-gradient(circle at 10% 88%, rgba(14, 124, 134, 0.14) 0 9%, transparent 34%),
    linear-gradient(145deg, #eaf8fb 0%, #d8f1ee 42%, #e7f7eb 100%);
}

.app-shell::before {
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  content: "";
  opacity: 0.52;
  background-image:
    linear-gradient(rgba(0, 119, 182, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 165, 89, 0.06) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(to bottom, black, transparent 86%);
}

.app-shell::after {
  position: fixed;
  inset: -20%;
  z-index: -1;
  pointer-events: none;
  content: "";
  background:
    conic-gradient(from 210deg at 70% 30%, transparent 0 30%, rgba(255, 255, 255, 0.52) 36%, transparent 43% 100%);
  filter: blur(24px);
  opacity: 0.8;
}

.glass-header {
  box-shadow: 0 12px 36px rgba(15, 42, 36, 0.1);
  backdrop-filter: blur(18px) saturate(1.25);
}

.brand-pill {
  box-shadow:
    0 10px 28px rgba(0, 119, 182, 0.13),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.nav-chip {
  min-height: 42px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.nav-chip:hover {
  transform: translateY(-1px);
  box-shadow:
    0 8px 18px rgba(15, 42, 36, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.find-truck-cta {
  border-radius: 16px;
  box-shadow:
    0 14px 36px rgba(15, 42, 36, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.find-truck-cta-icon {
  border-radius: 12px;
}

.price-ribbon {
  box-shadow: 0 8px 28px rgba(15, 42, 36, 0.07);
  backdrop-filter: blur(12px);
}

.app-stage {
  position: relative;
  z-index: 1;
}

.app-stage .border {
  border-color: var(--line) !important;
  border-radius: 18px;
  box-shadow:
    0 14px 36px rgba(15, 42, 36, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.88);
}

.app-stage input.border,
.app-stage select.border,
.app-stage button.border,
.app-stage .border-b {
  border-radius: 10px;
  box-shadow: none;
}

.app-stage button {
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;
}

.app-stage button:hover {
  transform: translateY(-1px);
}

.visual-card {
  border-radius: 24px !important;
  box-shadow:
    0 22px 52px rgba(15, 42, 36, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.95) !important;
}

.visual-graphic {
  background: transparent;
}

.visual-photo {
  background: #d6f0fa;
}

@media (prefers-reduced-motion: no-preference) {
  .app-stage > div {
    animation: stage-in 320ms ease-out both;
  }

  @keyframes stage-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.map-my-day-canvas {
  min-height: 220px;
  height: 46vw;
  max-height: 340px;
  background:
    linear-gradient(180deg, rgba(215, 228, 210, 0.35), rgba(180, 198, 168, 0.5)),
    repeating-linear-gradient(0deg, rgba(80, 110, 70, 0.08) 0 1px, transparent 1px 18px),
    repeating-linear-gradient(90deg, rgba(80, 110, 70, 0.08) 0 1px, transparent 1px 18px),
    #c5d4b8;
}

.map-my-day-canvas .leaflet-container {
  width: 100%;
  height: 100%;
  min-height: 220px;
  background: #c5d4b8;
  font: inherit;
}

.map-stop-pin {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  color: #fff;
  font: 700 12px "JetBrains Mono", monospace;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(15, 42, 36, 0.28);
}

.place-suggestions {
  border-radius: 12px;
}

@media (max-width: 480px) {
  .app-shell::before {
    background-size: 28px 28px;
    opacity: 0.38;
  }

  .visual-card {
    border-radius: 18px !important;
  }

  .map-my-day-canvas {
    height: 220px;
  }
}


======== FILE: src/main.jsx ========
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FitMyTruckApp from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FitMyTruckApp />
  </StrictMode>,
);


======== FILE: src/mapMyDay.ui.test.jsx ========
/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import FitMyTruckApp from "./App";
import { matchSeedPlaces, totalRouteMiles, defaultMapStops } from "./geo";

function mountApp() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<FitMyTruckApp />);
  });
  return { container, root };
}

function clickButton(container, pattern) {
  const target = [...container.querySelectorAll("button")].find((el) => pattern.test(el.textContent || ""));
  expect(target, `missing button ${pattern}`).toBeTruthy();
  act(() => {
    target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  return target;
}

function typeInput(input, value) {
  act(() => {
    const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
    proto.set.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.focus();
    input.dispatchEvent(new Event("focus", { bubbles: true }));
  });
}

describe("Map My Day places and live miles", () => {
  let root;
  let container;

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
  });

  it("shows a topo map canvas and place autocomplete instead of an atlas photo", () => {
    ({ container, root } = mountApp());
    clickButton(container, /^Map My Day$/);
    expect(container.querySelector("[data-testid=map-my-day]")).toBeTruthy();
    expect(container.querySelector('img[src*="scenes/map.webp"]')).toBeFalsy();
    expect(container.textContent).toMatch(/OpenStreetMap|OpenTopoMap|topographic/i);
    const start = container.querySelector('input[aria-label="Start address"]');
    expect(start).toBeTruthy();
    expect(start.getAttribute("role")).toBe("combobox");
    expect(container.textContent).toMatch(/Wintergreen|Keystone/i);
    expect(container.querySelector("[data-testid=route-total-miles]")).toBeTruthy();
  });

  it("suggests Keystone when typing Wintergreen Apartments and fills the stop", () => {
    ({ container, root } = mountApp());
    clickButton(container, /^Map My Day$/);
    const start = container.querySelector('input[aria-label="Start address"]');
    typeInput(start, "Wintergreen Apartments");
    const suggestions = container.querySelector("[data-testid=place-suggestions]");
    expect(suggestions).toBeTruthy();
    expect(suggestions.textContent).toMatch(/Wintergreen/i);
    expect(suggestions.textContent).toMatch(/Keystone/i);

    const option = [...suggestions.querySelectorAll("button")].find((el) => /Wintergreen/i.test(el.textContent || ""));
    expect(option).toBeTruthy();
    act(() => {
      option.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(start.value).toMatch(/Wintergreen/i);
  });

  it("suggests the resort for Keystone Ski Area and updates live miles plus battery", () => {
    ({ container, root } = mountApp());
    clickButton(container, /^Map My Day$/);
    const finish = container.querySelector('input[aria-label="Finish address"]');
    const beforeMiles = Number(container.querySelector("[data-testid=map-daily-miles]")?.textContent || "0");
    expect(beforeMiles).toBeGreaterThan(0);
    expect(container.textContent).toMatch(/Home with charge to spare/i);

    typeInput(finish, "Keystone Ski Area");
    const suggestions = container.querySelector("[data-testid=place-suggestions]");
    expect(suggestions?.textContent).toMatch(/Keystone Ski Resort/i);
    const option = [...suggestions.querySelectorAll("button")].find((el) => /Ski Resort/i.test(el.textContent || ""));
    act(() => {
      option.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(finish.value).toMatch(/Keystone/i);

    const afterMiles = Number(container.querySelector("[data-testid=map-daily-miles]")?.textContent || "0");
    expect(afterMiles).toBeGreaterThan(0);
    expect(container.querySelector("[data-testid=map-final-charge]")).toBeTruthy();
    expect(container.querySelector("[data-testid=map-live-fit]")).toBeTruthy();
    expect(Number(container.querySelector("[data-testid=map-fit-score]")?.textContent)).toBeGreaterThan(0);
  });

  it("carries mapped miles back to Workday instead of resetting the trade default", () => {
    ({ container, root } = mountApp());
    const seeded = totalRouteMiles(defaultMapStops());
    clickButton(container, /^Map My Day$/);
    const mapped = Number(container.querySelector("[data-testid=map-daily-miles]")?.textContent || "0");
    expect(mapped).toBeCloseTo(seeded, 0);

    clickButton(container, /^Build My Workday$/);
    const milesInput = container.querySelector('input[aria-label="Daily miles"]');
    expect(Number(milesInput.value)).toBeCloseTo(mapped, 0);
    expect(Number(milesInput.value)).not.toBe(58);
  });

  it("recalculates remaining battery and fit when starting charge drops to 80%", () => {
    ({ container, root } = mountApp());
    clickButton(container, /^Map My Day$/);
    const slider = container.querySelector('input[aria-label="Starting charge"]');
    expect(slider).toBeTruthy();
    expect(Number(slider.value)).toBe(100);
    expect(container.querySelector("[data-testid=start-charge-control]")).toBeTruthy();

    const reserveAtFull = Number(String(container.querySelector("[data-testid=map-fit-reserve]")?.textContent || "").replace(/[^\d.-]/g, ""));
    const finalAtFull = container.querySelector("[data-testid=map-final-charge]")?.textContent || "";
    expect(reserveAtFull).toBeGreaterThan(50);
    expect(finalAtFull).toMatch(/Home with charge to spare/i);

    act(() => {
      const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
      proto.set.call(slider, "80");
      slider.dispatchEvent(new Event("input", { bubbles: true }));
      slider.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(container.querySelector("[data-testid=start-charge-value]")?.textContent).toBe("80%");
    const reserveAtEighty = Number(String(container.querySelector("[data-testid=map-fit-reserve]")?.textContent || "").replace(/[^\d.-]/g, ""));
    expect(reserveAtEighty).toBeLessThan(reserveAtFull);
    expect(reserveAtFull - reserveAtEighty).toBeGreaterThanOrEqual(15);

    clickButton(container, /^Build My Workday$/);
    expect(container.querySelector("[data-testid=start-charge-value]")?.textContent).toBe("80%");
    const workdayReserve = container.textContent.match(/End-of-day reserve\s*(-?\d+)%/);
    expect(workdayReserve).toBeTruthy();
    expect(Number(workdayReserve[1])).toBe(reserveAtEighty);
  });
});

describe("seed helper used by the UI", () => {
  it("keeps Wintergreen and Keystone Ski queries on the Keystone, CO places", () => {
    expect(matchSeedPlaces("Wintergreen Apartments")[0].address).toMatch(/Keystone/i);
    expect(matchSeedPlaces("Keystone Ski Area")[0].name).toMatch(/Keystone Ski Resort/i);
  });
});


======== FILE: src/screens/BuildMyWorkdayScreen.jsx ========
import { useEffect, useMemo, useRef, useState } from "react";
import { BatteryCharging, ExternalLink, Info } from "lucide-react";
import { applySelectedVehicleFit, compareWorkdayVehicles, configRange, operatingCosts, vehicleFitMap, workdayAssessment } from "../calculations";
import {
  CHARGERS,
  CHARGING_OPTIONS,
  CURRENT_TRUCK_PRESETS,
  HOME_CHARGER_SHOP,
  UNKNOWN_CHARGING_START_PCT,
  START_CHARGE_DEFAULT,
  START_CHARGE_MAX,
  START_CHARGE_MIN,
  VEHICLE_CONFIGS,
  VEHICLE_OPTIONS,
  BED_ACCESSORY_OPTIONS,
  MISC_PAYLOAD_OPTIONS,
  OVERFLOW_TRAILER_OPTIONS,
  PLAY_TOWABLE_OPTIONS,
  bedAccessoriesPriceUsd,
  bedAccessoryItemsFromIds,
  chargingOption,
  clampVehicleYear,
  defaultPlayGearIds,
  defaultPlayTowableId,
  equipmentItemsFromIds,
  playGearItemsFromIds,
  playGearOptionsForActivity,
  playTowableById,
  toggleBedAccessoryId,
  resolveTradeProfile,
  resolveVehiclePhoto,
  selectableEquipmentForTrade,
  tradeShowsBedAccessories,
  vehicleYearOptions,
} from "../data";
import {
  AMBER, BORDER, MUTED, OLIVE, PANEL, PANEL_GRADIENT, PAPER, RUST, TEAL,
} from "../theme";
import { ModeAndTradeSelector } from "../components/ModeAndTradeSelector";
import { PriceRibbon } from "../components/PriceRibbon";
import { TruckVisual } from "../components/TruckVisual";
import { WorkdayFitResult } from "../components/WorkdayFitResult";
import { BedAccessoryMultiSelect, KitMultiSelect } from "../components/KitMultiSelect";
import { FindMyTruckCta } from "../components/FindMyTruckCta";
