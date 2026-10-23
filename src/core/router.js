// Hash routes: "#/" home, "#/<story>" cover, "#/<story>/<n>" page n (n = pages + 1 is the end card).
import { renameLegacyId } from "./ids.js";

export const HOME = Object.freeze({ screen: "home" });

export function parseRoute(hash, storyIds) {
  const parts = String(hash ?? "").replace(/^#\/?/, "").split("/").filter(Boolean);
  const [rawId, n] = parts;
  const id = storyIds.includes(rawId) ? rawId : renameLegacyId(rawId); // links made before the rename still open
  if (!id || !storyIds.includes(id)) return HOME;
  const position = n === undefined ? 0 : Number(n);
  return { screen: "book", id, position: Number.isInteger(position) && position >= 0 ? position : 0 };
}

export function formatRoute(route) {
  if (route.screen !== "book") return "#/";
  return route.position > 0 ? `#/${route.id}/${route.position}` : `#/${route.id}`;
}
