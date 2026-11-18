// Colonna sonora delle parti NUOVE del video lungo «Ritorno al futuro, la trilogia» (VIDEO-LUNGO.md): aggancio,
// «I paradossi spiegati» e chiusura. Le tre Parti riusano la loro musica (out/ritorno-al-futuro*-musica.wav), posata da
// scripts/lunghi/render.mjs sulla stessa griglia (72 bpm, 10 s = 12 battiti): qui si scrive solo nei tratti nuovi.
// Stessa famiglia sonora delle tre Parti (orchestra campionata VSCO-2 CE e VCSL, CC0): archi in spiccato come un motore,
// pianoforte, corni e tromba, timpani, glockenspiel per il tic-tac; stesso motivo inventato del tic-tac in Mi bemolle
// maggiore (Si bemolle e Fa che si alternano, poi la salita). Niente brani o temi del film.
// Aggancio: il tic-tac sotto il temporale, i tre fulmini, una nota per ogni epoca che si accende, i tre richiami (minore per
// la foto, campana per l'almanacco, timpano per la lapide), la corsa a passo doppio verso il 1985 che si apre sul cartello.
// Paradossi: l'onda del tempo negli archi (tremolo che sale), lo scambio come un colpo di ferro seguito da un battito di
// silenzio, il binario rosso in minore con i tromboni, il ritorno a passo doppio, il timpano forte sul fuoco
// dell'almanacco e il maggiore pieno quando il binario torna dritto; lo swing leggero del 1955 per i due Marty, i pizzicati
// che si fermano quando Jennifer sviene; la lettera strappata, lo sparo fermato dal giubbotto (poi pausa); il ventaglio dei
// futuri con la fanfara in maggiore sull'ultima frase. Chiusura: il motivo in maggiore che resta aperto.
// T: inizio di ogni tratto (s nel video lungo) e T.frase(id, n) = inizio della frase n del tratto (come Overlay16); gli
// eventi cadono sulla croma, gli stessi istanti delle scene in src/lunghi/ritorno-al-futuro-trilogia/.
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';

export const strumenti = ['pianoforte_coda', 'violini', 'viole', 'celli', 'contrabbasso', 'celli_spicc', 'viole_spicc', 'violini_trem', 'celli_trem',
  'contrabbasso_pizz', 'glockenspiel', 'corno', 'tromba', 'trombone', 'timpani', 'grancassa', 'rullante', 'charleston', 'piatto_crash', 'piatto_sospeso'];
export const effetti = ['tuono_forte', 'tuono_secco', 'scariche', 'passaggio', 'pagine', 'giornale', 'sparo', 'metallo_colpi', 'fiammata', 'fuoco', 'telo'];
/** Sala media, luminosa, come le tre Parti. */
export const sala = { rt60: 2.0, brillo: 6000, predelay: 0.02, wet: 0.42 };

const BPM = 72;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const CROMA = BEAT / 2;
const croma = (t) => Math.round(t / CROMA) * CROMA;
const bar = (t) => Math.round(t / BAR) * BAR;

// Mi bemolle · Do minore · La bemolle · Si bemolle; minore (il binario rosso): Do minore · La bemolle · Fa minore · Sol
const CH = [[39, [0, 4, 7]], [36, [0, 3, 7]], [44, [0, 4, 7]], [46, [0, 4, 7]]];
const MIN = [[36, [0, 3, 7]], [44, [0, 4, 7]], [41, [0, 3, 7]], [43, [0, 4, 7]]];
const SW = [[39, [0, 4, 7, 9]], [36, [0, 4, 7, 10]], [41, [0, 3, 7, 10]], [46, [0, 4, 7, 10]]];
const MOTIF = [[0, 70, 1], [1, 65, 1], [2, 70, 1], [3, 65, 1], [4, 72, 1], [5, 74, 1], [6, 75, 2], [8, 74, 1], [9, 72, 1], [10, 70, 2], [12, 67, 2], [14, 70, 2]];

