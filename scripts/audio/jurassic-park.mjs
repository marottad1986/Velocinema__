// Colonna sonora originale di Jurassic Park: archi, pianoforte, corni gravi e timpani, discreta sotto la voce.
// Meraviglia all'arrivo (tema ampio in Si bemolle, inventato qui), tensione con la tempesta e il sabotaggio, passi pesanti
// del T-rex agganciati ai cerchi nel bicchiere di Trex.tsx, notte cupa, mattina curiosa, scossa elettrica, cucina in
// punta di piedi; nella fuga il tema torna pieno con i corni. Nessun brano o tema del film.
import { put, rng, drum, note, thunder, wind, whoosh, thud, pop, metalThud, rainHiss, lockClick, crackle } from './synth.mjs';
import { loadFilm, timeline } from './film.mjs';

const TAU = Math.PI * 2;
const SR = 44100;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const vamp = (v) => (v / 127) ** 1.6;

// ---------------------------------------------------------------- strumenti locali (via put)

const piano = (mix, m, { t, dur = 1.5, vel = 60, pan = 0, rev = 0.4, gain = 1 }) => {
  const f = mtof(m);
  const tau = Math.max(0.5, 2.6 - m * 0.02) * Math.min(1.4, 0.6 + dur * 0.4);
  put(mix, t, Math.ceil((Math.min(dur, 4) + 0.5) * SR), (i) => {
    const x = i / SR;
    let s = 0;
    for (let h = 1; h <= 6; h++) s += Math.sin(TAU * f * h * Math.sqrt(1 + 0.0004 * h * h) * x) * Math.exp(-x / (tau / (0.6 + h * 0.5))) / h ** 1.15;
    return (s + Math.sin(TAU * f * 3 * x) * Math.exp(-x / 0.012) * 0.3) * Math.min(1, x / 0.003) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / 0.35));
  }, { gain: gain * vamp(vel) * 0.55, pan, rev });
};

const strings = (mix, m, { t, dur, vel = 40, pan = 0, rev = 0.6, gain = 1, att = 1, seed = 1, bright = 3.2 }) => {
  const f = mtof(m);
  const r = rng(seed * 977 + Math.round(t * 1000) + m);
  const dets = [-6, 0, 6].map((c) => f * 2 ** (c / 1200));
  const ph = dets.map(() => r());
  const a = 1 - Math.exp((-TAU * f * bright) / SR);
  let lp = 0;
  put(mix, t, Math.ceil((dur + 1.2) * SR), (i) => {
    const x = i / SR;
    const vib = 1 + 0.003 * Math.sin(TAU * 5.1 * x) * Math.min(1, x / 1.5);
    let s = 0;
    for (let k = 0; k < 3; k++) s += 2 * ((ph[k] + dets[k] * vib * x) % 1) - 1;
    lp += a * (s / 3 - lp);
    return lp * Math.min(1, x / att) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / 1.2));
  }, { gain: gain * vamp(vel), pan, rev });
};

/** Corno: armoniche dispari e pari morbide, attacco lento, un filo di vibrato. */
const horn = (mix, m, { t, dur, vel = 50, pan = 0, gain = 1 }) => {
  const f = mtof(m);
  const a = 1 - Math.exp((-TAU * f * 2.5) / SR);
  let lp = 0;
  put(mix, t, Math.ceil((dur + 0.6) * SR), (i) => {
    const x = i / SR;
    const vib = 1 + 0.002 * Math.sin(TAU * 4.8 * x);
    let s = 0;
    for (let h = 1; h <= 7; h++) s += Math.sin(TAU * f * h * vib * x) / (h * 1.2);
    lp += a * (s - lp);
    return lp * Math.min(1, x / 0.12) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / 0.6));
  }, { gain: gain * vamp(vel) * 0.5, pan, rev: 0.6 });
};

/** Timpano: colpo grave con frequenza che scende appena. */
const timpani = (mix, m, t, vel = 60) => {
  const f = mtof(m);
  put(mix, t, Math.ceil(1.6 * SR), (i) => {
    const x = i / SR;
    return (Math.sin(TAU * f * (1 + 0.04 * Math.exp(-x / 0.05)) * x) + 0.3 * Math.sin(TAU * f * 1.5 * x) * Math.exp(-x / 0.2)) * Math.exp(-x / 0.5);
  }, { gain: vamp(vel) * 0.9, rev: 0.4 });
};

