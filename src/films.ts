import type { FilmData, FilmDef } from './types';
import { ANTON, BEBAS, CINZEL, CREEPSTER, PACIFICO, PLAYFAIR, SERIF, STENCIL, SYNCOPATE, TYPEWRITER } from './lib/fonts';
import shutterIsland from '../films/shutter-island.json';
import laLaLand from '../films/la-la-land.json';
import trumanShow from '../films/the-truman-show.json';
import frankensteinJunior from '../films/frankenstein-junior.json';
import interstellar from '../films/interstellar.json';
import castAway from '../films/cast-away.json';
import jurassicPark from '../films/jurassic-park.json';
import harryPotter1 from '../films/harry-potter-pietra-filosofale.json';
import darkStagione1 from '../films/dark-stagione-1.json';
import inception from '../films/inception.json';
import bohemianRhapsody from '../films/bohemian-rhapsody.json';
import gliAnni from '../films/gli-anni.json';
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
import { DARK_S1_SCENES } from './scenes/dark-stagione-1';
import { INCEPTION_SCENES } from './scenes/inception';
import { Copertina as IncCover, Finale as IncEnd } from './scenes/inception/Locandina';
import { Copertina as DarkCover, Finale as DarkEnd } from './scenes/dark-stagione-1/Locandina';
import notteStellata from '../quadri/notte-stellata.json';
import { NOTTE_STELLATA_SCENES, Copertina as NotteCover, Finale as NotteEnd } from './scenes/notte-stellata';
import grandeOnda from '../quadri/grande-onda.json';
import { GRANDE_ONDA_SCENES, Copertina as OndaCover, Finale as OndaEnd } from './scenes/grande-onda';
import { BOHEMIAN_RHAPSODY_SCENES } from './scenes/bohemian-rhapsody';
import { GLI_ANNI_SCENES } from './scenes/gli-anni';
import { Copertina as GliAnniCover, Finale as GliAnniEnd } from './scenes/gli-anni/Locandina';
import { Copertina as BohemianCover, Finale as BohemianEnd } from './scenes/bohemian-rhapsody/Locandina';
import shining from '../films/shining.json';
import titanic from '../films/titanic.json';
import { SHINING_SCENES } from './scenes/shining';
import { Copertina as ShiningCover, Finale as ShiningEnd } from './scenes/shining/Locandina';
import { TITANIC_SCENES } from './scenes/titanic';
import { Copertina as TitanicCover, Finale as TitanicEnd } from './scenes/titanic/Locandina';

// Registro dei film e dei quadri: un JSON in films/ (o quadri/, vedi QUADRI.md) + le scene in src/scenes/<slug>/.
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
  { slug: 'dark-stagione-1', data: darkStagione1 as FilmData, scenes: DARK_S1_SCENES, cover: DarkCover, ending: DarkEnd, posterFont: STENCIL },
  { slug: 'inception', data: inception as FilmData, scenes: INCEPTION_SCENES, cover: IncCover, ending: IncEnd, posterFont: BEBAS },
  { slug: 'notte-stellata', data: notteStellata as FilmData, scenes: NOTTE_STELLATA_SCENES, cover: NotteCover, ending: NotteEnd },
  { slug: 'grande-onda', data: grandeOnda as FilmData, scenes: GRANDE_ONDA_SCENES, cover: OndaCover, ending: OndaEnd },
  { slug: 'gli-anni', data: gliAnni as FilmData, scenes: GLI_ANNI_SCENES, cover: GliAnniCover, ending: GliAnniEnd, posterFont: PACIFICO },
  { slug: 'bohemian-rhapsody', data: bohemianRhapsody as FilmData, scenes: BOHEMIAN_RHAPSODY_SCENES, cover: BohemianCover, ending: BohemianEnd, posterFont: PLAYFAIR },
  { slug: 'shining', data: shining as FilmData, scenes: SHINING_SCENES, cover: ShiningCover, ending: ShiningEnd, posterFont: TYPEWRITER },
  { slug: 'titanic', data: titanic as FilmData, scenes: TITANIC_SCENES, cover: TitanicCover, ending: TitanicEnd, posterFont: PLAYFAIR },
];

export const getFilm = (slug: string): FilmDef => {
  const f = FILMS.find((x) => x.slug === slug);
  if (!f) throw new Error(`Film "${slug}" non registrato in src/films.ts`);
  return f;
};
