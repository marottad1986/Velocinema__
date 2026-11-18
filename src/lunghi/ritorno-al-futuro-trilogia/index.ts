import React from 'react';
import type { ScenaLunga } from '../registro';
import { ParteView, type ParteFilm } from './Parti';
import { makeParadosso } from './Paradossi';
import { Chiusura } from './Chiusura';
import { Aggancio } from './Aggancio';

// Ritorno al futuro, la trilogia: le tre Parti riadattate al 16:9 e le parti nuove (aggancio, i paradossi spiegati, chiusura).
export const RAF_TRILOGIA: ScenaLunga = {
  aggancio: Aggancio,
  chiusura: Chiusura,
  capitoli: Object.fromEntries(['regola', 'binario', 'riparare', 'doppioni', 'lettera', 'scritto'].map((id) => [id, makeParadosso(id)])),
  episodio: ({ film, T, parte, riassunto }) =>
    React.createElement(ParteView, { film: film as ParteFilm, T, nome: parte.nome, sottotitolo: parte.sottotitolo, riassunto }),
};
