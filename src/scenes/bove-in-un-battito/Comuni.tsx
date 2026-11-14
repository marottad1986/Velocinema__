import React from 'react';
import { lerp, mod, rng } from '../../lib/anim';
import { SANS } from '../../lib/fonts';

// Elementi comuni della storia di Edoardo Bove (calendario/bove-in-un-battito.md).
// Persona reale: nessuna persona disegnata, nemmeno sagome nelle tribune; niente stemmi, loghi, sponsor o maglie.
// Si raccontano luoghi e oggetti: stadi inventati, prato, pallone, tabellone, seggiolini, la linea del battito.

export const K = '#0B0C14'; // contorni
export const GIALLO = '#F5C518'; // accento: la linea del battito e gli oggetti chiave
export const VIOLA = '#6A48A8';
export const GIALLOROSSO = { rosso: '#8E1F2E', giallo: '#F0B43A' };
export const WATFORD = { giallo: '#F5D21E', nero: '#16161A', rosso: '#C8262E' };

// ─────────────────────────── linea del battito ───────────────────────────

/**
 * Tracciato di un elettrocardiogramma da x0 a x1 alla quota y: piatto, con un battito (onda P, picco QRS, onda T)
 * centrato in ciascuna delle x di `beats`. `amp` è l'altezza del picco.
 */
export const heartPath = (x0: number, x1: number, y: number, beats: number[], amp = 120, w = 90) => {
  let d = `M${x0} ${y}`;
  const sorted = [...beats].sort((a, b) => a - b);
  for (const bx of sorted) {
    const a = bx - w;
    if (a < x0) continue;
    d += ` L${a} ${y}`;
    d += ` q${w * 0.12} ${-amp * 0.16} ${w * 0.24} 0`; // onda P
    d += ` L${bx - w * 0.28} ${y}`;
    d += ` L${bx - w * 0.18} ${y + amp * 0.18}`; // Q
    d += ` L${bx} ${y - amp}`; // R
    d += ` L${bx + w * 0.16} ${y + amp * 0.38}`; // S
    d += ` L${bx + w * 0.3} ${y}`;
    d += ` q${w * 0.2} ${-amp * 0.28} ${w * 0.42} 0`; // onda T
  }
  d += ` L${x1} ${y}`;
  return d;
};

/** Linea del battito luminosa: alone largo + linea piena + nucleo chiaro; `draw` 0..1 la disegna da sinistra. */
export const HeartLine: React.FC<{ d: string; draw?: number; len?: number; color?: string; width?: number; glow?: number; core?: string }> = ({
  d, draw = 1, len = 3000, color = GIALLO, width = 10, glow = 0.35, core = '#FFF6C8',
}) => {
  const dash = { strokeDasharray: `${len} ${len}`, strokeDashoffset: (1 - draw) * len };
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={color} strokeWidth={width * 5} opacity={glow * 0.35} style={dash} />
      <path d={d} stroke={color} strokeWidth={width * 2.4} opacity={glow} style={dash} />
      <path d={d} stroke={K} strokeWidth={width + 6} style={dash} />
      <path d={d} stroke={color} strokeWidth={width} style={dash} />
      <path d={d} stroke={core} strokeWidth={width * 0.35} opacity={0.9} style={dash} />
    </g>
  );
};

// ─────────────────────────── stadio ───────────────────────────

