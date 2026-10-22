// Colonna sonora originale di Dark, stagione 1 (formato "Spiegato semplice"): droni elettronici gravi, archi lenti e un
// ticchettio d'orologio che fa da metronomo. Il motivo è inventato qui: quattro note in Do minore (Do, Mi bemolle, Re,
// Sol) che tornano sempre uguali, come il cerchio del racconto; cupo nel bunker, spezzato nel 2052. Niente brani o motivi
// della serie. Effetti agganciati agli eventi della parete in src/scenes/dark-stagione-1/Parete.tsx.
import { put, rng, note, drum, whoosh, pop, FX } from './synth.mjs';
import { loadFilm, timeline } from './film.mjs';

const TAU = Math.PI * 2;
const SR = 44100;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const vamp = (v) => (v / 127) ** 1.6;

// ---------------------------------------------------------------- strumenti locali (via put)

/** Drone grave: due seghe scordate filtrate, battimento lento. */
const drone = (mix, m, { t, dur, vel = 40, gain = 1, bright = 2, seed = 1 }) => {
  const f = mtof(m);
  const r = rng(seed * 71 + Math.round(t * 100));
  const ph = [r(), r()];
  let lp = 0;
  put(mix, t, Math.ceil((dur + 2) * SR), (i) => {
    const x = i / SR;
    const open = 1 - Math.exp((-TAU * f * bright * (0.7 + 0.3 * Math.sin(TAU * 0.05 * x))) / SR);
    const s = (2 * ((ph[0] + f * x) % 1) - 1) + (2 * ((ph[1] + f * 1.004 * x) % 1) - 1);
    lp += open * (s / 2 - lp);
    const env = Math.min(1, x / 2) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / 2));
    return lp * env;
  }, { gain: gain * vamp(vel), rev: 0.6 });
};

/** Archi: tre seghe scordate con vibrato e attacco lento. */
const strings = (mix, m, { t, dur, vel = 40, pan = 0, gain = 1, att = 1.2, seed = 1 }) => {
  const f = mtof(m);
  const r = rng(seed * 977 + Math.round(t * 1000) + m);
  const dets = [-6, 0, 6].map((c) => f * 2 ** (c / 1200));
  const ph = dets.map(() => r());
  const a = 1 - Math.exp((-TAU * f * 3) / SR);
  let lp = 0;
  put(mix, t, Math.ceil((dur + 1.4) * SR), (i) => {
    const x = i / SR;
    const vib = 1 + 0.003 * Math.sin(TAU * 5 * x) * Math.min(1, x / 1.5);
    let s = 0;
    for (let k = 0; k < 3; k++) s += 2 * ((ph[k] + dets[k] * vib * x) % 1) - 1;
    lp += a * (s / 3 - lp);
    const env = Math.min(1, x / att) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / 1.4));
    return lp * env;
  }, { gain: gain * vamp(vel), pan, rev: 0.65 });
};

/** Campanella cristallina (targhe, impermeabile, finale). */
const bell = (mix, m, { t, vel = 46, pan = 0, gain = 1 }) => {
  const f = mtof(m);
  put(mix, t, Math.ceil(3 * SR), (i) => {
    const x = i / SR;
    return (Math.sin(TAU * f * x) * Math.exp(-x / 1.4) + 0.4 * Math.sin(TAU * 2.76 * f * x) * Math.exp(-x / 0.6) + 0.2 * Math.sin(TAU * 5.4 * f * x) * Math.exp(-x / 0.25)) * Math.min(1, x / 0.002);
  }, { gain: gain * vamp(vel) * 0.45, pan, rev: 0.75 });
};

/** Tic dell'orologio: clic secco e brevissimo, alternato tic/tac. */
const tick = (mix, t, { vel = 34, tac = false } = {}) => {
  const f = tac ? 2600 : 3400;
  const r = rng(Math.round(t * 1000));
  put(mix, t, Math.ceil(0.03 * SR), (i) => {
    const x = i / SR;
    return (Math.sin(TAU * f * x) * 0.6 + (r() * 2 - 1) * 0.4) * Math.exp(-x / 0.004);
  }, { gain: FX * vamp(vel) * 0.3, pan: tac ? -0.2 : 0.2, rev: 0.15 });
};

/** Rombo grave (terremoto nella grotta): rumore marrone filtrato con salita e discesa. */
const rumble = (mix, t0, dur, { vel = 50, seed = 3 } = {}) => {
  const r = rng(seed);
  let b = 0, lp = 0;
  put(mix, t0, Math.ceil(dur * SR), (i) => {
    const u = i / (dur * SR);
    b = 0.99 * b + 0.05 * (r() * 2 - 1);
    lp += 0.04 * (b - lp);
    return lp * 7 * Math.sin(Math.PI * Math.min(1, u * 1.3)) ** 0.8;
  }, { gain: FX * vamp(vel), rev: 0.3 });
};

// ---------------------------------------------------------------- materiale musicale

// il motivo del cerchio: [tempo, nota MIDI, durata in tempi], 2 battute in 4/4
const MOTIF = [[0, 72, 2], [2, 75, 2], [4, 74, 2], [6, 67, 2]];
// accordi per battuta (radice MIDI, intervalli): Do minore · La bemolle · Fa minore · Sol (sospeso)
const CHORDS = [[48, [0, 3, 7]], [44, [0, 4, 7]], [41, [0, 3, 7]], [43, [0, 5, 7]]];

