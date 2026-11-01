import type { SceneDef } from '../../types';
import { Ambra } from './Ambra';
import { Esperti } from './Esperti';
import { Laboratorio } from './Laboratorio';
import { Visita } from './Visita';
import { Sabotaggio } from './Sabotaggio';
import { Trex } from './Trex';
import { Notte } from './Notte';
import { Uova } from './Uova';
import { Corrente } from './Corrente';
import { Cucina } from './Cucina';
import { Fuga } from './Fuga';

// Scene di Jurassic Park, per id del capitolo (films/jurassic-park.json).
export const JURASSIC_PARK_SCENES: Record<string, SceneDef> = {
  ambra: { Component: Ambra, title: { top: 392, size: 100, width: 900 } },
  esperti: { Component: Esperti, title: { top: 392, size: 108, dark: true } },
  laboratorio: { Component: Laboratorio, title: { top: 392, size: 108, dark: true } },
  visita: { Component: Visita, title: { top: 392, size: 108 } },
  sabotaggio: { Component: Sabotaggio, title: { top: 392, size: 108 } },
  trex: { Component: Trex, title: { top: 392, size: 108 } },
  notte: { Component: Notte, title: { top: 392, size: 100, width: 900 } },
  uova: { Component: Uova, title: { top: 392, size: 108, dark: true } },
  corrente: { Component: Corrente, title: { top: 392, size: 108 } },
  cucina: { Component: Cucina, title: { top: 392, size: 108 } },
  fuga: { Component: Fuga, title: { top: 392, size: 108 } },
};
