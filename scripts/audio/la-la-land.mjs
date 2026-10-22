// Colonna sonora originale di La La Land: jazz da club, discreto sotto la voce.
// Pianoforte, contrabbasso pizzicato e tromba con sordina harmon (campionati, VSCO-2 CE), spazzole, glockenspiel
// per gli scintillii. Giri di accordi e linee melodiche inventati qui (nessun tema del film): la melodia è generata
// a passi per grado dalla scala di ogni accordo, con seme fisso.
// Effetti registrati (archivio CC0, scripts/audio/effetti.mjs) agganciati a inizi di capitolo o di sottotitolo
// (tempi dei sottotitoli in proporzione ai caratteri).
import { drum, neonHum, rng } from './synth.mjs';
import { suona, archi } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['pianoforte', 'contrabbasso_pizz', 'tromba_sordina', 'glockenspiel', 'violini', 'viole', 'celli'];
export const effetti = ['clacson', 'campanello_negozio', 'martelletto', 'tacchi', 'scatti', 'voci_caffe', 'voci_sala'];
/** Club piccolo: coda corta e calda. */
export const sala = { rt60: 1.6, brillo: 6500, predelay: 0.018, wet: 0.45 };

/**
 * Una nota (frequenza in Hz, come nella versione sintetica) sullo strumento campionato corrispondente:
 * upright → contrabbasso pizzicato · epiano → pianoforte · vibes → tromba con sordina (sopra il Re6: glockenspiel)
 * · pad → archi tenuti.
 */
const note = (mix, inst, f, { t, dur, vel = 64, pan = 0, rev = 0.25, gain = 1, seed = 1 }) => {
  const m = Math.round(69 + 12 * Math.log2(f / 440));
  if (inst === 'upright') suona(mix, 'contrabbasso_pizz', m, { t, dur, vel: vel * 1.5, pan, rev, gain: gain * 1.6, release: 0.12, seed });
  else if (inst === 'epiano') suona(mix, 'pianoforte', m, { t, dur, vel: vel * 1.3, pan, rev, gain: gain * 3, release: 0.35, seed });
  else if (inst === 'vibes' && m >= 86) suona(mix, 'glockenspiel', m - 12, { t, dur, vel: vel * 1.3, pan, rev, gain: gain * 0.5, release: 1, seed });
  else if (inst === 'vibes') suona(mix, 'tromba_sordina', m, { t, dur: Math.min(dur, 1.6), vel: vel * 1.4, pan, rev, gain: gain * 0.9, release: 0.18, seed });
  else if (inst === 'pad') archi(mix, m, { t, dur, vel: vel + 10, pan, rev, gain: gain * 1.2, attack: 0.8, release: 1.2, seed });
};

const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const BPM = 120;

// qualità degli accordi: intervalli dalla fondamentale (voicing) e scala per la melodia
const Q = {
  maj7: { v: [4, 7, 11, 14], sc: [0, 2, 4, 7, 9, 11], ct: [0, 4, 7, 11], bass: [0, 2, 4, 7] },
  maj6: { v: [4, 7, 9, 14], sc: [0, 2, 4, 7, 9, 11], ct: [0, 4, 7, 9], bass: [0, 2, 4, 7] },
  m7: { v: [3, 7, 10, 14], sc: [0, 2, 3, 5, 7, 10], ct: [0, 3, 7, 10], bass: [0, 2, 3, 7] },
  dom7: { v: [4, 7, 10, 14], sc: [0, 2, 4, 7, 9, 10], ct: [0, 4, 7, 10], bass: [0, 2, 4, 7] },
  m7b5: { v: [3, 6, 10, 14], sc: [0, 3, 5, 6, 10], ct: [0, 3, 6, 10], bass: [0, 3, 5, 6] },
  dom7b9: { v: [4, 7, 10, 13], sc: [0, 1, 4, 5, 7, 8, 10], ct: [0, 4, 7, 10], bass: [0, 4, 7, 10] },
};

