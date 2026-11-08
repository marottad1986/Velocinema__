// node scripts/pacchetto.mjs <film> [--capitoli a,b,…] [--musica]
// Prepara il materiale per i revisori in out/revisione/<film>/, così non devono rifarlo da capo:
//   <capitolo>.png   fotogrammi affiancati (metà risoluzione) a 1 s, poco dopo l'inizio della 2ª e della 3ª frase
//                    (dove avvengono gli eventi agganciati alla voce) e a fine capitolo; copertina e finale a 1, 2, 3 s
//   tempi.md         per ogni capitolo: inizio nel video, istanti delle frasi (come ChapterOverlay) e sottotitoli
//   misure.md        misure automatiche sui fotogrammi (scripts/strumenti/misure.mjs, QUALITA.md §10) con gli avvisi:
//                    metà bassa vuota, inquadratura vuota, niente che si muove, camera ferma, evento invisibile,
//                    copertina scura, in dissolvenza o poco contrastata in miniatura (avvisi stampati anche qui)
//   livelli.txt      con --musica: uscita di scripts/livelli.mjs (mix, musica, effetti, buchi, coperture)
// --capitoli limita il pacchetto ai capitoli indicati (secondo passaggio: solo le parti modificate).
// Browser: REMOTION_BROWSER (in un ambiente cloud il Chromium installato, con il proxy se serve).
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { loadFilm } from './audio/film.mjs';
import { grigio, istantiCapitolo, istantiLocandina, misuraCapitolo, misuraCopertina } from './strumenti/misure.mjs';

const args = process.argv.slice(2);
const film = args.find((a) => !a.startsWith('--'));
if (!film) {
  console.error('Uso: node scripts/pacchetto.mjs <film> [--capitoli a,b] [--musica]');
  process.exit(1);
}
const iCap = args.indexOf('--capitoli');
const soloCap = iCap >= 0 ? args[iCap + 1].split(',').map((s) => s.trim()) : null;
const data = loadFilm(film);
const dir = `out/revisione/${film}`;
mkdirSync(dir, { recursive: true });

/** Istanti d'inizio delle frasi, come subtitleTimes in src/components/ChapterOverlay.tsx. */
const cues = (c) => {
  const w = c.sottotitoli.map((l) => l.length + 6);
  const tot = w.reduce((a, b) => a + b, 0);
  let acc = 0.15;
  return w.map((x) => { const s = acc; acc += (x / tot) * (c.durata - 0.35); return s; });
};

// ---- tempi.md
let inizio = data.copertina.durata;
const righe = [`# Tempi di ${data.titolo}`, '', 'Istanti in secondi: relativi al capitolo (assoluti nel video tra parentesi).', ''];
for (const c of data.capitoli) {
  righe.push(`## ${c.id} · «${c.titolo}» · da ${inizio} s, ${c.durata} s`);
  cues(c).forEach((s, i) => righe.push(`- frase ${i} a ${s.toFixed(2)} (${(inizio + s).toFixed(2)}): ${c.sottotitoli[i]}`));
  righe.push('');
  inizio += c.durata;
}
writeFileSync(`${dir}/tempi.md`, righe.join('\n'));

// ---- fotogrammi
const scelti = [
  ...data.capitoli.filter((c) => !soloCap || soloCap.includes(c.id)).map((c) => {
    const q = cues(c);
    const t = [1, (q[1] ?? c.durata / 2) + 1.0, (q[2] ?? c.durata * 0.75) + 1.2, c.durata - 0.5];
    return { id: c.id, c, q, durata: c.durata, t: [...new Set(t.map((x) => Math.min(c.durata - 0.1, +x.toFixed(2))))], m: istantiCapitolo(c, q) };
  }),
  ...['copertina', 'finale'].filter((id) => !soloCap || soloCap.includes(id)).map((id) => ({ id, durata: data[id].durata, t: [1, 2, 3], m: id === 'copertina' ? istantiLocandina() : [] })),
];
const serveUrl = await bundle({ entryPoint: path.join(process.cwd(), 'src/index.ts') });
const browserExecutable = process.env.REMOTION_BROWSER || undefined;
// Dietro un proxy con certificato proprio (ambiente cloud) i font di Google non si caricano: REMOTION_IGNORA_CERTIFICATI=1.
const chromiumOptions = { ignoreCertificateErrors: !!process.env.REMOTION_IGNORA_CERTIFICATI };
const tmp = `${dir}/tmp`;
mkdirSync(tmp, { recursive: true });
const misure = [`# Misure automatiche di ${data.titolo}`, '',
  'Da scripts/strumenti/misure.mjs (soglie e significato in QUALITA.md §10). Un avviso va guardato nel fotogramma.', ''];