/** Pale dell'elicottero: colpi di rumore filtrato a ritmo regolare, con volume che segue `level(x)`. */
const chopper = (mix, t0, t1, level, seed = 91) => {
  const r = rng(seed + Math.round(t0 * 1000));
  let lp = 0;
  put(mix, t0, Math.ceil((t1 - t0) * SR), (i) => {
    const x = i / SR;
    const ph = (x * 11) % 1;
    lp += 0.06 * ((r() * 2 - 1) - lp);
    return lp * Math.exp(-ph * 8) * 4 * level(x);
  }, { gain: 0.8, pan: 0.1, rev: 0.2 });
};

/** Allarme: due note acute alternate. */
const alarm = (mix, t0, t1, vel = 30) => {
  for (let t = t0, k = 0; t < t1; t += 0.4, k++) note(mix, 'vibes', k % 2 ? 1568 : 1319, { t, dur: 0.35, vel, pan: 0.4, rev: 0.3, gain: 0.5 });
};

// ---------------------------------------------------------------- materiale musicale

// Tema (16 tempi, Si bemolle maggiore): [tempo, nota MIDI, durata in tempi]
const THEME = [[0, 70, 1.5], [1.5, 69, 0.5], [2, 70, 2], [4, 74, 1.5], [5.5, 72, 0.5], [6, 70, 2],
  [8, 67, 1], [9, 70, 1], [10, 75, 2], [12, 74, 1], [13, 72, 1], [14, 70, 2]];
const CH = [[46, 50, 53], [51, 55, 58], [43, 46, 50], [41, 45, 48]]; // Si♭, Mi♭, Sol minore, Fa

