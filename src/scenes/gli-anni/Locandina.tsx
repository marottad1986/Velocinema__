import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { DISPLAY, PACIFICO, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, Gulls, NearMotes, Neon, Stars } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { Jukebox, K, Motorino, ORANGE, TINT_DAY, TINT_NIGHT } from './Comune';

// Copertina e finale di «Gli anni». Locandina originale: niente foto, copertine dei dischi o logo degli 883.
// Copertina: strada di provincia al tramonto, un bar d'angolo con l'insegna accesa, un jukebox dietro la vetrina,
// un motorino parcheggiato con il casco, rondini nel cielo arancione.
// Finale: la stessa strada di notte, serranda mezza abbassata, l'insegna che resta accesa, il motorino sotto un lampione.
// Piani: cielo (0,2) · case di fronte (0,35) · bar con vetrina e insegna (0,55) · marciapiede e motorino (0,85)
//        · lampione e bordo strada in primo piano (1,2) · pulviscolo (1,6)

const Strada: React.FC<{ id: string; t: number; dur: number; night?: boolean }> = ({ id, t, dur, night = false }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const shutter = night ? lerp(0.2, 0.55, eo(seg(t, 0.6, dur))) : 0;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <Lin id={`${id}-sky`} stops={night
          ? [[0, '#05060F'], [0.5, '#121630'], [1, '#2A2448']]
          : [[0, '#3A2A5A'], [0.4, '#A84A6A'], [0.7, '#F2906A'], [1, '#FFD08A']]} />
        <Lin id={`${id}-wall`} x2={1} y2={0} stops={[[0, '#C8705A'], [0.5, '#E8987A'], [1, '#A85A44']]} />
        <Lin id={`${id}-glass`} stops={[[0, '#FFE0A8'], [1, '#E8A060']]} />
        <Lin id={`${id}-walk`} stops={[[0, '#6A5A5A'], [1, '#2A2228']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill={`url(#${id}-sky)`} />
          {night ? <Stars t={t} seed={8} n={50} y={-100} h={900} color="#E8E0F0" size={0.9} /> : (
            <>
              <circle cx="300" cy="980" r="80" fill="#FFE8B0" opacity=".9" />
              <Glow id={`${id}-sun`} x={300} y={980} r={420} t={t} color="#FFD890" amp={0.03} rate={1} opacity={0.6} />
            </>
          )}
        </g>
        <g transform={L(0.35)}>
          <path d="M-200 1100 V880 L-80 820 L40 880 V1100 Z M60 1100 V840 H300 V1100 Z" fill={night ? '#1A1A30' : '#5A3A5A'} />
          {[[-140, 920], [-40, 920], [100, 880], [200, 880], [100, 980], [200, 980]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="40" height="46" fill="#FFD27A" opacity={night ? 0.2 + 0.5 * (i % 2) : 0.15} />
          ))}
        </g>
        {/* bar d'angolo con insegna e vetrina */}
        <g transform={L(0.55)}>
          <rect x="360" y="700" width="900" height="560" fill={`url(#${id}-wall)`} stroke={K} strokeWidth="9" opacity={night ? 0.55 : 1} />
          <rect x="420" y="900" width="560" height="340" fill={`url(#${id}-glass)`} stroke={K} strokeWidth="10" opacity={night ? 0.9 : 1} />
          <Jukebox id={`${id}-juke`} x={580} y={1236} s={0.7} t={t} on={1} />
          <path d="M760 960 H960 M760 1040 H960" stroke="#8A5A3A" strokeWidth="8" />
          {[780, 830, 880, 930].map((x, i) => <rect key={i} x={x} y={922} width="18" height="38" rx="5" fill={['#3A8A4A', '#C8803A', '#8A2A3A', '#4A6AA8'][i]} stroke={K} strokeWidth="3" />)}
          {/* serranda (nel finale si abbassa) */}
          <rect x="420" y="900" width="560" height={340 * shutter} fill="#7A7480" stroke={K} strokeWidth="6" />
          {Array.from({ length: Math.floor(shutter * 14) }, (_, i) => <path key={i} d={`M420 ${920 + i * 24} H980`} stroke="#5A5460" strokeWidth="4" />)}
          <rect x="1000" y="900" width="200" height="340" fill="#4A2E24" stroke={K} strokeWidth="8" />
          {/* tenda e insegna */}
          <path d="M400 860 H1260 L1240 900 H420 Z" fill="#2F6EA6" stroke={K} strokeWidth="7" />
          <Neon id={`${id}-neon`} t={t} x={700} y={820} text="BAR" color={ORANGE} font={SANS} size={92} onAt={night ? -1 : 0.2} />
        </g>
        <g transform={L(0.85)}>
          <rect x="-200" y="1260" width="1480" height="900" fill={`url(#${id}-walk)`} />
          <path d="M-200 1260 H1280" stroke={K} strokeWidth="8" />
          <Motorino id={`${id}-moto`} x={300} y={1300} s={0.85} t={t} light={night ? 0 : 0.6} />
        </g>
        <g transform={L(1.2)}>
          <g transform="translate(200 1600)">
            <path d="M0 0 V-830 Q0 -880 70 -880" stroke={K} strokeWidth="18" fill="none" />
            <path d="M40 -886 H110 L98 -856 H52 Z" fill="#3A3448" stroke={K} strokeWidth="6" />
            <Glow id={`${id}-lamp`} x={75} y={-860} r={night ? 260 : 120} t={t} color="#FFE7A0" amp={0.05} rate={2} opacity={night ? 0.8 : 0.3} />
          </g>
          <path d="M-200 1620 H1280 V2200 H-200 Z" fill="#1E1A20" />
          <path d="M-200 1600 H1280 V1640 H-200 Z" fill="#5A5460" stroke={K} strokeWidth="8" />
          <path d="M-200 1606 H1280" stroke="#9A98A8" strokeWidth="4" opacity=".6" />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={-100 + i * 380} y="1800" width="200" height="22" fill="#E8E0D0" opacity=".5" />)}
          <ellipse cx="700" cy="1730" rx="260" ry="40" fill="#14121C" />
          <ellipse cx="700" cy="1730" rx="220" ry="26" fill={ORANGE} opacity={0.18 + 0.06 * Math.sin(t * 3)} />
          <g transform="translate(1000 1640)"><path d="M0 0 V-170" stroke={K} strokeWidth="18" /><path d="M0 -170 V-30" stroke="#C8303A" strokeWidth="8" /></g>
        </g>
        {!night && <g transform={L(1.3)}><Gulls t={t} seed={5} n={4} y={700} h={110} color={K} size={0.8} period={6} /></g>}
        <g transform={L(1.6)}><NearMotes id={`${id}-near`} t={t} color="#FFE0B0" n={6} vx={-30} vy={-6} opacity={0.08} /></g>
      </g>
      <Finish id={id} tint={night ? TINT_NIGHT : TINT_DAY} tintOpacity={0.1} />
    </svg>
  );
};

