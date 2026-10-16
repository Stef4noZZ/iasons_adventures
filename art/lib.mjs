// Shared drawing kit. Canvas is 1000x1000; the text panel hides roughly the bottom 38%.
export function rng(seed) {
  let s = (seed * 2654435761) >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const f = (n) => Number(n.toFixed(1));

export const C = {
  midnight: "#1f2a52", indigo: "#3a3f78", lavender: "#b9aee0", plum: "#6d5fa3",
  sage: "#7f9b7e", moss: "#5f7f63", forest: "#3f5a47", gold: "#f2c867", goldSoft: "#fbe3a0",
  beige: "#f6efe0", sand: "#e3d3ae", olive: "#7a8450", oliveLight: "#97a368", brown: "#6b4a2f",
  skin: "#f2c9a0", hair: "#6a4428", fox: "#d9772e", foxDark: "#b85d1e", cream: "#fff1d6",
};

export const defs = () => `<defs>
<filter id="wc" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="9"/></filter>
<filter id="wcs" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4"/></filter>
<filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="blur20" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="2"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .3  0 0 0 0 .25  0 0 0 .5 0"/></filter>
<filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="4" seed="5"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 .97  0 0 0 0 .9  0 0 0 .55 -.12"/></filter>
<linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.midnight}"/><stop offset=".55" stop-color="${C.indigo}"/><stop offset="1" stop-color="${C.plum}"/></linearGradient>
<linearGradient id="gDusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3566"/><stop offset=".6" stop-color="#6d5fa3"/><stop offset="1" stop-color="#d6a9b8"/></linearGradient>
<linearGradient id="gPath" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.goldSoft}"/><stop offset="1" stop-color="${C.gold}"/></linearGradient>
<radialGradient id="gGlow"><stop offset="0" stop-color="${C.goldSoft}" stop-opacity=".95"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></radialGradient>
<radialGradient id="gGlowW"><stop offset="0" stop-color="#fff6d8" stop-opacity=".9"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
<linearGradient id="gHill1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a6c9a"/><stop offset="1" stop-color="#3f4f80"/></linearGradient>
<linearGradient id="gHill2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f8a7a"/><stop offset="1" stop-color="#456b62"/></linearGradient>
<linearGradient id="gHill3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ea67c"/><stop offset="1" stop-color="#4f7a58"/></linearGradient>
<linearGradient id="gGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb283"/><stop offset="1" stop-color="#4c7656"/></linearGradient>
</defs>`;

export const svg = (body, { label = "" } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" role="img" aria-label="${label}">
${defs()}${body}
<rect width="1000" height="1000" filter="url(#paper)" style="mix-blend-mode:multiply" opacity=".55"/>
<rect width="1000" height="1000" filter="url(#grain)" style="mix-blend-mode:multiply" opacity=".35"/>
</svg>`;

export const wc = (inner, id = "wc") => `<g filter="url(#${id})">${inner}</g>`;

export function sky(kind = "gSky") {
  return `<rect width="1000" height="1000" fill="url(#${kind})"/>`;
}

export function stars(seed, n = 60, ymax = 450) {
  const r = rng(seed);
  return Array.from({ length: n }, () => {
    const x = f(r() * 1000), y = f(r() * ymax), s = 1.2 + r() * 3.2;
    return r() > 0.82 ? sparkle(x, y, s * 3.2, C.goldSoft, 0.9) : `<circle cx="${x}" cy="${y}" r="${f(s)}" fill="${C.goldSoft}" opacity="${f(0.35 + r() * 0.6)}"/>`;
  }).join("");
}

export function sparkle(x, y, s, color = C.goldSoft, o = 1) {
  const a = s, b = s * 0.22;
  return `<path d="M${x} ${f(y - a)} Q${f(x + b)} ${f(y - b)} ${f(x + a)} ${y} Q${f(x + b)} ${f(y + b)} ${x} ${f(y + a)} Q${f(x - b)} ${f(y + b)} ${f(x - a)} ${y} Q${f(x - b)} ${f(y - b)} ${x} ${f(y - a)}Z" fill="${color}" opacity="${o}"/>`;
}

export function moon(x, y, r = 60) {
  return `<circle cx="${x}" cy="${y}" r="${r * 3.2}" fill="url(#gGlowW)" opacity=".7"/>
<circle cx="${x}" cy="${y}" r="${r}" fill="#fff3cf"/><circle cx="${x + r * 0.28}" cy="${y - r * 0.2}" r="${r * 0.82}" fill="#fff9e6" opacity=".7"/>
<circle cx="${x - r * 0.3}" cy="${y + r * 0.2}" r="${r * 0.14}" fill="#f1e2b4" opacity=".7"/><circle cx="${x + r * 0.15}" cy="${y + r * 0.45}" r="${r * 0.1}" fill="#f1e2b4" opacity=".7"/>`;
}

export function cloud(x, y, s = 1, o = 0.22) {
  return `<g opacity="${o}" fill="#e9defa" transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="120" ry="28"/><ellipse cx="-40" cy="-18" rx="55" ry="30"/><ellipse cx="30" cy="-24" rx="65" ry="34"/></g>`;
}

/** Rolling hill band; baseline y with amplitude a. */
export function hill(y, a, fill, seed = 1, phase = 0) {
  const r = rng(seed);
  const p1 = r() * 6 + phase, p2 = r() * 6;
  const pts = [];
  for (let x = 0; x <= 1000; x += 40) pts.push(`${x} ${f(y + Math.sin(x / 1000 * 5 + p1) * a + Math.sin(x / 1000 * 11 + p2) * a * 0.35)}`);
  return `<path d="M0 1500 L${pts.join(" L")} L1000 1500Z" fill="${fill}"/>`;
}

export function pine(x, y, h, color = C.forest, tip = null) {
  const w = h * 0.42;
  const tiers = [0, 1, 2].map((i) => {
    const ty = y - h * (0.28 + i * 0.28), tw = w * (1 - i * 0.26);
    return `<path d="M${f(x - tw)} ${f(ty + h * 0.32)} Q${x} ${f(ty - h * 0.02)} ${f(x + tw)} ${f(ty + h * 0.32)} Q${x} ${f(ty + h * 0.24)} ${f(x - tw)} ${f(ty + h * 0.32)}Z" fill="${color}"/>`;
  }).join("");
  return `<rect x="${f(x - h * 0.035)}" y="${f(y - h * 0.22)}" width="${f(h * 0.07)}" height="${f(h * 0.24)}" fill="#4a3526"/>${tiers}`;
}

export function roundTree(x, y, h, leaf = C.moss, leaf2 = C.sage) {
  const tw = h * 0.07;
  return `<path d="M${f(x - tw)} ${y} Q${f(x - tw * 0.4)} ${f(y - h * 0.4)} ${f(x - tw * 0.7)} ${f(y - h * 0.62)} L${f(x + tw * 0.7)} ${f(y - h * 0.62)} Q${f(x + tw * 0.4)} ${f(y - h * 0.4)} ${f(x + tw)} ${y}Z" fill="#5a4030"/>
<ellipse cx="${x}" cy="${f(y - h * 0.78)}" rx="${f(h * 0.34)}" ry="${f(h * 0.3)}" fill="${leaf}"/>
<ellipse cx="${f(x - h * 0.16)}" cy="${f(y - h * 0.68)}" rx="${f(h * 0.22)}" ry="${f(h * 0.2)}" fill="${leaf}"/>
<ellipse cx="${f(x + h * 0.17)}" cy="${f(y - h * 0.7)}" rx="${f(h * 0.2)}" ry="${f(h * 0.18)}" fill="${leaf}"/>
<ellipse cx="${f(x + h * 0.06)}" cy="${f(y - h * 0.86)}" rx="${f(h * 0.2)}" ry="${f(h * 0.14)}" fill="${leaf2}" opacity=".6"/>`;
}

export function flower(x, y, s = 1, petal = C.lavender, glow = false, droop = 0) {
  const stem = `<path d="M${x} ${y} Q${f(x + 6 * s)} ${f(y - 30 * s)} ${x} ${f(y - 58 * s)}" stroke="${C.moss}" stroke-width="${f(5 * s)}" fill="none" stroke-linecap="round"/><ellipse cx="${f(x + 12 * s)}" cy="${f(y - 24 * s)}" rx="${f(12 * s)}" ry="${f(5 * s)}" fill="${C.sage}" transform="rotate(-25 ${f(x + 12 * s)} ${f(y - 24 * s)})"/>`;
  const cx = x, cy = y - 62 * s;
  const petals = [0, 72, 144, 216, 288].map((a) => `<ellipse cx="${cx}" cy="${f(cy - 15 * s)}" rx="${f(10 * s)}" ry="${f(16 * s)}" fill="${petal}" transform="rotate(${a} ${cx} ${f(cy)})"/>`).join("");
  return `<g transform="rotate(${droop} ${x} ${y})">${glow ? `<circle cx="${cx}" cy="${f(cy)}" r="${f(48 * s)}" fill="url(#gGlow)"/>` : ""}${stem}${petals}<circle cx="${cx}" cy="${f(cy)}" r="${f(8 * s)}" fill="${droop ? "#b9a875" : C.gold}"/></g>`;
}

export function grassTufts(seed, n, y0, y1, color = "#3f6a4c") {
  const r = rng(seed);
  return Array.from({ length: n }, () => {
    const x = f(r() * 1000), y = f(y0 + r() * (y1 - y0)), h = 14 + r() * 22;
    return `<path d="M${x} ${y} Q${f(x - 3)} ${f(y - h * 0.6)} ${f(x - 8)} ${f(y - h)} M${x} ${y} Q${x} ${f(y - h * 0.7)} ${x} ${f(y - h * 1.15)} M${x} ${y} Q${f(x + 3)} ${f(y - h * 0.6)} ${f(x + 9)} ${f(y - h * 0.95)}" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`;
  }).join("");
}

export function firefly(x, y, s = 1) {
  return `<circle cx="${x}" cy="${y}" r="${f(26 * s)}" fill="url(#gGlow)"/><circle cx="${x}" cy="${y}" r="${f(4.5 * s)}" fill="#fff8d6"/>`;
}

export function mushroom(x, y, s = 1, cap = "#d77a6a") {
  return `<path d="M${f(x - 5 * s)} ${y} Q${f(x - 7 * s)} ${f(y - 22 * s)} ${f(x - 4 * s)} ${f(y - 30 * s)} L${f(x + 4 * s)} ${f(y - 30 * s)} Q${f(x + 7 * s)} ${f(y - 22 * s)} ${f(x + 5 * s)} ${y}Z" fill="${C.beige}"/>
<path d="M${f(x - 24 * s)} ${f(y - 28 * s)} Q${x} ${f(y - 60 * s)} ${f(x + 24 * s)} ${f(y - 28 * s)} Q${x} ${f(y - 22 * s)} ${f(x - 24 * s)} ${f(y - 28 * s)}Z" fill="${cap}"/><circle cx="${f(x - 8 * s)}" cy="${f(y - 38 * s)}" r="${f(3 * s)}" fill="${C.beige}"/><circle cx="${f(x + 8 * s)}" cy="${f(y - 34 * s)}" r="${f(2.4 * s)}" fill="${C.beige}"/>`;
}

/** Soft ground shadow. */
export const shadow = (x, y, rx) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${f(rx * 0.16)}" fill="#1f2a52" opacity=".28" filter="url(#blur8)"/>`;

/**
 * Jason. Origin at the feet; ~290 units tall at s=1. Faces right; flip mirrors.
 * armL/armR are outward angles in degrees (0 = hanging, 90 = horizontal, 170 = straight up).
 */
export function jason({ x, y, s = 1, flip = false, outfit = "explorer", hat = true, armL = 12, armR = 12, look = [0, 0], mouth = "smile", walk = 0, pack = true } = {}) {
  const jacket = outfit === "pj" ? "#8e9fd6" : C.olive;
  const jacketL = outfit === "pj" ? "#a9b8e6" : C.oliveLight;
  const pants = outfit === "pj" ? "#8e9fd6" : "#d9c7a0";
  const boots = outfit === "pj" ? "#f0e6d0" : C.brown;
  const [lx, ly] = look;
  const eye = (cx) => `<circle cx="${cx}" cy="-198" r="7" fill="#fff"/><circle cx="${f(cx + lx * 2.2)}" cy="${f(-198 + ly * 2.2)}" r="5.2" fill="#3a2a20"/><circle cx="${f(cx + lx * 2.2 + 1.8)}" cy="${f(-198 + ly * 2.2 - 1.8)}" r="1.7" fill="#fff"/>`;
  const mouthPath = { smile: "M-11 -172 Q0 -160 11 -172", open: "M-10 -172 Q0 -152 10 -172Z", calm: "M-8 -171 Q0 -166 8 -171" }[mouth];
  const arm = (side, a) => {
    const sx = side * 34;
    return `<g transform="translate(${sx} -138) rotate(${-side * a})"><rect x="-10" y="-8" width="20" height="74" rx="10" fill="${jacket}"/><circle cx="0" cy="68" r="11.5" fill="${C.skin}"/></g>`;
  };
  const stepL = walk * 12, stepR = -walk * 12;
  const hatSvg = hat ? `<ellipse cx="0" cy="-236" rx="70" ry="15" fill="#8c9560"/><path d="M-46 -238 Q-44 -296 0 -298 Q44 -296 46 -238Z" fill="${C.olive}"/><rect x="-46" y="-252" width="92" height="13" rx="5" fill="${C.brown}"/><ellipse cx="-14" cy="-282" rx="14" ry="8" fill="#a6b072" opacity=".6"/>` : "";
  const hairSvg = `<path d="M-50 -204 Q-54 -250 0 -252 Q54 -250 50 -204 Q42 -232 0 -234 Q-42 -232 -50 -204Z" fill="${C.hair}"/>${hat ? "" : `<path d="M-6 -254 Q4 -276 14 -256" stroke="${C.hair}" stroke-width="9" fill="none" stroke-linecap="round"/>`}`;
  return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})" filter="url(#wcs)">
${shadow(0, 2, 62)}
${pack && outfit !== "pj" ? `<rect x="-52" y="-142" width="32" height="64" rx="12" fill="#8a5a34"/><rect x="-48" y="-128" width="22" height="18" rx="6" fill="#a9744a"/>` : ""}
<rect x="${-26 + stepL}" y="-72" width="22" height="60" rx="9" fill="${pants}"/><rect x="${4 + stepR}" y="-72" width="22" height="60" rx="9" fill="${pants}"/>
<path d="M${-30 + stepL} -2 Q${-30 + stepL} -22 ${-22 + stepL} -22 L${-6 + stepL} -22 L${-2 + stepL} -2Z" fill="${boots}"/><path d="M${2 + stepR} -2 L${6 + stepR} -22 L${22 + stepR} -22 Q${34 + stepR} -22 ${34 + stepR} -2Z" fill="${boots}"/>
${arm(-1, armL)}
<rect x="-36" y="-156" width="72" height="96" rx="26" fill="${jacket}"/><rect x="-36" y="-156" width="30" height="96" rx="20" fill="${jacketL}" opacity=".45"/>
<rect x="-36" y="-92" width="72" height="9" fill="${C.brown}" opacity=".85"/><rect x="-26" y="-80" width="22" height="18" rx="5" fill="${C.brown}" opacity=".25"/>
<rect x="-12" y="-162" width="24" height="14" rx="6" fill="${C.skin}"/>
${arm(1, armR)}
<circle cx="-50" cy="-196" r="11" fill="${C.skin}"/><circle cx="50" cy="-196" r="11" fill="${C.skin}"/>
<circle cx="0" cy="-200" r="52" fill="${C.skin}"/><ellipse cx="-14" cy="-218" rx="22" ry="12" fill="#fde0bf" opacity=".5"/>
${hairSvg}${hatSvg}
${eye(-18)}${eye(18)}
<circle cx="-32" cy="-180" r="10" fill="#f19a8a" opacity=".5"/><circle cx="32" cy="-180" r="10" fill="#f19a8a" opacity=".5"/>
<path d="M-3 -186 Q0 -182 3 -186" stroke="#d99a78" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="${mouthPath}" stroke="#a5503f" stroke-width="3.5" fill="${mouth === "open" ? "#a5503f" : "none"}" stroke-linecap="round"/>
</g>`;
}

/** Phoebus the fox, sitting. Origin at the base; ~215 units tall at s=1. Faces right. */
export function phoebus({ x, y, s = 1, flip = false, mood = "happy", tail = 0 } = {}) {
  const eyes = mood === "sad"
    ? `<path d="M26 -146 Q34 -154 44 -146" stroke="#3a2418" stroke-width="3.5" fill="none" stroke-linecap="round"/>`
    : `<ellipse cx="35" cy="-144" rx="7.5" ry="9" fill="#3a2418"/><circle cx="37.5" cy="-148" r="2.8" fill="#fff"/><path d="M26 -158 Q35 -163 45 -157" stroke="${C.foxDark}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})" filter="url(#wcs)">
${shadow(0, 2, 70)}
<g transform="rotate(${tail} -40 -30)"><path d="M-40 -22 Q-120 -10 -118 -88 Q-112 -140 -70 -150 Q-96 -92 -40 -60Z" fill="${C.fox}"/><path d="M-118 -88 Q-112 -140 -70 -150 Q-84 -128 -92 -108 Q-106 -96 -118 -88Z" fill="${C.cream}"/></g>
<ellipse cx="-4" cy="-56" rx="50" ry="58" fill="${C.fox}"/><ellipse cx="18" cy="-50" rx="27" ry="42" fill="${C.cream}"/>
<ellipse cx="-22" cy="-30" rx="36" ry="30" fill="#c4651f"/>
<rect x="14" y="-52" width="19" height="52" rx="9" fill="${C.fox}"/><rect x="14" y="-22" width="19" height="22" rx="9" fill="#5a3a28"/>
<ellipse cx="-24" cy="-6" rx="30" ry="12" fill="#5a3a28"/>
<path d="M-8 -150 L-12 -214 L30 -176Z" fill="${C.fox}"/><path d="M-6 -158 L-6 -196 L18 -176Z" fill="#f3b88c"/>
<path d="M34 -178 L56 -224 L72 -170Z" fill="${C.fox}"/><path d="M42 -178 L56 -208 L64 -176Z" fill="#f3b88c"/>
<ellipse cx="26" cy="-136" rx="52" ry="42" fill="${C.fox}"/>
<path d="M-22 -128 Q-34 -112 -14 -108 Q-8 -118 -6 -126Z" fill="${C.cream}"/>
<path d="M30 -122 Q56 -140 92 -126 Q100 -112 84 -100 Q58 -92 30 -104Z" fill="${C.cream}"/>
<ellipse cx="90" cy="-124" rx="9" ry="7" fill="#3a2418"/>
${eyes}
<path d="M58 -108 Q70 -98 82 -106" stroke="#7a4a30" stroke-width="3" fill="none" stroke-linecap="round"/>
<circle cx="52" cy="-122" r="9" fill="#f19a8a" opacity=".45"/>
</g>`;
}


export function twigs(cx, cy, w, seed = 1) {
  const r = rng(seed);
  return Array.from({ length: 9 }, () => {
    const x1 = cx - w / 2 + r() * w, y1 = cy - 30 + r() * 60, a = (r() - 0.5) * 2.4, l = w * (0.35 + r() * 0.35);
    const x2 = x1 + Math.cos(a) * l, y2 = y1 + Math.sin(a) * l * 0.7;
    return `<path d="M${f(x1)} ${f(y1)} Q${f((x1 + x2) / 2 + 8)} ${f((y1 + y2) / 2 - 10)} ${f(x2)} ${f(y2)}" stroke="#6b4a2f" stroke-width="${f(7 + r() * 5)}" stroke-linecap="round" fill="none"/>`;
  }).join("");
}

export function bunny({ x, y, s = 1, flip = false, mood = "happy", hop = 0 } = {}) {
  const sad = mood === "sad";
  const ears = sad
    ? `<ellipse cx="-6" cy="-146" rx="12" ry="38" transform="rotate(-62 -6 -146)" fill="#d6c4ae"/><ellipse cx="38" cy="-150" rx="12" ry="38" transform="rotate(58 38 -150)" fill="#d6c4ae"/>`
    : `<ellipse cx="6" cy="-170" rx="12" ry="40" transform="rotate(-10 6 -170)" fill="#d6c4ae"/><ellipse cx="8" cy="-170" rx="6" ry="30" transform="rotate(-10 6 -170)" fill="#f2b9bf"/><ellipse cx="36" cy="-172" rx="12" ry="40" transform="rotate(12 36 -172)" fill="#d6c4ae"/><ellipse cx="34" cy="-172" rx="6" ry="30" transform="rotate(12 36 -172)" fill="#f2b9bf"/>`;
  return `<g transform="translate(${x} ${y - hop}) scale(${flip ? -s : s} ${s})" filter="url(#wcs)">
${shadow(0, 2 + hop, 56)}
<circle cx="-44" cy="-32" r="17" fill="#fbf3e4"/>
<ellipse cx="0" cy="-50" rx="44" ry="48" fill="#d6c4ae"/><ellipse cx="16" cy="-44" rx="24" ry="34" fill="#f4ead9"/>
<ellipse cx="-14" cy="-26" rx="30" ry="24" fill="#c9b49b"/>
<rect x="20" y="-24" width="18" height="24" rx="9" fill="#d6c4ae"/><ellipse cx="-8" cy="-6" rx="26" ry="10" fill="#c9b49b"/>
${ears}
<ellipse cx="22" cy="-112" rx="36" ry="32" fill="#d6c4ae"/>
<ellipse cx="44" cy="-102" rx="17" ry="12" fill="#f4ead9"/><ellipse cx="57" cy="-108" rx="5.5" ry="4" fill="#e58f9a"/>
<circle cx="35" cy="-118" r="6.5" fill="#3a2a20"/><circle cx="37" cy="-120.5" r="2.2" fill="#fff"/>${sad ? `<path d="M26 -131 L44 -126" stroke="#8a7560" stroke-width="3" stroke-linecap="round"/>` : ""}
<circle cx="30" cy="-102" r="8" fill="#f19a8a" opacity=".5"/>
<path d="M50 -96 Q56 -92 62 -97" stroke="#9a6a60" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</g>`;
}

export function owl({ x, y, s = 1, flip = false, mood = "happy", wing = 0 } = {}) {
  const brow = mood === "worried" ? `<path d="M-34 -146 L-8 -138 M34 -146 L8 -138" stroke="#6b4a2f" stroke-width="4" stroke-linecap="round"/>` : "";
  const scallops = [[-14, -76], [14, -76], [0, -60], [-22, -56], [22, -56], [0, -42], [-14, -38], [14, -38]].map(([a, b]) => `<path d="M${a - 8} ${b} Q${a} ${b + 9} ${a + 8} ${b}" stroke="#c9a77c" stroke-width="2.5" fill="none"/>`).join("");
  return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})" filter="url(#wcs)">
${shadow(0, 2, 44)}
<g transform="rotate(${-wing} 42 -90)"><ellipse cx="50" cy="-62" rx="16" ry="46" transform="rotate(-8 50 -62)" fill="#8a6444"/></g>
<ellipse cx="-50" cy="-62" rx="16" ry="46" transform="rotate(8 -50 -62)" fill="#8a6444"/>
<ellipse cx="0" cy="-62" rx="46" ry="62" fill="#a37d58"/><ellipse cx="0" cy="-52" rx="30" ry="46" fill="#f0dfc0"/>${scallops}
<path d="M-40 -150 L-46 -184 L-14 -160Z" fill="#a37d58"/><path d="M40 -150 L46 -184 L14 -160Z" fill="#a37d58"/>
<ellipse cx="0" cy="-124" rx="48" ry="38" fill="#a37d58"/>
<circle cx="-19" cy="-124" r="21" fill="#f6ead2"/><circle cx="19" cy="-124" r="21" fill="#f6ead2"/>
<circle cx="-19" cy="-124" r="12" fill="#3a2a20"/><circle cx="19" cy="-124" r="12" fill="#3a2a20"/>
<circle cx="-15" cy="-128" r="4" fill="#fff"/><circle cx="23" cy="-128" r="4" fill="#fff"/>${brow}
<path d="M-7 -112 L7 -112 L0 -98Z" fill="#e8b34a"/>
<ellipse cx="-16" cy="-2" rx="14" ry="6" fill="#e8b34a"/><ellipse cx="16" cy="-2" rx="14" ry="6" fill="#e8b34a"/>
</g>`;
}

