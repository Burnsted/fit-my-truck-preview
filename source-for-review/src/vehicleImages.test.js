import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  COMMONS_FILEPATH,
  SCENE_IMAGES,
  VEHICLE_CONFIGS,
  VEHICLE_OPTIONS,
  commonsFileName,
  commonsFilePath,
  resolveVehiclePhoto,
  vehicleYearOptions,
} from "./data";

const root = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "..");

describe("vehicle photos", () => {
  it("gives each selectable vehicle a hosted Commons photo and thumb", () => {
    const urls = VEHICLE_OPTIONS.map((vehicle) => vehicle.imageUrl);
    const thumbs = VEHICLE_OPTIONS.map((vehicle) => vehicle.imageThumbUrl);

    expect(urls.every(Boolean)).toBe(true);
    expect(thumbs.every(Boolean)).toBe(true);
    expect(new Set(urls).size).toBe(VEHICLE_OPTIONS.length);
    expect(new Set(thumbs).size).toBe(VEHICLE_OPTIONS.length);

    for (const vehicle of VEHICLE_OPTIONS) {
      expect(vehicle.imageUrl).toContain(COMMONS_FILEPATH);
      expect(vehicle.imageThumbUrl).toContain(COMMONS_FILEPATH);
      expect(vehicle.imageThumbUrl).toMatch(/[?&]width=480\b/);
      expect(vehicle.imageUrl).not.toBe(vehicle.imageThumbUrl);
      expect(vehicle.imageUrl).not.toMatch(/vehicles\/.+\.webp/);
      expect(vehicle.commonsFile).toBeTruthy();
      expect(vehicle.imageCredit).toBeTruthy();
      expect(vehicle.imageLicense).toBeTruthy();
      expect(vehicle.imageSourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    }
  });

  it("uses a distinct Commons still per model year, not per pack or motor", () => {
    for (const vehicle of VEHICLE_OPTIONS) {
      const years = vehicleYearOptions(vehicle);
      const urls = years.map((year) => resolveVehiclePhoto(vehicle, year).imageUrl);
      expect(new Set(urls).size).toBe(years.length);
      for (const year of years) {
        const shot = resolveVehiclePhoto(vehicle, year);
        expect(shot.commonsFile).toBeTruthy();
        expect(shot.imageUrl).toBe(commonsFilePath(shot.commonsFile, 1280));
        expect(shot.imageThumbUrl).toBe(commonsFilePath(shot.commonsFile, 480));
        expect(shot.imageUrl).toContain(encodeURIComponent(commonsFileName(shot.commonsFile)));
        expect(shot.imageCredit).toBeTruthy();
        expect(shot.imageLicense).toBeTruthy();
        const localHero = path.join(root, "public", "vehicles", `${vehicle.id}-${year}.webp`);
        const localThumb = path.join(root, "public", "vehicles", `${vehicle.id}-${year}-thumb.webp`);
        expect(existsSync(localHero), localHero).toBe(true);
        expect(existsSync(localThumb), localThumb).toBe(true);
      }
      const hashes = years.map((year) => {
        const bytes = readFileSync(path.join(root, "public", "vehicles", `${vehicle.id}-${year}.webp`));
        return createHash("sha256").update(bytes).digest("hex");
      });
      expect(new Set(hashes).size, `${vehicle.id} year photos must be distinct files`).toBe(years.length);
    }
  });

  it("stores an inline wheel graphic for every wheel option so preview cannot 404", () => {
    for (const [vehicleId, config] of Object.entries(VEHICLE_CONFIGS)) {
      const urls = config.wheels.map((wheel) => wheel.imageUrl);
      expect(urls.every(Boolean), vehicleId).toBe(true);
      expect(new Set(urls).size).toBe(config.wheels.length);
      for (const wheel of config.wheels) {
        expect(wheel.imageUrl.startsWith("data:image/svg+xml")).toBe(true);
        expect(wheel.imageUrl).not.toMatch(/\/vehicles\/wheels\//);
      }
    }
  });

  it("keeps scene photos on real Unsplash image URLs, not photo pages", () => {
    for (const scene of Object.values(SCENE_IMAGES)) {
      expect(scene.url).toMatch(/^https:\/\/images\.unsplash\.com\/photo-/);
      expect(scene.url).not.toMatch(/unsplash\.com\/photos\//);
      expect(scene.license).toMatch(/Unsplash/i);
      expect(scene.sourceUrl).toMatch(/^https:\/\/unsplash\.com\/photos\//);
      expect(scene.alt).toBeTruthy();
    }
  });

  it("does not use a printed-atlas backdrop for Map My Day", () => {
    expect(SCENE_IMAGES.map).toBeUndefined();
    expect(Object.keys(SCENE_IMAGES)).toEqual(expect.arrayContaining(["workday", "playday", "fleet"]));
  });
});
