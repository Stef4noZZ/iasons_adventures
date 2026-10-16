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
- **Record your own voice**: tap the microphone button in the top bar, open a page, press Record and read it aloud. One recording per page, per story language and per reading mode. Dots with a red ring are recorded pages; re-record or delete any time.
  The listen button then plays your voice, and "Read along" in settings plays each page and turns it automatically (good for bedtime).
  Recordings are stored on the device only (IndexedDB), never uploaded. Back up and restore them from Settings, "My voice". Recording needs `localhost` or HTTPS and microphone permission.
- Optional per-page narration audio files (`audio` fields in `story.json`) are used when there is no own recording.
- Installable (PWA) and fully offline after the first visit: Chrome/Edge show an "Install" button, on iPad use Share, then Add to Home Screen.
  The service worker is only active in the production build (`npm run build && npm run preview`).
- A library button appears automatically once `series.json` lists more than one book.

## Publishing (GitHub Pages)

Every push to `main` runs the tests, builds the app and publishes it to GitHub Pages (`.github/workflows/deploy.yml`).
One-time setup: repository **Settings, Pages, Source: GitHub Actions**. The link is `https://<user>.github.io/<repo>/`.
The site is public to anyone with the link. Open it on a phone and use Add to Home Screen to install.
Print PDFs are not published; only the app and the small web images are.

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

To make the images with an AI image tool (for example together with your son), use the ready-made prompts in
[docs/prompts/iasons_and_the_magic_forest.md](docs/prompts/iasons_and_the_magic_forest.md): style, negative prompt, character sheets and one complete prompt per picture.
They are generated from `story.json` (`art_direction`, `cover_prompt`, and `characters` and `image_prompt` on every page); edit them there and run `npm run prompts`.

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
