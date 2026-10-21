// npm run musica -- <film> → out/<film>-musica.wav (colonna sonora originale, generata in modo deterministico)
// Lo spartito di ogni film sta in scripts/audio/<film>.mjs; i tempi vengono dal JSON del film.
import { existsSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { createMix, writeWav } from './audio/synth.mjs';
import { loadFilm, timeline } from './audio/film.mjs';

/** Genera la musica del film; restituisce il percorso del WAV, o null se il film non ha uno spartito. */
export const generaMusica = async (slug) => {
  const scorePath = `scripts/audio/${slug}.mjs`;
  if (!existsSync(scorePath)) return null;
  const { T } = timeline(loadFilm(slug));
  const { default: score } = await import(pathToFileURL(scorePath).href);
  const mix = createMix(T.END);
  score(mix, T);
  mkdirSync('out', { recursive: true });
  const out = `out/${slug}-musica.wav`;
  writeWav(mix, out, { peakDb: -3, fadeOut: 2 });
  return out;
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Uso: npm run musica -- <film>   es. npm run musica -- shutter-island');
    process.exit(1);
  }
  const out = await generaMusica(slug);
  if (!out) {
    console.error(`Manca lo spartito scripts/audio/${slug}.mjs`);
    process.exit(1);
  }
  console.log(`Musica: ${out}`);
}
