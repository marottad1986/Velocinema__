import React from 'react';

// Elementi comuni di Shining: l'albergo di montagna, il labirinto di siepi visto dall'alto, il tappeto dei corridoi
// (motivo inventato, non quello del film), la macchina da scrivere, il triciclo, la porta d'albergo, la lama dell'ascia.
// Mai persone (nemmeno le bambine o i fantasmi: si raccontano con oggetti e luce).

export const K = '#0D0F14'; // contorni

/** Grande albergo di montagna (inventato): corpo centrale con tetto spiovente e due ali; `lit` 0..1 accende le finestre. */
export const Hotel: React.FC<{ x: number; y: number; s?: number; t: number; lit?: number; snow?: number; litColor?: string }> = ({ x, y, s = 1, t, lit = 0.6, snow = 0, litColor = '#FFC870' }) => {
  const win = (i: number, k: number) => {
    const on = ((i * 7 + k * 13) % 5) < 5 * lit;
    return on ? 0.75 + 0.25 * Math.sin(t * 0.7 + i + k) : 0.12;
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
      {/* ali laterali */}
      {[-1, 1].map((d) => (
        <g key={d}>
          <path d={`M${d * 140} 0 V-150 L${d * 200} -200 H${d * 420} L${d * 460} -150 V0 Z`} fill="#4A3E36" stroke={K} strokeWidth="7" />
          <path d={`M${d * 130} -150 L${d * 200} -214 H${d * 420} L${d * 476} -150`} fill="#2A2420" stroke={K} strokeWidth="7" />
          {snow > 0 && <path d={`M${d * 130} -152 L${d * 200} -214 H${d * 420} L${d * 476} -152`} fill="none" stroke="#F4F6FA" strokeWidth={10 * snow} opacity=".9" />}
          {Array.from({ length: 3 }, (_, r) => Array.from({ length: 6 }, (_, c) => (
            <rect key={`${r}${c}`} x={d > 0 ? 170 + c * 44 : -190 - c * 44 - 22 + 22} y={-130 + r * 40} width="22" height="26" fill={litColor} opacity={win(c + (d > 0 ? 10 : 0), r)} />
          )))}
        </g>
      ))}
      {/* corpo centrale */}
      <path d="M-160 0 V-260 L0 -360 L160 -260 V0 Z" fill="#5A4A3E" stroke={K} strokeWidth="8" />
      <path d="M-180 -258 L0 -376 L180 -258" fill="none" stroke="#2A2420" strokeWidth="18" />
      {snow > 0 && <path d="M-180 -262 L0 -380 L180 -262" fill="none" stroke="#F4F6FA" strokeWidth={12 * snow} opacity=".9" />}
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 5 }, (_, c) => (
        <rect key={`c${r}${c}`} x={-120 + c * 52} y={-230 + r * 50} width="26" height="32" fill={litColor} opacity={win(c + 20, r)} />
      )))}
      <path d="M-60 0 V-40 Q0 -76 60 -40 V0 Z" fill="#2A1C14" stroke={K} strokeWidth="6" />
      <rect x="-90" y="-60" width="180" height="16" fill="#3A2E26" stroke={K} strokeWidth="4" />
    </g>
  );
};

/** Labirinto di siepi visto dall'alto, in prospettiva schiacciata: corridoi bianchi di neve e siepi scure. Origine al centro. */
export const Maze: React.FC<{ x: number; y: number; w: number; h: number; snow?: number; hedge?: string }> = ({ x, y, w, h, snow = 1, hedge = '#1E3A2C' }) => {
  // pianta fissa 9×9 (1 = siepe)
  const P = [
    '111110111',
    '100010001',
    '101110101',
    '101000101',
    '101011101',
    '100010001',
    '111010111',
    '100000001',
    '111101111',
  ];
  const cw = w / 9, ch = h / 9;
  return (
    <g transform={`translate(${x - w / 2} ${y - h / 2})`}>
      <rect width={w} height={h} fill={snow > 0.5 ? '#E8EEF4' : '#5A6A4A'} />
      {P.flatMap((row, r) => [...row].map((c, k) => c === '1' ? (
        <g key={`${r}${k}`}>
          <rect x={k * cw} y={r * ch} width={cw + 0.5} height={ch + 0.5} fill={hedge} />
          {snow > 0 && <rect x={k * cw} y={r * ch} width={cw + 0.5} height={ch * 0.35} fill="#F4F6FA" opacity={0.85 * snow} />}
        </g>
      ) : null))}
      <rect width={w} height={h} fill="none" stroke={K} strokeWidth="6" />
    </g>
  );
};

