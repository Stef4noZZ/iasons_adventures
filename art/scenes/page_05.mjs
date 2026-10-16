import { C, svg, nightForest, flower, jason, phoebus, bunny, twigs, flies, sparkle, up, lines } from "../lib.mjs";

export default () => svg(lines(
  nightForest(61, { moonAt: [170, 100], pines: [40, 150, 900, 970] }),
  up(240, [[80, 840, 1], [400, 860, 1], [940, 850, 1]].map(([x, y, s]) => flower(x, y, s, "#9a94b4", false, 14)).join("")),
  bunny({ x: 790, y: 590, s: 1.05, flip: true, mood: "sad" }),
  `<g filter="url(#wcs)">${twigs(790, 535, 200, 4)}</g>`,
  jason({ x: 300, y: 595, s: 0.9, look: [1.5, 0.3], armR: 70, armL: 40, mouth: "open", walk: 0.8 }),
  phoebus({ x: 520, y: 595, s: 0.9, flip: true, mood: "happy" }),
  sparkle(790, 400, 18),
), { label: "A little bunny is trapped under fallen twigs" });
