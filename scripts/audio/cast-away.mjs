// Colonna sonora originale di Cast Away: pianoforte, archi e tamburi leggeri, discreta sotto la voce.
// All'inizio il ticchettio dell'orologio e un ostinato di pianoforte che corre; poi la tempesta; sull'isola quasi
// silenzio (solo onde e vento); un tema caldo nasce quando parte la zattera, si fa triste con Wilson perso in mare
// e sotto la pioggia di Memphis, e si apre al bivio finale. Tema inventato qui, nessun brano o tema del film.
// Effetti agganciati agli eventi delle scene in src/scenes/cast-away/ (tempi delle frasi come in ChapterOverlay).
import { put, rng, drum, note, thunder, wind, whoosh, thud, pop, crackle, rainHiss, doorCreak } from './synth.mjs';
import { loadFilm, timeline } from './film.mjs';

const TAU = Math.PI * 2;
const SR = 44100;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const vamp = (v) => (v / 127) ** 1.6;

// ---------------------------------------------------------------- strumenti locali (via put)

/** Pianoforte: armoniche con decadimento più rapido in alto, martelletto morbido. */
const piano = (mix, m, { t, dur = 1.5, vel = 60, pan = 0, rev = 0.4, gain = 1 }) => {
  const f = mtof(m);
  const tau = Math.max(0.5, 2.6 - m * 0.02) * Math.min(1.4, 0.6 + dur * 0.4);
  put(mix, t, Math.ceil((Math.min(dur, 4) + 0.5) * SR), (i) => {
    const x = i / SR;
    let s = 0;
    for (let h = 1; h <= 6; h++) s += Math.sin(TAU * f * h * Math.sqrt(1 + 0.0004 * h * h) * x) * Math.exp(-x / (tau / (0.6 + h * 0.5))) / h ** 1.15;
    const hammer = Math.sin(TAU * f * 3 * x) * Math.exp(-x / 0.012) * 0.3;
    return (s + hammer) * Math.min(1, x / 0.003) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / 0.35));
  }, { gain: gain * vamp(vel) * 0.55, pan, rev });
};

/** Archi: tre seghe scordate, passa-basso, attacco lento e vibrato. */
const strings = (mix, m, { t, dur, vel = 40, pan = 0, rev = 0.6, gain = 1, att = 1, seed = 1 }) => {
  const f = mtof(m);
  const r = rng(seed * 977 + Math.round(t * 1000) + m);
  const dets = [-6, 0, 6].map((c) => f * 2 ** (c / 1200));
  const ph = dets.map(() => r());
  const a = 1 - Math.exp((-TAU * f * 3.2) / SR);
  let lp = 0;
  put(mix, t, Math.ceil((dur + 1.2) * SR), (i) => {
    const x = i / SR;
    const vib = 1 + 0.003 * Math.sin(TAU * 5.1 * x) * Math.min(1, x / 1.5);
    let s = 0;
    for (let k = 0; k < 3; k++) s += 2 * ((ph[k] + dets[k] * vib * x) % 1) - 1;
    lp += a * (s / 3 - lp);
    return lp * Math.min(1, x / att) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / 1.2));
  }, { gain: gain * vamp(vel), pan, rev });
};

/** Risacca: rumore filtrato che sale e scende come un'onda sulla spiaggia. */
const surf = (mix, t0, t1, { power = 1, period = 5.5, seed = 83 } = {}) => {
  const r = rng(seed + Math.round(t0 * 1000));
  const dur = t1 - t0;
  let lp = 0, lp2 = 0;
  put(mix, t0, Math.ceil(dur * SR), (i) => {
    const x = i / SR;
    const ph = (x / period) % 1;
    const swell = Math.sin(Math.PI * Math.min(1, ph * 1.6)) ** 2;
    const n = r() * 2 - 1;
    lp += (0.08 + 0.12 * swell) * (n - lp);
    lp2 += 0.02 * (lp - lp2);
    const env = Math.min(1, x / 1.5, (dur - x) / 1.5);
    return (lp - lp2 * 0.5) * (0.25 + 0.75 * swell) * env;
  }, { gain: 0.9 * power, pan: 0, rev: 0.3 });
};

