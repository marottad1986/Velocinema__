// Colonna sonora del trailer verticale di «Backrooms spiegato» (promo/trailer-backrooms.json, TRAILER.md).
// Stessa famiglia sonora del lungo (pianoforte, organo d'attesa, marimba lontana, archi gravi, campanelle; più ottoni
// bassi, timpani e grancassa per i cartelli, come i trailer di Ritorno al futuro e Donnie Darko). 75 bpm, Fa# minore,
// motivo inventato (Do#, Re, Do#, La · Si, La, Fa#, Mi#): niente brani o temi del film.
// Forma: miniatura con il ronzio dei neon che si spengono → cold open quasi in silenzio (ronzio, motivo al pianoforte)
// → tre «braam» di ottoni bassi, uno per cartello, con gli archi sempre più pieni → montaggio a passo doppio con rullante
// e crescendo → taglio netto: nel buio un neon che sfarfalla (scatto secco + battito basso) sotto la battuta → colpo
// forte sul titolo (piatto, timpani, ottoni pieni, rombo) → chiusura in La maggiore con i pulsanti.
// Istanti uguali a eventi() di src/promo/trailer-backrooms/Scena.tsx.
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';

export const strumenti = ['pianoforte_coda', 'organo', 'marimba', 'arpa', 'glockenspiel', 'violini', 'viole', 'celli', 'contrabbasso', 'celli_spicc', 'viole_spicc', 'violini_trem', 'celli_trem',
  'corno', 'trombone', 'timpani', 'grancassa', 'rullante', 'piatto_crash', 'piatto_sospeso'];
export const effetti = ['passaggio', 'rombo', 'scatti', 'ronzio_neon', 'colpi_legno', 'ronzio_tesla'];
export const sala = { rt60: 2.6, brillo: 5000, predelay: 0.03, wet: 0.48 };

const BPM = 75;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const CROMA = BEAT / 2;
const g = (t) => Math.round(t / CROMA) * CROMA;
const CH = [[42, [0, 7, 12, 15]], [38, [0, 7, 12, 16]], [35, [0, 7, 12, 15]], [37, [0, 4, 10, 16]]];
const MAJ = [[45, [0, 7, 12, 16]], [38, [0, 7, 12, 16]], [42, [0, 7, 12, 15]], [40, [0, 7, 11, 16]]];
const MOTIF = [[0, 73], [1, 74], [2, 73], [3, 69], [4, 71], [5, 69], [6, 66], [7, 65]];

