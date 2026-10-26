import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Fog, Glow, Gulls, NearMotes, Reflection, WaveLines } from '../../lib/elements';
import type { SceneProps } from '../../types';

// Il muro: mare calmo all'alba; la prua della barca ha bucato il cielo, che è un muro dipinto a pannelli;
// una scaletta sale lungo il muro fino a una porta con la scritta "USCITA".
// Piani: muro dipinto con giunture, scala e porta (0,4) · gabbiani veri e foschia (0,5) · acqua calma (0,6)
//        · buco, crepe e barca vista da poppa (0,8) · relitti in primo piano (1,25) · foschia vicina (1,7)

const K = '#142235';
const HIT = 1.6; // «La prua urta qualcosa»
const STAIRS_AT = 5.06; // «Lungo il muro, una scala»
const DOOR_AT = 6.73; // «e una porta: uscita»
const VOICE_AT = 8.18; // «Una voce dal cielo gli chiede di restare»
const WALL_BASE = 1090;
const BX = 450; // poppa della barca
const BOW = { x: 120, y: -200 }; // prua, in coordinate della barca (vista di tre quarti da poppa)
const C = { x: BX + BOW.x, y: 1036 }; // punto d'impatto della prua
const DOOR = { x: 690, y: 640, w: 130, h: 200 };

const CRACKS = [
  'M0 0 L-40 -36 L-62 -96 L-110 -130',
  'M0 0 L36 -44 L52 -110 L86 -150',
  'M0 0 L60 -10 L120 -40 L170 -36',
  'M0 0 L-58 6 L-120 -12 L-180 4',
  'M-62 -96 L-30 -140',
  'M52 -110 L96 -112',
];
const chipR = rng(303);
const CHIPS = Array.from({ length: 9 }, () => ({ dx: (chipR() - 0.5) * 120, dy: -chipR() * 60, s: 6 + chipR() * 10, rot: chipR() * 360 }));
const glintR = rng(77);
const GLINTS = Array.from({ length: 16 }, () => ({ x: glintR() * 1080, y: 1120 + glintR() * 560, ph: glintR() * 6 }));

/** Nuvola dipinta: troppo regolare, piatta, con l'ombra disegnata sotto. */
const PaintedCloud: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-120 20 Q-130 -20 -90 -24 Q-80 -66 -30 -60 Q0 -96 44 -66 Q96 -74 100 -26 Q136 -20 126 20 Z" fill="#FFFFFF" opacity=".92" />
    <path d="M-120 20 H126 Q120 30 100 32 H-104 Q-118 30 -120 20 Z" fill="#CFE6F4" />
  </g>
);

