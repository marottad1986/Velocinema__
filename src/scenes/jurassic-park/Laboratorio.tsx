import React from 'react';
import { camera, eo, mod, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Dust, Glow, NearMotes, Wisps } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Egg, K } from './Comuni';

// Il laboratorio: incubatrice con le uova sotto lampade calde, bracci meccanici, un uovo che si crepa e si apre
// (restano solo i gusci); schermi con grafici; tutti i cartellini delle uova dicono «F», femmina.
// Piani: parete con finestre (0,25) · schermi (0,45) · incubatrice e uova (0,7) · braccio meccanico (1,0) · tubi in primo piano (1,25) · vapore (1,6)

const EGGS = [[300, 0.85], [430, 0.9], [560, 1.15], [700, 0.9], [820, 0.85]];

export const Laboratorio: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const crack = seg(t, cues[1], cues[1] + 1.0); // «vedono nascere un cucciolo dall'uovo»
  const open = eo(seg(t, cues[1] + 1.0, cues[1] + 1.8));
  const arm = Math.sin(t * 0.8) * 12;
  const tags = eo(seg(t, cues[2], cues[2] + 0.8)); // cartellini «F»: «sono tutte femmine»

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="lb" />
        <Lin id="lb-wall" stops={[[0, '#DDE6E0'], [0.5, '#C4D2CA'], [1, '#9AAEA4']]} />
        <Lin id="lb-inc" stops={[[0, '#F0E2BE'], [1, '#C9A866']]} />
        <Lin id="lb-steel" x2={1} y2={0} stops={[[0, '#8A9690'], [0.5, '#C9D2CE'], [1, '#7A8680']]} />
        <Lin id="lb-floor" stops={[[0, '#7A8A82'], [1, '#2A3430']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — parete chiara del laboratorio con finestre sulla giungla */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#lb-wall)" />
          {[-120, 880].map((x) => (
            <g key={x}>
              <rect x={x} y="560" width="300" height="300" fill="#7FB89A" stroke="#5A6E64" strokeWidth="12" />
              <circle cx={x + 80} cy="760" r="90" fill="#3E7A54" /><circle cx={x + 220} cy="720" r="110" fill="#2E6A48" />
              <Beam id={`lb-win${x}`} x={x + 150} y={860} t={t} length={500} spread={300} color="#FFFFFF" angle={100} opacity={0.12} />
            </g>
          ))}
        </g>

        {/* PIANO 1 — schermi con i grafici delle uova */}
        <g transform={L(0.45)}>
          <rect x="300" y="560" width="480" height="200" rx="12" fill="#14302A" stroke={K} strokeWidth="8" />
          <path d={`M320 700 ${Array.from({ length: 22 }, (_, i) => `L${320 + i * 20} ${680 - Math.abs(Math.sin(i * 0.7 + t * 2)) * 60 - (i === 14 ? 50 * crack : 0)}`).join(' ')}`} fill="none" stroke="#8EF0C0" strokeWidth="4" />
          <rect x="320" y="580" width={120 + 300 * crack} height="12" fill={P.accento} opacity=".9" />
          <Glow id="lb-scr" x={540} y={660} r={300} t={t} color="#8EF0C0" amp={0.06} rate={3} opacity={0.25} />
        </g>

        {/* PIANO 2 — incubatrice con le uova sotto le lampade calde */}
        <g transform={L(0.7)}>
          {EGGS.map(([x], i) => (
            <g key={i}>
              <path d={`M${x} 820 V880`} stroke={K} strokeWidth="6" />
              <path d={`M${x - 40} 880 H${x + 40} L${x + 26} 910 H${x - 26} Z`} fill="#3A3A34" stroke={K} strokeWidth="5" />
              <Beam id={`lb-lamp${i}`} x={x} y={910} t={t} length={230} spread={120} color="#FFC870" angle={90} opacity={0.35} />
              <Glow id={`lb-lg${i}`} x={x} y={914} r={70} t={t} color="#FFD58A" amp={0.08} rate={2 + i * 0.3} opacity={0.7} />
            </g>
          ))}
          <path d="M200 1160 H900 L940 1260 H160 Z" fill="url(#lb-inc)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M180 1180 H920" stroke="#FFF2CC" strokeWidth="5" opacity=".7" />
          <Glow id="lb-heat" x={560} y={1130} r={420} t={t} color="#FFC870" amp={0.05} rate={1.6} opacity={0.35} />
          {EGGS.map(([x, s], i) => (
            <g key={i}>
              {i === 2
                ? <Egg x={x} y={1110 + (crack > 0 && crack < 1 ? Math.sin(t * 40) * 3 : 0)} s={s} crack={crack} open={open} />
                : <Egg x={x} y={1120} s={s} />}
              <g transform={`translate(${x} 1230) scale(${tags})`}>
                <rect x="-26" y="-18" width="52" height="34" rx="6" fill="#F4F1E6" stroke={K} strokeWidth="4" />
                <text x="0" y="10" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="26" fill="#C2301E">F</text>
              </g>
            </g>
          ))}
          <Wisps t={t} x={560} y={1060} color="#FFF2D8" n={3} h={160} width={5} opacity={0.4} />
        </g>

        {/* PIANO 3 — braccio meccanico che scende sull'uovo */}
        <g transform={L(1.0)}>
          <path d={`M1180 520 L${880 + arm} 720 L${640 + arm * 1.5} ${880 + 40 * crack}`} fill="none" stroke={K} strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M1180 520 L${880 + arm} 720 L${640 + arm * 1.5} ${880 + 40 * crack}`} fill="none" stroke="url(#lb-steel)" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={880 + arm} cy="720" r="24" fill="#5A6460" stroke={K} strokeWidth="6" />
          <path d={`M${620 + arm * 1.5} ${880 + 40 * crack} l-20 40 M${660 + arm * 1.5} ${880 + 40 * crack} l20 40`} stroke={K} strokeWidth="10" strokeLinecap="round" />
          <circle cx={640 + arm * 1.5} cy={876 + 40 * crack} r="8" fill={mod(t, 1) < 0.5 ? '#8EF0C0' : '#2A5A40'} />
        </g>

        {/* PIANO 4 — bancone d'acciaio e tubi in primo piano */}
        <g transform={L(1.25)}>
          <path d="M-200 1500 H1280 V2200 H-200 Z" fill="url(#lb-floor)" stroke={K} strokeWidth="8" />
          <path d="M-200 1360 Q-60 1300 40 1420 Q100 1520 60 1940" fill="none" stroke={K} strokeWidth="44" />
          <path d="M-200 1360 Q-60 1300 40 1420 Q100 1520 60 1940" fill="none" stroke="#C9D2CE" strokeWidth="28" />
          <path d="M1280 1420 Q1140 1400 1080 1520 Q1040 1640 1060 1940" fill="none" stroke={K} strokeWidth="40" />
          <path d="M1280 1420 Q1140 1400 1080 1520 Q1040 1640 1060 1940" fill="none" stroke="#A8B4AE" strokeWidth="24" />
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 920, x0: 260, x1: 860 }} bottom={{ y: 1150, x0: 200, x1: 900 }} seed={22} n={20} color="#FFF2D0" />
          <NearMotes id="lb-near" t={t} color="#FFF2D0" n={5} y0={1300} opacity={0.08} />
        </g>
      </g>
      <Finish id="lb" tint="#1E4A30" tintOpacity={0.08} />
    </svg>
  );
};
