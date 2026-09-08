import { SCENE_IMAGES, VEHICLE_OPTIONS, resolveVehiclePhoto } from "../data";
import { MUTED } from "../theme";

export function vehicleAlt(vehicle) {
  const year = vehicle?.modelYear ? `${vehicle.modelYear} ` : "";
  return `${year}${[vehicle?.make, vehicle?.model].filter(Boolean).join(" ")}` .trim();
}

export function VehiclePhoto({
  vehicle,
  year,
  size = "thumb",
  eager = false,
  className = "",
  decorative = false,
}) {
  const shot = year != null ? resolveVehiclePhoto(vehicle, year) : vehicle;
  if (!shot?.imageUrl && !shot?.imageThumbUrl) return null;
  const src = size === "hero"
    ? (shot.imageUrl || shot.imageThumbUrl)
    : (shot.imageThumbUrl || shot.imageUrl);
  const alt = decorative ? "" : vehicleAlt(shot);

  return (
    <img
      src={src}
      alt={alt}
      data-vehicle-id={shot.id}
      data-model-year={shot.modelYear || ""}
      width={size === "hero" ? 1100 : 480}
      height={size === "hero" ? 618 : 360}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer-when-downgrade"
      fetchPriority={eager ? "high" : "auto"}
      className={className}
    />
  );
}

function creditLine(item) {
  const who = item.imageCredit || item.credit;
  const license = item.imageLicense || item.license;
  const href = item.imageSourceUrl || item.sourceUrl;
  const label = [who, license].filter(Boolean).join(", ");
  if (!label) return null;
  if (href) {
    return <a href={href} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">{label}</a>;
  }
  return label;
}

export function PhotoCredits() {
  return (
    <footer className="max-w-3xl mx-auto mt-10 pt-4 border-t" style={{ borderColor: "rgba(78, 151, 148, 0.28)" }}>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] leading-relaxed">
        Vehicle photos by model year (Wikimedia Commons FilePath, not bundled WebP):{" "}
        {VEHICLE_OPTIONS.map((vehicle, index) => (
          <span key={vehicle.id}>
            {index > 0 ? "; " : ""}
            {vehicle.make} {vehicle.model} — {creditLine(vehicle)}
          </span>
        ))}
        . Distinct licensed photos swap with the year picker. Wheel-trim crops are from the same Commons sources. Scene photos:{" "}
        {Object.values(SCENE_IMAGES).map((scene, index) => (
          <span key={scene.sourceUrl}>
            {index > 0 ? "; " : ""}
            {creditLine(scene)}
          </span>
        ))}
        . Full notes in ATTRIBUTION.md.
      </p>
    </footer>
  );
}
