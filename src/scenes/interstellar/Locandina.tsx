import React from 'react';
import { camera, eo, eob, lerp, mod, seg } from '../../lib/anim';
import { DISPLAY, SANS, SYNCOPATE } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, NearMotes, Stars } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { BlackHole, Corn, GOLD } from './Spazio';

// Copertina e finale di Interstellar. Locandina originale: niente astronauti, niente astronave accanto a Saturno, niente
// pickup tra il mais (locandine ufficiali).
// Copertina: campo di mais al tramonto sotto un cielo che si apre in un buco nero con l'anello dorato; in primo piano, sul
// bordo di una libreria, un orologio da polso con la lancetta che scatta.
// Finale: il pianeta di Amelia all'alba, rocce rossastre, una tenda illuminata e una bandierina; il buco nero lontano.
// Piani: cielo (0,2) · buco nero (0,3) · orizzonte (0,5) · mais o rocce (0,8) · primo piano (1,2) · particelle (1,6)

const K = '#0A0F18';

const Copertina_: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const tick = Math.floor(t * 2) * 6;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ic" />
        <Lin id="ic-sky" stops={[[0, '#03050C'], [0.35, '#141C30'], [0.55, '#5A4A5A'], [0.64, '#C9846A'], [0.68, '#F2B87A']]} />
        <Lin id="ic-field" stops={[[0, '#6E6A3A'], [1, '#2A2818']]} />
        <Lin id="ic-shelf" stops={[[0, '#5A4430'], [1, '#2A1E14']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#ic-sky)" />
          <Stars t={t} seed={51} n={60} y={-100} h={900} color="#DCE8F2" size={0.8} />
        </g>
        <g transform={L(0.3)}>
          <BlackHole id="ic-bh" x={600} y={860} r={110} t={t} tilt={-7} />
        </g>
        <g transform={L(0.5)}>
          <path d="M-200 1250 Q540 1230 1280 1250 V1500 H-200 Z" fill="url(#ic-field)" />
          <Glow id="ic-dusk" x={540} y={1250} r={600} t={t} color="#F2B87A" amp={0.03} rate={1} opacity={0.3} />
        </g>
        <g transform={L(0.8)}>
          <Corn t={t} y={1400} n={30} h={200} seed={9} color="#6E7A3A" outline="#1A1408" />
        </g>
        <g transform={L(1.2)}>
          <path d="M-200 1580 H1280 V2200 H-200 Z" fill="url(#ic-shelf)" stroke={K} strokeWidth="10" />
          <path d="M-200 1588 H1280" stroke="#9A7A5A" strokeWidth="5" />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-120 + i * 60} y={1580 - 150 - (i % 3) * 20} width="52" height={150 + (i % 3) * 20} rx="4" fill={['#7A5A3E', '#4E5A6A', '#8A6A4A'][i % 3]} stroke={K} strokeWidth="5" />)}
          <g transform="translate(700 1560) rotate(-6)">
            <Glow id="ic-wg" x={0} y={0} r={200} t={t} color={GOLD} amp={0.12} rate={3} opacity={0.5} />
            <path d="M-180 -26 H-90 M90 -26 H180 M-180 26 H-90 M90 26 H180" stroke="#3A2C20" strokeWidth="36" strokeLinecap="round" />
            <circle r="96" fill="#EEE8DC" stroke={K} strokeWidth="9" />
            <circle r="96" fill="none" stroke={GOLD} strokeWidth="7" />
            {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 -84 V-72" stroke={K} strokeWidth="5" transform={`rotate(${i * 30})`} />)}
            <path d="M0 0 V-54" stroke={K} strokeWidth="9" strokeLinecap="round" transform="rotate(50)" />
            <path d="M0 0 V-38" stroke={K} strokeWidth="9" strokeLinecap="round" transform="rotate(210)" />
            <path d="M0 10 V-78" stroke={GOLD} strokeWidth="4" strokeLinecap="round" transform={`rotate(${tick})`} />
            <circle r="8" fill={K} />
          </g>
        </g>
        <g transform={L(1.6)}><NearMotes id="ic-near" t={t} color="#F2D8A8" n={7} vx={-40} vy={-4} opacity={0.1} /></g>
      </g>
      <Finish id="ic" tint="#3E6A8A" tintOpacity={0.08} />
    </svg>
  );
};

