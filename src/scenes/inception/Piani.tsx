import React from 'react';
import { eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { HAND, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Glow } from '../../lib/elements';
import { subtitleTimes } from '../../components/ChapterOverlay';
import type { SceneProps } from '../../types';
import film from '../../../films/inception.json';

// Inception come schema (formato "spiegato"): la torre dei sogni disegnata come una cianografia, il progetto di un
// architetto su carta blu, perché nel film i sogni si progettano. Ogni livello è un piano dell'edificio (realtà in alto,
// poi sogno 1 città, sogno 2 albergo, sogno 3 fortezza, in fondo il limbo); a destra un orologio per piano che dice quanto
// dura il tempo lì. I personaggi sono cerchi con il loro oggetto (mai figure): Cobb = trottola, Saito = valigetta,
// Fischer = girandola, il padre = cassaforte, Mal = fede nuziale. L'idea da piantare è un seme arancione.
// Lo schema si costruisce frase dopo frase; ogni capitolo è la stessa torre in un altro momento. Coordinate = schermo.

export const INK = '#E8EEF4';
export const ORANGE = '#E39A3B';
const RED = '#E0605A';
const DIM = '#7E9AB4';
const BAND_X0 = 70, BAND_X1 = 790, CLOCK_X = 915;
type P = readonly [number, number];
const ROWS = [
  { key: 'realta', y: 525, h: 130, name: 'REALTÀ', sub: 'in aereo' },
  { key: 'p1', y: 678, h: 130, name: 'SOGNO 1', sub: 'città sotto la pioggia' },
  { key: 'p2', y: 831, h: 130, name: 'SOGNO 2', sub: 'un albergo' },
  { key: 'p3', y: 984, h: 130, name: 'SOGNO 3', sub: 'fortezza nella neve' },
  { key: 'limbo', y: 1152, h: 160, name: 'LIMBO', sub: 'il piano più in fondo' },
] as const;
const RY = Object.fromEntries(ROWS.map((r) => [r.key, r.y])) as Record<(typeof ROWS)[number]['key'], number>;
const N = {
  cobb: [240, RY.realta], saito: [400, RY.realta], fischer: [560, RY.realta], trottola: [715, RY.realta],
  padre: [380, RY.p3], fischer3: [560, RY.p3], mal: [620, RY.limbo], saitoVecchio: [270, RY.limbo], cobbLimbo: [410, RY.limbo],
} as const;

// ---------------------------------------------------------------- tempi dal JSON

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
const at = (ch: string, cue: number, d = 0) => STARTS[ch] + CUES[ch][cue] + d;
const end = (ch: string) => STARTS[ch] + film.capitoli.find((c) => c.id === ch)!.durata;
const pop = (T: number, t0: number) => eob(seg(T, t0, t0 + 0.45), 1.7);

// ---------------------------------------------------------------- camera

type Shot = { at: number; x: number; y: number; z: number };
const WIDE = { x: 555, y: 845, z: 1 };
const SHOTS: Shot[] = [
  { at: at('estrazione', 0), x: 330, y: 610, z: 1.4 },
  { at: at('estrazione', 1), x: 400, y: 630, z: 1.2 },
  { at: at('estrazione', 2), x: 640, y: 570, z: 1.4 },
  { at: at('innesto', 0), x: 430, y: 570, z: 1.3 },
  { at: at('innesto', 2), x: 520, y: 590, z: 1.2 },
  { at: at('livelli', 0), x: 520, y: 610, z: 1.2 },
  { at: at('livelli', 2), x: 480, y: 800, z: 1.0 },
  { at: at('tempo', 0), x: 760, y: 580, z: 1.25 },
  { at: at('tempo', 2), x: 760, y: 790, z: 1.0 },
  { at: at('calcio', 0), x: 600, y: 790, z: 1.0 },
  { at: at('limbo', 0), x: 420, y: 640, z: 1.2 },
  { at: at('limbo', 2), x: 520, y: 850, z: 1.0 },
  { at: at('mal', 0), x: 480, y: 1020, z: 1.15 },
  { at: at('mal', 3), x: 470, y: 850, z: 1.0 },
  { at: at('missione', 0), x: 520, y: 960, z: 1.05 },
  { at: at('missione', 2), x: 470, y: 940, z: 1.15 },
  { at: at('trottola', 0), x: 460, y: 850, z: 1.0 },
  { at: at('trottola', 2), x: 700, y: 570, z: 1.55 },
  { at: at('trottola', 3, 0.6), ...WIDE },
];
const camAt = (T: number) => {
  let o = { x: SHOTS[0].x, y: SHOTS[0].y, z: SHOTS[0].z };
  for (const s of SHOTS.slice(1)) {
    const p = eio(seg(T, s.at - 0.2, s.at + 1.0));
    o = { x: lerp(o.x, s.x, p), y: lerp(o.y, s.y, p), z: lerp(o.z, s.z, p) };
  }
  return { x: o.x + Math.sin(T * 0.3) * 5, y: o.y + Math.cos(T * 0.25) * 4, z: o.z };
};

// ---------------------------------------------------------------- oggetti dei personaggi (linee bianche da cianografia)

/** Trottola di metallo: `spin` in giri al secondo, `wobble` 0..1 la fa vacillare. */
export const Top: React.FC<{ T: number; spin?: number; wobble?: number; s?: number }> = ({ T, spin = 1.5, wobble = 0, s = 1 }) => {
  const tilt = wobble * 14 * Math.sin(T * 7);
  const ph = mod(T * spin, 1);
  return (
    <g transform={`scale(${s}) rotate(${tilt} 0 34)`}>
      <path d="M0 -40 V-24" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M-30 -18 Q0 -30 30 -18 L4 32 Q0 38 -4 32 Z" fill="#9AA8B4" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <ellipse cx="0" cy="-18" rx="30" ry="7" fill="#C9D3DC" stroke={INK} strokeWidth="3" />
      {[0, 1, 2].map((k) => {
        const x = Math.sin((ph + k / 3) * Math.PI * 2) * 26;
        return <path key={k} d={`M${x} -16 L${x * 0.15} 26`} stroke={ORANGE} strokeWidth="3" opacity={0.4 + 0.6 * Math.cos((ph + k / 3) * Math.PI * 2) ** 2} />;
      })}
    </g>
  );
};
const Briefcase = () => (
  <g fill="none" stroke={INK} strokeWidth="4" strokeLinejoin="round">
    <rect x="-28" y="-14" width="56" height="36" rx="5" fill="#2A4A6A" />
    <path d="M-10 -14 V-22 H10 V-14 M-28 2 H28" />
  </g>
);
export const Pinwheel: React.FC<{ T: number; s?: number }> = ({ T, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M0 0 V40" stroke={INK} strokeWidth="4" />
    <g transform={`rotate(${T * 90})`}>
      {[0, 90, 180, 270].map((a) => <path key={a} d="M0 0 L0 -26 Q16 -20 0 0 Z" fill={a % 180 ? '#3E6A9A' : '#C9D3DC'} stroke={INK} strokeWidth="2.5" transform={`rotate(${a})`} />)}
    </g>
    <circle r="4" fill={INK} />
  </g>
);
const Safe: React.FC<{ open?: number }> = ({ open = 0 }) => (
  <g stroke={INK} strokeWidth="4" strokeLinejoin="round">
    <rect x="-28" y="-26" width="56" height="52" rx="4" fill="#24405C" />
    {open > 0 && <rect x="-22" y="-20" width="44" height="40" fill="#FFE2B0" opacity={0.85 * open} stroke="none" />}
    <g transform={`translate(-22 0) scale(${1 - open * 0.85} 1) translate(22 0)`}>
      <rect x="-22" y="-20" width="44" height="40" fill="#2E5070" />
      <circle cx="0" cy="0" r="9" fill="none" />
      <path d="M0 -9 V0 L6 4" fill="none" />
    </g>
  </g>
);
const Ring = () => (
  <g fill="none">
    <ellipse cx="0" cy="4" rx="22" ry="16" stroke={INK} strokeWidth="7" />
    <ellipse cx="0" cy="4" rx="22" ry="16" stroke="#F2D48A" strokeWidth="3" />
    <path d="M-6 -12 L0 -20 L6 -12" stroke={INK} strokeWidth="3" />
  </g>
);
/** Il seme dell'idea: arancione, con un piccolo germoglio. */
const Seed: React.FC<{ T: number; grow?: number; s?: number }> = ({ T, grow = 0, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <Glow id={`in-seed${Math.round(s * 100)}`} x={0} y={0} r={46} t={T} color={ORANGE} amp={0.12} rate={3} opacity={0.6} />
    <ellipse rx="12" ry="16" fill={ORANGE} stroke={INK} strokeWidth="3" />
    {grow > 0 && <path d={`M0 -14 Q${-10 * grow} ${-30 * grow} ${-18 * grow} ${-34 * grow} M0 -14 Q${8 * grow} ${-24 * grow} ${16 * grow} ${-28 * grow}`} fill="none" stroke="#9BD48A" strokeWidth="4" strokeLinecap="round" />}
  </g>
);
const Cloud = () => <path d="M-60 20 Q-80 20 -76 0 Q-74 -22 -48 -20 Q-40 -44 -10 -40 Q14 -54 34 -34 Q66 -38 66 -10 Q84 -2 74 18 Q70 26 56 24 Z" fill="#1E3A56" stroke={INK} strokeWidth="4" />;
const Clock: React.FC<{ T: number; speed: number }> = ({ T, speed }) => (
  <g>
    <circle r="26" fill="#18324C" stroke={INK} strokeWidth="3.5" />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 -22 V-18" stroke={INK} strokeWidth="2" transform={`rotate(${i * 30})`} />)}
    <path d="M0 0 V-17" stroke={ORANGE} strokeWidth="3" strokeLinecap="round" transform={`rotate(${T * speed * 360})`} />
    <path d="M0 0 V-11" stroke={INK} strokeWidth="3" strokeLinecap="round" transform={`rotate(${T * speed * 30})`} />
    <circle r="3" fill={INK} />
  </g>
);

// ---------------------------------------------------------------- elementi dello schema

const Node: React.FC<{ T: number; t0: number; p: P; name: string; sub?: string; ring?: number; r?: number; fade?: number; red?: boolean; side?: 'below' | 'above'; children?: React.ReactNode }> = ({
  T, t0, p, name, sub, ring = 0, r = 40, fade = 1, red = false, side = 'below', children,
}) => {
  if (T < t0 || fade <= 0) return null;
  const s = pop(T, t0);
  const ly = side === 'below' ? r + 30 : -r - 34;
  return (
    <g transform={`translate(${p[0]} ${p[1]})`} opacity={seg(T, t0, t0 + 0.15) * fade}>
      <g transform={`scale(${s})`}>
        {ring > 0 && <Glow id={`in-g${p[0]}${p[1]}`} x={0} y={0} r={r * 2.4} t={T} color={red ? RED : ORANGE} amp={0.1} rate={2.4} opacity={0.45 * Math.min(1, ring)} />}
        <circle r={r} fill="#14304A" stroke={ring > 0.5 ? (red ? RED : ORANGE) : red ? RED : INK} strokeWidth={ring > 0.5 ? 5 : 3.5} />
        {children}
      </g>
      <text y={ly} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="25" fill={INK} opacity={seg(T, t0 + 0.2, t0 + 0.5)}>{name}</text>
      {sub && <text y={ly + 24} textAnchor="middle" fontFamily={SANS} fontWeight={400} fontSize="19" fill={DIM} opacity={seg(T, t0 + 0.3, t0 + 0.6)}>{sub}</text>}
    </g>
  );
};

const Link: React.FC<{ T: number; t0: number; a: P; b: P; c?: P; color?: string; dashed?: boolean; label?: string; arrow?: boolean; w?: number; lx?: number; ly?: number; size?: number; fade?: number; flow?: boolean }> = ({
  T, t0, a, b, c, color = INK, dashed = false, label, arrow = false, w = 4, lx = 0, ly = 0, size = 30, fade = 1, flow = false,
}) => {
  if (T < t0 || fade <= 0) return null;
  const p = eo(seg(T, t0, t0 + 0.6));
  const [mx, my] = c ?? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const d = `M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`;
  const ang = (Math.atan2(b[1] - my, b[0] - mx) * 180) / Math.PI;
  const id = `in-m${a[0]}${a[1]}${b[0]}${b[1]}`;
  return (
    <g opacity={fade}>
      {dashed ? (
        <>
          <mask id={id} maskUnits="userSpaceOnUse" x="-500" y="-500" width="2080" height="2920"><path d={d} fill="none" stroke="#fff" strokeWidth={w + 6} pathLength={1} strokeDasharray={`${p} 1`} /></mask>
          <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray="14 10" strokeDashoffset={flow ? -T * 40 : 0} strokeLinecap="round" mask={`url(#${id})`} />
        </>
      ) : (
        <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} />
      )}
      {arrow && p > 0.95 && <path d="M-16 -11 L0 0 L-16 11" fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${b[0]} ${b[1]}) rotate(${ang})`} />}
      {label && (
        <text x={0.25 * a[0] + 0.5 * mx + 0.25 * b[0] + lx} y={0.25 * a[1] + 0.5 * my + 0.25 * b[1] + ly} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={size}
          fill={color} opacity={seg(T, t0 + 0.35, t0 + 0.7)}>{label}</text>
      )}
    </g>
  );
};

const Tag: React.FC<{ T: number; t0: number; x: number; y: number; text: string; bg?: string; fg?: string; size?: number; rot?: number; until?: number }> = ({
  T, t0, x, y, text, bg = ORANGE, fg = '#0B1016', size = 26, rot = 0, until = 1e9,
}) => {
  if (T < t0 || T > until + 0.5) return null;
  const w = text.length * size * 0.55 + 32;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${pop(T, t0)})`} opacity={1 - seg(T, until, until + 0.5)}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.6} rx="8" fill={bg} />
      <text y={size * 0.33} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={size} fill={fg}>{text}</text>
    </g>
  );
};

