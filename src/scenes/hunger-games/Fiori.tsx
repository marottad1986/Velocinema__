import React from 'react';
import { camera, eo, eob, mod, rng, seg } from '../../lib/anim';
import { ANTON, SANS } from '../../lib/fonts';
import { Embers, Fire, Glow, NearMotes, Smoke, Stars } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { EMBER, HGDefs, K } from './Comuni';

// Il saluto per Rue: notte nel Distretto 11, il distretto dei frutteti. Tra i filari un maxischermo su un traliccio
// trasmette i giochi: nell'erba dell'arena un mucchio di fiori bianchi e gialli. Eventi: 1ª frase sullo schermo
// sbocciano i fiori, poi davanti allo schermo si accendono tre lanterne, una alla volta (il saluto con tre dita);
// 2ª frase tra i filari si accendono le fiaccole della rivolta, scintille e fumo, il cielo si arrossa; poi lo schermo
// sfarfalla di rosso (il presidente Snow si arrabbia); 3ª frase sullo schermo compare un grande «2» con la scritta
// «DUE VINCITORI · STESSO DISTRETTO» (la nuova regola dei registi dei giochi).
// Piani: cielo (0,2) · filari lontani (0,4) · schermo e lanterne (0,62) · filari vicini con le fiaccole (0,85)
//        · rami carichi di frutti in primo piano (1,25) · scintille e particelle vicine (1,6)

const r = rng(8181);
const FLOWERS = Array.from({ length: 34 }, () => ({ x: (r() - 0.5) * 300, y: -r() * 70 * (1 - Math.abs(r() - 0.5)), c: r() > 0.45 ? '#F8F4E8' : '#F2C84A', s: 0.7 + r() * 0.5, d: r() }));
const TORCH = [70, 190, 300, 790, 910, 1030, 150, 960].map((x, i) => ({ x, y: 1190 + (i % 3) * 26, d: r() }));

/** Albero da frutto: chioma rotonda con frutti. */
const Albero: React.FC<{ x: number; y: number; s: number; crown: string; fruit: string; outline?: boolean; seed: number }> = ({ x, y, s, crown, fruit, outline = false, seed }) => {
  const q = rng(seed);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-14 0 L-10 -120 H10 L14 0 Z" fill="#2A1C12" stroke={outline ? K : 'none'} strokeWidth="6" />
      <path d="M-110 -150 Q-130 -260 -40 -280 Q0 -330 60 -290 Q140 -270 120 -170 Q110 -110 20 -114 Q-90 -100 -110 -150 Z" fill={crown} stroke={outline ? K : 'none'} strokeWidth="8" />
      {Array.from({ length: 9 }, (_, k) => <circle key={k} cx={-80 + q() * 170} cy={-150 - q() * 120} r={9} fill={fruit} stroke={outline ? K : 'none'} strokeWidth="3" />)}
    </g>
  );
};

