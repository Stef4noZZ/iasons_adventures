import { C, svg, sky, stars, hill, pine, sparkle, star, lines } from "../lib.mjs";

export default () => svg(lines(
  `<rect width="1000" height="1000" fill="#e4d6e8"/><rect width="1000" height="1000" fill="#c9bde3" opacity=".35"/>`,
  `<rect y="610" width="1000" height="400" fill="#a98f74"/>`,
  // window with the star
  `<rect x="520" y="60" width="380" height="440" rx="26" fill="#a3825a"/><clipPath id="w16"><rect x="544" y="84" width="332" height="392" rx="16"/></clipPath>`,
  `<g clip-path="url(#w16)">${sky()}${stars(171, 36, 360)}<circle cx="700" cy="230" r="170" fill="url(#gGlow)"/>${hill(400, 16, "url(#gHill1)", 3)}${pine(600, 470, 150, "#34507a")}${pine(820, 470, 190, "#2f5546")}${hill(450, 12, "url(#gHill2)", 8)}</g>`,
  star({ x: 700, y: 230, s: 0.42, mood: "glow" }),
  `<rect x="708" y="84" width="12" height="392" fill="#a3825a"/><rect x="544" y="270" width="332" height="12" fill="#a3825a"/>`,
  `<path d="M470 0 H560 Q540 220 552 500 Q500 520 450 500 Q462 250 470 0Z" fill="#8f86c9"/><path d="M880 0 H960 Q972 250 950 500 Q900 520 868 500 Q880 250 880 0Z" fill="#8f86c9"/>`,
  // bed
  `<g filter="url(#wcs)">
  <rect x="60" y="400" width="30" height="230" rx="12" fill="#8e6a44"/><rect x="60" y="400" width="470" height="30" rx="12" fill="#8e6a44"/>
  <rect x="80" y="480" width="470" height="140" rx="30" fill="#f4ead9"/>
  <ellipse cx="190" cy="470" rx="110" ry="46" fill="#fffaf0"/>
  <circle cx="200" cy="440" r="58" fill="${C.skin}"/><path d="M142 436 Q146 384 205 384 Q262 386 258 436 Q240 410 200 410 Q160 410 142 436Z" fill="${C.hair}"/>
  <circle cx="148" cy="446" r="11" fill="${C.skin}"/>
  <path d="M215 438 Q226 446 238 438" stroke="#3a2a20" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M168 438 Q179 446 190 438" stroke="#3a2a20" stroke-width="4" fill="none" stroke-linecap="round"/>
  <circle cx="246" cy="456" r="10" fill="#f19a8a" opacity=".5"/><path d="M212 466 Q222 472 232 466" stroke="#a5503f" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M120 505 Q300 440 548 500 L548 620 L110 620Z" fill="#8e9fd6"/><path d="M120 505 Q300 440 548 500 L548 520 Q300 470 120 530Z" fill="#a9b8e6"/>
  </g>`,
  [[260, 560], [360, 580], [450, 550], [180, 590]].map(([x, y]) => sparkle(x, y, 14, "#fbe3a0", 0.85)).join(""),
  `<circle cx="640" cy="300" r="300" fill="url(#gGlow)" opacity=".16"/>`,
  `<rect x="440" y="0" width="520" height="22" rx="8" fill="#6b4a2f"/>`,
), { label: "Jason sleeps peacefully while the star shines outside" });
