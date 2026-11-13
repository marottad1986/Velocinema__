// Colonna sonora delle parti NUOVE del video lungo «Dark, tutta la serie» (VIDEO-LUNGO.md): aggancio, «Il finale
// spiegato» e chiusura. Le tre stagioni riusano la loro musica (out/dark-stagione-N-musica.wav), posata da
// scripts/lunghi/render.mjs sulla stessa griglia: qui si scrive solo nei tratti nuovi, il resto resta in silenzio.
// Stessa famiglia sonora delle stagioni (bordoni di celli e contrabbasso, archi, pianoforte e glockenspiel campionati
// VSCO-2 CE, grancassa VCSL, ticchettio d'orologio) e lo stesso motivo inventato del cerchio (Do, Mi bemolle, Re, Sol).
// Aggancio: il motivo del cerchio sotto la pioggia, le lancette che corrono all'indietro. Finale spiegato: archi che si
// allargano capitolo dopo capitolo, la tenaglia di Adam ed Eva a passo doppio, il silenzio e un solo accordo maggiore
// quando il nodo si scioglie; poi il motivo in maggiore. Chiusura: il motivo in maggiore che non si chiude.
// Effetti agganciati agli eventi delle scene in src/lunghi/dark-tutta-la-serie/ (Aggancio.tsx, Finale.tsx), sulla croma.
// T: inizio di ogni tratto (s nel video lungo) e T.frase(id, n) = inizio della frase n del tratto (come Overlay16).
import { put, rng, FX } from './synth.mjs';
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';

export const strumenti = ['pianoforte', 'violini', 'viole', 'celli', 'contrabbasso', 'glockenspiel', 'grancassa'];
export const effetti = ['scatti', 'rombo', 'pioggia_dura', 'passaggio'];
/** Sala scura e chiusa, come nelle tre stagioni. */
export const sala = { rt60: 2.6, brillo: 5000, predelay: 0.025, wet: 0.5 };

const TAU = Math.PI * 2;
const SR = 44100;
const vamp = (v) => (v / 127) ** 1.6;
/** Un solo tempo per tutto il video lungo: 66 bpm, come le tre stagioni (11 battiti = 10 s). */
const BPM = 66;
const BEAT = 60 / BPM;
const GRID = 4 * BEAT;
const BEAT_ = BEAT / 2;
const croma = (t) => Math.round(t / BEAT_) * BEAT_;

// ---------------------------------------------------------------- strumenti (campionati), come negli spartiti delle stagioni

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

// ---------------------------------------------------------------- materiale musicale (lo stesso delle stagioni)

const MOTIF = [[0, 72, 2], [2, 75, 2], [4, 74, 2], [6, 67, 2]];
const MOTIF_SPECCHIO = MOTIF.map(([b, m, l]) => [b, 144 - m, l]);
const MOTIF_MAGG = [[0, 72, 2], [2, 76, 2], [4, 74, 2], [6, 69, 2]];
const CHORDS = [[48, [0, 3, 7]], [44, [0, 4, 7]], [41, [0, 3, 7]], [43, [0, 5, 7]]];
const CHORDS_MAGG = [[48, [0, 4, 7]], [41, [0, 4, 7]], [45, [0, 3, 7]], [43, [0, 4, 7]]];

