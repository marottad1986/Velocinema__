import React from 'react';
import { camera, eio, eo, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { CarpetFloor, K, Tricycle } from './Comuni';

// Le due bambine: un lungo corridoio vuoto con il tappeto a rombi (motivo inventato); il triciclo che arriva e si ferma di
// traverso; in fondo, su «due bambine», compaiono due paia di scarpine e una palla che rotola da sola verso il triciclo.
// Le bambine non si vedono mai: solo scarpine, una luce fredda e la palla.
// Piani: fondo del corridoio (0,35) · pareti e porte (0,6) · tappeto (0,8) · triciclo (0,9) · stipiti in primo piano (1,25) · pulviscolo (1,6)

export const Bambine: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const ride = eio(seg(t, 0, cues[1])); // il triciclo corre e frena
  const shoes = eo(seg(t, cues[1], cues[1] + 0.8)); // le scarpine compaiono
  const ghost = seg(t, cues[2], cues[2] + 1) * (1 - seg(t, dur - 1, dur)); // luce fredda: «morte proprio lì»
  const ball = eio(seg(t, cues[3], dur)); // «una palla lo porta nella 237»: la palla rotola verso il triciclo

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="bb" />
                <Lin id="bb-wall" x2={1} y2={0} stops={[[0, '#3A4A52'], [0.5, '#8A9A9E'], [1, '#3A4A52']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.35)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="#141A1E" />
          <rect x="450" y="720" width="180" height="300" fill="#6A7A80" />
          <ellipse cx="540" cy="1018" rx="110" ry="14" fill="#DCEAF4" opacity={0.25 * shoes} />
          <rect x="450" y="720" width="180" height="300" fill="#DCEAF4" opacity={0.35 * ghost} />
          <Glow id="bb-ghost" x={540} y={900} r={300} t={t} color="#DCEAF4" amp={0.12} rate={4} opacity={0.5 * ghost} />
          {/* due paia di scarpine affiancate in fondo al corridoio */}
          <g opacity={shoes} transform="translate(540 1016) scale(2.2)">
            {[-40, 30].map((x) => (
              <g key={x}>
                <path d={`M${x - 22} 0 Q${x - 22} -14 ${x - 8} -14 H${x - 2} V0 Z M${x + 2} 0 V-14 H${x + 8} Q${x + 22} -14 ${x + 22} 0 Z`} fill="#5A6A9A" stroke={K} strokeWidth="2" />
                <path d={`M${x - 16} -14 H${x + 16}`} stroke="#E8EEF4" strokeWidth="3" />
              </g>
            ))}
          </g>
        </g>
        {/* pareti e porte */}
        <g transform={L(0.6)}>
          <path d="M-200 -200 L450 720 V1020 L-200 1940 Z" fill="url(#bb-wall)" stroke={K} strokeWidth="8" />
          <path d="M1280 -200 L630 720 V1020 L1280 1940 Z" fill="url(#bb-wall)" stroke={K} strokeWidth="8" />
          <path d="M-200 -200 H1280 L630 720 H450 Z" fill="#1E262C" />
          {[[120, 1, 1.3], [330, 1, 0.8], [960, -1, 1.3], [750, -1, 0.8]].map(([x, d, s], i) => (
            <g key={i}>
              <path d={`M${x} ${1000 - 340 * s} V${1000 + 120 * s} L${x + d * 70 * s} ${1000 + 60 * s} V${1000 - 360 * s} Z`} fill="#4A3426" stroke={K} strokeWidth="5" />
              <circle cx={x + d * 55 * s} cy={1000} r={6 * s} fill="#D9B05A" />
            </g>
          ))}
          {[[190, 760], [890, 760]].map(([x, y], i) => <Glow key={i} id={`bb-l${i}`} x={x} y={y} r={150} t={t} color="#FFE2B0" amp={0.06} rate={2 + i} opacity={0.45} />)}
        </g>
        {/* tappeto */}
        <g transform={L(0.8)}>
          <CarpetFloor xl0={450} xr0={630} y0={1020} xl1={-200} xr1={1280} y1={1940} a="#3A2A5A" b="#C46A2A" c="#7A2A1E" />
          <path d="M-200 1940 H1280 V2200 H-200 Z" fill="#3A2A5A" />
          <path d="M450 1020 H630 L1280 1940 H-200 Z" fill="#000" opacity=".2" />
          {/* la palla che rotola */}
          {ball > 0 && (
            <g transform={`translate(${540 + 40 * ball} ${1030 + 280 * ball}) scale(${0.5 + 0.9 * ball}) rotate(${ball * 720})`}>
              <circle r="30" fill="#E8EEF4" stroke={K} strokeWidth="5" />
              <path d="M-30 0 H30 M0 -30 V30" stroke={P.accento} strokeWidth="6" />
            </g>
          )}
        </g>
        {/* il triciclo che frena di traverso (accento) */}
        <g transform={L(0.9)}>
          <ellipse cx={420 + 130 * ride} cy={1282} rx="170" ry="16" fill={K} opacity=".3" />
          <Tricycle x={420 + 130 * ride} y={1280} s={1.5} rot={-8 * seg(t, cues[1] - 0.6, cues[1]) * (1 - seg(t, cues[1] + 0.1, cues[1] + 0.6))} spin={ride * 900} color={P.accento} />
          {/* segni delle ruote sul tappeto */}
          <path d={`M300 1286 L${300 + 130 * ride} 1286`} stroke="#000" strokeWidth="6" opacity=".2" />
        </g>
        <g transform={L(1.25)}>
          <path d="M-200 -200 H60 V2200 H-200 Z M1280 -200 H1020 V2200 H1280 Z" fill="#14181C" stroke={K} strokeWidth="9" />
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 760, x0: 300, x1: 780 }} bottom={{ y: 1300, x0: 200, x1: 880 }} seed={6} n={22} color="#DCEAF4" boost={ghost * 0.4} />
          <NearMotes id="bb-near" t={t} color="#DCEAF4" n={5} y0={1300} opacity={0.07} />
        </g>
      </g>
      <Finish id="bb" tint="#1A2A3A" tintOpacity={0.12} />
    </svg>
  );
};
