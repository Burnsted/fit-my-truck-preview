# Fit My Truck — source for review

This is a readable source snapshot of the **unmerged PR #14** preview of Fit My Truck (`Burnsted/fit-my-truck`, branch `cursor/year-photos-wheels-2b74`, commit `d28a1aec139d6b11a00b6276ccdd4f8f489be618`).

It is **not** the live minified GitHub Pages build. Friends can tap through the running app here (no login):

**https://burnsted.github.io/fit-my-truck-preview/**

## Product surfaces

The app has four screens:

1. **Build My Workday**
2. **Build My Play Day**
3. **Map My Day**
4. **FleetFit**

## What Ted wants

An honest take on what is wrong, missing, or useful. Please look at:

- Glitches and UX rough edges
- Scoring / fit calculations
- Map My Day (routing, places, how it feeds the rest of the app)
- Whether this code actually matches the product described in the README

Do not treat this as a merge review of PR #14. The private app repo is unchanged; this folder is only a shareable source packet.

## What is in this snapshot

- `README.md`, `package.json`, Vite/Capacitor config, and `ATTRIBUTION.md`
- App source under `src/` (screens, components, calculations, tests)
- Small helper scripts and `server/index.js`

Omitted on purpose: `node_modules/`, `android/`, lockfiles, and large binary images under `public/`.

`SOURCE_BUNDLE_01.md` through `SOURCE_BUNDLE_04.md` are the same files concatenated into ordered parts if you want a single paste. If `src/data.js` looks short, read `src/data.part-1-of-3.js` + `src/data.part-2-of-3.js` + `src/data.part-3-of-3.js` in order (that is the complete original module).
