import React from 'react';
import { DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import { rng } from '../../lib/anim';

// Copertina verticale (1080×1920) che pubblicizza il canale YouTube «In 2 Minuti».
// Una sala di cinema vuota: sipario rosso ai lati, il fascio del proiettore che illumina uno schermo 16:9 con il
// conto alla rovescia di una vecchia pellicola fermo sul «2» (immagine generica), cornice di lampadine da insegna, file di poltrone vuote in basso (una con il secchiello di popcorn).
// Sopra: logo (cronometro «2'» + IN 2 MINUTI) e cartellino «IL CANALE YOUTUBE»; sotto lo schermo «Le versioni complete»
// (i lunghi sono più approfonditi), i giorni delle uscite, «Iscriviti» con la campanella e la ricerca «@in.2.minuti». Niente logo di YouTube, nessuna persona.
// Zone sicure: nessun testo nei primi 250 px e negli ultimi 420; sotto y 800 i testi stanno tra x 120 e 900.

const K = '#0A0809';
const YEL = '#FFC400';
const CHALK = '#F3EBDD';
const RED = '#E0342B';
const VELVET = '#7E1420';
const VELVET_D = '#3E0710';
const BRASS = '#C9973F';

const SCR = { x: 120, y: 600, w: 840, h: 472 };
const ID = 'cc';

const Bulbs: React.FC = () => {
  const pts: [number, number][] = [];
  const x0 = SCR.x - 34, y0 = SCR.y - 34, x1 = SCR.x + SCR.w + 34, y1 = SCR.y + SCR.h + 34;
  const nx = 16, ny = 9;
  for (let i = 0; i <= nx; i++) { pts.push([x0 + ((x1 - x0) * i) / nx, y0]); pts.push([x0 + ((x1 - x0) * i) / nx, y1]); }
  for (let j = 1; j < ny; j++) { pts.push([x0, y0 + ((y1 - y0) * j) / ny]); pts.push([x1, y0 + ((y1 - y0) * j) / ny]); }
  return (
    <g>
      <rect x={x0 - 18} y={y0 - 18} width={x1 - x0 + 36} height={y1 - y0 + 36} rx="18" fill="#2A1A10" stroke={K} strokeWidth="6" />
      <rect x={x0 - 8} y={y0 - 8} width={x1 - x0 + 16} height={y1 - y0 + 16} rx="10" fill="none" stroke={BRASS} strokeWidth="4" opacity=".7" />
      {pts.map(([x, y], i) => {
        const spenta = i % 11 === 4;
        return (
          <g key={i}>
            {!spenta && <circle cx={x} cy={y} r="22" fill={`url(#${ID}-bulb)`} />}
            <circle cx={x} cy={y} r="8.5" fill={spenta ? '#6B5530' : '#FFF1C2'} stroke={K} strokeWidth="2.5" />
            {!spenta && <circle cx={x - 2.5} cy={y - 2.5} r="2.6" fill="#FFFFFF" />}
          </g>
        );
      })}
    </g>
  );
};

/** Sipario di velluto: pieghe verticali con luce sul bordo interno. */
const Curtain: React.FC<{ side: 'l' | 'r' }> = ({ side }) => {
  const s = side === 'l' ? 1 : -1;
  const X = (x: number) => (side === 'l' ? x : 1080 - x);
  const folds = [0, 34, 70, 104, 136];
  return (
    <g>
      <path d={`M${X(-10)} -10 L${X(170)} -10 C${X(150)} 500 ${X(120)} 900 ${X(60)} 1400 L${X(30)} 1930 L${X(-10)} 1930 Z`}
        fill={`url(#${ID}-velvet-${side})`} stroke={K} strokeWidth="6" />
      {folds.map((f, i) => (
        <path key={i} d={`M${X(f + 14)} -10 C${X(f + 6 - i * 4)} 600 ${X(f - i * 10)} 1100 ${X(Math.max(4, f * 0.35))} 1930`}
          fill="none" stroke={i % 2 ? VELVET_D : '#B42634'} strokeWidth={i % 2 ? 10 : 4} opacity={i % 2 ? 0.7 : 0.55} />
      ))}
      {/* nappa dorata */}
      <path d={`M${X(-10)} 1400 Q${X(60)} 1370 ${X(100)} 1340`} fill="none" stroke={BRASS} strokeWidth="10" strokeLinecap="round" />
      <circle cx={X(100)} cy="1340" r="16" fill={BRASS} stroke={K} strokeWidth="4" />
      <path d={`M${X(90)} 1354 L${X(82)} 1420 L${X(118)} 1420 L${X(110)} 1354 Z`} fill="#A87628" stroke={K} strokeWidth="4" />
    </g>
  );
};

/** Lampadario-mantovana in alto: il bordo del sipario superiore. */
const Valance: React.FC = () => (
  <g>
    <path d="M-10 -10 H1090 V150 Q1035 205 975 150 Q915 205 855 150 Q795 205 735 150 Q675 205 615 150 Q555 205 495 150 Q435 205 375 150 Q315 205 255 150 Q195 205 135 150 Q75 205 15 150 Q0 160 -10 150 Z"
      fill={`url(#${ID}-valance)`} stroke={K} strokeWidth="6" />
    <path d="M-10 132 Q75 187 135 132 Q195 187 255 132 Q315 187 375 132 Q435 187 495 132 Q555 187 615 132 Q675 187 735 132 Q795 187 855 132 Q915 187 975 132 Q1035 187 1090 132"
      fill="none" stroke={BRASS} strokeWidth="5" opacity=".85" />
  </g>
);

/** Cronometro del logo con «2'». */
const Stopwatch: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r + 40} fill={`url(#${ID}-glowY)`} />
    <rect x={-16} y={-r - 34} width="32" height="26" rx="5" fill={YEL} stroke={K} strokeWidth="6" />
    <rect x={-28} y={-r - 46} width="56" height="16" rx="6" fill={YEL} stroke={K} strokeWidth="6" />
    <g transform="rotate(42)"><rect x={-9} y={-r - 22} width="18" height="20" rx="4" fill={YEL} stroke={K} strokeWidth="5" /></g>
    <circle r={r} fill="#FFFFFF" stroke={K} strokeWidth="10" />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const r0 = r - 22, r1 = i % 3 === 0 ? r - 36 : r - 30;
      return <line key={i} x1={Math.sin(a) * r0} y1={-Math.cos(a) * r0} x2={Math.sin(a) * r1} y2={-Math.cos(a) * r1} stroke={K} strokeWidth={i % 3 === 0 ? 5 : 3} strokeLinecap="round" />;
    })}
    {/* settore dei 2 minuti */}
    <path d={`M0 0 L0 ${-(r - 40)} A${r - 40} ${r - 40} 0 0 1 ${Math.sin(Math.PI / 3) * (r - 40)} ${-Math.cos(Math.PI / 3) * (r - 40)} Z`} fill={YEL} />
    <text x="6" y={r * 0.3} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize={r * 0.92} fill={K}>2'</text>
  </g>
);

