// Colonna sonora originale di Interstellar: pianoforte, archi, tappeti di sintetizzatore e un organo spaziale, discreti
// sotto la voce. Il tema (La minore, 4 battute, poche note che salgono) è inventato qui: intimo alla fattoria, si allarga
// nello spazio, si fa teso sulle onde e sul ghiaccio e si apre in La maggiore nel finale. Niente ticchettii regolari né
// motivi del film. Effetti agganciati agli eventi delle scene in src/scenes/interstellar/.
import { put, rng, drum, thunder, wind, metalThud, glassCrash, doorCreak, whoosh, thud, swell, pop , FX } from './synth.mjs';
import { loadFilm, timeline } from './film.mjs';

const TAU = Math.PI * 2;
const SR = 44100;
const mtof = (m, cents = 0) => 440 * 2 ** ((m - 69 + cents / 100) / 12);
const vamp = (v) => (v / 127) ** 1.6;

// ---------------------------------------------------------------- strumenti locali (via put)

/** Pianoforte morbido: armoniche con decadimento più rapido in alto. */
const piano = (mix, m, { t, dur = 1.5, vel = 60, pan = 0, rev = 0.5, gain = 1 }) => {
  const f = mtof(m);
  const tau = Math.max(0.6, 2.8 - m * 0.02);
  put(mix, t, Math.ceil((Math.min(dur, 4) + 0.6) * SR), (i) => {
    const x = i / SR;
    let s = 0;
    for (let h = 1; h <= 5; h++) s += Math.sin(TAU * f * h * Math.sqrt(1 + 0.0004 * h * h) * x) * Math.exp(-x / (tau / (0.6 + h * 0.5))) / h ** 1.2;
    const env = Math.min(1, x / 0.004) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / 0.5));
    return s * env;
  }, { gain: gain * vamp(vel) * 0.55, pan, rev });
};

/** Tappeto di sintetizzatore: due seghe scordate, filtro che si apre lentamente, attacco e rilascio lunghi. */
const pad = (mix, m, { t, dur, vel = 40, pan = 0, rev = 0.7, gain = 1, bright = 3, att = 1.5, seed = 1 }) => {
  const f = mtof(m);
  const r = rng(seed * 131 + Math.round(t * 100) + m);
  const ph = [r(), r(), r()];
  const dets = [-8, 0, 7].map((c) => f * 2 ** (c / 1200));
  let lp = 0;
  const rel = 2;
  put(mix, t, Math.ceil((dur + rel) * SR), (i) => {
    const x = i / SR;
    const open = 1 - Math.exp((-TAU * f * (bright * (0.6 + 0.4 * Math.sin(TAU * 0.08 * x)))) / SR);
    let s = 0;
    for (let k = 0; k < 3; k++) s += 2 * ((ph[k] + dets[k] * x) % 1) - 1;
    lp += open * (s / 3 - lp);
    const env = Math.min(1, x / att) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / rel));
    return lp * env;
  }, { gain: gain * vamp(vel), pan, rev });
};

/** Organo spaziale: registri a sinusoidi con un'ottava sotto, lieve battimento. */
const organ = (mix, m, { t, dur, vel = 40, pan = 0, rev = 0.75, gain = 1 }) => {
  const f = mtof(m);
  const rel = 1.2;
  put(mix, t, Math.ceil((dur + rel) * SR), (i) => {
    const x = i / SR;
    const s = 0.7 * Math.sin(TAU * 0.5 * f * x) + Math.sin(TAU * f * x) + 0.5 * Math.sin(TAU * 2.003 * f * x) + 0.25 * Math.sin(TAU * 3 * f * x) + 0.15 * Math.sin(TAU * 4.01 * f * x);
    const env = Math.min(1, x / 0.6) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / rel));
    return s * env * 0.35;
  }, { gain: gain * vamp(vel), pan, rev });
};

