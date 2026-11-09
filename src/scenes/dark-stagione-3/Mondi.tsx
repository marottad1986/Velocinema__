import React from 'react';
import { eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { HAND, SANS, STENCIL } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Glow, flashAt } from '../../lib/elements';
import { subtitleTimes } from '../../components/ChapterOverlay';
import type { SceneProps } from '../../types';
import film from '../../../films/dark-stagione-3.json';
import { BRASS, K, PocketWatch, RED, Raincoat, TINT, YELLOW } from '../dark-stagione-1/Winden';

// Dark, stagione 3 come schema (formato "spiegato"): i due mondi che nascono da uno solo. In basso il tronco, il mondo
// d'origine (Tannhaus, l'auto, il ponte); dove il tronco si divide, la macchina del tempo; i due rami salgono e racchiudono
// il mondo di Adam (gesso e giallo, a sinistra) e il mondo di Eva (blu, a destra), uguali come allo specchio. Tra i rami il
// nodo: un otto tratteggiato giallo con Jonas, Martha e al centro il loro bambino. Ogni personaggio è un cerchio con il suo
// oggetto (mai figure). Alla fine i rami si sciolgono in polvere e resta solo il tronco, che sale fino alla casa illuminata.
// Dietro, il quadrante di un orologio da taschino appena visibile. Coordinate = schermo (1080 × 1920).

const CHALK = '#E8E2D2';
const BLUE = '#5A9AE0';
const WARM = '#F2D9A0';
const F = [540, 1090] as const; // dove il tronco si divide: la macchina di Tannhaus
const N = {
  jonas: [300, 850], martha: [780, 850], bambino: [540, 790], adam: [260, 640], eva: [820, 640],
  fantasma: [660, 680], claudia: [540, 985], tannhaus: [330, 1290], incrocio: [540, 1330],
  casa: [540, 690], hannah: [720, 860],
} as const;
type P = readonly [number, number];

// rami: dal punto di divisione fino in cima (il disegno parte dall'alto, così si sciolgono dal basso)
const LEFT = `M160 580 L160 760 C160 940 300 1060 ${F[0]} ${F[1]}`;
const RIGHT = `M920 580 L920 760 C920 940 780 1060 ${F[0]} ${F[1]}`;
const TRUNK = `M${F[0]} 1440 L${F[0]} ${F[1]}`;
// il nodo: un otto con il centro sul bambino
const KNOT = 'M540 790 C540 690 240 700 240 790 C240 880 540 890 540 790 C540 690 840 700 840 790 C840 880 540 890 540 790';

// ---------------------------------------------------------------- tempi dal JSON, già sulla griglia della musica

const BEAT = 60 / (film.bpm ?? 66) / 2; // croma
const C0 = film.copertina.durata; // la griglia dello spartito parte dalla fine della copertina
const snap = (T: number) => C0 + Math.round((T - C0) / BEAT) * BEAT;
const STARTS: Record<string, number> = {};
const CUES: Record<string, number[]> = {};
{
  let acc = film.copertina.durata;
  for (const c of film.capitoli) {
    STARTS[c.id] = acc;
    CUES[c.id] = subtitleTimes(c.sottotitoli, c.durata).map(([a]) => a);
    acc += c.durata;
  }
}
/** Istante assoluto della frase `cue` del capitolo `ch`, più `d` secondi, arrotondato alla croma. */
export const at = (ch: string, cue: number, d = 0) => snap(STARTS[ch] + CUES[ch][cue] + d);
const end = (ch: string) => STARTS[ch] + film.capitoli.find((c) => c.id === ch)!.durata;
const pop = (T: number, t0: number) => eob(seg(T, t0, t0 + 0.45), 1.7);

// ---------------------------------------------------------------- camera

type Shot = { at: number; x: number; y: number; z: number };
const WIDE = { x: 540, y: 960, z: 0.8 };
const SHOTS: Shot[] = [
  // visibile sullo schermo: y da cy − 340/z a cy + 390/z (tra il titolo e i sottotitoli)
  { at: at('altromondo', 0), x: 540, y: 820, z: 1.1 },
  { at: at('eva', 0), x: 540, y: 790, z: 1.04 },
  { at: at('bambino', 0), x: 540, y: 800, z: 1.06 },
  { at: at('sfera', 0), x: 560, y: 790, z: 1.02 },
  { at: at('claudia', 0), x: 540, y: 900, z: 0.98 },
  { at: at('origine', 0), x: 540, y: 1080, z: 0.82 },
  { at: at('ponte', 0), x: 550, y: 1090, z: 0.84 },
  { at: at('svanire', 0), ...WIDE },
  { at: at('fine', 0), x: 560, y: 970, z: 0.86 },
  { at: at('fine', 2, 0.4), x: 550, y: 980, z: 0.84 },
];
const camAt = (T: number) => {
  let o = { x: SHOTS[0].x, y: SHOTS[0].y, z: SHOTS[0].z };
  for (const s of SHOTS.slice(1)) {
    const p = eio(seg(T, s.at - 0.2, s.at + 1.0));
    o = { x: lerp(o.x, s.x, p), y: lerp(o.y, s.y, p), z: lerp(o.z, s.z, p) };
  }
  return { x: o.x + Math.sin(T * 0.3) * 6, y: o.y + Math.cos(T * 0.25) * 4, z: o.z };
};

// ---------------------------------------------------------------- vocabolario (lo stesso delle stagioni 1 e 2)

