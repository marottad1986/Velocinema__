import React from 'react';
import { clamp01, lerp } from './anim';

// Spazi liminali in prospettiva vera (passo avanti del lungo di Backrooms, ASTICELLA.md): un corridoio a stanze
// che la camera percorre davvero in profondità (prospettiva a un punto di fuga), costruito a segmenti dal fondo verso
// la camera, con carta da parati a righe, battiscopa, moquette con macchie bagnate e riflessi dei neon, soffitto a
// pannelli con i neon che ronzano e sfarfallano (ogni neon illumina il suo tratto: se si spegne, quel tratto si fa
// scuro), aperture laterali verso altre stanze, pilastri, foschia gialla in fondo. Deterministico: tutto dipende da T,
// dalla posizione della camera (z = metri percorsi) e dal seme.
// Uso: <Corridoio T={T} z={metri} w={1920} h={1080} /> dentro un <svg>; `oggetti` disegna cose nel corridoio con
// la funzione di proiezione (es. una porta socchiusa in fondo, un cartello sul muro, impronte sulla moquette).

export type Look = {
  muro: string; muroScuro: string; righe: string; battiscopa: string; moquette: string; moquetteScura: string; macchia: string;
  soffitto: string; giunti: string; neon: string; alone: string; foschia: string; contorno: string;
};
/** Il giallo del Livello 0. */
export const LIVELLO0: Look = {
  muro: '#D8C46A', muroScuro: '#8E7A30', righe: '#B9A24C', battiscopa: '#6E5A22', moquette: '#9C8A45', moquetteScura: '#5E5124', macchia: '#4E4320',
  soffitto: '#CFC08A', giunti: '#9E8E58', neon: '#FFFBE6', alone: '#FFF4B8', foschia: '#E9DA8E', contorno: '#2A2310',
};

export type Proietta = (x: number, y: number, z: number) => { x: number; y: number; s: number; d: number } | null;

