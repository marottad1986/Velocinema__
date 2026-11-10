import type { SceneDef } from '../../types';
import { Panem } from './Panem';
import { Mietitura } from './Mietitura';
import { Pane } from './Pane';
import { Fiamme } from './Fiamme';
import { Cornucopia } from './Cornucopia';
import { Vespe } from './Vespe';
import { Rue } from './Rue';
import { Fiori } from './Fiori';
import { Grotta } from './Grotta';
import { Cani } from './Cani';

// Scene di Hunger Games, per id del capitolo (films/hunger-games.json).
export const HUNGER_GAMES_SCENES: Record<string, SceneDef> = {
  panem: { Component: Panem, title: { top: 392, size: 104, width: 900 } },
  mietitura: { Component: Mietitura, title: { top: 392, size: 104, width: 900 } },
  pane: { Component: Pane, title: { top: 392, size: 104, width: 900 } },
  fiamme: { Component: Fiamme, title: { top: 392, size: 104, width: 900 } },
  cornucopia: { Component: Cornucopia, title: { top: 392, size: 104, width: 900 } },
  vespe: { Component: Vespe, title: { top: 392, size: 104, width: 900 } },
  rue: { Component: Rue, title: { top: 392, size: 104, width: 900 } },
  fiori: { Component: Fiori, title: { top: 392, size: 104, width: 900 } },
  grotta: { Component: Grotta, title: { top: 392, size: 104, width: 900 } },
  cani: { Component: Cani, title: { top: 392, size: 104, width: 900 } },
};