/** Sullo schermo: il conto alla rovescia di una vecchia pellicola, fermo sul «2» (immagine generica, nessun film). */
const Thumb: React.FC = () => {
  const cx = SCR.x + SCR.w / 2, cy = SCR.y + SCR.h / 2 - 10, r = 178;
  const d = rng(33);
  const specks = Array.from({ length: 26 }, () => [SCR.x + d() * SCR.w, SCR.y + d() * SCR.h, 1.5 + d() * 4, d() > 0.5] as const);
  const sweep = (300 / 360) * Math.PI * 2;
  return (
    <g>
      <clipPath id={`${ID}-scr`}><rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} /></clipPath>
      <g clipPath={`url(#${ID}-scr)`}>
        <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} fill={`url(#${ID}-leader)`} />
        {/* settore già trascorso, più scuro */}
        <path d={`M${cx} ${cy} L${cx} ${cy - 700} A700 700 0 1 1 ${cx + Math.sin(sweep) * 700} ${cy - Math.cos(sweep) * 700} Z`} fill="#3B342B" opacity=".22" />
        <line x1={cx} y1={cy} x2={cx + Math.sin(sweep) * 700} y2={cy - Math.cos(sweep) * 700} stroke="#2A241D" strokeWidth="5" opacity=".6" />
        {/* mirino */}
        <line x1={SCR.x} y1={cy} x2={SCR.x + SCR.w} y2={cy} stroke="#2A241D" strokeWidth="4" opacity=".75" />
        <line x1={cx} y1={SCR.y} x2={cx} y2={SCR.y + SCR.h} stroke="#2A241D" strokeWidth="4" opacity=".75" />
        <circle cx={cx} cy={cy} r={r + 34} fill="none" stroke="#2A241D" strokeWidth="9" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F4EEDF" strokeWidth="6" opacity=".9" />
        <circle cx={cx} cy={cy} r={r - 12} fill="none" stroke="#2A241D" strokeWidth="4" />
        <text x={cx} y={cy + 96} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="270" fill="#1E1913">2</text>
        {/* polvere, peli e graffi della pellicola */}
        {specks.map(([x, y, rr, light], i) => <circle key={i} cx={x} cy={y} r={rr} fill={light ? '#FFF8E8' : '#1E1913'} opacity=".55" />)}
        <path d={`M${SCR.x + 190} ${SCR.y} L${SCR.x + 186} ${SCR.y + SCR.h}`} stroke="#FFF8E8" strokeWidth="2" opacity=".45" />
        <path d={`M${SCR.x + 668} ${SCR.y + 40} Q${SCR.x + 690} ${SCR.y + 70} ${SCR.x + 672} ${SCR.y + 104}`} fill="none" stroke="#1E1913" strokeWidth="2.5" opacity=".7" />
        {/* luce del proiettore più forte al centro, bordi bruciati */}
        <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} fill={`url(#${ID}-scrVig)`} />
        <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} fill={`url(#${ID}-grain)`} opacity=".6" />
      </g>
      <rect x={SCR.x} y={SCR.y} width={SCR.w} height={SCR.h} fill="none" stroke={K} strokeWidth="8" />
    </g>
  );
};

