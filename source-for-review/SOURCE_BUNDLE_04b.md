  it("drops the live vehicle fit score when bed drawers are selected", () => {
    ({ container, root } = mountApp());
    const scoreEl = () => container.querySelector('[data-testid="vehicle-fit-score"][data-vehicle-id="r1t"]');
    const baseline = Number(scoreEl()?.textContent);
    expect(baseline).toBeGreaterThan(0);
    clickNamedControl(container, /Bed drawers \/ slide-out storage/i);
    const after = Number(scoreEl()?.textContent);
    expect(after).toBeLessThan(baseline);
  });

  it("opens a why-bubble with the real disqualifying factors", () => {
    ({ container, root } = mountApp());
    const payload = container.querySelector('input[aria-label="Payload in truck"]');
    expect(payload).toBeTruthy();
    act(() => {
      const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
      proto.set.call(payload, "3000");
      payload.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(container.textContent).toMatch(/Not a good fit/i);
    const why = [...container.querySelectorAll("[role=button]")].find((el) => /Not a good fit/i.test(el.textContent || ""));
    expect(why).toBeTruthy();
    act(() => {
      why.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.textContent).toMatch(/Why this rating/i);
    expect(container.textContent).toMatch(/payload is over this truck's payload rating/i);
  });

  it("labels the ICE input as My current truck and shops home chargers", () => {
    ({ container, root } = mountApp());
    expect(container.textContent).toMatch(/My current truck/i);
    expect(container.textContent).not.toMatch(/Can an EV Handle Me/i);
    const current = container.querySelector("select[aria-label=\"My current truck\"]");
    expect(current).toBeTruthy();
    expect([...current.options].map((option) => option.textContent)).toEqual(expect.arrayContaining(["Ford F-150", "Other — type it in"]));
    const shop = container.querySelector('a[href*="homedepot.com"]');
    expect(shop?.textContent).toMatch(/Shop home chargers/i);
    expect(shop?.getAttribute("target")).toBe("_blank");
    expect(shop?.getAttribute("rel")).toMatch(/noopener/);
  });

  it("clears kit selections without wiping the trade", () => {
    ({ container, root } = mountApp());
    expect(container.textContent).toMatch(/Type IA extension/i);
    const clear = [...container.querySelectorAll("button")].find((el) => el.getAttribute("aria-label") === "Clear all kit selections");
    expect(clear).toBeTruthy();
    act(() => {
      clear.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.querySelector("select[aria-label=\"What's your trade?\"]")?.value).toBe("Electrical");
    const extension = [...container.querySelectorAll("label")].find((el) => /Type IA extension/i.test(el.textContent || ""));
    expect(extension?.querySelector("input[type=checkbox]")?.checked).toBe(false);
    expect([...container.querySelectorAll("button")].find((el) => el.getAttribute("aria-label") === "Clear all kit selections")).toBeFalsy();
  });

  it("clears bed accessories without wiping kit or trade", () => {
    ({ container, root } = mountApp());
    expect([...container.querySelectorAll("button")].find((el) => el.getAttribute("aria-label") === "Clear all bed accessory selections")).toBeFalsy();
    clickNamedControl(container, /Bed drawers \/ slide-out storage/i);
    const drawers = [...container.querySelectorAll("label")].find((el) => /Bed drawers \/ slide-out storage/i.test(el.textContent || ""));
    expect(drawers?.querySelector("input[type=checkbox]")?.checked).toBe(true);
    const clear = [...container.querySelectorAll("button")].find((el) => el.getAttribute("aria-label") === "Clear all bed accessory selections");
    expect(clear).toBeTruthy();
    act(() => {
      clear.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.querySelector("select[aria-label=\"What's your trade?\"]")?.value).toBe("Electrical");
    expect(drawers?.querySelector("input[type=checkbox]")?.checked).toBe(false);
    const extension = [...container.querySelectorAll("label")].find((el) => /Type IA extension/i.test(el.textContent || ""));
    expect(extension?.querySelector("input[type=checkbox]")?.checked).toBe(true);
    expect([...container.querySelectorAll("button")].find((el) => el.getAttribute("aria-label") === "Clear all bed accessory selections")).toBeFalsy();
  });

  it("renders pack and wheel picks as one-row segmented controls", () => {
    ({ container, root } = mountApp());
    const pack = container.querySelector('[data-testid="config-group-pack"] [role=radiogroup]');
    const wheels = container.querySelector('[data-testid="config-group-wheel"] [role=radiogroup]');
    expect(pack).toBeTruthy();
    expect(wheels).toBeTruthy();
    expect(pack.querySelectorAll('[role=radio]').length).toBeGreaterThanOrEqual(3);
    expect(wheels.querySelectorAll('[role=radio]').length).toBeGreaterThanOrEqual(3);
    expect(pack.getAttribute("aria-label")).toBe("Battery Pack");
    expect(container.querySelector("[data-testid=real-world-range]")).toBeTruthy();
    const hint = container.querySelector('summary[aria-label="How load hits range"]');
    expect(hint).toBeTruthy();
  });

  it("swaps the truck hero photo when the model year changes", () => {
    ({ container, root } = mountApp());
    const hero = () => container.querySelector(".visual-photo");
    expect(hero()?.getAttribute("src")).toMatch(/Special:FilePath\/2022_Rivian_R1T_Adventure/);
    const year = container.querySelector("[data-testid=model-year]");
    act(() => {
      const proto = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value");
      proto.set.call(year, "2025");
      year.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(hero()?.getAttribute("src")).toMatch(/Special:FilePath\/2025_Rivian_R1T/);
    expect(hero()?.getAttribute("data-model-year")).toBe("2025");
  });

  it("swaps the wheel-trim photo without changing the truck body photo", () => {
    ({ container, root } = mountApp());
    const heroSrc = container.querySelector(".visual-photo")?.getAttribute("src");
    const wheelImg = () => container.querySelector("[data-testid=wheel-trim-photo] img");
    const before = wheelImg()?.getAttribute("src");
    expect(before.startsWith("data:image/svg+xml")).toBe(true);
    expect(decodeURIComponent(before)).toMatch(/21.*Road/);
    const sport = [...container.querySelectorAll('[data-testid="config-group-wheel"] [role=radio]')].find((el) => /Sport/.test(el.textContent || ""));
    expect(sport).toBeTruthy();
    act(() => {
      sport.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(decodeURIComponent(wheelImg()?.getAttribute("src") || "")).toMatch(/22.*Sport/);
    expect(wheelImg()?.getAttribute("src")).not.toBe(before);
    expect(container.querySelector(".visual-photo")?.getAttribute("src")).toBe(heroSrc);
  });

  it("refresh controls flash Updated and leave live scores in place", () => {
    ({ container, root } = mountApp());
    const refreshers = [...container.querySelectorAll("button")].filter((el) => el.getAttribute("aria-label") === "Refresh results");
    expect(refreshers.length).toBeGreaterThanOrEqual(6);
    expect(container.querySelector("[data-testid=results-updated]")).toBeNull();
    const results = container.querySelector("#fit-results");
    expect(results).toBeTruthy();
    const scroll = vi.fn();
    results.scrollIntoView = scroll;
    act(() => {
      refreshers[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.querySelector("[data-testid=results-updated]")?.textContent).toMatch(/Updated/);
    expect(scroll).toHaveBeenCalled();
    expect(container.querySelector('[data-testid="vehicle-fit-score"]')).toBeTruthy();
  });

  it("switches the fit headline when Play Day is selected", () => {
    ({ container, root } = mountApp());
    expect(container.querySelector("[data-testid=day-fit-eyebrow]")?.textContent).toMatch(/Workday Fit/);
    expect(container.querySelector("[data-testid=find-fits-cta]")?.textContent).toMatch(/See What Fits This Workday/);
    clickNamedControl(container, /^Play Day/);
    expect(container.querySelector("[data-testid=day-fit-eyebrow]")?.textContent).toMatch(/Play Day Fit/);
    expect(container.querySelector("[data-testid=day-fit-eyebrow]")?.textContent).not.toMatch(/Workday/);
    expect(container.querySelector("[data-testid=find-fits-cta]")?.textContent).toMatch(/See What Fits This Play Day/);
    expect(container.querySelector("[data-testid=find-fits-cta]")?.textContent).not.toMatch(/Workday/);
    expect(container.textContent).toMatch(/Same play day, other trucks/i);
    expect(container.textContent).toMatch(/Good Play Day Fit|Conditional Play Day Fit/);
    expect(container.textContent).not.toMatch(/Same workday, other trucks/i);
    expect(container.textContent).not.toMatch(/Good Workday Fit|Conditional Workday Fit|Conservative Workday Fit/);
    expect(container.textContent).toMatch(/Play Day gear/);
    expect(container.textContent).not.toMatch(/Trade kit on the truck/);
    expect(container.querySelector("select[aria-label=\"What's the activity?\"]")).toBeTruthy();
    expect(container.querySelector("select[aria-label=\"What's your trade?\"]")).toBeFalsy();
    expect(container.querySelector("[data-testid=play-towable]")).toBeTruthy();
    expect(container.querySelector("[data-testid=play-gear]")).toBeTruthy();
    expect(container.querySelector('[data-testid="config-group-overflow-trailer"]')).toBeFalsy();
    expect(container.querySelector("[data-testid=work-kit]")).toBeFalsy();
    expect(container.textContent).toMatch(/Fishing boat 16–18 ft/i);
    expect(container.textContent).toMatch(/Pontoon 22 ft/i);
    expect(container.textContent).toMatch(/4 adult PFDs/i);
    expect(container.textContent).not.toMatch(/Type IA extension/i);
    expect(container.textContent).not.toMatch(/Bed drawers \/ slide-out storage/i);
    expect(container.textContent).not.toMatch(/16-ft open/i);
    expect(container.querySelector('[data-testid="config-group-overflow-trailer"]')).toBeFalsy();

    clickNamedControl(container, /^Workday/);
    expect(container.querySelector("[data-testid=day-fit-eyebrow]")?.textContent).toMatch(/Workday Fit/);
    expect(container.querySelector("[data-testid=day-fit-eyebrow]")?.textContent).not.toMatch(/Play Day/);
    expect(container.querySelector("[data-testid=find-fits-cta]")?.textContent).toMatch(/See What Fits This Workday/);
    expect(container.textContent).toMatch(/Same workday, other trucks/i);
    expect(container.textContent).not.toMatch(/Same play day, other trucks/i);
    expect(container.textContent).toMatch(/Trade kit on the truck/);
    expect(container.querySelector("select[aria-label=\"What's your trade?\"]")).toBeTruthy();
    expect(container.querySelector('[data-testid="config-group-overflow-trailer"]')).toBeTruthy();
    expect(container.querySelector("[data-testid=work-kit]")).toBeTruthy();
    expect(container.querySelector("[data-testid=play-towable]")).toBeFalsy();
    expect(container.textContent).toMatch(/Type IA extension/i);
    expect(container.textContent).toMatch(/Bed drawers \/ slide-out storage/i);
    expect(container.textContent).not.toMatch(/Fishing boat 16–18 ft/i);
    expect(container.textContent).not.toMatch(/Play Day gear/);
  });

  it("recalculates Play Day fit when recreational towables and gear change", () => {
    ({ container, root } = mountApp());
    clickNamedControl(container, /^Play Day/);
    expect(container.querySelector("[data-testid=play-towable]")).toBeTruthy();
    const baseline = realWorldRange(container);
    const baselinePenalty = loadPenaltyPct(container);
    expect(baseline).toBeGreaterThan(0);

    const pontoon = [...container.querySelectorAll("label")].find((el) => /Pontoon 22 ft/i.test(el.textContent || ""));
    expect(pontoon).toBeTruthy();
    act(() => {
      pontoon.querySelector("input[type=radio]").dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const withPontoon = realWorldRange(container);
    expect(withPontoon).toBeLessThan(baseline);
    expect(loadPenaltyPct(container)).toBeGreaterThan(baselinePenalty);

    clickNamedControl(container, /Additional 300 lb family cargo/i);
    expect(realWorldRange(container)).toBeLessThan(withPontoon);

    const activity = container.querySelector("select[aria-label=\"What's the activity?\"]");
    act(() => {
      const proto = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value");
      proto.set.call(activity, "Mountain Biking");
      activity.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(container.textContent).toMatch(/2 trail bikes \+ hitch rack/i);
    expect(container.textContent).not.toMatch(/4 adult PFDs/i);
    expect(container.textContent).not.toMatch(/Type IA extension/i);
    expect(container.textContent).not.toMatch(/Working wire/i);
    expect(container.textContent).not.toMatch(/16-ft open/i);
    expect(container.querySelector("[data-testid=find-fits-cta]")?.textContent).toMatch(/See What Fits This Play Day/);
    expect(container.querySelector("[data-testid=model-year]")).toBeTruthy();
    expect(container.querySelector("[data-testid=monthly-savings]")).toBeTruthy();
    expect(container.querySelector('[data-testid="vehicle-fit-score"]')).toBeTruthy();
  });

  it("limits the trade dropdown to major buckets and maps type-your-trade free-text", () => {
    ({ container, root } = mountApp());
    const select = container.querySelector("select[aria-label=\"What's your trade?\"]");
    const values = [...select.options].map((option) => option.value);
    expect(values.length).toBeLessThanOrEqual(10);
    expect(values).toContain("Electrical");
    expect(values).toContain("Type your trade");
    expect(values).not.toContain("Other");
    expect(values).not.toContain("Locksmith");
    expect(values).not.toContain("Electrician");

    setTrade(container, "Type your trade");
    expect(container.textContent).toMatch(/Enter your trade/i);
    expect(container.textContent).toMatch(/No assumed convertibility score/i);
    expect(container.querySelector("[data-testid=trade-convertibility]")?.textContent).not.toMatch(/\d+%/);
    const custom = container.querySelector("input[aria-label=\"Enter your trade\"]");
    expect(custom).toBeTruthy();
    act(() => {
      const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value");
      proto.set.call(custom, "electrician");
      custom.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(container.textContent).toMatch(/electrician/i);
    expect(container.textContent).not.toMatch(/research profile/i);
    expect(container.textContent).toMatch(/Generic field-service kit/i);
    expect(container.textContent).not.toMatch(/Working wire \(250 ft/i);
    expect(container.querySelector("[data-testid=fit-summary]")?.textContent).toMatch(/electrician/i);
  });

  it("resets the model year to the first year that truck was available", () => {
    ({ container, root } = mountApp());
    const year = () => container.querySelector("[data-testid=model-year]");
    expect(year()?.value).toBe("2022");
    expect([...year().options].map((option) => option.value)).toContain("2023");

    const dropdown = container.querySelector("button[aria-haspopup=listbox]");
    expect(dropdown).toBeTruthy();
    act(() => {
      dropdown.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const silverado = [...container.querySelector("[role=listbox]").querySelectorAll("button")].find((el) => /Silverado EV/.test(el.textContent || ""));
    expect(silverado).toBeTruthy();
    act(() => {
      silverado.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(year()?.value).toBe("2024");
