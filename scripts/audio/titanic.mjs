// Colonna sonora originale di Titanic, discreta sotto la voce.
// Orchestra campionata (VSCO-2 CE e VCSL, CC0: scripts/audio/campioni.mjs): pianoforte a coda, archi, arpa, corni,
// violino solo, timpani e percussioni. Tema inventato qui, in Mi bemolle maggiore e in 4/4 a 72 bpm (scene intime a metà
// passo, la festa in terza classe a passo doppio; 10 s = 3 battute, così i capitoli cadono sul battere): una melodia ampia che sale per terze e ricade, lontana dalle musiche
// del film (niente flauto irlandese, niente voce femminile, niente melodia della canzone). Nella tragedia lo stesso tema
// passa in Do minore; nel finale torna in maggiore.
// Effetti registrati (archivio CC0 di Craig Smith: scripts/audio/effetti.mjs) agganciati alle frasi dei sottotitoli
// (tempi come in ChapterOverlay) e agli eventi delle scene in src/scenes/titanic/.
import { suona, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte_coda', 'violini', 'viole', 'celli', 'contrabbasso', 'celli_trem', 'violini_trem', 'contrabbasso_pizz',
  'violini_pizz', 'violino_solo', 'arpa', 'corno', 'glockenspiel', 'timpani', 'gong', 'piatto_sospeso', 'grancassa_rullo', 'tom', 'cassa'];
export const effetti = ['onde', 'risacca', 'sirena_nebbia', 'campanello', 'scatti', 'serratura', 'stoffa', 'pagine', 'tintinnio', 'voci_sala',
  'vento_leggero', 'campana_grave', 'ghiaccio_frana', 'metallo_colpi', 'catene', 'legno_cigolio', 'metallo_schianto', 'vento_artico', 'colpi_legno'];
/** Sala ampia e morbida (il grande scalone): coda lunga, alte rotonde. */
export const sala = { rt60: 2.6, brillo: 6000, predelay: 0.03, wet: 0.5 };

/** Un solo tempo per tutto il film (CLAUDE.md, «Musica»): le scene intime a metà passo (36), la festa a passo doppio (144). */
const BPM = 72;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;

// Tema (16 tempi, Mi bemolle maggiore): [tempo, nota MIDI, durata in tempi]
const THEME = [[0, 70, 1], [1, 75, 1], [2, 79, 1.5], [3.5, 77, 0.5], [4, 82, 3], [7, 80, 1],
  [8, 79, 1], [9, 77, 1], [10, 75, 1.5], [11.5, 72, 0.5], [12, 74, 2], [14, 75, 2]];
const CH = [[51, 55, 58], [48, 51, 55], [44, 48, 51], [46, 50, 53]]; // Mi♭, Do minore, La♭, Si♭
const CH_MIN = [[48, 51, 55], [44, 48, 51], [41, 44, 48], [43, 47, 50]]; // Do minore, La♭, Fa minore, Sol
// la giga della festa (inventata): crome del violino su ogni accordo, due battute per accordo
const JIG = [0, 4, 7, 12, 7, 4, 7, 4];

