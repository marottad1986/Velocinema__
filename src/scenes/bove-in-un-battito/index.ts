import type { SceneDef } from '../../types';
import { Roma } from './Roma';
import { Firenze } from './Firenze';
import { Careggi } from './Careggi';
import { Defibrillatore } from './Defibrillatore';
import { Regola } from './Regola';
import { Minuto17 } from './Minuto17';

// Scene della storia di Edoardo Bove, per id del capitolo (films/bove-in-un-battito.json).
export const BOVE_SCENES: Record<string, SceneDef> = {
  firenze: { Component: Firenze, title: { top: 392, size: 104, width: 900 } },
  'minuto-17': { Component: Minuto17, title: { top: 392, size: 104, width: 900 } },
  careggi: { Component: Careggi, title: { top: 392, size: 104, width: 900 } },
  defibrillatore: { Component: Defibrillatore, title: { top: 392, size: 104, width: 900, dark: true } },
  regola: { Component: Regola, title: { top: 392, size: 96, width: 860 } },
  roma: { Component: Roma, title: { top: 392, size: 104, width: 900 } },
};
