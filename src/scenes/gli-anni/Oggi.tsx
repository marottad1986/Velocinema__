import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Glow, NearMotes, Neon, Stars } from '../../lib/elements';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { K, ORANGE, TINT_NIGHT } from './Comune';

// Una canzone di tutti: stadio di notte visto dagli spalti vuoti. Migliaia di luci dei telefoni accese come stelle
// (solo luci, nessuna persona), un palco lontano con i fiori, un disco generico sul seggiolino; in primo piano, alla
// fine, si accende l'insegna di un bar.
// Piani: cielo con le stelle (0,2) · tribuna di fronte con le luci (0,35) · palco con fiori e fari (0,5)
//        · prato con le luci più vicine (0,75) · spalti vicini, seggiolini, disco, insegna (1,15) · pulviscolo (1,6)
// Eventi: cues[0] il disco sul seggiolino brilla (la raccolta del 1998) · cues[1] si accendono le luci dello stadio
//         · cues[2] il palco si illumina e compaiono i fiori (Sanremo) · cues[3] le luci si abbassano e resta accesa
//         l'insegna del bar (la domanda finale).

const r = rng(2021);
const PHONES = Array.from({ length: 260 }, () => ({ x: -180 + r() * 1440, y: 760 + r() * 300, d: r(), ph: r() * 6 }));
const NEAR = Array.from({ length: 60 }, () => ({ x: -180 + r() * 1440, y: 1100 + r() * 160, d: r(), ph: r() * 6 }));
const FLOWERS = Array.from({ length: 18 }, (_, i) => ({ x: 400 + i * 16 + r() * 10, y: 960 + r() * 20, c: ['#E0303A', '#F2A23A', '#F4ECDD', '#E86A8A'][i % 4] }));

