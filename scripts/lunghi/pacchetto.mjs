// node scripts/lunghi/pacchetto.mjs <slug> [--parti id1,id2] [--musica]
//   Materiale per i revisori di un video lungo (VIDEO-LUNGO.md) in out/revisione/<slug>/:
//   <tratto>.png  fotogrammi affiancati (un quarto di risoluzione) a 1 s, poco dopo la 2ª e la 3ª frase e a fine tratto
//                 (copertina/aggancio anche al fotogramma 0 = miniatura); id dei tratti come in tempi.md
//   miniatura.png il fotogramma 0 intero e ridotto a 320×180 (come nei risultati di YouTube)
//   tempi.md      inizio di ogni tratto nel video lungo e istanti delle frasi
//   testi.md      scritte che si sovrappongono (cartelli, titolo, etichetta, sottotitoli), misurate nel browser a metà
//                 di ogni frase di ogni tratto (src/lunghi/MisuraTesti.tsx); --senza-testi per saltarlo
//   livelli.txt   con --musica: loudness della musica per tratto (out/<slug>-musica.wav) e le misure di
//                 scripts/livelli.mjs sullo spartito delle parti nuove (buchi, effetti sopra la musica, colpi coperti)
// --parti limita ai tratti indicati (secondo passaggio). Browser: REMOTION_BROWSER.
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { frasiTratto, loadLungo, mmss, trattiLungo } from './tempi.mjs';

const args = process.argv.slice(2);
const slug = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1] === '--parti'));
if (!slug) { console.error('Uso: node scripts/lunghi/pacchetto.mjs <slug> [--parti a,b] [--musica]'); process.exit(1); }
const iP = args.indexOf('--parti');
const solo = iP >= 0 ? args[iP + 1].split(',') : null;
const L = loadLungo(slug);
const tr = trattiLungo(slug, L);
const dir = `out/revisione/${slug}`;
mkdirSync(dir, { recursive: true });

const frasi = (x) => frasiTratto(x);

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

// ---- scritte sovrapposte (proposta dei revisori immagini e musica, approvata dall'editore il 23 nov 2026)
if (!args.includes('--senza-testi')) {
  const tmpT = `${dir}/tmp-testi`;
  mkdirSync(tmpT, { recursive: true });
  const righeT = [`# Scritte sovrapposte in ${L.titolo_youtube}`, '', 'Due testi visibili (opacità ≥ 0,15, almeno 3 lettere) i cui rettangoli si coprono per più del 15% del più piccolo, misurati poco dopo l\'inizio e a metà di ogni frase. Una scritta della scena coperta dai sottotitoli o dal titolo va spostata.', ''];
  let problemi = 0, misurati = 0, fotogrammi = 0;
  for (const x of tr.filter((y) => !solo || solo.includes(y.id))) {
    if (x.tipo === 'carta' || x.tipo === 'capitolo-episodio' || x.tipo === 'riassunto') continue; // scene degli episodi: già approvate nei loro film
    const composition = await selectComposition({ serveUrl, id: `${slug}--${x.id}`, browserExecutable, chromiumOptions });
    const q = frasi(x);
    const istanti = [...new Set(q.flatMap((s, i) => [s + 0.6, (s + (q[i + 1] ?? x.dur)) / 2]).map((s) => Math.min(x.dur - 0.05, +s.toFixed(2))))];
    const trovati = new Map();
    for (const s of istanti) {
      let misura = null;
      await renderStill({ serveUrl, composition, frame: Math.min(Math.round(s * 30), composition.durationInFrames - 1), output: `${tmpT}/m.png`, browserExecutable, chromiumOptions, scale: 0.1,
        inputProps: { ...composition.props, misura: true },
        onBrowserLog: (log) => { if (log.text.startsWith('MISURA ')) misura = JSON.parse(log.text.slice(7)); } });
      // il riquadro di una riga è più alto delle lettere (interlinea): si stringe del 20% sopra e sotto
      // lettere singole (insegne verticali, iniziali decorative) non sono scritte da leggere: si saltano
      const T = (misura?.testi ?? []).filter((u) => u.testo.replace(/\s/g, '').length > 2).map((u) => ({ ...u, y: u.y + u.h * 0.2, h: u.h * 0.6 }));
      fotogrammi++;
      misurati += T.length;
      for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) {
        const a = T[i], b = T[j];
        const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        if (w <= 0 || h <= 0) continue;
        const quota = (w * h) / Math.min(a.w * a.h, b.w * b.h);
        if (quota < 0.15) continue;
        const k = `«${a.testo}» e «${b.testo}»`;
        if (!trovati.has(k)) trovati.set(k, { s, quota });
      }
    }
    for (const [k, v] of trovati) righeT.push(`- ${x.id}, a ${v.s} s (${mmss(x.start + v.s)}): ${k} si coprono al ${Math.round(v.quota * 100)}%`);
    problemi += trovati.size;
  }
  if (!problemi) righeT.push('Nessuna sovrapposizione trovata.');
  righeT.push('', `(${fotogrammi} fotogrammi, ${misurati} testi misurati in tutto)`);
  rmSync(tmpT, { recursive: true, force: true });
  writeFileSync(`${dir}/testi.md`, righeT.join('\n') + '\n');
  console.log(`${dir}/testi.md  (${problemi} sovrapposizioni)`);
}

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
  // più le misure di scripts/livelli.mjs sullo spartito delle parti nuove (mix, musica, effetti, buchi, colpi)
  const lv = spawnSync('node', ['scripts/livelli.mjs', slug], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  out.push('', '# Spartito delle parti nuove (node scripts/livelli.mjs)', (lv.stdout ?? '') + (lv.stderr ?? ''));
  writeFileSync(`${dir}/livelli.txt`, out.join('\n') + '\n');
  console.log(`${dir}/livelli.txt`);
}
console.log(`Pacchetto pronto in ${dir}/`);
