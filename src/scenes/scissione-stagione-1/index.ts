import type { SceneDef } from '../../types';
import film from '../../../films/scissione-stagione-1.json';
import { makePiani } from './Piani';

// Scissione (stagione 1) come schema: ogni capitolo è lo stesso spaccato del piano diviso in un altro momento (Piani.tsx).
// Titolo piccolo in alto, così lo schema sta tra il titolo e i sottotitoli.
const title = { top: 380, size: 64, width: 960 };
export const SCISSIONE_1_SCENES: Record<string, SceneDef> = Object.fromEntries(
  film.capitoli.map((c) => [c.id, { Component: makePiani(c.id), title }]),
);
