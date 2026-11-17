// Colonna sonora originale di Scissione – stagione 1 (formato "Spiegato semplice"): orchestra campionata (VSCO-2 CE e VCSL, CC0).
// 72 bpm, Si minore: Si minore · Sol maggiore · Mi minore · Fa# settima. Due mondi come nello schema (Piani.tsx):
// SOTTO il lavoro, preciso come un orologio d'ufficio (pizzicati che battono le crome, marimba per gli schermi dei numeri,
// glockenspiel per il chip); FUORI la vita privata, calda (violoncelli e pianoforte, arpa). Il motivo è inventato qui
// (Fa#, Re, Mi, Fa# · Sol, Fa#, Mi, Do#) e non richiama brani o temi della serie: niente arpeggio di pianoforte in ostinato.
// Il piano dei tre colleghi va a passo doppio (spiccato degli archi a semicrome); quando fermano Dylan tutto si spegne
// (silenzio di due battiti) e la domanda finale resta su un pianoforte solo, con il Re maggiore che non si chiude.
// Effetti agganciati agli eventi dello schema in src/scenes/scissione-stagione-1/Piani.tsx e della copertina in Locandina.tsx.
import { rng } from './synth.mjs';
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte_coda', 'arpa', 'glockenspiel', 'marimba', 'violini', 'viole', 'celli', 'contrabbasso', 'violini_pizz', 'celli_pizz', 'violini_trem', 'celli_spicc', 'viole_spicc', 'timpani', 'piatto_sospeso'];
export const effetti = ['scatti', 'portone_motore', 'campanello', 'disturbo', 'serratura', 'metallo_cade', 'pagine', 'scintille', 'vento_invernale', 'ronzio_neon', 'scariche', 'applauso_breve'];
/** Sala media e asciutta, un ufficio sotto terra. */
export const sala = { rt60: 2.2, brillo: 5200, predelay: 0.02, wet: 0.45 };

const BPM = 72;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const G0 = 4;
const CROMA = BEAT / 2;
/** I cambi di sezione cadono sul battito più vicino all'inizio del capitolo. */
const snap = (t) => G0 + Math.round((t - G0) / BEAT) * BEAT;

// ---------------------------------------------------------------- strumenti (campionati)

const drone = (mix, m, { t, dur, vel = 40, gain = 1, seed = 1 }) =>
  suona(mix, m < 40 ? 'contrabbasso' : 'celli', m, { t, dur, vel: vel + 14, gain: gain * 1.5, attack: 1.4, release: 2, rev: 0.55, seed });
const strings = (mix, m, { t, dur, vel = 40, pan = 0, gain = 1, att = 1, seed = 1 }) =>
  archi(mix, m, { t, dur, vel: vel + 8, pan, rev: 0.55, gain: gain * 1.4, attack: att, release: 1.3, seed });
const pizz = (mix, m, { t, vel = 40, pan = 0, gain = 1 }) =>
  suona(mix, m < 55 ? 'celli_pizz' : 'violini_pizz', m, { t, dur: 0.6, vel: vel * 1.6, pan, rev: 0.35, gain: gain * 1.6, release: 0.25 });
const spic = (mix, m, { t, vel = 40, pan = 0, gain = 1 }) =>
  suona(mix, m < 55 ? 'celli_spicc' : 'viole_spicc', m, { t, dur: CROMA * 0.8, vel: vel * 1.7, pan, rev: 0.3, gain: gain * 2.6, release: 0.12 });
const piano = (mix, m, { t, dur, vel, pan = 0.1 }) =>
  suona(mix, 'pianoforte_coda', m, { t, dur: Math.min(dur, 4), vel: vel * 1.2, pan, rev: 0.55, gain: 1.4, release: 0.8 });
const harp = (mix, m, { t, vel = 40, pan = -0.2 }) =>
  suona(mix, 'arpa', m, { t, dur: 2.5, vel: vel * 1.3, pan, rev: 0.55, gain: 0.9, release: 1.2 });
const mar = (mix, m, { t, vel = 40, pan = 0.2 }) =>
  suona(mix, 'marimba', m, { t, dur: 0.8, vel: vel * 1.4, pan, rev: 0.35, gain: 0.9, release: 0.4 });