export const Oggi: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c0 = cues[0] ?? 0.1, c1 = cues[1] ?? 4.2, c2 = cues[2] ?? 7.5, c3 = cues[3] ?? 11.7;
  const disc = eob(seg(t, c0 + 0.3, c0 + 0.8));
  const crowd = (d: number) => seg(t, c1 + d * 2.5, c1 + d * 2.5 + 0.3);
  const stage = eo(seg(t, c2, c2 + 0.8));
  const dim = eo(seg(t, c3, c3 + 1.2));
  const bar = seg(t, c3 + 0.4, c3 + 0.8);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="og" />
        <Lin id="og-sky" stops={[[0, '#060818'], [0.5, '#141838'], [1, '#2A2450']]} />
        <Lin id="og-stand" stops={[[0, '#1E1C30'], [1, '#100E1A']]} />
        <Lin id="og-pitch" stops={[[0, '#1E3A2A'], [1, '#0E1A14']]} />
        <Lin id="og-near" stops={[[0, '#2A2638'], [1, '#100E16']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo con le stelle (calmo in alto per il titolo) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#og-sky)" />
          <Stars t={t} seed={98} n={50} y={-100} h={800} color="#E8E0F0" size={0.9} />
        </g>

        {/* PIANO 1 — tribuna di fronte con le luci dei telefoni e le torri dei fari */}
        <g transform={L(0.35)}>
          <path d="M-200 740 Q540 690 1280 740 V1080 H-200 Z" fill="url(#og-stand)" />
          {[-60, 1140].map((x, i) => (
            <g key={i}>
              <path d={`M${x} 1060 V620`} stroke="#2A2840" strokeWidth="14" />
              <rect x={x - 70} y="580" width="140" height="60" rx="6" fill="#2A2840" stroke={K} strokeWidth="5" />
              <Glow id={`og-tower${i}`} x={x} y={610} r={260} t={t} color="#E8F0FF" amp={0.03} rate={1} opacity={0.6 * crowd(0) * (1 - 0.6 * dim)} />
            </g>
          ))}
          {PHONES.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={2.5 + p.d * 2} fill="#F4F8FF" opacity={crowd(p.d) * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2 + p.ph))) * (1 - 0.7 * dim)} />
          ))}
        </g>

        {/* PIANO 2 — palco lontano con i fiori e i fari */}
        <g transform={L(0.5)}>
          <rect x="360" y="900" width="360" height="90" fill="#1A1626" stroke={K} strokeWidth="6" />
          <path d="M360 840 H720" stroke="#2A2840" strokeWidth="10" />
          <path d="M370 840 V900 M710 840 V900" stroke="#2A2840" strokeWidth="8" />
          <Glow id="og-stage" x={540} y={940} r={lerp(120, 320, stage)} t={t} color="#FFD8E8" amp={0.06} rate={2} opacity={0.2 + 0.6 * stage * (1 - 0.5 * dim)} />
          {[-1, 1].map((k) => (
            <Beam key={k} id={`og-sb${k}`} x={540 + k * 150} y={845} t={t} length={500} spread={160} angle={90 + k * 25} sweep={10} sweepRate={0.8 + k * 0.1} color={k > 0 ? '#9AD8FF' : '#FFB8D8'} opacity={0.35 * stage * (1 - 0.6 * dim)} />
          ))}
          {FLOWERS.map((f, i) => (
            <circle key={i} cx={f.x + 14} cy={f.y - 10} r={9} fill={f.c} stroke={K} strokeWidth="2" opacity={stage} />
          ))}
        </g>

        {/* PIANO 3 — prato con le luci più vicine */}
        <g transform={L(0.75)}>
          <path d="M-200 1080 Q540 1050 1280 1080 V1300 H-200 Z" fill="url(#og-pitch)" />
          {NEAR.map((p, i) => (
            <g key={i} opacity={crowd(p.d) * (1 - 0.7 * dim)}>
              <circle cx={p.x} cy={p.y} r={10} fill="#F4F8FF" opacity={0.15} />
              <circle cx={p.x} cy={p.y} r={4} fill="#FFFFFF" opacity={0.6 + 0.4 * Math.sin(t * 2.5 + p.ph)} />
            </g>
          ))}
        </g>

        {/* PIANO 4 — spalti vicini: seggiolini, ringhiera, disco e insegna del bar */}
        <g transform={L(1.15)}>
          <g transform="translate(0 -150)">
          <path d="M-200 1280 H1280 V2200 H-200 Z" fill="url(#og-near)" />
          <path d="M-200 1290 H1280" stroke="#8A8698" strokeWidth="8" />
          {[1290, 1250].map((y, i) => <path key={i} d={`M-200 ${y - 40 * i} H1280`} stroke="#3A3648" strokeWidth="5" opacity={i ? 0.7 : 0} />)}
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i} transform={`translate(${-140 + i * 170} 1420)`}>
              <path d="M-60 0 Q-60 -90 0 -96 Q60 -90 60 0 Z" fill="#2F6EA6" stroke={K} strokeWidth="7" />
              <path d="M-66 0 H66 V24 H-66 Z" fill="#245A8A" stroke={K} strokeWidth="6" />
            </g>
          ))}
          {/* disco generico sul seggiolino */}
          <g transform="translate(370 1370)">
            <Glow id="og-disc" x={0} y={0} r={150} t={t} color={ORANGE} amp={0.1} rate={3} opacity={0.6 * disc * (1 - 0.5 * dim)} />
            <circle r="58" fill="#E8E8F0" stroke={K} strokeWidth="6" />
            <circle r="58" fill="none" stroke="#9AD8FF" strokeWidth="6" opacity=".5" transform={`rotate(${t * 40})`} strokeDasharray="40 30" />
            <circle r="16" fill={ORANGE} stroke={K} strokeWidth="4" />
            <circle r="5" fill={K} />
          </g>
          {/* insegna del bar che resta accesa */}
          <g transform="translate(880 1230)">
            <rect x="-120" y="-70" width="240" height="96" rx="12" fill="#1A1220" stroke={K} strokeWidth="7" opacity={0.3 + 0.7 * bar} />
            <g opacity={bar}>
              <Neon id="og-bar" t={t} x={0} y={0} text="BAR" color={ORANGE} font={SANS} size={64} onAt={c3 + 0.4} />
            </g>
          </g>
          </g>
        </g>
        <g transform={L(1.35)}>
          {Array.from({ length: 5 }, (_, i) => (
            <g key={i} transform={`translate(${-100 + i * 300} 1760)`}>
              <path d="M-110 0 Q-110 -170 0 -180 Q110 -170 110 0 Z" fill="#245A8A" stroke={K} strokeWidth="10" />
              <path d="M-90 -120 Q-60 -160 0 -164" stroke="#6AA0D8" strokeWidth="6" fill="none" opacity=".5" />
              <path d="M-120 0 H120 V44 H-120 Z" fill="#1E4A72" stroke={K} strokeWidth="9" />
            </g>
          ))}
        </g>
        <g transform={L(1.6)}>
          <NearMotes id="og-near" t={t} color="#D8E0FF" opacity={0.06} />
        </g>
      </g>

      <Finish id="og" tint={TINT_NIGHT} tintOpacity={0.1} />
    </svg>
  );
};
