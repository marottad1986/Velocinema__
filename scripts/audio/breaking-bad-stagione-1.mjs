// Colonna sonora originale di Breaking Bad (stagione 1), discreta sotto la voce.
// Orchestra campionata (VSCO-2 CE e VCSL, CC0: scripts/audio/campioni.mjs): pizzicati di celli e contrabbasso come una
// chitarra del deserto, marimba, tromba con la sordina lontana, archi tesi, tom, cassa, charleston e timpani.
// Motivo inventato qui, in Mi minore con il Fa naturale che inquieta (modo frigio), 4/4 a 96 bpm: 10 s = 4 battute,
// così ogni capitolo da 10 s cade sul battere. Lontano dalla musica della serie: niente sigla, niente brani.
// Le scene calme vanno a metà passo, il blitz, il gas, l'esplosione e il furto a passo doppio (crome di charleston).
// Effetti registrati (archivio CC0 di Craig Smith: scripts/audio/effetti.mjs) agganciati agli eventi delle scene in
// src/scenes/breaking-bad-stagione-1/ (stessi istanti: cue = inizio della frase, G = griglia delle scene).
import { suona, colpo, crescendo } from './campioni.mjs';
import { clip } from './effetti.mjs';
import { loadFilm, timeline } from './film.mjs';

export const strumenti = ['celli', 'viole', 'violini', 'contrabbasso', 'celli_pizz', 'contrabbasso_pizz', 'violini_pizz', 'violini_trem', 'celli_trem',
  'marimba', 'tromba_sordina', 'glockenspiel', 'pianoforte_coda', 'arpa', 'timpani', 'gong', 'piatto_sospeso', 'tom', 'cassa', 'charleston', 'rullante'];
export const effetti = ['vento_leggero', 'sirene', 'porta_cigolio', 'sacchi', 'scatti', 'pagine', 'auto_epoca', 'serratura', 'porta_sbatte', 'sibilo',
  'fuoco', 'legno_cade', 'metallo_schianto', 'ceramica', 'ronzio_neon', 'catene', 'giornale', 'martelletto', 'esplosione_detriti', 'vetri',
  'termite', 'metallo_cade', 'colpi_legno', 'tintinnio', 'ali'];
/** Stanze piccole e deserto aperto: coda media. */
export const sala = { rt60: 1.8, brillo: 5200, predelay: 0.02, wet: 0.42 };

/** Un solo tempo per tutto il film (CLAUDE.md, «Musica»). */
const BPM = 96;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;

// Mi minore frigio: Mi minore, Fa, Sol, Mi minore (con il Si); il Re dà un po' di respiro nel patto e nella famiglia
const CH = [[40, 47, 52, 55], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 55]];
const CHD = [[40, 47, 52, 55], [38, 45, 50, 54], [36, 43, 48, 52], [35, 42, 47, 54]];
// Motivo alla marimba: [battito, nota MIDI, durata in battiti]
const MOTIF = [[0, 64, 0.5], [0.5, 67, 0.5], [1, 71, 1], [2, 72, 0.5], [2.5, 71, 0.5], [3, 67, 1], [4, 65, 1.5], [5.5, 64, 2.5]];