/** Archi: tre seghe scordate con vibrato e attacco lento. */
const strings = (mix, m, { t, dur, vel = 40, pan = 0, rev = 0.6, gain = 1, att = 1.0, seed = 1 }) => {
  const f = mtof(m);
  const r = rng(seed * 977 + Math.round(t * 1000) + m);
  const dets = [-6, 0, 6].map((c) => f * 2 ** (c / 1200));
  const ph = dets.map(() => r());
  const a = 1 - Math.exp((-TAU * f * 3.2) / SR);
  let lp = 0;
  const rel = 1.4;
  put(mix, t, Math.ceil((dur + rel) * SR), (i) => {
    const x = i / SR;
    const vib = 1 + 0.003 * Math.sin(TAU * 5 * x) * Math.min(1, x / 1.5);
    let s = 0;
    for (let k = 0; k < 3; k++) s += 2 * ((ph[k] + dets[k] * vib * x) % 1) - 1;
    lp += a * (s / 3 - lp);
    const env = Math.min(1, x / att) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / rel));
    return lp * env;
  }, { gain: gain * vamp(vel), pan, rev });
};

/** Campanella cristallina: parziali inarmoniche, decadimento lungo. */
const bell = (mix, m, { t, vel = 46, pan = 0, gain = 1 }) => {
  const f = mtof(m);
  put(mix, t, Math.ceil(3 * SR), (i) => {
    const x = i / SR;
    return (Math.sin(TAU * f * x) * Math.exp(-x / 1.4) + 0.4 * Math.sin(TAU * 2.76 * f * x) * Math.exp(-x / 0.6) + 0.2 * Math.sin(TAU * 5.4 * f * x) * Math.exp(-x / 0.25)) * Math.min(1, x / 0.002);
  }, { gain: gain * vamp(vel) * 0.45, pan, rev: 0.75 });
};

/** Rombo grave (razzo, motori): rumore marrone filtrato con salita e discesa. */
const rumble = (mix, t0, dur, { vel = 50, seed = 3 } = {}) => {
  const r = rng(seed);
  let b = 0, lp = 0;
  put(mix, t0, Math.ceil(dur * SR), (i) => {
    const u = i / (dur * SR);
    b = 0.99 * b + 0.05 * (r() * 2 - 1);
    lp += 0.05 * (b - lp);
    return lp * 6 * Math.sin(Math.PI * Math.min(1, u * 1.4)) ** 0.8;
  }, { gain: FX * vamp(vel), rev: 0.3 });
};

