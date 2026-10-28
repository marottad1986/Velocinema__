import React from 'react';
import { camera, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import { Beam, Clouds, Fireflies, Glow, NearMotes, Notes, Stars } from '../../lib/elements';
import type { SceneProps } from '../../types';

// La collina: tramonto sulla città, lampione che si accende, scarpe da tip tap sulla panchina, stelle che compaiono.
// Piani: cielo del crepuscolo con stelle (0,2) · nubi e monti lontani con la cupola (0,3–0,35)
//        · città nella valle con le luci (0,45) · crinale con alberi (0,6) · panchina, lampione e scarpe (0,75)
//        · erba e cespugli in primo piano (1,25) · lucciole e particelle (1,4–1,7)
// Eventi: il lampione si accende con «E al tramonto, su una collina» (cue 2);
//         le scarpe battono il tip tap con «Ma intanto ballano il tip tap insieme» (cue 4).

const K = '#1B1530';
const r = rng(1980);
const CITY = Array.from({ length: 150 }, () => {
  const v = r();
  return { x: -160 + r() * 1400, y: 1020 + v * v * 110, s: 2 + v * 4, c: r() > 0.3 ? '#FFD98A' : r() > 0.5 ? '#F6F1E9' : '#E79AB0', rate: 1 + r() * 3, ph: r() * 6, on: r() * 6 };
});
const GRASS = Array.from({ length: 40 }, () => ({ x: -160 + r() * 1400, y: 1520 + r() * 420, h: 50 + r() * 90, ph: r() * 6 }));

/** Scarpa da tip tap vista di lato (punta a sinistra), suola sull'origine. */
const Shoe: React.FC<{ flip?: boolean }> = ({ flip }) => (
  <g transform={flip ? 'scale(-1 1)' : undefined}>
    <path d="M-70 0 H58 Q70 0 70 -12 V-22 Q60 -26 50 -26 L30 -34 Q8 -60 -26 -60 L-46 -58 Q-70 -50 -72 -24 Z" fill="#17122A" stroke={K} strokeWidth="7" strokeLinejoin="round" />
    <path d="M-20 -58 Q4 -56 22 -36 L10 -10 Q-10 -6 -26 -10 Z" fill="#F6F1E9" stroke={K} strokeWidth="5" strokeLinejoin="round" />
    <path d="M-8 -44 l14 6 M-12 -34 l14 6" stroke={K} strokeWidth="4" strokeLinecap="round" />
    <path d="M-70 -2 H-30 M30 -2 H66" stroke="#C9C4D6" strokeWidth="8" strokeLinecap="round" />
    <path d="M-56 -50 Q-40 -58 -26 -56" fill="none" stroke="#8C80B8" strokeWidth="4" strokeLinecap="round" />
  </g>
);

export const Collina: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const LAMP = cues[2] ?? 4.41;
  const TAP = cues[4] ?? 8.84;

  // il cielo si scurisce piano, la città si accende
  const dusk = seg(t, 0, dur);
  const cityOn = 0.45 + 0.55 * seg(t, 0.5, 7);
  // lampione: due sfarfallii e poi acceso
  const lamp = t < LAMP ? 0 : t < LAMP + 0.45 ? (Math.sin((t - LAMP) * 38) > 0 ? 1 : 0.15) : 1;
  // tip tap: le scarpe saltellano a turno
  const tapping = seg(t, TAP - 0.05, TAP + 0.1);
  const hop = (ph: number) => tapping * Math.abs(Math.sin((t - TAP) * Math.PI * 3.2 + ph));
  const hopL = hop(0), hopR = hop(Math.PI / 2);
  const impact = (ph: number) => {
    const p = mod((t - TAP) * 3.2 + ph / Math.PI, 1);
    return t > TAP ? Math.max(0, 1 - p * 3.5) : 0;
  };

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="co" />
        <Lin id="co-sky" stops={[[0, '#14112E'], [0.22, '#2A2156'], [0.4, '#563E8A'], [0.55, '#A2588E'], [0.66, '#E57C70'], [0.74, '#F7B46E'], [0.8, '#FBD58E']]} />
        <Lin id="co-mount" stops={[[0, '#5A3E7A'], [1, '#3A2A5E']]} />
        <Lin id="co-valley" stops={[[0, '#2E2350'], [1, '#1A1434']]} />
        <Lin id="co-ridge" stops={[[0, '#2A2048'], [1, '#14102A']]} />
        <Lin id="co-ground" stops={[[0, '#3A2E5A'], [0.5, '#251D40'], [1, '#120E22']]} />
        <GlowGradient id="co-pool" color="#F2C14E" core={0.6} mid={0.22} />
        <GlowGradient id="co-sunset" color="#FFD9A0" core={0.8} mid={0.3} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo del crepuscolo, stelle che compaiono una alla volta (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#co-sky)" />
          <rect x="-200" y="-200" width="1480" height="1400" fill="#14112E" opacity={dusk * 0.28} />
          <ellipse cx="300" cy="1010" rx="700" ry={200 - dusk * 60} fill="url(#co-sunset)" opacity={0.75 - dusk * 0.35} />
          <Stars t={t} seed={7} n={46} x={-100} y={-60} w={1280} h={720} appear={dur * 0.85} size={1.1} color="#FFF6E2" />
          <Stars t={t} seed={19} n={14} x={-100} y={60} w={1280} h={520} appear={dur * 0.9} size={1.7} color="#FFF6E2" />
        </g>

        {/* PIANO 1 — nubi rosa e monti lontani con la cupola (0,3) */}
        <g transform={L(0.3)}>
          <Clouds id="co-cl" t={t} color="#F2A0A8" n={3} y={760} h={120} speed={0.2} opacity={0.35} />
          <path d="M-200 1010 L-200 960 Q-80 900 40 930 Q160 880 300 920 Q420 870 560 910 Q700 880 820 920 Q960 890 1280 940 V1010 Z" fill="url(#co-mount)" />
          {/* osservatorio sul crinale */}
          <g transform="translate(860 910)">
            <rect x="-56" y="-26" width="112" height="30" fill="#4A3470" />
            <path d="M-36 -26 A36 36 0 0 1 36 -26 Z" fill="#4A3470" />
            <path d="M-90 4 H90" stroke="#4A3470" strokeWidth="10" />
            <circle cx="0" cy="-48" r="4" fill="#FFE7A0" opacity={0.4 + 0.4 * Math.sin(t * 2)} />
          </g>
        </g>

        {/* PIANO 2 — la città nella valle con le luci che brillano (0,45) */}
        <g transform={L(0.45)}>
          <rect x="-200" y="1000" width="1480" height="200" fill="url(#co-valley)" />
          <path d="M-200 1004 H1280" stroke="#F7B46E" strokeWidth="3" opacity=".5" />
          {/* qualche grattacielo in controluce */}
          {[[640, 70, 34], [684, 110, 40], [732, 86, 30], [770, 140, 36], [814, 96, 32], [852, 60, 28]].map(([x, h, w], i) => (
            <g key={i}>
              <rect x={x} y={1010 - h} width={w} height={h + 20} fill="#2A2050" />
              {Array.from({ length: Math.floor(h / 22) }, (_, k) => <rect key={k} x={x + 8} y={1018 - h + k * 22} width={w - 16} height="4" fill="#FFD98A" opacity={cityOn * (0.3 + 0.4 * Math.sin(t * 1.5 + i + k))} />)}
            </g>
          ))}
          {CITY.map((c, i) => (
            <circle key={i} cx={c.x} cy={c.y} r={c.s} fill={c.c} opacity={(c.on < cityOn * 6 ? 1 : 0.2) * (0.35 + 0.6 * (0.5 + 0.5 * Math.sin(t * c.rate + c.ph)))} />
          ))}
          <path d="M-200 1110 Q300 1080 600 1100 T1280 1090" fill="none" stroke="#FFD98A" strokeWidth="4" strokeDasharray="6 10" opacity={cityOn * 0.7} strokeDashoffset={-t * 30} />
        </g>

        {/* PIANO 3 — crinale con alberi in controluce (0,6) */}
        <g transform={L(0.6)}>
          <path d="M-200 1200 Q100 1130 400 1150 Q700 1170 900 1140 Q1100 1120 1280 1150 V1400 H-200 Z" fill="url(#co-ridge)" />
          {/* pini a sinistra, palma sottile a destra */}
          {[[40, 1160, 1], [130, 1150, 0.75]].map(([x, y, s], i) => (
            <path key={i} d={`M${x} ${y - 300 * s} L${x - 60 * s} ${y - 160 * s} H${x - 30 * s} L${x - 80 * s} ${y - 40 * s} H${x + 80 * s} L${x + 30 * s} ${y - 160 * s} H${x + 60 * s} Z M${x - 8} ${y - 40 * s} h16 v40 h-16 Z`} fill="#1E1838" />
          ))}
          <path d={`M1020 1150 Q1010 1000 ${1030 + Math.sin(t * 1.1) * 6} 860`} stroke="#1E1838" strokeWidth="12" fill="none" />
          <g transform={`translate(${1030 + Math.sin(t * 1.1) * 6} 860)`} fill="#1E1838">
            {[-160, -120, -60, -20, 30].map((a, i) => (
              <path key={i} d={`M0 0 Q${Math.cos((a * Math.PI) / 180) * 60} ${Math.sin((a * Math.PI) / 180) * 60 - 30} ${Math.cos((a * Math.PI) / 180) * 120} ${Math.sin((a * Math.PI) / 180) * 120 + 20} Q${Math.cos((a * Math.PI) / 180) * 60} ${Math.sin((a * Math.PI) / 180) * 60} 0 0 Z`} />
            ))}
          </g>
        </g>

        {/* PIANO 4 — sentiero, panchina con le scarpe, lampione (0,75) */}
        <g transform={L(0.75)}>
          <path d="M-200 1230 Q300 1200 700 1214 Q1000 1224 1280 1206 V1600 H-200 Z" fill="url(#co-ground)" stroke={K} strokeWidth="8" />
          <path d="M-200 1236 Q300 1206 700 1220 Q1000 1230 1280 1212" fill="none" stroke="#B87AA0" strokeWidth="5" opacity=".6" />
          {/* staccionata del belvedere */}
          {[-120, 60, 900, 1080].map((x) => <path key={x} d={`M${x} 1226 V1150`} stroke={K} strokeWidth="14" strokeLinecap="round" />)}
          <path d="M-140 1170 H140 M880 1170 H1180" stroke={K} strokeWidth="10" strokeLinecap="round" />
          {/* alone e cono del lampione */}
          <Beam id="co-cone" x={800} y={650} t={t} length={600} spread={500} angle={95} color="#F2C14E" opacity={0.32 * lamp} />
          <ellipse cx="680" cy="1228" rx="320" ry="44" fill="url(#co-pool)" opacity={lamp * 0.9} />
          {/* lampione */}
          <path d="M800 1232 V660" stroke={K} strokeWidth="26" />
          <path d="M800 1232 V660" stroke="#3E3266" strokeWidth="14" />
          <path d="M776 1232 h48 l-8 -40 h-32 Z" fill="#2A2048" stroke={K} strokeWidth="6" />
          <path d="M794 1180 V700" stroke="#8C80B8" strokeWidth="4" opacity={0.3 + 0.5 * lamp} />
          <Glow id="co-lamp" x={800} y={620} r={240} t={t} color="#F2C14E" amp={0.06} rate={2.5} opacity={0.85 * lamp} />
          <path d="M770 660 L760 590 H840 L830 660 Z" fill={lamp > 0.5 ? '#FFE7A0' : '#4A3E6E'} stroke={K} strokeWidth="7" strokeLinejoin="round" />
          <path d="M800 590 V660" stroke={K} strokeWidth="4" />
          <path d="M748 592 L800 556 L852 592 Z" fill="#2A2048" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          <circle cx="800" cy="546" r="9" fill={K} />
          <rect x="764" y="660" width="72" height="12" fill="#2A2048" stroke={K} strokeWidth="5" />
          {/* panchina */}
          <g>
            {[250, 660].map((x) => <path key={`a${x}`} d={`M${x} 950 V1120`} stroke={K} strokeWidth="14" strokeLinecap="round" />)}
            {[0, 1, 2].map((k) => <rect key={`b${k}`} x="200" y={940 + k * 34} width="510" height="22" rx="6" fill="#6E4E3E" stroke={K} strokeWidth="6" />)}
            <path d="M210 946 H700" stroke="#B88A6E" strokeWidth="3" opacity=".6" />
            {/* seduta vista un po' dall'alto */}
            <path d="M206 1100 H704 L724 1146 H186 Z" fill="#8A644E" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            <path d="M200 1116 H712 M194 1131 H718" stroke={K} strokeWidth="4" opacity=".5" />
            <rect x="186" y="1146" width="538" height="16" rx="4" fill="#5A3E30" stroke={K} strokeWidth="6" />
            <path d="M212 1104 H698" stroke={lamp > 0.5 ? '#F2C98A' : '#B88A6E'} strokeWidth="4" opacity=".8" />
            {[250, 660].map((x) => <path key={x} d={`M${x} 1162 Q${x - 10} 1200 ${x - 24} 1226 M${x} 1162 Q${x + 10} 1200 ${x + 24} 1226`} stroke={K} strokeWidth="12" strokeLinecap="round" fill="none" />)}
          </g>
          {/* le scarpe da tip tap sulla panchina */}
          <g transform={`translate(370 ${1128 - hopL * 50}) rotate(${-hopL * 10}) scale(1.3)`}><Shoe /></g>
          <g transform={`translate(545 ${1128 - hopR * 50}) rotate(${hopR * 8}) scale(1.3)`}><Shoe /></g>
          {/* colpi del tip tap */}
          {[{ x: 370, ph: 0 }, { x: 545, ph: Math.PI / 2 }].map((s, i) => {
            const k = impact(s.ph);
            if (k <= 0) return null;
            return (
              <g key={i} stroke="#FFF6DC" strokeWidth="6" strokeLinecap="round" opacity={k}>
                <path d={`M${s.x - 80} ${1120} l-30 -18 M${s.x + 80} 1120 l30 -18 M${s.x - 70} 1100 l-22 -34 M${s.x + 70} 1100 l22 -34`} />
              </g>
            );
          })}
          <g opacity={tapping}>
            <Notes t={t} x={460} y={1060} n={5} rise={300} spread={260} size={0.8} speed={0.4} seed={88} />
          </g>
        </g>

        {/* PIANO 5 — erba e cespugli in primo piano (1,25) */}
        <g transform={L(1.25)}>
          <path d="M-200 1480 Q200 1420 560 1470 Q900 1520 1280 1450 V2000 H-200 Z" fill="#17122C" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M-200 1486 Q200 1426 560 1476" fill="none" stroke="#5A4A8A" strokeWidth="5" opacity=".7" />
          {GRASS.map((g, i) => {
            const sway = Math.sin(t * 1.5 + g.ph) * 8;
            return <path key={i} d={`M${g.x} ${g.y} q${4 + sway / 2} ${-g.h / 2} ${sway} ${-g.h}`} stroke={i % 3 ? '#3E3470' : '#6A5AA0'} strokeWidth="6" strokeLinecap="round" fill="none" />;
          })}
          {/* cespugli che toccano i bordi */}
          <path d="M-200 1700 Q-120 1520 20 1560 Q120 1480 220 1580 Q300 1620 280 2000 H-200 Z" fill="#30265A" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M-100 1580 Q0 1530 40 1566 Q120 1500 200 1582" fill="none" stroke="#7A64B0" strokeWidth="6" strokeLinecap="round" opacity=".8" />
          <path d="M1280 1640 Q1180 1480 1040 1540 Q940 1500 880 1600 Q820 1700 860 2000 H1280 Z" fill="#30265A" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M1200 1540 Q1120 1490 1040 1548 Q960 1510 900 1600" fill="none" stroke="#B07AA8" strokeWidth="6" strokeLinecap="round" opacity=".8" />
          {/* sassi lungo il sentiero */}
          {[[420, 1560, 60], [600, 1600, 44], [700, 1530, 30]].map(([x, y, w], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={w} ry={w * 0.5} fill="#3E3270" stroke={K} strokeWidth="7" />
              <path d={`M${x - w * 0.6} ${y - w * 0.2} Q${x} ${y - w * 0.5} ${x + w * 0.5} ${y - w * 0.25}`} fill="none" stroke="#8C7AC0" strokeWidth="4" />
            </g>
          ))}
          {[[60, 1600], [150, 1640], [980, 1580], [1060, 1620], [920, 1680]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="9" fill="#E79AB0" stroke={K} strokeWidth="3" opacity={0.7 + 0.3 * Math.sin(t + i)} />
          ))}
        </g>

        {/* PIANO 6 — lucciole e particelle vicine (1,4–1,7) */}
        <g transform={L(1.4)}>
          <Fireflies id="co-ff" t={t} n={16} x={0} y={1050} w={1080} h={700} color="#FFE98A" />
        </g>
        <g transform={L(1.7)}>
          <NearMotes id="co-near" t={t} color="#E8C8F0" n={7} opacity={0.1} />
        </g>
      </g>

      <Finish id="co" tint="#2C2456" tintOpacity={0.13} />
    </svg>
  );
};
