import React from 'react';
import { camera, eo, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes, Stars } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { GOLD, K } from './Comuni';

// Il gigante gentile: la cella di John vista attraverso le sbarre. Una branda troppo corta per lui con la coperta che
// pende, un paio di scarpe enormi sul pavimento verde, una finestrella con la luna e, sullo sgabello, una piccola lampada
// sempre accesa. Su «condannato» un fascio freddo illumina le scarpe; su «ha paura del buio» le luci del corridoio si
// spengono e resta solo la lampada dorata; su «le guardie non capiscono» il fascio di una torcia passa sulle sbarre.
// Nessuna persona.
// Piani: muro di fondo e finestra (0,25) · branda e sgabello (0,55) · scarpe e catino (0,8) · sbarre in primo piano (1,2) · pulviscolo (1,6)

export const Coffey: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const spot = eo(seg(t, griglia(cues[0] + 0.6), griglia(cues[0] + 0.6) + 0.8)) * (1 - eo(seg(t, griglia(cues[1]), griglia(cues[1]) + 0.6)));
  const dark = eo(seg(t, griglia(cues[1] + 0.8), griglia(cues[1] + 0.8) + 0.5)); // le luci si spengono
  const torch = seg(t, griglia(cues[2] + 0.2), griglia(cues[2] + 0.2) + 2.6); // la torcia passa
  const tx = -200 + 1500 * torch;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="cf" />
        <Lin id="cf-wall" stops={[[0, '#3A3E34'], [0.55, '#4A4C40'], [1, '#2A2C24']]} />
        <Lin id="cf-floor" stops={[[0, '#3E7A4E'], [1, '#1E3A26']]} />
        <Lin id="cf-night" stops={[[0, '#0A1424'], [1, '#22324A']]} />
        <linearGradient id="cf-torch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E8F0FF" stopOpacity=".5" />
          <stop offset="1" stopColor="#E8F0FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform={cam.transform}>
        {/* il muro di pietra della cella, la finestrella con la luna */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#cf-wall)" />
          {Array.from({ length: 9 }, (_, r) => Array.from({ length: 8 }, (_, c) => (
            <rect key={`${r}-${c}`} x={-180 + c * 190 + (r % 2) * 95} y={520 + r * 90} width="180" height="80" rx="8" fill="none" stroke="#2A2C22" strokeWidth="4" />
          )))}
          <rect x="640" y="560" width="200" height="160" fill="url(#cf-night)" stroke={K} strokeWidth="8" />
          <svg x="640" y="560" width="200" height="160" viewBox="0 0 200 160"><Stars t={t} seed={3} n={10} x={0} y={0} w={200} h={160} /></svg>
          <circle cx="780" cy="610" r="24" fill="#EEF0E0" />
          <Glow id="cf-moon" x={780} y={610} r={140} t={t} color="#DDE6F0" amp={0.05} rate={1} opacity={0.35} />
          {[680, 720, 760, 800].map((x) => <path key={x} d={`M${x} 560 V720`} stroke="#4A4C40" strokeWidth="10" />)}
          <path d="M640 640 H840" stroke="#4A4C40" strokeWidth="10" />
          {/* la luna disegna il riquadro sul muro */}
          <path d="M600 860 L760 860 L820 1040 L640 1040 Z" fill="#DDE6F0" opacity={0.07 * (1 - dark * 0.3)} />
          <rect x="-200" y="1100" width="1480" height="1100" fill="url(#cf-floor)" />
          <path d="M-200 1100 H1280" stroke={K} strokeWidth="8" />
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${-200 + i * 260} 1100 L${-500 + i * 360} 2200`} stroke="#1A3A24" strokeWidth="4" opacity=".6" />)}
        </g>
        {/* la branda troppo corta con la coperta che pende, lo sgabello con la lampada sempre accesa */}
        <g transform={L(0.55, 0, -200)}>
          <rect x="80" y="1090" width="520" height="70" fill="#7A6A50" stroke={K} strokeWidth="8" />
          <path d="M100 1160 V1320 M580 1160 V1320" stroke={K} strokeWidth="16" />
          <path d="M70 1080 Q340 1040 610 1080 L640 1250 Q560 1230 590 1300 L570 1310 Q480 1240 400 1290 Q300 1240 200 1280 L110 1170 Z" fill="#5A6A80" stroke={K} strokeWidth="7" />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M${140 + i * 110} 1070 Q${150 + i * 110} 1170 ${130 + i * 110} 1270`} stroke="#3A4A60" strokeWidth="6" fill="none" />)}
          <path d="M80 1040 Q140 1000 230 1030 Q240 1080 160 1086 Q90 1084 80 1040 Z" fill="#E8E0CC" stroke={K} strokeWidth="6" />
          {/* lo sgabello e la lampada */}
          <path d="M700 1180 H820 M714 1180 L700 1310 M806 1180 L820 1310" stroke="#5A4630" strokeWidth="14" strokeLinecap="round" />
          <g transform="translate(760 1180) scale(1.5)">
            <path d="M-30 0 H30 L22 -20 H-22 Z" fill="#6A5A40" stroke={K} strokeWidth="5" />
            <path d="M-20 -20 Q-28 -70 0 -84 Q28 -70 20 -20 Z" fill="#FFF0C0" stroke={K} strokeWidth="5" opacity=".95" />
            <path d="M0 -26 Q-8 -46 0 -60 Q8 -46 0 -26 Z" fill={GOLD} />
            <path d="M-24 -84 H24 L18 -96 H-18 Z" fill="#6A5A40" stroke={K} strokeWidth="4" />
          </g>
          <Glow id="cf-lamp" x={760} y={1080} r={240 + 220 * dark} t={t} color={GOLD} amp={0.08} rate={2.2} opacity={0.45 + 0.35 * dark} />
        </g>
        {/* le scarpe enormi e il catino di latta */}
        <g transform={L(0.8, 0, -230)}>
          {spot > 0 && <path d="M380 300 L180 1500 H700 Z" fill="#E8F0FF" opacity={0.12 * spot} />}
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${330 + i * 210} ${1450 + i * 18}) rotate(${i ? 6 : -4})`}>
              <path d="M-120 0 Q-130 -60 -70 -70 H40 Q120 -60 130 -10 Q130 20 90 20 H-110 Q-130 20 -120 0 Z" fill="#4A3424" stroke={K} strokeWidth="8" />
              <path d="M-60 -66 Q-20 -30 30 -60" stroke="#2A1E14" strokeWidth="8" fill="none" />
              {[-40, -20, 0, 20].map((x) => <path key={x} d={`M${x} -54 l12 10`} stroke="#C8B8A0" strokeWidth="4" />)}
              <path d="M-110 20 H100" stroke="#1A120C" strokeWidth="10" />
              <path d="M-80 -60 Q20 -76 100 -40" stroke="#8A6A4A" strokeWidth="5" fill="none" opacity=".6" />
            </g>
          ))}
          <g transform="translate(860 1440)">
            <ellipse cx="0" cy="0" rx="90" ry="26" fill="#8A9090" stroke={K} strokeWidth="6" />
            <path d="M-90 0 L-76 70 H76 L90 0" fill="#6A7070" stroke={K} strokeWidth="6" />
            <ellipse cx="0" cy="0" rx="72" ry="16" fill="#3A5060" />
          </g>
        </g>
        {dark > 0 && <rect x="-400" y="-400" width="1880" height="2800" fill="#050805" opacity={0.5 * dark} />}
        {/* la lampada resta l'unica luce: alone sopra il buio */}
        {dark > 0 && <g transform={L(0.55, 0, -200)}><Glow id="cf-lamp2" x={760} y={1080} r={300} t={t} color={GOLD} amp={0.1} rate={2.2} opacity={0.5 * dark} /></g>}
        {/* il fascio della torcia della guardia che passa sulle sbarre */}
        {torch > 0 && torch < 1 && <path d={`M${tx} -200 L${tx - 260} 1900 H${tx + 260} Z`} fill="url(#cf-torch)" opacity={Math.sin(torch * Math.PI)} />}
        {/* le sbarre della cella in primo piano */}
        <g transform={L(1.2)}>
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i}>
              <path d={`M${-80 + i * 175} -200 V2200`} stroke="#3A4038" strokeWidth="34" strokeLinecap="round" />
              <path d={`M${-90 + i * 175} -200 V2200`} stroke="#8A9488" strokeWidth="6" opacity={0.5 + 0.4 * (torch > 0 && torch < 1 ? Math.max(0, 1 - Math.abs(-80 + i * 175 - tx) / 300) : 0)} />
            </g>
          ))}
          {[640, 1660].map((y) => <rect key={y} x="-200" y={y} width="1480" height="34" fill="#3A4038" stroke={K} strokeWidth="5" />)}
          <path d="M-200 1700 H1280 V2200 H-200 Z" fill="#0A0E0A" opacity=".45" />
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 600, x0: 620, x1: 860 }} bottom={{ y: 1300, x0: 560, x1: 960 }} seed={14} n={20} color="#FFE6A8" boost={0.2 + 0.3 * dark} />
          <NearMotes id="cf-near" t={t} color="#DDE6F0" n={5} y0={1200} opacity={0.07} />
        </g>
      </g>
      <Finish id="cf" tint="#1E3A28" tintOpacity={0.12} />
    </svg>
  );
};