const Node: React.FC<{ T: number; t0: number; p: P; name: string; sub?: string; ring?: number; side?: 'below' | 'right' | 'left' | 'above'; r?: number; fade?: number; stroke?: string; ringColor?: string; children?: React.ReactNode }> = ({
  T, t0, p, name, sub, ring = 0, side = 'below', r = 52, fade = 1, stroke, ringColor = YELLOW, children,
}) => {
  if (T < t0 || fade <= 0.001) return null;
  const s = pop(T, t0);
  const lx = side === 'right' ? r + 16 : side === 'left' ? -r - 16 : 0;
  const ly = side === 'below' ? r + 38 : side === 'above' ? -r - (sub ? 46 : 18) : 10;
  const anchor = side === 'right' ? 'start' : side === 'left' ? 'end' : 'middle';
  const k = Math.min(1, ring);
  return (
    <g transform={`translate(${p[0]} ${p[1]})`} opacity={seg(T, t0, t0 + 0.15) * fade}>
      <g transform={`scale(${s})`}>
        {k > 0 && <Glow id={`m3-g${p[0]}${p[1]}`} x={0} y={0} r={r * 2.4} t={T} color={ringColor} amp={0.1} rate={2.4} opacity={0.45 * k} />}
        <circle r={r + 6} fill="#000" opacity=".35" transform="translate(3 6)" />
        <circle r={r} fill="#22302B" stroke={k > 0.5 ? ringColor : stroke ?? CHALK} strokeWidth={k > 0.5 ? 6 : 4} />
        <clipPath id={`m3-c${p[0]}${p[1]}`}><circle r={r - 4} /></clipPath>
        <g clipPath={`url(#m3-c${p[0]}${p[1]})`}>{children}</g>
        <path d={`M${-r * 0.62} ${-r * 0.62} A${r * 0.88} ${r * 0.88} 0 0 1 ${r * 0.2} ${-r * 0.86}`} fill="none" stroke="#FFFFFF" strokeWidth="3" opacity=".25" strokeLinecap="round" />
      </g>
      {name && <text x={lx} y={ly} textAnchor={anchor} fontFamily={SANS} fontWeight={800} fontSize="28" fill={CHALK} opacity={seg(T, t0 + 0.2, t0 + 0.5)}>{name}</text>}
      {sub && <text x={lx} y={ly + 28} textAnchor={anchor} fontFamily={SANS} fontWeight={400} fontSize="21" fill="#A8B4AC" opacity={seg(T, t0 + 0.3, t0 + 0.6)}>{sub}</text>}
    </g>
  );
};

const Link: React.FC<{ T: number; t0: number; a: P; b: P; c?: P; color?: string; dashed?: boolean; label?: string; arrow?: boolean; w?: number; lx?: number; ly?: number; size?: number; fade?: number; flow?: boolean }> = ({
  T, t0, a, b, c, color = CHALK, dashed = false, label, arrow = false, w = 5, lx = 0, ly = 0, size = 30, fade = 1, flow = false,
}) => {
  if (T < t0 || fade <= 0.001) return null;
  const p = eo(seg(T, t0, t0 + 0.6));
  const [mx, my] = c ?? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const d = `M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`;
  const ang = (Math.atan2(b[1] - my, b[0] - mx) * 180) / Math.PI;
  const id = `m3-m${a[0]}${a[1]}${b[0]}${b[1]}`;
  return (
    <g opacity={fade}>
      {dashed ? (
        <>
          <mask id={id} maskUnits="userSpaceOnUse" x="-500" y="-500" width="2080" height="2920"><path d={d} fill="none" stroke="#fff" strokeWidth={w + 6} pathLength={1} strokeDasharray={`${p} 1`} /></mask>
          <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray="16 12" strokeDashoffset={flow ? -T * 40 : 0} strokeLinecap="round" mask={`url(#${id})`} />
        </>
      ) : (
        <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
      )}
      {arrow && p > 0.95 && <path d="M-18 -12 L0 0 L-18 12" fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${b[0]} ${b[1]}) rotate(${ang})`} />}
      {label && (
        <text x={0.25 * a[0] + 0.5 * mx + 0.25 * b[0] + lx} y={0.25 * a[1] + 0.5 * my + 0.25 * b[1] + ly} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={size}
          fill={color === CHALK ? '#D8D2C0' : color} opacity={seg(T, t0 + 0.35, t0 + 0.7)}>{label}</text>
      )}
    </g>
  );
};

const Tag: React.FC<{ T: number; t0: number; x: number; y: number; text: string; bg?: string; fg?: string; size?: number; rot?: number; until?: number; fade?: number }> = ({ T, t0, x, y, text, bg = YELLOW, fg = '#0B0F0E', size = 30, rot = 0, until = 1e9, fade = 1 }) => {
  if (T < t0 || T > until + 0.5 || fade <= 0.001) return null;
  const w = text.length * size * 0.56 + 36;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${pop(T, t0)})`} opacity={(1 - seg(T, until, until + 0.5)) * fade}>
      <rect x={-w / 2 + 4} y={-size * 0.95 + 6} width={w} height={size * 1.6} rx="10" fill="#000" opacity=".3" />
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.6} rx="10" fill={bg} />
      <text y={size * 0.33} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={size} fill={fg}>{text}</text>
    </g>
  );
};

/** Polvere luminosa che si alza da un punto mentre qualcosa svanisce. */
const Dust: React.FC<{ T: number; t0: number; x: number; y: number; color?: string; n?: number; spread?: number; seed?: number }> = ({ T, t0, x, y, color = CHALK, n = 16, spread = 60, seed = 1 }) => {
  const k = seg(T, t0, t0 + 1.8);
  if (k <= 0 || k >= 1) return null;
  const R = rng(seed + x * 7 + y);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const a = R() * Math.PI * 2, d = R() * spread, up = 60 + R() * 120, s = 2 + R() * 4;
        return <circle key={i} cx={x + Math.cos(a) * d * (0.4 + k)} cy={y + Math.sin(a) * d * 0.5 - up * eo(k)} r={s * (1 - k * 0.5)} fill={color} opacity={0.9 * (1 - k)} />;
      })}
    </g>
  );
};

// ---------------------------------------------------------------- oggetti dei personaggi (dentro i cerchi)

