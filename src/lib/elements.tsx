import React from 'react';
import { lerp, mod, rng, seg } from './anim';

// Libreria di elementi animati riutilizzabili (QUALITA.md §2 luce, §5 particelle).
// Regole comuni:
// - ogni elemento è funzione pura di t (secondi) e di un seme: stesso fotogramma a ogni render;
// - ogni elemento con gradienti riceve un `id` unico nella scena e dichiara da solo i propri <defs>;
// - niente filtri né sfocature: aloni e sfumature sono gradienti radiali/lineari;
// - la parallasse la decide la scena: metti l'elemento dentro il gruppo del piano giusto (cam.layer(f)).

type Pt = { x: number; y: number };
const pulse01 = (t: number, rate: number, ph = 0) => 0.5 + 0.5 * Math.sin(t * rate + ph);

// ─────────────────────────────── LUCE ───────────────────────────────

/** Alone radiale che pulsa leggermente: per lampade, finestre, fuochi, lampioni, schermi. */
export const Glow: React.FC<{
  id: string; x: number; y: number; r: number; t: number; color: string;
  /** ampiezza della pulsazione (0 = fissa) */ amp?: number; rate?: number; ph?: number; opacity?: number;
}> = ({ id, x, y, r, t, color, amp = 0.08, rate = 2, ph = 0, opacity = 0.7 }) => {
  const k = 1 + amp * Math.sin(t * rate + ph);
  return (
    <g>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={color} stopOpacity=".95" />
          <stop offset=".45" stopColor={color} stopOpacity=".35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r * k} fill={`url(#${id})`} opacity={opacity * (0.85 + 0.15 * k)} />
    </g>
  );
};

/**
 * Fascio di luce che sfuma a zero: faro, riflettore, torcia, proiettore, raggio da finestra.
 * `angle` in gradi (0 = verso destra, 90 = verso il basso). `sweep` > 0 lo fa ruotare avanti e indietro
 * di ±sweep gradi; `spin` lo fa girare come un faro (scaleX = cos), con intensità che pulsa al passaggio.
 */
export const Beam: React.FC<{
  id: string; x: number; y: number; t: number; length: number; spread: number; color: string;
  angle?: number; sweep?: number; sweepRate?: number; spin?: number; opacity?: number;
}> = ({ id, x, y, t, length, spread, color, angle = 180, sweep = 0, sweepRate = 0.6, spin = 0, opacity = 0.6 }) => {
  const a = angle + sweep * Math.sin(t * sweepRate);
  const sx = spin ? Math.cos(t * spin) : 1;
  const o = spin ? opacity * (0.45 + 0.55 * Math.abs(sx)) : opacity;
  return (
    <g transform={`translate(${x} ${y}) rotate(${a}) scale(${sx} 1)`} opacity={o}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={color} stopOpacity=".85" />
          <stop offset=".6" stopColor={color} stopOpacity=".25" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M0 -6 L${length} ${-spread / 2} L${length} ${spread / 2} L0 6 Z`} fill={`url(#${id})`} />
    </g>
  );
};

/** Raggi del sole che ruotano lentamente intorno a (x, y). */
export const SunRays: React.FC<{ id: string; x: number; y: number; t: number; color?: string; n?: number; length?: number; width?: number; from?: number; to?: number; opacity?: number }> = ({
  id, x, y, t, color = '#FFE7A0', n = 9, length = 1000, width = 68, from = -80, to = 80, opacity = 0.55,
}) => (
  <g transform={`rotate(${t * 3} ${x} ${y})`} opacity={opacity * (0.85 + 0.15 * Math.sin(t * 1.5))}>
    <defs>
      <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor={color} stopOpacity=".35" />
        <stop offset=".4" stopColor={color} stopOpacity=".12" />
        <stop offset="1" stopColor={color} stopOpacity="0" />
      </linearGradient>
    </defs>
    {Array.from({ length: n }, (_, i) => (
      <path key={i} d={`M${x} ${y} L${x - width / 2} ${y - length} L${x + width / 2} ${y - length} Z`} transform={`rotate(${lerp(from, to, n > 1 ? i / (n - 1) : 0.5)} ${x} ${y})`} fill={`url(#${id})`} />
    ))}
  </g>
);

/**
 * Intensità dei lampi (0..1) per una lista di istanti: picco in 0,06 s e coda di ~0,5 s.
 * QUALITA §2: al massimo due lampi per scena (la funzione ignora gli altri).
 */
export const flashAt = (t: number, times: number[], strength: number[] = [1, 0.75]) =>
  times.slice(0, 2).reduce((acc, s, i) => Math.max(acc, (strength[i] ?? 1) * seg(t, s, s + 0.06) * (1 - seg(t, s + 0.15, s + 0.7))), 0);

/** Fulmine a zig-zag (visibile solo durante il lampo). */
export const Lightning: React.FC<{ x: number; y: number; h: number; flash: number; seed?: number; color?: string; width?: number }> = ({ x, y, h, flash, seed = 7, color = '#F4FBFF', width = 7 }) => {
  if (flash <= 0.01) return null;
  const r = rng(seed);
  let d = `M${x} ${y}`;
  let cx = x;
  for (let i = 1; i <= 6; i++) {
    cx += (r() - 0.5) * 90;
    d += ` L${cx.toFixed(0)} ${(y + (h * i) / 6).toFixed(0)}`;
  }
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" opacity={flash} />;
};

// ─────────────────────────────── CIELO ───────────────────────────────

/** Stelle che brillano a ritmi diversi in un'area. `appear` > 0: compaiono una alla volta nei primi `appear` secondi. */
export const Stars: React.FC<{ t: number; seed?: number; n?: number; x?: number; y?: number; w?: number; h?: number; color?: string; size?: number; appear?: number }> = ({
  t, seed = 1, n = 30, x = -60, y = 100, w = 1200, h = 700, color = '#E9F0F2', size = 1, appear = 0,
}) => {
  const r = rng(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const sx = x + r() * w, sy = y + r() * h, s = (1.5 + r() * 3) * size, rate = 1 + r() * 2.5, ph = r() * 6;
        const on = appear > 0 ? seg(t, (i / n) * appear, (i / n) * appear + 0.4) : 1;
        return <circle key={i} cx={sx} cy={sy} r={s} fill={color} opacity={on * (0.15 + 0.7 * pulse01(t, rate, ph))} />;
      })}
    </g>
  );
};

