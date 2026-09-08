import { useState } from "react";
import { ACTIVITIES, DEFAULT_WORK_TRADE, START_CHARGE_DEFAULT, VEHICLE_OPTIONS } from "./data";
import {
  AMBER, BORDER, FONTS, OLIVE, PAPER,
} from "./theme";
import { FTMYLogo } from "./components/brand";
import { PhotoCredits } from "./components/VehiclePhoto";
import { BuildMyWorkdayScreen } from "./screens/BuildMyWorkdayScreen";
import { FindMyTruckScreen } from "./screens/FindMyTruckScreen";
import { FleetScreen } from "./screens/FleetScreen";
import { WaypointScreen } from "./screens/MapMyDayScreen";

export default function FitMyTruckApp() {
  const [screen, setScreen] = useState("workday");
  const [mode, setMode] = useState("work");
  const [trade, setTrade] = useState(DEFAULT_WORK_TRADE.name);
  const [customTrade, setCustomTrade] = useState("");
  const [activity, setActivity] = useState(ACTIVITIES[0]);
  const [dailyMiles, setDailyMiles] = useState(DEFAULT_WORK_TRADE.defaults?.dailyMiles ?? 58);
  const [dayStops, setDayStops] = useState(DEFAULT_WORK_TRADE.defaults?.stops ?? 6);
  const [vehicleId, setVehicleId] = useState(VEHICLE_OPTIONS[0].id);
  const [vehicleYear, setVehicleYear] = useState(String(VEHICLE_OPTIONS[0].firstAvailableYear ?? 2022));
  const [vehicleFits, setVehicleFits] = useState(null);
  const [workdayFitInputs, setWorkdayFitInputs] = useState(null);
  const [startCharge, setStartCharge] = useState(START_CHARGE_DEFAULT);
  const goToMatching = () => setScreen("matching");
  const sharedProps = {
    mode, setMode, trade, setTrade, customTrade, setCustomTrade, activity, setActivity,
    dailyMiles, setDailyMiles, dayStops, setDayStops, vehicleId, setVehicleId, goToMatching,
    vehicleYear, setVehicleYear,
    vehicleFits, onVehicleFitsChange: setVehicleFits,
    workdayFitInputs, onWorkdayInputsChange: setWorkdayFitInputs,
    startCharge, setStartCharge,
  };

  const NAV = [
    { id: "workday", label: "Build My Workday" },
    { id: "playday", label: "Build My Play Day" },
    { id: "map", label: "Map My Day" },
    { id: "fleet", label: "FleetFit" },
  ];
  // "workday" and "playday" both route to the same screen — which one's active depends on mode too
  const activeNavId = screen === "workday" ? (mode === "work" ? "workday" : "playday") : screen;
  const handleNavClick = (id) => {
    if (id === "workday") { setScreen("workday"); setMode("work"); }
    else if (id === "playday") { setScreen("workday"); setMode("recreation"); }
    else setScreen(id);
  };

  return (
    <div className="app-shell min-h-screen" style={{ color: PAPER, fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <style>{FONTS}</style>
      <header className="glass-header sticky top-0 z-10 border-b px-4 sm:px-6 md:px-10 py-4 flex items-center justify-between flex-wrap gap-4" style={{ backgroundImage: "linear-gradient(180deg, rgba(246,252,252,0.92) 0%, rgba(220,239,234,0.86) 100%)", borderColor: BORDER }}>
        <div
          className="brand-pill flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-full"
          style={{ backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0.92) 0%, ${AMBER}18 52%, ${OLIVE}20 100%)`, border: `1px solid ${BORDER}` }}
        >
          <FTMYLogo />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em" }} className="text-2xl leading-none">FIT MY TRUCK</span>
        </div>
        <nav aria-label="Primary" style={{ fontFamily: "'JetBrains Mono', monospace" }} className="grid grid-cols-2 md:flex md:items-center gap-2 text-xs uppercase tracking-wider w-full md:w-auto">
          {NAV.map((n) => {
            const active = activeNavId === n.id;
            return (
              <button
                aria-current={active ? "page" : undefined}
                key={n.id}
                onClick={() => handleNavClick(n.id)}
                className="nav-chip px-4 py-2 rounded-full border-2 transition-all text-center"
                style={{
                  borderColor: OLIVE,
                  backgroundImage: active ? `linear-gradient(90deg, ${AMBER} 0%, ${AMBER}CC 100%)` : "none",
                  backgroundColor: "transparent",
                  color: active ? "#FFFFFF" : OLIVE,
                }}
              >
                {n.label}
              </button>
            );
          })}
        </nav>
      </header>
      <section className="app-stage px-4 sm:px-6 md:px-10 py-8 sm:py-12 md:py-16">
        {screen === "workday" && <BuildMyWorkdayScreen {...sharedProps} />}
        {screen === "map" && <WaypointScreen {...sharedProps} />}
        {screen === "matching" && <FindMyTruckScreen {...sharedProps} />}
        {screen === "fleet" && <FleetScreen vehicleId={vehicleId} setVehicleId={setVehicleId} vehicleFits={vehicleFits} vehicleYear={vehicleYear} />}
        <PhotoCredits />
      </section>
    </div>
  );
}