/** Gomitolo di filo blu: Martha dell'altro mondo (lo stesso della fine della stagione 2). */
const BlueYarn: React.FC<{ r?: number }> = ({ r = 28 }) => (
  <g>
    <circle r={r} fill={BLUE} stroke={K} strokeWidth="6" />
    {[-0.6, -0.2, 0.2, 0.6].map((k, i) => <path key={i} d={`M${-r * 0.9} ${k * r} Q0 ${k * r - r * 0.5} ${r * 0.9} ${k * r + r * 0.15}`} fill="none" stroke="#2A5A9A" strokeWidth="3" />)}
    <path d={`M${-r * 0.5} ${-r * 0.75} Q${-r * 0.1} ${-r * 0.2} ${r * 0.6} ${-r * 0.7}`} fill="none" stroke="#A8CCF4" strokeWidth="3" />
    <path d={`M${r * 0.7} ${r * 0.5} Q${r * 1.2} ${r} ${r * 0.9} ${r * 1.6}`} fill="none" stroke={BLUE} strokeWidth="3" />
  </g>
);
/** Lanterna accesa: Eva (la sua setta si chiama «sarà la luce»). */
const Lantern: React.FC<{ T: number }> = ({ T }) => {
  const fl = 0.85 + 0.15 * Math.sin(T * 9) * Math.sin(T * 3.7);
  return (
    <g>
      <circle cy="6" r="30" fill="#F6D47A" opacity={0.35 * fl} />
      <path d="M-8 -40 Q0 -50 8 -40" fill="none" stroke={K} strokeWidth="4" />
      <path d="M-20 -32 H20 L16 -24 H-16 Z" fill={BRASS} stroke={K} strokeWidth="3" />
      <rect x="-16" y="-24" width="32" height="44" rx="4" fill="#FFF1C0" fillOpacity={0.55 + 0.3 * fl} stroke={K} strokeWidth="4" />
      <path d={`M0 12 Q-7 0 0 ${-10 - 3 * fl} Q7 0 0 12 Z`} fill="#F2A33A" />
      <path d="M-6 -24 V20 M6 -24 V20" stroke={K} strokeWidth="2" opacity=".6" />
      <path d="M-22 20 H22 L18 28 H-18 Z" fill={BRASS} stroke={K} strokeWidth="3" />
    </g>
  );
};
/** Clessidra d'ottone: Adam (come nella stagione 2). */
const Hourglass: React.FC<{ T: number; scale?: number }> = ({ T, scale = 1 }) => {
  const sand = mod(T * 0.15, 1);
  return (
    <g transform={`scale(${scale})`}>
      <rect x="-46" y="-70" width="92" height="14" rx="4" fill="#C9A458" stroke="#000" strokeWidth="4" />
      <rect x="-46" y="56" width="92" height="14" rx="4" fill="#C9A458" stroke="#000" strokeWidth="4" />
      <path d="M-36 -56 Q-36 -10 -6 0 Q-36 10 -36 56 H36 Q36 10 6 0 Q36 -10 36 -56 Z" fill="#CFE6EE" fillOpacity=".35" stroke="#E8E2D2" strokeWidth="4" />
      <path d={`M-28 ${-50 + 40 * sand} Q0 ${-30 + 40 * sand} 28 ${-50 + 40 * sand} L6 -4 H-6 Z`} fill="#E8C878" />
      <path d={`M-30 54 Q0 ${54 - 40 * sand} 30 54 Z`} fill="#E8C878" />
      <path d="M0 -2 V50" stroke="#E8C878" strokeWidth="2" />
    </g>
  );
};
/** Scarpina da neonato: il bambino di Jonas e Martha. */
const Bootie: React.FC = () => (
  <g transform="translate(-2 6)">
    <path d="M-22 -22 Q-24 8 -20 14 Q-18 22 0 22 L22 22 Q32 20 30 10 Q28 2 14 0 L10 -22 Z" fill="#F2EEE4" stroke={K} strokeWidth="4" strokeLinejoin="round" />
    <path d="M-22 -22 Q-6 -30 10 -22" fill="none" stroke={K} strokeWidth="4" />
    <path d="M-20 -12 Q-6 -6 10 -12" fill="none" stroke="#9AB8E0" strokeWidth="4" />
    <path d="M-4 -10 l-8 -6 M-4 -10 l8 -6" stroke="#9AB8E0" strokeWidth="3" strokeLinecap="round" />
    <path d="M-18 18 H26" stroke="#C8C0AE" strokeWidth="3" />
  </g>
);
/** Quaderno di appunti con matita: Claudia. */
const Notebook: React.FC = () => (
  <g transform="rotate(-8)">
    <rect x="-26" y="-32" width="52" height="64" rx="4" fill="#8A3A30" stroke={K} strokeWidth="4" />
    <rect x="-20" y="-28" width="44" height="58" rx="3" fill="#F0E8D4" stroke={K} strokeWidth="2" />
    {[-16, -6, 4, 14].map((y) => <path key={y} d={`M-12 ${y} H18`} stroke="#8A9A94" strokeWidth="2" />)}
    <path d="M-10 -16 Q0 -26 10 -16 T 18 -14" fill="none" stroke="#2A3A34" strokeWidth="2" />
    {[-24, -12, 0, 12, 24].map((y) => <circle key={y} cx="-24" cy={y} r="3" fill="none" stroke={K} strokeWidth="2" />)}
    <path d="M14 30 L34 -20 L40 -18 L22 32 Z" fill={YELLOW} stroke={K} strokeWidth="3" />
  </g>
);
/** Culla di legno: Hannah nel mondo d'origine. */
const Cradle: React.FC<{ T: number }> = ({ T }) => (
  <g transform={`rotate(${Math.sin(T * 1.6) * 6} 0 26)`}>
    <path d="M-30 -4 Q-30 22 0 22 Q30 22 30 -4 Z" fill="#B07A44" stroke={K} strokeWidth="4" />
    <path d="M-30 -4 H30" stroke={K} strokeWidth="4" />
    <path d="M-16 -4 Q-24 -30 0 -30 Q8 -30 12 -24" fill="#C98E52" stroke={K} strokeWidth="4" />
    {[-14, -2, 10, 22].map((x) => <path key={x} d={`M${x} 0 V16`} stroke="#7A4E26" strokeWidth="3" />)}
    <path d="M-34 30 Q0 42 34 30" fill="none" stroke={K} strokeWidth="5" strokeLinecap="round" />
    <path d="M-6 -2 Q2 -10 16 -6" fill="none" stroke="#F2EEE4" strokeWidth="5" strokeLinecap="round" />
  </g>
);
/** Ingranaggio d'ottone: la macchina del tempo di Tannhaus. */
const Gear: React.FC<{ T: number; on: number; r?: number }> = ({ T, on, r = 34 }) => (
  <g transform={`rotate(${T * (10 + 140 * on)})`}>
    {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-7} y={-r - 12} width="14" height="18" rx="3" fill={BRASS} stroke={K} strokeWidth="3" transform={`rotate(${i * 36})`} />)}
    <circle r={r} fill={BRASS} stroke={K} strokeWidth="5" />
    <circle r={r * 0.45} fill="#6E5422" stroke={K} strokeWidth="4" />
    <circle r={r * 0.18} fill="#F2D48A" />
  </g>
);
/** Auto della famiglia di Tannhaus, vista di lato (0,0 = in basso al centro). */
const Car: React.FC<{ T: number; dir?: number; lights?: number }> = ({ T, dir = 1, lights = 1 }) => (
  <g transform={`scale(${dir} 1)`}>
    {lights > 0 && <path d="M52 -18 L150 -40 L150 6 Z" fill="#FFF1C0" opacity={0.28 * lights} />}
    <path d="M-56 -10 Q-58 -30 -40 -32 L-24 -52 Q-18 -58 -6 -58 L22 -58 Q34 -58 40 -46 L48 -32 Q58 -30 58 -14 L58 -6 H-56 Z" fill="#4A6A7A" stroke={K} strokeWidth="5" strokeLinejoin="round" />
    <path d="M-20 -34 L-10 -50 H8 V-34 Z M14 -34 V-50 H28 Q32 -50 36 -42 L40 -34 Z" fill="#CFE6EE" stroke={K} strokeWidth="3" />
    {[-32, 34].map((x) => (
      <g key={x} transform={`translate(${x} -4)`}>
        <circle r="13" fill="#1A1E1C" stroke={K} strokeWidth="4" />
        <path d="M-7 0 H7 M0 -7 V7" stroke="#8A9A94" strokeWidth="3" transform={`rotate(${T * 200})`} />
      </g>
    ))}
    <rect x="50" y="-24" width="8" height="8" rx="2" fill="#FFF1C0" />
  </g>
);
/** Ponte ad arco con il parapetto (0,0 = inizio del ponte, sul piano della strada). */
const Bridge: React.FC = () => (
  <g>
    <path d="M0 0 H210" stroke={CHALK} strokeWidth="6" />
    <path d="M0 0 Q105 -10 210 0 M0 40 Q105 -30 210 40" fill="none" stroke={CHALK} strokeWidth="5" />
    {[30, 60, 90, 120, 150, 180].map((x) => <path key={x} d={`M${x} ${-24 + Math.abs(x - 105) * 0.08} V0`} stroke={CHALK} strokeWidth="3" />)}
    <path d="M0 -24 Q105 -16 210 -24" fill="none" stroke={CHALK} strokeWidth="4" />
    {[0, 1, 2].map((k) => <path key={k} d={`M${20 + k * 70} 58 q20 -8 40 0`} fill="none" stroke="#5A7A88" strokeWidth="3" />)}
  </g>
);
/** Casa di campagna con le finestre accese (0,0 = centro della facciata). */
const House: React.FC<{ T: number; lit: number }> = ({ T, lit }) => (
  <g>
    {lit > 0 && <Glow id="m3-house" x={0} y={10} r={200} t={T} color={WARM} amp={0.06} rate={1.6} opacity={0.5 * lit} />}
    <path d="M-110 -10 L0 -96 L110 -10 Z" fill="#5A3A2A" stroke={K} strokeWidth="7" strokeLinejoin="round" />
    <rect x="-92" y="-14" width="184" height="104" fill="#3A4A44" stroke={K} strokeWidth="7" />
    <rect x="44" y="-110" width="24" height="46" fill="#4A3A2E" stroke={K} strokeWidth="5" />
    {[[-70, 12], [26, 12]].map(([x, y], i) => (
      <g key={i}>
        <rect x={x} y={y} width="44" height="40" fill={lit > 0.5 ? '#FFD98A' : '#1A2420'} stroke={K} strokeWidth="5" />
        <path d={`M${x + 22} ${y} V${y + 40} M${x} ${y + 20} H${x + 44}`} stroke={K} strokeWidth="3" />
      </g>
    ))}
    <rect x="-16" y="30" width="32" height="60" fill="#2A2018" stroke={K} strokeWidth="5" />
    <path d="M-104 -12 L0 -92 L40 -62" fill="none" stroke="#B07A5A" strokeWidth="3" opacity=".6" />
  </g>
);
/** Sfera nera che gira: la materia nera in cui Adam fa sparire Martha. */
const Sphere: React.FC<{ T: number; k: number }> = ({ T, k }) => (
  <g transform={`scale(${k})`}>
    <circle r="96" fill="#000" opacity=".35" />
    {[0, 1, 2].map((i) => <ellipse key={i} rx={88 - i * 14} ry={30 + i * 8} fill="none" stroke="#6A5A8A" strokeWidth="3" opacity={0.5 - i * 0.1} transform={`rotate(${T * (60 + i * 35) + i * 60})`} />)}
    <circle r="66" fill="#050607" stroke="#3A3446" strokeWidth="4" />
    <path d={`M-40 -20 Q0 ${-50 + Math.sin(T * 3) * 6} 40 -20`} fill="none" stroke="#4A4458" strokeWidth="3" />
  </g>
);

