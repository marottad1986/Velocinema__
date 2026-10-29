// Colonna sonora originale di Shining, discreta sotto la voce.
// Orchestra campionata (VSCO-2 CE e VCSL, CC0: scripts/audio/campioni.mjs): organo, archi in tremolo, pianoforte a coda,
// contrabbasso, timpani, gong e piatto sospeso. Nessun richiamo alla musica del film (niente Dies irae, niente
// elettronica): un motivo inventato qui, in Re minore e in 4/4 a 66 bpm, di quattro note al pianoforte grave che scende di
// semitono (Re–Do♯–Do–Si) su un pedale d'organo; il «battito» del contrabbasso pizzicato e dei timpani cresce con la paura.
// Freddo e vuoto fuori (vento), caldo e falso nel bar (organo), sempre più teso fino all'ascia e al labirinto; finale sospeso.
// Effetti registrati (archivio CC0 di Craig Smith: scripts/audio/effetti.mjs), agganciati alle frasi dei sottotitoli
// (tempi come in ChapterOverlay) e agli eventi delle scene in src/scenes/shining/.
import { suona, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['organo', 'organo_pedale', 'celli', 'viole', 'violini', 'contrabbasso', 'celli_trem', 'violini_trem', 'contrabbasso_pizz',
  'pianoforte_coda', 'glockenspiel', 'timpani', 'gong', 'gong_graffio', 'piatto_sospeso', 'grancassa_rullo'];
export const effetti = ['vento_artico', 'vento_invernale', 'macchina_scrivere', 'porta_cigolio', 'legno_cigolio', 'porta_sbatte', 'legno_cade',
  'scintille', 'serratura', 'tintinnio', 'radio_sintonia', 'disturbo', 'metallo_cade', 'colpi_legno', 'pagine'];
/** Grande salone vuoto: coda lunga, alte smorzate. */
export const sala = { rt60: 3.2, brillo: 5000, predelay: 0.035, wet: 0.55 };

/** Un solo tempo per tutto il film (CLAUDE.md, «Musica»): le scene lente vanno a metà passo (33). */
const BPM = 66;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;

// Motivo (Re minore): quattro note che scendono di semitono, poi la quinta sotto. [tempo, nota MIDI, durata in tempi]
const MOTIF = [[0, 50, 2], [2, 49, 2], [4, 48, 2], [6, 47, 1.5], [7.5, 45, 0.5]];
// accordi d'organo tenuti, due battute ciascuno: Re minore, Si♭ (con il Re), Sol minore, La
const CH = [[38, 50, 53, 57], [34, 50, 53, 58], [31, 50, 55, 58], [33, 49, 52, 57]];

export default (mix, T) => {
  const { segments } = timeline(loadFilm('shining'));
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
  const B = (t) => T.custode + Math.round((t - T.custode) / BAR) * BAR;

  /** Accordi d'organo tenuti (due battute ciascuno) da `from` a `to`; dark: solo il pedale e la quinta. */
  const organ = (from, to, { vel = 46, gain = 0.4, dark = false, k0 = 0 } = {}) => {
    for (let t = from, k = k0; t < to - 0.5; t += 2 * BAR, k++) {
      const d = Math.min(2 * BAR, to - t);
      const ch = CH[k % 4];
      suona(mix, 'organo_pedale', ch[0], { t, dur: d, vel, gain: gain * 0.9, attack: 0.4, release: 1.2, rev: 0.5 });
      (dark ? ch.slice(1, 2) : ch.slice(1)).forEach((m, j) =>
        suona(mix, 'organo', m, { t, dur: d, vel: vel - 6, pan: (j - 1) * 0.3, gain: gain * 0.6, attack: 0.5, release: 1.2, rev: 0.55, seed: k + j }));
    }
  };
  /** Il motivo al pianoforte a coda; half = metà passo; oct = trasposizione. */
  const motif = (from, to, { half = false, vel = 60, oct = 0, gain = 0.6 } = {}) => {
    const beat = BEAT * (half ? 2 : 1), loop = 8 * beat;
    for (let L = from; L < to - 0.3; L += loop) {
      for (const [b, m, d] of MOTIF) {
        const t = L + b * beat;
        if (t >= to - 0.3) break;
        suona(mix, 'pianoforte_coda', m + oct, { t, dur: Math.min(d * beat, to - t), vel, pan: -0.1, rev: 0.55, gain, release: 0.9 });
        suona(mix, 'pianoforte_coda', m + oct + 12, { t: t + 0.01, dur: Math.min(d * beat, to - t), vel: vel - 18, pan: 0.15, rev: 0.6, gain: gain * 0.5, release: 0.9 });
      }
    }
  };
  /** Il battito: contrabbasso pizzicato (e timpani) a due colpi, come un cuore. */
  const pulse = (from, to, { half = false, vel = 64, timp = false, gain = 0.55 } = {}) => {
    const step = BEAT * (half ? 4 : 2);
    for (let t = from; t < to - 0.3; t += step) {
      suona(mix, 'contrabbasso_pizz', 26, { t, dur: BEAT, vel, pan: -0.1, rev: 0.35, gain, release: 0.4 });
      suona(mix, 'contrabbasso_pizz', 26, { t: t + BEAT * 0.4, dur: BEAT, vel: vel - 16, pan: -0.1, rev: 0.35, gain: gain * 0.8, release: 0.4 });
      if (timp) suona(mix, 'timpani', 38, { t, dur: 1.4, vel: vel + 10, pan: 0.15, rev: 0.5, gain: 0.9, release: 0.6, seed: Math.round(t) });
    }
  };
  /** Archi in tremolo tenuti (paura): celli e violini sull'accordo dato. */
  const trem = (t, dur, notes, { vel = 54, gain = 0.4 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 60 ? 'celli_trem' : 'violini_trem', m, { t, dur, vel, pan: (j - (notes.length - 1) / 2) * 0.35, gain, attack: 0.6, release: 0.9, rev: 0.55, seed: j + 3 }));
  const gong = (t, gain = 0.4, file = 'gong_hit_p') => colpo(mix, 'gong', file, { t, vel: 80, rev: 0.55, gain, dur: 3.5, release: 1 });
  const scrape = (t, gain = 0.3, file = 'gong_scrape_3') => colpo(mix, 'gong_graffio', file, { t, vel: 80, rev: 0.6, gain, dur: 4, release: 1 });
  const roll = (t, gain = 0.3) => colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_roll2_cresc', { t, vel: 60, rev: 0.45, gain, dur: 1.6, release: 0.4 });
  /** Vento in sottofondo (tappeto sotto la musica). */
  const wind = (id, t, durata, gain, da = 3) => clip(mix, id, { t, da, durata, gain, fadeIn: 1, fadeOut: 1, largo: 4, rev: 0.1 });

  // ---- copertina: vento della tormenta, un accordo d'organo, la macchina da scrivere, gong
  wind('vento_invernale', 0, T.custode + 0.6, 0.12);
  suona(mix, 'organo_pedale', 38, { t: 0.3, dur: 3.6, vel: 50, gain: 0.4, attack: 0.8, release: 1.2, rev: 0.5 });
  [50, 53, 57].forEach((m, j) => suona(mix, 'organo', m, { t: 0.5 + j * 0.3, dur: 3.2 - j * 0.3, vel: 44, pan: (j - 1) * 0.3, gain: 0.25, attack: 0.6, release: 1.2, rev: 0.55 }));
  clip(mix, 'macchina_scrivere', { t: 1.6, da: 0.4, durata: 1.3, gain: 0.22, fadeOut: 0.3, rev: 0.3, pan: 0.15 });
  scrape(2.2, 0.18);

  // ---- custode: l'auto sale fra le montagne; motivo a metà passo su organo calmo; buio su «uccise la famiglia»
  organ(B(T.custode), B(T.dono), { vel: 44, gain: 0.32 });
  motif(B(T.custode), B(T.dono), { half: true, vel: 54 });
  clip(mix, 'vento_artico', { t: T.custode, da: 2, durata: cue('custode', 3) - T.custode, gain: 0.06, fadeIn: 1, fadeOut: 0.8, largo: 4, rev: 0.1 });
  gong(cue('custode', 3) + 0.1, 0.4);
  trem(cue('custode', 3) + 0.1, T.dono - cue('custode', 3) - 0.1, [38, 45, 50], { vel: 50, gain: 0.35 });

  // ---- dono: luccicanza, campanelli freddi nello specchio, il motivo un'ottava sopra
  organ(B(T.dono), B(T.stanza), { vel: 40, gain: 0.26, dark: true, k0: 1 });
  motif(B(T.dono), B(T.stanza), { half: true, vel: 50, oct: 12, gain: 0.45 });
  [86, 89, 93, 98].forEach((m, j) => suona(mix, 'glockenspiel', m, { t: cue('dono', 1) + j * 0.18, dur: 2, vel: 52, pan: -0.3 + j * 0.2, rev: 0.7, gain: 0.16, release: 1.5 }));
  roll(cue('dono', 2) - 1.2, 0.2);
  trem(cue('dono', 2), T.stanza - cue('dono', 2), [62, 63], { vel: 44, gain: 0.22 });

  // ---- stanza: corridoio, il battito comincia; il divieto della 237 con colpo d'archi e serratura
  organ(B(T.stanza), B(T.neve), { vel: 40, gain: 0.26, dark: true, k0: 2 });
  pulse(B(T.stanza), B(T.neve), { half: true, vel: 58 });
  clip(mix, 'legno_cigolio', { t: T.stanza + 0.5, da: 2.85, durata: 1.0, gain: 0.25, fadeOut: 0.3, rev: 0.4, pan: -0.2 });
  clip(mix, 'serratura', { t: cue('stanza', 2), da: 2.45, durata: 0.5, gain: 0.35, pan: 0.2, rev: 0.3 });
  trem(cue('stanza', 2), T.neve - cue('stanza', 2), [50, 51, 62, 63], { vel: 56, gain: 0.32 });

  // ---- neve: la tormenta, i fili che si spezzano, la radio, il faro del mezzo per la neve
  wind('vento_invernale', T.neve - 0.5, T.bambine - T.neve + 0.5, 0.11, 20);
  organ(B(T.neve), B(T.bambine), { vel: 44, gain: 0.3 });
  motif(B(T.neve), B(T.bambine), { half: true, vel: 56 });
  clip(mix, 'metallo_cade', { t: cue('neve', 1) + 0.6, da: 0.66, durata: 0.28, gain: 0.3, fadeOut: 0.1, rev: 0.4, pan: 0.3 });
  clip(mix, 'disturbo', { t: cue('neve', 2) + 0.5, da: 7, durata: 1.4, gain: 0.16, fadeIn: 0.05, fadeOut: 0.3, rev: 0.15, pan: -0.2 });
  clip(mix, 'serratura', { t: cue('neve', 3), da: 13.6, durata: 0.35, gain: 0.25, pan: 0.2, rev: 0.3 });

  // ---- bambine: il triciclo sul tappeto e sul parquet, poi silenzio gelato; carillon storto di glockenspiel
  [[0.2, 1.3], [1.5, 0.7]].forEach(([d, l]) => clip(mix, 'legno_cigolio', { t: T.bambine + d, da: 0.25, durata: l, gain: 0.12, rate: 1.4, fadeOut: 0.3, rev: 0.3, pan: -0.3 + d * 0.2 }));
  pulse(B(T.bambine), B(T.bar), { half: true, vel: 56 });
  organ(B(T.bambine), B(T.bar), { vel: 40, gain: 0.26, dark: true, k0: 3 });
  for (let k = 0, t = cue('bambine', 1); t < T.bar - 0.6; k++, t += BEAT) // il carillon delle due bambine: il motivo, acuto e lento
    suona(mix, 'glockenspiel', [86, 85, 84, 83][k % 4], { t, dur: 1.4, vel: 46 - k, pan: k % 2 ? 0.3 : -0.3, rev: 0.7, gain: 0.18, release: 1.2 });
  trem(cue('bambine', 2), T.bar - cue('bambine', 2), [74, 75], { vel: 40, gain: 0.2 });
  scrape(cue('bambine', 2), 0.22);

  // ---- bar: il salone dorato si accende; organo caldo e falso, bicchiere versato, poi diventa rosso
  organ(B(T.bar), B(T.frase), { vel: 52, gain: 0.4 });
  motif(B(T.bar), B(cue('bar', 3)), { half: true, vel: 50, oct: 12, gain: 0.4 });
  [0, 1, 2].forEach((i) => clip(mix, 'tintinnio', { t: cue('bar', 1) + i * 0.25, da: 0.16, durata: 0.25, gain: 0.08, rev: 0.4, pan: -0.3 + i * 0.3 }));
  clip(mix, 'tintinnio', { t: cue('bar', 2) + 0.2, da: 4.13, durata: 0.35, gain: 0.25, pan: 0.2, rev: 0.3 });
  clip(mix, 'tintinnio', { t: cue('bar', 2) + 0.9, da: 3.42, durata: 0.22, gain: 0.16, pan: 0.2, rev: 0.3 });
  trem(cue('bar', 3), T.frase - cue('bar', 3), [38, 50, 51], { vel: 60, gain: 0.4 });
  pulse(B(cue('bar', 3)), B(T.frase), { vel: 60, timp: true });

  // ---- frase: la macchina da scrivere a raffica; pagine; il battito a passo pieno
  clip(mix, 'macchina_scrivere', { t: T.frase + 0.2, da: 0.4, durata: cue('frase', 2) - T.frase, gain: 0.16, fadeIn: 0.1, fadeOut: 0.3, rev: 0.25, pan: 0.15 });
  clip(mix, 'pagine', { t: cue('frase', 1) + 0.2, da: 1, durata: 1.2, gain: 0.25, fadeOut: 0.3, rev: 0.3, pan: -0.2 });
  pulse(B(T.frase), B(T.dispensa), { vel: 62 });
  motif(B(T.frase), B(T.dispensa), { vel: 56 });
  organ(B(cue('frase', 2)), B(T.dispensa), { vel: 40, gain: 0.26, dark: true });
  gong(cue('frase', 3), 0.45);
  trem(cue('frase', 3), T.dispensa - cue('frase', 3), [50, 51, 57, 58], { vel: 62, gain: 0.4 });

  // ---- dispensa: la porta sbattuta, il chiavistello che scorre da solo, la radio già rotta che sfrigola
  clip(mix, 'porta_sbatte', { t: T.dispensa + 0.4 - 0.5, da: 2.6, durata: 0.9, gain: 0.32, fadeOut: 0.3, rev: 0.35 }); // Dispensa.tsx: slam a 0,4 s
  pulse(B(T.dispensa), B(T.specchio), { half: true, vel: 58 });
  organ(B(T.dispensa), B(T.specchio), { vel: 44, gain: 0.34, dark: true, k0: 3 });
  clip(mix, 'serratura', { t: cue('dispensa', 1) + 0.6, da: 5.55, durata: 0.6, gain: 0.4, pan: 0.25, rev: 0.3 }); // il chiavistello scorre
  clip(mix, 'porta_cigolio', { t: cue('dispensa', 1) + 1.6, da: 10.68, durata: 1.6, gain: 0.3, fadeOut: 0.4, rev: 0.35, pan: 0.1 });
  scrape(cue('dispensa', 1) + 0.6, 0.25);
  clip(mix, 'scintille', { t: cue('dispensa', 2) + 0.4, da: 0.5, durata: 0.8, gain: 0.25, fadeOut: 0.3, rev: 0.3, pan: 0.4 }); // la radio rotta sputa una scintilla
  clip(mix, 'disturbo', { t: cue('dispensa', 2) + 0.4, da: 7, durata: 0.6, gain: 0.14, fadeIn: 0.02, fadeOut: 0.3, rev: 0.15, pan: 0.4 });
  trem(cue('dispensa', 2) + 0.4, T.specchio - cue('dispensa', 2) - 0.4, [38, 50, 56], { vel: 58, gain: 0.36 });

  // ---- specchio: «murder» nello specchio (gong), poi l'ascia: due colpi sul legno con timpani e schegge
  pulse(B(T.specchio), B(cue('specchio', 2)), { half: true, vel: 58 });
  organ(B(T.specchio), B(cue('specchio', 2)), { vel: 42, gain: 0.3, dark: true, k0: 1 });
  motif(B(T.specchio), B(cue('specchio', 2)), { half: true, vel: 52 });
  trem(cue('specchio', 1) + 0.2, cue('specchio', 2) + 0.6 - cue('specchio', 1) - 0.2, [50, 51, 62, 63], { vel: 60, gain: 0.38 });
  gong(cue('specchio', 1) + 0.2, 0.45, 'gong_hit_mp');
  [cue('specchio', 2) + 0.6, cue('specchio', 3) + 0.5].forEach((h, k) => { // Specchio.tsx: hits
    clip(mix, 'colpi_legno', { t: h + 0.05, da: 5.74, durata: 0.45, gain: 0.5 + 0.1 * k, rev: 0.4 });
    clip(mix, 'legno_cade', { t: h + 0.15, da: 0, durata: 0.6, gain: 0.25, rev: 0.35, pan: 0.2 });
    suona(mix, 'timpani', 38, { t: h + 0.05, dur: 1.6, vel: 100, gain: 1.1, rev: 0.5, release: 0.7, seed: k });
  });
  roll(cue('specchio', 3) - 1, 0.25);
  trem(cue('specchio', 3) + 0.5, T.labirinto - cue('specchio', 3) - 0.5, [38, 50, 51, 62], { vel: 70, gain: 0.45 });

  // ---- labirinto: tormenta notturna, i fari che si spengono, la fuga: battito a passo pieno con timpani
  wind('vento_artico', T.labirinto - 0.3, T.foto - T.labirinto + 0.3, 0.14, 2);
  organ(B(T.labirinto), B(cue('labirinto', 2)), { vel: 40, gain: 0.26, dark: true });
  motif(B(T.labirinto), B(cue('labirinto', 2)), { half: true, vel: 54 });
  gong(cue('labirinto', 2), 0.5, 'gong_hit_mp');
  suona(mix, 'timpani', 38, { t: cue('labirinto', 2), dur: 2, vel: 110, gain: 1.2, rev: 0.5, release: 0.8, seed: 7 });
  pulse(B(cue('labirinto', 3)), B(T.foto), { vel: 66, timp: true });
  trem(cue('labirinto', 3), T.foto - cue('labirinto', 3), [38, 45, 50, 57, 62], { vel: 64, gain: 0.42 });
  colpo(mix, 'grancassa_rullo', 'bdrum_roll1', { t: T.foto - 3, vel: 70, rev: 0.4, gain: 0.25, dur: 3, release: 0.5 });

  // ---- foto: silenzio all'alba (solo vento); poi l'organo e il motivo un'ottava sopra sulla foto del 1921
  wind('vento_invernale', T.foto, cue('foto', 2) - T.foto + 1, 0.08, 40);
  motif(B(T.foto), B(cue('foto', 2)), { half: true, vel: 46, gain: 0.45 });
  organ(B(cue('foto', 2)), T.finale, { vel: 44, gain: 0.32, k0: 0 });
  motif(B(cue('foto', 2)), T.finale, { half: true, vel: 50, oct: 12, gain: 0.45 });
  roll(cue('foto', 3) - 1.3, 0.22);
  [86, 89, 93, 98].forEach((m, j) => suona(mix, 'glockenspiel', m, { t: cue('foto', 3) + j * 0.2, dur: 2, vel: 48, pan: -0.3 + j * 0.2, rev: 0.7, gain: 0.15, release: 1.5 }));

  // ---- finale: un ultimo accordo d'organo sospeso (Re con la sesta minore), gong lontano, vento
  const F = B(T.finale) > T.finale + 0.4 ? B(T.finale) - BAR : B(T.finale);
  suona(mix, 'organo_pedale', 38, { t: F, dur: T.END - F, vel: 48, gain: 0.4, attack: 0.3, release: 1.4, rev: 0.55 });
  [50, 53, 58].forEach((m, j) => suona(mix, 'organo', m, { t: F + j * 0.1, dur: T.END - F - j * 0.1, vel: 44, pan: (j - 1) * 0.3, gain: 0.26, attack: 0.4, release: 1.4, rev: 0.6 }));
  gong(F + 0.2, 0.3);
  wind('vento_invernale', T.finale, T.END - T.finale, 0.07, 60);
};
