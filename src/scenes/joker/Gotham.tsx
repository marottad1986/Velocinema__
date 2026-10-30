import React from 'react';
import { camera, eo, seg } from '../../lib/anim';
import { Glow, NearMotes, Smoke } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { K, Palazzo, Parrucca, Sacchi, Scarpa } from './Comuni';

// Un clown a Gotham: una strada nel 1981, palazzi di mattoni anneriti, montagne di sacchi per lo sciopero della
// spazzatura, vapore dai tombini, un taxi giallo che passa; su «lavora come clown a noleggio» un cartello pubblicitario
// da clown appoggiato al muro e una cassa con scarpe giganti e parrucca; su «sogna di diventare un comico famoso in TV»
// in una vetrina si accende un televisore con un palco e un microfono (accento). Nessuna persona.
// Piani: cielo (0,15) · palazzi lontani (0,3) · palazzi vicini (0,55) · strada e taxi (0,8) · sacchi e cassa (1,1) · vapore (1,4) · pulviscolo (1,6)

export const Gotham: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const sign = eo(seg(t, cues[1], cues[1] + 0.8)); // il cartello da clown
  const tv = eo(seg(t, cues[2] + 0.2, cues[2] + 1)); // il televisore in vetrina
  const taxi = ((t * 260) % 1700) - 400;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="gt" />
        <Lin id="gt-sky" stops={[[0, '#5A6A5A'], [0.6, '#A89A70'], [1, '#C8A870']]} />
        <Lin id="gt-road" stops={[[0, '#3A3A36'], [1, '#141412']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.15)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#gt-sky)" />
          <Glow id="gt-sun" x={700} y={700} r={600} t={t} color="#F2C46A" amp={0.03} rate={0.5} opacity={0.3} />
        </g>
        <g transform={L(0.3)}>
          {[[-120, 300, 620, '#4A4A44'], [190, 260, 700, '#55504A'], [460, 300, 560, '#4A4642'], [770, 340, 680, '#504A44']].map(([x, w, h, c], i) => (
            <rect key={i} x={x as number} y={1000 - (h as number)} width={w as number} height={h as number} fill={c as string} opacity=".7" />
          ))}
        </g>
        <g transform={L(0.55)}>
          <Palazzo x={-140} y={1130} w={420} h={560} t={t} color="#6A3A2A" seed={1} />
          <Palazzo x={720} y={1130} w={460} h={600} t={t} color="#5A3426" seed={4} />
          {/* vetrina con il televisore (accento: il sogno della TV) */}
          <g transform="translate(860 1040)">
            <rect x="-120" y="-90" width="240" height="160" fill="#14181C" stroke={K} strokeWidth="6" />
            {/* un televisore in vetrina: mobile di legno, schermo, manopole, antenna */}
            <path d="M-40 -74 L-70 -96 M-10 -74 L20 -98" stroke={K} strokeWidth="4" />
            <rect x="-100" y="-74" width="170" height="124" rx="12" fill="#6A4A30" stroke={K} strokeWidth="5" />
            <rect x="-90" y="-64" width="120" height="104" rx="14" fill={tv > 0 ? '#2A3A5A' : '#0A0C10'} stroke={K} strokeWidth="4" />
            <circle cx="50" cy="-40" r="9" fill="#2A1E14" /><circle cx="50" cy="-12" r="9" fill="#2A1E14" />
            {tv > 0 && <g opacity={tv}><rect x="-84" y="0" width="108" height="34" fill="#5A2A2A" /><path d="M-30 0 V-36 M-38 -36 H-22" stroke="#E8E0D0" strokeWidth="4" /><circle cx="-30" cy="-40" r="6" fill="#E8E0D0" /></g>}
            <Glow id="gt-tv" x={-20} y={-14} r={160} t={t} color={P.accento} amp={0.1} rate={5} opacity={0.5 * tv} />
          </g>
        </g>
        {/* strada, tombini e taxi */}
        <g transform={L(0.8)}>
          <path d="M-200 1130 H1280 V2200 H-200 Z" fill="url(#gt-road)" />
          <path d="M-200 1130 H1280" stroke="#8A8478" strokeWidth="14" />
          <path d="M-200 1250 H1280" stroke="#C8A040" strokeWidth="6" strokeDasharray="60 50" opacity=".6" />
          <g transform={`translate(${taxi} 1210)`}>
            <path d="M-110 0 V-40 L-70 -44 L-40 -80 H50 L80 -44 L110 -40 V0 Z" fill="#E8B830" stroke={K} strokeWidth="6" />
            <path d="M-32 -74 H44 L66 -46 H-60 Z" fill="#3A4A5A" stroke={K} strokeWidth="4" />
            <rect x="-20" y="-96" width="40" height="16" fill="#F2E6D0" stroke={K} strokeWidth="3" />
            <circle cx="-64" cy="2" r="20" fill={K} /><circle cx="64" cy="2" r="20" fill={K} />
            <circle cx="108" cy="-28" r="7" fill="#FFF4C0" />
          </g>
          {/* lampione con la luce gialla */}
          <path d="M560 1140 V780 Q560 750 600 750 H640" stroke={K} strokeWidth="12" fill="none" />
          <path d="M620 740 H680 L670 770 H630 Z" fill="#F2C46A" stroke={K} strokeWidth="4" />
          <Glow id="gt-lamp" x={650} y={775} r={360} t={t} color="#F2C46A" amp={0.05} rate={2} opacity={0.65} />
          <ellipse cx="300" cy="1300" rx="80" ry="16" fill="#1A1A18" stroke="#5A5A54" strokeWidth="4" />
          <ellipse cx="820" cy="1340" rx="80" ry="16" fill="#1A1A18" stroke="#5A5A54" strokeWidth="4" />
        </g>
        {/* sacchi della spazzatura, cartello da clown, cassa con scarpe e parrucca */}
        <g transform={L(1.1)}>
          <Sacchi x={120} y={1180} s={1.1} seed={1} />
          <g transform={`translate(420 ${1180 - 40 * (1 - sign)}) rotate(${-6 + 6 * sign})`} opacity={sign}>
            <path d="M0 0 V-80" stroke={K} strokeWidth="8" />
            <rect x="-110" y="-250" width="220" height="170" rx="10" fill="#F2E6D0" stroke={K} strokeWidth="6" />
            <circle cx="-50" cy="-170" r="34" fill="#F2E6D0" stroke={P.accento} strokeWidth="8" />
            <circle cx="-50" cy="-170" r="10" fill={P.accento} />
            <path d="M0 -210 H80 M0 -180 H90 M0 -150 H70 M0 -120 H85" stroke="#5A4A3A" strokeWidth="8" />
          </g>
          <g transform="translate(640 1180)">
            <rect x="-90" y="-80" width="180" height="80" fill="#8A6A44" stroke={K} strokeWidth="6" />
            <Scarpa x={-30} y={-80} s={0.7} rot={-8} />
            <Parrucca x={40} y={-104} s={0.45} />
          </g>
        </g>
        <g transform={L(1.4)}>
          <Smoke id="gt-st1" t={t} x={300} y={1290} color="#C8C4BC" rise={360} wind={-80} r0={30} r1={140} speed={0.25} opacity={0.5} />
          <Smoke id="gt-st2" t={t + 2} x={820} y={1330} color="#C8C4BC" rise={360} wind={60} r0={30} r1={140} speed={0.25} opacity={0.45} />
          <Sacchi x={980} y={1700} s={1.6} seed={2} />
          <Sacchi x={-40} y={1760} s={1.5} seed={3} />
        </g>
        <g transform={L(1.6)}>
          <NearMotes id="gt-near" t={t} color="#F2E6C0" n={6} opacity={0.08} />
        </g>
      </g>
      <Finish id="gt" tint="#3A3A1E" tintOpacity={0.14} />
    </svg>
  );
};
