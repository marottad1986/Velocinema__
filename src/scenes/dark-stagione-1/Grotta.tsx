import React from 'react';
import { camera, eio, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { DISPLAY } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Drips, Dust, Glow, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K, Pines, TINT, YELLOW } from './Winden';

// La regola dei 33 anni: spaccato della grotta come un plastico, un «ascensore» con tre piani. Ogni piano è una galleria
// con una porta di ferro e una targa con l'anno (2019 in alto, 1986, 1953 in fondo); a destra il pozzo del passaggio,
// dove una luce calda scende come la cabina di un ascensore. Sopra, il bosco in superficie. Nessuna persona.
// Eventi: il passaggio si illumina (cue 0) · la luce scende dal 2019 al 1986 (cue 1) · compare «−33 anni» (cue 2)
//         · l'indicatore dei piani si accende (cue 3) · le targhe si accendono una alla volta: 1953, 1986, 2019 (cue 4).
// Piani: cielo e bosco in superficie (0,25) · roccia di fondo (0,45) · gallerie, porte e pozzo (0,65)
//        · bordi di roccia e stalattiti (1,2) · gocce, pulviscolo e particelle (1,5–1,8)

const FLOORS = [
  { y: 715, year: 2019 },
  { y: 945, year: 1986 },
  { y: 1175, year: 1953 },
];
const SHAFT = 820;
const r = rng(33);
const CRACKS = Array.from({ length: 14 }, () => ({ x: 120 + r() * 840, y: 620 + r() * 640, l: 30 + r() * 60, a: r() * 180 }));

