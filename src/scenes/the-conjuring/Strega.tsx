import React from 'react';
import { camera, eo, lerp, seg } from '../../lib/anim';
import { Clouds, Fog, Glow, Moon, NearMotes, Stars } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Albero, ConjDefs, Corvo, Fattoria, K, Quadrante, TINT_NOTTE } from './Comuni';

// La strega dell'albero: il grande albero davanti alla fattoria, di notte nella nebbia, con la luna dietro i rami. Su
// «lì viveva Bathsheba, una strega» una nuvola copre la luna e i corvi si girano; su «si impiccò alle tre e sette» il pezzo
// di corda sfilacciata sul ramo basso dondola e l'orologio da taschino appeso al chiodo del tronco si ferma alle 3:07,
// acceso d'oro; su «maledisse chiunque prendesse la sua terra» crepe nere corrono nella terra dalle radici fino alla fattoria
// lontana, e le sue finestre si spengono. Mai la strega, né figure o sagome: solo l'albero, la corda, l'orologio, la lapide.
// Piani: cielo e luna (0,15) · campi e fattoria lontana (0,35) · albero (0,6) · lapide e radici (0,9) · erba e nebbia (1,25) · corvi in volo (1,5)

export const Strega: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tCloud = griglia(cues[0] + 0.6);
  const cloud = eo(seg(t, tCloud, tCloud + 2.4));
  const tStop = griglia(cues[1] + 2.4);
  const run = seg(t, 0, tStop);
  const watch = t >= tStop ? 3 + 7 / 60 : lerp(2 + 40 / 60, 3 + 7 / 60, 1 - (1 - run) ** 2);
  const gold = eo(seg(t, tStop, tStop + 0.3));
  const rope = 1 + 1.5 * Math.sin(Math.PI * seg(t, tStop - 1.2, tStop + 1.6));
  const tCurse = griglia(cues[2] + 0.3);
  const curse = eo(seg(t, tCurse, tCurse + 2.2));
  const lightsOut = 1 - eo(seg(t, tCurse + 1.6, tCurse + 2.2));
  // crepe che corrono dalle radici alla fattoria lontana
  const cracks = ['M460 1240 Q600 1220 700 1190 Q800 1170 860 1150', 'M520 1260 Q700 1250 820 1210 Q900 1180 950 1150', 'M420 1250 Q300 1240 180 1200'];

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="st" />
        <ConjDefs id="st" />
        <Lin id="st-sky" stops={[[0, '#060A14'], [0.5, '#141E30'], [0.8, '#2A3448'], [1, '#3A4250']]} />
        <Lin id="st-ground" stops={[[0, '#1E2420'], [1, '#0A0E0C']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.15)}>
          <rect x="-300" y="-200" width="1700" height="1500" fill="url(#st-sky)" />
          <Stars t={t} seed={13} n={36} y={0} h={700} color="#C8D0E0" />
          <Moon id="st-moon" x={700} y={820} r={110} t={t} color="#E8EEF2" halo="#9FB8D0" />
          <g opacity={cloud}>
            <Clouds id="st-cl" t={t} color="#1A2230" seed={9} n={4} y={760} h={140} speed={6} />
          </g>
          <rect x="-300" y="-200" width="1700" height="1500" fill="#000" opacity={0.25 * cloud} />
        </g>
        <g transform={L(0.35)}>
          <path d="M-300 1120 Q300 1080 700 1110 Q1000 1130 1400 1100 V1400 H-300 Z" fill="#141A1C" />
          <Fattoria id="st-f" x={900} y={1150} s={0.28} t={t} lit={[0.9 * lightsOut, 0.7 * lightsOut, 0.8 * lightsOut, 0, 0, 0]} night={1} wall={['#4A4E56', '#2A2E34']} />
          <Fog id="st-fog1" t={t} y={1120} rx={900} ry={60} color="#5A6A7A" opacity={0.3} />
        </g>
        {/* il grande albero con il ramo basso e la corda */}
        <g transform={L(0.6)}>
          <path d="M-300 1180 Q400 1150 1400 1190 V1500 H-300 Z" fill="url(#st-ground)" />
          <Albero id="st" x={470} y={1260} s={0.49} t={t} sway={0.8} reach={1.3} depth={4} rim="#9FB8D0" />
          {/* il ramo basso verso destra e il pezzo di corda sfilacciata */}
          <path d="M490 1040 Q620 1000 790 1018" stroke={K} strokeWidth="34" fill="none" strokeLinecap="round" />
          <path d="M490 1040 Q620 1000 790 1018" stroke="#3E3832" strokeWidth="22" fill="none" strokeLinecap="round" />
          <path d="M500 1030 Q620 992 780 1010" stroke="#9FB8D0" strokeWidth="4" fill="none" opacity=".4" />
          <g transform={`translate(720 1010) rotate(${Math.sin(t * 1.4) * 5 * rope})`}>
            <path d="M-14 0 H14" stroke="#6A5A3A" strokeWidth="14" />
            <path d="M0 4 Q5 60 -2 118" stroke="#8A7A5A" strokeWidth="9" fill="none" />
            <path d="M-2 118 l-9 24 M-2 118 l2 28 M-2 118 l11 21" stroke="#8A7A5A" strokeWidth="4" />
          </g>
          {/* l'orologio da taschino appeso al chiodo del tronco */}
          <g transform={`translate(478 1070) rotate(${Math.sin(t * 1.1) * 3})`}>
            <path d="M0 -40 V0" stroke="url(#st-brass)" strokeWidth="4" strokeDasharray="5 3" />
            <circle cx="0" cy="-42" r="5" fill="#8A8A86" />
            <Quadrante id="st" x={0} y={44} r={42} h={watch} stopped={gold} />
            <circle cx="0" cy="-2" r="7" fill="url(#st-brass)" stroke={K} strokeWidth="3" />
          </g>
          {/* corvi sui rami */}
          <Corvo x={350} y={930} s={0.85} t={t + (cloud > 0.2 ? 1.6 : 0)} ph={0} />
          <Corvo x={780} y={1010} s={0.8} t={t} ph={2} flip />
        </g>
        {/* la lapide del 1863 tra le radici, e le crepe della maledizione */}
        <g transform={L(0.9)}>
          {cracks.map((d, i) => (
            <path key={i} d={d} stroke="#050505" strokeWidth={10 - i * 2} fill="none" strokeLinecap="round"
              strokeDasharray="900" strokeDashoffset={900 * (1 - seg(curse, i * 0.15, 0.7 + i * 0.15))} />
          ))}
          {cracks.map((d, i) => (
            <path key={`g${i}`} d={d} stroke="#5A2A3A" strokeWidth={22 - i * 4} fill="none" strokeLinecap="round" opacity={0.25 * curse}
              strokeDasharray="900" strokeDashoffset={900 * (1 - seg(curse, i * 0.15, 0.7 + i * 0.15))} />
          ))}
          <g transform="translate(200 1250) rotate(-7)">
            <path d="M-80 0 V-150 Q-80 -210 0 -214 Q80 -210 80 -150 V0 Z" fill="#5A5E5E" stroke={K} strokeWidth="8" />
            <path d="M-70 -150 Q-70 -200 0 -204" stroke="#9FB8D0" strokeWidth="4" fill="none" opacity=".5" />
            <text x="0" y="-110" fontSize="40" textAnchor="middle" fontFamily="serif" fontWeight="700" fill="#2A2E2E">1863</text>
            <path d="M-40 -70 H40 M-30 -50 H30" stroke="#2A2E2E" strokeWidth="5" />
            <path d="M-80 -40 Q-50 -60 -40 -20 M60 -120 Q70 -100 80 -110" stroke="#3A5A3A" strokeWidth="8" fill="none" />
          </g>
          {curse > 0 && <Glow id="st-cg" x={700} y={1200} r={260} t={t} color="#5A2A3A" amp={0.1} rate={2} opacity={0.35 * curse} />}
        </g>
        <g transform={L(1.25)}>
          <path d="M-300 1300 Q400 1280 1400 1310 V2200 H-300 Z" fill="#070A08" />
          {Array.from({ length: 40 }, (_, i) => {
            const x = -200 + i * 38;
            const h = 100 + ((i * 71) % 170);
            const w = Math.sin(t * 1.1 + i * 0.5) * 16;
            return <path key={i} d={`M${x} 1720 Q${x + 6} ${1720 - h / 2} ${x + w} ${1720 - h}`} stroke="#141E16" strokeWidth="10" fill="none" strokeLinecap="round" />;
          })}
          <Fog id="st-fog2" t={t} y={1330} rx={800} ry={90} color="#8A9AAA" opacity={0.22} ph={1} />
        </g>
        <g transform={L(1.5)}>
          {/* due corvi che volano via quando la nuvola copre la luna */}
          {cloud > 0 && [0, 1].map((i) => {
            const p = seg(t, tCloud + i * 0.3, tCloud + 3 + i * 0.3);
            const x = lerp(320 + i * 60, 1200, p);
            const y = lerp(900, 700 + i * 60, p);
            const flap = Math.sin(t * 16 + i) * 22;
            return (
              <g key={i} transform={`translate(${x} ${y})`} opacity={p < 1 ? 1 : 0}>
                <path d={`M-40 ${flap} Q-20 -6 0 0 Q20 -6 40 ${flap}`} stroke="#0A0C10" strokeWidth="9" fill="none" strokeLinecap="round" />
              </g>
            );
          })}
          <NearMotes id="st-near" t={t} color="#9FB8D0" n={6} y0={1000} opacity={0.08} />
        </g>
      </g>
      <Finish id="st" tint={TINT_NOTTE} tintOpacity={0.14} />
    </svg>
  );
};

