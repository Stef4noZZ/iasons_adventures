import { LANGUAGES, MODES } from "./story.js";

const KEY = "iasons-adventures:settings";

export const DEFAULTS = Object.freeze({
  uiLang: "el",
  storyLang: "el",
  mode: "mode1",
  position: 0,
  lastRead: 1,
  narration: true,
});

export function sanitize(raw) {
  const s = { ...DEFAULTS, ...(raw && typeof raw === "object" ? raw : {}) };
  if (!LANGUAGES.includes(s.uiLang)) s.uiLang = DEFAULTS.uiLang;
  if (!LANGUAGES.includes(s.storyLang)) s.storyLang = DEFAULTS.storyLang;
  if (!MODES.includes(s.mode)) s.mode = DEFAULTS.mode;
  s.position = Number.isInteger(s.position) && s.position >= 0 ? s.position : 0;
  s.lastRead = Number.isInteger(s.lastRead) && s.lastRead >= 1 ? s.lastRead : 1;
  s.narration = Boolean(s.narration);
  return s;
}

export function loadSettings(storage = globalThis.localStorage) {
  try {
    return sanitize(JSON.parse(storage.getItem(KEY)));
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(settings, storage = globalThis.localStorage) {
  try {
    storage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Storage may be unavailable (private mode); the app still works.
  }
}
