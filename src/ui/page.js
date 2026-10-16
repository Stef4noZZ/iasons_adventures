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
export function renderPage(story, page, { lang, mode, print = false, folio = null }) {
  const root = el("article", `page page--${mode}`);
  root.dataset.page = page.number;
  root.append(art(story, page.image, page.number, lang, page.image_note ?? "", print));
  const panel = el("div", "page__panel");
  panel.append(el("p", "page__text", pageText(page, lang, mode)));
  root.append(panel, el("span", "page__number", String(folio ?? page.number)));
  return root;
}

export function renderCover(story, { lang, print = false }) {
  const root = el("article", `page page--cover page--cover-${story.cover?.title_position ?? "top"}`);
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

const sparkles = () => el("div", "ornament", "✦ ✦ ✦");

export function renderTitlePage(story, { lang, print = false }) {
  const root = el("article", "page page--title");
  const medallion = el("div", "title__medallion");
  const img = new Image();
  img.alt = "";
  img.style.setProperty("--focus", story.cover?.medallion_focus ?? "50% 78%");
  img.style.setProperty("--zoom", story.cover?.medallion_zoom ?? 1);
  img.src = imageUrl(story, story.cover_image, { print });
  img.onerror = () => img.remove();
  medallion.append(img);
  root.append(
    el("p", "title__series", story.series_title[lang]),
    sparkles(),
    el("h1", "title__main", story.title[lang]),
    medallion,
  );
  return root;
}

export function renderCopyrightPage(story, series, { lang }) {
  const root = el("article", "page page--copyright");
  const { holder, year, lines, isbn } = series.copyright;
  const block = el("div", "copyright__block");
  block.append(el("p", "copyright__title", `${story.series_title[lang]}: ${story.title[lang]}`));
  block.append(el("p", "copyright__holder", `© ${year} ${holder}`));
  for (const line of lines[lang]) block.append(el("p", "copyright__line", line));
  if (isbn) block.append(el("p", "copyright__line", `ISBN ${isbn}`));
  root.append(block);
  return root;
}

export function renderEndPage(_story, { lang }) {
  const root = el("article", "page page--end");
  root.append(sparkles(), el("p", "end__text", t(lang, "theEnd")), sparkles());
  return root;
}

export function renderSeriesPage(story, series, titles, { lang }) {
  const root = el("article", "page page--series");
  const list = el("ul", "series__list");
  for (const [id, title] of titles) {
    const item = el("li", id === story.id ? "series__item series__item--current" : "series__item", title[lang]);
    list.append(item);
  }
  list.append(el("li", "series__item series__item--soon", t(lang, "moreSoon")));
  root.append(el("p", "series__title", series.title[lang]), sparkles(), list);
  return root;
}
