import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { DISPLAY, PLAYFAIR, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Dust, Glow, Lightning, NearMotes, Stars, flashAt } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { GOLD, Gong, Grand, K, TINT } from './Comune';

// Copertina e finale di Bohemian Rhapsody. Locandina originale: niente volti, niente stemma dell'album, niente foto del gruppo.
// Copertina: palco d'opera vuoto con sipario rosso socchiuso; pianoforte a coda aperto con la partitura; dietro un grande
// gong dorato e, sul fondale dipinto, un fulmine.
// Finale: lo stesso palco a luci basse, il gong che vibra ancora, il pianoforte chiuso con una rosa sul coperchio.
// Piani: parete (0,2) · fondale dipinto (0,35) · gong (0,45) · pianoforte e faro (0,65) · sipario e boccascena (1,0) · pulviscolo (1,6)

const Stage: React.FC<{ id: string; t: number; dur: number; end?: boolean }> = ({ id, t, dur, end = false }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const flash = end ? 0 : flashAt(t, [0.9], [0.8]);
  const open = end ? 0.08 : 1;
  const light = end ? 0.45 : 1;
  const part = end ? lerp(1, 0.62, eo(seg(t, 0.8, dur))) : eo(seg(t, 0, 1.2));
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <Lin id={`${id}-wall`} stops={[[0, '#0A060C'], [0.4, '#1E0E18'], [0.8, '#2E1422'], [1, '#160A10']]} />
        <Lin id={`${id}-sky`} stops={[[0, '#0C1230'], [0.5, '#1E2A5A'], [1, '#3A3060']]} />
        <Lin id={`${id}-floor`} stops={[[0, '#6A4A34'], [0.5, '#4A3226'], [1, '#1A100A']]} />
        <Lin id={`${id}-curtain`} x2={1} y2={0} stops={[[0, '#4E0F22'], [0.3, '#A8243E'], [0.55, '#721A34'], [0.8, '#B23048'], [1, '#4E0F22']]} />
        <Lin id={`${id}-frame`} x2={1} y2={0} stops={[[0, '#5A4630'], [0.5, '#A88A5A'], [1, '#463422']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill={`url(#${id}-wall)`} />
        </g>
        {/* fondale dipinto con il fulmine */}
        <g transform={L(0.35)} opacity={0.5 + 0.5 * light}>
          <rect x="60" y="700" width="960" height="560" fill={`url(#${id}-sky)`} />
          <Stars t={t} seed={41} n={28} x={80} y={720} w={920} h={260} color="#F4ECDD" size={0.9} />
          <path d="M60 1130 Q300 1040 540 1110 T1020 1100 V1260 H60 Z" fill="#141A38" />
          <path d="M520 720 L470 860 L540 860 L480 1010" fill="none" stroke={GOLD} strokeWidth="12" strokeLinejoin="round" opacity={0.35 + 0.3 * light} />
          <rect x="60" y="700" width="960" height="560" fill="#DCE4FF" opacity={flash * 0.25} />
          <Lightning x={760} y={710} h={300} flash={flash} seed={5} color="#F4F6FF" width={9} />
        </g>
        <g transform={L(0.45)}>
          <Gong id={`${id}-gong`} x={540} y={960} r={190} t={t} hit={end ? t + 0.6 : t - 1.1} glow={0.25 + 0.2 * light} />
        </g>
        {/* palco, faro e pianoforte */}
        <g transform={L(0.65)}>
          <rect x="-200" y="1260" width="1480" height="900" fill={`url(#${id}-floor)`} />
          <path d="M-200 1260 H1280" stroke={K} strokeWidth="8" />
          <g stroke="#24170F" strokeWidth="3" opacity=".7">
            {Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${-100 + i * 100} 1260 L${-260 + i * 130} 1700`} />)}
          </g>
          <Beam id={`${id}-spot`} x={540} y={600} t={t} length={820} spread={520} angle={90} sweep={0.8} color="#FFE7A0" opacity={0.35 * light} />
          <ellipse cx="540" cy="1420" rx="380" ry="70" fill="#FFE7A0" opacity={0.25 * light} />
          <Dust t={t} top={{ y: 640, x0: 480, x1: 600 }} bottom={{ y: 1400, x0: 300, x1: 780 }} n={26} color="#FFF3CF" boost={-0.2} />
          <Grand id={`${id}-pno`} x={560} y={1430} s={1.2} t={t} open={open} lit={light} />
          {end && (
            <g transform="translate(600 1140) rotate(-14)">
              <path d="M-120 0 Q-40 -10 40 0" stroke="#3A5A2E" strokeWidth="7" fill="none" />
              <path d="M-60 -2 q-10 -20 10 -24" stroke="#3A5A2E" strokeWidth="5" fill="#4A7A3A" />
              <circle cx="56" cy="-2" r="24" fill="#C8303A" stroke={K} strokeWidth="6" />
              <path d="M44 -8 q12 -10 24 2" stroke="#7A0E1E" strokeWidth="4" fill="none" />
            </g>
          )}
        </g>
        {/* sipario socchiuso, boccascena, mantovana */}
        <g transform={L(1.0)}>
          <path d={`M-200 560 H${lerp(540, 200, part)} Q${lerp(520, 170, part)} 1100 ${lerp(540, 240, part)} 1700 H-200 Z`} fill={`url(#${id}-curtain)`} stroke={K} strokeWidth="10" />
          <path d={`M1280 560 H${lerp(540, 880, part)} Q${lerp(560, 910, part)} 1100 ${lerp(540, 840, part)} 1700 H1280 Z`} fill={`url(#${id}-curtain)`} stroke={K} strokeWidth="10" />
          <path d={`M${lerp(540, 150, part)} 600 Q${lerp(530, 140, part)} 1100 ${lerp(540, 200, part)} 1680 M${lerp(540, 930, part)} 600 Q${lerp(550, 940, part)} 1100 ${lerp(540, 880, part)} 1680`} stroke="#3E0C1C" strokeWidth="6" fill="none" opacity=".6" />
          <rect x="-200" y="240" width="220" height="1700" fill={`url(#${id}-frame)`} stroke={K} strokeWidth="9" />
          <rect x="1060" y="240" width="220" height="1700" fill={`url(#${id}-frame)`} stroke={K} strokeWidth="9" />
          <path d={`M-200 230 H1280 V600 ${Array.from({ length: 8 }, () => 'q-92 46 -185 0').join(' ')} Z`} fill="#3A0A18" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M-200 590 Q-100 640 -15 595 M170 595 Q262 640 355 595 M540 595 Q632 640 725 595 M910 595 Q1002 640 1095 595" stroke={GOLD} strokeWidth="4" fill="none" opacity=".5" />
        </g>
        <rect x="-200" y="-200" width="1480" height="2400" fill="#E4EAFF" opacity={flash * 0.1} />
        <g transform={L(1.6)}><NearMotes id={`${id}-near`} t={t} color="#FFE7C0" n={7} vx={-30} vy={-6} opacity={0.08} /></g>
      </g>
      <Glow id={`${id}-top`} x={540} y={420} r={500} t={t} color="#000000" amp={0} opacity={0.35} />
      <Finish id={id} tint={TINT} tintOpacity={0.12} />
    </svg>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const tag = eo(seg(t, 0.05, 0.45));
  const l1 = eob(seg(t, 0.15, 0.7), 1.4);
  const l2 = eob(seg(t, 0.3, 0.85), 1.4);
  const by = eo(seg(t, 0.6, 1.0));
  const line = eo(seg(t, 1.2, 1.7));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Stage id="bc" t={t} dur={dur} />
      <div style={{ position: 'absolute', left: 80, top: 286, width: 920, fontFamily: SANS }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.accento, opacity: tag, textShadow: `0 2px 0 ${P.scuro}` }}>CANZONI SPIEGATE</p>
        <h1 style={{ margin: '18px 0 0', fontFamily: PLAYFAIR, fontWeight: 900, fontSize: 132, lineHeight: 0.95, color: P.chiaro, textShadow: `0 6px 0 ${P.scuro}` }}>
          <span style={{ display: 'block', opacity: seg(t, 0.15, 0.4), transform: `translateY(${(1 - l1) * 50}px)` }}>Bohemian</span>
          <span style={{ display: 'block', opacity: seg(t, 0.3, 0.55), transform: `translateY(${(1 - l2) * 50}px)` }}>Rhapsody</span>
        </h1>
        <p style={{ margin: '22px 0 0', fontSize: 40, fontWeight: 800, opacity: by, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>una canzone dei {film.regista} · {film.anno}</p>
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
      <Stage id="bf" t={t} dur={dur} end />
      <div style={{ position: 'absolute', left: 90, top: 300, width: 900, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con la canzone che vorresti.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 790, margin: 0, textAlign: 'center', fontFamily: PLAYFAIR, fontWeight: 900, fontSize: 150, lineHeight: 1,
        color: P.chiaro, textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        Fine
      </h1>
    </div>
  );
};
