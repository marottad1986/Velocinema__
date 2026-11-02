import type { SceneDef } from '../../types';
import { Diagnosi } from './Diagnosi';
import { Blitz } from './Blitz';
import { Patto } from './Patto';
import { Deserto } from './Deserto';
import { Gas } from './Gas';
import { Acido } from './Acido';
import { Cantina } from './Cantina';

// Scene di Breaking Bad, stagione 1, per id del capitolo (films/breaking-bad-stagione-1.json).
export const BREAKING_BAD_1_SCENES: Record<string, SceneDef> = {
  diagnosi: { Component: Diagnosi, title: { top: 392, size: 104, width: 900 } },
  blitz: { Component: Blitz, title: { top: 392, size: 104, width: 900 } },
  patto: { Component: Patto, title: { top: 392, size: 100, width: 900 } },
  deserto: { Component: Deserto, title: { top: 392, size: 104, width: 900, dark: true } },
  gas: { Component: Gas, title: { top: 392, size: 104, width: 900 } },
  acido: { Component: Acido, title: { top: 392, size: 104, width: 900 } },
  cantina: { Component: Cantina, title: { top: 392, size: 100, width: 900 } },
};