/** Luna con alone e crateri. */
export const Moon: React.FC<{ id: string; x: number; y: number; r?: number; t: number; color?: string; halo?: string }> = ({ id, x, y, r = 62, t, color = '#EEF4F5', halo = '#DDEBEE' }) => (
  <g>
    <Glow id={id} x={x} y={y} r={r * 3.7} t={t} color={halo} amp={0.05} rate={1.2} opacity={0.5} />
    <circle cx={x} cy={y} r={r} fill={color} />
    <path d={`M${x - r} ${y} a${r} ${r} 0 0 0 ${2 * r} 0 a${r} ${r * 0.8} 0 0 1 ${-2 * r} 0`} fill="#C9D8DC" opacity=".55" />
    <circle cx={x + r * 0.3} cy={y - r * 0.26} r={r * 0.19} fill="#D2DFE2" />
    <circle cx={x - r * 0.35} cy={y + r * 0.22} r={r * 0.13} fill="#D2DFE2" />
    <circle cx={x + r * 0.13} cy={y + r * 0.42} r={r * 0.08} fill="#D2DFE2" />
  </g>
);

/** Banco di nubi morbide (ellissi con gradiente radiale) che deriva piano. */
export const Clouds: React.FC<{ id: string; t: number; color: string; seed?: number; n?: number; y?: number; h?: number; speed?: number; opacity?: number }> = ({
  id, t, color, seed = 3, n = 3, y = 250, h = 200, speed = 0.3, opacity = 0.9,
}) => {
  const r = rng(seed);
  return (
    <g opacity={opacity} transform={`translate(${Math.sin(t * speed) * 30} 0)`}>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={color} stopOpacity="1" />
          <stop offset=".7" stopColor={color} stopOpacity=".7" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: n }, (_, i) => (
        <ellipse key={i} cx={-100 + (i + r() * 0.6) * (1300 / n)} cy={y + r() * h} rx={340 + r() * 140} ry={90 + r() * 60} fill={`url(#${id})`} />
      ))}
    </g>
  );
};

