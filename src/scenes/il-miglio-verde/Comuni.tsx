import React from 'react';
import { mod } from '../../lib/anim';
import { Glow } from '../../lib/elements';

// Elementi comuni del Miglio verde: il corridoio del braccio della morte in prospettiva (pavimento verde lucido, celle con
// le sbarre ai lati, lampade appese, la porta in fondo con la luce calda), il topolino generico con il rocchetto colorato,
// il cappello a cilindro con il bastone (il film che Paul e John guardano). Nessuna persona.

export const K = '#0B130E'; // contorni
export const GOLD = '#F2C14E'; // accento: la luce del dono di John e gli oggetti chiave
export const GREEN = '#4E8A5E';

// ---------------------------------------------------------------- prospettiva del corridoio

/** Punto di fuga e proiezione: x mondo (0 = centro), y mondo (0 = altezza degli occhi, positivo in basso), profondità d ≥ 1. */
export const VP = { x: 540, y: 880 };
export const pj = (X: number, Y: number, d: number) => [VP.x + X / d, VP.y + Y / d] as const;
const W = 700; // mezza larghezza del corridoio
const FLOOR = 1100;
const CEIL = -900;
const DMAX = 8;

/** Il corridoio verde. `door` 0..1 = quanta luce calda dalla porta in fondo; `burst` = lampade scoppiate (da 0 a 1);
 *  `lamps` = luminosità delle lampade; `dark` = penombra notturna (0..1). */
