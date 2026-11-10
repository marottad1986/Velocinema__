import type { FilmData, SceneDef } from '../../types';
import film from '../../../films/x-factor-2026-live-3.json';
import { BAL_Y, NEXT_Y, makeSchemaLive, type DatiPuntata } from '../talent/SchemaLive';

// X Factor 2026, Live 3 (Jukebox Night, 5 novembre 2026): il riepilogo come schema (TALENT.md, src/scenes/talent/SchemaLive.tsx).
// Qui solo i dati della puntata: canzoni dei due turni, ballottaggio, puntata dopo, e quando entra ogni pezzo
// ([capitolo, frase, ritardo]); le stesse chiavi nello spartito scripts/audio/x-factor-2026-live-3.mjs.
// Fonte: https://it.wikipedia.org/wiki/X_Factor_(Italia)_(ventesima_edizione), «Terza puntata».

export const DATI: DatiPuntata = {
  film: film as FilmData,
  serata: {
    tema: 'JUKEBOX NIGHT',
    sotto: "solo canzoni degli anni '60 e '70",
    quandoTema: ['serata', 0, 0.3],
    quandoNote: ['serata', 1, 0.2],
    apertura: { testo: 'Giorgia apre con', dischi: ['Beatles', 'Doors', 'Stones'], quando: ['serata', 2, 0.3] },
    ospite: { testo: 'Fulminacci', quando: ['serata', 3, 0.6] },
  },
  turni: [
    {
      titolo: 'TURNO 1',
      righe: [
        { id: 'camilla', canzone: 'Be My Baby', artista: 'Ronettes', quando: ['turno-1', 0, 1.0] },
        { id: 'lenanie', canzone: 'Ma il cielo è sempre più blu', artista: 'Rino Gaetano', quando: ['turno-1', 1, 0.3] },
        { id: 'giacomo', canzone: 'All by Myself', artista: 'Eric Carmen', quando: ['turno-1', 2, 0.4], stella: ['turno-1', 2, 2.4] },
        { id: 'alia', canzone: 'Mamma Mia', artista: 'ABBA', quando: ['turno-1b', 0, 0.1] },
        { id: 'teo', canzone: 'Have You Ever Seen the Rain', artista: 'Creedence', quando: ['turno-1b', 1, 0.1] },
        { id: 'distanze', canzone: 'Another Brick in the Wall', artista: 'Pink Floyd', quando: ['turno-1b', 2, 0.2] },
      ],
      ultimo: 'lenanie',
      quandoUltimo: ['turno-1b', 3, 0.5],
    },
    {
      titolo: 'TURNO 2',
      righe: [
        { id: 'scraffs', canzone: 'God Save the Queen', artista: 'Sex Pistols', quando: ['turno-2', 0, 0.9] },
        { id: 'manu', canzone: 'Mi ritorni in mente', artista: 'Battisti', quando: ['turno-2', 1, 0.1] },
        { id: 'alex', canzone: 'Nights in White Satin', artista: 'Moody Blues', quando: ['turno-2', 2, 0.1] },
        { id: 'maddog', canzone: 'Rebel Rebel', artista: 'David Bowie', quando: ['turno-2b', 0, 0.2] },
        { id: 'patrizia', canzone: "Tu sì 'na cosa grande", artista: 'Modugno', quando: ['turno-2b', 1, 0.3], stella: ['turno-2b', 2, 1.8],
          tag: { testo: 'INIZIA SENZA MUSICA', quando: ['turno-2b', 2, 0.2] } },
      ],
      ultimo: 'manu',
      quandoUltimo: ['turno-2b', 3, 0.3],
    },
  ],
  ballottaggio: {
    a: { id: 'lenanie', canzone: 'Non mi avete fatto niente' },
    b: { id: 'manu', canzone: 'Devastante' },
    quando: ['ballottaggio', 0, 1.2],
    quandoB: ['ballottaggio', 1, 0.1],
    voti: { gabbani: 'lenanie', jake: 'lenanie', paola: 'lenanie', irama: 'manu' },
    quandoVoti: ['ballottaggio', 2, 0.9],
    fuori: 'lenanie',
    quandoFuori: ['ballottaggio', 3, 2.8],
  },
  prossimo: {
    titolo: 'LIVE 4 · 12 NOVEMBRE',
    sotto: "l'Hell Factor",
    quando: ['live-4', 0, 0.4],
    quandoRegola: ['live-4', 2, 0.2],
    quandoBallottaggio: ['live-4', 3, 0.2],
    avviso: 'ESCONO IN 3',
    quandoAvviso: ['live-4', 4, 0.2],
    quandoLargo: ['live-4', 4, 2.0],
    rimasti: ['giacomo', 'teo', 'scraffs', 'alia', 'alex', 'camilla', 'manu', 'maddog', 'patrizia', 'distanze'],
  },
  camera: [
    [['serata', 0, 0], 540, 640, 0.95],
    [['serata', 2, 0], 540, 880, 0.95],
    [['turno-1', 0, 0], 300, 1520, 1.25],
    [['turno-1b', 0, -0.3], 300, 1900, 1.25],
    [['turno-1b', 3, 0.2], 330, 1890, 0.88],
    [['turno-2', 0, 0], 790, 1520, 1.25],
    [['turno-2b', 0, -0.3], 790, 1810, 1.25],
    [['turno-2b', 3, 0.0], 750, 1890, 0.88],
    [['ballottaggio', 0, 0], 540, BAL_Y + 320, 0.95],
    [['live-4', 0, 0], 540, NEXT_Y + 300, 0.95],
    [['live-4', 2, 0], 540, NEXT_Y + 430, 0.95],
    [['live-4', 4, 0], 540, NEXT_Y + 580, 0.95],
    [['live-4', 4, 2.0], 540, 2050, 0.23],
  ],
};

const scena = makeSchemaLive(DATI);
// titolo piccolo in alto (come lo Spiegato semplice), così lo schema sta tra titolo e sottotitoli
const title = { top: 380, size: 64, width: 960 };
export const X_FACTOR_2026_LIVE_3_SCENES: Record<string, SceneDef> = Object.fromEntries(
  (film as FilmData).capitoli.map((c) => [c.id, { Component: scena(c.id), title }]),
);
