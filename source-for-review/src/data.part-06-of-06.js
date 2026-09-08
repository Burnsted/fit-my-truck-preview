// Play Day recreational catalogs (reviewed September 2026)
// Towable empty/curb weights are FACT-ish midpoints of common
// manufacturer / retailer UVW sheets — boat + matching trailer
// unless labeled trailer-only. These feed towing checks.
// Gear weights are in-bed / cab payload unless trailerWeightLbs.
// ============================================================

export const PLAY_TOWABLE_FISHING_16_LB = 1450; // 16–18 ft aluminum + bunk (Lowe/Tracker ~685–905 + Karavan ~480–620)
export const PLAY_TOWABLE_BASS_19_LB = 2480; // 19-ft bass + tandem (Nitro Z19 / Targa 18 ~1,675–1,850 + ~700–900)
export const PLAY_TOWABLE_PONTOON_22_LB = 3680; // 22-ft pontoon + tandem (Party Barge 22 ~2,165–2,450 + ~1,150–1,350)
export const PLAY_TOWABLE_SKI_WAKE_21_LB = 4200; // 21-ft bowrider / ski-wake + tandem (~3,100–3,400 + ~900–1,100)
export const PLAY_TOWABLE_PWC_LB = 1020; // 2-up PWC + single trailer (Sea-Doo GTI-class ~780 + ShoreLand'r ~220–260)
export const PLAY_TOWABLE_PWC_DUAL_LB = 1780; // Dual mid-size PWC + dual trailer
export const PLAY_TOWABLE_POPUP_LB = 1860; // Pop-up / tent camper (Coleman/Rockwood 1940-class UVW ~1,795–1,980)
export const PLAY_TOWABLE_TRAVEL_18_LB = 3280; // 16–19 ft travel trailer (Wolf Pup / Sportsmen Classic UVW ~3,050–3,480)
export const PLAY_TOWABLE_UTILITY_12_LB = 1080; // 6x12 utility empty (Carry-On class ~980–1,180) — machine is gear
export const PLAY_TOWABLE_HORSE_2H_LB = 2760; // 2-horse bumper-pull empty (Sundowner/Exiss class ~2,500–3,000)
export const PLAY_TOWABLE_MOTO_LB = 420; // Folding / small open motorcycle trailer (Kendon-class ~300–480)
export const PLAY_TOWABLE_SNOW_LB = 780; // Double snowmobile trailer (Aluma/Triton ~650–900)