export default (mix, T) => {
  const film = loadFilm('dark-stagione-1');
  const { segments } = timeline(film);
  const segs = Object.fromEntries(segments.map((s) => [s.id, s]));
  /** Inizio assoluto della frase n del capitolo, come subtitleTimes in ChapterOverlay.tsx. */
  const C = (id, n) => {
    const s = segs[id];
    const w = s.testo.map((l) => l.length + 6);
    const tot = w.reduce((a, b) => a + b, 0);
    let cur = 0.15;
    for (let k = 0; k < n; k++) cur += (w[k] / tot) * (s.dur - 0.35);
    return s.start + cur;
  };
  const SIGLA = 1.5;
  let sid = 0;

  /**
   * Una sezione da `from` a `to`.
   * bpm · drone (livello) · str: archi · mel: motivo (livello, keep = probabilità di ogni nota, oct) · ticks: orologio
   * pulse: colpo sordo a ogni battuta · broken: il motivo salta note e si abbassa (2052)
   */
  const sec = (from, to, o) => {
    const beat = 60 / o.bpm, bar = 4 * beat;
    const R = rng(7000 + sid++ * 131);
    if (o.drone) {
      drone(mix, 36, { t: from, dur: to - from, vel: o.drone, gain: 0.7, seed: sid });
      drone(mix, 43, { t: from, dur: to - from, vel: o.drone * 0.8, gain: 0.5, bright: 3, seed: sid + 50 });
    }
    for (let k = 0, t = from; t < to - 0.3; k++, t += bar) {
      const [root, iv] = CHORDS[k % 4];
      const d = Math.min(bar * 1.02, to - t);
      if (o.str) iv.forEach((v, j) => strings(mix, root + 12 + v, { t: t + j * 0.04, dur: d, vel: o.str, gain: 0.6, pan: (j - 1) * 0.35, seed: j + k }));
      if (o.pad) iv.forEach((v, j) => note(mix, 'pad', mtof(root + 12 + v), { t, dur: d, vel: o.pad, rev: 0.6, pan: (j - 1) * 0.3, gain: 0.45, seed: j + 1 }));
      if (o.pulse) drum(mix, 'softkick', t, o.pulse, 5);
      if (o.ticks) for (let b = 0; b < 4; b++) if (t + b * beat < to) tick(mix, t + b * beat, { vel: o.ticks, tac: b % 2 === 1 });
      if (o.mel && k % 2 === 0) {
        for (const [b, m, len] of MOTIF) {
          const tt = t + b * beat;
          if (tt >= to - 0.2 || R() > (o.keep ?? 1)) continue;
          const mm = m + (o.oct ?? 0) - (o.broken && R() > 0.5 ? 1 : 0);
          note(mix, 'vibes', mtof(mm), { t: tt, dur: Math.min(len * beat, to - tt), vel: o.mel, rev: 0.6, pan: 0.15, gain: 0.55 });
          if (o.bells) bell(mix, mm + 12, { t: tt + 0.01, vel: o.bells, pan: -0.25 });
        }
      }
    }
  };

  // ---- sezioni (tempi dal JSON): la parete delle indagini si riempie, la musica cresce con lo schema
  sec(SIGLA, T.winden, { bpm: 66, drone: 36, mel: 44, bells: 26 });
  sec(T.winden, T.mikkel, { bpm: 66, drone: 36, mel: 42, ticks: 30, pad: 30 });
  sec(T.mikkel, T.trentatre, { bpm: 66, drone: 40, ticks: 30, mel: 40, str: 30 });
  sec(T.trentatre, T.michael, { bpm: 66, drone: 42, mel: 50, oct: 12, bells: 36, ticks: 30, pad: 44 });
  sec(T.michael, T.noah, { bpm: 66, drone: 40, str: 40, mel: 46, ticks: 28 });
  sec(T.noah, T.straniero, { bpm: 60, drone: 50, mel: 40, oct: -12, pulse: 40, str: 30 });
  sec(T.straniero, T.scelta, { bpm: 70, drone: 36, ticks: 40, mel: 42, pad: 34 });
  sec(T.scelta, T.inizio, { bpm: 64, drone: 40, str: 38, mel: 44, ticks: 26 });
  sec(T.inizio, T.fine, { bpm: 66, drone: 46, str: 44, mel: 48, bells: 34, pulse: 34 });
  sec(T.fine, T.finale, { bpm: 54, drone: 54, mel: 36, oct: -12, broken: true, keep: 0.6 });

  // finale: il motivo intero in campanelle e un accordo di Do minore aperto
  const F = T.finale;
  [36, 48, 55, 60, 63, 67].forEach((m, j) => strings(mix, m, { t: F, dur: 3.4, vel: 46, gain: 0.6, pan: (j - 2.5) * 0.2, att: 0.5, seed: 40 + j }));
  MOTIF.forEach(([b, m], k) => bell(mix, m + 12, { t: F + 0.3 + k * 0.45, vel: 44, pan: -0.3 + k * 0.2 }));

  // ---------------------------------------------------------------- effetti sonori (tempi delle scene)
  // sigla: il filo che si scioglie, il nome, il badge
  whoosh(mix, 0.15, 0.6, { vel: 40, lo: 600, hi: 3000 });
  pop(mix, 0.55, 40, { pitch: 5 });
  pop(mix, 0.85, 44, { pitch: 12 });
  // dove spariscono: rombo sotto la grotta
  rumble(mix, C('mikkel', 2), 2.4, { vel: 34 });
  // il passaggio: la linea gialla che sale, le grotte negli altri anni
  bell(mix, 60, { t: C('trentatre', 0) + 0.3, vel: 38 });
  [0.3, 0.8].forEach((d, k) => bell(mix, [72, 75][k], { t: C('trentatre', 1) + d, vel: 40 }));
  [0, 0.5, 1.0].forEach((d, k) => bell(mix, [67, 72, 75][k], { t: C('trentatre', 2) + d, vel: 42 }));
};
