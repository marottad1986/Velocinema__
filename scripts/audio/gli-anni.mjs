// Colonna sonora originale per «Gli anni» (883), discreta sotto la voce. Richiama lo STILE della canzone e del pop
// italiano anni Novanta (tempo medio, pianoforte che batte gli accordi a ottavi, basso, batteria con cassa e rullante,
// archi che si aprono nel ritornello, un campanello di glockenspiel), mai le note: melodie e giri di accordi sono
// inventati qui (CLAUDE.md, «Canzoni spiegate»).
// Forma come una canzone pop: intro (copertina) → strofa (Pavia) → stacco (la cantina) → crescendo (l'uscita) →
// ritornello (il bar, i ricordi) → ponte in minore (gli amici) → stacco sospeso (il significato) → ultimo ritornello
// (oggi), che si spegne sul pianoforte per la domanda finale → accordo del finale.
// Un solo tempo per tutto il video: 600/7 ≈ 85,7 bpm, così ogni capitolo da 14 s dura esattamente 5 battute e
// gli inizi di capitoli e finale cadono sul battere (griglia che parte a 4 s, fine della copertina).
// Strumenti campionati (VCSL e VSCO-2 CE, CC0); effetti registrati (scripts/audio/effetti.mjs).
// Effetti agganciati agli eventi delle scene in src/scenes/gli-anni/.
import { rng } from './synth.mjs';
import { suona, archi, colpo, crescendo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte_coda', 'contrabbasso_pizz', 'violini', 'viole', 'celli', 'contrabbasso', 'glockenspiel',
  'cassa', 'rullante', 'charleston', 'piatto_crash', 'piatto_sospeso'];
export const effetti = ['telo', 'scatti', 'porta_cigolio', 'voci_caffe', 'tintinnio', 'radio_sintonia', 'campane_festa', 'clacson',
  'applauso', 'vento_leggero', 'sedia', 'aereo', 'motorino', 'monete', 'pagine', 'fiammifero', 'ronzio_neon'];
/** Sala piccola e asciutta, da studio pop. */
export const sala = { rt60: 1.4, brillo: 7500, predelay: 0.015, wet: 0.35 };

// ---------------------------------------------------------------- strumenti (campionati)

const piano = (mix, m, { t, dur = 1, vel = 60, pan = 0, rev = 0.3, gain = 1 }) =>
  suona(mix, 'pianoforte_coda', m, { t, dur: Math.min(dur, 4), vel: vel * 1.15, pan, rev, gain: gain * 0.6, release: 0.25 });
const bassNote = (mix, m, { t, dur, vel }) =>
  suona(mix, 'contrabbasso_pizz', m < 28 ? m + 12 : m, { t, dur, vel: vel * 1.6, gain: 1.8, rev: 0.12, release: 0.12 });
const glock = (mix, m, { t, vel = 50, pan = 0.25 }) =>
  suona(mix, 'glockenspiel', m < 79 ? m + 12 * Math.ceil((79 - m) / 12) : m, { t, dur: 0.6, vel: vel * 1.5, pan, rev: 0.45, gain: 0.45, release: 0.8 });
const kick = (mix, t, vel = 60) => colpo(mix, 'cassa', vel > 55 ? 'v5' : 'v3', { t, vel: 100, gain: 0.8 * (vel / 60), rev: 0.1, seed: Math.round(t * 100) });
const snare = (mix, t, vel = 60) => colpo(mix, 'rullante', vel > 55 ? 'v6' : vel > 40 ? 'v5' : 'v4', { t, vel: 100, gain: 0.55 * (vel / 60), pan: 0.05, rev: 0.22, seed: Math.round(t * 100) });
const hat = (mix, t, vel = 40) => colpo(mix, 'charleston', vel > 45 ? 'v3' : 'v2', { t, vel: 100, gain: 0.28 * (vel / 50), pan: 0.3, rev: 0.1, seed: Math.round(t * 100) });
const crash = (mix, t, vel = 50) => colpo(mix, 'piatto_crash', vel > 60 ? 'ff' : 'mf', { t, vel: 100, gain: 0.32 * (vel / 60), pan: 0.35, rev: 0.3, dur: 2.5, release: 0.8 });

const BPM = 600 / 7;
const BEAT = 60 / BPM;
const GRID = 4 * BEAT;
const OFF = 4;
const snap = (t) => OFF + Math.round((t - OFF) / GRID) * GRID;

// ---------------------------------------------------------------- materiale musicale (inventato qui)

