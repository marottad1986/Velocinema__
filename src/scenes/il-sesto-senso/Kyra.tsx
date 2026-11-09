import React from 'react';
import { camera, eio, eo, lerp, seg } from '../../lib/anim';
import { Beam, Dust, Fog, Glow, NearMotes, Stars } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Brina, K, Ombra, SestoDefs } from './Comuni';

// Una bambina fantasma: la cameretta di Cole di notte. Al centro la tenda fatta con una coperta rossa tesa tra due
// sedie, accesa da dentro dalla torcia (il rifugio; il rosso dell'aldilà); dietro la finestra con la luna, la parete
// con le stelline; sul pavimento cubi, una palla e una trottola; a destra il bordo del letto.
// Eventi: 1ª frase la torcia dentro la tenda si accende più forte e calda (Cole non scappa più); 2ª frase l'aria si fa
// gelida: la brina sale sul vetro, la tenda si gonfia come se qualcuno entrasse e la torcia tremola; 3ª frase il fascio
// della torcia esce dalla tenda e illumina a terra il biglietto listato a lutto del funerale. Nessuna persona.
// Piani: parete e finestra (0,3) · sedie e tenda rossa (0,6) · pavimento e giocattoli (0,8)
//        · bordo del letto in primo piano (1,2) · pulviscolo nel fascio (1,5–1,8)

