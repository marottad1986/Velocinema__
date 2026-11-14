// Colonna sonora originale della storia di Edoardo Bove («In un battito»), sobria e discreta sotto la voce.
// Orchestra campionata (VSCO-2 CE e VCSL, CC0: scripts/audio/campioni.mjs): pianoforte a coda, archi, arpa, corno,
// glockenspiel, timpani. Motivo inventato qui, in La minore e in 4/4 a 72 bpm (72 = un battito a riposo): quattro note
// che salgono e si fermano, come un respiro. Il timpano fa da cuore (due colpi, «lub-dub»). Al minuto 17 la musica tace
// (calendario/bove-in-un-battito.md: mai musica drammatica lì); dall'ospedale torna piano, e dal ritorno in campo si apre
// in La maggiore fino all'alba del finale. Nessun tema del documentario.
// Effetti registrati (archivio CC0 di Craig Smith: scripts/audio/effetti.mjs) agganciati agli eventi delle scene in
// src/scenes/bove-in-un-battito/ (stessi istanti: cue + griglia).
import { suona, colpo, crescendo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte_coda', 'violini', 'viole', 'celli', 'contrabbasso', 'violini_trem', 'celli_trem', 'contrabbasso_pizz',
  'arpa', 'glockenspiel', 'timpani', 'corno', 'piatto_sospeso'];
export const effetti = ['applauso', 'applauso_breve', 'scatti', 'colpi_legno', 'pagine', 'pioggia_dura', 'porta_cigolio', 'voci_sala'];
/** Stadio e sala grandi: coda media. */
export const sala = { rt60: 2.2, brillo: 5200, predelay: 0.025, wet: 0.45 };

const BPM = 72;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;

// La minore: Am, F, C, E ; La maggiore (dal ritorno in campo): A, F#m, D, E
const CH = [[45, 48, 52], [41, 45, 48], [48, 52, 55], [40, 44, 47]];
const CHM = [[45, 49, 52], [42, 45, 49], [50, 54, 57], [40, 44, 47]];
// motivo: [tempo, nota, durata in tempi]
const MOTIF = [[0, 69, 1], [1, 71, 1], [2, 72, 1], [3, 76, 3], [6, 74, 2]];
const MOTIF_M = [[0, 69, 1], [1, 71, 1], [2, 73, 1], [3, 76, 3], [6, 78, 2]];

