import { C, svg, wc, sky, stars, moon, hill, pine, grassTufts, stream, stone, jason, phoebus, flies, sparkle, up, lines } from "../lib.mjs";

export default () => svg(lines(
  sky(), stars(91, 40, 240), moon(180, 110, 42),
  up(240, lines(
    wc(lines(hill(380, 20, "url(#gHill1)", 8), [70, 170, 840, 940].map((x, i) => pine(x, 500, 300 + (i * 31) % 50, "#2f5546")).join(""), hill(520, 18, "url(#gHill2)", 3, 2))),
    `<rect y="540" width="1000" height="960" fill="url(#gGround)"/>`,
    wc(stream(540, 260, 5)),
    grassTufts(9, 18, 820, 900),
    [[260, 690, 80], [420, 640, 80], [580, 700, 80], [740, 650, 80], [860, 720, 70]].map(([x, y, w]) => stone(x, y, w)).join(""),
  )),
  jason({ x: 480, y: 410, s: 0.62, look: [1.3, 0], armR: 60, armL: 60, mouth: "open", walk: 0.6 }),
  phoebus({ x: 660, y: 465, s: 0.6, flip: true }),
  flies([[180, 330], [820, 350], [560, 300]]), sparkle(360, 400, 14), sparkle(780, 520, 14),
), { label: "Jason steps on glowing stones to cross the stream" });
