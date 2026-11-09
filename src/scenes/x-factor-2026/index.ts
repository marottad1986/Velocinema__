import type { SceneDef } from '../../types';
import { ComeFunziona } from './ComeFunziona';
import { Selezioni } from './Selezioni';
import { RegoleLive } from './RegoleLive';
import { makeSquadre } from '../talent/Squadre';

// Scene di X Factor 2026 (recupero fino al Live 3), per id del capitolo (films/x-factor-2026.json).
// Vocabolario e studio comuni in src/scenes/talent/ (TALENT.md).
const title = { top: 392, size: 84, width: 900 };
export const X_FACTOR_2026_SCENES: Record<string, SceneDef> = {
  'come-funziona': { Component: ComeFunziona, title },
  selezioni: { Component: Selezioni, title },
  squadre: { Component: makeSquadre({ dopoLive: 0 }), title },
  'regole-live': { Component: RegoleLive, title },
};
