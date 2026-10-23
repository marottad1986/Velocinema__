import React from 'react';
import { camera, eio, eo, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Embers, Fire, Glow, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K, MirrorFrame, mirrorPath } from './Comuni';

// La pietra filosofale: sala sotterranea con fiamme di fuoco magico all'ingresso; lo specchio d'oro al centro; la pietra
// rossa che compare e brilla; una luce bianca che respinge il buio (l'amore della madre); alla fine la pietra si sbriciola.
// Piani: parete e colonne (0,25) · specchio (0,55) · pietra (0,7) · fiamme magiche ai lati (1,0) · pavimento (1,1) · polvere luminosa (1,6)

const r = rng(77);
const DUST = Array.from({ length: 80 }, () => ({ a: r() * Math.PI * 2, v: 60 + r() * 340, s: 6 + r() * 10, up: 80 + r() * 260, ph: r() * 6 }));
/** Specchio (nel piano 0,55, che è spostato di 90 px in basso): sotto il titolo. */
const MX = 540, MY = 900, MW = 270, MH = 380;

export const Pietra: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const shadow = seg(t, 0.2, cues[1]) * (1 - eio(seg(t, cues[3], cues[3] + 1))); // il buio di Raptor e Voldemort
  const stone = eo(seg(t, cues[1] + 0.6, cues[1] + 1.4)); // la pietra compare
  const love = eio(seg(t, cues[3], cues[3] + 1)); // la luce che lo protegge
  const crumble = seg(t, cues[4], cues[4] + 1.4); // «la pietra viene distrutta»: la pietra rimpicciolisce…
  const cloud = seg(t, cues[4] + 0.2, dur); // …e diventa una nube di polvere dorata e rossa che sale e resta
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
          <g transform={`translate(${MX} ${MY})`}>
            <path d={mirrorPath(MW, MH)} fill="#2A2440" />
            <path d={mirrorPath(MW, MH)} fill="#F2B860" opacity={0.25 * stone + 0.35 * love} />
            <path d={`M${-MW / 2 + 6} ${-MH / 2 + 30} L${-MW / 2 + 70} ${-MH / 2 + 10} L${-MW / 2 + 24} ${-MH / 2 + 150} Z`} fill="#FFFFFF" opacity={0.12} />
          </g>
          <MirrorFrame x={MX} y={MY} w={MW} h={MH} gold={P.accento} />
          <Glow id="pt-dark" x={MX} y={MY} r={700} t={t} color="#05030A" amp={0.08} rate={2} opacity={0.6 * shadow} />
          <Glow id="pt-love" x={MX} y={MY + 60} r={760} t={t} color="#FFF4D8" amp={0.05} rate={1.5} opacity={0.6 * love * (1 - cloud * 0.4)} />
          {/* l'onda di luce calda che parte dallo specchio e respinge il buio */}
          {love > 0 && love < 1 && [0, 1, 2].map((k) => {
            const p = seg(love, k * 0.2, 0.6 + k * 0.2);
            return <ellipse key={k} cx={MX} cy={MY + 60} rx={80 + 620 * p} ry={60 + 460 * p} fill="none" stroke="#FFE8B0" strokeWidth={18 * (1 - p) + 2} opacity={(1 - p) * 0.8} />;
          })}
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
          {cloud > 0 && (
            <>
              <Glow id="pt-cloud" x={sx} y={sy - 160 * cloud} r={340 + 260 * cloud} t={t} color="#FFC060" amp={0.1} rate={2} opacity={0.9 * Math.min(1, cloud * 4)} />
              {DUST.map((d, i) => {
                const e = eo(Math.min(1, cloud * 2.5));
                const x = sx + Math.cos(d.a) * d.v * e + Math.sin(t * 1.3 + d.ph) * 14;
                const y = sy + Math.sin(d.a) * d.v * 0.6 * e - d.up * cloud;
                return <circle key={i} cx={x} cy={y} r={d.s * (1 - 0.3 * cloud)} fill={i % 3 ? '#FF8A6A' : '#FFE8B0'} opacity={(0.7 + 0.3 * Math.sin(t * 4 + d.ph)) * (1 - 0.3 * cloud)} />;
              })}
            </>
          )}
        </g>
        {/* il buio che avanza dai lati (Raptor e Voldemort) e che la luce respinge */}
        <g transform={L(0.8)}>
          {[0, 1].map((i) => {
            const reach = 0.25 + 0.55 * seg(t, 0.2, cues[3]) - 0.8 * love;
            const x = i ? 1080 + 200 - reach * 520 : -200 + reach * 520;
            return [0, 1, 2].map((k) => (
              <Glow key={`${i}${k}`} id={`pt-sh${i}${k}`} x={x + (i ? 1 : -1) * k * 90} y={760 + k * 220 + Math.sin(t + k) * 30} r={300 - k * 30} t={t + k} color="#2A0A44" amp={0.12} rate={1.5} opacity={0.85 * Math.max(0, Math.min(1, reach + 0.2))} />
            ));
          })}
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
          {/* gradini di pietra in primo piano */}
          {[[1640, 0.9], [1760, 1], [1880, 1.1]].map(([y, w], k) => (
            <g key={k}>
              <path d={`M${540 - 700 * (w as number)} ${y} H${540 + 700 * (w as number)} V${(y as number) + 30} H${540 - 700 * (w as number)} Z`} fill="#3A3044" stroke={K} strokeWidth="7" />
              <path d={`M${540 - 700 * (w as number)} ${(y as number) + 30} H${540 + 700 * (w as number)} V${(y as number) + 120} H${540 - 700 * (w as number)} Z`} fill="#221C2C" stroke={K} strokeWidth="7" />
              {[-300, -60, 220, 420].map((x) => <path key={x} d={`M${540 + x + k * 40} ${(y as number) + 30} V${(y as number) + 120}`} stroke="#14101C" strokeWidth="4" />)}
            </g>
          ))}
        </g>
        <g transform={L(1.6)}><NearMotes id="pt-near" t={t} color="#E8D8FF" n={6} y0={1300} opacity={0.09} /></g>
      </g>
      <Finish id="pt" tint="#1E1A3A" tintOpacity={0.12} />
    </svg>
  );
};
