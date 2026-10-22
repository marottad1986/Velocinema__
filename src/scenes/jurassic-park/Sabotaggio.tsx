import React from 'react';
import { camera, eo, mod, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, GlassDrops, NearMotes, Rain, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K } from './Comuni';

// Il sabotaggio: sala di controllo di notte; monitor con la mappa del parco, luci delle recinzioni che passano dal verde
// al rosso, una tastiera, una bomboletta da barba senza marchio con il fondo che si svita; pioggia sui vetri.
// Piani: vetrata con la tempesta (0,25) · parete di monitor (0,45) · mappa del parco (0,6) · scrivania e bomboletta (0,85) · sedia in primo piano (1,25) · riflessi (1,6)

const ZONES = [[380, 700], [470, 650], [560, 720], [650, 660], [720, 760], [460, 790], [600, 800]];

export const Sabotaggio: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const off = (i: number) => seg(t, cues[2] + i * 0.12, cues[2] + i * 0.12 + 0.15); // «spegne la sicurezza»: le zone diventano rosse
  const alarm = seg(t, cues[2], cues[2] + 0.3) * (mod(t, 0.8) < 0.4 ? 1 : 0.4);
  const can = eo(seg(t, cues[3], cues[3] + 0.8)); // il fondo della bomboletta si svita: dentro, le provette
  const gone = eo(seg(t, cues[3] + 1.4, cues[3] + 2.2)); // la bomboletta sparisce: scappa
  const fence = seg(t, cues[4], cues[4] + 0.6); // «le recinzioni si spengono»: la scritta sul monitor
  const flash = flashAt(t, [1.2]);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sb" />
        <Lin id="sb-night" stops={[[0, '#05090C'], [0.6, '#0E1A1C'], [1, '#14262A']]} />
        <Lin id="sb-wall" stops={[[0, '#0A110F'], [1, '#121E1A']]} />
        <Lin id="sb-desk" stops={[[0, '#3A4440'], [1, '#121815']]} />
        <Lin id="sb-can" x2={1} y2={0} stops={[[0, '#9AA4A8'], [0.45, '#E8EEF0'], [1, '#7A8488']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — vetrata sulla tempesta */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#sb-wall)" />
          <rect x="-120" y="520" width="1320" height="200" fill="url(#sb-night)" />
          <rect x="-120" y="520" width="1320" height="200" fill="#CFE2E8" opacity={flash * 0.4} />
          <Rain t={t} level="far" seed={6} color="#7FA0A8" opacity={0.45} angle={18} x={-120} y={520} w={1320} h={200} />
          <GlassDrops t={t} x={-100} y={530} w={1280} h={180} seed={3} n={14} color="#9FC0C8" />
          {[-120, 220, 560, 900].map((x) => <path key={x} d={`M${x} 520 V720`} stroke="#05090C" strokeWidth="12" />)}
        </g>

        {/* PIANO 1 — parete di monitor */}
        <g transform={L(0.45)}>
          {[[60, 760], [800, 760]].map(([x, y], i) => (
            <g key={i}>
              <rect x={x} y={y} width="220" height="160" rx="10" fill="#0C2620" stroke={K} strokeWidth="8" />
              {Array.from({ length: 6 }, (_, k) => <rect key={k} x={x + 16} y={y + 16 + k * 22} width={60 + ((k * 37 + i * 20) % 120)} height="10" fill={k % 3 === 0 && off(0) > 0 ? '#E8503A' : '#8EF0C0'} opacity=".8" />)}
              <Glow id={`sb-m${i}`} x={x + 110} y={y + 80} r={160} t={t} color={off(0) > 0 ? '#E8503A' : '#5FE0A0'} amp={0.06} rate={3} opacity={0.3} />
            </g>
          ))}
        </g>

        {/* PIANO 2 — grande monitor con la mappa del parco: le zone diventano rosse */}
        <g transform={L(0.6)}>
          <rect x="300" y="600" width="480" height="300" rx="14" fill="#0A2018" stroke={K} strokeWidth="10" />
          <path d="M340 860 Q360 640 520 630 Q700 620 750 760 Q740 870 600 880 Z" fill="#14402C" stroke="#5FA672" strokeWidth="4" />
          {ZONES.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="16" fill={off(i) > 0.5 ? '#E8503A' : '#7CFF8A'} opacity={off(i) > 0.5 ? 0.6 + 0.4 * alarm : 0.9} />
              <circle cx={x} cy={y} r="26" fill="none" stroke={off(i) > 0.5 ? '#E8503A' : '#7CFF8A'} strokeWidth="3" opacity=".5" />
            </g>
          ))}
          <Glow id="sb-map" x={540} y={750} r={340} t={t} color={off(3) > 0.5 ? '#E8503A' : '#5FE0A0'} amp={0.08} rate={4} opacity={0.3 + 0.2 * alarm} />
          <g opacity={fence}>
            <rect x="350" y="840" width="380" height="44" rx="6" fill="#E8503A" />
            <text x="540" y="872" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="28" fill="#FFF">RECINZIONI SPENTE</text>
          </g>
        </g>

        {/* PIANO 3 — scrivania con tastiera e la bomboletta (accento sulle provette) */}
        <g transform={L(0.85)}>
          <path d="M-200 1060 H1280 V2200 H-200 Z" fill="url(#sb-desk)" stroke={K} strokeWidth="8" />
          <path d="M-200 1066 H1280" stroke="#7A8A84" strokeWidth="4" opacity=".6" />
          <g transform="translate(330 1130)">
            <path d="M-200 0 L-170 -60 H170 L200 0 Z" fill="#2A322E" stroke={K} strokeWidth="6" />
            {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-170 + (i % 10) * 34} y={-52 + Math.floor(i / 10) * 17} width="28" height="13" rx="3" fill="#5A6460" />)}
          </g>
          {/* lattine e caffè sparsi */}
          <g transform="translate(560 1110)">
            <rect x="-26" y="-50" width="52" height="70" rx="8" fill="#C2301E" stroke={K} strokeWidth="5" />
            <path d="M-20 -30 H20" stroke="#F4EBD0" strokeWidth="5" />
          </g>
          <g transform={`translate(${800 + 300 * gone} 1120)`} opacity={1 - gone}>
            <Glow id="sb-cang" x={0} y={-60} r={180} t={t} color="#FFD58A" amp={0.08} rate={2} opacity={0.4 * can} />
            {/* corpo della bomboletta, generico */}
            <rect x="-44" y="-200" width="88" height="200" rx="16" fill="url(#sb-can)" stroke={K} strokeWidth="7" />
            <path d="M-30 -200 Q0 -240 30 -200" fill="#C9D2D6" stroke={K} strokeWidth="6" />
            <rect x="-10" y="-246" width="20" height="18" rx="4" fill="#E8EEF0" stroke={K} strokeWidth="4" />
            <rect x="-44" y="-140" width="88" height="40" fill="#2E7D4F" />
            {/* il fondo svitato con le provette dentro */}
            <g transform={`translate(${-130 * can} ${40 * can}) rotate(${-30 * can})`}>
              <rect x="-44" y="-30" width="88" height="34" rx="10" fill="url(#sb-can)" stroke={K} strokeWidth="6" />
            </g>
            {can > 0.3 && [-24, 0, 24].map((x) => (
              <g key={x} opacity={can}>
                <rect x={x - 8} y={-28} width="16" height="70" rx="8" fill="#DDEDE6" stroke={K} strokeWidth="4" />
                <rect x={x - 6} y={-4} width="12" height="40" rx="6" fill={P.accento} />
              </g>
            ))}
          </g>
        </g>

        {/* PIANO 4 — schienale della sedia vuota e cavi in primo piano */}
        <g transform={L(1.25)}>
          <path d="M-60 1940 V1560 Q-60 1480 40 1470 H300 Q380 1480 380 1560 V1940 Z" fill="#1A2420" stroke={K} strokeWidth="10" />
          <path d="M-20 1560 Q120 1520 340 1560" fill="none" stroke="#3A4A44" strokeWidth="8" />
          <path d="M720 1940 Q760 1700 940 1720 Q1120 1740 1180 1600" fill="none" stroke={K} strokeWidth="22" />
          <path d="M720 1940 Q760 1700 940 1720 Q1120 1740 1180 1600" fill="none" stroke="#2E3A34" strokeWidth="12" />
        </g>
        <g transform={L(1.6)}><NearMotes id="sb-near" t={t} color={alarm > 0 ? '#FF8A70' : '#8EF0C0'} n={5} y0={1300} opacity={0.08} /></g>
      </g>
      <rect width="1080" height="1920" fill="#E8503A" opacity={alarm * 0.06} />
      <Finish id="sb" tint="#0F1F17" tintOpacity={0.12} />
    </svg>
  );
};
