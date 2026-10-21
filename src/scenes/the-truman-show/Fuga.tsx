import React from 'react';
import { camera, eob, eo, lerp, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Embers, Fire, Glow, NearMotes, Smoke, Stars, flamePath } from '../../lib/elements';
import type { SceneProps } from '../../types';

// La fuga: strada notturna fuori città — muro di fiamme sull'asfalto, transenne «Fuga radioattiva»,
// fari d'auto, segnale stradale «Ovunque tranne qui».
// Dettaglio da studio: alla fine le fiamme si abbassano di colpo a fiammelle blu di un tubo del gas di scena.
// Piani: cielo e stelle (0,2) · alberi e colline lontane (0,45) · strada, muro di fuoco, fumo (0,6–0,7)
//        · transenne con lampeggianti e segnale (0,85) · guardrail e fari in primo piano (1,2–1,3) · braci (1,5–1,8)

const K = '#142235';
const HZ = 1060; // orizzonte della strada

const Barrier: React.FC<{ x: number; on: number; accent: string; k: number; seed: number }> = ({ x, on, accent, k, seed }) => (
  <g transform={`translate(${x} 1190)`}>
    <Glow id={`fu-bl${seed}`} x={-90} y={-112} r={60} t={0} color={accent} amp={0} opacity={on * 0.9} />
    <Glow id={`fu-br${seed}`} x={90} y={-112} r={60} t={0} color={accent} amp={0} opacity={(1 - on) * 0.9 * k} />
    <path d="M-100 0 L-80 -90 M100 0 L80 -90 M-110 0 H-50 M50 0 H110" stroke={K} strokeWidth="9" strokeLinecap="round" />
    <rect x="-120" y="-96" width="240" height="44" fill="#F4F1E6" stroke={K} strokeWidth="7" />
    {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${-112 + i * 44} -54 L${-88 + i * 44} -94 H${-70 + i * 44} L${-94 + i * 44} -54 Z`} fill="#D2453A" />)}
    <rect x="-120" y="-96" width="240" height="44" fill="none" stroke={K} strokeWidth="7" />
    <circle cx="-90" cy="-112" r="12" fill={on > 0.5 ? accent : '#7A4A2A'} stroke={K} strokeWidth="4" />
    <circle cx="90" cy="-112" r="12" fill={on <= 0.5 && k > 0 ? accent : '#7A4A2A'} stroke={K} strokeWidth="4" />
  </g>
);

export const Fuga: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  // «all'improvviso» (cue 1): i fari si alzano; «un incendio sulla strada» (cue 2): muro di fiamme;
  // «fuga radioattiva» (cue 3): transenne; «ogni via si chiude» (cue 4): CHIUSO sul segnale;
  // «lo riportano a casa» (cue 5): le fiamme calano a fiammelle blu di un tubo del gas.
  const brights = seg(t, cues[1], cues[1] + 0.3);
  const fireUp = eo(seg(t, cues[2], cues[2] + 0.8));
  const fireDown = seg(t, cues[5], cues[5] + 0.5);
  const fire = fireUp * (1 - fireDown);
  const barrier = eob(seg(t, cues[3], cues[3] + 0.5));
  const closed = eob(seg(t, cues[4], cues[4] + 0.4));
  const blink = Math.sin(t * 7) > 0 ? 1 : 0;
  const pipe = fireDown;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fu" />
        <Lin id="fu-sky" stops={[[0, '#0A1424'], [0.45, '#142235'], [0.8, '#2A3E5A'], [1, '#4A4050']]} />
        <Lin id="fu-road" stops={[[0, '#2E3A4C'], [0.4, '#232E3E'], [1, '#121A26']]} />
        <Lin id="fu-sign" x2={1} y2={0} stops={[[0, '#3C8C6A'], [0.6, '#2E7556'], [1, '#1F5640']]} />
        <Lin id="fu-rail" stops={[[0, '#C9D2DA'], [1, '#6A7684']]} />
        <Lin id="fu-grass" stops={[[0, '#1C2E36'], [1, '#0A1218']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo notturno con riverbero arancio sull'orizzonte (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#fu-sky)" />
          <Stars t={t} seed={12} n={34} y={140} h={700} color="#E9F0F8" />
          <Glow id="fu-sky-fire" x={540} y={HZ} r={700} t={t} color="#F2994A" amp={0.06} rate={6} opacity={0.45 * fire} />
        </g>

        {/* PIANO 1 — colline e alberi lontani (0,45) */}
        <g transform={L(0.45)}>
          <path d="M-200 1070 Q100 960 360 1040 Q560 980 760 1040 Q980 970 1280 1050 V1100 H-200 Z" fill="#16243A" />
          {[-80, 30, 130, 220, 840, 930, 1030, 1130].map((x, i) => (
            <path key={i} d={`M${x} ${1070} l-34 0 l34 -${110 + (i % 3) * 30} l34 ${110 + (i % 3) * 30} Z`} fill="#0F1A2C" />
          ))}
        </g>

        {/* PIANO 2 — strada in prospettiva, muro di fuoco, fumo su due livelli (0,6–0,7) */}
        <g transform={L(0.6)}>
          <path d={`M-300 1920 L500 ${HZ} H580 L1380 1920 Z`} fill="url(#fu-road)" />
          <path d={`M-300 1920 L500 ${HZ} M1380 1920 L580 ${HZ}`} stroke="#5A6A80" strokeWidth="6" opacity=".7" />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) ** 2, b = ((i + 0.5) / 6) ** 2;
            return <path key={i} d={`M540 ${lerp(HZ, 1920, a)} L540 ${lerp(HZ, 1920, b)}`} stroke="#F4E2B0" strokeWidth={lerp(3, 26, a)} opacity=".8" />;
          })}
          {/* riflesso delle fiamme sull'asfalto */}
          <ellipse cx="540" cy="1120" rx="420" ry="40" fill="#F2994A" opacity={0.25 * fire} />
          <Smoke id="fu-sm1" t={t} x={420} y={1040} color="#4A4A58" n={8} rise={480} wind={-160} r0={50} r1={180} speed={0.2} opacity={0.75 * fireUp} />
        </g>
        <g transform={L(0.65)}>
          {/* tubo del gas di scena: si vede quando le fiamme calano */}
          <path d="M200 1098 H880" stroke="#5F6E80" strokeWidth="12" strokeLinecap="round" opacity={0.25 + pipe * 0.75} />
          {Array.from({ length: 12 }, (_, i) => {
            const x = 220 + i * 58;
            return (
              <g key={i}>
                <path d={flamePath(x, 1092, 10, 46 * pipe, t, i)} fill="#6FB8FF" opacity={pipe * 0.9} />
                <path d={flamePath(x, 1092, 5, 24 * pipe, t, i + 1)} fill="#E6F4FF" opacity={pipe} />
              </g>
            );
          })}
          {fire > 0.01 && [230, 340, 450, 560, 670, 780, 860].map((x, i) => (
            <Fire key={i} id={`fu-f${i}`} t={t + i * 0.37} x={x} y={1100} scale={fire * (0.75 + (i % 3) * 0.18)} outline={K} />
          ))}
          <Smoke id="fu-sm2" t={t} x={640} y={1000} color="#3A3A48" n={9} rise={560} wind={220} r0={60} r1={200} speed={0.24} opacity={0.7 * fireUp} />
          <Embers t={t} x={540} y={1060} w={620} h={560} n={34} seed={33} drift={100} />
        </g>

        {/* PIANO 3 — transenne «Fuga radioattiva» e segnale stradale (0,85) */}
        <g transform={L(0.85)}>
          {/* segnale «Ovunque tranne qui» */}
          <path d="M880 1260 V820" stroke="#5A6A80" strokeWidth="16" />
          <path d="M870 1260 V820" stroke="#9AA8B8" strokeWidth="4" />
          <Glow id="fu-sg" x={810} y={730} r={240} t={t} color="#FFF4D6" amp={0.04} opacity={0.18 + brights * 0.2} />
          <rect x="640" y="650" width="340" height="170" rx="16" fill="url(#fu-sign)" stroke={K} strokeWidth="8" />
          <rect x="652" y="662" width="316" height="146" rx="10" fill="none" stroke="#F4F1E6" strokeWidth="4" />
          <text x="810" y="718" textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize="38" fill="#F4F1E6">OVUNQUE</text>
          <text x="790" y="770" textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize="38" fill="#F4F1E6">TRANNE QUI</text>
          <path d="M920 790 h36 m-14 -12 l14 12 l-14 12" fill="none" stroke="#F4F1E6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          {closed > 0 && (
            <g transform={`translate(810 735) rotate(-12) scale(${closed})`}>
              <rect x="-170" y="-30" width="340" height="60" fill="#F4F1E6" stroke={K} strokeWidth="6" />
              <text y="16" textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize="42" fill="#D2453A" letterSpacing="4">CHIUSO</text>
            </g>
          )}
          {/* transenne */}
          {barrier > 0 && (
            <g transform={`translate(0 ${(1 - Math.min(1, barrier)) * 60}) translate(540 1200) scale(1 ${Math.min(1.05, barrier)}) translate(-540 -1200)`}>
              <Barrier x={330} on={blink} accent={P.accento} k={1} seed={1} />
              <Barrier x={750} on={blink} accent={P.accento} k={1} seed={2} />
              <g transform="translate(540 1200)">
                <path d="M-14 0 V-60 M14 0 V-60" stroke={K} strokeWidth="8" />
                <rect x="-130" y="-190" width="260" height="140" rx="10" fill="#FFE07A" stroke={K} strokeWidth="8" />
                <circle cx="-80" cy="-120" r="36" fill="#FFE07A" stroke={K} strokeWidth="5" />
                {[0, 120, 240].map((a) => <path key={a} d="M-80 -120 L-80 -150 A30 30 0 0 1 -54 -135 Z" fill={K} transform={`rotate(${a} -80 -120)`} />)}
                <circle cx="-80" cy="-120" r="7" fill={K} />
                <text x="30" y="-132" textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize="32" fill={K}>FUGA</text>
                <text x="30" y="-96" textAnchor="middle" fontFamily="Bricolage Grotesque" fontWeight={800} fontSize="22" fill={K}>RADIOATTIVA</text>
              </g>
            </g>
          )}
        </g>

        {/* PIANO 4 — guardrail ai lati e fari dell'auto (1,25) */}
        <g transform={L(1.25)}>
          <Beam id="fu-hl1" x={260} y={1920} t={t} length={1000 + brights * 200} spread={420} color="#FFF4D6" angle={-75} opacity={0.32 + brights * 0.25} />
          <Beam id="fu-hl2" x={820} y={1920} t={t} length={1000 + brights * 200} spread={420} color="#FFF4D6" angle={-105} opacity={0.32 + brights * 0.25} />
          <path d="M-200 1990 L-200 1300 L180 1420 L120 1990 Z" fill="url(#fu-grass)" />
          <path d="M1280 1990 L1280 1300 L900 1420 L960 1990 Z" fill="url(#fu-grass)" />
          <path d="M-200 1360 L240 1240 L240 1290 L-200 1430 Z" fill="url(#fu-rail)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M1280 1360 L840 1240 L840 1290 L1280 1430 Z" fill="url(#fu-rail)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M-200 1372 L240 1252 M1280 1372 L840 1252" stroke="#FFFFFF" strokeWidth="4" opacity=".6" />
          {[-120, 40, 200].map((x, i) => <path key={i} d={`M${x} ${1400 - (x + 200) * 0.27} V${1700 - i * 60}`} stroke={K} strokeWidth="14" />)}
          {[1200, 1040, 880].map((x, i) => <path key={i} d={`M${x} ${1400 - (1280 - x) * 0.27} V${1700 - i * 60}`} stroke={K} strokeWidth="14" />)}
          <circle cx="200" cy="1290" r="9" fill={P.accento} opacity={0.6 + 0.4 * blink} />
          <circle cx="880" cy="1290" r="9" fill={P.accento} opacity={0.6 + 0.4 * (1 - blink)} />
        </g>

        {/* PIANO 5 — braci e cenere vicine alla camera (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Embers t={t} x={540} y={1900} w={1100} h={1100} n={18} seed={91} drift={-80} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="fu-near" t={t} color="#FFC890" n={6} vx={30} vy={-30} opacity={0.08 + 0.08 * fire} />
        </g>
      </g>

      <Finish id="fu" tint="#142235" tintOpacity={0.13} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): abbaglianti ≈ 2,1 · muro di fuoco ≈ 3,8 · transenne ≈ 5,35 · CHIUSO ≈ 6,9 · fiammelle blu del gas ≈ 8,9.
