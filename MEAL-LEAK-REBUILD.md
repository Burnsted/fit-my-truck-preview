# Meal-leak asset rebuild

Source fix: Burnsted/fit-my-truck PR (branch `cursor/strip-meal-leak-assets-3223`).

## On this preview branch

- **Base64 payloads + workflow are on the branch.**  
  - GC: `assets/_b64_chunks/gc_*.zlib.b64` (and/or assembled `assets/workday-trade-general-contractor-01Q32nWx.jpg.b64`)  
  - Woodwork: produced by Actions from clean `fit-my-truck` `src/assets/home-workday-woodwork.jpg` into `assets/home-workday-woodwork-Dev4WPAv.jpg.b64.part00`…`part06`
- **Actions workflow** `.github/workflows/apply-meal-leak-binaries.yml` decodes/writes the clean JPGs (root + staging mirrors) and patches `assets/index-YjYaDdGR.js` so the GC trade card points at `workday-trade-general-contractor.svg` while keeping the FleetFit CTA / `home-workday-woodwork-Dev4WPAv.jpg` refs.
- **Until Actions runs (or Woz pushes the binaries), live JPGs may still be contaminated.**
- **GC SVG is on the branch** at `staging-simplify/assets/workday-trade-general-contractor.svg` and `staging-feedback/assets/workday-trade-general-contractor.svg` (and should be mirrored to `assets/` as needed by the app build).
- **Keep** `index-YjYaDdGR.js` + feedback-widget chrome in `index.html` (do not switch the entry bundle away from YjYaDdGR).

## Manual fallback

Replace hashed preview binaries with cleaned source assets (same filenames keep FleetFit CTA JS untouched):

- `assets/home-workday-woodwork-Dev4WPAv.jpg` from `src/assets/home-workday-woodwork.jpg`
- `assets/workday-trade-general-contractor-01Q32nWx.jpg` from a raster of `src/assets/workday-trade-general-contractor.svg` (or delete and rebuild)

Also sync `staging-simplify/` and `staging-feedback/` copies of those two files.
