// Colonna sonora originale della Notte stellata: elegante e luminosa, in Re maggiore, discreta sotto la voce.
// Pianoforte in arpeggi che girano su sé stessi come i vortici, archi leggeri, contrabbasso pizzicato (campionati,
// VSCO-2 CE) e una pulsazione discreta di spazzole. Più raccolta (senza pulsazione) quando Vincent sta male e quando
// il quadro non gli piace; si apre nel finale. Il tema è inventato qui. Un solo tempo (92 bpm) per tutto il video.
// Pochi effetti, agganciati ai riquadri delle scene.
import { rng, drum } from './synth.mjs';
import { suona, archi, colpo, crescendo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte', 'violini', 'viole', 'celli', 'contrabbasso', 'contrabbasso_pizz', 'grancassa', 'piatto_sospeso'];
export const effetti = ['vento_leggero'];
/** Sala raccolta e calda. */
export const sala = { rt60: 2.3, brillo: 6500, predelay: 0.025, wet: 0.5 };

const BPM = 92;
const GRID = (4 * 60) / BPM;

// ---------------------------------------------------------------- strumenti (campionati)

const piano = (mix, m, { t, dur = 1.5, vel = 60, pan = 0, rev = 0.5, gain = 1 }) =>
  suona(mix, 'pianoforte', m, { t, dur: Math.min(dur, 4), vel: vel * 1.1, pan, rev, gain: gain * 4, release: 0.5 });

const strings = (mix, m, { t, dur, vel = 40, pan = 0, rev = 0.6, gain = 1, att = 1.2, seed = 1 }) =>
  archi(mix, m, { t, dur, vel: vel + 8, pan, rev, gain: gain * 1.4, attack: att, release: 1.4, seed });

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
  // griglia che parte dalla fine della copertina, come `griglia` delle scene
  const T0 = T['colpo-d-occhio'];
  const snap = (t) => T0 + Math.round((t - T0) / GRID) * GRID;
  const BODY = 0.8;
  let sid = 0;

  /**
   * Il tema ciclico da `from` a `to`.
   * arp: arpeggio in crome al pianoforte · mel: tema (pianoforte, ottava sopra) · keep: probabilità di ogni nota
   * str: archi · bass: contrabbasso · pulse: spazzole e cassa morbida
   */
  const sec = (from, to, o) => {
    from = snap(from); to = snap(to);
    const beat = 60 / BPM, bar = 4 * beat, loop = 16 * beat;
    const R = rng(5000 + sid++ * 113);
    for (let L0 = from; L0 < to - 0.2; L0 += loop) {
      for (let b = 0; b < 4; b++) {
        const t0 = L0 + b * bar;
        if (t0 >= to - 0.3) break;
        if (t0 + bar <= 0) continue;
        const t = Math.max(0, t0); // la prima battuta comincia prima dell'inizio del video: parte da 0
        const [root, iv] = CHORDS[b];
        const d = Math.min(bar * 1.02 - (t - t0), to - t);
        if (o.bass) suona(mix, 'contrabbasso_pizz', root, { t, dur: bar * 0.9, vel: o.bass * 1.6, pan: -0.1, gain: 1.6, rev: 0.2, release: 0.3 });
        if (o.str) iv.concat([12]).forEach((v, j) => strings(mix, root + 12 + v + (j === 3 ? 12 : 0), { t: t + j * 0.04, dur: d, vel: o.str, gain: BODY * 0.7, pan: (j - 1.5) * 0.3, seed: j + 3 }));
        if (o.arp) {
          const figura = [0, iv[1], iv[2], 12, iv[2] + 12, 12, iv[2], iv[1]];
          figura.forEach((v, e) => {
            const te = t0 + e * beat * 0.5;
            if (te >= 0 && te < to - 0.2) piano(mix, root + 24 + v, { t: te, dur: beat * 0.9, vel: o.arp * (e % 2 ? 0.82 : 1), gain: BODY, pan: -0.25 + (e % 4) * 0.12 });
          });
        }
        if (o.pulse) for (let q = 0; q < 4; q++) {
          const tq = t0 + q * beat;
          if (tq >= to - 0.2) break;
          if (tq < 0) continue;
          drum(mix, 'brushtap', tq + beat * 0.5, o.pulse * 0.8);
          if (q === 1 || q === 3) drum(mix, 'swish', tq, o.pulse);
          if (q === 0) colpo(mix, 'grancassa', 'bdrum_pp', { t: tq, vel: 90, gain: 0.7, rev: 0.3, seed: b });
        }
      }
      if (!o.mel) continue;
      for (const [b, m, d] of THEME) {
        const t = L0 + b * beat;
        if (t >= to - 0.2 || R() > o.keep || t < 0) continue;
        piano(mix, m + (o.oct ?? 0), { t, dur: Math.min(d * beat * 1.1, to - t), vel: o.mel * (0.92 + R() * 0.16), gain: BODY * 1.15, pan: 0.08, rev: 0.6 });
      }
    }
  };

  // ---- sezioni (tempi dai capitoli del JSON)
  sec(0, T.arles, { arp: 36, mel: 48, keep: 1, str: 30, bass: 46, pulse: 30 });
  sec(T.arles, C('arles', 2), { arp: 38, mel: 48, keep: 0.9, bass: 44, pulse: 26 });
  sec(C('arles', 2), T.ospedale, { arp: 24, mel: 34, keep: 0.5, str: 30, bass: 30 });
  sec(T.ospedale, T.villaggio, { arp: 36, mel: 46, keep: 0.8, str: 32, bass: 42, pulse: 22 });
  sec(T.villaggio, T.vortici, { arp: 40, mel: 50, keep: 1, str: 30, bass: 46, pulse: 28 });
  sec(T.vortici, T.tecnica, { arp: 44, mel: 52, keep: 1, str: 38, bass: 48, pulse: 34 });
  sec(T.tecnica, T.fallimento, { arp: 38, mel: 48, keep: 0.9, bass: 44, pulse: 26 });
  sec(T.fallimento, C('fallimento', 2), { arp: 22, mel: 36, keep: 0.7, str: 32, bass: 30 });
  sec(C('fallimento', 2), T.oggi, { mel: 34, keep: 0.5, str: 34, bass: 28 }); // «Muore l'anno dopo»: niente arpeggio
  sec(T.oggi, T.finale, { arp: 46, mel: 58, keep: 1, str: 48, bass: 50, pulse: 32 });

  // finale: accordo di Re maggiore aperto
  const F = snap(T.finale); // sulla griglia, dove finisce l'ultima sezione
  [38, 50, 57, 62, 66, 69].forEach((m, j) => strings(mix, m, { t: F, dur: 4.8, vel: 46, gain: BODY * 0.8, pan: (j - 2.5) * 0.2, att: 0.6, seed: 30 + j }));
  [62, 66, 69, 74, 78].forEach((m, j) => piano(mix, m, { t: F + j * (60 / BPM / 4), dur: 3, vel: 46, gain: BODY, pan: -0.2 + j * 0.1 }));
  [62, 74].forEach((m, j) => piano(mix, m, { t: F + GRID + j * (60 / BPM / 2), dur: 3, vel: 40, gain: BODY, pan: 0.1 }));

  // fallimento: tre anelli sulle stelle «troppo grandi», uno per croma (come in index.tsx: griglia(cues[1] + 0.3))
  const G = (t, div = 2) => T0 + Math.round((t - T0) / (60 / BPM / div)) * (60 / BPM / div);
  const ANELLI = G(C('fallimento', 1) + 0.3);
  [86, 90, 93].forEach((m, i) => piano(mix, m, { t: ANELLI + i * (30 / BPM), dur: 1.4, vel: 30, gain: BODY, pan: -0.2 + i * 0.2, rev: 0.6 }));

  // ---------------------------------------------------------------- effetti discreti (tempi delle scene)
  // vortici: un filo di vento registrato
  clip(mix, 'vento_leggero', { t: T.vortici, da: 0.2, durata: T.tecnica - T.vortici, gain: 0.08, fadeIn: 1.5, fadeOut: 1.5, largo: 4 });
  // passaggi verso la clinica e verso il quadro intero: crescendo di piatto sospeso
  crescendo(mix, T.ospedale, 1.5, { gain: 0.3 });
  crescendo(mix, snap(T.oggi), 1.4, { gain: 0.3 }); // culmina sul cambio di sezione (il secondo argomento è la fine del rullo)
};