// giri di accordi: [classe di altezza della fondamentale, qualità]
const P_F = [[5, 'maj7'], [2, 'm7'], [7, 'm7'], [0, 'dom7']]; // brillante
const P_C = [[0, 'maj7'], [9, 'dom7'], [2, 'm7'], [7, 'dom7']];
const P_EB = [[3, 'maj7'], [0, 'm7'], [5, 'm7'], [10, 'dom7']]; // caldo
const P_AB = [[8, 'maj7'], [5, 'm7'], [1, 'maj7'], [3, 'dom7']];
const P_BB = [[10, 'maj6'], [7, 'dom7'], [0, 'm7'], [5, 'dom7']]; // swing
const P_D = [[2, 'maj7'], [11, 'm7'], [4, 'm7'], [9, 'dom7']]; // sospeso
const P_G = [[7, 'maj7'], [4, 'm7'], [9, 'm7'], [2, 'dom7']];
const P_A6 = [[9, 'maj6'], [6, 'dom7'], [11, 'm7'], [4, 'dom7']]; // band
const P_AM = [[9, 'm7'], [11, 'm7b5'], [4, 'dom7b9'], [9, 'm7']]; // teso, minore
const P_UP = [[0, 'maj7'], [9, 'm7'], [5, 'maj7'], [7, 'dom7']]; // si schiarisce
const P_EP = [[3, 'maj7'], [0, 'm7'], [8, 'maj7'], [8, 'm7']]; // agrodolce (il IV diventa minore)

/** Fonde una classe di altezza dentro l'intervallo [lo, hi] (MIDI). */
const fold = (m, lo) => {
  let x = m;
  while (x < lo) x += 12;
  while (x >= lo + 12) x -= 12;
  return x;
};

