import React from 'react';
import { rng } from '../../lib/anim';
import { Fog, Glow, Gulls, Smoke, SunRays, Flyers } from '../../lib/elements';
import { INK } from './Schema';
import { Cumulo } from './Origine';
import type { Par } from './Hyrule';

// Molto dopo (coordinate locali 1080×1920): le terre selvagge all'ora d'oro, viste da un altopiano. Cielo caldo con i
// raggi, montagne a strati nella foschia, un vulcano che fuma con il cratere acceso, rovine antiche (colonne spezzate,
// un arco, una torre diroccata) mangiate dall'erba e dall'edera, nebbia che scorre a strati, uccelli; davanti l'erba alta
// che ondeggia e i fiori. I tre rami arrivano dall'alto tratteggiati e si perdono nella nebbia (disegnati dal Mondo).

const rr = rng(7777);
const GRASS = Array.from({ length: 140 }, () => ({ x: rr() * 1080, y: 1260 + rr() * 660, h: 18 + rr() * 30, ph: rr() * 6 }));
const FLOW = Array.from({ length: 60 }, () => ({ x: rr() * 1080, y: 1280 + rr() * 640, c: ['#FFF6E8', '#F6A8C4', '#F7D04A', '#C8A0F0'][Math.floor(rr() * 4)], s: 3 + rr() * 4 }));

