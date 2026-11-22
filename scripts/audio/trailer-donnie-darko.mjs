// Colonna sonora del trailer verticale di «Donnie Darko spiegato» (promo/trailer-donnie-darko.json, TRAILER.md).
// Stessa famiglia sonora del lungo e dello Short (pianoforte sospeso, arpa, archi gravi, campanelle; più ottoni bassi,
// timpani e grancassa per i cartelli, come il trailer di riferimento di Ritorno al futuro). 60 bpm, Mi minore, motivo
// inventato (Si, Re, Mi, Si · Do, Si, Sol, Fa#): niente brani o temi del film.
// Forma: miniatura con il sibilo del motore che cade e il colpo → cold open quasi in silenzio (bordone, ticchettio del
// contatore) → tre «braam» di ottoni bassi, uno per cartello, con gli archi sempre più pieni → montaggio a passo doppio con
// rullante e crescendo → taglio netto: nel buio il contatore che pulsa (ticchettio secco + battito basso) sotto la battuta
// → colpo forte sul titolo (piatto, timpani, ottoni pieni, rombo) → chiusura in Mi maggiore con i pulsanti.
// Istanti uguali a eventi() di src/promo/trailer-donnie-darko/Scena.tsx.
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';

export const strumenti = ['pianoforte_coda', 'arpa', 'glockenspiel', 'violini', 'viole', 'celli', 'contrabbasso', 'celli_spicc', 'viole_spicc', 'violini_trem', 'celli_trem',
  'corno', 'trombone', 'timpani', 'grancassa', 'rullante', 'piatto_crash', 'piatto_sospeso'];
export const effetti = ['passaggio', 'metallo_schianto', 'rombo', 'scatti', 'onde', 'fuoco', 'fiammata', 'vento_raffiche', 'aereo'];
export const sala = { rt60: 2.6, brillo: 5000, predelay: 0.03, wet: 0.48 };

const BPM = 60;
const BEAT = 60 / BPM;
const BAR = 4;
const CROMA = 0.5;
const g = (t) => Math.round(t / CROMA) * CROMA;
const CH = [[40, [0, 7, 12, 15]], [36, [0, 7, 11, 16]], [45, [0, 7, 12, 15]], [47, [0, 4, 10, 15]]];
const MAJ = [[40, [0, 7, 12, 16]], [45, [0, 7, 12, 16]], [44, [0, 7, 12, 15]], [47, [0, 7, 10, 16]]];
const MOTIF = [[0, 71], [1, 74], [2, 76], [3, 71], [4, 72], [5, 71], [6, 67], [7, 66]];

