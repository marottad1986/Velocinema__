import type { SceneDef } from '../../types';
import { Panem } from './Panem';

// Scene di Hunger Games, per id del capitolo (films/hunger-games.json).
export const HUNGER_GAMES_SCENES: Record<string, SceneDef> = {
  panem: { Component: Panem, title: { top: 392, size: 104, width: 900 } },
};
