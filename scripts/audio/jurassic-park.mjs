// Colonna sonora originale di Jurassic Park, discreta sotto la voce. Si bemolle maggiore, un solo tempo: 70 bpm
// (notte a metà passo; sabotaggio e fuga con la pulsazione a ottavi degli archi spiccati).
// Orchestra campionata (VSCO-2 CE e VCSL, CC0: scripts/audio/campioni.mjs): archi, corni, tromboni, pianoforte, arpa,
// marimba, glockenspiel, timpani e percussioni. Meraviglia all'arrivo (tema ampio, inventato qui), tensione con la
// tempesta e il sabotaggio, passi pesanti del T-rex agganciati ai cerchi nel bicchiere di Trex.tsx, notte cupa, mattina
// curiosa, scossa elettrica, cucina in punta di piedi; nella fuga il tema torna pieno con i corni. Nessun brano o tema
// del film. Effetti registrati (archivio CC0 di Craig Smith: scripts/audio/effetti.mjs); restano sintetiche solo le pale
// dell'elicottero (nessuna registrazione adatta). Effetti agganciati alle frasi dei sottotitoli (tempi come in ChapterOverlay).
import { put, rng } from './synth.mjs';
import { suona, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['violini', 'viole', 'celli', 'contrabbasso', 'violini_trem', 'celli_trem', 'celli_spicc', 'viole_spicc', 'contrabbasso_pizz', 'celli_pizz', 'arpa', 'pianoforte', 'marimba', 'glockenspiel', 'corno', 'trombone', 'timpani', 'grancassa', 'piatto_sospeso', 'gong'];
export const effetti = ['fuoco', 'torcia', 'vento_raffiche', 'pioggia_vento', 'pioggia_dura', 'tuono_classico', 'tuono_secco', 'tuono_forte', 'tuono_lontano', 'serratura', 'scatti', 'ceramica', 'colpi_cavi', 'metallo_schianto', 'metallo_cade', 'metallo_colpi', 'scariche', 'ronzio_tesla', 'telo', 'legno_cade', 'rombo', 'onde', 'cancello'];
/** Sala ampia e scura (giungla di notte, atrio del centro visitatori): coda lunga, alte un po' smorzate. */
export const sala = { rt60: 2.6, brillo: 6000, predelay: 0.03, wet: 0.5 };

const TAU = Math.PI * 2;
const SR = 44100;
const BPM = 70;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;

// Tema (16 tempi, Si bemolle maggiore): [tempo, nota MIDI, durata in tempi]
const THEME = [[0, 70, 1.5], [1.5, 69, 0.5], [2, 70, 2], [4, 74, 1.5], [5.5, 72, 0.5], [6, 70, 2],
  [8, 67, 1], [9, 70, 1], [10, 75, 2], [12, 74, 1], [13, 72, 1], [14, 70, 2]];
const CH = [[46, 50, 53], [51, 55, 58], [43, 46, 50], [41, 45, 48]]; // Si♭, Mi♭, Sol minore, Fa
const CH_MIN = [[46, 49, 53], [51, 54, 58], [43, 46, 50], [41, 45, 48]]; // Si♭ minore, Mi♭ minore, Sol minore, Fa

/** Piccolo scarto umano (±12 ms), deterministico. */
const umano = (t, k) => {
  const x = Math.sin(t * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x) - 0.5;
};

/**
 * Pale dell'elicottero: colpi di rumore filtrato a ritmo regolare (11 al secondo), volume secondo `level(x)`.
 * Sintetico: nell'archivio non c'è una registrazione di elicottero.
 */
const chopper = (mix, t0, t1, level, seed = 91) => {
  const r = rng(seed + Math.round(t0 * 1000));
  let lp = 0;
  put(mix, t0, Math.ceil((t1 - t0) * SR), (i) => {
    const x = i / SR;
    const ph = (x * 11) % 1;
    lp += 0.06 * ((r() * 2 - 1) - lp);
    return lp * Math.exp(-ph * 8) * 4 * level(x);
  }, { gain: 0.8, pan: 0.1, rev: 0.2 });
};

/** Arpa: arpeggio sull'accordo che sale per un'ottava e mezza. */
const harp = (mix, chord, t, { step = 0.12, vel = 54, gain = 0.45 } = {}) =>
  [...chord, ...chord.map((m) => m + 12), chord[0] + 24].forEach((m, j) => {
    const u = umano(t, j);
    suona(mix, 'arpa', m, { t: t + j * step + u * 0.02, dur: 1.6, vel: vel + u * 10, pan: -0.4 + j * 0.12, rev: 0.45, gain, release: 1.4 });
  });

/** Campanelli: glockenspiel acuto. */
const glock = (mix, m, t, vel = 50, pan = 0.3, gain = 0.18) => suona(mix, 'glockenspiel', m, { t, dur: 2, vel, pan, rev: 0.6, gain, release: 1.5 });

export default (mix, T) => {
  const { segments } = timeline(loadFilm('jurassic-park'));
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
  /** Battuta della griglia più vicina all'istante t: i cambi di sezione cadono sempre sul battere. */
  const B = (t) => Math.round(t / BAR) * BAR;
  const archi = { attack: 0.35, release: 1.1, rev: 0.5 };
  /** Colpo di timpano intonato. */
  const timp = (t, m, vel, gain = 0.7, seed = 1) => suona(mix, 'timpani', m, { t, dur: 1.4, vel, pan: -0.15, rev: 0.45, gain, release: 0.6, seed });
  /** Tuono dopo il lampo delle scene a t: lo schiocco della presa cade ~0,15 s dopo il lampo. */
  const TUONI = { classico: ['tuono_classico', 0.98, 5], secco: ['tuono_secco', 0.78, 4], forte: ['tuono_forte', 0.55, 5], lontano: ['tuono_lontano', 1.77, 5] };
  const tuono = (t, presa, gain, lp = 0) => {
    const [id, da, durata] = TUONI[presa];
    clip(mix, id, { t: t + 0.15, da, durata, gain, lp, fadeIn: 0.03, fadeOut: 1.2, rev: 0.35, pan: 0.1 });
  };
  const pioggia = (t0, t1, gain, lp = 0) =>
    clip(mix, 'pioggia_vento', { t: t0, da: 34, durata: t1 - t0, gain, lp, fadeIn: 0.8, fadeOut: 0.8, largo: 2.5, rev: 0.1 });

  /**
   * Il tema da `from` a `to` (allineati alla griglia). minor: versione cupa. half: a metà passo. keep: probabilità di ogni
   * nota della melodia. horns: i corni raddoppiano la melodia e i timpani segnano gli accordi (0 = niente). big: contrabbasso
   * e violini in più. harpVel: arpa su ogni accordo (0 = niente). str 0 = niente archi.
   */
  const theme = (from, to, { vel = 54, str = 40, minor = false, half = false, keep = 1, horns = 0, big = false, harpVel = 0, seed = 1 } = {}) => {
    const k = half ? 2 : 1, beat = BEAT * k, loop = 16 * beat;
    const R = rng(9000 + seed);
    const chords = minor ? CH_MIN : CH;
    for (let L = from; L < to - 0.3; L += loop) {
      for (let b = 0; b < 4; b++) {
        const t = L + b * 4 * beat;
        if (t >= to - 0.4) break;
        const d = Math.min(4 * beat, to - t);
        const [a, c, e] = chords[b];
        if (str) {
          suona(mix, 'celli', a, { t, dur: d, vel: str, pan: -0.35, gain: 0.45, ...archi, seed: seed + b });
          suona(mix, 'viole', c, { t, dur: d, vel: str - 4, pan: 0.1, gain: 0.36, ...archi, seed: seed + b + 1 });
          suona(mix, 'viole', e, { t, dur: d, vel: str - 4, pan: 0.3, gain: 0.32, ...archi, seed: seed + b + 2 });
        }
        if (big) {
          suona(mix, 'contrabbasso', a - 12, { t, dur: d, vel: str, pan: -0.1, gain: 0.42, ...archi });
          suona(mix, 'violini', e + 12, { t, dur: d, vel: str, pan: -0.2, gain: 0.28, attack: 0.5, release: 1.3, rev: 0.6 });
        }
        if (horns) {
          suona(mix, 'trombone', a - 12, { t, dur: d * 0.9, vel: horns - 6, pan: -0.25, gain: 0.25, attack: 0.15, release: 0.8, rev: 0.55 });
          timp(t, a - 12 < 40 ? a - 12 : a - 24, horns + 10, 0.6, seed + b);
        }
        if (harpVel) harp(mix, chords[b], t, { step: beat / 3, vel: harpVel });
      }
      for (const [b, m0, dd] of THEME) {
        const t = L + b * beat;
        if (t >= to - 0.2 || R() > keep) continue;
        const m = minor && m0 % 12 === 2 ? m0 - 1 : m0; // Re→Re♭
        const u = umano(t, b);
        const dur = Math.min(dd * beat * 1.1, to - t);
        suona(mix, 'pianoforte', m, { t: t + u * 0.02, dur, vel: vel + u * 10, pan: 0.1, rev: 0.4, gain: 0.5, release: 1 });
        if (horns) suona(mix, 'corno', m - 12, { t, dur, vel: horns, pan: 0.15, gain: 0.35, attack: 0.08, release: 0.6, rev: 0.55, seed: b });
      }
    }
  };

  /** Pulsazione nervosa: archi spiccati a ottavi sulla nota indicata, accento ogni quattro. */
  const pulsa = (from, to, n, vel = 60, gain = 0.4) => {
    for (let t = from, k = 0; t < to - 0.1; t += BEAT / 2, k++) {
      suona(mix, 'celli_spicc', n, { t, dur: 0.25, vel: vel + (k % 4 === 0 ? 14 : 0), pan: -0.25, rev: 0.3, gain, release: 0.2, seed: k });
      if (k % 2) suona(mix, 'viole_spicc', n + 12, { t, dur: 0.2, vel: vel - 8, pan: 0.3, rev: 0.3, gain: gain * 0.7, release: 0.2, seed: k });
    }
  };

  /** Ruggito: tromboni e corni gravi in fortissimo, cluster che cresce e cala, con un rombo sotto. */
  const ruggito = (t, dur = 1.6, gain = 0.4) => {
    [[34, 'trombone'], [35, 'trombone'], [41, 'corno'], [46, 'corno']].forEach(([m, id], k) =>
      suona(mix, id, m, { t: t + k * 0.03, dur, vel: 110, pan: -0.3 + k * 0.2, gain: gain * (id === 'corno' ? 0.8 : 1), attack: 0.12, release: 0.5, rev: 0.6, seed: 60 + k }));
    clip(mix, 'rombo', { t, da: 31, durata: dur + 0.4, gain: gain * 0.9, fadeIn: 0.1, fadeOut: 0.6, largo: 2 });
  };

  // ---- copertina: corni gravi e timpano, il fuoco delle torce
  suona(mix, 'corno', 46, { t: 0.2, dur: 3.4, vel: 64, pan: -0.1, gain: 0.5, attack: 0.4, release: 1, rev: 0.6 });
  suona(mix, 'corno', 53, { t: 0.5, dur: 3.1, vel: 58, pan: 0.15, gain: 0.42, attack: 0.4, release: 1, rev: 0.6 });
  timp(0.2, 34, 80);
  clip(mix, 'fuoco', { t: 0, da: 1, durata: T.ambra + 0.5, gain: 0.18, fadeIn: 0.4, fadeOut: 0.6, largo: 3, rev: 0.15 });
  clip(mix, 'torcia', { t: 1.6, da: 6.35, durata: 1.2, gain: 0.2, fadeIn: 0.2, fadeOut: 0.5, pan: 0.3, rev: 0.25 });

  // ---- ambra: laboratorio di notte, archi sospesi, campanelli lenti e un luccichio quando la luce accende l'ambra
  [58, 65, 70].forEach((m, j) => suona(mix, ['celli', 'viole', 'violini'][j], m, { t: B(T.ambra), dur: T.esperti - B(T.ambra), vel: 38, pan: (j - 1) * 0.4, gain: 0.32, attack: 1.8, release: 1.2, rev: 0.6, seed: 10 + j }));
  for (let t = B(T.ambra) + BEAT, k = 0; t < T.esperti - 0.5; t += BEAT, k++) glock(mix, [82, 86, 89, 86][k % 4], t, 34, 0.3, 0.12);
  [82, 86, 89, 94].forEach((m, j) => glock(mix, m, cue('ambra', 3) + j * 0.12, 54, -0.3 + j * 0.2, 0.2));
  harp(mix, CH[0], cue('ambra', 3), { step: 0.08, vel: 50 });

  // ---- esperti: l'elicottero scende (vento delle pale), nasce il tema della meraviglia con i corni
  chopper(mix, T.esperti, T.laboratorio, (x) => Math.min(1, x / 1) * (x < 7 ? 1 : Math.max(0, 1 - (x - 7) / 2)) * 0.4);
  clip(mix, 'vento_raffiche', { t: T.esperti, da: 15, durata: cue('esperti', 2) + 1.5 - T.esperti, gain: 0.14, fadeIn: 1, fadeOut: 1.4, largo: 2 });
  theme(B(T.esperti), B(T.laboratorio), { vel: 52, str: 42, horns: 54, harpVel: 46, keep: 0.95, seed: 2 });

  // ---- laboratorio: meraviglia piccola; l'uovo si crepa (seconda frase, 1 s) e si apre
  theme(B(T.laboratorio), B(T.visita), { vel: 58, str: 46, keep: 0.9, harpVel: 44, seed: 3 });
  for (let k = 0; k < 4; k++) clip(mix, 'scatti', { t: cue('laboratorio', 1) + 0.1 + k * 0.25, da: [1.1, 6.5, 12.65, 19.5][k], durata: 0.1, gain: 0.12 + k * 0.03, rate: 1.4, pan: 0.1, rev: 0.25 });
  clip(mix, 'ceramica', { t: cue('laboratorio', 1) + 1.0, da: 0.3, durata: 0.6, gain: 0.18, lp: 4000, fadeOut: 0.3, rev: 0.3 });
  [77, 82, 86].forEach((m, j) => suona(mix, 'marimba', m, { t: cue('laboratorio', 1) + 1.2 + j * 0.14, dur: 0.6, vel: 60, pan: -0.2 + j * 0.2, rev: 0.4, gain: 0.3, release: 0.5 }));
  [86, 89].forEach((m, j) => glock(mix, m, cue('laboratorio', 2) + j * 0.2, 46)); // i cartellini «F»

  // ---- visita: il giro in jeep, poi la tempesta che arriva (lampo alla quarta frase + 0,6 s)
  theme(B(T.visita), B(cue('visita', 3)), { vel: 56, str: 44, keep: 0.9, harpVel: 40, seed: 4 });
  clip(mix, 'vento_raffiche', { t: cue('visita', 3) - 0.6, da: 10, durata: T.sabotaggio + 1 - cue('visita', 3), gain: 0.2, fadeIn: 1, fadeOut: 1, largo: 3 });
  tuono(cue('visita', 3) + 0.6, 'classico', 0.3);
  [46, 49, 53].forEach((m, j) => suona(mix, ['celli', 'viole', 'viole'][j], m, { t: B(cue('visita', 3)), dur: T.sabotaggio - B(cue('visita', 3)), vel: 40, pan: (j - 1) * 0.4, gain: 0.35, attack: 1, release: 1, rev: 0.5, seed: 40 + j }));

  // ---- sabotaggio: pioggia, pulsazione nervosa; allarme quando si spengono le zone; la bomboletta che si svita
  pioggia(T.sabotaggio, T.notte, 0.2);
  tuono(T.sabotaggio + 1.2, 'lontano', 0.35); // lampo di Sabotaggio.tsx
  pulsa(B(T.sabotaggio), B(T.trex), 46, 58, 0.4);
  suona(mix, 'contrabbasso', 34, { t: B(T.sabotaggio), dur: B(T.trex) - B(T.sabotaggio), vel: 44, gain: 0.4, attack: 1, release: 0.8, rev: 0.4 });
  // allarme: due note acute alternate del glockenspiel, come una sirena d'ufficio (si accende con le zone rosse)
  for (let t = cue('sabotaggio', 2), k = 0; t < cue('sabotaggio', 2) + 3; t += 0.4, k++) glock(mix, k % 2 ? 91 : 88, t, 60, 0.4, 0.2);
  suona(mix, 'violini_trem', 70, { t: cue('sabotaggio', 2), dur: cue('sabotaggio', 4) - cue('sabotaggio', 2), vel: 48, pan: 0.4, gain: 0.2, attack: 0.6, release: 0.5, rev: 0.5 });
  clip(mix, 'serratura', { t: cue('sabotaggio', 3) + 0.2, da: 2.45, durata: 0.5, gain: 0.35, pan: 0.2, rev: 0.25 }); // la bomboletta si svita
  clip(mix, 'scatti', { t: cue('sabotaggio', 4), da: 6.5, durata: 0.12, gain: 0.25, rev: 0.25 }); // «le recinzioni si spengono»

  // ---- trex: silenzio, poi i passi (in sincronia con i cerchi nel bicchiere), il ruggito, il recinto, la jeep
  pioggia(T.trex, T.notte, 0.16);
  [0, 1, 2, 3, 4].forEach((k) => {
    const t = cue('trex', 1) + 0.2 + k * 1.1; // come steps in Trex.tsx
    colpo(mix, 'grancassa', k > 2 ? 'bdrum_ff' : 'bdrum_f', { t, vel: 90 + k * 6, rev: 0.45, gain: 0.45 + k * 0.06, seed: k });
    clip(mix, 'colpi_cavi', { t: t - 0.01, da: [0.5, 3.4, 9.15, 0.5, 3.4][k], durata: 0.5, gain: 0.3 + k * 0.05, lp: 700, fadeOut: 0.2, rev: 0.4 });
    timp(t, 34, 70 + k * 6, 0.5, k);
  });
  // il recinto cede: lampo (cues[2] + 0,1), lamiere e cavi che si spezzano, scintille; il ruggito (cues[2] + 0,5)
  tuono(cue('trex', 2) + 0.1, 'forte', 0.3);
  clip(mix, 'metallo_schianto', { t: cue('trex', 2) - 0.2, da: 0.05, durata: 1.4, gain: 0.35, fadeOut: 0.5, rev: 0.4 });
  clip(mix, 'scariche', { t: cue('trex', 2), da: 11.25, durata: 1.2, gain: 0.25, fadeOut: 0.5, rev: 0.25, pan: 0.3 });
  ruggito(cue('trex', 2) + 0.5, 1.6, 0.42);
  [34, 35, 41].forEach((m, j) => suona(mix, j === 2 ? 'celli_trem' : 'celli', m + 12, { t: cue('trex', 2) + 0.3, dur: T.notte - cue('trex', 2) - 0.3, vel: 46, pan: (j - 1) * 0.4, gain: 0.32, attack: 0.3, release: 1, rev: 0.5, seed: 60 + j }));
  // la jeep si rovescia: secondo ruggito, lampo, lamiere
  ruggito(cue('trex', 4), 1.1, 0.36);
  tuono(cue('trex', 4) + 0.2, 'secco', 0.25);
  clip(mix, 'metallo_cade', { t: cue('trex', 4) + 0.4, da: 0.62, durata: 2, gain: 0.4, fadeOut: 0.6, rev: 0.35 });
  colpo(mix, 'grancassa', 'bdrum_ff', { t: cue('trex', 4) + 0.5, vel: 100, rev: 0.5, gain: 0.5 });
  clip(mix, 'torcia', { t: cue('trex', 5), da: 6.35, durata: 0.9, gain: 0.25, fadeOut: 0.3, rev: 0.25, pan: -0.2 }); // la torcia

  // ---- notte: pioggia, tema cupo a metà passo; la pioggia cala sull'albero
  pioggia(T.notte, T.uova - 0.2, 0.18);
  theme(B(T.notte), B(T.uova), { vel: 56, str: 50, minor: true, half: true, keep: 0.75, seed: 6 });
  suona(mix, 'contrabbasso', 34, { t: B(T.notte), dur: B(T.uova) - B(T.notte), vel: 40, gain: 0.35, attack: 1.2, release: 1.2, rev: 0.4 });

  // ---- uova: mattina, marimba curiosa, impronte piccole (seconda frase), il salto della rana (quinta frase)
  clip(mix, 'vento_raffiche', { t: T.uova, da: 40, durata: T.corrente - T.uova, gain: 0.07, lp: 1500, fadeIn: 1.5, fadeOut: 1.5, largo: 2 });
  for (let t = B(T.uova) + BEAT / 2, k = 0; t < T.corrente - 0.6; t += BEAT / 2 * (k % 3 === 2 ? 2 : 1), k++) suona(mix, 'marimba', [70, 74, 77, 74, 79, 77][k % 6], { t, dur: 0.6, vel: 60 + (k % 2) * 8, pan: 0.3, rev: 0.4, gain: 0.5, release: 0.5 });
  [58, 62, 65].forEach((m, j) => suona(mix, ['celli', 'viole', 'violini'][j], m, { t: B(T.uova), dur: T.corrente - B(T.uova), vel: 44, pan: (j - 1) * 0.4, gain: 0.4, attack: 1.5, release: 1.2, rev: 0.55, seed: 70 + j }));
  for (let k = 0; k < 4; k++) suona(mix, 'celli_pizz', [58, 62, 65, 70][k], { t: cue('uova', 1) + k * 0.35, dur: 0.3, vel: 64, pan: -0.3 + k * 0.15, rev: 0.35, gain: 0.35, release: 0.3 });
  suona(mix, 'contrabbasso_pizz', 46, { t: cue('uova', 4), dur: 0.4, vel: 80, pan: 0.2, rev: 0.3, gain: 0.45, release: 0.3 }); // il salto
  clip(mix, 'onde', { t: cue('uova', 4) + 0.35, da: 7.2, durata: 0.5, gain: 0.12, fadeIn: 0.02, fadeOut: 0.3, rev: 0.2, pan: 0.2 });

  // ---- corrente: le gabbie si aprono (seconda frase), la leva, le lampade che si accendono in fila, la scossa
  clip(mix, 'cancello', { t: cue('corrente', 1), da: 2.85, durata: 2.4, gain: 0.3, fadeOut: 0.8, rev: 0.35 });
  for (let t = cue('corrente', 1), k = 0; t < cue('corrente', 1) + 2.4; t += 0.4, k++) glock(mix, k % 2 ? 91 : 88, t, 54, 0.4, 0.16);
  [46, 47].forEach((m, j) => suona(mix, 'celli_trem', m + 12, { t: cue('corrente', 1), dur: cue('corrente', 3) - cue('corrente', 1), vel: 50, pan: (j - 0.5) * 0.6, gain: 0.3, attack: 0.5, release: 0.6, rev: 0.5, seed: 80 + j }));
  clip(mix, 'serratura', { t: cue('corrente', 3) - 0.1, da: 5.55, durata: 0.6, gain: 0.45, pan: -0.2, rev: 0.25 }); // la leva
  for (let i = 0; i < 6; i++) clip(mix, 'scatti', { t: cue('corrente', 3) + 0.3 + i * 0.25, da: [1.1, 6.5, 12.65, 15.8, 19.5, 1.7][i], durata: 0.12, gain: 0.25, pan: -0.5 + i * 0.2, rev: 0.3 });
  clip(mix, 'ronzio_tesla', { t: cue('corrente', 3) + 0.3, da: 3, durata: cue('corrente', 4) + 1.2 - cue('corrente', 3), gain: 0.16, fadeIn: 1.2, fadeOut: 0.3, rev: 0.2 });
  [70, 74, 77, 82].forEach((m, j) => suona(mix, 'violini', m, { t: cue('corrente', 3) + 0.3 + j * 0.25, dur: cue('corrente', 4) + 1.2 - cue('corrente', 3) - j * 0.25, vel: 40 + j * 4, pan: -0.3 + j * 0.2, gain: 0.2, attack: 0.3, release: 0.6, rev: 0.55 }));
  clip(mix, 'scariche', { t: cue('corrente', 4) + 1.2, da: 18.35, durata: 0.9, gain: 0.45, fadeOut: 0.3, rev: 0.25 }); // la scossa
  tuono(cue('corrente', 4) + 1.1, 'secco', 0.18, 2500);

  // ---- cucina: in punta di piedi (pizzicati dei violoncelli); la maniglia, la pentola che cade, il computer, la porta bloccata
  for (let t = B(T.cucina) + BEAT, k = 0; t < T.fuga - 0.4; t += BEAT, k++) suona(mix, 'celli_pizz', [46, 47, 46, 49][k % 4], { t, dur: 0.5, vel: 58, pan: -0.2, rev: 0.3, gain: 0.45, release: 0.3 });
  [58, 59].forEach((m, j) => suona(mix, 'violini', m + 12, { t: B(T.cucina), dur: T.fuga - B(T.cucina), vel: 30, pan: (j - 0.5) * 0.6, gain: 0.2, attack: 2, release: 1.2, rev: 0.6, seed: 90 + j }));
  clip(mix, 'serratura', { t: cue('cucina', 0) + 1.2, da: 13.6, durata: 0.35, gain: 0.3, pan: 0.3, rev: 0.25 }); // la maniglia si abbassa
  [0, 1].forEach((k) => clip(mix, 'metallo_colpi', { t: cue('cucina', 1) + k * 0.15, da: [1.0, 3.2][k], durata: 0.3, gain: 0.2, pan: 0.2, rev: 0.35 })); // mestoli urtati
  clip(mix, 'metallo_cade', { t: cue('cucina', 1) + 0.8 - 0.1, da: 1.25, durata: 1.8, gain: 0.45, fadeOut: 0.6, rev: 0.35 }); // la pentola tocca terra
  [0, 1, 2].forEach((k) => glock(mix, 96, cue('cucina', 2) + 0.2 + k * 0.15, 40, -0.4, 0.1)); // il computer si accende
  clip(mix, 'serratura', { t: cue('cucina', 3) - 0.05, da: 2.45, durata: 0.5, gain: 0.5, pan: -0.2, rev: 0.25 }); // porte bloccate
  colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_roll2_cresc', { t: cue('cucina', 3) - 1.2, vel: 60, rev: 0.4, gain: 0.22, dur: 1.2, release: 0.3 });

  // ---- fuga: la lotta (timpani e archi spiccati), lo striscione che crolla, poi il tema pieno con i corni e l'elicottero
  pulsa(B(T.fuga), B(cue('fuga', 3)), 46, 66, 0.45);
  for (let t = cue('fuga', 1), k = 0; t < cue('fuga', 2) + 0.8; t += BEAT / 2, k++) timp(t, k % 2 ? 41 : 34, 76 + (k % 4 === 0 ? 14 : 0), 0.55, k);
  ruggito(cue('fuga', 1) - 0.2, 1.2, 0.34);
  clip(mix, 'telo', { t: cue('fuga', 2), da: 11.15, durata: 1.0, gain: 0.35, fadeOut: 0.3, rev: 0.3 });
  clip(mix, 'legno_cade', { t: cue('fuga', 2) + 1.1, durata: 0.8, gain: 0.45, rate: 0.8, rev: 0.4 });
  colpo(mix, 'grancassa', 'bdrum_ff', { t: cue('fuga', 2) + 1.2, vel: 110, rev: 0.5, gain: 0.55 });
  colpo(mix, 'gong', 'gong_hit_p', { t: cue('fuga', 2) + 1.22, vel: 80, rev: 0.5, gain: 0.3, dur: 2.5, release: 0.8 });
  chopper(mix, cue('fuga', 3), T.finale + 1, (x) => Math.min(1, x / 0.8) * Math.max(0.2, 1 - x / 8) * 0.3);
  theme(B(cue('fuga', 3)), B(T.finale), { vel: 62, str: 54, horns: 64, big: true, harpVel: 50, seed: 7 });
  [94, 98, 101].forEach((m, j) => glock(mix, m, cue('fuga', 5) + j * 0.15, 46, -0.3 + j * 0.3)); // gli uccelli sul mare

  // ---- finale: accordo ampio di Si bemolle con corni, tromboni e timpano
  const F = B(T.finale);
  [['contrabbasso', 34], ['celli', 46], ['viole', 53], ['viole', 58], ['violini', 62], ['violini', 65]].forEach(([id, n], k) =>
    suona(mix, id, n, { t: F, dur: 2.8, vel: 60, pan: (k - 2.5) * 0.2, gain: 0.42, attack: 0.3, release: 1.4, rev: 0.6, seed: 100 + k }));
  [[46, 'corno'], [53, 'corno'], [34, 'trombone']].forEach(([m, id], k) => suona(mix, id, m, { t: F, dur: 2.8, vel: 64, pan: -0.2 + k * 0.2, gain: 0.3, attack: 0.25, release: 1.2, rev: 0.6, seed: 110 + k }));
  timp(F, 34, 96, 0.7);
  harp(mix, CH[0], F + 0.2, { step: 0.08, vel: 58 });
};
