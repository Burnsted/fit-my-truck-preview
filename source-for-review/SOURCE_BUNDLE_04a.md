======== FILE: src/theme.js ========
export const FONTS = "@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Poppins:wght@900&family=Permanent+Marker&display=swap');";

export const BG = "#E7F7FB", PANEL = "#FFFFFF", BORDER = "#AEDCEA", AMBER = "#0077B6", RUST = "#B03A1F",
  OLIVE = "#22A559", PAPER = "#0F2A24", MUTED = "#5A7D77", TEXT = "#2E5651", TEAL = "#0E7C86";
export const ZONE_MID = "#0077B6";

export const PANEL_GRADIENT = "linear-gradient(155deg, #FFFFFF 0%, #D3F3E0 100%)";
export const DIAL_GRADIENT_STOPS = { center: "#D6F0FA", edge: "#B0601E" };
export const DATA_LAST_REVIEWED = "August 2026";

export const zoneColor = (s) => (s < 40 ? RUST : s < 70 ? ZONE_MID : OLIVE);


======== FILE: src/vehicleContext.ui.test.jsx ========
/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import FitMyTruckApp from "./App";

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

describe("shared vehicle selection", () => {
  let root;
  let container;

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
  });

  it("carries the selected truck and photo from Workday to Map My Day and Find My Truck", () => {
    ({ container, root } = mountApp());
    expect(container.textContent).toMatch(/Rivian R1T/);

    clickButton(container, /Rivian R1T/);
    clickButton(container, /F-150 Lightning/);
    expect(container.textContent).toMatch(/Ford F-150 Lightning/);
    expect(container.querySelector('img[alt="2022 Ford F-150 Lightning"]')).toBeTruthy();

    clickButton(container, /^Map My Day$/);
    expect(container.textContent).toMatch(/These range numbers are for/);
    expect(container.textContent).toMatch(/Ford F-150 Lightning/);
    expect(container.textContent).toMatch(/Rated range \(Ford F-150 Lightning\)/);
    expect(container.querySelector('img[alt="2022 Ford F-150 Lightning"]')).toBeTruthy();
    expect(container.querySelector("[data-testid=map-my-day]")).toBeTruthy();
    expect(container.querySelector('img[src*="scenes/map.webp"]')).toBeFalsy();
    expect(container.textContent).toMatch(/OpenStreetMap|topographic|Wintergreen|Keystone/i);
    expect(container.innerHTML).not.toContain("mapGrid");
    expect(container.innerHTML).not.toContain("mapFill");
    expect(container.innerHTML).not.toContain("visual-graphic");

    clickButton(container, /Find My Truck/);
    expect(container.textContent).toMatch(/Your current pick/);
    expect(container.textContent).toMatch(/Your pick/);
    expect(container.querySelector('img[alt="2022 Ford F-150 Lightning"]')).toBeTruthy();
    expect(container.querySelector('button[aria-pressed="true"]')?.textContent).toMatch(/F-150 Lightning/);

    clickButton(container, /^Map My Day$/);
    expect(container.textContent).toMatch(/Rated range \(Ford F-150 Lightning\)/);

    clickButton(container, /^Build My Workday$/);
    expect(container.textContent).toMatch(/Ford F-150 Lightning/);
    expect(container.querySelector('img[alt="2022 Ford F-150 Lightning"]')).toBeTruthy();
  });

  it("opens Find My Truck from the bottom search card, not the primary pills", () => {
    ({ container, root } = mountApp());
    const nav = container.querySelector('nav[aria-label="Primary"]');
    expect(nav).toBeTruthy();
    expect(nav.textContent).not.toMatch(/Find My Truck/);
    expect([...nav.querySelectorAll("button")].map((button) => button.textContent.trim())).toEqual([
      "Build My Workday",
      "Build My Play Day",
      "Map My Day",
      "FleetFit",
    ]);

    const cta = container.querySelector("[data-testid=find-fits-cta]");
    expect(cta).toBeTruthy();
    expect(cta.className).toMatch(/find-truck-cta/);
    expect(cta.className).not.toMatch(/nav-chip/);
    expect(cta.querySelector("svg")).toBeTruthy();
    expect(cta.textContent).toMatch(/See What Fits This Workday/);

    clickButton(container, /Rivian R1T/);
    clickButton(container, /F-150 Lightning/);
    const findCta = container.querySelector("[data-testid=find-fits-cta]");
    expect(findCta).toBeTruthy();
    act(() => {
      findCta.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.textContent).toMatch(/Your current pick/);
    expect(container.textContent).toMatch(/Everything's in the running/);
    expect(container.querySelector('img[alt="2022 Ford F-150 Lightning"]')).toBeTruthy();
    expect(container.querySelector('nav[aria-label="Primary"]')?.textContent).not.toMatch(/Find My Truck/);
  });
});


======== FILE: src/vehicleImages.test.js ========
import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  COMMONS_FILEPATH,
  SCENE_IMAGES,
  VEHICLE_CONFIGS,
  VEHICLE_OPTIONS,
  commonsFileName,
  commonsFilePath,
  resolveVehiclePhoto,
  vehicleYearOptions,
} from "./data";

