// Colonna sonora originale di Dark, stagione 3 (formato "Spiegato semplice", senza sigla): stessa famiglia sonora delle
// stagioni 1 e 2 (bordoni gravi di celli e contrabbasso, archi lenti, pianoforte e glockenspiel campionati VSCO-2 CE,
// ticchettio d'orologio come metronomo) e lo stesso motivo inventato del cerchio (Do, Mi bemolle, Re, Sol).
// Nel mondo di Eva il motivo è rovesciato, come allo specchio (Do, La, Si bemolle, Fa); nel mondo d'origine, quando resta
// solo il tronco (capitolo «fine»), il motivo si scioglie finalmente in maggiore. Niente brani o motivi della serie.
// Effetti agganciati agli eventi dello schema in src/scenes/dark-stagione-3/Mondi.tsx (stessi istanti, sulla croma).
import { put, rng, FX } from './synth.mjs';
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte', 'violini', 'viole', 'celli', 'contrabbasso', 'glockenspiel', 'grancassa'];
export const effetti = ['scatti', 'rombo', 'pagine', 'pioggia_dura', 'passaggio'];
/** Sala scura e chiusa, come nelle stagioni 1 e 2. */
export const sala = { rt60: 2.6, brillo: 5000, predelay: 0.025, wet: 0.5 };

const TAU = Math.PI * 2;
const SR = 44100;
const vamp = (v) => (v / 127) ** 1.6;
/** Un solo tempo (66 bpm, come le stagioni 1 e 2) su una griglia continua che parte dalla fine della copertina. */
const BPM = 66;
const BEAT = 60 / BPM;
const GRID = 4 * BEAT; // una battuta
const BEAT_ = BEAT / 2; // croma: passo delle figure ripetute e degli eventi delle scene
const C0 = 4; // fine della copertina: origine della griglia (come griglia() nelle scene)
const OFF = C0 + 2 * BEAT; // le battute cadono a metà: così i cambi di sezione stanno più vicini all'inizio dei capitoli
const snap = (t) => (t <= 0 ? 0 : Math.round((t - OFF) / GRID) * GRID + OFF);
const croma = (t) => C0 + Math.round((t - C0) / BEAT_) * BEAT_;

// ---------------------------------------------------------------- strumenti (campionati)

/** Bordone grave: celli e contrabbasso tenuti. */
const drone = (mix, m, { t, dur, vel = 40, gain = 1, seed = 1 }) =>
  suona(mix, m < 40 ? 'contrabbasso' : 'celli', m, { t, dur, vel: vel + 14, gain: gain * 1.6, attack: 2, release: 2, rev: 0.6, seed });

/** Archi d'orchestra. */
const strings = (mix, m, { t, dur, vel = 40, pan = 0, gain = 1, att = 1.2, seed = 1 }) =>
  archi(mix, m, { t, dur, vel: vel + 8, pan, rev: 0.65, gain: gain * 1.4, attack: att, release: 1.4, seed });

/** Campanella: glockenspiel. */
const bell = (mix, m, { t, vel = 46, pan = 0, gain = 1 }) =>
  suona(mix, 'glockenspiel', m - 12, { t, dur: 2.5, vel: vel * 1.3, pan, rev: 0.75, gain: gain * 0.34, release: 1.5 });

/** Motivo del cerchio: pianoforte. */
const motif = (mix, m, { t, dur, vel }) =>
  suona(mix, 'pianoforte', m, { t, dur: Math.min(dur, 4), vel: vel * 1.2, pan: 0.15, rev: 0.6, gain: 4, release: 0.6 });

