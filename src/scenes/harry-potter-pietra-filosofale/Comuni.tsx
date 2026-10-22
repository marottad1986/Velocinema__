import React from 'react';

// Elementi comuni di Harry Potter e la pietra filosofale: gufo, lettera con sigillo, castello, candela fluttuante,
// scopa, pallina d'oro con le ali, cornice dello specchio. Mai persone; animali sì, nel nostro stile.
// Nessun logo, stemma o carattere del film.

export const K = '#14122A'; // contorni

/** Gufo bianco: `fly` 0 = posato, 1 = in volo (ali aperte che battono). */
export const Owl: React.FC<{ x: number; y: number; s?: number; t: number; fly?: number; ph?: number; color?: string }> = ({ x, y, s = 1, t, fly = 0, ph = 0, color = '#F4F1E6' }) => {
  const flap = fly > 0 ? Math.sin(t * 9 + ph) : 0;
  const wing = (side: number) => {
    const up = -40 * flap * fly;
    return fly > 0
      ? `M${side * 20} -10 Q${side * 80} ${-50 + up} ${side * 130} ${-10 + up} Q${side * 90} ${10 + up * 0.3} ${side * 20} 20 Z`
      : `M${side * 26} -20 Q${side * 44} 10 ${side * 30} 46 Q${side * 18} 20 ${side * 18} -10 Z`;
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round" strokeLinecap="round">
      <path d={wing(-1)} fill="#E2DCC8" stroke={K} strokeWidth="5" />
      <path d={wing(1)} fill="#E2DCC8" stroke={K} strokeWidth="5" />
      <ellipse cx="0" cy="10" rx="30" ry="40" fill={color} stroke={K} strokeWidth="6" />
      {[[-10, 14], [8, 24], [-4, 34], [12, 4]].map(([cx, cy], i) => <path key={i} d={`M${cx - 4} ${cy} l4 3 l4 -3`} stroke="#8A8470" strokeWidth="2.5" fill="none" />)}
      <circle cx="0" cy="-30" r="26" fill={color} stroke={K} strokeWidth="6" />
      <circle cx="-10" cy="-32" r="8" fill="#F2C14E" stroke={K} strokeWidth="3" />
      <circle cx="10" cy="-32" r="8" fill="#F2C14E" stroke={K} strokeWidth="3" />
      <circle cx="-10" cy="-32" r="3.5" fill={K} /><circle cx="10" cy="-32" r="3.5" fill={K} />
      <path d="M-4 -24 L0 -16 L4 -24 Z" fill="#3A3428" />
      {fly === 0 && <path d="M-12 50 v8 M-4 50 v8 M4 50 v8 M12 50 v8" stroke="#3A3428" strokeWidth="3" />}
    </g>
  );
};

/** Lettera di pergamena con sigillo di ceralacca (accento sul sigillo). */
export const Letter: React.FC<{ x: number; y: number; s?: number; rot?: number; seal: string }> = ({ x, y, s = 1, rot = 0, seal }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeLinejoin="round">
    <rect x="-90" y="-56" width="180" height="112" rx="6" fill="#EFE2C2" stroke={K} strokeWidth="6" />
    <path d="M-90 -56 L0 10 L90 -56" fill="none" stroke="#B8A47A" strokeWidth="5" />
    <path d="M-70 30 h80 M-70 42 h60" stroke="#6A5A3A" strokeWidth="3" />
    <circle cx="0" cy="10" r="20" fill={seal} stroke={K} strokeWidth="4" />
    <path d="M-8 4 L0 16 L8 4" stroke="#7A4A10" strokeWidth="3" fill="none" />
  </g>
);

/** Castello con tante torri su una scogliera; `lit` 0..1 accende le finestre. Origine alla base. */
export const Castle: React.FC<{ x: number; y: number; s?: number; t: number; lit?: number; fill?: string; windowColor?: string }> = ({ x, y, s = 1, t, lit = 1, fill = '#1E1A36', windowColor = '#FFD27A' }) => {
  const towers: [number, number, number][] = [[-300, 300, 44], [-200, 420, 50], [-90, 520, 60], [40, 600, 70], [170, 470, 54], [270, 380, 46], [350, 280, 38]];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-420 0 Q-380 -120 -320 -150 L360 -150 Q420 -100 440 0 Z" fill={fill} />
      <rect x="-330" y="-260" width="700" height="120" fill={fill} />
      {towers.map(([tx, h, w], i) => (
        <g key={i}>
          <rect x={tx - w / 2} y={-150 - h} width={w} height={h} fill={fill} />
          <path d={`M${tx - w / 2 - 8} ${-150 - h} L${tx} ${-150 - h - w * 1.4} L${tx + w / 2 + 8} ${-150 - h} Z`} fill={fill} />
          {Array.from({ length: Math.floor(h / 70) }, (_, k) => (
            <rect key={k} x={tx - 6} y={-150 - h + 30 + k * 70} width="12" height="22" rx="6" fill={windowColor} opacity={lit * (0.55 + 0.45 * Math.sin(t * 1.5 + i * 1.7 + k))} />
          ))}
        </g>
      ))}
      {Array.from({ length: 14 }, (_, k) => <rect key={k} x={-310 + k * 48} y="-220" width="10" height="18" rx="5" fill={windowColor} opacity={lit * (0.5 + 0.4 * Math.sin(t * 2 + k))} />)}
    </g>
  );
};

