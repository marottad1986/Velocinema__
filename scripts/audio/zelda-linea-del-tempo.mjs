// Colonna sonora originale di «Zelda, la linea del tempo» (Videogiochi spiegati, formato "Spiegato semplice"), discreta
// sotto la voce. Fiabesca, in tre quarti a 90 bpm (una battuta ogni 2 s: copertina 2 battute, capitoli da 6 o 7, finale 2),
// in Fa maggiore: l'arpa è il filo conduttore (basso sul primo battito e arpeggio a crome), glockenspiel per la magia,
// corni per l'avventura, archi sotto. Il motivo è inventato qui (Do-La-Fa, Sol-La, Si bemolle-Re-Do, La) e non richiama
// nessun tema della serie (niente ninna nanna, niente sigla). Il passo avanti: al bivio lo stesso motivo si divide in tre
// colori, uno per ramo (tromboni per l'eroe sconfitto, arpa e glockenspiel per il mare, violino solo e archi gravi per il
// crepuscolo), e ogni finestra riprende il suo colore. L'origine e il ramo sconfitto in Re minore, il crepuscolo in Si
// bemolle minore, il finale torna in Fa maggiore. Orchestra campionata (VSCO-2 CE e VCSL, CC0: scripts/audio/campioni.mjs);
// effetti registrati (archivio CC0 di Craig Smith, scripts/audio/effetti.mjs) agganciati agli eventi dello schema in
// src/scenes/zelda-linea-del-tempo/Schema.tsx (stessi istanti `at()`).
import { suona, archi, colpo, taci, compensa, crescendo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['arpa', 'glockenspiel', 'violini', 'viole', 'celli', 'contrabbasso', 'violini_trem', 'celli_trem', 'violino_solo',
  'violini_pizz', 'celli_pizz', 'corno', 'tromba', 'trombone', 'timpani', 'gong', 'piatto_crash', 'piatto_sospeso', 'grancassa'];
export const effetti = ['tuono_lontano', 'vento_leggero', 'campana_grave', 'risacca', 'ali'];
/** Sala grande e luminosa, da favola. */
export const sala = { rt60: 2.3, brillo: 6500, predelay: 0.025, wet: 0.45 };

const BPM = 90;
const BEAT = 60 / BPM;
const BAR = 3 * BEAT; // 2 s
const CROMA = BEAT / 2;
const G0 = 4;

// accordi per battuta (Fa maggiore): Fa · Re minore · Si bemolle · Do
const MAJ = [[41, [0, 4, 7]], [38, [0, 3, 7]], [46, [0, 4, 7]], [48, [0, 4, 7]]];
// Re minore: Re minore · Si bemolle · Sol minore · La
const MIN = [[38, [0, 3, 7]], [46, [0, 4, 7]], [43, [0, 3, 7]], [45, [0, 4, 7]]];
// Si bemolle minore per il crepuscolo: Si bemolle minore · Sol bemolle · Mi bemolle minore · Fa
const TW = [[46, [0, 3, 7]], [42, [0, 4, 7]], [39, [0, 3, 7]], [41, [0, 4, 7]]];
// il mare: Fa · Re minore con la nona · Si bemolle con la settima maggiore · Do sospeso
const SEA = [[41, [0, 4, 7, 14]], [38, [0, 3, 7, 14]], [46, [0, 4, 7, 11]], [48, [0, 5, 7, 14]]];
// il motivo: [croma, nota, durata in crome] su due battute da 3/4 (12 crome)
const MOTIF = [[0, 72, 1], [1, 69, 1], [2, 65, 2], [4, 67, 1], [5, 69, 1], [6, 70, 1], [7, 74, 1], [8, 72, 2], [10, 69, 2]];

export default (mix, T) => {
  const film = loadFilm('zelda-linea-del-tempo');
  const { segments } = timeline(film);
  const S = Object.fromEntries(segments.map((s) => [s.id, s]));
  compensa(mix);
  /** Inizio assoluto della frase n del capitolo, come subtitleTimes in ChapterOverlay.tsx. */
  const C = (id, n) => {
    const s = S[id];
    const w = s.testo.map((l) => l.length + 6);
    const tot = w.reduce((a, b) => a + b, 0);
    let cur = 0.15;
    for (let k = 0; k < n; k++) cur += (w[k] / tot) * (s.dur - 0.35);
    return s.start + cur;
  };
  /** Istante (assoluto) della frase n più d, sulla croma: gli stessi istanti degli eventi di Schema.tsx. */
  const at = (id, n, d = 0) => G0 + Math.round((C(id, n) + d - G0) / CROMA) * CROMA;
  const B = (t) => Math.round(t / BAR) * BAR;
  const Bn = (t) => Math.ceil(t / BAR - 1e-6) * BAR;
  const kk = (t) => (((Math.floor(t / BAR + 1e-6)) % 4) + 4) % 4;
  const start = (id) => S[id].start;
  const end = (id) => S[id].start + S[id].dur;
  const F = T.finale;

  // ---------------------------------------------------------------- i silenzi dopo i colpi forti (prima delle note)
  const defeat = at('origine', 1, 1.2);
  const conquest = at('ocarina', 2, 1.6);
  const win = at('ocarina', 3, 1.6);
  const split = at('triforza', 3, 0.5);
  // prima dei colpi forti la musica si ritira (resta solo il rullo del piatto), dopo tace un battito
  for (const h of [defeat, conquest, win]) taci(mix, h - 1.1, h - 0.03);
  taci(mix, split - 1.1, split - 0.03);
  taci(mix, split + 0.05, split + BEAT);
  taci(mix, at('crepuscolo', 1, 1.8) - 1.1, at('crepuscolo', 1, 1.8) - 0.03);
  taci(mix, at('crepuscolo', 1, 1.8) + 0.05, at('crepuscolo', 1, 1.8) + BEAT);
  taci(mix, defeat + 0.05, defeat + BEAT);
  taci(mix, conquest + 0.05, conquest + BEAT);
  taci(mix, win + 0.05, win + BEAT * 1.2);

  // ---------------------------------------------------------------- strumenti
  const harpN = (t, m, { vel = 44, pan = -0.2, dur = 2.2, gain = 0.85 } = {}) => suona(mix, 'arpa', m, { t, dur, vel: vel * 1.3, pan, rev: 0.6, gain, release: 1.4 });
  /** L'arpa a tre quarti: basso sul primo battito, arpeggio a crome sul resto della battuta. */
  const valzer = (from, to, { chords = MAJ, vel = 40, gain = 0.85 } = {}) => {
    for (let t = from; t < to - 0.3; t += BAR) {
      const [root, iv] = chords[kk(t)];
      harpN(t, root + 12, { vel: vel + 6, pan: -0.3, gain, dur: BAR });
      const up = [root + 24, root + 24 + iv[1], root + 24 + iv[2], root + 36, root + 24 + iv[2], root + 24 + iv[1]];
      up.forEach((m, j) => { if (j > 0 && t + j * CROMA < to - 0.1) harpN(t + j * CROMA, m, { vel: vel - 4 + (j === 3 ? 4 : 0), pan: 0.15, gain, dur: 1.4 }); });
    }
  };
  const pad = (from, to, { chords = MAJ, vel = 40, gain = 0.32, high = false } = {}) => {
    for (let t = from; t < to - 0.4; t += BAR) {
      const k = kk(t);
      const [root, iv] = chords[k];
      const d = Math.min(BAR * 1.02, to - t);
      archi(mix, root + 12, { t, dur: d, vel: vel + 6, pan: -0.3, rev: 0.55, gain: gain * 1.2, attack: 0.6, release: 1.2, seed: k });
      iv.slice(1, 3).forEach((v, j) => archi(mix, root + 24 + v, { t: t + 0.03 * j, dur: d, vel: vel + 4, pan: 0.1 + j * 0.25, rev: 0.55, gain, attack: 0.6, release: 1.2, seed: k + j + 1 }));
      suona(mix, 'contrabbasso', root, { t, dur: d, vel: vel + 8, gain: gain * 1.1, attack: 0.5, release: 1.2, rev: 0.5 });
      if (high) suona(mix, 'violini', root + 36 + iv[2], { t, dur: d, vel, pan: -0.2, gain: gain * 0.6, attack: 0.7, release: 1.4, rev: 0.6 });
    }
  };
  /** Il motivo su uno strumento (oct: trasporto; tr: trasporto per le tonalità minori). */
  const motif = (t0, { id = 'violino_solo', vel = 46, gain = 0.4, oct = 0, pan = 0.15, half = false, upto = 99 } = {}) => {
    const c = CROMA * (half ? 2 : 1);
    for (const [b, m, d] of MOTIF) {
      if (b >= upto) break;
      const brass = ['corno', 'tromba', 'trombone'].includes(id);
      if (id === 'arpa') harpN(t0 + b * c, m + oct, { vel: vel, pan, dur: d * c + 1 });
      else if (id === 'glockenspiel') suona(mix, 'glockenspiel', m + oct, { t: t0 + b * c, dur: 1.5, vel: vel * 1.3, pan, rev: 0.65, gain: gain, release: 1.2 });
      else suona(mix, id, m + oct, { t: t0 + b * c, dur: d * c * 0.95, vel: brass ? vel * 1.6 : vel * 1.3, pan, rev: 0.55, gain: gain * 1.5, attack: brass ? 0.04 : 0.05, release: brass ? 0.4 : 0.6 });
    }
  };
  const bell = (t, m, vel = 44, pan = -0.2, gain = 0.4) => suona(mix, 'glockenspiel', m, { t, dur: 2, vel: vel * 1.3, pan, rev: 0.65, gain, release: 1.3 });
  const gliss = (t, from, to, { dur = 0.8, vel = 40 } = {}) => {
    const scale = [0, 2, 4, 5, 7, 9, 10];
    const notes = [];
    for (let m = Math.min(from, to); m <= Math.max(from, to); m++) if (scale.includes(((m - 41) % 12 + 12) % 12)) notes.push(m);
    if (from > to) notes.reverse();
    notes.forEach((m, j) => harpN(t + (j / notes.length) * dur, m, { vel, pan: -0.4 + (j / notes.length) * 0.8, dur: 1.6, gain: 0.7 }));
  };
  const timp = (t, m = 41, vel = 90, gain = 0.6) => suona(mix, 'timpani', m, { t, dur: 2, vel, gain, rev: 0.5, release: 0.8, seed: Math.round(t * 10) });
  const brass = (t, dur, notes, { vel = 54, gain = 0.3 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 52 ? 'trombone' : 'corno', m, { t, dur, vel: vel * 1.5, pan: -0.3 + j * 0.25, gain, attack: 0.08, release: 0.8, rev: 0.5, seed: j + 11 }));
  const trem = (t, dur, notes, { vel = 44, gain = 0.3 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 60 ? 'celli_trem' : 'violini_trem', m, { t, dur, vel: Math.max(vel, 70), pan: (j - (notes.length - 1) / 2) * 0.35, gain, attack: 0.4, release: 0.9, rev: 0.55, seed: j + 3 }));
  const pizz = (from, to, { chords = MAJ, vel = 36 } = {}) => {
    for (let t = from, b = 0; t < to - 0.1; t += BEAT, b++) {
      const [root, iv] = chords[kk(t)];
      if (b % 3 === 0) suona(mix, 'celli_pizz', root + 12, { t, dur: BEAT, vel: vel * 1.5, pan: -0.2, rev: 0.35, gain: 1.2, release: 0.25 });
      else iv.slice(1).forEach((v, j) => suona(mix, 'violini_pizz', root + 36 + v, { t, dur: BEAT * 0.5, vel: vel * 1.2, pan: 0.2, rev: 0.4, gain: 0.7, release: 0.2, seed: j }));
    }
  };
  const gong = (t, gain = 0.35) => colpo(mix, 'gong', 'gong_hit_p', { t, vel: 100, gain, rev: 0.5, seed: Math.round(t * 10) });
  const crash = (t, gain = 0.25) => colpo(mix, 'piatto_crash', 'mf', { t, vel: 100, gain, rev: 0.45, seed: Math.round(t * 10) });
  const kick = (t, gain = 0.5) => colpo(mix, 'grancassa', 'bdrum_f', { t, vel: 100, gain, rev: 0.4, seed: Math.round(t * 10) });

  // ---------------------------------------------------------------- copertina: l'arpa che sale, le scintille sui sentieri
  gliss(0.02, 53, 77, { dur: 1.0, vel: 42 });
  pad(0, G0, { vel: 36, gain: 0.26 });
  [77, 81, 84].forEach((m, k) => bell(1.33 + k * CROMA, m, 38, 0.1 + k * 0.15));
  harpN(2, 41 + 12, { vel: 44, pan: -0.3, dur: 2 });
  [65, 69, 72, 77].forEach((m, k) => harpN(2 + (k + 1) * CROMA, m, { vel: 36, pan: 0.2 }));

  // ---------------------------------------------------------------- 1 · chi: il valzer dell'arpa e il motivo al violino
  valzer(start('chi'), end('chi'));
  pad(start('chi'), end('chi'), { vel: 34, gain: 0.24 });
  motif(start('chi') + BAR, { id: 'violino_solo', vel: 38, gain: 0.3 });
  bell(at('chi', 1, 0.1), 84, 36); // Link
  bell(at('chi', 2, 0.1), 88, 36); // Zelda
  [81, 84, 88].forEach((m, k) => bell(at('chi', 3, 0.35) + k * 0.15, m, 30, -0.3 + k * 0.3)); // un Link e una Zelda nuovi

  // ---------------------------------------------------------------- 2 · l'origine: la tempesta, il demone sconfitto, la maledizione
  pad(start('origine'), Bn(defeat), { chords: MIN, vel: 38, gain: 0.3 });
  trem(start('origine'), Bn(defeat) - start('origine'), [38, 45], { vel: 40, gain: 0.16 });
  clip(mix, 'vento_leggero', { t: start('origine'), da: 4, durata: defeat - start('origine'), gain: 0.05, fadeIn: 0.8, fadeOut: 0.4, largo: 2 });
  clip(mix, 'tuono_lontano', { t: at('origine', 0, 0.6), da: 0.3, durata: 2.6, gain: 0.13, fadeOut: 1.0, rev: 0.25 });
  crescendo(mix, defeat, 0.85, { gain: 0.3 });
  timp(defeat, 38, 112, 0.75); // il demone sconfitto
  gong(defeat, 0.3);
  pad(Bn(defeat), Bn(at('origine', 3)), { chords: MIN, vel: 34, gain: 0.26 });
  // la maledizione: celli tremolo in basso e un intervallo storto del corno
  trem(at('origine', 2, 0.1), at('origine', 3) - at('origine', 2, 0.1), [38, 44], { vel: 44, gain: 0.18 });
  brass(at('origine', 2, 0.1), 1.6, [50, 56], { vel: 46, gain: 0.22 });
  // la recita che ricomincia: torna l'arpa in maggiore
  valzer(Bn(at('origine', 3)), end('origine'), { vel: 36 });
  pad(Bn(at('origine', 3)), end('origine'), { vel: 32, gain: 0.22 });
  motif(Bn(at('origine', 3)), { id: 'arpa', vel: 36, oct: 12, upto: 8 });

  // ---------------------------------------------------------------- 3 · la Triforza: tre campanelle d'oro, poi si spezza
  valzer(start('triforza'), split, { vel: 36 });
  pad(start('triforza'), end('triforza'), { vel: 34, gain: 0.26, high: true });
  [0, 1, 2].forEach((i) => bell(at('triforza', 0, 0.3) + i * 0.15 + 0.3, [77, 81, 84][i], 44, -0.4 + i * 0.4, 0.45));
  [72, 76, 79].forEach((m, i) => harpN(at('triforza', 1, 0.1 + i * 0.45), m + 12, { vel: 40, pan: -0.4 + i * 0.4 }));
  trem(at('triforza', 2, 0.2), split - at('triforza', 2, 0.2), [65, 71], { vel: 36, gain: 0.12 }); // il cuore in equilibrio? (Si naturale, magico)
  crash(split, 0.18);
  timp(split, 41, 104, 0.65);
  [84, 79, 72].forEach((m, k) => bell(split + BEAT + 0.05 + k * 0.2, m, 40, -0.4 + k * 0.4)); // tre pezzi
  pizz(Bn(split + 0.5), end('triforza'), { vel: 32 });

  // ---------------------------------------------------------------- 4 · Ocarina of Time: Ganondorf, la porta, la conquista, i sette anni, la vittoria
  pizz(start('ocarina'), Bn(conquest - 1.5), { chords: MIN, vel: 36 });
  pad(start('ocarina'), Bn(conquest - 1.5), { chords: MIN, vel: 38, gain: 0.28 });
  suona(mix, 'trombone', 38, { t: at('ocarina', 0, 0.1), dur: 1.6, vel: 72, gain: 0.3, attack: 0.06, release: 0.7, rev: 0.45 }); // Ganondorf
  gliss(at('ocarina', 1, 0.2) - 0.4, 60, 84, { dur: 0.6, vel: 40 }); // la porta del tempio che si apre
  [79, 84, 88].forEach((m, i) => bell(at('ocarina', 2, 0.1) + i * 0.12 + 0.3, m, 38, -0.4 + i * 0.4)); // i tre pezzi volano ai tre
  crescendo(mix, conquest, 0.85, { gain: 0.3 });
  timp(conquest, 38, 110, 0.7);
  kick(conquest, 0.45);
  brass(conquest + BEAT, 2.6, [38, 45, 50], { vel: 56, gain: 0.28 }); // Hyrule conquistata
  trem(conquest + BEAT, at('ocarina', 3, 0.1) - conquest - BEAT + 0.4, [38, 44, 50], { vel: 44, gain: 0.16 });
  // sette anni: sette rintocchi lenti di arpa grave, poi la vittoria
  for (let k = 0; k < 4; k++) harpN(at('ocarina', 3, 0.1) + k * CROMA, [50, 53, 57, 60][k], { vel: 36, pan: -0.2 + k * 0.15 });
  crescendo(mix, win, 0.85, { gain: 0.32 });
  timp(win, 41, 116, 0.8);
  crash(win, 0.3);
  gong(win + 0.2, 0.22); // il sigillo
  brass(win + BEAT * 1.2, end('ocarina') - win - BEAT * 1.2 + 0.4, [41, 53, 57, 60], { vel: 54, gain: 0.26 });
  bell(win + BEAT * 1.2, 77, 40);

  // ---------------------------------------------------------------- 5 · il bivio: indietro nel tempo, l'inchiostro, il motivo che si divide in tre
  pad(start('bivio'), end('bivio'), { vel: 34, gain: 0.26 });
  valzer(start('bivio'), at('bivio', 2, -0.2), { vel: 34 });
  gliss(at('bivio', 0, 0.6), 89, 60, { dur: 0.9, vel: 38 }); // indietro nel tempo
  [88, 84, 81, 77].forEach((m, k) => bell(at('bivio', 0, 0.6) + k * 0.2, m, 34, 0.3 - k * 0.2));
  harpN(at('bivio', 1, 1.3), 53, { vel: 46 }); bell(at('bivio', 1, 1.3), 89, 38); // il bivio
  // i tre colori del motivo, sfalsati di una croma come tre rami che si separano
  const b2 = Bn(at('bivio', 2, -0.6));
  motif(b2, { id: 'trombone', vel: 40, gain: 0.26, oct: -24, pan: -0.5 });
  motif(b2 + CROMA, { id: 'arpa', vel: 40, oct: 0, pan: 0 });
  motif(b2 + CROMA, { id: 'glockenspiel', vel: 32, gain: 0.25, oct: 12, pan: 0.1 });
  motif(b2 + 2 * CROMA, { id: 'violino_solo', vel: 40, gain: 0.3, oct: -12, pan: 0.5 });
  valzer(B(at('bivio', 3)), end('bivio'), { vel: 30 });

  // ---------------------------------------------------------------- 6 · l'eroe perde: Re minore, tromboni, i sette saggi
  pad(start('sconfitta'), end('sconfitta'), { chords: MIN, vel: 38, gain: 0.3 });
  suona(mix, 'trombone', 38, { t: at('sconfitta', 0, 0.3), dur: 2.0, vel: 74, gain: 0.32, attack: 0.06, release: 0.8, rev: 0.45 }); // Link perde
  timp(at('sconfitta', 0, 0.3), 38, 96, 0.5);
  trem(at('sconfitta', 1, 0.1), 1.6, [50, 57, 62], { vel: 46, gain: 0.16 });
  [77, 81, 84].forEach((m, i) => bell(at('sconfitta', 1, 0.1) + i * 0.3, m - 4, 34, -0.3 + i * 0.3)); // la Triforza intera
  for (let i = 0; i < 7; i++) bell(at('sconfitta', 2, 0.6) + i * (1.2 / 7), [74, 77, 81, 84, 86, 89, 93][i], 36, -0.6 + i * 0.2); // i sette saggi
  clip(mix, 'campana_grave', { t: at('sconfitta', 2, 1.8), da: 0.45, durata: 2.4, gain: 0.35, fadeOut: 1.2, rev: 0.4 }); // il sigillo
  motif(Bn(at('sconfitta', 3)) , { id: 'trombone', vel: 38, gain: 0.24, oct: -24 - 3 });

  // ---------------------------------------------------------------- 7 · il mare: arpa e glockenspiel, le onde che salgono
  valzer(start('mare'), end('mare'), { chords: SEA, vel: 36 });
  pad(start('mare'), at('mare', 1, 0.4), { chords: SEA, vel: 32, gain: 0.22 });
  bell(at('mare', 0, 0.6), 81, 30);
  // il diluvio: archi che crescono mentre il mare sale
  [53, 60, 65, 69].forEach((m, j) => archi(mix, m, { t: at('mare', 1, 0.4), dur: 2.2, vel: 54, pan: -0.3 + j * 0.2, rev: 0.55, gain: 0.26, attack: 1.6, release: 1.2, seed: j }));
  clip(mix, 'risacca', { t: at('mare', 1, 0.4), da: 2, durata: end('mare') - at('mare', 1, 0.4), gain: 0.09, fadeIn: 1.5, fadeOut: 1.2, largo: 3 });
  pad(Bn(at('mare', 1, 2.4)), end('mare'), { chords: SEA, vel: 34, gain: 0.24, high: true });
  [84, 88, 91].forEach((m, k) => bell(at('mare', 2, 0.1) + k * 0.2, m, 34, -0.3 + k * 0.3)); // le isole
  motif(Bn(at('mare', 2)), { id: 'glockenspiel', vel: 30, gain: 0.22, oct: 12 });
  clip(mix, 'ali', { t: at('mare', 3, 0.2), da: 0.13, durata: 1.4, gain: 0.6, fadeOut: 0.5, rev: 0.3, pan: 0.3 }); // gabbiani: la nuova partenza

  // ---------------------------------------------------------------- 8 · il crepuscolo: Si bemolle minore, violino solo, il varco
  pad(start('crepuscolo'), end('crepuscolo'), { chords: TW, vel: 36, gain: 0.28 });
  clip(mix, 'vento_leggero', { t: start('crepuscolo'), da: 4, durata: 12, gain: 0.05, fadeIn: 1, fadeOut: 1, largo: 3 });
  motif(start('crepuscolo') + BAR, { id: 'violino_solo', vel: 40, gain: 0.3, oct: -12 + 1 });
  // cacciato nel Crepuscolo: un risucchio di archi verso il basso e un colpo sordo
  trem(at('crepuscolo', 1, 0.3), 1.5, [58, 65, 70], { vel: 44, gain: 0.15 });
  timp(at('crepuscolo', 1, 1.8), 34, 110, 0.7);
  [82, 77, 70].forEach((m, k) => bell(at('crepuscolo', 1, 1.8) + BEAT + 0.05 + k * 0.25, m, 30, 0.3 - k * 0.3));
  // torna a minacciare Hyrule
  suona(mix, 'trombone', 34, { t: at('crepuscolo', 3, 0.3), dur: 1.8, vel: 70, gain: 0.3, attack: 0.08, release: 0.7, rev: 0.45 });
  trem(at('crepuscolo', 3, 0.3), end('crepuscolo') - at('crepuscolo', 3, 0.3), [46, 53], { vel: 42, gain: 0.15 });

  // ---------------------------------------------------------------- 9 · molto dopo: l'orchestra si apre, poi la domanda sospesa
  const q = at('dopo', 2, 1.2);
  valzer(start('dopo'), Bn(q), { vel: 38 });
  pad(start('dopo'), Bn(q), { vel: 38, gain: 0.3, high: true });
  brass(start('dopo'), 3.8, [41, 53, 60, 65], { vel: 46, gain: 0.2 });
  motif(start('dopo') + BAR, { id: 'corno', vel: 34, gain: 0.24, oct: -12 });
  [84, 89].forEach((m, k) => bell(at('dopo', 0, 0.3) + k * 1.0, m, 32, 0.2)); // i due cartigli
  // i tre colori, piano, mentre i rami tratteggiati scendono
  harpN(at('dopo', 2, 0.1), 65, { vel: 34 }); suona(mix, 'trombone', 41, { t: at('dopo', 2, 0.3), dur: 1, vel: 50, gain: 0.2, attack: 0.05, release: 0.5, rev: 0.45 });
  suona(mix, 'violino_solo', 72, { t: at('dopo', 2, 0.5), dur: 1, vel: 50, gain: 0.35, attack: 0.05, release: 0.6, rev: 0.5 });
  // la domanda: un accordo sospeso che non si risolve (Si bemolle con la nona sopra il Do)
  [36, 46, 53, 57, 60, 62].forEach((m, j) => archi(mix, m, { t: q, dur: F - q + 0.4, vel: 48, pan: -0.4 + j * 0.16, rev: 0.6, gain: 0.26, attack: 0.5, release: 1.4, seed: j + 20 }));
  bell(q, 86, 40); harpN(q, 62, { vel: 40 });
  valzer(B(at('dopo', 3)), F, { vel: 30, chords: [[48, [0, 5, 7]], [46, [0, 4, 7]], [48, [0, 5, 7]], [46, [0, 4, 7]]] });

  // ---------------------------------------------------------------- finale: la cadenza in Fa maggiore
  gliss(F - 0.1, 53, 84, { dur: 0.9, vel: 40 });
  [41, 53, 57, 60, 65, 69].forEach((m, j) => archi(mix, m, { t: F, dur: 3.8, vel: 50, pan: -0.4 + j * 0.16, rev: 0.6, gain: 0.28, attack: 0.3, release: 1.6, seed: j + 30 }));
  brass(F, 3.6, [53, 57, 60], { vel: 44, gain: 0.18 });
  [77, 81, 84, 89].forEach((m, k) => bell(F + 0.6 + k * CROMA, m, 34, -0.3 + k * 0.2));
};
