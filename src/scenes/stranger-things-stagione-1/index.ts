import type { SceneDef } from '../../types';
import { Capanno } from './Capanno';
import { Laboratorio } from './Laboratorio';
import { Lucine } from './Lucine';
import { Scantinato } from './Scantinato';
import { Cava } from './Cava';
import { Piscina } from './Piscina';

// Scene di Stranger Things, stagione 1, per id del capitolo (films/stranger-things-stagione-1.json).
export const STRANGER_THINGS_1_SCENES: Record<string, SceneDef> = {
  capanno: { Component: Capanno, title: { top: 392, size: 104, width: 900 } },
  piscina: { Component: Piscina, title: { top: 392, size: 104, width: 900 } },
  cava: { Component: Cava, title: { top: 392, size: 104, width: 900 } },
  scantinato: { Component: Scantinato, title: { top: 392, size: 104, width: 900 } },
  lucine: { Component: Lucine, title: { top: 392, size: 104, width: 900 } },
  laboratorio: { Component: Laboratorio, title: { top: 392, size: 100, width: 900 } },
};
