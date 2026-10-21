import type { FilmData, FilmDef } from './types';
import { ANTON, CREEPSTER, SYNCOPATE } from './lib/fonts';
import shutterIsland from '../films/shutter-island.json';
import laLaLand from '../films/la-la-land.json';
import trumanShow from '../films/the-truman-show.json';
import frankensteinJunior from '../films/frankenstein-junior.json';
import interstellar from '../films/interstellar.json';
import { SHUTTER_ISLAND_SCENES } from './scenes/shutter-island';
import { Copertina as ShutterCover } from './scenes/shutter-island/Copertina';
import { Finale as ShutterEnd } from './scenes/shutter-island/Finale';
import { LA_LA_LAND_SCENES } from './scenes/la-la-land';
import { Copertina as LaLaCover, Finale as LaLaEnd } from './scenes/la-la-land/Locandina';
import { TRUMAN_SHOW_SCENES } from './scenes/the-truman-show';
import { Copertina as TrumanCover, Finale as TrumanEnd } from './scenes/the-truman-show/Locandina';
import { FRANKENSTEIN_JUNIOR_SCENES } from './scenes/frankenstein-junior';
import { Copertina as FrankCover, Finale as FrankEnd } from './scenes/frankenstein-junior/Locandina';
import { INTERSTELLAR_SCENES } from './scenes/interstellar';
import { Copertina as InterCover, Finale as InterEnd } from './scenes/interstellar/Locandina';
import notteStellata from '../quadri/notte-stellata.json';
import { NOTTE_STELLATA_SCENES, Copertina as NotteCover, Finale as NotteEnd } from './scenes/notte-stellata';

// Registro dei film e dei quadri: un JSON in films/ (o quadri/, vedi QUADRI.md) + le scene in src/scenes/<slug>/.
// Le scene non ancora ricostruite compaiono come segnaposto.
export const FILMS: FilmDef[] = [
  { slug: 'shutter-island', data: shutterIsland as FilmData, scenes: SHUTTER_ISLAND_SCENES, cover: ShutterCover, ending: ShutterEnd, posterFont: ANTON },
  { slug: 'la-la-land', data: laLaLand as FilmData, scenes: LA_LA_LAND_SCENES, cover: LaLaCover, ending: LaLaEnd },
  { slug: 'the-truman-show', data: trumanShow as FilmData, scenes: TRUMAN_SHOW_SCENES, cover: TrumanCover, ending: TrumanEnd },
  { slug: 'frankenstein-junior', data: frankensteinJunior as FilmData, scenes: FRANKENSTEIN_JUNIOR_SCENES, cover: FrankCover, ending: FrankEnd, posterFont: CREEPSTER },
  { slug: 'interstellar', data: interstellar as FilmData, scenes: INTERSTELLAR_SCENES, cover: InterCover, ending: InterEnd, posterFont: SYNCOPATE },
  { slug: 'notte-stellata', data: notteStellata as FilmData, scenes: NOTTE_STELLATA_SCENES, cover: NotteCover, ending: NotteEnd },
];

export const getFilm = (slug: string): FilmDef => {
  const f = FILMS.find((x) => x.slug === slug);
  if (!f) throw new Error(`Film "${slug}" non registrato in src/films.ts`);
  return f;
};
