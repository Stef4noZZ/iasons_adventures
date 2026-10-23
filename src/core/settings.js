import { renameLegacyId } from "./ids.js";
import { LANGUAGES, MODES } from "./story.js";

const KEY = "iasonas-adventures:settings";
const LEGACY_KEY = "iasons-adventures:settings";

export const DEFAULTS = Object.freeze({
  uiLang: "el",
  storyLang: "el",
  mode: "mode1",
  storyId: null,
  progress: {},
  narration: true,
  sound: true,
  readAlong: false,
});

export function sanitize(raw) {
  const s = { ...DEFAULTS, ...(raw && typeof raw === "object" ? raw : {}) };
  if (!LANGUAGES.includes(s.uiLang)) s.uiLang = DEFAULTS.uiLang;
  if (!LANGUAGES.includes(s.storyLang)) s.storyLang = DEFAULTS.storyLang;
  if (!MODES.includes(s.mode)) s.mode = DEFAULTS.mode;
  if (typeof s.storyId !== "string") s.storyId = null;
  const progress = {};
  for (const [id, p] of Object.entries(s.progress && typeof s.progress === "object" ? s.progress : {})) {
    const position = Number.isInteger(p?.position) && p.position >= 0 ? p.position : 0;
    const lastRead = Number.isInteger(p?.lastRead) && p.lastRead >= 1 ? p.lastRead : 1;
    progress[id] = { position, lastRead, finished: p?.finished === true };
  }
  s.progress = progress;
  s.narration = Boolean(s.narration);
  s.sound = Boolean(s.sound);
  s.readAlong = Boolean(s.readAlong);
  return s;
}

export const progressOf = (settings, id) => settings.progress[id] ?? { position: 0, lastRead: 1, finished: false };

/** Settings saved before the rename: same data, with the old book ids translated to the new ones. */
export function migrateSettings(raw) {
  if (!raw || typeof raw !== "object") return raw;
  const progress = {};
  for (const [id, value] of Object.entries(raw.progress && typeof raw.progress === "object" ? raw.progress : {})) {
    progress[renameLegacyId(id)] = value;
  }
  return { ...raw, storyId: renameLegacyId(raw.storyId), progress };
}

export function loadSettings(storage = globalThis.localStorage) {
  try {
    const saved = storage.getItem(KEY);
    if (saved == null) {
      const legacy = storage.getItem(LEGACY_KEY);
      if (legacy != null) {
        const migrated = sanitize(migrateSettings(JSON.parse(legacy)));
        storage.setItem(KEY, JSON.stringify(migrated)); // the old entry stays untouched as a fallback
        return migrated;
      }
    }
    return sanitize(JSON.parse(saved));
  } catch {
    return sanitize(null);
  }
}

export function saveSettings(settings, storage = globalThis.localStorage) {
  try {
    storage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Storage may be unavailable (private mode); the app still works.
  }
}