const bell = (mix, m, { t, vel = 44, pan = 0.25, gain = 1 }) =>
  suona(mix, 'glockenspiel', m < 79 ? m + 12 * Math.ceil((79 - m) / 12) : m, { t, dur: 2.5, vel: vel * 1.3, pan, rev: 0.7, gain: gain * 0.28, release: 1.5 });
const timp = (mix, t, { vel = 100, gain = 0.8, pan = 0 } = {}) => colpo(mix, 'timpani', 'Timpani1_Hit_v2_rr1_Sum', { t, vel, gain, pan, rev: 0.45 });
const swell = (mix, t, dur, { gain = 0.5 } = {}) => colpo(mix, 'piatto_sospeso', 'susp_FX_scrape_continuous', { t, dur, vel: 90, gain, release: 0.4, rev: 0.5, da: 2 });

// ---------------------------------------------------------------- materiale musicale

// accordi per battuta: Si minore · Sol maggiore · Mi minore · Fa# settima
const CHORDS = [[47, [0, 7, 12, 15, 19]], [43, [0, 7, 12, 16, 19]], [40, [0, 7, 12, 15, 19]], [42, [0, 7, 10, 16, 19]]];
// il motivo (a semiminime, su due battute): Fa# Re Mi Fa# · Sol Fa# Mi Do#
const MOTIF = [[0, 78], [1, 74], [2, 76], [3, 78], [4, 79], [5, 78], [6, 76], [7, 73]];

