import React from 'react';
import { camera, eo, lerp, seg } from '../../lib/anim';
import { Beam, Embers, Glow, Moon, NearMotes, Stars } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { BBDefs, K, Ombra, ORO } from './Comuni';

// Il furto della metilammina: un magazzino di prodotti chimici di notte, fuori città. Eventi: prima frase l'insegna del
// magazzino si accende tremolando (Tuco vuole tanta droga: serve un ingrediente da rubare); seconda frase il fascio di una
// torcia attraversa la finestra e scopre dentro il bidone con l'etichetta METILAMMINA; terza frase sul lucchetto della
// porta brucia la polvere incendiaria (termite): scintille bianchissime, il lucchetto si scioglie e cade, la porta si
// socchiude e il carrello è pronto.
// Piani: cielo con la luna (0,22) · colline e tralicci (0,38) · facciata del magazzino con insegna e finestra (0,55)
//        · porta con catena e lucchetto, carrello (0,72) · recinzione tagliata in primo piano (1,25) · scintille e falene (1,5–1,8)

const RIBS = Array.from({ length: 22 }, (_, i) => i);

export const Furto: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tSign = griglia(cues[0] + 0.3);
  const sign = t < tSign ? 0 : t < tSign + 0.5 ? (Math.sin((t - tSign) * 50) > 0 ? 1 : 0.2) : 1;
  const torch = eo(seg(t, griglia(cues[1] + 0.6), griglia(cues[1] + 0.6) + 0.5));
  const torchA = lerp(40, 0, eo(seg(t, griglia(cues[1] + 0.6), griglia(cues[1] + 0.6) + 1.4)));
  const tBurn = griglia(cues[2] + 0.3);
  const burn = seg(t, tBurn, tBurn + 2.2);
  const burning = t >= tBurn && t < tBurn + 2.2;
  const melt = seg(t, tBurn + 1.4, tBurn + 2.2);
  const lockFall = seg(t, tBurn + 2.2, tBurn + 2.6);
  const door = eo(seg(t, tBurn + 2.6, tBurn + 3.4));
  const spark = burning ? 0.8 + 0.2 * Math.sin(t * 37) : 0;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fu" />
        <BBDefs id="fu" />
        <Lin id="fu-sky" stops={[[0, '#050810'], [0.4, '#0E1830'], [0.65, '#1E2C48'], [0.75, '#3A3A50']]} />
        <Lin id="fu-wall" x2={1} y2={0} stops={[[0, '#5A6470'], [0.5, '#46505A'], [1, '#2A3038']]} />
        <Lin id="fu-ground" stops={[[0, '#3A3630'], [1, '#121210']]} />
        <Lin id="fu-door" x2={1} y2={0} stops={[[0, '#6A3A2A'], [0.5, '#5A2E20'], [1, '#3A1E14']]} />
        <Lin id="fu-drum" x2={1} y2={0} stops={[[0, '#2A4A7A'], [0.4, '#4A7AB8'], [1, '#1E3458']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo notturno e luna (0,22) */}
        <g transform={L(0.22)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#fu-sky)" />
          <Stars t={t} seed={101} n={50} y={0} h={720} color="#DDE6F0" size={2.2} />
          <Moon id="fu-moon" x={860} y={780} r={50} t={t} color="#EEF0E4" halo="#AFC4E8" />
        </g>

        {/* PIANO 1 — colline e tralicci dell'alta tensione (0,38) */}
        <g transform={L(0.38)}>
          <path d="M-200 1020 Q100 940 380 990 Q640 1030 900 960 Q1100 920 1280 980 V1100 H-200 Z" fill="#141C28" />
          {[120, 980].map((x) => (
            <g key={x} stroke="#2A3448" strokeWidth="5" fill="none">
              <path d={`M${x - 40} 1020 L${x} 820 L${x + 40} 1020 M${x - 60} 860 H${x + 60} M${x - 30} 900 L${x + 30} 960 M${x + 30} 900 L${x - 30} 960`} />
            </g>
          ))}
          <path d="M180 862 Q560 920 920 862" stroke="#2A3448" strokeWidth="3" fill="none" />
        </g>

        {/* PIANO 2 — facciata di lamiera, insegna, finestra col bidone dentro, lampione (0,55) */}
        <g transform={L(0.55)}>
          <rect x="-200" y="1060" width="1480" height="200" fill="#1E2228" />
          <path d="M-60 760 L540 700 L1140 760 V1240 H-60 Z" fill="url(#fu-wall)" stroke={K} strokeWidth="9" />
          {RIBS.map((i) => <path key={i} d={`M${-40 + i * 56} ${760 - Math.max(0, 1 - Math.abs(i * 56 - 580) / 600) * 60 + 10} V1240`} stroke="#2A3038" strokeWidth="5" opacity=".7" />)}
          <path d="M-60 760 L540 700 L1140 760" stroke="#9AA4B0" strokeWidth="5" fill="none" opacity=".7" />
          {/* insegna */}
          <g>
            <rect x="200" y="760" width="520" height="70" fill="#1A1E22" stroke={K} strokeWidth="6" />
            <Glow id="fu-sign" x={460} y={795} r={330} t={t} color="#7AE8C8" amp={0.04} rate={7} opacity={0.4 * sign} />
            <text x="460" y="808" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="38" fill={sign > 0.5 ? '#B8FFE8' : '#3A5A50'} letterSpacing="3">PRODOTTI CHIMICI</text>
          </g>
          {/* finestra con il bidone dentro */}
          <g transform="translate(820 975) scale(1.3) translate(-870 -975)">
            <rect x="740" y="880" width="260" height="190" fill="#0A0E14" stroke={K} strokeWidth="8" />
            <g opacity={0.25 + 0.75 * torch}>
              <rect x="820" y="930" width="110" height="150" fill="url(#fu-drum)" stroke={K} strokeWidth="5" />
              <ellipse cx="875" cy="930" rx="55" ry="12" fill="#5A8AC8" stroke={K} strokeWidth="4" />
              <rect x="826" y="976" width="98" height="46" fill="#F2F0E4" stroke={K} strokeWidth="3" />
              <text x="875" y="1004" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="11" fill="#1A1A1A">METILAMMINA</text>
              <rect x="826" y="1010" width="98" height="10" fill={ORO} />
            </g>
            <Glow id="fu-drumg" x={875} y={990} r={150} t={t} color={ORO} amp={0.06} rate={3} opacity={0.4 * torch} />
            <path d="M740 975 H820 M930 975 H1000" stroke={K} strokeWidth="6" />
            {/* inferriata */}
            {[770, 810, 930, 970].map((x) => <path key={x} d={`M${x} 880 V1070`} stroke="#3A4048" strokeWidth="6" />)}
          </g>
          {/* lampione al sodio */}
          <g>
            <path d="M40 1260 V820 Q40 790 80 790 H130" stroke="#2A2E34" strokeWidth="12" fill="none" />
            <path d="M110 780 H170 L160 800 H120 Z" fill="#3A3E44" stroke={K} strokeWidth="4" />
            <Glow id="fu-lamp" x={140} y={806} r={300} t={t} color="#F2A040" amp={0.04} rate={2} opacity={0.6} />
            <ellipse cx="140" cy="802" rx="18" ry="6" fill="#FFD890" />
          </g>
        </g>

        {/* PIANO 3 — porta di ferro con catena e lucchetto, carrello (0,72) */}
        <g transform={L(0.72)}>
          <path d="M-200 1240 H1280 V2200 H-200 Z" fill="url(#fu-ground)" />
          <ellipse cx="140" cy="1300" rx="360" ry="70" fill="#F2A040" opacity=".12" />
          <rect x="300" y="900" width="320" height="340" fill="#0A0806" stroke={K} strokeWidth="8" />
          <rect x="300" y="900" width="320" height="340" fill="#F2C870" opacity={0.25 * door} />
          {/* due ante: quella destra si socchiude */}
          <rect x="304" y="904" width="156" height="332" fill="url(#fu-door)" stroke={K} strokeWidth="6" />
          <g transform={`translate(616 904) scale(${1 - door * 0.45} 1) translate(-616 -904)`}>
            <rect x="460" y="904" width="156" height="332" fill="url(#fu-door)" stroke={K} strokeWidth="6" />
            <path d="M480 930 V1210" stroke="#8A5A44" strokeWidth="4" opacity=".6" />
          </g>
          {[960, 1180].map((y) => <path key={y} d={`M310 ${y} H610`} stroke="#3A1E14" strokeWidth="5" opacity=".7" />)}
          {/* catena e lucchetto */}
          {lockFall < 1 && (
            <g>
              <path d={`M430 1040 Q460 ${1060 + melt * 30} 490 1040`} stroke="#9AA0A4" strokeWidth="10" fill="none" strokeDasharray="14 5" opacity={1 - lockFall} />
              <g transform={`translate(460 ${1070 + lockFall * lockFall * 160}) rotate(${lockFall * 40})`}>
                <path d="M-18 -10 V-30 A18 18 0 0 1 18 -30 V-10" stroke="url(#fu-metal)" strokeWidth="8" fill="none" />
                <path d={`M-28 -10 H28 V${30 - melt * 16} Q0 ${42 - melt * 10} -28 ${30 - melt * 16} Z`} fill={melt > 0.2 ? '#E87A3A' : '#B8962E'} stroke={K} strokeWidth="5" />
                <circle cx="0" cy="8" r="5" fill={K} />
              </g>
            </g>
          )}
          {lockFall >= 1 && (
            <g transform="translate(470 1236)">
              <ellipse cx="0" cy="0" rx="40" ry="8" fill="#5A3A20" />
              <path d="M-20 0 Q0 -18 20 0" fill="#7A6A5A" stroke={K} strokeWidth="4" />
            </g>
          )}
          {/* la termite che brucia */}
          {burning && (
            <g>
              <Glow id="fu-th" x={460} y={1070} r={340} t={t} color="#FFFFFF" amp={0.2} rate={30} opacity={0.9 * spark} />
              <Glow id="fu-th2" x={460} y={1070} r={180} t={t} color="#FFE8B0" amp={0.2} rate={23} opacity={spark} />
              <Embers t={t} x={460} y={1080} w={90} h={300} seed={5} n={30} hot="#FFFFFF" warm="#FFD070" drift={180} />
              <Embers t={t + 0.4} x={460} y={1090} w={200} h={200} seed={9} n={20} hot="#FFF4D8" warm="#F2A040" drift={-220} />
              {Array.from({ length: 10 }, (_, i) => {
                const a = (i / 10) * Math.PI * 2 + t * 6;
                const len = 40 + 30 * Math.sin(t * 20 + i);
                return <path key={i} d={`M${460 + Math.cos(a) * 20} ${1070 + Math.sin(a) * 20} l${Math.cos(a) * len} ${Math.sin(a) * len}`} stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity={0.8 * spark} />;
              })}
            </g>
          )}
          {/* riflesso della luce della termite sulla facciata */}
          <rect x="-200" y="700" width="1480" height="600" fill="#FFF4D8" opacity={0.12 * spark} />
          {/* torcia a terra accanto al carrello, con il fascio verso la finestra */}
          <Beam id="fu-torch" x={585} y={1214} t={t} length={460} spread={170} color="#FFF4D8" angle={-42 + torchA} opacity={0.55 * torch} />
          <g transform="translate(585 1226) rotate(-42)">
            <rect x="-70" y="-12" width="60" height="24" rx="6" fill="#2A2E32" stroke={K} strokeWidth="4" />
            <path d="M-10 -16 L10 -20 V20 L-10 16 Z" fill="url(#fu-metal)" stroke={K} strokeWidth="4" />
            <ellipse cx="10" cy="0" rx="4" ry="18" fill="#FFF6D8" opacity={0.3 + 0.7 * torch} />
          </g>
          <Glow id="fu-tg" x={595} y={1216} r={70} t={t} color="#FFF4D8" amp={0.05} rate={6} opacity={0.7 * torch} />
          {/* carrello a mano */}
          <g transform="translate(680 1250)">
            <Ombra id="fu" x={0} y={0} rx={110} ry={14} />
            <path d="M-50 0 V-280 Q-50 -300 -30 -300" stroke="url(#fu-metal)" strokeWidth="14" fill="none" />
            <path d="M-50 0 V-280 Q-50 -300 -30 -300" stroke={K} strokeWidth="3" fill="none" opacity=".6" />
            <path d="M-50 -6 H60" stroke="url(#fu-metal)" strokeWidth="14" />
            <circle cx="-40" cy="-10" r="26" fill="#1A1A1A" stroke={K} strokeWidth="6" />
            <circle cx="-40" cy="-10" r="10" fill="url(#fu-metal)" />
          </g>
        </g>

        {/* PIANO 4 — recinzione a rete con un varco tagliato, in primo piano (1,25) */}
        <g transform={L(1.25)}>
          <g>
            {[-100, 1180].map((x) => <path key={x} d={`M${x} 1300 V2000`} stroke="#4A4E54" strokeWidth="18" />)}
            <path d="M-120 1320 H1200" stroke="#4A4E54" strokeWidth="12" />
            {Array.from({ length: 30 }, (_, i) => {
              const x = -100 + i * 44;
              const inHole = x > 360 && x < 720;
              return inHole ? null : (
                <path key={i} d={`M${x} 1320 L${x + 180} 1960 M${x + 180} 1320 L${x} 1960`} stroke="#6A6E74" strokeWidth="3" opacity=".75" />
              );
            })}
            {/* varco tagliato: lembi piegati */}
            <path d="M360 1320 Q420 1500 380 1700 L360 1960 M720 1320 Q660 1500 700 1700 L720 1960" stroke="#6A6E74" strokeWidth="5" fill="none" />
            <path d="M360 1320 L400 1360 L370 1400 L410 1440 M720 1320 L680 1360 L710 1400" stroke="#6A6E74" strokeWidth="4" fill="none" />
            {/* cartello sulla rete */}
            <rect x="600" y="1520" width="220" height="130" fill="#F2F0E4" stroke={K} strokeWidth="6" />
            <rect x="600" y="1520" width="220" height="40" fill="#C83A2A" />
            <text x="710" y="1550" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="26" fill="#FFFFFF">PERICOLO</text>
            <text x="710" y="1600" textAnchor="middle" fontFamily="sans-serif" fontWeight="800" fontSize="20" fill="#1A1A1A">VIETATO</text>
            <text x="710" y="1626" textAnchor="middle" fontFamily="sans-serif" fontWeight="800" fontSize="20" fill="#1A1A1A">L'ACCESSO</text>
          </g>
        </g>

        {/* PIANO 5 — falene al lampione e particelle (1,5–1,8) */}
        <g transform={L(1.5)}>
          {Array.from({ length: 7 }, (_, i) => {
            const a = t * (2.2 + i * 0.3) + i;
            return <circle key={i} cx={140 + Math.cos(a) * (36 + i * 6)} cy={820 + Math.sin(a * 1.4) * (26 + i * 4)} r="3" fill="#FFE0A0" opacity=".85" />;
          })}
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="fu-near" t={t} color="#C8D4E8" n={6} r0={60} r1={150} opacity={0.1} />
        </g>
      </g>
      <Finish id="fu" tint="#142235" tintOpacity={0.12} />
    </svg>
  );
};

