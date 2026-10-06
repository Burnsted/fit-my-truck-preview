# Meal-leak asset rebuild

Source fix: Burnsted/fit-my-truck PR (branch `cursor/strip-meal-leak-assets-3223`).

Replace these hashed preview binaries with the cleaned source assets (same filenames keep FleetFit CTA JS untouched):

- `assets/home-workday-woodwork-Dev4WPAv.jpg` from `src/assets/home-workday-woodwork.jpg` (clean Custom Woodwork plate)
- `assets/workday-trade-general-contractor-01Q32nWx.jpg` from a raster of `src/assets/workday-trade-general-contractor.svg` (or delete and rebuild)

Also sync `staging-simplify/` and `staging-feedback/` copies of those two files.

Preferred: rebuild root from FMT `pnpm build:preview` after merging the source PR, preserving feedback-widget chrome in index.html.