/** Stella cadente che attraversa il cielo tra `at` e `at + 0,9` s. */
export const ShootingStar: React.FC<{ id: string; t: number; at: number; from: Pt; to: Pt; color?: string }> = ({ id, t, at, from, to, color = '#FFFFFF' }) => {
  const p = seg(t, at, at + 0.9);
  if (p <= 0 || p >= 1) return null;
  const hx = lerp(from.x, to.x, p), hy = lerp(from.y, to.y, p);
  const tx = lerp(from.x, to.x, Math.max(0, p - 0.25)), ty = lerp(from.y, to.y, Math.max(0, p - 0.25));
  return (
    <g opacity={Math.sin(p * Math.PI)}>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={tx} y1={ty} x2={hx} y2={hy}>
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="1" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <path d={`M${tx} ${ty} L${hx} ${hy}`} stroke={`url(#${id})`} strokeWidth="5" strokeLinecap="round" />
      <circle cx={hx} cy={hy} r="5" fill={color} />
    </g>
  );
};

/** Gabbiani in volo con battito d'ali, da sinistra a destra (ciclo di `period` s). */
export const Gulls: React.FC<{ t: number; seed?: number; n?: number; y?: number; h?: number; color?: string; size?: number; period?: number }> = ({
  t, seed = 5, n = 3, y = 600, h = 140, color = '#0B1418', size = 1, period = 14,
}) => {
  const r = rng(seed);
  return (
    <g fill="none" stroke={color} strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => {
        const s = size * (0.8 + r() * 0.6), ph = r(), gy = y + r() * h, rate = 7 + r() * 2;
        const flap = 0.9 + 0.6 * Math.sin(t * rate + i);
        const a = -18 * flap * s;
        const x = lerp(-100, 1180, mod(t / (period * (0.8 + r() * 0.4)) + ph, 1));
        return <path key={i} d={`M${-36 * s} 0 q${18 * s} ${a} ${36 * s} 0 q${18 * s} ${a} ${36 * s} 0`} transform={`translate(${x} ${gy + Math.sin(t * 2 + i) * 16})`} strokeWidth={6 * s} />;
      })}
    </g>
  );
};

// ─────────────────────────────── ACQUA ───────────────────────────────

/** Percorso d'onda periodico (periodo w) da x0 a x1; con `close` chiude il riempimento fino a quella quota. */
export const wave = (y: number, amp: number, w: number, x0 = -400, x1 = 1560, close?: number) => {
  let d = `M${x0} ${y}`;
  for (let x = x0; x < x1; x += w) d += ` q${w / 4} ${-amp} ${w / 2} 0 q${w / 4} ${amp} ${w / 2} 0`;
  if (close !== undefined) d += ` V${close} H${x0} Z`;
  return d;
};

/** Fascia d'acqua piena che scorre (con linea di schiuma sulla cresta). */
export const WaveBand: React.FC<{ t: number; y: number; fill: string; foam?: string; amp?: number; w?: number; speed?: number; bob?: number; ph?: number; foamWidth?: number; foamOpacity?: number }> = ({
  t, y, fill, foam, amp = 18, w = 320, speed = 100, bob = 10, ph = 0, foamWidth = 6, foamOpacity = 0.6,
}) => {
  const tr = `translate(${-mod(t * speed, w)} ${Math.sin(t * 1.8 + ph) * bob})`;
  return (
    <g transform={tr}>
      <path d={wave(y, amp, w, -400, 1600, 2400)} fill={fill} />
      {foam && <path d={wave(y, amp, w, -400, 1600)} fill="none" stroke={foam} strokeWidth={foamWidth} strokeLinecap="round" opacity={foamOpacity} />}
    </g>
  );
};

/** Linee d'onda sottili che scorrono sulla superficie del mare. */
export const WaveLines: React.FC<{ t: number; ys: number[]; color: string; amp?: number; w?: number; speed?: number; width?: number; opacity?: number }> = ({
  t, ys, color, amp = 8, w = 260, speed = 40, width = 4, opacity = 0.5,
}) => (
  <g fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" opacity={opacity}>
    {ys.map((y, i) => (
      <path key={i} d={wave(y, amp + i * 2, w + i * 40)} transform={`translate(${-mod(t * (speed + i * 15), w + i * 40) - i * 70} 0)`} />
    ))}
  </g>
);

/** Colonna di riflessi tremolanti sotto una luce (luna, sole, lampione, insegna). */
export const Reflection: React.FC<{ t: number; x: number; y: number; color: string; n?: number; w?: number; gap?: number; opacity?: number }> = ({ t, x, y, color, n = 10, w = 70, gap = 26, opacity = 0.5 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const ww = (w - i * (w / n) * 0.6) * (0.55 + 0.45 * Math.sin(t * 3 + i * 1.7));
      return <rect key={i} x={x - ww / 2 + Math.sin(t * 1.3 + i) * 10} y={y + i * gap} width={ww} height="5" rx="2.5" fill={color} opacity={opacity * (1 - i / (n * 1.4))} />;
    })}
  </g>
);

