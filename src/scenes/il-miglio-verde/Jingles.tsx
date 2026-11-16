import React from 'react';
import { camera, eo, seg } from '../../lib/anim';
import { Dust, Flyers, Glow, NearMotes, SunRays } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { GOLD, K, Mouse, Spool } from './Comuni';

// Il prezzo del miracolo: oggi, il nascondiglio del topolino in una stanzetta di legno all'alba, con la finestra sul bosco.
// Su «John viene giustiziato» la stanza è ancora nel buio e una piccola candela si spegne; su «il topolino è vivo da più di
// sessant'anni» entra la luce dell'alba e nella scatola di sigari il topolino, bianco di vecchiaia, alza la testa accanto
// al suo rocchetto; su «la pena per aver lasciato morire un miracolo» la luce si fa dorata e il pulviscolo sale piano.
// Nessuna persona.
// Piani: parete di assi e finestra sul bosco (0,25) · mensola (0,6) · scatola con il topolino (0,8) · tavolo con la candela (1,1) · polvere (1,6)

export const Jingles: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const out = seg(t, griglia(cues[0] + 1.6), griglia(cues[0] + 1.6) + 0.5); // la candela si spegne
  const dawn = eo(seg(t, griglia(cues[1]), griglia(cues[1]) + 2));
  const wake = eo(seg(t, griglia(cues[1] + 0.8), griglia(cues[1] + 0.8) + 0.8));
  const gold = eo(seg(t, griglia(cues[2] + 0.5), griglia(cues[2] + 0.5) + 2.5));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="jg" />
        <Lin id="jg-wood" stops={[[0, '#3A2A1C'], [0.6, '#4E3826'], [1, '#2A1E14']]} />
        <Lin id="jg-forest" stops={[[0, '#9AC8A0'], [0.5, '#4E8A5E'], [1, '#1E3A26']]} />
        <Lin id="jg-box" x2={1} y2={0} stops={[[0, '#9A5A2E'], [1, '#6A3A1C']]} />
      </defs>
      <g transform={cam.transform}>
        {/* la parete di assi e la finestra sul bosco all'alba */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#jg-wood)" />
          {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${-180 + i * 110} -200 V2200`} stroke="#22180F" strokeWidth="5" />)}
          {Array.from({ length: 20 }, (_, i) => <circle key={i} cx={-130 + (i % 7) * 220} cy={620 + Math.floor(i / 7) * 260} r="5" fill="#1A120A" />)}
          <g>
            <rect x="560" y="560" width="400" height="420" fill="url(#jg-forest)" />
            <rect x="560" y="560" width="400" height="420" fill="#1A2A20" opacity={0.75 * (1 - dawn)} />
            {[[620, 760], [720, 700], [860, 740], [940, 790]].map(([x, y], i) => (
              <g key={i}>
                <path d={`M${x} 980 V${y + 40}`} stroke="#1E3A26" strokeWidth="14" />
                <path d={`M${x - 50} ${y + 80} L${x} ${y - 60} L${x + 50} ${y + 80} Z`} fill="#2A5A3A" />
              </g>
            ))}
            <circle cx="900" cy="640" r="36" fill="#FFF0C0" opacity={dawn} />
            <SunRays id="jg-rays" x={900} y={640} t={t} color="#FFE8B0" n={8} length={700} opacity={0.22 * dawn + 0.15 * gold} />
            <path d="M560 560 H960 V980 H560 Z M760 560 V980 M560 770 H960" fill="none" stroke="#6A4A2E" strokeWidth="18" />
            <path d="M550 990 H970" stroke="#6A4A2E" strokeWidth="24" />
          </g>
          {/* la lama di luce dell'alba che entra e cade sulla mensola */}
          <path d="M560 980 L960 980 L620 1240 L200 1240 Z" fill="#FFE8B0" opacity={0.18 * dawn + 0.12 * gold} />
          {/* un vecchio berretto da guardia appeso al chiodo, ricordo del miglio verde */}
          <g transform="translate(240 660)">
            <path d="M0 -40 V-10" stroke="#8A8A7A" strokeWidth="6" />
            <path d="M-70 40 Q-70 -14 0 -18 Q70 -14 70 40 Z" fill="#2E3A48" stroke={K} strokeWidth="6" />
            <path d="M-76 40 H76 Q50 66 -54 58 Z" fill="#1A1E24" stroke={K} strokeWidth="6" />
            <rect x="-14" y="-2" width="28" height="18" rx="4" fill="#A88A4A" stroke={K} strokeWidth="3" />
          </g>
        </g>
        {/* la mensola */}
        <g transform={L(0.6)}>
          <rect x="120" y="1180" width="860" height="34" fill="#7A5634" stroke={K} strokeWidth="8" />
          <path d="M200 1214 L240 1290 M900 1214 L860 1290" stroke={K} strokeWidth="12" />
          <path d="M130 1186 H970" stroke="#B88A5A" strokeWidth="4" opacity=".5" />
          {/* barattoli e un libro */}
          <rect x="160" y="1080" width="70" height="100" rx="8" fill="#5A7A6A" stroke={K} strokeWidth="5" opacity=".9" />
          <rect x="250" y="1050" width="40" height="130" fill="#8A3A2A" stroke={K} strokeWidth="5" />
          <rect x="294" y="1066" width="34" height="114" fill="#3A5A7A" stroke={K} strokeWidth="5" />
        </g>
        {/* la scatola di sigari foderata, con il topolino vecchio e il rocchetto */}
        <g transform={L(0.8)}>
          <Glow id="jg-box" x={600} y={1120} r={300} t={t} color={GOLD} amp={0.08} rate={2} opacity={0.08 + 0.14 * dawn + 0.14 * gold} />
          <path d="M400 1180 V1080 H800 V1180 Z" fill="url(#jg-box)" stroke={K} strokeWidth="8" />
          <path d="M400 1080 L380 960 H780 L800 1080" fill="#B87A44" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          <rect x="460" y="990" width="180" height="50" fill="#E8C878" stroke={K} strokeWidth="4" />
          <path d="M480 1015 H620" stroke="#8A5A2A" strokeWidth="6" />
          <path d="M412 1080 Q600 1050 788 1080 V1100 H412 Z" fill="#A83A3A" stroke={K} strokeWidth="5" />
          <g transform={`translate(560 ${1086 - 10 * wake}) rotate(${-8 * wake})`}>
            <Mouse x={0} y={0} s={1.2} t={t} age={1} sleep={wake < 0.5} />
          </g>
          <Spool x={730} y={1140} s={1.0} roll={wake * 40} />
        </g>
        {/* il tavolo in primo piano con la candela che si spegne */}
        <g transform={L(1.1)}>
          <rect x="-200" y="1360" width="1480" height="60" fill="#5A3E26" stroke={K} strokeWidth="9" />
          <path d="M-200 1420 H1280 V2200 H-200 Z" fill="#20160E" />
          <g transform="translate(900 1180) scale(0.8)">
            <ellipse cx="0" cy="0" rx="70" ry="16" fill="#8A8A7A" stroke={K} strokeWidth="5" />
            <rect x="-22" y="-120" width="44" height="120" fill="#E8DCC0" stroke={K} strokeWidth="5" />
            <path d="M-22 -110 q10 20 0 40" stroke="#C8B898" strokeWidth="5" fill="none" />
            {out < 1 && (
              <g opacity={1 - out}>
                <path d="M0 -124 Q-14 -150 0 -180 Q14 -150 0 -124 Z" fill="#FFC86A" />
                <path d="M0 -128 Q-6 -144 0 -158 Q6 -144 0 -128 Z" fill="#FFF0C0" />
                <Glow id="jg-candle" x={0} y={-150} r={200} t={t} color="#FFB85A" amp={0.12} rate={8} opacity={0.6} />
              </g>
            )}
            {out > 0 && <path d={`M0 -124 q${10 + 10 * Math.sin(t * 3)} -40 ${-4} ${-80 - 60 * out} q-14 -30 6 -70`} stroke="#B8B0A0" strokeWidth="5" fill="none" opacity={(1 - out * 0.4) * (1 - seg(t, griglia(cues[0] + 1.6) + 2, griglia(cues[0] + 1.6) + 4))} />}
          </g>
          {/* un paio di occhiali da lettura e una vecchia lettera */}
          <g transform="translate(860 1352)" stroke={K} strokeWidth="4" fill="#C8E0F0" fillOpacity=".3">
            <circle cx="-22" r="16" /><circle cx="22" r="16" /><path d="M-6 0 H6 M-38 0 L-56 -8 M38 0 L56 -8" fill="none" />
          </g>
          <path d="M-200 1700 H1280 V2200 H-200 Z" fill="#0A0806" opacity=".5" />
        </g>
        <g transform={L(1.6)}>
          <Flyers t={t} seed={76} n={3} color="#8A6A3A" outline={K} w={18} h={24} y0={600} y1={1200} speed={0.04} shape="leaf" />
          <Dust t={t} top={{ y: 980, x0: 560, x1: 960 }} bottom={{ y: 1240, x0: 200, x1: 620 }} seed={81} n={30} color="#FFE8B0" boost={0.2 * dawn + 0.5 * gold} />
          <NearMotes id="jg-near" t={t} color="#FFE8B0" n={5} y0={1200} opacity={0.07} />
        </g>
      </g>
      <rect width="1080" height="1920" fill="#060806" opacity={0.35 * (1 - dawn)} />
      <Finish id="jg" tint="#1E3A28" tintOpacity={0.1} />
    </svg>
  );
};
