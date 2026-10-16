import { C, svg, wc, sky, stars, moon, cloud, hill, pine, roundTree, flower, grassTufts, firefly, jason, phoebus, sparkle, lines } from "../lib.mjs";

export default () => svg(lines(
  sky(),
  stars(11, 70, 380),
  cloud(250, 330, 1.3), cloud(780, 250, 1, 0.16),
  moon(850, 420, 54),
  wc(lines(
    hill(560, 26, "url(#gHill1)", 3),
    [80, 210, 330, 700, 850, 950].map((x, i) => pine(x, 640 + (i % 2) * 14, 190 + (i * 37) % 70, "#34507a")).join(""),
    hill(640, 22, "url(#gHill2)", 5, 1),
    [130, 280, 760, 900].map((x, i) => pine(x, 700 + (i % 3) * 8, 230 + (i * 29) % 60, "#2f5546")).join(""),
    hill(740, 20, "url(#gHill3)", 8, 2),
  )),
  wc(`<path d="M390 1000 Q450 900 520 840 Q590 780 560 740 Q540 712 575 690 L620 692 Q590 716 612 750 Q650 800 590 860 Q540 930 620 1000Z" fill="url(#gPath)"/><path d="M560 1000 Q520 930 570 870" stroke="#fff6d8" stroke-width="5" fill="none" opacity=".5"/>`),
  grassTufts(4, 40, 780, 980),
  flower(150, 900, 1.5, C.lavender, true), flower(250, 960, 1.2, C.goldSoft, true), flower(860, 930, 1.5, C.lavender, true), flower(760, 990, 1.1, C.goldSoft, true),
  phoebus({ x: 700, y: 925, s: 0.98, flip: true }),
  jason({ x: 330, y: 940, s: 1.05, look: [1, -0.4], armR: 18, armL: 30, walk: 0.5 }),
  [[560, 700], [700, 650], [330, 760], [800, 740], [905, 700], [120, 700]].map(([x, y], i) => firefly(x, y, 0.9 + (i % 3) * 0.2)).join(""),
  sparkle(600, 640, 26), sparkle(380, 600, 18),
), { label: "Jason and Phoebus walk a golden path into the magic forest" });
