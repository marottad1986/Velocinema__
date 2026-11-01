import type { SceneDef } from '../../types';
import { Villa } from './Villa';
import { Luce } from './Luce';
import { Domestici } from './Domestici';
import { Pianoforte } from './Pianoforte';
import { Album } from './Album';
import { Marito } from './Marito';
import { Tende } from './Tende';
import { Tombe } from './Tombe';
import { Seduta } from './Seduta';
import { Verita } from './Verita';
import { Fine } from './Fine';

// Scene di The Others, per id del capitolo (films/the-others.json).
export const THE_OTHERS_SCENES: Record<string, SceneDef> = {
  villa: { Component: Villa, title: { top: 392, size: 104, width: 900 } },
  luce: { Component: Luce, title: { top: 392, size: 104, width: 900 } },
  domestici: { Component: Domestici, title: { top: 392, size: 100, width: 900 } },
  pianoforte: { Component: Pianoforte, title: { top: 392, size: 104, width: 900 } },
  album: { Component: Album, title: { top: 392, size: 104, width: 900 } },
  marito: { Component: Marito, title: { top: 392, size: 104, width: 900 } },
  tende: { Component: Tende, title: { top: 392, size: 104, width: 900 } },
  tombe: { Component: Tombe, title: { top: 392, size: 100, width: 900 } },
  seduta: { Component: Seduta, title: { top: 392, size: 104, width: 900 } },
  verita: { Component: Verita, title: { top: 392, size: 104, width: 900 } },
  fine: { Component: Fine, title: { top: 392, size: 104, width: 900, dark: true } },
};
