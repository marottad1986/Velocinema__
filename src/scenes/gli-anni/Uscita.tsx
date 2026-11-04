import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, NearMotes, Neon, Reflection } from '../../lib/elements';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { K, ORANGE, TINT_NIGHT } from './Comune';

// Nostalgia a venticinque anni: vetrina di un negozio di dischi di sera. Cassette e CD esposti (generici, senza
// copertine vere), una classifica con il primo posto, un calendario del 1995, una torta con le candeline del 25,
// un orologio da muro; sul vetro, alla fine, il riflesso dell'insegna di un bar.
// Piani: muro della via (0,2) · facciata, tenda, vetrina e interno (0,45) · marciapiede, lampione (0,9)
//        · pozzanghere e bordo del marciapiede (1,2) · pulviscolo (1,7)
// Eventi: cues[0] la vetrina si accende · cues[1] in classifica il disco sale al primo posto · cues[2] si accendono
//         le candeline del 25 · cues[3] le lancette dell'orologio girano all'indietro · cues[4] sul vetro si riflette
//         l'insegna di un bar (il ritorno).

const r = rng(2512);
const ITEMS = Array.from({ length: 24 }, (_, i) => ({ x: 170 + (i % 8) * 64, y: 760 + Math.floor(i / 8) * 90, c: ['#E0303A', '#2F6EA6', ORANGE, '#7AD06A', '#B85AD0', '#F4ECDD'][Math.floor(r() * 6)], cd: r() > 0.5 }));

