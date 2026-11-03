import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { ANTON, DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, NearMotes, Smoke, SunRays } from '../../lib/elements';
import { Speciale } from '../../components/Speciale';
import type { PosterProps } from '../../types';
import { Completo, JokerDefs, K } from './Comuni';

// Copertina e finale di Joker. Locandina originale: niente volto truccato, niente figura che balla sulle scale, niente
// logo del film. Copertina: notte, la lunga scalinata tra i palazzi con la luce gialla dei lampioni e il vapore dei
// tombini; il completo rosso appeso alla ringhiera. Finale: l'alba sulla scalinata vuota
// con il completo rosso ancora appeso alla ringhiera. La scalinata è la stessa del capitolo 9 (vista dal basso, tra due muri).

const STEPS = 30;
const step = (k: number) => {
  const p = k / 16;
  const p2 = p * p * 0.55 + p * 0.45;
  return { y: 900 + p2 * 520, hw: 110 + p2 * 500, h: 10 + p2 * 32 };
};

/** Punto della ringhiera (f 0 = in cima, 1 = in basso): lì è appeso il completo, come nel capitolo 9. */
const railX = (f: number) => 540 + step(0).hw - 20 + f * (step(16).hw - 60 - step(0).hw + 20);
const railY = (f: number) => step(0).y - 74 + f * (step(16).y - 164 - step(0).y + 74);

/** La scalinata tra due muri alti, vista dal basso (la stessa del capitolo 9). */
const Scala: React.FC<{ id: string; t: number; L: (f: number) => string; night: boolean }> = ({ id, t, L, night }) => (
  <>
    <g transform={L(0.4)}>
      {[[300, 760, 200], [480, 730, 160], [620, 770, 180]].map(([x, top, w], i) => (
        <g key={i}>
          <rect x={x} y={top} width={w} height={940 - top} fill={night ? ['#1E1A20', '#16141A', '#221E22'][i] : ['#8A6A5A', '#7A5A4C', '#9A7A68'][i]} />
          {Array.from({ length: 6 }, (_, k) => <rect key={k} x={x + 20 + (k % 3) * (w / 3)} y={top + 30 + Math.floor(k / 3) * 60} width={w / 3 - 30} height="34" fill={night && (k + i) % 3 === 0 ? '#F2C46A' : night ? '#0E0C10' : '#5A4038'} opacity={night ? 0.8 : 1} />)}
        </g>
      ))}
    </g>
    <g transform={L(0.65)}>
      <path d="M-200 -200 H360 L380 920 L-200 1700 Z" fill={`url(#${id}-wl)`} stroke={K} strokeWidth="8" />
      <path d="M1280 -200 H720 L700 920 L1280 1700 Z" fill={`url(#${id}-wr)`} stroke={K} strokeWidth="8" />
      {Array.from({ length: 26 }, (_, i) => <path key={i} d={`M-200 ${300 + i * 52} L${360 - i * 2} ${400 + i * 20}`} stroke="#000" strokeWidth="3" opacity=".3" />)}
      {Array.from({ length: 26 }, (_, i) => <path key={`r${i}`} d={`M1280 ${300 + i * 52} L${720 + i * 2} ${400 + i * 20}`} stroke="#000" strokeWidth="3" opacity=".3" />)}
      {Array.from({ length: STEPS }, (_, k) => {
        const a = step(k), b = step(k + 1);
        return (
          <g key={k}>
            <path d={`M${540 - a.hw} ${a.y} H${540 + a.hw} L${540 + b.hw} ${b.y - b.h} H${540 - b.hw} Z`} fill={`url(#${id}-st)`} stroke={K} strokeWidth="4" />
            <path d={`M${540 - b.hw} ${b.y - b.h} H${540 + b.hw} V${b.y} H${540 - b.hw} Z`} fill={`url(#${id}-ri)`} stroke={K} strokeWidth="4" />
            <path d={`M${540 - a.hw + 6} ${a.y + 3} H${540 + a.hw - 6}`} stroke={night ? '#8A7A5A' : '#F2E6D0'} strokeWidth="3" opacity=".5" />
          </g>
        );
      })}
      {/* ringhiera */}
      <path d={`M${540 + step(0).hw - 20} ${step(0).y - 70} L${540 + step(16).hw - 60} ${step(16).y - 160}`} stroke={K} strokeWidth="14" />
      <path d={`M${540 + step(0).hw - 20} ${step(0).y - 74} L${540 + step(16).hw - 60} ${step(16).y - 164}`} stroke="#8A9298" strokeWidth="4" />
      {Array.from({ length: 9 }, (_, i) => { const a = step(i * 2); return <path key={i} d={`M${540 + a.hw - 20 - i * 4} ${a.y} V${a.y - 70 - i * 10}`} stroke={K} strokeWidth="8" />; })}
      {/* lampioni a muro */}
      {[[180, 1040], [900, 1040]].map(([x, y], i) => (
        <g key={i}>
          <path d={`M${x} ${y} h${i ? -50 : 50}`} stroke={K} strokeWidth="10" />
          <path d={`M${x + (i ? -80 : 20)} ${y - 10} h60 l-10 40 h-40 Z`} fill="#2A2E33" stroke={K} strokeWidth="5" />
          {night && <Glow id={`${id}-l${i}`} x={x + (i ? -50 : 50)} y={y + 30} r={300} t={t + i} color="#F2C46A" amp={0.05} rate={2} opacity={0.6} />}
        </g>
      ))}
    </g>
  </>
);

