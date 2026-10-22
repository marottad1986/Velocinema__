import React from 'react';
import { clamp01, eo, eob, lerp, rng, seg } from './anim';
import { HAND } from './fonts';

// Schizzi a mano sopra le opere (QUADRI.md): frecce, cerchi, scritte e schede disegnate che spiegano i dettagli.
// Tutto nello spazio dello schermo (1080×1920) dentro <Schizzi>; i punti dell'opera si portano sullo schermo
// con `proietta` (src/lib/quadro.tsx). Il tratto "vibra" 8 volte al secondo come un disegno animato a mano.

export type Pt = { x: number; y: number };

export const INK = '#1B1B22';
export const CHALK = '#FFF4D6';
export const GIALLO = '#FFD23F';
export const CARTA = '#FBF6E8';

/** Tremolio del tratto: scostamento deterministico che cambia 8 volte al secondo. */
const boil = (t: number, seed: number, amp = 2.2) => {
  const r = rng(seed * 7919 + Math.floor(t * 8) * 31 + 1);
  return { dx: (r() - 0.5) * 2 * amp, dy: (r() - 0.5) * 2 * amp, rot: (r() - 0.5) * 1.2 };
};

/** Comparsa con rimbalzo (0 → 1, con un piccolo eccesso) e uscita morbida opzionale. */
const pop = (t: number, da: number, a?: number) => {
  const s = da === undefined ? 1 : eob(seg(t, da, da + 0.45), 1.9);
  const out = a === undefined ? 1 : 1 - eo(seg(t, a, a + 0.35));
  return { s: Math.max(0, s) * out, o: clamp01((t - da) / 0.12) * out };
};

/** Tratto doppio: contorno scuro sotto, colore sopra; `p` = quanto del tratto è disegnato (0–1). */
const Tratto: React.FC<{ d: string; p: number; color: string; w: number; o?: number }> = ({ d, p, color, w, o = 1 }) =>
  p <= 0 ? null : (
    <g opacity={o} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} pathLength={1} stroke={INK} strokeWidth={w + 7} strokeDasharray={`${p} 2`} />
      <path d={d} pathLength={1} stroke={color} strokeWidth={w} strokeDasharray={`${p} 2`} />
    </g>
  );

/** Punta di freccia in `end`, orientata come il vettore `dir`. */
const Punta: React.FC<{ end: Pt; dir: Pt; color: string; w: number; s: number }> = ({ end, dir, color, w, s }) => {
  if (s <= 0) return null;
  const len = Math.hypot(dir.x, dir.y) || 1;
  const ux = dir.x / len, uy = dir.y / len;
  const L = 34 * s;
  const a = (k: number) => `M${end.x - L * (ux * Math.cos(0.5) - k * uy * Math.sin(0.5))} ${end.y - L * (uy * Math.cos(0.5) + k * ux * Math.sin(0.5))} L${end.x} ${end.y}`;
  const d = `${a(1)} ${a(-1)}`;
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={w + 7} />
      <path d={d} stroke={color} strokeWidth={w} />
    </g>
  );
};

/** Freccia curva disegnata a mano da `from` a `to` (si ferma `gap` px prima); `curva` = rigonfiamento in px. */
export const Freccia: React.FC<{ t: number; da: number; a?: number; from: Pt; to: Pt; curva?: number; gap?: number; color?: string; w?: number; seed?: number; dur?: number }> = ({
  t, da, a, from, to, curva = 80, gap = 30, color = CHALK, w = 9, seed = 1, dur = 0.55,
}) => {
  if (t < da) return null;
  const b = boil(t, seed);
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
  const dx = to.x - from.x, dy = to.y - from.y;
  const L = Math.hypot(dx, dy) || 1;
  const c = { x: mx - (dy / L) * curva + b.dx, y: my + (dx / L) * curva + b.dy };
  const ex = to.x - ((to.x - c.x) / Math.hypot(to.x - c.x, to.y - c.y)) * gap;
  const ey = to.y - ((to.y - c.y) / Math.hypot(to.x - c.x, to.y - c.y)) * gap;
  const p = eo(seg(t, da, da + dur));
  const out = a === undefined ? 1 : 1 - seg(t, a, a + 0.3);
  return (
    <g opacity={out}>
      <Tratto d={`M${from.x + b.dx} ${from.y + b.dy} Q${c.x} ${c.y} ${ex} ${ey}`} p={p} color={color} w={w} />
      <Punta end={{ x: ex, y: ey }} dir={{ x: ex - c.x, y: ey - c.y }} color={color} w={w} s={eob(seg(t, da + dur * 0.85, da + dur + 0.25), 2)} />
    </g>
  );
};

