import { C, svg, wc, sky, stars, moon, hill, pine, jason, sparkle, lines } from "../lib.mjs";

const window_ = lines(
  `<clipPath id="win"><path d="M560 120 Q560 70 640 70 Q720 70 720 120 L720 460 L560 460Z" transform="translate(-0 0) scale(1.0)"/></clipPath>`,
);

export default () => svg(lines(
  `<rect width="1000" height="1000" fill="#e9dcc3"/>`,
  `<rect y="620" width="1000" height="380" fill="#b49a73"/><rect y="610" width="1000" height="14" fill="#8e7656"/>`,
  `<path d="M0 0 H1000 V620 H0Z" fill="#efe3cb"/>`,
  Array.from({ length: 9 }, (_, i) => `<rect x="${i * 125 + 20}" y="0" width="14" height="610" fill="#e0d0b0" opacity=".5"/>`).join(""),
  // window frame
  `<rect x="545" y="60" width="330" height="430" rx="26" fill="#a3825a"/>`,
  `<clipPath id="win"><rect x="568" y="84" width="284" height="382" rx="16"/></clipPath>`,
  `<g clip-path="url(#win)">`, sky(), stars(21, 40, 380),
  `<path d="M590 130 L830 130" stroke="none"/>`,
  `<g><path d="M820 130 L650 235" stroke="url(#gPath)" stroke-width="10" stroke-linecap="round" opacity=".85"/><path d="M820 130 L700 202" stroke="#fff6d8" stroke-width="5" stroke-linecap="round"/>${sparkle(650, 235, 34, C.goldSoft)}<circle cx="650" cy="235" r="60" fill="url(#gGlow)"/></g>`,
  moon(780, 200, 0.01),
  hill(380, 18, "url(#gHill1)", 3), pine(620, 440, 140, "#34507a"), pine(790, 440, 170, "#2f5546"), hill(430, 12, "url(#gHill2)", 7),
  `</g>`,
  `<rect x="702" y="84" width="12" height="382" fill="#a3825a"/><rect x="568" y="262" width="284" height="12" fill="#a3825a"/>`,
  `<rect x="545" y="60" width="330" height="430" rx="26" fill="none" stroke="#7f6444" stroke-width="10" opacity=".6"/>`,
  `<rect x="520" y="480" width="380" height="34" rx="10" fill="#8e7656"/>`,
  // curtains
  `<path d="M470 0 H590 Q560 200 575 500 Q500 520 440 500 Q460 250 470 0Z" fill="#8f86c9"/><path d="M830 0 H950 Q960 250 940 500 Q880 520 835 500 Q850 250 830 0Z" fill="#8f86c9"/>`,
  `<path d="M500 0 Q520 250 505 500" stroke="#a79fda" stroke-width="10" fill="none" opacity=".6"/><path d="M900 0 Q890 250 905 500" stroke="#a79fda" stroke-width="10" fill="none" opacity=".6"/>`,
  `<rect x="440" y="0" width="520" height="22" rx="8" fill="#6b4a2f"/>`,
  // stool + jason
  `<rect x="280" y="560" width="190" height="26" rx="10" fill="#8e6a44"/><rect x="298" y="580" width="18" height="70" fill="#7a5a3a"/><rect x="434" y="580" width="18" height="70" fill="#7a5a3a"/>`,
  jason({ x: 375, y: 560, s: 1.18, outfit: "pj", hat: false, armR: 100, armL: 20, look: [1.6, -1.2], mouth: "open" }),
  `<circle cx="680" cy="270" r="260" fill="url(#gGlow)" opacity=".18"/>`,
), { label: "Jason watches a shooting star from his window" });
