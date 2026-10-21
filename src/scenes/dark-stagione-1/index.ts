import type { SceneDef } from '../../types';
import { Citta } from './Citta';
import { Bosco } from './Bosco';
import { Grotta } from './Grotta';
import { Ospedale } from './Ospedale';
import { Lettera } from './Lettera';
import { Bunker } from './Bunker';
import { Bottega } from './Bottega';
import { Bivio } from './Bivio';
import { Fine } from './Fine';

// Scene di Dark, stagione 1, per id del capitolo (films/dark-stagione-1.json).
export const DARK_S1_SCENES: Record<string, SceneDef> = {
  winden: { Component: Citta, title: { top: 392, size: 100, width: 660 } },
  mikkel: { Component: Bosco, title: { top: 392, size: 104, width: 760 } },
  trentatre: { Component: Grotta, title: { top: 392, size: 100, width: 640 } },
  michael: { Component: Ospedale, title: { top: 400, size: 104 } },
  padre: { Component: Lettera, title: { top: 400, size: 104 } },
  noah: { Component: Bunker, title: { top: 392, size: 100, width: 720 } },
  straniero: { Component: Bottega, title: { top: 392, size: 100, width: 640 } },
  scelta: { Component: Bivio, title: { top: 400, size: 90, width: 1000 } },
  fine: { Component: Fine, title: { top: 392, size: 100, width: 800 } },
};
