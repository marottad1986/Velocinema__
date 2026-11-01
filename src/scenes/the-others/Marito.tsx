import React from 'react';
import { camera, eio, lerp, rng, seg } from '../../lib/anim';
import { Flyers, Fog, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { SERIF } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { Fiamma, K, OthersDefs, Ombra } from './Comuni';

// Il marito nella nebbia: un sentiero nel bosco immerso nella nebbia fitta, con la staccionata di legno e il campanile
// del paese appena visibile in fondo. Una lanterna appesa a un ramo oscilla (Grace che cerca un prete, mai disegnata).
// Eventi: prima frase la lanterna oscilla nella nebbia e il campanile lontano affiora; seconda frase la nebbia si apre
// e sul palo della staccionata compaiono l'elmetto militare e la sacca del soldato (Charles che torna); terza frase la
// nebbia li richiude e svaniscono, come lui che riparte.
// Piani: cielo di nebbia e campanile (0,25) · alberi lontani (0,45) · sentiero, staccionata, elmetto e sacca (0,7)
//        · ramo con la lanterna e tronchi in primo piano (1,2) · foglie e nebbia vicina (1,5–1,8)

const r = rng(606);
const TREES = Array.from({ length: 12 }, (_, i) => ({ x: -140 + i * 120 + r() * 50, w: 22 + r() * 26, o: 0.15 + r() * 0.3 }));

export const Marito: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const spire = eio(seg(t, cues[0], cues[0] + 2));
  const come = eio(seg(t, cues[1] + 0.3, cues[1] + 1.5));
  const go = eio(seg(t, cues[2] + 1.0, dur - 0.4));
  const vis = 0.32 + 0.68 * come * (1 - go); // sempre in scena: sagoma nella nebbia, poi netta, poi di nuovo sagoma
  const swing = 7 * Math.sin(t * 1.6);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ma" />
        <OthersDefs id="ma" />
        <Lin id="ma-sky" stops={[[0, '#2A3432'], [0.35, '#5A6662'], [0.6, '#8A9692'], [1, '#6A7672']]} />
        <Lin id="ma-ground" stops={[[0, '#4A524A'], [0.5, '#2A302A'], [1, '#121612']]} />
        <Lin id="ma-path" stops={[[0, '#8A8C80'], [1, '#3A3A32']]} />
        <Lin id="ma-khaki" x2={1} y2={0} stops={[[0, '#3A3C26'], [0.45, '#7A7A4E'], [1, '#2E301E']]} />
        <Lin id="ma-canvas" x2={1} y2={0} stops={[[0, '#4A4630'], [0.4, '#8A8460'], [1, '#3A3624']]} />
        <Lin id="ma-post" x2={1} y2={0} stops={[[0, '#2A2218'], [0.45, '#5A4A36'], [1, '#1E1810']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo di nebbia e il campanile del paese che affiora (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ma-sky)" />
          <g opacity={0.35 + 0.5 * spire} fill="#2E3836">
            <path d="M800 1060 V820 L830 700 L860 820 V1060 Z" />
            <rect x="740" y="900" width="200" height="160" />
            <path d="M740 900 L840 840 L940 900 Z" />
          </g>
          <Fog id="ma-f0" t={t} y={980} rx={900} ry={160} color="#A8B2AE" opacity={0.55} speed={0.15} />
        </g>

        {/* PIANO 1 — alberi lontani senza contorni (0,45) */}
        <g transform={L(0.45)}>
          {TREES.map((tr, i) => (
            <g key={i} opacity={tr.o}>
              <rect x={tr.x} y={700 + (i % 3) * 30} width={tr.w} height={420 - (i % 3) * 30} fill="#2E3836" />
              <path d={`M${tr.x + tr.w / 2} 760 l-70 -90 M${tr.x + tr.w / 2} 860 l60 -80`} stroke="#2E3836" strokeWidth="10" />
            </g>
          ))}
          <Fog id="ma-f1" t={t} y={1080} rx={900} ry={120} color="#B0BAB6" opacity={0.6} speed={0.2} ph={1} />
        </g>

        {/* PIANO 2 — terreno, sentiero, staccionata; elmetto e sacca sul palo (0,7) */}
        <g transform={L(0.7)}>
          <path d="M-200 1100 Q540 1080 1280 1100 V2200 H-200 Z" fill="url(#ma-ground)" />
          <path d="M470 1100 Q440 1180 400 1260 Q330 1420 120 2200 H760 Q620 1500 600 1260 Q590 1170 530 1100 Z" fill="url(#ma-path)" stroke={K} strokeWidth="5" />
          {Array.from({ length: 30 }, (_, i) => {
            const v = (i * 0.618) % 1, yy = 1120 + v * v * 800;
            return <ellipse key={i} cx={lerp(500, 440, v) + (((i * 37) % 100) / 100 - 0.5) * lerp(50, 500, v)} cy={yy} rx={4 + v * 10} ry={2 + v * 4} fill="#5A5A50" opacity=".5" />;
          })}
          {/* staccionata a destra del sentiero, che si perde nella nebbia */}
          {[[640, 1110, 0.35], [690, 1150, 0.5], [760, 1200, 0.7]].map(([px, py, s], i) => (
            <g key={i} transform={`translate(${px} ${py}) scale(${s})`} opacity={0.5 + i * 0.15}>
              <rect x="-14" y="-260" width="28" height="270" fill="url(#ma-post)" stroke={K} strokeWidth="6" />
            </g>
          ))}
          <path d="M640 1030 L690 1080 L760 1110 L860 1140" stroke="#2A2218" strokeWidth="8" fill="none" opacity=".7" />
          <path d="M640 1060 L690 1110 L760 1150 L860 1190" stroke="#2A2218" strokeWidth="8" fill="none" opacity=".7" />
          {/* cartello di legno verso il paese e la chiesa (Grace cerca un prete) */}
          <g transform="translate(380 1250)">
            <Ombra id="ma" x={0} y={4} rx={90} ry={12} />
            <rect x="-12" y="-330" width="24" height="334" fill="url(#ma-post)" stroke={K} strokeWidth="6" />
            <g transform={`rotate(${-4 + 2 * spire})`}>
              <path d="M-30 -320 H170 L210 -284 L170 -248 H-30 Z" fill="#7A5E3E" stroke={K} strokeWidth="7" />
              <path d="M-22 -312 H160" stroke="#B8946A" strokeWidth="4" opacity=".6" />
              <text x="80" y="-272" textAnchor="middle" fontFamily={SERIF} fontSize="34" fill="#1E140C" letterSpacing="2">CHIESA</text>
            </g>
            <path d="M-30 -230 H130 L100 -200 H-30 Z" fill="#5E4830" stroke={K} strokeWidth="6" transform="rotate(6 -30 -215)" />
          </g>
          {/* il palo grande */}
          <Ombra id="ma" x={880} y={1270} rx={160} ry={18} />
          <rect x="852" y="940" width="56" height="330" fill="url(#ma-post)" stroke={K} strokeWidth="8" />
          <path d="M860 950 V1260" stroke="#8A7458" strokeWidth="4" opacity=".5" />
          {[1000, 1080, 1170].map((y) => <path key={y} d={`M858 ${y} q20 8 42 -2`} stroke="#1E1810" strokeWidth="4" fill="none" />)}
          <path d="M852 940 L880 920 L908 940 Z" fill="#3A2E20" stroke={K} strokeWidth="5" />
          <path d="M860 1140 H1100 M860 1060 H1100" stroke="#2A2218" strokeWidth="10" />
          <g opacity={vis}>
            {/* elmetto militare sul palo */}
            <g transform="translate(880 930) rotate(-6)">
              <ellipse cx="0" cy="0" rx="112" ry="26" fill="url(#ma-khaki)" stroke={K} strokeWidth="8" />
              <path d="M-70 -4 Q-70 -80 0 -84 Q70 -80 70 -4 Z" fill="url(#ma-khaki)" stroke={K} strokeWidth="8" />
              <path d="M-50 -40 Q-40 -70 0 -74" stroke="#B8B488" strokeWidth="6" fill="none" opacity=".6" strokeLinecap="round" />
              <path d="M-100 6 Q0 30 100 6" stroke="#1E2012" strokeWidth="4" fill="none" />
              <path d="M60 10 Q70 70 40 110" stroke="#4A3A24" strokeWidth="7" fill="none" />
            </g>
            {/* sacca del soldato appoggiata al palo */}
            <g transform="translate(780 1270) rotate(-8)">
              <Ombra id="ma" x={0} y={0} rx={110} ry={14} />
              <path d="M-70 0 Q-84 -100 -60 -220 Q-40 -250 0 -252 Q40 -250 60 -220 Q84 -100 70 0 Q0 12 -70 0 Z" fill="url(#ma-canvas)" stroke={K} strokeWidth="8" />
              <path d="M-60 -220 Q0 -200 60 -220" stroke={K} strokeWidth="6" fill="none" />
              <path d="M-20 -248 Q0 -290 24 -248" stroke={K} strokeWidth="9" fill="none" />
              <path d="M-50 -170 Q-60 -90 -50 -20" stroke="#B8B088" strokeWidth="5" fill="none" opacity=".5" />
              <path d="M30 -230 Q90 -120 50 -10" stroke="#4A3A24" strokeWidth="10" fill="none" />
              <rect x="-30" y="-130" width="60" height="40" fill="none" stroke="#2A2818" strokeWidth="4" />
            </g>
          </g>
          {/* la nebbia che si apre e si richiude sul palo */}
          <Fog id="ma-veil" t={t} y={1060} x={860} rx={320} ry={300} color="#9AA6A2" opacity={0.75 * (1 - vis) + 0.1} speed={0.3} drift={30} />
          <Fog id="ma-f2" t={t} y={1240} rx={900} ry={110} color="#B0BAB6" opacity={0.5} speed={0.25} ph={2} />
        </g>

        {/* PIANO 3 — tronco e ramo in primo piano con la lanterna appesa (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 -200 H60 Q90 600 70 1200 Q60 1700 110 2200 H-200 Z" fill="#141A18" stroke={K} strokeWidth="10" />
          <path d="M40 -100 Q66 600 50 1200" stroke="#3A4642" strokeWidth="6" fill="none" opacity=".6" />
          <path d="M60 640 Q200 600 360 640 Q440 660 520 640" stroke={K} strokeWidth="30" fill="none" strokeLinecap="round" />
          <path d="M200 616 Q240 560 300 548 M380 648 Q420 600 470 600" stroke={K} strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d="M70 628 Q200 590 360 630" stroke="#4A5652" strokeWidth="5" fill="none" opacity=".6" />
          {/* lanterna a tempesta */}
          <g transform={`translate(190 626) rotate(${swing}) scale(1.15)`}>
            <path d="M0 0 V40" stroke={K} strokeWidth="6" />
            <Glow id="ma-lan" x={0} y={170} r={330} t={t} color="#FFC870" amp={0.06} rate={9} opacity={0.7} />
            <path d="M-46 60 Q0 20 46 60" stroke={K} strokeWidth="8" fill="none" />
            <rect x="-40" y="60" width="80" height="24" rx="6" fill="#2A2E2E" stroke={K} strokeWidth="6" />
            <path d="M-34 84 Q-48 150 -34 210 H34 Q48 150 34 84 Z" fill="#FFE8B0" opacity=".35" stroke={K} strokeWidth="6" />
            <Fiamma id="ma" x={0} y={176} t={t} s={1} ph={1.1} />
            {[-36, 0, 36].map((x) => <path key={x} d={`M${x} 84 Q${x * 1.35} 150 ${x} 210`} stroke="#2A2E2E" strokeWidth="6" fill="none" />)}
            <rect x="-44" y="206" width="88" height="26" rx="6" fill="#2A2E2E" stroke={K} strokeWidth="6" />
            <path d="M-24 100 Q-30 140 -22 180" stroke="#FFFFFF" strokeWidth="4" opacity=".5" fill="none" />
          </g>
          {/* rocce con muschio e pozzanghera che riflette la lanterna */}
          <ellipse cx="440" cy="1820" rx="200" ry="40" fill="#3A4444" opacity=".8" />
          <ellipse cx={420 + swing * 3} cy="1816" rx="40" ry="10" fill="#FFC870" opacity=".35" />
          {[[-20, 1760, 170, 120], [960, 1740, 190, 140], [820, 1860, 140, 90]].map(([x, y, w, h], i) => (
            <g key={`r${i}`}>
              <path d={`M${x - w} ${y + h} Q${x - w} ${y} ${x} ${y - h * 0.2} Q${x + w} ${y} ${x + w} ${y + h} Z`} fill="#3A403C" stroke={K} strokeWidth="8" />
              <path d={`M${x - w * 0.7} ${y + h * 0.1} Q${x} ${y - h * 0.25} ${x + w * 0.6} ${y + h * 0.05}`} stroke="#3E5A38" strokeWidth="16" fill="none" strokeLinecap="round" />
            </g>
          ))}
          {/* felci e radici in basso */}
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d={`M${i < 3 ? 60 + i * 70 : 820 + (i - 3) * 90} 1920 Q${i < 3 ? 100 + i * 80 : 780 + (i - 3) * 90} 1660 ${i < 3 ? 200 + i * 60 : 700 + (i - 3) * 110} 1560`} stroke="#1A2620" strokeWidth="26" fill="none" strokeLinecap="round" />
          ))}
        </g>

        {/* PIANO 4 — foglie e nebbia vicina (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Flyers t={t} seed={21} n={5} color="#6A5A3A" outline={K} w={28} h={38} y0={700} y1={1700} speed={0.07} shape="leaf" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="ma-near" t={t} color="#D0DAD6" n={8} r0={90} r1={200} opacity={0.16} />
        </g>
      </g>
      <Finish id="ma" tint="#3A4744" tintOpacity={0.12} />
    </svg>
  );
};
