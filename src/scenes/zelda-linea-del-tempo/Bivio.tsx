import React from 'react';
import { mod, rng } from '../../lib/anim';
import { Fog, Glow, Gulls, Smoke } from '../../lib/elements';
import { INK } from './Schema';
import { Cumulo } from './Origine';
import type { Par } from './Hyrule';

// La valle del bivio (coordinate locali; largo da x −1120 a 2200, alto 1920): si scende tra le nuvole e si vede dall'alto
// una valle all'alba. All'orizzonte il cielo è diviso in tre colori, uno per futuro: a sinistra rosso, sopra montagne
// nere (il regno sigillato), al centro azzurro, sopra il mare (il regno sommerso), a destra ambra, con il sole che tramonta
// (il crepuscolo). Nella pianura campi a scacchi, siepi, boschi, villaggi, mulini; al centro un cerchio di pietre antiche
// dove il filo d'oro si divide (il bivio). I tre fiumi di luce sono disegnati sopra dal Mondo.

const rr = rng(4242);
const FIELDS = Array.from({ length: 70 }, () => ({ x: -1100 + rr() * 3300, y: 840 + rr() * 1080, w: 90 + rr() * 140, h: 40 + rr() * 60, c: ['#8AC460', '#A8C86A', '#6AAE4E', '#C8C870', '#78B858'][Math.floor(rr() * 5)], a: -8 + rr() * 16 }));
const WOODS = Array.from({ length: 120 }, () => ({ x: -1100 + rr() * 3300, y: 820 + rr() * 1100, r: 9 + rr() * 12 }));

