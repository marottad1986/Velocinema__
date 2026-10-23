// node scripts/livelli.mjs <film> [--finestre] → livelli della colonna sonora per capitolo: mix, sola musica (strumenti
// campionati) e soli effetti registrati, con la stessa normalizzazione di npm run musica (picco del mix a -3 dB).
// Segnala i tratti in cui gli effetti stanno più di 3 dB sopra la musica e i buchi (finestre da 0,5 s sotto -45 dB).
// Gli effetti sintetici di synth.mjs (put) finiscono nella «musica». Serve ai revisori e a chi tara i volumi.
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
const tutto = rendi(undefined), musica = rendi('musica'), effetti = rendi('effetti');
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
if (process.argv.includes('--finestre')) {
  for (let t = 0; t < T.END; t += 0.5) console.log(t.toFixed(1).padStart(6), db(tutto, t, t + 0.5).toFixed(1), db(musica, t, t + 0.5).toFixed(1), db(effetti, t, t + 0.5).toFixed(1));
}
