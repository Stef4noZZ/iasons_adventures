import "./styles/tokens.css";
import "./styles/page.css";
import "./styles/print.css";
import { fetchSeries, fetchStory, printLayout } from "./core/story.js";
import { renderBackCover, renderCopyrightPage, renderCover, renderEndPage, renderPage, renderSeriesPage, renderTitlePage } from "./ui/page.js";

// ?story=<id>  ?lang=el|en  ?mode=mode1|mode2  ?proof=1 (shows placeholder captions)
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

const series = await fetchSeries();
const storyId = params.get("story") ?? series.stories[0];
const story = await fetchStory(storyId);
const titles = await Promise.all(series.stories.map(async (id) => [id, (await fetchStory(id)).title]));
document.title = `${story.series_title[lang]}: ${story.title[lang]}`;

const { front_matter, back_matter } = printLayout(story);
const matter = {
  title: () => renderTitlePage(story, { lang, print: true }),
  copyright: () => renderCopyrightPage(story, series, { lang }),
  the_end: () => renderEndPage(story, { lang }),
  series: () => renderSeriesPage(story, series, titles, { lang }),
};
const opts = { lang, mode, print: true };
document.getElementById("sheets").append(
  sheet(renderCover(story, opts)),
  ...front_matter.map((name) => sheet(matter[name]())),
  ...story.pages.map((page) => sheet(renderPage(story, page, { ...opts, folio: front_matter.length + page.number }))),
  ...back_matter.map((name) => sheet(matter[name]())),
  sheet(renderBackCover(story, opts)),
);

// Signal the exporter once every image has loaded or fallen back.
await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
await document.fonts.ready;
document.body.dataset.ready = "1";
