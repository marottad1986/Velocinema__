import React from 'react';
import { camera, eio, eo, lerp, seg } from '../../lib/anim';
import { Glow, NearMotes, Rain, Reflection } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { GOLD, K } from './Comuni';

// Una notte fuori dal carcere: la casa del direttore in una notte di pioggia. Su «Melinda sta morendo» la finestra della
// sua stanza al primo piano ha una luce fioca e fredda; su «le guardie portano di nascosto John» arriva il camioncino del
// carcere a fari spenti e si ferma davanti al cancello; su «John la guarisce» la finestra si accende d'oro, la luce si
// spande sulla pioggia e sul prato. Nessuna persona.
// Piani: cielo e alberi (0,2) · casa (0,5) · camioncino (0,8) · staccionata e pozzanghere (1,15) · pioggia vicina (1,5)

export const Melinda: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const sick = eo(seg(t, griglia(cues[0] + 0.4), griglia(cues[0] + 0.4) + 1));
  const drive = eio(seg(t, griglia(cues[1] - 0.4), griglia(cues[1] - 0.4) + 1.8));
  const heal = eo(seg(t, griglia(cues[2] + 0.4), griglia(cues[2] + 0.4) + 1.6));
  const tx = lerp(1500, 700, drive);
  const win = heal > 0 ? heal : 0;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ml" />
        <Lin id="ml-sky" stops={[[0, '#070C14'], [0.5, '#122030'], [1, '#1E3040']]} />
        <Lin id="ml-house" x2={1} y2={0} stops={[[0, '#C8C0A8'], [1, '#8A8470']]} />
        <Lin id="ml-lawn" stops={[[0, '#1E3A26'], [1, '#0C1A10']]} />
        <Lin id="ml-truck" x2={1} y2={0} stops={[[0, '#3A4A3E'], [1, '#22302A']]} />
        <linearGradient id="ml-head" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFF2C8" stopOpacity=".8" />
          <stop offset="1" stopColor="#FFF2C8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#ml-sky)" />
          {/* alberi scuri dietro la casa che si piegano nel vento */}
          {[[60, 760], [180, 700], [930, 720], [1060, 780]].map(([x, y], i) => (
            <g key={i} transform={`rotate(${Math.sin(t * 0.9 + i) * 2} ${x} 1100)`}>
              <path d={`M${x} 1100 V${y + 80}`} stroke="#0E1610" strokeWidth="22" />
              <ellipse cx={x} cy={y} rx="120" ry="150" fill="#0E1A12" />
            </g>
          ))}
          <Rain t={t} level="far" color="#8AA0B8" opacity={0.45} />
        </g>
        {/* la casa del direttore: due piani, portico, la finestra di Melinda al primo piano */}
        <g transform={L(0.5)}>
          <path d="M260 760 L540 580 L820 760 Z" fill="#3A3A40" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <rect x="280" y="760" width="520" height="380" fill="url(#ml-house)" stroke={K} strokeWidth="9" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M284 ${790 + i * 38} H796`} stroke="#9A9480" strokeWidth="3" />)}
          <rect x="690" y="640" width="40" height="80" fill="#5A4A40" stroke={K} strokeWidth="6" />
          {/* finestra del primo piano, a sinistra (spenta) */}
          <rect x="330" y="800" width="120" height="120" fill="#141A22" stroke={K} strokeWidth="7" />
          <path d="M390 800 V920 M330 860 H450" stroke={K} strokeWidth="5" />
          {/* la finestra di Melinda: fredda, poi d'oro */}
          <rect x="610" y="800" width="120" height="120" fill={win > 0.3 ? '#FFE6A0' : '#4A5A70'} opacity={0.5 + 0.2 * sick + 0.3 * win} />
          <rect x="610" y="800" width="120" height="120" fill={GOLD} opacity={0.8 * win} />
          <path d="M610 800 H730 V920 H610 Z M670 800 V920 M610 860 H730" fill="none" stroke={K} strokeWidth="7" />
          <path d="M616 806 Q640 860 622 916 M724 806 Q700 860 718 916" stroke="#E8D8C0" strokeWidth="8" fill="none" opacity=".7" />
          <Glow id="ml-cold" x={670} y={860} r={140} t={t} color="#9AB8E0" amp={0.05} rate={1.4} opacity={0.3 * sick * (1 - win)} />
          <Glow id="ml-gold" x={670} y={860} r={420 * win + 1} t={t} color={GOLD} amp={0.1} rate={2.4} opacity={0.75 * win} />
          {/* il portico e la porta */}
          <path d="M280 960 H800" stroke={K} strokeWidth="8" />
          <path d="M260 980 H820 L800 960 H280 Z" fill="#5A5248" stroke={K} strokeWidth="6" />
          {[300, 420, 660, 780].map((x) => <path key={x} d={`M${x} 980 V1140`} stroke="#E8E0D0" strokeWidth="12" />)}
          <rect x="500" y="1010" width="80" height="130" fill="#3A2A20" stroke={K} strokeWidth="6" />
          <rect x="510" y="1020" width="60" height="40" fill="#FFE6A0" opacity={0.2 + 0.5 * win} />
          <circle cx="566" cy="1080" r="5" fill={GOLD} />
          <rect x="340" y="1010" width="90" height="80" fill="#FFE6A0" opacity={0.15 + 0.35 * win} stroke={K} strokeWidth="5" />
          <rect x="-200" y="1140" width="1480" height="1000" fill="url(#ml-lawn)" />
          <path d="M-200 1140 H1280" stroke={K} strokeWidth="6" />
          <path d="M540 1140 L470 1400 H610 Z" fill="#6A6458" opacity=".6" />
          <ellipse cx="670" cy="1220" rx={300 * win + 1} ry={60 * win + 1} fill={GOLD} opacity={0.18 * win} />
        </g>
        {/* il camioncino del carcere che arriva e si ferma */}
        <g transform={L(0.8)}>
          <g transform={`translate(${tx} 1200)`}>
            <path d="M-20 -6 L-380 -60 V60 L-20 20 Z" fill="url(#ml-head)" opacity={drive > 0.95 ? 0.15 : 0.45} transform="scale(-1 1)" />
            <path d="M-220 0 V-130 Q-220 -150 -200 -150 H40 V0 Z" fill="url(#ml-truck)" stroke={K} strokeWidth="8" />
            <path d="M40 -100 H120 Q160 -96 170 -60 L190 -40 V0 H40 Z" fill="#3A4A3E" stroke={K} strokeWidth="8" />
            <path d="M60 -90 H118 Q140 -86 150 -60 H60 Z" fill="#8AA0B8" opacity=".5" stroke={K} strokeWidth="5" />
            <rect x="-190" y="-120" width="190" height="80" fill="#2A382E" stroke={K} strokeWidth="5" />
            {[-160, -120, -80, -40].map((x) => <path key={x} d={`M${x} -120 V-40`} stroke="#5A6A5E" strokeWidth="6" />)}
            {[-150, 120].map((x) => (
              <g key={x}>
                <circle cx={x} cy="4" r="38" fill="#141414" stroke={K} strokeWidth="6" />
                <circle cx={x} cy="4" r="14" fill="#6A6A60" />
              </g>
            ))}
            <rect x="182" y="-48" width="14" height="20" rx="4" fill="#FFF2C8" opacity={drive > 0.95 ? 0.3 : 1} />
          </g>
          <Reflection x={670} y={1260} t={t} color={GOLD} w={70} n={8} opacity={0.4 * win} />
        </g>
        {/* la staccionata e le pozzanghere in primo piano */}
        <g transform={L(1.15)}>
          <path d="M-200 1460 H1280 V2200 H-200 Z" fill="#0E1A12" />
          {Array.from({ length: 13 }, (_, i) => (
            <g key={i}>
              <path d={`M${-160 + i * 110} 1560 V1360 L${-140 + i * 110} 1330 L${-120 + i * 110} 1360 V1560 Z`} fill="#D8D0BC" stroke={K} strokeWidth="6" />
            </g>
          ))}
          <path d="M-200 1400 H1280 M-200 1500 H1280" stroke="#B8B09C" strokeWidth="14" />
          <ellipse cx="300" cy="1680" rx="220" ry="34" fill="#2A3A4A" stroke="#4A5A6A" strokeWidth="3" />
          <ellipse cx="300" cy="1680" rx={200} ry={26} fill={GOLD} opacity={0.25 * win} />
          {[0, 1, 2].map((i) => {
            const p = (t * 0.8 + i / 3) % 1;
            return <ellipse key={i} cx={250 + i * 50} cy={1680} rx={50 * p} ry={8 * p} fill="none" stroke="#8AA0B8" strokeWidth="2" opacity={1 - p} />;
          })}
        </g>
        <g transform={L(1.5)}>
          <Rain t={t} level="near" color={win > 0.3 ? '#FFE6A0' : '#B8C8D8'} opacity={0.5} />
          <NearMotes id="ml-near" t={t} color="#B8C8D8" n={5} y0={1200} opacity={0.06} />
        </g>
      </g>
      <Finish id="ml" tint="#142030" tintOpacity={0.12} />
    </svg>
  );
};
