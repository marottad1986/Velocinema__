import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { DISPLAY, SANS, SERIF } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Flyers, Fog, Glow, Gulls, NearMotes, SunRays } from '../../lib/elements';
import { Speciale } from '../../components/Speciale';
import type { PosterProps } from '../../types';
import { K, Lampada, OthersDefs, Villa } from './Comuni';

// Copertina e finale di The Others. Locandina originale: niente donna con i bambini, niente persone, niente logo.
// Copertina: notte di nebbia, la villa con tutte le tende chiuse tranne una finestra accesa, alberi spogli, il cancello
// e in primo piano la lampada a petrolio accesa sul pilastro. Finale: la stessa villa all'alba, le tende aperte, la
// nebbia che si alza e la lampada ancora accesa sul pilastro.

/** Albero spoglio stilizzato ai lati (rami fissi). */
const Albero: React.FC<{ x: number; y: number; s: number; flip?: boolean; color: string }> = ({ x, y, s, flip, color }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} stroke={color} strokeLinecap="round" fill="none">
    <path d="M0 0 Q10 -200 -10 -420" strokeWidth="46" />
    <path d="M-4 -240 Q80 -300 150 -400 M-8 -330 Q-90 -380 -150 -470 M120 -360 l60 -40 M-110 -420 l-20 -60 M-10 -420 Q10 -480 0 -540" strokeWidth="18" />
    <path d="M150 -400 l30 -70 M-150 -470 l-40 -20 M0 -540 l-30 -40 M0 -540 l30 -50" strokeWidth="9" />
  </g>
);

