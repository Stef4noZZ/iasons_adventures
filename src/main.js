import "./styles/tokens.css";
import "./styles/page.css";
import "./styles/app.css";
import { fetchSeries, fetchStory, validateStory } from "./core/story.js";
import { loadSettings, progressOf, saveSettings } from "./core/settings.js";
import { features } from "./config.js";
import { t } from "./core/i18n.js";
import { chime, pageTurn } from "./core/sound.js";
import { clipKey, deleteClip, exportClips, importClips, listClips, saveClip } from "./core/recordings.js";
import { recordingSupported, startRecorder } from "./core/recorder.js";
import { renderCover, renderPage } from "./ui/page.js";
import { renderHome } from "./ui/home.js";
import { formatRoute, HOME, parseRoute } from "./core/router.js";

const root = document.getElementById("app");
const settings = loadSettings();
let series;
let stories = {};
let story = null; // null on the home screen
let route = HOME;
let routeToken = 0;
let direction = "next";
let audio = null;
let installPrompt = null;

// Voice recording state. Clips are the parent's recordings for the current story.
let recordMode = false;
let recording = null; // { handle, pageId, lang, mode, startedAt }
let recordError = "";
let recordTimer = null;
const clips = new Map(); // key -> { url }

const h = (html) => {
  const tpl = document.createElement("template");
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
};

const last = () => story.pages.length + 1; // position 0 = cover, last = end card
const clamp = (n) => Math.min(Math.max(n, 0), last());
const position = () => (story ? route.position : 0);
const currentPage = () => story?.pages[position() - 1] ?? null;
const keyFor = (pageId, lang = settings.storyLang, mode = settings.mode) => clipKey(story.id, lang, mode, pageId);
const refStory = () => story ?? stories[series.stories[0]];

function remember() {
  const pos = position();
  const previous = progressOf(settings, story.id);
  const reading = pos >= 1 && pos <= story.pages.length;
  settings.progress[story.id] = {
    position: pos,
    lastRead: pos === last() ? 1 : reading ? pos : previous.lastRead,
    finished: previous.finished || pos === last(),
  };
  saveSettings(settings);
}

/** Moves between screens by changing the address; applyRoute() does the work, so Back works like a book. */
function navigate(next) {
  const hash = formatRoute(next);
  if (location.hash === hash || (hash === "#/" && !location.hash)) return;
  location.hash = hash;
}
/** Where the address points right now; it moves before the screen finishes updating, so quick presses add up. */
const hashPosition = () => {
  const target = parseRoute(location.hash, series.stories);
  return target.screen === "book" ? target.position : 0;
};
const goPage = (n) => navigate({ screen: "book", id: story.id, position: clamp(n) });
const goHome = () => navigate(HOME);

async function applyRoute() {
  const token = ++routeToken;
  const next = parseRoute(location.hash, series.stories);
  const sameBook = next.screen === "book" && story?.id === next.id;
  const before = position();

  // Route state changes straight away so quick key presses build on each other; the awaits below only finish side effects.
  const savingVoice = finishRecording();
  stopAudio();
  if (!sameBook) recordMode = false;
  if (next.screen === "book") {
    story = stories[next.id];
    route = { ...next, position: Math.min(next.position, story.pages.length + 1) };
    settings.storyId = story.id;
    remember();
  } else {
    story = null;
    route = HOME;
  }
  const opened = story;

  await savingVoice;
  if (opened && !sameBook) await loadClips();
  if (token !== routeToken) return;

  const after = position();
  if (sameBook && after !== before) {
    direction = after > before ? "next" : "prev";
    if (settings.sound) (after === last() ? chime : pageTurn)();
  }
  render(sameBook && after !== before);
  window.scrollTo(0, 0);
  autoplay();
}

// ---- Narration playback (own voice first, then bundled audio files) ----

function narrationSrc(page) {
  return clips.get(keyFor(page.id))?.url ?? page.audio?.[settings.storyLang]?.[settings.mode] ?? null;
}

