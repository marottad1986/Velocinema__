import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes, Wisps } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { HAND } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { BBDefs, Beuta, K, Ombra, ORO, Pallone } from './Comuni';

// Il professore malato: l'aula di chimica di un liceo al tramonto. Eventi: prima frase il gesso scrive una formula sulla
// lavagna (il mestiere di Walter); seconda frase sulla cattedra la spugna gialla e il cartellino dell'autolavaggio
// prendono la luce (il secondo lavoro); terza frase la busta della clinica si apre, il referto scivola fuori e un cerchio
// rosso compare sulla parola «TUMORE»; intanto la fiamma del becco Bunsen si abbassa e il sole cala.
// Piani: parete e finestra (0,25) · lavagna e tavola periodica (0,45) · cattedra con vetreria e busta (0,68)
//        · sgabelli e bordo del bancone in primo piano (1,2) · pulviscolo e polvere di gesso (1,5–1,8)

const r = rng(1101);
const ELEM = Array.from({ length: 7 * 10 }, (_, i) => ({ c: i % 10, rr: Math.floor(i / 10), h: r() }));
const COL = ['#E8B860', '#8EC4A0', '#E89070', '#9AB8E0', '#D8D0A0'];

export const Diagnosi: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const write = seg(t, griglia(cues[0] + 0.3), griglia(cues[0] + 0.3) + 2.2);
  const sponge = eo(seg(t, griglia(cues[1] + 0.2), griglia(cues[1] + 0.2) + 0.8));
  const open = eob(seg(t, griglia(cues[2] + 0.1), griglia(cues[2] + 0.1) + 0.7), 1.4);
  const circle = seg(t, griglia(cues[2] + 1.0), griglia(cues[2] + 1.0) + 0.8);
  const dusk = seg(t, cues[2], dur);
  const flame = 1 - 0.5 * eo(seg(t, cues[2] + 0.4, cues[2] + 1.6));
  const sun = lerp(1, 0.6, dusk);
  const formula = 'C10H15N';

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="dg" />
        <BBDefs id="dg" />
        <Lin id="dg-wall" stops={[[0, '#2E3A30'], [0.35, '#4A5A44'], [0.7, '#6A7254'], [1, '#3A3A2A']]} />
        <Lin id="dg-board" stops={[[0, '#1E3328'], [0.5, '#25402F'], [1, '#18291F']]} />
        <Lin id="dg-out" stops={[[0, '#F0A048'], [0.5, '#F6C870'], [1, '#E8885A']]} />
        <Lin id="dg-desk" stops={[[0, '#2A2A26'], [1, '#121210']]} />
        <Lin id="dg-top" stops={[[0, '#3E3C34'], [1, '#262420']]} />
        <Lin id="dg-wood" x2={1} y2={0} stops={[[0, '#5A3E24'], [0.5, '#8A6038'], [1, '#3E2A18']]} />
        <linearGradient id="dg-ray" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFD080" stopOpacity=".5" /><stop offset="1" stopColor="#FFD080" stopOpacity="0" /></linearGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete verde scolastico, finestra con le lamelle e il tramonto (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#dg-wall)" />
          <rect x="-200" y="1060" width="1480" height="18" fill="#2A2E24" opacity=".7" />
          <g>
            <rect x="850" y="560" width="330" height="520" fill="url(#dg-out)" stroke={K} strokeWidth="10" />
            <Glow id="dg-sun" x={980} y={900} r={320} t={t} color="#FFD890" amp={0.04} rate={0.9} opacity={0.7 * sun} />
            <circle cx="990" cy={lerp(880, 960, dusk)} r="56" fill="#FFF0C8" opacity={0.9 * sun} />
            {/* sagome dei tetti e un palo della luce fuori */}
            <path d="M850 1010 h60 v-40 h50 v20 h70 v-60 h60 v80 h90 v70 H850 Z" fill="#6A4A3A" opacity=".75" />
            <path d="M1100 1080 V780 M1070 800 H1130" stroke="#5A3E30" strokeWidth="6" />
            {/* lamelle della veneziana, tirata a metà */}
            {Array.from({ length: 14 }, (_, i) => (
              <rect key={i} x="846" y={566 + i * 22} width="338" height="12" fill="#D8CCA8" stroke={K} strokeWidth="2" opacity=".95" />
            ))}
            <path d="M870 560 V876 M1150 560 V876" stroke="#8A8068" strokeWidth="3" />
            <rect x="840" y="872" width="350" height="14" fill="#B8AC88" stroke={K} strokeWidth="4" />
            <path d="M1015 560 V1080" stroke={K} strokeWidth="8" />
          </g>
          <circle cx="740" cy="660" r="0" />
        </g>

        {/* PIANO 1 — lavagna con le formule, tavola periodica e orologio (0,45) */}
        <g transform={L(0.45)}>
          {/* tavola periodica a sinistra */}
          <g>
            <rect x="-70" y="660" width="320" height="300" fill="#EFE6CC" stroke={K} strokeWidth="7" />
            <rect x="-70" y="660" width="320" height="32" fill="#3F7A55" stroke={K} strokeWidth="5" />
            {ELEM.filter((e) => !(e.rr === 0 && e.c > 0 && e.c < 9) && !(e.rr < 3 && e.c > 1 && e.c < 7)).map((e, i) => (
              <rect key={i} x={-58 + e.c * 30} y={704 + e.rr * 34} width="26" height="30" fill={COL[Math.floor(e.h * 5)]} stroke="#3A3A30" strokeWidth="2" />
            ))}
            <path d="M-60 680 h120" stroke="#F2E4C4" strokeWidth="5" opacity=".8" />
          </g>
          {/* lavagna */}
          <rect x="280" y="660" width="560" height="380" rx="6" fill="#5A3E24" stroke={K} strokeWidth="10" />
          <rect x="298" y="676" width="524" height="346" fill="url(#dg-board)" />
          {/* vecchie formule cancellate */}
          <path d="M320 740 q60 -20 120 0 t120 0 M330 980 q80 -14 160 0" stroke="#5A7262" strokeWidth="14" opacity=".35" strokeLinecap="round" fill="none" />
          <g fontFamily={HAND} fill="#EEF2E6" opacity=".9">
            <text x="320" y="790" fontSize="44">2H₂ + O₂ → 2H₂O</text>
            <text x="560" y="990" fontSize="38" opacity=".8">pH = −log[H⁺]</text>
            {/* la formula che il gesso sta scrivendo */}
            <text x="320" y="900" fontSize="64" fill="#FFFFFF">{formula.slice(0, Math.floor(write * formula.length))}</text>
          </g>
          {/* esagono del benzene disegnato a gesso */}
          <path d="M730 760 l30 17 v35 l-30 17 l-30 -17 v-35 Z M730 772 l20 11 v24 l-20 11 l-20 -11 v-24 Z" stroke="#EEF2E6" strokeWidth="4" fill="none" opacity=".75" />
          {/* gessetto che scrive */}
          {write > 0 && write < 1 && (
            <g transform={`translate(${330 + write * 300} ${875 + Math.sin(write * 40) * 6}) rotate(-35)`}>
              <rect x="-6" y="-30" width="12" height="40" rx="3" fill="#FFFFFF" stroke={K} strokeWidth="3" />
            </g>
          )}
          <rect x="290" y="1030" width="540" height="20" fill="#6A4A2C" stroke={K} strokeWidth="6" />
          <rect x="330" y="1018" width="60" height="16" rx="3" fill="#C8C0A8" stroke={K} strokeWidth="3" />
          <rect x="420" y="1022" width="22" height="10" rx="3" fill="#FFFFFF" stroke={K} strokeWidth="2" />
          {/* raggi del tramonto che attraversano l'aula */}
          <path d="M850 640 L320 1500 L120 1500 L850 900 Z" fill="url(#dg-ray)" opacity={0.55 * sun} />
          <path d="M850 930 L640 1500 L480 1500 L850 1040 Z" fill="url(#dg-ray)" opacity={0.4 * sun} />
        </g>

        {/* PIANO 2 — la cattedra da laboratorio: vetreria, becco Bunsen, spugna dell'autolavaggio, busta della clinica (0,68) */}
        <g transform={L(0.68)}>
          <rect x="-120" y="1170" width="1320" height="40" fill="url(#dg-top)" stroke={K} strokeWidth="9" />
          <path d="M-110 1176 H1190" stroke="#8A8470" strokeWidth="4" opacity=".7" />
          <rect x="-120" y="1210" width="1320" height="500" fill="url(#dg-desk)" stroke={K} strokeWidth="9" />
          {[120, 520, 920].map((dx) => (
            <g key={dx}>
              <rect x={dx - 150} y="1250" width="300" height="190" fill="#1E1E1A" stroke={K} strokeWidth="6" />
              <rect x={dx - 20} y="1330" width="40" height="10" rx="4" fill="url(#dg-metal)" stroke={K} strokeWidth="3" />
            </g>
          ))}
          <g transform="translate(560 1172) scale(1.22) translate(-560 -1172)">
          {/* supporto con provette */}
          <g transform="translate(40 0)">
            <Ombra id="dg" x={160} y={1172} rx={120} ry={12} />
            <rect x="60" y="1100" width="200" height="16" fill="url(#dg-wood)" stroke={K} strokeWidth="5" />
            <rect x="60" y="1150" width="200" height="20" fill="url(#dg-wood)" stroke={K} strokeWidth="5" />
            <path d="M70 1116 V1150 M250 1116 V1150" stroke={K} strokeWidth="6" />
            {['#E87850', '#7AC8D0', '#F2D060', '#9AD08A'].map((c, i) => (
              <g key={i}>
                <path d={`M${88 + i * 44} 1020 V1140 a12 12 0 0 0 24 0 V1020`} fill="url(#dg-glass)" stroke={K} strokeWidth="4" />
                <path d={`M${90 + i * 44} ${1090 - i * 10} V1140 a10 10 0 0 0 20 0 V${1090 - i * 10} Z`} fill={c} opacity=".85" />
              </g>
            ))}
          </g>
          {/* la busta della clinica e il referto */}
          <g transform="translate(300 1172)">
            <Ombra id="dg" x={140} y={0} rx={190} ry={16} />
            <clipPath id="dg-clip"><rect x="-200" y="-700" width="700" height="700" /></clipPath>
            <g clipPath="url(#dg-clip)"><g transform={`translate(${30 + open * 40} ${60 - open * 210}) rotate(${-6 + open * 4})`}>
              <rect x="0" y="-210" width="230" height="200" fill="url(#dg-paper)" stroke={K} strokeWidth="5" />
              <text x="16" y="-176" fontFamily="sans-serif" fontWeight="800" fontSize="20" fill="#2A3A4A">REFERTO</text>
              {[0, 1, 2, 3].map((k) => <rect key={k} x="16" y={-160 + k * 22} width={150 - k * 20} height="7" fill="#9AA4AA" />)}
              <text x="18" y="-46" fontFamily="sans-serif" fontWeight="800" fontSize="26" fill="#1A1A1A">TUMORE</text>
              <ellipse cx="74" cy="-56" rx="78" ry="30" fill="none" stroke="#D8322A" strokeWidth="6"
                strokeDasharray="360" strokeDashoffset={360 * (1 - circle)} transform="rotate(-4 74 -56)" />
            </g></g>
            <path d="M0 -150 H260 V0 H0 Z" fill="#F4F0E4" stroke={K} strokeWidth="7" />
            <path d="M0 -150 L130 -60 L260 -150" fill="none" stroke="#B8B0A0" strokeWidth="4" />
            <rect x="18" y="-40" width="110" height="24" fill="#3F7A55" />
            <text x="24" y="-22" fontFamily="sans-serif" fontWeight="800" fontSize="16" fill="#F2E4C4">CLINICA</text>
            <path d="M200 -40 h40 v24 h-40 z" fill="#D8322A" opacity=".8" />
          </g>
          {/* spugna gialla e cartellino del secondo lavoro */}
          <g transform="translate(610 1170)">
            <Glow id="dg-sp" x={30} y={-40} r={140} t={t} color={ORO} amp={0.05} rate={3} opacity={0.5 * sponge} />
            <Ombra id="dg" x={30} y={0} rx={90} ry={10} />
            <path d="M-40 0 Q-46 -50 -30 -62 H80 Q96 -50 90 0 Z" fill="#F2C842" stroke={K} strokeWidth="6" />
            {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={-24 + (i % 5) * 26} cy={-16 - Math.floor(i / 5) * 22} r="5" fill="#C89A1E" />)}
            <g transform={`translate(110 -6) rotate(${-8 + sponge * 4})`}>
              <rect x="0" y="-60" width="120" height="60" rx="6" fill="#F4F0E4" stroke={K} strokeWidth="5" />
              <rect x="0" y="-60" width="120" height="18" rx="4" fill="#3A6AC8" />
              <text x="8" y="-14" fontFamily="sans-serif" fontWeight="800" fontSize="15" fill="#1A1A1A">AUTOLAVAGGIO</text>
            </g>
          </g>
          {/* treppiede, becco Bunsen e pallone che bolle */}
          <g>
            <Ombra id="dg" x={900} y={1172} rx={150} ry={14} />
            <path d="M840 1170 L870 1040 M960 1170 L930 1040 M900 1170 V1040" stroke="#3A3E40" strokeWidth="8" />
            <rect x="850" y="1032" width="100" height="12" fill="url(#dg-metal)" stroke={K} strokeWidth="4" />
            <rect x="884" y="1110" width="32" height="60" fill="url(#dg-metal)" stroke={K} strokeWidth="5" />
            <rect x="870" y="1158" width="60" height="14" rx="4" fill="#3A3E40" stroke={K} strokeWidth="4" />
            <g transform={`translate(900 1110) scale(1 ${flame * (0.92 + 0.08 * Math.sin(t * 15))})`}>
              <path d="M-14 0 Q-16 -40 0 -64 Q16 -40 14 0 Z" fill="#5A8AE8" opacity=".85" />
              <path d="M-7 0 Q-8 -24 0 -40 Q8 -24 7 0 Z" fill="#CFE4FF" />
            </g>
            <Glow id="dg-bun" x={900} y={1070} r={110} t={t} color="#8AB4FF" amp={0.1} rate={9} opacity={0.5 * flame} />
            <Pallone id="dg" x={900} y={1032} t={t} s={0.85} liquid="#E8A050" />
          </g>
          </g>
        </g>

        {/* PIANO 3 — sgabelli da laboratorio e bordo del bancone degli studenti (1,2) */}
        <g transform={L(1.2)}>
          <rect x="-140" y="1600" width="1360" height="60" fill="#2E2C26" stroke={K} strokeWidth="10" />
          <path d="M-130 1608 H1210" stroke="#7A7464" strokeWidth="5" opacity=".7" />
          <rect x="-140" y="1660" width="1360" height="400" fill="#141410" />
          {/* vetreria grande sul bancone degli studenti: incornicia ai lati */}
          <Beuta id="dg" x={40} y={1606} t={t} s={1.5} liquid="#9AD08A" level={0.35} ph={0.6} />
          <g transform="translate(980 1606)">
            <Ombra id="dg" x={0} y={0} rx={120} ry={14} />
            <rect x="-50" y="-420" width="100" height="420" fill="url(#dg-glass)" stroke={K} strokeWidth="8" />
            <rect x="-46" y="-190" width="92" height="186" fill="#7AC8D0" opacity=".8" />
            <path d="M-80 0 H80 V-24 H-80 Z" fill="#3A3E40" stroke={K} strokeWidth="6" />
            {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M-50 ${-60 - i * 40} h${i % 2 ? 22 : 36}`} stroke={K} strokeWidth="4" />)}
            <path d="M-30 -400 V-40" stroke="#FFFFFF" strokeWidth="8" opacity=".45" />
          </g>
          {/* pila di compiti da correggere e tazza di caffè sul bancone */}
          <g transform="translate(700 1604)">
            <Ombra id="dg" x={0} y={0} rx={170} ry={14} />
            {[0, 1, 2, 3].map((k) => (
              <g key={k} transform={`translate(${(k % 2) * 8 - 4} ${-k * 26}) rotate(${(k % 2) * 3 - 1.5})`}>
                <rect x="-140" y="-26" width="260" height="26" fill={k % 2 ? '#3F7A55' : '#B8682A'} stroke={K} strokeWidth="5" />
                <path d="M-130 -13 H110" stroke="#F2E4C4" strokeWidth="3" opacity=".5" />
              </g>
            ))}
            <g transform="translate(40 -104)">
              <path d="M-40 0 V-90 H40 V0 Q40 6 34 6 H-34 Q-40 6 -40 0 Z" fill="#F2E4C4" stroke={K} strokeWidth="6" />
              <path d="M40 -70 Q72 -70 72 -44 Q72 -20 40 -20" stroke={K} strokeWidth="8" fill="none" />
              <rect x="-40" y="-60" width="80" height="24" fill="#3F7A55" />
              <Wisps t={t} x={0} y={-96} color="#F2E8D8" n={3} h={120} opacity={0.5} />
            </g>
          </g>
          {/* rubinetto del bancone */}
          <path d="M520 1600 V1520 Q520 1490 550 1490 H600 V1512" stroke="url(#dg-metal)" strokeWidth="18" fill="none" />
          <path d="M520 1600 V1520 Q520 1490 550 1490 H600 V1512" stroke={K} strokeWidth="4" fill="none" opacity=".6" />
        </g>

        {/* PIANO 4 — pulviscolo nel sole e polvere di gesso (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 700, x0: 760, x1: 900 }} bottom={{ y: 1500, x0: 160, x1: 560 }} n={30} color="#FFE6B0" seed={7} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="dg-near" t={t} color="#FFE0A8" n={6} r0={70} r1={160} opacity={0.12} />
        </g>
      </g>
      <Finish id="dg" tint="#C8822A" tintOpacity={0.1} />
    </svg>
  );
};
