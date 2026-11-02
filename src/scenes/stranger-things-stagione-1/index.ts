import type { SceneDef } from '../../types';
import { Capanno } from './Capanno';

// Scene di Stranger Things, stagione 1, per id del capitolo (films/stranger-things-stagione-1.json).
export const STRANGER_THINGS_1_SCENES: Record<string, SceneDef> = {
  capanno: { Component: Capanno, title: { top: 392, size: 104, width: 900 } },
};
