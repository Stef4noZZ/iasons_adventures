import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: { main: resolve(import.meta.dirname, "index.html"), print: resolve(import.meta.dirname, "print.html") },
    },
  },
  test: { environment: "node" },
});
