import React from 'react';
import { lerp, rng } from '../../lib/anim';

// Elementi comuni di Hunger Games: la Cornucopia (grande corno di metallo dorato), l'arco e la freccia di Katniss,
// i pini dell'arena, la cupola a esagoni del cielo dell'arena, le baracche del Distretto 12, lo zaino, le bacche
// velenose e la rosa bianca del presidente Snow. Mai persone: i personaggi si raccontano con questi oggetti.

export const K = '#0C0F0C'; // contorni
export const EMBER = '#F08A2A'; // accento: solo su ciò che riguarda Katniss e la sua scelta
export const GOLD = ['#FFE7A0', '#E8B84A', '#B07A22', '#5A3A10'];

type Pt = [number, number];
const cubic = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, u: number): Pt => {
  const a = (1 - u) ** 3, b = 3 * (1 - u) ** 2 * u, c = 3 * (1 - u) * u * u, d = u ** 3;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
};
const f1 = (n: number) => n.toFixed(1);

/** Gradienti comuni (oro della Cornucopia, legno dell'arco). Da mettere una volta nei <defs> della scena. */
export const HGDefs: React.FC<{ id: string }> = ({ id }) => (
  <>
    <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={GOLD[0]} />
      <stop offset=".3" stopColor={GOLD[1]} />
      <stop offset=".7" stopColor={GOLD[2]} />
      <stop offset="1" stopColor={GOLD[3]} />
    </linearGradient>
    <radialGradient id={`${id}-mouth`} cx=".55" cy=".5" r=".6">
      <stop offset="0" stopColor="#000" />
      <stop offset=".7" stopColor="#1A1206" />
      <stop offset="1" stopColor="#3A2A10" />
    </radialGradient>
    <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#4A2A14" />
      <stop offset=".45" stopColor="#9A6436" />
      <stop offset="1" stopColor="#5A3418" />
    </linearGradient>
    <linearGradient id={`${id}-pack`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#FFB060" />
      <stop offset=".5" stopColor={EMBER} />
      <stop offset="1" stopColor="#A84E12" />
    </linearGradient>
  </>
);

/**
 * La Cornucopia: corno dorato con la bocca verso sinistra e la coda che si arriccia in alto a destra.
 * Origine al suolo sotto la bocca. `load` 0..1 = quanto è piena (armi e zaini che escono dalla bocca); `shine` riflesso.
 */
export const Cornucopia: React.FC<{ id: string; x: number; y: number; s?: number; t: number; load?: number; flip?: boolean; night?: boolean; pack?: number }> = ({
  id, x, y, s = 1, t, load = 1, flip = false, night = false, pack = 1,
}) => {
  const P0: Pt = [0, -190], P1: Pt = [380, -170], P2: Pt = [560, -300], P3: Pt = [520, -560];
  const N = 40;
  const pts = Array.from({ length: N + 1 }, (_, i) => {
    const u = i / N;
    const [cx, cy] = cubic(P0, P1, P2, P3, u);
    const [nx0, ny0] = cubic(P0, P1, P2, P3, Math.min(1, u + 0.01));
    const [px0, py0] = cubic(P0, P1, P2, P3, Math.max(0, u - 0.01));
    const dx = nx0 - px0, dy = ny0 - py0, l = Math.hypot(dx, dy) || 1;
    const r = lerp(190, 10, u ** 0.85);
    return { cx, cy, nx: -dy / l, ny: dx / l, r };
  });
  const top = pts.map((p) => `${f1(p.cx + p.nx * p.r)} ${f1(p.cy + p.ny * p.r)}`);
  const bot = pts.map((p) => `${f1(p.cx - p.nx * p.r)} ${f1(p.cy - p.ny * p.r)}`).reverse();
  const body = `M${top.join(' L')} L${bot.join(' L')} Z`;
  const rings = [0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84].map((u) => pts[Math.round(u * N)]);
  const sh = 0.5 + 0.5 * Math.sin(t * 0.9);
  const fill = night ? `url(#${id}-goldn)` : `url(#${id}-gold)`;
  const L = load;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} strokeLinejoin="round" strokeLinecap="round">
      {night && (
        <defs>
          <linearGradient id={`${id}-goldn`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E8E2C0" />
            <stop offset=".3" stopColor="#A89A60" />
            <stop offset=".7" stopColor="#5A4E2A" />
            <stop offset="1" stopColor="#221A0A" />
          </linearGradient>
        </defs>
      )}
      {/* ombra al suolo */}
      <ellipse cx="260" cy="6" rx="420" ry="34" fill="#000" opacity=".4" />
      {/* zampe di sostegno */}
      <path d="M360 -30 L380 4 M470 -150 L500 4" stroke={K} strokeWidth="16" />
      <path d="M360 -30 L380 4 M470 -150 L500 4" stroke={night ? '#6A5E3A' : GOLD[2]} strokeWidth="8" />
      <path d={body} fill={fill} stroke={K} strokeWidth="10" />
      {/* riflesso lungo il dorso */}
      <path d={`M${pts.slice(2, 34).map((p) => `${f1(p.cx + p.nx * p.r * 0.62)} ${f1(p.cy + p.ny * p.r * 0.62)}`).join(' L')}`} fill="none" stroke="#FFF6D0" strokeWidth="10" opacity={(night ? 0.35 : 0.55) + 0.25 * sh} />
      {/* anelli */}
      {rings.map((p, i) => (
        <path key={i} d={`M${f1(p.cx + p.nx * p.r)} ${f1(p.cy + p.ny * p.r)} Q${f1(p.cx + 18)} ${f1(p.cy)} ${f1(p.cx - p.nx * p.r)} ${f1(p.cy - p.ny * p.r)}`} fill="none" stroke={K} strokeWidth="5" opacity=".55" />
      ))}
      {/* bocca */}
      <ellipse cx="0" cy="-190" rx="78" ry="190" fill={`url(#${id}-mouth)`} stroke={K} strokeWidth="10" />
      <ellipse cx="0" cy="-190" rx="78" ry="190" fill="none" stroke={night ? '#C8C0A0' : GOLD[0]} strokeWidth="5" opacity=".7" transform="translate(-6 0)" />
      {/* armi e provviste che escono dalla bocca */}
      <g opacity={L}>
        {/* lance appoggiate */}
        {[[-40, -40, -150, -330], [-20, -10, -190, -260]].map(([x1, y1, x2, y2], i) => (
          <g key={i}>
            <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={K} strokeWidth="12" />
            <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke="#7A5A3A" strokeWidth="6" />
            <path d={`M${x2} ${y2} l-14 -30 l24 10 Z`} fill="#C8CED0" stroke={K} strokeWidth="4" transform={`rotate(${i * 10} ${x2} ${y2})`} />
          </g>
        ))}
        {/* casse */}
        <rect x="-150" y="-80" width="120" height="80" fill="#6A4A28" stroke={K} strokeWidth="7" />
        <path d="M-150 -40 H-30 M-90 -80 V0" stroke="#3A2614" strokeWidth="5" />
        <rect x="-60" y="-130" width="100" height="70" fill="#7A5630" stroke={K} strokeWidth="7" transform="rotate(-8 -10 -95)" />
        {/* zaini */}
        <Backpack x={-230} y={0} s={0.8} color="#3E5A3A" />
        <Backpack x={60} y={0} s={0.7} color="#4A4A3A" />
        <g opacity={pack}><Backpack x={-330} y={10} s={0.95} color="ember" id={id} /></g>
        {/* faretra e arco a terra */}
        <path d="M-120 -10 Q-60 -90 20 -20" fill="none" stroke={K} strokeWidth="12" />
        <path d="M-120 -10 Q-60 -90 20 -20" fill="none" stroke="#8A5A2E" strokeWidth="6" />
        <path d="M-120 -10 L20 -20" stroke="#D8D0B8" strokeWidth="2" />
      </g>
    </g>
  );
};

