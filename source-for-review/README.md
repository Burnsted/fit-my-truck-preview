Fit My Truck

Fit My Truck is a mobile-first platform that helps businesses and individuals match trucks, equipment, upfits, charging, and range capabilities to their real-world work and recreation needs.

Core Experiences

- Build My Workday: Match a truck and equipment setup to a specific trade, route, workload, towing requirement, and daily energy demand.
- Build My Play Day: Configure trucks and accessories for boating, camping, cycling, off-grid power, towing, and other recreational uses.
- Truck Fit Inventory: Search available trucks based on the user’s required capabilities rather than conventional dealership filters.
- Route and Range Planning: Estimate whether a vehicle can complete a workday from a home charge, including driving, towing, weather, payload, and equipment use.
- Power My Work: Estimate the energy needed to run tools, chargers, refrigeration, mobile services, and other jobsite equipment.
- FleetWatch: Help businesses monitor vehicle suitability, energy use, charging, and operating costs.

Initial Target Customers

The first version will focus on contractors and service businesses such as:

- Electricians
- Pool-maintenance companies
- Lawn and landscaping services
- Mobile repair businesses
- Builders and trades
- Pressure-washing companies
- Property-management teams
- Event and mobile-power operators

Product Direction

Fit My Truck should explain vehicle capability in practical, understandable terms. It should help users answer:

1. Which truck fits my actual workday?
2. Can it complete my normal route without inconvenient charging?
3. Can it tow my trailer and carry my equipment?
4. Can it power the tools and equipment I use?
5. What will it cost compared with my current vehicle?
6. Which available truck or upfit should I buy?

The platform should support electric, hybrid, and conventional trucks where appropriate, while highlighting situations where electric vehicles produce meaningful operating and productivity advantages.

Business Model

Potential revenue sources include:

- TruckFit FleetWatch subscriptions
- Vehicle listings and dealership referrals
- Upfit and equipment partnerships
- Home and commercial charging referrals
- Featured business solutions and sponsorships
- Fleet consulting and vehicle-fit reports

Proposed FleetWatch pricing:

- $9.99 per vehicle monthly
- $99.99 per vehicle annually

Current Status

Main is a runnable React 19 + Vite 8 preview of the original JSX prototype. It includes Tailwind styling, responsive phone layouts, the Workday Fit Assessment, shared route mileage, calculation guardrails, automated tests, and a production web build. Capacitor 8 packages that same `dist/` output as an Android app (`com.burnsted.fitmytruck`, display name **Fit My Truck**) for Google Play. There is no iOS target yet. Accounts, payments, and Play Billing are not implemented.

The shareable friend-feedback site is **https://burnsted.github.io/fit-my-truck-preview/** (public HTTPS, no login). See **Public web preview** below.

Vehicle photos

Each truck in `VEHICLE_OPTIONS` has a local WebP photo (`imageUrl` / `imageThumbUrl` under `public/vehicles/`). Dropdowns, the workday hero, Find My Truck cards, comparison rows, and FleetFit recommendations show that model’s photo — not a shared illustration. License notes are in **ATTRIBUTION.md**.

Run the Preview

Requirements:

- Node.js 22
- pnpm 11

Commands:

```bash
pnpm install
pnpm dev
```

Use `pnpm test` for the calculation checks and `pnpm build` for a production web build. Use `pnpm build:preview` to assemble the public static site (relative asset URLs, no OpenAI worker files).

Map My Day

The map is a real Leaflet canvas (OpenTopoMap by default, OSM streets as an alternate layer). Stops use place autocomplete — type **Wintergreen Apartments** and pick the Keystone, CO complex; type **Keystone Ski Area** / **Keystone Ski Resort** and pick the resort. Selecting a place fills that stop and becomes the distance origin for the next leg. Driving miles come from the public OSRM router, then feed remaining battery %, Workday / Play Day fit scores, and the shared Daily miles field.

