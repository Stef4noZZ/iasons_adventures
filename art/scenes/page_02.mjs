import { C, svg, wc, sky, stars, moon, cloud, hill, pine, flower, grassTufts, firefly, jason, sparkle, up, lines } from "../lib.mjs";

export default () => svg(lines(
  sky("gDusk"), stars(31, 40, 300), moon(220, 150, 44), cloud(720, 170, 1.1),
  up(250, lines(
    wc(lines(
      hill(430, 22, "url(#gHill1)", 4),
      [60, 170, 290, 640, 760, 880, 960].map((x, i) => pine(x, 520 + (i % 2) * 12, 200 + (i * 41) % 90, "#34507a")).join(""),
      hill(520, 18, "url(#gHill2)", 9, 1),
      [110, 400, 600, 830].map((x, i) => pine(x, 590, 240 + (i * 23) % 60, "#2f5546")).join(""),
      `<ellipse cx="500" cy="530" rx="120" ry="60" fill="url(#gGlow)"/>`,
      hill(600, 16, "url(#gHill3)", 2, 3),
    )),
    wc(`<path d="M470 560 Q500 580 480 600 Q430 640 500 700 Q620 770 480 860 Q400 920 330 1000 L660 1000 Q640 930 700 880 Q790 800 640 730 Q560 690 560 640 Q560 590 540 560Z" fill="url(#gPath)"/>`),
    `<path d="M505 600 Q470 650 530 700" stroke="#fff6d8" stroke-width="5" fill="none" opacity=".6"/>`,
    grassTufts(6, 45, 620, 880),
    [[110, 880, 1.4], [220, 860, 1.1], [820, 880, 1.4], [900, 840, 1.1], [140, 720, 0.9], [860, 730, 0.9], [60, 790, 1]].map(([x, y, s], i) => flower(x, y, s, i % 2 ? C.goldSoft : C.lavender, true)).join(""),
  )),
  jason({ x: 400, y: 590, s: 0.9, look: [1, -0.2], armR: 25, armL: 10, walk: 0.7, mouth: "open" }),
  [[480, 450], [560, 520], [540, 400], [380, 420], [690, 480], [300, 500]].map(([x, y], i) => firefly(x, y, 1 + (i % 2) * 0.3)).join(""),
  sparkle(520, 380, 24), sparkle(470, 520, 16), sparkle(610, 580, 20),
), { label: "A golden path appears in the garden" });