/** Zaino da sopravvivenza, visto di fronte. Origine alla base. `color` "ember" = lo zaino di Katniss (accento). */
export const Backpack: React.FC<{ x: number; y: number; s?: number; color?: string; id?: string; label?: string; rot?: number }> = ({ x, y, s = 1, color = '#3E5A3A', id, label, rot = 0 }) => {
  const fill = color === 'ember' ? `url(#${id}-pack)` : color;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeLinejoin="round">
      <path d="M-40 -150 Q0 -190 40 -150" fill="none" stroke={K} strokeWidth="12" />
      <path d="M-62 0 V-120 Q-62 -160 0 -160 Q62 -160 62 -120 V0 Z" fill={fill} stroke={K} strokeWidth="8" />
      <path d="M-62 -100 Q0 -80 62 -100" fill="none" stroke={K} strokeWidth="5" />
      <rect x="-38" y="-70" width="76" height="56" rx="10" fill="#000" opacity=".22" stroke={K} strokeWidth="5" />
      <path d="M-52 -150 Q-40 -156 -20 -158" stroke="#FFF" strokeWidth="5" opacity=".35" fill="none" />
      {label && <text x="0" y="-30" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="40" fill="#FFF4E0">{label}</text>}
    </g>
  );
};

/** Arco ricurvo di legno con la corda, verticale. Origine al centro dell'impugnatura; alto ~460 a s=1. `draw` tende la corda (px). */
export const Bow: React.FC<{ id: string; x: number; y: number; s?: number; rot?: number; draw?: number; arrow?: boolean; glow?: number }> = ({ id, x, y, s = 1, rot = 0, draw = 0, arrow = false, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeLinecap="round" strokeLinejoin="round">
    {/* corda */}
    <path d={`M-14 -226 L${-26 - draw} 0 L-14 226`} fill="none" stroke="#E8E0C8" strokeWidth="3" />
    {/* flettenti: ricurvi alle punte */}
    <path d="M0 -40 Q34 -120 22 -200 Q18 -224 -14 -232 M0 40 Q34 120 22 200 Q18 224 -14 232" fill="none" stroke={K} strokeWidth="22" />
    <path d="M0 -40 Q34 -120 22 -200 Q18 -224 -14 -232 M0 40 Q34 120 22 200 Q18 224 -14 232" fill="none" stroke={`url(#${id}-wood)`} strokeWidth="12" />
    <path d="M6 -60 Q30 -120 22 -190 M6 60 Q30 120 22 190" fill="none" stroke="#E2B07A" strokeWidth="3" opacity=".7" />
    {/* impugnatura fasciata */}
    <rect x="-12" y="-46" width="24" height="92" rx="8" fill="#2A1A10" stroke={K} strokeWidth="6" />
    {[-30, -14, 2, 18].map((yy) => <path key={yy} d={`M-12 ${yy} l24 10`} stroke="#5A3A22" strokeWidth="4" />)}
    {arrow && <Arrow x={-26 - draw} y={0} rot={0} len={380 + draw} glow={glow} />}
  </g>
);

/** Freccia orizzontale (punta a destra), con impennaggio arancione-brace. Origine alla cocca. */
export const Arrow: React.FC<{ x: number; y: number; rot?: number; len?: number; s?: number; glow?: number }> = ({ x, y, rot = 0, len = 380, s = 1, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeLinejoin="round" strokeLinecap="round">
    <path d={`M0 0 H${len}`} stroke={K} strokeWidth="12" />
    <path d={`M0 0 H${len}`} stroke="#B08452" strokeWidth="6" />
    <path d={`M${len - 4} -16 L${len + 44} 0 L${len - 4} 16 Z`} fill="#AEB6B8" stroke={K} strokeWidth="5" />
    <path d={`M${len + 4} -6 L${len + 34} 0`} stroke="#F4F8FA" strokeWidth="3" />
    <path d="M6 0 L60 -26 L80 -24 L36 0 Z M6 0 L60 26 L80 24 L36 0 Z" fill={EMBER} stroke={K} strokeWidth="4" />
    {glow > 0 && <path d="M10 0 L56 -18 M10 0 L56 18" stroke="#FFE0A0" strokeWidth="3" opacity={glow} />}
  </g>
);

/** Pino a palchi con bordi seghettati. Origine alla base del tronco; alto ~h. `lit` = bordo illuminato a destra. */
export const Pine: React.FC<{ x: number; y: number; h: number; w?: number; fill: string; outline?: string; lit?: string; seed?: number; sway?: number }> = ({
  x, y, h, w, fill, outline, lit, seed = 1, sway = 0,
}) => {
  const r = rng(seed);
  const W = w ?? h * 0.42;
  const tiers = 6;
  let d = '';
  let litD = '';
  for (let k = 0; k < tiers; k++) {
    const yTop = -h + (k * h * 0.78) / tiers;
    const yBot = yTop + h * 0.32;
    const hw = (W / 2) * (0.3 + (0.7 * (k + 1)) / tiers);
    const teeth = 4 + k;
    const sx = sway * (1 - k / tiers);
    let path = `M${f1(sx)} ${f1(yTop)} L${f1(-hw)} ${f1(yBot)}`;
    for (let i = 1; i <= teeth; i++) {
      const xx = -hw + (2 * hw * i) / teeth;
      path += ` L${f1(xx - hw / teeth)} ${f1(yBot - 10 - r() * 18)} L${f1(xx)} ${f1(yBot + r() * 8)}`;
    }
    d += path + ' Z ';
    litD += `M${f1(sx + 4)} ${f1(yTop + 10)} L${f1(hw - 6)} ${f1(yBot - 4)} `;
  }
  return (
    <g transform={`translate(${x} ${y})`} strokeLinejoin="round">
      <rect x={-h * 0.025} y={-h * 0.2} width={h * 0.05} height={h * 0.2} fill={outline ? '#2A1A10' : fill} stroke={outline} strokeWidth={outline ? 5 : 0} />
      <path d={d} fill={fill} stroke={outline} strokeWidth={outline ? 7 : 0} />
      {lit && <path d={litD} stroke={lit} strokeWidth="4" fill="none" opacity=".6" />}
    </g>
  );
};

/** Fila di pini lontani (senza contorni) tra x0 e x1. */
export const PineRow: React.FC<{ y: number; x0?: number; x1?: number; n: number; h0: number; h1: number; fill: string; seed?: number; lit?: string; outline?: string }> = ({
  y, x0 = -200, x1 = 1280, n, h0, h1, fill, seed = 3, lit, outline,
}) => {
  const r = rng(seed);
  const items = Array.from({ length: n }, (_, i) => ({ x: lerp(x0, x1, (i + r() * 0.6) / n), h: lerp(h0, h1, r()), s: Math.floor(r() * 1000) }));
  return <g>{items.map((it, i) => <Pine key={i} x={it.x} y={y + (i % 2) * 10} h={it.h} fill={fill} seed={it.s} lit={lit} outline={outline} />)}</g>;
};

/** Cupola dell'arena: reticolo di esagoni appena visibile nel cielo (gli Strateghi controllano anche il cielo). */
export const Dome: React.FC<{ y0?: number; y1?: number; size?: number; color?: string; opacity?: number; t?: number; flash?: number }> = ({
  y0 = -100, y1 = 1100, size = 70, color = '#BFE8FF', opacity = 0.12, t = 0, flash = 0,
}) => {
  const hx = size * Math.sqrt(3);
  const rows = Math.ceil((y1 - y0) / (size * 1.5)) + 1;
  const cols = Math.ceil(1500 / hx) + 2;
  let d = '';
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const cx = -220 + i * hx + (j % 2 ? hx / 2 : 0), cy = y0 + j * size * 1.5;
      d += `M${f1(cx)} ${f1(cy - size)} l${f1(hx / 2)} ${f1(size / 2)} v${size} l${f1(-hx / 2)} ${f1(size / 2)} l${f1(-hx / 2)} ${f1(-size / 2)} v${-size} Z `;
    }
  }
  return <path d={d} fill="none" stroke={color} strokeWidth="2" opacity={opacity * (0.8 + 0.2 * Math.sin(t * 0.7)) + flash} />;
};

