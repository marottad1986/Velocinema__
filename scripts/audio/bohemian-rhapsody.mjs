// Colonna sonora originale per Bohemian Rhapsody: pianoforte, organo-coro, archi e una batteria sorda, discreti sotto la
// voce. Niente melodie, accordi o ritmi della canzone: il tema (Re minore, 4 battute, un arco che sale e ricade) è
// inventato qui. Segue le tre parti raccontate: intimo nel soggiorno e nella confessione, solenne e a due voci nell'opera
// (organo che passa da sinistra a destra come i due cori), energico nel rock, sospeso nel significato, leggero alla radio,
// e si apre in Fa maggiore nell'ultimo capitolo. Effetti agganciati agli eventi delle scene in src/scenes/bohemian-rhapsody/.
import { put, rng, drum, thunder, whoosh, swell, pop, chalk, lockClick, rainHiss, radioStatic, channelClick, doorCreak, thud, FX } from './synth.mjs';
import { loadFilm, timeline } from './film.mjs';

const TAU = Math.PI * 2;
const SR = 44100;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const vamp = (v) => (v / 127) ** 1.6;

// ---------------------------------------------------------------- strumenti locali (via put)

/** Pianoforte morbido: armoniche con decadimento più rapido in alto. */
const piano = (mix, m, { t, dur = 1.5, vel = 60, pan = 0, rev = 0.5, gain = 1 }) => {
  const f = mtof(m);
  const tau = Math.max(0.6, 2.8 - m * 0.02);
  put(mix, t, Math.ceil((Math.min(dur, 4) + 0.6) * SR), (i) => {
    const x = i / SR;
    let s = 0;
    for (let h = 1; h <= 5; h++) s += Math.sin(TAU * f * h * Math.sqrt(1 + 0.0004 * h * h) * x) * Math.exp(-x / (tau / (0.6 + h * 0.5))) / h ** 1.2;
    const env = Math.min(1, x / 0.004) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / 0.5));
    return s * env;
  }, { gain: gain * vamp(vel) * 0.55, pan, rev });
};

/** Organo-coro: registri a sinusoidi con vibrato lento, come voci tenute. */
const choir = (mix, m, { t, dur, vel = 40, pan = 0, rev = 0.8, gain = 1, att = 0.5 }) => {
  const f = mtof(m);
  const rel = 1.2;
  put(mix, t, Math.ceil((dur + rel) * SR), (i) => {
    const x = i / SR;
    const vib = 1 + 0.004 * Math.sin(TAU * 5.4 * x + m) * Math.min(1, x / 0.8);
    const p = TAU * f * vib * x;
    const s = Math.sin(p) + 0.45 * Math.sin(2 * p) + 0.3 * Math.sin(3 * p) + 0.12 * Math.sin(5 * p) + 0.3 * Math.sin(0.5 * p);
    const env = Math.min(1, x / att) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / rel));
    return s * env * 0.3;
  }, { gain: gain * vamp(vel), pan, rev });
};

/** Archi: tre seghe scordate con vibrato e attacco lento. */
const strings = (mix, m, { t, dur, vel = 40, pan = 0, rev = 0.6, gain = 1, att = 1.0, seed = 1 }) => {
  const f = mtof(m);
  const r = rng(seed * 977 + Math.round(t * 1000) + m);
  const dets = [-6, 0, 6].map((c) => f * 2 ** (c / 1200));
  const ph = dets.map(() => r());
  const a = 1 - Math.exp((-TAU * f * 3.2) / SR);
  let lp = 0;
  const rel = 1.4;
  put(mix, t, Math.ceil((dur + rel) * SR), (i) => {
    const x = i / SR;
    const vib = 1 + 0.003 * Math.sin(TAU * 5 * x) * Math.min(1, x / 1.5);
    let s = 0;
    for (let k = 0; k < 3; k++) s += 2 * ((ph[k] + dets[k] * vib * x) % 1) - 1;
    lp += a * (s / 3 - lp);
    const env = Math.min(1, x / att) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / rel));
    return lp * env;
  }, { gain: gain * vamp(vel), pan, rev });
};

/** Chitarra distorta (rock): due seghe scordate saturate e filtrate, attacco secco. */
const drive = (mix, m, { t, dur, vel = 40, pan = 0, gain = 1 }) => {
  const f = mtof(m);
  let lp = 0;
  const a = 1 - Math.exp((-TAU * 2400) / SR);
  put(mix, t, Math.ceil((dur + 0.2) * SR), (i) => {
    const x = i / SR;
    const s = ((f * x) % 1) * 2 - 1 + (((f * 1.006 * x) % 1) * 2 - 1) + 0.6 * (((f * 0.5 * x) % 1) * 2 - 1);
    lp += a * (Math.tanh(s * 2.5) - lp);
    const env = Math.min(1, x / 0.005) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / 0.2));
    return lp * env * 0.4;
  }, { gain: gain * vamp(vel), pan, rev: 0.25 });
};

