import React from 'react';
import { camera, eo, rng, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { K } from './Comuni';

// La notte in metropolitana: un vagone vuoto di notte, i sedili arancioni, i neon che tremolano, il buio della galleria
// che corre nei finestrini; sulla prima frase per terra una cravatta e una valigetta; su «li uccide» i neon si spengono a
// lampi (tre lampi rossi, senza armi in vista); su «nasce una protesta» si passa a un muro della città coperto di
// manifesti con maschere da clown appese che dondolano (accento sui nasi rossi). Nessuna persona.
// Piani: galleria (0,2) · vagone (0,5) · sedili (0,8) · oggetti a terra (1,05) · maniglie (1,3) · pulviscolo (1,6)

const r = rng(3);
const MASKS = Array.from({ length: 9 }, (_, i) => ({ x: 130 + (i % 3) * 300 + r() * 60, y: 780 + Math.floor(i / 3) * 170 + r() * 20, rot: (r() - 0.5) * 30 }));

export const Metro: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  // tre lampi distanziati di 0,45 s, con dissolvenza (non più di 3 al secondo)
  const flash = [0, 0.45, 0.9].reduce((m, d) => Math.max(m, seg(t, cues[1] + 0.6 + d, cues[1] + 0.66 + d) * (1 - seg(t, cues[1] + 0.72 + d, cues[1] + 1.0 + d))), 0);
  const dark = seg(t, cues[1] + 0.5, cues[1] + 0.6) * (1 - seg(t, cues[1] + 1.6, cues[1] + 2.2));
  const wall = eo(seg(t, cues[2] - 0.2, cues[2] + 0.7));
  const neon = Math.sin(t * 17) > 0.85 ? 0.5 : 1;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="mt" />
        <Lin id="mt-car" stops={[[0, '#C8C8B8'], [1, '#7A7A6E']]} />
        <Lin id="mt-wall" stops={[[0, '#5A4A3A'], [1, '#2A2018']]} />
      </defs>
      <g transform={cam.transform}>
        <g opacity={1 - wall}>
          <g transform={L(0.2)}>
            <rect x="-200" y="-200" width="1480" height="2400" fill="#06080A" />
            {Array.from({ length: 6 }, (_, i) => <rect key={i} x={((i * 300 - t * 900) % 1800 + 1800) % 1800 - 300} y="620" width="30" height="300" fill="#F2C46A" opacity=".25" />)}
          </g>
          <g transform={L(0.5)}>
            <path d="M-200 -200 H1280 V600 H-200 Z M-200 940 H1280 V2200 H-200 Z" fill="url(#mt-car)" />
            {[0, 1, 2, 3].map((i) => <rect key={i} x={-150 + i * 330} y="600" width="290" height="340" rx="30" fill="none" stroke="#5A5A50" strokeWidth="16" />)}
            {[0, 1, 2].map((i) => <rect key={i} x={20 + i * 380} y="500" width="240" height="26" rx="10" fill="#F4F8E8" opacity={(1 - dark) * neon} />)}
            <Glow id="mt-neon" x={540} y={520} r={700} t={t} color="#E8F4E0" amp={0.03} rate={2} opacity={0.4 * (1 - dark) * neon} />
          </g>
          <g transform={L(0.8)}>
            <rect x="-200" y="1060" width="1480" height="90" rx="20" fill="#E8742A" stroke={K} strokeWidth="7" />
            <rect x="-200" y="960" width="1480" height="100" fill="#D8642A" stroke={K} strokeWidth="7" />
            {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-140 + i * 190} 960 V1150`} stroke="#B8521E" strokeWidth="6" />)}
            <path d="M-200 1150 H1280 V2200 H-200 Z" fill="#4A4A44" />
          </g>
          <g transform={L(1.05)}>
            <g transform="translate(330 1220) rotate(-14)"><path d="M0 0 L30 -20 L60 0 L40 160 L30 180 L20 160 Z" fill="#2A4A8A" stroke={K} strokeWidth="5" /><path d="M10 40 L50 60 M14 90 L46 110" stroke="#E8D8A0" strokeWidth="5" /></g>
            <g transform="translate(700 1230) rotate(8)"><rect x="-90" y="-60" width="180" height="120" rx="10" fill="#3A2A1E" stroke={K} strokeWidth="6" /><path d="M-30 -60 V-80 H30 V-60" stroke={K} strokeWidth="6" fill="none" /><rect x="-10" y="-10" width="20" height="16" fill="#C9A24A" /></g>
          </g>
          <g transform={L(1.3)}>
            <path d="M-200 380 H1280" stroke="#C8C8C0" strokeWidth="16" />
            {[100, 420, 740, 1000].map((x, i) => <g key={x} transform={`rotate(${Math.sin(t * 2 + i) * 6} ${x} 380)`}><path d={`M${x} 380 V460`} stroke="#C8C8C0" strokeWidth="6" /><circle cx={x} cy={486} r="26" fill="none" stroke="#C8C8C0" strokeWidth="9" /></g>)}
          </g>
          <rect x="-200" y="-200" width="1480" height="2400" fill="#000" opacity={0.75 * dark} />
          <rect x="-200" y="-200" width="1480" height="2400" fill={P.accento} opacity={0.5 * flash} />
        </g>
        {/* il muro della città con le maschere da clown */}
        <g opacity={wall}>
          <g transform={L(0.4)}>
            <rect x="-200" y="-200" width="1480" height="2400" fill="url(#mt-wall)" />
            {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-160 + (i % 6) * 230} y={680 + Math.floor(i / 6) * 300} width="210" height="280" fill={['#E8D8B0', '#C8B890', '#D8C8A0'][i % 3]} stroke={K} strokeWidth="4" transform={`rotate(${(i % 3) - 1} ${-55 + (i % 6) * 230} ${820 + Math.floor(i / 6) * 300})`} />)}
            {Array.from({ length: 12 }, (_, i) => <path key={`t${i}`} d={`M${-130 + (i % 6) * 230} ${740 + Math.floor(i / 6) * 300} h150 M${-130 + (i % 6) * 230} ${780 + Math.floor(i / 6) * 300} h120`} stroke="#3A2A1E" strokeWidth="10" />)}
          </g>
          <g transform={L(0.8)}>
            {MASKS.map((m, i) => (
              <g key={i} transform={`translate(${m.x} ${m.y}) rotate(${m.rot + Math.sin(t * 2 + i) * 4})`}>
                <path d="M0 -60 V-90" stroke={K} strokeWidth="3" />
                <ellipse cx="0" cy="0" rx="58" ry="70" fill="#F2EEE4" stroke={K} strokeWidth="5" />
                <path d="M-30 -14 l-10 -14 M30 -14 l10 -14" stroke="#2A5A9A" strokeWidth="6" />
                <ellipse cx="-22" cy="-8" rx="10" ry="7" fill={K} /><ellipse cx="22" cy="-8" rx="10" ry="7" fill={K} />
                <circle cx="0" cy="14" r="13" fill={P.accento} stroke={K} strokeWidth="3" />
                <path d="M-30 34 Q0 58 30 34" stroke={P.accento} strokeWidth="8" fill="none" />
              </g>
            ))}
          </g>
          <g transform={L(1.1)}>
            <path d="M-200 1260 H1280 V2200 H-200 Z" fill="#2A2420" />
            <Glow id="mt-street" x={900} y={1100} r={300} t={t} color="#F2C46A" amp={0.05} rate={2} opacity={0.4} />
          </g>
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 520, x0: 100, x1: 980 }} bottom={{ y: 1250, x0: 100, x1: 980 }} seed={5} n={22} color="#F4F8E8" />
          <NearMotes id="mt-near" t={t} color="#F4F8E8" n={6} opacity={0.07} />
        </g>
      </g>
      <Finish id="mt" tint="#1E2E2A" tintOpacity={0.14} />
    </svg>
  );
};
