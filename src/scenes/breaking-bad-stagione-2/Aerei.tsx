import React from 'react';
import { camera, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Fire, Glow, NearMotes, Smoke, flashAt } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { BBDefs } from '../breaking-bad-stagione-1/Comuni';
import { BB2Defs, K, ROSA } from './Comuni';

// Lo scontro tra due aerei: il cielo azzurro sopra i tetti di Albuquerque. Persone mai: il padre di Jane è la torre di
// controllo all'orizzonte con il radar che gira. Eventi: prima frase la torre di controllo con le vetrate accese e
// l'aereo di linea che attraversa lento il cielo; seconda frase da destra arriva un piccolo aereo, le due rotte si
// incrociano e, un battito dopo la fine della frase, un lampo e una palla di fuoco; terza frase i rottami in fiamme
// piovono sulle case lasciando scie di fumo nero, colonne di fumo si alzano dai tetti e un pezzetto rosa cade fino
// alla piscina di un giardino, con uno spruzzo.
// Piani: cielo (0,2) · montagne e torre di controllo (0,35) · aerei, esplosione e rottami (0,5) · tetti della città
//        (0,62) · giardino con la piscina (0,8) · antenna e lampione in primo piano (1,2) · cenere vicina (1,6)

const r = rng(2210);
const DEBRIS = Array.from({ length: 16 }, () => ({ vx: (r() - 0.5) * 700, vy: -150 - r() * 250, s: 0.5 + r() * 1, rot: (r() - 0.5) * 600, fire: r() > 0.4 }));
const ROOFS = Array.from({ length: 9 }, (_, i) => ({ x: -160 + i * 160 + (r() - 0.5) * 40, w: 150 + r() * 50, h: 70 + r() * 50, c: ['#C88A5A', '#B87A4A', '#D8A070', '#A86A44'][i % 4] }));
const CX = 540, CY = 880; // punto dello scontro

const Aereo: React.FC<{ x: number; y: number; s: number; flip?: boolean; small?: boolean }> = ({ x, y, s, flip, small }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} strokeLinejoin="round">
    {small ? (
      <>
        <path d="M-90 0 Q-90 -16 -60 -18 H60 Q90 -14 96 0 Q90 12 60 14 H-60 Q-90 14 -90 0 Z" fill="#F2F2EC" stroke={K} strokeWidth="5" />
        <path d="M-10 -14 L-30 -70 H-6 L24 -14 Z M-10 12 L-24 40 H-6 L14 12 Z" fill="#E8E8E0" stroke={K} strokeWidth="4" />
        <path d="M-80 -14 L-100 -46 H-82 L-60 -14 Z" fill="#C83A2A" stroke={K} strokeWidth="4" />
        <path d="M-60 2 H60" stroke="#C83A2A" strokeWidth="5" />
        <rect x="40" y="-12" width="30" height="10" rx="4" fill="#3A5A7A" />
        <circle cx="98" cy="0" r={6} fill="#5A5A5A" />
      </>
    ) : (
      <>
        <path d="M-260 0 Q-262 -30 -220 -34 H200 Q260 -30 280 0 Q260 26 200 30 H-220 Q-262 30 -260 0 Z" fill="#F6F6F2" stroke={K} strokeWidth="7" />
        <path d="M-30 -10 L-140 -120 H-90 L60 -10 Z" fill="#E0E0DA" stroke={K} strokeWidth="6" />
        <path d="M-30 14 L-120 110 H-74 L50 14 Z" fill="#E0E0DA" stroke={K} strokeWidth="6" />
        <path d="M-210 -30 L-260 -130 H-220 L-160 -30 Z" fill="#3A6AB8" stroke={K} strokeWidth="6" />
        <path d="M-220 4 H210" stroke="#3A6AB8" strokeWidth="8" />
        {Array.from({ length: 12 }, (_, k) => <circle key={k} cx={-150 + k * 28} cy={-12} r="5" fill="#3A4A5A" />)}
        <path d="M220 -20 Q250 -16 262 -4 H226 Z" fill="#2A3A4A" />
        <ellipse cx="-20" cy="40" rx="44" ry="14" fill="#C8C8C0" stroke={K} strokeWidth="5" />
      </>
    )}
  </g>
);

