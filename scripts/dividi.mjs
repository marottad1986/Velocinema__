// npm run dividi -- <film> <file> [--cartella audio/<film>]
//   Divide una registrazione unica della voce (tutti i capitoli di seguito) nelle clip 00_copertina, 01_<id>,
//   02_<id>… usate da npm run voce. Copertina e finale contano solo se hanno "voce" nel JSON.
// Le pause tra i capitoli di solito non sono più lunghe di quelle tra le frasi, quindi il testo viene allineato
// alla registrazione: le frasi (spezzate alla punteggiatura) si distribuiscono sui tratti di parlato tra una pausa
// e l'altra in modo che le durate tornino con la lunghezza del testo; si taglia nella pausa dove inizia ogni capitolo.
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
const res = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-af', 'silencedetect=n=-40dB:d=0.1', '-f', 'null', '-'], { encoding: 'utf8' });
if (res.error) throw new Error(`ffmpeg non trovato: è nel PATH? (${res.error.message})`);
const starts = [...res.stderr.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
const ends = [...res.stderr.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
let pauses = starts.map((s, i) => ({ s, e: ends[i] ?? len }));
let [from0, to0] = [0, len];
if (pauses.length && pauses[0].s < 0.05) from0 = pauses.shift().e;
if (pauses.length && pauses.at(-1).e > len - 0.05) to0 = pauses.pop().s;
if (pauses.length < parts.length - 1) {
  console.error(`Trovate ${pauses.length} pause, ne servono almeno ${parts.length - 1}: lascia una pausa tra i capitoli.`);
  process.exit(1);
}

// ---- frasi: testo di ogni parte spezzato alla punteggiatura; le cifre contano come parole lette
const letters = (s) => s.replace(/\d+/g, (d) => 'x'.repeat(d.length * 5)).replace(/[^\p{L}]/gu, '').length;
const clauses = parts.flatMap((p, k) =>
  p.testo.join(' ').split(/(?<=[.,:;!?»])\s+/).filter((c) => c.trim()).map((c) => ({ k, n: letters(c), c })),
);
const weight = (c) => (/[.!?»]$/.test(c) ? 4 : /[:;]$/.test(c) ? 2 : 0.6); // costo di una punteggiatura senza pausa

// nodi: inizio, pause, fine; una frase-confine (inizio di frase) si appoggia a un nodo
const nodes = [{ s: from0, e: from0 }, ...pauses, { s: to0, e: to0 }];
const C = clauses.length;
const M = nodes.length;
const spoken = to0 - from0 - pauses.reduce((a, p) => a + p.e - p.s, 0);
const rate = spoken / clauses.reduce((a, c) => a + c.n, 0); // secondi per lettera
const pref = [0];
clauses.forEach((c) => pref.push(pref.at(-1) + c.n));

// programmazione dinamica: best[i][p] = costo minimo con la frase i che inizia dopo il nodo p
const best = Array.from({ length: C + 1 }, () => new Float64Array(M).fill(Infinity));
const back = Array.from({ length: C + 1 }, () => new Int32Array(M * 2).fill(-1));
best[0][0] = 0;
for (let i = 0; i < C; i++) {
  for (let p = 0; p < M; p++) {
    if (best[i][p] === Infinity) continue;
    let unpaused = 0;
    for (let j = i + 1; j <= Math.min(C, i + 8); j++) {
      if (clauses[j - 1].k !== clauses[i].k) break; // un gruppo di frasi non attraversa un cambio di capitolo
      if (j > i + 1) unpaused += weight(clauses[j - 2].c);
      const expected = (pref[j] - pref[i]) * rate;
      let skipped = 0;
      for (let q = p + 1; q < Math.min(M, p + 10); q++) {
        if (q > p + 1) skipped += nodes[q - 1].e - nodes[q - 1].s;
        if ((j === C) !== (q === M - 1)) continue;
        const dur = nodes[q].s - nodes[p].e - skipped;
        const cost = best[i][p] + ((dur - expected) / (0.15 * expected + 0.25)) ** 2 + 20 * skipped + unpaused;
        if (cost < best[j][q]) {
          best[j][q] = cost;
          back[j][q * 2] = i;
          back[j][q * 2 + 1] = p;
        }
      }
    }
  }
}
if (best[C][M - 1] === Infinity) {
  console.error('Non riesco ad allineare il testo alla registrazione: controlla che il testo letto sia quello del JSON.');
  process.exit(1);
}
const startNode = new Map(); // frase → nodo dopo cui inizia
for (let j = C, q = M - 1; j > 0; ) {
  const [i, p] = [back[j][q * 2], back[j][q * 2 + 1]];
  startNode.set(i, p);
  [j, q] = [i, p];
}
const bounds = [0];
for (let k = 1; k < parts.length; k++) {
  const p = nodes[startNode.get(clauses.findIndex((c) => c.k === k))];
  bounds.push((p.s + p.e) / 2);
}
bounds.push(len);

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
  const wps = p.testo.reduce((a, s) => a + words(s), 0) / (to - from);
  const flag = wps < 1.6 || wps > 4.2 ? '  ← controlla: ritmo strano, forse il taglio è nel posto sbagliato' : '';
  if (flag) odd = true;
  console.log(`  ${base.padEnd(16)} ${from.toFixed(2).padStart(6)}–${to.toFixed(2).padStart(6)} s  ${wps.toFixed(1)} parole/s${flag}`);
  existing
    .filter((f) => f !== `${base}.wav` && f.slice(0, f.lastIndexOf('.')) === base)
    .forEach((f) => console.warn(`    attenzione: in ${dir} c'è anche ${f}, toglilo o npm run voce potrebbe usare quello`));
});
if (odd) console.warn('\nAlcune parti hanno un ritmo strano: ascoltale, o allunga la pausa tra i capitoli e rigenera.');