export default (mix, T) => {
  const { segments } = timeline(loadFilm('jurassic-park'));
  const S = Object.fromEntries(segments.map((s) => [s.id, s]));
  /** Secondo d'inizio della frase n-esima del capitolo (come subtitleTimes in ChapterOverlay). */
  const cue = (id, n) => {
    const s = S[id];
    const w = s.testo.map((l) => l.length + 6);
    const tot = w.reduce((a, b) => a + b, 0);
    let acc = 0.15;
    for (let k = 0; k < n; k++) acc += (w[k] / tot) * (s.dur - 0.35);
    return s.start + acc;
  };
  const BODY = 0.8;

  const theme = (from, to, { bpm = 66, vel = 50, str = 36, horns = 0, keep = 1, seed = 1, minor = false } = {}) => {
    const beat = 60 / bpm, loop = 16 * beat;
    const R = rng(9000 + seed);
    for (let L = from; L < to - 0.3; L += loop) {
      for (let b = 0; b < 4; b++) {
        const t = L + b * 4 * beat;
        if (t >= to - 0.4) break;
        const d = Math.min(4 * beat * 1.05, to - t);
        const ch = minor && b === 0 ? [46, 49, 53] : CH[b];
        piano(mix, ch[0] - 12, { t, dur: beat * 3, vel: vel * 0.8, gain: BODY, pan: -0.2 });
        ch.forEach((m, j) => strings(mix, m + 12, { t: t + j * 0.05, dur: d, vel: str, gain: BODY * 0.8, pan: (j - 1) * 0.35, seed: j + seed }));
        if (horns) horn(mix, ch[0], { t, dur: d * 0.9, vel: horns, gain: BODY, pan: -0.15 });
        if (horns) timpani(mix, ch[0] - 12, t, horns * 0.9);
      }
      for (const [b, m, d] of THEME) {
        const t = L + b * beat;
        if (t >= to - 0.2 || R() > keep) continue;
        const mm = minor && m % 12 === 2 ? m - 1 : m;
        const dd = Math.min(d * beat * 1.1, to - t);
        piano(mix, mm + 12, { t, dur: dd, vel: vel * (0.9 + R() * 0.2), gain: BODY * 1.2, pan: 0.1 });
        if (horns) horn(mix, mm, { t, dur: dd, vel: horns * 0.9, gain: BODY, pan: 0.15 });
      }
    }
  };

  // ---- copertina: corni gravi e timpano, il fuoco delle torce
  horn(mix, 46, { t: 0.2, dur: 3.4, vel: 46, gain: BODY });
  horn(mix, 53, { t: 0.5, dur: 3.1, vel: 40, gain: BODY });
  timpani(mix, 34, 0.2, 54);
  crackle(mix, 0, T.ambra, { vel: 26, seed: 11 });

  // ---- ambra: laboratorio di notte, archi sospesi e un luccichio quando la luce accende l'ambra
  [58, 65, 70].forEach((m, j) => strings(mix, m, { t: T.ambra, dur: 9.6, vel: 36, gain: BODY * 0.8, att: 2, pan: (j - 1) * 0.4, seed: 10 + j }));
  for (let t = T.ambra + 0.5, k = 0; t < T.esperti - 0.5; t += 0.9, k++) note(mix, 'vibes', mtof([82, 86, 89, 86][k % 4]), { t, dur: 1, vel: 22, pan: 0.3, rev: 0.6, gain: 0.4 });
  [82, 86, 89, 94].forEach((m, j) => note(mix, 'vibes', mtof(m), { t: cue('ambra', 3) + j * 0.12, dur: 2.2, vel: 40, pan: -0.3 + j * 0.2, rev: 0.7, gain: 0.5 }));

  // ---- esperti: l'elicottero scende, nasce il tema della meraviglia
  chopper(mix, T.esperti, T.laboratorio, (x) => Math.min(1, x / 1) * (x < 7 ? 1 : Math.max(0, 1 - (x - 7) / 2)) * 0.5);
  theme(T.esperti + 0.4, T.laboratorio, { bpm: 66, vel: 46, str: 34, horns: 30, keep: 0.9, seed: 2 });

  // ---- laboratorio: meraviglia piccola, l'uovo che si crepa
  theme(T.laboratorio, T.visita, { bpm: 72, vel: 42, str: 30, keep: 0.7, seed: 3 });
  for (let k = 0; k < 4; k++) pop(mix, cue('laboratorio', 1) + 0.1 + k * 0.25, 34 + k * 4, { pitch: 6 - k, pan: 0.1 });
  pop(mix, cue('laboratorio', 1) + 1.1, 48, { pitch: -2 });

  // ---- visita: il giro in jeep, poi la tempesta che arriva
  theme(T.visita, cue('visita', 3), { bpm: 76, vel: 46, str: 34, keep: 0.85, seed: 4 });
  wind(mix, cue('visita', 3) - 0.6, T.sabotaggio + 1, { power: 0.3, center: 450, seed: 7 });
  thunder(mix, cue('visita', 3) + 0.6, 0.45, 3);
  [46, 49, 53].forEach((m, j) => strings(mix, m, { t: cue('visita', 3), dur: T.sabotaggio - cue('visita', 3), vel: 34, gain: BODY * 0.8, att: 1.2, pan: (j - 1) * 0.4, seed: 40 + j }));

  // ---- sabotaggio: pulsazione nervosa, allarme quando si spengono le recinzioni
  rainHiss(mix, T.sabotaggio, T.notte, { power: 0.18 });
  thunder(mix, T.sabotaggio + 1.2, 0.35, 5); // lampo di Sabotaggio.tsx
  for (let t = T.sabotaggio + 0.3; t < T.trex - 0.3; t += 60 / 112) drum(mix, 'softkick', t, 30, 5);
  for (let t = T.sabotaggio + 0.3, k = 0; t < T.trex - 0.3; t += 60 / 112 / 2, k++) piano(mix, [58, 61, 58, 60][k % 4], { t, dur: 0.2, vel: 30, gain: BODY, rev: 0.2 });
  alarm(mix, cue('sabotaggio', 2), cue('sabotaggio', 2) + 3, 30);
  lockClick(mix, cue('sabotaggio', 3) + 0.2, 50);

  // ---- trex: silenzio, poi i passi (in sincronia con i cerchi nel bicchiere), il recinto, la jeep
  [0, 1, 2, 3, 4].forEach((k) => {
    const t = cue('trex', 1) + 0.2 + k * 1.1;
    drum(mix, 'kick', t, 70 + k * 4, k);
    thud(mix, t, 56 + k * 4, { seed: 3 + k, bright: 300 });
  });
  thunder(mix, cue('trex', 2) + 0.1, 0.5, 13);
  metalThud(mix, cue('trex', 2) + 0.3, 60);
  [34, 35, 41].forEach((m, j) => strings(mix, m + 12, { t: cue('trex', 2), dur: T.notte - cue('trex', 2), vel: 30, gain: BODY * 0.8, att: 0.3, pan: (j - 1) * 0.4, seed: 60 + j, bright: 2 }));
  metalThud(mix, cue('trex', 4) + 0.5, 72);
  thunder(mix, cue('trex', 4) + 0.2, 0.45, 15);
  whoosh(mix, cue('trex', 5), 1.6, { vel: 36, lo: 300, hi: 1400 });

  // ---- notte: pioggia, archi cupi; la pioggia cala sull'albero
  rainHiss(mix, T.notte, T.uova - 0.2, { power: 0.14 });
  theme(T.notte, T.uova, { bpm: 54, vel: 34, str: 34, keep: 0.4, minor: true, seed: 6 });

  // ---- uova: mattina, vibrafono curioso, un salto di rana
  for (let t = T.uova + 0.4, k = 0; t < T.corrente - 0.6; t += 0.6, k++) note(mix, 'vibes', mtof([70, 74, 77, 74, 79, 77][k % 6]), { t, dur: 0.9, vel: 34, pan: 0.3, rev: 0.5, gain: 0.5 });
  [58, 62, 65].forEach((m, j) => strings(mix, m, { t: T.uova, dur: 10.6, vel: 36, gain: BODY * 0.8, att: 1.5, pan: (j - 1) * 0.4, seed: 70 + j }));
  pop(mix, cue('uova', 4) + 0.1, 40, { pitch: -6 });

  // ---- corrente: allarme del cancello, la leva, la corrente che sale, la scossa
  alarm(mix, cue('corrente', 1), cue('corrente', 1) + 2.4, 28);
  [46, 47].forEach((m, j) => strings(mix, m, { t: cue('corrente', 1), dur: cue('corrente', 3) - cue('corrente', 1), vel: 36, gain: BODY * 0.8, att: 0.5, pan: (j - 0.5) * 0.6, seed: 80 + j, bright: 2 }));
  thud(mix, cue('corrente', 3), 60, { bright: 900 });
  lockClick(mix, cue('corrente', 3) + 0.05, 60);
  for (let k = 0; k < 5; k++) pop(mix, cue('corrente', 3) + 0.3 + k * 0.25, 30, { pitch: k * 2, pan: -0.5 + k * 0.25 });
  whoosh(mix, cue('corrente', 4) + 1.1, 0.6, { vel: 40, lo: 2000, hi: 7000 });
  crackle(mix, cue('corrente', 4) + 1.2, cue('corrente', 4) + 2.2, { vel: 50, seed: 17 });

  // ---- cucina: in punta di piedi; la pentola che cade, il computer, la porta bloccata
  for (let t = T.cucina + 0.3, k = 0; t < T.fuga - 0.4; t += 0.75, k++) note(mix, 'pluck', mtof([46, 47, 46, 49][k % 4]), { t, dur: 0.6, vel: 40, pan: -0.2, rev: 0.3, gain: 0.7 });
  [58, 59].forEach((m, j) => strings(mix, m + 12, { t: T.cucina, dur: 11, vel: 26, gain: BODY * 0.8, att: 2, pan: (j - 0.5) * 0.6, seed: 90 + j }));
  metalThud(mix, cue('cucina', 1) + 0.8, 64);
  [0, 1, 2].forEach((k) => note(mix, 'vibes', mtof(96), { t: cue('cucina', 2) + 0.2 + k * 0.15, dur: 0.12, vel: 30, pan: -0.4, gain: 0.4 }));
  lockClick(mix, cue('cucina', 3) + 0.05, 64);

  // ---- fuga: la lotta (timpani), lo striscione che crolla, poi il tema pieno con i corni e l'elicottero
  for (let t = cue('fuga', 1); t < cue('fuga', 2) + 0.8; t += 0.45) timpani(mix, 34, t, 56);
  thud(mix, cue('fuga', 2) + 1.2, 74, { bright: 600 });
  whoosh(mix, cue('fuga', 2), 1.2, { vel: 40, lo: 400, hi: 2000 });
  chopper(mix, cue('fuga', 3), T.finale + 1, (x) => Math.min(1, x / 0.8) * Math.max(0.2, 1 - x / 8) * 0.35);
  theme(cue('fuga', 3), T.finale, { bpm: 70, vel: 56, str: 46, horns: 46, seed: 7 });

  // ---- finale: accordo ampio di Si bemolle con corni e timpano
  const F = T.finale;
  [34, 46, 53, 58, 62, 65, 70].forEach((m, j) => piano(mix, m, { t: F + j * 0.06, dur: 3.2, vel: 50, gain: BODY * 1.1, pan: -0.3 + j * 0.1, rev: 0.6 }));
  [58, 62, 65, 70].forEach((m, j) => strings(mix, m, { t: F, dur: 3, vel: 50, gain: BODY * 0.85, pan: (j - 1.5) * 0.3, att: 0.4, seed: 100 + j }));
  [46, 53].forEach((m) => horn(mix, m, { t: F, dur: 3, vel: 46, gain: BODY }));
  timpani(mix, 34, F, 60);
};
