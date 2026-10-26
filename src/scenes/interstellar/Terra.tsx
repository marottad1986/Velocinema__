import React from 'react';
import { camera, eo, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Flyers, Fog, Glow, NearMotes, SunRays } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Corn } from './Spazio';

// La Terra muore: campi di mais sotto un cielo giallastro, un muro di polvere che avanza all'orizzonte, casa di legno
// con veranda, mietitrebbia ferma, polvere che vola. Nessuna persona.
// Eventi: il muro di polvere cresce (dall'inizio) · raffica di polvere e foglie (cue 1) · sulla veranda si accende la luce,
//         il casco da pilota sul parapetto brilla (cue 2) · altalena che dondola (cue 3) · il mais si secca (cue 4).
// Piani: cielo e sole velato (0,2) · muro di polvere (0,3) · campi lontani, casa e mietitrebbia (0,5)
//        · mais vicino (0,8) · staccionata e mais in primo piano (1,2) · polvere e foglie (1,5–1,8)

const K = '#1A1408';
const r = rng(2014);
const GUST = Array.from({ length: 6 }, () => ({ y: 900 + r() * 400, s: 0.6 + r() * 0.8 }));

export const Terra: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const wall = eo(seg(t, 0, dur));
  const gust = seg(t, cues[1], cues[1] + 2.2);
  const porch = seg(t, cues[2], cues[2] + 0.4);
  const swing = Math.sin(t * 2.2) * (6 + 14 * seg(t, cues[3], cues[3] + 0.6));
  const dry = seg(t, cues[4] - 0.2, dur - 0.2);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="tr" />
        <Lin id="tr-sky" stops={[[0, '#8C8A78'], [0.35, '#C9B88A'], [0.55, '#E2CC94'], [0.62, '#D8B87A']]} />
        <Lin id="tr-dust" stops={[[0, '#A8885A', 0], [0.25, '#A8885A', 0.85], [1, '#7A6040', 1]]} />
        <Lin id="tr-field" stops={[[0, '#8A8848'], [1, '#4E5428']]} />
        <Lin id="tr-house" x2={1} y2={0} stops={[[0, '#D8CCB0'], [0.6, '#B8AA8A'], [1, '#8A7E64']]} />
        <Lin id="tr-roof" stops={[[0, '#5A4A3A'], [1, '#3A2E24']]} />
        <Lin id="tr-combine" x2={1} y2={0} stops={[[0, '#6E7A4A'], [0.5, '#8E9A5A'], [1, '#4E5A34']]} />
        <Lin id="tr-ground" stops={[[0, '#7A6A48'], [1, '#3A3020']]} />
        <Lin id="tr-fence" x2={1} y2={0} stops={[[0, '#5A4A36'], [0.5, '#8A7454'], [1, '#4A3C2C']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo polveroso e sole velato (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#tr-sky)" />
          <Glow id="tr-sun" x={760} y={640} r={300} t={t} color="#FFF0C8" amp={0.04} rate={0.8} opacity={0.55} />
          <circle cx="760" cy="640" r="56" fill="#FFF4D8" opacity=".85" />
          <SunRays id="tr-rays" x={760} y={640} t={t} color="#FFF0C8" n={7} length={900} width={60} opacity={0.25} />
        </g>

        {/* PIANO 1 — muro di polvere che avanza all'orizzonte (0,3) */}
        <g transform={L(0.3)}>
          <path d={`M-200 ${lerp(1000, 760, wall)} Q100 ${lerp(960, 700, wall)} 380 ${lerp(990, 740, wall)} Q700 ${lerp(950, 690, wall)} 1000 ${lerp(985, 730, wall)} Q1150 ${lerp(970, 720, wall)} 1280 ${lerp(990, 750, wall)} V1200 H-200 Z`} fill="url(#tr-dust)" />
          {Array.from({ length: 11 }, (_, i) => (
            <circle key={i} cx={-160 + i * 130 + Math.sin(t * 0.5 + i) * 24} cy={lerp(1010, 800, wall) - (i % 3) * 40} r={lerp(60, 150, wall) * (0.8 + (i % 4) * 0.12)} fill={i % 2 ? '#9A7A4E' : '#B0905E'} opacity=".7" />
          ))}
          <rect x="-200" y={lerp(1010, 820, wall)} width="1480" height="400" fill="#8A6C46" opacity=".75" />
          <Fog id="tr-haze" t={t} y={980} x={540} rx={900} ry={90} color="#C9AE7A" opacity={0.6} speed={0.25} drift={60} />
        </g>

        {/* PIANO 2 — campi lontani, casa con veranda, mietitrebbia (0,5) */}
        <g transform={L(0.5)}>
          <path d="M-200 1040 Q540 1010 1280 1040 V1400 H-200 Z" fill="url(#tr-field)" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-200 + i * 130} 1040 L${-600 + i * 200} 1400`} stroke="#5E6430" strokeWidth="5" opacity=".6" />)}
          {/* casa */}
          <g transform="translate(720 1050)">
            <path d="M0 0 V-170 H260 V0 Z" fill="url(#tr-house)" stroke={K} strokeWidth="8" />
            <path d="M-30 -160 L130 -270 L290 -160 Z" fill="url(#tr-roof)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d="M-40 -60 H300 L290 -80 H-30 Z" fill="#5A4A3A" stroke={K} strokeWidth="6" />
            {[-20, 60, 140, 220, 280].map((x) => <path key={x} d={`M${x} -60 V0`} stroke={K} strokeWidth="6" />)}
            <rect x="30" y="-140" width="50" height="56" fill="#3A3A34" stroke={K} strokeWidth="5" />
            <rect x="170" y="-140" width="50" height="56" fill={porch > 0.5 ? '#FFE6A8' : '#3A3A34'} stroke={K} strokeWidth="5" />
            <Glow id="tr-lamp" x={195} y={-112} r={110} t={t} color="#FFE6A8" amp={0.08} rate={2} opacity={0.6 * porch} />
            {/* altalena di copertone appesa all'albero secco */}
            <path d="M-124 0 Q-128 -120 -116 -240 M-120 -150 Q-160 -200 -190 -230 M-118 -210 Q-80 -236 -50 -250 M-120 -120 Q-90 -140 -70 -150" stroke="#3A3024" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d="M-80 -226 L-60 -244" stroke="#3A3024" strokeWidth="8" />
            <g transform={`rotate(${swing} -80 -220)`}>
              <path d="M-80 -220 V-110" stroke={K} strokeWidth="4" />
              <ellipse cx="-80" cy="-96" rx="22" ry="16" fill="none" stroke="#2A2620" strokeWidth="10" />
            </g>
          </g>
          {/* mietitrebbia ferma */}
          <g transform="translate(140 1080)">
            <path d="M0 0 V-90 H140 L170 -40 V0 Z" fill="url(#tr-combine)" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            <rect x="20" y="-140" width="70" height="50" fill="#5A6440" stroke={K} strokeWidth="6" />
            <rect x="30" y="-132" width="50" height="32" fill="#C9D3DB" opacity=".6" />
            <path d="M-80 -10 H0 M-80 -30 H0" stroke={K} strokeWidth="8" />
            <circle cx="40" cy="0" r="30" fill="#2A2620" stroke={K} strokeWidth="6" />
            <circle cx="140" cy="4" r="22" fill="#2A2620" stroke={K} strokeWidth="6" />
          </g>
        </g>

        {/* PIANO 3 — mais vicino che si secca (0,8) */}
        <g transform={L(0.8)}>
          <path d="M-200 1180 H1280 V2200 H-200 Z" fill="url(#tr-ground)" />
          <Corn t={t} y={1260} n={30} h={280} seed={3} dry={dry * 0.7} />
          <Corn t={t + 0.5} y={1200} n={34} h={200} seed={4} dry={dry * 0.8} color="#6E7E38" />
        </g>

        {/* PIANO 4 — staccionata, casco da pilota e mais in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <Corn t={t + 1} y={1900} n={16} h={560} seed={8} x0={-260} w={1600} dry={dry * 0.5} />
          <path d="M-200 1560 H1280" stroke={K} strokeWidth="26" />
          <path d="M-200 1560 H1280" stroke={K} strokeWidth="24" />
          <path d="M-200 1560 H1280" stroke="#8A7454" strokeWidth="14" />
          <path d="M-200 1555 H1280" stroke="#B89C74" strokeWidth="3" opacity=".7" />
          {[-60, 260, 580, 900, 1220].map((x) => <rect key={x} x={x - 16} y="1500" width="32" height="420" fill="url(#tr-fence)" stroke={K} strokeWidth="7" />)}
          {/* casco da pilota sul paletto: era della NASA */}
          <g transform="translate(400 1760) scale(1.05)">
            <ellipse cx="0" cy="4" rx="100" ry="18" fill="#000" opacity=".3" />
            {/* anello del collo del casco */}
            <rect x="-78" y="-14" width="156" height="22" rx="8" fill="#9AA4AE" stroke={K} strokeWidth="7" />
            <Glow id="tr-helm" x={0} y={-70} r={140} t={t} color="#FFF0C8" amp={0.1} rate={2.4} opacity={0.5 * porch} />
            <path d="M-70 0 Q-80 -130 0 -140 Q80 -130 70 0 Z" fill="#E8E4DA" stroke={K} strokeWidth="8" />
            <path d="M-58 -64 Q0 -108 58 -64 V-24 Q0 -10 -58 -24 Z" fill="#3E6A8A" stroke={K} strokeWidth="6" />
            <path d="M-36 -64 Q-10 -84 20 -80" fill="none" stroke="#DCE8F0" strokeWidth="6" strokeLinecap="round" />
          </g>
        </g>

        {/* PIANO 5 — raffica di polvere e foglie secche, particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 600, x0: 0, x1: 1080 }} bottom={{ y: 1700, x0: -100, x1: 1180 }} n={40} color="#E8D4A8" boost={0.3 * gust} />
          <g opacity={gust > 0 && gust < 1 ? Math.sin(gust * Math.PI) : 0}>
            <Flyers t={t * 2} n={8} shape="leaf" color="#B8984A" outline={K} y0={700} y1={1600} speed={0.5} />
            {GUST.map((g, i) => <path key={i} d={`M${-200 + 1500 * gust - i * 120} ${g.y} q120 -30 260 0`} fill="none" stroke="#E8D4A8" strokeWidth={8 * g.s} strokeLinecap="round" opacity=".6" />)}
          </g>
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="tr-near" t={t} color="#E8D4A8" n={8} vx={-60} vy={-6} opacity={0.14} />
        </g>
      </g>

      <Finish id="tr" tint="#A8885A" tintOpacity={0.12} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): muro di polvere da 0 a fine · raffica cue1 → +2,2 · luce della veranda e casco cue2
// · altalena cue3 · mais che si secca da cue4 − 0,2.
