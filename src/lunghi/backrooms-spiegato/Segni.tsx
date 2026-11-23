import React from 'react';
import { eob, seg } from '../../lib/anim';
import { HAND, SANS } from '../../lib/fonts';
import { Glow } from '../../lib/elements';
import { ASYNC, COPY, INK, NIGHT, PAPER, RED, YEL } from './Luoghi';

// Segni grafici del lungo di Backrooms: icone degli oggetti-personaggio, cerchi con il nome, cartellini, cartelli
// «LA REGOLA» / «TEORIA», anello rosso. Disegnati in coordinate dello SCHERMO (grandezza fissa, QUALITA.md §10):
// Mondo.tsx li posiziona proiettando il punto del mondo e correggendolo con fit().

export const pop = (T: number, t0: number) => eob(seg(T, t0, t0 + 0.45), 1.7);

/** Icone degli oggetti-personaggio (centrate, circa 80 px). */
export const Icona: React.FC<{ k: string; T?: number }> = ({ k, T = 0 }) => {
  const o = { stroke: INK, strokeWidth: 3.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  switch (k) {
    case 'prezzo': return ( // Clark: il cartellino del prezzo del negozio
      <g transform="rotate(-12)">
        <path d="M-34 -18 H20 L36 0 L20 18 H-34 Z" fill={PAPER} {...o} />
        <circle cx={20} cy={0} r={4.5} fill={INK} />
        <path d="M24 0 Q40 -20 30 -34" fill="none" stroke={INK} strokeWidth={2.5} />
        <text x={-8} y={7} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={19} fill={RED}>€</text>
      </g>
    );
    case 'taccuino': return ( // Mary: il taccuino della psicologa
      <g>
        <rect x={-26} y={-32} width={52} height={64} rx={4} fill="#E8E2CC" {...o} />
        <path d="M-16 -16 H16 M-16 -4 H16 M-16 8 H10" stroke="#7A8AB0" strokeWidth={3} />
        {[-18, -6, 6, 18].map((x) => <circle key={x} cx={x} cy={-32} r={4} fill="none" stroke={INK} strokeWidth={2.5} />)}
        <path d="M18 30 L34 -18 L40 -16 L24 32 Z" fill="#C04A3A" {...o} strokeWidth={2.5} />
      </g>
    );
    case 'torcia': return ( // Naren: la torcia dell'esploratore
      <g transform="rotate(-25)">
        <path d="M6 -12 L40 -30 V30 L6 12 Z" fill="#FFF4B8" opacity={0.35} />
        <rect x={-34} y={-10} width={40} height={20} rx={4} fill="#4A4E58" {...o} />
        <path d="M6 -14 H18 V14 H6 Z" fill="#8A8E98" {...o} />
        <circle cx={18} cy={0} r={8} fill="#FFFBE6" stroke={INK} strokeWidth={2.5} />
      </g>
    );
    case 'telecamera': return ( // Phil: la telecamera di sorveglianza
      <g>
        <path d="M-30 -24 L-30 -34 H-4 V-24" fill="none" stroke={INK} strokeWidth={4} />
        <rect x={-30} y={-18} width={50} height={30} rx={5} fill="#D8DCE0" {...o} transform="rotate(14)" />
        <path d="M18 -6 L34 -14 V18 L18 10 Z" fill="#5A6068" {...o} transform="rotate(14)" />
        <circle cx={-16} cy={-6} r={4.5} fill={Math.sin(T * 6) > 0 ? RED : '#6A2A2A'} />
      </g>
    );
    case 'nome': return ( // Kat: il cartellino col nome del negozio
      <g>
        <rect x={-36} y={-20} width={72} height={40} rx={6} fill="#3A6A9A" {...o} />
        <rect x={-30} y={-6} width={60} height={20} rx={3} fill={PAPER} />
        <text y={10} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={17} fill={INK}>KAT</text>
        <path d="M-14 -20 V-28 H14 V-20" fill="none" stroke={INK} strokeWidth={3} />
      </g>
    );
    case 'cuore': return ( // Bobby: il fidanzato di Kat
      <path d="M0 26 Q-36 2 -30 -16 Q-22 -34 0 -16 Q22 -34 30 -16 Q36 2 0 26 Z" fill="#D8566A" {...o} />
    );
    case 'maschera': return ( // gli uomini di Async in tuta: la maschera antigas
      <g>
        <ellipse rx={30} ry={34} fill="#D8C450" {...o} />
        <circle cx={-12} cy={-8} r={10} fill="#22303A" {...o} strokeWidth={2.5} />
        <circle cx={12} cy={-8} r={10} fill="#22303A" {...o} strokeWidth={2.5} />
        <rect x={-10} y={10} width={20} height={20} rx={6} fill="#4A4E58" {...o} />
      </g>
    );
    case 'cappello': return ( // il pirata: solo il cappello
      <g transform="scale(0.62)">
        <path d="M-70 10 Q-60 -40 -20 -46 Q0 -62 20 -46 Q60 -40 70 10 Q0 -6 -70 10 Z" fill="#1E1A22" {...o} strokeWidth={5} />
        <path d="M-66 4 Q0 -12 66 4" fill="none" stroke="#D8B04A" strokeWidth={5} />
        <circle cy={-24} r={11} fill="#F4F0E4" {...o} />
      </g>
    );
    case 'cemento': return ( // il pezzo di cemento della casa di Mary
      <g>
        <path d="M-30 -10 L-18 -30 L10 -32 L32 -14 L28 18 L6 30 L-24 22 Z" fill="#9A968C" {...o} />
        <path d="M-18 -30 L-6 -8 L32 -14 M-6 -8 L-12 22" fill="none" stroke="#6A665E" strokeWidth={2.5} />
        <circle cx={14} cy={8} r={3} fill="#6A665E" />
      </g>
    );
    case 'taccuinoCopia': return ( // la copia deforme del taccuino di Mary: grigio, storto, colato, righe sbagliate
      <g>
        <path d="M-28 -30 Q-10 -36 26 -30 L30 18 Q24 30 18 26 Q14 40 8 30 Q0 34 -6 28 Q-14 44 -18 30 Q-28 34 -30 24 Z" fill="#C8C4B8" {...o} />
        <path d="M-18 -16 Q0 -10 14 -20 M-16 -2 Q-2 4 18 -8 M-14 12 Q4 6 10 16" stroke="#8A867C" strokeWidth={3} fill="none" />
        {[-18, -6, 6].map((x) => <circle key={x} cx={x} cy={-32 + (x % 4)} r={4} fill="none" stroke={INK} strokeWidth={2.5} />)}
        <path d="M18 26 Q19 34 17 40 M-18 30 Q-17 38 -19 44" stroke="#C8C4B8" strokeWidth={4} strokeLinecap="round" />
      </g>
    );
    case 'utente': return ( // l'utente anonimo del forum: un puntatore
      <path d="M-14 -30 L-14 22 L-2 10 L8 32 L16 28 L6 6 L22 6 Z" fill={PAPER} {...o} />
    );
    case 'cassetta': return (
      <g>
        <rect x={-36} y={-22} width={72} height={44} rx={4} fill="#25283A" {...o} />
        <rect x={-26} y={-16} width={52} height={14} rx={2} fill="#E8E0C8" />
        <circle cx={-14} cy={10} r={7} fill="none" stroke="#E8E0C8" strokeWidth={2.5} />
        <circle cx={14} cy={10} r={7} fill="none" stroke="#E8E0C8" strokeWidth={2.5} />
      </g>
    );
    default: return null;
  }
};

/** Cerchio-personaggio (coordinate schermo). */
export const Nodo: React.FC<{
  T: number; t0: number; x: number; y: number; icon: string; name?: string; sub?: string; fade?: number; ring?: number; color?: string;
  dead?: number; ghost?: number; r?: number; shake?: number;
}> = ({ T, t0, x, y, icon, name, sub, fade = 1, ring = 0, color = PAPER, dead = 0, ghost = 0, r = 50, shake = 0 }) => {
  if (T < t0 || fade <= 0) return null;
  const k = pop(T, t0);
  const sx = shake * Math.sin(T * 47) * 5, sy = shake * Math.cos(T * 39) * 4;
  return (
    <g transform={`translate(${x + sx} ${y + sy})`} opacity={seg(T, t0, t0 + 0.15) * fade}>
      <g transform={`scale(${k})`}>
        {ring > 0 && <Glow id={`br-n${icon}`} x={0} y={0} r={r * 2.3} t={T} color={color === PAPER ? YEL : color} amp={0.1} rate={2.4} opacity={0.4 * Math.min(1, ring)} />}
        <circle r={r} fill={ghost > 0.5 ? '#5A564C' : '#241E10'} stroke={ghost > 0.5 ? COPY : ring > 0.5 ? YEL : color} strokeWidth={ring > 0.5 ? 6 : 4} />
        <circle r={r - 7} fill="none" stroke="#5A5030" strokeWidth={1.5} opacity={0.7} />
        <g transform={`scale(${r / 46})`} opacity={1 - 0.6 * dead}><Icona k={icon} T={T} /></g>
        {dead > 0 && <circle r={r} fill="#2A2A2A" opacity={0.6 * dead} />}
        {dead > 0.5 && <path d={`M${-r * 0.6} ${-r * 0.6} L${r * 0.6} ${r * 0.6} M${r * 0.6} ${-r * 0.6} L${-r * 0.6} ${r * 0.6}`} stroke={RED} strokeWidth={6} strokeLinecap="round" opacity={seg(dead, 0.5, 1)} />}
      </g>
      {name && <text y={r + 38} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={32} fill={dead > 0.5 ? '#9A9488' : PAPER} stroke={NIGHT} strokeWidth={7} paintOrder="stroke" opacity={seg(T, t0 + 0.2, t0 + 0.5)}>{name}</text>}
      {sub && <text y={r + 74} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={34} fill={YEL} stroke={NIGHT} strokeWidth={7} paintOrder="stroke" opacity={seg(T, t0 + 0.35, t0 + 0.7)}>{sub}</text>}
    </g>
  );
};

/** Cartellino pieno (coordinate schermo). */
export const Tag: React.FC<{ T: number; t0: number; x: number; y: number; text: string; bg?: string; fg?: string; size?: number; rot?: number; until?: number }> = ({
  T, t0, x, y, text, bg = YEL, fg = INK, size = 44, rot = 0, until = 1e9,
}) => {
  if (T < t0 || T > until + 0.5) return null;
  const w = tagW(text, size);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${pop(T, t0)})`} opacity={1 - seg(T, until, until + 0.5)}>
      <rect x={-w / 2 + 7} y={-size * 0.95 + 7} width={w} height={size * 1.6} rx={size * 0.3} fill="#000" opacity={0.35} />
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.6} rx={size * 0.3} fill={bg} stroke={INK} strokeWidth={3} />
      <text y={size * 0.33} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={size} fill={fg}>{text}</text>
    </g>
  );
};
export const tagW = (text: string, size: number) => text.length * size * 0.62 + size;

/** Cartello «LA REGOLA» / «TEORIA» / «COSA MOSTRA IL FILM» (coordinate schermo). */
export const Cartello: React.FC<{ T: number; t0: number; x: number; y: number; head: string; text: string; until?: number; color?: string }> = ({ T, t0, x, y, head, text, until = 1e9, color = YEL }) => {
  if (T < t0 || T > until + 0.5) return null;
  const w = cartW(text);
  return (
    <g transform={`translate(${x} ${y}) scale(${pop(T, t0)})`} opacity={1 - seg(T, until, until + 0.5)}>
      <rect x={-w / 2 + 8} y={-52} width={w} height={124} rx={18} fill="#000" opacity={0.35} />
      <rect x={-w / 2} y={-60} width={w} height={124} rx={18} fill={NIGHT} stroke={color} strokeWidth={5} />
      <rect x={-w / 2 + 24} y={-82} width={head.length * 19 + 36} height={42} rx={10} fill={color} />
      <text x={-w / 2 + 42} y={-52} fontFamily={SANS} fontWeight={900} fontSize={26} letterSpacing="3" fill={INK}>{head}</text>
      <text y={24} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={52} fill={PAPER}>{text}</text>
    </g>
  );
};
export const cartW = (text: string) => Math.max(text.length * 31 + 90, 360);

/** Anello rosso = il nodo da capire (coordinate schermo). */
export const Anello: React.FC<{ T: number; x: number; y: number; r: number; on: number }> = ({ T, x, y, r, on }) => {
  if (on <= 0) return null;
  const k = eob(Math.min(1, on), 1.6);
  return (
    <g opacity={Math.min(1, on)}>
      <circle cx={x} cy={y} r={r * k} fill="none" stroke={RED} strokeWidth={9} strokeDasharray={`${r * 0.5} ${r * 0.18}`} strokeDashoffset={-T * 40} />
      <circle cx={x} cy={y} r={r * k + 14} fill="none" stroke={RED} strokeWidth={2.5} opacity={0.5} />
    </g>
  );
};

/** Scritta a mano grande (coordinate schermo). */
export const ManoS: React.FC<{ T: number; t0: number; x: number; y: number; text: string; size?: number; color?: string; until?: number; rot?: number }> = ({
  T, t0, x, y, text, size = 80, color = YEL, until = 1e9, rot = 0,
}) => (T < t0 || T > until + 0.5 ? null : (
  <text x={x} y={y} textAnchor="middle" transform={rot ? `rotate(${rot} ${x} ${y})` : undefined} fontFamily={HAND} fontWeight={700} fontSize={size} fill={color} stroke={NIGHT} strokeWidth={size * 0.17} paintOrder="stroke"
    opacity={seg(T, t0, t0 + 0.4) * (1 - seg(T, until, until + 0.5))}>{text}</text>
));

export { ASYNC };