/** Pioggia: `far` sottile e lenta, `near` spessa e veloce (QUALITA §5). Si ripete senza salti. */
export const Rain: React.FC<{ t: number; level: 'far' | 'near'; seed?: number; color?: string; opacity?: number; angle?: number; x?: number; y?: number; w?: number; h?: number }> = ({
  t, level, seed = 11, color, opacity, angle, x = -150, y = -200, w = 1400, h = 2300,
}) => {
  const near = level === 'near';
  const len = near ? 140 : 55, dx = angle ?? (near ? 40 : 16), n = near ? 30 : 60, speed = near ? 1300 : 520, tile = 600;
  const r = rng(seed);
  let d = '';
  for (let i = 0; i < n; i++) d += `M${(x + r() * w).toFixed(0)} ${(r() * tile).toFixed(0)} l${-dx} ${len} `;
  const off = mod(t * speed, tile);
  const rows = Math.ceil(h / tile) + 1;
  return (
    <g stroke={color ?? (near ? '#CFE3E8' : '#9CC3CA')} strokeWidth={near ? 5 : 3} strokeLinecap="round" opacity={opacity ?? (near ? 0.5 : 0.3)}>
      {Array.from({ length: rows }, (_, k) => (
        <path key={k} d={d} transform={`translate(${-(off * dx) / len} ${y + (k - 1) * tile + off})`} />
      ))}
    </g>
  );
};

/** Goccia che si forma, cade e fa un'increspatura (periodo `period`, più gocce sfasate). */
export const Drips: React.FC<{ t: number; x: number; y0: number; y1: number; n?: number; period?: number; color?: string; ripple?: number }> = ({
  t, x, y0, y1, n = 3, period = 2.4, color = '#B9D6DB', ripple = 110,
}) => (
  <g>
    {Array.from({ length: n }, (_, k) => {
      const p = mod(t + (k * period) / n, period) / period;
      const fall = seg(p, 0.15, 0.55);
      const rip = seg(p, 0.55, 1);
      return (
        <g key={k}>
          {p < 0.15 && <ellipse cx={x} cy={y0 + 4} rx={3 + p * 25} ry={4 + p * 35} fill={color} opacity=".8" />}
          {fall > 0 && fall < 1 && <ellipse cx={x} cy={lerp(y0, y1, fall * fall)} rx="6" ry="10" fill={color} opacity=".85" />}
          {rip > 0 && <ellipse cx={x} cy={y1} rx={10 + rip * ripple} ry={2 + rip * ripple * 0.18} fill="none" stroke={color} strokeWidth="3" opacity={(1 - rip) * 0.8} />}
        </g>
      );
    })}
  </g>
);

/** Gocce che scivolano su un vetro (dentro il rettangolo x,y,w,h), con scia. */
export const GlassDrops: React.FC<{ t: number; x: number; y: number; w: number; h: number; seed?: number; n?: number; color?: string }> = ({ t, x, y, w, h, seed = 13, n = 10, color = '#CFE3E8' }) => {
  const r = rng(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const gx = x + r() * w, sp = 0.15 + r() * 0.3, ph = r(), s = 4 + r() * 5;
        const p = mod(t * sp + ph, 1);
        const gy = y + p * p * h;
        return (
          <g key={i} opacity={Math.sin(p * Math.PI)}>
            <path d={`M${gx} ${Math.max(y, gy - 80 * p)} L${gx + Math.sin(i) * 4} ${gy}`} stroke={color} strokeWidth={s * 0.5} strokeLinecap="round" opacity=".35" />
            <ellipse cx={gx + Math.sin(i) * 4} cy={gy} rx={s * 0.8} ry={s} fill={color} opacity=".75" />
          </g>
        );
      })}
    </g>
  );
};

// ─────────────────────────── ARIA E PARTICELLE ───────────────────────────

/** Banco di nebbia: ellisse sfumata che deriva lateralmente (usane 2–3 su piani diversi). */
export const Fog: React.FC<{ id: string; t: number; y: number; color?: string; rx?: number; ry?: number; x?: number; drift?: number; speed?: number; ph?: number; opacity?: number }> = ({
  id, t, y, color = '#B9D2D6', rx = 760, ry = 70, x = 540, drift = 90, speed = 0.3, ph = 0, opacity = 0.25,
}) => (
  <g>
    <defs>
      <radialGradient id={id}>
        <stop offset="0" stopColor={color} stopOpacity="1" />
        <stop offset=".6" stopColor={color} stopOpacity=".6" />
        <stop offset="1" stopColor={color} stopOpacity="0" />
      </radialGradient>
    </defs>
    <ellipse cx={x + Math.sin(t * speed + ph) * drift} cy={y} rx={rx} ry={ry} fill={`url(#${id})`} opacity={opacity} />
  </g>
);

