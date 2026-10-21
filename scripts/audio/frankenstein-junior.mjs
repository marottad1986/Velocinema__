// Colonna sonora originale di Frankenstein Junior: valzer gotico per violino solo in Re minore (il "violino che
// calma la Creatura"), organo da castello, pizzicati in tre tempi, timpani per i temporali e un breve intermezzo
// swing con tip tap per lo spettacolo. Tema e armonie inventati qui; nessun brano o tema del film.
// Nel lieto fine il valzer passa in Re maggiore. Effetti agganciati agli eventi delle scene in src/scenes/frankenstein-junior/.
import { put, rng, drum, thunder, wind, metalThud, glassCrash, rainHiss, doorCreak, hollowBonk, applause, chalk, whoosh, thud, pop, crackle, swell } from './synth.mjs';
import { loadFilm, timeline } from './film.mjs';

const TAU = Math.PI * 2;
const SR = 44100;
const mtof = (m, cents = 0) => 440 * 2 ** ((m - 69 + cents / 100) / 12);
const vamp = (v) => (v / 127) ** 1.6;

// ---------------------------------------------------------------- strumenti locali (via put)

/** Violino: dente di sega filtrato, vibrato che entra dopo l'attacco, un filo di rumore d'arco. */
const violin = (mix, m, { t, dur, vel = 60, pan = 0.15, rev = 0.45, gain = 1, seed = 1, slide = 0 }) => {
  const r = rng(seed * 733 + Math.round(t * 1000) + m);
  const f = mtof(m);
  const att = Math.min(0.12, dur * 0.3), rel = 0.25;
  const a = 1 - Math.exp((-TAU * 3200) / SR);
  let ph = r(), lp = 0, lp2 = 0, nz = 0;
  put(mix, t, Math.ceil((dur + rel) * SR), (i) => {
    const x = i / SR;
    const vib = 1 + 0.006 * Math.sin(TAU * 5.6 * x) * Math.min(1, Math.max(0, (x - 0.15) / 0.3));
    const gl = slide ? 2 ** ((slide * Math.max(0, 1 - x / 0.12)) / 12) : 1;
    ph = (ph + (f * vib * gl) / SR) % 1;
    const saw = 2 * ph - 1;
    lp += a * (saw - lp);
    lp2 += a * (lp - lp2);
    nz += 0.2 * ((r() * 2 - 1) - nz);
    const env = Math.min(1, x / att) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / rel)) * (0.85 + 0.15 * Math.sin(TAU * 0.8 * x));
    return (lp2 * 1.4 + nz * 0.04) * env;
  }, { gain: gain * vamp(vel) * 0.7, pan, rev });
};

/** Organo da castello: registri a sinusoidi (8', 4', 2 2/3', 2'), lieve tremolo. */
const organ = (mix, m, { t, dur, vel = 40, pan = 0, rev = 0.6, gain = 1 }) => {
  const f = mtof(m);
  const rel = 0.6;
  put(mix, t, Math.ceil((dur + rel) * SR), (i) => {
    const x = i / SR;
    const s = Math.sin(TAU * f * x) + 0.5 * Math.sin(TAU * 2 * f * x) + 0.25 * Math.sin(TAU * 3 * f * x) + 0.18 * Math.sin(TAU * 4 * f * x) + 0.6 * Math.sin(TAU * 0.5 * f * x);
    const env = Math.min(1, x / 0.08) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / rel));
    return s * env * (1 + 0.06 * Math.sin(TAU * 6 * x)) * 0.4;
  }, { gain: gain * vamp(vel), pan, rev });
};

/** Pizzicato: corda pizzicata breve con corpo legnoso. */
const pizz = (mix, m, { t, vel = 50, pan = 0, gain = 1 }) => {
  const f = mtof(m);
  put(mix, t, Math.ceil(0.5 * SR), (i) => {
    const x = i / SR;
    const s = Math.sin(TAU * f * x) + 0.4 * Math.sin(TAU * 2 * f * x) * Math.exp(-x / 0.05) + 0.2 * Math.sin(TAU * 3 * f * x) * Math.exp(-x / 0.03);
    return s * Math.min(1, x / 0.002) * Math.exp(-x / 0.16);
  }, { gain: gain * vamp(vel) * 0.6, pan, rev: 0.35 });
};

