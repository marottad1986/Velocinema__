import React from 'react';
import { eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { HAND, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Glow } from '../../lib/elements';
import { subtitleTimes } from '../../components/ChapterOverlay';
import type { SceneProps } from '../../types';
import film from '../../../films/tenet.json';

// Tenet come schema (formato "spiegato"): un dossier d'operazione su lavagna scura, con il tempo disegnato a due binari.
// Il binario rosso a sinistra scende (il tempo normale, dal passato al futuro); quello blu a destra sale (il tempo
// invertito). In mezzo sei «stazioni» disegnate, una per luogo, nell'ordine in cui il tempo normale le attraversa:
// il laboratorio, lo yacht di Sator, il deposito di Oslo, l'autostrada di Tallinn, il covo dell'Algoritmo, il futuro.
// Le cose che vanno avanti sono rosse, quelle invertite blu: un proiettile blu esce dal muro e torna nella pistola; a
// Tallinn la linea rossa entra nel tornello e risale in blu fino a Oslo, dove l'uomo mascherato si rivela il Protagonista
// stesso (l'anello si chiude). Personaggi = cerchi con il loro oggetto (mai figure): il Protagonista = tesserino senza
// nome, Sator = braccialetto del battito, Kat = quadro, Neil = zaino con il filo rosso (si vede fin dal capitolo 4: è
// l'indizio del colpo di scena). Sullo sfondo il quadrato del Sator, il palindromo latino da cui viene il titolo.
// Coordinate = mondo; la camera porta il punto (x, y) al centro dello schermo (540, 900) con zoom z.
// Gli eventi cadono sulla griglia della musica (80 bpm, crome), gli stessi istanti dello spartito scripts/audio/tenet.mjs.

export const INK = '#EEF1F4';
export const RED = '#E8553F';
export const BLUE = '#4FB0EE';
const DIM = '#7D8A99';
const PAPER = '#141B24';
const DARK = '#0B0E13';
const WARM = '#F2C46A';
const X0 = 110, X1 = 970, H = 520;
type P = readonly [number, number];
const BANDS = [
  { key: 'lab', y0: 400, name: 'IL LABORATORIO' },
  { key: 'yacht', y0: 1020, name: 'LO YACHT DI SATOR' },
  { key: 'oslo', y0: 1640, name: 'OSLO · IL DEPOSITO' },
  { key: 'tallinn', y0: 2260, name: "TALLINN · L'AUTOSTRADA" },
  { key: 'covo', y0: 2880, name: "IL COVO DELL'ALGORITMO" },
  { key: 'futuro', y0: 3500, name: 'IL FUTURO' },
] as const;
type BandKey = (typeof BANDS)[number]['key'];
export const BAND = Object.fromEntries(BANDS.map((b) => [b.key, b])) as Record<BandKey, (typeof BANDS)[number]>;
const cy = (k: BandKey) => BAND[k].y0 + 265;
export const N = {
  prot: [235, 650], tenet: [585, 520],
  sator: [300, 1250], kat: [780, 1250],
  prot2: [300, 1830], neil: [310, 2025], masked: [800, 1870], turn: [575, 1910],
  katT: [300, 2470], satorT: [820, 2440], turnT: [600, 2650],
  algo: [520, 3180], gate: [835, 3150], soldier: [712, 3300],
  protF: [560, 3690],
} as const;
const RX = 70, BX = 1010; // i due binari: rosso (avanti) a sinistra, blu (all'indietro) a destra

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
const CROMA = 60 / film.bpm / 2;
const G0 = film.copertina.durata;
/** Istante (assoluto) della frase `cue` del capitolo più `d`, arrotondato alla croma della musica. */
export const at = (ch: string, cue: number, d = 0) => G0 + Math.round((STARTS[ch] + CUES[ch][cue] + d - G0) / CROMA) * CROMA;
const end = (ch: string) => STARTS[ch] + film.capitoli.find((c) => c.id === ch)!.durata;
const pop = (T: number, t0: number) => eob(seg(T, t0, t0 + 0.45), 1.7);

// ---------------------------------------------------------------- camera

type Shot = { at: number; x: number; y: number; z: number };
const Z = 1.12;
// inquadratura finale: lo schema intero, con il futuro (dove compare il Protagonista anni dopo) sopra la zona delle app
const WIDE = { x: 540, y: 1590, z: 0.29 };
const band = (k: BandKey, z = Z, dx = 0, dy = 0) => ({ x: 540 + dx, y: cy(k) + dy, z });
const SHOTS: Shot[] = [
  { at: at('invertiti', 0), ...band('lab', 1.0) },
  { at: at('invertiti', 1, 0.2), ...band('lab', 1.12, 30, 40) },
  { at: at('invertiti', 2), ...band('lab', 1.2, 0, 60) },
  { at: at('invertiti', 3, 0.3), ...band('lab', 0.9, 0, 40) },
  // la camera scende lungo il binario blu fino al futuro, mentre i proiettili salgono
  { at: at('futuro', 0), x: 600, y: 1550, z: 0.62 },
  { at: at('futuro', 0, 1.6), x: 600, y: 2900, z: 0.62 },
  { at: at('futuro', 1), ...band('futuro', 1.05, 0, 60) },
  { at: at('futuro', 2), ...band('lab', 1.0, 0, -20) },
  { at: at('sator', 0), ...band('yacht') },
  // Sator e le armi del laboratorio insieme, poi Kat
  { at: at('sator', 1), x: 540, y: 1010, z: 0.82 },
  { at: at('sator', 3), ...band('yacht', 1.1) },
  { at: at('tornello', 0), ...band('oslo') },
  { at: at('tornello', 2), ...band('oslo', 1.12, 30) },
  { at: at('tornello', 3), ...band('oslo', 1.2, 50, -20) },
  { at: at('algoritmo', 0), ...band('covo') },
  { at: at('algoritmo', 2), x: 540, y: 1420, z: 0.5 },
  { at: at('algoritmo', 3), x: 540, y: 3500, z: 0.8 },
  { at: at('battito', 0), ...band('yacht', 1.15, -30, 0) },
  // la camera segue il cavo dal braccialetto fino all'Algoritmo
  { at: at('battito', 1), x: 320, y: 1750, z: 0.82 },
  { at: at('battito', 1, 1.3), x: 340, y: 2650, z: 0.82 },
  { at: at('battito', 2), ...band('covo', 1.0, 0, -40) },
  { at: at('battito', 3), ...band('yacht', 1.05) },
  { at: at('mascherato', 0), ...band('tallinn') },
  // dal tornello di Tallinn la camera risale lungo la freccia blu fino a Oslo
  { at: at('mascherato', 2), x: 620, y: 2560, z: 0.9 },
  { at: at('mascherato', 2, 1.3), x: 620, y: 2120, z: 0.88 },
  { at: at('mascherato', 3), ...band('oslo', 1.1) },
  { at: at('tenaglia', 0), ...band('covo', 1.0) },
  { at: at('tenaglia', 2), ...band('yacht') },
  { at: at('tenaglia', 3, 0.1), x: 520, y: 1380, z: 0.92 },
  { at: at('neil', 0), ...band('covo', 1.12, 40, 40) },
  { at: at('neil', 1), ...band('covo', 1.05) },
  { at: at('neil', 1, 1.4), ...band('yacht', 1.05) },
  // dallo zaino del soldato allo zaino di Neil, lungo il filo rosso
  { at: at('neil', 2), x: 640, y: 3150, z: 1.0 },
  { at: at('neil', 2, 1.2), x: 540, y: 2150, z: 0.9 },
  { at: at('neil', 3), ...band('futuro', 1.0, 0, -40) },
  { at: at('neil', 3, 1.6), ...WIDE },
];
/** Zoom attuale della camera: le scritte dello schema crescono quando la camera si allontana, così restano leggibili. */
let UI_K = 1;
const fit = (size: number) => Math.max(size, Math.min(size * UI_K, 130));
const camAt = (T: number) => {
  let o = { x: SHOTS[0].x, y: SHOTS[0].y, z: SHOTS[0].z };
  for (const s of SHOTS.slice(1)) {
    const p = eio(seg(T, s.at - 0.2, s.at + 1.1));
    o = { x: lerp(o.x, s.x, p), y: lerp(o.y, s.y, p), z: Math.exp(lerp(Math.log(o.z), Math.log(s.z), p)) };
  }
  return { x: o.x + Math.sin(T * 0.3) * 6, y: o.y + Math.cos(T * 0.25) * 5, z: o.z * (1 + 0.012 * Math.sin(T * 0.2)) };
};

// ---------------------------------------------------------------- oggetti dei personaggi

/** Il Protagonista: un tesserino senza nome, con un punto di domanda al posto della foto. */
export const Badge: React.FC<{ color?: string; s?: number }> = ({ color = INK, s = 1 }) => (
  <g transform={`scale(${s})`} strokeLinejoin="round">
    <path d="M-8 -36 H8 V-28 H-8 Z" fill="#3A4656" stroke={INK} strokeWidth="2.5" />
    <rect x="-34" y="-28" width="68" height="56" rx="7" fill="#22303F" stroke={color} strokeWidth="4" />
    <rect x="-26" y="-18" width="24" height="30" rx="3" fill="#0F1620" stroke={INK} strokeWidth="2.5" />
    <text x="-14" y="7" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="24" fill={color === INK ? WARM : color}>?</text>
    {[-14, -5, 4].map((y, i) => <path key={y} d={`M4 ${y} H${i === 1 ? 22 : 28}`} stroke={DIM} strokeWidth="3" strokeLinecap="round" />)}
    <path d="M-26 20 H26" stroke={INK} strokeWidth="2" opacity=".45" />
  </g>
);
/** Il battito: linea dell'elettrocardiogramma larga w, centrata in 0. `amp` 0 = piatta. */
const ecgPath = (w: number, T: number, amp: number) => {
  const ph = mod((T - G0) / (60 / film.bpm), 1); // un battito per battito della musica (80 al minuto)
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const u = i / 40, x = -w / 2 + u * w;
    const d = mod(u - ph, 1);
    const y = d < 0.04 ? -d * 25 : d < 0.08 ? -1 + (d - 0.04) * 60 : d < 0.12 ? 1.4 - (d - 0.08) * 35 : 0;
    pts.push(`${i ? 'L' : 'M'}${x.toFixed(1)} ${(y * amp * w * 0.22).toFixed(1)}`);
  }
  return pts.join(' ');
};
/** Sator: braccialetto con lo schermo del battito. */
export const Bracelet: React.FC<{ T: number; beat?: number; s?: number; color?: string }> = ({ T, beat = 1, s = 1, color = RED }) => (
  <g transform={`scale(${s})`} strokeLinejoin="round">
    <path d="M-30 -22 Q-44 0 -30 22 M30 -22 Q44 0 30 22" fill="none" stroke="#3A4656" strokeWidth="14" />
    <path d="M-30 -22 Q-44 0 -30 22 M30 -22 Q44 0 30 22" fill="none" stroke={INK} strokeWidth="3" opacity=".5" />
    <rect x="-30" y="-22" width="60" height="44" rx="10" fill="#0F1620" stroke={INK} strokeWidth="4" />
    <path d={ecgPath(46, T, beat)} transform="translate(0 4)" fill="none" stroke={beat > 0.05 ? color : DIM} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="20" cy="-12" r="3" fill={beat > 0.05 ? color : DIM} opacity={0.5 + 0.5 * Math.sin(T * 8)} />
  </g>
);
/** Kat: il quadro falso nella cornice dorata (un paesaggio). `crack` 0..1 = colpito. */
export const Painting: React.FC<{ crack?: number; s?: number; stamp?: number }> = ({ crack = 0, s = 1, stamp = 0 }) => (
  <g transform={`scale(${s})`} strokeLinejoin="round">
    <rect x="-36" y="-28" width="72" height="56" fill="#6B5A34" stroke={INK} strokeWidth="4" />
    <rect x="-28" y="-20" width="56" height="40" fill="#2C4A5C" stroke="#C9A85A" strokeWidth="2.5" />
    <path d="M-28 6 Q-12 -6 0 4 Q12 -10 28 2 V20 H-28 Z" fill="#3E6A4A" />
    <circle cx="14" cy="-9" r="5" fill={WARM} />
    <path d="M-36 -28 L-28 -20 M36 -28 L28 -20 M-36 28 L-28 20 M36 28 L28 20" stroke="#C9A85A" strokeWidth="2" />
    {crack > 0 && <path d={`M4 -20 L-2 -6 L8 2 L-4 20`} fill="none" stroke={RED} strokeWidth="3.5" opacity={crack} />}
    {stamp > 0 && (
      <g transform={`rotate(-14) scale(${eob(Math.min(1, stamp), 2)})`} opacity={Math.min(1, stamp)}>
        <rect x="-30" y="-11" width="60" height="22" rx="3" fill="none" stroke={RED} strokeWidth="3" />
        <text y="7" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="16" letterSpacing="2" fill={RED}>FALSO</text>
      </g>
    )}
  </g>
);
/** Neil: lo zaino con il filo rosso appeso alla cerniera. */
export const Backpack: React.FC<{ T: number; s?: number; color?: string }> = ({ T, s = 1, color = INK }) => (
  <g transform={`scale(${s})`} strokeLinejoin="round" strokeLinecap="round">
    <path d="M-12 -34 Q0 -44 12 -34" fill="none" stroke={INK} strokeWidth="4" />
    <path d="M-28 -22 Q-30 -34 -14 -34 H14 Q30 -34 28 -22 V26 Q28 34 20 34 H-20 Q-28 34 -28 26 Z" fill="#3B4A3A" stroke={color} strokeWidth="4" />
    <rect x="-18" y="2" width="36" height="24" rx="5" fill="#2E3B2E" stroke={INK} strokeWidth="3" />
    <path d="M-28 -12 H28" stroke={INK} strokeWidth="2.5" opacity=".6" />
    <path d={`M14 -12 q${2 + Math.sin(T * 3) * 3} 14 ${-2 + Math.sin(T * 3 + 1) * 4} 24`} fill="none" stroke={RED} strokeWidth="4.5" />
    <circle cx={12 + Math.sin(T * 3 + 1) * 4} cy="13" r="4" fill={RED} />
  </g>
);
/** L'uomo mascherato: una maschera da sub/antigas con il punto di domanda. */
const Mask: React.FC = () => (
  <g strokeLinejoin="round">
    <path d="M-28 -24 Q-28 -36 0 -36 Q28 -36 28 -24 V0 Q24 18 0 20 Q-24 18 -28 0 Z" fill="#1E3346" stroke={BLUE} strokeWidth="4" />
    <rect x="-20" y="-26" width="40" height="14" rx="7" fill="#0B1620" stroke={INK} strokeWidth="2.5" />
    <path d="M-18 -22 H18" stroke={BLUE} strokeWidth="2" opacity=".6" />
    {/* il filtro rotondo sotto e il tubo che va di lato */}
    <circle cx="0" cy="22" r="14" fill="#2A4258" stroke={INK} strokeWidth="3" />
    {[0, 60, 120].map((a) => <path key={a} d="M-9 0 H9" stroke={INK} strokeWidth="2" transform={`translate(0 22) rotate(${a})`} />)}
    <path d="M14 26 Q34 30 34 10 Q34 -8 26 -14" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" />
    <path d="M14 26 Q34 30 34 10 Q34 -8 26 -14" fill="none" stroke="#3A4656" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3" />
  </g>
);
/** Proiettile visto di lato, punta a destra. */
export const Bullet: React.FC<{ color?: string; s?: number }> = ({ color = BLUE, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M-22 -8 H6 Q22 -8 26 0 Q22 8 6 8 H-22 Z" fill="#C9A24E" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M6 -8 Q22 -8 26 0 Q22 8 6 8 Z" fill={color} />
    <path d="M-18 -4 H2" stroke="#FFF3C8" strokeWidth="2" opacity=".7" />
    <path d="M-22 -8 V8" stroke={INK} strokeWidth="2.5" />
  </g>
);
/** Un pezzo dell'Algoritmo: prisma esagonale con un'incisione luminosa. */
const Piece: React.FC<{ lit?: number; color?: string }> = ({ lit = 0, color = WARM }) => (
  <g strokeLinejoin="round">
    <path d="M-14 -22 H14 L22 0 L14 22 H-14 L-22 0 Z" fill="#28323E" stroke={INK} strokeWidth="3" />
    <path d="M-14 -22 L-8 -14 H8 L14 -22 M-8 -14 L-14 0 M8 -14 L14 0" fill="none" stroke={DIM} strokeWidth="1.8" />
    <path d="M-6 2 H6 M0 -4 V10" stroke={color} strokeWidth="3" opacity={0.35 + 0.65 * lit} strokeLinecap="round" />
  </g>
);

// ---------------------------------------------------------------- elementi dello schema

const Node: React.FC<{ T: number; t0: number; p: P; name: string; sub?: string; ring?: number; r?: number; fade?: number; color?: string; side?: 'below' | 'above'; children?: React.ReactNode; size?: number; dead?: number }> = ({
  T, t0, p, name, sub, ring = 0, r = 62, fade = 1, color = INK, side = 'below', children, size: size0 = 38, dead = 0,
}) => {
  if (T < t0 || fade <= 0) return null;
  const size = fit(size0);
  const s = pop(T, t0);
  const ly = side === 'below' ? r + size + 6 : -r - (sub ? size * 0.95 + 18 : 18);
  const hi = color === INK ? WARM : color;
  return (
    <g transform={`translate(${p[0]} ${p[1]})`} opacity={seg(T, t0, t0 + 0.15) * fade}>
      <g transform={`scale(${s})`}>
        {ring > 0 && <Glow id={`tn-g${p[0]}${p[1]}`} x={0} y={0} r={r * 2.4} t={T} color={hi} amp={0.1} rate={2.4} opacity={0.5 * Math.min(1, ring)} />}
        <circle r={r} fill="#1A2430" stroke={ring > 0.5 ? hi : color} strokeWidth={ring > 0.5 ? 7 : 4.5} />
        <circle r={r - 8} fill="none" stroke={DIM} strokeWidth="1.5" opacity=".6" />
        <g transform={`scale(${r / 44})`} opacity={1 - 0.6 * dead}>{children}</g>
        {dead > 0 && <path d={`M${-r * 0.55} ${-r * 0.55} L${r * 0.55} ${r * 0.55} M${r * 0.55} ${-r * 0.55} L${-r * 0.55} ${r * 0.55}`} stroke={DIM} strokeWidth="7" strokeLinecap="round" opacity={dead} />}
      </g>
      {name && <text y={ly} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={size} fill={INK} stroke={DARK} strokeWidth="6" paintOrder="stroke" opacity={seg(T, t0 + 0.2, t0 + 0.5)}>{name}</text>}
      {sub && <text y={ly + size * 0.85} textAnchor="middle" fontFamily={SANS} fontWeight={400} fontSize={size * 0.72} fill="#AEB8C4" stroke={DARK} strokeWidth="5" paintOrder="stroke" opacity={seg(T, t0 + 0.3, t0 + 0.6)}>{sub}</text>}
    </g>
  );
};

/** Linea dello schema che si disegna (maschera). `flow` fa scorrere il tratteggio; `back` lo fa scorrere al contrario. */
const Link: React.FC<{ T: number; t0: number; a: P; b: P; c?: P; color?: string; dashed?: boolean; label?: string; arrow?: boolean; w?: number; lx?: number; ly?: number; size?: number; fade?: number; flow?: boolean; hand?: boolean }> = ({
  T, t0, a, b, c, color = INK, dashed = false, label, arrow = false, w = 6, lx = 0, ly = 0, size: size0 = 44, fade = 1, flow = false, hand = true,
}) => {
  const size = fit(size0);
  if (T < t0 || fade <= 0) return null;
  const p = eo(seg(T, t0, t0 + 0.6));
  const [mx, my] = c ?? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const d = `M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`;
  const ang = (Math.atan2(b[1] - my, b[0] - mx) * 180) / Math.PI;
  const id = `tn-m${a[0]}${a[1]}${b[0]}${b[1]}`;
  const tx = 0.25 * a[0] + 0.5 * mx + 0.25 * b[0], ty = 0.25 * a[1] + 0.5 * my + 0.25 * b[1];
  return (
    <g opacity={fade}>
      <mask id={id} maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="9000"><path d={d} fill="none" stroke="#fff" strokeWidth={w + 10} pathLength={1} strokeDasharray={`${p} 1`} /></mask>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray={dashed ? `${w * 3} ${w * 2.2}` : undefined} strokeDashoffset={flow ? -T * 60 : 0} strokeLinecap="round" mask={`url(#${id})`} />
      {arrow && p > 0.95 && <path d={`M${-w * 3.4} ${-w * 2.3} L0 0 L${-w * 3.4} ${w * 2.3}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${b[0]} ${b[1]}) rotate(${ang})`} />}
      {label && (
        <text x={tx + lx} y={ty + ly} textAnchor="middle" fontFamily={hand ? HAND : SANS} fontWeight={700} fontSize={size} fill={color} stroke={DARK} strokeWidth="7" paintOrder="stroke" opacity={seg(T, t0 + 0.4, t0 + 0.8)}>{label}</text>
      )}
    </g>
  );
};

/** Cartellino pieno = colpo di scena o parola chiave. */
const Tag: React.FC<{ T: number; t0: number; x: number; y: number; text: string; bg?: string; fg?: string; size?: number; rot?: number; until?: number }> = ({
  T, t0, x, y, text, bg = WARM, fg = DARK, size: size0 = 36, rot = 0, until = 1e9,
}) => {
  const size = fit(size0);
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

// ---------------------------------------------------------------- disegni delle stazioni (linee chiare su lavagna)

const L = { fill: 'none', stroke: INK, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;
const rr = rng(2020);
const STARS = Array.from({ length: 26 }, () => ({ x: X0 + 20 + rr() * (X1 - X0 - 40), y: 60 + rr() * 170, s: 1.5 + rr() * 2.5, ph: rr() * 6 }));
const CRATES = Array.from({ length: 7 }, (_, i) => ({ x: 130 + i * 118 + (i % 2) * 10, w: 96 + ((i * 29) % 20), h: 70 + ((i * 41) % 50) }));
const CARS = Array.from({ length: 6 }, (_, i) => ({ lane: i % 3, ph: rr(), v: 0.18 + rr() * 0.1 }));
const RUINS = Array.from({ length: 10 }, (_, i) => ({ x: 120 + i * 86, w: 60 + ((i * 23) % 30), h: 90 + ((i * 67) % 140) }));
const DUST = Array.from({ length: 30 }, () => ({ x: X0 + rr() * (X1 - X0), y: rr(), v: 10 + rr() * 22, s: 1.5 + rr() * 2.5, ph: rr() * 6 }));

/** Il laboratorio: muro di cemento con il bersaglio e i fori, il tavolo con la pistola, la lampada che pende. */
export const ArtLab: React.FC<{ T: number; holes?: number }> = ({ T, holes = 1 }) => {
  const y0 = BAND.lab.y0;
  return (
    <g>
      {/* muro di prova a destra, a blocchi */}
      <rect x="720" y={y0 + 70} width="230" height="410" fill="#26303B" stroke={INK} strokeWidth="4" />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M720 ${y0 + 70 + i * 51} H950`} stroke={DIM} strokeWidth="1.5" opacity=".7" />)}
      {Array.from({ length: 16 }, (_, i) => <path key={`v${i}`} d={`M${720 + (i % 2 ? 57 : 115) + (i % 4 > 1 ? 58 : 0)} ${y0 + 70 + Math.floor(i / 2) * 51} v51`} stroke={DIM} strokeWidth="1.5" opacity=".5" />)}
      <path d="M720 70 L735 80" transform={`translate(0 ${y0})`} stroke={INK} strokeWidth="2" />
      {/* bersaglio */}
      {[54, 38, 22, 8].map((r, i) => <circle key={r} cx="835" cy={y0 + 210} r={r} fill={i % 2 ? '#26303B' : '#3A4656'} stroke={INK} strokeWidth="3" />)}
      {/* fori dei proiettili, con le crepe */}
      {([[812, 190], [858, 232], [790, 330]] as const).map(([x, y], i) => (
        <g key={i} opacity={i === 2 ? holes : 1}>
          <circle cx={x} cy={y0 + y} r="7" fill={DARK} stroke={INK} strokeWidth="2" />
          <path d={`M${x} ${y0 + y} l14 -10 M${x} ${y0 + y} l-12 -12 M${x} ${y0 + y} l10 14 M${x} ${y0 + y} l-14 8`} stroke={INK} strokeWidth="1.8" opacity=".8" />
        </g>
      ))}
      {/* il tavolo */}
      <path d={`M300 ${y0 + 400} H700`} {...L} strokeWidth="8" />
      <path d={`M320 ${y0 + 404} V${y0 + 488} M680 ${y0 + 404} V${y0 + 488} M320 ${y0 + 460} H680`} {...L} strokeWidth="5" />
      <path d={`M300 ${y0 + 395} H700`} stroke="#FFFFFF" strokeWidth="2" opacity=".35" />
      {/* la pistola posata, canna verso il muro */}
      <g transform={`translate(480 ${y0 + 372})`}>
        <path d="M-56 -14 H40 V4 H-20 L-26 26 H-46 L-40 4 H-56 Z" fill="#3A4656" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M-50 -8 H30" stroke="#FFFFFF" strokeWidth="2" opacity=".4" />
        <path d="M-30 4 Q-24 14 -14 4" fill="none" stroke={INK} strokeWidth="3" />
        <rect x="40" y="-11" width="8" height="12" fill="#222C36" stroke={INK} strokeWidth="2.5" />
      </g>
      {/* bossoli e proiettili sul tavolo, una scatola di munizioni */}
      {[600, 625, 650].map((x, i) => <g key={x} transform={`translate(${x} ${y0 + 388}) rotate(-90) scale(.55)`}><Bullet color={i === 1 ? BLUE : '#C9A24E'} /></g>)}
      <rect x="360" y={y0 + 364} width="56" height="34" rx="3" fill="#4A3E2A" stroke={INK} strokeWidth="3" />
      <path d={`M366 ${y0 + 376} H410`} stroke={WARM} strokeWidth="2" opacity=".6" />
      {/* la lampada che pende, con il cono di luce */}
      <path d={`M380 ${y0} V${y0 + 120}`} stroke={INK} strokeWidth="3" />
      <path d={`M350 ${y0 + 150} Q380 ${y0 + 112} 410 ${y0 + 150} Z`} fill="#3A4656" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d={`M352 ${y0 + 152} L250 ${y0 + 400} H520 L408 ${y0 + 152} Z`} fill={WARM} opacity={0.07 + 0.015 * Math.sin(T * 3)} />
      <Glow id="tn-lamp" x={380} y={y0 + 156} r={80} t={T} color={WARM} amp={0.08} rate={3} opacity={0.55} />
      {/* scaffale e nastro di pericolo */}
      <path d={`M130 ${y0 + 480} H960`} {...L} strokeWidth="4" />
      {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${140 + i * 40} ${y0 + 500} l22 -18`} stroke={WARM} strokeWidth="5" opacity=".55" />)}
    </g>
  );
};

