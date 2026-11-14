import type { FilmData, SceneDef } from '../../types';
import film from '../../../films/x-factor-2026-live-4.json';
import { BAL_Y, MENO_Y, NEXT_Y, ROW0, ROWH, makeSchemaLive4, type DatiLive4 } from './Schema';

// X Factor 2026, Live 4 «Hell Factor» (12 novembre 2026): il riepilogo come schema (TALENT.md, ./Schema.tsx).
// Qui solo i dati della puntata e quando entra ogni pezzo ([capitolo, frase, ritardo]); le stesse chiavi nello spartito
// scripts/audio/x-factor-2026-live-4.mjs. Fonte: https://it.wikipedia.org/wiki/X_Factor_(Italia)_(ventesima_edizione),
// «Quarta puntata»; voti del ballottaggio confermati anche da torresette.news.

const r = (i: number) => ROW0 + i * ROWH;

export const DATI: DatiLive4 = {
  film: film as FilmData,
  serata: {
    quandoTema: ['serata', 0, 0.2],
    quandoTre: ['serata', 1, 0.3],
    ospite: { testo: 'Charlotte Cardin', quando: ['serata', 2, 0.9] },
    quandoGiostra: ['serata', 3, 0.5],
    quandoTurno: ['serata', 4, 0.2],
  },
  giostra: [
    { id: 'camilla', canzone: 'Where Is My Husband!', artista: 'Raye', quando: ['giostra-1', 0, 0.4] },
    { id: 'scraffs', canzone: 'Celebrity Skin', artista: 'Hole', quando: ['giostra-1', 1, 0.2] },
    { id: 'manu', canzone: 'Incoscienti giovani', artista: 'Achille Lauro', quando: ['giostra-1', 2, 0.1] },
    { id: 'patrizia', canzone: 'Bang Bang', artista: 'Jessie J, Grande, Minaj', quando: ['giostra-1', 3, 0.2] },
    { id: 'alia', canzone: 'Maybe.', artista: 'Sienna Spiro', quando: ['giostra-1', 4, 0.2] },
    { id: 'distanze', canzone: 'Space Monkey', artista: 'Placebo', quando: ['giostra-2', 0, 0.3] },
    { id: 'giacomo', canzone: "Almeno tu nell'universo", artista: 'Mia Martini', quando: ['giostra-2', 1, 0.1] },
    { id: 'alex', canzone: 'Last Nite', artista: 'The Strokes', quando: ['giostra-2', 2, 0.1] },
    { id: 'teo', canzone: 'La mia storia tra le dita', artista: 'Gianluca Grignani', quando: ['giostra-2', 3, 0.1] },
    { id: 'maddog', canzone: 'Club Foot', artista: 'Kasabian', quando: ['giostra-2', 4, 0.4] },
  ],
  quandoTurno2: ['turno-2', 0, 0.2],
  turno2: [
    { id: 'teo', canzone: "Can't Stop the Feeling!", artista: 'Justin Timberlake', quando: ['turno-2', 1, 0.2] },
    { id: 'alia', canzone: 'La rondine', artista: 'Mango', quando: ['turno-2', 2, 0.1] },
    { id: 'maddog', canzone: 'Elenore + Scende la pioggia', artista: 'The Turtles · Gianni Morandi', quando: ['turno-2', 3, 0.3] },
    { id: 'patrizia', canzone: "And I'm Telling You I'm Not Going", artista: 'Jennifer Hudson', quando: ['turno-2', 4, 0.3] },
    { id: 'manu', canzone: 'Va bene, va bene così', artista: 'Vasco Rossi', quando: ['turno-2b', 0, 0.2] },
    { id: 'distanze', canzone: 'Welcome to the Black Parade', artista: 'My Chemical Romance', quando: ['turno-2b', 1, 0.2] },
    { id: 'camilla', canzone: 'Io che non vivo (senza te)', artista: 'Pino Donaggio', quando: ['turno-2b', 2, 0.1] },
    { id: 'scraffs', canzone: 'American Idiot', artista: 'Green Day', quando: ['turno-2b', 3, 0.3] },
    { id: 'giacomo', canzone: 'All of Me', artista: 'John Legend', quando: ['turno-2b', 3, 1.7] },
    { id: 'alex', canzone: "Maggie M'Gill", artista: 'The Doors', quando: ['turno-2b', 4, 0.4] },
  ],
  meno: {
    subito: ['manu', 'scraffs'],
    ballottaggio: ['alia', 'distanze'],
    quandoSomma: ['fuori-subito', 0, 1.0],
    quandoSubito: ['fuori-subito', 1, 0.5],
    quandoBal: ['fuori-subito', 2, 1.0],
  },
  ballottaggio: {
    a: { id: 'alia', canzone: "That's So True", artista: 'Gracie Abrams' },
    b: { id: 'distanze', canzone: 'Ritornerai', artista: 'Bruno Lauzi' },
    quando: ['ballottaggio', 0, 0.6],
    quandoB: ['ballottaggio', 1, 0.3],
    voti: { gabbani: 'distanze', jake: 'distanze', paola: 'alia', irama: 'alia' },
    quandoVoti: [['ballottaggio', 2, 0.1], ['ballottaggio', 3, 0.2]],
    quandoPari: ['ballottaggio', 3, 2.6],
  },
  tilt: { quando: ['tilt', 0, 0.9], quandoSalvi: ['tilt', 1, 0.5], salvi: 'distanze', fuori: 'alia', quandoFuori: ['tilt', 2, 0.6] },
  prossimo: {
    titolo: 'LIVE 5 · 19 NOVEMBRE',
    sotto: 'restano in sette',
    quando: ['live-5', 0, 0.3],
    gruppi: [['gabbani', ['giacomo', 'teo']], ['jake', ['alex']], ['paola', ['camilla', 'maddog']], ['irama', ['patrizia', 'distanze']]],
    usciti: ['manu', 'scraffs', 'alia'],
    solo: 'jake',
    quandoSolo: ['live-5', 1, 0.3],
    bollino: 'FINALE · 3 DICEMBRE',
    quandoBollino: ['live-5', 2, 2.5],
  },
  camera: [
    [['serata', 0, 0], 540, 620, 0.95],
    [['serata', 2, 0], 540, 730, 0.8],
    [['giostra-1', 0, -0.2], 300, 1670, 1.1],
    [['giostra-2', 0, -0.2], 300, r(7) + 60, 1.1],
    [['turno-2', 0, -0.2], 780, 1670, 1.1],
    [['turno-2b', 0, -0.3], 780, 2254, 1.08],
    [['fuori-subito', 0, -0.2], 540, 1930, 0.56],
    [['fuori-subito', 1, 0.2], 540, MENO_Y + 160, 0.82],
    [['ballottaggio', 0, -0.2], 540, BAL_Y + 320, 0.95],
    [['tilt', 0, 0.0], 540, BAL_Y + 560, 0.72],
    [['live-5', 0, -0.1], 540, NEXT_Y + 430, 0.8],
    [['live-5', 2, 0.2], 540, NEXT_Y + 600, 0.8],
    [['live-5', 3, 0.6], 540, (ROW0 - 150 + NEXT_Y + 1060) / 2, 0.165],
  ],
};

const scena = makeSchemaLive4(DATI);
// titolo piccolo in alto (come lo Spiegato semplice), così lo schema sta tra titolo e sottotitoli
const title = { top: 380, size: 64, width: 960 };
export const X_FACTOR_2026_LIVE_4_SCENES: Record<string, SceneDef> = Object.fromEntries(
  (film as FilmData).capitoli.map((c) => [c.id, { Component: scena(c.id), title }]),
);
