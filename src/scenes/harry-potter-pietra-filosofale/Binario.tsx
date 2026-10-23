import React from 'react';
import { camera, eio, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Glow, NearMotes, Smoke } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K, Owl } from './Comuni';

// Il binario nove e tre quarti: stazione di Londra, una colonna di mattoni con il cartello del binario; un carrello con
// baule e gabbia con il gufo bianco che entra nel muro come in uno specchio d'acqua; poi il muro svanisce e dietro,
// fermo sui binari, c'è il treno rosso a vapore.
// Piani: tettoia ad archi in ferro e vetro (0,2) · treno sui binari (0,4) · colonna di mattoni (0,6) · marciapiede e
// carrello (0,8) · bauli e lampioni in primo piano (1,2) · vapore (1,6)

const r = rng(934);
const BRICKS = Array.from({ length: 140 }, () => ({ c: r() }));
/** Punto del muro in cui entra il carrello: centro dell'increspatura. */
const PX = 540, PY = 1150;

/** Locomotiva e due carrozze, ruote sul binario a y 0. */
const Train: React.FC<{ t: number; accent: string }> = ({ t, accent }) => (
  <g>
    {/* carrozze */}
    {[0, 300].map((x0) => (
      <g key={x0} transform={`translate(${x0 - 560} 0)`}>
        <rect x="0" y="-250" width="290" height="200" rx="14" fill="url(#bn-red)" stroke={K} strokeWidth="8" />
        <path d="M-6 -262 Q145 -300 296 -262 V-250 H-6 Z" fill="#3A1A1A" stroke={K} strokeWidth="6" />
        {[22, 112, 202].map((x) => <rect key={x} x={x} y="-220" width="66" height="62" rx="8" fill="#FFE2A0" stroke={K} strokeWidth="5" opacity={0.75 + 0.25 * Math.sin(t * 2 + x + x0)} />)}
        <path d="M0 -140 H290" stroke={accent} strokeWidth="6" />
        <rect x="10" y="-50" width="270" height="22" fill="#2A2A2A" stroke={K} strokeWidth="5" />
        {[60, 230].map((x) => (
          <g key={x}>
            <circle cx={x} cy="-22" r="22" fill="#1A1A1A" stroke={K} strokeWidth="6" />
            <circle cx={x} cy="-22" r="6" fill="#8A8A8A" />
          </g>
        ))}
        <rect x="290" y="-90" width="12" height="16" fill="#2A2A2A" stroke={K} strokeWidth="4" />
      </g>
    ))}
    {/* locomotiva: cabina, caldaia cilindrica, fumaiolo, ruote motrici con biella */}
    <g transform="translate(40 0)">
      <rect x="0" y="-270" width="150" height="220" rx="10" fill="url(#bn-red)" stroke={K} strokeWidth="8" />
      <path d="M-10 -280 H160 V-266 H-10 Z" fill="#2A1A1A" stroke={K} strokeWidth="6" />
      <rect x="30" y="-240" width="90" height="70" rx="8" fill="#FFE2A0" stroke={K} strokeWidth="5" opacity={0.85} />
      <rect x="150" y="-190" width="300" height="130" rx="62" fill="url(#bn-red)" stroke={K} strokeWidth="8" />
      {[230, 320, 400].map((x) => <path key={x} d={`M${x} -188 V-62`} stroke={accent} strokeWidth="5" />)}
      <rect x="440" y="-200" width="34" height="150" rx="8" fill="#2A2A2A" stroke={K} strokeWidth="6" />
      <path d="M380 -190 V-280 H430 V-190" fill="#2A1A1A" stroke={K} strokeWidth="7" />
      <path d="M370 -290 H440 V-276 H370 Z" fill="#2A1A1A" stroke={K} strokeWidth="6" />
      <path d="M258 -190 Q270 -232 282 -190 Z" fill={accent} stroke={K} strokeWidth="5" />
      <path d="M474 -60 L520 -20 H474 Z" fill="#3A3A3A" stroke={K} strokeWidth="6" />
      <rect x="0" y="-56" width="474" height="20" fill="#2A2A2A" stroke={K} strokeWidth="5" />
      {[200, 300, 400].map((x) => {
        const a = t * 1.2;
        return (
          <g key={x}>
            <circle cx={x} cy="-42" r="42" fill="#7A1418" stroke={K} strokeWidth="7" />
            {[0, 1, 2, 3].map((k) => <path key={k} d={`M${x} -42 L${x + 36 * Math.cos(a + k * 0.785)} ${-42 + 36 * Math.sin(a + k * 0.785)}`} stroke={K} strokeWidth="4" />)}
          </g>
        );
      })}
      <circle cx="70" cy="-26" r="26" fill="#1A1A1A" stroke={K} strokeWidth="6" />
      <path d={`M${200 + 24 * Math.cos(t * 1.2)} ${-42 + 24 * Math.sin(t * 1.2)} H${400 + 24 * Math.cos(t * 1.2)}`} stroke="#C9C9C9" strokeWidth="8" strokeLinecap="round" />
    </g>
  </g>
);

