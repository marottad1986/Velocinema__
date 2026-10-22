import React from 'react';
import { lerp, rng } from '../../lib/anim';
import { Glow, Smoke } from '../../lib/elements';

// Elementi comuni di Dark (stagione 1): bosco di abeti, torri della centrale, e gli oggetti che rappresentano i
// personaggi (formato "spiegato": mai figure, solo oggetti). Coordinate locali: la scena li posiziona con translate.

export const K = '#070A09'; // contorni
export const TINT = '#2F4A40'; // velatura del film (QUALITA §6)
export const YELLOW = '#F2C230'; // accento: impermeabile di Jonas e oggetti chiave
export const RED = '#B8443A'; // filo di Martha, sigillo
export const BRASS = '#C9A458';

/** Fila di abeti con base a quota y; ondeggiano piano. */
export const Pines: React.FC<{ t: number; y: number; n?: number; h?: number; seed?: number; color: string; outline?: string; x0?: number; x1?: number; sway?: number; sw?: number }> = ({
  t, y, n = 12, h = 380, seed = 3, color, outline, x0 = -200, x1 = 1280, sway = 4, sw = 6,
}) => {
  const r = rng(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = lerp(x0, x1, (i + r() * 0.6) / n);
        const hh = h * (0.75 + r() * 0.5), w = hh * 0.36;
        const s = Math.sin(t * 0.9 + i * 1.7) * sway;
        // tre ordini di rami
        const tiers = [0.12, 0.42, 0.68];
        let path = '';
        tiers.forEach((k, j) => {
          const by = y - hh * k, ty = y - hh * (k + 0.42 + (j === 2 ? 0.2 : 0)), bw = w * (1 - j * 0.25);
          path += `M${x - bw} ${by} L${x + s * (j + 1) * 0.5} ${ty} L${x + bw} ${by} Q${x} ${by + 14} ${x - bw} ${by} Z `;
        });
        return (
          <g key={i}>
            <path d={`M${x - 9} ${y} H${x + 9} V${y - hh * 0.15} H${x - 9} Z`} fill={outline ?? color} />
            <path d={path} fill={color} stroke={outline} strokeWidth={outline ? sw : 0} strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  );
};

/** Torre di raffreddamento (iperboloide) con base in (0,0), larga w e alta h; vapore dalla cima. */
export const Tower: React.FC<{ id: string; t: number; w: number; h: number; fill: string; outline?: string; steam?: string; steamOpacity?: number; sw?: number }> = ({
  id, t, w, h, fill, outline, steam = '#DCE3DE', steamOpacity = 0.75, sw = 0,
}) => (
  <g>
    <Smoke id={`${id}-st`} t={t} x={0} y={-h + 20} color={steam} n={9} rise={h * 1.1} wind={-w * 1.2} r0={w * 0.22} r1={w * 0.75} speed={0.12} opacity={steamOpacity} />
    <path
      d={`M${-w / 2} 0 C${-w * 0.3} ${-h * 0.45} ${-w * 0.27} ${-h * 0.75} ${-w * 0.34} ${-h} L${w * 0.34} ${-h} C${w * 0.27} ${-h * 0.75} ${w * 0.3} ${-h * 0.45} ${w / 2} 0 Z`}
      fill={fill} stroke={outline} strokeWidth={sw} strokeLinejoin="round"
    />
    <path d={`M${-w * 0.34} ${-h + 10} H${w * 0.34}`} stroke={outline ?? '#000'} strokeOpacity=".35" strokeWidth="6" />
  </g>
);

/** Impermeabile giallo appeso a un gancio in (0,0): l'oggetto di Jonas. `wind` lo fa oscillare. */
export const Raincoat: React.FC<{ id: string; t: number; scale?: number; wind?: number; glow?: number; wet?: boolean }> = ({ id, t, scale = 1, wind = 1, glow = 0, wet = true }) => {
  const sw = Math.sin(t * 1.3) * 3 * wind;
  return (
    <g transform={`scale(${scale}) rotate(${sw})`}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFE07A" />
          <stop offset=".45" stopColor={YELLOW} />
          <stop offset="1" stopColor="#B88A14" />
        </linearGradient>
      </defs>
      {glow > 0 && <Glow id={`${id}-gl`} x={0} y={170} r={300} t={t} color={YELLOW} amp={0.08} rate={2.2} opacity={0.45 * glow} />}
      <path d="M0 -10 Q-6 -34 10 -36 Q24 -36 22 -22" fill="none" stroke={K} strokeWidth="7" strokeLinecap="round" />
      {/* cappuccio, spalle, corpo e maniche che pendono */}
      <path d="M-46 30 Q-50 -6 0 -8 Q50 -6 46 30 L96 66 Q110 76 108 100 L118 300 Q118 316 102 316 L92 316 L86 140 L84 360 Q0 376 -84 360 L-86 140 L-92 316 L-102 316 Q-118 316 -118 300 L-108 100 Q-110 76 -96 66 Z"
        fill={`url(#${id}-g)`} stroke={K} strokeWidth="9" strokeLinejoin="round" />
      <path d="M-46 30 Q0 54 46 30" fill="none" stroke={K} strokeWidth="6" />
      <path d="M0 50 V356" stroke={K} strokeWidth="5" />
      {[100, 170, 240, 310].map((y) => <circle key={y} cx="12" cy={y} r="6" fill={K} />)}
      <path d="M-70 220 h40 M30 220 h40" stroke={K} strokeWidth="5" />
      <path d="M-78 90 Q-70 230 -74 350" fill="none" stroke="#FFF2B8" strokeWidth="5" opacity=".55" />
      {wet && [[-60, 160], [40, 120], [60, 280], [-30, 300]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y + ((t * 40 + i * 30) % 60)} rx="3" ry="6" fill="#FFF8D8" opacity={0.7 * (1 - ((t * 40 + i * 30) % 60) / 60)} />
      ))}
    </g>
  );
};

