# Meal-leak asset rebuild

Source fix: Burnsted/fit-my-truck branch `cursor/strip-meal-leak-assets-3223` (PR #37).

## Branch tip (verified)
`fda21a22c516980d14f3e31ffc050e8979a3a8b5` (plus docs tip after this note)

| Path | Clean MD5 |
|------|-----------|
| `assets/home-workday-woodwork-Dev4WPAv.jpg` (+ staging mirrors) | `ec87762a5018f982b7144fcad7909b9f` |
| `assets/workday-trade-general-contractor-01Q32nWx.jpg` (+ staging) | `394dbbfbbd8ab19c4e6306bf53224e69` |
| `assets/workday-trade-general-contractor.svg` (+ staging) | clean SVG from source |

`assets/index-YjYaDdGR.js` points GC at `.svg`; FleetFit CTAs preserved; woodwork hash name unchanged.
`index.html` still loads `index-YjYaDdGR.js` + feedback-widget (`data-build=YjYaDdGR`).

Binaries were assembled by Actions from `assets/_b64_chunks/*` (cursor[bot] git/Contents JPG push remains 403).
