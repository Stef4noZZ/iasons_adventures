// Usage: node art/build.mjs [--only page_03] [--size 2551]
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const only = arg("only");
const size = Number(arg("size", 2551));
const scenesDir = join(import.meta.dirname, "scenes");
const outDir = join(import.meta.dirname, "..", "assets", "stories", "iasonas_and_the_magic_forest", "images");
const svgDir = join(import.meta.dirname, "dist");
mkdirSync(outDir, { recursive: true });
mkdirSync(svgDir, { recursive: true });

const names = readdirSync(scenesDir).filter((f) => f.endsWith(".mjs")).map((f) => f.replace(".mjs", "")).filter((n) => !only || n === only);
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: size / 1000 });
for (const name of names) {
  const scene = (await import(pathToFileURL(join(scenesDir, `${name}.mjs`)))).default();
  writeFileSync(join(svgDir, `${name}.svg`), scene);
  await page.setContent(`<body style="margin:0;background:#fff">${scene}</body>`);
  await page.locator("svg").screenshot({ path: join(outDir, `${name}.png`) });
  console.log(name);
}
await browser.close();
