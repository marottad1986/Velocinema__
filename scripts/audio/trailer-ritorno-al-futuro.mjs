// Colonna sonora del trailer verticale di Ritorno al futuro (promo/trailer-ritorno-al-futuro.json), montato come un trailer
// di cinema. Stessa famiglia sonora dei tre episodi: orchestra campionata (VSCO-2 CE e VCSL, CC0), archi in spiccato come un
// motore, corni, tromba, timpani; lo stesso motivo inventato del tic-tac (scripts/audio/ritorno-al-futuro.mjs), in Mi bemolle.
// Niente brani o temi del film. 72 bpm su una griglia continua da 0: stacchi e colpi cadono sulla croma, con le stesse
// formule della scena (eventi() in src/promo/trailer-ritorno-al-futuro/Scena.tsx).
// Forma: miniatura con il fulmine → cold open quasi in silenzio (bordone e ticchettio) → tre «braam» di ottoni bassi, uno
// per cartello, con il motore che sale di intensità a ogni salto → montaggio a passo doppio con rullante e crescendo → taglio
// netto: silenzio sotto la battuta finale → colpo forte sul titolo (piatto, timpani, ottoni pieni, tuono) → chiusura in
// maggiore con i pulsanti e un ultimo accordo tenuto.
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';

export const strumenti = ['pianoforte_coda', 'violini', 'viole', 'celli', 'contrabbasso', 'celli_spicc', 'viole_spicc', 'violini_trem', 'celli_trem',
  'glockenspiel', 'corno', 'tromba', 'trombone', 'timpani', 'grancassa', 'rullante', 'piatto_crash', 'piatto_sospeso'];
export const effetti = ['tuono_forte', 'tuono_secco', 'scariche', 'passaggio', 'scatti', 'treno_vapore', 'fischio_vapore', 'monete', 'rombo'];
/** Sala media, luminosa, come negli episodi. */
export const sala = { rt60: 2.0, brillo: 6000, predelay: 0.02, wet: 0.42 };

const BPM = 72;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const CROMA = BEAT / 2;
const g = (t) => Math.round(t / CROMA) * CROMA;

// Mi bemolle · Do minore · La bemolle · Si bemolle; minore per il casinò
const CH = [[39, [0, 4, 7]], [36, [0, 3, 7]], [44, [0, 4, 7]], [46, [0, 4, 7]]];
const MIN = [[36, [0, 3, 7]], [44, [0, 4, 7]], [41, [0, 3, 7]], [43, [0, 4, 7]]];
const MOTIF = [[0, 70, 1], [1, 65, 1], [2, 70, 1], [3, 65, 1], [4, 72, 1], [5, 74, 1], [6, 75, 2], [8, 74, 1], [9, 72, 1], [10, 70, 2], [12, 67, 2], [14, 70, 2]];

