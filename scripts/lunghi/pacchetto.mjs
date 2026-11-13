// node scripts/lunghi/pacchetto.mjs <slug> [--parti id1,id2] [--musica]
//   Materiale per i revisori di un video lungo (VIDEO-LUNGO.md) in out/revisione/<slug>/:
//   <tratto>.png  fotogrammi affiancati (un quarto di risoluzione) a 1 s, poco dopo la 2ª e la 3ª frase e a fine tratto
//                 (copertina/aggancio anche al fotogramma 0 = miniatura); id dei tratti come in tempi.md
//   miniatura.png il fotogramma 0 intero e ridotto a 320×180 (come nei risultati di YouTube)
//   tempi.md      inizio di ogni tratto nel video lungo e istanti delle frasi
//   livelli.txt   con --musica: loudness della musica per tratto (out/<slug>-musica.wav)
// --parti limita ai tratti indicati (secondo passaggio). Browser: REMOTION_BROWSER.
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { loadLungo, mmss, trattiLungo } from './tempi.mjs';

const args = process.argv.slice(2);
const slug = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1] === '--parti'));
if (!slug) { console.error('Uso: node scripts/lunghi/pacchetto.mjs <slug> [--parti a,b] [--musica]'); process.exit(1); }
const iP = args.indexOf('--parti');
const solo = iP >= 0 ? args[iP + 1].split(',') : null;
const L = loadLungo(slug);
const tr = trattiLungo(slug, L);
const dir = `out/revisione/${slug}`;
mkdirSync(dir, { recursive: true });

const frasi = (x) => {
  const inizio = x.tipo === 'aggancio' ? 0.4 : 0;
  const w = x.testo.map((l) => l.length + 6);
  const tot = w.reduce((a, b) => a + b, 0);
  let cur = 0.15;
  return w.map((v) => { const s = inizio + cur; cur += (v / tot) * (x.dur - inizio - 0.35); return s; });
};

// ---- tempi.md
const righe = [`# Tempi di ${L.titolo_youtube}`, '', 'Istanti in secondi: relativi al tratto (assoluti nel video lungo tra parentesi).', ''];
for (const x of tr) {
  righe.push(`## ${x.id} · ${x.tipo}${x.capitolo ? ` · «${x.capitolo.titolo}»` : ''} · da ${x.start} s (${mmss(x.start)}), ${x.dur} s`);
  frasi(x).forEach((s, i) => righe.push(`- frase ${i} a ${s.toFixed(2)} (${(x.start + s).toFixed(2)}): ${x.testo[i]}`));
  righe.push('');
}
writeFileSync(`${dir}/tempi.md`, righe.join('\n'));

// ---- fotogrammi
const serveUrl = await bundle({ entryPoint: path.join(process.cwd(), 'src/lunghi/index.ts') });
const browserExecutable = process.env.REMOTION_BROWSER || undefined;
const chromiumOptions = { ignoreCertificateErrors: !!process.env.REMOTION_IGNORA_CERTIFICATI };
const tmp = `${dir}/tmp`;
mkdirSync(tmp, { recursive: true });
const ff = (argv) => { const r = spawnSync('ffmpeg', ['-loglevel', 'error', '-y', ...argv]); if (r.status !== 0) { console.error(String(r.stderr)); process.exit(1); } };
for (const x of tr.filter((y) => !solo || solo.includes(y.id))) {
  const composition = await selectComposition({ serveUrl, id: `${slug}--${x.id}`, browserExecutable, chromiumOptions });
  const q = frasi(x);
  const t = x.tipo === 'aggancio' ? [0, 2, (q[2] ?? 6) + 1.2, (q[4] ?? 12) + 1.2, x.dur - 0.5]
    : x.tipo === 'carta' || x.tipo === 'riassunto' ? [0.2, 1.5, x.dur - 0.3]
    : [1, (q[1] ?? x.dur / 2) + 1.0, (q[2] ?? x.dur * 0.75) + 1.2, x.dur - 0.5];
  const secs = [...new Set(t.map((s) => Math.min(x.dur - 0.05, +s.toFixed(2))))];
  const files = [];
  for (const s of secs) {
    const output = `${tmp}/${x.id}-${s}.png`;
    await renderStill({ serveUrl, composition, frame: Math.min(Math.round(s * 30), composition.durationInFrames - 1), output, browserExecutable, chromiumOptions, scale: x.tipo === 'aggancio' && s === 0 ? 1 : 0.25 });
    if (x.tipo === 'aggancio' && s === 0) {
      ff(['-i', output, `${dir}/miniatura.png`]);
      ff(['-i', output, '-vf', 'scale=320:180', `${dir}/miniatura-320.png`]);
      ff(['-i', output, '-vf', 'scale=480:270', `${tmp}/${x.id}-0r.png`]);
      files.push(`${tmp}/${x.id}-0r.png`);
    } else files.push(output);
  }
  ff([...files.flatMap((f) => ['-i', f]), '-filter_complex', `hstack=${files.length}`, `${dir}/${x.id}.png`]);
  console.log(`${dir}/${x.id}.png  (${mmss(x.start)} · secondi ${secs.join(', ')})`);
}
rmSync(tmp, { recursive: true, force: true });

// ---- livelli della musica per tratto
if (args.includes('--musica')) {
  const wav = `out/${slug}-musica.wav`;
  if (!existsSync(wav)) { console.error(`Manca ${wav}: node scripts/lunghi/render.mjs ${slug} --solo-audio`); process.exit(1); }
  const out = ['tratto                                      inizio   LUFS   picco'];
  for (const x of tr) {
    const r = spawnSync('ffmpeg', ['-hide_banner', '-ss', String(x.start), '-t', String(x.dur), '-i', wav, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' });
    const sum = r.stderr.slice(r.stderr.lastIndexOf('Summary:'));
    out.push(`${x.id.padEnd(42)} ${mmss(x.start).padStart(6)} ${(sum.match(/I:\s+(-?[\d.]+)/)?.[1] ?? '?').padStart(6)} ${(sum.match(/Peak:\s+(-?[\d.]+)/)?.[1] ?? '?').padStart(6)}`);
  }
  writeFileSync(`${dir}/livelli.txt`, out.join('\n') + '\n');
  console.log(`${dir}/livelli.txt`);
}
console.log(`Pacchetto pronto in ${dir}/`);
