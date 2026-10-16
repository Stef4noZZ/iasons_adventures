import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { imageSize } from "image-size";
import { validateStory } from "../src/core/story.js";

const ID = process.argv[2] ?? "iasons_and_the_magic_forest";
const dir = join(import.meta.dirname, "..", "public", "stories", ID);
const story = JSON.parse(readFileSync(join(dir, "story.json"), "utf8"));

const [w, h] = story.trim_size_cm;
const BLEED_MM = 3;
const minPx = Math.round(((w * 10 + 2 * BLEED_MM) / 25.4) * 300); // 300 dpi incl. bleed

const errors = validateStory(story);
const warnings = [];

const files = [["cover", story.cover_image], ...story.pages.map((p) => [p.id, p.image])];
for (const [label, name] of files) {
  const path = join(dir, "images", name);
  if (!existsSync(path)) {
    warnings.push(`${label}: missing image ${name}`);
    continue;
  }
  const { width, height } = imageSize(readFileSync(path));
  if (width !== height) warnings.push(`${label}: not square (${width}x${height})`);
  if (Math.min(width, height) < minPx) warnings.push(`${label}: ${width}x${height}px is below ${minPx}px needed for 300 dpi print`);
}

console.log(`${story.title.en}: ${story.pages.length} pages, ${files.filter(([, n]) => existsSync(join(dir, "images", n))).length}/${files.length} images`);
const missing = warnings.filter((m) => m.includes("missing image"));
if (missing.length === files.length) console.log("WARN  no images yet; expected in public/stories/%s/images/", ID);
else missing.forEach((m) => console.log(`WARN  ${m}`));
warnings.filter((m) => !missing.includes(m)).forEach((m) => console.log(`WARN  ${m}`));
errors.forEach((m) => console.error(`ERROR ${m}`));
process.exit(errors.length ? 1 : 0);
