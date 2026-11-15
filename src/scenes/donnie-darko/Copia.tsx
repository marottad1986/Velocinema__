import React from 'react';
import { eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { HAND, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Embers, Fire, Flyers, Glow, Smoke, Stars, WaveBand, flashAt } from '../../lib/elements';
import { subtitleTimes } from '../../components/ChapterOverlay';
import type { SceneProps } from '../../types';
import film from '../../../films/donnie-darko.json';

// Donnie Darko come schema (formato "spiegato"): la copia del mondo che si stacca dal mondo vero.
// A sinistra la linea dritta del MONDO VERO; dalla casa dei Darko (2 ottobre 1988, il punto in cui tutto si sdoppia)
// parte una deviazione che apre una bolla tratteggiata: LA COPIA, l'universo tangente, con le sue stazioni dall'alto
// verso il basso nell'ordine del racconto: la casa di Nonna Morte, il paese (la scuola allagata e la casa di Cunningham
// che brucia), la collina con il vortice all'alba. Il motore d'aereo (arancione, l'unico accento) cade sulla casa,
// e alla fine il vortice lo rimanda indietro lungo il tratteggio giallo (= viaggio nel tempo) fino alla prima notte.
// In alto a destra il contatore dei 28 giorni scandisce un secondo per battito (60 bpm).
// Personaggi = cerchi con l'oggetto, mai figure: Donnie = pantofole, Frank = orecchie da coniglio (un cerchietto, non il
// costume del film), Nonna Morte = libro, Cunningham = videocassetta, Gretchen = bicicletta.
// Coordinate = mondo; la camera porta il punto (x, y) al centro dello schermo (540, 900) con zoom z.
// Gli eventi cadono sulla griglia della musica (60 bpm, crome), gli stessi istanti dello spartito scripts/audio/donnie-darko.mjs.

export const INK = '#EEF0F7';
export const ENGINE = '#F2A03A'; // il motore: l'unico oggetto in colore accento
export const TIME = '#F5D04A'; // tratteggio giallo = viaggio nel tempo
export const RED = '#E8553F';
export const COPY = '#7FA6FF'; // la copia (universo tangente): azzurro freddo
const DIM = '#7C82A8';
const PAPER = '#12152B';
const DARK = '#0A0C1A';
const X0 = 130, X1 = 950, H = 520;
const MX = 62; // la linea del mondo vero
type P = readonly [number, number];
const BANDS = [
  { key: 'casa', y0: 400, name: 'CASA DARKO · 2 OTTOBRE 1988' },
  { key: 'nonna', y0: 1080, name: 'LA CASA DI NONNA MORTE' },
  { key: 'paese', y0: 1760, name: 'IL PAESE' },
  { key: 'collina', y0: 2440, name: "LA COLLINA · L'ALBA" },
] as const;
type BandKey = (typeof BANDS)[number]['key'];
const BAND = Object.fromEntries(BANDS.map((b) => [b.key, b])) as Record<BandKey, (typeof BANDS)[number]>;
const cy = (k: BandKey) => BAND[k].y0 + 260;
const BUB = { x0: 100, x1: 980, y0: 1030, y1: 3000 }; // la bolla della copia
const N = {
  donnie: [290, 560], frank: [800, 520], bed: [513, 712],
  nonna: [300, 1250], gretchen: [600, 1290], frank2: [840, 1340],
  cunn: [790, 1930],
  gretchenVera: [720, 850],
} as const;
const ENG_HIT: P = [520, 612]; // dove il motore si pianta nel tetto

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
const Z = 1.04;
const band = (k: BandKey, z = Z, dx = 0, dy = 0) => ({ x: 540 + dx, y: cy(k) + dy, z: z * 1.14 });
const WIDE = { x: 520, y: 1020, z: 0.62 };
const SHOTS: Shot[] = [
  { at: at('coniglio', 0), ...band('casa', 1.0, -40, 0) },
  { at: at('coniglio', 1), ...band('casa', 1.08, 60, -20) },
  { at: at('coniglio', 2), ...band('casa', 1.0, 0, -10) },
  { at: at('coniglio', 3), ...band('casa', 1.04, -90, 50) },
  // il motore cade: la camera si stringe sulla casa, poi sulla camera da letto vuota
  { at: at('motore', 0), ...band('casa', 1.02, -20, 0) },
  { at: at('motore', 1), ...band('casa', 1.22, -40, 50) },
  { at: at('motore', 2), ...band('casa', 1.0, 40, -20) },
  { at: at('motore', 3), ...band('casa', 1.12, -20, -10) },
  // dalla casa di Donnie alla casa di Nonna Morte
  { at: at('libro', 0), ...band('casa', 1.0, 0, -20) },
  { at: at('libro', 1), x: 520, y: 1020, z: 0.86 },
  { at: at('libro', 2), ...band('nonna', 1.04, -60, 0) },
  { at: at('libro', 3), ...band('nonna', 0.96, 0, 0) },
  // il mondo vero e la copia: la camera si allarga su tutto lo schema
  { at: at('tangente', 0), x: 440, y: 820, z: 0.74 },
  { at: at('tangente', 1), x: 500, y: 1080, z: 0.62 },
  { at: at('tangente', 3), x: 500, y: 1400, z: 0.55 },
  // l'oggetto in più e il ricevitore
  { at: at('ricevitore', 0), ...band('casa', 1.08, -20, 0) },
  { at: at('ricevitore', 1), ...band('casa', 0.95, -60, 0) },
  { at: at('ricevitore', 2), ...band('casa', 1.15, -170, -20) },
  { at: at('ricevitore', 3), ...band('casa', 1.0, -40, -10) },
  // i danni: la scuola allagata, la casa che brucia, Cunningham
  { at: at('danni', 0), x: 540, y: 1300, z: 0.6 },
  { at: at('danni', 1), ...band('paese', 1.0, -50, 0) },
  { at: at('danni', 1, 1.6), ...band('paese', 1.0, 50, 0) },
  { at: at('danni', 3), ...band('paese', 1.06, 60, -20) },
  // l'ultima notte: Gretchen, Nonna Morte, l'auto
  { at: at('gretchen', 0), x: 480, y: 950, z: 0.8 },
  { at: at('gretchen', 1), ...band('nonna', 1.0) },
  { at: at('gretchen', 2), ...band('nonna', 1.06, 60, 50) },
  { at: at('gretchen', 3), ...band('nonna', 1.06, 70, 30) },
  // lo sparo; il libro; la camera risale lungo il tratteggio fino al Frank della prima notte
  { at: at('guida', 0), ...band('nonna', 1.08, 80, 40) },
  { at: at('guida', 1), ...band('nonna', 0.95, 40, 0) },
  { at: at('guida', 2), x: 760, y: 1250, z: 0.75 },
  { at: at('guida', 2, 1.2), x: 680, y: 780, z: 0.8 },
  { at: at('guida', 3), ...band('casa', 1.0, 40, -10) },
  // il vortice sulla collina; il motore torna indietro lungo il tratteggio giallo fino alla casa
  { at: at('vortice', 0), x: 540, y: 2200, z: 0.6 },
  { at: at('vortice', 0, 1.0), ...band('collina', 1.0, 0, -20) },
  { at: at('vortice', 2), ...band('collina', 1.1, 60, -60) },
  { at: at('vortice', 3, 0.6), x: 640, y: 2350, z: 0.62 },
  { at: at('vortice', 3, 1.8), x: 640, y: 1000, z: 0.6 },
  // la fine: tutto si riavvolge, il motore cade di nuovo, il mondo vero va avanti
  { at: at('letto', 0), x: 520, y: 1500, z: 0.45 },
  { at: at('letto', 0, 1.6), ...band('casa', 1.05, 80, 0) },
  { at: at('letto', 1), ...band('casa', 1.2, -40, 40) },
  { at: at('letto', 2), ...band('casa', 1.0, 0, 40) },
  { at: at('letto', 3), ...band('casa', 1.05, -10, 60) },
  { at: at('letto', 3, 1.4), ...WIDE },
];
/** Zoom attuale della camera: le scritte dello schema crescono quando la camera si allontana, così restano leggibili. */
let UI_K = 1;
let WIDEV = false;
const fit = (size: number) => Math.max(size, Math.min(size * UI_K, WIDEV ? 100 : 130));
const camAt = (T: number) => {
  let o = { x: SHOTS[0].x, y: SHOTS[0].y, z: SHOTS[0].z };
  for (const s of SHOTS.slice(1)) {
    const p = eio(seg(T, s.at - 0.2, s.at + 1.1));
    o = { x: lerp(o.x, s.x, p), y: lerp(o.y, s.y, p), z: Math.exp(lerp(Math.log(o.z), Math.log(s.z), p)) };
  }
  return { x: o.x + Math.sin(T * 0.3) * 6, y: o.y + Math.cos(T * 0.25) * 5, z: o.z * (1 + 0.012 * Math.sin(T * 0.2)) };
};

// ---------------------------------------------------------------- il contatore dei 28 giorni

const DAY = 86400;
const FULL = 28 * DAY + 6 * 3600 + 42 * 60 + 12;
/** Tempo che manca alla fine (in secondi della storia), un secondo per battito; a ogni capitolo il racconto salta avanti. */
const remaining = (T: number): number | null => {
  const t0 = at('coniglio', 2);
  if (T < t0) return null;
  const jump: [string, number][] = [
    ['coniglio', FULL], ['motore', 27 * DAY + 20 * 3600 + 15 * 60], ['libro', 24 * DAY + 5 * 3600], ['tangente', 21 * DAY + 9 * 3600],
    ['ricevitore', 18 * DAY + 2 * 3600], ['danni', 11 * DAY + 14 * 3600], ['gretchen', 7 * 3600 + 12 * 60], ['guida', 3 * 3600 + 25 * 60],
  ];
  let base = FULL, from = t0;
  for (const [ch, v] of jump) if (T >= (ch === 'coniglio' ? t0 : STARTS[ch])) { base = v; from = ch === 'coniglio' ? t0 : STARTS[ch]; }
  // nel vortice gli ultimi secondi corrono fino a zero quando il motore si stacca
  const v0 = STARTS.vortice, vz = at('vortice', 2, 0.5);
  if (T >= v0) {
    if (T >= vz) {
      // nel capitolo finale tutto si riavvolge: il contatore torna ai 28 giorni della prima notte
      const rw = eio(seg(T, at('letto', 0, 0.2), at('letto', 0, 1.8)));
      return Math.round(lerp(0, FULL, rw));
    }
    const left = 95 * 60;
    return Math.max(0, Math.round(lerp(left, 0, eio(seg(T, v0, vz)))));
  }
  return Math.max(0, base - Math.floor(T - from));
};
const fmt = (s: number) => {
  const d = Math.floor(s / DAY), h = Math.floor((s % DAY) / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d)}:${p(h)}:${p(m)}:${p(x)}`;
};
const Counter: React.FC<{ T: number }> = ({ T }) => {
  const r = remaining(T);
  if (r === null) return null;
  const t0 = at('coniglio', 2);
  const a = eo(seg(T, t0, t0 + 0.4));
  const fade = 1 - seg(T, at('letto', 2, 0), at('letto', 2, 0.8));
  const urgent = r < 8 * 3600 && r > 0;
  const zero = r === 0;
  const col = zero ? RED : urgent ? ENGINE : INK;
  const s = 1 + 0.25 * (1 - eo(seg(T, t0, t0 + 0.5)));
  return (
    <g opacity={a * fade} transform={`translate(850 284) scale(${s}) translate(-850 -284)`}>
      <rect x="736" y="258" width="224" height="52" rx="26" fill={DARK} opacity=".78" />
      <rect x="736" y="258" width="224" height="52" rx="26" fill="none" stroke={col} strokeWidth="2.5" opacity={0.5 + 0.4 * (urgent ? Math.abs(Math.sin(T * Math.PI)) : 0)} />
      {/* clessidra */}
      <g transform="translate(768 284)" stroke={col} strokeWidth="2.5" fill="none" strokeLinejoin="round">
        <path d="M-9 -13 H9 M-9 13 H9 M-7 -13 Q-7 -2 0 0 Q7 -2 7 -13 M-7 13 Q-7 2 0 0 Q7 2 7 13" />
        <path d={`M-4 ${13 - 5 * (1 - r / FULL)} H4 L0 ${10} Z`} fill={col} stroke="none" />
      </g>
      <text x="874" y="294" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="26" letterSpacing="0.5" fill={col} style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(r)}</text>
    </g>
  );
};

// ---------------------------------------------------------------- oggetti dei personaggi

/** Donnie: un paio di pantofole (il sonnambulo). */
export const Slippers: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`} strokeLinejoin="round">
    {[-15, 15].map((x, i) => (
      <g key={x} transform={`translate(${x} ${i ? 4 : -2}) rotate(${i ? 8 : -8})`}>
        <path d="M-11 -26 Q0 -34 11 -26 L13 20 Q0 32 -13 20 Z" fill="#3F4C86" stroke={INK} strokeWidth="3.5" />
        <path d="M-12 -4 Q0 -14 12 -4 L13 8 Q0 0 -13 8 Z" fill="#5C6BB0" stroke={INK} strokeWidth="2.5" />
        <circle cx="0" cy="-2" r="3" fill={INK} />
      </g>
    ))}
  </g>
);
/** Frank: un cerchietto con le orecchie da coniglio (oggetto generico, non il costume del film). */
export const Ears: React.FC<{ s?: number; color?: string }> = ({ s = 1, color = INK }) => (
  <g transform={`scale(${s})`} strokeLinejoin="round" strokeLinecap="round">
    <path d="M-16 6 Q-30 -30 -18 -40 Q-6 -36 -6 2" fill="#5A5F78" stroke={color} strokeWidth="3.5" />
    <path d="M-15 -2 Q-22 -26 -16 -32 Q-10 -28 -11 -2" fill="#2A2D40" />
    <path d="M16 6 Q30 -30 18 -40 Q6 -36 6 2" fill="#5A5F78" stroke={color} strokeWidth="3.5" />
    <path d="M15 -2 Q22 -26 16 -32 Q10 -28 11 -2" fill="#2A2D40" />
    <path d="M-30 22 Q0 -6 30 22" fill="none" stroke={color} strokeWidth="6" />
    <path d="M-30 22 Q0 -6 30 22" fill="none" stroke="#2A2D40" strokeWidth="2" />
  </g>
);
/** Nonna Morte: il vecchio libro sui viaggi nel tempo (copertina con una clessidra). */
export const Book: React.FC<{ s?: number; open?: number }> = ({ s = 1, open = 0 }) => (
  <g transform={`scale(${s})`} strokeLinejoin="round">
    <path d="M-30 -30 H26 Q32 -30 32 -24 V30 H-24 Q-30 30 -30 24 Z" fill="#5A3A2C" stroke={INK} strokeWidth="3.5" />
    <path d="M-24 30 V-30" stroke={INK} strokeWidth="2.5" />
    <path d="M-18 -22 H24 M-18 22 H24" stroke="#C9A85A" strokeWidth="2" />
    <g transform="translate(4 0)" stroke="#C9A85A" strokeWidth="2.5" fill="none">
      <path d="M-9 -13 H9 M-9 13 H9 M-7 -13 Q-7 -2 0 0 Q7 -2 7 -13 M-7 13 Q-7 2 0 0 Q7 2 7 13" />
    </g>
    {open > 0 && <path d={`M32 -20 L${32 + open * 14} -16 V26 L32 30`} fill="#E8E0C8" stroke={INK} strokeWidth="2" />}
  </g>
);
/** Jim Cunningham: la videocassetta dei suoi corsi (un cuore sorridente sull'etichetta). */
export const Tape: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`} strokeLinejoin="round">
    <rect x="-36" y="-22" width="72" height="44" rx="4" fill="#25283A" stroke={INK} strokeWidth="3.5" />
    <rect x="-26" y="-16" width="52" height="16" rx="2" fill="#E8E0C8" />
    <path d="M-6 -11 q-4 -4 -6 0 q0 3 6 7 q6 -4 6 -7 q-2 -4 -6 0" fill={RED} />
    <circle cx="-14" cy="10" r="7" fill="none" stroke={INK} strokeWidth="2.5" />
    <circle cx="14" cy="10" r="7" fill="none" stroke={INK} strokeWidth="2.5" />
    <path d="M-7 10 H7" stroke={INK} strokeWidth="2" />
  </g>
);
/** Gretchen: una bicicletta. */
export const Bike: React.FC<{ s?: number; T?: number }> = ({ s = 1, T = 0 }) => (
  <g transform={`scale(${s})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
    {[-20, 20].map((x) => (
      <g key={x} transform={`translate(${x} 10)`}>
        <circle r="15" stroke={INK} strokeWidth="3.5" />
        {[0, 60, 120].map((a) => <path key={a} d="M-13 0 H13" stroke={DIM} strokeWidth="1.5" transform={`rotate(${a + T * 90})`} />)}
      </g>
    ))}
    <path d="M-20 10 L-6 -10 H14 L20 10 M-6 -10 L2 10 L14 -10 M-8 -16 H-2 M14 -10 L12 -20 H20" stroke="#E86A9A" strokeWidth="3.5" />
  </g>
);
/** Il motore d'aereo visto di tre quarti: la gondola, la presa d'aria con le pale che girano, l'ugello. */
export const Engine: React.FC<{ T: number; s?: number; spin?: number; glow?: number }> = ({ T, s = 1, spin = 1, glow = 0 }) => (
  <g transform={`scale(${s})`} strokeLinejoin="round">
    {glow > 0 && <Glow id="dd-eng" x={0} y={0} r={170} t={T} color={ENGINE} amp={0.1} rate={3} opacity={0.55 * glow} />}
    <path d="M-62 -40 H50 Q76 -30 82 0 Q76 30 50 40 H-62 Z" fill="#B4682A" stroke={DARK} strokeWidth="7" />
    <path d="M-62 -40 H50 Q76 -30 82 0 H-62 Z" fill={ENGINE} />
    <path d="M-50 -30 H44" stroke="#FFE0A8" strokeWidth="5" strokeLinecap="round" opacity=".8" />
    {[-30, 0, 30].map((x) => <path key={x} d={`M${x} -40 V40`} stroke={DARK} strokeWidth="2.5" opacity=".5" />)}
    <path d="M82 -14 L104 -9 V9 L82 14" fill="#5A4A3A" stroke={DARK} strokeWidth="5" />
    <ellipse cx="-62" cy="0" rx="20" ry="44" fill="#3A2E28" stroke={DARK} strokeWidth="7" />
    <ellipse cx="-62" cy="0" rx="20" ry="44" fill="none" stroke="#FFD08A" strokeWidth="2.5" opacity=".7" />
    <g transform="translate(-62 0) scale(.42 1)">
      {Array.from({ length: 10 }, (_, i) => (
        <path key={i} d="M0 0 L8 -38 L-6 -38 Z" fill="#8A8FA8" stroke={DARK} strokeWidth="2" transform={`rotate(${i * 36 + T * 360 * spin})`} />
      ))}
      <circle r="11" fill="#D8DCEA" stroke={DARK} strokeWidth="3" />
    </g>
  </g>
);
/** Un aereo di linea generico visto di lato (muso a destra). */
const Plane: React.FC<{ engine?: boolean; s?: number }> = ({ engine = true, s = 1 }) => (
  <g transform={`scale(${s})`} strokeLinejoin="round">
    <path d="M-130 -6 Q-120 -16 -80 -16 H100 Q130 -16 140 0 Q130 12 100 12 H-90 Q-120 12 -130 -6 Z" fill="#D8DCEA" stroke={DARK} strokeWidth="5" />
    <path d="M-120 -12 L-150 -54 H-128 L-88 -14 Z" fill="#B8BED4" stroke={DARK} strokeWidth="4" />
    <path d="M-10 2 L-60 50 H-36 L30 4 Z" fill="#B8BED4" stroke={DARK} strokeWidth="4" />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-70 + i * 14} y="-9" width="7" height="7" rx="2" fill="#2A2F5A" />)}
    <path d="M110 -10 Q122 -8 128 -2 H112 Z" fill="#2A2F5A" />
    {engine && <rect x="-46" y="22" width="40" height="16" rx="7" fill="#8A8FA8" stroke={DARK} strokeWidth="3" />}
    {!engine && <path d="M-44 26 l8 6 l6 -5 l8 6" stroke={DARK} strokeWidth="3" fill="none" />}
  </g>
);

