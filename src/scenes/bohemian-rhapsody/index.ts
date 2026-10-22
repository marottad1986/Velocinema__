import type { SceneDef } from '../../types';
import { Opera } from './Opera';

// Scene di Bohemian Rhapsody, per id del capitolo (films/bohemian-rhapsody.json).
export const BOHEMIAN_RHAPSODY_SCENES: Record<string, SceneDef> = {
  opera: { Component: Opera, title: { top: 392, size: 92, width: 760 } },
};
