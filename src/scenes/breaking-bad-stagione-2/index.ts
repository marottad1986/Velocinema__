import type { SceneDef } from '../../types';
import { Rapimento } from './Rapimento';
import { Campanello } from './Campanello';
import { Hank } from './Hank';
import { Fuga } from './Fuga';
import { Bancomat } from './Bancomat';
import { Saul } from './Saul';
import { Gus } from './Gus';

// Scene di Breaking Bad, stagione 2, per id del capitolo (films/breaking-bad-stagione-2.json).
export const BREAKING_BAD_2_SCENES: Record<string, SceneDef> = {
  rapimento: { Component: Rapimento, title: { top: 392, size: 104, width: 900 } },  campanello: { Component: Campanello, title: { top: 392, size: 100, width: 900 } },  hank: { Component: Hank, title: { top: 392, size: 104, width: 900 } },  fuga: { Component: Fuga, title: { top: 392, size: 96, width: 900 } },  bancomat: { Component: Bancomat, title: { top: 392, size: 104, width: 900 } },  saul: { Component: Saul, title: { top: 392, size: 104, width: 900 } },  gus: { Component: Gus, title: { top: 392, size: 96, width: 900 } },
};
