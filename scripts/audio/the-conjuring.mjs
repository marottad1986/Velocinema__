// Colonna sonora originale di The Conjuring (2013), discreta sotto la voce.
// Strumenti veri campionati (VSCO-2 CE e VCSL, CC0): archi tenuti e in tremolo, violini pizzicati per gli orologi,
// pianoforte a coda nel registro acuto, arpa, glockenspiel per il carillon, organo per la Chiesa e l'esorcismo, timpani,
// grancassa in rullo, gong e piatto sospeso. Re minore, 4/4 a 72 bpm (10 s = 3 battute). Un motivo inventato qui, da
// carillon (glockenspiel a crome), torna a ogni apparizione: il carillon, il ritaglio di Rory, il ricordo che salva. Il
// culmine del film è la cacciata della strega all'alba (ultimo capitolo), dove tutto si apre in Re maggiore.
// Niente brani o temi del film. Effetti registrati (archivio CC0 di Craig Smith: scripts/audio/effetti.mjs) agganciati
// agli eventi delle scene in src/scenes/the-conjuring/, con gli stessi istanti di griglia() (crome a 72 bpm).
import { rng } from './synth.mjs';
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte_coda', 'arpa', 'violini', 'viole', 'celli', 'contrabbasso', 'violini_trem', 'celli_trem', 'violini_pizz', 'glockenspiel', 'organo', 'timpani', 'grancassa_rullo', 'gong', 'gong_graffio', 'piatto_sospeso', 'piatto_crash'];
export const effetti = ['auto_epoca', 'scatti', 'ringhio', 'latrato', 'sedia', 'colpi_legno', 'legno_cade', 'porta_cigolio', 'vento_invernale', 'campanello', 'stoffa', 'legno_cigolio', 'porta_sbatte', 'vento_leggero', 'ali', 'rombo', 'pioggia_vento', 'ronzio_neon', 'tuono_forte', 'tuono_classico'];
/** Sala grande e scura, di legno e pietra. */
export const sala = { rt60: 2.6, brillo: 5200, predelay: 0.03, wet: 0.5 };

const BPM = 72;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const CROMA = BEAT / 2;
const G0 = 4;
const snap = (t) => G0 + Math.round((t - G0) / BEAT) * BEAT;

// accordi per battuta in Re minore: Re minore · Si bemolle · Sol minore · La (con la sensibile)
const CH = [[38, [0, 3, 7]], [34, [0, 4, 7]], [43, [0, 3, 7]], [45, [0, 4, 7]]];
// il motivo del carillon (a crome): Re Fa Mi La · Re Do# La
const MOTIVO = [[0, 86], [1, 89], [2, 88], [3, 81], [4, 86], [5, 85], [6, 81]];
// lo stesso motivo in Re maggiore, per il ricordo e l'alba: Re Fa# Mi La · Re Do# La
const MOTIVO_MAG = [[0, 86], [1, 90], [2, 88], [3, 81], [4, 86], [5, 85], [6, 81]];

const piano = (mix, m, { t, dur = BEAT * 1.6, vel = 36, pan = 0.15 }) =>
  suona(mix, 'pianoforte_coda', m, { t, dur: Math.min(dur, 4), vel: vel * 1.2, pan, rev: 0.6, gain: 1.5, release: 0.9 });
const harp = (mix, m, { t, vel = 34, pan = -0.2 }) =>
  suona(mix, 'arpa', m, { t, dur: 2.4, vel: vel * 1.3, pan, rev: 0.6, gain: 0.9, release: 1.2 });
const glock = (mix, m, { t, vel = 40, pan = 0.2, gain = 0.3 }) =>
  suona(mix, 'glockenspiel', m, { t, dur: 2.2, vel: vel * 1.3, pan, rev: 0.75, gain, release: 1.4 });