/** The little star. mood: dim | glow. */
export function star({ x, y, s = 1, mood = "glow" } = {}) {
  const R = 78, r = 38;
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (-90 + i * 36) * Math.PI / 180, d = i % 2 ? r : R;
    return `${f(Math.cos(a) * d)},${f(Math.sin(a) * d)}`;
  }).join(" ");
  const dim = mood === "dim";
  const fill = dim ? "#cdbd86" : "#ffd96e";
  return `<g transform="translate(${x} ${y}) scale(${s})">
<circle r="${dim ? 90 : 190}" fill="url(#gGlow)" opacity="${dim ? 0.45 : 1}"/>
<g filter="url(#wcs)"><polygon points="${pts}" fill="${fill}" stroke="${fill}" stroke-width="22" stroke-linejoin="round"/>
<polygon points="${pts}" fill="${dim ? "#dccf9e" : "#fff0b0"}" transform="scale(.62) translate(-6 -6)" stroke="${dim ? "#dccf9e" : "#fff0b0"}" stroke-width="14" stroke-linejoin="round" opacity=".7"/>
<circle cx="-17" cy="-4" r="6" fill="#4a3a28"/><circle cx="17" cy="-4" r="6" fill="#4a3a28"/><circle cx="-15" cy="-6" r="2" fill="#fff"/><circle cx="19" cy="-6" r="2" fill="#fff"/>
<circle cx="-30" cy="8" r="7" fill="#f19a8a" opacity=".55"/><circle cx="30" cy="8" r="7" fill="#f19a8a" opacity=".55"/>
<path d="${dim ? "M-9 16 Q0 10 9 16" : "M-11 12 Q0 26 11 12"}" stroke="#a5503f" stroke-width="3.5" fill="none" stroke-linecap="round"/></g>
${dim ? "" : sparkle(-110, -70, 20) + sparkle(120, -50, 16) + sparkle(100, 100, 14)}
</g>`;
}

