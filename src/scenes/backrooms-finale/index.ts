import type { SceneDef } from '../../types';
import film from '../../../films/backrooms-finale.json';
import { makeSchema } from './Schema';

// «Backrooms: il finale in 2 minuti» come schema: ogni capitolo è il mondo del lungo visto in 9:16 (Schema.tsx).
// Titolo piccolo in alto, così lo schema sta tra il titolo e i sottotitoli.
const title = { top: 380, size: 64, width: 840 };
export const BACKROOMS_FINALE_SCENES: Record<string, SceneDef> = Object.fromEntries(
  film.capitoli.map((c) => [c.id, { Component: makeSchema(c.id), title }]),
);
