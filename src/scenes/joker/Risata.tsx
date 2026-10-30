import React from 'react';
import { camera, eo, rng, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { K } from './Comuni';

// La risata che non si ferma: l'interno di un autobus di notte, le luci che sfarfallano, i sedili vuoti; su un sedile il
// cartoncino plastificato che spiega la malattia (righe illeggibili e una faccina che ride, accento); su «anche quando è
// triste o ha paura» le luci tremano a scatti come una risata; su «lo picchia» si passa a un vicolo con un cartello da
// clown spezzato a terra e i pezzi sparsi. Nessuna persona.
// Piani: notte fuori dai finestrini (0,2) · interno del bus (0,5) · sedili (0,8) · cartoncino / cartello (1,05) · corrimano (1,3) · pulviscolo (1,6)

const r = rng(1981);
const LIGHTS = Array.from({ length: 10 }, () => ({ x: r() * 1400 - 160, y: 600 + r() * 200, c: ['#F2C46A', '#D2382E', '#8AC8E0'][Math.floor(r() * 3)] }));

export const Risata: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const card = eo(seg(t, cues[0] + 0.6, cues[0] + 1.4)); // il cartoncino della malattia
  const fit = t > cues[1] && t < cues[2] ? (Math.sin(t * 22) > 0.2 ? 1 : 0.5) : 1; // le luci a scatti, come una risata
  const alley = eo(seg(t, cues[2] - 0.2, cues[2] + 0.7)); // dal bus al vicolo
  const pass = (t * 500) % 1500;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="rs" />
        <Lin id="rs-bus" stops={[[0, '#2A3A34'], [1, '#141C1A']]} />
        <Lin id="rs-alley" stops={[[0, '#1A1A1E'], [0.6, '#3A3028'], [1, '#141210']]} />
      </defs>
      <g transform={cam.transform}>
        {/* l'autobus di notte */}
        <g opacity={1 - alley}>
          <g transform={L(0.2)}>
            <rect x="-200" y="-200" width="1480" height="2400" fill="#0A0C10" />
            {LIGHTS.map((l, i) => <circle key={i} cx={((l.x - pass + 3000) % 1500) - 200} cy={l.y} r="14" fill={l.c} opacity=".6" />)}
          </g>
          <g transform={L(0.5)}>
            <path d="M-200 -200 H1280 V660 H-200 Z M-200 940 H1280 V2200 H-200 Z" fill="url(#rs-bus)" />
            {[0, 1, 2, 3].map((i) => <rect key={i} x={-160 + i * 340} y="660" width="300" height="280" fill="none" stroke="#5A6A60" strokeWidth="18" />)}
            {[0, 1, 2].map((i) => <rect key={i} x={40 + i * 360} y="610" width="200" height="24" rx="8" fill="#F4F0D0" opacity={0.35 + 0.65 * fit} />)}
            <Glow id="rs-lamp" x={540} y={620} r={700} t={t} color="#E8F0D0" amp={0.04} rate={2} opacity={0.35 * fit} />
          </g>
          <g transform={L(0.8)}>
            {[[-60, 1120], [400, 1120], [860, 1120]].map(([x, y], i) => (
              <g key={i}>
                <rect x={x - 130} y={y - 230} width="260" height="230" rx="20" fill="#3A6A5A" stroke={K} strokeWidth="7" />
                <rect x={x - 140} y={y} width="280" height="60" rx="14" fill="#2E5A4A" stroke={K} strokeWidth="7" />
                <path d={`M${x - 110} ${y - 200} H${x + 110}`} stroke="#4A7A6A" strokeWidth="8" />
              </g>
            ))}
          </g>
          {/* il cartoncino sul sedile */}
          <g transform={L(1.05)} opacity={card}>
            <g transform={`translate(420 ${1090 - 30 * card}) rotate(-8)`}>
              <rect x="-120" y="-80" width="240" height="160" rx="10" fill="#F2EAD6" stroke={K} strokeWidth="6" />
              <rect x="-110" y="-70" width="220" height="140" rx="6" fill="none" stroke="#C8C0A8" strokeWidth="3" />
              <circle cx="-62" cy="-10" r="34" fill="#F2EAD6" stroke={P.accento} strokeWidth="6" />
              <circle cx="-74" cy="-20" r="4" fill={K} /><circle cx="-50" cy="-20" r="4" fill={K} />
              <path d="M-82 -2 Q-62 22 -42 -2 Z" fill={P.accento} />
              {[-40, -12, 16, 44].map((y) => <path key={y} d={`M0 ${y} H90`} stroke="#5A4A3A" strokeWidth="6" />)}
            </g>
            <Glow id="rs-card" x={420} y={1080} r={200} t={t} color="#FFF4D0" amp={0.08} rate={3} opacity={0.35} />
          </g>
          <g transform={L(1.3)}>
            <path d="M-200 650 H1280" stroke="#B8C0B8" strokeWidth="18" />
            {[160, 760].map((x) => <path key={x} d={`M${x} 650 V2200`} stroke="#B8C0B8" strokeWidth="22" />)}
            {/* schienali dei sedili davanti, in primo piano */}
            {[-60, 470].map((x) => <g key={x}><rect x={x} y="1560" width="420" height="700" rx="40" fill="#3A6A5A" stroke={K} strokeWidth="9" /><path d={`M${x + 30} 1610 H${x + 390}`} stroke="#4A7A6A" strokeWidth="12" /></g>)}
          </g>
        </g>
        {/* il vicolo con il cartello da clown spezzato */}
        <g opacity={alley}>
          <g transform={L(0.4)}>
            <rect x="-200" y="-200" width="1480" height="2400" fill="url(#rs-alley)" />
            <path d="M-200 -200 L360 700 V1240 L-200 1600 Z M1280 -200 L720 700 V1240 L1280 1600 Z" fill="#4A2E22" stroke={K} strokeWidth="8" />
            <path d="M360 700 H720 V1240 H360 Z" fill="#1E2028" />
            <Glow id="rs-al" x={540} y={820} r={400} t={t} color="#F2C46A" amp={0.06} rate={2} opacity={0.4} />
          </g>
          <g transform={L(1.05)}>
            <path d="M-200 1240 L360 1240 H720 L1280 1240 V2200 H-200 Z" fill="#2A2622" />
            <g transform="translate(420 1180) rotate(-24)"><rect x="-120" y="-70" width="150" height="140" fill="#F2E6D0" stroke={K} strokeWidth="6" /><circle cx="-50" cy="0" r="34" fill="none" stroke={P.accento} strokeWidth="8" /></g>
            <g transform="translate(640 1210) rotate(18)"><path d="M-40 -70 L80 -70 L80 70 L-60 70 L-20 0 Z" fill="#F2E6D0" stroke={K} strokeWidth="6" /><path d="M0 -30 H60 M10 0 H70 M0 30 H50" stroke="#5A4A3A" strokeWidth="7" /></g>
            <path d="M300 1240 V1150" stroke={K} strokeWidth="8" />
            {/* bidone e mattoni del vicolo in primo piano */}
            <g transform="translate(880 1620)"><rect x="-140" y="-160" width="280" height="560" rx="16" fill="#3A4440" stroke={K} strokeWidth="9" /><path d="M-140 -90 H140 M-140 40 H140" stroke="#2A3230" strokeWidth="10" /><rect x="-160" y="-190" width="320" height="40" rx="12" fill="#4A5450" stroke={K} strokeWidth="8" /></g>
            {Array.from({ length: 4 }, (_, i) => <rect key={i} x={-150 + (i % 2) * 140} y={1640 + Math.floor(i / 2) * 70} width="130" height="60" fill="#5A3426" stroke={K} strokeWidth="6" />)}
          </g>
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 520, x0: 100, x1: 980 }} bottom={{ y: 1250, x0: 100, x1: 980 }} seed={2} n={24} color="#E8F0D0" />
          <NearMotes id="rs-near" t={t} color="#E8F0D0" n={6} opacity={0.07} />
        </g>
      </g>
      <Finish id="rs" tint="#1E2E26" tintOpacity={0.16} />
    </svg>
  );
};
