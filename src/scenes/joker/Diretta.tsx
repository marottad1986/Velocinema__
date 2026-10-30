import React from 'react';
import { camera, eo, rng, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { ANTON, SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { K, Tv } from './Comuni';

// In diretta: lo studio visto dal palco, la scrivania, le luci, la telecamera con la lucina rossa; sulla prima frase un
// televisore di casa mostra in sovrimpressione «JOKER» (accento); su «confessa i tre omicidi» le luci dello studio si
// abbassano e rimane un solo occhio di bue sulla poltrona vuota; su «spara a Murray» un lampo bianco, poi la scritta «IN
// ONDA» si spegne e il televisore diventa disturbo con «COLLEGAMENTO INTERROTTO». Nessuna persona, nessuna arma in vista.
// Piani: sipario e luci (0,25) · scrivania e poltrone (0,6) · televisore (0,9) · telecamera (1,2) · pulviscolo (1,6)

const r = rng(13);
const NOISE = Array.from({ length: 120 }, () => ({ x: r() * 250 - 160, y: r() * 220 - 110, w: 4 + r() * 20 }));

export const Diretta: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const name = eo(seg(t, cues[0] + 1, cues[0] + 1.6)); // «Joker»
  const spot = eo(seg(t, cues[1], cues[1] + 1)); // resta un solo occhio di bue
  const shot = cues[2] + 1.2;
  const flash = seg(t, shot, shot + 0.05) * (1 - seg(t, shot + 0.12, shot + 0.6)); // lampo con dissolvenza
  const cut = seg(t, shot + 0.3, shot + 0.5); // collegamento interrotto

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="dr" />
        <Lin id="dr-curtain" x2={1} y2={0} stops={[[0, '#5A1A3A'], [0.5, '#8A2A5A'], [1, '#5A1A3A']]} />
        <radialGradient id="dr-spot" cx=".5" cy="0" r="1"><stop offset="0" stopColor="#FFF4D8" stopOpacity=".7" /><stop offset="1" stopColor="#FFF4D8" stopOpacity="0" /></radialGradient>
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#dr-curtain)" />
          {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${-180 + i * 95} -200 V1400`} stroke="#3A0E26" strokeWidth="10" opacity=".5" />)}
          {[120, 400, 680, 960].map((x, i) => <g key={x}><circle cx={x} cy="560" r="22" fill="#FFF4D8" opacity={1 - spot * (i === 1 ? 0 : 0.85)} /><Glow id={`dr-l${i}`} x={x} y={560} r={200} t={t} color="#FFF4D8" amp={0.04} rate={2} opacity={0.4 * (1 - spot * (i === 1 ? 0 : 0.9))} /></g>)}
          <rect x="-200" y="-200" width="1480" height="2400" fill="#000" opacity={0.55 * spot + 0.3 * cut} />
          <g transform="translate(860 680)">
            <rect x="-90" y="-26" width="180" height="52" rx="8" fill="#2A0A0A" stroke={K} strokeWidth="5" />
            <text x="0" y="12" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="32" fill={cut ? '#3A1A1A' : '#FF4A3A'}>IN ONDA</text>
            <Glow id="dr-air" x={0} y={0} r={140} t={t} color="#FF4A3A" amp={0.1} rate={3} opacity={0.5 * (1 - cut)} />
          </g>
        </g>
        <g transform={L(0.6)}>
          <path d="M-200 1100 H1280 V2200 H-200 Z" fill="#1A1218" />
          <path d="M220 560 L120 1180 H500 L400 560 Z" fill="url(#dr-spot)" opacity={spot} />
          <rect x="560" y="980" width="440" height="160" rx="10" fill="#3A2A20" stroke={K} strokeWidth="7" />
          <rect x="560" y="960" width="440" height="30" fill="#5A4030" stroke={K} strokeWidth="6" />
          <g transform="translate(310 1100)">
            <path d="M-110 0 V-150 Q-110 -200 -60 -200 H60 Q110 -200 110 -150 V0 Z" fill="#2A4A6A" stroke={K} strokeWidth="7" />
            <rect x="-130" y="-70" width="260" height="70" rx="14" fill="#3A5A7A" stroke={K} strokeWidth="6" />
          </g>
        </g>
        {/* il televisore di casa che trasmette la diretta */}
        <g transform={L(0.9)}>
          <Tv x={760} y={830} s={0.55} glow={1}>
            {!cut ? (
              <g>
                <rect x="-160" y="-110" width="250" height="220" fill="#3A1A2A" />
                <path d="M-150 60 H80 V110 H-150 Z" fill="#3A2A20" />
                {name > 0 && (
                  <g transform={`translate(-35 -20) scale(${name})`}>
                    <rect x="-90" y="-28" width="180" height="48" fill={P.accento} />
                    <text x="0" y="12" textAnchor="middle" fontFamily={ANTON} fontSize="38" fill="#F2E6D0">JOKER</text>
                  </g>
                )}
              </g>
            ) : (
              <g>
                <rect x="-160" y="-110" width="250" height="220" fill="#3A3A3A" />
                {NOISE.map((n, i) => <rect key={i} x={n.x + ((t * 997 + i * 37) % 30) - 15} y={n.y} width={n.w} height="3" fill={(i + Math.floor(t * 30)) % 2 ? '#E8E8E8' : '#141414'} />)}
                <rect x="-155" y="-50" width="240" height="100" fill="#14181C" opacity={cut} />
                <text x="-35" y="-8" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="30" fill="#E8E8E8" opacity={cut}>COLLEGAMENTO</text>
                <text x="-35" y="30" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="30" fill="#E8E8E8" opacity={cut}>INTERROTTO</text>
              </g>
            )}
          </Tv>
        </g>
        <g transform={L(1.2)}>
          <g transform="translate(180 1600)">
            <rect x="-150" y="-180" width="300" height="200" rx="16" fill="#3A3A40" stroke={K} strokeWidth="8" />
            <rect x="150" y="-140" width="120" height="120" fill="#2A2A30" stroke={K} strokeWidth="7" />
            <circle cx="120" cy="-160" r="12" fill={cut ? '#3A1A1A' : '#FF3A2A'} />
            <path d="M0 20 V400 M0 220 L-120 420 M0 220 L120 420" stroke={K} strokeWidth="18" />
          </g>
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 580, x0: 360, x1: 460 }} bottom={{ y: 1180, x0: 140, x1: 480 }} seed={4} n={26} color="#FFF4D8" boost={spot * 0.5} />
          <NearMotes id="dr-near" t={t} color="#FFE8D0" n={6} opacity={0.08} />
        </g>
      </g>
      <rect width="1080" height="1920" fill="#FFFFFF" opacity={0.7 * flash} />
      <Finish id="dr" tint="#2A1A2A" tintOpacity={0.14} />
    </svg>
  );
};