export const Corridor: React.FC<{ t: number; id: string; door?: number; burst?: number; lamps?: number; dark?: number; flicker?: number; lampOn?: number[] }> = ({
  t, id, door = 0.7, burst = 0, lamps = 1, dark = 0, flicker = 0, lampOn,
}) => {
  const P = (X: number, Y: number, d: number) => pj(X, Y, d).join(' ');
  const cells = [1.25, 1.7, 2.3, 3.1, 4.2, 5.6, 7.2];
  const lampD = [1.6, 2.6, 4.0, 6.0];
  const fl = flicker > 0 ? 1 - flicker * (0.5 + 0.5 * Math.sin(t * 37) * Math.sin(t * 13)) : 1;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-floor`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#1E4A2E" />
          <stop offset=".55" stopColor="#3E7A4E" />
          <stop offset="1" stopColor="#2A5A3A" />
        </linearGradient>
        <linearGradient id={`${id}-wallL`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3A3E36" />
          <stop offset="1" stopColor="#5A5A4C" />
        </linearGradient>
        <linearGradient id={`${id}-wallR`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#2E322C" />
          <stop offset="1" stopColor="#4E5044" />
        </linearGradient>
        <linearGradient id={`${id}-ceil`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14180F" />
          <stop offset="1" stopColor="#3A3C32" />
        </linearGradient>
        <linearGradient id={`${id}-cone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE6A8" stopOpacity=".55" />
          <stop offset="1" stopColor="#FFE6A8" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* soffitto, pareti, pavimento */}
      <path d={`M${P(-W, CEIL, 1)} L${P(W, CEIL, 1)} L${P(W, CEIL, DMAX)} L${P(-W, CEIL, DMAX)} Z`} fill={`url(#${id}-ceil)`} />
      <path d={`M${P(-W, CEIL, 1)} L${P(-W, CEIL, DMAX)} L${P(-W, FLOOR, DMAX)} L${P(-W, FLOOR, 1)} Z`} fill={`url(#${id}-wallL)`} />
      <path d={`M${P(W, CEIL, 1)} L${P(W, CEIL, DMAX)} L${P(W, FLOOR, DMAX)} L${P(W, FLOOR, 1)} Z`} fill={`url(#${id}-wallR)`} />
      <path d={`M${P(-W, FLOOR, 1)} L${P(W, FLOOR, 1)} L${P(W, FLOOR, DMAX)} L${P(-W, FLOOR, DMAX)} Z`} fill={`url(#${id}-floor)`} />
      {/* le piastrelle del pavimento verde: file trasversali e linee verso il punto di fuga */}
      {Array.from({ length: 14 }, (_, i) => {
        const d = 1 + i * 0.5;
        return <path key={`h${i}`} d={`M${P(-W, FLOOR, d)} L${P(W, FLOOR, d)}`} stroke="#1A3A24" strokeWidth={4 / Math.sqrt(d)} opacity=".7" />;
      })}
      {[-0.66, -0.33, 0, 0.33, 0.66].map((k) => <path key={k} d={`M${P(W * k, FLOOR, 1)} L${P(W * k, FLOOR, DMAX)}`} stroke="#1A3A24" strokeWidth="3" opacity=".6" />)}
      {/* il riflesso lucido della porta e delle lampade sul pavimento */}
      <path d={`M${P(-90, FLOOR, DMAX)} L${P(90, FLOOR, DMAX)} L${P(260, FLOOR, 1.2)} L${P(-260, FLOOR, 1.2)} Z`} fill="#FFE2A0" opacity={0.08 + 0.12 * door} />
      {lampD.map((d, i) => <ellipse key={`r${i}`} cx={pj(0, FLOOR, d)[0]} cy={pj(0, FLOOR, d)[1]} rx={260 / d} ry={60 / d} fill="#FFE6A8" opacity={0.18 * lamps * fl * (1 - (burst > i / 4 ? 1 : 0)) * (lampOn ? lampOn[i] ?? 1 : 1)} />)}
      {/* le celle ai lati: cornici e sbarre */}
      {[-1, 1].map((side) => cells.slice(0, -1).map((d0, j) => {
        const d1 = cells[j + 1];
        const X = side * W;
        const top = -320;
        const bars = 6;
        return (
          <g key={`${side}${j}`}>
            <path d={`M${P(X, top, d0)} L${P(X, top, d1)} L${P(X, FLOOR, d1)} L${P(X, FLOOR, d0)} Z`} fill="#0E120C" opacity=".85" />
            {/* una branda e una luce fioca dentro alcune celle */}
            {j % 2 === 0 && <path d={`M${P(X, 700, d0 + (d1 - d0) * 0.2)} L${P(X, 700, d0 + (d1 - d0) * 0.8)}`} stroke="#4A4A3C" strokeWidth={30 / d0} />}
            {Array.from({ length: bars }, (_, b) => {
              const d = d0 + ((d1 - d0) * (b + 0.5)) / bars;
              return <path key={b} d={`M${P(X, top, d)} L${P(X, FLOOR, d)}`} stroke="#5A6058" strokeWidth={Math.max(2, 16 / d)} strokeLinecap="round" />;
            })}
            <path d={`M${P(X, top, d0)} L${P(X, top, d1)} M${P(X, 420, d0)} L${P(X, 420, d1)}`} stroke="#6A7066" strokeWidth={Math.max(2, 14 / d0)} />
            <path d={`M${P(X, CEIL, d0)} L${P(X, FLOOR, d0)}`} stroke={K} strokeWidth={Math.max(3, 22 / d0)} />
          </g>
        );
      }))}
      {/* la porta in fondo, socchiusa, con la luce calda */}
      <g>
        <path d={`M${P(-W, CEIL, DMAX)} L${P(W, CEIL, DMAX)} L${P(W, FLOOR, DMAX)} L${P(-W, FLOOR, DMAX)} Z`} fill="#3A3A30" />
        <path d={`M${P(-260, -420, DMAX)} L${P(260, -420, DMAX)} L${P(260, FLOOR, DMAX)} L${P(-260, FLOOR, DMAX)} Z`} fill="#1A1A14" stroke={K} strokeWidth="4" />
        <path d={`M${P(-220, -380, DMAX)} L${P(70, -380, DMAX)} L${P(70, FLOOR, DMAX)} L${P(-220, FLOOR, DMAX)} Z`} fill="#FFD890" opacity={0.25 + 0.7 * door} />
        <path d={`M${P(70, -380, DMAX)} L${P(230, -410, DMAX)} L${P(230, FLOOR + 40, DMAX)} L${P(70, FLOOR, DMAX)} Z`} fill="#4A3A26" stroke={K} strokeWidth="3" />
        <Glow id={`${id}-door`} x={VP.x - 5} y={VP.y + 60} r={220} t={t} color="#FFD890" amp={0.06} rate={1.6} opacity={0.35 + 0.4 * door} />
      </g>
      {/* le lampade appese con il loro cono di luce */}
      {lampD.map((d, i) => {
        const [x, y] = pj(0, CEIL + 280, d);
        const broken = burst > i / 4 + 0.05;
        const on = lamps * fl * (broken ? 0 : 1) * (lampOn ? lampOn[i] ?? 1 : 1);
        const sw = Math.sin(t * 1.2 + i) * 3;
        return (
          <g key={`l${i}`}>
            <path d={`M${pj(0, CEIL, d)[0]} ${pj(0, CEIL, d)[1]} L${x + sw} ${y}`} stroke="#1A1A14" strokeWidth={Math.max(2, 8 / d)} />
            {on > 0.05 && <path d={`M${x + sw - 40 / d} ${y} L${x + sw - 520 / d} ${pj(0, FLOOR, d)[1]} L${x + sw + 520 / d} ${pj(0, FLOOR, d)[1]} L${x + sw + 40 / d} ${y} Z`} fill={`url(#${id}-cone)`} opacity={0.5 * on} />}
            <path d={`M${x + sw - 70 / d} ${y + 30 / d} Q${x + sw} ${y - 40 / d} ${x + sw + 70 / d} ${y + 30 / d} Z`} fill="#2E3A30" stroke={K} strokeWidth={Math.max(2, 8 / d)} />
            {!broken && <circle cx={x + sw} cy={y + 34 / d} r={22 / d} fill={on > 0.3 ? '#FFF0C0' : '#6A6A58'} />}
            {broken && <path d={`M${x + sw - 14 / d} ${y + 30 / d} l${8 / d} ${16 / d} l${8 / d} ${-10 / d} l${8 / d} ${14 / d}`} stroke="#C8C8B0" strokeWidth={Math.max(1.5, 5 / d)} fill="none" />}
            {on > 0.05 && <Glow id={`${id}-lg${i}`} x={x + sw} y={y + 34 / d} r={260 / d} t={t} color="#FFE6A8" amp={0.08} rate={2 + i} opacity={0.6 * on} />}
          </g>
        );
      })}
      {dark > 0 && <rect x="-400" y="-400" width="1880" height="2800" fill="#050806" opacity={0.55 * dark} />}
    </g>
  );
};

