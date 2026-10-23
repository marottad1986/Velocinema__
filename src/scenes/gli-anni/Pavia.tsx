import React from 'react';
import { camera, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, Gulls, NearMotes, Notes, Reflection, WaveLines } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K, Mangianastri, Motorino, ORANGE, TINT_DAY } from './Comune';

// Due amici di Pavia: il ponte coperto sul Ticino al tramonto; sull'argine un motorino e un mangianastri;
// rondini; le luci della città che si accendono una a una.
// Piani: cielo e sole (0,2) · città con la cupola (0,3) · ponte coperto (0,45) · fiume (0,6) · argine, motorino,
//        mangianastri (1,0) · erba e pulviscolo vicini (1,3–1,7)
// Eventi: cues[1] il mangianastri parte e salgono le note · cues[2] il faro del motorino si accende
//         · cues[3] passano le rondini · cues[4] le finestre della città si accendono una a una.

const r = rng(1995);
const HOUSES = Array.from({ length: 16 }, (_, i) => ({ x: -180 + i * 92 + r() * 20, w: 70 + r() * 40, h: 70 + r() * 110, c: r() }));
const WINDOWS = HOUSES.flatMap((h) => Array.from({ length: 3 }, (_, k) => ({ x: h.x + 14 + k * 20, y: 900 - h.h + 24 + (k % 2) * 30, d: r() }))).filter((w) => w.y < 880);
const GRASS = Array.from({ length: 60 }, () => ({ x: -200 + r() * 1480, h: 30 + r() * 50, ph: r() * 6 }));

