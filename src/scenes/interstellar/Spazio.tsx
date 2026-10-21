import React from 'react';
import { mod, rng } from '../../lib/anim';

// Elementi ricorrenti di Interstellar: buco nero con disco dorato, astronave ad anello, Saturno, file di mais.
// Funzioni pure di t; ogni elemento con gradienti riceve un id unico nella scena.

export const GOLD = '#E8B04A';

/**
 * Buco nero: sfera nera, disco di accrescimento dorato inclinato davanti e dietro, anello di luce deviata sopra e sotto.
 * r = raggio dell'orizzonte; il disco arriva a circa 3,2 r.
 */
export const BlackHole: React.FC<{ id: string; x: number; y: number; r: number; t: number; tilt?: number; glow?: number }> = ({ id, x, y, r, t, tilt = -6, glow = 1 }) => {
  const shimmer = (k: number) => `${(r * 0.9).toFixed(0)} ${(r * 0.35).toFixed(0)}`;
  const flow = -mod(t * r * 0.8, r * 1.25);
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <defs>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0" stopColor="#FFE2A0" stopOpacity={0.55 * glow} />
          <stop offset=".35" stopColor={GOLD} stopOpacity={0.25 * glow} />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-disk`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8A4A18" stopOpacity="0" />
          <stop offset=".18" stopColor="#E8903A" />
          <stop offset=".5" stopColor="#FFF0C8" />
          <stop offset=".82" stopColor="#E8903A" />
          <stop offset="1" stopColor="#8A4A18" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle r={r * 5} fill={`url(#${id}-halo)`} />
      {/* parte posteriore del disco, deviata sopra e sotto la sfera (anello di luce) */}
      <ellipse rx={r * 1.55} ry={r * 1.45} fill="none" stroke={`url(#${id}-disk)`} strokeWidth={r * 0.32} opacity=".9" />
      <ellipse rx={r * 1.55} ry={r * 1.45} fill="none" stroke="#FFF6DC" strokeWidth={r * 0.06} opacity=".8" strokeDasharray={shimmer(0)} strokeDashoffset={flow} />
      {/* disco dietro */}
      <ellipse rx={r * 3.2} ry={r * 0.42} fill="none" stroke={`url(#${id}-disk)`} strokeWidth={r * 0.34} opacity=".75" />
      <circle r={r * 1.02} fill="#020203" />
      <circle r={r * 1.08} fill="none" stroke="#FFE9B8" strokeWidth={r * 0.05} opacity=".85" />
      {/* metà anteriore del disco, davanti alla sfera */}
      <path d={`M${-r * 3.2} 0 A${r * 3.2} ${r * 0.42} 0 0 0 ${r * 3.2} 0`} fill="none" stroke={`url(#${id}-disk)`} strokeWidth={r * 0.36} />
      <path d={`M${-r * 3.2} 0 A${r * 3.2} ${r * 0.42} 0 0 0 ${r * 3.2} 0`} fill="none" stroke="#FFF6DC" strokeWidth={r * 0.07} opacity=".9" strokeDasharray={`${r * 1.4} ${r * 0.5}`} strokeDashoffset={flow * 1.6} />
    </g>
  );
};

/** Astronave ad anello vista di tre quarti: 12 moduli intorno a un mozzo, che ruotano. */
export const Ring: React.FC<{ x: number; y: number; r: number; t: number; spin?: number; tiltY?: number; outline?: string; lit?: string; debris?: number }> = ({
  x, y, r, t, spin = 0.25, tiltY = 0.42, outline = '#0A0F18', lit = '#DCE4EA', debris = 0,
}) => {
  const mods = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2 + t * spin;
    return { a, x: Math.cos(a) * r, y: Math.sin(a) * r * tiltY, front: Math.sin(a) > 0 };
  });
  const mod_ = (m: { x: number; y: number; a: number }, k: number) => (
    <g key={k} transform={`translate(${m.x} ${m.y})`}>
      <rect x={-r * 0.13} y={-r * 0.09} width={r * 0.26} height={r * 0.18} rx={r * 0.03} fill={lit} stroke={outline} strokeWidth={Math.max(3, r * 0.025)} />
      <rect x={-r * 0.06} y={-r * 0.035} width={r * 0.12} height={r * 0.07} fill="#3E6A8A" opacity=".7" />
    </g>
  );
  const r2 = rng(17);
  return (
    <g transform={`translate(${x} ${y})`}>
      {mods.filter((m) => !m.front).map(mod_)}
      <ellipse rx={r} ry={r * tiltY} fill="none" stroke="#8C96A0" strokeWidth={Math.max(3, r * 0.03)} />
      {[0, 1, 2, 3].map((k) => {
        const a = (k / 4) * Math.PI * 2 + t * spin;
        return <path key={k} d={`M0 0 L${Math.cos(a) * r} ${Math.sin(a) * r * tiltY}`} stroke="#8C96A0" strokeWidth={Math.max(2, r * 0.02)} />;
      })}
      <ellipse rx={r * 0.16} ry={r * 0.16 * 0.9} fill={lit} stroke={outline} strokeWidth={Math.max(3, r * 0.03)} />
      <circle r={r * 0.05} fill="#3E6A8A" />
      {mods.filter((m) => m.front).map(mod_)}
      {debris > 0 && Array.from({ length: 10 }, (_, i) => {
        const a = r2() * Math.PI * 2, d = r * (1.1 + r2() * 0.8), s = r * (0.03 + r2() * 0.04);
        const p = mod(t * 0.3 + r2(), 1) * debris;
        return <rect key={`d${i}`} x={Math.cos(a) * d * (1 + p)} y={Math.sin(a) * d * tiltY * (1 + p)} width={s} height={s * 0.7} fill={lit} stroke={outline} strokeWidth="2" transform={`rotate(${t * 200 + i * 40} ${Math.cos(a) * d * (1 + p)} ${Math.sin(a) * d * tiltY * (1 + p)})`} opacity={1 - p * 0.6} />;
      })}
    </g>
  );
};

