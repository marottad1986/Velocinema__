import type { SceneDef } from '../../types';
import { Amici } from './Amici';
import { Bar } from './Bar';
import { Cantina } from './Cantina';
import { Oggi } from './Oggi';
import { Pavia } from './Pavia';
import { Ricordi } from './Ricordi';
import { Significato } from './Significato';
import { Uscita } from './Uscita';

// Scene di «Gli anni» (883), per id del capitolo (films/gli-anni.json).
export const GLI_ANNI_SCENES: Record<string, SceneDef> = {
  pavia: { Component: Pavia, title: { top: 392, size: 100, width: 900 } },
  cantina: { Component: Cantina, title: { top: 392, size: 92, width: 900 } },
  uscita: { Component: Uscita, title: { top: 392, size: 88, width: 900 } },
  bar: { Component: Bar, title: { top: 392, size: 100, width: 900 } },
  ricordi: { Component: Ricordi, title: { top: 392, size: 92, width: 900, dark: false } },
  amici: { Component: Amici, title: { top: 392, size: 100, width: 900 } },
  significato: { Component: Significato, title: { top: 392, size: 88, width: 900 } },
  oggi: { Component: Oggi, title: { top: 392, size: 100, width: 900 } },
};
