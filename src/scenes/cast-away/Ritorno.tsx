import React from 'react';
import { camera, eio, mod, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Drips, Glow, NearMotes, Rain, Reflection } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K } from './Comuni';

// Il ritorno: notte di pioggia davanti a una casa di Memphis; veranda illuminata, un fuoristrada nel vialetto,
// una bicicletta da bambina sul prato, l'ombrello aperto abbandonato sui gradini, pozzanghere che riflettono la luce.
// Piani: cielo (0,2) · alberi e case lontane (0,35) · casa (0,55) · prato, bici e auto (0,8) · pozzanghere e cassetta (1,2) · pioggia vicina (1,6)

export const Ritorno: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  // la porta di casa si chiude piano su «ma lei sceglie la sua famiglia»
  const door = eio(seg(t, cues[3], cues[3] + 1.4));
  // l'auto accende i fari e parte su «e Chuck riparte da solo»
  const lights = seg(t, cues[4] - 0.4, cues[4]);
  const drive = eio(seg(t, cues[4] + 0.3, dur + 1.5));
  const cx = 620 + 620 * drive;
  const win = (i: number) => (i === 2 ? 0.25 : 0.85 - 0.5 * seg(t, cues[3] + 0.4 * i, cues[3] + 0.4 * i + 0.5));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ri" />
        <Lin id="ri-sky" stops={[[0, '#070C16'], [0.35, '#101C2C'], [0.55, '#1C2C40'], [0.62, '#24364C']]} />
        <Lin id="ri-house" x2={1} y2={0} stops={[[0, '#C9C2B2'], [0.6, '#A79F8E'], [1, '#7C7466']]} />
        <Lin id="ri-lawn" stops={[[0, '#22392C'], [1, '#0E1A14']]} />
        <Lin id="ri-road" stops={[[0, '#2A3038'], [1, '#14181D']]} />
        <Lin id="ri-car" x2={1} y2={0} stops={[[0, P.accento], [1, '#9E3B1F']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo notturno di pioggia */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1600" fill="url(#ri-sky)" />
          <Rain t={t} level="far" seed={3} color="#8FA6BC" opacity={0.35} angle={8} />
        </g>

        {/* PIANO 1 — alberi e case lontane */}
        <g transform={L(0.35)}>
          {[-60, 120, 860, 1060].map((x, i) => <ellipse key={x} cx={x} cy={860 + (i % 2) * 30} rx="150" ry="200" fill="#0E1822" />)}
          <path d="M-200 980 H1280 V1060 H-200 Z" fill="#0E1822" />
          {[60, 980].map((x) => <rect key={x} x={x - 14} y="940" width="28" height="20" fill="#F5D38E" opacity=".5" />)}
          {/* lampione */}
          <path d="M120 1060 V760 q0 -30 40 -30" fill="none" stroke="#0A1018" strokeWidth="10" />
          <Glow id="ri-lamp" x={170} y={740} r={160} t={t} color="#F5D38E" amp={0.05} rate={2} opacity={0.6} />
          <Beam id="ri-lampb" x={170} y={746} t={t} length={420} spread={240} color="#F5D38E" angle={92} opacity={0.18} />
        </g>

        {/* PIANO 2 — la casa con la veranda illuminata */}
        <g transform={L(0.55)}>
          <path d="M320 1080 V820 L540 640 L760 820 V1080 Z" fill="url(#ri-house)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M290 836 L540 620 L790 836" fill="none" stroke="#3E3A36" strokeWidth="22" strokeLinejoin="round" />
          <path d="M296 830 L540 626 L784 830" fill="none" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          {[[380, 870], [640, 870], [500, 740]].map(([x, y], i) => (
            <g key={i}>
              <rect x={x} y={y} width="70" height="80" fill="#FFD98A" opacity={win(i)} stroke={K} strokeWidth="5" />
              <path d={`M${x + 35} ${y} V${y + 80} M${x} ${y + 40} H${x + 70}`} stroke={K} strokeWidth="4" />
            </g>
          ))}
          {/* veranda e porta che si chiude */}
          <rect x="300" y="990" width="480" height="20" fill="#5A524A" stroke={K} strokeWidth="5" />
          <path d="M320 1010 V1080 M760 1010 V1080" stroke={K} strokeWidth="8" />
          <rect x="505" y="990" width="70" height="90" fill="#FFE3A8" stroke={K} strokeWidth="6" />
          <rect x="505" y="990" width={70 * door} height="90" fill="#6B4E36" stroke={K} strokeWidth="5" />
          <Glow id="ri-porch" x={540} y={980} r={260} t={t} color="#FFD98A" amp={0.06} rate={1.8} opacity={0.65 - 0.4 * door} />
          <Drips t={t} x={330} y0={1010} y1={1090} n={3} period={1.6} color="#B9D0E0" ripple={40} />
          <Drips t={t} x={750} y0={1010} y1={1090} n={3} period={1.9} color="#B9D0E0" ripple={40} />
          {/* gradini con l'ombrello aperto abbandonato */}
          <path d="M490 1080 H590 V1100 H480 V1120 H600" fill="#6E665E" stroke={K} strokeWidth="5" />
          <g transform="translate(640 1100) rotate(-24)">
            <path d="M-60 0 Q0 -60 60 0 Q45 -6 30 0 Q15 -6 0 0 Q-15 -6 -30 0 Q-45 -6 -60 0 Z" fill="#2F4A6B" stroke={K} strokeWidth="5" />
            <path d="M0 0 V40 q0 12 -12 12" fill="none" stroke={K} strokeWidth="5" />
          </g>
        </g>

        {/* PIANO 3 — prato, vialetto, bicicletta e il fuoristrada (accento) */}
        <g transform={L(0.8)}>
          <rect x="-200" y="1080" width="1480" height="600" fill="url(#ri-lawn)" />
          <path d="M540 1120 L640 1120 L1280 1300 V1460 L560 1460 Z" fill="url(#ri-road)" />
          {/* bicicletta da bambina sul prato */}
          <g transform="translate(200 1190)" fill="none" stroke="#D9DEE4" strokeWidth="6">
            <circle cx="-50" cy="0" r="36" /><circle cx="50" cy="0" r="36" />
            <path d="M-50 0 L-10 -40 H40 L50 0 M-10 -40 L0 0 L40 -40 M40 -40 L34 -60 M-14 -46 h-20" stroke="#E07A9A" strokeWidth="7" />
          </g>
          {/* fuoristrada: si accendono i fari e se ne va */}
          <g transform={`translate(${cx} 1200)`}>
            {lights > 0 && <Beam id="ri-head" x={150} y={-10} t={t} length={700} spread={180} color="#FFF4D0" angle={0} opacity={0.4 * lights} />}
            {/* fuoristrada squadrato: portapacchi, ruota di scorta, paraurti */}
            <rect x="-190" y="-96" width="40" height="70" rx="16" fill="#1A1E24" stroke={K} strokeWidth="6" />
            <path d="M-180 24 V-50 Q-178 -66 -150 -70 L-120 -150 H110 L150 -74 Q182 -70 184 -40 V24 Z" fill="url(#ri-car)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d="M-118 -164 H112 M-100 -164 V-152 M0 -164 V-152 M96 -164 V-152" stroke={K} strokeWidth="7" />
            <path d="M-104 -140 H-10 V-78 H-134 Z M6 -140 H100 L134 -78 H6 Z" fill="#33485E" stroke={K} strokeWidth="5" />
            <path d="M-176 0 H184" stroke="#6E2414" strokeWidth="8" />
            <rect x="-192" y="4" width="390" height="20" rx="6" fill="#3A3F46" stroke={K} strokeWidth="5" />
            <path d="M-60 -104 L-10 -70" stroke="#9FB8CC" strokeWidth="5" opacity=".6" />
            <rect x="140" y="-34" width="28" height="18" rx="4" fill={lights > 0 ? '#FFF8E0' : '#C9C2B2'} stroke={K} strokeWidth="3" />
            <rect x="-172" y="-34" width="14" height="18" fill="#8E1E14" stroke={K} strokeWidth="3" />
            {[-100, 100].map((x) => <g key={x}><circle cx={x} cy="22" r="36" fill="#1A1E24" stroke={K} strokeWidth="6" /><circle cx={x} cy="22" r="14" fill="#8A929C" /></g>)}
            <path d="M-150 -40 Q-60 -46 140 -50" fill="none" stroke="#FFB396" strokeWidth="5" opacity=".7" />
            {lights > 0 && <Glow id="ri-headg" x={160} y={-24} r={90} t={t} color="#FFF4D0" amp={0} opacity={0.8 * lights} />}
          </g>
          <Reflection t={t} x={cx + 150} y={1290} color="#FFF4D0" n={6} w={60} opacity={0.4 * lights} />
        </g>

        {/* PIANO 4 — pozzanghere e cassetta delle lettere in primo piano */}
        <g transform={L(1.2)}>
          {[[240, 1560, 180], [820, 1680, 220]].map(([x, y, w], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={w} ry={w * 0.18} fill="#2B3A4C" stroke="#0A1018" strokeWidth="4" />
              <Reflection t={t + i} x={x} y={y - 10} color="#FFD98A" n={4} w={w * 0.5} gap={10} opacity={0.45 - 0.25 * door} />
              {Array.from({ length: 4 }, (_, k) => {
                const p = mod(t * 1.3 + k * 0.27 + i * 0.4, 1);
                return <ellipse key={k} cx={x - w * 0.6 + ((k * 97 + i * 50) % (w * 1.2))} cy={y + ((k * 13) % 20) - 10} rx={6 + 34 * p} ry={2 + 7 * p} fill="none" stroke="#B9D0E0" strokeWidth="2" opacity={1 - p} />;
              })}
            </g>
          ))}
          {/* staccionata bagnata e siepe che incorniciano il fondo; cassetta delle lettere dentro lo schermo */}
          {Array.from({ length: 9 }, (_, i) => (
            <g key={i}>
              <path d={`M${-80 + i * 70} 1960 V${1770 + (i % 2) * 6} l22 -26 l22 26 V1960 Z`} fill="#C9CED6" stroke={K} strokeWidth="6" strokeLinejoin="round" />
              <path d={`M${-70 + i * 70} 1790 V1940`} stroke="#EEF2F6" strokeWidth="4" opacity=".5" />
            </g>
          ))}
          <path d="M-100 1820 H560 M-100 1890 H560" stroke={K} strokeWidth="14" />
          <path d="M-100 1820 H560 M-100 1890 H560" stroke="#AEB4BE" strokeWidth="7" />
          <path d="M640 1980 Q660 1780 800 1790 Q900 1740 1000 1800 Q1120 1780 1180 1980 Z" fill="#1E3A2E" stroke={K} strokeWidth="7" />
          {[700, 790, 880, 960].map((x, i) => <circle key={x} cx={x} cy={1830 + (i % 2) * 20} r="34" fill="#28503E" opacity=".8" />)}
          <path d="M200 1790 V1600" stroke={K} strokeWidth="18" />
          <path d="M200 1790 V1600" stroke="#6E5638" strokeWidth="10" />
          <rect x="130" y="1520" width="150" height="90" rx="40" fill="#5A6470" stroke={K} strokeWidth="8" />
          <path d="M260 1530 V1480 h30 v26 h-30" fill={P.accento} stroke={K} strokeWidth="5" />
        </g>

        {/* PIANO 5 — pioggia vicina */}
        <g transform={L(1.6)}>
          <Rain t={t} level="near" seed={21} color="#C8D8E6" opacity={0.5} angle={10} />
          <NearMotes id="ri-near" t={t} color="#C8D8E6" n={5} opacity={0.08} />
        </g>
      </g>
      <Finish id="ri" tint="#142235" tintOpacity={0.13} />
    </svg>
  );
};
