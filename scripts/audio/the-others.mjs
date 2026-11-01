// Colonna sonora originale di The Others, discreta sotto la voce.
// Orchestra campionata (VSCO-2 CE e VCSL, CC0: scripts/audio/campioni.mjs): archi lenti e sospesi, arpa, pianoforte a
// coda nel registro acuto come un carillon, glockenspiel, timpani e gong lontani. Motivo inventato qui, in Re minore e in
// 4/4 a 72 bpm (10 s = 3 battute, così i capitoli cadono sul battere): una ninna nanna di cinque note che sale e ricade di
// un semitono, al pianoforte acuto. Lontano dalla musica del film: niente tema degli archi in valzer, niente canzoni.
// Tensione trattenuta che cresce fino alla seduta e alla rivelazione (un colpo solo, poi silenzio), poi il finale in Re
// maggiore quando il sole buca la nebbia.
// Effetti registrati (archivio CC0 di Craig Smith: scripts/audio/effetti.mjs) agganciati alle frasi dei sottotitoli
// (tempi come in ChapterOverlay) e agli eventi delle scene in src/scenes/the-others/.
import { suona, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte_coda', 'violini', 'viole', 'celli', 'contrabbasso', 'violini_trem', 'celli_trem', 'contrabbasso_pizz',
  'arpa', 'glockenspiel', 'timpani', 'gong', 'corno', 'piatto_sospeso'];
export const effetti = ['auto_epoca', 'catene', 'vento_leggero', 'vento_raffiche', 'fiammifero', 'stoffa', 'serratura', 'campanello', 'legno_cigolio', 'telo', 'pagine',
  'monete', 'campana_grave', 'tintinnio', 'colpi_legno', 'porta_cigolio'];
/** Casa grande e vuota: coda lunga, alte smorzate. */
export const sala = { rt60: 2.6, brillo: 4200, predelay: 0.03, wet: 0.5 };

/** Un solo tempo per tutto il film (CLAUDE.md, «Musica»): le scene sospese a metà passo (36), le altre a passo pieno. */
const BPM = 72;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;

// Accordi (Re minore): Re minore, Si♭, Sol minore, La (con la terza maggiore che inquieta)
const CH = [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]];
// Re maggiore per il finale: Re, Sol, Re, La
const CHM = [[50, 54, 57], [43, 47, 50], [50, 54, 57], [45, 49, 52]];
// Ninna nanna: [tempo, nota MIDI, durata in tempi]
const MOTIF = [[0, 74, 1], [1, 77, 1], [2, 81, 1.5], [3.5, 79, 0.5], [4, 78, 2], [6, 74, 2]];
const MOTIF_M = [[0, 74, 1], [1, 78, 1], [2, 81, 1.5], [3.5, 79, 0.5], [4, 78, 2], [6, 74, 2]];

