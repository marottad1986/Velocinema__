// node scripts/lunghi/prova.mjs <slug> <secondi...> [--scala 0.5]
//   PNG di fotogrammi del video lungo in out/prova/ (secondi del video intero, es. 0 per la miniatura).
// Browser: REMOTION_BROWSER (in un ambiente cloud il Chromium installato).
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const iScala = args.indexOf('--scala');
const scale = iScala >= 0 ? Number(args[iScala + 1]) : 0.5;
const [slug, ...secs] = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1] === '--scala'));
if (!slug || !secs.length) {
  console.error('Uso: node scripts/lunghi/prova.mjs <slug> <secondi...> [--scala 0.5]');
  process.exit(1);
}
mkdirSync('out/prova', { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(process.cwd(), 'src/lunghi/index.ts') });
const browserExecutable = process.env.REMOTION_BROWSER || undefined;
const chromiumOptions = { ignoreCertificateErrors: !!process.env.REMOTION_IGNORA_CERTIFICATI };
const composition = await selectComposition({ serveUrl, id: slug, browserExecutable, chromiumOptions });
for (const s of secs.map(Number)) {
  const output = `out/prova/${slug}-${String(s).replace('.', '_')}s.png`;
  await renderStill({ serveUrl, composition, frame: Math.min(Math.round(s * 30), composition.durationInFrames - 1), output, browserExecutable, chromiumOptions, scale });
  console.log(output);
}
