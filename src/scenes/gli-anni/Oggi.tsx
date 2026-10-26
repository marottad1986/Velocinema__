import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Glow, NearMotes, Neon, Stars } from '../../lib/elements';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { K, ORANGE, TINT_NIGHT } from './Comune';

// Una canzone di tutti: stadio di notte visto dagli spalti vuoti. Migliaia di luci dei telefoni accese come stelle
// (solo luci, nessuna persona), un palco lontano con i fiori, un disco generico sul seggiolino; oltre gli spalti, alla
// fine, si accende l'insegna di un bar.
// Piani: cielo con le stelle (0,2) · tribuna di fronte con le luci (0,35) · palco con fiori e fari (0,5)
//        · prato con le luci più vicine (0,75) · spalti vicini, seggiolini, disco, insegna (1,15) · pulviscolo (1,6)
// Eventi: cues[0] il disco sul seggiolino brilla (la raccolta del 1998) · cues[1] si accendono le luci dello stadio
//         · cues[2] il palco si illumina e compaiono i fiori (Sanremo) · cues[3] le luci si abbassano e resta accesa
//         l'insegna del bar (la domanda finale).

const r = rng(2021);
const PHONES = Array.from({ length: 260 }, () => ({ x: -180 + r() * 1440, y: 760 + r() * 300, d: r(), ph: r() * 6 }));
const NEAR = Array.from({ length: 60 }, () => ({ x: -180 + r() * 1440, y: 1100 + r() * 160, d: r(), ph: r() * 6 }));
const FLOWERS = Array.from({ length: 12 }, (_, i) => ({ c: ['#E0303A', '#F2A23A', '#F4ECDD', '#E86A8A'][i % 4] }));

