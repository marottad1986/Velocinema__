import React from 'react';
import { camera, eio, eo, seg } from '../../lib/anim';
import { Flyers, Fog, Glow, NearMotes, Reflection } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Candela, K, Ombra, SestoDefs } from './Comuni';

// Un bambino che ha paura: una strada di Filadelfia in autunno, nel pomeriggio grigio. Al centro una vecchia chiesa di
// pietra con il campanile e il rosone; la porta ad arco è rossa (il solo rosso della scena). Ai lati case a schiera di
// mattoni, alberi con le foglie ocra che cadono, un lampione; in primo piano la ringhiera e i gradini di una casa.
// Eventi: 1ª frase una folata stacca le foglie dagli alberi; 2ª frase la porta rossa si socchiude e dentro si vedono le
// candele accese (il rifugio di Cole); 3ª frase la luce delle candele si allarga sui gradini. Nessuna persona.
// Piani: cielo (0,2) · case lontane (0,4) · chiesa (0,6) · alberi e lampione (0,9) · ringhiera e gradini (1,2) · foglie vicine (1,5–1,8)

const Albero: React.FC<{ x: number; y: number; s: number; flip?: boolean; t: number; bare: number }> = ({ x, y, s, flip, t, bare }) => {
  const sw = Math.sin(t * 1.4 + x) * 3;
  const crowns = [[-60, -470, 120], [70, -520, 130], [0, -600, 120], [-120, -560, 90], [140, -430, 100], [10, -440, 110]];
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} strokeLinecap="round" strokeLinejoin="round">
      <path d="M-26 0 Q-14 -200 -30 -380 L30 -380 Q14 -200 26 0 Z" fill="#2A1C14" stroke={K} strokeWidth="9" />
      <path d={`M-10 -330 Q-80 -400 -140 ${-480 + sw} M10 -350 Q90 -420 150 ${-470 + sw} M0 -380 Q10 -480 ${-10 + sw} -600`} stroke="#2A1C14" strokeWidth="20" fill="none" />
      <path d={`M-10 -330 Q-80 -400 -140 ${-480 + sw} M10 -350 Q90 -420 150 ${-470 + sw}`} stroke={K} strokeWidth="4" fill="none" opacity=".6" />
      <g transform={`translate(${sw} 0)`}>
        {crowns.filter((_, i) => i < 6 - Math.floor(bare * 3.2)).map(([cx, cy, r], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} fill={i % 2 ? '#B8782A' : '#9A5E22'} stroke={K} strokeWidth="8" />
            <path d={`M${cx - r * 0.6} ${cy - r * 0.2} Q${cx - r * 0.3} ${cy - r * 0.75} ${cx + r * 0.3} ${cy - r * 0.7}`} stroke="#E8B860" strokeWidth="7" fill="none" opacity=".55" />
          </g>
        ))}
      </g>
    </g>
  );
};

