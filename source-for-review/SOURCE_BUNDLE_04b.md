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
    expect(shop?.textContent).toMatch(/Shop home chargers/i);
