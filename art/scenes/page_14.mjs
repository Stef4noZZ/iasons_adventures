import { C, svg, wc, sky, stars, moon, hill, pine, roundTree, grassTufts, flower, star, jason, phoebus, bunny, owl, firefly, flies, sparkle, up, glowTint, lines } from "../lib.mjs";

export default () => svg(lines(
  sky("gDusk"), stars(151, 60, 300),
  `<circle cx="500" cy="100" r="320" fill="url(#gGlow)" opacity=".7"/>`,
  star({ x: 500, y: 80, s: 0.6, mood: "glow" }),
  `<path d="M500 130 Q470 200 520 290" stroke="url(#gPath)" stroke-width="10" fill="none" stroke-linecap="round" opacity=".55"/>`,
  up(240, lines(
    wc(lines(hill(400, 18, "url(#gHill1)", 4), [60, 160, 880, 950].map((x, i) => pine(x, 520, 300 + (i * 31) % 50, "#3f6a52")).join(""), [250, 760].map((x) => roundTree(x, 540, 300, "#6f9a58", "#a5c07a")).join(""), hill(540, 16, "url(#gHill3)", 2, 1))),
    `<rect y="560" width="1000" height="940" fill="url(#gGround)"/>`,
    grassTufts(18, 35, 640, 880, "#4c8a56"),
    [[110, 820, 1.4], [880, 830, 1.5], [330, 860, 1.1], [690, 850, 1.2]].map(([x, y, s], i) => flower(x, y, s, i % 2 ? C.goldSoft : C.lavender, true)).join(""),
  )),
  owl({ x: 760, y: 590, s: 0.7 }),
  jason({ x: 430, y: 595, s: 0.9, look: [0.4, -2], armR: 150, armL: 150, mouth: "open" }),
  phoebus({ x: 270, y: 595, s: 0.82, tail: -8 }),
  bunny({ x: 590, y: 595, s: 0.78, flip: true, hop: 16 }),
  flies([[160, 400], [880, 380], [330, 330], [680, 360], [560, 280]]), sparkle(500, 400, 22),
  glowTint("#ffcf6a", 0.28),
), { label: "The star returns to the sky and the forest fills with golden light" });
