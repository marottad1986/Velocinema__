// Colonna sonora originale di Dark, stagione 1 (formato "Spiegato semplice"): bordoni gravi di celli e contrabbasso,
// archi lenti, pianoforte (campionati, VSCO-2 CE) e un
// ticchettio d'orologio che fa da metronomo. Il motivo è inventato qui: quattro note in Do minore (Do, Mi bemolle, Re,
// Sol) che tornano sempre uguali, come il cerchio del racconto; cupo nel bunker, spezzato nel 2052. Niente brani o motivi
// della serie. Effetti agganciati agli eventi della parete in src/scenes/dark-stagione-1/Parete.tsx.
import { put, rng, FX } from './synth.mjs';
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte', 'violini', 'viole', 'celli', 'contrabbasso', 'glockenspiel', 'grancassa'];
export const effetti = ['passaggio', 'scatti', 'rombo'];
/** Sala scura e chiusa (il bunker). */
export const sala = { rt60: 2.6, brillo: 5000, predelay: 0.025, wet: 0.5 };

const TAU = Math.PI * 2;
const SR = 44100;
const vamp = (v) => (v / 127) ** 1.6;
/** Un solo tempo (66 bpm) su una griglia continua: il 2052 va a metà passo (33). */
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
   * passo ('meta' nel 2052) · drone (livello) · str: archi · mel: motivo (livello, keep = probabilità di ogni nota, oct) · ticks: orologio
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

  // ---- sezioni (tempi dal JSON): la parete delle indagini si riempie, la musica cresce con lo schema
  sec(SIGLA, T.winden, { drone: 36, mel: 44, bells: 26 });
  sec(T.winden, T.mikkel, { drone: 36, mel: 42, ticks: 30, pad: 30 });
  sec(T.mikkel, T.trentatre, { drone: 40, ticks: 30, mel: 40, str: 30 });
  sec(T.trentatre, T.michael, { drone: 42, mel: 50, oct: 12, bells: 36, ticks: 30, pad: 44 });
  sec(T.michael, T.noah, { drone: 40, str: 40, mel: 46, ticks: 28 });
  sec(T.noah, T.straniero, { drone: 50, mel: 40, oct: -12, pulse: 40, str: 30 });
  sec(T.straniero, T.scelta, { drone: 36, ticks: 40, mel: 42, pad: 34 });
  sec(T.scelta, T.inizio, { drone: 40, str: 38, mel: 44, ticks: 26 });
  sec(T.inizio, T.fine, { drone: 46, str: 44, mel: 48, bells: 34, pulse: 34 });
  sec(T.fine, T.finale, { passo: 'meta', drone: 54, mel: 36, oct: -12, broken: true, keep: 0.6 });

  // finale: il motivo intero in campanelle e un accordo di Do minore aperto
  const F = snap(T.finale); // sulla griglia, dove finisce l'ultima sezione
  [36, 48, 55, 60, 63, 67].forEach((m, j) => strings(mix, m, { t: F, dur: 3.4, vel: 46, gain: 0.6, pan: (j - 2.5) * 0.2, att: 0.5, seed: 40 + j }));
  MOTIF.forEach(([b, m], k) => bell(mix, m + 12, { t: F + 0.3 + k * 0.45, vel: 44, pan: -0.3 + k * 0.2 }));

  // ---------------------------------------------------------------- effetti sonori (tempi delle scene)
  // sigla: il filo che si scioglie, il nome, il badge
  clip(mix, 'passaggio', { t: 0.15 - 0.3, da: 0.56, durata: 1.0, gain: 0.3, fadeOut: 0.3, rev: 0.3 });
  clip(mix, 'scatti', { t: 0.55, da: 6.49, durata: 0.1, gain: 0.2, rev: 0.2 });
  clip(mix, 'scatti', { t: 0.85, da: 12.68, durata: 0.12, gain: 0.25, rev: 0.2 });
  // dove spariscono: rombo sotto la grotta
  clip(mix, 'rombo', { t: C('mikkel', 2), da: 31, durata: 2.4, gain: 0.35, fadeIn: 0.5, fadeOut: 1, largo: 2 });
  // il passaggio: la linea gialla che sale, le grotte negli altri anni
  bell(mix, 60, { t: C('trentatre', 0) + 0.3, vel: 38 });
  [0.3, 0.8].forEach((d, k) => bell(mix, [72, 75][k], { t: C('trentatre', 1) + d, vel: 40 }));
  [0, 0.5, 1.0].forEach((d, k) => bell(mix, [67, 72, 75][k], { t: C('trentatre', 2) + d, vel: 42 }));
};
