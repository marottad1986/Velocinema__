// Colonna sonora originale di Joker, discreta sotto la voce.
// Orchestra campionata (VSCO-2 CE e VCSL, CC0: scripts/audio/campioni.mjs): archi gravi, pianoforte a coda nel registro
// basso, contrabbasso, timpani, gong, glockenspiel (il carillon del clown), corni e tromboni, tamburi. Motivo inventato
// qui, in Do minore e in 4/4 a 96 bpm (10 s = 4 battute, così i capitoli cadono sul battere): sei note che salgono di una
// terza e ricadono di semitono, al pianoforte grave; sopra, un piccolo carillon storto in terzine contro il 4/4. Lontano
// dalla musica del film: niente violoncello solo che si lamenta, niente canzone rock della scalinata.
// Tensione che cresce fino alla diretta (silenzio dopo lo sparo) e alla rivolta (tamburi e ottoni a passo pieno).
// Effetti registrati (archivio CC0 di Craig Smith: scripts/audio/effetti.mjs) agganciati alle frasi dei sottotitoli
// (tempi come in ChapterOverlay) e agli eventi delle scene in src/scenes/joker/.
import { suona, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte_coda', 'celli', 'viole', 'violini', 'contrabbasso', 'celli_trem', 'violini_trem', 'contrabbasso_pizz',
  'glockenspiel', 'timpani', 'gong', 'piatto_sospeso', 'grancassa_rullo', 'corno', 'trombone', 'trombone_stacc', 'tom', 'cassa', 'rullante'];
export const effetti = ['traffico_clacson', 'pagine', 'metallo_cade', 'serratura', 'rombo', 'colpi_legno', 'pioggia_vento', 'porta_sbatte',
  'applauso_breve', 'disturbo', 'voci_sala', 'fuoco', 'vetri'];
/** Sala media e scura: coda breve, alte smorzate. */
export const sala = { rt60: 1.9, brillo: 4500, predelay: 0.02, wet: 0.45 };

/** Un solo tempo per tutto il film (CLAUDE.md, «Musica»): le scene cupe a metà passo (48), la rivolta a passo pieno. */
const BPM = 96;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;

// Motivo (Do minore): [tempo, nota MIDI, durata in tempi]
const MOTIF = [[0, 48, 1], [1, 51, 1], [2, 50, 2], [4, 48, 1], [5, 46, 1], [6, 47, 2]];
const CH = [[48, 51, 55], [44, 48, 51], [41, 44, 48], [43, 47, 50]]; // Do minore, La♭, Fa minore, Sol

