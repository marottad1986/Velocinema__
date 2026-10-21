import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Embers, Fire, Glow, Moon, NearMotes, Notes, Smoke, Wisps, flamePath } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Violino } from './Violino';

// L'eremita: capanna di legno nel bosco. Camino acceso, violino appeso alla parete, tavola apparecchiata con
// pentola, scodella di zuppa fumante, tazza e sigaro. Nessuna persona: la gag si racconta con gli oggetti.
// Eventi: il fuoco divampa (cue 0, «paura del fuoco») · il violino suona da solo (cue 1)
//         · la scodella si rovescia e la tazza va in frantumi (cue 3) · il fiammifero brucia, il sigaro resta spento (cue 4).
// Piani: parete di assi e finestra sul bosco (0,2) · camino e violino (0,45) · tavola con oggetti (0,75)
//        · sedia e legna in primo piano (1,2) · braci, vapore e particelle (1,5–1,8)

const K = '#0E0C0B';
const ACC = '#8EF0C8';
const r = rng(1974);
const MUG = Array.from({ length: 8 }, () => ({ vx: (r() - 0.5) * 300, vy: 80 + r() * 140, rot: r() * 360, s: 12 + r() * 14 }));
const PINES = Array.from({ length: 6 }, (_, i) => ({ x: 690 + i * 50 + r() * 20, h: 90 + r() * 70 }));

