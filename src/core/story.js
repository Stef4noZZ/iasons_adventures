export const LANGUAGES = ["el", "en"];
export const MODES = ["mode1", "mode2"];
export const STORY_ID = "iasons_and_the_magic_forest";

export const storyBase = (id = STORY_ID) => `${import.meta.env?.BASE_URL ?? "/"}stories/${id}`;

export async function fetchStory(id = STORY_ID) {
  const response = await fetch(`${storyBase(id)}/story.json`);
  if (!response.ok) throw new Error(`Story not found: ${id}`);
  return response.json();
}

export function pageText(page, lang, mode) {
  return page.text[lang][mode];
}

export function imageUrl(story, name) {
  return name ? `${storyBase(story.id)}/images/${name}` : null;
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
  });
  return errors;
}
