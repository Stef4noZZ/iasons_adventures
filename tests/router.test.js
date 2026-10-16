import { describe, expect, it } from "vitest";
import { formatRoute, HOME, parseRoute } from "../src/core/router.js";

const ids = ["forest", "sea"];

describe("parseRoute", () => {
  it("opens home for empty, root and unknown routes", () => {
    for (const hash of ["", "#", "#/", "#/nope", "#/nope/3", undefined]) expect(parseRoute(hash, ids)).toEqual(HOME);
  });

  it("opens a cover and a page", () => {
    expect(parseRoute("#/forest", ids)).toEqual({ screen: "book", id: "forest", position: 0 });
    expect(parseRoute("#/sea/7", ids)).toEqual({ screen: "book", id: "sea", position: 7 });
  });

  it("treats a bad page number as the cover", () => {
    for (const bad of ["x", "-2", "1.5"]) expect(parseRoute(`#/forest/${bad}`, ids).position).toBe(0);
  });
});

describe("formatRoute", () => {
  it("round-trips", () => {
    for (const hash of ["#/", "#/forest", "#/sea/12"]) expect(formatRoute(parseRoute(hash, ids))).toBe(hash);
  });
});
