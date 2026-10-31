import type { SceneDef } from '../../types';
import { Gotham } from './Gotham';
import { Risata } from './Risata';
import { Pistola } from './Pistola';
import { Metro } from './Metro';
import { Madre } from './Madre';
import { Verita } from './Verita';
import { Sola } from './Sola';
import { Murray } from './Murray';
import { Scalinata } from './Scalinata';
import { Diretta } from './Diretta';
import { Rivolta } from './Rivolta';

// Scene di Joker, per id del capitolo (films/joker.json).
export const JOKER_SCENES: Record<string, SceneDef> = {
  gotham: { Component: Gotham, title: { top: 392, size: 100, width: 900 } },
  risata: { Component: Risata, title: { top: 392, size: 96, width: 900 } },
  pistola: { Component: Pistola, title: { top: 392, size: 100, width: 900 } },
  metro: { Component: Metro, title: { top: 392, size: 100, width: 900 } },
  madre: { Component: Madre, title: { top: 392, size: 100, width: 900 } },
  verita: { Component: Verita, title: { top: 392, size: 100, width: 900 } },
  sola: { Component: Sola, title: { top: 392, size: 108 } },
  murray: { Component: Murray, title: { top: 392, size: 100, width: 900 } },
  scalinata: { Component: Scalinata, title: { top: 392, size: 96, width: 900 } },
  diretta: { Component: Diretta, title: { top: 392, size: 108 } },
  rivolta: { Component: Rivolta, title: { top: 392, size: 108 } },
};
