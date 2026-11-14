// Colonna sonora originale di Ritorno al futuro (formato "Spiegato semplice"), discreta sotto la voce.
// Orchestra campionata (VSCO-2 CE e VCSL, CC0: scripts/audio/campioni.mjs): archi in spiccato come un motore che gira,
// corni e tromba per l'avventura, timpani; nelle scene del 1955 uno swing leggero (contrabbasso pizzicato che cammina,
// pianoforte, charleston) e al ballo la piccola orchestra al completo. Il motivo è inventato qui, in Mi bemolle maggiore:
// un tic-tac d'orologio (Si bemolle e Fa che si alternano) che poi sale di grado, come una lancetta che riparte.
// Niente brani o temi del film (né la colonna sonora originale né le canzoni suonate al ballo).
// 72 bpm su una griglia continua (10 s = 12 battiti, come il video lungo della trilogia): la foto che sbiadisce a metà
// passo, la corsa verso il fulmine a passo doppio. Effetti registrati (archivio CC0 di Craig Smith,
// scripts/audio/effetti.mjs) agganciati agli eventi dello schema in src/scenes/ritorno-al-futuro/Linee.tsx (stessi istanti
// `at()`) e della copertina in Locandina.tsx.
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte_coda', 'violini', 'viole', 'celli', 'contrabbasso', 'celli_spicc', 'viole_spicc', 'violini_trem', 'celli_trem',
  'contrabbasso_pizz', 'glockenspiel', 'corno', 'tromba', 'trombone', 'timpani', 'grancassa', 'rullante', 'charleston', 'piatto_crash', 'piatto_sospeso'];