const Finale_: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const flag = Math.sin(t * 4);
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ie" />
        <Lin id="ie-sky" stops={[[0, '#2A3448'], [0.4, '#8A6A6E'], [0.6, '#E8A87A'], [0.66, '#F6D49A']]} />
        <Lin id="ie-rock" x2={1} y2={0} stops={[[0, '#5A3A2E'], [0.6, '#8A5A42'], [1, '#B8805A']]} />
        <Lin id="ie-ground" stops={[[0, '#9A6A4A'], [1, '#3A241A']]} />
        <Lin id="ie-tent" x2={1} y2={0} stops={[[0, '#C9D3DB'], [0.6, '#EEF2F4'], [1, '#9AA8B4']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#ie-sky)" />
          <Stars t={t} seed={61} n={30} y={-100} h={500} color="#F2E8D8" size={0.8} />
          <BlackHole id="ie-bh" x={880} y={960} r={34} t={t} tilt={-8} glow={0.7} />
          <circle cx="300" cy="1020" r="70" fill="#FFF0D0" opacity=".9" />
          <Glow id="ie-sun" x={300} y={1020} r={320} t={t} color="#FFE6B8" amp={0.04} rate={1} opacity={0.6} />
        </g>
        <g transform={L(0.5)}>
          <path d="M-200 1200 L-40 1080 L120 1140 L300 1040 L460 1150 L640 1060 L820 1140 L1000 1060 L1280 1160 V1400 H-200 Z" fill="url(#ie-rock)" stroke={K} strokeWidth="6" strokeLinejoin="round" />
        </g>
        <g transform={L(0.8)}>
          <path d="M-200 1260 Q540 1230 1280 1260 V2200 H-200 Z" fill="url(#ie-ground)" />
          <g transform="translate(620 1300)">
            <Glow id="ie-tg" x={0} y={-50} r={180} t={t} color="#FFE6A8" amp={0.08} rate={2} opacity={0.6} />
            <path d="M-120 0 L0 -130 L120 0 Z" fill="url(#ie-tent)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d="M-30 0 L0 -50 L30 0 Z" fill="#FFE6A8" stroke={K} strokeWidth="5" />
          </g>
          <g transform="translate(820 1300)">
            <path d="M0 0 V-150" stroke={K} strokeWidth="7" />
            <path d={`M0 -150 Q30 ${-160 + flag * 6} 60 -146 Q30 ${-130 + flag * 6} 0 -120 Z`} fill={GOLD} stroke={K} strokeWidth="4" />
          </g>
        </g>
        <g transform={L(1.2)}>
          <path d="M-200 1980 V1560 L-40 1500 L120 1600 L200 1980 Z" fill="#4A2E22" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M1280 1980 V1520 L1100 1470 L960 1580 L920 1980 Z" fill="#4A2E22" stroke={K} strokeWidth="8" strokeLinejoin="round" />
        </g>
        <g transform={L(1.6)}><NearMotes id="ie-near" t={t + mod(0, 1)} color="#FFE6C0" n={6} vx={-25} vy={-6} opacity={0.1} /></g>
      </g>
      <Finish id="ie" tint="#C9846A" tintOpacity={0.06} />
    </svg>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const tag = eo(seg(t, 0.05, 0.45));
  const l1 = eob(seg(t, 0.15, 0.7), 1.4);
  const dir = eo(seg(t, 0.6, 1.0));
  const line = eo(seg(t, 1.2, 1.7));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Copertina_ t={t} dur={dur} />
      <div style={{ position: 'absolute', left: 80, top: 290, width: 920, fontFamily: SANS }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.accento, opacity: tag, textShadow: `0 2px 0 ${P.scuro}` }}>IL FILM IN 2 MINUTI</p>
        <h1 style={{ margin: '22px 0 0', fontFamily: SYNCOPATE, fontWeight: 700, fontSize: 80, lineHeight: 1, letterSpacing: '0.06em', color: P.chiaro,
          textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.15, 0.4), transform: `translateY(${(1 - l1) * 50}px)` }}>
          INTERSTELLAR
        </h1>
        <p style={{ margin: '26px 0 0', fontSize: 40, fontWeight: 800, opacity: dir, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>un film di {film.regista} · {film.anno}</p>
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
      <Finale_ t={t} dur={dur} />
      <div style={{ position: 'absolute', left: 90, top: 300, width: 900, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con il film che vorresti.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 760, margin: 0, textAlign: 'center', fontFamily: SYNCOPATE, fontWeight: 700, fontSize: 120, lineHeight: 1, letterSpacing: '0.1em',
        color: P.chiaro, textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        THE END
      </h1>
    </div>
  );
};
