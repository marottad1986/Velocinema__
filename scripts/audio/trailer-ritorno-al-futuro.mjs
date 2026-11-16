// Colonna sonora del trailer verticale di Ritorno al futuro (promo/trailer-ritorno-al-futuro.json), stessa famiglia sonora
// dei tre episodi: orchestra campionata (VSCO-2 CE e VCSL, CC0), archi in spiccato come un motore che gira, corni e tromba,
// timpani; lo stesso motivo inventato del tic-tac (scripts/audio/ritorno-al-futuro.mjs), in Mi bemolle maggiore.
// Niente brani o temi del film. 72 bpm su una griglia continua da 0: gli stacchi e gli anni cadono sulla croma, con le
// stesse formule della scena (eventi() in src/promo/trailer-ritorno-al-futuro/Scena.tsx).
// Forma da trailer: copertina con il fulmine e il tic-tac; Parte I il motore che si avvia; Parte II più piena, il casinò
// di Biff in minore; Parte III a passo doppio con il treno; a ogni stacco scie (passaggio), piatto e timpano, poi la
// chiusura in maggiore con i pulsanti e un ultimo accordo tenuto.
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';

export const strumenti = ['pianoforte_coda', 'violini', 'viole', 'celli', 'contrabbasso', 'celli_spicc', 'viole_spicc', 'violini_trem', 'celli_trem',
  'glockenspiel', 'corno', 'tromba', 'trombone', 'timpani', 'grancassa', 'rullante', 'piatto_crash', 'piatto_sospeso'];
export const effetti = ['tuono_forte', 'tuono_secco', 'scariche', 'passaggio', 'scatti', 'treno_vapore', 'fischio_vapore', 'monete'];
/** Sala media, luminosa, come negli episodi. */
export const sala = { rt60: 2.0, brillo: 6000, predelay: 0.02, wet: 0.42 };

const BPM = 72;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const CROMA = BEAT / 2;
const g = (t) => Math.round(t / CROMA) * CROMA;
const battito = (t) => Math.round(t / BEAT) * BEAT;

// Mi bemolle · Do minore · La bemolle · Si bemolle; minore per il 1985 di Biff
const CH = [[39, [0, 4, 7]], [36, [0, 3, 7]], [44, [0, 4, 7]], [46, [0, 4, 7]]];
const MIN = [[36, [0, 3, 7]], [44, [0, 4, 7]], [41, [0, 3, 7]], [43, [0, 4, 7]]];
const MOTIF = [[0, 70, 1], [1, 65, 1], [2, 70, 1], [3, 65, 1], [4, 72, 1], [5, 74, 1], [6, 75, 2], [8, 74, 1], [9, 72, 1], [10, 70, 2], [12, 67, 2], [14, 70, 2]];