/** Freccia che gira intorno a un punto (vortici): arco di `giro` gradi da `ang0`. */
export const FrecciaGiro: React.FC<{ t: number; da: number; a?: number; c: Pt; r: number; ang0?: number; giro?: number; color?: string; w?: number; seed?: number; verso?: 1 | -1 }> = ({
  t, da, a, c, r, ang0 = -60, giro = 290, color = CHALK, w = 9, seed = 3, verso = 1,
}) => {
  if (t < da) return null;
  const b = boil(t, seed);
  const p = eo(seg(t, da, da + 0.8));
  const n = 40;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const ang = ((ang0 + verso * giro * (i / n)) * Math.PI) / 180;
    const rr = r * (1 - 0.18 * (i / n)); // spirale: si stringe un poco
    pts.push({ x: c.x + b.dx + rr * Math.cos(ang), y: c.y + b.dy + rr * Math.sin(ang) * 0.92 });
  }
  const d = 'M' + pts.map((q) => `${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(' L');
  const k = Math.max(1, Math.round(p * n));
  const end = pts[k], prev = pts[k - 1];
  const out = a === undefined ? 1 : 1 - seg(t, a, a + 0.3);
  return (
    <g opacity={out}>
      <Tratto d={d} p={p} color={color} w={w} />
      <Punta end={end} dir={{ x: end.x - prev.x, y: end.y - prev.y }} color={color} w={w} s={eob(seg(t, da + 0.6, da + 1.0), 2)} />
    </g>
  );
};

/** Freccia lungo un percorso di punti (es. lungo il cipresso), tratteggiata. */
export const Percorso: React.FC<{ t: number; da: number; a?: number; punti: Pt[]; color?: string; w?: number; seed?: number; dur?: number }> = ({
  t, da, a, punti, color = GIALLO, w = 8, seed = 5, dur = 1.2,
}) => {
  if (t < da || punti.length < 2) return null;
  const b = boil(t, seed, 1.5);
  const P = punti.map((q) => ({ x: q.x + b.dx, y: q.y + b.dy }));
  let d = `M${P[0].x} ${P[0].y}`;
  for (let i = 1; i < P.length - 1; i++) d += ` Q${P[i].x} ${P[i].y} ${(P[i].x + P[i + 1].x) / 2} ${(P[i].y + P[i + 1].y) / 2}`;
  const last = P[P.length - 1], prev = P[P.length - 2];
  d += ` L${last.x} ${last.y}`;
  const p = eo(seg(t, da, da + dur));
  const out = a === undefined ? 1 : 1 - seg(t, a, a + 0.3);
  return (
    <g opacity={out}>
      <Tratto d={d} p={p} color={color} w={w} />
      <Punta end={last} dir={{ x: last.x - prev.x, y: last.y - prev.y }} color={color} w={w} s={eob(seg(t, da + dur * 0.9, da + dur + 0.3), 2)} />
    </g>
  );
};

/** Cerchio scarabocchiato intorno a un punto (poco più di un giro, raggio irregolare). */
export const Cerchio: React.FC<{ t: number; da: number; a?: number; c: Pt; rx: number; ry?: number; color?: string; w?: number; seed?: number }> = ({
  t, da, a, c, rx, ry = rx, color = GIALLO, w = 8, seed = 7,
}) => {
  if (t < da) return null;
  const b = boil(t, seed, 1.8);
  const r = rng(seed);
  const n = 48;
  const k1 = 0.05 + r() * 0.05, ph = r() * 6;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const ang = -2.2 + u * Math.PI * 2 * 1.12;
    const j = 1 + k1 * Math.sin(ang * 2 + ph) + 0.06 * u;
    d += `${i ? 'L' : 'M'}${(c.x + b.dx + rx * j * Math.cos(ang)).toFixed(1)} ${(c.y + b.dy + ry * j * Math.sin(ang)).toFixed(1)} `;
  }
  const out = a === undefined ? 1 : 1 - seg(t, a, a + 0.3);
  return <Tratto d={d} p={eo(seg(t, da, da + 0.5))} color={color} w={w} o={out} />;
};

/** Scritta a mano con rimbalzo d'entrata. */
export const Scritta: React.FC<{ t: number; da: number; a?: number; at: Pt; testo: string; size?: number; color?: string; rot?: number; anchor?: 'start' | 'middle' | 'end'; seed?: number }> = ({
  t, da, a, at, testo, size = 72, color = CHALK, rot = -4, anchor = 'middle', seed = 9,
}) => {
  if (t < da) return null;
  const { s, o } = pop(t, da, a);
  const b = boil(t, seed, 1.2);
  return (
    <g opacity={o} transform={`translate(${at.x + b.dx} ${at.y + b.dy}) rotate(${rot + b.rot}) scale(${s})`}>
      <text textAnchor={anchor} dominantBaseline="middle" fontFamily={HAND} fontWeight={700} fontSize={size} fill={color}
        stroke={INK} strokeWidth={size * 0.16} strokeLinejoin="round" paintOrder="stroke">
        {testo}
      </text>
    </g>
  );
};

/** Scheda di carta con nastro adesivo e un disegno dentro (coordinate locali 0..w, 0..h). */
export const Scheda: React.FC<{ t: number; da: number; a?: number; at: Pt; w: number; h: number; rot?: number; seed?: number; children: React.ReactNode }> = ({
  t, da, a, at, w, h, rot = -4, seed = 11, children,
}) => {
  if (t < da) return null;
  const { s, o } = pop(t, da, a);
  const b = boil(t, seed, 1.2);
  return (
    <g opacity={o} transform={`translate(${at.x + b.dx} ${at.y + b.dy}) rotate(${rot + b.rot}) scale(${s}) translate(${-w / 2} ${-h / 2})`}>
      <rect x="10" y="14" width={w} height={h} rx="10" fill="#000" opacity=".35" />
      <rect width={w} height={h} rx="10" fill={CARTA} stroke={INK} strokeWidth="6" />
      <rect x={w / 2 - 60} y="-18" width="120" height="36" fill="#F3E3A0" opacity=".85" transform={`rotate(-3 ${w / 2} 0)`} />
      {children}
    </g>
  );
};

/** Stellina scarabocchiata (scintilla) che pulsa. */
export const Scintilla: React.FC<{ t: number; da: number; at: Pt; r?: number; color?: string; seed?: number }> = ({ t, da, at, r = 26, color = GIALLO, seed = 13 }) => {
  if (t < da) return null;
  const { s } = pop(t, da);
  const k = s * (0.85 + 0.15 * Math.sin((t - da) * 6 + seed));
  const d = `M0 ${-r} L0 ${r} M${-r} 0 L${r} 0 M${-r * 0.55} ${-r * 0.55} L${r * 0.55} ${r * 0.55} M${r * 0.55} ${-r * 0.55} L${-r * 0.55} ${r * 0.55}`;
  return (
    <g transform={`translate(${at.x} ${at.y}) scale(${k}) rotate(${(t - da) * 40})`} fill="none" strokeLinecap="round">
      <path d={d} stroke={INK} strokeWidth="13" />
      <path d={d} stroke={color} strokeWidth="6" />
    </g>
  );
};

/** Cuoricino disegnato. */
export const Cuore: React.FC<{ t: number; da: number; at: Pt; r?: number; color?: string }> = ({ t, da, at, r = 30, color = '#FF6B8B' }) => {
  if (t < da) return null;
  const { s } = pop(t, da);
  const fl = Math.sin((t - da) * 2.5) * 10;
  return (
    <g transform={`translate(${at.x} ${at.y - (t - da) * 18}) rotate(${fl}) scale(${s * r / 30})`}>
      <path d="M0 26 C-34 2 -30 -26 -14 -28 C-6 -29 -1 -22 0 -16 C1 -22 6 -29 14 -28 C30 -26 34 2 0 26 Z" fill={color} stroke={INK} strokeWidth="6" strokeLinejoin="round" />
    </g>
  );
};

/** Contenitore SVG a tutto schermo per gli schizzi. */
export const Schizzi: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
    {children}
  </svg>
);

/** Interpolazione di un punto (per far seguire a uno schizzo un movimento). */
export const lerpPt = (a: Pt, b: Pt, p: number): Pt => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) });
