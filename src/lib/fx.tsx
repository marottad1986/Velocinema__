import React from 'react';
import { rng } from './anim';

// Elementi di finitura comuni (QUALITA.md §3 e §6): grana fissa, vignettatura, velatura di colore.
// Vanno messi in fondo all'SVG della scena, fuori dal gruppo camera.

const grainRects = (() => {
  const r = rng(424242);
  const out: { x: number; y: number; light: boolean; o: number }[] = [];
  for (let i = 0; i < 260; i++) {
    out.push({ x: Math.floor(r() * 180), y: Math.floor(r() * 180), light: r() > 0.5, o: [0.25, 0.35, 0.45][Math.floor(r() * 3)] });
  }
  return out;
})();

/** Definizioni da includere una volta per scena: <defs><FxDefs id="xx" /></defs>. */
export const FxDefs: React.FC<{ id: string }> = ({ id }) => (
  <>
    <pattern id={`${id}-grain`} width="180" height="180" patternUnits="userSpaceOnUse">
      {grainRects.map((g, i) => (
        <rect key={i} x={g.x} y={g.y} width="2" height="2" fill={g.light ? '#FFFFFF' : '#000000'} opacity={g.o} />
      ))}
    </pattern>
    <radialGradient id={`${id}-vig`} cx=".5" cy=".5" r=".75">
      <stop offset=".55" stopColor="#000" stopOpacity="0" />
      <stop offset="1" stopColor="#000" stopOpacity=".58" />
    </radialGradient>
  </>
);

/** Velatura colore del film + vignettatura + grana (opacità totale grana ~6%). */
export const Finish: React.FC<{ id: string; tint: string; tintOpacity?: number }> = ({ id, tint, tintOpacity = 0.12 }) => (
  <>
    <rect width="1080" height="1920" fill={tint} opacity={tintOpacity} />
    <rect width="1080" height="1920" fill={`url(#${id}-vig)`} />
    <rect width="1080" height="1920" fill={`url(#${id}-grain)`} opacity=".5" />
  </>
);

/** Gradiente radiale per aloni (luce che sfuma a zero). */
export const GlowGradient: React.FC<{ id: string; color: string; core?: number; mid?: number }> = ({ id, color, core = 0.95, mid = 0.35 }) => (
  <radialGradient id={id}>
    <stop offset="0" stopColor={color} stopOpacity={core} />
    <stop offset=".45" stopColor={color} stopOpacity={mid} />
    <stop offset="1" stopColor={color} stopOpacity="0" />
  </radialGradient>
);

/** Gradiente lineare a più tappe. stops: [offset, colore, opacità?]. */
export const Lin: React.FC<{ id: string; stops: [number, string, number?][]; x2?: number; y2?: number }> = ({ id, stops, x2 = 0, y2 = 1 }) => (
  <linearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
    {stops.map(([o, c, op], i) => (
      <stop key={i} offset={o} stopColor={c} stopOpacity={op ?? 1} />
    ))}
  </linearGradient>
);
