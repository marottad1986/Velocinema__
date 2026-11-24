// node scripts/livelli.mjs <film> [--finestre] → livelli della colonna sonora per capitolo: mix, sola musica (strumenti
// campionati) e soli effetti registrati, con la stessa normalizzazione di npm run musica (picco del mix a -3 dB).
// Segnala i tratti in cui gli effetti stanno più di 3 dB sopra la musica e i buchi (finestre da 0,5 s sotto -45 dB).
// Gli effetti sintetici di synth.mjs (put) finiscono nella «musica». Serve ai revisori e a chi tara i volumi.
// Colpi (proposta «Colpi coperti visibili subito», approvata dall'editore il 22 nov 2026): una riga per ogni colpo
// (timpani, grancassa, gong, piatti) e per ogni effetto registrato breve (fino a 2,5 s), con il picco del suono
// contro il picco della sola musica (note, senza colpi né effetti) nello stesso istante (0,3 s dal colpo) e nel
// secondo prima; «coperto» se il colpo resta sotto la musica, «poco sopra» se la supera di meno di 6 dB, «musica non tace» se nei 0,5 s dopo
// un colpo forte la musica resta entro 12 dB dal colpo (spartiti: taci() in campioni.mjs).
import { pathToFileURL } from 'node:url';
import { createMix, SR } from './audio/synth.mjs';
import { impulso, convolvi } from './audio/sala.mjs';
import { scaricaCampioni } from './audio/campioni.mjs';
import { scaricaEffetti } from './audio/effetti.mjs';
import { loadFilm, timeline } from './audio/film.mjs';

const slug = process.argv[2];
if (!slug) {
  console.error('Uso: node scripts/livelli.mjs <film> [--finestre]');
  process.exit(1);
}
const { T, segments } = timeline(loadFilm(slug));
const sp = await import(pathToFileURL(`scripts/audio/${slug}.mjs`).href);
scaricaCampioni(sp.strumenti ?? []);
scaricaEffetti(sp.effetti ?? []);
const ir = sp.sala && impulso(sp.sala);
const wet = sp.sala?.wet ?? 0.5;

/** Rende la colonna sonora (o una sola parte) come musica.mjs, senza normalizzare. */
const rendi = (stem) => {
  globalThis.VELOCINEMA_STEM = stem;
  const mix = createMix(T.END);
  sp.default(mix, T);
  globalThis.VELOCINEMA_STEM = undefined;
  const wl = ir ? convolvi(mix.rL, ir[0]) : mix.rL, wr = ir ? convolvi(mix.rR, ir[1]) : mix.rR;
  const L = new Float32Array(mix.n), R = new Float32Array(mix.n);
  for (let i = 0; i < mix.n; i++) {
    const env = Math.min(1, i / SR / 0.05, (mix.n - i) / SR / 2);
    L[i] = (mix.L[i] + (ir ? wl[i] * wet : 0)) * env;
    R[i] = (mix.R[i] + (ir ? wr[i] * wet : 0)) * env;
  }
  return { L, R };
};
globalThis.VELOCINEMA_COLPI = [];
const tutto = rendi(undefined);
const eventi = globalThis.VELOCINEMA_COLPI;
globalThis.VELOCINEMA_COLPI = undefined;
const musica = rendi('musica'), effetti = rendi('effetti'), note = rendi('senza-colpi'), colpi = rendi('colpi');
let picco = 0;
for (let i = 0; i < tutto.L.length; i++) picco = Math.max(picco, Math.abs(tutto.L[i]), Math.abs(tutto.R[i]));
const g = picco ? 10 ** (-3 / 20) / picco : 1;
const db = (s, a, b) => {
  let e = 0, n = 0;
  for (let i = Math.round(a * SR); i < Math.min(s.L.length, Math.round(b * SR)); i++, n++) e += (s.L[i] ** 2 + s.R[i] ** 2) / 2;
  return n && e ? 20 * Math.log10(Math.sqrt(e / n) * g) : -120;
};

console.log(`${slug}: RMS in dB (mix / musica / effetti), picco del mix a -3 dB`);
for (const s of segments) {
  const fine = s.start + s.dur;
  const note = [];
  let sopra = 0, maxSopra = 0, buchi = [];
  for (let t = s.start; t < fine - 0.01; t += 0.5) {
    const m = db(musica, t, t + 0.5), f = db(effetti, t, t + 0.5), a = db(tutto, t, t + 0.5);
    sopra = f > m + 3 ? sopra + 0.5 : 0;
    maxSopra = Math.max(maxSopra, sopra);
    if (a < -45) buchi.push(t.toFixed(1));
  }
  if (maxSopra > 2) note.push(`effetti sopra la musica per ${maxSopra} s di fila`);
  if (buchi.length) note.push(`buchi a ${buchi.join(', ')} s`);
  console.log(`${s.id.padEnd(14)} ${db(tutto, s.start, fine).toFixed(1).padStart(6)} ${db(musica, s.start, fine).toFixed(1).padStart(6)} ${db(effetti, s.start, fine).toFixed(1).padStart(6)}  ${note.join('; ')}`);
}
// ---- colpi
const picDb = (s, a, b) => {
  let p = 0;
  for (let i = Math.max(0, Math.round(a * SR)); i < Math.min(s.L.length, Math.round(b * SR)); i++) p = Math.max(p, Math.abs(s.L[i]), Math.abs(s.R[i]));
  return p ? 20 * Math.log10(p * g) : -120;
};
const FORTI = ['timpani', 'grancassa', 'grancassa_rullo', 'gong', 'piatto_crash', 'piatto_sospeso'];
const lista = eventi
  .filter((e) => (e.tipo === 'colpo' ? FORTI.includes(e.id) : e.dur <= 2.5) && e.t >= 0 && e.t < T.END)
  .sort((a, b) => a.t - b.t)
  .filter((e, i, v) => !v.slice(0, i).some((x) => x.id === e.id && e.t - x.t < 0.1)); // rulli e colpi doppi: una riga
console.log();
console.log(`Colpi: picco del colpo / picco della sola musica nello stesso istante (0,3 s) e nel secondo prima, in dB`);
const capDi = (t) => segments.find((s) => t >= s.start && t < s.start + s.dur)?.id ?? '';
let coperti = 0;
for (const e of lista) {
  const src = e.tipo === 'colpo' ? colpi : effetti;
  const c = picDb(src, e.t, e.t + 0.3), m = picDb(note, e.t, e.t + 0.3), prima = picDb(note, e.t - 1, e.t), dopo = picDb(note, e.t + 0.15, e.t + 0.65);
  const avvisi = [];
  if (c < m) (avvisi.push('coperto'), coperti++);
  else if (c - m < 6) avvisi.push('poco sopra');
  if (c > -12 && c - dopo < 12) avvisi.push('musica non tace');
  console.log(`${e.t.toFixed(2).padStart(7)} s  ${capDi(e.t).padEnd(14)} ${e.id.padEnd(22)} ${c.toFixed(1).padStart(6)} / ${m.toFixed(1).padStart(6)}  (prima ${prima.toFixed(1)})  ${avvisi.length ? '⚠ ' + avvisi.join('; ') : ''}`);
}
console.log(`${lista.length} colpi, ${coperti} coperti dalla musica.`);
if (process.argv.includes('--finestre')) {
  for (let t = 0; t < T.END; t += 0.5) console.log(t.toFixed(1).padStart(6), db(tutto, t, t + 0.5).toFixed(1), db(musica, t, t + 0.5).toFixed(1), db(effetti, t, t + 0.5).toFixed(1));
}