const strings = (mix, m, { t, dur, vel = 40, pan = 0, gain = 0.8, att = 1, seed = 1 }) =>
  archi(mix, m, { t, dur, vel: vel + 8, pan, rev: 0.6, gain: gain * 1.3, attack: att, release: 1.3, seed });
const trem = (mix, m, { t, dur, vel = 40, gain = 0.6, pan = 0, att = 0.8 }) =>
  suona(mix, m < 55 ? 'celli_trem' : 'violini_trem', m, { t, dur, vel: vel * 1.3, pan, rev: 0.55, gain, attack: att, release: 1.0 });
const tick = (mix, m, { t, vel = 40, pan = 0 }) => suona(mix, 'violini_pizz', m, { t, dur: 0.6, vel: vel * 1.3, pan, rev: 0.35, gain: 0.8, release: 0.3 });
const organ = (mix, ms, { t, dur, vel = 40, gain = 0.35 }) =>
  ms.forEach((m, j) => suona(mix, 'organo', m, { t: t + j * 0.02, dur, vel, pan: (j - 1) * 0.2, rev: 0.7, gain, attack: 0.4, release: 1.2 }));
const timp = (mix, t, { vel = 110, gain = 0.8 } = {}) => colpo(mix, 'timpani', 'Timpani1_Hit_v4', { t, vel, gain, rev: 0.5 });
const timpSoft = (mix, t, { vel = 90, gain = 0.5 } = {}) => colpo(mix, 'timpani', 'Timpani1_Hit_v3', { t, vel, gain, rev: 0.5 });
const roll = (mix, t, dur, { gain = 0.5 } = {}) => colpo(mix, 'grancassa_rullo', 'bdrum_roll_long1', { t, dur, vel: 100, gain, release: 0.5, rev: 0.4 });
const scrape = (mix, t, { gain = 0.4 } = {}) => colpo(mix, 'gong_graffio', 'gong_scrape_3', { t, vel: 100, gain, dur: 4, release: 1, rev: 0.6 });
const swell = (mix, t, dur, { gain = 0.4 } = {}) => colpo(mix, 'piatto_sospeso', 'susp_FX_scrape_continuous', { t, dur, vel: 90, gain, release: 0.4, rev: 0.5, da: 2 });
const motivo = (mix, t0, { vel = 38, gain = 0.3, mag = false, fino = Infinity, oct = 0 } = {}) =>
  (mag ? MOTIVO_MAG : MOTIVO).forEach(([b, m]) => { const t = t0 + b * CROMA; if (t < fino - 0.2) glock(mix, m + oct, { t, vel, gain }); });

