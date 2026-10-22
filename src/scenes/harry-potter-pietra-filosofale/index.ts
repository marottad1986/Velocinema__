import type { SceneDef } from '../../types';
import { Sottoscala } from './Sottoscala';
import { Lettere } from './Lettere';
import { Mago } from './Mago';
import { Binario } from './Binario';
import { Castello } from './Castello';
import { Cappello } from './Cappello';
import { Quidditch } from './Quidditch';
import { Cane } from './Cane';
import { Specchio } from './Specchio';
import { Botola } from './Botola';
import { Pietra } from './Pietra';

// Scene di Harry Potter e la pietra filosofale, per id del capitolo (films/harry-potter-pietra-filosofale.json).
export const HARRY_POTTER_1_SCENES: Record<string, SceneDef> = {
  sottoscala: { Component: Sottoscala, title: { top: 392, size: 96, dark: true, width: 900 } },
  lettere: { Component: Lettere, title: { top: 392, size: 108, dark: true } },
  mago: { Component: Mago, title: { top: 392, size: 108 } },
  binario: { Component: Binario, title: { top: 392, size: 92, width: 900 } },
  castello: { Component: Castello, title: { top: 392, size: 108 } },
  cappello: { Component: Cappello, title: { top: 392, size: 100, width: 900 } },
  quidditch: { Component: Quidditch, title: { top: 392, size: 108, dark: true } },
  cane: { Component: Cane, title: { top: 460, size: 100, width: 840 } },
  specchio: { Component: Specchio, title: { top: 392, size: 108 } },
  botola: { Component: Botola, title: { top: 392, size: 108 } },
  pietra: { Component: Pietra, title: { top: 392, size: 100, width: 900 } },
};
