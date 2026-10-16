import { C, svg, nightForest, flower, jason, phoebus, bunny, flies, sparkle, up, lines } from "../lib.mjs";

export default () => svg(lines(
  nightForest(71, { moonAt: [820, 100] }),
  up(240, [[90, 840, 1], [920, 850, 1]].map(([x, y, s]) => flower(x, y, s, "#9a94b4", false, 14)).join("")),
  up(240, flower(500, 850, 2.4, C.lavender, true)),
  jason({ x: 250, y: 595, s: 0.9, look: [1.2, 0], armR: 100, armL: 100, mouth: "open" }),
  phoebus({ x: 430, y: 595, s: 0.85, flip: true }),
  bunny({ x: 780, y: 590, s: 1.05, flip: true, hop: 26 }),
  flies([[560, 400], [660, 450], [380, 380], [700, 330]]), sparkle(520, 330, 22), sparkle(640, 520, 16),
), { label: "The freed bunny says thank you and a flower glows again" });
