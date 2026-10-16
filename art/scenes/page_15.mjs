import { C, svg, wc, sky, stars, moon, hill, pine, grassTufts, flower, jason, phoebus, flies, sparkle, up, lines } from "../lib.mjs";

const fence = (x0, x1, y) => lines(
  `<rect x="${x0}" y="${y - 20}" width="${x1 - x0}" height="12" rx="5" fill="#d9c7a0"/><rect x="${x0}" y="${y + 30}" width="${x1 - x0}" height="12" rx="5" fill="#d9c7a0"/>`,
  Array.from({ length: Math.floor((x1 - x0) / 56) }, (_, i) => `<rect x="${x0 + 14 + i * 56}" y="${y - 70}" width="26" height="130" rx="10" fill="#e8dcc0"/>`).join(""),
);
export default () => svg(lines(
  sky("gDusk"), stars(161, 30, 220), moon(830, 110, 36),
  up(240, lines(
    wc(lines(hill(400, 16, "url(#gHill1)", 4), [80, 170].map((x, i) => pine(x, 520, 320, "#2f5546")).join(""), hill(540, 14, "url(#gHill2)", 2, 1))),
    `<rect y="560" width="1000" height="940" fill="url(#gGround)"/>`,
    // house with a lit window
    `<g filter="url(#wcs)"><rect x="700" y="330" width="230" height="230" fill="#e9dcc3"/><path d="M680 340 L815 230 L950 340Z" fill="#a85a4a"/><rect x="780" y="400" width="70" height="90" rx="10" fill="#ffd978"/><rect x="812" y="400" width="6" height="90" fill="#a3825a"/></g>`,
    wc(fence(430, 700, 560)),
    grassTufts(20, 30, 620, 880),
    [[120, 820, 1.3], [300, 850, 1.1], [900, 840, 1.2]].map(([x, y, s], i) => flower(x, y, s, i % 2 ? C.goldSoft : C.lavender, true)).join(""),
  )),
  jason({ x: 590, y: 595, s: 0.9, flip: true, look: [-1.2, 0], armL: 150, armR: 30, mouth: "smile" }),
  phoebus({ x: 250, y: 595, s: 0.9, tail: 8 }),
  flies([[380, 400], [320, 330], [480, 430]]), sparkle(420, 480, 16), sparkle(330, 400, 12),
), { label: "Jason says goodbye to Phoebus at the edge of the garden" });