/** Una poltrona di cinema vista da dietro. */
const Seat: React.FC<{ x: number; y: number; s: number; tone: number }> = ({ x, y, s, tone }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-62 -110 Q-62 -140 -32 -140 L32 -140 Q62 -140 62 -110 L58 10 L-58 10 Z" fill={tone ? '#6A1019' : '#56101A'} stroke={K} strokeWidth="6" />
    <path d="M-46 -118 Q-46 -128 -30 -128 L30 -128 Q46 -128 46 -118" fill="none" stroke="#C03344" strokeWidth="6" strokeLinecap="round" opacity=".75" />
    <path d="M-40 -90 L-40 -10 M0 -100 L0 -10 M40 -90 L40 -10" stroke="#3E0910" strokeWidth="5" opacity=".7" />
    <rect x="-74" y="-30" width="16" height="60" rx="6" fill="#2A1A12" stroke={K} strokeWidth="5" />
    <rect x="58" y="-30" width="16" height="60" rx="6" fill="#2A1A12" stroke={K} strokeWidth="5" />
    <circle cx="-44" cy="-120" r="4" fill={BRASS} />
  </g>
);

const Popcorn: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const r = rng(77);
  const kernels = Array.from({ length: 16 }, () => [(r() - 0.5) * 92, -r() * 46 - 6, 13 + r() * 7] as const);
  return (
    <g transform={`translate(${x} ${y}) rotate(-6)`}>
      {kernels.map(([kx, ky, kr], i) => <circle key={i} cx={kx} cy={ky} r={kr} fill={i % 3 ? '#FFF4D6' : '#FFE08A'} stroke={K} strokeWidth="3.5" />)}
      <path d="M-56 0 L56 0 L42 120 L-42 120 Z" fill="#FFFFFF" stroke={K} strokeWidth="6" />
      {[-34, -11, 12, 35].map((sx, i) => <path key={i} d={`M${sx - 9} 0 L${sx + 9} 0 L${sx * 0.76 + 7} 120 L${sx * 0.76 - 7} 120 Z`} fill={RED} />)}
      <path d="M-56 0 L56 0 L42 120 L-42 120 Z" fill="none" stroke={K} strokeWidth="6" />
    </g>
  );
};

