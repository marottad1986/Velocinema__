import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { DISPLAY, PLAYFAIR, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Fog, Glow, NearMotes, Reflection, Stars, SunRays, WaveLines } from '../../lib/elements';
import { Speciale } from '../../components/Speciale';
import type { PosterProps } from '../../types';
import { Diamond, Door, Iceberg, Ship } from './Comuni';

// Copertina e finale di Titanic. Locandina originale: niente volti, niente prua al tramonto con le braccia aperte, niente
// logo del film. Copertina: notte stellata sull'oceano calmo, la nave tutta illuminata di tre quarti, la punta dell'iceberg
// che affiora davanti e, in primo piano, il diamante a cuore che brilla. Finale: l'oceano all'alba con la porta di legno
// che galleggia e un piccolo luccichio blu che affonda.

const Copertina_: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="tc" />
        <Lin id="tc-sky" stops={[[0, '#02040A'], [0.6, '#0E1A30'], [1, '#1E3050']]} />
        <Lin id="tc-sea" stops={[[0, '#14243A'], [1, '#02060C']]} />
        <Lin id="tc-ice" stops={[[0, '#BFD8E6'], [1, '#4A6A80']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.15)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#tc-sky)" />
          <Stars t={t} n={110} y={-100} h={1000} seed={19} />
        </g>
        <g transform={L(0.3)}>
          <path d="M-200 1020 H1280 V2200 H-200 Z" fill="url(#tc-sea)" />
          <Reflection t={t} x={480} y={1030} color="#FFD98A" n={10} w={500} gap={22} opacity={0.35} />
          <WaveLines t={t} ys={[1060, 1140, 1240]} color="#3A5A7A" amp={3} speed={12} opacity={0.35} />
        </g>
        <g transform={L(0.45)}>
          <Glow id="tc-ship" x={480} y={900} r={520} t={t} color="#FFD98A" amp={0.04} rate={1} opacity={0.22} />
          <Ship x={470} y={1020} s={0.82} t={t} lit={0.95} />
          <Fog id="tc-fog" t={t} y={1030} color="#8AA8C8" rx={900} ry={40} opacity={0.25} />
        </g>
        <g transform={L(0.7)}>
          <Iceberg x={900} y={1130} s={0.75} below />
        </g>
        <g transform={L(1.0)}>
          {/* lastrone di ghiaccio galleggiante in primo piano con il diamante appoggiato sopra */}
          <path d="M-200 1330 Q100 1270 420 1300 Q700 1250 1000 1300 Q1180 1280 1280 1320 V2200 H-200 Z" fill="#DCEBF2" stroke="#08101C" strokeWidth="8" />
          <path d="M-200 1380 Q300 1340 700 1370 Q1000 1350 1280 1390 V2200 H-200 Z" fill="#A9CCDC" opacity=".6" />
          <path d="M-200 1420 Q300 1400 700 1440 Q1000 1420 1280 1450 V2200 H-200 Z" fill="url(#tc-ice)" />
          <path d="M120 1330 L200 1460 L170 1600 M760 1320 L700 1480 L780 1640 M980 1340 L1060 1520" stroke="#7AA8C0" strokeWidth="5" fill="none" />
          <path d="M300 1500 Q420 1480 520 1510 M640 1700 Q760 1680 880 1710" stroke="#FFFFFF" strokeWidth="6" fill="none" opacity=".6" />
          <Glow id="tc-dia" x={540} y={1210} r={260} t={t} color="#4FB0E8" amp={0.1} rate={3} opacity={0.5} />
          <ellipse cx="540" cy="1290" rx="110" ry="16" fill="#08101C" opacity=".25" />
          <Diamond x={540} y={1210} s={1.1} t={t} chain={false} />
        </g>
        <g transform={L(1.6)}><NearMotes id="tc-near" t={t} color="#DDEFFF" n={6} opacity={0.08} /></g>
      </g>
      <Finish id="tc" tint="#0A1A2E" tintOpacity={0.12} />
    </svg>
  );
};

const Finale_: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const sink = seg(t, 0.5, dur);
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="tf" />
        <Lin id="tf-sky" stops={[[0, '#4A5A8A'], [0.45, '#F0B0A8'], [0.6, '#FFE4C8']]} />
        <Lin id="tf-sea" stops={[[0, '#E8B8A8'], [0.3, '#5A6A8A'], [1, '#1A2438']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#tf-sky)" />
          <Glow id="tf-sun" x={800} y={985} r={320} t={t} color="#FFB070" amp={0.05} rate={1} opacity={0.7} />
          <circle cx="800" cy="985" r="64" fill="#FFB878" stroke="#E8885A" strokeWidth="6" />
          <SunRays id="tf-rays" x={800} y={985} t={t} color="#FFE8C8" n={9} length={1000} opacity={0.3} />
        </g>
        <g transform={L(0.4)}>
          <path d="M-200 1010 H1280 V2200 H-200 Z" fill="url(#tf-sea)" />
          <Reflection t={t} x={760} y={1020} color="#FFE8C8" n={10} w={160} opacity={0.5} />
          <WaveLines t={t} ys={[1060, 1160, 1300, 1460]} color="#FFD8C0" amp={5} speed={14} opacity={0.35} />
        </g>
        <g transform={L(0.8)}>
          <g transform={`translate(0 ${Math.sin(t * 1.4) * 6})`}><Door x={420} y={1560} s={0.8} rot={-12} /></g>
          <g transform={`translate(${880} ${1500 + 140 * sink})`} opacity={1 - sink * 0.8}>
            <Glow id="tf-dia" x={0} y={0} r={120} t={t} color="#4FB0E8" amp={0.15} rate={4} opacity={0.7} />
            <circle r="10" fill="#9ED8FF" />
          </g>
        </g>
        <g transform={L(1.6)}><NearMotes id="tf-near" t={t} color="#FFFFFF" n={6} y0={1300} opacity={0.08} /></g>
      </g>
      <Finish id="tf" tint="#3A2A3A" tintOpacity={0.06} />
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
      <div style={{ position: 'absolute', left: 120, top: 290, width: 840, fontFamily: SANS, color: P.chiaro }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.chiaro, opacity: tag, textShadow: `0 2px 0 ${P.scuro}` }}>IL FILM IN 2 MINUTI<Speciale nome={film.copertina.speciale} scale={eob(seg(t, 0.4, 0.8), 1.6)} /></p>
        <h1 style={{ margin: '14px 0 0', fontFamily: PLAYFAIR, fontWeight: 900, fontSize: 196, lineHeight: 0.95, letterSpacing: '0.02em', color: P.chiaro,
          textShadow: `0 6px 0 ${P.scuro}, 0 0 40px ${P.accento}66`, opacity: seg(t, 0.15, 0.4), transform: `translateY(${(1 - l1) * 50}px)` }}>
          TITANIC
        </h1>
        <p style={{ margin: '20px 0 0', fontSize: 40, fontWeight: 800, opacity: dir, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>un film di {film.regista} · {film.anno}</p>
      </div>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
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
      <div style={{ position: 'absolute', left: 120, top: 300, width: 840, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con il film che vorresti.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 760, margin: 0, textAlign: 'center', fontFamily: PLAYFAIR, fontWeight: 900, fontSize: 150, lineHeight: 1,
        color: P.principale, textShadow: `0 4px 0 ${P.chiaro}, 0 0 30px ${P.chiaro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        The End
      </h1>
    </div>
  );
};
