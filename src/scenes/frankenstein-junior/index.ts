import type { SceneDef } from '../../types';
import { Lezione } from './Lezione';
import { Stazione } from './Stazione';
import { Castello } from './Castello';
import { Libreria } from './Libreria';
import { Cervello } from './Cervello';
import { Eremita } from './Eremita';
import { Teatro } from './Teatro';
import { Elizabeth } from './Elizabeth';
import { Creazione } from './Creazione';

// Scene di Frankenstein Junior, per id del capitolo (films/frankenstein-junior.json).
export const FRANKENSTEIN_JUNIOR_SCENES: Record<string, SceneDef> = {
  lezione: { Component: Lezione, title: { top: 392, size: 108 } },
  stazione: { Component: Stazione, title: { top: 392, size: 108 } },
  castello: { Component: Castello, title: { top: 392, size: 108 } },
  libreria: { Component: Libreria, title: { top: 392, size: 108 } },
  cervello: { Component: Cervello, title: { top: 392, size: 108 } },
  creazione: { Component: Creazione, title: { top: 392, size: 108 } },
  eremita: { Component: Eremita, title: { top: 392, size: 108 } },
  teatro: { Component: Teatro, title: { top: 392, size: 108 } },
  elizabeth: { Component: Elizabeth, title: { top: 392, size: 108 } },
};
