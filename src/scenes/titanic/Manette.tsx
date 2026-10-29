import React from 'react';
import { camera, eo, rng, seg } from '../../lib/anim';
import { Drips, Glow, NearMotes, WaveBand } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Diamond, K } from './Comuni';

// Ammanettato sotto coperta: su «gli fa infilare il diamante in tasca» un cappotto appeso con il diamante che luccica in
// tasca (accento); poi un ufficio sotto coperta con tubi e una panca, un paio di manette agganciate al tubo; l'acqua sale
// dal pavimento (su «mentre l'acqua sale») e le luci tremolano; su «Rose lo libera con un'ascia» l'ascia antincendio
// esce dalla teca e la catena delle manette si spezza con scintille. Nessuna persona.
// Piani: parete e oblò (0,3) · tubi e cappotto (0,55) · manette (0,8) · acqua (0,95) · ascia (1,15) · gocce (1,6)

const r = rng(77);
const SPARK = Array.from({ length: 14 }, () => ({ a: r() * Math.PI * 2, v: 60 + r() * 160 }));

export const Manette: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const pocket = eo(seg(t, cues[0] + 1, cues[0] + 2)); // il diamante nella tasca
  const water = eo(seg(t, cues[1], dur)); // l'acqua sale
  const flicker = water > 0.3 && Math.sin(t * 13) > 0.6 ? 0.5 : 1;
  const axe = seg(t, cues[2] + 0.3, cues[2] + 0.8); // l'ascia cala
  const snap = seg(t, cues[2] + 0.8, cues[2] + 1.6); // la catena si spezza

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="mn" />
        <Lin id="mn-wall" stops={[[0, '#3A4448'], [0.6, '#5A6466'], [1, '#2A3032']]} />
        <Lin id="mn-water" stops={[[0, '#3A6A7A', 0.85], [1, '#0A1A22', 0.95]]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#mn-wall)" />
          {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={-120 + i * 120} cy={560} r="6" fill="#2A3032" />)}
          <circle cx="820" cy="720" r="70" fill="#0A1A22" stroke="#8A9094" strokeWidth="12" />
          <circle cx="820" cy="720" r="58" fill="#1A3A4A" opacity={0.6 + 0.4 * water} />
          <Glow id="mn-bulb" x={640} y={660} r={500} t={t} color="#FFE2A0" amp={0.06} rate={3} opacity={0.45 * flicker} />
          <path d="M640 560 V644" stroke="#3A3A3A" strokeWidth="4" />
          <circle cx="640" cy="660" r="16" fill="#FFF0C0" opacity={flicker} />
        </g>
        {/* tubi e il cappotto appeso col diamante in tasca */}
        <g transform={L(0.55)}>
          <path d="M-200 820 H1280 M-200 870 H1280" stroke="#6A5A4A" strokeWidth="26" />
          <path d="M-200 820 H1280 M-200 870 H1280" stroke="#8A7458" strokeWidth="10" />
          <path d="M140 820 V1500" stroke="#6A5A4A" strokeWidth="30" />
          <g transform="translate(860 900)">
            <path d="M0 -34 V10 M-14 -34 H14" stroke={K} strokeWidth="7" /> {/* gancio sul tubo */}
            <path d="M-80 20 Q0 -10 80 20 L110 330 H-110 Z" fill="#1E2430" stroke={K} strokeWidth="7" />
            <path d="M0 20 V330" stroke={K} strokeWidth="4" />
            <rect x="20" y="180" width="70" height="50" fill="#141820" stroke={K} strokeWidth="4" />
            <g opacity={pocket}><Diamond x={55} y={175} s={0.32} t={t} chain={false} /></g>
            <Glow id="mn-dia" x={55} y={180} r={120} t={t} color={P.accento} amp={0.15} rate={4} opacity={0.5 * pocket} />
          </g>
        </g>
        {/* panca e manette agganciate al tubo */}
        <g transform={L(0.8)}>
          <rect x="160" y="1100" width="460" height="40" fill="#5A4430" stroke={K} strokeWidth="6" />
          <path d="M200 1140 V1290 M580 1140 V1290" stroke={K} strokeWidth="12" />
          <path d="M260 870 V1010" stroke="#6A5A4A" strokeWidth="26" />
          <g transform="translate(260 1020)">
            <circle cx="0" cy="0" r="30" fill="none" stroke="#C8CCD0" strokeWidth="10" />
            {snap < 0.1 ? (
              <path d="M30 0 Q70 30 90 60" stroke="#C8CCD0" strokeWidth="8" fill="none" strokeDasharray="10 4" />
            ) : (
              <path d={`M30 0 Q50 ${20 + 40 * snap} 40 ${30 + 60 * snap}`} stroke="#C8CCD0" strokeWidth="8" fill="none" strokeDasharray="10 4" />
            )}
            <circle cx={110 + 30 * snap} cy={80 + 90 * snap} r="30" fill="none" stroke="#C8CCD0" strokeWidth="10" />
            {snap > 0 && snap < 1 && SPARK.map((s, i) => <circle key={i} cx={70 + Math.cos(s.a) * s.v * snap} cy={50 + Math.sin(s.a) * s.v * snap + 120 * snap * snap} r="4" fill="#FFE8A0" opacity={1 - snap} />)}
          </g>
        </g>
        {/* l'acqua che sale */}
        <g transform={L(0.95)}>
          <path d="M-200 1300 H1280 V2200 H-200 Z" fill="#3A3430" />
          <g transform={`translate(0 ${-170 * water})`}>
            <WaveBand t={t} y={1320} fill="url(#mn-water)" foam="#CFE8F0" amp={8} w={200} speed={60} bob={4} />
          </g>
        </g>
        {/* l'ascia antincendio che esce dalla teca e cala */}
        <g transform={L(1.15)}>
          <rect x="440" y="650" width="180" height="320" fill="#2A1A1A" opacity=".5" />
          <rect x="440" y="650" width="180" height="320" fill="none" stroke="#C8402A" strokeWidth="10" />
          <path d="M460 670 L500 750 L460 830" stroke="#DDEBF4" strokeWidth="4" fill="none" opacity=".6" />
          <g transform={`translate(${530 - 130 * axe} ${810 + 160 * axe}) rotate(${-10 - 80 * axe}) scale(.85)`}>
            <rect x="-10" y="-150" width="20" height="300" rx="6" fill="#A8642A" stroke={K} strokeWidth="5" />
            <path d="M10 -150 Q90 -150 90 -90 Q60 -110 10 -100 Z" fill="#C8CCD0" stroke={K} strokeWidth="5" />
            <path d="M-10 -150 L-60 -110 L-10 -110 Z" fill="#C8402A" stroke={K} strokeWidth="5" />
          </g>
        </g>
        <g transform={L(1.6)}>
          <Drips t={t} x={300} y0={840} y1={1300} n={4} color="#BFE0F0" />
          <Drips t={t + 1} x={700} y0={880} y1={1300} n={3} color="#BFE0F0" />
          <NearMotes id="mn-near" t={t} color="#DDEFFF" n={5} opacity={0.07} />
        </g>
      </g>
      <Finish id="mn" tint="#0A1A2E" tintOpacity={0.12} />
    </svg>
  );
};