export const PLAY_TOWABLE_OPTIONS = [
  {
    id: "none",
    label: "None",
    emptyWeightLbs: 0,
    note: "Nothing in tow. Play-day gear stays in the bed or cab.",
  },
  {
    id: "fishing-16",
    label: "Fishing boat 16–18 ft",
    emptyWeightLbs: PLAY_TOWABLE_FISHING_16_LB,
    note: "Aluminum jon / tiller class plus bunk trailer. Empty ~1,450 lb combined.",
  },
  {
    id: "bass-19",
    label: "Bass boat 19 ft",
    emptyWeightLbs: PLAY_TOWABLE_BASS_19_LB,
    note: "Fiberglass bass boat plus tandem bunk. Empty ~2,480 lb combined.",
  },
  {
    id: "pontoon-22",
    label: "Pontoon 22 ft",
    emptyWeightLbs: PLAY_TOWABLE_PONTOON_22_LB,
    note: "22-ft party pontoon plus tandem trailer. Empty ~3,680 lb combined.",
  },
  {
    id: "ski-wake-21",
    label: "Ski / wake boat 21 ft",
    emptyWeightLbs: PLAY_TOWABLE_SKI_WAKE_21_LB,
    note: "21-ft bowrider / ski-wake plus tandem. Empty ~4,200 lb combined.",
  },
  {
    id: "pwc",
    label: "PWC + trailer",
    emptyWeightLbs: PLAY_TOWABLE_PWC_LB,
    note: "One 2-up personal watercraft plus single trailer. Empty ~1,020 lb.",
  },
  {
    id: "pwc-dual",
    label: "Dual PWC + trailer",
    emptyWeightLbs: PLAY_TOWABLE_PWC_DUAL_LB,
    note: "Two mid-size PWCs plus dual trailer. Empty ~1,780 lb.",
  },
  {
    id: "popup-camper",
    label: "Pop-up camper",
    emptyWeightLbs: PLAY_TOWABLE_POPUP_LB,
    note: "Folding tent camper UVW. Empty ~1,860 lb.",
  },
  {
    id: "travel-18",
    label: "Travel trailer 16–19 ft",
    emptyWeightLbs: PLAY_TOWABLE_TRAVEL_18_LB,
    note: "Small travel trailer UVW. Empty ~3,280 lb.",
  },
  {
    id: "atv-utility",
    label: "12-ft utility (ATV/SxS)",
    emptyWeightLbs: PLAY_TOWABLE_UTILITY_12_LB,
    note: "Open utility trailer empty only. Put the machine in Play Day gear.",
  },
  {
    id: "horse-2h",
    label: "2-horse bumper-pull",
    emptyWeightLbs: PLAY_TOWABLE_HORSE_2H_LB,
    note: "Bumper-pull two-horse empty. Empty ~2,760 lb.",
  },
  {
    id: "moto-trailer",
    label: "Motorcycle trailer",
    emptyWeightLbs: PLAY_TOWABLE_MOTO_LB,
    note: "Folding or small open motorcycle trailer. Empty ~420 lb.",
  },
  {
    id: "snow-trailer",
    label: "Snowmobile trailer",
    emptyWeightLbs: PLAY_TOWABLE_SNOW_LB,
    note: "Double snowmobile trailer empty. Empty ~780 lb.",
  },
];

export function playTowableById(id) {
  return PLAY_TOWABLE_OPTIONS.find((item) => item.id === id) ?? PLAY_TOWABLE_OPTIONS[0];
}

const PLAY_TOWABLE_DEFAULTS = {
  "Boating / Fishing": "fishing-16",
  "Camping": "popup-camper",
  "Mountain Biking": "none",
  "ATV / Off-Roading": "atv-utility",
  "Hunting": "none",
  "Snowmobiling": "snow-trailer",
  "Skiing / Snowboarding": "none",
  "Kayaking / Canoeing": "none",
  "Youth Sports / Team Travel": "none",
  "Tailgating": "none",
  "RV / Travel Trailer Towing": "travel-18",
  "Horse / Livestock Trailer": "horse-2h",
  "Motorcycle Hauling": "moto-trailer",
  "Overlanding": "none",
  "Lake / Beach Day Trips": "fishing-16",
  "Moving & Hauling for Family": "atv-utility",
};

export function defaultPlayTowableId(activity) {
  return PLAY_TOWABLE_DEFAULTS[activity] ?? "none";
}

export const PLAY_GEAR_SHARED = [
  kitItem({
    id: "play-cooler-65",
    name: "65-qt cooler (loaded day)",
    weightLbs: 85,
    weightSource: "estimate",
    note: "Yeti/RTIC 65-class empty ~29 lb; ice + food for a day ~85 lb loaded.",
  }),
  kitItem({
    id: "play-misc-100",
    name: "Additional 100 lb family cargo",
    weightLbs: 100,
    note: "Bags, groceries, leftover weekend cargo. No watt-hours.",
  }),
  kitItem({
    id: "play-misc-300",
    name: "Additional 300 lb family cargo",
    weightLbs: 300,
    note: "Heavier leftover weekend cargo. No watt-hours.",
  }),
];

