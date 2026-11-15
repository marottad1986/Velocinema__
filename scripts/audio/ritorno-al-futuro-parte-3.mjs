// Colonna sonora originale di Ritorno al futuro – Parte III (formato "Spiegato semplice"), discreta sotto la voce.
// Stessi strumenti, stesso motivo del tic-tac e stesso tempo delle Parti 1 e 2 (la trilogia va in un solo video lungo):
// il 1885 con un passo da frontiera (contrabbasso pizzicato a mezzo passo, pianoforte da saloon, tromba lontana), la
// locomotiva a passo doppio sullo spiccato, il duello sospeso sui timpani, il 1985 finale in Mi bemolle maggiore.
// Orchestra campionata (VSCO-2 CE e VCSL, CC0: scripts/audio/campioni.mjs): archi in spiccato come un motore che gira,
// corni e tromba per l'avventura, timpani; nelle scene del 1955 uno swing leggero (contrabbasso pizzicato che cammina,
// pianoforte, charleston) e al ballo la piccola orchestra al completo. Il motivo è inventato qui, in Mi bemolle maggiore:
// un tic-tac d'orologio (Si bemolle e Fa che si alternano) che poi sale di grado, come una lancetta che riparte.
// Niente brani o temi del film (né la colonna sonora originale né le canzoni suonate al ballo).
// 72 bpm su una griglia continua (10 s = 12 battiti, come il video lungo della trilogia): la foto che sbiadisce a metà
// passo, la corsa verso il fulmine a passo doppio. Effetti registrati (archivio CC0 di Craig Smith,
// scripts/audio/effetti.mjs) agganciati agli eventi dello schema in src/scenes/ritorno-al-futuro-parte-3/Linee3.tsx (stessi istanti
// `at()`) e della copertina in Locandina.tsx.
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte_coda', 'violini', 'viole', 'celli', 'contrabbasso', 'celli_spicc', 'viole_spicc', 'violini_trem', 'celli_trem',
  'contrabbasso_pizz', 'glockenspiel', 'corno', 'tromba', 'trombone', 'timpani', 'grancassa', 'rullante', 'charleston', 'piatto_crash', 'piatto_sospeso'];
