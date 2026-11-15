import type { SceneDef } from '../../types';
import film from '../../../films/donnie-darko.json';
import { makeCopia } from './Copia';

// Donnie Darko come schema: ogni capitolo è lo stesso schema della copia del mondo in un altro momento (Copia.tsx).
// Titolo piccolo in alto, così lo schema sta tra il titolo e i sottotitoli.
const title = { top: 380, size: 64, width: 960 };
export const DONNIE_DARKO_SCENES: Record<string, SceneDef> = Object.fromEntries(
  film.capitoli.map((c) => [c.id, { Component: makeCopia(c.id), title }]),
);
