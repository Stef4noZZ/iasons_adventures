import { IDBFactory } from "fake-indexeddb";
import { describe, expect, it } from "vitest";
import { renameLegacyId } from "../src/core/ids.js";
import { parseRoute } from "../src/core/router.js";
import { exportClips, importClips, listClips, migrateLegacyRecordings, saveClip } from "../src/core/recordings.js";
import { loadSettings, migrateSettings } from "../src/core/settings.js";

const OLD = "iasons_and_the_magic_forest";
const NEW = "iasonas_and_the_magic_forest";

const memoryStorage = (initial = {}) => {
  const data = { ...initial };
  return { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => (data[k] = String(v)), data };
};

/** Creates the database the app used before the rename, with the given clips. */
function createLegacyDb(idb, clips) {
  return new Promise((resolve, reject) => {
    const request = idb.open("iasons-recordings", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("clips", { keyPath: "key" });
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("clips", "readwrite");
      clips.forEach((clip) => tx.objectStore("clips").put(clip));
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
}

const legacyClip = (pageId, text = "voice") => ({
  key: `${OLD}/el/mode1/${pageId}`, storyId: OLD, lang: "el", mode: "mode1", pageId,
  blob: new Blob([text], { type: "audio/webm" }), createdAt: 1,
});

describe("renameLegacyId", () => {
  it("translates old ids and leaves new or other values alone", () => {
    expect(renameLegacyId(OLD)).toBe(NEW);
    expect(renameLegacyId(NEW)).toBe(NEW);
    expect(renameLegacyId("something_else")).toBe("something_else");
    expect(renameLegacyId(null)).toBe(null);
  });
});

describe("old links", () => {
  it("open the renamed book", () => {
    expect(parseRoute(`#/${OLD}/5`, [NEW])).toEqual({ screen: "book", id: NEW, position: 5 });
    expect(parseRoute(`#/${NEW}`, [NEW])).toEqual({ screen: "book", id: NEW, position: 0 });
    expect(parseRoute("#/unknown/5", [NEW])).toEqual({ screen: "home" });
  });
});

describe("saved settings", () => {
  const legacy = JSON.stringify({ uiLang: "en", storyId: OLD, progress: { [OLD]: { position: 7, lastRead: 7, finished: true } } });

  it("are carried over from the old storage entry with new ids", () => {
    const storage = memoryStorage({ "iasons-adventures:settings": legacy });
    const settings = loadSettings(storage);
    expect(settings.uiLang).toBe("en");
    expect(settings.storyId).toBe(NEW);
    expect(settings.progress[NEW]).toEqual({ position: 7, lastRead: 7, finished: true });
    expect(settings.progress[OLD]).toBeUndefined();
    expect(JSON.parse(storage.data["iasonas-adventures:settings"]).storyId).toBe(NEW);
    expect(storage.data["iasons-adventures:settings"]).toBe(legacy); // old entry is kept
  });

  it("prefer the new entry when both exist", () => {
    const storage = memoryStorage({
      "iasons-adventures:settings": legacy,
      "iasonas-adventures:settings": JSON.stringify({ uiLang: "el" }),
    });
    expect(loadSettings(storage).uiLang).toBe("el");
  });

  it("migrateSettings tolerates missing parts", () => {
    expect(migrateSettings(null)).toBe(null);
    expect(migrateSettings({ uiLang: "el" })).toEqual({ uiLang: "el", storyId: undefined, progress: {} });
  });
});

describe("saved recordings", () => {
  it("are copied from the old database under the new book id, and the old database stays", async () => {
    const idb = new IDBFactory();
    await createLegacyDb(idb, [legacyClip("page_01", "one"), legacyClip("page_02", "two")]);

    expect(await migrateLegacyRecordings(idb)).toBe(2);
    const clips = await listClips(NEW, idb);
    expect(clips.map((c) => c.key).sort()).toEqual([`${NEW}/el/mode1/page_01`, `${NEW}/el/mode1/page_02`]);
    expect(await clips.find((c) => c.pageId === "page_01").blob.text()).toBe("one");
    expect(await listClips(OLD, idb)).toEqual([]);

    const names = (await idb.databases()).map((d) => d.name);
    expect(names).toContain("iasons-recordings");
  });

  it("does not overwrite a recording made after the rename, and can run twice", async () => {
    const idb = new IDBFactory();
    await createLegacyDb(idb, [legacyClip("page_01", "old voice")]);
    await saveClip({ key: `${NEW}/el/mode1/page_01`, storyId: NEW, lang: "el", mode: "mode1", pageId: "page_01", blob: new Blob(["new voice"]), createdAt: 2 }, idb);

    expect(await migrateLegacyRecordings(idb)).toBe(0);
    expect(await migrateLegacyRecordings(idb)).toBe(0);
    const [clip] = await listClips(NEW, idb);
    expect(await clip.blob.text()).toBe("new voice");
  });

  it("does nothing, and creates nothing, when there is no old database", async () => {
    const idb = new IDBFactory();
    expect(await migrateLegacyRecordings(idb)).toBe(0);
    expect((await idb.databases()).map((d) => d.name)).not.toContain("iasons-recordings");
  });

  it("still imports a backup file made before the rename", async () => {
    const source = new IDBFactory();
    await saveClip({ key: `${NEW}/el/mode1/page_03`, storyId: NEW, lang: "el", mode: "mode1", pageId: "page_03", blob: new Blob(["hi"], { type: "audio/webm" }), createdAt: 1 }, source);
    const oldBackup = (await exportClips(NEW, source)).replace(NEW, OLD);
    expect(JSON.parse(oldBackup).storyId).toBe(OLD);

    const target = new IDBFactory();
    expect(await importClips(oldBackup, target)).toEqual({ storyId: NEW, count: 1 });
    expect((await listClips(NEW, target))[0].key).toBe(`${NEW}/el/mode1/page_03`);
  });
});
