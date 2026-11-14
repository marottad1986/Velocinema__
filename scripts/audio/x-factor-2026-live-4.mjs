// Colonna sonora originale del riepilogo del Live 4 «Hell Factor» di X Factor 2026 (talent spiegati, schema), discreta sotto la voce.
// Stessa base di tutta la stagione (TALENT.md): 120 bpm, Re maggiore (I–vi–IV–V), batteria, contrabbasso pizzicato,
// pianoforte a coda, ottoni e archi campionati (VSCO-2 CE e VCSL, CC0), applausi registrati. Nessuna delle canzoni
// della serata né citazioni delle loro melodie: si sentono solo colpi e colori quando entra ogni disco dello schema.
// La Giostra (primo turno) con un carillon di glockenspiel che gira sopra il groove; le due uscite dirette con due colpi
// gravi di timpano e un battito di silenzio; ballottaggio in Si minore a metà passo; il Tilt sospeso sui tremoli e sciolto
// in Re maggiore quando il pubblico salva Le Distanze; l'uscita di Alìa ferma la musica per due battiti.
// Eventi agganciati allo schema src/scenes/x-factor-2026-live-4/Schema.tsx con i dati di src/scenes/x-factor-2026-live-4/index.ts
// (stessi istanti: E(capitolo, frase, ritardo) = griglia(cue + ritardo)).
import { suona, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte_coda', 'contrabbasso_pizz', 'contrabbasso', 'celli', 'viole', 'violini', 'violini_trem', 'celli_trem',
  'tromba', 'tromba_stacc', 'trombone', 'corno', 'glockenspiel', 'timpani', 'cassa', 'rullante', 'charleston', 'tom', 'piatto_crash', 'piatto_sospeso', 'grancassa_rullo'];
export const effetti = ['applauso', 'applauso_breve', 'passaggio', 'scatti'];
/** Studio televisivo: coda media, brillante. */
export const sala = { rt60: 1.5, brillo: 6800, predelay: 0.016, wet: 0.36 };

/** Un solo tempo per tutto il video (CLAUDE.md, «Musica»; TALENT.md: lo stesso per tutta la stagione). */
const BPM = 120;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;

// Re maggiore: Re, Si minore, Sol, La (con la settima) — e Si minore per i ballottaggi: Si m, Sol, Mi m, Fa#
const MAG = [[38, 50, 54, 57, 62], [35, 50, 54, 59, 62], [31, 50, 55, 59, 62], [33, 49, 52, 57, 61]];
const MIN = [[35, 50, 54, 59, 62], [31, 50, 55, 59, 62], [28, 52, 55, 59, 64], [30, 49, 54, 58, 61]];

