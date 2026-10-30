import React from 'react';
import { camera, eio, eo, seg } from '../../lib/anim';
import { Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { K } from './Comuni';

// Da solo: il corridoio buio del palazzo di Arthur con due porte una di fronte all'altra; sulla prima frase la porta
// della vicina è socchiusa, con una luce calda, due tazze e una rosa sul tavolino (l'amore che Arthur credeva vero); su
// «era solo nella sua immaginazione» la luce si spegne e tazze e rosa svaniscono; su «soffoca la madre in ospedale» si
// passa a una stanza d'ospedale fredda: il letto, il monitor che si appiattisce (accento) e un cuscino. Nessuna persona.
// Piani: corridoio (0,3) · porte (0,6) · interno della vicina / letto (0,85) · tavolino / cuscino (1,05) · stipite (1,3) · pulviscolo (1,6)

export const Sola: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const warm = eo(seg(t, cues[0] + 0.4, cues[0] + 1.2)) * (1 - eio(seg(t, cues[1] + 0.6, cues[1] + 1.8))); // la luce calda che si spegne
  const room = eio(seg(t, cues[2] - 0.2, cues[2] + 0.7)); // la stanza d'ospedale
  const flat = seg(t, cues[2] + 1.6, cues[2] + 1.8);
  const beat = flat ? 0 : Math.max(0, Math.sin(t * 6)) ** 8;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="so" />
        <Lin id="so-wall" stops={[[0, '#3A3A2E'], [1, '#1E1E18']]} />
        <Lin id="so-ward" stops={[[0, '#9AB0A8'], [1, '#5A6A66']]} />
      </defs>
      <g transform={cam.transform}>
        <g opacity={1 - room}>
          <g transform={L(0.3)}>
            <rect x="-200" y="-200" width="1480" height="2400" fill="url(#so-wall)" />
            <path d="M-200 -200 L380 700 V1200 L-200 1700 Z M1280 -200 L700 700 V1200 L1280 1700 Z" fill="#4A4636" stroke={K} strokeWidth="6" />
            <path d="M380 700 H700 V1200 H380 Z" fill="#14140F" />
            <circle cx="540" cy="760" r="12" fill="#F4E8B0" opacity=".6" />
          </g>
          {/* porte: a sinistra quella di Arthur, chiusa; a destra quella della vicina, socchiusa */}
          <g transform={L(0.6)}>
            <path d="M120 1260 V620 L300 700 V1220 Z" fill="#5A3E2A" stroke={K} strokeWidth="6" />
            <text x="210" y="760" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="34" fill="#C9A24A">8D</text>
            <path d="M960 1260 V620 L780 700 V1220 Z" fill="#1A140E" stroke={K} strokeWidth="6" />
            <g opacity={warm}>
              <path d="M960 1260 V620 L780 700 V1220 Z" fill="#F2B860" opacity=".55" />
              <Glow id="so-warm" x={870} y={950} r={360} t={t} color="#FFC870" amp={0.06} rate={2} opacity={0.6} />
            </g>
            <path d="M960 1260 V620 L1010 640 V1250 Z" fill="#5A3E2A" stroke={K} strokeWidth="6" />
            <text x="880" y="760" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="34" fill="#C9A24A" opacity={0.4 + 0.6 * warm}>8E</text>
          </g>
          {/* il tavolino con due tazze e una rosa, che svaniscono */}
          <g transform={L(1.05)} opacity={warm}>
            <rect x="600" y="1180" width="300" height="24" fill="#8A6A44" stroke={K} strokeWidth="5" />
            {[660, 760].map((x) => <path key={x} d={`M${x - 24} 1180 V1140 H${x + 24} V1180 Z`} fill="#F2E6D0" stroke={K} strokeWidth="4" />)}
            <path d="M850 1180 V1100" stroke="#3A6A3A" strokeWidth="5" />
            <circle cx="850" cy="1092" r="16" fill={P.accento} stroke={K} strokeWidth="4" />
          </g>
          <g transform={L(1.05)}>
            <path d="M-200 1260 L380 1200 H700 L1280 1260 V2200 H-200 Z" fill="#2A261E" />
          </g>
        </g>
        {/* la stanza d'ospedale */}
        <g opacity={room}>
          <g transform={L(0.3)}>
            <rect x="-200" y="-200" width="1480" height="2400" fill="url(#so-ward)" />
            <rect x="680" y="580" width="280" height="320" fill="#2A3440" stroke={K} strokeWidth="8" />
            <path d="M820 580 V900 M680 740 H960" stroke={K} strokeWidth="8" />
          </g>
          <g transform={L(0.85)}>
            <g transform="translate(250 900)">
              <rect x="-120" y="-120" width="240" height="160" rx="10" fill="#2A2E30" stroke={K} strokeWidth="6" />
              <path d={`M-100 -40 H-40 L-28 ${-40 - 60 * beat} L-16 ${-40 + 30 * beat} L-4 -40 H100`} stroke={flat ? P.accento : '#6AE08A'} strokeWidth="5" fill="none" />
              <path d="M0 40 V200" stroke={K} strokeWidth="8" />
            </g>
            <path d="M380 1140 V1020 H1000 V1140" fill="none" stroke="#C8CCD0" strokeWidth="12" />
            <rect x="380" y="1060" width="620" height="90" rx="10" fill="#E8ECEE" stroke={K} strokeWidth="6" />
            <path d="M-200 1180 H1280 V2200 H-200 Z" fill="#4A5654" />
          </g>
          <g transform={L(1.05)}>
            <g transform="translate(560 1170) rotate(-8)">
              <path d="M-140 -40 Q-150 0 -140 40 Q0 56 140 40 Q150 0 140 -40 Q0 -56 -140 -40 Z" fill="#F4F4F0" stroke={K} strokeWidth="6" />
              <path d="M-100 -10 Q0 10 100 -10" stroke="#C8CCD0" strokeWidth="5" fill="none" />
            </g>
          </g>
        </g>
        <g transform={L(1.3)}>
          <path d="M-200 -200 H40 V2200 H-200 Z M1280 -200 H1040 V2200 H1280 Z" fill="#1A1A14" stroke={K} strokeWidth="9" />
          <path d="M-200 1640 H1280 V2200 H-200 Z" fill="#141410" opacity=".6" />
        </g>
        <g transform={L(1.6)}>
          <NearMotes id="so-near" t={t} color="#F4E8C0" n={5} opacity={0.07} />
        </g>
      </g>
      <Finish id="so" tint="#1E1E14" tintOpacity={0.16} />
    </svg>
  );
};
