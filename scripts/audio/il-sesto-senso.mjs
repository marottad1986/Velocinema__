// Colonna sonora originale di Il sesto senso, discreta sotto la voce.
// Orchestra campionata (VSCO-2 CE e VCSL, CC0: scripts/audio/campioni.mjs): archi sospesi e freddi, pianoforte a coda
// nel registro acuto con il glockenspiel (come una scatola musicale), arpa, contrabbasso pizzicato come un battito,
// timpani e gong per i colpi. Motivo inventato qui, in Mi minore e in 4/4 a 72 bpm (10 s = 3 battute): quattro note
// che scendono per semitono e risalgono, come una domanda che resta aperta. Lontano dalla musica del film: niente
// temi di archi del film, niente canzoni. Il freddo dei fantasmi è un tremolo acuto degli archi; il finale si apre in
// Mi maggiore quando la porta si spalanca sulla luce.
// Effetti registrati (archivio CC0 di Craig Smith: scripts/audio/effetti.mjs) agganciati alle frasi dei sottotitoli
// (tempi come in ChapterOverlay) e agli eventi delle scene in src/scenes/il-sesto-senso/ (stesse formule con griglia).
import { suona, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte_coda', 'violini', 'viole', 'celli', 'contrabbasso', 'violini_trem', 'celli_trem', 'contrabbasso_pizz',
  'arpa', 'glockenspiel', 'timpani', 'gong', 'piatto_sospeso'];
export const effetti = ['tintinnio', 'porta_cigolio', 'vento_raffiche', 'vento_leggero', 'vento_invernale', 'pioggia_dura', 'serratura',
  'colpi_legno', 'porta_sbatte', 'scatti', 'disturbo', 'stoffa', 'applauso_breve', 'legno_cigolio', 'monete'];
/** Case vecchie e vuote: coda media, alte smorzate. */
export const sala = { rt60: 2.2, brillo: 4400, predelay: 0.025, wet: 0.45 };

/** Un solo tempo per tutto il film (CLAUDE.md, «Musica»): le scene sospese a metà passo (36), le altre a passo pieno. */
const BPM = 72;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;

// Accordi (Mi minore): Mi minore, Do, La minore, Si (con la terza maggiore che inquieta)
const CH = [[52, 55, 59], [48, 52, 55], [45, 48, 52], [47, 51, 54]];
// Mi maggiore per la luce finale: Mi, La, Mi, Si
const CHM = [[52, 56, 59], [45, 49, 52], [52, 56, 59], [47, 51, 54]];
// La domanda (sale e ricade, lontana da temi noti): [tempo, nota MIDI, durata in tempi]
const MOTIF = [[0, 71, 1], [1, 72, 1], [2, 76, 1.5], [3.5, 75, 0.5], [4, 71, 2], [6, 64, 2]];
const MOTIF_M = [[0, 71, 1], [1, 73, 1], [2, 76, 1.5], [3.5, 75, 0.5], [4, 71, 2], [6, 76, 2]];