/** Disegno di sfondo di un piano (linee tenui, da progetto). */
const RowArt: React.FC<{ k: string; y: number; h: number; T: number }> = ({ k, y, h, T }) => {
  const y0 = y - h / 2, y1 = y + h / 2;
  const st = { fill: 'none', stroke: DIM, strokeWidth: 2, opacity: 0.45 } as const;
  if (k === 'realta') return <g {...st}>{Array.from({ length: 9 }, (_, i) => <rect key={i} x={BAND_X0 + 30 + i * 70} y={y0 + 18} width="30" height="40" rx="14" />)}</g>;
  if (k === 'p1') return (
    <g {...st}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={BAND_X0 + 10 + i * 82} y={y1 - 30 - ((i * 37) % 60)} width="60" height={30 + ((i * 37) % 60)} />)}
      {Array.from({ length: 22 }, (_, i) => <path key={`r${i}`} d={`M${BAND_X0 + ((i * 53) % 650)} ${y0 + mod(i * 29 + T * 160, h - 20)} l-6 16`} />)}
    </g>
  );
  if (k === 'p2') return <g {...st}><path d={`M${BAND_X0 + 20} ${y1 - 14} L${BAND_X1 - 20} ${y1 - 14}`} />{Array.from({ length: 8 }, (_, i) => <rect key={i} x={BAND_X0 + 40 + i * 80} y={y0 + 20} width="40" height="70" />)}</g>;
  if (k === 'p3') return (
    <g {...st}>
      <path d={`M${BAND_X0} ${y1 - 10} L${BAND_X0 + 160} ${y0 + 20} L${BAND_X0 + 300} ${y1 - 10} L${BAND_X0 + 450} ${y0 + 30} L${BAND_X1} ${y1 - 10}`} />
      {Array.from({ length: 18 }, (_, i) => <circle key={i} cx={BAND_X0 + ((i * 41) % 650)} cy={y0 + mod(i * 23 + T * 25, h)} r="2" fill={DIM} />)}
    </g>
  );
  return (
    <g {...st}>
      {[0, 1, 2].map((i) => <path key={i} d={`M${BAND_X0} ${y1 - 18 - i * 12} q40 ${-8 + Math.sin(T + i) * 3} 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0`} />)}
      <path d={`M${BAND_X1 - 120} ${y1 - 40} V${y0 + 30} L${BAND_X1 - 100} ${y0 + 20} V${y1 - 40} M${BAND_X1 - 70} ${y1 - 40} V${y0 + 50} L${BAND_X1 - 56} ${y0 + 60}`} />
    </g>
  );
};

