import React from 'react';
import { camera, eio, eo, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, Gulls, NearMotes, Reflection, SunRays, WaveLines } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Chop, K, Palm } from './Comuni';

// L'isola deserta: all'alba la zattera di salvataggio sgonfia è arenata sulla spiaggia bianca (fr. 0); intorno solo
// palme, il picco roccioso e l'orizzonte vuoto (fr. 1–2: in mezzo al nulla, nessuno); al largo la barriera corallina,
// dove le onde si frangono di continuo, e su «la barriera di onde alte» un muro d'onda si alza e si rompe con gli
// spruzzi (fr. 3–4): per questo non si può riprendere il mare.
// Piani: cielo e sole (0,2) · oceano e barriera (0,35) · picco e giungla (0,5) · laguna (0,65) · spiaggia e zattera (0,85)
//        · primo piano: tronco, conchiglie, foglie (1,15) · luce e spruzzi davanti (1,7)

const r = rng(3131);
const SPRAY = Array.from({ length: 26 }, () => ({ x: r() * 1200 - 60, h: 60 + r() * 120, s: 6 + r() * 10, ph: r() }));
const STEPS = Array.from({ length: 6 }, (_, i) => i);

export const Isola: React.FC<SceneProps> = ({ t, dur, palette: P, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const sun = eo(seg(t, 0, dur)); // il sole sale piano
  // il muro d'onda della barriera si alza e si frange su «la barriera di onde alte»
  const bigAt = griglia(cues[3] + 0.2);
  const rise = eio(seg(t, bigAt, bigAt + 0.8));
  const crash = seg(t, bigAt + 1.9, bigAt + 3.0);
  const wall = rise * (1 - eo(seg(crash, 0.35, 1))); // l'acqua resta opaca e si abbassa solo dopo che la schiuma è ricaduta
  const curtain = eo(seg(crash, 0, 0.45)); // la cresta crolla in avanti: una cortina di schiuma scende sulla faccia dell'onda
  const wash = mod(t * 0.35, 1); // risacca sulla spiaggia
  const surf = (x: number) => 0.5 + 0.5 * Math.sin(t * 2.4 + x * 0.013);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="is" />
        <Lin id="is-sky" stops={[[0, '#3A5A86'], [0.38, '#9C9CC0'], [0.62, '#F2B48A'], [0.72, '#FCE0B0']]} />
        <Lin id="is-sea" stops={[[0, '#4F9DB2'], [1, '#2A7F86']]} />
        <Lin id="is-wall" stops={[[0, '#9FE0E0'], [0.25, '#4FAAB0'], [1, '#2A7F86']]} />
        <Lin id="is-lagoon" stops={[[0, '#9FE2D8'], [1, '#56BDB4']]} />
        <Lin id="is-rock" x2={1} y2={0} stops={[[0, '#5D6B5A'], [0.55, '#7E8A6E'], [1, '#4A5648']]} />
        <Lin id="is-sand" stops={[[0, '#FBEED0'], [0.4, '#F0DCB0'], [1, '#D8BC88']]} />
        <Lin id="is-tube" stops={[[0, '#F08A5C'], [0.5, P.accento], [1, '#A9361C']]} />
        <Lin id="is-log" stops={[[0, '#B49A78'], [1, '#7A6248']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo dell'alba e sole basso */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#is-sky)" />
          <SunRays id="is-rays" x={260} y={880 - 110 * sun} t={t} color="#FFE1A8" n={10} length={1100} opacity={0.35} />
          <Glow id="is-sun" x={260} y={880 - 110 * sun} r={280} t={t} color="#FFE7B8" amp={0.04} rate={1} opacity={0.85} />
          <circle cx="260" cy={880 - 110 * sun} r="66" fill="#FFF1D2" />
          {[[700, 700, 1.1], [160, 760, 0.8], [920, 800, 0.9]].map(([x, y, s], i) => (
            <ellipse key={i} cx={x + mod(t * 6 + i * 200, 300) - 150} cy={y} rx={160 * s} ry={20 * s} fill="#FFD1A8" opacity=".55" />
          ))}
        </g>

        {/* PIANO 1 — oceano vuoto, barriera corallina con le onde che si rompono, poi il muro d'onda */}
        <g transform={L(0.35)}>
          <rect x="-200" y="880" width="1480" height="300" fill="url(#is-sea)" />
          <Reflection t={t} x={260 - cam.pan * 0.2} y={890} color="#FFE7B8" n={6} w={110} opacity={0.5} />
          {/* muro d'onda */}
          {wall > 0.01 && (
            <g>
              <path d={`M-200 960 C100 ${960 - 120 * wall} 300 ${960 - 230 * wall} 540 ${960 - 240 * wall} C800 ${960 - 230 * wall} 980 ${960 - 140 * wall} 1280 960 Z`} fill="url(#is-wall)" stroke={K} strokeWidth="5" />
              <path d={`M-200 ${960 - 90 * wall} C100 ${960 - 170 * wall} 300 ${960 - 250 * wall} 540 ${960 - 256 * wall} C800 ${960 - 250 * wall} 980 ${960 - 180 * wall} 1280 ${960 - 100 * wall}`} fill="none" stroke="#F4FBFA" strokeWidth={18 * wall} strokeLinecap="round" />
              {/* striature sulla faccia dell'onda e ricciolo di schiuma che si arrotola sulla cresta */}
              {Array.from({ length: 11 }, (_, i) => {
                const x = -40 + i * 110, top = 960 - (240 - Math.abs(x - 540) * 0.32) * wall;
                return <path key={i} d={`M${x} ${top + 30 * wall} q-14 ${60 * wall} 6 ${(960 - top) * 0.75}`} fill="none" stroke="#CFEFEE" strokeWidth="5" strokeLinecap="round" opacity={0.55 * wall} />;
              })}
              {Array.from({ length: 9 }, (_, i) => {
                const x = 60 + i * 120 + mod(t * 60, 120), top = 960 - (250 - Math.abs(x - 540) * 0.3) * wall;
                return <path key={i} d={`M${x - 40} ${top + 6} q30 -38 64 -8 q-18 -6 -24 16`} fill="#FFFFFF" stroke={K} strokeWidth="3" opacity={wall} />;
              })}
            </g>
          )}
          {/* spruzzi della rottura */}
          {crash > 0 && crash < 1 && SPRAY.map((s, i) => (
            <circle key={i} cx={s.x + (s.ph - 0.5) * 120 * crash} cy={940 - 200 * Math.sin(Math.min(1, crash * 1.3) * Math.PI) * (s.h / 120) - 20 * s.ph} r={s.s * (1 + crash)} fill="#FFFFFF" opacity={0.9 * (1 - crash)} />
          ))}
          {crash > 0 && wall > 0.01 && (() => {
            const top = (x: number) => 960 - (240 - Math.abs(x - 540) * 0.3) * wall;
            const xs = Array.from({ length: 15 }, (_, i) => -200 + i * 106);
            const edge = xs.map((x, i) => `${i ? 'L' : 'M'}${x} ${top(x) - 6}`).join(' ');
            const low = xs.slice().reverse().map((x, i) => `L${x} ${top(x) + (960 - top(x)) * curtain + 10 * Math.sin(x * 0.05 + t * 6)}`).join(' ');
            return <path d={`${edge} ${low} Z`} fill="#F4FBFA" stroke={K} strokeWidth="4" strokeLinejoin="round" />;
          })()}
          {/* cresta bianca continua sulla barriera */}
          <path d={Array.from({ length: 16 }, (_, i) => {
            const x = -200 + i * 96, h = 14 + 22 * surf(x);
            return `${i ? 'L' : 'M'}${x} 966 Q${x + 24} ${966 - h} ${x + 48} ${966 - h * 0.7} Q${x + 72} ${966 - h * 0.3} ${x + 96} 966`;
          }).join(' ') + ' V990 H-200 Z'} fill="#F4FBFA" stroke={K} strokeWidth="4" strokeLinejoin="round" />
          {Array.from({ length: 12 }, (_, i) => (
            <circle key={i} cx={-140 + i * 110} cy={936 - 26 * surf(i * 110)} r={6 + 4 * surf(i * 70)} fill="#FFFFFF" opacity={0.8 * surf(i * 110)} />
          ))}
        </g>

        {/* PIANO 2 — il picco roccioso e la giungla a destra */}
        <g transform={L(0.5)}>
          <path d="M640 1080 Q700 980 780 900 Q840 780 900 720 Q950 690 990 730 Q1040 800 1080 880 Q1160 960 1300 1080 Z" fill="url(#is-rock)" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          <path d="M900 740 Q930 800 920 880 M980 760 Q1000 830 1040 900" fill="none" stroke="#3E4A3C" strokeWidth="5" opacity=".6" />
          <path d="M910 724 Q950 720 980 740" fill="none" stroke="#FCE0B0" strokeWidth="5" opacity=".8" />
          <path d="M560 1090 Q700 990 820 1000 Q960 960 1300 1060 V1100 H560 Z" fill="#3E7B4F" stroke={K} strokeWidth="6" />
          {[640, 720, 860, 1000].map((x, i) => <Palm key={x} x={x} y={1050} h={170 + (i % 2) * 40} lean={i % 2 ? 40 : -30} t={t} ph={i} outline={false} leaf="#2C6A48" trunk="#5E4A30" />)}
        </g>

        {/* PIANO 3 — laguna turchese con le teste di corallo */}
        <g transform={L(0.65)}>
          <rect x="-200" y="990" width="1480" height="200" fill="url(#is-lagoon)" />
          <WaveLines t={t} ys={[1010, 1040, 1070]} color="#E2F6F2" amp={5} w={220} speed={24} opacity={0.65} />
          {[[200, 1030], [430, 1060], [760, 1020]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={40 + i * 6} ry="9" fill="#3E9A94" opacity=".7" />)}
        </g>

        {/* PIANO 4 — spiaggia, risacca, la zattera di salvataggio sgonfia (accento), orme che si allontanano */}
        <g transform={L(0.85)}>
          <path d="M-200 1090 Q300 1050 700 1080 Q1000 1100 1280 1070 V2200 H-200 Z" fill="url(#is-sand)" stroke={K} strokeWidth="7" />
          <path d={`M-200 ${1098 + wash * 36} Q300 ${1058 + wash * 36} 700 ${1088 + wash * 36} Q1000 ${1108 + wash * 36} 1280 ${1078 + wash * 36}`} fill="none" stroke="#FFFFFF" strokeWidth="9" opacity={0.85 * (1 - wash)} />
          <path d={`M-200 ${1094 + wash * 36} Q300 ${1054 + wash * 36} 700 ${1084 + wash * 36} Q1000 ${1104 + wash * 36} 1280 ${1074 + wash * 36} V1094 Q700 1078 -200 1094 Z`} fill="#BFE8E0" opacity={0.5 * (1 - wash)} />
          <g transform="translate(470 1190) rotate(-5)" strokeLinejoin="round">
            <ellipse cx="10" cy="56" rx="260" ry="26" fill={K} opacity=".2" />
            {/* zattera vista un po' dall'alto: anello di tubolari afflosciato, fondo scuro, tettuccio ricaduto su un lato */}
            <path d="M-250 10 Q-262 -60 -150 -78 Q-20 -96 120 -84 Q240 -70 252 -10 Q262 48 150 66 Q20 84 -110 70 Q-240 58 -250 10 Z" fill="url(#is-tube)" stroke={K} strokeWidth="9" />
            <path d="M-170 6 Q-176 -40 -100 -48 Q0 -60 110 -50 Q180 -40 182 0 Q182 34 100 42 Q0 52 -90 44 Q-166 38 -170 6 Z" fill="#5A2414" stroke={K} strokeWidth="7" />
            <path d="M-150 10 Q-60 30 40 18 Q120 10 170 -6" fill="none" stroke="#7A3420" strokeWidth="6" opacity=".8" />
            {/* pieghe dove i tubolari si sono sgonfiati */}
            <path d="M-246 -6 q20 -10 30 6 M-236 30 q18 -14 34 2 M200 52 q-8 -22 14 -30 M236 -40 q-20 4 -22 24" fill="none" stroke="#9E3B1F" strokeWidth="6" strokeLinecap="round" />
            <path d="M-200 -64 Q-80 -90 60 -88" fill="none" stroke="#FFC9A8" strokeWidth="8" strokeLinecap="round" opacity=".8" />
            {/* tettuccio ricaduto: telo con la banda riflettente e l'arco piegato */}
            <path d="M40 -60 Q110 -150 210 -110 Q262 -80 250 -20 Q200 10 140 -6 Q90 -20 40 -60 Z" fill="#D9542F" stroke={K} strokeWidth="7" />
            <path d="M70 -76 Q140 -130 220 -86" fill="none" stroke="#E9EEF2" strokeWidth="11" />
            <path d="M60 -50 Q130 -170 236 -60" fill="none" stroke="#33424E" strokeWidth="6" strokeDasharray="2 0" opacity=".9" />
            <circle cx="150" cy="-128" r="9" fill="#FFF6C8" stroke={K} strokeWidth="3" />
            {/* valvole e cima di salvataggio intorno */}
            {[-200, -40, 120].map((x, i) => <rect key={x} x={x - 9} y={i === 1 ? 64 : 52} width="18" height="18" rx="4" fill="#33424E" stroke={K} strokeWidth="3" />)}
            <path d="M-246 22 q26 24 52 6 q26 24 52 6 q26 24 52 6 q26 24 52 6 q26 24 52 6 q26 24 52 4 q26 22 52 -2 q26 18 52 -10 q20 10 40 -26" fill="none" stroke="#F4EFE2" strokeWidth="5" />
            <path d="M216 30 q50 20 90 -6 q30 -20 70 6" fill="none" stroke="#E6D3A8" strokeWidth="6" strokeLinecap="round" />
            <path d="M-60 -40 l18 -10" stroke={K} strokeWidth="4" />
          </g>
          {/* orme che si allontanano dalla zattera verso la giungla */}
          {STEPS.map((i) => {
            const x = 700 + i * 46, y = 1240 - i * 22;
            return <ellipse key={i} cx={x + (i % 2) * 18} cy={y} rx={13 - i} ry={20 - i * 1.5} fill="#D8BC88" stroke="#B89A6A" strokeWidth="2" transform={`rotate(60 ${x} ${y})`} />;
          })}
          <Glow id="is-raftg" x={470} y={1170} r={300} t={t} color="#FFC9A0" amp={0.04} rate={1} opacity={0.2} />
        </g>

        {/* PIANO 5 — primo piano: tronco portato dal mare, conchiglie, alghe e foglie di palma ai bordi */}
        <g transform={L(1.15)}>
          <g transform="translate(300 1700) rotate(-8)">
            <rect x="-300" y="-40" width="600" height="80" rx="38" fill="url(#is-log)" stroke={K} strokeWidth="9" />
            <ellipse cx="300" cy="0" rx="22" ry="38" fill="#D8C4A4" stroke={K} strokeWidth="7" />
            {[0, 1, 2].map((i) => <ellipse key={i} cx="300" cy="0" rx={16 - i * 5} ry={28 - i * 9} fill="none" stroke="#8A7458" strokeWidth="3" />)}
            <path d="M-260 -16 H200 M-200 10 H120" stroke="#8A7458" strokeWidth="5" strokeLinecap="round" opacity=".7" />
            <path d="M-120 -40 l-30 -60 l40 30" fill="#6E5638" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          </g>
          <path d="M-40 1800 q60 -40 120 -10 q40 20 100 -10" fill="none" stroke="#3E7B4F" strokeWidth="12" strokeLinecap="round" />
          <path d="M-20 1830 q70 -20 130 10" fill="none" stroke="#2C6A48" strokeWidth="10" strokeLinecap="round" />
          {[[700, 1580, 1.4, 10], [820, 1640, 1.1, -20], [620, 1690, 1, 30]].map(([x, y, s, a], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
              <path d="M0 18 L-30 -8 Q-24 -30 0 -32 Q24 -30 30 -8 Z" fill="#F4E4CC" stroke={K} strokeWidth="5" strokeLinejoin="round" />
              <path d="M0 18 L-18 -24 M0 18 L0 -30 M0 18 L18 -24" stroke="#C8A888" strokeWidth="3" />
            </g>
          ))}
          <Palm x={-60} y={1960} h={980} lean={170} t={t} ph={0.5} />
          <Palm x={1140} y={1980} h={820} lean={-200} t={t} ph={2} />
        </g>
        <g transform={L(0.5)}><Gulls t={t} y={700} h={120} color={K} n={3} /></g>

        {/* PIANO 6 — spruzzi e luce davanti alla camera */}
        <g transform={L(1.7)}><NearMotes id="is-near" t={t} color="#FFF1D2" n={7} opacity={0.12} /></g>
      </g>
      <Finish id="is" tint="#F2B85A" tintOpacity={0.1} />
    </svg>
  );
};