// ---------------------------------------------------------------- elementi dello schema

const Node: React.FC<{ T: number; t0: number; p: P; name: string; sub?: string; ring?: number; r?: number; fade?: number; color?: string; side?: 'below' | 'above'; children?: React.ReactNode; size?: number; dead?: number; dx?: number; dy?: number }> = ({
  T, t0, p, name, sub, ring = 0, r = 62, fade = 1, color = INK, side = 'below', children, size: size0 = 38, dead = 0, dx = 0, dy = 0,
}) => {
  if (T < t0 || fade <= 0) return null;
  const size = fit(size0);
  const s = pop(T, t0);
  const ly = side === 'below' ? r + size + 6 : -r - (sub ? size * 0.95 + 18 : 18);
  const hi = color === INK ? TIME : color;
  return (
    <g transform={`translate(${p[0] + dx} ${p[1] + dy})`} opacity={seg(T, t0, t0 + 0.15) * fade}>
      <g transform={`scale(${s})`}>
        {ring > 0 && <Glow id={`dd-g${p[0]}${p[1]}`} x={0} y={0} r={r * 2.4} t={T} color={hi} amp={0.1} rate={2.4} opacity={0.5 * Math.min(1, ring)} />}
        <circle r={r} fill="#1C2040" stroke={ring > 0.5 ? hi : color} strokeWidth={ring > 0.5 ? 7 : 4.5} />
        <circle r={r - 8} fill="none" stroke={DIM} strokeWidth="1.5" opacity=".6" />
        <g transform={`scale(${r / 44})`} opacity={1 - 0.6 * dead}>{children}</g>
        {dead > 0 && <path d={`M${-r * 0.55} ${-r * 0.55} L${r * 0.55} ${r * 0.55} M${r * 0.55} ${-r * 0.55} L${-r * 0.55} ${r * 0.55}`} stroke={DIM} strokeWidth="7" strokeLinecap="round" opacity={dead} />}
      </g>
      {name && <text y={ly} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={size} fill={INK} stroke={DARK} strokeWidth="6" paintOrder="stroke" opacity={seg(T, t0 + 0.2, t0 + 0.5)}>{name}</text>}
      {sub && !WIDEV && <text y={ly + size * 0.85} textAnchor="middle" fontFamily={SANS} fontWeight={400} fontSize={size * 0.72} fill="#B4BAD8" stroke={DARK} strokeWidth="5" paintOrder="stroke" opacity={seg(T, t0 + 0.3, t0 + 0.6)}>{sub}</text>}
    </g>
  );
};

