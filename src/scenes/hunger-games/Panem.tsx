import React from 'react';
import { camera, eo, eob, mod, rng, seg } from '../../lib/anim';
import { ANTON } from '../../lib/fonts';
import { Beam, Glow, NearMotes, Smoke, Stars, Fog } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { EMBER, HGDefs, K, Shack } from './Comuni';

// Un gioco mortale in TV: notte sul Distretto 12, villaggio di minatori. Sul fondo, oltre le montagne, le torri di
// Capitol City che brillano. Eventi: 1ª frase i riflettori di Capitol City si accendono e spazzano il cielo sopra il
// distretto (chi comanda); 2ª frase il maxischermo della piazza si accende con due biglietti piegati (due ragazzi per
// distretto); 3ª frase sullo schermo compare «HUNGER GAMES» con il numero 74 e una fiamma arancione.
// Piani: cielo e Capitol City (0,25) · montagne e torre della miniera (0,45) · piazza con lo schermo e le baracche (0,65)
//        · recinzione elettrica in primo piano (1,2) · cenere di carbone vicina (1,6)

const rr = rng(911);
const TOWERS = Array.from({ length: 15 }, (_, i) => ({ x: 130 + i * 34 + rr() * 8, h: 70 + Math.sin((i / 14) * Math.PI) * 170 + rr() * 40, w: 26 + rr() * 14 }));
const ASH = Array.from({ length: 40 }, () => ({ x: rr() * 1300 - 110, s: 2 + rr() * 4, sp: 0.04 + rr() * 0.05, ph: rr(), sw: 20 + rr() * 40 }));

