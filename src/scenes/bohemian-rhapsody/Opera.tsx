import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Dust, Glow, Lightning, NearMotes, Notes, Smoke, Stars, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';

// Seconda parte: il processo. Palco d'opera con sipario rosso e fondale notturno dipinto; due fasci che si alternano
// da sinistra e da destra (i due cori che litigano); sul palco, come oggetti di scena, una maschera della commedia
// dell'arte, un cannocchiale antico e una botola da cui sale una luce rossa con fumo; fulmine sul fondale.
// Piani: parete e palchi (0,25) · fondale dipinto e palco (0,45) · fasci, oggetti di scena, quinte, boccascena (0,6)
//        · buca dell'orchestra con leggii (0,9) · leggio e drappi in primo piano (1,25) · pulviscolo (1,7)
// Eventi: cues[0] fulmine sul fondale, il palco si accende · cues[1]–cues[2] i due fasci si alternano
//         · cues[3] si illuminano la maschera e poi il cannocchiale · cues[4] la botola si apre: luce rossa, fumo, fulmine.

const K = '#140A12';
const GOLD = '#E9B949';
const FLOOR = 1080;
const r = rng(7519);
const BOXES = Array.from({ length: 3 }, (_, i) => ({ y: 230 + i * 150, ph: r() * 6 }));
const STANDS = Array.from({ length: 6 }, (_, i) => ({ x: 90 + i * 180 + (r() - 0.5) * 30, ph: r() * 6 }));

const curtainPath = (x0: number, x1: number, y0: number, y1: number, t: number, ph: number, folds = 4) => {
  const sway = Math.sin(t * 0.9 + ph) * 10;
  let d = `M${x0} ${y0} H${x1} L${x1 + sway} ${y1}`;
  const w = (x1 - x0) / folds;
  for (let i = folds; i > 0; i--) d += ` q${-w / 2} ${18 + Math.sin(t * 1.3 + i + ph) * 4} ${-w} 0`;
  return d + ` L${x0} ${y0} Z`;
};

/** Leggio con spartito e lampadina (buca dell'orchestra). */
const Stand: React.FC<{ x: number; y: number; s: number; t: number; ph: number; id: string; lit: number }> = ({ x, y, s, t, ph, id, lit }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Glow id={id} x={0} y={-150} r={90} t={t} color="#FFD98A" amp={0.06} rate={2.2} ph={ph} opacity={0.35 + 0.3 * lit} />
    <path d="M0 0 V-110 M-30 0 H30" stroke={K} strokeWidth="9" strokeLinecap="round" />
    <path d="M-62 -110 L-52 -176 H52 L62 -110 Z" fill="#2A1A22" stroke={K} strokeWidth="7" strokeLinejoin="round" />
    <path d="M-48 -116 L-40 -168 H0 V-116 Z M4 -116 V-168 H40 L48 -116 Z" fill="#F1E6D2" stroke={K} strokeWidth="4" />
    <g stroke="#6A5A5A" strokeWidth="3" opacity=".7">
      <path d="M-40 -156 H-6 M-42 -144 H-6 M-44 -132 H-6 M8 -156 H40 M8 -144 H42 M8 -132 H44" />
    </g>
    <path d="M-20 -176 q20 -26 40 0" fill="none" stroke={K} strokeWidth="5" />
    <circle cx="0" cy="-192" r="8" fill="#FFE7A0" stroke={K} strokeWidth="4" />
  </g>
);

