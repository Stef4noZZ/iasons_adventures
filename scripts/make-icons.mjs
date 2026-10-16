// Renders the app icons from the illustration kit into public/icons. Run: npm run icons
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { C, hill, lines, sparkle, star, svg, wc } from "../art/lib.mjs";

const icon = (starScale) => svg(lines(
  `<rect width="1000" height="1000" fill="url(#gSky)"/>`,
  `<circle cx="500" cy="480" r="420" fill="url(#gGlow)" opacity=".8"/>`,
  wc(lines(hill(780, 30, "url(#gHill2)", 3), hill(870, 24, "url(#gHill3)", 7, 2))),
  star({ x: 500, y: 460, s: starScale, mood: "glow" }),
  sparkle(210, 250, 34), sparkle(800, 300, 26), sparkle(760, 650, 20),
), { label: "Little Jason" });

const outDir = join(import.meta.dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

const targets = [
  ["icon-192.png", 192, 2.1],
  ["icon-512.png", 512, 2.1],
  ["apple-touch-icon.png", 180, 1.8], // iOS rounds the corners itself
  ["maskable-512.png", 512, 1.5], // star stays inside the safe zone
];

const browser = await chromium.launch({ channel: "chrome" });
for (const [name, size, starScale] of targets) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: size / 1000 });
  await page.setContent(`<body style="margin:0">${icon(starScale)}</body>`);
  await page.locator("svg").screenshot({ path: join(outDir, name) });
  await page.close();
  console.log(name);
}
await browser.close();
