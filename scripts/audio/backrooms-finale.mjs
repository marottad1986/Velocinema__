// Colonna sonora di «Backrooms: il finale in 2 minuti» (Spiegato semplice, verticale), ricavato dal video lungo
// «Backrooms spiegato»: stesso mondo sonoro (scripts/audio/backrooms-spiegato.mjs). 75 bpm (croma 0,4 s), Fa diesis
// minore (Fa#m · Re · Si minore · Do# settima), motivo inventato (Do#, Re, Do#, La · Si, La, Fa#, Mi#); l'organo d'attesa
// e la marimba lontana del «centro commerciale vuoto» sopra il ronzio dei neon; archi e pizzicati nella storia; silenzio
// prima del colpo del cemento; il La maggiore che si apre sul colpo nel dettaglio finale. Nessun brano o tema del film.
// Gli istanti delle frasi sono quelli dei sottotitoli (subtitleTimes) sulla griglia della musica, come in Schema.tsx.
import { rng } from './synth.mjs';
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte_coda', 'arpa', 'glockenspiel', 'marimba', 'organo', 'violini', 'viole', 'celli', 'contrabbasso', 'celli_spicc', 'viole_spicc', 'contrabbasso_pizz', 'timpani', 'grancassa', 'piatto_sospeso'];
export const effetti = ['ronzio_neon', 'passaggio', 'colpi_legno', 'legno_cade', 'sibilo', 'rombo', 'campanello_negozio'];
export const sala = { rt60: 2.2, brillo: 5200, predelay: 0.02, wet: 0.45 };

const BPM = 75;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const G0 = 4;
const CROMA = BEAT / 2;
const snap = (t) => G0 + Math.round((t - G0) / BEAT) * BEAT;

const drone = (mix, m, { t, dur, vel = 40, gain = 1, seed = 1 }) => suona(mix, m < 40 ? 'contrabbasso' : 'celli', m, { t, dur, vel: vel + 14, gain: gain * 1.5, attack: 1.6, release: 2, rev: 0.6, seed });
const strings = (mix, m, { t, dur, vel = 40, pan = 0, att = 1, seed = 1 }) => archi(mix, m, { t, dur, vel: vel + 8, pan, rev: 0.55, gain: 1.26, attack: att, release: 1.4, seed });
const spic = (mix, m, { t, vel = 40, pan = 0 }) => suona(mix, m < 55 ? 'celli_spicc' : 'viole_spicc', m, { t, dur: CROMA * 0.8, vel: vel * 1.7, pan, rev: 0.35, gain: 2.6, release: 0.12 });
const piano = (mix, m, { t, dur, vel, pan = 0.1 }) => suona(mix, 'pianoforte_coda', m, { t, dur: Math.min(dur, 4), vel: vel * 1.2, pan, rev: 0.6, gain: 1.4, release: 0.8 });
const harp = (mix, m, { t, vel = 40, pan = -0.2 }) => suona(mix, 'arpa', m, { t, dur: 2.5, vel: vel * 1.3, pan, rev: 0.6, gain: 0.9, release: 1.2 });
const bell = (mix, m, { t, vel = 44, pan = 0.25 }) => suona(mix, 'glockenspiel', m < 79 ? m + 12 * Math.ceil((79 - m) / 12) : m, { t, dur: 2.5, vel: vel * 1.3, pan, rev: 0.75, gain: 0.28, release: 1.5 });
const pizz = (mix, m, { t, vel = 40, pan = -0.1 }) => suona(mix, 'contrabbasso_pizz', m, { t, dur: BEAT, vel: vel * 1.5, pan, rev: 0.3, gain: 1.5, release: 0.25 });
const organ = (mix, m, { t, dur, vel = 36, pan = 0 }) => suona(mix, 'organo', m, { t, dur, vel: vel * 1.2, pan, rev: 0.7, gain: 0.55, attack: 0.5, release: 1.2 });
const mar = (mix, m, { t, vel = 36, pan = 0.35 }) => suona(mix, 'marimba', m, { t, dur: 1.2, vel: vel * 1.3, pan, rev: 0.8, gain: 0.7, release: 0.6 });
const timp = (mix, t, { vel = 100, gain = 0.8, forte = false } = {}) => colpo(mix, 'timpani', forte ? 'Timpani1_Hit_v4_rr1_Sum' : 'Timpani1_Hit_v2_rr1_Sum', { t, vel, gain, rev: 0.45 });
const swell = (mix, t, dur, { gain = 0.5 } = {}) => colpo(mix, 'piatto_sospeso', 'susp_FX_scrape_continuous', { t, dur, vel: 90, gain, release: 0.4, rev: 0.5, da: 2 });

