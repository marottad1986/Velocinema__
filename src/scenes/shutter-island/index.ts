import type { SceneDef } from '../../types';
import { Arrivo } from './Arrivo';
import { Biglietto } from './Biglietto';
import { Cella } from './Cella';
import { Incendio } from './Incendio';
import { Uragano } from './Uragano';
import { Grotta } from './Grotta';
import { Lavagna } from './Lavagna';
import { Verita } from './Verita';
import { Alba } from './Alba';
import { Ospedale } from './Ospedale';
import { Studio } from './Studio';

// Scene ricostruite di Shutter Island, per id del capitolo (films/shutter-island.json).
export const SHUTTER_ISLAND_SCENES: Record<string, SceneDef> = {
  arrivo: { Component: Arrivo, title: { top: 400, size: 112 } },
  biglietto: { Component: Biglietto, title: { top: 400, size: 112 } },
  cella: { Component: Cella, title: { top: 384, size: 104 } },
  incendio: { Component: Incendio, title: { top: 384, size: 108 } },
  uragano: { Component: Uragano, title: { top: 384, size: 108 } },
  grotta: { Component: Grotta, title: { top: 384, size: 108 } },
  lavagna: { Component: Lavagna, title: { top: 392, size: 100 } },
  verita: { Component: Verita, title: { top: 392, size: 112 } },
  alba: { Component: Alba, title: { top: 392, size: 112 } },
  ospedale: { Component: Ospedale, title: { top: 400, size: 112 } },
  studio: { Component: Studio, title: { top: 392, size: 96, width: 760 } },
};
