// Colonna sonora originale di Breaking Bad (stagione 2), discreta sotto la voce.
// Stessa voce della stagione 1 (orchestra campionata VSCO-2 CE e VCSL, CC0: pizzicati di celli e contrabbasso come una
// chitarra del deserto, marimba, tromba con la sordina, archi tesi, tom, cassa, charleston, timpani), stesso motivo in
// Mi minore frigio a 96 bpm (10 s = 4 battute), con due colori nuovi: un carillon di glockenspiel per l'orsacchiotto rosa
// (copertina e ultimo capitolo, sempre in bianco e nero all'inizio) e un violino solo per Jane e per la sua notte.
// Il colore che torna nell'ultimo capitolo si sente: gli archi si aprono in Sol maggiore proprio quando torna il colore.
// Niente sigla né brani della serie. Effetti registrati (archivio CC0 di Craig Smith: scripts/audio/effetti.mjs) agganciati
// agli eventi delle scene in src/scenes/breaking-bad-stagione-2/ (cue = inizio della frase, G = griglia delle scene).
import { suona, colpo, crescendo, taci, compensa } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['celli', 'viole', 'violini', 'contrabbasso', 'celli_pizz', 'contrabbasso_pizz', 'violini_pizz', 'violini_trem', 'celli_trem',
  'marimba', 'tromba_sordina', 'glockenspiel', 'pianoforte_coda', 'arpa', 'violino_solo', 'timpani', 'gong', 'piatto_sospeso', 'tom', 'cassa', 'charleston', 'rullante'];
export const effetti = ['vento_leggero', 'auto_epoca', 'sirene', 'scatti', 'campanello', 'ceramica', 'colpi_legno', 'pistola', 'tintinnio', 'ali',
  'ronzio_neon', 'stoffa', 'porta_sbatte', 'metallo_schianto', 'serratura', 'pagine', 'sacchi', 'porta_cigolio', 'vetri',
  'aereo', 'esplosioni', 'fuoco', 'spruzzo'];
/** Stanze piccole e deserto aperto: coda media. */
export const sala = { rt60: 1.8, brillo: 5200, predelay: 0.02, wet: 0.42 };

const BPM = 96;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;

// Mi minore frigio come nella stagione 1; CHD con il Re per i momenti di famiglia; CHG il Sol maggiore del colore che torna
const CH = [[40, 47, 52, 55], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 55]];
const CHD = [[40, 47, 52, 55], [38, 45, 50, 54], [36, 43, 48, 52], [35, 42, 47, 54]];
const CHG = [[43, 50, 55, 59], [36, 43, 52, 55], [38, 45, 50, 54], [43, 50, 55, 59]];
const MOTIF = [[0, 64, 0.5], [0.5, 67, 0.5], [1, 71, 1], [2, 72, 0.5], [2.5, 71, 0.5], [3, 67, 1], [4, 65, 1.5], [5.5, 64, 2.5]];
// Carillon dell'orsacchiotto: [battito, nota, durata]; una ninna nanna storta che scende sul Fa
const CARILLON = [[0, 88, 1], [1, 84, 0.5], [1.5, 83, 0.5], [2, 79, 1], [3, 77, 1], [4, 76, 2]];
// Violino solo di Jane: [battito, nota, durata]
const JANE = [[0, 71, 2], [2, 72, 1], [3, 74, 1], [4, 72, 3], [7, 71, 1]];

