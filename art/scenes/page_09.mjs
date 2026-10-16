import { C, svg, nightForest, ancientTree, owl, twigs, jason, phoebus, flies, sparkle, up, lines } from "../lib.mjs";

export default () => svg(lines(
  nightForest(101, { moonAt: [180, 100], trees: [] }),
  `<g filter="url(#wc)">${`<path d="M640 80 Q660 250 640 400 L740 400 Q720 250 740 80Z" fill="#5a4030"/><path d="M690 230 Q560 210 470 250" stroke="#5a4030" stroke-width="30" fill="none" stroke-linecap="round"/>`}</g>`,
  owl({ x: 520, y: 252, s: 0.75, mood: "worried" }),
  `<g filter="url(#wcs)">${twigs(520, 220, 190, 8)}</g>`,
  jason({ x: 290, y: 595, s: 0.9, look: [1.2, -1.6], armR: 110, armL: 30, mouth: "calm" }),
  phoebus({ x: 460, y: 595, s: 0.85, flip: true, mood: "sad" }),
  flies([[880, 380], [120, 420]]), sparkle(520, 120, 16),
), { label: "A little owl is tangled in twigs" });
