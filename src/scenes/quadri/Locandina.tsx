import React from 'react';
import { AbsoluteFill } from 'remotion';
import { eo, seg } from '../../lib/anim';
import { SANS, SERIF } from '../../lib/fonts';
import { Quadro, type Chiave, type Opera } from '../../lib/quadro';
import type { PosterProps } from '../../types';

// Copertina e finale comuni a tutti i quadri (QUADRI.md): un dettaglio dell'opera a tutto schermo,
// titolo grande in serif, autore e anno, frase di lancio in corsivo.

/** Vista con l'opera intera, larga quanto il fotogramma. */
export const intera = (opera: Opera, x = 0.5, y = 0.5) => ({ x, y, h: (1920 * opera.aspect) / 1080 });

const CREMA = '#FFF8E6';

/** Titolo in due righe il più possibile bilanciate («Notte / stellata», «La grande onda / di Kanagawa»). */
const righe = (titolo: string) => {
  const p = titolo.split(' ');
  if (p.length < 2) return p;
  let best = 1;
  for (let k = 1; k < p.length; k++) {
    const diff = (s: number) => Math.abs(p.slice(0, s).join(' ').length - p.slice(s).join(' ').length);
    if (diff(k) < diff(best)) best = k;
  }
  return [p.slice(0, best).join(' '), p.slice(best).join(' ')];
};

/** Corpo del titolo: 230 px, ridotto perché la riga più lunga stia nei 920 px disponibili. */
const corpo = (r: string[]) => Math.min(230, Math.floor(920 / (Math.max(...r.map((x) => x.length)) * 0.43)));

/** Copertina: dettaglio a tutto schermo (camera da `da` a `a`), titolo grande in alto a sinistra. */
export const copertinaQuadro = (opera: Opera, da: Chiave['v'], a: Chiave['v']): React.FC<PosterProps> => ({ t, dur, film }) => {
  const P = film.palette;
  const k = eo(seg(t, 0.1, 0.8));
  const sub = eo(seg(t, 0.5, 1.0));
  const lancio = eo(seg(t, 1.0, 1.6));
  const r = righe(film.titolo);
  const size = corpo(r);
  return (
    <AbsoluteFill>
      <Quadro opera={opera} t={t} chiavi={[{ t: 0, v: da }, { t: dur, v: a }]} />
      <AbsoluteFill style={{ background: 'linear-gradient(rgba(5,10,25,.75), rgba(5,10,25,0) 45%, rgba(5,10,25,0) 60%, rgba(5,10,25,.7))' }} />
      <p style={{ position: 'absolute', top: 290, left: 80, margin: 0, fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: '0.35em', color: P.accento, opacity: k }}>
        IL QUADRO IN 2 MINUTI
      </p>
      <h1 style={{ position: 'absolute', top: 340, left: 72, margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: size, lineHeight: 0.88, color: CREMA,
        opacity: k, transform: `translateY(${(1 - k) * 30}px)`, textShadow: '0 6px 30px rgba(0,0,0,.5)' }}>
        {r.map((x, i) => <React.Fragment key={i}>{i > 0 && <br />}{x}</React.Fragment>)}
      </h1>
      <p style={{ position: 'absolute', top: 340 + size * 0.88 * 2 + 30, left: 80, margin: 0, fontFamily: SANS, fontWeight: 800, fontSize: 40, color: CREMA, opacity: sub }}>
        {film.autore} · {film.anno}
      </p>
      {film.copertina.frase_lancio && (
        <p style={{ position: 'absolute', top: 1360, left: 80, right: 80, margin: 0, fontFamily: SERIF, fontStyle: 'italic', fontSize: 60, lineHeight: 1.15, color: CREMA,
          opacity: lancio, transform: `translateY(${(1 - lancio) * 14}px)` }}>
          {film.copertina.frase_lancio}
        </p>
      )}
    </AbsoluteFill>
  );
};

/** Finale: l'opera intera, «Metti like» / «Segui la pagina» e l'invito a commentare (mai frasi come «la prossima volta che lo vedi…»). */
export const finaleQuadro = (opera: Opera): React.FC<PosterProps> => ({ t, film }) => {
  const P = film.palette;
  const card = eo(seg(t, 0.1, 0.6));
  return (
    <AbsoluteFill>
      <Quadro opera={opera} t={t} chiavi={[{ t: 0, v: intera(opera, 0.5, 0.42) }]} />
      <div style={{ position: 'absolute', left: 90, top: 300, width: 900, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 24,
        background: 'rgba(10,16,32,.84)', border: '2px solid rgba(255,255,255,.2)', color: CREMA, fontFamily: SANS, textAlign: 'center',
        opacity: card, transform: `translateY(${(1 - card) * 20}px)` }}>
        <p style={{ margin: 0, fontFamily: SERIF, fontWeight: 400, fontSize: 84, lineHeight: 1 }}>{film.titolo}</p>
        <p style={{ margin: '12px 0 0', fontSize: 32, opacity: 0.8 }}>{film.autore} · {film.anno}</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '16px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 38, fontWeight: 800 }}>Metti like</span>
          <span style={{ padding: '13px 31px', borderRadius: 999, border: `3px solid ${CREMA}`, fontSize: 38, fontWeight: 800 }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '26px 0 0', fontSize: 32, opacity: 0.85 }}>Commenta con il quadro che vorresti.</p>
      </div>
    </AbsoluteFill>
  );
};
