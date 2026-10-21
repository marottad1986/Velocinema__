import type React from 'react';

export type Palette = { chiaro: string; principale: string; scuro: string; accento: string };

export type Capitolo = {
  id: string;
  titolo: string;
  durata: number;
  scena: string;
  sottotitoli: string[];
};

/** Scheda dell'opera (solo quadri, QUADRI.md). */
export type OperaInfo = { tecnica: string; misure: string; museo: string; fonte: { url: string; licenza: string } };

/** Dati di un film (films/) o di un quadro (quadri/: autore al posto di regista, più la scheda dell'opera). */
export type FilmData = {
  titolo: string;
  regista?: string;
  autore?: string;
  anno: number;
  opera?: OperaInfo;
  palette: Palette;
  copertina: { durata: number; frase_lancio?: string; immagine: string; voce?: string };
  capitoli: Capitolo[];
  finale: { durata: number; immagine: string; frase?: string };
  musica?: string;
};

/**
 * Props ricevute da ogni scena: t e dur in secondi, relativi al capitolo.
 * cues[i] = secondo in cui compare la frase i dei sottotitoli (per sincronizzare gli eventi con la voce).
 */
export type SceneProps = { t: number; dur: number; palette: Palette; cues: number[] };

/** Dove e come mettere il titolo del capitolo per una scena. */
export type TitleSpec = { top: number; size?: number; dark?: boolean; width?: number };

export type SceneDef = { Component: React.FC<SceneProps>; title: TitleSpec };

/** Props di copertina e finale: t e dur in secondi. */
export type PosterProps = { t: number; dur: number; film: FilmData };

export type FilmDef = {
  slug: string;
  data: FilmData;
  scenes: Record<string, SceneDef>;
  /** Copertina e finale disegnati (se mancano: segnaposto). */
  cover?: React.FC<PosterProps>;
  ending?: React.FC<PosterProps>;
  /** Font titolo specifico per copertina/finale (facoltativo). */
  posterFont?: string;
};
