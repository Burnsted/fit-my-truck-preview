import { useEffect, useMemo, useRef, useState } from "react";
import { BatteryCharging, ExternalLink, Info } from "lucide-react";
import { applySelectedVehicleFit, compareWorkdayVehicles, configRange, operatingCosts, vehicleFitMap, workdayAssessment } from "../calculations";
import {
  CHARGERS,
  CHARGING_OPTIONS,
  CURRENT_TRUCK_PRESETS,
  HOME_CHARGER_SHOP,
  UNKNOWN_CHARGING_START_PCT,
  START_CHARGE_DEFAULT,
  START_CHARGE_MAX,
  START_CHARGE_MIN,
  VEHICLE_CONFIGS,
  VEHICLE_OPTIONS,
  BED_ACCESSORY_OPTIONS,
  MISC_PAYLOAD_OPTIONS,
  OVERFLOW_TRAILER_OPTIONS,
  PLAY_TOWABLE_OPTIONS,
  bedAccessoriesPriceUsd,
  bedAccessoryItemsFromIds,
  chargingOption,
  clampVehicleYear,
  defaultPlayGearIds,
  defaultPlayTowableId,
  equipmentItemsFromIds,
  playGearItemsFromIds,
  playGearOptionsForActivity,
  playTowableById,
  toggleBedAccessoryId,
  resolveTradeProfile,
  resolveVehiclePhoto,
  selectableEquipmentForTrade,
  tradeShowsBedAccessories,
  vehicleYearOptions,
} from "../data";
import {
  AMBER, BORDER, MUTED, OLIVE, PANEL, PANEL_GRADIENT, PAPER, RUST, TEAL,
} from "../theme";
import { ModeAndTradeSelector } from "../components/ModeAndTradeSelector";
import { PriceRibbon } from "../components/PriceRibbon";
import { TruckVisual } from "../components/TruckVisual";
import { WorkdayFitResult } from "../components/WorkdayFitResult";
import { BedAccessoryMultiSelect, KitMultiSelect } from "../components/KitMultiSelect";
import { FindMyTruckCta } from "../components/FindMyTruckCta";
import { ClearAllButton, EyebrowBanner, MiniField, RefreshResultsButton, StartChargeControl } from "../components/ui";
import { ConfigGroup, VehicleDropdown } from "../components/vehicleConfig";

const EMPTY_IDS = [];

