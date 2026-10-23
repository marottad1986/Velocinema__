import React from 'react';
import { camera, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K, Letter, Owl } from './Comuni';

// Le lettere: salotto in ordine maniacale; dal camino escono a fiotti decine di lettere che volano per la stanza;
// sul davanzale e sulla staccionata fuori tanti gufi; una lettera strappata a terra, una con il sigillo in primo piano.
// Piani: finestra con gufi (0,3) · parete e camino (0,5) · lettere che volano (0,8) · poltrona e tavolino (1,0) · lettera in primo piano (1,3)

const r = rng(1104);
const FLY = Array.from({ length: 26 }, () => ({ ph: r(), dx: (r() - 0.5) * 1400, dy: -300 - r() * 700, rot: (r() - 0.5) * 720, s: 0.35 + r() * 0.35 }));
const OWLS = [[150, 690], [280, 700], [420, 690], [700, 900], [840, 910], [960, 900]];

export const Lettere: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const torn = seg(t, cues[1], cues[1] + 0.6); // «lo zio le strappa»
  const flood = seg(t, cues[2], cues[2] + 0.6); // «a centinaia, perfino dal camino»
  const owls = (i: number) => seg(t, 0.4 + i * 0.5, 0.8 + i * 0.5);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="le" />
        <Lin id="le-wall" stops={[[0, '#D8C8A8'], [1, '#B8A280']]} />
        <Lin id="le-sky" stops={[[0, '#9CC8E0'], [1, '#E4EEE8']]} />
        <Lin id="le-carpet" stops={[[0, '#7A6A4A'], [1, '#3A3020']]} />
      </defs>
      <g transform={cam.transform}>
        {/* finestra con il giardino e i gufi sulla staccionata */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#le-wall)" />
          <rect x="60" y="560" width="440" height="260" fill="url(#le-sky)" stroke={K} strokeWidth="12" />
          <path d="M60 760 H500" stroke="#E8E2D0" strokeWidth="10" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${80 + i * 55} 760 V810`} stroke="#E8E2D0" strokeWidth="8" />)}
          <path d="M280 560 V820" stroke={K} strokeWidth="10" />
          {/* luce del giorno che entra dalla finestra */}
          <Glow id="le-win" x={280} y={700} r={360} t={t} color="#FFF4D8" amp={0.04} rate={1} opacity={0.45} />
          {OWLS.slice(0, 3).map(([x, y], i) => <g key={i} opacity={owls(i)}><Owl x={x} y={y + 30} s={0.55} t={t} color={i % 2 ? '#B8A07A' : '#F4F1E6'} /></g>)}
        </g>
        {/* parete con il camino da cui escono le lettere */}
        <g transform={L(0.5)}>
          <rect x="620" y="760" width="380" height="440" fill="#A8846A" stroke={K} strokeWidth="9" />
          <rect x="580" y="720" width="460" height="56" fill="#E8DCC0" stroke={K} strokeWidth="8" />
          <rect x="700" y="900" width="220" height="300" fill="#1E1810" stroke={K} strokeWidth="8" />
          <Glow id="le-hearth" x={810} y={1100} r={180} t={t} color="#FFB060" amp={0.1} rate={4} opacity={0.4 - 0.3 * flood} />
          {/* soprammobili in fila perfetta */}
          {[640, 720, 900, 980].map((x, i) => <rect key={x} x={x - 14} y={690 - (i % 2) * 14} width="28" height={30 + (i % 2) * 14} rx="4" fill={i % 2 ? '#6A8AAA' : '#C9A060'} stroke={K} strokeWidth="4" />)}
          {/* gufi sul davanzale interno */}
          {OWLS.slice(3).map(([x, y], i) => <g key={i} opacity={owls(i + 3) * flood}><Owl x={x - 640} y={y - 300} s={0.6} t={t} /></g>)}
        </g>
        {/* lettere che volano dal camino */}
        <g transform={L(0.8)}>
          {FLY.map((f, i) => {
            const p = mod(t * (0.25 + 0.35 * flood) + f.ph, 1);
            const vis = i < 6 ? 1 : flood;
            return vis > 0 ? (
              <g key={i} opacity={vis * Math.min(1, (1 - p) * 3)}>
                <Letter x={810 + f.dx * p} y={1020 + f.dy * p + 500 * p * p} s={f.s} rot={f.rot * p} seal={P.principale} />
              </g>
            ) : null;
          })}
        </g>
        {/* poltrona e tavolino con la lettera strappata */}
        <g transform={L(1.0)}>
          <path d="M-200 1200 H1280 V2200 H-200 Z" fill="url(#le-carpet)" />
          <path d="M-120 1240 Q-120 1100 0 1100 H200 Q300 1100 300 1220 V1380 H-120 Z" fill="#6A8A6A" stroke={K} strokeWidth="9" />
          <path d="M-90 1240 H280" stroke="#8AAA8A" strokeWidth="8" />
          <rect x="380" y="1240" width="260" height="30" fill="#8A5A30" stroke={K} strokeWidth="6" />
          <path d="M410 1270 V1380 M610 1270 V1380" stroke={K} strokeWidth="10" />
          {/* la lettera intera sul tavolino; da «lo zio le strappa» si divide in due */}
          {torn <= 0 ? (
            <g transform="translate(510 1222)">
              <rect x="-62" y="-22" width="124" height="44" rx="3" fill="#EFE2C2" stroke={K} strokeWidth="4" />
              <path d="M-62 -22 L0 6 L62 -22" fill="none" stroke="#C9B48A" strokeWidth="3" />
              <circle cx="0" cy="6" r="8" fill={P.accento} stroke={K} strokeWidth="2" />
            </g>
          ) : (
            <>
              <g transform={`translate(${500 - 60 * torn} 1222) rotate(${-14 * torn})`}><path d="M-60 -20 H0 L-6 -4 L4 6 L-4 20 H-60 Z" fill="#EFE2C2" stroke={K} strokeWidth="4" /></g>
              <g transform={`translate(${520 + 60 * torn} 1222) rotate(${16 * torn})`}><path d="M60 -20 H0 L-6 -4 L4 6 L-4 20 H60 Z" fill="#EFE2C2" stroke={K} strokeWidth="4" /></g>
            </>
          )}
        </g>
        {/* lettera in primo piano con il sigillo (accento) */}
        <g transform={L(1.3)}>
          <Glow id="le-sealg" x={820} y={1660} r={200} t={t} color={P.accento} amp={0.08} rate={2} opacity={0.35} />
          <Letter x={820} y={1660} s={1.6} rot={-8} seal={P.accento} />
          <Letter x={180} y={1760} s={1.3} rot={12} seal={P.principale} />
        </g>
        <g transform={L(1.6)}><NearMotes id="le-near" t={t} color="#FFF4D8" n={5} y0={1300} opacity={0.08} /></g>
      </g>
      <Finish id="le" tint="#E8B04A" tintOpacity={0.08} />
    </svg>
  );
};
