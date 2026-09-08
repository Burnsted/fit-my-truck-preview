    const years = [...year().options].map((option) => option.value);
    expect(years[0]).toBe("2024");
    expect(years).not.toContain("2023");
    expect(container.textContent).toMatch(/2024 Chevrolet Silverado EV/);
  });

  it("recalculates fuel savings immediately when the selected truck changes", () => {
    ({ container, root } = mountApp());
    const monthly = () => container.querySelector("[data-testid=monthly-savings]")?.textContent;
    const annual = () => container.querySelector("[data-testid=annual-savings]")?.textContent;
    const r1tMonthly = monthly();
    const r1tAnnual = annual();
    expect(r1tMonthly).toMatch(/\$/);
    expect(r1tAnnual).toMatch(/\$/);

    const dropdown = container.querySelector("button[aria-haspopup=listbox]");
    act(() => {
      dropdown.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const hummer = [...container.querySelector("[role=listbox]").querySelectorAll("button")].find((el) => /Hummer EV Pickup/.test(el.textContent || ""));
    expect(hummer).toBeTruthy();
    act(() => {
      hummer.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(monthly()).not.toBe(r1tMonthly);
    expect(annual()).not.toBe(r1tAnnual);
  });

  it("keeps typed-trade amounts live without inventing a convertibility percentage", () => {
    ({ container, root } = mountApp());
    setTrade(container, "Type your trade");
    const custom = container.querySelector("input[aria-label=\"Enter your trade\"]");
    act(() => {
      const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
      proto.set.call(custom, "mobile dog grooming");
      custom.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(container.querySelector("[data-testid=trade-convertibility]")?.textContent).toMatch(/No assumed convertibility score/i);
    expect(container.querySelector("[data-testid=trade-convertibility]")?.textContent).not.toMatch(/\d+%/);
    const tradeSelect = container.querySelector("select[aria-label=\"What's your trade?\"]");
    expect(tradeSelect.querySelector('option[value="Type your trade"]')?.textContent).not.toMatch(/%/);
    expect(container.querySelector("[data-testid=fit-summary]")?.textContent).toMatch(/mobile dog grooming/i);
    expect(container.textContent).toMatch(/This list belongs to mobile dog grooming/i);

    const miles = container.querySelector('input[aria-label="Daily miles"]');
    const before = container.querySelector("[data-testid=fit-summary]")?.textContent;
    const reserveBefore = container.textContent.match(/End-of-day reserve\s*(-?\d+)%/);
    act(() => {
      const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
      proto.set.call(miles, "140");
      miles.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(container.querySelector("[data-testid=fit-summary]")?.textContent).not.toBe(before);
    expect(container.querySelector("[data-testid=fit-summary]")?.textContent).toMatch(/140 miles/);
    const reserveAfter = container.textContent.match(/End-of-day reserve\s*(-?\d+)%/);
    expect(Number(reserveAfter?.[1])).toBeLessThan(Number(reserveBefore?.[1]));
  });

  it("rescues a heavy kit with an overflow trailer instead of auto-DQing on bed payload", () => {
    ({ container, root } = mountApp());
    const dropdown = container.querySelector("button[aria-haspopup=listbox]");
    act(() => {
      dropdown.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const hummer = [...container.querySelector("[role=listbox]").querySelectorAll("button")].find((el) => /Hummer EV Pickup/.test(el.textContent || ""));
    expect(hummer).toBeTruthy();
    act(() => {
      hummer.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    clickNamedControl(container, /Additional 500 lb miscellaneous/i);
    clickNamedControl(container, /ladder crew set/i);
    clickNamedControl(container, /Bed drawers \/ slide-out storage/i);

    const summary = () => container.querySelector("[data-testid=fit-summary]")?.textContent;
    expect(summary()).toMatch(/not a good fit|over what this truck is rated/i);

    const open16 = [...container.querySelectorAll('[data-testid="config-group-overflow-trailer"] [role=radio]')]
      .find((el) => /16-ft open/.test(el.textContent || ""));
    expect(open16).toBeTruthy();
    act(() => {
      open16.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toMatch(/on the 16-ft open/i);
    expect(summary()).not.toMatch(/over what this truck is rated/i);
    expect(summary()).toMatch(/can (probably )?finish|Good Workday Fit|Conditional/i);
  });
});


======== FILE: vite.config.js ========
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { sites } from "@openai/sites-vite-plugin";

const publicPreview = process.env.FIT_MY_TRUCK_PREVIEW === "1";

export default defineConfig({
  // Relative asset URLs work on GitHub project Pages and other static hosts.
  // Capacitor and the default `pnpm build` keep the root base.
  base: publicPreview ? "./" : "/",
  plugins: [sites(), react(), tailwindcss()],
  // Preview-only: leave React/icons on a public CDN so the compiled app
  // is small enough to publish to the public Pages repo without a PAT.
  build: publicPreview
    ? {
        rollupOptions: {
          external: [
            "react",
            "react/jsx-runtime",
            "react/jsx-dev-runtime",
            "react-dom",
            "react-dom/client",
            "leaflet",
            "leaflet/dist/leaflet.css",
          ],
        },
      }
    : undefined,
});
