import React from 'react';
import { camera, eio, eo, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K } from './Comuni';

// La porta che si apre da sola: la porta della dispensa chiusa col chiavistello; su «il fantasma apre la porta» il
// chiavistello scorre da solo e la porta si socchiude; su «radio e mezzo… li aveva già rotti» la radio sul ripiano, già
// sfasciata, sputa un'ultima scintilla. La mazza a terra. Scaffali di barattoli e scatole tutt'intorno.
// Piani: parete di fondo (0,25) · scaffali (0,5) · porta con il chiavistello (0,7) · radio sul ripiano (0,9) · barattoli in primo piano (1,25) · pulviscolo (1,6)

const r = rng(77);
const CANS = Array.from({ length: 40 }, (_, i) => ({ x: (i % 10) * 90, y: Math.floor(i / 10) * 130, c: ['#C8202E', '#E8C030', '#3A6A9A', '#F4F0E4'][Math.floor(r() * 4)], w: 50 + r() * 20 }));
const SPARKS = Array.from({ length: 16 }, () => ({ a: r() * Math.PI * 2, v: 80 + r() * 200 }));

export const Dispensa: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const slam = seg(t, 0.4, 0.6) * (1 - seg(t, 0.6, 1.2)); // la porta sbattuta e chiusa
  const bolt = eio(seg(t, cues[1] + 0.6, cues[1] + 1.4)); // il chiavistello scorre da solo
  const open = eo(seg(t, cues[1] + 1.6, cues[2])); // la porta si socchiude
  const smash = 1; // la radio è già rotta
  const spark = seg(t, cues[2] + 0.4, cues[2] + 1.2); // l'ultima scintilla della radio

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="dp" />
        <Lin id="dp-wall" stops={[[0, '#1E1A16'], [0.5, '#3A322A'], [1, '#141210']]} />
        <Lin id="dp-door" x2={1} y2={0} stops={[[0, '#7A8088'], [0.5, '#B8C0C8'], [1, '#6A7078']]} />
        <Lin id="dp-floor" stops={[[0, '#3A3A36'], [1, '#121210']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#dp-wall)" />
          <path d="M540 480 V640" stroke="#3A3A36" strokeWidth="4" />
          <Glow id="dp-bulb" x={540} y={660} r={420} t={t} color="#FFE2A0" amp={0.08} rate={3} opacity={0.4 + 0.2 * slam} />
          <circle cx="540" cy="660" r="18" fill="#FFF4C8" />
        </g>
        {/* scaffali con barattoli */}
        <g transform={L(0.5)}>
          {[-160, 760].map((x0, s) => (
            <g key={s}>
              {[0, 1, 2, 3].map((k) => <rect key={k} x={x0} y={700 + k * 130} width="480" height="14" fill="#5A4430" stroke={K} strokeWidth="4" />)}
              {CANS.filter((_, i) => (i % 10 < 5) === (s === 0)).map((c, i) => (
                <rect key={i} x={x0 + 20 + (c.x % 450)} y={700 + c.y - 80 + (slam > 0 ? Math.sin(t * 50 + i) * 3 : 0)} width={c.w * 0.8} height="80" rx="6" fill={c.c} stroke={K} strokeWidth="3" />
              ))}
            </g>
          ))}
        </g>
        {/* la porta della dispensa con il chiavistello (accento: la luce che filtra) */}
        <g transform={L(0.7)}>
          <rect x="330" y="640" width="420" height="640" fill="#0A0A08" stroke={K} strokeWidth="10" />
          <path d={`M${540 + 200 * open} 650 L540 1270`} stroke={P.accento} strokeWidth={6 * open} opacity={open} />
          <Glow id="dp-gap" x={540} y={960} r={240} t={t} color="#FFD8A0" amp={0.1} rate={2} opacity={0.4 * open} />
          <g transform={`translate(${-6 * slam} 0) skewY(${-4 * open})`}>
            <rect x="340" y="650" width="400" height="620" fill="url(#dp-door)" stroke={K} strokeWidth="8" />
            {[0, 1, 2].map((i) => <rect key={i} x="380" y={690 + i * 190} width="320" height="160" fill="none" stroke="#5A6068" strokeWidth="6" />)}
            {/* chiavistello */}
            <rect x="600" y="940" width="110" height="34" rx="6" fill="#4A4A48" stroke={K} strokeWidth="5" />
            <rect x={612 + 70 * bolt} y="948" width="80" height="18" rx="5" fill="#D9D2C2" stroke={K} strokeWidth="3" />
            <rect x="730" y="932" width="30" height="50" fill="#4A4A48" stroke={K} strokeWidth="5" />
          </g>
        </g>
        {/* la radio sul ripiano che va in pezzi e la mazza */}
        <g transform={L(0.9)}>
          <path d="M-200 1280 H1280 V2200 H-200 Z" fill="url(#dp-floor)" />
          <rect x="760" y="1170" width="320" height="24" fill="#5A4430" stroke={K} strokeWidth="5" />
          <g transform={`translate(900 1120) rotate(${smash * 18})`} opacity={1 - smash * 0.4}>
            <rect x="-90" y="-60" width="180" height="110" rx="12" fill="#3A3A34" stroke={K} strokeWidth="6" />
            <circle cx="-40" cy="-6" r="30" fill="#1A1A18" stroke="#8A8A80" strokeWidth="4" />
            <rect x="10" y="-40" width="60" height="26" fill={smash > 0 ? '#1A1A18' : '#8AE0A0'} stroke={K} strokeWidth="3" />
            <path d="M60 -60 L100 -110" stroke={K} strokeWidth="5" />
            {smash > 0 && <path d="M-60 -50 L-10 0 L-40 40 M30 -50 L0 10 L50 40" stroke="#F4F0E4" strokeWidth="4" fill="none" />}
          </g>
          {spark > 0 && spark < 1 && SPARKS.map((s, i) => <circle key={i} cx={900 + Math.cos(s.a) * s.v * spark} cy={1110 + Math.sin(s.a) * s.v * spark + 200 * spark * spark} r="4" fill="#FFE8A0" opacity={1 - spark} />)}
          <Glow id="dp-spark" x={900} y={1110} r={160} t={t} color="#FFE8A0" amp={0.2} rate={9} opacity={0.6 * spark * (1 - spark) * 4} />
          <g transform={`translate(200 ${1320}) rotate(${-30 + 60 * seg(t, 0.2, 0.5)})`}>
            <path d="M0 0 L220 -40" stroke={K} strokeWidth="26" strokeLinecap="round" />
            <path d="M0 0 L220 -40" stroke="#C8A060" strokeWidth="16" strokeLinecap="round" />
          </g>
        </g>
        <g transform={L(1.25)}>
          {[[-60, 1700], [1100, 1760], [80, 1840]].map(([x, y], i) => (
            <g key={i}>
              <rect x={x - 70} y={y - 120} width="140" height="180" rx="12" fill={['#C8202E', '#E8C030', '#3A6A9A'][i]} stroke={K} strokeWidth="8" />
              <rect x={x - 70} y={y - 70} width="140" height="60" fill="#F4F0E4" />
            </g>
          ))}
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 660, x0: 480, x1: 600 }} bottom={{ y: 1300, x0: 200, x1: 880 }} seed={7} n={22} color="#FFE2A0" boost={slam} />
          <NearMotes id="dp-near" t={t} color="#FFE2A0" n={5} y0={1300} opacity={0.07} />
        </g>
      </g>
      <Finish id="dp" tint="#3A1A14" tintOpacity={0.1} />
    </svg>
  );
};