const Copertina_: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="jc" />
        <JokerDefs id="jc" />
        <Lin id="jc-sky" stops={[[0, '#060608'], [0.6, '#16141C'], [1, '#2A2420']]} />
        <Lin id="jc-wl" x2={1} y2={0} stops={[[0, '#1A1410'], [0.7, '#3A2C22'], [1, '#4A3828']]} />
        <Lin id="jc-wr" x2={1} y2={0} stops={[[0, '#3A2C22'], [0.3, '#2A2018'], [1, '#120E0A']]} />
        <Lin id="jc-st" stops={[[0, '#5A5444'], [1, '#2A2620']]} />
        <Lin id="jc-ri" stops={[[0, '#2A2620'], [1, '#14120E']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.15)}><rect x="-200" y="-200" width="1480" height="2400" fill="url(#jc-sky)" /></g>
        <Scala id="jc" t={t} L={L} night />
        {/* il completo rosso appeso alla ringhiera, come nel capitolo 9 */}
        <g transform={L(0.8)}>
          <Glow id="jc-red" x={railX(0.45)} y={railY(0.45) + 120} r={320} t={t} color="#FF6A4A" amp={0.04} rate={2} opacity={0.1} />
          <Completo id="jc" x={railX(0.45)} y={railY(0.45)} s={0.6} sway={Math.sin(t * 1.6) * 4} />
        </g>
        <g transform={L(1.3)}>
          <Smoke id="jc-st1" t={t} x={260} y={1640} color="#8A8478" rise={500} wind={80} r0={50} r1={200} speed={0.2} opacity={0.55} />
          <Smoke id="jc-st2" t={t + 2} x={820} y={1700} color="#7A746A" rise={500} wind={-60} r0={50} r1={200} speed={0.18} opacity={0.5} />
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
        <JokerDefs id="jf" />
        <Lin id="jf-sky" stops={[[0, '#4A5A70'], [0.55, '#D8A890'], [1, '#F4D8B8']]} />
        <Lin id="jf-wl" x2={1} y2={0} stops={[[0, '#4A362A'], [0.7, '#7A5A44'], [1, '#9A7454']]} />
        <Lin id="jf-wr" x2={1} y2={0} stops={[[0, '#6A4E3C'], [0.3, '#5A4232'], [1, '#2E2218']]} />
        <Lin id="jf-st" stops={[[0, '#B8AC98'], [1, '#7A7060']]} />
        <Lin id="jf-ri" stops={[[0, '#6A6052'], [1, '#4A4238']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.15)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#jf-sky)" />
          <SunRays id="jf-rays" x={540} y={880} t={t} color="#FFE8C8" n={9} length={900} opacity={0.3} />
          <Glow id="jf-sun" x={540} y={880} r={320} t={t} color="#FFE0B0" amp={0.03} rate={1} opacity={0.6} />
        </g>
        <Scala id="jf" t={t} L={L} night={false} />
        <g transform={L(0.9)}>
          <Completo id="jf" x={railX(0.5)} y={railY(0.5)} s={0.6} sway={Math.sin(t * 1.4) * 5} />
        </g>
        <g transform={L(1.3)}>
          <Smoke id="jf-st1" t={t} x={300} y={1760} color="#E8E0D0" rise={400} wind={60} r0={40} r1={160} speed={0.2} opacity={0.4} />
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
      <Copertina_ t={t} dur={dur} />
      <div style={{ position: 'absolute', left: 80, top: 290, width: 920, fontFamily: SANS, color: P.chiaro }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.chiaro, opacity: tag, textShadow: `0 2px 0 ${P.scuro}` }}>IL FILM IN 2 MINUTI<Speciale nome={film.copertina.speciale} scale={eob(seg(t, 0.4, 0.8), 1.6)} /></p>
        <h1 style={{ margin: '14px 0 0', fontFamily: ANTON, fontWeight: 400, fontSize: 230, lineHeight: 0.95, letterSpacing: '0.02em', color: P.accento,
          textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.15, 0.4), transform: `translateY(${(1 - l1) * 50}px)` }}>
          JOKER
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