export const effetti = ['tuono_forte', 'tuono_secco', 'rombo', 'scariche', 'auto_epoca', 'passaggio', 'scatti', 'colpi_legno', 'giornale',
  'campana_grave', 'telo', 'applauso_breve', 'pagine'];
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
  const film = loadFilm('ritorno-al-futuro');
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
  /** Istante (assoluto) della frase n più d, sulla croma: gli stessi istanti degli eventi di Linee.tsx. */
  const at = (id, n, d = 0) => G0 + Math.round((C(id, n) + d - G0) / CROMA) * CROMA;
  /** Battuta della griglia più vicina: le battute partono due battiti dopo la copertina (la griglia delle crome resta
   *  quella di Linee.tsx), così i cambi di sezione cadono più vicini all'inizio dei capitoli (capitoli da 12–14 s). */
  const GB = G0 + 2 * BEAT;
  const B = (t) => GB + Math.round((t - GB) / BAR) * BAR;
  /** Accordo della battuta assoluta in cui cade t (tutti gli strati cambiano accordo insieme). */
  const kk = (t) => (((Math.floor((t - GB) / BAR + 1e-6)) % 4) + 4) % 4;
  const end = (id) => S[id].start + S[id].dur;

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
    suona(mix, m < 60 ? 'celli_trem' : 'violini_trem', m, { t, dur, vel, pan: (j - (notes.length - 1) / 2) * 0.35, gain, attack: 0.4, release: 0.9, rev: 0.55, seed: j + 3 }));

  // ---------------------------------------------------------------- copertina: il fulmine sulla torre (0 s e 2,5 s)
  clip(mix, 'tuono_secco', { t: 0, da: 0.7, durata: 1.6, gain: 0.32, fadeOut: 0.6, rev: 0.3 });
  clip(mix, 'scariche', { t: 0.02, da: 0.4, durata: 0.8, gain: 0.18, fadeOut: 0.3, rev: 0.2 });
  [51, 58, 63].forEach((m, j) => archi(mix, m, { t: 0.05, dur: 3.9, vel: 46, pan: (j - 1) * 0.3, rev: 0.55, gain: 0.4, attack: 0.3, release: 1.0, seed: j }));
  suona(mix, 'contrabbasso', 39, { t: 0.05, dur: 3.9, vel: 50, gain: 0.5, attack: 0.1, release: 1.0, rev: 0.5 });
  for (let i = 0; i < 6; i++) bell(BEAT * 0.5 * i + 0.4, i % 2 ? 77 : 82, 34, 0.2); // il tic-tac dell'orologio
  clip(mix, 'tuono_forte', { t: 2.55, da: 0.55, durata: 1.4, gain: 0.3, fadeOut: 0.5, rev: 0.3 });
  timp(2.5, 39, 90, 0.5);

  // ---------------------------------------------------------------- sezioni (tempi dal JSON, sulla griglia)
  // 1 · Marty e Doc: il motore che si avvia, il tic-tac al pianoforte
  strings(G0, B(T.macchina), { vel: 40, gain: 0.32 });
  spic(B(at('marty', 1)), B(T.macchina), { vel: 26 });
  motif(GB + BAR, B(T.macchina), { vel: 40, gain: 0.45 });
  bell(at('marty', 1, 0.1), 82); // Marty
  bell(at('marty', 2, 0.1), 87); // Doc
  brass(at('marty', 3, 0.3), BAR, [51, 58, 63], { vel: 44, gain: 0.26 }); // la macchina del tempo

  // 2 · la macchina: 88 miglia (sale), il plutonio, i terroristi (minore), gli spari, la fuga e il salto nel tempo
  const shots1 = at('macchina', 3, 0.1), jump = at('macchina', 3, 1.0), gone = at('macchina', 3, 1.6);
  strings(B(T.macchina), shots1, { vel: 44, gain: 0.36, high: true });
  spic(B(T.macchina), at('macchina', 2), { vel: 30 });
  spic(at('macchina', 2), shots1, { vel: 38, doppio: true, chords: MIN });
  motif(B(T.macchina), at('macchina', 2), { id: 'corno', vel: 40, gain: 0.3, oct: -12 });
  clip(mix, 'auto_epoca', { t: at('macchina', 0, 0.2), da: 16.0, durata: 1.6, gain: 0.25, fadeIn: 0.2, fadeOut: 0.4, rev: 0.2 }); // l'auto accelera
  [63, 67, 70, 75, 79].forEach((m, k) => bell(at('macchina', 0, 0.2) + k * CROMA / 2, m + 12, 40)); // il tachimetro sale
  bell(at('macchina', 1, 0.1), 89, 44); // il plutonio
  timp(at('macchina', 2, 0.1), 36, 92, 0.6); // i terroristi
  [0, CROMA / 2, CROMA].forEach((d) => snare(shots1 + d, 0.6)); // gli spari (Linee.tsx: fireAt)
  roll(jump, 1.0, 0.2);
  clip(mix, 'passaggio', { t: jump - 0.2, da: 0.56, durata: 1.6, gain: 0.35, fadeOut: 0.4, rev: 0.35 }); // il salto nel tempo
  clip(mix, 'scariche', { t: at('macchina', 3, 0.8), da: 1.2, durata: 0.8, gain: 0.2, fadeOut: 0.3, rev: 0.2 });
  crash(gone, 0.3);
  kick(gone, 0.5);
  trem(gone + BEAT, B(T.passato) - gone - BEAT + 0.3, [63, 70, 75], { vel: 40, gain: 0.25 });

  // 3 · 1955: lo swing leggero; niente plutonio (nota sospesa), George (pianoforte), Biff (trombone)
  swing(B(T.passato), B(T.incidente), { vel: 40 });
  strings(B(T.passato), B(T.incidente), { vel: 36, gain: 0.26, chords: SW });
  bell(at('passato', 0, 0.9), 87, 40); // 1955
  suona(mix, 'celli_trem', 46, { t: at('passato', 1, 0.6), dur: 1.6, vel: 46, gain: 0.3, attack: 0.1, release: 0.6, rev: 0.5 }); // vuoto
  [75, 79, 82].forEach((m, k) => suona(mix, 'pianoforte_coda', m, { t: at('passato', 2, 0.1) + k * CROMA, dur: 0.6, vel: 50, pan: 0.2, rev: 0.5, gain: 1.2, release: 0.5 })); // George
  [34, 34, 33].forEach((m, k) => suona(mix, 'trombone', m + 12, { t: at('passato', 3, 0.1) + k * CROMA, dur: CROMA * 0.9, vel: 70, gain: 0.3, attack: 0.02, release: 0.3, rev: 0.4 })); // Biff

  // 4 · l'incidente: l'auto del 1955, l'urto (silenzio un battito), Lorraine, la X, il cuore (anello rosso)
  const hit = at('incidente', 1, 0);
  swing(B(T.incidente), hit, { vel: 36, comp: false });
  clip(mix, 'auto_epoca', { t: at('incidente', 0, 0.1), da: 16.5, durata: hit - at('incidente', 0, 0.1) + 0.1, gain: 0.22, fadeIn: 0.4, fadeOut: 0.2, rev: 0.2 });
  clip(mix, 'colpi_legno', { t: hit, da: 0.25, durata: 0.45, gain: 0.5, rev: 0.25 });
  timp(hit, 39, 100, 0.6);
  strings(hit + BEAT, B(T.foto), { vel: 38, gain: 0.3, chords: SW });
  bell(at('incidente', 1, 0.6), 84); // Lorraine
  suona(mix, 'trombone', 40, { t: at('incidente', 2, 0.6), dur: 0.5, vel: 60, gain: 0.3, attack: 0.02, release: 0.3, rev: 0.4 }); // la X
  [75, 79, 82, 87].forEach((m, k) => bell(at('incidente', 3, 0.1) + k * CROMA / 2, m, 42)); // il cuore
  trem(at('incidente', 3, 0.7), end('incidente') - at('incidente', 3, 0.7), [60, 66, 72], { vel: 42, gain: 0.26 }); // c'è qualcosa che non va

  // 5 · la foto: metà passo, minore; il Doc giovane, «non nascerà», i fratelli che spariscono (note che si spengono)
  strings(B(T.foto), B(T.fulmine), { vel: 40, gain: 0.34, chords: MIN, half: true });
  motif(B(T.foto), B(T.fulmine), { half: true, vel: 34, gain: 0.4, oct: -12 });
  bell(at('foto', 0, 1.0), 87); // Doc
  timp(at('foto', 1, 0.9), 36, 86, 0.5);
  bell(at('foto', 2, 0.1), 82, 38); // la foto
  [79, 75, 72].forEach((m, k) => bell(at('foto', 3, k * 0.8), m, 40 - k * 6)); // spariscono uno alla volta
  trem(at('foto', 3), end('foto') - at('foto', 3), [48, 55, 63], { vel: 40, gain: 0.26 });

  // 6 · il fulmine: il tuono lontano, il volantino, la campana della torre, il cavo; il motore riparte
  strings(B(T.fulmine), B(T.ballo), { vel: 42, gain: 0.34 });
  spic(B(at('fulmine', 1)), B(T.ballo), { vel: 30 });
  clip(mix, 'rombo', { t: at('fulmine', 0, 0.3), da: 0.5, durata: 3.0, gain: 0.12, fadeIn: 0.8, fadeOut: 1.2, rev: 0.3 });
  clip(mix, 'giornale', { t: at('fulmine', 1, 0.1), da: 0.93, durata: 0.8, gain: 0.12, fadeOut: 0.2, rev: 0.2 });
  clip(mix, 'campana_grave', { t: at('fulmine', 2, 0.5), da: 0.45, durata: 2.5, gain: 0.2, fadeOut: 1.2, rev: 0.4 });
  clip(mix, 'scatti', { t: at('fulmine', 3, 0.3), da: 6.49, durata: 0.15, gain: 0.3, rev: 0.2 });
  brass(at('fulmine', 3, 0.3), BAR, [46, 53, 58], { vel: 46, gain: 0.26 });

  // 7 · il ballo: l'orchestrina al completo; Biff (trombone), il pugno (grancassa e piatto, poi un battito di silenzio),
  //     il cuore, i fratelli che tornano (campanelle che salgono) e l'applauso
  const pow = at('ballo', 2, 0.5);
  swing(B(T.ballo), pow - 0.05, { vel: 46 });
  motif(B(T.ballo), at('ballo', 1), { id: 'tromba', vel: 34, gain: 0.22 });
  suona(mix, 'trombone', 41, { t: at('ballo', 1, 0.4), dur: 1.4, vel: 70, gain: 0.32, attack: 0.05, release: 0.4, rev: 0.4 }); // il prepotente
  suona(mix, 'trombone', 40, { t: at('ballo', 1, 0.4) + 2 * BEAT, dur: 0.6, vel: 70, gain: 0.3, attack: 0.05, release: 0.4, rev: 0.4 });
  kick(pow, 0.8);
  crash(pow, 0.45);
  timp(pow, 39, 110, 0.6);
  swing(pow + 2 * BEAT, B(T.lettera), { vel: 48 });
  strings(at('ballo', 3, 0.2), B(T.lettera), { vel: 44, gain: 0.34, high: true, chords: SW });
  [70, 75, 79, 82, 87].forEach((m, k) => bell(at('ballo', 3, 0.2) + k * CROMA / 2, m, 42)); // il cuore
  [75, 79, 82, 87, 91].forEach((m, k) => bell(at('ballo', 3, 1.4) + k * CROMA / 2, m, 38, 0.2)); // tornano!
  clip(mix, 'applauso_breve', { t: at('ballo', 3, 1.2), da: 0.5, durata: 3, gain: 0.12, fadeIn: 0.4, fadeOut: 1.2, rev: 0.3 });

  // 8 · la lettera: archi tesi; lo strappo; la corsa al fulmine a passo doppio, il tuono, il salto; gli spari
  const tear = at('lettera', 1, 1.0), bolt = at('lettera', 2, 0.2), shots2 = at('lettera', 3, 0.6);
  strings(B(T.lettera), bolt, { vel: 42, gain: 0.34, chords: MIN });
  spic(B(T.lettera), at('lettera', 2, -1.0), { vel: 30, chords: MIN });
  trem(shots2 + 1.5 * BEAT, at('cambiato', 0, 0.2) - shots2 - 1.5 * BEAT, [36, 43], { vel: 40, gain: 0.15 });
  bell(at('lettera', 0, 1.6), 72, 40);
  clip(mix, 'telo', { t: tear, da: 0.2, durata: 0.5, gain: 0.32, fadeOut: 0.15, rev: 0.25 }); // la lettera strappata
  spic(at('lettera', 2, -1.0), bolt, { vel: 44, doppio: true, chords: MIN });
  roll(bolt, 1.0, 0.24);
  clip(mix, 'tuono_forte', { t: bolt + 0.08, da: 0.55, durata: 2.0, gain: 0.4, fadeOut: 0.7, rev: 0.3 });
  clip(mix, 'scariche', { t: bolt, da: 0.4, durata: 0.9, gain: 0.25, fadeOut: 0.3, rev: 0.2 });
  crash(bolt, 0.35);
  timp(bolt, 39, 115, 0.7);
  clip(mix, 'passaggio', { t: at('lettera', 2, 0.6) - 0.1, da: 0.56, durata: 1.4, gain: 0.32, fadeOut: 0.4, rev: 0.35 }); // di nuovo nel 1985
  trem(at('lettera', 2, 1.0), shots2 - at('lettera', 2, 1.0), [63, 66, 72], { vel: 40, gain: 0.26 });
  strings(at('lettera', 2, 1.0), shots2, { vel: 36, gain: 0.26, chords: MIN });
  [0, CROMA / 2, CROMA].forEach((d) => snare(shots2 + d, 0.6)); // gli spari, di nuovo
  timp(shots2 + BEAT * 1.5, 36, 80, 0.45);

  // 9 · il 1985 cambiato: Mi bemolle maggiore pieno, il tema ai corni; il libro; Doc dal 2015 (salto); «nei guai!»
  const rise = at('cambiato', 0, 0.2), back = at('cambiato', 2, 0.2), trouble = at('cambiato', 3, 0.5);
  const F = G0 + Math.round((T.finale - G0) / BEAT) * BEAT;
  [39, 51, 58, 63].forEach((m, j) => archi(mix, m, { t: rise, dur: Math.max(0.6, B(rise) > rise ? B(rise) - rise : BAR), vel: 44, pan: (j - 1.5) * 0.3, rev: 0.55, gain: 0.8, attack: 0.15, release: 1.0, seed: 80 + j }));
  strings(B(rise) < rise ? B(rise) + BAR : B(rise), F, { vel: 46, gain: 0.38, high: true });
  spic(B(at('cambiato', 1)), back, { vel: 30 });
  motif(B(at('cambiato', 0, 0.6)), back, { id: 'corno', vel: 42, gain: 0.32, oct: -12 });
  fanfare(rise, [63, 67, 70, 75], { vel: 52, gain: 0.26 }); // Doc si rialza
  clip(mix, 'pagine', { t: at('cambiato', 1, 0.6), da: 0.95, durata: 0.8, gain: 0.25, fadeOut: 0.2, rev: 0.2 }); // il libro di George
  clip(mix, 'passaggio', { t: back - 0.1, da: 0.56, durata: 1.2, gain: 0.32, fadeOut: 0.3, rev: 0.35 }); // Doc arriva dal 2015
  clip(mix, 'scariche', { t: back + 0.6, da: 1.2, durata: 0.6, gain: 0.18, fadeOut: 0.3, rev: 0.2 });
  spic(back + BEAT, F, { vel: 36, doppio: true });
  timp(trouble, 36, 105, 0.65); // i figli, l'anello rosso
  brass(trouble, 2 * BEAT, [48, 55, 60], { vel: 56, gain: 0.3 });
  fanfare(at('cambiato', 3, 1.1), [70, 70, 75], { vel: 54, gain: 0.24 }); // nei guai!

  // finale: Mi bemolle maggiore aperto e il tic-tac che riparte in campanelle
  [39, 51, 58, 63, 67, 70].forEach((m, j) => archi(mix, m, { t: F, dur: 4.0, vel: 46, pan: (j - 2.5) * 0.2, rev: 0.6, gain: 0.5, attack: 0.4, release: 1.2, seed: 40 + j }));
  [82, 77, 82, 77, 84, 86, 87].forEach((m, k) => bell(F + CROMA * (k + 1), m, 40, -0.3 + k * 0.1));
};