const isPlaying = () => Boolean(audio && !audio.paused);

function syncListen() {
  const lang = settings.uiLang;
  const button = document.querySelector(".listen");
  if (button) {
    button.textContent = isPlaying() ? "⏸" : "🔊";
    button.setAttribute("aria-label", t(lang, isPlaying() ? "pause" : "listen"));
  }
  const play = document.querySelector('[data-act="rec-play"]');
  if (play) play.textContent = `${isPlaying() ? "⏸" : "▶"} ${t(lang, isPlaying() ? "pause" : "play")}`;
}

function stopAudio() {
  if (audio) {
    audio.onended = null;
    audio.pause();
  }
  audio = null;
  syncListen();
}

function playAudio(src, { advance = false } = {}) {
  stopAudio();
  const player = new Audio(src);
  audio = player;
  player.onended = () => {
    if (audio !== player) return;
    audio = null;
    syncListen();
    if (advance && settings.readAlong) setTimeout(() => !audio && !recording && story && goPage(hashPosition() + 1), 900);
  };
  player.play().then(syncListen).catch(() => {
    if (audio === player) audio = null;
  });
}

/** Read-along: after a page turn, play the narration and turn the page when it ends. */
function autoplay() {
  const page = currentPage();
  if (!settings.readAlong || recordMode || !page) return;
  const src = settings.narration && narrationSrc(page);
  if (src) playAudio(src, { advance: true });
}

// ---- Voice recording ----

async function loadClips() {
  for (const { url } of clips.values()) URL.revokeObjectURL(url);
  clips.clear();
  try {
    for (const clip of await listClips(story.id)) clips.set(clip.key, { url: URL.createObjectURL(clip.blob) });
  } catch (error) {
    console.warn("Recordings unavailable:", error);
  }
}

function setClip(key, blob) {
  const old = clips.get(key);
  if (old) URL.revokeObjectURL(old.url);
  clips.set(key, { url: URL.createObjectURL(blob) });
}

function refreshFooter() {
  const footer = root.querySelector(".footer");
  if (footer) {
    const next = buildFooter();
    footer.replaceWith(next);
    addTooltips(next);
  }
}

function tickTimer() {
  const node = document.querySelector(".recorder__time");
  if (node && recording) node.textContent = formatTime((Date.now() - recording.startedAt) / 1000);
}

const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

async function beginRecording() {
  const page = currentPage();
  if (!page || recording) return;
  stopAudio();
  recordError = "";
  try {
    const handle = await startRecorder();
    recording = { handle, storyId: story.id, pageId: page.id, lang: settings.storyLang, mode: settings.mode, startedAt: Date.now() };
    recordTimer = setInterval(tickTimer, 250);
  } catch (error) {
    recordError = error?.name === "NotAllowedError" ? "micDenied" : "micUnsupported";
  }
  refreshFooter();
}

async function finishRecording() {
  if (!recording) return;
  const { handle, storyId, pageId, lang, mode } = recording;
  recording = null;
  clearInterval(recordTimer);
  const blob = await handle.stop();
  if (blob.size) {
    const key = clipKey(storyId, lang, mode, pageId);
    await saveClip({ key, storyId, lang, mode, pageId, blob, createdAt: Date.now() });
    if (story?.id === storyId) setClip(key, blob);
  }
  refreshFooter();
}

async function removeClip() {
  const page = currentPage();
  if (!page || !confirm(t(settings.uiLang, "confirmDelete"))) return;
  const key = keyFor(page.id);
  stopAudio();
  await deleteClip(key);
  URL.revokeObjectURL(clips.get(key)?.url);
  clips.delete(key);
  refreshFooter();
}

const recordedCount = () => story.pages.filter((page) => clips.has(keyFor(page.id))).length;

