import type { SceneDef } from '../../types';
import { Stazione } from './Stazione';
import { Creazione } from './Creazione';

// Scene di Frankenstein Junior, per id del capitolo (films/frankenstein-junior.json).
export const FRANKENSTEIN_JUNIOR_SCENES: Record<string, SceneDef> = {
  stazione: { Component: Stazione, title: { top: 392, size: 108 } },
  creazione: { Component: Creazione, title: { top: 392, size: 108 } },
};
