import type { SceneDef } from '../../types';
import { makeTempo } from './Tempo';

// Tenet come schema: ogni capitolo è lo stesso schema del tempo a due binari in un altro momento (Tempo.tsx).
// Titolo piccolo in alto, così lo schema sta tra il titolo e i sottotitoli.
const title = { top: 380, size: 64, width: 960 };
export const TENET_SCENES: Record<string, SceneDef> = Object.fromEntries(
  ['invertiti', 'futuro', 'sator', 'tornello', 'algoritmo', 'battito', 'mascherato', 'tenaglia', 'neil'].map((id) => [id, { Component: makeTempo(id), title }]),
);
