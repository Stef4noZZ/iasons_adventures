import "./styles/tokens.css";
import "./styles/page.css";
import "./styles/app.css";
import { fetchSeries, fetchStory, validateStory } from "./core/story.js";
import { loadSettings, progressOf, saveSettings } from "./core/settings.js";
import { t } from "./core/i18n.js";
import { chime, pageTurn } from "./core/sound.js";
import { renderCover, renderPage } from "./ui/page.js";

const root = document.getElementById("app");
const settings = loadSettings();
let series;
let stories = {};
let story;
let direction = "next";
let audio = null;
let installPrompt = null;

const h = (html) => {
  const tpl = document.createElement("template");
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
};

const last = () => story.pages.length + 1; // position 0 = cover, last = end card
const clamp = (n) => Math.min(Math.max(n, 0), last());
const position = () => progressOf(settings, story.id).position;

function setProgress(next) {
  const current = progressOf(settings, story.id);
  const lastRead = next >= 1 && next <= story.pages.length ? next : current.lastRead;
  settings.progress[story.id] = { position: next, lastRead };
  saveSettings(settings);
}

function go(target) {
  const next = clamp(target);
  const current = position();
  if (next === current) return;
  direction = next > current ? "next" : "prev";
  setProgress(next);
  stopAudio();
  if (settings.sound) (next === last() ? chime : pageTurn)();
  render(true);
}

function stopAudio() {
  audio?.pause();
  audio = null;
}

function toggleAudio(button, src) {
  if (audio && !audio.paused) return stopAudio(), render();
  audio = new Audio(src);
  audio.onended = () => (audio = null, render());
  audio.play().catch(() => (audio = null));
  button.textContent = "⏸";
}

const narrationSrc = (page) => page.audio?.[settings.storyLang]?.[settings.mode] ?? null;

/** Drifting fireflies over the artwork; purely decorative. */
function fireflies() {
  const layer = h('<div class="flies" aria-hidden="true"></div>');
  for (let i = 0; i < 9; i++) {
    const fly = document.createElement("i");
    fly.style.cssText = `--x:${8 + ((i * 37) % 84)}%;--y:${10 + ((i * 53) % 75)}%;--d:${(i % 5) * 1.3}s;--t:${5 + (i % 4)}s`;
    layer.append(fly);
  }
  return layer;
}

function buildStage(animate) {
  const lang = settings.uiLang;
  const opts = { lang: settings.storyLang, mode: settings.mode };
  const pos = position();
  const stage = h(`<div class="stage">
    <button class="icon-btn nav" data-act="prev" aria-label="${t(lang, "previous")}">←</button>
    <div class="book"></div>
    <button class="icon-btn nav" data-act="next" aria-label="${t(lang, "next")}">→</button>
  </div>`);
  const book = stage.querySelector(".book");

  if (pos === 0) {
    const cover = renderCover(story, opts);
    const label = progressOf(settings, story.id).lastRead > 1 ? "resume" : "start";
    cover.append(h(`<div class="cover-actions"><button class="btn btn--primary btn--pulse" data-act="start">${t(lang, label)}</button></div>`));
    book.append(cover, fireflies());
  } else if (pos === last()) {
    book.append(renderPage(story, story.pages.at(-1), opts));
    book.append(h(`<div class="end-card"><h2>${t(lang, "theEnd")}</h2><div class="end-card__stars" aria-hidden="true">✦ ✦ ✦</div>
      <button class="btn btn--primary" data-act="again">${t(lang, "readAgain")}</button></div>`));
  } else {
    const page = story.pages[pos - 1];
    book.append(renderPage(story, page, opts), fireflies());
    const src = settings.narration && narrationSrc(page);
    if (src) {
      const playing = audio && !audio.paused;
      const b = h(`<button class="icon-btn listen" data-act="listen" aria-label="${t(lang, playing ? "pause" : "listen")}">${playing ? "⏸" : "🔊"}</button>`);
      b.addEventListener("click", () => toggleAudio(b, src));
      book.append(b);
    }
  }
  if (animate) book.firstElementChild.classList.add(`turn-in-${direction}`);
  stage.querySelector('[data-act="prev"]').disabled = pos === 0;
  stage.querySelector('[data-act="next"]').disabled = pos === last();
  return stage;
}

function buildFooter() {
  const lang = settings.uiLang;
  const pos = position();
  const footer = h(`<footer class="footer"><div class="dots" role="tablist"></div><div class="status"></div>
    <div class="mobile-nav"><button class="icon-btn" data-act="prev" aria-label="${t(lang, "previous")}" ${pos === 0 ? "disabled" : ""}>←</button>
    <button class="icon-btn" data-act="next" aria-label="${t(lang, "next")}" ${pos === last() ? "disabled" : ""}>→</button></div></footer>`);
  const dots = footer.querySelector(".dots");
  story.pages.forEach((_, i) => {
    const dot = h(`<button class="dot${pos > i + 1 ? " dot--read" : ""}" role="tab" aria-label="${t(lang, "pageOf", { current: i + 1, total: story.pages.length })}" ${pos === i + 1 ? 'aria-current="true"' : ""}></button>`);
    dot.addEventListener("click", () => go(i + 1));
    dots.append(dot);
  });
  const inBook = pos >= 1 && pos <= story.pages.length;
  footer.querySelector(".status").textContent = inBook ? t(lang, "pageOf", { current: pos, total: story.pages.length }) : "";
  return footer;
}

