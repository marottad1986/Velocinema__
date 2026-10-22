import React from 'react';
import { camera, eio, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Glow, NearMotes, Smoke } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K, Owl } from './Comuni';

// Il binario nove e tre quarti: stazione di Londra, una colonna di mattoni con il cartello del binario; un carrello con
// baule e gabbia con il gufo bianco che entra nel muro come in uno specchio d'acqua; poi, oltre il muro, il treno rosso.
// Piani: tettoia della stazione (0,2) · treno rosso a vapore (0,4) · colonna di mattoni (0,6) · carrello (0,8) · binari (1,2) · vapore (1,6)

const r = rng(934);
const BRICKS = Array.from({ length: 140 }, (_, i) => ({ c: r() }));

export const Binario: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const push = eio(seg(t, cues[1], cues[1] + 1.8)); // «attraversa un muro»
  const ripple = seg(t, cues[1] + 0.6, cues[1] + 2.4);
  const train = eio(seg(t, cues[2] - 0.4, cues[2] + 1.2)); // il muro si fa trasparente e appare il treno
  const steam = 0.3 + 0.7 * train;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="bn" />
        <Lin id="bn-roof" stops={[[0, '#3A3A48'], [0.5, '#6A6A78'], [1, '#A8A8B0']]} />
        <Lin id="bn-red" x2={1} y2={0} stops={[[0, '#8A1A20'], [0.5, '#C02A30'], [1, '#7A1418']]} />
        <Lin id="bn-floor" stops={[[0, '#8A8478'], [1, '#3A3630']]} />
      </defs>
      <g transform={cam.transform}>
        {/* tettoia in ferro e vetro della stazione */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#bn-roof)" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-200 + i * 200} 1000 Q${-100 + i * 200} 500 ${i * 200} 1000`} fill="none" stroke="#2A2A36" strokeWidth="10" />)}
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M-200 ${560 + i * 40} H1280`} stroke="#4A4A58" strokeWidth="3" opacity=".6" />)}
          <Beam id="bn-sky" x={540} y={500} t={t} length={900} spread={600} color="#F4F0E0" angle={95} opacity={0.18} />
        </g>
        {/* il treno rosso a vapore (appare oltre il muro) */}
        <g transform={L(0.4)} opacity={0.15 + 0.85 * train}>
          <g transform="translate(60 1080)">
            <rect x="0" y="-220" width="560" height="200" rx="16" fill="url(#bn-red)" stroke={K} strokeWidth="9" />
            {[40, 160, 280, 400].map((x) => <rect key={x} x={x} y="-190" width="90" height="70" rx="10" fill="#FFE2A0" stroke={K} strokeWidth="5" opacity={0.7 + 0.3 * Math.sin(t * 2 + x)} />)}
            <path d="M0 -100 H560" stroke={P.accento} strokeWidth="8" />
            <rect x="560" y="-160" width="260" height="140" fill="url(#bn-red)" stroke={K} strokeWidth="9" />
            <rect x="680" y="-260" width="70" height="110" fill="#2A1A1A" stroke={K} strokeWidth="7" />
            <path d="M820 -40 L880 -20 L820 -10 Z" fill="#3A3A3A" stroke={K} strokeWidth="6" />
            {[100, 240, 380, 620, 760].map((x) => <circle key={x} cx={x} cy="0" r="40" fill="#1A1A1A" stroke={K} strokeWidth="7" />)}
            <Smoke id="bn-smoke" t={t} x={715} y={-270} color="#F4F0E8" n={9} rise={420} wind={-260} r0={30} r1={130} speed={0.35} opacity={0.8 * steam} />
          </g>
        </g>
        {/* colonna di mattoni con il cartello del binario (accento) */}
        <g transform={L(0.6, 0, 70)} opacity={1 - 0.75 * train}>
          <rect x="300" y="560" width="480" height="740" fill="#9A4A34" stroke={K} strokeWidth="10" />
          {BRICKS.map((b, i) => {
            const row = Math.floor(i / 7), col = i % 7;
            const x = 300 + col * 70 + (row % 2) * 35 - 35, y = 560 + row * 36;
            const wob = ripple > 0 && ripple < 1 ? Math.sin((Math.hypot(x - 540, y - 1100) / 40) - ripple * 20) * 6 * (1 - ripple) : 0;
            return y < 1290 && x > 270 && x < 780 ? <rect key={i} x={Math.max(300, x)} y={y + wob} width={Math.min(66, 780 - x)} height="32" fill={b.c > 0.5 ? '#A8563E' : '#8A3E2C'} stroke="#5A2A1E" strokeWidth="3" /> : null;
          })}
          <g transform="translate(540 640)">
            <rect x="-110" y="-46" width="220" height="92" rx="10" fill="#1E2A4A" stroke={K} strokeWidth="7" />
            <text x="0" y="24" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="64" fill={P.accento}>9 ¾</text>
          </g>
          {ripple > 0 && ripple < 1 && [0, 1, 2].map((k) => {
            const p = seg(ripple, k * 0.15, 0.6 + k * 0.15);
            return <ellipse key={k} cx="540" cy="1100" rx={40 + 240 * p} ry={60 + 300 * p} fill="none" stroke="#F4E8D0" strokeWidth="5" opacity={(1 - p) * 0.8} />;
          })}
        </g>
        {/* carrello con baule e gabbia del gufo che entra nel muro */}
        <g transform={L(0.8)}>
          <path d="M-200 1290 H1280 V2200 H-200 Z" fill="url(#bn-floor)" />
          <g transform={`translate(${200 + 260 * push} ${1220 - 40 * push}) scale(${1 - 0.25 * push})`} opacity={1 - seg(push, 0.75, 1)}>
            <path d="M-160 80 H160 L190 -40" stroke={K} strokeWidth="12" fill="none" strokeLinecap="round" />
            <path d="M-160 80 L-200 -60" stroke={K} strokeWidth="12" strokeLinecap="round" />
            <circle cx="-110" cy="110" r="24" fill="#2A2A2A" stroke={K} strokeWidth="6" /><circle cx="110" cy="110" r="24" fill="#2A2A2A" stroke={K} strokeWidth="6" />
            <rect x="-150" y="-30" width="280" height="110" rx="8" fill="#6A3A20" stroke={K} strokeWidth="8" />
            <path d="M-150 10 H130 M-60 -30 V80 M40 -30 V80" stroke="#C9A060" strokeWidth="6" />
            <g transform="translate(-20 -110)">
              <path d="M-60 80 V-20 Q0 -90 60 -20 V80 Z" fill="none" stroke="#C9A24A" strokeWidth="6" />
              {[-40, -20, 0, 20, 40].map((x) => <path key={x} d={`M${x} 80 V${-30 - (20 - Math.abs(x)) * 0.8}`} stroke="#C9A24A" strokeWidth="3" />)}
              <Owl x={0} y={30} s={0.55} t={t} />
            </g>
          </g>
        </g>
        {/* bordo del binario e lampioni in primo piano */}
        <g transform={L(1.2)}>
          <path d="M-200 1700 H1280 V1740 H-200 Z" fill="#E8D8A0" stroke={K} strokeWidth="6" />
          {[-60, 1140].map((x, i) => (
            <g key={x}>
              <path d={`M${x} 1700 V900`} stroke={K} strokeWidth="22" />
              <path d={`M${x - 40} 900 H${x + 40} L${x + 30} 840 H${x - 30} Z`} fill="#2A2A2A" stroke={K} strokeWidth="6" />
              <Glow id={`bn-lamp${i}`} x={x} y={880} r={140} t={t} color="#FFE2A0" amp={0.05} rate={2} opacity={0.6} />
            </g>
          ))}
        </g>
        <g transform={L(1.6)}>
          {Array.from({ length: 6 }, (_, i) => {
            const p = mod(t * 0.12 + i / 6, 1);
            return <circle key={i} cx={-100 + p * 1300} cy={1500 - i * 60} r={80 + 40 * Math.sin(i)} fill="#F4F0E8" opacity={0.1 * steam} />;
          })}
          <NearMotes id="bn-near" t={t} color="#F4F0E8" n={5} y0={1300} opacity={0.08} />
        </g>
      </g>
      <Finish id="bn" tint="#E8B04A" tintOpacity={0.07} />
    </svg>
  );
};
