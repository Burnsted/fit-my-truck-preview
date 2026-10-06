/* FleetFit mid-page blurb injector for tip bundle YjYaDdGR.
 * Source of truth: Burnsted/fit-my-truck FleetFitResultCta.jsx
 */
(function () {
  var BLURB = "FleetFit is a separate site that builds an EV fleet package for your company.";
  function enhance(cta) {
    if (!cta || cta.querySelector("[data-testid=fleetfit-result-blurb]")) return;
    var host = cta.querySelector(".min-w-0.flex-1") || cta;
    var el = document.createElement("span");
    el.setAttribute("data-testid", "fleetfit-result-blurb");
    el.className = "block text-sm leading-snug mt-2 normal-case tracking-normal font-normal";
    el.style.color = "#2E5651";
    el.textContent = BLURB;
    host.appendChild(el);
  }
  function scan(root) {
    var cta = (root || document).querySelector("[data-testid=fleetfit-result-cta]");
    if (cta) enhance(cta);
  }
  function start() {
    scan(document);
    var obs = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var nodes = mutations[i].addedNodes || [];
        for (var j = 0; j < nodes.length; j++) {
          var n = nodes[j];
          if (n && n.nodeType === 1) {
            if (n.getAttribute && n.getAttribute("data-testid") === "fleetfit-result-cta") enhance(n);
            else scan(n);
          }
        }
      }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
