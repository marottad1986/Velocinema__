import React from 'react';
import { camera, eo, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Fog, Glow, NearMotes, SunRays } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Egg, Fern, JungleTree, K } from './Comuni';

// Le uova schiuse: mattina nella giungla, un nido tra le felci con gusci di uova rotti, piccole impronte nel fango,
// raggi di sole tra gli alberi e nebbia bassa; una rana su una foglia (il DNA di rana spiega tutto).
// Piani: luce e alberi lontani (0,2–0,35) · nebbia (0,5) · nido con le uova (0,75) · rana e foglia (0,9) · felci (1,25) · pulviscolo (1,6)

export const Uova: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const prints = (k: number) => seg(t, cues[1] + k * 0.35, cues[1] + k * 0.35 + 0.3); // impronte piccole: si riproducono
  const frog = eo(seg(t, cues[3], cues[3] + 0.8)); // la rana: «quello di una rana»
  const hop = seg(t, cues[4], cues[4] + 0.6);
  const glow = seg(t, cues[0] + 0.4, cues[0] + 1.4);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="uo" />
        <Lin id="uo-sky" stops={[[0, '#9CC4A8'], [0.4, '#D8E8C4'], [0.6, '#F4F0D0']]} />
        <Lin id="uo-ground" stops={[[0, '#6A5A3A'], [1, '#2E2414']]} />
        <Lin id="uo-nest" stops={[[0, '#8A6A3A'], [1, '#5A4422']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#uo-sky)" />
          <SunRays id="uo-rays" x={860} y={460} t={t} color="#FFF4C8" n={9} length={1400} opacity={0.4} from={20} to={80} />
          <Glow id="uo-sun" x={860} y={460} r={300} t={t} color="#FFF8D8" amp={0.04} rate={1} opacity={0.6} />
        </g>
        <g transform={L(0.35, 0, 90)}>
          {[-60, 200, 760, 1100].map((x, i) => <JungleTree key={x} x={x} y={1100} h={250 + (i % 2) * 60} t={t} ph={i} outline={false} leaf="#4A8A5A" trunk="#5A4A30" />)}
        </g>
        <g transform={L(0.5)}>
          <Fog id="uo-fog" t={t} y={1060} color="#F4F4E4" rx={900} ry={80} opacity={0.6} />
          <Fog id="uo-fog2" t={t + 4} y={1160} color="#FFFFFF" rx={700} ry={50} opacity={0.4} />
        </g>
        {/* terreno, nido con i gusci (accento sull'alone) e impronte piccole */}
        <g transform={L(0.75)}>
          <path d="M-200 1100 Q540 1060 1280 1110 V2200 H-200 Z" fill="url(#uo-ground)" stroke={K} strokeWidth="6" />
          <Glow id="uo-nestg" x={500} y={1160} r={280} t={t} color={P.accento} amp={0.06} rate={1.6} opacity={0.15 + 0.3 * glow} />
          <ellipse cx="500" cy="1200" rx="230" ry="60" fill="url(#uo-nest)" stroke={K} strokeWidth="7" />
          {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${290 + i * 30} ${1180 + (i % 3) * 14} l${20 + (i % 2) * 10} ${-12 + (i % 4) * 6}`} stroke="#B89A5A" strokeWidth="5" strokeLinecap="round" />)}
          <Egg x={420} y={1150} s={0.75} open={1} />
          <Egg x={540} y={1140} s={0.8} open={1} />
          <Egg x={640} y={1160} s={0.7} open={1} />
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <g key={k} opacity={prints(k)} transform={`translate(${740 + k * 70} ${1250 + (k % 2) * 30})`}>
              <path d="M0 0 l-14 -18 M0 0 l0 -22 M0 0 l14 -18" stroke="#2A2010" strokeWidth="6" strokeLinecap="round" />
            </g>
          ))}
        </g>
        {/* la rana su una foglia */}
        <g transform={L(0.9)}>
          <path d="M120 1260 Q260 1180 380 1240 Q260 1290 120 1260 Z" fill="#3E8A54" stroke={K} strokeWidth="6" />
          <g transform={`translate(260 ${1230 - 60 * Math.sin(hop * Math.PI)}) scale(${frog})`}>
            <ellipse cx="0" cy="0" rx="40" ry="26" fill="#6AB04A" stroke={K} strokeWidth="5" />
            <circle cx="-18" cy="-24" r="12" fill="#6AB04A" stroke={K} strokeWidth="4" /><circle cx="18" cy="-24" r="12" fill="#6AB04A" stroke={K} strokeWidth="4" />
            <circle cx="-18" cy="-26" r="5" fill={K} /><circle cx="18" cy="-26" r="5" fill={K} />
            <path d="M-40 10 q-20 10 -10 22 M40 10 q20 10 10 22" stroke={K} strokeWidth="5" fill="none" />
          </g>
        </g>
        <g transform={L(1.25)}>
          <Fern x={0} y={1920} s={2.8} t={t} ph={0.5} />
          <Fern x={1080} y={1920} s={2.6} t={t} ph={2} flip />
          <Fern x={540} y={2000} s={1.7} t={t} ph={1} color="#3E8A54" />
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 460, x0: 780, x1: 940 }} bottom={{ y: 1300, x0: 200, x1: 900 }} seed={4} n={26} color="#FFF8D8" />
          <NearMotes id="uo-near" t={t} color="#FFF8D8" n={5} y0={1300} opacity={0.1} />
        </g>
      </g>
      <Finish id="uo" tint="#1E4A30" tintOpacity={0.1} />
    </svg>
  );
};
