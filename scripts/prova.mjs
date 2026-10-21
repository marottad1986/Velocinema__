// npm run prova -- <film> <capitolo> [secondi...]
// Salva fotogrammi PNG di un capitolo in out/prova/ (default: 1 s, metà, fine).
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';

const [film, capitolo, ...secs] = process.argv.slice(2);
if (!film || !capitolo) {
  console.error('Uso: npm run prova -- <film> <capitolo> [secondi...]');
  process.exit(1);
}
const data = JSON.parse(readFileSync(`films/${film}.json`, 'utf8'));
const ch = data.capitoli.find((c) => c.id === capitolo) ?? (capitolo === 'copertina' || capitolo === 'finale' ? data[capitolo] : undefined);
if (!ch) {
  console.error(`Capitolo "${capitolo}" non trovato in films/${film}.json`);
  process.exit(1);
}
const times = secs.length ? secs.map(Number) : [1, ch.durata / 2, ch.durata - 0.5];
mkdirSync('out/prova', { recursive: true });
for (const s of times) {
  const frame = Math.min(Math.round(s * 30), ch.durata * 30 - 1);
  const out = `out/prova/${film}--${capitolo}-${String(s).replace('.', '_')}s.png`;
  const res = spawnSync('npx', ['remotion', 'still', 'src/index.ts', `${film}--${capitolo}`, out, `--frame=${frame}`], { stdio: "inherit", shell: process.platform === "win32" });
  if (res.status !== 0) process.exit(res.status ?? 1);
}