// ---------------------------------------------------------------- lo schema al tempo T

const r = rng(1971);
const MOTES = Array.from({ length: 22 }, () => ({ x: r() * 1080, y: r() * 1920, s: 1.5 + r() * 2.5, v: 5 + r() * 12, ph: r() * 6 }));
const RAIN = Array.from({ length: 26 }, () => ({ x: 340 + r() * 400, y: r() * 260, v: 260 + r() * 160 }));

const Schema: React.FC<{ T: number }> = ({ T }) => {
  const focus = (t0: number, t1: number) => seg(T, t0, t0 + 0.3) * (1 - seg(T, t1, t1 + 0.4));
  const off = (ch: string) => 1 - seg(T, end(ch) - 0.4, end(ch) + 0.3);
  // i due mondi svaniscono: prima i rami (dal basso), poi Jonas e Martha, poi tutti gli altri, Adam ed Eva per ultimi
  const tBr = at('svanire', 0, 0.3), tJM = at('svanire', 1, 0.2), tAll = at('svanire', 1, 1.6), tAE = end('svanire') - 0.9;
  const gone = (t0: number) => 1 - seg(T, t0, t0 + 0.8);
  // nel mondo d'origine (capitoli origine e ponte) la parte alta dello schema si spegne del tutto, per lasciare spazio al titolo
  const top = 1 - seg(T, at('origine', 0) - 0.3, at('origine', 0) + 0.3) * (1 - seg(T, at('svanire', 0) - 0.6, at('svanire', 0)));
  const branches = 1 - eio(seg(T, tBr, tBr + 2.2));
  const leftOn = eo(seg(T, at('altromondo', 0, 0.1), at('altromondo', 0, 1.1)));
  const rightOn = eo(seg(T, at('altromondo', 0, 0.9), at('altromondo', 0, 1.9)));
  const knot = eio(seg(T, at('eva', 2, 0.2), at('eva', 2, 1.6)));
  const trunk = eo(seg(T, at('claudia', 2, 0.5), at('claudia', 2, 1.5)));
  const trunkUp = eio(seg(T, at('fine', 0), at('fine', 0, 1.6))); // nel finale il tronco sale fino alla casa
  const split = seg(T, at('origine', 2, 0.3), at('origine', 2, 1.3)); // la luce sale dalla macchina lungo i due rami
  const machine = seg(T, at('origine', 1, 0.1), at('origine', 1, 0.6)) * (1 - seg(T, at('ponte', 2, 0.2), at('ponte', 2, 0.8)));
  const flash = flashAt(T, [at('origine', 2, 0.3)]);
  const sphere = eio(seg(T, at('sfera', 1, 0.1), at('sfera', 1, 0.9))) * (1 - eio(seg(T, at('sfera', 2, 0.6), at('sfera', 2, 1.4))));
  const lost = seg(T, at('sfera', 1, 0.6), at('sfera', 1, 1.2)); // il bambino non torna più
  const swallowed = lost * (1 - seg(T, at('ponte', 0, 0.2), at('ponte', 0, 0.6))); // Martha sì: Adam torna a prima

  const lit = seg(T, at('fine', 0, 1.2), at('fine', 0, 1.6));

  // auto: nell'incidente (origine) è sul ponte con la croce; il 1971 di Jonas e Martha la ferma prima e la fa tornare indietro
  const road = 1330;
  const carIn = seg(T, at('origine', 0, 0.2), at('origine', 0, 0.6));
  const drive = eio(seg(T, at('ponte', 1, 0.1), at('ponte', 1, 1.6)));
  const back = eio(seg(T, at('ponte', 2, 0.1), at('ponte', 2, 2.2)));
  const inPonte = T >= at('ponte', 0, 0.2);
  const carX = inPonte ? lerp(lerp(600, 668, drive), 590, back) : 748;
  const crossCar = !inPonte && T >= at('origine', 0, 0.9);

  return (
    <g>
      {/* i due mondi: rami, campiture appena accennate, il confine dello specchio al centro */}
      {leftOn > 0 && (
        <g opacity={branches}>
          <path d={`${LEFT} L${F[0]} 580 Z`} fill={CHALK} opacity={0.035 * leftOn} />
          <path d={`${RIGHT} L${F[0]} 580 Z`} fill={BLUE} opacity={0.06 * rightOn} />
          <path d={LEFT} fill="none" stroke={CHALK} strokeWidth="9" strokeLinecap="round" pathLength={1} strokeDasharray={`${leftOn * branches} 1`} />
          {rightOn > 0 && <path d={RIGHT} fill="none" stroke={BLUE} strokeWidth="9" strokeLinecap="round" pathLength={1} strokeDasharray={`${rightOn * branches} 1`} />}
          <path d={`M${F[0]} 580 V${F[1] - 40}`} stroke="#5E6E66" strokeWidth="3" strokeDasharray="6 14" opacity={rightOn * 0.8} />
          <text x="330" y="556" textAnchor="middle" fontFamily={STENCIL} fontWeight={800} fontSize="34" letterSpacing="3" fill="#B8C4BC" opacity={leftOn * top}>MONDO DI JONAS</text>
          <text x="750" y="556" textAnchor="middle" fontFamily={STENCIL} fontWeight={800} fontSize="34" letterSpacing="3" fill="#9CC0EC" opacity={rightOn * top}>L'ALTRO MONDO</text>
          {/* la luce che sale dalla macchina: il mondo che si spacca in due */}
          {split > 0 && split < 1 && (
            <>
              <path d={LEFT} fill="none" stroke="#FFF6D8" strokeWidth="14" strokeLinecap="round" pathLength={1} strokeDasharray="0.12 1" strokeDashoffset={-(0.88 - 0.88 * split)} opacity={0.9} />
              <path d={RIGHT} fill="none" stroke="#FFF6D8" strokeWidth="14" strokeLinecap="round" pathLength={1} strokeDasharray="0.12 1" strokeDashoffset={-(0.88 - 0.88 * split)} opacity={0.9} />
            </>
          )}
        </g>
      )}
      {[0.1, 0.35, 0.6, 0.85].map((k, i) => <Dust key={i} T={T} t0={tBr + k * 2} x={lerp(F[0] - 300, 160, k)} y={lerp(1040, 560, k)} n={10} seed={i} />)}
      {[0.1, 0.35, 0.6, 0.85].map((k, i) => <Dust key={`r${i}`} T={T} t0={tBr + k * 2} x={lerp(F[0] + 300, 920, k)} y={lerp(1040, 560, k)} color={BLUE} n={10} seed={i + 9} />)}

      {/* il tronco: il mondo d'origine */}
      {trunk > 0 && (
        <g>
          <path d={TRUNK} stroke={WARM} strokeWidth="11" strokeLinecap="round" pathLength={1} strokeDasharray={`${trunk} 1`} />
          {trunkUp > 0 && <path d={`M${F[0]} ${F[1]} V${lerp(F[1], N.casa[1] + 96, trunkUp)}`} stroke={WARM} strokeWidth="11" strokeLinecap="round" />}
          <text x="520" y="1436" textAnchor="end" fontFamily={STENCIL} fontWeight={800} fontSize="30" letterSpacing="3" fill={WARM} opacity={seg(T, at('origine', 0), at('origine', 0, 0.5)) * (1 - seg(T, at('fine', 0), at('fine', 0, 0.5)))}>MONDO D'ORIGINE</text>
        </g>
      )}

      {/* il nodo: un otto tratteggiato che lega i due mondi */}
      {knot > 0 && (
        <g opacity={gone(tAll) * (1 - 0.6 * swallowed)}>
          <mask id="m3-knot" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><path d={KNOT} fill="none" stroke="#fff" strokeWidth="16" pathLength={1} strokeDasharray={`${knot} 1`} /></mask>
          <path d={KNOT} fill="none" stroke={YELLOW} strokeWidth="7" strokeDasharray="18 12" strokeDashoffset={-T * 30} mask="url(#m3-knot)" />
        </g>
      )}
      <Tag T={T} t0={at('eva', 2, 0.9)} x={540} y={790} text="il nodo" size={26} rot={-2} until={end('eva') - 0.4} />

      {/* capitolo 1: Jonas portato nell'altro mondo, dove non è mai nato */}
      <Link T={T} t0={at('altromondo', 0, 1.6)} a={[N.jonas[0] + 56, N.jonas[1] + 10]} b={[N.martha[0] - 60, N.martha[1] + 14]} c={[540, 960]} color={YELLOW} dashed w={7} flow arrow label="nell'altro mondo" ly={56} size={28} fade={off('altromondo')} />
      {T >= at('altromondo', 1, 0.2) && (
        <g transform={`translate(${N.fantasma[0]} ${N.fantasma[1]})`} opacity={seg(T, at('altromondo', 1, 0.2), at('altromondo', 1, 0.6)) * off('altromondo')}>
          <circle r="42" fill="none" stroke="#9CC0EC" strokeWidth="4" strokeDasharray="10 8" />
          <text y="10" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="24" fill="#9CC0EC">Jonas</text>
          <path d="M-30 -30 L30 30" stroke={RED} strokeWidth="6" strokeLinecap="round" opacity={seg(T, at('altromondo', 1, 0.6), at('altromondo', 1, 0.9))} />
        </g>
      )}
      <Tag T={T} t0={at('altromondo', 1, 0.8)} x={N.fantasma[0] + 130} y={N.fantasma[1] + 10} text="mai nato" bg={CHALK} size={24} rot={3} until={end('altromondo') - 0.4} />
      <Tag T={T} t0={at('altromondo', 2, 0.2)} x={540} y={1050} text="la fine è vicina" bg={RED} fg="#FFFFFF" size={26} rot={-2} until={end('altromondo') - 0.4} />

      {/* capitolo 2: Eva e Adam, i due vecchi */}
      <Link T={T} t0={at('eva', 0, 0.5)} a={[N.martha[0] + 20, N.martha[1] - 54]} b={[N.eva[0] - 4, N.eva[1] + 56]} c={[830, 740]} color={BLUE} dashed w={5} flow arrow label="da vecchia" lx={-58} size={26} fade={gone(tAll) * off('eva')} />
      <Link T={T} t0={at('eva', 1, 0.5)} a={[N.jonas[0] - 20, N.jonas[1] - 54]} b={[N.adam[0] + 4, N.adam[1] + 56]} c={[250, 740]} color={YELLOW} dashed w={5} flow arrow label="da vecchio" lx={58} size={26} fade={gone(tAll) * off('eva')} />
      <Tag T={T} t0={at('eva', 2, 0.3)} x={320} y={1010} text="Adam: spezzarlo" bg={CHALK} size={24} rot={-3} until={end('eva') - 0.4} />
      <Tag T={T} t0={at('eva', 2, 1.1)} x={760} y={1010} text="Eva: tenerlo" bg={BLUE} fg="#FFFFFF" size={24} rot={3} until={end('eva') - 0.4} />

      {/* capitolo 3: il bambino al centro del nodo, antenato dei suoi stessi genitori */}
      <Link T={T} t0={at('bambino', 0, 0.2)} a={[N.jonas[0] + 50, N.jonas[1] + 30]} b={[N.martha[0] - 50, N.martha[1] + 30]} c={[540, 1010]} color="#E07060" dashed label="si amano" ly={34} size={28} fade={gone(tJM) * off('bambino')} />
      <Link T={T} t0={at('bambino', 1, 0.4)} a={[N.bambino[0] - 46, N.bambino[1] + 4]} b={[N.jonas[0] + 54, N.jonas[1] - 6]} c={[410, 790]} color={RED} w={7} arrow fade={off('bambino')} />
      <Link T={T} t0={at('bambino', 1, 0.7)} a={[N.bambino[0] + 46, N.bambino[1] + 4]} b={[N.martha[0] - 54, N.martha[1] - 6]} c={[670, 790]} color={RED} w={7} arrow fade={off('bambino')} />
      <Tag T={T} t0={at('bambino', 1, 1.2)} x={540} y={915} text="antenato di tutti e due" bg={RED} fg="#FFFFFF" size={24} rot={-2} until={end('bambino') - 0.4} />
      <Link T={T} t0={at('bambino', 2, 0.2)} a={[N.eva[0], N.eva[1] + 56]} b={[N.bambino[0] + 50, N.bambino[1] - 26]} c={[720, 760]} color={BLUE} w={6} arrow label="lo protegge" lx={60} ly={10} size={26} fade={off('bambino')} />

      {/* capitolo 4: la sfera nera di Adam */}
      <Link T={T} t0={at('sfera', 0, 0.3)} a={[N.adam[0], N.adam[1] + 56]} b={[N.bambino[0] - 50, N.bambino[1] - 30]} c={[330, 760]} color={RED} w={7} arrow fade={off('sfera')} />
      {sphere > 0 && <g transform={`translate(${(N.martha[0] + N.bambino[0]) / 2 + 20} ${N.bambino[1] + 30})`}><Sphere T={T} k={sphere} /></g>}
      <Tag T={T} t0={at('sfera', 2, 0.3)} x={540} y={960} text="non funziona" bg={RED} fg="#FFFFFF" size={26} rot={-3} until={end('sfera') - 0.4} />

      {/* capitolo 5: Claudia fa la spola tra i due mondi e trova il terzo */}
      <Link T={T} t0={at('claudia', 0, 0.6)} a={[N.claudia[0] - 60, N.claudia[1] - 10]} b={[300, 1000]} c={[420, 940]} color={CHALK} dashed w={4} flow arrow fade={off('claudia')} />
      <Link T={T} t0={at('claudia', 0, 1.0)} a={[N.claudia[0] + 60, N.claudia[1] - 10]} b={[780, 1000]} c={[660, 940]} color={BLUE} dashed w={4} flow arrow fade={off('claudia')} />
      <Tag T={T} t0={at('claudia', 1, 0.2)} x={N.claudia[0] + 230} y={N.claudia[1] + 62} text="salvare Regina" bg={CHALK} size={24} rot={2} until={end('claudia') - 0.4} />
      <Link T={T} t0={at('claudia', 2, 0.1)} a={[N.claudia[0] + 56, N.claudia[1]]} b={[F[0] + 16, 1160]} c={[700, 1080]} color={WARM} dashed w={5} flow arrow fade={off('claudia')} />
      <Tag T={T} t0={at('claudia', 2, 1.0)} x={330} y={1180} text="un terzo mondo" size={28} rot={-3} until={end('claudia') - 0.4} />

      {/* capitolo 6: Tannhaus, l'incidente, la macchina che spacca il mondo */}
      {T >= at('origine', 0, 0.2) && T < at('svanire', 0) && (
        <g opacity={carIn * (1 - seg(T, end('ponte') - 0.4, end('ponte')))}>
          <path d={`M${F[0]} ${road} H${N.incrocio[0] + 130}`} stroke="#6A7A74" strokeWidth="5" />
          <g transform={`translate(${N.incrocio[0] + 130} ${road})`}><Bridge /></g>
          <g transform={`translate(${carX} ${road}) rotate(${!inPonte ? 10 : 0})`}><Car T={inPonte && drive > 0 && drive < 1 ? T : 0} dir={back > 0 ? -1 : 1} lights={crossCar ? 0.3 : 1} /></g>
          {crossCar && <g transform={`translate(752 ${road - 30}) scale(${pop(T, at('origine', 0, 0.9))})`}><path d="M-30 -30 L30 30 M30 -30 L-30 30" stroke={RED} strokeWidth="11" strokeLinecap="round" /></g>}
        </g>
      )}
      <Tag T={T} t0={at('origine', 0, 1.3)} x={800} y={1240} text="un incidente" bg={RED} fg="#FFFFFF" size={24} rot={-2} until={end('origine') - 0.4} />
      {machine > 0 && <g transform={`translate(${F[0]} ${F[1]})`} opacity={machine}><Glow id="m3-mac" x={0} y={0} r={130} t={T} color={WARM} amp={0.12} rate={4} opacity={0.5 + 0.5 * flash} /><Gear T={T} on={split} /></g>}
      {T >= at('ponte', 2, 0.2) && T < at('svanire', 0, 0.3) && (
        <g transform={`translate(${F[0]} ${F[1]}) scale(${pop(T, at('ponte', 2, 0.2))})`} opacity={1 - seg(T, at('svanire', 0), at('svanire', 0, 0.3))}>
          <Gear T={0} on={0} />
          <path d="M-40 -40 L40 40 M40 -40 L-40 40" stroke={RED} strokeWidth="10" strokeLinecap="round" />
        </g>
      )}
      <Tag T={T} t0={at('origine', 1, 0.4)} x={F[0] + 190} y={F[1] + 10} text="la macchina" size={26} rot={2} until={at('origine', 2, 0.2)} />
      <Tag T={T} t0={at('origine', 2, 1.2)} x={F[0]} y={990} text="il mondo si spacca in due" bg={CHALK} size={26} rot={-2} until={end('origine') - 0.4} />
      <Tag T={T} t0={at('ponte', 2, 0.9)} x={F[0] + 210} y={F[1] - 30} text="mai costruita" bg={RED} fg="#FFFFFF" size={26} rot={3} until={end('ponte') - 0.4} />

      {/* capitolo 7: Jonas e Martha scendono nel mondo d'origine e fermano l'auto prima del ponte */}
      <Link T={T} t0={at('ponte', 0, 0.3)} a={[N.jonas[0] + 30, N.jonas[1] + 52]} b={[N.incrocio[0] + 60, road - 52]} c={[340, 1200]} color={YELLOW} dashed w={6} flow arrow fade={off('ponte')} />
      <Link T={T} t0={at('ponte', 0, 0.6)} a={[N.martha[0] - 30, N.martha[1] + 52]} b={[N.incrocio[0] + 100, road - 60]} c={[800, 1120]} color={BLUE} dashed w={6} flow arrow fade={off('ponte')} />
      {T >= at('ponte', 1, 0.6) && T < end('ponte') && (
        <g transform={`translate(${N.incrocio[0] + 116} ${road - 26})`} opacity={seg(T, at('ponte', 1, 0.6), at('ponte', 1, 0.9)) * off('ponte')}>
          <rect x="-8" y="-44" width="16" height="44" fill={CHALK} />
          <path d="M-28 -64 L28 -64 L0 -100 Z" fill={YELLOW} stroke={K} strokeWidth="4" strokeLinejoin="round" />
          <text y="-70" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="22" fill={K}>!</text>
        </g>
      )}
      <Tag T={T} t0={at('ponte', 1, 0.2)} x={330} y={1180} text="8 novembre 1971" bg={WARM} size={28} rot={-3} until={end('ponte') - 0.4} />
      <Tag T={T} t0={at('ponte', 2, 1.6)} x={720} y={1420} text="tornano indietro" bg={CHALK} size={22} rot={2} until={end('ponte') - 0.4} />

      {/* capitolo 8: Adam ed Eva fanno pace prima di sparire */}
      <Tag T={T} t0={at('svanire', 0, 1.2)} x={540} y={820} text="mai esistiti" bg={RED} fg="#FFFFFF" size={34} rot={-3} until={end('svanire') - 0.4} />
      <Link T={T} t0={at('svanire', 2, 0.2)} a={[N.adam[0], N.adam[1] - 56]} b={[N.eva[0], N.eva[1] - 56]} c={[540, 520]} color="#FFFFFF" w={5} label="fanno pace" ly={-14} size={38} fade={gone(tAE)} />

      {/* capitolo 9: il mondo d'origine, la casa illuminata, Hannah */}
      {trunkUp > 0 && (
        <g transform={`translate(${N.casa[0]} ${N.casa[1]})`} opacity={seg(T, at('fine', 0, 1.0), at('fine', 0, 1.4))}>
          {RAIN.map((d, i) => <path key={i} d={`M${d.x - 540} ${mod(d.y + T * d.v, 200) - 120} l-6 22`} stroke="#9AB0B8" strokeWidth="2.5" opacity=".55" />)}
          <g transform="scale(1.4)"><House T={T} lit={lit} /></g>
        </g>
      )}
      <Tag T={T} t0={at('fine', 0, 1.6)} x={N.casa[0] - 270} y={N.casa[1] + 60} text="Regina è viva" bg={WARM} size={26} rot={-3} />
      <Link T={T} t0={at('fine', 1, 0.3)} a={[F[0] + 8, 900]} b={[N.hannah[0] - 56, N.hannah[1] + 10]} c={[640, 900]} color={WARM} w={5} />
      <Node T={T} t0={at('fine', 1, 0.2)} p={N.hannah} name="Hannah" sub="nel mondo d'origine" side="right" ring={focus(at('fine', 1, 0.2), end('fine'))} ringColor={WARM}><Cradle T={T} /></Node>
      {T >= at('fine', 2, 0.5) && (
        <text x={N.hannah[0] + 20} y={N.hannah[1] + 120} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="58" fill={YELLOW} transform={`rotate(-5 ${N.hannah[0]} ${N.hannah[1] + 110})`}
          opacity={seg(T, at('fine', 2, 0.5), at('fine', 2, 1.0))}>Jonas?</text>
      )}

      {/* nodi dei due mondi */}
      <Node T={T} t0={at('altromondo', 0, 0.3)} p={N.jonas} name="Jonas" side="below" fade={gone(tJM)} ring={focus(at('altromondo', 0), at('altromondo', 1)) + focus(at('ponte', 0), at('ponte', 2))}>
        <g transform="translate(0 -40)"><Raincoat id="m3-rc" t={T} scale={0.22} wind={0.3} wet={false} /></g>
      </Node>
      <Node T={T} t0={at('altromondo', 0, 1.3)} p={N.martha} name="Martha" side="below" stroke={BLUE} ringColor={BLUE} fade={gone(tJM) * (1 - swallowed)}
        ring={focus(at('altromondo', 0, 1.3), at('altromondo', 1)) + focus(at('bambino', 0), at('bambino', 1)) + focus(at('ponte', 0, 0.4), at('ponte', 2))}>
        <BlueYarn />
      </Node>
      <Node T={T} t0={at('eva', 0, 0.2)} p={N.eva} name="Eva" sub="Martha da vecchia" side="left" stroke={BLUE} ringColor={BLUE} fade={gone(tAE) * top} ring={focus(at('eva', 0), at('eva', 1)) + focus(at('bambino', 2), end('bambino')) + focus(at('svanire', 2), end('svanire'))}>
        <Lantern T={T} />
      </Node>
      <Node T={T} t0={at('eva', 1, 0.2)} p={N.adam} name="Adam" sub="Jonas da vecchio" side="right" fade={gone(tAE) * top} ring={focus(at('eva', 1), at('eva', 2)) + focus(at('sfera', 0), end('sfera')) + focus(at('svanire', 2), end('svanire'))}>
        <Hourglass T={T} scale={0.55} />
      </Node>
      <Node T={T} t0={at('bambino', 0, 1.2)} p={N.bambino} name="" r={44} fade={gone(tJM) * (1 - lost)} ring={focus(at('bambino', 0, 1.2), end('bambino') - 0.5)}><Bootie /></Node>
      {T >= at('bambino', 0, 1.4) && <text x={N.bambino[0]} y={N.bambino[1] - 60} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="24" fill={CHALK} opacity={seg(T, at('bambino', 0, 1.4), at('bambino', 0, 1.8)) * gone(tJM) * (1 - lost)}>il bambino</text>}
      <Node T={T} t0={at('claudia', 0, 0.1)} p={N.claudia} name="Claudia" sub="viaggiatrice del tempo" side="below" fade={off('claudia')} ring={focus(at('claudia', 0), end('claudia') - 0.4)}><Notebook /></Node>
      <Node T={T} t0={at('origine', 0, 0.1)} p={N.tannhaus} name="Tannhaus" sub="l'orologiaio" side="left" ring={focus(at('origine', 0), at('origine', 2)) + focus(at('ponte', 2, 0.3), end('ponte'))} ringColor={WARM}
        >
        <PocketWatch t={T} scale={0.5} />
      </Node>

      {/* polvere: Jonas, Martha e il bambino, poi gli altri, poi Adam ed Eva */}
      <Dust T={T} t0={tJM} x={N.jonas[0]} y={N.jonas[1]} color={YELLOW} n={22} />
      <Dust T={T} t0={tJM} x={N.martha[0]} y={N.martha[1]} color={BLUE} n={22} />
      <Dust T={T} t0={tAll} x={540} y={790} color={YELLOW} n={30} spread={260} />
      <Dust T={T} t0={tAE} x={N.adam[0]} y={N.adam[1]} n={22} />
      <Dust T={T} t0={tAE} x={N.eva[0]} y={N.eva[1]} color={BLUE} n={22} />
      {flash > 0 && <circle cx={F[0]} cy={F[1]} r={400} fill="#FFF6D8" opacity={0.35 * flash} />}
    </g>
  );
};

