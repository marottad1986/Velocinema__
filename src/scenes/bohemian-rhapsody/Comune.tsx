import React from 'react';
import { Glow } from '../../lib/elements';

// Elementi comuni di Bohemian Rhapsody: colori, pianoforte verticale, pianoforte a coda, gong.
// L'oro (#E9B949) solo sugli oggetti chiave del capitolo.

export const K = '#140A12';
export const GOLD = '#E9B949';
export const TINT = '#3A1028';

/** Pianoforte verticale visto di fronte; (x, y) = centro della base. `lit` 0–1 illumina tastiera e leggio. */
export const Upright: React.FC<{ id: string; x: number; y: number; s?: number; t: number; lit?: number; body?: string }> = ({ id, x, y, s = 1, t, lit = 0, body = '#3A1A22' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <defs>
      <linearGradient id={`${id}-b`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={body} />
        <stop offset=".55" stopColor="#5A2A34" />
        <stop offset="1" stopColor="#24101A" />
      </linearGradient>
    </defs>
    <rect x="-250" y="-420" width="500" height="420" rx="10" fill={`url(#${id}-b)`} stroke={K} strokeWidth="9" />
    <rect x="-270" y="-436" width="540" height="30" rx="6" fill="#2A1218" stroke={K} strokeWidth="8" />
    <path d="M-240 -428 H240" stroke="#B87A8A" strokeWidth="3" opacity=".5" />
    {/* pannello con intarsio */}
    <rect x="-200" y="-380" width="400" height="150" rx="12" fill="none" stroke="#5A2A34" strokeWidth="6" />
    <path d="M-150 -305 Q0 -360 150 -305" fill="none" stroke="#7A3A46" strokeWidth="5" />
    {/* tastiera */}
    <rect x="-262" y="-232" width="524" height="52" rx="4" fill="#2A1218" stroke={K} strokeWidth="7" />
    <rect x="-244" y="-224" width="488" height="36" fill="#F4ECDD" stroke={K} strokeWidth="4" />
    {Array.from({ length: 24 }, (_, i) => <path key={i} d={`M${-244 + (i + 1) * 20.3} -224 V-188`} stroke="#8A7A70" strokeWidth="2" />)}
    {Array.from({ length: 24 }, (_, i) => ([1, 2, 4, 5, 6].includes(i % 7) ? <rect key={i} x={-244 + i * 20.3 - 6} y="-224" width="12" height="20" fill={K} /> : null))}
    <rect x="-244" y="-224" width="488" height="36" fill="#FFF3CF" opacity={lit * 0.35} />
    {/* gambe e pedali */}
    <path d="M-230 -180 V0 M230 -180 V0" stroke={K} strokeWidth="14" />
    <path d="M-230 -180 V0 M230 -180 V0" stroke="#4A1E28" strokeWidth="6" />
    <rect x="-44" y="-26" width="88" height="16" rx="4" fill={GOLD} stroke={K} strokeWidth="4" opacity={0.7 + 0.3 * lit} />
    <path d="M-30 -18 h12 M-6 -18 h12 M18 -18 h12" stroke={K} strokeWidth="4" />
    <Glow id={`${id}-k`} x={0} y={-206} r={300} t={t} color="#FFE7A0" amp={0.05} rate={1.6} opacity={0.25 * lit} />
  </g>
);

/** Pianoforte a coda visto di tre quarti; (x, y) = punto a terra centrale. */
export const Grand: React.FC<{ id: string; x: number; y: number; s?: number; t: number; open?: number; lit?: number }> = ({ id, x, y, s = 1, t, open = 1, lit = 0.5 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <defs>
      <linearGradient id={`${id}-b`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#0E080C" />
        <stop offset=".6" stopColor="#2A1620" />
        <stop offset="1" stopColor="#140A10" />
      </linearGradient>
    </defs>
    <ellipse cx="0" cy="6" rx="330" ry="30" fill="#000" opacity=".4" />
    <path d="M-250 -150 V0 M230 -140 V0 M60 -120 V0" stroke={K} strokeWidth="16" strokeLinecap="round" />
    {/* cassa */}
    <path d="M-290 -230 H120 Q300 -230 320 -170 Q330 -130 260 -120 H-290 Z" fill={`url(#${id}-b)`} stroke={K} strokeWidth="9" strokeLinejoin="round" />
    <path d="M-280 -222 H118 Q290 -222 310 -170" fill="none" stroke="#9A7A8A" strokeWidth="4" opacity=".6" />
    {/* coperchio aperto */}
    <path d={`M-260 -232 L${lerpN(-60, 40, open)} ${lerpN(-240, -470, open)} L300 -236 Z`} fill="#1E1018" stroke={K} strokeWidth="8" strokeLinejoin="round" />
    <path d={`M-240 -240 L${lerpN(-60, 30, open)} ${lerpN(-246, -450, open)}`} stroke="#C8B0C0" strokeWidth="4" opacity=".45" />
    <path d={`M120 -232 L${lerpN(60, 90, open)} ${lerpN(-236, -330, open)}`} stroke={K} strokeWidth="6" />
    {/* tastiera e leggio */}
    <rect x="-300" y="-130" width="300" height="34" rx="4" fill="#F4ECDD" stroke={K} strokeWidth="6" />
    {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${-300 + (i + 1) * 20} -130 V-96`} stroke="#8A7A70" strokeWidth="2" />)}
    <path d="M-250 -232 L-230 -300 H-60 L-70 -232" fill="#F1E6D2" stroke={K} strokeWidth="6" strokeLinejoin="round" />
    <path d="M-220 -284 H-80 M-224 -268 H-84 M-228 -252 H-90" stroke="#6A5A5A" strokeWidth="3" />
    <Glow id={`${id}-g`} x={-140} y={-140} r={260} t={t} color="#FFE7A0" amp={0.05} rate={1.4} opacity={0.35 * lit} />
  </g>
);
const lerpN = (a: number, b: number, p: number) => a + (b - a) * p;

/** Gong dorato su telaio; `hit` = secondi dal colpo (negativo: non ancora colpito). */
export const Gong: React.FC<{ id: string; x: number; y: number; r?: number; t: number; hit?: number; glow?: number }> = ({ id, x, y, r = 170, t, hit = -1, glow = 0.4 }) => {
  const ring = hit >= 0 ? Math.exp(-hit * 0.8) : 0;
  const wob = ring * Math.sin(hit * 30) * 4;
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <radialGradient id={`${id}-d`} cx=".42" cy=".38" r=".7">
          <stop offset="0" stopColor="#FFF0B8" />
          <stop offset=".35" stopColor={GOLD} />
          <stop offset=".8" stopColor="#9A6A1E" />
          <stop offset="1" stopColor="#5A3A10" />
        </radialGradient>
      </defs>
      <Glow id={`${id}-h`} x={0} y={0} r={r * 2.2} t={t} color={GOLD} amp={0.06} rate={1.2} opacity={glow + ring * 0.6} />
      <path d={`M${-r - 50} ${-r - 40} H${r + 50} M${-r - 30} ${-r - 40} V${r + 160} M${r + 30} ${-r - 40} V${r + 160}`} stroke={K} strokeWidth="16" strokeLinecap="round" />
      <path d={`M${-r - 30} ${-r - 40} V${r + 160} M${r + 30} ${-r - 40} V${r + 160}`} stroke="#5A3A22" strokeWidth="6" />
      <path d={`M-40 ${-r - 40} L-30 ${-r} M40 ${-r - 40} L30 ${-r}`} stroke={K} strokeWidth="6" />
      <g transform={`translate(${wob} 0) scale(${1 + ring * 0.015})`}>
        <circle r={r} fill={`url(#${id}-d)`} stroke={K} strokeWidth="9" />
        <circle r={r * 0.78} fill="none" stroke="#7A4A14" strokeWidth="5" opacity=".6" />
        <circle r={r * 0.3} fill="none" stroke="#7A4A14" strokeWidth="5" opacity=".5" />
        <path d={`M${-r * 0.6} ${-r * 0.5} A${r * 0.8} ${r * 0.8} 0 0 1 ${r * 0.2} ${-r * 0.75}`} stroke="#FFF7DA" strokeWidth="7" fill="none" strokeLinecap="round" opacity=".6" />
      </g>
      {/* anelli del suono */}
      {hit >= 0 && [0, 0.35, 0.7].map((d, i) => {
        const p = Math.max(0, hit - d);
        return <circle key={i} r={r + p * 150} fill="none" stroke={GOLD} strokeWidth={6 - i} opacity={Math.max(0, 0.7 - p * 0.6) * (hit > d ? 1 : 0)} />;
      })}
    </g>
  );
};
