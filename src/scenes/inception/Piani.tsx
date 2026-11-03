import React from 'react';
import { eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { HAND, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Glow } from '../../lib/elements';
import { subtitleTimes } from '../../components/ChapterOverlay';
import type { SceneProps } from '../../types';
import film from '../../../films/inception.json';

// Inception come schema (formato "spiegato"): il palazzo dei sogni disegnato come una cianografia, il progetto di un
// architetto su carta blu, perché nel film i sogni si progettano. Ogni piano è un livello: in alto la realtà (la cabina
// dell'aereo con la macchina dei sogni), poi sogno 1 (la città sotto la pioggia con il furgone sul ponte), sogno 2 (il
// corridoio dell'albergo), sogno 3 (la fortezza nella neve), in fondo il limbo (la spiaggia con i palazzi che crollano).
// Ogni piano occupa quasi tutto lo schermo: la camera va sul piano di cui parla la voce e si allontana quando la voce
// collega i piani; i piani non ancora spiegati sono già lì come contorni tratteggiati (il progetto non finito).
// Personaggi = cerchi con il loro oggetto (mai figure): Cobb = trottola, Saito = valigetta, Fischer = girandola,
// il padre = cassaforte, Mal = fede nuziale. L'idea da piantare è un seme arancione. In ogni piano un orologio dice
// quanto dura il tempo lì. Gli eventi cadono sulla griglia della musica (68 bpm, crome) come lo spartito.
// Coordinate = mondo; la camera porta il punto (x, y) al centro dello schermo (540, 860) con zoom z: si vede da
// y − 390/z a y + 390/z tra titolo e sottotitoli.

export const INK = '#E8EEF4';
export const ORANGE = '#E39A3B';
const RED = '#E0605A';
const DIM = '#7E9AB4';
const PAPER = '#163452';
const X0 = 70, X1 = 1010;
type P = readonly [number, number];
const ROWS = [
  { key: 'realta', y0: 400, h: 600, name: 'REALTÀ', sub: 'in aereo' },
  { key: 'p1', y0: 1060, h: 600, name: 'SOGNO 1', sub: 'città sotto la pioggia' },
  { key: 'p2', y0: 1720, h: 600, name: 'SOGNO 2', sub: "un albergo" },
  { key: 'p3', y0: 2380, h: 600, name: 'SOGNO 3', sub: 'fortezza nella neve' },
  { key: 'limbo', y0: 3040, h: 680, name: 'LIMBO', sub: 'il piano più in fondo' },
] as const;
type RowKey = (typeof ROWS)[number]['key'];
export const ROW = Object.fromEntries(ROWS.map((r) => [r.key, r])) as Record<RowKey, (typeof ROWS)[number]>;
const N = {
  cobb: [200, 700], saito: [390, 700], fischer: [580, 700], trottola: [800, 740],
  fischer1: [560, 1420], fischer2: [540, 2090], fischer3: [640, 2780], padre: [380, 2780],
  saitoVecchio: [300, 3290], cobbLimbo: [470, 3340], mal: [680, 3340],
} as const;
const CLOCK: Record<RowKey, P> = { realta: [905, 500], p1: [905, 1150], p2: [905, 1810], p3: [905, 2470], limbo: [905, 3140] };

// ---------------------------------------------------------------- tempi dal JSON, sulla griglia della musica

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
const CROMA = 60 / (film.bpm ?? 68) / 2;
const G0 = film.copertina.durata;
/** Istante (assoluto) della frase `cue` del capitolo più `d`, arrotondato alla croma della musica. */
const at = (ch: string, cue: number, d = 0) => G0 + Math.round((STARTS[ch] + CUES[ch][cue] + d - G0) / CROMA) * CROMA;
const end = (ch: string) => STARTS[ch] + film.capitoli.find((c) => c.id === ch)!.durata;
const pop = (T: number, t0: number) => eob(seg(T, t0, t0 + 0.45), 1.7);

// ---------------------------------------------------------------- camera

type Shot = { at: number; x: number; y: number; z: number };
// inquadrature larghe: la torre riempie tutta l'altezza dello schermo (dal titolo in giù, anche dietro i sottotitoli)
const WIDE = { x: 540, y: 1098, z: 0.43 };
const FLOORS = { x: 540, y: 945, z: 0.55 };
const SHOTS: Shot[] = [
  { at: at('estrazione', 0), x: 520, y: 690, z: 0.9 },
  { at: at('estrazione', 1), x: 530, y: 720, z: 0.9 },
  { at: at('estrazione', 2), x: 560, y: 700, z: 0.9 },
  { at: at('innesto', 0), x: 530, y: 700, z: 0.9 },
  { at: at('innesto', 2), x: 550, y: 700, z: 0.9 },
  { at: at('livelli', 1), x: 540, y: 1080, z: 0.75 },
  // il seme scende: la camera lo segue piano per piano, poi la torre intera come chiusura
  { at: at('livelli', 2), x: 540, y: 1720, z: 0.55 },
  { at: at('livelli', 2, 1.4), x: 540, y: 2380, z: 0.55 },
  { at: at('livelli', 3), ...FLOORS },
  { at: at('tempo', 0), x: 540, y: 680, z: 0.9 },
  { at: at('tempo', 1), ...FLOORS },
  { at: at('tempo', 2), x: 560, y: 1360, z: 0.9 },
  { at: at('tempo', 3), x: 560, y: 2380, z: 0.55 },
  { at: at('calcio', 0), x: 560, y: 1270, z: 0.9 },
  { at: at('calcio', 2), x: 540, y: 1580, z: 0.52 },
  { at: at('calcio', 3), ...WIDE },
  { at: at('limbo', 0), x: 540, y: 1000, z: 0.62 },
  { at: at('limbo', 2), x: 540, y: 3030, z: 0.5 },
  { at: at('limbo', 3), x: 540, y: 3360, z: 0.9 },
  { at: at('mal', 0), x: 520, y: 3330, z: 0.9 },
  { at: at('mal', 3), x: 540, y: 1250, z: 0.37 },
  { at: at('missione', 0), x: 540, y: 3030, z: 0.5 },
  { at: at('missione', 2), x: 520, y: 2720, z: 0.9 },
  { at: at('trottola', 0), x: 540, y: 3250, z: 0.62 },
  { at: at('trottola', 1), x: 540, y: 700, z: 0.9 },
  { at: at('trottola', 2), x: 850, y: 700, z: 2.4 },
  { at: at('trottola', 3, 0.4), ...WIDE },
];
const camAt = (T: number) => {
  let o = { x: SHOTS[0].x, y: SHOTS[0].y, z: SHOTS[0].z };
  for (const s of SHOTS.slice(1)) {
    const p = eio(seg(T, s.at - 0.2, s.at + 1.1));
    // lo zoom passa in scala logaritmica, così allontanarsi e avvicinarsi hanno la stessa velocità apparente
    o = { x: lerp(o.x, s.x, p), y: lerp(o.y, s.y, p), z: Math.exp(lerp(Math.log(o.z), Math.log(s.z), p)) };
  }
  return { x: o.x + Math.sin(T * 0.3) * 6, y: o.y + Math.cos(T * 0.25) * 5, z: o.z * (1 + 0.012 * Math.sin(T * 0.2)) };
};

// ---------------------------------------------------------------- oggetti dei personaggi (linee bianche da cianografia)

/** Trottola di metallo: `spin` in giri al secondo, `wobble` 0..1 la fa vacillare. */
export const Top: React.FC<{ T: number; spin?: number; wobble?: number; s?: number }> = ({ T, spin = 1.5, wobble = 0, s = 1 }) => {
  const tilt = wobble * 14 * Math.sin(T * 7);
  const ph = mod(T * spin, 1);
  return (
    <g transform={`scale(${s}) rotate(${tilt} 0 34)`}>
      <ellipse cx="0" cy="40" rx="26" ry="5" fill="#000" opacity=".25" />
      <path d="M0 -42 V-24" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <path d="M-32 -18 Q0 -32 32 -18 L4 34 Q0 40 -4 34 Z" fill="#9AA8B4" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M-26 -14 Q-10 -4 -3 26" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity=".5" />
      <ellipse cx="0" cy="-18" rx="32" ry="8" fill="#C9D3DC" stroke={INK} strokeWidth="3" />
      {[0, 1, 2].map((k) => {
        const x = Math.sin((ph + k / 3) * Math.PI * 2) * 28;
        return <path key={k} d={`M${x} -16 L${x * 0.15} 28`} stroke={ORANGE} strokeWidth="3.5" opacity={0.4 + 0.6 * Math.cos((ph + k / 3) * Math.PI * 2) ** 2} />;
      })}
    </g>
  );
};
const Briefcase = () => (
  <g fill="none" stroke={INK} strokeWidth="4" strokeLinejoin="round">
    <rect x="-30" y="-14" width="60" height="40" rx="6" fill="#2A4A6A" />
    <path d="M-11 -14 V-23 H11 V-14 M-30 4 H30" />
    <rect x="-5" y="0" width="10" height="9" fill="#C9D3DC" stroke="none" />
    <path d="M-24 -8 H-6" stroke="#FFFFFF" opacity=".4" />
  </g>
);
export const Pinwheel: React.FC<{ T: number; s?: number }> = ({ T, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M0 0 V44" stroke={INK} strokeWidth="4" />
    <g transform={`rotate(${T * 90})`}>
      {[0, 90, 180, 270].map((a) => <path key={a} d="M0 0 L0 -28 Q18 -22 0 0 Z" fill={a % 180 ? '#3E6A9A' : '#C9D3DC'} stroke={INK} strokeWidth="2.5" transform={`rotate(${a})`} />)}
    </g>
    <circle r="4.5" fill={INK} />
  </g>
);
const Safe: React.FC<{ open?: number }> = ({ open = 0 }) => (
  <g stroke={INK} strokeWidth="4" strokeLinejoin="round">
    <rect x="-30" y="-28" width="60" height="56" rx="4" fill="#24405C" />
    {open > 0 && <rect x="-24" y="-22" width="48" height="44" fill="#FFE2B0" opacity={0.85 * open} stroke="none" />}
    <g transform={`translate(-24 0) scale(${1 - open * 0.85} 1) translate(24 0)`}>
      <rect x="-24" y="-22" width="48" height="44" fill="#2E5070" />
      <circle cx="0" cy="0" r="10" fill="none" />
      <path d="M0 -10 V0 L7 4" fill="none" />
    </g>
  </g>
);
const Ring = () => (
  <g fill="none">
    <ellipse cx="0" cy="4" rx="24" ry="17" stroke={INK} strokeWidth="8" />
    <ellipse cx="0" cy="4" rx="24" ry="17" stroke="#F2D48A" strokeWidth="3.5" />
    <path d="M-7 -13 L0 -22 L7 -13" stroke={INK} strokeWidth="3" />
  </g>
);
/** Il seme dell'idea: arancione, con un germoglio che cresce. */
const Seed: React.FC<{ T: number; grow?: number; s?: number }> = ({ T, grow = 0, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <Glow id={`in-seed${Math.round(s * 100)}`} x={0} y={0} r={60} t={T} color={ORANGE} amp={0.12} rate={3} opacity={0.7} />
    <ellipse rx="15" ry="20" fill={ORANGE} stroke={INK} strokeWidth="3.5" />
    <path d="M-6 -8 Q-8 2 -4 10" stroke="#FFE2B0" strokeWidth="3" fill="none" />
    {grow > 0 && <path d={`M0 -18 Q${-12 * grow} ${-38 * grow} ${-24 * grow} ${-44 * grow} M0 -18 Q${10 * grow} ${-30 * grow} ${22 * grow} ${-36 * grow}`} fill="none" stroke="#9BD48A" strokeWidth="5" strokeLinecap="round" />}
  </g>
);
const Clock: React.FC<{ T: number; speed: number; red?: boolean }> = ({ T, speed, red }) => (
  <g>
    <circle r="56" fill="#102A44" stroke={red ? RED : INK} strokeWidth="5" />
    <circle r="46" fill="none" stroke={DIM} strokeWidth="2" />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 -46 V-38" stroke={INK} strokeWidth={i % 3 ? 2 : 4} transform={`rotate(${i * 30})`} />)}
    <path d="M0 0 V-38" stroke={red ? RED : ORANGE} strokeWidth="4" strokeLinecap="round" transform={`rotate(${T * speed * 360})`} />
    <path d="M0 0 V-24" stroke={INK} strokeWidth="5" strokeLinecap="round" transform={`rotate(${T * speed * 30})`} />
    <circle r="5" fill={INK} />
  </g>
);

// ---------------------------------------------------------------- elementi dello schema

const Node: React.FC<{ T: number; t0: number; p: P; name: string; sub?: string; ring?: number; r?: number; fade?: number; red?: boolean; side?: 'below' | 'above'; children?: React.ReactNode; size?: number }> = ({
  T, t0, p, name, sub, ring = 0, r = 62, fade = 1, red = false, side = 'below', children, size = 38,
}) => {
  if (T < t0 || fade <= 0) return null;
  const s = pop(T, t0);
  const ly = side === 'below' ? r + size + 6 : -r - 18;
  return (
    <g transform={`translate(${p[0]} ${p[1]})`} opacity={seg(T, t0, t0 + 0.15) * fade}>
      <g transform={`scale(${s})`}>
        {ring > 0 && <Glow id={`in-g${p[0]}${p[1]}`} x={0} y={0} r={r * 2.4} t={T} color={red ? RED : ORANGE} amp={0.1} rate={2.4} opacity={0.5 * Math.min(1, ring)} />}
        <circle r={r} fill="#14304A" stroke={ring > 0.5 ? (red ? RED : ORANGE) : red ? RED : INK} strokeWidth={ring > 0.5 ? 7 : 4.5} />
        <circle r={r - 8} fill="none" stroke={DIM} strokeWidth="1.5" opacity=".6" />
        <g transform={`scale(${r / 44})`}>{children}</g>
      </g>
      <text y={ly} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={size} fill={INK} stroke="#0B1A2A" strokeWidth="6" paintOrder="stroke" opacity={seg(T, t0 + 0.2, t0 + 0.5)}>{name}</text>
      {sub && <text y={ly + size * 0.85} textAnchor="middle" fontFamily={SANS} fontWeight={400} fontSize={size * 0.72} fill={DIM} stroke="#0B1A2A" strokeWidth="5" paintOrder="stroke" opacity={seg(T, t0 + 0.3, t0 + 0.6)}>{sub}</text>}
    </g>
  );
};

/** Linea dello schema che si disegna. Il tratto si svela con una maschera (niente pathLength con dash in px). */
const Link: React.FC<{ T: number; t0: number; a: P; b: P; c?: P; color?: string; dashed?: boolean; label?: string; arrow?: boolean; w?: number; lx?: number; ly?: number; size?: number; fade?: number; flow?: boolean }> = ({
  T, t0, a, b, c, color = INK, dashed = false, label, arrow = false, w = 6, lx = 0, ly = 0, size = 44, fade = 1, flow = false,
}) => {
  if (T < t0 || fade <= 0) return null;
  const p = eo(seg(T, t0, t0 + 0.6));
  const [mx, my] = c ?? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const d = `M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`;
  const ang = (Math.atan2(b[1] - my, b[0] - mx) * 180) / Math.PI;
  const id = `in-m${a[0]}${a[1]}${b[0]}${b[1]}`;
  return (
    <g opacity={fade}>
      <mask id={id} maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="8000"><path d={d} fill="none" stroke="#fff" strokeWidth={w + 10} pathLength={1} strokeDasharray={`${p} 1`} /></mask>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray={dashed ? `${w * 3} ${w * 2.2}` : undefined} strokeDashoffset={flow ? -T * 60 : 0} strokeLinecap="round" mask={`url(#${id})`} />
      {arrow && p > 0.95 && <path d={`M${-w * 3.6} ${-w * 2.4} L0 0 L${-w * 3.6} ${w * 2.4}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${b[0]} ${b[1]}) rotate(${ang})`} />}
      {label && (
        <text x={0.25 * a[0] + 0.5 * mx + 0.25 * b[0] + lx} y={0.25 * a[1] + 0.5 * my + 0.25 * b[1] + ly} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={size}
          fill={color} stroke="#0B1A2A" strokeWidth={size / 7} paintOrder="stroke" opacity={seg(T, t0 + 0.35, t0 + 0.7)}>{label}</text>
      )}
    </g>
  );
};

const Tag: React.FC<{ T: number; t0: number; x: number; y: number; text: string; bg?: string; fg?: string; size?: number; rot?: number; until?: number }> = ({
  T, t0, x, y, text, bg = ORANGE, fg = '#0B1016', size = 36, rot = 0, until = 1e9,
}) => {
  if (T < t0 || T > until + 0.5) return null;
  const w = text.length * size * 0.56 + size;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${pop(T, t0)})`} opacity={1 - seg(T, until, until + 0.5)}>
      <rect x={-w / 2 + size * 0.12} y={-size * 0.95 + size * 0.12} width={w} height={size * 1.6} rx={size * 0.3} fill="#000" opacity=".35" />
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.6} rx={size * 0.3} fill={bg} />
      <text y={size * 0.33} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={size} fill={fg}>{text}</text>
    </g>
  );
};

// ---------------------------------------------------------------- disegni dei piani (linee da progetto)

const rr = rng(2010);
const RAIN = Array.from({ length: 46 }, () => ({ x: X0 + rr() * (X1 - X0), y: rr(), v: 0.6 + rr() * 0.5 }));
const SNOW = Array.from({ length: 40 }, () => ({ x: X0 + rr() * (X1 - X0), y: rr(), v: 0.08 + rr() * 0.12, ph: rr() * 6 }));
const SKY = Array.from({ length: 9 }, (_, i) => ({ x: 96 + i * 104, w: 70 + ((i * 37) % 30), h: 180 + ((i * 53) % 160) }));
const L = { fill: 'none', stroke: INK, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;

export const ArtRealta: React.FC<{ T: number; wake: number; closeUp?: number }> = ({ T, wake, closeUp = 0 }) => {
  const y0 = ROW.realta.y0;
  return (
    <g>
      {/* la cabina dell'aereo in sezione */}
      <rect x="100" y={y0 + 70} width="880" height="470" rx="150" {...L} fill="#0F2740" strokeWidth="4" opacity=".9" />
      <rect x="100" y={y0 + 70} width="880" height="470" rx="150" fill={ORANGE} opacity={0.12 * wake} />
      <path d={`M140 ${y0 + 500} H940`} {...L} strokeWidth="3" opacity=".7" />
      {/* finestrini con le nuvole che scorrono */}
      {Array.from({ length: 7 }, (_, i) => {
        const cx = 170 + i * 95, cy = y0 + 150;
        return (
          <g key={i}>
            <ellipse cx={cx} cy={cy} rx="26" ry="36" {...L} fill="#1E4468" strokeWidth="3" />
            <clipPath id={`in-win${i}`}><ellipse cx={cx} cy={cy} rx="24" ry="34" /></clipPath>
            <g clipPath={`url(#in-win${i})`}>
              <path d={`M${cx - 60 + mod(T * 30 + i * 17, 120)} ${cy + 8} q14 -16 28 0 q10 -10 22 2`} stroke={INK} strokeWidth="3" fill="none" opacity=".7" />
            </g>
          </g>
        );
      })}
      {/* sedili dietro i personaggi */}
      {[N.cobb, N.saito, N.fischer].map(([x], i) => (
        <g key={i} opacity=".8">
          <path d={`M${x - 70} ${y0 + 470} V${y0 + 260} Q${x - 70} ${y0 + 210} ${x - 20} ${y0 + 206} H${x + 20} Q${x + 70} ${y0 + 210} ${x + 70} ${y0 + 260} V${y0 + 470}`} {...L} fill="#183A5C" strokeWidth="3" />
          <path d={`M${x - 80} ${y0 + 470} H${x + 80} V${y0 + 500} H${x - 80} Z`} {...L} fill="#183A5C" strokeWidth="3" />
          <path d={`M${x - 50} ${y0 + 236} H${x + 50}`} stroke={DIM} strokeWidth="2" />
        </g>
      ))}
      {/* la macchina dei sogni: valigetta aperta con i tubi verso i sedili */}
      <g transform={`translate(460 ${y0 + 520})`}>
        <rect x="-70" y="-34" width="140" height="44" rx="6" {...L} fill="#2A4A6A" strokeWidth="4" />
        <path d="M-70 -34 L-60 -72 H60 L70 -34" {...L} fill="#1E3A56" strokeWidth="4" />
        <circle cx="-30" cy="-12" r="10" {...L} strokeWidth="3" />
        <path d="M-30 -12 l6 -5" stroke={ORANGE} strokeWidth="3" />
        {[0, 1, 2, 3].map((k) => <rect key={k} x={4 + k * 14} y="-20" width="8" height="16" fill={k === Math.floor(mod(T * 2, 4)) ? ORANGE : DIM} />)}
      </g>
      {[N.cobb, N.saito, N.fischer].map(([x], i) => (
        <path key={`t${i}`} d={`M${430 + i * 20} ${y0 + 488} Q${(x + 460) / 2} ${y0 + 560} ${x + 30} ${y0 + 360}`} stroke={DIM} strokeWidth="3" fill="none" strokeDasharray="6 6" />
      ))}
      <text x="460" y={y0 + 580} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="30" fill={DIM} opacity={1 - closeUp}>la macchina dei sogni</text>
      {/* tavolino della trottola */}
      <path d={`M${N.trottola[0] - 80} ${N.trottola[1] + 50} H${N.trottola[0] + 80} M${N.trottola[0]} ${N.trottola[1] + 50} V${y0 + 470} M${N.trottola[0] - 40} ${y0 + 470} H${N.trottola[0] + 40}`} {...L} strokeWidth="4" />
    </g>
  );
};

