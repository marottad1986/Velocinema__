import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { Glow, Gulls, NearMotes, Smoke } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { BBDefs, Cactus, Camper, Cespuglio, K, Ombra, ORO } from './Comuni';

// Il gas velenoso: il camper nel deserto al tramonto. Eventi: prima frase arriva da sinistra l'auto scura dei due
// spacciatori (Emilio e Krazy-8) e si ferma accanto al camper; seconda frase dentro si accende la luce del fornello e
// dallo sfiato esce il fumo bianco della «cucina» (Walter finge di cucinare per loro); terza frase la porta sbatte e si
// chiude, i vetri si riempiono di gas rossastro che filtra dalle fessure, e davanti al gradino cade una maschera antigas.
// Piani: cielo del tramonto (0,22) · mesa in controluce (0,38) · auto degli spacciatori e cactus (0,55) · camper (0,7)
//        · maschera antigas, fornello, terreno (0,95) · rocce e cespugli in primo piano (1,25) · gas e polvere vicini (1,5–1,8)

const r = rng(5505);
const STONES = Array.from({ length: 30 }, () => ({ x: -200 + r() * 1480, y: 1260 + r() * 650, r: 4 + r() * 8 }));

export const Gas: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tCar = griglia(cues[0] + 1.2);
  const car = eo(seg(t, 0.2, tCar));
  const lamp = eo(seg(t, griglia(cues[1] + 0.2), griglia(cues[1] + 0.2) + 0.6));
  const cook = eo(seg(t, griglia(cues[1] + 0.6), griglia(cues[1] + 0.6) + 1.0));
  const tSlam = griglia(cues[2] + 0.2);
  const door = t < tSlam ? 0.7 : 0.7 * (1 - eo(seg(t, tSlam, tSlam + 0.15)));
  const gas = eo(seg(t, tSlam + 0.2, tSlam + 1.8));
  const maskFall = seg(t, tSlam + 0.05, tSlam + 0.45);
  const maskY = maskFall < 1 ? lerp(1110, 1262, maskFall * maskFall) : 1262 - Math.sin(seg(t, tSlam + 0.45, tSlam + 0.7) * Math.PI) * 14;
  const shake = t > tSlam && t < tSlam + 0.3 ? Math.sin(t * 90) * 4 * (1 - seg(t, tSlam, tSlam + 0.3)) : 0;
  const dusk = seg(t, 0, dur);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="gs" />
        <BBDefs id="gs" />
        <Lin id="gs-sky" stops={[[0, '#1E1E44'], [0.3, '#4A3058'], [0.48, '#B8584A'], [0.6, '#F29A58']]} />
        <Lin id="gs-sand" stops={[[0, '#B88058'], [0.4, '#8A5A3E'], [1, '#4A3020']]} />
        <Lin id="gs-car" stops={[[0, '#4A2A2E'], [0.5, '#2A161A'], [1, '#120A0C']]} />
        <radialGradient id="gs-gas"><stop offset="0" stopColor="#F6D0BE" stopOpacity="1" /><stop offset=".6" stopColor="#E89080" stopOpacity=".6" /><stop offset="1" stopColor="#E8A898" stopOpacity="0" /></radialGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo del tramonto che si scurisce (0,22) */}
        <g transform={L(0.22)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#gs-sky)" />
          <rect x="-200" y="-200" width="1480" height="2400" fill="#0E0E24" opacity={0.25 * dusk} />
          <Glow id="gs-sun" x={300} y={1060} r={420} t={t} color="#FFC878" amp={0.03} rate={0.8} opacity={0.8} />
          <circle cx="300" cy={lerp(1040, 1080, dusk)} r="70" fill="#FFE8B0" />
          {[0, 1].map((k) => <ellipse key={k} cx={700 + k * 220} cy={760 + k * 60} rx={200} ry="16" fill="#E88A6A" opacity=".6" />)}
          <Gulls t={t} seed={13} n={3} y={720} h={100} color="#1A1020" size={0.9} period={15} />
        </g>

        {/* PIANO 1 — mesa in controluce (0,38) */}
        <g transform={L(0.38)}>
          <path d="M-200 1100 L-60 980 H200 L240 1000 L360 1100 Z" fill="#5A2E3A" />
          <path d="M600 1100 L660 940 H900 L940 920 H1060 L1120 1020 H1280 V1100 Z" fill="#4A2632" />
          <path d="M662 944 H900" stroke="#E88A6A" strokeWidth="4" opacity=".7" />
          <rect x="-200" y="1090" width="1480" height="60" fill="#7A4A3A" />
        </g>

        {/* PIANO 2 — l'auto degli spacciatori che arriva, cactus lontani (0,55) */}
        <g transform={L(0.55)}>
          <rect x="-200" y="1140" width="1480" height="120" fill="#8A5A40" />
          <Cactus id="gs" x={980} y={1180} s={0.32} />
          <Cactus id="gs" x={60} y={1170} s={0.26} flip />
          <Smoke id="gs-cdust" t={t} x={lerp(-300, 150, car) - 120} y={1190} color="#C8906A" n={5} rise={80} wind={-200} r0={30} r1={90} speed={0.6} opacity={0.6 * (1 - seg(t, tCar, tCar + 1.2))} />
          <g transform={`translate(${lerp(-520, -60, car)} 0)`}>
            <Ombra id="gs" x={190} y={1212} rx={210} ry={18} />
            <path d="M10 1206 V1160 Q10 1144 30 1142 L90 1138 L130 1098 Q140 1090 160 1090 H270 Q286 1090 296 1100 L330 1138 L370 1142 Q384 1146 384 1162 V1206 Z" fill="url(#gs-car)" stroke={K} strokeWidth="6" />
            <path d="M140 1100 L120 1134 H200 V1100 Z M214 1100 V1134 H316 L290 1104 Z" fill="#2A3040" stroke={K} strokeWidth="4" />
            <path d="M16 1166 H380" stroke="#8A6A6E" strokeWidth="4" opacity=".7" />
            <rect x="366" y="1152" width="16" height="12" fill="#FFE8B0" />
            {[90, 300].map((wx) => <circle key={wx} cx={wx} cy={1206} r="26" fill="#0E0A0A" stroke={K} strokeWidth="5" />)}
          </g>
        </g>

        {/* PIANO 3 — il camper: luce del fornello, fumo della cucina, poi il gas (0,7) */}
        <g transform={L(0.7, shake)}>
          <path d="M-200 1240 H1280 V2200 H-200 Z" fill="url(#gs-sand)" />
          <g opacity={cook * (1 - gas * 0.4)}>
            <Smoke id="gs-cook" t={t} x={575 - 165 * 0.9} y={1240 - 520 * 0.9} color="#F4F2EC" n={6} rise={140} wind={120} r0={26} r1={80} speed={0.4} opacity={0.8} />
          </g>
          <g opacity={gas}>
            <Smoke id="gs-gas1" t={t} x={575 - 165 * 0.9} y={1240 - 520 * 0.9} color="#E8A090" n={8} rise={170} wind={180} r0={40} r1={130} speed={0.5} opacity={1} />
          </g>
          <Camper id="gs" x={530} y={1240} s={0.84} door={door} lamp={lamp} fog={gas} fogColor="#E89A86" t={t} />
          {/* gas che filtra dalle fessure della porta e dai finestrini */}
          {gas > 0 && [[575 - 10 * 0.9, 1240 - 270], [575 + 110 * 0.9, 1240 - 200], [575 - 270 * 0.9, 1240 - 340], [575 + 210 * 0.9, 1240 - 340], [575 + 400 * 0.9, 1240 - 330]].map(([gx, gy], i) => (
            <g key={i}>
              {[0, 1, 2].map((k) => {
                const p = mod(t * 0.45 + k / 3 + i * 0.2, 1);
                return <circle key={k} cx={gx + (i % 2 ? 1 : -1) * p * 70} cy={gy - p * 60} r={30 + p * 80} fill="url(#gs-gas)" opacity={gas * (1 - p)} />;
              })}
            </g>
          ))}
          <Glow id="gs-lamp" x={575 - 150} y={1240 - 380} r={300} t={t} color="#FFC878" amp={0.05} rate={6} opacity={0.35 * lamp * (1 - gas * 0.5)} />
        </g>

        {/* PIANO 4 — maschera antigas e fornello da campeggio davanti al gradino (0,95) */}
        <g transform={L(0.95)}>
          {/* fornello da campeggio */}
          <g transform="translate(470 1330)">
            <Ombra id="gs" x={0} y={0} rx={90} ry={12} />
            <rect x="-70" y="-50" width="140" height="50" rx="6" fill="#3A5A8A" stroke={K} strokeWidth="6" />
            <circle cx="-30" cy="-50" r="20" fill="#2A2A2A" stroke={K} strokeWidth="4" />
            <circle cx="30" cy="-50" r="20" fill="#2A2A2A" stroke={K} strokeWidth="4" />
            <rect x="50" y="-36" width="12" height="20" rx="3" fill="url(#gs-metal)" />
          </g>
          {/* maschera antigas */}
          {t > tSlam && (
            <g transform={`translate(${lerp(595, 655, maskFall)} ${maskY}) rotate(${lerp(-30, 12, maskFall)})`}>
              <Ombra id="gs" x={0} y={6} rx={80} ry={10} opacity={maskFall} />
              <Glow id="gs-mg" x={0} y={-40} r={110} t={t} color={ORO} amp={0.06} rate={3} opacity={0.35 * gas} />
              <path d="M-60 -10 Q-70 -70 -30 -90 Q0 -100 30 -90 Q70 -70 60 -10 Q30 10 0 10 Q-30 10 -60 -10 Z" fill="#2A2E2A" stroke={K} strokeWidth="6" />
              <circle cx="-26" cy="-56" r="18" fill="#6A8A94" stroke={K} strokeWidth="5" />
              <circle cx="26" cy="-56" r="18" fill="#6A8A94" stroke={K} strokeWidth="5" />
              <path d="M-34 -64 l10 -6 M18 -64 l10 -6" stroke="#FFFFFF" strokeWidth="4" opacity=".5" />
              <rect x="-24" y="-20" width="48" height="40" rx="10" fill={ORO} stroke={K} strokeWidth="5" />
              {[-12, 0, 12].map((x) => <path key={x} d={`M${x} -12 V12`} stroke={K} strokeWidth="3" />)}
              <path d="M-60 -50 Q-90 -40 -84 -10" stroke="#1A1A1A" strokeWidth="6" fill="none" />
            </g>
          )}
        </g>

        {/* PIANO 5 — rocce e cespugli in primo piano (1,25) */}
        <g transform={L(1.25)}>
          <path d="M-200 1960 L-200 1700 Q-60 1640 80 1700 Q200 1740 260 1960 Z" fill="#5A3428" stroke={K} strokeWidth="10" />
          <path d="M-160 1700 Q-40 1660 60 1700" stroke="#C8805A" strokeWidth="6" fill="none" opacity=".7" />
          <Cespuglio x={980} y={1880} s={1.4} seed={9} color="#6A6A3A" />
          <Cespuglio x={430} y={1900} s={1.0} seed={4} color="#5A5A32" />
          {STONES.map((p, i) => <ellipse key={i} cx={p.x} cy={p.y} rx={p.r * 1.6} ry={p.r} fill="#3A2418" opacity=".6" />)}
        </g>

        {/* PIANO 6 — gas e polvere vicini alla camera (1,5–1,8) */}
        <g transform={L(1.5)}>
          {STONES.slice(0, 14).map((p, i) => {
            const x = mod(p.x + t * (40 + i * 4), 1480) - 200;
            return <circle key={i} cx={x} cy={800 + (p.y - 1260) * 0.8} r={p.r * 0.45} fill="#F2C8A0" opacity=".5" />;
          })}
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="gs-near" t={t} color="#F2C0B0" n={7} r0={70} r1={170} opacity={0.08 + 0.1 * gas} vx={30} />
        </g>
      </g>
      <Finish id="gs" tint="#8A3A3A" tintOpacity={0.1} />
    </svg>
  );
};
