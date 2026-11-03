import React from 'react';
import { camera, eio, eo, lerp, seg } from '../../lib/anim';
import { Flyers, Fog, Glow, Gulls, NearMotes, SunRays } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { SERIF } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { K, Lampada, OthersDefs, Ombra, Villa as Casa } from './Comuni';

// Per sempre nella villa: la stessa villa del primo capitolo, ma di giorno, con la nebbia che si dirada.
// Eventi: prima frase sul pilastro del cancello l'elmetto di Charles appare un'ultima volta e svanisce nella nebbia
// (era tornato solo per salutarli); seconda frase l'auto della famiglia di Victor si allontana lungo il viale con i
// fari accesi e il cartello «VENDESI» appeso al cancello dondola; terza frase il sole buca la nebbia e in tutte le
// finestre le tende si aprono: Grace e i figli restano, senza più paura della luce. Nessuna persona.
// Piani: cielo e sole (0,25) · bosco lontano (0,45) · villa (0,62) · prato, viale, auto (0,9)
//        · cancello, pilastri, cartello (1,2) · foglie e nebbia vicina (1,5–1,8)

export const Fine: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const helmet = eo(seg(t, cues[0] + 0.2, cues[0] + 1.0)) * (1 - eio(seg(t, cues[0] + 2.2, cues[1] + 0.4)));
  const drive = eio(seg(t, cues[1] + 0.1, cues[2] + 0.6));
  const sun = eo(seg(t, cues[2], cues[2] + 2));
  const open = eio(seg(t, cues[2] + 0.4, cues[2] + 2.2));
  const signSwing = 6 * Math.sin(t * 2.1) * (0.3 + 0.7 * seg(t, cues[1] + 0.5, cues[1] + 1.5));
  // l'auto scende il viale verso la camera e esce in basso a sinistra
  const d1 = seg(drive, 0, 0.4), d2 = seg(drive, 0.4, 1);
  const carX = lerp(lerp(545, 600, d1), 1240, d2), carY = lerp(1215, 1250, d1) - 6 * d2, carS = lerp(0.26, 0.42, d1);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fi" />
        <OthersDefs id="fi" />
        <Lin id="fi-sky" stops={[[0, '#5A6A70'], [0.35, '#8A9A9A'], [0.6, '#B8C2BC'], [0.75, '#C8CEC4']]} />
        <Lin id="fi-lawn" stops={[[0, '#4A5A44'], [0.4, '#34422E'], [1, '#18200F']]} />
        <Lin id="fi-drive" stops={[[0, '#9A9A8E'], [1, '#4A4A40']]} />
        <Lin id="fi-pillar" x2={1} y2={0} stops={[[0, '#9AA09A'], [0.5, '#7A807A'], [1, '#4A504C']]} />
        <Lin id="fi-iron" x2={1} y2={0} stops={[[0, '#1A1E20'], [0.5, '#4A5054'], [1, '#141618']]} />
        <Lin id="fi-car" x2={1} y2={0} stops={[[0, '#141A1E'], [0.45, '#3A4A54'], [1, '#10161A']]} />
        <Lin id="fi-khaki" x2={1} y2={0} stops={[[0, '#3A3C26'], [0.45, '#7A7A4E'], [1, '#2E301E']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo chiaro di nebbia e il sole che la buca (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#fi-sky)" />
          <rect x="-200" y="-200" width="1480" height="2400" fill="#FFF2D0" opacity={0.25 * sun} />
          <g opacity={0.3 + 0.7 * sun}>
            <SunRays id="fi-rays" x={860} y={720} t={t} color="#FFF4D0" n={12} length={900} width={60} opacity={0.35 * sun} />
            <Glow id="fi-sun" x={860} y={720} r={300} t={t} color="#FFF4D0" amp={0.04} rate={1} opacity={0.8} />
            <circle cx="860" cy="720" r="60" fill="#FFFBEA" opacity=".9" />
          </g>
          <Gulls t={t} seed={4} n={4} y={760} h={80} color="#2A3032" size={0.8} period={13} />
        </g>

        {/* PIANO 1 — bosco lontano e nebbia che si dirada (0,45) */}
        <g transform={L(0.45)}>
          {Array.from({ length: 16 }, (_, i) => (
            <ellipse key={i} cx={-140 + i * 92} cy={1080 - (i % 3) * 30} rx={60} ry={110 + (i % 4) * 20} fill="#6A786E" opacity=".5" />
          ))}
          <rect x="-200" y="1080" width="1480" height="200" fill="#7A8A7C" />
          <Fog id="fi-f1" t={t} y={1090} rx={900} ry={90} color="#D8E0D8" opacity={0.7 - 0.4 * sun} speed={0.2} drift={80} />
        </g>

        {/* PIANO 2 — la villa con le tende che si aprono (0,62) */}
        <g transform={L(0.62)}>
          <Casa id="fi" x={540} y={1200} t={t} s={0.9} open={open} />
          <rect x="140" y="640" width="800" height="560" fill="#FFF2D0" opacity={0.12 * sun} />
          <Fog id="fi-f2" t={t} y={1180} rx={720} ry={70} color="#E0E6E0" opacity={0.55 - 0.3 * sun} speed={0.25} ph={1} drift={120} />
        </g>

        {/* PIANO 3 — prato, viale e l'auto che se ne va (0,9) */}
        <g transform={L(0.9)}>
          <path d="M-200 1215 Q540 1195 1280 1215 V2200 H-200 Z" fill="url(#fi-lawn)" />
          <path d="M492 1210 H588 L860 2200 H220 Z" fill="url(#fi-drive)" stroke={K} strokeWidth="6" />
          {Array.from({ length: 40 }, (_, i) => {
            const v = (i * 0.618) % 1, yy = 1230 + v * v * 860, half = lerp(50, 320, (yy - 1210) / 990);
            return <circle key={i} cx={540 + (((i * 37) % 100) / 50 - 1) * half * 0.9} cy={yy} r={2 + v * 4} fill="#B8B8AA" opacity=".5" />;
          })}
          {[[-60, 1260, 260], [880, 1260, 280]].map(([hx, hy, hw], i) => (
            <path key={i} d={`M${hx} ${hy} q${hw * 0.25} -50 ${hw * 0.5} -10 q${hw * 0.25} -50 ${hw * 0.5} 10 v60 h${-hw} Z`} fill="#2E4232" stroke={K} strokeWidth="6" />
          ))}
          {/* auto anni Quaranta vista di fronte, con i fari accesi */}
          <g transform={`translate(${carX} ${carY}) scale(${carS})`} opacity={1 - seg(drive, 0.92, 1)}>
            <Ombra id="fi" x={0} y={8} rx={190} ry={22} />
            <Glow id="fi-hl" x={0} y={-60} r={260} t={t} color="#FFF0C0" amp={0.03} rate={2} opacity={0.5} />
            <path d="M-170 0 V-80 Q-170 -110 -130 -116 L-100 -190 Q-90 -210 -60 -212 H60 Q90 -210 100 -190 L130 -116 Q170 -110 170 -80 V0 Z" fill="url(#fi-car)" stroke={K} strokeWidth="9" />
            <path d="M-90 -186 H90 L110 -124 H-110 Z" fill="#6A7A84" stroke={K} strokeWidth="6" />
            <path d="M-70 -180 L-90 -130" stroke="#C8D4DA" strokeWidth="5" opacity=".6" />
            <rect x="-40" y="-100" width="80" height="80" rx="10" fill="#8A9298" stroke={K} strokeWidth="5" />
            {[-26, -13, 0, 13, 26].map((x) => <path key={x} d={`M${x} -94 V-26`} stroke={K} strokeWidth="3" />)}
            {[-120, 120].map((x) => (
              <g key={x}>
                <circle cx={x} cy="-70" r="26" fill="#FFF4D0" stroke={K} strokeWidth="6" />
                <circle cx={x - 6} cy="-76" r="8" fill="#FFFFFF" />
              </g>
            ))}
            <rect x="-180" y="-16" width="360" height="18" rx="8" fill="#B8C0C4" stroke={K} strokeWidth="5" />
            {[-140, 140].map((x) => <rect key={`w${x}`} x={x - 22} y="-6" width="44" height="30" rx="8" fill="#0A0A0A" />)}
          </g>
        </g>

        {/* PIANO 4 — pilastri del cancello, elmetto, cartello VENDESI, lampada spenta (1,2) */}
        <g transform={L(1.2)}>
          {/* anta del cancello aperta con il cartello */}
          {Array.from({ length: 9 }, (_, i) => {
            const bx = 40 + i * 30, top = 1460;
            return (
              <g key={i}>
                <rect x={bx} y={top} width="10" height={1920 - top} fill="url(#fi-iron)" stroke={K} strokeWidth="3" />
                <path d={`M${bx + 5} ${top - 30} l-12 30 h24 Z`} fill="#2A2E30" stroke={K} strokeWidth="3" />
              </g>
            );
          })}
          {[1560, 1760].map((by) => <rect key={by} x="30" y={by} width="290" height="14" fill="url(#fi-iron)" stroke={K} strokeWidth="4" />)}
          {[[120, 1100], [830, 1300]].map(([px, py], i) => (
            <g key={i}>
              <rect x={px} y={py} width="190" height={2000 - py} fill="url(#fi-pillar)" stroke={K} strokeWidth="9" />
              {Array.from({ length: 9 }, (_, k) => <path key={k} d={`M${px} ${py + 70 + k * 80} H${px + 190}`} stroke="#000" strokeWidth="3" opacity=".25" />)}
              <rect x={px - 18} y={py - 30} width="226" height="36" fill="#9AA09A" stroke={K} strokeWidth="7" />
            </g>
          ))}
          {/* cartello VENDESI appeso al pilastro di sinistra */}
          <g transform={`translate(210 1150) rotate(${signSwing})`}>
            <path d="M-20 0 V40 M180 0 V40" stroke="#3A3E40" strokeWidth="6" />
            <path d="M-30 0 H190" stroke="#3A3E40" strokeWidth="10" />
            <rect x="-40" y="40" width="240" height="96" rx="6" fill="#E8DCC0" stroke={K} strokeWidth="7" />
            <rect x="-30" y="50" width="220" height="76" fill="none" stroke="#8A3A2A" strokeWidth="4" />
            <text x="80" y="104" textAnchor="middle" fontFamily={SERIF} fontSize="48" fill="#8A2A1E" letterSpacing="3">VENDESI</text>
          </g>
          {/* l'elmetto di Charles sul pilastro, un'ultima volta */}
          <g transform="translate(215 1068) rotate(-4)" opacity={helmet}>
            <ellipse cx="0" cy="0" rx="100" ry="24" fill="url(#fi-khaki)" stroke={K} strokeWidth="8" />
            <path d="M-62 -4 Q-62 -74 0 -78 Q62 -74 62 -4 Z" fill="url(#fi-khaki)" stroke={K} strokeWidth="8" />
            <path d="M-44 -36 Q-36 -64 0 -68" stroke="#C8C498" strokeWidth="6" fill="none" opacity=".6" strokeLinecap="round" />
          </g>
          <Glow id="fi-helm" x={118} y={1040} r={160} t={t} color="#E8E2C8" amp={0.05} rate={2} opacity={0.4 * helmet} />
          <Lampada id="fi" x={925} y={1270} t={t} s={0.66} lit={0.25 * (1 - sun)} glow={0.2 * (1 - sun)} ph={0.7} />
        </g>

        {/* PIANO 5 — foglie e nebbia vicina (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Flyers t={t} seed={12} n={5} color="#8A6A3A" outline={K} w={30} h={40} y0={700} y1={1700} speed={0.08} shape="leaf" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="fi-near" t={t} color="#F2F0E4" n={7} r0={80} r1={180} opacity={0.12 - 0.05 * sun} />
        </g>
      </g>
      <Finish id="fi" tint="#E8D8A8" tintOpacity={0.08} />
    </svg>
  );
};
