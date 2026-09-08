import { Wrench } from "lucide-react";
import { AMBER, OLIVE, PAPER } from "../theme";

export function FTMYLogo({ size = 36 }) {
  return (
    <div style={{ position: "relative", fontFamily: "'Poppins', sans-serif", fontWeight: 900, lineHeight: 0.82, letterSpacing: "-0.06em" }}>
      {/* faint lightning-bolt watermark behind the mark, for depth and the electrification cue */}
      <svg viewBox="0 0 40 50" style={{ position: "absolute", left: "28%", top: "-35%", width: size * 0.9, height: size * 1.25, opacity: 0.18, zIndex: 0 }}>
        <path d="M24,0 L6,28 L17,28 L11,50 L36,18 L23,18 Z" fill={OLIVE} />
      </svg>
      <div style={{ display: "flex", position: "relative", zIndex: 1, filter: "drop-shadow(0 1.5px 1px rgba(15,42,36,0.25))" }}>
        <span style={{ fontSize: size, color: AMBER }}>F</span>
        <span style={{ fontSize: size, color: OLIVE, marginLeft: size * -0.075 }}>T</span>
      </div>
      <span
        style={{
          fontFamily: "'Permanent Marker', cursive", color: "#F5B400", WebkitTextStroke: `1px ${PAPER}`,
          position: "absolute", left: "2%", top: "42%", fontSize: size * 0.55, transform: "rotate(-3deg)",
          zIndex: 2, filter: "drop-shadow(0 1px 1.5px rgba(15,42,36,0.45))",
        }}
      >
        MY
      </span>
    </div>
  );
}

export function TruckOutfitMark() {
  return (
    <div className="relative w-14 h-10 flex-shrink-0">
      <svg viewBox="0 0 64 36" className="w-full h-full">
        <defs>
          <linearGradient id="truckFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#D6F0FA" />
          </linearGradient>
          <linearGradient id="truckGlass" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#AEDCEA" /><stop offset="100%" stopColor="#7FC3DE" />
          </linearGradient>
        </defs>
        <ellipse cx="31" cy="31.5" rx="27" ry="2.2" fill="#0F2A24" opacity="0.12" />
        {/* topper / cap over the bed — the "outfitting" detail */}
        <rect x="26" y="6.5" width="30" height="10.5" rx="2.5" fill="none" stroke={AMBER} strokeWidth="1.5" strokeDasharray="2.5 2" />
        {/* truck body */}
        <path
          d="M3,27 L3,22.5 Q3,20 5.5,20 L8,20 L13,9.5 Q13.8,8.5 15,8.5 L24,8.5 Q25,8.5 25,9.5 L25,17 L56,17 Q58,17 58,19 L58,27 Z"
          fill="url(#truckFill)" stroke={PAPER} strokeWidth="1.6" strokeLinejoin="round"
        />
        {/* windshield */}
        <path d="M13.6,10 L15.2,9.3 L23.2,9.3 L23.2,16.2 L10.6,16.2 Z" fill="url(#truckGlass)" opacity="0.85" />
        {/* door seam + mirror, subtle detail */}
        <line x1="19" y1="17" x2="19" y2="27" stroke={PAPER} strokeWidth="0.6" opacity="0.35" />
        <path d="M8,17.5 L6,16.8 L6.2,19 Z" fill={PAPER} opacity="0.6" />
        {/* wheels */}
        {[13, 48].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="27" r="4.6" fill={PAPER} />
            <circle cx={cx} cy="27" r="2.6" fill="url(#truckFill)" />
            <line x1={cx - 1.6} y1="27" x2={cx + 1.6} y2="27" stroke={PAPER} strokeWidth="0.6" />
            <line x1={cx} y1="25.4" x2={cx} y2="28.6" stroke={PAPER} strokeWidth="0.6" />
          </g>
        ))}
      </svg>
      <div
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
        style={{ backgroundImage: `linear-gradient(135deg, ${AMBER} 0%, ${OLIVE} 100%)` }}
      >
        <Wrench className="w-3 h-3" style={{ color: "#FCF6E4" }} strokeWidth={2.5} />
      </div>
    </div>
  );
}
