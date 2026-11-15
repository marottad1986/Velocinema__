import type { SceneDef } from '../../types';
import { makeMappa } from './Mappa';

// GTA VI come schema: ogni capitolo è la stessa mappa di Leonida in un altro momento (Mappa.tsx).
// Titolo piccolo in alto, così la mappa sta tra il titolo e i sottotitoli.
const title = { top: 380, size: 64, width: 960 };
export const GTA_VI_SCENES: Record<string, SceneDef> = Object.fromEntries(
  ['mappa', 'vicecity', 'coppia', 'colpo', 'insieme', 'profilo', 'personaggi', 'satira', 'uscita', 'edizioni'].map((id) => [id, { Component: makeMappa(id), title }]),
);
