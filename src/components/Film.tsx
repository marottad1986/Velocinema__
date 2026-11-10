import { grigliaMusicale } from '../lib/anim';
import React, { useLayoutEffect, useRef } from 'react';
import { AbsoluteFill, continueRender, delayRender, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { ChapterOverlay, subtitleTimes } from './ChapterOverlay';
import { SIGLA, Sigla } from './Sigla';
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
        <def.Component t={t} dur={ch.durata} palette={film.data.palette} cues={subtitleTimes(ch.sottotitoli, ch.durata).map(([a]) => a)}
          griglia={grigliaMusicale(film.data.bpm, start, film.data.copertina.durata)} />
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
      {!end && <p style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: P.accento, letterSpacing: '0.2em' }}>{(film.data.regista ?? film.data.autore ?? '').toUpperCase()}</p>}
    </AbsoluteFill>
  );
};

/** Copertina o finale: disegno del film se c'è, altrimenti segnaposto. */
export const PosterView: React.FC<{ slug: string; end?: boolean }> = ({ slug, end }) => {
  const film = getFilm(slug);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const Comp = end ? film.ending : film.cover;
  const total = end ? film.data.finale.durata : film.data.copertina.durata;
  // Formato "spiegato": la copertina parte dopo la sigla e dura il resto dei 4 s (salvo "sigla": false nel JSON).
  const sigla = !end && film.data.formato === 'spiegato' && film.data.sigla !== false ? SIGLA : 0;
  const t = Math.max(0, frame / fps - sigla);
  const ref = useRef<HTMLDivElement>(null);
  // Titoli grandi delle locandine (h1): devono stare nella zona sicura, 840 px di larghezza (120 px di margine per lato,
  // perché TikTok taglia fino a ~100 px per lato). Si misura ogni riga (o parola, se il titolo va a capo) con il suo carattere
  // su un canvas, che non dipende dall'impaginazione, e se è più larga si riduce il carattere.
  useLayoutEffect(() => {
    const handle = delayRender('Titolo della locandina nella zona sicura');
    let fatto = false;
    const fine = () => { if (!fatto) { fatto = true; continueRender(handle); } };
    document.fonts.ready.then(() => {
      if (fatto) return;
      const box = ref.current;
      const ctx = document.createElement('canvas').getContext('2d');
      if (box && ctx) {
        box.querySelectorAll('h1').forEach((h) => {
          const cs = getComputedStyle(h);
          const size = parseFloat(cs.fontSize);
          const spazio = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing) || 0;
          ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${size}px ${cs.fontFamily}`;
          const testo = cs.textTransform === 'uppercase' ? (h.textContent ?? '').toUpperCase() : h.textContent ?? '';
          const nowrap = cs.whiteSpace === 'nowrap' || cs.whiteSpace === 'pre';
          // le righe vere: a capo con <br> o con blocchi; se il titolo può andare a capo conta la parola più lunga
          const blocchi = Array.from(h.childNodes).map((n) => (n.textContent ?? '').trim()).filter(Boolean);
          const righe = (blocchi.length > 1 ? blocchi : [testo.trim()]).flatMap((r) => (nowrap ? [r] : r.split(/\s+/)));
          const larga = Math.max(...righe.map((r) => ctx.measureText(cs.textTransform === 'uppercase' ? r.toUpperCase() : r).width + spazio * Math.max(0, r.length - 1)));
          if (larga > 840) h.style.fontSize = `${Math.floor(size * (840 / larga) * 0.98)}px`;
        });
      }
      fine();
    });
    return fine;
  });
  return (
    <AbsoluteFill style={{ background: film.data.palette.scuro, overflow: 'hidden' }}>
      <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
        {Comp ? <Comp t={t} dur={total - sigla} film={film.data} /> : <PosterPlaceholder film={film} end={end} />}
      </div>
      {sigla > 0 && <Sigla t={frame / fps} tipo={film.data.tipo === 'serie' ? 'serie' : 'film'} />}
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