const Sfondo: React.FC<{ id: string; t: number; dur: number; dawn: boolean }> = ({ id, t, dur, dawn }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const lit = dawn ? [] : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0.95];
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <OthersDefs id={id} />
        <Lin id={`${id}-sky`} stops={dawn ? [[0, '#3A4A58'], [0.4, '#8A9AA0'], [0.65, '#D8D0B8'], [0.8, '#E8D8B0']] : [[0, '#06090C'], [0.35, '#141E24'], [0.6, '#2E3C40'], [0.8, '#4A5856']]} />
        <Lin id={`${id}-lawn`} stops={dawn ? [[0, '#4A5A44'], [1, '#141C10']] : [[0, '#1A2420'], [1, '#060A08']]} />
        <Lin id={`${id}-drive`} stops={dawn ? [[0, '#A8A89A'], [1, '#4A4A40']] : [[0, '#4A4E48'], [1, '#141612']]} />
        <Lin id={`${id}-pillar`} x2={1} y2={0} stops={dawn ? [[0, '#9AA09A'], [0.5, '#7A807A'], [1, '#4A504C']] : [[0, '#5A605C'], [0.5, '#3E4440'], [1, '#1E2220']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill={`url(#${id}-sky)`} />
          {dawn ? (
            <>
              <SunRays id={`${id}-rays`} x={760} y={1060} t={t} color="#FFF0C8" n={11} length={900} opacity={0.3} />
              <Glow id={`${id}-sun`} x={760} y={1060} r={360} t={t} color="#FFE8B8" amp={0.03} rate={1} opacity={0.7} />
            </>
          ) : (
            <>
              <Glow id={`${id}-moon`} x={820} y={820} r={240} t={t} color="#C8D6D8" amp={0.03} rate={0.8} opacity={0.4} />
              <circle cx="820" cy="820" r="44" fill="#C8D2D0" opacity=".5" />
            </>
          )}
          <Gulls t={t} seed={3} n={4} y={dawn ? 960 : 780} h={dawn ? 60 : 120} color={dawn ? '#2A3032' : '#0A0D0E'} size={0.75} period={13} />
        </g>
        <g transform={L(0.45)}>
          {Array.from({ length: 16 }, (_, i) => (
            <ellipse key={i} cx={-140 + i * 92} cy={1190 - (i % 3) * 30} rx={60} ry={110 + (i % 4) * 20} fill={dawn ? '#6A786E' : '#1E2A28'} opacity=".6" />
          ))}
          <Fog id={`${id}-f1`} t={t} y={1220} rx={900} ry={100} color={dawn ? '#E8E8DC' : '#6A7A76'} opacity={0.6} speed={0.2} />
        </g>
        <g transform={L(0.62)}>
          <Villa id={id} x={540} y={dawn ? 1360 : 1330} t={t} s={dawn ? 0.74 : 0.86} lit={lit} open={dawn ? 1 : 0} />
          {!dawn && <Glow id={`${id}-win`} x={540 + 76 * 0.86} y={1330 - 350 * 0.86} r={150} t={t} color="#FFC870" amp={0.06} rate={6} opacity={0.6} />}
          <Fog id={`${id}-f2`} t={t} y={1310} rx={720} ry={70} color={dawn ? '#F2F0E4' : '#7E8C86'} opacity={0.55} speed={0.25} ph={1} drift={120} />
        </g>
        <g transform={L(0.9)}>
          <path d="M-200 1345 Q540 1325 1280 1345 V2200 H-200 Z" fill={`url(#${id}-lawn)`} />
          <path d="M494 1340 H586 L860 2200 H220 Z" fill={`url(#${id}-drive)`} stroke={K} strokeWidth="6" />
          <Albero x={60} y={1420} s={1.05} color={dawn ? '#2A3230' : '#0C1010'} />
          <Albero x={1030} y={1410} s={0.95} flip color={dawn ? '#2A3230' : '#0C1010'} />
          <Fog id={`${id}-f3`} t={t} y={1440} rx={820} ry={90} color={dawn ? '#F2F0E4' : '#8A9894'} opacity={0.45} speed={0.18} ph={2.5} />
        </g>
        <g transform={L(1.2)}>
          {[[-60, 1500], [830, 1440]].map(([px, py], i) => (
            <g key={i}>
              <rect x={px} y={py} width="190" height={2000 - py} fill={`url(#${id}-pillar)`} stroke={K} strokeWidth="9" />
              {Array.from({ length: 6 }, (_, k) => <path key={k} d={`M${px} ${py + 70 + k * 80} H${px + 190}`} stroke="#000" strokeWidth="3" opacity=".25" />)}
              <rect x={px - 18} y={py - 30} width="226" height="36" fill={dawn ? '#9AA09A' : '#5A605C'} stroke={K} strokeWidth="7" />
            </g>
          ))}
          <Glow id={`${id}-lb`} x={925} y={1270} r={460} t={t} color="#FFC870" amp={0.06} rate={7} opacity={dawn ? 0.35 : 0.6} />
          <Lampada id={id} x={925} y={1410} t={t} s={0.72} ph={0.7} />
        </g>
        <g transform={L(1.5)}>
          <Flyers t={t} seed={11} n={5} color="#6A5A3A" outline={K} w={30} h={40} y0={900} y1={1800} speed={0.08} shape="leaf" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id={`${id}-near`} t={t} color={dawn ? '#FFF6E0' : '#C8D4CE'} n={7} r0={80} r1={180} opacity={0.12} />
        </g>
      </g>
      <Finish id={id} tint={dawn ? '#E8D8A8' : '#3A4744'} tintOpacity={dawn ? 0.08 : 0.12} />
    </svg>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const tag = eo(seg(t, 0.05, 0.45));
  const l1 = eob(seg(t, 0.15, 0.7), 1.4);
  const dir = eo(seg(t, 0.6, 1.0));
  const line = eo(seg(t, 1.1, 1.6));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sfondo id="oc" t={t} dur={dur} dawn={false} />
      <div style={{ position: 'absolute', left: 80, top: 290, width: 920, fontFamily: SANS, color: P.chiaro }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.chiaro, opacity: tag, textShadow: `0 2px 0 ${P.scuro}` }}>IL FILM IN 2 MINUTI<Speciale nome={film.copertina.speciale} scale={eob(seg(t, 0.4, 0.8), 1.6)} /></p>
        <h1 style={{ margin: '10px 0 0', fontFamily: SERIF, fontWeight: 400, fontSize: 200, lineHeight: 0.95, letterSpacing: '0.01em', color: P.accento,
          textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.15, 0.4), transform: `translateY(${(1 - l1) * 50}px)` }}>
          The Others
        </h1>
        <p style={{ margin: '20px 0 0', fontSize: 40, fontWeight: 800, opacity: dir, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>un film di {film.regista} · {film.anno}</p>
      </div>
      <p style={{ position: 'absolute', left: 60, right: 180, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 840, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, fontSize: 40, fontWeight: 800, textAlign: 'center',
        opacity: line, transform: `translateY(${(1 - line) * 14}px)` }}>
        {film.copertina.frase_lancio}
      </p>
    </div>
  );
};

export const Finale: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const card = eo(seg(t, 0.1, 0.5));
  const b1 = eob(seg(t, 0.5, 0.9), 1.8);
  const b2 = eob(seg(t, 0.7, 1.1), 1.8);
  const end = eob(seg(t, 0.3, 0.9), 1.3);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sfondo id="of" t={t} dur={dur} dawn />
      <div style={{ position: 'absolute', left: 90, top: 300, width: 900, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con il film che vorresti.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 680, margin: 0, textAlign: 'center', fontFamily: SERIF, fontWeight: 400, fontSize: 170, lineHeight: 1,
        color: P.accento, textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        The End
      </h1>
    </div>
  );
};
