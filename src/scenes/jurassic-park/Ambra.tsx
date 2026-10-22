import React from 'react';
import { camera, eo, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Dust, Glow, NearMotes, Stars, WaveLines } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Amber, K } from './Comuni';

// Dinosauri di nuovo vivi: laboratorio di notte, sul banco la goccia d'ambra illuminata da sotto con la zanzara,
// un microscopio, provette, schermi con il DNA; dalla finestra l'isola nel mare.
// Piani: finestra con isola e mare (0,25) · parete e schermi (0,45) · banco con ambra e microscopio (0,7) · provette in primo piano (1,2) · pulviscolo (1,6)

const r = rng(1993);
const HELIX = Array.from({ length: 16 }, (_, i) => i);
const BLIPS = Array.from({ length: 10 }, () => ({ x: r(), y: r(), ph: r() * 6 }));

export const Ambra: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const island = eo(seg(t, cues[0], cues[1])); // l'isola si illumina: «un'isola in Costa Rica»
  const dna = seg(t, cues[2], cues[2] + 1.2); // gli schermi mostrano il DNA: «li hanno clonati»
  const lamp = eo(seg(t, cues[3] - 0.3, cues[3] + 0.6)); // la luce sotto l'ambra: «zanzare antiche»
  const scan = mod(t * 0.6, 1);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="am" />
        <Lin id="am-night" stops={[[0, '#06101A'], [0.5, '#0E2232'], [1, '#183A4A']]} />
        <Lin id="am-wall" stops={[[0, '#0C1714'], [0.5, '#15241E'], [1, '#0A120F']]} />
        <Lin id="am-desk" stops={[[0, '#3A4A44'], [1, '#141C19']]} />
        <Lin id="am-screen" stops={[[0, '#0E3A30'], [1, '#062018']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — finestra notturna con l'isola nel mare */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#am-wall)" />
          <rect x="560" y="560" width="440" height="360" fill="url(#am-night)" stroke="#05090A" strokeWidth="14" />
          <Stars t={t} seed={4} n={16} x={570} y={570} w={420} h={180} />
          <path d="M600 860 Q680 780 760 770 Q800 720 840 740 Q900 780 960 860 Z" fill="#14302A" />
          <Glow id="am-isl" x={780} y={820} r={160} t={t} color="#7FE0A8" amp={0.06} rate={1} opacity={0.15 + 0.3 * island} />
          <rect x="560" y="860" width="440" height="60" fill="#0E2A38" />
          <WaveLines t={t} ys={[880, 900]} color="#5F8FA8" amp={4} w={120} speed={14} opacity={0.5} />
          <path d="M780 560 V920 M560 740 H1000" stroke="#05090A" strokeWidth="10" />
        </g>

        {/* PIANO 1 — schermi con il DNA e dati */}
        <g transform={L(0.45)}>
          {[[90, 620], [330, 620]].map(([x, y], i) => (
            <g key={i}>
              <rect x={x} y={y} width="200" height="150" rx="10" fill="url(#am-screen)" stroke={K} strokeWidth="8" />
              <Glow id={`am-scr${i}`} x={x + 100} y={y + 75} r={160} t={t} color="#5FE0A0" amp={0.08} rate={3 + i} opacity={0.25 + 0.25 * dna} />
              {i === 0 ? (
                <g opacity={0.35 + 0.65 * dna}>
                  {HELIX.map((k) => {
                    const yy = y + 12 + k * 8;
                    const a = t * 3 + k * 0.6;
                    return <path key={k} d={`M${x + 100 + Math.sin(a) * 60} ${yy} L${x + 100 - Math.sin(a) * 60} ${yy}`} stroke={k % 2 ? '#8EF0C0' : P.accento} strokeWidth="3" />;
                  })}
                </g>
              ) : (
                <g>
                  {BLIPS.map((b, k) => <rect key={k} x={x + 14 + b.x * 160} y={y + 14 + b.y * 110} width="20" height="6" fill="#8EF0C0" opacity={0.3 + 0.6 * Math.max(0, Math.sin(t * 4 + b.ph))} />)}
                  <path d={`M${x + 10} ${y + 15 + scan * 120} H${x + 190}`} stroke="#8EF0C0" strokeWidth="2" opacity=".6" />
                </g>
              )}
            </g>
          ))}
        </g>

        {/* PIANO 2 — banco con l'ambra illuminata (accento), microscopio, provette */}
        <g transform={L(0.7)}>
          <path d="M-200 1150 H1280 V2200 H-200 Z" fill="url(#am-desk)" stroke={K} strokeWidth="8" />
          <path d="M-200 1156 H1280" stroke="#6E8A80" strokeWidth="4" opacity=".6" />
          {/* lampada sotto la goccia */}
          <ellipse cx="540" cy="1150" rx="120" ry="20" fill="#2A2A24" stroke={K} strokeWidth="6" />
          <Beam id="am-beam" x={540} y={1150} t={t} length={520} spread={260} color="#FFD27A" angle={-90} opacity={0.25 + 0.35 * lamp} />
          <Glow id="am-amberg" x={540} y={1010} r={300} t={t} color="#FFB040" amp={0.06} rate={1.6} opacity={0.3 + 0.5 * lamp} />
          <Amber x={540} y={1010} s={1.25} accent={P.accento} />
          {/* microscopio */}
          <g transform="translate(860 1150)">
            <path d="M-80 0 H80 V-30 H-80 Z" fill="#C9CED2" stroke={K} strokeWidth="6" />
            <path d="M40 -30 Q60 -160 0 -250" fill="none" stroke={K} strokeWidth="26" strokeLinecap="round" />
            <path d="M40 -30 Q60 -160 0 -250" fill="none" stroke="#C9CED2" strokeWidth="14" strokeLinecap="round" />
            <path d="M-30 -230 L-60 -330" stroke={K} strokeWidth="34" strokeLinecap="round" />
            <path d="M-30 -230 L-60 -330" stroke="#E2E6E8" strokeWidth="20" strokeLinecap="round" />
            <path d="M-20 -120 H40" stroke={K} strokeWidth="10" />
            <path d="M-40 -150 V-70" stroke={K} strokeWidth="12" />
          </g>
          {/* rack di provette */}
          <g transform="translate(200 1150)">
            <rect x="-120" y="-50" width="240" height="40" fill="#5A6460" stroke={K} strokeWidth="6" />
            {[-90, -45, 0, 45, 90].map((x, i) => (
              <g key={x}>
                <rect x={x - 12} y="-150" width="24" height="120" rx="12" fill="#DDEDE6" stroke={K} strokeWidth="5" opacity=".9" />
                <rect x={x - 9} y={-80 - i * 6} width="18" height={50 + i * 6} rx="9" fill={['#C2301E', '#8EF0C0', '#F2A23A', '#C2301E', '#8EF0C0'][i]} opacity=".85" />
              </g>
            ))}
          </g>
        </g>

        {/* PIANO 3 — bordo del banco e fogli in primo piano */}
        <g transform={L(1.2)}>
          <path d="M-200 1700 L460 1640 L520 1940 H-200 Z" fill="#E9E2CF" stroke={K} strokeWidth="7" />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M-120 ${1720 + i * 40} L380 ${1676 + i * 40}`} stroke="#8A8270" strokeWidth="5" />)}
          <path d="M760 1940 L820 1660 H1280 V1940 Z" fill="#2A3A34" stroke={K} strokeWidth="7" />
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 1150, x0: 480, x1: 600 }} bottom={{ y: 620, x0: 300, x1: 780 }} seed={9} n={22} color="#FFE2A0" boost={lamp * 0.4} />
          <NearMotes id="am-near" t={t} color="#FFE2A0" n={5} y0={1300} opacity={0.08} />
        </g>
      </g>
      <Finish id="am" tint="#1E4A30" tintOpacity={0.12} />
    </svg>
  );
};