export const ArtP1: React.FC<{ T: number; van: number }> = ({ T, van }) => {
  const y0 = ROW.p1.y0, base = y0 + 470;
  return (
    <g>
      {SKY.map((b, i) => (
        <g key={i} opacity={i > 5 ? 0.5 : 0.85}>
          <rect x={b.x} y={base - b.h} width={b.w} height={b.h} {...L} fill="#183A5C" strokeWidth="3" />
          {Array.from({ length: Math.floor(b.h / 40) * 2 }, (_, k) => (
            <rect key={k} x={b.x + 12 + (k % 2) * (b.w / 2 - 6)} y={base - b.h + 16 + Math.floor(k / 2) * 40} width={b.w / 2 - 22} height="20" fill={(k * 7 + i) % 5 === 0 ? '#F2D48A' : 'none'} stroke={DIM} strokeWidth="1.5" opacity=".8" />
          ))}
        </g>
      ))}
      <path d={`M${X0} ${base} H${X1}`} {...L} strokeWidth="4" />
      <path d={`M${X0} ${base + 50} H${X1}`} stroke={DIM} strokeWidth="2" strokeDasharray="30 20" />
      {/* il ponte con il furgone */}
      <path d={`M600 ${base - 60} H${X1}`} {...L} strokeWidth="6" />
      {[660, 800, 940].map((x) => <path key={x} d={`M${x - 60} ${base} Q${x} ${base - 110} ${x + 60} ${base}`} {...L} strokeWidth="4" />)}
      {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${610 + i * 28} ${base - 60} V${base - 90}`} stroke={INK} strokeWidth="2.5" />)}
      <path d={`M600 ${base - 90} H${X1}`} stroke={INK} strokeWidth="3" />
      <g transform={`translate(${lerp(820, 900, van)} ${lerp(base - 102, base + 40, van * van)}) rotate(${van * 35})`}>
        <rect x="-74" y="-42" width="148" height="84" rx="8" {...L} fill="#24405C" strokeWidth="4" />
        <path d="M30 -42 V20 M44 -30 H66 V0 H44 Z" {...L} strokeWidth="3" />
        {[-44, 44].map((x) => <circle key={x} cx={x} cy="42" r="15" {...L} fill="#0F2740" strokeWidth="4" />)}
        <path d="M-64 -30 H16" stroke="#FFFFFF" strokeWidth="3" opacity=".4" />
      </g>
      {/* pioggia */}
      {RAIN.map((d, i) => <path key={i} d={`M${d.x} ${y0 + 20 + mod(d.y * 560 + T * 600 * d.v, 560)} l-9 26`} stroke={INK} strokeWidth="2.5" opacity=".45" />)}
    </g>
  );
};

export const ArtP2: React.FC = () => {
  const y0 = ROW.p2.y0;
  const vx = 540, vy = y0 + 300;
  const bx0 = vx - 80, bx1 = vx + 80, by0 = vy - 70, by1 = vy + 90;
  const C = [[X0 + 30, y0 + 40], [X1 - 30, y0 + 40], [X1 - 30, y0 + 560], [X0 + 30, y0 + 560]];
  return (
    <g>
      <path d={`M${C[0][0]} ${C[0][1]} L${bx0} ${by0} M${C[1][0]} ${C[1][1]} L${bx1} ${by0} M${C[2][0]} ${C[2][1]} L${bx1} ${by1} M${C[3][0]} ${C[3][1]} L${bx0} ${by1}`} {...L} strokeWidth="3.5" />
      {/* l'ascensore in fondo */}
      <rect x={bx0} y={by0} width={bx1 - bx0} height={by1 - by0} {...L} fill="#183A5C" strokeWidth="4" />
      <path d={`M${vx} ${by0 + 10} V${by1}`} stroke={INK} strokeWidth="3" />
      <circle cx={vx} cy={by0 - 16} r="7" fill={ORANGE} />
      {/* porte numerate ai lati, in prospettiva */}
      {[0.18, 0.42, 0.64].map((k, i) => {
        const lx0 = lerp(C[0][0], bx0, k), lx1 = lerp(C[0][0], bx0, k + 0.12);
        const top0 = lerp(C[0][1], by0, k) + 60 * (1 - k), top1 = lerp(C[0][1], by0, k + 0.12) + 60 * (1 - k - 0.12);
        const bot0 = lerp(C[3][1], by1, k), bot1 = lerp(C[3][1], by1, k + 0.12);
        const rx0 = 1080 - lx0, rx1 = 1080 - lx1;
        return (
          <g key={i}>
            <path d={`M${lx0} ${bot0} V${top0} L${lx1} ${top1} V${bot1}`} {...L} fill="#183A5C" strokeWidth="3" />
            <path d={`M${rx0} ${bot0} V${top0} L${rx1} ${top1} V${bot1}`} {...L} fill="#183A5C" strokeWidth="3" />
            <text x={(lx0 + lx1) / 2} y={top0 + 40 * (1 - k)} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={26 * (1 - k * 0.8)} fill={DIM}>{528 - i * 2}</text>
          </g>
        );
      })}
      {/* lampadari e passatoia */}
      {[0.25, 0.55].map((k) => <g key={k}><path d={`M${vx} ${lerp(C[0][1], by0, k)} v${30 * (1 - k)}`} stroke={INK} strokeWidth="2" /><circle cx={vx} cy={lerp(C[0][1], by0, k) + 40 * (1 - k)} r={18 * (1 - k * 0.7)} fill="#F2D48A" opacity=".8" /></g>)}
      <path d={`M${vx - 200} ${C[3][1]} L${vx - 40} ${by1} H${vx + 40} L${vx + 200} ${C[3][1]} Z`} fill="#3A2A44" opacity=".5" stroke={DIM} strokeWidth="2" />
    </g>
  );
};

export const ArtP3: React.FC<{ T: number }> = ({ T }) => {
  const y0 = ROW.p3.y0;
  return (
    <g>
      <path d={`M${X0} ${y0 + 330} L230 ${y0 + 130} L360 ${y0 + 260} L540 ${y0 + 70} L720 ${y0 + 250} L860 ${y0 + 140} L${X1} ${y0 + 300}`} {...L} fill="#183A5C" strokeWidth="4" />
      <path d={`M200 ${y0 + 170} L230 ${y0 + 130} L262 ${y0 + 162} M505 ${y0 + 110} L540 ${y0 + 70} L578 ${y0 + 108} M830 ${y0 + 175} L860 ${y0 + 140} L890 ${y0 + 170}`} stroke="#FFFFFF" strokeWidth="5" fill="none" />
      {/* la fortezza sulla vetta */}
      <g transform={`translate(540 ${y0 + 150})`}>
        <rect x="-110" y="-10" width="220" height="90" {...L} fill="#24405C" strokeWidth="4" />
        {[-110, 70].map((x) => <rect key={x} x={x} y="-60" width="40" height="70" {...L} fill="#24405C" strokeWidth="4" />)}
        {[-110, 70].map((x) => <path key={`c${x}`} d={`M${x} -60 v-12 h10 v12 h10 v-12 h10 v12 h10 v-12`} {...L} strokeWidth="3" />)}
        {Array.from({ length: 5 }, (_, i) => <rect key={i} x={-90 + i * 40} y="16" width="18" height="26" fill={i === 2 ? '#F2D48A' : 'none'} stroke={DIM} strokeWidth="2" />)}
      </g>
      {/* abeti e la stanza della cassaforte */}
      {[120, 200, 880, 960].map((x, i) => <path key={x} d={`M${x} ${y0 + 470} l-34 0 l34 -${70 + i * 10} l34 ${70 + i * 10} Z M${x} ${y0 + 470} v20`} {...L} fill="#183A5C" strokeWidth="3" />)}
      <rect x="250" y={y0 + 300} width="520" height="250" rx="10" {...L} fill="#0F2740" strokeWidth="3" strokeDasharray="10 8" />
      {SNOW.map((s, i) => <circle key={i} cx={s.x + Math.sin(T + s.ph) * 14} cy={y0 + 20 + mod(s.y * 560 + T * 560 * s.v, 560)} r="4" fill={INK} opacity=".55" />)}
    </g>
  );
};

export const ArtLimbo: React.FC<{ T: number }> = ({ T }) => {
  const y0 = ROW.limbo.y0;
  return (
    <g>
      {/* palazzi che crollano a destra */}
      {[[780, 300, -6], [870, 380, 4], [950, 250, -10]].map(([x, h, r], i) => (
        <g key={i} transform={`rotate(${r} ${x} ${y0 + 520})`}>
          <rect x={x - 40} y={y0 + 520 - h} width="80" height={h} fill="#2A1E2E" stroke={RED} strokeWidth="3.5" />
          {Array.from({ length: Math.floor(h / 36) }, (_, k) => <path key={k} d={`M${x - 30} ${y0 + 540 - h + k * 36} h60`} stroke={RED} strokeWidth="1.5" opacity=".6" />)}
          <path d={`M${x - 40} ${y0 + 520 - h} l20 30 l-10 20 l30 24`} stroke={RED} strokeWidth="3" fill="none" />
        </g>
      ))}
      {/* la casetta di Cobb e Mal */}
      <g transform={`translate(160 ${y0 + 470})`}>
        <path d="M-70 0 V-80 L0 -130 L70 -80 V0 Z" fill="#2A1E2E" stroke={RED} strokeWidth="4" />
        <rect x="-18" y="-50" width="36" height="50" fill="none" stroke={RED} strokeWidth="3" />
      </g>
      {/* il mare continua sotto il piano, nel buio: niente fondo */}
      <linearGradient id="in-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0C1C2E" stopOpacity=".9" /><stop offset="1" stopColor="#0C1C2E" stopOpacity="0" /></linearGradient>
      <rect x={X0} y={y0 + 680} width={X1 - X0} height="700" fill="url(#in-sea)" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={`m${i}`} d={`M${X0} ${y0 + 740 + i * 70} ${Array.from({ length: 12 }, (_, k) => `q40 ${-14 + Math.sin(T * 0.8 + i * 0.7 + k) * 6} 80 0`).join(' ')}`} stroke={i % 2 ? RED : INK} strokeWidth="3" fill="none" opacity={0.4 - i * 0.035} />
      ))}
      {/* spiaggia e onde grigie */}
      <path d={`M${X0} ${y0 + 520} H${X1}`} stroke={RED} strokeWidth="3" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${X0} ${y0 + 570 + i * 32} ${Array.from({ length: 12 }, (_, k) => `q40 ${-12 + Math.sin(T * 1.2 + i + k) * 4} 80 0`).join(' ')}`} stroke={INK} strokeWidth="3" fill="none" opacity={0.6 - i * 0.15} />
      ))}
    </g>
  );
};

