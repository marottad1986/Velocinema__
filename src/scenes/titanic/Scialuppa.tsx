import React from 'react';
import { camera, eio, eo, seg } from '../../lib/anim';
import { Glow, NearMotes, Stars, WaveBand } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Diamond, K, Lifeboat } from './Comuni';

// Il salto dalla scialuppa: la fiancata altissima della nave già inclinata, file di oblò accesi; una scialuppa bianca
// scende con le funi lungo la fiancata con sopra un cappotto scuro e un luccichio blu in tasca (accento); razzi di soccorso
// che esplodono nel cielo; su «guarda Jack» la scialuppa si ferma e una lanterna sul ponte, in alto, si accende; su «risale
// a bordo» il cappotto resta sulla scialuppa che riprende a scendere, e una scia di luce sale verso il ponte. Nessuna persona.
// Piani: cielo e razzi (0,15) · fiancata della nave (0,45) · funi e scialuppa (0,75) · mare (1,0) · scintille (1,6)

export const Scialuppa: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const down1 = eio(seg(t, 0.3, cues[1] + 0.4)); // la scialuppa scende
  const down2 = eio(seg(t, cues[2] + 1, dur)); // riprende a scendere senza di lei
  const boatY = 840 + 260 * down1 + 160 * down2;
  const lamp = eo(seg(t, cues[1] + 0.3, cues[1] + 1)); // la lanterna sul ponte
  const climb = eo(seg(t, cues[2], cues[2] + 1)); // la scia che risale
  const flare = (at: number) => (t > at && t < at + 2.5 ? Math.max(0, 1 - (t - at) / 2.5) : 0);
  const flares = [0.6, cues[1] + 0.2, cues[2] + 1.5];

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sc" />
        <Lin id="sc-sky" stops={[[0, '#02040A'], [1, '#0E1A2E']]} />
        <Lin id="sc-hull" x2={1} y2={0} stops={[[0, '#0E1218'], [0.6, '#1E2430'], [1, '#0E1218']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.15)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#sc-sky)" />
          <Stars t={t} n={60} y={-100} h={800} seed={22} />
          {flares.map((at, i) => {
            const f = flare(at);
            return f > 0 ? (
              <g key={i}>
                <Glow id={`sc-f${i}`} x={240 + i * 60} y={420 + (1 - f) * 120} r={260} t={t} color="#FFFFFF" amp={0.1} rate={9} opacity={0.6 * f} />
                {Array.from({ length: 10 }, (_, k) => <path key={k} d={`M${240 + i * 60} ${420 + (1 - f) * 120} l${Math.cos(k * 0.63) * 120 * (1.2 - f)} ${Math.sin(k * 0.63) * 120 * (1.2 - f) + (1 - f) * 60}`} stroke="#FFFFFF" strokeWidth="3" opacity={f} />)}
              </g>
            ) : null;
          })}
        </g>
        {/* la fiancata inclinata della nave */}
        <g transform={`${L(0.45)} translate(0 160) rotate(-6 540 1000)`}>
          <path d="M380 -200 H1400 V1500 H380 Z" fill="url(#sc-hull)" stroke={K} strokeWidth="9" />
          <path d="M380 560 H1400" stroke="#F4EEE2" strokeWidth="10" />
          {Array.from({ length: 8 }, (_, row) => Array.from({ length: 7 }, (_, c) => (
            <circle key={`${row}${c}`} cx={460 + c * 120} cy={640 + row * 100} r="16" fill="#FFD98A" opacity={((row * 7 + c) % 5 === 0 ? 0.15 : 0.85) - row * 0.05} />
          )))}
          {/* il ponte in alto con la lanterna (dove è Jack) */}
          <path d="M380 520 H1400" stroke="#E8E0D0" strokeWidth="8" />
          {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${400 + i * 100} 480 V520`} stroke="#E8E0D0" strokeWidth="5" />)}
          <g transform="translate(520 470)">
            <path d="M-20 0 H20 L14 -40 H-14 Z" fill="#FFE8A8" stroke={K} strokeWidth="4" opacity={0.3 + 0.7 * lamp} />
            <Glow id="sc-lamp" x={0} y={-20} r={200} t={t} color="#FFD890" amp={0.1} rate={3} opacity={0.6 * lamp} />
          </g>
          {/* la gru (davit) e le funi */}
          <path d="M460 520 Q380 520 360 600 M700 520 Q620 520 600 600" stroke={K} strokeWidth="14" fill="none" />
        </g>
        {/* funi e scialuppa col cappotto */}
        <g transform={L(0.75)}>
          <path d={`M330 700 V${boatY - 60} M570 690 V${boatY - 60}`} stroke="#C8B898" strokeWidth="5" />
          <g transform={`translate(450 ${boatY}) rotate(${-4 + Math.sin(t * 2) * 2})`}>
            <Lifeboat x={0} y={0} s={1.3} />
            <path d="M-40 -60 Q0 -90 50 -62 L60 -48 H-50 Z" fill="#1E2430" stroke={K} strokeWidth="5" />
            <Diamond x={30} y={-62} s={0.14} t={t} chain={false} />
            <Glow id="sc-dia" x={30} y={-62} r={90} t={t} color={P.accento} amp={0.15} rate={4} opacity={0.55} />
          </g>
          {/* la scia di luce che risale verso il ponte */}
          {climb > 0 && <path d={`M450 ${boatY - 80} Q420 ${boatY - 80 - 200 * climb} 520 ${boatY - 80 - (boatY - 700) * climb}`} stroke="#FFE8B0" strokeWidth="6" fill="none" strokeLinecap="round" opacity={0.8 * (1 - 0.5 * climb)} />}
        </g>
        <g transform={L(1.0)}>
          <WaveBand t={t} y={1290} fill="#08101C" foam="#5A7A9A" amp={10} w={220} speed={30} bob={4} />
        </g>
        <g transform={L(1.6)}>
          <NearMotes id="sc-near" t={t} color="#FFF4D8" n={6} opacity={0.08} />
        </g>
      </g>
      <Finish id="sc" tint="#0A1A2E" tintOpacity={0.14} />
    </svg>
  );
};
