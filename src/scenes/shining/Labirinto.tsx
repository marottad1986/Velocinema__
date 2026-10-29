import React from 'react';
import { camera, mod, rng, seg } from '../../lib/anim';
import { Beam, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Hotel, K, Maze } from './Comuni';

// Il labirinto: notte nella tormenta; in alto l'albergo con l'ingresso spalancato e i fari del mezzo di Hallorann (che si
// spengono quando «Jack lo uccide»); davanti il labirinto di siepi visto dall'alto: le impronte piccole entrano, poi
// tornano indietro sulle stesse orme e scappano di lato, mentre impronte grandi le seguono fino al centro.
// Piani: cielo e tormenta (0,2) · albergo e mezzo per la neve (0,4) · labirinto e impronte (0,65) · siepi in primo piano (1,2) · fiocchi (1,6)

const r = rng(1921);
const NEAR = Array.from({ length: 28 }, () => ({ x: r() * 1400 - 160, y: r() * 2000, s: 7 + r() * 9, v: 380 + r() * 300 }));
// percorso nel labirinto 9×9 (riga, colonna), dall'ingresso in basso al centro
const PATH: [number, number][] = [[8, 4], [7, 4], [7, 5], [6, 5], [5, 5], [5, 6], [5, 7], [4, 7], [3, 7], [2, 7], [1, 7], [1, 6], [1, 5], [2, 5], [3, 5], [3, 4]];
// via di fuga laterale di Danny dopo essere tornato indietro
const ESCAPE: [number, number][] = [[6, 5], [5, 5], [5, 3], [5, 2], [5, 1], [6, 1], [7, 1], [7, 2], [7, 3], [8, 4]];

export const Labirinto: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const lights = 1 - seg(t, cues[2], cues[2] + 0.4); // i fari si spengono: «Jack lo uccide»
  const flash = seg(t, cues[2], cues[2] + 0.1) * (1 - seg(t, cues[2] + 0.1, cues[2] + 0.6));
  const inP = seg(t, cues[3], cues[4]); // le impronte di Danny entrano
  const back = seg(t, cues[4], cues[4] + 1.6); // tornano indietro sulle stesse orme
  const chase = seg(t, cues[4] + 0.6, dur); // le impronte grandi lo seguono fino al centro
  const W = 860, H = 760, X = 540, Y = 1080;
  const cell = (rr: number, c: number) => ({ x: X - W / 2 + (c + 0.5) * (W / 9), y: Y - H / 2 + (rr + 0.5) * (H / 9) });
  const steps = (path: [number, number][], p: number, big: boolean, color: string, key: string) => {
    const n = Math.floor(p * (path.length - 1) * 2);
    return Array.from({ length: n }, (_, i) => {
      const a = cell(...path[Math.floor(i / 2)]), b = cell(...path[Math.min(path.length - 1, Math.floor(i / 2) + 1)]);
      const u = (i % 2) * 0.5;
      const side = i % 2 ? 8 : -8;
      return <ellipse key={`${key}${i}`} cx={a.x + (b.x - a.x) * u + side} cy={a.y + (b.y - a.y) * u} rx={big ? 9 : 6} ry={big ? 14 : 9} fill={color} opacity=".85" />;
    });
  };

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="lb" />
        <Lin id="lb-sky" stops={[[0, '#05070C'], [0.5, '#141C28'], [1, '#2A3444']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#lb-sky)" />
          <rect x="-200" y="-200" width="1480" height="2400" fill={P.accento} opacity={0.25 * flash} />
        </g>
        {/* l'albergo con l'ingresso aperto e i fari del mezzo per la neve */}
        <g transform={L(0.4)}>
          <Hotel x={540} y={700} s={0.55} t={t} lit={0.25} snow={1} />
          <rect x="515" y="676" width="50" height="24" fill="#FFD8A0" opacity={0.8} />
          <Glow id="lb-door" x={540} y={690} r={120} t={t} color="#FFD8A0" amp={0.1} rate={5} opacity={0.5} />
          <g transform="translate(830 700)">
            <rect x="-60" y="-50" width="120" height="44" rx="8" fill="#C84A20" stroke={K} strokeWidth="5" />
            <rect x="-70" y="-10" width="140" height="22" rx="10" fill="#2A2A2A" />
            <Beam id="lb-head" x={-60} y={-30} t={t} length={420} spread={120} color="#FFF4D0" angle={180} opacity={0.45 * lights} />
            <circle cx="-60" cy="-30" r="9" fill={lights > 0.5 ? '#FFF4D0' : '#5A5A50'} />
          </g>
        </g>
        {/* il labirinto con le impronte (accento: quelle grandi di Jack) */}
        <g transform={L(0.65)}>
          <Maze x={X} y={Y} w={W} h={H} snow={1} hedge="#14281E" />
          {steps(PATH, Math.max(0, inP - 0.0) * (1 - 0) , false, '#6A7A8E', 'd')}
          {back > 0 && steps(ESCAPE, back, false, '#6A7A8E', 'e')}
          {chase > 0 && steps(PATH, chase, true, P.accento, 'j')}
          <Glow id="lb-center" x={cell(3, 4).x} y={cell(3, 4).y} r={120} t={t} color={P.accento} amp={0.1} rate={3} opacity={0.3 * chase} />
        </g>
        {/* siepi innevate in primo piano */}
        <g transform={L(1.2)}>
          <path d="M-200 1560 H260 V2200 H-200 Z M820 1580 H1280 V2200 H820 Z" fill="#14281E" stroke={K} strokeWidth="8" />
          <path d="M-200 1560 H260 V1600 H-200 Z M820 1580 H1280 V1620 H820 Z" fill="#F4F6FA" />
        </g>
        <g transform={L(1.6)}>
          {NEAR.map((f, i) => <circle key={i} cx={mod(f.x - t * 320, 1440) - 180} cy={mod(f.y + t * f.v, 2000)} r={f.s} fill="#F4F6FA" opacity=".45" />)}
          <NearMotes id="lb-near" t={t} color="#F4F6FA" n={6} vx={-160} opacity={0.12} />
        </g>
      </g>
      <Finish id="lb" tint="#1A2A3A" tintOpacity={0.13} />
    </svg>
  );
};
