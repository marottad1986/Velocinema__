// Colonna sonora originale di Donnie Darko (formato "Spiegato semplice"): pianoforte a coda sospeso, arpa, archi gravi e
// campanelle per le visioni (campionati, VSCO-2 CE e VCSL, CC0). 60 bpm: un battito al secondo, come il contatore dei
// 28 giorni in alto a destra (Copia.tsx), che ticchetta piano sotto la musica. Mi minore, accordi Mi minore · Do maggiore
// settima · La minore · Si settima; il motivo è inventato qui (Si, Mi, Re, Si · Do, Si, Sol, Fa#) e non richiama brani
// o temi del film (né la colonna sonora originale né le canzoni anni '80 usate nel film).
// Il vortice va a passo doppio (spiccato degli archi a semicrome); il finale si scioglie in Mi maggiore quando il mondo è salvo.
// Effetti agganciati agli eventi dello schema in src/scenes/donnie-darko/Copia.tsx e della copertina in Locandina.tsx.
import { rng } from './synth.mjs';
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte_coda', 'arpa', 'glockenspiel', 'violini', 'viole', 'celli', 'contrabbasso', 'violini_trem', 'celli_spicc', 'viole_spicc', 'timpani', 'grancassa', 'piatto_sospeso'];
export const effetti = ['scatti', 'metallo_schianto', 'rombo', 'pagine', 'onde', 'fuoco', 'fiammata', 'auto_epoca', 'colpi_cavi', 'pugno', 'vento_raffiche', 'aereo', 'metallo_colpi', 'passaggio'];
/** Sala grande e scura, notte di periferia. */
export const sala = { rt60: 2.8, brillo: 4800, predelay: 0.03, wet: 0.52 };

const BPM = 60;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const G0 = 4;
const CROMA = BEAT / 2;
/** I cambi di sezione cadono sul battito più vicino all'inizio del capitolo. */
const snap = (t) => G0 + Math.round((t - G0) / BEAT) * BEAT;

// ---------------------------------------------------------------- strumenti (campionati)

const drone = (mix, m, { t, dur, vel = 40, gain = 1, seed = 1 }) =>
  suona(mix, m < 40 ? 'contrabbasso' : 'celli', m, { t, dur, vel: vel + 14, gain: gain * 1.5, attack: 1.6, release: 2, rev: 0.6, seed });
const strings = (mix, m, { t, dur, vel = 40, pan = 0, gain = 1, att = 1, seed = 1 }) =>
  archi(mix, m, { t, dur, vel: vel + 8, pan, rev: 0.6, gain: gain * 1.4, attack: att, release: 1.4, seed });
const spic = (mix, m, { t, vel = 40, pan = 0, gain = 1 }) =>
  suona(mix, m < 55 ? 'celli_spicc' : 'viole_spicc', m, { t, dur: CROMA * 0.8, vel: vel * 1.7, pan, rev: 0.35, gain: gain * 2.6, release: 0.12 });
const piano = (mix, m, { t, dur, vel, pan = 0.1 }) =>
  suona(mix, 'pianoforte_coda', m, { t, dur: Math.min(dur, 4), vel: vel * 1.2, pan, rev: 0.6, gain: 3.6, release: 0.8 });
const harp = (mix, m, { t, vel = 40, pan = -0.2 }) =>
  suona(mix, 'arpa', m, { t, dur: 2.5, vel: vel * 1.3, pan, rev: 0.6, gain: 1.6, release: 1.2 });
const bell = (mix, m, { t, vel = 44, pan = 0.25, gain = 1 }) =>
  suona(mix, 'glockenspiel', m < 79 ? m + 12 * Math.ceil((79 - m) / 12) : m, { t, dur: 2.5, vel: vel * 1.3, pan, rev: 0.75, gain: gain * 0.42, release: 1.5 });
const timp = (mix, t, { vel = 100, gain = 0.8, pan = 0 } = {}) => colpo(mix, 'timpani', 'Timpani1_Hit_v2_rr1_Sum', { t, vel, gain, pan, rev: 0.45 });
/** Il piatto sospeso strisciato: un'onda che cresce (il crollo, il riavvolgimento). */
const swell = (mix, t, dur, { gain = 0.5 } = {}) => colpo(mix, 'piatto_sospeso', 'susp_FX_scrape_continuous', { t, dur, vel: 90, gain, release: 0.4, rev: 0.5, da: 2 });

// ---------------------------------------------------------------- materiale musicale

