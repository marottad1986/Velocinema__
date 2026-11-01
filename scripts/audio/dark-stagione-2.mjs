// Colonna sonora originale di Dark, stagione 2 (formato "Spiegato semplice", senza sigla): stessa famiglia sonora della
// stagione 1 (bordoni gravi di celli e contrabbasso, archi lenti, pianoforte campionati VSCO-2 CE, ticchettio
// d'orologio come metronomo) e lo stesso motivo inventato del cerchio (Do, Mi bemolle, Re, Sol), qui più spezzato:
// cupo e a passo pieno nella setta del 1921, a metà passo e rotto nel 2053. Niente brani o motivi della serie.
// Effetti agganciati agli eventi dello schema in src/scenes/dark-stagione-2/Nodo.tsx.
import { put, rng, FX } from './synth.mjs';
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte', 'violini', 'viole', 'celli', 'contrabbasso', 'glockenspiel', 'grancassa'];
export const effetti = ['scatti', 'rombo', 'pagine'];
/** Sala scura e chiusa (il bunker). */
export const sala = { rt60: 2.6, brillo: 5000, predelay: 0.025, wet: 0.5 };

const TAU = Math.PI * 2;
const SR = 44100;
const vamp = (v) => (v / 127) ** 1.6;
/** Un solo tempo (66 bpm, come la stagione 1) su una griglia continua: il 2053 va a metà passo (33). */
const BPM = 66;
const GRID = (4 * 60) / BPM;
const snap = (t) => Math.round(t / GRID) * GRID;

// ---------------------------------------------------------------- strumenti (campionati)

/** Bordone grave: celli e contrabbasso tenuti. */
const drone = (mix, m, { t, dur, vel = 40, gain = 1, seed = 1 }) =>
  suona(mix, m < 40 ? 'contrabbasso' : 'celli', m, { t, dur, vel: vel + 14, gain: gain * 1.6, attack: 2, release: 2, rev: 0.6, seed });

/** Archi d'orchestra. */
const strings = (mix, m, { t, dur, vel = 40, pan = 0, gain = 1, att = 1.2, seed = 1 }) =>
  archi(mix, m, { t, dur, vel: vel + 8, pan, rev: 0.65, gain: gain * 1.4, attack: att, release: 1.4, seed });

/** Campanella: glockenspiel. */
const bell = (mix, m, { t, vel = 46, pan = 0, gain = 1 }) =>
  suona(mix, 'glockenspiel', m - 12, { t, dur: 2.5, vel: vel * 1.3, pan, rev: 0.75, gain: gain * 0.45, release: 1.5 });

/** Motivo del cerchio: pianoforte (era il vibrafono sintetico). */
const motif = (mix, m, { t, dur, vel }) =>
  suona(mix, 'pianoforte', m, { t, dur: Math.min(dur, 4), vel: vel * 1.2, pan: 0.15, rev: 0.6, gain: 4, release: 0.6 });

/** Tic dell'orologio: clic secco e brevissimo, alternato tic/tac. */
const tick = (mix, t, { vel = 34, tac = false } = {}) => {
  const f = tac ? 2600 : 3400;
  const r = rng(Math.round(t * 1000));
  put(mix, t, Math.ceil(0.03 * SR), (i) => {
    const x = i / SR;
    return (Math.sin(TAU * f * x) * 0.6 + (r() * 2 - 1) * 0.4) * Math.exp(-x / 0.004);
  }, { gain: FX * vamp(vel) * 0.3, pan: tac ? -0.2 : 0.2, rev: 0.15 });
};

// ---------------------------------------------------------------- materiale musicale

// il motivo del cerchio: [tempo, nota MIDI, durata in tempi], 2 battute in 4/4
const MOTIF = [[0, 72, 2], [2, 75, 2], [4, 74, 2], [6, 67, 2]];
// accordi per battuta (radice MIDI, intervalli): Do minore · La bemolle · Fa minore · Sol (sospeso)
const CHORDS = [[48, [0, 3, 7]], [44, [0, 4, 7]], [41, [0, 3, 7]], [43, [0, 5, 7]]];

