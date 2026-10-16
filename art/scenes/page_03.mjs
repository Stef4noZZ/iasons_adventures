import { C, svg, wc, sky, stars, moon, hill, pine, roundTree, flower, grassTufts, firefly, mushroom, jason, phoebus, sparkle, up, lines } from "../lib.mjs";

export default () => svg(lines(
  sky(), stars(41, 36, 260), moon(800, 110, 38),
  up(240, lines(
    wc(lines(
      hill(360, 20, "url(#gHill1)", 6),
      [40, 150, 860, 960].map((x, i) => pine(x, 520, 330 + (i * 31) % 60, "#2f5546")).join(""),
      [250, 740].map((x) => roundTree(x, 540, 300, "#4f7a58", "#7ea67c")).join(""),
      hill(530, 18, "url(#gHill2)", 13, 2),
    )),
    `<ellipse cx="500" cy="640" rx="360" ry="110" fill="url(#gGlow)" opacity=".35"/>`,
    `<rect y="560" width="1000" height="940" fill="url(#gGround)"/>`,
    grassTufts(8, 40, 580, 860),
    [[90, 820, 1.2], [880, 830, 1.3], [200, 850, 1.1], [800, 860, 1]].map(([x, y, s], i) => flower(x, y, s, i % 2 ? C.goldSoft : C.lavender, true)).join(""),
  )),
  mushroom(110, 560, 1.2), mushroom(150, 580, 0.8, "#c98fd0"), mushroom(900, 570, 1.1),
  jason({ x: 330, y: 585, s: 0.9, look: [1.2, 0], armR: 120, armL: 20, mouth: "open" }),
  phoebus({ x: 680, y: 590, s: 0.95, flip: true, tail: -6 }),
  [[480, 400], [560, 360], [440, 330], [600, 470], [250, 420], [790, 400]].map(([x, y], i) => firefly(x, y, 1 + (i % 2) * 0.3)).join(""),
  sparkle(510, 330, 22), sparkle(560, 450, 16),
), { label: "Jason meets Phoebus the fox" });
