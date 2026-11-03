import React from 'react';
import { camera, eio, eo, eob, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Embers, Fire, Glow, NearMotes, Smoke, Stars, WaveLines } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Ball, K, Palm } from './Comuni';

// Il fuoco e il pallone Wilson: inquadratura vicina sulla buca del fuoco in riva al mare, dal tramonto alla notte.
// Fr. 0: l'arco sfrega sull'asse e sale fumo, ma nessuna fiamma (due tentativi). Fr. 1: gocce di sangue sull'asse e il
// pallone lanciato con rabbia che atterra accanto alla buca. Fr. 2: sull'impronta rossa compare la faccia (bagliore).
// Fr. 3: il pallone resta lì, «accanto», mentre riprende a sfregare. Fr. 4: la fiamma si alza e illumina tutto.
// Piani: cielo (0,2) · mare e scoglio (0,4) · sabbia (0,65) · buca, legna, attrezzi, pallone (0,85) · primo piano (1,2) · braci (1,6)

const r = rng(6060);
const STICKS = Array.from({ length: 9 }, (_, i) => ({ a: -52 + i * 13 + (r() - 0.5) * 6, l: 190 + r() * 60, w: 14 + r() * 6 }));
const STONES = Array.from({ length: 11 }, (_, i) => {
  const a = Math.PI * (0.05 + (i / 10) * 0.9);
  return { x: 540 - Math.cos(a) * 250, y: 1200 + Math.sin(a) * 46, rx: 40 + r() * 16, ry: 24 + r() * 8, c: ['#6E6A66', '#827C76', '#5E5A57'][i % 3] };
});
const SHELLS = Array.from({ length: 6 }, () => ({ x: 360 + r() * 360, y: 1560 + r() * 220, s: 1 + r() * 0.6, rot: (r() - 0.5) * 60 }));