/** Mazzo di carte da prestigiatore (0,0 = centro): l'oggetto di Mikkel. `fan` 0..1 apre il ventaglio. */
export const Cards: React.FC<{ fan?: number; scale?: number; lift?: number }> = ({ fan = 0, scale = 1, lift = 0 }) => (
  <g transform={`scale(${scale})`}>
    {[0, 1, 2, 3].map((k) => <rect key={`s${k}`} x={-48 + k * 2} y={-66 + k * 3} width="96" height="132" rx="10" fill="#E8E2D2" stroke={K} strokeWidth="5" />)}
    {[-2, -1, 0, 1, 2].map((k) => (
      <g key={k} transform={`translate(0 ${-lift * (2 - Math.abs(k))}) rotate(${k * 16 * fan} 0 70)`}>
        <rect x="-48" y="-70" width="96" height="132" rx="10" fill={k === 0 ? '#F4EFE2' : '#3E5A86'} stroke={K} strokeWidth="6" />
        {k === 0 ? (
          <>
            <path d="M0 -30 L22 0 L0 30 L-22 0 Z" fill={RED} stroke={K} strokeWidth="3" />
            <text x="-34" y="-40" fontSize="24" fontWeight="800" fill={RED} fontFamily="serif">A</text>
          </>
        ) : (
          <rect x="-38" y="-60" width="76" height="112" rx="6" fill="none" stroke="#C9D3E6" strokeWidth="3" strokeDasharray="6 6" />
        )}
      </g>
    ))}
  </g>
);

/** Busta chiusa con sigillo di ceralacca (0,0 = centro): l'oggetto di Michael. `open` 0..1 alza il lembo. */
export const Letter: React.FC<{ open?: number; scale?: number; seal?: string }> = ({ open = 0, scale = 1, seal = RED }) => (
  <g transform={`scale(${scale})`}>
    <rect x="-150" y="-95" width="300" height="190" rx="8" fill="#E9E1CC" stroke={K} strokeWidth="8" />
    <path d="M-150 95 L-20 -5 M150 95 L20 -5" stroke="#B9AF96" strokeWidth="4" />
    <path d={`M-150 -95 L0 ${lerp(30, -230, open)} L150 -95`} fill={open > 0.5 ? '#DCD2B8' : '#E2D9C1'} stroke={K} strokeWidth="7" strokeLinejoin="round" />
    {open < 0.5 && (
      <g transform="translate(0 28)">
        <path d="M-30 -4 Q-34 -30 -6 -32 Q26 -36 30 -6 Q34 22 6 30 Q-26 34 -30 -4 Z" fill={seal} stroke={K} strokeWidth="5" />
        <circle r="13" fill="none" stroke="#7A2620" strokeWidth="4" />
      </g>
    )}
  </g>
);

/** Gomitolo di filo rosso (0,0 = centro): l'oggetto di Martha. */
export const Yarn: React.FC<{ r?: number }> = ({ r = 46 }) => (
  <g>
    <circle r={r} fill={RED} stroke={K} strokeWidth="7" />
    {[-0.6, -0.2, 0.2, 0.6].map((k, i) => <path key={i} d={`M${-r * 0.9} ${k * r} Q0 ${k * r - r * 0.5} ${r * 0.9} ${k * r + r * 0.15}`} fill="none" stroke="#7E2620" strokeWidth="4" />)}
    <path d={`M${-r * 0.5} ${-r * 0.75} Q${-r * 0.1} ${-r * 0.2} ${r * 0.6} ${-r * 0.7}`} fill="none" stroke="#E0796C" strokeWidth="4" />
  </g>
);

