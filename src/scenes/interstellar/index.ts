import type { SceneDef } from '../../types';
import { Terra } from './Terra';
import { Fantasma } from './Fantasma';

// Scene di Interstellar, per id del capitolo (films/interstellar.json).
export const INTERSTELLAR_SCENES: Record<string, SceneDef> = {
  terra: { Component: Terra, title: { top: 392, size: 108, dark: true } },
  fantasma: { Component: Fantasma, title: { top: 392, size: 108 } },
};
