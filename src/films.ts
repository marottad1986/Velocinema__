import type { FilmData, FilmDef } from './types';
import { ANTON, CINZEL, CREEPSTER, SYNCOPATE } from './lib/fonts';
import shutterIsland from '../films/shutter-island.json';
import laLaLand from '../films/la-la-land.json';
import trumanShow from '../films/the-truman-show.json';
import frankensteinJunior from '../films/frankenstein-junior.json';
import interstellar from '../films/interstellar.json';
import castAway from '../films/cast-away.json';
import jurassicPark from '../films/jurassic-park.json';
import harryPotter1 from '../films/harry-potter-pietra-filosofale.json';
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
import { CAST_AWAY_SCENES } from './scenes/cast-away';
import { Copertina as CastCover, Finale as CastEnd } from './scenes/cast-away/Locandina';
import { JURASSIC_PARK_SCENES } from './scenes/jurassic-park';
import { Copertina as JurassicCover, Finale as JurassicEnd } from './scenes/jurassic-park/Locandina';
import { HARRY_POTTER_1_SCENES } from './scenes/harry-potter-pietra-filosofale';
import { Copertina as HP1Cover, Finale as HP1End } from './scenes/harry-potter-pietra-filosofale/Locandina';

// Registro dei film: un JSON in films/ + le scene disegnate in src/scenes/<film>/.
// Le scene non ancora ricostruite compaiono come segnaposto.
export const FILMS: FilmDef[] = [
  { slug: 'shutter-island', data: shutterIsland as FilmData, scenes: SHUTTER_ISLAND_SCENES, cover: ShutterCover, ending: ShutterEnd, posterFont: ANTON },
  { slug: 'la-la-land', data: laLaLand as FilmData, scenes: LA_LA_LAND_SCENES, cover: LaLaCover, ending: LaLaEnd },
  { slug: 'the-truman-show', data: trumanShow as FilmData, scenes: TRUMAN_SHOW_SCENES, cover: TrumanCover, ending: TrumanEnd },
  { slug: 'frankenstein-junior', data: frankensteinJunior as FilmData, scenes: FRANKENSTEIN_JUNIOR_SCENES, cover: FrankCover, ending: FrankEnd, posterFont: CREEPSTER },
  { slug: 'interstellar', data: interstellar as FilmData, scenes: INTERSTELLAR_SCENES, cover: InterCover, ending: InterEnd, posterFont: SYNCOPATE },
  { slug: 'cast-away', data: castAway as FilmData, scenes: CAST_AWAY_SCENES, cover: CastCover, ending: CastEnd },
  { slug: 'jurassic-park', data: jurassicPark as FilmData, scenes: JURASSIC_PARK_SCENES, cover: JurassicCover, ending: JurassicEnd, posterFont: ANTON },
  { slug: 'harry-potter-pietra-filosofale', data: harryPotter1 as FilmData, scenes: HARRY_POTTER_1_SCENES, cover: HP1Cover, ending: HP1End, posterFont: CINZEL },
];

export const getFilm = (slug: string): FilmDef => {
  const f = FILMS.find((x) => x.slug === slug);
  if (!f) throw new Error(`Film "${slug}" non registrato in src/films.ts`);
  return f;
};