export default (mix, T) => {
  const S = { inizio: T.inizio, passato: T.passato, futuro: T.futuro, west: T.west, corsa: T.corsa, titolo: T.titolo, chiusura: T.chiusura };
  /** Gli stessi istanti di eventi() nella scena. */
  const E = {
    nero: g(S.inizio - 0.4), torre: g(S.inizio + 1.67), auto: g(S.inizio + 4.17),
    b1: S.passato, foto: g(S.passato + 1.25),
    b2: S.futuro, alm: g(S.futuro + 1.25), casino: g(T.frase('futuro', 1)),
    b3: S.west, lapide: g(S.west + 1.67), treno: g(S.west + 5),
    corsa: S.corsa, buio: g(S.corsa + 4 * BEAT), hit: g(S.titolo + 2.5), fine: S.chiusura,
    // eventi dentro le inquadrature disegnate (src/promo/trailer-ritorno-al-futuro/*.tsx, stessi istanti di Scena.tsx)
    accende: g(S.inizio + 4.17) + 0.8, sparisce: g(T.frase('passato', 1) + 1.6), doc: g(S.west + 2.9),
    like: g(T.frase('chiusura', 0) + 1.6), iscr: g(T.frase('chiusura', 0) + 2.2), press: g(T.frase('chiusura', 0) + 5.0), comm: g(T.frase('chiusura', 1) + 0.1),
  };
  const kk = (t, from) => ((Math.floor((t - from) / BAR + 1e-6) % 4) + 4) % 4;

  const strings = (from, to, { vel = 42, gain: g0 = 0.4, chords = CH, high = false } = {}) => {
    const gain = g0 * 2.6;
    for (let t = from; t < to - 0.3; t += BAR) {
      const [root, iv] = chords[kk(t, from)];
      const d = Math.min(BAR + 0.05, to - t);
      archi(mix, root + 12, { t, dur: d, vel: vel + 6, pan: -0.3, rev: 0.55, gain: gain * 1.2, attack: 0.3, release: 0.6, seed: kk(t, from) });
      iv.slice(1, 3).forEach((v, j) => archi(mix, root + 24 + v, { t: t + 0.03 * j, dur: d, vel: vel + 4, pan: 0.1 + j * 0.25, rev: 0.55, gain, attack: 0.3, release: 0.6, seed: j + 1 }));
      suona(mix, 'contrabbasso', root, { t, dur: d, vel: vel + 8, gain: gain * 1.2, attack: 0.2, release: 0.6, rev: 0.5 });
      if (high) suona(mix, 'violini', root + 36 + iv[2], { t, dur: d, vel, pan: -0.2, gain: gain * 0.6, attack: 0.4, release: 0.8, rev: 0.6 });
    }
  };
  const spic = (from, to, { vel = 34, doppio = false, chords = CH } = {}) => {
    const step = doppio ? CROMA / 2 : CROMA;
    for (let t = from, i = 0; t < to - 0.05; t += step, i++) {
      const [root, iv] = chords[kk(t, from)];
      const notes = [root + 12, root + 12 + iv[1], root + 12 + iv[2], root + 24];
      const accent = i % (doppio ? 4 : 2) === 0;
      suona(mix, notes[i % 4] < 55 ? 'celli_spicc' : 'viole_spicc', notes[i % 4] + 12, { t, dur: step * 0.9, vel: vel * 1.7 * (accent ? 1 : 0.75), pan: i % 2 ? 0.25 : -0.25, rev: 0.35, gain: 1.3, release: 0.12 });
    }
  };
  const motif = (from, to, { id = 'pianoforte_coda', vel = 46, gain = 0.5, oct = 0, pan = 0.15 } = {}) => {
    for (let L = from; L < to - 0.3; L += 16 * CROMA) {
      for (const [b, m, d] of MOTIF) {
        const t = L + b * CROMA;
        if (t >= to - 0.2) break;
        const brass = id === 'corno' || id === 'tromba';
        suona(mix, id, m + oct, { t, dur: d * CROMA * 0.95, vel: brass ? vel * 1.6 : vel * 1.2, pan, rev: 0.5, gain: id === 'pianoforte_coda' ? gain * 2.6 : gain * 1.5, attack: brass ? 0.03 : 0, release: brass ? 0.35 : 0.6 });
      }
    }
  };
  const timp = (t, m = 39, vel = 90, gain = 0.6) => suona(mix, 'timpani', m, { t, dur: 2.5, vel, gain, rev: 0.5, release: 1.0, seed: Math.round(t * 10) });
  const bell = (t, m, vel = 44, pan = -0.2) => suona(mix, 'glockenspiel', m, { t, dur: 2, vel: vel * 1.3, pan, rev: 0.65, gain: 0.4, release: 1.3 });
  const brass = (t, dur, notes, { vel = 54, gain = 0.32 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 52 ? 'trombone' : 'corno', m, { t, dur, vel: vel * 1.5, pan: -0.3 + j * 0.25, gain, attack: 0.03, release: 0.9, rev: 0.5, seed: j + 11 }));
  const snare = (t, gain = 0.4) => colpo(mix, 'rullante', 'v5', { t, vel: 100, gain, pan: 0.1, rev: 0.3, seed: Math.round(t * 100) });
  const crash = (t, gain = 0.35) => colpo(mix, 'piatto_crash', 'mf', { t, vel: 100, gain, rev: 0.4, seed: Math.round(t * 10) });
  const kick = (t, gain = 0.6) => colpo(mix, 'grancassa', 'bdrum_f', { t, vel: 100, gain, rev: 0.4, seed: Math.round(t * 10) });
  const roll = (t, d = 1.6, gain = 0.18) => colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_roll2_cresc', { t: t - d, vel: 52, rev: 0.45, gain, dur: d, release: 0.4 });
  const trem = (t, dur, notes, { vel = 44, gain = 0.3 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 60 ? 'celli_trem' : 'violini_trem', m, { t, dur, vel: Math.max(vel, 70), pan: (j - (notes.length - 1) / 2) * 0.35, gain, attack: 0.4, release: 0.9, rev: 0.55, seed: j + 3 }));
  /** Il «braam» del cartello: ottoni bassi, contrabbasso, timpano e grancassa, con la frusciata prima. */
  const braam = (t, root = 39, k = 1) => {
    clip(mix, 'passaggio', { t: t - 0.6, da: 0.56, durata: 1.0, gain: 0.26, fadeOut: 0.2, rev: 0.35 });
    brass(t, 1.9, [root, root + 7, root + 12], { vel: 60 + 6 * k, gain: 0.36 + 0.04 * k });
    suona(mix, 'contrabbasso', root - 12 < 28 ? root : root - 12, { t, dur: 1.9, vel: 80, gain: 0.9, attack: 0.02, release: 0.8, rev: 0.5 });
    timp(t, root, 110, 0.7);
    kick(t, 0.5 + 0.08 * k);
    clip(mix, 'rombo', { t, da: 31, durata: 2.2, gain: 0.12 + 0.03 * k, fadeIn: 0.02, fadeOut: 1.2, largo: 3 });
  };

  // ---------------------------------------------------------------- miniatura: il fulmine, poi il taglio al nero
  clip(mix, 'tuono_secco', { t: 0, da: 0.7, durata: 1.6, gain: 0.3, fadeOut: 0.6, rev: 0.3 });
  clip(mix, 'scariche', { t: 0.02, da: 0.4, durata: 0.8, gain: 0.16, fadeOut: 0.3, rev: 0.2 });
  trem(0.05, E.nero - 0.05, [39, 58, 63], { vel: 40, gain: 0.2 });
  clip(mix, 'tuono_forte', { t: E.nero, da: 0.55, durata: 1.4, gain: 0.32, fadeOut: 0.5, rev: 0.3 });
  timp(E.nero, 39, 95, 0.5);

  // ---------------------------------------------------------------- cold open: bordone e il tic-tac dell'orologio
  suona(mix, 'contrabbasso', 39, { t: E.nero + BEAT, dur: E.b1 - E.nero - BEAT, vel: 50, gain: 0.55, attack: 1.5, release: 0.5, rev: 0.6 });
  suona(mix, 'celli', 46, { t: E.torre, dur: E.b1 - E.torre, vel: 44, gain: 0.45, attack: 1.5, release: 0.5, rev: 0.6 });
  for (let t = E.nero + BEAT, i = 0; t < E.b1 - CROMA; t += CROMA, i++) bell(t, i % 2 ? 77 : 82, 22 + i * 0.6, i % 2 ? 0.25 : -0.25);
  // l'auto si accende: scarica, ronzio basso delle bobine
  clip(mix, 'scariche', { t: E.accende, da: 0.4, durata: 0.9, gain: 0.22, fadeOut: 0.3, rev: 0.3 });
  clip(mix, 'rombo', { t: E.accende, da: 31, durata: E.b1 - E.accende, gain: 0.1, fadeIn: 0.1, fadeOut: 0.3, largo: 2 });
  timp(E.accende, 39, 80, 0.4);
  roll(E.b1, 1.6, 0.18);

  // ---------------------------------------------------------------- 1955: primo braam, il motore si avvia
  braam(E.b1, 39, 1);
  strings(E.foto, E.b2, { vel: 38, gain: 0.28 });
  spic(E.foto, E.b2, { vel: 24 });
  motif(E.foto, E.b2 - BEAT, { vel: 36, gain: 0.36 });
  // la foto sbiadisce: campanelle che scendono e si spengono
  [82, 79, 77, 74, 70].forEach((m, k) => bell(E.sparisce + k * CROMA / 2, m, 34 - k * 4, 0.3 - k * 0.12));
  roll(E.b2, 1.6, 0.2);

  // ---------------------------------------------------------------- 2015: secondo braam, più pieno; il casinò in minore
  braam(E.b2, 36, 2);
  strings(E.alm, E.casino, { vel: 42, gain: 0.32, high: true });
  spic(E.alm, E.casino, { vel: 28 });
  motif(E.alm, E.casino, { id: 'corno', vel: 40, gain: 0.28 });
  bell(E.alm, 87, 36, 0.3);
  kick(E.casino, 0.45);
  timp(E.casino, 36, 100, 0.55);
  clip(mix, 'monete', { t: E.casino + 0.2, da: 1.3, durata: 0.7, gain: 0.2, fadeOut: 0.2, rev: 0.25 });
  trem(E.casino, E.b3 - E.casino - 0.1, [36, 48, 55, 63], { vel: 46, gain: 0.26 });
  spic(E.casino, E.b3, { vel: 28, chords: MIN });
  roll(E.b3, 1.6, 0.22);

  // ---------------------------------------------------------------- 1885: terzo braam, il treno, passo doppio
  braam(E.b3, 34, 3);
  strings(E.lapide, E.corsa, { vel: 44, gain: 0.34, high: true });
  spic(E.lapide, E.treno, { vel: 30 });
  spic(E.treno, E.corsa, { vel: 32, doppio: true });
  // la nuvola scopre «DOC»: colpo basso e ottoni in minore
  timp(E.doc, 34, 105, 0.6);
  brass(E.doc, 1.6, [34, 41, 46], { vel: 56, gain: 0.3 });
  clip(mix, 'treno_vapore', { t: E.treno - 0.3, da: 5.4, durata: E.buio - E.treno + 0.3, gain: 0.1, fadeIn: 0.3, fadeOut: 0.2, rev: 0.2 });
  clip(mix, 'fischio_vapore', { t: E.treno, da: 0, durata: 1.1, gain: 0.16, fadeOut: 0.4, rev: 0.35 });
  for (let t = E.treno; t < E.corsa - 0.1; t += BEAT) snare(t + BEAT / 2, 0.2);

  // ---------------------------------------------------------------- montaggio: un colpo per inquadratura, crescendo, poi il taglio
  crash(E.corsa, 0.35);
  spic(E.corsa, E.buio, { vel: 38, doppio: true });
  motif(E.corsa, E.buio, { id: 'tromba', vel: 50, gain: 0.3 });
  trem(E.corsa, E.buio - E.corsa, [39, 51, 58, 63, 70], { vel: 50, gain: 0.3 });
  for (let k = 0; k < 4; k++) { kick(E.corsa + k * BEAT, 0.5); timp(E.corsa + k * BEAT, [39, 41, 43, 44][k], 100, 0.5); }
  for (let t = E.corsa; t < E.buio - 0.05; t += CROMA / 2) snare(t, 0.12 + 0.2 * ((t - E.corsa) / (E.buio - E.corsa)));
  clip(mix, 'scariche', { t: E.corsa, da: 0.4, durata: 0.6, gain: 0.14, fadeOut: 0.2, rev: 0.2 });
  // E.buio → S.titolo: silenzio sul nero. Poi il tachimetro: il motore che sale e un crescendo di archi in tremolo
  // fino al colpo del titolo, con le spie che ticchettano sempre più fitte.
  clip(mix, 'rombo', { t: S.titolo, da: 31, durata: E.hit - S.titolo, gain: 0.16, fadeIn: 1.8, fadeOut: 0.02, largo: 3 });
  [39, 46, 51, 58, 63].forEach((m, j) => suona(mix, m < 60 ? 'celli_trem' : 'violini_trem', m, { t: S.titolo, dur: E.hit - S.titolo, vel: 80, pan: (j - 2) * 0.3, gain: 0.32, attack: E.hit - S.titolo - 0.1, release: 0.05, rev: 0.5, seed: 40 + j }));
  for (let t = S.titolo, k = 0; t < E.hit - 0.05; k++) { bell(t, k % 2 ? 87 : 82, 18 + k * 1.2, k % 2 ? 0.3 : -0.3); t += Math.max(CROMA / 4, CROMA * (1 - (t - S.titolo) / (E.hit - S.titolo))); }
  roll(E.hit, 1.6, 0.24);

  // ---------------------------------------------------------------- il titolo: colpo forte e fulmine
  clip(mix, 'tuono_forte', { t: E.hit, da: 0.55, durata: 2.2, gain: 0.42, fadeOut: 0.8, rev: 0.3 });
  clip(mix, 'scariche', { t: E.hit, da: 0.4, durata: 0.8, gain: 0.2, fadeOut: 0.3, rev: 0.2 });
  crash(E.hit, 0.5);
  kick(E.hit, 0.75);
  timp(E.hit, 39, 120, 0.8);
  brass(E.hit, E.fine - E.hit + 0.3, [39, 46, 51, 58, 63, 67], { vel: 66, gain: 0.34 });
  [27 + 12, 39 + 12].forEach((m) => suona(mix, 'contrabbasso', m, { t: E.hit, dur: E.fine - E.hit, vel: 80, gain: 0.8, attack: 0.02, release: 1.0, rev: 0.5 }));
  suona(mix, 'tromba', 70, { t: E.hit + BEAT, dur: E.fine - E.hit - BEAT, vel: 90, gain: 0.3, attack: 0.05, release: 0.9, rev: 0.5 });

  // ---------------------------------------------------------------- chiusura: il motivo in maggiore, pulsanti, accordo finale
  const AF = E.fine + Math.floor((E.comm - E.fine) / BAR) * BAR;
  strings(E.fine, AF, { vel: 34, gain: 0.26 });
  motif(E.fine + BEAT, AF, { vel: 34, gain: 0.34 });
  [75, 79, 82].forEach((m, k) => bell(E.fine + 0.4 + k * CROMA, m + 12, 28, 0.2)); // lo schermo si accende
  [0, 1, 2].forEach((k) => clip(mix, 'scatti', { t: E.fine + 1.4 + k * CROMA / 2, da: 6.49, durata: 0.08, gain: 0.05, rev: 0.1 })); // «In 2 Minuti» scritto
  bell(E.like, 82, 32, -0.3);
  bell(E.iscr, 84, 30, 0.3); // compare «Iscriviti al canale»
  clip(mix, 'scatti', { t: E.press - 0.05, da: 6.49, durata: 0.1, gain: 0.2, rev: 0.15 }); // il clic su «iscriviti»
  [87, 91, 87, 91, 87].forEach((m, k) => bell(E.press + k * CROMA / 5, m, 32 - k * 3, 0.25)); // la campanella
  bell(E.comm, 79, 30, -0.2);
  [39, 51, 58, 63, 67].forEach((m, j) => archi(mix, m, { t: AF, dur: T.END - AF, vel: 40, pan: (j - 2) * 0.25, rev: 0.55, gain: 0.5, attack: 0.6, release: 1.4, seed: 90 + j }));
  brass(AF, T.END - AF, [51, 58, 63], { vel: 40, gain: 0.2 });
};
