import React from 'react';
import { camera, eio, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Glow, NearMotes, Smoke, flashAt } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { BBDefs, Cactus, Cespuglio } from '../breaking-bad-stagione-1/Comuni';
import { Auto, BB2Defs, K, ORO, Ombra } from './Comuni';

// La sparatoria di Hank: il cortile della casupola a mezzogiorno. Persone mai: Jesse e Walter sono il sasso caduto e le
// rocce dietro cui si nascondono, Hank è la sua auto che arriva, Tuco è il pick-up. Eventi: prima frase il sasso cade a
// terra con uno sbuffo di polvere (Jesse ha colpito Tuco); seconda frase l'auto di Hank arriva da destra nella polvere e
// si ferma con la portiera che si apre; terza frase due lampi di sparo (dalla portiera e dall'angolo del pick-up), i
// bossoli dorati che cadono sulla ghiaia, poi il silenzio e un falco che si alza in volo.
// Piani: cielo bianco di caldo e mesa (0,22–0,35) · casa e pick-up (0,55) · auto di Jesse e auto di Hank (0,7)
//        · rocce, sasso e bossoli in primo piano (1,2) · polvere e tremolio vicini (1,6)

const r = rng(2203);
const PEBBLES = Array.from({ length: 30 }, () => ({ x: r() * 1400 - 160, y: 1500 + r() * 440, rx: 8 + r() * 22, ry: 5 + r() * 10 }));