const MAJ = [0, 4, 7], MIN = [0, 3, 7];
// giri scelti diversi da quello della strofa della canzone (vi–IV–I–V in Sol), anche ruotati
// strofa in Re: Re · Fa diesis min · Sol · La (I–iii–IV–V)
const STROFA = [[62, MAJ], [54, MIN], [55, MAJ], [57, MAJ]];
// ritornello: Sol · La · Fa diesis min · Si min (IV–V–iii–vi)
const RIT = [[55, MAJ], [57, MAJ], [54, MIN], [59, MIN]];
// ponte in minore: Si min · La · Sol · Fa diesis (discesa andalusa)
const PONTE = [[59, MIN], [57, MAJ], [55, MAJ], [54, MAJ]];

const voicing = ([root, iv], lo) => {
  const out = iv.map((v) => {
    let m = root + v;
    while (m < lo) m += 12;
    while (m >= lo + 12) m -= 12;
    return m;
  }).sort((a, b) => a - b);
  return [...out, out[0] + 12];
};

/** Linea a passi per grado sulle note dell'accordo (seme fisso). */
const melody = (R, chord, lo, n) => {
  const pool = voicing(chord, lo).concat(voicing(chord, lo + 12));
  let k = Math.floor(R() * 3) + 1;
  return Array.from({ length: n }, () => {
    k = Math.max(0, Math.min(pool.length - 1, k + [-1, 1, 1, -1, 2][Math.floor(R() * 5)]));
    return pool[k];
  });
};

