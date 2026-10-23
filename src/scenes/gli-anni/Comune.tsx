import React from 'react';
import { Glow } from '../../lib/elements';

// Elementi comuni di «Gli anni» (883): colori, motorino, mangianastri, jukebox, casco.
// L'arancione (#F2A23A) solo sugli oggetti chiave del capitolo.

export const K = '#16131F';
export const ORANGE = '#F2A23A';
/** Velature (QUALITA §6): tramonto caldo di provincia e sera blu. */
export const TINT_DAY = '#E8913A';
export const TINT_NIGHT = '#1E2448';

/** Motorino anni '80 visto di lato, muso a destra; (x, y) = punto a terra tra le ruote. `light` 0–1 accende il faro. */
export const Motorino: React.FC<{ id: string; x: number; y: number; s?: number; t: number; light?: number; color?: string; helmet?: boolean; flip?: boolean }> = ({
  id, x, y, s = 1, t, light = 0, color = '#2F6EA6', helmet = true, flip = false,
}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <defs>
      <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity=".35" />
        <stop offset=".4" stopColor={color} stopOpacity="0" />
        <stop offset="1" stopColor="#000000" stopOpacity=".35" />
      </linearGradient>
    </defs>
    <ellipse cx="0" cy="4" rx="190" ry="16" fill="#000" opacity=".35" />
    {/* ruote */}
    {[-125, 130].map((wx) => (
      <g key={wx}>
        <circle cx={wx} cy={-44} r="44" fill="#1E1A24" stroke={K} strokeWidth="8" />
        <circle cx={wx} cy={-44} r="20" fill="#B8B4BC" stroke={K} strokeWidth="5" />
        <circle cx={wx} cy={-44} r="6" fill={K} />
      </g>
    ))}
    {/* forcella e manubrio */}
    <path d="M130 -44 L104 -170 L96 -206" stroke={K} strokeWidth="12" strokeLinecap="round" fill="none" />
    <path d="M62 -214 H128" stroke={K} strokeWidth="10" strokeLinecap="round" />
    <circle cx="66" cy="-214" r="9" fill="#2A2630" stroke={K} strokeWidth="4" />
    {/* scudo anteriore */}
    <path d="M70 -60 Q60 -150 92 -196 L114 -190 Q96 -130 112 -60 Z" fill={color} stroke={K} strokeWidth="8" strokeLinejoin="round" />
    {/* pedana e scocca posteriore */}
    <path d="M-60 -60 H80 L84 -80 H-40 Z" fill="#2A2630" stroke={K} strokeWidth="7" strokeLinejoin="round" />
    <path d="M-185 -70 Q-200 -150 -110 -158 H-30 Q-10 -150 -20 -96 L-40 -60 H-170 Q-186 -62 -185 -70 Z" fill={color} stroke={K} strokeWidth="9" strokeLinejoin="round" />
    <path d="M-185 -70 Q-200 -150 -110 -158 H-30 Q-10 -150 -20 -96 L-40 -60 H-170 Q-186 -62 -185 -70 Z" fill={`url(#${id}-b)`} />
    <path d="M-170 -128 Q-150 -150 -100 -150" stroke="#FFFFFF" strokeWidth="5" fill="none" opacity=".5" strokeLinecap="round" />
    {/* sellino */}
    <path d="M-150 -160 Q-150 -182 -110 -184 H-40 Q-20 -182 -22 -160 Z" fill="#2A1E1A" stroke={K} strokeWidth="7" strokeLinejoin="round" />
    {/* fanalino posteriore e faro */}
    <rect x="-196" y="-120" width="14" height="22" rx="4" fill="#E0303A" stroke={K} strokeWidth="4" />
    <Glow id={`${id}-f`} x={122} y={-178} r={130} t={t} color="#FFE7A0" amp={0.05} rate={2} opacity={0.75 * light} />
    <ellipse cx="116" cy="-178" rx="14" ry="18" fill={light > 0.3 ? '#FFF3CF' : '#C8C0A8'} stroke={K} strokeWidth="5" />
    {helmet && (
      <g transform="translate(-92 -200)">
        <path d="M-46 14 Q-50 -40 0 -44 Q48 -42 46 14 Z" fill="#E8E4DC" stroke={K} strokeWidth="7" strokeLinejoin="round" />
        <path d="M-10 -6 Q20 -14 44 -2 V12 H-6 Z" fill="#3A3448" stroke={K} strokeWidth="5" />
        <path d="M-36 -18 Q-20 -36 6 -38" stroke="#FFFFFF" strokeWidth="5" fill="none" opacity=".7" strokeLinecap="round" />
        <path d="M-46 4 H46" stroke={ORANGE} strokeWidth="6" />
      </g>
    )}
  </g>
);