/** Linea dello schema che si disegna (maschera). `flow` fa scorrere il tratteggio. */
const Link: React.FC<{ T: number; t0: number; a: P; b: P; c?: P; color?: string; dashed?: boolean; label?: string; arrow?: boolean; w?: number; lx?: number; ly?: number; size?: number; fade?: number; flow?: boolean; dur?: number }> = ({
  T, t0, a, b, c, color = INK, dashed = false, label, arrow = false, w = 6, lx = 0, ly = 0, size: size0 = 44, fade = 1, flow = false, dur = 0.6,
}) => {
  const size = fit(size0);
  if (T < t0 || fade <= 0) return null;
  const p = eo(seg(T, t0, t0 + dur));
  const [mx, my] = c ?? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const d = `M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`;
  const ang = (Math.atan2(b[1] - my, b[0] - mx) * 180) / Math.PI;
  const id = `dd-m${a[0]}${a[1]}${b[0]}${b[1]}`;
  const tx = 0.25 * a[0] + 0.5 * mx + 0.25 * b[0], ty = 0.25 * a[1] + 0.5 * my + 0.25 * b[1];
  return (
    <g opacity={fade}>
      <mask id={id} maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="9000"><path d={d} fill="none" stroke="#fff" strokeWidth={w + 10} pathLength={1} strokeDasharray={`${p} 1`} /></mask>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray={dashed ? `${w * 3} ${w * 2.2}` : undefined} strokeDashoffset={flow ? -T * 60 : 0} strokeLinecap="round" mask={`url(#${id})`} />
      {arrow && p > 0.95 && <path d={`M${-w * 3.4} ${-w * 2.3} L0 0 L${-w * 3.4} ${w * 2.3}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${b[0]} ${b[1]}) rotate(${ang})`} />}
      {label && !WIDEV && (
        <text x={tx + lx} y={ty + ly} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={size} fill={color} stroke={DARK} strokeWidth="7" paintOrder="stroke" opacity={seg(T, t0 + 0.4, t0 + 0.8)}>{label}</text>
      )}
    </g>
  );
};

