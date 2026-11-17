import type { SceneDef } from '../../types';
import { Casa } from './Casa';
import { Cantina } from './Cantina';
import { Orologi } from './Orologi';
import { Presenze } from './Presenze';
import { Carillon } from './Carillon';
import { Warren } from './Warren';
import { Strega } from './Strega';
import { Madri } from './Madri';
import { Prove } from './Prove';
import { Possessione } from './Possessione';
import { Esorcismo } from './Esorcismo';

// Scene di The Conjuring, per id del capitolo (films/the-conjuring.json).
export const THE_CONJURING_SCENES: Record<string, SceneDef> = {
  casa: { Component: Casa, title: { top: 392, size: 100, width: 900 } },
  cantina: { Component: Cantina, title: { top: 392, size: 100, width: 900 } },
  orologi: { Component: Orologi, title: { top: 392, size: 100, width: 900 } },
  presenze: { Component: Presenze, title: { top: 392, size: 100, width: 900 } },
  carillon: { Component: Carillon, title: { top: 392, size: 100, width: 900 } },
  warren: { Component: Warren, title: { top: 392, size: 100, width: 900 } },
  strega: { Component: Strega, title: { top: 392, size: 100, width: 900 } },
  madri: { Component: Madri, title: { top: 392, size: 96, width: 900 } },
  prove: { Component: Prove, title: { top: 392, size: 96, width: 900 } },
  possessione: { Component: Possessione, title: { top: 392, size: 100, width: 900 } },
  esorcismo: { Component: Esorcismo, title: { top: 392, size: 100, width: 900 } },
};