export const Grotta: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const on = eo(seg(t, cues[0], cues[0] + 0.8));
  // posizione della cabina di luce (indice di piano, anche frazionario)
  const down1 = eio(seg(t, cues[1] + 0.2, cues[1] + 1.4));
  const back = eio(seg(t, cues[3], cues[3] + 0.8)); // torna in alto per il giro dei tre piani
  const tour = cues[4];
  const tour1 = eio(seg(t, tour + 0.1, tour + 0.7));
  const tour2 = eio(seg(t, tour + 1.1, tour + 1.7));
  let floor = down1 * (1 - back) + back * 2; // sotto, poi al 1953 per iniziare il giro
  floor = lerp(floor, 1, tour1);
  floor = lerp(floor, 0, tour2);
  const cabY = lerp(FLOORS[0].y, FLOORS[2].y, floor / 2);
  const minus = eob(seg(t, cues[2], cues[2] + 0.5));
  const panel = eo(seg(t, cues[3], cues[3] + 0.5));
  const plate = (k: number) => {
    // durante il giro: 1953 (k=2) poi 1986 (k=1) poi 2019 (k=0); prima del giro la targa vicina alla luce
    const near = 1 - Math.min(1, Math.abs(floor - k));
    const turn = [tour + 1.7, tour + 0.7, tour][k];
    return Math.max(near * on, seg(t, turn, turn + 0.25));
  };

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="gr" />
        <Lin id="gr-sky" stops={[[0, '#0A1110'], [0.6, '#1E2E28'], [1, '#2E423A']]} />
        <Lin id="gr-rock" stops={[[0, '#3A3A32'], [0.4, '#2A2A24'], [1, '#14140F']]} />
        <Lin id="gr-hall" stops={[[0, '#1A1A16'], [0.7, '#2E2C24'], [1, '#3E3A2E']]} />
        <Lin id="gr-door" x2={1} y2={0} stops={[[0, '#5A5E5C'], [0.5, '#7A7E7A'], [1, '#3A3E3C']]} />
        <Lin id="gr-shaft" x2={1} y2={0} stops={[[0, '#0E0E0B'], [0.5, '#24221C'], [1, '#0E0E0B']]} />
        <Lin id="gr-edge" x2={1} y2={0} stops={[[0, '#0C0C0A'], [1, '#22221C']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo notturno e bosco in superficie (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#gr-sky)" />
          <Pines t={t} y={600} n={12} h={170} seed={23} color="#101A16" sway={2} />
        </g>

        {/* PIANO 1 — roccia di fondo con crepe e vene (0,45) */}
        <g transform={L(0.45)}>
          <path d="M-200 590 Q200 570 540 588 Q860 600 1280 580 V2200 H-200 Z" fill="url(#gr-rock)" />
          <path d="M-200 590 Q200 570 540 588 Q860 600 1280 580" fill="none" stroke="#4E5A44" strokeWidth="10" />
          {CRACKS.map((c, i) => <path key={i} d={`M${c.x} ${c.y} l${Math.cos(c.a) * c.l} ${Math.sin(c.a) * c.l} l${c.l * 0.4} ${c.l * 0.3}`} fill="none" stroke="#0E0E0B" strokeWidth="4" opacity=".7" />)}
        </g>

        {/* PIANO 2 — gallerie con porte e targhe, pozzo del passaggio con la cabina di luce (0,65) */}
        <g transform={L(0.65)}>
          {/* pozzo */}
          <rect x={SHAFT - 60} y={FLOORS[0].y - 110} width="120" height={FLOORS[2].y - FLOORS[0].y + 200} fill="url(#gr-shaft)" stroke={K} strokeWidth="8" />
          {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${SHAFT - 60} ${FLOORS[0].y - 80 + i * 56} H${SHAFT + 60}`} stroke="#3A382E" strokeWidth="4" />)}
          <Glow id="gr-sg" x={SHAFT} y={(FLOORS[0].y + FLOORS[2].y) / 2} r={420} t={t} color="#FFE6A0" amp={0.05} rate={1.6} opacity={0.18 * on} />
          {FLOORS.map((f, k) => {
            const lit = plate(k);
            return (
              <g key={f.year}>
                {/* galleria */}
                <path d={`M140 ${f.y + 80} V${f.y - 50} Q140 ${f.y - 90} 190 ${f.y - 90} H${SHAFT - 60} V${f.y + 80} Z`} fill="url(#gr-hall)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
                <path d={`M140 ${f.y + 80} H${SHAFT + 60}`} stroke="#4A4636" strokeWidth="8" />
                {/* porta di ferro con rivetti, socchiusa quando la luce è al suo piano */}
                <g transform={`translate(300 ${f.y + 80})`}>
                  <Glow id={`gr-dg${k}`} x={20} y={-80} r={160} t={t} color="#FFE6A0" amp={0.1} rate={3} ph={k} opacity={0.6 * lit} />
                  <rect x="-60" y="-150" width="120" height="150" fill="#FFE6A0" opacity={0.8 * lit} />
                  <rect x="-60" y="-150" width="120" height="150" fill="url(#gr-door)" stroke={K} strokeWidth="8" transform={`skewY(${-lit * 8}) scale(${1 - lit * 0.25} 1)`} />
                  {[-130, -20].map((yy) => [-40, 0, 40].map((xx) => <circle key={`${xx}${yy}`} cx={xx * (1 - lit * 0.25)} cy={yy - lit * xx * 0.14} r="5" fill="#2A2E2C" />))}
                </g>
                {/* targa con l'anno */}
                <g transform={`translate(530 ${f.y + 10})`}>
                  <Glow id={`gr-pg${k}`} x={0} y={0} r={170} t={t} color={YELLOW} amp={0.08} rate={2.4} ph={k} opacity={0.55 * lit} />
                  <rect x="-110" y="-44" width="220" height="88" rx="10" fill={lit > 0.5 ? YELLOW : '#2A2A24'} stroke={K} strokeWidth="7" />
                  <text y="22" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="62" fill={lit > 0.5 ? K : '#8A8A78'}>{f.year}</text>
                </g>
                {/* lampadina della galleria */}
                <path d={`M220 ${f.y - 90} V${f.y - 60}`} stroke={K} strokeWidth="4" />
                <circle cx="220" cy={f.y - 52} r="10" fill="#F6E0A0" />
                <Glow id={`gr-lb${k}`} x={220} y={f.y - 52} r={90} t={t} color="#F6E0A0" amp={0.12} rate={2 + k} opacity={0.4} />
              </g>
            );
          })}
          {/* cabina di luce che scende e sale nel pozzo */}
          <g transform={`translate(${SHAFT} ${cabY})`} opacity={on}>
            <Glow id="gr-cab" x={0} y={0} r={190} t={t} color="#FFF1C2" amp={0.12} rate={6} opacity={0.85} />
            <circle r="34" fill="#FFF8E0" />
            <circle r="34" fill="none" stroke={YELLOW} strokeWidth="6" />
          </g>
          {/* «−33 anni» tra un piano e l'altro */}
          {[0, 1].map((k) => (
            <g key={k} transform={`translate(${SHAFT - 160} ${(FLOORS[k].y + FLOORS[k + 1].y) / 2 - 5}) scale(${minus})`} opacity={seg(t, cues[2], cues[2] + 0.2)}>
              <rect x="-80" y="-34" width="160" height="68" rx="34" fill={K} stroke={YELLOW} strokeWidth="5" />
              <text y="14" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="40" fill={YELLOW}>−33</text>
            </g>
          ))}
          {/* indicatore dei piani come in un ascensore */}
          <g transform={`translate(${SHAFT} ${FLOORS[0].y - 160})`} opacity={panel}>
            <rect x="-80" y="-32" width="160" height="58" rx="8" fill="#14140F" stroke={K} strokeWidth="6" />
            {[0, 1, 2].map((k) => <circle key={k} cx={-46 + k * 46} cy="-3" r="13" fill={Math.round(floor) === k ? YELLOW : '#3A3A30'} />)}
            <path d={`M100 ${floor < 0.99 && t > cues[3] ? 0 : -6} l14 ${floor < 0.99 ? 14 : -14} l14 ${floor < 0.99 ? -14 : 14}`} fill="none" stroke={YELLOW} strokeWidth="6" />
          </g>
        </g>

        {/* PIANO 3 — bordi di roccia e stalattiti (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 520 H60 Q110 700 70 900 Q20 1100 90 1300 Q120 1500 40 1700 Q0 1900 60 2200 H-200 Z" fill="url(#gr-edge)" stroke={K} strokeWidth="10" />
          <path d="M1280 520 H1020 Q980 760 1030 960 Q1060 1180 990 1380 Q960 1600 1040 2200 H1280 Z" fill="url(#gr-edge)" stroke={K} strokeWidth="10" />
          <path d="M-200 1300 Q300 1270 540 1300 Q800 1330 1280 1290 V2200 H-200 Z" fill="#0E0E0B" stroke={K} strokeWidth="10" />
          {[[160, 1310, 50], [420, 1300, 70], [700, 1316, 46], [900, 1306, 60]].map(([x, y, h], i) => <path key={i} d={`M${x - 20} ${y} L${x} ${y - h} L${x + 20} ${y} Z`} fill="#1E1E18" stroke={K} strokeWidth="6" strokeLinejoin="round" />)}
          {/* metà bassa: pozza che riflette la luce, sassi e una vecchia lanterna */}
          <ellipse cx="620" cy="1620" rx="300" ry="50" fill="#1E2A26" stroke={K} strokeWidth="6" />
          <ellipse cx="620" cy="1620" rx={220 + Math.sin(t * 2) * 10} ry="30" fill="none" stroke="#5E7A6E" strokeWidth="3" opacity=".5" />
          <ellipse cx="620" cy="1615" rx="120" ry="14" fill="#FFE6A0" opacity={0.15 + 0.15 * on} />
          {[[120, 1720, 90], [330, 1840, 70], [900, 1760, 110], [1010, 1560, 60]].map(([x, y, rr], i) => <ellipse key={i} cx={x} cy={y} rx={rr} ry={rr * 0.55} fill="#24241E" stroke={K} strokeWidth="8" />)}
          <g transform="translate(230 1540)">
            <Glow id="gr-lan" x={0} y={-40} r={200} t={t} color="#FFD27A" amp={0.1} rate={3} opacity={0.55} />
            <path d="M-26 0 H26 L20 -70 H-20 Z" fill="#FFD27A" opacity=".85" stroke={K} strokeWidth="6" />
            <path d="M-30 -70 H30 M0 -70 Q0 -100 -20 -96" fill="none" stroke={K} strokeWidth="7" />
            <rect x="-34" y="0" width="68" height="14" fill="#3A3428" stroke={K} strokeWidth="5" />
          </g>
        </g>

        {/* PIANO 4 — gocce, pulviscolo nel pozzo, particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Drips t={t} x={120} y0={600} y1={1290} n={2} period={3.1} color="#9AB8B0" ripple={60} />
          <Drips t={t + 1.3} x={980} y0={640} y1={1290} n={2} period={2.7} color="#9AB8B0" ripple={60} />
        </g>
        <g transform={L(0.65)}>
          <Dust t={t} top={{ y: FLOORS[0].y - 100, x0: SHAFT - 50, x1: SHAFT + 50 }} bottom={{ y: FLOORS[2].y + 80, x0: SHAFT - 50, x1: SHAFT + 50 }} n={26} color="#FFE6A0" boost={0.1 * on} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="gr-near" t={t} color="#D8D0B0" n={5} vx={-20} vy={-8} opacity={0.07} />
        </g>
      </g>

      <Finish id="gr" tint={TINT} tintOpacity={0.12} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): passaggio cue0 · discesa 2019→1986 cue1+0,2 · «−33» cue2 · indicatore e risalita al
// 1953 cue3 · giro delle targhe da cue4: 1953, +0,7 1986, +1,7 2019.