export const Hank: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tRock = griglia(cues[0] + 0.8);
  const tCar = griglia(cues[1] + 0.2);
  const tStop = griglia(cues[1] + 2.4);
  const tShot1 = griglia(cues[2] + 0.9);
  const tShot2 = tShot1 + 0.625;
  const rockFall = seg(t, tRock - 0.35, tRock);
  const drive = eio(seg(t, tCar, tStop));
  const carX = lerp(1500, 860, drive);
  const door = eo(seg(t, tStop + 0.1, tStop + 0.6));
  const fl = flashAt(t, [tShot1, tShot2]);
  const tHawk = tShot2 + 0.4;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="hk" />
        <BBDefs id="hk" />
        <BB2Defs id="hk" />
        <Lin id="hk-sky" stops={[[0, '#1E4A78'], [0.3, '#4A86B8'], [0.5, '#A8D0E4'], [0.58, '#F6E8C8']]} />
        <Lin id="hk-sand" stops={[[0, '#E0B07A'], [0.5, '#C08A58'], [1, '#6A4428']]} />
        <Lin id="hk-adobe" x2={1} y2={0} stops={[[0, '#E8B080'], [0.6, '#C88A58'], [1, '#8A5A34']]} />
        <Lin id="hk-rock" x2={1} y2={0} stops={[[0, '#B87A54'], [0.5, '#8A5638'], [1, '#4A2A1A']]} />
        <Lin id="hk-red" stops={[[0, '#B83A34'], [0.5, '#8A2422'], [1, '#4A1212']]} />
        <Lin id="hk-tan" stops={[[0, '#D8C8A0'], [0.5, '#A89870'], [1, '#5A5038']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo bianco di caldo, sole alto, falco (0,22) */}
        <g transform={L(0.22)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#hk-sky)" />
          <rect x="-200" y="-200" width="1480" height="2400" fill="#FFFFFF" opacity={0.5 * fl} />
          {/* falco che plana, poi si alza dopo gli spari */}
          {(() => {
            const p = seg(t, tHawk, tHawk + 2.6);
            const x = t < tHawk ? 700 + Math.sin(t * 0.5) * 80 : lerp(700 + Math.sin(tHawk * 0.5) * 80, 1150, p);
            const y = t < tHawk ? 700 + Math.cos(t * 0.5) * 20 : lerp(700, 560, p);
            const flap = t < tHawk ? 0.2 : Math.sin(t * 12);
            return (
              <g transform={`translate(${x} ${y})`}>
                <path d={`M0 0 Q-34 ${-18 * flap - 6} -70 ${-4 * flap} Q-34 0 0 6 Q34 0 70 ${-4 * flap} Q34 ${-18 * flap - 6} 0 0 Z`} fill="#3A2A1E" stroke={K} strokeWidth="2" />
                <path d="M-6 4 L0 22 L6 4 Z" fill="#3A2A1E" />
              </g>
            );
          })()}
        </g>
        <g transform={`${L(0.35)} translate(0 -110)`}>
          <path d="M-200 1080 L-80 980 H200 L240 960 H380 L430 1080 Z" fill="#C8886A" />
          <path d="M620 1080 L680 940 H940 L980 920 H1100 L1160 1020 H1280 V1080 Z" fill="#B87A5A" stroke={K} strokeWidth="5" />
          <path d="M682 944 H940" stroke="#F6D0A8" strokeWidth="4" opacity=".8" />
          <rect x="-200" y="1070" width="1480" height="60" fill="#D8A878" />
          {/* tremolio del caldo sull'orizzonte */}
          {Array.from({ length: 6 }, (_, k) => <path key={k} d={`M${-100 + k * 230} ${1090 + Math.sin(t * 3 + k) * 4} q40 -8 80 0 t80 0`} stroke="#FFF4DC" strokeWidth="4" fill="none" opacity=".5" />)}
        </g>

        {/* PIANO 2 — la casupola e il pick-up di Tuco (0,55) */}
        <g transform={`${L(0.55)} translate(0 -110)`}>
          <path d="M-200 1110 H1280 V1400 H-200 Z" fill="url(#hk-sand)" />
          <g transform="translate(250 1180) scale(1.2)">
            <Ombra id="hk" x={0} y={6} rx={260} ry={22} />
            <path d="M-220 0 V-220 Q-226 -240 -206 -244 H210 Q228 -240 222 -220 V0 Z" fill="url(#hk-adobe)" stroke={K} strokeWidth="9" />
            {Array.from({ length: 6 }, (_, k) => <circle key={k} cx={-180 + k * 70} cy={-232} r="10" fill="#5A3A22" stroke={K} strokeWidth="3" />)}
            <rect x="-150" y="-170" width="110" height="90" fill="#2A1E16" stroke={K} strokeWidth="7" />
            <path d="M-95 -170 V-80 M-150 -125 H-40" stroke={K} strokeWidth="5" />
            {/* porta spalancata */}
            <rect x="40" y="-180" width="90" height="180" fill="#120C08" stroke={K} strokeWidth="7" />
            <path d="M130 -180 L170 -170 V-8 L130 0 Z" fill="#5A4A40" stroke={K} strokeWidth="5" />
            <path d="M150 -244 V-320 M130 -300 H170" stroke="#3A3A3A" strokeWidth="5" />
          </g>
          {/* pick-up di Tuco */}
          <g transform="translate(600 1250) scale(0.62)">
            <Ombra id="hk" x={0} y={4} rx={440} ry={30} />
            <path d="M-400 -60 V-200 H-40 V-300 Q-40 -320 -20 -320 H170 Q200 -320 220 -290 L280 -210 L380 -200 Q410 -196 410 -166 V-60 Z" fill="#E8E4DC" stroke={K} strokeWidth="9" />
            <path d="M-20 -300 V-210 H260 L200 -290 Q190 -300 170 -300 Z" fill="#1A2430" stroke={K} strokeWidth="5" />
            <path d="M-400 -150 H410" stroke="#A8A49C" strokeWidth="5" />
            <path d="M-390 -200 V-240 H-60" stroke="#8A8680" strokeWidth="8" fill="none" />
            {[-230, 230].map((wx) => <g key={wx}><circle cx={wx} cy="-58" r="64" fill="#121414" stroke={K} strokeWidth="8" /><circle cx={wx} cy="-58" r="28" fill="url(#hk-metal)" stroke={K} strokeWidth="5" /></g>)}
          </g>
          <Cactus id="hk" x={980} y={1230} s={0.42} />
          <Cespuglio x={470} y={1300} s={0.8} seed={2} color="#8A8A4A" />
        </g>

        {/* PIANO 3 — l'auto rossa di Jesse ferma e l'auto di Hank che arriva (0,7) */}
        <g transform={`${L(0.7)} translate(0 -110)`}>
          <path d="M-200 1300 Q500 1280 1280 1300 V1560 H-200 Z" fill="#C8925E" />
          {Array.from({ length: 10 }, (_, k) => <path key={k} d={`M${-150 + k * 140} ${1380 + (k % 3) * 30} q30 -6 60 0`} stroke="#8A5A36" strokeWidth="4" fill="none" opacity=".6" />)}
          {t > tCar && <Smoke id="hk-dust" t={t - tCar} x={carX + 200} y={1240} color="#E8C098" n={7} rise={150} wind={t < tStop ? 260 : 40} r0={50} r1={170} speed={0.55} opacity={0.8 * (1 - seg(t, tStop + 0.4, tStop + 2.6))} />}
          <Auto id="hk" x={180} y={1330} s={0.5} body="url(#hk-red)" />
          <g>
            <Auto id="hk" x={carX} y={1330} s={0.56} body="url(#hk-tan)" flip spin={t < tStop ? -t * 900 : 0} />
            {/* portiera che si apre verso di noi */}
            {door > 0 && <path d={`M${carX - 10} ${1330 - 0.56 * 196} l${-90 * door} ${30 * door} v${0.56 * 120} l${90 * door} ${-6 * door} Z`} fill="#B8A880" stroke={K} strokeWidth="5" />}
            {/* lampo dello sparo dalla portiera */}
            {t > tShot1 && t < tShot1 + 0.17 && <g transform={`translate(${carX - 110} ${1330 - 0.56 * 210})`}><path d="M0 0 L-60 -14 L-30 0 L-70 18 L0 6 Z" fill="#FFF2B0" /><Glow id="hk-mz1" x={0} y={0} r={140} t={t} color="#FFE080" opacity={0.95} /></g>}
          </g>
          {/* lampo dello sparo dall'angolo del pick-up */}
          {t > tShot2 && t < tShot2 + 0.17 && <g transform="translate(360 1190)"><path d="M0 0 L60 -10 L30 0 L64 16 L0 6 Z" fill="#FFF2B0" /><Glow id="hk-mz2" x={0} y={0} r={120} t={t} color="#FFE080" opacity={0.9} /></g>}
        </g>

        {/* PIANO 4 — rocce dove si nascondono, il sasso caduto, i bossoli dorati (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1420 Q400 1380 1280 1430 V2200 H-200 Z" fill="url(#hk-sand)" />
          {PEBBLES.map((s, i) => <ellipse key={i} cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} fill={i % 3 ? '#9A6A44' : '#B8865A'} stroke={K} strokeWidth="3" />)}
          {/* rocce grandi a sinistra: il nascondiglio */}
          <path d="M-200 2000 V1520 Q-120 1400 20 1440 Q120 1380 220 1470 Q300 1530 300 1700 Q320 1820 260 2000 Z" fill="url(#hk-rock)" stroke={K} strokeWidth="10" />
          <path d="M-120 1480 Q-40 1450 30 1470 M80 1430 Q160 1430 210 1490" stroke="#E0A880" strokeWidth="6" fill="none" />
          <path d="M40 1600 L120 1700 L90 1820" stroke="#3A2214" strokeWidth="5" fill="none" />
          {/* il sasso che cade a terra */}
          <g transform={`translate(${lerp(560, 600, rockFall)} ${lerp(1420, 1640, rockFall * rockFall)}) rotate(${rockFall * 160}) scale(1.5)`}>
            <path d="M-50 10 Q-60 -30 -20 -44 Q30 -52 54 -14 Q62 24 20 36 Q-30 40 -50 10 Z" fill="#9A6A4A" stroke={K} strokeWidth="7" />
            <path d="M-30 -30 Q0 -40 30 -26" stroke="#D8A07A" strokeWidth="5" fill="none" />
            <path d="M10 14 q14 -2 18 -14" stroke="#5A1A14" strokeWidth="6" opacity=".7" />
          </g>
          {t > tRock && <Smoke id="hk-puff" t={t - tRock} x={600} y={1660} color="#E8C098" n={4} rise={60} wind={30} r0={30} r1={90} speed={1.2} opacity={0.7 * (1 - seg(t, tRock + 0.3, tRock + 1.4))} />}
          {/* bossoli che cadono e rimbalzano */}
          {[tShot1, tShot1 + 0.08, tShot2, tShot2 + 0.08].map((ts, i) => {
            const p = seg(t, ts + 0.1, ts + 0.8);
            if (p <= 0) return null;
            const x = 720 + i * 60, y = lerp(1460, 1700 + (i % 2) * 30, Math.min(1, p * 1.4)) - (p > 0.7 ? Math.sin((p - 0.7) * 10) * 14 : 0);
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${p * 520 + i * 40})`}>
                <rect x="-8" y="-18" width="16" height="36" rx="4" fill={ORO} stroke={K} strokeWidth="4" />
                <path d="M-3 -14 V12" stroke="#FFF2C0" strokeWidth="3" />
              </g>
            );
          })}
          <Cespuglio x={980} y={1960} s={1.6} seed={5} color="#7A7A44" />
        </g>

        {/* PIANO 5 — polvere vicina (1,6) */}
        <g transform={L(1.6)}>
          {Array.from({ length: 14 }, (_, i) => {
            const x = mod(i * 97 - t * (50 + i * 3), 1480) - 200;
            return <circle key={i} cx={x} cy={900 + ((i * 131) % 700)} r={2 + (i % 3)} fill="#FFF0D0" opacity=".5" />;
          })}
          <NearMotes id="hk-near" t={t} color="#FFE8C0" n={6} r0={70} r1={150} opacity={0.12} />
        </g>
      </g>
      <Finish id="hk" tint="#D8A040" tintOpacity={0.1} />
    </svg>
  );
};
