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
