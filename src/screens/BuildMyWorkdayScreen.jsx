import { useEffect, useMemo, useRef, useState } from "react";
import { BatteryCharging, ExternalLink, Info } from "lucide-react";
import { trackSeeResult } from "../analytics";
import {
  applySelectedVehicleFit,
  COLD_CLIMATE_WEATHER_DERATE,
  COMPARE_ANNUAL_MILES,
  compareOwnership,
  compareWorkdayVehicles,
  configRange,
  evTimeSavedHours,
  evUpgradeScore,
  FL_AAA_GAS_PER_GAL,
  FUELLY_F150_MPG,
  HOME_KWH_RATE,
  NO_CHARGE_STRETCH_START_DEDUCTION_PCT,
  operatingCosts,
  vehicleFitMap,
  workdayAssessment,
} from "../calculations";
import {
  CHARGERS,
  CHARGING_OPTIONS,
  CURRENT_TRUCK_PRESETS,
  DEFAULT_LADDER_LOADOUT_ID,
  HOME_CHARGER_SHOP,
  OEM_DAILY_CHARGE_GUIDANCE,
  UNKNOWN_CHARGING_START_PCT,
  recommendedDepartureSocPct,
  resolveStartChargePct,
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
  attributePlayGearLoad,
  playGearItemsFromIds,
  playGearOptionsForActivity,
  playTowableById,
  toggleBedAccessoryId,
  applyLadderLoadout,
  inferLadderLoadoutId,
  resolveTradeProfile,
  resolveVehiclePhoto,
  tradeShowsLadderLoadout,
  selectableEquipmentForTrade,
  tradeShowsBedAccessories,
  vehicleYearOptions,
} from "../data";
import {
  AMBER, BORDER, MUTED, OLIVE, PANEL, PANEL_GRADIENT, PAPER, RUST, TEAL,
} from "../theme";
import { FindMyElectricTruck } from "../components/FindMyElectricTruck";
import { MoreOptions, StepFlow } from "../components/StepFlow";
import { WorkdayTradeStep } from "../components/WorkdayTradeStep";
import { FleetFitSisterCard } from "../components/FleetFitSisterCard";
import { PriceRibbon } from "../components/PriceRibbon";
import { TruckVisual } from "../components/TruckVisual";
import { WorkdayFitResult } from "../components/WorkdayFitResult";
import { BedAccessoryMultiSelect, KitMultiSelect } from "../components/KitMultiSelect";
import { FindMyTruckCta } from "../components/FindMyTruckCta";
import { ClearAllButton, EyebrowBanner, MiniField, RefreshResultsButton, StartChargeControl } from "../components/ui";
import { ConfigGroup, VehicleDropdown } from "../components/vehicleConfig";
import { PlayDayInterior } from "../components/PlayDayInterior";
import {
  DEFAULT_PLAY_CATEGORY_ID,
  DEFAULT_PLAY_SETUP_ID,
  defaultPlayDaySetup,
  defaultWeightClassId,
  playDayCategoryById,
  playDaySetup,
  playPeoplePayloadLbs,
  setupUsesWeightClassLadder,
  weightClassTowable,
} from "../playDayCatalog";
import { overflowTrailerDragClass, playTowableDragClass, wattReachValidationLine } from "../data/wattreachTowing";
import { compareVehicleLabel, WorkdayCompareDash } from "../components/WorkdayCompareDash";
import { WattReachTowLink } from "../components/WattReachTowLink";

const WORK_STEPS = ["1 · Trade", "2 · Day", "3 · Carry", "4 · Charge", "Result"];
const PLAY_STEPS = ["1 · Activity", "2 · Tow", "3 · Distance", "Result"];

const EMPTY_IDS = [];