const mixHex = (a: string, b: string, k: number) => {
  const p = (h: string) => (h.startsWith('rgb') ? h.slice(4, -1).split(',').map(Number) : [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp01(k)))).join(',')})`;
};
const hash = (n: number, s: number) => {
  const x = Math.sin(n * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Intensità di un neon (0–1): ronzio quasi fermo, ogni tanto uno sfarfallio; `rotto` = sfarfalla spesso. */
export const neonAt = (T: number, i: number, seed = 1, rotto = 0) => {
  const r = hash(i, seed);
  const burst = Math.sin(T * (0.6 + r) + r * 40) > 0.985 - 0.06 * rotto ? 0.25 + 0.5 * hash(Math.floor(T * 24), i + seed) : 1;
  return (0.93 + 0.07 * Math.sin(T * 120 + i)) * burst;
};

export const Corridoio: React.FC<{
  T: number;
  /** metri percorsi dalla camera lungo il corridoio */
  z: number;
  /** spostamento laterale della camera (m) e rotazione leggera (gradi, solo inclinazione dell'orizzonte) */
  x?: number; roll?: number;
  w?: number; h?: number;
  seed?: number;
  look?: Look;
  /** 0–1: quanto sono accesi i neon (si possono spegnere tutti); `spenti`: indici dei neon spenti a forza */
  luce?: number; spenti?: (i: number) => number;
  /** neon che sfarfallano di più (0–1) */
  rotto?: number;
  /** larghezza del corridoio (m), altezza (m) */
  largo?: number; alto?: number;
  /** cose dentro il corridoio, disegnate sopra con la proiezione */
  oggetti?: (p: Proietta) => React.ReactNode;
  /** 0–1: deformazione delle stanze (le copie storte del finale) */
  storto?: number;
  id?: string;
}> = ({ T, z, x: cx = 0, roll = 0, w = 1920, h = 1080, seed = 7, look = LIVELLO0, luce = 1, spenti, rotto = 0, largo = 4.2, alto = 3, oggetti, storto = 0, id = 'lim' }) => {
  const SEG = 3; // metri per tratto (un neon per tratto)
  const N = 16; // tratti visibili
  const eye = 1.62 + Math.sin(z * 2.1) * 0.025; // passo che dondola appena
  const f = h * 0.92;
  const hy = h * 0.47;
  const FOG = 26;
  const proj: Proietta = (x, y, zz) => {
    const d = zz - z;
    if (d < 0.25) return null;
    const wob = storto ? Math.sin(zz * 0.9 + T * 0.7) * storto * 0.35 * (y / alto) : 0;
    return { x: w / 2 + (f * (x + wob - cx)) / d, y: hy - (f * (y - eye)) / d, s: f / d, d };
  };
  const P = (x: number, y: number, zz: number) => {
    const p = proj(x, y, Math.max(zz, z + 0.26))!;
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  };
  const quad = (a: [number, number, number], b: [number, number, number], c: [number, number, number], d: [number, number, number]) =>
    `M${P(...a)} L${P(...b)} L${P(...c)} L${P(...d)} Z`;
  const L = largo / 2;
  const i0 = Math.floor(z / SEG);
  const segs = Array.from({ length: N }, (_, k) => i0 + N - 1 - k); // dal fondo verso la camera
  const fogK = (d: number) => 1 - Math.exp(-Math.max(0, d) / FOG);

  return (
    <g transform={roll ? `rotate(${roll} ${w / 2} ${h / 2})` : undefined}>
      <defs>
        <radialGradient id={`${id}-alone`}>
          <stop offset="0" stopColor={look.alone} stopOpacity=".55" />
          <stop offset=".5" stopColor={look.alone} stopOpacity=".18" />
          <stop offset="1" stopColor={look.alone} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-fondo`}>
          <stop offset="0" stopColor={look.alone} />
          <stop offset="1" stopColor={look.foschia} />
        </radialGradient>
      </defs>
      {/* fondo: la foschia dove il corridoio si perde */}
      <rect x={-w} y={-h} width={w * 3} height={h * 3} fill={mixHex(look.foschia, '#000000', 1 - 0.85 * luce)} />
      <ellipse cx={w / 2 - (f * cx) / (N * SEG)} cy={hy} rx={w * 0.12} ry={h * 0.1} fill={`url(#${id}-fondo)`} opacity={0.7 * luce} />
      {segs.map((i) => {
        const za = i * SEG, zb = za + SEG;
        const dmid = za + SEG / 2 - z;
        if (zb <= z + 0.26) return null;
        const r = (k: number) => hash(i * 7 + k, seed);
        const on = neonAt(T, i, seed, rotto) * luce * (spenti ? 1 - spenti(i) : 1);
        // luce del tratto: il suo neon e un po' dei vicini
        const lum = clamp01(0.35 + 0.65 * on);
        const fk = fogK(dmid);
        const tone = (c: string, dark: string, k: number) => mixHex(mixHex(c, dark, 1 - k), look.foschia, fk * (0.4 + 0.6 * luce));
        const apreSx = r(1) > 0.72, apreDx = r(2) > 0.74;
        const pil = r(3) > 0.82; // pilastro all'inizio del tratto
        const muroSx = tone(look.muro, look.muroScuro, lum * 0.92);
        const muroDx = tone(look.muro, look.muroScuro, lum);
        const moq = tone(look.moquette, look.moquetteScura, lum);
        const sof = tone(look.soffitto, look.giunti, lum);
        const lineW = Math.max(0.6, f / Math.max(1, dmid) * 0.012);
        const door = (side: -1 | 1) => {
          const zx0 = za + 0.6, zx1 = za + 2.2, top = 2.25;
          const xs = side * L, xr = side * (L + 3.2);
          const cid = `${id}-d${i}${side}`;
          return (
            <g>
              <clipPath id={cid}><path d={quad([xs, 0, zx0], [xs, top, zx0], [xs, top, zx1], [xs, 0, zx1])} /></clipPath>
              <g clipPath={`url(#${cid})`}>
                {/* la stanza accanto: più scura, con il suo muro di fondo e il suo neon lontano */}
                <path d={quad([xs, 0, za - 2], [xs, alto, za - 2], [xs, alto, zb + 3], [xs, 0, zb + 3])} fill={tone(look.muroScuro, '#000000', 0.75 * lum)} />
                <path d={quad([xs, 0, za - 2], [xr, 0, za - 2], [xr, 0, zb + 3], [xs, 0, zb + 3])} fill={tone(look.moquetteScura, '#000000', 0.7 * lum)} />
                <path d={quad([xr, 0, za - 2], [xr, alto, za - 2], [xr, alto, zb + 3], [xr, 0, zb + 3])} fill={tone(look.muro, look.muroScuro, 0.55 * lum)} />
                <path d={quad([xs, alto, za - 2], [xr, alto, za - 2], [xr, alto, zb + 3], [xs, alto, zb + 3])} fill={tone(look.giunti, '#000000', 0.6 * lum)} />
                {[0.4, 1.4].map((k) => <path key={k} d={`M${P(xr, 0.1, zx0 + k)} L${P(xr, alto, zx0 + k)}`} stroke={tone(look.righe, '#000000', lum * 0.6)} strokeWidth={lineW} opacity={0.6} />)}
              </g>
              {/* stipite: lo spessore del muro */}
              <path d={quad([xs, 0, zx1], [xs, top, zx1], [xs + side * 0.18, top, zx1], [xs + side * 0.18, 0, zx1])} fill={tone(look.muro, look.muroScuro, lum * 0.6)} />
              <path d={`M${P(xs, 0, zx0)} L${P(xs, top, zx0)} L${P(xs, top, zx1)} L${P(xs, 0, zx1)}`} fill="none" stroke={look.contorno} strokeWidth={lineW * 1.3} opacity={0.5 * (1 - fk)} />
            </g>
          );
        };
        // ombra in basso sui muri (la luce viene dall'alto)
        const ao = (sd: number) => [0.25, 0.55, 0.9].map((hh) => quad([sd * L, 0, za], [sd * L, hh, za], [sd * L, hh, zb], [sd * L, 0, zb]));
        const stripes = Array.from({ length: 5 }, (_, k) => za + (k + 0.5) * (SEG / 5));
        const lampZ0 = za + 1, lampZ1 = za + 2;
        const stains = [0, 1].filter((k) => r(10 + k) > 0.45).map((k) => ({ x: lerp(-L + 0.6, L - 0.6, r(20 + k)), z: za + r(30 + k) * SEG, rx: 0.4 + r(40 + k) * 0.9, rz: 0.3 + r(50 + k) * 0.6 }));
        return (
          <g key={i}>
            {/* soffitto e moquette */}
            <path d={quad([-L, alto, za], [L, alto, za], [L, alto, zb], [-L, alto, zb])} fill={sof} />
            <path d={quad([-L, 0, za], [L, 0, za], [L, 0, zb], [-L, 0, zb])} fill={moq} />
            {/* giunti dei pannelli del soffitto */}
            {[-L / 2, 0, L / 2].map((gx) => <path key={gx} d={`M${P(gx, alto, za)} L${P(gx, alto, zb)}`} stroke={tone(look.giunti, '#000000', lum * 0.8)} strokeWidth={lineW} opacity={0.7} />)}
            {[0, 1, 2].map((k) => <path key={k} d={`M${P(-L, alto, za + k)} L${P(L, alto, za + k)}`} stroke={tone(look.giunti, '#000000', lum * 0.8)} strokeWidth={lineW} opacity={0.5} />)}
            <path d={`M${P(-L, alto, za)} L${P(L, alto, za)}`} stroke={tone(look.giunti, '#000000', lum * 0.8)} strokeWidth={lineW} opacity={0.7} />
            {/* macchie bagnate della moquette */}
            {stains.map((s, k) => {
              const pts = Array.from({ length: 10 }, (_, j) => {
                const a = (j / 10) * Math.PI * 2;
                const q = 0.8 + 0.25 * Math.sin(a * 3 + r(60 + k) * 6);
                return P(s.x + Math.cos(a) * s.rx * q, 0.002, s.z + Math.sin(a) * s.rz * q);
              });
              return <path key={k} d={`M${pts.join(' L')} Z`} fill={tone(look.macchia, '#000000', lum)} opacity={0.55} />;
            })}
            {/* riflesso del neon sulla moquette bagnata */}
            {(() => {
              const c = proj(0, 0.003, (lampZ0 + lampZ1) / 2);
              const c2 = proj(0, 0.003, lampZ1 + 0.4);
              if (!c || !c2) return null;
              return <ellipse cx={c.x} cy={(c.y + c2.y) / 2} rx={c.s * 0.9} ry={Math.max(2, Math.abs(c.y - c2.y) * 1.2)} fill={`url(#${id}-alone)`} opacity={0.6 * on * (1 - fk)} />;
            })()}
            {/* muri */}
            <path d={quad([-L, 0, za], [-L, alto, za], [-L, alto, zb], [-L, 0, zb])} fill={muroSx} />
            <path d={quad([L, 0, za], [L, alto, za], [L, alto, zb], [L, 0, zb])} fill={muroDx} />
            {stripes.map((sz) => (
              <g key={sz} opacity={0.55}>
                <path d={`M${P(-L, 0.12, sz)} L${P(-L, alto, sz)}`} stroke={tone(look.righe, '#000000', lum)} strokeWidth={lineW * 1.4} />
                <path d={`M${P(L, 0.12, sz)} L${P(L, alto, sz)}`} stroke={tone(look.righe, '#000000', lum)} strokeWidth={lineW * 1.4} />
              </g>
            ))}
            {[-1, 1].map((sd) => ao(sd).map((d, k) => <path key={`${sd}${k}`} d={d} fill="#000" opacity={0.05 * (1 - fk)} />))}
            {apreSx && door(-1)}
            {apreDx && door(1)}
            {/* battiscopa */}
            <path d={quad([-L, 0, za], [-L, 0.12, za], [-L, 0.12, zb], [-L, 0, zb])} fill={tone(look.battiscopa, '#000000', lum)} />
            <path d={quad([L, 0, za], [L, 0.12, za], [L, 0.12, zb], [L, 0, zb])} fill={tone(look.battiscopa, '#000000', lum)} />
            {/* il neon: pannello luminoso con l'alone */}
            <path d={quad([-0.55, alto - 0.01, lampZ0], [0.55, alto - 0.01, lampZ0], [0.55, alto - 0.01, lampZ1], [-0.55, alto - 0.01, lampZ1])}
              fill={mixHex(look.giunti, look.neon, on)} stroke={look.contorno} strokeWidth={lineW} strokeOpacity={0.4} />
            {on > 0.4 && (() => {
              const c = proj(0, alto - 0.05, (lampZ0 + lampZ1) / 2);
              if (!c) return null;
              return <ellipse cx={c.x} cy={c.y + c.s * 0.08} rx={c.s * 1.7} ry={c.s * 0.6} fill={`url(#${id}-alone)`} opacity={0.55 * on * (1 - fk * 0.7)} />;
            })()}
            {/* pilastro */}
            {pil && (
              <g>
                {[-1, 1].map((sd) => (
                  <path key={sd} d={quad([sd * (L - 0.45), 0, za], [sd * (L - 0.45), alto, za], [sd * L, alto, za], [sd * L, 0, za])} fill={tone(look.muro, look.muroScuro, lum * 0.8)} stroke={look.contorno} strokeWidth={lineW * 1.2} strokeOpacity={0.5} />
                ))}
              </g>
            )}
            {/* spigoli: il contorno scuro dello stile (QUALITA.md) */}
            <path d={`M${P(-L, 0, za)} L${P(-L, 0, zb)} M${P(L, 0, za)} L${P(L, 0, zb)} M${P(-L, alto, za)} L${P(-L, alto, zb)} M${P(L, alto, za)} L${P(L, alto, zb)}`}
              stroke={look.contorno} strokeWidth={lineW * 1.6} opacity={0.55 * (1 - fk)} fill="none" />
          </g>
        );
      })}
      {oggetti?.(proj)}
    </g>
  );
};

/** Metri percorsi camminando dall'istante t0 a velocità v (m/s), con una partenza morbida di `ramp` secondi. */
export const passi = (T: number, t0: number, v = 1.3, ramp = 0.8) => {
  const t = Math.max(0, T - t0);
  return t < ramp ? (v * t * t) / (2 * ramp) : v * (t - ramp / 2);
};