/** Prato in prospettiva: strisce di taglio alternate, dall'orizzonte `y0` fino al fondo. */
export const Pitch: React.FC<{ id: string; y0?: number; light?: string; dark?: string; x0?: number; x1?: number; lines?: string; lineOpacity?: number }> = ({
  id, y0 = 1120, light = '#3E8A3A', dark = '#2F7230', x0 = 140, x1 = 940, lines = '#EEF2E6', lineOpacity = 0.85,
}) => {
  const N = 9;
  const yB = 2100;
  const xl = (y: number) => lerp(x0, -900, (y - y0) / (yB - y0));
  const xr = (y: number) => lerp(x1, 1980, (y - y0) / (yB - y0));
  // strisce sempre più alte verso la camera
  const ys = Array.from({ length: N + 1 }, (_, i) => y0 + (yB - y0) * (i / N) ** 1.6);
  const yc = y0 + (yB - y0) * 0.22; // linea di metà campo
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-pd`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".35" />
          <stop offset=".35" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".25" />
        </linearGradient>
      </defs>
      <path d={`M${x0 - 600} ${y0} H${x1 + 600} V${yB} H${x0 - 600 - 1200} Z`} fill={dark} />
      {ys.slice(0, -1).map((y, i) => {
        const y2 = ys[i + 1];
        return <path key={i} d={`M${xl(y) - 400} ${y} H${xr(y) + 400} L${xr(y2) + 600} ${y2} H${xl(y2) - 600} Z`} fill={i % 2 ? dark : light} />;
      })}
      {/* linee del campo: bordo di fondo, laterali, metà campo e cerchio */}
      <g fill="none" stroke={lines} opacity={lineOpacity} strokeLinecap="round">
        <path d={`M${x0} ${y0 + 6} H${x1}`} strokeWidth="4" />
        <path d={`M${x0} ${y0 + 6} L${lerp(x0, -900, 1)} ${yB}`} strokeWidth="6" />
        <path d={`M${x1} ${y0 + 6} L${lerp(x1, 1980, 1)} ${yB}`} strokeWidth="6" />
        <path d={`M${xl(yc)} ${yc} H${xr(yc)}`} strokeWidth="7" />
        <ellipse cx="540" cy={yc} rx="300" ry="62" strokeWidth="7" />
      </g>
      <circle cx="540" cy={yc} r="7" fill={lines} opacity={lineOpacity} />
      <rect x="-400" y={y0} width="1880" height={yB - y0} fill={`url(#${id}-pd)`} />
    </g>
  );
};
/** Quota della linea di metà campo di `Pitch` (per appoggiarci il pallone). */
export const pitchCenterY = (y0 = 1120) => y0 + (2100 - y0) * 0.22;

/** Tribuna di fondo: gradoni con file di seggiolini (colore `seat`, quelli in `alt` a righe), tetto e balaustra. Nessuna persona. */
export const Stand: React.FC<{ id: string; y0: number; y1: number; x0?: number; x1?: number; seat: string; alt?: string; rows?: number; wall?: string; roof?: string; lit?: number; seed?: number }> = ({
  id, y0, y1, x0 = -200, x1 = 1280, seat, alt, rows = 9, wall = '#1A1C28', roof = '#0E0F18', lit = 0.6, seed = 3,
}) => {
  const r = rng(seed);
  const h = (y0 - y1) / rows;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={wall} />
          <stop offset="1" stopColor="#06070C" />
        </linearGradient>
      </defs>
      <rect x={x0} y={y1 - 30} width={x1 - x0} height={y0 - y1 + 30} fill={`url(#${id}-wall)`} />
      {Array.from({ length: rows }, (_, i) => {
        const y = y1 + i * h;
        const sw = 14 + i * 1.6; // seggiolini più larghi verso il basso (più vicini)
        const n = Math.ceil((x1 - x0) / (sw * 1.5));
        return (
          <g key={i} opacity={lit + (1 - lit) * (i / rows)}>
            <rect x={x0} y={y + h * 0.72} width={x1 - x0} height={h * 0.28} fill="#05060A" opacity=".6" />
            {Array.from({ length: n }, (_, k) => {
              const x = x0 + k * sw * 1.5 + (i % 2) * sw * 0.7;
              const c = alt && (k + Math.floor(r() * 2)) % 7 === 0 ? alt : seat;
              return <rect key={k} x={x} y={y + h * 0.2} width={sw} height={h * 0.52} rx={2} fill={c} />;
            })}
          </g>
        );
      })}
      {/* tetto con il bordo illuminato */}
      <path d={`M${x0} ${y1 - 30} H${x1} V${y1 - 70} H${x0} Z`} fill={roof} />
      <path d={`M${x0} ${y1 - 30} H${x1}`} stroke="#9AA4C0" strokeWidth="3" opacity=".45" />
      {/* balaustra davanti alla tribuna */}
      <rect x={x0} y={y0 - 6} width={x1 - x0} height="14" fill="#2A2C3A" />
      <path d={`M${x0} ${y0 - 6} H${x1}`} stroke="#B8C0D8" strokeWidth="3" opacity=".5" />
    </g>
  );
};

