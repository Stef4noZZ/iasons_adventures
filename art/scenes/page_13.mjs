import { C, svg, wc, sky, stars, moon, hill, pine, grassTufts, ancientTree, star, jason, phoebus, bunny, owl, flies, sparkle, up, glowTint, lines } from "../lib.mjs";

export default () => svg(lines(
  sky(), stars(141, 40, 220), moon(160, 100, 36),
  up(240, lines(
    wc(lines(hill(400, 18, "url(#gHill1)", 4), [60, 160, 880, 950].map((x, i) => pine(x, 520, 300 + (i * 31) % 50, "#2f5546")).join(""), hill(540, 16, "url(#gHill2)", 2, 1))),
    `<rect y="560" width="1000" height="940" fill="url(#gGround)"/>`,
    wc(ancientTree(640, 600, 640)),
    grassTufts(16, 28, 640, 880),
  )),
  star({ x: 640, y: 370, s: 0.7, mood: "glow" }),
  owl({ x: 700, y: 275, s: 0.6, wing: 50 }),
  jason({ x: 410, y: 595, s: 0.88, look: [1.3, -0.2], armR: 70, armL: 35, mouth: "open", walk: 0.5 }),
  phoebus({ x: 250, y: 595, s: 0.8, flip: true }),
  bunny({ x: 560, y: 595, s: 0.8, flip: true }),
  flies([[480, 330], [800, 380], [380, 400]]), sparkle(520, 250, 18),
), { label: "Everyone works together and the star shines again" });