export default (mix, T) => {
  const film = loadFilm('the-conjuring');
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
  /** Come griglia() delle scene: istante della frase n più d, arrotondato alla croma della griglia continua. */
  const at = (id, n, d = 0) => G0 + Math.round((C(id, n) + d - G0) / CROMA) * CROMA;
  let sid = 0;

  /**
   * Una sezione da `from` a `to` (cambi sul battito più vicino all'inizio del capitolo).
   * str: archi tenuti · low: anche il basso · tr: tremolo grave sulla fondamentale · tk: pizzicati a crome (gli orologi)
   * harp: arpa a semiminime · mel: note sparse del pianoforte acuto · pausa: [da, a] silenzio di tutte le figure
   */
  const sec = (from, to, o) => {
    from = from <= 0 ? G0 - 9 * CROMA : snap(from); to = snap(to);
    const R = rng(3070 + sid++ * 131);
    const tacet = (x) => o.pausa && x >= o.pausa[0] && x < o.pausa[1];
    const stopAt = o.pausa ? o.pausa[0] : Infinity;
    for (let k = 0, t = from; t < to - 0.3; k++, t += BAR) {
      const [root, iv] = CH[k % 4];
      // le note tenute si fermano alla pausa e riprendono dopo
      const holds = (a, b) => (a < stopAt && b > stopAt ? [[a, stopAt - a + 0.05], [o.pausa[1], b - o.pausa[1]]] : tacet(a) ? [[o.pausa[1], b - o.pausa[1]]] : [[a, b - a]]).filter(([, d]) => d > 0.3);
      const end = Math.min(t + BAR * 1.02, to + 0.2);
      for (const [a, d] of holds(t, end)) {
        if (o.str) iv.forEach((v, j) => strings(mix, root + 12 + v, { t: a + j * 0.04, dur: d, vel: o.str, pan: (j - 1) * 0.3, seed: k + j }));
        if (o.str && o.low) strings(mix, root, { t: a, dur: d, vel: o.str, gain: 0.7, seed: 50 + k });
        if (o.tr) trem(mix, root, { t: a, dur: d, vel: o.tr });
      }
      if (o.tk) for (let i = 0; i < 8; i++) { const tt = t + i * CROMA; if (tt < to - 0.1 && tt < (o.tkFino ?? Infinity) && !tacet(tt)) tick(mix, i % 2 ? 74 : 81, { t: tt, vel: o.tk, pan: i % 2 ? -0.3 : 0.3 }); }
      if (o.harp) for (let i = 0; i < 4 && t + i * BEAT < to - 0.1; i++) if (!tacet(t + i * BEAT)) harp(mix, root + 24 + iv[i % 3] + (i === 3 ? 12 : 0), { t: t + i * BEAT, vel: o.harp });
      if (o.mel) for (let i = 0; i < 4; i++) {
        const tt = t + i * BEAT + (i % 2 ? CROMA : 0);
        if (tt >= to - 0.2 || tacet(tt) || R() > (o.keep ?? 0.55)) continue;
        piano(mix, root + 36 + iv[Math.floor(R() * 3)], { t: tt, vel: o.mel });
      }
    }
  };

  // ---- eventi delle scene (gli stessi istanti di griglia())
  const dog = at('casa', 2, 0.4);
  const boards = at('cantina', 1, 0.4);
  const cellar = at('cantina', 2, 0.4);
  const clocks = at('orologi', 0, 2.4);
  const pull = at('presenze', 0, 2.2);
  const slam = at('presenze', 2, 0.5);
  const box = at('carillon', 0, 2.6);
  const evil = at('warren', 2, 0.6);
  const watch = at('strega', 1, 2.4);
  const curse = at('strega', 2, 0.3);
  const pin = at('madri', 2, 1.0);
  const f1 = at('prove', 1, 1.9);
  const strike = at('possessione', 2, 0.3);
  const fight = at('esorcismo', 0, 0.6);
  const mem = at('esorcismo', 1, 0.9);
  const dawn = at('esorcismo', 2, 1.6);

  // ---- sezioni
  sec(0, T.casa, { str: 42, low: true, tr: 36, tk: 32 });
  sec(T.casa, T.cantina, { str: 26, harp: 26, mel: 30, pausa: [dog + 0.3, dog + 0.3 + BEAT] });
  sec(T.cantina, T.orologi, { str: 22, low: true, tr: 26, mel: 26, keep: 0.4, pausa: [cellar - 0.05, cellar + BEAT - 0.05] });
  sec(T.orologi, T.presenze, { str: 24, low: true, tk: 34, tkFino: clocks, mel: 26, keep: 0.35, pausa: [clocks, clocks + BEAT * 2] });
  sec(T.presenze, T.carillon, { str: 26, low: true, tr: 32, mel: 24, keep: 0.35, pausa: [slam, slam + BEAT * 2] });
  sec(T.carillon, T.warren, { str: 34, low: true, harp: 34, keep: 0.3 });
  sec(T.warren, T.strega, { str: 34, low: true, mel: 32, keep: 0.4, pausa: [evil - 0.05, evil + BEAT - 0.05] });
  sec(T.strega, T.madri, { str: 34, low: true, tr: 34, tk: 30, tkFino: watch, pausa: [watch, watch + BEAT * 2] });
  sec(T.madri, T.prove, { str: 26, low: true, mel: 28, keep: 0.45, pausa: [pin, pin + BEAT * 2] });
  sec(T.prove, T.possessione, { str: 34, low: true, tr: 32, mel: 30, keep: 0.4 });
  sec(T.possessione, T.esorcismo, { str: 34, low: true, tr: 36, pausa: [strike, strike + BEAT] });
  // l'esorcismo: tremolo e organo che crescono fino all'alba, poi Re maggiore pieno
  sec(T.esorcismo, dawn, { str: 36, low: true, tr: 44, pausa: [dawn - BEAT, dawn] });

  // copertina: il carillon che si socchiude (motivo), il ticchettio del davanzale
  motivo(mix, G0 - 7 * CROMA, { vel: 34, gain: 0.26, fino: T.casa + 1 });

  // capitolo 1: l'auto che arriva, la lampada del portico, il cane che punta le zampe (ringhio), l'abbaino che si accende
  clip(mix, 'auto_epoca', { t: at('casa', 0, 0.2) - 0.3, da: 17.5, durata: 3.2, gain: 0.16, fadeIn: 0.4, fadeOut: 0.8, rev: 0.25 });
  clip(mix, 'scatti', { t: at('casa', 1, 0.6), da: 6.49, durata: 0.08, gain: 0.28, rev: 0.35 });
  [1.04, 1.67, 2.36].forEach((da, i) => clip(mix, 'latrato', { t: dog + i * CROMA, da, durata: 0.35, gain: 0.25, fadeOut: 0.1, rev: 0.35, pan: 0.2 }));
  clip(mix, 'ringhio', { t: dog + 3 * CROMA, da: 10, durata: 2.2, gain: 0.2, rate: 0.9, fadeIn: 0.1, fadeOut: 0.5, rev: 0.35, pan: 0.2 });
  timpSoft(mix, dog, { vel: 80, gain: 0.4 });
  trem(mix, 93, { t: dog + 0.9, dur: 1.6, vel: 26, gain: 0.35, att: 0.4 });
  glock(mix, 93, { t: dog + 0.9 + CROMA, vel: 30, gain: 0.25 });

  // capitolo 2: l'armadio che scivola, le tre assi che saltano, la porta che cigola sul nero, il respiro freddo
  clip(mix, 'sedia', { t: at('cantina', 0, 1.6), da: 3.5, durata: 1.4, gain: 0.22, fadeOut: 0.3, rev: 0.3, pan: 0.2 });
  [0, 1, 2].forEach((i) => {
    clip(mix, 'colpi_legno', { t: boards + i * BEAT, da: 0.56, durata: 0.38, gain: 0.4 - i * 0.04, rev: 0.4, pan: (i - 1) * 0.3 });
    clip(mix, 'legno_cade', { t: boards + i * BEAT + 0.35, da: 0, durata: 0.4, gain: 0.12, fadeOut: 0.15, rev: 0.3, lp: 2500 });
    timpSoft(mix, boards + i * BEAT, { vel: 70 + i * 10, gain: 0.35 });
  });
  clip(mix, 'porta_cigolio', { t: cellar, da: 1, durata: 1.8, gain: 0.3, fadeOut: 0.5, rev: 0.5 });
  clip(mix, 'vento_invernale', { t: cellar + 0.3, da: 3, durata: T.orologi - cellar - 0.3, gain: 0.03, fadeIn: 0.8, fadeOut: 0.8, largo: 4, rev: 0.1 });
  trem(mix, 87, { t: cellar + BEAT, dur: 2.6, vel: 24, gain: 0.3 });

  // capitolo 3: gli orologi che si fermano tutti insieme (i pizzicati tacciono, timpano forte, silenzio di due battiti),
  // l'alba grigia, il collare in cortile
  clip(mix, 'scatti', { t: clocks, da: 6.49, durata: 0.1, gain: 0.35, rev: 0.4 });
  timp(mix, clocks, { vel: 120, gain: 0.9 });
  [74, 81, 86].forEach((m) => glock(mix, m + 12, { t: clocks, vel: 40, gain: 0.25 }));
  scrape(mix, clocks + 0.05, { gain: 0.25 });
  piano(mix, 38, { t: at('orologi', 2, 0.4), dur: 3, vel: 40 });
  glock(mix, 98, { t: at('orologi', 2, 0.4) + CROMA, vel: 26, gain: 0.2 });

  // capitolo 4: la coperta tirata (stoffa e timpano), la porta della cantina che si socchiude, il colpo della porta
  clip(mix, 'stoffa', { t: pull - 0.05, da: 1, durata: 0.6, gain: 0.3, fadeOut: 0.2, rev: 0.25, pan: -0.2 });
  clip(mix, 'legno_cigolio', { t: pull + 0.1, da: 0.25, durata: 0.8, gain: 0.3, fadeOut: 0.3, rev: 0.4 });
  timpSoft(mix, pull, { vel: 95, gain: 0.5 });
  clip(mix, 'porta_cigolio', { t: at('presenze', 1, 0.4), da: 1, durata: 1.6, gain: 0.18, fadeOut: 0.5, rev: 0.6, pan: 0.3, lp: 3500 });
  clip(mix, 'porta_sbatte', { t: slam - 0.4, da: 2.6, durata: 1.2, gain: 0.4, fadeOut: 0.3, rev: 0.45, pan: 0.3 }); // colpo a +0,4
  timp(mix, slam, { vel: 120, gain: 0.95 });

  // capitolo 5: il carillon che si apre e suona il motivo; i passi di Rory (pizzicati leggeri); lo spirito (tremolo acuto)
  clip(mix, 'legno_cigolio', { t: box - 0.2, da: 2.85, durata: 0.6, gain: 0.18, fadeOut: 0.3, rev: 0.4, lp: 4000 });
  for (let k = 0; box + k * CROMA * 8 < T.warren - 0.6; k++) motivo(mix, box + k * CROMA * 8, { vel: 36 - k * 3, gain: 0.32, fino: T.warren });
  [0, 1, 2, 3, 4, 5].forEach((i) => tick(mix, 62 + (i % 2) * 5, { t: at('carillon', 1, 0.2) + i * CROMA, vel: 22, pan: -0.3 + i * 0.1 }));
  trem(mix, 98, { t: at('carillon', 2, 0.4), dur: T.warren - at('carillon', 2, 0.4), vel: 22, gain: 0.3, att: 0.6 });
  clip(mix, 'vento_leggero', { t: at('carillon', 2, 0.4), da: 4, durata: T.warren - at('carillon', 2, 0.4), gain: 0.05, fadeIn: 0.6, fadeOut: 0.8, largo: 1.6 });

  // capitolo 6: il telefono che squilla, l'organo per Ed, le campanelle per Lorraine, la candela che diventa azzurra
  const ring = at('warren', 0, 0.3);
  [0, 1.6].forEach((d) => clip(mix, 'campanello', { t: ring + d, da: 0.1, durata: 0.9, gain: 0.25, fadeOut: 0.3, rev: 0.3, pan: -0.3 }));
  organ(mix, [50, 57, 62, 65], { t: at('warren', 1, 0.3), dur: BEAT * 2, vel: 40, gain: 0.3 });
  [86, 90, 93].forEach((m, k) => glock(mix, m, { t: at('warren', 1, 0.3) + 2 * BEAT + k * CROMA, vel: 34, gain: 0.25 }));
  scrape(mix, evil, { gain: 0.35 });
  trem(mix, 38, { t: evil, dur: T.strega - evil, vel: 40, gain: 0.6 });
  trem(mix, 39, { t: evil + 0.02, dur: T.strega - evil, vel: 34, gain: 0.5 });

  // capitolo 7: i corvi che si alzano, l'orologio da taschino che si ferma (corda che cigola, timpano forte), la maledizione
  clip(mix, 'ali', { t: at('strega', 0, 0.6), da: 0, durata: 1.6, gain: 0.2, fadeOut: 0.5, rev: 0.3, pan: 0.3 });
  clip(mix, 'vento_leggero', { t: T.strega, da: 4, durata: 10, gain: 0.035, fadeIn: 1, fadeOut: 2, largo: 1.6 });
  clip(mix, 'legno_cigolio', { t: watch - 1.2, da: 0.25, durata: 0.9, gain: 0.22, fadeOut: 0.3, rev: 0.5 });
  clip(mix, 'scatti', { t: watch, da: 6.49, durata: 0.1, gain: 0.3, rev: 0.4 });
  timp(mix, watch, { vel: 120, gain: 0.95 });
  glock(mix, 86, { t: watch, vel: 34, gain: 0.25 });
  roll(mix, curse, 2.2, { gain: 0.4 });
  clip(mix, 'rombo', { t: curse, da: 4, durata: 3, gain: 0.25, fadeIn: 0.5, fadeOut: 1, rev: 0.3 });
  trem(mix, 37, { t: curse, dur: T.madri - curse, vel: 40, gain: 0.55 });

  // capitolo 8: i ritagli appuntati uno per battito, il ritaglio di Rory (motivo), lo spillo sulla fattoria (timpano forte)
  [0, 1, 2].forEach((i) => { clip(mix, 'scatti', { t: at('madri', 0, 0.8) + i * BEAT, da: 6.49, durata: 0.06, gain: 0.2, rev: 0.3, pan: (i - 1) * 0.3 }); tick(mix, 57 + i * 3, { t: at('madri', 0, 0.8) + i * BEAT, vel: 30 }); });
  motivo(mix, at('madri', 1, 1.2), { vel: 32, gain: 0.28, fino: pin - 0.3 });
  timp(mix, pin, { vel: 110, gain: 0.5 });
  piano(mix, 38, { t: pin, dur: 3, vel: 40 });

  // capitolo 9: la lettera della Chiesa (organo), i campanelli che suonano da soli, i flash, la foto che si macchia
  organ(mix, [50, 57, 62], { t: at('prove', 0, 1.0), dur: BEAT * 3, vel: 34, gain: 0.25 });
  [0, 1, 2, 3, 4].forEach((i) => clip(mix, 'campanello', { t: at('prove', 1, 0.3) + i * CROMA, da: 0.1, durata: 0.8, gain: 0.14, fadeOut: 0.3, rev: 0.45, pan: -0.4 + i * 0.2, rate: 1 + i * 0.06 }));
  [f1, f1 + 2 * BEAT].forEach((tf, i) => { clip(mix, 'scatti', { t: tf, da: 6.49, durata: 0.08, gain: 0.35, rev: 0.3, pan: i ? 0.4 : -0.4 }); timpSoft(mix, tf, { vel: 85, gain: 0.4 }); });
  clip(mix, 'scatti', { t: at('prove', 2, 0.4), da: 6.49, durata: 0.1, gain: 0.25, rev: 0.3 });
  trem(mix, 38, { t: at('prove', 2, 0.4) + 1.4, dur: T.possessione - at('prove', 2, 0.4) - 1.4, vel: 36, gain: 0.5 });
  scrape(mix, at('prove', 2, 0.4) + 1.4, { gain: 0.25 });

  // capitolo 10: la pioggia, l'insegna del motel, l'auto che torna, la porta che si apre, il tuono, le finestre che si spengono
  clip(mix, 'pioggia_vento', { t: T.possessione, da: 20, durata: T.esorcismo - T.possessione + 0.5, gain: 0.2, fadeIn: 0.6, fadeOut: 1.2, largo: 1.6 });
  const neon = at('possessione', 0, 0.5);
  clip(mix, 'ronzio_neon', { t: neon, da: 0, durata: 0.55, gain: 0.12, fadeOut: 0.05, rev: 0.2, pan: -0.5 });
  clip(mix, 'ronzio_neon', { t: neon + 0.55, da: 2.6, durata: 2.5, gain: 0.08, fadeIn: 0.05, fadeOut: 1.2, rev: 0.2, pan: -0.5 });
  clip(mix, 'auto_epoca', { t: at('possessione', 1, -1.0), da: 17.5, durata: 3.4, gain: 0.16, fadeIn: 0.4, fadeOut: 0.6, rev: 0.25 });
  clip(mix, 'porta_cigolio', { t: at('possessione', 1, 0.6) + 1.2, da: 1, durata: 1.4, gain: 0.14, fadeOut: 0.4, rev: 0.5, lp: 3500 });
  clip(mix, 'tuono_forte', { t: strike + 0.15, da: 0.3, durata: 3.5, gain: 0.5, fadeIn: 0.03, fadeOut: 1.2, rev: 0.35 });
  timp(mix, strike, { vel: 120, gain: 0.9 });
  clip(mix, 'tuono_classico', { t: strike + 2 * BEAT + 0.05, da: 0.45, durata: 2.5, gain: 0.2, fadeIn: 0.03, fadeOut: 1, rev: 0.35 });
  [74, 72, 69, 65, 62].forEach((m, i) => piano(mix, m, { t: strike + 0.4 + i * CROMA + 0.2, vel: 30 }));

  // capitolo 11: l'esorcismo cresce (organo, rullo, piatto) fino all'alba; il ricordo (motivo in maggiore e arpa);
  // l'alba: il colpo più forte del film, poi Re maggiore pieno
  organ(mix, [38, 50, 57, 62, 65], { t: fight, dur: mem - fight, vel: 40, gain: 0.32 });
  roll(mix, fight + BAR, 2.6, { gain: 0.35 });
  motivo(mix, mem, { vel: 40, gain: 0.32, mag: true });
  [62, 66, 69, 74, 78, 81].forEach((m, k) => harp(mix, m, { t: mem + k * CROMA / 2, vel: 34 }));
  organ(mix, [38, 50, 57, 62, 65], { t: mem + BAR * 0.5, dur: dawn - mem - BAR * 0.5 - BEAT, vel: 46, gain: 0.36 });
  swell(mix, dawn - 3.2, 3.2, { gain: 0.5 });
  roll(mix, dawn - 2.8, 2.8, { gain: 0.5 });
  timp(mix, dawn, { vel: 127, gain: 1.4 });
  colpo(mix, 'piatto_crash', 'cymbal_crash1_ff2', { t: dawn, vel: 110, gain: 0.5, rev: 0.6 });
  colpo(mix, 'gong', 'gong_hit_f', { t: dawn, vel: 110, gain: 0.45, rev: 0.6 });
  // Re maggiore dall'alba alla fine (finale compreso)
  const D = dawn + 0.05;
  [26, 38, 45, 50, 54, 57, 62, 66].forEach((m, j) => strings(mix, m, { t: D, dur: T.END - D - 0.2, vel: 40 - (j > 5 ? 6 : 0), gain: 0.75, pan: (j - 3.5) * 0.15, att: 0.4, seed: 90 + j }));
  organ(mix, [50, 54, 57, 62], { t: D, dur: T.finale - D, vel: 36, gain: 0.25 });
  motivo(mix, D + BEAT, { vel: 34, gain: 0.3, mag: true });
  // finale: il motivo in maggiore, lento, sull'arpa e il glockenspiel
  const F = snap(T.finale);
  MOTIVO_MAG.forEach(([b, m]) => { if (F + b * BEAT * 0.75 < T.END - 0.6) { glock(mix, m, { t: F + b * BEAT * 0.75, vel: 28, gain: 0.25 }); harp(mix, m - 12, { t: F + b * BEAT * 0.75, vel: 26 }); } });
};