export default (mix, T) => {
  const S = T;
  const E = {
    colpo: 3.5, nero: S.inizio, casa: S.inizio + 2, golf: g(S.inizio + 5),
    b1: S.giorni, b2: S.fuoco, b3: S.vortice, corsa: S.corsa, buio: g(S.corsa + 4), hit: g(S.titolo + 2.5), fine: S.chiusura,
    like: g(T.frase('chiusura', 0) + 1.6), iscr: g(T.frase('chiusura', 0) + 2.2), press: g(T.frase('chiusura', 0) + 5.0), comm: g(T.frase('chiusura', 1) + 0.1),
  };
  const kk = (t) => ((Math.floor(t / BAR + 1e-6) % 4) + 4) % 4;
  const strings = (from, to, { vel = 40, gain = 1, chords = CH } = {}) => {
    for (let t = from; t < to - 0.3; t += BAR) {
      const [root, iv] = chords[kk(t)];
      const d = Math.min(BAR + 0.05, to - t);
      iv.slice(1).forEach((v, j) => archi(mix, root + 12 + v, { t: t + j * 0.03, dur: d, vel: vel + 8, pan: (j - 1) * 0.35, rev: 0.55, gain: gain * 1.3, attack: 0.6, release: 1.0, seed: j }));
      suona(mix, 'contrabbasso', root, { t, dur: d, vel: vel + 12, gain: gain * 1.4, attack: 0.5, release: 1.0, rev: 0.5 });
    }
  };
  const spic = (from, to, { vel = 36, doppio = false } = {}) => {
    const step = doppio ? CROMA / 2 : CROMA;
    for (let t = from, i = 0; t < to - 0.05; t += step, i++) {
      const [root, iv] = CH[kk(t)];
      const n = [root, root + iv[1], root + 12, root + iv[1]][i % 4] + 12;
      suona(mix, n < 55 ? 'celli_spicc' : 'viole_spicc', n, { t, dur: step * 0.9, vel: vel * 1.7 * (i % 2 ? 0.75 : 1), pan: i % 2 ? 0.25 : -0.25, rev: 0.35, gain: 2.4, release: 0.12 });
    }
  };
  const piano = (t, m, vel = 40) => suona(mix, 'pianoforte_coda', m, { t, dur: 1.4, vel: vel * 1.2, pan: 0.15, rev: 0.6, gain: 1.4, release: 0.8 });
  const bell = (t, m, vel = 40) => suona(mix, 'glockenspiel', m, { t, dur: 2.2, vel: vel * 1.3, pan: 0.25, rev: 0.7, gain: 0.3, release: 1.4 });
  const timp = (t, vel = 110, gain = 0.8, forte = true) => colpo(mix, 'timpani', forte ? 'Timpani1_Hit_v4_rr1_Sum' : 'Timpani1_Hit_v2_rr1_Sum', { t, vel, gain, rev: 0.45 });
  const brass = (t, dur, notes, { vel = 56, gain = 0.34 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 52 ? 'trombone' : 'corno', m, { t, dur, vel: vel * 1.5, pan: -0.3 + j * 0.25, gain, attack: 0.03, release: 0.9, rev: 0.5, seed: j + 11 }));
  const kick = (t, gain = 0.6) => colpo(mix, 'grancassa', 'bdrum_f', { t, vel: 100, gain, rev: 0.4, seed: Math.round(t * 10) });
  const snare = (t, gain = 0.35) => colpo(mix, 'rullante', 'v5', { t, vel: 100, gain, pan: 0.1, rev: 0.3, seed: Math.round(t * 100) });
  const crash = (t, gain = 0.38) => colpo(mix, 'piatto_crash', 'mf', { t, vel: 100, gain, rev: 0.4, seed: Math.round(t * 10) });
  const braam = (t, root = 40, k = 1) => {
    clip(mix, 'passaggio', { t: t - 0.6, da: 0.56, durata: 1.0, gain: 0.26, fadeOut: 0.2, rev: 0.35 });
    brass(t, 1.9, [root - 12, root - 5, root], { vel: 58 + 6 * k, gain: 0.36 + 0.04 * k });
    suona(mix, 'contrabbasso', root - 12 < 28 ? root : root - 12, { t, dur: 1.9, vel: 80, gain: 0.9, attack: 0.02, release: 0.8, rev: 0.5 });
    timp(t, 110, 0.6);
    kick(t, 0.5 + 0.08 * k);
    clip(mix, 'rombo', { t, da: 3.6, durata: 2.2, gain: 0.12 + 0.03 * k, fadeIn: 0.02, fadeOut: 1.2, largo: 2 });
  };
  const tic = (from, to) => { for (let t = Math.ceil(from); t < to - 0.1; t += BEAT) clip(mix, 'scatti', { t, da: 6.49, durata: 0.06, gain: 0.28, rev: 0.15, pan: 0.4 }); };

  // ---- miniatura: il motore che cade (sibilo) e sfonda il tetto, poi il nero
  clip(mix, 'passaggio', { t: 2.5, da: 0.56, durata: 1.0, gain: 0.3, fadeOut: 0.1, rev: 0.3 });
  clip(mix, 'metallo_schianto', { t: E.colpo, da: 0, durata: 1.4, gain: 0.55, fadeOut: 0.5, rev: 0.4 });
  timp(E.colpo, 120, 0.8);
  [71, 74, 76].forEach((m, k) => bell(0.4 + k, m + 12, 30));
  // ---- cold open: bordone e ticchettio, il motivo al pianoforte spoglio
  suona(mix, 'contrabbasso', 28, { t: E.nero, dur: E.b1 - E.nero, vel: 46, gain: 0.8, attack: 1.2, release: 1.4, rev: 0.6 });
  tic(E.nero + 0.5, E.b1 - 0.5);
  MOTIF.forEach(([b, m]) => piano(E.casa + b * 0.75, m, 36));
  clip(mix, 'vento_raffiche', { t: E.nero, da: 9.2, durata: E.b1 - E.nero, gain: 0.05, fadeIn: 0.6, fadeOut: 0.8, largo: 1.5 });
  // ---- tre cartelli, sempre più pieni
  braam(E.b1, 40, 1);
  strings(E.b1 + 2, E.b2 - 0.2, { vel: 30, gain: 0.8 });
  clip(mix, 'onde', { t: E.b1 + 2.1, da: 4, durata: 4.5, gain: 0.12, fadeIn: 0.4, fadeOut: 1, largo: 1.4 });
  tic(E.b1 + 2, E.b2 - 0.5);
  braam(E.b2, 36, 2);
  strings(E.b2 + 2, E.b3 - 0.2, { vel: 36, gain: 0.9 });
  spic(E.b2 + 2, E.b3 - 0.2, { vel: 30 });
  clip(mix, 'fiammata', { t: E.b2 + 2.1, da: 0.22, durata: 1.2, gain: 0.3, fadeOut: 0.4, rev: 0.3 });
  clip(mix, 'fuoco', { t: E.b2 + 2.3, da: 2, durata: 4.5, gain: 0.1, fadeIn: 0.4, fadeOut: 1, largo: 1.4 });
  braam(E.b3, 33, 3);
  strings(E.b3 + 2, E.corsa, { vel: 44, gain: 1 });
  spic(E.b3 + 2, E.corsa, { vel: 36, doppio: true });
  clip(mix, 'vento_raffiche', { t: E.b3 + 2, da: 9.2, durata: 5, gain: 0.09, fadeIn: 0.6, fadeOut: 1, largo: 1.6 });
  clip(mix, 'aereo', { t: E.b3 + 3, da: 3, durata: 4, gain: 0.12, fadeIn: 0.6, fadeOut: 0.8, largo: 1.4 });
  // ---- montaggio a un battito: rullante, crescendo, colpo per ogni taglio
  strings(E.corsa, E.buio, { vel: 52, gain: 1.1 });
  spic(E.corsa, E.buio, { vel: 44, doppio: true });
  for (let i = 0; i < 4; i++) { kick(E.corsa + i, 0.5); timp(E.corsa + i, 100, 0.4, false); }
  for (let t = E.corsa; t < E.buio - 0.05; t += 0.25) snare(t, 0.12 + 0.2 * ((t - E.corsa) / 4));
  // ---- nel buio: silenzio, il contatore che pulsa (ticchettio secco e battito basso) sotto la battuta
  for (let t = E.buio; t < E.hit - 0.1; t += BEAT) {
    clip(mix, 'scatti', { t, da: 6.49, durata: 0.06, gain: 0.4, rev: 0.1 });
    kick(t + 0.02, 0.25);
  }
  colpo(mix, 'piatto_sospeso', 'susp_FX_scrape_continuous', { t: E.hit - 1.5, dur: 1.5, vel: 90, gain: 0.4, release: 0.2, rev: 0.4, da: 2 });
  // ---- il titolo: colpo forte e ottoni pieni
  crash(E.hit, 0.45);
  timp(E.hit, 127, 1.1);
  kick(E.hit, 0.8);
  brass(E.hit, 3.5, [28, 35, 40, 47, 52], { vel: 70, gain: 0.42 });
  clip(mix, 'rombo', { t: E.hit, da: 3.6, durata: 3, gain: 0.18, fadeOut: 1.5, largo: 2 });
  strings(E.hit + 0.5, E.fine, { vel: 46, gain: 1 });
  // ---- chiusura in Mi maggiore
  strings(E.fine, T.END, { vel: 38, gain: 0.9, chords: MAJ });
  for (let t = E.fine, i = 0; t < T.END - 1; t += BEAT, i++) suona(mix, 'arpa', [64, 68, 71, 76][i % 4] + 12, { t, dur: 2.5, vel: 46, pan: -0.2, rev: 0.6, gain: 0.9, release: 1.2 });
  bell(E.like, 83, 38); bell(E.iscr, 88, 40); bell(E.press, 91, 42); bell(E.comm, 88, 36);
};