/** Motivo del tappeto dei corridoi (inventato: rombi annidati), come pattern SVG. */
export const CarpetPattern: React.FC<{ id: string; a?: string; b?: string; c?: string; size?: number }> = ({ id, a = '#7A2A1E', b = '#C46A2A', c = '#3A1E16', size = 90 }) => (
  <pattern id={id} width={size} height={size * 0.6} patternUnits="userSpaceOnUse">
    <rect width={size} height={size * 0.6} fill={a} />
    <path d={`M${size / 2} 0 L${size} ${size * 0.3} L${size / 2} ${size * 0.6} L0 ${size * 0.3} Z`} fill={c} />
    <path d={`M${size / 2} ${size * 0.1} L${size * 0.84} ${size * 0.3} L${size / 2} ${size * 0.5} L${size * 0.16} ${size * 0.3} Z`} fill={b} />
    <path d={`M${size / 2} ${size * 0.2} L${size * 0.67} ${size * 0.3} L${size / 2} ${size * 0.4} L${size * 0.33} ${size * 0.3} Z`} fill={a} />
  </pattern>
);

/** Macchina da scrivere vista di tre quarti, con il foglio inserito (righe tutte uguali). */
export const Typewriter: React.FC<{ x: number; y: number; s?: number; t: number; lines?: number; accent?: string }> = ({ x, y, s = 1, t, lines = 6, accent = '#C8202E' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    {/* foglio */}
    <path d="M-110 -150 H110 L104 -40 H-104 Z" fill="#F4F0E4" stroke={K} strokeWidth="5" />
    {Array.from({ length: lines }, (_, i) => <path key={i} d={`M-90 ${-134 + i * 14} H${70 - ((i * 37) % 30)}`} stroke="#3A3A3A" strokeWidth="3" />)}
    {/* rullo e corpo */}
    <rect x="-150" y="-50" width="300" height="34" rx="16" fill="#1E1E22" stroke={K} strokeWidth="6" />
    <circle cx="-158" cy="-33" r="14" fill="#5A5A60" stroke={K} strokeWidth="4" />
    <path d="M-170 -16 H170 L200 70 H-200 Z" fill="#2E3A34" stroke={K} strokeWidth="7" />
    <path d="M-150 -6 H150" stroke="#5A6A60" strokeWidth="4" />
    {Array.from({ length: 4 }, (_, r) => Array.from({ length: 10 }, (_, c) => {
      const press = Math.floor(t * 9) % 40 === r * 10 + c ? 3 : 0;
      return <circle key={`${r}${c}`} cx={-140 + c * 31 + r * 6} cy={8 + r * 16 + press} r="7" fill="#E8E2D0" stroke={K} strokeWidth="2.5" />;
    }))}
    <rect x="-120" y="74" width="240" height="14" rx="6" fill="#1E1E22" stroke={K} strokeWidth="4" />
    <path d="M150 -50 l40 -20" stroke={K} strokeWidth="8" strokeLinecap="round" />
    <circle cx="0" cy="-36" r="5" fill={accent} />
  </g>
);

/** Triciclo da bambino di profilo. */
export const Tricycle: React.FC<{ x: number; y: number; s?: number; rot?: number; spin?: number; color?: string }> = ({ x, y, s = 1, rot = 0, spin = 0, color = '#C8202E' }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeLinecap="round" strokeLinejoin="round">
    {[[-70, 30, 30], [70, 30, 30], [50, 26, 52]].map(([cx, r, cy], i) => (
      <g key={i} transform={`translate(${cx} ${cy}) rotate(${spin})`}>
        <circle r={r} fill="none" stroke={K} strokeWidth="9" />
        <path d={`M${-r} 0 H${r} M0 ${-r} V${r}`} stroke="#6A6A70" strokeWidth="3" />
      </g>
    ))}
    <path d="M-70 30 L10 -30 L50 52 M10 -30 L40 -90 M20 -90 H70" fill="none" stroke={color} strokeWidth="12" />
    <path d="M-40 -20 H10" stroke={K} strokeWidth="16" />
  </g>
);

/** Porta d'albergo con cornice, numero d'ottone e maniglia. Origine in basso al centro. */
export const HotelDoor: React.FC<{ x: number; y: number; s?: number; num?: string; shake?: number; open?: number }> = ({ x, y, s = 1, num = '', shake = 0, open = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    <rect x="-110" y="-420" width="220" height="420" fill="#1A1210" stroke={K} strokeWidth="8" />
    <g transform={`translate(${-100} 0) scale(${1 - 0.7 * open} 1) translate(100 0)`}>
      <rect x="-100" y="-410" width="200" height="410" fill="#6A4A34" stroke={K} strokeWidth="7" />
      <rect x="-76" y="-380" width="152" height="150" fill="none" stroke="#4A3224" strokeWidth="6" />
      <rect x="-76" y="-200" width="152" height="170" fill="none" stroke="#4A3224" strokeWidth="6" />
      {num && <text x="0" y="-300" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="54" fill="#D9B05A" stroke={K} strokeWidth="2">{num}</text>}
      <g transform={`rotate(${shake * 14} 70 -200)`}>
        <circle cx="70" cy="-200" r="12" fill="#D9B05A" stroke={K} strokeWidth="4" />
        <rect x="60" y="-204" width="34" height="9" rx="4" fill="#D9B05A" stroke={K} strokeWidth="3" />
      </g>
    </g>
  </g>
);
