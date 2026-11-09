import React from 'react';
import { camera, eio, lerp, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { K, Ombra, SestoDefs } from './Comuni';

// La voce nel nastro: lo studio di Malcolm in cantina, di notte. Sulla scrivania, sotto la lampada, il registratore a
// bobine con il vu-metro e la manopola del volume con i numeri rossi (il rosso dell'aldilà); accanto le cuffie, la
// scatola dei nastri con l'etichetta VINCENT GREY e un quaderno di appunti. Dietro, scaffali con i fascicoli e una
// finestrella alta con la luna.
// Eventi: 1ª frase le bobine girano piano (il nastro di una vecchia seduta); 2ª frase la manopola del volume gira fino
// in fondo; 3ª frase la lancetta salta e dall'altoparlante escono onde fredde azzurre: la voce che chiede aiuto.
// Nessuna persona.
// Piani: muro della cantina e finestrella (0,25) · scaffali con i fascicoli (0,45) · scrivania con il registratore (0,7)
//        · quaderno e schienale della sedia in primo piano (1,2) · pulviscolo nel fascio della lampada (1,5–1,8)

const Bobina: React.FC<{ id: string; x: number; y: number; r: number; a: number; fill: number }> = ({ id, x, y, r, a, fill }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r * (0.45 + 0.5 * fill)} fill="#3A2A20" stroke={K} strokeWidth="4" />
    <circle r={r} fill="none" stroke={K} strokeWidth="9" />
    <circle r={r} fill={`url(#${id}-reel)`} opacity=".35" />
    <g transform={`rotate(${a})`}>
      {[0, 120, 240].map((d) => (
        <path key={d} transform={`rotate(${d})`} d={`M0 ${-r * 0.3} L${-r * 0.32} ${-r * 0.82} A${r * 0.86} ${r * 0.86} 0 0 1 ${r * 0.32} ${-r * 0.82} Z`} fill="#1A1E22" stroke={K} strokeWidth="4" />
      ))}
      <path d={`M${-r * 0.9} 0 A${r * 0.9} ${r * 0.9} 0 0 1 ${-r * 0.3} ${-r * 0.8}`} stroke="#FFFFFF" strokeWidth="5" fill="none" opacity=".4" />
    </g>
    <circle r={r * 0.22} fill={`url(#${id}-steel)`} stroke={K} strokeWidth="5" />
    <circle r={r * 0.07} fill={K} />
  </g>
);

