import React from 'react';
import { camera, eo, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Dust, Glow, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K, Tricycle } from './Comuni';

// Il dono di Danny: camera da bambino nell'albergo; un triciclo, giocattoli, una lampada; uno specchio sull'armadio che,
// su «luccicanza», invece di riflettere la stanza tremola di lampi di luce, come visioni (un corridoio, una porta, la neve).
// Piani: parete con carta da parati (0,25) · finestra (0,35) · armadio con lo specchio (0,6) · letto e triciclo (0,85) · tenda in primo piano (1,25) · pulviscolo (1,6)

const r = rng(237);
const STARS = Array.from({ length: 18 }, () => ({ x: r() * 240 - 120, y: r() * 380 - 190, ph: r() * 6 }));

export const Dono: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const shine = eo(seg(t, cues[1], cues[1] + 0.8)); // «un dono chiamato luccicanza»
  const vision = seg(t, cues[2], dur); // «vede cose del passato e del futuro»: le visioni scorrono nello specchio
  const flick = shine * (0.6 + 0.4 * Math.abs(Math.sin(t * 7)));
  const frame = Math.floor(vision * 3); // 0 corridoio, 1 porta, 2 neve

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="dn" />
        <Lin id="dn-wall" stops={[[0, '#2A3A4A'], [0.5, '#3E4E5E'], [1, '#22303C']]} />
        <Lin id="dn-wood" x2={1} y2={0} stops={[[0, '#4A3426'], [0.5, '#6A4A34'], [1, '#3A2A1E']]} />
        <Lin id="dn-floor" stops={[[0, '#5A4434'], [1, '#1E1610']]} />
        <radialGradient id="dn-vis" cx=".5" cy=".5" r=".6">
          <stop offset="0" stopColor="#F4FAFF" stopOpacity="1" />
          <stop offset=".6" stopColor="#8AB8E8" stopOpacity=".6" />
          <stop offset="1" stopColor="#2A3A5A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#dn-wall)" />
          {Array.from({ length: 14 }, (_, i) => Array.from({ length: 22 }, (_, k) => <circle key={`${i}${k}`} cx={-180 + i * 110 + (k % 2) * 55} cy={-160 + k * 70} r="6" fill="#4E6070" />))}
        </g>
        {/* finestra con la neve che cade */}
        <g transform={L(0.35)}>
          <rect x="740" y="600" width="260" height="320" fill="#14202E" stroke={K} strokeWidth="10" />
          {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={760 + ((i * 53) % 220)} cy={610 + mod(i * 41 + t * 40, 300)} r="3" fill="#E8EEF4" />)}
          <path d="M870 600 V920 M740 760 H1000" stroke={K} strokeWidth="8" />
          <Beam id="dn-win" x={870} y={760} t={t} length={700} spread={300} color="#BFD4E8" angle={130} opacity={0.12} />
        </g>
        {/* l'armadio con lo specchio delle visioni (accento: il bordo che si accende) */}
        <g transform={L(0.6)}>
          <rect x="300" y="560" width="400" height="700" fill="url(#dn-wood)" stroke={K} strokeWidth="9" />
          <rect x="350" y="610" width="300" height="460" fill="#1A2230" stroke={K} strokeWidth="7" />
          {/* riflesso normale della stanza */}
          <path d="M370 1050 L630 1050 L630 900 L370 960 Z" fill="#2A3442" opacity={1 - shine} />
          <path d="M380 640 L440 630 L400 760 Z" fill="#FFFFFF" opacity={0.12 * (1 - shine)} />
          {/* le visioni */}
          <g opacity={flick}>
            <rect x="350" y="610" width="300" height="460" fill="url(#dn-vis)" />
            {frame === 0 && <path d="M500 840 L380 1060 H620 Z M470 860 H530 V900 H470 Z" fill="#2A1A3A" opacity=".55" />}
            {frame === 1 && <g><rect x="440" y="720" width="120" height="240" fill="#4A2A2A" opacity=".6" /><text x="500" y="790" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="34" fill={P.accento}>237</text></g>}
            {frame === 2 && Array.from({ length: 20 }, (_, i) => <circle key={i} cx={360 + ((i * 41) % 280)} cy={620 + mod(i * 33 + t * 120, 440)} r="4" fill="#FFFFFF" />)}
            {STARS.map((s, i) => <circle key={i} cx={500 + s.x} cy={840 + s.y} r="3" fill="#FFFFFF" opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 5 + s.ph))} />)}
          </g>
          <rect x="350" y="610" width="300" height="460" fill="none" stroke={P.accento} strokeWidth="6" opacity={shine} />
          <Glow id="dn-mg" x={500} y={840} r={360} t={t} color="#BFD8FF" amp={0.2} rate={7} opacity={0.5 * shine} />
          <circle cx="680" cy="1150" r="10" fill="#D9B05A" stroke={K} strokeWidth="3" />
        </g>
        {/* letto, triciclo, giocattoli */}
        <g transform={L(0.85)}>
          <path d="M-200 1250 H1280 V2200 H-200 Z" fill="url(#dn-floor)" />
          <rect x="-120" y="1150" width="360" height="110" rx="10" fill="#3A5A7A" stroke={K} strokeWidth="8" />
          <rect x="-120" y="1110" width="120" height="60" rx="24" fill="#E8E2D0" stroke={K} strokeWidth="6" />
          <Tricycle x={820} y={1240} s={1.1} rot={-4} color={P.accento} />
          <g transform="translate(560 1290)">
            <rect x="-40" y="-40" width="80" height="80" fill="#E8C030" stroke={K} strokeWidth="5" />
            <text x="0" y="16" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="44" fill={K}>D</text>
          </g>
          <circle cx="420" cy="1320" r="34" fill="#4A8ACA" stroke={K} strokeWidth="5" />
          {/* lampada */}
          <path d="M120 1150 V1000" stroke={K} strokeWidth="8" />
          <path d="M70 1000 H170 L150 940 H90 Z" fill="#E8D8B0" stroke={K} strokeWidth="5" />
          <Glow id="dn-lamp" x={120} y={990} r={200} t={t} color="#FFD8A0" amp={0.06} rate={2} opacity={0.5} />
        </g>
        {/* tenda in primo piano */}
        <g transform={L(1.25)}>
          <path d="M-200 -200 H120 Q60 700 140 1400 Q80 1700 120 2000 H-200 Z" fill="#5A2A2A" stroke={K} strokeWidth="9" />
          <path d="M20 -200 Q-30 700 40 1400" stroke="#7A3A3A" strokeWidth="12" fill="none" />
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 760, x0: 760, x1: 980 }} bottom={{ y: 1260, x0: 300, x1: 900 }} seed={4} n={20} color="#DCE8F4" boost={shine * 0.4} />
          <NearMotes id="dn-near" t={t} color="#BFD8FF" n={5} y0={1300} opacity={0.08} />
        </g>
      </g>
      <Finish id="dn" tint="#1A2A3A" tintOpacity={0.12} />
    </svg>
  );
};
