import type { SceneDef } from '../../types';
import { Seahaven } from './Seahaven';
import { Riflettore } from './Riflettore';
import { Pioggia } from './Pioggia';
import { Radio } from './Radio';
import { Barca } from './Barca';
import { Muro } from './Muro';
import { Inchino } from './Inchino';
import { Padre } from './Padre';
import { Sylvia } from './Sylvia';
import { Figi } from './Figi';
import { Fuga } from './Fuga';

// Scene di The Truman Show, per id del capitolo (films/the-truman-show.json).
export const TRUMAN_SHOW_SCENES: Record<string, SceneDef> = {
  seahaven: { Component: Seahaven, title: { top: 392, size: 108, dark: true } },
  riflettore: { Component: Riflettore, title: { top: 392, size: 108, dark: true } },
  pioggia: { Component: Pioggia, title: { top: 392, size: 108, dark: true } },
  radio: { Component: Radio, title: { top: 400, size: 108, dark: true } },
  barca: { Component: Barca, title: { top: 384, size: 108 } },
  muro: { Component: Muro, title: { top: 384, size: 108, dark: true } },
  inchino: { Component: Inchino, title: { top: 384, size: 108 } },
  padre: { Component: Padre, title: { top: 392, size: 108 } },
  sylvia: { Component: Sylvia, title: { top: 392, size: 108 } },
  figi: { Component: Figi, title: { top: 372, size: 100, dark: true } },
  fuga: { Component: Fuga, title: { top: 392, size: 108 } },
};
