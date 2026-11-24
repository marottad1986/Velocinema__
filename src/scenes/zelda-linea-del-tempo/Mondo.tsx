import React from 'react';
import { eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { CINZEL, HAND, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Glow, NearMotes, Stars, flashAt } from '../../lib/elements';
import { Inchiostro, Sigillo, type Pt } from '../../lib/pergamena';
import { subtitleTimes } from '../../components/ChapterOverlay';
import type { SceneProps } from '../../types';
import film from '../../../films/zelda-linea-del-tempo.json';
import { AMBER, BLUE, Corona, Fiamma, GOLD, INK, Nube, Ocarina, RED, Spada, TIME, Tri } from './Schema';
import { ArtHyrule, type Par } from './Hyrule';
import { ArtOrigine } from './Origine';
import { ArtBivio } from './Bivio';
import { ArtSigillato, ArtSommerso, ArtCrepuscolo } from './Rami';
import { ArtDopo } from './Dopo';

// Zelda, la linea del tempo (Videogiochi spiegati, formato "spiegato"), seconda versione dopo il «da rifare» dell'editore
// (24 nov: «qualità grafica scarsa e povera»): niente più pergamena con le miniature piccole. Tutto il video è un MONDO
// UNICO a tutto schermo che la camera attraversa, con un filo di luce d'oro (la linea del tempo) che lo percorre:
// in alto il cielo delle ORIGINI (isola nel cielo, la tempesta del demone, la spada sullo sperone di roccia), sotto
// HYRULE (castello, borgo, fiume, tempio, il cielo dove scende la Triforza), poi la VALLE DEL BIVIO dove il filo si
// divide in tre fiumi di luce verso tre orizzonti, sotto i TRE MONDI affiancati (rosso: il regno sigillato · azzurro: il
// regno sommerso · ambra: il crepuscolo) e in fondo MOLTO DOPO, le terre selvagge. Ogni luogo è una scena 1080×1920 con
// 5–6 piani in parallasse rispetto alla camera, luce drammatica e particelle; alla fine la camera si allontana e scopre
// tutto il mondo come uno schema intero. Personaggi = cerchi con l'oggetto (vocabolario fisso dello Spiegato semplice).
// Coordinate = mondo; la camera porta il punto (x, y) al centro dello schermo (540, 960) con zoom z.
// Eventi sulla griglia della musica (90 bpm, crome): gli stessi istanti `at()` dello spartito scripts/audio/zelda-linea-del-tempo.mjs.

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
const at = (ch: string, cue: number, d = 0) => G0 + Math.round((STARTS[ch] + CUES[ch][cue] + d - G0) / CROMA) * CROMA;
const end = (ch: string) => STARTS[ch] + film.capitoli.find((c) => c.id === ch)!.durata;
const pop = (T: number, t0: number) => eob(seg(T, t0, t0 + 0.45), 1.7);

// ---------------------------------------------------------------- i luoghi (origine in alto a sinistra di ogni scena 1080×1920)

const W = 1080, H = 1920;
export const LUOGHI = {
  origine: [0, -H] as Pt,
  hyrule: [0, 0] as Pt,
  bivio: [0, H] as Pt,
  sigillato: [-1120, 2 * H] as Pt,
  sommerso: [0, 2 * H] as Pt,
  crepuscolo: [1120, 2 * H] as Pt,
  dopo: [0, 3 * H] as Pt,
};
type Luogo = keyof typeof LUOGHI;
const C = (k: Luogo, dx = 0, dy = 0): { x: number; y: number } => ({ x: LUOGHI[k][0] + W / 2 + dx, y: LUOGHI[k][1] + H / 2 + dy });
/** Punto del mondo da coordinate locali di un luogo. */
const P = (k: Luogo, x: number, y: number): Pt => [LUOGHI[k][0] + x, LUOGHI[k][1] + y];

// ---------------------------------------------------------------- camera

type Shot = { at: number; x: number; y: number; z: number };
const S = (t: number, k: Luogo, z = 1, dx = 0, dy = 0): Shot => ({ at: t, ...C(k, dx, dy), z });
const SHOTS: Shot[] = [
  S(at('chi', 0), 'hyrule', 1.0, 0, -40),
  S(at('chi', 1), 'hyrule', 1.22, -170, 120),
  S(at('chi', 2), 'hyrule', 1.22, 90, 130),
  S(at('chi', 3), 'hyrule', 1.04, 0, 40),
  // sale al cielo delle origini, poi si allarga sui due luoghi per la maledizione che scende
  S(at('origine', 0, -0.4), 'origine', 1.0, 0, 0),
  S(at('origine', 1), 'origine', 1.14, 110, -80),
  { at: at('origine', 2), x: 540, y: 0, z: 0.5 },
  S(at('origine', 3), 'hyrule', 1.0, 0, 40),
  // la Triforza nel cielo di Hyrule
  S(at('triforza', 0), 'hyrule', 1.08, -40, -80),
  S(at('triforza', 1), 'hyrule', 1.16, -60, -90),
  S(at('triforza', 2), 'hyrule', 1.08, 0, -20),
  S(at('triforza', 3), 'hyrule', 1.04, 0, 0),
  // Ocarina of Time
  S(at('ocarina', 0), 'hyrule', 1.04, 60, 40),
  S(at('ocarina', 1), 'hyrule', 1.3, -260, 160),
  S(at('ocarina', 2), 'hyrule', 1.0, 20, 0),
  S(at('ocarina', 3), 'hyrule', 1.08, -20, 60),
  // il bivio: indietro nel tempo, poi giù nella valle dove il filo si divide, poi i tre mondi dall'alto
  S(at('bivio', 0), 'hyrule', 1.18, -110, 120),
  S(at('bivio', 1), 'bivio', 1.0, 0, -60),
  S(at('bivio', 2), 'bivio', 0.9, 0, 80),
  { at: at('bivio', 3), x: 540, y: 2 * H, z: 0.33 },
  // i tre mondi
  S(at('sconfitta', 0, -0.3), 'sigillato', 1.0),
  S(at('sconfitta', 2), 'sigillato', 1.12, 0, -120),
  S(at('sconfitta', 3), 'sigillato', 1.02, 0, 40),
  S(at('mare', 0, -0.3), 'sommerso', 1.0),
  S(at('mare', 1), 'sommerso', 1.06, 0, 60),
  S(at('mare', 3), 'sommerso', 1.04, 30, -40),
  S(at('crepuscolo', 0, -0.3), 'crepuscolo', 1.0),
  S(at('crepuscolo', 1), 'crepuscolo', 1.12, 0, -140),
  S(at('crepuscolo', 3), 'crepuscolo', 1.02, -20, 20),
  // molto dopo, poi tutto il mondo come uno schema
  S(at('dopo', 0, -0.3), 'dopo', 1.0),
  S(at('dopo', 1), 'dopo', 1.06, 0, 40),
  { at: at('dopo', 2), x: 540, y: 3 * H - 200, z: 0.42 },
  { at: at('dopo', 3, 0.9), x: 540, y: 2880, z: 0.2 },
];
const camAt = (T: number) => {
  let o = { x: SHOTS[0].x, y: SHOTS[0].y, z: SHOTS[0].z };
  for (const s of SHOTS.slice(1)) {
    const p = eio(seg(T, s.at - 0.3, s.at + 1.3));
    o = { x: lerp(o.x, s.x, p), y: lerp(o.y, s.y, p), z: Math.exp(lerp(Math.log(o.z), Math.log(s.z), p)) };
  }
  return { x: o.x + Math.sin(T * 0.3) * 8, y: o.y + Math.cos(T * 0.25) * 6, z: o.z * (1 + 0.015 * Math.sin(T * 0.2)) };
};
let UI_K = 1;
let WIDEV = false;
const fit = (size: number) => Math.max(size, Math.min(size * UI_K, WIDEV ? 200 : 110));

// ---------------------------------------------------------------- elementi dello schema (vocabolario fisso)

const LABEL = '#FFF8E8';
const OUT = '#120C08';
const Node: React.FC<{ T: number; t0: number; p: Pt; name: string; sub?: string; ring?: number; r?: number; fade?: number; children?: React.ReactNode; size?: number; dead?: number }> = ({
  T, t0, p, name, sub, ring = 0, r = 54, fade = 1, children, size: size0 = 36, dead = 0,
}) => {
  if (T < t0 || fade <= 0) return null;
  const size = fit(size0);
  const s = pop(T, t0);
  const ly = r + size + 6;
  return (
    <g transform={`translate(${p[0]} ${p[1]})`} opacity={seg(T, t0, t0 + 0.15) * fade}>
      <g transform={`scale(${s})`}>
        <Glow id={`zm-g${p[0]}${p[1]}`} x={0} y={0} r={r * 2.4} t={T} color={GOLD} amp={0.1} rate={2.4} opacity={0.25 + 0.45 * Math.min(1, ring)} />
        <circle r={r + 5} fill="#000" opacity=".3" transform="translate(5 7)" />
        <circle r={r} fill="#FBF3DE" stroke={ring > 0.5 ? '#E8A400' : INK} strokeWidth={ring > 0.5 ? 8 : 6} />
        <circle r={r - 8} fill="none" stroke="#C9962E" strokeWidth="2.5" opacity=".8" />
        <g transform={`scale(${r / 48})`} opacity={1 - 0.55 * dead}>{children}</g>
        {dead > 0 && <path d={`M${-r * 0.55} ${-r * 0.55} L${r * 0.55} ${r * 0.55} M${r * 0.55} ${-r * 0.55} L${-r * 0.55} ${r * 0.55}`} stroke={RED} strokeWidth="8" strokeLinecap="round" opacity={dead} />}
      </g>
      {name && <text y={ly} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={size} fill={LABEL} stroke={OUT} strokeWidth="8" paintOrder="stroke" opacity={seg(T, t0 + 0.2, t0 + 0.5)}>{name}</text>}
      {sub && !WIDEV && <text y={ly + size * 0.9} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={size * 0.72} fill="#F2D88A" stroke={OUT} strokeWidth="7" paintOrder="stroke" opacity={seg(T, t0 + 0.3, t0 + 0.6)}>{sub}</text>}
    </g>
  );
};

const Tratto: React.FC<{ T: number; t0: number; a: Pt; b: Pt; c?: Pt; color?: string; dashed?: boolean; label?: string; arrow?: boolean; w?: number; lx?: number; ly?: number; size?: number; fade?: number; flow?: boolean; dur?: number }> = ({
  T, t0, a, b, c, color = LABEL, dashed = false, label, arrow = false, w = 8, lx = 0, ly = 0, size: size0 = 46, fade = 1, flow = false, dur = 0.6,
}) => {
  const size = fit(size0);
  if (T < t0 || fade <= 0) return null;
  const p = eo(seg(T, t0, t0 + dur));
  const [mx, my] = c ?? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const d = `M${a[0]} ${a[1]} Q${mx} ${my} ${b[0]} ${b[1]}`;
  const ang = (Math.atan2(b[1] - my, b[0] - mx) * 180) / Math.PI;
  const id = `zm-m${Math.round(a[0])}${Math.round(a[1])}${Math.round(b[0])}`;
  const tx = 0.25 * a[0] + 0.5 * mx + 0.25 * b[0], ty = 0.25 * a[1] + 0.5 * my + 0.25 * b[1];
  return (
    <g opacity={fade}>
      <mask id={id} maskUnits="userSpaceOnUse" x="-4000" y="-4000" width="10000" height="16000"><path d={d} fill="none" stroke="#fff" strokeWidth={w + 16} pathLength={1} strokeDasharray={`${p} 1`} /></mask>
      <path d={d} fill="none" stroke={OUT} strokeWidth={w + 6} strokeLinecap="round" opacity=".6" mask={`url(#${id})`} strokeDasharray={dashed ? `${w * 3} ${w * 2.2}` : undefined} strokeDashoffset={flow ? -T * 60 : 0} />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray={dashed ? `${w * 3} ${w * 2.2}` : undefined} strokeDashoffset={flow ? -T * 60 : 0} strokeLinecap="round" mask={`url(#${id})`} />
      {arrow && p > 0.95 && <path d={`M${-w * 3.4} ${-w * 2.3} L0 0 L${-w * 3.4} ${w * 2.3}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${b[0]} ${b[1]}) rotate(${ang})`} />}
      {label && !WIDEV && <text x={tx + lx} y={ty + ly} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={size} fill={color} stroke={OUT} strokeWidth="9" paintOrder="stroke" opacity={seg(T, t0 + 0.4, t0 + 0.8)}>{label}</text>}
    </g>
  );
};

const Tag: React.FC<{ T: number; t0: number; x: number; y: number; text: string; bg?: string; fg?: string; size?: number; rot?: number; until?: number }> = ({
  T, t0, x, y, text, bg = GOLD, fg = INK, size: size0 = 40, rot = 0, until = 1e9,
}) => {
  const size = fit(size0);
  if (T < t0 || T > until + 0.5) return null;
  const w = text.length * size * 0.6 + size;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${pop(T, t0)})`} opacity={1 - seg(T, until, until + 0.5)}>
      <rect x={-w / 2 + size * 0.14} y={-size * 0.95 + size * 0.16} width={w} height={size * 1.6} rx={size * 0.3} fill="#000" opacity=".4" />
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.6} rx={size * 0.3} fill={bg} stroke={INK} strokeWidth="4" />
      <text y={size * 0.33} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={size} fill={fg}>{text}</text>
    </g>
  );
};

const Ring: React.FC<{ T: number; x: number; y: number; r: number; on: number; w?: number }> = ({ T, x, y, r, on, w = 10 }) => {
  if (on <= 0) return null;
  const k = eob(Math.min(1, on), 1.6);
  return (
    <g opacity={Math.min(1, on)}>
      <circle cx={x} cy={y} r={r * k} fill="none" stroke={OUT} strokeWidth={w + 6} opacity=".5" />
      <circle cx={x} cy={y} r={r * k} fill="none" stroke="#FF5A4A" strokeWidth={w} strokeDasharray={`${r * 0.5} ${r * 0.18}`} strokeDashoffset={-T * 40} />
    </g>
  );
};

/** Cartiglio con il titolo di un gioco (pergamena che si srotola), in Cinzel. */
const Cartiglio: React.FC<{ T: number; t0: number; x: number; y: number; w: number; text: string; color: string; size?: number; until?: number }> = ({ T, t0, x, y, w, text, color, size: size0 = 32, until = 1e9 }) => {
  if (T < t0 || T > until + 0.4 || WIDEV) return null;
  const size = fit(size0);
  const p = eo(seg(T, t0, t0 + 0.5));
  const ww = Math.max(w, text.length * size * 0.72 + 40) * p;
  const h = size * 1.9;
  return (
    <g transform={`translate(${x} ${y})`} opacity={Math.min(1, p * 2) * (1 - seg(T, until, until + 0.4))}>
      <path d={`M${-ww / 2 - 30} ${-h / 2 + 10} H${-ww / 2} V${h / 2 + 10} H${-ww / 2 - 30} L${-ww / 2 - 16} 10 Z`} fill="#C8A870" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d={`M${ww / 2 + 30} ${-h / 2 + 10} H${ww / 2} V${h / 2 + 10} H${ww / 2 + 30} L${ww / 2 + 16} 10 Z`} fill="#C8A870" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <rect x={-ww / 2 + 6} y={-h / 2 + 8} width={ww} height={h} fill="#000" opacity=".3" />
      <rect x={-ww / 2} y={-h / 2} width={ww} height={h} fill="#F6EAC8" stroke={INK} strokeWidth="4" />
      <path d={`M${-ww / 2 + 10} ${h / 2 - 8} H${ww / 2 - 10}`} stroke={color} strokeWidth="4" />
      {p > 0.9 && <text y={size * 0.36} textAnchor="middle" fontFamily={CINZEL} fontWeight={700} fontSize={size} fill={INK}>{text}</text>}
    </g>
  );
};

const Giro: React.FC<{ T: number; x: number; y: number; r: number; on: number; color?: string }> = ({ T, x, y, r, on, color = '#FF5A4A' }) => {
  if (on <= 0) return null;
  const a1 = -0.5;
  return (
    <g transform={`translate(${x} ${y}) rotate(${T * 90})`} opacity={Math.min(1, on)}>
      <path d={`M${r} 0 A${r} ${r} 0 1 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)}`} fill="none" stroke={OUT} strokeWidth="13" strokeLinecap="round" opacity=".5" />
      <path d={`M${r} 0 A${r} ${r} 0 1 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)}`} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray="24 14" />
      <path d={`M${r * Math.cos(a1) - 18} ${r * Math.sin(a1) - 2} L${r * Math.cos(a1)} ${r * Math.sin(a1)} L${r * Math.cos(a1) - 2} ${r * Math.sin(a1) + 20}`} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

// ---------------------------------------------------------------- il mondo

const rr = rng(1998);
const VOID_STARS = Array.from({ length: 160 }, () => ({ x: -1400 + rr() * 3900, y: -2200 + rr() * 10000, s: 1.5 + rr() * 3.5, ph: rr() * 6 }));
const N = { link: P('hyrule', 330, 1140), zelda: P('hyrule', 590, 1160), ganon: P('hyrule', 850, 1130), morti: P('origine', 860, 1160) };

/** Il filo d'oro della linea del tempo: dalla spada delle origini a Hyrule, al bivio, nei tre mondi, poi verso il fondo. */
const TRUNK: Pt[] = [P('origine', 540, 1160), P('origine', 300, 1550), P('hyrule', 120, 200), P('hyrule', 90, 900), P('hyrule', 470, 1330), P('hyrule', 640, 1700), P('bivio', 540, 300), P('bivio', 540, 900)];
const FORK = P('bivio', 540, 960);
const BRANCH: Pt[][] = [
  [FORK, P('bivio', 380, 1200), P('bivio', 150, 1620), P('sigillato', 600, -60), P('sigillato', 540, 300)],
  [FORK, P('bivio', 540, 1300), P('bivio', 540, 1800), P('sommerso', 540, 300)],
  [FORK, P('bivio', 700, 1200), P('bivio', 930, 1620), P('crepuscolo', 480, -60), P('crepuscolo', 540, 300)],
];
const BCOL = [RED, BLUE, AMBER];

const Mondo: React.FC<{ T: number; cam: { x: number; y: number; z: number } }> = ({ T, cam }) => {
  const focus = (t0: number, t1: number) => seg(T, t0, t0 + 0.3) * (1 - seg(T, t1, t1 + 0.4));
  const off = (ch: string) => 1 - seg(T, end(ch) - 0.4, end(ch) + 0.3);
  // vista: si disegnano solo i luoghi che entrano nell'inquadratura
  const hw = 540 / cam.z + 60, hh = 960 / cam.z + 60;
  // la valle del bivio è più larga: si estende sopra i tre mondi (e sale un po' tra le nuvole)
  const box = (k: Luogo) => (k === 'bivio' ? [-1120, 0, 3320, H] : [0, 0, W, H]);
  const visible = (k: Luogo) => {
    const [ox, oy] = LUOGHI[k];
    const [bx, by, bw, bh] = box(k);
    return ox + bx < cam.x + hw && ox + bx + bw > cam.x - hw && oy + by < cam.y + hh && oy + by + bh > cam.y - hh;
  };
  const par = (k: Luogo): Par => {
    const c = C(k);
    const cl = (v: number) => Math.max(-600, Math.min(600, v));
    const dx = cl(cam.x - c.x), dy = cl(cam.y - c.y);
    return (f: number) => `translate(${(dx * (1 - f) * 0.35).toFixed(1)} ${(dy * (1 - f) * 0.35).toFixed(1)})`;
  };
  const place = (k: Luogo, el: React.ReactNode) => visible(k) && (
    <g key={k} transform={`translate(${LUOGHI[k][0]} ${LUOGHI[k][1]})`}>
      <clipPath id={`zm-c${k}`}><rect x={box(k)[0] - 2} y={box(k)[1] - 2} width={box(k)[2] + 4} height={box(k)[3] + 4} /></clipPath>
      <g clipPath={`url(#zm-c${k})`}>{el}</g>
    </g>
  );

  // ---- eventi
  const seal0 = eio(seg(T, at('origine', 1, 0.6), at('origine', 1, 1.8)));
  const open = eo(seg(T, at('ocarina', 1, 0.2), at('ocarina', 1, 1.2)));
  const pulled = seg(T, at('ocarina', 1, 0.1), at('ocarina', 1, 0.7));
  const win = at('ocarina', 3, 1.6);
  const dark = eio(seg(T, at('ocarina', 2, 0.6), at('ocarina', 2, 1.6))) * (1 - eio(seg(T, win, win + 1.2)));
  const dawn = seg(T, win, win + 1.0) * (1 - seg(T, end('bivio') - 1, end('bivio')));
  const triIn = at('triforza', 0, 0.3);
  const split = at('triforza', 3, 0.5);
  const toOwners = at('ocarina', 2, 0.1);
  const adult = eio(seg(T, at('ocarina', 3, 0.5), at('ocarina', 3, 1.3))) * (1 - eio(seg(T, at('bivio', 0, 0.8), at('bivio', 0, 1.8))));
  const trunkTop = eio(seg(T, at('origine', 3, 0.1), at('origine', 3, 1.4)));
  const trunkLow = eio(seg(T, at('bivio', 1, -0.6), at('bivio', 1, 1.2)));
  const branch = eio(seg(T, at('bivio', 2, -0.2), at('bivio', 2, 1.8)));
  const flash = flashAt(T, [win]);
  const flash0 = flashAt(T, [at('origine', 1, 1.2)], [0.8]);

  const tris = [
    { key: 'potere', label: 'POTERE', col: '#FF6A5A', home: P('hyrule', 220, 490), owner: N.ganon },
    { key: 'saggezza', label: 'SAGGEZZA', col: '#7CC0FF', home: P('hyrule', 420, 480), owner: N.zelda },
    { key: 'coraggio', label: 'CORAGGIO', col: '#7CE08A', home: P('hyrule', 620, 490), owner: N.link },
  ];

  return (
    <g>
      {/* ---- il vuoto intorno ai luoghi: un cielo stellato, così l'inquadratura larga finale è una mappa nel buio */}
      <rect x="-3000" y="-5000" width="8000" height="16000" fill="#0A0E1E" />
      {VOID_STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#FFF4D8" opacity={0.35 + 0.35 * Math.sin(T * 2 + s.ph)} />)}

      {place('origine', <ArtOrigine T={T} par={par('origine')} seal={seal0} />)}
      {place('hyrule', <ArtHyrule T={T} par={par('hyrule')} dark={dark} open={open} pulled={pulled} dawn={dawn} />)}
      {place('bivio', <ArtBivio T={T} par={par('bivio')} />)}
      {place('sigillato', <ArtSigillato T={T} par={par('sigillato')} take={seg(T, at('sconfitta', 1, 0.1), at('sconfitta', 1, 1.4))} seal={eo(seg(T, at('sconfitta', 2, 0.6), at('sconfitta', 2, 2.0)))} />)}
      {place('sommerso', <ArtSommerso T={T} par={par('sommerso')} flood={seg(T, at('mare', 1, 0.4), at('mare', 1, 2.6))} isles={seg(T, at('mare', 2, 0.1), at('mare', 2, 1.0))} sail={seg(T, at('mare', 3, 0.1), at('mare', 3, 3.2))} />)}
      {place('crepuscolo', <ArtCrepuscolo T={T} par={par('crepuscolo')} banish={seg(T, at('crepuscolo', 1, 0.3), at('crepuscolo', 1, 1.8))} back={seg(T, at('crepuscolo', 3, 0.3), at('crepuscolo', 3, 1.8))} />)}
      {place('dopo', <ArtDopo T={T} par={par('dopo')} />)}

      {/* ---- il filo d'oro del tempo */}
      <Inchiostro id="zm-tr1" pts={TRUNK.slice(0, 3)} p={T < at('origine', 0) ? 0 : Math.max(trunkTop, T > end('origine') ? 1 : 0)} t={T} color="#FFD866" w={14} halo={1} gold="#FFF2B0" />
      <Inchiostro id="zm-tr2" pts={TRUNK.slice(2, 6)} p={T < at('chi', 0) ? 0 : 1} t={T} color="#FFD866" w={11} halo={0.8} nib={false} />
      <Inchiostro id="zm-tr3" pts={TRUNK.slice(5)} p={trunkLow} t={T} color="#FFD866" w={16} halo={1} gold="#FFF2B0" />
      {BRANCH.map((pts, i) => <Inchiostro key={i} id={`zm-br${i}`} pts={pts} p={branch} t={T} color={BCOL[i]} w={18} halo={1.4} seed={i + 5} gold="#FFF2B0" />)}

      {/* ---- capitolo 1: Link, Zelda; un Link e una Zelda nuovi per ogni gioco */}
      {(() => {
        const t0 = at('chi', 3, 0.2);
        const o = 1 - seg(T, end('chi') - 0.3, end('chi') + 0.3);
        if (T < t0 || o <= 0) return null;
        return (
          <g opacity={o}>
            {[N.link, N.zelda].map((n, j) => [-1, 0, 1].map((k) => {
              const t1 = t0 + 0.15 * (k + 1) + j * 0.3;
              if (T < t1) return null;
              return (
                <g key={`${j}${k}`} transform={`translate(${n[0] + k * 90} ${n[1] - 150 + Math.abs(k) * 20}) scale(${pop(T, t1) * 0.6})`} opacity=".9">
                  <circle r="48" fill="#FBF3DE" stroke={INK} strokeWidth="5" strokeDasharray="12 7" />
                  <g opacity=".8">{j ? <Corona /> : <Spada />}</g>
                </g>
              );
            }))}
            {!WIDEV && <text x={460} y={930} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={fit(52)} fill="#FFE08A" stroke={OUT} strokeWidth="10" paintOrder="stroke" opacity={seg(T, t0 + 0.6, t0 + 1.0)}>uno nuovo per ogni gioco</text>}
          </g>
        );
      })()}

      {/* ---- la Triforza: tre triangoli separati scendono con i loro raggi */}
      {tris.map((tr, i) => {
        if (T < triIn) return null;
        const t1 = triIn + i * 0.15;
        const drop = eob(seg(T, t1, t1 + 0.7), 1.3);
        const apart = eo(seg(T, split, split + 0.6));
        const fly = eio(seg(T, toOwners + i * 0.12, toOwners + 1.0 + i * 0.12));
        const shake = T > split - 0.1 && T < split + 0.3 ? Math.sin(T * 80) * 6 : 0;
        const hx = tr.home[0] + (i - 1) * 50 * apart + shake, hy = tr.home[1];
        const ox = tr.owner[0] + 44, oy = tr.owner[1] - 46;
        const x = lerp(hx, ox, fly), y = lerp(lerp(hy - 260, hy, drop), oy, fly);
        const s = lerp(1.35, 0.4, fly) * (0.4 + 0.6 * seg(T, t1, t1 + 0.3));
        const lab = focus(at('triforza', 1, 0.1 + i * 0.45), toOwners) * (WIDEV ? 0 : 1);
        return (
          <g key={tr.key}>
            {fly < 0.5 && <path d={`M${x - 40} ${y + 30} L${x - 160} ${y + 700} H${x + 160} L${x + 40} ${y + 30} Z`} fill="#FFF2B0" opacity={0.18 * (1 - fly * 2) * seg(T, t1, t1 + 0.5)} />}
            <g transform={`translate(${x} ${y}) scale(${s})`}><Tri T={T} id={`zm-tri${i}`} glow={1 - fly * 0.6} /></g>
            {lab > 0 && <text x={hx} y={hy + 92} textAnchor="middle" fontFamily={CINZEL} fontWeight={700} fontSize={fit(30)} fill={tr.col} stroke={OUT} strokeWidth="9" paintOrder="stroke" opacity={lab}>{tr.label}</text>}
          </g>
        );
      })}
      <Tag T={T} t0={at('triforza', 2, 0.2)} x={420} y={P('hyrule', 0, 720)[1]} text="CUORE IN EQUILIBRIO?" bg="#FBF3DE" size={38} rot={-2} until={at('triforza', 3, 0.3)} />
      <Tag T={T} t0={split} x={420} y={P('hyrule', 0, 720)[1]} text="SI SPEZZA IN TRE" bg={RED} fg="#FFF8E8" size={40} rot={2} until={end('triforza') - 0.2} />

      {/* ---- i personaggi */}
      <Node T={T} t0={at('chi', 1, 0.1)} p={N.link} name="Link" sub={T < end('chi') ? "l'eroe" : adult > 0.5 ? 'adulto' : undefined} r={54 + 16 * adult} ring={focus(at('chi', 1), at('chi', 2)) + focus(at('ocarina', 3), end('ocarina')) + focus(at('bivio', 0), at('bivio', 1))}><Spada /></Node>
      <Node T={T} t0={at('chi', 2, 0.1)} p={N.zelda} name="Zelda" sub={T < end('chi') ? 'la principessa' : undefined} ring={focus(at('chi', 2), at('chi', 3)) + focus(at('bivio', 0), at('bivio', 0, 1.6))}><Corona /></Node>
      <Node T={T} t0={at('origine', 1, 0.1)} p={N.morti} name="Mortipher" sub={T < end('origine') ? 'il demone' : undefined} ring={focus(at('origine', 1), at('origine', 2, 0.6))} dead={seg(T, at('origine', 1, 1.2), at('origine', 1, 1.6))}><Nube T={T} /></Node>
      <Node T={T} t0={at('ocarina', 0, 0.1)} p={N.ganon} name="Ganondorf" sub={T < end('ocarina') ? 'il re dei ladri' : undefined} ring={focus(at('ocarina', 0), at('ocarina', 1)) + focus(at('ocarina', 2), at('ocarina', 3))}><Fiamma T={T} /></Node>

      {/* ---- capitolo 2: la maledizione scende dal cielo su Link e Zelda; rinascono sempre */}
      <Tratto T={T} t0={at('origine', 2, 0.1)} a={[N.morti[0] - 40, N.morti[1] + 60]} b={[N.link[0] + 10, N.link[1] - 70]} c={[200, -300]} color="#FF5A4A" dashed w={12} arrow label="maledizione" lx={-40} ly={-40} size={64} dur={0.9} fade={off('origine')} />
      <Tratto T={T} t0={at('origine', 2, 0.3)} a={[N.morti[0] - 20, N.morti[1] + 70]} b={[N.zelda[0] + 10, N.zelda[1] - 76]} c={[760, -200]} color="#FF5A4A" dashed w={12} arrow dur={0.9} fade={off('origine')} />
      <Giro T={T} x={N.link[0]} y={N.link[1]} r={80} on={focus(at('origine', 3, 0.1), end('origine') - 0.2)} />
      <Giro T={T} x={N.zelda[0]} y={N.zelda[1]} r={80} on={focus(at('origine', 3, 0.3), end('origine') - 0.2)} />
      <Tag T={T} t0={at('origine', 3, 0.5)} x={540} y={P('hyrule', 0, 1060)[1]} text="OGNI EPOCA, DA CAPO" bg={GOLD} size={40} rot={-2} until={end('origine') - 0.3} />
      {flash0 > 0 && <rect x="-3000" y="-5000" width="8000" height="16000" fill="#FFF8DC" opacity={flash0 * 0.45} />}

      {/* ---- capitolo 4 */}
      <Tratto T={T} t0={at('ocarina', 0, 0.6)} a={[N.ganon[0] - 30, N.ganon[1] - 70]} b={[470, 600]} c={[820, 760]} color="#D8A0FF" dashed w={9} arrow label="la vuole" lx={70} size={52} fade={off('ocarina')} />
      {open > 0 && T < end('ocarina') && (
        <g opacity={open * (1 - seg(T, at('ocarina', 2, 0.6), at('ocarina', 2, 1.4)))}>
          <path d={`M220 1150 Q300 800 520 560`} fill="none" stroke="#FFF2B0" strokeWidth={40 * open} opacity=".35" strokeLinecap="round" />
          <path d={`M220 1150 Q300 800 520 560`} fill="none" stroke="#FFFBE6" strokeWidth="9" strokeLinecap="round" strokeDasharray="6 18" strokeDashoffset={-T * 90} />
        </g>
      )}
      <Tag T={T} t0={at('ocarina', 1, 0.8)} x={360} y={880} text="LA STRADA È APERTA" bg="#FBF3DE" size={36} rot={-3} until={at('ocarina', 2, 0.2)} />
      <Tag T={T} t0={at('ocarina', 2, 1.6)} x={600} y={720} text="HYRULE CONQUISTATA" bg={RED} fg="#FFF8E8" size={42} rot={2} until={at('ocarina', 3, 0.2)} />
      {(() => {
        const t0 = at('ocarina', 3, 0.1);
        if (T < t0 || T > end('ocarina') + 0.4) return null;
        const p = seg(T, t0, t0 + 1.2);
        return (
          <g transform={`translate(${N.link[0] + 120} ${N.link[1] - 150}) scale(${pop(T, t0) * 1.2})`} opacity={1 - seg(T, end('ocarina'), end('ocarina') + 0.4)}>
            <circle r="36" fill="#FBF3DE" stroke={INK} strokeWidth="5" />
            <path d="M-13 -20 H13 M-13 20 H13 M-10 -20 Q-10 -3 0 0 Q10 -3 10 -20 M-10 20 Q-10 3 0 0 Q10 3 10 20" stroke={INK} strokeWidth="3.5" fill="none" strokeLinejoin="round" />
            <path d={`M-7 ${-17 + 10 * p} H7 L0 -2 Z`} fill={GOLD} />
            <path d={`M-8 18 H8 L0 ${18 - 12 * p} Z`} fill={GOLD} />
            {!WIDEV && <text x="50" y="12" fontFamily={HAND} fontWeight={700} fontSize={44} fill="#FFE08A" stroke={OUT} strokeWidth="8" paintOrder="stroke">7 anni</text>}
          </g>
        );
      })()}
      {flash > 0 && <rect x="-3000" y="-5000" width="8000" height="16000" fill="#FFF8DC" opacity={flash * 0.55} />}
      <Tratto T={T} t0={win - 0.5} a={[N.link[0] + 60, N.link[1] - 10]} b={[N.ganon[0] - 66, N.ganon[1] - 4]} c={[540, 1160]} color="#FFF8E8" w={10} arrow label="lo sconfigge" ly={-30} size={50} dur={0.5} fade={off('ocarina')} />
      <Sigillo x={N.ganon[0] - 44} y={N.ganon[1] + 38} t={T} t0={win + 0.2} s={0.8}>
        <path d="M0 -20 L18 12 H-18 Z" fill="none" stroke="#5A1410" strokeWidth="4" strokeLinejoin="round" />
      </Sigillo>

      {/* ---- capitolo 5: l'ocarina, indietro nel tempo; il filo scende al bivio e si divide */}
      {(() => {
        const t0 = at('bivio', 0, 0.3);
        if (T < t0 || T > end('bivio') + 0.5) return null;
        const fade = 1 - seg(T, at('bivio', 1, 0.6), at('bivio', 1, 1.2));
        return (
          <g opacity={fade}>
            <g transform={`translate(${N.zelda[0] - 90} ${N.zelda[1] - 120}) scale(${pop(T, t0) * 1.1})`}>
              <circle r="40" fill="#FBF3DE" stroke={INK} strokeWidth="5" />
              <Ocarina s={0.85} />
            </g>
            <Tratto T={T} t0={t0 + 0.3} a={[N.zelda[0] - 140, N.zelda[1] - 130]} b={[N.link[0] + 30, N.link[1] - 84]} c={[340, 1000]} color={TIME} dashed w={11} arrow flow label="indietro nel tempo" ly={-34} size={46} dur={0.9} />
          </g>
        );
      })()}
      {trunkLow > 0.95 && (
        <g transform={`translate(${FORK[0]} ${FORK[1]}) scale(${pop(T, at('bivio', 1, 1.2)) * 1.4})`}>
          <Glow id="zm-fork" x={0} y={0} r={120} t={T} color="#FFE08A" amp={0.15} rate={3} opacity={0.8} />
          <circle r="26" fill={GOLD} stroke={INK} strokeWidth="6" />
          <circle r="10" fill="#FFFBE6" />
        </g>
      )}
      <Ring T={T} x={FORK[0]} y={FORK[1]} r={90} on={focus(at('bivio', 1, 1.3), at('bivio', 3, 0.2))} />
      <Tag T={T} t0={at('bivio', 1, 1.4)} x={790} y={FORK[1] - 150} text="IL BIVIO" bg={RED} fg="#FFF8E8" size={44} rot={3} until={at('bivio', 3, 0.3)} />
      {(() => {
        const o = focus(at('bivio', 3, 0.1), end('bivio') - 0.1);
        if (o <= 0) return null;
        const k = fit(70);
        return (
          <g opacity={o} fontFamily={HAND} fontWeight={700} fontSize={k} stroke={OUT} strokeWidth="12" paintOrder="stroke" textAnchor="middle">
            <text x={P('sigillato', 540, 0)[0]} y={2 * H - 120} fill="#FF7A6A">perde</text>
            <text x={540} y={2 * H - 120} fill="#8AC4FF">vince</text>
            <text x={P('crepuscolo', 540, 0)[0]} y={2 * H - 120} fill="#FFC060">vince</text>
          </g>
        );
      })()}

      {/* ---- capitoli 6–8: cartellini e cartigli dei tre mondi */}
      {([
        ['sigillato', 'sconfitta', RED, 'A LINK TO THE PAST', 'IL PRIMO ZELDA · 1986'],
        ['sommerso', 'mare', BLUE, 'WIND WAKER', 'UNA TERRA NUOVA'],
        ['crepuscolo', 'crepuscolo', AMBER, "MAJORA'S MASK", 'TWILIGHT PRINCESS'],
      ] as [Luogo, string, string, string, string][]).map(([k, ch, col, g1, g2]) => (
        <g key={k}>
          <Cartiglio T={T} t0={ch === 'mare' ? at(ch, 2, 0.3) : ch === 'sconfitta' ? at(ch, 3, 0.2) : at(ch, 2, 0.1)} x={C(k).x} y={LUOGHI[k][1] + 1120} w={420} text={g1} color={col} until={end(ch) - 0.3} />
          <Cartiglio T={T} t0={ch === 'mare' ? at(ch, 3, 0.6) : ch === 'sconfitta' ? at(ch, 3, 1.4) : at(ch, 2, 1.0)} x={C(k).x} y={LUOGHI[k][1] + 1205} w={420} text={g2} color={col} until={end(ch) - 0.3} />
        </g>
      ))}
      <Tag T={T} t0={at('sconfitta', 0, 0.3)} x={C('sigillato').x} y={LUOGHI.sigillato[1] + 560} text="LINK PERDE" bg={RED} fg="#FFF8E8" size={44} rot={-3} until={at('sconfitta', 1, 0.2)} />
      <Tag T={T} t0={at('sconfitta', 2, 1.4)} x={C('sigillato').x} y={LUOGHI.sigillato[1] + 560} text="SIGILLATO" bg={GOLD} size={44} rot={2} until={end('sconfitta') - 0.2} />
      <Tag T={T} t0={at('mare', 0, 0.6)} x={540} y={LUOGHI.sommerso[1] + 860} text="NESSUN EROE" bg="#FBF3DE" size={44} rot={-2} until={at('mare', 1, 0.2)} />
      <Tag T={T} t0={at('mare', 1, 0.6)} x={540} y={LUOGHI.sommerso[1] + 860} text="HYRULE SOTT'ACQUA" bg={BLUE} fg="#FFF8E8" size={42} rot={2} until={end('mare') - 0.2} />
      <Tag T={T} t0={at('crepuscolo', 0, 0.5)} x={C('crepuscolo').x} y={LUOGHI.crepuscolo[1] + 560} text="AVVERTE ZELDA" bg="#FBF3DE" size={44} rot={-2} until={at('crepuscolo', 1, 0.2)} />
      <Tag T={T} t0={at('crepuscolo', 1, 1.0)} x={C('crepuscolo').x} y={LUOGHI.crepuscolo[1] + 560} text="CACCIATO" bg={AMBER} fg="#FFF8E8" size={44} rot={2} until={at('crepuscolo', 3, 0.2)} />
      <Tag T={T} t0={at('crepuscolo', 3, 1.0)} x={C('crepuscolo').x} y={LUOGHI.crepuscolo[1] + 560} text="TORNA" bg={RED} fg="#FFF8E8" size={44} rot={-2} until={end('crepuscolo') - 0.2} />

      {/* ---- capitolo 9: molto dopo; i rami scendono tratteggiati senza sapere da dove; scegli tu */}
      <Cartiglio T={T} t0={at('dopo', 0, 0.3)} x={540} y={LUOGHI.dopo[1] + 1120} w={520} text="BREATH OF THE WILD" color={INK} />
      <Cartiglio T={T} t0={at('dopo', 0, 1.3)} x={540} y={LUOGHI.dopo[1] + 1205} w={520} text="TEARS OF THE KINGDOM" color={INK} />
      {[-1, 0, 1].map((i) => (
        <Inchiostro key={i} id={`zm-q${i}`} pts={[P(i < 0 ? 'sigillato' : i > 0 ? 'crepuscolo' : 'sommerso', 540, 1700), P('dopo', 540 + i * 360, -120), P('dopo', 540 + i * 120, 420)]}
          p={eio(seg(T, at('dopo', 2, 0.1 + (i + 1) * 0.2), at('dopo', 2, 1.4 + (i + 1) * 0.2)))} t={T} w={14} color={BCOL[i + 1]} dash="30 24" nib={false} />
      ))}
      {(() => {
        const t0 = at('dopo', 2, 1.2);
        if (T < t0) return null;
        const [qx, qy] = P('dopo', 540, 300);
        return (
          <g>
            <Ring T={T} x={qx} y={qy - 40} r={150} on={focus(t0, at('dopo', 3, 0.8))} w={14} />
            <g transform={`translate(${qx} ${qy}) rotate(${Math.sin(T * 3) * 5}) scale(${pop(T, t0)})`}>
              <text y="40" textAnchor="middle" fontFamily={CINZEL} fontWeight={700} fontSize={fit(180)} fill="#FF5A4A" stroke={OUT} strokeWidth="14" paintOrder="stroke">?</text>
            </g>
          </g>
        );
      })()}
      <Tag T={T} t0={at('dopo', 3, 0.3)} x={540} y={LUOGHI.dopo[1] + 640} text="SCEGLI TU" bg={GOLD} size={52} rot={-2} until={end('dopo') + 1} />
    </g>
  );
};

