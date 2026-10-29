import React from 'react';
import { camera, eo, eob, mod, seg } from '../../lib/anim';
import { Glow, NearMotes, Stars, WaveLines } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { PLAYFAIR } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { K } from './Comuni';

// La notte sulla poppa: la ringhiera della poppa vista da dentro, l'asta della bandiera, la scia bianca dell'elica che si
// allontana sotto un cielo stellato; uno scialle scivolato oltre la ringhiera (Rose che vuole buttarsi) che su «la
// convince a tornare indietro» torna sul ponte; su «la invita a cena» compare un cartoncino d'invito dorato. Nessuna persona.
// Piani: cielo stellato (0,15) · mare e scia (0,35) · asta e lampione (0,6) · ringhiera e scialle (0,85) · ponte e invito (1,15) · scintille di mare (1,6)

export const Poppa: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const back = eo(seg(t, cues[1], cues[1] + 1.4)); // lo scialle torna sul ponte
  const card = eob(seg(t, cues[2] + 0.4, cues[2] + 1.1), 1.5); // l'invito a cena
  const shawl = 1 - back;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pp" />
        <Lin id="pp-sky" stops={[[0, '#050A16'], [0.6, '#12223A'], [1, '#1E3450']]} />
        <Lin id="pp-sea" stops={[[0, '#1A2E48'], [1, '#060C16']]} />
        <Lin id="pp-wake" x2={0} y2={1} stops={[[0, '#DDEBF4', 0.0], [1, '#F4FAFF', 0.85]]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.15)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#pp-sky)" />
          <Stars t={t} n={70} y={-100} h={900} seed={14} />
          <path d="M-200 300 Q540 200 1280 340" stroke="#C8D8F0" strokeWidth="60" opacity=".05" fill="none" />
        </g>
        {/* il mare e la scia che si allontana */}
        <g transform={L(0.35)}>
          <path d="M-200 820 H1280 V2200 H-200 Z" fill="url(#pp-sea)" />
          <path d="M520 820 L560 820 L860 1400 L220 1400 Z" fill="url(#pp-wake)" />
          {Array.from({ length: 9 }, (_, i) => {
            const p = mod(t * 0.12 + i / 9, 1);
            const y = 820 + p * 600, w = 20 + p * 300;
            return <path key={i} d={`M${540 - w} ${y} Q540 ${y + 14} ${540 + w} ${y}`} stroke="#F4FAFF" strokeWidth={3 + p * 5} fill="none" opacity={0.6 * (1 - p)} />;
          })}
          <WaveLines t={t} ys={[900, 1000, 1120]} color="#5A7A9A" amp={5} opacity={0.3} />
        </g>
        {/* ringhiera della poppa e lo scialle */}
        <g transform={L(0.85)}>
          <path d="M-200 1180 Q540 1130 1280 1180" stroke="#E8E0D0" strokeWidth="14" fill="none" />
          <path d="M-200 1250 Q540 1200 1280 1250" stroke="#B8B0A0" strokeWidth="8" fill="none" />
          {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${-160 + i * 92} ${1170 - Math.sin((i / 15) * Math.PI) * 30} V${1300 - Math.sin((i / 15) * Math.PI) * 30}`} stroke="#B8B0A0" strokeWidth="8" />)}
          {/* scialle: prima oltre la ringhiera, che sventola, poi di nuovo sul ponte */}
          <g transform={`translate(${380 + 40 * back} ${1110 + 120 * back}) rotate(${-30 + 30 * back})`}>
            <path d={`M-90 0 Q0 ${-20 + 16 * Math.sin(t * 5) * shawl} 90 0 L${70 + 20 * Math.sin(t * 4) * shawl} ${90 - 40 * back} Q0 ${110 - 40 * back} ${-70} ${90 - 40 * back} Z`} fill="#7A5A9A" stroke={K} strokeWidth="5" />
            <path d="M-60 10 Q0 0 60 10" stroke="#B89AD0" strokeWidth="4" fill="none" />
          </g>
        </g>
        {/* ponte in primo piano e l'invito a cena */}
        <g transform={L(1.15)}>
          <path d="M-200 1380 Q540 1340 1280 1380 V2200 H-200 Z" fill="#8A6A48" />
          {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M-200 ${1420 + i * 70} H1280`} stroke="#6A4E34" strokeWidth="4" />)}
          {/* asta della bandiera e lampione di bordo, piantati sul ponte */}
          <path d="M150 1390 V640" stroke={K} strokeWidth="14" />
          <rect x="128" y="1370" width="44" height="30" fill="#3A2A1E" stroke={K} strokeWidth="5" />
          <path d={`M150 660 q60 ${10 + Math.sin(t * 4) * 8} 120 0 q-4 40 0 70 q-60 ${-10 + Math.sin(t * 4 + 1) * 8} -120 0 Z`} fill="#C8402A" stroke={K} strokeWidth="4" />
          <g transform="translate(940 1000)">
            <path d="M0 390 V0" stroke={K} strokeWidth="12" />
            <path d="M-26 0 H26 L18 -50 H-18 Z" fill="#FFE8A8" stroke={K} strokeWidth="5" />
            <Glow id="pp-lamp" x={0} y={-24} r={260} t={t} color="#FFD890" amp={0.06} rate={2} opacity={0.5 + 0.2 * back} />
          </g>
          {card > 0 && (
            <g transform={`translate(720 ${1220 - 40 * card}) rotate(${-8 + 6 * card}) scale(${card})`}>
              <rect x="-150" y="-90" width="300" height="180" rx="10" fill="#F4EAD2" stroke="#C9A24A" strokeWidth="8" />
              <rect x="-130" y="-70" width="260" height="140" rx="6" fill="none" stroke="#C9A24A" strokeWidth="3" />
              <text x="0" y="-10" textAnchor="middle" fontFamily={PLAYFAIR} fontWeight={900} fontSize="40" fill={K}>Invito</text>
              <text x="0" y="40" textAnchor="middle" fontFamily={PLAYFAIR} fontWeight={900} fontSize="26" fill="#8A6A2A">a cena · prima classe</text>
              <circle cx="120" cy="60" r="16" fill={P.accento} stroke={K} strokeWidth="3" />
            </g>
          )}
        </g>
        <g transform={L(1.6)}>
          <NearMotes id="pp-near" t={t} color="#DDEBF4" n={6} opacity={0.08} />
        </g>
      </g>
      <Finish id="pp" tint="#0A1A2E" tintOpacity={0.14} />
    </svg>
  );
};
