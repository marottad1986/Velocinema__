import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { ChapterOverlay, subtitleTimes } from './ChapterOverlay';
import { DISPLAY, SANS } from '../lib/fonts';
import { getFilm } from '../films';
import type { FilmDef } from '../types';

export const FPS = 30;

export const chapterStarts = (film: FilmDef) => {
  let acc = film.data.copertina.durata;
  return film.data.capitoli.map((c) => {
    const s = acc;
    acc += c.durata;
    return s;
  });
};

export const filmDuration = (film: FilmDef) =>
  film.data.copertina.durata + film.data.capitoli.reduce((a, c) => a + c.durata, 0) + film.data.finale.durata;

/** Un capitolo: illustrazione animata + elementi fissi sovrapposti. */
export const ChapterView: React.FC<{ slug: string; index: number }> = ({ slug, index }) => {
  const film = getFilm(slug);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const ch = film.data.capitoli[index];
  const def = film.scenes[ch.id];
  const start = chapterStarts(film)[index];
  return (
    <AbsoluteFill style={{ background: film.data.palette.scuro, overflow: 'hidden' }}>
      {def ? (
        <def.Component t={t} dur={ch.durata} palette={film.data.palette} cues={subtitleTimes(ch.sottotitoli, ch.durata).map(([a]) => a)} />
      ) : (
        <Placeholder film={film} text={ch.scena} />
      )}
      <ChapterOverlay film={film.data} index={index} t={t} chapterStart={start} title={def?.title ?? { top: 400 }} />
    </AbsoluteFill>
  );
};

/** Segnaposto per le scene non ancora ricostruite. */
const Placeholder: React.FC<{ film: FilmDef; text: string }> = ({ film, text }) => {
  const P = film.data.palette;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${P.principale}, ${P.scuro})`, alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: SANS, fontSize: 40, color: P.chiaro, opacity: 0.6, width: 800, textAlign: 'center', marginTop: 200 }}>
        [scena da ricostruire]
        <br />
        {text}
      </p>
    </AbsoluteFill>
  );
};

/** Copertina/finale provvisori finché non vengono disegnati. */
const PosterPlaceholder: React.FC<{ film: FilmDef; end?: boolean }> = ({ film, end }) => {
  const P = film.data.palette;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${P.scuro}, ${P.principale})`, alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontFamily: film.posterFont ?? DISPLAY, fontSize: 170, color: P.chiaro, margin: 0, textAlign: 'center', lineHeight: 0.95, width: 900 }}>
        {end ? 'THE END' : film.data.titolo.toUpperCase()}
      </h1>
      {!end && <p style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: P.accento, letterSpacing: '0.2em' }}>{film.data.regista.toUpperCase()}</p>}
    </AbsoluteFill>
  );
};

/** Copertina o finale: disegno del film se c'è, altrimenti segnaposto. */
export const PosterView: React.FC<{ slug: string; end?: boolean }> = ({ slug, end }) => {
  const film = getFilm(slug);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const Comp = end ? film.ending : film.cover;
  const dur = end ? film.data.finale.durata : film.data.copertina.durata;
  return (
    <AbsoluteFill style={{ background: film.data.palette.scuro, overflow: 'hidden' }}>
      {Comp ? <Comp t={frame / fps} dur={dur} film={film.data} /> : <PosterPlaceholder film={film} end={end} />}
    </AbsoluteFill>
  );
};

export const Film: React.FC<{ slug: string }> = ({ slug }) => {
  const film = getFilm(slug);
  const { data } = film;
  const starts = chapterStarts(film);
  const endStart = filmDuration(film) - data.finale.durata;
  return (
    <AbsoluteFill style={{ background: data.palette.scuro }}>
      <Sequence durationInFrames={data.copertina.durata * FPS}>
        <PosterView slug={slug} />
      </Sequence>
      {data.capitoli.map((c, i) => (
        <Sequence key={c.id} from={starts[i] * FPS} durationInFrames={c.durata * FPS}>
          <ChapterView slug={slug} index={i} />
        </Sequence>
      ))}
      <Sequence from={endStart * FPS} durationInFrames={data.finale.durata * FPS}>
        <PosterView slug={slug} end />
      </Sequence>
    </AbsoluteFill>
  );
};