export const Aerei: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tSmall = griglia(cues[1] + 0.2);
  const tHit = griglia(cues[2] - 0.6);
  const tRain = griglia(cues[2] + 0.2);
  const hit = t >= tHit;
  const fl = flashAt(t, [tHit]);
  const big = eo(seg(t, 0, tHit));
  const small = eo(seg(t, tSmall, tHit));
  const ball = seg(t, tHit, tHit + 1.2);
  const tSplash = griglia(cues[2] + 2.6);
  const pink = seg(t, tRain, tSplash);
  const splash = seg(t, tSplash, tSplash + 0.8);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ae" />
        <BBDefs id="ae" />
        <BB2Defs id="ae" />
        <Lin id="ae-sky" stops={[[0, '#2A6AA8'], [0.35, '#5A9ACB'], [0.58, '#A8D0E8'], [0.66, '#E8E2D0']]} />
        <Lin id="ae-ground" stops={[[0, '#A87A50'], [1, '#5A3E26']]} />
        <Lin id="ae-tower" x2={1} y2={0} stops={[[0, '#D8D4CC'], [1, '#8A867E']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo azzurro, poi il lampo dello scontro (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ae-sky)" />
          {[0, 1, 2].map((k) => <ellipse key={k} cx={mod(80 + k * 420 + t * 6, 1500) - 200} cy={720 + k * 90} rx={180} ry="26" fill="#FFFFFF" opacity=".5" />)}
          <rect x="-200" y="-200" width="1480" height="2400" fill="#FFF2D0" opacity={0.7 * fl} />
        </g>

        {/* PIANO 1 — montagne lontane e torre di controllo con il radar (0,35) */}
        <g transform={`${L(0.35)} translate(0 -90)`}>
          <path d="M-200 1120 L0 1010 L200 1060 L420 980 L640 1050 L860 990 L1080 1040 L1280 1000 V1180 H-200 Z" fill="#7A8AA8" />
          <g transform="translate(930 1150)">
            <path d="M-26 0 L-18 -260 H18 L26 0 Z" fill="url(#ae-tower)" stroke={K} strokeWidth="6" />
            <path d="M-70 -260 L-56 -330 H56 L70 -260 Z" fill="#2A3A4A" stroke={K} strokeWidth="6" />
            <path d="M-60 -300 H60" stroke="#8AD0F0" strokeWidth="14" opacity={0.6 + 0.3 * Math.sin(t * 3)} />
            <rect x="-74" y="-344" width="148" height="16" fill="#D8D4CC" stroke={K} strokeWidth="5" />
            <g transform={`translate(0 -360) scale(${Math.cos(t * 3)} 1)`}><rect x="-30" y="-8" width="60" height="12" fill="#5A5A5A" stroke={K} strokeWidth="3" /></g>
            <circle cx="0" cy="-376" r="7" fill="#FF3A2A" opacity={Math.sin(t * 5) > 0 ? 1 : 0.2} />
            {/* onde del radar */}
            {[0, 1].map((k) => { const p = mod(t * 0.6 + k / 2, 1); return <circle key={k} cx={0} cy={-330} r={30 + p * 220} fill="none" stroke="#7AF0A0" strokeWidth={4 * (1 - p)} opacity={0.6 * (1 - p) * (hit ? 0.3 : 1)} />; })}
          </g>
        </g>

        {/* PIANO 2 — i due aerei, lo scontro, la palla di fuoco e i rottami (0,5) */}
        <g transform={L(0.5)}>
          {!hit && <Aereo x={lerp(-340, CX - 90, big)} y={lerp(760, CY, big)} s={0.62} />}
          {!hit && t > tSmall && <Aereo x={lerp(1420, CX + 60, small)} y={lerp(900, CY + 10, small)} s={0.85} flip small />}
          {/* scie di condensa */}
          {!hit && <path d={`M-400 760 L${lerp(-340, CX - 90, big) - 160} ${lerp(760, CY, big)}`} stroke="#FFFFFF" strokeWidth="10" opacity=".55" strokeLinecap="round" />}
          {hit && (
            <g>
              <Glow id="ae-boom" x={CX} y={CY} r={lerp(120, 420, ball)} t={t} color="#FFB040" amp={0.1} rate={10} opacity={0.9 * (1 - ball * 0.5)} />
              <circle cx={CX} cy={CY} r={lerp(30, 160, eo(ball))} fill="#FFD060" opacity={1 - ball} />
              <circle cx={CX} cy={CY} r={lerp(20, 110, eo(ball))} fill="#FFF6C8" opacity={1 - ball} />
              <Smoke id="ae-cloud" t={t - tHit} x={CX} y={CY} color="#2A2422" n={9} rise={160} wind={60} r0={60} r1={200} speed={0.35} opacity={0.85} />
              {/* rottami in fiamme con le scie di fumo */}
              {DEBRIS.map((d, i) => {
                const tt = t - tHit;
                const x = CX + d.vx * tt * 0.6, y = CY + d.vy * tt + 260 * tt * tt;
                if (y > 1250) return null;
                const trail = `M${x} ${y} L${CX + d.vx * (tt - 0.5) * 0.6} ${CY + d.vy * (tt - 0.5) + 260 * Math.max(0, tt - 0.5) ** 2}`;
                return (
                  <g key={i}>
                    <path d={trail} stroke="#2A2422" strokeWidth={14 * d.s} opacity=".55" strokeLinecap="round" />
                    <g transform={`translate(${x} ${y}) rotate(${d.rot * tt}) scale(${d.s})`}>
                      <path d="M-22 -8 L10 -14 L24 6 L-6 14 Z" fill="#C8CCD0" stroke={K} strokeWidth="4" />
                    </g>
                    {d.fire && <Fire id={`ae-f${i}`} t={t + i} x={x} y={y} scale={0.35 * d.s} />}
                  </g>
                );
              })}
            </g>
          )}
          {/* seconda ondata: rottami in fiamme che piovono sui tetti con le scie di fumo */}
          {Array.from({ length: 9 }, (_, i) => {
            const t0 = tRain + i * 0.28, p = seg(t, t0, t0 + 1.6);
            if (p <= 0 || p >= 1) return null;
            const x0 = CX + (i - 4) * 40, x1 = -80 + i * 150, y = lerp(CY, 1060, p * p), x = lerp(x0, x1, p);
            return (
              <g key={i}>
                <path d={`M${x} ${y} L${lerp(x0, x1, Math.max(0, p - 0.3))} ${lerp(CY, 1060, Math.max(0, p - 0.3) ** 2)}`} stroke="#2A2422" strokeWidth="16" opacity=".6" strokeLinecap="round" />
                <Fire id={`ae-w${i}`} t={t + i} x={x} y={y} scale={0.3} />
              </g>
            );
          })}
          {/* il pezzetto rosa che cade verso il giardino */}
          {t > tRain && t < tSplash && (
            <g transform={`translate(${lerp(CX + 40, 700, pink)} ${lerp(CY + 40, 1195, pink * pink)}) rotate(${t * 300})`}>
              <ellipse cx="0" cy="0" rx="16" ry="20" fill={ROSA} stroke={K} strokeWidth="4" />
              <circle cx="-10" cy="-16" r="7" fill={ROSA} stroke={K} strokeWidth="3" /><circle cx="10" cy="-16" r="7" fill={ROSA} stroke={K} strokeWidth="3" />
            </g>
          )}
        </g>

        {/* PIANO 3 — i tetti della città, con le colonne di fumo dopo la pioggia di rottami (0,62) */}
        <g transform={`${L(0.62)} translate(0 -90)`}>
          <rect x="-200" y="1120" width="1480" height="900" fill="url(#ae-ground)" />
          {ROOFS.map((h, i) => (
            <g key={i}>
              <rect x={h.x} y={1150 - h.h * 0.4} width={h.w} height={h.h * 0.6} fill="#E8D8B8" stroke={K} strokeWidth="5" />
              <path d={`M${h.x - 10} ${1150 - h.h * 0.4} L${h.x + h.w / 2} ${1150 - h.h} L${h.x + h.w + 10} ${1150 - h.h * 0.4} Z`} fill={h.c} stroke={K} strokeWidth="5" />
              <rect x={h.x + h.w * 0.2} y={1150 - h.h * 0.3} width="22" height="22" fill="#3A5A7A" />
              {t > tRain + i * 0.15 && i % 3 === 1 && <Smoke id={`ae-sm${i}`} t={t - tRain - i * 0.15} x={h.x + h.w / 2} y={1150 - h.h} color="#2A2422" n={5} rise={300} wind={40} r0={30} r1={110} speed={0.35} opacity={0.75} />}
              {t > tRain + i * 0.15 && i % 3 === 1 && <Fire id={`ae-rf${i}`} t={t} x={h.x + h.w / 2} y={1150 - h.h * 0.7} scale={0.4} />}
            </g>
          ))}
        </g>

        {/* PIANO 4 — il giardino con la piscina e lo spruzzo (0,8) */}
        <g transform={L(0.8)}>
          <path d="M-200 1090 H1280 V2000 H-200 Z" fill="#5A7A3A" />
          <path d="M-200 1090 H1280" stroke="#7A5A3A" strokeWidth="26" />
          {Array.from({ length: 24 }, (_, k) => <path key={k} d={`M${-180 + k * 62} 1106 V1060`} stroke="#8A6A44" strokeWidth="10" />)}
          {Array.from({ length: 40 }, (_, k) => <path key={k} d={`M${-150 + (k * 83) % 1400} ${1140 + (k * 137) % 800} l8 -22 l8 22`} stroke="#7A9A4A" strokeWidth="5" fill="none" />)}
          {/* sdraio e tubo dell'acqua */}
          <g transform="translate(250 1220)">
            <path d="M-90 0 L60 -30 L120 -110" stroke="#F2F2EC" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d="M-90 0 L60 -30 L120 -110" stroke="#3A8AC8" strokeWidth="6" fill="none" strokeDasharray="14 10" />
            <path d="M-80 0 V40 M50 -24 V30 M110 -100 L130 20" stroke="#B8C0C4" strokeWidth="7" />
          </g>
          <path d="M-200 1300 Q100 1260 200 1320 T420 1300" stroke="#3AA05A" strokeWidth="10" fill="none" />
          <g transform="translate(700 1180) scale(1.3)">
            <path d="M-220 -20 H220 L260 60 H-260 Z" fill="#F2EEE4" stroke={K} strokeWidth="7" />
            <path d="M-200 -8 H200 L232 50 H-232 Z" fill="url(#ae-water)" stroke={K} strokeWidth="5" />
            {splash > 0 && splash < 1 && (
              <g>
                {[-1, -0.5, 0, 0.5, 1].map((k) => <path key={k} d={`M${k * 20} 10 q${k * 30} ${-80 * (1 - splash)} ${k * 60} ${-20 * (1 - splash)}`} stroke="#E8F6FA" strokeWidth="8" fill="none" opacity={1 - splash} />)}
                <ellipse cx="0" cy="16" rx={20 + 120 * splash} ry={6 + 20 * splash} fill="none" stroke="#FFFFFF" strokeWidth="5" opacity={1 - splash} />
              </g>
            )}
            {splash >= 0.5 && <ellipse cx="0" cy="14" rx="18" ry="8" fill={ROSA} stroke={K} strokeWidth="3" />}
          </g>
        </g>

        {/* PIANO 5 — antenna TV e lampione in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1600 Q300 1560 600 1620 L640 2100 H-200 Z" fill="#B8603A" stroke={K} strokeWidth="9" />
          {Array.from({ length: 30 }, (_, k) => <path key={k} d={`M${-200 + (k % 10) * 84} ${1650 + Math.floor(k / 10) * 80} q42 -30 84 0`} stroke="#7A3A22" strokeWidth="6" fill="none" />)}
          {Array.from({ length: 7 }, (_, k) => <path key={k} d={`M${-200 + k * 120} ${1600 - (k % 2) * 6} l60 60`} stroke="#5A3A22" strokeWidth="6" />)}
          <path d="M180 1600 V1240" stroke="#3A3A3A" strokeWidth="10" />
          {[1280, 1320, 1360].map((y, i) => <path key={y} d={`M${180 - 110 + i * 20} ${y} H${180 + 110 - i * 20}`} stroke="#3A3A3A" strokeWidth="7" />)}
          <path d="M1060 2000 V1300 Q1060 1260 1020 1260 H980" stroke="#2A2E30" strokeWidth="18" fill="none" />
          <path d="M940 1250 H1020 L1010 1280 H950 Z" fill="#4A4E50" stroke={K} strokeWidth="5" />
          {Array.from({ length: 5 }, (_, k) => <path key={k} d={`M-200 ${1660 + k * 80} Q300 ${1620 + k * 80} 620 ${1680 + k * 80}`} stroke="#6A4028" strokeWidth="6" fill="none" />)}
        </g>

        {/* PIANO 6 — cenere e particelle vicine dopo lo scontro (1,6) */}
        <g transform={L(1.6)}>
          {hit && Array.from({ length: 16 }, (_, i) => {
            const y = mod(i * 151 + (t - tHit) * (60 + i * 5), 1300) + 600;
            return <rect key={i} x={mod(i * 211 + Math.sin(t + i) * 30, 1080)} y={y} width="8" height="5" fill="#2A2A2A" opacity=".55" />;
          })}
          <NearMotes id="ae-near" t={t} color="#FFFFFF" n={5} r0={70} r1={150} opacity={0.08} />
        </g>
      </g>
      <Finish id="ae" tint="#D8A040" tintOpacity={0.08} />
    </svg>
  );
};
