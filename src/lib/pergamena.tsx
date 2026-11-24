import React from 'react';
import { eo, mod, rng, seg } from './anim';

// Pergamena miniata (Zelda, la linea del tempo, 24 nov 2026): lo schema disegnato come un manoscritto medievale.
// - `Pergamena`: il foglio, con il gradiente caldo, le fibre, le macchie d'umidità, i bordi bruniti e le righe a secco;
//   tutto con gradienti, niente filtri (QUALITA §7).
// - `Inchiostro`: una linea che si scrive da sola, con il pennino d'oro acceso in punta, le goccioline che restano sul
//   foglio e le pagliuzze d'oro che si staccano. Si passa un elenco di punti (curva morbida Catmull-Rom) e `p` 0–1.
//   Per un bivio si mettono tre `Inchiostro` che partono dallo stesso punto con lo stesso `p`: si scrivono insieme.
// - `Arco`: la cornice a sesto acuto delle miniature (vetrata o pagina miniata), doppio filo d'oro, chiodini agli angoli;
//   `clip` dà il percorso dell'arco per ritagliare il disegno dentro.
// - `Sigillo`: il sigillo di ceralacca con un simbolo inciso (cartellino «colpo di scena» in stile manoscritto).
// Riutilizzabile per ogni storia «antica»: fiabe, leggende, saghe fantasy, libri, mappe del tesoro, alberi genealogici.

export type Pt = readonly [number, number];

/** Percorso morbido che passa per tutti i punti (Catmull-Rom → Bézier cubiche). */
export const curva = (pts: readonly Pt[], k = 1 / 6): string => {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2 = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
};

/** Campiona la curva di `curva()` in `n` punti per tratto (per trovare la punta del pennino e le gocce). */
const campiona = (pts: readonly Pt[], n = 16, k = 1 / 6): Pt[] => {
  const out: Pt[] = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2 = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    for (let j = 1; j <= n; j++) {
      const u = j / n, v = 1 - u;
      out.push([
        v * v * v * p1[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * p2[0],
        v * v * v * p1[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * p2[1],
      ]);
    }
  }
  return out;
};

/** Punto e direzione (gradi) a una frazione `p` della lunghezza della curva. */
export const puntoSu = (pts: readonly Pt[], p: number): { x: number; y: number; ang: number } => {
  const s = campiona(pts);
  const L = [0];
  for (let i = 1; i < s.length; i++) L.push(L[i - 1] + Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]));
  const target = Math.max(0, Math.min(1, p)) * L[L.length - 1];
  let i = 1;
  while (i < s.length - 1 && L[i] < target) i++;
  const f = (target - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
  const x = s[i - 1][0] + (s[i][0] - s[i - 1][0]) * f, y = s[i - 1][1] + (s[i][1] - s[i - 1][1]) * f;
  return { x, y, ang: (Math.atan2(s[i][1] - s[i - 1][1], s[i][0] - s[i - 1][0]) * 180) / Math.PI };
};

// ---------------------------------------------------------------- il foglio