// ---------------------------------------------------------------- la torre al tempo T

const r = rng(2010);
const MOTES = Array.from({ length: 20 }, () => ({ x: r() * 1080, y: r() * 1920, s: 1.5 + r() * 2.5, v: 4 + r() * 10, ph: r() * 6 }));

const Tower: React.FC<{ T: number }> = ({ T }) => {
  const rowAt: Record<string, number> = {
    realta: at('estrazione', 0), p1: at('livelli', 2, 0.1), p2: at('livelli', 2, 0.6), p3: at('livelli', 2, 1.1), limbo: at('limbo', 2, 0.1),
  };
  const focus = (t0: number, t1: number) => seg(T, t0, t0 + 0.3) * (1 - seg(T, t1, t1 + 0.4));
  const off = (ch: string) => 1 - seg(T, end(ch) - 0.4, end(ch) + 0.3);
  const clockAt: Record<string, number> = { realta: at('tempo', 0, 0.3), p1: at('tempo', 2, 0.2), p2: at('tempo', 3, 0.1), p3: at('tempo', 3, 0.9), limbo: at('limbo', 3, 0.2) };
  const clockText: Record<string, string> = { realta: '10 ore', p1: '1 settimana', p2: '6 mesi', p3: '10 anni', limbo: 'anni e anni' };
  const clockSpeed: Record<string, number> = { realta: 0.05, p1: 0.3, p2: 0.8, p3: 1.6, limbo: 3 };
  // la caduta di Fischer nel limbo e il ritorno (capitolo 8)
  const fall = eio(seg(T, at('missione', 0, 0.2), at('missione', 0, 1.2)));
  const back = eio(seg(T, at('missione', 2), at('missione', 2, 0.8)));
  const fischerY = lerp(lerp(RY.p3, RY.limbo, fall), RY.p3, back);
  const safeOpen = eo(seg(T, at('missione', 2, 0.6), at('missione', 2, 1.2)));
  // il seme dell'idea scende dall'alto fino a Fischer nel terzo sogno
  const seedDown = eio(seg(T, at('livelli', 1), at('livelli', 2, 1.6)));
  const seedIn = seg(T, at('missione', 3, 0.2), at('missione', 3, 0.8));
  const kickAll = (t0: number) => seg(T, t0, t0 + 0.2) * (1 - seg(T, t0 + 0.7, t0 + 1.2));
  const kick = Math.max(kickAll(at('calcio', 3, 0.1)), kickAll(at('trottola', 1, 0.1)));
  const wake = eio(seg(T, at('trottola', 1, 0.2), at('trottola', 1, 1.2)));

  return (
    <g>
      {/* piani dell'edificio */}
      {ROWS.map((row) => {
        const t0 = rowAt[row.key];
        if (T < t0) return null;
        const p = eo(seg(T, t0, t0 + 0.6));
        const y0 = row.y - row.h / 2;
        const lit = row.key === 'realta' ? 0.12 * wake : 0;
        return (
          <g key={row.key} opacity={seg(T, t0, t0 + 0.3)}>
            <rect x={BAND_X0} y={y0} width={(BAND_X1 - BAND_X0) * p} height={row.h} fill="#163452" opacity=".55" />
            <rect x={BAND_X0} y={y0} width={(BAND_X1 - BAND_X0) * p} height={row.h} fill={ORANGE} opacity={lit} />
            <path d={`M${BAND_X0} ${y0} H${BAND_X0 + (BAND_X1 - BAND_X0) * p} M${BAND_X0} ${y0 + row.h} H${BAND_X0 + (BAND_X1 - BAND_X0) * p}`} stroke={INK} strokeWidth="2.5" />
            <path d={`M${BAND_X0} ${y0} V${y0 + row.h} M${BAND_X1} ${y0} V${y0 + row.h}`} stroke={INK} strokeWidth="2.5" opacity={seg(p, 0.9, 1)} />
            <g opacity={seg(p, 0.6, 1)}><RowArt k={row.key} y={row.y} h={row.h} T={T} /></g>
            <text x={BAND_X0 + 12} y={y0 + 26} fontFamily={SANS} fontWeight={900} fontSize="22" letterSpacing="3" fill={row.key === 'limbo' ? RED : ORANGE}>{row.name}</text>
            <text x={BAND_X0 + 12} y={y0 + 48} fontFamily={SANS} fontWeight={400} fontSize="18" fill={DIM}>{row.sub}</text>
          </g>
        );
      })}
      <Tag T={T} t0={at('livelli', 3, 0.2)} x={BAND_X1 - 80} y={RY.p2 - 30} text="come piani di un palazzo" bg={INK} size={20} rot={-2} until={end('livelli') - 0.4} />

      {/* orologi: quanto dura il tempo su ogni piano */}
      {ROWS.map((row) => {
        const t0 = clockAt[row.key];
        if (T < t0) return null;
        return (
          <g key={row.key} transform={`translate(${CLOCK_X} ${row.y}) scale(${pop(T, t0)})`}>
            <g transform="translate(-58 0)"><Clock T={T} speed={clockSpeed[row.key]} /></g>
            <text x="-24" y="9" fontFamily={HAND} fontWeight={700} fontSize="28" fill={row.key === 'limbo' ? RED : INK}>{clockText[row.key]}</text>
          </g>
        );
      })}
      <Tag T={T} t0={at('tempo', 1, 0.4)} x={CLOCK_X} y={RY.realta - 82} text="la mente corre" size={20} until={end('tempo') - 0.4} />
      <Link T={T} t0={at('tempo', 2, 0.6)} a={[CLOCK_X + 110, RY.realta + 30]} b={[CLOCK_X + 110, RY.p3 + 10]} color={ORANGE} w={4} arrow label="più lento" lx={-4} ly={-200} size={24} fade={off('tempo')} />

      {/* capitolo 1: Cobb entra nei sogni e ruba i segreti; la trottola */}
      {T < end('estrazione') + 0.6 && (() => {
        const o = 1 - seg(T, end('estrazione') - 0.3, end('estrazione') + 0.4);
        return (
          <g opacity={o}>
            {T >= at('estrazione', 1) && (
              <g transform={`translate(430 ${RY.p1 + 10}) scale(${pop(T, at('estrazione', 1))})`}>
                <Cloud />
                <text y="8" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="26" fill={INK}>sogno</text>
              </g>
            )}
            <Link T={T} t0={at('estrazione', 1, 0.3)} a={[N.cobb[0], N.cobb[1] + 44]} b={[370, RY.p1 - 10]} color={INK} dashed flow arrow label="entra" lx={-34} size={26} />
            <Link T={T} t0={at('estrazione', 1, 1.0)} a={[500, RY.p1 - 14]} b={[N.cobb[0] + 40, N.cobb[1] + 30]} c={[480, RY.realta + 40]} color={ORANGE} arrow label="segreti" lx={40} ly={18} size={26} />
          </g>
        );
      })()}
      <Tag T={T} t0={at('estrazione', 3, 0.1)} x={N.trottola[0]} y={N.trottola[1] - 76} text="nel sogno gira sempre" size={20} until={end('estrazione') - 0.4} />

      {/* capitolo 2: Saito chiede di piantare un'idea in Fischer */}
      <Tag T={T} t0={at('innesto', 1, 0.2)} x={480} y={RY.realta - 90} text="non rubare: piantare" size={22} until={at('innesto', 3, 0.6)} />
      <Link T={T} t0={at('innesto', 3, 0.1)} a={[N.saito[0] + 30, N.saito[1] - 34]} b={[N.fischer[0] - 30, N.fischer[1] - 34]} c={[480, RY.realta - 70]} color={ORANGE} arrow label="" w={4} fade={off('innesto')} />
      <Tag T={T} t0={at('innesto', 4, 0.1)} x={N.cobb[0]} y={N.cobb[1] - 76} text="in cambio: torna dai figli" bg={INK} size={20} until={end('innesto') - 0.4} />

      {/* capitolo 3: il seme scende di piano in piano */}
      {T >= at('livelli', 0) && (
        <g transform={`translate(${lerp(N.fischer[0] + 46, N.fischer3[0] + 46, seedDown)} ${lerp(N.fischer[1] - 20, N.fischer3[1] - 20, seedDown)}) scale(${pop(T, at('livelli', 0))})`}
          opacity={1 - seedIn}>
          <Seed T={T} s={0.9} />
        </g>
      )}
      <Tag T={T} t0={at('livelli', 0, 0.3)} x={N.fischer[0] + 100} y={N.fischer[1] - 70} text="deve sembrare sua" size={20} until={end('livelli') - 0.4} />
      <Link T={T} t0={at('livelli', 1, 0.2)} a={[BAND_X1 + 30, RY.realta]} b={[BAND_X1 + 30, RY.p3 + 20]} color={INK} arrow w={4} label="più giù = più sua" lx={40} ly={0} size={22} fade={off('livelli')} />
      {/* Fischer viene portato giù nei sogni */}
      <Link T={T} t0={at('livelli', 2, 0.2)} a={[N.fischer[0], N.fischer[1] + 44]} b={[N.fischer3[0], N.fischer3[1] - 44]} color={DIM} dashed w={3} />

      {/* capitolo 5: i calci, frecce che risalgono */}
      {[['p1', 'realta'], ['p2', 'p1'], ['p3', 'p2']].map(([from, to], k) => {
        const t0 = at('calcio', 2, 0.1 + k * 0.4);
        if (T < t0) return null;
        const x = BAND_X1 + 22;
        return (
          <g key={from}>
            <Link T={T} t0={t0} a={[x, RY[from as 'p1'] - 20]} b={[x, RY[to as 'p1'] + 30]} color={ORANGE} w={5 + 4 * kick} arrow />
            <text x={x - 14} y={(RY[from as 'p1'] + RY[to as 'p1']) / 2 + 12} textAnchor="end" fontFamily={HAND} fontWeight={700} fontSize="24" fill={ORANGE} opacity={seg(T, t0 + 0.3, t0 + 0.6) * (k === 1 ? 1 : 0)}>calcio</text>
          </g>
        );
      })}
      <Tag T={T} t0={at('calcio', 1, 0.2)} x={BAND_X1 - 150} y={RY.p2 + 4} text="una caduta ti sveglia" size={20} until={end('calcio') - 0.4} />
      <Tag T={T} t0={at('calcio', 3, 0.2)} x={BAND_X1 - 150} y={RY.p3 + 4} text="tutti insieme!" size={22} until={end('calcio') - 0.4} />

      {/* capitolo 6: morire sveglia… ma il sonnifero manda nel limbo */}
      <Link T={T} t0={at('limbo', 0, 0.2)} a={[BAND_X0 + 40, RY.p1 + 20]} b={[BAND_X0 + 40, RY.realta + 30]} color={INK} dashed arrow w={4} label="muori → ti svegli" lx={95} ly={8} size={22} fade={off('limbo')} />
      {T >= at('limbo', 1, 0.2) && (
        <g transform={`translate(${BAND_X0 + 40} ${(RY.p1 + RY.realta) / 2 + 20}) scale(${pop(T, at('limbo', 1, 0.2))})`} opacity={off('limbo')}>
          <rect x="-26" y="-12" width="52" height="24" rx="12" fill={RED} stroke={INK} strokeWidth="3" />
          <path d="M0 -12 V12" stroke={INK} strokeWidth="3" />
          <path d="M-40 -30 L40 30" stroke={RED} strokeWidth="7" strokeLinecap="round" />
        </g>
      )}
      <Tag T={T} t0={at('limbo', 1, 0.6)} x={BAND_X0 + 170} y={RY.p1 - 30} text="sonnifero fortissimo" bg={RED} fg="#FFFFFF" size={20} until={end('limbo') - 0.4} />
      <Link T={T} t0={at('limbo', 2, 0.3)} a={[BAND_X0 + 40, RY.p3 + 20]} b={[BAND_X0 + 40, RY.limbo - 40]} color={RED} dashed arrow w={5} label="muori → limbo" lx={90} size={24} />
      <Tag T={T} t0={at('limbo', 3, 0.6)} x={560} y={RY.limbo + 50} text="dimentichi cos'è reale" bg={RED} fg="#FFFFFF" size={20} until={end('limbo') - 0.4} />

      {/* capitolo 7: Cobb e Mal nel limbo, anni fa; l'idea «niente è vero» */}
      <Node T={T} t0={at('mal', 0, 0.3)} p={N.cobbLimbo} name="Cobb, anni fa" r={32} fade={1 - seg(T, end('mal') - 0.4, end('mal') + 0.3)}><Top T={T} s={0.65} /></Node>
      <Node T={T} t0={at('mal', 0, 0.5)} p={N.mal} name="Mal" sub="la moglie" red ring={focus(at('mal', 0), at('mal', 1, 1)) + focus(at('mal', 3), end('mal')) + focus(at('missione', 1), at('missione', 1, 1.4))}
        fade={1 - seg(T, at('missione', 1, 1.2), at('missione', 1, 2))}>
        <Ring />
      </Node>
      <Link T={T} t0={at('mal', 1, 0.3)} a={[N.cobbLimbo[0] + 34, N.cobbLimbo[1] - 10]} b={[N.mal[0] - 42, N.mal[1] - 10]} c={[485, RY.limbo - 60]} color={RED} arrow w={4} label="«niente è vero»" ly={-20} size={24} fade={off('mal')} />
      <Tag T={T} t0={at('mal', 2, 0.4)} x={N.mal[0] + 120} y={N.mal[1] - 4} text="non si sveglia più" bg={RED} fg="#FFFFFF" size={20} until={end('mal') - 0.4} />
      <Tag T={T} t0={at('mal', 3, 0.2)} x={N.cobb[0]} y={N.cobb[1] - 76} text="ricercato" bg={RED} fg="#FFFFFF" size={22} until={end('mal') - 0.4} />

      {/* capitolo 8: Fischer muore al terzo piano, cade nel limbo, torna su; la cassaforte; l'idea attecchisce */}
      <Node T={T} t0={at('missione', 2, 0.1)} p={N.padre} name="il padre" sub="una copia, in cassaforte" ring={focus(at('missione', 2, 0.6), at('missione', 3, 1.5))}><Safe open={safeOpen} /></Node>
      {T >= at('livelli', 2, 1.0) && (
        <g transform={`translate(${N.fischer3[0]} ${fischerY}) scale(${pop(T, at('livelli', 2, 1.0)) * 0.8})`}>
          <circle r="36" fill="#14304A" stroke={seedIn > 0.5 ? ORANGE : INK} strokeWidth="3.5" />
          <Pinwheel T={T} s={0.75} />
          {seedIn > 0 && <g transform="translate(0 -6)" opacity={seedIn}><Seed T={T} grow={seedIn} s={0.6} /></g>}
        </g>
      )}
      <Link T={T} t0={at('missione', 1, 0.2)} a={[N.cobb[0] - 40, N.cobb[1] + 30]} b={[N.cobbLimbo[0] - 30, N.cobbLimbo[1] - 36]} c={[BAND_X0 - 10, 850]} color={ORANGE} dashed flow arrow w={4} label="Cobb scende" lx={-30} size={22} fade={off('missione')} />
      <Tag T={T} t0={at('missione', 1, 1.2)} x={N.mal[0] + 110} y={N.mal[1] + 4} text="addio" bg={RED} fg="#FFFFFF" size={22} until={end('missione') - 0.4} />
      <Link T={T} t0={at('missione', 2, 0.9)} a={[N.padre[0] + 44, N.padre[1]]} b={[N.fischer3[0] - 40, N.fischer3[1]]} color={ORANGE} arrow w={4} label="sii te stesso" ly={-16} size={24} />
      <Tag T={T} t0={at('missione', 3, 0.6)} x={N.fischer3[0] + 120} y={N.fischer3[1] - 46} text="idea piantata!" size={22} />

      {/* capitolo 9: Saito vecchio nel limbo, il risveglio, la trottola */}
      <Node T={T} t0={at('trottola', 0, 0.1)} p={N.saitoVecchio} name="Saito, vecchio" r={32} fade={1 - seg(T, at('trottola', 0, 1.6), at('trottola', 0, 2.2))}><g transform="scale(.8)"><Briefcase /></g></Node>
      <Link T={T} t0={at('trottola', 0, 0.6)} a={[N.saitoVecchio[0] - 36, N.saitoVecchio[1] - 30]} b={[N.saito[0] - 20, N.saito[1] + 46]} c={[BAND_X0 + 70, 820]} color={ORANGE} dashed flow arrow w={4} fade={off('trottola') * (1 - seg(T, at('trottola', 1, 1), at('trottola', 1, 1.6)))} />

      {/* nodi della realtà, sopra a tutto */}
      <Node T={T} t0={at('estrazione', 0, 0.1)} p={N.cobb} name="Cobb" sub="ladro di sogni" ring={focus(at('estrazione', 0), at('estrazione', 2)) + focus(at('mal', 3), end('mal')) + focus(at('trottola', 1), at('trottola', 2))}>
        <Top T={T} s={0.8} />
      </Node>
      <Node T={T} t0={at('innesto', 0, 0.1)} p={N.saito} name="Saito" sub="uomo d'affari" ring={focus(at('innesto', 0), at('innesto', 1, 1))}><Briefcase /></Node>
      <Node T={T} t0={at('innesto', 2, 0.1)} p={N.fischer} name="Fischer" sub="l'erede" ring={focus(at('innesto', 2), at('innesto', 4)) + focus(at('tempo', 0), at('tempo', 1))}><Pinwheel T={T} s={0.9} /></Node>
      {/* la trottola, grande, nella realtà */}
      {T >= at('estrazione', 2, 0.1) && (() => {
        const fast = seg(T, at('estrazione', 3), at('estrazione', 3, 0.4)) * (1 - seg(T, end('estrazione') - 0.3, end('estrazione')));
        const final = seg(T, at('trottola', 2, 0.3), at('trottola', 2, 0.8));
        const wob = seg(T, at('trottola', 3, 0.2), at('trottola', 3, 1.4));
        return (
          <g transform={`translate(${N.trottola[0]} ${N.trottola[1]}) scale(${pop(T, at('estrazione', 2, 0.1))})`}>
            <Glow id="in-top" x={0} y={0} r={110} t={T} color={ORANGE} amp={0.1} rate={2.4} opacity={0.4 + 0.3 * (fast + final)} />
            <Top T={T} spin={1.2 + 4 * fast + 2.5 * final} wobble={wob * (0.6 + 0.4 * Math.sin(T * 1.3))} s={1.05} />
            <text y="72" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="22" fill={INK} opacity={seg(T, at('estrazione', 2, 0.4), at('estrazione', 2, 0.8))}>la trottola</text>
          </g>
        );
      })()}
      <Tag T={T} t0={at('trottola', 3, 0.3)} x={N.trottola[0] - 10} y={N.trottola[1] - 82} text="sogno o realtà?" size={24} rot={-3} />
    </g>
  );
};

