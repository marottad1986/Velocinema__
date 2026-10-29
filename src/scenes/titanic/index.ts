import type { SceneDef } from '../../types';
import { Relitto } from './Relitto';
import { Rose } from './Rose';
import { Imbarco } from './Imbarco';
import { Poppa } from './Poppa';
import { Festa } from './Festa';
import { Prua } from './Prua';
import { Iceberg } from './Iceberg';
import { Manette } from './Manette';
import { Scialuppa } from './Scialuppa';
import { Naufragio } from './Naufragio';
import { Cuore } from './Cuore';

// Scene di Titanic, per id del capitolo (films/titanic.json).
export const TITANIC_SCENES: Record<string, SceneDef> = {
  relitto: { Component: Relitto, title: { top: 392, size: 100, width: 900 } },
  rose: { Component: Rose, title: { top: 392, size: 100, width: 900 } },
  imbarco: { Component: Imbarco, title: { top: 392, size: 100, width: 900, dark: true } },
  poppa: { Component: Poppa, title: { top: 392, size: 100, width: 900 } },
  festa: { Component: Festa, title: { top: 392, size: 100, width: 900 } },
  prua: { Component: Prua, title: { top: 392, size: 108 } },
  iceberg: { Component: Iceberg, title: { top: 392, size: 108 } },
  manette: { Component: Manette, title: { top: 392, size: 96, width: 900 } },
  scialuppa: { Component: Scialuppa, title: { top: 392, size: 96, width: 900 } },
  naufragio: { Component: Naufragio, title: { top: 392, size: 100, width: 900 } },
  cuore: { Component: Cuore, title: { top: 392, size: 100, width: 900 } },
};
