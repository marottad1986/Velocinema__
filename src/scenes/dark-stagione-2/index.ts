import type { SceneDef } from '../../types';
import { makeNodo } from './Nodo';

// Dark, stagione 2 come schema: ogni capitolo è lo stesso nodo in un altro momento (Nodo.tsx).
// Titolo piccolo in alto, così lo schema intero sta tra il titolo e i sottotitoli.
const title = { top: 380, size: 64, width: 960 };
export const DARK_S2_SCENES: Record<string, SceneDef> = Object.fromEntries(
  ['futuro', 'padre', 'setta', 'adam', 'charlotte', 'piano', 'martha', 'fine', 'mondo'].map((id) => [id, { Component: makeNodo(id), title }]),
);