export default (mix, T) => {
  const film = loadFilm('gli-anni');
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
  const R = rng(883);

  /**
   * Una sezione sulla griglia. chords: giro di 4 battute.
   * pno: pianoforte (pulse = accordi a ottavi, altrimenti accordi lunghi) · bass · drums (0 = niente) · half: batteria
   * a metà passo · str: archi tenuti · glk: campanello di glockenspiel · mel: melodia al pianoforte acuto
   */
  const sezione = (from, to, chords, o) => {
    from = snap(from); to = snap(to);
    for (let t = from, b = 0; t < to - 0.2; t += GRID, b++) {
      const ch = chords[b % 4];
      const v = voicing(ch, 60).slice(0, 3);
      const left = to - t;
      if (o.pno) {
        if (o.pulse) for (let k = 0; k < 8; k++) {
          const tk = t + (k * BEAT) / 2;
          if (tk >= to - 0.1) break;
          v.forEach((m) => piano(mix, m, { t: tk, dur: BEAT * 0.45, vel: o.pno * (k % 2 ? 0.75 : 1), pan: 0.12 }));
        }
        else v.forEach((m) => piano(mix, m, { t, dur: Math.min(GRID, left), vel: o.pno, pan: 0.12 }));
        piano(mix, ch[0] - 12, { t, dur: Math.min(GRID, left), vel: o.pno * 0.9, pan: -0.15 });
      }
      if (o.bass) [0, 3, 4, 7].forEach((k) => {
        const tk = t + (k * BEAT) / 2;
        if (tk < to - 0.1) bassNote(mix, ch[0] - 24 + (k === 7 ? 7 : 0), { t: tk, dur: BEAT * 0.45, vel: o.bass * (k ? 0.85 : 1) });
      });
      if (o.drums) for (let k = 0; k < 4; k++) {
        const tk = t + k * BEAT;
        if (tk >= to - 0.1) break;
        if (o.half) { if (k === 0) kick(mix, tk, o.drums); if (k === 2) snare(mix, tk, o.drums * 0.8); }
        else {
          if (k === 0 || k === 2 || (k === 3 && b % 2)) kick(mix, k === 3 ? tk + BEAT / 2 : tk, o.drums);
          if (k % 2) snare(mix, tk, o.drums);
        }
        hat(mix, tk, o.drums * 0.7);
        if (!o.half) hat(mix, tk + BEAT / 2, o.drums * 0.5);
      }
      if (o.str) voicing(ch, 55).forEach((m, j) => archi(mix, m, { t, dur: Math.min(GRID * 1.02, left), vel: o.str, pan: (j - 1.5) * 0.3, gain: 0.55, seed: j + b }));
      if (o.str) archi(mix, ch[0] - 24, { t, dur: Math.min(GRID * 1.02, left), vel: o.str, gain: 0.5 });
      if (o.glk && b % 2 === 0) melody(R, ch, 79, 4).forEach((m, k) => {
        const tk = t + k * BEAT;
        if (tk < to - 0.2) glock(mix, m, { t: tk, vel: o.glk });
      });
      if (o.mel) {
        const line = melody(R, ch, 72, 3);
        [[0, 1.5], [1.5, 1], [2.5, 1.5]].forEach(([s, d], k) => {
          const tk = t + s * BEAT;
          if (tk < to - 0.2) piano(mix, line[k], { t: tk, dur: d * BEAT, vel: o.mel, pan: 0.05 });
        });
      }
    }
  };

  // ---- sezioni (tempi dai capitoli del JSON)
  // intro: levare con archi e un campanello, poi una battuta di pianoforte prima della strofa
  [50, 54, 57, 62].forEach((m, j) => archi(mix, m, { t: 0.05, dur: OFF - GRID - 0.05, vel: 26, pan: (j - 1.5) * 0.3, gain: 0.5, seed: 70 + j }));
  piano(mix, 38, { t: 0.05, dur: OFF - GRID, vel: 40, pan: -0.15 });
  glock(mix, 81, { t: OFF - 2 * GRID + 3 * BEAT, vel: 44 });
  sezione(OFF - GRID, T.pavia, STROFA, { pno: 52, glk: 48, str: 26 });
  // strofa: entra la band; sull'ultima frase («mezza Italia li canta») si apre
  sezione(T.pavia, C('pavia', 4), STROFA, { pno: 46, pulse: true, bass: 44, drums: 44, mel: 38 });
  sezione(C('pavia', 4), T.cantina, RIT, { pno: 50, pulse: true, bass: 48, drums: 52, str: 34, glk: 36 });
  // stacco: la cantina, pianoforte e archi soli, batteria a metà passo
  sezione(T.cantina, C('cantina', 2), PONTE, { pno: 40, str: 28 });
  sezione(C('cantina', 2), T.uscita, PONTE, { pno: 42, pulse: true, bass: 36, drums: 32, half: true });
  // crescendo: l'uscita del disco
  sezione(T.uscita, C('uscita', 3), STROFA, { pno: 46, pulse: true, bass: 44, drums: 44, str: 30 });
  sezione(C('uscita', 3), T.bar, STROFA, { pno: 44, bass: 40, str: 36, mel: 40 });
  // ritornello: il bar e i ricordi
  sezione(T.bar, T.amici, RIT, { pno: 42, pulse: true, bass: 40, drums: 45, str: 40, glk: 40 });
  // ponte in minore: gli amici cresciuti
  sezione(T.amici, T.significato, PONTE, { pno: 44, bass: 40, drums: 36, half: true, str: 36, mel: 36 });
  // stacco sospeso: il significato; sull'alba riparte la batteria
  sezione(T.significato, C('significato', 4), STROFA, { pno: 40, str: 30, mel: 34 });
  sezione(C('significato', 4), T.oggi, STROFA, { pno: 46, pulse: true, bass: 44, drums: 40, str: 36 });
  // ultimo ritornello; sulla domanda finale resta il pianoforte
  sezione(T.oggi, C('oggi', 3), RIT, { pno: 43, pulse: true, bass: 42, drums: 50, str: 48, glk: 44 });
  sezione(C('oggi', 3), T.finale, RIT, { pno: 40, glk: 30 });

  // finale: accordo di Re aperto e un ultimo campanello
  const F = snap(T.finale);
  [38, 50, 57, 62, 66, 69].forEach((m) => piano(mix, m, { t: F, dur: 3.8, vel: 54 }));
  [62, 66, 69, 74].forEach((m, j) => archi(mix, m, { t: F, dur: 3.6, vel: 36, pan: (j - 1.5) * 0.3, gain: 0.55, seed: 50 + j }));
  [86, 90, 93].forEach((m, j) => glock(mix, m, { t: F + BEAT + j * BEAT / 2, vel: 42 }));

  // ---- piatti sui passaggi principali
  [C('pavia', 4), T.bar, T.oggi].forEach((t) => crash(mix, snap(t), 56));
  crescendo(mix, snap(T.bar), 2.5, { gain: 0.3 });
  crescendo(mix, snap(T.oggi), 2.5, { gain: 0.3 });

  // ---------------------------------------------------------------- effetti (tempi delle scene)
  // pavia: il mangianastri parte (tasto), le rondini
  clip(mix, 'scatti', { t: C('pavia', 1), da: 0.99, durata: 0.27, gain: 0.3, rev: 0.2, pan: -0.4 });
  clip(mix, 'vento_leggero', { t: T.pavia, da: 0.5, durata: 14, gain: 0.04, fadeIn: 1.5, fadeOut: 1.5, largo: 4 });
  // cantina: l'aereo lontano nella finestrella, il registratore va in REC (due tasti), la sedia che si sposta
  clip(mix, 'aereo', { t: C('cantina', 1), da: 0, durata: 3, gain: 0.05, lp: 1500, fadeIn: 0.8, fadeOut: 0.8, largo: 3, rev: 0.3 });
  clip(mix, 'scatti', { t: C('cantina', 2), da: 12.68, durata: 0.15, gain: 0.5, rev: 0.25 });
  clip(mix, 'scatti', { t: C('cantina', 2) + 0.25, da: 6.5, durata: 0.12, gain: 0.35, rev: 0.25 });
  clip(mix, 'sedia', { t: C('cantina', 3) + 0.4, da: 3.5, durata: 1.2, gain: 0.2, fadeOut: 0.3, rev: 0.25, pan: 0.2 });
  // uscita: il foglio della classifica che si sposta
  clip(mix, 'telo', { t: C('uscita', 1) + 0.8, da: 4.57, durata: 0.8, gain: 0.2, fadeOut: 0.3, rev: 0.2 });
  // uscita: si accendono le candeline del 25
  clip(mix, 'fiammifero', { t: C('uscita', 2) + 0.13, da: 5.88, durata: 0.8, gain: 0.25, fadeOut: 0.3, rev: 0.2 });
  // bar: la porta che si apre, le voci lontane, i bicchieri
  clip(mix, 'porta_cigolio', { t: T.bar + 0.1, da: 10.68, durata: 1.4, gain: 0.3, fadeOut: 0.4, rev: 0.3, pan: -0.4 });
  clip(mix, 'voci_caffe', { t: T.bar, da: 2, durata: T.ricordi - T.bar, gain: 0.06, fadeIn: 1, fadeOut: 1.5, largo: 4, rev: 0.15 });
  clip(mix, 'tintinnio', { t: C('bar', 2) + 0.3, da: 0.16, durata: 0.3, gain: 0.25, rev: 0.25, pan: 0.1 });
  // il calendario che gira dal 1985 al 1995, il jukebox che si accende
  clip(mix, 'pagine', { t: C('bar', 3), da: 0.9, durata: 0.6, gain: 0.25, fadeOut: 0.2, rev: 0.2, pan: 0.4 });
  clip(mix, 'scatti', { t: C('bar', 4), da: 1.1, durata: 0.15, gain: 0.3, rev: 0.2, pan: 0.35 });
  // ricordi: il motorino che si accende, la televisione, le monete nel salvadanaio
  clip(mix, 'motorino', { t: C('ricordi', 1), da: 0.5, durata: 1.6, gain: 0.12, fadeIn: 0.05, fadeOut: 0.5, rev: 0.15, pan: -0.3 });
  clip(mix, 'monete', { t: C('ricordi', 3) + 0.05, da: 1.5, durata: 0.6, gain: 0.25, fadeOut: 0.15, rev: 0.2, pan: 0.45 });
  clip(mix, 'radio_sintonia', { t: C('ricordi', 2), da: 1.5, durata: 1.0, gain: 0.7, fadeIn: 0.03, fadeOut: 0.2, pan: 0.35, rev: 0.12 });
  // amici: campane della festa e clacson dell'auto degli sposi
  clip(mix, 'campane_festa', { t: C('amici', 1), da: 0.04, durata: 4.5, gain: 0.18, fadeOut: 1.5, largo: 2, rev: 0.3 });
  clip(mix, 'clacson', { t: C('amici', 1) + 1.2, da: 0.25, durata: 0.45, gain: 0.22, fadeOut: 0.1, rev: 0.25, pan: -0.3 });
  // significato: l'aeroplanino di carta
  // significato: si accendono le candeline del 17
  clip(mix, 'fiammifero', { t: C('significato', 2) - 0.07, da: 3.88, durata: 0.9, gain: 0.3, fadeOut: 0.3, rev: 0.2, pan: -0.2 });
  clip(mix, 'telo', { t: C('significato', 4) + 0.5, da: 8.45, durata: 0.75, gain: 0.2, fadeOut: 0.3, rev: 0.3, pan: 0.3 });
  // oggi: lo stadio e il palco
  // insegne BAR che si accendono: all'uscita (Uscita.tsx, onAt = cue 4) e oggi (Oggi.tsx, onAt = cue 3 + 0,4)
  /** Insegna al neon che si accende (Neon in elements.tsx: 0,5 s di sfarfallio dal suo onAt): scatto registrato e ronzio
   * a regime (presa da 2,6 s nel file), che si spegne prima di fine. */
  const neon = (t, fine, gain = 0.1) => {
    clip(mix, 'ronzio_neon', { t, da: 0, durata: 0.55, gain: gain * 1.2, fadeOut: 0.05, rev: 0.2 });
    clip(mix, 'ronzio_neon', { t: t + 0.55, da: 2.6, durata: Math.min(3.5, fine - t - 0.6), gain, fadeIn: 0.05, fadeOut: 1.2, rev: 0.2 });
  };
  neon(C('uscita', 4), T.bar);
  neon(C('oggi', 3) + 0.4, T.finale, 0.07);
  clip(mix, 'applauso', { t: C('oggi', 1), da: 3, durata: C('oggi', 3) - C('oggi', 1), gain: 0.22, fadeIn: 1.2, fadeOut: 1.5, largo: 3, rev: 0.3 });
};
