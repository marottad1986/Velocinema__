import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes, Stars, Wisps } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { HAND } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { BBDefs, K, Ombra, ORO } from './Comuni';

// Le cure pagate con la droga: la cucina di casa White di notte. Eventi: prima frase sul calendario appeso compare il cerchio
// rosso «CHEMIO» e la lampada si accende sui flaconi di medicine (la famiglia lo convince a curarsi); seconda frase
// l'assegno del vecchio amico ricco Elliott si strappa in due (Walter rifiuta i suoi soldi per orgoglio); terza frase la
// griglia della bocchetta d'aria nel muro si apre e mostra le mazzette nascoste, e sulle bollette dell'ospedale cade il
// timbro «PAGATO» (le cure pagate di nascosto con la droga).
// Piani: parete con finestra e quartiere di notte (0,25) · pensili, frigo, calendario, culla imballata (0,45)
//        · tavolo con bollette, medicine, assegno, lampada (0,7) · bocchetta d'aria con i soldi (0,8)
//        · schienali delle sedie in primo piano (1,2) · pulviscolo nella luce (1,5–1,8)

const r = rng(8808);
const HOUSES = Array.from({ length: 6 }, (_, i) => ({ x: 380 + i * 70 + r() * 10, h: 40 + r() * 40, lit: r() > 0.4 }));

