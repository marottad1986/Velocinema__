import React from 'react';
import { camera, eio, eo, mod, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Fog, Glow, NearMotes, Rain, Stars } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Fern, Jeep, K } from './Comuni';

// La notte nella giungla: giungla di notte sotto la pioggia; una jeep impantanata con i fari accesi, la bomboletta che
// scivola nel fango; in alto i rami di un albero enorme dove ci si ripara (la pioggia cala e spuntano le stelle).
// Piani: cielo (0,2) · giungla lontana (0,4) · fango, jeep e bomboletta (0,7) · grande ramo (0,95) · felci (1,25) · pioggia (1,6)

export const Notte: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const lightsOut = seg(t, cues[1], cues[1] + 0.8); // la jeep resta buia: Nedry non c'è più
  const slide = eo(seg(t, cues[2], cues[2] + 1.6)); // la bomboletta scivola nel fango e sparisce
  const calm = eio(seg(t, cues[3], dur)); // sull'albero: la pioggia cala, spuntano le stelle

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="nt" />
        <Lin id="nt-sky" stops={[[0, '#04080A'], [0.5, '#0C1814'], [1, '#162A22']]} />
        <Lin id="nt-mud" stops={[[0, '#2E2A1C'], [1, '#100E08']]} />
        <Lin id="nt-can" x2={1} y2={0} stops={[[0, '#7A8488'], [0.5, '#D8DEE0'], [1, '#5A6468']]} />
        <Lin id="nt-bark" stops={[[0, '#3A2E20'], [1, '#1E1810']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#nt-sky)" />
          <g opacity={calm}><Stars t={t} seed={8} n={30} y={500} h={400} /></g>
        </g>
        <g transform={L(0.4)}>
          {[-120, 120, 380, 640, 900, 1160].map((x, i) => <ellipse key={x} cx={x} cy={1000 + (i % 2) * 30} rx="170" ry="220" fill={i % 2 ? '#0E1E16' : '#0A1810'} />)}
          <Fog id="nt-fog" t={t} y={1120} color="#3A5048" rx={800} ry={60} opacity={0.4} />
          <Rain t={t} level="far" seed={5} color="#6E8A86" opacity={0.4 * (1 - calm * 0.8)} angle={10} />
        </g>
        {/* fango, jeep impantanata con i fari e la bomboletta che scivola via (accento) */}
        <g transform={L(0.7)}>
          <path d="M-200 1120 Q540 1080 1280 1130 V2200 H-200 Z" fill="url(#nt-mud)" stroke={K} strokeWidth="6" />
          <Beam id="nt-head" x={760} y={1110} t={t} length={700} spread={160} color="#FFF4D0" angle={-8} opacity={0.4 * (1 - lightsOut * 0.85)} />
          <Jeep x={600} y={1150} s={0.85} accent="#5A7A5A" lights={1 - lightsOut} tilt={-6} />
          <path d="M440 1190 Q600 1210 760 1186 V1230 H440 Z" fill="#2E2A1C" />
          {/* portiera aperta */}
          <path d="M560 1060 L520 1020 V1110 L560 1130 Z" fill="#C9C2B2" stroke={K} strokeWidth="5" />
          <g transform={`translate(${380 - 260 * slide} ${1240 + 60 * slide}) rotate(${80 + 60 * slide})`} opacity={1 - seg(slide, 0.7, 1)}>
            <Glow id="nt-cang" x={0} y={0} r={110} t={t} color="#FFD58A" amp={0.1} rate={2} opacity={0.4} />
            <rect x="-30" y="-80" width="60" height="140" rx="12" fill="url(#nt-can)" stroke={K} strokeWidth="6" />
            <rect x="-30" y="-30" width="60" height="26" fill="#2E7D4F" />
            <rect x="-6" y="-100" width="12" height="20" fill="#D8DEE0" stroke={K} strokeWidth="3" />
            <rect x="-14" y="40" width="28" height="16" fill={P.accento} />
          </g>
          {/* pozzanghere e cerchi di pioggia */}
          {[[260, 1320, 140], [820, 1300, 110]].map(([x, y, w], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={w} ry={w * 0.16} fill="#1E2A2A" />
              {Array.from({ length: 3 }, (_, k) => {
                const p = mod(t * 1.2 + k * 0.33 + i * 0.2, 1);
                return <ellipse key={k} cx={x - w * 0.5 + ((k * 61 + i * 40) % w)} cy={y} rx={4 + 26 * p} ry={1 + 5 * p} fill="none" stroke="#7FA0A0" strokeWidth="2" opacity={(1 - p) * (1 - calm * 0.7)} />;
              })}
            </g>
          ))}
        </g>
        {/* grande ramo dell'albero dove si riparano */}
        <g transform={L(0.95, 0, 120)}>
          <path d="M1280 520 Q900 560 640 640 Q520 680 380 660 L380 700 Q540 730 660 690 Q920 620 1280 600 Z" fill="url(#nt-bark)" stroke={K} strokeWidth="8" />
          <path d="M1280 540 Q900 580 640 660" fill="none" stroke="#5A4A34" strokeWidth="5" />
          {[[460, 640], [700, 600], [940, 560], [1160, 520]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${Math.sin(t * 1.2 + i) * 3})`}>
              <path d="M0 0 Q-40 -60 -100 -50 Q-50 -20 0 0 Z M0 0 Q40 -70 110 -60 Q50 -20 0 0 Z" fill="#1E4A30" stroke={K} strokeWidth="4" />
            </g>
          ))}
          <Glow id="nt-moon" x={900} y={500} r={260} t={t} color="#DCEBF0" amp={0.04} rate={0.8} opacity={0.2 * calm} />
        </g>
        <g transform={L(1.25)}>
          <Fern x={20} y={1920} s={2.6} t={t} ph={0.5} color="#163A26" />
          <Fern x={1060} y={1920} s={2.6} t={t} ph={2} color="#163A26" flip />
        </g>
        <g transform={L(1.6)}>
          <Rain t={t} level="near" seed={23} color="#A8BCB8" opacity={0.45 * (1 - calm * 0.8)} angle={10} />
          <NearMotes id="nt-near" t={t} color="#A8BCB8" n={5} y0={1300} opacity={0.07} />
        </g>
      </g>
      <Finish id="nt" tint="#0F1F17" tintOpacity={0.13} />
    </svg>
  );
};