/** Saturno con anelli inclinati. */
export const Saturn: React.FC<{ id: string; x: number; y: number; r: number; outline?: string }> = ({ id, x, y, r, outline = '#0A0F18' }) => (
  <g transform={`translate(${x} ${y}) rotate(-18)`}>
    <defs>
      <linearGradient id={`${id}-sat`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F2DDB0" />
        <stop offset=".55" stopColor="#C9A46A" />
        <stop offset="1" stopColor="#5A4430" />
      </linearGradient>
    </defs>
    <ellipse rx={r * 2.3} ry={r * 0.5} fill="none" stroke="#B8A27A" strokeWidth={r * 0.28} opacity=".55" />
    <circle r={r} fill={`url(#${id}-sat)`} stroke={outline} strokeWidth={Math.max(3, r * 0.04)} />
    {[-0.5, -0.15, 0.25, 0.55].map((k) => <path key={k} d={`M${-r * Math.sqrt(1 - k * k)} ${k * r} H${r * Math.sqrt(1 - k * k)}`} stroke="#A8865A" strokeWidth={r * 0.06} opacity=".5" />)}
    <path d={`M${-r * 2.3} 0 A${r * 2.3} ${r * 0.5} 0 0 0 ${r * 2.3} 0`} fill="none" stroke="#D8C49A" strokeWidth={r * 0.28} opacity=".85" />
    <path d={`M${-r * 2.3} 0 A${r * 2.3} ${r * 0.5} 0 0 0 ${r * 2.3} 0`} fill="none" stroke={outline} strokeWidth={r * 0.03} opacity=".5" />
  </g>
);

/** Fila di piante di mais che ondeggiano (pannocchie e foglie). `dry` 0..1 le fa seccare. */
export const Corn: React.FC<{ t: number; y: number; n?: number; h?: number; x0?: number; w?: number; seed?: number; dry?: number; outline?: string; color?: string }> = ({
  t, y, n = 18, h = 220, x0 = -160, w = 1400, seed = 5, dry = 0, outline = '#1A1408', color = '#7A8A3E',
}) => {
  const r = rng(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + (i + r() * 0.6) * (w / n), hh = h * (0.8 + r() * 0.35), ph = r() * 6;
        const sway = Math.sin(t * 1.6 + ph) * 10 + Math.sin(t * 0.7 + i) * 6;
        const dried = dry > 0 && r() < dry;
        const c = dried ? '#A8884A' : color;
        return (
          <g key={i}>
            <path d={`M${x} ${y} Q${x + sway * 0.3} ${y - hh * 0.5} ${x + sway} ${y - hh}`} fill="none" stroke={outline} strokeWidth="9" strokeLinecap="round" />
            <path d={`M${x} ${y} Q${x + sway * 0.3} ${y - hh * 0.5} ${x + sway} ${y - hh}`} fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" />
            {[0.3, 0.5, 0.7].map((k, j) => {
              const lx = x + sway * k, ly = y - hh * k, d = j % 2 ? 1 : -1;
              return <path key={j} d={`M${lx} ${ly} q${d * 40} ${-10 + sway * 0.4} ${d * 70} ${20 + (dried ? 30 : 0)}`} fill="none" stroke={c} strokeWidth="7" strokeLinecap="round" />;
            })}
            <ellipse cx={x + sway * 0.62} cy={y - hh * 0.6} rx="9" ry="22" fill={dried ? '#C9A46A' : '#E8C46A'} stroke={outline} strokeWidth="4" transform={`rotate(${15 + sway * 0.5} ${x + sway * 0.62} ${y - hh * 0.6})`} />
          </g>
        );
      })}
    </g>
  );
};