export function BuildMyWorkdayScreen({ mode, setMode, trade, setTrade, customTrade = "", setCustomTrade, activity, setActivity, goToMatching, dailyMiles, setDailyMiles, dayStops, setDayStops, vehicleId, setVehicleId, vehicleYear, setVehicleYear, onVehicleFitsChange, onWorkdayInputsChange, startCharge = START_CHARGE_DEFAULT, setStartCharge }) {
  const selectedId = VEHICLE_OPTIONS.some((v) => v.id === vehicleId) ? vehicleId : VEHICLE_OPTIONS[0].id;
  const selectedVehicle = VEHICLE_OPTIONS.find((v) => v.id === selectedId) || VEHICLE_OPTIONS[0];
  const [year, setYearInternal] = useState(String(selectedVehicle.firstAvailableYear ?? 2022));
  const setYear = setVehicleYear || setYearInternal;
  const yearValue = vehicleYear ?? year;
  const [pack, setPack] = useState(VEHICLE_CONFIGS[selectedId].recommended.pack);
  const [motor, setMotor] = useState(VEHICLE_CONFIGS[selectedId].recommended.motor);
  const [wheel, setWheel] = useState(VEHICLE_CONFIGS[selectedId].recommended.wheel);

  const initialProfile = resolveTradeProfile(trade, customTrade);
  const initialDefaults = initialProfile.defaults;
  const [localStops, setLocalStops] = useState(initialDefaults.stops);
  const stops = dayStops ?? localStops;
  const setStops = setDayStops ?? setLocalStops;
  const [trailerWeight, setTrailerWeight] = useState(initialDefaults.trailerWeight);
  const [overflowTrailerId, setOverflowTrailerId] = useState("none");
  const [payloadWeight, setPayloadWeight] = useState(initialDefaults.payloadWeight);
  const [chargingId, setChargingId] = useState("home");
  const [equipmentIds, setEquipmentIds] = useState(initialDefaults.equipmentIds);
  const [bedAccessoryIds, setBedAccessoryIds] = useState([]);
  const [playTowableId, setPlayTowableId] = useState(() => defaultPlayTowableId(activity));
  const [playGearIds, setPlayGearIds] = useState(() => defaultPlayGearIds(activity));
  const [currentTruckId, setCurrentTruckId] = useState(CURRENT_TRUCK_PRESETS[0].id);
  const [customCurrentTruck, setCustomCurrentTruck] = useState("");
  const [updatedFlash, setUpdatedFlash] = useState(false);

  const [currentMpg, setCurrentMpg] = useState(CURRENT_TRUCK_PRESETS[0].mpg);
  const [dieselPrice, setDieselPrice] = useState(4.05);
  const [electricityRate, setElectricityRate] = useState(0.15);
  const [annualMiles, setAnnualMiles] = useState(18000);
  const [evPrice, setEvPrice] = useState(selectedVehicle.price ?? 46000);
  const [tradeIn, setTradeIn] = useState(22000);

  const config = VEHICLE_CONFIGS[selectedVehicle.id];
  const chargingPreset = chargingOption(chargingId);
  const startPct = Math.min(START_CHARGE_MAX, Math.max(START_CHARGE_MIN, Number(startCharge) || START_CHARGE_DEFAULT));
  const charging = useMemo(
    () => ({ ...chargingPreset, startChargePct: startPct }),
    [chargingPreset, startPct],
  );
  const homeCharging = charging.hasOvernight;
  const yearOptions = vehicleYearOptions(selectedVehicle);
  const selectedYear = String(clampVehicleYear(yearValue, selectedVehicle));

  const tradeProfile = useMemo(() => resolveTradeProfile(trade, customTrade), [trade, customTrade]);

  const lastKitKey = useRef(tradeProfile.kitKey);
  useEffect(() => {
    if (lastKitKey.current === tradeProfile.kitKey) return;
    lastKitKey.current = tradeProfile.kitKey;
    const defaults = tradeProfile.defaults;
    setDailyMiles(defaults.dailyMiles);
    setStops(defaults.stops);
    setTrailerWeight(defaults.trailerWeight);
    setPayloadWeight(defaults.payloadWeight);
    setEquipmentIds(defaults.equipmentIds);
    setBedAccessoryIds([]);
  }, [tradeProfile.kitKey, setDailyMiles, setStops]);

  useEffect(() => {
    const rec = VEHICLE_CONFIGS[selectedId]?.recommended;
    const vehicle = VEHICLE_OPTIONS.find((item) => item.id === selectedId);
    if (rec) {
      setPack(rec.pack);
      setMotor(rec.motor);
      setWheel(rec.wheel);
    }
    if (vehicle) {
      setEvPrice(vehicle.price ?? 0);
      setYear((current) => String(clampVehicleYear(current, vehicle)));
    }
  }, [selectedId]);

  const handleVehicleChange = (id) => {
    setVehicleId(id);
  };

  useEffect(() => {
    setPlayTowableId(defaultPlayTowableId(activity));
    setPlayGearIds(defaultPlayGearIds(activity));
  }, [activity]);

  const toggleEquipment = (id) => {
    setEquipmentIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };
  const togglePlayGear = (id) => {
    setPlayGearIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };
  const toggleBedAccessory = (id) => {
    setBedAccessoryIds((current) => toggleBedAccessoryId(current, id));
  };
  const handleCurrentTruckChange = (id) => {
    setCurrentTruckId(id);
    const preset = CURRENT_TRUCK_PRESETS.find((item) => item.id === id);
    if (preset?.mpg) setCurrentMpg(preset.mpg);
    if (id !== "other") setCustomCurrentTruck("");
  };
  const refreshResults = () => {
    document.getElementById("fit-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setUpdatedFlash(true);
    window.setTimeout(() => setUpdatedFlash(false), 1600);
  };
  const dayTitle = mode === "work" ? "Workday" : "Play Day";

  const isPlayDay = mode === "recreation";
  const modeColor = mode === "work" ? AMBER : TEAL;
  const equipmentOptions = tradeProfile.equipmentOptions;
  const selectableEquipment = useMemo(
    () => selectableEquipmentForTrade(trade, customTrade),
    [trade, customTrade],
  );
  const playGearOptions = useMemo(() => playGearOptionsForActivity(activity), [activity]);
  const playTowable = playTowableById(playTowableId);
  const showBedAccessories = !isPlayDay && tradeShowsBedAccessories(tradeProfile.name);
  const selectedBedIds = showBedAccessories ? bedAccessoryIds : EMPTY_IDS;
  const bedUpfitPrice = isPlayDay ? 0 : bedAccessoriesPriceUsd(selectedBedIds);
  const equipmentItems = useMemo(() => {
    if (isPlayDay) return playGearItemsFromIds(playGearIds, activity);
    const kitItems = equipmentItemsFromIds(equipmentIds, selectableEquipment);
    return [...kitItems, ...bedAccessoryItemsFromIds(selectedBedIds)];
  }, [isPlayDay, playGearIds, activity, equipmentIds, selectableEquipment, selectedBedIds]);
  const kitWeightLbs = equipmentItems.reduce((sum, item) => sum + (Number(item.weightLbs) || 0), 0);
  const kitTrailerLbs = equipmentItems.reduce((sum, item) => sum + (Number(item.trailerWeightLbs) || 0), 0);
  const selectedTradeScore = tradeProfile.hasConvertibilityScore === false ? null : (tradeProfile.score ?? 75);
  const categoryLabel = mode === "work" ? tradeProfile.categoryLabel : activity;
  const activeTrailerWeight = isPlayDay ? playTowable.emptyWeightLbs : trailerWeight;
  const activeOverflowId = isPlayDay ? "none" : overflowTrailerId;

  // --- Range calc, including an honest towing penalty ---
  const baseConfigRange = useMemo(
    () => configRange(selectedVehicle, config, { pack, motor, wheel }),
    [pack, motor, wheel, selectedVehicle, config],
  );
  const recommendedRange = useMemo(
    () => configRange(selectedVehicle, config, config.recommended),
    [selectedVehicle, config],
  );

  const workdayInputs = useMemo(() => ({
    dailyMiles,
    stops,
    trailerWeight: activeTrailerWeight,
    payloadWeight,
    charging,
    equipmentItems,
    overflowTrailerId: activeOverflowId,
    categoryScore: mode === "work" ? selectedTradeScore : 80,
    categoryLabel,
    tradeId: mode === "work" ? tradeProfile.kitKey : null,
  }), [dailyMiles, stops, activeTrailerWeight, payloadWeight, charging, equipmentItems, activeOverflowId, mode, selectedTradeScore, categoryLabel, tradeProfile.kitKey]);

  const assessment = useMemo(() => {
    const packOption = config.packs.find((item) => item.id === pack) || config.packs[0];
    const motorOption = config.motors.find((item) => item.id === motor) || config.motors[0];
    const wheelOption = config.wheels.find((item) => item.id === wheel) || config.wheels[0];
    return workdayAssessment({
      ...workdayInputs,
      configRange: baseConfigRange,
      towingCapacity: selectedVehicle.towing,
      payloadCapacity: selectedVehicle.payload,
      vehicleName: `${selectedYear} ${selectedVehicle.make} ${selectedVehicle.model}`,
      packLabel: packOption.label,
      motorLabel: motorOption.label,
      wheelLabel: wheelOption.label,
      recommendedRange,
      evKwhPer100Miles: selectedVehicle.kwhPer100Miles,
      vehicleId: selectedVehicle.id,
      tradeId: workdayInputs.tradeId,
    });
  }, [workdayInputs, baseConfigRange, recommendedRange, selectedVehicle, config, pack, motor, wheel, selectedYear]);

  const recommendedComparisons = useMemo(
    () => compareWorkdayVehicles({ vehicles: VEHICLE_OPTIONS, configs: VEHICLE_CONFIGS, workdayInputs }),
    [workdayInputs],
  );
  const comparisons = useMemo(
    () => applySelectedVehicleFit(recommendedComparisons, selectedId, assessment),
    [recommendedComparisons, selectedId, assessment],
  );
  const fitByVehicle = useMemo(() => vehicleFitMap(comparisons), [comparisons]);
  const lastFitsJson = useRef("");
  const lastInputsRef = useRef(null);

  useEffect(() => {
    const serialized = JSON.stringify(fitByVehicle);
    if (lastFitsJson.current === serialized) return;
    lastFitsJson.current = serialized;
    onVehicleFitsChange?.(fitByVehicle);
  }, [fitByVehicle, onVehicleFitsChange]);

  useEffect(() => {
    if (lastInputsRef.current === workdayInputs) return;
    lastInputsRef.current = workdayInputs;
    onWorkdayInputsChange?.(workdayInputs);
  }, [workdayInputs, onWorkdayInputsChange]);

  const recommendedNotes = useMemo(() => {
    const currentPack = config.packs.find((item) => item.id === pack);
    const larger = [...config.packs].sort((a, b) => b.rangeMod - a.rangeMod).find((item) => item.rangeMod > (currentPack?.rangeMod ?? 0));
    const bestOther = comparisons.find((row) => row.vehicle.id !== selectedId);
    const bits = [];
    if (assessment.rating === "good" && assessment.recommendedConfig) {
      bits.push(`${selectedYear} ${selectedVehicle.make} ${selectedVehicle.model} with ${assessment.recommendedConfig} is a solid match for this day.`);
    } else if (assessment.flags.needsLargerPack && larger) {
      bits.push(`Stay with this truck only if you step up to ${larger.label} — the current pack leaves a thin reserve.`);
    } else if (assessment.recommendedConfig) {
      bits.push(`Current build: ${assessment.recommendedConfig}.`);
    }
    if (assessment.flags.needsOvernightCharging) {
      bits.push("Add home or shop Level 2 charging before counting on this truck for a full workweek.");
    }
    if (assessment.rating !== "good" && bestOther?.assessment.rating === "good") {
      bits.push(`The ${bestOther.vehicle.make} ${bestOther.vehicle.model} looks like a stronger match for this same day.`);
    } else if (assessment.rating === "not-a-fit" && bestOther) {
      bits.push(`Compare the ${bestOther.vehicle.make} ${bestOther.vehicle.model} (${bestOther.assessment.ratingLabel}) before deciding.`);
    }
    return bits.join(" ") || `${selectedVehicle.make} ${selectedVehicle.model} — keep the most efficient pack, motor, and wheels unless you need the extra capability.`;
  }, [assessment, comparisons, config.packs, pack, selectedVehicle, selectedId, selectedYear]);

  const economics = useMemo(() => {
    const result = operatingCosts({
      annualMiles,
      currentMpg,
      fuelPrice: dieselPrice,
      electricityRate,
      evKwhPer100Miles: selectedVehicle.kwhPer100Miles,
      evPrice,
      tradeIn,
      upfitPrice: bedUpfitPrice,
    });
    return { ...result, dieselAnnual: result.currentAnnual };
  }, [annualMiles, currentMpg, dieselPrice, electricityRate, evPrice, tradeIn, bedUpfitPrice, selectedVehicle]);

  return (
    <div className="max-w-2xl mx-auto">
      <ModeAndTradeSelector mode={mode} setMode={setMode} trade={trade} setTrade={setTrade} customTrade={customTrade} setCustomTrade={setCustomTrade} activity={activity} setActivity={setActivity} />

      <EyebrowBanner color={modeColor}>Build My {mode === "work" ? "Workday" : "Play Day"}</EyebrowBanner>
      <div className="flex gap-2 items-stretch mb-2">
        <select
          aria-label="Model year"
          data-testid="model-year"
          value={selectedYear}
          onChange={(e) => setYear(e.target.value)}
          style={{ fontFamily: "'Bebas Neue', sans-serif", borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}
          className="w-24 text-2xl md:text-3xl tracking-wide text-center border-2 focus:outline-none focus:border-[#0077B6]"
        >
          {yearOptions.map((optionYear) => (
            <option key={optionYear} value={String(optionYear)}>{optionYear}</option>
          ))}
        </select>
        <VehicleDropdown selectedId={selectedId} onSelect={handleVehicleChange} fitByVehicle={fitByVehicle} year={selectedYear} />
      </div>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide mb-3">
        Ranked by Capability Fit — tap to try a different truck against the same day
      </p>

      {/* Fuel/gas savings — monthly + annual only. Break-even stays out of this box. */}
      <div
        className="border p-4 mb-6 grid grid-cols-2 gap-4"
        style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}
      >
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">Rough monthly fuel / gas savings</div>
          <div data-testid="monthly-savings" style={{ fontFamily: "'JetBrains Mono', monospace", color: economics.monthlySavings > 0 ? OLIVE : RUST }} className="text-xl font-semibold mt-0.5">
            {economics.monthlySavings >= 0 ? "+" : "-"}${Math.abs(economics.monthlySavings).toLocaleString()}<span className="text-xs" style={{ color: MUTED }}> / mo</span>
          </div>
        </div>
        <div className="text-right">
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">Annual savings</div>
          <div data-testid="annual-savings" style={{ fontFamily: "'JetBrains Mono', monospace", color: economics.annualSavings > 0 ? OLIVE : RUST }} className="text-xl font-semibold mt-0.5">
            {economics.annualSavings >= 0 ? "+" : "-"}${Math.abs(economics.annualSavings).toLocaleString()}<span className="text-xs" style={{ color: MUTED }}> / yr</span>
          </div>
        </div>
      </div>

      <TruckVisual
        wheelLabel={(config.wheels.find((w) => w.id === wheel) || config.wheels[0]).label}
        modeColor={modeColor}
        vehicleLabel={`${selectedYear} ${selectedVehicle.make} ${selectedVehicle.model}`}
        vehicle={resolveVehiclePhoto(selectedVehicle, selectedYear)}
        year={selectedYear}
      />

      {/* Route inputs */}
      <div className="border p-4 mb-6" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[11px] uppercase tracking-wide">Your day</div>
          <RefreshResultsButton onClick={refreshResults} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MiniField label="Daily miles" value={dailyMiles} onChange={setDailyMiles} suffix="mi" />
          <MiniField label="Number of stops" value={stops} onChange={setStops} suffix="stops" />
          {isPlayDay ? (
            <MiniField label="Payload in truck" value={payloadWeight} onChange={setPayloadWeight} suffix="lb" max={selectedVehicle.payload + 1000} />
          ) : (
            <>
              <MiniField label="Trailer weight" value={trailerWeight} onChange={setTrailerWeight} suffix="lb" max={selectedVehicle.towing + 3000} />
              <MiniField label="Payload in truck" value={payloadWeight} onChange={setPayloadWeight} suffix="lb" max={selectedVehicle.payload + 1000} />
            </>
          )}
        </div>
        {isPlayDay ? (
          <div className="mt-4" data-testid="play-towable">
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide mb-2">Recreational towable</div>
            <div role="radiogroup" aria-label="Recreational towable" className="space-y-2">
              {PLAY_TOWABLE_OPTIONS.map((option) => (
                <label key={option.id} className="flex items-start gap-3 p-3 border cursor-pointer" style={{ borderColor: playTowableId === option.id ? TEAL : BORDER, backgroundColor: playTowableId === option.id ? "#D6F0FA" : PANEL }}>
                  <input
                    type="radio"
                    name="play-towable"
                    className="accent-[#0077B6] mt-0.5"
                    checked={playTowableId === option.id}
                    onChange={() => setPlayTowableId(option.id)}
                  />
                  <span className="min-w-0">
                    <span style={{ fontFamily: "'Oswald', sans-serif", color: playTowableId === option.id ? TEAL : PAPER }} className="block text-xs font-semibold uppercase leading-tight">{option.label}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="block text-[10px] mt-0.5 leading-relaxed">
                      {option.emptyWeightLbs > 0 ? `~${option.emptyWeightLbs.toLocaleString()} lb empty · feeds tow check` : "Nothing in tow"}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <ConfigGroup
              title="Overflow trailer"
              kind="overflow-trailer"
              options={OVERFLOW_TRAILER_OPTIONS}
              selected={overflowTrailerId}
              onSelect={setOverflowTrailerId}
              modKey="emptyWeightLbs"
              format={(lb) => (Number(lb) > 0 ? `~${Number(lb).toLocaleString()} lb empty` : "Keep cargo in the bed")}
            />
          </div>
        )}
        <p style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] mt-3">
          {isPlayDay
            ? `Payload is people and leftover cab/bed cargo. Selected towable empty weight (~${Math.round(playTowable.emptyWeightLbs).toLocaleString()} lb) feeds the live tow check. Selected play gear adds ~${Math.round(kitWeightLbs).toLocaleString()} lb estimated payload.`
            : assessment.overflow?.selected
              ? `Payload is people and leftover cargo. Selected kit/bed cargo (~${Math.round(assessment.overflow.movedCargoLbs).toLocaleString()} lb) is on the ${assessment.overflow.label} with its ~${Math.round(assessment.overflow.emptyWeightLbs).toLocaleString()} lb empty curb weight. Towing is checked against that total.`
              : `Payload is people and leftover cargo. Selected kit adds ~${Math.round(kitWeightLbs).toLocaleString()} lb estimated payload${kitTrailerLbs > 0 ? ` and ~${Math.round(kitTrailerLbs).toLocaleString()} lb trailer` : ""}. If the bed is over capacity, pick a trailer instead of auto-failing.`}
          {" "}Weights are modeled estimates reviewed September 2026.
        </p>
      </div>

      {isPlayDay ? (
        <div className="border p-4 mb-6" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }} data-testid="play-gear">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[11px] uppercase tracking-wide mb-1">Play Day gear</div>
              <p className="text-[#0F2A24] text-sm font-semibold leading-relaxed">Select the ones that apply.</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <ClearAllButton onClick={() => setPlayGearIds([])} disabled={!playGearIds.length} label="Clear all play gear selections" />
              <RefreshResultsButton onClick={refreshResults} />
            </div>
          </div>
          <p className="text-[#5A7D77] text-xs leading-relaxed mb-3">
            Gear list for {activity}. Bikes, kayaks, camping, ATV/SxS, ski/wake, and similar loadouts — not the workday trade kit. Each selected item adds weight and derates range in real time. Weights are modeled estimates reviewed September 2026.
          </p>
          <KitMultiSelect
            tradeName={activity}
            groupLabel={activity}
            subtitle={`${activity} gear + extra cargo`}
            tradeItems={playGearOptions}
            miscItems={[]}
            selectedIds={playGearIds}
            onToggle={togglePlayGear}
          />
        </div>
      ) : (
      <div className="border p-4 mb-6" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }} data-testid="work-kit">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[11px] uppercase tracking-wide mb-1">Trade kit on the truck</div>
            <p className="text-[#0F2A24] text-sm font-semibold leading-relaxed">Select the ones that apply.</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <ClearAllButton onClick={() => setEquipmentIds([])} disabled={!equipmentIds.length} label="Clear all kit selections" />
            <RefreshResultsButton onClick={refreshResults} />
          </div>
        </div>
        <p className="text-[#5A7D77] text-xs leading-relaxed mb-3">
          This list belongs to {tradeProfile.categoryLabel}. Each selected item adds its weight and still derates range in real time — kit mass is a cargo derate, separate from charger watts. Weights are modeled estimates reviewed September 2026.
        </p>
        <KitMultiSelect
          tradeName={tradeProfile.categoryLabel}
          tradeItems={equipmentOptions}
          miscItems={MISC_PAYLOAD_OPTIONS}
          selectedIds={equipmentIds}
          onToggle={toggleEquipment}
        />
      </div>
      )}

      {isPlayDay ? null : showBedAccessories ? (
        <div className="border p-4 mb-6" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[11px] uppercase tracking-wide mb-1">Bed accessories</div>
              <p className="text-[#0F2A24] text-sm font-semibold leading-relaxed">Select all that apply.</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <ClearAllButton onClick={() => setBedAccessoryIds([])} disabled={!bedAccessoryIds.length} label="Clear all bed accessory selections" />
              <RefreshResultsButton onClick={refreshResults} />
            </div>
          </div>
          <p className="text-[#5A7D77] text-xs leading-relaxed mb-3">
            {mode === "work" ? "Working pickups" : "Weekend pickups"} often stack several upfits — drawers plus a cover plus a rack. Weight feeds the live cargo derate. Prices are list/street estimates folded into net upfront, not installed quotes. Soft and hard tonneaus replace each other. Budget path: 27-gal totes plus a cover.
          </p>
          <BedAccessoryMultiSelect
            items={BED_ACCESSORY_OPTIONS}
            selectedIds={bedAccessoryIds}
            onToggle={toggleBedAccessory}
          />
        </div>
      ) : (
        <div className="border p-4 mb-8" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[11px] uppercase tracking-wide mb-1">Bed accessories</div>
          <p className="text-[#5A7D77] text-xs leading-relaxed">
            Bed drawers, covers, racks, and toolbox options are for van-to-pickup field-service trades. This {trade} kit already has its own cargo story (route truck or trailer crew), so those upfits stay hidden.
          </p>
        </div>
      )}

      <div className="border p-4 mb-6" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[11px] uppercase tracking-wide">Home, shop, or daytime charging</div>
          <RefreshResultsButton onClick={refreshResults} />
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <a
            href={HOME_CHARGER_SHOP.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: "'JetBrains Mono', monospace", backgroundImage: `linear-gradient(90deg, ${TEAL} 0%, ${TEAL}CC 100%)`, color: "#FFFFFF" }}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide font-semibold px-3 min-h-10"
          >
            {HOME_CHARGER_SHOP.label} <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px]">{HOME_CHARGER_SHOP.helper}</span>
        </div>
        <div className="space-y-2">
          {CHARGING_OPTIONS.map((option) => (
            <label key={option.id} className="flex items-start gap-3 p-3 border cursor-pointer" style={{ borderColor: chargingId === option.id ? AMBER : BORDER, backgroundColor: chargingId === option.id ? "#D6F0FA" : PANEL }}>
              <input
                type="radio"
                name="charging-option"
                className="accent-[#0077B6] mt-0.5"
                checked={chargingId === option.id}
                onChange={() => {
                  setChargingId(option.id);
                  setStartCharge?.(Math.min(START_CHARGE_MAX, Math.max(START_CHARGE_MIN, option.startChargePct)));
                }}
              />
              <span className="min-w-0">
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="block text-[11px] uppercase tracking-wide leading-relaxed">{option.label}</span>
                {chargingId === option.id && option.id === "unknown" && (
                  <span className="block text-[#5A7D77] text-[11px] leading-relaxed mt-1">
                    Conservative {dayTitle} Fit: starts around {UNKNOWN_CHARGING_START_PCT}% and does not assume overnight or daytime charging. Directional only — not a modeled home or shop setup.
                  </span>
                )}
                {option.helper && chargingId === option.id && option.id !== "unknown" && (
                  <span className="block text-[#5A7D77] text-[11px] leading-relaxed mt-1">{option.helper}</span>
                )}
              </span>
            </label>
          ))}
        </div>
        {charging.isUnknown && (
          <p className="text-[#5A7D77] text-[11px] leading-relaxed mt-3">
            Unknown is a conservative placeholder for {dayTitle} Fit — mid start charge, no assumed overnight reliability. Do not read it as a precise charging plan.
          </p>
        )}
        <div className="mt-4 pt-3 border-t" style={{ borderColor: BORDER }}>
          <StartChargeControl
            value={startPct}
            onChange={(next) => setStartCharge?.(next)}
            min={START_CHARGE_MIN}
            max={START_CHARGE_MAX}
            hint="Same starting battery used on Map My Day and Find My Truck. Home charging still defaults to 100%; drop it if you leave with 80 or 90."
          />
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <RefreshResultsButton onClick={refreshResults} label="Refresh results" />
      </div>

      {/* Config layer */}
      <EyebrowBanner>Configuration</EyebrowBanner>
      <ConfigGroup title="Battery Pack" options={config.packs} selected={pack} onSelect={setPack} recommendedId={config.recommended.pack} modKey="rangeMod" format={(v) => `${v > 0 ? "+" : ""}${v} mi range`} kind="pack" />
      <ConfigGroup title="Motor" options={config.motors} selected={motor} onSelect={setMotor} recommendedId={config.recommended.motor} modKey="effMod" format={(v) => `${Math.round(v * 100)}% efficiency`} kind="motor" />
      <ConfigGroup title="Wheels" options={config.wheels} selected={wheel} onSelect={setWheel} recommendedId={config.recommended.wheel} modKey="effMod" format={(v) => `${Math.round(v * 100)}% efficiency`} kind="wheel" />

      {/* Range summary — towing + cargo/kit mass, live with toggles */}
      <div className="border px-2 py-1.5 mb-4" style={{ borderColor: BORDER, backgroundColor: "#D3F3E0" }}>
        <div className="flex items-end gap-2">
          <div className="flex-1 min-w-0">
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[8px] uppercase tracking-wide">Config range</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-base font-semibold leading-none">{Math.round(baseConfigRange)} mi</div>
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[8px] uppercase tracking-wide">Load penalty</div>
            <div data-testid="load-penalty" style={{ fontFamily: "'JetBrains Mono', monospace", color: RUST }} className="text-base font-semibold leading-none">-{Math.round((assessment.energy.combinedPenaltyPct || 0) * 100)}%</div>
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[8px] uppercase tracking-wide">Real-world range</div>
            <div data-testid="real-world-range" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#0F2A24" }} className="text-base font-semibold leading-none">{assessment.effectiveRange} mi</div>
          </div>
          <details className="relative flex-shrink-0">
            <summary
              aria-label="How load hits range"
              style={{ color: MUTED }}
              className="list-none cursor-pointer min-h-10 min-w-8 inline-flex items-center justify-center [&::-webkit-details-marker]:hidden"
            >
              <Info className="w-3.5 h-3.5" />
            </summary>
            <p className="text-[#5A7D77] text-[10px] leading-relaxed mt-1 max-w-prose">
              Tow −{Math.round((assessment.energy.towingPenaltyPct || 0) * 100)}% · cargo/kit −{Math.round((assessment.energy.cargoPenaltyPct || 0) * 100)}%.
              Trailer uses the steep highway curve; in-bed kit uses a milder ~12% derate at payload rating. Tool watt-hours are separate.
            </p>
          </details>
        </div>
      </div>

      <WorkdayFitResult
        assessment={assessment}
        economics={economics}
        vehicleId={selectedId}
        comparisons={comparisons}
        onSelectVehicle={handleVehicleChange}
        recommendedNotes={recommendedNotes}
        mode={mode}
        updatedFlash={updatedFlash}
      />

      {/* Current ICE truck identity + cost inputs */}
      <div className="border p-4 mb-6" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
        <h2 style={{ fontFamily: "'Oswald', sans-serif", color: PAPER }} className="text-3xl font-bold uppercase tracking-wide leading-none mb-2">My current truck</h2>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[11px] mb-3">The gas or diesel truck you have now.</p>
        <label className="block mb-3">
          <span className="sr-only">My current truck</span>
          <select
            aria-label="My current truck"
            value={currentTruckId}
            onChange={(e) => handleCurrentTruckChange(e.target.value)}
            style={{ fontFamily: "'Oswald', sans-serif", borderColor: AMBER, backgroundImage: PANEL_GRADIENT, color: PAPER }}
            className="w-full appearance-none border-2 text-sm font-semibold uppercase tracking-wide px-4 py-3"
          >
            {CURRENT_TRUCK_PRESETS.map((truck) => (
              <option key={truck.id} value={truck.id}>{truck.name}</option>
            ))}
          </select>
        </label>
        {currentTruckId === "other" && (
          <input
            aria-label="Type your current truck"
            placeholder="e.g. 2018 Ram 2500"
            value={customCurrentTruck}
            onChange={(e) => setCustomCurrentTruck(e.target.value)}
            style={{ fontFamily: "'Oswald', sans-serif", borderColor: AMBER, backgroundImage: PANEL_GRADIENT, color: PAPER }}
            className="w-full border-2 text-sm font-semibold uppercase tracking-wide px-4 py-3 mb-3"
          />
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-1">
          <MiniField label="Current MPG" value={currentMpg} onChange={setCurrentMpg} suffix="mpg" min={1} />
          <MiniField label="Diesel price" value={dieselPrice} onChange={setDieselPrice} suffix="$/gal" />
          <MiniField label="Electricity rate" value={electricityRate} onChange={setElectricityRate} suffix="$/kWh" />
          <MiniField label="Annual miles" value={annualMiles} onChange={setAnnualMiles} suffix="mi" />
          <MiniField label="Used EV price" value={evPrice} onChange={setEvPrice} suffix="$" />
          <MiniField label="Trade-in value" value={tradeIn} onChange={setTradeIn} suffix="$" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: BORDER }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">Current annual cost</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: RUST }} className="text-xl font-semibold mt-1">${economics.dieselAnnual.toLocaleString()}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[9px] mt-0.5">fuel + maintenance only</div>
          </div>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">EV annual cost</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: OLIVE }} className="text-xl font-semibold mt-1">${economics.evAnnual.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">Net upfront cost</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: PAPER }} className="text-xl font-semibold mt-1">${economics.netUpfront.toLocaleString()}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[9px] mt-0.5">
              {economics.upfitPrice > 0
                ? `includes ~$${economics.upfitPrice.toLocaleString()} bed upfit est.`
                : "truck price minus trade-in"}
            </div>
          </div>
        </div>
      </div>

      {/* Home charging economics + curated charger shortlist */}
      <div className="border p-6" style={{ borderColor: BORDER, backgroundColor: "#D3F3E0" }}>
        <div className="flex items-center gap-2 mb-3">
          <BatteryCharging className="w-4 h-4" style={{ color: TEAL }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: TEAL }} className="text-xs uppercase tracking-wide font-semibold">
            {homeCharging ? "Fully charged every morning — no separate errand" : "Add home or shop charging to unlock the full economic case"}
          </span>
        </div>
        <p className="text-[#5A7D77] text-xs leading-relaxed mb-4">
          A Level 2 charger installed at home or the shop means this truck starts every {mode === "work" ? "workday" : "play day"} at 100% — the same way you'd never think twice about a full tank. A few reputable options, not an exhaustive list:
        </p>
        <div className="space-y-2">
          {CHARGERS.map((c) => (
            <div key={c.brand} className="flex items-center justify-between border px-4 py-3" style={{ borderColor: BORDER }}>
              <div>
                <div style={{ fontFamily: "'Oswald', sans-serif" }} className="text-sm font-semibold uppercase">{c.brand} <span className="text-[#5A7D77] font-normal normal-case">{c.model}</span></div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px]">{c.amps} · {c.note}</div>
              </div>
              <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: TEAL }} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <RefreshResultsButton onClick={refreshResults} label="Refresh results" />
      </div>

      <PriceRibbon variant="truck" />

      {/* Final step — after workday/play-day inputs, a search-style card (not a top-nav pill) */}
      <FindMyTruckCta onClick={goToMatching} subtitle={`See What Fits This ${dayTitle}`} />
    </div>
  );
}