/** Baracca del Distretto 12: legno, tetto di lamiera, finestrella. Origine alla base, al centro. */
export const Shack: React.FC<{ x: number; y: number; w?: number; h?: number; wall: string; roof: string; win?: number; seed?: number; outline?: boolean }> = ({
  x, y, w = 220, h = 150, wall, roof, win = 0, seed = 1, outline = true,
}) => {
  const r = rng(seed);
  const tilt = (r() - 0.5) * 16;
  const k = outline ? K : 'none';
  return (
    <g transform={`translate(${x} ${y})`} strokeLinejoin="round">
      <rect x={-w / 2} y={-h} width={w} height={h} fill={wall} stroke={k} strokeWidth={outline ? 7 : 0} />
      {outline && Array.from({ length: Math.floor(w / 30) }, (_, i) => <path key={i} d={`M${-w / 2 + 30 * (i + 1)} ${-h} V0`} stroke="#000" strokeWidth="3" opacity=".25" />)}
      <path d={`M${-w / 2 - 20} ${-h + 6} L${tilt} ${-h - h * 0.5} L${w / 2 + 20} ${-h + 6} Z`} fill={roof} stroke={k} strokeWidth={outline ? 7 : 0} />
      {outline && <path d={`M${-w / 2 - 10} ${-h} L${tilt} ${-h - h * 0.46}`} stroke="#FFF" strokeWidth="3" opacity=".18" />}
      <rect x={-w * 0.18} y={-h * 0.72} width={w * 0.24} height={h * 0.3} fill={win > 0 ? '#FFC870' : '#1A1E22'} opacity={win > 0 ? 0.4 + 0.6 * win : 1} stroke={k} strokeWidth={outline ? 5 : 0} />
      <rect x={w * 0.16} y={-h * 0.62} width={w * 0.2} height={h * 0.62} fill="#2A2018" stroke={k} strokeWidth={outline ? 5 : 0} />
    </g>
  );
};