/** Bip di Morse: sinusoide breve e pulita. */
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
   * Il tema ciclico da `from` a `to`.
   * mel: pianoforte (livello) · keep: probabilità di ogni nota · oct: trasposizione · major: La maggiore
   * pad / org / str: tappeto, organo, archi (livello) · low: bassi un'ottava sotto · pulse: colpi sordi a ogni battuta
   */
  const sec = (from, to, o) => {
    const beat = 60 / o.bpm, bar = 4 * beat, loop = 16 * beat;
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
        if (o.pad) iv.concat([12]).forEach((v, j) => pad(mix, root + v + 12, { t, dur: d, vel: o.pad, gain: BODY * 0.7, pan: (j - 1.5) * 0.3, bright: o.bright ?? 3, seed: j + 1 }));
        if (o.org) iv.forEach((v, j) => organ(mix, root + v, { t, dur: d, vel: o.org, gain: BODY * 0.8, pan: (j - 1) * 0.3 }));
        if (o.str) iv.concat([12]).forEach((v, j) => strings(mix, root + v + 12, { t: t + j * 0.05, dur: d, vel: o.str, gain: BODY * 0.7, pan: (j - 1.5) * 0.3, att: o.att ?? 1, seed: j + 3 }));
        if (o.bass) piano(mix, root - 12, { t, dur: bar, vel: o.bass, gain: BODY, pan: -0.15 });
        if (o.pulse) drum(mix, 'softkick', t, o.pulse, 7);
      }
      if (!o.mel) continue;
      for (const [b, m0, d] of THEME) {
        const t = L0 + b * beat;
        if (t >= to - 0.2 || R() > o.keep) continue;
        const m = (o.major ? toMajor(m0) : m0) + (o.oct ?? 0);
        const dur = Math.min(d * beat * 1.1, to - t);
        piano(mix, m, { t, dur, vel: o.mel * (0.9 + R() * 0.2), gain: BODY * 1.2, pan: 0.05 });
        if (o.bells) bell(mix, m + 12, { t: t + 0.01, vel: o.bells, gain: BODY, pan: 0.3 });
      }
    }
  };

  // ---- sezioni (tempi dai capitoli del JSON)
  // copertina: tappeto e campanelle, il tema accennato
  sec(0, T.terra, { bpm: 70, pad: 40, mel: 44, keep: 0.6, bells: 30 });
  // terra e fantasma: pianoforte intimo, archi leggeri
  sec(T.terra, T.fantasma, { bpm: 72, mel: 50, keep: 1, str: 30, bass: 40 });
  sec(T.fantasma, C('fantasma', 2), { bpm: 72, mel: 44, keep: 0.6, pad: 30, bass: 36 });
  sec(C('fantasma', 2), T.nasa, { bpm: 84, mel: 50, keep: 1, pad: 38, bells: 34, bass: 40 });
  // base segreta: l'organo entra, il piano si allarga
  sec(T.nasa, T.partenza, { bpm: 76, mel: 48, keep: 0.9, org: 40, pad: 34, bells: 30 });
  // partenza: commosso, archi pieni, poi il razzo
  sec(T.partenza, C('partenza', 4), { bpm: 66, mel: 52, keep: 1, str: 44, bass: 44 });
  sec(C('partenza', 4), T.varco, { bpm: 80, org: 50, str: 46, pad: 40, low: true, pulse: 30 });
  // varco: spazio aperto, organo e campanelle, tema in alto
  sec(T.varco, T.onde, { bpm: 64, mel: 44, keep: 0.8, oct: 12, org: 44, pad: 38, bells: 34 });
  // onde: tensione crescente, pulsazione sorda, organo grave
  sec(T.onde, C('onde', 3), { bpm: 92, org: 46, pad: 40, low: true, pulse: 40, mel: 40, keep: 0.4 });
  sec(C('onde', 3), T.messaggi, { bpm: 96, org: 54, str: 46, low: true, pulse: 46 });
  // messaggi: solo pianoforte, intimo e triste
  sec(T.messaggi, T.ghiaccio, { bpm: 60, mel: 50, keep: 1, pad: 26, bass: 38 });
  // ghiaccio: freddo, tappeto chiaro, poi tensione e pulsazione
  sec(T.ghiaccio, C('ghiaccio', 2), { bpm: 70, pad: 40, bright: 5, mel: 38, keep: 0.5, oct: 12, bells: 30 });
  sec(C('ghiaccio', 2), T.aggancio, { bpm: 100, org: 50, str: 44, low: true, pulse: 44, mel: 38, keep: 0.4 });
  // aggancio: organo in crescendo, poi la verità (di nuovo minore e sospeso)
  sec(T.aggancio, C('aggancio', 1), { bpm: 108, org: 58, str: 50, pad: 40, pulse: 48 });
  sec(C('aggancio', 1), T.buconero, { bpm: 64, mel: 42, keep: 0.6, pad: 34, bass: 36 });
  // buco nero: organo enorme e grave, poi la stanza fuori dal tempo: campanelle e pianoforte sospeso
  sec(T.buconero, C('buconero', 3), { bpm: 70, org: 58, pad: 46, low: true, str: 44 });
  sec(C('buconero', 3), T.orologio, { bpm: 60, mel: 46, keep: 0.8, oct: 12, bells: 40, pad: 34 });
  // orologio: il tema torna e si apre in maggiore
  sec(T.orologio, C('orologio', 2), { bpm: 72, mel: 48, keep: 1, pad: 34, bells: 32 });
  sec(C('orologio', 2), T.finale, { bpm: 76, mel: 54, keep: 1, major: true, org: 44, str: 46, bells: 36 });

  // finale: accordo di La maggiore ampio
  const F = T.finale;
  [33, 45, 52, 57, 61, 64, 69].forEach((m, j) => organ(mix, m, { t: F, dur: 3.4, vel: 46, gain: BODY * 0.8, pan: (j - 3) * 0.2 }));
  [57, 61, 64, 69].forEach((m, j) => strings(mix, m, { t: F + 0.1, dur: 3.2, vel: 50, gain: BODY * 0.8, pan: (j - 1.5) * 0.3, att: 0.6, seed: 30 + j }));
  [81, 85, 88, 93].forEach((m, j) => bell(mix, m, { t: F + 0.4 + j * 0.35, vel: 40, pan: -0.3 + j * 0.2 }));

  // ---------------------------------------------------------------- effetti sonori (tempi delle scene)
  // terra: vento di polvere e raffica
  wind(mix, T.terra, T.nasa, { power: 0.3, fade: 1.2, center: 450, seed: 13 });
  whoosh(mix, C('terra', 1), 2.2, { vel: 46, lo: 300, hi: 1600 });
  // fantasma: libri che cadono, la polvere che si posa, rivelazione
  [0, 0.35, 0.7].forEach((d) => thud(mix, C('fantasma', 1) + d + 0.55, 46, { bright: 1400 }));
  swell(mix, C('fantasma', 3) + 0.3, 1.8, { vel: 40 });
  // base segreta: porta dell'hangar, schermo che si accende, varco che appare
  doorCreak(mix, T.nasa + 0.2, 1.6, { vel: 36 });
  pop(mix, C('nasa', 1), 40, { pitch: 7 });
  swell(mix, C('nasa', 2) + 0.4, 1.6, { vel: 36 });
  // partenza: porta che sbatte, razzo
  thud(mix, C('partenza', 1) + 0.55, 66);
  rumble(mix, C('partenza', 4) - 0.4, T.varco - C('partenza', 4) + 1.4, { vel: 64 });
  // varco: risucchio e lampo all'ingresso
  swell(mix, C('varco', 3) + 1.1, 2.4, { vel: 56 });
  whoosh(mix, C('varco', 3) + 1.0, 1.4, { vel: 50, lo: 200, hi: 3000 });
  // onde: l'onda che arriva, lo schianto, i motori
  swell(mix, C('onde', 3), 2.6, { vel: 58 });
  thunder(mix, C('onde', 3) - 0.1, 0.9, 7);
  wind(mix, C('onde', 3), C('onde', 4) + 0.6, { power: 0.5, fade: 0.6, center: 700, seed: 15 });
  rumble(mix, C('onde', 4) - 0.2, 2.2, { vel: 50, seed: 5 });
  // messaggi: lo schermo che si spegne nel rumore
  whoosh(mix, C('messaggi', 3) + 0.4, 1.0, { vel: 34, lo: 2000, hi: 6000 });
  // ghiaccio: vento gelido, crepa, decollo, esplosione
  wind(mix, T.ghiaccio, T.aggancio, { power: 0.4, fade: 1, center: 900, seed: 21 });
  glassCrash(mix, C('ghiaccio', 2) + 0.3, 52, 41);
  rumble(mix, C('ghiaccio', 3) - 0.2, 1.8, { vel: 46, seed: 9 });
  thunder(mix, C('ghiaccio', 4) + 0.1, 1, 11);
  // aggancio: colpi metallici dei frammenti, l'aggancio
  [0.6, 1.4, 2.0].forEach((d, k) => metalThud(mix, T.aggancio + d, 44 - k * 4));
  metalThud(mix, C('aggancio', 1) - 0.2, 70);
  // buco nero: la caduta, il passaggio, il libro che cade
  swell(mix, C('buconero', 3), 3.0, { vel: 60 });
  whoosh(mix, C('buconero', 3) - 0.3, 1.2, { vel: 50, lo: 150, hi: 2000 });
  thud(mix, C('buconero', 4) + 0.5, 50, { bright: 1400 });
  // orologio: i bip del Morse in sincronia con la lancetta, poi l'apertura
  const MORSE = [0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1];
  const m0 = T.orologio + 0.4, mStep = (C('orologio', 1) + 0.6 - 0.4 - T.orologio) / MORSE.length;
  MORSE.forEach((m, i) => beep(mix, m0 + i * mStep, m ? mStep * 0.6 : mStep * 0.25, { vel: 40 }));
  swell(mix, C('orologio', 2) + 0.8, 1.6, { vel: 44 });
  rumble(mix, C('orologio', 4) + 0.2, 2.4, { vel: 40, seed: 11 });
};
