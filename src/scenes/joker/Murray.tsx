import React from 'react';
import { camera, eo, eob, seg } from '../../lib/anim';
import { Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { ANTON, SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { K, Tv } from './Comuni';

// L'invito in TV: lo studio del presentatore (palco, sipario, scrivania, telecamere, scritta «IN ONDA»); sulla prima
// frase le luci dello studio si accendono; su «la sua serata da comico finita male» un monitor mostra il piccolo palco di
// un locale con un microfono solo, e compare in sovrimpressione «JOKER» (accento); l'applausometro sale; su «Murray lo
// invita» sulla scrivania compare un biglietto d'invito. Nessuna persona.
// Piani: sipario (0,25) · scenografia con la città (0,45) · scrivania e poltrone (0,75) · monitor (0,95) · telecamera (1,25) · pulviscolo (1,6)

export const Murray: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const lights = eo(seg(t, 0.2, cues[0] + 1)); // lo studio si accende
  const clip = eo(seg(t, cues[1], cues[1] + 0.6)); // il video della serata
  const caption = eob(seg(t, cues[1] + 1.4, cues[1] + 2), 1.6); // «JOKER»
  const meter = eo(seg(t, cues[2] - 0.4, cues[2] + 1)); // l'applausometro
  const invite = eob(seg(t, cues[2] + 1, cues[2] + 1.6), 1.5);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="mu" />
        <Lin id="mu-curtain" x2={1} y2={0} stops={[[0, '#5A1A3A'], [0.5, '#8A2A5A'], [1, '#5A1A3A']]} />
        <Lin id="mu-floor" stops={[[0, '#3A2A3A'], [1, '#141016']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#mu-curtain)" />
          {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${-180 + i * 95} -200 V1400`} stroke="#3A0E26" strokeWidth="10" opacity=".5" />)}
          <rect x="-200" y="-200" width="1480" height="2400" fill="#000" opacity={0.6 * (1 - lights)} />
        </g>
        {/* scenografia: la città di notte su un pannello e la scritta IN ONDA */}
        <g transform={L(0.45)}>
          <rect x="60" y="560" width="960" height="380" fill="#141A30" stroke={K} strokeWidth="8" />
          {Array.from({ length: 12 }, (_, i) => <rect key={i} x={80 + i * 78} y={940 - (120 + ((i * 53) % 180))} width="66" height={120 + ((i * 53) % 180)} fill="#2A304A" />)}
          {Array.from({ length: 30 }, (_, i) => <rect key={`w${i}`} x={96 + (i % 12) * 78} y={860 - Math.floor(i / 12) * 40} width="10" height="14" fill="#F2C46A" opacity=".7" />)}
          <g transform="translate(860 610)">
            <rect x="-90" y="-26" width="180" height="52" rx="8" fill="#2A0A0A" stroke={K} strokeWidth="5" />
            <text x="0" y="12" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="32" fill={lights > 0.5 ? '#FF4A3A' : '#5A2A2A'}>IN ONDA</text>
            <Glow id="mu-air" x={0} y={0} r={140} t={t} color="#FF4A3A" amp={0.1} rate={3} opacity={0.5 * lights} />
          </g>
        </g>
        {/* scrivania, tazza e poltrone */}
        <g transform={L(0.75)}>
          <path d="M-200 1100 H1280 V2200 H-200 Z" fill="url(#mu-floor)" />
          <path d="M120 1100 Q540 1050 960 1100" stroke="#C9A24A" strokeWidth="6" fill="none" />
          <rect x="520" y="980" width="440" height="160" rx="10" fill="#3A2A20" stroke={K} strokeWidth="7" />
          <rect x="520" y="960" width="440" height="30" fill="#5A4030" stroke={K} strokeWidth="6" />
          <path d="M820 960 V920 H860 V960" fill="#F2E6D0" stroke={K} strokeWidth="4" />
          <g transform="translate(260 1080)">
            <path d="M-110 0 V-150 Q-110 -200 -60 -200 H60 Q110 -200 110 -150 V0 Z" fill="#2A4A6A" stroke={K} strokeWidth="7" />
            <rect x="-130" y="-70" width="260" height="70" rx="14" fill="#3A5A7A" stroke={K} strokeWidth="6" />
          </g>
          {invite > 0 && (
            <g transform={`translate(660 ${950 - 20 * invite}) rotate(-6) scale(${invite})`}>
              <rect x="-90" y="-40" width="180" height="80" rx="6" fill="#F2E6D0" stroke="#C9A24A" strokeWidth="5" />
              <text x="0" y="-6" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="22" fill={K}>INVITO</text>
              <text x="0" y="22" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="16" fill="#8A6A2A">Live with Murray</text>
            </g>
          )}
        </g>
        {/* il monitor con la serata da comico e la sovrimpressione JOKER, l'applausometro */}
        <g transform={L(0.95)}>
          <Tv x={330} y={790} s={0.72} glow={clip}>
            <g opacity={clip}>
              <rect x="-160" y="-110" width="250" height="220" fill="#1A1014" />
              <path d="M-160 110 H90 V60 H-160 Z" fill="#5A3A2A" />
              <circle cx="-35" cy="-60" r="70" fill="#F4E8C0" opacity=".25" />
              <path d="M-35 60 V-20 M-48 60 H-22" stroke="#C8C8C8" strokeWidth="5" />
              <circle cx="-35" cy="-26" r="9" fill="#2A2A2A" stroke="#C8C8C8" strokeWidth="3" />
              {caption > 0 && (
                <g transform={`translate(-35 80) scale(${caption})`}>
                  <rect x="-80" y="-24" width="160" height="40" fill={P.accento} />
                  <text x="0" y="8" textAnchor="middle" fontFamily={ANTON} fontSize="32" fill="#F2E6D0">JOKER</text>
                </g>
              )}
            </g>
          </Tv>
          <g transform="translate(900 820)">
            <rect x="-40" y="-150" width="80" height="300" rx="10" fill="#1A1A1E" stroke={K} strokeWidth="6" />
            {Array.from({ length: 8 }, (_, i) => <rect key={i} x="-28" y={120 - i * 34} width="56" height="26" rx="4" fill={i / 8 < meter ? (i > 5 ? P.accento : '#E8B830') : '#3A3A3E'} />)}
          </g>
        </g>
        {/* telecamera in primo piano */}
        <g transform={L(1.25)}>
          <g transform="translate(160 1560)">
            <rect x="-150" y="-180" width="300" height="200" rx="16" fill="#3A3A40" stroke={K} strokeWidth="8" />
            <rect x="150" y="-140" width="120" height="120" fill="#2A2A30" stroke={K} strokeWidth="7" />
            <circle cx="120" cy="-160" r="12" fill={lights > 0.5 ? '#FF3A2A' : '#5A2A2A'} />
            <path d="M0 20 V400 M0 220 L-120 420 M0 220 L120 420" stroke={K} strokeWidth="18" />
          </g>
          <path d="M-200 1700 H1280 V2200 H-200 Z" fill="#0E0A10" opacity=".6" />
        </g>
        <g transform={L(1.6)}>
          <NearMotes id="mu-near" t={t} color="#FFE8D0" n={6} opacity={0.08} />
        </g>
      </g>
      <Finish id="mu" tint="#2A1A2A" tintOpacity={0.12} />
    </svg>
  );
};
