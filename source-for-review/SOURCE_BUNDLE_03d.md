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