export default (mix, T) => {
  /** Gli stessi istanti di eventi() nella scena. */
  const E = {
    c2: g(T.secondo), c3: g(T.terzo), c4: g(T.chiusura),
    y1: g(T.frase('primo', 0) + 2.1), y2: g(T.frase('secondo', 0) + 1.2), y2b: g(T.frase('secondo', 1) + 1.9), y3: g(T.frase('terzo', 0) + 2.4),
    like: g(T.frase('chiusura', 0) + 2.4), iscr: g(T.frase('chiusura', 0) + 3.7), comm: g(T.frase('chiusura', 1) + 0.1),
  };
  const kk = (t) => ((Math.floor(t / BAR + 1e-6) % 4) + 4) % 4;

  const strings = (from, to, { vel = 42, gain: g0 = 0.4, chords = CH, high = false } = {}) => {
    const gain = g0 * 2.6;
    for (let t = from; t < to - 0.3; t = (Math.floor(t / BAR + 1e-6) + 1) * BAR) {
      const [root, iv] = chords[kk(t)];
      const d = Math.min((Math.floor(t / BAR + 1e-6) + 1) * BAR - t + 0.05, to - t);
      archi(mix, root + 12, { t, dur: d, vel: vel + 6, pan: -0.3, rev: 0.55, gain: gain * 1.2, attack: 0.3, release: 1.0, seed: kk(t) });
      iv.slice(1, 3).forEach((v, j) => archi(mix, root + 24 + v, { t: t + 0.03 * j, dur: d, vel: vel + 4, pan: 0.1 + j * 0.25, rev: 0.55, gain, attack: 0.3, release: 1.0, seed: j + 1 }));
      suona(mix, 'contrabbasso', root, { t, dur: d, vel: vel + 8, gain: gain * 1.2, attack: 0.2, release: 1.0, rev: 0.5 });
      if (high) suona(mix, 'violini', root + 36 + iv[2], { t, dur: d, vel, pan: -0.2, gain: gain * 0.6, attack: 0.4, release: 1.2, rev: 0.6 });
    }
  };
  const spic = (from, to, { vel = 34, doppio = false, chords = CH } = {}) => {
    const step = doppio ? CROMA / 2 : CROMA;
    for (let t = from, i = 0; t < to - 0.05; t += step, i++) {
      const [root, iv] = chords[kk(t)];
      const notes = [root + 12, root + 12 + iv[1], root + 12 + iv[2], root + 24];
      const accent = i % (doppio ? 4 : 2) === 0;
      suona(mix, notes[i % 4] < 55 ? 'celli_spicc' : 'viole_spicc', notes[i % 4] + 12, { t, dur: step * 0.9, vel: vel * 1.7 * (accent ? 1 : 0.75), pan: i % 2 ? 0.25 : -0.25, rev: 0.35, gain: 1.3, release: 0.12 });
    }
  };
  const motif = (from, to, { id = 'pianoforte_coda', vel = 46, gain = 0.5, oct = 0, pan = 0.15 } = {}) => {
    const loop = 16 * CROMA;
    for (let L = from; L < to - 0.3; L += loop) {
      for (const [b, m, d] of MOTIF) {
        const t = L + b * CROMA;
        if (t >= to - 0.2) break;
        const brass = id === 'corno' || id === 'tromba';
        suona(mix, id, m + oct, { t, dur: d * CROMA * 0.95, vel: brass ? vel * 1.6 : vel * 1.2, pan, rev: 0.5, gain: id === 'pianoforte_coda' ? gain * 2.6 : gain * 1.5, attack: brass ? 0.03 : 0, release: brass ? 0.35 : 0.6 });
      }
    }
  };
  const timp = (t, m = 39, vel = 90, gain = 0.6) => suona(mix, 'timpani', m, { t, dur: 2, vel, gain, rev: 0.5, release: 0.8, seed: Math.round(t * 10) });
  const bell = (t, m, vel = 44, pan = -0.2) => suona(mix, 'glockenspiel', m, { t, dur: 2, vel: vel * 1.3, pan, rev: 0.65, gain: 0.4, release: 1.3 });
  const brass = (t, dur, notes, { vel = 54, gain = 0.32 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 52 ? 'trombone' : 'corno', m, { t, dur, vel: vel * 1.5, pan: -0.3 + j * 0.25, gain, attack: 0.08, release: 0.8, rev: 0.5, seed: j + 11 }));
  const fanfare = (t, notes, { vel = 56, gain = 0.3, step = CROMA } = {}) => notes.forEach((m, j) =>
    suona(mix, 'tromba', m, { t: t + j * step, dur: j === notes.length - 1 ? BEAT * 1.5 : step * 0.9, vel: vel * 1.6, pan: 0.2, gain, attack: 0.02, release: 0.5, rev: 0.45 }));
  const snare = (t, gain = 0.4) => colpo(mix, 'rullante', 'v5', { t, vel: 100, gain, pan: 0.1, rev: 0.3, seed: Math.round(t * 100) });
  const crash = (t, gain = 0.35) => colpo(mix, 'piatto_crash', 'mf', { t, vel: 100, gain, rev: 0.4, seed: Math.round(t * 10) });
  const kick = (t, gain = 0.6) => colpo(mix, 'grancassa', 'bdrum_f', { t, vel: 100, gain, rev: 0.4, seed: Math.round(t * 10) });
  const roll = (t, d = 1.6, gain = 0.18) => colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_roll2_cresc', { t: t - d, vel: 52, rev: 0.45, gain, dur: d, release: 0.4 });
  const trem = (t, dur, notes, { vel = 44, gain = 0.3 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 60 ? 'celli_trem' : 'violini_trem', m, { t, dur, vel: Math.max(vel, 70), pan: (j - (notes.length - 1) / 2) * 0.35, gain, attack: 0.4, release: 0.9, rev: 0.55, seed: j + 3 }));
  /** Lo stacco: scie che passano, rullo di piatto prima, poi piatto, grancassa e timpano sul lampo. */
  const stacco = (c, m = 39) => {
    roll(c, 1.2, 0.16);
    clip(mix, 'passaggio', { t: c - 0.55, da: 0.56, durata: 1.3, gain: 0.3, fadeOut: 0.4, rev: 0.35 });
    crash(c, 0.4);
    kick(c, 0.55);
    timp(c, m, 100, 0.6);
  };
  /** Il contatore che scorre: glockenspiel veloce che sale o scende. */
  const scorre = (t, su) => (su ? [70, 72, 74, 75, 77, 79, 82] : [82, 79, 77, 75, 74, 72, 70]).forEach((m, k) => bell(t + k * CROMA / 4, m, 30 + k, 0.3 - k * 0.08));

  // ---------------------------------------------------------------- copertina: il fulmine (0 s e 2,5 s) e il tic-tac
  clip(mix, 'tuono_secco', { t: 0, da: 0.7, durata: 1.6, gain: 0.32, fadeOut: 0.6, rev: 0.3 });
  clip(mix, 'scariche', { t: 0.02, da: 0.4, durata: 0.8, gain: 0.18, fadeOut: 0.3, rev: 0.2 });
  trem(0.05, battito(T.primo) - 0.05, [39, 58, 63], { vel: 40, gain: 0.22 });
  for (let i = 0; i < 6; i++) bell(CROMA * i + 0.4, i % 2 ? 77 : 82, 32, 0.2);
  clip(mix, 'tuono_forte', { t: 2.55, da: 0.55, durata: 1.4, gain: 0.3, fadeOut: 0.5, rev: 0.3 });
  timp(2.5, 39, 90, 0.5);

  // ---------------------------------------------------------------- Parte I (1955): il motore si avvia, il motivo al pianoforte
  const A1 = battito(T.primo);
  strings(A1, E.c2, { vel: 40, gain: 0.3 });
  spic(A1, E.c2, { vel: 26 });
  motif(A1 + BAR, E.c2 - BEAT, { vel: 40, gain: 0.42 });
  clip(mix, 'passaggio', { t: E.y1 - 0.3, da: 0.56, durata: 1.2, gain: 0.2, fadeOut: 0.4, rev: 0.35 });
  scorre(E.y1, false);
  brass(E.y1 + 0.8, BAR, [51, 58, 63], { vel: 44, gain: 0.24 });

  // ---------------------------------------------------------------- Parte II (2015, poi il 1985 di Biff)
  stacco(E.c2, 39);
  const B2 = Math.floor(E.y2b / BEAT) * BEAT; // la parte in maggiore si ferma un battito prima del 1985 di Biff
  strings(E.c2, B2, { vel: 44, gain: 0.34, high: true });
  spic(E.c2, B2, { vel: 30 });
  motif(E.c2 + BAR, B2, { id: 'corno', vel: 42, gain: 0.3 });
  scorre(E.y2, true);
  bell(E.y2 + 0.9, 87, 36, 0.3);
  // il 1985 di Biff: colpo, monete del casinò, minore con il tremolo
  kick(E.y2b, 0.5);
  timp(E.y2b, 36, 100, 0.6);
  clip(mix, 'monete', { t: E.y2b + 0.2, da: 1.3, durata: 0.7, gain: 0.22, fadeOut: 0.2, rev: 0.25 });
  trem(E.y2b + BEAT, E.c3 - E.y2b - BEAT, [36, 48, 55, 63], { vel: 46, gain: 0.26 });
  brass(E.y2b + BEAT, E.c3 - E.y2b - BEAT - 0.1, [36, 43], { vel: 40, gain: 0.26 });

  // ---------------------------------------------------------------- Parte III (1885): passo doppio, il treno
  stacco(E.c3, 39);
  strings(E.c3, E.c4, { vel: 46, gain: 0.36, high: true });
  spic(E.c3, E.c4, { vel: 32, doppio: true });
  motif(E.c3 + BEAT * 2, E.c4 - BEAT, { id: 'tromba', vel: 44, gain: 0.26, oct: 0 });
  for (let t = E.c3 + BEAT; t < E.c4 - 0.1; t += BEAT) if (Math.round((t - E.c3) / BEAT) % 2 === 1) snare(t, 0.22);
  clip(mix, 'treno_vapore', { t: E.c3 + 0.2, da: 5.4, durata: E.c4 - E.c3 - 0.2, gain: 0.1, fadeIn: 0.6, fadeOut: 1.0, rev: 0.2 });
  scorre(E.y3, false);
  clip(mix, 'fischio_vapore', { t: E.y3 + 1.0, da: 0, durata: 1.1, gain: 0.16, fadeOut: 0.4, rev: 0.35 });
  roll(E.c4, 2.0, 0.2);

  // ---------------------------------------------------------------- chiusura: il motivo in maggiore, pulsanti, accordo finale
  stacco(E.c4, 39);
  fanfare(E.c4 + BEAT, [58, 63, 67, 70], { vel: 52, gain: 0.28 });
  const AF = Math.floor(E.comm / BAR) * BAR;
  strings(E.c4, AF, { vel: 36, gain: 0.28 });
  motif(E.c4 + BAR, AF, { vel: 36, gain: 0.36 });
  [75, 79, 82].forEach((m, k) => bell(E.c4 + 0.4 + k * CROMA, m + 12, 28, 0.2)); // lo schermo si accende
  [0, 1, 2].forEach((k) => clip(mix, 'scatti', { t: E.c4 + 1.4 + k * CROMA / 2, da: 6.49, durata: 0.08, gain: 0.05, rev: 0.1 })); // «In 2 Minuti» scritto
  bell(E.like, 82, 32, -0.3);
  clip(mix, 'scatti', { t: E.iscr + 0.3, da: 6.49, durata: 0.1, gain: 0.2, rev: 0.15 }); // il clic su «iscriviti»
  [87, 91, 87, 91, 87].forEach((m, k) => bell(E.iscr + 0.35 + k * CROMA / 5, m, 32 - k * 3, 0.25)); // la campanella
  bell(E.comm, 79, 30, -0.2);
  [39, 51, 58, 63, 67].forEach((m, j) => archi(mix, m, { t: AF, dur: T.END - AF, vel: 40, pan: (j - 2) * 0.25, rev: 0.55, gain: 0.5, attack: 0.6, release: 1.4, seed: 90 + j }));
  brass(AF, T.END - AF, [51, 58, 63], { vel: 40, gain: 0.2 });
};
