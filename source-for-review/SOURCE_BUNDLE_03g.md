    const coords = stopCoords(stop);
    return { ...coords, stop, index };
  });
  if (geometry?.length > 1) {
    L.polyline(geometry, { color: "#0F2A24", weight: 6, opacity: 0.22 }).addTo(group);
    L.polyline(geometry, { color: "#FFFFFF", weight: 4, opacity: 0.95 }).addTo(group);
    L.polyline(geometry, { color: "#0077B6", weight: 2, dashArray: "6 5" }).addTo(group);
  } else if (points.length > 1) {
    const line = points.map((point) => [point.lat, point.lon]);
    L.polyline(line, { color: "#0077B6", weight: 3, dashArray: "4 4" }).addTo(group);
  }
  points.forEach((point, i) => {
    const isEnd = i === 0 || i === points.length - 1;
    const marker = L.marker([point.lat, point.lon], {
      icon: L.divIcon({
        className: "map-stop-marker",
        html: `<div class="map-stop-pin" style="background:${isEnd ? "#22A559" : "#B03A1F"}">${i + 1}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      }),
      title: point.stop.address || point.stop.query,
    });
    marker.addTo(group);
  });
  if (points.length === 1) {
    map.setView([points[0].lat, points[0].lon], 13);
  } else if (points.length > 1) {
    map.fitBounds(points.map((point) => [point.lat, point.lon]), { padding: [28, 28], maxZoom: 14 });
  } else {
    map.setView([KEYSTONE_CENTER.lat, KEYSTONE_CENTER.lon], 13);
  }
}

function PlaceSearch({
  value,
  placeholder,
  ariaLabel,
  bias,
  onSelect,
  onQueryChange,
}) {
  const boxRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [active, setActive] = useState(0);
  const debounceRef = useRef(0);

  useEffect(() => {
    const onDoc = (event) => {
      if (!boxRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const runSearch = (query) => {
    const local = matchSeedPlaces(query);
    setResults(local);
    setOpen(true);
    setError("");
    if (query.trim().length < 2) {
      setLoading(false);
      return;
    }
    setLoading(true);
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const found = await searchPlaces(query, { bias });
        setResults(found);
        if (found.length === 0) setError("No matching places. Try a city or a fuller name.");
      } catch {
        setResults(local);
        setError(local.length ? "" : "Place search is offline. Seeded Keystone places still work.");
      } finally {
        setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);
  };

  const choose = (place) => {
    setOpen(false);
    setError("");
    onSelect(place);
  };

  return (
    <div ref={boxRef} className="place-search relative flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: TEAL }} />
        <input
          value={value}
          aria-label={ariaLabel}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${ariaLabel}-listbox`}
          role="combobox"
          placeholder={placeholder}
          autoComplete="off"
          onFocus={() => {
            if (value.trim().length >= 2) runSearch(value);
            else if (matchSeedPlaces(value).length) setOpen(true);
          }}
          onChange={(event) => {
            const next = event.target.value;
            onQueryChange(next);
            runSearch(next);
          }}
          onKeyDown={(event) => {
            if (!open || !results.length) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((index) => (index + 1) % results.length);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((index) => (index - 1 + results.length) % results.length);
            } else if (event.key === "Enter") {
              event.preventDefault();
              choose(results[active] || results[0]);
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
          className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none border-b border-transparent focus:border-[#0077B6] py-0.5"
        />
        {loading && <LoaderCircle className="w-3.5 h-3.5 animate-spin flex-shrink-0" style={{ color: TEAL }} />}
      </div>
      {open && (results.length > 0 || error || loading) && (
        <ul
          id={`${ariaLabel}-listbox`}
          role="listbox"
          data-testid="place-suggestions"
          className="place-suggestions absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-auto border"
          style={{ borderColor: BORDER, backgroundColor: "#FFFFFF", boxShadow: "0 12px 28px rgba(15,42,36,0.12)" }}
        >
          {results.map((place, index) => (
            <li key={place.id} role="option" aria-selected={index === active}>
              <button
                type="button"
                className="w-full text-left px-3 py-2.5 min-h-11"
                style={{ backgroundColor: index === active ? "#E7F7FB" : "transparent" }}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(place)}
              >
                <div className="text-sm font-semibold" style={{ color: PAPER }}>{place.name}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] leading-snug">
                  {place.address}
                </div>
              </button>
            </li>
          ))}
          {error && (
            <li style={{ fontFamily: "'JetBrains Mono', monospace", color: RUST }} className="px-3 py-2 text-[10px]">
              {error}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export function WaypointScreen({
  mode,
  setMode,
  trade,
  setTrade,
  customTrade,
  setCustomTrade,
  activity,
  setActivity,
  setDailyMiles,
  setDayStops,
  vehicleId,
  setVehicleId,
  vehicleYear,
  vehicleFits,
  workdayFitInputs,
  goToMatching,
  startCharge = START_CHARGE_DEFAULT,
  setStartCharge,
}) {
  const [stops, setStops] = useState(defaultMapStops);
  const [geometry, setGeometry] = useState(() => defaultMapStops().map((stop) => [stop.lat, stop.lon]));
  const [routeSource, setRouteSource] = useState("estimate");
  const [routeBusy, setRouteBusy] = useState(false);
  const [routeError, setRouteError] = useState("");
  const selectedVehicle = VEHICLE_OPTIONS.find((v) => v.id === vehicleId) || VEHICLE_OPTIONS[0];
  const [vehicleRange, setVehicleRange] = useState(selectedVehicle.baseRange);
  const startPct = Math.min(START_CHARGE_MAX, Math.max(START_CHARGE_MIN, Number(startCharge) || START_CHARGE_DEFAULT));
  const [waitPerStop, setWaitPerStop] = useState(20);
  const [crewSize, setCrewSize] = useState(2);
  const [acWhileParked, setAcWhileParked] = useState(true);
  const [coldWeather, setColdWeather] = useState(false);
  const routeGen = useRef(0);

  const updateStop = (id, patch) => setStops((prev) => prev.map((stop) => (stop.id === id ? { ...stop, ...patch } : stop)));

  const selectPlace = (id, place) => {
    setStops((prev) => prev.map((stop) => (
      stop.id === id
        ? {
          ...stop,
          query: place.name,
          address: formatPlaceLabel(place),
          place,
          lat: place.lat,
          lon: place.lon,
        }
        : stop
    )));
  };

  const addStop = () => {
    const nextId = Math.max(...stops.map((stop) => stop.id)) + 1;
    const blank = placeToStop(nextId, null, 0);
    setStops((prev) => [...prev.slice(0, -1), { ...blank, query: "" }, prev[prev.length - 1]]);
  };

  const removeStop = (id) => setStops((prev) => prev.filter((stop) => stop.id !== id));

  useEffect(() => {
    const gen = ++routeGen.current;
    const coords = placedStops(stops);
    if (coords.length < 2) {
      setGeometry(coords.map((stop) => [stop.lat, stop.lon]));
      setRouteSource("empty");
      setRouteBusy(false);
      setRouteError(coords.length === 0 ? "" : "Select another place to get live miles.");
      return undefined;
    }
    setRouteBusy(true);
    setRouteError("");
    routeStops(stops).then((route) => {
      if (gen !== routeGen.current) return;
      setStops((prev) => applyLegMiles(prev, route.legs, route.source));
      setGeometry(route.geometry);
      setRouteSource(route.source);
      setRouteBusy(false);
      setRouteError("");
    }).catch(() => {
      if (gen !== routeGen.current) return;
      setRouteBusy(false);
      setRouteError("Could not update driving miles. Showing the last estimate.");
    });
    return undefined;
  }, [stops.map((stop) => `${stop.id}:${stop.lat},${stop.lon}`).join("|")]);

  const totalMiles = totalRouteMiles(stops);
  const mappedCount = placedStops(stops).length;
  const jobStops = Math.max(mappedCount - 1, 0);

  useEffect(() => {
    setDailyMiles(totalMiles);
  }, [setDailyMiles, totalMiles]);

  useEffect(() => {
    setDayStops?.(jobStops);
  }, [setDayStops, jobStops]);

  useEffect(() => {
    setVehicleRange(selectedVehicle.baseRange);
  }, [selectedVehicle.id, selectedVehicle.baseRange]);

  const stopsWithWait = Math.max(stops.length - 1, 0);
  const totalIdleMin = acWhileParked ? stopsWithWait * waitPerStop : 0;
  const idleFuelEst = acWhileParked
    ? (totalIdleMin / 60) * 0.4 * (1 + Math.max(0, crewSize - 1) * 0.15)
    : 0;

  const { realWorldRange, stopStates, finalCharge, chargeStopsNeeded } = planRoute({
    stops,
    vehicleRange,
    startCharge: startPct,
    coldWeather,
  });

  const liveFit = useMemo(() => {
    const charging = {
      ...(workdayFitInputs?.charging ?? chargingOption("home")),
      startChargePct: startPct,
    };
    return workdayAssessment({
      trailerWeight: 0,
      payloadWeight: 0,
      equipmentItems: [],
      overflowTrailerId: "none",
      categoryScore: 80,
      categoryLabel: "route",
      ...workdayFitInputs,
      charging,
      dailyMiles: totalMiles,
      stops: jobStops || workdayFitInputs?.stops || 0,
      configRange: vehicleRange,
      towingCapacity: selectedVehicle.towing,
      payloadCapacity: selectedVehicle.payload,
      vehicleName: `${selectedVehicle.make} ${selectedVehicle.model}`,
      evKwhPer100Miles: selectedVehicle.kwhPer100Miles,
      vehicleId: selectedVehicle.id,
    });
  }, [workdayFitInputs, totalMiles, jobStops, vehicleRange, selectedVehicle, startPct]);

  const bias = placedStops(stops).at(-1) || KEYSTONE_CENTER;
  const milesNote = routeSource === "osrm"
    ? "Live OSRM driving miles"
    : routeSource === "estimate"
      ? "Estimated road miles (straight-line × 1.3)"
      : "Select two places to measure the route";

  return (
    <div className="max-w-2xl mx-auto">
      <ModeAndTradeSelector mode={mode} setMode={setMode} trade={trade} setTrade={setTrade} customTrade={customTrade} setCustomTrade={setCustomTrade} activity={activity} setActivity={setActivity} />

      <EyebrowBanner>Map My Day</EyebrowBanner>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif" }} className="text-4xl md:text-5xl mb-3">Stop guessing your mileage</h2>
      <p className="text-[#2E5651] text-sm mb-6 max-w-lg">
        Search real places — Wintergreen Apartments, Keystone Ski Resort — and we fill the stop, then update driving miles, remaining battery, and Workday / Play Day fit from that route.
      </p>
      <SelectedVehicleBar selectedId={selectedVehicle.id} onSelect={setVehicleId} label="These range numbers are for" fitByVehicle={vehicleFits} year={vehicleYear} />

      <MapVisual
        stops={stops}
        geometry={geometry}
        status={{ busy: routeBusy, message: "Updating miles", error: routeError }}
      />
      <p style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[9px] leading-relaxed mb-4">
        Topographic tiles: OpenTopoMap (OSM + SRTM, CC-BY-SA). Street layer: OpenStreetMap. Places: Photon / Nominatim. Driving miles: OSRM public router. No API keys. If those services are down, seeded Keystone places and estimated miles still work.
      </p>

      <a
        href="https://abetterrouteplanner.com/"
        target="_blank"
        rel="noreferrer"
        rel="noopener noreferrer"
        style={{ fontFamily: "'JetBrains Mono', monospace", borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}
        className="flex items-center justify-center gap-2 border text-xs uppercase tracking-wide px-4 py-3 mb-8"
      >
        Open A Better Route Planner <ExternalLink className="w-3.5 h-3.5" style={{ color: TEAL }} />
      </a>

      <div className="border mb-3" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
        {stopStates.map((s, i) => {
          const isStart = i === 0;
          const isEnd = i === stopStates.length - 1;
          return (
            <div key={s.id}>
              <div className="flex items-center gap-2 px-4 py-2.5 border-b last:border-b-0" style={{ borderColor: BORDER }}>
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundImage: `linear-gradient(135deg, ${isStart || isEnd ? OLIVE : RUST} 0%, ${isStart || isEnd ? OLIVE : RUST}CC 100%)` }}
                >
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#FCF6E4" }} className="text-[9px] font-semibold">{i + 1}</span>
                </div>
                <PlaceSearch
                  value={s.query ?? s.address}
                  ariaLabel={isStart ? "Start address" : isEnd ? "Finish address" : `Stop ${i} address`}
                  placeholder={isStart ? "Search start (e.g. Wintergreen Apartments)" : isEnd ? "Search finish (e.g. Keystone Ski Resort)" : "Search a stop"}
                  bias={bias}
                  onQueryChange={(query) => updateStop(s.id, { query })}
                  onSelect={(place) => selectPlace(s.id, place)}
                />
                {!isStart && (
                  <span
                    data-testid={`leg-miles-${s.id}`}
                    style={{ fontFamily: "'JetBrains Mono', monospace", borderColor: BORDER }}
                    className="w-14 border text-xs px-1.5 py-1 text-right flex-shrink-0"
                  >
                    {Number(s.legMiles || 0).toFixed(1)}
                  </span>
                )}
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: zoneColor(s.chargePct) }} className="text-[10px] font-semibold w-9 text-right flex-shrink-0">{s.chargePct}%</span>
                {!isStart && !isEnd && (
                  <button aria-label={`Remove stop ${i}`} onClick={() => removeStop(s.id)} style={{ color: RUST }} className="flex-shrink-0 min-h-11 min-w-11 text-sm leading-none px-1">×</button>
                )}
              </div>
              {s.suggestChargeStop && (
                <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: BORDER, backgroundColor: `${TEAL}12` }}>
                  <BatteryCharging className="w-3.5 h-3.5 flex-shrink-0" style={{ color: TEAL }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: TEAL }} className="text-[10px]">
                    ~{s.chargeMinutes} min fast charge suggested here — same as a fuel stop
                  </span>
                </div>
              )}
            </div>
          );
        })}
        <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: BORDER, backgroundImage: `linear-gradient(90deg, ${AMBER}12 0%, ${OLIVE}12 100%)` }}>
