import React from 'react';

// Elementi comuni di Joker: i palazzi di mattoni di Gotham con le scale antincendio, i sacchi della spazzatura dello
// sciopero, la scalinata, gli oggetti del clown (parrucca, scarpa, completo rosso), la pistola e il televisore.
// Mai persone (né il volto truccato): Arthur si racconta con i suoi oggetti, le luci e la città.

export const K = '#0E0C10'; // contorni

/** Palazzo di mattoni con finestre e scala antincendio. Origine in basso a sinistra. lit 0..1 accende le finestre. */
export const Palazzo: React.FC<{ x: number; y: number; w: number; h: number; t: number; color?: string; lit?: number; seed?: number; fire?: boolean }> = ({ x, y, w, h, t, color = '#6A3A2A', lit = 0.35, seed = 1, fire = true }) => {
  const cols = Math.max(2, Math.floor(w / 70)), rows = Math.max(2, Math.floor(h / 90));
  const on = (i: number) => ((i * 37 + seed * 11) % 13) / 13 < lit;
  return (
    <g strokeLinejoin="round">
      <rect x={x} y={y - h} width={w} height={h} fill={color} stroke={K} strokeWidth="7" />
      {Array.from({ length: Math.floor(h / 14) }, (_, i) => <path key={`m${i}`} d={`M${x} ${y - h + i * 14} H${x + w}`} stroke="#000" strokeWidth="1.5" opacity=".12" />)}
      <rect x={x - 6} y={y - h - 14} width={w + 12} height="16" fill="#3A2A22" stroke={K} strokeWidth="5" />
      {Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => {
        const i = r * cols + c;
        const wx = x + 18 + c * ((w - 36) / cols), wy = y - h + 24 + r * ((h - 40) / rows);
        return (
          <g key={`w${i}`}>
            <rect x={wx} y={wy} width={(w - 36) / cols - 16} height={(h - 40) / rows - 30} fill={on(i) ? '#F2C46A' : '#1A1E24'} opacity={on(i) ? 0.8 + 0.2 * Math.sin(t + i) : 1} stroke={K} strokeWidth="3" />
            <path d={`M${wx - 4} ${wy - 3} H${wx + (w - 36) / cols - 12}`} stroke="#B8A890" strokeWidth="4" />
          </g>
        );
      }))}
      {fire && (
        <g stroke={K} strokeWidth="4" fill="none">
          {Array.from({ length: rows - 1 }, (_, r) => {
            const fy = y - h + 24 + (r + 1) * ((h - 40) / rows) - 18;
            return <g key={`f${r}`}><path d={`M${x + w * 0.35} ${fy} h${w * 0.4}`} strokeWidth="6" /><path d={`M${x + w * 0.35} ${fy} v-30 M${x + w * 0.75} ${fy} v-30 M${x + w * 0.35} ${fy - 30} h${w * 0.4}`} /><path d={`M${x + w * 0.4} ${fy} l${w * 0.3} ${-((h - 40) / rows) + 18}`} strokeDasharray="6 8" /></g>;
          })}
        </g>
      )}
    </g>
  );
};

/** Montagna di sacchi della spazzatura (lo sciopero). Origine in basso al centro. */
export const Sacchi: React.FC<{ x: number; y: number; s?: number; seed?: number }> = ({ x, y, s = 1, seed = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    {[[-110, 0, 70], [-30, -10, 80], [60, 0, 70], [-70, -80, 60], [20, -90, 64], [-20, -150, 50]].map(([bx, by, r], i) => (
      <g key={i}>
        <path d={`M${bx - r} ${by} Q${bx - r} ${by - r * 1.3} ${bx} ${by - r * 1.25} Q${bx + r} ${by - r * 1.3} ${bx + r} ${by} Z`} fill={(i + seed) % 3 ? '#1E2226' : '#2A3A30'} stroke={K} strokeWidth="5" />
        <path d={`M${bx - 8} ${by - r * 1.25} l8 -16 l8 16`} fill="none" stroke={K} strokeWidth="4" />
        <path d={`M${bx - r * 0.5} ${by - r * 0.8} q${r * 0.3} -10 ${r * 0.5} 0`} stroke="#5A6A70" strokeWidth="4" fill="none" opacity=".6" />
      </g>
    ))}
  </g>
);

/** Parrucca da clown verde e riccia. Origine al centro. */
export const Parrucca: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = '#3E8A4A' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* calotta sottile e due ciuffi ricci ai lati, vuota al centro */}
    <path d="M-62 10 Q-60 -52 0 -56 Q60 -52 62 10" stroke="#2E6A3A" strokeWidth="12" fill="none" />
    {[-1, 1].map((side) => [[60, -30, 26], [86, -6, 28], [72, 22, 26], [100, 26, 22], [52, 6, 22], [90, -40, 20]].map(([cx, cy, r], i) => (
      <circle key={`${side}${i}`} cx={side * cx} cy={cy} r={r} fill={i % 2 ? '#2E6A3A' : color} stroke={K} strokeWidth="5" />
    )))}
  </g>
);

