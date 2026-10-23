// Parent voice recordings, kept on the device in IndexedDB (never uploaded).
import { renameLegacyId } from "./ids.js";

const DB_NAME = "iasonas-recordings";
const LEGACY_DB_NAME = "iasons-recordings";
const STORE = "clips";

export const clipKey = (storyId, lang, mode, pageId) => [storyId, lang, mode, pageId].join("/");

function open(idb) {
  return new Promise((resolve, reject) => {
    const request = idb.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "key" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run(idb, mode, work) {
  const db = await open(idb);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = work(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(request?.result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

/** clip: { key, storyId, lang, mode, pageId, blob, createdAt } */
export const saveClip = (clip, idb = globalThis.indexedDB) => run(idb, "readwrite", (store) => store.put(clip));
export const deleteClip = (key, idb = globalThis.indexedDB) => run(idb, "readwrite", (store) => store.delete(key));

export async function listClips(storyId, idb = globalThis.indexedDB) {
  const all = await run(idb, "readonly", (store) => store.getAll());
  return all.filter((clip) => clip.storyId === storyId);
}

async function toBase64(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

function fromBase64(data, type) {
  const binary = atob(data);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new Blob([bytes], { type });
}

/** Backup file: one JSON document with the audio inlined as base64. */
export async function exportClips(storyId, idb = globalThis.indexedDB) {
  const clips = await listClips(storyId, idb);
  const items = await Promise.all(clips.map(async ({ lang, mode, pageId, blob }) => ({
    lang, mode, pageId, type: blob.type, data: await toBase64(blob),
  })));
  return JSON.stringify({ version: 1, storyId, clips: items });
}

export async function importClips(json, idb = globalThis.indexedDB) {
  const file = JSON.parse(json);
  if (file?.version !== 1 || typeof file.storyId !== "string" || !Array.isArray(file.clips)) {
    throw new Error("Not a recordings backup file.");
  }
  const storyId = renameLegacyId(file.storyId); // backups made before the rename still import
  let count = 0;
  for (const { lang, mode, pageId, type, data } of file.clips) {
    if (![lang, mode, pageId, type, data].every((value) => typeof value === "string")) continue;
    await saveClip({
      key: clipKey(storyId, lang, mode, pageId), storyId, lang, mode, pageId,
      blob: fromBase64(data, type), createdAt: Date.now(),
    }, idb);
    count++;
  }
  return { storyId, count };
}

/** Clips from the database used before the rename; [] when there is none (and none is created). */
async function readLegacyClips(idb) {
  if (typeof idb.databases === "function") {
    const names = (await idb.databases()).map((db) => db.name);
    if (!names.includes(LEGACY_DB_NAME)) return [];
  }
  const db = await new Promise((resolve) => {
    const request = idb.open(LEGACY_DB_NAME);
    request.onupgradeneeded = () => request.transaction.abort(); // it did not exist: do not create it
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
  if (!db) return [];
  if (!db.objectStoreNames.contains(STORE)) {
    db.close();
    return [];
  }
  const clips = await new Promise((resolve, reject) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return clips;
}

/**
 * Copies recordings made before the rename into the current database, under the new book ids.
 * The old database is left untouched, and clips already present in the new one are not overwritten.
 */
export async function migrateLegacyRecordings(idb = globalThis.indexedDB) {
  const legacy = await readLegacyClips(idb);
  if (!legacy.length) return 0;
  const existing = new Set(await run(idb, "readonly", (store) => store.getAllKeys()));
  let copied = 0;
  for (const clip of legacy) {
    const storyId = renameLegacyId(clip.storyId);
    const key = clipKey(storyId, clip.lang, clip.mode, clip.pageId);
    if (existing.has(key)) continue;
    await saveClip({ ...clip, key, storyId }, idb);
    copied++;
  }
  return copied;
}
