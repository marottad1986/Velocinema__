import React from 'react';
import { camera, eio, eo, eob, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Embers, Fire, Glow, NearMotes, Smoke, Stars, WaveLines } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Ball, K, Palm } from './Comuni';

// Il fuoco e Wilson: sera sulla spiaggia, legnetti e cocco per accendere il fuoco, fumo che sale, poi una fiamma alta
// che illumina la sabbia; accanto il pallone con la faccia fatta da un'impronta di mano rossa; scintille verso le stelle.
// Piani: cielo del tramonto (0,2) · mare e isola lontana (0,4) · sabbia (0,7) · fuoco e pallone (0,9) · legna in primo piano (1,2) · scintille (1,6)

const r = rng(6060);
const STICKS = Array.from({ length: 7 }, (_, i) => ({ a: -60 + i * 20 + r() * 8, l: 90 + r() * 40 }));

export const Fuoco: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const night = eio(seg(t, 0, dur)); // dal tramonto alla notte
  const smoke = seg(t, 0.3, cues[1]) * (1 - seg(t, cues[1], cues[1] + 0.6)) + seg(t, cues[3], cues[4]); // prova e riprova
  // il pallone viene lanciato e rotola vicino al fuoco
  const throwP = eo(seg(t, cues[1] + 0.8, cues[1] + 2));
  const bx = 160 + 600 * throwP, by = 1440 - Math.sin(throwP * Math.PI) * 260;
  const face = seg(t, cues[2], cues[2] + 1.2); // l'impronta che sembra una faccia
  const fire = eob(seg(t, cues[4] + 0.2, cues[4] + 1.2), 1.4); // finalmente, la fiamma
  const lit = seg(t, cues[4] + 0.2, cues[4] + 0.8);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fu" />
        <Lin id="fu-sky" stops={[[0, '#141A3A'], [0.32, '#3A2F5C'], [0.5, '#B0566A'], [0.6, '#F09060']]} />
        <Lin id="fu-skyn" stops={[[0, '#050A18'], [0.4, '#0C1A33'], [0.6, '#1D2C4A']]} />
        <Lin id="fu-sea" stops={[[0, '#3A4D6E'], [1, '#141F33']]} />
        <Lin id="fu-sand" stops={[[0, '#8C7A6A'], [0.5, '#5E5048'], [1, '#2C2522']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo dal tramonto alla notte e stelle */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#fu-sky)" />
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#fu-skyn)" opacity={night} />
          <Stars t={t} seed={60} n={40} y={500} h={500} appear={0.6} size={1.2} />
        </g>

        {/* PIANO 1 — mare scuro e scoglio lontano */}
        <g transform={L(0.4, 0, -80)}>
          <rect x="-200" y="1060" width="1480" height="300" fill="url(#fu-sea)" />
          <path d="M760 1062 Q820 1000 880 1010 Q940 1000 980 1062 Z" fill="#1A2236" />
          <WaveLines t={t} ys={[1090, 1130, 1180]} color="#8090B0" amp={5} w={200} speed={20} opacity={0.4} />
        </g>

        {/* PIANO 2 — sabbia illuminata dal fuoco */}
        <g transform={L(0.7, 0, -160)}>
          <path d="M-200 1240 Q500 1200 1280 1240 V2200 H-200 Z" fill="url(#fu-sand)" stroke={K} strokeWidth="7" />
          <Glow id="fu-ground" x={540} y={1330} r={620} t={t} color="#FF9A4A" amp={0.12} rate={6} opacity={0.15 + 0.45 * lit} />
          {/* solchi lasciati dai tentativi */}
          {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${120 + i * 40} ${1330 + (i % 2) * 20} l60 10`} stroke="#3A302A" strokeWidth="6" strokeLinecap="round" opacity=".6" />)}
        </g>

        {/* PIANO 3 — legnetti, fumo, fuoco e Wilson */}
        <g transform={L(0.9, 0, -290)}>
          {/* catasta di legnetti e cocco aperto */}
          {STICKS.map((s, i) => {
            const a = (s.a * Math.PI) / 180;
            return <path key={i} d={`M540 1500 L${540 + Math.sin(a) * s.l} ${1500 - Math.cos(a) * s.l * 0.7}`} stroke="#6B4E2E" strokeWidth="14" strokeLinecap="round" />;
          })}
          <path d="M440 1520 H640" stroke={K} strokeWidth="18" strokeLinecap="round" />
          <path d="M440 1520 H640" stroke="#8B6A43" strokeWidth="10" strokeLinecap="round" />
          <path d="M700 1520 a50 40 0 0 1 100 0 Z" fill="#5B4127" stroke={K} strokeWidth="6" />
          <path d="M712 1518 a38 28 0 0 1 76 0" fill="#F4EFE2" />
          {/* bastoncino che sfrega: segno del tentativo */}
          <path d="M360 1480 L470 1420" stroke="#8B6A43" strokeWidth="12" strokeLinecap="round" transform={`rotate(${Math.sin(t * 22) * 3 * (1 - lit)} 470 1420)`} />
          <Smoke id="fu-smoke" t={t} x={540} y={1460} color="#C9C3BC" n={8} rise={420} wind={-120} r0={16} r1={80} speed={0.4} opacity={0.65 * Math.max(smoke, lit * 0.6)} />
          {fire > 0.02 && (
            <g transform={`translate(540 1500) scale(${fire}) translate(-540 -1500)`}>
              <Fire id="fu-fire" t={t} x={540} y={1500} scale={1.5} outline={K} />
            </g>
          )}
          <Glow id="fu-fireg" x={540} y={1400} r={360} t={t} color="#FFB060" amp={0.15} rate={9} opacity={0.6 * lit} />
          {/* Wilson: l'impronta compare e diventa una faccia (accento) */}
          <Glow id="fu-ballg" x={bx} y={by} r={160} t={t} color="#FFD3B8" amp={0.06} rate={2} opacity={0.35 * face} />
          <Ball x={bx} y={by} r={78} rot={-throwP * 380 + 380} face={face} />
          {/* gocce di sangue sulla sabbia dove si è ferito */}
          {[0, 1, 2].map((i) => <circle key={i} cx={300 + i * 22} cy={1580 + i * 8} r={6 - i} fill="#8E2416" opacity={seg(t, cues[1] + 0.3, cues[1] + 0.6) * 0.8} />)}
        </g>

        {/* PIANO 4 — legna da ardere e foglie di palma in primo piano */}
        <g transform={L(1.2)}>
          <path d="M-60 1820 L380 1700" stroke={K} strokeWidth="44" strokeLinecap="round" />
          <path d="M-60 1820 L380 1700" stroke="#5E4528" strokeWidth="32" strokeLinecap="round" />
          <path d="M800 1880 L1160 1760" stroke={K} strokeWidth="40" strokeLinecap="round" />
          <path d="M800 1880 L1160 1760" stroke="#6B4E2E" strokeWidth="28" strokeLinecap="round" />
          <Palm x={1180} y={1500} h={760} lean={-220} t={t} ph={3} leaf="#1E3A30" trunk="#3E3020" />
        </g>

        {/* PIANO 5 — scintille e braci verso le stelle */}
        <g transform={L(1.6)}>
          {lit > 0 && <Embers t={t} x={540} y={1130} w={160} h={900} seed={61} n={30} drift={160} />}
          <NearMotes id="fu-near" t={t} color="#FFC07A" n={6} opacity={0.08 + 0.06 * lit} />
        </g>
      </g>
      <Finish id="fu" tint="#0E2A3A" tintOpacity={0.12} />
    </svg>
  );
};
