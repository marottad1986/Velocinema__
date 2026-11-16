// Colonna sonora dello Short promozionale «Dark, tutta la serie» (promo/canale-youtube-dark.json), stessa famiglia
// sonora del video lungo e delle tre stagioni: bordoni di celli e contrabbasso, archi, pianoforte e glockenspiel
// campionati VSCO-2 CE, grancassa VCSL, ticchettio d'orologio e lo stesso motivo inventato del cerchio (Do, Mi bemolle,
// Re, Sol). 66 bpm su una griglia continua da 0: gli eventi cadono sulla croma, come i g() della scena
// (src/promo/canale-youtube-dark/Scena.tsx), che usa le stesse formule.
// Copertina: pioggia, orologio e motivo del cerchio, campanelle che scendono con le lancette all'indietro.
// Canale: il filo che scende (archi), una campanella per tappa, i due mondi (grancassa piano e motivo allo specchio), il colpo del finale con un
// battito di silenzio. Chiusura: il motivo in maggiore; il clic del pulsante e la campanella che suona.
// T: inizio di ogni parte (s) e T.frase(id, n) = inizio della frase n della parte.
import { put, rng, FX } from './synth.mjs';
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';

export const strumenti = ['pianoforte', 'violini', 'viole', 'celli', 'contrabbasso', 'glockenspiel', 'grancassa'];
export const effetti = ['scatti', 'rombo', 'pioggia_dura', 'passaggio'];
/** Sala scura e chiusa, come nelle stagioni di Dark. */
export const sala = { rt60: 2.6, brillo: 5000, predelay: 0.025, wet: 0.5 };

const TAU = Math.PI * 2;
const SR = 44100;
const vamp = (v) => (v / 127) ** 1.6;
const BPM = 66;
const BEAT = 60 / BPM;
const BEAT_ = BEAT / 2;
const croma = (t) => Math.round(t / BEAT_) * BEAT_;
const battito = (t) => Math.round(t / BEAT) * BEAT;

const drone = (mix, m, { t, dur, vel = 40, gain = 1, seed = 1 }) =>
  suona(mix, m < 40 ? 'contrabbasso' : 'celli', m, { t, dur, vel: vel + 14, gain: gain * 1.6, attack: 2, release: 2, rev: 0.6, seed });
const strings = (mix, m, { t, dur, vel = 40, pan = 0, gain = 1, att = 1.2, seed = 1 }) =>
  archi(mix, m, { t, dur, vel: vel + 8, pan, rev: 0.65, gain: gain * 1.4, attack: att, release: 1.4, seed });
const bell = (mix, m, { t, vel = 46, pan = 0, gain = 1 }) =>
  suona(mix, 'glockenspiel', m - 12, { t, dur: 2.5, vel: vel * 1.3, pan, rev: 0.75, gain: gain * 0.34, release: 1.5 });
const motif = (mix, m, { t, dur, vel }) =>
  suona(mix, 'pianoforte', m, { t, dur: Math.min(dur, 4), vel: vel * 1.2, pan: 0.15, rev: 0.6, gain: 4, release: 0.6 });
const tick = (mix, t, { vel = 34, tac = false } = {}) => {
  const f = tac ? 2600 : 3400;
  const r = rng(Math.round(t * 1000));
  put(mix, t, Math.ceil(0.03 * SR), (i) => {
    const x = i / SR;
    return (Math.sin(TAU * f * x) * 0.6 + (r() * 2 - 1) * 0.4) * Math.exp(-x / 0.004);
  }, { gain: FX * vamp(vel) * 0.3, pan: tac ? -0.2 : 0.2, rev: 0.15 });
};

const MOTIF = [[0, 72, 2], [2, 75, 2], [4, 74, 2], [6, 67, 2]];
const MOTIF_SPECCHIO = MOTIF.map(([b, m, l]) => [b, 144 - m, l]);
const MOTIF_MAGG = [[0, 72, 2], [2, 76, 2], [4, 74, 2], [6, 69, 2]];
const CHORDS = [[48, [0, 3, 7]], [44, [0, 4, 7]], [41, [0, 3, 7]], [43, [0, 5, 7]]];
const CHORDS_MAGG = [[48, [0, 4, 7]], [41, [0, 4, 7]], [45, [0, 3, 7]], [43, [0, 4, 7]]];

