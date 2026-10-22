// Colonna sonora originale di Harry Potter e la pietra filosofale: arpa, flauto, archi e campanelli, discreta sotto la voce.
// Tema inventato qui, in Fa maggiore e in 4/4, luminoso e curioso, volutamente lontano dal tema dei film (niente valzer di
// celesta in minore). Cupo nello sgabuzzino e nei sotterranei, festoso nella grande sala e nel Quidditch; finale ampio.
import { put, rng, drum, note, thunder, whoosh, thud, pop, rainHiss, crackle, lockClick } from './synth.mjs';
import { loadFilm, timeline } from './film.mjs';

const TAU = Math.PI * 2;
const SR = 44100;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const vamp = (v) => (v / 127) ** 1.6;

// ---------------------------------------------------------------- strumenti locali (via put)

/** Flauto: sinusoide con un filo di seconda armonica, soffio e vibrato. */
const flute = (mix, m, { t, dur, vel = 50, pan = 0.2, gain = 1 }) => {
  const f = mtof(m);
  const r = rng(Math.round(t * 1000) + m);
  let lp = 0;
  put(mix, t, Math.ceil((dur + 0.3) * SR), (i) => {
    const x = i / SR;
    const vib = 1 + 0.004 * Math.sin(TAU * 5.4 * x) * Math.min(1, x / 0.4);
    lp += 0.05 * ((r() * 2 - 1) - lp);
    const s = Math.sin(TAU * f * vib * x) + 0.12 * Math.sin(TAU * 2 * f * vib * x) + lp * 0.15;
    return s * Math.min(1, x / 0.06) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / 0.3));
  }, { gain: gain * vamp(vel) * 0.5, pan, rev: 0.55 });
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

/** Campanelli: parziali inarmoniche brevi e brillanti. */
const bell = (mix, m, { t, vel = 40, pan = 0.3 }) => {
  const f = mtof(m);
  put(mix, t, Math.ceil(2.2 * SR), (i) => {
    const x = i / SR;
    return (Math.sin(TAU * f * x) * Math.exp(-x / 0.8) + 0.4 * Math.sin(TAU * 2.76 * f * x) * Math.exp(-x / 0.3) + 0.2 * Math.sin(TAU * 5.4 * f * x) * Math.exp(-x / 0.12)) * Math.min(1, x / 0.002);
  }, { gain: vamp(vel) * 0.45, pan, rev: 0.7 });
};

/** Arpa: arpeggio di pluck su un accordo. */
const harp = (mix, chord, t, { step = 0.12, vel = 44, up = true } = {}) => {
  const notes = [...chord, ...chord.map((m) => m + 12)];
  (up ? notes : notes.reverse()).forEach((m, j) => note(mix, 'pluck', mtof(m), { t: t + j * step, dur: 1.6, vel, pan: -0.4 + j * 0.12, rev: 0.5, gain: 0.8 }));
};

/** Fischio del treno a vapore: due note che salgono un po', con soffio. */
const whistle = (mix, t, dur = 1.6, vel = 46) => {
  const r = rng(Math.round(t * 1000));
  put(mix, t, Math.ceil((dur + 0.3) * SR), (i) => {
    const x = i / SR;
    const bend = 1 + 0.02 * Math.min(1, x / 0.3);
    const env = Math.min(1, x / 0.08) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / 0.3));
    return (Math.sin(TAU * 740 * bend * x) + Math.sin(TAU * 932 * bend * x) * 0.8 + (r() * 2 - 1) * 0.2) * env * 0.4;
  }, { gain: vamp(vel), pan: -0.4, rev: 0.5 });
};

/** Verso del gufo: due «uu» morbidi che scendono. */
const hoot = (mix, t, vel = 40, pan = 0) => {
  [0, 0.45].forEach((d, k) => put(mix, t + d, Math.ceil(0.4 * SR), (i) => {
    const x = i / SR;
    const f = (k ? 360 : 400) * (1 - 0.06 * x / 0.4);
    return Math.sin(TAU * f * x) * Math.sin(Math.PI * x / 0.4) ** 1.5;
  }, { gain: vamp(vel) * 0.6, pan, rev: 0.5 }));
};