const CHORDS = [[42, [0, 7, 12, 15, 19]], [38, [0, 7, 12, 16, 19]], [35, [0, 7, 12, 15, 19]], [37, [0, 4, 10, 16, 19]]];
const MAJ = [[45, [0, 7, 12, 16, 19]], [38, [0, 7, 12, 16, 19]], [42, [0, 7, 12, 15, 19]], [40, [0, 7, 11, 16, 19]]];
const MOTIF = [[0, 73], [1, 74], [2, 73], [3, 69], [4, 71], [5, 69], [6, 66], [7, 65]];
const MOTIF_M = [[0, 73], [1, 76], [2, 73], [3, 69], [4, 71], [5, 74], [6, 73], [7, 69]];

export default (mix, T) => {
  const film = loadFilm('backrooms-finale');
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
  const at = (id, n, d = 0) => G0 + Math.round((C(id, n) + d - G0) / CROMA) * CROMA;
  let sid = 0;

  const sec = (from, to, o) => {
    // esatto: niente aggancio al battito (il cambio cade proprio sull'evento)
    const f0 = from <= 0 ? 0 : o.esatto ? from : snap(from);
    to = o.esatto ? to : snap(to);
    const R = rng(5000 + sid++ * 131);
    const ch = o.maj ? MAJ : CHORDS;
    const mot = o.maj ? MOTIF_M : MOTIF;
    const pause = o.pause ?? [];
    const tacet = (x) => pause.some(([a, b]) => x >= a && x < b);
    const pezzi = (a0, b0) => {
      const segs2 = [];
      let a = a0;
      for (const [p0, p1] of [...pause].sort((x, y) => x[0] - y[0])) {
        if (p1 <= a || p0 >= b0) continue;
        if (p0 - 0.3 > a) segs2.push([a, p0 - 0.3]);
        a = Math.max(a, p1);
      }
      if (a < b0) segs2.push([a, b0]);
      return segs2.filter(([x, y]) => y - x > 0.5);
    };
    if (o.drone) pezzi(f0, to).forEach(([x, y], i) => {
      const ped = o.maj ? 33 : 30;
      drone(mix, ped, { t: x, dur: y - x + 0.3, vel: o.drone, gain: 0.7, seed: sid + i });
      drone(mix, ped + 12, { t: x, dur: y - x + 0.3, vel: o.drone * 0.8, gain: 0.5, seed: sid + 50 + i });
    });
    for (let t = G0 + Math.floor((f0 - G0) / BAR) * BAR; t < to - 0.3; t += BAR) {
      const k = Math.round((t - G0) / BAR);
      const [root, iv] = ch[(((k - (o.giro ?? 0)) % 4) + 4) % 4];
      const t0 = Math.max(t, f0);
      const fine = Math.min(t + BAR * 1.02, to);
      if (o.str) pezzi(t0, fine).forEach(([x, y]) => [iv[1], iv[2], iv[3]].forEach((v, j) => strings(mix, root + 12 + v, { t: x + j * 0.04, dur: y - x, vel: o.str, pan: (j - 1) * 0.35, seed: j + k, att: Math.min(1, (y - x) / 3) })));
      if (o.org) pezzi(t0, fine).forEach(([x, y]) => [iv[1], iv[2], iv[3]].forEach((v, j) => organ(mix, root + 24 + v, { t: x + j * 0.03, dur: y - x, vel: o.org, pan: (j - 1) * 0.25 })));
      for (let i = 0; i < 8; i++) {
        const tt = t + i * CROMA;
        if (tt < f0 || tt >= to - 0.05 || tacet(tt)) continue;
        if (o.mar && ![1, 3, 6].includes(i)) mar(mix, root + 24 + iv[[2, 3, 4, 3, 2, 4, 3, 1][i]], { t: tt, vel: o.mar * (i % 4 === 0 ? 1 : 0.75) });
        if (o.pizz) pizz(mix, root + [0, 12, 7, 12][i % 4], { t: tt, vel: o.pizz * (i % 2 ? 0.7 : 1) });
        if (o.harp && i % 2 === 0) harp(mix, root + 24 + iv[(i / 2) % 5], { t: tt, vel: o.harp });
      }
      if (o.spic) {
        const step = o.doppio ? CROMA / 2 : CROMA;
        const notes = [root, root + iv[1], root + 12, root + iv[1]];
        for (let i = 0; t + i * step < Math.min(t + BAR, to) - 0.05; i++) {
          if (t + i * step < f0 || tacet(t + i * step)) continue;
          spic(mix, notes[i % 4] + 12, { t: t + i * step, vel: o.spic * (i % (o.doppio ? 4 : 2) === 0 ? 1 : 0.72), pan: i % 2 ? 0.25 : -0.25 });
        }
      }
      if (o.mel && k % 2 === 0) for (const [b, mm] of mot) {
        const tt = t + b * BEAT;
        if (tt < f0 || tt >= to - 0.2 || tacet(tt) || R() > (o.keep ?? 1)) continue;
        piano(mix, mm, { t: tt, dur: BEAT * 1.4, vel: o.mel, pan: 0.15 });
        if (o.bells) bell(mix, mm + 12, { t: tt + 0.01, vel: o.bells, pan: 0.3 });
      }
    }
  };

  const B2 = 2 * BEAT;
  const colpo1 = at('cemento', 1, 0.8);
  const lancio = at('cemento', 1, 0.2);
  const hit = at('dettaglio', 1, 2.4);
  const morte = at('pirata', 2, 0.6);

  sec(0, T.stanze, { drone: 30, mar: 30, org: 24, mel: 34, keep: 0.8 });
  sec(T.stanze, T.fessura, { drone: 32, org: 28, mar: 30, mel: 34, keep: 0.85 });
  sec(T.fessura, T.regola, { drone: 36, str: 30, pizz: 28 });
  sec(T.regola, T.pirata, { drone: 34, harp: 32, org: 24, bells: 30, mel: 32, keep: 0.8 });
  sec(T.pirata, T.cemento, { drone: 44, spic: 44, doppio: true, str: 40, pause: [[morte - 0.05, morte + BEAT]] });
  sec(T.cemento, colpo1 - BEAT, { drone: 50, spic: 36, doppio: true, str: 48, esatto: true, pause: [[colpo1 - 2 * BEAT, colpo1]] });
  sec(colpo1 + B2, T.async, { drone: 36, str: 30, harp: 28 });
  sec(T.async, T.scena, { drone: 38, str: 32, pizz: 28, org: 20 });
  sec(T.scena, T.sorte, { drone: 40, spic: 36, str: 34, pause: [[at('scena', 2, 1.6) - 0.05, at('scena', 2, 1.6) + BEAT]] });
  sec(T.sorte, T.dettaglio, { drone: 34, harp: 32, str: 28, mel: 32, keep: 0.8 });
  sec(T.dettaglio, hit, { drone: 36, str: 34, harp: 30, pause: [[hit - 1.2, hit]] });
  sec(hit + BEAT, T.END, { drone: 34, str: 28, harp: 28, mel: 32, bells: 28, maj: true, esatto: true, giro: 1 });

  // il ronzio dei neon sotto la copertina e i corridoi
  for (const [t, d, gn] of [[0, T.fessura, 0.08], [T.cemento, colpo1 - T.cemento, 0.06], [T.scena, T.sorte - T.scena, 0.05]]) {
    for (let x = 0; x < d - 0.5; x += 22) clip(mix, 'ronzio_neon', { t: t + x, da: 3 + ((t + x) % 30), durata: Math.min(24, d - x), gain: gn, fadeIn: x ? 2 : 0.3, fadeOut: 1, largo: 1.2 });
  }
  // un soffio a ogni capitolo (la camera vola nel mondo)
  for (const id of ['fessura', 'regola', 'pirata', 'cemento', 'async', 'scena', 'sorte', 'dettaglio']) clip(mix, 'passaggio', { t: T[id] - 0.2, da: 0.56, durata: 1.4, gain: 0.1, fadeIn: 0.4, fadeOut: 0.6, rev: 0.35 });
  // stanze: la foto (2019), il film (2026)
  bell(mix, 76, { t: at('stanze', 1, 1.2), vel: 34 });
  timp(mix, at('stanze', 2, 0.6), { vel: 95, gain: 0.55 });
  // fessura: il campanello del negozio, la fessura che brilla, Clark che scende
  clip(mix, 'campanello_negozio', { t: T.fessura + 0.4, da: 0, durata: 1.4, gain: 0.18, fadeOut: 0.5, rev: 0.3 });
  [78, 81, 85].forEach((m, k) => bell(mix, m, { t: at('fessura', 1, 0.8) + k * CROMA / 2, vel: 34 }));
  [81, 78, 76, 73, 69, 66].forEach((m, k) => harp(mix, m, { t: at('fessura', 2) + k * CROMA, vel: 32 }));
  // regola: il cartello, le copie
  timp(mix, at('regola', 1, 0.2), { vel: 90, gain: 0.5 });
  [61, 66, 69].forEach((m, k) => bell(mix, m, { t: at('regola', 2, 1.2) + k * 0.4, vel: 30 }));
  // pirata: i passi della gamba di legno, la copia gigante, Clark ucciso (colpo e un battito di silenzio)
  for (let k = 0; k < 6; k++) clip(mix, 'colpi_legno', { t: at('pirata', 1) + k * CROMA, da: 0.2, durata: 0.4, gain: 0.25 + k * 0.04, rev: 0.4, lp: 2500 });
  timp(mix, morte, { vel: 112, gain: 0.75, forte: true });
  // cemento: il lancio, il silenzio, il colpo, il gas, le torce
  clip(mix, 'passaggio', { t: lancio, da: 0.56, durata: colpo1 - lancio, gain: 0.2, fadeIn: 0.1, rev: 0.3 });
  timp(mix, colpo1, { vel: 127, gain: 1.2, forte: true });
  colpo(mix, 'grancassa', 'bdrum_ff', { t: colpo1, vel: 120, gain: 0.6, rev: 0.4 });
  clip(mix, 'rombo', { t: colpo1 + 0.1, da: 3.6, durata: 2.4, gain: 0.12, fadeOut: 1.2, largo: 1.4 });
  clip(mix, 'sibilo', { t: at('cemento', 2, 0.4), da: 1, durata: 3, gain: 0.08, fadeIn: 0.4, fadeOut: 1, largo: 1.3 });
  // async: Phil, «non decido io»
  bell(mix, 73, { t: at('async', 1, 0.4), vel: 32 });
  timp(mix, at('async', 2, 1.6), { vel: 95, gain: 0.55 });
  // scena: la stanzetta, la copia di Mary (colpo), l'anello
  timp(mix, at('scena', 2, 1.6), { vel: 110, gain: 0.75, forte: true });
  bell(mix, 85, { t: at('scena', 2, 2.4), vel: 38 });
  // sorte: le due strade
  [66, 61, 57].forEach((m, k) => harp(mix, m, { t: at('sorte', 1, 0.6) + k * CROMA, vel: 34 }));
  [69, 73, 76].forEach((m, k) => harp(mix, m + 12, { t: at('sorte', 1, 2.6) + k * CROMA, vel: 34 }));
  // dettaglio: la casa nel cemento (campanelle), il colpo: si apre il La maggiore
  [69, 73, 76, 81].forEach((m, k) => bell(mix, m, { t: at('dettaglio', 0, 1) + k * CROMA, vel: 36 }));
  // la camera scende nel cemento fino alla casa
  clip(mix, 'passaggio', { t: at('dettaglio', 1, 1.6), da: 0.56, durata: 0.8, gain: 0.15, fadeIn: 0.1, rev: 0.3 });
  // il pezzo di casa che si stacca col colpo
  clip(mix, 'legno_cade', { t: hit + 1.4, gain: 0.35, rev: 0.4 });
  swell(mix, hit - 3, 1.8, { gain: 0.35 });
  timp(mix, hit, { vel: 124, gain: 1.3, forte: true });
  [69, 73, 76, 81, 85].forEach((m, k) => harp(mix, m, { t: hit + BEAT + k * CROMA / 2, vel: 26 }));
  [76, 81, 85, 88].forEach((m, k) => bell(mix, m, { t: T.END - 3.4 + k * CROMA, vel: 32 }));
};
