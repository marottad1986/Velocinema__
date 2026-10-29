import React from 'react';

// Elementi comuni di Shining: l'albergo di montagna, il labirinto di siepi visto dall'alto, il tappeto dei corridoi
// (motivo inventato, non quello del film), la macchina da scrivere, il triciclo, la porta d'albergo, la lama dell'ascia.
// Mai persone (nemmeno le bambine o i fantasmi: si raccontano con oggetti e luce).

export const K = '#0D0F14'; // contorni

/** Grande albergo di montagna (inventato): corpo centrale con tetto spiovente e due ali; `lit` 0..1 accende le finestre. */
export const Hotel: React.FC<{ x: number; y: number; s?: number; t: number; lit?: number; snow?: number; litColor?: string; one?: boolean }> = ({ x, y, s = 1, t, lit = 0.6, snow = 0, litColor = '#FFC870', one = false }) => {
  const win = (i: number, k: number) => {
    const on = one ? i === 22 && k === 1 : ((i * 7 + k * 13) % 5) < 5 * lit;
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

// pianta fissa 9×9 del labirinto (1 = siepe)
const MAZE = [
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

/**
 * Labirinto di siepi visto dall'alto: corridoi bianchi di neve e siepi scure. Origine al centro.
 * persp (0..1): larghezza del bordo lontano rispetto a quello vicino; con persp il labirinto è un trapezio visto da
 * un'altura, con il fronte delle siepi visibile, e `h` è l'altezza sullo schermo. Senza, pianta vista dall'alto.
 */
export const Maze: React.FC<{ x: number; y: number; w: number; h: number; snow?: number; hedge?: string; persp?: number }> = ({ x, y, w, h, snow = 1, hedge = '#1E3A2C', persp }) => {
  const floor = snow > 0.5 ? '#E8EEF4' : '#5A6A4A';
  if (persp === undefined) {
    const cw = w / 9, ch = h / 9;
    return (
      <g transform={`translate(${x - w / 2} ${y - h / 2})`}>
        <rect width={w} height={h} fill={floor} />
        {MAZE.flatMap((row, r) => [...row].map((c, k) => c === '1' ? (
          <g key={`${r}${k}`}>
            <rect x={k * cw} y={r * ch} width={cw + 0.5} height={ch + 0.5} fill={hedge} />
            {snow > 0 && <rect x={k * cw} y={r * ch} width={cw + 0.5} height={ch * 0.35} fill="#F4F6FA" opacity={0.85 * snow} />}
          </g>
        ) : null))}
        <rect width={w} height={h} fill="none" stroke={K} strokeWidth="6" />
      </g>
    );
  }
  // punto del piano (u, v in 0..1, v = 0 lontano) sullo schermo; le file vicine si allargano e si allungano
  const vv = (v: number) => (Math.pow(1 + v, 1.6) - 1) / (Math.pow(2, 1.6) - 1);
  const pt = (u: number, v: number) => {
    const sc = persp + (1 - persp) * v;
    return [x + (u - 0.5) * w * sc, y - h / 2 + vv(v) * h];
  };
  const poly = (pts: number[][]) => pts.map((q) => q.join(',')).join(' ');
  const quad = (k: number, r: number, dy = 0) => poly([pt(k / 9, r / 9), pt((k + 1) / 9, r / 9), pt((k + 1) / 9, (r + 1) / 9), pt(k / 9, (r + 1) / 9)].map(([px, py]) => [px, py - dy]));
  const tall = (r: number) => (h / 9) * 0.55 * (persp + (1 - persp) * (r / 9)); // altezza della siepe, più alta vicino
  return (
    <g strokeLinejoin="round">
      <polygon points={poly([pt(0, 0), pt(1, 0), pt(1, 1), pt(0, 1)])} fill={floor} stroke={K} strokeWidth="5" />
      {MAZE.map((row, r) => (
        <g key={r}>
          {[...row].map((c, k) => {
            if (c !== '1') return null;
            const hh = tall(r);
            const [a0, a1] = [pt(k / 9, (r + 1) / 9), pt((k + 1) / 9, (r + 1) / 9)];
            return (
              <g key={k}>
                {/* fronte della siepe verso chi guarda, poi la cima innevata */}
                <polygon points={poly([[a0[0], a0[1] - hh], [a1[0], a1[1] - hh], a1, a0])} fill={hedge} stroke={K} strokeWidth="2" />
                <polygon points={quad(k, r, hh)} fill={snow > 0 ? '#F4F6FA' : '#2E5A3E'} stroke={K} strokeWidth="2" opacity={snow > 0 ? 0.6 + 0.4 * snow : 1} />
              </g>
            );
          })}
        </g>
      ))}
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

/**
 * Tappeto del corridoio in prospettiva (motivo inventato: rombi annidati), dal bordo lontano (xl0..xr0 a y0) a quello
 * vicino (xl1..xr1 a y1): le file si allargano e si allungano verso chi guarda.
 */
export const CarpetFloor: React.FC<{ xl0: number; xr0: number; y0: number; xl1: number; xr1: number; y1: number; a?: string; b?: string; c?: string; rows?: number; cols?: number }> = ({ xl0, xr0, y0, xl1, xr1, y1, a = '#7A2A1E', b = '#C46A2A', c = '#3A1E16', rows = 12, cols = 5 }) => {
  const pt = (u: number, v: number) => {
    const f = Math.pow(v, 1.7);
    return [xl0 + (xl1 - xl0) * f + ((xr0 + (xr1 - xr0) * f) - (xl0 + (xl1 - xl0) * f)) * u, y0 + (y1 - y0) * f];
  };
  const poly = (q: number[][]) => q.map((p) => p.join(',')).join(' ');
  const cells = [];
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const u0 = k / cols, u1 = (k + 1) / cols, um = (u0 + u1) / 2, v0 = r / rows, v1 = (r + 1) / rows, vm = (v0 + v1) / 2;
    const inner = (f: number) => poly([pt(um, vm - (vm - v0) * f), pt(um + (u1 - um) * f, vm), pt(um, vm + (v1 - vm) * f), pt(um - (um - u0) * f, vm)]);
    cells.push(
      <g key={`${r}-${k}`}>
        <polygon points={inner(1)} fill={b} />
        <polygon points={inner(0.5)} fill={c} />
      </g>,
    );
  }
  return (
    <g>
      <polygon points={poly([pt(0, 0), pt(1, 0), pt(1, 1), pt(0, 1)])} fill={a} />
      {cells}
    </g>
  );
};

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
export const Tricycle: React.FC<{ x: number; y: number; s?: number; rot?: number; spin?: number; color?: string }> = ({ x, y, s = 1, rot = 0, spin = 0, color = '#C8202E' }) => {
  // origine a terra sotto il telaio: ruota davanti grande con i pedali, due ruote dietro piccole sfalsate, basi a y 0
  const wheel = (cx: number, r: number, key: string, front = false) => (
    <g key={key} transform={`translate(${cx} ${-r}) rotate(${spin})`}>
      <circle r={r} fill={front ? 'none' : '#2A2A2E'} stroke={K} strokeWidth={front ? 9 : 7} />
      <path d={`M${-r} 0 H${r} M0 ${-r} V${r}`} stroke="#8A8A90" strokeWidth="3" />
      {front && <path d="M0 0 L18 -14 M0 0 L-18 14 M12 -18 H26 M-26 18 H-12" stroke={K} strokeWidth="6" />}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeLinecap="round" strokeLinejoin="round">
      {wheel(-92, 22, 'b2')}
      <path d="M-92 -22 H-58" stroke={K} strokeWidth="8" />
      {wheel(-58, 22, 'b1')}
      <path d="M-75 -22 L-10 -40 L60 -42 M-10 -40 L-20 -70 M60 -42 L48 -110 M30 -112 H72" fill="none" stroke={color} strokeWidth="12" />
      <path d="M-44 -74 H4" stroke={K} strokeWidth="16" />
      {wheel(60, 42, 'f', true)}
    </g>
  );
};

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
