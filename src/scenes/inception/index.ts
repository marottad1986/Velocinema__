import type { SceneDef } from '../../types';
import { makePiani } from './Piani';

// Inception come schema: ogni capitolo è la stessa torre dei sogni in un altro momento (Piani.tsx).
// Titolo piccolo in alto, così la torre intera sta tra il titolo e i sottotitoli.
const title = { top: 380, size: 64, width: 960 };
export const INCEPTION_SCENES: Record<string, SceneDef> = Object.fromEntries(
  ['estrazione', 'innesto', 'livelli', 'tempo', 'calcio', 'limbo', 'mal', 'missione', 'trottola'].map((id) => [id, { Component: makePiani(id), title }]),
);