export const Cole: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const gust = seg(t, griglia(cues[0] + 0.4), griglia(cues[0] + 0.4) + 2.5);
  const door = eio(seg(t, griglia(cues[1] + 0.6), griglia(cues[1] + 0.6) + 1.4));
  const warm = eo(seg(t, griglia(cues[2] + 0.2), griglia(cues[2] + 0.2) + 1.6));
  const DX = 452, DY = 1190, DW = 176, DH = 280; // porta della chiesa

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="co" />
        <SestoDefs id="co" />
        <Lin id="co-sky" stops={[[0, '#5A6878'], [0.45, '#8C98A2'], [0.75, '#B8BCB8'], [1, '#C8C4B8']]} />
        <Lin id="co-stone" x2={1} y2={0} stops={[[0, '#9A968A'], [0.5, '#7E7A70'], [1, '#55524A']]} />
        <Lin id="co-stone2" x2={1} y2={0} stops={[[0, '#7A766C'], [1, '#4A4740']]} />
        <Lin id="co-brick" x2={1} y2={0} stops={[[0, '#7A3E2C'], [0.6, '#5E2E22'], [1, '#3E1E16']]} />
        <Lin id="co-street" stops={[[0, '#6A6A66'], [0.5, '#3E3E3C'], [1, '#141414']]} />
        <Lin id="co-iron" x2={1} y2={0} stops={[[0, '#0E1012'], [0.5, '#3A4044'], [1, '#0E1012']]} />
        <Lin id="co-inside" stops={[[0, '#6A3A18'], [0.6, '#C8822E'], [1, '#FFD68A']]} />
        <linearGradient id="co-spill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD68A" stopOpacity=".7" />
          <stop offset="1" stopColor="#FFD68A" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo grigio d'autunno con le nuvole basse (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#co-sky)" />
          {[[200, 700, 260], [760, 640, 300], [480, 820, 340]].map(([x, y, r], i) => (
            <ellipse key={i} cx={x + Math.sin(t * 0.2 + i) * 20} cy={y} rx={r} ry={r * 0.22} fill="#D8D8D0" opacity=".35" />
          ))}
          <Glow id="co-sun" x={820} y={760} r={300} t={t} color="#F2E2C0" amp={0.03} rate={0.6} opacity={0.35} />
        </g>

        {/* PIANO 1 — case a schiera lontane ai lati (0,4) */}
        <g transform={L(0.4)}>
          {[[-160, 900, 240], [60, 860, 180], [880, 880, 220], [1080, 840, 200]].map(([x, y, w], i) => (
            <g key={i}>
              <rect x={x} y={y} width={w} height={1300 - y} fill={i % 2 ? '#5A3A30' : '#6A4436'} />
              <rect x={x - 10} y={y - 18} width={w + 20} height="18" fill="#3A2620" />
              {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
                <rect key={`${r}${c}`} x={x + 24 + c * (w / 3.2)} y={y + 40 + r * 110} width={w / 6} height="60" fill="#2A2A30" opacity=".8" />
              )))}
            </g>
          ))}
          <Fog id="co-fog" t={t} y={1250} rx={900} ry={80} color="#C8C8C0" opacity={0.35} speed={0.2} />
        </g>

        {/* PIANO 2 — la chiesa di pietra con il campanile, il rosone e la porta rossa (0,6) */}
        <g transform={L(0.6, 0, 50)} strokeLinejoin="round">
          <Ombra id="co" x={540} y={1300} rx={420} ry={30} />
          {/* campanile */}
          <path d="M480 780 V690 L540 636 L600 690 V780 Z" fill="url(#co-stone2)" stroke={K} strokeWidth="8" />
          <path d="M540 596 V636 M524 612 H556" stroke={K} strokeWidth="9" strokeLinecap="round" />
          <path d="M520 720 Q540 696 560 720 V766 H520 Z" fill="#1A1A1E" stroke={K} strokeWidth="5" />
          {/* navata con il frontone */}
          <path d="M300 1300 V880 L540 720 L780 880 V1300 Z" fill="url(#co-stone)" stroke={K} strokeWidth="10" />
          {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M300 ${900 + i * 26} H780`} stroke="#000" strokeWidth="2" opacity=".14" />)}
          {Array.from({ length: 30 }, (_, i) => (
            <rect key={`b${i}`} x={310 + ((i * 53) % 460)} y={900 + ((i * 71) % 380)} width="34" height="22" fill="#000" opacity=".06" />
          ))}
          <path d="M306 880 L540 726" stroke="#D8D2C2" strokeWidth="5" opacity=".6" />
          {/* contrafforti */}
          {[290, 760].map((x) => <path key={x} d={`M${x} 1300 V960 L${x + 15} 930 L${x + 30} 960 V1300 Z`} fill="url(#co-stone2)" stroke={K} strokeWidth="7" />)}
          {/* rosone */}
          <circle cx="540" cy="880" r="66" fill="#2A2830" stroke={K} strokeWidth="8" />
          <circle cx="540" cy="880" r="66" fill="#E8B860" opacity={0.15 + 0.35 * warm} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            return <path key={i} d={`M540 880 L${540 + Math.cos(a) * 62} ${880 + Math.sin(a) * 62}`} stroke="#6A6458" strokeWidth="6" />;
          })}
          <circle cx="540" cy="880" r="20" fill="#7A746A" stroke={K} strokeWidth="5" />
          {/* finestre a sesto acuto */}
          {[360, 676].map((x) => (
            <g key={x}>
              <path d={`M${x} 1140 V1010 Q${x + 22} 960 ${x + 44} 1010 V1140 Z`} fill="#22222A" stroke={K} strokeWidth="6" />
              <path d={`M${x} 1140 V1010 Q${x + 22} 960 ${x + 44} 1010 V1140 Z`} fill="#E8B860" opacity={0.2 + 0.3 * warm} />
              <path d={`M${x + 22} 980 V1140 M${x} 1070 H${x + 44}`} stroke="#4A4640" strokeWidth="4" />
            </g>
          ))}
          {/* portale con l'arco e la porta rossa a due battenti */}
          <path d={`M${DX - 36} ${DY} V${DY - DH + 60} Q${DX + DW / 2} ${DY - DH - 110} ${DX + DW + 36} ${DY - DH + 60} V${DY} Z`} fill="url(#co-stone2)" stroke={K} strokeWidth="9" />
          <path d={`M${DX} ${DY} V${DY - DH + 70} Q${DX + DW / 2} ${DY - DH - 60} ${DX + DW} ${DY - DH + 70} V${DY} Z`} fill="url(#co-inside)" stroke={K} strokeWidth="7" />
          {/* dentro: le candele accese e le panche in fondo */}
          <g opacity={door}>
            <Glow id="co-in" x={DX + DW / 2} y={DY - 100} r={200} t={t} color="#FFD68A" amp={0.08} rate={7} opacity={0.8} />
            {[DX + 50, DX + 88, DX + 126].map((x, i) => <Candela key={i} id="co" x={x} y={DY - 60} t={t} h={60 + (i % 2) * 24} s={0.7} ph={i * 1.7} />)}
            <path d={`M${DX + 20} ${DY - 40} H${DX + DW - 20} M${DX + 20} ${DY - 20} H${DX + DW - 20}`} stroke="#3A2010" strokeWidth="8" />
          </g>
          {/* battenti rossi: si aprono verso l'interno (si stringono) */}
          {[0, 1].map((side) => {
            const w = (DW / 2) * (1 - door * (side ? 0.85 : 0.3));
            const x0 = side ? DX + DW - w : DX;
            return (
              <g key={side}>
                <path d={side
                  ? `M${x0} ${DY} V${DY - DH + 70 - (1 - w / (DW / 2)) * 40} Q${x0 + w * 0.5} ${DY - DH + 6} ${x0 + w} ${DY - DH + 70} V${DY} Z`
                  : `M${x0} ${DY} V${DY - DH + 70} Q${x0 + w * 0.5} ${DY - DH + 6} ${x0 + w} ${DY - DH - 4 + (1 - w / (DW / 2)) * 40} V${DY} Z`}
                  fill="url(#co-redcloth)" stroke={K} strokeWidth="7" />
                {[0.3, 0.68].map((k) => <rect key={k} x={x0 + w * 0.18} y={DY - DH * k - 40} width={w * 0.64} height="70" fill="none" stroke="#5A0E0C" strokeWidth="5" />)}
                {[0.25, 0.75].map((k) => <path key={k} d={`M${x0 + (side ? w : 0)} ${DY - DH * k} h${side ? -w * 0.5 : w * 0.5}`} stroke="#14100C" strokeWidth="7" strokeLinecap="round" />)}
                <circle cx={side ? x0 + 12 : x0 + w - 12} cy={DY - 120} r="7" fill="url(#co-brass)" stroke={K} strokeWidth="3" />
              </g>
            );
          })}
          <Glow id="co-red" x={DX + DW / 2} y={DY - 140} r={170} t={t} color="#E04A3A" amp={0.06} rate={2} opacity={0.3} />
          {/* gradini */}
          {[0, 1, 2].map((i) => <rect key={i} x={DX - 60 - i * 26} y={DY + i * 14} width={DW + 120 + i * 52} height="16" fill="#8A867C" stroke={K} strokeWidth="5" />)}
          <path d={`M${DX} ${DY + 40} H${DX + DW} L${DX + DW + 200} 1500 H${DX - 200} Z`} fill="url(#co-spill)" opacity={door * (0.35 + 0.65 * warm)} />
        </g>

        {/* PIANO 3 — strada, alberi d'autunno e lampione (0,9) */}
        <g transform={L(0.9)}>
          <path d="M-200 1300 H1280 V2200 H-200 Z" fill="url(#co-street)" />
          <path d="M-200 1340 H1280" stroke="#8A8A84" strokeWidth="12" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-100 + i * 180} 1420 h90`} stroke="#C8C4A8" strokeWidth="8" opacity=".35" />)}
          {/* asfalto bagnato: riflessi della porta rossa e del lampione */}
          <Reflection t={t} x={540} y={1470} color="#C8443A" n={8} w={110} gap={28} opacity={0.45} />
          <Reflection t={t} x={860} y={1480} color="#F2E2B0" n={7} w={50} gap={26} opacity={0.4} />
          <Reflection t={t} x={540} y={1690} color="#FFD68A" n={5} w={90} gap={28} opacity={0.35 * door} />
          {/* foglie a terra */}
          {Array.from({ length: 26 }, (_, i) => (
            <ellipse key={i} cx={(i * 97) % 1200 - 60} cy={1330 + ((i * 37) % 90)} rx="16" ry="8" fill={i % 3 ? '#9A5E22' : '#C88A34'} transform={`rotate(${i * 33} ${(i * 97) % 1200 - 60} ${1330 + ((i * 37) % 90)})`} />
          ))}
          <Albero x={80} y={1360} s={1.05} t={t} bare={gust} />
          <Albero x={1010} y={1350} s={0.95} flip t={t} bare={gust} />
          {/* lampione */}
          <g transform="translate(860 1340)">
            <Ombra id="co" x={0} y={4} rx={50} ry={8} />
            <rect x="-8" y="-480" width="16" height="480" fill="url(#co-iron)" stroke={K} strokeWidth="5" />
            <path d="M-34 -480 H34 L22 -560 H-22 Z" fill="#2A3034" stroke={K} strokeWidth="6" />
            <path d="M-24 -490 H24 L16 -550 H-16 Z" fill="#F2E2B0" opacity=".55" />
            <path d="M-30 -560 L0 -590 L30 -560 Z" fill="#14181A" stroke={K} strokeWidth="5" />
          </g>
        </g>

        {/* PIANO 4 — ringhiera e gradini di casa in primo piano (1,2) */}
        <g transform={L(1.2)}>
          {[0, 1, 2, 3].map((i) => <rect key={i} x={-200} y={1560 + i * 90} width={440 - i * 40} height="96" fill={i % 2 ? '#6A4436' : '#7A4E3C'} stroke={K} strokeWidth="8" />)}
          <path d="M-200 1520 L300 1520" stroke={K} strokeWidth="18" strokeLinecap="round" />
          <path d="M-200 1520 L300 1520" stroke="url(#co-iron)" strokeWidth="10" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${-140 + i * 80} 1520 V1980`} stroke={K} strokeWidth="12" />)}
          <circle cx="300" cy="1520" r="22" fill="#2A3034" stroke={K} strokeWidth="7" />
          <path d="M300 1520 V1980" stroke={K} strokeWidth="24" />
        </g>

        {/* PIANO 5 — foglie portate dal vento (1,5) e particelle vicine (1,8) */}
        <g transform={L(1.5)}>
          <Flyers t={t} seed={12} n={5 + Math.round(6 * Math.min(1, gust * 3))} color="#B8782A" outline={K} w={30} h={42} y0={700} y1={1800} speed={0.1 + 0.08 * gust} shape="leaf" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="co-near" t={t} color="#E8DCC8" n={5} opacity={0.08} />
        </g>
      </g>
      <Finish id="co" tint="#3A4450" tintOpacity={0.12} />
    </svg>
  );
};

