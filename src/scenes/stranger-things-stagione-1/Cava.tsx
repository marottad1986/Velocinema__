import React from 'react';
import { camera, eo, lerp, rng, seg } from '../../lib/anim';
import { Beam, Fog, Glow, NearMotes, Reflection, Stars, WaveLines } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { K, Ombra, StDefs, VELATURA } from './Comuni';

// Il corpo nella cava è finto: sulla sponda di pietra della cava, di notte, la barella con il telo appena ripescata
// dall'acqua nera. Eventi: prima frase i fari delle ricerche dall'alto si fermano sulla barella; seconda frase sulle
// rocce si accende la torcia di Hopper, posata accanto al suo cappello da sceriffo, e illumina il telo; terza frase il
// telo si squarcia sul fianco: dentro c'è un sacco di tela cucito e imbottito di ovatta, che esce e vola via.
// Il telo copre un fagotto informe, mai una sagoma umana.
// Piani: cielo (0,22) · pareti della cava e auto della polizia sul ciglio (0,36) · acqua nera con la barca (0,5)
//        · sponda con la barella (0,7) · rocce con cappello e torcia, nastro (1,1) · ovatta (0,9–1,4) · nebbia (1,8)

const r = rng(505);
const COTTON = Array.from({ length: 16 }, () => ({ dx: (r() - 0.5) * 160, rise: 140 + r() * 220, drift: 60 + r() * 200, s: 0.7 + r() * 0.9, d: r() * 0.6 }));
const FACES = [
  { x0: -200, x1: 420, y: 700, h: 240, c: '#3A424E' }, { x0: 380, x1: 760, y: 730, h: 210, c: '#444C58' }, { x0: 700, x1: 1280, y: 710, h: 230, c: '#363E4A' },
];

/** Cappello da sceriffo (a tesa larga con la cupola a quattro bozze). */
const Cappello: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="0" rx="120" ry="30" fill="#6A5A3E" stroke={K} strokeWidth="8" />
    <path d="M-110 -4 Q0 -40 110 -4" stroke="#A89470" strokeWidth="4" fill="none" opacity=".6" />
    <path d="M-60 -6 Q-62 -70 -30 -86 Q-14 -76 0 -88 Q14 -76 30 -86 Q62 -70 60 -6 Z" fill="#7A6848" stroke={K} strokeWidth="8" strokeLinejoin="round" />
    <path d="M0 -86 V-20 M-30 -84 Q-40 -50 -38 -14 M30 -84 Q40 -50 38 -14" stroke="#4A3E2A" strokeWidth="4" fill="none" />
    <path d="M-60 -22 Q0 -8 60 -22 V-6 Q0 8 -60 -6 Z" fill="#3A2E1E" stroke={K} strokeWidth="5" />
    <path d="M-54 -64 Q-50 -80 -32 -84" stroke="#B8A47E" strokeWidth="4" fill="none" opacity=".7" />
  </g>
);