export const ArtBivio: React.FC<{ T: number; par: Par }> = ({ T, par }) => (
  <g>
    <defs>
      <linearGradient id="bv-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2E6AB8" /><stop offset=".2" stopColor="#7AA8D8" /><stop offset=".32" stopColor="#E8D8C8" /><stop offset=".38" stopColor="#F4E6C8" />
      </linearGradient>
      <radialGradient id="bv-red" cx=".5" cy="1" r=".8"><stop offset="0" stopColor="#E8503A" stopOpacity=".95" /><stop offset=".6" stopColor="#8A2030" stopOpacity=".6" /><stop offset="1" stopColor="#8A2030" stopOpacity="0" /></radialGradient>
      <radialGradient id="bv-blue" cx=".5" cy="1" r=".8"><stop offset="0" stopColor="#8AD0FF" stopOpacity=".95" /><stop offset=".6" stopColor="#3A80C8" stopOpacity=".5" /><stop offset="1" stopColor="#3A80C8" stopOpacity="0" /></radialGradient>
      <radialGradient id="bv-amb" cx=".5" cy="1" r=".8"><stop offset="0" stopColor="#FFC060" stopOpacity=".95" /><stop offset=".6" stopColor="#E8803A" stopOpacity=".55" /><stop offset="1" stopColor="#E8803A" stopOpacity="0" /></radialGradient>
      <linearGradient id="bv-plain" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9CC86A" /><stop offset="1" stopColor="#4E8A3E" /></linearGradient>
    </defs>
    <g transform={par(0.15)}>
      <rect x="-1400" y="-400" width="3900" height="1500" fill="url(#bv-sky)" />
      {/* i tre orizzonti */}
      <ellipse cx="-560" cy="680" rx="900" ry="420" fill="url(#bv-red)" />
      <ellipse cx="540" cy="680" rx="760" ry="420" fill="url(#bv-blue)" />
      <ellipse cx="1640" cy="680" rx="900" ry="420" fill="url(#bv-amb)" />
      <Glow id="bv-sun" x={1640} y={620} r={300} t={T} color="#FFD27A" amp={0.05} rate={1} opacity={0.8} />
      <circle cx="1640" cy="630" r="80" fill="#FFE6A8" />
      <circle cx="-420" cy="560" r="44" fill="#F2A090" opacity=".85" />
      {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={-1050 + (i * 137) % 1000} cy={300 + (i * 71) % 400} r={1.5 + (i % 3)} fill="#FFE8E0" opacity={0.4 + 0.4 * Math.sin(T * 2 + i)} />)}
    </g>
    <g transform={`${par(0.3)} translate(0 -180)`}>
      {/* sinistra: montagne nere e appuntite */}
      <path d="M-1120 900 L-980 720 L-900 800 L-780 640 L-660 780 L-560 600 L-440 790 L-320 690 L-200 820 L-60 760 L60 900 Z" fill="#2A1420" />
      {/* centro: il mare con le isole */}
      <rect x="40" y="840" width="1020" height="70" fill="#4A90D0" />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${60 + i * 260 + mod(T * 20, 60)} ${860 + (i % 2) * 20} h60`} stroke="#DDF2FF" strokeWidth="3" opacity=".7" />)}
      {[[260, 0.6], [620, 0.9], [880, 0.5]].map(([x, s], i) => <path key={i} d={`M${x - 60 * s} 846 Q${x} ${800 - 20 * s} ${x + 60 * s} 846 Z`} fill="#5A9A50" />)}
      {/* destra: colline morbide controluce */}
      <path d="M1040 900 Q1200 800 1360 850 Q1500 890 1640 830 Q1820 760 2000 860 L2200 900 Z" fill="#5A3048" />
    </g>
    <g transform={par(0.45)}>
      <path d="M-1400 820 Q-600 720 0 780 Q540 820 1080 770 Q1700 720 2500 820 V2100 H-1400 Z" fill="url(#bv-plain)" />
      <Fog id="bv-f1" t={T} y={810} x={540} rx={1600} ry={60} color="#FFF6E8" opacity={0.6} />
    </g>
    <g transform={par(0.6)}>
      {FIELDS.map((f, i) => <rect key={i} x={f.x} y={f.y} width={f.w * (0.5 + (f.y - 820) / 1100)} height={f.h * (0.4 + (f.y - 820) / 900)} fill={f.c} stroke="#4E7A3A" strokeWidth="3" transform={`rotate(${f.a} ${f.x} ${f.y})`} />)}
      {WOODS.map((w, i) => (
        <g key={i}><circle cx={w.x} cy={w.y} r={w.r} fill="#2E7438" stroke={INK} strokeWidth="2.5" /><circle cx={w.x - w.r * 0.3} cy={w.y - w.r * 0.3} r={w.r * 0.4} fill="#6AB050" /></g>
      ))}
      {/* villaggi e mulini */}
      {[[-700, 1250], [200, 1420], [880, 1300], [1500, 1380]].map(([x, y], i) => (
        <g key={i}>
          {[0, 1, 2].map((k) => (
            <g key={k} transform={`translate(${x + k * 46} ${y + (k % 2) * 16})`}>
              <rect x="-16" y="-14" width="32" height="24" fill="#F0E6CE" stroke={INK} strokeWidth="3" />
              <path d="M-21 -12 L0 -32 L21 -12 Z" fill="#C85A3A" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
            </g>
          ))}
          <g transform={`translate(${x - 50} ${y - 10})`}>
            <path d="M-12 30 L-6 -30 H6 L12 30 Z" fill="#E8DCC0" stroke={INK} strokeWidth="3" />
            <g transform={`translate(0 -30) rotate(${T * 50 + i * 30})`}>{[0, 90, 180, 270].map((a) => <rect key={a} x="-4" y="-46" width="8" height="46" fill="#F6EEDA" stroke={INK} strokeWidth="2.5" transform={`rotate(${a})`} />)}</g>
          </g>
          <Smoke id={`bv-s${i}`} t={T + i} x={x + 50} y={y - 40} color="#F0F0F4" n={4} rise={70} wind={30} r0={5} r1={16} speed={0.25} opacity={0.5} />
        </g>
      ))}
      {/* il cerchio di pietre antiche dove il filo si divide */}
      <g transform="translate(540 960)">
        <ellipse rx="190" ry="70" fill="#7AA858" stroke={INK} strokeWidth="4" />
        <ellipse rx="150" ry="52" fill="none" stroke="#FFE08A" strokeWidth="4" strokeDasharray="10 12" strokeDashoffset={-T * 30} opacity=".8" />
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          const x = Math.cos(a) * 170, y = Math.sin(a) * 62;
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path d="M-14 0 L-11 -54 Q0 -62 11 -54 L14 0 Z" fill={y < 0 ? '#A8A090' : '#C8C0AE'} stroke={INK} strokeWidth="4" />
              <path d="M-4 -40 v14 M4 -34 v10" stroke="#FFE08A" strokeWidth="3" opacity={0.5 + 0.5 * Math.sin(T * 3 + i)} />
            </g>
          );
        })}
      </g>
    </g>
    {/* le nuvole tra cui si scende, in alto */}
    <g transform={par(0.85)}>
      <Cumulo x={60} y={60} s={1.4} T={T} />
      <Cumulo x={520} y={10} s={1.6} T={T} ph={1} />
      <Cumulo x={1000} y={80} s={1.3} T={T} ph={2} />
      <Cumulo x={-500} y={140} s={1.3} T={T} ph={3} />
      <Cumulo x={1600} y={120} s={1.4} T={T} ph={4} />
      <Gulls t={T} seed={6} n={5} y={420} h={200} color={INK} size={0.9} period={14} />
    </g>
  </g>
);