export const Binario: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const push = eio(seg(t, cues[1], cues[1] + 1.8)); // «attraversa un muro»
  const ripple = seg(t, cues[1] + 0.6, cues[1] + 2.4);
  const train = eio(seg(t, cues[2] - 0.4, cues[2] + 1.2)); // il muro svanisce e appare il treno
  const steam = 0.3 + 0.7 * train;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="bn" />
        <Lin id="bn-roof" stops={[[0, '#3A3A48'], [0.5, '#6A6A78'], [1, '#A8A8B0']]} />
        <Lin id="bn-glass" stops={[[0, '#C8D4D8'], [1, '#8A9AA4']]} />
        <Lin id="bn-red" x2={1} y2={0} stops={[[0, '#8A1A20'], [0.5, '#C02A30'], [1, '#7A1418']]} />
        <Lin id="bn-floor" stops={[[0, '#9A9488'], [1, '#4A4640']]} />
      </defs>
      <g transform={cam.transform}>
        {/* tettoia: grandi archi pieni in ferro con le vetrate, nel piano lontano */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#bn-roof)" />
          {[-120, 540, 1200].map((cx) => (
            <g key={cx}>
              <path d={`M${cx - 330} 1150 V700 A330 330 0 0 1 ${cx + 330} 700 V1150`} fill="url(#bn-glass)" stroke="#2A2A36" strokeWidth="26" opacity={0.9} />
              {[-220, -110, 0, 110, 220].map((dx) => <path key={dx} d={`M${cx + dx} 1150 V${700 - Math.sqrt(330 ** 2 - dx ** 2)}`} stroke="#3A3A48" strokeWidth="6" />)}
              {[780, 880, 980, 1080].map((y) => <path key={y} d={`M${cx - 330} ${y} H${cx + 330}`} stroke="#3A3A48" strokeWidth="5" />)}
            </g>
          ))}
          {/* travatura scura del tetto dietro il titolo: le vetrate cominciano sotto */}
          <path d="M-200 -200 H1280 V610 H-200 Z" fill="#2E2E3A" />
          <path d="M-200 610 H1280" stroke="#14141C" strokeWidth="18" />
          {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={-160 + i * 100} cy={610} r="5" fill="#6A6A78" />)}
          <Beam id="bn-sky" x={880} y={640} t={t} length={800} spread={420} color="#F4F0E0" angle={110} opacity={0.16} />
          <path d="M-200 1150 H1280 V1300 H-200 Z" fill="#4A4A56" />
        </g>
        {/* il treno rosso a vapore, fermo sui binari dietro il muro: compare quando il muro svanisce */}
        <g transform={L(0.4)} opacity={train}>
          <path d="M-200 1262 H1280" stroke="#5A5048" strokeWidth="10" />
          {Array.from({ length: 24 }, (_, i) => <rect key={i} x={-200 + i * 64} y="1262" width="34" height="14" fill="#3A2E26" />)}
          <path d="M-200 1270 H1280" stroke="#B8B8C0" strokeWidth="5" />
          <g transform="translate(420 1262)"><Train t={t} accent={P.accento} /></g>
          <Smoke id="bn-smoke" t={t} x={865} y={1262 - 300} color="#F4F0E8" n={9} rise={420} wind={-260} r0={30} r1={130} speed={0.35} opacity={0.8 * steam} />
        </g>
        {/* colonna di mattoni con il cartello del binario (accento): svanisce del tutto prima che compaia il treno */}
        <g transform={L(0.6, 0, 70)} opacity={1 - train}>
          <rect x="300" y="560" width="480" height="740" fill="#9A4A34" stroke={K} strokeWidth="10" />
          {BRICKS.map((b, i) => {
            const row = Math.floor(i / 7), col = i % 7;
            const x = 300 + col * 70 + (row % 2) * 35 - 35, y = 560 + row * 36;
            const wob = ripple > 0 && ripple < 1 ? Math.sin((Math.hypot(x - PX, y - PY) / 40) - ripple * 20) * 6 * (1 - ripple) : 0;
            return y < 1290 && x > 270 && x < 780 ? <rect key={i} x={Math.max(300, x)} y={y + wob} width={Math.min(66, 780 - x)} height="32" fill={b.c > 0.5 ? '#A8563E' : '#8A3E2C'} stroke="#5A2A1E" strokeWidth="3" /> : null;
          })}
          <g transform="translate(540 700)">
            <rect x="-110" y="-46" width="220" height="92" rx="10" fill="#1E2A4A" stroke={K} strokeWidth="7" />
            <text x="0" y="24" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="64" fill={P.accento}>9 ¾</text>
          </g>
          {ripple > 0 && ripple < 1 && [0, 1, 2].map((k) => {
            const p = seg(ripple, k * 0.15, 0.6 + k * 0.15);
            return <ellipse key={k} cx={PX} cy={PY} rx={40 + 240 * p} ry={60 + 300 * p} fill="none" stroke="#F4E8D0" strokeWidth="5" opacity={(1 - p) * 0.8} />;
          })}
        </g>
        {/* marciapiede con le piastrelle in prospettiva; il carrello con baule e gabbia del gufo che entra nel muro */}
        <g transform={L(0.8)}>
          <path d="M-200 1290 H1280 V2200 H-200 Z" fill="url(#bn-floor)" />
          {[1340, 1410, 1500, 1610].map((y) => <path key={y} d={`M-200 ${y} H1280`} stroke="#5A5650" strokeWidth="3" opacity=".6" />)}
          {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M${540 + (i - 5) * 90} 1290 L${540 + (i - 5) * 300} 2000`} stroke="#5A5650" strokeWidth="3" opacity=".5" />)}
          <g transform={`translate(${200 + (PX - 200) * push} ${1220 - (1220 - PY - 40) * push}) scale(${1 - 0.3 * push})`} opacity={1 - seg(push, 0.7, 1)}>
            <path d="M-160 80 H160 L190 -40" stroke={K} strokeWidth="12" fill="none" strokeLinecap="round" />
            <path d="M-160 80 L-200 -60" stroke={K} strokeWidth="12" strokeLinecap="round" />
            <circle cx="-110" cy="110" r="24" fill="#2A2A2A" stroke={K} strokeWidth="6" /><circle cx="110" cy="110" r="24" fill="#2A2A2A" stroke={K} strokeWidth="6" />
            <rect x="-150" y="-30" width="280" height="110" rx="8" fill="#6A3A20" stroke={K} strokeWidth="8" />
            <path d="M-150 10 H130 M-60 -30 V80 M40 -30 V80" stroke="#C9A060" strokeWidth="6" />
            <g transform="translate(-20 -110)">
              <path d="M-60 80 V-20 Q0 -90 60 -20 V80 Z" fill="none" stroke="#C9A24A" strokeWidth="6" />
              {[-40, -20, 0, 20, 40].map((x) => <path key={x} d={`M${x} 80 V${-30 - (20 - Math.abs(x)) * 0.8}`} stroke="#C9A24A" strokeWidth="3" />)}
              <Owl x={0} y={30} s={0.55} t={t} />
            </g>
          </g>
        </g>
        {/* primo piano: bordo giallo del marciapiede, pila di bauli e valigie, lampioni */}
        <g transform={L(1.2)}>
          <path d="M-200 1700 H1280 V1740 H-200 Z" fill="#E8D8A0" stroke={K} strokeWidth="6" />
          <g transform="translate(860 1980)">
            <rect x="-200" y="-200" width="360" height="200" rx="12" fill="#5A3420" stroke={K} strokeWidth="9" />
            <path d="M-200 -130 H160 M-80 -200 V0 M40 -200 V0" stroke="#C9A060" strokeWidth="8" />
            <rect x="-150" y="-330" width="260" height="130" rx="12" fill="#2A3A5A" stroke={K} strokeWidth="8" />
            <path d="M-60 -350 Q-20 -380 20 -350" fill="none" stroke={K} strokeWidth="8" />
            <rect x="-100" y="-420" width="160" height="90" rx="10" fill="#7A2A20" stroke={K} strokeWidth="7" />
            <path d="M-100 -380 H60" stroke={P.accento} strokeWidth="5" />
          </g>
          {[-60, 1140].map((x, i) => (
            <g key={x}>
              <path d={`M${x} 1700 V900`} stroke={K} strokeWidth="22" />
              <path d={`M${x - 40} 900 H${x + 40} L${x + 30} 840 H${x - 30} Z`} fill="#2A2A2A" stroke={K} strokeWidth="6" />
              <Glow id={`bn-lamp${i}`} x={x} y={880} r={160} t={t} color="#FFE2A0" amp={0.05} rate={2} opacity={0.7} />
            </g>
          ))}
        </g>
        <g transform={L(1.6)}>
          {Array.from({ length: 6 }, (_, i) => {
            const p = mod(t * 0.12 + i / 6, 1);
            return <circle key={i} cx={-100 + p * 1300} cy={1500 - i * 60} r={80 + 40 * Math.sin(i)} fill="#F4F0E8" opacity={0.1 * steam} />;
          })}
          <NearMotes id="bn-near" t={t} color="#F4F0E8" n={5} y0={1300} opacity={0.08} />
        </g>
      </g>
      <Finish id="bn" tint="#E8B04A" tintOpacity={0.07} />
    </svg>
  );
};
