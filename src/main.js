import "./styles/tokens.css";
import "./styles/page.css";
import "./styles/app.css";
import { fetchStory, validateStory } from "./core/story.js";
import { loadSettings, saveSettings } from "./core/settings.js";
import { t } from "./core/i18n.js";
import { renderCover, renderPage } from "./ui/page.js";

const root = document.getElementById("app");
const settings = loadSettings();
let story;
let direction = "next";
let audio = null;

const h = (html) => {
  const tpl = document.createElement("template");
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
};

const last = () => story.pages.length + 1; // position 0 = cover, last = end card
const clamp = (n) => Math.min(Math.max(n, 0), last());

function go(position) {
  const next = clamp(position);
  if (next === settings.position) return;
  direction = next > settings.position ? "next" : "prev";
  settings.position = next;
  if (next >= 1 && next <= story.pages.length) settings.lastRead = next;
  saveSettings(settings);
  stopAudio();
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

function narrationSrc(page) {
  return page.audio?.[settings.storyLang]?.[settings.mode] ?? null;
}

function buildStage(animate) {
  const lang = settings.uiLang;
  const opts = { lang: settings.storyLang, mode: settings.mode };
  const pos = settings.position;
  const stage = h(`<div class="stage">
    <button class="icon-btn nav" data-act="prev" aria-label="${t(lang, "previous")}">←</button>
    <div class="book"></div>
    <button class="icon-btn nav" data-act="next" aria-label="${t(lang, "next")}">→</button>
  </div>`);
  const book = stage.querySelector(".book");

  if (pos === 0) {
    const cover = renderCover(story, opts);
    const label = settings.lastRead > 1 ? "resume" : "start";
    cover.append(h(`<div class="cover-actions"><button class="btn btn--primary" data-act="start">${t(lang, label)}</button></div>`));
    book.append(cover);
  } else if (pos === last()) {
    book.append(h(`<div class="end-card"><h2>${t(lang, "theEnd")}</h2>
      <button class="btn btn--primary" data-act="again">${t(lang, "readAgain")}</button></div>`));
    book.prepend(renderPage(story, story.pages.at(-1), opts));
  } else {
    const page = story.pages[pos - 1];
    book.append(renderPage(story, page, opts));
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
  const pos = settings.position;
  const footer = h(`<footer class="footer"><div class="dots" role="tablist"></div><div class="status"></div>
    <div class="mobile-nav"><button class="icon-btn" data-act="prev" aria-label="${t(lang, "previous")}" ${pos === 0 ? "disabled" : ""}>←</button>
    <button class="icon-btn" data-act="next" aria-label="${t(lang, "next")}" ${pos === last() ? "disabled" : ""}>→</button></div></footer>`);
  const dots = footer.querySelector(".dots");
  story.pages.forEach((page, i) => {
    const dot = h(`<button class="dot${pos > i + 1 ? " dot--read" : ""}" role="tab" aria-label="${t(lang, "pageOf", { current: i + 1, total: story.pages.length })}" ${pos === i + 1 ? 'aria-current="true"' : ""}></button>`);
    dot.addEventListener("click", () => go(i + 1));
    dots.append(dot);
  });
  const inBook = pos >= 1 && pos <= story.pages.length;
  footer.querySelector(".status").textContent = inBook
    ? t(lang, "pageOf", { current: pos, total: story.pages.length })
    : "";
  return footer;
}

function buildTopbar() {
  const lang = settings.uiLang;
  const bar = h(`<header class="topbar">
    <h1 class="topbar__title">${settings.position === 0 ? "" : story.series_title[lang]}</h1>
    <div class="topbar__actions">
      <button class="icon-btn" data-act="home" aria-label="${t(lang, "toCover")}">⌂</button>
      <button class="icon-btn" data-act="fullscreen" aria-label="${t(lang, "fullscreen")}">⛶</button>
      <button class="icon-btn" data-act="settings" aria-label="${t(lang, "settings")}">⚙</button>
    </div></header>`);
  return bar;
}

function seg(name, options, value) {
  return options.map(([v, label]) =>
    `<label><input type="radio" name="${name}" value="${v}" ${v === value ? "checked" : ""}>${label}</label>`).join("");
}

function openSettings() {
  const lang = settings.uiLang;
  const langs = [["el", "Ελληνικά"], ["en", "English"]];
  const modes = ["mode1", "mode2"].map((m) => [m, story.modes[m].label[lang]]);
  const dialog = h(`<dialog><h2>${t(lang, "settings")}</h2>
    <fieldset class="field"><legend>${t(lang, "uiLanguage")}</legend><div class="seg">${seg("uiLang", langs, settings.uiLang)}</div></fieldset>
    <fieldset class="field"><legend>${t(lang, "storyLanguage")}</legend><div class="seg">${seg("storyLang", langs, settings.storyLang)}</div></fieldset>
    <fieldset class="field"><legend>${t(lang, "readingMode")}</legend><div class="seg">${seg("mode", modes, settings.mode)}</div></fieldset>
    <button class="btn btn--primary" value="close">${t(lang, "close")}</button></dialog>`);
  dialog.addEventListener("change", (e) => {
    settings[e.target.name] = e.target.value;
    saveSettings(settings);
    stopAudio();
    dialog.close();
    render();
    openSettings();
  });
  dialog.addEventListener("close", () => dialog.remove());
  dialog.querySelector(".btn").addEventListener("click", () => dialog.close());
  document.body.append(dialog);
  dialog.showModal();
}

function render(animate = false) {
  document.documentElement.lang = settings.uiLang;
  document.title = story.series_title[settings.uiLang];
  root.replaceChildren(buildTopbar(), buildStage(animate), buildFooter());
}

const actions = {
  prev: () => go(settings.position - 1),
  next: () => go(settings.position + 1),
  start: () => go(Math.max(settings.lastRead, 1)),
  again: () => go(1),
  home: () => go(0),
  settings: openSettings,
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
  if (Math.abs(dx) > 50) go(settings.position + (dx < 0 ? 1 : -1));
});

try {
  story = await fetchStory();
  const errors = validateStory(story);
  if (errors.length) console.warn("Story validation:", errors);
  settings.position = clamp(settings.position);
  render();
} catch (error) {
  console.error(error);
  root.textContent = t(settings.uiLang, "loadError");
}