/** Lo yacht di Sator sul mare; `sunset` 0..1 = il tramonto in Vietnam. */
export const ArtYacht: React.FC<{ T: number; sunset?: number }> = ({ T, sunset = 0 }) => {
  const y0 = BAND.yacht.y0, sea = y0 + 380;
  return (
    <g>
      <defs>
        <linearGradient id="tn-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A2A44" />
          <stop offset=".6" stopColor="#B4503A" />
          <stop offset="1" stopColor="#F2A45A" />
        </linearGradient>
      </defs>
      <rect x={X0 + 4} y={y0 + 4} width={X1 - X0 - 8} height={sea - y0 - 4} fill="url(#tn-sun)" opacity={0.75 * sunset} />
      {STARS.map((s, i) => <circle key={i} cx={s.x} cy={y0 + s.y} r={s.s} fill={INK} opacity={(1 - sunset) * (0.35 + 0.35 * Math.sin(T * 1.7 + s.ph))} />)}
      <circle cx="830" cy={lerp(y0 + 120, sea - 30, sunset)} r={lerp(34, 60, sunset)} fill={lerp(0, 1, sunset) > 0.5 ? WARM : '#DDE3EA'} stroke={INK} strokeWidth="3" />
      <Glow id="tn-moon" x={830} y={lerp(y0 + 120, sea - 30, sunset)} r={140} t={T} color={sunset > 0.5 ? WARM : '#DDE3EA'} amp={0.06} rate={1.5} opacity={0.4} />
      {/* lo yacht: scafo lungo, due ponti con le finestre, l'albero con le luci */}
      <g transform={`translate(0 ${Math.sin(T * 1.3) * 4})`}>
        <path d={`M170 ${sea - 50} H900 L860 ${sea + 8} H230 Z`} fill="#2A3846" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <path d={`M190 ${sea - 36} H880`} stroke="#FFFFFF" strokeWidth="2.5" opacity=".4" />
        <path d={`M300 ${sea - 50} L330 ${sea - 110} H720 L770 ${sea - 50}`} fill="#33445A" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d={`M400 ${sea - 110} L420 ${sea - 160} H640 L670 ${sea - 110}`} fill="#3C4F66" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={350 + i * 46} y={sea - 96} width="30" height="20" rx="4" fill={i % 3 === 1 ? DARK : WARM} opacity={i % 3 === 1 ? 0.8 : 0.75 + 0.15 * Math.sin(T * 2 + i)} />)}
        {Array.from({ length: 4 }, (_, i) => <rect key={`u${i}`} x={440 + i * 50} y={sea - 148} width="32" height="18" rx="4" fill={WARM} opacity=".55" />)}
        <path d={`M530 ${sea - 160} V${y0 + 70} M530 ${y0 + 90} L300 ${sea - 110} M530 ${y0 + 90} L760 ${sea - 110}`} stroke={INK} strokeWidth="3" />
        {Array.from({ length: 9 }, (_, i) => <circle key={`l${i}`} cx={lerp(530, 300, (i + 1) / 10)} cy={lerp(y0 + 90, sea - 110, (i + 1) / 10)} r="4" fill={WARM} opacity={0.5 + 0.5 * Math.sin(T * 3 + i)} />)}
      </g>
      {/* il mare con le onde e il riflesso */}
      <rect x={X0 + 4} y={sea + 4} width={X1 - X0 - 8} height={y0 + H - sea - 8} fill="#18283A" />
      {[0, 1, 2, 3].map((k) => (
        <path key={k} d={Array.from({ length: 23 }, (_, i) => `${i ? 'L' : 'M'}${X0 + i * 39} ${sea + 30 + k * 30 + Math.sin(i * 0.9 + T * (1.2 + k * 0.3) + k) * 5}`).join(' ')} {...L} strokeWidth={3 - k * 0.5} opacity={0.55 - k * 0.1} />
      ))}
      {Array.from({ length: 6 }, (_, i) => <path key={`r${i}`} d={`M${800 + Math.sin(T * 2 + i) * 10} ${sea + 24 + i * 16} h${60 - i * 8}`} stroke={sunset > 0.5 ? WARM : '#DDE3EA'} strokeWidth="3" opacity=".5" />)}
    </g>
  );
};

