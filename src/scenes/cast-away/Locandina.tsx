import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, Gulls, NearMotes, Reflection, Stars, SunRays, WaveBand, WaveLines } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { Ball, K, Palm, Parcel, islandPath } from './Comuni';

// Copertina e finale di Cast Away. Locandina originale: niente uomo sulla spiaggia, niente volti, nessun marchio.
// Copertina: tramonto su una spiaggia deserta, il pacco con le ali mezzo sepolto nella sabbia bagnata e il pallone con l'impronta.
// Finale: l'incrocio nel Texas a sera, con il cartello e la prima stella.
// Piani: cielo (0,2) · mare, barriera e isola (0,4–0,5) · laguna (0,7) · sabbia con pacco e pallone (1,0) · palme (1,25) · luce (1,6)

const r = rng(2000);
const GRASS = Array.from({ length: 30 }, () => ({ x: r() * 1300 - 110, y: 1560 + r() * 360, h: 30 + r() * 50, ph: r() * 6 }));

const Copertina_: React.FC<{ t: number; dur: number; accent: string }> = ({ t, dur, accent }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const wash = mod(t * 0.35, 1);
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="cc" />
        <Lin id="cc-sky" stops={[[0, '#22305C'], [0.3, '#7A4E7A'], [0.48, '#E8875E'], [0.56, '#FFD08A']]} />
        <Lin id="cc-sea" stops={[[0, '#E8A070'], [0.3, '#3E8C98'], [1, '#1E5A6E']]} />
        <Lin id="cc-rock" x2={1} y2={0} stops={[[0, '#3A3446'], [0.6, '#5A4A5A'], [1, '#2A2436']]} />
        <Lin id="cc-sand" stops={[[0, '#F2D2A0'], [0.5, '#D9AE78'], [1, '#9A7048']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#cc-sky)" />
          <SunRays id="cc-rays" x={720} y={1000} t={t} color="#FFE1A8" n={12} length={1300} opacity={0.32} />
          <Glow id="cc-sun" x={720} y={1000} r={340} t={t} color="#FFE7B8" amp={0.04} rate={1} opacity={0.85} />
          <circle cx="720" cy="1000" r="90" fill="#FFF1D2" />
        </g>
        <g transform={L(0.4)}>
          <rect x="-200" y="1010" width="1480" height="300" fill="url(#cc-sea)" />
          <Reflection t={t} x={720 - cam.pan * 0.2} y={1020} color="#FFE7B8" n={9} w={130} opacity={0.55} />
          <WaveBand t={t} y={1040} fill="#F7E4D0" amp={12} w={150} speed={50} bob={4} foam="#FFFFFF" foamWidth={4} foamOpacity={0.85} />
        </g>
        <g transform={L(0.5)}>
          <path d={islandPath(170, 1060, 0.6)} fill="url(#cc-rock)" stroke={K} strokeWidth="6" strokeLinejoin="round" />
        </g>
        <g transform={L(0.55)}><Gulls t={t} y={760} h={140} color={K} n={3} /></g>
        <g transform={L(0.7)}>
          <rect x="-200" y="1060" width="1480" height="200" fill="#3E8C98" />
          <WaveLines t={t} ys={[1090, 1130, 1170]} color="#F2C9A0" amp={5} w={200} speed={20} opacity={0.55} />
        </g>
        <g transform={L(1.0)}>
          <path d="M-200 1180 Q500 1140 1280 1190 V2200 H-200 Z" fill="url(#cc-sand)" stroke={K} strokeWidth="7" />
          <path d={`M-200 ${1190 + wash * 30} Q500 ${1150 + wash * 30} 1280 ${1200 + wash * 30}`} fill="none" stroke="#FFFFFF" strokeWidth="8" opacity={0.8 * (1 - wash)} />
          {/* il pacco con le ali, mezzo sepolto nella sabbia bagnata (accento) */}
          <Glow id="cc-parcelg" x={430} y={1220} r={300} t={t} color="#FFD3B8" amp={0.06} rate={1.4} opacity={0.4} />
          <g>
            <Parcel x={430} y={1230} w={300} h={190} d={80} wings={accent} rot={-8} wet={0.8} />
            <path d="M240 1320 Q430 1290 640 1330 V1360 H240 Z" fill="#D9AE78" />
            <path d="M240 1322 Q430 1292 640 1332" fill="none" stroke="#9A7048" strokeWidth="5" />
          </g>
          <Ball x={760} y={1280} r={86} rot={-12} face={1} dirty={0.3} />
        </g>
        <g transform={L(1.25)}>
          <Palm x={-60} y={1900} h={1050} lean={200} t={t} ph={0.4} leaf="#1E3A30" trunk="#4A3622" />
          <Palm x={1160} y={1800} h={820} lean={-200} t={t} ph={2} leaf="#1E3A30" trunk="#4A3622" />
        </g>
        <g transform={L(1.6)}><NearMotes id="cc-near" t={t} color="#FFE7B8" n={6} y0={1300} opacity={0.1} /></g>
      </g>
      <Finish id="cc" tint="#F2B85A" tintOpacity={0.1} />
    </svg>
  );
};

const Finale_: React.FC<{ t: number; dur: number; accent: string }> = ({ t, dur, accent }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const star = eo(seg(t, 0.6, 1.6));
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="cf" />
        <Lin id="cf-sky" stops={[[0, '#0E1A3A'], [0.3, '#2C3466'], [0.48, '#A8607A'], [0.55, '#F2A65E']]} />
        <Lin id="cf-plain" stops={[[0, '#7A5A3A'], [1, '#2E2014']]} />
        <Lin id="cf-road" stops={[[0, '#B88A5A'], [1, '#6E4E2E']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#cf-sky)" />
          <Stars t={t} seed={77} n={30} y={100} h={600} size={1} />
          <Glow id="cf-star" x={760} y={640} r={120 * star} t={t} color="#FFF4D0" amp={0.1} rate={2} opacity={0.8} />
          <path d={`M760 ${640 - 22 * star} L766 634 L${760 + 22 * star} 640 L766 646 L760 ${640 + 22 * star} L754 646 L${760 - 22 * star} 640 L754 634 Z`} fill="#FFF8E0" />
          <Glow id="cf-dusk" x={540} y={1010} r={600} t={t} color="#FFB070" amp={0.03} rate={0.8} opacity={0.4} />
        </g>
        <g transform={L(0.45)}>
          <rect x="-200" y="1000" width="1480" height="700" fill="url(#cf-plain)" />
          {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${-150 + i * 60} 1040 v-28`} stroke="#2E2014" strokeWidth="5" />)}
          <path d="M-150 1020 H690" stroke="#2E2014" strokeWidth="3" />
        </g>
        <g transform={L(0.6)}>
          <path d="M500 1000 L580 1000 L900 1920 H180 Z" fill="url(#cf-road)" />
          <path d="M-200 1200 Q540 1160 1280 1210 V1300 Q540 1250 -200 1300 Z" fill="url(#cf-road)" />
          <path d="M540 1000 L540 1920" stroke="#E2B880" strokeWidth="6" strokeDasharray="30 40" opacity=".5" />
        </g>
        <g transform={L(1.0)}>
          <path d="M240 1330 V880" stroke={K} strokeWidth="18" />
          <path d="M240 1330 V880" stroke="#6B4E2E" strokeWidth="10" />
          {[[-1, 920, -6], [1, 990, 5], [-1, 1060, 3]].map(([dir, y, rot], i) => (
            <g key={i} transform={`rotate(${rot} 240 ${y})`}>
              <path d={dir > 0 ? `M240 ${y - 26} H410 L440 ${y} L410 ${y + 26} H240 Z` : `M240 ${y - 26} H70 L40 ${y} L70 ${y + 26} H240 Z`} fill="#D9C8A4" stroke={K} strokeWidth="6" strokeLinejoin="round" />
            </g>
          ))}
          {/* il pacco con le ali consegnato, piccolo, ai piedi del cartello */}
          <Parcel x={330} y={1300} w={120} h={76} d={32} wings={accent} />
        </g>
        <g transform={L(1.25)}>
          {GRASS.map((g, i) => (
            <path key={i} d={`M${g.x} ${g.y} q${Math.sin(t * 2 + g.ph) * 10} ${-g.h * 0.6} ${Math.sin(t * 2 + g.ph) * 20} ${-g.h}`} fill="none" stroke={i % 3 ? '#5A4024' : '#7A5A34'} strokeWidth="5" strokeLinecap="round" />
          ))}
        </g>
        <g transform={L(1.6)}><NearMotes id="cf-near" t={t} color="#FFE1A8" n={6} y0={1300} opacity={0.1} /></g>
      </g>
      <Finish id="cf" tint="#0E2A3A" tintOpacity={0.12} />
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
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.chiaro, opacity: tag, textShadow: `0 2px 0 ${P.scuro}` }}>IL FILM IN 2 MINUTI</p>
        <h1 style={{ margin: '14px 0 0', fontFamily: DISPLAY, fontWeight: 800, fontSize: 172, lineHeight: 0.9, whiteSpace: 'nowrap', letterSpacing: '-0.02em', color: P.chiaro,
          textShadow: `0 8px 0 ${P.scuro}`, opacity: seg(t, 0.15, 0.4), transform: `translateY(${(1 - l1) * 50}px)` }}>
          Cast Away
        </h1>
        <p style={{ margin: '24px 0 0', fontSize: 40, fontWeight: 800, opacity: dir, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>un film di {film.regista} · {film.anno}</p>
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
      <Finale_ t={t} dur={dur} accent={P.accento} />
      <div style={{ position: 'absolute', left: 90, top: 300, width: 900, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.chiaro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con il film che vorresti.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 740, margin: 0, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 800, fontSize: 190, lineHeight: 1,
        color: P.chiaro, textShadow: `0 7px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        The End
      </h1>
    </div>
  );
};