export const Fuoco: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const night = eio(seg(t, 0, dur)); // dal tramonto alla notte
  const throwAt = griglia(cues[1] + 0.6);
  const faceAt = griglia(cues[2] + 0.5);
  const fireAt = griglia(cues[4] + 0.4);
  // due tentativi: l'arco sfrega e sale fumo, poi niente; il terzo (fr. 3–4) è quello buono
  const rubbing = (seg(t, 0.2, 0.5) * (1 - seg(t, throwAt - 0.4, throwAt - 0.1))) + seg(t, cues[3] + 0.3, cues[3] + 0.6) * (1 - seg(t, fireAt + 0.4, fireAt + 0.8));
  const smoke = Math.min(1, seg(t, 0.4, 1.4) * (1 - seg(t, throwAt - 0.2, throwAt + 0.6)) + seg(t, cues[3] + 0.6, cues[4]));
  const saw = Math.sin(t * 18) * 46 * rubbing;
  // il pallone lanciato atterra accanto alla buca
  const throwP = eo(seg(t, throwAt, throwAt + 1.0));
  const bx = -180 + 940 * throwP, by = 1150 - Math.sin(throwP * Math.PI) * 340 + (1 - throwP) * 60;
  const face = eo(seg(t, faceAt, faceAt + 0.6));
  const faceFlash = seg(t, faceAt, faceAt + 0.15) * (1 - seg(t, faceAt + 0.3, faceAt + 1.2));
  const blood = seg(t, throwAt - 0.6, throwAt - 0.3);
  const fire = eob(seg(t, fireAt, fireAt + 1.0), 1.4); // finalmente, la fiamma
  const lit = seg(t, fireAt, fireAt + 0.6);
  const crab = mod(t * 0.07, 1);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fu" />
        <Lin id="fu-sky" stops={[[0, '#141A3A'], [0.45, '#3A2F5C'], [0.66, '#B0566A'], [0.76, '#F09060']]} />
        <Lin id="fu-skyn" stops={[[0, '#050A18'], [0.5, '#0C1A33'], [0.76, '#22304E']]} />
        <Lin id="fu-sea" stops={[[0, '#5A6A8A'], [1, '#141F33']]} />
        <Lin id="fu-sand" stops={[[0, '#9C8672'], [0.3, '#6E5D50'], [1, '#2C2522']]} />
        <Lin id="fu-board" stops={[[0, '#B08A5A'], [1, '#7A5A36']]} />
        <Lin id="fu-stick" stops={[[0, '#8B6A43'], [1, '#5E4528']]} x2={1} y2={0} />
        <radialGradient id="fu-pit">
          <stop offset="0" stopColor="#1A1210" />
          <stop offset="1" stopColor="#3A2C24" />
        </radialGradient>
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo dal tramonto alla notte e stelle */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#fu-sky)" />
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#fu-skyn)" opacity={night} />
          <Glow id="fu-sun" x={300} y={950} r={420} t={t} color="#FFB070" amp={0.03} rate={0.5} opacity={0.5 * (1 - night)} />
          <Stars t={t} seed={60} n={46} y={660} h={280} appear={0.6} size={1.2} />
        </g>

        {/* PIANO 1 — mare scuro e scoglio lontano */}
        <g transform={L(0.4)}>
          <rect x="-200" y="940" width="1480" height="200" fill="url(#fu-sea)" />
          <path d="M700 942 Q760 880 830 892 Q900 876 960 942 Z" fill="#1A2236" />
          <WaveLines t={t} ys={[960, 990, 1020]} color="#8C9ABA" amp={5} w={200} speed={20} opacity={0.45} />
        </g>

        {/* PIANO 2 — sabbia illuminata dal fuoco, conchiglie e un granchio */}
        <g transform={L(0.65)}>
          <path d="M-200 1030 Q300 1000 1280 1040 V2200 H-200 Z" fill="url(#fu-sand)" stroke={K} strokeWidth="7" />
          <path d="M-200 1034 Q300 1004 1280 1044" fill="none" stroke="#E8E4D8" strokeWidth="6" opacity=".5" />
          <Glow id="fu-ground" x={540} y={1200} r={700} t={t} color="#FF9A4A" amp={0.12} rate={6} opacity={0.1 + 0.55 * lit} />
          {SHELLS.map((s, i) => (
            <g key={i} transform={`translate(${s.x} ${s.y}) rotate(${s.rot}) scale(${s.s})`}>
              <path d="M0 14 L-24 -6 Q-20 -22 0 -24 Q20 -22 24 -6 Z" fill="#EAD9C2" stroke={K} strokeWidth="4" strokeLinejoin="round" />
              <path d="M0 14 L-14 -18 M0 14 L0 -22 M0 14 L14 -18" stroke="#B49A80" strokeWidth="3" />
              <rect x="-6" y="12" width="12" height="7" rx="2" fill="#D9C4A8" stroke={K} strokeWidth="3" />
            </g>
          ))}
          {/* granchio che attraversa la sabbia, lontano dal fuoco */}
          <g transform={`translate(${930 - crab * 260} ${1090 + Math.sin(t * 10) * 2})`}>
            <ellipse cx="0" cy="0" rx="22" ry="13" fill="#B5543C" stroke={K} strokeWidth="4" />
            {[-1, 1].map((d) => <path key={d} d={`M${d * 18} -4 l${d * 14} -14`} stroke={K} strokeWidth="4" strokeLinecap="round" />)}
            {[-12, -4, 4, 12].map((x, i) => <path key={x} d={`M${x} 8 l${x > 0 ? 6 : -6} ${10 + Math.sin(t * 20 + i) * 3}`} stroke={K} strokeWidth="3" strokeLinecap="round" />)}
          </g>
        </g>

        {/* PIANO 3 — buca con le pietre, catasta, arco da fuoco, cocco, pallone */}
        <g transform={L(0.85)}>
          {/* buca e pietre dietro */}
          <ellipse cx="540" cy="1200" rx="250" ry="56" fill="url(#fu-pit)" stroke={K} strokeWidth="7" />
          {STONES.slice(0, 6).map((s, i) => <ellipse key={i} cx={s.x} cy={s.y - 50} rx={s.rx * 0.8} ry={s.ry * 0.8} fill={s.c} stroke={K} strokeWidth="5" />)}
          {/* catasta a tenda */}
          {STICKS.map((s, i) => {
            const a = (s.a * Math.PI) / 180;
            return (
              <g key={i}>
                <path d={`M${540 + Math.sin(a) * s.l * 0.95} ${1210} L${540 - Math.sin(a) * 12} ${1210 - s.l * 0.95}`} stroke={K} strokeWidth={s.w + 8} strokeLinecap="round" />
                <path d={`M${540 + Math.sin(a) * s.l * 0.95} ${1210} L${540 - Math.sin(a) * 12} ${1210 - s.l * 0.95}`} stroke="url(#fu-stick)" strokeWidth={s.w} strokeLinecap="round" />
              </g>
            );
          })}
          {/* fumo dei tentativi, denso */}
          <Smoke id="fu-smoke" t={t} x={540} y={1100} color="#D4CEC6" n={9} rise={430} wind={-140} r0={28} r1={120} speed={0.42} opacity={0.9 * Math.max(smoke, lit * 0.5)} />
          {fire > 0.02 && (
            <g transform={`translate(540 1210) scale(${fire}) translate(-540 -1210)`}>
              <Fire id="fu-fire" t={t} x={540} y={1210} scale={2.3} outline={K} />
            </g>
          )}
          <Glow id="fu-fireg" x={540} y={1060} r={460} t={t} color="#FFB060" amp={0.15} rate={9} opacity={0.65 * lit} />
          {/* pietre davanti */}
          {STONES.slice(6).concat(STONES.slice(0, 2).map((s) => ({ ...s, y: s.y + 6 }))).map((s, i) => (
            <g key={i}>
              <ellipse cx={s.x} cy={s.y + 10} rx={s.rx} ry={s.ry} fill={s.c} stroke={K} strokeWidth="6" />
              <path d={`M${s.x - s.rx * 0.6} ${s.y + 2} q${s.rx * 0.5} -12 ${s.rx} -6`} fill="none" stroke="#B8B0A6" strokeWidth="4" opacity={0.4 + 0.5 * lit} />
            </g>
          ))}
          {/* asse con la tacca, arco che sfrega e fumo che esce dalla tacca */}
          <g transform="translate(250 1330) rotate(-6)">
            <rect x="-130" y="-22" width="260" height="44" rx="8" fill="url(#fu-board)" stroke={K} strokeWidth="7" />
            <path d="M40 -22 l14 22 l14 -22" fill="#3A2416" stroke={K} strokeWidth="4" />
            {[-100, -60, -20].map((x) => <circle key={x} cx={x} cy="-12" r="8" fill="#2E1A10" opacity=".8" />)}
            <path d={`M54 -22 V-170`} stroke={K} strokeWidth="18" strokeLinecap="round" />
            <path d={`M54 -22 V-170`} stroke="#9B7A50" strokeWidth="10" strokeLinecap="round" />
            <g transform={`translate(${saw} 0)`}>
              <path d="M-90 -110 Q54 -190 200 -110" fill="none" stroke={K} strokeWidth="16" strokeLinecap="round" />
              <path d="M-90 -110 Q54 -190 200 -110" fill="none" stroke="#7A5A36" strokeWidth="9" strokeLinecap="round" />
              <path d="M-86 -110 L196 -110" stroke="#E6D3A8" strokeWidth="4" />
            </g>
            {/* gocce di sangue sull'asse: si è ferito */}
            {[[-30, -4, 9], [-6, 6, 7], [14, -6, 6], [100, 8, 8]].map(([x, y, rr], i) => (
              <ellipse key={i} cx={x} cy={y} rx={rr * blood} ry={rr * 0.8 * blood} fill="#9E2416" stroke="#5A0E06" strokeWidth="2" />
            ))}
            <Smoke id="fu-notch" t={t} x={54} y={-24} color="#E2DCD4" n={5} rise={200} wind={-60} r0={8} r1={34} speed={0.6} opacity={0.7 * rubbing} />
          </g>
          {/* cocco aperto con l'acqua */}
          <g transform="translate(850 1250)">
            <path d="M-56 0 a56 44 0 0 0 112 0 Z" fill="#5B4127" stroke={K} strokeWidth="7" />
            <ellipse cx="0" cy="0" rx="56" ry="14" fill="#F4EFE2" stroke={K} strokeWidth="5" />
            <ellipse cx="0" cy="2" rx="38" ry="8" fill="#BFD8DA" />
          </g>
          {/* il pallone: lanciato con rabbia, atterra accanto alla buca; poi la faccia (accento) */}
          <Glow id="fu-ballg" x={bx} y={by} r={260} t={t} color="#FFD3B8" amp={0.06} rate={2} opacity={0.3 * face + 0.6 * faceFlash} />
          <ellipse cx={bx + 10} cy={1252} rx={110 * throwP} ry={18} fill={K} opacity={0.3 * throwP} />
          <Ball x={bx} y={by} r={112} rot={-throwP * 420 + 400} face={face} />
        </g>

        {/* PIANO 4 — legna da ardere, foglie di palma e radici in primo piano */}
        <g transform={L(1.2)}>
          {/* noci di cocco ammucchiate e un pattino da ghiaccio dei pacchi, usato come coltello */}
          {[[150, 1580, 54], [236, 1600, 48], [190, 1530, 46]].map(([x, y, rr], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={rr} fill={['#5B4127', '#6B4E2E', '#4E3820'][i]} stroke={K} strokeWidth="7" />
              <path d={`M${x - rr * 0.5} ${y - rr * 0.4} q${rr * 0.3} -${rr * 0.3} ${rr * 0.7} -${rr * 0.2}`} fill="none" stroke="#9B7A50" strokeWidth="5" strokeLinecap="round" />
              {[0, 1, 2].map((k) => <circle key={k} cx={x - 10 + k * 10} cy={y + 8 - (k % 2) * 6} r="5" fill="#2E1A10" />)}
            </g>
          ))}
          <g transform="translate(800 1600) rotate(-12)">
            <path d="M-70 -90 Q-76 -20 -60 20 H70 Q86 0 70 -20 Q20 -30 6 -90 Z" fill="#F2EEE6" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            {[-70, -50, -30].map((y) => <path key={y} d={`M-50 ${y} l40 4`} stroke="#8A7A5C" strokeWidth="4" />)}
            <path d="M-60 26 V44 M60 26 V44" stroke={K} strokeWidth="6" />
            <path d="M-96 46 H96 Q110 46 104 34" fill="none" stroke="#C9D3DA" strokeWidth="10" strokeLinecap="round" />
            <path d="M-96 46 H96" stroke={K} strokeWidth="3" />
            <path d="M-70 42 H40" stroke="#FFFFFF" strokeWidth="3" opacity={0.4 + 0.5 * lit} />
          </g>
          <path d="M-60 1830 L400 1700" stroke={K} strokeWidth="50" strokeLinecap="round" />
          <path d="M-60 1830 L400 1700" stroke="#5E4528" strokeWidth="36" strokeLinecap="round" />
          <path d="M20 1800 L380 1704" stroke="#7A5A36" strokeWidth="8" strokeLinecap="round" opacity=".7" />
          <path d="M760 1900 L1160 1770" stroke={K} strokeWidth="44" strokeLinecap="round" />
          <path d="M760 1900 L1160 1770" stroke="#6B4E2E" strokeWidth="30" strokeLinecap="round" />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M${-40 + i * 50} 1920 Q${60 + i * 40} ${1640 - i * 30} ${200 + i * 50} ${1560 + i * 20}`} fill="none" stroke="#2F5A46" strokeWidth={34 - i * 5} strokeLinecap="round" />
          ))}
          <Palm x={1200} y={1560} h={820} lean={-240} t={t} ph={3} leaf="#1E3A30" trunk="#3E3020" />
        </g>

        {/* PIANO 5 — scintille e braci verso le stelle */}
        <g transform={L(1.6)}>
          {lit > 0 && <Embers t={t} x={540} y={700} w={220} h={520} seed={61} n={34} drift={160} />}
          <NearMotes id="fu-near" t={t} color="#FFC07A" n={6} opacity={0.08 + 0.08 * lit} />
        </g>
      </g>
      <Finish id="fu" tint="#0E2A3A" tintOpacity={0.12} />
    </svg>
  );
};