/** Mangianastri portatile; `play` 0–1 accende la spia e fa girare le bobine. */
export const Mangianastri: React.FC<{ x: number; y: number; s?: number; t: number; play?: number; rot?: number }> = ({ x, y, s = 1, t, play = 0, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <rect x="-130" y="-84" width="260" height="120" rx="14" fill="#3A3644" stroke={K} strokeWidth="8" />
    <path d="M-90 -84 Q0 -130 90 -84" fill="none" stroke={K} strokeWidth="9" />
    {[-1, 1].map((k) => (
      <g key={k}>
        <circle cx={k * 88} cy={-18} r="34" fill="#1E1A24" stroke={K} strokeWidth="5" />
        {[0, 1, 2, 3].map((i) => <circle key={i} cx={k * 88 + Math.cos(i * 1.57) * 18} cy={-18 + Math.sin(i * 1.57) * 18} r="4" fill="#5A5664" />)}
      </g>
    ))}
    <rect x="-46" y="-50" width="92" height="56" rx="6" fill="#C8C4CE" stroke={K} strokeWidth="5" />
    {[-1, 1].map((k) => (
      <g key={k} transform={`translate(${k * 22} -22) rotate(${t * 120 * play})`}>
        <circle r="12" fill="#F4ECDD" stroke={K} strokeWidth="3" />
        <path d="M0 -8 V8 M-8 0 H8" stroke={K} strokeWidth="3" />
      </g>
    ))}
    {[0, 1, 2, 3].map((i) => <rect key={i} x={-60 + i * 32} y="14" width="24" height="14" rx="3" fill="#8A8692" stroke={K} strokeWidth="3" />)}
    <circle cx="104" cy="-62" r="7" fill={play > 0.5 ? '#FF4A3A' : '#5A2A2A'} />
  </g>
);

/** Jukebox con arco luminoso; `on` 0–1. */
export const Jukebox: React.FC<{ id: string; x: number; y: number; s?: number; t: number; on?: number }> = ({ id, x, y, s = 1, t, on = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Glow id={`${id}-g`} x={0} y={-200} r={260} t={t} color={ORANGE} amp={0.06} rate={1.6} opacity={0.45 * on} />
    <path d="M-110 0 V-250 Q-110 -360 0 -360 Q110 -360 110 -250 V0 Z" fill="#6A2A1E" stroke={K} strokeWidth="9" strokeLinejoin="round" />
    <path d="M-86 -250 Q-86 -334 0 -334 Q86 -334 86 -250" fill="none" stroke={ORANGE} strokeWidth="14" opacity={0.4 + 0.6 * on} />
    <path d="M-86 -250 Q-86 -334 0 -334 Q86 -334 86 -250" fill="none" stroke="#FFE7A0" strokeWidth="4" opacity={on} />
    <rect x="-70" y="-240" width="140" height="90" rx="8" fill="#2A2230" stroke={K} strokeWidth="6" />
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M-56 ${-226 + i * 13} H${30 - (i % 3) * 14}`} stroke="#F4ECDD" strokeWidth="4" opacity=".7" />)}
    {Array.from({ length: 5 }, (_, i) => (
      <rect key={i} x={-70 + i * 30} y="-130" width="20" height="90" rx="6" fill={['#E0303A', ORANGE, '#4AA8FF', '#7AD06A', '#E0303A'][i]} opacity={0.35 + 0.65 * on * (0.6 + 0.4 * Math.sin(t * 3 + i))} />
    ))}
    <rect x="-90" y="-30" width="180" height="22" rx="4" fill="#3A1A12" stroke={K} strokeWidth="5" />
  </g>
);