export const makePiani = (chapterId: string): React.FC<SceneProps> => {
  const Scene: React.FC<SceneProps> = ({ t }) => {
    const T = STARTS[chapterId] + t;
    const c = camAt(T);
    return (
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id="in" />
          <radialGradient id="in-bg" cx=".5" cy=".44" r=".8">
            <stop offset="0" stopColor="#1B3B5C" />
            <stop offset=".6" stopColor="#122A44" />
            <stop offset="1" stopColor="#081626" />
          </radialGradient>
          <linearGradient id="in-scrim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#081626" stopOpacity=".96" />
            <stop offset=".8" stopColor="#081626" stopOpacity=".8" />
            <stop offset="1" stopColor="#081626" stopOpacity="0" />
          </linearGradient>
          <pattern id="in-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0 H0 V40" fill="none" stroke="#2C4C6E" strokeWidth="1" />
          </pattern>
          <pattern id="in-grid5" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M200 0 H0 V200" fill="none" stroke="#35587C" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#in-bg)" />
        <g transform={`translate(540 860) scale(${c.z}) translate(${-c.x} ${-c.y})`}>
          <rect x="-1200" y="-1200" width="3480" height="4320" fill="url(#in-grid)" opacity=".55" />
          <rect x="-1200" y="-1200" width="3480" height="4320" fill="url(#in-grid5)" opacity=".5" />
          <Tower T={T} />
        </g>
        {/* velo scuro in alto: il titolo resta leggibile anche quando la torre ci passa sotto */}
        <rect width="1080" height="470" fill="url(#in-scrim)" />
        {MOTES.map((m, i) => (
          <circle key={i} cx={mod(m.x + Math.sin(T * 0.5 + m.ph) * 30, 1080)} cy={mod(m.y - T * m.v, 1920)} r={m.s} fill={INK} opacity={0.1 + 0.07 * Math.sin(T * 2 + m.ph)} />
        ))}
        <Finish id="in" tint="#1E3A5A" tintOpacity={0.08} />
      </svg>
    );
  };
  return Scene;
};
