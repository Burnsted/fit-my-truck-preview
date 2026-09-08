from pathlib import Path
import json

src_dir = Path("assets/_src")
pieces = sorted(src_dir.glob("index-CE6fUd-V.part*"), key=lambda p: int(p.name.split("part")[-1]))
if not pieces:
    raise SystemExit("missing assets/_src JS parts")
js = b"".join(p.read_bytes().rstrip(b"\n") for p in pieces)
if b"Fishing boat" not in js:
    raise SystemExit("patched JS missing Play Day catalog")

part = 25600
n = (len(js) + part - 1) // part
stem = "index-CE6fUd-V"
assets = Path("assets")
written = []
for i in range(n):
    chunk = js[i * part:(i + 1) * part]
    dest = assets / f"{stem}.part{i}"
    dest.write_bytes(chunk)
    written.append(f"./assets/{stem}.part{i}")
    print("part", dest.name, len(chunk))

css_src = src_dir / "index-DRm4TlEf.css"
if css_src.exists():
    (assets / "index-DRm4TlEf.css").write_bytes(css_src.read_bytes())

part_list = ",\n        ".join(json.dumps(p) for p in written)
html = """<!doctype html>
<html lang="en">
  <head>
    <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/react@19.2.8",
          "react/jsx-runtime": "https://esm.sh/react@19.2.8/jsx-runtime",
          "react/jsx-dev-runtime": "https://esm.sh/react@19.2.8/jsx-dev-runtime",
          "react-dom": "https://esm.sh/react-dom@19.2.8",
          "react-dom/client": "https://esm.sh/react-dom@19.2.8/client"
        }
      }
    </script>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="description" content="Fit My Truck helps contractors and service fleets compare truck capability, range, towing, payload, charging, and operating cost." />
    <meta name="theme-color" content="#0f2a24" />
    <title>Fit My Truck</title>
    <link rel="stylesheet" crossorigin href="./assets/index-DRm4TlEf.css">
    <script type="module">
      const parts = [
        PART_LIST
      ];
      const sources = await Promise.all(
        parts.map(async (url) => {
          const response = await fetch(url);
          if (!response.ok) throw new Error("Failed to load " + url);
          return response.text();
        }),
      );
      await import(URL.createObjectURL(new Blob(sources, { type: "text/javascript" })));
    </script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
""".replace("PART_LIST", part_list)

Path("index.html").write_text(html)
Path("404.html").write_text(html)
Path("README.md").write_text("""# Fit My Truck — public web preview

Shareable HTTPS demo of [Fit My Truck](https://github.com/Burnsted/fit-my-truck).

**Open on a phone (no login):** https://burnsted.github.io/fit-my-truck-preview/

This repository contains only the compiled Vite production build. The source app, tests, and Android/Capacitor project stay private.

This preview is from **PR #14** branch `cursor/year-photos-wheels-2b74` (`4ec4bbe0e41fef35ca8485a7b098fb8bef4f11e1`) for Ted’s review — **not merged to `main`**.

Includes Play Day recreational towables and activity gear (fishing boat, pontoon, bikes, kayaks, camping, ATV/SxS), year photos, overflow trailer on Workday, type-in trade, Find My Truck bottom CTA, and live scores.

Year photos load from Wikimedia Commons. App JS is published as text parts (same GHA/text path as the prior PR14 preview).

Do not send friends to the ChatGPT-hosted preview; that URL is sign-in gated.
""")
print("html flipped", n, "parts", len(js))
