import type { SceneDef } from '../../types';
import { ComeFunziona } from './ComeFunziona';
import { Selezioni } from './Selezioni';
import { RegoleLive } from './RegoleLive';
import { Ripescaggio } from './Ripescaggio';
import { makeBallottaggio } from '../talent/Ballottaggio';
import { makeTabellone } from '../talent/Tabellone';
import { makeSquadre } from '../talent/Squadre';

// Scene di X Factor 2026 (recupero fino al Live 3), per id del capitolo (films/x-factor-2026.json).
// Vocabolario e studio comuni in src/scenes/talent/ (TALENT.md).
const title = { top: 392, size: 84, width: 900 };
export const X_FACTOR_2026_SCENES: Record<string, SceneDef> = {
  'come-funziona': { Component: ComeFunziona, title },
  selezioni: { Component: Selezioni, title },
  squadre: { Component: makeSquadre({ dopoLive: 0 }), title },
  'regole-live': { Component: RegoleLive, title },
  'live-1': { Component: makeBallottaggio({ live: 1, id: 'b1', fondo: 'conduttrice' }), title },
  ripescaggio: { Component: Ripescaggio, title },
  'live-2': { Component: makeBallottaggio({ live: 2, id: 'b2' }), title },
  'live-3': { Component: makeBallottaggio({ live: 3, id: 'b3', jukebox: true }), title },
  'chi-resta': { Component: makeTabellone({ dopoLive: 3, prossimo: 'LIVE 4 · GIOVEDÌ 12 NOVEMBRE', avviso: 'ESCONO IN 3' }), title: { top: 392, size: 74, width: 900 } },
};
