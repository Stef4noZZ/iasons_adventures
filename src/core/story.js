export const LANGUAGES = ["el", "en"];
export const MODES = ["mode1", "mode2"];
export const PRINT_PAGES = ["title", "copyright", "the_end", "series"];
export const DEFAULT_PRINT = { front_matter: ["title", "copyright"], back_matter: ["the_end", "series"] };

const base = () => import.meta.env?.BASE_URL ?? "/";
export const storyBase = (id) => `${base()}stories/${id}`;

async function getJson(url, what) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${what} not found`);
  return response.json();
}

export const fetchSeries = () => getJson(`${base()}series.json`, "Series");
export const fetchStory = (id) => getJson(`${storyBase(id)}/story.json`, `Story ${id}`);

export function printLayout(story) {
  return { ...DEFAULT_PRINT, ...(story.print ?? {}) };
}

export function pageText(page, lang, mode) {
  return page.text[lang][mode];
}

/** App uses small web JPEGs; print uses the full-resolution masters copied to images-print/ by the exporter. */
export function imageUrl(story, name, { print = false } = {}) {
  if (!name) return null;
  return print ? `${storyBase(story.id)}/images-print/${name}` : `${storyBase(story.id)}/images/${name.replace(/\.\w+$/, ".jpg")}`;
}

const isText = (value) => typeof value === "string" && value.trim() !== "";

/** Pure structural validation; returns error strings. Shared by the app and scripts/validate.mjs. */
export function validateStory(story, { expectedPages = 16 } = {}) {
  const errors = [];
  if (!story || typeof story !== "object") return ["Story root must be an object."];

  for (const key of ["id", "version", "title", "series_title", "cover_image", "pages"]) {
    if (!(key in story)) errors.push(`Missing field: ${key}`);
  }
  for (const field of ["title", "series_title"]) {
    for (const lang of LANGUAGES) {
      if (!isText(story[field]?.[lang])) errors.push(`Missing ${lang} text in '${field}'.`);
    }
  }
  for (const mode of MODES) {
    for (const lang of LANGUAGES) {
      if (!isText(story.modes?.[mode]?.label?.[lang])) errors.push(`Missing label ${mode}/${lang}.`);
    }
  }
  for (const key of ["front_matter", "back_matter"]) {
    for (const name of story.print?.[key] ?? []) {
      if (!PRINT_PAGES.includes(name)) errors.push(`Unknown print page '${name}' in ${key}.`);
    }
  }

  const pages = Array.isArray(story.pages) ? story.pages : [];
  if (!Array.isArray(story.pages)) errors.push("'pages' must be a list.");
  if (pages.length !== expectedPages) {
    errors.push(`Expected ${expectedPages} pages, found ${pages.length}.`);
  }

  const seen = new Set();
  pages.forEach((page, i) => {
    const n = i + 1;
    const id = `page_${String(n).padStart(2, "0")}`;
    if (page.id !== id) errors.push(`Position ${n}: expected id '${id}', found '${page.id}'.`);
    if (seen.has(page.id)) errors.push(`Duplicate page id '${page.id}'.`);
    seen.add(page.id);
    if (page.number !== n) errors.push(`Page '${id}' must have number=${n}.`);
    if (!isText(page.image)) errors.push(`Page '${id}' has no image.`);
    for (const lang of LANGUAGES) {
      for (const mode of MODES) {
        if (!isText(page.text?.[lang]?.[mode])) errors.push(`Page '${id}' missing text ${lang}/${mode}.`);
      }
    }
    for (const name of page.characters ?? []) {
      if (!story.art_direction?.characters?.[name]) errors.push(`Page '${id}' uses unknown character '${name}'.`);
    }
  });
  for (const name of story.cover_characters ?? []) {
    if (!story.art_direction?.characters?.[name]) errors.push(`Cover uses unknown character '${name}'.`);
  }
  return errors;
}

export function validateSeries(series) {
  const errors = [];
  for (const lang of LANGUAGES) {
    if (!isText(series?.title?.[lang])) errors.push(`Series: missing title ${lang}.`);
    if (!Array.isArray(series?.copyright?.lines?.[lang])) errors.push(`Series: missing copyright lines ${lang}.`);
  }
  if (!Array.isArray(series?.stories) || !series.stories.length) errors.push("Series: 'stories' must be a non-empty list.");
  if (!Number.isInteger(series?.slots) || series.slots < (series?.stories?.length ?? 0)) {
    errors.push("Series: 'slots' must be a whole number, at least the number of stories.");
  }
  if (!series?.copyright?.holder || !Number.isInteger(series?.copyright?.year)) errors.push("Series: copyright holder/year missing.");
  return errors;
}

/** Physical interior pages for print; printers want a multiple of 4. */
export function interiorPageCount(story) {
  const { front_matter, back_matter } = printLayout(story);
  return front_matter.length + story.pages.length + back_matter.length;
}
