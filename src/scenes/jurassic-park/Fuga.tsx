import React from 'react';
import { camera, eio, eo, mod, rng, seg } from '../../lib/anim';
import { Beam, Dust, Glow, Gulls, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Helicopter, K } from './Comuni';

// La fuga: atrio del centro visitatori con gli scheletri da museo e lo striscione «Quando i dinosauri dominavano la Terra»
// che si stacca e cade; dalle vetrate l'alba, l'elicottero che parte e gli uccelli sul mare.
// Gli scheletri sono oggetti da museo (impalcature di ossa), non dinosauri vivi.
// Piani: alba oltre le vetrate (0,2) · elicottero e uccelli (0,3) · vetrate (0,45) · scheletri (0,65) · striscione (0,85) · ossa a terra (1,2) · polvere (1,6)

const r = rng(65);
const DEBRIS = Array.from({ length: 16 }, () => ({ x: r() * 900 + 90, v: 200 + r() * 300, ph: r(), s: 4 + r() * 8 }));

/** Scheletro da museo: colonna di vertebre, costole e cranio, montato su supporti di metallo. */
const Skeleton: React.FC<{ x: number; y: number; s: number; flip?: boolean; shake?: number }> = ({ x, y, s, flip, shake = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${shake}) scale(${flip ? -s : s} ${s})`} stroke="#E9E0C8" strokeLinecap="round" fill="none">
    <path d="M-60 120 V300 M80 120 V300" stroke="#5A5E58" strokeWidth="8" />
    <path d="M-240 40 Q-120 -40 40 20 Q160 60 260 -80" strokeWidth="14" />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-150 + i * 34} ${-6 + Math.sin(i * 0.5) * 8} q-6 60 10 110`} strokeWidth="8" />)}
    <path d="M-240 40 Q-330 60 -400 140" strokeWidth="10" />
    <path d="M260 -80 l40 -30 h70 q30 10 10 40 l-60 10 l40 20 l-70 10 Z" strokeWidth="9" fill="#E9E0C8" fillOpacity=".2" />
    <path d="M-40 60 L-60 160 L-30 250 M60 70 L80 160 L50 250" strokeWidth="10" />
  </g>
);

export const Fuga: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const shake = t > cues[1] && t < cues[2] + 1 ? Math.sin(t * 30) * 2 * (1 - seg(t, cues[2], cues[2] + 1)) : 0; // la lotta fa tremare l'atrio
  const fall = eio(seg(t, cues[2], cues[2] + 1.2)); // «crolla lo striscione»
  const heli = eio(seg(t, cues[3], dur)); // l'elicottero parte
  const dawn = eo(seg(t, cues[3], dur));
  const birds = seg(t, cues[5], cues[5] + 1);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fg" />
        <Lin id="fg-sky" stops={[[0, '#2A3A5A'], [0.4, '#C47A6A'], [0.6, '#F6C88A']]} />
        <Lin id="fg-hall" stops={[[0, '#1E2620'], [0.5, '#2E3A30'], [1, '#141A16']]} />
        <Lin id="fg-floor" stops={[[0, '#6A5E48'], [1, '#2A2418']]} />
        <Lin id="fg-banner" stops={[[0, '#F4EBD0'], [1, '#D8C9A0']]} />
      </defs>
      <g transform={`${cam.transform} translate(${shake * 3} ${shake})`}>
        {/* alba oltre le vetrate, elicottero e uccelli */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#fg-sky)" />
          <Glow id="fg-sun" x={540} y={1020} r={420} t={t} color="#FFE6B0" amp={0.04} rate={1} opacity={0.4 + 0.4 * dawn} />
          <rect x="-200" y="1000" width="1480" height="200" fill="#3E6A7A" opacity=".8" />
        </g>
        <g transform={L(0.3)}>
          <Helicopter x={300 + 500 * heli} y={1000 - 360 * heli} s={0.45 - 0.2 * heli} t={t} tilt={-8 * heli} />
          <g opacity={birds}><Gulls t={t} y={880} h={140} color="#2A2A2A" n={5} size={1.2} period={10} /></g>
        </g>
        {/* vetrate dell'atrio */}
        <g transform={L(0.45)}>
          <path d="M-200 -200 H1280 V1130 H1100 V560 H-20 V1130 H-200 Z" fill="url(#fg-hall)" />
          {[-20, 210, 440, 670, 900, 1100].map((x) => <path key={x} d={`M${x} 560 V1080`} stroke="#0E140F" strokeWidth="16" />)}
          <path d="M-20 820 H1100" stroke="#0E140F" strokeWidth="12" />
          <Beam id="fg-dawn" x={540} y={760} t={t} length={1200} spread={700} color="#FFE6B0" angle={100} opacity={0.12 + 0.15 * dawn} />
          <path d="M-200 1080 H1280 V1130 H-200 Z" fill="#141A16" />
        </g>
        {/* pavimento con ossa cadute e calcinacci */}
        <g transform={L(1.2)}>
          <path d="M-200 1130 H1280 V2200 H-200 Z" fill="url(#fg-floor)" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${-200 + i * 260} 1130 L${-500 + i * 360} 1920`} stroke="#4A4030" strokeWidth="5" />)}
          {[[200, 1600, -20], [760, 1700, 30], [480, 1820, 10]].map(([x, y, a], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${a})`} stroke="#E9E0C8" strokeWidth="14" strokeLinecap="round">
              <path d="M-70 0 H70" /><circle cx="-76" cy="-8" r="12" fill="#E9E0C8" /><circle cx="76" cy="8" r="12" fill="#E9E0C8" />
            </g>
          ))}
        </g>
        {/* scheletri da museo */}
        <g transform={L(0.65)}>
          <Skeleton x={300} y={920} s={0.9} shake={shake} />
          <Skeleton x={820} y={980} s={0.7} flip shake={-shake} />
        </g>
        {/* lo striscione che si stacca e cade (accento sul bordo) */}
        <g transform={L(0.85)}>
          <path d="M120 600 V560 M960 600 V560" stroke={K} strokeWidth="6" />
          <g transform={`translate(0 ${400 * fall}) rotate(${fall * 8} 540 640)`} opacity={1 - seg(fall, 0.9, 1) * 0.3}>
            <path d={`M100 600 H980 V${700 + 20 * fall} Q540 ${720 + 40 * fall} 100 ${700 + 20 * fall} Z`} fill="url(#fg-banner)" stroke={K} strokeWidth="7" />
            <path d="M100 612 H980" stroke={P.accento} strokeWidth="10" />
            <text x="540" y="672" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="34" fill={K} letterSpacing="1">QUANDO I DINOSAURI DOMINAVANO LA TERRA</text>
          </g>
        </g>
        <g transform={L(1.6)}>
          {fall > 0 && fall < 1 && DEBRIS.map((d, i) => {
            const p = mod(seg(t, cues[2], cues[2] + 1.6) + d.ph * 0.2, 1);
            return <rect key={i} x={d.x} y={560 + d.v * p * 2} width={d.s} height={d.s} fill="#C9BFA4" opacity={1 - p} />;
          })}
          <Dust t={t} top={{ y: 560, x0: 300, x1: 780 }} bottom={{ y: 1300, x0: 100, x1: 980 }} seed={14} n={24} color="#FFE6B0" boost={fall} />
          <NearMotes id="fg-near" t={t} color="#FFE6B0" n={6} y0={1300} opacity={0.1} />
        </g>
      </g>
      <Finish id="fg" tint="#1E4A30" tintOpacity={0.1} />
    </svg>
  );
};