export default (mix, T) => {
  const film = loadFilm('dark-stagione-2');
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
  let sid = 0;

  /**
   * Una sezione da `from` a `to`.
   * passo ('meta' nel 2053) · drone (livello) · str: archi · mel: motivo (livello, keep = probabilità di ogni nota, oct) · ticks: orologio
   * pulse: colpo sordo a ogni battuta · broken: il motivo salta note e si abbassa (2053)
   */
  const sec = (from, to, o) => {
    from = snap(from); to = snap(to);
    const beat = (60 / BPM) * (o.passo === 'meta' ? 2 : 1), bar = 4 * beat;
    const R = rng(7000 + sid++ * 131);
    if (o.drone) {
      drone(mix, 36, { t: from, dur: to - from, vel: o.drone, gain: 0.7, seed: sid });
      drone(mix, 43, { t: from, dur: to - from, vel: o.drone * 0.8, gain: 0.5, seed: sid + 50 });
    }
    for (let k = 0, t = from; t < to - 0.3; k++, t += bar) {
      const [root, iv] = CHORDS[k % 4];
      const d = Math.min(bar * 1.02, to - t);
      if (o.str) iv.forEach((v, j) => strings(mix, root + 12 + v, { t: t + j * 0.04, dur: d, vel: o.str, gain: 0.6, pan: (j - 1) * 0.35, seed: j + k }));
      if (o.pad) iv.forEach((v, j) => archi(mix, root + 12 + v, { t, dur: d, vel: o.pad + 10, rev: 0.6, pan: (j - 1) * 0.3, gain: 0.8, attack: 1, release: 1.4, seed: j + 1 }));
      if (o.pulse) colpo(mix, 'grancassa', o.pulse >= 40 ? 'bdrum_p' : 'bdrum_pp', { t, vel: 110, gain: 0.8, rev: 0.4, seed: k });
      if (o.ticks) for (let b = 0; b < 4; b++) if (t + b * beat < to) tick(mix, t + b * beat, { vel: o.ticks, tac: b % 2 === 1 });
      if (o.mel && k % 2 === 0) {
        for (const [b, m, len] of MOTIF) {
          const tt = t + b * beat;
          if (tt >= to - 0.2 || R() > (o.keep ?? 1)) continue;
          const mm = m + (o.oct ?? 0) - (o.broken && R() > 0.5 ? 1 : 0);
          motif(mix, mm, { t: tt, dur: Math.min(len * beat, to - tt), vel: o.mel });
          if (o.bells) bell(mix, mm + 12, { t: tt + 0.01, vel: o.bells, pan: -0.25 });
        }
      }
    }
  };

  // ---- sezioni (tempi dal JSON): lo schema si annoda, la musica cresce con il nodo
  sec(0, T.futuro, { passo: 'meta', drone: 40, mel: 40, oct: -12, broken: true, keep: 0.7 });
  sec(T.futuro, T.padre, { passo: 'meta', drone: 50, mel: 38, oct: -12, broken: true, keep: 0.6, ticks: 26 });
  sec(T.padre, T.setta, { drone: 38, str: 40, mel: 44, ticks: 28 });
  sec(T.setta, T.adam, { drone: 52, mel: 40, oct: -12, pulse: 40, str: 30 });
  sec(T.adam, T.charlotte, { drone: 44, mel: 50, oct: 12, bells: 36, ticks: 30, pad: 40 });
  sec(T.charlotte, T.piano, { drone: 38, str: 38, mel: 44, ticks: 28 });
  sec(T.piano, T.martha, { drone: 46, str: 44, mel: 46, pulse: 34, ticks: 32 });
  sec(T.martha, T.fine, { drone: 44, str: 46, mel: 42, keep: 0.8 });
  sec(T.fine, T.mondo, { passo: 'meta', drone: 56, mel: 34, oct: -12, broken: true, keep: 0.5, pulse: 44 });
  sec(T.mondo, T.finale, { drone: 40, mel: 46, bells: 36, pad: 36 });

  // finale: il motivo intero in campanelle e un accordo di Do minore aperto
  const F = snap(T.finale); // sulla griglia, dove finisce l'ultima sezione
  [36, 48, 55, 60, 63, 67].forEach((m, j) => strings(mix, m, { t: F, dur: 3.4, vel: 46, gain: 0.6, pan: (j - 2.5) * 0.2, att: 0.5, seed: 40 + j }));
  MOTIF.forEach(([b, m], k) => bell(mix, m + 12, { t: F + 0.3 + k * 0.45, vel: 44, pan: -0.3 + k * 0.2 }));

  // ---------------------------------------------------------------- effetti sonori (tempi delle scene)
  // 2053: rombo sotto le rovine; la data della fine (cartellino rosso) con un colpo sordo
  clip(mix, 'rombo', { t: C('futuro', 0), da: 31, durata: 3, gain: 0.3, fadeIn: 0.6, fadeOut: 1.2, largo: 2 });
  colpo(mix, 'grancassa', 'bdrum_p', { t: C('futuro', 2) + 0.3, vel: 110, gain: 0.7, rev: 0.5 });
  // il padre: la lettera che si apre, poi l'anello rosso
  clip(mix, 'pagine', { t: C('padre', 1) + 0.2, da: 1, durata: 0.7, gain: 0.25, fadeOut: 0.2, rev: 0.3 });
  [0, 0.5].forEach((d, k) => bell(mix, [63, 60][k], { t: C('padre', 3) + 0.2 + d, vel: 40 }));
  // la setta: i viaggi nel tempo lungo il passaggio
  [0.2, 0.6, 1.0].forEach((d, k) => bell(mix, [60, 67, 72][k], { t: C('setta', 1) + d, vel: 38 }));
  // la rivelazione: Adam = Jonas da vecchio
  [0, 0.45, 0.9, 1.35].forEach((d, k) => bell(mix, MOTIF[k][1] + 12, { t: C('adam', 2) + 0.6 + d, vel: 46, pan: -0.3 + k * 0.2 }));
  // il cerchio madre-figlia
  [0, 0.4].forEach((d, k) => bell(mix, [75, 72][k], { t: C('charlotte', 3) + d, vel: 40 }));
  // Martha: la croce rossa, un colpo sordo
  colpo(mix, 'grancassa', 'bdrum_p', { t: C('martha', 1) + 0.6, vel: 110, gain: 0.8, rev: 0.6 });
  // la fine del mondo: rombo lungo e la fascia che trema
  clip(mix, 'rombo', { t: C('fine', 0), da: 31, durata: 4, gain: 0.45, fadeIn: 0.2, fadeOut: 1.5, largo: 3 });
  clip(mix, 'scatti', { t: C('fine', 1) + 0.3, da: 6.49, durata: 0.1, gain: 0.2, rev: 0.2 });
  // un altro mondo: campanelle che salgono quando arriva il gomitolo blu
  [0, 0.3, 0.6].forEach((d, k) => bell(mix, [67, 72, 79][k], { t: C('mondo', 0) + 0.1 + d, vel: 42, pan: 0.3 }));
};
