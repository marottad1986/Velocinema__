import React from 'react';
import { camera, eo, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import { Beam, Dust, Glow, NearMotes, ShootingStar, Stars } from '../../lib/elements';
import type { SceneProps } from '../../types';

// L'osservatorio: cupola del planetario con stelle che ruotano, proiettore stellare, stella cadente.
// Piani: cupola, nebulosa e stelle lontane (0,25) · stelle vicine e costellazioni (0,4) ·
//        orizzonte con colline e luci di cornice (0,5) · proiettore stellare (0,65) ·
//        file di poltrone in primo piano (1,2) · particelle vicine (1,7)

const K = '#1B1530';
const C = { x: 540, y: 1240 }; // centro della cupola (polo di rotazione del cielo)
const PROJ = { x: 540, y: 1060 };
const r = rng(7311);
// costellazione inventata (punti vicini, uniti da linee)
const CONST = [
  { x: 760, y: 640 }, { x: 830, y: 700 }, { x: 900, y: 676 }, { x: 960, y: 760 }, { x: 880, y: 800 }, { x: 830, y: 700 },
];
const CONST2 = [{ x: 180, y: 760 }, { x: 240, y: 700 }, { x: 320, y: 720 }, { x: 360, y: 640 }];
const COVE = Array.from({ length: 26 }, (_, i) => ({ x: -160 + i * 54, ph: r() * 6 }));

export const Osservatorio: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur, 540, 1040);
  const L = cam.layer;
  // il proiettore si accende quando arrivano all'osservatorio (2ª frase): le stelle compaiono una alla volta
  const on = eo(seg(t, cues[1], cues[1] + 0.8));
  const tOn = Math.max(0, t - cues[1]);
  const rotFar = t * 1.6;
  const rotNear = t * 3.4;
  const tilt = Math.sin(t * 0.35) * 8;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="os" />
        <radialGradient id="os-dome" cx={C.x} cy={C.y} r="1250" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3A2E6E" />
          <stop offset=".35" stopColor="#241C4E" />
          <stop offset=".7" stopColor="#140F30" />
          <stop offset="1" stopColor="#0A0820" />
        </radialGradient>
        <radialGradient id="os-neb1">
          <stop offset="0" stopColor="#B07AE0" stopOpacity=".55" />
          <stop offset=".5" stopColor="#6B4FA0" stopOpacity=".25" />
          <stop offset="1" stopColor="#6B4FA0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="os-neb2">
          <stop offset="0" stopColor="#FF8AC0" stopOpacity=".4" />
          <stop offset=".5" stopColor="#C04A8A" stopOpacity=".15" />
          <stop offset="1" stopColor="#C04A8A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="os-neb3">
          <stop offset="0" stopColor="#6AD0E0" stopOpacity=".3" />
          <stop offset="1" stopColor="#3A8AA0" stopOpacity="0" />
        </radialGradient>
        <Lin id="os-hills" stops={[[0, '#1E1840'], [1, '#0E0B22']]} />
        <Lin id="os-metal" x2={1} y2={0} stops={[[0, '#2E2850'], [0.45, '#7A70A8'], [1, '#221C40']]} />
        <Lin id="os-seat" stops={[[0, '#5A3E8A'], [0.5, '#3E2A66'], [1, '#22163E']]} />
        <Lin id="os-floor" stops={[[0, '#16112E'], [1, '#0A0818']]} />
        <GlowGradient id="os-lens" color={P.accento} core={1} mid={0.4} />
        <clipPath id="os-clip">
          <circle cx={C.x} cy={C.y} r="1240" />
        </clipPath>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cupola, nebulosa e stelle lontane che ruotano lente (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="#0A0820" />
          <circle cx={C.x} cy={C.y} r="1240" fill="url(#os-dome)" />
          <g clipPath="url(#os-clip)">
            {/* meridiani della cupola, appena visibili */}
            {[260, 520, 800, 1080].map((rx, i) => (
              <ellipse key={i} cx={C.x} cy={C.y} rx={rx} ry="1240" fill="none" stroke="#3E3470" strokeWidth="3" opacity=".35" />
            ))}
            {[300, 600, 900].map((rr, i) => (
              <circle key={i} cx={C.x} cy={C.y} r={rr} fill="none" stroke="#3E3470" strokeWidth="3" opacity=".25" />
            ))}
            <g opacity={on}>
              <g transform={`rotate(${rotFar * 0.6} ${C.x} ${C.y})`}>
                <ellipse cx="800" cy="720" rx="360" ry="200" fill="url(#os-neb1)" transform="rotate(-25 800 720)" />
                <ellipse cx="900" cy="640" rx="200" ry="120" fill="url(#os-neb2)" />
                <ellipse cx="300" cy="880" rx="260" ry="140" fill="url(#os-neb3)" transform="rotate(20 300 880)" />
              </g>
              <g transform={`rotate(${rotFar} ${C.x} ${C.y})`}>
                <Stars t={tOn} seed={73} n={170} x={-700} y={-1000} w={2480} h={2400} color="#E8E4FF" size={0.75} appear={2.2} />
              </g>
            </g>
          </g>
        </g>

        {/* PIANO 1 — stelle vicine e costellazioni che ruotano più veloci (0,4) */}
        <g transform={L(0.4)}>
          <g clipPath="url(#os-clip)" opacity={on}>
            <g transform={`rotate(${rotNear} ${C.x} ${C.y})`}>
              <Stars t={tOn + 0.5} seed={91} n={70} x={-700} y={-1000} w={2480} h={2400} color="#FFF6E0" size={1.5} appear={2.6} />
              <g opacity={seg(t, cues[2], cues[2] + 1)}>
                <path d={CONST.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ')} fill="none" stroke="#C8C0F0" strokeWidth="3" strokeDasharray="10 10" opacity=".55" />
                <path d={CONST2.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ')} fill="none" stroke="#C8C0F0" strokeWidth="3" strokeDasharray="10 10" opacity=".55" />
                {[...CONST, ...CONST2].map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={6 + Math.sin(t * 3 + i) * 1.5} fill="#FFFFFF" />
                ))}
              </g>
            </g>
          </g>
          {/* stella cadente al primo bacio (5ª frase) */}
          <ShootingStar id="os-shoot" t={t} at={cues[4]} from={{ x: 560, y: 600 }} to={{ x: 1000, y: 860 }} color="#FFF4C8" />
          {seg(t, cues[4], cues[4] + 0.9) > 0 && seg(t, cues[4], cues[4] + 0.9) < 1 && (
            <Glow id="os-shg" x={lerp(560, 1000, seg(t, cues[4], cues[4] + 0.9))} y={lerp(600, 860, seg(t, cues[4], cues[4] + 0.9))} r={70} t={t} color="#FFF4C8" amp={0} opacity={Math.sin(seg(t, cues[4], cues[4] + 0.9) * Math.PI) * 0.9} />
          )}
          <ShootingStar id="os-shoot2" t={t} at={cues[2] + 0.6} from={{ x: 380, y: 640 }} to={{ x: 140, y: 800 }} color="#E8E4FF" />
        </g>

        {/* PIANO 2 — orizzonte: colline proiettate e luci di cornice (0,5) */}
        <g transform={L(0.5)}>
          <path d="M-200 1200 L-60 1150 L80 1170 L220 1120 L360 1160 L460 1140 L560 1170 L700 1110 L820 1150 L960 1120 L1100 1160 L1280 1140 V1260 H-200 Z" fill="url(#os-hills)" />
          {/* osservatorio in miniatura sul crinale */}
          <path d="M700 1110 v-24 h50 v24 M706 1086 a19 19 0 0 1 38 0" fill="#2A2250" stroke="#3E3470" strokeWidth="4" />
          <rect x="-200" y="1236" width="1480" height="30" fill="#120E28" stroke={K} strokeWidth="6" />
          {COVE.map((c, i) => (
            <circle key={i} cx={c.x} cy="1251" r="5" fill="#FFC88A" opacity={0.45 + 0.35 * Math.sin(t * 1.5 + c.ph)} />
          ))}
          <rect x="-200" y="1266" width="1480" height="800" fill="url(#os-floor)" />
        </g>

        {/* PIANO 3 — proiettore stellare: l'oggetto chiave (0,65) */}
        <g transform={L(0.65)}>
          {/* fasci sottili delle lenti */}
          <g opacity={on}>
            <Beam id="os-b1" x={PROJ.x - 110} y={PROJ.y - 40} t={t} length={460} spread={90} color="#E8E4FF" angle={-140} sweep={3} sweepRate={0.4} opacity={0.35} />
            <Beam id="os-b2" x={PROJ.x - 90} y={PROJ.y - 70} t={t} length={470} spread={70} color="#E8E4FF" angle={-110} sweep={3} sweepRate={0.5} opacity={0.3} />
            <Beam id="os-b3" x={PROJ.x + 110} y={PROJ.y + 40} t={t} length={560} spread={90} color="#E8E4FF" angle={-40} sweep={3} sweepRate={0.45} opacity={0.35} />
            <Beam id="os-b4" x={PROJ.x + 90} y={PROJ.y + 10} t={t} length={620} spread={70} color="#E8E4FF" angle={-70} sweep={3} sweepRate={0.35} opacity={0.3} />
          </g>
          {/* piedistallo */}
          <path d={`M${PROJ.x - 90} 1380 L${PROJ.x - 40} ${PROJ.y + 40} H${PROJ.x + 40} L${PROJ.x + 90} 1380 Z`} fill="url(#os-metal)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <rect x={PROJ.x - 130} y="1370" width="260" height="34" rx="8" fill="#2A2450" stroke={K} strokeWidth="8" />
          <path d={`M${PROJ.x - 30} ${PROJ.y + 80} V1360`} stroke="#9A90C8" strokeWidth="4" opacity=".6" />
          {/* manubrio con le due sfere, che si inclina piano */}
          <g transform={`rotate(${-18 + tilt} ${PROJ.x} ${PROJ.y})`}>
            <rect x={PROJ.x - 130} y={PROJ.y - 18} width="260" height="36" rx="12" fill="url(#os-metal)" stroke={K} strokeWidth="8" />
            <circle cx={PROJ.x} cy={PROJ.y} r="34" fill="#3A3266" stroke={K} strokeWidth="8" />
            {[-1, 1].map((s) => (
              <g key={s}>
                <circle cx={PROJ.x + s * 150} cy={PROJ.y} r="74" fill="url(#os-metal)" stroke={K} strokeWidth="9" />
                <path d={`M${PROJ.x + s * 150 - 52} ${PROJ.y - 40} a66 66 0 0 1 60 -26`} fill="none" stroke="#C8C0F0" strokeWidth="6" strokeLinecap="round" opacity=".6" />
                {[[-30, -30], [0, -44], [30, -26], [-40, 6], [-8, -6], [26, 10], [-18, 34], [16, 40]].map(([dx, dy], i) => (
                  <g key={i}>
                    <circle cx={PROJ.x + s * 150 + dx} cy={PROJ.y + dy} r="9" fill="#1A1438" stroke={K} strokeWidth="3" />
                    <circle cx={PROJ.x + s * 150 + dx} cy={PROJ.y + dy} r="5" fill={P.accento} opacity={on * (0.6 + 0.4 * Math.sin(t * 4 + i + s))} />
                  </g>
                ))}
              </g>
            ))}
          </g>
          <Glow id="os-lg1" x={PROJ.x - 142} y={PROJ.y + 46} r={130} t={t} color={P.accento} amp={0.08} rate={2.5} opacity={0.5 * on} />
          <Glow id="os-lg2" x={PROJ.x + 142} y={PROJ.y - 46} r={130} t={t} color={P.accento} amp={0.08} rate={2.5} ph={1.6} opacity={0.5 * on} />
          {/* consolle di comando con lucine */}
          <path d="M840 1300 L880 1220 H1060 L1080 1300 Z" fill="#2A2450" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          {Array.from({ length: 8 }, (_, i) => (
            <circle key={i} cx={900 + (i % 4) * 40} cy={1244 + Math.floor(i / 4) * 26} r="6" fill={i % 3 === 0 ? '#FF5E7A' : i % 3 === 1 ? '#7FD1B9' : '#C8C0F0'} opacity={0.4 + 0.6 * (Math.sin(t * (2 + i * 0.7) + i) > 0 ? 1 : 0.2)} />
          ))}
          {/* insegna di uscita */}
          <rect x="70" y="1170" width="110" height="44" rx="6" fill="#0E2A22" stroke={K} strokeWidth="6" />
          <text x="125" y="1201" textAnchor="middle" fontFamily="sans-serif" fontWeight="700" fontSize="24" fill="#6AF0B0" opacity=".9">EXIT</text>
          <Glow id="os-exit" x={125} y={1192} r={90} t={t} color="#6AF0B0" amp={0} opacity={0.25} />
        </g>

        {/* PIANO 4 — file di poltrone reclinabili in primo piano (1,2) */}
        <g transform={L(1.2)}>
          {[0, 1].map((row) => {
            const y = row === 0 ? 1480 : 1690;
            const w = row === 0 ? 210 : 260;
            const off = row === 0 ? -60 : -170;
            return (
              <g key={row}>
                {Array.from({ length: 7 }, (_, i) => {
                  const x = off + i * (w + 14);
                  return (
                    <g key={i}>
                      <path d={`M${x} ${y + 260} V${y + 40} Q${x} ${y} ${x + 40} ${y} H${x + w - 40} Q${x + w} ${y} ${x + w} ${y + 40} V${y + 260} Z`} fill="url(#os-seat)" stroke={K} strokeWidth="10" strokeLinejoin="round" />
                      <path d={`M${x + 24} ${y + 30} Q${x + w / 2} ${y + 10} ${x + w - 24} ${y + 30}`} fill="none" stroke="#9A80D0" strokeWidth="5" strokeLinecap="round" opacity={0.3 + 0.4 * on} />
                      <path d={`M${x + w / 2} ${y + 60} V${y + 240}`} stroke="#22163E" strokeWidth="5" opacity=".7" />
                    </g>
                  );
                })}
              </g>
            );
          })}
          {/* corrimano che attraversa tutta la sala */}
          <path d="M-200 1440 Q540 1410 1280 1440" fill="none" stroke={K} strokeWidth="18" strokeLinecap="round" />
          <path d="M-200 1438 Q540 1408 1280 1438" fill="none" stroke="#8A80B8" strokeWidth="6" strokeLinecap="round" opacity=".6" />
        </g>

        {/* PIANO 5 — pulviscolo nei fasci e particelle vicine (1,7) */}
        <g transform={L(1.4)} opacity={on}>
          <Dust t={t} top={{ y: 620, x0: 120, x1: 460 }} bottom={{ y: 1040, x0: 400, x1: 470 }} seed={731} n={22} color="#E8E4FF" />
          <Dust t={t} top={{ y: 620, x0: 640, x1: 980 }} bottom={{ y: 1080, x0: 620, x1: 690 }} seed={732} n={22} color="#E8E4FF" />
        </g>
        <g transform={L(1.7)}>
          <NearMotes id="os-near" t={t} seed={733} color="#C8C0F0" opacity={0.09} />
        </g>
      </g>

      <Finish id="os" tint="#2C2456" tintOpacity={0.13} />
    </svg>
  );
};
