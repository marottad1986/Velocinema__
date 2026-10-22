// Colonna sonora originale della Notte stellata: allegra e luminosa, in Re maggiore, discreta sotto la voce.
// Pizzicati, vibrafono, contrabbasso e percussioni leggere; il tema (4 battute in 4/4, crome che salgono e
// girano su sé stesse come i vortici) è inventato qui. Più tenero e senza ritmo quando Vincent sta male e quando
// il quadro non gli piace, poi riparte in festa. Un "pop" a ogni scheda disegnata che compare.
// Effetti agganciati agli schizzi delle scene in src/scenes/notte-stellata/.
import { note, drum, pop, swell, whoosh, wind } from './synth.mjs';
import { loadFilm, timeline } from './film.mjs';

const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

// tema: [tempo, nota MIDI, durata in tempi]; Re · Sol · Si minore · La
const THEME = [
  [0, 74, 0.5], [0.5, 78, 0.5], [1, 81, 0.5], [1.5, 78, 0.5], [2, 76, 1], [3, 74, 1],
  [4, 74, 0.5], [4.5, 79, 0.5], [5, 83, 0.5], [5.5, 79, 0.5], [6, 81, 1], [7, 79, 1],
  [8, 74, 0.5], [8.5, 78, 0.5], [9, 83, 0.5], [9.5, 78, 0.5], [10, 81, 0.5], [10.5, 79, 0.5], [11, 78, 0.5], [11.5, 76, 0.5],
  [12, 76, 1], [13, 73, 0.5], [13.5, 76, 0.5], [14, 78, 1], [15, 76, 1],
];
// accordi per battuta: radice MIDI (ottava del basso) e intervalli
const CHORDS = [[38, [0, 4, 7]], [43, [0, 4, 7]], [47, [0, 3, 7]], [45, [0, 4, 7]]];

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

  /**
   * Il tema ciclico da `from` a `to`.
   * mel: vibrafono (livello) · keep: probabilità di ogni nota · oct: trasposizione
   * pluck: arpeggio pizzicato · bass: contrabbasso · groove: percussioni (0 = niente) · ep: piano elettrico (accordi tenuti)
   */
  let sid = 0;
  const sec = (from, to, o) => {
    const beat = 60 / o.bpm, bar = 4 * beat, loop = 16 * beat;
    let k = sid++ * 7;
    const keep = () => ((k = (k * 16807 + 11) % 2147483647) / 2147483647) < o.keep;
    for (let L0 = from; L0 < to - 0.2; L0 += loop) {
      for (let b = 0; b < 4; b++) {
        const t = L0 + b * bar;
        if (t >= to - 0.3) break;
        const [root, iv] = CHORDS[b];
        const left = to - t;
        if (o.bass) {
          note(mix, 'upright', mtof(root), { t, dur: beat * 1.6, vel: o.bass, pan: -0.1 });
          if (t + 2 * beat < to - 0.2) note(mix, 'upright', mtof(root + 7), { t: t + 2 * beat, dur: beat * 1.4, vel: o.bass * 0.9, pan: -0.1 });
        }
        if (o.ep) iv.forEach((v, j) => note(mix, 'epiano', mtof(root + 24 + v), { t, dur: Math.min(bar, left), vel: o.ep, pan: (j - 1) * 0.25, rev: 0.4 }));
        if (o.pluck) for (let e = 0; e < 8; e++) {
          const te = t + e * beat * 0.5;
          if (te >= to - 0.2) break;
          const m = root + 24 + [0, iv[1], iv[2], 12][e % 4];
          note(mix, 'pluck', mtof(m), { t: te, dur: beat * 0.6, vel: o.pluck * (e % 2 ? 0.8 : 1), pan: 0.25, rev: 0.3, seed: e });
        }
        if (o.groove) for (let q = 0; q < 8; q++) {
          const tq = t + q * beat * 0.5;
          if (tq >= to - 0.2) break;
          drum(mix, 'shaker', tq, o.groove * (q % 2 ? 0.7 : 1));
          if (q === 0 || q === 5) drum(mix, 'softkick', tq, o.groove * 1.2);
          if (q === 2 || q === 6) drum(mix, 'sidestick', tq, o.groove * 0.9);
        }
      }
      if (!o.mel) continue;
      for (const [b, m, d] of THEME) {
        const t = L0 + b * beat;
        if (t >= to - 0.2 || !keep()) continue;
        note(mix, 'vibes', mtof(m + (o.oct ?? 0)), { t, dur: Math.min(d * beat * 1.4, to - t), vel: o.mel, pan: 0.05, rev: 0.35 });
      }
    }
  };

  // ---- sezioni (tempi dai capitoli del JSON)
  // copertina e primo sguardo: si parte in festa
  sec(0, T.arles, { bpm: 112, mel: 56, keep: 1, pluck: 44, bass: 52, groove: 40 });
  // Arles: allegro col sole, poi tenero quando sta male
  sec(T.arles, C('arles', 2), { bpm: 112, mel: 52, keep: 0.9, pluck: 40, bass: 48, groove: 34 });
  sec(C('arles', 2), T.ospedale, { bpm: 84, mel: 44, keep: 0.6, ep: 40, bass: 40 });
  // ospedale: il coraggio, il ritmo torna piano piano
  sec(T.ospedale, T.finestra, { bpm: 100, mel: 48, keep: 1, ep: 34, pluck: 36, bass: 44, groove: 24 });
  // finestra: sospeso e curioso
  sec(T.finestra, T.villaggio, { bpm: 100, mel: 42, keep: 0.7, oct: 12, pluck: 34, bass: 40, groove: 22 });
  // villaggio, cipresso, Venere: il tema pieno
  sec(T.villaggio, T.venere, { bpm: 112, mel: 54, keep: 1, pluck: 42, bass: 50, groove: 38 });
  sec(T.venere, T.vortici, { bpm: 112, mel: 52, keep: 1, oct: 12, pluck: 40, bass: 48, groove: 34 });
  // vortici: il più mosso
  sec(T.vortici, T.tecnica, { bpm: 120, mel: 56, keep: 1, pluck: 46, bass: 52, groove: 44 });
  // tecnica: leggero
  sec(T.tecnica, T.fallimento, { bpm: 112, mel: 50, keep: 0.9, pluck: 40, bass: 46, groove: 32 });
  // non gli piaceva: tenero, senza ritmo
  sec(T.fallimento, T.oggi, { bpm: 80, mel: 44, keep: 0.8, ep: 40, bass: 38 });
  // oggi: si riparte in festa
  sec(T.oggi, T.finale, { bpm: 116, mel: 58, keep: 1, pluck: 46, bass: 54, groove: 46 });

  // finale: accordo di Re maggiore con un ultimo giro di vibrafono
  const F = T.finale;
  [50, 54, 57, 62, 66].forEach((m, j) => note(mix, 'epiano', mtof(m), { t: F, dur: 3.2, vel: 46, pan: (j - 2) * 0.2, rev: 0.5 }));
  [74, 78, 81, 86].forEach((m, j) => note(mix, 'vibes', mtof(m), { t: F + 0.2 + j * 0.18, dur: 2.5, vel: 50, pan: -0.3 + j * 0.2, rev: 0.5 }));
  note(mix, 'upright', mtof(38), { t: F, dur: 2, vel: 54 });

  // ---------------------------------------------------------------- effetti (tempi degli schizzi nelle scene)
  // capitolo 1: la freccia che gira, le scintille
  whoosh(mix, T['colpo-d-occhio'] + 0.7, 0.8, { vel: 34, lo: 600, hi: 2400 });
  [0, 1, 2, 3, 4].forEach((i) => pop(mix, C('colpo-d-occhio', 2) + i * 0.25, 30, { pitch: 7 + i * 2, pan: -0.4 + i * 0.2 }));
  // Arles: mappa, sole, nuvola col tuono leggero
  pop(mix, T.arles + 0.15, 40);
  pop(mix, C('arles', 1), 36, { pitch: 5 });
  swell(mix, C('arles', 2) + 0.4, 0.9, { vel: 30 });
  // ospedale: cuore, clinica, tele
  pop(mix, T.ospedale + 0.9, 36, { pitch: 7 });
  pop(mix, C('ospedale', 1), 40);
  pop(mix, C('ospedale', 2), 40, { pitch: 3 });
  // finestra: schede
  pop(mix, C('finestra', 1), 40);
  pop(mix, C('finestra', 2), 40, { pitch: 3 });
  // villaggio: scheda delle chiese, cuore
  pop(mix, C('villaggio', 1) + 1.2, 40);
  pop(mix, C('villaggio', 2) + 0.2, 34, { pitch: 7 });
  // cipresso: freccia lungo l'albero, scheda della fiamma
  whoosh(mix, C('cipresso', 1) + 0.2, 1.4, { vel: 34, lo: 300, hi: 3000 });
  pop(mix, C('cipresso', 2), 40);
  // Venere: «pianeta Venere!», scheda dei pianeti
  pop(mix, C('venere', 1), 36, { pitch: 7 });
  pop(mix, C('venere', 2), 40);
  // vortici: il vento e la tazza
  wind(mix, T.vortici, T.tecnica, { power: 0.18, fade: 1.5, center: 700, seed: 19 });
  pop(mix, C('vortici', 3), 40);
  // tecnica: schede
  pop(mix, C('tecnica', 1), 40);
  pop(mix, C('tecnica', 2), 40, { pitch: 3 });
  // oggi: museo, scintille, cuori
  pop(mix, T.oggi + 0.4, 40);
  [0, 1, 2, 3, 4].forEach((i) => pop(mix, C('oggi', 3) + i * 0.18, 32, { pitch: 5 + i * 2, pan: -0.4 + i * 0.2 }));
};