export default (mix, T) => {
  const { segments } = timeline(loadFilm('breaking-bad-stagione-2'));
  const S = Object.fromEntries(segments.map((s) => [s.id, s]));
  const T0 = T.rapimento;
  const cue = (id, n) => {
    const s = S[id];
    const w = s.testo.map((l) => l.length + 6);
    const tot = w.reduce((a, b) => a + b, 0);
    let acc = 0.15;
    for (let k = 0; k < n; k++) acc += (w[k] / tot) * (s.dur - 0.35);
    return s.start + acc;
  };
  const G = (t, div = 2) => T0 + Math.round((t - T0) / (BEAT / div)) * (BEAT / div);
  const E = (id, n, d = 0) => G(cue(id, n) + d);
  const B = (t) => T0 + Math.round((t - T0) / BAR) * BAR;

  compensa(mix);
  // istanti dei colpi forti, per i silenzi (taci va chiamata prima delle note)
  const shot1 = E('hank', 2, 0.9), shot2 = shot1 + BEAT;
  const atm = E('bancomat', 2, 1.5);
  const boom = E('aerei', 2, -0.6);
  // un attimo di vuoto prima dei colpi forti e un battito di silenzio dopo
  taci(mix, shot1 - 2 * BEAT, shot2 - 0.03);
  taci(mix, atm - 2 * BEAT, atm - 0.03);
  taci(mix, boom - 2 * BEAT, boom - 0.03);
  taci(mix, shot2 + 0.05, shot2 + BEAT);
  taci(mix, atm + 0.05, atm + BEAT);
  taci(mix, boom + 0.05, boom + 2 * BEAT);

  // ---- strumenti (come nella stagione 1)
  const strings = (from, to, { half = false, vel = 46, gain = 0.4, high = false, k0 = 0, chords = CH } = {}) => {
    const step = BAR * (half ? 2 : 1), a = { attack: 0.5, release: 1.2, rev: 0.5 };
    gain *= 1.45;
    for (let t = from, k = k0; t < to - 0.4; t += step, k++) {
      const d = Math.min(step, to - t), [r, f, o, x] = chords[k % 4];
      suona(mix, 'contrabbasso', r, { t, dur: d, vel: vel - 4, pan: -0.1, gain: gain * 0.8, ...a, seed: k });
      suona(mix, 'celli', f, { t, dur: d, vel, pan: -0.3, gain, ...a, seed: k + 1 });
      suona(mix, 'viole', o, { t, dur: d, vel: vel - 4, pan: 0.2, gain: gain * 0.75, ...a, seed: k + 2 });
      if (high) suona(mix, 'violini', x + 12, { t, dur: d, vel: vel - 6, pan: 0.3, gain: gain * 0.5, attack: 0.7, release: 1.4, rev: 0.6 });
    }
  };
  const pizz = (from, to, { half = false, vel = 58, gain = 0.4, k0 = 0, chords = CH } = {}) => {
    gain *= 1.25;
    const step = BEAT * (half ? 2 : 1);
    for (let t = from, k = 0; t < to - 0.1; t += step, k++) {
      const [r, f, o] = chords[(Math.floor((t - from) / BAR) + k0) % 4];
      const n = [r, f, o, f][k % 4];
      suona(mix, k % 4 === 0 ? 'contrabbasso_pizz' : 'celli_pizz', n + (k % 4 === 0 ? 0 : 12), { t, dur: step, vel: vel - (k % 2) * 6, pan: -0.2 + (k % 4) * 0.12, rev: 0.35, gain, release: 0.4, seed: k });
    }
  };
  const motif = (from, to, { half = false, vel = 60, gain = 0.34, oct = 0 } = {}) => {
    gain *= 1.3;
    const beat = BEAT * (half ? 2 : 1), loop = 8 * beat;
    for (let L = from; L < to - 0.2; L += loop) {
      for (const [b, m, d] of MOTIF) {
        const t = L + b * beat;
        if (t >= to - 0.2) break;
        suona(mix, 'marimba', m + oct, { t, dur: Math.min(d * beat, 1.2), vel, pan: 0.2, rev: 0.4, gain, release: 0.6 });
      }
    }
  };
  const carillon = (from, to, { gain = 0.2, oct = 0 } = {}) => {
    for (let L = from; L < to - 0.2; L += 6 * BEAT) {
      for (const [b, m, d] of CARILLON) {
        const t = L + b * BEAT;
        if (t >= to - 0.2) break;
        suona(mix, 'glockenspiel', m + oct, { t, dur: d * BEAT, vel: 46, pan: 0.15, rev: 0.6, gain, release: 1.2 });
      }
    }
  };
  const violino = (t0, frase, { gain = 0.22, vel = 50, oct = 0 } = {}) => frase.forEach(([b, m, d]) =>
    suona(mix, 'violino_solo', m + oct, { t: t0 + b * BEAT, dur: d * BEAT, vel, pan: 0.15, rev: 0.6, gain, attack: 0.25, release: 1.1 }));
  const tromba = (t0, frase, { gain = 0.26, vel = 54 } = {}) => frase.forEach(([b, m, d]) =>
    suona(mix, 'tromba_sordina', m, { t: t0 + b * BEAT, dur: d * BEAT, vel, pan: 0.3, rev: 0.6, gain, attack: 0.08, release: 0.9 }));
  const hat = (t, vel = 40) => colpo(mix, 'charleston', vel > 45 ? 'v3' : 'v2', { t, vel: 100, gain: 0.24 * (vel / 50), pan: 0.3, rev: 0.12, seed: Math.round(t * 100) });
  const kick = (t, vel = 60) => colpo(mix, 'cassa', vel > 55 ? 'v5' : 'v3', { t, vel: 100, gain: 0.7 * (vel / 60), rev: 0.12, seed: Math.round(t * 100) });
  const snare = (t, vel = 50) => colpo(mix, 'rullante', vel > 55 ? 'v5' : 'v4', { t, vel: 100, gain: 0.4 * (vel / 60), pan: 0.05, rev: 0.2, seed: Math.round(t * 100) });
  const tom = (t, vel = 60, pitch = 0) => colpo(mix, 'tom', 'TomH_HitS_v3', { t, vel: 100, gain: 0.5 * (vel / 60), pan: -0.15, rev: 0.3, pitch, seed: Math.round(t * 100) });
  const groove = (from, to, { vel = 46, snr = true } = {}) => {
    for (let t = from, k = 0; t < to - 0.05; t += BEAT / 2, k++) {
      hat(t, k % 2 ? vel - 12 : vel);
      if (k % 8 === 0 || k % 8 === 5) kick(t, vel + 8);
      if (snr && k % 8 === 6) snare(t, vel);
    }
  };
  // timpano: v4 (forte, ERRORI.md) per i colpi chiave, v2 per i colpi leggeri
  const timp = (t, m = 40, vel = 90, gain = 0.6) => colpo(mix, 'timpani', vel > 100 ? 'Timpani1_Hit_v4_rr1_Sum' : 'Timpani1_Hit_v2_rr1_Sum', { t, vel: 100, gain, rev: 0.45, pitch: m - 40 });
  const glock = (t, m, gain = 0.16) => suona(mix, 'glockenspiel', m, { t, dur: 1.4, vel: 50, pan: 0.25, rev: 0.6, gain, release: 1 });
  const trem = (t, dur, notes, { gain = 0.28 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 60 ? 'celli_trem' : 'violini_trem', m, { t, dur, vel: 66, pan: (j - (notes.length - 1) / 2) * 0.35, gain: gain * 0.75, attack: 0.5, release: 0.9, rev: 0.5, seed: j + 3 }));
  const wind = (t, durata, gain, da = 1) => clip(mix, 'vento_leggero', { t, da, durata, gain, fadeIn: 1, fadeOut: 1, largo: 4, rev: 0.1 });

  // ---- copertina: il giardino in bianco e nero, il carillon dell'orsacchiotto su un Mi grave
  wind(0, T0 + 0.6, 0.035);
  suona(mix, 'contrabbasso', 28, { t: 0.1, dur: 3.9, vel: 50, gain: 0.5, attack: 0.6, release: 1, rev: 0.5 });
  carillon(0.2, T0, { gain: 0.2 });
  tom(T0 - BEAT, 50, -2);

  // ---- rapimento: il deserto al tramonto, passo pieno; l'auto di Tuco, la polizia lontana, la casa che si accende
  const tIn = E('rapimento', 0, 0.2), tCops = E('rapimento', 1, 0.3), tStopR = E('rapimento', 2, 1.0);
  wind(T.rapimento, T.campanello - T.rapimento, 0.03, 3);
  clip(mix, 'auto_epoca', { t: tIn, da: 4, durata: tStopR - tIn + 0.5, gain: 0.14, fadeIn: 0.5, fadeOut: 0.6, lp: 2200, rev: 0.15, pan: 0.3 }); // Rapimento.tsx: l'auto arriva
  pizz(B(T.rapimento), B(T.campanello), { vel: 58, gain: 0.36 });
  for (let t = B(T.rapimento), k = 0; t < B(T.campanello) - 0.1; t += BEAT, k++) if (k % 4 === 0) kick(t, 44);
  motif(B(T.rapimento), B(cue('rapimento', 1)), { vel: 56, gain: 0.26 });
  clip(mix, 'sirene', { t: tCops, da: 2.4, durata: 3.4, gain: 0.05, fadeIn: 0.6, fadeOut: 1.2, rev: 0.4, lp: 3000, pan: 0.3 }); // le luci della polizia all'orizzonte
  strings(B(cue('rapimento', 1)), B(T.campanello), { vel: 44, gain: 0.28, k0: 1 });
  tromba(tStopR - BEAT, [[1, 71, 1.5], [2.5, 72, 1.5]], { gain: 0.22 }); // la finestra si accende

  // ---- campanello: il soggiorno della casupola, metà passo; il campanello, la polvere sul cibo, l'allarme, il piatto
  const ring1 = E('campanello', 0, 0.5), pour = E('campanello', 1, 0.8), alarm = E('campanello', 2, 0.4), plate = alarm + 2 * BEAT;
  strings(B(T.campanello), alarm, { half: true, vel: 44, gain: 0.3, k0: 2 });
  pizz(B(T.campanello), alarm - BEAT, { half: true, vel: 50, gain: 0.28, k0: 2 });
  clip(mix, 'campanello', { t: ring1, da: 0, durata: 1.2, gain: 0.3, fadeOut: 0.5, rev: 0.3 }); // Campanello.tsx: un colpo di campanello
  glock(ring1, 76, 0.12);
  for (let k = 0; k < 6; k++) suona(mix, 'violini_pizz', [88, 86, 84, 83, 81, 79][k], { t: pour + k * BEAT / 4, dur: 0.2, vel: 36, pan: 0.2, rev: 0.4, gain: 0.08, release: 0.2 }); // la polvere bianca
  for (let k = 0; k < 8; k++) clip(mix, 'campanello', { t: alarm + k * BEAT / 2, da: 0, durata: 0.35, gain: 0.26, fadeOut: 0.1, rev: 0.25, pan: 0.1 }); // l'allarme
  trem(alarm, T.hank - alarm, [52, 53, 64, 65], { gain: 0.3 });
  groove(alarm, T.hank - 0.1, { vel: 40, snr: false });
  clip(mix, 'ceramica', { t: plate + 0.4, da: 0.08, durata: 0.6, gain: 0.3, fadeOut: 0.2, rev: 0.2 }); // il piatto si rompe a terra
  tom(plate + 0.4, 62, -2);

  // ---- hank: mezzogiorno, il sasso, l'auto di Hank, i due spari, il silenzio, il falco
  const rock = E('hank', 0, 0.8), car = E('hank', 1, 0.2), stopH = E('hank', 1, 2.4);
  wind(T.hank, T.fuga - T.hank, 0.03, 6);
  pizz(B(T.hank), shot1 - BEAT, { vel: 58, gain: 0.36, k0: 1 });
  clip(mix, 'colpi_legno', { t: rock, da: 1.4, durata: 0.4, gain: 0.26, rev: 0.25 }); // Hank.tsx: il sasso cade a terra
  kick(rock, 64);
  clip(mix, 'auto_epoca', { t: car, da: 15, durata: stopH - car + 0.5, gain: 0.18, fadeIn: 0.5, fadeOut: 0.6, lp: 2000, rev: 0.15, pan: 0.4 }); // l'auto di Hank arriva
  groove(B(cue('hank', 1)), shot1 - BEAT, { vel: 42 });
  trem(B(cue('hank', 1)), shot1 - B(cue('hank', 1)), [40, 41, 64, 65], { gain: 0.3 });
  crescendo(mix, shot1 - BEAT, 1.6, { gain: 0.2 }); // il crescendo si ferma un battito prima: vuoto, poi lo sparo
  clip(mix, 'pistola', { t: shot1, da: 0, durata: 1.2, gain: 0.3, fadeOut: 0.4, rev: 0.3, pan: 0.2 }); // il primo sparo dalla portiera
  clip(mix, 'pistola', { t: shot2, da: 0, durata: 1.4, gain: 0.32, fadeOut: 0.5, rev: 0.35, pan: -0.25 }); // il secondo dal pick-up
  timp(shot2, 40, 110, 0.7);
  clip(mix, 'tintinnio', { t: shot1 + 0.55, da: 0.13, durata: 0.4, gain: 0.12, fadeOut: 0.15, rev: 0.2, pan: 0.2 }); // i bossoli
  clip(mix, 'tintinnio', { t: shot2 + 0.55, da: 0.13, durata: 0.4, gain: 0.1, fadeOut: 0.15, rev: 0.2, pan: 0.3 });
  clip(mix, 'ali', { t: shot2 + 0.4, da: 0.13, durata: 1.6, gain: 0.14, fadeOut: 0.5, rev: 0.3, pan: 0.4 }); // il falco si alza
  strings(shot2 + BEAT, B(T.fuga) + 0.01, { vel: 42, gain: 0.26, k0: 3 });

  // ---- fuga: il supermercato di notte, metà passo; i neon, la camicia, l'ambulanza e il braccialetto
  const lights = E('fuga', 0, 0.2), shirt = E('fuga', 1, 0.9), amb = E('fuga', 2, 0.1);
  clip(mix, 'ronzio_neon', { t: lights, da: 1, durata: T.bancomat - lights - 0.2, gain: 0.04, fadeIn: 0.1, fadeOut: 0.5, rev: 0.1 }); // Fuga.tsx: i neon si accendono
  for (let k = 0; k < 6; k++) suona(mix, 'violini_pizz', 76 + (k % 3) * 3, { t: lights + k * 0.125, dur: 0.15, vel: 34, pan: -0.3 + k * 0.12, rev: 0.3, gain: 0.07, release: 0.15 });
  strings(B(T.fuga), B(T.bancomat), { half: true, vel: 42, gain: 0.28, chords: CHD });
  motif(B(T.fuga), B(T.bancomat), { half: true, vel: 50, gain: 0.24 });
  clip(mix, 'stoffa', { t: shirt - 0.15, da: 0.2, durata: 0.6, gain: 0.4, fadeOut: 0.2, rev: 0.2 }); // la camicia cade sul mucchio
  clip(mix, 'sirene', { t: amb, da: 2.4, durata: T.bancomat - amb, gain: 0.12, fadeIn: 0.4, fadeOut: 0.8, rev: 0.3, lp: 3500 }); // l'ambulanza
  glock(amb + 0.6, 81, 0.14); glock(amb + 0.6 + BEAT, 86, 0.12); // il braccialetto

  // ---- bancomat: la casa dei tossici, passo doppio; i tre telefoni, la porta, il bancomat che crolla e un battito di silenzio
  const phones = E('bancomat', 0, 1.0), door = E('bancomat', 1, 1.2);
  pizz(B(T.bancomat), atm - BEAT / 2, { vel: 58, gain: 0.36, k0: 2 });
  groove(B(T.bancomat), atm - BEAT, { vel: 40 });
  [0, 1, 2].forEach((k) => glock(phones + k * BEAT, [79, 83, 86][k], 0.13)); // Bancomat.tsx: i tre telefoni
  clip(mix, 'porta_sbatte', { t: door - 0.05, da: 2.9, durata: 0.5, gain: 0.16, fadeOut: 0.2, rev: 0.25 }); // la porta si spalanca
  trem(door, atm - door, [52, 53, 76, 77], { gain: 0.28 });
  clip(mix, 'metallo_schianto', { t: atm, da: 0, durata: 1.45, gain: 0.26, fadeOut: 0.5, rev: 0.25 }); // il bancomat crolla
  clip(mix, 'sacchi', { t: atm + 0.03, da: 0.3, durata: 0.6, gain: 0.28, fadeOut: 0.2, rev: 0.2 });
  timp(atm, 36, 110, 0.7);
  strings(atm + BEAT, T.saul, { vel: 42, gain: 0.26, k0: 1 });

  // ---- saul: il centro commerciale di notte; la volante, il neon AVVOCATO, la ventiquattrore e la lavatrice
  const copsS = E('saul', 0, 0.4), neon = E('saul', 1, 0.6), open = E('saul', 2, 0.5);
  clip(mix, 'sirene', { t: copsS, da: 2.4, durata: 3.2, gain: 0.08, fadeIn: 0.3, fadeOut: 1.0, rev: 0.3, lp: 4000 }); // Saul.tsx: la volante
  pizz(B(T.saul), B(T.gus), { vel: 56, gain: 0.34, k0: 3 });
  groove(B(cue('saul', 1)), B(T.gus), { vel: 36, snr: false });
  clip(mix, 'ronzio_neon', { t: neon, da: 1, durata: T.gus - neon, gain: 0.04, fadeIn: 0.05, fadeOut: 0.5, rev: 0.1 }); // l'insegna si accende
  tromba(neon, [[0, 76, 1], [1, 79, 1], [2, 76, 2]], { gain: 0.22 }); // l'avvocato, un po' sbruffone
  clip(mix, 'serratura', { t: open - 0.1, da: 2.43, durata: 0.5, gain: 0.12, rev: 0.25 }); // la ventiquattrore si apre
  clip(mix, 'pagine', { t: open + 0.3, da: 2.55, durata: 0.8, gain: 0.15, fadeOut: 0.3, rev: 0.25, pan: 0.2 }); // le mazzette
  [83, 88].forEach((m, j) => glock(open + 0.3 + j * BEAT / 2, m, 0.12));
  strings(B(cue('saul', 2)), B(T.gus), { vel: 40, gain: 0.22, k0: 2 });

  // ---- gus: la stazione dei camion di notte; l'insegna del pollo, Jesse che non risponde, il bagagliaio, le chiamate perse
  const sign = E('gus', 0, 1.4), jesse = E('gus', 1, 0.8), trunk = E('gus', 2, 0.4), calls = E('gus', 2, 1.6);
  clip(mix, 'ronzio_neon', { t: sign, da: 1, durata: T.jane - sign, gain: 0.03, fadeIn: 0.05, fadeOut: 0.5, rev: 0.1, pan: -0.2 }); // Gus.tsx: l'insegna
  pizz(B(T.gus), B(T.jane), { vel: 56, gain: 0.34 });
  motif(B(T.gus), B(cue('gus', 1)), { vel: 54, gain: 0.24 });
  strings(B(cue('gus', 1)), B(T.jane), { vel: 44, gain: 0.28, k0: 1 });
  [0, 1].forEach((k) => suona(mix, 'violini_pizz', 81, { t: jesse + k * BEAT / 2, dur: 0.2, vel: 40, gain: 0.1, rev: 0.3, release: 0.2 })); // la chiamata a vuoto
  clip(mix, 'serratura', { t: trunk, da: 2.43, durata: 0.5, gain: 0.12, rev: 0.25, pan: -0.2 }); // il bagagliaio
  glock(trunk + 0.3, 83, 0.14);
  for (let k = 0; k < 6; k++) suona(mix, 'violini_pizz', [86, 81][k % 2], { t: calls + k * BEAT / 2, dur: 0.15, vel: 40, pan: 0.3, gain: 0.09, rev: 0.3, release: 0.15 }); // le chiamate perse
  trem(calls, T.jane - calls, [40, 52, 65], { gain: 0.24 });

  // ---- jane: il soggiorno di sera, pianoforte e violino solo; l'accendino, «PAGA O PARLO», il borsone che entra
  const light = E('jane', 0, 1.2), note = E('jane', 1, 0.4), bag = E('jane', 2, 1.4);
  strings(B(T.jane), B(T.notte), { half: true, vel: 40, gain: 0.26, chords: CHD });
  { const notes = [64, 67, 71, 72, 71, 67, 64, 62]; for (let k = 0; k < 8; k++) suona(mix, 'pianoforte_coda', notes[k], { t: B(T.jane) + k * BEAT, dur: BEAT * 1.5, vel: 42, pan: 0.15, rev: 0.5, gain: 0.22, release: 1 }); }
  violino(B(T.jane) + BAR, JANE, { gain: 0.2 });
  clip(mix, 'scatti', { t: light - 0.02, da: 0.47, durata: 0.12, fadeOut: 0.03, gain: 0.22, rev: 0.2 }); // Jane.tsx: lo scatto dell'accendino
  clip(mix, 'fuoco', { t: light + 0.05, da: 2, durata: 1.6, gain: 0.12, fadeIn: 0.05, fadeOut: 0.6, rev: 0.15 }); // la fiamma
  for (let k = 0; k < 7; k++) suona(mix, 'violini_pizz', [76, 77, 76, 74, 76, 77, 79][k], { t: note + k * BEAT / 4, dur: 0.2, vel: 38, pan: -0.2, gain: 0.08, rev: 0.3, release: 0.15 }); // si scrive PAGA O PARLO
  trem(note + BEAT, B(T.notte) - note - BEAT, [52, 53], { gain: 0.24 });
  clip(mix, 'sacchi', { t: bag, da: 0.3, durata: 0.5, gain: 0.35, fadeOut: 0.15, rev: 0.2 }); // il borsone scivola dentro
  clip(mix, 'pagine', { t: bag + 0.6, da: 2.5, durata: 0.6, gain: 0.2, fadeOut: 0.2, rev: 0.2 }); // si apre sulle mazzette

  // ---- notte: il corridoio buio; la porta, il bicchiere, la luce che si spegne; solo il violino e un bordone
  const openN = E('notte', 0, 0.6), glass = E('notte', 1, 1.4), dim = E('notte', 2, 0.8);
  clip(mix, 'porta_cigolio', { t: openN, da: 10.68, durata: 1.6, gain: 0.18, fadeOut: 0.5, rev: 0.35 }); // Notte.tsx: la porta si apre
  suona(mix, 'contrabbasso', 28, { t: B(T.notte), dur: T.aerei - B(T.notte), vel: 44, gain: 0.6, attack: 0.8, release: 1.2, rev: 0.5 });
  trem(B(T.notte), glass, [40, 41], { gain: 0.32 });
  strings(B(T.notte), dim, { half: true, vel: 36, gain: 0.18 });
  clip(mix, 'vetri', { t: glass + 0.3, da: 0.12, durata: 0.35, gain: 0.26, fadeOut: 0.15, rev: 0.3, lp: 5000 }); // il bicchiere si rovescia
  violino(glass + BEAT, [[0, 77, 2], [2, 76, 4]], { gain: 0.2 });
  violino(dim, [[0, 71, 3], [3, 72, 2], [5, 71, 6]], { gain: 0.18 }); // la luce cala
  strings(dim, T.aerei, { half: true, vel: 36, gain: 0.2, k0: 0 });
  glock(dim + 2.4, 76, 0.1);

  // ---- aerei: il cielo; la torre, il piccolo aereo, lo scontro (silenzio di due battiti), la pioggia di rottami, lo spruzzo
  const rain = E('aerei', 2, 0.2), splash = E('aerei', 2, 2.6);
  clip(mix, 'aereo', { t: T.aerei, da: 11.4, durata: boom - T.aerei, gain: 0.08, fadeIn: 1.2, fadeOut: 0.2, rev: 0.2, lp: 5000 }); // Aerei.tsx: l'aereo di linea
  pizz(B(T.aerei), boom - BEAT, { vel: 56, gain: 0.34, k0: 1 });
  for (let k = 0; k < 8; k++) suona(mix, 'violini_pizz', 88, { t: B(T.aerei) + k * BAR / 2, dur: 0.1, vel: 30, gain: 0.05, pan: 0.4, rev: 0.4, release: 0.1 }); // il radar
  groove(B(cue('aerei', 1)), boom - BEAT, { vel: 44 });
  trem(B(cue('aerei', 1)), boom - B(cue('aerei', 1)), [40, 41, 64, 65, 76, 77], { gain: 0.32 });
  crescendo(mix, boom - BEAT, 2.4, { gain: 0.28 });
  clip(mix, 'esplosioni', { t: boom, da: 3.24, durata: 3.5, gain: 0.2, fadeOut: 1.4, rev: 0.35 }); // lo scontro
  timp(boom, 36, 120, 0.9);
  colpo(mix, 'gong', 'gong_hit_p', { t: boom + 0.02, vel: 90, rev: 0.6, gain: 0.34, dur: 4, release: 1.2 });
  clip(mix, 'fuoco', { t: rain, da: 2, durata: T.fine - rain, gain: 0.06, fadeIn: 0.4, fadeOut: 0.6, rev: 0.2 }); // i rottami in fiamme
  strings(boom + 2 * BEAT, B(T.fine) + 2 * BEAT, { vel: 46, gain: 0.3, k0: 1 });
  for (let k = 0; k < 4; k++) tom(rain + 2.5 * BEAT + k * BEAT / 2, 50 - k * 4, -4); // i rottami sui tetti
  clip(mix, 'spruzzo', { t: splash, da: 0.4, durata: 0.9, gain: 0.3, fadeOut: 0.3, rev: 0.25 }); // lo spruzzo nella piscina

  // ---- fine: il bianco e nero con il carillon, il colore che torna (Sol maggiore), il secondo cellulare, le luci che si spengono
  const color = E('fine', 1, 0.2), phone = E('fine', 1, 1.6), off = E('fine', 2, 0.4);
  wind(T.fine, T.END - T.fine, 0.03, 0.5);
  carillon(B(T.fine) + 2 * BEAT, color, { gain: 0.2 });
  suona(mix, 'contrabbasso', 28, { t: B(T.fine) + 2 * BEAT, dur: color - B(T.fine) - 2 * BEAT, vel: 44, gain: 0.4, attack: 0.5, release: 1, rev: 0.5 });
  strings(color, B(T.finale), { vel: 44, gain: 0.3, high: true, chords: CHG }); // il colore torna
  [0, 1, 2, 3].forEach((i) => suona(mix, 'arpa', [55, 59, 62, 67][i], { t: color + i * BEAT / 2, dur: 1.6, vel: 50, pan: -0.2 + i * 0.15, rev: 0.5, gain: 0.28, release: 1.2 }));
  for (let k = 0; k < 4; k++) suona(mix, 'violini_pizz', 81, { t: phone + k * BEAT / 4, dur: 0.12, vel: 40, gain: 0.08, rev: 0.3, release: 0.1 }); // il secondo cellulare vibra
  [0, 1, 2].forEach((k) => clip(mix, 'scatti', { t: off + k * BEAT - 0.02, da: 1.0, durata: 0.3, gain: 0.14, rev: 0.25, pan: -0.3 })); // le luci si spengono
  violino(off + BEAT, [[0, 67, 2], [2, 65, 6]], { gain: 0.2 }); // Walter solo

  // ---- finale: la piscina di notte, il carillon che si ferma sospeso sul Fa
  const F = B(T.finale);
  suona(mix, 'contrabbasso', 28, { t: F, dur: 3.6, vel: 46, gain: 0.45, attack: 0.3, release: 1.2, rev: 0.5 });
  carillon(F, T.END - 0.2, { gain: 0.18 });
  tromba(F, [[0, 71, 1], [1, 76, 1], [2, 77, 4]], { gain: 0.22 });
};
