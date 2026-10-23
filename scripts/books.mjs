// Finds every book: released ones in public/stories, unreleased ones in the git-ignored unreleased/stories.
import { existsSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

export const root = join(import.meta.dirname, "..");

const foldersIn = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory() && existsSync(join(dir, e.name, "story.json"))).map((e) => e.name)
    : [];

export function listBooks() {
  const books = (base, released) => foldersIn(join(root, base)).map((id) => ({ id, released, dir: join(root, base, id) }));
  return [...books("public/stories", true), ...books("unreleased/stories", false)];
}

export const findBook = (id) => listBooks().find((book) => book.id === id);
export const promptsFile = (book) => join(root, book.released ? "docs/prompts" : "unreleased/prompts", `${book.id}.md`);
export const rel = (path) => relative(root, path);
