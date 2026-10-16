# The Adventures of Little Jason

A series of bilingual (Greek / English) illustrated children's storybooks, inspired by the adventures of little Jason.
First book: *Jason and the Magic Forest*.
One codebase produces the installable web app and the print-ready 21 × 21 cm PDFs.

## Quick start

Requires Node.js 20.19+ or 22.12+ (check with `node -v`).

```bash
npm install --legacy-peer-deps
npm run dev          # app at http://localhost:5173
npm test             # unit tests
npm run validate     # series, story and image checks
npm run export:pdf   # print PDFs into exports/ (needs Google Chrome)
```

## App

- Page-turn reader: arrow keys, swipe, dots, fullscreen, remembers where you stopped (per book).
- App language and story language are independent (Greek / English). Two reading modes: `mode1` bedtime, `mode2` adventure.
- Soft synthesised page-turn and end-of-story sounds (can be switched off in settings), gentle motion that respects the system "reduce motion" setting.
- Optional per-page narration audio (`audio` fields in `story.json`).
- Installable (PWA) and fully offline after the first visit: Chrome/Edge show an "Install" button, on iPad use Share, then Add to Home Screen.
  The service worker is only active in the production build (`npm run build && npm run preview`).
- A library button appears automatically once `series.json` lists more than one book.

## The series

`public/series.json` holds what is shared by every book: series title, copyright holder and year, copyright lines (Greek and English), optional ISBN and the ordered list of books.
Each book lives in `public/stories/<id>/story.json` (its own title, pages, `print` front and back matter) with art in `assets/stories/<id>/images/`.

To add a book: copy the story folder, change the id, title, pages and images, and add the id to `stories` in `series.json`. `npm run validate` checks all of it.
The copyright page text in `series.json` was drafted without input from you, so check it (author credit, year, ISBN, publisher) before printing.

## Print

`npm run export:pdf [-- --story <id|all> --lang el|en|all --mode mode1|mode2|all --proof]` writes `exports/<id>_<lang>_<mode>.pdf`.
Order: cover, title page, copyright page, 16 story pages, "The End" page, series page, back cover.
That is 20 interior pages, a multiple of 4 as printers require (`validate` warns otherwise). Folio numbers match the physical page.
Front and back matter is chosen per book in `story.json` under `print` (`front_matter`, `back_matter`; allowed: `title`, `copyright`, `the_end`, `series`).
Pages are 216 × 216 mm (21 × 21 cm trim + 3 mm bleed each side). The app and the PDF use the same page renderer. `--proof` shows placeholder captions.
Inside covers and spine are not generated; ask your printer for their cover template.

## Illustrations

The current art is hand-coded vector illustration: `art/lib.mjs` holds the characters and scenery, `art/scenes/` one file per page.

```bash
npm run art          # renders 2551 px masters into assets/stories/<id>/images/ and web JPEGs into public/.../images/
node art/build.mjs --only page_03   # one scene
npm run icons        # app icons into public/icons
```

To use your own images instead, put square files named `cover.png` and `page_01.png` ... `page_16.png` in
`assets/stories/<id>/images/` (no text inside the art, at least 2551 px for 300 dpi), then run `npm run images`.
The masters are git-ignored; the app uses the small web JPEGs and the PDF export uses the masters.
Text covers the lower 30% (`mode1`) or 38% (`mode2`) of each page, so keep the subject in the upper area.
The title page shows a round crop of the cover, so the cover's characters should sit in its lower part.

## Structure

```text
index.html, print.html        app and print entry points
src/core/                     story/series validation, settings, sound, UI strings
src/ui/                       page renderers (shared by app and print), placeholder art
src/styles/                   tokens, page, app, print
scripts/                      validate, export-pdf, optimize-images, make-icons
public/series.json            series-wide data
public/stories/<id>/          story.json and web images
public/sw.js, manifest        offline support (the precache list is generated at build time)
assets/stories/<id>/images/   full-resolution masters (git-ignored)
art/                          vector illustration kit and scenes
tests/
```

Reference photos of Jason must stay private (`assets/characters/private_reference_photos/` is git-ignored).