export default (mix, T) => {
  const { segments } = timeline(loadFilm('bove-in-un-battito'));
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
  const O = T.roma; // la griglia parte dalla fine della copertina
  /** Come `griglia` delle scene: istante arrotondato alla croma. */
  const G = (t) => O + Math.round((t - O) / (BEAT / 2)) * (BEAT / 2);
  /** Battuta più vicina. */
  const B = (t) => O + Math.round((t - O) / BAR) * BAR;
  /** Evento della scena: frase n del capitolo + d secondi, sulla griglia. */
  const E = (id, n, d) => G(cue(id, n) + d);

  const strings = (from, to, { half = false, vel = 46, gain = 0.42, bass = true, high = false, k0 = 0, chords = CH } = {}) => {
    const step = BAR * (half ? 2 : 1), a = { attack: 0.6, release: 1.4, rev: 0.6 };
    for (let t = from, k = k0; t < to - 0.4; t += step, k++) {
      const d = Math.min(step, to - t), [r, m, f] = chords[k % 4];
      suona(mix, 'celli', r + 12, { t, dur: d, vel, pan: -0.35, gain: gain * 1.05, ...a, seed: k });
      suona(mix, 'viole', m + 12, { t, dur: d, vel: vel - 4, pan: 0.15, gain: gain * 0.8, ...a, seed: k + 1 });
      suona(mix, 'viole', f + 12, { t, dur: d, vel: vel - 4, pan: 0.3, gain: gain * 0.7, ...a, seed: k + 2 });
      if (bass) suona(mix, 'contrabbasso', r, { t, dur: d, vel: vel - 4, pan: -0.1, gain: gain * 0.85, ...a });
      if (high) suona(mix, 'violini', f + 24, { t, dur: d, vel: vel - 6, pan: -0.2, gain: gain * 0.55, attack: 0.8, release: 1.6, rev: 0.7 });
    }
  };
  const motif = (from, to, { half = true, vel = 50, gain = 0.38, major = false, oct = 0 } = {}) => {
    const beat = BEAT * (half ? 2 : 1), loop = 8 * beat;
    for (let L = from; L < to - 0.3; L += loop) {
      for (const [b, m, d] of major ? MOTIF_M : MOTIF) {
        const t = L + b * beat;
        if (t >= to - 0.3) break;
        suona(mix, 'pianoforte_coda', m + oct, { t, dur: Math.min(d * beat, to - t), vel, pan: 0.12, rev: 0.55, gain, release: 1.2 });
        suona(mix, 'pianoforte_coda', m + oct - 12, { t: t + 0.01, dur: Math.min(d * beat, to - t), vel: vel - 12, pan: 0.05, rev: 0.55, gain: gain * 0.5, release: 1.2 });
      }
    }
  };
  const harp = (from, to, { vel = 46, gain = 0.28, k0 = 0, chords = CH } = {}) => {
    for (let t = from, k = 0; t < to - 0.2; t += BEAT / 2, k++) {
      const [r, m, f] = chords[(Math.floor(k / 8) + k0) % 4];
      suona(mix, 'arpa', [r, m, f, r + 12, f, m + 12, f + 12, m][k % 8] + 12, { t, dur: 1.6, vel: vel - (k % 4) * 3, pan: -0.25 + (k % 8) * 0.07, rev: 0.6, gain, release: 1.2 });
    }
  };
  /** Il cuore: due colpi di timpano (lub-dub). */
  const heart = (t, gain = 0.35, vel = 64) => {
    suona(mix, 'timpani', 33, { t, dur: 1, vel, gain, rev: 0.45, release: 0.6, seed: Math.round(t * 10) });
    suona(mix, 'timpani', 33, { t: t + BEAT / 4, dur: 1, vel: vel - 14, gain: gain * 0.7, rev: 0.45, release: 0.6, seed: Math.round(t * 10) + 1 });
  };
  const timp = (t, m = 33, vel = 90, gain = 0.6) => suona(mix, 'timpani', m, { t, dur: 2, vel, gain, rev: 0.5, release: 0.8, seed: Math.round(t * 10) });
  const glock = (t, m, gain = 0.16) => suona(mix, 'glockenspiel', m, { t, dur: 1.6, vel: 48, pan: 0.25, rev: 0.6, gain, release: 1.2 });
  const horn = (t, m, dur, gain = 0.3, vel = 54) => suona(mix, 'corno', m, { t, dur, vel, gain, attack: 0.4, release: 1.2, rev: 0.6, pan: -0.2 });
  const chord = (t, dur, notes, gain = 0.45, vel = 52) => notes.forEach(([id, n], k) =>
    suona(mix, id, n, { t, dur, vel, pan: (k - (notes.length - 1) / 2) * 0.18, gain, attack: 0.35, release: 1.4, rev: 0.6, seed: 40 + k }));
  const crowd = (t, durata, gain, da = 3) => clip(mix, 'applauso', { t, da, durata, gain, fadeIn: 0.25, fadeOut: 1.2, largo: 3, rev: 0.3 });

  // ---- copertina: il cuore a 72 bpm (Locandina.tsx: il picco della linea pulsa a ogni battito) e il motivo che entra
  for (let k = 1; k <= 4; k++) heart(T.roma - k * BEAT, 0.24 + k * 0.01, 60);
  suona(mix, 'contrabbasso', 33, { t: 0.1, dur: 3.8, vel: 44, gain: 0.4, attack: 0.6, release: 1.2, rev: 0.6 });
  [57, 60, 64].forEach((m, j) => suona(mix, 'celli', m, { t: 0.3 + j * 0.2, dur: 3.4, vel: 42, pan: (j - 1) * 0.3, gain: 0.34, attack: 0.6, release: 1.2, rev: 0.6 }));
  [69, 71, 72].forEach((m, j) => suona(mix, 'pianoforte_coda', m, { t: 1.5 + j * BEAT, dur: 1.2, vel: 50, gain: 0.32, rev: 0.55, release: 1 }));

  // ---- roma: il tunnel, archi a metà passo e il motivo; f2 il maxischermo «SERIE A»: corno e archi che si aprono, applauso lontano
  const onRoma = E('roma', 1, 0.3);
  strings(B(T.roma), onRoma, { half: true, vel: 44, gain: 0.34 });
  motif(B(T.roma), onRoma, { vel: 46, gain: 0.3 });
  timp(onRoma, 33, 70, 0.4);
  horn(onRoma, 57, 2.4, 0.3);
  horn(onRoma + BEAT * 2, 64, 1.6, 0.26);
  strings(onRoma, B(T.firenze), { vel: 50, gain: 0.42, high: true, k0: 2 });
  clip(mix, 'applauso_breve', { t: onRoma, da: 1, durata: T.firenze - onRoma, gain: 0.05, fadeIn: 0.3, fadeOut: 0.8, largo: 3, rev: 0.4, lp: 3500 }); // Roma.tsx: la curva e i flash
  clip(mix, 'scatti', { t: onRoma + 0.25, da: 0.47, durata: 0.12, fadeOut: 0.03, gain: 0.08, rev: 0.3, pan: 0.3 });

  // ---- firenze: archi e arpa a passo pieno; f2 il gol del 5-1 (Firenze.tsx: tGol): colpo, applauso, poi un battito di pausa
  const gol1 = E('firenze', 1, 2.4);
  strings(B(T.firenze), gol1 - 0.1, { vel: 48, gain: 0.4, k0: 1 });
  harp(B(T.firenze), gol1 - 0.1, { vel: 46, gain: 0.24, k0: 1 });
  crescendo(mix, gol1, 2 * BEAT, { gain: 0.15 });
  colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_f', { t: gol1, vel: 70, gain: 0.16, rev: 0.5 });
  timp(gol1, 33, 100, 0.6);
  chord(gol1, 1.2, [['contrabbasso', 33], ['celli', 57], ['viole', 64], ['violini', 69], ['violini', 76]], 0.42, 60);
  crowd(gol1, T['minuto-17'] - gol1 - 0.2, 0.2);
  strings(gol1 + 2 * BEAT, B(T['minuto-17']), { vel: 46, gain: 0.34, high: true, k0: 0 });

  // ---- minuto-17: archi sottili mentre l'orologio corre; quando si ferma (Minuto17.tsx: tStop) la musica tace
  const stop = E('minuto-17', 1, -0.6);
  [57, 60, 64].forEach((m, j) => suona(mix, 'violini_trem', m + 12, { t: T['minuto-17'], dur: stop - T['minuto-17'], vel: 38, pan: (j - 1) * 0.3, gain: 0.32, attack: 0.8, release: 0.3, rev: 0.6, seed: j }));
  suona(mix, 'contrabbasso', 33, { t: T['minuto-17'], dur: stop - T['minuto-17'], vel: 40, gain: 0.45, attack: 0.6, release: 0.3, rev: 0.6 });
  // silenzio fino alla fine del capitolo (nessun effetto)

  // ---- careggi: la pioggia e una nota grave che riprende piano; all'alba (Careggi.tsx: tDawn) l'accordo si schiarisce,
  // la finestra che si accende (tWin) è una nota di glockenspiel
  clip(mix, 'pioggia_dura', { t: T.careggi, da: 5.4, durata: E('careggi', 1, 1.5) - T.careggi, gain: 0.12, fadeIn: 1.2, fadeOut: 1.5, largo: 3, rev: 0.12 });
  const dawn = E('careggi', 1, 0.2);
  clip(mix, 'pioggia_dura', { t: E('careggi', 1, 1.0), da: 9, durata: T.defibrillatore - E('careggi', 1, 1.0), gain: 0.04, fadeIn: 0.8, fadeOut: 1, largo: 3, rev: 0.12 });
  [['celli_trem', 45], ['celli_trem', 48], ['violini_trem', 64]].forEach(([id, m], j) => suona(mix, id, m, { t: T.careggi + 0.4, dur: B(dawn) + 0.6 - (T.careggi + 0.4), vel: 50, pan: (j - 1) * 0.3, gain: 0.7, attack: 1.2, release: 1.0, rev: 0.6, seed: j }));
  strings(B(dawn), B(T.defibrillatore), { half: true, vel: 44, gain: 0.34, chords: [[41, 45, 48], [48, 52, 55]] });
  harp(B(dawn), B(T.defibrillatore), { vel: 42, gain: 0.2, chords: [[41, 45, 48], [48, 52, 55], [41, 45, 48], [48, 52, 55]] });
  glock(E('careggi', 1, 2.4), 76, 0.18);
  glock(E('careggi', 1, 2.4) + BEAT, 81, 0.12);

  // ---- defibrillatore: il cuore ritrovato (pizzicati a 72) sotto il motivo; la scatolina (tDev) e la porta che si apre (tHome)
  for (let t = B(T.defibrillatore) + 2 * BEAT, k = 0; t < T.regola - 0.4; t += BEAT, k++) {
    suona(mix, 'contrabbasso_pizz', 45, { t, dur: 0.4, vel: 48, gain: 0.28, rev: 0.4, release: 0.3 });
    suona(mix, 'contrabbasso_pizz', 45, { t: t + BEAT / 4, dur: 0.4, vel: 38, gain: 0.18, rev: 0.4, release: 0.3 });
  }
  strings(B(T.defibrillatore), B(T.regola), { half: true, vel: 42, gain: 0.3, chords: [[48, 52, 55], [41, 45, 48], [48, 52, 55], [43, 47, 50]] });
  motif(B(T.defibrillatore), B(T.regola), { vel: 44, gain: 0.28, oct: 12 });
  glock(E('defibrillatore', 0, 3.2), 84, 0.16);
  const home = E('defibrillatore', 1, 2.6);
  clip(mix, 'porta_cigolio', { t: home, da: 10.68, durata: 1.4, gain: 0.05, fadeOut: 0.5, rev: 0.4, pan: 0.4 });
  [69, 72, 76, 81].forEach((m, j) => suona(mix, 'arpa', m, { t: home + j * BEAT / 2, dur: 2, vel: 50, pan: -0.2 + j * 0.15, rev: 0.6, gain: 0.26, release: 1.4 }));

  // ---- regola: archi gravi trattenuti; il timbro che cala (Regola.tsx: tStamp) è un colpo secco; il ritaglio (pagine);
  // la freccia verso l'estero (tArrow) è l'arpa che sale
  const stamp = E('regola', 0, 4.6);
  strings(B(T.regola), stamp - 0.1, { half: true, vel: 46, gain: 0.42, k0: 1 });
  motif(B(T.regola), stamp - 0.1, { vel: 42, gain: 0.24, oct: -12 });
  clip(mix, 'colpi_legno', { t: stamp - 0.08, da: 1.4, durata: 0.4, gain: 0.3, rev: 0.3 });
  timp(stamp, 33, 76, 0.45);
  clip(mix, 'pagine', { t: E('regola', 1, 1.4), da: 1, durata: 0.6, gain: 0.18, fadeOut: 0.3, rev: 0.3, pan: 0.3 });
  const arrow = E('regola', 1, 4.2);
  strings(stamp + 2 * BEAT, B(T.watford), { vel: 46, gain: 0.4, k0: 2 });
  motif(stamp + 2 * BEAT, arrow - 0.2, { vel: 44, gain: 0.26 });
  for (let j = 0; j < 8; j++) suona(mix, 'arpa', [57, 60, 64, 69, 72, 76, 81, 84][j], { t: arrow + j * (BEAT / 6), dur: 1.6, vel: 48, pan: -0.3 + j * 0.08, rev: 0.6, gain: 0.24, release: 1.2 });
  glock(arrow + 1.5 * BEAT, 88, 0.14);

  // ---- watford: la pioggerella, il corno quando compare «WATFORD» (tName); a 86' (t86) tutta la tribuna in piedi:
  // l'orchestra si apre in La maggiore, applauso lungo e flash
  clip(mix, 'pioggia_dura', { t: T.watford, da: 8, durata: T.gol - T.watford, gain: 0.08, fadeIn: 1, fadeOut: 1, largo: 3, rev: 0.12 });
  const name = E('watford', 0, 3.0);
  const t86 = E('watford', 1, 1.6);
  strings(B(T.watford), t86, { vel: 46, gain: 0.38, k0: 0 });
  harp(B(T.watford), t86, { vel: 44, gain: 0.2, k0: 0 });
  horn(name, 64, 1.6, 0.3);
  horn(name + BEAT, 69, 2.2, 0.28);
  timp(t86, 33, 96, 0.55);
  strings(t86, B(T.gol), { vel: 54, gain: 0.46, high: true, chords: CHM });
  motif(t86 + BEAT, B(T.gol), { half: false, vel: 50, gain: 0.32, major: true });
  horn(t86, 57, 3, 0.3, 58);
  crowd(t86 + 0.2, T.gol - t86 - 0.5, 0.22);
  [0.6, 1.1, 1.5, 2.2].forEach((d, j) => clip(mix, 'scatti', { t: t86 + d, da: [0.47, 0.77, 1.07, 1.68][j], durata: 0.12, fadeOut: 0.03, gain: 0.07, rev: 0.25, pan: -0.4 + j * 0.25 }));

  // ---- gol: rullo prima del tiro, il colpo sul gol (Gol.tsx: tGol), applauso; poi il contatore dei 506 giorni (tCount):
  // glockenspiel che sale e arriva al numero (tCount + 2,4)
  const gol2 = E('gol', 0, 3.4);
  strings(B(T.gol), gol2 - 0.1, { vel: 54, gain: 0.46, high: true, chords: CHM, k0: 3 });
  motif(B(T.gol), gol2 - 0.1, { half: false, vel: 48, gain: 0.3, major: true });
  for (let t = gol2 - 2 * BEAT, k = 0; t < gol2 - 0.05; t += BEAT / 8, k++) suona(mix, 'timpani', 33, { t, dur: 0.3, vel: 50 + k, gain: 0.25 + k * 0.012, rev: 0.4, release: 0.2, seed: k });
  timp(gol2, 33, 110, 0.7);
  crescendo(mix, gol2, 2 * BEAT, { gain: 0.18 });
  colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_f', { t: gol2, vel: 80, gain: 0.22, rev: 0.5 });
  chord(gol2, 2 * BEAT, [['contrabbasso', 33], ['celli', 57], ['viole', 61], ['violini', 69], ['violini', 73], ['violini', 76]], 0.48, 66);
  crowd(gol2, 4 * BEAT + 0.5, 0.26, 6);
  crowd(gol2 + 3.3, T.documentario - gol2 - 3.0, 0.1, 9.3);
  const count = E('gol', 1, 0.6);
  strings(gol2 + 2 * BEAT, B(T.documentario), { vel: 50, gain: 0.4, high: true, chords: CHM });
  for (let j = 0; j < 12; j++) glock(count + j * (BEAT / 4), [69, 71, 73, 74, 76, 78, 80, 81, 83, 85, 86, 88][j], 0.08 + j * 0.005);
  glock(count + 2.4, 93, 0.2);
  horn(count + 2.4, 69, 2, 0.3, 58);

  // ---- documentario: la sala buia, il motivo al pianoforte sulla linea del battito (tLine); il titolo (tTitle);
  // l'insegna con le date (tSign)
  clip(mix, 'voci_sala', { t: T.documentario, da: 4, durata: 3, gain: 0.06, fadeIn: 0.5, fadeOut: 1.5, largo: 3, rev: 0.4 });
  const line = E('documentario', 0, 0.6);
  motif(line, B(T.battito), { half: false, vel: 48, gain: 0.32, major: true });
  strings(B(T.documentario), B(T.battito), { half: true, vel: 44, gain: 0.34, chords: CHM });
  heart(line + 0.4, 0.22, 56);
  glock(E('documentario', 0, 3.8), 81, 0.14);
  harp(B(cue('documentario', 1)), B(T.battito), { vel: 44, gain: 0.2, chords: CHM });
  glock(E('documentario', 2, 2.2), 88, 0.16);
  glock(E('documentario', 2, 2.2) + BEAT / 2, 85, 0.12);

  // ---- battito: l'alba, archi che crescono; la linea di metà campo che pulsa (Battito.tsx: tBeat + 0,4): il cuore e l'accordo pieno
  const beat = E('battito', 1, 1.2);
  strings(B(T.battito), beat, { vel: 48, gain: 0.4, high: true, chords: CHM, k0: 2 });
  harp(B(T.battito), beat, { vel: 46, gain: 0.22, chords: CHM, k0: 2 });
  heart(beat + BEAT / 2, 0.45, 72);
  chord(beat + BEAT / 2, T.finale - beat - BEAT / 2 + 0.5, [['contrabbasso', 33], ['celli', 45], ['celli', 57], ['viole', 61], ['viole', 64], ['violini', 69], ['violini', 73]], 0.42, 54);
  horn(beat + BEAT / 2, 57, 2.6, 0.28);

  // ---- finale: La maggiore aperto, l'arpa e l'ultima nota del motivo
  const F = T.finale;
  chord(F, T.END - F, [['contrabbasso', 33], ['celli', 45], ['viole', 57], ['viole', 64], ['violini', 69], ['violini', 76]], 0.42, 50);
  [69, 73, 76, 81, 85, 88].forEach((m, j) => suona(mix, 'arpa', m, { t: F + 0.2 + j * BEAT / 3, dur: 2.4, vel: 48, pan: -0.3 + j * 0.12, rev: 0.6, gain: 0.26, release: 1.4 }));
  glock(F + 1.6, 88, 0.14);
};
