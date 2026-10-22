// Colonna sonora originale della Notte stellata: elegante e luminosa, in Re maggiore, discreta sotto la voce.
// Pianoforte in arpeggi che girano su sé stessi come i vortici, archi leggeri, contrabbasso e una pulsazione
// discreta di spazzole. Più raccolta (senza pulsazione) quando Vincent sta male e quando il quadro non gli piace;
// si apre nel finale. Il tema è inventato qui. Pochi effetti, agganciati ai riquadri delle scene.
import { put, rng, drum, swell, wind, note } from './synth.mjs';
import { loadFilm, timeline } from './film.mjs';

const TAU = Math.PI * 2;
const SR = 44100;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
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

/** Archi: tre seghe scordate con vibrato e attacco lento. */
const strings = (mix, m, { t, dur, vel = 40, pan = 0, rev = 0.6, gain = 1, att = 1.2, seed = 1 }) => {
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

// ---------------------------------------------------------------- materiale musicale

// accordi per battuta (4/4): Re · Si minore · Sol · La  (radice MIDI del basso, intervalli)
const CHORDS = [[38, [0, 4, 7]], [35, [0, 3, 7]], [43, [0, 4, 7]], [45, [0, 4, 7]]];
// tema: [tempo, nota MIDI, durata in tempi] su 4 battute, sopra gli arpeggi
const THEME = [
  [0, 78, 1.5], [1.5, 76, 0.5], [2, 74, 2],
  [4, 74, 1.5], [5.5, 76, 0.5], [6, 78, 1], [7, 81, 1],
  [8, 79, 1.5], [9.5, 78, 0.5], [10, 76, 2],
  [12, 76, 1], [13, 78, 1], [14, 73, 2],
];

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
   * arp: arpeggio in crome al pianoforte · mel: tema (pianoforte, ottava sopra) · keep: probabilità di ogni nota
   * str: archi · bass: contrabbasso · pulse: spazzole e cassa morbida
   */
  const sec = (from, to, o) => {
    const beat = 60 / o.bpm, bar = 4 * beat, loop = 16 * beat;
    const R = rng(5000 + sid++ * 113);
    for (let L0 = from; L0 < to - 0.2; L0 += loop) {
      for (let b = 0; b < 4; b++) {
        const t = L0 + b * bar;
        if (t >= to - 0.3) break;
        const [root, iv] = CHORDS[b];
        const d = Math.min(bar * 1.02, to - t);
        if (o.bass) note(mix, 'upright', mtof(root), { t, dur: bar * 0.9, vel: o.bass, pan: -0.1 });
        if (o.str) iv.concat([12]).forEach((v, j) => strings(mix, root + 12 + v + (j === 3 ? 12 : 0), { t: t + j * 0.04, dur: d, vel: o.str, gain: BODY * 0.7, pan: (j - 1.5) * 0.3, seed: j + 3 }));
        if (o.arp) {
          const figura = [0, iv[1], iv[2], 12, iv[2] + 12, 12, iv[2], iv[1]];
          figura.forEach((v, e) => {
            const te = t + e * beat * 0.5;
            if (te < to - 0.2) piano(mix, root + 24 + v, { t: te, dur: beat * 0.9, vel: o.arp * (e % 2 ? 0.82 : 1), gain: BODY, pan: -0.25 + (e % 4) * 0.12 });
          });
        }
        if (o.pulse) for (let q = 0; q < 4; q++) {
          const tq = t + q * beat;
          if (tq >= to - 0.2) break;
          drum(mix, 'brushtap', tq + beat * 0.5, o.pulse * 0.8);
          if (q === 1 || q === 3) drum(mix, 'swish', tq, o.pulse);
          if (q === 0) drum(mix, 'softkick', tq, o.pulse * 1.1);
        }
      }
      if (!o.mel) continue;
      for (const [b, m, d] of THEME) {
        const t = L0 + b * beat;
        if (t >= to - 0.2 || R() > o.keep) continue;
        piano(mix, m + (o.oct ?? 0), { t, dur: Math.min(d * beat * 1.1, to - t), vel: o.mel * (0.92 + R() * 0.16), gain: BODY * 1.15, pan: 0.08, rev: 0.6 });
      }
    }
  };

  // ---- sezioni (tempi dai capitoli del JSON)
  sec(0, T.arles, { bpm: 92, arp: 40, mel: 52, keep: 1, str: 30, bass: 46, pulse: 30 });
  sec(T.arles, C('arles', 2), { bpm: 92, arp: 38, mel: 48, keep: 0.9, bass: 44, pulse: 26 });
  sec(C('arles', 2), T.ospedale, { bpm: 76, arp: 32, mel: 42, keep: 0.6, str: 34, bass: 38 });
  sec(T.ospedale, T.villaggio, { bpm: 84, arp: 36, mel: 46, keep: 0.8, str: 32, bass: 42, pulse: 22 });
  sec(T.villaggio, T.vortici, { bpm: 92, arp: 40, mel: 50, keep: 1, str: 30, bass: 46, pulse: 28 });
  sec(T.vortici, T.tecnica, { bpm: 100, arp: 44, mel: 52, keep: 1, str: 38, bass: 48, pulse: 34 });
  sec(T.tecnica, T.fallimento, { bpm: 92, arp: 38, mel: 48, keep: 0.9, bass: 44, pulse: 26 });
  sec(T.fallimento, T.oggi, { bpm: 72, arp: 30, mel: 44, keep: 0.8, str: 38, bass: 38 });
  sec(T.oggi, T.finale, { bpm: 92, arp: 42, mel: 54, keep: 1, str: 42, bass: 48, pulse: 30 });

  // finale: accordo di Re maggiore aperto
  const F = T.finale;
  [38, 50, 57, 62, 66, 69].forEach((m, j) => strings(mix, m, { t: F, dur: 3.2, vel: 46, gain: BODY * 0.8, pan: (j - 2.5) * 0.2, att: 0.6, seed: 30 + j }));
  [62, 66, 69, 74, 78].forEach((m, j) => piano(mix, m, { t: F + j * 0.12, dur: 3, vel: 46, gain: BODY, pan: -0.2 + j * 0.1 }));

  // ---------------------------------------------------------------- effetti discreti (tempi delle scene)
  // vortici: un filo di vento
  wind(mix, T.vortici, T.tecnica, { power: 0.15, fade: 1.5, center: 700, seed: 19 });
  // passaggi verso la clinica e verso il quadro intero
  swell(mix, T.ospedale + 0.2, 1.2, { vel: 26 });
  swell(mix, T.oggi + 0.3, 1.4, { vel: 28 });
};