/** Torre dei fari: palo a traliccio con il pannello di lampade in cima (alone + fascio verso il campo). */
export const FloodTower: React.FC<{ x: number; y: number; h: number; s?: number; on?: number; lean?: number; outline?: string; pole?: string }> = ({
  x, y, h, s = 1, on = 1, lean = 0, outline = K, pole = '#2A2E3E',
}) => {
  const top = y - h;
  const pw = 150 * s, ph = 90 * s;
  return (
    <g>
      {/* traliccio */}
      <path d={`M${x - 26 * s} ${y} L${x - 8 * s + lean} ${top + ph} L${x + 8 * s + lean} ${top + ph} L${x + 26 * s} ${y} Z`} fill={pole} stroke={outline} strokeWidth={5 * s} />
      {Array.from({ length: 6 }, (_, i) => {
        const yy = lerp(y, top + ph, (i + 0.5) / 6);
        const ww = lerp(26, 8, (i + 0.5) / 6) * s;
        return <path key={i} d={`M${x - ww + lean * ((i + 0.5) / 6)} ${yy} l${ww * 2} ${-(y - top - ph) / 12}`} stroke={outline} strokeWidth={3 * s} opacity=".7" />;
      })}
      {/* pannello delle lampade */}
      <g transform={`translate(${x + lean} ${top + ph / 2}) rotate(${lean * 0.1})`}>
        <rect x={-pw / 2} y={-ph / 2} width={pw} height={ph} rx={6 * s} fill="#1A1C26" stroke={outline} strokeWidth={6 * s} />
        {Array.from({ length: 3 }, (_, rI) =>
          Array.from({ length: 5 }, (_, cI) => (
            <circle key={`${rI}-${cI}`} cx={-pw / 2 + pw * (cI + 0.5) / 5} cy={-ph / 2 + ph * (rI + 0.5) / 3} r={10 * s}
              fill={on > 0.05 ? '#FFFBE8' : '#4A4E5A'} opacity={0.35 + 0.65 * on} />
          )),
        )}
      </g>
    </g>
  );
};

