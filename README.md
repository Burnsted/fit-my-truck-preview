# Fit My Truck — public web preview

Shareable HTTPS demo of [Fit My Truck](https://github.com/Burnsted/fit-my-truck).

**Intended phone link (no login):** https://burnsted.github.io/fit-my-truck-preview/

This repository is public on purpose so GitHub Pages can serve the compiled Vite build. The source app, tests, and Android/Capacitor project stay private in `Burnsted/fit-my-truck`.

The compiled `index.html` / `assets/` are published from the private repo by the **Deploy public web preview** workflow once `PREVIEW_DEPLOY_TOKEN` is set, or by copying `dist-preview/` from a local `pnpm build:preview`.
