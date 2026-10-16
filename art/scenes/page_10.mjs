import { C, svg, nightForest, owl, jason, phoebus, firefly, flies, sparkle, up, lines } from "../lib.mjs";

const trail = [[520, 560], [600, 520], [690, 470], [770, 410], [840, 350], [900, 300]].map(([x, y], i) => firefly(x, y, 1.1 + i * 0.05)).join("");
export default () => svg(lines(
  nightForest(111, { moonAt: [150, 110] }),
  trail,
  owl({ x: 560, y: 330, s: 0.8, wing: 60 }),
  jason({ x: 280, y: 595, s: 0.9, look: [1.2, -1], armR: 150, armL: 30, mouth: "open" }),
  phoebus({ x: 440, y: 595, s: 0.85, flip: true }),
  flies([[130, 360], [380, 330], [700, 560]]), sparkle(640, 280, 18),
), { label: "The owl is free and fireflies light the way" });