/** Tic dell'orologio: clic secco e brevissimo, alternato tic/tac. */
const tick = (mix, t, { vel = 34, tac = false } = {}) => {
  const f = tac ? 2600 : 3400;
  const r = rng(Math.round(t * 1000));
  put(mix, t, Math.ceil(0.03 * SR), (i) => {
    const x = i / SR;
    return (Math.sin(TAU * f * x) * 0.6 + (r() * 2 - 1) * 0.4) * Math.exp(-x / 0.004);
  }, { gain: FX * vamp(vel) * 0.3, pan: tac ? -0.2 : 0.2, rev: 0.15 });
};

// ---------------------------------------------------------------- materiale musicale

// il motivo del cerchio: [tempo, nota MIDI, durata in tempi], 2 battute in 4/4
const MOTIF = [[0, 72, 2], [2, 75, 2], [4, 74, 2], [6, 67, 2]];
// rovesciato intorno al Do, come allo specchio (il mondo di Eva)
const MOTIF_SPECCHIO = MOTIF.map(([b, m, l]) => [b, 144 - m, l]);
// in maggiore (il mondo d'origine): Do, Mi, Re, La
const MOTIF_MAGG = [[0, 72, 2], [2, 76, 2], [4, 74, 2], [6, 69, 2]]; // finisce sul La (non sul Sol: niente carillon di Westminster)
// accordi per battuta (radice MIDI, intervalli): Do minore · La bemolle · Fa minore · Sol (sospeso)
const CHORDS = [[48, [0, 3, 7]], [44, [0, 4, 7]], [41, [0, 3, 7]], [43, [0, 5, 7]]];
// mondo d'origine: Do · Fa · La minore · Sol
// mondo di Eva: Fa maggiore al posto del Fa minore, così il La dello specchio non stona
const CHORDS_SPECCHIO = [[48, [0, 3, 7]], [44, [0, 4, 7]], [41, [0, 4, 7]], [43, [0, 5, 7]]];
const CHORDS_MAGG = [[48, [0, 4, 7]], [41, [0, 4, 7]], [45, [0, 3, 7]], [43, [0, 4, 7]]];

