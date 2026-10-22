// Colonna sonora originale per Bohemian Rhapsody, discreta sotto la voce. Richiama lo STILE e la FORMA della canzone,
// mai le note: melodie, giri di accordi e riff sono inventati qui (CLAUDE.md, «Canzoni spiegate»).
// Percorso, come nel brano: coro di voci sovrapposte senza strumenti → ballata al pianoforte con basso e batteria
// leggera → assolo di chitarre armonizzate → opera con accordi staccati del pianoforte, cori che si rispondono da
// sinistra a destra e timpani → rock pesante con riff e chitarre gemelle → coda al pianoforte e gong.
// Pianoforte a coda, timpani, batteria e gong sono campionati (VCSL e VSCO-2 CE, CC0), il basso è un contrabbasso
// pizzicato. Le voci restano sintetizzate con formanti (vocali «a», «o», «u»), doppiate e allargate come le
// sovrapposizioni in studio, e così le chitarre elettriche distorte: nelle librerie CC0 non ci sono cori né chitarre.
// Un solo tempo (70 bpm) per tutto il video: ballata a passo pieno, opera e rock a passo doppio (140).
// Effetti registrati (archivio CC0, scripts/audio/effetti.mjs).
// Effetti agganciati agli eventi delle scene in src/scenes/bohemian-rhapsody/.
import { put, rng, chalk, pop, channelClick, FX } from './synth.mjs';
import { suona, colpo, crescendo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte_coda', 'contrabbasso_pizz', 'timpani', 'rullante', 'cassa', 'charleston', 'piatto_crash', 'gong', 'piatto_sospeso'];
export const effetti = ['tuono_classico', 'tuono_secco', 'tuono_forte', 'tuono_breve', 'telo', 'scatti', 'disturbo', 'pioggia_dura', 'porta_cigolio',
  'colpi_legno', 'passaggio', 'radio_sintonia'];
/** Studio con una bella coda (le sovrapposizioni in sala). */
export const sala = { rt60: 2.4, brillo: 7000, predelay: 0.025, wet: 0.5 };

const TAU = Math.PI * 2;
const SR = 44100;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const vamp = (v) => (v / 127) ** 1.6;

// ---------------------------------------------------------------- filtri

/** Passa-banda biquadratico (guadagno 0 dB al centro). */
const bandpass = (fc, q) => {
  const w = (TAU * fc) / SR, al = Math.sin(w) / (2 * q), a0 = 1 + al;
  const b0 = al / a0, b2 = -al / a0, a1 = (-2 * Math.cos(w)) / a0, a2 = (1 - al) / a0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x) => {
    const y = b0 * x + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
};

// formanti delle vocali: [frequenza, larghezza (Q), ampiezza]
const VOWELS = {
  a: [[730, 8, 1], [1090, 10, 0.5], [2440, 14, 0.25]],
  o: [[570, 8, 1], [840, 10, 0.45], [2410, 14, 0.15]],
  u: [[320, 7, 1], [870, 10, 0.25], [2240, 14, 0.1]],
};

// ---------------------------------------------------------------- strumenti locali (via put)

/** Voce di coro: dente di sega con vibrato filtrato dalle formanti della vocale. */
const voice = (mix, m, { t, dur, vel = 40, pan = 0, vowel = 'a', att = 0.25, rel = 0.6, gain = 1, seed = 1, rev = 0.7 }) => {
  const f = mtof(m);
  const r = rng(seed * 313 + m + Math.round(t * 100));
  const ph0 = r(), vr = 5 + r() * 0.8, vp = r() * TAU, det = 1 + (r() - 0.5) * 0.006;
  const fs = VOWELS[vowel].map(([fc, q, a]) => ({ bp: bandpass(fc, q), a }));
  let ph = ph0;
  put(mix, t, Math.ceil((dur + rel) * SR), (i) => {
    const x = i / SR;
    const vib = 1 + 0.006 * Math.sin(TAU * vr * x + vp) * Math.min(1, x / 0.6);
    ph = (ph + (f * det * vib) / SR) % 1;
    const src = 2 * ph - 1;
    let s = 0;
    for (const { bp, a } of fs) s += bp(src) * a;
    const env = Math.min(1, x / att) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / rel));
    return s * env * 1.6;
  }, { gain: gain * vamp(vel), pan, rev });
};

