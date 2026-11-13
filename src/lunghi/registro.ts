import type React from 'react';
import type { FilmData } from '../types';
import type { LungoData, ParteEpisodio } from './tempi';
import darkTutta from '../../lunghi/dark-tutta-la-serie.json';
import darkS1 from '../../films/dark-stagione-1.json';
import darkS2 from '../../films/dark-stagione-2.json';
import darkS3 from '../../films/dark-stagione-3.json';
import { DARK_TUTTA } from './dark-tutta-la-serie';

// Registro dei video lunghi orizzontali (VIDEO-LUNGO.md): JSON in lunghi/<slug>.json, episodi riusati, scene in src/lunghi/<slug>/.

/** Scena di una parte nuova: t e dur in secondi relativi alla parte, cues = inizio delle frasi. */
export type ParteProps = { t: number; dur: number; cues: number[] };
export type ScenaLunga = {
  aggancio?: React.FC<ParteProps>;
  chiusura?: React.FC<ParteProps>;
  capitoli: Record<string, React.FC<ParteProps>>;
  /** Un episodio intero nel 16:9: T = secondi dall'inizio del suo video verticale. */
  episodio: React.FC<{ film: string; T: number; parte: ParteEpisodio; riassunto: string }>;
};
export type LungoDef = { slug: string; data: LungoData; episodi: Record<string, FilmData>; scene: ScenaLunga };

export const LUNGHI: LungoDef[] = [
  {
    slug: 'dark-tutta-la-serie',
    data: darkTutta as LungoData,
    episodi: { 'dark-stagione-1': darkS1 as FilmData, 'dark-stagione-2': darkS2 as FilmData, 'dark-stagione-3': darkS3 as FilmData },
    scene: DARK_TUTTA,
  },
];

export const getLungo = (slug: string): LungoDef => {
  const l = LUNGHI.find((x) => x.slug === slug);
  if (!l) throw new Error(`Video lungo "${slug}" non registrato in src/lunghi/registro.ts`);
  return l;
};
