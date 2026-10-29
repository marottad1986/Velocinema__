import React from 'react';
import { camera, eio, eo, rng, seg } from '../../lib/anim';
import { Fog, Glow, NearMotes, Stars, WaveLines } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Iceberg as Berg, K, Lifeboat } from './Comuni';

// L'iceberg: notte senza luna e mare piatto come uno specchio; l'iceberg enorme emerge dal buio davanti alla prua; su
// «urta un iceberg» la prua lo struscia, la campana d'allarme dondola, scaglie di ghiaccio cadono sul ponte e la scena
// trema; su «affonderà in meno di tre ore» le luci tremolano e la prua si abbassa; su «le scialuppe bastano solo per metà»
// poche scialuppe appese sul ponte con molti posti vuoti (accento). Nessuna persona.
// Piani: cielo (0,15) · mare (0,35) · iceberg (0,55) · prua e campana (0,8) · ghiaccio e scialuppe (1,1) · gelo (1,6)

const r = rng(1414);
const ICE = Array.from({ length: 14 }, () => ({ x: 380 + r() * 400, s: 10 + r() * 22, d: r() * 0.6, v: 300 + r() * 300 }));

export const Iceberg: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const near = eio(seg(t, 0, cues[0] + 2)); // l'iceberg si avvicina
  const hit = cues[0] + 2.2; // la prua struscia sull'iceberg
  const shake = t > hit && t < hit + 1 ? Math.sin(t * 70) * 10 * (1 - (t - hit)) : 0;
  const sink = eo(seg(t, cues[1], cues[1] + 2)); // la prua si abbassa
  const flicker = t > cues[1] && t < cues[1] + 1.5 ? (Math.sin(t * 18) > 0 ? 1 : 0.4) : 1;
  const boats = eo(seg(t, cues[2], cues[2] + 0.8)); // le poche scialuppe

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ib" />
        <Lin id="ib-sky" stops={[[0, '#02040A'], [0.7, '#0A1424'], [1, '#14223A']]} />
        <Lin id="ib-sea" stops={[[0, '#0E1A2A'], [1, '#02060C']]} />
      </defs>
      <g transform={`translate(${shake} ${shake * 0.4})`}>
        <g transform={cam.transform}>
          <g transform={L(0.15)}>
            <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ib-sky)" />
            <Stars t={t} n={90} y={-100} h={900} seed={41} />
          </g>
          <g transform={L(0.35)}>
            <path d="M-200 900 H1280 V2200 H-200 Z" fill="url(#ib-sea)" />
            <WaveLines t={t} ys={[940, 1010, 1100]} color="#3A5A7A" amp={2} speed={10} opacity={0.3} />
            <Fog id="ib-fog" t={t} y={900} color="#8AA8C8" rx={900} ry={50} opacity={0.3} />
          </g>
          {/* l'iceberg che cresce dal buio */}
          <g transform={L(0.55)}>
            <g transform={`translate(${700 - 120 * near} 920) scale(${0.4 + 0.55 * near}) translate(-700 -900)`}>
              <Berg x={700} y={900} s={1.4} below />
              <Glow id="ib-berg" x={700} y={700} r={500} t={t} color="#BFE0F0" amp={0.04} rate={1} opacity={0.2} />
            </g>
          </g>
          {/* la prua vista da sopra il ponte, con la campana della coffa */}
          <g transform={`${L(0.8)} rotate(${-3 * sink} 540 1400) translate(0 ${60 * sink})`}>
            <path d="M-200 2200 L380 1120 L1280 1500 V2200 Z" fill="#7A5E40" stroke={K} strokeWidth="9" />
            <path d="M380 1120 L1280 1500" stroke="#F4EEE2" strokeWidth="12" />
            <path d="M380 1120 L-200 2200" stroke="#F4EEE2" strokeWidth="12" />
            <g transform="translate(260 760)">
              <path d="M0 600 V0" stroke={K} strokeWidth="16" />
              <rect x="-60" y="-10" width="120" height="70" rx="8" fill="#3A2A20" stroke={K} strokeWidth="6" />
              <g transform={`rotate(${t > hit - 1.5 ? Math.sin(t * 9) * 28 : 0} 0 -20)`}>
                <path d="M-26 -20 Q-30 30 -40 46 H40 Q30 30 26 -20 Q0 -36 -26 -20 Z" fill="#D9B05A" stroke={K} strokeWidth="5" />
              </g>
              <Glow id="ib-mast" x={0} y={-40} r={160} t={t} color="#FFE2A0" amp={0.06} rate={3} opacity={0.4 * flicker} />
            </g>
          </g>
          {/* scaglie di ghiaccio che cadono sul ponte e le poche scialuppe */}
          <g transform={L(1.1)}>
            {t > hit && ICE.map((c, i) => {
              const p = Math.min(1, Math.max(0, (t - hit - c.d) / 1.2));
              return p > 0 ? <path key={i} d={`M0 0 l${c.s} ${-c.s * 0.6} l${c.s * 0.7} ${c.s} Z`} fill="#E8F4FA" stroke={K} strokeWidth="2" transform={`translate(${c.x + p * 80} ${700 + p * c.v + p * p * 300}) rotate(${p * 200 + i * 30})`} opacity={1 - p * 0.3} /> : null;
            })}
            <g opacity={boats} transform={`translate(0 ${30 * (1 - boats)})`}>
              {[180, 820].map((x, i) => (
                <g key={x}>
                  <path d={`M${x - 100} 1240 V1120 q0 -20 20 -20 M${x + 100} 1240 V1120 q0 -20 -20 -20`} stroke={K} strokeWidth="8" fill="none" />
                  <Lifeboat x={x} y={1170} s={0.9} />
                  <Glow id={`ib-b${i}`} x={x} y={1150} r={150} t={t} color={P.accento} amp={0.1} rate={3} opacity={0.35} />
                </g>
              ))}
              {[340, 500, 660].map((x) => <g key={x}><path d={`M${x - 50} 1240 V1150 M${x + 50} 1240 V1150`} stroke={K} strokeWidth="6" opacity=".6" /><path d={`M${x - 70} 1180 H${x + 70}`} stroke="#F4EEE2" strokeWidth="4" strokeDasharray="10 10" opacity=".6" /></g>)}
            </g>
          </g>
          <g transform={L(1.6)}>
            <NearMotes id="ib-near" t={t} color="#DDEFFF" n={7} opacity={0.08} />
          </g>
        </g>
      </g>
      <rect width="1080" height="1920" fill="#000" opacity={0.25 * (1 - flicker)} />
      <Finish id="ib" tint="#0A1A2E" tintOpacity={0.16} />
    </svg>
  );
};
