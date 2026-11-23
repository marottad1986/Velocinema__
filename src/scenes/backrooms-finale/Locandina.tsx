import React from 'react';
import { eo, eob, seg } from '../../lib/anim';
import { ANTON, DISPLAY, SANS } from '../../lib/fonts';
import { Corridoio } from '../../lib/liminale';
import type { PosterProps } from '../../types';
import { PortaInFondo, SulMuro } from '../../lunghi/backrooms-spiegato/Pov';

// Copertina e finale di «Backrooms: il finale» (episodio verticale del lungo) (Spiegato semplice, senza sigla: la copertina dura 4 s ed è la
// miniatura). Il corridoio giallo infinito in verticale (src/lib/liminale.tsx), la porta socchiusa in fondo con l'anello
// rosso, «DOVE SEI?» sul muro; il titolo già completo nel fotogramma 0, la frase di lancio da 0,4 s. Niente persone.

const RED = '#E0443A';
const Art: React.FC<{ t: number; id: string; calmo?: number }> = ({ t, id, calmo = 0 }) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
    <Corridoio T={t} z={t * 0.5} w={1080} h={1920} id={id} seed={3} luce={1 - 0.3 * calmo}
      oggetti={(p) => {
        const c = p(0, 1.1, 22);
        return (
          <g>
            <PortaInFondo p={p} z={22} T={t} apre={0.3} />
            <SulMuro p={p} side={1} z={13} y={1.35} text="DOVE SEI?" size={230} color="#7A1A10" />
            {c && <circle cx={c.x} cy={c.y} r={c.s * 1.35} fill="none" stroke={RED} strokeWidth={10} strokeDasharray={`${c.s * 0.7} ${c.s * 0.25}`} strokeDashoffset={-t * 40} />}
          </g>
        );
      }} />
  </svg>
);
const Ombra = () => <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 1000, background: 'linear-gradient(180deg, rgba(12,11,6,.86) 0%, rgba(12,11,6,.62) 55%, rgba(12,11,6,0) 100%)' }} />;

export const Copertina: React.FC<PosterProps> = ({ t, film }) => {
  const P = film.palette;
  const line = eo(seg(t, 0.4, 0.7));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Art t={t} id="bfc" />
      <Ombra />
      <div style={{ position: 'absolute', left: 120, top: 270, width: 840, fontFamily: SANS, textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.accento }}>SPIEGATO SEMPLICE · FILM</p>
        <h1 style={{ margin: '10px 0 0', fontFamily: ANTON, fontWeight: 400, fontSize: 178, lineHeight: 1, color: P.chiaro, textShadow: `0 8px 0 ${P.scuro}, 0 0 40px rgba(255,236,150,.5)` }}>BACKROOMS</h1>
        <p style={{ margin: '14px auto 0', width: 'fit-content', padding: '6px 24px 8px', borderRadius: 14, background: `${P.scuro}D0`, border: `3px solid ${RED}`,
          fontSize: 44, fontWeight: 800, letterSpacing: "0.1em", color: P.chiaro }}>IL FINALE SPIEGATO</p>
        <p style={{ margin: '14px 0 0', fontSize: 30, fontWeight: 800, color: '#E8DCB0', textShadow: `0 3px 0 ${P.scuro}` }}>un film di {film.regista} · {film.anno}</p>
      </div>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1440, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}E0`, color: P.chiaro, fontFamily: SANS, fontSize: 44, fontWeight: 800, textAlign: 'center', lineHeight: 1.2,
        opacity: line, transform: `translateY(${(1 - line) * 14}px)` }}>
        {film.copertina.frase_lancio}
      </p>
    </div>
  );
};

export const Finale: React.FC<PosterProps> = ({ t, film }) => {
  const P = film.palette;
  const card = eo(seg(t, 0.1, 0.5));
  const b1 = eob(seg(t, 0.5, 0.9), 1.8);
  const b2 = eob(seg(t, 0.7, 1.1), 1.8);
  const line = eo(seg(t, 0.4, 0.8));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Art t={t + 8} id="bff" calmo={1} />
      <div style={{ position: 'absolute', left: 120, top: 300, width: 840, boxSizing: 'border-box', padding: '34px 40px 30px', borderRadius: 32,
        background: `${P.scuro}E6`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 68, lineHeight: 1 }}>Ti è servito?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 28 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 40, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 40, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '24px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con la spiegazione che vorresti.</p>
        <p style={{ margin: '14px 0 0', fontSize: 26, fontWeight: 400, opacity: 0.8 * seg(t, 1.2, 1.6) }}>Le spiegazioni complete sono su YouTube</p>
      </div>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1440, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, fontSize: 44, fontWeight: 800, textAlign: 'center', lineHeight: 1.25,
        opacity: line, transform: `translateY(${(1 - line) * 14}px)` }}>
        {film.finale.voce}
      </p>
    </div>
  );
};