export default (mix, T) => {
  const { segments } = timeline(loadFilm('joker'));
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
  /** Battuta della griglia più vicina all'istante t (griglia che parte dalla fine della copertina). */
  const B = (t) => T.gotham + Math.round((t - T.gotham) / BAR) * BAR;

  /** Archi gravi tenuti sugli accordi, una battuta ciascuno (half: due battute). */
  const strings = (from, to, { half = false, vel = 50, gain = 0.4, bass = true, high = false, k0 = 0 } = {}) => {
    const step = BAR * (half ? 2 : 1), a = { attack: 0.35, release: 1, rev: 0.5 };
    for (let t = from, k = k0; t < to - 0.4; t += step, k++) {
      const d = Math.min(step, to - t), [r, m, f] = CH[k % 4];
      suona(mix, 'celli', r, { t, dur: d, vel, pan: -0.35, gain: gain * 1.1, ...a, seed: k });
      suona(mix, 'viole', m + 12, { t, dur: d, vel: vel - 4, pan: 0.15, gain: gain * 0.8, ...a, seed: k + 1 });
      suona(mix, 'viole', f + 12, { t, dur: d, vel: vel - 4, pan: 0.3, gain: gain * 0.7, ...a, seed: k + 2 });
      if (bass) suona(mix, 'contrabbasso', r - 12, { t, dur: d, vel, pan: -0.1, gain, ...a });
      if (high) suona(mix, 'violini', f + 24, { t, dur: d, vel: vel - 4, pan: -0.2, gain: gain * 0.6, attack: 0.5, release: 1.2, rev: 0.6 });
    }
  };
  /** Il motivo al pianoforte grave (half: metà passo). */
  const motif = (from, to, { half = true, vel = 60, gain = 0.6, oct = 0 } = {}) => {
    const beat = BEAT * (half ? 2 : 1), loop = 8 * beat;
    for (let L = from; L < to - 0.3; L += loop) {
      for (const [b, m, d] of MOTIF) {
        const t = L + b * beat;
        if (t >= to - 0.3) break;
        suona(mix, 'pianoforte_coda', m + oct, { t, dur: Math.min(d * beat, to - t), vel, pan: -0.1, rev: 0.45, gain, release: 0.9 });
        suona(mix, 'pianoforte_coda', m + oct - 12, { t: t + 0.01, dur: Math.min(d * beat, to - t), vel: vel - 14, pan: -0.2, rev: 0.45, gain: gain * 0.6, release: 0.9 });
      }
    }
  };
  /** Il carillon del clown: arpeggi di glockenspiel in terzine (tre note ogni due tempi), un po' storti contro il 4/4. */
  const carillon = (from, to, { vel = 48, gain = 0.2, k0 = 0 } = {}) => {
    for (let t = from, k = 0; t < to - 0.2; t += (2 * BEAT) / 3, k++) {
      const [r, m, f] = CH[Math.floor((k + k0 * 6) / 6) % 4];
      suona(mix, 'glockenspiel', [r, m, f][k % 3] + 36, { t, dur: 1.2, vel: vel - (k % 3) * 6, pan: 0.3, rev: 0.6, gain, release: 1, cents: k % 5 === 4 ? -30 : 0 });
    }
  };
  const trem = (t, dur, notes, { vel = 52, gain = 0.36 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 60 ? 'celli_trem' : 'violini_trem', m, { t, dur, vel, pan: (j - (notes.length - 1) / 2) * 0.35, gain, attack: 0.5, release: 0.9, rev: 0.5, seed: j + 3 }));
  const timp = (t, m = 36, vel = 90, gain = 0.9) => suona(mix, 'timpani', m, { t, dur: 1.6, vel, gain, rev: 0.45, release: 0.6, seed: Math.round(t * 10) });
  const gong = (t, gain = 0.4, file = 'gong_hit_p') => colpo(mix, 'gong', file, { t, vel: 80, rev: 0.5, gain, dur: 3.5, release: 1 });
  const roll = (t, gain = 0.3) => colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_roll2_cresc', { t, vel: 60, rev: 0.4, gain, dur: 1.6, release: 0.4 });
  const pulse = (from, to, { vel = 66, gain = 0.5, half = false } = {}) => {
    for (let t = from; t < to - 0.2; t += BEAT * (half ? 2 : 1)) suona(mix, 'contrabbasso_pizz', 36, { t, dur: BEAT, vel, pan: -0.1, rev: 0.3, gain, release: 0.3 });
  };
  const city = (t, durata, gain, da = 4) => clip(mix, 'traffico_clacson', { t, da, durata, gain, fadeIn: 0.8, fadeOut: 0.8, largo: 3, rev: 0.15 });

  // ---- copertina: la città lontana, un accordo grave, il carillon che entra storto
  city(0, T.gotham + 0.5, 0.04);
  suona(mix, 'contrabbasso', 36, { t: 0.2, dur: 3.8, vel: 50, gain: 0.45, attack: 0.6, release: 1, rev: 0.5 });
  [48, 51, 55].forEach((m, j) => suona(mix, 'celli', m, { t: 0.4 + j * 0.2, dur: 3.4 - j * 0.2, vel: 50, pan: (j - 1) * 0.3, gain: 0.48, attack: 0.5, release: 1, rev: 0.5 }));
  carillon(1.2, T.gotham, { vel: 46, gain: 0.18 });

  // ---- gotham: il motivo al pianoforte, archi, la città; il cartello e il sogno della TV
  city(T.gotham, T.risata - T.gotham, 0.05, 4);
  strings(B(T.gotham), B(T.risata), { half: true, vel: 46, gain: 0.34 });
  motif(B(T.gotham), B(T.risata), { vel: 58 });
  carillon(B(cue('gotham', 1)), B(T.risata), { vel: 42, gain: 0.15 });
  [84, 87, 91].forEach((m, j) => suona(mix, 'glockenspiel', m, { t: cue('gotham', 2) + 0.2 + j * BEAT / 3, dur: 1.5, vel: 50, pan: 0.3, rev: 0.6, gain: 0.18, release: 1.2 })); // la TV in vetrina

  // ---- risata: l'autobus, il cartoncino; le luci a scatti come una risata (pizzicati a scatti); il vicolo
  strings(B(T.risata), B(T.pistola), { half: true, vel: 44, gain: 0.32, k0: 2 });
  motif(B(T.risata), B(T.pistola), { vel: 54, oct: 12, gain: 0.4 });
  clip(mix, 'rombo', { t: T.risata, da: 31, durata: cue('risata', 2) - T.risata, gain: 0.05, lp: 600, fadeIn: 0.5, fadeOut: 0.8, largo: 2 }); // il motore dell'autobus
  for (let t = T.gotham + Math.ceil((cue('risata', 1) - T.gotham) / (BEAT / 2)) * (BEAT / 2), k = 0; t < cue('risata', 2) - 0.1; t += BEAT / 2, k++) // la risata che non si ferma: pizzicati a scatti
    suona(mix, 'contrabbasso_pizz', [43, 46, 43, 48][k % 4], { t, dur: BEAT / 2, vel: 60 + (k % 2) * 10, pan: 0.2, rev: 0.3, gain: 0.35, release: 0.2 });
  trem(cue('risata', 2), T.pistola - cue('risata', 2), [48, 49, 72], { vel: 50, gain: 0.3 });
  timp(cue('risata', 2) + 0.4, 36, 90, 0.7);

  // ---- pistola: lo spogliatoio, l'ospedale con il carillon, la pistola che cade, l'armadietto vuoto
  strings(B(T.pistola), B(cue('pistola', 1)), { vel: 46, gain: 0.32 });
  motif(B(T.pistola), B(cue('pistola', 1)), { vel: 54 });
  carillon(B(cue('pistola', 1)), B(cue('pistola', 2)), { vel: 50, gain: 0.22 });
  strings(B(cue('pistola', 1)), B(T.metro), { vel: 40, gain: 0.26, bass: false, high: true, k0: 1 });
  clip(mix, 'metallo_cade', { t: cue('pistola', 1) + 1.61, da: 0.66, durata: 0.6, gain: 0.35, fadeOut: 0.2, rev: 0.3 }); // Pistola.tsx: la pistola tocca terra
  timp(cue('pistola', 1) + 1.8, 36, 80, 0.6);
  clip(mix, 'serratura', { t: cue('pistola', 2) + 0.2, da: 2.45, durata: 0.42, gain: 0.3, rev: 0.3, pan: 0.2 }); // l'armadietto
  motif(B(cue('pistola', 2)), B(T.metro), { vel: 52, gain: 0.5 });

  // ---- metro: il vagone che corre, il battito; tre colpi di timpano coi lampi; il muro delle maschere
  clip(mix, 'rombo', { t: T.metro, da: 31, durata: cue('metro', 2) - T.metro, gain: 0.12, lp: 500, fadeIn: 0.4, fadeOut: 0.6, largo: 2 });
  pulse(B(T.metro), B(cue('metro', 2)), { vel: 64, gain: 0.5 });
  trem(T.metro + 0.3, cue('metro', 1) + 0.6 - T.metro - 0.3, [48, 51, 72, 75], { vel: 54, gain: 0.34 });
  [0, 0.45, 0.9].forEach((d) => timp(cue('metro', 1) + 0.6 + d, 36, 100, 0.65)); // Metro.tsx: i tre lampi
  gong(cue('metro', 1) + 1.4, 0.25);
  strings(B(cue('metro', 2)), B(T.madre), { vel: 50, gain: 0.38, high: true });
  carillon(B(cue('metro', 2)), B(T.madre), { vel: 50, gain: 0.2 });

  // ---- madre: l'appartamento, il televisore; la villa lontana; la lettera che si apre
  strings(B(T.madre), B(T.verita), { half: true, vel: 44, gain: 0.32 });
  motif(B(T.madre), B(T.verita), { vel: 52, oct: 12, gain: 0.42 });
  clip(mix, 'pagine', { t: cue('madre', 2), da: 1, durata: 0.7, gain: 0.22, fadeOut: 0.2, rev: 0.25, pan: 0.2 });
  [79, 84, 87].forEach((m, j) => suona(mix, 'glockenspiel', m, { t: cue('madre', 2) + 0.8 + j * BEAT / 4, dur: 1.4, vel: 46, pan: 0.2, rev: 0.6, gain: 0.16, release: 1 }));

  // ---- verita: l'archivio sotto la pioggia, il timbro, le foto girate e la lampada che sfarfalla
  clip(mix, 'pioggia_vento', { t: T.verita, da: 34, durata: T.sola - T.verita, gain: 0.07, fadeIn: 0.8, fadeOut: 0.8, largo: 2.5, rev: 0.1 });
  strings(B(T.verita), B(cue('verita', 2)), { vel: 46, gain: 0.34, k0: 2 });
  motif(B(T.verita), B(T.sola), { vel: 54 });
  clip(mix, 'pagine', { t: cue('verita', 0) + 0.6, da: 0.9, durata: 0.6, gain: 0.2, fadeOut: 0.2, rev: 0.2, pan: -0.2 });
  clip(mix, 'colpi_legno', { t: cue('verita', 1) + 1.0 - 0.02, da: 1.46, durata: 0.3, gain: 0.3, rev: 0.3 }); // il timbro
  timp(cue('verita', 1) + 1.0, 36, 80, 0.6);
  trem(cue('verita', 2), T.sola - cue('verita', 2), [48, 49, 72, 73], { vel: 56, gain: 0.3 });

  // ---- sola: la luce calda della vicina (archi più chiari), che si spegne; l'ospedale, il monitor che si ferma
  strings(B(T.sola), B(cue('sola', 1)), { vel: 52, gain: 0.5, high: true, k0: 1 });
  motif(B(T.sola), B(T.murray), { vel: 56, gain: 0.5 });
  strings(B(cue('sola', 1)), B(T.murray), { half: true, vel: 50, gain: 0.45, k0: 2 });
  trem(cue('sola', 1) + 0.6, cue('sola', 2) - cue('sola', 1) - 0.6, [48, 51, 72], { vel: 52, gain: 0.38 });
  const flat = cue('sola', 2) + 1.6; // Sola.tsx: il monitor si appiattisce
  for (let t = B(cue('sola', 2)); t < flat; t += BEAT) suona(mix, 'glockenspiel', 96, { t, dur: 0.3, vel: 40, pan: -0.3, rev: 0.3, gain: 0.12, release: 0.2 }); // il bip del monitor
  suona(mix, 'glockenspiel', 96, { t: flat, dur: T.murray - flat, vel: 40, pan: -0.3, rev: 0.4, gain: 0.08, release: 0.5 });
  suona(mix, 'contrabbasso', 36, { t: flat, dur: T.murray - flat, vel: 50, gain: 0.45, attack: 0.3, release: 1, rev: 0.5 });
  gong(flat, 0.3);

  // ---- murray: lo studio si accende, gli applausi, la serata in video e «joker», l'invito
  strings(B(T.murray), B(T.scalinata), { vel: 50, gain: 0.36, high: true });
  carillon(B(T.murray), B(T.scalinata), { vel: 48, gain: 0.2 });
  clip(mix, 'applauso_breve', { t: T.murray + 0.3, da: 4.5, durata: 2, gain: 0.18, fadeIn: 0.3, fadeOut: 0.8, rev: 0.3 });
  clip(mix, 'disturbo', { t: cue('murray', 1), da: 2, durata: 0.5, gain: 0.1, fadeIn: 0.05, fadeOut: 0.2, rev: 0.2 }); // il video della serata
  timp(cue('murray', 1) + 1.4, 36, 90, 0.7); // «joker»
  clip(mix, 'applauso_breve', { t: cue('murray', 2) - 0.2, da: 4.5, durata: 2.2, gain: 0.18, fadeIn: 0.2, fadeOut: 0.8, rev: 0.3 }); // l'applausometro
  roll(cue('murray', 2) + 0.2, 0.2);

  // ---- scalinata: la porta di Randall che sbatte; il completo rosso; la discesa a passo pieno con tamburi e ottoni
  trem(T.scalinata, cue('scalinata', 1) - T.scalinata, [48, 49, 60], { vel: 56, gain: 0.4 });
  strings(B(T.scalinata), B(cue('scalinata', 1)), { vel: 52, gain: 0.42, k0: 3 });
  motif(B(T.scalinata), B(cue('scalinata', 2)), { vel: 56, gain: 0.5 });
  clip(mix, 'porta_sbatte', { t: cue('scalinata', 1) - 0.2 - 0.5, da: 2.6, durata: 0.9, gain: 0.4, fadeOut: 0.3, rev: 0.35 });
  const D = B(cue('scalinata', 2));
  strings(B(cue('scalinata', 1)), D, { vel: 52, gain: 0.38 });
  for (let t = D, k = 0; t < T.diretta - 0.2; t += BEAT, k++) { // la discesa ballata: cassa e tom, ottoni sul primo tempo
    colpo(mix, k % 2 ? 'tom' : 'cassa', k % 2 ? 'TomH_HitS_v2' : 'v3', { t, vel: k % 4 ? 70 : 95, rev: 0.3, gain: 0.5 });
    if (k % 4 === 0) suona(mix, 'trombone_stacc', CH[Math.floor(k / 4) % 4][0] - 12, { t, dur: BEAT, vel: 70, gain: 0.35, rev: 0.4, release: 0.3 });
    if (k % 4 === 2) suona(mix, 'trombone_stacc', CH[Math.floor(k / 4) % 4][1] - 12, { t, dur: BEAT, vel: 64, gain: 0.3, rev: 0.4, release: 0.3 });
  }
  motif(D, T.diretta, { half: false, vel: 62, gain: 0.5 });
  timp(cue('scalinata', 2) + 1.2, 36, 100, 0.7); // la polizia

  // ---- diretta: suspense, poi lo sparo (timpano e gong), il silenzio e il disturbo del collegamento interrotto
  const shot = cue('diretta', 2) + 1.2; // Diretta.tsx
  strings(B(T.diretta), B(cue('diretta', 1)), { vel: 48, gain: 0.34, k0: 3 });
  timp(cue('diretta', 0) + 1, 36, 90, 0.7); // «Joker» in sovrimpressione
  trem(cue('diretta', 1), shot - cue('diretta', 1), [36, 48, 49, 72, 73], { vel: 60, gain: 0.4 });
  pulse(B(cue('diretta', 1)), shot - 0.1, { vel: 70, gain: 0.5 });
  colpo(mix, 'grancassa_rullo', 'bdrum_roll1', { t: shot - 2, vel: 70, rev: 0.4, gain: 0.28, dur: 2, release: 0.3 });
  timp(shot, 36, 110, 0.9);
  gong(shot + 0.05, 0.45, 'gong_hit_mp');
  clip(mix, 'disturbo', { t: shot + 0.3, da: 2, durata: B(T.rivolta) + BAR - 2 * BEAT - shot - 0.3, gain: 0.12, fadeIn: 0.05, fadeOut: 0.4, rev: 0.15 });
  suona(mix, 'contrabbasso', 36, { t: shot + 0.3, dur: B(T.rivolta) + BAR - 2 * BEAT - shot - 0.3, vel: 44, gain: 0.35, attack: 0.5, release: 0.8, rev: 0.5 });

  // ---- rivolta: tamburi e ottoni a passo pieno, fuoco e folla; il vicolo e le perle; il manicomio e il carillon
  const R0 = B(T.rivolta) + BAR, R1 = B(cue('rivolta', 1)); // a 96 bpm la battuta più vicina (104) cadrebbe prima del taglio: si entra con un levare e il pieno alla battuta dopo
  colpo(mix, 'grancassa_rullo', 'bdrum_roll1', { t: R0 - 2 * BEAT, vel: 70, rev: 0.4, gain: 0.3, dur: 2 * BEAT, release: 0.2 });
  clip(mix, 'fuoco', { t: T.rivolta, da: 1, durata: R1 - T.rivolta, gain: 0.08, fadeIn: 0.3, fadeOut: 0.6, largo: 3, rev: 0.15 });
  clip(mix, 'voci_sala', { t: T.rivolta, da: 8, durata: R1 - T.rivolta, gain: 0.07, fadeIn: 0.3, fadeOut: 0.6, largo: 4, rev: 0.2 });
  clip(mix, 'vetri', { t: T.rivolta + 1.2, da: 3.66, durata: 0.8, gain: 0.25, fadeOut: 0.3, rev: 0.3, pan: 0.3 });
  for (let t = R0, k = 0; t < R1 - 0.1; t += BEAT, k++) {
    colpo(mix, 'cassa', 'v3', { t, vel: 95, rev: 0.3, gain: 0.6 });
    colpo(mix, 'rullante', 'v2', { t: t + BEAT / 2, vel: 70, rev: 0.3, gain: 0.3 });
    if (k % 2 === 0) timp(t, 36, 90, 0.6);
  }
  strings(R0, R1, { vel: 60, gain: 0.45, high: true });
  [55, 58, 60].forEach((m, j) => suona(mix, 'corno', m, { t: R0 + j * BAR / 2, dur: BAR, vel: 64, gain: 0.32, attack: 0.2, release: 0.8, rev: 0.45, pan: 0.2 }));
  trem(R1, cue('rivolta', 2) - R1, [36, 48, 49], { vel: 46, gain: 0.32 }); // il vicolo
  [99, 96, 94, 91].forEach((m, j) => suona(mix, 'glockenspiel', m, { t: cue('rivolta', 1) + 1 + j * BEAT / 4, dur: 1.2, vel: 46, pan: -0.2 + j * 0.15, rev: 0.6, gain: 0.14, release: 1 })); // le perle
  gong(cue('rivolta', 1) + 1, 0.3);
  carillon(B(cue('rivolta', 2)), B(T.finale), { vel: 44, gain: 0.2 }); // il manicomio: il carillon storto torna
  motif(B(cue('rivolta', 2)), B(T.finale), { vel: 50, gain: 0.45 });

  // ---- finale: un accordo di Do minore che non si risolve, con il carillon che si ferma su una nota storta
  const F = B(T.finale);
  [['contrabbasso', 36], ['celli', 48], ['viole', 63], ['viole', 67], ['violini', 74]].forEach(([id, n], k) =>
    suona(mix, id, n, { t: F, dur: T.END - F, vel: 56, pan: (k - 2) * 0.2, gain: 0.6, attack: 0.3, release: 1.4, rev: 0.55, seed: 30 + k }));
  suona(mix, 'glockenspiel', 85, { t: F + 1, dur: 2, vel: 44, pan: 0.3, rev: 0.6, gain: 0.16, release: 1.4, cents: -40 });
  city(F, T.END - F, 0.03, 8);
};