const root = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "..");

describe("vehicle photos", () => {
  it("gives each selectable vehicle a hosted Commons photo and thumb", () => {
    const urls = VEHICLE_OPTIONS.map((vehicle) => vehicle.imageUrl);
    const thumbs = VEHICLE_OPTIONS.map((vehicle) => vehicle.imageThumbUrl);

    expect(urls.every(Boolean)).toBe(true);
    expect(thumbs.every(Boolean)).toBe(true);
    expect(new Set(urls).size).toBe(VEHICLE_OPTIONS.length);
    expect(new Set(thumbs).size).toBe(VEHICLE_OPTIONS.length);

    for (const vehicle of VEHICLE_OPTIONS) {
      expect(vehicle.imageUrl).toContain(COMMONS_FILEPATH);
      expect(vehicle.imageThumbUrl).toContain(COMMONS_FILEPATH);
      expect(vehicle.imageThumbUrl).toMatch(/[?&]width=480\b/);
      expect(vehicle.imageUrl).not.toBe(vehicle.imageThumbUrl);
      expect(vehicle.imageUrl).not.toMatch(/vehicles\/.+\.webp/);
      expect(vehicle.commonsFile).toBeTruthy();
      expect(vehicle.imageCredit).toBeTruthy();
      expect(vehicle.imageLicense).toBeTruthy();
      expect(vehicle.imageSourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    }
  });

  it("uses a distinct Commons still per model year, not per pack or motor", () => {
    for (const vehicle of VEHICLE_OPTIONS) {
      const years = vehicleYearOptions(vehicle);
      const urls = years.map((year) => resolveVehiclePhoto(vehicle, year).imageUrl);
      expect(new Set(urls).size).toBe(years.length);
      for (const year of years) {
        const shot = resolveVehiclePhoto(vehicle, year);
        expect(shot.commonsFile).toBeTruthy();
        expect(shot.imageUrl).toBe(commonsFilePath(shot.commonsFile, 1280));
        expect(shot.imageThumbUrl).toBe(commonsFilePath(shot.commonsFile, 480));
        expect(shot.imageUrl).toContain(encodeURIComponent(commonsFileName(shot.commonsFile)));
        expect(shot.imageCredit).toBeTruthy();
        expect(shot.imageLicense).toBeTruthy();
        const localHero = path.join(root, "public", "vehicles", `${vehicle.id}-${year}.webp`);
        const localThumb = path.join(root, "public", "vehicles", `${vehicle.id}-${year}-thumb.webp`);
        expect(existsSync(localHero), localHero).toBe(true);
        expect(existsSync(localThumb), localThumb).toBe(true);
      }
      const hashes = years.map((year) => {
        const bytes = readFileSync(path.join(root, "public", "vehicles", `${vehicle.id}-${year}.webp`));
        return createHash("sha256").update(bytes).digest("hex");
      });
      expect(new Set(hashes).size, `${vehicle.id} year photos must be distinct files`).toBe(years.length);
    }
  });

  it("stores an inline wheel graphic for every wheel option so preview cannot 404", () => {
    for (const [vehicleId, config] of Object.entries(VEHICLE_CONFIGS)) {
      const urls = config.wheels.map((wheel) => wheel.imageUrl);
      expect(urls.every(Boolean), vehicleId).toBe(true);
      expect(new Set(urls).size).toBe(config.wheels.length);
      for (const wheel of config.wheels) {
        expect(wheel.imageUrl.startsWith("data:image/svg+xml")).toBe(true);
        expect(wheel.imageUrl).not.toMatch(/\/vehicles\/wheels\//);
      }
    }
  });

  it("keeps scene photos on real Unsplash image URLs, not photo pages", () => {
    for (const scene of Object.values(SCENE_IMAGES)) {
      expect(scene.url).toMatch(/^https:\/\/images\.unsplash\.com\/photo-/);
      expect(scene.url).not.toMatch(/unsplash\.com\/photos\//);
      expect(scene.license).toMatch(/Unsplash/i);
      expect(scene.sourceUrl).toMatch(/^https:\/\/unsplash\.com\/photos\//);
      expect(scene.alt).toBeTruthy();
    }
  });

  it("does not use a printed-atlas backdrop for Map My Day", () => {
    expect(SCENE_IMAGES.map).toBeUndefined();
    expect(Object.keys(SCENE_IMAGES)).toEqual(expect.arrayContaining(["workday", "playday", "fleet"]));
  });
});


======== FILE: src/workdayKit.ui.test.jsx ========
/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import FitMyTruckApp from "./App";

function mountApp() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<FitMyTruckApp />);
  });
  return { container, root };
}

function realWorldRange(container) {
  const el = container.querySelector("[data-testid=real-world-range]");
  if (el) return Number(String(el.textContent || "").replace(/[^\d.-]/g, ""));
  const match = container.textContent.match(/Real-world range\s*(-?\d+)\s*mi/);
  return match ? Number(match[1]) : null;
}

function loadPenaltyPct(container) {
  const el = container.querySelector("[data-testid=load-penalty]");
  const source = el?.textContent || container.textContent;
  const match = String(source).match(/Load penalty\s*-(\d+)%/) || String(el?.textContent || "").match(/-(\d+)%/);
  return match ? Number(match[1]) : null;
}

