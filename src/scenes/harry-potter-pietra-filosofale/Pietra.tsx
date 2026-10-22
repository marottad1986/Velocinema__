import React from 'react';
import { camera, eio, eo, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Embers, Fire, Glow, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K, MirrorFrame } from './Comuni';

// La pietra filosofale: sala sotterranea con fiamme di fuoco magico all'ingresso; lo specchio d'oro al centro; la pietra
// rossa che compare e brilla; una luce bianca che respinge il buio (l'amore della madre); alla fine la pietra si sbriciola.
// Piani: parete e colonne (0,25) · specchio (0,55) · pietra (0,7) · fiamme magiche ai lati (1,0) · pavimento (1,1) · polvere luminosa (1,6)

const r = rng(77);
const DUST = Array.from({ length: 30 }, () => ({ a: r() * Math.PI * 2, v: 60 + r() * 260, s: 2 + r() * 5 }));

export const Pietra: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const shadow = seg(t, 0.2, cues[1]) * (1 - eio(seg(t, cues[3], cues[3] + 1))); // il buio di Raptor e Voldemort
  const stone = eo(seg(t, cues[1] + 0.6, cues[1] + 1.4)); // la pietra compare
  const love = eio(seg(t, cues[3], cues[3] + 1)); // la luce che lo protegge
  const crumble = seg(t, cues[4], cues[4] + 1.4); // «la pietra viene distrutta»
  const sx = 540, sy = 1090;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pt" />
        <Lin id="pt-wall" stops={[[0, '#0E0A1A'], [0.5, '#1E1830'], [1, '#0A0812']]} />
        <Lin id="pt-col" x2={1} y2={0} stops={[[0, '#2A2436'], [0.5, '#4A4256'], [1, '#221E2E']]} />
        <Lin id="pt-floor" stops={[[0, '#2A2232'], [1, '#0A0810']]} />
        <radialGradient id="pt-stone" cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="#FF9A8A" />
          <stop offset=".5" stopColor="#D0202A" />
          <stop offset="1" stopColor="#6A0A14" />
        </radialGradient>
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#pt-wall)" />
          {[60, 1020].map((x) => (
            <g key={x}>
              <rect x={x - 70} y="520" width="140" height="760" fill="url(#pt-col)" stroke={K} strokeWidth="8" />
              <rect x={x - 90} y="500" width="180" height="40" fill="url(#pt-col)" stroke={K} strokeWidth="7" />
            </g>
          ))}
          <path d="M140 540 Q540 400 940 540" fill="none" stroke="#2A2436" strokeWidth="20" />
        </g>
        {/* lo specchio d'oro e la luce che vince il buio */}
        <g transform={L(0.55, 0, 90)}>
          <rect x="400" y="640" width="280" height="420" fill="#1A1630" />
          <rect x="400" y="640" width="280" height="420" fill="#F2B860" opacity={0.25 * stone + 0.35 * love} />
          <MirrorFrame x={540} y={850} w={280} h={420} gold={P.accento} />
          <Glow id="pt-dark" x={540} y={850} r={700} t={t} color="#05030A" amp={0.08} rate={2} opacity={0.6 * shadow} />
          <Glow id="pt-love" x={540} y={950} r={700} t={t} color="#FFF4D8" amp={0.05} rate={1.5} opacity={0.55 * love * (1 - crumble * 0.5)} />
        </g>
        {/* la pietra rossa che brilla, poi si sbriciola */}
        <g transform={L(0.7)}>
          {stone > 0 && crumble < 1 && (
            <g transform={`translate(${sx} ${sy + Math.sin(t * 2) * 8}) scale(${stone * (1 - crumble)})`}>
              <Glow id="pt-stoneg" x={0} y={0} r={200} t={t} color="#FF5A5A" amp={0.15} rate={3} opacity={0.7} />
              <path d="M0 -70 L50 -30 L46 40 L0 70 L-46 40 L-50 -30 Z" fill="url(#pt-stone)" stroke={K} strokeWidth="7" />
              <path d="M0 -70 L0 70 M-50 -30 L50 -30 M-46 40 L46 40" stroke="#8A1018" strokeWidth="3" opacity=".6" />
              <path d="M-26 -40 L-6 -54" stroke="#FFE0D8" strokeWidth="6" strokeLinecap="round" />
            </g>
          )}
          {crumble > 0 && DUST.map((d, i) => (
            <circle key={i} cx={sx + Math.cos(d.a) * d.v * crumble} cy={sy + Math.sin(d.a) * d.v * crumble - 120 * crumble} r={d.s} fill={i % 3 ? '#FF8A7A' : '#FFE8B8'} opacity={1 - crumble} />
          ))}
        </g>
        {/* fiamme magiche viola all'ingresso, ai lati */}
        <g transform={L(1.0)}>
          {[-20, 1100].map((x, i) => (
            <g key={x}>
              <Glow id={`pt-fl${i}`} x={x} y={1200} r={360} t={t} color="#B080FF" amp={0.15} rate={7 + i} opacity={0.5} />
              <Fire id={`pt-fire${i}`} t={t + i} x={x} y={1320} scale={1.6} outer="#5A30C0" mid="#9A70FF" core="#E8D8FF" outline={K} />
              <Embers t={t} x={x} y={1200} w={120} h={600} seed={10 + i} n={18} hot="#E8D8FF" warm="#9A70FF" drift={80} />
            </g>
          ))}
        </g>
        <g transform={L(1.1)}>
          <path d="M-200 1300 H1280 V2200 H-200 Z" fill="url(#pt-floor)" />
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${-200 + i * 240} 1300 L${-500 + i * 330} 1940`} stroke="#3A3044" strokeWidth="5" />)}
        </g>
        <g transform={L(1.6)}><NearMotes id="pt-near" t={t} color="#E8D8FF" n={6} y0={1300} opacity={0.09} /></g>
      </g>
      <Finish id="pt" tint="#1E1A3A" tintOpacity={0.12} />
    </svg>
  );
};
