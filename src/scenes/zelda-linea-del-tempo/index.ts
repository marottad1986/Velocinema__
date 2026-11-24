import type { SceneDef } from '../../types';
import film from '../../../films/zelda-linea-del-tempo.json';
import { makeMondo } from './Mondo';

// Zelda come mondo unico a tutto schermo (Mondo.tsx): ogni capitolo è lo stesso mondo in un altro punto e momento.
// Titolo piccolo in alto, chiaro sulla velatura scura, così il mondo resta libero tra il titolo e i sottotitoli.
const title = { top: 380, size: 64, width: 960 };
export const ZELDA_SCENES: Record<string, SceneDef> = Object.fromEntries(
  film.capitoli.map((c) => [c.id, { Component: makeMondo(c.id), title }]),
);
