// What the live site publishes: the app needs the story text and layout, not the art prompts.
// The full files stay in the repository; only the built copies are trimmed (see vite.config.js).

export function publicStory(story) {
  const { art_direction, cover_prompt, cover_characters, ...rest } = story;
  return { ...rest, pages: story.pages.map(({ image_prompt, characters, ...page }) => page) };
}

export function publicSeries(series) {
  const { art_direction, ...rest } = series;
  return rest;
}
