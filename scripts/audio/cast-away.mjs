// Colonna sonora originale di Cast Away, discreta sotto la voce. Re maggiore, un solo tempo: 72 bpm
// (isola, anni e ritorno a metà passo; la fuga sulla zattera a passo pieno con i timpani).
// Orchestra campionata (VSCO-2 CE e VCSL, CC0: scripts/audio/campioni.mjs): pianoforte, archi, arpa, marimba,
// glockenspiel, corno e percussioni. All'inizio l'orologio e un ostinato di pizzicati che corre; poi la tempesta;
// sull'isola quasi silenzio (onde e vento); il tema caldo nasce con la zattera, si fa triste con Wilson perso in mare
// e sotto la pioggia di Memphis, e si apre al bivio finale. Tema inventato qui, nessun brano o tema del film.
// Effetti registrati (archivio CC0 di Craig Smith: scripts/audio/effetti.mjs), agganciati agli eventi delle scene
// in src/scenes/cast-away/ (tempi delle frasi come in ChapterOverlay).
import { suona, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';
import { rng } from './synth.mjs';

export const strumenti = ['violini', 'viole', 'celli', 'contrabbasso', 'violini_trem', 'celli_trem', 'violini_pizz', 'contrabbasso_pizz', 'arpa', 'pianoforte', 'marimba', 'glockenspiel', 'corno', 'organo_pedale', 'timpani', 'grancassa', 'piatto_sospeso'];
export const effetti = ['onde', 'onde_tonanti', 'pioggia_vento', 'pioggia_dura', 'vento_raffiche', 'vento_leggero', 'tuono_classico', 'tuono_secco', 'esplosioni', 'metallo_schianto', 'telo', 'stoffa', 'scatti', 'sacchi', 'colpi_cavi', 'torcia', 'fiammata', 'fuoco', 'porta_cigolio', 'porta_sbatte', 'rombo', 'sirena_nebbia'];
/** Sala media e luminosa: coda moderata, alte aperte (mare, cielo). */
export const sala = { rt60: 2.2, brillo: 7000, predelay: 0.02, wet: 0.45 };

const BPM = 72;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;

// Tema (16 tempi, Re maggiore): [tempo, nota MIDI, durata in tempi]
const THEME = [[0, 66, 1], [1, 69, 1], [2, 74, 2], [4, 73, 1], [5, 71, 1], [6, 69, 2],
  [8, 66, 1], [9, 64, 1], [10, 62, 1.5], [11.5, 64, 0.5], [12, 66, 3]];
// accordi per battuta: Re, Si minore, Sol, La (maggiore) / Re minore, Si♭, Sol minore, La (minore)
const CH_MAJ = [[50, 54, 57], [47, 50, 54], [43, 47, 50], [45, 49, 52]];
const CH_MIN = [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]];

/** Piccolo scarto umano (±12 ms), deterministico. */
const umano = (t, k) => {
  const x = Math.sin(t * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x) - 0.5;
};

/** Arpa: arpeggio sull'accordo che sale per un'ottava e mezza. */
const harp = (mix, chord, t, { step = 60 / 72 / 8, vel = 54, gain = 0.45 } = {}) =>
  [...chord, ...chord.map((m) => m + 12), chord[0] + 24].forEach((m, j) => {
    const u = umano(t, j);
    suona(mix, 'arpa', m, { t: t + j * step + u * 0.02, dur: 1.6, vel: vel + u * 10, pan: -0.4 + j * 0.12, rev: 0.45, gain, release: 1.4 });
  });

/** Campanelli: glockenspiel acuto, lontano. */
const glock = (mix, m, t, vel = 52, pan = 0.3, gain = 0.18) => suona(mix, 'glockenspiel', m, { t, dur: 2, vel, pan, rev: 0.6, gain, release: 1.5 });

