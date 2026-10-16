import { C, svg, wc, sky, stars, moon, hill, pine, grassTufts, ancientTree, star, jason, phoebus, flies, sparkle, up, lines } from "../lib.mjs";

export default () => svg(lines(
  sky(), stars(121, 40, 220), moon(160, 100, 36),
  up(240, lines(
    wc(lines(hill(400, 18, "url(#gHill1)", 4), [60, 160, 880, 950].map((x, i) => pine(x, 520, 300 + (i * 31) % 50, "#2f5546")).join(""), hill(540, 16, "url(#gHill2)", 2, 1))),
    `<rect y="560" width="1000" height="940" fill="url(#gGround)"/>`,
    wc(ancientTree(620, 600, 640)),
    grassTufts(12, 28, 640, 880),
  )),
  star({ x: 620, y: 395, s: 0.6, mood: "dim" }),
  jason({ x: 230, y: 595, s: 0.88, look: [1.4, 0.2], armR: 70, armL: 20, mouth: "calm" }),
  phoebus({ x: 400, y: 595, s: 0.85, flip: true }),
  flies([[480, 340], [760, 330]]),
), { label: "A little star is trapped among the roots of an ancient tree" });