/** Timpano: sinusoide con leggera discesa di tono e colpo di pelle. */
const timp = (mix, m, { t, vel = 60, gain = 1 }) => {
  const f = mtof(m);
  const r = rng(Math.round(t * 1000) + m);
  let lp = 0;
  put(mix, t, Math.ceil(1.6 * SR), (i) => {
    const x = i / SR;
    lp += 0.05 * ((r() * 2 - 1) - lp);
    const body = Math.sin(TAU * f * x * (1 + 0.04 * Math.exp(-x / 0.05))) + 0.35 * Math.sin(TAU * 1.5 * f * x) * Math.exp(-x / 0.3);
    return (body * Math.exp(-x / 0.6) + lp * 3 * Math.exp(-x / 0.03)) * Math.min(1, x / 0.003);
  }, { gain: gain * vamp(vel) * 0.9, rev: 0.4 });
};

/** Ululato del lupo: sinusoide che sale, tiene e scende, con vibrato. */
const howl = (mix, t, { vel = 50, dur = 2.6 } = {}) => {
  let ph = 0;
  put(mix, t, Math.ceil(dur * SR), (i) => {
    const u = i / (dur * SR);
    const f = 380 + 260 * Math.sin(Math.PI * Math.min(1, u * 1.6)) ** 0.7 - 160 * Math.max(0, u - 0.6) + 8 * Math.sin(TAU * 5 * u * dur);
    ph = (ph + f / SR) % 1;
    return (Math.sin(TAU * ph) + 0.2 * Math.sin(TAU * 2 * ph)) * Math.sin(Math.PI * u) ** 0.8;
  }, { gain: vamp(vel) * 0.45, pan: 0.4, rev: 0.8 });
};

/** Nitrito: tono nasale con vibrato rapido e discesa. */
const neigh = (mix, t, { vel = 50, dur = 1.1, pan = 0.5 } = {}) => {
  let ph = 0;
  put(mix, t, Math.ceil(dur * SR), (i) => {
    const u = i / (dur * SR);
    const f = 900 - 500 * u + 120 * Math.sin(TAU * 18 * u * dur) * (1 - u);
    ph = (ph + f / SR) % 1;
    const s = 2 * Math.abs(2 * ph - 1) - 1;
    return s * Math.sin(Math.PI * u) * (0.7 + 0.3 * Math.sin(TAU * 30 * u * dur));
  }, { gain: vamp(vel) * 0.3, pan, rev: 0.5 });
};

/** Campanella: parziali inarmoniche, decadimento lungo. */
const bell = (mix, m, { t, vel = 50, pan = 0, gain = 1 }) => {
  const f = mtof(m);
  put(mix, t, Math.ceil(2.5 * SR), (i) => {
    const x = i / SR;
    return (Math.sin(TAU * f * x) * Math.exp(-x / 1.2) + 0.5 * Math.sin(TAU * 2.76 * f * x) * Math.exp(-x / 0.6) + 0.3 * Math.sin(TAU * 5.4 * f * x) * Math.exp(-x / 0.25)) * Math.min(1, x / 0.002);
  }, { gain: gain * vamp(vel) * 0.5, pan, rev: 0.6 });
};

/** Scarica elettrica: ronzio a 50 Hz con armoniche e crepitio. */
const buzz = (mix, t0, t1, { vel = 40, seed = 41 } = {}) => {
  const r = rng(seed);
  const dur = t1 - t0;
  put(mix, t0, Math.ceil(dur * SR), (i) => {
    const x = i / SR;
    const s = Math.sin(TAU * 100 * x) + 0.5 * Math.sin(TAU * 200 * x) + 0.3 * Math.sin(TAU * 300 * x);
    const env = Math.min(1, x / 0.3) * Math.min(1, (dur - x) / 0.3);
    return (s * 0.5 + (r() < 0.004 ? (r() * 2 - 1) * 4 : 0)) * env;
  }, { gain: vamp(vel) * 0.4, rev: 0.2 });
};

// ---------------------------------------------------------------- materiale musicale