export default (mix, T) => {
  const { segments } = timeline(loadFilm('la-la-land'));
  const seg = Object.fromEntries(segments.map((s) => [s.id, s]));
  /** Secondo d'inizio della frase n-esima del capitolo (tempi in proporzione ai caratteri). */
  const cue = (id, n) => {
    const s = seg[id];
    const tot = s.testo.reduce((a, x) => a + x.length, 0);
    let acc = 0;
    for (let k = 0; k < n; k++) acc += s.testo[k].length;
    return s.start + (s.dur * acc) / tot;
  };

  // lev: 0 teso e basso, 1 caldo con spazzole leggere, 2 brillante. mel: strumento della melodia. passo: 'meta' | 'pieno'.
  // sw = quota dello swing (0,5 dritto, 0,667 terzinato). dens = probabilità di una battuta con melodia.
  // Un solo tempo per tutto il film (120 bpm), come una band che suona dall'inizio alla fine: le scene intime vanno
  // a metà passo (accordi, basso e spazzole a 60), le altre a passo pieno. I cambi di sezione cadono sulla battuta
  // più vicina all'inizio del capitolo, sulla stessa griglia.
  const GRID = (4 * 60) / BPM;
  const snap = (t) => Math.round(t / GRID) * GRID;
  const S = (id, from, to, o) => ({ id, from: snap(from), to: snap(to), ...o });
  const sections = [
    S('copertina', 0, T.ingorgo, { passo: 'pieno', prog: P_F, lev: 1, sw: 0.62, mel: 'vibes', dens: 1, mv: 52 }),
    S('ingorgo', T.ingorgo, T.caffe, { passo: 'pieno', prog: P_F, lev: 2, sw: 0.64, mel: 'vibes', dens: 0.9, mv: 46 }),
    S('caffe', T.caffe, T.piano, { passo: 'pieno', prog: P_C, lev: 1, sw: 0.62, mel: 'epiano', dens: 0.6, mv: 42 }),
    S('piano', T.piano, T.collina, { passo: 'meta', prog: P_EB, lev: 1, sw: 0.6, mel: 'epiano', dens: 0.85, mv: 48 }),
    S('collina', T.collina, T.jazz, { passo: 'pieno', prog: P_AB, lev: 1, sw: 0.64, mel: 'vibes', dens: 0.8, mv: 46 }),
    S('jazz', T.jazz, T.osservatorio, { passo: 'pieno', prog: P_BB, lev: 2, sw: 0.667, mel: 'epiano', dens: 0.95, mv: 46 }),
    S('osservatorio', T.osservatorio, T.sogno, { passo: 'meta', prog: P_D, lev: 1, sw: 0.58, mel: 'vibes', dens: 0.7, mv: 44, pad: true, soft: true }),
    S('sogno', T.sogno, T.band, { passo: 'pieno', prog: P_G, lev: 1, sw: 0.62, mel: 'epiano', dens: 0.7, mv: 44 }),
    S('band', T.band, T.prima, { passo: 'pieno', prog: P_A6, lev: 2, sw: 0.62, mel: 'vibes', dens: 1, mv: 48, kick: true }),
    S('prima', T.prima, T.audizione, { passo: 'meta', prog: P_AM, lev: 0, sw: 0.58, mel: 'epiano', dens: 0.35, mv: 36, pad: true }),
    S('audizione-a', T.audizione, T.audizione + 4, { passo: 'meta', prog: P_AM, lev: 0, sw: 0.58, mel: 'epiano', dens: 0.3, mv: 36, pad: true }),
    S('audizione-b', T.audizione + 4, T.epilogo, { passo: 'pieno', prog: P_UP, lev: 1, sw: 0.62, mel: 'epiano', dens: 0.8, mv: 46 }),
    S('epilogo', T.epilogo, T.finale, { passo: 'meta', prog: P_EP, lev: 1, sw: 0.6, mel: 'both', dens: 0.85, mv: 46, pad: true, soft: true }),
  ];

  // il corpo della musica resta più basso degli effetti: la normalizzazione al picco lo tiene discreto sotto la voce
  const BODY = 0.62;
  const bnote = (m, inst, n, o) => note(m, inst, n, { ...o, gain: (o.gain ?? 1) * BODY });
  const bdrum = (m, kind, t, vel, seed) => drum(m, kind, t, vel * BODY ** 0.6, seed);

  sections.forEach((sec, si) => {
    const beat = (60 / BPM) * (sec.passo === 'meta' ? 2 : 1);
    const bar = 4 * beat;
    const R = rng(1000 + si * 77);
    // posizione in secondi di un "tempo" frazionario (0, 0,5, 1, 1,5…) con swing sulle metà
    const pos = (t0, b) => t0 + (Math.floor(b) + (b % 1 >= 0.5 ? sec.sw : 0)) * beat;
    let mNote = 76;
    for (let k = 0, t = sec.from; t < sec.to - 0.25 * bar; k++, t += bar) {
      const [pc, q] = sec.prog[k % 4];
      const nx = sec.prog[(k + 1) % 4];
      const Qd = Q[q];
      const root = 36 + pc; // C2..B2
      const rootB = root > 47 ? root - 12 : root;
      const left = sec.to - t; // tempo rimasto nella sezione
      const vlev = sec.soft ? 0.8 : 1;

      // ---- basso: walking a quarti (lev 1-2), note lunghe (lev 0)
      if (sec.lev === 0) {
        bnote(mix, 'upright', mtof(rootB), { t, dur: Math.min(beat * 2.2, left), vel: 54, gain: 0.65, rev: 0.08 });
        if (left > 2 * beat + 0.05) bnote(mix, 'upright', mtof(rootB + 7), { t: t + 2 * beat, dur: Math.min(beat * 1.8, left - 2 * beat), vel: 44, gain: 0.65, rev: 0.08 });
      } else {
        const approach = 36 + nx[0] + (R() < 0.5 ? 1 : -1);
        const bn = [rootB, rootB + Qd.bass[1 + Math.floor(R() * 2)], rootB + Qd.bass[2 + Math.floor(R() * 2)], approach > 48 ? approach - 12 : approach];
        bn.forEach((m, b) => {
          if (t + b * beat > sec.to - 0.05) return;
          bnote(mix, 'upright', mtof(m > 50 ? m - 12 : m), { t: t + b * beat, dur: Math.min(beat * 0.9, left - b * beat - 0.03), vel: (b === 0 ? 62 : 54) * vlev, gain: 0.5, rev: 0.06 });
        });
      }

      // ---- piano elettrico: accordo (voicing a 4 note intorno al Do centrale)
      const voice = Qd.v.map((iv) => fold(root + 12 + iv, 57));
      const comp = sec.lev === 0 ? [[0, 36]] : sec.lev === 1 ? [[0, 42], [2.5, 34]] : k % 2 ? [[0, 42], [1.5, 38], [3.5, 30]] : [[0, 42], [1.5, 38], [2.5, 32]];
      for (const [b, v] of comp) {
        if (left < b * beat + 0.2) continue;
        voice.forEach((m, j) => bnote(mix, 'epiano', mtof(m), { t: pos(t, b) + j * 0.007, dur: beat * (sec.lev === 0 ? 3.4 : 1.2), vel: v * vlev, pan: -0.2 + j * 0.1, rev: 0.3, gain: 0.36 }));
      }
      if (sec.pad && left > bar * 0.7) {
        [root + 12, root + 12 + Qd.v[1], root + 24 + Qd.v[0] - 12].forEach((m, j) => bnote(mix, 'pad', mtof(fold(m, 48)), { t, dur: bar, vel: sec.lev === 0 ? 34 : 30, rev: 0.6, pan: (j - 1) * 0.35, gain: 0.35, seed: 5 + j }));
      }

      // ---- spazzole
      if (sec.lev >= 1) {
        [0, 1, 1.5, 2, 3, 3.5].forEach((b, j) => bdrum(mix, 'brushtap', pos(t, b), sec.lev === 2 ? 36 : 28 + (j % 2) * 4, 3 + k * 7 + j));
        [1, 3].forEach((b) => bdrum(mix, 'swish', pos(t, b), sec.lev === 2 ? 40 : 32, 5 + k));
        if (sec.kick) [0, 2].forEach((b) => bdrum(mix, 'softkick', pos(t, b), 34));
      }

      // ---- melodia: passi per grado sulla scala dell'accordo, ritmo scelto da quattro figure
      if (sec.mel && R() < sec.dens) {
        const rhythms = [[0.5, 1.5, 2.5], [1, 2.5, 3.5], [0, 1, 2.5, 3], [0.5, 2, 3.5], [1.5, 2, 3]];
        const rh = rhythms[Math.floor(R() * rhythms.length)];
        const pool = [];
        for (let o = 60; o <= 90; o += 12) Qd.sc.forEach((iv) => pool.push(fold(root + iv, o)));
        pool.sort((a, b) => a - b);
        rh.forEach((b, j) => {
          const near = pool.reduce((bi, m, idx) => (Math.abs(m - mNote) < Math.abs(pool[bi] - mNote) ? idx : bi), 0);
          const step = [-2, -1, -1, 0, 1, 1, 2][Math.floor(R() * 7)];
          let m = pool[Math.max(0, Math.min(pool.length - 1, near + step))];
          if (b % 1 === 0) { // tempi forti: porta su una nota dell'accordo
            const ct = pool.filter((x) => Qd.ct.includes(((x - root) % 12 + 12) % 12));
            m = ct.reduce((a, c) => (Math.abs(c - m) < Math.abs(a - m) ? c : a), ct[0]);
          }
          m = Math.max(66, Math.min(86, m));
          mNote = m;
          if (left < b * beat + 0.3) return;
          const tt = pos(t, b);
          const dur = beat * (j === rh.length - 1 ? 2 : 1.2);
          const vel = sec.mv * (0.9 + R() * 0.2);
          if (sec.mel === 'vibes' || sec.mel === 'both') bnote(mix, 'vibes', mtof(m), { t: tt, dur: dur + 0.6, vel: vel * 0.95, pan: 0.2, rev: 0.45, gain: 0.5 });
          if (sec.mel === 'epiano') bnote(mix, 'epiano', mtof(m), { t: tt, dur, vel, pan: 0.15, rev: 0.4, gain: 0.55 });
          if (sec.mel === 'both' && j === rh.length - 1) bnote(mix, 'epiano', mtof(m - 12), { t: tt, dur, vel: vel * 0.8, pan: -0.1, rev: 0.4, gain: 0.5 });
        });
      }
    }
  });

  // ---- finale: accordo di Mi bemolle maggiore 9 che si scioglie, vibrafono che sale e poi si ferma
  const F = T.finale;
  [51, 55, 58, 62, 67].forEach((m, j) => note(mix, 'epiano', mtof(m), { t: F + j * 0.05, dur: 3, vel: 46, pan: -0.25 + j * 0.12, rev: 0.45, gain: 0.5 }));
  note(mix, 'upright', mtof(39), { t: F, dur: 2.5, vel: 56, gain: 0.65, rev: 0.1 });
  [79, 82, 86, 91].forEach((m, j) => note(mix, 'vibes', mtof(m + 12), { t: F + 0.5 + j * 0.28, dur: 3, vel: 40 + j * 3, pan: 0.2, rev: 0.55, gain: 0.5 }));
  [51, 58, 62].forEach((m, j) => note(mix, 'pad', mtof(m), { t: F, dur: 2.2, vel: 38, rev: 0.6, pan: (j - 1) * 0.3, gain: 0.4, seed: 70 + j }));

  // ---- effetti sonori
  // copertina: scintillio di glockenspiel sull'attacco
  [88, 91, 95].forEach((m, j) => note(mix, 'vibes', mtof(m), { t: 0.15 + j * 0.12, dur: 2, vel: 34, pan: -0.2, rev: 0.6, gain: 0.45 }));
  // ingorgo: clacson a «Lui le suona il clacson» (frase 4) e un secondo più breve a «Primo incontro» (frase 5)
  clip(mix, 'clacson', { t: cue('ingorgo', 4), da: 0.25, durata: 1.2, gain: 0.45, fadeOut: 0.2, rev: 0.25 });
  clip(mix, 'clacson', { t: cue('ingorgo', 4) + 1.5, da: 0.25, durata: 0.45, gain: 0.3, fadeOut: 0.1, rev: 0.25, pan: 0.15 });
  // caffè: voci del locale, campanello del bancone (frase 2) e timbro «NO» quando il timbro batte (frase 3, Caffe.tsx)
  clip(mix, 'voci_caffe', { t: T.caffe, da: 2, durata: T.piano - T.caffe, gain: 0.08, fadeIn: 1, fadeOut: 1.5, largo: 4, rev: 0.15 });
  clip(mix, 'campanello_negozio', { t: cue('caffe', 2), da: 8.75, durata: 2.5, gain: 0.35, fadeOut: 1, pan: 0.3, rev: 0.3 });
  clip(mix, 'martelletto', { t: cue('caffe', 3) - 0.01, da: 2.24, durata: 0.5, gain: 0.35, fadeOut: 0.2, rev: 0.25 });
  // collina: quattro colpetti di tacco sulle assi a «E intanto ballano il tip tap»
  [[0, 5.1], [0.14, 11.27], [0.28, 22.36], [0.5, 16.63]].forEach(([d, da], j) =>
    clip(mix, 'tacchi', { t: cue('collina', 4) + d - 0.01, da, durata: 0.2, gain: 0.3 + (j === 3 ? 0.1 : 0), pan: -0.15 + j * 0.1, rev: 0.25 }));
  // jazz: voci del club e accordo di campane all'ingresso
  clip(mix, 'voci_sala', { t: T.jazz, da: 3, durata: T.osservatorio - T.jazz, gain: 0.07, fadeIn: 1, fadeOut: 1.5, largo: 5, rev: 0.2 });
  [77, 84, 89].forEach((m, j) => note(mix, 'vibes', mtof(m + 12), { t: T.jazz + 0.1 + j * 0.08, dur: 1.6, vel: 38, pan: 0.2, rev: 0.5, gain: 0.45 }));
  // osservatorio: scintillio nel planetario («Nel planetario, tra le stelle») e stella cadente al bacio
  [91, 95, 98, 100, 103, 98, 107].forEach((m, j) => note(mix, 'vibes', mtof(m), { t: cue('osservatorio', 2) + j * 0.11, dur: 2.4, vel: 36 + (j % 3) * 3, pan: -0.4 + j * 0.13, rev: 0.7, gain: 0.45 }));
  [108, 105, 102, 98, 93, 88].forEach((m, j) => note(mix, 'vibes', mtof(m), { t: cue('osservatorio', 4) + j * 0.09, dur: 2.2, vel: 34 - j, pan: 0.5 - j * 0.15, rev: 0.7, gain: 0.45 }));
  // prima: lo scatto del faro che si accende sullo sgabello vuoto (frase 1, Prima.tsx)
  clip(mix, 'scatti', { t: cue('prima', 1) - 0.02, da: 0.5, durata: 0.7, gain: 0.25, rate: 0.7, fadeOut: 0.2, rev: 0.5 });
  // epilogo: l'insegna SEB'S si accende alla frase 2 (Epilogo.tsx): scatto, sfarfallio, ronzio
  neonHum(mix, cue('epilogo', 2), 4.5, { vel: 34 });
};
