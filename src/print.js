import "./styles/tokens.css";
import "./styles/page.css";
import "./styles/print.css";
import { fetchStory } from "./core/story.js";
import { renderBackCover, renderCover, renderPage } from "./ui/page.js";

// ?lang=el|en  ?mode=mode1|mode2  ?proof=1 (shows placeholder captions)
const params = new URLSearchParams(location.search);
const lang = params.get("lang") === "en" ? "en" : "el";
const mode = params.get("mode") === "mode2" ? "mode2" : "mode1";
if (params.get("proof")) document.body.classList.add("proof");
document.documentElement.lang = lang;

const sheet = (node) => {
  const wrap = document.createElement("section");
  wrap.className = "print-sheet";
  wrap.append(node);
  return wrap;
};

const story = await fetchStory();
const opts = { lang, mode, print: true };
document.getElementById("sheets").append(
  sheet(renderCover(story, opts)),
  ...story.pages.map((page) => sheet(renderPage(story, page, opts))),
  sheet(renderBackCover(story, opts)),
);

// Signal the exporter once every image has loaded or fallen back.
await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
await document.fonts.ready;
document.body.dataset.ready = "1";