export function ancientTree(x, y, h = 520) {
  return `<path d="M${x - 70} ${y} Q${x - 90} ${y - h * 0.4} ${x - 50} ${y - h * 0.8} L${x + 50} ${y - h * 0.8} Q${x + 90} ${y - h * 0.4} ${x + 70} ${y}Z" fill="#5a4030"/>
<ellipse cx="${x}" cy="${y - h * 0.9}" rx="${h * 0.55}" ry="${h * 0.3}" fill="#34594a"/><ellipse cx="${x - h * 0.3}" cy="${y - h * 0.78}" rx="${h * 0.28}" ry="${h * 0.2}" fill="#3f6a52"/><ellipse cx="${x + h * 0.3}" cy="${y - h * 0.8}" rx="${h * 0.3}" ry="${h * 0.2}" fill="#3f6a52"/>
<ellipse cx="${x - h * 0.05}" cy="${y - h * 1.0}" rx="${h * 0.25}" ry="${h * 0.12}" fill="#5a8a6a" opacity=".6"/>
${roots(x, y)}`;
}
export function roots(x, y) {
  return `<path d="M${x - 70} ${y} Q${x - 150} ${y - 10} ${x - 230} ${y + 30} Q${x - 150} ${y + 14} ${x - 110} ${y + 30} Q${x - 70} ${y + 10} ${x - 30} ${y + 14}Z" fill="#4a3526"/>
<path d="M${x + 70} ${y} Q${x + 150} ${y - 10} ${x + 230} ${y + 30} Q${x + 150} ${y + 14} ${x + 110} ${y + 30} Q${x + 70} ${y + 10} ${x + 30} ${y + 14}Z" fill="#4a3526"/>
<path d="M${x - 40} ${y - 10} Q${x - 60} ${y + 40} ${x - 20} ${y + 56} M${x + 40} ${y - 10} Q${x + 60} ${y + 40} ${x + 20} ${y + 56}" stroke="#4a3526" stroke-width="22" fill="none" stroke-linecap="round"/>`;
}

