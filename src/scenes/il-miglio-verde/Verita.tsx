import React from 'react';
import { camera, eo, seg } from '../../lib/anim';
import { Dust, Flyers, Glow, NearMotes, SunRays } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { GOLD, K } from './Comuni';

// Il vero assassino: il ricordo che John mostra a Paul, color seppia. Una fattoria al tramonto, il portico, il fienile, il
// campo di grano; due altalene vuote che dondolano piano. Su «Perché proprio Wild Bill?» il ricordo si accende dal bordo;
// su «le aveva uccise Wild Bill» sul recinto compare il cappello da bracciante di Wild Bill e le altalene si fermano; su
// «nessuno può fermare l'esecuzione» il ricordo si scolorisce e si chiude. Nessuna persona: le bambine non si mostrano mai.
// Piani: cielo e sole (0,2) · fattoria e fienile (0,45) · grano (0,7) · altalene (0,9) · recinto con il cappello (1,2) · pollini (1,6)

export const Verita: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const open = eo(seg(t, griglia(cues[0] + 0.3), griglia(cues[0] + 0.3) + 1.2));
  const hat = eo(seg(t, griglia(cues[1] + 1.4), griglia(cues[1] + 1.4) + 0.6));
  const stop = seg(t, griglia(cues[1] + 1.4), griglia(cues[1] + 1.4) + 1.5);
  const fade = eo(seg(t, griglia(cues[2] + 0.5), dur - 0.2));
  const sw = Math.sin(t * 1.8) * 14 * (1 - stop);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="vr" />
        <Lin id="vr-sky" stops={[[0, '#5A3A2A'], [0.45, '#C8804A'], [0.8, '#F2C47A'], [1, '#F8DCA0']]} />
        <Lin id="vr-field" stops={[[0, '#C89A4A'], [1, '#7A5A2A']]} />
        <Lin id="vr-barn" x2={1} y2={0} stops={[[0, '#9A4A30'], [1, '#6A2E1E']]} />
        <Lin id="vr-house" x2={1} y2={0} stops={[[0, '#E8D8B8'], [1, '#A89878']]} />
        <radialGradient id="vr-vig" cx=".5" cy=".5" r=".6">
          <stop offset=".55" stopColor="#2A1A10" stopOpacity="0" />
          <stop offset="1" stopColor="#1A0E08" stopOpacity=".95" />
        </radialGradient>
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#vr-sky)" />
          <circle cx="940" cy="860" r="80" fill="#FFE8B0" />
          <SunRays id="vr-rays" x={940} y={860} t={t} color="#FFE8C0" n={10} length={700} opacity={0.22} />
          <Glow id="vr-sun" x={940} y={860} r={420} t={t} color="#FFD890" amp={0.05} rate={1} opacity={0.5} />
          {[[200, 700], [420, 640], [900, 680]].map(([x, y], i) => (
            <path key={i} d={`M${x - 120 + Math.sin(t * 0.2 + i) * 20} ${y} q60 -40 120 -10 q50 -30 110 0 q40 10 0 20 h-230 Z`} fill="#F2C49A" opacity=".55" />
          ))}
        </g>
        {/* la fattoria con il portico e il fienile rosso */}
        <g transform={L(0.45)}>
          <path d="M-200 1060 Q300 1020 700 1050 Q1000 1070 1280 1040 V1300 H-200 Z" fill="#8A6A3A" />
          <path d="M60 860 L210 760 L360 860 Z" fill="#5A4030" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          <rect x="80" y="860" width="260" height="200" fill="url(#vr-house)" stroke={K} strokeWidth="7" />
          <rect x="120" y="900" width="60" height="60" fill="#3A2A1E" stroke={K} strokeWidth="5" />
          <rect x="240" y="960" width="60" height="100" fill="#4A3424" stroke={K} strokeWidth="5" />
          <path d="M60 950 H360 M80 950 V1060 M340 950 V1060" stroke="#E8D8B8" strokeWidth="8" />
          <path d="M600 900 L760 800 L920 900 V1060 H600 Z" fill="url(#vr-barn)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M700 1060 V950 H820 V1060 M700 950 L820 1060 M820 950 L700 1060" stroke="#E8D8C0" strokeWidth="7" fill="none" />
          <path d="M600 900 L760 800 L920 900" stroke="#E8D8C0" strokeWidth="6" fill="none" />
          {/* un mulino a vento lontano */}
          <g transform="translate(470 860)">
            <path d="M-10 200 L0 0 L10 200" stroke="#5A4030" strokeWidth="6" fill="none" />
            <g transform={`rotate(${t * 40})`}>{[0, 60, 120, 180, 240, 300].map((a) => <path key={a} d="M0 0 L0 -60" stroke="#E8D8C0" strokeWidth="6" transform={`rotate(${a})`} />)}</g>
          </g>
        </g>
        {/* il campo di grano che ondeggia */}
        <g transform={L(0.7)}>
          <path d="M-200 1150 H1280 V2000 H-200 Z" fill="url(#vr-field)" />
          {Array.from({ length: 60 }, (_, i) => {
            const x = -180 + (i % 20) * 75 + Math.floor(i / 20) * 30;
            const y = 1170 + Math.floor(i / 20) * 70;
            const b = Math.sin(t * 1.4 + x * 0.01) * 10;
            return <path key={i} d={`M${x} ${y + 60} Q${x + b / 2} ${y + 20} ${x + b} ${y}`} stroke="#E8C070" strokeWidth="5" fill="none" />;
          })}
        </g>
        {/* le due altalene vuote appese al ramo di una quercia */}
        <g transform={L(0.9)}>
          <path d="M120 1300 Q110 900 180 640" stroke="#4A3020" strokeWidth="48" fill="none" />
          <path d="M150 760 Q500 700 900 740" stroke="#4A3020" strokeWidth="28" fill="none" />
          <ellipse cx="200" cy="700" rx="200" ry="100" fill="#5A6A30" opacity=".9" />
          <ellipse cx="420" cy="720" rx="200" ry="70" fill="#6A7A38" opacity=".85" />
          {[460, 680].map((x, i) => {
            const a = sw * (i ? -1 : 1) * (i ? 0.8 : 1);
            return (
              <g key={x} transform={`rotate(${a} ${x} 735)`}>
                <path d={`M${x - 50} 735 V1050 M${x + 50} 735 V1050`} stroke="#C8A878" strokeWidth="5" />
                <rect x={x - 66} y="1046" width="132" height="22" rx="4" fill="#8A6A40" stroke={K} strokeWidth="5" />
              </g>
            );
          })}
        </g>
        {/* il recinto in primo piano con il cappello del bracciante */}
        <g transform={L(1.2)}>
          <path d="M-200 1200 H1280 M-200 1290 H1280" stroke="#6A4A2A" strokeWidth="18" />
          {[-60, 200, 460, 720, 980].map((x) => <rect key={x} x={x} y="1160" width="34" height="320" fill="#7A5A32" stroke={K} strokeWidth="6" />)}
          {hat > 0 && (
            <g transform={`translate(860 ${1150 - 20 * (1 - hat)})`} opacity={hat}>
              <Glow id="vr-hat" x={0} y={-10} r={180} t={t} color={GOLD} amp={0.1} rate={2.4} opacity={0.4} />
              <path d="M-90 0 Q0 -20 90 0 Q70 14 0 16 Q-70 14 -90 0 Z" fill="#6A5232" stroke={K} strokeWidth="6" />
              <path d="M-50 -2 Q-48 -60 0 -62 Q48 -60 50 -2 Z" fill="#7A6040" stroke={K} strokeWidth="6" />
              <path d="M-48 -16 H48" stroke="#3A2A1A" strokeWidth="8" />
            </g>
          )}
          <path d="M-200 1480 H1280 V2200 H-200 Z" fill="#3A2614" />
          {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${-180 + i * 100} 1480 q10 -50 ${20 + Math.sin(t + i) * 8} -90`} stroke="#9A7A3A" strokeWidth="6" fill="none" />)}
        </g>
        <g transform={L(1.6)}>
          <Flyers t={t} seed={66} n={4} color="#E8C070" outline={K} w={16} h={22} y0={700} y1={1300} speed={0.05} shape="leaf" />
          <Dust t={t} top={{ y: 900, x0: 600, x1: 900 }} bottom={{ y: 1400, x0: 300, x1: 1100 }} seed={61} n={26} color="#FFE8B0" boost={0.3} />
          <NearMotes id="vr-near" t={t} color="#FFE8B0" n={6} y0={1200} opacity={0.08} />
        </g>
      </g>
      {/* il ricordo: si apre dal bordo come un vecchio film, poi si scolorisce */}
      <rect width="1080" height="1920" fill="#8A6A3A" opacity={0.18 + 0.25 * fade} />
      <rect width="1080" height="1920" fill="url(#vr-vig)" opacity={1 - 0.6 * open + 0.4 * fade} />
      <rect width="1080" height="1920" fill="#2A1A10" opacity={0.45 * fade} />
      <Finish id="vr" tint="#5A3A1E" tintOpacity={0.12} />
    </svg>
  );
};
