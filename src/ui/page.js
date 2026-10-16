import { imageUrl, pageText } from "../core/story.js";
import { t } from "../core/i18n.js";
import { placeholderSvg } from "./placeholder.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function art(story, imageName, seed, lang, alt, print) {
  const wrap = el("div", "page__art");
  const fallback = () => {
    wrap.innerHTML = placeholderSvg(seed, alt);
    wrap.classList.add("page__art--placeholder");
    wrap.append(el("span", "page__soon", t(lang, "illustrationSoon")));
  };
  const img = new Image();
  img.alt = alt;
  img.decoding = "async";
  img.onerror = fallback;
  img.src = imageUrl(story, imageName, { print });
  wrap.append(img);
  return wrap;
}

/** Interior page: illustration on top, text on a paper panel below. Same markup for app and print. */
export function renderPage(story, page, { lang, mode, print = false }) {
  const root = el("article", `page page--${mode}`);
  root.dataset.page = page.number;
  root.append(art(story, page.image, page.number, lang, page.image_note ?? "", print));
  const panel = el("div", "page__panel");
  panel.append(el("p", "page__text", pageText(page, lang, mode)));
  root.append(panel, el("span", "page__number", String(page.number)));
  return root;
}

export function renderCover(story, { lang, print = false }) {
  const root = el("article", "page page--cover");
  root.append(art(story, story.cover_image, 0, lang, story.title[lang], print));
  const head = el("div", "cover__head");
  head.append(el("p", "cover__series", story.series_title[lang]), el("h1", "cover__title", story.title[lang]));
  root.append(head);
  return root;
}

export function renderBackCover(story, { lang }) {
  const root = el("article", "page page--back");
  root.append(el("p", "back__series", story.series_title[lang]));
  return root;
}
