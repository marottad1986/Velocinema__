import type { SceneDef } from '../../types';
import { Panem } from './Panem';
import { Mietitura } from './Mietitura';
import { Pane } from './Pane';
import { Fiamme } from './Fiamme';

// Scene di Hunger Games, per id del capitolo (films/hunger-games.json).
export const HUNGER_GAMES_SCENES: Record<string, SceneDef> = {
  panem: { Component: Panem, title: { top: 392, size: 104, width: 900 } },
  mietitura: { Component: Mietitura, title: { top: 392, size: 104, width: 900 } },
  pane: { Component: Pane, title: { top: 392, size: 104, width: 900 } },
  fiamme: { Component: Fiamme, title: { top: 392, size: 104, width: 900 } },
};