export default (mix, T) => {
  const film = loadFilm('scissione-stagione-1');
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
  /** Istante (assoluto) della frase n più d, sulla croma della griglia: gli stessi istanti degli eventi di Piani.tsx. */
  const at = (id, n, d = 0) => G0 + Math.round((C(id, n) + d - G0) / CROMA) * CROMA;
  let sid = 0;

  /**
   * Una sezione da `from` a `to`.
   * drone · str (archi tenuti) · pizz: pizzicati a crome (l'orologio dell'ufficio) · mar: marimba a semicrome (gli schermi)
   * harp: arpa a semiminime · spic: archi in spiccato (doppio = semicrome) · mel: il motivo al pianoforte · bells
   * pausa: [da, a] silenzio delle figure (dopo un colpo forte)
   */
  const sec = (from, to, o) => {
    const t00 = from <= 0 ? 0 : snap(from);
    from = t00; to = snap(to);
    const fino = o.fino ?? to;
    const R = rng(9100 + sid++ * 137);
    const tacet = (x) => o.pausa && x >= o.pausa[0] && x < o.pausa[1];
    if (o.drone) {
      drone(mix, 35, { t: t00, dur: fino - t00 + 0.4, vel: o.drone, gain: 0.7, seed: sid });
      drone(mix, 47, { t: t00, dur: fino - t00 + 0.4, vel: o.drone * 0.8, gain: 0.5, seed: sid + 50 });
    }
    for (let k = 0, t = from; t < to - 0.3; k++, t += BAR) {
      const [root, iv] = CHORDS[k % 4];
      const d = Math.min(BAR * 1.02, fino - t);
      if (o.str) [iv[1], iv[2], iv[3]].forEach((v, j) => strings(mix, root + 12 + v, { t: t + j * 0.04, dur: d, vel: o.str, gain: 0.9, pan: (j - 1) * 0.35, seed: j + k }));
      if (o.pizz) {
        // l'orologio: tonica, quinta, ottava, quinta a crome, con l'accento sul battere
        const notes = [root, root + 7, root + 12, root + 7];
        for (let i = 0; i < 8 && t + i * CROMA < to - 0.05; i++) {
          if (tacet(t + i * CROMA)) continue;
          pizz(mix, notes[i % 4] + (i % 4 === 2 ? 12 : 0), { t: t + i * CROMA, vel: o.pizz * (i % 4 === 0 ? 1 : 0.7), pan: i % 2 ? 0.3 : -0.3 });
        }
      }
      if (o.mar) {
        for (let i = 0; i < 16 && t + i * CROMA / 2 < to - 0.05; i++) {
          if (tacet(t + i * CROMA / 2) || (i % 4 === 3 && R() < 0.5)) continue;
          const m = root + 24 + iv[[1, 2, 3, 2, 4, 3, 2, 1][i % 8]];
          mar(mix, m, { t: t + i * CROMA / 2, vel: o.mar * (i % 4 === 0 ? 1 : 0.72), pan: 0.25 });
        }
      }
      if (o.harp) for (let i = 0; i < 4 && t + i * BEAT < to - 0.05; i++) if (!tacet(t + i * BEAT)) harp(mix, root + 24 + iv[i % 5], { t: t + i * BEAT, vel: o.harp });
      if (o.spic) {
        const step = o.doppio ? CROMA / 2 : CROMA;
        const notes = [root, root + iv[1], root + 12, root + iv[1]];
        for (let i = 0; t + i * step < Math.min(t + BAR, to) - 0.05; i++) {
          if (tacet(t + i * step)) continue;
          spic(mix, notes[i % 4] + 12, { t: t + i * step, vel: o.spic * (i % (o.doppio ? 4 : 2) === 0 ? 1 : 0.72), pan: i % 2 ? 0.25 : -0.25 });
        }
      }
      if (o.mel && k % 2 === 0) {
        for (const [b, mm] of MOTIF) {
          const tt = t + b * BEAT;
          if (tt >= to - 0.2 || tacet(tt) || R() > (o.keep ?? 1)) continue;
          piano(mix, mm + (o.oct ?? 0), { t: tt, dur: BEAT * 1.4, vel: o.mel, pan: 0.15 });
          if (o.bells) bell(mix, mm + 12, { t: tt + 0.01, vel: o.bells, pan: 0.3 });
        }
      }
    }
  };

  // ---- eventi delle scene (gli stessi istanti di Piani.tsx)
  const cut0 = at('scissione', 2, 0), cut1 = cut0 + 1.6;
  const split = at('ascensore', 0, 0.3) + 1.0;
  const no = at('helly', 2, 0.3);
  const peteyDies = at('petey', 3, 0.6);
  const tOff = at('casey', 3, 0.3);
  const viva = at('casey', 2, 0.1);

  // ---- sezioni (tempi dal JSON, sul battito)
  sec(0, T.scissione, { drone: 30, harp: 32, mel: 40 });
  sec(T.scissione, T.ascensore, { drone: 34, pizz: 26, mel: 38, bells: 28, keep: 0.9 });
  sec(T.ascensore, T.mark, { drone: 36, pizz: 30, str: 26, pausa: [split - 0.05, split + BEAT] });
  sec(T.mark, T.ufficio, { drone: 34, str: 34, harp: 34, mel: 40 });
  sec(T.ufficio, T.helly, { drone: 34, pizz: 30, mar: 30, bells: 26 });
  sec(T.helly, T.petey, { drone: 40, pizz: 30, str: 32, pausa: [no - 0.05, no + 2 * BEAT] });
  sec(T.petey, T.cobel, { drone: 36, harp: 34, str: 30, mel: 38, pausa: [peteyDies - 0.05, peteyDies + 2 * BEAT] });
  sec(T.cobel, T.risveglio, { drone: 40, pizz: 28, str: 34, keep: 0.8 });
  sec(T.risveglio, T.fuori, { drone: 38, mar: 28, harp: 32, mel: 36, bells: 32 });
  sec(T.fuori, T.casey, { drone: 46, spic: 50, doppio: true, str: 46, pizz: 26 });
  sec(T.casey, tOff, { drone: 44, str: 46, mel: 44, spic: 34, oct: 0 });

  // dopo il buio: due battiti di silenzio, poi la domanda su un pianoforte solo e un Re maggiore che resta aperto
  const Q = snap(tOff + 2 * BEAT);
  [38, 50, 57, 62, 66].forEach((m, j) => strings(mix, m, { t: Q, dur: T.END - Q - 0.3, vel: 32, gain: 0.5, pan: (j - 2) * 0.2, att: 1.2, seed: 70 + j }));
  [78, 74, 76, 78, 79, 81].forEach((m, k) => piano(mix, m, { t: Q + k * BEAT, dur: BEAT * 1.5, vel: 34 }));
  const F = snap(T.finale);
  [62, 66, 69, 74].forEach((m, k) => harp(mix, m + 12, { t: F + k * CROMA, vel: 32 }));
  [81, 86].forEach((m, k) => bell(mix, m, { t: F + 1.6 + k * BEAT, vel: 32 }));

  // ---------------------------------------------------------------- effetti
  // copertina: il vento d'inverno e il corridoio che ronza; le forbici sulla linea
  clip(mix, 'vento_invernale', { t: 0, da: 2, durata: 4.2, gain: 0.06, fadeIn: 0.05, fadeOut: 1.2, largo: 1.5 });
  clip(mix, 'ronzio_neon', { t: 0, da: 1, durata: 4, gain: 0.05, fadeIn: 0.05, fadeOut: 1, lp: 4000 });
  // capitolo 1: Lumon (vento fuori), il piano segreto (ronzio), il chip (campanelle), la linea tagliata dalle forbici
  clip(mix, 'vento_invernale', { t: T.scissione, da: 6, durata: 3.2, gain: 0.05, fadeIn: 0.3, fadeOut: 1.2, largo: 1.5 });
  clip(mix, 'ronzio_neon', { t: at('scissione', 0, 1.6), da: 1, durata: 3, gain: 0.05, fadeIn: 0.6, fadeOut: 1.2, lp: 4000 });
  [83, 88, 91].forEach((m, k) => bell(mix, m, { t: at('scissione', 1, 0.2) + k * CROMA / 2, vel: 40 }));
  for (let k = 0; k < 4; k++) clip(mix, 'scatti', { t: cut0 + k * CROMA, da: 6.49, durata: 0.06, gain: 0.35, rev: 0.15, pan: -0.6 + k * 0.4 });
  swell(mix, cut0, cut1 - cut0, { gain: 0.3 });
  timp(mix, snap(cut1), { vel: 100, gain: 0.8 });
  // capitolo 2: la cabina scende (motore), si sdoppia sulla linea (scatti e campanelle), arriva (campanello), risale
  clip(mix, 'portone_motore', { t: at('ascensore', 0, 0.3), da: 2, durata: at('ascensore', 1, -0.1) - at('ascensore', 0, 0.3), gain: 0.1, fadeIn: 0.2, fadeOut: 0.3, lp: 2500 });
  clip(mix, 'scatti', { t: split, da: 6.49, durata: 0.06, gain: 0.45, rev: 0.2 });
  [79, 74].forEach((m, k) => bell(mix, m, { t: split + k * CROMA, vel: 40 }));
  clip(mix, 'campanello', { t: at('ascensore', 1, -0.1), da: 0, durata: 1.2, gain: 0.25, fadeOut: 0.5, rev: 0.3 });
  clip(mix, 'portone_motore', { t: at('ascensore', 2, 0), da: 2, durata: 1.4, gain: 0.1, fadeIn: 0.2, fadeOut: 0.3, lp: 2500 });
  clip(mix, 'campanello', { t: at('ascensore', 2, 1.4), da: 0, durata: 1.2, gain: 0.2, fadeOut: 0.5, rev: 0.3 });
  timp(mix, at('ascensore', 3, 0.3), { vel: 80, gain: 0.5 });
  // capitolo 3: Mark, la foto di Gemma (un Si grave al pianoforte), «non sa niente di lei» (campanelle)
  piano(mix, 35, { t: at('mark', 0, 1.6), dur: 3, vel: 40 });
  [74, 71, 66].forEach((m, k) => bell(mix, m, { t: at('mark', 2, 0.3) + k * CROMA, vel: 34 }));
  // capitolo 4: i numeri che tremano (archi in tremolo) e finiscono nel cestino; il benessere (arpa)
  const lente = at('ufficio', 1, 0.1);
  archi(mix, 71, { t: lente + 0.8, dur: 1.4, vel: 40, gain: 0.6, attack: 0.3, release: 0.4, rev: 0.4 });
  suona(mix, 'violini_trem', 72, { t: lente + 0.8, dur: 1.4, vel: 50, gain: 0.7, attack: 0.3, release: 0.4, rev: 0.4 });
  clip(mix, 'metallo_cade', { t: lente + 3.0, da: 0, durata: 0.6, gain: 0.25, fadeOut: 0.2, rev: 0.25 });
  [71, 74, 78, 83].forEach((m, k) => harp(mix, m, { t: at('ufficio', 2, 0.3) + k * CROMA / 2, vel: 34 }));
  // capitolo 5: Helly arriva in ascensore; il video dell'esterna (disturbo) e il NO (timpano, poi silenzio); la serratura
  clip(mix, 'portone_motore', { t: at('helly', 0, 0), da: 2, durata: 1.2, gain: 0.1, fadeIn: 0.2, fadeOut: 0.3, lp: 2500 });
  clip(mix, 'campanello', { t: at('helly', 0, 1.2), da: 0, durata: 1.2, gain: 0.22, fadeOut: 0.5, rev: 0.3 });
  clip(mix, 'disturbo', { t: at('helly', 2, 0), da: 1, durata: 0.9, gain: 0.12, fadeIn: 0.05, fadeOut: 0.2 });
  timp(mix, no, { vel: 115, gain: 1.3 });
  clip(mix, 'serratura', { t: at('helly', 3, 0.3), da: 0, durata: 0.8, gain: 0.35, fadeOut: 0.2, rev: 0.25 });
  // capitolo 6: le due metà di Petey si riuniscono (campanelle che salgono), la mappa (carta), muore (timpano, silenzio)
  [66, 71, 74, 78, 83].forEach((m, k) => bell(mix, m, { t: at('petey', 1, 0.2) + k * CROMA / 2, vel: 36 }));
  clip(mix, 'pagine', { t: at('petey', 2, 0.1), da: 1, durata: 1.0, gain: 0.28, fadeOut: 0.3, rev: 0.2 });
  timp(mix, peteyDies, { vel: 110, gain: 1.1 });
  // capitolo 7: la linea senza chip attraversa la scissione (scintille); «lo spia» (celli gravi)
  clip(mix, 'scintille', { t: at('cobel', 1, 0.8), da: 1, durata: 0.8, gain: 0.18, fadeIn: 0.02, fadeOut: 0.3 });
  drone(mix, 30, { t: at('cobel', 3, 0.3), dur: 3, vel: 46, gain: 0.6, seed: 91 });
  // capitolo 8: le manopole (scatti), il risveglio che sale (arpa), il figlio (campanelle calde)
  clip(mix, 'scatti', { t: at('risveglio', 0, 0.2), da: 6.49, durata: 0.06, gain: 0.45, rev: 0.2 });
  clip(mix, 'scatti', { t: at('risveglio', 0, 0.2) + CROMA, da: 6.49, durata: 0.06, gain: 0.4, rev: 0.2 });
  [59, 62, 66, 71, 74, 78].forEach((m, k) => harp(mix, m, { t: at('risveglio', 1, -0.6) + k * CROMA / 2, vel: 36 }));
  [79, 83].forEach((m, k) => bell(mix, m, { t: at('risveglio', 1, 1.6) + k * CROMA, vel: 34 }));
  timp(mix, at('risveglio', 2, 0.2), { vel: 90, gain: 0.6 });
  // capitolo 9: le manopole accese, tre interni fuori (campanelle), il palco (applauso breve e lontano)
  clip(mix, 'scatti', { t: at('fuori', 0, 0.2), da: 6.49, durata: 0.06, gain: 0.45, rev: 0.2 });
  [71, 74, 78].forEach((m, k) => bell(mix, m, { t: at('fuori', 1, 0.1) + k * CROMA, vel: 36 }));
  clip(mix, 'applauso_breve', { t: at('fuori', 3, 0.2), da: 0.5, durata: 2.2, gain: 0.08, fadeIn: 0.3, fadeOut: 1.0, largo: 1.4 });
  // capitolo 10: la linea rossa fino a Casey, «Gemma è viva» (piatto e timpano), il buio (scarica, poi silenzio)
  swell(mix, viva - 1.4, 1.4, { gain: 0.35 });
  timp(mix, viva, { vel: 120, gain: 1.5 });
  clip(mix, 'scariche', { t: tOff, da: 1, durata: 0.6, gain: 0.25, fadeOut: 0.3 });
  timp(mix, tOff, { vel: 125, gain: 1.6 });
};