/** Coro sovrapposto: ogni nota cantata da `layers` voci leggermente diverse, sparse nello stereo. */
const choir = (mix, notes, { t, dur, vel = 40, vowel = 'a', layers = 2, width = 0.8, center = 0, att = 0.25, gain = 1, seed = 1 }) => {
  notes.forEach((m, j) => {
    for (let k = 0; k < layers; k++) {
      const pan = Math.max(-1, Math.min(1, center + (((j * layers + k) / Math.max(1, notes.length * layers - 1)) * 2 - 1) * width));
      voice(mix, m, { t: t + k * 0.012, dur, vel, pan, vowel, att, gain: gain / Math.sqrt(layers), seed: seed * 17 + j * 5 + k });
    }
  });
};

/** Pianoforte a coda (Steinway, VCSL). */
const piano = (mix, m, { t, dur = 1.5, vel = 60, pan = 0, rev = 0.45, gain = 1 }) =>
  suona(mix, 'pianoforte_coda', m, { t, dur: Math.min(dur, 4), vel: vel * 1.15, pan, rev, gain: gain * 0.6, release: 0.3 });

/** Basso: contrabbasso pizzicato. */
const bassNote = (mix, m, { t, dur, vel }) =>
  suona(mix, 'contrabbasso_pizz', m < 28 ? m + 12 : m, { t, dur, vel: vel * 1.6, gain: 1.8, rev: 0.15, release: 0.15 });

/** Chitarra elettrica distorta con vibrato e una piccola salita iniziale (bending); `mute` = palm muting. */
const guitar = (mix, m, { t, dur, vel = 40, pan = 0, gain = 1, bend = 0, mute = false, rev = 0.3 }) => {
  const f = mtof(m);
  let ph1 = 0, ph2 = 0.3, lp = 0, lp2 = 0;
  const a = 1 - Math.exp((-TAU * (mute ? 900 : 2600)) / SR);
  put(mix, t, Math.ceil((dur + 0.15) * SR), (i) => {
    const x = i / SR;
    const b = bend ? 2 ** ((-bend * Math.max(0, 1 - x / 0.12)) / 12) : 1;
    const vib = 1 + (mute ? 0 : 0.008 * Math.sin(TAU * 5.5 * x) * Math.min(1, Math.max(0, x - 0.25) / 0.4));
    ph1 = (ph1 + (f * b * vib) / SR) % 1;
    ph2 = (ph2 + (f * 1.004 * b * vib) / SR) % 1;
    const s = (2 * ph1 - 1) + (2 * ph2 - 1);
    lp += a * (Math.tanh(s * 3) - lp);
    lp2 += a * (lp - lp2);
    const env = Math.min(1, x / 0.004) * (mute ? Math.exp(-x / 0.09) : 1) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / 0.15));
    return lp2 * env * 0.45;
  }, { gain: gain * vamp(vel), pan, rev });
};

/** Bicordo (quinta + ottava) per il riff. */
const power = (mix, root, o) => [0, 7, 12].forEach((v, j) => guitar(mix, root + v, { ...o, pan: (o.pan ?? 0) + (j - 1) * 0.15 }));

/** Timpano intonato (VCSL). */
const timpani = (mix, m, t, vel = 60, seed = 3) => suona(mix, 'timpani', m, { t, dur: 1.5, vel: vel * 1.6, gain: 1.4, rev: 0.5, release: 0.6, seed });

/** Rullante (VCSL). */
const snare = (mix, t, vel = 60, seed = 5) => colpo(mix, 'rullante', vel > 55 ? 'v6' : vel > 40 ? 'v5' : 'v4', { t, vel: 100, gain: 0.6 * (vel / 60), pan: 0.05, rev: 0.25, seed: seed + Math.round(t * 100) });

