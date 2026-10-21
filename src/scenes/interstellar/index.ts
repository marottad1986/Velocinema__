import type { SceneDef } from '../../types';
import { Terra } from './Terra';
import { Fantasma } from './Fantasma';
import { Nasa } from './Nasa';
import { Partenza } from './Partenza';
import { Varco } from './Varco';
import { Onde } from './Onde';

// Scene di Interstellar, per id del capitolo (films/interstellar.json).
export const INTERSTELLAR_SCENES: Record<string, SceneDef> = {
  terra: { Component: Terra, title: { top: 392, size: 108, dark: true } },
  fantasma: { Component: Fantasma, title: { top: 392, size: 108 } },
  nasa: { Component: Nasa, title: { top: 392, size: 108 } },
  partenza: { Component: Partenza, title: { top: 392, size: 108 } },
  varco: { Component: Varco, title: { top: 392, size: 108 } },
  onde: { Component: Onde, title: { top: 400, size: 88 } },
};