No API keys are required. If you later want Google Places or Mapbox geocoding, you would add those keys yourself; this build does not call them. Requests are cached and spaced about one per second. Offline / test mode uses seeded Keystone places and estimated road miles.

Public web preview

Friends should open this HTTPS link on a phone. No ChatGPT or GitHub sign-in:

**https://burnsted.github.io/fit-my-truck-preview/**

The ChatGPT-hosted preview (`fit-my-truck-mvp.coachted14.chatgpt.site`) is 401-gated and is not the shareable demo.

This source repository stays **private**. GitHub Pages cannot be turned on from Actions until it is enabled once in the UI, and private-repo Pages is not available on this Free plan. The compiled Vite build is already in the separate public repo [Burnsted/fit-my-truck-preview](https://github.com/Burnsted/fit-my-truck-preview) (static assets only).

### Blocked: one click to turn Pages on (no new account, no secret)

This agent cannot enable Pages via the API (`403` / `404`). Do this once as the repo owner:

1. Open **https://github.com/Burnsted/fit-my-truck-preview/settings/pages** (you must be logged into GitHub as `Burnsted`).
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Branch: **`main`**. Folder: **`/ (root)`**.
4. Click **Save**.
5. Wait about a minute, then open **https://burnsted.github.io/fit-my-truck-preview/** on your phone.

That is the shareable friend-feedback URL. Keep this source repo private.

The seeded preview loads React from `esm.sh` and assembles the app bundle in the browser. A later `PREVIEW_DEPLOY_TOKEN` publish can replace that with a single self-contained `dist-preview/` build.

### Optional: auto-refresh the preview when `main` changes

Automatic updates need one repository secret. Until it exists, the live URL still works; it just will not rebuild itself.

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate**.
2. Name: `fit-my-truck-preview-deploy`. Resource owner: `Burnsted`. Expiration: your choice.
3. Repository access: **Only select repositories** → `fit-my-truck-preview`.
4. Permissions: **Contents** = Read and write, **Workflows** = Read and write.
5. Generate the token and copy it.
6. Open **Burnsted/fit-my-truck** → **Settings → Secrets and variables → Actions → New repository secret**.
7. Name: `PREVIEW_DEPLOY_TOKEN`. Value: the token.
8. **Actions → Deploy public web preview → Run workflow**.

### Manual refresh without a secret

```bash
pnpm install
pnpm build:preview
```

Copy the contents of `dist-preview/` onto `main` in `Burnsted/fit-my-truck-preview` (or run the deploy workflow after adding `PREVIEW_DEPLOY_TOKEN`). Vehicle and scene photos are Commons / Unsplash URLs in the JS bundle, so the preview does not need `vehicles/` or `scenes/` binaries.

Merging this repo’s `main` is what refreshes the public preview when `PREVIEW_DEPLOY_TOKEN` is set: **Actions → Deploy public web preview** runs `pnpm test`, `pnpm build`, `pnpm build:preview`, then publishes `dist-preview/` to [Burnsted/fit-my-truck-preview](https://github.com/Burnsted/fit-my-truck-preview). Until the secret exists, run `pnpm build:preview` locally and copy `dist-preview/` onto that public repo’s `main`. Photos are hosted Commons / Unsplash URLs, not bundled WebP.

Google Play (Android)

The web app is unchanged. Capacitor copies the Vite production build into a native Android project under `android/`. Package name `com.burnsted.fitmytruck` is set in `capacitor.config.json` and `android/app/build.gradle` and does not conflict with existing app config.

### What is in this repo

- Capacitor 8 config pointing at Vite `webDir: dist`
- Generated `android/` project (Gradle wrapper, `MainActivity`, branded splash/launcher colors)
- `pnpm android:sync` — production web build + copy into Android assets
- `pnpm android:open` — open the project in Android Studio (requires a local Android SDK)
- `android/keystore.properties.example` — local signing template (the real keystore is not in git)

### What Ted must do on a machine with Android Studio

Capacitor 8 needs **Node 22**, **Android Studio 2025.2.1+**, and an Android SDK with **API 36** (min SDK 24). This cloud checkout does not include an Android SDK, so a release AAB/APK must be built locally.

```bash
pnpm install
pnpm android:sync
pnpm android:open
```

Always run `pnpm android:sync` after a fresh clone. It rebuilds `dist/`, copies it into the Android project, and regenerates pnpm-specific Gradle paths in `android/capacitor.settings.gradle`. Opening Android Studio before that step will fail.

In Android Studio:

1. Let Gradle sync. Run the app on an emulator or a physical Android 7+ device to confirm the web UI loads.
2. Create a **release keystore** once and keep it offline (and backed up). Do not commit `*.jks`, `*.keystore`, or `android/keystore.properties`.
   ```bash
   keytool -genkeypair -v -keystore fit-my-truck-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias fitmytruck
   ```
3. Copy `android/keystore.properties.example` to `android/keystore.properties` and fill in `storeFile`, passwords, and `keyAlias`. `storeFile` is resolved from the `android/` folder.
4. Build a Play-ready Android App Bundle:
   - Android Studio: **Build → Generate Signed App Bundle / APK → Android App Bundle**, or
   - CLI (from the repo root, after `pnpm android:sync`):
     ```bash
     pnpm exec cap build android --androidreleasetype AAB \
       --keystorepath android/fit-my-truck-release.jks \
       --keystorealias fitmytruck \
       --keystorepass 'YOUR_STORE_PASSWORD' \
       --keystorealiaspass 'YOUR_KEY_PASSWORD'
     ```
   - Or Gradle, if `android/keystore.properties` exists:
     ```bash
     cd android && ./gradlew bundleRelease
     ```
   The AAB lands at `android/app/build/outputs/bundle/release/`.

### Play Console (manual — not in this repo)

1. Pay the one-time [Google Play developer registration](https://play.google.com/console/signup) fee and create the **Fit My Truck** app with package `com.burnsted.fitmytruck`.
2. Enroll in **Play App Signing** (recommended). Upload the first AAB; keep the upload keystore safe even after Play holds the app-signing key.
3. Complete the store listing: title, short/full description, 512×512 high-res icon, 1024×500 feature graphic, phone screenshots, and a privacy policy URL. Play still requires a privacy policy even though this build has no accounts.
4. Fill content rating, target audience, Data safety (this demo stores data only in the current session; no login or payments), and news-policy declarations.
5. Upload the AAB to an internal, closed, or production testing track. Promote when ready.

Do **not** add Google Play Billing or in-app products for `$79` / `$249` yet. Those prices are web-demo ribbons only.

Apple / iOS is intentionally omitted. Add it later with `@capacitor/ios` if needed.

MVP Boundaries

- Vehicle specifications, pricing, trade scores, and charger suggestions are demonstration data reviewed in August 2026. They are not live inventory or purchasing advice.
- Map My Day uses free OpenStreetMap tiles (OpenTopoMap + OSM streets via Leaflet), Photon / Nominatim place search, and the public OSRM router. No API keys. If those services are down, seeded Keystone places and estimated (haversine × 1.3) miles still update battery % and Workday / Play Day fit. Charging-network pins stay illustrative. Google / Mapbox keys are not required and are not used.
- Data is stored only in the current browser session. Accounts, saved projects, subscriptions, reports, and payments are not implemented.
- The calculations are estimates intended for early customer feedback and require sourced production data before commercial use.

Immediate Development Priorities

1. Continue splitting the prototype into focused screen, data, and calculation modules.
2. Expand automated tests for route, fleet, and invalid-input cases.
3. Complete hands-on accessibility and mobile-device review.
4. Keep primary navigation within one screen width.
5. Display Workday and Play Day as clear side-by-side choices.
6. Replace demonstration vehicle specifications with sourced, versioned data.
7. Develop trade-specific truck configurations.
8. Build inventory, comparison, and route-simulation tools.
9. Add FleetWatch account and subscription functionality.
10. Prepare a secure, testable demonstration version.
