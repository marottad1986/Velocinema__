// Colonna sonora originale di Interstellar: pianoforte, archi e organo (campionati, VSCO-2 CE), discreti
// sotto la voce. Il tema (La minore, 4 battute, poche note che salgono) è inventato qui: intimo alla fattoria, si allarga
// nello spazio, si fa teso sulle onde e sul ghiaccio e si apre in La maggiore nel finale. Niente ticchettii regolari né
// motivi del film. Effetti registrati (archivio CC0, scripts/audio/effetti.mjs) agganciati agli eventi delle scene
// in src/scenes/interstellar/.
import { put, rng, swell, FX } from './synth.mjs';
import { suona, archi, colpo, crescendo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte', 'violini', 'viole', 'celli', 'contrabbasso', 'organo', 'organo_pieno', 'glockenspiel', 'grancassa', 'piatto_sospeso'];
export const effetti = ['vento_leggero', 'vento_raffiche', 'vento_artico', 'legno_cade', 'scariche', 'scatti', 'porta_sbatte', 'razzo',
  'passaggio', 'onde_tonanti', 'tuono_forte', 'rombo', 'disturbo', 'ghiaccio_frana', 'esplosioni', 'metallo_colpi', 'metallo_schianto'];
/** Sala grande e luminosa: coda lunga (lo spazio). */
export const sala = { rt60: 3.2, brillo: 7000, predelay: 0.035, wet: 0.6 };

const TAU = Math.PI * 2;
const SR = 44100;
/** Un solo tempo per tutto il film; le sezioni di tensione vanno a passo doppio sulla stessa griglia. */
const BPM = 72;
const GRID = (4 * 60) / BPM;
const BEAT = 60 / BPM;
const OFF = 2 / 3; // sfasamento della griglia: 7 capitoli su 11 cadono esattamente sulla battuta
const snap = (t) => OFF + Math.round((t - OFF) / GRID) * GRID;
const vamp = (v) => (v / 127) ** 1.6;

// ---------------------------------------------------------------- strumenti (campionati; firme come nella versione sintetica)

/** Pianoforte verticale; dur = tasto tenuto, poi smorzatore. */
const piano = (mix, m, { t, dur = 1.5, vel = 60, pan = 0, rev = 0.5, gain = 1 }) =>
  suona(mix, 'pianoforte', m, { t, dur: Math.min(dur, 4), vel: vel * 1.1, pan, rev, gain: gain * 4, release: 0.5 });

/** Tappeto: archi con attacco lento (il vecchio sintetizzatore). bright non serve più. */
const pad = (mix, m, { t, dur, vel = 40, pan = 0, rev = 0.7, gain = 1, att = 1.5, seed = 1 }) =>
  archi(mix, m, { t, dur, vel: vel + 6, pan, rev, gain: gain * 1.5, attack: att, release: 1.8, seed });

/** Organo a canne: registri dolci; da vel 54 il ripieno. */
const organ = (mix, m, { t, dur, vel = 40, pan = 0, rev = 0.75, gain = 1 }) =>
  suona(mix, vel >= 54 ? 'organo_pieno' : 'organo', m, { t, dur, vel, pan, rev, gain: gain * (vel >= 54 ? 0.45 : 0.6), attack: 0.08, release: 1.2 });

/** Archi d'orchestra. */
const strings = (mix, m, { t, dur, vel = 40, pan = 0, rev = 0.6, gain = 1, att = 1.0, seed = 1 }) =>
  archi(mix, m, { t, dur, vel: vel + 8, pan, rev, gain: gain * 0.8, attack: att, release: 1.4, seed });

/** Campanella: glockenspiel. */
const bell = (mix, m, { t, vel = 46, pan = 0, gain = 1 }) =>
  suona(mix, 'glockenspiel', m, { t, dur: 2.5, vel: vel + 10, pan, rev: 0.75, gain: gain * 0.4, release: 1.5 });

/** Bip di Morse: sinusoide breve e pulita (è un segnale elettronico anche nel film). */
const beep = (mix, t, dur, { vel = 40, f = 1320 } = {}) => {
  put(mix, t, Math.ceil(dur * SR), (i) => Math.sin(TAU * f * i / SR) * Math.min(1, i / 200) * Math.min(1, (dur * SR - i) / 200), { gain: FX * vamp(vel) * 0.35, pan: 0.2, rev: 0.4 });
};

// ---------------------------------------------------------------- materiale musicale

// tema: [tempo, nota MIDI, durata in tempi]; 4 battute in 4/4, La minore, salita lenta
const THEME = [
  [0, 69, 2], [2, 72, 1], [3, 76, 1],
  [4, 74, 3], [7, 72, 1],
  [8, 69, 2], [10, 72, 1], [11, 77, 1],
  [12, 76, 4],
];
// accordi per battuta (radice, intervalli): Am · F · C · G (minore) · A · F#m · D · E (maggiore)
const CH_MIN = [[9, [0, 3, 7]], [5, [0, 4, 7]], [0, [0, 4, 7]], [7, [0, 4, 7]]];
const CH_MAJ = [[9, [0, 4, 7]], [6, [0, 3, 7]], [2, [0, 4, 7]], [4, [0, 4, 7]]];
const toMajor = (m) => (m % 12 === 0 || m % 12 === 5 ? m + 1 : m);

export default (mix, T) => {
  const film = loadFilm('interstellar');
  const { segments } = timeline(film);
  const segs = Object.fromEntries(segments.map((s) => [s.id, s]));
  /** Inizio assoluto della frase n del capitolo, come subtitleTimes in ChapterOverlay.tsx. */
  const C = (id, n) => {
    const s = segs[id];
    const w = s.testo.map((l) => l.length + 6);
    const tot = w.reduce((a, b) => a + b, 0);
    let cur = 0.15;
    for (let k = 0; k < n; k++) cur += (w[k] / tot) * (s.dur - 0.35);
    return s.start + cur;
  };
  const BODY = 0.8;
  let sid = 0;

  /**
   * Il tema ciclico da `from` a `to` (agganciati alla battuta più vicina della griglia a 72 bpm).
   * passo: 'doppio' = 144 bpm sulla stessa griglia.
   * mel: pianoforte (livello) · keep: probabilità di ogni nota · oct: trasposizione · major: La maggiore
   * pad / org / str: tappeto, organo, archi (livello) · low: bassi un'ottava sotto · pulse: colpi sordi a ogni battuta
   */
  const sec = (from, to, o) => {
    from = snap(from); to = snap(to);
    const beat = (60 / BPM) * (o.passo === 'doppio' ? 0.5 : 1), bar = 4 * beat, loop = 16 * beat;
    const R = rng(9000 + sid++ * 113);
    const chords = o.major ? CH_MAJ : CH_MIN;
    for (let L0 = from; L0 < to - 0.2; L0 += loop) {
      for (let b = 0; b < 4; b++) {
        const t = L0 + b * bar;
        if (t >= to - 0.3) break;
        const left = to - t;
        const [pc, iv] = chords[b];
        const root = 45 + ((pc - 9 + 12) % 12) - (o.low ? 12 : 0);
        const d = Math.min(bar * 1.02, left);
        if (o.pad) iv.concat([12]).forEach((v, j) => pad(mix, root + v + 12, { t, dur: d, vel: o.pad, gain: (BODY * (o.g ?? 1)) * 0.7, pan: (j - 1.5) * 0.3, bright: o.bright ?? 3, seed: j + 1 }));
        if (o.org) iv.forEach((v, j) => organ(mix, root + v, { t, dur: d, vel: o.org, gain: (BODY * (o.g ?? 1)) * 0.8, pan: (j - 1) * 0.3 }));
        if (o.str) iv.concat([12]).forEach((v, j) => strings(mix, root + v + 12, { t: t + j * 0.05, dur: d, vel: o.str, gain: (BODY * (o.g ?? 1)) * 0.7, pan: (j - 1.5) * 0.3, att: o.att ?? 1, seed: j + 3 }));
        if (o.bass) piano(mix, root - 12, { t, dur: bar, vel: o.bass, gain: (BODY * (o.g ?? 1)), pan: -0.15 });
        if (o.pulse) colpo(mix, 'grancassa', o.pulse > 40 ? 'bdrum_p' : 'bdrum_pp', { t, vel: 100, gain: 0.6, rev: 0.35, seed: b });
      }
      if (!o.mel) continue;
      for (const [b, m0, d] of THEME) {
        const t = L0 + b * beat;
        if (t >= to - 0.2 || R() > o.keep) continue;
        const m = (o.major ? toMajor(m0) : m0) + (o.oct ?? 0);
        const dur = Math.min(d * beat * 1.1, to - t);
        piano(mix, m, { t, dur, vel: o.mel * (0.9 + R() * 0.2), gain: (BODY * (o.g ?? 1)) * 1.2, pan: 0.05 });
        if (o.bells) bell(mix, m + 12, { t: t + 0.01, vel: o.bells, gain: (BODY * (o.g ?? 1)), pan: 0.3 });
      }
    }
  };

  // ---- sezioni (tempi dai capitoli del JSON)
  // copertina: tappeto e campanelle, il tema accennato
  sec(OFF - GRID, T.terra, { pad: 40, mel: 44, keep: 0.6, bells: 30 });
  // terra e fantasma: pianoforte intimo, archi leggeri
  sec(T.terra, T.fantasma, { mel: 50, keep: 1, str: 30, bass: 40 });
  sec(T.fantasma, C('fantasma', 2), { mel: 44, keep: 0.6, pad: 30, bass: 36 });
  sec(C('fantasma', 2), T.nasa, { mel: 50, keep: 1, pad: 38, bells: 34, bass: 40 });
  // base segreta: l'organo entra, il piano si allarga
  sec(T.nasa, T.partenza, { mel: 48, keep: 0.9, org: 40, pad: 34, bells: 30 });
  // partenza: commosso, archi pieni, poi il razzo
  sec(T.partenza, C('partenza', 4), { mel: 52, keep: 1, str: 44, bass: 44 });
  sec(C('partenza', 4), T.varco, { org: 50, str: 46, pad: 40, low: true, pulse: 30 });
  // varco: spazio aperto, organo e campanelle, tema in alto
  sec(T.varco, T.onde, { mel: 44, keep: 0.8, oct: 12, org: 44, pad: 38, bells: 34 });
  // onde: tensione crescente, pulsazione sorda, organo grave
  sec(T.onde, C('onde', 3), { passo: 'doppio', org: 46, pad: 40, low: true, pulse: 40, mel: 40, keep: 0.4 });
  sec(C('onde', 3), T.messaggi, { passo: 'doppio', org: 54, str: 46, low: true, pulse: 46 });
  // messaggi: solo pianoforte, intimo e triste
  sec(T.messaggi, T.ghiaccio, { mel: 50, keep: 1, pad: 26, bass: 38 });
  // ghiaccio: freddo, tappeto chiaro, poi tensione e pulsazione
  sec(T.ghiaccio, C('ghiaccio', 2), { pad: 40, bright: 5, mel: 38, keep: 0.5, oct: 12, bells: 30 });
  sec(C('ghiaccio', 2), T.aggancio, { passo: 'doppio', org: 54, str: 50, low: true, pulse: 46, mel: 42, keep: 0.4 });
  // aggancio: organo in crescendo, poi la verità (di nuovo minore e sospeso)
  sec(T.aggancio, C('aggancio', 1), { passo: 'doppio', org: 58, str: 50, pad: 40, pulse: 48 });
  sec(C('aggancio', 1), T.buconero, { mel: 42, keep: 0.6, pad: 34, bass: 36 });
  // buco nero: organo enorme e grave, poi la stanza fuori dal tempo: campanelle e pianoforte sospeso
  sec(T.buconero, C('buconero', 3), { org: 60, pad: 46, low: true, str: 48, pulse: 48, g: 1.5 });
  sec(C('buconero', 3), T.orologio, { mel: 46, keep: 0.8, oct: 12, bells: 40, pad: 34 });
  // orologio: il tema torna e si apre in maggiore
  sec(T.orologio, C('orologio', 2), { mel: 48, keep: 1, pad: 34, bells: 32 });
  sec(C('orologio', 2), T.finale, { mel: 54, keep: 1, major: true, org: 44, str: 46, bells: 36 });

  // finale: accordo di La maggiore ampio
  const F = snap(T.finale); // sulla griglia, dove finisce l'ultima sezione
  [33, 45, 52, 57, 61, 64, 69].forEach((m, j) => organ(mix, m, { t: F, dur: 3.4, vel: 46, gain: BODY * 0.8, pan: (j - 3) * 0.2 }));
  [57, 61, 64, 69].forEach((m, j) => strings(mix, m, { t: F + 0.1, dur: 3.2, vel: 50, gain: BODY * 0.8, pan: (j - 1.5) * 0.3, att: 0.6, seed: 30 + j }));
  [81, 85, 88, 93].forEach((m, j) => bell(mix, m, { t: F + BEAT / 2 + j * (BEAT / 2), vel: 40, pan: -0.3 + j * 0.2 }));

  // ---------------------------------------------------------------- effetti sonori (tempi delle scene)
  /** Tappeto stereo da una registrazione (vento, rombo…). */
  const bed = (id, t0, t1, da, gain, o = {}) => clip(mix, id, { t: t0, da, durata: t1 - t0, gain, fadeIn: 1, fadeOut: 1, largo: 3, rev: 0.12, ...o });
  // terra: vento di polvere e raffica
  bed('vento_leggero', T.terra, T.fantasma + 1, 0.2, 0.12);
  bed('vento_raffiche', T.fantasma - 0.5, T.nasa + 0.5, 9.5, 0.3, { lp: 2500 });
  clip(mix, 'vento_raffiche', { t: C('terra', 1), da: 40, durata: 2.6, gain: 0.3, fadeIn: 0.6, fadeOut: 1, largo: 2 });
  // fantasma: libri che cadono, la polvere che si posa, rivelazione
  [0, BEAT / 2, BEAT].forEach((d, k) => clip(mix, 'legno_cade', { t: C('fantasma', 1) + d + 0.55, durata: 0.6, gain: 0.35 - k * 0.05, rate: 0.9 + k * 0.08, pan: -0.2 + k * 0.2, rev: 0.3 }));
  crescendo(mix, C('fantasma', 3) + 0.3, 1.8, { gain: 0.3 });
  // base segreta: portone dell'hangar a motore, schermo che si accende, varco che appare
  bed('scariche', T.nasa, T.partenza, 7, 0.09, { lp: 5000, pan: -0.4, largo: 0 });
  clip(mix, 'scatti', { t: C('nasa', 1), da: 12.68, durata: 0.15, gain: 0.25, rev: 0.25 });
  crescendo(mix, C('nasa', 2) + 0.4, 1.6, { gain: 0.25 });
  // partenza: porta che sbatte, razzo
  clip(mix, 'porta_sbatte', { t: C('partenza', 1) + 0.55 - 0.5, da: 2.6, durata: 1.0, gain: 0.5, fadeOut: 0.3, rev: 0.3 });
  const tr = C('partenza', 4) - 0.4;
  clip(mix, 'razzo', { t: tr, da: 6, durata: T.varco - tr + 1.4, gain: 0.6, fadeIn: 0.6, fadeOut: 1.4, rev: 0.25 });
  // varco: risucchio e passaggio all'ingresso
  crescendo(mix, C('varco', 3) + 1.1, 2.4, { gain: 0.4 });
  clip(mix, 'passaggio', { t: C('varco', 3) + 1.0 - 0.4, da: 34.3, durata: 2.6, gain: 0.4, fadeOut: 0.6, rev: 0.4 });
  // onde: l'onda che arriva e si schianta, i motori
  crescendo(mix, C('onde', 3), 2.6, { gain: 0.4 });
  clip(mix, 'onde_tonanti', { t: C('onde', 3) - 1.2, da: 5.9, durata: C('onde', 4) - C('onde', 3) + 2.4, gain: 0.45, fadeIn: 0.8, fadeOut: 1, largo: 2.5, rev: 0.2 });
  clip(mix, 'tuono_forte', { t: C('onde', 3) - 0.1, da: 0.9, durata: 3.6, gain: 0.6, fadeIn: 0.03, fadeOut: 1.2, rev: 0.35 });
  clip(mix, 'rombo', { t: C('onde', 4) - 0.2, da: 31, durata: 2.2, gain: 0.5, fadeIn: 0.4, fadeOut: 0.8, largo: 2 });
  // messaggi: lo schermo che si spegne nel rumore
  clip(mix, 'disturbo', { t: C('messaggi', 3) + 0.4, da: 6.5, durata: 1.0, gain: 0.25, fadeIn: 0.05, fadeOut: 0.4, rev: 0.2 });
  // ghiaccio: vento gelido, crepa, decollo, esplosione
  bed('vento_artico', T.ghiaccio, T.aggancio, 20, 0.12);
  clip(mix, 'ghiaccio_frana', { t: C('ghiaccio', 2) + 0.3, da: 0.2, durata: 2.6, gain: 0.3, fadeOut: 1, rev: 0.3 });
  clip(mix, 'rombo', { t: C('ghiaccio', 3) - 0.2, da: 90, durata: 1.8, gain: 0.45, fadeIn: 0.3, fadeOut: 0.8, largo: 2 });
  clip(mix, 'esplosioni', { t: C('ghiaccio', 4) + 0.1 - 0.04, da: 7.96, durata: 2.8, gain: 0.8, fadeIn: 0.05, fadeOut: 1.5, rev: 0.35 });
  // aggancio: colpi metallici dei frammenti, l'aggancio
  [[0.6, 2.9], [1.4, 8.07], [2.0, 12.82]].forEach(([d, da], k) => clip(mix, 'metallo_colpi', { t: T.aggancio + d - 0.01, da, durata: 0.5, gain: 0.4 - k * 0.07, pan: -0.3 + k * 0.3, rev: 0.45 }));
  clip(mix, 'metallo_schianto', { t: C('aggancio', 1) - 0.2 - 0.3, da: 0.05, durata: 1.4, gain: 0.7, fadeOut: 0.5, rev: 0.45 });
  // buco nero: la caduta, il passaggio, il libro che cade
  crescendo(mix, C('buconero', 3), 3.0, { gain: 0.45 });
  swell(mix, C('buconero', 3), 3.0, { vel: 44 });
  clip(mix, 'passaggio', { t: C('buconero', 3) - 0.3 - 0.05, da: 12.27, durata: 2.2, gain: 0.4, fadeOut: 0.6, rev: 0.45 });
  clip(mix, 'legno_cade', { t: C('buconero', 4) + 0.5, durata: 0.6, gain: 0.4, rev: 0.35 });
  // orologio: i bip del Morse in sincronia con la lancetta, poi l'apertura
  const MORSE = [0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1];
  const m0 = snap(T.orologio) + BEAT / 2, mStep = BEAT / 3;
  MORSE.forEach((m, i) => beep(mix, m0 + i * mStep, m ? mStep * 0.6 : mStep * 0.25, { vel: 40 }));
  crescendo(mix, C('orologio', 2) + 0.8, 1.6, { gain: 0.3 });
  clip(mix, 'rombo', { t: C('orologio', 4) + 0.2, da: 120, durata: 2.4, gain: 0.35, fadeIn: 0.5, fadeOut: 1, largo: 2 });
};
