import React from 'react';
import { camera, eio, mod, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Fog, Glow, Moon, NearMotes, Reflection, Stars, WaveLines } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Castle, K, Owl } from './Comuni';

// Il castello: notte su un grande lago nero; in alto, sulla scogliera, il castello con tante torri e finestre accese;
// sull'acqua una fila di barchette con le lanterne; stelle e nebbia bassa; un gufo che vola verso le torri.
// Piani: cielo e stelle (0,2) · castello sulla scogliera (0,4) · lago (0,6) · barchette (0,8) · canne in primo piano (1,25) · lucciole (1,6)

export const Castello: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const lit = seg(t, cues[2], cues[3]); // le finestre si accendono mentre arrivano
  const row = eio(seg(t, cues[2] - 0.5, dur)); // le barche avanzano verso il castello
  const owl = mod(t * 0.09, 1);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ca" />
        <Lin id="ca-sky" stops={[[0, '#05061A'], [0.4, '#141A3E'], [0.6, '#2A2E5A']]} />
        <Lin id="ca-cliff" x2={1} y2={0} stops={[[0, '#14122A'], [0.6, '#24223E'], [1, '#100E22']]} />
        <Lin id="ca-lake" stops={[[0, '#141A36'], [1, '#05060E']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#ca-sky)" />
          <Stars t={t} seed={22} n={60} y={-100} h={900} size={1.1} />
          <Moon id="ca-moon" x={860} y={600} r={50} t={t} color="#F4F0DC" halo="#D8D4F0" />
        </g>
        {/* il castello sulla scogliera */}
        <g transform={L(0.4)}>
          <path d="M-200 1060 Q100 1000 260 900 L760 890 Q900 960 1280 1060 V1100 H-200 Z" fill="url(#ca-cliff)" />
          <Glow id="ca-castleg" x={520} y={760} r={420} t={t} color="#FFD27A" amp={0.04} rate={1} opacity={0.15 + 0.25 * lit} />
          <Castle x={520} y={900} s={0.95} t={t} lit={0.35 + 0.65 * lit} fill="#1A1834" />
          <g transform={`translate(${-100 + owl * 1300} ${700 - Math.sin(owl * Math.PI) * 140})`}><Owl x={0} y={0} s={0.35} t={t} fly={1} /></g>
        </g>
        {/* il lago con i riflessi del castello */}
        <g transform={L(0.6)}>
          <rect x="-200" y="1060" width="1480" height="900" fill="url(#ca-lake)" />
          {[200, 340, 480, 620, 760].map((x, i) => <Reflection key={x} t={t + i} x={x} y={1080} color="#FFD27A" n={5} w={30} gap={18} opacity={0.3 * (0.35 + 0.65 * lit)} />)}
          <Reflection t={t} x={860} y={1080} color="#F4F0DC" n={8} w={60} opacity={0.4} />
          <WaveLines t={t} ys={[1120, 1180, 1260]} color="#3A4070" amp={5} w={200} speed={14} opacity={0.6} />
          <Fog id="ca-fog" t={t} y={1080} color="#5A5E8A" rx={900} ry={50} opacity={0.4} />
        </g>
        {/* fila di barchette con le lanterne (accento) */}
        <g transform={L(0.8)}>
          {[0, 1, 2, 3, 4].map((i) => {
            const x = -40 + i * 250 + row * 160, y = 1240 - i * 22 - row * 60, s = 0.9 - i * 0.08 - row * 0.15;
            return (
              <g key={i} transform={`translate(${x} ${y + Math.sin(t * 1.6 + i) * 4}) scale(${s})`}>
                <Reflection t={t + i} x={30} y={30} color={P.accento} n={4} w={30} gap={14} opacity={0.5} />
                <path d="M-90 0 H110 Q90 40 60 44 H-60 Q-90 30 -90 0 Z" fill="#4A3424" stroke={K} strokeWidth="6" />
                <path d="M-80 8 H100" stroke="#6A4A30" strokeWidth="5" />
                <path d="M80 0 V-90" stroke={K} strokeWidth="6" />
                <rect x="66" y="-120" width="28" height="34" rx="6" fill={P.accento} stroke={K} strokeWidth="4" />
                <Glow id={`ca-lan${i}`} x={80} y={-104} r={70} t={t} color="#FFD27A" amp={0.12} rate={3 + i} opacity={0.8} />
              </g>
            );
          })}
        </g>
        {/* canne in primo piano */}
        <g transform={L(1.25)}>
          {Array.from({ length: 22 }, (_, i) => {
            const x = i < 11 ? -120 + i * 30 : 900 + (i - 11) * 30;
            const h = 300 + ((i * 53) % 220);
            const b = Math.sin(t * 1.4 + i) * 10;
            return <path key={i} d={`M${x} 1940 Q${x + b * 0.5} ${1940 - h * 0.5} ${x + b} ${1940 - h}`} stroke={i % 2 ? '#14122A' : '#1E1C34'} strokeWidth="10" fill="none" strokeLinecap="round" />;
          })}
        </g>
        <g transform={L(1.6)}><NearMotes id="ca-near" t={t} color="#FFD27A" n={6} y0={1300} opacity={0.08} /></g>
      </g>
      <Finish id="ca" tint="#1E1A3A" tintOpacity={0.12} />
    </svg>
  );
};
