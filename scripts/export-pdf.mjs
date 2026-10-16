// Usage: npm run export:pdf [-- --story <id|all> --lang el|en|all --mode mode1|mode2|all --proof]
import { cpSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { build, preview } from "vite";
import { chromium } from "playwright-core";

const root = join(import.meta.dirname, "..");
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const pick = (value, all) => (value === "all" ? all : [value]);
const series = JSON.parse(readFileSync(join(root, "public", "series.json"), "utf8"));
const stories = pick(arg("story", "all"), series.stories);
const langs = pick(arg("lang", "all"), ["el", "en"]);
const modes = pick(arg("mode", "all"), ["mode1", "mode2"]);
const proof = process.argv.includes("--proof");

const outDir = join(root, "exports");
mkdirSync(outDir, { recursive: true });

await build({ logLevel: "warn" });
for (const id of stories) {
  const masters = join(root, "assets", "stories", id, "images");
  if (existsSync(masters)) cpSync(masters, join(root, "dist", "stories", id, "images-print"), { recursive: true });
}
const server = await preview({ preview: { port: 4173, strictPort: false } });
const base = server.resolvedUrls.local[0];
const browser = await chromium.launch({ channel: "chrome" });

try {
  for (const id of stories) {
    for (const lang of langs) {
      for (const mode of modes) {
        const page = await browser.newPage();
        await page.goto(`${base}print.html?story=${id}&lang=${lang}&mode=${mode}${proof ? "&proof=1" : ""}`);
        await page.waitForSelector("body[data-ready]");
        const file = join(outDir, `${id}_${lang}_${mode}${proof ? "_proof" : ""}.pdf`);
        await page.pdf({ path: file, width: "216mm", height: "216mm", printBackground: true, preferCSSPageSize: true });
        console.log(file);
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