export const Pergamena: React.FC<{
  id: string; x: number; y: number; w: number; h: number; seed?: number;
  /** colori: chiaro al centro, caldo verso i bordi, bruno dei bordi bruciati */ light?: string; warm?: string; edge?: string;
  /** righe a secco (rigatura del copista) ogni `rule` px; 0 = niente */ rule?: number;
  fibers?: number; stains?: number;
}> = ({ id, x, y, w, h, seed = 7, light = '#F6EBCF', warm = '#E9D3A4', edge = '#9A7240', rule = 0, fibers = 140, stains = 9 }) => {
  const r = rng(seed);
  const fib = Array.from({ length: fibers }, () => ({ x: x + r() * w, y: y + r() * h, l: 10 + r() * 46, a: -20 + r() * 40, o: 0.05 + r() * 0.12, dark: r() > 0.45 }));
  const st = Array.from({ length: stains }, () => ({ x: x + r() * w, y: y + r() * h, rx: 50 + r() * 160, ry: 40 + r() * 120, o: 0.08 + r() * 0.12 }));
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-pg`} cx=".5" cy=".45" r=".75">
          <stop offset="0" stopColor={light} />
          <stop offset=".7" stopColor={warm} />
          <stop offset="1" stopColor={edge} />
        </radialGradient>
        <radialGradient id={`${id}-st`}>
          <stop offset="0" stopColor={edge} stopOpacity="0" />
          <stop offset=".7" stopColor={edge} stopOpacity=".35" />
          <stop offset=".86" stopColor={edge} stopOpacity=".6" />
          <stop offset="1" stopColor={edge} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-eh`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={edge} stopOpacity=".75" />
          <stop offset=".05" stopColor={edge} stopOpacity="0" />
          <stop offset=".95" stopColor={edge} stopOpacity="0" />
          <stop offset="1" stopColor={edge} stopOpacity=".75" />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id}-pg)`} />
      {st.map((s, i) => <ellipse key={i} cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} fill={`url(#${id}-st)`} opacity={s.o * 3} />)}
      {rule > 0 && Array.from({ length: Math.floor(h / rule) }, (_, i) => (
        <path key={i} d={`M${x + 40} ${y + (i + 0.5) * rule} H${x + w - 40}`} stroke={edge} strokeWidth="1.2" opacity=".14" />
      ))}
      {fib.map((f, i) => (
        <path key={i} d={`M${f.x} ${f.y} l${f.l} 0`} transform={`rotate(${f.a} ${f.x} ${f.y})`} stroke={f.dark ? edge : '#FFFFFF'} strokeWidth="1.4" strokeLinecap="round" opacity={f.o} />
      ))}
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id}-eh)`} />
    </g>
  );
};

// ---------------------------------------------------------------- l'inchiostro che scrive

export const Inchiostro: React.FC<{
  id: string; pts: readonly Pt[]; p: number; t: number;
  color?: string; w?: number; /** pennino d'oro acceso in punta mentre scrive */ nib?: boolean; gold?: string;
  /** tratteggio (es. viaggio nel tempo) */ dash?: string; flow?: number; opacity?: number; seed?: number;
  /** alone di colore sotto la linea (il ramo «acceso») */ halo?: number;
}> = ({ id, pts, p, t, color = '#3A2614', w = 9, nib = true, gold = '#F2C230', dash, flow = 0, opacity = 1, seed = 3, halo = 0 }) => {
  if (p <= 0 || opacity <= 0) return null;
  const d = curva(pts);
  const big = 8000;
  const tip = puntoSu(pts, p);
  const r = rng(seed);
  // goccioline: cadono dove il pennino è passato e restano sul foglio
  const drops = Array.from({ length: 6 }, () => ({ at: 0.08 + r() * 0.86, dx: (r() - 0.5) * w * 3.2, dy: (r() - 0.5) * w * 3.2, s: 0.25 + r() * 0.35 }));
  const writing = p > 0.001 && p < 0.999;
  return (
    <g opacity={opacity}>
      <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={-big} y={-big} width={big * 3} height={big * 3}>
        <path d={d} fill="none" stroke="#fff" strokeWidth={w * 3 + 20} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="butt" />
      </mask>
      <g mask={`url(#${id}-m)`}>
        {halo > 0 && <path d={d} fill="none" stroke={color} strokeWidth={w * 4.5} strokeLinecap="round" opacity={0.16 * halo} />}
        {/* l'inchiostro più scuro ai bordi del tratto, come una penna d'oca */}
        <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} strokeDashoffset={dash ? -t * flow : 0} />
        {!dash && <path d={d} fill="none" stroke="#FFF6DC" strokeWidth={Math.max(1, w * 0.18)} strokeLinecap="round" opacity=".28" transform={`translate(${-w * 0.18} ${-w * 0.18})`} />}
      </g>
      {drops.filter((g) => g.at < p).map((g, i) => {
        const q = puntoSu(pts, g.at);
        return <circle key={i} cx={q.x + g.dx} cy={q.y + g.dy} r={w * g.s} fill={color} opacity=".75" />;
      })}
      {nib && writing && (
        <g transform={`translate(${tip.x} ${tip.y})`}>
          <circle r={w * 3.2} fill={gold} opacity={0.2 + 0.08 * Math.sin(t * 20)} />
          <circle r={w * 1.5} fill={gold} opacity=".55" />
          <circle r={w * 0.7} fill="#FFF8DC" />
          {/* pagliuzze d'oro che si staccano dalla punta */}
          {Array.from({ length: 7 }, (_, i) => {
            const u = mod(t * 1.6 + i / 7, 1);
            const a = ((tip.ang + 180 + (i - 3) * 22) * Math.PI) / 180;
            return <path key={i} d="M0 -3 L1.6 0 L0 3 L-1.6 0 Z" fill={i % 2 ? gold : '#FFF2B8'} transform={`translate(${Math.cos(a) * u * w * 7} ${Math.sin(a) * u * w * 7 + u * u * 20}) scale(${1.6 - u})`} opacity={1 - u} />;
          })}
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- la cornice a sesto acuto

/** Percorso dell'arco a sesto acuto (base piatta, fianchi dritti, punta in alto). */
export const arcoPath = (x: number, y: number, w: number, h: number, punta = 0.42) => {
  const ph = w * punta; // altezza della punta
  return `M${x} ${y + h} V${y + ph} Q${x} ${y + ph * 0.18} ${x + w / 2} ${y} Q${x + w} ${y + ph * 0.18} ${x + w} ${y + ph} V${y + h} Z`;
};

export const Arco: React.FC<{ x: number; y: number; w: number; h: number; gold?: string; ink?: string; p?: number; t?: number; lit?: number; color?: string; sw?: number }> = ({
  x, y, w, h, gold = '#D9A932', ink = '#3A2614', p = 1, t = 0, lit = 0, color, sw = 7,
}) => {
  if (p <= 0) return null;
  const d = arcoPath(x, y, w, h);
  const d2 = arcoPath(x - 12, y - 14, w + 24, h + 26);
  return (
    <g opacity={eo(Math.min(1, p * 1.5))}>
      {lit > 0 && color && <path d={d2} fill="none" stroke={color} strokeWidth={30} opacity={0.18 * lit * (0.85 + 0.15 * Math.sin(t * 3))} strokeLinejoin="round" />}
      <path d={d2} fill="none" stroke={ink} strokeWidth={sw} strokeLinejoin="round" pathLength={1} strokeDasharray={`${p} 1`} />
      <path d={d2} fill="none" stroke={gold} strokeWidth={sw * 0.45} strokeLinejoin="round" pathLength={1} strokeDasharray={`${p} 1`} transform="translate(0 0)" />
      <path d={d} fill="none" stroke={ink} strokeWidth={sw * 0.9} strokeLinejoin="round" pathLength={1} strokeDasharray={`${p} 1`} />
      {p > 0.98 && [[x - 12, y + h + 12], [x + w + 12, y + h + 12], [x + w / 2, y - 14]].map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}>
          <circle r={sw * 1.6} fill={gold} stroke={ink} strokeWidth={sw * 0.5} />
          <circle r={sw * 0.5} cx={-sw * 0.4} cy={-sw * 0.4} fill="#FFF6D0" />
        </g>
      ))}
    </g>
  );
};

