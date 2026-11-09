import React from 'react';
import { camera, eio, eo, lerp, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes, Wisps } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { K, Ombra, SestoDefs } from './Comuni';

// Il messaggio della nonna: la cucina di casa Sear la sera. Sul tavolo con la tovaglia a quadri due tazze fumanti
// (Cole e la madre) e in mezzo il vecchio portagioie di legno della nonna; dietro la finestra con il lampione, i
// pensili e le piastrelle; in primo piano gli schienali delle sedie.
// Eventi: 1ª frase le due tazze fumano lontane, la luce è fredda (Lynn non gli crede); 2ª frase il coperchio del
// portagioie si apre da solo e dentro brilla una vecchia spilla (il messaggio della nonna); 3ª frase una luce calda
// riempie la cucina e i fili di vapore delle due tazze si avvicinano e si intrecciano (Lynn gli crede). Nessuna persona.
// Piani: parete con la finestra e i pensili (0,3) · piano di lavoro con il bollitore (0,5) · tavolo con le tazze e il
//        portagioie (0,7) · schienali delle sedie in primo piano (1,2) · pulviscolo caldo (1,5–1,8)

export const Nonna: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const lid = eio(seg(t, griglia(cues[1] + 0.6), griglia(cues[1] + 0.6) + 1.2));
  const glint = seg(t, griglia(cues[1] + 1.4), griglia(cues[1] + 1.4) + 0.6);
  const warm = eo(seg(t, griglia(cues[2] + 0.8), griglia(cues[2] + 0.8) + 1.8));
  const lean = warm; // il vapore delle due tazze si avvicina

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="no" />
        <SestoDefs id="no" />
        <Lin id="no-wall" stops={[[0, '#141A20'], [0.4, '#2A343A'], [0.75, '#343C3E'], [1, '#1E2224']]} />
        <Lin id="no-wallw" stops={[[0, '#2A2018'], [0.4, '#5A4430'], [0.75, '#6A5038'], [1, '#3A2A1C']]} />
        <Lin id="no-night" stops={[[0, '#0E1824'], [1, '#2A3A50']]} />
        <Lin id="no-cab" x2={1} y2={0} stops={[[0, '#7A8A80'], [0.5, '#5E6E64'], [1, '#3E4A44']]} />
        <Lin id="no-floor" stops={[[0, '#3A3028'], [1, '#0A0806']]} />
        <Lin id="no-mug1" x2={1} y2={0} stops={[[0, '#2A5A8A'], [0.5, '#4A8AC0'], [1, '#1E3E60']]} />
        <Lin id="no-mug2" x2={1} y2={0} stops={[[0, '#C8B060'], [0.5, '#F2DA8A'], [1, '#8A7438']]} />
        <Lin id="no-box" x2={1} y2={0} stops={[[0, '#3A2010'], [0.45, '#7A4A28'], [1, '#2A160A']]} />
        <radialGradient id="no-velvet" cx=".5" cy=".4" r=".7"><stop offset="0" stopColor="#3A6A5A" /><stop offset="1" stopColor="#14302A" /></radialGradient>
        <pattern id="no-check" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill="#E8E2D4" />
          <rect width="30" height="30" fill="#5A7AA0" opacity=".55" />
          <rect x="30" y="30" width="30" height="30" fill="#5A7AA0" opacity=".55" />
        </pattern>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete, finestra sulla strada con il lampione, pensili (0,3) */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#no-wall)" />
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#no-wallw)" opacity={warm} />
          {/* piastrelle */}
          {Array.from({ length: 6 }, (_, r) => Array.from({ length: 16 }, (_, c) => (
            <rect key={`${r}-${c}`} x={-200 + c * 92} y={900 + r * 46} width="88" height="42" fill="none" stroke="#000" strokeWidth="2" opacity=".18" />
          )))}
          <rect x="390" y="640" width="300" height="260" fill="url(#no-night)" stroke={K} strokeWidth="9" />
          <rect x="390" y="640" width="300" height="260" fill="#3A2A18" opacity={0.4 * warm} />
          {/* lampione e case di fronte */}
          <path d="M610 900 V720" stroke="#14181C" strokeWidth="8" />
          <circle cx="610" cy="712" r="12" fill="#F2D890" />
          <Glow id="no-street" x={610} y={712} r={110} t={t} color="#F2D890" amp={0.05} rate={2} opacity={0.6} />
          <path d="M390 840 H470 V800 H540 V840 H690 V900 H390 Z" fill="#0A1018" />
          <rect x="420" y="820" width="14" height="18" fill="#E8C870" />
          <path d="M540 640 V900 M390 770 H690" stroke="#4A5250" strokeWidth="10" />
          <rect x="390" y="640" width="300" height="260" fill="url(#no-glass)" />
          <rect x="370" y="896" width="340" height="20" fill="#5A6460" stroke={K} strokeWidth="5" />
          {/* tendina a mezza finestra */}
          <path d="M390 640 H690 V700 Q640 716 590 700 Q540 716 490 700 Q440 716 390 700 Z" fill="#E8E0D0" stroke={K} strokeWidth="5" />
          {/* pensili ai lati */}
          {[[-120, 660], [760, 660]].map(([x, y], i) => (
            <g key={i}>
              <rect x={x} y={y} width="300" height="200" fill="url(#no-cab)" stroke={K} strokeWidth="8" />
              <path d={`M${x + 150} ${y} V${y + 200}`} stroke={K} strokeWidth="6" />
              {[x + 120, x + 180].map((hx) => <rect key={hx} x={hx - 4} y={y + 130} width="8" height="40" rx="3" fill="url(#no-brass)" stroke={K} strokeWidth="2" />)}
              <path d={`M${x + 8} ${y + 8} H${x + 292}`} stroke="#B8C8BC" strokeWidth="4" opacity=".6" />
            </g>
          ))}
        </g>

        {/* PIANO 1 — piano di lavoro con il bollitore e il barattolo (0,5) */}
        <g transform={L(0.5)}>
          <rect x="-200" y="1060" width="1480" height="40" fill="#8A8478" stroke={K} strokeWidth="7" />
          <rect x="-200" y="1100" width="1480" height="200" fill="url(#no-cab)" stroke={K} strokeWidth="7" />
          <g transform="translate(860 1060)">
            <Ombra id="no" x={0} y={2} rx={80} ry={10} />
            <path d="M-60 0 Q-70 -80 -30 -100 H30 Q70 -80 60 0 Z" fill="url(#no-steel)" stroke={K} strokeWidth="7" />
            <path d="M-30 -100 Q0 -140 30 -100" stroke={K} strokeWidth="9" fill="none" />
            <path d="M60 -40 L100 -70" stroke={K} strokeWidth="14" strokeLinecap="round" />
            <path d="M-44 -70 Q-50 -40 -40 -16" stroke="#FFFFFF" strokeWidth="5" opacity=".5" fill="none" />
          </g>
          <g transform="translate(180 1060)">
            <rect x="-40" y="-100" width="80" height="100" rx="10" fill="#C8D8D0" stroke={K} strokeWidth="6" />
            <rect x="-46" y="-118" width="92" height="22" rx="6" fill="#8A5A3A" stroke={K} strokeWidth="5" />
          </g>
        </g>

        {/* PIANO 2 — il tavolo con le due tazze e il portagioie della nonna (0,7) */}
        <g transform={L(0.7)}>
          <path d="M-200 1290 H1280 V2200 H-200 Z" fill="url(#no-floor)" />
          <Ombra id="no" x={540} y={1330} rx={500} ry={40} />
          <path d="M60 1150 Q540 1110 1020 1150 L1080 1290 Q540 1330 0 1290 Z" fill="url(#no-check)" stroke={K} strokeWidth="9" />
          <path d="M0 1290 Q540 1330 1080 1290 L1070 1330 Q540 1370 10 1330 Z" fill="#B8B2A4" stroke={K} strokeWidth="6" />
          <Glow id="no-warm" x={540} y={1100} r={620} t={t} color="#FFD08A" amp={0.04} rate={2} opacity={0.15 + 0.45 * warm} />
          {/* le due tazze fumanti */}
          {[[260, 'no-mug1', -1], [820, 'no-mug2', 1]].map(([x, g, dir], i) => (
            <g key={i}>
              <Ombra id="no" x={(x as number) + 6} y={1236} rx={70} ry={10} />
              <path d={`M${(x as number) - 50} 1230 V1130 H${(x as number) + 50} V1230 Q${x} 1246 ${(x as number) - 50} 1230 Z`} fill={`url(#${g})`} stroke={K} strokeWidth="7" />
              <ellipse cx={x as number} cy="1130" rx="50" ry="12" fill="#3A2010" stroke={K} strokeWidth="6" />
              <path d={`M${(x as number) + 50 * (dir as number)} 1150 q${30 * (dir as number)} 10 0 50`} stroke={K} strokeWidth="11" fill="none" />
              <path d={`M${(x as number) - 34} 1150 V1214`} stroke="#FFFFFF" strokeWidth="5" opacity=".4" />
              <g transform={`translate(${x} 1120) skewX(${(dir as number) * -18 * lean})`}>
                <Wisps t={t + i} x={0} y={0} color="#E8EEF0" n={2} h={200 + 60 * lean} width={6} opacity={0.6} />
              </g>
            </g>
          ))}
          {/* il portagioie di legno con il coperchio che si apre */}
          <g transform="translate(540 1230)">
            <Ombra id="no" x={0} y={8} rx={150} ry={16} />
            <path d="M-120 0 V-90 H120 V0 Z" fill="url(#no-box)" stroke={K} strokeWidth="8" />
            <path d="M-100 -20 H100 M-100 -70 H100" stroke="#C8946A" strokeWidth="3" opacity=".5" />
            <rect x="-14" y="-62" width="28" height="22" rx="4" fill="url(#no-brass)" stroke={K} strokeWidth="4" />
            {/* coperchio: una sola forma opaca incernierata dietro; si alza e mostra lo specchietto interno */}
            <path d={`M-126 -90 V${-90 - lerp(40, 130, lid)} Q0 ${-90 - lerp(64, 136, lid)} 126 ${-90 - lerp(40, 130, lid)} V-90 Z`} fill="url(#no-box)" stroke={K} strokeWidth="8" />
            {lid < 0.4 ? (
              <>
                <path d={`M-90 ${-90 - lerp(30, 90, lid)} Q0 ${-90 - lerp(48, 100, lid)} 90 ${-90 - lerp(30, 90, lid)}`} stroke="#E8B860" strokeWidth="5" fill="none" />
                <circle cx="0" cy={-90 - lerp(28, 80, lid)} r="10" fill="url(#no-brass)" stroke={K} strokeWidth="3" />
              </>
            ) : (
              <>
                <rect x="-92" y={-90 - lerp(40, 120, lid)} width="184" height={lerp(30, 96, lid)} rx="6" fill="#A8B8C0" stroke={K} strokeWidth="5" />
                <path d={`M-70 ${-90 - lerp(34, 110, lid)} L-40 ${-90 - lerp(10, 34, lid)}`} stroke="#FFFFFF" strokeWidth="5" opacity=".6" />
              </>
            )}
            {/* interno di velluto e la spilla (visibili solo a coperchio alzato) */}
            {lid >= 0.4 && (
              <>
                <path d="M-108 -90 H108 L100 -78 H-100 Z" fill="url(#no-velvet)" stroke={K} strokeWidth="4" />
                <g transform={`translate(0 ${-96 - 10 * lid})`}>
                  <ellipse cx="0" cy="0" rx="34" ry="24" fill="url(#no-gold)" stroke={K} strokeWidth="5" />
                  <ellipse cx="0" cy="0" rx="18" ry="12" fill="#6A2A5A" stroke={K} strokeWidth="3" />
                  {[0, 60, 120, 180, 240, 300].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 28} cy={Math.sin((a * Math.PI) / 180) * 19} r="4" fill="#F2F0E8" />)}
                  <path d={`M-40 -40 L-28 -28 M40 -40 L28 -28 M0 -52 V-36`} stroke="#FFF6D8" strokeWidth="5" strokeLinecap="round" opacity={glint} />
                </g>
              </>
            )}
          </g>
          <Glow id="no-brooch" x={540} y={1110} r={200} t={t} color="#FFE6A8" amp={0.1} rate={4} opacity={0.75 * lid} />
        </g>

        {/* PIANO 3 — schienali delle sedie in primo piano (1,2) */}
        <g transform={L(1.2)}>
          {[[-80, 1500], [860, 1520]].map(([x, y], i) => (
            <g key={i}>
              <rect x={x} y={y} width="300" height="60" rx="20" fill="url(#no-box)" stroke={K} strokeWidth="9" />
              <path d={`M${x + 16} ${y + 12} H${x + 284}`} stroke="#C8946A" strokeWidth="5" opacity=".6" />
              {[0.15, 0.5, 0.85].map((k) => <rect key={k} x={x + 300 * k - 14} y={y + 60} width="28" height="400" fill="url(#no-box)" stroke={K} strokeWidth="7" />)}
            </g>
          ))}
        </g>

        {/* PIANO 4 — pulviscolo caldo (1,5) e particelle vicine (1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 900, x0: 300, x1: 780 }} bottom={{ y: 1400, x0: 120, x1: 960 }} seed={13} n={18} color="#FFE6B0" boost={0.25 * warm} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="no-near" t={t} color="#F2E2C8" n={5} opacity={0.07} />
        </g>
      </g>
      <rect width="1080" height="1920" fill="#5A3A18" opacity={0.1 * warm} />
      <Finish id="no" tint="#24303A" tintOpacity={0.12 * (1 - 0.6 * warm)} />
    </svg>
  );
};
