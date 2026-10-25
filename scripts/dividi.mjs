// npm run dividi -- <film> <file> [--cartella audio/<film>]
//   Divide una registrazione unica della voce (tutti i capitoli di seguito, separati da una pausa lunga)
//   nelle clip 00_copertina, 01_<id>, 02_<id>… usate da npm run voce.
// Taglia nel mezzo delle pause più lunghe: tante quante servono per il numero di parti con testo voce
// (copertina e finale solo se hanno "voce" nel JSON). Mostra il ritmo di ogni parte per controllare i tagli.
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { duration, loadFilm, run, timeline } from './audio/film.mjs';

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const [slug, file] = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
if (!slug || !file) {
  console.error('Uso: npm run dividi -- <film> <file audio> [--cartella audio/<film>]');
  process.exit(1);
}
if (!existsSync(file)) {
  console.error(`Non trovo ${file}`);
  process.exit(1);
}
const dir = opt('cartella', `audio/${slug}`);
const parts = timeline(loadFilm(slug)).segments.filter((s) => s.testo.length);
const len = duration(file);

// ---- pause della registrazione (silencedetect scrive su stderr)
const res = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-af', 'silencedetect=n=-40dB:d=0.3', '-f', 'null', '-'], { encoding: 'utf8' });
if (res.error) throw new Error(`ffmpeg non trovato: è nel PATH? (${res.error.message})`);
const starts = [...res.stderr.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
const ends = [...res.stderr.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
const pauses = starts
  .map((s, i) => ({ s, e: ends[i] ?? len }))
  .filter((p) => p.s > 0.05 && p.e < len - 0.05); // non contano il silenzio iniziale e finale

if (pauses.length < parts.length - 1) {
  console.error(`Trovate ${pauses.length} pause, ne servono ${parts.length - 1} per ${parts.length} parti: separa i capitoli con una pausa più lunga.`);
  process.exit(1);
}
const cuts = [...pauses]
  .sort((a, b) => b.e - b.s - (a.e - a.s))
  .slice(0, parts.length - 1)
  .sort((a, b) => a.s - b.s);
const bounds = [0, ...cuts.map((p) => (p.s + p.e) / 2), len];

// ---- scrive le clip e mostra il ritmo di ognuna
mkdirSync(dir, { recursive: true });
const existing = readdirSync(dir);
const words = (s) => s.split(/\s+/).filter(Boolean).length;
console.log(`${file} (${len.toFixed(1)} s) → ${dir}:`);
let odd = false;
parts.forEach((p, i) => {
  const base = `${String(p.n).padStart(2, '0')}_${p.id}`;
  const [from, to] = [bounds[i], bounds[i + 1]];
  run('ffmpeg', ['-y', '-v', 'error', '-i', file, '-ss', from.toFixed(3), '-to', to.toFixed(3), '-ar', '48000', `${dir}/${base}.wav`]);
  const pause = i < cuts.length ? `  pausa dopo ${(cuts[i].e - cuts[i].s).toFixed(2)} s` : '';
  const wps = p.testo.reduce((a, s) => a + words(s), 0) / (to - from);
  const flag = wps < 1.6 || wps > 4.2 ? '  ← controlla: ritmo strano, forse il taglio è nel posto sbagliato' : '';
  if (flag) odd = true;
  console.log(`  ${base.padEnd(16)} ${from.toFixed(2).padStart(6)}–${to.toFixed(2).padStart(6)} s  ${wps.toFixed(1)} parole/s${pause}${flag}`);
  existing
    .filter((f) => f !== `${base}.wav` && f.slice(0, f.lastIndexOf('.')) === base)
    .forEach((f) => console.warn(`    attenzione: in ${dir} c'è anche ${f}, toglilo o npm run voce potrebbe usare quello`));
});
if (odd) console.warn('\nAlcune parti hanno un ritmo strano: ascoltale, o allunga la pausa tra i capitoli e rigenera.');
