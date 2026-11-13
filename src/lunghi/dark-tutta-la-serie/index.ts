import React from 'react';
import type { ScenaLunga } from '../registro';
import { StagioneView, type Stagione } from './Stagioni';
import { Aggancio } from './Aggancio';
import { makeFinale } from './Finale';
import { Chiusura } from './Chiusura';

// Dark, tutta la serie: le tre stagioni riadattate al 16:9 e le parti nuove (aggancio, finale spiegato, chiusura).
export const DARK_TUTTA: ScenaLunga = {
  aggancio: Aggancio,
  chiusura: Chiusura,
  capitoli: Object.fromEntries(['vetro', 'cerchi', 'antenato', 'nemici', 'ponte', 'resta'].map((id) => [id, makeFinale(id)])),
  episodio: ({ film, T, parte, riassunto }) =>
    React.createElement(StagioneView, { film: film as Stagione, T, nome: parte.nome, sottotitolo: parte.sottotitolo, riassunto }),
};