// ---------------------------------------------------------------- il topolino e il rocchetto

/** Topolino generico visto di lato (muso a destra), coda che ondeggia; `age` 0..1 = pelo che imbianca. */
export const Mouse: React.FC<{ x: number; y: number; s?: number; t: number; age?: number; flip?: boolean; sleep?: boolean }> = ({ x, y, s = 1, t, age = 0, flip, sleep }) => {
  const fur = age > 0.5 ? '#C8C4B8' : '#8A7A6A';
  const tw = Math.sin(t * 3) * 10;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} strokeLinejoin="round" strokeLinecap="round">
      <path d={`M-46 6 Q-90 ${10 + tw} -120 ${-6 - tw} Q-140 -20 -150 ${-4 + tw}`} fill="none" stroke="#C89A8A" strokeWidth="5" />
      <ellipse cx="0" cy="0" rx="50" ry="30" fill={fur} stroke={K} strokeWidth="6" />
      <path d="M-30 -14 Q0 -30 30 -16" stroke="#FFFFFF" strokeWidth="4" opacity=".25" fill="none" />
      <path d="M30 -10 Q70 -6 76 8 Q64 20 34 18 Z" fill={fur} stroke={K} strokeWidth="6" />
      <circle cx="26" cy="-26" r="15" fill="#D8A8A0" stroke={K} strokeWidth="5" />
      <circle cx="26" cy="-26" r="7" fill="#F0C8C0" />
      {sleep ? <path d="M48 0 q5 3 10 0" stroke={K} strokeWidth="3" fill="none" /> : <circle cx="52" cy="0" r="4.5" fill={K} />}
      <circle cx="77" cy="8" r="5" fill="#E8909A" stroke={K} strokeWidth="2" />
      <path d="M72 10 l22 -6 M72 12 l22 4" stroke={K} strokeWidth="1.5" />
      <path d="M-20 26 v8 M20 26 v8" stroke={K} strokeWidth="5" />
    </g>
  );
};

