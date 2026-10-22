import type React from 'react';

export type Palette = { chiaro: string; principale: string; scuro: string; accento: string };

export type Capitolo = {
  id: string;
  titolo: string;
  durata: number;
  scena: string;
  sottotitoli: string[];
  /** Solo formato "spiegato": anno evidenziato sulla linea del tempo e personaggi presentati nel capitolo. */
  anno?: number;
  personaggi?: string[];
};

/** Formato "spiegato": ogni personaggio è rappresentato da un oggetto, mai da una figura. */
export type Personaggio = { nome: string; ruolo: string; oggetto: string };

export type FilmData = {
  titolo: string;
  formato?: 'riassunto' | 'spiegato';
  /** Formato "spiegato" disegnato come un unico schema che si costruisce (niente linea del tempo né cartellini sopra). */
  schema?: boolean;
  tipo?: 'film' | 'serie';
  stagione?: number;
  regista: string;
  anno: number;
  palette: Palette;
  copertina: { durata: number; frase_lancio?: string; immagine: string; voce?: string };
  linea_tempo?: number[];
  personaggi?: Personaggio[];
  capitoli: Capitolo[];
  finale: { durata: number; immagine: string; voce?: string };
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