export const Muro: React.FC<SceneProps> = ({ t, dur, palette: P }) => {
  const cam = camera(t, dur);
  const L = cam.layer;

  // la barca avanza verso il muro, urta, rimbalza appena
  const approach = eo(seg(t, 0, HIT));
  const knock = t > HIT ? Math.sin((t - HIT) * 14) * 8 * (1 - seg(t, HIT, HIT + 1)) : 0;
  const boatS = lerp(1.07, 1, approach);
  const boatY = lerp(1270, 1236, approach) + Math.sin(t * 1.3) * 4;
  const crack = eo(seg(t, HIT, HIT + 0.5));
  const hole = 1.3 * eob(seg(t, HIT, HIT + 0.3));
  const shake = t > HIT ? Math.sin((t - HIT) * 50) * 4 * (1 - seg(t, HIT, HIT + 0.4)) : 0;

  // scala: la luce sale gradino per gradino; porta: l'insegna si accende, luce dalle fessure
  const stairsGlow = (i: number) => seg(t, STAIRS_AT + (8 - i) * 0.12, STAIRS_AT + (8 - i) * 0.12 + 0.3);
  const sign = t < DOOR_AT ? 0 : t < DOOR_AT + 0.4 ? (Math.sin((t - DOOR_AT) * 40) > 0 ? 1 : 0.2) : 1;
  const leak = seg(t, DOOR_AT, DOOR_AT + 1) * (0.85 + 0.15 * Math.sin(t * 3));
  const voice = seg(t, VOICE_AT, VOICE_AT + 0.4);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="mu" />
        <Lin id="mu-wall" stops={[[0, '#76BEE3'], [0.4, '#9FD6F0'], [0.62, '#CDE8F2'], [0.82, '#F7E4CB'], [1, '#F6CFA6']]} />
        <Lin id="mu-door" stops={[[0, '#A6D8EF'], [1, '#D5EBF2']]} />
        <Lin id="mu-sea" stops={[[0, '#9CD2EA'], [0.25, '#79BCE0'], [0.6, '#4FA3D1'], [1, '#2B6A93']]} />
        <Lin id="mu-hole" stops={[[0, '#04080F'], [1, '#14202F']]} />
        <Lin id="mu-hull" stops={[[0, '#FFFFFF'], [1, '#D8D1BE']]} />
        <Lin id="mu-front" stops={[[0, '#3F86B4'], [1, '#1D4A6B']]} />
        <clipPath id="mu-wallclip"><rect x="-200" y="-200" width="1480" height={WALL_BASE + 200} /></clipPath>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — il cielo è un muro dipinto: gradiente, sole, nuvole e gabbiani dipinti, giunture dei pannelli */}
        <g transform={L(0.4, shake * 0.3)}>
          <rect x="-200" y="-200" width="1480" height={WALL_BASE + 200} fill="url(#mu-wall)" />
          {/* orizzonte dipinto che non combacia col mare vero */}
          <rect x="-200" y="1010" width="1480" height="70" fill="#86C4E2" />
          <path d="M-200 1010 H1280" stroke="#B8E0F2" strokeWidth="4" />
          <Glow id="mu-sun" x={230} y={900} r={260} t={t} color="#FFF1C9" amp={0.04} rate={1} opacity={0.8} />
          <circle cx="230" cy="900" r="66" fill="#FFF0C2" />
          <circle cx="230" cy="900" r="66" fill="none" stroke="#F3D79A" strokeWidth="5" />
          <PaintedCloud x={150} y={700} s={0.9} />
          <PaintedCloud x={560} y={600} s={0.75} />
          <PaintedCloud x={960} y={930} s={0.8} />
          {/* gabbiani dipinti, immobili */}
          <g fill="none" stroke="#5D7F98" strokeWidth="5" strokeLinecap="round" opacity=".75">
            <path d="M360 780 q14 -12 28 0 q14 -12 28 0" />
            <path d="M420 820 q11 -9 22 0 q11 -9 22 0" />
            <path d="M330 836 q9 -8 18 0 q9 -8 18 0" />
          </g>
          {/* giunture dei pannelli: tenui dietro il titolo, nette sotto */}
          <g strokeLinecap="square">
            {[90, 270, 450, 630, 810, 990].map((x) => (
              <g key={x}>
                <path d={`M${x} -200 V540`} stroke="#4C7EA0" strokeWidth="3" opacity=".1" />
                <path d={`M${x} 540 V${WALL_BASE}`} stroke="#4C7EA0" strokeWidth="3" opacity=".4" />
                <path d={`M${x + 3} 540 V${WALL_BASE}`} stroke="#FFFFFF" strokeWidth="2" opacity=".35" />
              </g>
            ))}
            {[300].map((y) => <path key={y} d={`M-200 ${y} H1280`} stroke="#4C7EA0" strokeWidth="3" opacity=".1" />)}
            {[560, 820].map((y) => (
              <g key={y}>
                <path d={`M-200 ${y} H1280`} stroke="#4C7EA0" strokeWidth="3" opacity=".4" />
                <path d={`M-200 ${y + 3} H1280`} stroke="#FFFFFF" strokeWidth="2" opacity=".35" />
              </g>
            ))}
            {[90, 270, 450, 630, 810, 990].flatMap((x) => [560, 820].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="#6C93AE" opacity=".6" />))}
          </g>
          {/* piede del muro: cemento, alghe, macchie d'acqua */}
          <rect x="-200" y={WALL_BASE - 26} width="1480" height="26" fill="#6F8FA4" />
          <path d={`M-200 ${WALL_BASE - 26} H1280`} stroke={K} strokeWidth="4" opacity=".5" />
          <path d={`M-200 ${WALL_BASE - 30} q40 -14 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0`} fill="none" stroke="#5E8C7C" strokeWidth="6" opacity=".55" />
          {[120, 330, 600, 880].map((x, i) => <path key={i} d={`M${x} ${WALL_BASE - 30} q6 -40 -2 -70`} fill="none" stroke="#7FA2B4" strokeWidth="6" strokeLinecap="round" opacity=".35" />)}

          {/* altoparlante nascosto nel cielo: la voce chiede di restare */}
          <g transform="translate(965 610)">
            <circle r="34" fill="#9FCBE2" stroke="#5F87A3" strokeWidth="4" />
            {[-16, -6, 4, 14].map((y) => <path key={y} d={`M-22 ${y} H22`} stroke="#5F87A3" strokeWidth="4" strokeLinecap="round" />)}
            {[0, 1, 2].map((k) => {
              const p = mod((t - VOICE_AT) * 0.7 + k / 3, 1);
              return <path key={k} d={`M${-50 - p * 120} ${-40 - p * 60} A${60 + p * 130} ${60 + p * 130} 0 0 0 ${-50 - p * 120} ${40 + p * 60}`} fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity={voice * (1 - p) * 0.9} />;
            })}
          </g>

          {/* scaletta in rilievo con le sue ombre sul muro */}
          <path d="M858 842 L1050 1068" stroke="#5E8AA6" strokeWidth="14" opacity=".35" />
          {Array.from({ length: 8 }, (_, i) => {
            const x = 830 + i * 26, y = 840 + (i + 1) * 28;
            const g = stairsGlow(i);
            return (
              <g key={i}>
                <path d={`M${x + 8} ${y + 12} h74 l10 12 h-74 Z`} fill="#4F7A97" opacity=".35" />
                <rect x={x} y={y - 4} width="74" height="16" rx="3" fill={g > 0 ? '#FFF3DD' : '#E7E1D2'} stroke={K} strokeWidth="5" />
                {g > 0 && <rect x={x + 6} y={y - 1} width="62" height="5" rx="2" fill="#FFFFFF" opacity={g} />}
              </g>
            );
          })}
          <path d="M836 790 L1060 1060" stroke={K} strokeWidth="6" strokeLinecap="round" />
          <path d="M836 790 V842" stroke={K} strokeWidth="6" strokeLinecap="round" />
          {/* pianerottolo davanti alla porta */}
          <rect x={DOOR.x - 14} y={DOOR.y + DOOR.h} width={DOOR.w + 160} height="16" rx="3" fill="#E7E1D2" stroke={K} strokeWidth="5" />

          {/* porta dipinta come il cielo, tradita dal contorno e dalla luce che filtra */}
          <Glow id="mu-leak" x={DOOR.x + DOOR.w / 2} y={DOOR.y + DOOR.h / 2} r={190} t={t} color={P.accento} amp={0.05} rate={2} opacity={0.5 * leak} />
          <rect x={DOOR.x} y={DOOR.y} width={DOOR.w} height={DOOR.h} fill="url(#mu-door)" stroke={K} strokeWidth="7" />
          <rect x={DOOR.x - 3} y={DOOR.y - 3} width={DOOR.w + 6} height={DOOR.h + 6} fill="none" stroke={P.accento} strokeWidth="4" opacity={leak} />
          <path d={`M${DOOR.x + 16} ${DOOR.y + 70} q40 -30 80 -6`} fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" opacity=".6" />
          <circle cx={DOOR.x + DOOR.w - 22} cy={DOOR.y + 108} r="9" fill={K} />
          {/* insegna USCITA */}
          <Glow id="mu-sign" x={DOOR.x + DOOR.w / 2} y={DOOR.y - 34} r={130} t={t} color={P.accento} amp={0.04} rate={3} opacity={0.6 * sign} />
          <rect x={DOOR.x - 6} y={DOOR.y - 60} width={DOOR.w + 12} height="46" rx="6" fill={K} />
          <text x={DOOR.x + DOOR.w / 2} y={DOOR.y - 25} textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="32" letterSpacing="3" fill={sign > 0 ? P.accento : '#4A5D72'} opacity={0.4 + 0.6 * Math.max(sign, 0)}>USCITA</text>
        </g>

        {/* PIANO 1 — gabbiani veri che volano davanti a quelli dipinti, foschia bassa */}
        <g transform={L(0.5)}>
          <Gulls t={t} seed={8} n={3} y={880} h={110} color={K} size={0.9} period={11} />
          <Fog id="mu-fog1" t={t} y={WALL_BASE + 6} color="#FFF4E4" rx={820} ry={60} opacity={0.6} speed={0.25} />
        </g>

        {/* PIANO 2 — acqua calma con riflessi */}
        <g transform={L(0.6)}>
          <rect x="-200" y={WALL_BASE} width="1480" height="1000" fill="url(#mu-sea)" />
          <rect x="-200" y={WALL_BASE} width="1480" height="40" fill="#F6E1C6" opacity=".35" />
          <Reflection t={t} x={230} y={WALL_BASE + 18} color="#FFF0C2" n={9} w={120} gap={24} opacity={0.75} />
          <Reflection t={t + 1} x={755} y={WALL_BASE + 18} color={P.accento} n={7} w={80} gap={24} opacity={0.5 * leak} />
          <WaveLines t={t} ys={[1140, 1210, 1310, 1440, 1600]} color="#E8F6FC" amp={6} w={260} speed={22} width={4} opacity={0.5} />
          {GLINTS.map((g, i) => <circle key={i} cx={g.x} cy={g.y} r="4" fill="#FFFFFF" opacity={Math.max(0, Math.sin(t * 2.4 + g.ph)) * 0.8} />)}
        </g>

        {/* PIANO 3 — buco nel cielo, crepe, schegge, e la barca vista da poppa */}
        <g transform={L(0.8)}>
          <g clipPath="url(#mu-wallclip)">
            <g transform={`translate(${C.x} ${C.y}) scale(1.35)`}>
              <path d={`M${-44 * hole} ${10 * hole} L${-30 * hole} ${-34 * hole} L${4 * hole} ${-50 * hole} L${40 * hole} ${-30 * hole} L${50 * hole} ${6 * hole} L${20 * hole} ${30 * hole} L${-24 * hole} ${28 * hole} Z`} fill="url(#mu-hole)" stroke={K} strokeWidth="5" strokeLinejoin="round" />
              {CRACKS.map((d, i) => (
                <g key={i}>
                  <path d={d} fill="none" stroke="#FFFFFF" strokeWidth="11" strokeLinejoin="round" opacity=".6" pathLength={1} strokeDasharray={`${crack} 1`} transform="translate(2 2)" />
                  <path d={d} fill="none" stroke={K} strokeWidth="7" strokeLinejoin="round" pathLength={1} strokeDasharray={`${crack} 1`} />
                </g>
              ))}
            </g>
          </g>
          {/* schegge di pannello che cadono in acqua */}
          {t > HIT && CHIPS.map((c, i) => {
            const p = seg(t, HIT, HIT + 0.9 + i * 0.05);
            const y = C.y + c.dy * p + 260 * p * p;
            return p < 1 && y < WALL_BASE + 30 ? (
              <rect key={i} x={-c.s / 2} y={-c.s / 2} width={c.s} height={c.s * 0.7} fill="#A8D8EE" stroke={K} strokeWidth="2" transform={`translate(${C.x + c.dx * p} ${y}) rotate(${c.rot + p * 300})`} />
            ) : null;
          })}
          {t > HIT + 0.5 && [0, 1].map((k) => {
            const p = seg(t, HIT + 0.5 + k * 0.4, HIT + 2 + k * 0.4);
            return <ellipse key={k} cx={C.x + (k ? 40 : -30)} cy={WALL_BASE + 16} rx={10 + p * 90} ry={2 + p * 14} fill="none" stroke="#FFFFFF" strokeWidth="3" opacity={(1 - p) * 0.8} />;
          })}

          {/* barca da poppa: la prua ha bucato il cielo */}
          <g transform={`translate(${BX} ${boatY + knock * 0.3}) scale(${boatS}) rotate(${Math.sin(t * 1.1) * 1.5})`} strokeLinejoin="round" strokeLinecap="round">
            <ellipse cx="20" cy="66" rx="200" ry="18" fill="#2B6A93" opacity=".35" />
            {/* sartiame e strallo verso la prua (fiocco ammainato) */}
            <path d="M20 -590 L-148 -60 M20 -590 L148 -60" stroke={K} strokeWidth="3" opacity=".8" />
            <path d={`M20 -590 L${BOW.x} ${BOW.y + 6}`} stroke={K} strokeWidth="4" />
            {/* randa (accento) gonfia verso sinistra */}
            <path d="M14 -585 Q-110 -380 -140 -140 L14 -126 Z" fill={P.accento} stroke={K} strokeWidth="7" />
            <path d="M-4 -500 Q-80 -360 -100 -170" fill="none" stroke="#FFC48E" strokeWidth="5" opacity=".7" />
            <path d="M14 -126 L-150 -142" stroke={K} strokeWidth="8" />
            <path d="M20 -70 V-590" stroke={K} strokeWidth="10" />
            {/* coperta che converge verso la prua, infilata nel buco del cielo */}
            <path d={`M-150 -60 L${BOW.x - 22} ${BOW.y + 8} Q${BOW.x} ${BOW.y - 4} ${BOW.x + 10} ${BOW.y + 12} L150 -60 Z`} fill="#E7D5B4" stroke={K} strokeWidth="6" />
            <path d={`M-90 -74 L${BOW.x - 14} ${BOW.y + 16} M100 -76 L${BOW.x + 2} ${BOW.y + 20}`} fill="none" stroke="#C4AE88" strokeWidth="3" />
            <path d="M-70 -66 L-60 -112 H60 L70 -66 Z" fill="#F0E8D6" stroke={K} strokeWidth="5" />
            <rect x="-30" y="-104" width="60" height="22" rx="6" fill="#8FD3F4" stroke={K} strokeWidth="4" />
            {/* specchio di poppa con il nome */}
            <path d="M-156 -62 H156 Q148 38 0 72 Q-148 38 -156 -62 Z" fill="url(#mu-hull)" stroke={K} strokeWidth="8" />
            <path d="M-150 -30 H150" stroke="#4FA3D1" strokeWidth="9" />
            <text x="0" y="14" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="34" letterSpacing="2" fill={K}>SANTA MARIA</text>
            <text x="0" y="42" textAnchor="middle" fontFamily="Figtree" fontWeight={700} fontSize="18" letterSpacing="4" fill="#5E7489">SEAHAVEN</text>
          </g>
          {/* l'acqua copre il terzo basso dello scafo: la barca galleggia, non sta sopra il mare */}
          <path d={`M-200 ${boatY + 30} Q${BX - 200} ${boatY + 20 + Math.sin(t * 1.6) * 4} ${BX} ${boatY + 18} T1280 ${boatY + 30} V2100 H-200 Z`} fill="#5AA9D3" />
          <path d={`M${BX - 200} ${boatY + 24} Q${BX} ${boatY + 12} ${BX + 200} ${boatY + 24}`} fill="none" stroke="#FFFFFF" strokeWidth="5" opacity=".7" />
          <WaveLines t={t} ys={[C.y + 210]} color="#FFFFFF" amp={4} w={140} speed={14} width={5} opacity={0.6} />
        </g>

        {/* PIANO 4 — relitti della tempesta che galleggiano ai bordi */}
        <g transform={L(1.25)}>
          <rect x="-200" y="1690" width="1480" height="400" fill="url(#mu-front)" opacity=".6" />
          <WaveLines t={t} ys={[1700, 1790]} color="#DDF1FA" amp={10} w={340} speed={30} width={6} opacity={0.5} />
          <g transform={`translate(${-40 + Math.sin(t * 0.8) * 10} ${1610 + Math.sin(t * 1.4) * 8}) rotate(${-8 + Math.sin(t) * 2})`}>
            <rect x="0" y="0" width="320" height="46" rx="8" fill="#C79A6B" stroke={K} strokeWidth="8" />
            <path d="M20 16 H290 M40 32 H200" stroke="#8E6440" strokeWidth="4" />
            <circle cx="270" cy="23" r="6" fill={K} />
          </g>
          <g transform={`translate(${990 + Math.sin(t * 0.9 + 2) * 10} ${1700 + Math.sin(t * 1.6 + 1) * 10})`}>
            <ellipse cx="0" cy="0" rx="110" ry="40" fill="#A8D8EE" stroke={K} strokeWidth="8" />
            <path d="M-60 -10 q40 -16 90 0" fill="none" stroke="#FFFFFF" strokeWidth="6" opacity=".7" />
            <path d="M-100 20 L-40 30 L-70 -20" fill="none" stroke="#4C7EA0" strokeWidth="4" />
          </g>
          <path d={`M-200 1880 q140 -40 320 -10 t360 0`} fill="none" stroke="#E7D5B4" strokeWidth="9" strokeLinecap="round" opacity=".6" />
        </g>

        {/* PIANO 5 — foschia vicina alla camera */}
        <g transform={L(1.7)}>
          <NearMotes id="mu-near" t={t} color="#FFF4E4" n={7} vx={-25} vy={-6} opacity={0.14} y0={900} />
        </g>
      </g>
      <Finish id="mu" tint="#8FD3F4" tintOpacity={0.1} />
    </svg>
  );
};