function buildTopbar() {
  const lang = settings.uiLang;
  const many = series.stories.length > 1;
  return h(`<header class="topbar">
    <h1 class="topbar__title">${position() === 0 ? "" : story.series_title[lang]}</h1>
    <div class="topbar__actions">
      ${installPrompt ? `<button class="btn btn--small" data-act="install">${t(lang, "install")}</button>` : ""}
      ${many ? `<button class="icon-btn" data-act="library" aria-label="${t(lang, "library")}">▤</button>` : ""}
      <button class="icon-btn" data-act="home" aria-label="${t(lang, "toCover")}">⌂</button>
      <button class="icon-btn" data-act="fullscreen" aria-label="${t(lang, "fullscreen")}">⛶</button>
      <button class="icon-btn" data-act="settings" aria-label="${t(lang, "settings")}">⚙</button>
    </div></header>`);
}

const seg = (name, options, value) =>
  options.map(([v, label]) => `<label><input type="radio" name="${name}" value="${v}" ${String(v) === String(value) ? "checked" : ""}>${label}</label>`).join("");

function openDialog(dialog) {
  dialog.addEventListener("close", () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
  return dialog;
}

function openSettings() {
  const lang = settings.uiLang;
  const langs = [["el", "Ελληνικά"], ["en", "English"]];
  const modes = ["mode1", "mode2"].map((m) => [m, story.modes[m].label[lang]]);
  const onOff = [[true, t(lang, "on")], [false, t(lang, "off")]];
  const dialog = h(`<dialog><h2>${t(lang, "settings")}</h2>
    <fieldset class="field"><legend>${t(lang, "uiLanguage")}</legend><div class="seg">${seg("uiLang", langs, settings.uiLang)}</div></fieldset>
    <fieldset class="field"><legend>${t(lang, "storyLanguage")}</legend><div class="seg">${seg("storyLang", langs, settings.storyLang)}</div></fieldset>
    <fieldset class="field"><legend>${t(lang, "readingMode")}</legend><div class="seg">${seg("mode", modes, settings.mode)}</div></fieldset>
    <fieldset class="field"><legend>${t(lang, "sound")}</legend><div class="seg">${seg("sound", onOff, settings.sound)}</div></fieldset>
    <p class="about">© ${series.copyright.year} ${series.copyright.holder}</p>
    <button class="btn btn--primary" value="close">${t(lang, "close")}</button></dialog>`);
  dialog.addEventListener("change", (e) => {
    const { name, value } = e.target;
    settings[name] = name === "sound" ? value === "true" : value;
    saveSettings(settings);
    stopAudio();
    dialog.close();
    render();
    openSettings();
  });
  dialog.querySelector(".btn").addEventListener("click", () => dialog.close());
  openDialog(dialog);
}

function openLibrary() {
  const lang = settings.uiLang;
  const cards = series.stories.map((id) => {
    const s = stories[id];
    const cover = `${import.meta.env.BASE_URL}stories/${id}/images/${s.cover_image.replace(/\.\w+$/, ".jpg")}`;
    return `<button class="card${id === story.id ? " card--current" : ""}" data-story="${id}"><img src="${cover}" alt="" onerror="this.remove()"><span>${s.title[lang]}</span></button>`;
  }).join("");
  const dialog = h(`<dialog><h2>${series.title[lang]}</h2><div class="cards">${cards}</div></dialog>`);
  dialog.addEventListener("click", (e) => {
    const id = e.target.closest("[data-story]")?.dataset.story;
    if (!id) return;
    stopAudio();
    selectStory(id);
    dialog.close();
  });
  openDialog(dialog);
}

function selectStory(id) {
  story = stories[id];
  settings.storyId = id;
  const errors = validateStory(story);
  if (errors.length) console.warn(`Story ${id}:`, errors);
  const p = progressOf(settings, id);
  settings.progress[id] = { ...p, position: clamp(p.position) };
  saveSettings(settings);
  direction = "next";
  render();
}

function render(animate = false) {
  document.documentElement.lang = settings.uiLang;
  document.title = story.series_title[settings.uiLang];
  root.replaceChildren(buildTopbar(), buildStage(animate), buildFooter());
}

const actions = {
  prev: () => go(position() - 1),
  next: () => go(position() + 1),
  start: () => go(Math.max(progressOf(settings, story.id).lastRead, 1)),
  again: () => go(1),
  home: () => go(0),
  settings: openSettings,
  library: openLibrary,
  install: async () => {
    const event = installPrompt;
    installPrompt = null;
    await event?.prompt();
    render();
  },
  fullscreen: () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.()),
};

root.addEventListener("click", (e) => actions[e.target.closest("[data-act]")?.dataset.act]?.());

document.addEventListener("keydown", (e) => {
  if (document.querySelector("dialog[open]")) return;
  if (e.key === "ArrowRight" || e.key === "PageDown") actions.next();
  else if (e.key === "ArrowLeft" || e.key === "PageUp") actions.prev();
  else if (e.key === "Home") go(0);
  else if (e.key === "End") go(last());
});

let touchX = null;
root.addEventListener("pointerdown", (e) => { if (e.pointerType === "touch") touchX = e.clientX; });
root.addEventListener("pointerup", (e) => {
  if (touchX == null) return;
  const dx = e.clientX - touchX;
  touchX = null;
  if (Math.abs(dx) > 50) go(position() + (dx < 0 ? 1 : -1));
});

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installPrompt = e;
  if (story) render();
});
window.addEventListener("appinstalled", () => (installPrompt = null));

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((error) => console.warn("Service worker:", error));
}

try {
  series = await fetchSeries();
  stories = Object.fromEntries(await Promise.all(series.stories.map(async (id) => [id, await fetchStory(id)])));
  selectStory(series.stories.includes(settings.storyId) ? settings.storyId : series.stories[0]);
} catch (error) {
  console.error(error);
  root.textContent = t(settings.uiLang, "loadError");
}
