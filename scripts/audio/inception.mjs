// Colonna sonora originale di Inception (formato "Spiegato semplice"): archi gravi, pianoforte e grancassa (campionati,
// VSCO-2 CE) con un battito sordo che va a metà passo nei sogni più profondi, come il tempo nei sogni. Il motivo è inventato qui: quattro note in Mi minore che
// scendono (Mi, Re, Si, Sol), come la discesa nei sogni; risale nel finale. Niente brani o temi del film (né la colonna
// sonora originale né canzoni usate nel film). Effetti agganciati agli eventi dello schema in src/scenes/inception/Piani.tsx.
import { put, rng, FX } from './synth.mjs';
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte', 'violini', 'viole', 'celli', 'contrabbasso', 'glockenspiel', 'grancassa'];
export const effetti = ['passaggio', 'scatti', 'rombo'];
/** Sala ampia e scura. */
export const sala = { rt60: 3.0, brillo: 5500, predelay: 0.03, wet: 0.55 };

const TAU = Math.PI * 2;
const SR = 44100;
const vamp = (v) => (v / 127) ** 1.6;
/** Un solo tempo (68 bpm) su una griglia continua: nei sogni più profondi si va a metà passo (34). */
const BPM = 68;
const GRID = (4 * 60) / BPM;
const snap = (t) => Math.round(t / GRID) * GRID;

// ---------------------------------------------------------------- strumenti (campionati)

/** Bordone grave: celli e contrabbasso tenuti. bright non serve più. */
const drone = (mix, m, { t, dur, vel = 40, gain = 1, seed = 1 }) =>
  suona(mix, m < 40 ? 'contrabbasso' : 'celli', m, { t, dur, vel: vel + 14, gain: gain * 1.6, attack: 2, release: 2, rev: 0.6, seed });

/** Archi d'orchestra. */
const strings = (mix, m, { t, dur, vel = 40, pan = 0, gain = 1, att = 1.2, seed = 1 }) =>
  archi(mix, m, { t, dur, vel: vel + 8, pan, rev: 0.65, gain: gain * 1.4, attack: att, release: 1.4, seed });

/** Campanella: glockenspiel. */
const bell = (mix, m, { t, vel = 46, pan = 0, gain = 1 }) =>
  suona(mix, 'glockenspiel', m - 12, { t, dur: 2.5, vel: vel * 1.3, pan, rev: 0.75, gain: gain * 0.45, release: 1.5 });

/** Motivo della discesa: pianoforte (era il vibrafono sintetico). */
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

// il motivo della discesa: [tempo, nota MIDI, durata in tempi], 2 battute in 4/4
const MOTIF = [[0, 76, 2], [2, 74, 2], [4, 71, 2], [6, 67, 2]];
// accordi per battuta (radice MIDI, intervalli): Mi minore · Do maggiore 7 · La minore · Si sospeso
const CHORDS = [[40, [0, 3, 7]], [36, [0, 4, 7, 11]], [45, [0, 3, 7]], [47, [0, 5, 7]]];