/** Ringhio: rumore grave modulato. */
const growl = (mix, t, dur = 1.6, vel = 50) => {
  const r = rng(Math.round(t * 1000));
  let lp = 0;
  put(mix, t, Math.ceil(dur * SR), (i) => {
    const x = i / SR;
    lp += 0.03 * ((r() * 2 - 1) - lp);
    return lp * 6 * (0.6 + 0.4 * Math.sin(TAU * 28 * x)) * Math.sin(Math.PI * x / dur);
  }, { gain: vamp(vel), pan: 0.1, rev: 0.3 });
};

// ---------------------------------------------------------------- materiale musicale

// Tema (16 tempi, Fa maggiore): [tempo, nota MIDI, durata in tempi]
const THEME = [[0, 72, 1], [1, 77, 1], [2, 79, 1], [3, 81, 1], [4, 82, 2], [6, 81, 1], [7, 79, 1],
  [8, 77, 1.5], [9.5, 79, 0.5], [10, 81, 1], [11, 77, 1], [12, 79, 3]];
const CH = [[53, 57, 60], [58, 62, 65], [50, 53, 57], [48, 52, 55]]; // Fa, Si♭, Re minore, Do
const CH_DARK = [[50, 53, 57], [46, 50, 53], [50, 53, 57], [45, 49, 52]]; // Re minore, Si♭, Re minore, La

