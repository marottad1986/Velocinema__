import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Glow, Gulls, NearMotes, Reflection, WaveLines } from '../../lib/elements';
import type { PosterProps } from '../../types';

// Copertina e finale di The Truman Show. Locandina originale: niente volti né collage.
// Copertina: Seahaven dall'alto dentro una cupola di cielo dipinto (giunture visibili), riflettori in alto, spia REC.
// Finale: il cielo dipinto come un muro, con la porta aperta sul buio, la scaletta e la barca ferma.
// Piani: cielo/cupola (0,2) · nuvole dipinte (0,3) · isola o muro (0,5) · mare (0,7) · primo piano (1,2) · pulviscolo (1,6)

const K = '#142235';
const r = rng(1998);
const HOUSES = Array.from({ length: 22 }, (_, i) => ({ x: 250 + (i % 11) * 52 + (i > 10 ? 26 : 0), y: i > 10 ? 1098 : 1070, c: ['#F4F1E6', '#F7D9C4', '#CFE8F2', '#F6E7A8'][Math.floor(r() * 4)], roof: r() > 0.5 ? '#E07A5F' : '#7FB3D5' }));
const PUFFS = Array.from({ length: 7 }, (_, i) => ({ x: 60 + i * 170 + r() * 40, y: 560 + (i % 2) * 120 + r() * 40, s: 0.8 + r() * 0.5 }));

/** Nuvola "da set": tre cerchi regolari, contorno sottile. */
const Puff: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-90 20 a40 40 0 0 1 30 -50 a50 50 0 0 1 90 -6 a38 38 0 0 1 60 36 a26 26 0 0 1 0 20 Z" fill="#FFFFFF" stroke="#B8DCEB" strokeWidth="4" />
    <path d="M-80 18 H100" stroke="#DCEFF6" strokeWidth="6" />
  </g>
);

/** Griglia di giunture del cielo dipinto. */
const Seams: React.FC<{ y0: number; y1: number; opacity: number }> = ({ y0, y1, opacity }) => (
  <g stroke="#7FB8D6" strokeWidth="3" opacity={opacity}>
    {Array.from({ length: 9 }, (_, i) => <path key={`v${i}`} d={`M${-120 + i * 165} ${y0} V${y1}`} />)}
    {Array.from({ length: 6 }, (_, i) => <path key={`h${i}`} d={`M-200 ${y0 + (i + 1) * ((y1 - y0) / 7)} H1280`} />)}
  </g>
);

