import React from 'react';
import { camera, eo, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, NearMotes, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Fence, Fern, JungleTree, K } from './Comuni';

// Senza corrente: la recinzione altissima con il cartello 10.000 VOLT, una centralina con la grande leva; il cancello
// delle gabbie dei raptor che si apre quando riavviano tutto; poi le lampade lungo la recinzione si riaccendono una dopo
// l'altra e i cavi fanno scintille (la scossa).
// Piani: cielo (0,2) · giungla (0,4) · gabbie dei raptor (0,5) · recinzione (0,65) · centralina con leva (1,0) · felci (1,25) · scintille (1,6)

const r = rng(1000);
const SPARKS = Array.from({ length: 18 }, () => ({ a: r() * Math.PI * 2, v: 80 + r() * 220, s: 3 + r() * 5 }));

export const Corrente: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const gate = eo(seg(t, cues[1], cues[1] + 1.2)); // «si aprono le gabbie dei velociraptor»
  const lever = eo(seg(t, cues[3] - 0.2, cues[3] + 0.4)); // «Ellie riaccende la corrente»
  const lampOn = (i: number) => seg(t, cues[3] + 0.3 + i * 0.25, cues[3] + 0.45 + i * 0.25);
  const zap = seg(t, cues[4] + 1.2, cues[4] + 2.0); // la scossa sulla recinzione
  const flash = flashAt(t, [cues[4] + 1.2], [0.8]);
  const glow = seg(t, cues[3] + 0.3, cues[3] + 1.5);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="co" />
        <Lin id="co-sky" stops={[[0, '#4E6A6A'], [0.4, '#8AA49A'], [0.6, '#C4D0B8']]} />
        <Lin id="co-ground" stops={[[0, '#4A5A3A'], [1, '#1E2814']]} />
        <Lin id="co-box" x2={1} y2={0} stops={[[0, '#6A7470'], [0.5, '#9AA4A0'], [1, '#5A6460']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#co-sky)" />
        </g>
        <g transform={L(0.4)}>
          {[-60, 180, 900, 1140].map((x, i) => <JungleTree key={x} x={x} y={1100} h={220 + (i % 2) * 50} t={t} ph={i} outline={false} leaf="#3A6A4A" trunk="#4A3A28" />)}
        </g>
        {/* gabbia dei raptor con il cancello che si apre */}
        <g transform={L(0.5)}>
          <rect x="420" y="820" width="320" height="280" fill="#3A403A" stroke={K} strokeWidth="7" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${440 + i * 35} 830 V1100`} stroke="#22261E" strokeWidth="8" />)}
          <g transform={`translate(${540 - 200 * gate} 0)`}>
            <rect x="480" y="880" width="120" height="220" fill="#5A605A" stroke={K} strokeWidth="6" />
            {[0, 1, 2].map((i) => <path key={i} d={`M${500 + i * 40} 890 V1090`} stroke="#2A2E2A" strokeWidth="6" />)}
          </g>
          <rect x="560" y="840" width="40" height="22" rx="4" fill={gate > 0 ? '#E8503A' : '#7CFF8A'} opacity={gate > 0 ? (mod(t, 0.6) < 0.3 ? 1 : 0.3) : 0.9} />
          {gate > 0 && <Glow id="co-alarm" x={580} y={850} r={120} t={t} color="#E8503A" amp={0} opacity={mod(t, 0.6) < 0.3 ? 0.5 : 0.1} />}
        </g>
        {/* la recinzione altissima: le lampade si riaccendono una dopo l'altra (accento sul cartello) */}
        <g transform={L(0.65)}>
          <path d="M-200 1100 Q540 1070 1280 1110 V1500 H-200 Z" fill="url(#co-ground)" stroke={K} strokeWidth="6" />
          <Fence x0={-100} x1={1180} y={1190} h={560} posts={5} accent={P.accento} glow={glow} />
          {[-100, 220, 540, 860, 1180].map((x, i) => (
            <g key={i}>
              <circle cx={x} cy={616} r="14" fill={lampOn(i) > 0 ? '#FFF4C8' : '#3A3E3A'} stroke={K} strokeWidth="4" />
              {lampOn(i) > 0 && <Glow id={`co-l${i}`} x={x} y={616} r={110} t={t} color="#FFF4C8" amp={0.06} rate={4 + i} opacity={0.7 * lampOn(i)} />}
            </g>
          ))}
          {zap > 0 && zap < 1 && (
            <g transform="translate(380 900)">
              <Glow id="co-zap" x={0} y={0} r={200} t={t} color="#BFE6FF" amp={0} opacity={0.9 * (1 - zap)} />
              {SPARKS.map((s, i) => <circle key={i} cx={Math.cos(s.a) * s.v * zap} cy={Math.sin(s.a) * s.v * zap + 200 * zap * zap} r={s.s} fill="#FFF8D0" opacity={1 - zap} />)}
              <path d={`M-60 -20 L-20 10 L-40 30 L10 60 L-10 80 L40 110`} fill="none" stroke="#E9F6FF" strokeWidth="6" opacity={1 - zap} />
            </g>
          )}
        </g>
        {/* centralina con la grande leva in primo piano */}
        <g transform={L(1.0)}>
          <rect x="740" y="1180" width="300" height="360" rx="14" fill="url(#co-box)" stroke={K} strokeWidth="9" />
          <rect x="770" y="1210" width="240" height="70" fill="#2A302C" stroke={K} strokeWidth="5" />
          {[0, 1, 2, 3].map((i) => <circle key={i} cx={800 + i * 60} cy="1245" r="14" fill={lever > 0.5 ? '#7CFF8A' : '#5A2A22'} stroke={K} strokeWidth="3" />)}
          <rect x="860" y="1300" width="60" height="200" rx="10" fill="#3A403C" stroke={K} strokeWidth="6" />
          <g transform={`rotate(${-50 + 100 * lever} 890 1400)`}>
            <path d="M890 1400 V1290" stroke={K} strokeWidth="26" strokeLinecap="round" />
            <path d="M890 1400 V1290" stroke="#C9CED2" strokeWidth="14" strokeLinecap="round" />
            <circle cx="890" cy="1284" r="26" fill={P.accento} stroke={K} strokeWidth="6" />
          </g>
          <path d="M1040 1260 Q1140 1260 1180 1340 Q1220 1460 1280 1480" fill="none" stroke={K} strokeWidth="18" />
          <path d="M1040 1260 Q1140 1260 1180 1340 Q1220 1460 1280 1480" fill="none" stroke="#2A2E2A" strokeWidth="10" />
        </g>
        <g transform={L(1.25)}>
          <Fern x={40} y={1920} s={2.6} t={t} ph={0.5} />
          <Fern x={560} y={2000} s={1.8} t={t} ph={1} color="#24683F" />
        </g>
        <g transform={L(1.6)}><NearMotes id="co-near" t={t} color="#E9F6FF" n={6} y0={1300} opacity={0.08 + 0.05 * glow} /></g>
      </g>
      <rect width="1080" height="1920" fill="#E9F6FF" opacity={flash * 0.15} />
      <Finish id="co" tint="#1E4A30" tintOpacity={0.1} />
    </svg>
  );
};