export const Pavia: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c1 = cues[1] ?? 3, c2 = cues[2] ?? 5.5, c3 = cues[3] ?? 8.5, c4 = cues[4] ?? 11.5;
  const play = seg(t, c1, c1 + 0.3);
  const lamp = eo(seg(t, c2, c2 + 0.5));
  const dusk = seg(t, 0, dur);
  const win = (d: number) => seg(t, c4 + d * 1.8, c4 + d * 1.8 + 0.15);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pv" />
        <Lin id="pv-sky" stops={[[0, '#2A2A5A'], [0.35, '#7A4A7A'], [0.6, '#E8806A'], [0.8, '#F8B860'], [1, '#FFD890']]} />
        <Lin id="pv-river" stops={[[0, '#C8806A'], [0.4, '#7A5A7A'], [1, '#2A2A4A']]} />
        <Lin id="pv-brick" x2={1} y2={0} stops={[[0, '#7A3A2A'], [0.5, '#B85A3A'], [1, '#6A2E22']]} />
        <Lin id="pv-roof" stops={[[0, '#5A2A22'], [1, '#3A1A16']]} />
        <Lin id="pv-bank" stops={[[0, '#4A6A3A'], [0.5, '#3A522E'], [1, '#1E2A18']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo al tramonto e sole basso (calmo in alto per il titolo) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#pv-sky)" />
          <Glow id="pv-sun" x={760} y={880} r={lerp(420, 360, dusk)} t={t} color="#FFE0A0" amp={0.03} rate={1} opacity={0.7} />
          <circle cx="760" cy={lerp(860, 900, dusk)} r="70" fill="#FFE8B0" opacity=".95" />
          {[640, 700, 760].map((y, i) => (
            <path key={i} d={`M${-100 + mod(t * 8 + i * 300, 1400)} ${y} q60 -20 120 0 q60 -16 110 0`} fill="none" stroke="#FFD8B0" strokeWidth="8" opacity=".35" strokeLinecap="round" />
          ))}
        </g>

        {/* PIANO 1 — città con la cupola del duomo e le finestre che si accendono */}
        <g transform={L(0.3)}>
          <path d="M380 830 Q380 730 470 720 Q560 730 560 830 Z" fill="#4A2E44" />
          <rect x="455" y="680" width="30" height="44" fill="#4A2E44" />
          <rect x="720" y="660" width="40" height="200" fill="#4A2E44" />
          <path d="M720 660 L740 620 L760 660 Z" fill="#4A2E44" />
          {HOUSES.map((h, i) => <rect key={i} x={h.x} y={900 - h.h} width={h.w} height={h.h} fill={h.c > 0.5 ? '#4A2E44' : '#54344C'} />)}
          {WINDOWS.map((w, i) => <rect key={i} x={w.x} y={w.y} width="10" height="14" fill="#FFD27A" opacity={win(w.d) * (0.7 + 0.3 * Math.sin(t * 2 + i))} />)}
        </g>

        {/* PIANO 2 — il ponte coperto: arcate in mattoni, tetto, cappella al centro */}
        <g transform={L(0.45)}>
          <rect x="-200" y="900" width="1480" height="40" fill="#5A3A3A" />
          <path d="M-200 930 H1280 V980 H-200 Z" fill="url(#pv-brick)" stroke={K} strokeWidth="7" />
          {Array.from({ length: 7 }, (_, i) => {
            const x = -120 + i * 220;
            return (
              <g key={i}>
                <path d={`M${x} 980 V1090 H${x + 40} V1060 Q${x + 110} 990 ${x + 180} 1060 V1090 H${x + 220} V980 Z`} fill="url(#pv-brick)" stroke={K} strokeWidth="7" strokeLinejoin="round" />
                <path d={`M${x + 44} 1060 Q${x + 110} 996 ${x + 176} 1060`} fill="none" stroke="#E8A070" strokeWidth="4" opacity=".6" />
              </g>
            );
          })}
          {/* colonnine e tetto della copertura */}
          {Array.from({ length: 24 }, (_, i) => <rect key={i} x={-190 + i * 62} y="880" width="10" height="52" fill="#3A1E1A" />)}
          <path d="M-200 885 L-200 862 H1280 V885 Z" fill="url(#pv-roof)" stroke={K} strokeWidth="6" />
          <path d="M-200 862 H1280" stroke="#C8805A" strokeWidth="4" opacity=".6" />
          {/* cappella al centro del ponte */}
          <path d="M480 885 V820 L540 780 L600 820 V885 Z" fill="url(#pv-brick)" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          <path d="M470 822 L540 772 L610 822" fill="none" stroke="#3A1A16" strokeWidth="10" strokeLinejoin="round" />
          <rect x="528" y="830" width="24" height="34" rx="12" fill="#FFD27A" opacity={0.4 + 0.5 * win(0.2)} />
        </g>

        {/* PIANO 3 — il Ticino con i riflessi del tramonto */}
        <g transform={L(0.6)}>
          <rect x="-200" y="1090" width="1480" height="160" fill="url(#pv-river)" />
          <Reflection t={t} x={760} y={1110} color="#FFD890" n={9} w={110} gap={24} opacity={0.55} />
          <WaveLines t={t} ys={[1120, 1150, 1185]} color="#F8C8A0" amp={4} w={90} speed={0.6} opacity={0.35} />
        </g>

        {/* PIANO 4 — argine con il motorino e il mangianastri */}
        <g transform={L(1.0)}>
          <path d="M-200 1200 Q300 1170 700 1185 Q1000 1195 1280 1180 V2200 H-200 Z" fill="url(#pv-bank)" stroke={K} strokeWidth="9" />
          <path d="M-200 1206 Q300 1176 700 1191 Q1000 1201 1280 1186" fill="none" stroke="#8AB060" strokeWidth="4" opacity=".6" />
          <Motorino id="pv-moto" x={660} y={1270} s={0.95} t={t} light={lamp} />
          <g transform="translate(240 1262)">
            <Glow id="pv-tape" x={0} y={-30} r={180} t={t} color={ORANGE} amp={0.1} rate={3} opacity={0.5 * play} />
            <Mangianastri x={0} y={0} s={0.7} t={t} play={play} rot={-4} />
          </g>
          <Notes t={t - c1} x={240} y={1180} n={6} spread={260} rise={360} color={ORANGE} outline={K} size={0.9 * play} speed={0.25} />
        </g>

        {/* PIANO 5 — rondini, erba vicina e pulviscolo dorato */}
        <g transform={L(1.3)}>
          <g opacity={seg(t, c3, c3 + 0.4)}>
            <Gulls t={t - c3} seed={7} n={5} y={610} h={150} color={K} size={0.8} period={7} />
          </g>
          <g stroke="#2A3A1E" strokeWidth="6" strokeLinecap="round">
            {GRASS.map((g, i) => <path key={i} d={`M${g.x} 1700 q${4 + Math.sin(t * 1.2 + g.ph) * 8} ${-g.h / 2} ${Math.sin(t * 1.2 + g.ph) * 14} ${-g.h}`} fill="none" />)}
          </g>
        </g>
        <g transform={L(1.7)}>
          <NearMotes id="pv-near" t={t} color="#FFE0B0" opacity={0.09} />
        </g>
      </g>

      <Finish id="pv" tint={TINT_DAY} tintOpacity={0.1} />
    </svg>
  );
};
