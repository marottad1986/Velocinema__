import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { K, Ombra, SestoDefs } from './Comuni';

// Il segreto di Cole: l'ingresso di una casa durante una festa di compleanno. La scala sale da sinistra a destra con
// la ringhiera e i palloncini; sotto la scala la porticina dello sgabuzzino con il chiavistello; un festone, il tavolo
// con la torta e i bicchieri di carta. Il palloncino rosso è legato alla maniglia della porticina.
// Eventi: 1ª frase il chiavistello scorre e chiude la porticina; 2ª frase la porticina trema forte, nella fessura
// lampeggia una luce fredda e il palloncino rosso strattona; 3ª frase il chiavistello salta, la porticina si apre su
// una luce azzurra gelida e il palloncino rosso si libera e sale. Nessuna persona.
// Piani: parete con i quadri (0,3) · scala, sottoscala e porticina (0,55) · palloncini e festone (0,7)
//        · tavolo con la torta in primo piano (1,2) · pulviscolo e coriandoli (1,5–1,8)

const STAIR = (x: number) => 1250 - (x - 140) * 0.66; // quota del filo dei gradini

export const Festa: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const lock = eo(seg(t, griglia(cues[0] + 1.2), griglia(cues[0] + 1.2) + 0.35));
  const shakeOn = seg(t, griglia(cues[1] + 0.2), griglia(cues[1] + 0.3)) * (1 - seg(t, griglia(cues[2] + 0.3), griglia(cues[2] + 0.4)));
  const shake = shakeOn * (Math.sin(t * 47) * 8 + Math.sin(t * 23) * 5);
  const burst = griglia(cues[2] + 0.4);
  const open = eob(seg(t, burst, burst + 0.45), 1.2);
  const flick = shakeOn * (0.7 + 0.3 * Math.sin(t * 17) * Math.sin(t * 5.3));
  const rise = eo(seg(t, burst + 0.2, burst + 3.2));
  const DX = 650, DY = 1250, DW = 210, DH = 250;
  const KX = DX + DW - 30, KY = DY - DH * 0.5; // maniglia
  const bx = lerp(KX + 40 + shake, 560, rise), by = lerp(KY - 210, 720, rise) + Math.sin(t * 2) * 8;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fe" />
        <SestoDefs id="fe" />
        <Lin id="fe-wall" stops={[[0, '#1E1A1A'], [0.4, '#3A3430'], [0.7, '#4A423A'], [1, '#2A2420']]} />
        <Lin id="fe-floor" stops={[[0, '#4A3424'], [0.5, '#2A1C12'], [1, '#0A0604']]} />
        <Lin id="fe-stringer" x2={1} y2={1} stops={[[0, '#E8E2D4'], [1, '#A8A090']]} />
        <Lin id="fe-under" stops={[[0, '#C8C2B4'], [1, '#8A8476']]} />
        <Lin id="fe-cloth" stops={[[0, '#F2EEE6'], [1, '#B8B0A4']]} />
        <radialGradient id="fe-cold" cx=".5" cy=".5" r=".6"><stop offset="0" stopColor="#F2FAFF" /><stop offset=".5" stopColor="#A8D4F4" /><stop offset="1" stopColor="#3A6A9A" /></radialGradient>
        {['#E8C860', '#7AB8D8', '#E8A0B8', '#A8D890'].map((c, i) => (
          <radialGradient key={i} id={`fe-b${i}`} cx=".35" cy=".3" r=".75"><stop offset="0" stopColor="#FFFFFF" stopOpacity=".9" /><stop offset=".25" stopColor={c} /><stop offset="1" stopColor={c} stopOpacity=".75" /></radialGradient>
        ))}
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete con la carta a fiorellini e la lampada (0,3) */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#fe-wall)" />
          {Array.from({ length: 70 }, (_, i) => {
            const x = -160 + (i % 14) * 100 + (Math.floor(i / 14) % 2) * 50, y = 640 + Math.floor(i / 14) * 120;
            return <circle key={i} cx={x} cy={y} r="6" fill="#8A7A5A" opacity=".25" />;
          })}
          <Glow id="fe-lamp" x={300} y={760} r={420} t={t} color="#FFD08A" amp={0.04} rate={2} opacity={0.45} />
        </g>

        {/* PIANO 1 — la scala, il sottoscala e la porticina dello sgabuzzino (0,55) */}
        <g transform={L(0.55)} strokeLinejoin="round">
          <path d="M-200 1250 H1280 V2200 H-200 Z" fill="url(#fe-floor)" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M-200 ${1270 + i * i * 12} H1280`} stroke="#000" strokeWidth="3" opacity=".3" />)}
          {/* fianco del sottoscala: triangolo intonacato */}
          <path d={`M140 1250 L1000 ${STAIR(1000)} V1250 Z`} fill="url(#fe-under)" stroke={K} strokeWidth="8" />
          <path d={`M180 1240 L990 ${STAIR(990) + 14}`} stroke="#000" strokeWidth="3" opacity=".15" />
          <path d={`M140 1250 L1000 ${STAIR(1000)} L1000 ${STAIR(1000) - 48} L140 1202 Z`} fill="url(#fe-stringer)" stroke={K} strokeWidth="8" opacity=".95" />
          {/* gradini sopra il fianco della scala: alzata e pedata in legno */}
          {Array.from({ length: 12 }, (_, i) => {
            const x0 = 140 + i * 72, y0 = STAIR(x0) - 48;
            return (
              <g key={i}>
                <path d={`M${x0} ${y0} V${y0 - 48} H${x0 + 72} Z`} fill="url(#fe-wood)" stroke={K} strokeWidth="6" />
                <path d={`M${x0 - 4} ${y0 - 48} H${x0 + 76}`} stroke="#C8946A" strokeWidth="4" />
              </g>
            );
          })}
          {/* la porticina dello sgabuzzino con il chiavistello */}
          <g transform={`translate(${shake} 0) rotate(${shake * 0.12} ${DX} ${DY})`}>
            <rect x={DX} y={DY - DH} width={DW} height={DH} fill="#05070A" stroke={K} strokeWidth="7" />
            <rect x={DX} y={DY - DH} width={DW} height={DH} fill="url(#fe-cold)" opacity={Math.max(open, 0)} />
            {open > 0 && <Glow id="fe-coldglow" x={DX + DW / 2} y={DY - DH / 2} r={340} t={t} color="#BFE0FF" amp={0.08} rate={4} opacity={0.8 * Math.min(1, open)} />}
            {/* fessura: luce fredda che lampeggia mentre la porta trema */}
            <g transform={`translate(${DX} ${DY - DH}) scale(${1 - Math.min(1, open) * 0.82} 1)`}>
              <rect x="0" y="0" width={DW} height={DH} fill="url(#fe-paint)" stroke={K} strokeWidth="8" />
              {[[18, 18, DW - 36, 92], [18, 130, DW - 36, 100]].map(([x, y, w, h], i) => (
                <rect key={i} x={x} y={y} width={w} height={h} fill="#000" opacity=".1" stroke="#4A5050" strokeWidth="5" />
              ))}
              <circle cx={DW - 30} cy={DH * 0.5} r="12" fill="url(#fe-brass)" stroke={K} strokeWidth="4" />
            </g>
            <rect x={DX + DW - 4} y={DY - DH + 6} width="10" height={DH - 12} fill="#DCF0FF" opacity={flick} />
            <rect x={DX + 6} y={DY - 4} width={DW - 12} height="8" fill="#DCF0FF" opacity={flick} />
            <Glow id="fe-slit" x={DX + DW} y={DY - DH / 2} r={220} t={t} color="#9CC8F0" amp={0.12} rate={11} opacity={0.7 * flick} />
            {/* chiavistello sullo stipite: la barra scorre a destra e chiude */}
            <g opacity={1 - Math.min(1, open * 2)}>
              <rect x={DX + DW - 70} y={DY - DH * 0.72} width="92" height="22" rx="4" fill="url(#fe-steel)" stroke={K} strokeWidth="4" />
              <rect x={DX + DW - 64 + 40 * lock} y={DY - DH * 0.72 - 8} width="18" height="38" rx="4" fill="url(#fe-steel)" stroke={K} strokeWidth="4" />
            </g>
          </g>
          {/* ringhiera della scala */}
          <path d={`M160 1010 L1000 ${STAIR(1000) - 230}`} stroke={K} strokeWidth="28" strokeLinecap="round" />
          <path d={`M160 1010 L1000 ${STAIR(1000) - 230}`} stroke="url(#fe-wood)" strokeWidth="16" strokeLinecap="round" />
          {Array.from({ length: 12 }, (_, i) => {
            const x = 210 + i * 66;
            return <path key={i} d={`M${x} ${STAIR(x) - 96} V${STAIR(x) - 228}`} stroke="#3A2414" strokeWidth="9" />;
          })}
          {/* pilastrino di partenza */}
          <rect x="132" y="1000" width="56" height="250" fill="url(#fe-wood)" stroke={K} strokeWidth="8" />
          <circle cx="160" cy="990" r="30" fill="url(#fe-wood)" stroke={K} strokeWidth="7" />
        </g>

        {/* PIANO 2 — palloncini legati al pilastrino, festone e il palloncino rosso (0,7) */}
        <g transform={L(0.7)}>
          {[[90, 780, 0], [200, 740, 1], [150, 690, 2], [250, 820, 3]].map(([x, y, c], i) => {
            const sw = Math.sin(t * 1.6 + i * 1.3) * 10;
            return (
              <g key={i}>
                <path d={`M160 1030 Q${(x + 160) / 2 + sw} ${(y + 1030) / 2} ${x + sw} ${y + 70}`} stroke="#E8E0D0" strokeWidth="3" fill="none" />
                <ellipse cx={x + sw} cy={y} rx="56" ry="68" fill={`url(#fe-b${c})`} stroke={K} strokeWidth="6" />
                <path d={`M${x + sw - 8} ${y + 66} l8 12 l8 -12 Z`} fill={K} />
              </g>
            );
          })}
          {/* festone che pende dalla ringhiera */}
          <path d={`M300 ${STAIR(300) - 150} Q420 ${STAIR(420) - 90} 540 ${STAIR(540) - 150} Q660 ${STAIR(660) - 90} 780 ${STAIR(780) - 150}`} stroke="#E8C860" strokeWidth="8" fill="none" />
          {Array.from({ length: 9 }, (_, i) => {
            const x = 320 + i * 54, y = STAIR(x) - 140 + Math.sin(((x - 300) / 240) * Math.PI) * 40;
            return <path key={i} d={`M${x - 16} ${y} L${x + 16} ${y} L${x} ${y + 34} Z`} fill={['#7AB8D8', '#E8A0B8', '#A8D890'][i % 3]} stroke={K} strokeWidth="4" />;
          })}
          {/* il palloncino rosso: legato alla maniglia, strattona e poi si libera */}
          <path d={rise > 0 ? `M${bx} ${by + 70} q${-20} 60 ${10} 120` : `M${KX + shake} ${KY} Q${(KX + bx) / 2 + 30} ${(KY + by) / 2} ${bx} ${by + 70}`} stroke="#F2E8E0" strokeWidth="3" fill="none" />
          <ellipse cx={bx} cy={by} rx="60" ry="72" fill="url(#fe-red)" stroke={K} strokeWidth="7" transform={`rotate(${shake * 1.5} ${bx} ${by})`} />
          <path d={`M${bx - 8} ${by + 70} l8 12 l8 -12 Z`} fill="#8A1A16" stroke={K} strokeWidth="3" />
          <Glow id="fe-redglow" x={bx} y={by} r={150} t={t} color="#E8443A" amp={0.08} rate={3} opacity={0.35} />
        </g>

        {/* PIANO 3 — il tavolo della festa con la torta e i bicchieri di carta, in primo piano a destra (1,2) */}
        <g transform={L(1.2, 0, 150)}>
          <Ombra id="fe" x={880} y={1880} rx={300} ry={30} />
          <path d="M600 1520 H1200 V1600 H600 Z" fill="url(#fe-cloth)" stroke={K} strokeWidth="9" />
          <path d="M600 1600 H1200 V1700 Q1120 1740 1040 1700 Q960 1740 880 1700 Q800 1740 720 1700 Q660 1730 600 1700 Z" fill="#E8D8C8" stroke={K} strokeWidth="7" />
          {/* torta con le candeline */}
          <g transform="translate(880 1520)">
            <ellipse cx="0" cy="0" rx="150" ry="30" fill="#DCD4C8" stroke={K} strokeWidth="6" />
            <path d="M-130 0 V-110 H130 V0 Z" fill="#F2E2D0" stroke={K} strokeWidth="8" />
            <ellipse cx="0" cy="-110" rx="130" ry="26" fill="#FFF4EA" stroke={K} strokeWidth="7" />
            <path d="M-130 -80 Q-100 -60 -70 -82 Q-40 -60 -10 -82 Q20 -60 50 -82 Q80 -60 110 -82 L130 -80" stroke="#E8A0B8" strokeWidth="10" fill="none" />
            {[-70, -35, 0, 35, 70].map((x, i) => (
              <g key={i}>
                <rect x={x - 5} y="-170" width="10" height="56" fill={['#7AB8D8', '#E8C860', '#A8D890'][i % 3]} stroke={K} strokeWidth="3" />
                <path d={`M${x} -170 q-8 -14 0 -28 q8 14 0 28 Z`} fill="#FFD878" />
              </g>
            ))}
            <Glow id="fe-cake" x={0} y={-190} r={160} t={t} color="#FFD878" amp={0.1} rate={7} opacity={0.5} />
          </g>
          {[[680, 1530], [1080, 1540]].map(([x, y], i) => (
            <path key={i} d={`M${x - 26} ${y - 70} H${x + 26} L${x + 18} ${y} H${x - 18} Z`} fill={i ? '#7AB8D8' : '#E8C860'} stroke={K} strokeWidth="5" />
          ))}
          {/* coriandoli a terra */}
          {Array.from({ length: 30 }, (_, i) => (
            <rect key={i} x={(i * 113) % 1100 - 40} y={1760 + ((i * 47) % 140)} width="14" height="8" fill={['#7AB8D8', '#E8C860', '#E8A0B8', '#A8D890'][i % 4]} transform={`rotate(${i * 41} ${(i * 113) % 1100 - 40} ${1760 + ((i * 47) % 140)})`} />
          ))}
        </g>

        {/* PIANO 4 — pulviscolo caldo e particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 760, x0: 120, x1: 600 }} bottom={{ y: 1400, x0: 60, x1: 900 }} seed={8} n={18} color="#FFE6B0" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="fe-near" t={t} color="#F2E2C8" n={5} opacity={0.08} />
        </g>
      </g>
      <Finish id="fe" tint="#3A3028" tintOpacity={0.1} />
    </svg>
  );
};
