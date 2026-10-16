import { IDBFactory } from "fake-indexeddb";
import { describe, expect, it } from "vitest";
import { clipKey, deleteClip, exportClips, importClips, listClips, saveClip } from "../src/core/recordings.js";

const clip = (storyId, pageId, text = "voice") => ({
  key: clipKey(storyId, "el", "mode1", pageId), storyId, lang: "el", mode: "mode1", pageId,
  blob: new Blob([text], { type: "audio/webm" }), createdAt: 1,
});

describe("recordings", () => {
  it("saves, lists per story and deletes", async () => {
    const idb = new IDBFactory();
    await saveClip(clip("a", "page_01"), idb);
    await saveClip(clip("a", "page_02"), idb);
    await saveClip(clip("b", "page_01"), idb);
    expect((await listClips("a", idb)).map((c) => c.pageId).sort()).toEqual(["page_01", "page_02"]);

    await deleteClip(clipKey("a", "el", "mode1", "page_01"), idb);
    expect((await listClips("a", idb)).map((c) => c.pageId)).toEqual(["page_02"]);
    expect(await listClips("b", idb)).toHaveLength(1);
  });

  it("overwrites a clip when re-recorded", async () => {
    const idb = new IDBFactory();
    await saveClip(clip("a", "page_01", "first"), idb);
    await saveClip(clip("a", "page_01", "second"), idb);
    const [only] = await listClips("a", idb);
    expect(await only.blob.text()).toBe("second");
  });

  it("round-trips through a backup file", async () => {
    const source = new IDBFactory();
    await saveClip(clip("a", "page_01", "hello"), source);
    const json = await exportClips("a", source);

    const target = new IDBFactory();
    expect(await importClips(json, target)).toEqual({ storyId: "a", count: 1 });
    const [restored] = await listClips("a", target);
    expect(restored.key).toBe("a/el/mode1/page_01");
    expect(restored.blob.type).toBe("audio/webm");
    expect(await restored.blob.text()).toBe("hello");
  });

  it("rejects files that are not backups", async () => {
    await expect(importClips('{"hello":1}', new IDBFactory())).rejects.toThrow("Not a recordings backup file.");
  });
});
