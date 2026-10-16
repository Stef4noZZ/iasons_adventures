import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { interiorPageCount, validateSeries, validateStory } from "../src/core/story.js";
import { DEFAULTS, loadSettings, progressOf, sanitize } from "../src/core/settings.js";
import { t } from "../src/core/i18n.js";

const json = (path) => JSON.parse(readFileSync(path, "utf8"));
const story = () => json("public/stories/iasons_and_the_magic_forest/story.json");
const series = () => json("public/series.json");

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

  it("rejects image prompts that use unknown characters", () => {
    const s = story();
    s.pages[0].characters.push("dragon");
    s.cover_characters.push("wizard");
    expect(validateStory(s)).toEqual(["Page 'page_01' uses unknown character 'dragon'.", "Cover uses unknown character 'wizard'."]);
  });

  it("rejects unknown print pages", () => {
    const s = story();
    s.print.front_matter.push("dedication");
    expect(validateStory(s)).toEqual(["Unknown print page 'dedication' in front_matter."]);
  });
});

describe("print layout", () => {
  it("makes the bundled book a multiple of 4 interior pages", () => {
    expect(interiorPageCount(story()) % 4).toBe(0);
  });

  it("falls back to default front and back matter", () => {
    const s = story();
    delete s.print;
    expect(interiorPageCount(s)).toBe(20);
  });
});

describe("validateSeries", () => {
  it("accepts the bundled series", () => {
    expect(validateSeries(series())).toEqual([]);
  });

  it("requires copyright details and a story list", () => {
    const s = series();
    s.stories = [];
    delete s.copyright.holder;
    expect(validateSeries(s)).toEqual(["Series: 'stories' must be a non-empty list.", "Series: copyright holder/year missing."]);
  });
});

describe("settings", () => {
  it("falls back to defaults for invalid values", () => {
    expect(sanitize({ uiLang: "fr", mode: "x", progress: "nope", narration: 0, sound: 0 })).toEqual({
      ...DEFAULTS,
      narration: false,
      sound: false,
    });
  });

  it("keeps progress per story and repairs bad entries", () => {
    const s = sanitize({ progress: { a: { position: 4, lastRead: 4 }, b: { position: -2, lastRead: 0 } } });
    expect(progressOf(s, "a")).toEqual({ position: 4, lastRead: 4 });
    expect(progressOf(s, "b")).toEqual({ position: 0, lastRead: 1 });
    expect(progressOf(s, "unseen")).toEqual({ position: 0, lastRead: 1 });
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