export const Panem: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const beams = eo(seg(t, griglia(cues[0] + 0.3), griglia(cues[0] + 0.3) + 0.8));
  const screenOn = eo(seg(t, griglia(cues[1] + 0.2), griglia(cues[1] + 0.2) + 0.4));
  const slips = eob(seg(t, griglia(cues[1] + 0.6), griglia(cues[1] + 0.6) + 0.5), 1.6);
  const tA = griglia(cues[2] + 0.5);
  const title = eob(seg(t, tA, tA + 0.5), 1.5);
  const flick = screenOn * (0.92 + 0.08 * Math.sin(t * 23) * Math.sin(t * 7));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pa" />
        <HGDefs id="pa" />
        <Lin id="pa-sky" stops={[[0, '#060A18'], [0.3, '#16223C'], [0.48, '#3A3656'], [0.56, '#8A5A4A']]} />
        <Lin id="pa-ground" stops={[[0, '#4A4E58'], [0.4, '#2A2E36'], [1, '#0C0D10']]} />
        <Lin id="pa-mtn" stops={[[0, '#1E2430'], [1, '#2E3240']]} />
        <Lin id="pa-scr" stops={[[0, '#1A3A5A'], [1, '#0A1828']]} />
        <Lin id="pa-pole" x2={1} y2={0} stops={[[0, '#5A6068'], [0.5, '#3A4048'], [1, '#1A1E22']]} />
        <radialGradient id="pa-cap" cx=".5" cy="1" r=".8">
          <stop offset="0" stopColor="#FFE0A0" stopOpacity=".9" />
          <stop offset=".5" stopColor="#E8A060" stopOpacity=".35" />
          <stop offset="1" stopColor="#E8A060" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo notturno e Capitol City che brilla oltre le montagne (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#pa-sky)" />
          <Stars t={t} seed={4} n={36} y={60} h={520} color="#E8EEF4" size={0.8} />
          <ellipse cx="400" cy="1060" rx="520" ry="360" fill="url(#pa-cap)" opacity={0.75 + 0.25 * beams} />
          {/* riflettori di Capitol City */}
          {[[240, -118, 0.5], [400, -92, 0.9], [560, -66, 1.3]].map(([bx, a, ph], i) => (
            <Beam key={i} id={`pa-b${i}`} x={bx} y={900} t={t + ph * 2} length={900} spread={90} color="#FFF0C8" angle={a} sweep={12} sweepRate={0.5} opacity={0.32 * beams} />
          ))}
          {/* torri di vetro */}
          {TOWERS.map((tw, i) => (
            <g key={i}>
              <path d={`M${tw.x} 1060 V${1060 - tw.h} l${tw.w / 2} -${tw.w * 1.6} l${tw.w / 2} ${tw.w * 1.6} V1060 Z`} fill={i % 3 ? '#D8A860' : '#F0C878'} />
              <path d={`M${tw.x + tw.w * 0.62} 1060 V${1060 - tw.h} l${-tw.w * 0.12} ${-tw.w * 1.2}`} stroke="#A8783A" strokeWidth={tw.w * 0.3} opacity=".6" />
              <path d={`M${tw.x + tw.w / 2} ${1060 - tw.h - tw.w * 1.6} v-30`} stroke="#FFE8B0" strokeWidth="3" />
              <circle cx={tw.x + tw.w / 2} cy={1060 - tw.h - tw.w * 1.6 - 30} r="4" fill="#FFF4D8" opacity={0.5 + 0.5 * Math.sin(t * 2 + i)} />
              {Array.from({ length: Math.floor(tw.h / 22) }, (_, k) => (
                <rect key={k} x={tw.x + 4} y={1060 - tw.h + 10 + k * 22} width={tw.w - 8} height="5" fill="#FFF8E8" opacity={0.4 + 0.5 * ((k + i) % 3 === 0 ? Math.abs(Math.sin(t * 1.5 + k)) : 0.6)} />
              ))}
            </g>
          ))}
        </g>

        {/* PIANO 1 — montagne e torre di estrazione della miniera (0,45) */}
        <g transform={L(0.45)}>
          <path d="M-200 1080 L-40 1000 L80 1040 L180 1020 L320 1060 L460 1030 L620 1070 L760 960 L900 1010 L1040 940 L1280 1040 V1200 H-200 Z" fill="url(#pa-mtn)" />
          <path d="M620 1070 L760 960 L790 1000 L700 1070 Z M1040 940 L1080 990 L1000 1040 Z" fill="#3A4256" opacity=".7" />
          {/* torre della miniera con la ruota */}
          <g transform="translate(1010 1160) scale(0.8)" stroke={K} strokeLinejoin="round">
            <path d="M-80 0 L-20 -380 L20 -380 L80 0 M-60 -120 H60 M-45 -230 H45 M-70 -60 L40 -220 M70 -60 L-40 -220" fill="none" stroke="#3A3A40" strokeWidth="12" />
            <circle cx="0" cy="-390" r="46" fill="none" stroke="#4A4A52" strokeWidth="10" />
            {Array.from({ length: 6 }, (_, k) => <path key={k} d={`M0 -390 l${Math.cos(k + t * 0.6) * 44} ${Math.sin(k + t * 0.6) * 44}`} stroke="#4A4A52" strokeWidth="5" />)}
            <circle cx="0" cy="-390" r="8" fill="#6A6A72" />
            <circle cx="0" cy="-430" r="6" fill="#FF5A3A" opacity={0.5 + 0.5 * Math.sin(t * 3)} />
          </g>
          <Glow id="pa-red" x={1010} y={816} r={50} t={t} color="#FF5A3A" amp={0.2} rate={3} opacity={0.5} />
          <Fog id="pa-f1" t={t} y={1080} rx={800} ry={60} color="#5A5A66" opacity={0.4} speed={0.2} />
        </g>

        {/* PIANO 2 — la piazza: maxischermo, baracche con i camini, mucchi di carbone (0,65) */}
        <g transform={L(0.65)}>
          <path d="M-200 1130 Q540 1110 1280 1130 V2200 H-200 Z" fill="url(#pa-ground)" />
          {/* mucchi di carbone */}
          {[[90, 1200, 170], [980, 1210, 150]].map(([cx, cy, w], i) => (
            <g key={i}>
              <path d={`M${cx - w} ${cy} Q${cx - w * 0.3} ${cy - w * 0.9} ${cx + w * 0.1} ${cy - w * 0.7} Q${cx + w * 0.6} ${cy - w * 0.4} ${cx + w} ${cy} Z`} fill="#121316" stroke={K} strokeWidth="8" />
              {Array.from({ length: 9 }, (_, k) => <path key={k} d={`M${cx - w * 0.7 + k * w * 0.17} ${cy - 20 - ((k * 37) % 60)} l12 -8 l10 10 Z`} fill="#5A5E68" opacity=".7" />)}
            </g>
          ))}
          {/* baracche */}
          <Shack x={150} y={1290} w={230} h={150} wall="#4A4438" roof="#5A6068" win={0.7 + 0.3 * Math.sin(t * 2)} seed={2} />
          <Shack x={410} y={1300} w={200} h={140} wall="#3E3A30" roof="#4A5058" win={0} seed={5} />
          <Shack x={930} y={1300} w={230} h={150} wall="#4A4438" roof="#585E66" win={0.8} seed={9} />
          <Glow id="pa-w1" x={140} y={1190} r={90} t={t} color="#FFC870" amp={0.06} rate={5} opacity={0.5} />
          <Glow id="pa-w2" x={920} y={1200} r={90} t={t} color="#FFC870" amp={0.06} rate={4} opacity={0.5} />
          <Smoke id="pa-s1" t={t} x={70} y={1100} color="#6A6A74" n={8} rise={260} wind={160} r0={18} r1={70} speed={0.18} opacity={0.65} />
          <Smoke id="pa-s2" t={t} x={1010} y={1110} color="#6A6A74" n={8} rise={260} wind={160} r0={18} r1={70} speed={0.2} opacity={0.65} />
          {/* maxischermo sul traliccio */}
          <rect x="700" y="880" width="20" height="420" fill="url(#pa-pole)" stroke={K} strokeWidth="6" />
          <rect x="920" y="880" width="20" height="420" fill="url(#pa-pole)" stroke={K} strokeWidth="6" />
          <Glow id="pa-sg" x={810} y={790} r={400} t={t} color="#9FD0FF" amp={0.05} rate={8} opacity={0.45 * flick} />
          <rect x="650" y="680" width="320" height="210" rx="10" fill="#14181C" stroke={K} strokeWidth="10" />
          <rect x="664" y="694" width="292" height="182" fill="url(#pa-scr)" opacity={0.15 + 0.85 * flick} />
          {/* righe di scansione */}
          {Array.from({ length: 15 }, (_, k) => <rect key={k} x="664" y={694 + k * 12 + (mod(t * 40, 12))} width="292" height="2" fill="#000" opacity={0.15 * screenOn} />)}
          {/* due biglietti piegati */}
          <g opacity={screenOn * (1 - title)}>
            {[-1, 1].map((d) => (
              <g key={d} transform={`translate(${810 + d * 66} 790) rotate(${d * 8}) scale(${slips * 0.75})`}>
                <path d="M-60 -40 H60 V40 H-60 Z" fill="#F2E8D8" stroke={K} strokeWidth="5" />
                <path d="M-60 -40 L0 0 L60 -40" fill="none" stroke="#B8AC98" strokeWidth="4" />
              </g>
            ))}
          </g>
          {/* titolo dei giochi */}
          <g opacity={title} transform={`translate(810 790) scale(${0.7 + 0.3 * title}) translate(-810 -790)`}>
            <text x="810" y="768" textAnchor="middle" fontFamily={ANTON} fontSize="46" fill="#F2E8D8" letterSpacing="3">HUNGER GAMES</text>
            <text x="792" y="856" textAnchor="middle" fontFamily={ANTON} fontSize="80" fill={EMBER}>74</text>
            <path d={`M862 852 C844 822 868 806 862 780 C886 800 894 828 880 852 Z`} fill={EMBER} stroke={K} strokeWidth="3" transform={`translate(0 ${Math.sin(t * 9) * 2})`} />
          </g>
          <rect x="650" y="680" width="320" height="210" rx="10" fill="none" stroke="#8A9098" strokeWidth="3" opacity=".6" />
          {/* altoparlanti sul traliccio */}
          <rect x="670" y="900" width="56" height="44" rx="6" fill="#3A4048" stroke={K} strokeWidth="5" /><circle cx="698" cy="922" r="13" fill="#1A1E22" />
          {/* riflesso dello schermo sul selciato */}
          <ellipse cx="810" cy="1310" rx="220" ry="34" fill="#9FD0FF" opacity={0.18 * flick} />
          {/* binario dei carrelli */}
          <path d="M-200 1640 Q540 1600 1280 1650 M-200 1690 Q540 1650 1280 1700" stroke="#4A4A52" strokeWidth="7" fill="none" />
          {Array.from({ length: 16 }, (_, k) => <path key={k} d={`M${-150 + k * 95} 1615 l-6 90`} stroke="#2A2620" strokeWidth="10" />)}
          {/* carrello da miniera pieno di carbone */}
          <g transform="translate(250 1660) scale(1.3)">
            <path d="M-90 -100 H90 L74 -10 H-74 Z" fill="#4A3E34" stroke={K} strokeWidth="8" />
            <path d="M-86 -100 Q-40 -150 0 -120 Q40 -150 86 -100 Z" fill="#121316" stroke={K} strokeWidth="6" />
            <path d="M-80 -70 H80" stroke="#2A221C" strokeWidth="5" />
            <circle cx="-50" cy="0" r="22" fill="#2A2A30" stroke={K} strokeWidth="6" />
            <circle cx="50" cy="0" r="22" fill="#2A2A30" stroke={K} strokeWidth="6" />
          </g>
        </g>

        {/* PIANO 3 — recinzione elettrica che incornicia il primo piano (1,2) */}
        <g transform={L(1.2)}>
          {[-10, 1090].map((px, i) => (
            <g key={i}>
              <rect x={px - 30} y={1240 + i * 40} width="60" height="760" fill="#3A3A3E" stroke={K} strokeWidth="8" />
              <path d={`M${px - 10} ${1510 + (i % 2) * 20} V2000`} stroke="#8A8A90" strokeWidth="4" opacity=".5" />
            </g>
          ))}
          {[1520, 1600, 1680, 1760, 1840].map((wy, k) => (
            <g key={k}><path d={`M-10 ${wy} Q540 ${wy + 60} 1090 ${wy + 30}`} stroke="#0E0E12" strokeWidth="7" fill="none" />{Array.from({ length: 9 }, (_, b) => <path key={b} d={`M${100 + b * 110} ${wy + 30 + Math.sin(b) * 6} l-8 -8 m8 8 l8 -8 m-8 8 l-8 8 m8 -8 l8 8`} stroke="#0E0E12" strokeWidth="4" />)}</g>
          ))}
          {/* isolatori e cartello */}
          <g transform="translate(860 1590) rotate(-4)">
            <rect x="-90" y="-50" width="180" height="100" fill="#D8C068" stroke={K} strokeWidth="7" />
            <path d="M0 -34 L-14 2 H6 L-6 36 L22 -6 H2 L14 -34 Z" fill={K} />
          </g>
          <circle cx="1090" cy="1560" r="9" fill="#9FD0FF" opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 5))} />
        </g>

        {/* PIANO 4 — cenere di carbone che cade, particelle vicine (1,6) */}
        <g transform={L(1.6)}>
          {ASH.map((a, i) => {
            const p = mod(t * a.sp + a.ph, 1);
            return <circle key={i} cx={a.x + Math.sin(t + i) * a.sw} cy={640 + p * 1400} r={a.s} fill="#B8B8C0" opacity={0.5 * Math.sin(p * Math.PI)} />;
          })}
          <NearMotes id="pa-near" t={t} color="#A8A8B4" n={6} r0={60} r1={150} opacity={0.1} />
        </g>
      </g>
      <Finish id="pa" tint="#2A3038" tintOpacity={0.12} />
    </svg>
  );
};