export const Uscita: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c0 = cues[0] ?? 0.1, c1 = cues[1] ?? 2.7, c2 = cues[2] ?? 6.9, c3 = cues[3] ?? 9.1, c4 = cues[4] ?? 12.2;
  const on = eo(seg(t, c0, c0 + 0.6));
  const up = eob(seg(t, c1 + 0.8, c1 + 1.8));
  const candles = seg(t, c2 + 0.2, c2 + 0.5);
  const back = eo(seg(t, c3, dur));
  const clockMin = t * 20 - back * 1440;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="us" />
        <Lin id="us-wall" stops={[[0, '#141428'], [0.5, '#262440'], [1, '#1A1A30']]} />
        <Lin id="us-shop" stops={[[0, '#FFE8C0'], [0.6, '#F2C890'], [1, '#C89060']]} />
        <Lin id="us-awn" x2={1} y2={0} stops={[[0, '#C8303A'], [0.5, '#E84A4A'], [1, '#A82030']]} />
        <Lin id="us-walk" stops={[[0, '#3A3848'], [1, '#14121C']]} />
        <Lin id="us-glass" x2={1} y2={1} stops={[[0, '#FFFFFF', 0.12], [0.4, '#FFFFFF', 0], [0.55, '#FFFFFF', 0.08], [1, '#FFFFFF', 0]]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — muro della via di sera (calmo in alto per il titolo) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1600" fill="url(#us-wall)" />
          {[[-120, 300], [960, 260]].map(([x, y], i) => <rect key={i} x={x} y={y} width="120" height="160" rx="6" fill="#2E2C48" stroke="#14121C" strokeWidth="6" />)}
        </g>

        {/* PIANO 1 — facciata del negozio, tenda a strisce, vetrina con l'interno */}
        <g transform={L(0.45)}>
          <g transform="translate(0 40)">
          <rect x="60" y="600" width="960" height="640" fill="#3A2A2A" stroke={K} strokeWidth="9" />
          <rect x="100" y="680" width="880" height="500" fill="url(#us-shop)" opacity={0.35 + 0.65 * on} />
          <Glow id="us-in" x={540} y={930} r={560} t={t} color="#FFD9A0" amp={0.03} rate={1.4} opacity={0.35 * on} />
          {/* scaffali con cassette e CD generici */}
          {[840, 930, 1020].map((y, i) => <path key={i} d={`M150 ${y} H680`} stroke="#6A4A32" strokeWidth="8" />)}
          {ITEMS.map((it, i) => (
            <g key={i} transform={`translate(${it.x} ${it.y})`}>
              {it.cd ? (
                <>
                  <rect x="-24" y="-52" width="48" height="52" rx="3" fill={it.c} stroke={K} strokeWidth="4" />
                  <circle cx="0" cy="-26" r="14" fill="#F4ECDD" opacity=".8" />
                  <circle cx="0" cy="-26" r="4" fill={K} />
                </>
              ) : (
                <>
                  <rect x="-18" y="-60" width="36" height="60" rx="3" fill={it.c} stroke={K} strokeWidth="4" />
                  <rect x="-12" y="-46" width="24" height="12" fill="#F4ECDD" opacity=".8" />
                </>
              )}
            </g>
          ))}
          {/* calendario del 1995 */}
          <g transform="translate(220 720)">
            <rect x="-60" y="-10" width="120" height="70" rx="4" fill="#F4ECDD" stroke={K} strokeWidth="5" />
            <rect x="-60" y="-10" width="120" height="22" fill="#C8303A" stroke={K} strokeWidth="5" />
            <text x="0" y="48" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="30" fill={K}>1995</text>
          </g>
          {/* orologio da muro che torna indietro */}
          <g transform="translate(640 1110)">
            <circle r="44" fill="#F4ECDD" stroke={K} strokeWidth="6" />
            {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 -36 V-30" stroke={K} strokeWidth="4" transform={`rotate(${i * 30})`} />)}
            <path d="M0 0 V-22" stroke={K} strokeWidth="6" strokeLinecap="round" transform={`rotate(${clockMin / 12})`} />
            <path d="M0 0 V-32" stroke={back > 0.02 ? ORANGE : K} strokeWidth="4" strokeLinecap="round" transform={`rotate(${clockMin})`} />
            <circle r="4" fill={K} />
          </g>
          {/* classifica: il disco sale al primo posto */}
          <g transform="translate(700 720)">
            <rect x="0" y="0" width="220" height="290" rx="8" fill="#F4ECDD" stroke={K} strokeWidth="6" />
            {[0, 1, 2, 3, 4].map((i) => {
              const gold = i === 4;
              const slot = gold ? lerp(4, 0, up) : i + (up > 0.5 ? 1 : 0);
              return (
                <g key={i} transform={`translate(0 ${20 + Math.min(slot, 4) * 52})`}>
                  <text x="24" y="30" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="26" fill="#8A5A4A">{Math.round(Math.min(slot, 4)) + 1}</text>
                  <rect x="46" y="6" width={gold ? 150 : 140 - i * 18} height="30" rx="6" fill={gold ? ORANGE : '#C8B8A8'} stroke={K} strokeWidth="4" />
                </g>
              );
            })}
            <Glow id="us-top" x={120} y={40} r={160} t={t} color={ORANGE} amp={0.1} rate={3} opacity={0.6 * up} />
          </g>
          {/* bancone con la torta del 25 */}
          <rect x="250" y="1080" width="300" height="100" fill="#6A4A32" stroke={K} strokeWidth="7" />
          <g transform="translate(400 1080)">
            <Glow id="us-cake" x={0} y={-110} r={200} t={t} color={ORANGE} amp={0.12} rate={7} opacity={0.95 * candles} />
            <rect x="-80" y="-56" width="160" height="56" rx="10" fill="#F4D8E0" stroke={K} strokeWidth="6" />
            <path d="M-80 -40 q20 14 40 0 t40 0 t40 0 t40 0" fill="none" stroke="#E86A8A" strokeWidth="6" />
            <text x="-22" y="-62" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="56" fill="#F2A23A" stroke={K} strokeWidth="3">2</text>
            <text x="22" y="-62" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="56" fill="#F2A23A" stroke={K} strokeWidth="3">5</text>
            {[-22, 22].map((x, i) => (
              <path key={i} d={`M${x} -100 q${6 + Math.sin(t * 9 + i) * 3} -12 0 -24 q-6 12 0 24 Z`} fill="#FFE070" stroke={K} strokeWidth="2" opacity={candles} />
            ))}
          </g>
          {/* vetro, riflesso e insegna del bar riflessa */}
          <rect x="100" y="680" width="880" height="500" fill="url(#us-glass)" />
          <g opacity={seg(t, c4, c4 + 0.6)}>
            <path d="M560 1180 L700 960 H980 V1180 Z" fill="#14121C" opacity=".55" />
            <Glow id="us-barg" x={820} y={1120} r={200} t={t} color="#FF6A8A" amp={0.08} rate={3} opacity={0.6} />
            <Neon id="us-bar" t={t} x={760} y={1150} text="BAR" color="#FF6A8A" font={SANS} size={90} onAt={c4} />
          </g>
          <rect x="100" y="680" width="880" height="500" fill="none" stroke={K} strokeWidth="12" />
          <path d="M540 680 V1180" stroke={K} strokeWidth="8" />
          {/* tenda a strisce */}
          <path d={`M30 600 H1050 L1010 ${676 + Math.sin(t * 1.2) * 3} H70 Z`} fill="url(#us-awn)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${120 + i * 110} 600 L${116 + i * 104} 676`} stroke="#F4ECDD" strokeWidth="26" opacity=".85" />)}
          </g>
        </g>

        {/* PIANO 2 — marciapiede e lampione */}
        <g transform={L(0.9)}>
          <rect x="-200" y="1240" width="1480" height="800" fill="url(#us-walk)" />
          <path d="M-200 1240 H1280" stroke={K} strokeWidth="8" />
          <Reflection t={t} x={540} y={1260} color="#FFD9A0" n={7} w={260} gap={22} opacity={0.35 * on} />
          <g transform="translate(40 1250)">
            <path d="M0 0 V-540 Q0 -580 60 -580" stroke={K} strokeWidth="14" fill="none" />
            <Glow id="us-lamp" x={70} y={-568} r={160} t={t} color="#FFE7A0" amp={0.04} rate={2} opacity={0.6} />
            <path d="M40 -584 H100 L90 -560 H50 Z" fill="#3A3448" stroke={K} strokeWidth="5" />
            {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={70 + Math.sin(t * (3 + i) + i * 2) * 50} cy={-540 + Math.cos(t * (2.4 + i) + i) * 40} r="3.5" fill="#FFF3CF" opacity=".8" />)}
          </g>
        </g>

        {/* PIANO 3 — bordo del marciapiede in rilievo, pozzanghera con il riflesso, portabici e cestino */}
        <g transform={L(1.2)}>
          <path d="M-200 1560 H1280 V2200 H-200 Z" fill="#100E16" />
          <path d="M-200 1540 H1280 V1580 H-200 Z" fill="#5A5868" stroke={K} strokeWidth="8" />
          <path d="M-200 1546 H1280" stroke="#9A98A8" strokeWidth="4" opacity=".6" />
          <ellipse cx="460" cy="1720" rx="300" ry="46" fill="#2A2840" />
          <Reflection t={t} x={460} y={1690} color="#FFD9A0" n={4} w={220} gap={16} opacity={0.35 * on} />
          <g stroke={K} strokeWidth="12" fill="none">
            {[0, 1, 2].map((i) => <path key={i} d={`M${-80 + i * 70} 1700 V1600 Q${-80 + i * 70} 1560 ${-40 + i * 70} 1560 Q${0 + i * 70} 1560 ${0 + i * 70} 1600 V1700`} stroke="#8A8698" />)}
          </g>
          <g transform="translate(1010 1760)">
            <path d="M-80 0 L-66 -200 H66 L80 0 Z" fill="#3A5A4A" stroke={K} strokeWidth="9" strokeLinejoin="round" />
            <path d="M-90 -200 H90" stroke={K} strokeWidth="14" />
            {[-40, 0, 40].map((x) => <path key={x} d={`M${x} -180 V-20`} stroke="#2A4A3A" strokeWidth="6" />)}
          </g>
        </g>
        <g transform={L(1.7)}>
          <NearMotes id="us-near" t={t} color="#FFE2C0" opacity={0.07} />
        </g>
      </g>

      <Finish id="us" tint={TINT_NIGHT} tintOpacity={0.1} />
    </svg>
  );
};