/** Apparecchio di ottone a sfere e manopole (0,0 = base al centro): costruito da Tannhaus, portato dallo straniero. */
export const Device: React.FC<{ id: string; t: number; on?: number; scale?: number }> = ({ id, t, on = 0, scale = 1 }) => {
  const spin = t * (40 + on * 260);
  return (
    <g transform={`scale(${scale})`}>
      <defs>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F2D48A" />
          <stop offset=".5" stopColor={BRASS} />
          <stop offset="1" stopColor="#6E5422" />
        </linearGradient>
        <radialGradient id={`${id}-core`}>
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".4" stopColor="#FFE9A8" />
          <stop offset="1" stopColor={YELLOW} stopOpacity="0" />
        </radialGradient>
      </defs>
      {on > 0 && <Glow id={`${id}-gl`} x={0} y={-140} r={260 + on * 160} t={t} color="#FFF1C2" amp={0.12} rate={6} opacity={0.75 * on} />}
      <rect x="-120" y="-60" width="240" height="60" rx="8" fill="#3A2A1A" stroke={K} strokeWidth="8" />
      {[-80, -40, 0, 40, 80].map((x, i) => <circle key={x} cx={x} cy="-30" r="11" fill={`url(#${id}-b)`} stroke={K} strokeWidth="4" transform={`rotate(${spin * (i % 2 ? 1 : -1)} ${x} -30)`} />)}
      <path d="M-70 -60 L-40 -150 M70 -60 L40 -150 M0 -60 V-110" stroke={K} strokeWidth="7" />
      <g transform={`translate(0 -150) rotate(${spin})`}>
        <ellipse rx="96" ry="28" fill="none" stroke={`url(#${id}-b)`} strokeWidth="9" />
        <ellipse rx="96" ry="28" fill="none" stroke={K} strokeWidth="2" transform="rotate(60)" />
        <ellipse rx="96" ry="28" fill="none" stroke={`url(#${id}-b)`} strokeWidth="9" transform="rotate(-60)" />
      </g>
      <circle cx="0" cy="-150" r="44" fill={`url(#${id}-b)`} stroke={K} strokeWidth="8" />
      <circle cx="0" cy="-150" r={20 + on * 30} fill={`url(#${id}-core)`} opacity={0.4 + on * 0.6} />
      <circle cx="-10" cy="-164" r="9" fill="#FFF6D8" opacity=".7" />
    </g>
  );
};

/** Orologio da taschino aperto (0,0 = centro): l'oggetto di Tannhaus; la lancetta scatta ogni secondo. */
export const PocketWatch: React.FC<{ t: number; scale?: number; reverse?: boolean }> = ({ t, scale = 1, reverse = false }) => {
  const tick = Math.floor(t) * 6 * (reverse ? -1 : 1);
  return (
    <g transform={`scale(${scale})`}>
      <path d="M0 -92 V-120 M-16 -132 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0" fill="none" stroke={K} strokeWidth="7" />
      <circle r="92" fill={BRASS} stroke={K} strokeWidth="8" />
      <circle r="76" fill="#F2ECDC" stroke={K} strokeWidth="5" />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 -66 V-56" stroke={K} strokeWidth="5" transform={`rotate(${i * 30})`} />)}
      <path d="M0 0 V-40" stroke={K} strokeWidth="7" strokeLinecap="round" transform="rotate(300)" />
      <path d="M0 8 V-62" stroke={RED} strokeWidth="4" strokeLinecap="round" transform={`rotate(${tick})`} />
      <circle r="7" fill={K} />
      <path d="M-50 -40 Q-30 -60 -6 -66" fill="none" stroke="#FFFFFF" strokeWidth="5" opacity=".5" />
    </g>
  );
};

/** Colletto bianco da prete (0,0 = centro): l'oggetto di Noah. */
export const Collar: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <g transform={`scale(${scale})`}>
    <path d="M-80 -20 Q0 30 80 -20 L70 30 Q0 74 -70 30 Z" fill="#1A1E1C" stroke={K} strokeWidth="7" strokeLinejoin="round" />
    <rect x="-18" y="6" width="36" height="22" rx="4" fill="#F2F0EA" stroke={K} strokeWidth="5" />
  </g>
);

/** Distintivo da poliziotto (0,0 = centro): l'oggetto di Ulrich. */
export const Badge: React.FC<{ scale?: number; shine?: number }> = ({ scale = 1, shine = 0 }) => (
  <g transform={`scale(${scale})`}>
    <path d="M0 -60 L16 -26 L54 -26 L26 -2 L38 36 L0 14 L-38 36 L-26 -2 L-54 -26 L-16 -26 Z" fill="#C9CED2" stroke={K} strokeWidth="7" strokeLinejoin="round" />
    <circle r="16" fill="#8E969C" stroke={K} strokeWidth="4" />
    <path d={`M${-40 + shine * 80} -40 l20 20`} stroke="#FFFFFF" strokeWidth="6" opacity={Math.sin(shine * Math.PI) * 0.8} strokeLinecap="round" />
  </g>
);
