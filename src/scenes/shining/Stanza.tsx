import React from 'react';
import { camera, eo, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { CarpetFloor, HotelDoor, K } from './Comuni';

// La stanza 237: corridoio d'albergo in prospettiva con le applique accese e il tappeto a motivi (inventato); in fondo la
// porta con il numero 237 e la maniglia che vibra; una chiave appesa. Su «mai entrare» le luci tremano e il numero si
// accende di rosso.
// Piani: fondo del corridoio con la porta (0,35) · pareti e applique (0,6) · tappeto (0,8) · cornici in primo piano (1,25) · pulviscolo (1,6)

export const Stanza: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const warn = seg(t, cues[2], cues[2] + 0.5); // «mai entrare nella stanza 237»
  const flick = warn > 0 ? (Math.sin(t * 15) > 0.3 ? 1 : 0.55) : 1; // circa 2,4 lampi al secondo (sotto i 3)
  const shake = warn * Math.sin(t * 40);
  const memory = eo(seg(t, cues[1], cues[1] + 1)); // «l'albergo ricorda le cose brutte»: le cornici si inclinano

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="st" />
                <Lin id="st-wall" x2={1} y2={0} stops={[[0, '#5A4A34'], [0.5, '#C8B48A'], [1, '#5A4A34']]} />
        <Lin id="st-ceil" stops={[[0, '#2A2218'], [1, '#6A5A44']]} />
      </defs>
      <g transform={cam.transform}>
        {/* fondo con la porta 237 */}
        <g transform={L(0.35)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="#1E1812" />
          <rect x="400" y="660" width="280" height="460" fill="#8A7454" />
          <HotelDoor x={540} y={1120} s={0.95} num="237" shake={shake} />
          <rect x="430" y="740" width="220" height="70" fill={P.accento} opacity={0.25 * warn} />
          <Glow id="st-door" x={540} y={900} r={260} t={t} color={warn > 0 ? P.accento : '#FFD8A0'} amp={0.1} rate={5} opacity={0.25 + 0.3 * warn} />
          {/* chiave appesa */}
          <g transform={`translate(640 960) rotate(${Math.sin(t * 2) * 6 + shake * 4})`}>
            <path d="M0 0 V40" stroke="#D9B05A" strokeWidth="4" />
            <rect x="-10" y="40" width="20" height="40" rx="4" fill="#D9B05A" stroke={K} strokeWidth="3" />
          </g>
        </g>
        {/* pareti e soffitto in prospettiva, applique */}
        <g transform={L(0.6)}>
          <path d="M-200 -200 L400 660 V1120 L-200 1900 Z" fill="url(#st-wall)" stroke={K} strokeWidth="8" />
          <path d="M1280 -200 L680 660 V1120 L1280 1900 Z" fill="url(#st-wall)" stroke={K} strokeWidth="8" />
          <path d="M-200 -200 H1280 L680 660 H400 Z" fill="url(#st-ceil)" />
          {[[130, 760, 1.3], [270, 760, 0.8], [950, 760, 1.3], [810, 760, 0.8]].map(([x, y, s], i) => (
            <g key={i}>
              <Glow id={`st-ap${i}`} x={x} y={y} r={160 * s} t={t} color="#FFD27A" amp={0.05} rate={2 + i} opacity={0.6 * flick} />
              <path d={`M${x - 20 * s} ${y} H${x + 20 * s} L${x + 14 * s} ${y + 40 * s} H${x - 14 * s} Z`} fill="#F4E2B0" stroke={K} strokeWidth="4" opacity={flick} />
            </g>
          ))}
          {/* cornici alle pareti, che si inclinano */}
          {[[210, 900, -1], [870, 900, 1]].map(([x, y, d], i) => (
            <g key={i} transform={`rotate(${d * 9 * memory} ${x} ${y})`}>
              <rect x={x - 70} y={y - 50} width="140" height="100" fill="#3A3226" stroke="#D9B05A" strokeWidth="8" />
              <path d={`M${x - 50} ${y + 30} L${x - 10} ${y - 10} L${x + 20} ${y + 20} L${x + 50} ${y - 20}`} stroke="#8A7A5A" strokeWidth="5" fill="none" />
            </g>
          ))}
        </g>
        {/* tappeto in prospettiva */}
        <g transform={L(0.8)}>
          <CarpetFloor xl0={400} xr0={680} y0={1120} xl1={-200} xr1={1280} y1={1900} />
          <path d="M-200 1900 H1280 V2200 H-200 Z" fill="#7A2A1E" />
          <path d="M400 1120 H680 L1280 1900 V2200 H-200 V1900 Z" fill="none" stroke={K} strokeWidth="6" />
          <path d="M400 1120 H680 L1280 1900 H-200 Z" fill="#000" opacity=".25" />
        </g>
        <g transform={L(1.25)}>
          <path d="M-200 -200 H60 V2200 H-200 Z M1280 -200 H1020 V2200 H1280 Z" fill="#2A2018" stroke={K} strokeWidth="9" />
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 760, x0: 200, x1: 880 }} bottom={{ y: 1300, x0: 300, x1: 780 }} seed={2} n={22} color="#FFE2B0" />
          <NearMotes id="st-near" t={t} color="#FFE2B0" n={5} y0={1300} opacity={0.07} />
        </g>
      </g>
      <Finish id="st" tint="#3A1A14" tintOpacity={0.1} />
    </svg>
  );
};
