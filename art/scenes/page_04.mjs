import { C, svg, nightForest, flower, jason, phoebus, flies, up, lines } from "../lib.mjs";

export default () => svg(lines(
  nightForest(51, { moonAt: [180, 110] }),
  up(240, [[90, 830, 1.3], [230, 860, 1.1], [420, 840, 1.2], [610, 850, 1.3], [790, 830, 1.2], [920, 860, 1]].map(([x, y, s]) => flower(x, y, s, "#9a94b4", false, (x % 3) * 12 - 10)).join("")),
  jason({ x: 330, y: 595, s: 0.9, look: [0.6, 1], armR: 40, armL: 20, mouth: "calm" }),
  phoebus({ x: 640, y: 595, s: 0.95, flip: true, mood: "sad" }),
  flies([[500, 380], [760, 430]]),
), { label: "The flowers in the forest have lost their light" });