/** Cartellino pieno = colpo di scena o parola chiave. */
const Tag: React.FC<{ T: number; t0: number; x: number; y: number; text: string; bg?: string; fg?: string; size?: number; rot?: number; until?: number }> = ({
  T, t0, x, y, text, bg = TIME, fg = DARK, size: size0 = 36, rot = 0, until = 1e9,
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

// ---------------------------------------------------------------- disegni delle stazioni

const L = { fill: 'none', stroke: INK, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;
const rr = rng(1988);
const TOWN = Array.from({ length: 34 }, (_, i) => ({ x: 150 + i * 23 + rr() * 10, h: 14 + rr() * 30, lit: rr() > 0.4, ph: rr() * 6 }));

/** Il cielo notturno di una stazione, con stelle e (facoltativa) luna. */
const Sky: React.FC<{ T: number; y0: number; seed: number; moon?: boolean; dawn?: number }> = ({ T, y0, seed, moon, dawn = 0 }) => (
  <g>
    <rect x={X0} y={y0} width={X1 - X0} height={H} fill={`url(#dd-sky)`} />
    {dawn > 0 && <rect x={X0} y={y0} width={X1 - X0} height={H} fill="url(#dd-dawn)" opacity={dawn} />}
    <Stars t={T} seed={seed} n={26} x={X0 + 10} y={y0 + 60} w={X1 - X0 - 20} h={220} size={1.1} color="#DDE2F5" />
    {moon && (
      <g>
        <Glow id={`dd-moon${y0}`} x={880} y={y0 + 110} r={120} t={T} color="#DDE2F5" amp={0.05} rate={1.2} opacity={0.45} />
        <circle cx="880" cy={y0 + 110} r="30" fill="#E8EBF8" />
        <circle cx="868" cy={y0 + 102} r="30" fill="#252A52" opacity=".9" />
      </g>
    )}
  </g>
);

/** La casa dei Darko: villetta di periferia con la camera di Donnie (finestra in alto a destra); il motore nel tetto. */
export const ArtCasa: React.FC<{ T: number; engine: number; crash: number; ghost?: boolean; inBed?: number; sky?: boolean; golf?: boolean }> = ({ T, engine, crash, ghost, inBed = 0, sky = true, golf = true }) => {
  const y0 = BAND.casa.y0;
  const g = y0 + 430; // il prato
  const shake = crash > 0 && crash < 1 ? Math.sin(T * 70) * 6 * (1 - crash) : 0;
  // il motore cade dall'alto e si pianta nel tetto (engine 0..1 = la caduta)
  const ey = lerp(y0 - 260, ENG_HIT[1], eio(engine));
  const ex = lerp(ENG_HIT[0] - 120, ENG_HIT[0], eio(engine));
  return (
    <g>
      {sky && <Sky T={T} y0={y0} seed={7} moon />}
      {/* il campo da golf a sinistra: collinetta, bandierina, buca */}
      {golf && <g>
      <path d={`M${X0} ${g} Q${X0 + 60} ${g - 50} ${X0 + 150} ${g - 46} Q${X0 + 230} ${g - 40} ${X0 + 260} ${g} Z`} fill="#22304A" stroke={INK} strokeWidth="4" />
      <path d={`M${X0 + 150} ${g - 46} V${g - 150}`} {...L} strokeWidth="4" />
      <path d={`M${X0 + 150} ${g - 150} L${X0 + 200} ${g - 134} L${X0 + 150} ${g - 118} Z`} fill="#C9CEE6" stroke={INK} strokeWidth="3" transform={`skewY(${Math.sin(T * 2) * 4})`} style={{ transformOrigin: `${X0 + 150}px ${g - 134}px` }} />
      <ellipse cx={X0 + 172} cy={g - 42} rx="12" ry="4" fill={DARK} />
      </g>}
      {/* il prato */}
      <rect x={X0} y={g} width={X1 - X0} height={H - 430} fill="#1A2138" />
      <path d={`M${X0} ${g} H${X1}`} stroke={INK} strokeWidth="4" />
      {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${X0 + 10 + i * 28} ${g + 8 + (i % 3) * 18} l4 -10 l4 10`} stroke="#3A4870" strokeWidth="2.5" fill="none" />)}
      {/* l'albero a destra, con le foglie d'autunno che cadono */}
      <path d={`M915 ${g} Q909 ${g - 90} 919 ${g - 160} M917 ${g - 120} L885 ${g - 170} M919 ${g - 140} L953 ${g - 190}`} {...L} strokeWidth="9" stroke="#4A3A30" />
      <path d={`M915 ${g} Q909 ${g - 90} 919 ${g - 160}`} {...L} strokeWidth="3" />
      <ellipse cx="919" cy={g - 210} rx="70" ry="62" fill="#6A3A2E" stroke={INK} strokeWidth="4" />
      <ellipse cx="895" cy={g - 230} rx="36" ry="28" fill="#8A4A34" />
      <g transform={`translate(0 ${y0})`}><Flyers t={T} seed={88} n={5} color="#A65A3A" outline={DARK} w={16} h={22} y0={250} y1={520} speed={0.08} shape="leaf" /></g>
      {/* la casa */}
      <g transform={`translate(${shake} 0)`}>
        <rect x="430" y={y0 + 250} width="340" height="180" fill="url(#dd-house)" stroke={INK} strokeWidth="6" />
        <path d={`M410 ${y0 + 254} L600 ${y0 + 150} L790 ${y0 + 254} Z`} fill="#2A2F52" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
        {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${450 + i * 14} ${y0 + 244 - i * 8} L${750 - i * 14} ${y0 + 244 - i * 8}`} stroke="#3A4070" strokeWidth="2.5" />)}
        <rect x="684" y={y0 + 175} width="26" height="50" fill="#2A2F52" stroke={INK} strokeWidth="4" />
        <path d={`M440 ${y0 + 340} H760`} stroke="#3A4070" strokeWidth="3" />
        {/* finestre del piano terra e la porta */}
        {[470, 680].map((x) => (
          <g key={x}>
            <rect x={x} y={y0 + 360} width="54" height="44" fill="#E8C88A" opacity={0.35 + 0.05 * Math.sin(T * 2 + x)} />
            <rect x={x} y={y0 + 360} width="54" height="44" fill="none" stroke={INK} strokeWidth="4" />
            <path d={`M${x + 27} ${y0 + 360} V${y0 + 404}`} stroke={INK} strokeWidth="2.5" />
          </g>
        ))}
        <rect x="578" y={y0 + 350} width="46" height="80" fill="#3A2A2A" stroke={INK} strokeWidth="4" />
        <circle cx="614" cy={y0 + 392} r="3.5" fill={INK} />
        <path d={`M560 ${y0 + 350} H642`} stroke={INK} strokeWidth="5" />
        {/* finestra destra del primo piano */}
        <rect x="660" y={y0 + 270} width="70" height="52" fill="#1A1E38" stroke={INK} strokeWidth="4" />
        <path d={`M695 ${y0 + 270} V${y0 + 322}`} stroke={INK} strokeWidth="2.5" />
        {/* la camera di Donnie, vista dentro: il letto, il comodino con la sveglia digitale */}
        <rect x="446" y={y0 + 262} width="134" height="72" fill="#2A3060" stroke={INK} strokeWidth="5" />
        <Glow id="dd-room" x={513} y={y0 + 300} r={80} t={T} color="#9AA8F0" amp={0.06} rate={1.5} opacity={0.35} />
        <path d={`M456 ${y0 + 322} V${y0 + 300} H526 V${y0 + 322} Z`} fill="#4C58A0" stroke={INK} strokeWidth="3" />
        <rect x="458" y={y0 + 292} width="18" height="10" rx="4" fill="#C9CEE6" />
        <rect x="542" y={y0 + 306} width="26" height="16" fill="#1A1E38" stroke={INK} strokeWidth="2.5" />
        <rect x="545" y={y0 + 309} width="20" height="7" fill={RED} opacity={0.6 + 0.4 * Math.sin(T * Math.PI * 2)} />
        {inBed > 0 && <path d={`M476 ${y0 + 300} Q498 ${y0 + 288} 520 ${y0 + 300}`} fill="#6A78C8" stroke={INK} strokeWidth="2.5" opacity={inBed} />}
        {/* la cassetta delle lettere e la zucca */}
        <path d={`M400 ${g} V${g - 46}`} {...L} strokeWidth="5" />
        <path d={`M384 ${g - 46} V${g - 66} Q400 ${g - 80} 416 ${g - 66} V${g - 46} Z`} fill="#3A4070" stroke={INK} strokeWidth="4" />
        <path d={`M416 ${g - 66} V${g - 80} H424`} stroke={RED} strokeWidth="3" fill="none" />
        <g transform={`translate(540 ${g - 12})`}>
          <ellipse rx="22" ry="16" fill="#9A5A2E" stroke={INK} strokeWidth="3.5" />
          <path d="M-8 -16 Q0 4 8 -16 M0 -16 V-24" stroke={INK} strokeWidth="2.5" fill="none" />
          <path d="M-10 -2 l4 -5 l4 5 Z M2 -2 l4 -5 l4 5 Z M-9 6 Q0 11 9 6" fill="#FFC86A" opacity={0.6 + 0.3 * Math.sin(T * 5)} />
        </g>
      </g>
      {/* il motore: cade, sfonda il tetto, fuma */}
      {engine > 0 && !ghost && (
        <g>
          {engine >= 1 && (
            <>
              <path d={`M560 ${y0 + 200} l-20 -16 l-18 10 l-22 -14 l-30 18 l-10 34`} fill={DARK} stroke={INK} strokeWidth="3" />
              <Smoke id="dd-eng-smoke" t={T} x={470} y={y0 + 190} color="#8A90B0" n={8} rise={240} wind={-160} r0={18} r1={70} speed={0.25} opacity={0.75} />
              {Array.from({ length: 8 }, (_, i) => {
                const k = seg(crash, 0, 1);
                const a = -Math.PI * (0.15 + 0.7 * (i / 7));
                return <rect key={i} x={520 - Math.cos(a) * 140 * k} y={y0 + 210 + Math.sin(a) * 120 * k + 260 * k * k} width="10" height="7" fill="#3A4070" stroke={INK} strokeWidth="1.5" opacity={1 - k} transform={`rotate(${i * 40 + k * 200} ${520 - Math.cos(a) * 140 * k} ${y0 + 210})`} />;
              })}
            </>
          )}
          {engine < 1 && <path d={`M${ex - 40} ${ey - 120} L${ex} ${ey}`} stroke={ENGINE} strokeWidth="10" opacity=".35" strokeLinecap="round" />}
          <g transform={`translate(${ex} ${ey}) scale(-1 1) rotate(${lerp(-60, -35, eio(engine))})`}>
            <Engine T={T} s={0.95} spin={engine < 1 ? 1.5 : 0.25 * (1 - seg(crash, 0, 1)) + 0.02} glow={engine >= 1 ? 0.6 : 1} />
          </g>
          {engine >= 1 && (
            // il bordo del tetto sfondato davanti al muso del motore: il motore è dentro la casa
            <g transform={`translate(${shake} 0)`}>
              <path d={`M588 ${y0 + 157} L550 ${y0 + 177} L536 ${y0 + 198} L552 ${y0 + 212} L528 ${y0 + 230} L548 ${y0 + 254} H588 Z`} fill="#2A2F52" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
              <path d={`M578 ${y0 + 180} H554 M580 ${y0 + 204} H560 M582 ${y0 + 228} H550`} stroke="#3A4070" strokeWidth="2.5" />
              <path d={`M550 ${y0 + 177} L536 ${y0 + 198} L552 ${y0 + 212} L528 ${y0 + 230}`} fill="none" stroke={DARK} strokeWidth="9" opacity=".5" transform="translate(-6 2)" />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

/** La casa di Nonna Morte: casa di legno storta con il portico, la cassetta delle lettere, la strada e il lampione. */
const ArtNonna: React.FC<{ T: number; car: number; lights: number }> = ({ T, car, lights }) => {
  const y0 = BAND.nonna.y0;
  const g = y0 + 400; // il marciapiede; la strada sotto
  const cx = lerp(1150, 700, eio(car));
  return (
    <g>
      <Sky T={T} y0={y0} seed={21} />
      {/* l'albero spoglio a sinistra */}
      <path d={`M170 ${g} Q160 ${g - 120} 176 ${g - 200} M172 ${g - 150} L136 ${g - 210} M176 ${g - 180} L214 ${g - 250} M176 ${g - 200} L170 ${g - 270}`} {...L} strokeWidth="7" stroke="#4A4560" />
      {/* la casa storta */}
      <g transform={`rotate(-2 360 ${g})`}>
        <rect x="230" y={y0 + 190} width="260" height="210" fill="url(#dd-old)" stroke={INK} strokeWidth="6" />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M234 ${y0 + 212 + i * 22} H486`} stroke="#4A4048" strokeWidth="2.5" />)}
        <path d={`M214 ${y0 + 196} L360 ${y0 + 92} L506 ${y0 + 196} Z`} fill="#2C2638" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
        <path d={`M440 ${y0 + 140} V${y0 + 102} H462 V${y0 + 156}`} fill="#2C2638" stroke={INK} strokeWidth="4" />
        <rect x="262" y={y0 + 226} width="58" height="50" fill="#E8C88A" opacity={0.28 + 0.1 * Math.sin(T * 1.3)} />
        <rect x="262" y={y0 + 226} width="58" height="50" fill="none" stroke={INK} strokeWidth="4" />
        <path d={`M262 ${y0 + 251} H320 M291 ${y0 + 226} V${y0 + 276}`} stroke={INK} strokeWidth="2.5" />
        <rect x="400" y={y0 + 226} width="58" height="50" fill="#14162C" stroke={INK} strokeWidth="4" />
        <path d={`M404 ${y0 + 230} L454 ${y0 + 272}`} stroke={DIM} strokeWidth="2" />
        {/* il portico con la porta e i gradini */}
        <path d={`M220 ${y0 + 318} H500`} stroke={INK} strokeWidth="6" />
        {[240, 330, 420, 490].map((x) => <path key={x} d={`M${x} ${y0 + 318} V${g}`} stroke={INK} strokeWidth="5" />)}
        <rect x="336" y={y0 + 330} width="44" height="70" fill="#2A2228" stroke={INK} strokeWidth="4" />
        {[0, 1, 2].map((i) => <path key={i} d={`M${330 - i * 8} ${g + i * 10} H${386 + i * 8}`} stroke={INK} strokeWidth="4" />)}
      </g>
      {/* il marciapiede, la cassetta delle lettere sul ciglio, il lampione */}
      <rect x={X0} y={g} width={X1 - X0} height="22" fill="#2A2E48" />
      <path d={`M${X0} ${g} H${X1}`} stroke={INK} strokeWidth="4" />
      <path d={`M600 ${g} V${g - 64}`} {...L} strokeWidth="5" />
      <path d={`M582 ${g - 64} V${g - 88} Q600 ${g - 104} 618 ${g - 88} V${g - 64} Z`} fill="#4A4560" stroke={INK} strokeWidth="4" />
      <path d={`M618 ${g - 88} V${g - 104} H628`} stroke={RED} strokeWidth="3" fill="none" />
      <path d={`M860 ${g} V${g - 240} Q860 ${g - 262} 836 ${g - 262}`} {...L} strokeWidth="6" />
      <path d={`M822 ${g - 266} H850 L846 ${g - 254} H826 Z`} fill="#2A2E48" stroke={INK} strokeWidth="3" />
      <Glow id="dd-lamp" x={836} y={g - 250} r={150} t={T} color="#E8D49A" amp={0.08} rate={3} opacity={0.5} />
      <path d={`M826 ${g - 254} L780 ${g + 60} H900 L846 ${g - 254} Z`} fill="url(#dd-beam)" opacity=".5" />
      {/* la strada */}
      <rect x={X0} y={g + 22} width={X1 - X0} height={H - 422} fill="#16192C" />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${X0 + 20 + i * 100} ${g + 62} h50`} stroke="#C9CEE6" strokeWidth="5" opacity=".55" />)}
      {/* l'auto che arriva da destra con i fari accesi */}
      {car > 0 && (
        <g transform={`translate(${cx} ${g + 74})`}>
          <path d="M-60 -6 L-460 -40 V44 L-60 22 Z" fill="url(#dd-head)" opacity={0.75 * lights} />
          <path d="M-70 -18 H70 Q84 -18 86 -4 V14 H-86 V-4 Q-84 -18 -70 -18 Z" fill="#3A3448" stroke={INK} strokeWidth="5" />
          <path d="M-46 -18 L-30 -40 H34 L50 -18 Z" fill="#2A2638" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path d="M-24 -36 H-4 V-20 H-38 Z M4 -36 H28 L40 -20 H4 Z" fill="#5A6090" opacity=".7" />
          {[-50, 50].map((x) => <circle key={x} cx={x} cy="16" r="13" fill="#14162C" stroke={INK} strokeWidth="4" />)}
          <rect x="-90" y="-10" width="10" height="12" rx="3" fill="#FFF2C8" />
          <Glow id="dd-carl" x={-86} y={-4} r={60} t={T} color="#FFF2C8" amp={0.05} rate={9} opacity={0.8 * lights} />
        </g>
      )}
    </g>
  );
};

/** Il paese: a sinistra la scuola (allagata), a destra la casa di Cunningham (incendiata). */
const ArtPaese: React.FC<{ T: number; flood: number; fire: number }> = ({ T, flood, fire }) => {
  const y0 = BAND.paese.y0;
  const g = y0 + 420;
  return (
    <g>
      <Sky T={T} y0={y0} seed={33} />
      {/* la scuola: facciata di mattoni, orologio, finestre, pennone */}
      <rect x="160" y={y0 + 200} width="360" height="220" fill="url(#dd-brick)" stroke={INK} strokeWidth="6" />
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M164 ${y0 + 220 + i * 20} H516`} stroke="#4A2E2E" strokeWidth="2" />)}
      <path d={`M150 ${y0 + 200} H530 V${y0 + 182} H150 Z`} fill="#3A2A30" stroke={INK} strokeWidth="5" />
      <path d={`M300 ${y0 + 182} L340 ${y0 + 146} L380 ${y0 + 182}`} fill="#3A2A30" stroke={INK} strokeWidth="5" />
      <circle cx="340" cy={y0 + 168} r="13" fill="#E8E0C8" stroke={INK} strokeWidth="3" />
      <path d={`M340 ${y0 + 168} V${y0 + 159} M340 ${y0 + 168} L${340 + 7 * Math.cos(T)} ${y0 + 168 + 7 * Math.sin(T)}`} stroke={DARK} strokeWidth="2.5" />
      {[0, 1].map((row) => [0, 1, 2, 3, 4].map((k) => (k === 2 && row === 1 ? null : (
        <rect key={`${row}${k}`} x={185 + k * 66} y={y0 + 222 + row * 88} width="44" height="52" fill="#2A3060" stroke={INK} strokeWidth="3.5" opacity=".95" />
      ))))}
      <rect x="318" y={y0 + 330} width="44" height="90" fill="#2A2228" stroke={INK} strokeWidth="4" />
      <path d={`M120 ${g} V${y0 + 120}`} {...L} strokeWidth="4" />
      <path d={`M120 ${y0 + 124} h44 v28 h-44`} fill="#4A5080" stroke={INK} strokeWidth="2.5" transform={`skewY(${Math.sin(T * 2.5) * 5})`} style={{ transformOrigin: `120px ${y0 + 138}px` }} />
      {/* il tubo rotto che spruzza e l'acqua che sale davanti alla scuola */}
      {flood > 0 && (
        <g>
          <clipPath id="dd-flood"><rect x={X0} y={y0} width="440" height={H} /></clipPath>
          <g clipPath="url(#dd-flood)">
            <WaveBand t={T} y={lerp(g + 40, g - 70, eo(flood))} fill="#3A6AB0" foam="#BFD6FF" amp={8} w={140} speed={50} bob={4} />
          </g>
          {Array.from({ length: 10 }, (_, i) => {
            const u = mod(T * 1.4 + i / 10, 1);
            return <circle key={i} cx={410 + u * 60 * Math.cos(-1 - i * 0.12)} cy={g - 40 - u * 90 + u * u * 120} r={3 + (i % 3)} fill="#BFD6FF" opacity={(1 - u) * Math.min(1, flood * 2)} />;
          })}
          <path d={`M404 ${g - 30} h22`} stroke={INK} strokeWidth="9" strokeLinecap="round" />
        </g>
      )}
      {/* la casa di Cunningham: villa con le colonne, il prato curato */}
      <rect x="610" y={y0 + 230} width="290" height="190" fill="url(#dd-villa)" stroke={INK} strokeWidth="6" />
      <path d={`M590 ${y0 + 234} L755 ${y0 + 140} L920 ${y0 + 234} Z`} fill="#2E3050" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      {[650, 700, 810, 860].map((x) => <path key={x} d={`M${x} ${y0 + 260} V${g}`} stroke="#C9CEE6" strokeWidth="9" />)}
      <path d={`M620 ${y0 + 256} H890`} stroke={INK} strokeWidth="5" />
      <rect x="735" y={y0 + 340} width="40" height="80" fill="#2A2228" stroke={INK} strokeWidth="4" />
      {[[655, 296], [805, 296]].map(([x, y]) => <rect key={x} x={x} y={y0 + y - 2} width="46" height="40" fill={fire > 0 ? '#FFB25C' : '#E8C88A'} opacity={fire > 0 ? 0.8 : 0.3} stroke={INK} strokeWidth="3.5" />)}
      {fire > 0 && (
        <g opacity={eo(Math.min(1, fire * 1.5))}>
          <Fire id="dd-fire1" t={T} x={700} y={y0 + 210} scale={0.75 * eo(fire)} outline={DARK} />
          <Fire id="dd-fire2" t={T + 1.3} x={820} y={y0 + 200} scale={0.85 * eo(fire)} outline={DARK} />
          <Embers t={T} x={760} y={y0 + 200} w={240} h={260} n={20} />
          <Smoke id="dd-fsmoke" t={T} x={760} y={y0 + 100} color="#5A5468" n={7} rise={180} wind={-120} r0={24} r1={80} speed={0.3} opacity={0.7} />
        </g>
      )}
      {/* la strada davanti */}
      <rect x={X0} y={g} width={X1 - X0} height={H - 420} fill="#1A2138" />
      <path d={`M${X0} ${g} H${X1}`} stroke={INK} strokeWidth="4" />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${X0 + 40 + i * 110} ${g + 52} h56`} stroke="#C9CEE6" strokeWidth="5" opacity=".45" />)}
    </g>
  );
};

/** La collina all'alba: le luci del paese sotto, il vortice di nuvole nel cielo, l'aereo che ci passa dentro. */
export const ArtCollina: React.FC<{ T: number; vortex: number; plane: number; tear: number }> = ({ T, vortex, plane, tear }) => {
  const y0 = BAND.collina.y0;
  const vx = 560, vy = y0 + 180;
  const px = lerp(X0 - 220, X1 + 220, plane), py = y0 + 150 + Math.sin(plane * 3) * 10;
  return (
    <g>
      <Sky T={T} y0={y0} seed={45} dawn={1} />
      {/* il vortice: spirali di nuvole che girano, più veloci al centro */}
      {vortex > 0 && (
        <g opacity={Math.min(1, vortex * 1.4)}>
          <Glow id="dd-vort" x={vx} y={vy} r={260 * vortex} t={T} color="#B8A8F0" amp={0.12} rate={3} opacity={0.5} />
          {Array.from({ length: 7 }, (_, i) => {
            const rad = (40 + i * 30) * (0.4 + 0.6 * vortex);
            const rot = T * (120 - i * 12) + i * 47;
            return (
              <g key={i} transform={`translate(${vx} ${vy}) rotate(${rot}) scale(1 .52)`}>
                <path d={`M${rad} 0 A${rad} ${rad} 0 0 1 ${-rad * 0.7} ${rad * 0.7}`} fill="none" stroke={i % 2 ? '#8A7AC8' : '#C8BCF2'} strokeWidth={18 - i * 1.6} strokeLinecap="round" opacity={0.85 - i * 0.07} />
                <path d={`M${-rad} 0 A${rad} ${rad} 0 0 1 ${rad * 0.7} ${-rad * 0.7}`} fill="none" stroke="#6A5AA8" strokeWidth={12 - i} strokeLinecap="round" opacity={0.7 - i * 0.06} />
              </g>
            );
          })}
          <ellipse cx={vx} cy={vy} rx={26 * vortex} ry={14 * vortex} fill="#F4F0FF" opacity={0.6 + 0.3 * Math.sin(T * 6)} />
        </g>
      )}
      {/* l'aereo attraversa il vortice */}
      {plane > 0 && plane < 1 && (
        <g transform={`translate(${px} ${py}) rotate(${Math.sin(T * 7) * 3 * tear}) scale(1.1)`}>
          <Plane engine={tear <= 0} />
        </g>
      )}
      {/* il motore strappato via, che gira e sparisce nel vortice */}
      {tear > 0 && tear < 1 && (() => {
        const sx = lerp(px - 20, vx, eio(tear)), sy = lerp(py + 26, vy, eio(tear));
        return (
          <g transform={`translate(${sx} ${sy}) rotate(${tear * 540}) scale(${0.8 * (1 - 0.6 * tear)})`} opacity={1 - seg(tear, 0.75, 1)}>
            <Engine T={T} s={1} glow={1} />
          </g>
        );
      })()}
      {/* le luci del paese all'orizzonte */}
      <path d={`M${X0} ${y0 + 400} H${X1}`} stroke="#4A4070" strokeWidth="3" />
      {TOWN.map((h, i) => (
        <g key={i}>
          <rect x={h.x} y={y0 + 400 - h.h} width="18" height={h.h} fill="#1E1C38" />
          {h.lit && <rect x={h.x + 6} y={y0 + 404 - h.h} width="5" height="5" fill="#F2D08A" opacity={0.5 + 0.4 * Math.sin(T * 1.5 + h.ph)} />}
        </g>
      ))}
      {/* il crinale della collina in primo piano, con l'erba */}
      <path d={`M${X0} ${y0 + 440} Q320 ${y0 + 380} 520 ${y0 + 420} Q760 ${y0 + 460} ${X1} ${y0 + 400} V${y0 + H} H${X0} Z`} fill="#141830" stroke={INK} strokeWidth="5" />
      {Array.from({ length: 26 }, (_, i) => <path key={i} d={`M${X0 + 14 + i * 32} ${y0 + 470 + (i % 4) * 9} q4 -16 ${4 + Math.sin(T * 2 + i) * 4} -24`} stroke="#3A4870" strokeWidth="3" fill="none" />)}
    </g>
  );
};

// ---------------------------------------------------------------- lo schema

const r = rng(2001);
const MOTES = Array.from({ length: 22 }, () => ({ x: r() * 1080, y: r() * 1920, s: 1.5 + r() * 3, v: 4 + r() * 10, ph: r() * 6 }));

const Schema: React.FC<{ T: number }> = ({ T }) => {
  const focus = (t0: number, t1: number) => seg(T, t0, t0 + 0.3) * (1 - seg(T, t1, t1 + 0.4));
  const off = (ch: string) => 1 - seg(T, end(ch) - 0.4, end(ch) + 0.3);
  // il riavvolgimento finale: la copia si spegne, il mondo vero resta
  const rewind = eio(seg(T, at('letto', 0, 0.2), at('letto', 0, 1.8)));
  const copyOn = 1 - rewind;
  const bandAt: Record<BandKey, number> = { casa: at('coniglio', 0), nonna: at('libro', 1, 0.3), paese: at('danni', 0, 0.3), collina: at('vortice', 0, 0.4) };
  const bandP = (k: BandKey) => (k === 'casa' ? 1 : eo(seg(T, bandAt[k], bandAt[k] + 0.7)) * copyOn);

  // il motore: cade nel capitolo 2; sparisce col riavvolgimento; ricade nel capitolo finale
  const fall1 = at('motore', 0, 0.2);
  const fall2 = at('letto', 1, 0.3);
  const e1 = seg(T, fall1, fall1 + 0.5);
  const e2 = seg(T, fall2, fall2 + 0.5);
  const engineVis = T < at('letto', 0, 0.6) ? e1 : T < fall2 ? 0 : e2;
  const crash = T >= fall2 ? seg(T, fall2 + 0.5, fall2 + 1.7) : seg(T, fall1 + 0.5, fall1 + 1.7);
  const engineOut = seg(T, at('letto', 0, 0.2), at('letto', 0, 0.6)); // il motore risucchiato via nel riavvolgimento
  const flood = eo(seg(T, at('danni', 1, 0.1), at('danni', 1, 1.4)));
  const fire = eo(seg(T, at('danni', 1, 1.6), at('danni', 1, 2.6)));
  const car = seg(T, at('gretchen', 2, 0.1), at('gretchen', 2, 1.0)) * (T < at('letto', 0, 1) ? 1 : 0);
  const lights = 1 - 0.5 * seg(T, at('gretchen', 3, 1.5), at('gretchen', 3, 2.5));
  const vortex = eo(seg(T, at('vortice', 0, 0.3), at('vortice', 0, 2.4))) * (1 - seg(T, at('letto', 0, 0.2), at('letto', 0, 1.2)));
  const plane = seg(T, at('vortice', 1, -0.6), at('vortice', 2, 3.0));
  const tear = seg(T, at('vortice', 2, 0.5), at('vortice', 3, 0.6));
  const shot = at('guida', 0, 1.0);
  const flash = flashAt(T, [shot]);

  return (
    <g>
      {/* ---- la linea del MONDO VERO, a sinistra: va avanti dritta */}
      {(() => {
        const p = T < at('tangente', 0) ? 0.22 : eo(seg(T, at('tangente', 0, 0.1), at('tangente', 0, 1.4))) * 0.78 + 0.22;
        const danger = focus(at('tangente', 3, 0.3), end('tangente'));
        const saved = eo(seg(T, at('letto', 2, 0.2), at('letto', 2, 1.2)));
        const col = danger > 0.3 ? RED : saved > 0.5 ? TIME : INK;
        const y1 = 330 + (3080 - 330) * p;
        return (
          <g>
            {saved > 0 && <path d={`M${MX} 330 V3080`} stroke={TIME} strokeWidth="26" opacity={0.18 * saved} strokeLinecap="round" />}
            <path d={`M${MX} 330 V${y1}`} stroke={col} strokeWidth="9" strokeLinecap="round" strokeDasharray={danger > 0.3 ? `${30 + Math.sin(T * 20) * 10} 14` : undefined} />
            <path d={`M${MX - 20} ${y1 - 30} L${MX} ${y1 + 4} L${MX + 20} ${y1 - 30}`} fill="none" stroke={col} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            {T >= at('tangente', 0) && (
              <text transform={`translate(${MX - 22} 1250) rotate(-90)`} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={fit(40)} letterSpacing="6" fill={col} stroke={DARK} strokeWidth="8" paintOrder="stroke" opacity={eo(seg(T, at('tangente', 0, 0.5), at('tangente', 0, 1.1)))}>IL MONDO VERO ▼</text>
            )}
            <Ring T={T} x={MX} y={1400} r={150} on={danger * 1.2} />
          </g>
        );
      })()}

      {/* ---- LA COPIA: la deviazione che si stacca dalla casa e la bolla tratteggiata */}
      {T >= at('tangente', 1) && copyOn > 0 && (() => {
        const p = eo(seg(T, at('tangente', 1, 0), at('tangente', 1, 1.6)));
        const crack = focus(at('tangente', 3, 0.3), end('tangente'));
        const wob = crack * Math.sin(T * 30) * 6;
        const d = `M${BUB.x0 + 60} ${BUB.y0} H${BUB.x1 - 60} Q${BUB.x1} ${BUB.y0} ${BUB.x1} ${BUB.y0 + 60} V${BUB.y1 - 60} Q${BUB.x1} ${BUB.y1} ${BUB.x1 - 60} ${BUB.y1} H${BUB.x0 + 60} Q${BUB.x0} ${BUB.y1} ${BUB.x0} ${BUB.y1 - 60} V${BUB.y0 + 60} Q${BUB.x0} ${BUB.y0} ${BUB.x0 + 60} ${BUB.y0} Z`;
        return (
          <g opacity={copyOn} transform={`translate(${wob} 0)`}>
            <mask id="dd-bub" maskUnits="userSpaceOnUse" x="-200" y="0" width="1500" height="3400"><path d={d} fill="none" stroke="#fff" strokeWidth="30" pathLength={1} strokeDasharray={`${p} 1`} /></mask>
            <path d={d} fill={COPY} opacity={0.05 * p} />
            <path d={d} fill="none" stroke={crack > 0.3 ? RED : COPY} strokeWidth="8" strokeDasharray="30 18" strokeDashoffset={-T * 30} mask="url(#dd-bub)" />
            {/* la deviazione: dal mondo vero alla copia, come un'uscita della strada */}
            <path d={`M${MX} 900 C${MX} 980 ${MX + 40} 1000 ${BUB.x0 + 60} ${BUB.y0}`} fill="none" stroke={COPY} strokeWidth="9" strokeDasharray="30 18" strokeDashoffset={-T * 30} opacity={p} />
            {!WIDEV && <text x={MX + 80} y={950} fontFamily={HAND} fontWeight={700} fontSize={fit(46)} fill={COPY} stroke={DARK} strokeWidth="7" paintOrder="stroke" opacity={seg(T, at('tangente', 1, 0.6), at('tangente', 1, 1.0))}>una deviazione</text>}
            <g opacity={seg(T, at('tangente', 1, 0.4), at('tangente', 1, 0.9))}>
              <rect x={BUB.x1 - 560} y={BUB.y0 - 31} width="560" height="62" rx="14" fill={DARK} />
              <text x={BUB.x1 - 280} y={BUB.y0 + 13} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="34" letterSpacing="3" fill={COPY}>LA COPIA · UNIVERSO TANGENTE</text>
            </g>
            {/* le crepe rosse quando la copia crolla */}
            {crack > 0 && [[300, 1500], [820, 2050], [420, 2620], [900, 1300]].map(([x, y], i) => (
              <path key={i} d={`M${x} ${y} l40 50 l-26 40 l50 60 M${x + 40} ${y + 50} l60 -20`} fill="none" stroke={RED} strokeWidth="7" strokeLinecap="round" opacity={crack} />
            ))}
          </g>
        );
      })()}
      {/* il fantasma della copia dopo il riavvolgimento: resta appena accennato */}
      {rewind > 0 && <rect x={BUB.x0} y={BUB.y0} width={BUB.x1 - BUB.x0} height={BUB.y1 - BUB.y0} rx="60" fill="none" stroke={DIM} strokeWidth="4" strokeDasharray="14 18" opacity={0.35 * rewind} />}

      {/* ---- le stazioni: prima tratteggiate e appena accennate, poi disegnate */}
      {BANDS.map((b) => {
        const p = bandP(b.key);
        const art = (k: BandKey, ghost = false) => (
          <>
            {k === 'casa' && <ArtCasa T={T} engine={ghost ? 0 : engineVis * (1 - (T < fall2 ? engineOut : 0))} crash={crash} inBed={seg(T, at('letto', 0, 1.6), at('letto', 1, 0))} />}
            {k === 'nonna' && <ArtNonna T={T} car={car} lights={lights} />}
            {k === 'paese' && <ArtPaese T={T} flood={T < at('letto', 0, 0.2) ? flood : flood * copyOn} fire={fire * copyOn} />}
            {k === 'collina' && <ArtCollina T={T} vortex={vortex} plane={plane} tear={tear} />}
          </>
        );
        return (
          <g key={b.key}>
            <rect x={X0} y={b.y0} width={X1 - X0} height={H} rx="10" fill="none" stroke={DIM} strokeWidth="4" strokeDasharray="18 14" opacity={0.6 * (1 - p)} />
            {p < 1 && <g opacity={0.16 * (1 - p)}>{art(b.key, true)}</g>}
            {p > 0 && (
              <g opacity={p}>
                <clipPath id={`dd-c${b.key}`}><rect x={X0} y={b.y0} width={X1 - X0} height={H} rx="10" /></clipPath>
                <rect x={X0} y={b.y0} width={X1 - X0} height={H} rx="10" fill={PAPER} />
                <g clipPath={`url(#dd-c${b.key})`}>{art(b.key)}</g>
                <rect x={X0} y={b.y0} width={X1 - X0} height={H} rx="10" fill="none" stroke={b.key === 'casa' ? INK : COPY} strokeWidth="5" />
                <rect x={X0 + 6} y={b.y0 + 6} width={b.name.length * 18.5 + 30} height="44" rx="6" fill={DARK} opacity=".85" />
                <text x={X0 + 20} y={b.y0 + 38} fontFamily={SANS} fontWeight={900} fontSize="27" letterSpacing="3" fill={b.key === 'casa' ? TIME : COPY}>{b.name}</text>
              </g>
            )}
          </g>
        );
      })}
      {/* la casa sta sulla linea del mondo vero: il ramo che la collega */}
      <path d={`M${MX} ${cy('casa')} H${X0}`} stroke={INK} strokeWidth="6" strokeDasharray="10 10" opacity={T >= at('tangente', 0) ? 0.8 : 0.3} />

      {/* ---- capitolo 1: Donnie, Frank, i 28 giorni, il campo da golf */}
      {(() => {
        const toBed = eio(seg(T, at('letto', 0, 1.6), at('letto', 1, 0)));
        const p: P = [lerp(N.donnie[0], N.bed[0], toBed), lerp(N.donnie[1], N.bed[1] - 40, toBed)];
        const killed = seg(T, at('letto', 1, 1.0), at('letto', 1, 1.6));
        const ringD = focus(at('coniglio', 0), at('coniglio', 1)) + focus(at('ricevitore', 2), end('ricevitore')) + focus(at('letto', 1, 0), at('letto', 2));
        return (
          <Node T={T} t0={at('coniglio', 0, 0.1)} p={p} name="Donnie" sub={T < end('coniglio') ? 'sonnambulo' : undefined} ring={ringD} r={62 - 16 * toBed} dead={killed}><Slippers /></Node>
        );
      })()}
      <Node T={T} t0={at('coniglio', 1, 0.1)} p={N.frank} name="Frank" sub={T < end('coniglio') ? 'lo vede solo Donnie' : undefined} ring={focus(at('coniglio', 1), at('coniglio', 2, 0.5)) + focus(at('guida', 2, 1.0), end('guida')) * 1.2} color={T > at('guida', 2, 1.0) && T < end('guida') + 0.3 ? TIME : INK} fade={1 - seg(T, at('letto', 0, 0.3), at('letto', 0, 1.2))}><Ears /></Node>
      <Link T={T} t0={at('coniglio', 1, 0.4)} a={[742, 540]} b={[352, 560]} c={[560, 470]} label="lo chiama fuori" ly={-30} size={40} dashed fade={off('coniglio')} />
      <Tag T={T} t0={at('coniglio', 2, 0.2)} x={560} y={378} text="LA FINE FRA 28 GIORNI" bg={RED} fg={INK} size={36} rot={-3} until={end('coniglio') - 0.3} />
      <Link T={T} t0={at('coniglio', 3, 0.2)} a={[240, 610]} b={[X0 + 165, BAND.casa.y0 + 300]} c={[180, 680]} label="dorme fuori" lx={150} ly={70} size={38} arrow dashed w={5} fade={off('coniglio')} />

      {/* ---- capitolo 2: il motore cade; il letto vuoto; nessun aereo l'ha perso */}
      <Link T={T} t0={at('motore', 1, 0.2)} a={[640, 790]} b={[530, 712]} c={[620, 730]} label="il suo letto" lx={60} ly={50} size={38} arrow w={5} color={RED} fade={off('motore')} />
      <Tag T={T} t0={at('motore', 2, 0.1)} x={560} y={378} text="NESSUN AEREO L'HA PERSO" size={36} rot={-2} until={end('motore') - 0.3} />
      {(() => {
        const on = focus(at('motore', 3, 0), end('motore') - 0.2) + focus(at('ricevitore', 0, 0.2), at('ricevitore', 1, 0.2));
        return (
          <g>
            <Ring T={T} x={ENG_HIT[0]} y={ENG_HIT[1] - 10} r={110} on={on} />
            {on > 0 && T < end('motore') + 0.4 && <text x={ENG_HIT[0] + 60} y={ENG_HIT[1] - 90} fontFamily={SANS} fontWeight={900} fontSize={fit(96)} fill={RED} stroke={DARK} strokeWidth="8" paintOrder="stroke" opacity={Math.min(1, on)} transform={`rotate(${Math.sin(T * 3) * 4} ${ENG_HIT[0] + 80} ${ENG_HIT[1] - 120})`}>?</text>}
          </g>
        );
      })()}

      {/* ---- capitolo 3: il libro di Nonna Morte */}
      <Link T={T} t0={at('libro', 0, 0.3)} a={[800, 590]} b={[360, 590]} c={[580, 680]} label="viaggi nel tempo?" ly={44} size={40} dashed color={TIME} fade={off('libro')} />
      <Tag T={T} t0={at('libro', 1, 0.2)} x={560} y={BAND.nonna.y0 - 40} text="IL PROF DI SCIENZE" bg={INK} size={30} until={at('libro', 3, 0.2)} />
      <Node T={T} t0={at('libro', 2, 0.1)} p={N.nonna} name="Nonna Morte" sub={T < end('libro') ? 'ex insegnante' : undefined} ring={focus(at('libro', 2), end('libro')) + focus(at('tangente', 0), at('tangente', 1)) + focus(at('guida', 1), at('guida', 2)) * 1.2} fade={1 - 0.5 * rewind}><Book open={seg(T, at('libro', 3), at('libro', 3, 0.5))} /></Node>
      <Link T={T} t0={at('libro', 2, 0.5)} a={[300, 1170]} b={[300, 640]} c={[220, 900]} label="il libro" lx={-10} size={38} arrow w={5} color={TIME} fade={off('libro')} />
      <Tag T={T} t0={at('libro', 3, 0.2)} x={620} y={BAND.nonna.y0 + 150} text="LA SPIEGAZIONE" size={40} rot={-3} until={end('libro') - 0.2} />

      {/* ---- capitolo 4: il tempo si sdoppia (vedi la linea del mondo vero e la bolla qui sopra) */}
      <Tag T={T} t0={at('tangente', 2, 0.1)} x={560} y={BUB.y0 + 40} text="DURA SOLO 28 GIORNI" bg={COPY} size={40} rot={-2} until={end('tangente') - 0.3} />
      <Tag T={T} t0={at('tangente', 3, 0.3)} x={560} y={1560} text="POI CROLLA" bg={RED} fg={INK} size={52} rot={3} until={end('tangente') - 0.2} />

      {/* ---- capitolo 5: l'oggetto in più va rimandato nel mondo vero; il ricevitore */}
      <Tag T={T} t0={at('ricevitore', 0, 0.3)} x={560} y={378} text="UN OGGETTO IN PIÙ" size={36} rot={-3} until={at('ricevitore', 2, -0.2)} />
      <Link T={T} t0={at('ricevitore', 1, 0.3)} a={[440, 560]} b={[MX + 22, 770]} c={[300, 720]} label="va rimandato" ly={50} size={40} arrow dashed color={TIME} w={7} flow dur={1.0} fade={off('ricevitore')} />
      <Tag T={T} t0={at('ricevitore', 2, 0.2)} x={360} y={760} text="IL RICEVITORE" bg={TIME} size={36} rot={2} until={end('ricevitore') - 0.2} />
      {(() => {
        // le visioni: tubi d'acqua trasparenti che escono dal cerchio di Donnie e anticipano dove andrà
        const on = focus(at('ricevitore', 3, 0), end('ricevitore') - 0.2);
        if (on <= 0) return null;
        return (
          <g opacity={on}>
            {[-0.6, -0.2, 0.25].map((a, i) => {
              const len = 220 * eo(seg(T, at('ricevitore', 3, 0.1 + i * 0.15), at('ricevitore', 3, 1.0 + i * 0.15)));
              const x1 = N.donnie[0] + Math.cos(a) * len, y1 = N.donnie[1] + Math.sin(a) * len + Math.sin(T * 2 + i) * 10;
              return (
                <g key={i}>
                  <path d={`M${N.donnie[0]} ${N.donnie[1]} Q${(N.donnie[0] + x1) / 2} ${(N.donnie[1] + y1) / 2 - 40} ${x1} ${y1}`} fill="none" stroke="#BFD6FF" strokeWidth="22" strokeLinecap="round" opacity=".35" />
                  <path d={`M${N.donnie[0]} ${N.donnie[1]} Q${(N.donnie[0] + x1) / 2} ${(N.donnie[1] + y1) / 2 - 40} ${x1} ${y1}`} fill="none" stroke="#E8F0FF" strokeWidth="5" strokeLinecap="round" strokeDasharray="4 16" strokeDashoffset={-T * 50} />
                  <circle cx={x1} cy={y1} r="12" fill="#E8F0FF" opacity=".8" />
                </g>
              );
            })}
            <text x={N.donnie[0] + 120} y={N.donnie[1] + 120} fontFamily={HAND} fontWeight={700} fontSize={fit(42)} fill="#BFD6FF" stroke={DARK} strokeWidth="7" paintOrder="stroke">visioni</text>
          </g>
        );
      })()}

      {/* ---- capitolo 6: la scuola allagata, la casa in fiamme, Cunningham */}
      <Link T={T} t0={at('danni', 0, 0.3)} a={[830, 590]} b={[540, BAND.paese.y0 + 80]} c={[1000, 1400]} label="lo spinge" lx={40} size={42} arrow dashed color={RED} w={6} fade={off('danni')} />
      <Tag T={T} t0={at('danni', 1, 0.2)} x={340} y={BAND.paese.y0 + 120} text="SCUOLA ALLAGATA" bg="#BFD6FF" size={32} rot={-2} until={end('danni') - 0.2} />
      <Tag T={T} t0={at('danni', 1, 1.9)} x={760} y={BAND.paese.y0 + 110} text="CASA IN FIAMME" bg={ENGINE} size={32} rot={2} until={at('danni', 2, 0.2)} />
      <Node T={T} t0={at('danni', 2, 0.1)} p={N.cunn} name="Jim Cunningham" sub={T < end('danni') ? 'corsi di felicità' : undefined} ring={focus(at('danni', 2), end('danni'))} fade={1 - seg(T, at('letto', 0, 0.3), at('letto', 0, 1.2))} dead={0}><Tape /></Node>
      <Tag T={T} t0={at('danni', 3, 0.2)} x={720} y={BAND.paese.y0 + 120} text="PROVE DI CRIMINI" bg={RED} fg={INK} size={36} rot={-3} until={end('danni') - 0.2} />

      {/* ---- capitolo 7: Gretchen, i bulli, l'auto */}
      {(() => {
        const dead = seg(T, at('gretchen', 2, 1.0), at('gretchen', 2, 1.5));
        const fade = 1 - seg(T, at('letto', 0, 0.3), at('letto', 0, 1.2));
        return (
          <>
            <Node T={T} t0={at('gretchen', 0, 0.2)} p={N.gretchen} name="Gretchen" sub={T < end('gretchen') ? 'la ragazza nuova' : undefined} ring={focus(at('gretchen', 0), at('gretchen', 1))} dead={dead} fade={fade}><Bike T={T} /></Node>
            <Link T={T} t0={at('gretchen', 0, 0.6)} a={[330, 620]} b={[580, 1220]} c={[520, 860]} label="si innamora" lx={70} size={42} color="#E86A9A" fade={off('gretchen') * fade} />
          </>
        );
      })()}
      <Tag T={T} t0={at('gretchen', 1, 0.3)} x={600} y={BAND.nonna.y0 + 120} text="DUE BULLI" bg={INK} size={36} rot={-3} until={at('gretchen', 2, 0.3)} />
      <Tag T={T} t0={at('gretchen', 2, 1.0)} x={560} y={BAND.nonna.y0 + 110} text="INVESTITA" bg={RED} fg={INK} size={42} rot={-3} until={end('gretchen') - 0.2} />
      <Node T={T} t0={at('gretchen', 3, 0.1)} p={N.frank2} name="Frank" sub={T < end('gretchen') ? 'un ragazzo vero' : undefined} ring={focus(at('gretchen', 3), end('gretchen'))} dead={seg(T, shot + 0.1, shot + 0.4)} fade={1 - seg(T, at('letto', 0, 0.3), at('letto', 0, 1.2))}><Ears /></Node>

      {/* ---- capitolo 8: lo sparo; chi muore nella copia torna come guida; il coniglio era Frank */}
      {flash > 0 && <rect x="-500" y="-500" width="3000" height="4500" fill="#FFF6E0" opacity={flash * 0.55} />}
      <Tag T={T} t0={at('guida', 1, 0.2)} x={600} y={BAND.nonna.y0 - 40} text="TORNA COME GUIDA" bg={TIME} size={40} rot={-2} until={end('guida') - 0.3} />
      <Link T={T} t0={at('guida', 2, 0.1)} a={[880, 1270]} b={[840, 590]} c={[1010, 940]} label="era lui" lx={-20} size={46} arrow dashed color={TIME} w={8} flow dur={1.0} fade={1 - seg(T, at('letto', 0, 0.3), at('letto', 0, 1.0))} />
      <Link T={T} t0={at('guida', 3, 0.1)} a={[740, 530]} b={[352, 548]} c={[560, 440]} label="lo guida" ly={44} size={42} arrow color={TIME} w={6} fade={off('guida')} />

      {/* ---- capitolo 9: il motore strappato torna indietro lungo il tratteggio giallo fino alla prima notte */}
      {(() => {
        const t0 = at('vortice', 3, 0.1);
        if (T < t0) return null;
        const p = eio(seg(T, t0, t0 + 2.4));
        const fade = 1 - seg(T, at('letto', 0, 0.8), at('letto', 0, 1.6));
        const d = `M560 ${BAND.collina.y0 + 180} C1060 ${BAND.collina.y0 + 120} 1060 1300 ${ENG_HIT[0] + 60} ${ENG_HIT[1] - 120}`;
        return (
          <g opacity={fade}>
            <mask id="dd-back" maskUnits="userSpaceOnUse" x="-200" y="0" width="1500" height="3400"><path d={d} fill="none" stroke="#fff" strokeWidth="30" pathLength={1} strokeDasharray={`${p} 1`} /></mask>
            <path d={d} fill="none" stroke={TIME} strokeWidth="12" strokeDasharray="34 22" strokeDashoffset={-T * 80} mask="url(#dd-back)" strokeLinecap="round" />
            {!WIDEV && <text x={1010} y={1900} textAnchor="end" fontFamily={HAND} fontWeight={700} fontSize={fit(48)} fill={TIME} stroke={DARK} strokeWidth="8" paintOrder="stroke" opacity={seg(T, t0 + 0.8, t0 + 1.3)}>indietro nel tempo</text>}
          </g>
        );
      })()}
      <Tag T={T} t0={at('vortice', 3, 1.4)} x={600} y={BAND.casa.y0 + 60} text="ALLA PRIMA NOTTE" bg={TIME} size={40} rot={-2} until={end('vortice') - 0.1} />

      {/* ---- capitolo 10: Donnie resta nel letto; il mondo è salvo; Gretchen viva non lo conosce */}
      <Tag T={T} t0={at('letto', 0, 1.9)} x={560} y={BAND.casa.y0 - 50} text="TUTTO SI RIAVVOLGE" bg={COPY} size={38} rot={-2} until={at('letto', 1, 0.1)} />
      <Tag T={T} t0={at('letto', 2, 0.2)} x={560} y={BAND.casa.y0 - 50} text="IL MONDO È SALVO" bg={TIME} size={44} rot={-2} until={end('letto') + 1} />
      <Node T={T} t0={at('letto', 2, 0.8)} p={N.gretchenVera} name="Gretchen" sub="è viva" ring={focus(at('letto', 2, 0.8), at('letto', 3, 0.3))}><Bike T={T} /></Node>
      {(() => {
        const t0 = at('letto', 3, 0.1);
        if (T < t0) return null;
        const br = seg(T, t0 + 0.7, t0 + 1.0);
        return (
          <g>
            <Link T={T} t0={t0} a={[662, 830]} b={[548, 692]} c={[640, 740]} dashed color={DIM} w={5} label="non lo conosce" lx={-20} ly={60} size={38} />
            {br > 0 && <path d="M609 742 l22 22 M631 742 l-22 22" stroke={RED} strokeWidth="6" strokeLinecap="round" opacity={br} />}
          </g>
        );
      })()}
    </g>
  );
};

export const makeCopia = (chapterId: string): React.FC<SceneProps> => {
  const Scene: React.FC<SceneProps> = ({ t }) => {
    const T = STARTS[chapterId] + t;
    const c = camAt(T);
    UI_K = Math.max(1, 0.85 / c.z);
    WIDEV = c.z < 0.5;
    return (
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id="dd" />
          <radialGradient id="dd-bg" cx=".5" cy=".46" r=".8">
            <stop offset="0" stopColor="#1E2248" />
            <stop offset=".6" stopColor="#12152B" />
            <stop offset="1" stopColor="#08091A" />
          </radialGradient>
          <linearGradient id="dd-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0C0E24" />
            <stop offset=".45" stopColor="#1A1E44" />
            <stop offset=".8" stopColor="#2A2F5A" />
            <stop offset="1" stopColor="#3A3466" />
          </linearGradient>
          <linearGradient id="dd-dawn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1A1E44" stopOpacity="0" />
            <stop offset=".5" stopColor="#5A3A6A" stopOpacity=".6" />
            <stop offset=".8" stopColor="#B86A5A" stopOpacity=".75" />
            <stop offset="1" stopColor="#E8A06A" stopOpacity=".8" />
          </linearGradient>
          <linearGradient id="dd-house" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#4A5282" />
            <stop offset="1" stopColor="#30365E" />
          </linearGradient>
          <linearGradient id="dd-old" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#4A4258" />
            <stop offset="1" stopColor="#2E283A" />
          </linearGradient>
          <linearGradient id="dd-brick" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7A4040" />
            <stop offset="1" stopColor="#4E2A2E" />
          </linearGradient>
          <linearGradient id="dd-villa" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5A6090" />
            <stop offset="1" stopColor="#3A3E66" />
          </linearGradient>
          <linearGradient id="dd-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E8D49A" stopOpacity=".6" />
            <stop offset="1" stopColor="#E8D49A" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="dd-head" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="#FFF2C8" stopOpacity=".9" />
            <stop offset="1" stopColor="#FFF2C8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="dd-scrim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#08091A" stopOpacity=".96" />
            <stop offset=".82" stopColor="#08091A" stopOpacity=".9" />
            <stop offset="1" stopColor="#08091A" stopOpacity="0" />
          </linearGradient>
          <pattern id="dd-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0 H0 V40" fill="none" stroke="#1E2244" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#dd-bg)" />
        <g transform={`translate(540 900) scale(${c.z}) translate(${-c.x} ${-c.y})`}>
          <rect x="-4000" y="-4000" width="9080" height="13000" fill="url(#dd-grid)" opacity=".6" />
          <Schema T={T} />
        </g>
        <rect width="1080" height="575" fill="url(#dd-scrim)" />
        {MOTES.map((m, i) => (
          <circle key={i} cx={mod(m.x + Math.sin(T * 0.5 + m.ph) * 30, 1080)} cy={mod(m.y - T * m.v, 1920)} r={m.s} fill={INK} opacity={0.1 + 0.07 * Math.sin(T * 2 + m.ph)} />
        ))}
        <Counter T={T} />
        <Finish id="dd" tint="#161A3A" tintOpacity={0.12} />
      </svg>
    );
  };
  return Scene;
};
