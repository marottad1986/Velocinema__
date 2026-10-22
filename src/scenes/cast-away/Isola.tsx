import React from 'react';
import { camera, eo, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, Gulls, NearMotes, Reflection, SunRays, WaveBand, WaveLines } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K, Palm, islandPath } from './Comuni';

// L'isola deserta: alba su un'isola minuscola, spiaggia bianca, palme, picco roccioso; il gommone arancione
// sgonfio sulla riva; al largo la barriera corallina con una linea di onde alte che si frangono; orizzonte vuoto.
// Piani: cielo e sole (0,2) · orizzonte e barriera (0,4) · isola (0,55) · laguna (0,7) · spiaggia e gommone (1,0) · palme in primo piano (1,25) · spruzzi (1,7)

const r = rng(3131);
const SHELLS = Array.from({ length: 10 }, () => ({ x: r() * 1100 - 20, y: 1560 + r() * 300, s: 0.6 + r() * 0.6 }));

export const Isola: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const sun = eo(seg(t, 0, dur)); // il sole sale piano
  // l'onda grande della barriera si alza e si frange su «la barriera di onde alte»
  const big = seg(t, cues[3], cues[3] + 1.6);
  const crest = Math.sin(big * Math.PI);
  const wash = mod(t * 0.35, 1); // risacca sulla spiaggia

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="is" />
        <Lin id="is-sky" stops={[[0, '#2C4A73'], [0.3, '#8C8FB0'], [0.48, '#F2B48A'], [0.58, '#FCE0B0']]} />
        <Lin id="is-sea" stops={[[0, '#6FB8C6'], [0.5, '#3C9A9C'], [1, '#2A7F86']]} />
        <Lin id="is-lagoon" stops={[[0, '#8FD8D0'], [1, '#4DB3AC']]} />
        <Lin id="is-rock" x2={1} y2={0} stops={[[0, '#5D6B5A'], [0.55, '#7E8A6E'], [1, '#4A5648']]} />
        <Lin id="is-sand" stops={[[0, '#F6E6C2'], [1, '#E2C996']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo dell'alba e sole */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#is-sky)" />
          <SunRays id="is-rays" x={300} y={1010 - 120 * sun} t={t} color="#FFE1A8" n={10} length={1100} opacity={0.35} />
          <Glow id="is-sun" x={300} y={1010 - 120 * sun} r={260} t={t} color="#FFE7B8" amp={0.04} rate={1} opacity={0.8} />
          <circle cx="300" cy={1010 - 120 * sun} r="70" fill="#FFF1D2" />
          {[[680, 640, 1.1], [180, 720, 0.8], [900, 780, 0.9]].map(([x, y, s], i) => (
            <ellipse key={i} cx={x + mod(t * 6 + i * 200, 300) - 150} cy={y} rx={160 * s} ry={22 * s} fill="#FFD1A8" opacity=".55" />
          ))}
        </g>

        {/* PIANO 1 — mare aperto e barriera di onde */}
        <g transform={L(0.4)}>
          <rect x="-200" y="1000" width="1480" height="400" fill="url(#is-sea)" />
          <Reflection t={t} x={300 - cam.pan * 0.2} y={1010} color="#FFE7B8" n={8} w={110} opacity={0.5} />
          <WaveBand t={t} y={1070} fill="#E9F6F4" amp={14} w={160} speed={60} bob={4} foam="#FFFFFF" foamWidth={4} foamOpacity={0.9} />
          {/* l'onda alta che si frange */}
          <path d={`M-200 1070 Q${200} ${1070 - 70 * crest} ${540} ${1070 - 120 * crest} Q${880} ${1070 - 70 * crest} 1280 1070 Z`} fill="#F4FBFA" opacity={0.9 * crest} />
          {crest > 0.05 && Array.from({ length: 14 }, (_, i) => (
            <circle key={i} cx={-100 + i * 100 + Math.sin(i) * 20} cy={1060 - 140 * crest - (i % 3) * 20 * big} r={10 + (i % 4) * 4} fill="#FFFFFF" opacity={0.8 * crest} />
          ))}
        </g>

        {/* PIANO 2 — l'isola con il picco */}
        <g transform={L(0.55)}>
          <path d={islandPath(780, 1140, 0.9)} fill="url(#is-rock)" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          <path d="M770 820 Q800 860 820 940 M720 900 Q740 960 735 1040" fill="none" stroke="#3E4A3C" strokeWidth="5" opacity=".6" />
          <path d="M760 790 Q790 800 810 840" fill="none" stroke="#FCE0B0" strokeWidth="5" opacity=".7" />
          <path d="M330 1140 Q520 1060 700 1080 Q880 1050 1240 1140 Z" fill="#3E7B4F" stroke={K} strokeWidth="6" />
          {[420, 520, 980, 1100].map((x, i) => <Palm key={x} x={x} y={1110} h={180} lean={i % 2 ? 40 : -30} t={t} ph={i} outline={false} leaf="#2C6A48" trunk="#5E4A30" />)}
        </g>

        {/* PIANO 3 — laguna turchese */}
        <g transform={L(0.7)}>
          <rect x="-200" y="1140" width="1480" height="400" fill="url(#is-lagoon)" />
          <WaveLines t={t} ys={[1190, 1250, 1320]} color="#D6F2EE" amp={6} w={220} speed={24} opacity={0.6} />
        </g>

        {/* PIANO 4 — spiaggia, risacca, gommone sgonfio (accento) e impronte del naufragio */}
        <g transform={L(1.0)}>
          <path d="M-200 1400 Q300 1340 700 1380 Q1000 1400 1280 1360 V2200 H-200 Z" fill="url(#is-sand)" stroke={K} strokeWidth="7" />
          <path d={`M-200 ${1410 + wash * 40} Q300 ${1350 + wash * 40} 700 ${1390 + wash * 40} Q1000 ${1410 + wash * 40} 1280 ${1370 + wash * 40}`} fill="none" stroke="#FFFFFF" strokeWidth="8" opacity={0.8 * (1 - wash)} />
          <g transform="translate(600 1500) rotate(-6)">
            <ellipse cx="10" cy="44" rx="220" ry="26" fill={K} opacity=".2" />
            <path d="M-200 10 Q-210 -40 -150 -46 Q-40 -20 40 -50 Q160 -60 200 -20 Q220 20 180 36 Q60 50 -40 30 Q-140 50 -200 10 Z" fill={P.accento} stroke={K} strokeWidth="8" />
            <path d="M-120 -10 Q-40 10 40 -10 Q100 -20 150 0" fill="none" stroke="#9E3B1F" strokeWidth="6" />
            <path d="M-150 -34 Q-60 -14 20 -36" fill="none" stroke="#FFC9A8" strokeWidth="6" strokeLinecap="round" opacity=".8" />
            <path d="M190 -10 q40 10 70 -10 q30 -20 60 0" fill="none" stroke="#E6D3A8" strokeWidth="6" />
          </g>
          {SHELLS.map((s, i) => <ellipse key={i} cx={s.x} cy={s.y} rx={10 * s.s} ry={6 * s.s} fill="#FFF3E0" stroke="#B89A6A" strokeWidth="2" />)}
          {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={380 - i * 70} cy={1600 + i * 60} rx="16" ry="26" fill="#D4B985" opacity=".8" transform={`rotate(-30 ${380 - i * 70} ${1600 + i * 60})`} />)}
        </g>

        {/* PIANO 5 — palme in primo piano che incorniciano */}
        <g transform={L(1.25)}>
          <Palm x={-40} y={1900} h={900} lean={160} t={t} ph={0.5} />
          <Palm x={1120} y={1920} h={760} lean={-200} t={t} ph={2} />
        </g>
        <g transform={L(0.6)}><Gulls t={t} y={760} h={160} color={K} n={3} /></g>

        {/* PIANO 6 — spruzzi e luce davanti alla camera */}
        <g transform={L(1.7)}><NearMotes id="is-near" t={t} color="#FFF1D2" n={7} opacity={0.12} /></g>
      </g>
      <Finish id="is" tint="#F2B85A" tintOpacity={0.1} />
    </svg>
  );
};
