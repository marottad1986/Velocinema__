import React from 'react';
import { camera, eob, eo, seg } from '../../lib/anim';
import { Clouds, Glow, Gulls, NearMotes, Smoke } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { K, Ship } from './Comuni';

// Due biglietti, due mondi: il molo di Southampton, mattina di primavera; la nave enorme di fianco con il fumo dai
// fumaioli e le bandierine; a sinistra bauli di lusso e una cappelliera (Rose e Cal, la prima classe); su «vince il
// biglietto a carte», a destra un tavolino da osteria con le carte sparse e due biglietti che saltano fuori (accento).
// Piani: cielo e nuvole (0,2) · nave (0,4) · molo e gru (0,65) · bauli e tavolino (0,9) · bitte e cime in primo piano (1,25) · gabbiani (1,6)

export const Imbarco: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const lux = eo(seg(t, cues[0] + 0.5, cues[1] + 0.5)); // i bauli della prima classe
  const win = eob(seg(t, cues[2] + 0.6, cues[2] + 1.3), 1.6); // i biglietti vinti

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="im" />
        <Lin id="im-sky" stops={[[0, '#6A9AC8'], [0.6, '#C8DCEC'], [1, '#EDE6D8']]} />
        <Lin id="im-dock" stops={[[0, '#8A7A68'], [1, '#4A4038']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#im-sky)" />
          <Clouds id="im-cl" t={t} color="#FFFFFF" n={4} y={560} h={200} opacity={0.8} />
        </g>
        {/* la nave enorme, di fianco, che riempie l'orizzonte */}
        <g transform={L(0.4)}>
          {/* fumo dalle cime del secondo e terzo fumaiolo, spinto a destra e in basso dal vento */}
          <Smoke id="im-sm" t={t} x={480} y={662} color="#8A8A8A" rise={70} wind={320} r0={26} r1={100} opacity={0.55} />
          <Smoke id="im-sm2" t={t + 1.5} x={698} y={662} color="#9A9A9A" rise={70} wind={320} r0={26} r1={100} opacity={0.45} />
          <Ship x={600} y={1090} s={1.55} t={t} lit={0.3} />
          {/* bandierine dalla cima dell'albero di poppa al primo fumaiolo */}
          <path d="M-20 580 Q130 680 262 662" stroke={K} strokeWidth="2" fill="none" />
          {Array.from({ length: 7 }, (_, i) => {
            const u = (i + 0.5) / 7, x = -20 + u * 282, y = 580 + u * 82 + Math.sin(u * Math.PI) * 30;
            return <path key={i} d={`M${x} ${y} l14 ${26 + Math.sin(t * 6 + i) * 4} l14 -26 Z`} fill={['#C8402A', '#F4EEE2', '#2A5A9A', '#E8C030'][i % 4]} stroke={K} strokeWidth="2" />;
          })}
        </g>
        {/* molo, gru, passerella e un lampione */}
        <g transform={L(0.65)}>
          <path d="M-200 1090 H1280 V2200 H-200 Z" fill="url(#im-dock)" />
          <path d="M-200 1090 H1280" stroke={K} strokeWidth="8" />
          <path d="M760 1090 L880 960" stroke="#5A4A3A" strokeWidth="18" />
          <path d="M760 1090 L880 960" stroke="#8A7458" strokeWidth="8" />
          <path d="M60 1090 V790 L240 750" stroke={K} strokeWidth="14" fill="none" />
          <path d="M240 750 V870" stroke={K} strokeWidth="4" />
          <rect x="220" y="870" width="40" height="30" fill="#6A4A30" stroke={K} strokeWidth="4" />
          <g transform="translate(1010 1090)">
            <path d="M0 0 V-240" stroke={K} strokeWidth="10" />
            <path d="M-22 -240 H22 L16 -284 H-16 Z" fill="#FFE8A8" stroke={K} strokeWidth="5" />
            <Glow id="im-lamp" x={0} y={-262} r={200} t={t} color="#FFE2A0" amp={0.05} rate={2} opacity={0.5} />
          </g>
        </g>
        {/* bauli di lusso (prima classe) e il tavolino delle carte (terza classe) */}
        <g transform={L(0.9)}>
          <g opacity={0.4 + 0.6 * lux} transform={`translate(${-40 * (1 - lux)} 0)`}>
            <rect x="40" y="1100" width="260" height="140" rx="10" fill="#7A3A2A" stroke={K} strokeWidth="7" />
            <path d="M40 1150 H300 M110 1100 V1240 M230 1100 V1240" stroke="#D9B05A" strokeWidth="6" />
            <rect x="80" y="1010" width="190" height="90" rx="8" fill="#3A5A6A" stroke={K} strokeWidth="6" />
            <path d="M80 1050 H270" stroke="#D9B05A" strokeWidth="5" />
            <ellipse cx="200" cy="990" rx="70" ry="22" fill="#E8D8C0" stroke={K} strokeWidth="5" />
            <path d="M140 990 Q200 930 260 990" fill="#E8D8C0" stroke={K} strokeWidth="5" />
          </g>
          <g transform="translate(800 1180)">
            <rect x="-150" y="-20" width="300" height="24" fill="#6A4A30" stroke={K} strokeWidth="6" />
            <path d="M-120 4 V80 M120 4 V80" stroke={K} strokeWidth="12" />
            {[-80, -30, 30, 80].map((cx, i) => <rect key={cx} x={cx - 20} y="-46" width="40" height="28" rx="3" fill="#F4EEE2" stroke={K} strokeWidth="3" transform={`rotate(${(i - 1.5) * 14} ${cx} -32)`} />)}
            {[0, 1].map((i) => (
              <g key={i} transform={`translate(${-40 + i * 80} ${-60 - 110 * win}) rotate(${(i ? 12 : -12) * win}) scale(${0.6 + 0.6 * win})`} opacity={Math.min(1, win * 2)}>
                <rect x="-70" y="-34" width="140" height="68" rx="6" fill="#F4EAD2" stroke={K} strokeWidth="5" />
                <rect x="-58" y="-22" width="116" height="16" fill={P.accento} />
                <path d="M-54 10 H40 M-54 22 H20" stroke="#8A7A60" strokeWidth="4" />
              </g>
            ))}
          </g>
        </g>
        {/* bitte e cime in primo piano */}
        <g transform={L(1.25)}>
          <path d="M-200 1560 H1280 V2200 H-200 Z" fill="#3A322A" />
          <g transform="translate(160 1640)"><rect x="-60" y="-80" width="120" height="120" rx="20" fill="#2A2A2E" stroke={K} strokeWidth="8" /><rect x="-80" y="-100" width="160" height="30" rx="12" fill="#3A3A40" stroke={K} strokeWidth="7" /></g>
          <path d="M220 1580 Q600 1700 1280 1620" stroke="#C8A878" strokeWidth="22" fill="none" />
          <path d="M220 1580 Q600 1700 1280 1620" stroke="#8A6A44" strokeWidth="22" fill="none" strokeDasharray="10 14" />
        </g>
        <g transform={L(1.6)}>
          <Gulls t={t} n={4} y={660} h={160} color={K} size={0.9} period={11} />
          <NearMotes id="im-near" t={t} color="#FFFFFF" n={4} opacity={0.06} />
        </g>
      </g>
      <Finish id="im" tint="#3A2A1E" tintOpacity={0.06} />
    </svg>
  );
};
