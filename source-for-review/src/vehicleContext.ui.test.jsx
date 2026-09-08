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
