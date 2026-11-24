// Pezzi comuni della musica dei trailer verticali (TRAILER.md), raccolti dai trailer di Ritorno al futuro, Donnie Darko
// e Backrooms (proposta dei revisori musica e immagini, approvata dall'editore il 23 nov 2026). Gli spartiti già fatti
// restano come sono; i trailer nuovi partono da qui invece di copiare le funzioni.
//
//   import { trailer } from './trailer-comune.mjs';
//   export default (mix, T) => {
//     const M = trailer(mix, { bpm: 75, accordi: CH });
//     M.cartelli([T.livello, T.negozio, T.copie], [42, 38, 35]);   // «braam» in salita misurabile, uno per cartello
//     M.frusciate([T.inizio + 2, ...]);                              // entrate dal nero dopo ogni cartello
//     M.archi(da, a, { vel: 40 });                                   // accordi contati dall'inizio della sezione
//     M.buio(hit, { da: hit - 5 });                                  // nel buio: spia a ogni battito, crescendo, colpo
//     M.titolo(hit, 30);                                             // colpo forte sul titolo, ottoni pieni
//   };
//
// Effetti usati (da mettere in `effetti` dello spartito): EFFETTI_TRAILER. Strumenti: STRUMENTI_TRAILER.
// compensa(mix) è già chiamata: i campioni brevi anomali sono abbassati (campioni.mjs).
import { archi as archiCampioni, colpo, compensa, suona } from './campioni.mjs';
import { clip } from './effetti.mjs';

export const STRUMENTI_TRAILER = ['contrabbasso', 'violini', 'viole', 'celli', 'celli_spicc', 'viole_spicc', 'violini_trem', 'celli_trem',
  'corno', 'trombone', 'timpani', 'grancassa', 'rullante', 'piatto_crash', 'piatto_sospeso', 'glockenspiel'];
export const EFFETTI_TRAILER = ['passaggio', 'rombo', 'scatti'];

/**
 * bpm: il tempo unico del trailer; accordi: [[radice MIDI, [intervalli]]…] (4 accordi, uno per battuta).
 * Restituisce le funzioni della famiglia sonora dei trailer, tutte già a tempo.
 */
