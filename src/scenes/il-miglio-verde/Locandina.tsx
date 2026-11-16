import React from 'react';
import { eo, eob, lerp, seg } from '../../lib/anim';
import { CRIMSON, DISPLAY, SANS } from '../../lib/fonts';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs } from '../../lib/fx';
import { Speciale } from '../../components/Speciale';
import type { PosterProps } from '../../types';
import { Corridor, GOLD, Mouse, Spool } from './Comuni';

// Copertina e finale del Miglio verde: locandina originale, niente persone, sagome o locandina ufficiale. Il corridoio verde
// del braccio della morte in prospettiva, con la luce calda in fondo; in primo piano sul pavimento il topolino con il suo
// rocchetto colorato, e nell'aria un pulviscolo dorato che sale come lucciole (il dono di John). La sedia elettrica non
// compare. Il fotogramma 0 è già completo (è la miniatura): etichetta, titolo, regista; la frase di lancio entra da 0,4 s.

const Art: React.FC<{ t: number; id: string; calm?: number }> = ({ t, id, calm = 0 }) => (
  <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
    <defs><FxDefs id={id} /></defs>
    <g transform={`translate(540 1000) scale(${1.06 + 0.02 * Math.sin(t * 0.4)}) translate(-540 -1000)`}>
      <Corridor t={t} id={id} door={0.95} lamps={0.9 - 0.3 * calm} dark={0.1 + 0.2 * calm} />
      {/* le lucciole dorate che salgono dal pavimento */}
      {Array.from({ length: 36 }, (_, i) => {
        const p = ((t * (0.08 + (i % 5) * 0.02) + i * 0.137) % 1);
        const x = 160 + ((i * 197) % 760) + Math.sin(t * 1.3 + i) * 30;
        const y = 1500 - p * 900;
        return (
          <g key={i} opacity={Math.sin(p * Math.PI)}>
            <circle cx={x} cy={y} r={14} fill={GOLD} opacity=".25" />
            <circle cx={x} cy={y} r={4.5} fill="#FFF0B0" />
          </g>
        );
      })}
      {/* il topolino e il rocchetto in primo piano, nella luce */}
      <Glow id={`${id}-m`} x={560} y={1300} r={300} t={t} color={GOLD} amp={0.08} rate={2} opacity={0.35} />
      <ellipse cx="560" cy="1352" rx="230" ry="26" fill="#000" opacity=".3" />
      <Mouse x={470} y={1310} s={1.9} t={t} />
      <Spool x={720} y={1300} s={2.0} roll={t * 20} />
    </g>
    <Dust t={t} top={{ y: 760, x0: 420, x1: 660 }} bottom={{ y: 1400, x0: 200, x1: 880 }} seed={91} n={30} color="#FFE6A8" boost={0.3} />
    <NearMotes id={`${id}-near`} t={t} color={GOLD} n={6} y0={1200} opacity={0.08} />
    <Finish id={id} tint="#1E3A28" tintOpacity={0.12} />
  </svg>
);

export const Copertina: React.FC<PosterProps> = ({ t, film }) => {
  const P = film.palette;
  const breath = 1 + 0.008 * Math.sin(t * 1.6);
  const line = eo(seg(t, 0.4, 0.7));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Art t={t} id="mc" />
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 620, background: `linear-gradient(${P.scuro}E6, ${P.scuro}00)` }} />
      <div style={{ position: 'absolute', left: 120, top: 280, width: 840, fontFamily: SANS, color: P.chiaro }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.chiaro, textShadow: `0 2px 0 ${P.scuro}` }}>IL FILM IN 2 MINUTI<Speciale nome={film.copertina.speciale} scale={1} /></p>
        <h1 style={{ margin: '10px 0 0', fontFamily: CRIMSON, fontWeight: 800, fontSize: 150, lineHeight: 0.92, color: P.chiaro,
          textShadow: `0 6px 0 ${P.scuro}, 0 0 40px ${P.accento}66`, transform: `scale(${breath})`, transformOrigin: 'left center' }}>
          Il miglio<br /><span style={{ color: '#8FD8A0' }}>verde</span>
        </h1>
        <p style={{ margin: '18px 0 0', fontSize: 38, fontWeight: 800, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>un film di {film.regista} · {film.anno}</p>
      </div>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1440, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, fontSize: 42, fontWeight: 800, textAlign: 'center',
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
  const end = eob(seg(t, 0.3, 0.9), 1.3);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Art t={t + 4} id="me" calm={1} />
      <div style={{ position: 'absolute', left: 120, top: 300, width: 840, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con il film che vorresti.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 800, margin: 0, textAlign: 'center', fontFamily: CRIMSON, fontWeight: 800, fontSize: 130, lineHeight: 1,
        color: P.chiaro, textShadow: `0 4px 0 ${P.scuro}, 0 0 30px ${P.accento}88`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        Fine
      </h1>
    </div>
  );
};
