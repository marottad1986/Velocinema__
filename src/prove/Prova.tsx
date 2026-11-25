import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { ChapterOverlay, subtitleTimes } from '../components/ChapterOverlay';
import { chapterStarts } from '../components/Film';
import { getFilm } from '../films';
import { grigliaMusicale } from '../lib/anim';
import type { SceneProps } from '../types';
import { RapimentoNuovo } from './disegnatore/RapimentoNuovo';

// Prove di disegno: una scena ridisegnata messa al posto di quella del film, con gli stessi elementi fissi
// (barra, etichetta, titolo, sottotitoli), per confrontarla con la versione uscita. Non entrano nei video.
const PROVE: Record<string, { slug: string; capitolo: string; Component: React.FC<SceneProps>; title: { top: number; size?: number; width?: number } }> = {
  'disegnatore-rapimento': { slug: 'breaking-bad-stagione-2', capitolo: 'rapimento', Component: RapimentoNuovo, title: { top: 392, size: 104, width: 900 } },
};
export const PROVE_IDS = Object.keys(PROVE);
export const provaDurata = (id: string) => getFilm(PROVE[id].slug).data.capitoli.find((c) => c.id === PROVE[id].capitolo)!.durata;

export const ProvaView: React.FC<{ prova: string }> = ({ prova }) => {
  const p = PROVE[prova];
  const film = getFilm(p.slug);
  const t = useCurrentFrame() / useVideoConfig().fps;
  const index = film.data.capitoli.findIndex((c) => c.id === p.capitolo);
  const ch = film.data.capitoli[index];
  const start = chapterStarts(film)[index];
  return (
    <AbsoluteFill style={{ background: film.data.palette.scuro, overflow: 'hidden' }}>
      <p.Component t={t} dur={ch.durata} palette={film.data.palette} cues={subtitleTimes(ch.sottotitoli, ch.durata).map(([a]) => a)}
        griglia={grigliaMusicale(film.data.bpm, start, film.data.copertina.durata)} />
      <ChapterOverlay film={film.data} index={index} t={t} chapterStart={start} title={p.title} />
    </AbsoluteFill>
  );
};