/** Piatto crash (VCSL). */
const crash = (mix, t, vel = 50, seed = 9) => colpo(mix, 'piatto_crash', vel > 60 ? 'ff' : 'mf', { t, vel: 100, gain: 0.35 * (vel / 60), pan: 0.35, rev: 0.35, dur: 2.5, release: 0.8, seed });

/** Batteria (stesse chiamate della versione sintetica): cassa, charleston chiuso. */
const drum = (mix, kind, t, vel = 50, seed = 1) => {
  const r = seed + Math.round(t * 100);
  if (kind === 'kick' || kind === 'softkick') colpo(mix, 'cassa', vel > 55 ? 'v5' : 'v3', { t, vel: 100, gain: (kind === 'kick' ? 0.8 : 0.55) * (vel / 60), rev: 0.15, seed: r });
  else colpo(mix, 'charleston', vel > 35 ? 'v3' : 'v2', { t, vel: 100, gain: 0.3 * (vel / 50), pan: 0.3, rev: 0.15, seed: r });
};

/** Gong (VSCO). */
const gong = (mix, t, { vel = 70, len = 6, seed = 5 } = {}) =>
  colpo(mix, 'gong', vel > 45 ? 'gong_hit_mf' : 'gong_hit_p', { t, vel: 100, gain: 0.6 * (vel / 50), rev: 0.55, dur: len, release: 1.5, seed });

const BPM = 70;
const GRID = (4 * 60) / BPM;
const snap = (t) => Math.round(t / GRID) * GRID;

// ---------------------------------------------------------------- materiale musicale (inventato qui)

// accordi: [nota MIDI della fondamentale, intervalli]
const MAJ = [0, 4, 7], MIN = [0, 3, 7];
// tonalità scelte lontane da quelle della canzone (Si bemolle, La, Mi bemolle)
// ballata in Do: La min · Fa · Do · Sol (vi–IV–I–V)
const BALLAD = [[57, MIN], [53, MAJ], [60, MAJ], [55, MAJ]];
// opera in Si: Si · Sol diesis min · Mi · Fa diesis
const OPERA = [[59, MAJ], [56, MIN], [52, MAJ], [54, MAJ]];
// finale luminoso in Do: Do · Fa · La min · Sol
const LIFT = [[60, MAJ], [53, MAJ], [57, MIN], [55, MAJ]];
// riff rock in Mi (due battute di ottavi): fondamentali dei bicordi, null = pausa
const RIFF = [40, 40, null, 40, 43, 40, 45, null, 40, 40, null, 47, 45, 43, 40, null];

/** Disposizione di un accordo in un registro: note tra lo e lo+12, più l'ottava della fondamentale. */
const voicing = ([root, iv], lo) => {
  const out = iv.map((v) => {
    let m = root + v;
    while (m < lo) m += 12;
    while (m >= lo + 12) m -= 12;
    return m;
  }).sort((a, b) => a - b);
  return [...out, out[0] + 12];
};

/** Melodia a passi per grado sulle note dell'accordo (seme fisso), una nota ogni `step` tempi. */
const melody = (R, chord, lo, n) => {
  const pool = voicing(chord, lo).concat(voicing(chord, lo + 12));
  let k = Math.floor(R() * 3) + 1;
  return Array.from({ length: n }, () => {
    k = Math.max(0, Math.min(pool.length - 1, k + [-1, 1, 1, 2, -2][Math.floor(R() * 5)]));
    return pool[k];
  });
};

