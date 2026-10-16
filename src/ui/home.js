import { t } from "../core/i18n.js";
import { progressOf } from "../core/settings.js";
import { formatRoute } from "../core/router.js";
import { imageUrl } from "../core/story.js";

const esc = (text) => String(text).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function status(lang, story, progress) {
  if (progress.lastRead > 1) return { text: t(lang, "pageOf", { current: progress.lastRead, total: story.pages.length }), tone: "progress" };
  if (progress.finished) return { text: `✓ ${t(lang, "finishedBadge")}`, tone: "done" };
  return { text: t(lang, "newBadge"), tone: "new" };
}

function bookCard(lang, story, progress, index) {
  const { text, tone } = status(lang, story, progress);
  const title = esc(story.title[lang]);
  const cover = imageUrl(story, story.cover_image);
  const share = progress.lastRead > 1 ? Math.round((progress.lastRead / story.pages.length) * 100) : 0;
  return `<a class="book-card" style="--i:${index}" href="${formatRoute({ screen: "book", id: story.id, position: 0 })}" aria-label="${esc(t(lang, "openBook", { title: story.title[lang] }))}">
    <span class="book-card__cover"><img src="${cover}" alt="" loading="eager" onerror="this.remove()">
      <span class="book-card__badge book-card__badge--${tone}">${esc(text)}</span>
      ${share ? `<span class="book-card__bar" style="--p:${share}%"></span>` : ""}</span>
    <span class="book-card__title">${title}</span>
  </a>`;
}

function soonCard(lang, number, index) {
  return `<div class="book-card book-card--soon" style="--i:${index}" aria-label="${esc(t(lang, "adventureN", { n: number }))}: ${esc(t(lang, "comingSoon"))}">
    <span class="book-card__cover"><span class="soon__star" aria-hidden="true">✦</span><span class="soon__number" aria-hidden="true">${number}</span>
      <span class="book-card__badge book-card__badge--soon">${esc(t(lang, "comingSoon"))}</span></span>
    <span class="book-card__title">${esc(t(lang, "adventureN", { n: number }))}</span>
  </div>`;
}

/** Series home: title and one card per slot (real books first, the rest "coming soon"). */
export function renderHome({ series, stories, settings }) {
  const lang = settings.uiLang;
  const books = series.stories.map((id, i) => bookCard(lang, stories[id], progressOf(settings, id), i));
  const soon = Array.from({ length: Math.max(0, series.slots - series.stories.length) }, (_, i) => soonCard(lang, series.stories.length + i + 1, series.stories.length + i));
  const node = document.createElement("main");
  node.className = "home";
  node.innerHTML = `
    <div class="home__glow" aria-hidden="true"></div>
    <header class="hero">
      <div class="hero__stars" aria-hidden="true">✦ ✦ ✦</div>
      <h1 class="hero__title">${esc(series.title[lang])}</h1>
      <p class="hero__hint">${esc(t(lang, "homeHint"))}</p>
    </header>
    <h2 class="home__prompt">${esc(t(lang, "chooseAdventure"))}</h2>
    <div class="shelf">${[...books, ...soon].join("")}</div>`;
  return node;
}
