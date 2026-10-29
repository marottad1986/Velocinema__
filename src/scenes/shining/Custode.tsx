import React from 'react';
import { camera, eio, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Clouds, Fog, Glow, Gulls, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Hotel, K } from './Comuni';

// Il custode d'inverno: strada di montagna che sale tra i boschi d'autunno verso l'enorme albergo isolato davanti alle
// vette; una piccola auto gialla sui tornanti; nuvole basse che corrono. Su «impazzì e uccise la famiglia» il cielo si
// incupisce e le finestre si spengono.
// Piani: cielo e vette (0,2) · nuvole (0,3) · albergo (0,45) · boschi e tornanti (0,7) · auto (0,75) · abeti in primo piano (1,25) · foglie (1,6)

const r = rng(1980);
const TREES = Array.from({ length: 26 }, () => ({ x: r() * 1300 - 110, y: 1060 + r() * 220, s: 0.6 + r() * 0.6, c: r() }));
const LEAVES = Array.from({ length: 10 }, () => ({ ph: r(), y: r() * 900 + 500, s: 0.6 + r() * 0.6 }));

const Pine: React.FC<{ x: number; y: number; s: number; c: string }> = ({ x, y, s, c }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 -220 L60 -110 H30 L80 -20 H-80 L-30 -110 H-60 Z" fill={c} />
    <rect x="-8" y="-20" width="16" height="30" fill="#3A2A1E" />
  </g>
);

export const Custode: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const drive = eio(seg(t, 0, dur)); // l'auto sale i tornanti
  const dark = eio(seg(t, cues[3], cues[3] + 1.5)); // «impazzì e uccise la famiglia»
  // percorso dell'auto lungo i tornanti
  const path = (p: number) => {
    const z = p * 3;
    const leg = Math.min(2, Math.floor(z)), u = z - leg;
    const xs = [[120, 900], [900, 260], [260, 620]][leg];
    return { x: xs[0] + (xs[1] - xs[0]) * u, y: 1240 - p * 170, s: 1 - p * 0.45, flip: leg === 1 };
  };
  const car = path(drive);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="cu" />
        <Lin id="cu-sky" stops={[[0, '#2E4460'], [0.35, '#7A90A8'], [0.6, '#DCE2E0']]} />
        <Lin id="cu-dark" stops={[[0, '#14182A'], [0.5, '#3A3E50'], [1, '#6A6A70']]} />
        <Lin id="cu-mount" stops={[[0, '#E8ECF0'], [0.3, '#8A96A4'], [1, '#4A5664']]} />
        <Lin id="cu-hill" stops={[[0, '#7A6A3A'], [1, '#3A3420']]} />
      </defs>
      <g transform={cam.transform}>
        {/* cielo e vette innevate */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#cu-sky)" />
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#cu-dark)" opacity={0.75 * dark} />
          <path d="M-200 960 L40 700 L180 820 L380 600 L560 780 L760 580 L960 760 L1280 640 V1100 H-200 Z" fill="url(#cu-mount)" />
          <path d="M380 600 L420 650 L400 660 L440 700 M760 580 L800 630 L780 640" stroke="#FFFFFF" strokeWidth="8" fill="none" />
        </g>
        <g transform={L(0.3)}>
          <Clouds id="cu-cl" t={t} color={dark > 0.5 ? '#3A3E50' : '#F2F4F4'} seed={8} n={4} y={760} h={160} speed={0.8 + 1.2 * dark} opacity={0.8} />
        </g>
        {/* l'albergo, che si spegne */}
        <g transform={L(0.45)}>
          <Glow id="cu-hg" x={540} y={880} r={360} t={t} color="#FFC870" amp={0.04} rate={1} opacity={0.2 * (1 - dark)} />
          <Hotel x={540} y={980} s={0.55} t={t} lit={0.7 - 0.6 * dark} />
          <Fog id="cu-fog" t={t} y={990} color="#DCE2E8" rx={800} ry={40} opacity={0.4} />
        </g>
        {/* boschi d'autunno e tornanti */}
        <g transform={L(0.7)}>
          <path d="M-200 1000 Q540 960 1280 1010 V2200 H-200 Z" fill="url(#cu-hill)" />
          <path d="M120 1240 L900 1185 L260 1130 L620 1075 L560 1010" fill="none" stroke="#2A2620" strokeWidth="34" strokeLinejoin="round" />
          <path d="M120 1240 L900 1185 L260 1130 L620 1075 L560 1010" fill="none" stroke="#E8D8A0" strokeWidth="3" strokeDasharray="16 18" />
          {TREES.map((tr, i) => <Pine key={i} x={tr.x} y={tr.y} s={tr.s * 0.6} c={tr.c > 0.6 ? '#C8782A' : tr.c > 0.3 ? '#A8522A' : '#2E4A30'} />)}
        </g>
        {/* l'auto gialla (accento sui fari) */}
        <g transform={L(0.75)}>
          <g transform={`translate(${car.x} ${car.y - 18}) scale(${(car.flip ? -1 : 1) * car.s * 0.9} ${car.s * 0.9})`}>
            <path d="M-70 0 V-26 Q-60 -54 -10 -56 Q40 -54 56 -26 L80 -20 V0 Z" fill="#E8C030" stroke={K} strokeWidth="6" />
            <path d="M-46 -30 Q-36 -48 -8 -48 Q24 -48 34 -30 Z" fill="#5A7A8A" stroke={K} strokeWidth="4" />
            <circle cx="-40" cy="2" r="14" fill={K} /><circle cx="50" cy="2" r="14" fill={K} />
            <circle cx="78" cy="-12" r="6" fill={P.accento} opacity={dark} />
          </g>
        </g>
        <g transform={L(0.55)}><Gulls t={t} y={700} h={120} color={K} n={2} period={16} /></g>
        {/* abeti in primo piano */}
        <g transform={L(1.25)}>
          <Pine x={-30} y={1940} s={3.6} c="#1E3424" />
          <Pine x={1120} y={1960} s={4} c="#16281C" />
          <Pine x={180} y={2000} s={2.2} c="#24402A" />
        </g>
        <g transform={L(1.6)}>
          {LEAVES.map((l, i) => {
            const p = mod(t * 0.12 + l.ph, 1);
            return <path key={i} d="M-14 0 Q0 -10 14 0 Q0 10 -14 0 Z" fill={i % 2 ? '#C8782A' : '#A8522A'} transform={`translate(${1200 - p * 1500} ${l.y + Math.sin(p * 8) * 40}) rotate(${p * 600}) scale(${l.s * 1.6})`} />;
          })}
          <NearMotes id="cu-near" t={t} color="#F2F4F4" n={5} y0={1300} opacity={0.08} />
        </g>
      </g>
      <Finish id="cu" tint="#1A2A3A" tintOpacity={0.1} />
    </svg>
  );
};
