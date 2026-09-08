======== FILE: src/geo.js ========
// Place search + driving-distance helpers for Map My Day.
// No API keys. Public endpoints (Photon, Nominatim, OSRM) are used when the
// network is available; seeded Keystone places + haversine keep the demo
// working offline or in tests.

export const KEYSTONE_CENTER = { lat: 39.6062, lon: -105.965 };

// Village at Wintergreen is the Keystone complex people mean by
// "Wintergreen Apartments". Resort coords are River Run / Dercum Square.
export const SEED_PLACES = [
  {
    id: "wintergreen-keystone",
    name: "Village at Wintergreen Apartments",
    address: "235 Antlers Gulch Rd, Keystone, CO 80435",
    lat: 39.6052,
    lon: -105.9865,
    aliases: [
      "wintergreen apartments",
      "wintergreen apartment",
      "village at wintergreen",
      "wintergreen keystone",
      "wintergreen",
    ],
  },
  {
    id: "keystone-resort",
    name: "Keystone Ski Resort",
    address: "100 Dercum Square, Keystone, CO 80435",
    lat: 39.60733,
    lon: -105.94361,
    aliases: [
      "keystone ski area",
      "keystone ski resort",
      "keystone resort",
      "keystone mountain",
      "keystone",
    ],
  },
  {
    id: "keystone-mountain-house",
    name: "Keystone Mountain House",
    address: "Mountain House Base, Keystone, CO 80435",
    lat: 39.6084,
    lon: -105.9558,
    aliases: ["keystone mountain house", "mountain house keystone"],
  },
  {
    id: "river-run-village",
    name: "River Run Village",
    address: "River Run Rd, Keystone, CO 80435",
    lat: 39.6081,
    lon: -105.9439,
    aliases: ["river run village", "river run keystone"],
  },
];

export const ROAD_FACTOR = 1.3;
export const SEARCH_DEBOUNCE_MS = 320;
export const NOMINATIM_GAP_MS = 1100;
export const PHOTON_GAP_MS = 450;
export const OSRM_GAP_MS = 400;

const searchCache = new Map();
const routeCache = new Map();

const photonLimiter = createLimiter(PHOTON_GAP_MS);
const nominatimLimiter = createLimiter(NOMINATIM_GAP_MS);
const osrmLimiter = createLimiter(OSRM_GAP_MS);

export function isGeoNetworkEnabled() {
  return import.meta.env.MODE !== "test";
}

export function resetGeoCaches() {
  searchCache.clear();
  routeCache.clear();
}

