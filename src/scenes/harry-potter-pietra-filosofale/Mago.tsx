import React from 'react';
import { camera, eio, eo, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Embers, Fire, Glow, Lightning, NearMotes, Rain, WaveBand, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K } from './Comuni';

// Sei un mago: notte di tempesta, una casupola su uno scoglio in mezzo al mare; la porta buttata giù, dentro il fuoco;
// sul tavolo una torta di compleanno un po' storta e un ombrello rosa.
// Piani: cielo e lampi (0,2) · mare lontano (0,4) · scoglio e casupola (0,6) · interno con torta e ombrello (0,85) · onde in primo piano (1,2) · pioggia (1,6)

export const Mago: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const door = eio(seg(t, 0.6, 1.2)); // la porta cade: arriva Hagrid
  const flash = flashAt(t, [0.7, cues[2] + 0.4]);
  const truth = eo(seg(t, cues[1], cues[1] + 1)); // «Harry è un mago»: il fuoco divampa, scintille
  const sw = Math.sin(t * 2) * 10;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="mg" />
        <Lin id="mg-sky" stops={[[0, '#05060E'], [0.5, '#141630'], [1, '#262A48']]} />
        <Lin id="mg-rock" x2={1} y2={0} stops={[[0, '#2A2834'], [0.6, '#4A4854'], [1, '#1E1C28']]} />
        <Lin id="mg-in" stops={[[0, '#3A2414'], [1, '#1A100A']]} />
        <Lin id="mg-sea" stops={[[0, '#1E2A44'], [1, '#0A0E1E']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#mg-sky)" />
          <rect x="-200" y="-200" width="1480" height="1500" fill="#D8E2F0" opacity={flash * 0.3} />
          <Lightning x={860} y={540} h={420} flash={flash} seed={6} />
        </g>
        <g transform={L(0.4, 0, sw * 0.3)}>
          <WaveBand t={t} y={1080} fill="url(#mg-sea)" foam="#8A9AB8" amp={40} w={240} speed={70} bob={8} foamWidth={4} foamOpacity={0.5} />
          <Rain t={t} level="far" seed={7} color="#7A88A8" opacity={0.4} angle={20} />
        </g>
        {/* scoglio e casupola con la porta abbattuta */}
        <g transform={L(0.6)}>
          <path d="M60 1240 Q120 1060 260 1040 L840 1030 Q980 1060 1040 1240 Z" fill="url(#mg-rock)" stroke={K} strokeWidth="9" />
          <path d="M240 1040 V720 L540 560 L840 720 V1040 Z" fill="#4A4038" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M210 740 L540 540 L870 740" fill="none" stroke="#2A2420" strokeWidth="26" strokeLinejoin="round" />
          <path d="M760 640 V560 H800 V660" fill="#3A322C" stroke={K} strokeWidth="6" />
          {/* interno illuminato visto dalla porta */}
          <rect x="300" y="780" width="480" height="260" fill="url(#mg-in)" stroke={K} strokeWidth="7" />
          <Glow id="mg-in-g" x={420} y={960} r={300} t={t} color="#FFA050" amp={0.12} rate={6} opacity={0.5 + 0.3 * truth} />
          <Fire id="mg-fire" t={t} x={380} y={1030} scale={0.7 + 0.25 * truth} outline={K} />
          <path d="M320 1036 H460" stroke="#2A1C10" strokeWidth="10" />
          {/* torta storta (accento sulle candeline) e ombrello rosa */}
          <path d="M520 1000 H780 V1036 H520 Z" fill="#6A4A30" stroke={K} strokeWidth="6" />
          <g transform="translate(620 960) rotate(-5)">
            <rect x="-70" y="-10" width="140" height="50" rx="10" fill="#F2B0C0" stroke={K} strokeWidth="6" />
            <path d="M-70 0 Q-40 14 -10 0 Q20 14 50 0 Q66 8 70 0" fill="none" stroke="#FFF" strokeWidth="6" />
            <path d="M-40 26 q10 -10 20 0 q10 10 20 0 q10 -10 20 0" stroke="#3A8A54" strokeWidth="5" fill="none" />
            {[-30, 0, 30].map((x) => (
              <g key={x}>
                <rect x={x - 4} y="-36" width="8" height="26" fill="#F4F1E6" stroke={K} strokeWidth="2" />
                <path d={`M${x} -54 q6 8 0 16 q-6 -8 0 -16 Z`} fill={P.accento} />
              </g>
            ))}
          </g>
          <g transform="translate(730 900) rotate(30)">
            <path d="M0 -90 V60 q0 14 -14 14" stroke={K} strokeWidth="6" fill="none" />
            <path d="M-30 -90 Q0 -40 30 -90 L10 40 H-10 Z" fill="#E880A8" stroke={K} strokeWidth="5" />
          </g>
          {/* porta buttata giù */}
          <g transform={`rotate(${-80 * door} 300 1040)`}>
            <rect x="300" y="780" width="150" height="260" fill="#6A5038" stroke={K} strokeWidth="7" />
            {[0, 1, 2].map((i) => <path key={i} d={`M${320 + i * 44} 790 V1030`} stroke="#4A3828" strokeWidth="6" />)}
          </g>
          <Embers t={t} x={380} y={980} w={60} h={300} seed={4} n={10 + Math.round(10 * truth)} drift={60} />
        </g>
        {/* onde che sbattono sullo scoglio */}
        <g transform={L(1.2, 0, sw)}>
          <WaveBand t={t} y={1360} fill="url(#mg-sea)" foam="#C8D4E8" amp={110} w={420} speed={140} bob={18} ph={2} foamWidth={10} foamOpacity={0.8} />
          <WaveBand t={t} y={1640} fill="#060A16" foam="#A8B4D0" amp={150} w={560} speed={180} bob={24} ph={3} foamWidth={12} foamOpacity={0.7} />
        </g>
        <g transform={L(1.6)}>
          <Rain t={t} level="near" seed={11} color="#B8C4D8" opacity={0.45} angle={20} />
          <NearMotes id="mg-near" t={t} color="#B8C4D8" n={5} y0={1300} opacity={0.07} />
        </g>
      </g>
      <Finish id="mg" tint="#1E1A3A" tintOpacity={0.12} />
    </svg>
  );
};