export const makeMondi = (chapterId: string): React.FC<SceneProps> => {
  const Scene: React.FC<SceneProps> = ({ t }) => {
    const T = STARTS[chapterId] + t;
    const c = camAt(T);
    const hand = (T / 60) * 360;
    return (
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id="m3" />
          <linearGradient id="m3-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0C110F" /><stop offset=".8" stopColor="#0C110F" stopOpacity=".92" /><stop offset="1" stopColor="#0C110F" stopOpacity="0" /></linearGradient>
          <radialGradient id="m3-bg" cx=".5" cy=".46" r=".75">
            <stop offset="0" stopColor="#22302B" />
            <stop offset=".6" stopColor="#141B18" />
            <stop offset="1" stopColor="#080B0A" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#m3-bg)" />
        {/* quadrante dell'orologio di Tannhaus, appena visibile dietro lo schema */}
        <g transform="translate(540 880)" opacity=".08">
          <circle r="470" fill="none" stroke={CHALK} strokeWidth="8" />
          <circle r="440" fill="none" stroke={CHALK} strokeWidth="3" />
          {Array.from({ length: 60 }, (_, i) => <path key={i} d={`M0 -440 V${i % 5 ? -425 : -400}`} stroke={CHALK} strokeWidth={i % 5 ? 3 : 8} transform={`rotate(${i * 6})`} />)}
          <path d="M0 30 V-300" stroke={CHALK} strokeWidth="12" strokeLinecap="round" transform={`rotate(${hand / 12 + 200})`} />
          <path d="M0 40 V-400" stroke={CHALK} strokeWidth="6" strokeLinecap="round" transform={`rotate(${hand})`} />
          <circle r="16" fill={CHALK} />
        </g>
        <g transform={`translate(540 860) scale(${c.z}) translate(${-c.x} ${-c.y})`}>
          <Schema T={T} />
        </g>
        <rect width="1080" height="470" fill="url(#m3-top)" />
        {MOTES.map((m, i) => (
          <circle key={i} cx={mod(m.x + Math.sin(T * 0.5 + m.ph) * 30, 1080)} cy={mod(m.y - T * m.v, 1920)} r={m.s} fill={CHALK} opacity={0.12 + 0.08 * Math.sin(T * 2 + m.ph)} />
        ))}
        <Finish id="m3" tint={TINT} tintOpacity={0.08} />
      </svg>
    );
  };
  return Scene;
};
