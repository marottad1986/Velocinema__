import type { SceneDef } from '../../types';
import film from '../../../films/zelda-linea-del-tempo.json';
import { makeSchema } from './Schema';

// Zelda come schema: ogni capitolo è la stessa pergamena miniata in un altro momento (Schema.tsx).
// Titolo piccolo in alto, scuro sulla pergamena, così lo schema sta tra il titolo e i sottotitoli.
const title = { top: 380, size: 64, width: 960, dark: true };
export const ZELDA_SCENES: Record<string, SceneDef> = Object.fromEntries(
  film.capitoli.map((c) => [c.id, { Component: makeSchema(c.id), title }]),
);