function clickNamedControl(container, pattern) {
  const checkboxLabel = [...container.querySelectorAll("label")].find((el) => (
    pattern.test(el.textContent || "") && el.querySelector("input[type=checkbox]")
  ));
  const target = checkboxLabel || [...container.querySelectorAll("button")].find((el) => pattern.test(el.textContent || ""));
  expect(target, `missing control ${pattern}`).toBeTruthy();
  act(() => {
    const input = target.querySelector?.("input[type=checkbox]");
    if (input) input.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    else target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

function setTrade(container, name) {
  const select = container.querySelector("select[aria-label=\"What's your trade?\"]");
  expect(select).toBeTruthy();
  act(() => {
    const proto = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value");
    proto.set.call(select, name);
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

describe("live kit mass range", () => {
  let root;
  let container;

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
  });

  it("drops real-world range when a heavier kit item is added and recovers when it is removed", () => {
    ({ container, root } = mountApp());
    const baseline = realWorldRange(container);
    const baselinePenalty = loadPenaltyPct(container);
    expect(baseline).toBeGreaterThan(0);
    expect(container.textContent).toMatch(/Type IA extension/i);
    expect(container.textContent).not.toMatch(/12V cooler/i);

    clickNamedControl(container, /ladder crew set/i);
    const heavier = realWorldRange(container);
    const heavierPenalty = loadPenaltyPct(container);
    expect(heavier).toBeLessThan(baseline);
    expect(heavierPenalty).toBeGreaterThanOrEqual(baselinePenalty);

    clickNamedControl(container, /ladder crew set/i);
    expect(realWorldRange(container)).toBe(baseline);
  });

  it("replaces the kit and range when the trade changes", () => {
    ({ container, root } = mountApp());
    const electricianRange = realWorldRange(container);
    setTrade(container, "Landscaping / Lawn");
    expect(container.textContent).toMatch(/Crew trailer/i);
    expect(container.textContent).not.toMatch(/Working wire \(250 ft/i);
    const lawnRange = realWorldRange(container);
    expect(lawnRange).toBeLessThan(electricianRange);
    expect(loadPenaltyPct(container)).toBeGreaterThan(10);
  });

  it("adds miscellaneous payload weight and derates range without watt-hours", () => {
    ({ container, root } = mountApp());
    const baseline = realWorldRange(container);
    expect(container.textContent).toMatch(/Select the ones that apply/i);
    expect(container.textContent).toMatch(/Additional 300 lb miscellaneous/i);
    clickNamedControl(container, /Additional 300 lb miscellaneous/i);
    expect(realWorldRange(container)).toBeLessThan(baseline);
    expect(container.textContent).not.toMatch(/Additional 300 lb miscellaneous[\s\S]{0,80}kWh/i);
  });

  it("shows unknown charging as a conservative option", () => {
    ({ container, root } = mountApp());
    expect(container.textContent).toMatch(/Unknown — not sure yet/i);
    const unknown = [...container.querySelectorAll("label")].find((el) => /Unknown — not sure yet/i.test(el.textContent || ""));
    expect(unknown).toBeTruthy();
    act(() => {
      unknown.querySelector("input[type=radio]").dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.textContent).toMatch(/mid start charge/i);
    expect(container.textContent).toMatch(/no assumed overnight/i);
  });

  it("keeps the savings box to monthly and annual only", () => {
    ({ container, root } = mountApp());
    expect(container.textContent).toMatch(/Rough monthly fuel \/ gas savings/i);
    expect(container.textContent).toMatch(/Annual savings/i);
    expect(container.textContent).not.toMatch(/Break-even/i);
  });

  it("shows bed accessories for electrician and hides the picker for pool service", () => {
    ({ container, root } = mountApp());
    expect(container.textContent).toMatch(/Select all that apply/i);
    expect(container.textContent).toMatch(/Bed drawers \/ slide-out storage/i);
    expect(container.textContent).toMatch(/27-gal totes/i);
    expect(container.textContent).toMatch(/Ladder \/ commercial rack/i);
    expect(container.textContent).toMatch(/Headache rack/i);
    expect(container.textContent).toMatch(/Crossbed toolbox/i);
    const radios = [...container.querySelectorAll("input[name=bed-accessory][type=radio]")];
    expect(radios).toHaveLength(0);
    const baseline = realWorldRange(container);
    clickNamedControl(container, /Bed drawers \/ slide-out storage/i);
    const withDrawers = realWorldRange(container);
    expect(withDrawers).toBeLessThan(baseline);
    expect(container.textContent).toMatch(/bed upfit est/i);
    clickNamedControl(container, /Ladder \/ commercial rack/i);
    expect(realWorldRange(container)).toBeLessThan(withDrawers);
    expect(container.textContent).toMatch(/\$2,?466/);

    setTrade(container, "Pool Service");
    expect(container.textContent).not.toMatch(/Bed drawers \/ slide-out storage/i);
    expect(container.textContent).toMatch(/route truck or trailer crew/i);
  });

