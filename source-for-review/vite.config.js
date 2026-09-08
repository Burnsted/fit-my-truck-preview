import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { sites } from "@openai/sites-vite-plugin";

const publicPreview = process.env.FIT_MY_TRUCK_PREVIEW === "1";

export default defineConfig({
  // Relative asset URLs work on GitHub project Pages and other static hosts.
  // Capacitor and the default `pnpm build` keep the root base.
  base: publicPreview ? "./" : "/",
  plugins: [sites(), react(), tailwindcss()],
  // Preview-only: leave React/icons on a public CDN so the compiled app
  //  is small enough to publish to the public Pages repo without a PAT.
  build: publicPreview
    ? {
        rollupOptions: {
          external: [
            "react",
            "react/jsx-runtime",
            "react/jsx-dev-runtime",
            "react-dom",
            "react-dom/client",
            "leaflet",
            "leaflet/dist/leaflet.css",
          ],
        },
      }
    : undefined,
});
