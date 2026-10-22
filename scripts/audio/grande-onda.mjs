// Colonna sonora originale della Grande onda di Kanagawa: pianoforte, archi, pizzicato (corda pizzicata simile a un
// koto, sintetizzata) e tamburo grave morbido, discreti sotto la voce. Il tema usa una scala pentatonica di Re
// (re, mi, sol, la, si) che evoca il Giappone senza imitare brani esistenti; sale e scende come il mare.
// Più teso sull'onda, sulle barche e sugli artigli di schiuma, sospeso sul Fuji, si apre nel finale.
import { put, rng, drum, note, swell, wind } from './synth.mjs';
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
const strings = (mix, m, { t, dur, vel = 40, pan = 0, rev = 0.65, gain = 1, att = 1.4, seed = 1 }) => {
  const f = mtof(m);
  const r = rng(seed * 977 + Math.round(t * 1000) + m);
  const dets = [-6, 0, 6].map((c) => f * 2 ** (c / 1200));
  const ph = dets.map(() => r());
  const a = 1 - Math.exp((-TAU * f * 2.6) / SR);
  let lp = 0;
  const rel = 1.6;
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

// ---------------------------------------------------------------- materiale musicale

// accordi per battuta (radice MIDI del basso, intervalli): Re · Si minore · Sol · La sospeso
const CHORDS = [[38, [0, 7, 14]], [35, [0, 7, 15]], [43, [0, 7, 14]], [45, [0, 5, 7]]];
// tema pentatonico: [tempo, nota MIDI, durata in tempi], 4 battute in 4/4, sale come un'onda e ricade
const THEME = [
  [0, 74, 1], [1, 76, 0.5], [1.5, 79, 0.5], [2, 81, 2],
  [4, 83, 1], [5, 81, 0.5], [5.5, 79, 0.5], [6, 76, 2],
  [8, 74, 1], [9, 76, 0.5], [9.5, 79, 0.5], [10, 81, 1], [11, 86, 1],
  [12, 83, 1.5], [13.5, 81, 0.5], [14, 76, 2],
];

export default (mix, T) => {
  const film = loadFilm('grande-onda');
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
   * koto: arpeggio pizzicato in crome · mel: tema al pianoforte · keep: probabilità di ogni nota · oct: trasposizione
   * str: archi · bass: contrabbasso · taiko: tamburo grave morbido sui tempi forti
   */
  const sec = (from, to, o) => {
    const beat = 60 / o.bpm, bar = 4 * beat, loop = 16 * beat;
    const R = rng(6100 + sid++ * 113);
    for (let L0 = from; L0 < to - 0.2; L0 += loop) {
      for (let b = 0; b < 4; b++) {
        const t = L0 + b * bar;
        if (t >= to - 0.3) break;
        const [root, iv] = CHORDS[b];
        const d = Math.min(bar * 1.02, to - t);
        if (o.bass) note(mix, 'upright', mtof(root), { t, dur: bar * 0.9, vel: o.bass, pan: -0.1 });
        if (o.str) iv.forEach((v, j) => strings(mix, root + 12 + v, { t: t + j * 0.05, dur: d, vel: o.str, gain: BODY * 0.7, pan: (j - 1) * 0.35, seed: j + 3 }));
        if (o.koto) [0, iv[1], iv[2], 12 + iv[1], 24, 12 + iv[1], iv[2], iv[1]].forEach((v, e) => {
          const te = t + e * beat * 0.5;
          if (te < to - 0.2) note(mix, 'pluck', mtof(root + 24 + v), { t: te, dur: beat * 0.7, vel: o.koto * (e % 2 ? 0.8 : 1), pan: 0.3, rev: 0.45, seed: e + b });
        });
        if (o.taiko) {
          drum(mix, 'softkick', t, o.taiko * 1.2);
          if (t + 2.5 * beat < to - 0.2) drum(mix, 'softkick', t + 2.5 * beat, o.taiko);
          drum(mix, 'brushtap', t + beat, o.taiko * 0.6);
          drum(mix, 'brushtap', t + 3 * beat, o.taiko * 0.6);
        }
      }
      if (!o.mel) continue;
      for (const [b, m, dd] of THEME) {
        const t = L0 + b * beat;
        if (t >= to - 0.2 || R() > o.keep) continue;
        piano(mix, m + (o.oct ?? 0), { t, dur: Math.min(dd * beat * 1.1, to - t), vel: o.mel * (0.92 + R() * 0.16), gain: BODY * 1.15, pan: 0.05 });
      }
    }
  };

  // ---- sezioni (tempi dai capitoli del JSON)
  // copertina e primo sguardo: l'onda che sale
  sec(0, T.hokusai, { bpm: 96, koto: 40, mel: 50, keep: 1, str: 40, bass: 48, taiko: 40 });
  // Hokusai e la serie: calmo, pizzicato e pianoforte
  sec(T.hokusai, T['due-montagne'], { bpm: 84, koto: 36, mel: 46, keep: 0.9, bass: 40 });
  // due montagne: sospeso
  sec(T['due-montagne'], T.barche, { bpm: 72, mel: 42, keep: 0.7, oct: 12, str: 36 });
  // barche, artigli, tsunami: teso, tamburo
  sec(T.barche, T.blu, { bpm: 104, koto: 44, mel: 50, keep: 1, str: 44, bass: 50, taiko: 46 });
  // il blu e la stampa: più leggero
  sec(T.blu, T.europa, { bpm: 88, koto: 38, mel: 46, keep: 0.9, str: 30, bass: 42, taiko: 22 });
  // il viaggio in Europa: si apre
  sec(T.europa, T.oggi, { bpm: 92, koto: 38, mel: 50, keep: 1, str: 42, bass: 46, taiko: 26 });
  // Hokusai a cent'anni: raccolto, poi la domanda
  sec(T.oggi, T.finale, { bpm: 76, koto: 30, mel: 46, keep: 0.9, str: 38, bass: 38 });

  // finale: accordo aperto di Re, pizzicato che sale
  const F = T.finale;
  [38, 50, 57, 64, 69].forEach((m, j) => strings(mix, m, { t: F, dur: 3.2, vel: 44, gain: BODY * 0.8, pan: (j - 2) * 0.2, att: 0.6, seed: 30 + j }));
  [62, 64, 67, 69, 71, 74].forEach((m, j) => note(mix, 'pluck', mtof(m + 12), { t: F + 0.15 + j * 0.14, dur: 1.5, vel: 46, pan: -0.3 + j * 0.12, rev: 0.5, seed: j }));

  // ---------------------------------------------------------------- effetti discreti (tempi delle scene)
  // il mare sotto le scene dell'onda
  wind(mix, 0, T.hokusai, { power: 0.14, fade: 1.5, center: 500, seed: 23 });
  wind(mix, T.barche, T.blu, { power: 0.18, fade: 1.5, center: 600, seed: 29 });
  // la cresta che si chiude sugli artigli
  swell(mix, C('artigli', 1) + 0.6, 1.4, { vel: 30 });
};