/** Candela che fluttua (oscilla piano su e giù), con fiammella e alone. */
export const FloatingCandle: React.FC<{ x: number; y: number; s?: number; t: number; ph?: number }> = ({ x, y, s = 1, t, ph = 0 }) => {
  const fy = y + Math.sin(t * 1.2 + ph) * 10;
  const fl = 1 + 0.15 * Math.sin(t * 12 + ph * 3);
  return (
    <g transform={`translate(${x} ${fy}) scale(${s})`}>
      <circle cx="0" cy="-34" r="34" fill="#FFD27A" opacity=".18" />
      <rect x="-9" y="-20" width="18" height="60" rx="4" fill="#F4ECD8" stroke={K} strokeWidth="3" />
      <path d={`M0 ${-22 - 22 * fl} Q10 -30 0 -22 Q-10 -30 0 ${-22 - 22 * fl} Z`} fill="#FFC060" />
      <path d={`M0 ${-24 - 12 * fl} Q4 -28 0 -24 Q-4 -28 0 ${-24 - 12 * fl} Z`} fill="#FFF4C8" />
    </g>
  );
};

/** Scopa da volo. */
export const Broom: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeLinecap="round" strokeLinejoin="round">
    <path d="M-220 0 H80" stroke={K} strokeWidth="18" />
    <path d="M-220 0 H80" stroke="#8A5A30" strokeWidth="10" />
    <path d="M70 -6 L230 -40 L250 0 L230 40 L70 6 Z" fill="#C9A060" stroke={K} strokeWidth="6" />
    {[-24, -12, 0, 12, 24].map((d) => <path key={d} d={`M90 ${d * 0.2} L240 ${d}`} stroke="#8A6A30" strokeWidth="3" />)}
    <path d="M70 -12 V12" stroke={K} strokeWidth="10" />
  </g>
);

/** Pallina d'oro con le ali che battono velocissime (accento). */
export const GoldBall: React.FC<{ x: number; y: number; s?: number; t: number; color: string }> = ({ x, y, s = 1, t, color }) => {
  const w = 0.3 + 0.7 * Math.abs(Math.sin(t * 30));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r="60" fill={color} opacity=".25" />
      {[-1, 1].map((d) => <path key={d} d={`M${d * 14} -4 Q${d * 60} ${-40 * w} ${d * 90} ${-20 * w} Q${d * 60} ${-6} ${d * 14} 6 Z`} fill="#F4F1E6" stroke={K} strokeWidth="3" opacity=".9" />)}
      <circle r="16" fill={color} stroke={K} strokeWidth="4" />
      <path d="M-8 -6 Q-4 -12 4 -12" stroke="#FFF4C8" strokeWidth="4" fill="none" />
    </g>
  );
};

/** Cornice d'oro intagliata dello specchio (il vetro si disegna da fuori). Origine al centro del vetro. */
export const MirrorFrame: React.FC<{ x: number; y: number; w: number; h: number; gold: string }> = ({ x, y, w, h, gold }) => (
  <g transform={`translate(${x} ${y})`} strokeLinejoin="round">
    <path d={`M${-w / 2 - 40} ${h / 2 + 60} V${-h / 2 + 40} Q${-w / 2 - 40} ${-h / 2 - 120} 0 ${-h / 2 - 140} Q${w / 2 + 40} ${-h / 2 - 120} ${w / 2 + 40} ${-h / 2 + 40} V${h / 2 + 60} Z`} fill="none" stroke={K} strokeWidth="64" />
    <path d={`M${-w / 2 - 40} ${h / 2 + 60} V${-h / 2 + 40} Q${-w / 2 - 40} ${-h / 2 - 120} 0 ${-h / 2 - 140} Q${w / 2 + 40} ${-h / 2 - 120} ${w / 2 + 40} ${-h / 2 + 40} V${h / 2 + 60} Z`} fill="none" stroke={gold} strokeWidth="50" />
    <path d={`M${-w / 2 - 54} ${h / 2} V${-h / 2 + 40} Q${-w / 2 - 54} ${-h / 2 - 130} 0 ${-h / 2 - 152}`} fill="none" stroke="#FFF0B8" strokeWidth="6" opacity=".7" />
    {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={-w / 2 - 40} cy={-h / 2 + 60 + i * ((h - 40) / 6)} r="8" fill="#8A5A10" />)}
    {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={w / 2 + 40} cy={-h / 2 + 60 + i * ((h - 40) / 6)} r="8" fill="#8A5A10" />)}
    <path d={`M${-w / 2 - 90} ${h / 2 + 60} H${w / 2 + 90} V${h / 2 + 110} H${-w / 2 - 90} Z`} fill={gold} stroke={K} strokeWidth="8" />
    <path d={`M${-w / 2 - 70} ${h / 2 + 110} l-20 70 M${w / 2 + 70} ${h / 2 + 110} l20 70`} stroke={K} strokeWidth="18" />
    <path d={`M${-w / 2 - 70} ${h / 2 + 110} l-20 70 M${w / 2 + 70} ${h / 2 + 110} l20 70`} stroke={gold} strokeWidth="10" />
  </g>
);