/** Sirena di nave lontana: due note gravi sovrapposte con attacco morbido. */
const horn = (mix, t, dur = 2.2, vel = 50) => {
  put(mix, t, Math.ceil((dur + 0.6) * SR), (i) => {
    const x = i / SR;
    const env = Math.min(1, x / 0.25) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / 0.6));
    let s = 0;
    for (const f of [98, 123.5]) for (let h = 1; h <= 5; h++) s += Math.sin(TAU * f * h * x) / (h * 1.4);
    return s * env * 0.25;
  }, { gain: vamp(vel), pan: -0.4, rev: 0.7 });
};

// ---------------------------------------------------------------- materiale musicale

// Tema (8 tempi, Re maggiore): [tempo, nota MIDI, durata in tempi]
const THEME = [[0, 66, 1], [1, 69, 1], [2, 74, 2], [4, 73, 1], [5, 71, 1], [6, 69, 2],
  [8, 66, 1], [9, 64, 1], [10, 62, 1.5], [11.5, 64, 0.5], [12, 66, 3]];
// accordi per battuta (4 tempi): Re, Si minore, Sol, La
const CH_MAJ = [[50, 54, 57], [47, 50, 54], [43, 47, 50], [45, 49, 52]];
const CH_MIN = [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]];

export default (mix, T) => {
  const { segments } = timeline(loadFilm('cast-away'));
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
  const BODY = 0.8;

  /** Tema con accordi da `from` a `to`; minor per la versione triste, big per l'apertura finale. */
  const theme = (from, to, { bpm = 72, vel = 52, str = 36, minor = false, big = false, keep = 1, seed = 1 } = {}) => {
    const beat = 60 / bpm, loop = 16 * beat;
    const R = rng(7000 + seed);
    const chords = minor ? CH_MIN : CH_MAJ;
    for (let L = from; L < to - 0.3; L += loop) {
      for (let b = 0; b < 4; b++) {
        const t = L + b * 4 * beat;
        if (t >= to - 0.4) break;
        const d = Math.min(4 * beat * 1.05, to - t);
        piano(mix, chords[b][0] - 12, { t, dur: beat * 3, vel: vel * 0.8, gain: BODY, pan: -0.2 });
        chords[b].forEach((m, j) => strings(mix, m + 12, { t: t + j * 0.05, dur: d, vel: str, gain: BODY * 0.8, pan: (j - 1) * 0.35, seed: j + seed }));
        if (big) strings(mix, chords[b][0] - 12, { t, dur: d, vel: str * 0.9, gain: BODY * 0.8, seed: 9 });
      }
      for (const [b, m0, d] of THEME) {
        const t = L + b * beat;
        if (t >= to - 0.2 || R() > keep) continue;
        const m = minor && (m0 % 12 === 6 || m0 % 12 === 11) ? m0 - 1 : m0;
        piano(mix, m + 12, { t, dur: Math.min(d * beat * 1.1, to - t), vel: vel * (0.9 + R() * 0.2), gain: BODY * 1.2, pan: 0.1 });
        if (big) piano(mix, m, { t, dur: Math.min(d * beat * 1.1, to - t), vel: vel * 0.7, gain: BODY, pan: -0.1 });
      }
    }
  };

  // ---- copertina: accordo sospeso e risacca
  [50, 57, 62, 66, 69].forEach((m, j) => piano(mix, m, { t: 0.2 + j * 0.12, dur: 3.2, vel: 44, gain: BODY, pan: -0.3 + j * 0.15, rev: 0.6 }));
  surf(mix, 0, T.tempo + 0.8, { power: 0.5 });

  // ---- tempo: ticchettio a ogni secondo (la lancetta scatta sugli interi in Tempo.tsx) e ostinato che corre
  for (let s = 1; s < 10; s++) drum(mix, 'sidestick', T.tempo + s, 40 + (s > 4 ? 8 : 0), s);
  const ost = [62, 65, 69, 65, 62, 64, 67, 64];
  for (let t = T.tempo + 0.2, k = 0; t < T.promessa - 0.3; t += 60 / 132 / 2, k++) {
    piano(mix, ost[k % 8], { t, dur: 0.22, vel: 40 + (t > cue('tempo', 2) ? 8 : 0), gain: BODY, pan: 0.2, rev: 0.25 });
  }
  [38, 41, 45].forEach((m, j) => strings(mix, m + 12, { t: T.tempo, dur: 9.6, vel: 30, gain: BODY * 0.7, pan: (j - 1) * 0.3, seed: j }));

  // ---- promessa: il tema nasce piano, dolce, con un tocco di vibrafono quando si apre l'orologio
  theme(T.promessa, T.schianto, { bpm: 66, vel: 46, str: 30, keep: 0.85, seed: 2 });
  [86, 90, 93].forEach((m, j) => note(mix, 'vibes', mtof(m), { t: cue('promessa', 1) + 0.3 + j * 0.12, dur: 1.8, vel: 40, pan: -0.3 + j * 0.3, rev: 0.6, gain: 0.5 }));
  pop(mix, cue('promessa', 2) + 0.1, 40, { pitch: 3 });

  // ---- schianto: tempesta, motore che cede, impatto; poi il gommone che si gonfia
  const IMPACT = cue('schianto', 2) + 0.9;
  wind(mix, T.schianto, T.isola - 0.5, { power: 0.32, center: 420, seed: 21 });
  rainHiss(mix, T.schianto, T.isola - 0.3, { power: 0.2 });
  [38, 39, 45].forEach((m, j) => strings(mix, m, { t: T.schianto, dur: IMPACT - T.schianto, vel: 32, gain: BODY * 0.8, att: 2, pan: (j - 1) * 0.4, seed: 30 + j }));
  thunder(mix, cue('schianto', 1) + 0.4, 0.45, 5); // lampi di Schianto.tsx
  whoosh(mix, IMPACT - 1.6, 1.6, { vel: 58, lo: 200, hi: 1600 });
  thud(mix, IMPACT, 64, { bright: 500 });
  thunder(mix, IMPACT - 0.05, 0.35, 9);
  whoosh(mix, cue('schianto', 3), 0.9, { vel: 44, lo: 600, hi: 3000, pan: 0.2 }); // il gommone si gonfia

  // ---- isola: quasi silenzio, solo risacca, vento leggero e un'onda grande sulla barriera
  surf(mix, T.isola, T.fuoco, { power: 0.8 });
  wind(mix, T.isola, T.anni, { power: 0.18, center: 700, seed: 41 });
  whoosh(mix, cue('isola', 3) + 0.3, 1.6, { vel: 46, lo: 150, hi: 900 });
  piano(mix, 62, { t: cue('isola', 2), dur: 3, vel: 34, gain: BODY, rev: 0.7 });

  // ---- pacchi: un pacco che arriva, gli oggetti che escono a uno a uno, il pacco con le ali
  [0, 1, 2].forEach((i) => pop(mix, cue('pacchi', 2) + i * 0.45 + 0.1, 46, { pitch: i * 2, pan: -0.3 + i * 0.3 }));
  [74, 78, 81, 86].forEach((m, j) => note(mix, 'vibes', mtof(m), { t: cue('pacchi', 3) + 0.2 + j * 0.15, dur: 2, vel: 38, pan: 0.3, rev: 0.6, gain: 0.5 }));

  // ---- fuoco: sfregamenti, il pallone lanciato, la fiamma che prende
  for (let t = T.fuoco + 0.4; t < cue('fuoco', 1); t += 0.32) whoosh(mix, t, 0.18, { vel: 24, lo: 1400, hi: 3200, seed: Math.round(t * 10) });
  thud(mix, cue('fuoco', 1) + 2, 50, { bright: 900 });
  piano(mix, 57, { t: cue('fuoco', 2) + 0.4, dur: 2.5, vel: 36, gain: BODY, rev: 0.6 });
  piano(mix, 62, { t: cue('fuoco', 2) + 1.0, dur: 2.5, vel: 34, gain: BODY, rev: 0.6 });
  whoosh(mix, cue('fuoco', 4) + 0.2, 1.2, { vel: 60, lo: 200, hi: 1800 });
  crackle(mix, cue('fuoco', 4) + 0.3, T.anni + 0.5, { vel: 46 });
  [50, 57, 62, 66].forEach((m, j) => strings(mix, m, { t: cue('fuoco', 4) + 0.3, dur: T.anni - cue('fuoco', 4), vel: 34, gain: BODY * 0.8, pan: (j - 1.5) * 0.3, seed: 50 + j }));

  // ---- anni: grotta, fuoco basso, pianoforte solitario; si scalda quando sogna di tornare
  crackle(mix, T.anni, T.vela - 0.5, { vel: 32, seed: 39 });
  surf(mix, T.anni, T.vela, { power: 0.3, period: 7 });
  theme(T.anni, cue('anni', 3), { bpm: 58, vel: 38, str: 0.01, keep: 0.55, minor: true, seed: 3 });
  theme(cue('anni', 3), T.vela, { bpm: 62, vel: 42, str: 26, keep: 0.8, seed: 4 });

  // ---- vela: il tema caldo parte con la zattera, cresce quando lascia l'isola
  surf(mix, T.vela, T.wilson, { power: 0.6 });
  wind(mix, cue('vela', 3), T.wilson, { power: 0.3, center: 650, seed: 61 });
  theme(T.vela + 0.3, cue('vela', 4), { bpm: 76, vel: 46, str: 30, keep: 0.9, seed: 5 });
  theme(cue('vela', 4), T.wilson, { bpm: 76, vel: 56, str: 44, big: true, seed: 6 });
  for (let t = cue('vela', 4); t < T.wilson - 0.3; t += 60 / 76) drum(mix, 'softkick', t, 34, 3);
  whoosh(mix, cue('vela', 4) + 0.55 * (T.wilson - cue('vela', 4)), 1.2, { vel: 50, lo: 300, hi: 2600 }); // l'onda della barriera

  // ---- wilson: il tema in minore, archi, la corda lasciata; la sirena di una nave
  surf(mix, T.wilson, T.ritorno, { power: 0.35, period: 7 });
  theme(T.wilson, cue('wilson', 5), { bpm: 60, vel: 44, str: 40, minor: true, keep: 0.9, seed: 7 });
  pop(mix, cue('wilson', 1) + 0.6, 34, { pitch: -4 }); // il pallone scivola in acqua
  theme(cue('wilson', 5), T.ritorno, { bpm: 66, vel: 44, str: 34, keep: 0.7, seed: 8 });
  horn(mix, cue('wilson', 5) + 0.4, 2.4, 46);

  // ---- ritorno: pioggia, tema minore lento; la porta che si chiude, l'auto che parte
  rainHiss(mix, T.ritorno, T.bivio - 0.2, { power: 0.16 });
  theme(T.ritorno, T.bivio, { bpm: 56, vel: 40, str: 32, minor: true, keep: 0.75, seed: 9 });
  doorCreak(mix, cue('ritorno', 3) + 0.2, 1.2, { vel: 40 });
  thud(mix, cue('ritorno', 3) + 1.4, 46, { bright: 700 });
  whoosh(mix, cue('ritorno', 4) + 0.3, 2.4, { vel: 40, lo: 120, hi: 600 }); // motore che si allontana

  // ---- bivio: il tema si apre, pieno e luminoso, con vento caldo nella pianura
  wind(mix, T.bivio, T.finale + 2, { power: 0.2, center: 800, seed: 71 });
  theme(T.bivio, cue('bivio', 2), { bpm: 70, vel: 46, str: 36, seed: 10 });
  theme(cue('bivio', 2), T.finale, { bpm: 70, vel: 56, str: 48, big: true, seed: 11 });
  [74, 78, 81, 86, 90].forEach((m, j) => note(mix, 'vibes', mtof(m), { t: cue('bivio', 3) + 0.1 + j * 0.12, dur: 2.4, vel: 40, pan: -0.4 + j * 0.2, rev: 0.6, gain: 0.5 }));

  // ---- finale: accordo di Re maggiore ampio che si scioglie
  const F = T.finale;
  [38, 45, 50, 54, 57, 62, 66, 69].forEach((m, j) => piano(mix, m, { t: F + j * 0.06, dur: 3.2, vel: 50, gain: BODY * 1.1, pan: -0.3 + j * 0.09, rev: 0.6 }));
  [50, 57, 62, 66, 69].forEach((m, j) => strings(mix, m, { t: F, dur: 3, vel: 52, gain: BODY * 0.85, pan: (j - 2) * 0.3, att: 0.4, seed: 90 + j }));
};
