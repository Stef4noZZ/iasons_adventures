// Usage: npm run export:pdf [-- --lang el|en|all --mode mode1|mode2|all --proof]
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { build, preview } from "vite";
import { chromium } from "playwright-core";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const pick = (value, all) => (value === "all" ? all : [value]);
const langs = pick(arg("lang", "all"), ["el", "en"]);
const modes = pick(arg("mode", "all"), ["mode1", "mode2"]);
const proof = process.argv.includes("--proof");

const outDir = join(import.meta.dirname, "..", "exports");
mkdirSync(outDir, { recursive: true });

await build({ logLevel: "warn" });
const server = await preview({ preview: { port: 4173, strictPort: false } });
const base = server.resolvedUrls.local[0];
const browser = await chromium.launch({ channel: "chrome" });

try {
  for (const lang of langs) {
    for (const mode of modes) {
      const page = await browser.newPage();
      await page.goto(`${base}print.html?lang=${lang}&mode=${mode}${proof ? "&proof=1" : ""}`);
      await page.waitForSelector("body[data-ready]");
      const file = join(outDir, `iasons_and_the_magic_forest_${lang}_${mode}${proof ? "_proof" : ""}.pdf`);
      await page.pdf({ path: file, width: "216mm", height: "216mm", printBackground: true, preferCSSPageSize: true });
      console.log(file);
      await page.close();
    }
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