export const Nastro: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const play = seg(t, griglia(cues[0] + 0.3), griglia(cues[0] + 0.3) + 0.6);
  const ang = (tt: number) => Math.max(0, tt - (cues[0] + 0.3)) * 70;
  const vol = eio(seg(t, griglia(cues[1] + 0.8), griglia(cues[1] + 0.8) + 1.6));
  const voice = griglia(cues[2] + 0.3);
  const v = seg(t, voice, voice + 0.3);
  const needle = -50 + 20 * play * (0.5 + 0.5 * Math.sin(t * 9)) + v * (70 + 12 * Math.sin(t * 13) * Math.sin(t * 4.1));
  const MX = 330, MY = 1080; // vu-metro
  const VX = 720, VY = 1080; // manopola

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="na" />
        <SestoDefs id="na" />
        <Lin id="na-wall" stops={[[0, '#0A0C10'], [0.4, '#1A2026'], [0.75, '#262C30'], [1, '#14181A']]} />
        <Lin id="na-desk" stops={[[0, '#6A4A30'], [0.3, '#4A3220'], [1, '#1A0E06']]} />
        <Lin id="na-body" stops={[[0, '#5A5E62'], [0.15, '#3A3E42'], [1, '#1E2226']]} />
        <Lin id="na-plate" stops={[[0, '#C8CCCC'], [1, '#8A9094']]} />
        <Lin id="na-box" x2={1} y2={0} stops={[[0, '#C8B890'], [0.6, '#A8966E'], [1, '#6E6046']]} />
        <radialGradient id="na-reel" cx=".4" cy=".35" r=".7"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#5A6066" /></radialGradient>
        <radialGradient id="na-meter" cx=".5" cy=".9" r=".9"><stop offset="0" stopColor="#FFF2C8" /><stop offset="1" stopColor="#D8B868" /></radialGradient>
        <linearGradient id="na-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE2A0" stopOpacity=".55" />
          <stop offset="1" stopColor="#FFE2A0" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — muro di mattoni della cantina e finestrella con la luna (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#na-wall)" />
          {Array.from({ length: 18 }, (_, r) => Array.from({ length: 12 }, (_, c) => (
            <rect key={`${r}-${c}`} x={-200 + c * 130 + (r % 2) * 65} y={600 + r * 46} width="122" height="40" fill="#2A3036" opacity=".35" />
          )))}
          <rect x="760" y="640" width="200" height="110" fill="#1A2A40" stroke={K} strokeWidth="8" />
          <circle cx="900" cy="680" r="20" fill="#DCE6F0" opacity=".8" />
          <path d="M860 640 V750" stroke={K} strokeWidth="7" />
          <rect x="760" y="640" width="200" height="110" fill="url(#na-glass)" />
          <Glow id="na-moon" x={860} y={700} r={220} t={t} color="#9AB4D4" amp={0.03} rate={0.7} opacity={0.3} />
        </g>

        {/* PIANO 1 — scaffali con i fascicoli dei pazienti (0,45) */}
        <g transform={L(0.45)}>
          {[0, 1].map((sx) => (
            <g key={sx} transform={`translate(${sx ? 700 : -60} 0)`}>
              {[820, 960].map((y, r) => (
                <g key={y}>
                  <rect x="0" y={y} width="360" height="18" fill="url(#na-wood)" stroke={K} strokeWidth="5" />
                  {Array.from({ length: 9 }, (_, i) => (
                    <rect key={i} x={14 + i * 37} y={y - 110 + ((i * 7 + r * 3) % 4) * 6} width="30" height={110 - ((i * 7 + r * 3) % 4) * 6} fill={['#5A6A7A', '#7A6A4A', '#4A5A4A', '#8A8A7A'][(i + r + sx) % 4]} stroke={K} strokeWidth="4" />
                  ))}
                </g>
              ))}
            </g>
          ))}
        </g>

        {/* PIANO 2 — scrivania, lampada e registratore a bobine (0,7) */}
        <g transform={L(0.7)} strokeLinejoin="round">
          <path d="M-200 1250 H1280 V2200 H-200 Z" fill="#0A0806" />
          <path d="M-200 1160 H1280 V1290 H-200 Z" fill="url(#na-desk)" stroke={K} strokeWidth="9" />
          <path d="M-200 1166 H1280" stroke="#B88A5A" strokeWidth="5" opacity=".6" />
          {/* lampada da scrivania con il fascio */}
          <path d="M150 760 L-40 1200 H560 Z" fill="url(#na-beam)" />
          <g>
            <Ombra id="na" x={110} y={1168} rx={90} ry={10} />
            <ellipse cx="110" cy="1160" rx="70" ry="16" fill="#1A2A22" stroke={K} strokeWidth="6" />
            <path d="M110 1150 L70 940 L150 760" stroke={K} strokeWidth="16" fill="none" strokeLinecap="round" />
            <path d="M110 1150 L70 940 L150 760" stroke="#2A4A3A" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M110 720 L230 760 L170 830 Z" fill="#2A4A3A" stroke={K} strokeWidth="7" />
            <path d="M120 730 L210 762" stroke="#6A9A7A" strokeWidth="4" />
          </g>
          <Glow id="na-lamp" x={190} y={810} r={320} t={t} color="#FFE2A0" amp={0.03} rate={2} opacity={0.5} />
          {/* registratore a bobine */}
          <Ombra id="na" x={540} y={1170} rx={340} ry={22} />
          <rect x="230" y="830" width="620" height="330" rx="14" fill="url(#na-body)" stroke={K} strokeWidth="10" />
          <rect x="250" y="846" width="580" height="200" rx="8" fill="url(#na-plate)" stroke={K} strokeWidth="5" />
          <path d="M256 852 H824" stroke="#FFFFFF" strokeWidth="4" opacity=".6" />
          <Bobina id="na" x={380} y={940} r={86} a={ang(t) * 1.2} fill={0.3} />
          <Bobina id="na" x={700} y={940} r={86} a={ang(t)} fill={0.85} />
          {/* nastro tra le testine */}
          <path d="M380 1026 L470 1040 H610 L700 1026" stroke="#3A2A20" strokeWidth="5" fill="none" />
          <rect x="490" y="1018" width="100" height="28" rx="5" fill="url(#na-steel)" stroke={K} strokeWidth="4" />
          {/* vu-metro */}
          <rect x={MX - 80} y={MY - 20} width="160" height="76" rx="6" fill="#141618" stroke={K} strokeWidth="5" />
          <rect x={MX - 70} y={MY - 12} width="140" height="60" rx="4" fill="url(#na-meter)" />
          <path d={`M${MX - 54} ${MY + 22} A62 62 0 0 1 ${MX + 54} ${MY + 22}`} stroke="#3A3020" strokeWidth="3" fill="none" />
          <path d={`M${MX + 20} ${MY - 2} A62 62 0 0 1 ${MX + 54} ${MY + 22}`} stroke={'#C83A30'} strokeWidth="5" fill="none" />
          <path d={`M${MX} ${MY + 44} L${MX + Math.sin((needle * Math.PI) / 180) * 54} ${MY + 44 - Math.cos((needle * Math.PI) / 180) * 54}`} stroke="#14100C" strokeWidth="4" strokeLinecap="round" />
          <Glow id="na-meterglow" x={MX} y={MY + 16} r={120} t={t} color="#FFE2A0" amp={0.05} rate={5} opacity={0.3 + 0.3 * play} />
          {/* tasti */}
          {[0, 1, 2, 3].map((i) => <rect key={i} x={440 + i * 52} y={MY + (i === 2 ? 14 : 4) * 1 + (i === 2 ? play * 6 : 0)} width="40" height="34" rx="4" fill={i === 2 ? '#3A3E42' : '#2A2E32'} stroke={K} strokeWidth="4" />)}
          <path d="M472 1098 l8 8 l-8 8 Z" fill="#C8CCCC" opacity={0.3} />
          {/* manopola del volume con i numeri rossi */}
          <circle cx={VX} cy={VY + 20} r="56" fill="#141618" stroke={K} strokeWidth="5" />
          {Array.from({ length: 6 }, (_, i) => {
            const a = ((-130 + i * 52) * Math.PI) / 180;
            return <text key={i} x={VX + Math.sin(a) * 46} y={VY + 26 - Math.cos(a) * 46} fill="#E8443A" fontFamily={SANS} fontWeight={800} fontSize="15" textAnchor="middle">{i * 2}</text>;
          })}
          <g transform={`translate(${VX} ${VY + 20}) rotate(${lerp(-130, 130, vol)})`}>
            <circle r="30" fill="url(#na-steel)" stroke={K} strokeWidth="5" />
            <path d="M0 -26 V-10" stroke="#E8443A" strokeWidth="6" strokeLinecap="round" />
          </g>
          <Glow id="na-knob" x={VX} y={VY + 20} r={110} t={t} color="#E8443A" amp={0.1} rate={3} opacity={0.15 + 0.4 * vol} />
          {/* altoparlante e le onde della voce */}
          <g transform="translate(790 1110)">
            {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M-30 ${-24 + i * 14} H30`} stroke="#0A0C0E" strokeWidth="6" strokeLinecap="round" />)}
          </g>
          {v > 0 && Array.from({ length: 4 }, (_, i) => {
            const p = ((t - voice) * 0.7 + i / 4) % 1;
            return <path key={i} d={`M${810 + p * 110} ${1100 - 60 - p * 180} Q${850 + p * 160} ${1100} ${810 + p * 110} ${1100 + 40 + p * 120}`} stroke="#CFE8FF" strokeWidth={12 - 7 * p} fill="none" strokeLinecap="round" opacity={v * (1 - p)} />;
          })}
          {v > 0 && <Glow id="na-voice" x={860} y={1100} r={260} t={t} color="#9CC8F0" amp={0.15} rate={6} opacity={0.5 * v} />}
          {/* cuffie */}
          <g transform="translate(150 1225)">
            <path d="M-80 0 Q-80 -110 0 -110 Q80 -110 80 0" stroke={K} strokeWidth="18" fill="none" />
            <path d="M-80 0 Q-80 -110 0 -110 Q80 -110 80 0" stroke="#3A3E42" strokeWidth="9" fill="none" />
            {[-80, 80].map((x) => <ellipse key={x} cx={x} cy="10" rx="36" ry="44" fill="#22262A" stroke={K} strokeWidth="7" />)}
            <path d="M80 30 Q160 80 280 20" stroke="#14181C" strokeWidth="6" fill="none" />
          </g>
          {/* scatola dei nastri con l'etichetta */}
          <g transform="translate(560 1262) rotate(-4) scale(.85)">
            <Ombra id="na" x={0} y={30} rx={150} ry={14} />
            <rect x="-140" y="-120" width="280" height="150" fill="url(#na-box)" stroke={K} strokeWidth="7" />
            <rect x="-118" y="-96" width="236" height="68" fill="url(#na-paper)" stroke={K} strokeWidth="4" />
            <text x="0" y="-64" fill="#1A1610" fontFamily={SANS} fontWeight={800} fontSize="25" textAnchor="middle" letterSpacing="1">VINCENT GREY</text>
            <path d="M-96 -44 H40" stroke="#6A604C" strokeWidth="3" />
            <path d="M-130 -110 V20" stroke="#E8DCC0" strokeWidth="4" opacity=".5" />
          </g>
        </g>

        {/* PIANO 3 — quaderno degli appunti e schienale della sedia in primo piano (1,2) */}
        <g transform={L(1.2)}>
          {/* fronte della scrivania con i cassetti */}
          <path d="M-200 1300 H740 V2000 H-200 Z" fill="#2A1A0E" stroke={K} strokeWidth="10" />
          <path d="M-200 1306 H736" stroke="#8A5A3A" strokeWidth="5" opacity=".6" />
          {[1340, 1560].map((y) => (
            <g key={y}>
              <rect x="40" y={y} width="560" height="190" fill="url(#na-wood)" stroke={K} strokeWidth="8" />
              <rect x="270" y={y + 80} width="100" height="26" rx="8" fill="url(#na-brass)" stroke={K} strokeWidth="5" />
            </g>
          ))}
          <path d="M760 1460 Q900 1400 1160 1450 V1980 H760 Z" fill="#2A1A10" stroke={K} strokeWidth="10" />
          <path d="M790 1470 Q900 1424 1140 1464" stroke="#8A5A3A" strokeWidth="5" fill="none" opacity=".7" />
          <path d="M800 1520 V1960 M1100 1520 V1960" stroke="#1A0E06" strokeWidth="18" />
        </g>

        {/* PIANO 4 — pulviscolo nel fascio della lampada (1,5) e particelle vicine (1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 800, x0: 100, x1: 220 }} bottom={{ y: 1200, x0: -20, x1: 540 }} seed={4} n={22} color="#FFE6B0" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="na-near" t={t} color="#D8E0E8" n={5} opacity={0.07} />
        </g>
      </g>
      <Finish id="na" tint="#1E2A36" tintOpacity={0.13} />
    </svg>
  );
};