// accordi per battuta: Mi minore · Do maggiore (con la settima) · La minore · Si settima
const CHORDS = [[40, [0, 7, 12, 15, 19]], [36, [0, 7, 11, 16, 19]], [45, [0, 7, 12, 15, 19]], [47, [0, 4, 10, 15, 18]]];
// il motivo (a semiminime, su due battute): Si Mi Re Si · Do Si Sol Fa#
const MOTIF = [[0, 71], [1, 76], [2, 74], [3, 71], [4, 72], [5, 71], [6, 67], [7, 66]];

export default (mix, T) => {
  const film = loadFilm('donnie-darko');
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
  /** Istante (assoluto) della frase n più d, sulla croma della griglia: gli stessi istanti degli eventi di Copia.tsx. */
  const at = (id, n, d = 0) => G0 + Math.round((C(id, n) + d - G0) / CROMA) * CROMA;
  const end = (id) => segs[id].start + segs[id].dur;
  let sid = 0;

  /**
   * Una sezione da `from` a `to`.
   * drone · str (archi tenuti) · arp: arpeggio di pianoforte a crome · harp: arpa a semiminime
   * spic: archi gravi in spiccato (doppio = semicrome, passo doppio) · mel: il motivo al pianoforte · bells
   * pausa: [da, a] silenzio delle figure (dopo un colpo forte)
   */
  const sec = (from, to, o) => {
    const t00 = from <= 0 ? 0 : snap(from);
    from = from <= 0 ? 0 : snap(from); to = snap(to);
    const fino = o.fino ?? to;
    const R = rng(7000 + sid++ * 131);
    const tacet = (x) => o.pausa && x >= o.pausa[0] && x < o.pausa[1];
    if (o.drone) {
      drone(mix, 28, { t: t00, dur: fino - t00 + 0.4, vel: o.drone, gain: 0.7, seed: sid });
      drone(mix, 40, { t: t00, dur: fino - t00 + 0.4, vel: o.drone * 0.8, gain: 0.5, seed: sid + 50 });
    }
    for (let k = 0, t = from; t < to - 0.3; k++, t += BAR) {
      const [root, iv] = CHORDS[k % 4];
      const d = Math.min(BAR * 1.02, fino - t);
      if (o.str) [iv[1], iv[2], iv[3]].forEach((v, j) => strings(mix, root + 12 + v, { t: t + j * 0.04, dur: d, vel: o.str, gain: 0.9, pan: (j - 1) * 0.35, seed: j + k }));
      if (o.arp) {
        for (let i = 0; i < 8 && t + i * CROMA < to - 0.05; i++) {
          const tt = t + i * CROMA;
          if (tacet(tt)) continue;
          const m = root + 12 + iv[[0, 1, 2, 3, 4, 3, 2, 1][i]];
          piano(mix, m, { t: tt, dur: CROMA * 1.6, vel: o.arp * (i % 4 === 0 ? 1 : 0.78), pan: -0.15 });
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

  // ---- eventi delle scene (gli stessi istanti di Copia.tsx)
  const fall1 = at('motore', 0, 0.2), hit1 = fall1 + 0.6;
  const fall2 = at('letto', 1, 0.3), hit2 = fall2 + 0.6;
  const shot = at('guida', 0, 1.0);
  const crash = at('gretchen', 2, 1.0);
  const tear = at('vortice', 2, 0.5);

  // ---- sezioni (tempi dal JSON, sul battito)
  sec(0, T.coniglio, { drone: 30, harp: 34, mel: 42, bells: 30 });
  sec(T.coniglio, T.motore, { drone: 34, arp: 30, mel: 38, keep: 0.85 });
  sec(T.motore, T.libro, { drone: 38, arp: 30, str: 30, pausa: [hit1 - 0.05, hit1 + 2 * BEAT] });
  sec(T.libro, T.tangente, { drone: 34, harp: 36, mel: 40, bells: 30 });
  sec(T.tangente, T.ricevitore, { drone: 42, str: 38, arp: 30, pausa: [at('tangente', 3, 0.3), at('tangente', 3, 0.3) + BEAT] });
  sec(T.ricevitore, T.danni, { drone: 36, harp: 38, mel: 38, bells: 40, oct: 12 });
  sec(T.danni, T.gretchen, { drone: 42, spic: 34, str: 34, arp: 26 });
  sec(T.gretchen, T.guida, { drone: 40, arp: 32, str: 34, mel: 40, pausa: [crash - 0.05, crash + 2 * BEAT] });
  sec(T.guida, T.vortice, { drone: 38, str: 36, harp: 36, bells: 36, mel: 34, pausa: [shot - 0.05, shot + 2 * BEAT] });
  sec(T.vortice, T.letto, { drone: 48, spic: 52, doppio: true, str: 52, arp: 30, pausa: [tear + 0.1, tear + BEAT] });
  sec(T.letto, at('letto', 2, 0.2), { drone: 36, harp: 32, mel: 36, keep: 0.9, pausa: [hit2 - 0.05, hit2 + BEAT] });

  // il mondo è salvo: Mi maggiore aperto sull'istante di «IL MONDO È SALVO» (Copia.tsx), fino al finale
  const S = at('letto', 2, 0.2);
  const F = snap(T.finale);
  [28, 40, 47, 52, 56, 59, 64].forEach((m, j) => strings(mix, m, { t: S, dur: T.END - S - 0.3, vel: 42, gain: 0.55, pan: (j - 3) * 0.18, att: 0.8, seed: 40 + j }));
  for (let t = S, i = 0; t < T.END - 1.5; t += BEAT, i++) harp(mix, [52, 56, 59, 64, 68, 64, 59, 56][i % 8] + 12, { t, vel: 34 });
  [71, 76, 75, 71, 73, 71, 68, 64].forEach((m, k) => piano(mix, m, { t: F + k * CROMA, dur: BEAT, vel: 38 }));
  [76, 80, 83, 88].forEach((m, k) => bell(mix, m, { t: F + 2 + k * CROMA, vel: 36 }));

  // ---------------------------------------------------------------- effetti
  // il contatore: un ticchettio sommesso per battito, da quando compare (capitolo 1) a quando arriva a zero (vortice)
  for (let t = snap(at('coniglio', 2)); t < tear - 0.1; t += BEAT) {
    if ((t > hit1 - 0.1 && t < hit1 + 2) || (t > crash - 0.1 && t < crash + 2) || (t > shot - 0.1 && t < shot + 2)) continue;
    clip(mix, 'scatti', { t, da: 6.49, durata: 0.06, gain: 0.16, rev: 0.15, pan: 0.4 });
  }
  // copertina: il contatore ticchetta anche lì, sul fumo del motore
  for (let t = 0; t < 4; t += BEAT) clip(mix, 'scatti', { t, da: 6.49, durata: 0.06, gain: 0.18, rev: 0.15, pan: 0.4 });
  clip(mix, 'vento_raffiche', { t: 0, da: 3, durata: 4, gain: 0.05, fadeIn: 0.3, fadeOut: 1.2, largo: 1.5 });
  // capitolo 1: Frank lo chiama (campanelle), i 28 giorni (timpano sordo)
  [83, 79, 76].forEach((m, k) => bell(mix, m, { t: at('coniglio', 1, 0.1) + k * CROMA, vel: 38 }));
  timp(mix, at('coniglio', 2, 0.2), { vel: 90, gain: 0.55 });
  // capitolo 2: il motore cade (sibilo), sfonda il tetto (schianto + timpano), poi silenzio; il punto di domanda
  clip(mix, 'passaggio', { t: fall1, da: 0.56, durata: 0.7, gain: 0.3, fadeOut: 0.1, rev: 0.3 });
  clip(mix, 'metallo_schianto', { t: hit1, da: 0, durata: 1.4, gain: 0.5, fadeOut: 0.5, rev: 0.4 });
  timp(mix, hit1, { vel: 120, gain: 0.9 });
  clip(mix, 'rombo', { t: hit1 + 0.2, da: 1, durata: 2.5, gain: 0.12, fadeOut: 1.2, largo: 1.5 });
  bell(mix, 77, { t: at('motore', 3, 0.1), vel: 40 });
  // capitolo 3: il libro passa di mano e si apre
  clip(mix, 'pagine', { t: at('libro', 3, 0), da: 1, durata: 1.2, gain: 0.3, fadeOut: 0.3, rev: 0.25 });
  // capitolo 4: la copia si stacca (arpa che sale), «poi crolla» (rombo e timpano)
  [52, 55, 59, 64, 67, 71].forEach((m, k) => harp(mix, m + 12, { t: at('tangente', 1, 0.1) + k * CROMA / 2, vel: 36 }));
  swell(mix, at('tangente', 3, 0.3) - 1.5, 1.5, { gain: 0.35 });
  timp(mix, at('tangente', 3, 0.3), { vel: 115, gain: 0.8 });
  clip(mix, 'rombo', { t: at('tangente', 3, 0.3), da: 1, durata: 3, gain: 0.14, fadeOut: 1.4, largo: 1.5 });
  // capitolo 5: «va rimandato» (scala che sale verso il mondo vero), le visioni (campanelle)
  [64, 66, 67, 71, 76].forEach((m, k) => bell(mix, m, { t: at('ricevitore', 1, 0.3) + k * CROMA / 2, vel: 34 }));
  // capitolo 6: la scuola allagata, la casa che brucia
  clip(mix, 'onde', { t: at('danni', 1, 0.1), da: 4, durata: 2, gain: 0.14, fadeIn: 0.3, fadeOut: 0.8, largo: 1.4 });
  clip(mix, 'fiammata', { t: at('danni', 1, 1.6), da: 0, durata: 1.2, gain: 0.3, fadeOut: 0.4, rev: 0.3 });
  clip(mix, 'fuoco', { t: at('danni', 1, 1.8), da: 2, durata: at('danni', 3) - at('danni', 1, 1.8) + 2, gain: 0.06, fadeIn: 0.5, fadeOut: 1.5, largo: 1.4 });
  timp(mix, at('danni', 3, 0.2), { vel: 95, gain: 0.55 });
  // capitolo 7: l'auto che arriva, l'urto (poi silenzio)
  clip(mix, 'auto_epoca', { t: at('gretchen', 2, 0.1) - 0.6, da: 2, durata: 1.7, gain: 0.25, fadeIn: 0.4, fadeOut: 0.3, rev: 0.25 });
  clip(mix, 'colpi_cavi', { t: crash, da: 0.2, durata: 0.6, gain: 0.4, fadeOut: 0.2, rev: 0.3 });
  timp(mix, crash, { vel: 110, gain: 0.7 });
  bell(mix, 71, { t: at('gretchen', 3, 0.1), vel: 34 });
  // capitolo 8: lo sparo (un solo lampo), poi silenzio; «torna come guida», «era lui» (scala gialla che risale)
  clip(mix, 'pugno', { t: shot, da: 0, durata: 0.4, gain: 0.5, rev: 0.45 });
  timp(mix, shot, { vel: 125, gain: 0.9 });
  [64, 67, 71, 74, 76, 79].forEach((m, k) => bell(mix, m, { t: at('guida', 2, 0.1) + k * CROMA / 2, vel: 36 }));
  // capitolo 9: il vortice (vento e rombo), l'aereo, il motore strappato via, il motore che torna indietro
  clip(mix, 'vento_raffiche', { t: T.vortice, da: 6, durata: tear - T.vortice + 1.5, gain: 0.09, fadeIn: 1.2, fadeOut: 1.2, largo: 1.6 });
  clip(mix, 'rombo', { t: at('vortice', 0, 0.3), da: 1, durata: 4, gain: 0.1, fadeIn: 1, fadeOut: 1.5, largo: 1.6 });
  clip(mix, 'aereo', { t: at('vortice', 1, -0.6), da: 3, durata: 3.4, gain: 0.18, fadeIn: 0.6, fadeOut: 0.8, largo: 1.4 });
  clip(mix, 'metallo_colpi', { t: tear, da: 0.54, durata: 0.4, gain: 0.35, rev: 0.4 });
  timp(mix, tear, { vel: 115, gain: 0.8 });
  clip(mix, 'passaggio', { t: at('vortice', 3, 0.1), da: 0.56, durata: 1.6, gain: 0.25, fadeOut: 0.5, rev: 0.4 });
  [79, 76, 71, 67, 64].forEach((m, k) => bell(mix, m, { t: at('vortice', 3, 1.4) + k * CROMA / 2, vel: 36 }));
  // capitolo 10: tutto si riavvolge (piatto al contrario e sibilo), il motore ricade (schianto, poi silenzio)
  swell(mix, at('letto', 0, 0.2), 1.6, { gain: 0.4 });
  clip(mix, 'passaggio', { t: at('letto', 0, 0.4), da: 12.27, durata: 1.4, gain: 0.2, fadeOut: 0.4, rev: 0.35 });
  clip(mix, 'passaggio', { t: fall2, da: 0.56, durata: 0.7, gain: 0.3, fadeOut: 0.1, rev: 0.3 });
  clip(mix, 'metallo_schianto', { t: hit2, da: 0, durata: 1.4, gain: 0.5, fadeOut: 0.5, rev: 0.4 });
  timp(mix, hit2, { vel: 120, gain: 0.9 });
  bell(mix, 68, { t: at('letto', 3, 0.8), vel: 30 });
  void end;
};
