// Colonna sonora originale della Notte stellata: pianoforte lento, archi e campanelle, discreti sotto la voce.
// Il tema (Re minore, 3/4, un arpeggio che gira su sé stesso come i vortici del cielo) è inventato qui:
// più scuro nei capitoli dell'ospedale e della finestra, si schiarisce su Venere e si apre in Re maggiore nel finale.
// Effetti agganciati agli eventi delle scene in src/scenes/notte-stellata/.
import { put, rng, wind, swell, thud, FX } from './synth.mjs';
import { loadFilm, timeline } from './film.mjs';

const TAU = Math.PI * 2;
const SR = 44100;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const vamp = (v) => (v / 127) ** 1.6;

// ---------------------------------------------------------------- strumenti locali (via put)

/** Pianoforte morbido: armoniche con decadimento più rapido in alto. */
const piano = (mix, m, { t, dur = 1.5, vel = 60, pan = 0, rev = 0.55, gain = 1 }) => {
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

/** Archi: tre seghe scordate con vibrato e attacco lento. */
const strings = (mix, m, { t, dur, vel = 40, pan = 0, rev = 0.65, gain = 1, att = 1.2, seed = 1 }) => {
  const f = mtof(m);
  const r = rng(seed * 977 + Math.round(t * 1000) + m);
  const dets = [-6, 0, 6].map((c) => f * 2 ** (c / 1200));
  const ph = dets.map(() => r());
  const a = 1 - Math.exp((-TAU * f * 3) / SR);
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

/** Campanella: parziali inarmoniche, decadimento lungo (stelle, finestre che si accendono). */
const bell = (mix, m, { t, vel = 44, pan = 0, gain = 1 }) => {
  const f = mtof(m);
  put(mix, t, Math.ceil(3 * SR), (i) => {
    const x = i / SR;
    return (Math.sin(TAU * f * x) * Math.exp(-x / 1.4) + 0.4 * Math.sin(TAU * 2.76 * f * x) * Math.exp(-x / 0.6) + 0.2 * Math.sin(TAU * 5.4 * f * x) * Math.exp(-x / 0.25)) * Math.min(1, x / 0.002);
  }, { gain: gain * vamp(vel) * 0.45, pan, rev: 0.8 });
};

/** Fruscio di pennello: rumore filtrato breve, per la luce radente sulla pittura. */
const brush = (mix, t, dur, { vel = 36, seed = 5 } = {}) => {
  const r = rng(seed);
  let lp = 0, hp = 0;
  put(mix, t, Math.ceil(dur * SR), (i) => {
    const u = i / (dur * SR);
    const n = r() * 2 - 1;
    lp += 0.25 * (n - lp);
    hp = lp - hp * 0.2;
    return hp * Math.sin(Math.PI * u) ** 1.5;
  }, { gain: FX * vamp(vel) * 0.5, pan: 0.2, rev: 0.4 });
};

// ---------------------------------------------------------------- materiale musicale

// tema: [tempo, nota MIDI, durata in tempi]; 4 battute in 3/4, Re minore: un arpeggio che sale e ricade su sé stesso
const THEME = [
  [0, 62, 1], [1, 65, 1], [2, 69, 1],
  [3, 67, 2], [5, 65, 1],
  [6, 64, 1], [7, 65, 1], [8, 67, 1],
  [9, 65, 3],
];
// accordi per battuta (radice, intervalli): Dm · B♭ · Gm · A (minore) · D · B♭ · G · A (maggiore)
const CH_MIN = [[2, [0, 3, 7]], [10, [0, 4, 7]], [7, [0, 3, 7]], [9, [0, 4, 7]]];
const CH_MAJ = [[2, [0, 4, 7]], [10, [0, 4, 7]], [7, [0, 4, 7]], [9, [0, 4, 7]]];
const toMajor = (m) => (m % 12 === 5 ? m + 1 : m);

export default (mix, T) => {
  const film = loadFilm('notte-stellata');
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
   * mel: pianoforte (livello) · keep: probabilità di ogni nota · oct: trasposizione · major: Re maggiore
   * str: archi (livello) · arp: arpeggio di accompagnamento al pianoforte · bass: basso · bells: campanelle sul tema
   */
  const sec = (from, to, o) => {
    const beat = 60 / o.bpm, bar = 3 * beat, loop = 12 * beat;
    const R = rng(7000 + sid++ * 113);
    const chords = o.major ? CH_MAJ : CH_MIN;
    for (let L0 = from; L0 < to - 0.2; L0 += loop) {
      for (let b = 0; b < 4; b++) {
        const t = L0 + b * bar;
        if (t >= to - 0.3) break;
        const left = to - t;
        const [pc, iv] = chords[b];
        const root = 38 + ((pc - 2 + 12) % 12);
        const d = Math.min(bar * 1.02, left);
        if (o.str) iv.concat([12]).forEach((v, j) => strings(mix, root + v + 12, { t: t + j * 0.05, dur: d, vel: o.str, gain: BODY * 0.7, pan: (j - 1.5) * 0.3, seed: j + 3 }));
        if (o.bass) piano(mix, root - 12, { t, dur: bar, vel: o.bass, gain: BODY, pan: -0.15 });
        if (o.arp) [0, 1, 2].forEach((k) => {
          if (t + k * beat < to - 0.2) piano(mix, root + 12 + [0, iv[1], iv[2]][k], { t: t + k * beat, dur: beat * 1.4, vel: o.arp, gain: BODY * 0.8, pan: -0.2 + k * 0.2 });
        });
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
  // copertina e primo sguardo: il tema con le campanelle, come stelle
  sec(0, T.arles, { bpm: 84, mel: 46, keep: 1, arp: 32, str: 28, bells: 30 });
  // Arles e l'ospedale: più scuro, pianoforte grave e archi
  sec(T.arles, T.ospedale, { bpm: 72, mel: 42, keep: 0.7, bass: 40, str: 34 });
  sec(T.ospedale, T.finestra, { bpm: 66, mel: 40, keep: 0.6, oct: -12, bass: 38, str: 36 });
  // la finestra: sospeso, solo archi e qualche nota
  sec(T.finestra, T.villaggio, { bpm: 66, mel: 36, keep: 0.4, str: 38, bass: 34 });
  // villaggio e cipresso: il tema torna, intimo
  sec(T.villaggio, T.cipresso, { bpm: 76, mel: 46, keep: 1, arp: 30, bass: 36 });
  sec(T.cipresso, T.venere, { bpm: 70, mel: 42, keep: 0.8, oct: -12, str: 40, bass: 38 });
  // Venere: si schiarisce, tema in alto con campanelle
  sec(T.venere, T.vortici, { bpm: 80, mel: 44, keep: 1, oct: 12, arp: 30, str: 30, bells: 36 });
  // vortici: più mosso, l'arpeggio gira
  sec(T.vortici, T.tecnica, { bpm: 96, mel: 46, keep: 1, arp: 38, str: 40, bass: 38 });
  // tecnica: leggero
  sec(T.tecnica, T.fallimento, { bpm: 84, mel: 42, keep: 0.8, arp: 32, bells: 28 });
  // fallimento: lento e triste
  sec(T.fallimento, T.oggi, { bpm: 60, mel: 44, keep: 1, str: 38, bass: 36 });
  // oggi: il tema si apre in maggiore
  sec(T.oggi, T.finale, { bpm: 76, mel: 50, keep: 1, major: true, arp: 34, str: 44, bells: 34 });

  // finale: accordo di Re maggiore ampio
  const F = T.finale;
  [38, 50, 57, 62, 66, 69].forEach((m, j) => strings(mix, m, { t: F, dur: 3.4, vel: 48, gain: BODY * 0.8, pan: (j - 2.5) * 0.2, att: 0.6, seed: 30 + j }));
  [74, 78, 81, 86].forEach((m, j) => bell(mix, m, { t: F + 0.4 + j * 0.35, vel: 38, pan: -0.3 + j * 0.2 }));

  // ---------------------------------------------------------------- effetti sonori (tempi delle scene)
  // ospedale: le finestre che si accendono una alla volta (Alone da cues[1], ogni 0,6 s)
  [74, 77, 81, 79, 76, 74].forEach((m, i) => bell(mix, m, { t: C('ospedale', 1) + i * 0.6 + 0.2, vel: 30, pan: -0.3 + i * 0.12 }));
  // finestra: l'ombra delle sbarre passa (cues[2] − 0,5 → +2,5)
  thud(mix, C('finestra', 2) - 0.3, 34, { bright: 600 });
  // villaggio: il riflettore sul campanile
  swell(mix, C('villaggio', 1) + 0.8, 1.4, { vel: 34 });
  // Venere che si accende
  swell(mix, C('venere', 1) + 0.6, 1.6, { vel: 38 });
  bell(mix, 86, { t: C('venere', 1) + 0.6, vel: 36, pan: -0.2 });
  // vortici: il vento nel cielo
  wind(mix, T.vortici, T.tecnica, { power: 0.25, fade: 1.5, center: 600, seed: 19 });
  // tecnica: la luce radente sulla pittura
  brush(mix, T.tecnica + 0.8, 2.5, { vel: 30 });
};