export const ArtDopo: React.FC<{ T: number; par: Par }> = ({ T, par }) => (
  <g>
    <defs>
      <linearGradient id="dp-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3A6AB0" /><stop offset=".3" stopColor="#8AB4D8" /><stop offset=".5" stopColor="#F4D8A8" /><stop offset=".6" stopColor="#F8C878" />
      </linearGradient>
      <linearGradient id="dp-m1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9AAACC" /><stop offset="1" stopColor="#D8C8B8" /></linearGradient>
      <linearGradient id="dp-m2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6A86A8" /><stop offset="1" stopColor="#A8B0B0" /></linearGradient>
      <linearGradient id="dp-plat" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8AC060" /><stop offset="1" stopColor="#4E8A3E" /></linearGradient>
      <linearGradient id="dp-mead" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7AB856" /><stop offset="1" stopColor="#2C5A2A" /></linearGradient>
      <linearGradient id="dp-stone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#E8DCC0" /><stop offset="1" stopColor="#A89878" /></linearGradient>
      <linearGradient id="dp-volc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#9A6A5A" /><stop offset="1" stopColor="#5A3A32" /></linearGradient>
    </defs>
    <g transform={par(0.12)}>
      <rect x="-300" y="-300" width="1680" height="2500" fill="url(#dp-sky)" />
      <SunRays id="dp-rays" x={720} y={900} t={T} color="#FFE8B0" n={12} length={1100} width={70} opacity={0.4} />
      <Glow id="dp-sun" x={720} y={900} r={360} t={T} color="#FFE0A0" amp={0.05} rate={1} opacity={0.85} />
      <circle cx="720" cy="900" r="80" fill="#FFF4D8" />
      <Cumulo x={200} y={560} s={1} T={T} color="#FFF4E8" shade="#E8C8B0" />
      <Cumulo x={900} y={500} s={0.8} T={T} ph={2} color="#FFF4E8" shade="#E8C8B0" />
      <Gulls t={T} seed={11} n={5} y={600} h={200} color={INK} size={0.8} period={16} />
    </g>
    <g transform={par(0.3)}>
      <path d="M-200 1060 L40 900 L180 980 L340 860 L500 960 L620 900 L760 990 L900 880 L1280 980 V1200 H-200 Z" fill="url(#dp-m1)" opacity=".9" />
      {/* il vulcano */}
      <path d="M700 1060 L860 760 H940 L1100 1060 Z" fill="url(#dp-volc)" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      <path d="M860 760 Q900 790 940 760 L930 800 Q900 812 870 800 Z" fill="#FF6A3A" />
      <path d="M880 800 Q870 880 840 960 M920 800 Q940 900 980 980" stroke="#FF6A3A" strokeWidth="6" fill="none" opacity=".8" />
      <Glow id="dp-cr" x={900} y={770} r={90} t={T} color="#FF6A3A" amp={0.15} rate={3} opacity={0.6} />
      <Smoke id="dp-vs" t={T} x={900} y={740} color="#B8A8A0" n={8} rise={320} wind={-200} r0={24} r1={100} speed={0.15} opacity={0.65} />
      <path d="M-200 1120 L120 1000 L320 1070 L520 980 L700 1080 L1280 1040 V1250 H-200 Z" fill="url(#dp-m2)" />
      <Fog id="dp-f1" t={T} y={1080} x={540} rx={800} ry={60} color="#FFF0E0" opacity={0.7} />
    </g>
    {/* l'altopiano con le rovine */}
    <g transform={par(0.55)}>
      <path d="M-200 1180 Q200 1090 540 1130 Q860 1170 1280 1100 V1400 H-200 Z" fill="url(#dp-plat)" stroke={INK} strokeWidth="6" />
      {/* torre diroccata */}
      <path d="M120 1170 V900 l18 -16 l14 20 l20 -26 l16 18 l14 -10 V1170 Z" fill="url(#dp-stone)" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      <rect x="150" y="960" width="22" height="34" rx="11" fill="#2A2018" />
      <rect x="150" y="1050" width="22" height="34" rx="11" fill="#2A2018" />
      <path d="M120 980 q40 20 82 -6 M120 1100 q30 -10 82 10" stroke="#4E8A3A" strokeWidth="7" fill="none" />
      {/* colonne e arco */}
      {[[400, 0], [480, 1], [600, 2], [690, 3]].map(([x, i]) => (
        <g key={i}>
          <rect x={x - 20} y={1000 + (i % 2) * 40} width="40" height={150 - (i % 2) * 40} fill="url(#dp-stone)" stroke={INK} strokeWidth="5" />
          <rect x={x - 28} y={1000 + (i % 2) * 40 - 14} width="56" height="16" fill="#D8CCB0" stroke={INK} strokeWidth="4" />
          <path d={`M${x - 20} ${1060 + (i % 2) * 30} q20 14 40 0`} stroke="#5AA048" strokeWidth="6" fill="none" />
        </g>
      ))}
      <path d="M380 990 H500 Q500 930 440 924 Q390 930 380 990 Z" fill="#D0C4A6" stroke={INK} strokeWidth="5" />
      <path d="M640 1150 l30 -40 l40 10 l20 30 Z" fill="#C8BC9E" stroke={INK} strokeWidth="5" />
      <Fog id="dp-f2" t={T + 4} y={1170} x={540} rx={700} ry={50} color="#FFFFFF" opacity={0.55} speed={0.2} />
    </g>
    <g transform={par(0.9)}>
      <path d="M-200 1260 Q300 1210 560 1250 Q820 1290 1280 1230 V2100 H-200 Z" fill="url(#dp-mead)" />
      {GRASS.map((g, i) => <path key={i} d={`M${g.x} ${g.y} q${3 + Math.sin(T * 2 + g.ph) * 4} ${-g.h * 0.6} ${2 + Math.sin(T * 2 + g.ph) * 8} ${-g.h}`} stroke="#2A5A2A" strokeWidth="3.5" fill="none" strokeLinecap="round" />)}
      {FLOW.map((f, i) => <circle key={i} cx={f.x} cy={f.y} r={f.s} fill={f.c} stroke={INK} strokeWidth="1.5" />)}
      <path d="M100 1500 q60 -60 150 -40 q70 20 90 60 Z" fill="#A89A88" stroke={INK} strokeWidth="5" />
      <path d="M120 1470 q60 -30 140 -16" stroke="#5AA048" strokeWidth="7" fill="none" />
    </g>
    <g transform={par(1.25)}>
      {[[-20, 1960, 1.7], [140, 1990, 1.3], [940, 1980, 1.5], [1100, 1940, 1.8]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          {[-40, -24, -10, 4, 18, 32].map((a, k) => (
            <path key={k} d={`M${a * 0.6} 0 Q${a * 0.9 + Math.sin(T * 1.6 + i + k) * 6} -90 ${a * 1.8 + Math.sin(T * 1.6 + i + k) * 12} ${-150 - (k % 3) * 40}`} stroke={k % 2 ? '#2E6A2E' : '#1E4E22'} strokeWidth="10" fill="none" strokeLinecap="round" />
          ))}
        </g>
      ))}
      <Flyers t={T} seed={21} n={5} color="#F2D88A" outline={INK} w={14} h={18} y0={900} y1={1700} speed={0.06} shape="leaf" />
    </g>
  </g>
);