export default (mix, T) => {
  const S = T;
  const E = {
    spegni: 3.2, nero: S.inizio, foto: S.inizio + 5 * CROMA,
    b1: S.livello, b2: S.negozio, b3: S.copie, corsa: S.corsa, buio: S.corsa + 5 * BEAT, hit: S.titolo + 3 * BEAT, fine: S.chiusura,
    like: g(T.frase('chiusura', 0) + 1.6), iscr: g(T.frase('chiusura', 0) + 2.4), press: g(T.frase('chiusura', 0) + 5.2), comm: g(T.frase('chiusura', 1)),
  };
  // accordi contati dall'inizio della sezione (revisore musica): ogni sezione parte dal suo primo accordo
  const kk = (t, from = 0) => ((Math.floor((t - from) / BAR + 1e-6) % 4) + 4) % 4;
  const strings = (from, to, { vel = 40, gain = 1, chords = CH } = {}) => {
    for (let t = from; t < to - 0.3; t += BAR) {
      const [root, iv] = chords[kk(t, from) % chords.length];
      const d = Math.min(BAR + 0.05, to - t);
      iv.slice(1).forEach((v, j) => archi(mix, root + 12 + v, { t: t + j * 0.03, dur: d, vel: vel + 8, pan: (j - 1) * 0.35, rev: 0.55, gain: gain * 1.3, attack: 0.6, release: 1.0, seed: j }));
      suona(mix, 'contrabbasso', root, { t, dur: d, vel: vel + 12, gain: gain * 1.4, attack: 0.5, release: 1.0, rev: 0.5 });
    }
  };
  const spic = (from, to, { vel = 36, doppio = false } = {}) => {
    const step = doppio ? CROMA / 2 : CROMA;
    for (let t = from, i = 0; t < to - 0.05; t += step, i++) {
      const [root, iv] = CH[kk(t, from)];
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
    brass(t, 1.9, [root - 12, root - 5, root], { vel: 64 + 6 * k, gain: 0.5 + 0.06 * k });
    suona(mix, 'contrabbasso', root - 12 < 28 ? root : root - 12, { t, dur: 1.9, vel: 80, gain: 0.9, attack: 0.02, release: 0.8, rev: 0.5 });
    timp(t, 120, 0.8);
    kick(t, 0.5 + 0.08 * k);
    clip(mix, 'rombo', { t, da: 3.6, durata: 2.2, gain: 0.12 + 0.03 * k, fadeIn: 0.02, fadeOut: 1.2, largo: 2 });
  };
  const tic = (from, to) => { for (let t = Math.ceil(from); t < to - 0.1; t += BEAT) clip(mix, 'scatti', { t, da: 6.49, durata: 0.06, gain: 0.28, rev: 0.15, pan: 0.4 }); };

  // ---- miniatura: il ronzio dei neon, poi si spengono dal fondo verso di noi (scatti) e resta il nero
  clip(mix, 'ronzio_neon', { t: 0, da: 3, durata: E.spegni + 0.6, gain: 0.12, fadeIn: 0.05, fadeOut: 0.2 });
  [73, 78, 81].forEach((m, k) => bell(0.4 + k * BEAT, m + 12, 36));
  for (let i = 0; i < 10; i++) clip(mix, 'scatti', { t: E.spegni + i * 0.04, da: 6.49, durata: 0.05, gain: 0.3 + i * 0.04, rev: 0.25 });
  timp(g(E.spegni + 0.4), 100, 0.55, false);
  // il cartello «12 MAGGIO 2019» entra con lo sfarfallio del neon
  clip(mix, 'scatti', { t: E.nero + 0.25, da: 6.49, durata: 0.05, gain: 0.3, rev: 0.2 });
  clip(mix, 'ronzio_neon', { t: E.nero + 0.25, da: 5, durata: E.foto - E.nero - 0.25, gain: 0.05, fadeIn: 0.1, fadeOut: 0.3 });
  // ---- cold open: bordone, il ronzio, il motivo al pianoforte spoglio (la foto)
  suona(mix, 'contrabbasso', 30, { t: E.nero, dur: E.b1 - E.nero, vel: 46, gain: 1.2, attack: 0.6, release: 1.4, rev: 0.6 });
  MOTIF.forEach(([b, m]) => suona(mix, 'pianoforte_coda', m, { t: E.foto + b * CROMA, dur: 1.4, vel: 24 * 1.2, pan: 0.15, rev: 0.6, gain: 0.7, release: 0.8 }));
  [61, 66, 69].forEach((m, j) => suona(mix, 'organo', m, { t: E.foto, dur: E.b1 - E.foto - 0.3, vel: 30, gain: 0.45, attack: 0.8, release: 1, rev: 0.7, pan: (j - 1) * 0.3 }));
  clip(mix, 'ronzio_neon', { t: E.foto, da: 10, durata: E.b1 - E.foto, gain: 0.06, fadeIn: 0.6, fadeOut: 0.6, largo: 1.2 });
  // ---- frusciata a ogni entrata dal nero dopo un cartello (TRAILER.md, «Cartelli»)
  for (const c of [E.foto, E.b1 + 5 * CROMA, E.b2 + 5 * CROMA, E.b3 + 5 * CROMA]) clip(mix, 'passaggio', { t: c - 0.35, da: 0.56, durata: 0.8, gain: 0.14, fadeOut: 0.3, rev: 0.35 });
  // ---- tre cartelli, sempre più pieni
  const C2 = 5 * CROMA;
  braam(E.b1, 42, 1);
  strings(E.b1 + C2, E.b2 - 0.2, { vel: 36, gain: 0.8 });
  clip(mix, 'ronzio_neon', { t: E.b1 + C2, da: 20, durata: E.b2 - E.b1 - C2, gain: 0.08, fadeIn: 0.3, fadeOut: 0.5, largo: 1.2 });
  for (let i = 0; i < 6; i++) suona(mix, 'marimba', [78, 81, 85, 81, 78, 73][i], { t: E.b1 + C2 + 0.4 + i * CROMA, dur: 1, vel: 40, pan: 0.35, rev: 0.8, gain: 0.6, release: 0.5 });
  braam(E.b2, 38, 2);
  strings(E.b2 + C2, E.b3 - 0.2, { vel: 36, gain: 0.9 });
  spic(E.b2 + C2, E.b3 - 0.2, { vel: 30 });
  bell(E.b2 + C2 + 0.4, 85, 36);
  braam(E.b3, 35, 3);
  strings(E.b3 + C2, E.corsa, { vel: 44, gain: 1 });
  spic(E.b3 + C2, E.corsa, { vel: 36, doppio: true });
  [61, 66, 69].forEach((m, k) => bell(E.b3 + C2 + 0.4 + k * 0.4, m + 24, 30));
  // ---- montaggio a un battito: rullante, crescendo, colpo per ogni taglio
  strings(E.corsa, E.buio, { vel: 52, gain: 1.1 });
  spic(E.corsa, E.buio, { vel: 44, doppio: true });
  for (let i = 0; i < 5; i++) { kick(E.corsa + i * BEAT, 0.5); timp(E.corsa + i * BEAT, 100, 0.4, false); }
  clip(mix, 'colpi_legno', { t: E.corsa + BEAT, da: 0.2, durata: 0.4, gain: 0.3, rev: 0.4 });
  clip(mix, 'ronzio_tesla', { t: E.corsa + 2 * BEAT, da: 1, durata: 0.8, gain: 0.15, fadeOut: 0.3 });
  for (let t = E.corsa; t < E.buio - 0.05; t += BEAT / 4) snare(t, 0.10 + 0.18 * ((t - E.corsa) / (E.buio - E.corsa)));
  // ---- nel buio: silenzio, il contatore che pulsa (ticchettio secco e battito basso) sotto la battuta
  // la spia nel buio: il neon sfarfalla a ogni battito fino al colpo (TRAILER.md §5), più piano sotto il crescendo
  for (let t = E.buio; t < E.hit - 0.1; t += BEAT) {
    clip(mix, 'scatti', { t, da: 6.49, durata: 0.06, gain: t >= E.hit - 1.6 ? 0.25 : 0.4, rev: 0.1 });
    clip(mix, 'ronzio_neon', { t, da: 5, durata: 0.35, gain: 0.12, fadeOut: 0.1 });
    kick(t + 0.02, 0.25);
  }
  // i neon che si riaccendono uno alla volta verso il fondo
  for (let i = 0; i < 12; i++) clip(mix, 'scatti', { t: E.hit - 1.6 + i * 0.1, da: 6.49, durata: 0.05, gain: 0.25, rev: 0.3 });
  colpo(mix, 'piatto_sospeso', 'susp_FX_scrape_continuous', { t: E.hit - 1.5, dur: 1.5, vel: 90, gain: 0.4, release: 0.2, rev: 0.4, da: 2 });
  // crescendo mentre l'immagine emerge dal buio: tremolo degli archi e rombo che salgono fino al colpo
  [42, 49, 54, 61, 66].forEach((m, j) => suona(mix, m < 55 ? 'celli_trem' : 'violini_trem', m, { t: E.hit - 1.5, dur: 1.5, vel: 80, gain: 0.3, attack: 1.5, release: 0.05, rev: 0.4, pan: (j - 2) * 0.2 }));
  clip(mix, 'rombo', { t: E.hit - 1.4, da: 3.6, durata: 1.4, gain: 0.14, fadeIn: 1.4, fadeOut: 0.02, largo: 1.8 });
  // ---- il titolo: colpo forte e ottoni pieni
  crash(E.hit, 0.45);
  timp(E.hit, 127, 1.1);
  kick(E.hit, 0.8);
  brass(E.hit, 3.5, [30, 37, 42, 49, 54], { vel: 70, gain: 0.42 });
  clip(mix, 'rombo', { t: E.hit, da: 3.6, durata: 3, gain: 0.18, fadeOut: 1.5, largo: 2 });
  strings(E.hit + 0.5, E.fine, { vel: 46, gain: 1, chords: [CH[0]] });
  // ---- chiusura in La maggiore
  const AF = E.fine + Math.floor((T.END - 3 - E.fine) / BAR) * BAR;
  strings(E.fine, AF, { vel: 38, gain: 0.9, chords: MAJ });
  strings(AF, T.END, { vel: 36, gain: 0.85, chords: [MAJ[0]] }); // si chiude su La maggiore
  for (let t = E.fine, i = 0; t < T.END - 1; t += BEAT, i++) suona(mix, 'arpa', [69, 73, 76, 81][i % 4] + 12, { t, dur: 2.5, vel: 46, pan: -0.2, rev: 0.6, gain: 0.9, release: 1.2 });
  bell(E.like, 83, 38); bell(E.iscr, 88, 40); bell(E.comm, 88, 36);
  clip(mix, 'scatti', { t: E.press - 0.05, da: 6.49, durata: 0.06, gain: 0.45, rev: 0.1 });
  [91, 87, 91, 87].forEach((m, k) => bell(E.press + k * (CROMA / 5), m, 40));
};
