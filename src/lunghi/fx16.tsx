import React from 'react';
import { mod, rng } from '../lib/anim';

// Finiture per il 16:9 (QUALITA.md §3 e §6), come Finish di src/lib/fx.tsx ma a tutto 1920×1080.
// Le definizioni (grana e vignettatura) restano quelle di FxDefs: <defs><FxDefs id="xx" /></defs>.

export const W = 1920;
export const H = 1080;

export const Finish16: React.FC<{ id: string; tint: string; tintOpacity?: number }> = ({ id, tint, tintOpacity = 0.12 }) => (
  <>
    <rect width={W} height={H} fill={tint} opacity={tintOpacity} />
    <rect width={W} height={H} fill={`url(#${id}-vig)`} />
    <rect width={W} height={H} fill={`url(#${id}-grain)`} opacity=".5" />
  </>
);

const r = rng(2026);
const MOTES = Array.from({ length: 34 }, () => ({ x: r() * W, y: r() * H, s: 1.5 + r() * 2.8, v: 5 + r() * 12, ph: r() * 6 }));
/** Pulviscolo chiaro che sale lento, su tutto il fotogramma. */
export const Motes16: React.FC<{ T: number; color: string; k?: number }> = ({ T, color, k = 1 }) => (
  <g>
    {MOTES.map((m, i) => (
      <circle key={i} cx={mod(m.x + Math.sin(T * 0.5 + m.ph) * 30, W)} cy={mod(m.y - T * m.v, H)} r={m.s} fill={color} opacity={(0.12 + 0.08 * Math.sin(T * 2 + m.ph)) * k} />
    ))}
  </g>
);

/** Ombra in alto a sinistra dietro etichetta e titolo, così restano leggibili sopra lo schema. */
export const TopShade: React.FC<{ id: string; color?: string; h?: number }> = ({ id, color = '#0C110F', h = 250 }) => (
  <>
    <defs>
      <linearGradient id={`${id}-sh`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={color} stopOpacity=".95" />
        <stop offset=".72" stopColor={color} stopOpacity=".86" />
        <stop offset="1" stopColor={color} stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect width={W} height={h} fill={`url(#${id}-sh)`} />
  </>
);