export const effetti = ['passaggio', 'scatti', 'treno_vapore', 'fischio_vapore', 'metallo_colpi', 'metallo_cade', 'campana_grave', 'nitriti', 'vento_leggero', 'esplosione_detriti', 'tuono_forte'];
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
  const film = loadFilm('ritorno-al-futuro-parte-3');
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
  /** Istante (assoluto) della frase n più d, sulla croma: gli stessi istanti degli eventi di Linee3.tsx. */
  const at = (id, n, d = 0) => G0 + Math.round((C(id, n) + d - G0) / CROMA) * CROMA;
  /** Battuta della griglia più vicina: le battute partono due battiti dopo la copertina (la griglia delle crome resta
   *  quella di Linee.tsx), così i cambi di sezione cadono più vicini all'inizio dei capitoli (capitoli da 12–14 s). */
  const GB = G0;
  const B = (t) => GB + Math.round((t - GB) / BAR) * BAR;
  /** Accordo della battuta assoluta in cui cade t (tutti gli strati cambiano accordo insieme). */
  const kk = (t) => (((Math.floor((t - GB) / BAR + 1e-6)) % 4) + 4) % 4;
  const end = (id) => S[id].start + S[id].dur;
  const STARTS_D = S.duello.start;
  // prese degli effetti nuovi (misurate sull'inviluppo dei file)
  const TRENO = 5.4, FISCHIO = 0.0, METALLO = 0.48, ESPLO = 0.0;
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
  /** Il passo da frontiera del 1885: contrabbasso pizzicato a mezzo passo, pianoforte da saloon sui contrattempi, tromba lontana. */
  const frontiera = (from, to, { vel = 40 } = {}) => {
    for (let t = from, b = 0; t < to - 0.1; t += BEAT, b++) {
      const [root, iv] = CH[kk(t)];
      if (b % 2 === 0) suona(mix, 'contrabbasso_pizz', [root, root + iv[2]][(b / 2) % 2] + (root < 31 ? 12 : 0), { t, dur: BEAT, vel: vel * 1.5, pan: -0.15, rev: 0.3, gain: 1.6, release: 0.2 });
      if (b % 2 === 1) iv.forEach((v, j) => suona(mix, 'pianoforte_coda', root + 36 + v, { t, dur: BEAT * 0.4, vel: vel * 0.8, pan: 0.2, rev: 0.35, gain: 0.9, release: 0.2, seed: j }));
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

  // ---------------------------------------------------------------- copertina: il treno che spinge, il fischio, la lapide
  [51, 58, 63].forEach((m, j) => archi(mix, m, { t: 0.05, dur: 3.9, vel: 46, pan: (j - 1) * 0.3, rev: 0.55, gain: 0.4, attack: 0.3, release: 1.0, seed: j }));
  suona(mix, 'contrabbasso', 39, { t: 0.05, dur: 3.9, vel: 50, gain: 0.5, attack: 0.1, release: 1.0, rev: 0.5 });
  for (let i = 0; i < 6; i++) bell(BEAT * 0.5 * i + CROMA, i % 2 ? 77 : 82, 34, 0.2); // il tic-tac
  clip(mix, 'treno_vapore', { t: 0, da: TRENO, durata: 3.9, gain: 0.12, fadeIn: 0.3, fadeOut: 1.0, rev: 0.2 });
  clip(mix, 'fischio_vapore', { t: 4 * CROMA, da: FISCHIO, durata: 1.2, gain: 0.18, fadeOut: 0.4, rev: 0.35 });

  // ---------------------------------------------------------------- sezioni (tempi dal JSON, sulla griglia)
  // 1 · Marty bloccato nel 1955, Doc nel 1885 (viaggio), la tomba (minore, campana grave, anello rosso)
  strings(G0, B(at('tomba', 2)), { vel: 40, gain: 0.32 });
  motif(GB + BAR, at('tomba', 2), { vel: 40, gain: 0.32 });
  bell(at('tomba', 0, 0.1), 82);
  clip(mix, 'passaggio', { t: at('tomba', 1, 0.1) - 0.1, da: 0.56, durata: 1.3, gain: 0.26, fadeOut: 0.4, rev: 0.35 });
  strings(B(at('tomba', 2)), B(T.viaggio), { vel: 42, gain: 0.34, chords: MIN });
  clip(mix, 'campana_grave', { t: at('tomba', 2, 0.1), da: 0.45, durata: 2.5, gain: 0.2, fadeOut: 1.2, rev: 0.4 }); // la lapide
  timp(at('tomba', 3, 0.2), 36, 96, 0.55);
  trem(at('tomba', 3, 0.2) + BEAT, end('tomba') - at('tomba', 3, 0.2) - BEAT + 0.3, [48, 55, 60], { vel: 40, gain: 0.14 });

  // 2 · la miniera, il viaggio al 1885, il guasto
  const west = at('viaggio', 1, 0.5);
  strings(B(T.viaggio), west, { vel: 40, gain: 0.32, chords: MIN });
  spic(B(at('viaggio', 0)), west, { vel: 30, chords: MIN });
  clip(mix, 'passaggio', { t: west - 0.1, da: 0.56, durata: 1.5, gain: 0.3, fadeOut: 0.4, rev: 0.35 });
  crash(west + 1.3, 0.25);
  frontiera(west + 1.3 + BEAT, B(T.buford), { vel: 40 });
  clip(mix, 'scatti', { t: at('viaggio', 3, 0.2), da: 6.49, durata: 0.15, gain: 0.3, rev: 0.25 }); // il guasto
  suona(mix, 'trombone', 39, { t: at('viaggio', 3, 0.2), dur: 1.0, vel: 66, gain: 0.28, attack: 0.05, release: 0.5, rev: 0.45 });

  // 3 · Doc vivo (campanelle), Buford (tromboni gravi), la sfida, Marty accetta
  frontiera(B(T.buford), B(T.locomotiva), { vel: 42 });
  strings(B(T.buford), B(T.locomotiva), { vel: 38, gain: 0.3, chords: MIN });
  [75, 79, 82, 87].forEach((m, k) => bell(at('buford', 0, 0.3) + k * CROMA / 2, m, 40));
  suona(mix, 'trombone', 34, { t: at('buford', 1, 0.1), dur: 1.6, vel: 72, gain: 0.34, attack: 0.08, release: 0.7, rev: 0.45 }); // Buford
  timp(at('buford', 2, 0.2), 36, 92, 0.55);
  fanfare(at('buford', 3, 0.2), [63, 63, 70], { vel: 50, gain: 0.22 });

  // 4 · la locomotiva: il motore a passo doppio, il vapore, il fischio, lunedì
  strings(B(T.locomotiva), B(T.clara), { vel: 42, gain: 0.34 });
  spic(B(at('locomotiva', 1)), B(T.clara), { vel: 34, doppio: true });
  clip(mix, 'treno_vapore', { t: at('locomotiva', 1, 0.2), da: TRENO, durata: 4.5, gain: 0.12, fadeIn: 0.6, fadeOut: 1.2, rev: 0.2 });
  clip(mix, 'fischio_vapore', { t: at('locomotiva', 1, 0.8) - 0.05, da: FISCHIO, durata: 1.0, gain: 0.16, fadeOut: 0.4, rev: 0.35 });
  motif(B(T.locomotiva), B(T.clara), { id: 'corno', vel: 36, gain: 0.26, oct: -12 });
  timp(at('locomotiva', 3, 0.2), 36, 90, 0.5); // lunedì, il giorno della tomba

  // 5 · Clara: il burrone (trillo teso), salvata, il cuore (campanelle e archi caldi)
  strings(B(T.clara), B(T.verita), { vel: 40, gain: 0.32, chords: SW, high: true });
  trem(at('clara', 0, 0.1), at('clara', 0, 0.9) - at('clara', 0, 0.1), [60, 66, 72], { vel: 40, gain: 0.14 });
  [70, 75, 79, 82, 87].forEach((m, k) => bell(at('clara', 1, 0.1) + k * CROMA / 2, m, 40)); // si innamorano
  motif(B(at('clara', 1)), B(T.verita), { half: true, vel: 34, gain: 0.32, oct: 0 });

  // 6 · la verità, il cuore spezzato (minore), Doc crolla, la cattura
  strings(B(T.verita), B(T.duello), { vel: 38, gain: 0.3, chords: MIN, half: true });
  [82, 79, 75].forEach((m, k) => bell(at('verita', 1, 0.2) + k * 0.6, m, 38 - k * 6)); // il cuore si spezza
  suona(mix, 'trombone', 34, { t: at('verita', 3, 0.3), dur: 1.4, vel: 72, gain: 0.32, attack: 0.05, release: 0.6, rev: 0.45 });
  timp(at('verita', 3, 1.0), 36, 96, 0.55);

  // 7 · il duello: silenzio teso (vento, timpano sordo), lo sparo sul ferro, il pugno, l'arresto
  const shot = at('duello', 2, 0.1), pow = at('duello', 2, 1.2);
  clip(mix, 'vento_leggero', { t: STARTS_D, da: 4, durata: shot - STARTS_D, gain: 0.05, fadeIn: 0.6, fadeOut: 0.3, largo: 1.5 });
  trem(B(T.duello), shot - B(T.duello), [36, 43], { vel: 40, gain: 0.2 });
  for (let t = B(T.duello) + BEAT; t < shot - 0.2; t += 2 * BEAT) timp(t, 36, 70, 0.3);
  clip(mix, 'metallo_colpi', { t: shot - 0.02, da: METALLO, durata: 0.5, gain: 0.35, fadeOut: 0.2, rev: 0.3 }); // CLANG
  crash(shot, 0.3);
  kick(pow, 0.7); timp(pow, 39, 110, 0.6);
  fanfare(pow + 2 * BEAT, [63, 67, 70, 75], { vel: 54, gain: 0.26 });
  strings(pow + 2 * BEAT, B(T.ponte), { vel: 44, gain: 0.34 });
  clip(mix, 'metallo_cade', { t: at('duello', 3, 0.2) - 0.1, da: 0.64, durata: 0.34, gain: 0.25, fadeOut: 0.1, rev: 0.3 }); // le sbarre

  // 8 · il ponte: la corsa a passo doppio, il fischio, Clara salvata (maggiore), 88!, il treno che precipita
  const jump = at('ponte', 3, 0.9);
  strings(B(T.ponte), jump, { vel: 44, gain: 0.36, high: true });
  spic(B(T.ponte), jump, { vel: 42, doppio: true });
  clip(mix, 'treno_vapore', { t: B(T.ponte), da: TRENO, durata: jump - B(T.ponte), gain: 0.14, fadeIn: 0.5, fadeOut: 0.6, rev: 0.2 });
  clip(mix, 'fischio_vapore', { t: at('ponte', 1, 0.3) - 0.05, da: FISCHIO, durata: 1.0, gain: 0.16, fadeOut: 0.4, rev: 0.35 });
  [70, 75, 79, 82].forEach((m, k) => bell(at('ponte', 2, 0.3) + k * CROMA / 2, m, 40)); // Doc resta con lei
  roll(jump, 1.0, 0.22);
  clip(mix, 'passaggio', { t: jump - 0.1, da: 0.56, durata: 1.5, gain: 0.32, fadeOut: 0.4, rev: 0.35 });
  crash(jump + 0.1, 0.35); timp(jump + 0.1, 39, 110, 0.6);
  clip(mix, 'esplosione_detriti', { t: at('ponte', 3, 1.6), da: ESPLO, durata: 1.6, gain: 0.18, fadeOut: 0.6, rev: 0.3 }); // il treno nel burrone
  trem(jump + 0.1 + BEAT, B(T.futuro) - jump - 0.1 - BEAT + 0.4, [48, 55, 63], { vel: 40, gain: 0.14 });

  // 9 · il 1985: il treno che distrugge l'auto, Marty che rifiuta le sfide, Doc col treno del tempo, il futuro aperto
  const hit = at('futuro', 0, 1.1);
  clip(mix, 'fischio_vapore', { t: at('futuro', 0, 0.2), da: FISCHIO, durata: 0.9, gain: 0.14, fadeOut: 0.3, rev: 0.3 });
  clip(mix, 'metallo_colpi', { t: hit - 0.02, da: METALLO, durata: 0.5, gain: 0.35, fadeOut: 0.2, rev: 0.3 });
  kick(hit, 0.6);
  strings(hit + BEAT, F, { vel: 44, gain: 0.36, high: true });
  spic(B(at('futuro', 1)), at('futuro', 2), { vel: 30 });
  clip(mix, 'passaggio', { t: at('futuro', 2, 0.1) - 0.1, da: 0.56, durata: 1.5, gain: 0.3, fadeOut: 0.4, rev: 0.35 });
  motif(B(at('futuro', 2, 1.4)), F, { id: 'corno', vel: 42, gain: 0.3, oct: -12 });
  [63, 67, 70, 75, 79].forEach((m, k) => bell(at('futuro', 3, 0.3) + k * CROMA / 2, m + 12, 42)); // il futuro non è scritto

  // finale: Mi bemolle maggiore aperto e il tic-tac che si spegne piano
  [39, 51, 58, 63, 67, 70].forEach((m, j) => archi(mix, m, { t: F, dur: 4.0, vel: 46, pan: (j - 2.5) * 0.2, rev: 0.6, gain: 0.5, attack: 0.4, release: 1.2, seed: 40 + j }));
  [82, 77, 82, 77, 84, 86, 87].forEach((m, k) => bell(F + CROMA * (k + 1), m, 40, -0.3 + k * 0.1));
};