function buildRecorder() {
  const lang = settings.uiLang;
  const page = currentPage();
  const label = `${t(lang, "recordFor")}: ${settings.storyLang === "el" ? "Ελληνικά" : "English"} · ${story.modes[settings.mode].label[lang]}`;
  const count = t(lang, "recordedCount", { n: recordedCount(), total: story.pages.length });
  let controls = "";
  let message = count;

  if (!page) {
    message = t(lang, "recordHint");
  } else if (recording) {
    controls = `<span class="rec-dot" aria-hidden="true"></span><span class="recorder__time">0:00</span>
      <button class="btn btn--primary" data-act="rec-stop">■ ${t(lang, "stopRecording")}</button>`;
  } else if (clips.has(keyFor(page.id))) {
    controls = `<button class="btn btn--primary" data-act="rec-play">▶ ${t(lang, "play")}</button>
      <button class="btn" data-act="rec-start">● ${t(lang, "rerecord")}</button>
      <button class="btn" data-act="rec-delete">🗑 ${t(lang, "deleteClip")}</button>`;
  } else {
    controls = `<button class="btn btn--primary btn--rec" data-act="rec-start">● ${t(lang, "record")}</button>`;
  }
  if (recordError) message = t(lang, recordError);

  return h(`<div class="recorder"><div class="recorder__label">🎙 ${label}</div>
    <div class="recorder__row">${controls}</div><div class="recorder__msg${recordError ? " recorder__msg--error" : ""}">${message}</div></div>`);
}

