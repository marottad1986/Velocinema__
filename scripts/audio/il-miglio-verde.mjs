// Colonna sonora originale del Miglio verde, discreta sotto la voce.
// Strumenti veri campionati (VSCO-2 CE e VCSL, CC0): pianoforte a coda, arpa, archi, contrabbasso pizzicato,
// glockenspiel per i miracoli, timpani. Un tema inventato qui, semplice come una ninna nanna, in Fa maggiore e in 4/4 a
// 72 bpm (10 s = 3 battute); il Sud degli anni '30 nel contrabbasso pizzicato e nell'arpa. Nell'esecuzione e nello sparo
// lo stesso tema passa in Re minore sugli archi gravi; l'ultimo capitolo torna in Fa maggiore, aperto.
// Niente brani o temi del film (né la colonna sonora originale né la canzone di Cappello a cilindro).
// Effetti registrati (archivio CC0 di Craig Smith: scripts/audio/effetti.mjs) agganciati agli eventi delle scene in
// src/scenes/il-miglio-verde/, con gli stessi istanti di griglia() (crome a 72 bpm).
import { rng } from './synth.mjs';
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte_coda', 'arpa', 'violini', 'viole', 'celli', 'contrabbasso', 'contrabbasso_pizz', 'glockenspiel', 'timpani', 'piatto_sospeso'];
export const effetti = ['pioggia_vento', 'scatti', 'serratura', 'porta_cigolio', 'colpi_legno', 'api', 'scariche', 'pistola', 'vetri', 'auto_epoca', 'porta_sbatte', 'vento_leggero', 'portone_motore'];
/** Sala media e calda, di legno. */
export const sala = { rt60: 2.2, brillo: 5600, predelay: 0.025, wet: 0.48 };

const BPM = 72;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const CROMA = BEAT / 2;
const G0 = 4;
const snap = (t) => G0 + Math.round((t - G0) / BEAT) * BEAT;

// accordi per battuta: Fa · Re minore · Si bemolle · Do (e in minore: Re minore · Si bemolle · Sol minore · La)
const CH = [[41, [0, 4, 7]], [38, [0, 3, 7]], [34, [0, 4, 7]], [36, [0, 4, 7]]];
const CH_MIN = [[38, [0, 3, 7]], [34, [0, 4, 7]], [43, [0, 3, 7]], [45, [0, 4, 7]]];
// il tema (due battute, a semiminime): La Do Fa Mi · Re Do La Sol
const THEME = [[0, 69], [1, 72], [2, 77], [3, 76], [4, 74], [5, 72], [6, 69], [7, 67]];

const piano = (mix, m, { t, dur = BEAT * 1.4, vel = 40, pan = 0.1 }) =>
  suona(mix, 'pianoforte_coda', m, { t, dur: Math.min(dur, 4), vel: vel * 1.2, pan, rev: 0.55, gain: 1.6, release: 0.8 });
const harp = (mix, m, { t, vel = 36, pan = -0.2 }) =>
  suona(mix, 'arpa', m, { t, dur: 2.4, vel: vel * 1.3, pan, rev: 0.55, gain: 0.9, release: 1.2 });
const bell = (mix, m, { t, vel = 40, pan = 0.25 }) =>
  suona(mix, 'glockenspiel', m < 79 ? m + 12 * Math.ceil((79 - m) / 12) : m, { t, dur: 2.5, vel: vel * 1.3, pan, rev: 0.75, gain: 0.3, release: 1.5 });
const strings = (mix, m, { t, dur, vel = 40, pan = 0, gain = 0.8, att = 1, seed = 1 }) =>
  archi(mix, m, { t, dur, vel: vel + 8, pan, rev: 0.6, gain: gain * 1.3, attack: att, release: 1.3, seed });
const pizz = (mix, m, { t, vel = 50 }) => suona(mix, 'contrabbasso_pizz', m, { t, dur: 1.2, vel: vel * 1.4, rev: 0.4, gain: 1.4, release: 0.5 });
const timp = (mix, t, { vel = 100, gain = 0.8 } = {}) => colpo(mix, 'timpani', 'Timpani1_Hit_v2_rr1_Sum', { t, vel, gain, rev: 0.45 });
const swell = (mix, t, dur, { gain = 0.4 } = {}) => colpo(mix, 'piatto_sospeso', 'susp_FX_scrape_continuous', { t, dur, vel: 90, gain, release: 0.4, rev: 0.5, da: 2 });