let avvisi = 0;
for (const s of scelti) {
  const composition = await selectComposition({ serveUrl, id: `${film}--${s.id}`, browserExecutable, chromiumOptions });
  const png = {};
  // Un fotogramma per istante (quelli dei revisori e quelli delle misure), reso una volta sola.
  const frameDi = (sec) => Math.min(Math.round(sec * 30), composition.durationInFrames - 1);
  for (const sec of [...s.t, ...s.m]) {
    const fr = frameDi(sec);
    if (png[fr]) continue;
    png[fr] = `${tmp}/${s.id}-${fr}.png`;
    await renderStill({ serveUrl, composition, frame: fr, output: png[fr], browserExecutable, chromiumOptions, scale: 0.5 });
  }
  const files = s.t.map((sec) => png[frameDi(sec)]);
  if (s.m.length) {
    const cache = {};
    const f = (sec) => (cache[frameDi(sec)] ??= grigio(png[frameDi(sec)]));
    const r = s.c ? misuraCapitolo(s.c, s.q, f) : misuraCopertina(f);
    const valori = s.c
      ? `metà bassa ${r.v.basso.toFixed(1)} · dettaglio centro ${r.v.centro.toFixed(1)} · moto ${r.v.moto.toFixed(2)}% · camera ${r.v.camera.toFixed(1)}% · eventi per frase ${r.v.eventi.map((x) => x.toFixed(1)).join(' / ')}%`
      : `luminanza fotogramma 0 ${r.v.luce.toFixed(0)} · cambio 0→1 s ${r.v.entrata.toFixed(0)}% · contrasto miniatura ${r.v.contrasto.toFixed(0)} · cambio 0→3 s ${r.v.primi3.toFixed(1)}%`;
    misure.push(`## ${s.id}: ${r.A.length ? 'DA GUARDARE' : 'ok'}`, '', valori, '', ...r.A.map((x) => `- ${x}`), ...(r.A.length ? [''] : []));
    for (const x of r.A) console.log(`   ! ${s.id}: ${x}`);
    avvisi += r.A.length;
  }
  const ff = spawnSync('ffmpeg', ['-loglevel', 'error', '-y', ...files.flatMap((f) => ['-i', f]), '-filter_complex', `hstack=${files.length}`, `${dir}/${s.id}.png`]);
  if (ff.status !== 0) { console.error(String(ff.stderr)); process.exit(1); }
  console.log(`${dir}/${s.id}.png  (secondi ${s.t.join(', ')})`);
}
rmSync(tmp, { recursive: true, force: true });
writeFileSync(`${dir}/misure.md`, misure.join('\n'));
console.log(`${dir}/misure.md  (${avvisi ? `${avvisi} avvisi da guardare nei fotogrammi` : 'nessun avviso'})`);

// ---- livelli della musica
if (args.includes('--musica')) {
  const r = spawnSync('node', ['scripts/livelli.mjs', film], { encoding: 'utf8' });
  writeFileSync(`${dir}/livelli.txt`, (r.stdout ?? '') + (r.stderr ?? ''));
  console.log(`${dir}/livelli.txt`);
}
console.log(`Pacchetto pronto in ${dir}/ (tempi.md con gli istanti delle frasi).`);