/** Oslo: il deposito d'arte con le casse e, in mezzo, il tornello (metà rossa e metà blu, la porta che gira). */
export const ArtOslo: React.FC<{ T: number; spin?: number }> = ({ T, spin = 0.3 }) => {
  const y0 = BAND.oslo.y0, floor = y0 + 470;
  const [tx, ty] = N.turn;
  return (
    <g>
      {/* scaffali con le casse delle opere d'arte */}
      {[y0 + 120, y0 + 250].map((sy, k) => (
        <g key={k} opacity={0.75}>
          <path d={`M120 ${sy} H960`} stroke={INK} strokeWidth="3" />
          {CRATES.map((c, i) => (i === 3 || i === 4) ? null : (
            <g key={i}>
              <rect x={c.x} y={sy - c.h * 0.8} width={c.w} height={c.h * 0.8} fill="#2E2A22" stroke={DIM} strokeWidth="2.5" />
              <path d={`M${c.x} ${sy - c.h * 0.8} L${c.x + c.w} ${sy} M${c.x + c.w} ${sy - c.h * 0.8} L${c.x} ${sy}`} stroke={DIM} strokeWidth="1.5" opacity=".6" />
              <rect x={c.x + 10} y={sy - c.h * 0.8 + 8} width="34" height="12" fill={WARM} opacity=".5" />
            </g>
          ))}
        </g>
      ))}
      <path d={`M120 ${floor} H960`} {...L} strokeWidth="5" />
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${560 + (i - 4.5) * 40} ${floor} L${560 + (i - 4.5) * 120} ${y0 + H - 6}`} stroke={DIM} strokeWidth="1.5" opacity=".5" />)}
      {/* il tornello: un cilindro di vetro diviso in due camere */}
      <g transform={`translate(${tx} ${ty})`}>
        <Glow id="tn-turnR" x={-60} y={0} r={170} t={T} color={RED} amp={0.1} rate={2} opacity={0.35} />
        <Glow id="tn-turnB" x={60} y={0} r={170} t={T} color={BLUE} amp={0.1} rate={2} ph={3} opacity={0.35} />
        <ellipse cx="0" cy="-150" rx="120" ry="26" fill="#2A3442" stroke={INK} strokeWidth="5" />
        <path d="M-120 -150 V150 M120 -150 V150" stroke={INK} strokeWidth="5" />
        <path d="M-120 -150 V150 A120 26 0 0 0 0 176 V-124 A120 26 0 0 1 -120 -150 Z" fill={RED} opacity=".22" />
        <path d="M120 -150 V150 A120 26 0 0 1 0 176 V-124 A120 26 0 0 0 120 -150 Z" fill={BLUE} opacity=".22" />
        <ellipse cx="0" cy="150" rx="120" ry="26" fill="#1A222C" stroke={INK} strokeWidth="5" />
        {[0, 1, 2, 3].map((k) => {
          const a = mod(T * spin + k / 4, 1) * Math.PI * 2;
          const x = Math.sin(a) * 116, front = Math.cos(a) > 0;
          return <path key={k} d={`M0 -124 L${x} ${-150 + Math.cos(a) * 26 * 0.9} V${150 + Math.cos(a) * 26 * 0.9} L0 176`} fill="none" stroke={INK} strokeWidth={front ? 5 : 2.5} opacity={front ? 0.95 : 0.4} />;
        })}
        <path d="M0 -124 V176" stroke={INK} strokeWidth="6" />
        <rect x="-36" y="-206" width="72" height="34" rx="6" fill={DARK} stroke={INK} strokeWidth="3" />
        <path d="M-24 -189 H-4 M4 -189 H24" stroke={RED} strokeWidth="5" />
        <path d="M4 -189 H24" stroke={BLUE} strokeWidth="5" />
      </g>
    </g>
  );
};

/** Tallinn: l'autostrada in prospettiva con le auto (una va in retromarcia, blu), i lampioni e il magazzino col tornello. */
export const ArtTallinn: React.FC<{ T: number }> = ({ T }) => {
  const y0 = BAND.tallinn.y0, hz = y0 + 150, bot = y0 + H - 6;
  const lane = (k: number, u: number) => [lerp(540 + (k - 1) * 30, 540 + (k - 1) * 260, u), lerp(hz, bot, u)] as const;
  return (
    <g>
      <rect x={X0 + 4} y={y0 + 4} width={X1 - X0 - 8} height={hz - y0} fill="#1C2733" />
      {/* skyline lontano */}
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={130 + i * 70} y={hz - 30 - ((i * 37) % 60)} width="54" height={30 + ((i * 37) % 60)} fill="#2A3644" />)}
      {Array.from({ length: 12 }, (_, i) => <rect key={`w${i}`} x={142 + i * 70} y={hz - 20 - ((i * 37) % 40)} width="10" height="8" fill={WARM} opacity={(i % 3) ? 0.5 : 0.15} />)}
      <path d={`M${X0} ${hz} H${X1}`} stroke={INK} strokeWidth="3" />
      {/* la carreggiata */}
      <path d={`M500 ${hz} L150 ${bot} M580 ${hz} L930 ${bot}`} {...L} strokeWidth="5" />
      {[1, 2].map((k) => <path key={k} d={`M${lerp(500, 580, k / 3)} ${hz} L${lerp(150, 930, k / 3)} ${bot}`} stroke={WARM} strokeWidth="4" strokeDasharray="26 22" strokeDashoffset={-T * 40} opacity=".55" />)}
      {/* lampioni con gli aloni */}
      {[0.3, 0.55, 0.85].map((u, i) => {
        const x = lerp(495, 130, u), y = lerp(hz, bot, u), h = 40 + u * 150;
        return (
          <g key={i}>
            <path d={`M${x} ${y} V${y - h} h${20 + u * 30}`} stroke={INK} strokeWidth={2 + u * 3} fill="none" />
            <Glow id={`tn-st${i}`} x={x + 20 + u * 30} y={y - h + 4} r={30 + u * 60} t={T} color={WARM} amp={0.06} rate={2} ph={i} opacity={0.6} />
          </g>
        );
      })}
      {/* auto: rosse in avanti (scendono verso di noi), una blu in retromarcia (risale) */}
      {CARS.map((c, i) => {
        const inv = i === 2;
        const u = 0.12 + 0.8 * mod(c.ph + (inv ? -1 : 1) * T * c.v, 1);
        const [x, y] = lane(c.lane, u);
        const s = 0.3 + u * 0.9;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <rect x="-46" y="-30" width="92" height="40" rx="10" fill="#2E3A48" stroke={inv ? BLUE : INK} strokeWidth="5" />
            <path d="M-34 -30 L-24 -52 H24 L34 -30" fill="#3A4858" stroke={inv ? BLUE : INK} strokeWidth="4" strokeLinejoin="round" />
            <circle cx="-30" cy="-12" r="8" fill={inv ? BLUE : RED} />
            <circle cx="30" cy="-12" r="8" fill={inv ? BLUE : RED} />
            <rect x="-50" y="8" width="20" height="12" rx="3" fill={DARK} />
            <rect x="30" y="8" width="20" height="12" rx="3" fill={DARK} />
          </g>
        );
      })}
      {/* il magazzino a lato con il piccolo tornello */}
      <g transform={`translate(${N.turnT[0]} ${N.turnT[1]})`}>
        <rect x="-70" y="-60" width="140" height="120" fill="#24303C" stroke={INK} strokeWidth="4" />
        <path d="M-70 -60 L0 -100 L70 -60" fill="none" stroke={INK} strokeWidth="4" />
        <ellipse cx="0" cy="-30" rx="38" ry="9" fill="none" stroke={INK} strokeWidth="3" />
        <path d="M-38 -30 V40 M38 -30 V40" stroke={INK} strokeWidth="3" />
        <path d="M-38 -30 V40 H0 V-21 Z" fill={RED} opacity=".35" />
        <path d="M38 -30 V40 H0 V-21 Z" fill={BLUE} opacity=".35" />
        <path d={`M0 -21 L${Math.sin(T * 2) * 36} -28 V44 L0 48`} fill="none" stroke={INK} strokeWidth="3" />
      </g>
    </g>
  );
};

/** Il covo: la città abbandonata, il cancello sbarrato a destra, i nove pezzi dell'Algoritmo sotto terra. */
export const ArtCovo: React.FC<{ T: number; gate?: number }> = ({ T, gate = 0 }) => {
  const y0 = BAND.covo.y0, ground = y0 + 190;
  const [gx, gy] = N.gate;
  return (
    <g>
      <rect x={X0 + 4} y={y0 + 4} width={X1 - X0 - 8} height={ground - y0} fill="#2A2420" opacity=".8" />
      {RUINS.map((b, i) => (
        <g key={i}>
          <path d={`M${b.x} ${ground} V${ground - b.h} l${b.w * 0.3} ${-12 - (i % 3) * 8} l${b.w * 0.25} 18 l${b.w * 0.45} -10 V${ground}`} fill="#3A332C" stroke={DIM} strokeWidth="2.5" />
          {Array.from({ length: Math.floor(b.h / 34) }, (_, k) => <rect key={k} x={b.x + 10} y={ground - b.h + 14 + k * 34} width={b.w - 20} height="12" fill={DARK} opacity=".8" />)}
        </g>
      ))}
      {/* fumo che sale dalle rovine */}
      {[0, 1, 2].map((k) => {
        const u = mod(T * 0.12 + k / 3, 1);
        return <circle key={k} cx={260 + k * 220 + Math.sin(T + k) * 14} cy={ground - 120 - u * 60} r={26 + u * 40} fill="#5A5048" opacity={0.6 * (1 - u)} />;
      })}
      <path d={`M${X0} ${ground} H${X1}`} {...L} strokeWidth="5" />
      {/* lo scavo sotto terra, a strati */}
      <path d={`M190 ${ground} L250 ${y0 + H - 30} H800 L860 ${ground}`} fill="#1A1714" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      {[0.3, 0.6].map((u, i) => <path key={i} d={`M${lerp(190, 250, u)} ${lerp(ground, y0 + H - 30, u)} H${lerp(860, 800, u)}`} stroke={DIM} strokeWidth="2" strokeDasharray="14 10" />)}
      {/* il cancello del passaggio, a destra */}
      <g transform={`translate(${gx} ${gy})`}>
        <rect x="-70" y="-90" width="140" height="190" fill="#141210" stroke={INK} strokeWidth="5" />
        <g transform={`translate(-66 0) scale(${1 - gate * 0.82} 1) translate(66 0)`}>
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${-60 + i * 20} -86 V96`} stroke="#9AA6B4" strokeWidth="6" />)}
          <path d="M-66 -40 H66 M-66 40 H66" stroke="#9AA6B4" strokeWidth="5" />
          <rect x="34" y="-10" width="20" height="24" rx="3" fill="#3A4656" stroke={INK} strokeWidth="3" />
        </g>
      </g>
      {/* polvere nell'aria */}
      {DUST.map((d, i) => <circle key={i} cx={mod(d.x + T * d.v, X1 - X0) + X0} cy={y0 + 40 + d.y * (H - 80)} r={d.s} fill="#C8B8A0" opacity={0.25 + 0.15 * Math.sin(T * 2 + d.ph)} />)}
    </g>
  );
};