export default (mix, T) => {
  const film = loadFilm('bohemian-rhapsody');
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
  const R = rng(1975);

  /** Coro senza strumenti: accordi lunghi della ballata. layers cresce = più sovrapposizioni. */
  const acappella = (from, to, { vel = 40, layers = 2, high = false, vowel = 'a' } = {}) => {
    from = snap(from); to = snap(to);
    const bar = GRID;
    for (let t = from, b = 0; t < to - 0.4; t += bar, b++) {
      const ch = BALLAD[b % 4];
      const d = Math.min(bar * 1.05, to - t);
      choir(mix, voicing(ch, 55), { t, dur: d, vel, vowel, layers, att: 0.4, seed: b + 1 });
      if (high) choir(mix, [voicing(ch, 67)[2] + 12], { t: t + 0.05, dur: d, vel: vel - 6, vowel: 'u', layers: 1, width: 0.3, center: 0.4, seed: b + 40 });
      voice(mix, ch[0] - 12, { t, dur: d, vel: vel - 4, vowel: 'o', pan: -0.1, seed: b + 70 });
    }
  };

  /** Ballata: arpeggi del pianoforte, basso, melodia rada; drums = batteria leggera; solo = assolo di chitarre gemelle. */
  const ballad = (from, to, { vel = 46, bass = 0, drums = 0, mel = 0, choirVel = 0, solo = 0, chords = BALLAD } = {}) => {
    from = snap(from); to = snap(to);
    const beat = 60 / BPM, bar = 4 * beat;
    for (let t = from, b = 0; t < to - 0.3; t += bar, b++) {
      const ch = chords[b % 4];
      const v = voicing(ch, 58);
      for (let k = 0; k < 8; k++) {
        const tk = t + (k * beat) / 2;
        if (tk >= to - 0.15) break;
        piano(mix, v[[0, 1, 2, 3, 2, 1, 0, 1][k]], { t: tk, dur: beat * 0.9, vel: vel * (k === 0 ? 1.08 : 0.9), pan: 0.1 });
      }
      piano(mix, ch[0] - 12, { t, dur: bar, vel: vel * 0.95, pan: -0.15 });
      if (bass) bassNote(mix, ch[0] - 24, { t, dur: bar * 0.95, vel: bass });
      if (drums) for (let k = 0; k < 4; k++) {
        const tk = t + k * beat;
        if (tk >= to - 0.1) break;
        drum(mix, 'softkick', tk, k % 2 ? drums * 0.6 : drums, 7);
        if (k % 2) snare(mix, tk, drums * 0.75);
        drum(mix, 'brushtap', tk + beat / 2, drums * 0.6, 11);
      }
      if (choirVel) choir(mix, voicing(ch, 60), { t, dur: Math.min(bar, to - t), vel: choirVel, vowel: 'u', layers: 1, att: 0.8, seed: b + 90 });
      if (mel) melody(R, ch, 70, 4).forEach((m, k) => {
        const tk = t + k * beat;
        if (tk < to - 0.2) piano(mix, m, { t: tk, dur: beat * 1.1, vel: mel, pan: 0.05 });
      });
      if (solo) {
        // chitarre gemelle: stessa linea a una terza di distanza, una a sinistra e una a destra
        const line = melody(R, ch, 67, 3);
        const rhythm = [[0, 1.5], [1.5, 1], [2.5, 1.5]];
        line.forEach((m, k) => {
          const [o, d] = rhythm[k];
          const tk = t + o * beat;
          if (tk >= to - 0.2) return;
          const dur = Math.min(d * beat, to - tk);
          guitar(mix, m, { t: tk, dur, vel: solo, pan: -0.45, bend: k === 0 ? 2 : 0 });
          guitar(mix, m + (voicing(ch, m).includes(m + 4) ? 4 : 3), { t: tk + 0.01, dur, vel: solo * 0.85, pan: 0.45, bend: k === 0 ? 2 : 0 });
        });
      }
    }
  };

  /** Opera: accordi staccati del pianoforte a ottavi, cori che si rispondono (sinistra grave «o», destra acuta «a»), timpani. */
  const opera = (from, to, { vel = 46, choirVel = 44, timp = 50, full = false } = {}) => {
    from = snap(from); to = snap(to);
    const beat = 30 / BPM, bar = 4 * beat; // passo doppio
    for (let t = from, b = 0; t < to - 0.2; t += bar, b++) {
      const ch = OPERA[b % 4];
      for (let k = 0; k < 8; k++) {
        const tk = t + (k * beat) / 2;
        if (tk >= to - 0.1) break;
        voicing(ch, 57).slice(0, 3).forEach((m) => piano(mix, m, { t: tk, dur: beat * 0.3, vel: vel * (k % 2 ? 0.8 : 1), pan: 0.15 }));
      }
      piano(mix, ch[0] - 12, { t, dur: bar * 0.5, vel, pan: -0.2 });
      timpani(mix, ch[0] - 24 + 12 * (ch[0] < 52 ? 1 : 0), t, timp);
      const half = Math.min(bar / 2, to - t);
      // domanda dal coro grave a sinistra, risposta dal coro acuto a destra
      choir(mix, voicing(ch, 50).slice(0, 3), { t, dur: half * 0.9, vel: choirVel, vowel: 'o', layers: 2, width: 0.25, center: -0.6, att: 0.06, seed: b + 200 });
      if (t + bar / 2 < to - 0.2) choir(mix, voicing(ch, 67).slice(0, 3), { t: t + bar / 2, dur: Math.min(bar / 2, to - t - bar / 2) * 0.9, vel: choirVel, vowel: 'a', layers: 2, width: 0.25, center: 0.6, att: 0.06, seed: b + 300 });
      if (full) choir(mix, voicing(ch, 60), { t, dur: Math.min(bar, to - t), vel: choirVel - 6, vowel: 'a', layers: 2, att: 0.1, seed: b + 400 });
    }
  };

  /** Rock: riff di bicordi a ottavi, batteria piena, chitarre gemelle sopra. */
  const rock = (from, to, { vel = 50, drums = 70, lead = 0, shift = 0 } = {}) => {
    from = snap(from); to = snap(to);
    const beat = 30 / BPM, e = beat / 2; // passo doppio
    for (let t = from, bar = 0; t < to - 0.2; t += 8 * beat, bar++) {
      RIFF.forEach((m, k) => {
        const tk = t + k * e;
        if (m === null || tk >= to - 0.1) return;
        power(mix, m + shift, { t: tk, dur: e * 0.85, vel, mute: k % 4 !== 0, pan: -0.2 });
        bassNote(mix, m + shift - 12, { t: tk, dur: e * 0.9, vel: vel - 6 });
      });
      for (let k = 0; k < 8; k++) {
        const tk = t + k * beat;
        if (tk >= to - 0.1) break;
        drum(mix, 'kick', tk, drums, 7);
        if (k % 2) snare(mix, tk, drums);
        drum(mix, 'shaker', tk + e, drums * 0.5, 11);
        if (k === 0) crash(mix, tk, drums * 0.7);
      }
      if (lead) {
        const ch = [40 + shift + 24, MIN];
        melody(R, ch, 64 + shift, 4).forEach((m, k) => {
          const tk = t + k * 2 * beat;
          if (tk >= to - 0.2) return;
          guitar(mix, m, { t: tk, dur: 1.8 * beat, vel: lead, pan: -0.5, bend: k % 2 ? 0 : 2 });
          guitar(mix, m + 4, { t: tk + 0.01, dur: 1.8 * beat, vel: lead * 0.85, pan: 0.5, bend: k % 2 ? 0 : 2 });
        });
      }
    }
  };

  // ---- sezioni (tempi dai capitoli del JSON)
  // copertina: coro di voci sovrapposte senza strumenti
  acappella(0.2, T.canzone, { vel: 42, layers: 2, high: true });
  // una canzone impossibile: il coro continua, poi entra il pianoforte della ballata
  acappella(T.canzone, C('canzone', 2), { vel: 38, layers: 2 });
  ballad(C('canzone', 2), T.registrazione, { vel: 48, mel: 42 });
  // registrazione: le voci si sovrappongono sempre di più (le sovrapposizioni in studio)
  acappella(T.registrazione, C('registrazione', 2), { vel: 36, layers: 2 });
  acappella(C('registrazione', 2), C('registrazione', 3), { vel: 40, layers: 4, high: true });
  acappella(C('registrazione', 3), T.confessione, { vel: 42, layers: 6, high: true });
  // confessione: la ballata vera, poi basso e batteria, poi l'assolo delle chitarre gemelle
  ballad(T.confessione, C('confessione', 2), { vel: 46, choirVel: 30 });
  ballad(C('confessione', 2), C('confessione', 4), { vel: 46, bass: 44, drums: 34, mel: 38 });
  ballad(C('confessione', 4), T.opera, { vel: 40, bass: 46, drums: 40, solo: 46 });
  // opera: staccati, cori a botta e risposta, timpani; poi tutto il coro insieme
  opera(T.opera, C('opera', 3), { vel: 40, choirVel: 38, timp: 44 });
  opera(C('opera', 3), T.rock, { vel: 42, choirVel: 40, timp: 50, full: true });
  // rock: riff e chitarre gemelle; poi coda al pianoforte
  rock(T.rock, C('rock', 3), { vel: 52, drums: 72, lead: 42 });
  ballad(C('rock', 3), T.significato, { vel: 40, choirVel: 22, chords: [[52, MAJ], [47, MAJ], [49, MIN], [45, MAJ]] });
  // significato: di nuovo il coro senza strumenti, sospeso
  acappella(T.significato, T.radio, { vel: 32, layers: 2, vowel: 'u' });
  // radio: la ballata con basso e batteria leggera; in onda si allarga con il coro
  ballad(T.radio, C('radio', 3), { vel: 42, bass: 40, drums: 30, mel: 36 });
  ballad(C('radio', 3), T['seconda-vita'], { vel: 46, bass: 44, drums: 38, mel: 40, choirVel: 30 });
  // seconda vita: pianoforte raccolto, poi in auto torna il rock (si scuote la testa), alla fine il coro in maggiore
  ballad(T['seconda-vita'], C('seconda-vita', 2), { vel: 38 });
  rock(C('seconda-vita', 2), C('seconda-vita', 4), { vel: 48, drums: 64 });
  ballad(C('seconda-vita', 4), T.finale, { vel: 46, bass: 44, drums: 36, choirVel: 34, chords: LIFT, solo: 36 });

  // finale: accordo di Do a voci piene e il gong che si spegne
  const F = snap(T.finale); // sulla griglia, dove finisce l'ultima sezione
  choir(mix, [48, 55, 60, 64, 67, 72], { t: F, dur: 3.3, vel: 42, layers: 3, att: 0.5, seed: 500 });
  piano(mix, 48, { t: F, dur: 3.5, vel: 46, pan: -0.1 });
  gong(mix, F - 0.6, { vel: 34, len: 5, seed: 13 });

  // ---------------------------------------------------------------- effetti sonori (tempi delle scene)
  const TUONI = [['tuono_classico', 0.98, 5], ['tuono_secco', 0.78, 5], ['tuono_forte', 0.55, 5], ['tuono_breve', 1.47, 2.6]];
  let nt = 0;
  const tuono = (t, power) => {
    const [id, da, durata] = TUONI[nt++ % TUONI.length];
    clip(mix, id, { t: t + 0.1, da, durata, gain: 0.7 * power, fadeIn: 0.03, fadeOut: 1.2, rev: 0.35, pan: 0.1 });
  };
  const scatto = (t, gain = 0.25, da = 12.68, rate = 1, pan = 0) => clip(mix, 'scatti', { t, da, durata: 0.15, gain, rate, pan, rev: 0.2 });
  // copertina: tuono sul fondale, colpo di gong
  tuono(0.9, 0.6);
  gong(mix, 1.1, { vel: 46, len: 5, seed: 3 });
  // soggiorno: fogli che volano
  clip(mix, 'telo', { t: C('canzone', 4) + 0.1, da: 4.57, durata: 1.0, gain: 0.25, fadeOut: 0.3, rev: 0.2 });
  // registrazione: il nastro parte, i tre microfoni, il contatore a 180, il nastro che si consuma
  scatto(T.registrazione + 0.3, 0.35, 6.49);
  [0, 1, 2].forEach((i) => scatto(C('registrazione', 1) + 0.25 + i * 0.6, 0.2, 12.68, 1 + i * 0.1, -0.4 + i * 0.4));
  crescendo(mix, C('registrazione', 3) + 0.7, 1.6, { gain: 0.35 });
  clip(mix, 'disturbo', { t: C('registrazione', 4) + 0.2, da: 2, durata: 1.4, gain: 0.15, fadeIn: 0.3, fadeOut: 0.6, rev: 0.2 });
  // confessione: pioggia, la porta che si apre
  clip(mix, 'pioggia_dura', { t: T.confessione, da: 5.4, durata: T.opera - T.confessione, gain: 0.8, fadeIn: 1.2, fadeOut: 1.2, largo: 3, rev: 0.12 });
  clip(mix, 'porta_cigolio', { t: C('confessione', 3) + 0.6, da: 10.68, durata: 1.6, gain: 0.35, fadeOut: 0.4, rev: 0.3, pan: 0.3 });
  // opera: due tuoni (inizio e Belzebù), la botola che si apre
  tuono(C('opera', 0) + 0.25, 1.2);
  clip(mix, 'colpi_legno', { t: C('opera', 4) + 0.1, da: 12.55, durata: 0.8, gain: 0.45, fadeOut: 0.3, rev: 0.4 });
  tuono(C('opera', 4) + 0.3, 1.3);
  clip(mix, 'passaggio', { t: C('opera', 4) + 0.2 - 0.4, da: 12.27, durata: 2.0, gain: 0.3, fadeOut: 0.6, rev: 0.4 });
  // rock: esplosione iniziale, il gong finale
  crash(mix, C('rock', 0) + 0.25, 80);
  tuono(C('rock', 0) + 0.25, 0.4);
  gong(mix, C('rock', 4) + 1.2, { vel: 52, len: 6, seed: 7 });
  // significato: il punto interrogativo disegnato, il cassetto, le lampadine che si spengono
  [0, 0.5, 1.0, 1.5, 2.45].forEach((d, i) => chalk(mix, C('significato', 0) + 0.4 + d, 34 - i * 2, 23 + i));
  clip(mix, 'colpi_legno', { t: C('significato', 3) + 1.1, da: 1.4, durata: 0.4, gain: 0.25, rev: 0.3 });
  const RB = rng(6161);
  for (let i = 0; i < 14; i++) pop(mix, C('significato', 4) + RB() * 0.9, 22, { pitch: -4 + (i % 5), pan: -0.5 + (i % 7) * 0.15 });
  // radio: fruscio della radio, ON AIR, telefono, lettere
  clip(mix, 'radio_sintonia', { t: T.radio + 0.1, da: 1.5, durata: 1.2, gain: 0.3, fadeIn: 0.03, fadeOut: 0.15, pan: -0.15, rev: 0.12 });
  channelClick(mix, C('radio', 3), 50);
  for (let i = 0; i < 8; i++) pop(mix, C('radio', 3) + 0.4 + i * 0.22, 30, { pitch: 12 + (i % 2) * 3, pan: 0.5 });
  clip(mix, 'telo', { t: C('radio', 3) + 0.3, da: 12.85, durata: 0.9, gain: 0.2, fadeOut: 0.3, rev: 0.2 });
  crescendo(mix, C('radio', 4) + 1.2, 1.2, { gain: 0.3 });
  // seconda vita: la radio si accende, la cassetta parte, la città si illumina
  channelClick(mix, C('seconda-vita', 1), 46);
  scatto(C('seconda-vita', 2), 0.35, 6.49);
  crescendo(mix, C('seconda-vita', 4) + 0.8, 1.6, { gain: 0.35 });
};
