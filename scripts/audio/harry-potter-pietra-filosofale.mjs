// Colonna sonora originale di Harry Potter e la pietra filosofale, discreta sotto la voce.
// Orchestra campionata (VSCO-2 CE, CC0: scripts/audio/campioni.mjs): archi, arpa, pianoforte, glockenspiel e percussioni.
// Tema inventato qui, in Fa maggiore e in 4/4 a 96 bpm (scene calme e cupe a metà passo), luminoso e curioso, volutamente lontano dal tema dei film (niente valzer di
// celesta in minore): melodia al pianoforte raddoppiata dal glockenspiel, arpa arpeggiata, archi tenuti.
// Cupo nello sgabuzzino e nei sotterranei, festoso nella grande sala e nel Quidditch; finale ampio.
// Effetti registrati (archivio CC0 di Craig Smith: scripts/audio/effetti.mjs); fischio del treno, gufo, ringhio, frullo
// d'ali e vapore restano sintetici. Effetti agganciati alle frasi dei sottotitoli (tempi come in ChapterOverlay).
import { put, rng, whoosh, pop } from './synth.mjs';
import { suona, colpo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['violini', 'viole', 'celli', 'contrabbasso', 'violini_trem', 'celli_trem', 'contrabbasso_pizz', 'arpa', 'pianoforte', 'glockenspiel', 'grancassa', 'piatto_sospeso', 'gong'];
export const effetti = ['tuono_classico', 'tuono_secco', 'pioggia_vento', 'fuoco', 'fiammata', 'colpi_legno', 'telo', 'stoffa', 'cancello', 'vento_leggero', 'tintinnio', 'ceramica'];
/** Sala grande e calda (la grande sala del castello): coda media, alte morbide. */
export const sala = { rt60: 2.3, brillo: 6500, predelay: 0.025, wet: 0.5 };

const TAU = Math.PI * 2;
/** Un solo tempo per tutto il film (CLAUDE.md, «Musica»): le scene calme vanno a metà passo (48). */
const BPM = 96;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const SR = 44100;
const vamp = (v) => (v / 127) ** 1.6;

// ---------------------------------------------------------------- effetti sintetici (non esistono nelle registrazioni)

/** Fischio del treno a vapore: due note che salgono un po', con soffio. */
const whistle = (mix, t, dur = 1.6, vel = 46) => {
  const r = rng(Math.round(t * 1000));
  put(mix, t, Math.ceil((dur + 0.3) * SR), (i) => {
    const x = i / SR;
    const bend = 1 + 0.02 * Math.min(1, x / 0.3);
    const env = Math.min(1, x / 0.08) * (x < dur ? 1 : Math.max(0, 1 - (x - dur) / 0.3));
    return (Math.sin(TAU * 740 * bend * x) + Math.sin(TAU * 932 * bend * x) * 0.8 + (r() * 2 - 1) * 0.2) * env * 0.4;
  }, { gain: vamp(vel), pan: -0.4, rev: 0.5 });
};

/** Verso del gufo: due «uu» morbidi che scendono. */
const hoot = (mix, t, vel = 40, pan = 0) => {
  [0, 0.45].forEach((d, k) => put(mix, t + d, Math.ceil(0.4 * SR), (i) => {
    const x = i / SR;
    const f = (k ? 360 : 400) * (1 - (0.06 * x) / 0.4);
    return Math.sin(TAU * f * x) * Math.sin((Math.PI * x) / 0.4) ** 1.5;
  }, { gain: vamp(vel) * 0.6, pan, rev: 0.5 }));
};

/** Ringhio: rumore grave modulato. */
const growl = (mix, t, dur = 1.6, vel = 50) => {
  const r = rng(Math.round(t * 1000));
  let lp = 0;
  put(mix, t, Math.ceil(dur * SR), (i) => {
    const x = i / SR;
    lp += 0.03 * ((r() * 2 - 1) - lp);
    return lp * 6 * (0.6 + 0.4 * Math.sin(TAU * 28 * x)) * Math.sin((Math.PI * x) / dur);
  }, { gain: vamp(vel), pan: 0.1, rev: 0.3 });
};

// ---------------------------------------------------------------- materiale musicale

// Tema (16 tempi, Fa maggiore): [tempo, nota MIDI, durata in tempi]
const THEME = [[0, 72, 1], [1, 77, 1], [2, 79, 1], [3, 81, 1], [4, 82, 2], [6, 81, 1], [7, 79, 1],
  [8, 77, 1.5], [9.5, 79, 0.5], [10, 81, 1], [11, 77, 1], [12, 79, 3]];
const CH = [[53, 57, 60], [58, 62, 65], [50, 53, 57], [48, 52, 55]]; // Fa, Si♭, Re minore, Do
const CH_DARK = [[50, 53, 57], [46, 50, 53], [50, 53, 57], [45, 49, 52]]; // Re minore, Si♭, Re minore, La

/** Piccolo scarto umano (±12 ms), deterministico. */
const umano = (t, k) => {
  const x = Math.sin(t * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x) - 0.5;
};

/** Arpa: arpeggio sull'accordo, che sale (o scende) per un'ottava e mezza. */
const harp = (mix, chord, t, { step = 0.12, vel = 56, up = true, gain = 0.5 } = {}) => {
  const notes = [...chord, ...chord.map((m) => m + 12), chord[0] + 24];
  (up ? notes : notes.reverse()).forEach((m, j) => {
    const u = umano(t, j);
    suona(mix, 'arpa', m, { t: t + j * step + u * 0.02, dur: 1.6, vel: vel + u * 10, pan: -0.4 + j * 0.12, rev: 0.45, gain, release: 1.4 });
  });
};

/** Campanello: glockenspiel acuto. */
const glock = (mix, m, t, vel = 60, pan = 0.3, gain = 0.22) => suona(mix, 'glockenspiel', m, { t, dur: 2, vel, pan, rev: 0.6, gain, release: 1.5 });

export default (mix, T) => {
  const { segments } = timeline(loadFilm('harry-potter-pietra-filosofale'));
  const S = Object.fromEntries(segments.map((s) => [s.id, s]));
  /** Secondo d'inizio della frase n-esima del capitolo (come subtitleTimes in ChapterOverlay). */
  const cue = (id, n) => {
    const s = S[id];
    const w = s.testo.map((l) => l.length + 6);
    const tot = w.reduce((a, b) => a + b, 0);
    let acc = 0.15;
    for (let k = 0; k < n; k++) acc += (w[k] / tot) * (s.dur - 0.35);
    return s.start + acc;
  };
  /** Battuta della griglia più vicina all'istante t: i cambi di sezione cadono sempre sul battere. */
  // griglia sfasata di 1,5 s: con battute da 2,5 s è lo sfasamento che avvicina di più gli inizi dei capitoli al battere
  const B = (t) => 1.5 + Math.round((t - 1.5) / BAR) * BAR;

  /**
   * Il tema da `from` a `to`. dark: in minore e un'ottava sotto. keep: probabilità di ogni nota della melodia.
   * harpVel 0 = niente arpa. pizz: pizzicati del contrabbasso a ogni tempo. big: contrabbasso e violini in più.
   */
  const theme = (from, to, { half = false, vel = 60, str = 44, dark = false, keep = 1, seed = 1, harpVel = 54, pizz = false, big = false, glk = true } = {}) => {
    const beat = BEAT * (half ? 2 : 1), loop = 16 * beat;
    const R = rng(11000 + seed);
    const chords = dark ? CH_DARK : CH;
    const archi = { attack: 0.35, release: 1.1, rev: 0.5 };
    for (let L = from; L < to - 0.3; L += loop) {
      for (let b = 0; b < 4; b++) {
        const t = L + b * 4 * beat;
        if (t >= to - 0.4) break;
        const d = Math.min(4 * beat, to - t);
        const [a, c, e] = chords[b];
        suona(mix, 'celli', a, { t, dur: d, vel: str, pan: -0.35, gain: 0.5, ...archi, seed: seed + b });
        suona(mix, 'viole', c, { t, dur: d, vel: str - 4, pan: 0.1, gain: 0.4, ...archi, seed: seed + b + 1 });
        suona(mix, 'viole', e, { t, dur: d, vel: str - 4, pan: 0.3, gain: 0.36, ...archi, seed: seed + b + 2 });
        if (big) {
          suona(mix, 'contrabbasso', a - 12, { t, dur: d, vel: str, pan: -0.1, gain: 0.45, ...archi });
          suona(mix, 'violini', e + 12, { t, dur: d, vel: str, pan: -0.2, gain: 0.3, attack: 0.5, release: 1.3, rev: 0.6 });
        }
        if (harpVel) harp(mix, chords[b], t, { step: beat / 3, vel: harpVel });
        if (pizz) for (let k = 0; k < 4; k++) suona(mix, 'contrabbasso_pizz', a - 12, { t: t + k * beat, dur: beat, vel: k ? 64 : 84, pan: -0.05, rev: 0.25, gain: 0.6, release: 0.3 });
      }
      for (const [b, m, d] of THEME) {
        const t = L + b * beat;
        if (t >= to - 0.2 || R() > keep) continue;
        const mm = dark ? (m % 12 === 4 ? m - 1 : m) - 12 : m;
        const u = umano(t, b);
        const dd = Math.min(d * beat * 1.1, to - t);
        suona(mix, 'pianoforte', mm, { t: t + u * 0.02, dur: dd, vel: vel + u * 10, pan: 0.1, rev: 0.4, gain: 0.55, release: 1 });
        if (glk && !dark) glock(mix, mm + 12, t + 0.005, vel * 0.7, 0.35, 0.12);
      }
    }
  };

  // ---- copertina: arpa che sale, campanelli, un gufo che passa
  harp(mix, CH[0], 0.2, { step: 0.1, vel: 60 });
  [84, 89, 93, 96].forEach((m, j) => glock(mix, m, 1.2 + j * 0.25, 60, -0.3 + j * 0.2));
  clip(mix, 'stoffa', { t: 1.6, da: 15, durata: 1.2, gain: 0.25, fadeIn: 0.2, fadeOut: 0.5, pan: -0.3, rev: 0.3 });
  hoot(mix, 2.6, 34, -0.3);

  // ---- sottoscala: tema cupo e lento al pianoforte; passi sulle scale sopra lo sgabuzzino
  theme(B(T.sottoscala), B(T.lettere), { half: true, vel: 70, str: 54, dark: true, keep: 0.8, harpVel: 0, seed: 1 });
  [0, 0.28, 0.56, 0.84, 1.12].forEach((d, k) => clip(mix, 'colpi_legno', { t: cue('sottoscala', 1) + d, da: 1.4, durata: 0.3, gain: 0.18 + (k % 2) * 0.04, lp: 1800, rev: 0.25, pan: -0.2 + k * 0.1 }));

  // ---- lettere: vivace con i pizzicati; frullo di lettere dal camino, i gufi
  theme(B(T.lettere), B(T.mago), { vel: 58, str: 40, keep: 0.9, harpVel: 48, pizz: true, seed: 2 });
  for (let k = 0; k < 6; k++) clip(mix, 'stoffa', { t: cue('lettere', 2) + k * 0.45, da: 15 + k * 0.5, durata: 0.5, gain: 0.2, fadeIn: 0.05, fadeOut: 0.2, pan: -0.5 + (k % 5) * 0.25, rev: 0.25 });
  clip(mix, 'colpi_legno', { t: cue('lettere', 1) + 0.2, da: 5.74, durata: 0.3, gain: 0.15, rev: 0.25 });
  hoot(mix, T.lettere + 1.2, 34, 0.4);
  hoot(mix, T.lettere + 2.6, 30, -0.5);

  // ---- mago: tempesta sullo scoglio, la porta che cade, il fuoco che divampa sulla rivelazione
  clip(mix, 'pioggia_vento', { t: T.mago - 0.3, da: 5, durata: 9.6, gain: 0.09, fadeIn: 0.8, fadeOut: 0.8, largo: 2.5, rev: 0.1 });
  clip(mix, 'tuono_classico', { t: T.mago + 0.85, da: 0.98, durata: 5, gain: 0.42, fadeIn: 0.03, fadeOut: 1.2, rev: 0.35 }); // lampo di Mago.tsx a 0,7 s
  clip(mix, 'colpi_legno', { t: T.mago + 1.2, da: 5.74, durata: 0.4, gain: 0.5, rev: 0.35 }); // la porta cade
  clip(mix, 'fuoco', { t: T.mago + 1.2, da: 1, durata: T.binario - T.mago - 1.2, gain: 0.08, fadeIn: 0.5, fadeOut: 0.6, largo: 3, rev: 0.15 });
  clip(mix, 'fiammata', { t: cue('mago', 1) + 0.1, da: 0.2, durata: 1.3, gain: 0.35, fadeOut: 0.5, rev: 0.3 });
  theme(B(cue('mago', 1)), B(T.binario), { half: true, vel: 54, str: 46, keep: 0.7, harpVel: 44, seed: 3 });
  clip(mix, 'tuono_secco', { t: cue('mago', 2) + 0.55, da: 0.78, durata: 2.5, gain: 0.2, fadeIn: 0.03, fadeOut: 1, rev: 0.35, lp: 3000 });
  [50, 53, 57].forEach((m, j) => suona(mix, 'celli_trem', m, { t: T.mago + 1, dur: cue('mago', 1) - T.mago - 1, vel: 50, pan: (j - 1) * 0.4, gain: 0.3, attack: 0.4, release: 0.6, rev: 0.5 }));
  harp(mix, CH[0], cue('mago', 1), { step: 0.08, vel: 64 });
  [84, 88, 91, 96].forEach((m, j) => glock(mix, m, cue('mago', 1) + 0.3 + j * 0.15, 64));

  // ---- binario: il muro come acqua, il fischio e il vapore del treno
  theme(B(T.binario), B(T.castello), { vel: 58, str: 40, keep: 0.9, harpVel: 48, seed: 4 });
  clip(mix, 'telo', { t: cue('binario', 1) + 0.8, da: 8.45, durata: 0.75, gain: 0.3, fadeOut: 0.3, rev: 0.4 });
  colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_roll2_cresc', { t: cue('binario', 1) + 0.4, vel: 60, rev: 0.4, gain: 0.25, dur: 1.4, release: 0.4 });
  whistle(mix, cue('binario', 2) + 0.2, 1.4, 44);
  for (let t = cue('binario', 2) + 0.4; t < T.castello - 0.2; t += BEAT) whoosh(mix, t, 0.3, { vel: 24, lo: 600, hi: 3000, seed: Math.round(t * 10) });

  // ---- castello: meraviglia notturna sul lago, campanelli come stelle, brezza
  theme(B(T.castello), B(T.cappello), { half: true, vel: 58, str: 46, keep: 1, harpVel: 50, big: true, seed: 5 });
  clip(mix, 'vento_leggero', { t: T.castello, da: 0.2, durata: 10, gain: 0.05, fadeIn: 1.5, fadeOut: 1.5, largo: 4 });
  for (let t = T.castello + 0.5, k = 0; t < T.cappello - 0.5; t += BEAT, k++) glock(mix, [89, 93, 96, 101][k % 4], t, 40, -0.5 + (k % 5) * 0.25, 0.12);

  // ---- cappello: festa nella grande sala; il cappello sceglie e scattano campanelli e piatto su Grifondoro
  theme(B(T.cappello), B(T.quidditch), { vel: 62, str: 46, keep: 1, harpVel: 50, pizz: true, big: true, seed: 6 });
  colpo(mix, 'piatto_sospeso', 'susp_hit_softmall_roll2_cresc', { t: cue('cappello', 3) - 1.1, vel: 70, rev: 0.4, gain: 0.3, dur: 1.2, release: 0.3 });
  colpo(mix, 'grancassa', 'bdrum_mp', { t: cue('cappello', 3) + 0.1, vel: 90, rev: 0.4, gain: 0.6 });
  [84, 88, 91, 96, 100].forEach((m, j) => glock(mix, m, cue('cappello', 3) + 0.1 + j * 0.1, 70, -0.4 + j * 0.2, 0.25));
  clip(mix, 'tintinnio', { t: cue('cappello', 2) + 0.5, da: 0.16, durata: 0.3, gain: 0.18, rev: 0.3, pan: 0.3 });

  // ---- quidditch: allegro con la grancassa, sibili della scopa, frullo della pallina d'oro
  theme(B(T.quidditch), B(T.cane), { vel: 70, str: 50, keep: 1, harpVel: 40, pizz: true, big: true, seed: 7 });
  for (let t = B(T.quidditch), k = 0; t < T.cane - 0.3; t += BEAT, k++) colpo(mix, 'grancassa', 'bdrum_p', { t, vel: k % 2 ? 70 : 90, rev: 0.35, gain: 0.6, seed: k });
  for (let t = cue('quidditch', 1) + Math.PI / 1.4 - 0.1; t < T.cane - 0.5; t += Math.PI / 1.4) clip(mix, 'telo', { t, da: 8.45, durata: 0.75, gain: 0.25, fadeOut: 0.3, rev: 0.3, pan: Math.sin(t) * 0.6, rate: 1.2 });
  for (let t = cue('quidditch', 3); t < T.cane - 0.2; t += 0.05) pop(mix, t, 12, { pitch: 14, pan: Math.sin(t * 3) * 0.5 });

  // ---- cane: tensione degli archi, il ringhio quando si sveglia, l'arpa che lo riaddormenta
  [50, 51].forEach((m, j) => suona(mix, 'celli_trem', m, { t: T.cane, dur: cue('cane', 3) - T.cane, vel: 56, pan: (j - 0.5) * 0.6, gain: 0.35, attack: 0.6, release: 0.8, rev: 0.5 }));
  suona(mix, 'contrabbasso', 38, { t: T.cane, dur: cue('cane', 3) - T.cane, vel: 50, gain: 0.45, attack: 0.6, release: 1, rev: 0.4 });
  growl(mix, cue('cane', 1) + 0.3, 2.2, 66);
  growl(mix, cue('cane', 2) + 0.4, 1.4, 50);
  for (let k = 0; k < 4; k++) harp(mix, CH[k % 4], cue('cane', 3) - 1 + k * BEAT, { step: 0.07, vel: 58 });

  // ---- specchio: neve fuori, il tema dolce che si accende, campanelli, poi si calma
  theme(B(T.specchio), B(T.botola), { half: true, vel: 56, str: 44, keep: 0.9, harpVel: 44, seed: 8 });
  clip(mix, 'vento_leggero', { t: T.specchio, da: 3, durata: 11, gain: 0.04, lp: 1200, fadeIn: 1.5, fadeOut: 1.5, largo: 4 });
  for (let t = cue('specchio', 1) - 0.4, k = 0; t < cue('specchio', 4); t += BEAT / 2, k++) glock(mix, [96, 100, 103, 108][k % 4], t, 34, -0.5 + (k % 5) * 0.25, 0.1);
  clip(mix, 'stoffa', { t: cue('specchio', 4) + 0.6, da: 20, durata: 2, gain: 0.2, fadeIn: 0.3, fadeOut: 0.8, rev: 0.3 }); // il drappo copre lo specchio

  // ---- botola: cupo; chiavi con le ali, mosse degli scacchi, il cavallo che crolla
  theme(B(T.botola), B(T.pietra), { half: true, vel: 66, str: 52, dark: true, keep: 0.8, harpVel: 0, pizz: true, seed: 9 });
  clip(mix, 'stoffa', { t: cue('botola', 3) + 0.6, da: 16, durata: cue('botola', 4) - cue('botola', 3), gain: 0.2, fadeIn: 0.3, fadeOut: 0.4, largo: 1, rev: 0.3 });
  for (let t = cue('botola', 3) + 0.6; t < cue('botola', 4); t += 0.06) pop(mix, t, 8, { pitch: 10 + Math.sin(t * 9) * 4, pan: Math.sin(t * 5) * 0.6 });
  [0, 1, 2].forEach((k) => clip(mix, 'colpi_legno', { t: cue('botola', 4) + k * 0.4, da: 1.4, durata: 0.35, gain: 0.25, lp: 1400, rev: 0.4 }));
  clip(mix, 'ceramica', { t: cue('botola', 4) + 2.05, da: 3.95, durata: 1.4, gain: 0.2, fadeOut: 0.4, rev: 0.35 }); // il cavallo va in frantumi
  clip(mix, 'colpi_legno', { t: cue('botola', 4) + 2.0, da: 5.74, durata: 0.45, gain: 0.55, rev: 0.45 });
  colpo(mix, 'grancassa', 'bdrum_f', { t: cue('botola', 4) + 2.0, vel: 100, rev: 0.5, gain: 0.7 });
  colpo(mix, 'gong', 'gong_hit_p', { t: cue('botola', 4) + 2.05, vel: 70, rev: 0.5, gain: 0.35, dur: 2.5, release: 0.8 });

  // ---- pietra: fuoco magico, il buio, la luce che lo protegge, la pietra che si sbriciola
  clip(mix, 'fiammata', { t: T.pietra + 0.1, da: 0.2, durata: 1.4, gain: 0.4, fadeOut: 0.6, rev: 0.3 });
  clip(mix, 'fuoco', { t: T.pietra, da: 12, durata: T.finale - T.pietra, gain: 0.07, fadeIn: 0.5, fadeOut: 0.8, largo: 3, rev: 0.2 });
  [50, 51, 57].forEach((m, j) => suona(mix, 'celli_trem', m, { t: T.pietra, dur: cue('pietra', 3) - T.pietra, vel: 56, pan: (j - 1) * 0.4, gain: 0.32, attack: 0.5, release: 0.8, rev: 0.5 }));
  suona(mix, 'contrabbasso', 38, { t: T.pietra, dur: cue('pietra', 3) - T.pietra, vel: 54, gain: 0.45, attack: 0.5, release: 1, rev: 0.4 });
  [84, 89, 93].forEach((m, j) => glock(mix, m, cue('pietra', 1) + 0.6 + j * 0.15, 60));
  colpo(mix, 'gong', 'gong_hit_p', { t: cue('pietra', 3), vel: 80, rev: 0.5, gain: 0.4, dur: 3, release: 0.8 });
  theme(B(cue('pietra', 3)), T.finale, { half: true, vel: 62, str: 50, keep: 1, harpVel: 56, big: true, seed: 10 });
  [96, 100, 103, 108, 112].forEach((m, j) => glock(mix, m, cue('pietra', 4) + j * 0.12, 56, -0.4 + j * 0.2, 0.18));

  // ---- finale: accordo di Fa maggiore degli archi, arpa, campanelli, un gufo
  const F = T.finale;
  harp(mix, CH[0], F, { step: 0.08, vel: 64 });
  [['contrabbasso', 41], ['celli', 53], ['viole', 57], ['viole', 60], ['violini', 65], ['violini', 69]].forEach(([id, n], k) =>
    suona(mix, id, n, { t: F, dur: 2.6, vel: 60, pan: (k - 2.5) * 0.2, gain: 0.45, attack: 0.3, release: 1.4, rev: 0.6, seed: 20 + k }));
  suona(mix, 'pianoforte', 77, { t: F + 0.3, dur: 2.6, vel: 60, pan: 0.1, rev: 0.5, gain: 0.5, release: 1.4 });
  [89, 93, 96, 101].forEach((m, j) => glock(mix, m, F + 0.8 + j * 0.2, 56, -0.3 + j * 0.2, 0.2));
  hoot(mix, F + 1.6, 30, 0.4);
};