const Copertina_: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="tc" />
        <Lin id="tc-sky" stops={[[0, '#5FA9D6'], [0.35, '#8FD3F4'], [0.55, '#CDEBF7'], [0.6, '#EAF6FB']]} />
        <Lin id="tc-sea" stops={[[0, '#6FC0E0'], [0.4, '#3E8FBF'], [1, '#1E4E73']]} />
        <Lin id="tc-dome" x2={1} y2={0} stops={[[0, '#142235', 0.35], [0.12, '#142235', 0], [0.88, '#142235', 0], [1, '#142235', 0.35]]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#tc-sky)" />
          {/* giunture della cupola: archi che convergono in alto */}
          <g fill="none" stroke="#6FB0D3" strokeWidth="3" opacity=".55">
            {[-600, -300, 0, 300, 600].map((d) => <path key={d} d={`M${540 + d * 1.6} 1160 Q${540 + d * 0.9} 300 540 -60`} />)}
            {[420, 700, 960].map((y) => <path key={y} d={`M-200 ${y} Q540 ${y - 140} 1280 ${y}`} />)}
          </g>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#tc-dome)" />
        </g>
        <g transform={L(0.3, Math.sin(t * 0.3) * 10)}>{PUFFS.map((p, i) => <Puff key={i} {...p} />)}</g>
        {/* l'isola con le villette */}
        <g transform={L(0.5)}>
          <path d="M160 1150 Q240 1040 400 1050 Q540 1010 700 1046 Q860 1040 930 1150 Z" fill="#9BD08A" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          <path d="M700 1046 Q860 1040 930 1150" fill="none" stroke="#E6F6D8" strokeWidth="4" />
          {HOUSES.map((h, i) => (
            <g key={i}>
              <rect x={h.x} y={h.y} width="34" height="24" fill={h.c} stroke={K} strokeWidth="3" />
              <path d={`M${h.x - 4} ${h.y} L${h.x + 17} ${h.y - 16} L${h.x + 38} ${h.y} Z`} fill={h.roof} stroke={K} strokeWidth="3" strokeLinejoin="round" />
              <rect x={h.x + 13} y={h.y + 8} width="8" height="8" fill="#FFD98A" opacity={0.6 + 0.4 * Math.sin(t * 2 + i)} />
            </g>
          ))}
          <path d="M800 1080 L806 1010 H822 L828 1080 Z" fill="#F4F1E6" stroke={K} strokeWidth="4" />
          <path d="M803 1040 H825" stroke="#E07A5F" strokeWidth="8" />
          <Glow id="tc-lh" x={814} y={1004} r={40} t={t} color="#FFE7A0" amp={0.15} rate={3} />
        </g>
        {/* mare chiuso dal bordo della cupola */}
        <g transform={L(0.7)}>
          <rect x="-200" y="1148" width="1480" height="900" fill="url(#tc-sea)" />
          <path d="M-200 1148 Q540 1120 1280 1148" fill="none" stroke="#2F5F80" strokeWidth="8" />
          <path d="M-200 1146 Q540 1118 1280 1146" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity=".7" />
          <Reflection t={t} x={540} y={1170} color="#FFFFFF" n={8} w={90} opacity={0.4} />
          <WaveLines t={t} ys={[1230, 1320, 1440, 1580]} color="#BFE5F4" speed={30} opacity={0.55} />
        </g>
        <g transform={L(0.6)}><Gulls t={t} y={820} h={120} color={K} /></g>
        {/* riflettori appesi in alto */}
        <g transform={L(1.2)}>
          <path d="M-200 150 H1280" stroke="#2B3A4F" strokeWidth="26" />
          <path d="M-200 170 H1280" stroke="#2B3A4F" strokeWidth="8" />
          {Array.from({ length: 18 }, (_, i) => <path key={i} d={`M${-200 + i * 85} 140 l42 30 l42 -30`} fill="none" stroke="#2B3A4F" strokeWidth="5" />)}
          {[230, 850].map((x, i) => (
            <g key={x}>
              <Beam id={`tc-beam${i}`} x={x} y={225} t={t} length={1100} spread={300} color="#FFF6D8" angle={i ? 112 : 68} sweep={4} sweepRate={0.5 + i * 0.2} opacity={0.35} />
              <path d={`M${x - 8} 170 V200`} stroke="#2B3A4F" strokeWidth="8" />
              <rect x={x - 46} y="196" width="92" height="60" rx="10" fill="#33445C" stroke={K} strokeWidth="6" transform={`rotate(${i ? 22 : -22} ${x} 226)`} />
              <Glow id={`tc-lamp${i}`} x={x} y={240} r={70} t={t} color="#FFF6D8" amp={0.1} rate={2 + i} opacity={0.8} />
            </g>
          ))}
        </g>
        <g transform={L(1.6)}><NearMotes id="tc-near" t={t} color="#FFFFFF" opacity={0.12} /></g>
      </g>
      <Finish id="tc" tint="#8FD3F4" tintOpacity={0.1} />
    </svg>
  );
};

