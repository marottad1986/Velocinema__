import React from 'react';
import { camera, eo, eob, lerp, mod, seg } from '../../lib/anim';
import { DISPLAY, SANS, STENCIL } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, NearMotes, Smoke, Stars } from '../../lib/elements';
import { Speciale } from '../../components/Speciale';
import type { PosterProps } from '../../types';
import { BBDefs, Beuta, Cactus, Camper, Cespuglio, Cristalli, K } from './Comuni';

// Copertina e finale di Breaking Bad, stagione 1. Locandina originale: niente persone, niente logo con i simboli della
// tavola periodica, niente locandina ufficiale. Copertina: il deserto del New Mexico al tramonto, il camper con il fumo
// che esce dal tetto, mesa rosse, cactus; in primo piano una beuta e un mucchio di cristalli che brillano. Finale: lo
// stesso camper di notte sotto le stelle, con la luce accesa dentro.

const Sfondo: React.FC<{ id: string; t: number; dur: number; night: boolean }> = ({ id, t, dur, night }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <BBDefs id={id} />
        <Lin id={`${id}-sky`} stops={night ? [[0, '#03050C'], [0.4, '#0C1430'], [0.62, '#1E2A4A'], [0.7, '#3A3050']] : [[0, '#1E1A3A'], [0.32, '#6A3050'], [0.52, '#E8703A'], [0.64, '#F6C068']]} />
        <Lin id={`${id}-sand`} stops={night ? [[0, '#3A3040'], [1, '#0E0C12']] : [[0, '#C8885A'], [0.5, '#8A5638'], [1, '#3A2214']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill={`url(#${id}-sky)`} />
          {night ? (
            <>
              <Stars t={t} seed={41} n={90} y={0} h={1150} color="#E8EEF8" size={2.6} />
              <path d="M-200 900 Q300 760 600 820 T1280 700" stroke="#C8D4F0" strokeWidth="60" opacity=".05" fill="none" />
            </>
          ) : (
            <>
              <Glow id={`${id}-sun`} x={760} y={1120} r={520} t={t} color="#FFC070" amp={0.03} rate={0.8} opacity={0.85} />
              <circle cx="760" cy="1110" r="90" fill="#FFE6A8" />
              {[0, 1, 2].map((k) => <ellipse key={k} cx={mod(160 + k * 400 + t * 10, 1500) - 200} cy={920 + k * 60} rx={220 - k * 40} ry="16" fill="#E8805A" opacity=".55" />)}
            </>
          )}
        </g>
        <g transform={L(0.35)}>
          <path d="M-200 1180 L-100 1080 H140 L180 1050 H320 L380 1180 Z" fill={night ? '#1A1626' : '#7A3A3A'} />
          <path d="M560 1180 L620 1010 H860 L900 990 H1040 L1100 1100 H1280 V1180 Z" fill={night ? '#16121E' : '#8A4232'} stroke={K} strokeWidth="5" />
          <path d="M622 1014 H860" stroke={night ? '#4A4A6A' : '#F2A878'} strokeWidth="4" opacity=".7" />
          <rect x="-200" y="1170" width="1480" height="70" fill={night ? '#241E2A' : '#A8683E'} />
        </g>
        <g transform={L(0.55)}>
          <Cactus id={id} x={980} y={1260} s={0.4} />
          <Cactus id={id} x={80} y={1250} s={0.32} flip />
        </g>
        <g transform={L(0.68)}>
          <path d="M-200 1330 H1280 V2200 H-200 Z" fill={`url(#${id}-sand)`} />
          <Smoke id={`${id}-sm`} t={t} x={560 - 165 * 0.86} y={1340 - 520 * 0.86} color={night ? '#C8C8D8' : '#F4EEE4'} n={6} rise={night ? 90 : 180} wind={-140} r0={26} r1={84} speed={0.4} opacity={0.75} />
          <Camper id={id} x={560} y={1340} s={0.86} lamp={night ? 1 : 0} door={night ? 0.6 : 0} t={t} />
        </g>
        <g transform={L(1.1)}>
          <Cespuglio x={940} y={1760} s={1.4} seed={3} color={night ? '#3A3A2A' : '#7A7A44'} />
          {/* beuta e cristalli in primo piano su una roccia */}
          <path d="M-200 1960 L-200 1700 Q0 1640 200 1690 Q330 1730 380 1960 Z" fill={night ? '#1E1822' : '#6A3A26'} stroke={K} strokeWidth="10" />
          <Beuta id={id} x={90} y={1690} t={t} s={1.1} liquid="#7AC8D0" level={0.35} />
          <Cristalli id={id} x={250} y={1700} t={t} s={1.2} n={16} seed={9} glint={1} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id={`${id}-near`} t={t} color={night ? '#C8D4F0' : '#FFE0B0'} n={6} r0={70} r1={160} opacity={0.12} />
        </g>
      </g>
      <Finish id={id} tint={night ? '#142235' : '#D8803A'} tintOpacity={night ? 0.12 : 0.1} />
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
      <Sfondo id="bc" t={t} dur={dur} night={false} />
      <div style={{ position: 'absolute', left: 80, top: 290, width: 920, fontFamily: SANS, color: P.chiaro }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.chiaro, opacity: tag, textShadow: `0 2px 0 ${P.scuro}` }}>STAGIONE {film.stagione} IN 2 MINUTI<Speciale nome={film.copertina.speciale} scale={eob(seg(t, 0.4, 0.8), 1.6)} /></p>
        <h1 style={{ margin: '10px 0 0', fontFamily: STENCIL, fontWeight: 800, fontSize: 210, lineHeight: 0.9, letterSpacing: '0.02em', color: P.accento,
          textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.15, 0.4), transform: `translateY(${(1 - l1) * 50}px)` }}>
          BREAKING<br />BAD
        </h1>
        <p style={{ margin: '20px 0 0', fontSize: 40, fontWeight: 800, opacity: dir, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>una serie di {film.regista} · {film.anno}</p>
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
      <Sfondo id="bf" t={t} dur={dur} night />
      <div style={{ position: 'absolute', left: 90, top: 300, width: 900, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con la serie che vorresti.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 660, margin: 0, textAlign: 'center', fontFamily: STENCIL, fontWeight: 800, fontSize: 110, lineHeight: 1,
        color: P.accento, textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        FINE DELLA<br />STAGIONE {film.stagione}
      </h1>
    </div>
  );
};