export const CopertinaCanale: React.FC = () => {
  const r = rng(91);
  const motes = Array.from({ length: 70 }, () => {
    const p = r();
    const x = 980 - p * 520 + (r() - 0.5) * (60 + p * 260);
    const y = 120 + p * 520 + (r() - 0.5) * (40 + p * 140);
    return [x, y, 1.5 + r() * 3, 0.25 + r() * 0.5] as const;
  });
  return (
    <div style={{ width: 1080, height: 1920, background: K }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        <defs>
          <FxDefs id={ID} />
          <Lin id={`${ID}-bg`} stops={[[0, '#1B0E16'], [0.45, '#140B12'], [1, '#07050A']]} />
          <radialGradient id={`${ID}-leader`} cx=".5" cy=".48" r=".75">
            <stop offset="0" stopColor="#F2E9D4" />
            <stop offset=".6" stopColor="#C9BC9F" />
            <stop offset="1" stopColor="#8C7E64" />
          </radialGradient>
          <radialGradient id={`${ID}-scrVig`} cx=".5" cy=".5" r=".72">
            <stop offset=".6" stopColor="#2A1C0C" stopOpacity="0" />
            <stop offset="1" stopColor="#2A1C0C" stopOpacity=".55" />
          </radialGradient>
          <Lin id={`${ID}-valance`} stops={[[0, '#4A0A14'], [1, '#8E1A26']]} />
          <Lin id={`${ID}-velvet-l`} stops={[[0, VELVET_D], [0.7, VELVET], [1, '#9A2230']]} x2={1} y2={0} />
          <Lin id={`${ID}-velvet-r`} stops={[[0, '#9A2230'], [0.3, VELVET], [1, VELVET_D]]} x2={1} y2={0} />
          <Lin id={`${ID}-beam`} stops={[[0, '#FFF3CC', 0.5], [1, '#FFF3CC', 0]]} x2={-0.6} y2={1} />
          <Lin id={`${ID}-floor`} stops={[[0, '#000', 0], [1, '#000', 0.85]]} />
          <radialGradient id={`${ID}-dial`} cx=".38" cy=".32" r=".8">
            <stop offset="0" stopColor="#F6E2AE" />
            <stop offset=".6" stopColor="#D9B46A" />
            <stop offset="1" stopColor="#A47A35" />
          </radialGradient>
          <GlowGradient id={`${ID}-bulb`} color="#FFD970" core={0.9} mid={0.3} />
          <GlowGradient id={`${ID}-glowY`} color={YEL} core={0.35} mid={0.12} />
          <GlowGradient id={`${ID}-glowTeal`} color="#5FD3D0" core={0.38} mid={0.12} />
          <GlowGradient id={`${ID}-glowScreen`} color="#FFE7A8" core={0.3} mid={0.1} />
          <GlowGradient id={`${ID}-glowRed`} color={RED} core={0.55} mid={0.18} />
        </defs>

        {/* sala */}
        <rect width="1080" height="1920" fill={`url(#${ID}-bg)`} />
        <ellipse cx="540" cy="840" rx="760" ry="620" fill={`url(#${ID}-glowScreen)`} />
        {/* parete di fondo con pannelli */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={70 + i * 160} y="1150" width="140" height="300" rx="8" fill="#1E1018" stroke="#0A0609" strokeWidth="4" opacity=".7" />
        ))}

        {/* fascio del proiettore (dal fondo della sala, in alto a destra) */}
        <path d="M1010 90 L1040 120 L960 1072 L120 1072 Z" fill={`url(#${ID}-beam)`} opacity=".38" />
        <path d="M1010 90 L1040 120 L700 1072 L360 1072 Z" fill={`url(#${ID}-beam)`} opacity=".3" />
        {motes.map(([x, y, rr, o], i) => <circle key={i} cx={x} cy={y} r={rr} fill="#FFF3CC" opacity={o} />)}

        {/* schermo con cornice di lampadine */}
        <Bulbs />
        <Thumb />

        {/* sipari */}
        <Curtain side="l" />
        <Curtain side="r" />
        <Valance />

        {/* logo */}
        <Stopwatch x={222} y={378} r={78} />
        <text x="330" y="416" fontFamily={DISPLAY} fontWeight={800} fontSize="104" fill={YEL} stroke={K} strokeWidth="12" paintOrder="stroke" letterSpacing="-2">IN 2 MINUTI</text>

        {/* cartellino del canale (senza logo) */}
        <g transform="translate(540 512)">
          <rect x="-250" y="-34" width="500" height="68" rx="34" fill={RED} stroke={K} strokeWidth="6" />
          <text y="14" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="38" letterSpacing="5" fill="#FFFFFF">IL CANALE YOUTUBE</text>
        </g>

        {/* poltrone vuote in basso (piani: fila lontana, fila vicina) */}
        <rect x="0" y="1480" width="1080" height="440" fill="#0B070A" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <Seat key={`a${i}`} x={60 + i * 160} y={1640} s={1} tone={i % 2} />)}
        <Popcorn x={700} y={1670} />
        {[0, 1, 2, 3, 4, 5].map((i) => <Seat key={`b${i}`} x={140 + i * 200} y={1900} s={1.35} tone={(i + 1) % 2} />)}
        <rect x="0" y="1480" width="1080" height="440" fill={`url(#${ID}-floor)`} />

        {/* promessa */}
        <text x="510" y="1180" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="70" fill={CHALK} stroke={K} strokeWidth="10" paintOrder="stroke">Le versioni complete</text>
        <text x="510" y="1238" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="36" fill={YEL} stroke={K} strokeWidth="7" paintOrder="stroke" letterSpacing="1">NUOVI VIDEO OGNI MERCOLEDÌ E SABATO</text>

        {/* pulsante iscriviti */}
        <ellipse cx="510" cy="1318" rx="330" ry="80" fill={`url(#${ID}-glowRed)`} />
        <g transform="translate(510 1318)">
          <rect x="-250" y="-46" width="500" height="92" rx="46" fill={RED} stroke={K} strokeWidth="7" />
          <rect x="-236" y="-38" width="472" height="30" rx="15" fill="#FFFFFF" opacity=".14" />
          <text x="-34" y="17" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="48" fill="#FFFFFF">Iscriviti</text>
          {/* campanella */}
          <g transform="translate(150 0) rotate(14)">
            <path d="M-22 14 Q-22 -26 0 -28 Q22 -26 22 14 L28 20 L-28 20 Z" fill="#FFFFFF" stroke={K} strokeWidth="4" />
            <circle cy="-31" r="5" fill="#FFFFFF" stroke={K} strokeWidth="3" />
            <circle cy="25" r="7" fill="#FFFFFF" stroke={K} strokeWidth="3" />
          </g>
          <path d="M196 -24 Q206 -12 204 2 M210 -34 Q226 -14 222 8" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* barra di ricerca */}
        <g transform="translate(510 1432)">
          <rect x="-300" y="-40" width="600" height="80" rx="40" fill={CHALK} stroke={K} strokeWidth="6" />
          <circle cx="-246" cy="-6" r="17" fill="none" stroke="#2A2320" strokeWidth="6" />
          <line x1="-234" y1="7" x2="-218" y2="23" stroke="#2A2320" strokeWidth="7" strokeLinecap="round" />
          <text x="-196" y="14" fontFamily={SANS} fontWeight={800} fontSize="40" fill="#14100E">@in.2.minuti</text>
          <rect x="54" y="-22" width="4" height="44" fill="#14100E" />
        </g>

        <Finish id={ID} tint="#2A0E14" tintOpacity={0.08} />
      </svg>
    </div>
  );
};