/** Il rocchetto di legno colorato che il topolino spinge (rosso, giallo e verde a strisce). `roll` = angolo in gradi. */
export const Spool: React.FC<{ x: number; y: number; s?: number; roll?: number }> = ({ x, y, s = 1, roll = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    <ellipse cx="0" cy="26" rx="34" ry="7" fill="#000" opacity=".3" />
    <rect x="-26" y="-18" width="52" height="36" fill="#C8A060" stroke={K} strokeWidth="5" />
    {[-14, -4, 6].map((xx, i) => <rect key={i} x={xx + (mod(roll / 30, 1) * 10 - 5) * 0} y="-18" width="8" height="36" fill={['#D8483A', GOLD, '#4E9A5E'][(i + Math.floor(roll / 60)) % 3]} />)}
    <rect x="-26" y="-18" width="52" height="36" fill="none" stroke={K} strokeWidth="5" />
    {[-30, 30].map((xx) => (
      <g key={xx} transform={`translate(${xx} 0)`}>
        <ellipse rx="8" ry="26" fill="#A87A44" stroke={K} strokeWidth="5" />
        <ellipse rx="3" ry="8" fill={K} />
      </g>
    ))}
  </g>
);

/** Cappello a cilindro e bastone da ballo (in bianco e nero, come nel vecchio film). */
export const TopHat: React.FC<{ x: number; y: number; s?: number; rot?: number; color?: string; line?: string }> = ({ x, y, s = 1, rot = 0, color = '#1A1A1A', line = '#E8E8E8' }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeLinejoin="round">
    <path d="M-40 -110 H40 L36 -10 H-36 Z" fill={color} stroke={line} strokeWidth="4" />
    <path d="M-36 -30 H36" stroke={line} strokeWidth="8" opacity=".6" />
    <path d="M-70 -10 Q0 10 70 -10 Q60 8 0 14 Q-60 8 -70 -10 Z" fill={color} stroke={line} strokeWidth="4" />
  </g>
);
export const Cane: React.FC<{ x: number; y: number; s?: number; rot?: number; color?: string; line?: string }> = ({ x, y, s = 1, rot = 0, color = '#1A1A1A', line = '#E8E8E8' }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M0 0 V-180 Q0 -200 18 -200" fill="none" stroke={line} strokeWidth="12" strokeLinecap="round" />
    <path d="M0 0 V-180 Q0 -200 18 -200" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
    <circle cx="0" cy="0" r="6" fill={line} />
  </g>
);

/** Sciame di moscerini neri che sale e si dissolve nella luce dorata (il male tolto da John). `p` 0..1 = quanto si è alzato. */
export const Swarm: React.FC<{ x: number; y: number; t: number; p: number; n?: number; spread?: number; rise?: number; seed?: number }> = ({ x, y, t, p, n = 60, spread = 160, rise = 520, seed = 7 }) => {
  if (p <= 0 || p >= 1) return null;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const a = ((i * 137.5 + seed * 31) % 360) * (Math.PI / 180);
        const r0 = ((i * 53 + seed) % 100) / 100;
        const k = Math.min(1, p * (1 + r0 * 0.6));
        const px = x + Math.cos(a + t * 2 + i) * spread * (0.2 + 0.8 * k) * r0 + Math.sin(t * 9 + i) * 8;
        const py = y - rise * k * (0.6 + 0.4 * r0) + Math.cos(t * 11 + i) * 8;
        const fade = k < 0.75 ? 1 : 1 - (k - 0.75) / 0.25;
        const gold = Math.max(0, (k - 0.5) * 2);
        return (
          <g key={i} opacity={fade}>
            {gold > 0 && <circle cx={px} cy={py} r={9 * gold} fill={GOLD} opacity={0.35 * gold} />}
            <ellipse cx={px} cy={py} rx="4.5" ry="3" fill={gold > 0.6 ? GOLD : '#0A0A08'} />
            <path d={`M${px - 5} ${py - 2} l-4 -${3 + 2 * Math.sin(t * 40 + i)} M${px + 5} ${py - 2} l4 -${3 + 2 * Math.cos(t * 40 + i)}`} stroke="#3A3A30" strokeWidth="1.5" />
          </g>
        );
      })}
    </g>
  );
};
