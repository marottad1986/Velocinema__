import React from 'react';
import { camera, eo, mod, rng, seg } from '../../lib/anim';
import { Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Completo, K, Palazzo } from './Comuni';

// Il ballo sulla scalinata: sulla prima frase una porta d'appartamento che si chiude e uno spioncino (Randall, nessuna
// figura: solo la porta e un'ombra di luce che si spegne); su «truccato e col completo rosso» il completo rosso appeso
// alla ringhiera in cima alla scalinata, che oscilla al vento (accento); su «scende ballando una lunga scalinata» foglie
// e cartacce volano giù per i gradini a ritmo, e in fondo arriva un'auto della polizia con i lampeggianti. Nessuna persona.
// Piani: cielo nuvoloso (0,15) · palazzi (0,35) · scalinata (0,6) · auto della polizia (0,8) · ringhiera e completo (1,0) · cartacce (1,4) · pulviscolo (1,6)

const r = rng(7);
const LEAVES = Array.from({ length: 18 }, () => ({ x: 340 + r() * 400, ph: r(), s: 8 + r() * 10, c: ['#C8742A', '#E8D8B0', '#8A5A2A'][Math.floor(r() * 3)] }));

export const Scalinata: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const door = eo(seg(t, cues[0] + 0.4, cues[1] - 0.2)) * (1 - eo(seg(t, cues[1] - 0.2, cues[1] + 0.4))); // la porta di Randall
  const suit = eo(seg(t, cues[1], cues[1] + 0.8)); // il completo rosso
  const dance = seg(t, cues[2], dur); // la discesa, a ritmo
  const police = eo(seg(t, cues[2] + 1.2, cues[2] + 2.2));
  const siren = Math.sin(t * 12) > 0 ? 1 : 0;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sc" />
        <Lin id="sc-sky" stops={[[0, '#6A7270'], [1, '#B8B0A0']]} />
        <Lin id="sc-step" stops={[[0, '#9A948A'], [1, '#5A564E']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.15)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#sc-sky)" />
          <Glow id="sc-sun" x={540} y={600} r={600} t={t} color="#F4E8C8" amp={0.03} rate={0.5} opacity={0.3} />
        </g>
        <g transform={L(0.35)}>
          <Palazzo x={-200} y={1000} w={420} h={370} t={t} color="#5A3A2A" lit={0.1} seed={3} />
          <Palazzo x={860} y={1000} w={420} h={380} t={t} color="#4A3226" lit={0.1} seed={5} />
        </g>
        {/* la lunga scalinata tra due muri, in prospettiva verso il basso */}
        <g transform={L(0.6)}>
          <path d="M220 540 H860 L1000 2200 H80 Z" fill="url(#sc-step)" />
          {Array.from({ length: 22 }, (_, i) => {
            const y = 540 + i * i * 2.4 + i * 22;
            const k = (y - 540) / 1660;
            return <path key={i} d={`M${220 - 140 * k} ${y} H${860 + 140 * k}`} stroke="#4A463E" strokeWidth={3 + 4 * k} />;
          })}
          <path d="M220 540 L80 2200 M860 540 L1000 2200" stroke={K} strokeWidth="10" />
          <path d="M-200 540 H220 L80 2200 H-200 Z M860 540 H1280 V2200 H1000 Z" fill="#6A5A4A" stroke={K} strokeWidth="8" />
        </g>
        {/* in fondo, l'auto della polizia con i lampeggianti */}
        <g transform={L(0.8)} opacity={police}>
          <g transform="translate(540 600) scale(.32)">
            <path d="M-150 0 V-50 L-100 -56 L-60 -100 H70 L110 -56 L150 -50 V0 Z" fill="#E8E8E4" stroke={K} strokeWidth="6" />
            <rect x="-150" y="-30" width="300" height="20" fill="#2A3A6A" />
            <rect x="-40" y="-120" width="80" height="20" rx="6" fill={siren ? '#3A6AE8' : P.accento} stroke={K} strokeWidth="4" />
            <circle cx="-90" cy="4" r="24" fill={K} /><circle cx="90" cy="4" r="24" fill={K} />
            <Glow id="sc-siren" x={0} y={-110} r={260} t={t} color={siren ? '#3A6AE8' : P.accento} amp={0.1} rate={9} opacity={0.6} />
          </g>
        </g>
        {/* la porta di Randall, che si chiude */}
        <g transform={L(1.0)} opacity={door}>
          {/* il pianerottolo davanti alla porta di Randall: muro di mattoni, stipite, soglia e pavimento */}
          <rect x="-200" y="540" width="1480" height="820" fill="#6A3A2A" />
          {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M-200 ${560 + i * 28} H1280`} stroke="#4A2A1E" strokeWidth="3" />)}
          <path d="M-200 1340 H1280 V2200 H-200 Z" fill="#3A342C" />
          <rect x="280" y="1320" width="520" height="30" fill="#8A847A" stroke={K} strokeWidth="5" />
          <rect x="300" y="600" width="480" height="720" fill="#2A2018" stroke={K} strokeWidth="10" />
          <rect x="340" y="640" width="400" height="680" fill="#6A4A30" stroke={K} strokeWidth="8" />
          <circle cx="540" cy="760" r="14" fill="#C9A24A" stroke={K} strokeWidth="4" />
          <circle cx="700" cy="1000" r="16" fill="#C9A24A" stroke={K} strokeWidth="4" />
          <rect x="340" y="1300" width="400" height="20" fill="#F4E8B0" opacity={0.6 * (1 - seg(t, cues[0] + 1.6, cues[0] + 2.4))} />
        </g>
        {/* ringhiera in cima e il completo rosso che oscilla al vento */}
        <g transform={L(1.0)} opacity={1 - door}>
          {/* la ringhiera laterale, fissata al muro di sinistra */}
          <path d="M-200 740 L360 780" stroke={K} strokeWidth="14" />
          <path d="M60 758 V1180 M340 778 V1100" stroke={K} strokeWidth="10" />
          <rect x="-200" y="700" width="40" height="80" fill="#3A2A1E" stroke={K} strokeWidth="5" />
          <g opacity={suit} transform={`translate(${210} 760)`}>
            <Completo x={0} y={0} s={0.85} sway={Math.sin(t * 2.2) * 6 + Math.sin(t * 4.4) * 3 * dance} color={P.accento} />
          </g>
          <Glow id="sc-suit" x={210} y={900} r={220} t={t} color="#FF8A6A" amp={0.08} rate={2} opacity={0.35 * suit} />
        </g>
        {/* foglie e cartacce che scendono i gradini a ritmo */}
        <g transform={L(1.4)}>
          {dance > 0 && LEAVES.map((l, i) => {
            const p = mod(t * 0.35 + l.ph, 1);
            const hop = Math.abs(Math.sin((t * 2.6 + i) * Math.PI)) * 30;
            return <rect key={i} x={l.x + Math.sin(t * 2 + i) * 60 - l.s / 2} y={600 + p * 1300 - hop} width={l.s} height={l.s * 0.7} fill={l.c} stroke={K} strokeWidth="2" opacity={dance > 0.02 ? 0.9 : 0} transform={`rotate(${t * 200 + i * 40} ${l.x} ${600 + p * 1300})`} />;
          })}
          <path d="M-200 1680 H1280 V2200 H-200 Z" fill="#3A342C" opacity=".5" />
        </g>
        <g transform={L(1.6)}>
          <NearMotes id="sc-near" t={t} color="#F4E8C8" n={6} opacity={0.08} />
        </g>
      </g>
      <Finish id="sc" tint="#2A2A1E" tintOpacity={0.1} />
    </svg>
  );
};
