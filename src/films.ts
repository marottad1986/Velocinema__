import type { FilmData, FilmDef } from './types';
import { ANTON, CREEPSTER } from './lib/fonts';
import shutterIsland from '../films/shutter-island.json';
import laLaLand from '../films/la-la-land.json';
import trumanShow from '../films/the-truman-show.json';
import frankensteinJunior from '../films/frankenstein-junior.json';
import { SHUTTER_ISLAND_SCENES } from './scenes/shutter-island';
import { Copertina as ShutterCover } from './scenes/shutter-island/Copertina';
import { Finale as ShutterEnd } from './scenes/shutter-island/Finale';
import { LA_LA_LAND_SCENES } from './scenes/la-la-land';
import { Copertina as LaLaCover, Finale as LaLaEnd } from './scenes/la-la-land/Locandina';
import { TRUMAN_SHOW_SCENES } from './scenes/the-truman-show';
import { Copertina as TrumanCover, Finale as TrumanEnd } from './scenes/the-truman-show/Locandina';
import { FRANKENSTEIN_JUNIOR_SCENES } from './scenes/frankenstein-junior';
import { Copertina as FrankCover, Finale as FrankEnd } from './scenes/frankenstein-junior/Locandina';

// Registro dei film: un JSON in films/ + le scene disegnate in src/scenes/<film>/.
// Le scene non ancora ricostruite compaiono come segnaposto.
export const FILMS: FilmDef[] = [
  { slug: 'shutter-island', data: shutterIsland as FilmData, scenes: SHUTTER_ISLAND_SCENES, cover: ShutterCover, ending: ShutterEnd, posterFont: ANTON },
  { slug: 'la-la-land', data: laLaLand as FilmData, scenes: LA_LA_LAND_SCENES, cover: LaLaCover, ending: LaLaEnd },
  { slug: 'the-truman-show', data: trumanShow as FilmData, scenes: TRUMAN_SHOW_SCENES, cover: TrumanCover, ending: TrumanEnd },
  { slug: 'frankenstein-junior', data: frankensteinJunior as FilmData, scenes: FRANKENSTEIN_JUNIOR_SCENES, cover: FrankCover, ending: FrankEnd, posterFont: CREEPSTER },
];

export const getFilm = (slug: string): FilmDef => {
  const f = FILMS.find((x) => x.slug === slug);
  if (!f) throw new Error(`Film "${slug}" non registrato in src/films.ts`);
  return f;
};