const PLAY_PFDS = kitItem({
  id: "play-pfds",
  name: "4 adult PFDs",
  weightLbs: 16,
  weightSource: "estimate",
  note: "Four Type III life jackets ~3.5–4.5 lb each.",
});
const PLAY_TACKLE = kitItem({
  id: "play-tackle",
  name: "Tackle + rod bundle",
  weightLbs: 22,
  note: "Plano-class box plus a 4-rod day bundle.",
});
const PLAY_TENT = kitItem({
  id: "play-tent-4",
  name: "4-person tent",
  weightLbs: 17,
  weightSource: "fact",
  note: "REI Kingdom 4-class packed weight ~16.9 lb.",
});
const PLAY_SLEEP = kitItem({
  id: "play-sleep-4",
  name: "Sleeping bags + pads (4)",
  weightLbs: 28,
  note: "Four 3-season bags and pads.",
});
const PLAY_CAMP_KITCHEN = kitItem({
  id: "play-camp-kitchen",
  name: "Camp kitchen + stove",
  weightLbs: 24,
  note: "Stove, cookbox, table kit.",
});
const PLAY_CHAIRS = kitItem({
  id: "play-chairs-4",
  name: "4 camp / tailgate chairs",
  weightLbs: 20,
  note: "Four folding camp chairs.",
});
const PLAY_CANOPY = kitItem({
  id: "play-canopy",
  name: "10x10 canopy",
  weightLbs: 41,
  weightSource: "estimate",
  note: "Coleman-class 10x10 instant shelter ~35–47 lb.",
});
const PLAY_BIKES = kitItem({
  id: "play-bikes-2",
  name: "2 trail bikes + hitch rack",
  weightLbs: 118,
  weightSource: "estimate",
  note: "Two 32-lb trail bikes plus Kuat NV 2.0-class 2-bike hitch (~54 lb).",
});
const PLAY_KAYAKS = kitItem({
  id: "play-kayaks-2",
  name: "2 recreational kayaks + rack",
  weightLbs: 144,
  weightSource: "estimate",
  note: "Two 10–12 ft sit-ins (~53 lb) plus crossbar saddles and paddles/PFDs.",
});
const PLAY_ATV = kitItem({
  id: "play-atv-sportsman",
  name: "Sportsman-class ATV",
  weightLbs: 728,
  weightSource: "fact",
  note: "Polaris Sportsman 570-class dry ~728 lb. Bed or trailer deck.",
});
const PLAY_SXS = kitItem({
  id: "play-sxs-ranger",
  name: "Ranger-class SxS / UTV",
  weightLbs: 1660,
  weightSource: "estimate",
  note: "Polaris Ranger 1000 XP-class ~1,605–1,712 lb dry.",
});
const PLAY_SKI_SET = kitItem({
  id: "play-ski-wake-set",
  name: "Ski / wakeboard + tube",
  weightLbs: 30,
  note: "Combo ski, wakeboard, and towable tube.",
});
const PLAY_SNOWMOBILE = kitItem({
  id: "play-snowmobile",
  name: "Trail snowmobile",
  weightLbs: 480,
  weightSource: "estimate",
  note: "600–850cc trail sled dry ~450–520 lb.",
});
const PLAY_SKI_BAGS = kitItem({
  id: "play-ski-bags",
  name: "4 ski / board bags + boots",
  weightLbs: 56,
  note: "Four alpine kits in bags.",
});
const PLAY_HUNT = kitItem({
  id: "play-hunt-kit",
  name: "Gun cases + decoy bag",
  weightLbs: 42,
  note: "Two locked cases and a decoy/blind bag.",
});
const PLAY_TEAM = kitItem({
  id: "play-team-bags",
  name: "Team bags + ball crate",
  weightLbs: 55,
  note: "Sideline bags for a youth team.",
});
const PLAY_GRILL = kitItem({
  id: "play-tailgate-grill",
  name: "Tailgate grill + table",
  weightLbs: 38,
  note: "Portable gas grill and folding table.",
});
const PLAY_RV_KIT = kitItem({
  id: "play-rv-hookup",
  name: "RV hookup + water kit",
  weightLbs: 45,
  note: "Hoses, blocks, 20-lb extra water.",
});
const PLAY_TACK = kitItem({
  id: "play-horse-tack",
  name: "Tack + feed / water",
  weightLbs: 80,
  note: "Saddles/tack plus a day of feed and water.",
});
const PLAY_MOTO = kitItem({
  id: "play-motorcycle",
  name: "Dual-sport / dirt bike",
  weightLbs: 290,
  weightSource: "estimate",
  note: "250–450cc dual-sport wet ~270–320 lb.",
});
const PLAY_OVERLAND = kitItem({
  id: "play-rooftop-tent",
  name: "Rooftop tent + recovery",
  weightLbs: 165,
  note: "Hard-shell RTT class plus boards and straps.",
});
const PLAY_BEACH = kitItem({
  id: "play-beach-kit",
  name: "Beach wagon + shade",
  weightLbs: 36,
  note: "Wagon, umbrella, and towels crate.",
});
const PLAY_DOLLY = kitItem({
  id: "play-dolly-bins",
  name: "Dolly + moving bins",
  weightLbs: 70,
  note: "Appliance dolly and a stack of totes.",
});

