import React from 'react';
import { eo, eob, lerp, seg } from '../../lib/anim';
import { DISPLAY, SANS } from '../../lib/fonts';
import { Quadro, type Chiave, type Opera } from '../../lib/quadro';
import type { PosterProps } from '../../types';

// Copertina e finale comuni a tutti i quadri: l'opera stessa (QUADRI.md), con titolo e autore sopra.

/** Vista con l'opera intera, larga quanto il fotogramma. */
export const intera = (opera: Opera, x = 0.5, y = 0.5) => ({ x, y, h: (1920 * opera.aspect) / 1080 });

/** Copertina: l'opera intera che si avvicina al dettaglio `verso`. */
export const copertinaQuadro = (opera: Opera, verso: Chiave['v']): React.FC<PosterProps> => ({ t, dur, film }) => {
  const P = film.palette;
  const tag = eo(seg(t, 0.05, 0.45));
  const l1 = eob(seg(t, 0.15, 0.7), 1.4);
  const dir = eo(seg(t, 0.6, 1.0));
  const line = eo(seg(t, 1.2, 1.7));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Quadro opera={opera} t={t} chiavi={[{ t: 0, v: intera(opera) }, { t: dur, v: verso }]} />
      <div style={{ position: 'absolute', left: 80, top: 290, width: 920, fontFamily: SANS }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.accento, opacity: tag, textShadow: `0 2px 0 ${P.scuro}` }}>IL QUADRO IN 2 MINUTI</p>
        <h1 style={{ margin: '22px 0 0', fontFamily: DISPLAY, fontWeight: 800, fontSize: 120, lineHeight: 0.95, color: P.chiaro,
          textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.15, 0.4), transform: `translateY(${(1 - l1) * 50}px)` }}>
          {film.titolo}
        </h1>
        <p style={{ margin: '26px 0 0', fontSize: 40, fontWeight: 800, opacity: dir, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>{film.autore} · {film.anno}</p>
      </div>
      {film.copertina.frase_lancio && (
        <p style={{ position: 'absolute', left: 60, right: 60, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 960, boxSizing: 'border-box', padding: '12px 26px 14px',
          borderRadius: 16, background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, fontSize: 40, fontWeight: 800, textAlign: 'center',
          opacity: line, transform: `translateY(${(1 - line) * 14}px)` }}>
          {film.copertina.frase_lancio}
        </p>
      )}
    </div>
  );
};

/** Finale: l'opera intera ferma, invito a seguire la pagina e la frase «la prossima volta che lo vedi…». */
export const finaleQuadro = (opera: Opera): React.FC<PosterProps> => ({ t, film }) => {
  const P = film.palette;
  const card = eo(seg(t, 0.1, 0.5));
  const b1 = eob(seg(t, 0.5, 0.9), 1.8);
  const b2 = eob(seg(t, 0.7, 1.1), 1.8);
  const frase = eo(seg(t, 0.8, 1.3));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Quadro opera={opera} t={t} chiavi={[{ t: 0, v: intera(opera, 0.5, 0.42) }]} />
      <div style={{ position: 'absolute', left: 90, top: 300, width: 900, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Il prossimo quadro arriva presto.</p>
      </div>
      {film.finale.frase && (
        <p style={{ position: 'absolute', left: 60, right: 60, top: 1300, margin: '0 auto', width: 'fit-content', maxWidth: 960, boxSizing: 'border-box', padding: '14px 28px 16px',
          borderRadius: 16, background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, fontSize: 42, fontWeight: 800, textAlign: 'center',
          opacity: frase, transform: `translateY(${lerp(14, 0, frase)}px)` }}>
          {film.finale.frase}
        </p>
      )}
    </div>
  );
};