/** Campanella cristallina: parziali inarmoniche, decadimento lungo. */
const bell = (mix, m, { t, vel = 46, pan = 0, gain = 1 }) => {
  const f = mtof(m);
  put(mix, t, Math.ceil(3 * SR), (i) => {
    const x = i / SR;
    return (Math.sin(TAU * f * x) * Math.exp(-x / 1.4) + 0.4 * Math.sin(TAU * 2.76 * f * x) * Math.exp(-x / 0.6) + 0.2 * Math.sin(TAU * 5.4 * f * x) * Math.exp(-x / 0.25)) * Math.min(1, x / 0.002);
  }, { gain: gain * vamp(vel) * 0.45, pan, rev: 0.75 });
};

/** Gong: parziali inarmoniche gravi con battimenti e un lieve crescendo dopo il colpo, coda lunga. */
const gong = (mix, t, { vel = 70, len = 6, seed = 5 } = {}) => {
  const r = rng(seed);
  const parts = [55, 87.3, 118.6, 151.2, 203.7, 266.1, 341.9, 452.3].map((f, k) => ({ f: f * (1 + (r() - 0.5) * 0.01), a: 1 / (1 + k * 0.6), tau: len * (0.9 - k * 0.08), ph: r() * TAU }));
  let n = 0;
  put(mix, t, Math.ceil(len * SR), (i) => {
    const x = i / SR;
    n = 0.97 * n + 0.03 * (r() * 2 - 1);
    let s = 0;
    for (const p of parts) s += p.a * Math.sin(TAU * p.f * x + p.ph + 0.6 * Math.sin(TAU * 0.7 * x)) * Math.exp(-x / p.tau);
    const bloom = 0.6 + 0.4 * Math.min(1, x / 0.6);
    return (s * bloom + n * 4 * Math.exp(-x / 0.08)) * Math.min(1, x / 0.003);
  }, { gain: FX * vamp(vel) * 0.35, rev: 0.6 });
};

// ---------------------------------------------------------------- materiale musicale

// tema: [tempo, nota MIDI, durata in tempi]; 4 battute in 4/4, Re minore, arco che sale e ricade
const THEME = [
  [0, 62, 1], [1, 65, 1], [2, 69, 2],
  [4, 67, 1.5], [5.5, 65, 0.5], [6, 64, 2],
  [8, 62, 1], [9, 65, 1], [10, 70, 1], [11, 69, 1],
  [12, 67, 1], [13, 64, 1], [14, 62, 2],
];
// accordi per battuta (classe di altezza della fondamentale, intervalli): Dm · Gm · C · A (minore) · F · Dm · Gm · C (maggiore)
const CH_MIN = [[2, [0, 3, 7]], [7, [0, 3, 7]], [0, [0, 4, 7]], [9, [0, 4, 7]]];
const CH_MAJ = [[5, [0, 4, 7]], [2, [0, 3, 7]], [7, [0, 3, 7]], [0, [0, 4, 7]]];
// in maggiore il tema sale di una terza minore (Re minore → Fa maggiore)
const toMajor = (m) => m + 3;