/** Fumo/vapore: sbuffi che salgono da (x, y), si allargano e svaniscono. `wind` sposta lateralmente (px a fine corsa). */
export const Smoke: React.FC<{ id: string; t: number; x: number; y: number; color?: string; n?: number; rise?: number; wind?: number; r0?: number; r1?: number; speed?: number; opacity?: number }> = ({
  id, t, x, y, color = '#C3D0D3', n = 10, rise = 220, wind = -280, r0 = 26, r1 = 110, speed = 0.32, opacity = 0.8,
}) => (
  <g>
    <defs>
      <radialGradient id={id}>
        <stop offset="0" stopColor={color} stopOpacity=".95" />
        <stop offset=".55" stopColor={color} stopOpacity=".5" />
        <stop offset="1" stopColor={color} stopOpacity="0" />
      </radialGradient>
    </defs>
    {Array.from({ length: n }, (_, i) => {
      const p = mod(t * speed + i / n, 1);
      return <circle key={i} cx={x + wind * p + Math.sin(p * 6 + i) * 12} cy={y - rise * p} r={lerp(r0, r1, p)} fill={`url(#${id})`} opacity={seg(p, 0, 0.15) * (1 - p) * opacity} />;
    })}
  </g>
);

/** Volute sottili (pipa, sigaretta, tazza): linee ondulate che salgono. */
export const Wisps: React.FC<{ t: number; x: number; y: number; color?: string; n?: number; h?: number; width?: number; opacity?: number }> = ({ t, x, y, color = '#E2EAEC', n = 3, h = 180, width = 5, opacity = 0.55 }) => (
  <g fill="none" stroke={color} strokeWidth={width} strokeLinecap="round">
    {Array.from({ length: n }, (_, i) => {
      const p = mod(t * 0.35 + i / n, 1);
      const sway = Math.sin(t * 1.4 + i * 2) * 16;
      const yy = y - p * 40;
      return (
        <path key={i} d={`M${x} ${yy} c${12 + sway} ${-h * 0.25} ${-18 + sway} ${-h * 0.45} ${sway} ${-h * 0.7} s${10 - sway} ${-h * 0.2} ${-6} ${-h * 0.3}`} opacity={opacity * Math.sin(p * Math.PI)} />
      );
    })}
  </g>
);

/** Lingua di fuoco (path): goccia con lati ondulati e punta che oscilla. */
export const flamePath = (x: number, y: number, w: number, h: number, t: number, ph: number) => {
  const s1 = Math.sin(t * 6.3 + ph), s2 = Math.sin(t * 4.1 + ph * 1.7), s3 = Math.sin(t * 8.7 + ph * 0.6);
  const hh = h * (1 + 0.1 * s3), tx = x + s1 * w * 0.5;
  return (
    `M${x - w} ${y} C${x - w * 1.15} ${y - hh * 0.35} ${x - w * 0.35 + s2 * w * 0.3} ${y - hh * 0.55} ${x - w * 0.25 + s2 * w * 0.2} ${y - hh * 0.72} ` +
    `Q${tx - w * 0.1} ${y - hh * 0.86} ${tx} ${y - hh} Q${x + w * 0.35 + s1 * w * 0.2} ${y - hh * 0.7} ${x + w * 0.55} ${y - hh * 0.5} ` +
    `C${x + w * 1.1} ${y - hh * 0.3} ${x + w * 1.05} ${y - hh * 0.1} ${x + w} ${y} Q${x} ${y + w * 0.35} ${x - w} ${y} Z`
  );
};