// tema del valzer (Re minore, 3/4): [tempo, nota MIDI, durata in tempi]; 8 battute
const THEME = [
  [0, 69, 1], [1, 74, 1], [2, 77, 1],
  [3, 76, 2], [5, 74, 1],
  [6, 73, 1], [7, 76, 1], [8, 81, 1],
  [9, 79, 2], [11, 77, 1],
  [12, 77, 1], [13, 76, 1], [14, 74, 1],
  [15, 82, 1.5], [16.5, 81, 0.5], [17, 79, 1],
  [18, 77, 1], [19, 76, 1], [20, 73, 1],
  [21, 74, 3],
];
// accordi per battuta: radice (classe di altezza) e intervalli
const CH_MIN = [[2, [0, 3, 7]], [7, [0, 3, 7]], [9, [0, 4, 7]], [2, [0, 3, 7]], [10, [0, 4, 7]], [7, [0, 3, 7]], [9, [0, 4, 7]], [2, [0, 3, 7]]];
const CH_MAJ = [[2, [0, 4, 7]], [7, [0, 4, 7]], [9, [0, 4, 7]], [2, [0, 4, 7]], [11, [0, 3, 7]], [4, [0, 3, 7]], [9, [0, 4, 7]], [2, [0, 4, 7]]];
// Re maggiore: fa → fa diesis, si bemolle → si
const toMajor = (m) => (m % 12 === 5 || m % 12 === 10 ? m + 1 : m);