export function normalizeQuery(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function haversineMiles(a, b) {
  const lat1 = Number(a?.lat);
  const lon1 = Number(a?.lon);
  const lat2 = Number(b?.lat);
  const lon2 = Number(b?.lon);
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return 0;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const r = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h = sinLat * sinLat + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * sinLon * sinLon;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function estimateRoadMiles(a, b) {
  return round1(haversineMiles(a, b) * ROAD_FACTOR);
}

export function matchSeedPlaces(query, limit = 6) {
  const q = normalizeQuery(query);
  if (!q) return [];
  const scored = SEED_PLACES.map((place) => {
    const hay = [place.name, place.address, ...(place.aliases || [])].map(normalizeQuery);
    let score = 0;
    for (const text of hay) {
      if (text === q) score = Math.max(score, 100);
      else if (text.startsWith(q)) score = Math.max(score, 90);
      else if (text.includes(q)) score = Math.max(score, 75);
      else if (q.includes(text) && text.length >= 6) score = Math.max(score, 70);
      else if (tokensOverlap(q, text)) score = Math.max(score, 55);
    }
    return { place, score };
  }).filter((row) => row.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((row) => ({ ...row.place, source: "seed" }));
}

export function formatPlaceLabel(place) {
  if (!place) return "";
  if (place.address && place.name && !place.address.toLowerCase().includes(place.name.toLowerCase())) {
    return `${place.name} — ${place.address}`;
  }
  return place.address || place.name || "";
}

export function defaultMapStops() {
  const origin = SEED_PLACES.find((place) => place.id === "wintergreen-keystone");
  const dest = SEED_PLACES.find((place) => place.id === "keystone-resort");
  return [
    placeToStop(1, origin, 0),
    placeToStop(2, dest, estimateRoadMiles(origin, dest)),
  ];
}

export function placeToStop(id, place, legMiles = 0) {
  return {
    id,
    query: place?.name || "",
    address: formatPlaceLabel(place),
    place: place || null,
    lat: place?.lat ?? null,
    lon: place?.lon ?? null,
    legMiles: Math.max(0, Number(legMiles) || 0),
    milesSource: place ? "estimate" : "empty",
  };
}

export function applyLegMiles(stops, legs, source = "estimate") {
  return (stops || []).map((stop, index) => {
    if (index === 0) return { ...stop, legMiles: 0, milesSource: source };
    const miles = Math.max(0, Number(legs?.[index - 1]) || 0);
    return { ...stop, legMiles: miles, milesSource: source };
  });
}

export function totalRouteMiles(stops) {
  return round1((stops || []).reduce((sum, stop) => sum + Math.max(0, Number(stop.legMiles) || 0), 0));
}

export function placedStops(stops) {
  return (stops || []).filter((stop) => Number.isFinite(Number(stop.lat ?? stop.place?.lat)) && Number.isFinite(Number(stop.lon ?? stop.place?.lon)));
}

export function stopCoords(stop) {
  const lat = Number(stop?.lat ?? stop?.place?.lat);
  const lon = Number(stop?.lon ?? stop?.place?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}

export async function searchPlaces(query, { bias = KEYSTONE_CENTER, limit = 6 } = {}) {
  const q = String(query || "").trim();
  if (q.length < 2) return [];
  const cacheKey = `${normalizeQuery(q)}|${round4(bias.lat)},${round4(bias.lon)}`;
  if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);

  const seeds = matchSeedPlaces(q, limit);
  if (!isGeoNetworkEnabled()) {
    searchCache.set(cacheKey, seeds);
    return seeds;
  }

  const remote = [];
  try {
    const photon = await searchPhoton(q, bias, limit);
    remote.push(...photon);
  } catch {
    // Photon is best-effort.
  }
  if (remote.length < 3) {
    try {
      const nominatim = await searchNominatim(q, limit);
      remote.push(...nominatim);
    } catch {
      // Nominatim is fallback-only; CORS or rate limits are fine.
    }
  }

  const merged = dedupePlaces([...seeds, ...remote]).slice(0, limit);
  searchCache.set(cacheKey, merged);
  persistCache("fmt-search", cacheKey, merged);
  return merged;
}

export async function routeStops(stops) {
  const points = placedStops(stops).map((stop) => stopCoords(stop)).filter(Boolean);
  if (points.length < 2) {
    return {
      miles: 0,
      legs: [],
      geometry: [],
      source: "empty",
    };
  }

  const cacheKey = points.map((point) => `${round4(point.lat)},${round4(point.lon)}`).join(";");
  if (routeCache.has(cacheKey)) return routeCache.get(cacheKey);

  const estimatedLegs = [];
  for (let i = 1; i < points.length; i += 1) {
    estimatedLegs.push(estimateRoadMiles(points[i - 1], points[i]));
  }
  const fallback = {
    miles: round1(estimatedLegs.reduce((sum, miles) => sum + miles, 0)),
    legs: estimatedLegs,
    geometry: points.map((point) => [point.lat, point.lon]),
    source: "estimate",
  };

  if (!isGeoNetworkEnabled()) {
    routeCache.set(cacheKey, fallback);
    return fallback;
  }

  try {
    const routed = await routeOsrm(points);
    routeCache.set(cacheKey, routed);
    persistCache("fmt-route", cacheKey, routed);
    return routed;
  } catch {
    routeCache.set(cacheKey, fallback);
    return fallback;
  }
}

async function searchPhoton(query, bias, limit) {
  await photonLimiter();
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("lang", "en");
  if (Number.isFinite(bias?.lat) && Number.isFinite(bias?.lon)) {
    url.searchParams.set("lat", String(bias.lat));
    url.searchParams.set("lon", String(bias.lon));
  }
  const data = await getJson(url, { Accept: "application/json" });
  return (data?.features || []).map(fromPhoton).filter(validPlace);
}

async function searchNominatim(query, limit) {
  await nominatimLimiter();
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", String(limit));
  // Public Nominatim asks for a valid identifying Referer (automatic in browsers)
  // and about 1 request/second. No API key. Do not send a custom User-Agent from
  // the browser — that header is forbidden.
  const data = await getJson(url, { Accept: "application/json" });
  return (Array.isArray(data) ? data : []).map(fromNominatim).filter(validPlace);
}

async function routeOsrm(points) {
  await osrmLimiter();
  const path = points.map((point) => `${point.lon},${point.lat}`).join(";");
  const url = new URL(`https://router.project-osrm.org/route/v1/driving/${path}`);
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("steps", "false");
  const data = await getJson(url, { Accept: "application/json" });
  const route = data?.routes?.[0];
  if (!route) throw new Error("no route");
  const legs = (route.legs || []).map((leg) => round1((Number(leg.distance) || 0) / 1609.344));
  const geometry = (route.geometry?.coordinates || []).map(([lon, lat]) => [lat, lon]);
  return {
    miles: round1((Number(route.distance) || 0) / 1609.344),
    legs: legs.length ? legs : [round1((Number(route.distance) || 0) / 1609.344)],
    geometry,
    source: "osrm",
  };
}

async function getJson(url, headers = {}) {
  const response = await fetch(String(url), {
    headers,
    referrerPolicy: "strict-origin-when-cross-origin",
  });
  if (!response.ok) throw new Error(`geo ${response.status}`);
  return response.json();
}

function fromPhoton(feature) {
  const [lon, lat] = feature?.geometry?.coordinates || [];
  const props = feature?.properties || {};
  const name = props.name || props.street || "Place";
  const street = [props.housenumber, props.street].filter(Boolean).join(" ");
  const locality = props.city || props.town || props.village || props.county;
  const address = [street || null, locality, props.state, props.postcode, props.country]
    .filter(Boolean)
    .join(", ");
  return {
    id: `photon-${props.osm_type || "n"}-${props.osm_id || `${lat},${lon}`}`,
    name,
    address: address || name,
    lat: Number(lat),
    lon: Number(lon),
    source: "photon",
  };
}

function fromNominatim(item) {
  const name = item.name || String(item.display_name || "").split(",")[0] || "Place";
  return {
    id: `nominatim-${item.place_id || `${item.lat},${item.lon}`}`,
    name,
    address: item.display_name || name,
    lat: Number(item.lat),
    lon: Number(item.lon),
    source: "nominatim",
  };
}

function validPlace(place) {
  return place && place.name && Number.isFinite(place.lat) && Number.isFinite(place.lon);
}

function dedupePlaces(places) {
  const seen = new Set();
  const out = [];
  for (const place of places) {
    const key = `${normalizeQuery(place.name)}|${round4(place.lat)}|${round4(place.lon)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(place);
  }
  return out;
}

function tokensOverlap(query, text) {
  const qTokens = query.split(" ").filter((token) => token.length >= 3);
  if (!qTokens.length) return false;
  return qTokens.every((token) => text.includes(token));
}

function createLimiter(minGapMs) {
  let nextAt = 0;
  return async function waitTurn() {
    const now = Date.now();
    const start = Math.max(now, nextAt);
    nextAt = start + minGapMs;
    const wait = start - now;
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  };
}

function persistCache(bucket, key, value) {
  try {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.setItem(`${bucket}:${key}`, JSON.stringify(value));
  } catch {
    // Private mode / quota — memory cache is enough.
  }
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function round4(value) {
  return Math.round(Number(value) * 10000) / 10000;
}


======== FILE: src/geo.test.js ========
import { describe, expect, it } from "vitest";
import { planRoute, workdayAssessment } from "./calculations";
import { chargingOption, equipmentItemsFromIds } from "./data";
import {
  applyLegMiles,
  defaultMapStops,
  estimateRoadMiles,
  formatPlaceLabel,
  haversineMiles,
  isGeoNetworkEnabled,
  matchSeedPlaces,
  placeToStop,
  resetGeoCaches,
  routeStops,
  searchPlaces,
  SEED_PLACES,
  totalRouteMiles,
} from "./geo";

describe("seeded place autocomplete", () => {
  it("suggests the Keystone Wintergreen complex from Wintergreen Apartments", () => {
    const hits = matchSeedPlaces("Wintergreen Apartments");
    expect(hits[0].id).toBe("wintergreen-keystone");
    expect(hits[0].address).toMatch(/Keystone/i);
    expect(hits[0].lat).toBeCloseTo(39.6052, 3);
  });

  it("suggests Keystone Ski Resort from Ski Area and Resort queries", () => {
    expect(matchSeedPlaces("Keystone Ski Area")[0].id).toBe("keystone-resort");
    expect(matchSeedPlaces("Keystone Ski Resort")[0].id).toBe("keystone-resort");
    expect(matchSeedPlaces("Keystone Ski Resort")[0].address).toMatch(/Dercum|Keystone/i);
  });
});

describe("searchPlaces", () => {
  it("stays on seeded Keystone places in tests (no network)", async () => {
    resetGeoCaches();
    expect(isGeoNetworkEnabled()).toBe(false);
    const hits = await searchPlaces("Wintergreen Apartments");
    expect(hits.some((place) => /Keystone/i.test(place.address))).toBe(true);
  });
});

describe("routing distances", () => {
  const wintergreen = SEED_PLACES.find((place) => place.id === "wintergreen-keystone");
  const resort = SEED_PLACES.find((place) => place.id === "keystone-resort");

  it("measures a short Keystone hop and applies it as live leg miles", async () => {
    const straight = haversineMiles(wintergreen, resort);
    const road = estimateRoadMiles(wintergreen, resort);
    expect(straight).toBeGreaterThan(1);
    expect(straight).toBeLessThan(6);
    expect(road).toBeGreaterThan(straight);
    expect(road).toBeLessThan(8);

    const stops = defaultMapStops();
    expect(stops[0].address).toMatch(/Wintergreen|Antlers/i);
    expect(stops[1].address).toMatch(/Keystone/i);

    const routed = await routeStops(stops);
    expect(routed.source).toBe("estimate");
    expect(routed.miles).toBeCloseTo(road, 1);
    const withMiles = applyLegMiles(stops, routed.legs, routed.source);
    expect(withMiles[0].legMiles).toBe(0);
    expect(withMiles[1].legMiles).toBeCloseTo(road, 1);
    expect(totalRouteMiles(withMiles)).toBeCloseTo(road, 1);
  });

  it("increases total miles when a farther third stop is added", async () => {
    const extra = {
      id: "far-denver",
      name: "Denver Union Station",
      address: "1701 Wynkoop St, Denver, CO 80202",
      lat: 39.7539,
      lon: -105.0019,
    };
    const short = [
      placeToStop(1, wintergreen, 0),
      placeToStop(2, resort, 0),
    ];
    const long = [
      placeToStop(1, wintergreen, 0),
      placeToStop(2, resort, 0),
      placeToStop(3, extra, 0),
    ];
    const shortRoute = await routeStops(short);
    const longRoute = await routeStops(long);
    expect(longRoute.miles).toBeGreaterThan(shortRoute.miles + 50);
  });
});

describe("distance → range and fit recalculation", () => {
  const electricianDay = {
    dailyMiles: 12,
    stops: 1,
    trailerWeight: 0,
    towingCapacity: 11000,
    payloadWeight: 800,
    payloadCapacity: 1764,