export default (mix, T) => {
  const at = (id, n, d = 0) => croma(T.frase(id, n) + d);
  let sid = 0;
  /** Una sezione da `from` a `to` (già sulla battuta), come negli spartiti delle stagioni; passo 'doppio' = crome. */
  const sec = (from, to, o) => {
    const beat = BEAT * (o.passo === 'meta' ? 2 : o.passo === 'doppio' ? 0.5 : 1), bar = 4 * BEAT * (o.passo === 'meta' ? 2 : 1);
    const R = rng(9100 + sid++ * 131);
    const chords = o.magg ? CHORDS_MAGG : CHORDS;
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
      if (o.pulse) for (let b = 0; b < (o.passo === 'doppio' ? 8 : 1); b++) {
        const tt = t + b * beat;
        if (tt < to - 0.1 && !zitto(tt)) colpo(mix, 'grancassa', o.pulse >= 40 && b % 2 === 0 ? 'bdrum_p' : 'bdrum_pp', { t: tt, vel: 110, gain: b % 2 ? 0.5 : 0.8, rev: 0.4, seed: k * 8 + b });
      }
      if (o.ticks) for (let b = 0; b < 4; b++) if (t + b * BEAT < to && !zitto(t + b * BEAT)) tick(mix, t + b * BEAT, { vel: o.ticks, tac: b % 2 === 1 });
      if (o.mel && k % 2 === 0) {
        for (const [b, m, len] of mot) {
          const tt = t + b * BEAT;
          if (tt >= to - 0.2 || R() > (o.keep ?? 1) || zitto(tt)) continue;
          const mm = m + (o.oct ?? 0) - (o.broken && R() > 0.5 ? 1 : 0);
          motif(mix, mm, { t: tt, dur: Math.min(len * BEAT, to - tt), vel: o.mel });
          if (o.bells) bell(mix, mm + 12, { t: tt + 0.01, vel: o.bells, pan: -0.25 });
        }
      }
    }
  };

  // ================================================================ aggancio (0–20 s), griglia da 0
  const A0 = T.aggancio;
  const S1 = T.aggancio + 20; // qui entra la musica della stagione 1 (la sua copertina)
  // la pioggia e l'orologio della miniatura, dal fotogramma 0
  clip(mix, 'pioggia_dura', { t: A0, da: 5.4, durata: 9.5, gain: 0.5, fadeIn: 0.02, fadeOut: 2.5, largo: 3, rev: 0.12 });
  // prima frase (la domanda): bordone e motivo del cerchio, l'orologio che scatta a ogni battito
  sec(A0, A0 + 2 * GRID, { drone: 42, mel: 34, ticks: 30 });
  // le lancette che corrono all'indietro: campanelle che scendono veloci, e la stanza che si apre
  [84, 82, 79, 77, 75, 72, 70, 67].forEach((m, k) => bell(mix, m, { t: at('aggancio', 1, 0.3) + k * BEAT_ / 2, vel: 30 - k * 1.5, pan: 0.4 - k * 0.1 }));
  sec(A0 + 2 * GRID, A0 + 5 * GRID, { drone: 40, str: 34, mel: 38, ticks: 26 });
  // la grotta e i 33 anni
  clip(mix, 'passaggio', { t: at('aggancio', 2, 0.2) - 0.3, da: 12.27, durata: 1.6, gain: 0.24, fadeOut: 0.6, rev: 0.4 });
  bell(mix, 55, { t: at('aggancio', 2, 0.7), vel: 40, pan: -0.4 });
  // la famiglia che si annoda: tre campanelle, una per cerchio, poi il filo che li lega
  [67, 72, 75].forEach((m, k) => bell(mix, m, { t: at('aggancio', 3, 0.1) + k * BEAT_, vel: 36, pan: 0.4 }));
  // i due mondi: il vetro che si incrina, poi il motivo allo specchio
  colpo(mix, 'grancassa', 'bdrum_p', { t: at('aggancio', 4, 0.1), vel: 110, gain: 0.8, rev: 0.6 });
  clip(mix, 'rombo', { t: at('aggancio', 4, 0.1), da: 31, durata: 2.2, gain: 0.22, fadeIn: 0.05, fadeOut: 1.2, largo: 3 });
  MOTIF_SPECCHIO.forEach(([, m], k) => bell(mix, m + 12, { t: at('aggancio', 4, 0.1) + 2 * BEAT_ + k * BEAT_, vel: 32, pan: 0.3 }));
  // il filo giallo verso «Winden, 2019», poi l'ultimo battito tace prima della stagione 1
  [60, 63, 67, 72].forEach((m, k) => bell(mix, m + 12, { t: at('aggancio', 5, 0.4) + k * BEAT_, vel: 30 + k * 2, pan: -0.3 }));
  bell(mix, 72, { t: at('aggancio', 5, 1.6), vel: 40 });
  strings(mix, 48, { t: A0 + 5 * GRID, dur: S1 - (A0 + 5 * GRID) - BEAT, vel: 30, gain: 0.5, att: 0.6 });
  drone(mix, 36, { t: A0 + 5 * GRID, dur: S1 - (A0 + 5 * GRID) - BEAT, vel: 36, gain: 0.6, seed: 9 });

  // ================================================================ il finale spiegato (6 × 13 s) e la chiusura
  const F0 = T.vetro; // inizia su un battito (VIDEO-LUNGO.md): le battute partono da qui
  const bar = (t) => F0 + Math.round((t - F0) / GRID) * GRID;
  // 1. chi ha creato il nodo: il mondo d'origine, l'incidente, la macchina che spacca il mondo
  sec(F0, bar(T.cerchi), { drone: 42, mel: 38, ticks: 28, oct: -12, tace: [at('vetro', 3, 0.1) - 0.05, at('vetro', 3, 0.1) + 2 * BEAT] });
  bell(mix, 69, { t: at('vetro', 0, 0.6), vel: 34 }); // Tannhaus
  colpo(mix, 'grancassa', 'bdrum_p', { t: at('vetro', 1, 1.1), vel: 110, gain: 0.7, rev: 0.5 }); // l'incidente
  [0, 1, 2, 3, 4, 5].forEach((k) => clip(mix, 'scatti', { t: at('vetro', 2) + k * BEAT_ / 2, da: 6.49, durata: 0.1, gain: 0.14, rev: 0.2 })); // l'ingranaggio
  colpo(mix, 'grancassa', 'bdrum_p', { t: at('vetro', 3, 0.1), vel: 127, gain: 1.5, rev: 0.7 }); // il vetro che si rompe
  clip(mix, 'rombo', { t: at('vetro', 3, 0.1), da: 31, durata: 3, gain: 0.38, fadeIn: 0.05, fadeOut: 1.5, largo: 3 });
  // 2. i cerchi del tempo: l'orologio, il motivo in tutti e due i mondi
  sec(bar(T.cerchi), bar(T.antenato), { drone: 40, str: 34, mel: 40, ticks: 32 });
  bell(mix, 72, { t: at('cerchi', 1, 0.1), vel: 34, pan: -0.3 });
  bell(mix, 60, { t: at('cerchi', 1, 0.5), vel: 34, pan: 0.3 });
  bell(mix, 67, { t: at('cerchi', 2, 0.2), vel: 30 });
  bell(mix, 63, { t: at('cerchi', 3, 1.0), vel: 40, pan: 0.3 }); // non salva il padre
  bell(mix, 60, { t: at('cerchi', 3, 1.2), vel: 40, pan: 0.3 }); // né Martha
  // 3. il figlio antenato: il nodo che si disegna (motivo dritto e allo specchio), le frecce rosse
  sec(bar(T.antenato), bar(T.nemici), { drone: 40, str: 40, mel: 40, bells: 24 });
  MOTIF.forEach(([, m], k) => bell(mix, m + 12, { t: at('antenato', 0, 0.2) + k * BEAT_, vel: 32, pan: -0.3 }));
  [79, 84].forEach((m, k) => bell(mix, m, { t: at('antenato', 1, 0.9) + k * BEAT_, vel: 32 })); // il figlio
  clip(mix, 'passaggio', { t: at('antenato', 2, 0.1) - 0.3, da: 12.27, durata: 1.6, gain: 0.24, fadeOut: 0.6, rev: 0.4 }); // nel passato
  bell(mix, 60, { t: at('antenato', 2, 1.2), vel: 42, pan: 0.3 }); // bisnonno di Martha
  bell(mix, 63, { t: at('antenato', 3, 0.1), vel: 42, pan: -0.3 }); // trisnonno di Jonas
  // 4. Adam ed Eva: la tenaglia a passo doppio, il nodo che si stringe
  sec(bar(T.nemici), bar(T.ponte), { passo: 'doppio', drone: 46, str: 44, mel: 40, oct: -12, pulse: 40 });
  bell(mix, 63, { t: at('nemici', 0, 0.1), vel: 38, pan: -0.3 }); // Adam
  bell(mix, 69, { t: at('nemici', 0, 0.4), vel: 38, pan: 0.3 }); // Eva
  colpo(mix, 'grancassa', 'bdrum_p', { t: at('nemici', 1, 0.2), vel: 110, gain: 0.6, rev: 0.4 });
  colpo(mix, 'grancassa', 'bdrum_p', { t: at('nemici', 1, 0.8), vel: 110, gain: 0.6, rev: 0.4 });
  [0, 1, 2].forEach((j) => strings(mix, [55, 58, 62][j] + 12, { t: at('nemici', 2), dur: 2.2, vel: 48, gain: 0.6, att: 1.4, pan: (j - 1) * 0.3, seed: 70 + j })); // il nodo si stringe
  // 5. come si scioglie: il 1971, il viaggio, l'auto ferma; la macchina si spegne: silenzio e un solo accordo maggiore
  const scioglie = at('ponte', 3);
  sec(bar(T.ponte), bar(scioglie), { drone: 42, str: 40, mel: 40, ticks: 32 });
  bell(mix, 72, { t: at('ponte', 1, 0.1), vel: 40 }); // 1971
  clip(mix, 'passaggio', { t: at('ponte', 2, -0.6) - 0.3, da: 12.27, durata: 1.6, gain: 0.24, fadeOut: 0.6, rev: 0.4 });
  [67, 72, 75].forEach((m, k) => bell(mix, m, { t: at('ponte', 2, 0.6) + k * BEAT_, vel: 36 })); // il cartello: l'auto si ferma
  colpo(mix, 'grancassa', 'bdrum_pp', { t: at('ponte', 3, 0.2), vel: 110, gain: 0.5, rev: 0.6 });
  // un battito di silenzio, poi il primo accordo maggiore (Do) negli archi
  const magg = croma(at('ponte', 3, 0.2) + 2 * BEAT);
  [36, 48, 55, 60, 64, 67].forEach((m, j) => strings(mix, m, { t: magg, dur: bar(T.resta) - magg + 0.6, vel: 42, gain: 0.6, pan: (j - 2.5) * 0.2, att: 0.8, seed: 80 + j }));
  // 6. cosa resta: i rami in polvere (campanelle che scendono), la casa che si accende, Hannah, «Jonas?»
  sec(bar(T.resta), bar(T.chiusura), { drone: 36, str: 32, mel: 36, magg: true, bells: 22 });
  [84, 79, 75, 72, 67].forEach((m, k) => bell(mix, m, { t: at('resta', 0, 0.2) + k * BEAT, vel: 32, pan: k % 2 ? 0.3 : -0.3 }));
  [72, 76, 79].forEach((m, k) => bell(mix, m, { t: at('resta', 1, 0.8) + k * BEAT_, vel: 26 })); // la casa
  bell(mix, 76, { t: at('resta', 2, 0.2), vel: 34 }); // Hannah
  MOTIF_MAGG.slice(0, 2).forEach(([, m], k) => bell(mix, m + 12, { t: at('resta', 2, 1.4) + k * BEAT, vel: 40, pan: 0.2 })); // «Jonas?»
  // chiusura: il motivo in maggiore che non si chiude (l'ultima nota manca), archi tenuti fino alla fine
  const C0 = bar(T.chiusura);
  sec(C0, C0 + 4 * GRID, { drone: 34, pad: 30, mel: 34, magg: true, keep: 1 });
  [48, 55, 60, 64].forEach((m, j) => strings(mix, m, { t: C0 + 4 * GRID, dur: T.END - (C0 + 4 * GRID), vel: 34, gain: 0.5, pan: (j - 1.5) * 0.25, att: 1.2, seed: 90 + j }));
  MOTIF_MAGG.slice(0, 3).forEach(([b, m]) => motif(mix, m, { t: C0 + 4 * GRID + b * BEAT, dur: 2 * BEAT, vel: 30 }));
  clip(mix, 'pioggia_dura', { t: C0, da: 12, durata: T.END - C0, gain: 0.22, fadeIn: 1.5, fadeOut: 3, largo: 3, rev: 0.12 });
};
