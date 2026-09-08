          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">Total this route</span>
          <span data-testid="route-total-miles" style={{ fontFamily: "'JetBrains Mono', monospace", color: PAPER }} className="text-sm font-semibold">{totalMiles} mi</span>
        </div>
        <div className="px-4 py-2" style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} data-testid="route-miles-source">
          <span className="text-[10px] uppercase tracking-wide">{milesNote}</span>
        </div>
        <button onClick={addStop} style={{ fontFamily: "'JetBrains Mono', monospace", color: AMBER }} className="w-full text-left text-xs uppercase tracking-wide px-4 py-2.5">
          + Add stop
        </button>
      </div>

      <div className="border p-4 mb-4" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
        <StartChargeControl
          value={startPct}
          onChange={(next) => setStartCharge?.(next)}
          min={START_CHARGE_MIN}
          max={START_CHARGE_MAX}
          hint="Not always 100%. Remaining range, end-of-route battery, and Workday / Play Day fit all use this start plus today's mapped miles."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2 border p-4" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
        <MiniField label={`Rated range (${selectedVehicle.make} ${selectedVehicle.model})`} value={vehicleRange} onChange={setVehicleRange} suffix="mi" />
        <MiniField label="Typical wait per stop" value={waitPerStop} onChange={setWaitPerStop} suffix="min" />
        <MiniField label="Typical crew waiting" value={crewSize} onChange={setCrewSize} suffix="ppl" />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={acWhileParked} onChange={(e) => setAcWhileParked(e.target.checked)} className="accent-[#0077B6]" />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">Engine/AC usually running while parked</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={coldWeather} onChange={(e) => setColdWeather(e.target.checked)} className="accent-[#0077B6]" />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">Cold weather driving</span>
        </label>
      </div>
      <div className="flex items-center justify-between mb-8 px-1">
        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">
          Real-world range used for this route ({coldWeather ? "35%" : "17%"} shortfall from rated)
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: RUST }} className="text-sm font-semibold">{realWorldRange} mi</span>
      </div>

      <div className="border p-6 mb-4" style={{ borderColor: BORDER, backgroundColor: "#D3F3E0" }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">Actual daily miles</div><div data-testid="map-daily-miles" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#0F2A24" }} className="text-3xl font-semibold mt-1">{totalMiles}</div></div>
          <div><div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">Idle/AC time</div><div style={{ fontFamily: "'JetBrains Mono', monospace", color: AMBER }} className="text-3xl font-semibold mt-1">{totalIdleMin}<span className="text-base text-[#5A7D77]"> min</span></div></div>
          <div><div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">Est. idle fuel, current truck</div><div style={{ fontFamily: "'JetBrains Mono', monospace", color: RUST }} className="text-3xl font-semibold mt-1">{idleFuelEst.toFixed(1)}<span className="text-base text-[#5A7D77]"> gal</span></div></div>
        </div>
        <p className="text-[#5A7D77] text-xs leading-relaxed mt-4">This is the number that actually feeds Build My Workday and Play Day — not a guess.</p>
      </div>

      {liveFit && (
        <div data-testid="map-live-fit" className="border p-4 mb-4" style={{ borderColor: BORDER, backgroundImage: PANEL_GRADIENT }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">{mode === "recreation" ? "Play Day" : "Workday"} fit</div>
              <div data-testid="map-fit-score" style={{ fontFamily: "'JetBrains Mono', monospace", color: PAPER }} className="text-2xl font-semibold mt-1">{liveFit.fitScore}</div>
            </div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">End-of-day reserve</div>
              <div data-testid="map-fit-reserve" style={{ fontFamily: "'JetBrains Mono', monospace", color: zoneColor(liveFit.reserve.pct) }} className="text-2xl font-semibold mt-1">{liveFit.reserve.pct}%</div>
            </div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide">Fit rating</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: PAPER }} className="text-sm font-semibold mt-2">{liveFit.ratingLabel.replace("Workday", mode === "recreation" ? "Play Day" : "Workday")}</div>
            </div>
          </div>
        </div>
      )}

      <div className="border p-6" style={{ borderColor: zoneColor(finalCharge), backgroundImage: PANEL_GRADIENT }}>
        <div className="flex items-center gap-2 mb-2">
          <BatteryCharging className="w-4 h-4" style={{ color: zoneColor(finalCharge) }} />
          <span data-testid="map-final-charge" style={{ fontFamily: "'JetBrains Mono', monospace", color: zoneColor(finalCharge) }} className="text-xs uppercase tracking-wide font-semibold">
            {chargeStopsNeeded === 0 ? `Home with charge to spare — ${finalCharge}%` : `${chargeStopsNeeded} fast-charge stop${chargeStopsNeeded > 1 ? "s" : ""} needed today`}
          </span>
        </div>
        <p className="text-[#5A7D77] text-xs leading-relaxed">
          {chargeStopsNeeded === 0 ? "This route doesn't need a mid-day charging stop — a normal overnight top-off at home covers it." : "Same as stopping for gas — built into the route, not a separate errand. For turn-by-turn charging stops on longer trips, this links out to A Better Route Planner rather than duplicating it."}
        </p>
      </div>

      <PriceRibbon variant="truck" />

      <FindMyTruckCta onClick={goToMatching} subtitle="See What Fits This Route" />
    </div>
  );
}