export default (mix, T) => {
  const film = loadFilm('bohemian-rhapsody');
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
  const BODY = 0.8;
  let sid = 0;

  /**
   * Il tema ciclico da `from` a `to`.
   * mel: pianoforte (livello) · keep: probabilità di ogni nota · oct: trasposizione · major: Fa maggiore
   * cho / str: coro e archi (livello) · sway: il coro passa da sinistra a destra a ogni battuta (i due cori dell'opera)
   * bass: pianoforte grave · kick: grancassa a ogni tempo · snare: colpo sul 2 e sul 4 · gtr: accordi distorti
   */
  const sec = (from, to, o) => {
    const beat = 60 / o.bpm, bar = 4 * beat, loop = 16 * beat;
    const R = rng(4000 + sid++ * 131);
    const chords = o.major ? CH_MAJ : CH_MIN;
    for (let L0 = from; L0 < to - 0.2; L0 += loop) {
      for (let b = 0; b < 4; b++) {
        const t = L0 + b * bar;
        if (t >= to - 0.3) break;
        const left = to - t;
        const [pc, iv] = chords[b];
        const root = 48 + ((pc - 0 + 12) % 12);
        const d = Math.min(bar * 1.02, left);
        const side = o.sway ? (b % 2 ? 0.7 : -0.7) : 0;
        if (o.cho) iv.concat([12]).forEach((v, j) => choir(mix, root + v + 12, { t, dur: d, vel: o.cho, gain: BODY * 0.7, pan: side + (j - 1.5) * 0.1 }));
        if (o.str) iv.concat([12]).forEach((v, j) => strings(mix, root + v + 12, { t: t + j * 0.05, dur: d, vel: o.str, gain: BODY * 0.7, pan: (j - 1.5) * 0.3, att: o.att ?? 1, seed: j + 3 }));
        if (o.bass) piano(mix, root - 12, { t, dur: bar, vel: o.bass, gain: BODY, pan: -0.15 });
        if (o.gtr) for (let k = 0; k < 4; k++) if (t + k * beat < to - 0.1) [0, 7, 12].forEach((v, j) => drive(mix, root - 12 + v, { t: t + k * beat, dur: beat * 0.8, vel: o.gtr, gain: BODY * 0.6, pan: -0.3 + j * 0.3 }));
        for (let k = 0; k < 4; k++) {
          const tk = t + k * beat;
          if (tk >= to - 0.1) break;
          if (o.kick) drum(mix, o.kick > 50 ? 'kick' : 'softkick', tk, o.kick, 7);
          if (o.snare && k % 2) drum(mix, 'sidestick', tk, o.snare, 9);
          if (o.shaker) drum(mix, 'shaker', tk + beat / 2, o.shaker, 11);
        }
      }
      if (!o.mel) continue;
      for (const [b, m0, d] of THEME) {
        const t = L0 + b * beat;
        if (t >= to - 0.2 || R() > o.keep) continue;
        const m = (o.major ? toMajor(m0) : m0) + (o.oct ?? 0);
        const dur = Math.min(d * beat * 1.1, to - t);
        piano(mix, m, { t, dur, vel: o.mel * (0.9 + R() * 0.2), gain: BODY * 1.2, pan: 0.05 });
        if (o.bells) bell(mix, m + 12, { t: t + 0.01, vel: o.bells, gain: BODY, pan: 0.3 });
      }
    }
  };

  // ---- sezioni (tempi dai capitoli del JSON)
  // copertina: coro e archi solenni, il gong
  sec(0, T.canzone, { bpm: 66, cho: 44, str: 40, bells: 30, mel: 40, keep: 0.5, oct: 12 });
  // una canzone impossibile: pianoforte intimo, poi entrano archi
  sec(T.canzone, C('canzone', 2), { bpm: 74, mel: 48, keep: 1, bass: 38 });
  sec(C('canzone', 2), T.registrazione, { bpm: 74, mel: 50, keep: 1, bass: 40, str: 34 });
  // registrazione: il coro si stratifica
  sec(T.registrazione, C('registrazione', 2), { bpm: 80, mel: 44, keep: 0.8, cho: 36, bass: 36 });
  sec(C('registrazione', 2), T.confessione, { bpm: 80, mel: 46, keep: 0.8, cho: 50, str: 38, bells: 28 });
  // confessione: pianoforte solo nella pioggia, poi archi; nell'assolo una chitarra distorta discreta
  sec(T.confessione, C('confessione', 2), { bpm: 64, mel: 44, keep: 0.7, cho: 26 });
  sec(C('confessione', 2), C('confessione', 4), { bpm: 64, mel: 50, keep: 1, bass: 40, str: 36 });
  sec(C('confessione', 4), T.opera, { bpm: 64, mel: 42, keep: 0.6, oct: 12, str: 42, gtr: 26 });
  // opera: coro a due lati, archi pieni, campanelle
  sec(T.opera, C('opera', 2), { bpm: 88, cho: 54, sway: true, str: 44, mel: 42, keep: 0.6, oct: 12 });
  sec(C('opera', 2), T.rock, { bpm: 96, cho: 58, sway: true, str: 48, bells: 34, kick: 34 });
  // rock: batteria, chitarre distorte; poi si calma e torna il pianoforte
  sec(T.rock, C('rock', 3), { bpm: 132, kick: 70, snare: 60, gtr: 52, cho: 44 });
  sec(C('rock', 3), T.significato, { bpm: 70, mel: 46, keep: 1, str: 30 });
  // significato: sospeso, pianoforte rado e coro lontano
  sec(T.significato, T.radio, { bpm: 62, mel: 40, keep: 0.55, cho: 28, bass: 30 });
  // radio: leggero, ritmo con spazzole; quando va in onda si accende
  sec(T.radio, C('radio', 3), { bpm: 96, mel: 44, keep: 0.8, bass: 38, shaker: 26 });
  sec(C('radio', 3), T['seconda-vita'], { bpm: 104, mel: 50, keep: 1, bass: 44, kick: 40, shaker: 32, bells: 30 });
  // seconda vita: raccolto, poi l'auto parte e il tema si apre in maggiore
  sec(T['seconda-vita'], C('seconda-vita', 2), { bpm: 66, mel: 42, keep: 0.8, cho: 30 });
  sec(C('seconda-vita', 2), C('seconda-vita', 4), { bpm: 112, mel: 48, keep: 1, major: true, kick: 48, snare: 40, bass: 42 });
  sec(C('seconda-vita', 4), T.finale, { bpm: 112, mel: 52, keep: 1, major: true, str: 44, cho: 40, bells: 34, kick: 40 });

  // finale: accordo di Fa maggiore ampio e il gong che si spegne
  const F = T.finale;
  [41, 53, 60, 65, 69, 72, 77].forEach((m, j) => choir(mix, m, { t: F, dur: 3.4, vel: 44, gain: BODY * 0.8, pan: (j - 3) * 0.2 }));
  [65, 69, 72, 77].forEach((m, j) => strings(mix, m, { t: F + 0.1, dur: 3.2, vel: 46, gain: BODY * 0.8, pan: (j - 1.5) * 0.3, att: 0.6, seed: 30 + j }));
  gong(mix, F - 0.6, { vel: 34, len: 5, seed: 13 });

  // ---------------------------------------------------------------- effetti sonori (tempi delle scene)
  // copertina: tuono sul fondale, colpo di gong
  thunder(mix, 0.9, 0.6, 3);
  gong(mix, 1.1, { vel: 46, len: 5, seed: 3 });
  // soggiorno: fogli che volano
  whoosh(mix, C('canzone', 4) + 0.1, 1.2, { vel: 36, lo: 800, hi: 4000 });
  // registrazione: il nastro parte, i tre microfoni, il contatore a 180, il nastro che si consuma
  lockClick(mix, T.registrazione + 0.3, 50);
  [0, 1, 2].forEach((i) => pop(mix, C('registrazione', 1) + 0.25 + i * 0.6, 40, { pitch: i * 2, pan: -0.4 + i * 0.4 }));
  swell(mix, C('registrazione', 3) + 0.7, 1.6, { vel: 40 });
  whoosh(mix, C('registrazione', 4) + 0.2, 1.4, { vel: 30, lo: 2000, hi: 7000 });
  // confessione: pioggia, la porta che si apre, l'assolo
  rainHiss(mix, T.confessione, T.opera, { power: 0.4, fade: 1.2 });
  doorCreak(mix, C('confessione', 3) + 0.6, 1.6, { vel: 40 });
  swell(mix, C('confessione', 4) + 0.3, 1.2, { vel: 40 });
  // opera: due tuoni (inizio e Belzebù), la botola che si apre
  thunder(mix, C('opera', 0) + 0.25, 0.7, 5);
  swell(mix, C('opera', 3) + 0.4, 1.4, { vel: 36 });
  thud(mix, C('opera', 4) + 0.1, 50, { bright: 700 });
  thunder(mix, C('opera', 4) + 0.3, 0.8, 9);
  whoosh(mix, C('opera', 4) + 0.2, 1.6, { vel: 44, lo: 150, hi: 1200 });
  // rock: esplosione iniziale, il gong finale
  drum(mix, 'kick', C('rock', 0) + 0.25, 90, 3);
  thunder(mix, C('rock', 0) + 0.25, 0.5, 13);
  gong(mix, C('rock', 4) + 1.2, { vel: 52, len: 6, seed: 7 });
  // significato: il punto interrogativo disegnato, il cassetto, le lampadine che si spengono
  [0, 0.5, 1.0, 1.5, 2.45].forEach((d, i) => chalk(mix, C('significato', 0) + 0.4 + d, 34 - i * 2, 23 + i));
  thud(mix, C('significato', 3) + 1.1, 34, { bright: 900 });
  const R = rng(6161);
  for (let i = 0; i < 14; i++) pop(mix, C('significato', 4) + R() * 0.9, 22, { pitch: -4 + (i % 5), pan: -0.5 + (i % 7) * 0.15 });
  // radio: fruscio della radio, ON AIR, telefono, lettere
  radioStatic(mix, T.radio + 0.1, 1.2, { vel: 36 });
  channelClick(mix, C('radio', 3), 50);
  for (let i = 0; i < 8; i++) pop(mix, C('radio', 3) + 0.4 + i * 0.22, 30, { pitch: 12 + (i % 2) * 3, pan: 0.5 });
  whoosh(mix, C('radio', 3) + 0.3, 1.2, { vel: 30, lo: 1500, hi: 5000 });
  swell(mix, C('radio', 4) + 1.2, 1.2, { vel: 36 });
  // seconda vita: la radio si accende, la cassetta parte, la città si illumina
  channelClick(mix, C('seconda-vita', 1), 46);
  lockClick(mix, C('seconda-vita', 2), 54);
  swell(mix, C('seconda-vita', 4) + 0.8, 1.6, { vel: 40 });
};