export default (mix, T) => {
  const { segments } = timeline(loadFilm('breaking-bad-stagione-1'));
  const S = Object.fromEntries(segments.map((s) => [s.id, s]));
  const T0 = T.diagnosi;
  /** Secondo d'inizio della frase n-esima del capitolo (come subtitleTimes in ChapterOverlay). */
  const cue = (id, n) => {
    const s = S[id];
    const w = s.testo.map((l) => l.length + 6);
    const tot = w.reduce((a, b) => a + b, 0);
    let acc = 0.15;
    for (let k = 0; k < n; k++) acc += (w[k] / tot) * (s.dur - 0.35);
    return s.start + acc;
  };
  /** Come griglia() nelle scene: istante assoluto arrotondato a 1/div di battito (griglia dalla fine della copertina). */
  const G = (t, div = 2) => T0 + Math.round((t - T0) / (BEAT / div)) * (BEAT / div);
  /** Evento della scena: griglia(cues[n] + d) del capitolo id. */
  const E = (id, n, d = 0) => G(cue(id, n) + d);
  const B = (t) => T0 + Math.round((t - T0) / BAR) * BAR;

  // ---- strumenti
  /** Archi tenuti sugli accordi, una battuta ciascuno (half: due battute). */
  const strings = (from, to, { half = false, vel = 46, gain = 0.4, high = false, k0 = 0, chords = CH } = {}) => {
    const step = BAR * (half ? 2 : 1), a = { attack: 0.5, release: 1.2, rev: 0.5 };
    gain *= 1.45;
    for (let t = from, k = k0; t < to - 0.4; t += step, k++) {
      const d = Math.min(step, to - t), [r, f, o, x] = chords[k % 4];
      suona(mix, 'contrabbasso', r - 12 + 12, { t, dur: d, vel: vel - 4, pan: -0.1, gain: gain * 0.8, ...a, seed: k });
      suona(mix, 'celli', f, { t, dur: d, vel, pan: -0.3, gain: gain, ...a, seed: k + 1 });
      suona(mix, 'viole', o, { t, dur: d, vel: vel - 4, pan: 0.2, gain: gain * 0.75, ...a, seed: k + 2 });
      if (high) suona(mix, 'violini', x + 12, { t, dur: d, vel: vel - 6, pan: 0.3, gain: gain * 0.5, attack: 0.7, release: 1.4, rev: 0.6 });
    }
  };
  /** Pizzicato del deserto (celli e contrabbasso), come una chitarra: radice, quinta, ottava. half: metà passo. */
  const pizz = (from, to, { half = false, vel = 58, gain = 0.4, k0 = 0, chords = CH } = {}) => {
    gain *= 1.25;
    const step = BEAT * (half ? 2 : 1);
    for (let t = from, k = 0; t < to - 0.1; t += step, k++) {
      const [r, f, o] = chords[(Math.floor((t - from) / BAR) + k0) % 4];
      const n = [r, f, o, f][k % 4];
      suona(mix, k % 4 === 0 ? 'contrabbasso_pizz' : 'celli_pizz', n + (k % 4 === 0 ? 0 : 12), { t, dur: step, vel: vel - (k % 2) * 6, pan: -0.2 + (k % 4) * 0.12, rev: 0.35, gain, release: 0.4, seed: k });
    }
  };
  /** Il motivo alla marimba (oct: trasporto; half: metà passo). */
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
  /** Tromba con la sordina, lontana: note lunghe [battito, nota, durata in battiti]. */
  const tromba = (t0, frase, { gain = 0.26, vel = 54 } = {}) => frase.forEach(([b, m, d]) =>
    suona(mix, 'tromba_sordina', m, { t: t0 + b * BEAT, dur: d * BEAT, vel, pan: 0.3, rev: 0.6, gain, attack: 0.08, release: 0.9 }));
  const hat = (t, vel = 40) => colpo(mix, 'charleston', vel > 45 ? 'v3' : 'v2', { t, vel: 100, gain: 0.24 * (vel / 50), pan: 0.3, rev: 0.12, seed: Math.round(t * 100) });
  const kick = (t, vel = 60) => colpo(mix, 'cassa', vel > 55 ? 'v5' : 'v3', { t, vel: 100, gain: 0.7 * (vel / 60), rev: 0.12, seed: Math.round(t * 100) });
  const snare = (t, vel = 50) => colpo(mix, 'rullante', vel > 55 ? 'v5' : 'v4', { t, vel: 100, gain: 0.4 * (vel / 60), pan: 0.05, rev: 0.2, seed: Math.round(t * 100) });
  const tom = (t, vel = 60, pitch = 0) => colpo(mix, 'tom', 'TomH_HitS_v3', { t, vel: 100, gain: 0.5 * (vel / 60), pan: -0.15, rev: 0.3, pitch, seed: Math.round(t * 100) });
  /** Groove a passo doppio: cassa sul 1 e sul 3, rullante leggero sul 4, charleston in crome. */
  const groove = (from, to, { vel = 46, snr = true } = {}) => {
    for (let t = from, k = 0; t < to - 0.05; t += BEAT / 2, k++) {
      hat(t, k % 2 ? vel - 12 : vel);
      if (k % 8 === 0 || k % 8 === 5) kick(t, vel + 8);
      if (snr && k % 8 === 6) snare(t, vel);
    }
  };
  const timp = (t, m = 40, vel = 90, gain = 0.6) => suona(mix, 'timpani', m, { t, dur: 2, vel, gain, rev: 0.45, release: 0.8, seed: Math.round(t * 10) });
  const glock = (t, m, gain = 0.16) => suona(mix, 'glockenspiel', m, { t, dur: 1.4, vel: 50, pan: 0.25, rev: 0.6, gain, release: 1 });
  const trem = (t, dur, notes, { vel = 46, gain = 0.28 } = {}) => notes.forEach((m, j) =>
    suona(mix, m < 60 ? 'celli_trem' : 'violini_trem', m, { t, dur, vel: 66, pan: (j - (notes.length - 1) / 2) * 0.35, gain: gain * 0.75, attack: 0.5, release: 0.9, rev: 0.5, seed: j + 3 }));
  const wind = (t, durata, gain, da = 1) => clip(mix, 'vento_leggero', { t, da, durata, gain, fadeIn: 1, fadeOut: 1, largo: 4, rev: 0.1 });

  // ---- copertina: il vento del deserto, un Mi grave, la tromba lontana che chiama
  wind(0, T0 + 0.6, 0.04);
  suona(mix, 'contrabbasso', 28, { t: 0.1, dur: 3.9, vel: 50, gain: 0.5, attack: 0.6, release: 1, rev: 0.5 });
  pizz(T0 - 6 * BEAT, T0, { half: true, vel: 54, gain: 0.32 });
  tromba(T0 - 6 * BEAT + BEAT, [[0, 71, 1.5], [1.5, 76, 2], [3.5, 77, 0.5]], { gain: 0.24 });
  tom(T0 - BEAT, 50, -2);

  // ---- diagnosi: aula di chimica, metà passo; il gesso (marimba leggera), la spugna (glockenspiel), il referto
  strings(B(T.diagnosi), B(T.blitz), { half: true, vel: 46, gain: 0.32, chords: CHD });
  pizz(B(cue('diagnosi', 1)), B(T.blitz), { half: true, vel: 50, gain: 0.26 });
  motif(B(T.diagnosi), B(cue('diagnosi', 2)), { half: true, vel: 54, gain: 0.28 });
  for (let k = 0; k < 6; k++) suona(mix, 'violini_pizz', [76, 79, 83, 79, 76, 74][k], { t: E('diagnosi', 0, 0.3) + k * BEAT / 2, dur: 0.3, vel: 40, pan: 0.3, rev: 0.3, gain: 0.12, release: 0.2 }); // Diagnosi.tsx: il gesso scrive
  glock(E('diagnosi', 1, 0.2), 79, 0.14); // la spugna dell'autolavaggio prende la luce
  clip(mix, 'pagine', { t: E('diagnosi', 2, 0.1), da: 1, durata: 0.8, gain: 0.25, fadeOut: 0.3, rev: 0.25, pan: -0.2 }); // la busta si apre
  timp(E('diagnosi', 2, 1.0), 40, 70, 0.4); // il cerchio rosso sul referto
  trem(E('diagnosi', 2, 1.0), T.blitz - E('diagnosi', 2, 1.0), [40, 52, 65], { vel: 44, gain: 0.26 });

  // ---- blitz: notte di periferia, passo doppio; sirene e luci, il fumo del laboratorio, la finestra e il berretto
  clip(mix, 'sirene', { t: E('blitz', 0, 0.2) - 0.8, da: 2.4, durata: 5.2, gain: 0.1, fadeIn: 0.6, fadeOut: 1.4, rev: 0.25, lp: 4500 }); // Blitz.tsx: arrivano le auto
  groove(B(T.blitz), B(T.patto), { vel: 40 });
  pizz(B(T.blitz), B(T.patto), { vel: 56, gain: 0.36 });
  strings(B(cue('blitz', 1)), B(T.patto), { vel: 44, gain: 0.28, k0: 1 });
  trem(E('blitz', 1, 0.1), 2.4, [64, 65], { vel: 42, gain: 0.2 }); // il fumo chimico
  clip(mix, 'porta_cigolio', { t: E('blitz', 2, 0.3), da: 10.68, durata: 0.6, gain: 0.08, fadeOut: 0.2, rev: 0.3, pan: 0.4 }); // la finestra si spalanca
  clip(mix, 'sacchi', { t: E('blitz', 2, 0.3) + 1.0, da: 0.3, durata: 0.4, gain: 0.1, fadeOut: 0.15, rev: 0.2, pan: 0.2, lp: 2500 }); // il berretto sul prato
  tom(E('blitz', 2, 0.3), 64, 0);

  // ---- patto: il magazzino della scuola; la torcia (scatto), i soldi (fruscio), «per la famiglia» (arpa, Re maggiore)
  clip(mix, 'scatti', { t: E('patto', 0, 0.1) - 0.05, da: 0.47, durata: 0.35, gain: 0.15, rev: 0.25, pan: 0.4 }); // Patto.tsx: la torcia si accende
  strings(B(T.patto), B(T.deserto), { half: true, vel: 44, gain: 0.32, k0: 0, chords: CHD });
  motif(B(T.patto), B(cue('patto', 2)), { vel: 54, gain: 0.28 });
  glock(E('patto', 0, 0.3) + BEAT, 83, 0.12); // i cristalli nel fascio
  clip(mix, 'pagine', { t: E('patto', 1, 0.2), da: 2, durata: 0.8, gain: 0.25, fadeOut: 0.3, rev: 0.25, pan: 0.2 }); // le banconote a ventaglio
  [0, 1, 2, 3].forEach((i) => suona(mix, 'arpa', [62, 66, 69, 74][i], { t: E('patto', 2, 1.0) + i * BEAT / 2, dur: 1.6, vel: 50, pan: -0.2 + i * 0.15, rev: 0.5, gain: 0.3, release: 1.2 })); // la scarpina e le chiavi

  // ---- deserto: il camper arriva (motore), il laboratorio si apre (serratura), i cristalli brillano; tromba e pizzicati
  wind(T.deserto, T.gas - T.deserto, 0.035, 5);
  clip(mix, 'auto_epoca', { t: T.deserto, da: 4, durata: E('deserto', 0, 1.6) - T.deserto + 0.6, gain: 0.12, fadeIn: 0.6, fadeOut: 0.8, lp: 2200, rev: 0.15, pan: 0.3 }); // Deserto.tsx: il camper arriva e si ferma
  pizz(B(T.deserto), B(T.gas), { vel: 58, gain: 0.38 });
  for (let t = B(T.deserto), k = 0; t < B(T.gas) - 0.1; t += BEAT, k++) if (k % 4 === 0) kick(t, 44);
  tromba(B(cue('deserto', 0)) + BAR, [[0, 71, 2], [2, 72, 1], [3, 71, 1], [4, 67, 3]], { gain: 0.24 });
  clip(mix, 'serratura', { t: E('deserto', 1, 0.1), da: 2.43, durata: 0.5, gain: 0.25, rev: 0.25, pan: -0.1 }); // la porta del camper si apre
  const shine = E('deserto', 2, 0.2);
  crescendo(mix, shine, 1.8, { gain: 0.22 });
  [83, 88, 91].forEach((m, j) => glock(shine + j * BEAT / 2, m, 0.16)); // il vassoio di cristalli

  // ---- gas: l'auto degli spacciatori, la cucina, la porta che sbatte e il gas; tensione a passo doppio
  clip(mix, 'auto_epoca', { t: T.gas, da: 15, durata: E('gas', 0, 1.2) - T.gas + 0.4, gain: 0.14, fadeIn: 0.5, fadeOut: 0.6, lp: 2000, rev: 0.15, pan: -0.4 }); // Gas.tsx: l'auto scura arriva
  pizz(B(T.gas), B(cue('gas', 2)), { vel: 58, gain: 0.38, k0: 1 });
  groove(B(cue('gas', 1)), E('gas', 2, 0.2) - BEAT / 2, { vel: 38, snr: false });
  clip(mix, 'fuoco', { t: E('gas', 1, 0.6), da: 2, durata: T.acido - E('gas', 1, 0.6), gain: 0.06, fadeIn: 0.5, fadeOut: 0.8, rev: 0.15 }); // il fornello
  const slam = E('gas', 2, 0.2);
  clip(mix, 'porta_sbatte', { t: slam - 0.05, da: 2.9, durata: 0.5, gain: 0.15, fadeOut: 0.2, rev: 0.25 }); // la porta sbatte
  timp(slam, 40, 96, 0.6);
  clip(mix, 'sibilo', { t: slam + 0.2, da: 4, durata: T.acido - slam - 0.1, gain: 0.05, fadeIn: 0.6, fadeOut: 0.6, rev: 0.15, largo: 2 }); // il gas
  clip(mix, 'legno_cade', { t: slam + 0.42, da: 0, durata: 0.4, gain: 0.08, fadeOut: 0.15, rev: 0.2, lp: 2500 }); // la maschera cade
  trem(slam + BEAT, T.acido - slam - BEAT, [52, 53, 64, 65], { vel: 50, gain: 0.32 });

  // ---- acido: la macchia e le gocce (pizzicati acuti), il bidone giusto (glockenspiel), il crollo della vasca
  strings(B(T.acido), E('acido', 2, 0.4) - 0.2, { half: true, vel: 46, gain: 0.32, k0: 1 });
  pizz(B(T.acido), E('acido', 2, 0.4) - BEAT, { half: true, vel: 50, gain: 0.28, k0: 1 });
  for (let t = E('acido', 0, 0.1) + BEAT, k = 0; t < E('acido', 2, 0.4) - 0.3; t += BEAT, k++) suona(mix, 'violini_pizz', [88, 86][k % 2], { t, dur: 0.2, vel: 38, pan: 0.1, rev: 0.4, gain: 0.1, release: 0.2 }); // Acido.tsx: le gocce
  glock(E('acido', 1, 0.2), 76, 0.16); glock(E('acido', 1, 0.2) + BEAT, 83, 0.12); // il bidone di plastica
  const fall = E('acido', 2, 0.4);
  crescendo(mix, fall + 0.4, 1.2, { gain: 0.16 });
  clip(mix, 'metallo_schianto', { t: fall + 0.4, da: 0, durata: 1.45, gain: 0.24, fadeOut: 0.5, rev: 0.25 }); // la vasca sfonda il soffitto
  clip(mix, 'sacchi', { t: fall + 0.45, da: 0.3, durata: 0.6, gain: 0.3, fadeOut: 0.2, rev: 0.2 });
  timp(fall + 0.45, 36, 100, 0.55);
  clip(mix, 'fuoco', { t: fall + 1.0, da: 6, durata: T.cantina - fall - 1.0, gain: 0.07, fadeIn: 0.4, fadeOut: 0.5, rev: 0.15 }); // la melma che sfrigola
  trem(fall + 0.45 + BEAT * 2, T.cantina - fall - 0.45 - BEAT * 2, [40, 41], { vel: 44, gain: 0.26 });

  // ---- cantina: la lampadina (ronzio), la chiave (catene), il coccio (glockenspiel), «UCCIDERLO»: la catena e il timpano
  clip(mix, 'ronzio_neon', { t: E('cantina', 0, 0.1), da: 1, durata: T.famiglia - E('cantina', 0, 0.1) - 0.2, gain: 0.05, fadeIn: 0.2, fadeOut: 0.6, rev: 0.1 }); // Cantina.tsx: la lampadina
  const taut = E('cantina', 2, 0.6);
  strings(B(T.cantina), taut, { half: true, vel: 44, gain: 0.32, k0: 3 });
  pizz(B(T.cantina), B(cue('cantina', 2)), { half: true, vel: 52, gain: 0.3 });
  clip(mix, 'catene', { t: E('cantina', 1, 0.1) + 0.5, da: 1.45, durata: 0.5, gain: 0.12, fadeOut: 0.2, pan: 0.3 }); // la chiave si avvicina
  glock(E('cantina', 1, 1.4), 89, 0.18); // il pezzo che manca del piatto
  clip(mix, 'ceramica', { t: E('cantina', 1, 1.4), da: 0.08, durata: 0.5, gain: 0.08, fadeOut: 0.2, rev: 0.2, lp: 4000 });
  trem(E('cantina', 2, 0.1), taut - E('cantina', 2, 0.1), [52, 53, 76, 77], { vel: 52, gain: 0.3 });
  clip(mix, 'catene', { t: taut, da: 28.08, durata: 0.7, gain: 0.2, fadeOut: 0.3, rev: 0.2 }); // la catena si tende
  timp(taut, 40, 104, 0.7);

  // ---- famiglia: cucina di notte, pianoforte e archi in Re; il calendario, l'assegno strappato, i soldi nascosti, il timbro
  strings(B(T.famiglia), B(T.heisenberg), { half: true, vel: 42, gain: 0.3, chords: CHD });
  {
    const notes = [74, 71, 69, 66, 69, 71, 74, 76];
    for (let k = 0; k < 8; k++) suona(mix, 'pianoforte_coda', notes[k], { t: B(T.famiglia) + k * BEAT, dur: BEAT * 1.5, vel: 46, pan: 0.15, rev: 0.5, gain: 0.26, release: 1 });
  }
  glock(E('famiglia', 0, 0.2), 81, 0.12); // il cerchio sul calendario
  clip(mix, 'giornale', { t: E('famiglia', 1, 0.6) - 0.2, da: 0.85, durata: 0.5, gain: 0.15, fadeOut: 0.2, rev: 0.2, pan: 0.3 }); // Famiglia.tsx: l'assegno si strappa
  suona(mix, 'celli', 41, { t: E('famiglia', 1, 0.6), dur: 2.4, vel: 50, gain: 0.3, attack: 0.1, release: 1, rev: 0.5 });
  clip(mix, 'scatti', { t: E('famiglia', 2, 0.1), da: 1.0, durata: 0.3, gain: 0.18, rev: 0.2, pan: -0.1 }); // la griglia si apre
  motif(E('famiglia', 2, 0.1), T.heisenberg - 0.2, { vel: 50, gain: 0.24, oct: -12 });
  clip(mix, 'martelletto', { t: E('famiglia', 2, 1.0) + 0.05, da: 0.5, durata: 0.3, gain: 0.28, fadeOut: 0.1, rev: 0.2 }); // il timbro PAGATO

  // ---- heisenberg: il sacchetto rubato, l'esplosivo travestito e il nome; tensione, poi l'esplosione e un battito di silenzio
  pizz(B(T.heisenberg), B(cue('heisenberg', 1)), { vel: 58, gain: 0.38, k0: 2 });
  clip(mix, 'sacchi', { t: E('heisenberg', 0, 0.3) + 0.4, da: 0.3, durata: 0.5, gain: 0.22, fadeOut: 0.15, rev: 0.2 }); // Heisenberg.tsx: il sacchetto cade
  tom(E('heisenberg', 0, 0.3) + 0.4, 60, -3);
  glock(E('heisenberg', 1, 0.1), 77, 0.14); // il sacchetto grigio
  for (let k = 0; k < 5; k++) suona(mix, 'violini_pizz', [76, 79, 83, 82, 79][k], { t: E('heisenberg', 1, 0.8) + k * BEAT / 2, dur: 0.3, vel: 40, pan: 0.3, rev: 0.3, gain: 0.1, release: 0.2 }); // si scrive HEISENBERG
  const boom = E('heisenberg', 2, 0.5);
  trem(B(cue('heisenberg', 1)), boom - B(cue('heisenberg', 1)) - 0.05, [40, 41, 64, 65], { vel: 54, gain: 0.32 });
  groove(B(cue('heisenberg', 1)), boom - BEAT / 2, { vel: 42 });
  crescendo(mix, boom, 2.4, { gain: 0.26 });
  clip(mix, 'esplosione_detriti', { t: boom, da: 0, durata: 3.6, gain: 0.28, fadeOut: 1.2, rev: 0.3 }); // l'ufficio salta
  clip(mix, 'vetri', { t: boom + 0.05, da: 0, durata: 1.2, gain: 0.3, fadeOut: 0.4, rev: 0.25, pan: -0.2 });
  timp(boom, 40, 110, 0.55);
  colpo(mix, 'gong', 'gong_hit_p', { t: boom + 0.02, vel: 80, rev: 0.5, gain: 0.3, dur: 3, release: 1 });
  const dopo = boom + 2 * BEAT; // due battiti di silenzio
  strings(dopo, T.furto, { vel: 44, gain: 0.3, k0: 1 });
  clip(mix, 'pagine', { t: boom + 1.3, da: 2.5, durata: 0.6, gain: 0.2, fadeOut: 0.2, rev: 0.2 }); // le mazzette di Tuco

  // ---- furto: l'insegna (ronzio), la torcia sul bidone, la termite che brucia il lucchetto, il lucchetto che cade, la porta
  wind(T.furto, T.fine - T.furto, 0.02, 2);
  clip(mix, 'ronzio_neon', { t: E('furto', 0, 0.3), da: 1, durata: T.fine - E('furto', 0, 0.3), gain: 0.025, fadeIn: 0.1, fadeOut: 0.6, rev: 0.1, pan: -0.2 }); // Furto.tsx: l'insegna
  pizz(B(T.furto), B(T.fine), { vel: 58, gain: 0.36, k0: 3 });
  groove(B(cue('furto', 1)), B(T.fine), { vel: 38 });
  clip(mix, 'scatti', { t: E('furto', 1, 0.6) - 0.1, da: 0.47, durata: 0.35, gain: 0.12, rev: 0.2, pan: 0.3 }); // la torcia
  glock(E('furto', 1, 0.6) + BEAT / 2, 76, 0.14); // METILAMMINA
  const burn = E('furto', 2, 0.3);
  clip(mix, 'termite', { t: burn - 0.3, da: 0.3, durata: 2.6, gain: 0.22, fadeOut: 0.5, rev: 0.2 }); // la termite brucia
  trem(burn, 2.2, [64, 65, 76, 77], { vel: 52, gain: 0.26 });
  clip(mix, 'metallo_cade', { t: burn + 2.5, da: 0.55, durata: 0.6, gain: 0.14, fadeOut: 0.2, rev: 0.2 }); // il lucchetto a terra
  clip(mix, 'porta_cigolio', { t: burn + 2.6, da: 10.68, durata: 1.0, gain: 0.08, fadeOut: 0.3, rev: 0.3, pan: -0.2 }); // la porta si socchiude

  // ---- fine: la consegna, il colpo (cassa e timpano), gli occhiali, i corvi; il tramonto e i fari: la paura che resta
  wind(T.fine, T.END - T.fine, 0.04, 0.5);
  pizz(B(T.fine), E('fine', 0, 1.6) - BEAT / 2, { vel: 56, gain: 0.34 });
  const hit = E('fine', 0, 1.6);
  clip(mix, 'colpi_legno', { t: hit, da: 1.4, durata: 0.4, gain: 0.32, rev: 0.25 }); // Fine.tsx: il colpo, l'auto sobbalza
  kick(hit, 70); timp(hit, 40, 110, 0.7);
  clip(mix, 'tintinnio', { t: hit + 0.45, da: 0.13, durata: 0.4, gain: 0.14, fadeOut: 0.15, rev: 0.2, pan: -0.1 }); // gli occhiali a terra
  const silenzio = hit + 2 * BEAT;
  strings(silenzio, B(T.fine) + 2 * BAR, { vel: 46, gain: 0.32, k0: 0 });
  strings(B(T.fine) + 2 * BAR, B(T.finale), { vel: 46, gain: 0.32, k0: 1 });
  clip(mix, 'ali', { t: E('fine', 1, 0.2), da: 0, durata: 1.6, gain: 0.16, fadeOut: 0.5, rev: 0.25, pan: 0.2 }); // i corvi si alzano
  motif(B(cue('fine', 1)) + BAR, B(T.finale), { half: true, vel: 50, gain: 0.24, oct: -12 });
  const eyes = E('fine', 2, 1.0);
  tromba(eyes, [[0, 64, 3], [3, 65, 3]], { gain: 0.24 }); // i fari come due occhi
  trem(E('fine', 2), B(T.finale) - E('fine', 2) + 1, [40, 41], { vel: 46, gain: 0.26 });

  // ---- finale: il camper sotto le stelle, il motivo che si ferma sospeso sul Fa
  const F = B(T.finale);
  pizz(F, T.END - 0.4, { half: true, vel: 50, gain: 0.3 });
  suona(mix, 'contrabbasso', 28, { t: F, dur: 3.6, vel: 46, gain: 0.45, attack: 0.3, release: 1.2, rev: 0.5 });
  tromba(F + BEAT, [[0, 71, 1.5], [1.5, 76, 1.5], [3, 77, 2.5]], { gain: 0.22 });
};
