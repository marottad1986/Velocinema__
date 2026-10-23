import React from 'react';
import { camera, eob, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Confetti, Glow, NearMotes, ShootingStar, Stars } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { FloatingCandle, K } from './Comuni';

// Il cappello parlante: la grande sala con il soffitto che mostra il cielo stellato, centinaia di candele che fluttuano,
// lunghe tavolate con piatti e calici d'oro; al centro lo sgabello con il vecchio cappello da mago rattoppato che parla;
// stendardi rossi e oro (senza stemmi) che si alzano quando sceglie Grifondoro.
// Piani: soffitto stellato (0,2) · candele lontane (0,35) · finestre e stendardi (0,5) · tavolate (0,75) · sgabello e cappello (0,9) · candele vicine (1,3)

const r = rng(1111);
const FAR = Array.from({ length: 30 }, () => ({ x: r() * 1300 - 110, y: 640 + r() * 300, ph: r() * 6, s: 0.5 + r() * 0.3 }));
const NEAR = Array.from({ length: 8 }, () => ({ x: r() * 1300 - 110, y: 680 + r() * 240, ph: r() * 6, s: 1.2 + r() * 0.5 }));

export const Cappello: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const talk = t > cues[1] && t < cues[3] ? Math.abs(Math.sin(t * 9)) : 0; // il cappello parla
  const pick = eob(seg(t, cues[3], cues[3] + 0.6), 1.8); // «finiscono in Grifondoro»: gli stendardi si alzano
  const party = seg(t, cues[3] + 0.3, cues[3] + 0.6);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="cp" />
        <Lin id="cp-sky" stops={[[0, '#0A0C26'], [0.5, '#1E2250'], [1, '#2E2A5A']]} />
        <Lin id="cp-wall" x2={1} y2={0} stops={[[0, '#2A2230'], [0.5, '#4A3E44'], [1, '#2A2230']]} />
        <Lin id="cp-table" stops={[[0, '#6A4424'], [1, '#2A180C']]} />
        <Lin id="cp-red" stops={[[0, '#9A2430'], [1, P.principale]]} />
      </defs>
      <g transform={cam.transform}>
        {/* soffitto incantato: cielo stellato */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#cp-sky)" />
          <Stars t={t} seed={7} n={50} y={-100} h={1000} />
          <ShootingStar id="cp-ss" t={t} at={cues[2] + 0.5} from={{ x: 900, y: 300 }} to={{ x: 500, y: 560 }} />
        </g>
        <g transform={L(0.35)}>{FAR.map((c, i) => <FloatingCandle key={i} x={c.x} y={c.y} s={c.s} t={t} ph={c.ph} />)}</g>
        {/* pareti con finestre gotiche e stendardi */}
        <g transform={L(0.5)}>
          <path d="M-200 960 H1280 V1240 H-200 Z" fill="url(#cp-wall)" />
          {[-40, 260, 560, 860].map((x) => <path key={x} d={`M${x} 1200 V1020 Q${x + 60} 960 ${x + 120} 1020 V1200 Z`} fill="#3A4A7A" stroke={K} strokeWidth="6" opacity=".9" />)}
          {[120, 420, 720, 1020].map((x, i) => (
            <g key={x} transform={`translate(${x} 960)`}>
              <path d={`M-50 0 H50 V${150 + 40 * (i % 2 ? 0 : pick)} L0 ${120 + 40 * (i % 2 ? 0 : pick)} L-50 ${150 + 40 * (i % 2 ? 0 : pick)} Z`} fill={i % 2 ? '#2A4A7A' : 'url(#cp-red)'} stroke={K} strokeWidth="5" />
              <path d="M-50 24 H50" stroke={i % 2 ? '#B8C4D8' : P.accento} strokeWidth="6" />
            </g>
          ))}
        </g>
        {/* tavolate con piatti e calici d'oro */}
        <g transform={L(0.75)}>
          <path d="M-200 1240 H1280 V2200 H-200 Z" fill="#2A2018" />
          {[[-160, 1240, 360, -12], [800, 1240, 520, 12]].map(([x, y, w, a], i) => (
            <g key={i} transform={`rotate(${a} ${x + w / 2} ${y})`}>
              <rect x={x} y={y} width={w} height="60" fill="url(#cp-table)" stroke={K} strokeWidth="7" />
              {Array.from({ length: 5 }, (_, k) => (
                <g key={k}>
                  <ellipse cx={x + 40 + k * (w / 5)} cy={y + 10} rx="26" ry="8" fill="#E8E2D0" stroke={K} strokeWidth="3" />
                  <path d={`M${x + 70 + k * (w / 5)} ${y + 6} v-30 h-14 l-6 -20 h40 l-6 20 h-14`} fill={P.accento} stroke={K} strokeWidth="3" />
                </g>
              ))}
            </g>
          ))}
        </g>
        {/* sgabello e cappello parlante */}
        <g transform={L(0.9)}>
          <Glow id="cp-hatg" x={540} y={1080} r={300} t={t} color="#FFD27A" amp={0.06} rate={1.4} opacity={0.4} />
          <path d="M470 1260 L490 1140 H590 L610 1260 M480 1220 H600" stroke={K} strokeWidth="14" fill="none" />
          <ellipse cx="540" cy="1140" rx="90" ry="22" fill="#6A4424" stroke={K} strokeWidth="7" />
          <g transform={`translate(540 1130) rotate(${Math.sin(t * 1.3) * 3 + talk * 3})`}>
            <path d="M-120 0 Q0 -30 120 0 Q90 20 0 20 Q-90 20 -120 0 Z" fill="#6A5238" stroke={K} strokeWidth="7" />
            <path d="M-70 -6 Q-60 -120 -10 -180 Q30 -230 70 -260 Q40 -200 50 -150 Q70 -80 70 -6 Z" fill="#7A6044" stroke={K} strokeWidth="7" />
            <path d="M-50 -90 Q-10 -110 40 -90" stroke="#4A3626" strokeWidth="6" fill="none" />
            <path d={`M-40 -50 Q0 ${-40 + 30 * talk} 40 -50`} stroke={K} strokeWidth="7" fill={talk > 0.2 ? '#2A1A10' : 'none'} />
            <rect x="0" y="-150" width="30" height="24" fill="#8A7050" stroke={K} strokeWidth="3" transform="rotate(-12)" />
            <path d="M-60 -10 Q-40 -100 0 -170" stroke="#A88A64" strokeWidth="5" fill="none" opacity=".7" />
          </g>
        </g>
        {/* tavolata in primo piano lungo il bordo basso, con piatti e calici */}
        <g transform={L(1.15)}>
          <rect x="-200" y="1640" width="1480" height="80" fill="url(#cp-table)" stroke={K} strokeWidth="9" />
          <rect x="-200" y="1720" width="1480" height="260" fill="#3A2A1C" stroke={K} strokeWidth="9" />
          {Array.from({ length: 6 }, (_, k) => (
            <g key={k}>
              <ellipse cx={20 + k * 210} cy="1652" rx="70" ry="20" fill="#E8E2D0" stroke={K} strokeWidth="5" />
              <path d={`M${110 + k * 210} 1650 v-56 h-24 l-10 -40 h68 l-10 40 h-24`} fill={P.accento} stroke={K} strokeWidth="5" />
            </g>
          ))}
        </g>
        <g transform={L(1.3)}>{NEAR.map((c, i) => <FloatingCandle key={i} x={c.x} y={c.y} s={c.s} t={t} ph={c.ph} />)}</g>
        <g transform={L(1.6)}>
          {party > 0 && <Confetti t={t - cues[3]} seed={4} n={80} colors={[P.accento, '#C02A30', '#F4E8C8', '#E8B04A']} speed={0.35} />}
          <NearMotes id="cp-near" t={t} color="#FFD27A" n={6} y0={1300} opacity={0.08} />
        </g>
      </g>
      <Finish id="cp" tint="#1E1A3A" tintOpacity={0.1} />
    </svg>
  );
};