// ---------------------------------------------------------------- la torre al tempo T

const r = rng(2011);
const MOTES = Array.from({ length: 22 }, () => ({ x: r() * 1080, y: r() * 1920, s: 1.5 + r() * 3, v: 4 + r() * 10, ph: r() * 6 }));

const Tower: React.FC<{ T: number }> = ({ T }) => {
  const rowAt: Record<RowKey, number> = {
    realta: at('estrazione', 0), p1: at('livelli', 2, 0.1), p2: at('livelli', 2, 0.55), p3: at('livelli', 2, 1.0), limbo: at('limbo', 2, 0.1),
  };
  const focus = (t0: number, t1: number) => seg(T, t0, t0 + 0.3) * (1 - seg(T, t1, t1 + 0.4));
  const off = (ch: string) => 1 - seg(T, end(ch) - 0.4, end(ch) + 0.3);
  const clockAt: Record<RowKey, number> = { realta: at('tempo', 0, 0.4), p1: at('tempo', 2, 0.2), p2: at('tempo', 3, 0.1), p3: at('tempo', 3, 0.9), limbo: at('limbo', 3, 0.3) };
  const clockText: Record<RowKey, string> = { realta: '10 ore', p1: '1 settimana', p2: '6 mesi', p3: '10 anni', limbo: 'anni e anni' };
  const clockSpeed: Record<RowKey, number> = { realta: 0.05, p1: 0.3, p2: 0.8, p3: 1.6, limbo: 3 };
  const fall = eio(seg(T, at('missione', 0, 0.3), at('missione', 0, 1.3)));
  const back = eio(seg(T, at('missione', 2), at('missione', 2, 0.9)));
  const fischerY = lerp(lerp(N.fischer3[1], N.cobbLimbo[1] - 160, fall), N.fischer3[1], back);
  const safeOpen = eo(seg(T, at('missione', 2, 0.7), at('missione', 2, 1.3)));
  const seedDown = eio(seg(T, at('livelli', 1, 0.2), at('livelli', 2, 1.8)));
  const seedIn = seg(T, at('missione', 3, 0.2), at('missione', 3, 0.9));
  const kickAll = (t0: number) => seg(T, t0, t0 + 0.2) * (1 - seg(T, t0 + 0.7, t0 + 1.2));
  const kick = Math.max(kickAll(at('calcio', 3, 0.2)), kickAll(at('trottola', 1, 0.1)));
  const wake = eio(seg(T, at('trottola', 1, 0.2), at('trottola', 1, 1.2)));
  const van = eio(seg(T, at('calcio', 0, 0.6), at('calcio', 0, 1.6)));
  // il seme dell'idea scende di piano in piano lungo le copie di Fischer
  const path: P[] = [[N.fischer[0] + 70, N.fischer[1] - 40], [N.fischer1[0] + 64, N.fischer1[1] - 40], [N.fischer2[0] + 64, N.fischer2[1] - 40], [N.fischer3[0] + 64, N.fischer3[1] - 40]];
  const sp = seedDown * 3, si = Math.min(2, Math.floor(sp)), sf = sp - si;
  const seedPos: P = [lerp(path[si][0], path[si + 1][0], sf), lerp(path[si][1], path[si + 1][1], sf)];
  const big = (z: number) => z;
  const close = seg(T, at('trottola', 2) - 0.2, at('trottola', 2) + 0.4) * (1 - seg(T, at('trottola', 3, 0.3), at('trottola', 3, 0.9))); // promemoria: le scritte delle inquadrature larghe sono grandi (si vedono a z 0,22–0,3)

  return (
    <g>
      {/* i piani dell'edificio: prima tratteggiati (progetto non finito), poi disegnati */}
      {ROWS.map((row) => {
        const t0 = rowAt[row.key];
        const p = eo(seg(T, t0, t0 + 0.7));
        const lit = row.key === 'realta' ? 0.1 * wake : 0;
        const red = row.key === 'limbo';
        return (
          <g key={row.key}>
            <rect x={X0} y={row.y0} width={X1 - X0} height={row.h} fill="none" stroke={DIM} strokeWidth="4" strokeDasharray="18 14" opacity={0.6 * (1 - p)} />
            {p < 1 && (
              <g opacity={0.16 * (1 - p)}>
                {row.key === 'realta' && <ArtRealta T={T} wake={0} />}
                {row.key === 'p1' && <ArtP1 T={T} van={0} />}
                {row.key === 'p2' && <ArtP2 />}
                {row.key === 'p3' && <ArtP3 T={T} />}
                {row.key === 'limbo' && <ArtLimbo T={T} />}
              </g>
            )}
            {p > 0 && (
              <g opacity={seg(T, t0, t0 + 0.35)}>
                <rect x={X0} y={row.y0} width={(X1 - X0) * p} height={row.h} fill={PAPER} opacity=".7" />
                <rect x={X0} y={row.y0} width={(X1 - X0) * p} height={row.h} fill={ORANGE} opacity={lit} />
                <path d={`M${X0} ${row.y0} H${X0 + (X1 - X0) * p} M${X0} ${row.y0 + row.h} H${X0 + (X1 - X0) * p}`} stroke={red ? RED : INK} strokeWidth="5" />
                <path d={`M${X0} ${row.y0} V${row.y0 + row.h} M${X1} ${row.y0} V${row.y0 + row.h}`} stroke={red ? RED : INK} strokeWidth="5" opacity={seg(p, 0.9, 1)} />
                <g opacity={seg(p, 0.5, 1)}>
                  {row.key === 'realta' && <ArtRealta T={T} wake={wake} closeUp={close} />}
                  {row.key === 'p1' && <ArtP1 T={T} van={van} />}
                  {row.key === 'p2' && <ArtP2 />}
                  {row.key === 'p3' && <ArtP3 T={T} />}
                  {row.key === 'limbo' && <ArtLimbo T={T} />}
                </g>
                <text x={X0 + 26} y={row.y0 + 64} fontFamily={SANS} fontWeight={900} fontSize="54" letterSpacing="5" fill={red ? RED : ORANGE} stroke="#0B1A2A" strokeWidth="8" paintOrder="stroke">{row.name}</text>
                <text x={X0 + 28} y={row.y0 + 104} fontFamily={SANS} fontWeight={400} fontSize="32" fill={INK} stroke="#0B1A2A" strokeWidth="6" paintOrder="stroke" opacity=".85">{row.sub}</text>
              </g>
            )}
          </g>
        );
      })}

      {/* orologi: quanto dura il tempo su ogni piano */}
      {ROWS.map((row) => {
        const t0 = clockAt[row.key];
        if (T < t0) return null;
        const [cx, cy] = CLOCK[row.key];
        const wideText = T > at('tempo', 1) && T < end('tempo') + 0.5;
        return (
          <g key={row.key} transform={`translate(${cx} ${cy}) scale(${pop(T, t0)})`}>
            <Clock T={T} speed={clockSpeed[row.key]} red={row.key === 'limbo'} />
            <text x="-80" y={wideText ? 40 : 16} textAnchor="end" fontFamily={HAND} fontWeight={700} fontSize={wideText ? 92 : 52} fill={row.key === 'limbo' ? RED : INK} stroke="#0B1A2A" strokeWidth={wideText ? 14 : 8} paintOrder="stroke">{clockText[row.key]}</text>
          </g>
        );
      })}
      <Tag T={T} t0={at('tempo', 1, 0.5)} x={540} y={ROW.p1.y0 - 30} text="nei sogni la mente corre" size={big(70)} until={at('tempo', 2) - 0.4} />

      {/* capitolo 1: Cobb entra nel sogno e ruba i segreti; la trottola */}
      {T < end('estrazione') + 0.6 && T >= at('estrazione', 1) && (
        <g opacity={1 - seg(T, end('estrazione') - 0.3, end('estrazione') + 0.4)}>
          <g transform={`translate(480 ${ROW.realta.y0 + 515}) scale(${pop(T, at('estrazione', 1)) * 0.85})`}>
            <path d="M-90 30 Q-118 30 -112 0 Q-108 -32 -70 -30 Q-58 -64 -14 -58 Q20 -78 50 -50 Q96 -56 96 -14 Q122 -2 108 26 Q102 38 82 36 Z" fill="#1E3A56" stroke={INK} strokeWidth="5" />
            <text y="12" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="40" fill={INK}>un sogno</text>
          </g>
          <Link T={T} t0={at('estrazione', 1, 0.3)} a={[N.cobb[0] + 20, N.cobb[1] + 66]} b={[400, ROW.realta.y0 + 500]} c={[250, ROW.realta.y0 + 500]} dashed flow arrow label="entra" lx={-60} ly={10} />
          <Link T={T} t0={at('estrazione', 1, 1.1)} a={[500, ROW.realta.y0 + 430]} b={[N.cobb[0] + 64, N.cobb[1] + 10]} c={[480, ROW.realta.y0 + 300]} color={ORANGE} arrow label="segreti" lx={60} ly={-10} />
        </g>
      )}
      <Tag T={T} t0={at('estrazione', 3, 0.1)} x={N.trottola[0] - 140} y={N.trottola[1] - 120} text="nel sogno non si ferma" size={38} until={end('estrazione') - 0.4} />

      {/* capitolo 2: Saito chiede di piantare un'idea in Fischer */}
      <Tag T={T} t0={at('innesto', 1, 0.2)} x={N.saito[0] + 60} y={ROW.realta.y0 + 150} text="non rubare: piantare" size={40} until={at('innesto', 3, 0.6)} />
      {T >= at('innesto', 1, 0.5) && T < end('innesto') + 0.4 && (
        <g transform={`translate(${lerp(N.saito[0] + 60, N.fischer[0] - 40, eio(seg(T, at('innesto', 2, 0.4), at('innesto', 2, 1.4))))} ${N.saito[1] - 96}) scale(${pop(T, at('innesto', 1, 0.5))})`} opacity={off('innesto')}>
          <Seed T={T} s={1} />
        </g>
      )}
      <Link T={T} t0={at('innesto', 3, 0.1)} a={[N.fischer[0], N.fischer[1] - 70]} b={[N.fischer[0] + 140, ROW.realta.y0 + 190]} c={[N.fischer[0] + 40, ROW.realta.y0 + 170]} color={ORANGE} arrow fade={off('innesto')} />
      <Tag T={T} t0={at('innesto', 3, 0.4)} x={740} y={ROW.realta.y0 + 150} text="smonta l'impero del padre" size={34} until={at('innesto', 4) - 0.4} />
      <Tag T={T} t0={at('innesto', 4, 0.1)} x={420} y={ROW.realta.y0 + 150} text="in cambio: torna dai figli" bg={INK} size={34} until={end('innesto') - 0.4} />

      {/* capitolo 3: il seme scende; Fischer portato giù nei sogni; i piani di un palazzo */}
      <Tag T={T} t0={at('livelli', 0, 0.2)} x={N.fischer[0] + 40} y={N.fischer[1] - 120} text="deve sembrare sua" size={40} until={at('livelli', 1, 0.6)} />
      {[N.fischer1, N.fischer2].map((p, i) => (
        <Node key={i} T={T} t0={at('livelli', 2, 0.3 + i * 0.45)} p={p} name="Fischer" r={60} size={44} fade={1 - seg(T, at('livelli', 2, 0.3 + i * 0.45) + 0 * 0, -1)}><Pinwheel T={T} s={0.95} /></Node>
      ))}
      <Link T={T} t0={at('livelli', 2, 0.2)} a={[N.fischer[0], N.fischer[1] + 70]} b={[N.fischer3[0], N.fischer3[1] - 72]} c={[600, 1700]} color={DIM} dashed w={8} />
      <Link T={T} t0={at('livelli', 1, 0.3)} a={[X1 + 40, ROW.realta.y0 + 120]} b={[X1 + 40, ROW.p3.y0 + 300]} color={INK} arrow w={14} fade={off('livelli')} />
      <Tag T={T} t0={at('livelli', 1, 0.6)} x={700} y={ROW.p1.y0 - 30} text="più giù = più sua" size={big(64)} until={end('livelli') - 0.4} />
      <Tag T={T} t0={at('livelli', 3, 0.2)} x={600} y={ROW.p2.y0 + 520} text="come i piani di un palazzo" bg={INK} size={big(70)} until={end('livelli') - 0.4} />
      {T >= at('livelli', 0) && seedIn < 1 && T > at('livelli', 1) && (
        <g transform={`translate(${seedPos[0]} ${seedPos[1]}) scale(${1 + 1.6 * Math.sin(Math.PI * Math.min(1, seedDown)) })`} opacity={1 - seedIn}>
          <Seed T={T} s={1.1} />
        </g>
      )}

      {/* capitolo 5: la caduta del furgone e i calci, frecce che risalgono */}
      <Tag T={T} t0={at('calcio', 1, 0.3)} x={430} y={ROW.p1.y0 + 200} text="una caduta ti sveglia" size={42} until={at('calcio', 2, 0.6)} />
      {(['p1', 'p2', 'p3'] as const).map((from, k) => {
        const to = (['realta', 'p1', 'p2'] as const)[k];
        const t0 = at('calcio', 2, 0.2 + k * 0.45);
        if (T < t0) return null;
        const x = 960;
        return (
          <g key={from} opacity={off('calcio') + (T > end('calcio') ? 0 : 0)}>
            <Link T={T} t0={t0} a={[x, ROW[from].y0 + 260]} b={[x, ROW[to].y0 + ROW[to].h - 120]} color={ORANGE} w={16 + 16 * kick} arrow />
            <text x={x - 50} y={ROW[from].y0 + 40} textAnchor="end" fontFamily={HAND} fontWeight={700} fontSize="110" fill={ORANGE} stroke="#0B1A2A" strokeWidth="14" paintOrder="stroke" opacity={seg(T, t0 + 0.3, t0 + 0.6)}>calcio</text>
          </g>
        );
      })}
      <Tag T={T} t0={at('calcio', 3, 0.2)} x={480} y={ROW.p1.y0 + 540} text="tutti insieme!" size={big(80)} until={end('calcio') - 0.4} />

      {/* capitolo 6: morire sveglia… ma il sonnifero manda nel limbo */}
      <Link T={T} t0={at('limbo', 0, 0.3)} a={[200, ROW.p1.y0 + 300]} b={[200, ROW.realta.y0 + 420]} color={INK} dashed arrow w={12} label="muori → ti svegli" lx={300} ly={0} size={80} fade={off('limbo')} />
      {T >= at('limbo', 1, 0.2) && (
        <g transform={`translate(840 ${ROW.p1.y0 + 170}) scale(${pop(T, at('limbo', 1, 0.2)) * 2})`} opacity={off('limbo')}>
          <rect x="-40" y="-18" width="80" height="36" rx="18" fill={RED} stroke={INK} strokeWidth="4" />
          <path d="M0 -18 V18" stroke={INK} strokeWidth="4" />
          <path d="M-30 -8 H-10" stroke="#FFFFFF" strokeWidth="3" opacity=".6" />
        </g>
      )}
      <Tag T={T} t0={at('limbo', 1, 0.6)} x={680} y={ROW.p1.y0 - 30} text="sonnifero fortissimo" bg={RED} fg="#FFFFFF" size={big(80)} until={end('limbo') - 0.4} />
      <Link T={T} t0={at('limbo', 2, 0.3)} a={[200, ROW.p3.y0 + 330]} b={[200, ROW.limbo.y0 + 200]} color={RED} dashed arrow w={14} label="muori → limbo" lx={280} size={90} fade={1 - seg(T, at('limbo', 3) - 0.3, at('limbo', 3))} />
      <Tag T={T} t0={at('limbo', 3, 0.5)} x={470} y={ROW.limbo.y0 + 250} text="dimentichi cos'è reale" bg={RED} fg="#FFFFFF" size={44} until={end('limbo') - 0.4} />

      {/* capitolo 7: Cobb e Mal nel limbo, anni fa; l'idea «niente è vero»; Mal lo perseguita */}
      <Node T={T} t0={at('mal', 0, 0.3)} p={N.cobbLimbo} name="Cobb, anni fa" fade={1 - seg(T, end('mal') - 0.4, end('mal') + 0.3)}><Top T={T} s={0.75} /></Node>
      <Node T={T} t0={at('mal', 0, 0.6)} p={N.mal} name="Mal" sub="la moglie" red ring={focus(at('mal', 0), at('mal', 1, 1)) + focus(at('missione', 1), at('missione', 1, 1.4))}
        fade={(1 - 0.55 * seg(T, at('mal', 2, 0.6), at('mal', 2, 1.2))) * (1 - seg(T, at('missione', 1, 1.2), at('missione', 1, 2)))}>
        <Ring />
      </Node>
      <Link T={T} t0={at('mal', 1, 0.3)} a={[N.cobbLimbo[0] + 50, N.cobbLimbo[1] - 50]} b={[N.mal[0] - 56, N.mal[1] - 50]} c={[575, ROW.limbo.y0 + 120]} color={RED} arrow w={7} label="«niente è vero»" ly={-30} size={48} fade={off('mal')} />
      <Tag T={T} t0={at('mal', 2, 0.4)} x={N.mal[0] - 40} y={N.mal[1] + 230} text="crede di sognare" bg={RED} fg="#FFFFFF" size={40} until={at('mal', 3, 0.4)} />
      {(['p1', 'p2'] as const).map((k, i) => (
        <Node key={k} T={T} t0={at('mal', 3, 0.5 + i * 0.3)} p={[340 + i * 300, ROW[k].y0 + 300]} name="" red ring={1} r={90} fade={off('mal')}><Ring /></Node>
      ))}
      <Tag T={T} t0={at('mal', 3, 0.3)} x={600} y={ROW.realta.y0 + 560} text="Cobb ricercato" bg={RED} fg="#FFFFFF" size={big(70)} until={end('mal') - 0.4} />
      <Tag T={T} t0={at('mal', 3, 1.2)} x={560} y={ROW.p2.y0 + 530} text="lei lo perseguita" bg={RED} fg="#FFFFFF" size={big(70)} until={end('mal') - 0.4} />

      {/* capitolo 8: Fischer cade nel limbo e torna; la cassaforte; l'idea attecchisce */}
      <Node T={T} t0={at('missione', 0, 0.1)} p={[870, N.fischer3[1] - 20]} name="Mal" red ring={1} r={60} size={44} fade={1 - seg(T, at('missione', 1, 0), at('missione', 1, 0.6))}><Ring /></Node>
      <Link T={T} t0={at('missione', 0, 0.3)} a={[805, N.fischer3[1] - 20]} b={[N.fischer3[0] + 70, N.fischer3[1] - 10]} color={RED} arrow w={8} label="colpisce" ly={-28} size={42} fade={1 - seg(T, at('missione', 1, 0), at('missione', 1, 0.6))} />
      <Node T={T} t0={at('missione', 2, 0.1)} p={N.padre} name="il padre" sub="una copia, in cassaforte" ring={focus(at('missione', 2, 0.7), at('missione', 3, 1.5))}><Safe open={safeOpen} /></Node>
      {T >= at('livelli', 2, 1.0) && (
        <g transform={`translate(${N.fischer3[0]} ${fischerY}) scale(${pop(T, at('livelli', 2, 1.0))})`}>
          {seedIn > 0 && <Glow id="in-f3" x={0} y={0} r={170} t={T} color={ORANGE} amp={0.1} rate={2.4} opacity={0.6 * seedIn} />}
          <circle r="62" fill="#14304A" stroke={seedIn > 0.5 ? ORANGE : fall > 0.5 && back < 0.5 ? RED : INK} strokeWidth="6" />
          <g transform="scale(1.35)"><Pinwheel T={T} /></g>
          {seedIn > 0 && <g transform="translate(36 -40)" opacity={seedIn}><Seed T={T} grow={seedIn} s={1.2} /></g>}
          <text y="110" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="44" fill={INK} stroke="#0B1A2A" strokeWidth="6" paintOrder="stroke">Fischer</text>
        </g>
      )}
      <Link T={T} t0={at('missione', 1, 0.2)} a={[N.padre[0] - 120, ROW.p3.y0 + 380]} b={[N.cobbLimbo[0] - 40, N.cobbLimbo[1] - 80]} c={[150, ROW.limbo.y0]} color={ORANGE} dashed flow arrow w={12} label="Cobb scende" lx={240} ly={30} size={80} fade={off('missione')} />
      <Tag T={T} t0={at('missione', 1, 1.2)} x={860} y={N.mal[1] + 150} text="addio" bg={RED} fg="#FFFFFF" size={big(80)} until={at('missione', 2, 0.2)} />
      <Link T={T} t0={at('missione', 2, 1.0)} a={[N.padre[0] + 66, N.padre[1]]} b={[N.fischer3[0] - 66, N.fischer3[1]]} color={ORANGE} arrow w={7} label="sii te stesso" ly={-24} size={46} />
      <Tag T={T} t0={at('missione', 3, 0.6)} x={N.fischer3[0] + 40} y={N.fischer3[1] - 150} text="idea piantata!" size={46} />

      {/* capitolo 9: Saito vecchio nel limbo, il risveglio, la trottola */}
      <Node T={T} t0={at('trottola', 0, 0.1)} p={N.saitoVecchio} name="Saito, vecchio" r={90} size={70} fade={1 - seg(T, at('trottola', 1, 0.6), at('trottola', 1, 1.2))}><Briefcase /></Node>
      <Link T={T} t0={at('trottola', 0, 0.6)} a={[N.saitoVecchio[0] - 60, N.saitoVecchio[1] - 100]} b={[N.saito[0] - 40, N.saito[1] + 100]} c={[30, 2000]} color={ORANGE} dashed flow arrow w={18} fade={off('trottola') * (1 - seg(T, at('trottola', 1, 1), at('trottola', 1, 1.6)))} />
      <Tag T={T} t0={at('trottola', 1, 0.4)} x={540} y={ROW.realta.y0 + 130} text="si svegliano" size={40} until={at('trottola', 2, 0.2)} />
      <Tag T={T} t0={at('trottola', 2, 0.5)} x={N.cobb[0] + 120} y={ROW.realta.y0 + 130} text="corre dai figli" bg={INK} size={34} until={at('trottola', 3, 0.3)} />

      {/* nodi della realtà, sopra a tutto */}
      <Node T={T} t0={at('estrazione', 0, 0.1)} p={N.cobb} name="Cobb" sub="ladro di sogni" fade={1 - close} ring={focus(at('estrazione', 0), at('estrazione', 2)) + focus(at('trottola', 1), at('trottola', 2))}>
        <Top T={T} s={0.85} />
      </Node>
      <Node T={T} t0={at('innesto', 0, 0.1)} p={N.saito} name="Saito" sub="uomo d'affari" fade={1 - close} ring={focus(at('innesto', 0), at('innesto', 1, 1))}><Briefcase /></Node>
      <Node T={T} t0={at('innesto', 2, 0.1)} p={N.fischer} name="Fischer" sub="l'erede" fade={1 - close} ring={focus(at('innesto', 2), at('innesto', 4)) + focus(at('tempo', 0), at('tempo', 1))}><Pinwheel T={T} s={0.95} /></Node>
      {/* la trottola, grande, nella realtà */}
      {T >= at('estrazione', 2, 0.1) && (() => {
        const fast = seg(T, at('estrazione', 3), at('estrazione', 3, 0.4)) * (1 - seg(T, end('estrazione') - 0.3, end('estrazione')));
        const final = seg(T, at('trottola', 2, 0.3), at('trottola', 2, 0.8));
        const wob = seg(T, at('trottola', 3, 0.2), at('trottola', 3, 1.4));
        const wide = seg(T, at('trottola', 3, 0.4), at('trottola', 3, 1.5));
        return (
          <g transform={`translate(${N.trottola[0]} ${N.trottola[1]}) scale(${pop(T, at('estrazione', 2, 0.1)) * (1.5 + 1.5 * wide)})`}>
            <Glow id="in-top" x={0} y={0} r={110} t={T} color={ORANGE} amp={0.1} rate={2.4} opacity={0.45 + 0.3 * (fast + final)} />
            <Top T={T} spin={1.2 + 4 * fast + 2.5 * final} wobble={wob * (0.6 + 0.4 * Math.sin(T * 1.3))} />
            <text y="78" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="24" fill={INK} stroke="#0B1A2A" strokeWidth="5" paintOrder="stroke" opacity={seg(T, at('estrazione', 2, 0.4), at('estrazione', 2, 0.8)) * (1 - wide)}>la trottola</text>
          </g>
        );
      })()}
      <Tag T={T} t0={at('trottola', 3, 0.6)} x={560} y={ROW.p1.y0 + 520} text="sogno o realtà?" size={big(96)} rot={-3} />
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
            <stop offset="0" stopColor="#1D4064" />
            <stop offset=".6" stopColor="#132D4A" />
            <stop offset="1" stopColor="#081626" />
          </radialGradient>
          <linearGradient id="in-scrim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#081626" stopOpacity=".96" />
            <stop offset=".82" stopColor="#081626" stopOpacity=".9" />
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
          <rect x="-4000" y="-4000" width="9080" height="12000" fill="url(#in-grid)" opacity=".5" />
          <rect x="-4000" y="-4000" width="9080" height="12000" fill="url(#in-grid5)" opacity=".45" />
          <Tower T={T} />
        </g>
        {/* velo scuro in alto: il titolo resta leggibile anche quando la torre ci passa sotto */}
        <rect width="1080" height="575" fill="url(#in-scrim)" />
        {MOTES.map((m, i) => (
          <circle key={i} cx={mod(m.x + Math.sin(T * 0.5 + m.ph) * 30, 1080)} cy={mod(m.y - T * m.v, 1920)} r={m.s} fill={INK} opacity={0.1 + 0.07 * Math.sin(T * 2 + m.ph)} />
        ))}
        <Finish id="in" tint="#1E3A5A" tintOpacity={0.08} />
      </svg>
    );
  };
  return Scene;
};
