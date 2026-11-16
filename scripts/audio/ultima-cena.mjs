// Colonna sonora originale dell'Ultima Cena: solenne e luminosa, discreta sotto la voce.
// Strumenti veri campionati (VSCO-2 CE e VCSL, CC0): organo leggero, archi, arpa, pianoforte a coda, contrabbasso
// pizzicato, timpani, piatto sospeso. Un tema inventato qui, in Sol minore, in 4/4 a 72 bpm (10 s = 3 battute); si apre
// in Si bemolle maggiore nel restauro e nel finale. Nessun brano sacro o tema noto citato.
// Effetti registrati (archivio CC0 di Craig Smith: scripts/audio/effetti.mjs) agganciati agli eventi delle scene in
// src/scenes/ultima-cena/, con gli stessi istanti di griglia() (crome a 72 bpm).
import { rng } from './synth.mjs';
import { suona, archi, crescendo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['organo', 'organo_pedale', 'pianoforte_coda', 'arpa', 'violini', 'viole', 'celli', 'contrabbasso', 'contrabbasso_pizz', 'timpani', 'piatto_sospeso'];
export const effetti = ['esplosioni'];
/** Sala grande di pietra, come un refettorio. */
export const sala = { rt60: 2.8, brillo: 5800, predelay: 0.03, wet: 0.52 };

const BPM = 72;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const CROMA = BEAT / 2;
const G0 = 4; // la griglia parte dalla fine della copertina, come griglia() delle scene
const snap = (t) => G0 + Math.round((t - G0) / BEAT) * BEAT;
const snapC = (t) => G0 + Math.round((t - G0) / CROMA) * CROMA;

// accordi per battuta: Sol minore · Mi bemolle · Si bemolle · Re (in maggiore: Si bemolle · Sol minore · Mi bemolle · Fa)
const CH = [[43, [0, 3, 7]], [39, [0, 4, 7]], [46, [0, 4, 7]], [38, [0, 4, 7]]];
const CH_MAG = [[46, [0, 4, 7]], [43, [0, 3, 7]], [39, [0, 4, 7]], [41, [0, 4, 7]]];
// il tema (due battute, a semiminime; inventato): Re Sib Do La · Sib Sol La Fa#
const THEME = [[0, 74], [1, 70], [2, 72], [3, 69], [4, 70], [5, 67], [6, 69], [7, 66]];
// in maggiore: Fa Re Mib Do · Re Sib Do La
const THEME_MAG = [[0, 77], [1, 74], [2, 75], [3, 72], [4, 74], [5, 70], [6, 72], [7, 69]];

const piano = (mix, m, { t, dur = BEAT * 1.4, vel = 40, pan = 0.1 }) =>
  suona(mix, 'pianoforte_coda', m, { t, dur: Math.min(dur, 4), vel: vel * 1.2, pan, rev: 0.6, gain: 1.6, release: 0.8 });
const harp = (mix, m, { t, vel = 36, pan = -0.2 }) =>
  suona(mix, 'arpa', m, { t, dur: 2.4, vel: vel * 1.3, pan, rev: 0.6, gain: 0.9, release: 1.2 });
const strings = (mix, m, { t, dur, vel = 40, pan = 0, gain = 0.8, att = 1, seed = 1 }) =>
  archi(mix, m, { t, dur, vel: vel + 8, pan, rev: 0.6, gain: gain * 1.3, attack: att, release: 1.3, seed });
const organ = (mix, m, { t, dur, vel = 34, pan = 0, gain = 0.5, seed = 1 }) =>
  suona(mix, 'organo', m, { t, dur, vel, pan, gain, attack: 0.5, release: 1.2, rev: 0.55, seed });
const pedal = (mix, m, { t, dur, vel = 34, gain = 0.6 }) =>
  suona(mix, 'organo_pedale', m, { t, dur, vel, gain, attack: 0.4, release: 1.2, rev: 0.5 });
const pizz = (mix, m, { t, vel = 50 }) => suona(mix, 'contrabbasso_pizz', m, { t, dur: 1.2, vel: vel * 1.4, rev: 0.4, gain: 1.4, release: 0.5 });
/** Timpano intonato (VCSL), sulla nota dell'accordo. */
const timp = (mix, t, m, { vel = 100, gain = 0.6 } = {}) => suona(mix, 'timpani', m, { t, dur: 2, vel, gain, rev: 0.5, release: 0.8 });

export default (mix, T) => {
  const film = loadFilm('ultima-cena');
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
  /** Come griglia(cues[n] + d) delle scene. */
  const at = (id, n, d = 0) => snapC(C(id, n) + d);
  /** Come griglia(d) delle scene (d secondi dall'inizio del capitolo). */
  const atT = (id, d) => snapC(T[id] + d);
  let sid = 0;

  /**
   * Una sezione da `from` a `to` (cambi sul battito più vicino all'inizio del capitolo).
   * org: organo tenuto (con il pedale) · str: archi tenuti · low: archi gravi · pz: contrabbasso pizzicato sui battiti 1 e 3
   * harp: arpa a crome · mel: il tema al pianoforte · mag: Si bemolle maggiore · pausa: [da, a] silenzio delle figure
   */
  const sec = (from, to, o) => {
    from = from <= 0 ? 0 : snap(from); to = snap(to);
    const R = rng(7100 + sid++ * 131);
    const chords = o.mag ? CH_MAG : CH;
    const theme = o.mag ? THEME_MAG : THEME;
    const tacet = (x) => o.pausa && x >= o.pausa[0] && x < o.pausa[1];
    for (let k = 0, t = from; t < to - 0.3; k++, t += BAR) {
      const [root, iv] = chords[k % 4];
      const d = Math.min(BAR * 1.02, to - t + 0.2);
      // accordi tenuti: si interrompono nella pausa (silenzio dopo un colpo) e riprendono dopo
      const tratti = [[t, d]];
      if (o.pausa && t < o.pausa[1] && t + d > o.pausa[0]) {
        tratti.length = 0;
        if (o.pausa[0] > t) tratti.push([t, o.pausa[0] - t + 0.05]);
        if (t + d > o.pausa[1] + 0.3) tratti.push([o.pausa[1], t + d - o.pausa[1]]);
      }
      for (const [ta, da] of tratti) {
        if (o.org) {
          pedal(mix, root - 12 < 26 ? root : root - 12, { t: ta, dur: da, vel: o.org });
          iv.forEach((v, j) => organ(mix, root + 12 + v, { t: ta + j * 0.03, dur: da, vel: o.org - 6, pan: (j - 1) * 0.3, seed: k + j }));
        }
        if (o.str) iv.forEach((v, j) => strings(mix, root + 24 + v, { t: ta + j * 0.04, dur: da, vel: o.str, pan: (j - 1) * 0.35, seed: k + j }));
        if (o.str && o.low) strings(mix, root, { t: ta, dur: da, vel: o.str, gain: 0.7, seed: 50 + k });
      }
      if (o.pz) [0, 2].forEach((b) => { const tt = t + b * BEAT; if (tt < to - 0.1 && !tacet(tt)) pizz(mix, root + (b ? 7 : 0), { t: tt, vel: o.pz }); });
      if (o.harp) {
        const fig = [0, iv[1], iv[2], 12, iv[2] + 12, 12, iv[2], iv[1]];
        fig.forEach((v, e) => { const tt = t + e * CROMA; if (tt < to - 0.1 && !tacet(tt)) harp(mix, root + 24 + v, { t: tt, vel: o.harp * (e % 2 ? 0.8 : 1), pan: -0.3 + (e % 4) * 0.15 }); });
      }
      if (o.mel && k % 2 === 0) {
        for (const [b, m] of theme) {
          const tt = t + b * BEAT;
          if (tt >= to - 0.2 || tacet(tt) || R() > (o.keep ?? 1)) continue;
          piano(mix, m + (o.oct ?? 0), { t: tt, vel: o.mel });
        }
      }
    }
  };

  // ---- eventi delle scene (gli stessi istanti di griglia())
  const annuncio = at('annuncio', 1); // «uno di voi mi tradirà»: la finestra si accende
  const bomba = at('ferite', 1, 0.9); // il lampo e il tremito
  const porta = atT('ferite', 0.9); // l'arco della porta che si traccia

  // ---- sezioni
  sec(0, T.milano, { org: 30, harp: 26, mel: 34 });
  sec(T.milano, T.lentezza, { org: 24, str: 26, pz: 34, harp: 24, mel: 32 });
  sec(T.lentezza, T.annuncio, { str: 24, mel: 30, keep: 0.6 }); // il tempo che si ferma: poche note
  sec(T.annuncio, T.gruppi, { org: 30, str: 30, low: true, mel: 30, pausa: [annuncio - 0.05, annuncio + BEAT - 0.05] });
  sec(T.gruppi, T.giuda, { str: 32, pz: 40, harp: 30, mel: 34 }); // la reazione: si muove tutto
  sec(T.giuda, T.pane, { str: 30, low: true, pz: 30, mel: 28, keep: 0.8 });
  sec(T.pane, T.giovanni, { org: 24, harp: 26, mel: 30 });
  sec(T.giovanni, T.prospettiva, { str: 26, harp: 28, mel: 32, oct: 12, keep: 0.85 });
  sec(T.prospettiva, T.tecnica, { org: 28, str: 28, mel: 32 });
  sec(T.tecnica, T.ferite, { str: 24, low: true, mel: 26, keep: 0.7 }); // raccolta, senza pulsazione
  sec(T.ferite, T.oggi, { str: 28, low: true, org: 22, pausa: [bomba - 0.05, bomba + 2 * BEAT - 0.05] });
  sec(T.oggi, T.finale, { mag: true, org: 30, str: 30, harp: 30, pz: 32, mel: 36 });
  // finale: Si bemolle maggiore aperto
  const F = snap(T.finale);
  [34, 46, 53, 58, 62, 65, 70].forEach((m, j) => strings(mix, m, { t: F, dur: T.END - F - 0.2, vel: 34, gain: 0.7, pan: (j - 3) * 0.18, att: 0.6, seed: 80 + j }));
  pedal(mix, 34, { t: F, dur: T.END - F - 0.3, vel: 34 });
  [58, 62, 65, 70, 74, 77].forEach((m, k) => harp(mix, m, { t: F + k * CROMA / 2, vel: 30 }));
  THEME_MAG.slice(0, 4).forEach(([b, m]) => piano(mix, m, { t: F + BEAT + b * BEAT, vel: 28 }));

  // ---------------------------------------------------------------- eventi
  // capitolo 2: i riquadri della chiesa e del refettorio (arpa)
  [55, 58, 62].forEach((m, k) => harp(mix, m + 12, { t: at('milano', 0, 0.6) + k * CROMA, vel: 28 }));
  [58, 62, 65].forEach((m, k) => harp(mix, m + 12, { t: at('milano', 2) + k * CROMA, vel: 28 }));
  // capitolo 3: la clessidra (nota sola, ripetuta), il volto vuoto (accordo sospeso)
  [0, 1, 2, 3].forEach((k) => piano(mix, 86, { t: atT('lentezza', 0.6) + k * BEAT, vel: 18, pan: 0.3 }));
  [62, 67, 69].forEach((m, k) => harp(mix, m, { t: at('lentezza', 2) + k * CROMA, vel: 30 }));
  // capitolo 4: l'annuncio, colpo sordo di timpano e poi un battito di silenzio
  timp(mix, annuncio, 43, { vel: 90, gain: 0.5 });
  // capitolo 3: il priore protesta (nota grave d'arpa)
  harp(mix, 43, { t: at('lentezza', 1), vel: 30 });
  // capitolo 5: l'anello su Gesù, fermo da solo (nota chiara)
  piano(mix, 79, { t: at('gruppi', 2, 1.0), dur: 2.5, vel: 30 });
  // capitolo 6: Giuda nell'ombra (nota grave), il sacchetto (pizzicato sordo)
  piano(mix, 31, { t: at('giuda', 1), dur: 3, vel: 40 });
  pizz(mix, 38, { t: at('giuda', 2), vel: 44 });
  // capitolo 7: Giuda allunga la mano (pizzicato), la traccia tra le due mani e l'anello sul pane
  pizz(mix, 43, { t: at('pane', 1), vel: 44 });
  [62, 67, 70, 74].forEach((m, k) => harp(mix, m, { t: at('pane', 2) + k * CROMA / 2, vel: 32 }));
  piano(mix, 79, { t: at('pane', 2) + CROMA, vel: 26 });
  // capitolo 8: l'anello sul volto
  harp(mix, 74, { t: atT('giovanni', 0.6), vel: 26 });
  // capitolo 8: il libro (accordo d'arpa), Giovanni (nota chiara)
  [58, 62, 65].forEach((m, k) => harp(mix, m + 12, { t: at('giovanni', 1) + k * CROMA, vel: 28 }));
  piano(mix, 82, { t: at('giovanni', 2), vel: 28 });
  // capitolo 9: sei linee, una nota d'arpa ciascuna (salgono), il punto di fuga (piatto e accordo)
  const l0 = at('prospettiva', 0, 1.2);
  [55, 58, 62, 67, 70, 74].forEach((m, k) => harp(mix, m + 12, { t: l0 + k * CROMA, vel: 30, pan: -0.5 + k * 0.2 }));
  const punto = at('prospettiva', 1, 0.8);
  crescendo(mix, punto, 1.2, { gain: 0.4 });
  [67, 74, 79].forEach((m, k) => piano(mix, m, { t: punto + k * CROMA / 2, dur: 2.5, vel: 20 }));
  // capitolo 10: lo strato a secco (nota sola), il colore che si stacca (tre note che scendono)
  piano(mix, 62, { t: at('tecnica', 1), dur: 2, vel: 24 });
  [74, 70, 67].forEach((m, k) => piano(mix, m, { t: at('tecnica', 2) + k * CROMA, vel: 26 }));
  // capitolo 11: l'arco della porta (arpa), la bomba lontana del 1943 e due battiti di silenzio
  [43, 50, 55].forEach((m, k) => harp(mix, m, { t: porta + k * CROMA, vel: 30 }));
  clip(mix, 'esplosioni', { t: bomba - 0.02, da: 7.95, durata: 2.6, gain: 0.6, fadeOut: 1.6, rev: 0.5, lp: 2500 }); // il colpo nel file è a 8,0 s
  timp(mix, bomba, 31, { vel: 110, gain: 0.7 });
  // capitolo 12: l'apertura in maggiore (crescendo di piatto sul cambio), il riquadro «Oggi» (arpa)
  crescendo(mix, snap(T.oggi), 1.2, { gain: 0.3 });
  [58, 62, 65].forEach((m, k) => harp(mix, m + 12, { t: at('oggi', 1) + k * CROMA, vel: 28 }));
};
