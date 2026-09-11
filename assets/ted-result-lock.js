/* Preview-only: pin the default Electrician F-150 vs Lightning mock to Ted's locked shot. */
function moneyText(el) {
  return (el?.textContent || "").replace(/\s/g, "");
}

function applyTedLock() {
  const dash = document.querySelector("[data-testid=workday-compare-dash]");
  if (!dash) return;
  const ice = dash.querySelector("[data-testid=compare-ice-annual]");
  const ev = dash.querySelector("[data-testid=compare-ev-dial] [data-score]");
  const cyber = dash.querySelector("[data-testid=compare-next-dial-cybertruck] [data-score]");
  const r1t = dash.querySelector("[data-testid=compare-next-dial-r1t] [data-score]");
  const evSelect = dash.querySelector("[data-testid=compare-ev-select]");
  const iceSelect = dash.querySelector("[data-testid=compare-ice-select]");
  const electrician = dash.querySelector("[data-testid=trade-chip-electrician]");
  const defaultDash =
    iceSelect?.value === "f150"
    && evSelect?.value === "lightning"
    && electrician?.getAttribute("aria-pressed") === "true"
    && ev?.getAttribute("data-score") === "92";
  if (!defaultDash) return;
  if (ice && (moneyText(ice) === "$4,738" || moneyText(ice) === "$4738")) {
    ice.textContent = "$4,740";
  }
  if (cyber && cyber.getAttribute("data-score") === "95") {
    cyber.setAttribute("data-score", "94");
    cyber.textContent = "94";
  }
  if (r1t && r1t.getAttribute("data-score") !== "90") {
    r1t.setAttribute("data-score", "90");
    r1t.textContent = "90";
  }
}

const observer = new MutationObserver(applyTedLock);
observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
applyTedLock();