export function stream(y, h, seed = 1) {
  const r = rng(seed), p = r() * 6;
  const top = [], bot = [];
  for (let x = 0; x <= 1000; x += 50) { const w = Math.sin(x / 1000 * 4 + p) * 22; top.push(`${x} ${f(y + w)}`); bot.push(`${1000 - x} ${f(y + h + Math.sin((1000 - x) / 1000 * 4 + p + 0.6) * 22)}`); }
  return `<path d="M${top.join(" L")} L${bot.join(" L")}Z" fill="#6c8fc4"/>
<path d="M${top.join(" L")} L${bot.join(" L")}Z" fill="url(#gGlowW)" opacity=".25"/>
${[0.2, 0.45, 0.7].map((k, i) => `<path d="M${80 + i * 260} ${f(y + h * k)} q40 -10 80 0 t80 0" stroke="#d9e6ff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>`).join("")}`;
}

export function stone(x, y, w = 70) {
  return `<ellipse cx="${x}" cy="${y}" rx="${w * 1.5}" ry="${w * 0.9}" fill="url(#gGlow)" opacity=".8"/><ellipse cx="${x}" cy="${y}" rx="${w * 0.62}" ry="${w * 0.26}" fill="#e8dcc0"/><ellipse cx="${x}" cy="${y - 4}" rx="${w * 0.5}" ry="${w * 0.18}" fill="#fff6d8"/>`;
}