export function BuildMyWorkdayScreen({ mode, setMode, trade, setTrade, customTrade = "", setCustomTrade, activity, setActivity, goToMatching, setScreen, dailyMiles, setDailyMiles, dayStops, setDayStops, vehicleId, setVehicleId, vehicleYear, setVehicleYear, onVehicleFitsChange, onWorkdayInputsChange, startCharge = START_CHARGE_DEFAULT, setStartCharge, shopZip = "", setShopZip }) {
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
  const initialLadder = mode !== "recreation" && tradeShowsLadderLoadout(initialProfile.name, customTrade)
    ? applyLadderLoadout(initialDefaults.equipmentIds, [], DEFAULT_LADDER_LOADOUT_ID)
    : { equipmentIds: initialDefaults.equipmentIds, bedAccessoryIds: [] };
  const [chargingId, setChargingId] = useState("home");
  const [equipmentIds, setEquipmentIds] = useState(initialLadder.equipmentIds);
  const [bedAccessoryIds, setBedAccessoryIds] = useState(initialLadder.bedAccessoryIds);
  const [tankGal, setTankGal] = useState(CURRENT_TRUCK_PRESETS[0].tankGal || 26);
  const [playTowableId, setPlayTowableId] = useState(() => defaultPlayDaySetup().towableId);
  const [playGearIds, setPlayGearIds] = useState(() => [...defaultPlayDaySetup().gearIds]);
  const [playCategoryId, setPlayCategoryId] = useState(DEFAULT_PLAY_CATEGORY_ID);
  const [playSetupId, setPlaySetupId] = useState(DEFAULT_PLAY_SETUP_ID);
  const [playPeople, setPlayPeople] = useState(() => defaultPlayDaySetup().people);
  const [playLoadedTowLbs, setPlayLoadedTowLbs] = useState(() => defaultPlayDaySetup().loadedTowLbs);
  // Bed / cargo-rail options (bike racks, toolbox, liner, etc.) — the same
  // slide-rule list Work Day already uses, surfaced as its own Play Day
  // section instead of buried inside the long towable/trailer picker.
  const [playBedAccessoryIds, setPlayBedAccessoryIds] = useState([]);
  const [playWeightClassId, setPlayWeightClassId] = useState(() => defaultWeightClassId(defaultPlayDaySetup()));
  const [includeWorkday, setIncludeWorkday] = useState(false);
  // Multi-use day (Customize): Work+Play multi-day trip with a stretch of no
  // reliable charging between legs — folds into the existing charging inputs,
  // see NO_CHARGE_STRETCH_START_DEDUCTION_PCT.
  const [noChargeStretch, setNoChargeStretch] = useState(false);
  const [showPlayCustomize, setShowPlayCustomize] = useState(false);
  // Compact tap-to-open panel for the miles chip up in the typical-day
  // summary — replaces the old bottom-of-Customize "How far" section.
  const [showMilesEditor, setShowMilesEditor] = useState(false);
  const skipPlayActivityDefaults = useRef(false);
  // True only while Cold weather is ON because Snow & Mountain auto-applied it —
  // not because the user manually flipped the toggle. Lets us reverse the
  // auto-default when leaving snow without fighting a deliberate manual choice.
  const coldClimateAutoRef = useRef(false);
  const [currentTruckId, setCurrentTruckId] = useState(CURRENT_TRUCK_PRESETS[0].id);
  const [customCurrentTruck, setCustomCurrentTruck] = useState("");
  const [updatedFlash, setUpdatedFlash] = useState(false);
  const [step, setStep] = useState(0);

  const [currentMpg, setCurrentMpg] = useState(CURRENT_TRUCK_PRESETS[0].mpg || FUELLY_F150_MPG);
  const [fuelPrice, setFuelPrice] = useState(FL_AAA_GAS_PER_GAL);
  const [electricityRate, setElectricityRate] = useState(HOME_KWH_RATE);
  const [annualMiles, setAnnualMiles] = useState(COMPARE_ANNUAL_MILES);
  const [coldClimate, setColdClimate] = useState(false);
  const [showIceCustomize, setShowIceCustomize] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
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
  // No-charge stretch (multi-day trip with no reliable charging between
  // legs) is a shared Work Day + Play Day toggle — see NO_CHARGE_STRETCH_START_DEDUCTION_PCT.
  const displayHomeCharging = noChargeStretch ? false : homeCharging;
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
    setOverflowTrailerId("none");
    if (mode !== "recreation" && tradeShowsLadderLoadout(tradeProfile.name, customTrade)) {
      const next = applyLadderLoadout(defaults.equipmentIds, [], DEFAULT_LADDER_LOADOUT_ID);
      setEquipmentIds(next.equipmentIds);
      setBedAccessoryIds(next.bedAccessoryIds);
    } else {
      setEquipmentIds(defaults.equipmentIds);
      setBedAccessoryIds([]);
    }
  }, [tradeProfile.kitKey, setDailyMiles, setStops, mode, customTrade, tradeProfile.name]);

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

  const applyPlaySetup = (setup) => {
    skipPlayActivityDefaults.current = true;
    setActivity(setup.activity);
    setPlayGearIds(setup.gearIds?.length ? [...setup.gearIds] : defaultPlayGearIds(setup.activity));
    setDailyMiles(setup.dailyMiles);
    setPlayPeople(setup.people);
    setPayloadWeight(playPeoplePayloadLbs(setup.people));
    setChargingId(setup.chargingId || "home");
    if (setupUsesWeightClassLadder(setup)) {
      const classId = defaultWeightClassId(setup);
      setPlayWeightClassId(classId);
      const towable = weightClassTowable(classId);
      setPlayTowableId(classId);
      setPlayLoadedTowLbs(towable.emptyWeightLbs > 0 ? towable.emptyWeightLbs : 0);
    } else {
      setPlayWeightClassId(null);
      setPlayTowableId(setup.towableId);
      setPlayLoadedTowLbs(setup.loadedTowLbs > 0 ? setup.loadedTowLbs : 0);
    }
  };

  const handlePlayWeightClass = (id) => {
    const towable = weightClassTowable(id);
    setPlayWeightClassId(id);
    setPlayTowableId(id);
    setPlayLoadedTowLbs(towable.emptyWeightLbs > 0 ? towable.emptyWeightLbs : 0);
  };

  const handlePlayPeople = (nextPeople) => {
    setPlayPeople(nextPeople);
    setPayloadWeight(playPeoplePayloadLbs(nextPeople));
  };

  const handlePlayChargingInline = (id) => {
    setChargingId(id);
    const preset = chargingOption(id);
    setStartCharge?.(Math.min(START_CHARGE_MAX, Math.max(START_CHARGE_MIN, resolveStartChargePct(preset, selectedId))));
  };

  useEffect(() => {
    if (skipPlayActivityDefaults.current) {
      skipPlayActivityDefaults.current = false;
      return;
    }
    setPlayTowableId(defaultPlayTowableId(activity));
    setPlayGearIds(defaultPlayGearIds(activity));
  }, [activity]);

  useEffect(() => {
    setStep(0);
    setShowIceCustomize(false);
    setShowTrailer(false);
    setShowMilesEditor(false);
    if (mode === "recreation") {
      setPlayCategoryId(DEFAULT_PLAY_CATEGORY_ID);
      setPlaySetupId(DEFAULT_PLAY_SETUP_ID);
      applyPlaySetup(defaultPlayDaySetup());
      setIncludeWorkday(false);
      setNoChargeStretch(false);
      setPlayBedAccessoryIds([]);
      if (coldClimateAutoRef.current) {
        coldClimateAutoRef.current = false;
        setColdClimate(false);
      }
    }
  }, [mode]);

  const toggleEquipment = (id) => {
    setEquipmentIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };
  const togglePlayGear = (id) => {
    setPlayGearIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };
  const toggleBedAccessory = (id) => {
    setBedAccessoryIds((current) => toggleBedAccessoryId(current, id));
  };
  const togglePlayBedAccessory = (id) => {
    setPlayBedAccessoryIds((current) => toggleBedAccessoryId(current, id));
  };
  const handleCurrentTruckChange = (id) => {
    setCurrentTruckId(id);
    const preset = CURRENT_TRUCK_PRESETS.find((item) => item.id === id);
    if (preset?.mpg) setCurrentMpg(preset.mpg);
    if (preset?.tankGal) setTankGal(preset.tankGal);
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
  const activePlayCategory = playDayCategoryById(playCategoryId);
  const activePlaySetup = playDaySetup(playCategoryId, playSetupId);
  const showBedAccessories = !isPlayDay && tradeShowsBedAccessories(tradeProfile.name);
  const selectedBedIds = showBedAccessories ? bedAccessoryIds : EMPTY_IDS;
  const bedUpfitPrice = isPlayDay ? bedAccessoriesPriceUsd(playBedAccessoryIds) : bedAccessoriesPriceUsd(selectedBedIds);
  // Base trailer/tow figure BEFORE stacked gear — computed here (ahead of
  // equipmentItems) because Play Day gear attribution below needs to know
  // whether anything is actually being towed.
  const activeTrailerWeight = isPlayDay
    ? (playLoadedTowLbs > 0 ? playLoadedTowLbs : playTowable.emptyWeightLbs)
    : trailerWeight;
  const equipmentItems = useMemo(() => {
    if (isPlayDay) {
      // Ted miss-dump fix: gear that rides ON/IN a towed camper/boat/trailer
      // (see playGearRidesOnTrailer) must stack onto the live tow weight,
      // not disappear or get miscounted as truck-bed payload. Bed / cargo-
      // rail accessories always stay truck-bed payload regardless.
      const rawGearItems = playGearItemsFromIds(playGearIds, activity);
      const gearItems = attributePlayGearLoad(rawGearItems, activity, { towingSomething: activeTrailerWeight > 0 });
      const playItems = [...gearItems, ...bedAccessoryItemsFromIds(playBedAccessoryIds)];
      if (!includeWorkday) return playItems;
      return [...playItems, ...equipmentItemsFromIds(equipmentIds, selectableEquipment)];
    }
    const kitItems = equipmentItemsFromIds(equipmentIds, selectableEquipment);
    return [...kitItems, ...bedAccessoryItemsFromIds(selectedBedIds)];
  }, [isPlayDay, playGearIds, activity, activeTrailerWeight, playBedAccessoryIds, includeWorkday, equipmentIds, selectableEquipment, selectedBedIds]);
  const kitWeightLbs = equipmentItems.reduce((sum, item) => sum + (Number(item.weightLbs) || 0), 0);
  const kitTrailerLbs = equipmentItems.reduce((sum, item) => sum + (Number(item.trailerWeightLbs) || 0), 0);
  const selectedTradeScore = tradeProfile.hasConvertibilityScore === false ? null : (tradeProfile.score ?? 75);
  const categoryLabel = mode === "work" ? tradeProfile.categoryLabel : activity;
  // What Play Day's summary/chip actually displays as "loaded tow" — the
  // base trailer/camper figure PLUS whatever stacked gear attributed to it
  // above. allocateWorkdayLoad() adds the same kitTrailerLbs on top of
  // activeTrailerWeight again internally, so this is display-only; it does
  // not double-count in the live calculators.
  const displayedTowLbs = isPlayDay ? activeTrailerWeight + kitTrailerLbs : activeTrailerWeight;
  const playAssessmentMiles = isPlayDay && includeWorkday
    ? Number(dailyMiles || 0) + Number(tradeProfile.defaults?.dailyMiles || 0)
    : dailyMiles;
  // No-charge stretch: a multi-day trip with no reliable charging between
  // legs starts short of a full pack and can't count on overnight/daytime
  // charging for this leg. Shared Work Day + Play Day toggle — feeds the
  // same `charging` shape workdayAssessment already reads — see
  // NO_CHARGE_STRETCH_START_DEDUCTION_PCT for the placeholder derate.
  const effectiveCharging = useMemo(() => (
    noChargeStretch
      ? {
        ...charging,
        startChargePct: Math.max(0, charging.startChargePct - NO_CHARGE_STRETCH_START_DEDUCTION_PCT),
        hasOvernight: false,
        hasDaytime: false,
        isMultiDayNoCharge: true,
      }
      : charging
  ), [noChargeStretch, charging]);
  const activeOverflowId = isPlayDay ? "none" : overflowTrailerId;
  const trailerDragClass = isPlayDay
    ? playTowableDragClass(playTowable)
    : overflowTrailerDragClass(OVERFLOW_TRAILER_OPTIONS.find((item) => item.id === overflowTrailerId));

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
    dailyMiles: isPlayDay ? playAssessmentMiles : dailyMiles,
    stops,
    trailerWeight: activeTrailerWeight,
    payloadWeight,
    charging: effectiveCharging,
    equipmentItems,
    overflowTrailerId: activeOverflowId,
    trailerDragClass,
    categoryScore: mode === "work" ? selectedTradeScore : 80,
    categoryLabel,
    tradeId: mode === "work" ? tradeProfile.kitKey : null,
    weatherDeratePct: coldClimate ? COLD_CLIMATE_WEATHER_DERATE : 0,
  }), [isPlayDay, playAssessmentMiles, dailyMiles, stops, activeTrailerWeight, payloadWeight, effectiveCharging, equipmentItems, activeOverflowId, trailerDragClass, mode, selectedTradeScore, categoryLabel, tradeProfile.kitKey, coldClimate]);

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

  // Live efficiency for the savings math — the vehicle's rated kWh/100mi
  // adjusted by the SAME towing/cargo/drag penalties and cold-weather derate
  // already computed for this exact day (assessment.energy). This is what
  // makes "annual savings" respond to trailers, camping loads, accessories,
  // bed upfits, and Cold weather, not just a flat per-vehicle spec.
  const effectiveKwhPer100Miles = assessment.energy.kwhPerMile * 100;

  const economics = useMemo(() => {
    const result = operatingCosts({
      annualMiles,
      currentMpg,
      fuelPrice,
      electricityRate,
      evKwhPer100Miles: effectiveKwhPer100Miles,
      evPrice,
      tradeIn,
      upfitPrice: bedUpfitPrice,
    });
    return { ...result, currentFuelAnnual: result.currentAnnual };
  }, [annualMiles, currentMpg, fuelPrice, electricityRate, evPrice, tradeIn, bedUpfitPrice, effectiveKwhPer100Miles]);

  const compareEcon = useMemo(() => compareOwnership({
    annualMiles,
    mpg: currentMpg,
    gasPerGal: fuelPrice,
    kwhPer100Miles: effectiveKwhPer100Miles,
    kwhRate: electricityRate,
  }), [annualMiles, currentMpg, fuelPrice, electricityRate, effectiveKwhPer100Miles]);

  const showLadder = !isPlayDay && tradeShowsLadderLoadout(tradeProfile.name, customTrade);
  const ladderLoadoutId = inferLadderLoadoutId(equipmentIds, bedAccessoryIds);
  const handleLadderLoadout = (loadoutId) => {
    const next = applyLadderLoadout(equipmentIds, bedAccessoryIds, loadoutId);
    setEquipmentIds(next.equipmentIds);
    setBedAccessoryIds(next.bedAccessoryIds);
  };
  const iceTruckName = CURRENT_TRUCK_PRESETS.find((item) => item.id === currentTruckId)?.name || "F-150";

  // Single "EV Upgrade Score" (Ted product change, Sep 2026) — replaces the
  // old ICE-score / EV-capabilityFit dial pair. The current (ICE) truck no
  // longer gets a score at all, just its plain annual $ cost above. Time
  // savings (fewer gas stops / oil changes / shop visits) are ICE-side
  // inputs only, so they're the same for every EV candidate; only the
  // ownership/savings component moves when you swap EV trucks. See
  // evUpgradeScore() in calculations.js for the full weighted blend and its
  // documented, retunable constants.
  const evTimeSaved = useMemo(
    () => evTimeSavedHours({ annualMiles, currentMpg, tankGal }),
    [annualMiles, currentMpg, tankGal],
  );
  const evUpgrade = useMemo(() => evUpgradeScore({
    annualSavings: compareEcon.annualSavings,
    timeSavedHours: evTimeSaved.totalHours,
    rating: assessment.rating,
  }), [compareEcon.annualSavings, evTimeSaved.totalHours, assessment.rating]);
  const nextTrucks = useMemo(() => {
    const others = comparisons.filter((row) => row.vehicle.id !== selectedId);
    const preferredIds = selectedId === "lightning" ? ["cybertruck", "r1t"] : others.slice(0, 2).map((row) => row.vehicle.id);
    const picked = preferredIds
      .map((id) => others.find((row) => row.vehicle.id === id))
      .filter(Boolean);
    const filled = picked.length >= 2 ? picked : [...picked, ...others.filter((row) => !picked.includes(row))].slice(0, 2);
    return filled.map((row) => {
      const rowKwhPer100 = row.assessment.energy.kwhPerMile * 100;
      const rowSavings = compareOwnership({
        annualMiles,
        mpg: currentMpg,
        gasPerGal: fuelPrice,
        kwhPer100Miles: rowKwhPer100,
        kwhRate: electricityRate,
      }).annualSavings;
      const rowUpgrade = evUpgradeScore({
        annualSavings: rowSavings,
        timeSavedHours: evTimeSaved.totalHours,
        rating: row.assessment.rating,
      });
      return {
        vehicle: row.vehicle,
        score: rowUpgrade.score,
        label: compareVehicleLabel(row.vehicle, { packId: VEHICLE_CONFIGS[row.vehicle.id]?.recommended?.pack }),
      };
    });
  }, [comparisons, selectedId, annualMiles, currentMpg, fuelPrice, electricityRate, evTimeSaved.totalHours]);


  const handlePlayCategory = (id) => {
    const next = playDayCategoryById(id);
    setPlayCategoryId(next.id);
    setPlaySetupId(next.setups[0].id);
    applyPlaySetup(next.setups[0]);
    // Snow & Mountain is a cold-weather category — auto-apply the same Cold
    // weather derate (COLD_CLIMATE_WEATHER_DERATE) the manual toggle already
    // wires everywhere, no second tap needed. Leaving snow reverses it, but
    // only if the user never manually touched the toggle while in snow —
    // see handleColdClimateChange / coldClimateAutoRef.
    if (next.id === "snow") {
      coldClimateAutoRef.current = true;
      setColdClimate(true);
    } else if (coldClimateAutoRef.current) {
      coldClimateAutoRef.current = false;
      setColdClimate(false);
    }
  };
  const handlePlaySetup = (id) => {
    const next = playDaySetup(playCategoryId, id);
    setPlaySetupId(next.id);
    applyPlaySetup(next);
  };
  const handleColdClimateChange = (value) => {
    // Any direct tap on the toggle is a deliberate manual choice — stop
    // treating the current state as an auto-default so leaving Snow &
    // Mountain later won't override what the user just picked.
    coldClimateAutoRef.current = false;
    setColdClimate(value);
  };

  const labels = isPlayDay ? PLAY_STEPS : WORK_STEPS;
  const workLanding = !isPlayDay;
  const playLanding = isPlayDay;
  // Workday's locked second page (trade cards) gates the Result dash — the user
  // must pass through it (via "Customize") before the compare dash appears.
  const workTradeStepActive = !isPlayDay && step < 4;
  const show = (index) => {
    if (workLanding) return index === 4 ? undefined : "hidden";
    return step === index ? undefined : "hidden";
  };

  const advancedControls = (
    <MoreOptions>
      <div className="flex gap-2 items-stretch mb-3">
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
      <EyebrowBanner>Configuration</EyebrowBanner>
      <ConfigGroup title="Battery Pack" options={config.packs} selected={pack} onSelect={setPack} recommendedId={config.recommended.pack} modKey="rangeMod" format={(v) => `${v > 0 ? "+" : ""}${v} mi range`} kind="pack" />
      <ConfigGroup title="Motor" options={config.motors} selected={motor} onSelect={setMotor} recommendedId={config.recommended.motor} modKey="effMod" format={(v) => `${Math.round(v * 100)}% efficiency`} kind="motor" />
      <ConfigGroup title="Wheels" options={config.wheels} selected={wheel} onSelect={setWheel} recommendedId={config.recommended.wheel} modKey="effMod" format={(v) => `${Math.round(v * 100)}% efficiency`} kind="wheel" />
    </MoreOptions>
  );

  const playCustomize = (
    <>
      <div className="border p-4 mb-6" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }} data-testid="play-charging-customize">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[11px] uppercase tracking-wide mb-1">Home, shop, or daytime charging</div>
            <p className="text-[#0F2A24] text-sm font-semibold leading-relaxed">Same charging options as Build My Workday — pick how this truck tops off, then dial in the exact Start %.</p>
          </div>
          <RefreshResultsButton onClick={refreshResults} />
        </div>
        <div className="space-y-2 mb-4">
          {CHARGING_OPTIONS.map((option) => (
            <label key={option.id} className="flex items-start gap-3 p-3 border cursor-pointer" style={{ borderColor: chargingId === option.id ? AMBER : BORDER, backgroundColor: chargingId === option.id ? "#D6F0FA" : PANEL }}>
              <input
                type="radio"
                name="play-charging-option"
                className="accent-[#0077B6] mt-0.5"
                checked={chargingId === option.id}
                onChange={() => {
                  setChargingId(option.id);
                  setStartCharge?.(Math.min(START_CHARGE_MAX, Math.max(START_CHARGE_MIN, resolveStartChargePct(option, selectedId))));
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
        <div className="pt-3 border-t" style={{ borderColor: BORDER }}>
          <StartChargeControl
            value={startPct}
            onChange={(next) => setStartCharge?.(next)}
            min={START_CHARGE_MIN}
            max={START_CHARGE_MAX}
            hint={`Same starting battery used on Map My Day and Find My Truck. Defaults to ${selectedVehicle.make} ${selectedVehicle.model}'s recommended daily charge (${recommendedDepartureSocPct(selectedId)}%), not always 100% — adjust it if you leave fuller or emptier.`}
          />
        </div>
      </div>
      <div className="border p-4 mb-6" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }} data-testid="play-bed-accessories">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[11px] uppercase tracking-wide mb-1">Bed / cargo-rail options</div>
            <p className="text-[#0F2A24] text-sm font-semibold leading-relaxed">Bed-mounted or cargo-rail-mounted bikes and gear — toggle any combination on.</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <ClearAllButton onClick={() => setPlayBedAccessoryIds([])} disabled={!playBedAccessoryIds.length} label="Clear all bed / cargo-rail selections" />
            <RefreshResultsButton onClick={refreshResults} />
          </div>
        </div>
        <p className="text-[#5A7D77] text-xs leading-relaxed mb-3">
          Same bed-accessory list used elsewhere on Fit My Truck — a bed-mount rack and a cargo-rail mount stack with a toolbox, liner, or either tonneau (pick this or a cover, not both). Each selected item adds weight and derates range/savings live, same as everything else here.
        </p>
        <BedAccessoryMultiSelect
          items={BED_ACCESSORY_OPTIONS}
          selectedIds={playBedAccessoryIds}
          onToggle={togglePlayBedAccessory}
        />
      </div>
      <div className="border p-4 mb-6" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
        <div className="mt-1" data-testid="play-towable">
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide mb-2">Recreational towable</div>
          <div role="radiogroup" aria-label="Recreational towable" className="space-y-2">
            {PLAY_TOWABLE_OPTIONS.map((option) => (
              <label key={option.id} className="flex items-start gap-3 p-3 border cursor-pointer" style={{ borderColor: playTowableId === option.id ? TEAL : BORDER, backgroundColor: playTowableId === option.id ? "#D6F0FA" : PANEL }}>
                <input
                  type="radio"
                  name="play-towable"
                  className="accent-[#0077B6] mt-0.5"
                  checked={playTowableId === option.id}
                  onChange={() => {
                    setPlayTowableId(option.id);
                    setPlayLoadedTowLbs(option.emptyWeightLbs);
                  }}
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
        <WattReachTowLink variant="validate" placement="playday-customize-towable" />
      </div>
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
    </>
  );

  // Ted's ask: the miles figure lives up in the typical-day summary as a
  // tappable chip (play-miles-editable), not a lone section at the bottom.
  // This is that chip's compact popover — same "Daily miles" / "Payload"
  // fields as before, just relocated and reused for the tap-to-open panel.
  const playMilesEditor = (
    <div className="border p-4" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }} data-testid="play-miles-fields">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MiniField label="Daily miles" value={dailyMiles} onChange={setDailyMiles} suffix="mi" />
        <MiniField label="Payload in truck" value={payloadWeight} onChange={setPayloadWeight} suffix="lb" max={selectedVehicle.payload + 1000} />
      </div>
    </div>
  );

  // Work Day parity (Ted miss-dump fix 7): the same tap-to-open miles/payload
  // chip Play Day has, bound to the same dailyMiles/payloadWeight state Work
  // Day's "Your day" outfit section already edits.
  const workMilesEditor = (
    <div className="border p-4" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }} data-testid="compare-miles-fields">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MiniField label="Daily miles" value={dailyMiles} onChange={setDailyMiles} suffix="mi" />
        <MiniField label="Payload in truck" value={payloadWeight} onChange={setPayloadWeight} suffix="lb" max={selectedVehicle.payload + 1000} />
      </div>
    </div>
  );

  return (
    <div className={!isPlayDay ? "max-w-6xl mx-auto" : "max-w-4xl mx-auto"}>
      <StepFlow
        labels={labels}
        current={step}
        onChange={setStep}
        onBack={() => setStep((current) => Math.max(0, current - 1))}
        onNext={() => setStep((current) => Math.min(labels.length - 1, current + 1))}
        hideNav={workLanding || playLanding}
      >
        {isPlayDay ? (
          <PlayDayInterior
            categoryId={playCategoryId}
            setupId={playSetupId}
            onSelectCategory={handlePlayCategory}
            onSelectSetup={handlePlaySetup}
            weightClassId={playWeightClassId}
            onSelectWeightClass={handlePlayWeightClass}
            people={playPeople}
            onPeopleChange={handlePlayPeople}
            miles={dailyMiles}
            milesEditorOpen={showMilesEditor}
            onToggleMilesEditor={() => setShowMilesEditor((open) => !open)}
            milesEditor={playMilesEditor}
            loadedTowLbs={displayedTowLbs}
            homeCharging={displayHomeCharging}
            chargingId={chargingId}
            chargingOptions={CHARGING_OPTIONS}
            onChargingChange={handlePlayChargingInline}
            includeWorkday={includeWorkday}
            onIncludeWorkday={setIncludeWorkday}
            includeWorkdayHint={`Work + Play multi-day — adds ${tradeProfile.categoryLabel}'s ${Math.round(tradeProfile.defaults?.dailyMiles || 0)} mi onto today's route and energy use.`}
            noChargeStretch={noChargeStretch}
            onNoChargeStretch={setNoChargeStretch}
            noChargeStretchHint={`Multi-day trip with no reliable charging between legs — starts this leg about ${NO_CHARGE_STRETCH_START_DEDUCTION_PCT} points short of a full pack and does not assume overnight or daytime charging.`}
            coldClimate={coldClimate}
            onColdClimate={handleColdClimateChange}
            customizeOpen={showPlayCustomize}
            onToggleCustomize={() => setShowPlayCustomize((open) => !open)}
            customize={playCustomize}
          />
        ) : null}

        {!isPlayDay && workTradeStepActive && (
          <div className="max-w-2xl mx-auto">
            <WorkdayTradeStep
              setTrade={setTrade}
              setCustomTrade={setCustomTrade}
              onContinue={() => setStep(4)}
            />
          </div>
        )}

        <div className={isPlayDay ? undefined : (workTradeStepActive ? "hidden" : show(4))}>
          {!isPlayDay && (
            <WorkdayCompareDash
              currentTruckId={currentTruckId}
              onCurrentTruckChange={handleCurrentTruckChange}
              customCurrentTruck={customCurrentTruck}
              onCustomCurrentTruck={setCustomCurrentTruck}
              iceAnnual={compareEcon.iceAnnual}
              gasPerGal={fuelPrice}
              onGasPerGal={setFuelPrice}
              currentMpg={currentMpg}
              onCurrentMpg={setCurrentMpg}
              showCustomize={showIceCustomize}
              onToggleCustomize={() => setShowIceCustomize((open) => !open)}
              iceTruckName={iceTruckName}
              trade={trade}
              onTrade={setTrade}
              customTrade={customTrade}
              onCustomTrade={setCustomTrade}
              vehicle={selectedVehicle}
              vehicleYear={selectedYear}
              packId={pack}
              onSelectVehicle={handleVehicleChange}
              evScore={evUpgrade.score}
              annualSavings={compareEcon.annualSavings}
              monthlySavings={compareEcon.monthlySavings}
              nextTrucks={nextTrucks}
              onOtherTrucks={goToMatching}
              showTrailer={showTrailer}
              onAddTrailer={() => setShowTrailer((open) => !open)}
              outfit={(
                <>
                  <div className="border p-4 mb-6" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[11px] uppercase tracking-wide">Your day</div>
                      <RefreshResultsButton onClick={refreshResults} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <MiniField label="Daily miles" value={dailyMiles} onChange={setDailyMiles} suffix="mi" />
                      <MiniField label="Number of stops" value={stops} onChange={setStops} suffix="stops" />
                    </div>
                  </div>
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
                              setStartCharge?.(Math.min(START_CHARGE_MAX, Math.max(START_CHARGE_MIN, resolveStartChargePct(option, selectedId))));
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
                        hint={`Same starting battery used on Map My Day and Find My Truck. Defaults to ${selectedVehicle.make} ${selectedVehicle.model}'s recommended daily charge (${recommendedDepartureSocPct(selectedId)}%), not always 100% — adjust it if you leave fuller or emptier.`}
                      />
                    </div>
                  </div>
                  {showBedAccessories ? (
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
                        Working pickups often stack several upfits — drawers plus a cover plus a rack. Weight feeds the live cargo derate. Prices are list/street estimates folded into net upfront, not installed quotes. Soft and hard tonneaus replace each other. Budget path: 27-gal totes plus a cover.
                      </p>
                      <BedAccessoryMultiSelect
                        items={BED_ACCESSORY_OPTIONS}
                        selectedIds={bedAccessoryIds}
                        onToggle={toggleBedAccessory}
                      />
                    </div>
                  ) : (
                    <div className="border p-4 mb-6" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[11px] uppercase tracking-wide mb-1">Bed accessories</div>
                      <p className="text-[#5A7D77] text-xs leading-relaxed">
                        Bed drawers, covers, racks, and toolbox options are for van-to-pickup field-service trades. This {trade} kit already has its own cargo story (route truck or trailer crew), so those upfits stay hidden.
                      </p>
                    </div>
                  )}
                </>
              )}
              trailer={(
                <>
                  <div className="border p-4 mb-6" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <MiniField label="Trailer weight" value={trailerWeight} onChange={setTrailerWeight} suffix="lb" max={selectedVehicle.towing + 3000} />
                      <MiniField label="Payload in truck" value={payloadWeight} onChange={setPayloadWeight} suffix="lb" max={selectedVehicle.payload + 1000} />
                    </div>
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
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] mt-3">
                      {assessment.overflow?.selected
                        ? `Payload is people and leftover cargo. Selected kit/bed cargo (~${Math.round(assessment.overflow.movedCargoLbs).toLocaleString()} lb) is on the ${assessment.overflow.label} with its ~${Math.round(assessment.overflow.emptyWeightLbs).toLocaleString()} lb empty curb weight. Towing is checked against that total.`
                        : `Payload is people and leftover cargo. Selected kit adds ~${Math.round(kitWeightLbs).toLocaleString()} lb estimated payload${kitTrailerLbs > 0 ? ` and ~${Math.round(kitTrailerLbs).toLocaleString()} lb trailer` : ""}. If the bed is over capacity, pick a trailer instead of auto-failing.`}
                      {" "}Weights are modeled estimates reviewed September 2026.
                    </p>
                    <WattReachTowLink variant="validate" placement="workday-trailer" flush />
                  </div>
                </>
              )}
              annualMiles={annualMiles}
              onAnnualMiles={setAnnualMiles}
              onMap={() => setScreen?.("map")}
              coldClimate={coldClimate}
              onColdClimate={handleColdClimateChange}
              noChargeStretch={noChargeStretch}
              onNoChargeStretch={setNoChargeStretch}
              dailyMiles={dailyMiles}
              milesEditorOpen={showMilesEditor}
              onToggleMilesEditor={() => setShowMilesEditor((open) => !open)}
              milesEditor={workMilesEditor}
              electricityRate={electricityRate}
              tankGal={tankGal}
              onTankGal={setTankGal}
              showLadder={showLadder}
              ladderLoadoutId={showLadder ? ladderLoadoutId : "none"}
              onLadderLoadout={handleLadderLoadout}
              overflowTrailerId={overflowTrailerId}
              onOverflowTrailer={setOverflowTrailerId}
              payloadWeight={payloadWeight}
              onPayloadWeight={setPayloadWeight}
              pack={pack}
              onPack={setPack}
              wheel={wheel}
              onWheel={setWheel}
              config={config}
              motor={motor}
            />
          )}

          {isPlayDay && (
            <>
              <div className="border p-4 mb-6" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }} data-testid="playday-result-savings">
                <div className="grid grid-cols-2 gap-4">
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
              </div>

              <p data-testid="playday-recommended-copy" className="text-[#5A7D77] text-xs leading-relaxed mb-3">
                Recommended for your {activePlayCategory.title.toLowerCase()} day ({activePlaySetup.label.toLowerCase()}): {selectedYear} {selectedVehicle.make} {selectedVehicle.model}{assessment.recommendedConfig ? ` outfitted with ${assessment.recommendedConfig}` : ""}. Swap the vehicle right on the photo below, or tap a truck in "Same play day, other trucks" further down — either way updates the photo and stats for this same day.
              </p>
              <TruckVisual
                wheelLabel={(config.wheels.find((w) => w.id === wheel) || config.wheels[0]).label}
                modeColor={modeColor}
                vehicle={resolveVehiclePhoto(selectedVehicle, selectedYear)}
                year={selectedYear}
                vehicleOptions={VEHICLE_OPTIONS}
                selectedVehicleId={selectedId}
                onSelectVehicle={handleVehicleChange}
                yearOptions={yearOptions}
                onSelectYear={setYear}
              />

              <div className="flex justify-center mb-6">
                <RefreshResultsButton onClick={refreshResults} label="Refresh results" />
              </div>
            </>
          )}

          <details className={isPlayDay ? "contents" : "workday-score-details mt-6"} data-testid="workday-score-details" open={isPlayDay || undefined}>
            {!isPlayDay && (
              <>
                <summary>How we scored this day</summary>
                <div className="flex justify-center mb-6">
                  <RefreshResultsButton onClick={refreshResults} label="Refresh results" />
                </div>
              </>
            )}
          <div className="border px-2 py-1.5 mb-4" style={{ borderColor: BORDER, backgroundColor: "#D3F3E0" }}>
            <div className="flex items-end gap-2">
              <div className="flex-1 min-w-0">
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[8px] uppercase tracking-wide">Config range</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-base font-semibold leading-none">{Math.round(baseConfigRange)} mi</div>
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[8px] uppercase tracking-wide">Load penalty</div>
                {/* totalRangePenaltyPct includes cold-climate/weather derate,
                    not just tow+cargo mass — must always reconcile with the
                    Real-world range mi figure next to it (Ted miss-dump: a
                    load penalty that ignores an active Cold weather toggle
                    reads as frozen even though the mi figure did move). */}
                <div data-testid="load-penalty" style={{ fontFamily: "'JetBrains Mono', monospace", color: RUST }} className="text-base font-semibold leading-none">-{Math.round((assessment.energy.totalRangePenaltyPct || 0) * 100)}%</div>
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
                  Tow −{Math.round((assessment.energy.towingPenaltyPct || 0) * 100)}% · cargo/kit −{Math.round((assessment.energy.cargoPenaltyPct || 0) * 100)}%
                  {assessment.energy.weatherDeratePct > 0 ? ` · cold weather −${Math.round(assessment.energy.weatherDeratePct * 100)}%` : ""}.
                  Trailer uses the steep highway curve plus a WattReach drag-class floor when the trailer shape is known; in-bed kit uses a milder ~12% derate at payload rating. Tool watt-hours are separate.
                </p>
              </details>
            </div>
            {isPlayDay && activeTrailerWeight > 0 && (
              <p data-testid="wattreach-range-check" className="text-[#5A7D77] text-[10px] leading-relaxed mt-1.5">
                {wattReachValidationLine()}
              </p>
            )}
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
              <MiniField label="Gas price" value={fuelPrice} onChange={setFuelPrice} suffix="$/gal" />
              <MiniField label="Electricity rate" value={electricityRate} onChange={setElectricityRate} suffix="$/kWh" />
              <MiniField label="Annual miles" value={annualMiles} onChange={setAnnualMiles} suffix="mi" />
              <MiniField label="Used EV price" value={evPrice} onChange={setEvPrice} suffix="$" />
              <MiniField label="Trade-in value" value={tradeIn} onChange={setTradeIn} suffix="$" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: BORDER }}>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">Current annual cost</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color: RUST }} className="text-xl font-semibold mt-1">${economics.currentFuelAnnual.toLocaleString()}</div>
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

          <div className="border p-6" style={{ borderColor: BORDER, backgroundColor: "#D3F3E0" }}>
            <div className="flex items-center gap-2 mb-3">
              <BatteryCharging className="w-4 h-4" style={{ color: TEAL }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: TEAL }} className="text-xs uppercase tracking-wide font-semibold">
                {displayHomeCharging ? "Fully charged every morning — no separate errand" : "Add home or shop charging to unlock the full economic case"}
              </span>
            </div>
            <p className="text-[#5A7D77] text-xs leading-relaxed mb-4">
              A Level 2 charger installed at home or the shop means this truck starts every {mode === "work" ? "workday" : "play day"} at its Start % below — {recommendedDepartureSocPct(selectedId)}% by default for {selectedVehicle.make} {selectedVehicle.model} ({OEM_DAILY_CHARGE_GUIDANCE[selectedId]?.note || "a sane daily-charge default"}), not always a full tank. A few reputable charger options, not an exhaustive list:
            </p>
            <div className="space-y-2">
              {CHARGERS.map((c) => (
                <a
                  key={c.brand}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between border px-4 py-3"
                  style={{ borderColor: BORDER }}
                >
                  <div>
                    <div style={{ fontFamily: "'Oswald', sans-serif" }} className="text-sm font-semibold uppercase">{c.brand} <span className="text-[#5A7D77] font-normal normal-case">{c.model}</span></div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px]">{c.amps} · {c.note}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: TEAL }} />
                </a>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <RefreshResultsButton onClick={refreshResults} label="Refresh results" />
          </div>

          <FindMyElectricTruck
            vehicle={selectedVehicle}
            year={selectedYear}
            zip={shopZip}
            onZipChange={setShopZip}
          />
          {/* Franz optional result-card CTA — quiet outbound only, not a home tile */}
          <FleetFitSisterCard tone="light" />
          <PriceRibbon />
          <FindMyTruckCta onClick={() => { trackSeeResult(isPlayDay ? "play" : "work"); goToMatching(); }} subtitle={`See What Fits This ${dayTitle}`} />
          </details>
        </div>
        {!workTradeStepActive && advancedControls}
      </StepFlow>
    </div>
  );
}
