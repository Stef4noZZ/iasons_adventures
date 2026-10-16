// Procedural night-forest scene shown until the real illustration exists.
const PALETTE = {
  sky: ["#1f2a52", "#3a3f78", "#6d5fa3"],
  hills: ["#4b5d86", "#5f7a74", "#6f8f72", "#86a27a"],
  star: "#f2d58a",
};

function rng(seed) {
  let s = seed * 2654435761 >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function hill(rand, y, color) {
  const a = 4 + rand() * 6;
  const p = rand() * Math.PI * 2;
  const pts = [];
  for (let x = 0; x <= 100; x += 5) {
    pts.push(`${x},${(y + Math.sin(x / 100 * Math.PI * 2 + p) * a).toFixed(1)}`);
  }
  return `<polygon points="0,100 ${pts.join(" ")} 100,100" fill="${color}"/>`;
}

export function placeholderSvg(seed, label = "") {
  const rand = rng(seed + 7);
  const stars = Array.from({ length: 34 }, () => {
    const r = 0.25 + rand() * 0.7;
    return `<circle cx="${(rand() * 100).toFixed(1)}" cy="${(rand() * 55).toFixed(1)}" r="${r.toFixed(2)}" fill="${PALETTE.star}" opacity="${(0.4 + rand() * 0.6).toFixed(2)}"/>`;
  }).join("");
  const hills = PALETTE.hills.map((c, i) => hill(rand, 52 + i * 11, c)).join("");
  const moonX = 18 + rand() * 64;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}">
<defs><linearGradient id="s${seed}" x1="0" y1="0" x2="0" y2="1">${PALETTE.sky.map((c, i) => `<stop offset="${i / 2}" stop-color="${c}"/>`).join("")}</linearGradient>
<radialGradient id="m${seed}"><stop offset="0" stop-color="${PALETTE.star}" stop-opacity=".55"/><stop offset="1" stop-color="${PALETTE.star}" stop-opacity="0"/></radialGradient></defs>
<rect width="100" height="100" fill="url(#s${seed})"/>${stars}
<circle cx="${moonX.toFixed(1)}" cy="22" r="14" fill="url(#m${seed})"/><circle cx="${moonX.toFixed(1)}" cy="22" r="4.5" fill="#fbeab8"/>
${hills}</svg>`;
}