export function glowTint(color = "#ffcf6a", o = 0.22) {
  return `<rect width="1000" height="1000" fill="${color}" opacity="${o}" style="mix-blend-mode:soft-light"/>`;
}

/** Shift scenery up so the horizon sits inside the part of the page not covered by the text panel. */
export const up = (dy, inner) => `<g transform="translate(0 ${-dy})">${inner}</g>`;

export const lines = (...parts) => parts.filter(Boolean).join("\n");

/** Common night-forest backdrop: sky, hills, trees and a grassy ground that starts near y=330 on screen. */
export function nightForest(seed, { moonAt = [800, 110], skyId = "gSky", pines: pn = [40, 150, 860, 960], trees = [250, 740], ground = true } = {}) {
  return lines(
    sky(skyId), stars(seed, 36, 260), moon(moonAt[0], moonAt[1], 38),
    up(240, lines(
      wc(lines(
        hill(360, 20, "url(#gHill1)", seed),
        pn.map((x, i) => pine(x, 520, 330 + (i * 31) % 60, "#2f5546")).join(""),
        trees.map((x) => roundTree(x, 540, 300, "#4f7a58", "#7ea67c")).join(""),
        hill(530, 18, "url(#gHill2)", seed + 5, 2),
      )),
      ground ? `<ellipse cx="500" cy="640" rx="360" ry="110" fill="url(#gGlow)" opacity=".3"/><rect y="560" width="1000" height="940" fill="url(#gGround)"/>${grassTufts(seed + 1, 40, 580, 860)}` : "",
    )),
  );
}
export const flies = (pts) => pts.map(([x, y], i) => firefly(x, y, 1 + (i % 2) * 0.3)).join("");
