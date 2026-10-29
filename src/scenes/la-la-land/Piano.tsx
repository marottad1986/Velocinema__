import React from 'react';
import { camera, eio, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import { Beam, Dust, Fire, Glow, NearMotes, Notes, Reflection, StringLights } from '../../lib/elements';
import type { SceneProps } from '../../types';

// Il pianoforte: ristorante di notte con luci di Natale, pianoforte a coda sotto un faro, note che salgono.
// Piani: parete con porta, ghirlanda e albero (0,25) · festoni di luci (0,35) · tavoli con candele (0,5)
//        · pianoforte a coda sotto il faro (0,7) · tende di velluto e tavolo in primo piano (1,2–1,3)
//        · particelle calde (1,7)
// Eventi: note timide di Natale, poi il jazz esplode con «Ma suona jazz» (cue 3);
//         il faro si spegne con «Così il padrone lo licenzia» (cue 4);
//         la porta in fondo si apre e si richiude con «Ma lui la scansa ed esce» (cue 6).

const K = '#1B1530';
const r = rng(1225);
const FLOOR = 1190;
const BULBS = Array.from({ length: 14 }, () => ({ x: (r() - 0.5) * 110, y: r() * 260, c: ['#FFD25C', '#E8505B', '#7FD1B9', '#F4F1E8'][Math.floor(r() * 4)], ph: r() * 6 }));
const PLANKS = Array.from({ length: 9 }, (_, i) => FLOOR + 14 + i * i * 9);

export const Piano: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur, 560, 1050);
  const L = cam.layer;
  const JAZZ = cues[3] ?? 4.97;
  const FIRED = cues[4] ?? 6.33;
  const LEAVE = cues[6] ?? 9.44;

  const jazz = seg(t, JAZZ - 0.1, JAZZ + 0.4) * (1 - seg(t, FIRED, FIRED + 0.5));
  const carol = 1 - seg(t, JAZZ - 0.3, JAZZ);
  // faro: acceso, più forte col jazz, poi si spegne di colpo (con uno sfarfallio)
  const spotOff = seg(t, FIRED, FIRED + 0.12);
  const flick = t > FIRED && t < FIRED + 0.5 ? (Math.sin((t - FIRED) * 50) > 0.3 ? 0.4 : 0) : 0;
  const spot = lerp(0.55 + 0.3 * jazz, 0.08, spotOff) + flick * 0.5;
  // la porta in fondo
  const door = eio(seg(t, LEAVE - 0.35, LEAVE + 0.15)) * (1 - eio(seg(t, LEAVE + 0.9, LEAVE + 1.3)));
  // vibrazione del piano col jazz
  const bop = Math.sin(t * 18) * 1.6 * jazz;
  const lidGlint = mod(t * 0.22, 1);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pi" />
        <Lin id="pi-wall" stops={[[0, '#120E26'], [0.35, '#221A44'], [0.65, '#3A2A5E'], [1, '#2A1F48']]} />
        <Lin id="pi-wain" stops={[[0, '#4A2E3A'], [1, '#2A1A26']]} />
        <Lin id="pi-floor" stops={[[0, '#5A3A34'], [0.4, '#3E2826'], [1, '#1E1420']]} />
        <Lin id="pi-body" x2={1} y2={0} stops={[[0, '#0E0B1A'], [0.55, '#2A2442'], [0.8, '#4A4068'], [1, '#14111F']]} />
        <Lin id="pi-lid" x2={1} y2={0} stops={[[0, '#1A1530'], [0.6, '#3A3258'], [1, '#14101F']]} />
        <Lin id="pi-velvet" x2={1} y2={0} stops={[[0, '#3A0E22'], [0.3, '#7A1E3A'], [0.5, '#5A1430'], [0.75, '#8E2A46'], [1, '#3A0E22']]} />
        <Lin id="pi-cloth" stops={[[0, '#ECE4EE'], [0.5, '#BDB0CE'], [1, '#8E80A8']]} />
        <GlowGradient id="pi-pool" color="#FFF0C8" core={0.75} mid={0.3} />
        <GlowGradient id="pi-door" color="#FFD98A" core={0.8} mid={0.3} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete del ristorante: porta, ghirlanda, boiserie (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height={FLOOR + 220} fill="url(#pi-wall)" />
          <rect x="-200" y="940" width="1480" height={FLOOR - 940 + 10} fill="url(#pi-wain)" />
          <path d="M-200 940 H1280" stroke="#C9A06E" strokeWidth="6" opacity=".6" />
          {[-60, 200, 460, 720, 980].map((x) => <rect key={x} x={x} y="970" width="200" height={FLOOR - 1000} rx="6" fill="none" stroke="#6A4250" strokeWidth="5" />)}
          {/* porta sul retro: si apre quando lui se ne va */}
          <g transform="translate(80 0)">
            <rect x="0" y="770" width="150" height={FLOOR - 770} fill={K} />
            <rect x="0" y="770" width="150" height={FLOOR - 770} fill="#FFE2A0" opacity={door} />
            <rect x="0" y="770" width={150 * (1 - door * 0.85)} height={FLOOR - 770} fill="#5A3A3A" stroke={K} strokeWidth="7" />
            <rect x={14 * (1 - door)} y="790" width={122 * (1 - door * 0.85)} height="160" fill="none" stroke="#7A5050" strokeWidth="5" />
            <circle cx={126 * (1 - door * 0.85)} cy="990" r="7" fill="#C9A06E" />
            <rect x="-14" y="756" width="178" height="18" fill="#3A2440" stroke={K} strokeWidth="6" />
            <rect x="34" y="706" width="82" height="34" rx="4" fill="#2E7A5A" stroke={K} strokeWidth="4" />
            <text x="75" y="731" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="20" fill="#CFF6E2">USCITA</text>
          </g>
          {/* ghirlanda */}
          <g transform="translate(560 690)">
            <circle r="62" fill="none" stroke={K} strokeWidth="40" />
            <circle r="62" fill="none" stroke="#2E5A3E" strokeWidth="30" strokeDasharray="14 8" />
            {[0, 1, 2, 3, 4, 5].map((k) => <circle key={k} cx={Math.cos(k * 1.05) * 62} cy={Math.sin(k * 1.05) * 62} r="8" fill="#E8505B" stroke={K} strokeWidth="3" />)}
            <path d="M-26 58 L0 74 L26 58 L18 98 M-26 58 L-18 98" fill="#C2323E" stroke={K} strokeWidth="5" strokeLinejoin="round" />
          </g>
        </g>

        {/* PIANO 1 — festoni di luci di Natale (0,35) */}
        <g transform={L(0.35)}>
          <StringLights id="pi-s1" t={t} from={{ x: -80, y: 590 }} to={{ x: 560, y: 570 }} n={11} sag={70} />
          <StringLights id="pi-s2" t={t + 0.8} from={{ x: 520, y: 570 }} to={{ x: 1160, y: 600 }} n={11} sag={70} colors={['#E8505B', '#FFD25C', '#F4F1E8', '#7FD1B9']} />
          <StringLights id="pi-s3" t={t + 1.9} from={{ x: -80, y: 760 }} to={{ x: 1160, y: 740 }} n={18} sag={50} colors={['#7FD1B9', '#F4F1E8', '#FFD25C', '#E8505B']} r={8} />
        </g>

        {/* PIANO 2 — albero di Natale e tavoli con candele (0,5) */}
        <g transform={L(0.5)}>
          {/* albero nell'angolo a destra */}
          <g transform="translate(960 800)">
            <path d="M0 0 L-90 150 H-40 L-120 290 H-50 L-140 420 H140 L50 290 H120 L40 150 H90 Z" fill="#1E4A36" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d="M0 0 L-40 70 M-20 180 L-70 260 M-30 330 L-90 400" stroke="#3E7A54" strokeWidth="6" strokeLinecap="round" />
            {BULBS.map((b, i) => {
              const on = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * (2 + (i % 3)) + b.ph));
              const w = 30 + b.y * 0.42;
              return <circle key={i} cx={Math.max(-w, Math.min(w, b.x * (b.y / 260 + 0.3)))} cy={60 + b.y * 1.3} r="8" fill={b.c} stroke={K} strokeWidth="3" opacity={on} />;
            })}
            <path d="M0 -36 L9 -12 L34 -12 L14 3 L22 28 L0 13 L-22 28 L-14 3 L-34 -12 L-9 -12 Z" fill="#F6F1E9" stroke={K} strokeWidth="5" strokeLinejoin="round" />
            <Glow id="pi-star" x={0} y={-6} r={70} t={t} color="#FFF6DC" amp={0.1} rate={3} opacity={0.5} />
            <rect x="-24" y="420" width="48" height="40" fill="#5A3A28" stroke={K} strokeWidth="6" />
          </g>
          {/* tavoli apparecchiati */}
          {[{ x: 190, y: 1160 }, { x: 880, y: 1190 }].map((tb, i) => (
            <g key={i} transform={`translate(${tb.x} ${tb.y})`}>
              <path d="M-110 -40 H110 L130 70 H-130 Z" fill="url(#pi-cloth)" stroke={K} strokeWidth="7" strokeLinejoin="round" />
              <path d="M-110 -40 H110" stroke="#FFFFFF" strokeWidth="5" />
              <path d="M-50 -40 V-80 M-62 -100 Q-50 -70 -38 -100 Z" fill="none" stroke="#D9D4E4" strokeWidth="5" />
              <rect x="20" y="-82" width="14" height="42" fill="#F6F1E9" stroke={K} strokeWidth="4" />
              <Fire id={`pi-c${i}`} t={t + i} x={27} y={-84} scale={0.16} />
            </g>
          ))}
        </g>

        {/* pavimento di legno lucido (0,6) */}
        <g transform={L(0.6)}>
          <rect x="-200" y={FLOOR} width="1480" height={2000 - FLOOR} fill="url(#pi-floor)" />
          {PLANKS.map((y, i) => <path key={i} d={`M-200 ${y} H1280`} stroke="#2A1A1E" strokeWidth={3 + i * 0.4} opacity=".6" />)}
          <Reflection t={t} x={190} y={FLOOR + 30} color="#FFD25C" n={6} w={60} gap={22} opacity={0.35} />
          <Reflection t={t + 1} x={880} y={FLOOR + 40} color="#E8505B" n={6} w={60} gap={22} opacity={0.3} />
          <ellipse cx="560" cy={FLOOR + 70} rx={420} ry={90} fill="url(#pi-pool)" opacity={spot * 0.9} />
          <ellipse cx="155" cy={FLOOR + 30} rx={170} ry={40} fill="url(#pi-door)" opacity={door * 0.9} />
        </g>

        {/* fascio del faro dall'alto a destra, con pulviscolo (0,62) */}
        <g transform={L(0.62)}>
          <Beam id="pi-beam" x={1060} y={260} t={t} length={1050} spread={560} angle={122} color="#FFF0C8" opacity={spot} />
          <g opacity={Math.min(1, spot * 1.4)}>
            <Dust t={t} top={{ y: 420, x0: 900, x1: 1000 }} bottom={{ y: 1150, x0: 300, x1: 760 }} n={30} color="#FFF4D6" />
          </g>
          <circle cx="1060" cy="260" r="34" fill="#3A3258" stroke={K} strokeWidth="6" />
        </g>

        {/* PIANO 3 — il pianoforte a coda (0,7) */}
        <g transform={`${L(0.7)} translate(0 ${bop * 0.3})`}>
          <ellipse cx="560" cy={FLOOR + 22} rx="330" ry="26" fill="#000" opacity=".4" />
          {/* gambe e lira dei pedali */}
          <path d={`M350 1080 V${FLOOR + 10} M800 1080 V${FLOOR + 6}`} stroke={K} strokeWidth="34" strokeLinecap="round" />
          <path d={`M350 1080 V${FLOOR + 10} M800 1080 V${FLOOR + 6}`} stroke="#2A2442" strokeWidth="20" strokeLinecap="round" />
          <path d={`M620 1080 V${FLOOR - 10}`} stroke="#14111F" strokeWidth="24" strokeLinecap="round" />
          <path d={`M450 1090 L440 ${FLOOR - 6} H500 L490 1090`} fill="#2A2442" stroke={K} strokeWidth="6" />
          <path d={`M436 ${FLOOR - 4} h-14 M470 ${FLOOR - 2} v-8 M504 ${FLOOR - 4} h14`} stroke="#C9A06E" strokeWidth="6" strokeLinecap="round" />
          {/* arpa dorata e corde viste sotto il coperchio */}
          <path d="M380 990 L820 820 L860 990 Z" fill="#2A1E1A" />
          <path d="M400 984 Q600 900 820 840 L846 984 Z" fill="#8A6A34" opacity=".9" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${420 + i * 36} 984 L${430 + i * 33} ${974 - i * 11}`} stroke="#F2D9A0" strokeWidth="2.5" opacity=".7" />)}
          {/* coperchio sollevato con l'asta */}
          <path d="M720 990 L742 862" stroke="#3A3258" strokeWidth="10" />
          <path d="M370 994 L850 790 L874 808 L396 1002 Z" fill="url(#pi-lid)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          {/* riflesso del faro che scorre sul coperchio */}
          <path d={`M${lerp(400, 820, lidGlint)} ${lerp(990, 812, lidGlint)} l${70} ${-30}`} stroke="#FFF6DC" strokeWidth="9" strokeLinecap="round" opacity={(0.25 + 0.6 * spot) * Math.sin(lidGlint * Math.PI)} />
          <path d="M420 990 L840 812" stroke="#8C80B8" strokeWidth="4" opacity={0.3 + spot * 0.5} />
          {/* cassa */}
          <path d="M320 990 H760 Q880 990 884 1046 V1094 H320 Z" fill="url(#pi-body)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M330 1004 H760 Q860 1004 870 1040" fill="none" stroke="#B2A6DA" strokeWidth="5" opacity={0.3 + spot * 0.6} />
          {/* tastiera e leggio con lo spartito */}
          <rect x="226" y="992" width="104" height="30" fill="#F6F1E9" stroke={K} strokeWidth="6" />
          {[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={232 + k * 16} y="992" width="9" height="16" fill={K} />)}
          <path d="M216 1022 H336 V1050 H230 Z" fill="#14111F" stroke={K} strokeWidth="6" />
          <path d="M300 990 L276 914 L380 902 L384 984" fill="#14111F" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          <path d="M288 980 L272 924 L350 916 L358 970 Z" fill="#F6F1E9" stroke={K} strokeWidth="4" />
          <path d="M282 940 L344 934 M284 952 L346 946 M286 964 L348 958" stroke={K} strokeWidth="2.5" opacity=".6" />
          {/* panchetta */}
          <rect x="120" y="1086" width="140" height="28" rx="6" fill="#2A2442" stroke={K} strokeWidth="7" />
          <path d={`M136 1114 V${FLOOR + 8} M244 1114 V${FLOOR + 8}`} stroke={K} strokeWidth="14" strokeLinecap="round" />
          <path d="M130 1092 H250" stroke="#8C80B8" strokeWidth="4" opacity=".7" />
        </g>

        {/* le note: canzoncine di Natale prima, poi il jazz */}
        <g transform={L(0.75)}>
          <g opacity={carol * (1 - jazz)}>
            <Notes t={t} x={600} y={930} n={3} color="#F6F1E9" rise={260} spread={140} size={0.75} speed={0.2} seed={83} />
          </g>
          <g opacity={jazz}>
            <Notes t={t} x={620} y={940} n={11} rise={330} spread={560} size={1.2} speed={0.42} seed={91} />
            <Notes t={t + 0.4} x={480} y={970} n={5} color="#F6F1E9" rise={300} spread={320} size={0.9} speed={0.5} seed={97} />
            <Glow id="pi-jazz" x={600} y={880} r={300} t={t} color="#F2C14E" amp={0.15} rate={9} opacity={0.35} />
          </g>
        </g>

        {/* PIANO 4 — tende di velluto ai lati (1,2) */}
        <g transform={L(1.2)}>
          {[{ x: -60, s: 1 }, { x: 1140, s: -1 }].map((c, i) => (
            <g key={i} transform={`translate(${c.x} 0) scale(${c.s} 1)`}>
              <path d={`M-200 -200 H${130 + Math.sin(t * 0.7 + i) * 8} Q${60} 700 ${110 + Math.sin(t * 0.9 + i) * 10} 1300 Q${150} 1700 ${80} 2000 H-200 Z`} fill="url(#pi-velvet)" stroke={K} strokeWidth="10" strokeLinejoin="round" />
              <path d={`M40 -200 Q0 700 50 1300 M90 -200 Q40 600 80 1250`} fill="none" stroke="#2A0A18" strokeWidth="8" opacity=".6" />
              <path d={`M70 -200 Q30 700 74 1300`} fill="none" stroke="#C2506E" strokeWidth="5" opacity=".5" />
              <path d="M-40 1180 Q60 1150 150 1210" fill="none" stroke="#C9A06E" strokeWidth="16" strokeLinecap="round" />
            </g>
          ))}
        </g>

        {/* PIANO 5 — angolo di un tavolo in primo piano con bicchiere e candela (1,3) */}
        <g transform={L(1.3)}>
          <path d="M-200 1560 Q400 1520 1000 1600 L1280 1640 V2000 H-200 Z" fill="url(#pi-cloth)" stroke={K} strokeWidth="10" strokeLinejoin="round" />
          <path d="M-200 1700 Q300 1680 900 1760" fill="none" stroke="#B9AECB" strokeWidth="6" opacity=".7" />
          <g transform="translate(300 1600)">
            <path d="M-46 -150 Q-50 -70 0 -60 Q50 -70 46 -150 Z" fill="#E9F0F2" opacity=".5" stroke={K} strokeWidth="7" />
            <path d="M-40 -110 Q0 -100 40 -110 Q44 -76 0 -66 Q-44 -76 -40 -110 Z" fill="#8E1E3A" />
            <path d="M0 -60 V0 M-40 4 H40" stroke={K} strokeWidth="9" strokeLinecap="round" />
            <path d="M-30 -140 Q-34 -100 -20 -80" stroke="#FFFFFF" strokeWidth="5" fill="none" opacity=".8" />
          </g>
          <g transform="translate(720 1640)">
            <rect x="-20" y="-120" width="40" height="120" fill="#F6F1E9" stroke={K} strokeWidth="7" />
            <path d="M-50 0 H50" stroke="#C9A06E" strokeWidth="14" strokeLinecap="round" />
            <Fire id="pi-cand" t={t} x={0} y={-122} scale={0.32} />
          </g>
        </g>

        {/* PIANO 6 — particelle calde vicine (1,7) */}
        <g transform={L(1.7)}>
          <NearMotes id="pi-near" t={t} color="#FFD9A0" n={8} opacity={0.12} />
        </g>
      </g>

      <Finish id="pi" tint="#2C2456" tintOpacity={0.13} />
    </svg>
  );
};
