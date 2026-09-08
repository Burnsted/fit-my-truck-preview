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