const Finale_: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const door = { x: 470, y: 960, w: 140, h: 210 };
  const open = eo(seg(t, 0.2, 1.4));
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="tf" />
        <Lin id="tf-sky" stops={[[0, '#F7C9A8'], [0.3, '#F6E2C4'], [0.5, '#BFE3F2'], [0.62, '#8FD3F4']]} />
        <Lin id="tf-sea" stops={[[0, '#9FD6EA'], [0.3, '#5AA9CF'], [1, '#1E4E73']]} />
        <Lin id="tf-void" stops={[[0, '#05080D'], [1, '#142235']]} />
      </defs>
      <g transform={cam.transform}>
        {/* il muro dipinto */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#tf-sky)" />
          {PUFFS.map((p, i) => <Puff key={i} {...p} y={p.y + 120} />)}
          <Seams y0={-200} y1={1200} opacity={0.5} />
          {/* gabbiani dipinti, immobili */}
          <path d="M760 520 q14 -12 28 0 q14 -12 28 0 M840 580 q10 -9 20 0 q10 -9 20 0" fill="none" stroke="#7FB8D6" strokeWidth="5" strokeLinecap="round" />
          {/* scaletta lungo il muro */}
          {Array.from({ length: 8 }, (_, i) => {
            const x = 140 + i * 42, y = 1190 - i * 28;
            return <rect key={i} x={x} y={y} width="60" height="14" fill="#F4F1E6" stroke={K} strokeWidth="4" />;
          })}
          <path d="M140 1204 L470 980" stroke={K} strokeWidth="5" />
          {/* porta aperta sul buio */}
          <rect x={door.x} y={door.y} width={door.w} height={door.h} fill="url(#tf-void)" stroke={K} strokeWidth="8" />
          <Glow id="tf-door" x={door.x + door.w / 2} y={door.y + door.h / 2} r={220} t={t} color="#FFF6D8" amp={0.06} rate={1.5} opacity={0.35} />
          <path d={`M${door.x + door.w} ${door.y} L${door.x + door.w + 70 * open} ${door.y + 18 * open} V${door.y + door.h - 18 * open} L${door.x + door.w} ${door.y + door.h} Z`} fill="#BFE3F2" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          <text x={door.x + door.w / 2} y={door.y - 18} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="30" fill="#F2994A" stroke={K} strokeWidth="5" paintOrder="stroke">USCITA</text>
        </g>
        {/* mare calmo */}
        <g transform={L(0.7)}>
          <rect x="-200" y="1196" width="1480" height="900" fill="url(#tf-sea)" />
          <path d="M-200 1198 H1280" stroke={K} strokeWidth="6" />
          <Reflection t={t} x={door.x + door.w / 2 + cam.pan * 0.4} y={1215} color="#F4F1E6" n={9} w={80} opacity={0.45} />
          <WaveLines t={t} ys={[1260, 1360, 1500]} color="#D8F0F8" speed={18} opacity={0.5} />
        </g>
        <g transform={L(0.6)}><Gulls t={t} y={760} h={100} color={K} n={2} /></g>
        {/* la barca a vela ferma, in primo piano */}
        <g transform={L(1.15)}>
          <g transform={`translate(330 ${1560 + Math.sin(t * 1.4) * 6}) rotate(${Math.sin(t * 1.4 + 1) * 1.5})`}>
            <path d="M-170 0 H170 L130 70 H-130 Z" fill="#F4F1E6" stroke={K} strokeWidth="9" strokeLinejoin="round" />
            <path d="M-160 20 H160" stroke="#F2994A" strokeWidth="12" />
            <path d="M0 0 V-360" stroke={K} strokeWidth="10" />
            <path d="M8 -350 L8 -20 L170 -20 Z" fill="#FFFFFF" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            <path d="M-8 -300 L-8 -20 L-120 -20 Z" fill="#E9F4F8" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            <text x="0" y="56" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="26" fill={K}>SANTA MARIA</text>
          </g>
        </g>
        <g transform={L(1.6)}><NearMotes id="tf-near" t={t} color="#FFF6D8" opacity={0.12} /></g>
      </g>
      <Finish id="tf" tint="#8FD3F4" tintOpacity={0.1} />
    </svg>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const tag = eo(seg(t, 0.05, 0.45));
  const l1 = eob(seg(t, 0.15, 0.7), 1.4);
  const dir = eo(seg(t, 0.6, 1.0));
  const line = eo(seg(t, 1.1, 1.6));
  const rec = mod(t, 1) < 0.6 ? 1 : 0.25;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Copertina_ t={t} dur={dur} />
      <div style={{ position: 'absolute', right: 70, top: 292, display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#FFFFFF', letterSpacing: '0.1em', textShadow: `0 2px 0 ${P.scuro}` }}>
        <span style={{ width: 22, height: 22, borderRadius: 11, background: '#E5383B', opacity: rec, boxShadow: `0 0 18px #E5383B` }} />
        REC
      </div>
      <div style={{ position: 'absolute', left: 80, top: 290, width: 920, fontFamily: SANS, color: P.scuro }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.accento, opacity: tag, textShadow: `0 2px 0 ${P.scuro}` }}>IL FILM IN 2 MINUTI</p>
        <h1 style={{ margin: '14px 0 0', fontFamily: DISPLAY, fontWeight: 800, fontSize: 180, lineHeight: 0.9, letterSpacing: '-0.02em', color: P.chiaro,
          textShadow: `0 7px 0 ${P.scuro}`, opacity: seg(t, 0.15, 0.4), transform: `translateY(${(1 - l1) * 50}px)` }}>
          The Truman Show
        </h1>
        <p style={{ margin: '24px 0 0', fontSize: 40, fontWeight: 800, opacity: dir, color: P.scuro }}>un film di {film.regista} · {film.anno}</p>
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
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con il film che vorresti.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 700, margin: 0, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 800, fontSize: 190, lineHeight: 1,
        color: P.chiaro, textShadow: `0 7px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        The End
      </h1>
    </div>
  );
};