export default (mix, T) => {
  let sid = 0;
  /** Una sezione da `from` a `to` (sul battito): bordone, archi, motivo del cerchio, ticchettio. */
  const sec = (from, to, o) => {
    const bar = 4 * BEAT;
    const R = rng(7300 + sid++ * 131);
    const chords = o.magg ? CHORDS_MAGG : CHORDS;
    const mot = o.magg ? MOTIF_MAGG : MOTIF;
    const zitto = (t) => o.tace && t >= o.tace[0] && t < o.tace[1];
    if (o.drone) {
      drone(mix, 36, { t: from, dur: to - from, vel: o.drone, gain: 0.7, seed: sid });
      drone(mix, 43, { t: from, dur: to - from, vel: o.drone * 0.8, gain: 0.5, seed: sid + 50 });
    }
    for (let k = 0, t = from; t < to - 0.3; k++, t += bar) {
      const [root, iv] = chords[k % 4];
      const d = Math.min(bar * 1.02, to - t);
      if (o.str && !zitto(t)) iv.forEach((v, j) => strings(mix, root + 12 + v, { t: t + j * 0.04, dur: d, vel: o.str, gain: 0.6, pan: (j - 1) * 0.35, seed: j + k }));
      if (o.ticks) for (let b = 0; b < 4; b++) if (t + b * BEAT < to && !zitto(t + b * BEAT)) tick(mix, t + b * BEAT, { vel: o.ticks, tac: b % 2 === 1 });
      if (o.mel && k % 2 === 0) {
        for (const [b, m, len] of mot) {
          const tt = t + b * BEAT;
          if (tt >= to - 0.2 || zitto(tt) || R() > (o.keep ?? 1)) continue;
          motif(mix, m + (o.oct ?? 0), { t: tt, dur: Math.min(len * BEAT, to - tt), vel: o.mel });
        }
      }
    }
  };

  // ---- eventi, con le stesse formule della scena
  const c = (n) => T.frase('canale', n);
  const h = (n) => T.frase('chiusura', n);
  const eTag = croma(c(1) + 0.2);
  const eS1 = croma(c(2) + 0.35); // «grotta»
  const eS2 = croma(c(2) + 2.8); // «famiglia annodata»
  const eS3 = croma(c(2) + 4.25); // «due mondi»
  const eFin = croma(c(3) + 0.4); // «capitolo nuovo sul finale»
  const eScr = croma(T.chiusura + 0.1);
  const eLike = croma(h(0) + 1.0);
  const eIscr = croma(h(0) + 2.4);
  const eBell = croma(h(1) + 0.6); // «non perdi»
  const eComm = croma(h(2) + 0.2);

  // ================================================================ copertina (0–4 s): la domanda, sotto la pioggia
  clip(mix, 'pioggia_dura', { t: 0, da: 1.5, durata: 13, gain: 0.4, fadeIn: 0.02, fadeOut: 3, largo: 2, rev: 0.12 });
  const A1 = battito(T.canale);
  sec(0, A1, { drone: 42, mel: 34, ticks: 30 });
  // lancette che corrono all'indietro: campanelle che scendono veloci
  [84, 82, 79, 77, 75, 72, 70, 67].forEach((m, k) => bell(mix, m, { t: croma(0.6) + k * BEAT_ / 2, vel: 30 - k * 1.5, pan: 0.4 - k * 0.1 }));

  // ================================================================ canale (4–21,5 s): il filo che scende, le tappe
  const A2 = Math.floor(eFin / BEAT) * BEAT; // la sezione finisce prima del colpo: il colpo esce dal silenzio
  sec(A1, A2, { drone: 40, str: 32, mel: 36, ticks: 24 });
  // il cartellino del canale: una frusciata e tre campanelle che salgono
  clip(mix, 'passaggio', { t: eTag - 0.3, da: 12.27, durata: 1.6, gain: 0.22, fadeOut: 0.6, rev: 0.4 });
  [67, 72, 79].forEach((m, k) => bell(mix, m, { t: eTag + k * BEAT_, vel: 30, pan: -0.2 + k * 0.2 }));
  // una campanella per tappa; la grotta con il suo passaggio, i due mondi con il vetro e il motivo allo specchio
  clip(mix, 'passaggio', { t: eS1 - 0.3, da: 12.27, durata: 1.4, gain: 0.16, fadeOut: 0.6, rev: 0.4 });
  bell(mix, 67, { t: eS1, vel: 40, pan: -0.35 });
  [72, 75].forEach((m, k) => bell(mix, m, { t: eS2 + k * BEAT_ / 2, vel: 38, pan: 0.35 }));
  bell(mix, 79, { t: eS3, vel: 40, pan: -0.35 });
  colpo(mix, 'grancassa', 'bdrum_pp', { t: eS3, vel: 100, gain: 0.6, rev: 0.5 });
  MOTIF_SPECCHIO.forEach(([, m], k) => bell(mix, m + 12, { t: eS3 + 2 * BEAT_ + k * BEAT_ / 2, vel: 26, pan: 0.3 }));
  // il finale spiegato: colpo forte e un battito di silenzio, poi il motivo in maggiore
  colpo(mix, 'grancassa', 'bdrum_f', { t: eFin, vel: 127, gain: 0.45, rev: 0.6 });
  clip(mix, 'rombo', { t: eFin, da: 31, durata: 2.4, gain: 0.26, fadeIn: 0.05, fadeOut: 1.2, largo: 3 });
  const A3 = battito(eFin + 2 * BEAT);
  [36, 48, 55, 60, 64, 67].forEach((m, j) => strings(mix, m, { t: A3, dur: battito(T.chiusura) - A3 + 0.4, vel: 38, gain: 0.55, pan: (j - 2.5) * 0.2, att: 0.6, seed: 80 + j }));

  // ================================================================ chiusura (21,5–30 s): lettore, pulsanti, campanella
  // il motivo in maggiore entra con lo schermo che si accende; la sezione si ferma dove entra l'accordo finale di Do
  const A4 = battito(T.chiusura);
  const AF = Math.floor(eComm / BEAT) * BEAT;
  sec(A4, AF, { drone: 34, str: 28, mel: 32, magg: true });
  // la barra di ricerca che scrive «In 2 Minuti» (scena: da eScr + 1,6 a eScr + 2,6): tasti leggerissimi
  [0, 1, 2].forEach((k) => clip(mix, 'scatti', { t: eScr + 1.6 + k * BEAT_ / 2, da: 6.49, durata: 0.08, gain: 0.05, rev: 0.1 }));
  [60, 67, 72].forEach((m, k) => bell(mix, m + 12, { t: eScr + k * BEAT_, vel: 30, pan: 0.2 })); // lo schermo si accende
  bell(mix, 76, { t: eLike, vel: 32, pan: -0.3 }); // metti like
  clip(mix, 'scatti', { t: eIscr, da: 6.49, durata: 0.1, gain: 0.2, rev: 0.15 }); // il clic su «iscriviti»
  bell(mix, 84, { t: eIscr + BEAT_ / 2, vel: 36, pan: 0.3 });
  // la campanella che suona: un trillo breve
  [84, 88, 84, 88, 84].forEach((m, k) => bell(mix, m, { t: eBell + k * BEAT_ / 5, vel: 34 - k * 3, pan: 0.25 }));
  bell(mix, 79, { t: eComm, vel: 30, pan: -0.2 }); // commenta
  // ultimo accordo tenuto fino alla fine, il motivo che non si chiude
  [48, 55, 60, 64].forEach((m, j) => strings(mix, m, { t: AF, dur: T.END - AF, vel: 32, gain: 0.5, pan: (j - 1.5) * 0.25, att: 1.0, seed: 90 + j }));
};
