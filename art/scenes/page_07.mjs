import { C, svg, wc, sky, stars, moon, hill, pine, roundTree, grassTufts, flower, stream, stone, jason, phoebus, flies, sparkle, up, lines } from "../lib.mjs";

export default () => svg(lines(
  sky(), stars(81, 40, 240), moon(500, 120, 50),
  up(240, lines(
    wc(lines(hill(380, 20, "url(#gHill1)", 8), [70, 170, 840, 940].map((x, i) => pine(x, 500, 300 + (i * 31) % 50, "#2f5546")).join(""), hill(520, 18, "url(#gHill2)", 3, 2))),
    `<rect y="540" width="1000" height="960" fill="url(#gGround)"/>`,
    wc(stream(560, 150, 5)),
    `<ellipse cx="500" cy="590" rx="260" ry="50" fill="url(#gGlowW)" opacity=".35"/>`,
    grassTufts(7, 25, 730, 880),
  )),
  jason({ x: 340, y: 600, s: 0.8, look: [1, -0.1], armR: 80, armL: 20, mouth: "calm" }),
  phoebus({ x: 560, y: 600, s: 0.8, flip: true }),
  flies([[160, 380], [800, 400], [680, 330]]), sparkle(500, 410, 16), sparkle(300, 470, 12), sparkle(740, 440, 14),
), { label: "The friends reach a little singing stream" });