export const Eremita: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const blaze = 1 + 0.6 * Math.sin(seg(t, cues[0], cues[0] + 1.6) * Math.PI);
  const violin = seg(t, cues[1], cues[1] + 0.4) * (1 - seg(t, cues[2] + 0.2, cues[2] + 1.0));
  const tip = eo(seg(t, cues[3], cues[3] + 0.5));
  const spill = seg(t, cues[3] + 0.3, cues[3] + 1.4);
  const crash = seg(t, cues[3] + 0.6, cues[3] + 0.75);
  const shards = eo(seg(t, cues[3] + 0.75, cues[3] + 1.4));
  const match = seg(t, cues[4] - 0.2, cues[4] + 0.1);
  const burn = seg(t, cues[4] + 0.1, dur - 0.2);
  const matchOut = seg(t, dur - 0.5, dur - 0.2);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="er" />
        <Lin id="er-wall" x2={1} y2={0} stops={[[0, '#3A2E24'], [0.4, '#2A221B'], [1, '#1A1511']]} />
        <Lin id="er-night" stops={[[0, '#0A0C10'], [1, '#2A323C']]} />
        <Lin id="er-stone" x2={1} y2={0} stops={[[0, '#5A5650'], [0.6, '#46423D'], [1, '#2E2B28']]} />
        <Lin id="er-table" stops={[[0, '#6B5640'], [0.3, '#4E3E2E'], [1, '#2A2018']]} />
        <Lin id="er-pot" x2={1} y2={0} stops={[[0, '#2A2D31'], [0.4, '#6E757C'], [1, '#2A2D31']]} />
        <Lin id="er-bowl" x2={1} y2={0} stops={[[0, '#C9C2B0'], [0.5, '#EDE7D8'], [1, '#B0A894']]} />
        <Lin id="er-front" stops={[[0, '#2A1E16'], [1, '#0C0806']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete di assi e finestra sul bosco notturno (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#er-wall)" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M-200 ${120 + i * 100} H1280`} stroke="#120E0B" strokeWidth="6" opacity=".7" />)}
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M-200 ${126 + i * 100} H1280`} stroke="#5A4836" strokeWidth="2" opacity=".35" />)}
          <g>
            <rect x="680" y="560" width="300" height="250" fill="url(#er-night)" />
            <clipPath id="er-win"><rect x="680" y="560" width="300" height="250" /></clipPath>
            <g clipPath="url(#er-win)">
              <Moon id="er-moon" x={900} y={630} r={36} t={t} color="#E6E4DC" halo="#C9D0D6" />
              {PINES.map((p, i) => <path key={i} d={`M${p.x} 810 l-36 0 l26 -${p.h * 0.5} l-14 0 l24 -${p.h * 0.5} l24 ${p.h * 0.5} l-14 0 l26 ${p.h * 0.5} Z`} fill="#0E1114" />)}
            </g>
            <rect x="680" y="560" width="300" height="250" fill="none" stroke={K} strokeWidth="14" />
            <path d="M830 560 V810 M680 685 H980" stroke={K} strokeWidth="9" />
          </g>
        </g>

        {/* PIANO 1 — camino in pietra con fuoco e violino appeso (0,45) */}
        <g transform={L(0.45)}>
          <path d="M-120 1260 V700 H330 V1260 Z" fill="url(#er-stone)" stroke={K} strokeWidth="9" />
          {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-110 + (i % 3) * 150 + (Math.floor(i / 3) % 2) * 60} y={710 + Math.floor(i / 3) * 90} width="130" height="80" rx="16" fill="none" stroke="#2A2724" strokeWidth="5" />)}
          <path d="M-60 1260 V1020 Q100 940 260 1020 V1260 Z" fill="#0C0A09" stroke={K} strokeWidth="9" />
          <Glow id="er-hearth" x={100} y={1160} r={360 * blaze} t={t} color="#F3C98A" amp={0.12} rate={7} opacity={0.5} />
          <Fire id="er-fire" t={t} x={100} y={1230} scale={0.75 * blaze} outer="#C46A2E" mid="#E8A456" core="#FFE6A8" outline={K} />
          <path d="M20 1240 L180 1220 M30 1220 L170 1244" stroke="#2A1E16" strokeWidth="18" strokeLinecap="round" />
          <path d="M-80 1000 H300" stroke="#3A2E24" strokeWidth="30" />
          <path d="M-80 988 H300" stroke="#7A6450" strokeWidth="4" />
          {/* violino appeso */}
          <g transform={`translate(520 760) rotate(${-12 + Math.sin(t * 9) * 2 * violin})`}>
            <Glow id="er-vg" x={0} y={40} r={140} t={t} color="#F0DDB0" amp={0.1} rate={3} opacity={0.4 * violin} />
            <path d="M0 -190 V-170" stroke={K} strokeWidth="5" />
            <Violino outline={K} scale={0.9} />
          </g>
          <g transform={`rotate(${Math.sin(t * 10) * 14 * violin} 520 790)`} opacity={violin}>
            <path d="M410 760 L640 820" stroke="#D8D4C6" strokeWidth="5" strokeLinecap="round" />
          </g>
        </g>

        {/* PIANO 2 — tavola con pentola, scodella, tazza, sigaro e fiammifero (0,75) */}
        <g transform={L(0.75)}>
          <path d="M-200 1260 H1280 V2200 H-200 Z" fill="#14100C" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M-200 ${1300 + i * 60 + i * i * 6} H1280`} stroke="#0A0806" strokeWidth="5" opacity=".8" />)}
          <ellipse cx="660" cy="1460" rx="520" ry="90" fill="#3A2A22" stroke={K} strokeWidth="8" />
          <ellipse cx="660" cy="1460" rx="460" ry="70" fill="none" stroke="#6B4A3A" strokeWidth="6" strokeDasharray="20 14" />
          <ellipse cx="660" cy="1250" rx="440" ry="20" fill="#000" opacity=".35" />
          <path d="M260 1120 H1060 L1100 1180 H220 Z" fill="url(#er-table)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M266 1126 H1056" stroke="#A88C6A" strokeWidth="4" />
          <path d="M220 1180 H1100 V1210 H220 Z" fill="#3A2C20" stroke={K} strokeWidth="8" />
          <path d="M280 1210 V1420 M1040 1210 V1420" stroke={K} strokeWidth="26" />
          {/* pentola */}
          <g transform="translate(380 1130)">
            <path d="M-70 0 V-90 H70 V0 Z" fill="url(#er-pot)" stroke={K} strokeWidth="8" />
            <rect x="-80" y="-104" width="160" height="18" rx="6" fill="#4A4F55" stroke={K} strokeWidth="6" />
            <path d="M-80 -60 h-20 M80 -60 h20" stroke={K} strokeWidth="10" strokeLinecap="round" />
            <path d="M-50 -80 V-10" stroke="#C9CFD4" strokeWidth="5" opacity=".6" />
          </g>
          <Wisps t={t} x={380} y={1020} color="#E2DCD0" n={3} h={130} width={6} opacity={0.5} />
          {/* scodella che si rovescia e zuppa che cola */}
          <g transform={`translate(560 1130) rotate(${tip * 80} 60 0)`}>
            <path d="M-60 -40 Q-56 0 0 0 Q56 0 60 -40 Z" fill="url(#er-bowl)" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            <ellipse cx="0" cy="-40" rx="60" ry="12" fill="#B5763A" stroke={K} strokeWidth="6" opacity={1 - tip} />
          </g>
          <Wisps t={t} x={560} y={1080} color="#E2DCD0" n={3} h={110} width={5} opacity={0.55 * (1 - tip * 0.4)} />
          <path d={`M600 1124 Q${lerp(640, 700, spill)} 1126 ${lerp(640, 760, spill)} 1128`} stroke="#B5763A" strokeWidth={18 * Math.min(1, spill * 3)} strokeLinecap="round" fill="none" opacity={spill > 0 ? 1 : 0} />
          <path d={`M1060 1180 v${100 * spill}`} stroke="#B5763A" strokeWidth="10" strokeLinecap="round" opacity={seg(spill, 0.5, 0.6)} />
          <Smoke id="er-steam" t={t} x={680} y={1110} n={6} rise={180} wind={40} r0={20} r1={70} speed={0.6} color="#E2DCD0" opacity={0.6 * spill} />
          {/* tazza: intera, poi cocci */}
          {crash <= 0 ? (
            <g transform="translate(800 1130)">
              <path d="M-36 0 V-80 H36 V0 Z" fill="url(#er-bowl)" stroke={K} strokeWidth="7" />
              <path d="M36 -60 q30 0 30 24 q0 22 -30 22" fill="none" stroke={K} strokeWidth="9" />
              <path d="M-22 -70 V-10" stroke="#FFFFFF" strokeWidth="5" opacity=".6" />
            </g>
          ) : (
            MUG.map((m, i) => (
              <path key={i} d={`M0 ${-m.s} L${m.s * 0.7} ${m.s * 0.3} L${-m.s * 0.6} ${m.s * 0.6} Z`} fill="#EDE7D8" stroke={K} strokeWidth="4"
                transform={`translate(${800 + m.vx * shards} ${1100 - m.vy * Math.sin(shards * Math.PI) + 30 * shards}) rotate(${m.rot + 360 * shards})`} />
            ))
          )}
          {crash > 0 && crash < 1 && <circle cx="800" cy="1090" r={60 * crash} fill="none" stroke="#F2EDE0" strokeWidth="6" opacity={1 - crash} />}
          {/* sigaro (sempre spento) e fiammifero che brucia */}
          <g transform="translate(930 1118) rotate(-6)">
            <rect x="-70" y="-14" width="120" height="22" rx="11" fill="#6B4A30" stroke={K} strokeWidth="6" />
            <rect x="-24" y="-16" width="20" height="26" fill="#B9A27A" stroke={K} strokeWidth="4" />
            <path d="M-60 -6 H40" stroke="#9A7454" strokeWidth="3" />
          </g>
          <g transform={`translate(${lerp(1040, 960, match)} ${1080 - 30 * match}) rotate(${lerp(-60, -20, match)})`}>
            <path d={`M0 0 L0 ${-70 + 50 * burn}`} stroke="#D8C49A" strokeWidth="8" strokeLinecap="round" />
            <path d={`M0 ${-70 + 50 * burn} L0 -70`} stroke="#2A2220" strokeWidth="8" strokeLinecap="round" opacity={burn > 0 ? 1 : 0} />
            <circle cx="0" cy="-74" r="8" fill="#5A2A20" />
            {match > 0.8 && matchOut < 1 && (
              <g opacity={1 - matchOut}>
                <Glow id="er-mg" x={0} y={-60 + 50 * burn - 40} r={90} t={t} color="#F3DDA8" amp={0.2} rate={9} opacity={0.6} />
                <path d={flamePath(0, -60 + 50 * burn, 12, 54, t, 1)} fill="#E8A456" stroke={K} strokeWidth="4" />
                <path d={flamePath(0, -60 + 50 * burn, 6, 30, t, 2)} fill="#FFE6A8" />
              </g>
            )}
          </g>
          <Wisps t={t} x={960} y={1040} color="#BDB6AA" n={2} h={140} width={4} opacity={0.5 * matchOut} />
          <g transform="translate(1030 1132) rotate(8)">
            <rect x="-34" y="-20" width="68" height="24" rx="3" fill="#C9B48A" stroke={K} strokeWidth="5" />
            <rect x="-34" y="-20" width="12" height="24" fill={ACC} opacity={0.6 + 0.4 * match} />
          </g>
        </g>

        {/* PIANO 3 — schienale della sedia e legna in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <g>
            <path d="M-160 1980 V1380 Q-60 1340 60 1380 V1980" fill="none" stroke="url(#er-front)" strokeWidth="60" />
            <path d="M-160 1980 V1380 Q-60 1340 60 1380 V1980" fill="none" stroke={K} strokeWidth="8" />
            <path d="M-100 1420 V1980 M0 1410 V1980" stroke="#2A1E16" strokeWidth="26" />
          </g>
          <g transform="translate(780 1620)">
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const x = (i % 3) * 120 + (i > 2 ? 60 : 0), y = i > 2 ? -90 : 0;
              return (
                <g key={i}>
                  <rect x={x} y={y} width="160" height="90" rx="45" fill="#4A3828" stroke={K} strokeWidth="8" />
                  <ellipse cx={x + 140} cy={y + 45} rx="26" ry="38" fill="#B9946A" stroke={K} strokeWidth="6" />
                  <ellipse cx={x + 140} cy={y + 45} rx="12" ry="20" fill="none" stroke="#7A5A3A" strokeWidth="4" />
                </g>
              );
            })}
          </g>
        </g>

        {/* PIANO 4 — braci del camino, note del violino, particelle (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Embers t={t} x={100} y={1180} w={180} h={600} n={20} seed={44} hot="#FFE6A8" warm="#E8A456" drift={160} />
          <g opacity={violin}>
            <Notes t={t} x={520} y={740} n={6} color="#E8DDBF" outline={K} rise={340} spread={300} speed={0.4} size={0.9} />
          </g>
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 560, x0: 680, x1: 980 }} bottom={{ y: 1250, x0: 400, x1: 900 }} n={18} color="#E8DCC0" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="er-near" t={t} color="#F0D9B0" n={6} vx={-25} vy={-12} opacity={0.08} />
        </g>
      </g>

      <Finish id="er" tint="#5E6B75" tintOpacity={0.12} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): fuoco che divampa cue0 → +1,6 · violino cue1 → cue2 + 1 · scodella cue3, tazza in frantumi
// cue3 + 0,6 · fiammifero acceso cue4, si spegne a fine scena (il sigaro resta spento).