export const Oggi: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c0 = cues[0] ?? 0.1, c1 = cues[1] ?? 4.2, c2 = cues[2] ?? 7.5, c3 = cues[3] ?? 11.7;
  const disc = eob(seg(t, c0 + 0.3, c0 + 0.8));
  const crowd = (d: number) => seg(t, c1 + d * 2.5, c1 + d * 2.5 + 0.3);
  const stage = eo(seg(t, c2, c2 + 0.8));
  const dim = eo(seg(t, c3, c3 + 1.2));

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
          <path d="M-200 700 Q540 650 1280 700 V730 Q540 680 -200 730 Z" fill="#2A2840" stroke={K} strokeWidth="5" />
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M-200 ${780 + i * 44} Q540 ${736 + i * 46} 1280 ${780 + i * 44}`} stroke="#2A2840" strokeWidth="4" fill="none" />)}
          {PHONES.map((p, i) => (
            <rect key={i} x={p.x} y={p.y} width="3.5" height="6" rx="1" fill="#FFF0D0" opacity={crowd(p.d) * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 2 + p.ph))) * (1 - 0.7 * dim)} />
          ))}
          {[90, 990].map((x, i) => (
            <g key={i}>
              <path d={`M${x} 1060 V700`} stroke="#2A2840" strokeWidth="16" />
              <path d={`M${x - 20} 1060 L${x} 760 L${x + 20} 1060`} stroke="#2A2840" strokeWidth="6" fill="none" />
              <rect x={x - 80} y="650" width="160" height="70" rx="6" fill="#2A2840" stroke={K} strokeWidth="5" />
              {Array.from({ length: 8 }, (_, k) => <circle key={k} cx={x - 60 + (k % 4) * 40} cy={670 + Math.floor(k / 4) * 30} r="10" fill="#F4F8FF" opacity={0.25 + 0.75 * crowd(0) * (1 - 0.6 * dim)} />)}
              <Glow id={`og-tower${i}`} x={x} y={685} r={220} t={t} color="#E8F0FF" amp={0.03} rate={1} opacity={0.6 * crowd(0) * (1 - 0.6 * dim)} />
              <Beam id={`og-tb${i}`} x={x} y={700} t={t} length={520} spread={260} angle={i ? 120 : 60} color="#E8F0FF" opacity={0.18 * crowd(0) * (1 - 0.6 * dim)} />
            </g>
          ))}
        </g>

        {/* PIANO 2 — palco lontano con i fiori e i fari */}
        <g transform={L(0.5)}>
          {/* insegna di un bar oltre gli spalti: spenta, si accende sulla domanda finale */}
          <g transform="translate(900 860)">
            <path d="M0 22 V120" stroke="#2A2840" strokeWidth="8" />
            <rect x="-70" y="-40" width="140" height="62" rx="8" fill="#1A1220" stroke={K} strokeWidth="5" />
            <Neon id="og-bar" t={t} x={0} y={8} text="BAR" color={ORANGE} font={SANS} size={40} onAt={c3 + 0.4} />
          </g>
          <rect x="360" y="900" width="360" height="90" fill="#1A1626" stroke={K} strokeWidth="6" />
          <path d="M360 840 H720" stroke="#2A2840" strokeWidth="10" />
          <path d="M370 840 V900 M710 840 V900" stroke="#2A2840" strokeWidth="8" />
          <Glow id="og-stage" x={540} y={940} r={lerp(120, 320, stage)} t={t} color="#FFD8E8" amp={0.06} rate={2} opacity={0.2 + 0.6 * stage * (1 - 0.5 * dim)} />
          {[-1, 1].map((k) => (
            <Beam key={k} id={`og-sb${k}`} x={540 + k * 150} y={845} t={t} length={500} spread={160} angle={90 + k * 25} sweep={10} sweepRate={0.8 + k * 0.1} color={k > 0 ? '#9AD8FF' : '#FFB8D8'} opacity={0.35 * stage * (1 - 0.6 * dim)} />
          ))}
          {[400, 480, 600, 680].map((x, i) => (
            <g key={i} transform={`translate(${x} 990)`} opacity={0.3 + 0.7 * stage}>
              <path d="M-14 0 L-10 -24 H10 L14 0 Z" fill="#C8B8A8" stroke={K} strokeWidth="3" />
              {[-12, 0, 12].map((dx, j) => (
                <g key={j}>
                  <path d={`M0 -24 L${dx} -46`} stroke="#3A6A2E" strokeWidth="3" />
                  <circle cx={dx} cy={-50} r="8" fill={FLOWERS[(i * 3 + j) % FLOWERS.length].c} stroke={K} strokeWidth="2" />
                </g>
              ))}
            </g>
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
              <path d="M-56 -30 L-50 -120 Q0 -134 50 -120 L56 -30 Z" fill="#2F6EA6" stroke={K} strokeWidth="7" strokeLinejoin="round" />
              <path d="M-40 -110 Q0 -122 40 -110" stroke="#6AA0D8" strokeWidth="5" fill="none" opacity=".6" />
              <path d="M-62 -30 H62 L54 0 H-54 Z" fill="#245A8A" stroke={K} strokeWidth="6" strokeLinejoin="round" />
              <path d="M-40 0 V30 M40 0 V30" stroke={K} strokeWidth="8" />
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
          </g>
        </g>
        <g transform={L(1.35)}>
          {Array.from({ length: 5 }, (_, i) => (
            <g key={i} transform={`translate(${-100 + i * 300} 1760)`}>
              <path d="M-100 -60 L-90 -230 Q0 -254 90 -230 L100 -60 Z" fill="#245A8A" stroke={K} strokeWidth="10" strokeLinejoin="round" />
              <path d="M-70 -214 Q0 -232 70 -214" stroke="#6AA0D8" strokeWidth="6" fill="none" opacity=".5" />
              <path d="M-112 -60 H112 L98 0 H-98 Z" fill="#1E4A72" stroke={K} strokeWidth="9" strokeLinejoin="round" />
              <path d="M-70 0 V60 M70 0 V60" stroke={K} strokeWidth="14" />
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
