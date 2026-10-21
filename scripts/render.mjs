// npm run render -- <film>            → out/<film>.mp4 (video completo, 2:00, con la colonna sonora)
// npm run render -- <film> <capitolo> → out/<film>--<capitolo>.mp4 (un solo capitolo, con il suo tratto di musica)
// La musica è generata da scripts/musica.mjs (out/<film>-musica.wav) e unita al video con ffmpeg.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { generaMusica } from './musica.mjs';
import { loadFilm, run, timeline } from './audio/film.mjs';

const [film, capitolo] = process.argv.slice(2);
if (!film) {
  console.error('Uso: npm run render -- <film> [capitolo]   es. npm run render -- shutter-island');
  process.exit(1);
}
if (!existsSync(`films/${film}.json`)) {
  console.error(`Non trovo films/${film}.json`);
  process.exit(1);
}
mkdirSync('out', { recursive: true });
const id = capitolo ? `${film}--${capitolo}` : film;
const out = `out/${id}.mp4`;
const muto = `out/${id}.muto.mp4`;

const res = spawnSync('npx', ['remotion', 'render', 'src/index.ts', id, muto], { stdio: 'inherit', shell: process.platform === 'win32' });
if (res.status !== 0) process.exit(res.status ?? 1);

const musica = await generaMusica(film);
if (!musica) {
  console.warn(`Nessuno spartito in scripts/audio/${film}.mjs: video senza musica.`);
  rmSync(out, { force: true });
  renameSync(muto, out);
  process.exit(0);
}

// Tratto di musica da usare: tutto il film, oppure solo la finestra del capitolo richiesto
const { T } = timeline(loadFilm(film));
const from = capitolo ? T[capitolo] : 0;
if (from === undefined) {
  console.error(`Capitolo "${capitolo}" non trovato nel JSON`);
  process.exit(1);
}
run('ffmpeg', ['-y', '-v', 'error', '-i', muto, '-ss', String(from), '-i', musica,
  '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', out]);
rmSync(muto);
console.log(`Video con musica: ${out}`);
