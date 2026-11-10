// Colonna sonora originale di Hunger Games, discreta sotto la voce.
// Orchestra campionata (VSCO-2 CE e VCSL, CC0: scripts/audio/campioni.mjs): archi gravi e pianoforte per i distretti,
// rullante, timpani e ottoni (corno, tromba, trombone) per Capitol City e l'arena, arpa e violino solo per Rue.
// Motivo inventato qui, in Re minore e in 4/4 a 90 bpm: una nota tenuta che scende di una quarta, risale e si
// allarga di una terza, come un passo che resiste. Lontano dalla musica dei film: niente fischio a quattro note,
// niente canti, niente temi della saga. Il finale si apre in Re maggiore.
// Effetti registrati (archivio CC0 di Craig Smith: scripts/audio/effetti.mjs) agganciati alle frasi dei sottotitoli
// (tempi come in ChapterOverlay) e agli eventi delle scene in src/scenes/hunger-games/ (stesse formule con griglia).
import { suona, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte_coda', 'violini', 'viole', 'celli', 'contrabbasso', 'violini_trem', 'celli_trem', 'contrabbasso_pizz',
  'violini_pizz', 'celli_pizz', 'violino_solo', 'arpa', 'glockenspiel', 'corno', 'tromba', 'tromba_sordina', 'trombone', 'timpani', 'gong',
  'piatto_sospeso', 'rullante', 'grancassa'];
export const effetti = ['api', 'vento_leggero', 'ronzio_neon', 'campana_grave', 'tintinnio', 'applauso', 'nitriti', 'fiammata', 'esplosioni', 'stoffa',
  'fuoco', 'legno_cigolio', 'legno_cade', 'sacchi', 'colpi_legno', 'pioggia_dura', 'fiammifero', 'metallo_colpi', 'metallo_cade',
  'ringhio', 'lupo'];
/** Bosco e grandi spazi aperti: coda media, alte morbide. */
export const sala = { rt60: 2.0, brillo: 4800, predelay: 0.02, wet: 0.42 };

/** Un solo tempo per tutto il film (CLAUDE.md, «Musica»): le scene sospese a metà passo, la sfilata e la corsa a passo doppio. */
const BPM = 90;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;

// Accordi (Re minore): Re minore, Si bemolle, Fa, La (dominante che spinge)
const CH = [[50, 53, 57], [46, 50, 53], [53, 57, 60], [45, 49, 52]];
// Re maggiore per la vittoria e il finale: Re, Sol, Re, La
const CHM = [[50, 54, 57], [43, 47, 50], [50, 54, 57], [45, 49, 52]];
// Il passo che resiste: [tempo, nota MIDI, durata in tempi]
const MOTIF = [[0, 74, 1.5], [1.5, 69, 0.5], [2, 72, 1], [3, 74, 1], [4, 77, 1.5], [5.5, 76, 0.5], [6, 74, 2]];
const MOTIF_M = [[0, 74, 1.5], [1.5, 69, 0.5], [2, 73, 1], [3, 74, 1], [4, 78, 1.5], [5.5, 76, 0.5], [6, 74, 2]];