// ---- Views ----

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
    const resume = progressOf(settings, story.id).lastRead;
    if (resume > 1) cover.classList.add("page--cover-continue");
    cover.append(h(`<div class="cover-actions"><button class="btn btn--primary btn--pulse" data-act="start">${t(lang, "start")}</button>
      ${resume > 1 ? `<button class="btn btn--small" data-act="continue">${t(lang, "continueFrom", { n: resume })}</button>` : ""}</div>`));
    book.append(cover, fireflies());
  } else if (pos === last()) {
    book.append(renderPage(story, story.pages.at(-1), opts));
    book.append(h(`<div class="end-card"><h2>${t(lang, "theEnd")}</h2><div class="end-card__stars" aria-hidden="true">✦ ✦ ✦</div>
      <button class="btn btn--primary" data-act="again">${t(lang, "readAgain")}</button>
      <button class="btn btn--small" data-act="home">${t(lang, "anotherAdventure")}</button></div>`));
  } else {
    const page = currentPage();
    book.append(renderPage(story, page, opts), fireflies());
    if (settings.narration && narrationSrc(page) && !recordMode) {
      book.append(h(`<button class="icon-btn listen" data-act="listen" aria-label="${t(lang, isPlaying() ? "pause" : "listen")}">${isPlaying() ? "⏸" : "🔊"}</button>`));
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
  story.pages.forEach((page, i) => {
    const recorded = recordMode && clips.has(keyFor(page.id));
    const dot = h(`<button class="dot${pos > i + 1 ? " dot--read" : ""}${recorded ? " dot--rec" : ""}" role="tab" aria-label="${t(lang, "pageOf", { current: i + 1, total: story.pages.length })}" ${pos === i + 1 ? 'aria-current="true"' : ""}></button>`);
    dot.addEventListener("click", () => goPage(i + 1));
    dots.append(dot);
  });
  const inBook = pos >= 1 && pos <= story.pages.length;
  footer.querySelector(".status").textContent = inBook ? t(lang, "pageOf", { current: pos, total: story.pages.length }) : "";
  if (recordMode) footer.prepend(buildRecorder());
  return footer;
}

function buildTopbar() {
  const lang = settings.uiLang;
  const langToggle = `<div class="lang-toggle" role="group" aria-label="${t(lang, "language")}">${["el", "en"].map((code) =>
    `<button data-act="lang" data-lang="${code}" aria-pressed="${settings.uiLang === code}">${code.toUpperCase()}</button>`).join("")}</div>`;
  return h(`<header class="topbar${story ? " topbar--book" : ""}">
    ${story ? `<h1 class="sr-only">${story.series_title[lang]}: ${story.title[lang]}</h1>
    <button class="icon-btn" data-act="home" aria-label="${t(lang, "home")}">⌂</button>` : ""}
    <div class="topbar__actions">
      ${features.installButton && !story && installPrompt ? `<button class="btn btn--small" data-act="install">${t(lang, "install")}</button>` : ""}
      ${story ? "" : langToggle}
      ${story && recordingSupported() ? `<button class="icon-btn${recordMode ? " icon-btn--on" : ""}" data-act="record" aria-pressed="${recordMode}" aria-label="${t(lang, "recordMode")}">🎙</button>` : ""}
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

const SETTING_FIELDS = new Set(["uiLang", "storyLang", "mode", "sound", "readAlong"]);

function openSettings() {
  const lang = settings.uiLang;
  const langs = [["el", "Ελληνικά"], ["en", "English"]];
  const modes = ["mode1", "mode2"].map((m) => [m, refStory().modes[m].label[lang]]);
  const onOff = [[true, t(lang, "on")], [false, t(lang, "off")]];
  const voice = story && recordingSupported() ? `<fieldset class="field"><legend>${t(lang, "myVoice")}</legend>
      <p class="about">${t(lang, "recordedCount", { n: recordedCount(), total: story.pages.length })} (${settings.storyLang.toUpperCase()}, ${story.modes[settings.mode].label[lang]}). ${t(lang, "voiceNote")}</p>
      <div class="row"><button class="btn btn--small" data-voice="export">${t(lang, "exportVoice")}</button>
      <button class="btn btn--small" data-voice="import">${t(lang, "importVoice")}</button>
      <input type="file" accept="application/json,.json" hidden></div></fieldset>` : "";
  const dialog = h(`<dialog><h2>${t(lang, "settings")}</h2>
    <fieldset class="field"><legend>${t(lang, "uiLanguage")}</legend><div class="seg">${seg("uiLang", langs, settings.uiLang)}</div></fieldset>
    <fieldset class="field"><legend>${t(lang, "storyLanguage")}</legend><div class="seg">${seg("storyLang", langs, settings.storyLang)}</div></fieldset>
    <fieldset class="field"><legend>${t(lang, "readingMode")}</legend><div class="seg">${seg("mode", modes, settings.mode)}</div></fieldset>
    <fieldset class="field"><legend>${t(lang, "sound")}</legend><div class="seg">${seg("sound", onOff, settings.sound)}</div></fieldset>
    <fieldset class="field"><legend>${t(lang, "readAlong")}</legend><div class="seg">${seg("readAlong", onOff, settings.readAlong)}</div></fieldset>
    ${voice}
    <p class="about">© ${series.copyright.year} ${series.copyright.holder}</p>
    <button class="btn btn--primary" value="close">${t(lang, "close")}</button></dialog>`);

  dialog.addEventListener("change", (e) => {
    const { name, value } = e.target;
    if (!SETTING_FIELDS.has(name)) return;
    settings[name] = name === "sound" || name === "readAlong" ? value === "true" : value;
    saveSettings(settings);
    finishRecording();
    stopAudio();
    dialog.close();
    render();
    openSettings();
  });
  dialog.addEventListener("click", async (e) => {
    const action = e.target.closest("[data-voice]")?.dataset.voice;
    if (action === "export") await downloadVoice();
    if (action === "import") dialog.querySelector('input[type="file"]').click();
  });
  dialog.querySelector('input[type="file"]')?.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { storyId, count } = await importClips(await file.text());
      if (storyId === story.id) await loadClips();
      alert(t(lang, "importDone", { n: count }));
      dialog.close();
      render();
    } catch {
      alert(t(lang, "importFailed"));
    }
  });
  dialog.querySelector('[value="close"]').addEventListener("click", () => dialog.close());
  openDialog(dialog);
}

async function downloadVoice() {
  if (!clips.size) return alert(t(settings.uiLang, "exportEmpty"));
  const blob = new Blob([await exportClips(story.id)], { type: "application/json" });
  const link = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `voice-${story.id}.json` });
  link.click();
  URL.revokeObjectURL(link.href);
}

function render(animate = false) {
  document.documentElement.lang = settings.uiLang;
  document.title = story ? `${story.title[settings.uiLang]} · ${series.title[settings.uiLang]}` : series.title[settings.uiLang];
  root.classList.toggle("app--home", !story);
  root.replaceChildren(buildTopbar(), ...(story ? [buildStage(animate), buildFooter()] : [renderHome({ series, stories, settings })]));
  addTooltips();
}

/** Hover text (title) for every labelled button, so icon buttons explain themselves on a computer. */
function addTooltips(scope = root) {
  for (const el of scope.querySelectorAll("button[aria-label]:not([title])")) el.title = el.getAttribute("aria-label");
}

const actions = {
  prev: () => story && goPage(hashPosition() - 1),
  next: () => story && goPage(hashPosition() + 1),
  start: () => goPage(1),
  continue: () => goPage(progressOf(settings, story.id).lastRead),
  again: () => goPage(1),
  home: goHome,
  lang: (el) => {
    settings.uiLang = settings.storyLang = el.dataset.lang;
    saveSettings(settings);
    render();
  },
  settings: openSettings,
  listen: () => {
    const page = currentPage();
    const src = page && narrationSrc(page);
    if (isPlaying()) stopAudio();
    else if (src) playAudio(src, { advance: settings.readAlong });
  },
  record: async () => {
    await finishRecording();
    stopAudio();
    recordMode = !recordMode;
    recordError = "";
    render();
  },
  "rec-start": beginRecording,
  "rec-stop": finishRecording,
  "rec-play": () => {
    const page = currentPage();
    const src = page && clips.get(keyFor(page.id))?.url;
    if (isPlaying()) stopAudio();
    else if (src) playAudio(src);
  },
  "rec-delete": removeClip,
  install: async () => {
    const event = installPrompt;
    installPrompt = null;
    await event?.prompt();
    render();
  },
  fullscreen: () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.()),
};

root.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]");
  actions[el?.dataset.act]?.(el);
});

document.addEventListener("keydown", (e) => {
  if (document.querySelector("dialog[open]") || !story) return;
  if (e.key === "ArrowRight" || e.key === "PageDown") actions.next();
  else if (e.key === "ArrowLeft" || e.key === "PageUp") actions.prev();
  else if (e.key === "Home") goPage(0);
  else if (e.key === "End") goPage(last());
});

let touchX = null;
root.addEventListener("pointerdown", (e) => { if (e.pointerType === "touch") touchX = e.clientX; });
root.addEventListener("pointerup", (e) => {
  if (touchX == null) return;
  const dx = e.clientX - touchX;
  touchX = null;
  if (Math.abs(dx) > 50 && story) goPage(hashPosition() + (dx < 0 ? 1 : -1));
});

window.addEventListener("beforeinstallprompt", (e) => {
  if (!features.installButton) return; // leave the browser's own install behaviour alone
  e.preventDefault();
  installPrompt = e;
  if (series) render();
});
window.addEventListener("appinstalled", () => (installPrompt = null));

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((error) => console.warn("Service worker:", error));
}

try {
  series = await fetchSeries();
  stories = Object.fromEntries(await Promise.all(series.stories.map(async (id) => [id, await fetchStory(id)])));
  for (const [id, loaded] of Object.entries(stories)) {
    const errors = validateStory(loaded, { sharedCharacters: series.art_direction?.characters });
    if (errors.length) console.warn(`Story ${id}:`, errors);
  }
  window.addEventListener("hashchange", applyRoute);
  await applyRoute();
} catch (error) {
  console.error(error);
  root.textContent = t(settings.uiLang, "loadError");
}
