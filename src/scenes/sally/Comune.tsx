import React from 'react';

// Elementi comuni di «Sally» (Vasco Rossi): colori e oggetti ricorrenti.
// L'ambra (#E8A54B) solo sugli oggetti chiave del capitolo; il rosso della sciarpa (#C8384A) è il segno di Sally
// (sciarpa in copertina e nel finale, ombrello nel capitolo «Chi è Sally?»). Mai Vasco o altre persone, nemmeno in sagoma;
// niente copertine dei dischi né loghi.

export const K = '#0D1220';
export const AMBER = '#E8A54B';
export const RED = '#C8384A';
export const CREAM = '#F3E9DC';
/** Velature (QUALITA §6): blu notte di città e caldo ambra degli interni e dell'alba. */
export const TINT_NIGHT = '#1A2444';
export const TINT_WARM = '#E8A54B';

/** Disco a 45 giri visto dall'alto in prospettiva (ellisse): `spin` in giri, etichetta ambra se `lit`. */
export const Disco45: React.FC<{ x: number; y: number; rx: number; ry: number; spin: number; lit?: number }> = ({ x, y, rx, ry, spin, lit = 1 }) => {
  const a = spin * Math.PI * 2;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#111" stroke={K} strokeWidth="6" />
      {[0.82, 0.68, 0.55].map((k, i) => <ellipse key={i} cx={x} cy={y} rx={rx * k} ry={ry * k} fill="none" stroke="#2C2C34" strokeWidth="2" />)}
      {/* riflesso che gira: si vede la rotazione */}
      <path d={`M${x + Math.cos(a) * rx * 0.45} ${y + Math.sin(a) * ry * 0.45} L${x + Math.cos(a) * rx * 0.95} ${y + Math.sin(a) * ry * 0.95}`} stroke="#6A6A78" strokeWidth="5" strokeLinecap="round" opacity=".7" />
      <path d={`M${x - Math.cos(a) * rx * 0.45} ${y - Math.sin(a) * ry * 0.45} L${x - Math.cos(a) * rx * 0.9} ${y - Math.sin(a) * ry * 0.9}`} stroke="#4A4A56" strokeWidth="4" strokeLinecap="round" opacity=".6" />
      <ellipse cx={x} cy={y} rx={rx * 0.36} ry={ry * 0.36} fill={lit > 0.5 ? AMBER : '#8A6A3A'} stroke={K} strokeWidth="3" />
      <circle cx={x + Math.cos(a) * rx * 0.2} cy={y + Math.sin(a) * ry * 0.2} r="4" fill={K} opacity=".6" />
      <ellipse cx={x} cy={y} rx="7" ry={Math.max(2, 7 * ry / rx)} fill="#D8D8E0" stroke={K} strokeWidth="2" />
    </g>
  );
};
