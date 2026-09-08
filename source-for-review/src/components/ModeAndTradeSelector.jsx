import { Briefcase, Waves } from "lucide-react";
import { ACTIVITIES, MAJOR_TRADES, OTHER_TRADE_NAME, SCENE_IMAGES, resolveTradeProfile } from "../data";
import {
  AMBER, BORDER, MUTED, PANEL, TEAL, TEXT,
} from "../theme";
import { CategorySelect } from "./ui";

export function ModeAndTradeSelector({ mode, setMode, trade, setTrade, activity, setActivity, customTrade = "", setCustomTrade }) {
  const profile = resolveTradeProfile(trade, customTrade);
  const handleTradeChange = (name) => {
    setTrade(name);
    if (name !== OTHER_TRADE_NAME) setCustomTrade?.("");
  };
  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {[
          { id: "work", label: "Workday", sub: "Jobsite routes, trailers, payload", icon: Briefcase, color: AMBER, scene: SCENE_IMAGES.workday },
          { id: "recreation", label: "Play Day", sub: "Boat, camper, weekend towing", icon: Waves, color: TEAL, scene: SCENE_IMAGES.playday },
        ].map(({ id, label, sub, icon: Icon, color, scene }) => {
          const active = mode === id;
          return (
            <button key={id} onClick={() => setMode(id)} className="relative overflow-hidden text-left p-5 border-2 transition-all" style={{ borderColor: active ? color : BORDER, backgroundColor: active ? `${color}1A` : PANEL }}>
              {scene?.url && (
                <img
                  src={scene.url}
                  alt=""
                  width={1200}
                  height={545}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ opacity: active ? 0.5 : 0.38 }}
                />
              )}
              <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(180deg, ${PANEL}A6 0%, ${PANEL}88 55%, ${PANEL}C4 100%)` }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-5 h-5" style={{ color: active ? color : MUTED }} strokeWidth={2} />
                  <span style={{ fontFamily: "'Oswald', sans-serif", color: active ? color : TEXT }} className="text-xl font-semibold uppercase tracking-wide">{label}</span>
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[11px]">{sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      {mode === "work" ? (
        <div className="mb-8">
          <CategorySelect label="What's your trade?" options={MAJOR_TRADES} value={trade} onChange={handleTradeChange} color={AMBER} />
          {trade === OTHER_TRADE_NAME && (
            <div className="mt-3">
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }} className="text-[10px] uppercase tracking-wide mb-1.5">Enter your trade</div>
              <input
                aria-label="Enter your trade"
                placeholder="e.g. locksmith, appliance repair"
                value={customTrade}
                onChange={(e) => setCustomTrade?.(e.target.value)}
                style={{ fontFamily: "'Oswald', sans-serif", borderColor: AMBER, backgroundImage: "linear-gradient(155deg, #FFFFFF 0%, #D3F3E0 100%)", color: "#0F2A24" }}
                className="w-full border-2 text-sm font-semibold uppercase tracking-wide px-4 py-3 focus:outline-none"
              />
              <p className="text-[#5A7D77] text-[11px] leading-relaxed mt-2">
                {profile.categoryLabel && profile.categoryLabel !== OTHER_TRADE_NAME
                  ? `Showing “${profile.categoryLabel}.” Generic field-service kit stays on the truck. No convertibility percentage is assumed for a typed trade — payload, kit, and savings update live as you type.`
                  : "Type the trade you actually run. Uses the generic field-service kit. No convertibility score is assumed — enter your day below and the numbers stay live."}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8"><CategorySelect label="What's the activity?" options={ACTIVITIES} value={activity} onChange={setActivity} color={TEAL} /></div>
      )}
    </>
  );
}