export default (mix, T) => {
  const film = loadFilm('frankenstein-junior');
  const { segments } = timeline(film);
  const segs = Object.fromEntries(segments.map((s) => [s.id, s]));
  /** Inizio assoluto della frase n del capitolo, come subtitleTimes in ChapterOverlay.tsx. */
  const cue = (id, n) => {
    const s = segs[id];
    const w = s.testo.map((l) => l.length + 6);
    const tot = w.reduce((a, b) => a + b, 0);
    let cur = 0.15;
    for (let k = 0; k < n; k++) cur += (w[k] / tot) * (s.dur - 0.35);
    return s.start + cur;
  };
  const C = cue;
  const BODY = 0.8;
  let sid = 0;

  /**
   * Valzer ciclico da `from` a `to`.
   * vln: violino (livello) · keep: probabilità di ogni nota · oct: trasposizione · major: Re maggiore
   * oom: pizzicato in tre tempi (livello) · org: organo sostenuto (livello) · timp: timpano sul primo tempo
   */
  const waltz = (from, to, o) => {
    const beat = 60 / o.bpm, bar = 3 * beat, loop = 24 * beat;
    const R = rng(7000 + sid++ * 97);
    const chords = o.major ? CH_MAJ : CH_MIN;
    for (let L0 = from; L0 < to - 0.2; L0 += loop) {
      for (let b = 0; b < 8; b++) {
        const t = L0 + b * bar;
        if (t >= to - 0.25) break;
        const left = to - t;
        const [pc, iv] = chords[b];
        const root = 38 + pc;
        if (o.oom) {
          pizz(mix, root - 12, { t, vel: o.oom, gain: BODY, pan: -0.2 });
          [1, 2].forEach((k) => { if (k * beat < left - 0.1) iv.forEach((v, j) => pizz(mix, root + 12 + v, { t: t + k * beat, vel: o.oom * 0.7, gain: BODY * 0.7, pan: -0.1 + j * 0.15 })); });
        }
        if (o.org) iv.concat([12]).forEach((v, j) => organ(mix, root + v + (o.orgOct ?? 0), { t, dur: Math.min(bar * 1.02, left), vel: o.org, gain: BODY * 0.7, pan: (j - 1.5) * 0.25 }));
        if (o.timp && (b % 2 === 0 || o.timpAll)) timp(mix, 26 + (pc % 12 > 7 ? pc - 12 : pc), { t, vel: o.timp, gain: BODY });
      }
      if (!o.vln) continue;
      for (const [b, m0, d] of THEME) {
        const t = L0 + b * beat;
        if (t >= to - 0.2 || R() > o.keep) continue;
        const m = (o.major ? toMajor(m0) : m0) + (o.oct ?? 0);
        violin(mix, m, { t, dur: Math.min(d * beat * 1.05, to - t), vel: o.vln * (0.9 + R() * 0.2), gain: BODY * 1.2, seed: sid, slide: R() < 0.15 ? -1 : 0 });
      }
    }
  };

  /** Swing per lo spettacolo: contrabbasso camminante, spazzole e tip tap. */
  const swing = (from, to, { bpm = 150, vel = 46 } = {}) => {
    const beat = 60 / bpm;
    const walk = [38, 41, 45, 46, 43, 46, 50, 48, 45, 41, 43, 44, 45, 44, 43, 41];
    let k = 0;
    for (let t = from; t < to - 0.1; t += beat, k++) {
      pizz(mix, walk[k % walk.length] - 12, { t, vel, gain: BODY * 1.2, pan: -0.2 });
      drum(mix, 'brushtap', t, vel * 0.8, 3);
      if (k % 2 === 1) drum(mix, 'swish', t, vel * 0.6, 5);
      drum(mix, 'sidestick', t + beat * 0.66, vel * 0.55, 9 + k);
      if (k % 4 === 3) [74, 77, 81].forEach((m, j) => organ(mix, m, { t: t + beat * 0.66, dur: 0.18, vel: vel * 0.8, gain: BODY * 0.5, pan: (j - 1) * 0.3, rev: 0.3 }));
    }
  };

  // ---- sezioni (tempi dai capitoli del JSON)
  // copertina: organo e timpani nel temporale
  waltz(0, T.lezione, { bpm: 96, org: 46, timp: 58, timpAll: true });
  // lezione: valzer leggero e un po' pedante, pizzicati e violino
  waltz(T.lezione, T.stazione, { bpm: 104, vln: 48, keep: 0.85, oom: 44 });
  // stazione: notte in montagna, violino sparso e organo basso
  waltz(T.stazione, T.castello, { bpm: 92, vln: 40, keep: 0.6, org: 30, orgOct: -12, oom: 30 });
  // castello: tensione da film horror, organo e timpani; poi il violino "da solo" (cue 4)
  waltz(T.castello, C('castello', 4), { bpm: 92, org: 40, timp: 50, oom: 28 });
  waltz(C('castello', 4) - 0.3, T.libreria, { bpm: 92, vln: 52, keep: 1 });
  // libreria: mistero, poi entusiasmo crescente fino a "Si può fare!"
  waltz(T.libreria, C('libreria', 3), { bpm: 88, org: 34, oom: 34, vln: 38, keep: 0.5 });
  waltz(C('libreria', 3), T.cervello, { bpm: 112, org: 40, oom: 44, vln: 52, keep: 1, timp: 46 });
  // cervello: furtivo, pizzicati e organo grave
  waltz(T.cervello, T.creazione, { bpm: 100, oom: 42, org: 30, orgOct: -12, vln: 36, keep: 0.4 });
  // creazione: organo pieno e timpani; silenzio quando la corrente muore; poi tutto a piena forza
  waltz(T.creazione, C('creazione', 3) + 0.5, { bpm: 100, org: 50, timp: 58, timpAll: true, oom: 40 });
  waltz(C('creazione', 5), T.eremita, { bpm: 118, org: 56, timp: 62, timpAll: true, vln: 58, keep: 1, oom: 46 });
  // eremita: il violino che calma (tema intero, dolce); poi pizzicati comici
  waltz(T.eremita, C('eremita', 3), { bpm: 90, vln: 50, keep: 1, org: 26 });
  waltz(C('eremita', 3), T.teatro, { bpm: 120, oom: 46, vln: 40, keep: 0.6 });
  // teatro: il violino porta in scena, poi swing con tip tap; l'esplosione interrompe tutto
  waltz(T.teatro, C('teatro', 2), { bpm: 100, vln: 46, keep: 0.9, oom: 36 });
  swing(C('teatro', 2), C('teatro', 4), { bpm: 150, vel: 50 });
  waltz(C('teatro', 4) + 0.4, T.elizabeth, { bpm: 80, org: 44, timp: 56, timpAll: true });
  // elizabeth: valzer elegante, poi la tempesta; quando canta il tema torna in maggiore
  waltz(T.elizabeth, C('elizabeth', 2), { bpm: 108, oom: 40, vln: 44, keep: 0.8 });
  waltz(C('elizabeth', 2), C('elizabeth', 3) + 0.3, { bpm: 96, org: 46, timp: 56, timpAll: true });
  waltz(C('elizabeth', 3) + 0.3, T.assedio, { bpm: 96, major: true, vln: 54, keep: 1, org: 30, oct: 12 });
  // assedio: marcia minacciosa di timpani, violino dalla torre, poi calma
  waltz(T.assedio, C('assedio', 3), { bpm: 104, org: 44, timp: 60, timpAll: true, vln: 46, keep: 0.8 });
  waltz(C('assedio', 3), T.nozze, { bpm: 84, vln: 42, keep: 0.7, org: 28, major: true });
  // nozze: valzer in Re maggiore, pieno e luminoso
  waltz(T.nozze, T.finale, { bpm: 108, major: true, vln: 56, keep: 1, oom: 46, org: 30 });

  // finale: accordo di Re maggiore all'organo, violino che sale e campanelle
  const F = T.finale;
  [38, 50, 54, 57, 62, 66].forEach((m, j) => organ(mix, m, { t: F, dur: 3.3, vel: 50, gain: BODY * 0.8, pan: (j - 2.5) * 0.25 }));
  violin(mix, 74, { t: F + 0.1, dur: 1, vel: 54, gain: BODY * 1.2 });
  violin(mix, 78, { t: F + 1.1, dur: 1, vel: 54, gain: BODY * 1.2 });
  violin(mix, 81, { t: F + 2.1, dur: 1.6, vel: 58, gain: BODY * 1.2 });
  [86, 90, 93].forEach((m, j) => bell(mix, m, { t: F + 0.4 + j * 0.3, vel: 44, pan: -0.3 + j * 0.3 }));

  // ---------------------------------------------------------------- effetti sonori (tempi delle scene)
  // copertina: due fulmini sul parafulmine (Locandina.tsx a 1,1 e 2,6 s)
  thunder(mix, 1.1, 0.8, 3); thunder(mix, 2.6, 0.6, 5);
  buzz(mix, 1.1, 1.7, { vel: 44 });
  rainHiss(mix, 0, T.lezione + 0.3, { power: 0.35, fade: 0.8 });
  // lezione: gesso che scrive FRANKENSTIN, ritratto che gira, lettera che arriva
  for (let t = C('lezione', 2) - 0.2; t < C('lezione', 2) + 1.2; t += 0.09) chalk(mix, t, 36);
  chalk(mix, C('lezione', 2) + 1.3, 44); chalk(mix, C('lezione', 2) + 1.7, 44);
  whoosh(mix, C('lezione', 3) + 0.3, 0.6, { vel: 40, lo: 400, hi: 1600 });
  whoosh(mix, C('lezione', 4), 0.7, { vel: 44, lo: 500, hi: 2200, pan: 0.3 });
  pop(mix, C('lezione', 4) + 0.7, 50, { pitch: -5 });
  // stazione: vento, sobbalzo del carro, ululato
  wind(mix, T.stazione, T.castello, { power: 0.25, fade: 1.2, center: 500, seed: 19 });
  thud(mix, C('stazione', 3) + 0.05, 52, { bright: 800 });
  howl(mix, C('stazione', 4) - 0.1, { vel: 56, dur: 2.0 });
  // castello: due colpi di batacchio, tuoni e nitriti, pioggia
  hollowBonk(mix, T.castello + 0.45, 74); hollowBonk(mix, T.castello + 0.8, 70);
  thunder(mix, C('castello', 1) + 0.15, 0.8, 7); thunder(mix, C('castello', 3) + 0.15, 0.6, 9);
  neigh(mix, C('castello', 1) + 0.25, { vel: 56 }); neigh(mix, C('castello', 3) + 0.25, { vel: 50, pan: 0.6 });
  rainHiss(mix, T.castello, T.libreria, { power: 0.4, fade: 0.8 });
  // libreria: si apre cigolando, si richiude di colpo, si riapre; rivelazione finale
  doorCreak(mix, C('libreria', 0) + 0.6, 1.0, { vel: 50 });
  thud(mix, C('libreria', 1) + 0.33, 66);
  doorCreak(mix, C('libreria', 1) + 1.2, 0.9, { vel: 46 });
  swell(mix, C('libreria', 5), 2.2, { vel: 50 });
  buzz(mix, C('libreria', 5), C('libreria', 5) + 1.0, { vel: 38 });
  // cervello: tuono sul patibolo, barattolo in frantumi, rintocco per ABNORMAL
  thunder(mix, C('cervello', 1) + 0.1, 0.7, 11); thunder(mix, C('cervello', 3) + 0.55, 0.45, 13);
  glassCrash(mix, C('cervello', 3) + 0.55, 76);
  bell(mix, 70, { t: C('cervello', 4) + 0.5, vel: 52 });
  rainHiss(mix, T.cervello, T.creazione, { power: 0.25, fade: 1 });
  // creazione: elettricità, tuoni, cinghie che saltano
  buzz(mix, T.creazione, C('creazione', 3) + 1.0, { vel: 46 });
  buzz(mix, C('creazione', 5), T.eremita + 0.2, { vel: 52, seed: 43 });
  thunder(mix, C('creazione', 1) + 0.9, 0.8, 15); thunder(mix, C('creazione', 5), 1, 17);
  [0, 0.08, 0.16].forEach((d) => thud(mix, C('creazione', 5) - 0.25 + d, 58, { bright: 2400, seed: 31 + d * 100 }));
  rainHiss(mix, T.creazione, T.eremita, { power: 0.35, fade: 1 });
  // eremita: fuoco, tazza in frantumi, fiammifero
  crackle(mix, T.eremita, T.teatro, { vel: 36 });
  glassCrash(mix, C('eremita', 3) + 0.6, 60, 57);
  whoosh(mix, C('eremita', 3) + 0.3, 0.8, { vel: 36, lo: 200, hi: 900 });
  whoosh(mix, C('eremita', 4) - 0.15, 0.25, { vel: 50, lo: 1500, hi: 5000, pan: 0.3 });
  // teatro: applauso al sipario, esplosione del riflettore, catene
  applause(mix, C('teatro', 1), 2.2, { vel: 34 });
  glassCrash(mix, C('teatro', 4), 82, 61); thunder(mix, C('teatro', 4), 0.5, 19);
  [0, 0.15, 0.3, 0.45].forEach((d, k) => metalThud(mix, C('teatro', 5) + 0.3 + d, 56 - k * 6));
  // elizabeth: bagagli che cadono, cipria, finestra spalancata nella tempesta
  [0, 0.18, 0.32, 0.46].forEach((d) => thud(mix, C('elizabeth', 0) + d + 0.42, 54, { bright: 900 }));
  whoosh(mix, C('elizabeth', 1) + 0.2, 1.0, { vel: 38, lo: 600, hi: 3000, pan: -0.3 });
  thunder(mix, C('elizabeth', 2), 0.9, 21); thunder(mix, C('elizabeth', 2) + 0.9, 0.6, 23);
  wind(mix, C('elizabeth', 2), T.assedio, { power: 0.4, fade: 1, center: 600, seed: 25 });
  [0, 0.12].forEach((d) => metalThud(mix, C('elizabeth', 2) + 0.75 + d, 50));
  // assedio: torce che crepitano, scarica dal parafulmine, torce che si spengono
  crackle(mix, T.assedio, C('assedio', 3) + 1.2, { vel: 30, seed: 39 });
  thunder(mix, C('assedio', 2) + 0.1, 0.9, 27); thunder(mix, C('assedio', 2) + 0.9, 0.7, 29);
  buzz(mix, C('assedio', 2) + 0.1, C('assedio', 2) + 1.6, { vel: 50, seed: 45 });
  // nozze: campane a festa, pagina del giornale, brillio delle fedi
  [74, 78, 81, 86].forEach((m, j) => bell(mix, m, { t: C('nozze', 1) + j * 0.22, vel: 46, pan: -0.3 + j * 0.2 }));
  whoosh(mix, C('nozze', 2) + 0.2, 0.6, { vel: 32, lo: 1200, hi: 4000 });
  bell(mix, 93, { t: C('nozze', 3), vel: 40, pan: 0.4 });
};
