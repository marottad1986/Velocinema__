import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { ANTON, DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, NearMotes, Smoke, SunRays } from '../../lib/elements';
import { Speciale } from '../../components/Speciale';
import type { PosterProps } from '../../types';
import { Completo, K, Palazzo, Parrucca } from './Comuni';

// Copertina e finale di Joker. Locandina originale: niente volto truccato, niente figura che balla sulle scale, niente
// logo del film. Copertina: notte, la lunga scalinata tra i palazzi con la luce gialla dei lampioni e il vapore dei
// tombini; in cima, sul primo gradino, la giacca rossa e la parrucca abbandonate. Finale: l'alba sulla scalinata vuota
// con la parrucca dimenticata su un gradino.

const Scale: React.FC<{ id: string; dark?: boolean }> = ({ id, dark = true }) => (
  <g>
    <path d="M300 900 H780 L980 2200 H100 Z" fill={`url(#${id})`} />
    {Array.from({ length: 22 }, (_, i) => {
      const y = 900 + i * i * 1.8 + i * 18;
      const k = (y - 900) / 1300;
      return <path key={i} d={`M${300 - 200 * k} ${y} H${780 + 200 * k}`} stroke={dark ? '#14120E' : '#5A564E'} strokeWidth={3 + 4 * k} />;
    })}
    <path d="M300 900 L100 2200 M780 900 L980 2200" stroke={K} strokeWidth="10" />
  </g>
);

const Copertina_: React.FC<{ t: number; dur: number; accent: string }> = ({ t, dur, accent }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="jc" />
        <Lin id="jc-sky" stops={[[0, '#08080C'], [1, '#2A2420']]} />
        <Lin id="jc-step" stops={[[0, '#3A362E'], [1, '#1A1814']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.15)}><rect x="-200" y="-200" width="1480" height="2400" fill="url(#jc-sky)" /></g>
        <g transform={L(0.35)}>
          <Palazzo x={-200} y={1150} w={520} h={560} t={t} color="#3A2418" lit={0.3} seed={2} />
          <Palazzo x={760} y={1150} w={520} h={600} t={t} color="#2E1E16" lit={0.25} seed={7} />
        </g>
        <g transform={L(0.6)}>
          <Scale id="jc-step" />
          {[[240, 960], [840, 960]].map(([x, y], i) => <g key={i}><path d={`M${x} ${y} V${y - 220}`} stroke={K} strokeWidth="8" /><circle cx={x} cy={y - 230} r="14" fill="#F2C46A" /><Glow id={`jc-l${i}`} x={x} y={y - 230} r={260} t={t} color="#F2C46A" amp={0.05} rate={2 + i} opacity={0.55} /></g>)}
        </g>
        <g transform={L(0.9)}>
          <g transform="translate(540 1020) rotate(-70)"><Completo x={0} y={0} s={0.6} color={accent} /></g>
          <Parrucca x={700} y={1040} s={0.55} />
          <Glow id="jc-red" x={560} y={1020} r={260} t={t} color="#FF6A4A" amp={0.08} rate={2} opacity={0.35} />
        </g>
        <g transform={L(1.3)}>
          <Smoke id="jc-st" t={t} x={260} y={1560} color="#8A8478" rise={400} wind={80} r0={40} r1={180} speed={0.22} opacity={0.5} />
        </g>
        <g transform={L(1.6)}><NearMotes id="jc-near" t={t} color="#F2E6C0" n={6} opacity={0.08} /></g>
      </g>
      <Finish id="jc" tint="#2A2014" tintOpacity={0.12} />
    </svg>
  );
};

const Finale_: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="jf" />
        <Lin id="jf-sky" stops={[[0, '#5A6A80'], [0.6, '#E8B8A0'], [1, '#F4D8B8']]} />
        <Lin id="jf-step" stops={[[0, '#A89C8C'], [1, '#5A544A']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.15)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#jf-sky)" />
          <SunRays id="jf-rays" x={540} y={820} t={t} color="#FFE8C8" n={9} length={900} opacity={0.3} />
        </g>
        <g transform={L(0.35)}>
          <Palazzo x={-200} y={1150} w={520} h={560} t={t} color="#7A4A34" lit={0.05} seed={2} />
          <Palazzo x={760} y={1150} w={520} h={600} t={t} color="#6A4030" lit={0.05} seed={7} />
        </g>
        <g transform={L(0.6)}><Scale id="jf-step" dark={false} /></g>
        <g transform={L(0.9)}><Parrucca x={620} y={1560} s={0.7} /></g>
        <g transform={L(1.3)}>
          <Smoke id="jf-st" t={t} x={300} y={1700} color="#E8E0D0" rise={400} wind={60} r0={40} r1={160} speed={0.2} opacity={0.4} />
        </g>
        <g transform={L(1.6)}><NearMotes id="jf-near" t={t} color="#FFFFFF" n={6} y0={1300} opacity={0.08} /></g>
      </g>
      <Finish id="jf" tint="#3A2A1E" tintOpacity={0.06} />
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
      <Copertina_ t={t} dur={dur} accent={P.accento} />
      <div style={{ position: 'absolute', left: 80, top: 290, width: 920, fontFamily: SANS, color: P.chiaro }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.chiaro, opacity: tag, textShadow: `0 2px 0 ${P.scuro}` }}>IL FILM IN 2 MINUTI<Speciale nome={film.copertina.speciale} scale={eob(seg(t, 0.4, 0.8), 1.6)} /></p>
        <h1 style={{ margin: '14px 0 0', fontFamily: ANTON, fontWeight: 400, fontSize: 230, lineHeight: 0.95, letterSpacing: '0.02em', color: P.accento,
          textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.15, 0.4), transform: `translateY(${(1 - l1) * 50}px)` }}>
          JOKER
        </h1>
        <p style={{ margin: '20px 0 0', fontSize: 40, fontWeight: 800, opacity: dir, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>un film di {film.regista} · {film.anno}</p>
      </div>
      <p style={{ position: 'absolute', left: 60, right: 60, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 960, boxSizing: 'border-box', padding: '12px 26px 14px',
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
      <Finale_ t={t} dur={dur} />
      <div style={{ position: 'absolute', left: 90, top: 300, width: 900, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.chiaro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con il film che vorresti.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 820, margin: 0, textAlign: 'center', fontFamily: ANTON, fontWeight: 400, fontSize: 170, lineHeight: 1,
        color: P.accento, textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        THE END
      </h1>
    </div>
  );
};
