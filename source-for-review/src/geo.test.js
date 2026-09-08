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
    charging: chargingOption("home"),
    equipmentItems: equipmentItemsFromIds(["extension-ladder", "wire-spools", "hand-tool-chargers"]),
    categoryScore: 93,
    categoryLabel: "Electrician",
    vehicleName: "Rivian R1T",
  };

  it("drops remaining charge, reserve, and fit when routed miles grow", async () => {
    const wintergreen = SEED_PLACES.find((place) => place.id === "wintergreen-keystone");
    const resort = SEED_PLACES.find((place) => place.id === "keystone-resort");
    const far = { lat: 36.1699, lon: -115.1398 };
    const shortStops = applyLegMiles(
      [placeToStop(1, wintergreen), placeToStop(2, resort)],
      (await routeStops([placeToStop(1, wintergreen), placeToStop(2, resort)])).legs,
    );
    const longStops = applyLegMiles(
      [placeToStop(1, wintergreen), placeToStop(2, { ...resort, ...far, id: "vegas" })],
      (await routeStops([placeToStop(1, wintergreen), placeToStop(2, { ...resort, ...far, id: "vegas" })])).legs,
    );
    const shortMiles = totalRouteMiles(shortStops);
    const longMiles = totalRouteMiles(longStops);
    expect(longMiles).toBeGreaterThan(shortMiles);

    const shortPlan = planRoute({ stops: shortStops, vehicleRange: 328, startCharge: 100, coldWeather: false });
    const longPlan = planRoute({ stops: longStops, vehicleRange: 328, startCharge: 100, coldWeather: false });
    expect(longPlan.finalCharge).toBeLessThan(shortPlan.finalCharge);

    const shortFit = workdayAssessment({ ...electricianDay, dailyMiles: shortMiles, configRange: 328 });
    const longFit = workdayAssessment({ ...electricianDay, dailyMiles: longMiles, configRange: 328 });
    expect(longFit.reserve.pct).toBeLessThan(shortFit.reserve.pct);
    expect(longFit.energy.totalKwh).toBeGreaterThan(shortFit.energy.totalKwh);
    expect(longFit.fitScore).toBeLessThan(shortFit.fitScore);
  });

  it("formats a selected place as the stop label", () => {
    const place = SEED_PLACES[0];
    expect(formatPlaceLabel(place)).toMatch(/Wintergreen/);
    expect(formatPlaceLabel(place)).toMatch(/Keystone/);
  });
});
