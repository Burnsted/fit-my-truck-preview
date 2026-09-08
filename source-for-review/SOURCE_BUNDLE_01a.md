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

`SOURCE_BUNDLE.md` is the same files concatenated into one document if you want a single paste.
---
# Concatenated source

======== FILE: .gitignore ========
node_modules/
dist/
dist-preview/
.netlify/
.vite/
.pnpm-store/
tmp-photos/

*.log
.DS_Store

# Android / Play signing — never commit keystores or local SDK paths
*.jks
*.keystore
android/keystore.properties
android/local.properties


======== FILE: .npmrc ========
public-hoist-pattern[]=@capacitor/*


======== FILE: .nvmrc ========
22


======== FILE: ATTRIBUTION.md ========
# Photo attribution

Vehicle photographs render from Wikimedia Commons `Special:FilePath` URLs (and matching thumbs) using the File: names in `src/data.js`. That is what the public GitHub Pages preview uses — it cannot depend on `public/vehicles/*.webp` binaries. Optional cropped WebP copies under `public/vehicles/` remain for local/Capacitor development only.

Scene photographs use Unsplash source image URLs (`images.unsplash.com/photo-…`), not Unsplash photo pages. Wheel-trim graphics are inline SVG data URLs so they cannot 404 on Pages.

## Vehicle photos (Wikimedia Commons)

| App vehicle | File | Photographer | License | Source |
| --- | --- | --- | --- | --- |
| Rivian R1T | `public/vehicles/r1t.webp` | [Mr.choppers](https://commons.wikimedia.org/wiki/User:Mr.choppers) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | [2022 Rivian R1T Adventure in Forest Green, front left](https://commons.wikimedia.org/wiki/File:2022_Rivian_R1T_Adventure_in_Forest_Green,_front_left.jpg) |
| Ford F-150 Lightning | `public/vehicles/lightning.webp` | [Elise240SX](https://commons.wikimedia.org/wiki/User:Elise240SX) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | [2022 Ford F-150 Lightning Lariat in Atlas Blue Metallic](https://commons.wikimedia.org/wiki/File:2022_Ford_F-150_Lightning_Lariat_in_Atlas_Blue_Metallic,_Front_Right,_08-06-2022.jpg) |
| Chevrolet Silverado EV | `public/vehicles/silveradoev.webp` | [Elise240SX](https://commons.wikimedia.org/wiki/User:Elise240SX) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | [2024 Chevrolet Silverado EV 4WT AWD in Summit White](https://commons.wikimedia.org/wiki/File:2024_Chevrolet_Silverado_EV_4WT_AWD_in_Summit_White,_front_left,_2024-06-30.jpg) |
| GMC Sierra EV | `public/vehicles/sierraev.webp` | [HJUdall](https://commons.wikimedia.org/wiki/User:HJUdall) | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | [26 GMC Sierra EV Elevation](https://commons.wikimedia.org/wiki/File:26_GMC_Sierra_EV_Elevation.jpg) |
| GMC Hummer EV Pickup | `public/vehicles/hummerev.webp` | [Elise240SX](https://commons.wikimedia.org/wiki/User:Elise240SX) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | [2024 GMC Hummer EV Pickup 2X](https://commons.wikimedia.org/wiki/File:2024_GMC_Hummer_EV_Pickup_2X_4WD_Sport_Package_in_Meteorite_Metallic,_front_left,_2024-03-31.jpg) |

CC BY-SA photos require attribution and share-alike for adaptations. The cropped WebP copies in this repo should be treated as CC BY-SA (or CC0 / public domain where noted). Credits also appear under the workday hero and in the app footer.

Cybertruck is not in `VEHICLE_OPTIONS`, so no Cybertruck photo is bundled.

## Model-year vehicle photos (Wikimedia Commons)

Hero / dropdown / card photos swap with the **model year** control — not pack or motor. Each year is a distinct licensed still of that truck, cropped and converted to WebP.

| App vehicle | Year | File | Photographer | License | Source |
| --- | --- | --- | --- | --- | --- |
| Rivian R1T | 2022 | `public/vehicles/r1t-2022.webp` | [Mr.choppers](https://commons.wikimedia.org/wiki/User:Mr.choppers) | CC BY-SA 3.0 | [2022 Rivian R1T Adventure in Forest Green, front left](https://commons.wikimedia.org/wiki/File:2022_Rivian_R1T_Adventure_in_Forest_Green,_front_left.jpg) |
| Rivian R1T | 2023 | `public/vehicles/r1t-2023.webp` | Charles from Port Chester, New York | CC BY 2.0 | [Rivian R1T (2023)](https://commons.wikimedia.org/wiki/File:Rivian_R1T_(2023)_(53487999620).jpg) |
| Rivian R1T | 2024 | `public/vehicles/r1t-2024.webp` | GoToVan | CC BY 2.0 | [Everything Electric Canada 2024](https://commons.wikimedia.org/wiki/File:Everything_Electric_Canada_2024_-_53982523915.jpg) |
| Rivian R1T | 2025 | `public/vehicles/r1t-2025.webp` | Bull-Doser | Public domain | [2025 Rivian R1T, Salon auto Lanaudière](https://commons.wikimedia.org/wiki/File:2025_Rivian_R1T_au_salon_auto_Lanaudière_2025.jpg) |
| Rivian R1T | 2026 | `public/vehicles/r1t-2026.webp` | Phillip Pessar | CC BY 4.0 | [Rivian Showroom Brickell, Sept 2025](https://commons.wikimedia.org/wiki/File:Newly_Open_Rivian_Showroom_Brickell,_Miami_Florida_Sept_2025_-_blue_pickup_front.jpg) |
| Ford F-150 Lightning | 2022 | `public/vehicles/lightning-2022.webp` | Elise240SX | CC BY-SA 4.0 | [2022 Lightning Lariat Atlas Blue](https://commons.wikimedia.org/wiki/File:2022_Ford_F-150_Lightning_Lariat_in_Atlas_Blue_Metallic,_Front_Right,_08-06-2022.jpg) |
| Ford F-150 Lightning | 2023 | `public/vehicles/lightning-2023.webp` | Corqe | CC0 | [2023 Denver Auto Show Lightning](https://commons.wikimedia.org/wiki/File:2023_Denver_Auto_Show_Ford_F-150_Lightning_front_left_quarter.jpg) |
| Ford F-150 Lightning | 2024 | `public/vehicles/lightning-2024.webp` | Charles from Port Chester, New York | CC BY 2.0 | [2024 Lightning Platinum](https://commons.wikimedia.org/wiki/File:Ford_F-150_Lightning_Platinum_(2024)_(53621481713).jpg) |
| Ford F-150 Lightning | 2025 | `public/vehicles/lightning-2025.webp` | Bull-Doser | Public domain | [Lightning, Salon auto Lanaudière 2025](https://commons.wikimedia.org/wiki/File:Ford_F-150_Lightning_Valkrie_au_Salon_auto_Lanaudière_2025.jpg) |
| Ford F-150 Lightning | 2026 | `public/vehicles/lightning-2026.webp` | Bull-Doser | Public domain | [2026 Lightning, SIAM](https://commons.wikimedia.org/wiki/File:2026_Ford_F-150_Lightning_au_SIAM_2026.jpg) |
| Chevrolet Silverado EV | 2024 | `public/vehicles/silveradoev-2024.webp` | Elise240SX | CC BY-SA 4.0 | [2024 Silverado EV 4WT Summit White](https://commons.wikimedia.org/wiki/File:2024_Chevrolet_Silverado_EV_4WT_AWD_in_Summit_White,_front_left,_2024-06-30.jpg) |
| Chevrolet Silverado EV | 2025 | `public/vehicles/silveradoev-2025.webp` | Bull-Doser | Public domain | [2025 Silverado EV, Salon auto Lanaudière](https://commons.wikimedia.org/wiki/File:2025_Chevrolet_Silverado_EV_au_salon_auto_Lanaudière_2025.JPG) |
| Chevrolet Silverado EV | 2026 | `public/vehicles/silveradoev-2026.webp` | Bull-Doser | Public domain | [2026 Silverado EV, SIAM](https://commons.wikimedia.org/wiki/File:2026_Chevrolet_Silverado_EV_au_SIAM_2026.jpg) |
| GMC Sierra EV | 2024 | `public/vehicles/sierraev-2024.webp` | Wlb5V | CC BY-SA 4.0 | [2024 Sierra EV Denali, Beaverton](https://commons.wikimedia.org/wiki/File:2024_GMC_Sierra_EV_Denali.jpg) |
| GMC Sierra EV | 2025 | `public/vehicles/sierraev-2025.webp` | MercurySable99 | CC BY-SA 4.0 | [2025 Sierra EV Extended Range Denali](https://commons.wikimedia.org/wiki/File:2025_GMC_Sierra_EV_Extended_Range_Denali,_front_right,_05-04-2025.jpg) |
| GMC Sierra EV | 2026 | `public/vehicles/sierraev-2026.webp` | HJUdall | CC0 | [26 GMC Sierra EV Elevation](https://commons.wikimedia.org/wiki/File:26_GMC_Sierra_EV_Elevation.jpg) |
| GMC Hummer EV Pickup | 2022 | `public/vehicles/hummerev-2022.webp` | Ethan Llamas | CC BY-SA 4.0 | [Edition 1 Interstellar White](https://commons.wikimedia.org/wiki/File:GMC_Hummer_EV_Pickup_Edition_1_Interstellar_White.jpg) |
| GMC Hummer EV Pickup | 2023 | `public/vehicles/hummerev-2023.webp` | John Bauld | CC BY 2.0 | [Hummer EV (52694929216)](https://commons.wikimedia.org/wiki/File:Hummer_EV_(52694929216).jpg) |
| GMC Hummer EV Pickup | 2024 | `public/vehicles/hummerev-2024.webp` | Elise240SX | CC BY-SA 4.0 | [2024 Hummer EV Pickup 2X](https://commons.wikimedia.org/wiki/File:2024_GMC_Hummer_EV_Pickup_2X_4WD_Sport_Package_in_Meteorite_Metallic,_front_left,_2024-03-31.jpg) |
| GMC Hummer EV Pickup | 2025 | `public/vehicles/hummerev-2025.webp` | ShortlineBuickGMC | CC BY-SA 4.0 | [2025 Hummer EV 3X Pickup](https://commons.wikimedia.org/wiki/File:2025_GMC_Hummer_EV_3X_Pickup_in_Meteorite_Gray.jpg) |
| GMC Hummer EV Pickup | 2026 | `public/vehicles/hummerev-2026.webp` | Kidfly182 | CC BY 4.0 | [2026 Chicago Auto Show](https://commons.wikimedia.org/wiki/File:2026_Chicago_Auto_Show_036.jpg) |

The 2026 Rivian still uses a late-2025 showroom photo of current production (no distinct 2026 Commons still was available). Wheel-trim thumbnails in `public/vehicles/wheels/` are square crops of Commons body stills (plus Corqe's CC0 Lightning wheel close-up and RST / Denali / AT4 detail frames) and inherit those licenses. Changing the wheel control swaps only this crop — the truck hero stays on the selected model year.

## Scene photos (Unsplash License)

Unsplash License allows commercial use. Attribution is not required; these credits are included because they are easy to keep.

| Use | File | Photographer | Source |
| --- | --- | --- | --- |
| Workday mode card | `public/scenes/workday.webp` | Sergio Rota | [Unsplash](https://unsplash.com/photos/parked-black-crew-can-pickup-truck-5saApcjtoaI) |
| Play Day mode card | `public/scenes/playday.webp` | via Unsplash | [Unsplash](https://unsplash.com/photos/black-ford-f-150-on-snow-covered-ground-1sOtjZgKfNg) |
| FleetFit banner | `public/scenes/fleet.webp` | Erik Mclean | [Unsplash](https://unsplash.com/photos/white-ford-f-150-crew-cab-pickup-truck-alqcW58zWmc) |

## Map My Day (no API keys)

Map My Day uses public, key-free services. Identify the app with the page Referer and keep requests to about one per second.

| Use | Service | Notes |
| --- | --- | --- |
| Topographic tiles | [OpenTopoMap](https://opentopomap.org/) | OSM + SRTM style, CC-BY-SA. Leaflet layer `tile.opentopomap.org` |
| Street tiles | [OpenStreetMap](https://www.openstreetmap.org/copyright) | Optional layer. © OpenStreetMap contributors |
| Place autocomplete | [Photon](https://photon.komoot.io/) (Komoot) | Primary. No key. Biased toward the last stop / Keystone |
| Place fallback | [Nominatim](https://nominatim.openstreetmap.org/) | OSM geocoder. No key. ~1 req/s. Browser cannot send a custom User-Agent |
| Driving miles | [OSRM](http://project-osrm.org/) public demo | `router.project-osrm.org`. No key. Falls back to haversine × 1.3 |
| Map library | [Leaflet](https://leafletjs.com/) | BSD-2-Clause |

Google Places, Google Maps, Mapbox, and MapTiler are **not** wired. Those would need API keys and a billing account. Seeded Keystone places (Village at Wintergreen, Keystone Ski Resort) keep autocomplete and miles working if the public endpoints are unreachable.

## Bed accessory estimates (Sep 2026)

Empty-product / list-or-street ballparks used by `BED_ACCESSORY_OPTIONS`. These are not installed shop quotes. Soft and hard tonneaus are alternatives (the picker will not stack both).

| Option | Weight | Price used | Source notes |
| --- | --- | --- | --- |
| Bed drawers | 220 lb | $1,700 | DECKED full-size compare page: 208–233 lb, list $1,699.99 |
| 27-gal totes (4) | 32 lb | $80 | Sterilite 27-gal: True Value 8.0 lb each. Four-pack street ~$20 ea is an **inference** |
| Soft tri-fold tonneau | 35 lb | $470 | Extang Trifecta 2.0 retailer sheets (~35 lb), street ~$469.99 |
| Hard folding tonneau | 71 lb | $1,250 | BAKFlip MX4 retailer sheets 71 lb, list $1,249.99 |
| Ladder / commercial rack | 162 lb | $766 | Weather Guard 1245, Nelson Truck: 162.0 lb, $765.68 |
| Headache rack | 50 lb | $380 | Backrack Original ship wt 50 lb; RealTruck rack + hardware kit $379.98 |
| Crossbed toolbox | 78 lb | $1,180 | Weather Guard 124-5-01: 78 lb; Home Depot $1,179 |
| Full bed liner | 19 lb | $400 | Husky Guardian Comfort: Amazon 19 lb, $399.99 |
| Cargo net / tie-down kit | 8 lb (est.) | $158 | Gladiator cargo-net kit starts $158. Empty weight is an **inference** |

## Overflow trailer empty weights (Sep 2026)

Tow-a-trailer overflow options use FACT-ish **empty curb weights** from manufacturer / retailer spec sheets — not GVWR, not a dealer quote. Selecting one moves previously selected kit/bed cargo onto the trailer. Towing is checked against empty + cargo. Leftover bed load (the payload-in-truck field) still counts as payload.

| Option | Empty weight used | Source notes |
| --- | --- | --- |
| 16-ft open | 1,980 lb | Tandem landscape/utility class (Carry-On / PJ 16-ft). Posted empty typically 1,870–2,080 lb |
| 12-ft enclosed | 1,560 lb | 6x12 single-axle enclosed cargo (Pace / Legend class). Posted empty typically 1,500–1,620 lb |
| 10-ft enclosed | 1,220 lb | 6x10 single-axle enclosed cargo (Haulmark / Pace class). Posted empty typically 1,160–1,280 lb |

## Vehicle model years and EPA energy (Sep 2026)

`firstAvailableYear` and `kwhPer100Miles` on `VEHICLE_OPTIONS` are FACT labels for the year picker and fuel-savings calc. Combined kWh/100 mi is the EPA figure for a representative recommended build, not every pack/wheel combo.

| App vehicle | First MY | kWh/100 mi | Source notes |
| --- | --- | --- | --- |
| Rivian R1T | 2022 | 48 | First customer MY 2022. EPA 2022 Launch Edition Large Pack 21" — fueleconomy.gov |
| Ford F-150 Lightning | 2022 | 48 | Deliveries spring 2022 as 2022 MY. EPA 2022 4WD Extended Range — fueleconomy.gov |
| Chevrolet Silverado EV | 2024 | 51 | No 2022/2023 MY. EPA 2024 3WT-class 51 kWh/100 mi — fueleconomy.gov |
| GMC Sierra EV | 2024 | 52 | Denali Edition 1 was 2024 MY. EPA 2025 Sierra EV 52 kWh/100 mi (closest posted label) |
| GMC Hummer EV Pickup | 2022 | 64 | Edition 1 deliveries Dec 2021 as 2022 MY. EPA 2024 3X 22" ~636 Wh/mi → 64 kWh/100 mi |


======== FILE: README.md ========
Fit My Truck

Fit My Truck is a mobile-first platform that helps businesses and individuals match trucks, equipment, upfits, charging, and range capabilities to their real-world work and recreation needs.

Core Experiences

- Build My Workday: Match a truck and equipment setup to a specific trade, route, workload, towing requirement, and daily energy demand.
- Build My Play Day: Configure trucks and accessories for boating, camping, cycling, off-grid power, towing, and other recreational uses.
- Truck Fit Inventory: Search available trucks based on the user’s required capabilities rather than conventional dealership filters.
- Route and Range Planning: Estimate whether a vehicle can complete a workday from a home charge, including driving, towing, weather, payload, and equipment use.
- Power My Work: Estimate the energy needed to run tools, chargers, refrigeration, mobile services, and other jobsite equipment.
