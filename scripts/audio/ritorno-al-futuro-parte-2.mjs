// Colonna sonora originale di Ritorno al futuro – Parte II (formato "Spiegato semplice"), discreta sotto la voce.
// Stessi strumenti, stesso motivo del tic-tac e stesso tempo della Parte 1 (la trilogia va in un solo video lungo):
// il 2015 più metallico (campanelle e pizzicati sullo spiccato), il 1985 alternativo in minore con i tromboni gravi,
// il 1955 con lo swing leggero, il fuoco e il fulmine sui timpani.
// Orchestra campionata (VSCO-2 CE e VCSL, CC0: scripts/audio/campioni.mjs): archi in spiccato come un motore che gira,
// corni e tromba per l'avventura, timpani; nelle scene del 1955 uno swing leggero (contrabbasso pizzicato che cammina,
// pianoforte, charleston) e al ballo la piccola orchestra al completo. Il motivo è inventato qui, in Mi bemolle maggiore:
// un tic-tac d'orologio (Si bemolle e Fa che si alternano) che poi sale di grado, come una lancetta che riparte.
// Niente brani o temi del film (né la colonna sonora originale né le canzoni suonate al ballo).
// 72 bpm su una griglia continua (10 s = 12 battiti, come il video lungo della trilogia): la foto che sbiadisce a metà
// passo, la corsa verso il fulmine a passo doppio. Effetti registrati (archivio CC0 di Craig Smith,
// scripts/audio/effetti.mjs) agganciati agli eventi dello schema in src/scenes/ritorno-al-futuro-parte-2/Linee2.tsx (stessi istanti
// `at()`) e della copertina in Locandina.tsx.
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte_coda', 'violini', 'viole', 'celli', 'contrabbasso', 'celli_spicc', 'viole_spicc', 'violini_trem', 'celli_trem',
  'contrabbasso_pizz', 'glockenspiel', 'corno', 'tromba', 'trombone', 'timpani', 'grancassa', 'rullante', 'charleston', 'piatto_crash', 'piatto_sospeso'];
export const effetti = ['tuono_forte', 'rombo', 'scariche', 'passaggio', 'scatti', 'pagine', 'fiammata', 'fuoco', 'monete', 'metallo_cade', 'sirene', 'giornale'];
/** Sala media, luminosa. */
export const sala = { rt60: 2.0, brillo: 6000, predelay: 0.02, wet: 0.42 };

const BPM = 72;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const CROMA = BEAT / 2;
const G0 = 4;

// accordi per battuta (Mi bemolle maggiore): Mi bemolle · Do minore · La bemolle · Si bemolle
const CH = [[39, [0, 4, 7]], [36, [0, 3, 7]], [44, [0, 4, 7]], [46, [0, 4, 7]]];
// swing del 1955: Mi bemolle 6 · Do 7 · Fa minore 7 · Si bemolle 7
const SW = [[39, [0, 4, 7, 9]], [36, [0, 4, 7, 10]], [41, [0, 3, 7, 10]], [46, [0, 4, 7, 10]]];
// minore per la foto che sbiadisce: Do minore · La bemolle · Fa minore · Sol
const MIN = [[36, [0, 3, 7]], [44, [0, 4, 7]], [41, [0, 3, 7]], [43, [0, 4, 7]]];
// il motivo: [croma, nota, durata in crome] — tic-tac (Si bemolle, Fa) e la salita
const MOTIF = [[0, 70, 1], [1, 65, 1], [2, 70, 1], [3, 65, 1], [4, 72, 1], [5, 74, 1], [6, 75, 2], [8, 74, 1], [9, 72, 1], [10, 70, 2], [12, 67, 2], [14, 70, 2]];