export const PLAY_GEAR_BY_ACTIVITY = {
  "Boating / Fishing": [PLAY_PFDS, PLAY_TACKLE, PLAY_SKI_SET],
  "Camping": [PLAY_TENT, PLAY_SLEEP, PLAY_CAMP_KITCHEN, PLAY_CHAIRS, PLAY_CANOPY],
  "Mountain Biking": [PLAY_BIKES],
  "ATV / Off-Roading": [PLAY_ATV, PLAY_SXS],
  "Hunting": [PLAY_HUNT, PLAY_CHAIRS],
  "Snowmobiling": [PLAY_SNOWMOBILE, PLAY_SKI_BAGS],
  "Skiing / Snowboarding": [PLAY_SKI_BAGS, PLAY_CHAIRS],
  "Kayaking / Canoeing": [PLAY_KAYAKS, PLAY_PFDS],
  "Youth Sports / Team Travel": [PLAY_TEAM, PLAY_CHAIRS, PLAY_CANOPY],
  "Tailgating": [PLAY_GRILL, PLAY_CHAIRS, PLAY_CANOPY],
  "RV / Travel Trailer Towing": [PLAY_RV_KIT, PLAY_CHAIRS],
  "Horse / Livestock Trailer": [PLAY_TACK],
  "Motorcycle Hauling": [PLAY_MOTO],
  "Overlanding": [PLAY_OVERLAND, PLAY_TENT, PLAY_CAMP_KITCHEN],
  "Lake / Beach Day Trips": [PLAY_PFDS, PLAY_BEACH, PLAY_KAYAKS],
  "Moving & Hauling for Family": [PLAY_DOLLY],
};

const PLAY_GEAR_DEFAULTS = {
  "Boating / Fishing": ["play-pfds", "play-cooler-65"],
  "Camping": ["play-tent-4", "play-cooler-65"],
  "Mountain Biking": ["play-bikes-2"],
  "ATV / Off-Roading": ["play-atv-sportsman"],
  "Hunting": ["play-hunt-kit", "play-cooler-65"],
  "Snowmobiling": ["play-snowmobile"],
  "Skiing / Snowboarding": ["play-ski-bags"],
  "Kayaking / Canoeing": ["play-kayaks-2", "play-pfds"],
  "Youth Sports / Team Travel": ["play-team-bags", "play-cooler-65"],
  "Tailgating": ["play-tailgate-grill", "play-cooler-65", "play-chairs-4"],
  "RV / Travel Trailer Towing": ["play-rv-hookup", "play-cooler-65"],
  "Horse / Livestock Trailer": ["play-horse-tack"],
  "Motorcycle Hauling": ["play-motorcycle"],
  "Overlanding": ["play-rooftop-tent", "play-cooler-65"],
  "Lake / Beach Day Trips": ["play-beach-kit", "play-cooler-65"],
  "Moving & Hauling for Family": ["play-dolly-bins"],
};

export function playGearOptionsForActivity(activity) {
  return [...(PLAY_GEAR_BY_ACTIVITY[activity] ?? []), ...PLAY_GEAR_SHARED];
}

export function defaultPlayGearIds(activity) {
  return [...(PLAY_GEAR_DEFAULTS[activity] ?? [])];
}

export function playGearItemsFromIds(ids, activity) {
  return equipmentItemsFromIds(ids, playGearOptionsForActivity(activity));
}


