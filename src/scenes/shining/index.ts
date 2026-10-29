import type { SceneDef } from '../../types';
import { Custode } from './Custode';
import { Dono } from './Dono';
import { Stanza } from './Stanza';
import { Neve } from './Neve';
import { Bambine } from './Bambine';
import { Bar } from './Bar';
import { Frase } from './Frase';
import { Dispensa } from './Dispensa';
import { Specchio } from './Specchio';
import { Labirinto } from './Labirinto';
import { Foto } from './Foto';

// Scene di Shining, per id del capitolo (films/shining.json).
export const SHINING_SCENES: Record<string, SceneDef> = {
  custode: { Component: Custode, title: { top: 392, size: 100, width: 900 } },
  dono: { Component: Dono, title: { top: 392, size: 108 } },
  stanza: { Component: Stanza, title: { top: 392, size: 108 } },
  neve: { Component: Neve, title: { top: 392, size: 108 } },
  bambine: { Component: Bambine, title: { top: 392, size: 108 } },
  bar: { Component: Bar, title: { top: 392, size: 108 } },
  frase: { Component: Frase, title: { top: 392, size: 108 } },
  dispensa: { Component: Dispensa, title: { top: 392, size: 92, width: 900 } },
  specchio: { Component: Specchio, title: { top: 392, size: 96, width: 900 } },
  labirinto: { Component: Labirinto, title: { top: 392, size: 108 } },
  foto: { Component: Foto, title: { top: 392, size: 108 } },
};
