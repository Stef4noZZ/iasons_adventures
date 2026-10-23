// Makes small web JPEGs next to each book (public/stories/<id>/images, or unreleased/stories/<id>/images)
// from the full-resolution masters in assets/stories/<id>/images.
import { mkdirSync, readdirSync } from "node:fs";
import { join, parse } from "node:path";
import sharp from "sharp";
import { findBook, root } from "./books.mjs";

const ID = process.argv[2] ?? "iasons_and_the_magic_forest";
const src = join(root, "assets", "stories", ID, "images");
const book = findBook(ID);
if (!book) throw new Error(`No book folder for '${ID}'`);
const out = join(book.dir, "images");
mkdirSync(out, { recursive: true });

for (const file of readdirSync(src).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))) {
  await sharp(join(src, file)).resize(1400).jpeg({ quality: 84, mozjpeg: true }).toFile(join(out, `${parse(file).name}.jpg`));
  console.log(file);
}
