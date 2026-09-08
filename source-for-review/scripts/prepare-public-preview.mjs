import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const dist = new URL("../dist/", import.meta.url);
const out = new URL("../dist-preview/", import.meta.url);

await rm(out, { recursive: true, force: true });
await mkdir(new URL("assets/", out), { recursive: true });
await mkdir(new URL(".github/workflows/", out), { recursive: true });

await cp(new URL("index.html", dist), new URL("index.html", out));
await cp(new URL("index.html", dist), new URL("404.html", out));
await cp(new URL("assets/", dist), new URL("assets/", out), { recursive: true });
// Photos are Commons / Unsplash URLs in the JS bundle. Do not require local
// vehicles/ or scenes/ binaries — GitHub Pages preview cannot host them via
// the text push path.
await writeFile(new URL(".nojekyll", out), "");
await cp(
  new URL("preview-pages.workflow.yml", import.meta.url),
  new URL(".github/workflows/pages.yml", out),
);

const readme = `# Fit My Truck — public web preview

Shareable HTTPS demo of [Fit My Truck](https://github.com/Burnsted/fit-my-truck).

**Open on a phone (no login):** https://burnsted.github.io/fit-my-truck-preview/

This repository contains only the compiled Vite production build. The source app, tests, and Android/Capacitor project stay private.

Do not send friends to the ChatGPT-hosted preview; that URL is sign-in gated.
`;

await writeFile(new URL("README.md", out), readme);

const importMap = `
    <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/react@19.2.8",
          "react/jsx-runtime": "https://esm.sh/react@19.2.8/jsx-runtime",
          "react/jsx-dev-runtime": "https://esm.sh/react@19.2.8/jsx-dev-runtime",
          "react-dom": "https://esm.sh/react-dom@19.2.8",
          "react-dom/client": "https://esm.sh/react-dom@19.2.8/client",
          "leaflet": "https://esm.sh/leaflet@1.9.4",
          "leaflet/dist/leaflet.css": "https://esm.sh/leaflet@1.9.4/dist/leaflet.css"
        }
      }
    </script>`;

let html = await readFile(new URL("index.html", out), "utf8");
if (!html.includes("./assets/")) {
  throw new Error("Public preview HTML must use relative asset URLs (build with FIT_MY_TRUCK_PREVIEW=1).");
}
const leafletCss = '\n    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="">';
if (!html.includes("type=\"importmap\"")) {
  html = html.replace("<head>", `<head>${importMap}`);
}
if (!html.includes('rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"')) {
  html = html.replace("</title>", `</title>${leafletCss}`);
}
await writeFile(new URL("index.html", out), html);
await writeFile(new URL("404.html", out), html);