export default (mix, T) => {
  const { segments } = timeline(loadFilm('titanic'));
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
  const B = (t) => T.relitto + Math.round((t - T.relitto) / BAR) * BAR;
  /** Istante della scena: `f` della distanza tra l'inizio del capitolo e la frase n (come in Naufragio.tsx). */
  const frac = (id, n, f) => T[id] + (cue(id, n) - T[id]) * f;

  /** Nota tenuta a lungo: i campioni durano pochi secondi, quindi si ribatte a ogni battuta con attacco morbido. */
  const hold = (id, m, t0, dur, o = {}) => {
    for (let t = t0, k = 0; t < t0 + dur - 0.3; t += BAR, k++)
      suona(mix, id, m, { attack: 0.4, release: 1, rev: 0.55, ...o, t, dur: Math.min(BAR + 0.3, t0 + dur - t), seed: (o.seed || 0) + k });
  };
  /** Archi tenuti sugli accordi (una battuta ciascuno; half: due battute). */
  const strings = (from, to, { minor = false, half = false, vel = 50, gain = 0.4, bass = true, high = false, k0 = 0 } = {}) => {
    const step = BAR * (half ? 2 : 1), chords = minor ? CH_MIN : CH;
    const a = { attack: 0.4, release: 1.1, rev: 0.55 };
    for (let t = from, k = k0; t < to - 0.4; t += step, k++) {
      const d = Math.min(step, to - t), [r, m, f] = chords[k % 4];
      hold('celli', r, t, d, { vel, pan: -0.35, gain: gain * 1.1, ...a, seed: k });
      hold('viole', m, t, d, { vel: vel - 4, pan: 0.1, gain: gain * 0.9, ...a, seed: k + 1 });
      hold('viole', f, t, d, { vel: vel - 4, pan: 0.3, gain: gain * 0.8, ...a, seed: k + 2 });
      if (bass) hold('contrabbasso', r - 12, t, d, { vel, pan: -0.1, gain: gain, ...a });
      if (high) hold('violini', f + 12, t, d, { vel: vel - 2, pan: -0.2, gain: gain * 0.7, attack: 0.5, release: 1.3, rev: 0.6 });
    }
  };
  /** Il tema: pianoforte (o violino solo, o violini) da `from` a `to`; minor lo porta in Do minore. */
  const theme = (from, to, { half = false, inst = 'pianoforte_coda', vel = 58, gain = 0.55, oct = 0, keep = 1 } = {}) => {
    const beat = BEAT * (half ? 2 : 1), loop = 16 * beat;
    for (let L = from; L < to - 0.3; L += loop) {
      THEME.forEach(([b, m, d], i) => {
        const t = L + b * beat;
        if (t >= to - 0.3 || (keep < 1 && i % 3 === 2)) return;
        const mm = m + oct; // in minore le stesse note (Do minore è la relativa di Mi♭), sugli accordi minori
        const dd = Math.min(d * beat * 1.05, to - t);
        if (inst === 'pianoforte_coda') suona(mix, inst, mm, { t, dur: Math.min(dd, 4), vel, pan: 0.1, rev: 0.45, gain, release: 1 });
        else suona(mix, inst, mm, { t, dur: dd, vel, pan: 0.05, rev: 0.55, gain, attack: 0.15, release: 0.9, seed: i });
      });
    }
  };
  /** Arpa arpeggiata su un accordo, in salita. */
  const harp = (chord, t, { step = BEAT / 8, vel = 56, gain = 0.45 } = {}) =>
    [...chord, ...chord.map((m) => m + 12), chord[0] + 24].forEach((m, j) => suona(mix, 'arpa', m + 12, { t: t + j * step, dur: 1.8, vel, pan: -0.4 + j * 0.12, rev: 0.5, gain, release: 1.4 }));
  const glock = (m, t, vel = 52, gain = 0.16) => suona(mix, 'glockenspiel', m, { t, dur: 2, vel, pan: 0.3, rev: 0.6, gain, release: 1.4 });
  const gong = (t, gain = 0.4, file = 'gong_hit_p') => colpo(mix, 'gong', file, { t, vel: 80, rev: 0.55, gain, dur: 3.5, release: 1 });
  const roll = (t, gain = 0.3) => colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_roll2_cresc', { t, vel: 60, rev: 0.45, gain, dur: 1.6, release: 0.4 });
  const timp = (t, m = 39, vel = 90, gain = 1) => suona(mix, 'timpani', m, { t, dur: 1.6, vel, gain, rev: 0.5, release: 0.6, seed: Math.round(t * 10) });
  const trem = (t, dur, notes, { vel = 54, gain = 0.38 } = {}) => notes.forEach((m, j) =>
    hold(m < 60 ? 'celli_trem' : 'violini_trem', m, t, dur, { vel, pan: (j - (notes.length - 1) / 2) * 0.35, gain, attack: 0.5, release: 0.9, rev: 0.55, seed: j + 3 }));
  const sea = (t, durata, gain, da = 2) => clip(mix, 'risacca', { t, da, durata, gain, fadeIn: 1, fadeOut: 1, largo: 3, rev: 0.1 });

  // ---- copertina: arpa sull'accordo di Mi♭, il tema in eco, la sirena lontana, il mare
  sea(0, T.relitto + 0.5, 0.06);
  harp(CH[0], 0.2, { vel: 58 });
  clip(mix, 'sirena_nebbia', { t: 0.9, da: 0.2, durata: 2.8, gain: 0.05, lp: 1500, fadeOut: 1.2, rev: 0.45, pan: -0.2 });
  [[1.5, 75], [1.5 + BEAT / 2, 79], [1.5 + BEAT, 82], [4 - BEAT, 79]].forEach(([t, m]) => suona(mix, 'pianoforte_coda', m, { t, dur: 1.4, vel: 56, pan: 0.1, rev: 0.5, gain: 0.5, release: 1 }));
  glock(94, 1.2, 50);

  // ---- relitto: buio profondo; pedale grave, pianoforte rado; la cassaforte e il foglio che brilla
  hold('contrabbasso', 27, T.relitto, T.rose - T.relitto, { vel: 50, gain: 0.55, attack: 1, release: 1.2, rev: 0.5 });
  trem(T.relitto, B(cue('relitto', 2)) - T.relitto, [39, 46, 63], { vel: 46, gain: 0.32 });
  strings(T.relitto, B(cue('relitto', 2)), { half: true, minor: true, vel: 50, gain: 0.5, bass: false, high: true });
  theme(B(T.relitto), B(cue('relitto', 2)), { half: true, vel: 50, gain: 0.5, keep: 0.6 });
  clip(mix, 'serratura', { t: cue('relitto', 2) + 0.1, da: 5.55, durata: 0.6, gain: 0.3, lp: 1800, rev: 0.5, pan: -0.2 }); // la cassaforte si apre
  strings(B(cue('relitto', 2)), B(T.rose), { half: true, vel: 48, gain: 0.45, high: true });
  [87, 91, 94, 99].forEach((m, j) => glock(m, cue('relitto', 2) + 0.6 + j * BEAT / 4, 50));

  [94, 99].forEach((m, j) => glock(m, cue('relitto', 1) + j * BEAT / 4, 46)); // il diamante «miraggio»

  // ---- rose: il racconto comincia; tema lento al pianoforte, il telefono che squilla, poi archi caldi
  theme(B(T.rose), B(T.imbarco), { half: true, vel: 54, gain: 0.5 });
  strings(B(T.rose), B(cue('rose', 2)), { half: true, vel: 48, gain: 0.42 });
  [0, 0.45].forEach((d) => clip(mix, 'campanello', { t: cue('rose', 1) + d, da: 0, durata: 0.4, gain: 0.12, rev: 0.3, pan: 0.3 }));
  clip(mix, 'scatti', { t: cue('rose', 1) + 0.9 - 0.18, da: 0.62, durata: 0.25, gain: 0.2, rev: 0.25, pan: 0.3 }); // la cornetta si alza
  strings(B(cue('rose', 2)), B(T.imbarco), { half: true, vel: 48, gain: 0.45, high: true });

  // ---- imbarco: il tema pieno, corni e timpani, la sirena della nave, la folla
  clip(mix, 'sirena_nebbia', { t: T.imbarco + 0.2, da: 0.2, durata: 3.5, gain: 0.12, fadeOut: 1.5, rev: 0.35, pan: -0.2 });
  clip(mix, 'voci_sala', { t: T.imbarco, da: 3, durata: T.poppa - T.imbarco, gain: 0.04, fadeIn: 1, fadeOut: 1, largo: 4, rev: 0.2 });
  strings(B(T.imbarco), B(T.poppa), { vel: 54, gain: 0.4, high: true });
  theme(B(T.imbarco), B(T.poppa), { inst: 'violini', vel: 56, gain: 0.32 });
  theme(B(T.imbarco), B(T.poppa), { vel: 50, gain: 0.35 });
  [0, 2].forEach((b) => suona(mix, 'corno', 63, { t: B(T.imbarco) + b * BAR, dur: BAR * 1.5, vel: 56, gain: 0.35, attack: 0.3, release: 1, rev: 0.5, pan: 0.2 }));
  timp(B(T.imbarco), 39, 80, 0.8);
  clip(mix, 'pagine', { t: cue('imbarco', 2) + 0.6, da: 1, durata: 0.5, gain: 0.2, fadeOut: 0.2, rev: 0.25, pan: 0.35 }); // i biglietti vinti
  glock(94, cue('imbarco', 2) + 0.65, 54);

  // ---- poppa: notte, la scia; pianoforte e archi soffusi a metà passo; lo scialle, l'invito
  sea(T.poppa, T.festa - T.poppa, 0.06, 8);
  theme(B(T.poppa), B(T.festa), { half: true, vel: 52, gain: 0.45 });
  strings(B(T.poppa), B(cue('poppa', 1)), { half: true, minor: true, vel: 42, gain: 0.28 });
  trem(B(T.poppa), B(cue('poppa', 1)) - B(T.poppa), [72, 75], { vel: 38, gain: 0.18 });
  strings(B(cue('poppa', 1)), B(T.festa), { half: true, vel: 46, gain: 0.42 });
  clip(mix, 'stoffa', { t: cue('poppa', 1) + 0.2, da: 15, durata: 1.2, gain: 0.2, fadeIn: 0.2, fadeOut: 0.5, rev: 0.3, pan: -0.2 });
  harp(CH[0], cue('poppa', 2) + 0.4);

  // ---- festa: prima la sala dorata (archi rigidi), poi la terza classe: giga a passo doppio, tamburo, boccali
  const J = B(T.festa) + BAR; // la giga parte sul battere, con l'immagine della festa ormai piena (Festa.tsx: cues[1] + 0,8)
  harp(CH[0], B(T.festa), { vel: 56 });
  strings(B(T.festa), J, { vel: 56, gain: 0.6, high: true });
  strings(J, B(T.prua), { vel: 46, gain: 0.35, bass: false }); // archi leggeri sotto la giga
  for (let t = J, k = 0; t < B(T.prua) - 0.05; t += BEAT / 2, k++) {
    const [r] = CH[Math.floor(k / 16) % 4];
    suona(mix, 'violino_solo', r + 24 + JIG[k % 8], { t, dur: BEAT / 2, vel: k % 4 ? 52 : 64, pan: 0.15, rev: 0.35, gain: 0.55, attack: 0.005, release: 0.15, seed: k });
    if (k % 2 === 1) suona(mix, 'violini_pizz', r + 12 + (k % 4 === 1 ? 4 : 7), { t, dur: BEAT / 2, vel: 54, pan: -0.25, rev: 0.3, gain: 0.8, release: 0.2 });
    if (k % 2 === 0) colpo(mix, k % 4 ? 'tom' : 'cassa', k % 4 ? 'TomH_HitS_v2' : 'v3', { t, vel: k % 4 ? 70 : 90, rev: 0.3, gain: 0.55 });
    if (k % 4 === 0) suona(mix, 'contrabbasso_pizz', r - 12, { t, dur: BEAT, vel: 70, pan: -0.1, rev: 0.3, gain: 0.4, release: 0.3 });
  }
  clip(mix, 'voci_sala', { t: J, da: 8, durata: T.prua - J, gain: 0.05, fadeIn: 0.5, fadeOut: 0.8, largo: 4, rev: 0.2 });
  [0, 1, 2].forEach((i) => clip(mix, 'tintinnio', { t: J + i * 2 * BEAT, da: 4.13, durata: 0.35, gain: 0.15, rev: 0.3, pan: -0.3 + i * 0.3 }));
  roll(cue('festa', 2) - 1, 0.2);

  // ---- prua: il tema grande, archi e corni a metà passo, il vento; l'album e la cassaforte che si chiude
  clip(mix, 'vento_leggero', { t: T.prua, da: 0.2, durata: cue('prua', 1) - T.prua + 0.5, gain: 0.07, fadeIn: 0.8, fadeOut: 0.8, largo: 4 });
  strings(B(T.prua), B(T.iceberg), { half: true, vel: 52, gain: 0.4, high: true });
  theme(B(T.prua), B(T.iceberg), { half: true, inst: 'violini', vel: 56, gain: 0.34, oct: 12 });
  theme(B(T.prua), B(T.iceberg), { half: true, vel: 50, gain: 0.35 });
  harp(CH[0], B(T.prua));
  suona(mix, 'corno', 58, { t: B(T.prua) + 2 * BAR, dur: 2 * BAR, vel: 54, gain: 0.3, attack: 0.5, release: 1.2, rev: 0.55 });
  clip(mix, 'pagine', { t: cue('prua', 1) + 0.2, da: 1, durata: 1, gain: 0.2, fadeOut: 0.3, rev: 0.3, pan: -0.2 });
  clip(mix, 'serratura', { t: cue('prua', 2) + 1.25, da: 2.45, durata: 0.42, gain: 0.3, pan: 0.3, rev: 0.3 }); // la cassaforte si chiude

  // ---- iceberg: mare piatto, tensione; la campana d'allarme, il ghiaccio che frana, il gong; le poche scialuppe
  const hit = cue('iceberg', 0) + 2.2; // Iceberg.tsx: la prua struscia sull'iceberg
  trem(B(T.iceberg), hit - B(T.iceberg), [36, 43, 72, 73], { vel: 46, gain: 0.28 });
  hold('contrabbasso', 24, T.iceberg, hit - T.iceberg + 1, { vel: 50, gain: 0.45, attack: 0.8, release: 1, rev: 0.5 });
  clip(mix, 'campana_grave', { t: hit - 1.5, da: 0.53, durata: 1.8, gain: 0.25, fadeOut: 0.6, rev: 0.4, pan: -0.3 });
  clip(mix, 'ghiaccio_frana', { t: hit - 0.1, da: 0.2, durata: 2.6, gain: 0.22, fadeOut: 1, rev: 0.3 });
  clip(mix, 'metallo_colpi', { t: hit, da: 0.56, durata: 0.9, gain: 0.2, lp: 1500, fadeOut: 0.4, rev: 0.4 });
  timp(hit, 36, 100, 0.8);
  gong(hit + 0.05, 0.4, 'gong_hit_mp');
  strings(B(cue('iceberg', 1)), B(T.manette), { minor: true, vel: 50, gain: 0.36 });
  theme(B(cue('iceberg', 1)), B(T.manette), { vel: 54, gain: 0.42, oct: -12 });

  // ---- manette: il battito del contrabbasso e dei timpani, l'acqua che sale, l'ascia e la catena
  for (let t = B(T.manette); t < T.scialuppa - 0.3; t += BEAT) {
    suona(mix, 'contrabbasso_pizz', 36, { t, dur: BEAT, vel: 66, pan: -0.1, rev: 0.3, gain: 0.5, release: 0.3 });
    if ((t - B(T.manette)) / BEAT % 2 < 0.5) timp(t, 36, 70, 0.6);
  }
  trem(B(T.manette), B(T.scialuppa) - B(T.manette), [48, 51, 72, 75], { vel: 52, gain: 0.34 });
  clip(mix, 'onde', { t: cue('manette', 1), da: 2, durata: T.scialuppa - cue('manette', 1), gain: 0.08, lp: 1200, fadeIn: 1, fadeOut: 0.8, largo: 2, rev: 0.4 });
  clip(mix, 'colpi_legno', { t: cue('manette', 2) + 0.8, da: 5.74, durata: 0.4, gain: 0.4, rev: 0.4 }); // l'ascia
  clip(mix, 'catene', { t: cue('manette', 2) + 0.82, da: 0.4, durata: 0.5, gain: 0.35, rev: 0.35, pan: -0.3 }); // la catena si spezza
  timp(cue('manette', 2) + 0.8, 36, 100, 0.7);
  clip(mix, 'scatti', { t: cue('manette', 0) + 1.15 - 0.18, da: 0.62, durata: 0.25, gain: 0.15, rev: 0.3, pan: 0.4 }); // il diamante infilato in tasca

  // ---- scialuppa: il tema in minore sugli archi, i razzi di soccorso, le funi che cigolano
  strings(B(T.scialuppa), B(T.naufragio), { minor: true, vel: 56, gain: 0.58, high: true });
  trem(B(T.scialuppa), B(T.naufragio) - B(T.scialuppa), [36, 43], { vel: 46, gain: 0.3 });
  theme(B(T.scialuppa), B(T.naufragio), { inst: 'violini', vel: 56, gain: 0.4 });
  [T.scialuppa + 0.6, cue('scialuppa', 1) + 0.2, cue('scialuppa', 2) + 1.5].forEach((t) => { roll(t - 1.2, 0.18); timp(t, 43, 80, 0.6); }); // Scialuppa.tsx: flares
  clip(mix, 'legno_cigolio', { t: T.scialuppa + 0.4, da: 2.85, durata: 1.2, gain: 0.15, fadeOut: 0.3, rev: 0.4, pan: -0.3 });
  clip(mix, 'legno_cigolio', { t: cue('scialuppa', 2) + 1, da: 0.25, durata: 0.9, gain: 0.12, fadeOut: 0.3, rev: 0.4, pan: -0.3 }); // riprende a scendere
  harp(CH[0], cue('scialuppa', 2), { vel: 52 }); // risale da Jack

  // ---- naufragio: la nave si spezza (schianto, timpani, gong), poi il silenzio gelato: violino solo in minore
  const brk = frac('naufragio', 1, 0.45);
  trem(B(T.naufragio), brk - B(T.naufragio), [36, 43, 48, 72], { vel: 58, gain: 0.34 });
  colpo(mix, 'grancassa_rullo', 'bdrum_roll1', { t: brk - 2.5, vel: 70, rev: 0.4, gain: 0.3, dur: 2.6, release: 0.5 });
  clip(mix, 'metallo_schianto', { t: brk - 0.05, da: 0.05, durata: 1.4, gain: 0.35, fadeOut: 0.5, rev: 0.45 });
  timp(brk, 36, 105, 0.85);
  gong(brk + 0.05, 0.35, 'gong_hit_mp');
  clip(mix, 'onde', { t: cue('naufragio', 1) + 1.3, da: 7.2, durata: 1.2, gain: 0.2, fadeIn: 0.1, fadeOut: 0.6, rev: 0.2, pan: 0.1 }); // la porta si rovescia
  clip(mix, 'vento_artico', { t: cue('naufragio', 1) - 0.5, da: 2, durata: T.cuore - cue('naufragio', 1) + 0.5, gain: 0.025, fadeIn: 1, fadeOut: 1, largo: 4, rev: 0.1 });
  strings(B(cue('naufragio', 1)), B(T.cuore), { half: true, minor: true, vel: 46, gain: 0.48, bass: false });
  theme(B(cue('naufragio', 1)), B(T.cuore), { half: true, inst: 'violino_solo', vel: 54, gain: 0.55 });
  harp(CH_MIN[0], cue('naufragio', 2), { vel: 44, gain: 0.35 }); // la brina

  // ---- cuore: il tema al pianoforte con l'arpa; il diamante che cade (glockenspiel e tuffo), poi la domanda sospesa
  theme(B(T.cuore), T.finale, { half: true, vel: 56, gain: 0.5 });
  strings(B(T.cuore), T.finale, { half: true, vel: 48, gain: 0.46, high: true });
  const fall0 = cue('cuore', 1) + 1.4, fall1 = cue('cuore', 2) + 0.6; // Cuore.tsx: il diamante cade e affonda
  [99, 94, 91, 87, 82].forEach((m, j) => glock(m, fall0 + j * BEAT / 4, 50 - j * 3));
  clip(mix, 'onde', { t: fall0 + 0.25 * (fall1 - fall0) - 0.1, da: 7.2, durata: 0.9, gain: 0.14, fadeIn: 0.05, fadeOut: 0.5, rev: 0.3 });
  sea(cue('cuore', 2), T.finale - cue('cuore', 2) + 1, 0.05, 20);

  // ---- finale: accordo di Mi♭ degli archi, arpa, tema in eco
  const F = T.finale; // a 72 bpm la battuta più vicina cadrebbe 1,3 s dentro il finale: l'accordo entra con l'immagine
  harp(CH[0], F, { vel: 60 });
  [['contrabbasso', 39], ['celli', 51], ['viole', 55], ['viole', 58], ['violini', 63], ['violini', 70]].forEach(([id, n], k) =>
    hold(id, n, F, T.END - F, { vel: 54, pan: (k - 2.5) * 0.2, gain: 0.42, attack: 0.3, release: 1.4, rev: 0.6, seed: 20 + k }));
  [[F + 0.6, 82], [F + 1.4, 79], [F + 2.2, 75]].forEach(([t, m]) => suona(mix, 'pianoforte_coda', m, { t, dur: 1.6, vel: 52, pan: 0.1, rev: 0.55, gain: 0.45, release: 1.2 }));
};