/** Pallone (motivo classico a pentagoni, nessun marchio), ombra a terra se `shadow`. */
export const Ball: React.FC<{ x: number; y: number; r?: number; rot?: number; shadow?: boolean; light?: string; shade?: string }> = ({
  x, y, r = 40, rot = 0, shadow = true, light = '#F6F4EE', shade = '#C9CCD6',
}) => {
  const pent = (cx: number, cy: number, rr: number, a0 = -90) =>
    Array.from({ length: 5 }, (_, i) => {
      const a = ((a0 + i * 72) * Math.PI) / 180;
      return `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
    }).join(' ') + ' Z';
  return (
    <g>
      {shadow && <ellipse cx={x + r * 0.15} cy={y + r * 0.95} rx={r * 1.15} ry={r * 0.28} fill="#000" opacity=".4" />}
      <circle cx={x} cy={y} r={r} fill={light} stroke={K} strokeWidth={Math.max(3, r * 0.14)} />
      <path d={`M${x - r * 0.75} ${y + r * 0.1} A${r} ${r} 0 0 0 ${x + r * 0.5} ${y + r * 0.85}`} stroke={shade} strokeWidth={r * 0.28} fill="none" opacity=".7" />
      <g transform={`rotate(${rot} ${x} ${y})`} fill="#1C1E28">
        <path d={pent(x, y, r * 0.3)} />
        {[0, 72, 144, 216, 288].map((a) => {
          const rad = ((a - 90) * Math.PI) / 180;
          return <path key={a} d={pent(x + Math.cos(rad) * r * 0.82, y + Math.sin(rad) * r * 0.82, r * 0.2, a + 90)} />;
        })}
        {[0, 72, 144, 216, 288].map((a) => {
          const rad = ((a - 90) * Math.PI) / 180;
          return <path key={`l${a}`} d={`M${x + Math.cos(rad) * r * 0.3} ${y + Math.sin(rad) * r * 0.3} L${x + Math.cos(rad) * r * 0.62} ${y + Math.sin(rad) * r * 0.62}`} stroke="#1C1E28" strokeWidth={r * 0.06} />;
        })}
      </g>
      <circle cx={x - r * 0.35} cy={y - r * 0.4} r={r * 0.18} fill="#FFFFFF" opacity=".75" />
    </g>
  );
};

/** Tabellone luminoso: cornice scura su un palo, testo a led (una o due righe). */
export const Scoreboard: React.FC<{ id: string; x: number; y: number; w: number; h: number; t: number; lines: { text: string; color?: string; size?: number }[]; on?: number; legs?: number }> = ({
  id, x, y, w, h, t, lines, on = 1, legs = 0,
}) => (
  <g>
    {legs > 0 && (
      <>
        <rect x={x + w * 0.2 - 10} y={y + h} width="20" height={legs} fill="#20222E" stroke={K} strokeWidth="5" />
        <rect x={x + w * 0.8 - 10} y={y + h} width="20" height={legs} fill="#20222E" stroke={K} strokeWidth="5" />
      </>
    )}
    <defs>
      <radialGradient id={`${id}-sg`}>
        <stop offset="0" stopColor="#FFE9A0" stopOpacity=".5" />
        <stop offset="1" stopColor="#FFE9A0" stopOpacity="0" />
      </radialGradient>
      <pattern id={`${id}-led`} width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#000" opacity="0" />
        <circle cx="4" cy="4" r="1.2" fill="#000" opacity=".35" />
      </pattern>
    </defs>
    <ellipse cx={x + w / 2} cy={y + h / 2} rx={w * 0.9} ry={h * 1.1} fill={`url(#${id}-sg)`} opacity={0.6 * on * (0.92 + 0.08 * Math.sin(t * 2.2))} />
    <rect x={x} y={y} width={w} height={h} rx="10" fill="#0D0E16" stroke={K} strokeWidth="9" />
    <rect x={x + 12} y={y + 12} width={w - 24} height={h - 24} rx="4" fill="#05060A" />
    {lines.map((l, i) => (
      <text key={i} x={x + w / 2} y={y + h * ((i + 1) / (lines.length + 1)) + (l.size ?? 60) * 0.35} textAnchor="middle" fontFamily={SANS} fontWeight={800}
        fontSize={l.size ?? 60} letterSpacing="0.06em" fill={l.color ?? '#FFD15A'} opacity={on}>
        {l.text}
      </text>
    ))}
    <rect x={x + 12} y={y + 12} width={w - 24} height={h - 24} fill={`url(#${id}-led)`} />
    <path d={`M${x + 8} ${y + 8} H${x + w - 8}`} stroke="#8A90A8" strokeWidth="3" opacity=".5" />
  </g>
);

/** Pino marittimo a ombrello (Roma): tronco sottile e chioma piatta. */
export const UmbrellaPine: React.FC<{ x: number; y: number; h: number; w: number; fill: string; lit?: string; outline?: string; lean?: number }> = ({
  x, y, h, w, fill, lit, outline, lean = 0,
}) => {
  const ty = y - h;
  return (
    <g>
      <path d={`M${x - 10} ${y} Q${x + lean * 0.4} ${y - h * 0.5} ${x + lean} ${ty + 30} L${x + lean + 14} ${ty + 30} Q${x + lean * 0.4 + 16} ${y - h * 0.5} ${x + 12} ${y} Z`}
        fill={outline ? '#3A2A22' : fill} stroke={outline} strokeWidth={outline ? 5 : 0} />
      <path d={`M${x + lean - w / 2} ${ty + 30} Q${x + lean - w / 2 - 20} ${ty - 10} ${x + lean - w * 0.25} ${ty - 30} Q${x + lean} ${ty - 60} ${x + lean + w * 0.28} ${ty - 34} Q${x + lean + w / 2 + 24} ${ty - 6} ${x + lean + w / 2} ${ty + 30} Q${x + lean} ${ty + 50} ${x + lean - w / 2} ${ty + 30} Z`}
        fill={fill} stroke={outline} strokeWidth={outline ? 7 : 0} />
      {lit && <path d={`M${x + lean - w * 0.3} ${ty - 24} Q${x + lean} ${ty - 54} ${x + lean + w * 0.26} ${ty - 30}`} stroke={lit} strokeWidth="6" fill="none" opacity=".6" />}
    </g>
  );
};

/** Pioggerella fine (linee corte inclinate), per lo stadio inglese. */
export const Drizzle: React.FC<{ t: number; seed?: number; n?: number; color?: string; opacity?: number; len?: number; speed?: number; y0?: number; y1?: number }> = ({
  t, seed = 9, n = 70, color = '#C8D4E8', opacity = 0.35, len = 26, speed = 900, y0 = -100, y1 = 2000,
}) => {
  const r = rng(seed);
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = r() * 1300 - 110, ph = r() * (y1 - y0);
    const y = y0 + mod(ph + t * speed * (0.8 + r() * 0.4), y1 - y0);
    d += `M${(x - (y - y0) * 0.12).toFixed(0)} ${y.toFixed(0)} l-4 ${len} `;
  }
  return <path d={d} stroke={color} strokeWidth="2.5" opacity={opacity} strokeLinecap="round" />;
};