export const Famiglia: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const cal = seg(t, griglia(cues[0] + 0.2), griglia(cues[0] + 0.2) + 0.9);
  const lamp = eo(seg(t, griglia(cues[0] + 0.1), griglia(cues[0] + 0.1) + 0.4));
  const tear = eo(seg(t, griglia(cues[1] + 0.6), griglia(cues[1] + 0.6) + 0.5));
  const vent = eo(seg(t, griglia(cues[2] + 0.1), griglia(cues[2] + 0.1) + 0.6));
  const stamp = eob(seg(t, griglia(cues[2] + 1.0), griglia(cues[2] + 1.0) + 0.3), 2);
  const light = 0.45 + 0.55 * lamp;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fm" />
        <BBDefs id="fm" />
        <Lin id="fm-wall" stops={[[0, '#1A1E22'], [0.4, '#3A3A34'], [0.7, '#4A4638'], [1, '#2A2620']]} />
        <Lin id="fm-night" stops={[[0, '#0A1020'], [1, '#1E2A40']]} />
        <Lin id="fm-cab" x2={1} y2={0} stops={[[0, '#6A5038'], [0.5, '#8A6A48'], [1, '#4A3626']]} />
        <Lin id="fm-fridge" x2={1} y2={0} stops={[[0, '#E8E4DC'], [0.6, '#C8C4BA'], [1, '#8A867E']]} />
        <Lin id="fm-table" stops={[[0, '#8A6440'], [1, '#5A3E26']]} />
        <Lin id="fm-cheque" stops={[[0, '#DDEEE4'], [1, '#B8D4C4']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete e finestra sul quartiere di notte (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#fm-wall)" />
          <rect x="340" y="680" width="380" height="290" fill="url(#fm-night)" stroke={K} strokeWidth="10" />
          <Stars t={t} seed={88} n={14} x={350} y={690} w={360} h={140} color="#DDE6F0" size={2} />
          {HOUSES.map((h, i) => (
            <g key={i}>
              <rect x={h.x} y={960 - h.h} width="62" height={h.h} fill="#141A26" />
              {h.lit && <rect x={h.x + 20} y={960 - h.h + 12} width="16" height="12" fill="#F2C060" opacity=".8" />}
            </g>
          ))}
          <path d="M530 680 V970 M340 825 H720" stroke={K} strokeWidth="8" />
          <rect x="320" y="966" width="420" height="22" fill="#B8AC90" stroke={K} strokeWidth="6" />
          {/* tendina a pacchetto */}
          <path d="M330 680 H730 V740 Q630 760 530 740 Q430 760 330 740 Z" fill="#C8A878" stroke={K} strokeWidth="6" />
        </g>

        {/* PIANO 1 — pensili, frigo con calendario, culla ancora imballata (0,45) */}
        <g transform={L(0.45)}>
          <rect x="-200" y="660" width="500" height="200" fill="url(#fm-cab)" stroke={K} strokeWidth="7" />
          {[-140, 40, 200].map((x) => <rect key={x} x={x} y="680" width="140" height="160" fill="none" stroke="#3A2A1A" strokeWidth="5" />)}
          <rect x="-200" y="1000" width="500" height="40" fill="#C8BCA4" stroke={K} strokeWidth="6" />
          <rect x="-200" y="1040" width="500" height="260" fill="url(#fm-cab)" stroke={K} strokeWidth="7" />
          {/* frigo */}
          <g>
            <rect x="780" y="640" width="260" height="620" rx="16" fill="url(#fm-fridge)" stroke={K} strokeWidth="9" />
            <path d="M780 860 H1040" stroke={K} strokeWidth="6" />
            <rect x="800" y="760" width="14" height="80" rx="6" fill="#8A8A86" stroke={K} strokeWidth="3" />
            <rect x="800" y="900" width="14" height="120" rx="6" fill="#8A8A86" stroke={K} strokeWidth="3" />
            {/* calendario attaccato al frigo con il cerchio rosso */}
            <g transform="translate(720 890)">
              <rect x="0" y="0" width="160" height="170" fill="url(#fm-paper)" stroke={K} strokeWidth="5" />
              <rect x="0" y="0" width="160" height="34" fill="#3F7A55" />
              <text x="80" y="25" textAnchor="middle" fontFamily="sans-serif" fontWeight="800" fontSize="18" fill="#F2E4C4">MARZO</text>
              {Array.from({ length: 20 }, (_, i) => <rect key={i} x={10 + (i % 5) * 29} y={44 + Math.floor(i / 5) * 28} width="24" height="22" fill="#E8E0CC" stroke="#B8AC90" strokeWidth="2" />)}
              <ellipse cx="82" cy="111" rx="30" ry="22" fill="none" stroke="#D8322A" strokeWidth="5" strokeDasharray="170" strokeDashoffset={170 * (1 - cal)} />
              <text x="82" y="162" textAnchor="middle" fontFamily={HAND} fontSize="24" fill="#D8322A" opacity={seg(cal, 0.6, 1)}>CHEMIO</text>
              <circle cx="80" cy="-6" r="10" fill="#D8322A" stroke={K} strokeWidth="3" />
            </g>
            <path d="M960 700 l8 16 l18 2 l-13 12 l4 18 l-17 -9 l-17 9 l4 -18 l-13 -12 l18 -2 Z" fill={ORO} stroke={K} strokeWidth="3" />
          </g>
          <g transform="translate(640 1060)">
            <rect x="-110" y="-90" width="220" height="140" fill="#14100C" stroke={K} strokeWidth="7" />
            {/* mazzette */}
            {[0, 1, 2].map((k) => (
              <g key={k} transform={`translate(${-70 + k * 50} ${-30 - (k % 2) * 16})`}>
                <rect x="0" y="0" width="90" height="46" rx="4" fill="#A8C08A" stroke={K} strokeWidth="4" />
                <rect x="34" y="0" width="16" height="46" fill={ORO} stroke={K} strokeWidth="3" />
              </g>
            ))}
            <Glow id="fm-cash" x={0} y={-10} r={150} t={t} color={ORO} amp={0.06} rate={3} opacity={0.55 * vent} />
            {/* griglia che si apre come uno sportello */}
            <g transform={`translate(-110 -90) skewY(${vent * -18}) scale(${1 - vent * 0.6} 1)`}>
              <rect x="0" y="0" width="220" height="140" fill="#C8C4B8" stroke={K} strokeWidth="6" />
              {Array.from({ length: 7 }, (_, i) => <rect key={i} x="16" y={14 + i * 17} width="188" height="8" fill="#6A665E" />)}
              <circle cx="12" cy="12" r="4" fill="#5A5650" />
              <circle cx="208" cy="128" r="4" fill="#5A5650" />
            </g>
          </g>
        </g>

        {/* PIANO 2 — il tavolo: bollette, flaconi, assegno, lampada (0,7) */}
        <g transform={L(0.7)}>
          <g transform="translate(540 1290) scale(1.2) translate(-540 -1290)">
          <Glow id="fm-lamp" x={200} y={980} r={520} t={t} color="#FFC878" amp={0.04} rate={5} opacity={0.65 * light} />
          {/* lampada da tavolo */}
          <g transform="translate(180 1170)">
            <Ombra id="fm" x={0} y={0} rx={80} ry={10} />
            <path d="M-40 0 Q-40 -20 0 -24 Q40 -20 40 0 Z" fill="#3A3A36" stroke={K} strokeWidth="5" />
            <path d="M0 -24 V-150" stroke="#3A3A36" strokeWidth="10" />
            <path d="M-80 -150 L-50 -230 H50 L80 -150 Z" fill="#E8D8B0" stroke={K} strokeWidth="6" />
            <path d="M-80 -150 H80" stroke="#FFF2C8" strokeWidth="6" opacity={light} />
          </g>
          {/* piano del tavolo */}
          <path d="M-60 1170 H1140 L1200 1280 H-120 Z" fill="url(#fm-table)" stroke={K} strokeWidth="9" />
          <path d="M-50 1176 H1130" stroke="#C8A070" strokeWidth="4" opacity=".7" />
          <rect x="-120" y="1280" width="1320" height="36" fill="#4A3220" stroke={K} strokeWidth="7" />
          {/* pila di bollette dell'ospedale */}
          <g transform="translate(590 1222)">
            <Ombra id="fm" x={0} y={0} rx={150} ry={16} />
            {[0, 1, 2, 3].map((k) => (
              <g key={k} transform={`translate(${(k % 2) * 10 - 5} ${-k * 10}) rotate(${(k % 2) * 4 - 2})`}>
                <path d="M-120 0 L-100 -50 H120 L100 0 Z" fill="url(#fm-paper)" stroke={K} strokeWidth="4" />
              </g>
            ))}
            <g transform="translate(0 -40) skewX(-20)">
              <text x="-60" y="-4" fontFamily="sans-serif" fontWeight="800" fontSize="20" fill="#2A3A4A">OSPEDALE</text>
              <text x="40" y="-4" fontFamily="sans-serif" fontWeight="800" fontSize="20" fill="#C82A1A">$ 90.000</text>
            </g>
            {/* timbro PAGATO */}
            <g transform={`translate(10 -60) rotate(-14) scale(${stamp ? 2 - stamp : 0})`} opacity={stamp > 0 ? Math.min(1, stamp) : 0}>
              <rect x="-90" y="-28" width="180" height="56" rx="6" fill="none" stroke="#2E8A4A" strokeWidth="7" />
              <text x="0" y="14" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="38" fill="#2E8A4A">PAGATO</text>
            </g>
          </g>
          {/* flaconi di medicine */}
          {[[300, 1200, 0.9], [350, 1206, 1.1], [400, 1198, 0.8]].map(([x, y, s], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
              <Ombra id="fm" x={0} y={0} rx={34} ry={6} />
              <rect x="-24" y="-80" width="48" height="80" rx="6" fill="#E8822A" stroke={K} strokeWidth="5" opacity=".95" />
              <rect x="-28" y="-100" width="56" height="22" rx="4" fill="#F2F0E8" stroke={K} strokeWidth="4" />
              <rect x="-20" y="-60" width="40" height="34" fill="#F2F0E8" />
              <path d="M-14 -50 h28 M-14 -40 h20" stroke="#5A5A5A" strokeWidth="3" />
              <path d="M-16 -74 V-10" stroke="#FFD8A8" strokeWidth="4" opacity=".6" />
            </g>
          ))}
          {/* l'assegno di Elliott che si strappa */}
          <g transform="translate(620 1250) skewX(-18) scale(0.9)">
            <g transform={`translate(${-tear * 40} ${-tear * 6}) rotate(${-tear * 10} 0 0)`}>
              <path d={`M-150 0 V-80 H0 L${-8 + 0} -60 L6 -40 L-6 -20 L4 0 Z`} fill="url(#fm-cheque)" stroke={K} strokeWidth="4" />
              <text x="-140" y="-56" fontFamily="sans-serif" fontWeight="800" fontSize="15" fill="#2A4A3A">A WALTER W.</text>
              <path d="M-140 -36 h120" stroke="#5A7A6A" strokeWidth="3" />
            </g>
            <g transform={`translate(${tear * 40} ${tear * 4}) rotate(${tear * 8} 0 0)`}>
              <path d="M0 -80 H150 V0 H4 L-6 -20 L6 -40 L-8 -60 Z" fill="url(#fm-cheque)" stroke={K} strokeWidth="4" />
              <text x="20" y="-52" fontFamily="sans-serif" fontWeight="800" fontSize="22" fill="#2A4A3A">$ 100.000</text>
              <text x="30" y="-14" fontFamily={HAND} fontSize="24" fill="#1E2A5A">Elliott</text>
            </g>
          </g>
          {/* tazza che fuma */}
          <g transform="translate(40 1230)">
            <path d="M-30 0 V-60 H30 V0 Z" fill="#F2E4C4" stroke={K} strokeWidth="5" />
            <path d="M30 -46 Q52 -46 52 -30 Q52 -14 30 -14" stroke={K} strokeWidth="6" fill="none" />
            <Wisps t={t} x={0} y={-64} color="#F2E8D8" n={3} h={110} opacity={0.45} />
          </g>
          </g>
        </g>

        {/* PIANO 3 — bocchetta d'aria nel muro con le mazzette nascoste (0,8) */}
        <g transform={L(0.8)}>
        </g>

        {/* PIANO 4 — schienali delle sedie in primo piano (1,2) */}
        <g transform={L(1.2)}>
          {[[150, 1980], [930, 1960]].map(([cx, cy], i) => (
            <g key={i}>
              <path d={`M${cx - 170} ${cy} V${cy - 330} Q${cx - 170} ${cy - 380} ${cx - 120} ${cy - 380} H${cx + 120} Q${cx + 170} ${cy - 380} ${cx + 170} ${cy - 330} V${cy}`} fill="none" stroke="#5A3E26" strokeWidth="44" />
              <path d={`M${cx - 170} ${cy} V${cy - 330} Q${cx - 170} ${cy - 380} ${cx - 120} ${cy - 380} H${cx + 120} Q${cx + 170} ${cy - 380} ${cx + 170} ${cy - 330} V${cy}`} fill="none" stroke={K} strokeWidth="6" />
              {[-90, -30, 30, 90].map((dx) => <rect key={dx} x={cx + dx - 12} y={cy - 360} width="24" height="360" fill="#6A4A2E" stroke={K} strokeWidth="5" />)}
              <path d={`M${cx - 150} ${cy - 372} H${cx + 150}`} stroke="#A07850" strokeWidth="5" opacity=".7" />
            </g>
          ))}
        </g>

        {/* PIANO 5 — pulviscolo nella luce della lampada (1,5–1,8) */}
        <g transform={L(1.5)} opacity={light}>
          <Dust t={t} top={{ y: 1000, x0: 160, x1: 290 }} bottom={{ y: 1500, x0: 0, x1: 560 }} n={24} color="#FFE6B0" seed={19} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="fm-near" t={t} color="#FFE0A8" n={6} r0={60} r1={150} opacity={0.1} />
        </g>
      </g>
      <Finish id="fm" tint="#2A2240" tintOpacity={0.12} />
    </svg>
  );
};
