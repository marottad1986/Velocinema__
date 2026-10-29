import React from 'react';

// Elementi comuni di Titanic: il transatlantico a quattro fumaioli (fiancata), l'iceberg, il diamante a cuore
// (il Cuore dell'Oceano, disegnato qui: niente gioiello del film), la scialuppa e la porta di legno che galleggia.
// Mai persone: i personaggi si raccontano con oggetti, luci e il diamante.

export const K = '#08101C'; // contorni
export const SAPPHIRE = '#4FB0E8';

/**
 * Transatlantico visto di fianco, prua a destra. Origine alla linea di galleggiamento, al centro dello scafo (lungo 1000).
 * lit 0..1 accende gli oblò; smoke 0..1 fa uscire il fumo dai fumaioli (lo disegna chi chiama, qui solo i camini).
 */
export const Ship: React.FC<{ x: number; y: number; s?: number; t: number; lit?: number; rot?: number; flip?: boolean; litColor?: string }> = ({ x, y, s = 1, t, lit = 0.8, rot = 0, flip = false, litColor = '#FFD98A' }) => {
  const on = (i: number) => (((i * 7) % 11) / 11 < lit ? 0.75 + 0.25 * Math.sin(t * 1.3 + i) : 0.1);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`} strokeLinejoin="round">
      {/* alberi e cavi */}
      <path d="M-400 -150 V-330 M420 -150 V-330 M-400 -320 L-200 -150 M420 -320 L240 -150 M-400 -320 L420 -320" stroke={K} strokeWidth="3" fill="none" opacity=".8" />
      {/* fumaioli color camoscio con la cima nera, inclinati all'indietro */}
      {[-210, -70, 70, 210].map((fx, i) => (
        <g key={i} transform={`translate(${fx} -150) skewX(-8)`}>
          <rect x="-24" y="-130" width="48" height="130" fill="#D9A45A" stroke={K} strokeWidth="5" />
          <rect x="-24" y="-130" width="48" height="30" fill="#14161A" stroke={K} strokeWidth="5" />
          <path d="M-14 -96 V-6" stroke="#B8833E" strokeWidth="6" />
        </g>
      ))}
      {/* sovrastrutture bianche */}
      <path d="M-330 -60 V-150 H330 V-60 Z" fill="#EDE6D8" stroke={K} strokeWidth="6" />
      <path d="M-250 -150 V-175 H240 V-150 Z" fill="#E4DCCB" stroke={K} strokeWidth="5" />
      {Array.from({ length: 22 }, (_, i) => <rect key={`w${i}`} x={-315 + i * 29} y="-140" width="16" height="14" fill={litColor} opacity={on(i + 40)} />)}
      {Array.from({ length: 8 }, (_, i) => <rect key={`b${i}`} x={-300 + i * 80} y="-196" width="44" height="18" rx="6" fill="#F4EEE2" stroke={K} strokeWidth="3" />)}
      {/* scafo nero con la fascia bianca */}
      <path d="M-500 -60 H470 Q520 -60 530 -70 L505 0 H-470 Q-505 -20 -500 -60 Z" fill="#141820" stroke={K} strokeWidth="7" />
      <path d="M-496 -54 H500" stroke="#F4EEE2" strokeWidth="5" />
      {Array.from({ length: 30 }, (_, i) => <circle key={`o${i}`} cx={-450 + i * 31} cy={-30 - (i % 2) * 0} r="5" fill={litColor} opacity={on(i)} />)}
      {Array.from({ length: 26 }, (_, i) => <circle key={`p${i}`} cx={-430 + i * 34} cy={-12} r="4" fill={litColor} opacity={on(i + 70) * 0.9} />)}
      {/* opera viva rossa (sotto la linea dell'acqua) */}
      <path d="M-470 0 H505 L490 30 H-450 Z" fill="#8A2A22" stroke={K} strokeWidth="5" />
    </g>
  );
};

/** Iceberg: punta irregolare bianca e azzurra con facce in ombra. Origine alla linea dell'acqua, al centro. */
export const Iceberg: React.FC<{ x: number; y: number; s?: number; below?: boolean }> = ({ x, y, s = 1, below = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    {below && <path d="M-260 0 L-320 120 L-180 260 L120 300 L300 160 L250 0 Z" fill="#2E6A8A" opacity=".5" />}
    <path d="M-240 0 L-180 -120 L-120 -150 L-60 -300 L10 -260 L60 -340 L130 -200 L200 -170 L250 0 Z" fill="#EAF4F8" stroke={K} strokeWidth="7" />
    <path d="M-60 -300 L-20 -120 L-120 -150 Z M60 -340 L40 -150 L130 -200 Z M-20 -120 L40 -150 L200 -170 L250 0 L-40 0 Z" fill="#A9D2E4" opacity=".75" />
    <path d="M-180 -120 L-150 -40 L-240 0 Z" fill="#C8E2EE" />
  </g>
);

/** Il diamante a cuore blu con la catenina d'argento. Origine al centro del cuore. */
export const Diamond: React.FC<{ x: number; y: number; s?: number; t: number; glow?: number; chain?: boolean }> = ({ x, y, s = 1, t, glow = 1, chain = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    {chain && <path d="M-34 -40 Q-120 -150 0 -190 Q120 -150 34 -40" fill="none" stroke="#D6DCE4" strokeWidth="5" strokeDasharray="7 4" />}
    <path d="M0 70 L-62 0 Q-80 -34 -52 -52 Q-22 -66 0 -36 Q22 -66 52 -52 Q80 -34 62 0 Z" fill="#1F6FB8" stroke={K} strokeWidth="5" />
    <path d="M0 70 L-30 -10 L0 -36 L30 -10 Z" fill="#4FB0E8" />
    <path d="M-62 0 L-30 -10 L-52 -52 Z M62 0 L30 -10 L52 -52 Z" fill="#2E8AD0" />
    <path d="M-40 -40 L-26 -46" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(t * 4)} />
    {/* scintilla a quattro punte che pulsa */}
    <path d="M30 -30 l4 -16 l4 16 l16 4 l-16 4 l-4 16 l-4 -16 l-16 -4 Z" fill="#FFFFFF" opacity={glow * (0.3 + 0.7 * Math.max(0, Math.sin(t * 3)))} />
  </g>
);

/** Scialuppa bianca vista di fianco con le gru (davits) opzionali. Origine al centro della chiglia. */
export const Lifeboat: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeLinejoin="round">
    <path d="M-110 -40 H110 Q100 0 70 10 H-70 Q-100 0 -110 -40 Z" fill="#F4EEE2" stroke={K} strokeWidth="6" />
    <path d="M-104 -30 H104" stroke="#8A6A44" strokeWidth="6" />
    {[-60, 0, 60].map((bx) => <path key={bx} d={`M${bx} -40 V-48`} stroke={K} strokeWidth="5" />)}
  </g>
);

/** Porta di legno intagliata che galleggia, vista dall'alto in prospettiva. Origine al centro. */
export const Door: React.FC<{ x: number; y: number; s?: number; rot?: number; frost?: number }> = ({ x, y, s = 1, rot = 0, frost = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s} ${s * 0.55})`} strokeLinejoin="round">
    <rect x="-150" y="-260" width="300" height="520" rx="10" fill="#8A5A32" stroke={K} strokeWidth="8" />
    <rect x="-112" y="-220" width="224" height="190" rx="8" fill="none" stroke="#5A3A1E" strokeWidth="9" />
    <rect x="-112" y="10" width="224" height="210" rx="8" fill="none" stroke="#5A3A1E" strokeWidth="9" />
    <path d="M-70 -125 Q0 -175 70 -125 Q0 -75 -70 -125 Z M-70 115 Q0 65 70 115 Q0 165 -70 115 Z" fill="none" stroke="#6A4426" strokeWidth="6" />
    <rect x="-150" y="-260" width="300" height="520" rx="10" fill="#E8F4FA" opacity={0.55 * frost} />
  </g>
);
