import React from 'react';
import { camera, eo, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Dust, Embers, Fire, Glow, NearMotes, WaveLines, Wisps } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Ball, K, PocketWatch } from './Comuni';

// Quattro anni dopo: interno di una grotta; parete coperta di tacche per contare i giorni e disegni a carbone,
// una lancia appoggiata, pesci ad affumicare sul fuoco, l'orologio da tasca aperto, il pallone su una sporgenza; fuori la laguna.
// Piani: apertura con la laguna (0,25) · parete con tacche (0,5) · sporgenza con Wilson e orologio (0,7) · fuoco e pesci (0,9) · rocce in primo piano (1,25) · pulviscolo (1,6)

const TALLY = 104; // gruppi da cinque tacche disegnati sulla parete

export const Anni: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  // le tacche si moltiplicano su «conta i giorni sulla parete»
  const shown = Math.floor(40 + (TALLY - 40) * eo(seg(t, cues[1], cues[2])));
  // l'orologio con la foto si apre su «guarda la foto di Kelly»
  const watch = eo(seg(t, cues[2] + 0.6, cues[2] + 1.6));
  // la luce dell'apertura si scalda su «sogna ancora di tornare»
  const dream = seg(t, cues[3], cues[3] + 1.2);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="an" />
        <Lin id="an-out" stops={[[0, '#8ED8F0'], [0.5, '#C8F0EC'], [1, '#5FC2BC']]} />
        <Lin id="an-wall" x2={1} y2={0} stops={[[0, '#2A2420'], [0.45, '#5A4A3C'], [0.7, '#4A3D32'], [1, '#1E1915']]} />
        <Lin id="an-floor" stops={[[0, '#4A3D32'], [1, '#1A1512']]} />
        <Lin id="an-rock" stops={[[0, '#3A302A'], [1, '#14100D']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — fuori: la laguna luminosa vista dall'apertura */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="#1A1512" />
          <path d="M60 560 Q120 420 300 400 Q460 390 520 520 L540 1060 H40 Z" fill="url(#an-out)" />
          <path d="M40 900 H540" stroke="#FFFFFF" strokeWidth="6" opacity=".7" />
          <WaveLines t={t} ys={[940, 990, 1040]} color="#E8F8F4" amp={5} w={140} speed={20} opacity={0.6} />
          <Glow id="an-sun" x={290} y={620} r={340} t={t} color="#FFF2D0" amp={0.04} rate={1} opacity={0.45 + 0.3 * dream} />
          <Beam id="an-beam" x={300} y={560} t={t} length={1200} spread={420} color="#FFF2D0" angle={62} opacity={0.18 + 0.12 * dream} />
        </g>

        {/* PIANO 1 — parete di roccia con le tacche dei giorni e i disegni a carbone */}
        <g transform={L(0.5)}>
          <path d="M520 300 Q700 250 1300 300 V1300 H560 Q540 900 560 560 Q560 420 520 300 Z" fill="url(#an-wall)" stroke={K} strokeWidth="8" />
          <path d="M60 560 Q120 420 300 400 Q460 390 520 520" fill="none" stroke={K} strokeWidth="10" />
          {Array.from({ length: shown }, (_, i) => {
            const col = i % 14, row = Math.floor(i / 14);
            const x = 600 + col * 34, y = 520 + row * 50;
            return (
              <g key={i} stroke="#E9DCC0" strokeWidth="4" strokeLinecap="round" opacity=".85">
                <path d={`M${x} ${y} v32 M${x + 6} ${y} v32 M${x + 12} ${y} v32 M${x + 18} ${y} v32`} />
                <path d={`M${x - 3} ${y + 26} L${x + 22} ${y + 6}`} />
              </g>
            );
          })}
          {/* disegni: sole, nave, isola, cuore (nessuna figura umana) */}
          <g fill="none" stroke="#1A1512" strokeWidth="6" strokeLinecap="round" opacity=".8">
            <circle cx="680" cy="990" r="34" />
            {Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * 6.283; return <path key={i} d={`M${680 + Math.cos(a) * 44} ${990 + Math.sin(a) * 44} l${Math.cos(a) * 18} ${Math.sin(a) * 18}`} />; })}
            <path d="M780 1010 h140 l-20 30 h-100 Z M850 1010 v-80 l50 70" />
            <path d="M1080 860 q40 -70 80 0" />
          </g>
          <path d="M1110 960 q-20 -30 -40 -10 q-20 -20 -40 10 q20 30 40 44 q20 -14 40 -44 Z" fill="none" stroke="#B23A2A" strokeWidth="6" opacity=".8" />
        </g>

        {/* PIANO 2 — sporgenza con Wilson e l'orologio aperto */}
        <g transform={L(0.7, 0, -170)}>
          <path d="M600 1240 Q760 1200 1000 1220 Q1060 1236 1080 1280 L560 1290 Z" fill="#3E3229" stroke={K} strokeWidth="7" />
          <Glow id="an-ballg" x={940} y={1150} r={150} t={t} color="#FFD3B8" amp={0.05} rate={1.4} opacity={0.3} />
          <Ball x={940} y={1160} r={68} rot={-10} face={1} dirty={0.6} />
          <Glow id="an-watchg" x={700} y={1180} r={160} t={t} color="#FFD58A" amp={0.08} rate={2.2} opacity={0.15 + 0.45 * watch} />
          <PocketWatch x={690} y={1190} s={0.55} open={watch} t={t + 3600 * 3} />
        </g>

        {/* PIANO 3 — pavimento, fuoco con i pesci ad affumicare, lancia */}
        <g transform={L(0.9, 0, -300)}>
          <path d="M-200 1430 Q540 1400 1280 1430 V2500 H-200 Z" fill="url(#an-floor)" stroke={K} strokeWidth="7" />
          <Glow id="an-fireg" x={420} y={1500} r={460} t={t} color="#FF9A4A" amp={0.14} rate={7} opacity={0.45} />
          {/* stendino di bastoni con i pesci */}
          <path d="M260 1520 L330 1330 L400 1520 M480 1520 L550 1330 L620 1520 M330 1340 H550" stroke="#6B4E2E" strokeWidth="10" strokeLinecap="round" fill="none" />
          {[370, 430, 490].map((x, i) => (
            <g key={x} transform={`translate(${x} ${1400 + Math.sin(t * 1.5 + i) * 3}) rotate(90)`}>
              <path d="M-40 0 Q-10 -24 30 0 Q-10 24 -40 0 Z M30 0 l20 -16 v32 Z" fill="#B88A5A" stroke={K} strokeWidth="5" />
              <circle cx="-26" cy="-4" r="3" fill={K} />
            </g>
          ))}
          <Wisps t={t} x={440} y={1360} color="#D8CFC4" n={3} h={200} width={6} opacity={0.5} />
          <Fire id="an-fire" t={t} x={440} y={1560} scale={0.9} outline={K} />
          {[380, 440, 500].map((x) => <ellipse key={x} cx={x} cy="1570" rx="34" ry="14" fill="#6E6258" stroke={K} strokeWidth="4" />)}
          {/* lancia appoggiata alla parete */}
          <path d="M780 2000 L1010 900" stroke={K} strokeWidth="16" strokeLinecap="round" />
          <path d="M780 2000 L1010 900" stroke="#9B7A50" strokeWidth="8" strokeLinecap="round" />
          <path d="M1010 900 l-14 -60 l30 56 Z" fill="#D8D2C2" stroke={K} strokeWidth="4" />
        </g>

        {/* PIANO 4 — rocce scure in primo piano ai bordi */}
        <g transform={L(1.25)}>
          <path d="M-200 2000 V1500 Q-60 1440 60 1560 Q160 1680 140 2000 Z" fill="url(#an-rock)" stroke={K} strokeWidth="9" />
          <path d="M1280 2000 V1400 Q1120 1380 1020 1560 Q960 1720 1000 2000 Z" fill="url(#an-rock)" stroke={K} strokeWidth="9" />
          <path d="M-200 -200 H1280 V200 Q900 320 600 260 Q300 200 -200 320 Z" fill="#100C0A" />
          <path d="M-60 1520 Q20 1500 60 1560" fill="none" stroke="#7A5E44" strokeWidth="5" opacity=".6" />
        </g>

        {/* PIANO 5 — pulviscolo nella luce e braci */}
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 560, x0: 200, x1: 400 }} bottom={{ y: 1300, x0: 500, x1: 1100 }} seed={12} n={24} color="#FFF2D0" />
          <Embers t={t} x={440} y={1200} w={80} h={500} seed={14} n={14} drift={60} />
          <NearMotes id="an-near" t={t} color="#FFE2B0" n={5} opacity={0.08} />
        </g>
      </g>
      <Finish id="an" tint="#F2B85A" tintOpacity={0.1} />
    </svg>
  );
};