export default (mix, T) => {
  const film = loadFilm('inception');
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
   * passo ('meta' nei sogni profondi) · drone (livello) · str: archi · mel: motivo (livello, keep = probabilità di ogni nota, oct) · ticks: orologio
   * pulse: colpo sordo a ogni battuta · broken: il motivo salta note e si abbassa (2052)
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

  // ---- sezioni (tempi dal JSON): più si scende nei sogni, più il passo rallenta (metà passo sulla stessa griglia)
  sec(SIGLA, T.estrazione, { drone: 34, mel: 44, bells: 28 });
  sec(T.estrazione, T.innesto, { drone: 34, mel: 42, ticks: 28, pad: 30 });
  sec(T.innesto, T.livelli, { drone: 38, mel: 44, str: 30, ticks: 26 });
  sec(T.livelli, T.tempo, { drone: 42, mel: 46, pad: 38, pulse: 30 });
  sec(T.tempo, T.calcio, { passo: 'meta', drone: 42, mel: 44, ticks: 34, str: 34 });
  sec(T.calcio, T.limbo, { drone: 44, str: 40, pulse: 40, mel: 40, keep: 0.8 });
  sec(T.limbo, T.mal, { passo: 'meta', drone: 52, mel: 38, oct: -12, pad: 36 });
  sec(T.mal, T.missione, { passo: 'meta', drone: 46, str: 42, mel: 44, keep: 0.8 });
  sec(T.missione, T.trottola, { drone: 46, str: 46, mel: 48, bells: 34, pulse: 36 });
  sec(T.trottola, T.finale, { passo: 'meta', drone: 40, mel: 46, bells: 36, pad: 34, ticks: 30 });

  // finale: il motivo risale in campanelle e un accordo di Mi minore aperto
  const F = snap(T.finale); // sulla griglia, dove finisce l'ultima sezione
  [28, 40, 47, 52, 55, 59].forEach((m, j) => strings(mix, m, { t: F, dur: 3.4, vel: 46, gain: 0.6, pan: (j - 2.5) * 0.2, att: 0.5, seed: 40 + j }));
  [...MOTIF].reverse().forEach(([b, m], k) => bell(mix, m + 12, { t: F + 0.3 + k * 0.45, vel: 44, pan: -0.3 + k * 0.2 }));

  // ---------------------------------------------------------------- effetti sonori (tempi dello schema)
  // sigla: il filo che si scioglie, il nome, il badge
  clip(mix, 'passaggio', { t: 0.15 - 0.3, da: 0.56, durata: 1.0, gain: 0.3, fadeOut: 0.3, rev: 0.3 });
  clip(mix, 'scatti', { t: 0.55, da: 6.49, durata: 0.1, gain: 0.2, rev: 0.2 });
  clip(mix, 'scatti', { t: 0.85, da: 12.68, durata: 0.12, gain: 0.25, rev: 0.2 });
  // la trottola che si accende e gira veloce
  bell(mix, 83, { t: C('estrazione', 2) + 0.1, vel: 38 });
  // i tre piani dei sogni che compaiono uno sotto l'altro
  [0.1, 0.6, 1.1].forEach((d, k) => bell(mix, [71, 67, 64][k], { t: C('livelli', 2) + d, vel: 40 }));
  // gli orologi che rallentano
  [0.2, 1.0].forEach((d, k) => bell(mix, [79, 74][k], { t: C('tempo', 2 + k) + d, vel: 34 }));
  // i calci: tre colpi in salita, poi tutti insieme
  [0.1, 0.5, 0.9].forEach((d, k) => colpo(mix, 'grancassa', 'bdrum_mp', { t: C('calcio', 2) + d, vel: 90 + k * 12, gain: 0.9, rev: 0.4, seed: k }));
  colpo(mix, 'grancassa', 'bdrum_ff', { t: C('calcio', 3) + 0.1, vel: 110, gain: 0.9, rev: 0.45 });
  clip(mix, 'passaggio', { t: C('calcio', 3) + 0.1 - 0.4, da: 12.27, durata: 1.6, gain: 0.35, fadeOut: 0.5, rev: 0.4 });
  // il limbo: rombo grave quando si apre
  clip(mix, 'rombo', { t: C('limbo', 2), da: 31, durata: 2.4, gain: 0.35, fadeIn: 0.5, fadeOut: 1, largo: 2 });
  // l'idea piantata
  bell(mix, 88, { t: C('missione', 3) + 0.6, vel: 42 });
  // il risveglio e la trottola che vacilla
  colpo(mix, 'grancassa', 'bdrum_f', { t: C('trottola', 1) + 0.1, vel: 110, gain: 0.85, rev: 0.45 });
  [0, 0.35, 0.8].forEach((d, k) => bell(mix, [76, 74, 71][k], { t: C('trottola', 3) + 0.2 + d, vel: 40 - k * 4 }));
};