export default (mix, T) => {
  const { segments } = timeline(loadFilm('x-factor-2026-live-4'));
  const S = Object.fromEntries(segments.map((s) => [s.id, s]));
  const T0 = T.serata;
  /** Secondo d'inizio della frase n-esima del capitolo (come subtitleTimes in ChapterOverlay). */
  const cue = (id, n) => {
    const s = S[id];
    const w = s.testo.map((l) => l.length + 6);
    const tot = w.reduce((a, b) => a + b, 0);
    let acc = 0.15;
    for (let k = 0; k < n; k++) acc += (w[k] / tot) * (s.dur - 0.35);
    return s.start + acc;
  };
  /** Come griglia() nelle scene: istante assoluto arrotondato a 1/div di battito (griglia dalla fine della copertina). */
  const G = (t, div = 2) => T0 + Math.round((t - T0) / (BEAT / div)) * (BEAT / div);
  /** Evento della scena: griglia(cues[n] + d) del capitolo id. */
  const E = (id, n, d = 0) => G(cue(id, n) + d);
  const B = (t) => T0 + Math.round((t - T0) / BAR) * BAR;

  // ---- batteria
  const hat = (t, vel = 40) => colpo(mix, 'charleston', vel > 45 ? 'v3' : 'v2', { t, vel: 100, gain: 0.2 * (vel / 50), pan: 0.3, rev: 0.1, seed: Math.round(t * 100) });
  const kick = (t, vel = 60) => colpo(mix, 'cassa', vel > 55 ? 'v5' : 'v3', { t, vel: 100, gain: 0.7 * (vel / 60), rev: 0.1, seed: Math.round(t * 100) });
  const snare = (t, vel = 50) => colpo(mix, 'rullante', vel > 55 ? 'v5' : 'v4', { t, vel: 100, gain: 0.38 * (vel / 60), pan: 0.05, rev: 0.2, seed: Math.round(t * 100) });
  const tom = (t, vel = 60, pitch = 0) => colpo(mix, 'tom', 'TomH_HitS_v3', { t, vel: 100, gain: 0.45 * (vel / 60), pan: -0.15, rev: 0.25, pitch, seed: Math.round(t * 100) });
  const crash = (t, gain = 0.22) => colpo(mix, 'piatto_crash', 'mf', { t, vel: 100, gain, pan: 0.2, rev: 0.3, dur: 2.5, release: 1 });
  const rullo = (t, dur, gain = 0.3) => colpo(mix, 'grancassa_rullo', 'bdrum_roll1', { t, vel: 90, gain, rev: 0.4, dur, release: 0.5 });
  const timp = (t, m = 35, vel = 90, gain = 0.55) => suona(mix, 'timpani', m, { t, dur: 2, vel, gain, rev: 0.4, release: 0.8, seed: Math.round(t * 10) });
  /** Groove da varietà: cassa sull'1 e sul 3, rullante sul 2 e sul 4, charleston in crome. half: metà passo (cassa sull'1). */
  const groove = (from, to, { vel = 44, half = false, snr = true } = {}) => {
    for (let t = from, k = 0; t < to - 0.05; t += BEAT / 2, k++) {
      hat(t, k % 2 ? vel - 12 : vel);
      if (half ? k % 8 === 0 : k % 4 === 0) kick(t, vel + 10);
      if (snr && (half ? k % 8 === 4 : k % 4 === 2)) snare(t, vel);
    }
  };

  // ---- armonia
  /** Basso pizzicato in crome sugli accordi (una battuta ciascuno). */
  const basso = (from, to, { ch = MAG, vel = 60, gain = 0.42, k0 = 0, half = false } = {}) => {
    const step = BEAT * (half ? 2 : 1) / 2;
    for (let t = from, k = 0; t < to - 0.1; t += step, k++) {
      const [r] = ch[(Math.floor((t - from) / BAR) + k0) % 4];
      const n = r + [0, 0, 12, 0, 7, 0, 12, 7][k % 8];
      suona(mix, 'contrabbasso_pizz', n, { t, dur: step, vel: vel - (k % 2) * 8, pan: -0.1, rev: 0.2, gain, release: 0.3, seed: k });
    }
  };
  /** Pianoforte: accordi ribattuti sul levare (stile varietà). */
  const piano = (from, to, { ch = MAG, vel = 50, gain = 0.3, k0 = 0, half = false } = {}) => {
    const step = BEAT * (half ? 2 : 1);
    for (let t = from, k = 0; t < to - 0.1; t += step, k++) {
      const [, ...v] = ch[(Math.floor((t - from) / BAR) + k0) % 4];
      const tt = t + (half ? 0 : BEAT / 2);
      if (tt >= to - 0.1) break;
      v.forEach((m, j) => suona(mix, 'pianoforte_coda', m + 12, { t: tt, dur: BEAT * 0.8, vel: vel - j * 2, pan: 0.15, rev: 0.3, gain: gain * 0.6, release: 0.4, seed: k + j }));
    }
  };
  /** Archi tenuti, una battuta per accordo. */
  const archi = (from, to, { ch = MAG, vel = 46, gain = 0.3, k0 = 0, half = false } = {}) => {
    const step = BAR * (half ? 2 : 1), a = { attack: 0.4, release: 1.1, rev: 0.45 };
    for (let t = from, k = k0; t < to - 0.4; t += step, k++) {
      const d = Math.min(step, to - t), [r, f, o, x] = ch[k % 4];
      suona(mix, 'contrabbasso', r + 12, { t, dur: d, vel: vel - 4, pan: -0.1, gain: gain * 0.8, ...a, seed: k });
      suona(mix, 'celli', f - 12, { t, dur: d, vel, pan: -0.3, gain, ...a, seed: k + 1 });
      suona(mix, 'viole', o, { t, dur: d, vel: vel - 4, pan: 0.2, gain: gain * 0.75, ...a, seed: k + 2 });
      suona(mix, 'violini', x + 12, { t, dur: d, vel: vel - 6, pan: 0.3, gain: gain * 0.55, attack: 0.5, release: 1.3, rev: 0.5 });
    }
  };
  const trem = (t, dur, notes, { gain = 0.24 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 60 ? 'celli_trem' : 'violini_trem', m, { t, dur, vel: 66, pan: (j - (notes.length - 1) / 2) * 0.35, gain: gain * 0.75, attack: 0.4, release: 0.8, rev: 0.45, seed: j + 3 }));
  /** Colpo di ottoni (trombe, tromboni, corni) su un accordo. */
  const ottoni = (t, notes, { dur = BEAT, gain = 0.26, vel = 70 } = {}) => notes.forEach((m, j) => {
    const id = m < 55 ? 'trombone' : m < 66 ? 'corno' : 'tromba';
    suona(mix, id, m, { t, dur, vel, pan: -0.3 + j * 0.2, gain, attack: 0.02, release: 0.5, rev: 0.35, seed: j + Math.round(t * 10) });
  });
  const stacc = (t, m, gain = 0.2) => suona(mix, 'tromba_stacc', m, { t, dur: BEAT / 2, vel: 70, pan: 0.25, gain, release: 0.2, rev: 0.3 });
  const glock = (t, m, gain = 0.14) => suona(mix, 'glockenspiel', m, { t, dur: 1.2, vel: 50, pan: 0.25, rev: 0.5, gain, release: 1 });
  const applausi = (t, durata, gain = 0.1, breve = false) => clip(mix, breve ? 'applauso_breve' : 'applauso', { t, da: 1, durata, gain, fadeIn: 0.3, fadeOut: Math.min(1.2, durata / 2), rev: 0.15, largo: 3 });
  const scatto = (t, pan = 0, gain = 0.2) => clip(mix, 'scatti', { t: t - 0.01, da: 0.515, durata: 0.07, fadeOut: 0.03, gain, rev: 0.2, pan });
  /** Una sezione normale: groove, basso, piano. */
  const sezione = (from, to, opz = {}) => { groove(from, to, opz); basso(from, to, opz); piano(from, to, opz); };
  /** Una sezione di ballottaggio: Si minore a metà passo, cassa come un battito, archi in tremolo. */
  const tensione = (from, to) => {
    basso(from, to, { ch: MIN, half: true, vel: 56, gain: 0.38 });
    for (let t = from; t < to - 0.1; t += BEAT * 2) kick(t, 50);
    archi(from, to, { ch: MIN, vel: 44, gain: 0.26 });
  };

  /** Un disco che entra nello schema: nota di piano (sale riga dopo riga) e un tocco di tom. */
  const disco = (t, m, pan = 0) => { suona(mix, 'pianoforte_coda', m, { t, dur: 1.2, vel: 58, pan, gain: 0.26, rev: 0.35, release: 0.8 }); tom(t, 44, 2); };
  const SCALA = [74, 76, 78, 81, 83];
  /** Carillon della giostra: glockenspiel in crome su un arpeggio di Re che gira (sale e scende). */
  const carillon = (from, to, gain = 0.05) => {
    const giro = [74, 78, 81, 86, 81, 78, 76, 79, 83, 79, 76, 73];
    for (let t = from, k = 0; t < to - 0.1; t += BEAT / 2, k++) glock(t, giro[k % giro.length], gain * (k % 2 ? 0.75 : 1));
  };

  // ---- copertina: colpo di ottoni e piatto al fotogramma 0 (l'aggancio), tre colpi di timpano (le tre uscite), poi il rullo
  ottoni(0.02, [50, 57, 62, 66, 69], { dur: BEAT * 1.5, gain: 0.26, vel: 80 });
  crash(0.02, 0.24);
  kick(0.02, 70);
  applausi(0.3, 3.0, 0.04);
  [0, 1, 2].forEach((k) => timp(BEAT * 2 + k * BEAT / 2, 35, 80 + k * 6, 0.32));
  carillon(BEAT * 4, T0 - 1.5, 0.05);
  rullo(T0 - 1.5, 1.5, 0.26);
  basso(T0 - BAR, T0, { vel: 54, gain: 0.34 });

  // ---- serata: HELL FACTOR (piatto e timpano), «3 FUORI IN UNA SERA» (tre colpi), l'ospite, la giostra si accende
  const se = 'serata';
  sezione(B(T[se]), B(T['giostra-1']), { vel: 42 });
  { const t = E(se, 0, 0.2); crash(t, 0.18); timp(t, 38, 90, 0.36); applausi(t, 2.0, 0.05, true); } // Schema.tsx: HELL FACTOR
  { const t = E(se, 1, 0.3); [0, 1, 2].forEach((k) => tom(t + k * BEAT / 2, 58, -4 - k)); } // 3 FUORI IN UNA SERA
  { const t = E(se, 2, 0.9); ottoni(t, [50, 57, 62, 66], { dur: BEAT * 2, gain: 0.18 }); glock(t + 0.3, 90, 0.12); } // l'ospite (stella)
  { const t = E(se, 3, 0.5); [74, 78, 81, 86].forEach((m, j) => glock(t + j * BEAT / 4, m, 0.12)); carillon(t + BEAT, B(T['giostra-1']), 0.05); } // la giostra si accende e gira
  stacc(E(se, 4, 0.2), 81, 0.18); // TURNO 1 · LA GIOSTRA

  // ---- la Giostra: dieci dischi, uno per frase, con il carillon che continua a girare
  for (const [id, ritardi] of [['giostra-1', [0.4, 0.2, 0.1, 0.2, 0.2]], ['giostra-2', [0.3, 0.1, 0.1, 0.1, 0.4]]]) {
    sezione(B(T[id]), B(T[id === 'giostra-1' ? 'giostra-2' : 'turno-2']), { vel: 44, k0: id === 'giostra-1' ? 0 : 2 });
    carillon(B(T[id]), B(T[id === 'giostra-1' ? 'giostra-2' : 'turno-2']), 0.045);
    ritardi.forEach((d, n) => disco(E(id, n, d), SCALA[n], -0.3 + n * 0.15));
  }

  // ---- turno 2: canzoni scelte dai giudici, un disco per frase (Scraffs e Giacomo nella stessa frase)
  const t2 = 'turno-2', t2b = 'turno-2b';
  sezione(B(T[t2]), B(T[t2b]), { vel: 46 });
  { const t = E(t2, 0, 0.2); ottoni(t, [50, 57, 62, 66], { dur: BEAT, gain: 0.16 }); } // TURNO 2 · scelti dai giudici
  [[1, 0.2], [2, 0.1], [3, 0.3], [4, 0.3]].forEach(([n, d], i) => disco(E(t2, n, d), SCALA[i], -0.3 + i * 0.2));
  sezione(B(T[t2b]), B(T['fuori-subito']), { vel: 46, k0: 2 });
  [[0, 0.2], [1, 0.2], [2, 0.1], [3, 0.3], [3, 1.7], [4, 0.4]].forEach(([n, d], i) => disco(E(t2b, n, d), [74, 76, 78, 81, 83, 86][i], -0.3 + i * 0.12));

  // ---- chi esce subito: la somma (passaggio e glockenspiel), le due uscite dirette (due timpani gravi e silenzio), il ballottaggio
  const fs = 'fuori-subito';
  const tSom = E(fs, 0, 1.0), tSub = E(fs, 1, 0.9), tBal = E(fs, 2, 1.0);
  groove(B(T[fs]), tSub - BEAT / 2, { vel: 40, half: true });
  basso(B(T[fs]), tSub - BEAT / 2, { vel: 54, gain: 0.36, ch: MIN, half: true });
  archi(B(T[fs]), tSub - BEAT / 2, { ch: MIN, vel: 40, gain: 0.24 });
  clip(mix, 'passaggio', { t: tSom - 0.05, da: 0.5, durata: 0.9, gain: 0.1, fadeOut: 0.3, rev: 0.2 }); [81, 86].forEach((m, j) => glock(tSom + j * BEAT / 2, m, 0.12)); // «+» SOMMA DEI VOTI
  rullo(tSub - 1.0, 1.0, 0.2);
  timp(tSub + 0.4, 33, 104, 0.46); timp(tSub + 0.65, 31, 104, 0.46); // i dischi di Manu e degli Scraffs si incrinano
  colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_roll2_cresc', { t: tSub - 0.6, da: 2.4, vel: 90, gain: 0.12, rev: 0.4, dur: 1.0, release: 0.1 });
  tensione(tSub + 0.65 + 2 * BEAT, B(T.ballottaggio));
  rullo(tBal, 1.0, 0.2); trem(tBal + 0.2, 1.6, [47, 59, 71], { gain: 0.18 }); // l'anello rosso del ballottaggio

  // ---- ballottaggio: Si minore, i due dischi, i voti (Gabbani e Jake, poi Paola e Irama), il due a due
  const bl = 'ballottaggio';
  const tV1 = E(bl, 2, 0.1), tV2 = E(bl, 3, 0.2), tPari = E(bl, 3, 2.6);
  tensione(B(T[bl]), B(T.tilt));
  rullo(E(bl, 0, 0.6) - 1.0, 1.0, 0.16);
  suona(mix, 'pianoforte_coda', 71, { t: E(bl, 0, 0.6), dur: 1.2, vel: 54, gain: 0.26, rev: 0.4 }); // Alìa
  suona(mix, 'pianoforte_coda', 74, { t: E(bl, 1, 0.3), dur: 1.2, vel: 54, gain: 0.26, rev: 0.4 }); // Le Distanze
  [tV1, tV1 + 0.5, tV2, tV2 + 0.5].forEach((t, i) => { scatto(t, -0.45 + i * 0.3); tom(t, 54, i < 2 ? 2 : -3); }); // i gettoni dei giudici
  trem(tV1 - 0.2, tPari - tV1 + 0.2, [47, 59, 71], { gain: 0.16 });
  { ottoni(tPari, [47, 54, 59, 62], { dur: BEAT * 1.5, gain: 0.22, vel: 72 }); crash(tPari, 0.14); } // 2 A 2

  // ---- il Tilt: sospeso sul Fa# (tremoli e rullo), il telefono che vibra, poi il Re maggiore quando il pubblico salva Le Distanze
  const tl = 'tilt';
  const tTilt = E(tl, 0, 0.9), tSalvi = E(tl, 1, 0.5), tFuori = E(tl, 2, 0.6);
  for (let t = B(T[tl]); t < tSalvi - 0.1; t += BEAT) kick(t, 46); // il battito accelera: un colpo per battito
  trem(B(T[tl]), tSalvi - B(T[tl]), [42, 54, 61, 66], { gain: 0.22 });
  { stacc(tTilt, 78, 0.22); stacc(tTilt + 0.25, 78, 0.18); rullo(tTilt + 0.5, tSalvi - tTilt - 0.5, 0.18); } // TILT, il telefono
  for (let t = tTilt + 0.5; t < tSalvi - 0.2; t += BEAT / 2) scatto(t, 0.4, 0.08); // le onde del televoto
  { ottoni(tSalvi, [50, 57, 62, 66, 69], { dur: BEAT * 2, gain: 0.3, vel: 80 }); crash(tSalvi, 0.2); kick(tSalvi, 66); applausi(tSalvi, 2.2, 0.07, true); [86, 90, 93].forEach((m, j) => glock(tSalvi + 0.3 + j * BEAT / 2, m, 0.1)); } // SALVI
  timp(tFuori, 35, 104, 0.42); // il disco di Alìa si incrina: poi due battiti senza musica
  archi(tFuori + 2 * BEAT, B(T['live-5']) + 0.3, { vel: 38, gain: 0.22, ch: MIN });

  // ---- live 5: i sette dischi sotto i giudici, Jake con uno solo, il bollino della finale, la camera si allarga
  const l5 = 'live-5';
  const t0 = E(l5, 0, 0.3), tSolo = E(l5, 1, 0.3), tBo = E(l5, 2, 1.5), tLargo = E(l5, 3, 0.6);
  sezione(B(T[l5]), B(tLargo), { vel: 44 });
  [2, 1, 2, 2].forEach((n, gi) => { tom(t0 + gi * 0.25, 46, 0); for (let j = 0; j < n; j++) glock(t0 + gi * 0.25 + 0.2 + j * 0.15, [74, 78, 81, 86][gi] + j * 4, 0.07); }); // i sette dischi
  [81, 86].forEach((m, j) => glock(tSolo + j * BEAT / 2, m, 0.12)); // il riquadro d'oro intorno a Jake
  { rullo(tBo - 1.0, 1.0, 0.2); ottoni(tBo, [50, 57, 62, 66, 69], { dur: BEAT * 2, gain: 0.3, vel: 80 }); crash(tBo, 0.22); kick(tBo, 66); } // FINALE · 3 DICEMBRE
  archi(B(tLargo), T.finale + 0.3, { vel: 44, gain: 0.3, ch: [MAG[3], MAG[3], MAG[3], MAG[3]] }); // il La resta sospeso sulla domanda
  [69, 73, 76, 81].forEach((m, j) => glock(tLargo + j * BEAT / 2, m, 0.1)); // la camera si allarga su tutto lo schema

  // ---- finale: accordo pieno di Re, applausi
  const F = B(T.finale);
  ottoni(F, [50, 57, 62, 66, 69], { dur: BAR * 1.5, gain: 0.24, vel: 72 }); crash(F, 0.2); kick(F, 60);
  archi(F, T.END - 0.3, { vel: 44, gain: 0.26 });
  applausi(F + 0.2, T.END - F - 0.4, 0.07);
};
