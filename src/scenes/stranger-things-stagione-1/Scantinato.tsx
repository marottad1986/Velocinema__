import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { Beam, Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { CROMA, K, Ombra, StDefs, VELATURA } from './Comuni';

// Undici nello scantinato: lo scantinato di casa Wheeler di notte, con la tenda di coperte tra il divano e la poltrona.
// Eventi: prima frase i tre walkie-talkie dei ragazzi sul tavolo si accendono uno dopo l'altro (Mike, Dustin e Lucas,
// mai disegnati); seconda frase dentro la tenda di coperte si accende una torcia (Undici nascosta, mai disegnata);
// terza frase la porta in cima alle scale si chiude di colpo da sola e i dadi si alzano dal
// tavolo e restano sospesi (muove le cose col pensiero).
// Piani: parete di legno, finestrella alta con la luna, scaffale (0,28) · scala e porta in alto (0,46)
//        · tenda di coperte, divano, poltrona (0,64) · tavolo con walkie-talkie, dadi, fumetti (0,9)
//        · palo di sostegno e scatola dei giochi (1,2) · pulviscolo (1,5) · velo vicino (1,8)

const PANELS = Array.from({ length: 24 }, (_, i) => -200 + i * 62);

const Walkie: React.FC<{ x: number; y: number; on: number; t: number; ph: number; id: string }> = ({ x, y, on, t, ph, id }) => (
  <g transform={`translate(${x} ${y})`}>
    <Ombra id={id} x={0} y={4} rx={40} ry={7} />
    <path d="M14 -96 V-180" stroke={K} strokeWidth="9" strokeLinecap="round" />
    <path d="M14 -96 V-180" stroke="#4A4E56" strokeWidth="4" strokeLinecap="round" />
    <rect x="-30" y="-100" width="60" height="104" rx="8" fill="#2A2E36" stroke={K} strokeWidth="6" />
    <rect x="-22" y="-84" width="44" height="40" rx="4" fill="#4A505A" stroke={K} strokeWidth="3" />
    {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M-16 ${-78 + i * 7} H16`} stroke="#1A1C22" strokeWidth="3" />)}
    <rect x="-22" y="-34" width="28" height="12" rx="2" fill="#1A1C22" />
    <circle cx="16" cy="-28" r="6" fill={on > 0.1 ? '#FF4A3A' : '#4A2020'} stroke={K} strokeWidth="2" />
    <Glow id={`${id}-led`} x={16} y={-28} r={30} t={t} color="#FF4A3A" amp={0.3} rate={9} ph={ph} opacity={0.9 * on} />
    <path d="M-26 -96 V0" stroke="#7A808A" strokeWidth="3" opacity=".5" />
  </g>
);

export const Scantinato: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;

  // prima frase: tre walkie-talkie che si accendono uno dopo l'altro
  const wOn = (i: number) => seg(t, griglia(cues[0] + 0.8 + i * 2 * CROMA, 2), griglia(cues[0] + 0.8 + i * 2 * CROMA, 2) + 0.05);
  // seconda frase: la torcia dentro la tenda
  const tTorch = griglia(cues[1] + 0.8);
  const torch = eo(seg(t, tTorch, tTorch + 0.25)) * (0.9 + 0.1 * Math.sin(t * 5));
  // terza frase: la porta sbatte e gli oggetti si alzano
  const tSlam = griglia(cues[2] + 0.3);
  const doorAng = lerp(58, 0, eob(seg(t, tSlam - 0.18, tSlam), 0.6));
  const shake = seg(t, tSlam, tSlam + 0.4) > 0 && t < tSlam + 0.4 ? Math.sin((t - tSlam) * 70) * 6 * (1 - seg(t, tSlam, tSlam + 0.4)) : 0;
  const tLift = tSlam + 2 * CROMA;
  const lift = eo(seg(t, tLift, tLift + 0.9));
  const bob = (ph: number) => Math.sin(t * 2.4 + ph) * 6 * lift;
  const upstairs = 1 - seg(t, tSlam - 0.05, tSlam);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sc" />
        <StDefs id="sc" />
        <Lin id="sc-wall" stops={[[0, '#16110C'], [0.3, '#2E2216'], [0.6, '#3E2E1C'], [1, '#22180E']]} />
        <Lin id="sc-panel" x2={1} y2={0} stops={[[0, '#000', 0.25], [0.5, '#000', 0], [1, '#000', 0.3]]} />
        <Lin id="sc-floor" stops={[[0, '#3A3A30'], [0.4, '#262620'], [1, '#0E0E0C']]} />
        <Lin id="sc-blanket1" x2={1} y2={0} stops={[[0, '#2E4A6A'], [0.5, '#4A6A8A'], [1, '#1E3048']]} />
        <Lin id="sc-blanket2" x2={1} y2={0} stops={[[0, '#6A2A22'], [0.5, '#8A3A2E'], [1, '#4A1C16']]} />
        <Lin id="sc-couch" stops={[[0, '#6A5A3A'], [1, '#3A3020']]} />
        <pattern id="sc-plaid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M0 15 H60 M0 45 H60 M15 0 V60 M45 0 V60" stroke="#F2E3C6" strokeWidth="5" opacity=".18" />
          <path d="M0 30 H60 M30 0 V60" stroke="#0A0E18" strokeWidth="8" opacity=".2" />
        </pattern>
        <radialGradient id="sc-torch" cx=".5" cy=".55" r=".55"><stop offset="0" stopColor="#FFE8A8" stopOpacity=".95" /><stop offset=".5" stopColor="#F5B83D" stopOpacity=".45" /><stop offset="1" stopColor="#F5B83D" stopOpacity="0" /></radialGradient>
      </defs>

      <g transform={`${cam.transform} translate(${shake * 0.3} 0)`}>
        {/* PIANO 0 — parete di perline, finestrella alta con la luna, scaffale dei giochi (0,28) */}
        <g transform={L(0.28)}>
          <rect x="-200" y="-200" width="1480" height="1600" fill="url(#sc-wall)" />
          {PANELS.map((x) => (
            <g key={x}>
              <rect x={x} y="-200" width="62" height="1600" fill="url(#sc-panel)" />
              <path d={`M${x} -200 V1400`} stroke="#0E0A06" strokeWidth="3" opacity=".7" />
            </g>
          ))}
          {/* finestrella a livello del giardino */}
          <rect x="120" y="690" width="250" height="110" fill="#16263C" stroke={K} strokeWidth="8" />
          <path d="M120 760 Q245 740 370 770 V800 H120 Z" fill="#0C1420" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${130 + i * 28} 780 q4 -18 -2 -34`} stroke="#1E3424" strokeWidth="5" fill="none" />)}
          <circle cx="300" cy="722" r="18" fill="#DCE6F2" />
          <path d="M245 690 V800" stroke={K} strokeWidth="6" />
          <rect x="120" y="690" width="250" height="110" fill="url(#sc-glass)" />
          <Glow id="sc-win" x={245} y={745} r={160} t={t} color="#9CB8D8" amp={0.03} rate={1} opacity={0.4} />
          {/* scaffale con le scatole dei giochi da tavolo */}
          <rect x="430" y="860" width="250" height="14" fill="#5A3E26" stroke={K} strokeWidth="5" />
          {[[436, 50, '#B8352F'], [490, 36, '#2E5A8A'], [530, 56, '#E8C860'], [590, 42, '#4A7A4A'], [636, 30, '#8A4A8A']].map(([x, h, c], i) => (
            <g key={i}>
              <rect x={x as number} y={860 - (h as number)} width={i === 2 ? 56 : 48} height={h as number} fill={c as string} stroke={K} strokeWidth="4" />
              <path d={`M${(x as number) + 6} ${866 - (h as number)} h30`} stroke="#F2E3C6" strokeWidth="3" opacity=".6" />
            </g>
          ))}
          <path d="M-200 1240 H1280" stroke="#120C08" strokeWidth="10" />
          <Beam id="sc-moonbeam" x={245} y={760} t={t} length={620} spread={260} color="#AFC8E8" angle={62} opacity={0.22} />
        </g>

        {/* PIANO 1 — scala che sale alla porta (con la luce di casa) e pavimento (0,46) */}
        <g transform={L(0.46)}>
          <path d="M-200 1236 H1280 V2200 H-200 Z" fill="url(#sc-floor)" />
          {/* porta in cima: vano caldo e anta che si chiude */}
          <rect x="736" y="664" width="124" height="200" fill="#FFCF8A" opacity={0.3 + 0.7 * upstairs} stroke={K} strokeWidth="8" />
          <rect x="736" y="664" width="124" height="200" fill="#1A120C" opacity={1 - upstairs} />
          <g transform={`translate(736 664) scale(${Math.cos((doorAng * Math.PI) / 180)} 1)`}>
            <rect x="0" y="0" width="124" height="200" fill="#5A3E26" stroke={K} strokeWidth="7" />
            <rect x="16" y="18" width="92" height="70" fill="none" stroke="#3A2818" strokeWidth="5" />
            <rect x="16" y="108" width="92" height="74" fill="none" stroke="#3A2818" strokeWidth="5" />
            <circle cx="106" cy="104" r="7" fill="#C8A060" stroke={K} strokeWidth="3" />
          </g>
          {/* lama di luce dalla porta socchiusa sui gradini */}
          <path d="M860 864 L1080 1100 L1080 1200 L800 864 Z" fill="#FFCF8A" opacity={0.25 * upstairs} />
          <rect x="726" y="862" width="160" height="16" fill="#3A2818" stroke={K} strokeWidth="5" />
          {/* gradini che scendono a destra */}
          {Array.from({ length: 8 }, (_, i) => {
            const sx = 860 + i * 34, sy = 878 + i * 46;
            return (
              <g key={i}>
                <rect x={sx} y={sy} width="300" height="46" fill={i % 2 ? '#4A3422' : '#563C26'} stroke={K} strokeWidth="5" />
                <path d={`M${sx} ${sy + 3} H${sx + 300}`} stroke="#B08A60" strokeWidth="3" opacity=".5" />
              </g>
            );
          })}
          {/* corrimano */}
          <path d="M850 780 L1110 1110" stroke={K} strokeWidth="14" strokeLinecap="round" />
          <path d="M850 780 L1110 1110" stroke="#7A5A3A" strokeWidth="7" strokeLinecap="round" />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M${880 + i * 68} ${818 + i * 86} V${930 + i * 90}`} stroke="#5A3E26" strokeWidth="8" />)}
          <Glow id="sc-dust" x={790} y={760} r={90} t={t} color="#C8B8A0" amp={0} opacity={0.6 * seg(t, tSlam, tSlam + 0.1) * (1 - seg(t, tSlam + 0.1, tSlam + 1.2))} />
        </g>

        {/* PIANO 2 — divano, poltrona e la tenda di coperte con la torcia dentro (0,64) */}
        <g transform={`${L(0.64)} translate(520 1250) scale(1.2) translate(-520 -1250)`}>
          <Ombra id="sc" x={380} y={1250} rx={360} ry={26} />
          {/* poltrona a sinistra e divano a destra (schienali) */}
          <path d="M40 960 Q40 920 90 920 H210 Q250 920 250 960 V1240 H40 Z" fill="url(#sc-couch)" stroke={K} strokeWidth="9" />
          <path d="M520 970 Q520 930 570 930 H700 Q740 930 740 970 V1240 H520 Z" fill="url(#sc-couch)" stroke={K} strokeWidth="9" />
          {/* coperta azzurra a quadri tesa tra i due schienali: il tetto della tenda */}
          <path d="M70 930 Q250 880 380 900 Q520 880 710 940 L700 1060 Q560 1010 380 1030 Q220 1010 80 1060 Z" fill="url(#sc-blanket1)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M70 930 Q250 880 380 900 Q520 880 710 940 L700 1060 Q560 1010 380 1030 Q220 1010 80 1060 Z" fill="url(#sc-plaid)" />
          <path d="M80 936 Q250 890 380 908" stroke="#9AB8D8" strokeWidth="4" fill="none" opacity=".6" />
          {/* lenzuolo rosso che scende davanti, aperto al centro */}
          <path d="M120 1040 Q200 1030 300 1040 L276 1244 H90 Z" fill="url(#sc-blanket2)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M460 1040 Q560 1030 660 1046 L690 1244 H486 Z" fill="url(#sc-blanket2)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          {[150, 200, 250].map((x) => <path key={x} d={`M${x} 1050 Q${x - 6} 1150 ${x - 14} 1240`} stroke="#3A120E" strokeWidth="4" fill="none" opacity=".6" />)}
          {[500, 560, 620].map((x) => <path key={x} d={`M${x} 1050 Q${x + 6} 1150 ${x + 14} 1240`} stroke="#3A120E" strokeWidth="4" fill="none" opacity=".6" />)}
          {/* interno della tenda: buio, poi la luce calda della torcia */}
          <path d="M300 1040 Q380 1028 460 1040 L486 1244 H276 Z" fill="#0C0A08" />
          <path d="M300 1040 Q380 1028 460 1040 L486 1244 H276 Z" fill="url(#sc-torch)" opacity={torch} />
          <Glow id="sc-torchout" x={380} y={1150} r={260} t={t} color="#F5B83D" amp={0.05} rate={5} opacity={0.55 * torch} />
          {/* cuscini e coperta arrotolata all'ingresso */}
          <ellipse cx="330" cy="1222" rx="56" ry="24" fill="#D8C8A8" stroke={K} strokeWidth="6" />
          <ellipse cx="440" cy="1228" rx="48" ry="20" fill="#8AA0B8" stroke={K} strokeWidth="6" />
          {/* torcia accesa posata dentro */}
          <g opacity={0.25 + 0.75 * seg(t, tTorch - 0.1, tTorch)}>
            <rect x="372" y="1180" width="46" height="18" rx="4" fill="#B8352F" stroke={K} strokeWidth="4" />
            <rect x="414" y="1176" width="12" height="26" rx="3" fill="#C8C8C0" stroke={K} strokeWidth="3" />
          </g>
          <path d="M70 930 Q50 990 60 1060 M710 940 Q730 1000 716 1070" stroke={K} strokeWidth="6" fill="none" />
        </g>

        {/* PIANO 3 — tavolino con walkie-talkie, dadi, fumetti (0,9) */}
        <g transform={`${L(0.9)} translate(520 1250) scale(1.25) translate(-580 -1250)`}>
          <Ombra id="sc" x={790} y={1290} rx={240} ry={22} />
          <path d="M560 1196 H1040 L1060 1222 H540 Z" fill="#6A4A2E" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M556 1200 H1044" stroke="#C8A070" strokeWidth="3" opacity=".6" />
          <path d="M580 1222 V1300 M1020 1222 V1300" stroke="#3A2818" strokeWidth="14" />
          {/* fumetti impilati */}
          <path d="M580 1196 l10 -20 h110 l-6 20 Z" fill="#E8C860" stroke={K} strokeWidth="5" />
          <path d="M586 1176 l8 -14 h104 l-4 14 Z" fill="#5A9AC8" stroke={K} strokeWidth="5" />
          <path d="M610 1170 h40" stroke="#B8352F" strokeWidth="5" />
          {/* tre walkie-talkie */}
          <Walkie id="sc-w0" x={760} y={1196} on={wOn(0)} t={t} ph={0} />
          <Walkie id="sc-w1" x={850} y={1196} on={wOn(1)} t={t} ph={1.3} />
          <Walkie id="sc-w2" x={940} y={1196} on={wOn(2)} t={t} ph={2.6} />
          {/* dadi che si alzano sospesi */}
          <g transform={`translate(0 ${-110 * lift + bob(0)}) rotate(${lift * 24} 640 1176)`}>
            <path d="M622 1194 L640 1160 L664 1176 L646 1206 Z" fill="#E8E2D2" stroke={K} strokeWidth="5" strokeLinejoin="round" />
            <path d="M640 1160 L646 1206 M622 1194 L664 1176" stroke={K} strokeWidth="2.5" />
            <circle cx="636" cy="1186" r="3" fill={K} /><circle cx="652" cy="1182" r="3" fill={K} />
          </g>
          <g transform={`translate(0 ${-150 * lift + bob(1.7)}) rotate(${-lift * 30} 700 1180)`}>
            <path d="M686 1196 L704 1170 L722 1196 L704 1206 Z" fill="#B8352F" stroke={K} strokeWidth="5" strokeLinejoin="round" />
            <path d="M704 1170 V1206" stroke={K} strokeWidth="2.5" />
          </g>
          {/* anelli di tremolio sotto gli oggetti sospesi */}
          {[650, 704].map((x, i) => (
            <ellipse key={x} cx={x} cy={1194} rx={22 + 14 * Math.sin(t * 4 + i)} ry={5} fill="none" stroke="#F2E3C6" strokeWidth="3" opacity={0.5 * lift} />
          ))}
        </g>

        {/* PIANO 4 — palo di sostegno a sinistra, scatola dei giochi e bici a terra a destra (1,2) */}
        <g transform={L(1.2)}>
          <rect x="-60" y="300" width="100" height="1700" fill="url(#sc-bark)" stroke={K} strokeWidth="10" />
          <path d="M30 320 V1980" stroke="#7A6A56" strokeWidth="4" opacity=".4" />
          <path d="M60 1600 L340 1560 L380 1760 L80 1820 Z" fill="#8A6A44" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M60 1600 L340 1560 L330 1530 L50 1570 Z" fill="#A88458" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          <text x="210" y="1712" textAnchor="middle" fontFamily="Figtree, sans-serif" fontWeight="800" fontSize="40" fill="#3A2818" transform="rotate(-8 210 1700)">GIOCHI</text>
          <circle cx="980" cy="1720" r="150" fill="none" stroke={K} strokeWidth="16" />
          <circle cx="980" cy="1720" r="150" fill="none" stroke="#5A6068" strokeWidth="8" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M980 1720 l${Math.cos(i * 0.52) * 146} ${Math.sin(i * 0.52) * 146}`} stroke="#8A929A" strokeWidth="2.5" />)}
          <circle cx="980" cy="1720" r="16" fill="#3A3E46" stroke={K} strokeWidth="5" />
        </g>

        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 760, x0: 200, x1: 300 }} bottom={{ y: 1250, x0: 380, x1: 760 }} seed={4} n={16} color="#C8D8F0" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="sc-near" t={t} color="#C8B898" n={6} r0={80} r1={160} opacity={0.08} y0={760} />
        </g>
      </g>
      <Finish id="sc" tint={VELATURA} tintOpacity={0.1} />
    </svg>
  );
};
