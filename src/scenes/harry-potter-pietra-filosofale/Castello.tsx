import React from 'react';
import { camera, eio, mod, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Fog, Glow, Moon, NearMotes, Reflection, Smoke, Stars, WaveLines } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Castle, K, Owl, SmallTrain } from './Comuni';

// Il castello: notte su un grande lago nero; a destra, sullo sperone di roccia, il castello con tante torri e finestre
// accese (filo di luce dalla luna a sinistra); sulla riva lontana il treno illuminato corre sul viadotto mentre la voce
// parla del viaggio; sull'acqua una fila di barchette con le lanterne che si allontanano dal pontile in primo piano;
// il castello si specchia nel lago; stelle, nebbia bassa, un gufo che vola verso le torri.
// Piani: cielo e luna (0,2) · colline e viadotto col treno (0,32) · castello (0,4) · lago e riflesso (0,6) · barchette (0,8)
// · pontile con la lanterna e canne (1,15–1,3) · lucciole (1,6)

const CX = 735, CY = 1010, CS = 0.7; // base del castello: a destra, così il titolo resta sul cielo
const LAKE = 1060;

export const Castello: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const lit = seg(t, cues[2], cues[3]); // le finestre si accendono mentre arrivano
  const row = eio(seg(t, cues[2] - 0.5, dur)); // le barche avanzano verso il castello
  const owl = mod(t * 0.09, 1);
  // il treno attraversa il viadotto mentre la voce parla del viaggio (frasi 0 e 1), poi sparisce dietro lo sperone
  const tr = seg(t, 0, cues[2] + 0.6);
  const trainX = -380 + tr * 760;
  const trainO = 1 - seg(t, cues[2], cues[2] + 0.6);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ca" />
        <Lin id="ca-sky" stops={[[0, '#05061A'], [0.4, '#141A3E'], [0.6, '#2E3266']]} />
        <Lin id="ca-hill" stops={[[0, '#1E2048'], [1, '#121430']]} />
        <Lin id="ca-lake" stops={[[0, '#1A2046'], [0.4, '#0C1028'], [1, '#05060E']]} />
        <Lin id="ca-wood" stops={[[0, '#5A4030'], [1, '#2A1C14']]} />
        <clipPath id="ca-water"><rect x="-200" y={LAKE} width="1480" height="1000" /></clipPath>
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#ca-sky)" />
          <Stars t={t} seed={22} n={70} y={-100} h={900} size={1.1} />
          <Moon id="ca-moon" x={250} y={760} r={52} t={t} color="#F4F0DC" halo="#D8D4F0" />
        </g>
        {/* colline lontane con il viadotto e il treno illuminato */}
        <g transform={L(0.32)}>
          <path d="M-200 1000 Q0 930 160 960 Q300 990 420 950 Q520 925 640 990 V1080 H-200 Z" fill="url(#ca-hill)" stroke={K} strokeWidth="4" />
          <path d="M-200 990 H520" stroke="#2A2C58" strokeWidth="10" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-190 + i * 80} 994 v44 M${-190 + i * 80} 1038 q40 -40 80 0`} fill="none" stroke="#2A2C58" strokeWidth="7" />)}
          <g opacity={trainO} transform={`translate(${trainX} 986)`}>
            <Smoke id="ca-smoke" t={t} x={334} y={-50} color="#8A8CB8" n={6} rise={90} wind={-160} r0={8} r1={30} speed={0.5} opacity={0.6} />
            <SmallTrain x={0} y={0} cars={4} />
            <Glow id="ca-trg" x={140} y={-18} r={160} t={t} color="#FFD27A" amp={0.05} rate={2} opacity={0.25} />
          </g>
        </g>
        {/* il castello sullo sperone di roccia */}
        <g transform={L(0.4)}>
          <path d="M300 1080 Q420 1010 560 1000 L900 990 Q1060 1010 1280 1060 V1090 H300 Z" fill="#0E0C22" />
          <Glow id="ca-castleg" x={CX} y={760} r={460} t={t} color="#FFD27A" amp={0.04} rate={1} opacity={0.12 + 0.25 * lit} />
          <Castle x={CX} y={CY} s={CS} t={t} lit={0.35 + 0.65 * lit} fill="#262452" roof="#34306A" rock="#14122E" rim={-1} />
          <g transform={`translate(${-100 + owl * 1300} ${640 - Math.sin(owl * Math.PI) * 120})`}><Owl x={0} y={0} s={0.35} t={t} fly={1} /></g>
        </g>
        {/* il lago: il castello specchiato e mosso dalle onde, riflessi delle finestre e della luna */}
        <g transform={L(0.6)}>
          <rect x="-200" y={LAKE} width="1480" height="900" fill="url(#ca-lake)" />
          <g clipPath="url(#ca-water)" opacity={0.22}>
            <g transform={`translate(${Math.sin(t * 1.3) * 4} ${2 * LAKE + 40}) scale(1 -1)`}>
              <Castle x={CX} y={CY} s={CS} t={t} lit={0.35 + 0.65 * lit} fill="#262452" roof="#34306A" rock="#14122E" rim={-1} />
            </g>
          </g>
          {[480, 580, 690, 800, 900].map((x, i) => <Reflection key={x} t={t + i} x={x} y={LAKE + 20} color="#FFD27A" n={6} w={26} gap={18} opacity={0.3 * (0.35 + 0.65 * lit)} />)}
          <Reflection t={t} x={250} y={LAKE + 20} color="#F4F0DC" n={9} w={70} opacity={0.4} />
          <WaveLines t={t} ys={[1120, 1180, 1260, 1360, 1480]} color="#3A4070" amp={5} w={200} speed={14} opacity={0.55} />
          <Fog id="ca-fog" t={t} y={LAKE + 20} color="#5A5E8A" rx={900} ry={50} opacity={0.35} />
        </g>
        {/* fila di barchette con le lanterne (accento) che si allontanano verso il castello */}
        <g transform={L(0.8)}>
          {[0, 1, 2, 3, 4].map((i) => {
            const x = -40 + i * 250 + row * 160, y = 1240 - i * 22 - row * 60, s = 0.9 - i * 0.08 - row * 0.15;
            return (
              <g key={i} transform={`translate(${x} ${y + Math.sin(t * 1.6 + i) * 4}) scale(${s})`}>
                <Reflection t={t + i} x={30} y={30} color={P.accento} n={4} w={30} gap={14} opacity={0.5} />
                <path d="M-90 0 H110 Q90 40 60 44 H-60 Q-90 30 -90 0 Z" fill="#4A3424" stroke={K} strokeWidth="6" />
                <path d="M-80 8 H100" stroke="#6A4A30" strokeWidth="5" />
                <path d="M80 0 V-90" stroke={K} strokeWidth="6" />
                <rect x="66" y="-120" width="28" height="34" rx="6" fill={P.accento} stroke={K} strokeWidth="4" />
                <Glow id={`ca-lan${i}`} x={80} y={-104} r={70} t={t} color="#FFD27A" amp={0.12} rate={3 + i} opacity={0.8} />
              </g>
            );
          })}
        </g>
        {/* primo piano: il pontile da cui partono le barche, con la lanterna sul palo */}
        <g transform={L(1.15)}>
          <path d="M330 2000 L470 1560 H650 L800 2000 Z" fill="url(#ca-wood)" stroke={K} strokeWidth="6" />
          {[1600, 1660, 1740, 1840, 1960].map((y, i) => {
            const k = (y - 1560) / 440;
            return <path key={y} d={`M${470 - 140 * k} ${y} H${650 + 150 * k}`} stroke={K} strokeWidth={3 + i} opacity=".7" />;
          })}
          <path d="M560 1560 L565 2000" stroke={K} strokeWidth="4" opacity=".5" />
          {[[470, 1560, 40], [650, 1560, 40], [400, 1780, 70], [725, 1780, 70]].map(([x, y, h], i) => (
            <g key={i}>
              <rect x={x - h / 8} y={y - h * 0.4} width={h / 4} height={h * 1.6} fill="#3A281C" stroke={K} strokeWidth="5" />
              <ellipse cx={x} cy={y + h * 1.2} rx={h / 3} ry={h / 12} fill="#3A4070" opacity=".5" />
            </g>
          ))}
          <path d="M725 1752 V1520" stroke={K} strokeWidth="16" /><path d="M725 1752 V1522" stroke="#6A4A30" strokeWidth="8" />
          <path d="M725 1520 H770 V1540" stroke="#6A4A30" strokeWidth="6" fill="none" />
          <rect x="752" y="1540" width="36" height="46" rx="8" fill={P.accento} stroke={K} strokeWidth="5" />
          <Glow id="ca-pl" x={770} y={1563} r={170} t={t} color="#FFD27A" amp={0.1} rate={2.5} opacity={0.8} />
          <Reflection t={t} x={770} y={1640} color="#FFD27A" n={5} w={40} gap={20} opacity={0.35} />
        </g>
        {/* canne in primo piano, toccate dalla luce della luna */}
        <g transform={L(1.3)}>
          {Array.from({ length: 22 }, (_, i) => {
            const x = i < 11 ? -120 + i * 34 : 880 + (i - 11) * 32;
            const h = 280 + ((i * 53) % 240);
            const b = Math.sin(t * 1.4 + i) * 10;
            return (
              <g key={i}>
                <path d={`M${x} 1960 Q${x + b * 0.5} ${1960 - h * 0.5} ${x + b} ${1960 - h}`} stroke={i % 2 ? '#26244A' : '#33305C'} strokeWidth="11" fill="none" strokeLinecap="round" />
                {i % 3 === 0 && <ellipse cx={x + b} cy={1960 - h + 26} rx="9" ry="28" fill="#4A3424" stroke={K} strokeWidth="4" />}
              </g>
            );
          })}
        </g>
        <g transform={L(1.6)}><NearMotes id="ca-near" t={t} color="#FFD27A" n={8} y0={1300} opacity={0.12} /></g>
      </g>
      <Finish id="ca" tint="#1E1A3A" tintOpacity={0.12} />
    </svg>
  );
};
