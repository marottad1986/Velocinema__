import React from 'react';
import { camera, eio, eo, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K } from './Comuni';

// Il bar dei fantasmi: grande sala da ballo dorata e vuota; il bancone del bar illuminato con file di bottiglie che
// brillano, un bicchiere che si riempie da solo, un secchiello del ghiaccio; i lampadari si accendono uno a uno quando
// «l'albergo gli parla»; su «punire la famiglia» la luce vira al rosso.
// Piani: sala buia e lampadari (0,25) · scaffali delle bottiglie (0,5) · bancone (0,75) · bicchiere e secchiello (0,9) · sgabelli in primo piano (1,25) · pulviscolo (1,6)

const r = rng(1921);
const BOTTLES = Array.from({ length: 30 }, (_, i) => ({ x: 170 + (i % 15) * 50, y: i < 15 ? 760 : 880, h: 60 + r() * 30, c: ['#2A6A3A', '#8A4A1A', '#C8A040', '#5A1A2A'][Math.floor(r() * 4)] }));

export const Bar: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const lamp = (i: number) => seg(t, cues[1] + i * 0.25, cues[1] + i * 0.25 + 0.3); // «l'albergo gli parla»
  const pour = eo(seg(t, cues[2], cues[2] + 1.6)); // «un fantasma gli versa da bere»
  const red = eio(seg(t, cues[3], cues[3] + 1.2)); // «punire la famiglia»

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="br" />
        <Lin id="br-wall" stops={[[0, '#14100C'], [0.5, '#3A2A18'], [1, '#1A140E']]} />
        <Lin id="br-bar" x2={1} y2={0} stops={[[0, '#5A3A1E'], [0.5, '#9A6A34'], [1, '#4A2E16']]} />
        <Lin id="br-top" stops={[[0, '#2A1A10'], [1, '#6A4A2A']]} />
        <Lin id="br-floor" stops={[[0, '#3A2A1A'], [1, '#0E0A06']]} />
        <Lin id="br-drink" stops={[[0, '#E8A040'], [1, '#8A4A10']]} />
      </defs>
      <g transform={cam.transform}>
        {/* sala da ballo buia con i lampadari che si accendono */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#br-wall)" />
          {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${-160 + i * 150} 520 V1100`} stroke="#4A3620" strokeWidth="18" opacity=".6" />)}
          {[120, 540, 960].map((x, i) => (
            <g key={x}>
              {/* lampadario a due ordini di bracci con candele e gocce di cristallo */}
              <path d={`M${x} 540 V640`} stroke="#8A6A3A" strokeWidth="5" />
              <path d={`M${x - 110} 690 Q${x} 760 ${x + 110} 690 M${x - 70} 650 Q${x} 700 ${x + 70} 650`} stroke="#D9B05A" strokeWidth="8" fill="none" />
              <path d={`M${x - 16} 640 H${x + 16} L${x + 8} 720 H${x - 8} Z`} fill="#D9B05A" stroke={K} strokeWidth="4" />
              {[-110, -55, 0, 55, 110].map((d) => <g key={d}>
                <rect x={x + d - 5} y={690 - 26 + Math.abs(d) * 0 - (d === 0 ? -40 : 0)} width="10" height="22" fill="#F4ECD8" stroke={K} strokeWidth="2" />
                <circle cx={x + d} cy={690 - 32 - (d === 0 ? -40 : 0)} r="8" fill={lamp(i) > 0 ? '#FFE8B0' : '#5A4A30'} />
                <path d={`M${x + d} ${700 + (110 - Math.abs(d)) * 0.25} l-7 16 l7 12 l7 -12 Z`} fill="#E8F0F4" stroke={K} strokeWidth="2" opacity=".85" />
              </g>)}
              {[-70, 0, 70].map((d) => <circle key={`u${d}`} cx={x + d} cy={638 + (d === 0 ? 0 : 6)} r="7" fill={lamp(i) > 0 ? '#FFE8B0' : '#5A4A30'} />)}
              <Glow id={`br-ch${i}`} x={x} y={680} r={300} t={t} color={red > 0.5 ? '#E8503A' : '#FFD27A'} amp={0.05} rate={2 + i} opacity={0.55 * lamp(i)} />
            </g>
          ))}
        </g>
        {/* scaffali con le bottiglie e lo specchio dietro il bancone */}
        <g transform={L(0.5)}>
          <rect x="140" y="700" width="800" height="300" fill="#2A1C10" stroke={K} strokeWidth="8" />
          <rect x="160" y="716" width="760" height="270" fill="#3A4A4A" opacity=".5" />
          {[830, 950].map((y) => <rect key={y} x="150" y={y} width="780" height="12" fill="#6A4A2A" stroke={K} strokeWidth="3" />)}
          {BOTTLES.map((b, i) => (
            <g key={i}>
              <path d={`M${b.x - 14} ${b.y + 70} V${b.y + 70 - b.h + 26} Q${b.x - 14} ${b.y + 70 - b.h + 14} ${b.x - 5} ${b.y + 70 - b.h + 8} V${b.y + 70 - b.h} H${b.x + 5} V${b.y + 70 - b.h + 8} Q${b.x + 14} ${b.y + 70 - b.h + 14} ${b.x + 14} ${b.y + 70 - b.h + 26} V${b.y + 70} Z`} fill={b.c} stroke={K} strokeWidth="3" />
              <path d={`M${b.x - 7} ${b.y + 60} V${b.y + 80 - b.h + 26}`} stroke="#FFFFFF" strokeWidth="3" opacity={0.25 + 0.4 * lamp(1)} />
            </g>
          ))}
          <Glow id="br-shelf" x={540} y={850} r={460} t={t} color={red > 0.5 ? '#E8503A' : '#FFC870'} amp={0.04} rate={1.5} opacity={0.15 + 0.3 * lamp(0)} />
        </g>
        {/* il bancone */}
        <g transform={L(0.75)}>
          <path d="M-200 1100 H1280 V2200 H-200 Z" fill="url(#br-floor)" />
          <rect x="40" y="1060" width="1000" height="46" rx="10" fill="url(#br-top)" stroke={K} strokeWidth="8" />
          <rect x="60" y="1106" width="960" height="200" fill="url(#br-bar)" stroke={K} strokeWidth="8" />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={90 + i * 160} y="1126" width="130" height="160" fill="none" stroke="#3A2410" strokeWidth="6" />)}
          <path d="M60 1066 H1040" stroke="#D9B05A" strokeWidth="4" opacity=".6" />
        </g>
        {/* bicchiere che si riempie da solo (accento: il liquido) e secchiello del ghiaccio */}
        <g transform={L(0.9)}>
          <g transform="translate(420 1060)">
            <Glow id="br-glass" x={0} y={-50} r={140} t={t} color="#FFC870" amp={0.08} rate={2} opacity={0.4 * pour} />
            {pour > 0 && pour < 1 && <path d={`M30 -170 Q20 -120 6 ${-100 + 20 * pour}`} stroke="#E8A040" strokeWidth="6" fill="none" />}
            <path d="M-30 -100 H30 L24 0 H-24 Z" fill="#DCEAF4" fillOpacity=".25" stroke="#E8EEF4" strokeWidth="5" />
            <path d={`M${-24 - 6 * pour} ${-90 * pour} H${24 + 6 * pour} L24 0 H-24 Z`} fill={red > 0.5 ? P.accento : 'url(#br-drink)'} opacity=".9" />
            <rect x="-14" y={-30 - 50 * pour} width="16" height="16" fill="#F4FAFF" opacity=".8" transform={`rotate(20 ${-6} ${-22 - 50 * pour})`} />
          </g>
          <g transform="translate(700 1060)">
            <path d="M-50 -80 H50 L40 0 H-40 Z" fill="#C9CED2" stroke={K} strokeWidth="6" />
            {[-24, 0, 24].map((x) => <rect key={x} x={x - 10} y="-100" width="20" height="20" fill="#E8F4FF" stroke={K} strokeWidth="2" transform={`rotate(${x} ${x} -90)`} />)}
          </g>
        </g>
        {/* sgabelli in primo piano */}
        <g transform={L(1.25)}>
          {[120, 960].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy="1560" rx="120" ry="34" fill="#7A1A1A" stroke={K} strokeWidth="8" />
              <path d={`M${x} 1590 V1940`} stroke={K} strokeWidth="24" />
              <path d={`M${x} 1590 V1940`} stroke="#C9A060" strokeWidth="12" />
            </g>
          ))}
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 590, x0: 400, x1: 680 }} bottom={{ y: 1300, x0: 200, x1: 880 }} seed={3} n={24} color="#FFE2B0" />
          <NearMotes id="br-near" t={t} color="#FFE2B0" n={5} y0={1300} opacity={0.08} />
        </g>
      </g>
      <rect width="1080" height="1920" fill="#8A1010" opacity={0.12 * red} />
      <Finish id="br" tint="#3A1A14" tintOpacity={0.1} />
    </svg>
  );
};
