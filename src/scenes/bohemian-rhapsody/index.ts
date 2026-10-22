import type { SceneDef } from '../../types';
import { Canzone } from './Canzone';
import { Confessione } from './Confessione';
import { Opera } from './Opera';
import { Radio } from './Radio';
import { Registrazione } from './Registrazione';
import { Rock } from './Rock';
import { SecondaVita } from './SecondaVita';
import { Significato } from './Significato';

// Scene di Bohemian Rhapsody, per id del capitolo (films/bohemian-rhapsody.json).
export const BOHEMIAN_RHAPSODY_SCENES: Record<string, SceneDef> = {
  canzone: { Component: Canzone, title: { top: 392, size: 100, width: 900 } },
  registrazione: { Component: Registrazione, title: { top: 392, size: 88, width: 960 } },
  confessione: { Component: Confessione, title: { top: 392, size: 88, width: 600 } },
  opera: { Component: Opera, title: { top: 392, size: 92, width: 760 } },
  rock: { Component: Rock, title: { top: 392, size: 88, width: 600 } },
  significato: { Component: Significato, title: { top: 400, size: 90, width: 980 } },
  radio: { Component: Radio, title: { top: 392, size: 92, width: 640 } },
  'seconda-vita': { Component: SecondaVita, title: { top: 392, size: 100, width: 960 } },
};