export default (mix, T) => {
  const film = loadFilm('dark-stagione-3');
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
  /** Come at() di Mondi.tsx: frase n del capitolo più d secondi, sulla croma. */
  const at = (id, n, d = 0) => croma(C(id, n) + d);
  let sid = 0;

  /**
   * Una sezione da `from` a `to`.
   * passo ('meta') · drone (livello) · str: archi · pad · mel: motivo (livello, keep = probabilità di ogni nota, oct)
   * ticks: orologio · pulse: colpo sordo a ogni battuta · broken: il motivo salta note · specchio / magg: variante del motivo
   */
  const sec = (from, to, o) => {
    from = snap(from); to = snap(to);
    const beat = BEAT * (o.passo === 'meta' ? 2 : 1), bar = 4 * beat;
    const R = rng(7000 + sid++ * 131);
    const chords = o.magg ? CHORDS_MAGG : o.specchio ? CHORDS_SPECCHIO : CHORDS;
    /** tace: [t0, t1] = niente attacchi nuovi in quella finestra (silenzio dopo un colpo forte) */
    const zitto = (t) => o.tace && t >= o.tace[0] && t < o.tace[1];
    const mot = o.magg ? MOTIF_MAGG : o.specchio ? MOTIF_SPECCHIO : MOTIF;
    if (o.drone) {
      drone(mix, 36, { t: from, dur: to - from, vel: o.drone, gain: 0.7, seed: sid });
      drone(mix, 43, { t: from, dur: to - from, vel: o.drone * 0.8, gain: 0.5, seed: sid + 50 });
    }
    for (let k = 0, t = from; t < to - 0.3; k++, t += bar) {
      const [root, iv] = chords[k % 4];
      const d = Math.min(bar * 1.02, to - t);
      const z = zitto(t);
      if (o.str && !z) iv.forEach((v, j) => strings(mix, root + 12 + v, { t: t + j * 0.04, dur: d, vel: o.str, gain: 0.6, pan: (j - 1) * 0.35, seed: j + k }));
      if (o.pad && !z) iv.forEach((v, j) => archi(mix, root + 12 + v, { t, dur: d, vel: o.pad + 10, rev: 0.6, pan: (j - 1) * 0.3, gain: 0.8, attack: 1, release: 1.4, seed: j + 1 }));
      if (o.pulse && !z) colpo(mix, 'grancassa', o.pulse >= 40 ? 'bdrum_p' : 'bdrum_pp', { t, vel: 110, gain: 0.8, rev: 0.4, seed: k });
      if (o.ticks) for (let b = 0; b < 4; b++) if (t + b * beat < to && !zitto(t + b * beat)) tick(mix, t + b * beat, { vel: o.ticks, tac: b % 2 === 1 });
      if (o.mel && k % 2 === 0) {
        for (const [b, m, len] of mot) {
          const tt = t + b * beat;
          if (tt >= to - 0.2 || R() > (o.keep ?? 1) || zitto(tt)) continue;
          const mm = m + (o.oct ?? 0) - (o.broken && R() > 0.5 ? 1 : 0);
          motif(mix, mm, { t: tt, dur: Math.min(len * beat, to - tt), vel: o.mel });
          if (o.bells) bell(mix, mm + 12, { t: tt + 0.01, vel: o.bells, pan: -0.25 });
        }
      }
    }
  };

  // ---- copertina: la pioggia e l'orologio che scatta a mezzo secondo (lo stesso passo della lancetta in copertina)
  clip(mix, 'pioggia_dura', { t: 0, da: 5.4, durata: 4.6, gain: 0.55, fadeIn: 0.02, fadeOut: 1.2, largo: 3, rev: 0.12 });
  // sulla griglia: la lancetta della copertina scatta a ogni croma (Locandina.tsx)
  for (let k = 0; k < 8; k++) tick(mix, C0 - (8 - k) * BEAT_, { vel: 40, tac: k % 2 === 1 });
  drone(mix, 36, { t: 0, dur: OFF + 0.6, vel: 44, gain: 0.7, seed: 3 });
  [0, 1, 2, 3].forEach((k) => motif(mix, MOTIF[k][1] - 12, { t: C0 - (4 - k) * BEAT, dur: BEAT, vel: 36 }));
  tick(mix, C0, { vel: 30 });
  tick(mix, C0 + BEAT, { vel: 30, tac: true });

  // ---- sezioni (tempi dal JSON): i due mondi, lo specchio, il nodo; il maggiore solo nel mondo d'origine
  sec(OFF, T.eva, { drone: 44, str: 34, mel: 40, ticks: 26, tace: [at('altromondo', 2, 0.2) - 0.05, at('altromondo', 2, 0.2) + BEAT] });
  sec(T.eva, T.bambino, { drone: 42, mel: 42, specchio: true, ticks: 28, pad: 34 });
  sec(T.bambino, T.sfera, { drone: 40, str: 40, mel: 40, specchio: true, bells: 26 });
  sec(T.sfera, T.claudia, { passo: 'meta', drone: 48, mel: 36, oct: -12, broken: true, keep: 0.6, pulse: 42 });
  sec(T.claudia, T.origine, { drone: 40, mel: 42, ticks: 30, pad: 36 });
  sec(T.origine, T.ponte, { drone: 46, str: 42, mel: 40, oct: -12, pulse: 34, ticks: 32, tace: [at('origine', 2, 0.3) - 0.05, at('origine', 2, 0.3) + 2 * BEAT] });
  sec(T.ponte, T.svanire, { drone: 44, str: 46, mel: 46, ticks: 34, bells: 30 });
  sec(T.svanire, T.fine, { passo: 'meta', drone: 38, mel: 34, keep: 0.6, broken: true, pad: 30 });
  sec(T.fine, T.finale, { drone: 36, str: 32, mel: 36, magg: true, bells: 24 });

  // finale: il motivo in maggiore in campanelle sopra un accordo di Do maggiore aperto, con la pioggia leggera
  const F = snap(T.finale);
  [36, 48, 55, 60, 64, 67].forEach((m, j) => strings(mix, m, { t: F, dur: 4.6, vel: 46, gain: 0.6, pan: (j - 2.5) * 0.2, att: 0.5, seed: 40 + j }));
  MOTIF_MAGG.forEach(([b, m], k) => bell(mix, m + 12, { t: F + 0.3 + k * BEAT_, vel: 44, pan: -0.3 + k * 0.2 }));
  clip(mix, 'pioggia_dura', { t: T.finale - 0.5, da: 12, durata: 4.5, gain: 0.3, fadeIn: 0.8, fadeOut: 1.4, largo: 3, rev: 0.12 });

  // ---------------------------------------------------------------- effetti sonori (istanti delle scene)
  // altromondo: i due rami che si accendono, il «mai nato» barrato, la fine vicina
  [0, 1, 2].forEach((k) => bell(mix, [60, 67, 72][k], { t: at('altromondo', 0, 0.1) + k * BEAT_, vel: 36, pan: -0.3 }));
  [0, 1, 2].forEach((k) => bell(mix, [72, 67, 60][k], { t: at('altromondo', 0, 0.9) + k * BEAT_, vel: 36, pan: 0.3 })); // l'altro ramo, allo specchio
  clip(mix, 'passaggio', { t: at('altromondo', 0, 1.6) - 0.3, da: 12.27, durata: 1.6, gain: 0.22, fadeOut: 0.6, rev: 0.4 });
  bell(mix, 61, { t: at('altromondo', 1, 0.6), vel: 40 });
  colpo(mix, 'grancassa', 'bdrum_p', { t: at('altromondo', 2, 0.2), vel: 110, gain: 0.6, rev: 0.5 });
  clip(mix, 'rombo', { t: at('altromondo', 2, 0.2), da: 31, durata: 2.5, gain: 0.2, fadeIn: 0.3, fadeOut: 1.2, largo: 2 });
  // eva: Eva e Adam, poi il nodo che si disegna (il motivo intero, dritto e rovesciato)
  bell(mix, 69, { t: at('eva', 0, 0.2), vel: 42, pan: 0.3 });
  bell(mix, 63, { t: at('eva', 1, 0.2), vel: 42, pan: -0.3 });
  MOTIF.forEach(([, m], k) => bell(mix, m + 12, { t: at('eva', 2, 0.2) + k * BEAT_, vel: 36, pan: -0.3 }));
  MOTIF_SPECCHIO.forEach(([, m], k) => bell(mix, m + 12, { t: at('eva', 2, 0.2) + (4 + k) * BEAT_, vel: 36, pan: 0.3 }));
  // bambino: il cerchio del bambino al centro del nodo, poi le due frecce rosse dell'antenato
  [0, BEAT_].forEach((d, k) => bell(mix, [79, 84][k], { t: at('bambino', 0, 1.2) + d, vel: 32 }));
  bell(mix, 63, { t: at('bambino', 1, 0.4), vel: 42, pan: -0.3 });
  bell(mix, 60, { t: at('bambino', 1, 0.7), vel: 42, pan: 0.3 });
  // sfera: la sfera nera che inghiotte Martha e il bambino; «non funziona»
  clip(mix, 'rombo', { t: at('sfera', 1, 0.1), da: 31, durata: 3, gain: 0.3, fadeIn: 0.4, fadeOut: 1.2, largo: 3 });
  colpo(mix, 'grancassa', 'bdrum_p', { t: at('sfera', 1, 0.6), vel: 110, gain: 0.8, rev: 0.6 });
  colpo(mix, 'grancassa', 'bdrum_pp', { t: at('sfera', 2, 0.3), vel: 110, gain: 0.6, rev: 0.5 });
  // claudia: il quaderno, la spola tra i mondi, il tronco del terzo mondo che si accende
  bell(mix, 67, { t: at('claudia', 0, 0.6), vel: 32, pan: -0.3 }); // la spola tra i due mondi
  bell(mix, 63, { t: at('claudia', 0, 1.0), vel: 32, pan: 0.3 });
  clip(mix, 'pagine', { t: at('claudia', 0, 0.1), da: 1, durata: 0.7, gain: 0.25, fadeOut: 0.2, rev: 0.3 });
  [0, 1, 2, 3].forEach((k) => bell(mix, [55, 60, 63, 67][k], { t: at('claudia', 2, 0.5) + k * BEAT_, vel: 28 }));
  // origine: l'incidente sul ponte, la macchina che si accende, il mondo che si spacca (lampo)
  colpo(mix, 'grancassa', 'bdrum_p', { t: at('origine', 0, 0.9), vel: 110, gain: 0.7, rev: 0.5 });
  [0, 1, 2, 3, 4, 5].forEach((k) => clip(mix, 'scatti', { t: at('origine', 1, 0.1) + k * BEAT_ / 2, da: 6.49, durata: 0.1, gain: 0.14, rev: 0.2 })); // l'ingranaggio
  colpo(mix, 'grancassa', 'bdrum_p', { t: at('origine', 2, 0.3), vel: 127, gain: 1.6, rev: 0.7 });
  clip(mix, 'rombo', { t: at('origine', 2, 0.3), da: 31, durata: 3, gain: 0.4, fadeIn: 0.05, fadeOut: 1.5, largo: 3 });
  // ponte: Jonas e Martha scendono, il cartello, la macchina barrata
  clip(mix, 'passaggio', { t: at('ponte', 0, 0.3) - 0.3, da: 12.27, durata: 1.6, gain: 0.22, fadeOut: 0.6, rev: 0.4 });
  bell(mix, 72, { t: at('ponte', 1, 0.6), vel: 42 });
  colpo(mix, 'grancassa', 'bdrum_pp', { t: at('ponte', 2, 0.2), vel: 110, gain: 0.6, rev: 0.5 });
  [0, 1, 2].forEach((k) => bell(mix, [67, 72, 75][k], { t: at('ponte', 2, 0.3) + k * BEAT_, vel: 38 }));
  // svanire: i rami che si sciolgono (campanelle che scendono), Jonas e Martha, poi Adam ed Eva che fanno pace
  [0, 1, 2, 3, 4].forEach((k) => bell(mix, [84, 79, 75, 72, 67][k], { t: at('svanire', 0, 0.3) + k * BEAT, vel: 34, pan: (k % 2 ? 0.3 : -0.3) }));
  [0, BEAT_].forEach((d, k) => bell(mix, [75, 72][k], { t: at('svanire', 1, 0.2) + d, vel: 38 }));
  [56, 60, 63].forEach((m, j) => bell(mix, m + 12, { t: at('svanire', 2, 0.2) + j * 0.03, vel: 26, pan: (j - 1) * 0.3 })); // il primo accordo maggiore (La bemolle, come gli archi)
  // fine: il tronco che sale, la casa che si accende, «Jonas?»
  clip(mix, 'pioggia_dura', { t: at('fine', 0, 0.8), da: 9, durata: T.finale - at('fine', 0, 0.8), gain: 0.22, fadeIn: 1.2, fadeOut: 1.2, largo: 3, rev: 0.12 });
  [0, 1, 2].forEach((k) => bell(mix, [72, 79, 84][k], { t: at('fine', 0, 1.2) + k * BEAT_, vel: 18 }));
  bell(mix, 76, { t: at('fine', 1, 0.2), vel: 34 }); // Hannah
  MOTIF_MAGG.slice(0, 2).forEach(([, m], k) => bell(mix, m + 12, { t: at('fine', 2, 0.5) + k * BEAT, vel: 40, pan: 0.2 }));
};
