import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { publicSeries, publicStory } from "../src/core/publish.js";
import { validateStory } from "../src/core/story.js";

const json = (path) => JSON.parse(readFileSync(path, "utf8"));
const story = () => json("public/stories/iasons_and_the_magic_forest/story.json");
const series = () => json("public/series.json");

describe("publish", () => {
  it("removes art prompts from the published story but keeps what the app needs", () => {
    const published = publicStory(story());
    for (const key of ["art_direction", "cover_prompt", "cover_characters"]) expect(published).not.toHaveProperty(key);
    for (const page of published.pages) {
      expect(page).not.toHaveProperty("image_prompt");
      expect(page).not.toHaveProperty("characters");
      expect(page.text.el.mode1).toBeTruthy();
      expect(page.image).toBeTruthy();
    }
    expect(published.title.en).toBe("Jason and the Magic Forest");
    expect(published.print).toEqual(story().print);
  });

  it("does not change the original story", () => {
    const original = story();
    publicStory(original);
    expect(original.art_direction).toBeTruthy();
    expect(original.pages[0].image_prompt).toBeTruthy();
  });

  it("removes the shared art direction from the published series", () => {
    expect(publicSeries(series())).not.toHaveProperty("art_direction");
    expect(publicSeries(series()).stories).toEqual(series().stories);
  });

  it("publishes a story that still validates", () => {
    expect(validateStory(publicStory(story()))).toEqual([]);
  });
});
