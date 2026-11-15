import type { SceneDef } from '../../types';
import film from '../../../films/ritorno-al-futuro-parte-2.json';
import { makeLinee2 } from './Linee2';

// Ritorno al futuro – Parte II come schema: ogni capitolo è lo stesso schema delle linee del tempo in un altro momento
// (Linee2.tsx). Titolo piccolo in alto, così lo schema sta tra il titolo e i sottotitoli.
const title = { top: 380, size: 64, width: 960 };
export const RITORNO_AL_FUTURO_2_SCENES: Record<string, SceneDef> = Object.fromEntries(
  film.capitoli.map((c) => [c.id, { Component: makeLinee2(c.id), title }]),
);