export const trailer = (mix, { bpm, accordi }) => {
  compensa(mix);
  const BEAT = 60 / bpm;
  const BAR = 4 * BEAT;
  const CROMA = BEAT / 2;
  const griglia = (t) => Math.round(t / CROMA) * CROMA;
  // accordi contati dall'inizio della sezione (revisore musica, trailer di Ritorno al futuro): ogni sezione parte dal suo primo accordo
  const kk = (t, from = 0) => ((Math.floor((t - from) / BAR + 1e-6) % 4) + 4) % 4;

  const archi = (from, to, { vel = 40, gain = 1, chords = accordi } = {}) => {
    for (let t = from; t < to - 0.3; t += BAR) {
      const [root, iv] = chords[kk(t, from) % chords.length];
      const d = Math.min(BAR + 0.05, to - t);
      iv.slice(1).forEach((v, j) => archiCampioni(mix, root + 12 + v, { t: t + j * 0.03, dur: d, vel: vel + 8, pan: (j - 1) * 0.35, rev: 0.55, gain: gain * 1.3, attack: 0.6, release: 1.0, seed: j }));
      suona(mix, 'contrabbasso', root, { t, dur: d, vel: vel + 12, gain: gain * 1.4, attack: 0.5, release: 1.0, rev: 0.5 });
    }
  };
  const spiccato = (from, to, { vel = 36, doppio = false, chords = accordi } = {}) => {
    const step = doppio ? CROMA / 2 : CROMA;
    for (let t = from, i = 0; t < to - 0.05; t += step, i++) {
      const [root, iv] = chords[kk(t, from) % chords.length];
      const n = [root, root + iv[1], root + 12, root + iv[1]][i % 4] + 12;
      suona(mix, n < 55 ? 'celli_spicc' : 'viole_spicc', n, { t, dur: step * 0.9, vel: vel * 1.7 * (i % 2 ? 0.75 : 1), pan: i % 2 ? 0.25 : -0.25, rev: 0.35, gain: 2.4, release: 0.12 });
    }
  };
  const timp = (t, vel = 110, gain = 0.8, forte = true) => colpo(mix, 'timpani', forte ? 'Timpani1_Hit_v4_rr1_Sum' : 'Timpani1_Hit_v2_rr1_Sum', { t, vel, gain, rev: 0.45 });
  const ottoni = (t, dur, notes, { vel = 56, gain = 0.34 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 52 ? 'trombone' : 'corno', m, { t, dur, vel: vel * 1.5, pan: -0.3 + j * 0.25, gain, attack: 0.03, release: 0.9, rev: 0.5, seed: j + 11 }));
  const cassa = (t, gain = 0.6) => colpo(mix, 'grancassa', 'bdrum_f', { t, vel: 100, gain, rev: 0.4, seed: Math.round(t * 10) });
  const rullante = (t, gain = 0.35) => colpo(mix, 'rullante', 'v5', { t, vel: 100, gain, pan: 0.1, rev: 0.3, seed: Math.round(t * 100) });
  const piatto = (t, gain = 0.38) => colpo(mix, 'piatto_crash', 'mf', { t, vel: 100, gain, rev: 0.4, seed: Math.round(t * 10) });
  const campanella = (t, m, vel = 40) => suona(mix, 'glockenspiel', m, { t, dur: 2.2, vel: vel * 1.3, pan: 0.25, rev: 0.7, gain: 0.3, release: 1.4 });

  /** Colpo del cartello: frusciata che entra, ottoni bassi, contrabbasso, timpano, cassa e rombo. k = 1, 2, 3…: +1,5 dB ogni passo. */
  const braam = (t, root = 40, k = 1) => {
    const f = 10 ** ((1.5 * (k - 1)) / 20); // +1,5 dB a cartello su tutto il colpo
    clip(mix, 'passaggio', { t: t - 0.6, da: 0.56, durata: 1.0, gain: 0.26 * f, fadeOut: 0.2, rev: 0.35 });
    ottoni(t, 1.9, [root - 12, root - 5, root], { vel: 70, gain: 0.56 * f });
    suona(mix, 'contrabbasso', root - 12 < 28 ? root : root - 12, { t, dur: 1.9, vel: 80, gain: 0.9 * f, attack: 0.02, release: 0.8, rev: 0.5 });
    timp(t, 120, 0.8 * f);
    cassa(t, 0.58 * f);
    clip(mix, 'rombo', { t, da: 3.6, durata: 2.2, gain: 0.15 * f, fadeIn: 0.02, fadeOut: 1.2, largo: 2 });
  };
  /**
   * Un braam per cartello, in salita misurabile: ogni cartello circa 1,5 dB sopra il precedente (k cresce), così il
   * revisore lo vede in livelli.mjs e non solo a orecchio. radici: una nota per cartello (di solito scendono).
   */
  const cartelli = (istanti, radici) => istanti.forEach((t, i) => braam(t, radici[i % radici.length], i + 1));
  /** Frusciata d'entrata dal nero dopo un cartello (TRAILER.md, «Cartelli»): 0,35 s prima che la scena entri. */
  const frusciate = (entrate) => entrate.forEach((c) => clip(mix, 'passaggio', { t: c - 0.35, da: 0.56, durata: 0.8, gain: 0.14, fadeOut: 0.3, rev: 0.35 }));
  /** Montaggio a un battito: cassa e timpano a ogni battito, rullante a sedicesimi che cresce. */
  const corsa = (da, a) => {
    for (let t = da; t < a - 0.05; t += BEAT) { cassa(t, 0.5); timp(t, 100, 0.4, false); }
    for (let t = da; t < a - 0.05; t += BEAT / 4) rullante(t, 0.10 + 0.18 * ((t - da) / (a - da)));
  };
  /**
   * Nel buio prima del titolo: la spia a ogni battito (scatto secco + battito basso), poi nell'ultimo 1,5 s il crescendo
   * (piatto strisciato, tremolo degli archi, rombo) che sale fino al colpo. Prima del crescendo nient'altro suona: è il
   * vuoto che prepara il colpo («niente vuoto prima» in livelli.mjs).
   */
  const buio = (hit, { da = hit - 4 * BEAT, note = [40, 47, 52, 59, 64] } = {}) => {
    for (let t = da; t < hit - 0.1; t += BEAT) {
      clip(mix, 'scatti', { t, da: 6.49, durata: 0.06, gain: t >= hit - 1.6 ? 0.25 : 0.4, rev: 0.1 });
      cassa(t + 0.02, 0.25);
    }
    colpo(mix, 'piatto_sospeso', 'susp_FX_scrape_continuous', { t: hit - 1.5, dur: 1.5, vel: 90, gain: 0.4, release: 0.2, rev: 0.4, da: 2 });
    note.forEach((m, j) => suona(mix, m < 55 ? 'celli_trem' : 'violini_trem', m, { t: hit - 1.5, dur: 1.5, vel: 80, gain: 0.3, attack: 1.5, release: 0.05, rev: 0.4, pan: (j - 2) * 0.2 }));
    clip(mix, 'rombo', { t: hit - 1.4, da: 3.6, durata: 1.4, gain: 0.14, fadeIn: 1.4, fadeOut: 0.02, largo: 1.8 });
  };
  /** Colpo forte sul titolo: piatto, timpano pieno, cassa, ottoni sull'accordo della radice e rombo lungo. */
  const titolo = (hit, root = 40, { durata = 3.5 } = {}) => {
    piatto(hit, 0.45);
    timp(hit, 127, 1.1);
    cassa(hit, 0.8);
    ottoni(hit, durata, [root, root + 7, root + 12, root + 19, root + 24], { vel: 70, gain: 0.42 });
    clip(mix, 'rombo', { t: hit, da: 3.6, durata: 3, gain: 0.18, fadeOut: 1.5, largo: 2 });
  };

  return { BEAT, BAR, CROMA, griglia, archi, spiccato, timp, ottoni, cassa, rullante, piatto, campanella, braam, cartelli, frusciate, corsa, buio, titolo };
};
