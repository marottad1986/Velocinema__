import React from 'react';
import { eo, eob, lerp, seg } from '../../lib/anim';
import { BEBAS, DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Glow } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { INK, ORANGE, Top } from './Piani';

// Copertina e finale di Inception (formato "spiegato": la copertina parte dopo la sigla e dura 2,5 s).
// Locandina originale, nello stile della cianografia dello schema: niente città che si piega, niente persone, niente
// locandine ufficiali. Una trottola gigante gira sopra lo spaccato di un edificio a piani che scendono nel buio.

const FLOORS = ['REALTÀ', 'SOGNO 1', 'SOGNO 2', 'SOGNO 3', 'LIMBO'];

const Blueprint: React.FC<{ t: number; id: string; wobble?: number; build?: number }> = ({ t, id, wobble = 0, build = 1 }) => (
  <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <FxDefs id={id} />
      <radialGradient id={`${id}-bg`} cx=".5" cy=".5" r=".8">
        <stop offset="0" stopColor="#1E4266" />
        <stop offset=".6" stopColor="#122A44" />
        <stop offset="1" stopColor="#081626" />
      </radialGradient>
      <pattern id={`${id}-grid`} width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0 H0 V40" fill="none" stroke="#2C4C6E" strokeWidth="1" /></pattern>
    </defs>
    <rect width="1080" height="1920" fill={`url(#${id}-bg)`} />
    <rect width="1080" height="1920" fill={`url(#${id}-grid)`} opacity=".6" />
    {/* spaccato dell'edificio: i piani scendono e si restringono, come in prospettiva */}
    {FLOORS.map((f, i) => {
      const p = eo(seg(build, i * 0.15, i * 0.15 + 0.4));
      const y = 980 + i * 150, w = 760 - i * 90;
      return (
        <g key={f} opacity={p}>
          <rect x={540 - w / 2} y={y} width={w} height={130} fill="#163452" opacity=".6" stroke={INK} strokeWidth="3" />
          <text x={540 - w / 2 + 16} y={y + 34} fontFamily={SANS} fontWeight={900} fontSize="24" letterSpacing="4" fill={i === 4 ? '#E0605A' : ORANGE}>{f}</text>
          <path d={`M${540 - w / 2} ${y + 130} L${540 - (w - 90) / 2} ${y + 150} M${540 + w / 2} ${y + 130} L${540 + (w - 90) / 2} ${y + 150}`} stroke={INK} strokeWidth="2" opacity=".6" />
        </g>
      );
    })}
    <g transform="translate(540 840)">
      <Glow id={`${id}-tg`} x={0} y={0} r={360} t={t} color={ORANGE} amp={0.08} rate={2} opacity={0.45} />
      <ellipse cx="0" cy="118" rx="120" ry="18" fill="#000" opacity=".35" />
      <Top T={t} spin={2.4} wobble={wobble} s={3.2} />
    </g>
    <Finish id={id} tint="#1E3A5A" tintOpacity={0.08} />
  </svg>
);

export const Copertina: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const tag = eo(seg(t, 0.05, 0.4));
  const l1 = eob(seg(t, 0.1, 0.6), 1.3);
  const line = eo(seg(t, 0.8, 1.2));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Blueprint t={t} id="ic" build={seg(t, 0, dur * 0.8)} />
      <div style={{ position: 'absolute', left: 80, top: 290, width: 920, fontFamily: SANS }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.accento, opacity: tag }}>SPIEGATO SEMPLICE · FILM</p>
        <h1 style={{ margin: '6px 0 0', fontFamily: BEBAS, fontWeight: 400, fontSize: 220, lineHeight: 0.9, letterSpacing: '0.06em', color: P.chiaro,
          textShadow: `0 8px 0 ${P.scuro}`, opacity: seg(t, 0.1, 0.3), transform: `translateY(${(1 - l1) * 50}px)` }}>
          INCEPTION
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 34, fontWeight: 800, opacity: seg(t, 0.4, 0.8), color: P.chiaro }}>un film di {film.regista} · {film.anno}</p>
      </div>
      <p style={{ position: 'absolute', left: 60, right: 60, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 960, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, fontSize: 40, fontWeight: 800, textAlign: 'center',
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
      <Blueprint t={t + 3} id="ie" wobble={lerp(0.4, 1, seg(t, 0, 4))} />
      <div style={{ position: 'absolute', left: 90, top: 300, width: 900, boxSizing: 'border-box', padding: '34px 40px 30px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 68, lineHeight: 1 }}>Ti è servito?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 28 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 40, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 40, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '24px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con la spiegazione che vorresti.</p>
      </div>
      <p style={{ position: 'absolute', left: 60, right: 60, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 960, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, fontSize: 44, fontWeight: 800, textAlign: 'center', lineHeight: 1.25,
        opacity: line, transform: `translateY(${(1 - line) * 14}px)` }}>
        {film.finale.voce}
      </p>
    </div>
  );
};
