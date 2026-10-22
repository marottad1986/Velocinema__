import React from 'react';
import { camera, eo, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Dust, Glow, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K } from './Comuni';

// Il ragazzo nel sottoscala: lo sgabuzzino sotto le scale visto dalla porticina aperta; un lettino stretto, una lampadina
// che pende, ragnatele e un ragno, soldatini e gli occhiali tondi rotti tenuti col nastro; sopra, i gradini.
// Piani: corridoio fuori (0,25) · interno dello sgabuzzino (0,5) · lettino e oggetti (0,7) · lampadina (0,85) · porticina in primo piano (1,2) · pulviscolo (1,6)

export const Sottoscala: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const swing = Math.sin(t * 1.1) * 8; // la lampadina oscilla
  const spider = eo(seg(t, cues[2], cues[2] + 1.6)); // il ragno scende su «sgabuzzino sotto le scale»
  const photo = seg(t, cues[3], cues[3] + 1.0); // una cornice vuota: non sa niente dei genitori
  const steps = Math.max(0, Math.sin(t * 7)) * seg(t, cues[1], cues[1] + 0.3) * (1 - seg(t, cues[1] + 1.4, cues[1] + 1.8)); // passi sulle scale

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ss" />
        <Lin id="ss-hall" stops={[[0, '#C9B48A'], [1, '#8A7656']]} />
        <Lin id="ss-in" stops={[[0, '#2A2218'], [0.5, '#3A3022'], [1, '#1A140E']]} />
        <Lin id="ss-floor" stops={[[0, '#5A4630'], [1, '#2A2014']]} />
      </defs>
      <g transform={cam.transform}>
        {/* corridoio della casa fuori dallo sgabuzzino, con carta da parati ordinata */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ss-hall)" />
          {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${-200 + i * 100} -200 V2200`} stroke="#B8A27A" strokeWidth="18" opacity=".5" />)}
        </g>
        {/* l'interno sotto la scala: soffitto inclinato dei gradini */}
        <g transform={L(0.5)}>
          <path d="M140 1280 V720 L940 500 V1280 Z" fill="url(#ss-in)" stroke={K} strokeWidth="10" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${140 + i * 100} ${720 - i * 27.5} v${30 + steps * 6 * (i % 2)}`} stroke="#5A4A34" strokeWidth="8" />)}
          <path d="M140 720 L940 500" stroke="#6A5A40" strokeWidth="12" />
          {/* ragnatele */}
          <path d="M140 720 Q200 760 180 820 M140 720 Q210 740 260 720 M140 760 Q190 770 220 730" fill="none" stroke="#D8D0C0" strokeWidth="3" opacity=".6" />
          <path d={`M720 ${560} V${600 + 180 * spider}`} stroke="#D8D0C0" strokeWidth="2" opacity=".8" />
          <g transform={`translate(720 ${600 + 180 * spider})`}>
            <circle r="10" fill={K} />
            {[-1, 1].map((d) => [0, 1, 2].map((k) => <path key={`${d}${k}`} d={`M0 0 q${d * 14} ${-10 + k * 8} ${d * 22} ${-2 + k * 10}`} stroke={K} strokeWidth="3" fill="none" />))}
          </g>
          {/* cornice vuota appesa: niente foto dei genitori */}
          <g transform="translate(820 760)">
            <rect x="-60" y="-70" width="120" height="140" fill="#2A2018" stroke="#8A6A3A" strokeWidth="12" />
            <rect x="-44" y="-54" width="88" height="108" fill="#3A3226" />
            <path d="M-30 -30 Q0 -50 30 -30" stroke="#6A5A44" strokeWidth="4" fill="none" opacity={photo} />
            <text x="0" y="12" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="44" fill="#6A5A44" opacity={photo}>?</text>
          </g>
        </g>
        {/* lettino stretto, soldatini, occhiali rotti col nastro (accento sul nastro) */}
        <g transform={L(0.7)}>
          <path d="M140 1280 H940 V1400 H140 Z" fill="url(#ss-floor)" />
          <rect x="200" y="1120" width="520" height="90" rx="10" fill="#8A3A30" stroke={K} strokeWidth="8" />
          <rect x="200" y="1100" width="150" height="50" rx="20" fill="#E8DCC0" stroke={K} strokeWidth="6" />
          <path d="M200 1210 V1280 M720 1210 V1280" stroke={K} strokeWidth="14" />
          <path d="M360 1130 Q500 1150 700 1126" stroke="#B85A48" strokeWidth="6" fill="none" />
          {[780, 820, 860].map((x, i) => (
            <g key={x} transform={`translate(${x} 1250)`}>
              <rect x="-8" y="-40" width="16" height="30" fill="#2E4A7A" stroke={K} strokeWidth="3" />
              <circle cy="-48" r="8" fill="#E8C8A0" stroke={K} strokeWidth="3" />
              <rect x="-10" y="-62" width="20" height="10" fill="#1A1A1A" />
              <path d="M-6 -10 V10 M6 -10 V10" stroke={K} strokeWidth="5" />
            </g>
          ))}
          <g transform="translate(470 1080)">
            <Glow id="ss-glass" x={0} y={0} r={110} t={t} color="#FFE2A0" amp={0.06} rate={2} opacity={0.4} />
            <circle cx="-40" cy="0" r="30" fill="#CFE2EA" fillOpacity=".4" stroke={K} strokeWidth="7" />
            <circle cx="40" cy="0" r="30" fill="#CFE2EA" fillOpacity=".4" stroke={K} strokeWidth="7" />
            <path d="M-10 0 H10" stroke={K} strokeWidth="7" />
            <rect x="-14" y="-10" width="28" height="20" fill={P.accento} stroke={K} strokeWidth="3" transform="rotate(-10)" />
            <path d="M-70 -4 L-110 -16 M70 -4 L110 -16" stroke={K} strokeWidth="6" />
            <path d="M28 -10 L48 14" stroke="#FFFFFF" strokeWidth="3" />
          </g>
        </g>
        {/* lampadina che pende */}
        <g transform={L(0.85)}>
          <g transform={`rotate(${swing} 540 600)`}>
            <path d="M540 600 V820" stroke={K} strokeWidth="5" />
            <Beam id="ss-bulbbeam" x={540} y={850} t={t} length={560} spread={460} color="#FFD27A" angle={90} opacity={0.3} />
            <Glow id="ss-bulb" x={540} y={850} r={220} t={t} color="#FFD27A" amp={0.08} rate={3} opacity={0.65} />
            <circle cx="540" cy="850" r="26" fill="#FFF4C8" stroke={K} strokeWidth="5" />
            <rect x="528" y="814" width="24" height="16" fill="#8A8A80" stroke={K} strokeWidth="3" />
          </g>
        </g>
        {/* porticina aperta con la grata, in primo piano */}
        <g transform={L(1.2)}>
          <path d="M-200 -200 H140 V1400 H-200 Z M940 -200 H1280 V1400 H940 Z M-200 1400 H1280 V2200 H-200 Z" fill="url(#ss-hall)" stroke={K} strokeWidth="10" />
          <path d="M-200 1400 H1280" stroke="#6A5A40" strokeWidth="16" />
          <g transform="translate(940 0)">
            <path d="M0 640 L240 600 V1460 L0 1400 Z" fill="#A8885A" stroke={K} strokeWidth="9" />
            {[0, 1, 2, 3].map((i) => <path key={i} d={`M60 ${700 + i * 26} H180`} stroke={K} strokeWidth="8" />)}
            <circle cx="40" cy="1040" r="12" fill="#C9A24A" stroke={K} strokeWidth="4" />
          </g>
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 860, x0: 480, x1: 600 }} bottom={{ y: 1280, x0: 260, x1: 820 }} seed={3} n={24} color="#FFE2A0" />
          <NearMotes id="ss-near" t={t} color="#FFE2A0" n={5} y0={1300} opacity={0.08} />
        </g>
      </g>
      <Finish id="ss" tint="#3A2A18" tintOpacity={0.1} />
    </svg>
  );
};
