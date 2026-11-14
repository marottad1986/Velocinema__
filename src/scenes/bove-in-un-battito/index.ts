import type { SceneDef } from '../../types';
import { Roma } from './Roma';
import { Firenze } from './Firenze';
import { Minuto17 } from './Minuto17';

// Scene della storia di Edoardo Bove, per id del capitolo (films/bove-in-un-battito.json).
export const BOVE_SCENES: Record<string, SceneDef> = {
  firenze: { Component: Firenze, title: { top: 392, size: 104, width: 900 } },
  'minuto-17': { Component: Minuto17, title: { top: 392, size: 104, width: 900 } },
  roma: { Component: Roma, title: { top: 392, size: 104, width: 900 } },
};
