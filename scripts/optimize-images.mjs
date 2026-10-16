// Makes small web JPEGs (public/.../images) from the full-resolution masters (assets/.../images).
import { mkdirSync, readdirSync } from "node:fs";
import { join, parse } from "node:path";
import sharp from "sharp";

const ID = process.argv[2] ?? "iasons_and_the_magic_forest";
const root = join(import.meta.dirname, "..");
const src = join(root, "assets", "stories", ID, "images");
const out = join(root, "public", "stories", ID, "images");
mkdirSync(out, { recursive: true });

for (const file of readdirSync(src).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))) {
  await sharp(join(src, file)).resize(1400).jpeg({ quality: 84, mozjpeg: true }).toFile(join(out, `${parse(file).name}.jpg`));
  console.log(file);
}
