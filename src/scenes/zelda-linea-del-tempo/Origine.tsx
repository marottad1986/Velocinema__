import React from 'react';
import { eio, lerp, mod, rng } from '../../lib/anim';
import { Clouds, Glow, Gulls, SunRays, Lightning, flashAt } from '../../lib/elements';
import { INK, Spada } from './Schema';
import type { Par } from './Hyrule';

// Il cielo delle origini (coordinate locali 1080×1920): oro in alto, il sole con i raggi, un'isola che galleggia nel
// cielo con la torre e la cascata che cade nel mare di nuvole, isole lontane; a destra la tempesta del demone, un vortice
// di nuvole nere con il bagliore rosso e i fulmini; al centro uno sperone di roccia che esce dalle nuvole con la spada
// piantata in cima nel fascio di luce. Quando il demone viene sconfitto (seal 0→1) il vortice si stringe e viene
// risucchiato nella spada, che resta avvolta da fili d'ombra. In basso il mare di nuvole visto da sotto sfuma nel blu
// del cielo di Hyrule, il luogo sotto.

/** Cumulo di nuvola con la base in ombra. */
export const Cumulo: React.FC<{ x: number; y: number; s?: number; color?: string; shade?: string; T?: number; ph?: number }> = ({ x, y, s = 1, color = '#FFFFFF', shade = '#C8D8EA', T = 0, ph = 0 }) => (
  <g transform={`translate(${x + Math.sin(T * 0.2 + ph) * 18} ${y}) scale(${s})`}>
    {[[-110, 14, 62], [-46, -26, 84], [36, -16, 76], [104, 12, 58], [0, 24, 72]].map(([dx, dy, r], j) => <circle key={j} cx={dx} cy={dy} r={r} fill={color} />)}
    <path d="M-170 34 Q0 80 168 34 Q130 82 0 88 Q-130 82 -170 34 Z" fill={shade} />
    <path d="M-120 -20 Q-60 -90 20 -60" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" opacity=".6" />
  </g>
);

const rr = rng(1111);
const SEA = Array.from({ length: 3 }, (_, k) => Array.from({ length: 16 }, () => ({ dx: rr() * 40, r: 50 + rr() * 50 + k * 14 })));