export default (mix, T) => {
  const film = loadFilm('ritorno-al-futuro-parte-2');
  const { segments } = timeline(film);
  const S = Object.fromEntries(segments.map((s) => [s.id, s]));
  /** Inizio assoluto della frase n del capitolo, come subtitleTimes in ChapterOverlay.tsx. */
  const C = (id, n) => {
    const s = S[id];
    const w = s.testo.map((l) => l.length + 6);
    const tot = w.reduce((a, b) => a + b, 0);
    let cur = 0.15;
    for (let k = 0; k < n; k++) cur += (w[k] / tot) * (s.dur - 0.35);
    return s.start + cur;
  };
  /** Istante (assoluto) della frase n più d, sulla croma: gli stessi istanti degli eventi di Linee2.tsx. */
  const at = (id, n, d = 0) => G0 + Math.round((C(id, n) + d - G0) / CROMA) * CROMA;
  /** Battuta della griglia più vicina: le battute partono due battiti dopo la copertina (la griglia delle crome resta
   *  quella di Linee.tsx), così i cambi di sezione cadono più vicini all'inizio dei capitoli (capitoli da 12–14 s). */
  const GB = G0;
  const B = (t) => GB + Math.round((t - GB) / BAR) * BAR;
  /** Accordo della battuta assoluta in cui cade t (tutti gli strati cambiano accordo insieme). */
  const kk = (t) => (((Math.floor((t - GB) / BAR + 1e-6)) % 4) + 4) % 4;
  const end = (id) => S[id].start + S[id].dur;
  const F = G0 + Math.round((T.finale - G0) / CROMA) * CROMA;

  // ---------------------------------------------------------------- strumenti
  const strings = (from, to, { vel = 42, gain: g0 = 0.4, chords = CH, half = false, high = false } = {}) => {
    const gain = g0 * 2.6;
    const step = BAR * (half ? 2 : 1);
    for (let t = from; t < to - 0.4; t += step) {
      const k = kk(t);
      const [root, iv] = chords[k];
      const d = Math.min(step * 1.02, to - t);
      archi(mix, root + 12, { t, dur: d, vel: vel + 6, pan: -0.3, rev: 0.55, gain: gain * 1.2, attack: 0.6, release: 1.2, seed: k });
      iv.slice(1, 3).forEach((v, j) => archi(mix, root + 24 + v, { t: t + 0.03 * j, dur: d, vel: vel + 4, pan: 0.1 + j * 0.25, rev: 0.55, gain: gain, attack: 0.6, release: 1.2, seed: k + j + 1 }));
      suona(mix, 'contrabbasso', root, { t, dur: d, vel: vel + 8, gain: gain * 1.2, attack: 0.5, release: 1.2, rev: 0.5 });
      if (high) suona(mix, 'violini', root + 36 + iv[2], { t, dur: d, vel: vel, pan: -0.2, gain: gain * 0.6, attack: 0.7, release: 1.4, rev: 0.6 });
    }
  };
  /** Il motore: arpeggio in spiccato a crome (doppio = semicrome). */
  const spic = (from, to, { vel = 34, doppio = false, chords = CH } = {}) => {
    const step = doppio ? CROMA / 2 : CROMA;
    for (let t = from, i = 0; t < to - 0.05; t += step, i++) {
      const [root, iv] = chords[kk(t)];
      const notes = [root + 12, root + 12 + iv[1], root + 12 + iv[2], root + 24];
      const accent = i % (doppio ? 4 : 2) === 0;
      suona(mix, notes[i % 4] < 55 ? 'celli_spicc' : 'viole_spicc', notes[i % 4] + 12, { t, dur: step * 0.9, vel: vel * 1.7 * (accent ? 1 : 0.75), pan: i % 2 ? 0.25 : -0.25, rev: 0.35, gain: 1.3, release: 0.12 });
    }
  };
  /** Il motivo del tic-tac su uno strumento (half: metà passo). */
  const motif = (from, to, { id = 'pianoforte_coda', vel = 46, gain = 0.5, half = false, oct = 0, pan = 0.15 } = {}) => {
    const c = CROMA * (half ? 2 : 1), loop = 16 * c;
    for (let L = from; L < to - 0.3; L += loop) {
      for (const [b, m, d] of MOTIF) {
        const t = L + b * c;
        if (t >= to - 0.2) break;
        const brass = id === 'corno' || id === 'tromba';
        suona(mix, id, m + oct, { t, dur: d * c * 0.95, vel: brass ? vel * 1.6 : vel * 1.2, pan, rev: 0.5, gain: id === 'pianoforte_coda' ? gain * 2.6 : gain * 1.5, attack: brass ? 0.03 : 0, release: brass ? 0.35 : 0.6 });
      }
    }
  };
  /** Lo swing del 1955: contrabbasso pizzicato che cammina, pianoforte sui contrattempi, charleston. */
  const swing = (from, to, { vel = 44, hat = true, comp = true } = {}) => {
    for (let t = from, b = 0; t < to - 0.1; t += BEAT, b++) {
      const [root, iv] = SW[kk(t)];
      const walk = [root, root + iv[1], root + iv[2], root + iv[3]][Math.round((t - GB) / BEAT) % 4];
      suona(mix, 'contrabbasso_pizz', walk < 31 ? walk + 12 : walk, { t, dur: BEAT, vel: vel * 1.5, pan: -0.15, rev: 0.25, gain: 1.6, release: 0.2 });
      if (hat && t + BEAT * 2 / 3 < to) {
        colpo(mix, 'charleston', b % 2 ? 'v3' : 'v2', { t, vel: 100, gain: 0.16, pan: 0.3, rev: 0.15, seed: b });
        colpo(mix, 'charleston', 'v2', { t: t + BEAT * 2 / 3, vel: 100, gain: 0.1, pan: 0.3, rev: 0.15, seed: b + 50 });
      }
      if (comp && b % 2 === 1) iv.forEach((v, j) => suona(mix, 'pianoforte_coda', root + 36 + v - (v > 7 ? 12 : 0), { t: t + BEAT * 2 / 3, dur: BEAT * 0.4, vel: vel * 0.9, pan: 0.2, rev: 0.35, gain: 1.0, release: 0.2, seed: j }));
    }
  };
  const timp = (t, m = 39, vel = 90, gain = 0.6) => suona(mix, 'timpani', m, { t, dur: 2, vel, gain, rev: 0.5, release: 0.8, seed: Math.round(t * 10) });
  const bell = (t, m, vel = 44, pan = -0.2) => suona(mix, 'glockenspiel', m, { t, dur: 2, vel: vel * 1.3, pan, rev: 0.65, gain: 0.4, release: 1.3 });
  const brass = (t, dur, notes, { vel = 54, gain = 0.32 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 52 ? 'trombone' : 'corno', m, { t, dur, vel: vel * 1.5, pan: -0.3 + j * 0.25, gain, attack: 0.08, release: 0.8, rev: 0.5, seed: j + 11 }));
  const fanfare = (t, notes, { vel = 56, gain = 0.3, step = CROMA } = {}) => notes.forEach((m, j) =>
    suona(mix, 'tromba', m, { t: t + j * step, dur: j === notes.length - 1 ? BEAT * 1.5 : step * 0.9, vel: vel * 1.6, pan: 0.2, gain, attack: 0.02, release: 0.5, rev: 0.45 }));
  const snare = (t, gain = 0.5) => colpo(mix, 'rullante', 'v5', { t, vel: 100, gain, pan: 0.1, rev: 0.3, seed: Math.round(t * 100) });
  const crash = (t, gain = 0.35) => colpo(mix, 'piatto_crash', 'mf', { t, vel: 100, gain, rev: 0.4, seed: Math.round(t * 10) });
  const kick = (t, gain = 0.6) => colpo(mix, 'grancassa', 'bdrum_f', { t, vel: 100, gain, rev: 0.4, seed: Math.round(t * 10) });
  const roll = (t, d = 1.6, gain = 0.18) => colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_roll2_cresc', { t: t - d, vel: 52, rev: 0.45, gain, dur: d, release: 0.4 });
  const trem = (t, dur, notes, { vel = 44, gain = 0.3 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 60 ? 'celli_trem' : 'violini_trem', m, { t, dur, vel: Math.max(vel, 70), pan: (j - (notes.length - 1) / 2) * 0.35, gain, attack: 0.4, release: 0.9, rev: 0.55, seed: j + 3 }));

  // ---------------------------------------------------------------- copertina: l'almanacco che brilla, le pagine, il casinò che lampeggia
  [51, 58, 63].forEach((m, j) => archi(mix, m, { t: 0.05, dur: 3.9, vel: 46, pan: (j - 1) * 0.3, rev: 0.55, gain: 0.4, attack: 0.3, release: 1.0, seed: j }));
  suona(mix, 'contrabbasso', 39, { t: 0.05, dur: 3.9, vel: 50, gain: 0.5, attack: 0.1, release: 1.0, rev: 0.5 });
  for (let i = 0; i < 6; i++) bell(BEAT * 0.5 * i + 0.4, i % 2 ? 77 : 82, 34, 0.2); // il tic-tac
  suona(mix, 'trombone', 39, { t: 2.5, dur: 1.2, vel: 70, gain: 0.3, attack: 0.05, release: 0.6, rev: 0.45 }); // il casinò
  timp(2.5, 36, 86, 0.45);

  // ---------------------------------------------------------------- sezioni (tempi dal JSON, sulla griglia)
  // 1 · Marty, Doc, Jennifer, il viaggio al 2015, il figlio nei guai
  const goF = at('futuro', 2, 0.5);
  strings(G0, B(T.griff), { vel: 40, gain: 0.32 });
  spic(B(at('futuro', 1)), goF, { vel: 26 });
  motif(GB + BAR, goF, { vel: 40, gain: 0.32 });
  bell(at('futuro', 0, 0.1), 82); bell(at('futuro', 0, 1.6), 87); bell(at('futuro', 2, 0.1), 84);
  roll(goF + 0.6, 1.0, 0.2);
  clip(mix, 'passaggio', { t: goF, da: 0.56, durata: 1.6, gain: 0.32, fadeOut: 0.4, rev: 0.35 });
  crash(goF + 1.25, 0.25);
  spic(goF + 1.25 + BEAT, B(T.almanacco), { vel: 30, doppio: false });
  [75, 79, 82, 87].forEach((m, k) => bell(goF + 1.25 + k * CROMA / 2, m + 12, 36)); // il 2015
  timp(at('futuro', 3, 0.3), 36, 92, 0.55); // nei guai

  // 2 · Griff, la rapina, Marty al posto del figlio, l'arresto
  strings(B(T.griff), at('griff', 3, 0.6), { vel: 42, gain: 0.34, chords: MIN });
  strings(at('griff', 3, 0.6) + BEAT, B(T.almanacco), { vel: 42, gain: 0.34, chords: MIN });
  suona(mix, 'trombone', 41, { t: at('griff', 0, 0.1), dur: 0.8, vel: 72, gain: 0.32, attack: 0.03, release: 0.3, rev: 0.4 }); // Griff
  suona(mix, 'trombone', 40, { t: at('griff', 0, 0.1) + 2 * BEAT, dur: 0.6, vel: 70, gain: 0.3, attack: 0.03, release: 0.3, rev: 0.4 });
  fanfare(at('griff', 2, 0.5), [70, 70, 63], { vel: 52, gain: 0.24 }); // «no!»
  const jail = at('griff', 3, 0.6);
  clip(mix, 'sirene', { t: at('griff', 3, -0.4), da: 2, durata: 2.2, gain: 0.08, fadeIn: 0.4, fadeOut: 0.8, rev: 0.3 });
  clip(mix, 'metallo_cade', { t: jail - 0.1, da: 0.64, durata: 0.34, gain: 0.3, fadeOut: 0.1, rev: 0.3 }); // le sbarre
  kick(jail, 0.5);
  [75, 79, 82].forEach((m, k) => bell(at('griff', 3, 1.4) + k * CROMA / 2, m, 40)); // salvo

  // 3 · l'almanacco (campanelle dorate), le scommesse (monete), il cestino, il vecchio Biff (trombone grave)
  strings(B(T.almanacco), B(T.furto), { vel: 42, gain: 0.34, high: true });
  motif(B(T.almanacco), at('almanacco', 2), { id: 'corno', vel: 36, gain: 0.26, oct: -12 });
  [70, 75, 79, 82, 87, 91].forEach((m, k) => bell(at('almanacco', 0, 0.2) + k * CROMA / 2, m, 42));
  clip(mix, 'monete', { t: at('almanacco', 1, 0.1) - 0.1, da: 1.3, durata: 0.7, gain: 0.3, fadeOut: 0.2, rev: 0.25 });
  clip(mix, 'metallo_cade', { t: at('almanacco', 2, 0.8) - 0.1, da: 0.64, durata: 0.34, gain: 0.25, fadeOut: 0.1, rev: 0.25 }); // nel cestino
  suona(mix, 'trombone', 34, { t: at('almanacco', 3, 0.1), dur: 2.0, vel: 70, gain: 0.34, attack: 0.1, release: 0.8, rev: 0.45 });
  timp(at('almanacco', 3, 0.9), 34, 90, 0.5);

  // 4 · il furto: lo spiccato teso, il salto al 1955 (lo swing per un attimo), il ritorno
  const up = at('furto', 1, 0.5), down = at('furto', 3, 0.1);
  strings(B(T.furto), B(up + 1.2), { vel: 40, gain: 0.32, chords: MIN });
  strings(B(up + 1.2), down, { vel: 38, gain: 0.3, chords: SW });
  strings(down, B(T.casino), { vel: 40, gain: 0.32, chords: MIN });
  spic(B(T.furto), up, { vel: 32, chords: MIN });
  clip(mix, 'passaggio', { t: up - 0.1, da: 0.56, durata: 1.4, gain: 0.3, fadeOut: 0.4, rev: 0.35 });
  swing(B(up + 1.2), down - 0.1, { vel: 32, comp: false });
  [70, 75, 79].forEach((m, k) => bell(at('furto', 2, 0.5) + k * CROMA / 2, m + 12, 40)); // «glielo dà»
  clip(mix, 'passaggio', { t: down - 0.1, da: 0.56, durata: 1.3, gain: 0.28, fadeOut: 0.4, rev: 0.35 });

  // 5 · il 1985 alternativo: minore, tromboni gravi, il neon del casinò, George ucciso (timpano, poi silenzio)
  const alt = at('casino', 0, 0.1), dead = at('casino', 3, 0.5);
  clip(mix, 'passaggio', { t: alt - 0.1, da: 0.56, durata: 1.3, gain: 0.3, fadeOut: 0.4, rev: 0.35 });
  strings(B(T.casino), dead, { vel: 44, gain: 0.36, chords: MIN });
  spic(B(at('casino', 1)), dead, { vel: 30, chords: MIN });
  brass(at('casino', 1, 0.1), 2 * BAR, [36, 43, 48], { vel: 54, gain: 0.3 });
  clip(mix, 'monete', { t: at('casino', 1, 0.3) - 0.1, da: 1.3, durata: 0.7, gain: 0.25, fadeOut: 0.2, rev: 0.25 });
  suona(mix, 'trombone', 39, { t: at('casino', 2, 0.3), dur: 1.4, vel: 72, gain: 0.32, attack: 0.05, release: 0.6, rev: 0.45 }); // la torre
  timp(dead, 36, 110, 0.65);
  trem(dead + BEAT, B(T.binario) - dead - BEAT + 0.4, [48, 55, 60], { vel: 40, gain: 0.15 });

  // 6 · il binario deviato (scambio: scatto), tornare al 1955 (il motivo ai corni)
  strings(B(T.binario), B(T.data), { vel: 40, gain: 0.32, chords: MIN, half: true });
  motif(B(T.binario), B(T.data), { half: true, vel: 34, gain: 0.4, oct: -12 });
  clip(mix, 'scatti', { t: at('binario', 1, 0.1), da: 6.49, durata: 0.15, gain: 0.35, rev: 0.25 }); // lo scambio
  timp(at('binario', 1, 0.1), 39, 90, 0.5);
  fanfare(at('binario', 3, 0.2), [63, 67, 70, 75], { vel: 50, gain: 0.24 });

  // 7 · la data (campanella), la notte del temporale (tuono lontano), il Marty del primo viaggio; il salto al 1955
  strings(B(T.data), B(T.fuoco), { vel: 40, gain: 0.32, chords: SW });
  swing(B(at('data', 1)), B(T.fuoco), { vel: 30, comp: true });
  [82, 87, 91].forEach((m, k) => bell(at('data', 1, 0.2) + k * CROMA / 2, m, 42)); // 12 novembre
  clip(mix, 'rombo', { t: at('data', 2, 0.3), da: 0.5, durata: 3.0, gain: 0.12, fadeIn: 0.8, fadeOut: 1.2, rev: 0.3 });
  clip(mix, 'passaggio', { t: at('data', 3, 0.1) - 0.1, da: 0.56, durata: 1.3, gain: 0.28, fadeOut: 0.4, rev: 0.35 });

  // 8 · non farsi vedere (pizzicati in punta di piedi), lo strappo, il fuoco, il 1985 che torna (maggiore)
  const burnT = at('fuoco', 2, 0.1), heal = at('fuoco', 2, 0.9);
  strings(B(T.fuoco), burnT, { vel: 40, gain: 0.32, chords: MIN });
  spic(B(T.fuoco), burnT, { vel: 30, chords: MIN, doppio: true });
  clip(mix, 'pagine', { t: at('fuoco', 1, 0.6), da: 1.25, durata: 0.35, gain: 0.25, fadeOut: 0.1, rev: 0.2 }); // glielo strappa
  clip(mix, 'fiammata', { t: burnT, da: 0.1, durata: 1.2, gain: 0.3, fadeOut: 0.4, rev: 0.3 });
  clip(mix, 'fuoco', { t: burnT + 0.6, da: 2, durata: 2.6, gain: 0.08, fadeIn: 0.3, fadeOut: 1.0, rev: 0.2 });
  kick(burnT, 0.5);
  [39, 51, 58, 63, 67].forEach((m, j) => archi(mix, m, { t: heal, dur: B(T.lettera) - heal + 0.2, vel: 46, pan: (j - 2) * 0.25, rev: 0.6, gain: 0.7, attack: 0.5, release: 1.2, seed: 60 + j }));
  [75, 79, 82, 87].forEach((m, k) => bell(heal + k * CROMA / 2, m, 40)); // George è vivo

  // 9 · il fulmine sull'auto con Doc, sparita (silenzio), bloccato, la lettera, il 1885 (il motivo che riparte)
  const bolt = at('lettera', 0, 0.6), west = at('lettera', 3, 0.1);
  strings(B(T.lettera), bolt, { vel: 40, gain: 0.32, chords: MIN });
  spic(B(T.lettera), bolt, { vel: 40, doppio: true, chords: MIN });
  roll(bolt, 1.0, 0.24);
  clip(mix, 'tuono_forte', { t: bolt + 0.08, da: 0.55, durata: 2.0, gain: 0.4, fadeOut: 0.7, rev: 0.3 });
  clip(mix, 'scariche', { t: bolt, da: 0.4, durata: 0.9, gain: 0.25, fadeOut: 0.3, rev: 0.2 });
  crash(bolt, 0.35); timp(bolt, 39, 115, 0.7);
  clip(mix, 'passaggio', { t: at('lettera', 1, 0.4) - 0.1, da: 0.56, durata: 1.3, gain: 0.28, fadeOut: 0.4, rev: 0.35 });
  trem(bolt + BEAT, B(at('lettera', 2)) - bolt - BEAT + 0.4, [48, 55, 63], { vel: 40, gain: 0.14 });
  clip(mix, 'giornale', { t: at('lettera', 2, 0.1), da: 0.93, durata: 0.8, gain: 0.12, fadeOut: 0.2, rev: 0.2 }); // la lettera
  strings(B(at('lettera', 2)), F, { vel: 42, gain: 0.32 });
  motif(west, F, { id: 'corno', vel: 40, gain: 0.3, oct: -12 });
  [63, 67, 70, 75].forEach((m, k) => bell(west + k * CROMA / 2, m + 12, 42)); // 1885!

  // finale: Mi bemolle aperto, il tic-tac che riparte (la storia continua)
  [39, 51, 58, 63, 67, 70].forEach((m, j) => archi(mix, m, { t: F, dur: 4.0, vel: 46, pan: (j - 2.5) * 0.2, rev: 0.6, gain: 0.5, attack: 0.4, release: 1.2, seed: 40 + j }));
  [82, 77, 82, 77, 84, 86, 87].forEach((m, k) => bell(F + CROMA * (k + 1), m, 40, -0.3 + k * 0.1));
};
