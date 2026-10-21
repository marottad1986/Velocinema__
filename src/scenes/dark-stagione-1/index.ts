import type { SceneDef } from '../../types';
import { makeParete } from './Parete';

// Dark, stagione 1 come schema: ogni capitolo è la stessa parete delle indagini in un altro momento (Parete.tsx).
// Prototipo: per ora i primi tre capitoli; gli altri compaiono come segnaposto.
const title = { top: 392, size: 96, width: 900 };
export const DARK_S1_SCENES: Record<string, SceneDef> = Object.fromEntries(
  ['winden', 'mikkel', 'trentatre'].map((id) => [id, { Component: makeParete(id), title }]),
);