export default (mix, T) => {
  const { segments } = timeline(loadFilm('cast-away'));
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
  const B = (t) => T.tempo + Math.round((t - T.tempo) / BAR) * BAR; // griglia che parte dalla fine della copertina, come nelle scene
  /** Come `griglia` delle scene: istante assoluto arrotondato a 1/div di battito. */
  const G = (t, div = 2) => T.tempo + Math.round((t - T.tempo) / (BEAT / div)) * (BEAT / div);
  const archi = { attack: 0.35, release: 1.1, rev: 0.5 };
  /** Colpo di timpano intonato (Re o La gravi). */
  const timp = (t, m, vel, gain, seed = 1) => suona(mix, 'timpani', m, { t, dur: 1.2, vel, pan: -0.15, rev: 0.45, gain, release: 0.6, seed });

  /**
   * Il tema da `from` a `to` (allineati alla griglia). minor: versione triste. half: a metà passo (accordi di due
   * battute, melodia lenta). keep: probabilità di ogni nota della melodia. str 0 = niente archi. big: contrabbasso,
   * violini e corno in più. harpVel: arpa su ogni accordo (0 = niente). mar: la melodia raddoppiata dalla marimba.
   */
  const theme = (from, to, { vel = 56, str = 40, minor = false, half = false, keep = 1, big = false, harpVel = 0, mar = false, seed = 1, sg = 1 } = {}) => {
    const k = half ? 2 : 1, beat = BEAT * k, loop = 16 * beat;
    const R = rng(7000 + seed);
    const chords = minor ? CH_MIN : CH_MAJ;
    for (let L = from; L < to - 0.3; L += loop) {
      for (let b = 0; b < 4; b++) {
        const t = L + b * 4 * beat;
        if (t >= to - 0.4) break;
        const d = Math.min(4 * beat, to - t);
        const [a, c, e] = chords[b];
        if (str) {
          suona(mix, 'celli', a, { t, dur: d, vel: str, pan: -0.35, gain: 0.45 * sg, ...archi, seed: seed + b });
          suona(mix, 'viole', c, { t, dur: d, vel: str - 4, pan: 0.1, gain: 0.36 * sg, ...archi, seed: seed + b + 1 });
          suona(mix, 'viole', e, { t, dur: d, vel: str - 4, pan: 0.3, gain: 0.32 * sg, ...archi, seed: seed + b + 2 });
        }
        suona(mix, 'pianoforte', a - 12, { t, dur: beat * 3, vel: vel * 0.75, pan: -0.2, rev: 0.4, gain: 0.4, release: 1.2 });
        if (big) {
          suona(mix, 'contrabbasso', a - 12, { t, dur: d, vel: str, pan: -0.1, gain: 0.42, ...archi });
          suona(mix, 'violini', e + 12, { t, dur: d, vel: str, pan: -0.2, gain: 0.28, attack: 0.5, release: 1.3, rev: 0.6 });
          suona(mix, 'corno', c, { t, dur: d, vel: str - 6, pan: 0.25, gain: 0.22, attack: 0.4, release: 1, rev: 0.55 });
        }
        if (harpVel) harp(mix, chords[b], t, { step: beat / 3, vel: harpVel });
      }
      for (const [b, m0, dd] of THEME) {
        const t = L + b * beat;
        if (t >= to - 0.2 || R() > keep) continue;
        const m = minor && (m0 % 12 === 6 || m0 % 12 === 11) ? m0 - 1 : m0; // Fa♯→Fa, Si→Si♭
        const u = umano(t, b);
        const dur = Math.min(dd * beat * 1.1, to - t);
        suona(mix, 'pianoforte', m, { t: t + u * 0.02, dur, vel: vel + u * 10, pan: 0.1, rev: 0.4, gain: 0.55, release: 1 });
        if (mar) suona(mix, 'marimba', m + 12, { t: t + 0.005, dur: Math.min(dur, 1.2), vel: vel * 0.8, pan: 0.35, rev: 0.4, gain: 0.25, release: 0.6 });
      }
    }
  };

  /** Onde sulla spiaggia: tappeto stereo; lp le allontana (dentro la grotta, in mare aperto). */
  const onde = (t0, t1, da, gain, lp = 0) =>
    clip(mix, 'onde', { t: t0, da, durata: t1 - t0, gain, lp, fadeIn: 1.5, fadeOut: 1.5, largo: 3, rev: 0.1 });

  // ---- copertina: arpa che sale sull'accordo di Re, campanelli, risacca
  harp(mix, CH_MAJ[0], 0.2, { step: BEAT / 8, vel: 56 });
  [86, 90, 93].forEach((m, j) => glock(mix, m, 1.4 + j * 0.25, 48, -0.3 + j * 0.3));
  onde(0, T.tempo + 1.5, 1, 0.2);

  // ---- tempo: l'orologio scatta a ogni secondo (la lancetta salta sugli interi in Tempo.tsx); ostinato di pizzicati
  // a ottavi che corre sopra un pedale degli archi; dalla terza frase entra il contrabbasso e la corsa si fa più forte
  for (let s = 1; s < 10; s++) clip(mix, 'scatti', { t: T.tempo + s - 0.01, da: 12.65, durata: 0.12, gain: 0.22 + (s > 4 ? 0.06 : 0), pan: 0.15, rev: 0.2 });
  const ost = [62, 66, 69, 66, 62, 64, 67, 64];
  for (let t = B(T.tempo), k = 0; t < T.promessa - 0.3; t += BEAT / 2, k++) {
    const forte = t > cue('tempo', 2);
    suona(mix, 'violini_pizz', ost[k % 8] + 12, { t, dur: 0.3, vel: (forte ? 74 : 62) + (k % 2 ? -8 : 0), pan: 0.25, rev: 0.3, gain: 0.75, release: 0.3 });
    if (forte && k % 4 === 0) suona(mix, 'contrabbasso_pizz', 38, { t, dur: BEAT, vel: 80, pan: -0.1, rev: 0.25, gain: 0.7, release: 0.3 });
  }
  [50, 57, 62].forEach((m, j) => suona(mix, ['celli', 'viole', 'violini'][j], m, { t: B(T.tempo), dur: T.promessa - B(T.tempo), vel: 40, pan: (j - 1) * 0.3, gain: 0.45, attack: 0.6, release: 1.2, rev: 0.5 }));
  // il cercapersone di Kelly vibra a ogni battito, ignorato (Tempo.tsx)
  for (let t = G(cue('tempo', 3), 1); t < T.promessa - 0.2; t += BEAT) glock(mix, 96, t, 46, 0.4, 0.1);

  // ---- promessa: il tema nasce piano, dolce; campanelli quando si apre l'orologio da tasca (seconda frase)
  theme(B(T.promessa), B(T.schianto), { vel: 56, str: 40, keep: 0.85, harpVel: 40, seed: 2 });
  const WATCH = G(cue('promessa', 1) + 0.4), GIFT = G(cue('promessa', 2) + 0.2), TICKET = G(cue('promessa', 3) + 0.3); // come in Promessa.tsx
  clip(mix, 'scatti', { t: WATCH - 0.02, da: 1.1, durata: 0.15, gain: 0.3, rev: 0.25 }); // l'orologio si apre
  [86, 90, 93].forEach((m, j) => glock(mix, m, WATCH + j * BEAT / 8, 50, -0.3 + j * 0.3));
  [81, 86].forEach((m, j) => glock(mix, m, GIFT + j * BEAT / 4, 46, 0.4)); // la scatolina con l'anello
  clip(mix, 'rombo', { t: TICKET + 0.1, da: 31, durata: T.schianto - TICKET + 0.5, gain: 0.08, lp: 400, fadeIn: 0.6, fadeOut: 0.8, largo: 2 }); // l'aereo comincia a muoversi
  clip(mix, 'stoffa', { t: TICKET - 0.05, da: 1, durata: 0.5, gain: 0.25, fadeOut: 0.2, rev: 0.25, pan: 0.3 }); // il biglietto del ritorno

  // ---- schianto: tempesta, motore che cede (tremoli e timpani), lampo, impatto in mare; poi il gommone che si gonfia
  const STRIKE = G(cue('schianto', 1) + 0.35), IMPACT = G(cue('schianto', 2) + 0.8), RAFT = G(cue('schianto', 3) + 0.2); // come in Schianto.tsx
  clip(mix, 'pioggia_vento', { t: T.schianto - 0.3, da: 34, durata: T.isola - T.schianto, gain: 0.25, fadeIn: 0.8, fadeOut: 1.2, largo: 2.5, rev: 0.1 });
  clip(mix, 'vento_raffiche', { t: T.schianto, da: 10, durata: T.isola - T.schianto - 0.5, gain: 0.22, fadeIn: 1, fadeOut: 1.2, largo: 3 });
  [50, 51].forEach((m, j) => suona(mix, 'celli_trem', m, { t: B(T.schianto), dur: IMPACT - B(T.schianto), vel: 54, pan: (j - 0.5) * 0.6, gain: 0.32, attack: 0.8, release: 0.4, rev: 0.5 }));
  suona(mix, 'violini_trem', 69, { t: cue('schianto', 1), dur: IMPACT - cue('schianto', 1), vel: 50, pan: 0.4, gain: 0.22, attack: 1, release: 0.3, rev: 0.55 });
  suona(mix, 'contrabbasso', 38, { t: B(T.schianto), dur: IMPACT - B(T.schianto), vel: 50, gain: 0.42, attack: 0.8, release: 0.5, rev: 0.4 });
  clip(mix, 'tuono_classico', { t: STRIKE + 0.05, da: 0.45, durata: 4, gain: 0.26, fadeIn: 0.03, fadeOut: 1.4, rev: 0.35 }); // il fulmine colpisce
  clip(mix, 'fiammata', { t: STRIKE + 0.1, da: 0.25, durata: 1.2, gain: 0.3, fadeOut: 0.5, rev: 0.3, pan: -0.2 }); // il motore prende fuoco
  // il motore cede: rullo dei timpani che cresce fino all'impatto
  for (let t = IMPACT - 2.4, k = 0; t < IMPACT - 0.05; t += BEAT / 9, k++) timp(t, 38, 46 + (k * 50) / 27, 0.3 + k * 0.012, k);
  clip(mix, 'esplosioni', { t: IMPACT - 0.05, da: 30.2, durata: 2.4, gain: 0.3, fadeIn: 0.02, fadeOut: 1.6, rev: 0.35 });
  clip(mix, 'metallo_schianto', { t: IMPACT - 0.03, da: 0.05, durata: 1.4, gain: 0.35, fadeOut: 0.5, rev: 0.4 });
  clip(mix, 'tuono_secco', { t: IMPACT - 0.05 + 0.15, da: 0.78, durata: 3, gain: 0.18, fadeIn: 0.03, fadeOut: 1, rev: 0.35, lp: 3000 }); // secondo lampo
  colpo(mix, 'grancassa', 'bdrum_f', { t: IMPACT, vel: 100, rev: 0.5, gain: 0.5 });
  colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_roll2_cresc', { t: IMPACT - 1.3, vel: 70, rev: 0.4, gain: 0.3, dur: 1.4, release: 0.3 });
  clip(mix, 'onde_tonanti', { t: IMPACT + 0.3, da: 5.9, durata: 4, gain: 0.4, fadeIn: 0.3, fadeOut: 1.5, largo: 2.5, rev: 0.2 });
  clip(mix, 'telo', { t: RAFT - 0.05, da: 11.15, durata: 0.9, gain: 0.35, fadeOut: 0.3, rev: 0.25, pan: 0.2 }); // il gommone si gonfia
  [62, 66, 69].forEach((m, j) => suona(mix, 'violini', m + 12, { t: RAFT + 0.3, dur: T.isola - RAFT, vel: 32, pan: (j - 1) * 0.3, gain: 0.2, attack: 1.2, release: 1.4, rev: 0.6 }));

  // ---- isola: quasi silenzio, solo risacca, vento leggero e un'onda grande sulla barriera (quarta frase)
  onde(T.isola - 0.5, T.fuoco + 0.5, 14, 0.14);
  clip(mix, 'vento_leggero', { t: T.isola, da: 0.5, durata: Math.min(15.5, T.anni - T.isola), gain: 0.05, fadeIn: 2, fadeOut: 2, largo: 4 });
  const WALL = G(cue('isola', 3) + 0.2); // il muro d'onda si alza, si rompe a WALL + 1,9 (Isola.tsx)
  clip(mix, 'onde_tonanti', { t: WALL + 0.3, da: 5.9, durata: 3.4, gain: 0.5, fadeIn: 1.4, fadeOut: 1.4, largo: 2.5, rev: 0.2 });
  suona(mix, 'pianoforte', 62, { t: G(cue('isola', 2), 1), dur: 3, vel: 40, pan: 0.1, rev: 0.6, gain: 0.45, release: 2 });
  suona(mix, 'pianoforte', 57, { t: G(cue('isola', 2), 1) + 2 * BEAT, dur: 3, vel: 34, pan: -0.1, rev: 0.6, gain: 0.4, release: 2 });
  theme(B(T.isola), B(T.pacchi), { vel: 44, str: 40, half: true, keep: 0, sg: 2.5, seed: 13 });

  // ---- pacchi: la marea porta un pacco (tonfo sulla sabbia), gli oggetti escono a uno a uno, il pacco con le ali
  theme(B(T.pacchi), B(T.fuoco), { vel: 50, str: 30, keep: 0.6, mar: true, half: true, seed: 3, sg: 2.5 });
  clip(mix, 'sacchi', { t: cue('pacchi', 1) + 0.3, da: 9.3, durata: 0.6, gain: 0.25, fadeOut: 0.2, rev: 0.25 });
  [0, 1, 2].forEach((i) => suona(mix, 'marimba', [74, 78, 81][i], { t: G(cue('pacchi', 2)) + i * BEAT / 2, dur: 0.6, vel: 60, pan: -0.3 + i * 0.3, rev: 0.4, gain: 0.3, release: 0.5 }));
  [74, 78, 81, 86].forEach((m, j) => glock(mix, m + 12, G(cue('pacchi', 3)) + j * BEAT / 6, 50, 0.3));

  // ---- fuoco: il legnetto sfregato avanti e indietro, il pallone lanciato con rabbia, la fiamma che finalmente prende
  const THROW = G(cue('fuoco', 1) + 0.6), FACE = G(cue('fuoco', 2) + 0.5), FIRE = G(cue('fuoco', 4) + 0.4); // come in Fuoco.tsx
  // l'arco sfrega: colpi ripetuti a ottavi (le prese lunghe di «torcia» hanno silenzi)
  for (let t = G(T.fuoco + 0.3); t < THROW - 0.3; t += BEAT / 2) clip(mix, 'torcia', { t, da: 1.9, durata: 0.4, gain: 0.3, fadeOut: 0.1, rev: 0.2 });
  onde(T.fuoco, T.anni + 0.5, 2, 0.15, 2500);
  suona(mix, 'celli', 50, { t: B(T.fuoco), dur: FIRE - B(T.fuoco), vel: 36, pan: -0.3, gain: 0.4, attack: 1, release: 1, rev: 0.5 });
  suona(mix, 'contrabbasso', 38, { t: B(T.fuoco), dur: FIRE - B(T.fuoco), vel: 36, pan: -0.1, gain: 0.4, attack: 1, release: 1, rev: 0.5 });
  clip(mix, 'telo', { t: THROW, da: 12.85, durata: 0.6, gain: 0.2, fadeOut: 0.2, rev: 0.25 }); // il lancio
  clip(mix, 'colpi_cavi', { t: THROW + 1.0 - 0.01, da: 0.5, durata: 0.5, gain: 0.45, fadeOut: 0.15, rev: 0.3 }); // il pallone atterra
  suona(mix, 'pianoforte', 57, { t: FACE, dur: 2.5, vel: 40, pan: -0.1, rev: 0.6, gain: 0.45, release: 1.5 }); // compare la faccia
  suona(mix, 'pianoforte', 62, { t: FACE + BEAT, dur: 2.5, vel: 38, pan: 0.1, rev: 0.6, gain: 0.42, release: 1.5 });
  glock(mix, 86, FACE + 0.02, 44, 0.2);
  for (let t = G(cue('fuoco', 3) + 0.3); t < FIRE + 0.4; t += BEAT / 2) clip(mix, 'torcia', { t, da: 1.9, durata: 0.4, gain: 0.3, fadeOut: 0.1, rev: 0.2 });
  for (let t = FIRE - 1.35, k = 0; t < FIRE - 0.05; t += BEAT / 9, k++) timp(t, 38, 40 + k * 3, 0.35 + k * 0.02, 40 + k);
  clip(mix, 'fiammata', { t: FIRE - 0.05, da: 0.25, durata: 1.3, gain: 0.45, fadeOut: 0.5, rev: 0.3 });
  clip(mix, 'fuoco', { t: FIRE + 0.1, da: 1, durata: T.anni - FIRE + 0.5, gain: 0.25, fadeIn: 0.4, fadeOut: 0.6, largo: 3, rev: 0.15 });
  colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_roll2_cresc', { t: FIRE - 1.3, vel: 64, rev: 0.4, gain: 0.25, dur: 1.3, release: 0.3 });
  harp(mix, CH_MAJ[0], FIRE, { step: BEAT / 12, vel: 60 });
  [50, 57, 62, 66].forEach((m, j) => suona(mix, ['celli', 'viole', 'viole', 'violini'][j], m, { t: FIRE, dur: B(T.anni) + BAR - FIRE - 0.1, vel: 44, pan: (j - 1.5) * 0.3, gain: 0.32, attack: 0.6, release: 1.2, rev: 0.55, seed: 50 + j }));

  // ---- anni: grotta, fuoco basso, pianoforte solitario a metà passo; si scalda quando sogna di tornare
  clip(mix, 'fuoco', { t: T.anni, da: 12, durata: T.vela - T.anni - 0.3, gain: 0.07, fadeIn: 0.6, fadeOut: 0.8, largo: 3, rev: 0.2 });
  onde(T.anni, T.vela + 0.5, 20, 0.1, 900);
  const WATCH2 = G(cue('anni', 2) + 0.6); // l'orologio con la foto si apre (Anni.tsx)
  clip(mix, 'scatti', { t: WATCH2 - 0.02, da: 1.1, durata: 0.15, gain: 0.25, rev: 0.25 });
  [86, 90, 93].forEach((m, j) => glock(mix, m, WATCH2 + j * BEAT / 8, 46, -0.3 + j * 0.3, 0.12));
  theme(B(T.anni) + BAR, B(T.vela), { vel: 58, str: 40, minor: true, half: true, keep: 0.7, seed: 4, sg: 3 }); // «sogna di tornare»: lo scalda il tema della vela

  // ---- vela: il tema caldo parte con la zattera, poi cresce a passo pieno con timpani e corno quando supera la barriera
  onde(T.vela - 0.3, T.wilson + 0.5, 2, 0.3);
  clip(mix, 'vento_raffiche', { t: cue('vela', 3), da: 40, durata: T.wilson - cue('vela', 3), gain: 0.16, fadeIn: 1, fadeOut: 1, largo: 2 });
  clip(mix, 'onde_tonanti', { t: cue('vela', 3) + 0.1, da: 5.9, durata: 2.2, gain: 0.3, fadeIn: 0.6, fadeOut: 1, largo: 2.5, rev: 0.2 }); // la barriera si alza
  clip(mix, 'telo', { t: cue('vela', 2) + 0.5, da: 12.85, durata: 0.9, gain: 0.3, fadeOut: 0.3, rev: 0.25 }); // la vela si gonfia
  const VELA = B(cue('vela', 4));
  theme(B(T.vela), VELA, { vel: 52, str: 36, keep: 0.9, harpVel: 46, seed: 6 });
  theme(VELA, B(T.wilson), { vel: 62, str: 50, big: true, harpVel: 50, seed: 7 });
  for (let t = VELA, k = 0; t < B(T.wilson) - 0.3; t += BEAT, k++) timp(t, k % 4 === 2 ? 33 : 38, k % 4 === 0 ? 96 : 64, 0.7, k);
  clip(mix, 'onde_tonanti', { t: VELA + 0.55 * (T.wilson - VELA) - 0.6, da: 5.9, durata: 3, gain: 0.5, fadeIn: 0.3, fadeOut: 1.2, largo: 2.5, rev: 0.2 }); // l'onda della barriera

  // ---- wilson: il tema in minore agli archi; il pallone scivola via; la sirena lontana di una nave (sesta frase)
  const FLASH1 = G(cue('wilson', 0) + 0.25), TEAR = G(cue('wilson', 0) + 1.0), SLIP = G(cue('wilson', 1) + 0.35); // come in Wilson.tsx
  const CALM = cue('wilson', 4) + 0.6, SHIP = G(cue('wilson', 5) + 0.3);
  onde(T.wilson, T.ritorno, 24, 0.12, 1500);
  // tempesta che si placa tra la terza e la quinta frase
  clip(mix, 'pioggia_vento', { t: T.wilson - 0.3, da: 34, durata: CALM - T.wilson + 0.3, gain: 0.1, fadeIn: 0.6, fadeOut: 2.4, largo: 2.5, rev: 0.1 });
  clip(mix, 'vento_raffiche', { t: T.wilson, da: 10, durata: CALM - T.wilson, gain: 0.08, fadeIn: 0.6, fadeOut: 2.4, largo: 3 });
  clip(mix, 'onde_tonanti', { t: T.wilson + 0.2, da: 5.9, durata: 3.5, gain: 0.2, fadeIn: 0.5, fadeOut: 1.6, largo: 2.5, rev: 0.2 });
  clip(mix, 'tuono_secco', { t: FLASH1 + 0.1, da: 0.78, durata: 2.6, gain: 0.2, fadeIn: 0.03, fadeOut: 1, rev: 0.35, lp: 3000 });
  clip(mix, 'tuono_classico', { t: TEAR + 0.05, da: 0.45, durata: 3.4, gain: 0.24, fadeIn: 0.03, fadeOut: 1.4, rev: 0.35 });
  clip(mix, 'telo', { t: TEAR - 0.02, da: 11.05, durata: 0.8, gain: 0.4, fadeOut: 0.3, rev: 0.25, pan: 0.15 }); // la vela si squarcia
  theme(B(T.wilson) + BEAT, SHIP, { vel: 62, str: 64, minor: true, keep: 0.9, harpVel: 40, seed: 8 });
  suona(mix, 'violini', 74, { t: G(cue('wilson', 2), 1), dur: cue('wilson', 4) - G(cue('wilson', 2), 1), vel: 40, pan: -0.2, gain: 0.25, attack: 1, release: 1.4, rev: 0.6 });
  clip(mix, 'onde', { t: SLIP + 0.85, da: 7.85, durata: 1.2, gain: 0.25, fadeIn: 0.1, fadeOut: 0.6, rev: 0.2, pan: 0.3 }); // tonfo leggero in acqua
  theme(SHIP, B(T.ritorno), { vel: 46, str: 34, keep: 0.7, seed: 9 });
  // bracciate: spruzzi brevi a ogni battito mentre nuota verso il pallone e torna (Wilson.tsx)
  for (let t = G(cue('wilson', 2), 1); t < cue('wilson', 5); t += BEAT) clip(mix, 'onde', { t, da: 7.85, durata: 0.45, gain: 0.12, lp: 3000, fadeOut: 0.2, rev: 0.2, pan: 0.2 });
  // sirena vera della nave, lontana (entra da destra)
  clip(mix, 'sirena_nebbia', { t: SHIP + 0.05, da: 0.15, durata: 3.3, gain: 0.08, lp: 1800, fadeIn: 0.15, fadeOut: 1, rev: 0.5, pan: 0.3 });

  // ---- ritorno: pioggia su Memphis, tema minore a metà passo; la porta che si chiude, l'auto che si allontana
  clip(mix, 'pioggia_dura', { t: T.ritorno, da: 5.4, durata: T.bivio - T.ritorno - 0.2, gain: 0.4, fadeIn: 1.2, fadeOut: 1.2, largo: 3, rev: 0.12 });
  theme(B(T.ritorno), B(T.bivio), { vel: 54, str: 46, minor: true, half: true, keep: 0.85, seed: 10, sg: 2.5 });
  clip(mix, 'porta_cigolio', { t: cue('ritorno', 3) + 0.2, da: 10.68, durata: 1.2, gain: 0.3, fadeOut: 0.4, rev: 0.3, pan: 0.3 });
  clip(mix, 'porta_sbatte', { t: cue('ritorno', 3) + 1.4 - 0.5, da: 2.6, durata: 0.9, gain: 0.45, fadeOut: 0.3, rev: 0.3, pan: 0.3 });
  clip(mix, 'rombo', { t: cue('ritorno', 4) + 0.3, da: 31, durata: 2.6, gain: 0.3, lp: 500, fadeIn: 0.3, fadeOut: 1.6, largo: 2 }); // il motore si allontana

  // ---- bivio: il tema si apre, pieno e luminoso, con vento caldo nella pianura; campanelli quando sorride
  clip(mix, 'vento_leggero', { t: T.bivio, da: 3, durata: T.finale + 2 - T.bivio, gain: 0.07, fadeIn: 1.5, fadeOut: 1.5, largo: 4 });
  theme(B(T.bivio), B(cue('bivio', 2)), { vel: 50, str: 40, harpVel: 44, seed: 11 });
  theme(B(cue('bivio', 2)), B(T.finale), { vel: 62, str: 52, big: true, harpVel: 50, mar: true, seed: 12 });
  [74, 78, 81, 86, 90].forEach((m, j) => glock(mix, m + 12, G(cue('bivio', 3)) + j * BEAT / 8, 50, -0.4 + j * 0.2));
  clip(mix, 'rombo', { t: cue('bivio', 2) - 0.6, da: 31, durata: 1.6, gain: 0.14, lp: 600, fadeIn: 0.4, fadeOut: 0.6, largo: 2 }); // il furgone arriva
  clip(mix, 'rombo', { t: cue('bivio', 4) + 1.0, da: 31, durata: 2.4, gain: 0.18, lp: 600, fadeIn: 0.4, fadeOut: 1.4, largo: 2 }); // il furgone riparte

  // ---- finale: accordo di Re maggiore degli archi e del corno, arpa e pianoforte che si sciolgono
  const F = B(T.finale);
  harp(mix, CH_MAJ[0], F, { step: BEAT / 12, vel: 60 });
  [['contrabbasso', 38], ['celli', 50], ['viole', 57], ['viole', 62], ['violini', 66], ['violini', 69]].forEach(([id, n], k) =>
    suona(mix, id, n, { t: F, dur: 2.8, vel: 58, pan: (k - 2.5) * 0.2, gain: 0.42, attack: 0.3, release: 1.4, rev: 0.6, seed: 90 + k }));
  suona(mix, 'corno', 62, { t: F, dur: 2.6, vel: 54, pan: 0.2, gain: 0.25, attack: 0.3, release: 1.2, rev: 0.6 });
  [74, 78, 81, 86].forEach((m, j) => suona(mix, 'pianoforte', m, { t: F + BEAT / 2 + j * BEAT / 4, dur: 2.4, vel: 50, pan: -0.2 + j * 0.15, rev: 0.55, gain: 0.4, release: 1.6 }));
};
