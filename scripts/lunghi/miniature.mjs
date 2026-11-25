// node scripts/lunghi/miniature.mjs <slug>
//   Le miniature per «Testa e confronta» di YouTube (YOUTUBE.md §1): A = fotogramma 0 del lungo (con "sigla": true il primo
//   fotogramma dopo la sigla, cioè l'inizio dell'aggancio), poi le miniature in più
//   registrate nella scena del lungo (`miniature` in src/lunghi/<slug>/index.ts), in out/<slug>-miniatura-<x>.png a 1280×720.
// Browser: REMOTION_BROWSER (in un ambiente cloud il Chromium installato).
import { bundle } from '@remotion/bundler';
import { getCompositions, renderStill } from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import { SIGLA_DURATA } from '../audio/sigla-2m-studios.mjs';

const slug = process.argv[2];
if (!slug) { console.error('Uso: node scripts/lunghi/miniature.mjs <slug>'); process.exit(1); }
const serveUrl = await bundle({ entryPoint: path.join(process.cwd(), 'src/lunghi/index.ts') });
const browserExecutable = process.env.REMOTION_BROWSER || undefined;
const comps = await getCompositions(serveUrl, { browserExecutable });
const scale = 1280 / 1920;
const lungo = comps.find((c) => c.id === slug);
const L = JSON.parse(fs.readFileSync(`lunghi/${slug}.json`, 'utf8'));
const frameA = L.sigla ? Math.round(SIGLA_DURATA * lungo.fps) : 0; // mai un fotogramma della sigla
await renderStill({ serveUrl, composition: lungo, frame: frameA, output: `out/${slug}-miniatura-a.png`, browserExecutable, scale });
console.log(`out/${slug}-miniatura-a.png`);
for (const c of comps.filter((x) => x.id.startsWith(`${slug}--miniatura-`))) {
  const out = `out/${slug}-miniatura-${c.id.split('--miniatura-')[1]}.png`;
  await renderStill({ serveUrl, composition: c, frame: 0, output: out, browserExecutable, scale });
  console.log(out);
}
