import type { SceneDef } from '../../types';
import { Vasco } from './Vasco';

// Scene di «Sally» (Vasco Rossi), per id del capitolo (films/sally.json).
export const SALLY_SCENES: Record<string, SceneDef> = {
  vasco: { Component: Vasco, title: { top: 392, size: 92, width: 900 } },
};