const r2 = rng(2026);
const MOTES = Array.from({ length: 20 }, () => ({ x: r2() * 1080, y: r2() * 1920, s: 1.5 + r2() * 3, v: 4 + r2() * 10, ph: r2() * 6 }));

export const makeMondo = (chapterId: string): React.FC<SceneProps> => {
  const Scene: React.FC<SceneProps> = ({ t }) => {
    const T = STARTS[chapterId] + t;
    const cam = camAt(T);
    UI_K = Math.max(1, 0.9 / cam.z);
    WIDEV = cam.z < 0.38;
    return (
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <FxDefs id="zm" />
          <linearGradient id="zm-scrim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0A0E1E" stopOpacity=".82" />
            <stop offset=".7" stopColor="#0A0E1E" stopOpacity=".45" />
            <stop offset="1" stopColor="#0A0E1E" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g transform={`translate(540 960) scale(${cam.z}) translate(${-cam.x} ${-cam.y})`}>
          <Mondo T={T} cam={cam} />
        </g>
        <rect width="1080" height="560" fill="url(#zm-scrim)" />
        <NearMotes id="zm-near" t={T} n={6} color="#FFF4D0" opacity={0.1} />
        {MOTES.map((m, i) => (
          <circle key={i} cx={mod(m.x + Math.sin(T * 0.5 + m.ph) * 30, 1080)} cy={mod(m.y - T * m.v, 1920)} r={m.s} fill="#FFE9A0" opacity={0.2 + 0.12 * Math.sin(T * 2 + m.ph)} />
        ))}
        <Finish id="zm" tint="#2A3A20" tintOpacity={0.06} />
      </svg>
    );
  };
  return Scene;
};

export { Stars };
