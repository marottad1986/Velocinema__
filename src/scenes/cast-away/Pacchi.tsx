import React from 'react';
import { camera, eo, eob, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Clouds, Glow, Gulls, NearMotes, WaveBand, WaveLines } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Ball, K, Palm, Parcel } from './Comuni';

// I pacchi: spiaggia di giorno, pacchi arrivati con la marea e aperti sulla sabbia (pattini da ghiaccio,
// vestito da sera, videocassette, pallone senza logo); un solo pacco chiuso, con due ali disegnate, su una roccia.
// Piani: cielo (0,2) · mare e onde (0,45) · battigia con pacco che arriva (0,7) · sabbia e oggetti (0,9) · pacco con le ali (1,0) · palme (1,25) · spruzzi (1,7)

const r = rng(5150);
const FOAM = Array.from({ length: 12 }, () => ({ x: r() * 1200 - 60, y: 1180 + r() * 60, ph: r() }));

export const Pacchi: React.FC<SceneProps> = ({ t, dur, palette: P, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  // un pacco arriva galleggiando con la marea
  const drift = eo(seg(t, 0, cues[1]));
  // gli oggetti escono dai pacchi aperti, uno dopo l'altro, su «pattini, un vestito, un pallone»
  const pop = (i: number) => eob(seg(t, griglia(cues[2]) + i * (30 / 72), griglia(cues[2]) + i * (30 / 72) + 0.5), 2);
  // il pacco con le ali si illumina su «Solo uno… resta chiuso»
  const wingGlow = seg(t, griglia(cues[3]), griglia(cues[3]) + 0.8);
  const wash = mod(t * 0.3, 1);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pc" />
        <Lin id="pc-sky" stops={[[0, '#4FA7D8'], [0.5, '#9AD6EA'], [0.86, '#EAF6F0']]} />
        <Lin id="pc-sea" stops={[[0, '#3FA6B0'], [0.5, '#5FC2C0'], [1, '#9EE0D6']]} />
        <Lin id="pc-sand" stops={[[0, '#F7E9C8'], [0.6, '#EED8A8'], [1, '#DDBF88']]} />
        <Lin id="pc-rock" x2={1} y2={0} stops={[[0, '#7E8274'], [0.6, '#9A9C88'], [1, '#62665A']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo con nuvole tropicali */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#pc-sky)" />
          <Glow id="pc-sun" x={920} y={600} r={300} t={t} color="#FFF4D8" amp={0.04} rate={1} opacity={0.6} />
          <Clouds id="pc-cl" t={t} color="#FFFFFF" seed={33} n={3} y={700} h={140} speed={0.25} opacity={0.85} />
        </g>

        {/* PIANO 1 — mare con la barriera all'orizzonte */}
        <g transform={L(0.45, 0, -30)}>
          <rect x="-200" y="1000" width="1480" height="300" fill="url(#pc-sea)" />
          <WaveBand t={t} y={1012} fill="#EAF7F4" amp={10} w={140} speed={50} bob={3} foam="#FFFFFF" foamWidth={3} foamOpacity={0.9} />
          <WaveLines t={t} ys={[1060, 1110, 1160]} color="#E2F6F2" amp={6} w={200} speed={22} opacity={0.6} />
        </g>
        <g transform={L(0.55)}><Gulls t={t} y={820} h={140} color={K} n={2} /></g>

        {/* PIANO 2 — battigia e pacco che arriva con la marea */}
        <g transform={L(0.7, 0, -150)}>
          <path d={`M-200 ${1200 + wash * 30} Q300 ${1180 + wash * 30} 1280 ${1210 + wash * 30} V1260 H-200 Z`} fill="#BFEBE2" opacity={0.7} />
          {FOAM.map((f, i) => <ellipse key={i} cx={f.x} cy={f.y + wash * 30} rx={30 + 20 * Math.sin(t + f.ph * 6)} ry="6" fill="#FFFFFF" opacity={0.7 * (1 - wash)} />)}
          <Parcel x={1000 - 520 * drift} y={1150 + 60 * drift + Math.sin(t * 2) * 8 * (1 - drift)} w={140} h={96} d={40} rot={-10 + 10 * drift + Math.sin(t * 1.6) * 4 * (1 - drift)} wet={1} />
        </g>

        {/* PIANO 3 — la sabbia con i pacchi aperti e gli oggetti */}
        <g transform={L(0.9)}>
          <path d="M-200 1080 Q400 1050 1280 1090 V2200 H-200 Z" fill="url(#pc-sand)" stroke={K} strokeWidth="7" />
          {/* pacco aperto a sinistra con i pattini */}
          <g transform="translate(190 1190) scale(.85)">
            <Parcel x={0} y={0} w={190} h={110} d={50} />
            <path d="M-95 -55 l-50 -70 l120 0 Z" fill="#D7AE78" stroke={K} strokeWidth="6" />
            <g transform={`translate(-10 ${-80 - 70 * pop(0)}) rotate(${-14 + 10 * pop(0)}) scale(${pop(0)})`}>
              <g transform="scale(1.25)">
                <path d="M-70 -90 Q-76 -20 -60 20 H70 Q86 0 70 -20 Q20 -30 6 -90 Z" fill="#F2EEE6" stroke={K} strokeWidth="6" strokeLinejoin="round" />
                {[-70, -50, -30].map((y) => <path key={y} d={`M-50 ${y} l40 4`} stroke="#8A7A5C" strokeWidth="4" />)}
                <path d="M-60 20 V40 M60 20 V40" stroke={K} strokeWidth="6" />
                <path d="M-96 42 H96 Q110 42 104 30" fill="none" stroke="#C9D3DA" strokeWidth="10" strokeLinecap="round" />
                <path d="M-96 42 H96" stroke={K} strokeWidth="3" />
                <path d="M-70 38 H40" stroke="#FFFFFF" strokeWidth="3" />
              </g>
            </g>
          </g>
          {/* vestito da sera steso sulla sabbia */}
          <g transform={`translate(480 ${1240 - 30 * pop(1)}) scale(${0.75 * pop(1)}) rotate(8)`}>
            <path d="M-40 -110 Q0 -90 40 -110 L60 -20 Q120 80 140 120 Q0 140 -140 120 Q-110 70 -60 -20 Z" fill="#6C4FA0" stroke={K} strokeWidth="6" />
            <path d="M-20 -20 Q0 40 -50 110 M30 -10 Q40 50 80 116" fill="none" stroke="#9A7CD0" strokeWidth="5" />
            <path d="M-40 -110 L-30 -140 M40 -110 L30 -140" stroke={K} strokeWidth="5" />
          </g>
          {/* il pallone che rotola fuori */}
          <Ball x={300 + 120 * pop(2)} y={1196} r={62} rot={pop(2) * 200} face={0} />
          {/* nastro e cartone strappato sparsi */}
          <path d="M60 1420 l60 -14 l10 20 l-50 18 Z M700 1460 l70 6 l-6 24 l-70 -8 Z" fill="#C69559" stroke={K} strokeWidth="5" />
        </g>

        {/* PIANO 4 — roccia con il pacco chiuso con le ali (accento) */}
        <g transform={L(1.0, 0, -560)}>
          <path d="M600 1890 Q610 1790 690 1770 Q790 1750 850 1800 Q920 1850 930 1940 H590 Z" fill="url(#pc-rock)" stroke={K} strokeWidth="8" />
          <path d="M650 1792 Q710 1776 780 1784" fill="none" stroke="#C6C8B4" strokeWidth="5" opacity=".7" />
          <Glow id="pc-wing" x={765} y={1680} r={300} t={t} color="#FFD3B8" amp={0.08} rate={2} opacity={0.15 + 0.85 * wingGlow} />
          <circle cx="765" cy="1670" r="130" fill="#FFE6CC" opacity={0.35 * wingGlow} />
          <circle cx="765" cy="1670" r={110 + 50 * mod(t * 0.9, 1)} fill="none" stroke="#FFF2E0" strokeWidth="10" opacity={wingGlow * (1 - mod(t * 0.9, 1))} />
          <Parcel x={765} y={1700} w={180} h={112} d={48} wings={P.accento} rot={-3} />
        </g>

        {/* PIANO 5 — palme che incorniciano, conchiglie e alghe sulla sabbia in primo piano */}
        <g transform={L(1.25)}>
          {[[120, 1640, 1], [300, 1760, 0.8], [760, 1700, 1.2], [960, 1820, 0.9], [520, 1880, 1]].map(([x, y, k], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${k}) rotate(${i * 40})`}>
              <path d="M-26 10 Q-30 -20 0 -26 Q30 -20 26 10 Z" fill="#FFF0DC" stroke={K} strokeWidth="5" />
              <path d="M-14 6 L-6 -18 M0 8 V-22 M14 6 L6 -18" stroke="#D8B68A" strokeWidth="3" />
            </g>
          ))}
          <path d="M-60 1560 q80 -30 160 10 q60 30 140 0 M820 1600 q60 -40 140 -10 q60 20 140 -20" fill="none" stroke="#3E6B4A" strokeWidth="12" strokeLinecap="round" />
          <path d="M600 1720 a46 40 0 0 1 92 0 Z" fill="#6B4E2E" stroke={K} strokeWidth="6" />
          <Palm x={-60} y={1500} h={820} lean={200} t={t} ph={1} />
          <Palm x={1150} y={1300} h={600} lean={-160} t={t} ph={2.4} />
        </g>
        <g transform={L(1.7)}><NearMotes id="pc-near" t={t} color="#FFFFFF" n={6} opacity={0.12} /></g>
      </g>
      <Finish id="pc" tint="#F2B85A" tintOpacity={0.1} />
    </svg>
  );
};
