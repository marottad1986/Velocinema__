import type { SceneDef } from '../../types';
import { Cornice } from './Cornice';
import { Miglio } from './Miglio';
import { Coffey } from './Coffey';
import { Percy } from './Percy';
import { Guarigione } from './Guarigione';
import { Spugna } from './Spugna';
import { Melinda } from './Melinda';
import { Wharton } from './Wharton';
import { Verita } from './Verita';

// Scene del Miglio verde, per id del capitolo (films/il-miglio-verde.json).
export const IL_MIGLIO_VERDE_SCENES: Record<string, SceneDef> = {
  cornice: { Component: Cornice, title: { top: 392, size: 100, width: 900 } },
  miglio: { Component: Miglio, title: { top: 392, size: 100, width: 900 } },
  coffey: { Component: Coffey, title: { top: 392, size: 100, width: 900 } },
  percy: { Component: Percy, title: { top: 392, size: 92, width: 900 } },
  guarigione: { Component: Guarigione, title: { top: 392, size: 100, width: 900 } },
  spugna: { Component: Spugna, title: { top: 392, size: 100, width: 900 } },
  melinda: { Component: Melinda, title: { top: 392, size: 96, width: 900 } },
  wharton: { Component: Wharton, title: { top: 392, size: 100, width: 900 } },
  verita: { Component: Verita, title: { top: 392, size: 100, width: 900 } },
};