// ---------------------------------------------------------------- il sigillo

/** Sigillo di ceralacca: disco irregolare con un bordo a goccia e un simbolo inciso (children, coordinate ±30). */
export const Sigillo: React.FC<{ x: number; y: number; t: number; t0: number; color?: string; s?: number; children?: React.ReactNode }> = ({ x, y, t, t0, color = '#B8322A', s = 1, children }) => {
  if (t < t0) return null;
  const k = seg(t, t0, t0 + 0.35);
  const sc = s * (1.8 - 0.8 * eo(k)); // cade dall'alto e si schiaccia sul foglio
  const blob = 'M0 -46 C18 -48 30 -40 40 -26 C50 -12 48 8 44 20 C38 36 22 48 2 46 C-18 48 -34 40 -42 26 C-50 10 -48 -10 -40 -24 C-30 -40 -18 -46 0 -46 Z';
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={Math.min(1, k * 2)}>
      <path d={blob} transform="translate(4 5)" fill="#000" opacity=".25" />
      <path d={blob} fill={color} stroke="#5A1410" strokeWidth="3" />
      <circle r="31" fill="none" stroke="#5A1410" strokeWidth="2.5" opacity=".6" />
      <circle r="31" fill="none" stroke="#F08A7A" strokeWidth="1.5" opacity=".35" transform="translate(-1.5 -1.5)" />
      <g opacity=".85">{children}</g>
      <ellipse cx="-16" cy="-22" rx="10" ry="5" fill="#FFFFFF" opacity=".25" transform="rotate(-30 -16 -22)" />
    </g>
  );
};
