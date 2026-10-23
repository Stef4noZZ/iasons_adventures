import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { defineConfig } from "vite";
import { publicSeries, publicStory } from "./src/core/publish.js";

const SKIP = /(^sw\.js$|^print\.html$|images-print\/|\.map$|(cyrillic|vietnamese|emoji|latin-ext|greek-ext)[^/]*\.woff2$)/;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

/** Rewrites the built story and series files without the art prompts, so the site does not publish them. */
function stripPrivate() {
  let outDir;
  return {
    name: "strip-private",
    apply: "build",
    configResolved: (config) => { outDir = resolve(config.root, config.build.outDir); },
    closeBundle() {
      const rewrite = (name, convert) => {
        const path = join(outDir, name);
        writeFileSync(path, JSON.stringify(convert(JSON.parse(readFileSync(path, "utf8")))));
      };
      rewrite("series.json", publicSeries);
      for (const file of walk(outDir)) {
        const name = relative(outDir, file).split("\\").join("/");
        if (/^stories\/[^/]+\/story\.json$/.test(name)) rewrite(name, publicStory);
      }
    },
  };
}

/** Writes the list of built files into dist/sw.js so the app works offline after the first visit. */
function precache() {
  let outDir;
  return {
    name: "precache",
    apply: "build",
    configResolved: (config) => { outDir = resolve(config.root, config.build.outDir); },
    closeBundle() {
      const files = walk(outDir).map((file) => relative(outDir, file)).filter((file) => !SKIP.test(file)).sort();
      const hash = createHash("sha1");
      for (const file of files) hash.update(file).update(readFileSync(join(outDir, file)));
      const sw = readFileSync(join(outDir, "sw.js"), "utf8")
        .replace("__PRECACHE__", JSON.stringify(files))
        .replace("__VERSION__", hash.digest("hex").slice(0, 10));
      writeFileSync(join(outDir, "sw.js"), sw);
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [stripPrivate(), precache()],
  build: {
    rollupOptions: {
      input: { main: resolve(import.meta.dirname, "index.html"), print: resolve(import.meta.dirname, "print.html") },
    },
  },
  test: { environment: "node" },
});