/** Fuoco a tre strati (rosso scuro, arancio, giallo) con alone: falò, camino, candela (scale piccola). */
export const Fire: React.FC<{ id: string; t: number; x: number; y: number; scale?: number; outer?: string; mid?: string; core?: string; outline?: string }> = ({
  id, t, x, y, scale = 1, outer = '#D9481E', mid = '#FF8A2C', core = '#FFD86B', outline = '#0B1418',
}) => {
  const tongues: [number, number, number, number][] = [[-34, 30, 120, 0], [-10, 40, 180, 1.4], [16, 36, 150, 2.7], [38, 26, 100, 4]];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <Glow id={id} x={0} y={-70} r={260} t={t} color="#FFB25C" amp={0.12} rate={7} opacity={0.55} />
      {tongues.map(([dx, w, h, ph], i) => <path key={`o${i}`} d={flamePath(dx, 0, w, h, t, ph)} fill={outer} stroke={outline} strokeWidth="6" strokeLinejoin="round" />)}
      {tongues.map(([dx, w, h, ph], i) => <path key={`m${i}`} d={flamePath(dx, 0, w * 0.68, h * 0.72, t, ph + 0.6)} fill={mid} />)}
      {tongues.map(([dx, w, h, ph], i) => <path key={`c${i}`} d={flamePath(dx * 0.8, 0, w * 0.38, h * 0.42, t, ph + 1.2)} fill={core} />)}
    </g>
  );
};

/** Braci e scintille che salgono da una base larga `w` centrata in x. */
export const Embers: React.FC<{ t: number; x: number; y: number; w?: number; h?: number; seed?: number; n?: number; hot?: string; warm?: string; drift?: number }> = ({
  t, x, y, w = 80, h = 600, seed = 21, n = 30, hot = '#FFE08A', warm = '#FF7A2C', drift = 120,
}) => {
  const r = rng(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x0 = x - w / 2 + r() * w, sp = 0.18 + r() * 0.25, ph = r(), sway = 10 + r() * 30, s = 2 + r() * 3.5, dr = (r() - 0.3) * drift, isHot = r() > 0.5;
        const p = mod(t * sp + ph, 1);
        return <circle key={i} cx={x0 + dr * p + Math.sin(t * 3 + i) * sway * p} cy={y - h * p} r={s * (1 - p * 0.5)} fill={isHot ? hot : warm} opacity={Math.sin(p * Math.PI) * 0.9} />;
      })}
    </g>
  );
};

/**
 * Pulviscolo in un fascio di luce: particelle dentro il trapezio con lato alto (top) e lato basso (bottom).
 * Esempio finestra → pavimento: top = { y, x0, x1 } della finestra, bottom = { y, x0, x1 } della macchia di luce.
 */
export const Dust: React.FC<{ t: number; top: { y: number; x0: number; x1: number }; bottom: { y: number; x0: number; x1: number }; seed?: number; n?: number; color?: string; boost?: number }> = ({
  t, top, bottom, seed = 31, n = 26, color = '#E9F0F2', boost = 0,
}) => {
  const r = rng(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const u = r(), v0 = r(), s = 2 + r() * 4, sp = 0.02 + r() * 0.04, ph = r() * 6;
        const v = mod(v0 + t * sp, 1);
        const px = lerp(lerp(top.x0, bottom.x0, v), lerp(top.x1, bottom.x1, v), u) + Math.sin(t * 0.8 + ph) * 14;
        return <circle key={i} cx={px} cy={lerp(top.y, bottom.y, v)} r={s} fill={color} opacity={(0.25 + 0.5 * pulse01(t, 2, ph) + boost) * Math.sin(v * Math.PI)} />;
      })}
    </g>
  );
};

/** Particelle grandi e sfumate vicine alla camera (polvere, nebbia, spruzzi): da mettere nel piano 1,4–2,0. */
export const NearMotes: React.FC<{ id: string; t: number; seed?: number; n?: number; color?: string; r0?: number; r1?: number; y0?: number; y1?: number; vx?: number; vy?: number; opacity?: number }> = ({
  id, t, seed = 41, n = 7, color = '#E9F0F2', r0 = 40, r1 = 110, y0 = 500, y1 = 1800, vx = -35, vy = -10, opacity = 0.12,
}) => {
  const r = rng(seed);
  return (
    <g>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={color} stopOpacity=".9" />
          <stop offset=".45" stopColor={color} stopOpacity=".35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: n }, (_, i) => {
        const bx = r() * 1500, by = y0 + r() * (y1 - y0), rad = lerp(r0, r1, r()), k = 0.7 + r() * 0.6;
        return <circle key={i} cx={mod(bx + t * vx * k, 1500) - 210} cy={mod(by - y0 + t * vy * k, y1 - y0) + y0 + Math.sin(t * 0.6 + i) * 24} r={rad} fill={`url(#${id})`} opacity={opacity} />;
      })}
    </g>
  );
};