/** Il futuro: terra secca e spaccata, il letto di un fiume senza acqua, un albero morto, il sole velato. */
export const ArtFuturo: React.FC<{ T: number }> = ({ T }) => {
  const y0 = BAND.futuro.y0, hz = y0 + 230;
  return (
    <g>
      <defs>
        <linearGradient id="tn-fsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A2A22" />
          <stop offset=".7" stopColor="#8A4A2E" />
          <stop offset="1" stopColor="#C27A44" />
        </linearGradient>
      </defs>
      <rect x={X0 + 4} y={y0 + 4} width={X1 - X0 - 8} height={hz - y0 - 4} fill="url(#tn-fsky)" opacity=".8" />
      <circle cx="380" cy={y0 + 140} r="62" fill="#F2B060" opacity=".85" />
      <Glow id="tn-fsun" x={380} y={y0 + 140} r={220} t={T} color="#F2A050" amp={0.05} rate={1.2} opacity={0.5} />
      {/* città spenta all'orizzonte */}
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${520 + i * 48} ${hz} V${hz - 40 - ((i * 53) % 90)} h34 V${hz}`} fill="#2A201C" stroke="#5A4638" strokeWidth="2" />)}
      <rect x={X0 + 4} y={hz} width={X1 - X0 - 8} height={y0 + H - hz - 4} fill="#3A2E24" />
      <path d={`M${X0} ${hz} H${X1}`} {...L} strokeWidth="4" />
      {/* la terra spaccata */}
      {Array.from({ length: 22 }, (_, i) => {
        const x = 130 + (i % 6) * 150 + (Math.floor(i / 6) % 2) * 70, y = hz + 40 + Math.floor(i / 6) * 60;
        return <path key={i} d={`M${x} ${y} l30 12 l-6 26 l34 8 M${x + 30} ${y + 12} l40 -14`} stroke="#1E1610" strokeWidth="3" fill="none" />;
      })}
      {/* il letto del fiume secco */}
      <path d={`M120 ${y0 + H - 40} Q360 ${hz + 60} 560 ${hz + 120} T960 ${hz + 40}`} fill="none" stroke="#5A4A3A" strokeWidth="34" strokeLinecap="round" />
      <path d={`M120 ${y0 + H - 40} Q360 ${hz + 60} 560 ${hz + 120} T960 ${hz + 40}`} fill="none" stroke="#2A2018" strokeWidth="3" strokeDasharray="10 14" />
      {/* l'albero morto */}
      <path d={`M220 ${hz + 120} V${hz - 40} M220 ${hz - 10} L170 ${hz - 70} M220 ${hz - 30} L268 ${hz - 90} M190 ${hz - 50} L180 ${hz - 96}`} {...L} stroke="#C8B8A0" strokeWidth="6" />
      {/* polvere calda nel vento */}
      {DUST.map((d, i) => <circle key={i} cx={mod(d.x - T * d.v * 1.5, X1 - X0) + X0} cy={y0 + 30 + d.y * (H - 60)} r={d.s} fill="#F2C08A" opacity={0.25 + 0.15 * Math.sin(T * 2 + d.ph)} />)}
    </g>
  );
};

// ---------------------------------------------------------------- lo schema

const SATOR = ['SATOR', 'AREPO', 'TENET', 'OPERA', 'ROTAS'];
const r = rng(909);
const MOTES = Array.from({ length: 22 }, () => ({ x: r() * 1080, y: r() * 1920, s: 1.5 + r() * 3, v: 4 + r() * 10, ph: r() * 6 }));

const Schema: React.FC<{ T: number }> = ({ T }) => {
  const bandAt: Record<BandKey, number> = {
    lab: at('invertiti', 0), futuro: at('futuro', 0, 0.2), yacht: at('sator', 0), oslo: at('tornello', 0), covo: at('algoritmo', 0), tallinn: at('mascherato', 0),
  };
  const focus = (t0: number, t1: number) => seg(T, t0, t0 + 0.3) * (1 - seg(T, t1, t1 + 0.4));
  const off = (ch: string) => 1 - seg(T, end(ch) - 0.4, end(ch) + 0.3);
  // eventi principali
  const shot = (t0: number) => mod(T - t0, 2.25) / 2.25; // il proiettile che torna nella pistola, in ciclo ogni 3 battiti
  const shotOn = T >= at('invertiti', 2) && T < end('invertiti') + 1;
  const tracks = eo(seg(T, at('invertiti', 3, 0.2), at('invertiti', 3, 1.4)));
  const erase = eio(seg(T, at('algoritmo', 2, 0.2), at('algoritmo', 2, 1.6))) * (1 - eio(seg(T, end('algoritmo') - 0.9, end('algoritmo') + 0.3)));
  const assemble = eio(seg(T, at('algoritmo', 1, 0.1), at('algoritmo', 1, 1.2)));
  const sunset = eio(seg(T, at('battito', 3, 0.1), at('battito', 3, 1.2)));
  const flat = seg(T, at('battito', 2, 0.3), at('battito', 2, 0.5)) * (1 - seg(T, at('battito', 2, 1.6), at('battito', 2, 1.9)));
  const dead = seg(T, at('neil', 1, 0.8), at('neil', 1, 1.1));
  const beat = (1 - flat) * (1 - dead) * (T > at('tenaglia', 2) && T < at('neil', 1) ? 1.25 : 0.8);
  const redFlash = flat > 0 ? seg(T, at('battito', 2, 0.3), at('battito', 2, 0.45)) * (1 - seg(T, at('battito', 2, 0.6), at('battito', 2, 1.5))) : 0;
  const katHit = seg(T, at('mascherato', 0, 1.0), at('mascherato', 0, 1.15));
  const reveal = seg(T, at('mascherato', 3, 0.2), at('mascherato', 3, 0.7));
  const gate = eio(seg(T, at('neil', 0, 0.5), at('neil', 0, 1.5)));
  const soldierDead = seg(T, at('neil', 0, 1.6), at('neil', 0, 2.2));
  const algoSafe = seg(T, at('neil', 1, 0.1), at('neil', 1, 0.5));
  const spinOslo = 0.3 + 0.9 * focus(at('tornello', 1), at('tornello', 3)) + 0.9 * focus(at('mascherato', 2), at('mascherato', 3, 1));
  const big = (z: number) => z;
  const masked = N.masked;
  const fight = focus(at('tornello', 2, 0.2), end('tornello')) + focus(at('mascherato', 3, 0.2), end('mascherato'));

  return (
    <g>
      {/* il quadrato del Sator gigante, inciso dietro tutto lo schema */}
      <g opacity=".05">
        {SATOR.map((w, i) => <text key={i} x="540" y={1000 + i * 720} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="760" letterSpacing="120" fill={INK}>{w}</text>)}
      </g>
      {/* il quadrato del Sator, inciso sullo sfondo a ogni stazione, molto tenue */}
      {BANDS.map((b, k) => (
        <g key={b.key} opacity=".07">
          {SATOR.map((w, i) => (
            <text key={i} x={k % 2 ? 300 : 780} y={b.y0 + 120 + i * 82} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="84" letterSpacing="22" fill={INK}>{w}</text>
          ))}
        </g>
      ))}

      {/* i due binari del tempo */}
      {tracks > 0 && (
        <g opacity={tracks}>
          <mask id="tn-trk" maskUnits="userSpaceOnUse" x="-100" y="0" width="1300" height="4300"><rect x="-100" y="300" width="1300" height={3800 * tracks} fill="#fff" /></mask>
          <g mask="url(#tn-trk)">
            <path d={`M${RX} 330 V4060`} stroke={RED} strokeWidth="10" strokeDasharray="40 26" strokeDashoffset={-T * 80} />
            <path d={`M${RX - 22} 4030 L${RX} 4070 L${RX + 22} 4030`} fill="none" stroke={RED} strokeWidth="10" strokeLinejoin="round" />
          </g>
          <mask id="tn-trk2" maskUnits="userSpaceOnUse" x="-100" y="0" width="1300" height="4300"><rect x="-100" y={4100 - 3800 * tracks} width="1300" height="3800" fill="#fff" /></mask>
          <g mask="url(#tn-trk2)">
            <path d={`M${BX} 4060 V330`} stroke={BLUE} strokeWidth="10" strokeDasharray="40 26" strokeDashoffset={-T * 80} />
            <path d={`M${BX - 22} 360 L${BX} 320 L${BX + 22} 360`} fill="none" stroke={BLUE} strokeWidth="10" strokeLinejoin="round" />
          </g>
          <text x={RX + 30} y="372" fontFamily={SANS} fontWeight={900} fontSize="30" letterSpacing="3" fill={RED} stroke={DARK} strokeWidth="6" paintOrder="stroke">▼ AVANTI</text>
          <text x={BX - 30} y="372" textAnchor="end" fontFamily={SANS} fontWeight={900} fontSize="30" letterSpacing="3" fill={BLUE} stroke={DARK} strokeWidth="6" paintOrder="stroke">INDIETRO ▲</text>
        </g>
      )}

      {/* sotto il futuro la terra spaccata continua fino al bordo: primo piano delle inquadrature basse */}
      {T >= bandAt.futuro && (
        <g opacity={eo(seg(T, bandAt.futuro, bandAt.futuro + 0.8))}>
          <rect x="-600" y={BAND.futuro.y0 + H + 30} width="2280" height="1400" fill="#2A221B" />
          <path d={`M-600 ${BAND.futuro.y0 + H + 30} H1680`} stroke="#5A4638" strokeWidth="4" />
          {Array.from({ length: 30 }, (_, i) => {
            const x = -500 + (i % 10) * 220 + (Math.floor(i / 10) % 2) * 100, y = BAND.futuro.y0 + H + 90 + Math.floor(i / 10) * 150;
            return <path key={i} d={`M${x} ${y} l60 24 l-12 52 l70 16 M${x + 60} ${y + 24} l80 -28`} stroke="#14100C" strokeWidth="6" fill="none" />;
          })}
          {DUST.map((d, i) => <circle key={i} cx={mod(d.x * 2 - T * d.v * 2, 2000) - 460} cy={BAND.futuro.y0 + H + 60 + d.y * 500} r={d.s * 2} fill="#F2C08A" opacity={0.2 + 0.15 * Math.sin(T * 2 + d.ph)} />)}
        </g>
      )}

      {/* le stazioni: prima tratteggiate e appena accennate, poi disegnate */}
      {BANDS.map((b) => {
        const t0 = bandAt[b.key];
        const p = eo(seg(T, t0, t0 + 0.7));
        const art = (k: BandKey) => (
          <>
            {k === 'lab' && <ArtLab T={T} holes={shotOn ? 1 - seg(shot(at('invertiti', 2)), 0.05, 0.12) * (1 - seg(shot(at('invertiti', 2)), 0.9, 0.98)) : 1} />}
            {k === 'yacht' && <ArtYacht T={T} sunset={sunset} />}
            {k === 'oslo' && <ArtOslo T={T} spin={spinOslo} />}
            {k === 'tallinn' && <ArtTallinn T={T} />}
            {k === 'covo' && <ArtCovo T={T} gate={gate} />}
            {k === 'futuro' && <ArtFuturo T={T} />}
          </>
        );
        return (
          <g key={b.key}>
            <rect x={X0} y={b.y0} width={X1 - X0} height={H} rx="10" fill="none" stroke={DIM} strokeWidth="4" strokeDasharray="18 14" opacity={0.6 * (1 - p)} />
            {p < 1 && <g opacity={0.2 * (1 - p)}>{art(b.key)}</g>}
            {p > 0 && (
              <g opacity={p}>
                <clipPath id={`tn-c${b.key}`}><rect x={X0} y={b.y0} width={X1 - X0} height={H} rx="10" /></clipPath>
                <rect x={X0} y={b.y0} width={X1 - X0} height={H} rx="10" fill={PAPER} />
                <g clipPath={`url(#tn-c${b.key})`}>{art(b.key)}</g>
                <rect x={X0} y={b.y0} width={X1 - X0} height={H} rx="10" fill="none" stroke={INK} strokeWidth="5" />
                <rect x={X0 + 6} y={b.y0 + 6} width={b.name.length * 19 + 30} height="44" rx="6" fill={DARK} opacity=".85" />
                <text x={X0 + 20} y={b.y0 + 38} fontFamily={SANS} fontWeight={900} fontSize="27" letterSpacing="3" fill={WARM}>{b.name}</text>
              </g>
            )}
          </g>
        );
      })}

      {/* ---- capitolo 1: il Protagonista, i proiettili invertiti */}
      <Node T={T} t0={at('invertiti', 0, 0.1)} p={N.prot} name="il Protagonista" sub="agente senza nome" ring={focus(at('invertiti', 0), at('invertiti', 1)) + focus(at('futuro', 2), at('futuro', 3, 1))}><Badge /></Node>
      <Tag T={T} t0={at('invertiti', 1, 0.3)} x={560} y={BAND.lab.y0 + 300} text="proiettili strani" size={34} until={at('invertiti', 2, -0.4)} />
      {shotOn && (() => {
        // il proiettile esce dal foro nel muro e torna nella canna, con la scia blu che si riavvolge
        const u = shot(at('invertiti', 2));
        const fly = eio(seg(u, 0.1, 0.6));
        const from: P = [790, BAND.lab.y0 + 330], to: P = [532, BAND.lab.y0 + 366];
        const x = lerp(from[0], to[0], fly), y = lerp(from[1], to[1], fly);
        const vis = seg(u, 0.08, 0.12) * (1 - seg(u, 0.6, 0.66));
        const fade = 1 - seg(T, end('invertiti') - 0.4, end('invertiti') + 0.3);
        return (
          <g opacity={fade}>
            <path d={`M${from[0]} ${from[1]} L${x} ${y}`} stroke={BLUE} strokeWidth="8" strokeLinecap="round" opacity={0.6 * vis} />
            <Glow id="tn-bul" x={x} y={y} r={60} t={T} color={BLUE} amp={0.1} rate={6} opacity={0.7 * vis} />
            <g transform={`translate(${x} ${y}) rotate(${(Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI + 180})`} opacity={vis}><Bullet s={1.3} /></g>
            {/* le schegge del muro che si ricompongono */}
            {Array.from({ length: 6 }, (_, i) => {
              const k = 1 - seg(u, 0.02, 0.1);
              const a = (i / 6) * Math.PI * 2;
              return <rect key={i} x={from[0] - 4 + Math.cos(a) * 40 * k} y={from[1] - 4 + Math.sin(a) * 40 * k} width="8" height="8" fill="#3A4656" stroke={INK} strokeWidth="1.5" opacity={k > 0 && k < 1 ? 1 : 0} />;
            })}
          </g>
        );
      })()}
      <Link T={T} t0={at('invertiti', 2, 0.4)} a={[760, BAND.lab.y0 + 280]} b={[560, BAND.lab.y0 + 320]} c={[660, BAND.lab.y0 + 250]} color={BLUE} arrow w={5} label="torna nella pistola" ly={-32} size={38} fade={1 - seg(T, at('invertiti', 3, 0.3), at('invertiti', 3, 0.8))} />
      <Tag T={T} t0={at('invertiti', 3, 0.1)} x={660} y={BAND.lab.y0 + 150} text="INVERTITO" bg={BLUE} size={44} rot={-4} until={end('invertiti') - 0.3} />

      {/* ---- capitolo 2: dal futuro, la guerra, Tenet */}
      {T >= at('futuro', 0, 0.3) && T < end('futuro') + 0.3 && (
        <g opacity={1 - seg(T, end('futuro') - 0.4, end('futuro') + 0.3)}>
          {[0, 1, 2, 3, 4].map((k) => {
            const u = mod(T * 0.22 + k / 5, 1);
            return <g key={k} transform={`translate(${BX} ${lerp(3800, 700, u)}) rotate(-90)`} opacity={seg(u, 0, 0.08) * (1 - seg(u, 0.9, 1))}><Bullet s={2.4} /></g>;
          })}
        </g>
      )}
      {[1590, 2210, 2830].map((y, i) => (
        <Tag key={y} T={T} t0={at('futuro', 0, 0.3 + i * 0.3)} x={720} y={y + 12} text="▲ armi dal futuro" bg={BLUE} size={44} until={end('futuro') - 0.5} />
      ))}
      <Tag T={T} t0={at('futuro', 1, 0.2)} x={560} y={BAND.futuro.y0 + 410} text="una guerra contro di noi" bg={RED} fg="#FFFFFF" size={44} until={end('futuro') - 0.4} />
      {T >= at('futuro', 2, 0.1) && (() => {
        const p = pop(T, at('futuro', 2, 0.1));
        const [x, y] = N.tenet;
        return (
          <g transform={`translate(${x} ${y}) scale(${p})`}>
            <Glow id="tn-tenet" x={0} y={0} r={150} t={T} color={WARM} amp={0.08} rate={2} opacity={0.45 * focus(at('futuro', 2), end('futuro'))} />
            <circle r="74" fill="#1A2430" stroke={WARM} strokeWidth="6" />
            <circle r="62" fill="none" stroke={DIM} strokeWidth="2" />
            {/* TENET si legge uguale nei due versi: la parola e il suo riflesso blu */}
            <text y="8" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="34" letterSpacing="4" fill={INK}>TENET</text>
            <text y="8" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="34" letterSpacing="4" fill={BLUE} opacity=".35" transform="scale(1 -1) translate(0 -30)">TENET</text>
            <path d="M-40 -28 H40" stroke={RED} strokeWidth="4" />
            <path d="M-40 44 H40" stroke={BLUE} strokeWidth="4" />
            <text y="122" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="34" fill={INK} stroke={DARK} strokeWidth="6" paintOrder="stroke">Tenet</text>
            <text y="152" textAnchor="middle" fontFamily={SANS} fontWeight={400} fontSize="26" fill="#AEB8C4" stroke={DARK} strokeWidth="5" paintOrder="stroke">gruppo segreto</text>
          </g>
        );
      })()}
      <Link T={T} t0={at('futuro', 2, 0.6)} a={[N.tenet[0] - 80, N.tenet[1] + 30]} b={[N.prot[0] + 70, N.prot[1] - 30]} color={WARM} arrow w={6} label="lo recluta" ly={-26} size={38} />
      {T >= at('futuro', 3, 0.2) && (
        <g transform={`translate(800 ${BAND.lab.y0 + 455}) scale(${pop(T, at('futuro', 3, 0.2))})`} opacity={1 - seg(T, end('futuro') - 0.3, end('futuro') + 0.4)}>
          <rect x="-90" y="-22" width="180" height="44" rx="8" fill={WARM} stroke={INK} strokeWidth="4" />
          {[-60, -20, 20, 60].map((x) => <path key={x} d={`M${x - 14} -22 L${x + 14} 22`} stroke={DARK} strokeWidth="9" />)}
          <text x="60" y="-36" textAnchor="end" fontFamily={HAND} fontWeight={700} fontSize="40" fill={WARM} stroke={DARK} strokeWidth="6" paintOrder="stroke">fermarla prima</text>
        </g>
      )}

      {/* ---- capitolo 3: Sator, le armi invertite, Kat e il quadro falso */}
      <Node T={T} t0={at('sator', 0, 0.1)} p={N.sator} name="Sator" sub="ricco russo" color={RED} ring={focus(at('sator', 0), at('sator', 1, 1)) + focus(at('battito', 0), at('battito', 2, 1.5))} dead={dead}>
        <Bracelet T={T} beat={beat} />
      </Node>
      <Link T={T} t0={at('sator', 0, 0.6)} a={[N.sator[0] - 70, N.sator[1] + 30]} b={[160, BAND.futuro.y0 + 120]} c={[90, 2400]} color={BLUE} dashed flow w={7} fade={off('sator')} />
      <Tag T={T} t0={at('sator', 0, 0.8)} x={N.sator[0] + 20} y={N.sator[1] + 175} text="parla col futuro" bg={BLUE} size={30} until={at('sator', 2)} />
      <Link T={T} t0={at('sator', 1, 0.2)} a={[N.sator[0] + 55, N.sator[1] - 55]} b={[630, BAND.lab.y0 + 395]} c={[560, 1040]} color={BLUE} arrow w={8} label="fa invertire le armi" lx={150} ly={20} size={46} fade={1 - seg(T, at('sator', 3), at('sator', 3, 0.5))} />
      <Node T={T} t0={at('sator', 2, 0.2)} p={N.kat} name="Kat" sub="la moglie di Sator" ring={focus(at('sator', 2), at('sator', 3, 1.5)) + focus(at('tenaglia', 2), end('neil'))}>
        <Painting stamp={seg(T, at('sator', 3, 0.5), at('sator', 3, 0.8)) * (1 - seg(T, end('sator') - 0.3, end('sator')))} />
      </Node>
      <Link T={T} t0={at('sator', 2, 0.5)} a={[N.prot[0] + 40, N.prot[1] + 110]} b={[N.kat[0] - 40, N.kat[1] - 80]} c={[600, 860]} color={WARM} arrow w={6} label="la aiuta" ly={-20} size={40} fade={off('sator')} />
      <Tag T={T} t0={at('sator', 3, 0.5)} x={N.kat[0]} y={N.kat[1] - 112} text="quadro FALSO" bg={RED} fg="#FFFFFF" size={34} rot={-4} until={end('sator') - 0.4} />
      <Link T={T} t0={at('sator', 3, 0.2)} a={[N.sator[0] + 70, N.sator[1]]} b={[N.kat[0] - 72, N.kat[1]]} color={RED} arrow w={7} label="ricatto" ly={-24} size={44} fade={off('sator')} />

      {/* ---- capitolo 4: Oslo, Neil, il tornello, l'uomo mascherato */}
      <Node T={T} t0={at('tornello', 0, 0.1)} p={N.prot2} name="il Protagonista" ring={focus(at('tornello', 2), end('tornello')) + focus(at('mascherato', 3), end('mascherato'))}><Badge color={RED} /></Node>
      <Node T={T} t0={at('tornello', 0, 0.4)} p={N.neil} name="Neil" sub="il socio" size={36} ring={focus(at('neil', 2), end('neil'))}><Backpack T={T} /></Node>
      <Tag T={T} t0={at('tornello', 1, 0.1)} x={760} y={BAND.oslo.y0 + 140} text="il quadro non c'è" size={32} until={at('tornello', 2)} />
      <Link T={T} t0={at('tornello', 1, 0.5)} a={[N.turn[0] - 100, N.turn[1] + 220]} b={[N.turn[0] + 100, N.turn[1] + 220]} c={[N.turn[0], N.turn[1] + 290]} color={WARM} arrow w={6} label="il tornello inverte" ly={50} size={40} fade={off('tornello')} />
      {T >= at('tornello', 2, 0.1) && (() => {
        const s = pop(T, at('tornello', 2, 0.1));
        const enter = eo(seg(T, at('tornello', 2, 0.1), at('tornello', 2, 0.9)));
        const x = lerp(N.turn[0] + 40, masked[0], enter);
        const jitter = fight > 0 ? Math.sin((2 * Math.PI * (T - G0)) / (60 / film.bpm)) * 8 * fight : 0;
        const rv = reveal;
        return (
          <g transform={`translate(${x - jitter} ${masked[1]}) scale(${s})`}>
            <Glow id="tn-mask" x={0} y={0} r={150} t={T} color={BLUE} amp={0.1} rate={3} opacity={0.45 + 0.3 * rv} />
            <circle r="62" fill="#1A2430" stroke={BLUE} strokeWidth={6 + rv * 2} />
            <g transform="scale(1.4)" opacity={1 - rv}><Mask /></g>
            <g transform={`scale(${1.4 * (0.4 + 0.6 * rv)})`} opacity={rv}><Badge color={BLUE} /></g>
            <text y="108" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="36" fill={INK} stroke={DARK} strokeWidth="6" paintOrder="stroke" opacity={1 - rv}>uomo mascherato</text>
            <text y="108" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="36" fill={BLUE} stroke={DARK} strokeWidth="6" paintOrder="stroke" opacity={rv}>il Protagonista</text>
            <text y="138" textAnchor="middle" fontFamily={SANS} fontWeight={400} fontSize="26" fill="#AEB8C4" stroke={DARK} strokeWidth="5" paintOrder="stroke" opacity={rv}>invertito</text>
          </g>
        );
      })()}
      {/* la lotta: due frecce che si scontrano, una rossa (avanti) e una blu (all'indietro) */}
      {fight > 0 && (
        <g opacity={Math.min(1, fight)}>
          <path d={`M${N.prot2[0] + 80} ${N.prot2[1] - 120} Q${N.turn[0]} ${N.prot2[1] - 200} ${masked[0] - 90} ${masked[1] - 110}`} fill="none" stroke={RED} strokeWidth="6" strokeDasharray="18 12" strokeDashoffset={-T * 70} />
          <path d={`M${masked[0] - 90} ${masked[1] - 90} Q${N.turn[0]} ${N.prot2[1] - 170} ${N.prot2[0] + 80} ${N.prot2[1] - 100}`} fill="none" stroke={BLUE} strokeWidth="6" strokeDasharray="18 12" strokeDashoffset={T * 70} />
          <text x={N.turn[0]} y={N.prot2[1] - 196} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="40" fill={INK} stroke={DARK} strokeWidth="6" paintOrder="stroke">lottano</text>
        </g>
      )}
      <Tag T={T} t0={at('tornello', 3, 0.1)} x={masked[0] - 20} y={masked[1] - 140} text="chi è?" bg={BLUE} size={52} rot={4} until={end('tornello') - 0.2} />

      {/* ---- capitolo 5: l'Algoritmo, la lavagna cancellata, il futuro rovinato */}
      {T >= at('algoritmo', 0, 0.2) && (() => {
        const [ax, ay] = N.algo;
        const lit = focus(at('algoritmo', 1), end('algoritmo')) + algoSafe + focus(at('tenaglia', 3), at('neil', 1));
        return (
          <g>
            <Glow id="tn-algo" x={ax} y={ay} r={220} t={T} color={algoSafe > 0.5 ? WARM : RED} amp={0.1} rate={2.4} opacity={0.25 + 0.35 * Math.min(1, lit)} />
            {Array.from({ length: 9 }, (_, i) => {
              const a = (i / 9) * Math.PI * 2 - Math.PI / 2;
              const sx = 210 + i * 80 + (i % 2) * 10, sy = BAND.covo.y0 + 400 + (i % 3) * 30;
              const tx = ax + Math.cos(a) * 96, ty = ay + Math.sin(a) * 82;
              const pp = pop(T, at('algoritmo', 0, 0.2) + i * CROMA / 2);
              return <g key={i} transform={`translate(${lerp(sx, tx, assemble)} ${lerp(sy, ty, assemble)}) scale(${pp * 1.15})`}><Piece lit={Math.min(1, lit)} color={algoSafe > 0.5 ? WARM : RED} /></g>;
            })}
            <text x={ax} y={ay + 12} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="30" fill={INK} stroke={DARK} strokeWidth="6" paintOrder="stroke" opacity={assemble}>9 pezzi</text>
            {algoSafe > 0 && (
              <g transform={`translate(${ax + 120} ${ay - 110}) scale(${pop(T, at('neil', 1, 0.1))})`}>
                <circle r="32" fill={WARM} stroke={INK} strokeWidth="4" />
                <path d="M-14 0 L-4 10 L14 -10" fill="none" stroke={DARK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}
          </g>
        );
      })()}
      <text x={N.algo[0]} y={N.algo[1] - 122} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="44" fill={RED} stroke={DARK} strokeWidth="7" paintOrder="stroke" opacity={seg(T, at('algoritmo', 0, 0.5), at('algoritmo', 0, 0.9))}>l'Algoritmo</text>
      {T >= at('algoritmo', 1, 1.2) && T < at('algoritmo', 2, 0.6) && [0, 1, 2].map((k) => {
        // l'inversione che si allarga dall'Algoritmo: tre anelli rossi
        const u = mod((T - at('algoritmo', 1, 1.2)) / 1.5 + k / 3, 1);
        return <circle key={k} cx={N.algo[0]} cy={N.algo[1]} r={110 + u * 420} fill="none" stroke={RED} strokeWidth={10 * (1 - u) + 2} opacity={(1 - u) * seg(T, at('algoritmo', 1, 1.2), at('algoritmo', 1, 1.5))} />;
      })}
      <Tag T={T} t0={at('algoritmo', 1, 0.6)} x={540} y={BAND.covo.y0 + 92} text="può invertire il mondo intero" bg={RED} fg="#FFFFFF" size={36} until={at('algoritmo', 2, 0.3)} />
      {erase > 0 && (() => {
        // la lavagna cancellata: un cancellino passa sulle stazioni del passato e le copre
        const top = BAND.lab.y0 - 40, bot = BAND.tallinn.y0 + H + 40;
        const w = (X1 - X0 + 140) * Math.min(1, erase * 1.05);
        const ex = X0 - 70 + w;
        return (
          <g>
            <rect x={X0 - 70} y={top} width={w} height={bot - top} fill={PAPER} opacity={0.82} />
            {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${X0 - 70} ${top + 60 + i * 290} Q${X0 + w * 0.5} ${top + 20 + i * 290} ${ex} ${top + 80 + i * 290}`} stroke="#2A3440" strokeWidth="60" fill="none" opacity=".5" />)}
            {/* quello che resta sulla lavagna: i contorni delle stazioni appena accennati e la polvere di gesso */}
            {BANDS.slice(0, 4).map((bb) => (
              <rect key={bb.key} x={X0} y={bb.y0} width={Math.max(0, Math.min(X1 - X0, w - 70))} height={H} rx="10" fill="none" stroke={DIM} strokeWidth="5" strokeDasharray="18 14" opacity=".45" />
            ))}
            {Array.from({ length: 40 }, (_, i) => {
              const px = X0 - 40 + ((i * 197) % 900), py = top + 200 + ((i * 331) % (bot - top - 400));
              return px < ex - 40 ? <circle key={i} cx={px + Math.sin(T * 2 + i) * 10} cy={py - mod(T * 30 + i * 13, 60)} r={4 + (i % 4) * 2} fill="#C8C0B0" opacity={0.35} /> : null;
            })}
            <g transform={`translate(${Math.min(ex, X1 - 40)} ${1420 + Math.sin(T * 4) * 90}) rotate(${Math.sin(T * 4) * 8}) scale(1.5)`}>
              <rect x="-60" y="-160" width="120" height="320" rx="14" fill="#6B4A2A" stroke={INK} strokeWidth="8" />
              <rect x="-60" y="60" width="120" height="100" rx="10" fill="#C8C0B0" stroke={INK} strokeWidth="6" />
              <path d="M-40 -130 V40" stroke="#FFFFFF" strokeWidth="5" opacity=".3" />
            </g>
            <text x="540" y={BAND.oslo.y0 + 100} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="150" fill={RED} stroke={DARK} strokeWidth="10" paintOrder="stroke" opacity={seg(erase, 0.7, 1)}>il passato sparisce</text>
          </g>
        );
      })()}
      <Link T={T} t0={at('algoritmo', 3, 0.2)} a={[N.algo[0] + 160, BAND.futuro.y0 + 140]} b={[N.algo[0] + 130, N.algo[1] + 60]} c={[820, 3420]} color={RED} arrow w={10} label="lo vuole il futuro" lx={-20} ly={-10} size={48} fade={off('algoritmo')} />
      <Tag T={T} t0={at('algoritmo', 3, 0.7)} x={560} y={BAND.futuro.y0 + 440} text="clima rovinato" bg={RED} fg="#FFFFFF" size={52} until={end('algoritmo') - 0.4} />

      {/* ---- capitolo 6: il tumore, il cuore legato all'Algoritmo, il Vietnam */}
      <Tag T={T} t0={at('battito', 0, 0.3)} x={N.sator[0]} y={N.sator[1] - 115} text="tumore" bg={RED} fg="#FFFFFF" size={36} until={at('battito', 1, 0.3)} />
      {T >= at('battito', 1, 0.1) && (() => {
        // il cavo del battito, dal braccialetto all'Algoritmo: gli impulsi rossi scendono a ogni battito
        const a: P = [N.sator[0] - 50, N.sator[1] + 60], b: P = [N.algo[0] - 250, N.algo[1] - 80], c: P = [140, 2300];
        const d = `M${a[0]} ${a[1]} Q${c[0]} ${c[1]} ${b[0]} ${b[1]}`;
        const p = eo(seg(T, at('battito', 1, 0.1), at('battito', 1, 1.0)));
        const cut = seg(T, at('neil', 1, 0.1), at('neil', 1, 0.6));
        const hot = focus(at('tenaglia', 3), at('neil', 1)) + focus(at('battito', 1), at('battito', 2, 2));
        const show = focus(at('battito', 1, 0.1), end('battito') - 0.3) + focus(at('tenaglia', 3), at('neil', 2));
        if (show <= 0) return null;
        return (
          <g opacity={Math.min(1, show) * (1 - 0.7 * cut)}>
            <mask id="tn-cable" maskUnits="userSpaceOnUse" x="-500" y="0" width="2000" height="4500"><path d={d} fill="none" stroke="#fff" strokeWidth="40" pathLength={1} strokeDasharray={`${p} 1`} /></mask>
            <g mask="url(#tn-cable)">
              <path d={d} fill="none" stroke={RED} strokeWidth={10 + 6 * Math.min(1, hot)} opacity={0.5 + 0.5 * Math.min(1, hot)} strokeLinecap="round" />
              {flat < 0.5 && cut < 0.5 && <path d={d} fill="none" stroke={WARM} strokeWidth="18" pathLength={1} strokeDasharray="0.02 0.2" strokeDashoffset={-((T - G0) * 0.22) / (60 / film.bpm)} strokeLinecap="round" />}
            </g>
            <text x="250" y="2250" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="80" fill={RED} stroke={DARK} strokeWidth="9" paintOrder="stroke" opacity={seg(T, at('battito', 1, 0.6), at('battito', 1, 1)) * (1 - cut)} transform="rotate(-62 250 2250)">legato al suo battito</text>
          </g>
        );
      })()}
      {T >= at('battito', 1, 0.8) && (() => {
        const show = focus(at('battito', 1, 0.8), end('battito') - 0.3) + focus(at('tenaglia', 3), at('neil', 2));
        if (show <= 0) return null;
        const [mx, my] = [N.algo[0] - 250, N.algo[1] - 30];
        return (
          <g transform={`translate(${mx} ${my})`} opacity={Math.min(1, show)}>
            <rect x="-78" y="-46" width="156" height="92" rx="10" fill={DARK} stroke={INK} strokeWidth="5" />
            <path d={ecgPath(130, T, beat)} transform="translate(0 6)" fill="none" stroke={beat > 0.05 ? RED : DIM} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <text y="76" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="26" fill={INK} stroke={DARK} strokeWidth="5" paintOrder="stroke">battito di Sator</text>
          </g>
        );
      })()}
      <Tag T={T} t0={at('battito', 2, 0.4)} x={540} y={BAND.covo.y0 + 470} text="cuore fermo = fine del mondo" bg={RED} fg="#FFFFFF" size={40} until={at('battito', 3, 0.2)} />
      <Tag T={T} t0={at('battito', 3, 0.6)} x={560} y={BAND.yacht.y0 + 92} text="Vietnam: l'ultimo giorno felice" size={36} until={end('battito') - 0.3} />

      {/* ---- capitolo 7: Tallinn, Kat ferita, il tornello, il ritorno a Oslo */}
      <Node T={T} t0={at('mascherato', 0, 0.1)} p={N.satorT} name="Sator" color={RED} r={52} size={34} fade={off('mascherato')}><Bracelet T={T} beat={0.8} /></Node>
      <Node T={T} t0={at('mascherato', 0, 0.3)} p={N.katT} name="Kat, ferita" r={56} size={34} color={katHit > 0 ? RED : INK} ring={katHit} fade={off('mascherato')}><Painting crack={katHit} /></Node>
      {T >= at('mascherato', 0, 0.5) && T < at('mascherato', 0, 0.95) && (() => {
        const u = eio(seg(T, at('mascherato', 0, 0.5), at('mascherato', 0, 0.95)));
        return <g transform={`translate(${lerp(N.satorT[0] - 60, N.katT[0] + 60, u)} ${lerp(N.satorT[1], N.katT[1] - 10, u)}) rotate(180)`}><Bullet s={1.6} /></g>;
      })()}
      <Tag T={T} t0={at('mascherato', 1, 0.2)} x={560} y={BAND.tallinn.y0 + 110} text="si cura solo all'indietro" bg={BLUE} size={38} until={at('mascherato', 2, 0.5)} />
      <Link T={T} t0={at('mascherato', 2, 0.1)} a={[N.katT[0] + 60, N.katT[1] + 60]} b={[N.turnT[0] - 60, N.turnT[1]]} color={RED} arrow w={8} fade={off('mascherato')} />
      <Link T={T} t0={at('mascherato', 2, 0.6)} a={[N.turnT[0] + 70, N.turnT[1] - 20]} b={[masked[0] + 72, masked[1] + 30]} c={[1000, 2400]} color={BLUE} dashed flow arrow w={14} label="indietro fino a Oslo" lx={-110} ly={30} size={64} />
      {reveal > 0 && (
        <g opacity={reveal}>
          <ellipse cx={(N.prot2[0] + masked[0]) / 2} cy={(N.prot2[1] + masked[1]) / 2 + 10} rx="410" ry="150" fill="none" stroke={WARM} strokeWidth="7" strokeDasharray="22 14" strokeDashoffset={-T * 40} />
        </g>
      )}
      <Tag T={T} t0={at('mascherato', 3, 0.6)} x={N.turn[0]} y={BAND.oslo.y0 + 92} text="era lui stesso!" size={46} rot={-3} until={end('mascherato') - 0.2} />

      {/* ---- capitolo 8: la tenaglia, Kat in Vietnam */}
      {T >= at('tenaglia', 0, 0.2) && (() => {
        const p = eo(seg(T, at('tenaglia', 1, 0), at('tenaglia', 1, 1.0)));
        const fade = 1 - seg(T, at('neil', 0, 0.2), at('neil', 0, 0.8));
        const [ax, ay] = N.algo;
        const sq = (x: number, y: number, col: string, k: number) => (
          <g transform={`translate(${x} ${y}) scale(${1.7 * pop(T, at('tenaglia', 0, 0.2) + k * CROMA)})`}>
            {[-26, 0, 26].map((dx, i) => <path key={i} d={`M${dx - 12} 10 L${dx} -14 L${dx + 12} 10 Z`} fill={col} stroke={INK} strokeWidth="3" strokeLinejoin="round" transform={col === BLUE ? 'rotate(180)' : undefined} />)}
          </g>
        );
        return (
          <g opacity={fade}>
            {sq(230, BAND.covo.y0 + 100, RED, 0)}
            {sq(860, BAND.covo.y0 + 460, BLUE, 1)}
            <text x="230" y={BAND.covo.y0 + 168} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="36" fill={RED} stroke={DARK} strokeWidth="6" paintOrder="stroke">squadra avanti</text>
            <text x="790" y={BAND.covo.y0 + 400} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="36" fill={BLUE} stroke={DARK} strokeWidth="6" paintOrder="stroke">squadra indietro</text>
            <Link T={T} t0={at('tenaglia', 0, 0.6)} a={[260, BAND.covo.y0 + 140]} b={[ax - 130, ay - 30]} c={[200, ay - 40]} color={RED} arrow w={10} />
            <Link T={T} t0={at('tenaglia', 0, 0.9)} a={[830, BAND.covo.y0 + 420]} b={[ax + 130, ay + 30]} c={[880, ay + 40]} color={BLUE} arrow w={10} />
            {/* la tenaglia: due ganasce che si chiudono sull'Algoritmo */}
            {p > 0 && (
              <g opacity={p}>
                <path d={`M${ax - 200} ${ay - 150} Q${ax - 230 + 60 * p} ${ay} ${ax - 200} ${ay + 150}`} fill="none" stroke={RED} strokeWidth="16" strokeLinecap="round" transform={`translate(${40 * p} 0)`} />
                <path d={`M${ax + 200} ${ay - 150} Q${ax + 230 - 60 * p} ${ay} ${ax + 200} ${ay + 150}`} fill="none" stroke={BLUE} strokeWidth="16" strokeLinecap="round" transform={`translate(${-40 * p} 0)`} />
              </g>
            )}
          </g>
        );
      })()}
      <Tag T={T} t0={at('tenaglia', 1, 0.6)} x={N.algo[0]} y={BAND.covo.y0 + 80} text="tenaglia" size={44} until={at('tenaglia', 2, 0.2)} />
      <Link T={T} t0={at('tenaglia', 2, 0.3)} a={[N.kat[0] - 70, N.kat[1] + 20]} b={[N.sator[0] + 72, N.sator[1] + 20]} c={[540, N.kat[1] + 120]} color={WARM} arrow w={7} label="lo distrae" ly={44} size={44} fade={1 - seg(T, at('neil', 1, 0.3), at('neil', 1, 0.8))} />
      <Tag T={T} t0={at('tenaglia', 3, 0.6)} x={N.sator[0] + 140} y={N.sator[1] - 150} text="non ancora!" bg={RED} fg="#FFFFFF" size={64} rot={-3} until={end('tenaglia') - 0.3} />

      {/* ---- capitolo 9: il soldato col filo rosso, Kat uccide Sator, Neil, il fondatore */}
      <Node T={T} t0={at('neil', 0, 0.1)} p={N.soldier} name="un soldato invertito" color={BLUE} r={56} size={32} dead={soldierDead} ring={1 - soldierDead}><Backpack T={T} color={BLUE} /></Node>
      <Tag T={T} t0={at('neil', 1, 0.5)} x={N.algo[0]} y={BAND.covo.y0 + 80} text="Algoritmo salvo" size={44} until={at('neil', 2, 0.3)} />
      <Tag T={T} t0={at('neil', 1, 1.4)} x={N.sator[0] + 120} y={N.sator[1] - 130} text="Kat uccide Sator" bg={RED} fg="#FFFFFF" size={50} until={end('neil') + 1} />
      <Link T={T} t0={at('neil', 2, 0.2)} a={[N.soldier[0] - 40, N.soldier[1] - 70]} b={[N.neil[0] + 40, N.neil[1] + 80]} c={[440, 2650]} color={RED} dashed flow arrow w={12} label="lo stesso filo rosso" lx={-60} ly={-20} size={64} />
      <Tag T={T} t0={at('neil', 2, 0.7)} x={N.neil[0] + 260} y={N.neil[1] + 40} text="era Neil" bg={RED} fg="#FFFFFF" size={80} rot={-3} />
      <Node T={T} t0={at('neil', 3, 0.1)} p={N.protF} name="il Protagonista, anni dopo" sub="fonderà Tenet" r={110} size={76} ring={1}><Badge color={WARM} /></Node>
      <Link T={T} t0={at('neil', 3, 0.5)} a={[N.protF[0] - 60, N.protF[1] - 90]} b={[N.neil[0] + 10, N.neil[1] + 100]} c={[200, 2900]} color={WARM} dashed flow arrow w={16} label="lo recluta" lx={-60} size={110} />
      <Link T={T} t0={at('neil', 3, 0.9)} a={[N.protF[0] + 80, N.protF[1] - 70]} b={[N.tenet[0] + 80, N.tenet[1] + 60]} c={[1060, 2200]} color={WARM} dashed flow arrow w={16} label="fonderà Tenet" lx={-120} ly={420} size={110} />

      {/* lampo rosso del cuore che si ferma (un solo lampo nella scena) */}
      {redFlash > 0 && <rect x="-200" y="0" width="1500" height="4400" fill={RED} opacity={0.22 * redFlash} />}
    </g>
  );
};

export const makeTempo = (chapterId: string): React.FC<SceneProps> => {
  const Scene: React.FC<SceneProps> = ({ t }) => {
    const T = STARTS[chapterId] + t;
    const c = camAt(T);
    UI_K = Math.max(1, 0.85 / c.z);
    return (
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id="tn" />
          <radialGradient id="tn-bg" cx=".5" cy=".46" r=".8">
            <stop offset="0" stopColor="#1E2733" />
            <stop offset=".6" stopColor="#141B24" />
            <stop offset="1" stopColor="#0A0D12" />
          </radialGradient>
          <linearGradient id="tn-scrim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0A0D12" stopOpacity=".96" />
            <stop offset=".82" stopColor="#0A0D12" stopOpacity=".9" />
            <stop offset="1" stopColor="#0A0D12" stopOpacity="0" />
          </linearGradient>
          <pattern id="tn-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0 H0 V40" fill="none" stroke="#232D39" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#tn-bg)" />
        <g transform={`translate(540 900) scale(${c.z}) translate(${-c.x} ${-c.y})`}>
          <rect x="-4000" y="-4000" width="9080" height="13000" fill="url(#tn-grid)" opacity=".6" />
          <Schema T={T} />
        </g>
        <rect width="1080" height="575" fill="url(#tn-scrim)" />
        {MOTES.map((m, i) => (
          <circle key={i} cx={mod(m.x + Math.sin(T * 0.5 + m.ph) * 30, 1080)} cy={mod(m.y - T * m.v, 1920)} r={m.s} fill={INK} opacity={0.1 + 0.07 * Math.sin(T * 2 + m.ph)} />
        ))}
        <Finish id="tn" tint="#1E2A3A" tintOpacity={0.1} />
      </svg>
    );
  };
  return Scene;
};
