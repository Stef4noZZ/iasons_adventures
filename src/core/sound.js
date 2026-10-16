// Synthesised UI sounds: no audio assets to ship, cache or license.
let ctx;

function context() {
  const AudioContext = globalThis.AudioContext ?? globalThis.webkitAudioContext;
  if (!AudioContext) return null;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/** Soft paper whoosh: filtered noise with a rising band. */
export function pageTurn() {
  const c = context();
  if (!c) return;
  const length = 0.32;
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * length), c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const source = c.createBufferSource();
  source.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 0.9;
  filter.frequency.setValueAtTime(900, c.currentTime);
  filter.frequency.exponentialRampToValueAtTime(3200, c.currentTime + length);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.16, c.currentTime + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + length);
  source.connect(filter).connect(gain).connect(c.destination);
  source.start();
}

/** Three gentle rising notes for the end of the story. */
export function chime() {
  const c = context();
  if (!c) return;
  [784, 988, 1175].forEach((freq, i) => {
    const t = c.currentTime + i * 0.16;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.1, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 1);
  });
}