export const Opera: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c0 = cues[0] ?? 0.15, c1 = cues[1] ?? 2.2, c2 = cues[2] ?? 6.2, c3 = cues[3] ?? 8.4, c4 = cues[4] ?? 11;

  const flash = flashAt(t, [c0 + 0.25, c4 + 0.3], [1, 0.8]);
  const up = eo(seg(t, c0 + 0.3, c0 + 1.4)); // il palco si accende
  // i due cori: i fasci si alternano tra cues[1] e cues[2], poi restano entrambi a metà
  const duel = seg(t, c1, c1 + 0.3) * (1 - seg(t, c2, c2 + 0.6));
  const side = Math.sin((t - c1) * Math.PI * 1.25);
  const left = lerp(0.35 * up, 0.15 + 0.55 * Math.max(0, side), duel);
  const right = lerp(0.35 * up, 0.15 + 0.55 * Math.max(0, -side), duel);
  const mask = eob(seg(t, c3, c3 + 0.5));
  const scope = eob(seg(t, (c3 + c4) / 2, (c3 + c4) / 2 + 0.5));
  const trap = eo(seg(t, c4, c4 + 0.6));
  const sky = 0.55 + 0.45 * up;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="op" />
        <Lin id="op-wall" stops={[[0, '#0A060C'], [0.35, '#1A0E18'], [0.7, '#2A1322'], [1, '#170A12']]} />
        <Lin id="op-sky" stops={[[0, '#0C1230'], [0.45, '#1C2A5A'], [0.8, '#34407A'], [1, '#4A3A6A']]} />
        <Lin id="op-hills" stops={[[0, '#1A2040'], [1, '#0E1228']]} />
        <Lin id="op-floor" stops={[[0, '#6A4A34'], [0.5, '#4A3226'], [1, '#24170F']]} />
        <Lin id="op-curtain" x2={1} y2={0} stops={[[0, '#4E0F22'], [0.3, '#A8243E'], [0.55, '#721A34'], [0.8, '#B23048'], [1, '#4E0F22']]} />
        <Lin id="op-curtainV" stops={[[0, '#3E0C1C'], [0.5, '#861E36'], [1, '#4E0F22']]} />
        <Lin id="op-valance" stops={[[0, '#2A0812'], [0.6, '#4E1022'], [1, '#6A1830']]} />
        <Lin id="op-frame" x2={1} y2={0} stops={[[0, '#5A4630'], [0.5, '#A88A5A'], [1, '#463422']]} />
        <Lin id="op-pit" stops={[[0, '#120A10'], [1, '#07040A']]} />
        <Lin id="op-brass" x2={1} y2={0} stops={[[0, '#8A6A2E'], [0.45, '#F2D58A'], [1, '#7A5A22']]} />
        <radialGradient id="op-trap">
          <stop offset="0" stopColor="#FF6A3A" stopOpacity=".95" />
          <stop offset=".5" stopColor="#C8202E" stopOpacity=".45" />
          <stop offset="1" stopColor="#C8202E" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete della sala con i palchi ai lati (centro calmo per il titolo) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#op-wall)" />
          {[-60, 1140].map((x, k) =>
            BOXES.map((b, i) => (
              <g key={`${k}-${i}`}>
                <Glow id={`op-box${k}${i}`} x={x} y={b.y + 40} r={90} t={t} color="#F2B870" amp={0.05} rate={1.3} ph={b.ph} opacity={0.3} />
                <path d={`M${x - 90} ${b.y + 90} q90 30 180 0`} fill="none" stroke="#A88A5A" strokeWidth="6" opacity=".7" />
              </g>
            )),
          )}
        </g>

        {/* PIANO 1 — fondale dipinto (cielo notturno, luna, colline) e palco in legno */}
        <g transform={L(0.45)}>
          <g opacity={sky}>
            <rect x="60" y="560" width="960" height={FLOOR - 560} fill="url(#op-sky)" />
            <Stars t={t} seed={23} n={26} x={80} y={600} w={920} h={260} color="#F4ECDD" size={0.9} />
            <circle cx="820" cy="680" r="54" fill="#F4ECDD" opacity=".85" />
            <circle cx="842" cy="666" r="50" fill="#1C2A5A" />
            <path d={`M60 940 Q240 840 420 920 T780 900 T1020 930 V${FLOOR} H60 Z`} fill="url(#op-hills)" />
            <path d="M60 1000 Q300 950 560 990 T1020 980" stroke="#2A3260" strokeWidth="6" fill="none" />
            {/* piega del telo dipinto */}
            <path d="M300 560 V1080 M760 560 V1080" stroke="#0A0E22" strokeWidth="4" opacity=".35" />
          </g>
          {/* fulmine sul fondale */}
          <rect x="60" y="560" width="960" height={FLOOR - 560} fill="#DCE4FF" opacity={flash * 0.25} />
          <Lightning x={330} y={575} h={330} flash={flash} seed={11} color="#F4F6FF" width={9} />
          <Lightning x={640} y={575} h={260} flash={flash * 0.7} seed={29} color="#F4F6FF" width={6} />
          {/* palco */}
          <rect x="-200" y={FLOOR} width="1480" height="80" fill="url(#op-floor)" />
          <path d={`M-200 ${FLOOR} H1280`} stroke={K} strokeWidth="8" />
          <g stroke="#24170F" strokeWidth="3" opacity=".7">
            {Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${-100 + i * 100} ${FLOOR} L${-180 + i * 110} ${FLOOR + 80}`} />)}
          </g>
          {/* luci di ribalta */}
          {Array.from({ length: 9 }, (_, i) => {
            const x = 140 + i * 100;
            const k = 0.5 + 0.5 * Math.sin(t * 2 + i * 1.3);
            return (
              <g key={i}>
                <Glow id={`op-foot${i}`} x={x} y={FLOOR + 80} r={70} t={t} color="#FFD98A" amp={0} opacity={(0.2 + 0.15 * k) * (0.3 + 0.7 * up)} />
                <path d={`M${x - 18} ${FLOOR + 84} a18 12 0 0 1 36 0 z`} fill="#FFE7A0" stroke={K} strokeWidth="4" opacity={0.5 + 0.5 * up} />
              </g>
            );
          })}
        </g>

        {/* PIANO 2 — i due fasci, oggetti di scena, botola, quinte, boccascena, mantovana */}
        <g transform={L(0.6)}>
          <Beam id="op-beamL" x={70} y={600} t={t} length={760} spread={300} angle={48} sweep={2} color="#BFD4FF" opacity={left} />
          <Beam id="op-beamR" x={1010} y={600} t={t} length={760} spread={300} angle={132} sweep={2} color="#FFC9A0" opacity={right} />
          <ellipse cx="350" cy={FLOOR + 24} rx="170" ry="30" fill="#BFD4FF" opacity={0.35 * left} />
          <ellipse cx="740" cy={FLOOR + 24} rx="170" ry="30" fill="#FFC9A0" opacity={0.35 * right} />
          <Dust t={t} top={{ y: 640, x0: 120, x1: 220 }} bottom={{ y: FLOOR, x0: 220, x1: 520 }} n={18} color="#E4ECFF" boost={-0.4 + left} />
          <Dust t={t} seed={8} top={{ y: 640, x0: 860, x1: 960 }} bottom={{ y: FLOOR, x0: 560, x1: 860 }} n={18} color="#FFE6D0" boost={-0.4 + right} />

          {/* botola al centro: luce rossa e fumo (Belzebù) */}
          <ellipse cx="540" cy={FLOOR + 30} rx="120" ry="22" fill="#0A0508" stroke={K} strokeWidth="6" />
          <g opacity={trap}>
            <ellipse cx="540" cy={FLOOR - 60} rx={lerp(80, 380, trap)} ry={lerp(60, 320, trap)} fill="url(#op-trap)" />
            <ellipse cx="540" cy={FLOOR + 30} rx="112" ry="18" fill="#FF6A3A" opacity=".85" />
            <Smoke id="op-smoke" t={t} x={540} y={FLOOR + 20} color="#D0606A" n={10} rise={380} wind={0} r0={50} r1={170} speed={0.35} opacity={0.95} />
            <Smoke id="op-smoke2" t={t + 1.3} x={520} y={FLOOR + 20} color="#6A2A34" n={6} rise={300} wind={-120} r0={50} r1={160} speed={0.28} opacity={0.6} />
          </g>
          {/* coperchio della botola che si ribalta */}
          <g transform={`translate(${540 + 110} ${FLOOR + 30}) rotate(${-trap * 70})`}>
            <path d="M-220 -24 H0 V4 H-220 Z" fill="#5A3E2E" stroke={K} strokeWidth="7" />
            <path d="M-150 -24 V4 M-75 -24 V4" stroke="#2A1A12" strokeWidth="4" />
          </g>

          {/* maschera della commedia dell'arte su un'asta (Scaramouche) */}
          <g transform={`translate(330 ${930 - mask * 16})`}>
            <Glow id="op-maskg" x={0} y={-60} r={190} t={t} color={GOLD} amp={0.1} rate={3} opacity={0.15 + 0.55 * mask} />
            <path d={`M0 -20 V${FLOOR - 930 + 16}`} stroke={K} strokeWidth="10" strokeLinecap="round" />
            <path d={`M0 -20 V${FLOOR - 930 + 10}`} stroke="#8A6A3E" strokeWidth="4" />
            <g transform={`rotate(${Math.sin(t * 1.2) * 4 - 6 + mask * 6} 0 -70)`}>
              <path d="M-78 -96 Q0 -132 78 -96 Q86 -50 44 -30 Q20 -52 0 -36 Q-20 -52 -44 -30 Q-86 -50 -78 -96 Z" fill="#1E1418" stroke={K} strokeWidth="8" strokeLinejoin="round" />
              <path d="M-74 -96 Q0 -128 74 -96" fill="none" stroke={GOLD} strokeWidth="6" strokeLinecap="round" opacity={0.4 + 0.6 * mask} />
              <ellipse cx="-34" cy="-74" rx="18" ry="11" fill="#0A0508" />
              <ellipse cx="34" cy="-74" rx="18" ry="11" fill="#0A0508" />
              <path d="M0 -60 q8 18 0 26" fill="none" stroke="#3A2A2E" strokeWidth="6" strokeLinecap="round" />
              {/* nastri */}
              <path d={`M-78 -92 q-30 ${20 + Math.sin(t * 2) * 8} -44 54`} fill="none" stroke="#A8243E" strokeWidth="7" strokeLinecap="round" />
              <path d={`M78 -92 q30 ${20 + Math.sin(t * 2 + 1) * 8} 44 54`} fill="none" stroke="#A8243E" strokeWidth="7" strokeLinecap="round" />
            </g>
          </g>

          {/* cannocchiale antico su treppiede (Galileo) */}
          <g transform="translate(770 930)">
            <Glow id="op-scopeg" x={-10} y={-70} r={190} t={t} color={GOLD} amp={0.1} rate={3} ph={1} opacity={0.1 + 0.55 * scope} />
            <path d={`M0 0 L-60 ${FLOOR - 930 + 6} M0 0 L60 ${FLOOR - 930 + 6} M0 0 V${FLOOR - 930 + 10}`} stroke={K} strokeWidth="10" strokeLinecap="round" />
            <path d={`M0 0 L-60 ${FLOOR - 930 + 6} M0 0 L60 ${FLOOR - 930 + 6}`} stroke="#7A5A34" strokeWidth="4" strokeLinecap="round" />
            <g transform={`rotate(${-28 - scope * 6})`}>
              <rect x="-110" y="-20" width="230" height="40" rx="8" fill="url(#op-brass)" stroke={K} strokeWidth="8" />
              <rect x="110" y="-28" width="40" height="56" rx="6" fill="url(#op-brass)" stroke={K} strokeWidth="8" />
              <rect x="-150" y="-13" width="44" height="26" rx="5" fill="#7A5A22" stroke={K} strokeWidth="6" />
              <path d="M-40 -20 V20 M40 -20 V20" stroke={K} strokeWidth="5" />
              <path d="M-100 -12 H100" stroke="#FFF1C8" strokeWidth="4" strokeLinecap="round" opacity={0.3 + 0.6 * scope} />
            </g>
          </g>

          {/* quinte */}
          <path d={curtainPath(40, 230, 600, FLOOR + 40, t, 0, 3)} fill="url(#op-curtain)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M100 560 Q108 800 94 1060 M168 560 Q160 800 176 1062" stroke="#3E0C1C" strokeWidth="5" fill="none" opacity=".7" />
          <path d={curtainPath(850, 1040, 600, FLOOR + 40, t, 2, 3)} fill="url(#op-curtain)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M910 560 Q918 800 904 1060 M978 560 Q970 800 986 1062" stroke="#3E0C1C" strokeWidth="5" fill="none" opacity=".7" />
          {/* boccascena dorata */}
          <rect x="-200" y="250" width="250" height={FLOOR + 120 - 250} fill="url(#op-frame)" stroke={K} strokeWidth="9" />
          <rect x="1030" y="250" width="250" height={FLOOR + 120 - 250} fill="url(#op-frame)" stroke={K} strokeWidth="9" />
          <path d="M28 270 V1180 M1052 270 V1180" stroke="#F2D58A" strokeWidth="3" opacity=".5" />
          {/* mantovana scura (zona calma dietro il titolo) */}
          <path d={`M-200 230 H1280 V620 ${Array.from({ length: 8 }, () => 'q-92 46 -185 0').join(' ')} Z`} fill="url(#op-valance)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M-200 610 Q-100 660 -15 615 M170 615 Q262 660 355 615 M540 615 Q632 660 725 615 M910 615 Q1002 660 1095 615" stroke="#B23048" strokeWidth="4" fill="none" opacity=".45" />
        </g>

        {/* lampo su tutta la sala */}
        <rect x="-200" y="-200" width="1480" height="2400" fill="#E4EAFF" opacity={flash * 0.1} />

        {/* PIANO 3 — buca dell'orchestra con leggii accesi */}
        <g transform={L(0.9)}>
          <rect x="-200" y={FLOOR + 120} width="1480" height="900" fill="url(#op-pit)" />
          <path d={`M-200 ${FLOOR + 120} H1280`} stroke="#A88A5A" strokeWidth="6" opacity=".6" />
          {STANDS.map((s, i) => (
            <Stand key={i} id={`op-st${i}`} x={s.x} y={1400} s={0.8} t={t} ph={s.ph} lit={up} />
          ))}
          <Notes t={t} x={540} y={1260} n={5} spread={900} rise={480} color={GOLD} outline={K} size={1.1} speed={0.2} />
        </g>

        {/* PIANO 4 — leggio vicino e drappi ai bordi */}
        <g transform={L(1.25)}>
          <path d="M-200 1560 H1280" stroke={K} strokeWidth="14" />
          <path d="M-200 1560 H1280" stroke="#A88A5A" strokeWidth="5" />
          <Stand id="op-stnear" x={860} y={1960} s={1.9} t={t} ph={2} lit={up} />
          {/* bacchetta del direttore appoggiata sul parapetto */}
          <path d="M150 1548 L420 1530" stroke={K} strokeWidth="12" strokeLinecap="round" />
          <path d="M150 1548 L420 1530" stroke="#F4ECDD" strokeWidth="5" strokeLinecap="round" />
          <path d={`M-200 -200 H30 Q${110 + Math.sin(t * 0.8) * 10} 800 70 2200 H-200 Z`} fill="url(#op-curtainV)" stroke={K} strokeWidth="10" />
          <path d={`M1280 -200 H1010 Q${950 + Math.sin(t * 0.8 + 1) * 10} 800 1020 2200 H1280 Z`} fill="url(#op-curtainV)" stroke={K} strokeWidth="10" />
        </g>

        {/* PIANO 5 — pulviscolo vicino alla camera (si arrossa con la botola) */}
        <g transform={L(1.7)}>
          <NearMotes id="op-near" t={t} color={trap > 0.5 ? '#FFB0A0' : '#FFE7C0'} opacity={0.08 + 0.05 * up} />
          {Array.from({ length: 10 }, (_, i) => {
            const p = mod(t * 0.25 + i / 10, 1);
            return <circle key={i} cx={540 + Math.sin(i * 2.3 + t) * 260} cy={FLOOR - p * 700} r={3 + (i % 3)} fill="#FF8A5A" opacity={trap * (1 - p) * 0.8} />;
          })}
        </g>
      </g>

      <Finish id="op" tint="#3A1028" tintOpacity={0.13} />
    </svg>
  );
};
