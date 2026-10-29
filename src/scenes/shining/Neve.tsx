import React from 'react';
import { camera, eio, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Fog, Glow, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Hotel, K, Maze } from './Comuni';

// Chiusi dalla neve: l'albergo di notte nella tormenta, con poche finestre accese; davanti il grande labirinto di siepi
// che si copre di neve; i pali del telefono con i fili che si spezzano («i telefoni tacciono»); la radio accesa a una
// finestra e il mezzo cingolato per la neve parcheggiato (accento sul faro).
// Piani: cielo e tormenta lontana (0,2) · albergo (0,4) · labirinto (0,6) · pali del telefono e mezzo per la neve (0,85) · neve in primo piano (1,2) · fiocchi vicini (1,6)

const r = rng(1010);
const FAR = Array.from({ length: 90 }, () => ({ x: r() * 1400 - 160, y: r() * 2000, s: 2 + r() * 3, v: 120 + r() * 120 }));
const NEAR = Array.from({ length: 30 }, () => ({ x: r() * 1400 - 160, y: r() * 2000, s: 7 + r() * 9, v: 380 + r() * 300 }));

export const Neve: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const snow = eio(seg(t, 0, cues[1] + 1)); // la neve copre tutto
  const wires = eio(seg(t, cues[1] + 0.6, cues[1] + 1.4)); // i fili del telefono si spezzano
  const radio = seg(t, cues[2] + 0.5, cues[2] + 1); // la finestra della radio
  const cat = seg(t, cues[3], cues[3] + 0.6); // «un mezzo per la neve»: si accende il faro
  const wind = 0.5 + snow;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="nv" />
        <Lin id="nv-sky" stops={[[0, '#0A0E18'], [0.5, '#1E2838'], [1, '#3A4658']]} />
        <Lin id="nv-ground" stops={[[0, '#C8D4E0'], [1, '#6A7A8E']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#nv-sky)" />
          {FAR.slice(0, 40).map((f, i) => <circle key={i} cx={mod(f.x - t * 140 * wind, 1440) - 180} cy={mod(f.y + t * f.v * 0.6, 1200)} r={f.s * 0.7} fill="#DCE4EE" opacity=".5" />)}
        </g>
        {/* l'albergo nella tormenta, con la finestra della radio */}
        <g transform={L(0.4)}>
          <Glow id="nv-hg" x={540} y={780} r={420} t={t} color="#FFC870" amp={0.04} rate={1} opacity={0.18} />
          <Hotel x={540} y={900} s={0.8} t={t} lit={0.35} snow={snow} />
          <rect x="626" y="770" width="34" height="40" fill="#8AE0A0" opacity={radio * (0.7 + 0.3 * Math.sin(t * 9))} />
          <Glow id="nv-radio" x={643} y={790} r={70} t={t} color="#8AE0A0" amp={0.2} rate={9} opacity={0.6 * radio} />
          <Fog id="nv-fog" t={t} y={900} color="#C8D4E0" rx={900} ry={60} opacity={0.4 + 0.2 * snow} />
        </g>
        {/* il labirinto di siepi davanti all'albergo */}
        <g transform={L(0.6)}>
          <path d="M-200 900 H1280 V1600 H-200 Z" fill="url(#nv-ground)" />
          <g transform="translate(540 1030) scale(1 .42) translate(-540 -1030)">
            <Maze x={540} y={1030} w={760} h={700} snow={snow} />
          </g>
        </g>
        {/* pali del telefono e mezzo per la neve */}
        <g transform={L(0.85)}>
          {[80, 320].map((x, i) => (
            <g key={x}>
              <path d={`M${x} 1260 V880`} stroke={K} strokeWidth="14" />
              <path d={`M${x - 50} 900 H${x + 50}`} stroke={K} strokeWidth="10" />
            </g>
          ))}
          <path d={`M30 905 Q200 ${940 + 60 * wires} ${200 - 60 * wires} ${905 + 220 * wires}`} stroke={K} strokeWidth="3" fill="none" />
          <path d={`M370 905 Q260 ${940 + 60 * wires} ${240 + 40 * wires} ${905 + 260 * wires}`} stroke={K} strokeWidth="3" fill="none" />
          <path d="M-200 905 H30 M370 905 H1280" stroke={K} strokeWidth="3" opacity=".7" />
          <g transform="translate(860 1230)">
            <rect x="-150" y="-110" width="250" height="90" rx="10" fill="#C84A20" stroke={K} strokeWidth="7" />
            <rect x="-60" y="-170" width="140" height="70" rx="8" fill="#3A5A6A" stroke={K} strokeWidth="6" />
            <rect x="-170" y="-24" width="300" height="50" rx="24" fill="#2A2A2A" stroke={K} strokeWidth="6" />
            {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={-140 + i * 48} cy="1" r="12" fill="#5A5A5A" />)}
            <path d="M-150 -112 H100" stroke="#F4F6FA" strokeWidth={10 * snow} />
            <circle cx="100" cy="-80" r="12" fill={cat > 0 ? '#FFF4D0' : '#8A8A80'} stroke={K} strokeWidth="3" />
            {cat > 0 && <Glow id="nv-cat" x={100} y={-80} r={160} t={t} color={P.accento} amp={0.1} rate={3} opacity={0.5 * cat} />}
          </g>
        </g>
        {/* cumuli di neve in primo piano */}
        <g transform={L(1.2)}>
          <path d="M-200 1700 Q100 1560 400 1660 Q700 1760 1000 1620 Q1180 1560 1280 1620 V2200 H-200 Z" fill="#E8EEF4" stroke={K} strokeWidth="7" />
          <path d="M-200 1720 Q100 1590 400 1690" stroke="#FFFFFF" strokeWidth="10" fill="none" />
        </g>
        <g transform={L(1.6)}>
          {NEAR.map((f, i) => <circle key={i} cx={mod(f.x - t * 300 * wind, 1440) - 180} cy={mod(f.y + t * f.v, 2000)} r={f.s} fill="#F4F6FA" opacity={0.35 + 0.25 * snow} />)}
          <NearMotes id="nv-near" t={t} color="#F4F6FA" n={6} vx={-160} opacity={0.12} />
        </g>
      </g>
      <Finish id="nv" tint="#1A2A3A" tintOpacity={0.13} />
    </svg>
  );
};