/** Grappolo di bacche velenose (viola scuro, quasi nere, con un riflesso). */
export const Berries: React.FC<{ x: number; y: number; s?: number; n?: number; seed?: number; glow?: number }> = ({ x, y, s = 1, n = 9, seed = 5, glow = 0 }) => {
  const r = rng(seed);
  const bs = Array.from({ length: n }, (_, i) => ({ x: (r() - 0.5) * 90 * Math.sqrt(n / 9), y: -(i % 3) * 14 - r() * 10, rr: 13 + r() * 5 }));
  bs.sort((a, b) => a.y - b.y);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {bs.map((b, i) => (
        <g key={i}>
          <circle cx={b.x} cy={b.y} r={b.rr} fill="#2A1438" stroke={K} strokeWidth="4" />
          <circle cx={b.x - b.rr * 0.35} cy={b.y - b.rr * 0.35} r={b.rr * 0.28} fill="#C8A8E8" opacity={0.6 + 0.4 * glow} />
          <circle cx={b.x + b.rr * 0.2} cy={b.y + b.rr * 0.25} r={b.rr * 0.5} fill="#000" opacity=".25" />
        </g>
      ))}
    </g>
  );
};

/** Rosa bianca (il simbolo del presidente Snow) con gambo e spine. Origine alla base del gambo. `bloom` 0..1. */
export const WhiteRose: React.FC<{ x: number; y: number; s?: number; rot?: number; bloom?: number }> = ({ x, y, s = 1, rot = 0, bloom = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeLinejoin="round" strokeLinecap="round">
    <path d="M0 0 Q-10 -160 6 -300" fill="none" stroke={K} strokeWidth="14" />
    <path d="M0 0 Q-10 -160 6 -300" fill="none" stroke="#3A6A3A" strokeWidth="7" />
    {[[-4, -90, -1], [0, -170, 1], [-2, -230, -1]].map(([sx, sy, dir], i) => <path key={i} d={`M${sx} ${sy} l${dir * 14} -6 l${-dir * 8} 14 Z`} fill="#2A4A2A" stroke={K} strokeWidth="3" />)}
    <path d="M-2 -140 Q-70 -170 -90 -120 Q-40 -110 -2 -140 Z" fill="#3E7040" stroke={K} strokeWidth="5" />
    <path d="M-2 -140 Q-50 -138 -82 -124" stroke="#8AB87A" strokeWidth="3" fill="none" />
    <g transform={`translate(6 -330) scale(${0.6 + 0.4 * bloom})`}>
      <path d="M-50 10 Q-70 -40 -30 -60 Q0 -80 30 -60 Q70 -40 50 10 Q20 40 0 40 Q-20 40 -50 10 Z" fill="#F2F0EA" stroke={K} strokeWidth="7" />
      <path d="M-30 -10 Q-20 -50 10 -46 Q36 -40 26 -10 Q10 12 -10 6" fill="none" stroke="#B8B4AA" strokeWidth="5" />
      <path d="M-12 -24 Q0 -36 12 -24" fill="none" stroke="#9A968C" strokeWidth="4" />
      <path d="M-50 10 Q-30 30 0 30 Q30 30 50 10" fill="none" stroke="#D8D4CA" strokeWidth="4" />
      <path d="M-36 -40 Q-20 -58 4 -60" stroke="#FFF" strokeWidth="4" opacity=".8" fill="none" />
      <path d="M-30 30 L-46 46 L-14 40 Z M30 30 L46 46 L14 40 Z" fill="#3E7040" stroke={K} strokeWidth="4" />
    </g>
  </g>
);

/** Ombra morbida a terra. */
export const Ombra: React.FC<{ x: number; y: number; rx: number; ry: number; o?: number }> = ({ x, y, rx, ry, o = 0.35 }) => <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#000" opacity={o} />;