const neonShadow = (c: string) => `0 0 12px ${c}, 0 0 30px ${c}, 0 5px 0 #16131F`;

export const Copertina: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const tag = eo(seg(t, 0.05, 0.45));
  const l1 = eob(seg(t, 0.15, 0.75), 1.4);
  const by = eo(seg(t, 0.6, 1.0));
  const line = eo(seg(t, 1.2, 1.7));
  const flick = t < 0.3 ? 0 : t < 0.6 ? (Math.sin(t * 60) > 0 ? 1 : 0.3) : 1;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Strada id="gc" t={t} dur={dur} />
      <div style={{ position: 'absolute', left: 80, top: 286, width: 920, fontFamily: SANS }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.accento, opacity: tag, textShadow: `0 2px 0 ${P.scuro}` }}>CANZONI SPIEGATE</p>
        <h1 style={{ margin: '6px 0 0', fontFamily: PACIFICO, fontWeight: 400, fontSize: 168, lineHeight: 1.15, color: P.chiaro, textShadow: neonShadow(P.accento),
          opacity: flick * seg(t, 0.15, 0.4), transform: `translateY(${(1 - l1) * 40}px)` }}>Gli anni</h1>
        <p style={{ margin: '70px 0 0', fontSize: 40, fontWeight: 800, opacity: by, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>una canzone degli {film.regista} · {film.anno}</p>
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
      <Strada id="gf" t={t} dur={dur} night />
      <div style={{ position: 'absolute', left: 90, top: 300, width: 900, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con la canzone che vorresti.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 1290, margin: 0, textAlign: 'center', fontFamily: PACIFICO, fontWeight: 400, fontSize: 150, lineHeight: 1.2,
        color: P.chiaro, textShadow: neonShadow(P.accento), opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        Fine
      </h1>
    </div>
  );
};
