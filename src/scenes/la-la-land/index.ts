import type { SceneDef } from '../../types';
import { Jazz } from './Jazz';
import { Osservatorio } from './Osservatorio';
import { Sogno } from './Sogno';
import { Band } from './Band';
import { Ingorgo } from './Ingorgo';
import { Caffe } from './Caffe';
import { Piano } from './Piano';
import { Collina } from './Collina';
import { Prima } from './Prima';
import { Audizione } from './Audizione';
import { Epilogo } from './Epilogo';

// Scene di La La Land, per id del capitolo (films/la-la-land.json).
export const LA_LA_LAND_SCENES: Record<string, SceneDef> = {
  ingorgo: { Component: Ingorgo, title: { top: 392, size: 112, dark: true } },
  caffe: { Component: Caffe, title: { top: 392, size: 112 } },
  piano: { Component: Piano, title: { top: 392, size: 108 } },
  collina: { Component: Collina, title: { top: 392, size: 112 } },
  jazz: { Component: Jazz, title: { top: 392, size: 108 } },
  osservatorio: { Component: Osservatorio, title: { top: 392, size: 108 } },
  sogno: { Component: Sogno, title: { top: 392, size: 108 } },
  band: { Component: Band, title: { top: 392, size: 108 } },
  prima: { Component: Prima, title: { top: 392, size: 108 } },
  audizione: { Component: Audizione, title: { top: 392, size: 108, dark: true } },
  epilogo: { Component: Epilogo, title: { top: 392, size: 92 } },
};
