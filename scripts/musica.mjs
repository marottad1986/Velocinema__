// npm run musica -- <film> → out/<film>-musica.wav (colonna sonora originale, generata in modo deterministico)
// Lo spartito di ogni film sta in scripts/audio/<film>.mjs; i tempi vengono dal JSON del film.
import { existsSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { createMix, writeWav } from './audio/synth.mjs';
import { impulso, convolvi } from './audio/sala.mjs';
import { scaricaCampioni } from './audio/campioni.mjs';
import { scaricaEffetti } from './audio/effetti.mjs';
import { loadFilm, timeline } from './audio/film.mjs';

/** Genera la musica del film; restituisce il percorso del WAV, o null se il film non ha uno spartito. */
export const generaMusica = async (slug) => {
  const scorePath = `scripts/audio/${slug}.mjs`;
  if (!existsSync(scorePath)) return null;
  const { T } = timeline(loadFilm(slug));
  // uno spartito può esportare: strumenti (campioni VSCO), effetti (registrazioni) e sala (riverbero a convoluzione)
  const { default: score, strumenti = [], effetti = [], sala } = await import(pathToFileURL(scorePath).href);
  scaricaCampioni(strumenti);
  scaricaEffetti(effetti);
  const mix = createMix(T.END);
  score(mix, T);
  mkdirSync('out', { recursive: true });
  const out = `out/${slug}-musica.wav`;
  const ir = sala && impulso(sala);
  writeWav(mix, out, { peakDb: -3, fadeOut: 2, ...(ir && { wet: sala.wet ?? 0.5, riverbero: (ch, side) => convolvi(ch, ir[side]) }) });
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
