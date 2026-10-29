import React from 'react';
import { camera, eo, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Dust, Glow, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K, Typewriter } from './Comuni';

// La stessa frase: nel salone un tavolo con la macchina da scrivere e una pila altissima di fogli, tutti pieni di righe
// uguali; su «centinaia di pagine» i fogli si spargono a ventaglio; su «Jack è impazzito» la luce si fa rossa.
// Le righe sono segni uguali, non il testo del film.
// Piani: finestre con la neve (0,25) · parete del salone (0,4) · tavolo, pila di fogli e macchina (0,75) · fogli sparsi (1,0) · fogli in primo piano (1,3) · pulviscolo (1,6)

const r = rng(500);
const FLY = Array.from({ length: 8 }, () => ({ x: r() * 900 + 90, y: 1480 + r() * 380, rot: (r() - 0.5) * 60, s: 0.8 + r() * 0.5 }));

/** Foglio con righe tutte uguali. */
const Page: React.FC<{ x: number; y: number; s?: number; rot?: number; o?: number }> = ({ x, y, s = 1, rot = 0, o = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <rect x="-80" y="-104" width="160" height="208" fill="#F4F0E4" stroke={K} strokeWidth="4" />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M-64 ${-88 + i * 15} H52`} stroke="#3A3A3A" strokeWidth="3" />)}
  </g>
);

export const Frase: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const fan = eo(seg(t, cues[1], cues[1] + 1.2)); // «centinaia di pagine»
  const loop = seg(t, cues[2], cues[3]); // «ripetuta all'infinito»: i fogli continuano a cadere
  const red = seg(t, cues[3], cues[3] + 0.8); // «Jack è impazzito»

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fr" />
        <Lin id="fr-wall" stops={[[0, '#2A2A30'], [0.5, '#4A4440'], [1, '#2A241E']]} />
        <Lin id="fr-table" stops={[[0, '#6A4A2A'], [1, '#3A2414']]} />
        <Lin id="fr-floor" stops={[[0, '#5A4A3A'], [1, '#1A140E']]} />
      </defs>
      <g transform={cam.transform}>
        {/* finestroni con la neve */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#fr-wall)" />
          {[60, 400, 740].map((x) => (
            <g key={x}>
              <rect x={x} y="560" width="280" height="420" fill="#2A3A4E" stroke={K} strokeWidth="10" />
              {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={x + 14 + ((i * 47) % 250)} cy={570 + mod(i * 61 + t * 50, 400)} r="3.5" fill="#E8EEF4" opacity=".8" />)}
              <path d={`M${x + 140} 560 V980 M${x} 770 H${x + 280}`} stroke={K} strokeWidth="8" />
              <Beam id={`fr-w${x}`} x={x + 140} y={980} t={t} length={500} spread={260} color="#BFD4E8" angle={100} opacity={0.1} />
            </g>
          ))}
        </g>
        {/* tavolo, macchina da scrivere e pila di fogli (accento: il bordo rosso della pila sulla follia) */}
        <g transform={L(0.75)}>
          <path d="M-200 1200 H1280 V2200 H-200 Z" fill="url(#fr-floor)" />
          <rect x="80" y="1130" width="920" height="40" fill="url(#fr-table)" stroke={K} strokeWidth="8" />
          <path d="M120 1170 V1340 M960 1170 V1340" stroke={K} strokeWidth="18" />
          <Glow id="fr-lamp" x={900} y={960} r={320} t={t} color="#FFD8A0" amp={0.06} rate={2} opacity={0.55} />
          <Typewriter x={420} y={1070} s={1.05} t={t * (1 + loop)} accent={P.accento} />
          {/* la pila altissima */}
          <g transform="translate(780 1130)">
            {Array.from({ length: 16 }, (_, i) => <rect key={i} x={-90 + Math.sin(i * 1.7) * 6} y={-14 - i * 12} width="180" height="12" fill="#F4F0E4" stroke="#8A8270" strokeWidth="2" />)}
            <rect x="-96" y="-206" width="192" height="196" fill="none" stroke={P.accento} strokeWidth="6" opacity={red} />
          </g>
          {/* lampada da tavolo accanto alla pila */}
          <path d="M955 1130 V950 L905 925" stroke={K} strokeWidth="9" fill="none" />
          <ellipse cx="955" cy="1128" rx="34" ry="9" fill="#2A2A2A" stroke={K} strokeWidth="4" />
          <path d="M848 940 L936 916 L928 972 Z" fill="#2E4A3A" stroke={K} strokeWidth="5" />
          {/* fogli a ventaglio sul tavolo */}
          {[0, 1, 2, 3, 4].map((i) => <Page key={i} x={180 + i * 30 * fan} y={1120 - 10 * fan} s={0.55} rot={-30 + i * 14 * fan} o={fan} />)}
        </g>
        {/* fogli che cadono e si accumulano a terra */}
        <g transform={L(1.0)}>
          {FLY.map((f, i) => {
            const p = mod(t * 0.18 * (0.5 + loop) + i / FLY.length, 1);
            return <Page key={i} x={f.x + Math.sin(p * 6 + i) * 40} y={f.y - 260 * (1 - p) * loop} s={f.s * 0.7} rot={f.rot + p * 90 * loop} o={fan > 0.05 || loop > 0 ? 1 : 0} />;
          })}
        </g>
        <g transform={L(1.3)}>
          <Page x={120} y={1720} s={1.6} rot={-14} />
          <Page x={940} y={1780} s={1.5} rot={18} />
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 960, x0: 760, x1: 900 }} bottom={{ y: 1300, x0: 300, x1: 1000 }} seed={8} n={22} color="#FFE2B0" />
          <NearMotes id="fr-near" t={t} color="#F4F0E4" n={5} y0={1300} opacity={0.08} />
        </g>
      </g>
      <rect width="1080" height="1920" fill="#8A1010" opacity={0.12 * red} />
      <Finish id="fr" tint="#3A1A14" tintOpacity={0.1} />
    </svg>
  );
};
