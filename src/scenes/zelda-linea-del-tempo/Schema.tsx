import React from 'react';
import { eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { CINZEL, HAND, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Clouds, Fireflies, Fog, Glow, Gulls, Smoke, WaveBand, flamePath, flashAt } from '../../lib/elements';
import { Arco, Inchiostro, Pergamena, Sigillo, arcoPath, type Pt } from '../../lib/pergamena';
import { subtitleTimes } from '../../components/ChapterOverlay';
import type { SceneProps } from '../../types';
import film from '../../../films/zelda-linea-del-tempo.json';

// Zelda, la linea del tempo (Videogiochi spiegati, formato "spiegato"): tutto il video è una pergamena miniata che si
// scrive da sola. In alto L'ORIGINE (Skyward Sword: l'isola nel cielo, la spada nella roccia, la tempesta del demone);
// sotto, legata da una riga d'inchiostro, la miniatura di HYRULE (Ocarina of Time: il castello, il tempio con la spada,
// la Triforza nel cielo) con i tre cerchi dei personaggi; poi il BIVIO, dove l'inchiostro si divide da solo in tre rami
// (rosso: l'eroe perde · azzurro: il futuro senza eroe · oro: Link torna bambino) che finiscono in tre finestre a sesto
// acuto miniate (il mondo sigillato, il regno sommerso, il crepuscolo); in fondo MOLTO DOPO, le terre selvagge nella nebbia.
// Personaggi = cerchi con l'oggetto, mai figure: Link = spada, Zelda = corona, Mortipher = nube di tempesta,
// Ganondorf = fiamma viola. Nessuna immagine, logo, mappa o oggetto riconoscibile del gioco: spada generica (niente elsa
// alata), tre triangoli d'oro separati (mai lo stemma), castello e luoghi inventati nel nostro stile.
// Coordinate = mondo; la camera porta il punto (x, y) al centro dello schermo (540, 900) con zoom z.
// Gli eventi cadono sulla griglia della musica (90 bpm, crome), gli stessi istanti dello spartito
// scripts/audio/zelda-linea-del-tempo.mjs.

export const INK = '#3A2614';
export const GOLD = '#F2C230'; // la Triforza e il pennino: l'unico oro acceso
export const RED = '#B23A2A'; // ramo dell'eroe sconfitto · anello del nodo
export const BLUE = '#2D6CB0'; // ramo adulto (il mare)
export const AMBER = '#C8871A'; // ramo bambino (il crepuscolo)
export const TIME = '#E8A400'; // tratteggio giallo = viaggio nel tempo
const PAPER = '#FBF3DE';
const SEPIA = '#7A5A38';
const VIOLET = '#6A2E8A';
type P = readonly [number, number];

const X0 = 130, X1 = 950;
const BANDS = {
  origine: { y0: 300, h: 540, name: "L'ORIGINE · SKYWARD SWORD" },
  hyrule: { y0: 1000, h: 580, name: 'HYRULE · OCARINA OF TIME' },
  dopo: { y0: 2560, h: 520, name: 'MOLTO DOPO' },
} as const;
type BandKey = keyof typeof BANDS;
const cy = (k: BandKey) => BANDS[k].y0 + BANDS[k].h / 2;
const FORK: P = [540, 1760];
const AW = 250, AH = 330, AY = 1950;
const ARCH = [
  { key: 'sconfitta', x: 250, color: RED, name: "L'EROE PERDE" },
  { key: 'mare', x: 540, color: BLUE, name: 'IL FUTURO SENZA EROE' },
  { key: 'crepuscolo', x: 830, color: AMBER, name: 'LINK TORNA BAMBINO' },
] as const;
const N = {
  link: [250, 1440] as P, zelda: [540, 1452] as P, ganon: [830, 1440] as P,
  morti: [845, 705] as P,
};

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
const ARCH_Z = 1.9;
const SHOTS: Shot[] = [
  // 1 · Hyrule, Link, Zelda, i Link di ogni gioco
  { at: at('chi', 0), x: 540, y: 1270, z: 1.1 },
  { at: at('chi', 1), x: 420, y: 1330, z: 1.28 },
  { at: at('chi', 2), x: 600, y: 1340, z: 1.28 },
  { at: at('chi', 3), x: 540, y: 1330, z: 1.08 },
  // 2 · la camera sale all'origine: la spada, la tempesta del demone, la maledizione che scende su Link e Zelda
  { at: at('origine', 0, -0.3), x: 540, y: cy('origine'), z: 1.14 },
  { at: at('origine', 1), x: 580, y: 590, z: 1.16 },
  { at: at('origine', 2), x: 540, y: 1010, z: 0.64 },
  { at: at('origine', 3), x: 540, y: 1260, z: 1.0 },
  // 3 · la Triforza nel cielo di Hyrule
  { at: at('triforza', 0), x: 520, y: 1230, z: 1.05 },
  { at: at('triforza', 1), x: 500, y: 1195, z: 1.3 },
  { at: at('triforza', 2), x: 520, y: 1240, z: 1.12 },
  { at: at('triforza', 3), x: 540, y: 1250, z: 1.08 },
  // 4 · Ocarina of Time: Ganondorf, il tempio, la conquista, i sette anni
  { at: at('ocarina', 0), x: 640, y: 1300, z: 1.16 },
  { at: at('ocarina', 1), x: 380, y: 1250, z: 1.32 },
  { at: at('ocarina', 2), x: 580, y: 1270, z: 1.08 },
  { at: at('ocarina', 3), x: 520, y: 1310, z: 1.16 },
  // 5 · l'ocarina rimanda Link indietro; l'inchiostro scende al bivio e si divide in tre
  { at: at('bivio', 0), x: 420, y: 1360, z: 1.22 },
  { at: at('bivio', 1), x: 540, y: 1620, z: 0.98 },
  { at: at('bivio', 2), x: 540, y: 1880, z: 0.8 },
  { at: at('bivio', 3), x: 540, y: 1960, z: 0.74 },
  // 6–8 · le tre finestre
  { at: at('sconfitta', 0, -0.2), x: 250, y: 2110, z: ARCH_Z },
  { at: at('sconfitta', 2), x: 255, y: 2100, z: ARCH_Z * 1.04 },
  { at: at('sconfitta', 3), x: 250, y: 2130, z: ARCH_Z },
  { at: at('mare', 0, -0.2), x: 540, y: 2110, z: ARCH_Z },
  { at: at('mare', 1), x: 540, y: 2130, z: ARCH_Z * 1.04 },
  { at: at('mare', 3), x: 545, y: 2120, z: ARCH_Z },
  { at: at('crepuscolo', 0, -0.2), x: 830, y: 2110, z: ARCH_Z },
  { at: at('crepuscolo', 1), x: 825, y: 2100, z: ARCH_Z * 1.04 },
  { at: at('crepuscolo', 3), x: 830, y: 2125, z: ARCH_Z },
  // 9 · molto dopo, poi tutta la pergamena
  { at: at('dopo', 0, -0.2), x: 540, y: cy('dopo'), z: 1.12 },
  { at: at('dopo', 1), x: 540, y: 2800, z: 1.04 },
  { at: at('dopo', 2), x: 540, y: 2470, z: 0.66 },
  { at: at('dopo', 3, 0.9), x: 540, y: 1925, z: 0.44 },
];
let UI_K = 1;
let WIDEV = false;
let FOCUSV = false;
const fit = (size: number) => Math.max(size, Math.min(size * UI_K, WIDEV ? 90 : 120));
const camAt = (T: number) => {
  let o = { x: SHOTS[0].x, y: SHOTS[0].y, z: SHOTS[0].z };
  for (const s of SHOTS.slice(1)) {
    const p = eio(seg(T, s.at - 0.2, s.at + 1.1));
    o = { x: lerp(o.x, s.x, p), y: lerp(o.y, s.y, p), z: Math.exp(lerp(Math.log(o.z), Math.log(s.z), p)) };
  }
  return { x: o.x + Math.sin(T * 0.3) * 6, y: o.y + Math.cos(T * 0.25) * 5, z: o.z * (1 + 0.012 * Math.sin(T * 0.2)) };
};

// ---------------------------------------------------------------- oggetti dei personaggi (coordinate ±44)

/** Link: una spada generica (lama dritta, elsa semplice: mai l'elsa alata della serie). */
export const Spada: React.FC<{ s?: number; glow?: number; T?: number }> = ({ s = 1, glow = 0, T = 0 }) => (
  <g transform={`scale(${s}) rotate(22)`} strokeLinejoin="round" strokeLinecap="round">
    {glow > 0 && <circle r="40" fill="#FFF3C0" opacity={0.35 * glow * (0.8 + 0.2 * Math.sin(T * 6))} />}
    <path d="M-6 16 V-38 L0 -48 L6 -38 V16 Z" fill="#DCE2EC" stroke={INK} strokeWidth="3.5" />
    <path d="M0 -40 V12" stroke="#8C96A8" strokeWidth="2" />
    <path d="M-5 -36 V10" stroke="#FFFFFF" strokeWidth="1.5" opacity=".8" />
    <path d="M-20 16 H20 Q22 22 18 23 H-18 Q-22 22 -20 16 Z" fill="#C9962E" stroke={INK} strokeWidth="3" />
    <rect x="-4.5" y="23" width="9" height="16" fill="#6A3E22" stroke={INK} strokeWidth="2.5" />
    <path d="M-4 27 l8 3 M-4 32 l8 3" stroke="#A8784A" strokeWidth="1.5" />
    <circle cy="43" r="5.5" fill="#C9962E" stroke={INK} strokeWidth="2.5" />
  </g>
);
/** Zelda: una corona d'oro con pietre azzurre e una rossa al centro. */
export const Corona: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`} strokeLinejoin="round">
    <path d="M-30 18 L-32 -14 L-17 2 L-8 -24 L0 -6 L8 -24 L17 2 L32 -14 L30 18 Z" fill="#E8B83A" stroke={INK} strokeWidth="3.5" />
    <path d="M-26 -6 L-17 6 L-8 -14 M8 -14 L17 6 L26 -6" stroke="#FFE9A0" strokeWidth="2" fill="none" opacity=".8" />
    <rect x="-31" y="10" width="62" height="12" rx="3" fill="#C9962E" stroke={INK} strokeWidth="3" />
    {[-18, 0, 18].map((x, i) => <circle key={x} cx={x} cy="16" r="4" fill={i === 1 ? '#C8302A' : '#4FA0E0'} stroke={INK} strokeWidth="1.5" />)}
    {[-32, -8, 8, 32].map((x, i) => <circle key={i} cx={x} cy={i % 3 === 0 ? -15 : -25} r="3.5" fill="#FFF0B8" stroke={INK} strokeWidth="1.5" />)}
  </g>
);
/** Ganondorf: una fiamma viola. */
export const Fiamma: React.FC<{ T: number; s?: number }> = ({ T, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d={flamePath(0, 30, 22, 70, T, 0.4)} fill={VIOLET} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
    <path d={flamePath(0, 28, 13, 44, T + 0.7, 2.1)} fill="#A860D0" />
    <path d={flamePath(0, 26, 6, 22, T + 1.3, 4)} fill="#F0C8FF" />
  </g>
);
/** Mortipher: una nube di tempesta nera con il bagliore rosso sotto e un piccolo fulmine. */
export const Nube: React.FC<{ T: number; s?: number }> = ({ T, s = 1 }) => (
  <g transform={`scale(${s})`} strokeLinejoin="round">
    <ellipse cx="0" cy="16" rx="34" ry="10" fill="#E0483A" opacity={0.35 + 0.2 * Math.sin(T * 7)} />
    <path d="M-34 10 Q-42 -6 -26 -12 Q-24 -30 -6 -28 Q4 -40 18 -28 Q36 -30 34 -10 Q44 -2 36 10 Z" fill="#2A2230" stroke={INK} strokeWidth="3.5" />
    <path d="M-22 -14 Q-12 -22 -2 -16 M10 -22 Q22 -24 26 -12" stroke="#5A4A68" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M2 12 L-6 26 L2 26 L-4 40" stroke="#F0C040" strokeWidth="3.5" fill="none" strokeLinejoin="round" strokeLinecap="round" opacity={mod(T, 1.6) < 0.18 ? 1 : 0.35} />
  </g>
);
/** Un'ocarina di terracotta azzurra. */
export const Ocarina: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s}) rotate(-14)`} strokeLinejoin="round">
    <path d="M-34 4 Q-34 -20 -4 -22 Q28 -22 36 0 Q30 20 0 20 Q-30 22 -34 4 Z" fill="#4F80C0" stroke={INK} strokeWidth="3.5" />
    <path d="M-30 -2 Q-26 -16 -4 -17" stroke="#9AC4F0" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M30 -6 L46 -12 L48 -2 L34 4" fill="#3A64A0" stroke={INK} strokeWidth="3" />
    {[[-16, 2], [-4, -4], [8, -2], [18, 6], [-6, 10]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.4" fill={INK} />)}
  </g>
);
/** Uno dei tre triangoli d'oro (separati, mai lo stemma). */
const Tri: React.FC<{ s?: number; glow?: number; T: number; id: string }> = ({ s = 1, glow = 1, T, id }) => (
  <g transform={`scale(${s})`}>
    {glow > 0 && <Glow id={id} x={0} y={-6} r={96} t={T} color={GOLD} amp={0.12} rate={2.4} opacity={0.55 * glow} />}
    <path d="M0 -44 L40 26 H-40 Z" fill={GOLD} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
    <path d="M0 -44 L40 26 H22 L0 -12 Z" fill="#D49A18" />
    <path d="M-2 -34 L-30 18" stroke="#FFF2B8" strokeWidth="4" strokeLinecap="round" opacity=".9" />
  </g>
);

// ---------------------------------------------------------------- elementi dello schema

const Node: React.FC<{ T: number; t0: number; p: P; name: string; sub?: string; ring?: number; r?: number; fade?: number; color?: string; children?: React.ReactNode; size?: number; dead?: number; ghost?: number }> = ({
  T, t0, p, name, sub, ring = 0, r = 48, fade = 1, color = INK, children, size: size0 = 32, dead = 0, ghost = 0,
}) => {
  if (T < t0 || fade <= 0) return null;
  const size = fit(size0);
  const s = pop(T, t0);
  const ly = r + size + 4;
  return (
    <g transform={`translate(${p[0]} ${p[1]})`} opacity={seg(T, t0, t0 + 0.15) * fade}>
      <g transform={`scale(${s})`}>
        {ring > 0 && <Glow id={`zl-g${p[0]}${p[1]}`} x={0} y={0} r={r * 2.4} t={T} color={GOLD} amp={0.1} rate={2.4} opacity={0.6 * Math.min(1, ring)} />}
        <circle r={r + 4} fill="#000" opacity=".12" transform="translate(4 5)" />
        <circle r={r} fill={PAPER} stroke={ring > 0.5 ? '#B8860B' : color} strokeWidth={ring > 0.5 ? 7 : 5} />
        <circle r={r - 7} fill="none" stroke="#C9962E" strokeWidth="2" opacity=".75" />
        <g transform={`scale(${r / 48})`} opacity={(1 - 0.55 * dead) * (1 - ghost * 0.6)}>{children}</g>
        {dead > 0 && <path d={`M${-r * 0.55} ${-r * 0.55} L${r * 0.55} ${r * 0.55} M${r * 0.55} ${-r * 0.55} L${-r * 0.55} ${r * 0.55}`} stroke={RED} strokeWidth="7" strokeLinecap="round" opacity={dead} />}
      </g>
      {name && <text y={ly} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={size} fill={INK} stroke={PAPER} strokeWidth="7" paintOrder="stroke" opacity={seg(T, t0 + 0.2, t0 + 0.5)}>{name}</text>}
      {sub && !WIDEV && <text y={ly + size * 0.88} textAnchor="middle" fontFamily={SANS} fontWeight={400} fontSize={size * 0.74} fill={SEPIA} stroke={PAPER} strokeWidth="6" paintOrder="stroke" opacity={seg(T, t0 + 0.3, t0 + 0.6)}>{sub}</text>}
    </g>
  );
};

/** Linea dello schema a mano (curva quadratica che si disegna) con la scritta a penna. */
const Tratto: React.FC<{ T: number; t0: number; a: P; b: P; c?: P; color?: string; dashed?: boolean; label?: string; arrow?: boolean; w?: number; lx?: number; ly?: number; size?: number; fade?: number; flow?: boolean; dur?: number }> = ({
  T, t0, a, b, c, color = INK, dashed = false, label, arrow = false, w = 6, lx = 0, ly = 0, size: size0 = 40, fade = 1, flow = false, dur = 0.6,
}) => {
  const size = fit(size0);
  if (T < t0 || fade <= 0) return null;
  const p = eo(seg(T, t0, t0 + dur));
  const [mx, my] = c ?? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const d = `M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`;
  const ang = (Math.atan2(b[1] - my, b[0] - mx) * 180) / Math.PI;
  const id = `zl-m${a[0]}${a[1]}${b[0]}${b[1]}`;
  const tx = 0.25 * a[0] + 0.5 * mx + 0.25 * b[0], ty = 0.25 * a[1] + 0.5 * my + 0.25 * b[1];
  return (
    <g opacity={fade}>
      <mask id={id} maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="9000"><path d={d} fill="none" stroke="#fff" strokeWidth={w + 12} pathLength={1} strokeDasharray={`${p} 1`} /></mask>
      <path d={d} fill="none" stroke={PAPER} strokeWidth={w + 6} strokeLinecap="round" opacity=".7" mask={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray={dashed ? `${w * 3} ${w * 2.2}` : undefined} strokeDashoffset={flow ? -T * 60 : 0} strokeLinecap="round" mask={`url(#${id})`} />
      {arrow && p > 0.95 && <path d={`M${-w * 3.4} ${-w * 2.3} L0 0 L${-w * 3.4} ${w * 2.3}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${b[0]} ${b[1]}) rotate(${ang})`} />}
      {label && !WIDEV && (
        <text x={tx + lx} y={ty + ly} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={size} fill={color} stroke={PAPER} strokeWidth="8" paintOrder="stroke" opacity={seg(T, t0 + 0.4, t0 + 0.8)}>{label}</text>
      )}
    </g>
  );
};

/** Cartellino pieno = colpo di scena o parola chiave. */
const Tag: React.FC<{ T: number; t0: number; x: number; y: number; text: string; bg?: string; fg?: string; size?: number; rot?: number; until?: number }> = ({
  T, t0, x, y, text, bg = GOLD, fg = INK, size: size0 = 34, rot = 0, until = 1e9,
}) => {
  const size = fit(size0);
  if (T < t0 || T > until + 0.5) return null;
  const w = text.length * size * 0.6 + size;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${pop(T, t0)})`} opacity={1 - seg(T, until, until + 0.5)}>
      <rect x={-w / 2 + size * 0.12} y={-size * 0.95 + size * 0.14} width={w} height={size * 1.6} rx={size * 0.3} fill="#000" opacity=".25" />
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.6} rx={size * 0.3} fill={bg} stroke={INK} strokeWidth="3" />
      <text y={size * 0.33} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={size} fill={fg}>{text}</text>
    </g>
  );
};

/** Anello rosso = il nodo da capire. */
const Ring: React.FC<{ T: number; x: number; y: number; r: number; on: number }> = ({ T, x, y, r, on }) => {
  if (on <= 0) return null;
  const k = eob(Math.min(1, on), 1.6);
  return (
    <g opacity={Math.min(1, on)}>
      <circle cx={x} cy={y} r={r * k} fill="none" stroke={RED} strokeWidth="8" strokeDasharray={`${r * 0.5} ${r * 0.18}`} strokeDashoffset={-T * 40} />
      <circle cx={x} cy={y} r={r * k + 12} fill="none" stroke={RED} strokeWidth="2" opacity=".5" />
    </g>
  );
};

/** Cartiglio (nastro di pergamena) con il titolo di un gioco, in maiuscolo da manoscritto. */
const Cartiglio: React.FC<{ T: number; t0: number; x: number; y: number; w: number; text: string; color: string; size?: number }> = ({ T, t0, x, y, w, text, color, size = 17 }) => {
  if (T < t0) return null;
  const p = eo(seg(T, t0, t0 + 0.5));
  const ww = w * p;
  const h = size * 1.9;
  return (
    <g transform={`translate(${x} ${y})`} opacity={Math.min(1, p * 2)}>
      <path d={`M${-ww / 2 - 18} ${-h / 2 + 6} L${-ww / 2} ${-h / 2 + 6} L${-ww / 2} ${h / 2 + 6} L${-ww / 2 - 18} ${h / 2 + 6} L${-ww / 2 - 10} ${6} Z`} fill="#D8C08A" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d={`M${ww / 2 + 18} ${-h / 2 + 6} L${ww / 2} ${-h / 2 + 6} L${ww / 2} ${h / 2 + 6} L${ww / 2 + 18} ${h / 2 + 6} L${ww / 2 + 10} ${6} Z`} fill="#D8C08A" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x={-ww / 2} y={-h / 2} width={ww} height={h} fill="#F4E6C0" stroke={INK} strokeWidth="2.5" />
      <path d={`M${-ww / 2 + 6} ${h / 2 - 5} H${ww / 2 - 6}`} stroke={color} strokeWidth="2.5" opacity=".7" />
      {p > 0.9 && <text y={size * 0.36} textAnchor="middle" fontFamily={CINZEL} fontWeight={700} fontSize={size} fill={INK} letterSpacing="0.5">{text}</text>}
    </g>
  );
};

/** Freccia circolare che gira attorno a un cerchio: «rinasce sempre». */
const Giro: React.FC<{ T: number; x: number; y: number; r: number; on: number; color?: string }> = ({ T, x, y, r, on, color = RED }) => {
  if (on <= 0) return null;
  const a = T * 90;
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`} opacity={Math.min(1, on)}>
      <path d={`M${r} 0 A${r} ${r} 0 1 1 ${r * Math.cos(-0.5)} ${r * Math.sin(-0.5)}`} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray="20 12" />
      <path d={`M${r * Math.cos(-0.5) - 14} ${r * Math.sin(-0.5) - 2} L${r * Math.cos(-0.5)} ${r * Math.sin(-0.5)} L${r * Math.cos(-0.5) - 2} ${r * Math.sin(-0.5) + 16}`} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

// ---------------------------------------------------------------- miniature: l'origine

const rr = rng(1986);
const GRASS = Array.from({ length: 70 }, () => ({ x: rr(), y: rr(), h: 8 + rr() * 16, ph: rr() * 6 }));
const FLOWERS = Array.from({ length: 34 }, () => ({ x: rr(), y: rr(), c: ['#F4F0E4', '#F2A8C0', '#F2C230', '#9AC8F0'][Math.floor(rr() * 4)] }));
const ASH = Array.from({ length: 26 }, () => ({ x: rr(), y: rr(), v: 0.05 + rr() * 0.1, s: 1.5 + rr() * 2.5, ph: rr() * 6 }));

/** Erba e fiori su un prato, dentro un rettangolo (x, y, w, h). */
const Prato: React.FC<{ T: number; x: number; y: number; w: number; h: number; color?: string; n?: number; flowers?: boolean }> = ({ T, x, y, w, h, color = '#3E7A3A', n = 70, flowers = true }) => (
  <g>
    {GRASS.slice(0, n).map((g, i) => {
      const gx = x + g.x * w, gy = y + g.y * h;
      return <path key={i} d={`M${gx} ${gy} q${3 + Math.sin(T * 2 + g.ph) * 3} ${-g.h * 0.6} ${2 + Math.sin(T * 2 + g.ph) * 5} ${-g.h}`} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />;
    })}
    {flowers && FLOWERS.map((f, i) => <circle key={i} cx={x + f.x * w} cy={y + f.y * h} r="3.6" fill={f.c} stroke={INK} strokeWidth="1.2" />)}
  </g>
);

const ArtOrigine: React.FC<{ T: number; seal: number }> = ({ T, seal }) => {
  const { y0, h } = BANDS.origine;
  const sx = 540, sy = y0 + 470; // la roccia con la spada
  // la tempesta del demone: grande e viva, poi risucchiata nella spada
  const k = 1 - 0.75 * eio(seal);
  const cx = lerp(700, sx, eio(seal) * 0.85), cyy = lerp(y0 + 170, sy - 40, eio(seal) * 0.85);
  return (
    <g>
      <rect x={X0} y={y0} width={X1 - X0} height={h} fill="url(#zl-sky1)" />
      <Glow id="zl-sun1" x={300} y={y0 + 80} r={200} t={T} color="#FFF0B0" amp={0.06} rate={1.2} opacity={0.7} />
      <Clouds id="zl-cl1" t={T} color="#FFFFFF" seed={11} n={3} y={y0 + 60} h={80} opacity={0.6} />
      {/* l'isola che galleggia nel cielo, con la torretta e la cascata */}
      <g transform={`translate(0 ${Math.sin(T * 0.8) * 6})`}>
        <path d={`M200 ${y0 + 200} Q300 ${y0 + 180} 400 ${y0 + 198} L380 ${y0 + 228} Q330 ${y0 + 330} 290 ${y0 + 300} Q240 ${y0 + 270} 220 ${y0 + 228} Z`} fill="url(#zl-rock)" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <path d={`M200 ${y0 + 200} Q300 ${y0 + 176} 400 ${y0 + 198} L398 ${y0 + 210} Q300 ${y0 + 194} 202 ${y0 + 212} Z`} fill="#5FA04A" stroke={INK} strokeWidth="4" />
        <rect x="282" y={y0 + 130} width="30" height="66" fill="#E8DCC0" stroke={INK} strokeWidth="4" />
        <path d={`M276 ${y0 + 132} L297 ${y0 + 100} L318 ${y0 + 132} Z`} fill="#B85A3A" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <circle cx="297" cy={y0 + 152} r="6" fill="#F2C230" stroke={INK} strokeWidth="2" />
        <circle cx="240" cy={y0 + 186} r="14" fill="#4A8A3E" stroke={INK} strokeWidth="3" />
        <circle cx="364" cy={y0 + 184} r="11" fill="#4A8A3E" stroke={INK} strokeWidth="3" />
        <path d={`M392 ${y0 + 206} Q402 ${y0 + 260} 398 ${y0 + 330}`} stroke="#DDF2FF" strokeWidth="8" fill="none" opacity=".85" strokeDasharray="14 6" strokeDashoffset={-T * 60} />
      </g>
      {/* il mare di nuvole */}
      <path d={`M${X0} ${y0 + 340} ${Array.from({ length: 12 }, (_, i) => `q35 ${-26 - (i % 3) * 8} 70 0`).join(' ')} V${y0 + 380} H${X0} Z`} fill="#FFFFFF" opacity=".92" transform={`translate(${Math.sin(T * 0.4) * 10} 0)`} />
      <path d={`M${X0} ${y0 + 360} ${Array.from({ length: 14 }, (_, i) => `q30 ${-18 - (i % 2) * 8} 60 0`).join(' ')}`} fill="none" stroke="#C8DCEA" strokeWidth="3" />
      {/* sotto le nuvole: la terra, la roccia, la spada nel fascio di luce */}
      <rect x={X0} y={y0 + 370} width={X1 - X0} height={h - 370} fill="url(#zl-land1)" />
      <path d={`M${X0} ${y0 + 420} Q400 ${y0 + 395} 620 ${y0 + 418} Q800 ${y0 + 440} ${X1} ${y0 + 410}`} fill="none" stroke="#2E5A2A" strokeWidth="4" />
      <path d={`M${sx - 70} ${y0 + 70} L${sx + 70} ${y0 + 70} L${sx + 120} ${sy + 20} L${sx - 120} ${sy + 20} Z`} fill="url(#zl-beam)" opacity={0.55 + 0.25 * seal} />
      <path d={`M${sx - 66} ${sy + 30} L${sx - 46} ${sy - 10} H${sx + 46} L${sx + 66} ${sy + 30} Z`} fill="url(#zl-stone)" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <path d={`M${sx - 36} ${sy + 8} l20 -4 M${sx + 10} ${sy + 16} l24 -6`} stroke={INK} strokeWidth="2.5" opacity=".6" />
      <path d={`M${sx - 54} ${sy + 22} q-10 -16 4 -22`} stroke="#4E8A3A" strokeWidth="4" fill="none" />
      <g transform={`translate(${sx} ${sy - 62})`}>
        {seal > 0 && <Glow id="zl-swg" x={0} y={0} r={110} t={T} color="#FFF0A0" amp={0.15} rate={4} opacity={0.6 * seal} />}
        <g transform="scale(1.35) rotate(-22)"><Spada /></g>
        {/* l'odio sigillato: fumo scuro che gira attorno alla lama */}
        {seal > 0.6 && Array.from({ length: 3 }, (_, i) => (
          <ellipse key={i} cx="0" cy={-10 + i * 18} rx={26 - i * 3} ry="7" fill="none" stroke="#3A2A48" strokeWidth="4" strokeDasharray="22 14" strokeDashoffset={-T * 70 * (i % 2 ? 1 : -1)} opacity={0.7 * seg(seal, 0.6, 1)} />
        ))}
      </g>
      <Prato T={T} x={X0} y={y0 + 440} w={X1 - X0} h={h - 450} n={46} />
      {/* la tempesta del demone (prima della sconfitta), poi risucchiata nella spada */}
      {k > 0.26 && (
        <g transform={`translate(${cx} ${cyy}) scale(${k})`}>
          <Glow id="zl-storm" x={0} y={30} r={190} t={T} color="#C83A3A" amp={0.2} rate={5} opacity={0.4} />
          {/* il bagliore rosso sotto la nube */}
          <ellipse cx="0" cy="56" rx="120" ry="26" fill="#E0483A" opacity={0.35 + 0.15 * Math.sin(T * 6)} />
          {/* la nube: cumulo scuro a sbuffi che ribollono */}
          {[[-110, 20, 52], [-60, -10, 66], [0, -34, 74], [64, -8, 64], [118, 22, 50], [-30, 30, 60], [44, 34, 58]].map(([x, y, rr0], i) => (
            <circle key={i} cx={x + Math.sin(T * 1.3 + i) * 5} cy={y + Math.cos(T * 1.1 + i) * 4} r={rr0 + Math.sin(T * 2 + i * 1.7) * 3} fill={i % 2 ? '#2A2230' : '#352A40'} stroke={INK} strokeWidth="5" />
          ))}
          <path d="M-150 44 Q0 70 150 44 Q120 70 0 76 Q-120 70 -150 44 Z" fill="#1E1824" />
          {[[-60, -40], [10, -66], [70, -30]].map(([x, y], i) => <path key={i} d={`M${x - 24} ${y} q24 -16 48 0`} stroke="#6A5A80" strokeWidth="5" fill="none" strokeLinecap="round" />)}
          {/* vortice: due archi sottili che girano attorno */}
          <g transform={`rotate(${T * 50}) scale(1 .45)`}>
            <path d="M190 0 A190 190 0 0 1 -134 134" fill="none" stroke="#4A3A5A" strokeWidth="8" strokeLinecap="round" opacity=".6" />
            <path d="M-190 0 A190 190 0 0 1 134 -134" fill="none" stroke="#4A3A5A" strokeWidth="6" strokeLinecap="round" opacity=".45" />
          </g>
          {/* fulmini */}
          <path d="M-30 60 L-48 110 L-26 104 L-46 160" stroke="#F0C040" strokeWidth="8" fill="none" strokeLinejoin="round" strokeLinecap="round" opacity={mod(T, 1.3) < 0.15 ? 1 : 0.12} />
          <path d="M50 60 L66 100 L48 98 L62 140" stroke="#F0C040" strokeWidth="7" fill="none" strokeLinejoin="round" strokeLinecap="round" opacity={mod(T + 0.6, 1.7) < 0.14 ? 1 : 0.1} />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- miniature: Hyrule

const TEMPLE = { x: 300, y: 1290 };
const CASTLE = { x: 800, y: 1250, s: 0.86 };
const Castello: React.FC<{ T: number; dark: number; x: number; y: number; s?: number; sil?: string }> = ({ T, dark, x, y, s = 1, sil }) => {
  const wall = sil ?? 'url(#zl-wall)';
  const roof = sil ?? '#3A64B0';
  const lit = dark > 0.5 ? '#E8503A' : '#FFD66A';
  const ln = sil ? sil : INK;
  const tower = (tx: number, ty: number, w: number, hh: number, i: number) => (
    <g key={i}>
      <rect x={tx - w / 2} y={ty} width={w} height={hh} fill={wall} stroke={ln} strokeWidth="5" />
      <path d={`M${tx - w / 2 - 8} ${ty + 2} L${tx} ${ty - w * 1.5} L${tx + w / 2 + 8} ${ty + 2} Z`} fill={roof} stroke={ln} strokeWidth="5" strokeLinejoin="round" />
      {!sil && <path d={`M${tx} ${ty - w * 1.5} V${ty - w * 1.5 - 30}`} stroke={INK} strokeWidth="3" />}
      {!sil && <path d={`M${tx} ${ty - w * 1.5 - 30} l24 ${6 + Math.sin(T * 5 + i) * 4} l-24 10 Z`} fill={dark > 0.5 ? '#3A1028' : '#E8553F'} stroke={INK} strokeWidth="2" />}
      {!sil && <rect x={tx - 6} y={ty + 18} width="12" height="20" rx="6" fill={lit} stroke={INK} strokeWidth="2" opacity={0.8 + 0.2 * Math.sin(T * 2 + i)} />}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>
      {!sil && <Glow id={`zl-cg${x}`} x={x} y={y - 60} r={170} t={T} color={dark > 0.5 ? '#E8503A' : '#FFF4C8'} amp={0.06} rate={1.5} opacity={0.35} />}
      <rect x={x - 110} y={y - 40} width="220" height="90" fill={wall} stroke={ln} strokeWidth="5" />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={x - 110 + i * 22} y={y - 52} width="12" height="14" fill={wall} stroke={ln} strokeWidth="3" />)}
      {!sil && <path d={`M${x - 22} ${y + 50} V${y + 14} Q${x} ${y - 8} ${x + 22} ${y + 14} V${y + 50} Z`} fill="#5A3A22" stroke={INK} strokeWidth="4" />}
      {tower(x - 92, y - 120, 40, 92, 1)}
      {tower(x + 92, y - 120, 40, 92, 2)}
      {tower(x, y - 196, 54, 160, 3)}
    </g>
  );
};

const ArtHyrule: React.FC<{ T: number; dark: number; open: number; pulled: number; dawn: number }> = ({ T, dark, open, pulled, dawn }) => {
  const { y0, h } = BANDS.hyrule;
  return (
    <g>
      <rect x={X0} y={y0} width={X1 - X0} height={h} fill="url(#zl-sky2)" />
      <rect x={X0} y={y0} width={X1 - X0} height={330} fill="url(#zl-red)" opacity={dark} />
      <Glow id="zl-sun2" x={860} y={y0 + 70} r={150} t={T} color={dark > 0.5 ? '#E86A4A' : '#FFF3B0'} amp={0.05} rate={1.1} opacity={0.6} />
      <Clouds id="zl-cl2" t={T} color={dark > 0.5 ? '#6A3048' : '#FFFFFF'} seed={23} n={3} y={y0 + 30} h={90} opacity={0.75} />
      {/* la porta del cielo che si apre (la strada verso la Triforza) */}
      {open > 0 && (
        <g opacity={open}>
          <path d={`M${TEMPLE.x} ${TEMPLE.y - 20} Q${TEMPLE.x + 30} ${y0 + 200} 490 ${y0 + 150}`} fill="none" stroke="#FFE9A0" strokeWidth={26 * open} opacity=".5" strokeLinecap="round" />
          <path d={`M${TEMPLE.x} ${TEMPLE.y - 20} Q${TEMPLE.x + 30} ${y0 + 200} 490 ${y0 + 150}`} fill="none" stroke="#FFF8DC" strokeWidth={8 * open} strokeLinecap="round" strokeDasharray="4 14" strokeDashoffset={-T * 80} />
        </g>
      )}
      {/* montagne lontane, senza contorni */}
      <path d={`M${X0} ${y0 + 300} L230 ${y0 + 210} L330 ${y0 + 280} L460 ${y0 + 190} L600 ${y0 + 290} L700 ${y0 + 230} L820 ${y0 + 300} L${X1} ${y0 + 250} V${y0 + 340} H${X0} Z`} fill={dark > 0.5 ? '#5A4060' : '#8FB0C8'} opacity=".8" />
      <path d={`M440 ${y0 + 206} L460 ${y0 + 190} L480 ${y0 + 206} Z`} fill="#FFFFFF" opacity=".9" />
      {/* colline */}
      <path d={`M${X0} ${y0 + 330} Q300 ${y0 + 270} 470 ${y0 + 320} Q560 ${y0 + 340} 620 ${y0 + 300} Q760 ${y0 + 220} ${X1} ${y0 + 290} V${y0 + h} H${X0} Z`} fill="url(#zl-hill)" stroke={INK} strokeWidth="5" />
      <path d={`M${X0} ${y0 + 380} Q400 ${y0 + 340} 640 ${y0 + 370} Q820 ${y0 + 392} ${X1} ${y0 + 360} V${y0 + h} H${X0} Z`} fill="url(#zl-hill2)" stroke={INK} strokeWidth="4" />
      {/* il sentiero che scende dal castello */}
      <path d={`M${CASTLE.x} ${CASTLE.y + 50} Q680 ${y0 + 360} 560 ${y0 + 400} Q470 ${y0 + 430} 520 ${y0 + h}`} fill="none" stroke="#E8D6A8" strokeWidth="18" strokeLinecap="round" />
      <path d={`M${CASTLE.x} ${CASTLE.y + 50} Q680 ${y0 + 360} 560 ${y0 + 400} Q470 ${y0 + 430} 520 ${y0 + h}`} fill="none" stroke="#C9B07A" strokeWidth="3" strokeDasharray="8 14" />
      <Castello T={T} dark={dark} x={CASTLE.x} y={CASTLE.y} s={CASTLE.s} />
      {/* alberi */}
      {[[170, y0 + 330, 26], [205, y0 + 345, 20], [880, y0 + 300, 24], [610, y0 + 312, 18]].map(([x, y, r], i) => (
        <g key={i}>
          <path d={`M${x} ${y + r} V${y + r + 18}`} stroke={INK} strokeWidth="5" />
          <circle cx={x} cy={y} r={r} fill={dark > 0.5 ? '#3A5040' : '#3E8A40'} stroke={INK} strokeWidth="4" />
          <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.4} fill="#6AB050" opacity={dark > 0.5 ? 0.3 : 0.8} />
        </g>
      ))}
      {/* il tempio con la spada nel piedistallo */}
      <g>
        <rect x={TEMPLE.x - 80} y={TEMPLE.y - 40} width="160" height="90" fill="url(#zl-wall)" stroke={INK} strokeWidth="5" />
        <path d={`M${TEMPLE.x - 96} ${TEMPLE.y - 38} L${TEMPLE.x} ${TEMPLE.y - 96} L${TEMPLE.x + 96} ${TEMPLE.y - 38} Z`} fill="#C9B89A" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <circle cx={TEMPLE.x} cy={TEMPLE.y - 62} r="12" fill="none" stroke={INK} strokeWidth="3" />
        {[-58, 58].map((dx) => <rect key={dx} x={TEMPLE.x + dx - 9} y={TEMPLE.y - 36} width="18" height="84" fill="#EDE2C8" stroke={INK} strokeWidth="3" />)}
        <path d={`M${TEMPLE.x - 34} ${TEMPLE.y + 50} V${TEMPLE.y - 6} Q${TEMPLE.x} ${TEMPLE.y - 34} ${TEMPLE.x + 34} ${TEMPLE.y - 6} V${TEMPLE.y + 50} Z`} fill="#2A2018" stroke={INK} strokeWidth="4" />
        <Glow id="zl-tg" x={TEMPLE.x} y={TEMPLE.y + 20} r={60} t={T} color="#FFF0A0" amp={0.1} rate={2} opacity={0.4 + 0.4 * open} />
        <rect x={TEMPLE.x - 14} y={TEMPLE.y + 30} width="28" height="18" fill="#9A9488" stroke={INK} strokeWidth="3" />
        <g transform={`translate(${TEMPLE.x} ${TEMPLE.y + 4 - 34 * eo(pulled)})`}><g transform="scale(.62) rotate(-22)"><Spada /></g></g>
        {/* i battenti della porta che si aprono */}
        <path d={`M${TEMPLE.x - 34} ${TEMPLE.y + 50} V${TEMPLE.y - 6} Q${TEMPLE.x - 17} ${TEMPLE.y - 26} ${TEMPLE.x} ${TEMPLE.y - 28} V${TEMPLE.y + 50} Z`} fill="#7A5A3A" stroke={INK} strokeWidth="3" transform={`translate(${TEMPLE.x - 34} 0) scale(${1 - 0.85 * open} 1) translate(${-(TEMPLE.x - 34)} 0)`} />
        <path d={`M${TEMPLE.x + 34} ${TEMPLE.y + 50} V${TEMPLE.y - 6} Q${TEMPLE.x + 17} ${TEMPLE.y - 26} ${TEMPLE.x} ${TEMPLE.y - 28} V${TEMPLE.y + 50} Z`} fill="#6A4A2E" stroke={INK} strokeWidth="3" transform={`translate(${TEMPLE.x + 34} 0) scale(${1 - 0.85 * open} 1) translate(${-(TEMPLE.x + 34)} 0)`} />
      </g>
      {/* il prato davanti, fiorito; all'alba dopo la vittoria si scalda */}
      <Prato T={T} x={X0} y={y0 + 410} w={X1 - X0} h={h - 420} n={70} color={dark > 0.5 ? '#3A5040' : '#3E7A3A'} />
      {dawn > 0 && <rect x={X0} y={y0} width={X1 - X0} height={h} fill="#FFD27A" opacity={0.18 * dawn} />}
      <Gulls t={T} seed={4} n={3} y={y0 + 60} h={60} color={INK} size={0.5} period={16} />
    </g>
  );
};

// ---------------------------------------------------------------- le tre finestre

const archClip = (x: number) => arcoPath(x - AW / 2, AY, AW, AH);

/** Ramo dell'eroe sconfitto: un mondo rosso scuro, il castello nero, i sette saggi che sigillano la fiamma. */
const ArtSconfitta: React.FC<{ T: number; take: number; seal: number }> = ({ T, take, seal }) => {
  const x = ARCH[0].x, x0 = x - AW / 2;
  const fx = x, fy = AY + 130;
  return (
    <g>
      <rect x={x0} y={AY} width={AW} height={AH} fill="url(#zl-sk-r)" />
      <Glow id="zl-rm" x={x + 60} y={AY + 70} r={60} t={T} color="#FF9A7A" amp={0.08} rate={1.4} opacity={0.5} />
      <circle cx={x + 60} cy={AY + 70} r="16" fill="#F2B8A0" opacity=".9" />
      <path d={`M${x0} ${AY + 250} Q${x - 40} ${AY + 215} ${x} ${AY + 230} Q${x + 70} ${AY + 245} ${x0 + AW} ${AY + 220} V${AY + AH} H${x0} Z`} fill="#1E0E14" stroke={INK} strokeWidth="3" />
      <Castello T={T} dark={1} x={x - 50} y={AY + 228} s={0.38} sil="#120810" />
      {/* la fiamma di Ganondorf cresce quando prende la Triforza intera */}
      <g transform={`translate(${fx} ${fy}) scale(${0.6 + 0.5 * eo(take)})`}>
        <Glow id="zl-rf" x={0} y={0} r={70} t={T} color="#B060E0" amp={0.15} rate={4} opacity={0.6} />
        <Fiamma T={T} />
      </g>
      {/* i tre triangoli che volano dentro la fiamma */}
      {take > 0 && take < 1 && [[-80, -60], [0, -100], [80, -60]].map(([dx, dy], i) => (
        <g key={i} transform={`translate(${lerp(fx + dx, fx, eio(take))} ${lerp(fy + dy, fy, eio(take))}) scale(${0.32 * (1 - 0.7 * take)})`}><Tri T={T} id={`zl-tr${i}`} glow={0} /></g>
      ))}
      {/* i sette saggi: sette luci d'oro in cerchio che si chiudono in un sigillo */}
      {seal > 0 && (
        <g>
          <circle cx={fx} cy={fy - 4} r={70} fill="none" stroke={GOLD} strokeWidth="4" pathLength={1} strokeDasharray={`${eo(seal)} 1`} />
          <circle cx={fx} cy={fy - 4} r={58} fill="none" stroke="#FFF0B0" strokeWidth="2" strokeDasharray="6 8" strokeDashoffset={T * 20} opacity={seal} />
          {Array.from({ length: 7 }, (_, i) => {
            const a = (i / 7) * Math.PI * 2 - Math.PI / 2 + T * 0.4;
            const rad = lerp(110, 70, eo(seal));
            return <g key={i} transform={`translate(${fx + Math.cos(a) * rad} ${fy - 4 + Math.sin(a) * rad})`}><circle r="11" fill={GOLD} opacity=".35" /><circle r="5.5" fill="#FFF6D0" stroke={INK} strokeWidth="1.5" /></g>;
          })}
        </g>
      )}
      {ASH.map((a, i) => <circle key={i} cx={x0 + mod(a.x * AW + Math.sin(T + a.ph) * 10, AW)} cy={AY + AH - mod(a.y * AH + T * 40 * a.v * 10, AH)} r={a.s * 0.7} fill="#E88A6A" opacity=".5" />)}
    </g>
  );
};

/** Ramo adulto: Hyrule finisce sotto il mare; sopra le onde le isole e una barca a vela. */
const ArtMare: React.FC<{ T: number; flood: number; isles: number; sail: number }> = ({ T, flood, isles, sail }) => {
  const x = ARCH[1].x, x0 = x - AW / 2;
  const sea = lerp(AY + AH + 10, AY + 150, eio(flood));
  const bx = lerp(x - 40, x + 170, eio(sail));
  return (
    <g>
      <rect x={x0} y={AY} width={AW} height={AH} fill="url(#zl-sk-b)" />
      <Glow id="zl-bs" x={x - 60} y={AY + 80} r={60} t={T} color="#FFF3B0" amp={0.06} rate={1.2} opacity={0.7} />
      <circle cx={x - 60} cy={AY + 80} r="15" fill="#FFF3C8" />
      {/* il castello di Hyrule, che resta sul fondo */}
      <path d={`M${x0} ${AY + 300} Q${x} ${AY + 280} ${x0 + AW} ${AY + 300} V${AY + AH} H${x0} Z`} fill="#4E6A3A" stroke={INK} strokeWidth="3" />
      <Castello T={T} dark={0} x={x + 10} y={AY + 282} s={0.42} />
      {/* le isole all'orizzonte */}
      {isles > 0 && [[x - 80, 0.7], [x + 50, 1], [x + 105, 0.6]].map(([ix, s], i) => (
        <g key={i} transform={`translate(${ix} ${AY + 150}) scale(${(s as number) * eo(isles)})`}>
          <path d="M-30 4 Q-20 -18 0 -20 Q22 -18 30 4 Z" fill="#5FA04A" stroke={INK} strokeWidth="3" />
          <path d="M-6 -18 Q0 -34 4 -40 M4 -40 q-14 -2 -20 6 M4 -40 q14 -2 18 8" stroke="#3E7A3A" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      ))}
      {/* il mare che sale e sommerge */}
      <g>
        <rect x={x0} y={sea + 8} width={AW} height={AY + AH - sea + 10} fill="url(#zl-sea)" opacity=".86" />
        <WaveBand t={T} y={sea} fill="#2E78B8" foam="#DDF2FF" amp={5} w={60} speed={20} bob={2} />
        {flood > 0.5 && [0, 1, 2, 3].map((i) => <path key={i} d={`M${x0 + 30 + i * 60} ${sea + 14} L${x0 + 10 + i * 60} ${AY + AH}`} stroke="#BFE6FF" strokeWidth="14" opacity=".12" />)}
        {flood > 0.2 && Array.from({ length: 8 }, (_, i) => {
          const u = mod(T * 0.35 + i / 8, 1);
          return <circle key={i} cx={x0 + 30 + (i * 31) % 200 + Math.sin(T * 2 + i) * 5} cy={lerp(AY + AH - 10, sea + 14, u)} r={2.5 + (i % 3)} fill="none" stroke="#DDF2FF" strokeWidth="1.5" opacity={0.8 * (1 - u)} />;
        })}
        {/* pesciolini */}
        {flood > 0.8 && [0, 1].map((i) => (
          <path key={i} d="M0 0 q8 -6 16 0 q-8 6 -16 0 Z M0 0 l-6 -5 v10 Z" fill="#F2A040" transform={`translate(${x0 + mod(T * 22 + i * 120, AW + 30) - 15} ${AY + 230 + i * 30})`} />
        ))}
      </g>
      {/* la barca a vela */}
      {flood > 0.7 && (
        <g transform={`translate(${bx} ${sea - 2 + Math.sin(T * 2) * 3}) rotate(${Math.sin(T * 1.6) * 4})`}>
          <path d="M-24 0 H24 L16 12 H-16 Z" fill="#7A4A2A" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M0 0 V-46" stroke={INK} strokeWidth="3" />
          <path d="M2 -44 Q24 -26 20 -4 H2 Z" fill="#E8553F" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        </g>
      )}
    </g>
  );
};

/** Ramo bambino: il crepuscolo, il castello controluce, il varco d'ombra dove viene cacciata la fiamma. */
const ArtCrepuscolo: React.FC<{ T: number; banish: number; back: number }> = ({ T, banish, back }) => {
  const x = ARCH[2].x, x0 = x - AW / 2;
  const px = x + 40, py = AY + 96; // il varco del Crepuscolo
  const fx = lerp(lerp(x - 50, px, eio(banish)), x - 40, eio(back));
  const fy = lerp(lerp(AY + 210, py, eio(banish)), AY + 200, eio(back));
  const fs = banish > 0.9 && back <= 0 ? 0.15 : 0.45;
  return (
    <g>
      <rect x={x0} y={AY} width={AW} height={AH} fill="url(#zl-sk-g)" />
      <Glow id="zl-gsun" x={x - 20} y={AY + 250} r={120} t={T} color="#FFB060" amp={0.06} rate={1.2} opacity={0.75} />
      <circle cx={x - 20} cy={AY + 252} r="44" fill="#FFC870" />
      <path d={`M${x0} ${AY + 255} Q${x} ${AY + 232} ${x0 + AW} ${AY + 252} V${AY + AH} H${x0} Z`} fill="#2A1830" stroke={INK} strokeWidth="3" />
      <Castello T={T} dark={0} x={x - 10} y={AY + 246} s={0.4} sil="#24142C" />
      {/* il varco d'ombra */}
      {banish > 0 && (
        <g opacity={Math.min(1, banish * 2) * (1 - 0.4 * back)}>
          <ellipse cx={px} cy={py} rx={46 * eo(Math.min(1, banish * 1.5))} ry={30 * eo(Math.min(1, banish * 1.5))} fill="#1A0E24" stroke={GOLD} strokeWidth="3" />
          <ellipse cx={px} cy={py} rx={34} ry={20} fill="none" stroke="#7A4AA0" strokeWidth="3" strokeDasharray="10 8" strokeDashoffset={T * 40} opacity={banish} />
        </g>
      )}
      <g transform={`translate(${fx} ${fy}) scale(${fs})`}><Glow id="zl-gf" x={0} y={0} r={60} t={T} color="#B060E0" amp={0.15} rate={4} opacity={0.5} /><Fiamma T={T} /></g>
      {/* le ombre che salgono, tonde */}
      {Array.from({ length: 16 }, (_, i) => {
        const u = mod(T * 0.18 + i / 16, 1);
        return <circle key={i} cx={x0 + 20 + ((i * 47) % 210) + Math.sin(T + i) * 8} cy={AY + AH - 20 - u * 240} r={3 + (i % 3) * 1.5} fill="#1A0E24" opacity={0.7 * (1 - u)} />;
      })}
    </g>
  );
};

// ---------------------------------------------------------------- molto dopo

const ArtDopo: React.FC<{ T: number }> = ({ T }) => {
  const { y0, h } = BANDS.dopo;
  return (
    <g>
      <rect x={X0} y={y0} width={X1 - X0} height={h} fill="url(#zl-sky3)" />
      <Glow id="zl-sun3" x={700} y={y0 + 120} r={180} t={T} color="#FFF0C0" amp={0.05} rate={1.1} opacity={0.6} />
      {/* montagne e vulcano */}
      <path d={`M${X0} ${y0 + 290} L220 ${y0 + 180} L320 ${y0 + 250} L430 ${y0 + 160} L560 ${y0 + 270} L${X1} ${y0 + 260} V${y0 + 330} H${X0} Z`} fill="#9AB4C8" opacity=".8" />
      <path d={`M700 ${y0 + 290} L800 ${y0 + 140} H840 L940 ${y0 + 290} Z`} fill="#8A6A5A" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d={`M800 ${y0 + 140} Q820 ${y0 + 156} 840 ${y0 + 140} L834 ${y0 + 160} Q820 ${y0 + 168} 806 ${y0 + 160} Z`} fill="#E8603A" />
      <Smoke id="zl-vs" t={T} x={820} y={y0 + 130} color="#B8A8A0" n={6} rise={110} wind={60} r0={14} r1={46} speed={0.2} opacity={0.6} />
      {/* altopiano e rovine */}
      <path d={`M${X0} ${y0 + 340} Q300 ${y0 + 300} 520 ${y0 + 330} Q760 ${y0 + 360} ${X1} ${y0 + 320} V${y0 + h} H${X0} Z`} fill="url(#zl-hill)" stroke={INK} strokeWidth="5" />
      <g>
        {[[330, 0], [400, 1], [470, 2]].map(([x, i]) => (
          <g key={i}>
            <rect x={x - 12} y={y0 + 250 + (i % 2) * 14} width="24" height={80 - (i % 2) * 14} fill="#D8CCB0" stroke={INK} strokeWidth="4" />
            <path d={`M${x - 12} ${y0 + 270} q12 10 24 0`} stroke="#5FA04A" strokeWidth="4" fill="none" />
          </g>
        ))}
        <path d={`M318 ${y0 + 250} H412 Q412 ${y0 + 226} 366 ${y0 + 222} Q330 ${y0 + 226} 318 ${y0 + 250} Z`} fill="#C9BC9E" stroke={INK} strokeWidth="4" />
        <path d={`M500 ${y0 + 330} l20 -14 l16 6 l10 8`} stroke={INK} strokeWidth="4" fill="#C9BC9E" />
      </g>
      <g>
        <path d={`M180 ${y0 + 330} V${y0 + 190} l12 -10 l10 14 l14 -18 l12 12 l10 -8 V${y0 + 330} Z`} fill="#CFC2A4" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <rect x="206" y={y0 + 220} width="16" height="26" rx="8" fill="#3A3028" />
        <path d={`M180 ${y0 + 260} q30 12 68 -4`} stroke="#5FA04A" strokeWidth="6" fill="none" />
        <path d={`M620 ${y0 + 470} q30 -46 80 -30 q36 6 44 40 Z`} fill="#A89A88" stroke={INK} strokeWidth="5" />
        <path d={`M640 ${y0 + 452} q30 -20 70 -8`} stroke="#5FA04A" strokeWidth="6" fill="none" />
      </g>
      <Fog id="zl-fg1" t={T} y={y0 + 300} x={540} rx={520} ry={60} color="#FFFFFF" opacity={0.7} />
      <Fog id="zl-fg2" t={T + 3} y={y0 + 200} x={540} rx={480} ry={40} color="#FFFFFF" opacity={0.3} speed={0.2} />
      <Prato T={T} x={X0} y={y0 + 380} w={X1 - X0} h={h - 390} n={70} color="#4E8A3A" />
      <Gulls t={T} seed={9} n={4} y={y0 + 60} h={80} color={INK} size={0.55} period={18} />
    </g>
  );
};

// ---------------------------------------------------------------- lo schema

const r = rng(1998);
const MOTES = Array.from({ length: 22 }, () => ({ x: r() * 1080, y: r() * 1920, s: 1.5 + r() * 3, v: 4 + r() * 10, ph: r() * 6 }));

/** Rami: dal bivio alle punte delle finestre. */
const BRANCH: Pt[][] = [
  [FORK, [470, 1800], [300, 1850], [ARCH[0].x, 1930]],
  [FORK, [540, 1830], [ARCH[1].x, 1930]],
  [FORK, [610, 1800], [780, 1850], [ARCH[2].x, 1930]],
];

const Schema: React.FC<{ T: number }> = ({ T }) => {
  const focus = (t0: number, t1: number) => seg(T, t0, t0 + 0.3) * (1 - seg(T, t1, t1 + 0.4));
  const off = (ch: string) => 1 - seg(T, end(ch) - 0.4, end(ch) + 0.3);

  // l'origine: la tempesta risucchiata nella spada quando Mortipher viene sconfitto
  const seal0 = eio(seg(T, at('origine', 1, 0.6), at('origine', 1, 1.8)));
  // Hyrule: la porta del cielo, la spada estratta, la conquista, l'alba della vittoria
  const open = eo(seg(T, at('ocarina', 1, 0.2), at('ocarina', 1, 1.2)));
  const pulled = seg(T, at('ocarina', 1, 0.1), at('ocarina', 1, 0.7));
  const win = at('ocarina', 3, 1.6);
  const dark = eio(seg(T, at('ocarina', 2, 0.6), at('ocarina', 2, 1.6))) * (1 - eio(seg(T, win, win + 1.2)));
  const dawn = seg(T, win, win + 1.0) * (1 - seg(T, end('bivio') - 1, end('bivio')));
  // i tre triangoli
  const triIn = at('triforza', 0, 0.3);
  const split = at('triforza', 3, 0.5);
  const toOwners = at('ocarina', 2, 0.1);
  const adult = eio(seg(T, at('ocarina', 3, 0.5), at('ocarina', 3, 1.3))) * (1 - eio(seg(T, at('bivio', 0, 0.8), at('bivio', 0, 1.8))));
  // il bivio
  const trunk = eio(seg(T, at('bivio', 1, 0), at('bivio', 1, 1.4)));
  const branch = eio(seg(T, at('bivio', 2, -0.2), at('bivio', 2, 1.6)));
  const arches = seg(T, at('bivio', 2, 0.8), at('bivio', 3, 0.4));
  const archOn = (k: string) => (k === 'sconfitta' ? at('sconfitta', 0, -0.2) : k === 'mare' ? at('mare', 0, -0.2) : at('crepuscolo', 0, -0.2));
  const flash = flashAt(T, [at('ocarina', 3, 1.6)]);

  const tris = [
    { key: 'potere', label: 'POTERE', col: RED, home: [350, 1112] as P, owner: N.ganon },
    { key: 'saggezza', label: 'SAGGEZZA', col: BLUE, home: [490, 1086] as P, owner: N.zelda },
    { key: 'coraggio', label: 'CORAGGIO', col: '#2E7A3A', home: [630, 1112] as P, owner: N.link },
  ];

  return (
    <g>
      {/* ---- la pergamena: il rotolo intero con i due cilindri */}
      <Pergamena id="zl-pg" x={-300} y={150} w={1680} h={3550} seed={11} rule={0} fibers={420} stains={26} />
      {[150, 3700].map((y, i) => (
        <g key={i}>
          <rect x={-320} y={y - 34} width={1720} height={68} rx="34" fill="url(#zl-rod)" stroke={INK} strokeWidth="6" />
          <path d={`M-300 ${y - 18} H1380`} stroke="#FFF0C8" strokeWidth="5" opacity=".5" />
          {[-340, 1400].map((x) => <circle key={x} cx={x} cy={y} r="44" fill="#C9962E" stroke={INK} strokeWidth="6" />)}
        </g>
      ))}
      {/* fregi a margine: tralci d'inchiostro con foglie dorate */}
      {[60, 1020].map((x, i) => (
        <g key={x} opacity=".55">
          <path d={`M${x} 260 ${Array.from({ length: 18 }, (_, k) => `q${i ? -24 : 24} 50 0 100 q${i ? 24 : -24} 50 0 100`).join(' ').slice(0, 9999)}`} fill="none" stroke={SEPIA} strokeWidth="3" />
          {Array.from({ length: 34 }, (_, k) => <ellipse key={k} cx={x + (k % 2 ? 14 : -14)} cy={300 + k * 100} rx="9" ry="5" fill={k % 3 ? '#C9962E' : '#6A9A4A'} transform={`rotate(${k % 2 ? 30 : -30} ${x + (k % 2 ? 14 : -14)} ${300 + k * 100})`} />)}
        </g>
      ))}

      {/* ---- le due miniature in alto e il tronco della linea del tempo */}
      {(['origine', 'hyrule'] as BandKey[]).map((k) => (
        <g key={k}>
          <clipPath id={`zl-c${k}`}><rect x={X0} y={BANDS[k].y0} width={X1 - X0} height={BANDS[k].h} rx="12" /></clipPath>
          <g clipPath={`url(#zl-c${k})`}>
            {k === 'origine' ? <ArtOrigine T={T} seal={seal0} /> : <ArtHyrule T={T} dark={dark} open={open} pulled={pulled} dawn={dawn} />}
          </g>
          <rect x={X0 - 12} y={BANDS[k].y0 - 12} width={X1 - X0 + 24} height={BANDS[k].h + 24} rx="18" fill="none" stroke={INK} strokeWidth="6" />
          <rect x={X0 - 6} y={BANDS[k].y0 - 6} width={X1 - X0 + 12} height={BANDS[k].h + 12} rx="15" fill="none" stroke="#C9962E" strokeWidth="4" />
          <rect x={X0 + 10} y={BANDS[k].y0 + 10} width={BANDS[k].name.length * 17.5 + 34} height="40" rx="6" fill={PAPER} stroke={INK} strokeWidth="3" opacity=".94" />
          <text x={X0 + 27} y={BANDS[k].y0 + 38} fontFamily={CINZEL} fontWeight={700} fontSize="22" letterSpacing="1" fill={INK}>{BANDS[k].name}</text>
        </g>
      ))}
      <Inchiostro id="zl-ink0" pts={[[540, 852], [530, 920], [540, 988]]} p={eio(seg(T, at('origine', 3, 0.2), at('origine', 3, 1.2)))} t={T} w={8} />
      {!WIDEV && T > at('origine', 3, 1.0) && <text x={560} y={932} fontFamily={HAND} fontWeight={700} fontSize={fit(34)} fill={SEPIA} opacity={seg(T, at('origine', 3, 1.0), at('origine', 3, 1.4))}>secoli dopo…</text>}

      {/* ---- capitolo 1: Link, Zelda, e un Link e una Zelda nuovi in ogni gioco */}
      {(() => {
        const t0 = at('chi', 3, 0.2);
        const off1 = 1 - seg(T, end('chi') - 0.3, end('chi') + 0.3);
        if (T < t0 || off1 <= 0) return null;
        return (
          <g opacity={off1}>
            {[N.link, N.zelda].map((n, j) => [-1, 0, 1].map((k) => {
              const t1 = t0 + 0.15 * (k + 1) + j * 0.3;
              if (T < t1) return null;
              const q = pop(T, t1);
              return (
                <g key={`${j}${k}`} transform={`translate(${n[0] + k * 74} ${n[1] - 120 + Math.abs(k) * 16}) scale(${q * 0.55})`} opacity=".8">
                  <circle r="46" fill={PAPER} stroke={SEPIA} strokeWidth="4" strokeDasharray="10 6" />
                  <g transform="scale(.9)" opacity=".75">{j ? <Corona /> : <Spada />}</g>
                </g>
              );
            }))}
            {!WIDEV && <text x={400} y={1270} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={fit(40)} fill={RED} stroke={PAPER} strokeWidth="8" paintOrder="stroke" opacity={seg(T, t0 + 0.6, t0 + 1.0)}>uno nuovo per ogni gioco</text>}
          </g>
        );
      })()}

      {/* ---- la Triforza: tre triangoli separati nel cielo di Hyrule */}
      {tris.map((tr, i) => {
        if (T < triIn) return null;
        const t1 = triIn + i * 0.15;
        const drop = eob(seg(T, t1, t1 + 0.6), 1.4);
        const apart = eo(seg(T, split, split + 0.6));
        const fly = eio(seg(T, toOwners + i * 0.12, toOwners + 1.0 + i * 0.12));
        const shake = T > split - 0.1 && T < split + 0.3 ? Math.sin(T * 80) * 4 : 0;
        const hx = tr.home[0] + (i - 1) * 40 * apart + shake, hy = tr.home[1];
        const ox = tr.owner[0] + 38, oy = tr.owner[1] - 40;
        const x = lerp(hx, ox, fly), y = lerp(lerp(hy - 120, hy, drop), oy, fly);
        const s = lerp(1.08, 0.36, fly) * (0.4 + 0.6 * seg(T, t1, t1 + 0.3));
        const lab = focus(at('triforza', 1, 0.1 + i * 0.45), toOwners) * (WIDEV ? 0 : 1);
        return (
          <g key={tr.key}>
            <g transform={`translate(${x} ${y}) scale(${s})`}><Tri T={T} id={`zl-tri${i}`} glow={1 - fly * 0.6} /></g>
            {lab > 0 && <text x={hx} y={hy + 64} textAnchor="middle" fontFamily={CINZEL} fontWeight={700} fontSize={fit(22)} fill={tr.col} stroke={PAPER} strokeWidth="6" paintOrder="stroke" opacity={lab}>{tr.label}</text>}
          </g>
        );
      })}
      <Tag T={T} t0={at('triforza', 2, 0.2)} x={470} y={1238} text="CUORE IN EQUILIBRIO?" bg={PAPER} size={28} rot={-2} until={at('triforza', 3, 0.3)} />
      <Tag T={T} t0={split} x={470} y={1240} text="SI SPEZZA IN TRE" bg={RED} fg={PAPER} size={30} rot={2} until={end('triforza') - 0.2} />

      {/* ---- i personaggi */}
      <Node T={T} t0={at('chi', 1, 0.1)} p={N.link} name="Link" sub={T < end('chi') ? "l'eroe" : adult > 0.5 ? 'adulto' : undefined} r={48 + 14 * adult} ring={focus(at('chi', 1), at('chi', 2)) + focus(at('ocarina', 3), end('ocarina')) + focus(at('bivio', 0), at('bivio', 1))}><Spada /></Node>
      <Node T={T} t0={at('chi', 2, 0.1)} p={N.zelda} name="Zelda" sub={T < end('chi') ? 'la principessa' : undefined} ring={focus(at('chi', 2), at('chi', 3)) + focus(at('bivio', 0), at('bivio', 0, 1.6))}><Corona /></Node>
      <Node T={T} t0={at('origine', 1, 0.1)} p={N.morti} name="Mortipher" sub={T < end('origine') ? 'il demone' : undefined} ring={focus(at('origine', 1), at('origine', 2, 0.6))} dead={seg(T, at('origine', 1, 1.2), at('origine', 1, 1.6))}><Nube T={T} /></Node>
      <Node T={T} t0={at('ocarina', 0, 0.1)} p={N.ganon} name="Ganondorf" sub={T < end('ocarina') ? 'il re dei ladri' : undefined} ring={focus(at('ocarina', 0), at('ocarina', 1)) + focus(at('ocarina', 2), at('ocarina', 3))}><Fiamma T={T} /></Node>

      {/* ---- capitolo 2: la maledizione scende su Link e Zelda; rinascono sempre */}
      <Tratto T={T} t0={at('origine', 2, 0.1)} a={[820, 760]} b={[262, 1410]} c={[420, 900]} color={RED} dashed w={7} arrow label="maledizione" lx={30} ly={-30} size={44} dur={0.9} fade={off('origine')} />
      <Tratto T={T} t0={at('origine', 2, 0.3)} a={[830, 762]} b={[548, 1424]} c={[700, 1080]} color={RED} dashed w={7} arrow dur={0.9} fade={off('origine')} />
      <Giro T={T} x={N.link[0]} y={N.link[1]} r={70} on={focus(at('origine', 3, 0.1), end('origine') - 0.2)} />
      <Giro T={T} x={N.zelda[0]} y={N.zelda[1]} r={70} on={focus(at('origine', 3, 0.3), end('origine') - 0.2)} />
      <Tag T={T} t0={at('origine', 3, 0.5)} x={540} y={1170} text="OGNI EPOCA, DA CAPO" bg={GOLD} size={32} rot={-2} until={end('origine') - 0.3} />

      {/* ---- capitolo 4: Ganondorf vuole la Triforza; la strada aperta; la conquista; sette anni; la vittoria */}
      <Tratto T={T} t0={at('ocarina', 0, 0.6)} a={[790, 1395]} b={[655, 1140]} c={[680, 1320]} color={VIOLET} dashed w={6} arrow label="la vuole" lx={40} size={40} fade={off('ocarina')} />
      <Tag T={T} t0={at('ocarina', 1, 0.8)} x={330} y={1150} text="LA STRADA È APERTA" bg={PAPER} size={26} rot={-3} until={at('ocarina', 2, 0.2)} />
      <Tag T={T} t0={at('ocarina', 2, 1.6)} x={760} y={1300} text="HYRULE CONQUISTATA" bg={RED} fg={PAPER} size={28} rot={2} until={at('ocarina', 3, 0.2)} />
      {(() => {
        const t0 = at('ocarina', 3, 0.1);
        if (T < t0 || T > end('ocarina') + 0.4) return null;
        const p = seg(T, t0, t0 + 1.2);
        return (
          <g transform={`translate(${N.link[0] + 95} ${N.link[1] - 110}) scale(${pop(T, t0)})`} opacity={1 - seg(T, end('ocarina'), end('ocarina') + 0.4)}>
            <circle r="34" fill={PAPER} stroke={INK} strokeWidth="4" />
            <g stroke={INK} strokeWidth="3.5" fill="none" strokeLinejoin="round">
              <path d="M-13 -20 H13 M-13 20 H13 M-10 -20 Q-10 -3 0 0 Q10 -3 10 -20 M-10 20 Q-10 3 0 0 Q10 3 10 20" />
            </g>
            <path d={`M-7 ${-17 + 10 * p} H7 L0 -2 Z`} fill={GOLD} />
            <path d={`M-8 18 H8 L0 ${18 - 12 * p} Z`} fill={GOLD} />
            {!WIDEV && <text x="46" y="10" fontFamily={HAND} fontWeight={700} fontSize={fit(40)} fill={INK} stroke={PAPER} strokeWidth="7" paintOrder="stroke">7 anni</text>}
          </g>
        );
      })()}
      {flash > 0 && <rect x="-500" y="-500" width="3000" height="4500" fill="#FFF8DC" opacity={flash * 0.5} />}
      <Tratto T={T} t0={win - 0.5} a={[300, 1440]} b={[780, 1450]} c={[540, 1360]} color={INK} w={7} arrow label="lo sconfigge" ly={-24} size={40} dur={0.5} fade={off('ocarina')} />
      <Sigillo x={N.ganon[0] - 36} y={N.ganon[1] + 32} t={T} t0={win + 0.2} s={0.62}>
        <path d="M0 -20 L18 12 H-18 Z" fill="none" stroke="#5A1410" strokeWidth="4" strokeLinejoin="round" />
      </Sigillo>

      {/* ---- capitolo 5: l'ocarina rimanda Link indietro nel tempo; il tronco scende; il bivio in tre rami */}
      {(() => {
        const t0 = at('bivio', 0, 0.3);
        if (T < t0 || T > end('bivio') + 0.5) return null;
        const fade = 1 - seg(T, at('bivio', 1, 0.6), at('bivio', 1, 1.2));
        return (
          <g opacity={fade}>
            <g transform={`translate(${N.zelda[0] - 74} ${N.zelda[1] - 92}) scale(${pop(T, t0) * 0.9})`}>
              <circle r="38" fill={PAPER} stroke={INK} strokeWidth="4" />
              <Ocarina s={0.85} />
            </g>
            <Tratto T={T} t0={t0 + 0.3} a={[N.zelda[0] - 110, N.zelda[1] - 100]} b={[N.link[0] + 20, N.link[1] - 70]} c={[360, 1270]} color={TIME} dashed w={8} arrow flow label="indietro nel tempo" ly={-28} size={38} dur={0.9} />
          </g>
        );
      })()}
      <Inchiostro id="zl-ink1" pts={[[540, 1592], [548, 1660], [540, 1748]]} p={trunk} t={T} w={9} />
      {BRANCH.map((pts, i) => (
        <Inchiostro key={i} id={`zl-br${i}`} pts={pts} p={branch} t={T} w={9} color={ARCH[i].color} seed={i + 5} halo={T > archOn(ARCH[i].key) && T < archOn(ARCH[i].key) + 12 ? 1 : 0} />
      ))}
      {trunk > 0.95 && (
        <g transform={`translate(${FORK[0]} ${FORK[1]}) scale(${pop(T, at('bivio', 1, 1.3))})`}>
          <circle r="22" fill={GOLD} stroke={INK} strokeWidth="5" />
          <circle r="8" fill={PAPER} />
        </g>
      )}
      <Ring T={T} x={FORK[0]} y={FORK[1]} r={64} on={focus(at('bivio', 1, 1.3), end('bivio') - 0.4)} />
      <Tag T={T} t0={at('bivio', 1, 1.4)} x={790} y={1700} text="IL BIVIO" bg={RED} fg={PAPER} size={32} rot={3} until={end('bivio') - 0.3} />
      {!WIDEV && (
        <g opacity={focus(at('bivio', 3, 0.1), end('bivio') - 0.1)}>
          <text x={330} y={1810} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={fit(36)} fill={RED} stroke={PAPER} strokeWidth="7" paintOrder="stroke">perde</text>
          <text x={590} y={1880} textAnchor="start" fontFamily={HAND} fontWeight={700} fontSize={fit(36)} fill={BLUE} stroke={PAPER} strokeWidth="7" paintOrder="stroke">vince</text>
          <text x={760} y={1810} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={fit(36)} fill={AMBER} stroke={PAPER} strokeWidth="7" paintOrder="stroke">vince</text>
        </g>
      )}

      {/* ---- prima del bivio: il resto della pagina è solo abbozzato a matita (tronco, bivio, tre finestre) */}
      {(() => {
        const g = 1 - seg(T, at('bivio', 2, 0.6), at('bivio', 3, 0.2));
        if (g <= 0) return null;
        return (
          <g opacity={0.42 * g} fill="none" stroke={SEPIA} strokeWidth="4" strokeDasharray="12 12" strokeLinecap="round">
            <path d="M540 1592 V1740" />
            <circle cx={FORK[0]} cy={FORK[1]} r="22" />
            {BRANCH.map((pts, i) => <path key={i} d={`M${pts[0][0]} ${pts[0][1]} Q${pts[1][0]} ${pts[1][1] + 40} ${pts[pts.length - 1][0]} ${pts[pts.length - 1][1]}`} />)}
            {ARCH.map((a) => <path key={a.key} d={archClip(a.x)} />)}
            {ARCH.map((a) => <text key={`q${a.key}`} x={a.x} y={AY + AH / 2 + 30} textAnchor="middle" fontFamily={CINZEL} fontWeight={700} fontSize="90" fill={SEPIA} stroke="none" opacity=".6">?</text>)}
          </g>
        );
      })()}

      {/* ---- le tre finestre miniate */}
      {ARCH.map((a, i) => {
        const on = seg(T, archOn(a.key), archOn(a.key) + 0.6);
        const ghost = arches * (1 - on);
        if (arches <= 0) return null;
        const art = (
          <>
            {a.key === 'sconfitta' && <ArtSconfitta T={T} take={seg(T, at('sconfitta', 1, 0.1), at('sconfitta', 1, 1.2))} seal={eo(seg(T, at('sconfitta', 2, 0.6), at('sconfitta', 2, 1.8)))} />}
            {a.key === 'mare' && <ArtMare T={T} flood={T < at('mare', 1) ? 0.0001 : seg(T, at('mare', 1, 0.4), at('mare', 1, 2.4))} isles={seg(T, at('mare', 2, 0.1), at('mare', 2, 0.9))} sail={seg(T, at('mare', 3, 0.1), at('mare', 3, 3.0))} />}
            {a.key === 'crepuscolo' && <ArtCrepuscolo T={T} banish={seg(T, at('crepuscolo', 1, 0.3), at('crepuscolo', 1, 1.8))} back={seg(T, at('crepuscolo', 3, 0.3), at('crepuscolo', 3, 1.8))} />}
          </>
        );
        return (
          <g key={a.key}>
            <clipPath id={`zl-a${i}`}><path d={archClip(a.x)} /></clipPath>
            <g clipPath={`url(#zl-a${i})`}>
              <rect x={a.x - AW / 2} y={AY} width={AW} height={AH} fill={PAPER} />
              <g opacity={Math.max(on, 0.28 * ghost)}>{art}</g>
            </g>
            <Arco x={a.x - AW / 2} y={AY} w={AW} h={AH} p={arches} t={T} lit={on * (T < archOn(a.key) + 12 ? 1 : 0)} color={a.color} />
            {on > 0 && FOCUSV && <text x={a.x} y={AY + AH + 46} textAnchor="middle" fontFamily={CINZEL} fontWeight={700} fontSize={fit(19)} fill={a.color} stroke={PAPER} strokeWidth="5" paintOrder="stroke" opacity={on}>{a.name}</text>}
          </g>
        );
      })}
      {/* cartigli con i giochi di ogni ramo */}
      <Cartiglio T={T} t0={at('sconfitta', 3, 0.2)} x={ARCH[0].x} y={AY + 236} w={230} text="A LINK TO THE PAST" color={RED} />
      <Cartiglio T={T} t0={at('sconfitta', 3, 1.4)} x={ARCH[0].x} y={AY + 284} w={230} text="IL PRIMO ZELDA · 1986" color={RED} />
      <Cartiglio T={T} t0={at('mare', 2, 0.3)} x={ARCH[1].x} y={AY + 236} w={200} text="WIND WAKER" color={BLUE} />
      <Cartiglio T={T} t0={at('mare', 3, 0.6)} x={ARCH[1].x} y={AY + 284} w={200} text="UNA TERRA NUOVA" color={BLUE} />
      <Cartiglio T={T} t0={at('crepuscolo', 2, 0.1)} x={ARCH[2].x} y={AY + 236} w={210} text="MAJORA'S MASK" color={AMBER} />
      <Cartiglio T={T} t0={at('crepuscolo', 2, 1.0)} x={ARCH[2].x} y={AY + 284} w={230} text="TWILIGHT PRINCESS" color={AMBER} />
      {/* parole chiave dei rami */}
      <Tag T={T} t0={at('sconfitta', 0, 0.3)} x={ARCH[0].x} y={AY + 40} text="LINK PERDE" bg={RED} fg={PAPER} size={20} rot={-3} until={at('sconfitta', 1, 0.2)} />
      <Tag T={T} t0={at('sconfitta', 2, 1.0)} x={ARCH[0].x} y={AY + 40} text="SIGILLATO" bg={GOLD} size={20} rot={2} until={end('sconfitta') - 0.2} />
      <Tag T={T} t0={at('mare', 0, 0.6)} x={ARCH[1].x} y={AY + 40} text="NESSUN EROE" bg={PAPER} size={20} rot={-2} until={at('mare', 1, 0.2)} />
      <Tag T={T} t0={at('mare', 1, 0.4)} x={ARCH[1].x} y={AY + 40} text="HYRULE SOTT'ACQUA" bg={BLUE} fg={PAPER} size={20} rot={2} until={end('mare') - 0.2} />
      <Tag T={T} t0={at('crepuscolo', 0, 0.5)} x={ARCH[2].x} y={AY + 40} text="AVVERTE ZELDA" bg={PAPER} size={20} rot={-2} until={at('crepuscolo', 1, 0.2)} />
      <Tag T={T} t0={at('crepuscolo', 1, 1.0)} x={ARCH[2].x} y={AY + 40} text="CACCIATO" bg={AMBER} fg={PAPER} size={20} rot={2} until={at('crepuscolo', 3, 0.2)} />
      <Tag T={T} t0={at('crepuscolo', 3, 1.0)} x={ARCH[2].x} y={AY + 40} text="TORNA" bg={RED} fg={PAPER} size={20} rot={-2} until={end('crepuscolo') - 0.2} />

      {/* ---- molto dopo: la terza miniatura e i rami tratteggiati che ci arrivano senza sapere da dove */}
      {(() => {
        const k: BandKey = 'dopo';
        const p = eo(seg(T, at('dopo', 0, -0.4), at('dopo', 0, 0.4)));
        if (T < at('bivio', 2, 0.6)) return null;
        const g = Math.max(p, 0.25);
        return (
          <g opacity={g}>
            <clipPath id="zl-cdopo"><rect x={X0} y={BANDS[k].y0} width={X1 - X0} height={BANDS[k].h} rx="12" /></clipPath>
            <g clipPath="url(#zl-cdopo)"><ArtDopo T={T} /></g>
            <rect x={X0 - 12} y={BANDS[k].y0 - 12} width={X1 - X0 + 24} height={BANDS[k].h + 24} rx="18" fill="none" stroke={INK} strokeWidth="6" />
            <rect x={X0 - 6} y={BANDS[k].y0 - 6} width={X1 - X0 + 12} height={BANDS[k].h + 12} rx="15" fill="none" stroke="#C9962E" strokeWidth="4" />
            <rect x={X0 + 10} y={BANDS[k].y0 + 10} width={BANDS[k].name.length * 17.5 + 34} height="40" rx="6" fill={PAPER} stroke={INK} strokeWidth="3" opacity=".94" />
            <text x={X0 + 27} y={BANDS[k].y0 + 38} fontFamily={CINZEL} fontWeight={700} fontSize="22" letterSpacing="1" fill={INK}>{BANDS[k].name}</text>
          </g>
        );
      })()}
      <Cartiglio T={T} t0={at('dopo', 0, 0.3)} x={540} y={BANDS.dopo.y0 + 420} w={300} text="BREATH OF THE WILD" color={INK} size={20} />
      <Cartiglio T={T} t0={at('dopo', 0, 1.3)} x={540} y={BANDS.dopo.y0 + 470} w={330} text="TEARS OF THE KINGDOM" color={INK} size={20} />
      {ARCH.map((a, i) => (
        <Inchiostro key={a.key} id={`zl-q${i}`} pts={[[a.x, AY + AH + 70], [lerp(a.x, 540, 0.4), 2420], [lerp(a.x, 540, 0.7), BANDS.dopo.y0 - 20]]} p={eio(seg(T, at('dopo', 2, 0.1 + i * 0.2), at('dopo', 2, 1.4 + i * 0.2)))} t={T} w={7} color={a.color} dash="14 12" nib={false} />
      ))}
      {(() => {
        const t0 = at('dopo', 2, 1.2);
        if (T < t0) return null;
        return (
          <g transform={`translate(540 2470) rotate(${Math.sin(T * 3) * 5}) scale(${pop(T, t0)})`}>
            <text y="40" textAnchor="middle" fontFamily={CINZEL} fontWeight={700} fontSize={fit(120)} fill={RED} stroke={PAPER} strokeWidth="10" paintOrder="stroke">?</text>
          </g>
        );
      })()}
      <Ring T={T} x={540} y={2440} r={110} on={focus(at('dopo', 2, 1.2), at('dopo', 3, 0.8))} />
      {/* ---- in fondo alla pergamena: il calamaio con la penna d'oca e il fregio di chiusura */}
      <g transform="translate(540 3360)">
        <path d="M-300 0 Q-150 -40 0 0 Q150 40 300 0" fill="none" stroke={SEPIA} strokeWidth="5" />
        <path d="M-300 20 Q-150 -20 0 20 Q150 60 300 20" fill="none" stroke="#C9962E" strokeWidth="3" />
        {[-250, -125, 125, 250].map((x, i) => <ellipse key={x} cx={x} cy={i % 2 ? 22 : -2} rx="16" ry="8" fill={i % 2 ? '#6A9A4A' : '#C9962E'} transform={`rotate(${i % 2 ? 25 : -25} ${x} ${i % 2 ? 22 : -2})`} />)}
        <g transform="translate(0 150)">
          <ellipse cx="0" cy="70" rx="90" ry="18" fill="#000" opacity=".15" />
          <path d="M-70 70 V0 Q-70 -30 -40 -36 H40 Q70 -30 70 0 V70 Z" fill="#2A2238" stroke={INK} strokeWidth="6" />
          <path d="M-56 -4 Q-56 -22 -34 -24" stroke="#6A5A88" strokeWidth="5" fill="none" strokeLinecap="round" />
          <rect x="-36" y="-56" width="72" height="22" rx="6" fill="#3A3048" stroke={INK} strokeWidth="5" />
          <ellipse cx="0" cy="-56" rx="36" ry="9" fill="#120E18" stroke={INK} strokeWidth="4" />
          <g transform={`rotate(${28 + Math.sin(T * 0.8) * 2} 0 -60)`}>
            <path d="M0 -60 L4 -250 Q40 -300 70 -380 Q30 -330 -8 -300 Q-30 -260 -6 -230 L-2 -60 Z" fill="#F4EEE0" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
            <path d="M2 -70 L6 -330" stroke={SEPIA} strokeWidth="3" />
            {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M5 ${-110 - i * 26} l${22 + i * 2} -${16 + i * 2}`} stroke="#C8BCA8" strokeWidth="2.5" />)}
          </g>
        </g>
      </g>
      <Tag T={T} t0={at('dopo', 3, 0.3)} x={540} y={BANDS.dopo.y0 + 120} text="SCEGLI TU" bg={GOLD} size={34} rot={-2} until={end('dopo') + 1} />
    </g>
  );
};

export const makeSchema = (chapterId: string): React.FC<SceneProps> => {
  const Scene: React.FC<SceneProps> = ({ t }) => {
    const T = STARTS[chapterId] + t;
    const c = camAt(T);
    UI_K = Math.max(1, 0.85 / c.z);
    WIDEV = c.z < 0.5;
    FOCUSV = c.z > 1.2;
    return (
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id="zl" />
          <linearGradient id="zl-desk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2A1E14" />
            <stop offset="1" stopColor="#140C08" />
          </linearGradient>
          <linearGradient id="zl-rod" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#B07A3A" />
            <stop offset=".45" stopColor="#E8B870" />
            <stop offset="1" stopColor="#6A4422" />
          </linearGradient>
          <linearGradient id="zl-sky1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F6D58A" />
            <stop offset=".35" stopColor="#F4E6B8" />
            <stop offset=".6" stopColor="#BFE3F0" />
            <stop offset="1" stopColor="#9FD3EE" />
          </linearGradient>
          <linearGradient id="zl-land1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7DBA5A" />
            <stop offset=".5" stopColor="#5E9E48" />
            <stop offset="1" stopColor="#3E7A3A" />
          </linearGradient>
          <linearGradient id="zl-rock" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#B09A80" />
            <stop offset="1" stopColor="#7A6450" />
          </linearGradient>
          <linearGradient id="zl-stone" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#C8C0B0" />
            <stop offset="1" stopColor="#8A8478" />
          </linearGradient>
          <linearGradient id="zl-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF6D0" stopOpacity="0" />
            <stop offset=".5" stopColor="#FFF6D0" stopOpacity=".6" />
            <stop offset="1" stopColor="#FFF6D0" stopOpacity=".2" />
          </linearGradient>
          <linearGradient id="zl-sky2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7EC2E8" />
            <stop offset=".35" stopColor="#A8D8EE" />
            <stop offset=".55" stopColor="#E4F2EC" />
            <stop offset="1" stopColor="#E4F2EC" />
          </linearGradient>
          <linearGradient id="zl-red" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2A0E20" />
            <stop offset=".6" stopColor="#7A2030" />
            <stop offset="1" stopColor="#C85A3A" />
          </linearGradient>
          <linearGradient id="zl-hill" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#6AAE4E" />
            <stop offset="1" stopColor="#3E7E3A" />
          </linearGradient>
          <linearGradient id="zl-hill2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7CC05A" />
            <stop offset="1" stopColor="#4E9040" />
          </linearGradient>
          <linearGradient id="zl-wall" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#F4EAD2" />
            <stop offset="1" stopColor="#C8B898" />
          </linearGradient>
          <linearGradient id="zl-sk-r" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1E0A14" />
            <stop offset=".5" stopColor="#5A1424" />
            <stop offset="1" stopColor="#A8402E" />
          </linearGradient>
          <linearGradient id="zl-sk-b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6AB8E8" />
            <stop offset=".5" stopColor="#BFE4F4" />
            <stop offset="1" stopColor="#F2EED8" />
          </linearGradient>
          <linearGradient id="zl-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2E78B8" />
            <stop offset=".5" stopColor="#1E5A90" />
            <stop offset="1" stopColor="#0E2E58" />
          </linearGradient>
          <linearGradient id="zl-sk-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3A1E4A" />
            <stop offset=".45" stopColor="#B05A4A" />
            <stop offset=".75" stopColor="#F0A050" />
            <stop offset="1" stopColor="#F8D08A" />
          </linearGradient>
          <linearGradient id="zl-sky3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9CC8E4" />
            <stop offset=".6" stopColor="#E8EEDC" />
            <stop offset="1" stopColor="#F6E8C0" />
          </linearGradient>
          <linearGradient id="zl-scrim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F3E4C0" stopOpacity=".97" />
            <stop offset=".8" stopColor="#F3E4C0" stopOpacity=".9" />
            <stop offset="1" stopColor="#F3E4C0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#zl-desk)" />
        <g transform={`translate(540 900) scale(${c.z}) translate(${-c.x} ${-c.y})`}>
          <Schema T={T} />
        </g>
        <rect width="1080" height="560" fill="url(#zl-scrim)" />
        {MOTES.map((m, i) => (
          <circle key={i} cx={mod(m.x + Math.sin(T * 0.5 + m.ph) * 30, 1080)} cy={mod(m.y - T * m.v, 1920)} r={m.s} fill="#F2C230" opacity={0.18 + 0.1 * Math.sin(T * 2 + m.ph)} />
        ))}
        <Fireflies id="zl-ff" t={T} seed={5} n={8} x={0} y={1500} w={1080} h={400} color="#FFE9A0" />
        <Finish id="zl" tint="#8A6A30" tintOpacity={0.08} />
      </svg>
    );
  };
  return Scene;
};
