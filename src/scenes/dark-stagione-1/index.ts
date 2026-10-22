import type { SceneDef } from '../../types';
import { makeAlbero } from './Albero';

// Dark, stagione 1 come schema: ogni capitolo è lo stesso albero che si annoda in un altro momento (Albero.tsx).
// Titolo piccolo in alto, così l'albero intero sta tra il titolo e i sottotitoli.
const title = { top: 380, size: 64, width: 960 };
export const DARK_S1_SCENES: Record<string, SceneDef> = Object.fromEntries(
  ['winden', 'mikkel', 'trentatre', 'michael', 'noah', 'straniero', 'scelta', 'inizio', 'fine'].map((id) => [id, { Component: makeAlbero(id), title }]),
);
