import React from 'react';
import { camera, eio, eo, mod, rng, seg } from '../../lib/anim';
import { Fog, Glow, Moon, NearMotes, Reflection, Stars, WaveBand, WaveLines } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Door, K, Ship } from './Comuni';

// La nave si spezza: sulla prima frase la nave con la poppa alzata verso le stelle si spezza in due e sprofonda, le luci
// si spengono; poi l'oceano gelato e calmo: una porta di legno intagliata galleggia; su «ma in due si rovescia» la porta
// si inclina e si rovescia e poi si raddrizza con un solo posto; su «muore di freddo» la brina copre il legno e l'acqua
// intorno si fa ferma e azzurra. Nessuna persona.
// Piani: cielo stellato (0,15) · mare lontano (0,3) · nave che affonda (0,45) · mare vicino (0,7) · porta (0,9) · fiato gelato (1,6)

const r = rng(1512);
const FROST = Array.from({ length: 40 }, () => ({ x: r() * 1300 - 110, y: 900 + r() * 500, s: 2 + r() * 4 }));

export const Naufragio: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tilt = eio(seg(t, 0, cues[1] * 0.45)); // la poppa si alza
  const brk = eo(seg(t, cues[1] * 0.45, cues[1] * 0.6)); // si spezza
  const down = eio(seg(t, cues[1] * 0.55, cues[1] + 0.3)); // sprofonda
  const lights = t < cues[1] * 0.5 ? (Math.sin(t * 15) > -0.6 ? 1 : 0.3) : 0;
  const sea = eo(seg(t, cues[1] - 0.5, cues[1] + 0.5)); // l'oceano gelato con la porta
  const flip = seg(t, cues[1] + 1.2, cues[1] + 2.4); // la porta si rovescia e torna su
  const roll = Math.sin(flip * Math.PI) * 70;
  const frost = eo(seg(t, cues[2], dur)); // la brina

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="nf" />
        <Lin id="nf-sky" stops={[[0, '#02040A'], [1, '#0E1828']]} />
        <Lin id="nf-sea" stops={[[0, '#14243A'], [1, '#04080E']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.15)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#nf-sky)" />
          <Stars t={t} n={110} y={-100} h={900} seed={15} size={1.1} />
          <Moon id="nf-moon" x={880} y={660} r={34} t={t} color="#E8F0F4" halo="#BFD8EE" />
        </g>
        <g transform={L(0.3)}>
          <path d="M-200 900 H1280 V2200 H-200 Z" fill="url(#nf-sea)" />
          <WaveLines t={t} ys={[930, 990]} color="#3A5A7A" amp={3} speed={12} opacity={0.3} />
          <Reflection t={t} x={880} y={920} color="#DDEBF4" n={8} w={60} opacity={0.35} />
        </g>
        {/* la nave: la poppa sale, si spezza in due, sprofonda */}
        {down < 1 && (
          <g transform={L(0.45)} opacity={1 - sea * 0.9}>
            <svg x="-200" y="-200" width="1480" height="1100" viewBox="-200 -200 1480 1100" overflow="hidden">
              <g transform={`translate(0 ${520 * down})`}>
                {/* metà di poppa (a sinistra): si alza e poi si raddrizza dopo la rottura */}
                <g transform={`rotate(${38 * tilt - 20 * brk} 560 900)`}>
                  <svg x="40" y="300" width="520" height="700" viewBox="40 300 520 700" overflow="hidden">
                    <Ship x={560} y={900} s={1} t={t} lit={0.9 * lights} />
                  </svg>
                </g>
                {/* metà di prua (a destra): già sott'acqua, scende */}
                <g transform={`rotate(${38 * tilt + 12 * brk} 560 900) translate(${20 * brk} ${80 * brk})`}>
                  <svg x="560" y="300" width="600" height="700" viewBox="560 300 600 700" overflow="hidden">
                    <Ship x={560} y={900} s={1} t={t} lit={0.9 * lights} />
                  </svg>
                </g>
              </g>
            </svg>
            <Glow id="nf-ship" x={540} y={800} r={500} t={t} color="#FFD98A" amp={0.1} rate={9} opacity={0.25 * lights} />
          </g>
        )}
        <g transform={L(0.7)}>
          <WaveBand t={t} y={1050} fill="#0A1628" foam="#3A5A7A" amp={6} w={260} speed={14} bob={2} foamOpacity={0.4} />
          <Fog id="nf-fog" t={t} y={1050} color="#8AA8C8" rx={900} ry={60} opacity={0.2 + 0.3 * frost} />
          <rect x="-200" y="1040" width="1480" height="1200" fill="#9AC8E0" opacity={0.12 * frost} />
        </g>
        {/* la porta che galleggia, si rovescia e si raddrizza */}
        <g transform={L(0.9)} opacity={sea}>
          <g transform={`translate(540 1180) rotate(${roll * 0.3}) translate(-540 -1180)`}>
            <g transform={`translate(0 ${Math.sin(t * 1.5) * 6}) scale(1 ${1 - Math.abs(Math.sin(flip * Math.PI)) * 0.7})`} style={{ transformOrigin: '540px 1180px' }}>
              <Door x={540} y={1180} s={0.9} rot={-8} frost={frost} />
              {/* il bordo basso della porta velato dall'acqua */}
              <path d={`M300 ${1230 + Math.sin(t * 1.5) * 5} Q540 ${1270 + Math.sin(t * 1.2) * 6} 780 ${1210 + Math.sin(t * 1.5 + 1) * 5} V1330 H300 Z`} fill="#0A1628" opacity=".55" />
            </g>
          </g>
          {flip > 0 && flip < 1 && [0, 1, 2].map((i) => <circle key={i} cx={540} cy={1200} r={60 + 120 * flip + i * 40} fill="none" stroke="#CFE8F0" strokeWidth="4" opacity={(1 - flip) * 0.6} />)}
          {[0, 1].map((i) => <ellipse key={i} cx={540} cy={1200} rx={260 + i * 80 + Math.sin(t * 1.5 + i) * 10} ry={40 + i * 14} fill="none" stroke="#5A7A9A" strokeWidth="3" opacity=".4" />)}
        </g>
        {/* rottami che galleggiano in primo piano: una sdraio, assi, un salvagente */}
        <g transform={L(1.2)}>
          <g transform={`translate(160 ${1640 + Math.sin(t * 1.3) * 8}) rotate(-14)`}><rect x="-140" y="-20" width="280" height="40" fill="#8A6A48" stroke={K} strokeWidth="6" /><path d="M-120 -20 L-60 -110 H100" stroke="#6A4E34" strokeWidth="12" fill="none" /></g>
          <g transform={`translate(900 ${1720 + Math.sin(t * 1.1 + 1) * 8})`}><circle r="80" fill="none" stroke="#F4EEE2" strokeWidth="34" /><circle r="80" fill="none" stroke="#C8402A" strokeWidth="34" strokeDasharray="40 86" /></g>
          <rect x="420" y={1860 + Math.sin(t * 1.5) * 6} width="300" height="30" fill="#7A5A3A" stroke={K} strokeWidth="5" transform="rotate(6 570 1875)" />
        </g>
        <g transform={L(1.6)}>
          {FROST.map((f, i) => <circle key={i} cx={f.x + Math.sin(t * 0.4 + i) * 10} cy={f.y - mod(t * 10 + i * 30, 300)} r={f.s} fill="#E8F4FA" opacity={0.2 + 0.4 * frost} />)}
          <NearMotes id="nf-near" t={t} color="#E8F4FA" n={6} opacity={0.08} />
        </g>
      </g>
      <Finish id="nf" tint="#0A1A2E" tintOpacity={0.16} />
    </svg>
  );
};
