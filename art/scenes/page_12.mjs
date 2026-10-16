import { C, svg, wc, sky, stars, moon, hill, pine, grassTufts, ancientTree, star, jason, phoebus, flies, sparkle, up, lines } from "../lib.mjs";

export default () => svg(lines(
  sky(), stars(131, 40, 220), moon(160, 100, 36),
  up(240, lines(
    wc(lines(hill(400, 18, "url(#gHill1)", 4), [60, 160, 880, 950].map((x, i) => pine(x, 520, 300 + (i * 31) % 50, "#2f5546")).join(""), hill(540, 16, "url(#gHill2)", 2, 1))),
    `<rect y="560" width="1000" height="940" fill="url(#gGround)"/>`,
    wc(ancientTree(640, 600, 640)),
    grassTufts(14, 28, 640, 880),
  )),
  star({ x: 640, y: 395, s: 0.6, mood: "dim" }),
  jason({ x: 420, y: 595, s: 0.9, look: [1.4, 0.2], armR: 55, armL: 35, mouth: "open", walk: 0.5 }),
  phoebus({ x: 250, y: 595, s: 0.82, flip: true, mood: "sad" }),
  sparkle(520, 380, 14),
), { label: "Jason and Phoebus try to free the star, but it is too heavy" });
