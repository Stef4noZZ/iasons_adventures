# Jason and the Magic Forest

A bilingual (Greek / English) illustrated children's storybook, inspired by the adventures of little Jason.
One codebase produces both the interactive web app and the print-ready 21 × 21 cm PDF.

## Quick start

```bash
npm install --legacy-peer-deps
npm run dev          # app at http://localhost:5173
npm test             # unit tests
npm run validate     # story content + image checks
npm run export:pdf   # print PDFs into exports/ (needs Google Chrome)
```

## Features

- Page-turn reader: arrow keys, swipe, dots, fullscreen, remembers where you stopped.
- App language and story language are independent (Greek / English).
- Two reading modes: `mode1` bedtime story, `mode2` adventure story.
- Optional per-page narration audio (`audio` fields in `story.json`).
- 17 illustrated scenes (cover and 16 pages); a placeholder scene is used for any missing image.

## Print

`npm run export:pdf [-- --lang el|en|all --mode mode1|mode2|all --proof]` writes
`exports/iasons_and_the_magic_forest_<lang>_<mode>.pdf`: cover, 16 pages, back cover.
Pages are 216 × 216 mm (21 × 21 cm trim + 3 mm bleed each side). The app and the PDF use the same page renderer.
`--proof` shows placeholder captions.

## Illustrations

The current art is hand-coded vector illustration: `art/lib.mjs` holds the characters and scenery, `art/scenes/` one file per page.

```bash
npm run art          # renders 2551 px masters into assets/stories/<id>/images/ and web JPEGs into public/.../images/
node art/build.mjs --only page_03   # one scene
```

To use your own images instead, put square files named `cover.png` and `page_01.png` ... `page_16.png` in
`assets/stories/iasons_and_the_magic_forest/images/` (no text inside the art, at least 2551 px for 300 dpi), then run `npm run images`.
The masters are git-ignored; the app uses the small web JPEGs and the PDF export uses the masters.
Text covers the lower 30% (`mode1`) or 38% (`mode2`) of each page, so keep the subject in the upper area. `npm run validate` checks everything.

## Structure

```text
index.html, print.html        app and print entry points
src/core/                     story validation, settings, UI strings
src/ui/                       page renderer (shared by app and print), placeholder art
src/styles/                   tokens, page, app, print
scripts/                      validate.mjs, export-pdf.mjs
public/stories/<id>/          story.json and web images
assets/stories/<id>/images/   full-resolution masters (git-ignored)
art/                          vector illustration kit and scenes
tests/
```

The story schema is documented implicitly by `validateStory` in `src/core/story.js`.
Reference photos of Jason must stay private (`assets/characters/private_reference_photos/` is git-ignored).
