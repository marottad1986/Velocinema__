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
          <Lightning x={170} y={560} h={440} flash={flash} seed={6} />
        </g>
        <g transform={L(0.4, 0, sw * 0.3)}>
          <WaveBand t={t} y={1080} fill="url(#mg-sea)" foam="#8A9AB8" amp={40} w={240} speed={70} bob={8} foamWidth={4} foamOpacity={0.5} />
          <Rain t={t} level="far" seed={7} color="#7A88A8" opacity={0.4} angle={20} />
        </g>
        {/* scoglio e casupola: muro di pietra con la porta abbattuta e una finestra; dentro, il camino acceso */}
        <g transform={L(0.6)}>
          <path d="M40 1460 Q60 1150 200 1060 Q300 1030 540 1030 Q800 1030 900 1070 Q1030 1150 1040 1460 Z" fill="url(#mg-rock)" stroke={K} strokeWidth="9" />
          {[[160, 1200], [880, 1180], [330, 1120], [740, 1130]].map(([x, y], i) => <path key={i} d={`M${x - 50} ${y} q30 -24 70 -6 q30 20 50 4`} stroke="#1E1C28" strokeWidth="6" fill="none" />)}
          <path d="M210 740 L540 540 L870 740" fill="none" stroke="#2A2420" strokeWidth="26" strokeLinejoin="round" />
          <path d="M760 640 V560 H800 V660" fill="#3A322C" stroke={K} strokeWidth="6" />
          {/* interno, visto dalla porta (tavolo con torta e ombrello) e dalla finestra (camino con il fuoco) */}
          <rect x="250" y="760" width="580" height="280" fill="url(#mg-in)" />
          <Glow id="mg-in-g" x={700} y={900} r={300} t={t} color="#FFA050" amp={0.12} rate={6} opacity={0.5 + 0.3 * truth} />
          <path d="M640 940 V860 Q700 800 760 860 V940 Z" fill="#2A2420" stroke={K} strokeWidth="6" />
          <Fire id="mg-fire" t={t} x={700} y={936} scale={0.42 + 0.18 * truth} outline={K} />
          <path d="M470 1000 H610 V1040 H470 Z" fill="#6A4A30" stroke={K} strokeWidth="6" />
          <g transform="translate(530 970) rotate(-5) scale(0.75)">
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
          <g transform="translate(596 920) rotate(24) scale(0.7)">
            <path d="M0 -90 V60 q0 14 -14 14" stroke={K} strokeWidth="6" fill="none" />
            <path d="M-30 -90 Q0 -40 30 -90 L10 40 H-10 Z" fill="#E880A8" stroke={K} strokeWidth="5" />
          </g>
          {/* muro di pietra con i due vani (porta e finestra) */}
          <path fillRule="evenodd" d="M240 1040 V720 L540 560 L840 720 V1040 Z M470 1040 V820 H610 V1040 Z M640 940 V840 H770 V940 Z" fill="#5A5048" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          {[[300, 780], [380, 860], [300, 940], [700, 990], [780, 780], [690, 760]].map(([x, y], i) => <rect key={i} x={x - 34} y={y - 16} width="68" height="32" rx="6" fill="none" stroke="#3E3630" strokeWidth="5" />)}
          <path d="M640 840 H770 M705 840 V940 M640 890 H770" stroke={K} strokeWidth="6" />
          <path d="M460 816 H620" stroke="#3E3630" strokeWidth="12" />
          {/* la porta: buttata giù in avanti, resta a terra davanti alla soglia */}
          <path d={`M${470 - 30 * door} ${820 + 250 * door} H${610 + 30 * door} L610 1040 H470 Z`} fill="#6A5038" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          {[0, 1, 2].map((i) => <path key={i} d={`M${490 + i * 46 - (1 - i) * 10 * door} ${826 + 248 * door} L${494 + i * 46} 1034`} stroke="#4A3828" strokeWidth="6" />)}
          <Embers t={t} x={700} y={900} w={50} h={260} seed={4} n={10 + Math.round(10 * truth)} drift={60} />
        </g>
        {/* onde che sbattono sullo scoglio */}
        <g transform={L(1.2, 0, sw)}>
          {/* spruzzi contro lo scoglio, a ondate */}
          {[[90, 1300, 0], [990, 1290, 1.3], [520, 1330, 2.4]].map(([x, y, ph], i) => {
            const p = ((t * 0.55 + ph) % 1.6) / 1.6;
            return [0, 1, 2, 3, 4].map((k) => <circle key={`${i}${k}`} cx={x + (k - 2) * 40 * p} cy={y - 220 * Math.sin(Math.PI * p) * (0.6 + 0.1 * k)} r={26 - k * 3} fill="#E8EEF8" opacity={0.75 * (1 - p)} />);
          })}
          <path d="M-200 1420 H1280 V2200 H-200 Z" fill="#1A2440" />
          <WaveBand t={t} y={1360} fill="#24324F" foam="#DCE4F2" amp={110} w={420} speed={140} bob={18} ph={2} foamWidth={20} foamOpacity={0.9} />
          <WaveBand t={t} y={1640} fill="#141C34" foam="#C8D2E6" amp={150} w={560} speed={180} bob={24} ph={3} foamWidth={24} foamOpacity={0.85} />
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