export default (mix, T) => {
  const at = (id, n, d = 0) => croma(T.frase(id, n) + d);
  const kk = (t) => ((Math.floor(t / BAR + 1e-6) % 4) + 4) % 4;
  const ORDINE = ['regola', 'binario', 'riparare', 'doppioni', 'lettera', 'scritto', 'chiusura'];
  /** Fine di un capitolo dei paradossi = inizio del tratto dopo. */
  const fine = (id) => T[ORDINE[ORDINE.indexOf(id) + 1]];

  // ---------------------------------------------------------------- strumenti (come negli spartiti delle tre Parti)
  const strings = (from, to, { vel = 42, gain: g0 = 0.4, chords = CH, high = false } = {}) => {
    const gain = g0 * 2.6;
    for (let t = from; t < to - 0.4; t += BAR) {
      const k = kk(t);
      const [root, iv] = chords[k];
      const d = Math.min(BAR * 1.02, to - t);
      archi(mix, root + 12, { t, dur: d, vel: vel + 6, pan: -0.3, rev: 0.55, gain: gain * 1.2, attack: 0.6, release: 1.2, seed: k });
      iv.slice(1, 3).forEach((v, j) => archi(mix, root + 24 + v, { t: t + 0.03 * j, dur: d, vel: vel + 4, pan: 0.1 + j * 0.25, rev: 0.55, gain, attack: 0.6, release: 1.2, seed: k + j + 1 }));
      suona(mix, 'contrabbasso', root, { t, dur: d, vel: vel + 8, gain: gain * 1.2, attack: 0.5, release: 1.2, rev: 0.5 });
      if (high) suona(mix, 'violini', root + 36 + iv[2], { t, dur: d, vel, pan: -0.2, gain: gain * 0.6, attack: 0.7, release: 1.4, rev: 0.6 });
    }
  };
  const spic = (from, to, { vel = 30, doppio = false, chords = CH } = {}) => {
    const step = doppio ? CROMA / 2 : CROMA;
    for (let t = from, i = 0; t < to - 0.05; t += step, i++) {
      const [root, iv] = chords[kk(t)];
      const notes = [root + 12, root + 12 + iv[1], root + 12 + iv[2], root + 24];
      const accent = i % (doppio ? 4 : 2) === 0;
      suona(mix, notes[i % 4] < 55 ? 'celli_spicc' : 'viole_spicc', notes[i % 4] + 12, { t, dur: step * 0.9, vel: vel * 1.7 * (accent ? 1 : 0.75), pan: i % 2 ? 0.25 : -0.25, rev: 0.35, gain: 1.3, release: 0.12 });
    }
  };
  const motif = (from, to, { id = 'pianoforte_coda', vel = 44, gain = 0.45, oct = 0, pan = 0.15 } = {}) => {
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
  const swing = (from, to, { vel = 40 } = {}) => {
    for (let t = from, b = 0; t < to - 0.1; t += BEAT, b++) {
      const [root, iv] = SW[kk(t)];
      const walk = [root, root + iv[1], root + iv[2], root + iv[3]][b % 4];
      suona(mix, 'contrabbasso_pizz', walk < 31 ? walk + 12 : walk, { t, dur: BEAT, vel: vel * 1.5, pan: -0.15, rev: 0.25, gain: 1.6, release: 0.2 });
      colpo(mix, 'charleston', b % 2 ? 'v3' : 'v2', { t, vel: 100, gain: 0.14, pan: 0.3, rev: 0.15, seed: b });
      if (t + BEAT * 2 / 3 < to) colpo(mix, 'charleston', 'v2', { t: t + BEAT * 2 / 3, vel: 100, gain: 0.09, pan: 0.3, rev: 0.15, seed: b + 50 });
      if (b % 2 === 1) iv.forEach((v, j) => suona(mix, 'pianoforte_coda', root + 36 + v - (v > 7 ? 12 : 0), { t: t + BEAT * 2 / 3, dur: BEAT * 0.4, vel: vel * 0.9, pan: 0.2, rev: 0.35, gain: 1.0, release: 0.2, seed: j }));
    }
  };
  const pizz = (from, to, { vel = 40 } = {}) => {
    for (let t = from, i = 0; t < to - 0.05; t += CROMA, i++) {
      const [root, iv] = CH[kk(t)];
      suona(mix, 'contrabbasso_pizz', root + 12 + [0, iv[1], iv[2], 12][i % 4], { t, dur: CROMA, vel: vel * 1.5, pan: i % 2 ? 0.2 : -0.2, rev: 0.3, gain: 1.4, release: 0.15 });
    }
  };
  const timp = (t, m = 39, vel = 90, gain = 0.6) => suona(mix, 'timpani', m, { t, dur: 2, vel, gain, rev: 0.5, release: 0.8, seed: Math.round(t * 10) });
  const bell = (t, m, vel = 44, pan = -0.2) => suona(mix, 'glockenspiel', m, { t, dur: 2, vel: vel * 1.3, pan, rev: 0.65, gain: 0.4, release: 1.3 });
  const brass = (t, dur, notes, { vel = 54, gain = 0.3 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 52 ? 'trombone' : 'corno', m, { t, dur, vel: vel * 1.5, pan: -0.3 + j * 0.25, gain, attack: 0.08, release: 0.8, rev: 0.5, seed: j + 11 }));
  const fanfare = (t, notes, { vel = 56, gain = 0.3, step = CROMA } = {}) => notes.forEach((m, j) =>
    suona(mix, 'tromba', m, { t: t + j * step, dur: j === notes.length - 1 ? BEAT * 1.5 : step * 0.9, vel: vel * 1.6, pan: 0.2, gain, attack: 0.02, release: 0.5, rev: 0.45 }));
  const trem = (t, dur, notes, { vel = 60, gain = 0.3, att = 0.4 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 60 ? 'celli_trem' : 'violini_trem', m, { t, dur, vel: Math.max(vel, 70), pan: (j - (notes.length - 1) / 2) * 0.35, gain, attack: att, release: 0.9, rev: 0.55, seed: j + 3 }));
  const snare = (t, gain = 0.45) => colpo(mix, 'rullante', 'v5', { t, vel: 100, gain, pan: 0.1, rev: 0.3, seed: Math.round(t * 100) });
  const crash = (t, gain = 0.32) => colpo(mix, 'piatto_crash', 'mf', { t, vel: 100, gain, rev: 0.4, seed: Math.round(t * 10) });
  const roll = (t, d = 1.6, gain = 0.18) => colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_roll2_cresc', { t: t - d, vel: 52, rev: 0.45, gain, dur: d, release: 0.4 });
  const tic = (from, to, vel = 30) => { for (let t = from, i = 0; t < to - 0.05; t += CROMA, i++) bell(t, i % 2 ? 77 : 82, vel, 0.25); };

  // ---------------------------------------------------------------- aggancio (0–20 s; la Parte 1 entra a 20 s con la sua copertina)
  {
    const A = T.aggancio;
    const c = (n, d = 0) => at('aggancio', n, d);
    // i tre fulmini (Aggancio.tsx: 0, croma(1,6), croma(frase 1 + 0,4))
    clip(mix, 'tuono_secco', { t: A, da: 0.7, durata: 1.6, gain: 0.3, fadeOut: 0.6, rev: 0.3 });
    clip(mix, 'scariche', { t: A + 0.02, da: 0.4, durata: 0.8, gain: 0.16, fadeOut: 0.3, rev: 0.2 });
    clip(mix, 'tuono_forte', { t: croma(A + 1.6), da: 0.55, durata: 1.4, gain: 0.24, fadeOut: 0.5, rev: 0.3 });
    clip(mix, 'tuono_secco', { t: c(1, 0.4), da: 0.7, durata: 1.3, gain: 0.22, fadeOut: 0.5, rev: 0.3 });
    // la domanda: bordone sospeso e il tic-tac dell'orologio
    [51, 58, 63].forEach((m, j) => archi(mix, m, { t: A + 0.05, dur: c(1) - A, vel: 44, pan: (j - 1) * 0.3, rev: 0.55, gain: 0.4, attack: 0.3, release: 1.0, seed: j }));
    suona(mix, 'contrabbasso', 39, { t: A + 0.05, dur: c(1) - A, vel: 50, gain: 0.5, attack: 0.1, release: 1.0, rev: 0.5 });
    tic(A + 0.4, c(1), 30);
    timp(c(1), 39, 80, 0.4);
    // le quattro epoche che si accendono sul binario, una nota ciascuna (Aggancio.tsx: croma(frase 1 + 0,9 + i·0,42))
    [70, 75, 79, 82].forEach((m, i) => bell(croma(T.frase('aggancio', 1) + 0.9 + i * 0.42), m, 46, -0.3 + i * 0.2));
    strings(c(1), c(5), { vel: 36, gain: 0.3 });
    motif(c(1), c(2), { vel: 36, gain: 0.35 });
    // la foto (minore), l'almanacco (campana e corni), la lapide (timpano e tromboni)
    trem(c(2, 0.1), c(3) - c(2), [60, 63, 67], { vel: 60, gain: 0.22 });
    bell(c(2, 0.1), 75, 40);
    bell(c(3, 0.1), 82, 50); bell(c(3, 0.1) + CROMA, 87, 44);
    brass(c(3, 0.1), 2 * BEAT, [55, 63], { vel: 44, gain: 0.22 });
    timp(c(4, 0.1), 36, 92, 0.55);
    brass(c(4, 0.1), 2 * BEAT, [36, 43], { vel: 48, gain: 0.26 });
    // la corsa verso il 1985 a passo doppio, il cartello «Hill Valley, 1985»
    spic(c(5, 0.2), c(5, 2.0), { vel: 34, doppio: true });
    roll(c(5, 2.0), 1.4, 0.16);
    clip(mix, 'passaggio', { t: c(5, 0.2), da: 0.56, durata: 1.6, gain: 0.26, fadeOut: 0.4, rev: 0.35 });
    crash(c(5, 2.0), 0.26);
    brass(c(5, 2.0), Math.min(2 * BEAT, A + 19.6 - c(5, 2.0)), [51, 58, 63], { vel: 50, gain: 0.26 });
  }

  // ---------------------------------------------------------------- i paradossi
  // 1 · regola: il motore, l'onda negli archi, la foto che sbiadisce (minore)
  strings(T.regola, bar(at('regola', 3)), { vel: 38, gain: 0.3 });
  spic(T.regola, at('regola', 3), { vel: 24 });
  motif(T.regola, at('regola', 1), { vel: 38, gain: 0.38 });
  trem(at('regola', 1, 0.1), 2.0, [63, 67, 70, 75], { vel: 64, gain: 0.24, att: 1.6 }); // l'onda che corre sul binario
  bell(at('regola', 1, 2.1), 87, 44);
  bell(at('regola', 2, 0), 82); bell(at('regola', 2, 0.9), 79, 40); // Marty salva George, Lorraine
  strings(at('regola', 3), fine('regola'), { vel: 34, gain: 0.3, chords: MIN });
  [at('regola', 3, 0.1), at('regola', 3, 0.7)].forEach((t, i) => bell(t, 75 - i * 3, 36)); // i fratelli che spariscono

  // 2 · binario: il vecchio Biff, l'almanacco che vola nel 1955, lo scambio (colpo e silenzio), il binario rosso in minore
  strings(T.binario, at('binario', 2), { vel: 36, gain: 0.28 });
  pizz(T.binario, at('binario', 2), { vel: 34 });
  clip(mix, 'passaggio', { t: at('binario', 1, 0.3) - 0.1, da: 0.56, durata: 1.6, gain: 0.28, fadeOut: 0.4, rev: 0.35 });
  [87, 84, 82, 79, 75].forEach((m, k) => bell(at('binario', 1, 0.3) + k * CROMA * 0.75, m, 40)); // giù di settant'anni
  const sw = at('binario', 2, 0.1);
  clip(mix, 'metallo_colpi', { t: sw, da: 0, durata: 0.6, gain: 0.3, fadeOut: 0.2, rev: 0.25 }); // lo scambio scatta
  timp(sw, 36, 100, 0.6);
  // un battito di silenzio, poi il binario rosso
  strings(sw + BEAT, fine('binario'), { vel: 40, gain: 0.32, chords: MIN });
  spic(at('binario', 2, 0.4), fine('binario'), { vel: 28, chords: MIN });
  brass(at('binario', 3), 2 * BAR > fine('binario') - at('binario', 3) ? fine('binario') - at('binario', 3) : 2 * BAR, [36, 43, 48], { vel: 52, gain: 0.28 }); // il casinò
  colpo(mix, 'charleston', 'v3', { t: at('binario', 3, 0.3), vel: 100, gain: 0.12, pan: 0.3, rev: 0.2, seed: 9 });

  // 3 · riparare: il ritorno a passo doppio, l'anello rosso, la data, il fuoco (timpano forte) e il binario dritto (maggiore)
  strings(T.riparare, at('riparare', 3), { vel: 40, gain: 0.32, chords: MIN });
  spic(T.riparare, at('riparare', 2), { vel: 30, doppio: true, chords: MIN });
  clip(mix, 'passaggio', { t: at('riparare', 0, 0.2) - 0.1, da: 0.56, durata: 1.5, gain: 0.28, fadeOut: 0.4, rev: 0.35 });
  timp(at('riparare', 1, 0.2), 43, 80, 0.4); // l'anello rosso sullo scambio
  bell(at('riparare', 2, 0.3), 82, 46); bell(at('riparare', 2, 0.3) + CROMA, 77, 42); // 12 novembre 1955
  trem(at('riparare', 2), at('riparare', 3, 0.1) - at('riparare', 2), [55, 60, 63], { vel: 62, gain: 0.24 });
  const burn = at('riparare', 3, 0.1);
  clip(mix, 'fiammata', { t: burn + 0.2, da: 0, durata: 1.2, gain: 0.3, fadeOut: 0.4, rev: 0.3 });
  clip(mix, 'fuoco', { t: burn + 0.3, da: 0, durata: 1.8, gain: 0.14, fadeIn: 0.2, fadeOut: 0.6, rev: 0.25 });
  colpo(mix, 'timpani', 'Timpani1_Hit_v4', { t: burn + 0.3, vel: 100, gain: 0.7, rev: 0.5, seed: 3 });
  const dritto = croma(burn + 1.0);
  clip(mix, 'metallo_colpi', { t: dritto, da: 0, durata: 0.5, gain: 0.24, fadeOut: 0.2, rev: 0.25 }); // la leva torna dritta
  crash(dritto + BEAT, 0.28);
  brass(dritto + BEAT, fine('riparare') - dritto - BEAT, [51, 58, 63, 67], { vel: 54, gain: 0.3 });
  strings(dritto + BEAT, fine('riparare'), { vel: 42, gain: 0.34, high: true });

  // 4 · doppioni: lo swing del 1955 per i due Marty, il 2015 a pizzicati che si fermano quando Jennifer sviene
  swing(T.doppioni, at('doppioni', 3), { vel: 38 });
  bell(at('doppioni', 0, 0.3), 82); bell(at('doppioni', 1, 0), 82, 40, 0.3); // i due Marty
  clip(mix, 'pagine', { t: at('doppioni', 1, 1.2), da: 1.25, durata: 0.3, gain: 0.18, fadeOut: 0.1, rev: 0.2 }); // la crocetta
  pizz(at('doppioni', 3), at('doppioni', 3, 1.6), { vel: 36 });
  strings(at('doppioni', 3), at('doppioni', 3, 1.6), { vel: 34, gain: 0.26 });
  [84, 80, 77, 72].forEach((m, k) => bell(at('doppioni', 3, 1.6) + k * CROMA / 2, m, 38)); // sviene
  clip(mix, 'telo', { t: at('doppioni', 3, 2.3), da: 0, durata: 0.6, gain: 0.16, fadeOut: 0.2, rev: 0.3 });
  suona(mix, 'contrabbasso_pizz', 34, { t: at('doppioni', 3, 2.3), dur: BEAT, vel: 70, gain: 1.4, rev: 0.3, release: 0.3 });

  // 5 · lettera: il motore piano, la busta (carta), lo strappo, il volo al 1985, lo sparo fermato dal giubbotto, poi pausa
  strings(T.lettera, at('lettera', 3, 2.6), { vel: 36, gain: 0.3 });
  motif(T.lettera, at('lettera', 2), { vel: 36, gain: 0.34 });
  clip(mix, 'giornale', { t: at('lettera', 1, 0.3), da: 0.93, durata: 0.8, gain: 0.12, fadeOut: 0.2, rev: 0.2 });
  clip(mix, 'pagine', { t: at('lettera', 2, 0.1), da: 1.25, durata: 0.35, gain: 0.28, fadeOut: 0.1, rev: 0.2 }); // strappata
  trem(at('lettera', 2, 0.1), at('lettera', 3) - at('lettera', 2), [62, 65, 70], { vel: 60, gain: 0.2 });
  clip(mix, 'passaggio', { t: at('lettera', 3, -0.3), da: 0.56, durata: 1.2, gain: 0.22, fadeOut: 0.4, rev: 0.35 });
  bell(at('lettera', 3, 0.7), 87, 42); // il nastro la rimette insieme
  spic(at('lettera', 3, 0.7), at('lettera', 3, 2.6), { vel: 30 });
  const shot = at('lettera', 3, 2.6);
  clip(mix, 'sparo', { t: shot - 0.06, da: 2.78, durata: 0.9, gain: 0.24, fadeOut: 0.3, rev: 0.35 });
  timp(shot, 39, 96, 0.5);
  brass(shot + BEAT, fine('lettera') - shot - BEAT, [51, 58, 63], { vel: 46, gain: 0.24 }); // salvo

  // 6 · scritto: Marty dice no, il foglio che si cancella, il ventaglio dei futuri e la fanfara in maggiore
  strings(T.scritto, at('scritto', 3), { vel: 36, gain: 0.3 });
  spic(T.scritto, at('scritto', 2), { vel: 24 });
  clip(mix, 'metallo_colpi', { t: at('scritto', 0, 0.9), da: 0, durata: 0.4, gain: 0.16, fadeOut: 0.15, rev: 0.25 }); // la gara rifiutata
  [82, 79, 77, 75, 74].forEach((m, k) => bell(at('scritto', 2, 0.6) + k * CROMA * 0.8, m, 36)); // il licenziamento si cancella
  motif(at('scritto', 2), at('scritto', 3), { vel: 34, gain: 0.32 });
  const ventaglio = at('scritto', 3, 0.1);
  roll(ventaglio, 1.2, 0.16);
  crash(ventaglio, 0.3);
  fanfare(ventaglio, [70, 75, 79, 82], { vel: 56, gain: 0.28 });
  strings(ventaglio, T.chiusura + 4, { vel: 44, gain: 0.36, high: true });
  motif(croma(ventaglio + 2 * BEAT), T.chiusura, { id: 'corno', vel: 42, gain: 0.26, oct: -12 });

  // ---------------------------------------------------------------- chiusura: il motivo in maggiore al pianoforte, che resta aperto
  motif(T.chiusura, T.chiusura + 16 * CROMA * 2, { vel: 36, gain: 0.36 });
  strings(T.chiusura + 4, T.chiusura + 18, { vel: 34, gain: 0.28 });
  [44, 51, 56, 60].forEach((m, j) => archi(mix, m + 12, { t: T.chiusura + 16 * CROMA * 2, dur: 4.5, vel: 36, pan: (j - 1.5) * 0.3, rev: 0.6, gain: 0.32, attack: 0.8, release: 1.6, seed: j })); // La bemolle, aperto
  bell(T.chiusura + 16 * CROMA * 2, 82, 36);
};