export const Cava: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;

  const find = eo(seg(t, cues[0] + 0.3, cues[0] + 2.0));
  const tTorch = griglia(cues[1] + 0.4);
  const torch = eo(seg(t, tTorch, tTorch + 0.2));
  const tRip = griglia(cues[2] + 0.9);
  const rip = eo(seg(t, tRip, tRip + 0.45));
  const police = 0.5 + 0.5 * Math.sin(t * 3.4);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="cv" />
        <StDefs id="cv" />
        <Lin id="cv-sky" stops={[[0, '#05070E'], [0.3, '#0C1220'], [0.5, '#162036'], [0.62, '#1E2A40']]} />
        <Lin id="cv-rock" stops={[[0, '#4A525E'], [0.5, '#353C46'], [1, '#1A1E24']]} />
        <Lin id="cv-rockh" x2={1} y2={0} stops={[[0, '#2A3038'], [0.45, '#4A525E'], [1, '#22282E']]} />
        <Lin id="cv-water" stops={[[0, '#0E1828'], [1, '#04070C']]} />
        <Lin id="cv-sheet" stops={[[0, '#F2F4F4'], [0.6, '#C8D0D4'], [1, '#98A2A8']]} />
        <Lin id="cv-burlap" stops={[[0, '#C8A878'], [1, '#8A6A44']]} />
        <linearGradient id="cv-torch" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#FFF0C0" stopOpacity=".75" /><stop offset=".7" stopColor="#FFE0A0" stopOpacity=".2" /><stop offset="1" stopColor="#FFE0A0" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="cv-cotton" cx=".4" cy=".35"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".7" stopColor="#EEF1F4" /><stop offset="1" stopColor="#C2CAD2" /></radialGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo (0,22) */}
        <g transform={L(0.22)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#cv-sky)" />
          <Stars t={t} seed={5} n={70} x={-100} y={60} w={1280} h={560} color="#DDE6F5" size={0.7} />
          <Fog id="cv-cl" t={t} y={640} x={540} rx={760} ry={36} color="#2A3650" opacity={0.6} speed={0.1} drift={60} />
        </g>

        {/* PIANO 1 — pareti della cava a lastre, alberi sul ciglio, auto della polizia (0,36) */}
        <g transform={L(0.36)}>
          {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${-150 + i * 100} 740 l22 -50 l22 50 Z`} fill="#0E1420" />)}
          {FACES.map((f, i) => (
            <g key={i}>
              <rect x={f.x0} y={f.y} width={f.x1 - f.x0} height={f.h} fill={f.c} />
              <path d={`M${f.x0} ${f.y} H${f.x1}`} stroke="#7A8494" strokeWidth="4" opacity=".5" />
              {Array.from({ length: 5 }, (_, k) => {
                const x = f.x0 + ((k + 0.5) * (f.x1 - f.x0)) / 5;
                return <path key={k} d={`M${x} ${f.y + 8} l-8 ${f.h * 0.3} l10 ${f.h * 0.3} l-6 ${f.h * 0.35}`} stroke="#1A1E26" strokeWidth="4" fill="none" opacity=".55" />;
              })}
              {Array.from({ length: 3 }, (_, k) => <path key={`h${k}`} d={`M${f.x0} ${f.y + (k + 1) * f.h / 4} H${f.x1}`} stroke="#1A1E26" strokeWidth="3" opacity=".35" />)}
            </g>
          ))}
          {/* auto della polizia sul ciglio, piccola, con i lampeggianti */}
          <g transform="translate(840 682) scale(0.38)">
            <path d="M-60 60 V0 Q-60 -14 -40 -18 L40 -30 Q60 -66 100 -68 H200 Q234 -66 250 -30 L290 -14 Q310 -10 310 8 V60 Z" fill="#D8D2C2" stroke={K} strokeWidth="9" />
            <path d="M-60 24 H310" stroke="#2A3A5A" strokeWidth="18" />
            <circle cx="20" cy="60" r="28" fill="#1A1C22" /><circle cx="240" cy="60" r="28" fill="#1A1C22" />
            <rect x="110" y="-84" width="34" height="16" rx="4" fill={police > 0.5 ? '#FF4A3A' : '#5A2020'} />
            <rect x="150" y="-84" width="34" height="16" rx="4" fill={police < 0.5 ? '#4A8AFF' : '#20305A'} />
          </g>
          <Glow id="cv-pr" x={890} y={652} r={90} t={t} color="#FF4A3A" amp={0} opacity={0.75 * police} />
          <Glow id="cv-pb" x={906} y={652} r={90} t={t} color="#4A8AFF" amp={0} opacity={0.75 * (1 - police)} />
        </g>

        {/* PIANO 2 — acqua nera con la barca e i riflessi dei lampeggianti (0,5) */}
        <g transform={L(0.5)}>
          <rect x="-200" y="900" width="1480" height="170" fill="url(#cv-water)" />
          <path d="M-200 900 H1280" stroke="#2A3A54" strokeWidth="4" />
          <WaveLines t={t} ys={[930, 965, 1000, 1035]} color="#3A4A64" amp={4} w={90} speed={0.4} width={3} opacity={0.55} />
          <Reflection t={t} x={880} y={912} color="#FF4A3A" n={5} w={70} gap={14} opacity={0.6 * police} />
          <Reflection t={t + 2} x={900} y={914} color="#4A8AFF" n={5} w={70} gap={14} opacity={0.6 * (1 - police)} />
          <Reflection t={t + 1} x={220} y={930} color="#FFD27A" n={5} w={60} gap={14} opacity={0.6} />
          {/* barca a remi con la lanterna */}
          <path d="M140 920 Q220 944 300 920 L288 940 Q220 958 152 940 Z" fill="#5A3E26" stroke={K} strokeWidth="6" />
          <path d="M200 926 l-60 28 M260 926 l50 26" stroke="#7A5A3A" strokeWidth="5" />
          <path d="M220 920 V884" stroke={K} strokeWidth="5" />
          <rect x="210" y="866" width="20" height="22" rx="4" fill="#F5B83D" stroke={K} strokeWidth="4" />
          <Glow id="cv-lantern" x={220} y={876} r={110} t={t} color="#FFC870" amp={0.08} rate={5} opacity={0.7} />
          <Fog id="cv-f1" t={t} y={960} rx={700} ry={50} color="#5A6A84" opacity={0.4} speed={0.2} drift={70} />
        </g>

        {/* fasci delle ricerche dal ciglio della cava, che si fermano sulla barella */}
        <g transform={L(0.55)}>
          <Beam id="cv-b1" x={-60} y={700} t={t} length={1000} spread={240} color="#DCE8FF" angle={lerp(62, 36, find)} sweep={5 * (1 - find)} opacity={0.3} />
          <Beam id="cv-b2" x={1140} y={710} t={t} length={1000} spread={240} color="#DCE8FF" angle={lerp(118, 146, find)} sweep={5 * (1 - find)} opacity={0.28} />
        </g>

        {/* PIANO 3 — sponda di pietra bagnata con la barella (0,7) */}
        <g transform={L(0.7)}>
          <path d="M-200 1060 Q300 1040 560 1056 Q840 1046 1280 1070 V2200 H-200 Z" fill="url(#cv-rock)" stroke={K} strokeWidth="8" />
          <path d="M-200 1066 Q300 1046 560 1062 Q840 1052 1280 1076" stroke="#8A94A4" strokeWidth="4" fill="none" opacity=".55" />
          {[[100, 1120], [420, 1160], [760, 1130], [980, 1170]].map(([x, y], i) => <path key={i} d={`M${x} ${y} q40 -10 80 6`} stroke="#1A1E24" strokeWidth="4" fill="none" opacity=".6" />)}
          <Glow id="cv-onstretcher" x={560} y={1000} r={420} t={t} color="#E8F0FF" amp={0.03} rate={2} opacity={0.3 * find} />
          <Ombra id="cv" x={560} y={1196} rx={420} ry={26} />
          {/* gambe con le ruote */}
          {[230, 880].map((lx) => (
            <g key={lx}>
              <path d={`M${lx} 1074 L${lx - 34} 1186 M${lx} 1074 L${lx + 34} 1186 M${lx - 22} 1140 H${lx + 22}`} stroke="#8A929A" strokeWidth="9" />
              <path d={`M${lx} 1074 L${lx - 34} 1186 M${lx} 1074 L${lx + 34} 1186`} stroke={K} strokeWidth="2" opacity=".6" />
              <circle cx={lx - 34} cy="1190" r="13" fill="#2A2E36" stroke={K} strokeWidth="4" />
              <circle cx={lx + 34} cy="1190" r="13" fill="#2A2E36" stroke={K} strokeWidth="4" />
            </g>
          ))}
          <rect x="160" y="1052" width="800" height="26" rx="8" fill="url(#cv-metal)" stroke={K} strokeWidth="7" />
          <path d="M140 1052 h40 M940 1052 h40" stroke="#8A929A" strokeWidth="12" strokeLinecap="round" />
          {/* gocce d'acqua che colano dal telo */}
          {[300, 520, 760].map((x, i) => {
            const p = ((t * 0.8 + i * 0.37) % 1);
            return <circle key={x} cx={x} cy={1080 + p * 110} r="5" fill="#9AB8D8" opacity={0.8 * (1 - p)} />;
          })}
          {/* il telo bagnato sopra un fagotto informe */}
          <path d="M170 1056 Q160 990 230 970 Q330 930 450 948 Q560 920 690 946 Q820 926 900 966 Q960 994 950 1056 Q900 1094 560 1092 Q220 1094 170 1056 Z" fill="url(#cv-sheet)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          {[300, 420, 560, 700, 820].map((x, i) => <path key={x} d={`M${x} ${950 + (i % 2) * 8} Q${x + 18} 1010 ${x - 8} 1088`} stroke="#8A969E" strokeWidth="4" fill="none" />)}
          <path d="M240 976 Q340 940 450 954 Q560 928 680 952" stroke="#FFFFFF" strokeWidth="5" fill="none" opacity=".75" />
          {/* lo squarcio: sacco di tela cucito e ovatta che esce */}
          <g>
            <path d={`M420 ${1010 - 4 * rip} Q560 ${1010 - 70 * rip} 700 ${1010 - 4 * rip} Q560 ${1010 + 50 * rip} 420 ${1010 - 4 * rip} Z`} fill="url(#cv-burlap)" stroke={K} strokeWidth={rip > 0.02 ? 7 : 0} />
            {rip > 0.05 && (
              <g opacity={rip}>
                {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${450 + i * 28} ${1012 - 22 * Math.sin((i / 8) * Math.PI) * rip} l10 14`} stroke="#3A2A18" strokeWidth="4" strokeLinecap="round" />)}
                <path d="M440 1010 Q560 990 680 1010" stroke="#3A2A18" strokeWidth="3" fill="none" strokeDasharray="10 8" />
                {[[500, 990, 32], [556, 976, 40], [616, 986, 34], [660, 1000, 24], [470, 1004, 22]].map(([cx, cy, cr], i) => (
                  <circle key={i} cx={cx} cy={cy - 10 * rip} r={(cr as number) * rip} fill="url(#cv-cotton)" stroke="#9AA4AE" strokeWidth="3" />
                ))}
                <path d={`M420 1010 Q400 ${1000 - 30 * rip} 380 ${1006 - 20 * rip} M700 1010 Q726 ${996 - 26 * rip} 748 ${1004 - 18 * rip}`} stroke={K} strokeWidth="6" fill="none" strokeLinecap="round" />
              </g>
            )}
          </g>
        </g>

        {/* PIANO 4 — rocce ai lati con il cappello di Hopper (sinistra) e la torcia (destra), nastro della polizia (1,1) */}
        <g transform={L(1.1)}>
          <path d="M1010 1176 L560 1010 L530 1070 Z" fill="url(#cv-torch)" opacity={0.9 * torch} />
          <Glow id="cv-hit" x={580} y={1030} r={220} t={t} color="#FFE8B0" amp={0.04} rate={4} opacity={0.5 * torch} />
          <path d="M-200 1200 Q-40 1130 160 1150 Q300 1166 330 1240 Q330 1300 300 1340 V2200 H-200 Z" fill="url(#cv-rockh)" stroke={K} strokeWidth="10" />
          <path d="M-180 1196 Q-40 1136 150 1156" stroke="#9AA4B4" strokeWidth="5" fill="none" opacity=".6" />
          <path d="M1280 1210 Q1060 1150 900 1200 Q800 1240 790 1320 V2200 H1280 Z" fill="url(#cv-rockh)" stroke={K} strokeWidth="10" />
          <path d="M1270 1214 Q1060 1156 906 1206" stroke="#9AA4B4" strokeWidth="5" fill="none" opacity=".5" />
          {/* cappello posato */}
          <Ombra id="cv" x={130} y={1172} rx={120} ry={14} />
          <Cappello x={130} y={1150} s={0.85} />
          {/* torcia posata che punta la barella */}
          <g transform="translate(1010 1176) rotate(200)">
            <rect x="-96" y="-22" width="100" height="44" rx="8" fill="#2A2E36" stroke={K} strokeWidth="7" />
            <path d="M4 -28 L36 -36 V36 L4 28 Z" fill="#5A606A" stroke={K} strokeWidth="6" strokeLinejoin="round" />
            <ellipse cx="36" cy="0" rx="8" ry="34" fill={torch > 0.1 ? '#FFF6D8' : '#3A3E46'} stroke={K} strokeWidth="4" />
            {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M${-80 + i * 18} -22 v44`} stroke="#1A1C22" strokeWidth="4" />)}
            <path d="M-90 16 H0" stroke="#8A929E" strokeWidth="3" opacity=".6" />
          </g>
          <Glow id="cv-torchglow" x={975} y={1164} r={110} t={t} color="#FFF0C0" amp={0.05} rate={6} opacity={0.85 * torch} />
          {/* nastro della polizia tra due paletti, in basso */}
          {[40, 1010].map((px) => <rect key={px} x={px} y="1300" width="16" height="400" fill="#E8C860" stroke={K} strokeWidth="5" />)}
          <path d="M48 1330 Q540 1380 1018 1330" stroke="#E8C860" strokeWidth="22" fill="none" />
          <path d="M48 1330 Q540 1380 1018 1330" stroke={K} strokeWidth="3" fill="none" strokeDasharray="40 26" />
          {/* pozze sulla pietra */}
          <ellipse cx="540" cy="1640" rx="200" ry="30" fill="#141C28" stroke={K} strokeWidth="5" />
          <Reflection t={t} x={540} y={1632} color="#DCE8FF" n={3} w={150} gap={8} opacity={0.4} />
        </g>

        {/* ovatta che vola via dallo squarcio */}
        <g transform={L(0.9)}>
          {COTTON.map((c, i) => {
            const p = seg(t, tRip + 0.3 + c.d, tRip + 2.4 + c.d);
            return p > 0 && <circle key={i} cx={560 + c.dx * 0.5 + p * c.drift} cy={990 - p * c.rise + Math.sin(t * 3 + i) * 8} r={10 * c.s} fill="url(#cv-cotton)" opacity={1 - p * 0.5} />;
          })}
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="cv-near" t={t} color="#9AAAC8" n={6} r0={90} r1={180} opacity={0.1} y0={760} />
        </g>
      </g>
      <Finish id="cv" tint={VELATURA} tintOpacity={0.12} />
    </svg>
  );
};
