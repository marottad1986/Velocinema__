import type { SceneDef } from '../../types';
import { Tempo } from './Tempo';
import { Promessa } from './Promessa';
import { Schianto } from './Schianto';
import { Isola } from './Isola';
import { Pacchi } from './Pacchi';
import { Fuoco } from './Fuoco';
import { Anni } from './Anni';
import { Vela } from './Vela';
import { Wilson } from './Wilson';
import { Ritorno } from './Ritorno';
import { Bivio } from './Bivio';

// Scene di Cast Away, per id del capitolo (films/cast-away.json).
export const CAST_AWAY_SCENES: Record<string, SceneDef> = {
  tempo: { Component: Tempo, title: { top: 392, size: 108 } },
  promessa: { Component: Promessa, title: { top: 392, size: 100, width: 760 } },
  schianto: { Component: Schianto, title: { top: 392, size: 108 } },
  isola: { Component: Isola, title: { top: 392, size: 108, dark: true } },
  pacchi: { Component: Pacchi, title: { top: 392, size: 108, dark: true } },
  fuoco: { Component: Fuoco, title: { top: 392, size: 108 } },
  anni: { Component: Anni, title: { top: 392, size: 108 } },
  vela: { Component: Vela, title: { top: 392, size: 108, dark: true } },
  wilson: { Component: Wilson, title: { top: 392, size: 108, dark: true } },
  ritorno: { Component: Ritorno, title: { top: 392, size: 108 } },
  bivio: { Component: Bivio, title: { top: 392, size: 108 } },
};