export default (mix, T) => {
  const film = loadFilm('hunger-games');
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
  const O = T.panem; // la griglia parte dalla fine della copertina
  /** Battuta della griglia più vicina all'istante t. */
  const B = (t) => O + Math.round((t - O) / BAR) * BAR;
  /** Croma più vicina (come griglia(s) nelle scene). */
  const G = (t) => O + Math.round((t - O) / (BEAT / 2)) * (BEAT / 2);
  /** Istante di un evento di scena: griglia(cues[n] + d) del capitolo id. */
  const E = (id, n, d = 0) => G(cue(id, n) + d);

  /** Archi tenuti sugli accordi, una battuta ciascuno (half: due battute). */
  const strings = (from, to, { half = false, vel = 46, gain = 0.4, bass = true, high = false, k0 = 0, chords = CH } = {}) => {
    const step = BAR * (half ? 2 : 1), a = { attack: 0.5, release: 1.3, rev: 0.55 };
    for (let t = from, k = k0; t < to - 0.4; t += step, k++) {
      const d = Math.min(step, to - t), [r, m, f] = chords[k % 4];
      suona(mix, 'celli', r, { t, dur: d, vel, pan: -0.35, gain: gain * 1.1, ...a, seed: k });
      suona(mix, 'viole', m, { t, dur: d, vel: vel - 4, pan: 0.15, gain: gain * 0.8, ...a, seed: k + 1 });
      suona(mix, 'viole', f, { t, dur: d, vel: vel - 4, pan: 0.3, gain: gain * 0.7, ...a, seed: k + 2 });
      if (bass) suona(mix, 'contrabbasso', r - 12, { t, dur: d, vel: vel - 4, pan: -0.1, gain: gain * 0.9, ...a });
      if (high) suona(mix, 'violini', f + 12, { t, dur: d, vel: vel - 6, pan: -0.2, gain: gain * 0.55, attack: 0.7, release: 1.5, rev: 0.6 });
    }
  };
  /** Il motivo (half: metà passo) sullo strumento scelto. */
  const motif = (from, to, { half = true, vel = 50, gain = 0.34, major = false, oct = 0, id = 'pianoforte_coda', pan = 0.15 } = {}) => {
    const beat = BEAT * (half ? 2 : 1), loop = 8 * beat;
    for (let L = from; L < to - 0.3; L += loop) {
      for (const [b, m, d] of major ? MOTIF_M : MOTIF) {
        const t = L + b * beat;
        if (t >= to - 0.3) break;
        suona(mix, id, m + oct, { t, dur: Math.min(d * beat, to - t), vel, pan, rev: 0.55, gain, release: 1.1, attack: id === 'pianoforte_coda' ? 0 : 0.08 });
      }
    }
  };
  /** Arpa: arpeggi sull'accordo di ogni battuta (crome). */
  const harp = (from, to, { vel = 46, gain = 0.26, k0 = 0, chords = CH } = {}) => {
    for (let t = from, k = 0; t < to - 0.2; t += BEAT / 2, k++) {
      const [r, m, f] = chords[(Math.floor(k / 8) + k0) % 4];
      suona(mix, 'arpa', [r + 12, m + 12, f + 12, r + 24, f + 12, m + 24, f + 24, m + 12][k % 8], { t, dur: 1.5, vel: vel - (k % 4) * 3, pan: -0.25 + (k % 8) * 0.07, rev: 0.55, gain, release: 1.1 });
    }
  };
  /** Battito: contrabbasso pizzicato (every in tempi). */
  const pulse = (from, to, { m = 38, vel = 54, gain = 0.32, every = 1 } = {}) => {
    for (let t = from; t < to - 0.15; t += BEAT * every) suona(mix, 'contrabbasso_pizz', m, { t, dur: BEAT, vel, pan: -0.1, rev: 0.35, gain, release: 0.3 });
  };
  /** Rullante da marcia: due crome e una semiminima per battuta (a metà o a passo pieno). */
  const snare = (t, vel = 50) => colpo(mix, 'rullante', vel > 55 ? 'v5' : 'v4', { t, vel: 100, gain: 0.34 * (vel / 60), pan: 0.08, rev: 0.25, seed: Math.round(t * 100) });
  const march = (from, to, { vel = 48, dense = false } = {}) => {
    for (let t = from, k = 0; t < to - 0.15; t += BEAT / 2, k++) {
      const pos = k % 8;
      if (dense ? true : [0, 1, 2, 4, 6].includes(pos)) snare(t, vel - (pos % 2 ? 10 : 0));
    }
  };
  const trem = (t, dur, notes, { vel = 46, gain = 0.28 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 60 ? 'celli_trem' : 'violini_trem', m, { t, dur, vel, pan: (j - (notes.length - 1) / 2) * 0.35, gain, attack: 0.5, release: 0.9, rev: 0.55, seed: j + 3 }));
  const timp = (t, m = 38, vel = 80, gain = 0.6) => suona(mix, 'timpani', m, { t, dur: 2, vel, gain, rev: 0.5, release: 0.8, seed: Math.round(t * 10) });
  const gong = (t, gain = 0.3) => colpo(mix, 'gong', 'gong_hit_p', { t, vel: 70, rev: 0.6, gain, dur: 4, release: 1.2 });
  const glock = (t, m, gain = 0.15) => suona(mix, 'glockenspiel', m, { t, dur: 1.5, vel: 46, pan: 0.25, rev: 0.65, gain, release: 1.1 });
  const arpa = (t, m, gain = 0.3, pan = 0) => suona(mix, 'arpa', m, { t, dur: 2, vel: 52, pan, rev: 0.55, gain, release: 1.3 });
  const roll = (t, d = 1.6, gain = 0.18) => colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_roll2_cresc', { t: t - d, vel: 52, rev: 0.45, gain, dur: d, release: 0.4 });
  /** Accordo di ottoni (corni e trombone) tenuto. */
  const brass = (t, dur, notes, { vel = 56, gain = 0.32 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 52 ? 'trombone' : 'corno', m, { t, dur, vel, pan: -0.3 + j * 0.25, gain, attack: 0.12, release: 0.9, rev: 0.5, seed: j + 11 }));
  /** Squillo di tromba (note brevi). */
  const fanfare = (t, notes, { vel = 60, gain = 0.3, step = BEAT / 2 } = {}) => notes.forEach((m, j) =>
    suona(mix, 'tromba', m, { t: t + j * step, dur: j === notes.length - 1 ? BEAT * 1.5 : step * 0.9, vel, pan: 0.2, gain, attack: 0.02, release: 0.5, rev: 0.45 }));

  // ---- copertina: il bosco di notte, le 24 luci che si spengono una alla volta (pizzicati che scendono), l'ultima
  //      luce arancione che resta accesa (timpano e corno); nessun colpo dopo, così la voce resta chiara
  clip(mix, 'vento_leggero', { t: 0, da: 1, durata: O + 0.6, gain: 0.012, fadeIn: 0.3, fadeOut: 1, largo: 4, rev: 0.1 });
  suona(mix, 'contrabbasso', 26, { t: 0.05, dur: 3.9, vel: 52, gain: 0.6, attack: 0.05, release: 1.2, rev: 0.6 });
  [38, 45, 50].forEach((m, j) => suona(mix, j ? 'viole' : 'celli', m + (j ? 12 : 0), { t: 0.05, dur: 3.9, vel: 46, gain: 0.45, pan: (j - 1) * 0.3, attack: 0.1, release: 1.2, rev: 0.6, seed: j }));
  for (let k = 0; k < 23; k++) { // Locandina.tsx: la luce k si spegne a 1/3 + k·2/15 s (un quinto di battito)
    suona(mix, k % 2 ? 'violini_pizz' : 'celli_pizz', [86, 84, 81, 79, 77, 74, 72, 69][k % 8] - (k > 15 ? 12 : 0), { t: 1 / 3 + k * (BEAT / 5), dur: 0.3, vel: 50, gain: 0.28, pan: -0.5 + (k / 22), rev: 0.5, release: 0.3 });
  }
  [62, 69, 74].forEach((m, j) => suona(mix, 'violini_trem', m, { t: 0.05, dur: 3.9, vel: 50, pan: (j - 1) * 0.35, gain: 0.4, attack: 0.15, release: 0.9, rev: 0.55, seed: j + 3 })); // l'attesa: archi che vibrano
  timp(10 / 3, 38, 78, 0.6); // l'ultima luce si accende arancione
  suona(mix, 'corno', 62, { t: 10 / 3, dur: 0.5, vel: 52, gain: 0.26, attack: 0.1, release: 0.4, rev: 0.55 });

  // ---- panem: la marcia lenta del rullante e gli archi gravi; i riflettori di Capitol City (ottoni che si gonfiano);
  //      lo schermo che si accende (ronzio); il titolo dei giochi con il 74 (timpano e squillo di tromba)
  const beams = E('panem', 0, 0.3), scr = E('panem', 1, 0.2), tit = E('panem', 2, 0.5);
  clip(mix, 'vento_leggero', { t: T.panem, da: 4, durata: T.mietitura - T.panem, gain: 0.02, fadeIn: 0.5, fadeOut: 0.8, largo: 4, rev: 0.1 });
  strings(B(T.panem), B(T.mietitura), { half: true, vel: 44, gain: 0.36 });
  march(B(T.panem), tit - 0.1, { vel: 40 });
  brass(beams, scr - beams, [50, 57, 62], { vel: 50, gain: 0.24 }); // Panem.tsx: i riflettori
  clip(mix, 'ronzio_neon', { t: scr, da: 0, durata: 0.55, gain: 0.07, fadeOut: 0.05, rev: 0.2 }); // lo schermo si accende
  clip(mix, 'ronzio_neon', { t: scr + 0.55, da: 2.6, durata: tit - scr - 0.4, gain: 0.04, fadeIn: 0.05, fadeOut: 0.5, rev: 0.2 });
  [74, 79].forEach((m, j) => glock(E('panem', 1, 0.6) + j * BEAT / 2, m, 0.12)); // i due biglietti
  timp(tit, 38, 92, 0.7);
  fanfare(tit + 0.02, [62, 62, 69, 74], { vel: 62, gain: 0.26 });
  pulse(tit + BEAT * 2, B(T.mietitura), { m: 38, vel: 50, gain: 0.28 });

  // ---- mietitura: pianoforte e archi in attesa; il biglietto che sale (arpa), il nome (campana grave),
  //      l'arco (corno), il nome barrato e «volontaria» (timpano e archi che si alzano)
  const slip = E('mietitura', 0, 1.0), nm = slip + 1.0, bow = E('mietitura', 1, 0.4), vol = E('mietitura', 2, 0.2);
  strings(B(T.mietitura), vol, { vel: 42, gain: 0.32, k0: 0 });
  pulse(B(T.mietitura), slip, { m: 38, vel: 46, gain: 0.24, every: 2 });
  [69, 74, 77, 81].forEach((m, j) => arpa(slip + j * BEAT / 4, m, 0.22, -0.2 + j * 0.13)); // Mietitura.tsx: il biglietto sale
  clip(mix, 'stoffa', { t: slip + 0.8, da: 1, durata: 0.4, gain: 0.12, fadeOut: 0.15, rev: 0.3, pan: 0.1 }); // si apre
  clip(mix, 'campana_grave', { t: nm, da: 0.53, durata: 2.2, gain: 0.14, fadeOut: 0.9, rev: 0.4 }); // il nome di Primrose
  motif(B(nm), vol, { vel: 44, gain: 0.26 });
  suona(mix, 'corno', 62, { t: bow, dur: BEAT * 2, vel: 50, gain: 0.26, attack: 0.15, release: 0.8, rev: 0.55 }); // l'arco si illumina
  timp(vol, 38, 86, 0.6); // barrato: Katniss volontaria
  strings(vol + 0.02, B(T.pane), { vel: 52, gain: 0.4, high: true, k0: 2 });
  brass(vol + BEAT / 2, B(T.pane) - vol - BEAT / 2, [41, 57, 65], { vel: 52, gain: 0.26 });

  // ---- pane: il treno (pizzicati a passo doppio come le ruote), pianoforte caldo; la pagnotta (arpa e glockenspiel),
  //      la bottiglia che versa (tintinnio) e il bicchiere che si rovescia e rotola
  const bread = E('pane', 0, 1.2), tg = E('pane', 1, 2.4);
  for (let t = B(T.pane), k = 0; t < B(T.fiamme) - 0.15; t += BEAT / 2, k++) {
    suona(mix, 'celli_pizz', [38, 45][k % 2], { t, dur: 0.3, vel: 46 - (k % 2) * 6, gain: 0.16, pan: -0.15, rev: 0.3, release: 0.2 });
  }
  strings(B(T.pane), B(T.fiamme), { half: true, vel: 40, gain: 0.3, k0: 1, bass: false });
  motif(B(T.pane), tg - 0.3, { vel: 46, gain: 0.3 });
  [62, 65, 69, 74].forEach((m, j) => arpa(bread + j * BEAT / 2, m, 0.24, -0.2 + j * 0.12)); // Pane.tsx: la pagnotta calda
  glock(bread + BEAT * 2, 81, 0.12);
  clip(mix, 'tintinnio', { t: tg - 0.5, da: 0.13, durata: 0.4, gain: 0.12, fadeOut: 0.12, rev: 0.25, pan: 0.3 }); // la bottiglia tocca il bicchiere
  clip(mix, 'tintinnio', { t: tg + 0.1, da: 0.13, durata: 0.6, gain: 0.2, fadeOut: 0.2, rev: 0.25, pan: 0.2 }); // il bicchiere si rovescia
  clip(mix, 'tintinnio', { t: tg + 0.7, da: 0.6, durata: 0.8, gain: 0.08, fadeOut: 0.4, rev: 0.25, pan: 0 }); // rotola
  clip(mix, 'legno_cade', { t: tg + 0.68, da: 0, durata: 0.4, gain: 0.12, fadeOut: 0.15, rev: 0.2, lp: 2500, pan: 0.3 }); // Pane.tsx: la bottiglia cade distesa sul tavolo
  suona(mix, 'tromba_sordina', 63, { t: tg + 0.2, dur: 0.6, vel: 44, gain: 0.16, attack: 0.05, release: 0.4, rev: 0.45, cents: -20 }); // un sorriso storto

  // ---- fiamme: la sfilata a passo doppio (rullante fitto, trombe e tromboni), i cavalli, la folla (applauso e flash);
  //      i mantelli che prendono fuoco (fiammata e piatto); il cuore sullo schermo (arpa e glockenspiel)
  const crowd = E('fiamme', 0, 0.6), tf = E('fiamme', 1, 1.4), th = E('fiamme', 2, 1.0);
  const stopM = E('cornucopia', 0, 2.0) - 3 * BEAT; // la marcia lascia spazio al conto alla rovescia
  march(B(T.fiamme), stopM, { vel: 46, dense: false });
  for (let t = B(T.fiamme); t < stopM - 0.2; t += BEAT) colpo(mix, 'grancassa', 'mp', { t, vel: 100, gain: 0.18, rev: 0.3, seed: Math.round(t * 10) });
  strings(B(T.fiamme), th, { vel: 50, gain: 0.4, k0: 0 });
  clip(mix, 'nitriti', { t: T.fiamme + 0.6, da: 0.6, durata: 1.6, gain: 0.12, fadeOut: 0.4, pan: -0.4, rev: 0.4 }); // Fiamme.tsx: i cavalli
  clip(mix, 'applauso', { t: crowd, da: 3, durata: th + 1.2 - crowd, gain: 0.035, fadeIn: 0.6, fadeOut: 1.2, largo: 3, rev: 0.3 }); // la folla
  fanfare(B(crowd), [62, 66, 69, 74], { vel: 58, gain: 0.24 });
  roll(tf, 1.2, 0.16);
  clip(mix, 'fiammata', { t: tf - 0.05, da: 0.25, durata: 1.3, gain: 0.32, fadeOut: 0.5, rev: 0.3, pan: 0.2 }); // i mantelli in fiamme
  brass(tf, th - tf, [50, 57, 62, 66], { vel: 60, gain: 0.3 });
  [74, 78, 81, 86].forEach((m, j) => arpa(th + j * BEAT / 4, m, 0.24, -0.2 + j * 0.13)); // il cuore sullo schermo
  glock(th + BEAT, 86, 0.14);
  strings(th, B(T.cornucopia), { vel: 44, gain: 0.3, chords: CHM, high: true });

  // ---- cornucopia: il conto alla rovescia (timpano su ogni battito), lo zero (gong) e la corsa (tremolo, rullante fitto);
  //      due colpi di cannone dal bosco; lo zaino afferrato (fruscio) e la fuga (pizzicati che corrono)
  const zero = E('cornucopia', 0, 2.0), c1 = E('cornucopia', 1, 0.4), c2 = E('cornucopia', 1, 1.4), grab = E('cornucopia', 1, 2.8);
  strings(B(T.cornucopia), B(T.vespe), { vel: 48, gain: 0.38, k0: 3 });
  for (let t = zero - BEAT * 3; t < zero - 0.1; t += BEAT) timp(t, 45, 62, 0.34); // Cornucopia.tsx: 3, 2, 1
  gong(zero, 0.32);
  trem(zero, B(T.vespe) - zero, [38, 50, 74, 75], { vel: 50, gain: 0.3 });
  march(zero + BEAT, c1 - 0.05, { vel: 46, dense: true });
  [c1, c2].forEach((c, k) => {
    clip(mix, 'esplosioni', { t: c - 0.05, da: 30.2, durata: 1.8, gain: 0.09 - k * 0.02, fadeIn: 0.02, fadeOut: 1.2, rev: 0.4, lp: 1800, pan: k ? 0.5 : -0.5 }); // i cannoni
    timp(c, 33, 84, 0.45);
  });
  clip(mix, 'stoffa', { t: grab - 0.05, da: 1, durata: 0.5, gain: 0.2, fadeOut: 0.2, rev: 0.25, pan: -0.1 }); // lo zaino afferrato
  for (let t = grab + BEAT / 2, k = 0; t < B(T.vespe) - 0.15; t += BEAT / 4, k++) suona(mix, 'violini_pizz', [74, 72, 69, 67][k % 4], { t, dur: 0.2, vel: 44, gain: 0.1, pan: 0.3, rev: 0.4, release: 0.15 }); // la fuga

  // ---- vespe: la notte (celli tremolo gravi), il fuoco dei Favoriti (crepitio e fiammata), la fionda di Rue (glockenspiel),
  //      il ramo che cede (scricchiolio), il nido che cade (tonfo, timpano) e lo sciame (tremolo acuto e ali)
  const roar = E('vespe', 0, 0.6), ts = E('vespe', 1, 0.8), tc = E('vespe', 1, 2.2);
  strings(B(T.vespe), B(T.rue), { half: true, vel: 48, gain: 0.36, k0: 0 });
  trem(B(T.vespe), tc - B(T.vespe), [38, 39], { vel: 40, gain: 0.22 });
  clip(mix, 'fuoco', { t: T.vespe, da: 2, durata: T.rue - T.vespe, gain: 0.025, fadeIn: 0.5, fadeOut: 0.8, rev: 0.15 });
  clip(mix, 'fiammata', { t: roar - 0.05, da: 0.25, durata: 1.0, gain: 0.14, fadeOut: 0.5, rev: 0.3, pan: 0.2 }); // Vespe.tsx: il fuoco divampa
  [81, 86].forEach((m, j) => glock(ts + j * BEAT / 2, m, 0.13)); // la fionda di Rue
  clip(mix, 'legno_cigolio', { t: tc - 0.45, da: 0.25, durata: 0.6, gain: 0.14, fadeOut: 0.2, rev: 0.3, pan: 0.1 }); // il ramo cede
  clip(mix, 'sacchi', { t: tc + 0.53, da: 0.37, durata: 0.5, gain: 0.28, fadeOut: 0.2, rev: 0.2, pan: 0.15 }); // il nido tocca terra
  timp(tc + 0.55, 38, 88, 0.55);
  clip(mix, 'api', { t: tc + 0.6, da: 2, durata: T.rue - tc - 0.7, gain: 0.06, fadeIn: 0.15, fadeOut: 0.5, rev: 0.25, pan: 0.2 }); // lo sciame
  trem(tc + 0.6, T.rue - tc - 0.6, [86, 87, 89], { vel: 48, gain: 0.24 });

  // ---- rue: il pomeriggio nella radura (arpa, archi caldi in maggiore); le foglie che curano (glockenspiel), l'amicizia
  //      (arpa); la lancia (colpo, la musica tace un battito); la freccia nel tronco (colpo di legno); la canzone (violino solo)
  const heal = E('rue', 0, 1.0), fr = E('rue', 1, 0.6), sp = E('rue', 1, 2.6), ta = E('rue', 2, 0.5), song = E('rue', 2, 1.2);
  harp(B(T.rue), sp - 0.2, { vel: 44, gain: 0.22, chords: CHM });
  strings(B(T.rue), sp - 0.1, { half: true, vel: 42, gain: 0.3, chords: CHM });
  [81, 86, 90].forEach((m, j) => glock(heal + j * BEAT / 2, m, 0.12)); // Rue.tsx: le foglie si illuminano
  [74, 78, 81].forEach((m, j) => arpa(fr + j * BEAT / 4, m, 0.22, 0.2)); // la freccia accanto alla fionda
  clip(mix, 'colpi_legno', { t: sp - 0.02, da: 1.46, durata: 0.4, gain: 0.26, rev: 0.3, pan: 0.3 }); // la lancia si pianta
  timp(sp, 33, 88, 0.55);
  suona(mix, 'celli', 38, { t: sp + BEAT, dur: O + Math.ceil((song - O) / BEAT) * BEAT + 0.4 - sp - BEAT, vel: 50, gain: 0.48, attack: 0.3, release: 0.6, rev: 0.6 });
  clip(mix, 'colpi_legno', { t: ta - 0.02, da: 12.55, durata: 0.28, gain: 0.3, fadeOut: 0.2, rev: 0.35, pan: 0.35 }); // la freccia nel tronco
  const sb = O + Math.ceil((song - O) / BEAT) * BEAT; // la canzone parte dopo la freccia, con le note a schermo
  strings(sb - BEAT, B(T.fiori), { half: true, vel: 48, gain: 0.4, k0: 0 });
  motif(sb, E('fiori', 0, 1.6), { half: true, vel: 58, gain: 0.42, id: 'violino_solo', pan: -0.1 }); // la canzone per Rue

  // ---- fiori: il frutteto di notte (archi gravi); i fiori sullo schermo (arpa), le tre lanterne (tre rintocchi);
  //      la rivolta (rullante, ottoni bassi, fuoco); Snow si arrabbia (tromba con sordina e timpano); il «2» (gong e ottoni)
  const lt = (k) => E('fiori', 0, 1.6 + k * 0.67), tr = E('fiori', 1, 0.8), tsn = E('fiori', 1, 2.6), two = E('fiori', 2, 1.2);
  strings(B(T.fiori), tr, { half: true, vel: 44, gain: 0.34, k0: 2 });
  harp(B(T.fiori), lt(0), { vel: 40, gain: 0.2, k0: 2 }); // Fiori.tsx: i fiori sbocciano sullo schermo
  [74, 77, 81].forEach((m, k) => { glock(lt(k), m + 12, 0.14); arpa(lt(k), m, 0.2); }); // le tre lanterne
  march(tr, tsn, { vel: 50, dense: true });
  brass(tr, tsn - tr, [38, 45, 50], { vel: 56, gain: 0.26 });
  clip(mix, 'fuoco', { t: tr, da: 6, durata: B(T.grotta) - tr, gain: 0.035, fadeIn: 0.8, fadeOut: 0.8, rev: 0.15 }); // le fiaccole
  timp(tsn, 38, 90, 0.55);
  suona(mix, 'tromba_sordina', 75, { t: tsn, dur: 0.9, vel: 58, gain: 0.22, attack: 0.03, release: 0.4, rev: 0.45 }); // lo schermo rosso
  suona(mix, 'tromba_sordina', 74, { t: tsn + 0.02, dur: 0.9, vel: 58, gain: 0.2, attack: 0.03, release: 0.4, rev: 0.45 });
  trem(tsn + BEAT, two - tsn - BEAT, [38, 74, 75], { vel: 44, gain: 0.32 });
  gong(two, 0.28);
  brass(two, B(T.grotta) - two, [45, 57, 61, 64], { vel: 54, gain: 0.28 }); // la nuova regola

  // ---- grotta: la pioggia sul fiume, le gocce; il fuoco acceso (fiammifero, crepitio), la medicina (glockenspiel),
  //      il coltello nella roccia (colpo di metallo), il coltello che cade; lo zaino dentro (arpa in maggiore)
  const tf2 = E('grotta', 0, 0.8), tp = E('grotta', 1, 1.4), tk = E('grotta', 1, 3.0), tdr = E('grotta', 2, 1.6);
  clip(mix, 'pioggia_dura', { t: T.grotta, da: 5.4, durata: T.cani - T.grotta, gain: 0.05, fadeIn: 0.8, fadeOut: 0.8, largo: 3, rev: 0.1, lp: 3200 });
  strings(B(T.grotta), tk, { half: true, vel: 46, gain: 0.38, k0: 1 });
  motif(B(T.grotta), tp, { vel: 48, gain: 0.36, oct: -12 });
  harp(B(T.grotta), tk, { vel: 40, gain: 0.18, k0: 1 });
  clip(mix, 'fiammifero', { t: tf2 - 0.5, da: 0.2, durata: 1.3, gain: 0.16, fadeOut: 0.4, rev: 0.25, pan: 0.1 }); // Grotta.tsx: il fuoco
  clip(mix, 'fuoco', { t: tf2 + 0.5, da: 2, durata: T.cani - tf2 - 0.5, gain: 0.02, fadeIn: 0.6, fadeOut: 0.8, rev: 0.15 });
  [86, 90].forEach((m, j) => glock(tp + j * BEAT / 2, m, 0.13)); // lo zaino col 12
  pulse(tp + BEAT, tk - 0.1, { m: 38, vel: 50, gain: 0.26, every: 0.5 });
  clip(mix, 'metallo_colpi', { t: tk - 0.02, da: 2.9, durata: 0.22, fadeOut: 0.08, gain: 0.22, rev: 0.3, pan: 0.4 }); // il coltello nella roccia
  timp(tk, 45, 80, 0.4);
  trem(tk + BEAT / 2, tdr - tk - BEAT / 2, [38, 39, 74], { vel: 52, gain: 0.42 });
  clip(mix, 'metallo_cade', { t: tdr + 0.35, da: 0.72, durata: 0.6, gain: 0.2, fadeOut: 0.2, rev: 0.3, pan: 0.4 }); // il coltello cade
  harp(tdr + BEAT, B(T.cani) + 0.2, { vel: 44, gain: 0.24, chords: CHM }); // lo zaino dentro, accanto al fuoco
  strings(tdr + BEAT, B(T.cani) + 0.4, { vel: 42, gain: 0.3, chords: CHM });

  // ---- cani: la notte sulla Cornucopia (tremolo grave, battito); le bacche (glockenspiel), il cannone (esplosione lontana);
  //      gli occhi rossi (ringhio), i cani che escono (ululato, archi che salgono); la spada che cade e rimbalza (metallo),
  //      poi un battito di silenzio
  const tb = E('cani', 0, 0.8), tcn = E('cani', 0, 2.6), te = E('cani', 1, 0.3), tsw = E('cani', 2, 1.6);
  trem(B(T.cani), tsw - B(T.cani), [38, 39], { vel: 42, gain: 0.24 });
  strings(B(T.cani), tsw, { half: true, vel: 46, gain: 0.36, k0: 3 });
  [86, 85].forEach((m, j) => glock(tb + j * BEAT / 2, m, 0.12)); // Cani.tsx: le bacche luccicano
  clip(mix, 'esplosioni', { t: tcn - 0.05, da: 30.2, durata: 1.8, gain: 0.15, fadeIn: 0.02, fadeOut: 1.2, rev: 0.4, lp: 1800, pan: -0.5 }); // il cannone
  timp(tcn, 33, 84, 0.45);
  clip(mix, 'ringhio', { t: te + 0.2, da: 10, durata: 2.2, gain: 0.09, rate: 0.8, fadeIn: 0.1, fadeOut: 0.5, rev: 0.35, pan: -0.3 }); // gli occhi rossi
  clip(mix, 'lupo', { t: te + 1.2, da: 1.25, durata: 2.6, gain: 0.07, fadeOut: 1, pan: 0.5, rev: 0.45 }); // i cani escono
  clip(mix, 'ringhio', { t: te + 2.4, da: 15.5, durata: 1.4, gain: 0.08, rate: 0.85, fadeIn: 0.1, fadeOut: 0.5, rev: 0.35, pan: 0.3 });
  pulse(te, tsw, { m: 38, vel: 56, gain: 0.3, every: 0.5 });
  [50, 53, 57, 62].forEach((m, j) => suona(mix, 'violini', m + 12, { t: te + 1 + j * BEAT, dur: BEAT * 1.2, vel: 46, gain: 0.16, attack: 0.2, release: 0.6, rev: 0.55, pan: 0.2 }));
  clip(mix, 'metallo_colpi', { t: tsw + 0.48, da: 8.07, durata: 0.5, gain: 0.3, rev: 0.3, pan: 0 }); // la spada tocca terra
  clip(mix, 'metallo_colpi', { t: tsw + 0.86, da: 12.82, durata: 0.4, gain: 0.18, rev: 0.3, pan: -0.15 }); // rimbalza
  timp(tsw + 0.5, 38, 88, 0.5);
  suona(mix, 'contrabbasso', 26, { t: tsw + 0.5 + BEAT, dur: T.bacche - tsw - 0.5 - BEAT, vel: 50, gain: 0.45, attack: 0.4, release: 0.8, rev: 0.6 });

  // ---- bacche: l'alba (archi a metà passo); la regola ritirata (tromba con sordina); le bacche che si illuminano
  //      (celli gravi, battito); «vincitori» (timpano, squillo in Re maggiore, fuochi lontani, applauso);
  //      la rosa bianca di Snow (archi in minore, tremolo freddo e il motivo al pianoforte)
  const t0 = E('bacche', 0, 0.5), t1 = E('bacche', 1, 1.4), t2 = E('bacche', 2, 0.4), t3 = E('bacche', 3, 0.3);
  strings(B(T.bacche - 1), t1, { half: true, vel: 46, gain: 0.38, k0: 0 });
  harp(B(T.bacche - 1), t1, { vel: 44, gain: 0.22 });
  suona(mix, 'tromba_sordina', 69, { t: t0, dur: 0.5, vel: 52, gain: 0.18, attack: 0.03, release: 0.3, rev: 0.45 }); // Bacche.tsx: il 2 barrato
  suona(mix, 'tromba_sordina', 62, { t: t0 + BEAT, dur: 0.9, vel: 52, gain: 0.18, attack: 0.03, release: 0.4, rev: 0.45 }); // diventa 1
  trem(t1, t2 - t1, [38, 50, 74], { vel: 46, gain: 0.26 });
  pulse(t1, t2 - 0.1, { m: 38, vel: 54, gain: 0.3, every: 0.5 });
  roll(t2, 1.2, 0.18);
  timp(t2, 38, 96, 0.65);
  fanfare(t2 + 0.02, [62, 66, 69, 74], { vel: 64, gain: 0.3 });
  strings(t2 + 0.02, t3, { vel: 52, gain: 0.38, high: true, chords: CHM });
  [0, 1, 2, 3, 4, 5].map((k) => k * BEAT / 2).forEach((d, k) => clip(mix, 'esplosioni', { t: t2 + d, da: 30.2, durata: 1.2, gain: 0.05, fadeIn: 0.02, fadeOut: 0.8, rev: 0.45, lp: 1500, pan: -0.6 + k * 0.24 })); // i fuochi
  [0, 1, 2].forEach((k) => clip(mix, 'esplosioni', { t: t2 + 1.8 + k * BEAT / 2, da: 30.2, durata: 1.0, gain: 0.035, fadeIn: 0.02, fadeOut: 0.7, rev: 0.45, lp: 1500, pan: 0.5 - k * 0.3 })); // Bacche.tsx: il secondo gruppo di fuochi
  clip(mix, 'applauso', { t: t2 + 0.3, da: 3, durata: t3 - t2 + 0.5, gain: 0.1, fadeIn: 0.4, fadeOut: 1.0, largo: 3, rev: 0.3 });
  strings(t3, B(T.finale), { half: true, vel: 44, gain: 0.34, k0: 0 }); // la rosa bianca: di nuovo in minore
  trem(t3, B(T.finale) - t3, [86, 87], { vel: 40, gain: 0.2 });
  motif(t3 + BEAT, B(T.finale), { half: false, vel: 44, gain: 0.26 });

  // ---- finale: un accordo di Re maggiore aperto con il corno che canta il passo che resiste, risolto
  const F = B(T.finale);
  [['contrabbasso', 38], ['celli', 50], ['viole', 57], ['viole', 62], ['violini', 66], ['violini', 74]].forEach(([id, n], k) =>
    suona(mix, id, n, { t: F, dur: T.END - F, vel: 52, pan: (k - 2.5) * 0.18, gain: 0.46, attack: 0.4, release: 1.6, rev: 0.6, seed: 30 + k }));
  [62, 66, 69, 74, 78, 81].forEach((m, j) => suona(mix, 'arpa', m, { t: F + j * BEAT / 3, dur: 2.4, vel: 50, pan: -0.3 + j * 0.12, rev: 0.6, gain: 0.28, release: 1.4 }));
  motif(F + 0.2, T.END - 0.3, { half: false, vel: 50, gain: 0.26, major: true, id: 'corno', oct: -12, pan: -0.1 });
};
