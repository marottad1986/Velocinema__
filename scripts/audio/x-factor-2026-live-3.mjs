// Colonna sonora originale del riepilogo del Live 3 di X Factor 2026 (talent spiegati, schema), discreta sotto la voce.
// Stessa base di tutta la stagione (TALENT.md): 120 bpm, Re maggiore (I–vi–IV–V), batteria, contrabbasso pizzicato,
// pianoforte a coda, ottoni e archi campionati (VSCO-2 CE e VCSL, CC0), applausi registrati. Nessuna delle canzoni
// della serata né citazioni delle loro melodie: si sentono solo colpi e colori quando entra ogni disco dello schema.
// Ballottaggio in Si minore a metà passo con il rullo e i tremoli; l'eliminazione ferma la musica per due battiti.
// Eventi agganciati allo schema src/scenes/talent/SchemaLive.tsx con i dati di src/scenes/x-factor-2026-live-3/index.ts
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
  const { segments } = timeline(loadFilm('x-factor-2026-live-3'));
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

  // ---- copertina: colpo di ottoni e piatto al fotogramma 0 (l'aggancio), poi il rullo che porta al primo capitolo
  ottoni(0.02, [50, 57, 62, 66, 69], { dur: BEAT * 1.5, gain: 0.26, vel: 80 });
  crash(0.02, 0.24);
  kick(0.02, 70);
  applausi(0.3, 3.2, 0.045);
  for (let k = 0; k < 6; k++) stacc(BEAT * 2 + k * BEAT / 2, [62, 64, 66, 69, 71, 74][k], 0.3);
  rullo(T0 - 1.5, 1.5, 0.26);
  basso(T0 - BAR, T0, { vel: 54, gain: 0.34 });

  // ---- serata: il jukebox si accende (piatto e applausi), le note escono, l'apertura di Giorgia (tre dischi), l'ospite
  const se = 'serata';
  sezione(B(T[se]), B(T['turno-1']), { vel: 42 });
  { const t = E(se, 0, 0.3); crash(t, 0.18); applausi(t, 2.2, 0.06, true); } // SchemaLive.tsx: JUKEBOX NIGHT
  [74, 78, 81, 86].forEach((m, j) => glock(E(se, 1, 0.2) + j * BEAT / 2, m, 0.12)); // le note escono dal jukebox
  for (let i = 0; i < 3; i++) stacc(E(se, 2, 0.3) + 0.25 + i * 0.25, [69, 74, 78][i], 0.18); // i tre dischi dell'apertura
  { const t = E(se, 3, 0.6); ottoni(t, [50, 57, 62, 66], { dur: BEAT * 2, gain: 0.18 }); glock(t + 0.3, 90, 0.12); } // l'ospite

  /** Un disco che entra nello schema: nota di piano (sale riga dopo riga) e un tocco di tom. */
  const disco = (t, m, pan = 0) => { suona(mix, 'pianoforte_coda', m, { t, dur: 1.2, vel: 58, pan, gain: 0.26, rev: 0.35, release: 0.8 }); tom(t, 44, 2); };
  /** Applausi in piedi: applausi registrati e la stella (glockenspiel). */
  const inPiedi = (t) => { applausi(t, 2.6, 0.08); [86, 90, 93].forEach((m, j) => glock(t + j * BEAT / 2, m, 0.12)); };
  /** Ultimo del turno: timpano grave e la freccia rossa che parte verso il ballottaggio. */
  const ultimo = (t) => { timp(t, 35, 84, 0.34); clip(mix, 'passaggio', { t: t + 0.45, da: 0.5, durata: 1.0, gain: 0.13, fadeOut: 0.4, rev: 0.2 }); };

  // ---- turno 1: Camilla, Lenanie, Giacomo (in piedi), poi Alìa, Teo Bok, Le Distanze; Lenanie ultimo
  sezione(B(T['turno-1']), B(T['turno-1b']), { vel: 44 });
  disco(E('turno-1', 0, 1.0), 74, -0.2); disco(E('turno-1', 1, 0.3), 78, 0); disco(E('turno-1', 2, 0.4), 81, 0.2);
  inPiedi(E('turno-1', 2, 2.4));
  const u1 = E('turno-1b', 3, 0.5);
  sezione(B(T['turno-1b']), u1 - BEAT / 2, { vel: 44, k0: 3 });
  disco(E('turno-1b', 0, 0.1), 74, -0.2); disco(E('turno-1b', 1, 0.1), 78, 0); disco(E('turno-1b', 2, 0.2), 81, 0.2);
  ultimo(u1);
  archi(u1 + BEAT, B(T['turno-2']) + 0.3, { ch: MIN, vel: 40, gain: 0.3 });

  // ---- turno 2: Scraffs, Manu, Alex Fontana, poi Mad-Dog e Patrizia (comincia senza musica: la base si ferma, poi in piedi); Manu ultimo
  sezione(B(T['turno-2']), B(T['turno-2b']), { vel: 44 });
  disco(E('turno-2', 0, 0.9), 74, -0.2); disco(E('turno-2', 1, 0.1), 78, 0); disco(E('turno-2', 2, 0.1), 81, 0.2);
  const tSenza = E('turno-2b', 2, 0.2), tPiedi = E('turno-2b', 2, 1.8), u2 = E('turno-2b', 3, 0.3);
  sezione(B(T['turno-2b']), tSenza - BEAT / 2, { vel: 44, k0: 3 });
  disco(E('turno-2b', 0, 0.2), 74, -0.2); disco(E('turno-2b', 1, 0.3), 81, 0.2);
  suona(mix, 'pianoforte_coda', 74, { t: tSenza, dur: tPiedi - tSenza, vel: 40, gain: 0.24, rev: 0.5, release: 1 }); // INIZIA SENZA MUSICA: resta un solo pianoforte
  inPiedi(tPiedi);
  sezione(tPiedi + BEAT, u2 - BEAT / 2, { vel: 42 });
  ultimo(u2);
  archi(u2 + BEAT, B(T.ballottaggio) + 0.3, { ch: MIN, vel: 40, gain: 0.3 });

  // ---- ballottaggio: Si minore, i due dischi, i quattro voti (Irama difende il suo: tom più alto e glockenspiel), l'eliminazione
  const bl = 'ballottaggio';
  const tV = E(bl, 2, 0.9), tF = E(bl, 3, 2.8);
  tensione(B(T[bl]), tF);
  rullo(E(bl, 0, 1.2) - 1.0, 1.0, 0.18);
  suona(mix, 'pianoforte_coda', 71, { t: E(bl, 0, 1.2), dur: 1.2, vel: 54, gain: 0.26, rev: 0.4 }); // Lenanie
  suona(mix, 'pianoforte_coda', 74, { t: E(bl, 1, 0.1), dur: 1.2, vel: 54, gain: 0.26, rev: 0.4 }); // Manu
  trem(tV - 0.2, 4 * 0.5 + 0.4, [47, 59, 71], { gain: 0.2 });
  const DIFENDE = [false, false, false, true]; // Gabbani, Jake, Paola, Irama: chi vota l'altro sfidante difende il suo (dati del ballottaggio in src/scenes/x-factor-2026-live-3/index.ts)
  for (let i = 0; i < 4; i++) { const difende = DIFENDE[i]; scatto(tV + i * 0.5, -0.45 + i * 0.3); tom(tV + i * 0.5, 54, difende ? 5 : -3 + i); if (difende) glock(tV + i * 0.5, 81, 0.1); } // i gettoni dei giudici
  timp(tF, 35, 104, 0.4); colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_roll2_cresc', { t: tF - 1.0, vel: 90, gain: 0.16, rev: 0.4, dur: 1.1, release: 0.1 }); // il disco di Lenanie si incrina
  archi(tF + 2 * BEAT, B(T['live-4']) + 0.3, { vel: 40, gain: 0.24, k0: 0 });
  piano(tF + 2 * BEAT, B(T['live-4']) + 0.3, { half: true, vel: 42, gain: 0.24, k0: 0 });

  // ---- live 4: i dieci dischi rimasti, la regola dell'Hell Factor (due fuori subito, due al ballottaggio), ESCONO IN 3
  const l4 = 'live-4';
  const tAv = E(l4, 4, 0.2);
  sezione(B(T[l4]), tAv, { vel: 44 });
  archi(B(cue(l4, 2)), B(tAv), { vel: 42, gain: 0.22 });
  archi(B(tAv), T.finale + 0.3, { vel: 44, gain: 0.3, ch: [MAG[3], MAG[3], MAG[3], MAG[3]] }); // il La resta sospeso sulla domanda e si risolve nel Re del finale
  [69, 73, 76, 81].forEach((m, j) => glock(E(l4, 4, 2.0) + j * BEAT / 2, m, 0.1)); // la camera si allarga su tutto lo schema
  for (let i = 0; i < 10; i++) glock(E(l4, 0, 0.4) + i * 0.125, [74, 76, 78, 81, 83, 86, 88, 90, 93, 95][i], 0.07); // i dieci dischi
  { const t = E(l4, 2, 0.2); clip(mix, 'passaggio', { t: t - 0.05, da: 0.5, durata: 0.9, gain: 0.1, fadeOut: 0.3, rev: 0.2 }); tom(t + 0.5, 60, -4); tom(t + 0.75, 60, -4); } // somma dei voti, due X
  rullo(E(l4, 3, 0.2), 1.0, 0.2); // l'anello del ballottaggio
  rullo(tAv - 1.0, 1.0, 0.24); ottoni(tAv, [45, 52, 57, 61, 64], { dur: BEAT * 2, gain: 0.44, vel: 84 }); crash(tAv, 0.3); kick(tAv, 72); // ESCONO IN 3

  // ---- finale: accordo pieno di Re, applausi
  const F = B(T.finale);
  ottoni(F, [50, 57, 62, 66, 69], { dur: BAR * 1.5, gain: 0.24, vel: 72 }); crash(F, 0.2); kick(F, 60);
  archi(F, T.END - 0.3, { vel: 44, gain: 0.26 });
  applausi(F + 0.2, T.END - F - 0.4, 0.07);
};
