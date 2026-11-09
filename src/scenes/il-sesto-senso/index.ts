import type { SceneDef } from '../../types';
import { Premio } from './Premio';
import { Cole } from './Cole';
import { Anna } from './Anna';
import { Festa } from './Festa';
import { Nastro } from './Nastro';
import { Kyra } from './Kyra';
import { Cassetta } from './Cassetta';
import { Recita } from './Recita';

// Scene di Il sesto senso, per id del capitolo (films/il-sesto-senso.json).
export const IL_SESTO_SENSO_SCENES: Record<string, SceneDef> = {
  cole: { Component: Cole, title: { top: 392, size: 104, width: 900 } },
  anna: { Component: Anna, title: { top: 392, size: 104, width: 900 } },
  festa: { Component: Festa, title: { top: 392, size: 104, width: 900 } },
  nastro: { Component: Nastro, title: { top: 392, size: 104, width: 900 } },
  kyra: { Component: Kyra, title: { top: 392, size: 104, width: 900 } },
  cassetta: { Component: Cassetta, title: { top: 392, size: 104, width: 900 } },
  recita: { Component: Recita, title: { top: 392, size: 104, width: 900 } },
  premio: { Component: Premio, title: { top: 392, size: 104, width: 900 } },
};
