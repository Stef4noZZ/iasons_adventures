// Usage: npm run validate [-- <story-id>]  (default: every story in series.json)
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { imageSize } from "image-size";
import { interiorPageCount, validateSeries, validateStory } from "../src/core/story.js";

const root = join(import.meta.dirname, "..");
const readJson = (...parts) => JSON.parse(readFileSync(join(root, ...parts), "utf8"));
const BLEED_MM = 3;

const series = readJson("public", "series.json");
let failed = false;

function report(label, errors, warnings) {
  warnings.forEach((m) => console.log(`WARN  ${label}: ${m}`));
  errors.forEach((m) => console.error(`ERROR ${label}: ${m}`));
  failed ||= errors.length > 0;
}

const unregistered = readdirSync(join(root, "public", "stories"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !series.stories.includes(entry.name) && existsSync(join(root, "public", "stories", entry.name, "story.json")))
  .map((entry) => entry.name);
report("series", validateSeries(series), unregistered.map((id) => `story '${id}' exists but is not in "stories" (it will not show on the home screen yet)`));

for (const id of process.argv[2] ? [process.argv[2]] : [...series.stories, ...unregistered]) {
  const story = readJson("public", "stories", id, "story.json");
  const masters = join(root, "assets", "stories", id, "images");
  const web = join(root, "public", "stories", id, "images");
  const minPx = Math.round(((story.trim_size_cm[0] * 10 + 2 * BLEED_MM) / 25.4) * 300); // 300 dpi incl. bleed

  const errors = validateStory(story, { sharedCharacters: series.art_direction?.characters });
  const warnings = [];
  const interior = interiorPageCount(story);
  if (interior % 4) warnings.push(`${interior} interior pages; printers usually need a multiple of 4`);

  const files = [["cover", story.cover_image], ...story.pages.map((p) => [p.id, p.image])];
  const present = files.filter(([, name]) => existsSync(join(masters, name)));
  if (!present.length) warnings.push(`no images yet; expected in assets/stories/${id}/images/`);
  for (const [name, file] of present) {
    if (!existsSync(join(web, file.replace(/\.\w+$/, ".jpg")))) warnings.push(`${name}: no web version, run npm run images`);
    const { width, height } = imageSize(readFileSync(join(masters, file)));
    if (width !== height) warnings.push(`${name}: not square (${width}x${height})`);
    if (Math.min(width, height) < minPx) warnings.push(`${name}: ${width}x${height}px is below ${minPx}px needed for 300 dpi print`);
  }
  if (present.length && present.length < files.length) warnings.push(`missing images: ${files.filter((f) => !present.includes(f)).map(([n]) => n).join(", ")}`);

  console.log(`${story.title.en}: ${story.pages.length} story pages, ${interior} interior pages, ${present.length}/${files.length} images`);
  report(id, errors, warnings);
}

process.exit(failed ? 1 : 0);