/** Foglie, fogli o petali che volano in diagonale ruotando. */
export const Flyers: React.FC<{ t: number; seed?: number; n?: number; color?: string; outline?: string; w?: number; h?: number; y0?: number; y1?: number; speed?: number; shape?: 'leaf' | 'paper' }> = ({
  t, seed = 51, n = 6, color = '#E9DCC0', outline = '#0B1418', w = 40, h = 52, y0 = 300, y1 = 1300, speed = 0.12, shape = 'paper',
}) => {
  const r = rng(seed);
  const d = shape === 'leaf' ? `M0 ${-h / 2} Q${w / 2} 0 0 ${h / 2} Q${-w / 2} 0 0 ${-h / 2} Z` : `M${-w / 2} ${-h / 2} H${w / 2} V${h / 2} H${-w / 2} Z`;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const ph = r(), yy = y0 + r() * (y1 - y0), sp = speed * (0.7 + r() * 0.6), s = 0.7 + r() * 0.6;
        const p = mod(t * sp + ph, 1);
        return (
          <path key={i} d={d} fill={color} stroke={outline} strokeWidth="4" strokeLinejoin="round"
            transform={`translate(${lerp(-80, 1160, p)} ${yy - 200 * p + Math.sin(t * 2 + i) * 30}) rotate(${t * 90 + i * 40}) scale(${s * Math.cos(t * 3 + i)} ${s})`} />
        );
      })}
    </g>
  );
};

/** Lucciole: puntini caldi che vagano e si accendono a intermittenza. */
export const Fireflies: React.FC<{ id: string; t: number; seed?: number; n?: number; x?: number; y?: number; w?: number; h?: number; color?: string }> = ({ id, t, seed = 61, n = 14, x = 0, y = 900, w = 1080, h = 500, color = '#FFF08A' }) => {
  const r = rng(seed);
  return (
    <g>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={color} stopOpacity="1" />
          <stop offset=".3" stopColor={color} stopOpacity=".5" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: n }, (_, i) => {
        const bx = x + r() * w, by = y + r() * h, ax = 20 + r() * 40, rate = 0.3 + r() * 0.5, ph = r() * 6;
        const on = Math.max(0, Math.sin(t * (1.2 + r()) + ph));
        return <circle key={i} cx={bx + Math.sin(t * rate + ph) * ax} cy={by + Math.cos(t * rate * 1.3 + ph) * ax * 0.6} r={14} fill={`url(#${id})`} opacity={on} />;
      })}
    </g>
  );
};

/** Coriandoli che cadono girando (palette di colori). */
export const Confetti: React.FC<{ t: number; seed?: number; n?: number; colors?: string[]; y0?: number; y1?: number; speed?: number }> = ({
  t, seed = 71, n = 40, colors = ['#F2C14E', '#E8505B', '#4EA5D9', '#F4F1E8'], y0 = -100, y1 = 1900, speed = 0.18,
}) => {
  const r = rng(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const bx = r() * 1080, ph = r(), sp = speed * (0.7 + r() * 0.7), c = colors[Math.floor(r() * colors.length)];
        const p = mod(t * sp + ph, 1);
        return <rect key={i} x={-7} y={-4} width="14" height="8" rx="2" fill={c} transform={`translate(${bx + Math.sin(t * 2 + i) * 40} ${lerp(y0, y1, p)}) rotate(${t * 200 + i * 37}) scale(${Math.cos(t * 5 + i)} 1)`} />;
      })}
    </g>
  );
};

/** Note musicali che salgono ondeggiando da (x, y). */
export const Notes: React.FC<{ t: number; x: number; y: number; seed?: number; n?: number; color?: string; outline?: string; rise?: number; spread?: number; size?: number; speed?: number }> = ({
  t, x, y, seed = 81, n = 6, color = '#F2C14E', outline = '#1B1530', rise = 520, spread = 160, size = 1, speed = 0.22,
}) => {
  const r = rng(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const ph = r(), dx = (r() - 0.5) * spread, two = r() > 0.5, s = size * (0.8 + r() * 0.5);
        const p = mod(t * speed + ph, 1);
        return (
          <g key={i} transform={`translate(${x + dx * p + Math.sin(t * 2 + i * 1.7) * 26} ${y - rise * p}) scale(${s}) rotate(${Math.sin(t * 2.5 + i) * 12})`}
            opacity={seg(p, 0, 0.12) * (1 - seg(p, 0.75, 1))} stroke={outline} strokeLinecap="round" strokeLinejoin="round">
            {two ? (
              <>
                <path d="M2 6 V-34 L34 -42 V-2" fill="none" strokeWidth="11" />
                <path d="M2 6 V-34 L34 -42 V-2" fill="none" stroke={color} strokeWidth="5" />
                <ellipse cx="-8" cy="8" rx="12" ry="9" transform="rotate(-20 -8 8)" fill={color} strokeWidth="4" />
                <ellipse cx="24" cy="0" rx="12" ry="9" transform="rotate(-20 24 0)" fill={color} strokeWidth="4" />
              </>
            ) : (
              <>
                <path d="M4 6 V-36 q16 8 18 24" fill="none" strokeWidth="11" />
                <path d="M4 6 V-36 q16 8 18 24" fill="none" stroke={color} strokeWidth="5" />
                <ellipse cx="-6" cy="8" rx="12" ry="9" transform="rotate(-20 -6 8)" fill={color} strokeWidth="4" />
              </>
            )}
          </g>
        );
      })}
    </g>
  );
};

