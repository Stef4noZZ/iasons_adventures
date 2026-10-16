import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { validateStory } from "../src/core/story.js";
import { DEFAULTS, loadSettings, sanitize } from "../src/core/settings.js";
import { t } from "../src/core/i18n.js";

const story = () =>
  JSON.parse(readFileSync("public/stories/iasons_and_the_magic_forest/story.json", "utf8"));

describe("validateStory", () => {
  it("accepts the bundled story", () => {
    expect(validateStory(story())).toEqual([]);
  });

  it("reports a missing translation", () => {
    const s = story();
    delete s.pages[3].text.en.mode2;
    expect(validateStory(s)).toEqual(["Page 'page_04' missing text en/mode2."]);
  });

  it("reports wrong page count and numbering", () => {
    const s = story();
    s.pages.pop();
    s.pages[0].number = 9;
    const errors = validateStory(s);
    expect(errors).toContain("Expected 16 pages, found 15.");
    expect(errors).toContain("Page 'page_01' must have number=1.");
  });
});

describe("settings", () => {
  it("falls back to defaults for invalid values", () => {
    expect(sanitize({ uiLang: "fr", mode: "x", position: -3, narration: 0 })).toEqual({
      ...DEFAULTS,
      narration: false,
    });
  });

  it("recovers from corrupt storage", () => {
    expect(loadSettings({ getItem: () => "{oops" })).toEqual(DEFAULTS);
  });
});

describe("i18n", () => {
  it("interpolates variables", () => {
    expect(t("en", "pageOf", { current: 2, total: 16 })).toBe("Page 2 of 16");
  });
});