export const Kyra: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const torch = 0.55 + 0.45 * eo(seg(t, griglia(cues[0] + 0.4), griglia(cues[0] + 0.4) + 1));
  const cold = eio(seg(t, griglia(cues[1] + 0.3), griglia(cues[1] + 0.3) + 2.2));
  const billow = Math.sin(Math.PI * seg(t, griglia(cues[1] + 1.2), griglia(cues[1] + 1.2) + 1.8));
  const flick = 1 - 0.5 * billow * (0.5 + 0.5 * Math.sin(t * 29));
  const sweep = eio(seg(t, griglia(cues[2] + 0.5), griglia(cues[2] + 0.5) + 1.4));
  const note = seg(t, griglia(cues[2] + 1.3), griglia(cues[2] + 1.3) + 0.6);
  const tl = torch * flick;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ky" />
        <SestoDefs id="ky" />
        <Lin id="ky-wall" stops={[[0, '#0C1018'], [0.4, '#1C2634'], [0.75, '#26303E'], [1, '#141A22']]} />
        <Lin id="ky-night" stops={[[0, '#0A1426'], [1, '#22385A']]} />
        <Lin id="ky-floor" stops={[[0, '#3A2C22'], [0.5, '#1E160E'], [1, '#060403']]} />
        <Lin id="ky-chair" x2={1} y2={0} stops={[[0, '#2A1C12'], [0.5, '#6A4A30'], [1, '#22160C']]} />
        <Lin id="ky-sheet" stops={[[0, '#C8D0D8'], [1, '#6A7480']]} />
        <radialGradient id="ky-inside" cx=".5" cy=".7" r=".7"><stop offset="0" stopColor="#FFF0C8" /><stop offset=".5" stopColor="#F2A050" /><stop offset="1" stopColor="#8A2A18" /></radialGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete con le stelline e la finestra con la luna (0,3) */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ky-wall)" />
          {Array.from({ length: 24 }, (_, i) => {
            const x = -140 + (i % 8) * 180 + (Math.floor(i / 8) % 2) * 90, y = 700 + Math.floor(i / 8) * 150;
            return <path key={i} d={`M${x} ${y - 12} L${x + 4} ${y - 4} L${x + 12} ${y} L${x + 4} ${y + 4} L${x} ${y + 12} L${x - 4} ${y + 4} L${x - 12} ${y} L${x - 4} ${y - 4} Z`} fill="#C8B870" opacity=".25" />;
          })}
          <rect x="380" y="640" width="320" height="300" fill="url(#ky-night)" stroke={K} strokeWidth="9" />
          <Stars t={t} seed={8} n={10} x={390} y={650} w={300} h={160} color="#E8F0FF" size={0.8} />
          <circle cx="620" cy="720" r="34" fill="#E8EEF4" />
          <Glow id="ky-moon" x={620} y={720} r={260} t={t} color="#A8C4E8" amp={0.03} rate={0.6} opacity={0.4} />
          <path d="M540 640 V940 M380 790 H700" stroke="#3A4656" strokeWidth="10" />
          <Brina id="ky" x={380} y={800} w={320} p={cold} />
          <Brina id="ky" x={380} y={644} w={320} p={cold * 0.8} up={false} seed={7} />
          <rect x="380" y="640" width="320" height="300" fill="url(#ky-glass)" />
          <rect x="380" y="640" width="320" height="300" fill="none" stroke={K} strokeWidth="9" />
          <rect x="360" y="936" width="360" height="20" fill="#4A5260" stroke={K} strokeWidth="5" />
          <path d="M-200 1080 H1280" stroke="#2A2620" strokeWidth="16" />
        </g>

        {/* PIANO 1 — le due sedie e la tenda di coperta rossa, accesa da dentro (0,6) */}
        <g transform={L(0.6)} strokeLinejoin="round">
          <path d="M-200 1090 H1280 V2200 H-200 Z" fill="url(#ky-floor)" />
          {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${-200 + i * 160} 1090 L${-500 + i * 240} 2200`} stroke="#000" strokeWidth="4" opacity=".3" />)}
          <Ombra id="ky" x={540} y={1290} rx={420} ry={34} />
          {/* schienali delle sedie */}
          {[280, 800].map((x, i) => (
            <g key={x}>
              <rect x={x - 20} y="820" width="40" height="460" fill="url(#ky-chair)" stroke={K} strokeWidth="8" />
              <rect x={x - 70 + (i ? 50 : 0)} y="820" width="90" height="30" rx="8" fill="url(#ky-chair)" stroke={K} strokeWidth="7" />
            </g>
          ))}
          {/* la coperta rossa: tesa tra gli schienali e ricadente a terra */}
          <Glow id="ky-tentglow" x={540} y={1150} r={460} t={t} color="#F2A050" amp={0.05} rate={6} opacity={0.45 * tl} />
          <path d={`M280 830 Q540 ${800 - 70 * billow} 800 830 L${880 + 70 * billow} 1270 Q540 ${1296 + 25 * billow} ${200 - 70 * billow} 1270 Z`} fill="url(#ky-redcloth)" stroke={K} strokeWidth="10" />
          {/* pieghe */}
          {[340, 440, 640, 740].map((x, i) => <path key={x} d={`M${x} 840 Q${x + (i < 2 ? -30 : 30) - 45 * billow} 1060 ${x + (i < 2 ? -80 : 80)} 1270`} stroke="#4A0C0A" strokeWidth="8" fill="none" opacity=".7" />)}
          <path d={`M290 836 Q540 ${808 - 70 * billow} 790 836`} stroke="#F28A7A" strokeWidth="5" fill="none" opacity=".6" />
          {/* l'apertura davanti, con la luce calda della torcia dentro */}
          <path d={`M540 900 Q${470 - 45 * billow} 1100 ${420 - 70 * billow} 1272 H${660 + 70 * billow} Q${610 + 45 * billow} 1100 540 900 Z`} fill="url(#ky-inside)" stroke={K} strokeWidth="8" opacity={0.35 + 0.65 * tl} />
          <path d={`M540 900 Q${470 - 45 * billow} 1100 ${420 - 70 * billow} 1272`} stroke="#8A1A16" strokeWidth="14" fill="none" />
          <path d={`M540 900 Q${610 + 45 * billow} 1100 ${660 + 70 * billow} 1272`} stroke="#8A1A16" strokeWidth="14" fill="none" />
          {/* dentro: la torcia a terra e il cuscino */}
          <g opacity={0.6 + 0.4 * tl}>
            <ellipse cx="540" cy="1246" rx="80" ry="20" fill="#E8E0D0" stroke={K} strokeWidth="5" />
            <g transform={`translate(560 1226) rotate(${lerp(-10, 40, sweep)})`}>
              <rect x="-44" y="-12" width="70" height="24" rx="6" fill="#2A3A5A" stroke={K} strokeWidth="5" />
              <path d="M26 -16 H44 V16 H26 Z" fill="url(#ky-steel)" stroke={K} strokeWidth="4" />
              <circle cx="44" cy="0" r="8" fill="#FFF6D8" />
            </g>
          </g>
          {/* fascio della torcia che esce e illumina il biglietto a terra */}
          <Beam id="ky-beam" x={600} y={1228} t={t} length={lerp(100, 230, sweep)} spread={lerp(60, 120, sweep)} angle={lerp(-12, 6, sweep)} color="#FFF0C8" opacity={0.75 * tl * (0.2 + 0.8 * sweep)} />
        </g>

        <g transform={L(0.7)}>
          <Fog id="ky-cold" t={t} y={1180} rx={620} ry={110} color="#BCDCF4" opacity={0.8 * cold} speed={0.6} drift={80} />
          <Glow id="ky-coldglow" x={540} y={900} r={520} t={t} color="#9CC8F0" amp={0.06} rate={2} opacity={0.3 * cold} />
        </g>
        {/* PIANO 2 — giocattoli e il biglietto del funerale sul pavimento (0,8) */}
        <g transform={L(0.8)}>
          {/* cubi di legno */}
          {([[110, 1230, '#4A7AA8'], [180, 1238, '#E8B848'], [146, 1180, '#5AA86A']] as [number, number, string][]).map(([x, y, c], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${i * 8 - 6}) scale(.7)`}>
              <rect x="-36" y="-36" width="72" height="72" rx="6" fill={c} stroke={K} strokeWidth="6" />
              <rect x="-22" y="-22" width="44" height="44" rx="4" fill="none" stroke="#FFFFFF" strokeWidth="4" opacity=".5" />
            </g>
          ))}
          {/* palla e trottola */}
          <circle cx="60" cy="1640" r="44" fill="#4A8AC8" stroke={K} strokeWidth="6" />
          <path d="M20 1630 Q60 1610 102 1632 M30 1660 Q60 1640 98 1664" stroke="#F2E8D0" strokeWidth="8" fill="none" />
          <g transform="translate(330 1620) rotate(14)">
            <path d="M-40 -16 Q0 -40 40 -16 L0 34 Z" fill="#E8B848" stroke={K} strokeWidth="6" />
            <path d="M0 -36 V-60" stroke={K} strokeWidth="8" />
          </g>
          {/* il biglietto listato a lutto: compare nel fascio */}
          <g transform="translate(790 1252) rotate(-8) scale(.6)">
            <Ombra id="ky" x={0} y={34} rx={130} ry={14} />
            <rect x="-120" y="-60" width="240" height="120" fill="url(#ky-paper)" stroke={K} strokeWidth="6" />
            <rect x="-108" y="-48" width="216" height="96" fill="none" stroke="#14100C" strokeWidth="8" />
            <path d="M-70 -14 H70 M-56 10 H56 M-40 30 H40" stroke="#4A4436" strokeWidth="5" strokeLinecap="round" />
            <path d="M-20 -40 h40" stroke="#14100C" strokeWidth="6" />
            <path d="M-120 -60 L-60 -60" stroke="#FFFFFF" strokeWidth="4" opacity=".6" />
          </g>
          <Glow id="ky-note" x={790} y={1252} r={150} t={t} color="#FFF0C8" amp={0.06} rate={4} opacity={0.6 * note * tl} />
        </g>

        {/* PIANO 3 — bordo del letto con la coperta, in primo piano a destra (1,2) */}
        <g transform={L(1.2)}>
          <path d="M760 1640 Q960 1600 1300 1620 V2000 H720 Z" fill="url(#ky-sheet)" stroke={K} strokeWidth="10" />
          <path d="M780 1660 Q960 1626 1280 1646" stroke="#FFFFFF" strokeWidth="6" fill="none" opacity=".5" />
          {[860, 980, 1100].map((x) => <path key={x} d={`M${x} 1660 Q${x - 20} 1800 ${x + 10} 1980`} stroke="#4A5462" strokeWidth="6" fill="none" />)}
          <rect x="700" y="1600" width="50" height="400" fill="url(#ky-chair)" stroke={K} strokeWidth="8" />
          <circle cx="725" cy="1590" r="30" fill="url(#ky-chair)" stroke={K} strokeWidth="7" />
        </g>

        {/* PIANO 4 — pulviscolo nel fascio della torcia e fiato freddo vicino (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 1180, x0: 560, x1: 760 }} bottom={{ y: 1500, x0: 640, x1: 1000 }} seed={2} n={18} color="#FFF0C8" boost={0.2 * sweep} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="ky-near" t={t} color="#C8DCF0" n={6} opacity={0.06 + 0.08 * cold} />
        </g>
      </g>
      <Finish id="ky" tint="#1E2A3A" tintOpacity={0.13} />
    </svg>
  );
};