export default (mix, T) => {
  const { segments } = timeline(loadFilm('the-others'));
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
  const B = (t) => T.villa + Math.round((t - T.villa) / BAR) * BAR;

  /** Archi tenuti sugli accordi, una battuta ciascuno (half: due battute). */
  const strings = (from, to, { half = false, vel = 46, gain = 0.44, bass = true, high = false, k0 = 0, chords = CH } = {}) => {
    const step = BAR * (half ? 2 : 1), a = { attack: 0.6, release: 1.4, rev: 0.6 };
    for (let t = from, k = k0; t < to - 0.4; t += step, k++) {
      const d = Math.min(step, to - t), [r, m, f] = chords[k % 4];
      suona(mix, 'celli', r - 12 + 12, { t, dur: d, vel, pan: -0.35, gain: gain * 1.1, ...a, seed: k });
      suona(mix, 'viole', m, { t, dur: d, vel: vel - 4, pan: 0.15, gain: gain * 0.8, ...a, seed: k + 1 });
      suona(mix, 'viole', f, { t, dur: d, vel: vel - 4, pan: 0.3, gain: gain * 0.7, ...a, seed: k + 2 });
      if (bass) suona(mix, 'contrabbasso', r - 12, { t, dur: d, vel: vel - 4, pan: -0.1, gain: gain * 0.9, ...a });
      if (high) suona(mix, 'violini', f + 12, { t, dur: d, vel: vel - 6, pan: -0.2, gain: gain * 0.55, attack: 0.8, release: 1.6, rev: 0.7 });
    }
  };
  /** La ninna nanna al pianoforte acuto, come un carillon (half: metà passo). */
  const lullaby = (from, to, { half = true, vel = 50, gain = 0.4, major = false, oct = 0 } = {}) => {
    const beat = BEAT * (half ? 2 : 1), loop = 8 * beat;
    for (let L = from; L < to - 0.3; L += loop) {
      for (const [b, m, d] of major ? MOTIF_M : MOTIF) {
        const t = L + b * beat;
        if (t >= to - 0.3) break;
        suona(mix, 'pianoforte_coda', m + oct, { t, dur: Math.min(d * beat, to - t), vel, pan: 0.15, rev: 0.6, gain, release: 1.2 });
        suona(mix, 'glockenspiel', m + oct + 12, { t: t + 0.01, dur: 1, vel: vel - 16, pan: 0.3, rev: 0.7, gain: gain * 0.25, release: 1 });
      }
    }
  };
  /** Arpa: arpeggi lenti sull'accordo di ogni battuta (crome). */
  const harp = (from, to, { vel = 46, gain = 0.3, k0 = 0, chords = CH } = {}) => {
    for (let t = from, k = 0; t < to - 0.2; t += BEAT / 2, k++) {
      const [r, m, f] = chords[(Math.floor(k / 8) + k0) % 4];
      suona(mix, 'arpa', [r, m, f, r + 12, f, m + 12, f + 12, m][k % 8], { t, dur: 1.6, vel: vel - (k % 4) * 3, pan: -0.25 + (k % 8) * 0.07, rev: 0.6, gain, release: 1.2 });
    }
  };
  const trem = (t, dur, notes, { vel = 46, gain = 0.3 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 60 ? 'celli_trem' : 'violini_trem', m, { t, dur, vel, pan: (j - (notes.length - 1) / 2) * 0.35, gain, attack: 0.7, release: 1, rev: 0.6, seed: j + 3 }));
  const timp = (t, m = 38, vel = 80, gain = 0.6) => suona(mix, 'timpani', m, { t, dur: 2, vel, gain, rev: 0.55, release: 0.8, seed: Math.round(t * 10) });
  const gong = (t, gain = 0.3) => colpo(mix, 'gong', 'gong_hit_p', { t, vel: 70, rev: 0.6, gain, dur: 4, release: 1.2 });
  const glock = (t, m, gain = 0.16) => suona(mix, 'glockenspiel', m, { t, dur: 1.6, vel: 46, pan: 0.25, rev: 0.7, gain, release: 1.2 });
  const wind = (t, durata, gain, da = 1) => clip(mix, 'vento_leggero', { t, da, durata, gain, fadeIn: 1, fadeOut: 1, largo: 4, rev: 0.1 });

  // ---- copertina: il vento nella nebbia, un Re grave, la ninna nanna che entra piano
  wind(0, T.villa + 0.5, 0.035);
  suona(mix, 'contrabbasso', 38, { t: 0.2, dur: 3.8, vel: 46, gain: 0.45, attack: 0.8, release: 1.2, rev: 0.6 });
  [50, 53, 57].forEach((m, j) => suona(mix, 'celli', m, { t: 0.4 + j * 0.25, dur: 3.4 - j * 0.25, vel: 44, pan: (j - 1) * 0.3, gain: 0.4, attack: 0.7, release: 1.2, rev: 0.6 }));
  [74, 77, 81].forEach((m, j) => glock(1.5 + j * BEAT, m, 0.14));

  // ---- villa: archi a metà passo, la ninna nanna; due finestre che si accendono (arpa); la lampada (fiammifero)
  wind(T.villa, T.luce - T.villa, 0.04, 6);
  strings(B(T.villa), B(T.luce), { half: true, vel: 44, gain: 0.32 });
  lullaby(B(T.villa), B(T.luce), { vel: 48, gain: 0.36 });
  [cue('villa', 1) + 0.3, cue('villa', 1) + 1.3].forEach((t, j) => suona(mix, 'arpa', [62, 65][j], { t, dur: 2, vel: 50, pan: -0.2, rev: 0.6, gain: 0.3, release: 1.4 }));
  clip(mix, 'fiammifero', { t: cue('villa', 2) + 0.2 - 0.07, da: 3.88, durata: 0.9, gain: 0.22, fadeOut: 0.3, rev: 0.25, pan: 0.35 }); // Villa.tsx: la lampada sul pilastro
  glock(cue('villa', 2) + 0.9, 86, 0.12);

  // ---- luce: la lama di sole (archi acuti), le tende che si chiudono (stoffa), la chiave che gira (serratura)
  strings(B(T.luce), B(cue('luce', 1)), { vel: 46, gain: 0.32, high: true, k0: 1 });
  harp(B(T.luce), B(T.domestici), { vel: 48, gain: 0.28 });
  lullaby(B(T.luce), B(cue('luce', 1)), { vel: 44, gain: 0.3 });
  clip(mix, 'stoffa', { t: cue('luce', 1) + 0.1, da: 15, durata: 1.3, gain: 0.22, fadeIn: 0.15, fadeOut: 0.5, pan: -0.35, rev: 0.3 }); // Luce.tsx: le tende si chiudono
  strings(B(cue('luce', 1)), B(T.domestici), { vel: 42, gain: 0.3, k0: 2 });
  clip(mix, 'serratura', { t: cue('luce', 2) + 0.4, da: 2.43, durata: 0.62, gain: 0.32, rev: 0.35, pan: 0.3 }); // la chiave gira
  clip(mix, 'catene', { t: cue('luce', 2) + 0.45, da: 1.45, durata: 0.6, gain: 0.12, fadeOut: 0.2, pan: 0.4 }); // il mazzo di chiavi oscilla
  suona(mix, 'contrabbasso_pizz', 38, { t: cue('luce', 2) + 0.45, dur: 1, vel: 60, gain: 0.35, rev: 0.4, release: 0.4 });

  // ---- domestici: le orme che se ne vanno (pizzicati), la campanella, i tre oggetti che compaiono (arpa)
  wind(T.domestici, T.pianoforte - T.domestici, 0.035, 1);
  strings(B(T.domestici), B(T.pianoforte), { half: true, vel: 48, gain: 0.44, k0: 2 });
  for (let k = 0; k < 9; k++) suona(mix, 'contrabbasso_pizz', [50, 48, 46, 45, 43, 41, 40, 38, 36][k], { t: T.domestici + BEAT / 2 + (k * BEAT) / 4, dur: 0.5, vel: 54 - k * 2, pan: -0.3 + k * 0.07, rev: 0.45, gain: 0.3, release: 0.4 });
  clip(mix, 'campanello', { t: cue('domestici', 1) + 0.3, da: 0, durata: 2, gain: 0.18, fadeOut: 0.8, rev: 0.5, pan: 0.3 }); // Domestici.tsx: la campanella oscilla
  [0.4, 1.2, 2.0].forEach((d, j) => suona(mix, 'arpa', [57, 62, 69][j], { t: cue('domestici', 2) + d, dur: 2, vel: 54, pan: -0.3 + j * 0.3, rev: 0.6, gain: 0.34, release: 1.4 }));
  lullaby(B(cue('domestici', 2)), B(T.pianoforte), { vel: 44, gain: 0.3 });

  // ---- pianoforte: tremolo grave; il cavallo a dondolo (legno che cigola); la tenda (vento); il pianoforte da solo
  trem(T.pianoforte, cue('pianoforte', 2) + 1.2 - T.pianoforte, [50, 51, 74], { vel: 44, gain: 0.3 });
  strings(B(T.pianoforte), B(cue('pianoforte', 2) + 1.2), { half: true, vel: 42, gain: 0.36, k0: 3 });
  for (let k = 0; k < 6; k++) clip(mix, 'legno_cigolio', { t: cue('pianoforte', 0) + 0.625 + k * 1.25, da: 0.25, durata: 0.8, gain: 0.14 - k * 0.016, fadeOut: 0.3, rev: 0.4, pan: -0.4 }); // Pianoforte.tsx: il cavallo dondola
  clip(mix, 'vento_raffiche', { t: cue('pianoforte', 1) + 0.1, da: 10, durata: 2.2, gain: 0.08, fadeIn: 0.5, fadeOut: 0.8, largo: 2 }); // la tenda si gonfia
  {
    // i tasti che si abbassano da soli: crome a tempo (stessa sequenza di Pianoforte.tsx)
    const seq = [15, 19, 22, 17, 20, 24, 22, 19, 15, 17, 26, 22, 20, 19, 17, 15];
    const midi = (i) => 36 + 12 * Math.floor(i / 7) + [0, 2, 4, 5, 7, 9, 11][i % 7];
    const p0 = cue('pianoforte', 2) + 1.2;
    for (let k = 0; p0 + k / 2.4 < T.album - 0.3; k++) {
      const n = seq[k % seq.length];
      suona(mix, 'pianoforte_coda', midi(n), { t: p0 + k / 2.4, dur: 0.6, vel: 56, pan: 0, rev: 0.6, gain: 0.25, release: 0.8 });
      suona(mix, 'pianoforte_coda', midi(n - 7), { t: p0 + k / 2.4 + 0.01, dur: 0.6, vel: 46, pan: -0.1, rev: 0.6, gain: 0.15, release: 0.8 });
    }
  }

  // ---- album: la soffitta, il lenzuolo che scivola (telo), l'album che si apre (pagine), le quattro foto (glockenspiel)
  strings(B(T.album), B(T.marito), { half: true, vel: 48, gain: 0.44, k0: 1 });
  harp(B(T.album), B(cue('album', 2)), { vel: 44, gain: 0.26, k0: 1 });
  clip(mix, 'telo', { t: cue('album', 0) + 0.6, da: 4.57, durata: 1.0, gain: 0.22, fadeOut: 0.4, rev: 0.3, pan: -0.4 });
  clip(mix, 'pagine', { t: cue('album', 1) + 0.2, da: 1, durata: 0.9, gain: 0.25, fadeOut: 0.3, rev: 0.3 });
  glock(cue('album', 2) + 0.2, 81, 0.16); // Album.tsx: la foto protagonista si illumina
  glock(cue('album', 2) + 0.2 + 5 / 12, 74, 0.12);
  trem(cue('album', 2), T.marito - cue('album', 2), [62, 63], { vel: 40, gain: 0.22 });

  // ---- marito: nebbia nel bosco; l'elmetto appare (corno lontano); svanisce (gli archi tornano piano)
  wind(T.marito, T.tende - T.marito, 0.03, 3);
  strings(B(T.marito), B(cue('marito', 1)), { half: true, vel: 42, gain: 0.3, k0: 2 });
  lullaby(B(T.marito), B(cue('marito', 1)), { vel: 42, gain: 0.28, oct: -12 });
  suona(mix, 'corno', 57, { t: cue('marito', 1) + 0.3, dur: 3, vel: 52, gain: 0.3, attack: 0.6, release: 1.4, rev: 0.7, pan: 0.3 });
  suona(mix, 'corno', 62, { t: cue('marito', 1) + 1.6, dur: 2.2, vel: 50, gain: 0.26, attack: 0.5, release: 1.4, rev: 0.7, pan: 0.3 });
  strings(B(cue('marito', 1)), B(T.tende), { vel: 44, gain: 0.34, high: true, k0: 3 });

  // ---- tende: le tende svaniscono (stoffa) e la luce entra (archi acuti che si aprono); le chiavi a terra (monete)
  clip(mix, 'stoffa', { t: cue('tende', 0) + 0.4, da: 20, durata: 1.4, gain: 0.2, fadeIn: 0.2, fadeOut: 0.6, rev: 0.35 });
  strings(B(cue('tende', 0)), B(cue('tende', 2)), { vel: 50, gain: 0.38, high: true });
  harp(B(cue('tende', 0)), B(cue('tende', 2)), { vel: 48, gain: 0.26 });
  clip(mix, 'monete', { t: cue('tende', 2) + 0.9, da: 1.42, durata: 0.6, gain: 0.3, fadeOut: 0.15, rev: 0.3, pan: 0.2 }); // Tende.tsx: le chiavi toccano terra
  timp(cue('tende', 2) + 0.9, 38, 70, 0.4);
  strings(B(cue('tende', 2)), B(T.tombe), { vel: 42, gain: 0.3, k0: 3 });

  // ---- tombe: il vento che spazza le foglie, una lapide alla volta (arpa); l'anno 1891 (campana grave)
  clip(mix, 'vento_raffiche', { t: T.tombe, da: 30, durata: T.seduta - T.tombe, gain: 0.045, fadeIn: 1, fadeOut: 1, largo: 3 });
  strings(B(T.tombe), B(T.seduta), { half: true, vel: 46, gain: 0.42 });
  lullaby(B(T.tombe), B(cue('tombe', 2)), { vel: 42, gain: 0.28, oct: -12 });
  glock(cue('tombe', 0) + 0.3, 81, 0.12); // la foto
  [0, 0.7, 1.4].forEach((d, j) => suona(mix, 'arpa', [50, 53, 57][j], { t: cue('tombe', 1) + 0.25 + d * (5 / 6) / 0.7, dur: 2, vel: 52, pan: -0.3 + j * 0.3, rev: 0.6, gain: 0.32, release: 1.4 }));
  clip(mix, 'campana_grave', { t: cue('tombe', 2) + 1.0, da: 0.53, durata: 2.4, gain: 0.13, fadeOut: 1, rev: 0.4 }); // Tombe.tsx: 1891
  trem(cue('tombe', 2), T.seduta - cue('tombe', 2), [38, 50, 57], { vel: 44, gain: 0.28 });

  // ---- seduta: le candele (arpa), il tavolo che trema (bicchieri e legno), la scrittura e i fogli; tensione in crescita
  [0, 1, 2].forEach((i) => suona(mix, 'arpa', [62, 65, 69][i], { t: cue('seduta', 0) + 0.3 + (i * 5) / 12, dur: 1.6, vel: 50, pan: -0.3 + i * 0.3, rev: 0.6, gain: 0.3, release: 1.2 }));
  strings(B(T.seduta), B(cue('seduta', 1)), { vel: 44, gain: 0.32, k0: 3 });
  clip(mix, 'tintinnio', { t: cue('seduta', 1) + 0.35, da: 0.16, durata: 0.9, gain: 0.25, fadeOut: 0.3, rev: 0.3 }); // Seduta.tsx: i bicchieri
  clip(mix, 'colpi_legno', { t: cue('seduta', 1) + 0.4, da: 1.4, durata: 0.4, gain: 0.25, rev: 0.35 });
  trem(cue('seduta', 1), T.verita - cue('seduta', 1), [38, 50, 51, 74, 75], { vel: 50, gain: 0.4 });
  for (let t = B(cue('seduta', 1)), k = 0; t < T.verita - 0.2; t += BEAT, k++) suona(mix, 'contrabbasso_pizz', 38, { t, dur: BEAT, vel: 54 + k * 2, pan: -0.1, rev: 0.4, gain: 0.38, release: 0.3 });
  clip(mix, 'pagine', { t: cue('seduta', 2) + 1.2, da: 0.9, durata: 0.8, gain: 0.22, fadeOut: 0.3, rev: 0.3, pan: 0.3 }); // i fogli volano
  colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_roll2_cresc', { t: T.verita - 1.6, vel: 54, rev: 0.5, gain: 0.2, dur: 1.6, release: 0.4 });

  // ---- verita: la lampada che si spegne (archi che calano), un colpo solo (timpano e gong) e il silenzio; la porta
  const shot = cue('verita', 1) + (cue('verita', 2) - cue('verita', 1)) * 0.76; // Verita.tsx: il lampo, sulla battuta
  strings(B(T.verita), shot - 0.15, { vel: 42, gain: 0.3, k0: 0 });
  suona(mix, 'pianoforte_coda', 74, { t: cue('verita', 0) + 0.3, dur: 2, vel: 44, gain: 0.3, rev: 0.6, release: 1.4 });
  suona(mix, 'pianoforte_coda', 73, { t: cue('verita', 1) + 0.3, dur: 2, vel: 44, gain: 0.3, rev: 0.6, release: 1.4 });
  timp(shot, 38, 100, 0.8);
  gong(shot + 0.03, 0.32);
  suona(mix, 'contrabbasso', 38, { t: shot + 0.3, dur: B(T.fine) - shot - 0.3, vel: 40, gain: 0.3, attack: 0.6, release: 0.8, rev: 0.6 });
  clip(mix, 'porta_cigolio', { t: cue('verita', 2) + 0.4, da: 10.68, durata: 1.6, gain: 0.07, fadeOut: 0.5, rev: 0.4, pan: 0.4 }); // la porta si socchiude
  const quiete = T.villa + 118 * BEAT; // due battiti di silenzio dopo il colpo
  strings(quiete, B(T.fine), { vel: 44, gain: 0.34, high: true, k0: 1 });
  lullaby(quiete, B(T.fine), { vel: 44, gain: 0.32 });

  // ---- fine: l'elmetto un'ultima volta (corno), l'auto che se ne va, il sole: tutto in Re maggiore
  wind(T.fine, cue('fine', 2) - T.fine, 0.05, 2);
  const sole = T.villa + Math.round((cue('fine', 2) - T.villa) / BEAT) * BEAT; // Fine.tsx: il sole e le tende
  clip(mix, 'auto_epoca', { t: cue('fine', 1) + 0.1, da: 16.3, durata: 3.6, gain: 0.1, fadeIn: 0.5, fadeOut: 0.8, lp: 2500, rev: 0.2 }); // l'auto che se ne va
  strings(B(T.fine), sole, { half: true, vel: 46, gain: 0.34 });
  suona(mix, 'corno', 57, { t: cue('fine', 0) + 0.2, dur: 2.6, vel: 50, gain: 0.26, attack: 0.5, release: 1.4, rev: 0.7, pan: -0.3 });
  harp(B(cue('fine', 1)), sole, { vel: 44, gain: 0.24, chords: CHM });
  clip(mix, 'stoffa', { t: cue('fine', 2) + 0.4, da: 15, durata: 1.6, gain: 0.16, fadeIn: 0.3, fadeOut: 0.6, rev: 0.35 }); // Fine.tsx: le tende si aprono
  strings(sole, B(T.finale), { vel: 50, gain: 0.4, high: true, chords: CHM });
  lullaby(sole, B(T.finale), { half: false, vel: 50, gain: 0.36, major: true });
  colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_roll2_cresc', { t: sole - 1.4, vel: 50, rev: 0.5, gain: 0.16, dur: 1.4, release: 0.4 });

  // ---- finale: un accordo di Re maggiore aperto, l'arpa e l'ultima nota del carillon
  const F = B(T.finale);
  [['contrabbasso', 38], ['celli', 50], ['viole', 57], ['viole', 62], ['violini', 66], ['violini', 74]].forEach(([id, n], k) =>
    suona(mix, id, n, { t: F, dur: T.END - F, vel: 52, pan: (k - 2.5) * 0.18, gain: 0.5, attack: 0.4, release: 1.6, rev: 0.6, seed: 30 + k }));
  [62, 66, 69, 74, 78, 81].forEach((m, j) => suona(mix, 'arpa', m, { t: F + j * BEAT / 3, dur: 2.4, vel: 50, pan: -0.3 + j * 0.12, rev: 0.6, gain: 0.3, release: 1.4 }));
  glock(F + 1.6, 86, 0.14);
};