export const Fiori: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1050);
  const L = cam.layer;
  const bloom = eo(seg(t, 0.2, 1.4));
  const lt = (k: number) => eob(seg(t, griglia(cues[0] + 1.6 + k * 0.67), griglia(cues[0] + 1.6 + k * 0.67) + 0.3), 1.6);
  const tr = griglia(cues[1] + 0.8);
  const riot = eo(seg(t, tr, tr + 1.2));
  const tsnow = griglia(cues[1] + 2.6);
  const red = seg(t, tsnow, tsnow + 0.15) * (1 - seg(t, tsnow + 0.9, tsnow + 1.3));
  const flick = red > 0 ? 0.6 + 0.4 * Math.sign(Math.sin(t * 40)) : 1;
  const t2 = griglia(cues[2] + 1.2);
  const two = eob(seg(t, t2, t2 + 0.5), 1.5);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fo" />
        <HGDefs id="fo" />
        <Lin id="fo-sky" stops={[[0, '#05070E'], [0.35, '#101828'], [0.55, '#2A2A3A'], [0.62, '#3A3040']]} />
        <Lin id="fo-ground" stops={[[0, '#2A3020'], [0.4, '#1A2014'], [1, '#080A06']]} />
        <Lin id="fo-scr" stops={[[0, '#3A6A3A'], [0.6, '#2A4A24'], [1, '#1A2E14']]} />
        <Lin id="fo-pole" x2={1} y2={0} stops={[[0, '#5A6068'], [0.5, '#3A4048'], [1, '#1A1E22']]} />
        <radialGradient id="fo-riot" cx=".5" cy="1" r=".9">
          <stop offset="0" stopColor="#FF6A2A" stopOpacity=".7" />
          <stop offset="1" stopColor="#FF6A2A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo notturno che si arrossa con la rivolta (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#fo-sky)" />
          <Stars t={t} seed={13} n={40} y={60} h={700} color="#E8EEF4" size={0.8} />
          <rect x="-200" y="600" width="1480" height="600" fill="url(#fo-riot)" opacity={riot} />
        </g>
        {/* PIANO 1 — filari lontani (0,4) */}
        <g transform={L(0.4)}>
          <path d="M-200 1090 Q540 1070 1280 1090 V1300 H-200 Z" fill="#1A2018" />
          {Array.from({ length: 14 }, (_, i) => <Albero key={i} x={-120 + i * 100} y={1100} s={0.42} crown="#1E2E22" fruit="#3A3A2A" seed={i + 1} />)}
          {TORCH.slice(0, 6).map((tc, i) => (
            <g key={i} opacity={riot}>
              <Glow id={`fo-tf${i}`} x={tc.x * 1.1 - 30} y={1060} r={70} t={t + i} color="#FFA050" amp={0.15} rate={9} opacity={0.8} />
              <circle cx={tc.x * 1.1 - 30} cy={1060} r="6" fill="#FFD080" />
            </g>
          ))}
        </g>
        {/* PIANO 2 — il maxischermo e le tre lanterne (0,62) */}
        <g transform={L(0.62)}>
          <path d="M-200 1130 Q540 1110 1280 1130 V2200 H-200 Z" fill="url(#fo-ground)" />
          <rect x="300" y="960" width="22" height="200" fill="url(#fo-pole)" stroke={K} strokeWidth="6" />
          <rect x="758" y="960" width="22" height="200" fill="url(#fo-pole)" stroke={K} strokeWidth="6" />
          <Glow id="fo-sg" x={540} y={820} r={440} t={t} color={red > 0 ? '#FF3A3A' : '#B8F0C0'} amp={0.04} rate={8} opacity={0.3 + 0.25 * red} />
          <rect x="220" y="660" width="640" height="320" rx="12" fill="#101410" stroke={K} strokeWidth="11" />
          <g opacity={flick}>
            <rect x="236" y="676" width="608" height="288" fill="url(#fo-scr)" />
            {/* l'erba dell'arena con il mucchio di fiori */}
            <g opacity={1 - two}>
              {Array.from({ length: 30 }, (_, k) => <path key={k} d={`M${250 + k * 20} 964 l${Math.sin(k) * 6} -${26 + (k % 4) * 8}`} stroke="#5A8A44" strokeWidth="5" strokeLinecap="round" />)}
              <path d="M370 930 Q540 830 710 930 Z" fill="#2E4A24" />
              {FLOWERS.map((f, i) => {
                const b = seg(bloom, f.d * 0.6, f.d * 0.6 + 0.4);
                return (
                  <g key={i} transform={`translate(${540 + f.x * 0.9} ${918 + f.y}) scale(${f.s * b})`}>
                    {[0, 1, 2, 3, 4].map((p) => <ellipse key={p} cx={Math.cos(p * 1.256) * 9} cy={Math.sin(p * 1.256) * 9} rx="7" ry="5" transform={`rotate(${p * 72} ${Math.cos(p * 1.256) * 9} ${Math.sin(p * 1.256) * 9})`} fill={f.c} stroke="#2A2A1A" strokeWidth="1.5" />)}
                    <circle cx="0" cy="0" r="4.5" fill={f.c === '#F2C84A' ? '#C87A1A' : '#F2C84A'} />
                  </g>
                );
              })}
            </g>
            {/* la nuova regola */}
            <g opacity={two} transform={`translate(540 800) scale(${0.6 + 0.4 * two}) translate(-540 -800)`}>
              <rect x="236" y="676" width="608" height="288" fill="#14100C" opacity=".75" />
              <text x="540" y="880" textAnchor="middle" fontFamily={ANTON} fontSize="230" fill={EMBER} stroke={K} strokeWidth="4">2</text>
              <text x="540" y="938" textAnchor="middle" fontFamily={SANS} fontWeight="800" fontSize="25" letterSpacing="2" fill="#F2E8D8">DUE VINCITORI · STESSO DISTRETTO</text>
            </g>
            <rect x="236" y="676" width="608" height="288" fill="#FF2A2A" opacity={0.35 * red} />
            {Array.from({ length: 24 }, (_, k) => <rect key={k} x="236" y={676 + k * 12 + mod(t * 40, 12)} width="608" height="2" fill="#000" opacity=".12" />)}
          </g>
          <rect x="220" y="660" width="640" height="320" rx="12" fill="none" stroke="#8A9098" strokeWidth="3" opacity=".6" />
          {/* le tre lanterne su un filo davanti allo schermo */}
          <path d="M260 1040 Q540 1090 820 1040" stroke="#1A1A1A" strokeWidth="4" fill="none" />
          {[0, 1, 2].map((k) => {
            const on = lt(k), lx = 400 + k * 140, ly = 1068 + (k === 1 ? 6 : 0) + Math.sin(t * 1.6 + k) * 3;
            return (
              <g key={k}>
                <Glow id={`fo-lan${k}`} x={lx} y={ly + 40} r={130} t={t} color="#FFC870" amp={0.08} rate={4 + k} opacity={0.8 * on} />
                <path d={`M${lx} ${ly - 10} V${ly}`} stroke="#1A1A1A" strokeWidth="3" />
                <rect x={lx - 26} y={ly} width="52" height="70" rx="20" fill={on > 0.1 ? '#FFD890' : '#5A4A3A'} stroke={K} strokeWidth="6" opacity={0.6 + 0.4 * Math.max(on, 0.4)} />
                <path d={`M${lx - 26} ${ly + 24} H${lx + 26} M${lx - 26} ${ly + 46} H${lx + 26}`} stroke="#A8743A" strokeWidth="3" />
                <rect x={lx - 14} y={ly - 6} width="28" height="10" fill="#3A2A1A" stroke={K} strokeWidth="3" />
              </g>
            );
          })}
        </g>
        {/* PIANO 3 — filari vicini con le fiaccole della rivolta (0,85) */}
        <g transform={L(0.85)}>
          {[-40, 260, 820, 1120].map((ax, i) => <Albero key={i} x={ax} y={1250 + (i % 2) * 20} s={0.95} crown="#22361E" fruit="#C8502A" outline seed={i + 40} />)}
          {TORCH.map((tc, i) => (
            <g key={i} opacity={seg(riot, tc.d * 0.5, tc.d * 0.5 + 0.4)}>
              <path d={`M${tc.x} ${tc.y + 60} L${tc.x + 6} ${tc.y - 30}`} stroke={K} strokeWidth="12" strokeLinecap="round" />
              <path d={`M${tc.x} ${tc.y + 60} L${tc.x + 6} ${tc.y - 30}`} stroke="#6A4A2A" strokeWidth="6" strokeLinecap="round" />
              <Fire id={`fo-fire${i}`} t={t + i * 0.7} x={tc.x + 6} y={tc.y - 30} scale={0.28} outline={K} />
            </g>
          ))}
          <g opacity={riot}>
            <Embers t={t} x={540} y={1250} w={1000} h={500} n={36} seed={41} drift={100} />
            <Smoke id="fo-sm" t={t} x={300} y={1150} color="#5A4A4A" n={8} rise={300} wind={200} r0={30} r1={110} speed={0.15} opacity={0.5} />
            <Smoke id="fo-sm2" t={t + 2} x={800} y={1160} color="#5A4A4A" n={8} rise={300} wind={-200} r0={30} r1={110} speed={0.15} opacity={0.5} />
          </g>
        </g>
        {/* PIANO 4 — rami carichi di frutti in primo piano (1,25) */}
        <g transform={L(1.25)}>
          <path d="M-200 1600 Q540 1560 1280 1600 V2200 H-200 Z" fill="#070A06" stroke={K} strokeWidth="8" />
          {/* cassette di frutta */}
          {[[180, 1650], [300, 1640]].map(([cx, cy], i) => (
            <g key={i} transform={`translate(${cx} ${cy})`}>
              <rect x="-70" y="-60" width="140" height="70" fill="#6A4A2A" stroke={K} strokeWidth="7" />
              <path d="M-70 -30 H70" stroke="#3A2A14" strokeWidth="5" />
              {[-44, -14, 16, 46].map((fx) => <circle key={fx} cx={fx} cy={-66} r="16" fill="#C8502A" stroke={K} strokeWidth="4" />)}
            </g>
          ))}
          <path d="M1280 1400 Q1100 1420 960 1500" stroke={K} strokeWidth="28" fill="none" />
          <path d="M1280 1400 Q1100 1420 960 1500" stroke="#2A1C12" strokeWidth="16" fill="none" />
          {[[1040, 1440], [990, 1480], [1120, 1420]].map(([fx, fy], i) => (
            <g key={i}><path d={`M${fx} ${fy} q-30 20 -50 -10 q30 -20 50 10 Z`} fill="#2A4A24" stroke={K} strokeWidth="4" /><circle cx={fx + 6} cy={fy + 34} r="20" fill="#C8502A" stroke={K} strokeWidth="5" /></g>
          ))}
        </g>
        <g transform={L(1.6)}>
          <NearMotes id="fo-near" t={t} color="#FFB070" n={6} r0={50} r1={130} y0={1000} opacity={0.08 + 0.06 * riot} />
        </g>
      </g>
      <Finish id="fo" tint="#0F1A12" tintOpacity={0.1} />
    </svg>
  );
};