/** Fila di lucine (luci di Natale, lampadine di insegna) lungo un festone o una riga; brillano a ritmi diversi. */
export const StringLights: React.FC<{ id: string; t: number; from: Pt; to: Pt; n?: number; sag?: number; colors?: string[]; wire?: string; r?: number }> = ({
  id, t, from, to, n = 12, sag = 60, colors = ['#FFD25C', '#E8505B', '#7FD1B9', '#F4F1E8'], wire = '#1B1530', r = 9,
}) => {
  const pt = (p: number) => ({ x: lerp(from.x, to.x, p), y: lerp(from.y, to.y, p) + Math.sin(p * Math.PI) * sag });
  const mid = pt(0.5);
  return (
    <g>
      <path d={`M${from.x} ${from.y} Q${2 * mid.x - (from.x + to.x) / 2} ${2 * mid.y - (from.y + to.y) / 2} ${to.x} ${to.y}`} fill="none" stroke={wire} strokeWidth="4" />
      {Array.from({ length: n }, (_, i) => {
        const p = (i + 0.5) / n, c = colors[i % colors.length], on = 0.45 + 0.55 * pulse01(t, 1.5 + (i % 4) * 0.7, i * 1.9);
        const q = pt(p);
        return (
          <g key={i}>
            <Glow id={`${id}-${i}`} x={q.x} y={q.y + r} r={r * 4.5} t={t} color={c} amp={0} opacity={on * 0.7} />
            <circle cx={q.x} cy={q.y + r} r={r} fill={c} stroke={wire} strokeWidth="3" opacity={0.5 + on * 0.5} />
          </g>
        );
      })}
    </g>
  );
};

/**
 * Insegna al neon: testo con tubo luminoso e alone colorato.
 * `onAt`: istante in cui si accende (con due sfarfallii brevi, entro il limite di QUALITA §2).
 */
export const Neon: React.FC<{ id: string; t: number; x: number; y: number; text: string; color: string; font: string; size?: number; onAt?: number; anchor?: 'start' | 'middle' | 'end' }> = ({
  id, t, x, y, text, color, font, size = 110, onAt = -1, anchor = 'middle',
}) => {
  const flick = t < onAt ? 0 : t < onAt + 0.5 ? (Math.sin((t - onAt) * 40) > 0 ? 1 : 0.15) : 1;
  const hum = 0.92 + 0.08 * Math.sin(t * 13);
  const k = flick * hum;
  return (
    <g>
      <Glow id={id} x={anchor === 'middle' ? x : anchor === 'start' ? x + size * text.length * 0.28 : x - size * text.length * 0.28} y={y - size * 0.35} r={size * text.length * 0.42} t={t} color={color} amp={0.04} rate={3} opacity={0.55 * k} />
      <text x={x} y={y} textAnchor={anchor} fontFamily={font} fontSize={size} fill="none" stroke={color} strokeWidth={size * 0.16} strokeLinejoin="round" opacity={0.35 * k}>{text}</text>
      <text x={x} y={y} textAnchor={anchor} fontFamily={font} fontSize={size} fill="none" stroke={color} strokeWidth={size * 0.075} strokeLinejoin="round" opacity={0.3 + 0.7 * k}>{text}</text>
      <text x={x} y={y} textAnchor={anchor} fontFamily={font} fontSize={size} fill="none" stroke="#FFFFFF" strokeWidth={size * 0.022} strokeLinejoin="round" opacity={0.7 * k}>{text}</text>
    </g>
  );
};