/** Grande scarpa da clown rossa. Origine sotto la suola, al centro. */
export const Scarpa: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeLinejoin="round">
    <path d="M-60 0 Q-70 -50 -30 -60 Q10 -64 30 -40 Q100 -50 110 -10 Q112 6 90 6 H-50 Q-64 6 -60 0 Z" fill="#C8302A" stroke={K} strokeWidth="6" />
    <path d="M-58 2 H96" stroke="#F2E6D0" strokeWidth="8" />
    <path d="M-20 -56 q10 14 30 4" stroke="#F2E6D0" strokeWidth="5" fill="none" />
  </g>
);

/** Il completo rosso su una gruccia: giacca, panciotto senape e camicia verde. Origine al gancio. */
export const Completo: React.FC<{ x: number; y: number; s?: number; sway?: number; color?: string }> = ({ x, y, s = 1, sway = 0, color = '#B8302A' }) => (
  <g transform={`translate(${x} ${y}) rotate(${sway}) scale(${s})`} strokeLinejoin="round">
    <path d="M0 0 V20 M-6 0 q6 -14 12 0" stroke={K} strokeWidth="5" fill="none" />
    <path d="M-90 40 L0 20 L90 40" stroke="#8A6A44" strokeWidth="10" fill="none" />
    <path d="M-90 40 Q-120 60 -112 250 H-60 L-56 120 L-50 330 H50 L56 120 L60 250 H112 Q120 60 90 40 L30 30 L0 120 L-30 30 Z" fill={color} stroke={K} strokeWidth="7" />
    <path d="M-30 30 L0 120 L30 30 L22 26 L0 60 L-22 26 Z" fill="#3E7A5A" stroke={K} strokeWidth="4" />
    <path d="M-26 70 L0 120 L26 70 L22 200 H-22 Z" fill="#D8A030" stroke={K} strokeWidth="5" />
    {[110, 150, 190].map((by) => <circle key={by} cx="0" cy={by} r="5" fill={K} />)}
  </g>
);

/** Rivoltella vista di fianco. Origine all'impugnatura. */
export const Pistola: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeLinejoin="round">
    <path d="M0 0 L-16 60 H14 L24 10 Z" fill="#5A3A24" stroke={K} strokeWidth="5" />
    <rect x="0" y="-26" width="130" height="18" rx="4" fill="#4A4E54" stroke={K} strokeWidth="5" />
    <rect x="10" y="-36" width="60" height="38" rx="10" fill="#3A3E44" stroke={K} strokeWidth="5" />
    <path d="M20 4 q10 22 30 4" stroke={K} strokeWidth="5" fill="none" />
  </g>
);

/** Televisore anni Ottanta con schermo (il contenuto lo disegna chi chiama dentro screen). Origine al centro dello schermo. */
export const Tv: React.FC<{ x: number; y: number; s?: number; children?: React.ReactNode; glow?: number }> = ({ x, y, s = 1, children, glow = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    <rect x="-200" y="-150" width="400" height="300" rx="26" fill="#5A4430" stroke={K} strokeWidth="9" />
    <rect x="-170" y="-124" width="270" height="248" rx="30" fill="#14181C" stroke={K} strokeWidth="6" />
    <g>{children}</g>
    <rect x="-170" y="-124" width="270" height="248" rx="30" fill="#BFE0FF" opacity={0.06 * glow} />
    {[0, 1].map((i) => <circle key={i} cx="150" cy={-70 + i * 70} r="18" fill="#2A1E14" stroke={K} strokeWidth="4" />)}
    <path d="M-120 150 L-140 190 M120 150 L140 190" stroke={K} strokeWidth="8" />
  </g>
);
