// Colonna sonora originale della Grande onda di Kanagawa: pianoforte, archi, arpa (al posto del koto) e grancassa
// morbida, campionati (VSCO-2 CE), discreti sotto la voce. Il tema usa una scala pentatonica di Re (re, mi, sol, la, si)
// che evoca il Giappone senza imitare brani esistenti; sale e scende come il mare.
// Più teso sull'onda, sulle barche e sugli artigli di schiuma, sospeso sul Fuji, si apre nel finale.
// Un solo tempo (88 bpm) per tutto il video. Mare registrato (archivio CC0, scripts/audio/effetti.mjs).
import { rng, drum } from './synth.mjs';
import { suona, archi, colpo, crescendo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte', 'violini', 'viole', 'celli', 'contrabbasso', 'contrabbasso_pizz', 'arpa', 'grancassa', 'piatto_sospeso'];
export const effetti = ['onde'];
/** Sala raccolta e luminosa. */
export const sala = { rt60: 2.4, brillo: 7000, predelay: 0.025, wet: 0.5 };

const BPM = 88;
const GRID = (4 * 60) / BPM;
const snap = (t) => Math.round(t / GRID) * GRID;

// ---------------------------------------------------------------- strumenti (campionati)

const piano = (mix, m, { t, dur = 1.5, vel = 60, pan = 0, rev = 0.55, gain = 1 }) =>
  suona(mix, 'pianoforte', m, { t, dur: Math.min(dur, 4), vel: vel * 1.1, pan, rev, gain: gain * 4, release: 0.5 });

const strings = (mix, m, { t, dur, vel = 40, pan = 0, rev = 0.65, gain = 1, att = 1.4, seed = 1 }) =>
  archi(mix, m, { t, dur, vel: vel + 8, pan, rev, gain: gain * 1.4, attack: att, release: 1.6, seed });

/** Corda pizzicata (era il koto sintetico): arpa. */
const koto = (mix, m, { t, dur, vel, pan = 0.3, rev = 0.45, seed = 1 }) =>
  suona(mix, 'arpa', m, { t, dur, vel: vel * 1.4, pan, rev, gain: 1.6, release: 0.8, seed });

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
    from = snap(from); to = snap(to);
    const beat = 60 / BPM, bar = 4 * beat, loop = 16 * beat;
    const R = rng(6100 + sid++ * 113);
    for (let L0 = from; L0 < to - 0.2; L0 += loop) {
      for (let b = 0; b < 4; b++) {
        const t = L0 + b * bar;
        if (t >= to - 0.3) break;
        const [root, iv] = CHORDS[b];
        const d = Math.min(bar * 1.02, to - t);
        if (o.bass) suona(mix, 'contrabbasso_pizz', root, { t, dur: bar * 0.9, vel: o.bass * 1.6, pan: -0.1, gain: 1.6, rev: 0.2, release: 0.3 });
        if (o.str) iv.forEach((v, j) => strings(mix, root + 12 + v, { t: t + j * 0.05, dur: d, vel: o.str, gain: BODY * 0.7, pan: (j - 1) * 0.35, seed: j + 3 }));
        if (o.koto) [0, iv[1], iv[2], 12 + iv[1], 24, 12 + iv[1], iv[2], iv[1]].forEach((v, e) => {
          const te = t + e * beat * 0.5;
          if (te < to - 0.2) koto(mix, root + 24 + v, { t: te, dur: beat * 0.7, vel: o.koto * (e % 2 ? 0.8 : 1), seed: e + b });
        });
        if (o.taiko) {
          colpo(mix, 'grancassa', o.taiko > 40 ? 'bdrum_p' : 'bdrum_pp', { t, vel: 110, gain: 0.8, rev: 0.35, seed: b });
          if (t + 2.5 * beat < to - 0.2) colpo(mix, 'grancassa', 'bdrum_pp', { t: t + 2.5 * beat, vel: 100, gain: 0.7, rev: 0.35, seed: b + 7 });
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
  sec(0, T.hokusai, { koto: 40, mel: 50, keep: 1, str: 40, bass: 48, taiko: 40 });
  // Hokusai e la serie: calmo, pizzicato e pianoforte
  sec(T.hokusai, T['due-montagne'], { koto: 36, mel: 46, keep: 0.9, bass: 40 });
  // due montagne: sospeso
  sec(T['due-montagne'], T.barche, { mel: 42, keep: 0.7, oct: 12, str: 36 });
  // barche, artigli, tsunami: teso, tamburo
  sec(T.barche, T.blu, { koto: 44, mel: 50, keep: 1, str: 44, bass: 50, taiko: 46 });
  // il blu e la stampa: più leggero
  sec(T.blu, T.europa, { koto: 38, mel: 46, keep: 0.9, str: 30, bass: 42, taiko: 22 });
  // il viaggio in Europa: si apre
  sec(T.europa, T.oggi, { koto: 38, mel: 50, keep: 1, str: 42, bass: 46, taiko: 26 });
  // Hokusai a cent'anni: raccolto, poi la domanda
  sec(T.oggi, T.finale, { koto: 30, mel: 46, keep: 0.9, str: 38, bass: 38 });

  // finale: accordo aperto di Re, pizzicato che sale
  const F = snap(T.finale); // sulla griglia, dove finisce l'ultima sezione
  [38, 50, 57, 64, 69].forEach((m, j) => strings(mix, m, { t: F, dur: 3.2, vel: 44, gain: BODY * 0.8, pan: (j - 2) * 0.2, att: 0.6, seed: 30 + j }));
  [62, 64, 67, 69, 71, 74].forEach((m, j) => koto(mix, m + 12, { t: F + 0.15 + j * 0.14, dur: 1.5, vel: 46, pan: -0.3 + j * 0.12, rev: 0.5, seed: j }));

  // ---------------------------------------------------------------- effetti discreti (tempi delle scene)
  // il mare sotto le scene dell'onda (onde e spruzzi registrati, tenuti bassi)
  clip(mix, 'onde', { t: 0, da: 1, durata: T.hokusai, gain: 0.22, fadeIn: 1.5, fadeOut: 1.5, largo: 3, rev: 0.1 });
  clip(mix, 'onde', { t: T.barche, da: 14, durata: T.blu - T.barche, gain: 0.26, fadeIn: 1.5, fadeOut: 1.5, largo: 3, rev: 0.1 });
  // la cresta che si chiude sugli artigli
  crescendo(mix, C('artigli', 1) + 0.6, 1.4, { gain: 0.45 });
};