export default (mix, T) => {
  const { segments } = timeline(loadFilm('harry-potter-pietra-filosofale'));
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

  const theme = (from, to, { bpm = 76, vel = 48, str = 34, dark = false, keep = 1, seed = 1, harpVel = 40, big = false } = {}) => {
    const beat = 60 / bpm, loop = 16 * beat;
    const R = rng(11000 + seed);
    const chords = dark ? CH_DARK : CH;
    for (let L = from; L < to - 0.3; L += loop) {
      for (let b = 0; b < 4; b++) {
        const t = L + b * 4 * beat;
        if (t >= to - 0.4) break;
        const d = Math.min(4 * beat * 1.05, to - t);
        if (harpVel) harp(mix, chords[b], t, { step: beat / 3, vel: harpVel });
        chords[b].forEach((m, j) => strings(mix, m + 12, { t: t + j * 0.05, dur: d, vel: str, gain: BODY * 0.8, pan: (j - 1) * 0.35, seed: j + seed }));
        if (big) strings(mix, chords[b][0] - 12, { t, dur: d, vel: str, gain: BODY * 0.8, seed: 9 });
      }
      for (const [b, m, d] of THEME) {
        const t = L + b * beat;
        if (t >= to - 0.2 || R() > keep) continue;
        const mm = dark ? (m % 12 === 9 ? m - 1 : m % 12 === 4 ? m - 1 : m) - 3 : m;
        flute(mix, mm, { t, dur: Math.min(d * beat * 1.05, to - t), vel: vel * (0.9 + R() * 0.2), gain: BODY * 1.2 });
      }
    }
  };

  // ---- copertina: arpa che sale, campanelli, un gufo
  harp(mix, CH[0], 0.2, { step: 0.1, vel: 46 });
  [84, 89, 93, 96].forEach((m, j) => bell(mix, m, { t: 1.2 + j * 0.25, vel: 38, pan: -0.3 + j * 0.2 }));
  hoot(mix, 2.6, 34, -0.3);

  // ---- sottoscala: tema cupo e lento, poi un passo di troppo sulle scale
  theme(T.sottoscala, T.lettere, { bpm: 60, vel: 36, str: 28, dark: true, keep: 0.6, harpVel: 28, seed: 1 });
  [0, 0.25, 0.5, 0.75, 1.0].forEach((d) => thud(mix, cue('sottoscala', 1) + d, 34, { bright: 500 })); // passi sulle scale

  // ---- lettere: vivace, le lettere che frusciano, i gufi
  theme(T.lettere, T.mago, { bpm: 96, vel: 44, str: 30, keep: 0.9, harpVel: 34, seed: 2 });
  for (let t = cue('lettere', 2), k = 0; t < T.mago - 0.3; t += 0.18, k++) whoosh(mix, t, 0.16, { vel: 22 + (k % 3) * 4, lo: 1800, hi: 4200, seed: k, pan: -0.5 + (k % 5) * 0.25 });
  hoot(mix, T.lettere + 1.2, 34, 0.4);
  hoot(mix, T.lettere + 2.6, 30, -0.5);

  // ---- mago: tempesta, la porta che cade, la rivelazione
  rainHiss(mix, T.mago, T.binario, { power: 0.1 });
  thunder(mix, T.mago + 0.7, 0.3, 3); // lampi di Mago.tsx
  thud(mix, T.mago + 0.9, 48, { bright: 500 });
  thunder(mix, cue('mago', 2) + 0.4, 0.35, 5);
  crackle(mix, T.mago + 1.2, T.binario, { vel: 30 });
  [50, 53, 57].forEach((m, j) => strings(mix, m, { t: T.mago + 1, dur: cue('mago', 1) - T.mago - 1, vel: 30, gain: BODY * 0.8, att: 1, pan: (j - 1) * 0.4, seed: 30 + j }));
  harp(mix, CH[0], cue('mago', 1), { step: 0.08, vel: 48 });
  [84, 88, 91, 96].forEach((m, j) => bell(mix, m, { t: cue('mago', 1) + 0.3 + j * 0.15, vel: 40 }));

  // ---- binario: il muro come acqua, il fischio e il vapore del treno
  theme(T.binario, T.castello, { bpm: 88, vel: 46, str: 32, keep: 0.9, harpVel: 34, seed: 4 });
  whoosh(mix, cue('binario', 1) + 0.6, 1.6, { vel: 40, lo: 400, hi: 2400 });
  whistle(mix, cue('binario', 2) + 0.2, 1.4, 44);
  for (let t = cue('binario', 2) + 0.4; t < T.castello - 0.2; t += 0.5) whoosh(mix, t, 0.3, { vel: 26, lo: 600, hi: 3000, seed: Math.round(t * 10) });

  // ---- castello: meraviglia notturna, campanelli come stelle sull'acqua
  theme(T.castello, T.cappello, { bpm: 66, vel: 46, str: 36, keep: 1, harpVel: 36, seed: 5 });
  for (let t = T.castello + 0.5, k = 0; t < T.cappello - 0.5; t += 0.7, k++) bell(mix, [89, 93, 96, 101][k % 4], { t, vel: 22, pan: -0.5 + (k % 5) * 0.25 });

  // ---- cappello: festa nella grande sala, applauso di campanelli su Grifondoro
  theme(T.cappello, T.quidditch, { bpm: 92, vel: 50, str: 38, keep: 1, harpVel: 38, big: true, seed: 6 });
  pop(mix, cue('cappello', 1) + 0.2, 36, { pitch: -3 });
  [84, 88, 91, 96, 100].forEach((m, j) => bell(mix, m, { t: cue('cappello', 3) + 0.1 + j * 0.1, vel: 46, pan: -0.4 + j * 0.2 }));
  for (let t = cue('cappello', 3); t < T.quidditch - 0.3; t += 0.12) drum(mix, 'shaker', t, 36, Math.round(t * 10));

  // ---- quidditch: allegro con tamburi leggeri, sibili della scopa, frullo della pallina
  theme(T.quidditch, T.cane, { bpm: 112, vel: 50, str: 36, keep: 1, harpVel: 30, seed: 7 });
  for (let t = T.quidditch + 0.2; t < T.cane - 0.3; t += 60 / 112) drum(mix, 'softkick', t, 34, 2);
  for (let t = cue('quidditch', 1); t < T.cane - 0.5; t += 1.4) whoosh(mix, t, 0.6, { vel: 40, lo: 500, hi: 3500, seed: Math.round(t * 10), pan: Math.sin(t) * 0.6 });
  for (let t = cue('quidditch', 3); t < T.cane - 0.2; t += 0.05) pop(mix, t, 14, { pitch: 14, pan: Math.sin(t * 3) * 0.5 });

  // ---- cane: tensione, ringhio quando si sveglia, l'arpa che lo riaddormenta
  [50, 51].forEach((m, j) => strings(mix, m, { t: T.cane, dur: cue('cane', 3) - T.cane, vel: 40, gain: BODY * 0.8, att: 1, pan: (j - 0.5) * 0.6, seed: 40 + j, bright: 2 }));
  growl(mix, cue('cane', 1) + 0.3, 2.2, 66);
  growl(mix, cue('cane', 2) + 0.4, 1.4, 44);
  for (let k = 0; k < 4; k++) harp(mix, CH[k % 4], cue('cane', 3) - 1 + k * 0.6, { step: 0.07, vel: 40 });

  // ---- specchio: neve e campanelli, il tema dolce che si accende, poi si calma
  theme(T.specchio, T.botola, { bpm: 58, vel: 44, str: 34, keep: 0.9, harpVel: 30, seed: 8 });
  for (let t = cue('specchio', 1) - 0.4, k = 0; t < cue('specchio', 4); t += 0.35, k++) bell(mix, [96, 100, 103, 108][k % 4], { t, vel: 20, pan: -0.5 + (k % 5) * 0.25 });

  // ---- botola: cupo, chiavi che frullano, scacchi che si muovono, il cavallo che crolla
  theme(T.botola, T.pietra, { bpm: 70, vel: 40, str: 34, dark: true, keep: 0.7, harpVel: 0, seed: 9 });
  for (let t = cue('botola', 3) + 0.6; t < cue('botola', 4); t += 0.04) pop(mix, t, 10, { pitch: 10 + Math.sin(t * 9) * 4, pan: Math.sin(t * 5) * 0.6 });
  [0, 1, 2].forEach((k) => thud(mix, cue('botola', 4) + k * 0.4, 46, { bright: 700 }));
  thud(mix, cue('botola', 4) + 2.0, 56, { bright: 600 });
  whoosh(mix, cue('botola', 4) + 2.0, 1.2, { vel: 40, lo: 300, hi: 1500 });

  // ---- pietra: il fuoco magico, il buio, la luce che lo protegge, la pietra che si sbriciola
  crackle(mix, T.pietra, T.finale - 0.3, { vel: 30, seed: 9 });
  [50, 51, 57].forEach((m, j) => strings(mix, m, { t: T.pietra, dur: cue('pietra', 3) - T.pietra, vel: 34, gain: BODY * 0.8, att: 1, pan: (j - 1) * 0.4, seed: 50 + j, bright: 2 }));
  [84, 89, 93].forEach((m, j) => bell(mix, m, { t: cue('pietra', 1) + 0.6 + j * 0.15, vel: 36 }));
  theme(cue('pietra', 3), T.finale, { bpm: 72, vel: 50, str: 44, keep: 1, harpVel: 40, big: true, seed: 10 });
  [96, 100, 103, 108, 112].forEach((m, j) => bell(mix, m, { t: cue('pietra', 4) + j * 0.12, vel: 34, pan: -0.4 + j * 0.2 }));
  lockClick(mix, cue('pietra', 4), 30);

  // ---- finale: accordo di Fa maggiore ampio, arpa e campanelli, un gufo
  const F = T.finale;
  harp(mix, CH[0], F, { step: 0.08, vel: 48 });
  [53, 57, 60, 65, 69, 72].forEach((m, j) => strings(mix, m, { t: F, dur: 3, vel: 48, gain: BODY * 0.85, pan: (j - 2.5) * 0.25, att: 0.4, seed: 100 + j }));
  flute(mix, 77, { t: F + 0.3, dur: 2.8, vel: 46, gain: BODY * 1.2 });
  [89, 93, 96, 101].forEach((m, j) => bell(mix, m, { t: F + 0.8 + j * 0.2, vel: 36, pan: -0.3 + j * 0.2 }));
  hoot(mix, F + 1.6, 30, 0.4);
};