export default (mix, T) => {
  const film = loadFilm('il-sesto-senso');
  const { segments } = timeline(film);
  const S = Object.fromEntries(segments.map((s) => [s.id, s]));
  /** Secondo d'inizio (assoluto) della frase n-esima del capitolo (come subtitleTimes in ChapterOverlay). */
  const cue = (id, n) => {
    const s = S[id];
    const w = s.testo.map((l) => l.length + 6);
    const tot = w.reduce((a, b) => a + b, 0);
    let acc = 0.15;
    for (let k = 0; k < n; k++) acc += (w[k] / tot) * (s.dur - 0.35);
    return s.start + acc;
  };
  const O = T.premio; // la griglia parte dalla fine della copertina
  /** Battuta della griglia più vicina all'istante t. */
  const B = (t) => O + Math.round((t - O) / BAR) * BAR;
  /** Croma più vicina (come griglia(s) nelle scene). */
  const G = (t) => O + Math.round((t - O) / (BEAT / 2)) * (BEAT / 2);
  /** Istante di un evento di scena: griglia(cues[n] + d) del capitolo id. */
  const E = (id, n, d = 0) => G(cue(id, n) + d);

  /** Archi tenuti sugli accordi, una battuta ciascuno (half: due battute). */
  const strings = (from, to, { half = false, vel = 46, gain = 0.4, bass = true, high = false, k0 = 0, chords = CH } = {}) => {
    const step = BAR * (half ? 2 : 1), a = { attack: 0.6, release: 1.4, rev: 0.6 };
    for (let t = from, k = k0; t < to - 0.4; t += step, k++) {
      const d = Math.min(step, to - t), [r, m, f] = chords[k % 4];
      suona(mix, 'celli', r, { t, dur: d, vel, pan: -0.35, gain: gain * 1.1, ...a, seed: k });
      suona(mix, 'viole', m, { t, dur: d, vel: vel - 4, pan: 0.15, gain: gain * 0.8, ...a, seed: k + 1 });
      suona(mix, 'viole', f, { t, dur: d, vel: vel - 4, pan: 0.3, gain: gain * 0.7, ...a, seed: k + 2 });
      if (bass) suona(mix, 'contrabbasso', r - 12, { t, dur: d, vel: vel - 4, pan: -0.1, gain: gain * 0.9, ...a });
      if (high) suona(mix, 'violini', f + 12, { t, dur: d, vel: vel - 6, pan: -0.2, gain: gain * 0.55, attack: 0.8, release: 1.6, rev: 0.7 });
    }
  };
  /** La domanda al pianoforte acuto con il glockenspiel (half: metà passo). */
  const motif = (from, to, { half = true, vel = 50, gain = 0.36, major = false, oct = 0 } = {}) => {
    const beat = BEAT * (half ? 2 : 1), loop = 8 * beat;
    for (let L = from; L < to - 0.3; L += loop) {
      for (const [b, m, d] of major ? MOTIF_M : MOTIF) {
        const t = L + b * beat;
        if (t >= to - 0.3) break;
        suona(mix, 'pianoforte_coda', m + oct, { t, dur: Math.min(d * beat, to - t), vel, pan: 0.15, rev: 0.6, gain, release: 1.2 });
        suona(mix, 'glockenspiel', m + oct + 12, { t: t + 0.01, dur: 1, vel: vel - 16, pan: 0.3, rev: 0.7, gain: gain * 0.22, release: 1 });
      }
    }
  };
  /** Arpa: arpeggi lenti sull'accordo di ogni battuta (crome). */
  const harp = (from, to, { vel = 46, gain = 0.28, k0 = 0, chords = CH } = {}) => {
    for (let t = from, k = 0; t < to - 0.2; t += BEAT / 2, k++) {
      const [r, m, f] = chords[(Math.floor(k / 8) + k0) % 4];
      suona(mix, 'arpa', [r + 12, m + 12, f + 12, r + 24, f + 12, m + 24, f + 24, m + 12][k % 8], { t, dur: 1.6, vel: vel - (k % 4) * 3, pan: -0.25 + (k % 8) * 0.07, rev: 0.6, gain, release: 1.2 });
    }
  };
  /** Battito: contrabbasso pizzicato sulla tonica, un colpo per tempo. */
  const pulse = (from, to, { m = 40, vel = 54, gain = 0.32, every = 1 } = {}) => {
    for (let t = from; t < to - 0.2; t += BEAT * every) suona(mix, 'contrabbasso_pizz', m, { t, dur: BEAT, vel, pan: -0.1, rev: 0.4, gain, release: 0.3 });
  };
  /** Il freddo dei fantasmi: tremolo acuto degli archi (e grave). */
  const trem = (t, dur, notes, { vel = 46, gain = 0.28 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 60 ? 'celli_trem' : 'violini_trem', m, { t, dur, vel, pan: (j - (notes.length - 1) / 2) * 0.35, gain, attack: 0.7, release: 1, rev: 0.6, seed: j + 3 }));
  const timp = (t, m = 40, vel = 80, gain = 0.6) => suona(mix, 'timpani', m, { t, dur: 2, vel, gain, rev: 0.55, release: 0.8, seed: Math.round(t * 10) });
  const gong = (t, gain = 0.3) => colpo(mix, 'gong', 'gong_hit_p', { t, vel: 70, rev: 0.6, gain, dur: 4, release: 1.2 });
  const glock = (t, m, gain = 0.15) => suona(mix, 'glockenspiel', m, { t, dur: 1.6, vel: 46, pan: 0.25, rev: 0.7, gain, release: 1.2 });
  const arpa = (t, m, gain = 0.3, pan = 0) => suona(mix, 'arpa', m, { t, dur: 2, vel: 52, pan, rev: 0.6, gain, release: 1.4 });
  const roll = (t, d = 1.6, gain = 0.18) => colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_roll2_cresc', { t: t - d, vel: 52, rev: 0.5, gain, dur: d, release: 0.4 });

  // ---- copertina: il corridoio di notte; il pomolo che gira (scatti), il tremolo freddo, la domanda che entra
  clip(mix, 'vento_leggero', { t: 0, da: 1, durata: O + 0.6, gain: 0.014, fadeIn: 0.3, fadeOut: 1, largo: 4, rev: 0.1 });
  suona(mix, 'contrabbasso', 28, { t: 0.05, dur: 3.9, vel: 46, gain: 0.45, attack: 0.05, release: 1.2, rev: 0.6 });
  [83, 84].forEach((m, j) => suona(mix, 'violini_trem', m, { t: 0.05, dur: 3.85, vel: 40, pan: (j - 0.5) * 0.35, gain: 0.16, attack: 0.3, release: 1, rev: 0.6, seed: j + 3 }));
  clip(mix, 'scatti', { t: 0.4, da: 1.0, durata: 0.3, gain: 0.1, rev: 0.3, pan: 0.15 }); // Locandina.tsx: primo scatto del pomolo
  clip(mix, 'scatti', { t: 1.6, da: 1.0, durata: 0.3, gain: 0.12, rev: 0.3, pan: 0.15 }); // il quarto di giro
  clip(mix, 'scatti', { t: 3.0, da: 1.0, durata: 0.3, gain: 0.08, rev: 0.3, pan: 0.15 }); // il pomolo torna indietro
  [71, 72, 76].forEach((m, j) => suona(mix, 'pianoforte_coda', m, { t: G(1.0) + j * BEAT, dur: 1.2, vel: 48, gain: 0.32, rev: 0.6, release: 1.2, pan: 0.15 }));

  // ---- premio: archi a metà passo; il riflesso sulla targa (glockenspiel); la luce del bagno (tremolo e porta);
  //      lo sparo (timpano e gong, mai mostrato), il bicchiere che cade (tintinnio) e il silenzio di un battito
  const shot = E('premio', 2, 1.9);
  strings(B(T.premio), shot - 0.2, { half: true, vel: 44, gain: 0.34 });
  motif(B(T.premio), B(cue('premio', 1)), { vel: 46, gain: 0.3 });
  glock(E('premio', 0, 0.6), 83, 0.14); glock(E('premio', 0, 0.6) + BEAT / 2, 88, 0.1); // Premio.tsx: il riflesso sulla targa
  trem(E('premio', 1, 0.3), shot - E('premio', 1, 0.3), [71, 72], { vel: 42, gain: 0.24 }); // la luce fredda del bagno
  clip(mix, 'porta_cigolio', { t: E('premio', 1, 0.3), da: 10.68, durata: 1.0, gain: 0.08, fadeOut: 0.3, rev: 0.3, pan: -0.35 }); // la porta si socchiude
  pulse(B(cue('premio', 2)) , shot - 0.1, { m: 40, vel: 50, gain: 0.3 });
  timp(shot, 40, 104, 0.8);
  gong(shot + 0.03, 0.3);
  clip(mix, 'tintinnio', { t: shot + 0.3, da: 0.13, durata: 0.5, gain: 0.2, fadeOut: 0.15, rev: 0.25, pan: 0.25 }); // il bicchiere si rovescia
  suona(mix, 'contrabbasso', 40, { t: shot + BEAT, dur: T.cole - shot - BEAT, vel: 40, gain: 0.3, attack: 0.5, release: 0.8, rev: 0.6 });

  // ---- cole: la strada d'autunno; la folata (vento), la porta rossa della chiesa (cigolio, arpa), le candele (archi caldi)
  strings(B(T.cole), B(T.anna), { half: true, vel: 44, gain: 0.36, k0: 1 });
  harp(B(T.cole), B(cue('cole', 2)), { vel: 44, gain: 0.24 });
  clip(mix, 'vento_raffiche', { t: E('cole', 0, 0.4) - 0.4, da: 10, durata: 3, gain: 0.07, fadeIn: 0.6, fadeOut: 1.2, largo: 3 }); // Cole.tsx: la folata
  clip(mix, 'porta_cigolio', { t: E('cole', 1, 0.6), da: 10.68, durata: 1.4, gain: 0.065, fadeOut: 0.4, rev: 0.45, pan: 0 }); // la porta rossa si socchiude
  [64, 67, 71].forEach((m, j) => arpa(E('cole', 2, 0.2) + j * BEAT / 2, m, 0.3, -0.2 + j * 0.2)); // la luce delle candele
  motif(B(cue('cole', 2)), B(T.anna), { vel: 44, gain: 0.28, oct: -12 });

  // ---- anna: la pioggia sulla finestra; il biglietto tra i fiori (glockenspiel); la candela che si spegne (archi che scendono)
  clip(mix, 'pioggia_dura', { t: T.anna, da: 5.4, durata: T.festa - T.anna, gain: 0.16, fadeIn: 1, fadeOut: 1, largo: 3, rev: 0.1, lp: 3500 });
  strings(B(T.anna), E('anna', 2, 1.6), { vel: 42, gain: 0.34, k0: 2 });
  motif(B(T.anna), B(cue('anna', 2)), { vel: 44, gain: 0.3 });
  glock(E('anna', 1, 0.8), 81, 0.14); glock(E('anna', 1, 0.8) + BEAT / 2, 86, 0.1); // Anna.tsx: il biglietto brilla
  const spenta = E('anna', 2, 1.6);
  suona(mix, 'pianoforte_coda', 64, { t: spenta, dur: 2, vel: 40, gain: 0.3, rev: 0.6, release: 1.4 }); // la candela si spegne
  suona(mix, 'celli', 45, { t: spenta, dur: T.festa - spenta, vel: 40, gain: 0.32, attack: 0.4, release: 1, rev: 0.6 });

  // ---- festa: il chiavistello (serratura), la porticina che trema (colpi di legno a tempo, tremolo), lo scatto
  //      della porta che si apre di colpo (sbattuta, timpano) e il palloncino che sale (glockenspiel)
  const s0 = E('festa', 1, 0.2), burst = E('festa', 2, 0.4);
  strings(B(T.festa), s0, { vel: 44, gain: 0.32, k0: 3 });
  pulse(B(T.festa), s0, { m: 40, vel: 50, gain: 0.26, every: 2 });
  clip(mix, 'serratura', { t: E('festa', 0, 1.2), da: 2.43, durata: 0.5, gain: 0.3, rev: 0.3, pan: 0.25 }); // Festa.tsx: il chiavistello
  trem(s0, burst - s0, [52, 53, 83, 84], { vel: 52, gain: 0.34 });
  for (let t = s0, k = 0; t < burst - 0.2; t += BEAT / 2, k++) clip(mix, 'colpi_legno', { t, da: 1.47, durata: 0.3, gain: 0.12 + 0.02 * (k % 2), rev: 0.3, pan: 0.25, fadeOut: 0.1 }); // la porticina trema
  pulse(s0, burst - 0.1, { m: 40, vel: 58, gain: 0.34, every: 0.5 });
  clip(mix, 'porta_sbatte', { t: burst - 0.03, da: 3.0, durata: 0.6, gain: 0.3, fadeOut: 0.2, rev: 0.3, pan: 0.25 }); // si apre di colpo
  timp(burst, 40, 96, 0.65);
  trem(burst + BEAT, T.nastro - burst - BEAT, [88, 89], { vel: 40, gain: 0.2 }); // la luce gelida; un battito di silenzio prima
  [83, 86, 88, 91].forEach((m, j) => glock(burst + BEAT + j * BEAT / 2, m, 0.1)); // il palloncino rosso sale
  suona(mix, 'contrabbasso', 28, { t: burst + BEAT, dur: T.nastro - burst - BEAT, vel: 42, gain: 0.34, attack: 0.5, release: 0.8, rev: 0.6 });

  // ---- nastro: le bobine (scatto del tasto, battito lento), la manopola (archi che salgono), la voce nel nastro
  //      (fruscio, tremolo freddo e il motivo deformato)
  clip(mix, 'scatti', { t: E('nastro', 0, 0.3), da: 0.47, durata: 0.15, fadeOut: 0.03, gain: 0.18, rev: 0.2, pan: -0.1 }); // Nastro.tsx: play
  const voce = E('nastro', 2, 0.3);
  pulse(E('nastro', 0, 0.3), voce, { m: 40, vel: 46, gain: 0.26 });
  strings(B(T.nastro), voce - 0.1, { vel: 40, gain: 0.3, k0: 0 });
  [52, 55, 59, 64].forEach((m, j) => suona(mix, 'violini', m + 12, { t: E('nastro', 1, 0.8) + j * BEAT / 2, dur: 1.6 - j * 0.3, vel: 44, gain: 0.18, attack: 0.3, release: 0.8, rev: 0.6, pan: 0.2 })); // la manopola sale
  clip(mix, 'disturbo', { t: voce, da: 2, durata: T.kyra - voce - 0.2, gain: 0.07, fadeIn: 0.3, fadeOut: 0.8, rev: 0.2 }); // il fruscio del nastro
  trem(voce, T.kyra - voce, [40, 88, 89], { vel: 46, gain: 0.3 });
  [71, 72, 77, 75].forEach((m, j) => suona(mix, 'pianoforte_coda', m, { t: voce + j * BEAT, dur: 1.4, vel: 46, gain: 0.26, rev: 0.7, release: 1.2, cents: -30 })); // la domanda, stonata

  // ---- kyra: la torcia (scatto), il gelo (vento invernale e tremolo), la tenda che si gonfia (stoffa),
  //      il fascio che trova il biglietto (arpa e glockenspiel)
  strings(B(T.kyra), B(cue('kyra', 2)), { half: true, vel: 44, gain: 0.36, k0: 2 });
  motif(B(T.kyra), B(cue('kyra', 1)), { vel: 44, gain: 0.28 });
  clip(mix, 'scatti', { t: E('kyra', 0, 0.4), da: 1.0, durata: 0.3, gain: 0.09, rev: 0.2, pan: 0 }); // Kyra.tsx: la torcia
  clip(mix, 'vento_invernale', { t: E('kyra', 1, 0.3), da: 3, durata: E('kyra', 2, 0.5) - E('kyra', 1, 0.3) + 1, gain: 0.025, fadeIn: 1, fadeOut: 1, largo: 4, rev: 0.1 });
  trem(E('kyra', 1, 0.3), E('kyra', 2, 0.5) - E('kyra', 1, 0.3), [52, 88, 89], { vel: 44, gain: 0.34 });
  clip(mix, 'stoffa', { t: E('kyra', 1, 1.2), da: 15, durata: 1.6, gain: 0.08, fadeIn: 0.3, fadeOut: 0.6, rev: 0.35 }); // la tenda si gonfia
  [64, 67, 71, 76].forEach((m, j) => arpa(E('kyra', 2, 0.5) + j * BEAT / 2, m, 0.28, -0.3 + j * 0.2)); // il fascio esce
  glock(E('kyra', 2, 1.3), 83, 0.16); // il biglietto del funerale
  strings(B(cue('kyra', 2)), B(T.cassetta), { vel: 42, gain: 0.3, k0: 3 });

  // ---- cassetta: la videocassetta entra (meccanica), il rumore dello schermo, l'immagine (battito sinistro),
  //      la pausa (scatto) e la luce calda (archi che si aprono)
  const img0 = E('cassetta', 1, 0.3);
  strings(B(T.cassetta), img0, { vel: 44, gain: 0.34, k0: 0 });
  clip(mix, 'serratura', { t: E('cassetta', 0, 0.6) + 0.95, da: 2.45, durata: 0.4, gain: 0.2, rev: 0.2, pan: -0.1 }); // Cassetta.tsx: la cassetta entra
  const acceso = E('cassetta', 0, 1.6), img = E('cassetta', 1, 0.3), pausa = E('cassetta', 2, 0.4);
  clip(mix, 'disturbo', { t: acceso, da: 6.5, durata: img - acceso + 0.2, gain: 0.06, fadeIn: 0.05, fadeOut: 0.2, rev: 0.2 }); // il rumore dello schermo
  trem(img, pausa - img, [52, 53, 76, 77], { vel: 46, gain: 0.28 });
  pulse(img, pausa, { m: 40, vel: 56, gain: 0.32, every: 0.5 });
  for (let t = G(cue('cassetta', 1) + 0.8) + BEAT, k = 0; t < pausa - 0.2; t += BEAT, k++) glock(t, 88 - (k % 2), 0.07); // le gocce
  clip(mix, 'scatti', { t: pausa, da: 0.47, durata: 0.15, fadeOut: 0.03, gain: 0.2, rev: 0.2, pan: -0.1 }); // pausa
  strings(pausa, B(T.recita), { vel: 44, gain: 0.34, high: true, k0: 1 });
  harp(pausa + BEAT / 2, B(T.recita), { vel: 44, gain: 0.24, k0: 1 });

  // ---- recita: il riflettore (scatto), l'applauso con i coriandoli, la luce che cala, la luna di cartone (glockenspiel)
  clip(mix, 'scatti', { t: E('recita', 0, 0.3), da: 1.0, durata: 0.3, gain: 0.1, rev: 0.3, pan: 0 }); // Recita.tsx: il riflettore
  clip(mix, 'applauso_breve', { t: E('recita', 0, 0.8), da: 4.5, durata: cue('recita', 1) + 1.2 - E('recita', 0, 0.8), gain: 0.08, fadeIn: 0.3, fadeOut: 0.9, rev: 0.3 });
  const dim = E('recita', 1, 0.6); // Recita.tsx: il riflettore si stringe
  strings(B(T.recita), dim, { vel: 48, gain: 0.36, high: true, chords: CHM });
  harp(B(T.recita), dim, { vel: 48, gain: 0.26, chords: CHM });
  strings(dim, B(T.nonna), { half: true, vel: 42, gain: 0.32, k0: 2 });
  motif(dim, B(T.nonna), { vel: 42, gain: 0.26 });
  [83, 88, 91].forEach((m, j) => glock(E('recita', 2, 0.4) + j * BEAT / 2, m, 0.14)); // la luna e le stelle

  // ---- nonna: due tazze, la luce fredda; il portagioie che si apre (legno, arpa), la spilla (glockenspiel);
  //      la luce calda (Mi maggiore)
  const caldo = E('nonna', 2, 0.8);
  strings(B(T.nonna), caldo, { half: true, vel: 44, gain: 0.36, k0: 0 });
  motif(B(T.nonna), B(cue('nonna', 1)), { vel: 44, gain: 0.3 });
  harp(B(T.nonna), caldo, { vel: 42, gain: 0.22, k0: 0 });
  clip(mix, 'legno_cigolio', { t: E('nonna', 1, 0.6), da: 0.25, durata: 1.0, gain: 0.1, fadeOut: 0.4, rev: 0.35, pan: 0 }); // Nonna.tsx: il coperchio
  [59, 64, 67].forEach((m, j) => arpa(E('nonna', 1, 0.6) + j * BEAT / 2, m + 12, 0.16, -0.2 + j * 0.2));
  glock(E('nonna', 1, 1.4), 88, 0.15); // la spilla brilla
  strings(caldo, B(T.fede), { vel: 48, gain: 0.38, high: true, chords: CHM });
  motif(caldo, B(T.fede), { half: false, vel: 46, gain: 0.28, major: true });

  // ---- fede: il video delle nozze (arpa in maggiore che si incrina), la fede che cade e rotola (monete),
  //      il gelo (tremolo, vento invernale)
  const cade = E('fede', 1, 1.4), gelo = E('fede', 2, 0.6);
  // il video delle nozze in maggiore, che si incrina in minore quando la fede cade
  harp(B(T.fede), cade, { vel: 42, gain: 0.22, chords: CHM });
  strings(B(T.fede), cade, { vel: 44, gain: 0.38, chords: CHM });
  motif(B(T.fede), cade, { vel: 44, gain: 0.28, major: true });
  strings(cade, gelo, { half: true, vel: 44, gain: 0.38, k0: 2 });
  suona(mix, 'pianoforte_coda', 83, { t: cade, dur: 1.5, vel: 46, gain: 0.26, rev: 0.6, release: 1.2 }); // Fede.tsx: la fede scivola
  clip(mix, 'monete', { t: cade + 0.45, da: 1.42, durata: 0.6, gain: 0.22, fadeOut: 0.15, rev: 0.3, pan: -0.1 }); // tocca il pavimento
  clip(mix, 'monete', { t: cade + 0.85, da: 1.5, durata: 0.9, gain: 0.14, fadeOut: 0.5, rev: 0.3, pan: -0.25 }); // rimbalza e rotola
  clip(mix, 'vento_invernale', { t: gelo, da: 3, durata: B(T.addio) - gelo, gain: 0.025, fadeIn: 1, fadeOut: 0.8, largo: 4, rev: 0.1 });
  trem(gelo, B(T.addio) - gelo, [40, 52, 88, 89], { vel: 46, gain: 0.3 });
  pulse(B(cue('fede', 2)), B(T.addio) - 0.1, { m: 40, vel: 50, gain: 0.28 });

  // ---- addio: l'alba (archi), la brina che si scioglie, il rosso che si spegne; la porta che si apre (cigolio)
  //      e la luce bianca: Mi maggiore pieno, con il piatto che sale
  strings(B(T.addio), B(cue('addio', 2)), { half: true, vel: 44, gain: 0.34, k0: 0 });
  motif(B(T.addio), B(cue('addio', 2)), { vel: 44, gain: 0.28 });
  harp(B(T.addio), B(cue('addio', 2)), { vel: 42, gain: 0.2 });
  [64, 68, 71].forEach((m, j) => arpa(E('addio', 0, 0.2) + j * BEAT / 2, m, 0.24, -0.2 + j * 0.2)); // Addio.tsx: l'alba
  glock(E('addio', 1, 0.8), 76, 0.12); // il rosso si spegne
  clip(mix, 'porta_cigolio', { t: E('addio', 2, 1.2), da: 10.68, durata: 1.4, gain: 0.08, fadeOut: 0.4, rev: 0.4, pan: -0.3 }); // la porta si apre
  const luce = E('addio', 2, 1.8);
  roll(luce, 1.6, 0.16);
  strings(luce, B(T.finale), { vel: 52, gain: 0.4, high: true, chords: CHM });
  harp(luce, B(T.finale), { vel: 46, gain: 0.26, chords: CHM });
  motif(luce, B(T.finale), { half: false, vel: 48, gain: 0.3, major: true });

  // ---- finale: un accordo di Mi maggiore aperto, l'arpa e l'ultima nota della domanda, risolta
  const F = B(T.finale);
  [['contrabbasso', 40], ['celli', 52], ['viole', 59], ['viole', 64], ['violini', 68], ['violini', 76]].forEach(([id, n], k) =>
    suona(mix, id, n, { t: F, dur: T.END - F, vel: 52, pan: (k - 2.5) * 0.18, gain: 0.5, attack: 0.4, release: 1.6, rev: 0.6, seed: 30 + k }));
  [64, 68, 71, 76, 80, 83].forEach((m, j) => suona(mix, 'arpa', m, { t: F + j * BEAT / 3, dur: 2.4, vel: 50, pan: -0.3 + j * 0.12, rev: 0.6, gain: 0.3, release: 1.4 }));
  glock(F + 1.6, 88, 0.14);
};
