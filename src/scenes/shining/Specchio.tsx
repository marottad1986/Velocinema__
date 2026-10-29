import React from 'react';
import { camera, eo, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { K } from './Comuni';

// La parola nello specchio: camera buia; sulla porta una parola scritta in rosso col rossetto che si legge al contrario;
// nello specchio della toeletta, su «riflessa nello specchio», compare dritta («MURDER»); poi la lama di un'ascia sfonda
// il legno della porta del bagno, con schegge che volano (due colpi). Nessuna persona.
// Piani: parete (0,25) · specchio della toeletta (0,5) · porta con la scritta (0,7) · lama e schegge (0,8) · comodino e lampada (1,1) · pulviscolo (1,6)

const r = rng(1980);
const CHIPS = Array.from({ length: 16 }, () => ({ a: -Math.PI + r() * Math.PI, v: 120 + r() * 260, s: 6 + r() * 10, rot: r() * 360 }));

export const Specchio: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const write = seg(t, cues[0] + 0.6, cues[1] - 0.2); // la parola compare lettera dopo lettera
  const mirror = eo(seg(t, cues[1] + 0.2, cues[1] + 1.2)); // nello specchio si legge «MURDER»
  const hits = [cues[2] + 0.6, cues[3] + 0.5];
  const hitP = (h: number) => seg(t, h, h + 0.9);
  const blade = Math.max(...hits.map((h) => (t >= h && t < h + 0.6 ? 1 - Math.abs(t - h - 0.3) / 0.3 : 0)));
  const hole = Math.max(...hits.map((h, i) => seg(t, h, h + 0.15) * (0.5 + 0.5 * i)));
  const word = 'REDRUM';
  const shown = Math.floor(write * word.length + 0.001);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sp" />
        <Lin id="sp-wall" stops={[[0, '#141A22'], [0.5, '#22303C'], [1, '#10161C']]} />
        <Lin id="sp-door" x2={1} y2={0} stops={[[0, '#6A4A34'], [0.5, '#8A6444'], [1, '#5A3E2A']]} />
        <Lin id="sp-glass" stops={[[0, '#3A4A5A'], [1, '#1A2430']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#sp-wall)" />
          <Glow id="sp-lamp" x={120} y={1100} r={500} t={t} color="#FFD8A0" amp={0.06} rate={2} opacity={0.35} />
        </g>
        {/* specchio ovale della toeletta: si legge la parola dritta */}
        <g transform={L(0.5)}>
          <ellipse cx="250" cy="880" rx="190" ry="250" fill="url(#sp-glass)" stroke="#C9A24A" strokeWidth="16" />
          <ellipse cx="250" cy="880" rx="190" ry="250" fill="none" stroke={K} strokeWidth="5" />
          {/* riflesso della porta e della scritta */}
          <rect x="140" y="720" width="220" height="380" fill="#4A3426" opacity=".5" />
          <text x="250" y="900" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="58" fill={P.accento} opacity={mirror} letterSpacing="4">MURDER</text>
          <Glow id="sp-mg" x={250} y={880} r={260} t={t} color={P.accento} amp={0.15} rate={5} opacity={0.45 * mirror} />
          <path d="M120 720 Q150 660 200 650" stroke="#FFFFFF" strokeWidth="8" fill="none" opacity=".25" />
          <rect x="70" y="1130" width="360" height="40" fill="#5A3E2A" stroke={K} strokeWidth="6" />
        </g>
        {/* la porta con la scritta al contrario */}
        <g transform={L(0.7)}>
          <rect x="560" y="560" width="380" height="720" fill="#0A0806" stroke={K} strokeWidth="10" />
          <rect x="580" y="580" width="340" height="690" fill="url(#sp-door)" stroke={K} strokeWidth="7" />
          <rect x="620" y="620" width="260" height="250" fill="none" stroke="#4A3224" strokeWidth="6" />
          <rect x="620" y="920" width="260" height="310" fill="none" stroke="#4A3224" strokeWidth="6" />
          <g transform="translate(750 780) scale(-1 1)">
            <text x="0" y="0" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="66" fill={P.accento} letterSpacing="2" transform="rotate(-6)">{'MURDER'.slice(word.length - shown)}</text>
          </g>
          {/* buco dell'ascia */}
          {hole > 0 && (
            <g transform="translate(760 1040)">
              <path d={`M${-50 * hole} ${-70 * hole} L${30 * hole} ${-60 * hole} L${60 * hole} ${20 * hole} L${10 * hole} ${80 * hole} L${-40 * hole} ${40 * hole} Z`} fill="#050403" stroke="#C9A060" strokeWidth="5" />
              <Glow id="sp-hole" x={0} y={0} r={140} t={t} color="#FFE8C0" amp={0.1} rate={4} opacity={0.35 * hole} />
            </g>
          )}
          {/* lama dell'ascia che passa nel legno */}
          {blade > 0 && (
            <g transform={`translate(${760 - 60 * blade} 1040) rotate(-20)`}>
              <path d="M0 -70 Q90 -40 110 0 Q90 40 0 70 Z" fill="#D8DEE4" stroke={K} strokeWidth="6" />
              <path d="M20 -50 Q80 -30 96 0" stroke="#FFFFFF" strokeWidth="5" fill="none" opacity=".8" />
            </g>
          )}
          {hits.map((h, k) => {
            const p = hitP(h);
            return p > 0 && p < 1 ? CHIPS.map((c, i) => (
              <rect key={`${k}${i}`} x={760 + Math.cos(c.a) * c.v * p - c.s / 2} y={1040 + Math.sin(c.a) * c.v * p + 260 * p * p} width={c.s} height={c.s * 0.4} fill="#C9A060" stroke={K} strokeWidth="2" opacity={1 - p} transform={`rotate(${c.rot + p * 400} ${760 + Math.cos(c.a) * c.v * p} ${1040 + Math.sin(c.a) * c.v * p + 260 * p * p})`} />
            )) : null;
          })}
        </g>
        {/* comodino con la lampada e il rossetto */}
        <g transform={L(1.1)}>
          <path d="M-200 1280 H1280 V2200 H-200 Z" fill="#14100C" />
          <rect x="-120" y="1360" width="360" height="200" fill="#4A3426" stroke={K} strokeWidth="8" />
          <path d="M60 1360 V1220" stroke={K} strokeWidth="10" />
          <path d="M-10 1220 H130 L100 1140 H20 Z" fill="#E8D8B0" stroke={K} strokeWidth="6" />
          <g transform="translate(180 1340) rotate(-30)">
            <rect x="-14" y="-30" width="28" height="44" rx="4" fill="#2A2A2A" stroke={K} strokeWidth="3" />
            <path d="M-10 -30 V-56 L10 -64 V-30 Z" fill={P.accento} stroke={K} strokeWidth="3" />
          </g>
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 1140, x0: 0, x1: 120 }} bottom={{ y: 1300, x0: 300, x1: 900 }} seed={5} n={20} color="#FFE2B0" />
          <NearMotes id="sp-near" t={t} color="#FFE2B0" n={5} y0={1300} opacity={0.07} />
        </g>
      </g>
      <rect width="1080" height="1920" fill="#8A1010" opacity={0.1 * Math.max(mirror * 0.5, blade)} />
      <Finish id="sp" tint="#1A2A3A" tintOpacity={0.12} />
    </svg>
  );
};