export const ArtOrigine: React.FC<{ T: number; par: Par; seal: number }> = ({ T, par, seal }) => {
  const sx = 540, sy = 1080; // la spada in cima allo sperone
  const k = 1 - 0.85 * eio(seal);
  const vx = lerp(720, sx, eio(seal) * 0.9), vy = lerp(620, sy - 60, eio(seal) * 0.9);
  const bolt = flashAt(T, [mod(T, 2.6) < 1.3 ? T - mod(T, 2.6) + 0.4 : T - mod(T, 2.6) + 1.7], [0.9]);
  return (
    <g>
      <defs>
        <linearGradient id="or-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E89A4A" /><stop offset=".22" stopColor="#F4C878" /><stop offset=".45" stopColor="#F8E6B8" /><stop offset=".56" stopColor="#D8ECF2" />
          <stop offset=".72" stopColor="#B8D2E8" /><stop offset="1" stopColor="#2E6AB8" />
        </linearGradient>
        <linearGradient id="or-rock" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#C8B498" /><stop offset=".5" stopColor="#9A8468" /><stop offset="1" stopColor="#6A5640" /></linearGradient>
        <linearGradient id="or-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF6D0" stopOpacity="0" /><stop offset=".7" stopColor="#FFF6D0" stopOpacity=".55" /><stop offset="1" stopColor="#FFF6D0" stopOpacity=".15" /></linearGradient>
        <linearGradient id="or-fall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E8F6FF" /><stop offset="1" stopColor="#E8F6FF" stopOpacity="0" /></linearGradient>
      </defs>
      <g transform={par(0.12)}>
        <rect x="-300" y="-300" width="1680" height="2400" fill="url(#or-sky)" />
        <SunRays id="or-rays" x={230} y={430} t={T} color="#FFF2C0" n={12} length={1100} width={70} opacity={0.4} />
        <Glow id="or-sun" x={230} y={430} r={320} t={T} color="#FFF0B0" amp={0.05} rate={1.1} opacity={0.85} />
        <circle cx="230" cy="430" r="70" fill="#FFFBE8" />
        <Clouds id="or-cl" t={T} color="#FFF4E0" seed={4} n={4} y={520} h={160} opacity={0.5} speed={0.12} />
      </g>
      {/* isole lontane */}
      <g transform={par(0.25)}>
        {[[880, 600, 0.45], [980, 760, 0.3], [120, 780, 0.28]].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y + Math.sin(T * 0.6 + i) * 6}) scale(${s})`} opacity=".7">
            <path d="M-160 0 Q0 -26 160 0 L120 40 Q40 200 0 160 Q-50 130 -130 40 Z" fill="#A89880" />
            <path d="M-160 0 Q0 -30 160 0 L156 14 Q0 -12 -156 16 Z" fill="#8AB870" />
          </g>
        ))}
        <Gulls t={T} seed={2} n={4} y={640} h={120} color={INK} size={0.7} period={18} />
      </g>
      {/* l'isola grande con la torre e la cascata */}
      <g transform={par(0.45)}>
        <g transform={`translate(0 ${Math.sin(T * 0.7) * 8})`}>
          <path d="M120 640 Q330 600 560 636 L520 690 Q470 820 380 900 Q330 940 300 880 Q230 790 160 700 Z" fill="url(#or-rock)" stroke={INK} strokeWidth="7" strokeLinejoin="round" />
          {[[220, 700, 300, 760], [300, 720, 360, 830], [420, 700, 450, 790]].map(([a, b, c, d], i) => <path key={i} d={`M${a} ${b} L${c} ${d}`} stroke="#5A4630" strokeWidth="4" opacity=".6" />)}
          <path d="M120 640 Q330 596 560 636 L556 656 Q330 620 124 662 Z" fill="#6AB04E" stroke={INK} strokeWidth="5" />
          {/* radici e rampicanti che pendono */}
          {[200, 260, 470, 510].map((x, i) => <path key={x} d={`M${x} ${660 + i * 6} q${6 + Math.sin(T + i) * 4} 40 ${-4} ${70 + i * 12}`} stroke="#4E8A3A" strokeWidth="4" fill="none" />)}
          {/* la torre con la campana */}
          <rect x="300" y="470" width="70" height="170" fill="#EDE2C6" stroke={INK} strokeWidth="6" />
          <rect x="300" y="470" width="20" height="170" fill="#FFFFFF" opacity=".3" />
          <path d="M288 474 L335 400 L382 474 Z" fill="#C85A3A" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
          <path d="M318 510 h34 v40 h-34 Z" fill="#3A2A1E" stroke={INK} strokeWidth="4" />
          <path d={`M335 516 q-12 12 -10 24 h20 q2 -12 -10 -24`} fill="#F2C230" stroke={INK} strokeWidth="2.5" transform={`rotate(${Math.sin(T * 2) * 10} 335 516)`} />
          <rect x="420" y="560" width="60" height="78" fill="#E4D8BA" stroke={INK} strokeWidth="5" />
          <path d="M410 562 L450 520 L490 562 Z" fill="#3A64B0" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <rect x="440" y="590" width="18" height="24" rx="9" fill="#FFD970" stroke={INK} strokeWidth="3" />
          {[[180, 618, 26], [228, 610, 20], [530, 612, 22]].map(([x, y, r], i) => (
            <g key={i}><circle cx={x} cy={y} r={r} fill="#3E8A40" stroke={INK} strokeWidth="4" /><circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.4} fill="#7CC05A" /></g>
          ))}
          {/* la cascata che cade nel mare di nuvole */}
          <path d="M540 646 Q560 760 556 1020" stroke="url(#or-fall)" strokeWidth="26" fill="none" />
          <path d="M540 646 Q560 760 556 1020" stroke="#FFFFFF" strokeWidth="6" fill="none" strokeDasharray="22 14" strokeDashoffset={-T * 140} opacity=".9" />
        </g>
      </g>
      {/* la tempesta del demone: un vortice di nuvole nere, il bagliore rosso, i fulmini; poi risucchiata nella spada */}
      {k > 0.16 && (
        <g transform={`translate(${vx} ${vy}) scale(${k})`}>
          <Glow id="or-storm" x={0} y={40} r={320} t={T} color="#C8303A" amp={0.2} rate={5} opacity={0.45} />
          {Array.from({ length: 6 }, (_, i) => (
            <g key={i} transform={`rotate(${T * (40 + i * 12) + i * 60}) scale(1 .5)`}>
              <path d={`M${110 + i * 34} 0 A${110 + i * 34} ${110 + i * 34} 0 0 1 ${-(110 + i * 34) * 0.7} ${(110 + i * 34) * 0.7}`} fill="none" stroke={i % 2 ? '#3A2A4A' : '#1E1626'} strokeWidth={46 - i * 5} strokeLinecap="round" opacity={0.95 - i * 0.08} />
            </g>
          ))}
          {[[-150, 30, 80], [-70, -30, 100], [30, -40, 110], [130, -6, 90], [200, 40, 70], [-10, 40, 96]].map(([dx, dy, r], j) => (
            <circle key={j} cx={dx + Math.sin(T * 1.3 + j) * 6} cy={dy + Math.cos(T * 1.1 + j) * 5} r={r} fill={j % 2 ? '#2A2032' : '#3A2C44'} stroke={INK} strokeWidth="6" />
          ))}
          <path d="M-230 60 Q0 110 260 60 Q200 120 0 128 Q-190 120 -230 60 Z" fill="#160F1C" />
          {[[-80, -70], [20, -96], [120, -54]].map(([x, y], i) => <path key={i} d={`M${x - 36} ${y} q36 -22 72 0`} stroke="#6A5A84" strokeWidth="7" fill="none" strokeLinecap="round" />)}
          <ellipse cx="0" cy="100" rx="180" ry="30" fill="#FF4A3A" opacity={0.25 + 0.15 * Math.sin(T * 6)} />
          <Lightning x={-60} y={110} h={300} flash={bolt} seed={3} color="#FFE08A" width={9} />
          <Lightning x={110} y={110} h={240} flash={flashAt(T, [T - mod(T, 1.9) + 1.0], [0.7])} seed={9} color="#FFE08A" width={7} />
        </g>
      )}
      {/* il mare di nuvole, tre strati */}
      {SEA.map((row, j) => (
        <g key={j} transform={par(0.55 + j * 0.15)}>
          <g transform={`translate(${Math.sin(T * 0.25 + j) * 24} 0)`}>
            {row.map((c, i) => <circle key={i} cx={-140 + i * 90 + c.dx} cy={1000 + j * 60} r={c.r} fill={j === 2 ? '#FFFFFF' : j === 1 ? '#F4F6FA' : '#E6EEF6'} />)}
            <rect x="-300" y={1000 + j * 60} width="1680" height="220" fill={j === 2 ? '#FFFFFF' : j === 1 ? '#F4F6FA' : '#E6EEF6'} />
          </g>
        </g>
      ))}
      {/* lo sperone di roccia con la spada nel fascio di luce */}
      <g transform={par(0.75)}>
        <path d={`M${sx - 120} ${sy - 760} L${sx + 120} ${sy - 760} L${sx + 170} ${sy + 20} L${sx - 170} ${sy + 20} Z`} fill="url(#or-beam)" opacity={0.6 + 0.3 * seal} />
        <path d={`M${sx - 150} 1230 Q${sx - 140} 1140 ${sx - 90} ${sy + 30} L${sx - 70} ${sy + 4} H${sx + 72} L${sx + 96} ${sy + 34} Q${sx + 150} 1150 ${sx + 160} 1230 Z`} fill="url(#or-rock)" stroke={INK} strokeWidth="7" strokeLinejoin="round" />
        <path d={`M${sx - 70} ${sy + 4} H${sx + 72} L${sx + 80} ${sy + 18} H${sx - 78} Z`} fill="#6AB04E" stroke={INK} strokeWidth="5" />
        <path d={`M${sx - 60} ${sy + 60} l26 30 M${sx + 30} ${sy + 50} l30 40 M${sx - 20} ${sy + 110} l40 26`} stroke="#5A4630" strokeWidth="4" opacity=".6" />
        <g transform={`translate(${sx} ${sy - 74})`}>
          <Glow id="or-sw" x={0} y={0} r={150} t={T} color="#FFF0A0" amp={0.15} rate={4} opacity={0.5 + 0.4 * seal} />
          <g transform="scale(2.1) rotate(-22)"><Spada /></g>
          {seal > 0.6 && Array.from({ length: 3 }, (_, i) => (
            <ellipse key={i} cx="0" cy={-30 + i * 34} rx={50 - i * 6} ry="13" fill="none" stroke="#3A2A48" strokeWidth="7" strokeDasharray="36 22" strokeDashoffset={-T * 90 * (i % 2 ? 1 : -1)} opacity={0.8 * (seal - 0.6) / 0.4} />
          ))}
        </g>
        {/* nuvole davanti allo sperone */}
        <Cumulo x={260} y={1220} s={1.1} T={T} />
        <Cumulo x={840} y={1250} s={1.25} T={T} ph={2} />
      </g>
      {/* sotto il mare di nuvole: le nuvole viste da sotto, poi il cielo di Hyrule */}
      <g transform={par(0.9)}>
        {Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={-60 + i * 150} cy={1400 + (i % 2) * 30} rx="120" ry="44" fill="#C8D8EA" opacity=".8" />)}
        <Cumulo x={140} y={1640} s={0.9} T={T} ph={1} />
        <Cumulo x={920} y={1720} s={0.8} T={T} ph={3} />
      </g>
    </g>
  );
};
