// Colonna sonora originale di Tenet (formato "Spiegato semplice"): archi gravi in spiccato che pulsano come un motore,
// pianoforte, campanelle e un battito di cuore sulla grancassa (campionati, VSCO-2 CE e VCSL, CC0). Il motivo è inventato
// qui ed è un palindromo, come il titolo: Re, Fa, La, Do#, La, Fa, Re (sale e torna indietro uguale). Nelle cose
// invertite il motivo suona al contrario dall'acuto, e l'arpeggio degli archi scende invece di salire.
// 80 bpm su una griglia continua (12 s = 4 battute): la tenaglia va a passo doppio. Il battito del cuore è il tempo stesso
// (80 al minuto). Niente brani o temi del film (né la colonna sonora originale né canzoni usate nel film).
// Effetti agganciati agli eventi dello schema in src/scenes/tenet/Tempo.tsx e della copertina in Locandina.tsx.
import { rng } from './synth.mjs';
import { suona, archi, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte', 'violini', 'viole', 'celli', 'contrabbasso', 'celli_spicc', 'viole_spicc', 'violini_trem', 'glockenspiel', 'grancassa', 'timpani'];
export const effetti = ['passaggio', 'scatti', 'portone_motore', 'metallo_colpi', 'telo', 'vento_leggero', 'cancello', 'onde'];
/** Sala media, scura. */
export const sala = { rt60: 2.4, brillo: 5200, predelay: 0.025, wet: 0.5 };

const BPM = 80;
const BEAT = 60 / BPM;
const GRID = 4 * BEAT; // una battuta = 3 s
const G0 = 4;
const snap = (t) => G0 + Math.round((t - G0) / GRID) * GRID;
const CROMA = BEAT / 2;

// ---------------------------------------------------------------- strumenti (campionati)

const drone = (mix, m, { t, dur, vel = 40, gain = 1, seed = 1 }) =>
  suona(mix, m < 40 ? 'contrabbasso' : 'celli', m, { t, dur, vel: vel + 14, gain: gain * 1.5, attack: 1.5, release: 1.8, rev: 0.55, seed });
const strings = (mix, m, { t, dur, vel = 40, pan = 0, gain = 1, att = 1, seed = 1 }) =>
  archi(mix, m, { t, dur, vel: vel + 8, pan, rev: 0.6, gain: gain * 1.4, attack: att, release: 1.3, seed });
/** Spiccato degli archi gravi: il motore ritmico. */
const spic = (mix, m, { t, vel = 40, pan = 0, gain = 1 }) =>
  suona(mix, m < 55 ? 'celli_spicc' : 'viole_spicc', m, { t, dur: CROMA * 0.9, vel: vel * 1.7, pan, rev: 0.35, gain: gain * 0.8, release: 0.12 });
const bell = (mix, m, { t, vel = 46, pan = 0, gain = 1 }) =>
  suona(mix, 'glockenspiel', m < 79 ? m + 12 * Math.ceil((79 - m) / 12) : m, { t, dur: 2.5, vel: vel * 1.3, pan, rev: 0.7, gain: gain * 0.45, release: 1.5 });
const piano = (mix, m, { t, dur, vel }) =>
  suona(mix, 'pianoforte', m, { t, dur: Math.min(dur, 4), vel: vel * 1.2, pan: 0.15, rev: 0.55, gain: 4, release: 0.6 });
const timp = (mix, t, { vel = 100, gain = 0.8, pan = 0 } = {}) => colpo(mix, 'timpani', 'Timpani1_Hit_v2_rr1_Sum', { t, vel, gain, pan, rev: 0.45 });
/** Il battito del cuore: due colpi sordi (tum-tum) sulla grancassa. */
const heart = (mix, t, { gain = 0.7 } = {}) => {
  colpo(mix, 'grancassa', 'bdrum_p', { t, vel: 110, gain, rev: 0.25 });
  colpo(mix, 'grancassa', 'bdrum_pp', { t: t + BEAT / 4, vel: 100, gain: gain * 0.7, rev: 0.25, seed: 2 });
};

// ---------------------------------------------------------------- materiale musicale

// il motivo palindromo (Re Fa La Do# La Fa Re), a crome: [croma, nota MIDI]
const MOTIF = [[0, 62], [1, 65], [2, 69], [3, 73], [4, 69], [5, 65], [6, 62]];
// lo stesso motivo letto dall'acuto (le cose invertite): Re Do# La Fa La Do# Re
const MOTIF_REV = [[0, 86], [1, 85], [2, 81], [3, 77], [4, 81], [5, 85], [6, 86]];
// accordi per battuta: Re minore · Si bemolle · Sol minore · La (dominante)
const CHORDS = [[38, [0, 3, 7]], [34, [0, 4, 7]], [43, [0, 3, 7]], [45, [0, 4, 7]]];

export default (mix, T) => {
  const film = loadFilm('tenet');
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
  /** Istante (assoluto) della frase n più d, sulla croma della griglia: gli stessi istanti degli eventi di Tempo.tsx. */
  const at = (id, n, d = 0) => G0 + Math.round((C(id, n) + d - G0) / CROMA) * CROMA;
  let sid = 0;

  /**
   * Una sezione da `from` a `to`.
   * drone · str (archi tenuti) · spic: motore in spiccato (doppio = semicrome, passo doppio) · inv: arpeggio che scende
   * mel: motivo palindromo al pianoforte (rev = suonato dall'acuto) · bells
   */
  const sec = (from, to, o) => {
    const t00 = from <= 0 ? 0 : snap(from); // il bordone parte da 0, le figure dalla griglia (G0 - 2 battute)
    from = from <= 0 ? G0 - 2 * GRID : snap(from); to = snap(to);
    const R = rng(9000 + sid++ * 131);
    if (o.drone) {
      drone(mix, 26, { t: t00, dur: to - t00, vel: o.drone, gain: 0.7, seed: sid });
      drone(mix, 38, { t: t00, dur: to - t00, vel: o.drone * 0.8, gain: 0.5, seed: sid + 50 });
    }
    for (let k = 0, t = from; t < to - 0.3; k++, t += GRID) {
      const [root, iv] = CHORDS[k % 4];
      const d = Math.min(GRID * 1.02, to - t);
      const tacet = (x) => x < 0 || (o.pausa && x >= o.pausa[0] && x < o.pausa[1]);
      if (o.str && t >= 0) iv.forEach((v, j) => strings(mix, root + 12 + v, { t: t + j * 0.04, dur: d, vel: o.str, gain: 0.55, pan: (j - 1) * 0.35, seed: j + k }));
      if (o.spic) {
        const step = o.doppio ? CROMA / 2 : CROMA;
        const notes = [root, root + iv[1], root + iv[2], root + 12];
        if (o.inv) notes.reverse();
        for (let i = 0; t + i * step < Math.min(t + GRID, to) - 0.05; i++) {
          const accent = i % (o.doppio ? 4 : 2) === 0;
          if (tacet(t + i * step)) continue;
          spic(mix, notes[i % 4] + 12, { t: t + i * step, vel: o.spic * (accent ? 1 : 0.75), pan: (i % 2 ? 0.25 : -0.25) });
        }
      }
      if (o.mel && k % 4 === 0) {
        const seq = o.rev ? MOTIF_REV : MOTIF;
        for (const [b, mm] of seq) {
          const tt = t + b * CROMA * 2;
          if (tt >= to - 0.2 || tacet(tt) || R() > (o.keep ?? 1)) continue;
          piano(mix, mm + (o.oct ?? 0), { t: tt, dur: CROMA * 2, vel: o.mel });
          if (o.bells) bell(mix, mm + 12, { t: tt + 0.01, vel: o.bells, pan: -0.25 });
        }
      }
    }
  };

  // ---- sezioni (tempi dal JSON, sulla griglia)
  sec(0, T.invertiti, { drone: 34, mel: 44, bells: 30, rev: true });
  sec(T.invertiti, T.futuro, { drone: 34, mel: 42, spic: 26, inv: true });
  sec(T.futuro, T.sator, { drone: 40, spic: 32, str: 30, mel: 40, keep: 0.8 });
  sec(T.sator, T.tornello, { drone: 40, spic: 30, str: 34, mel: 42 });
  sec(T.tornello, T.algoritmo, { drone: 42, spic: 36, inv: true, str: 32, mel: 42, rev: true });
  sec(T.algoritmo, T.battito, { drone: 46, spic: 34, str: 40, mel: 34, oct: -12 });
  sec(T.battito, T.mascherato, { drone: 42, str: 36, mel: 38, keep: 0.8 });
  sec(T.mascherato, T.tenaglia, { drone: 44, spic: 38, inv: true, str: 36, mel: 44, rev: true, bells: 30 });
  sec(T.tenaglia, T.neil, { drone: 48, spic: 50, doppio: true, str: 42, pausa: [at('tenaglia', 1, 1.0), at('tenaglia', 1, 1.0) + BEAT] });
  sec(T.neil, T.finale, { drone: 44, str: 40, mel: 46, bells: 34, pausa: [at('neil', 1, 0.8), at('neil', 1, 0.8) + BEAT] });

  // finale: Re maggiore aperto (la fine della guerra) e il motivo palindromo in campanelle
  const F = G0 + Math.round((T.finale - G0) / BEAT) * BEAT;
  [26, 38, 45, 50, 54, 57].forEach((m, j) => strings(mix, m, { t: F, dur: 4.0, vel: 46, gain: 0.6, pan: (j - 2.5) * 0.2, att: 0.4, seed: 40 + j }));
  [62, 66, 69, 74, 69, 66, 62].forEach((m, k) => bell(mix, m + 12, { t: F + CROMA * (k + 1), vel: 42, pan: -0.3 + k * 0.1 }));

  // ---------------------------------------------------------------- effetti (gli istanti degli eventi di Tempo.tsx)
  // copertina: il proiettile che vola all'indietro e rientra nella canna (Locandina.tsx: arriva a 0,9 s)
  clip(mix, 'passaggio', { t: 0, da: 0.56, durata: 0.9, gain: 0.3, fadeOut: 0.2, rev: 0.3 });
  clip(mix, 'scatti', { t: 0.9, da: 6.49, durata: 0.12, gain: 0.35, rev: 0.2 });
  clip(mix, 'passaggio', { t: 1.85, da: 0.56, durata: 1.5, gain: 0.22, fadeOut: 0.4, rev: 0.3 });
  clip(mix, 'scatti', { t: 3.9, da: 6.49, durata: 0.12, gain: 0.25, rev: 0.2 });
  // capitolo 1: il proiettile esce dal muro e torna nella pistola, in ciclo ogni 2,25 s (3 battiti)
  for (let t0 = at('invertiti', 2); t0 < T.futuro - 0.6; t0 += 2.25) {
    clip(mix, 'passaggio', { t: t0 + 0.2, da: 0.56, durata: 1.1, gain: 0.22, fadeOut: 0.3, rev: 0.3 });
    clip(mix, 'scatti', { t: t0 + 1.35, da: 6.49, durata: 0.1, gain: 0.25, rev: 0.2 });
  }
  [86, 81, 77, 74].forEach((m, k) => bell(mix, m, { t: at('invertiti', 3, 0.1) + k * CROMA / 2, vel: 40 })); // INVERTITO: scala che scende
  // capitolo 2: la guerra (timpano), Tenet (campanelle palindrome), la sbarra
  timp(mix, at('futuro', 1, 0.2), { vel: 110, gain: 0.7 });
  [74, 77, 81, 77, 74].forEach((m, k) => bell(mix, m, { t: at('futuro', 2, 0.1) + k * CROMA / 2, vel: 38 }));
  clip(mix, 'scatti', { t: at('futuro', 3, 0.2), da: 12.68, durata: 0.15, gain: 0.3, rev: 0.25 });
  // capitolo 3: Sator (nota grave), il ricatto e il timbro «FALSO»
  piano(mix, 38, { t: at('sator', 0, 0.1), dur: 2, vel: 40 });
  bell(mix, 77, { t: at('sator', 2, 0.2), vel: 32 }); // Kat
  bell(mix, 74, { t: at('tornello', 0, 0.4), vel: 30 }); // Neil
  clip(mix, 'onde', { t: at('battito', 3), da: 10, durata: 4, gain: 0.1, fadeIn: 1, fadeOut: 1.5, largo: 1.5 });
  clip(mix, 'onde', { t: at('tenaglia', 2), da: 16, durata: 3.5, gain: 0.1, fadeIn: 1, fadeOut: 1.5, largo: 1.5 });
  clip(mix, 'scatti', { t: 116.9, da: 6.49, durata: 0.1, gain: 0.18, rev: 0.2 });
  timp(mix, at('sator', 3, 0.5), { vel: 90, gain: 0.5 });
  clip(mix, 'onde', { t: at('sator', 0), da: 2, durata: 6, gain: 0.12, fadeIn: 1, fadeOut: 2, largo: 1.5 }); // il mare sotto lo yacht
  // capitolo 4: il tornello che gira, l'uomo che esce, la lotta, «chi è?»
  clip(mix, 'portone_motore', { t: at('tornello', 1), da: 1.9, durata: 2.0, gain: 0.15, fadeIn: 0.3, fadeOut: 0.6, rev: 0.3 });
  clip(mix, 'passaggio', { t: at('tornello', 2, 0.1), da: 0.56, durata: 0.8, gain: 0.28, fadeOut: 0.2, rev: 0.3 });
  [0.75, 1.5, 2.25].forEach((d, k) => clip(mix, 'metallo_colpi', { t: at('tornello', 2, d), da: [0.52, 2.87, 5.07][k], durata: 0.3, gain: 0.25, rev: 0.25, pan: k % 2 ? 0.3 : -0.3 }));
  bell(mix, 88, { t: at('tornello', 3, 0.1), vel: 44 });
  // capitolo 5: i nove pezzi, l'Algoritmo che si chiude, il cancellino, il vento del futuro
  for (let i = 0; i < 9; i++) bell(mix, [62, 65, 69, 73, 74, 73, 69, 65, 62][i] + 12, { t: at('algoritmo', 0, 0.2) + i * CROMA / 2, vel: 26 });
  clip(mix, 'scatti', { t: at('algoritmo', 1, 1.2), da: 6.49, durata: 0.15, gain: 0.35, rev: 0.25 });
  timp(mix, at('algoritmo', 1, 1.2), { vel: 100, gain: 0.6 });
  clip(mix, 'telo', { t: at('algoritmo', 2, 0.2), da: 0.2, durata: 1.6, gain: 0.35, fadeOut: 0.4, rev: 0.3 });
  clip(mix, 'vento_leggero', { t: at('algoritmo', 3), da: 4, durata: 3.5, gain: 0.12, fadeIn: 0.8, fadeOut: 1.2, largo: 1.5 });
  // capitolo 6: il battito (80 al minuto, sulla griglia), il cuore che si ferma (silenzio e nota tesa), il Vietnam
  const flat0 = at('battito', 2, 0.3), flat1 = at('battito', 2, 1.6);
  for (let t = at('battito', 1, 0.1); t < T.mascherato - 0.4; t += BEAT) if (t < flat0 - 0.1 || t >= flat1) heart(mix, t, { gain: 0.55 });
  suona(mix, 'violini_trem', 81, { t: flat0, dur: flat1 - flat0, vel: 60, gain: 0.3, attack: 0.05, release: 0.2, rev: 0.4 });
  timp(mix, flat0, { vel: 115, gain: 0.8 });
  [50, 53, 57, 62].forEach((m, j) => strings(mix, m + 8, { t: at('battito', 3, 0.1), dur: 3, vel: 40, gain: 0.45, pan: (j - 1.5) * 0.3, att: 0.6, seed: 70 + j })); // il tramonto: Si bemolle maggiore
  // capitolo 7: lo sparo invertito, la ferita, il tornello, la rivelazione
  clip(mix, 'passaggio', { t: at('mascherato', 0, 2.25), da: 0.56, durata: 0.6, gain: 0.3, fadeOut: 0.15, rev: 0.3 });
  timp(mix, at('mascherato', 0, 2.625), { vel: 115, gain: 0.8 });
  clip(mix, 'portone_motore', { t: at('mascherato', 2, 0.1), da: 1.9, durata: 1.6, gain: 0.15, fadeIn: 0.2, fadeOut: 0.5, rev: 0.3 });
  clip(mix, 'passaggio', { t: at('mascherato', 2, 0.6), da: 12.27, durata: 1.4, gain: 0.25, fadeOut: 0.4, rev: 0.35 });
  [62, 65, 69, 73, 69, 65, 62].forEach((m, k) => bell(mix, m + 12, { t: at('mascherato', 3, 0.2) + k * CROMA / 2, vel: 44 }));
  colpo(mix, 'grancassa', 'bdrum_f', { t: at('mascherato', 3, 0.2), vel: 100, gain: 0.6, rev: 0.45 });
  // capitolo 8: le due squadre, la tenaglia che si chiude, il battito di nuovo, «non ancora!»
  timp(mix, at('tenaglia', 0, 0.2), { vel: 100, gain: 0.6, pan: -0.3 });
  timp(mix, at('tenaglia', 0, 0.2) + CROMA, { vel: 100, gain: 0.6, pan: 0.3 });
  colpo(mix, 'grancassa', 'bdrum_ff', { t: at('tenaglia', 1, 1.0), vel: 110, gain: 0.8, rev: 0.45 });
  for (let t = at('tenaglia', 2); t < at('neil', 1, 0.8) - 0.1; t += BEAT) heart(mix, t, { gain: t > at('tenaglia', 3) ? 0.75 : 0.5 });
  bell(mix, 81, { t: at('tenaglia', 3, 0.6), vel: 44 });
  // capitolo 9: il cancello, il soldato che cade, l'Algoritmo salvo, Sator muore (il battito si ferma), «era Neil», il fondatore
  clip(mix, 'cancello', { t: at('neil', 0, 0.5), da: 2.7, durata: 1.6, gain: 0.35, fadeOut: 0.5, rev: 0.35 });
  timp(mix, at('neil', 0, 1.6), { vel: 95, gain: 0.6 });
  bell(mix, 86, { t: at('neil', 1, 0.1), vel: 42 });
  colpo(mix, 'grancassa', 'bdrum_f', { t: at('neil', 1, 0.8), vel: 100, gain: 0.6, rev: 0.45 });
  [74, 73, 69, 65, 62].forEach((m, k) => bell(mix, m + 12, { t: at('neil', 2, 0.7) + k * CROMA / 2, vel: 40 }));
  [62, 66, 69, 74].forEach((m, k) => bell(mix, m + 12, { t: at('neil', 3, 0.1) + k * CROMA / 2, vel: 42 }));
};