export default (mix, T) => {
  const film = loadFilm('il-miglio-verde');
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
   * str: archi tenuti · pz: contrabbasso pizzicato sui battiti 1 e 3 · harp: arpa a semiminime · mel: il tema al pianoforte
   * min: accordi e tema in Re minore · bells: il tema raddoppiato in campanelle · pausa: [da, a] silenzio delle figure
   */
  const sec = (from, to, o) => {
    from = from <= 0 ? 0 : snap(from); to = snap(to);
    const R = rng(4100 + sid++ * 131);
    const chords = o.min ? CH_MIN : CH;
    const tacet = (x) => o.pausa && x >= o.pausa[0] && x < o.pausa[1];
    for (let k = 0, t = from; t < to - 0.3; k++, t += BAR) {
      const [root, iv] = chords[k % 4];
      const d = Math.min(BAR * 1.02, to - t + 0.2);
      if (o.str) iv.forEach((v, j) => strings(mix, root + 12 + v, { t: t + j * 0.04, dur: d, vel: o.str, pan: (j - 1) * 0.3, seed: k + j }));
      if (o.str && o.low) strings(mix, root, { t, dur: d, vel: o.str, gain: 0.7, seed: 50 + k });
      if (o.pz) [0, 2].forEach((b) => { const tt = t + b * BEAT; if (tt < to - 0.1 && !tacet(tt)) pizz(mix, root + (b ? 7 : 0), { t: tt, vel: o.pz }); });
      if (o.harp) for (let i = 0; i < 4 && t + i * BEAT < to - 0.1; i++) if (!tacet(t + i * BEAT)) harp(mix, root + 24 + iv[i % 3] + (i === 3 ? 12 : 0), { t: t + i * BEAT, vel: o.harp });
      if (o.mel && k % 2 === 0) {
        for (const [b, m0] of THEME) {
          const tt = t + b * BEAT;
          const m = o.min ? (m0 - 3) - ([6, 11, 1].includes((m0 - 3) % 12) ? 1 : 0) : m0; // Re minore naturale: Fa La Re Do · Sib La Fa Mi
          if (tt >= to - 0.2 || tacet(tt) || R() > (o.keep ?? 1)) continue;
          piano(mix, m + (o.oct ?? 0), { t: tt, vel: o.mel });
          if (o.bells) bell(mix, m + 12, { t: tt + 0.01, vel: o.bells });
        }
      }
    }
  };

  // ---- eventi delle scene (gli stessi istanti di griglia())
  const hit = at('percy', 0, 0.8);
  const burn = at('spugna', 2, 0.4);
  const shot = at('wharton', 1, 1.2);
  const shut = at('film', 0, 1.2);

  // ---- sezioni
  sec(0, T.cornice, { harp: 30, mel: 34, bells: 26 });
  sec(T.cornice, T.miglio, { str: 26, harp: 30, mel: 34, keep: 0.9 });
  sec(T.miglio, T.coffey, { str: 32, pz: 36, mel: 34 });
  sec(T.coffey, T.percy, { str: 30, harp: 32, mel: 36, bells: 24 });
  sec(T.percy, T.guarigione, { str: 26, pz: 40, mel: 32, keep: 0.8, pausa: [hit - 0.05, hit + BEAT - 0.05] });
  sec(T.guarigione, T.spugna, { str: 34, harp: 30, mel: 32, bells: 34, oct: 12 });
  sec(T.spugna, T.melinda, { str: 38, low: true, min: true, mel: 30, pausa: [burn - 0.05, burn + 2 * BEAT - 0.05] });
  sec(T.melinda, T.wharton, { str: 28, harp: 28, mel: 30, bells: 22 });
  sec(T.wharton, T.verita, { str: 44, low: true, min: true, pz: 40, mel: 30, pausa: [shot - 0.05, shot + 2 * BEAT - 0.05] });
  sec(T.verita, T.film, { str: 22, harp: 26, mel: 28, keep: 0.85 });
  sec(T.film, T.jingles, { str: 30, pz: 30, mel: 34, pausa: [shut + 0.35, shut + 0.4 + BEAT - 0.05] });
  sec(T.jingles, T.finale, { str: 24, harp: 26, mel: 30, bells: 24 });
  // finale: Fa maggiore aperto, il tema in campanelle
  const F = snap(T.finale);
  [29, 41, 48, 53, 57, 60, 65].forEach((m, j) => strings(mix, m, { t: F, dur: T.END - F - 0.2, vel: 32, gain: 0.7, pan: (j - 3) * 0.18, att: 0.6, seed: 80 + j }));
  THEME.slice(0, 4).forEach(([b, m]) => bell(mix, m + 12, { t: F + 0.5 + b * CROMA, vel: 28 }));
  for (let i = 0; i < 4; i++) harp(mix, [53, 57, 60, 65][i] + 12, { t: F + i * BEAT, vel: 26 });
  THEME.forEach(([b, m]) => { if (F + b * CROMA < T.END - 0.8) piano(mix, m, { t: F + b * CROMA, vel: 26 }); });

  // ---------------------------------------------------------------- effetti
  // copertina: la pioggia lontana fuori dal corridoio
  clip(mix, 'pioggia_vento', { t: 0, da: 6, durata: 4.2, gain: 0.22, fadeIn: 0.3, fadeOut: 1.2, largo: 1.6 });
  // capitolo 1: la pioggia alla finestra; il rocchetto che si accende (campanelle); verso il 1935 (arpa che sale)
  clip(mix, 'pioggia_vento', { t: T.cornice, da: 10, durata: 10.5, gain: 0.22, fadeIn: 0.8, fadeOut: 1.5, largo: 1.6 });
  [81, 84, 89].forEach((m, k) => bell(mix, m, { t: at('cornice', 1, 0.3) + k * CROMA, vel: 34 }));
  [53, 57, 60, 65, 69, 72].forEach((m, k) => harp(mix, m + 12, { t: at('cornice', 2) + k * CROMA / 2, vel: 32 }));
  // capitolo 2: le lampade si accendono una dopo l'altra (interruttori), la porta in fondo che si spalanca, la cella che si apre
  [0, 1, 2, 3].forEach((k) => clip(mix, 'scatti', { t: at('miglio', 0, 0.2) + k * CROMA, da: 6.49, durata: 0.08, gain: 0.25, rev: 0.35, pan: -0.2 + k * 0.1 }));
  clip(mix, 'porta_cigolio', { t: at('miglio', 2, 0.3), da: 1, durata: 1.4, gain: 0.25, fadeOut: 0.4, rev: 0.5 });
  timp(mix, at('miglio', 2, 0.3), { vel: 80, gain: 0.45 });
  clip(mix, 'serratura', { t: at('miglio', 2, 1.2), da: 0.2, durata: 0.7, gain: 0.3, rev: 0.4 });
  // capitolo 3: il fascio sulle scarpe (timpano sordo), la luce che si spegne (interruttore)
  timp(mix, at('coffey', 0, 0.6), { vel: 75, gain: 0.4 });
  clip(mix, 'scatti', { t: at('coffey', 1, 0.8), da: 6.49, durata: 0.1, gain: 0.3, rev: 0.4 });
  bell(mix, 77, { t: at('coffey', 1, 1.2), vel: 30 });
  // capitolo 4: il manganello batte sul tavolo, il sigillo, il topolino che arriva (pizzicato leggero sopra)
  clip(mix, 'colpi_legno', { t: hit, da: 0.56, durata: 0.38, gain: 0.45, rev: 0.35 });
  clip(mix, 'colpi_legno', { t: at('percy', 1, 1.4), da: 2.42, durata: 0.45, gain: 0.25, rev: 0.3 });
  [72, 76, 79, 76, 77, 74, 72].forEach((m, k) => suona(mix, 'arpa', m + 12, { t: at('percy', 2, 0.2) + k * CROMA, dur: 1, vel: 40, pan: 0.3, rev: 0.4, gain: 0.7, release: 0.5 }));
  // capitolo 5: il tocco (piatto che cresce e campanelle), lo sciame (api), la calma
  swell(mix, at('guarigione', 0, 1.4) - 1, 1, { gain: 0.3 });
  [81, 84, 89, 93, 96].forEach((m, k) => bell(mix, m, { t: at('guarigione', 0, 1.4) + k * CROMA / 2, vel: 36 }));
  clip(mix, 'api', { t: at('guarigione', 1, 0.6), da: 2, durata: 3.2, gain: 0.12, fadeIn: 0.4, fadeOut: 1.2, rev: 0.4 });
  // capitolo 6: il topolino guarito (campanelle), la spugna secca (nota grave), la scossa (scariche e timpano, due lampi)
  [86, 89, 93].forEach((m, k) => bell(mix, m, { t: at('spugna', 0, 1.2) + k * CROMA, vel: 32 }));
  piano(mix, 38, { t: at('spugna', 1, 0.4), dur: 3, vel: 40 });
  clip(mix, 'scariche', { t: burn, da: 1.7, durata: 2.25, gain: 0.3, fadeOut: 0.8, rev: 0.35 });
  timp(mix, burn, { vel: 115, gain: 1.0 });
  timp(mix, burn + 1.25, { vel: 100, gain: 0.7 });
  // capitolo 7: la pioggia, il camioncino che arriva, la guarigione (Fa maggiore, campanelle)
  clip(mix, 'pioggia_vento', { t: T.melinda, da: 20, durata: 11.3, gain: 0.22, fadeIn: 0.8, fadeOut: 1.5, largo: 1.6 });
  clip(mix, 'auto_epoca', { t: at('melinda', 1, -0.4), da: 17.5, durata: 2.2, gain: 0.14, fadeIn: 0.4, fadeOut: 0.6, rev: 0.25 });
  [81, 84, 89, 93, 96, 101].forEach((m, k) => bell(mix, m, { t: at('melinda', 2, 0.4) + k * CROMA / 2, vel: 36 }));
  // capitolo 8: lo sciame che passa, i due spari, le lampade che scoppiano, lo sciame che esce
  clip(mix, 'api', { t: at('wharton', 0, 0.6), da: 6, durata: 1.8, gain: 0.12, fadeIn: 0.3, fadeOut: 0.6, rev: 0.4 });
  clip(mix, 'pistola', { t: shot, da: 0.05, durata: 1.0, gain: 0.55, fadeOut: 0.5, rev: 0.4 });
  clip(mix, 'pistola', { t: shot + 0.42, da: 0.05, durata: 1.2, gain: 0.5, fadeOut: 0.6, rev: 0.4 });
  timp(mix, shot, { vel: 120, gain: 1.1 });
  clip(mix, 'vetri', { t: shot - 0.03, da: 0, durata: 1.4, gain: 0.25, rev: 0.4 });
  clip(mix, 'api', { t: at('wharton', 2, 0.5), da: 10, durata: 2.6, gain: 0.1, fadeIn: 0.3, fadeOut: 1.2, rev: 0.45 });
  // capitolo 9: il vento sulla campagna del ricordo; il cappello (nota grave in minore)
  clip(mix, 'vento_leggero', { t: T.verita, da: 4, durata: 10, gain: 0.05, fadeIn: 1, fadeOut: 2, largo: 1.6 });
  piano(mix, 38, { t: at('verita', 1, 1.4), dur: 2.5, vel: 42 });
  piano(mix, 45, { t: at('verita', 1, 1.4), dur: 2.5, vel: 34 });
  // capitolo 10: la porta della cella che si richiude, il proiettore che parte
  clip(mix, 'porta_sbatte', { t: shut, da: 2.6, durata: 1.2, gain: 0.3, fadeOut: 0.3, rev: 0.4 }); // cigolio mentre l'anta gira, colpo a +0,4
  timp(mix, shut + 0.4, { vel: 90, gain: 0.55 });
  clip(mix, 'portone_motore', { t: at('film', 2, 0.2), da: 1.9, durata: T.jingles - at('film', 2, 0.2), gain: 0.06, fadeIn: 0.4, fadeOut: 0.6, rev: 0.3 });
  // capitolo 11: la candela che si spegne, il topolino che alza la testa (campanelle)
  harp(mix, 65, { t: at('jingles', 0, 1.6), vel: 26 }); // la candela che si spegne: una nota morbida e scura
  [81, 84, 89].forEach((m, k) => bell(mix, m, { t: at('jingles', 1, 0.8) + k * CROMA, vel: 34 }));
};
