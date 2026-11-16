import React from 'react';
import { camera, eo, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Cane, Corridor, GOLD, K, TopHat } from './Comuni';

// L'ultimo desiderio: il corridoio verde diventa una piccola sala. Su «Paul propone a John di fuggire, ma lui rifiuta» la
// porta della cella in primo piano, socchiusa, si richiude da sola con un colpo; su «stanco del male del mondo» le lampade
// si abbassano; su «chiede di vedere il suo primo film» il proiettore si accende: il fascio pieno di pulviscolo arriva sul
// lenzuolo appeso, dove ballano un cappello a cilindro e un bastone (lo stesso film del primo capitolo). Sedie vuote.
// Nessuna persona.
// Piani: corridoio (0,3) · lenzuolo-schermo (0,5) · sedie (0,75) · porta della cella (0,95) · proiettore (1,15) · pulviscolo (1,5)

export const Film: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const shut = seg(t, griglia(cues[0] + 1.2), griglia(cues[0] + 1.2) + 0.4) ** 2;
  const dim = eo(seg(t, griglia(cues[1] + 0.3), griglia(cues[1] + 0.3) + 1.2));
  const on = eo(seg(t, griglia(cues[2] + 0.2), griglia(cues[2] + 0.2) + 0.8));
  const b = (t * 72) / 60;
  const hop = Math.abs(Math.sin(b * Math.PI)) * 30;
  const flick = 0.85 + 0.15 * Math.sin(t * 24);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fm" />
        <Lin id="fm-sheet" stops={[[0, '#E8E4D8'], [1, '#B8B4A8']]} />
        <linearGradient id="fm-beam" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#FFF4D0" stopOpacity=".55" />
          <stop offset="1" stopColor="#FFF4D0" stopOpacity=".08" />
        </linearGradient>
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.3)}>
          <Corridor t={t} id="fm" door={0.1} lamps={1 - 0.75 * dim} dark={0.15 + 0.35 * dim} />
        </g>
        {/* il lenzuolo appeso come schermo, con il film in bianco e nero */}
        <g transform={L(0.5)}>
          <path d="M280 600 H800" stroke="#4A3A2A" strokeWidth="10" />
          {[300, 780].map((x) => <path key={x} d={`M${x} 470 V600`} stroke="#3A3A30" strokeWidth="6" />)}
          <path d="M300 606 Q540 620 780 606 L770 980 Q540 996 310 980 Z" fill="url(#fm-sheet)" stroke={K} strokeWidth="6" />
          {[400, 520, 660].map((x) => <path key={x} d={`M${x} 610 Q${x + 10} 800 ${x - 6} 985`} stroke="#A8A498" strokeWidth="4" fill="none" />)}
          {on > 0 && (
            <g opacity={on}>
              <svg x="320" y="620" width="440" height="350" viewBox="0 0 440 350">
                <rect width="440" height="350" fill="#8A8E94" opacity={0.85 * flick} />
                <path d="M0 260 H440 V350 H0 Z" fill="#5A5E64" />
                {[60, 160, 280, 380].map((x) => <path key={x} d={`M${x} 0 V260`} stroke="#B8BCC2" strokeWidth="14" opacity=".45" />)}
                <path d="M120 260 Q220 200 320 260" stroke="#C8CCD2" strokeWidth="6" fill="none" opacity=".6" />
                <TopHat x={170 + Math.sin(b * Math.PI / 2) * 50} y={220 - hop} s={0.9} rot={Math.sin(b * Math.PI) * 12} />
                <Cane x={280 - Math.sin(b * Math.PI / 2) * 40} y={280 - hop * 0.5} s={1.0} rot={Math.sin(b * Math.PI) * 20} />
                {Array.from({ length: 50 }, (_, i) => <rect key={i} x={(i * 47 + Math.floor(t * 24) * 13) % 440} y={(i * 31 + Math.floor(t * 24) * 7) % 350} width="3" height="3" fill="#FFFFFF" opacity=".5" />)}
              </svg>
              <Glow id="fm-screen" x={540} y={800} r={380} t={t} color="#E8F0FF" amp={0.08} rate={12} opacity={0.35 * flick} />
            </g>
          )}
        </g>
        {/* le sedie vuote del corridoio, girate verso lo schermo */}
        <g transform={L(0.75)}>
          {[[300, 1130], [540, 1150], [780, 1130]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path d="M-60 0 H60 L54 18 H-54 Z" fill="#5A3A20" stroke={K} strokeWidth="6" />
              <path d="M-50 18 V140 M50 18 V140 M-50 0 V-150 M50 0 V-150" stroke="#4A2E18" strokeWidth="14" />
              <path d="M-56 -150 H56 V-110 H-56 Z" fill="#5A3A20" stroke={K} strokeWidth="6" />
              <path d="M-56 -80 H56" stroke="#4A2E18" strokeWidth="10" />
            </g>
          ))}
          {/* il sacchetto di popcorn sulla sedia di mezzo */}
          <g transform="translate(540 1140)">
            <path d="M-36 0 L-28 -86 H28 L36 0 Z" fill="#E8E0D0" stroke={K} strokeWidth="5" />
            {[-20, 0, 20].map((x) => <path key={x} d={`M${x} 0 V-86`} stroke="#C8382A" strokeWidth="9" />)}
            {[[-20, -96], [0, -104], [18, -94], [-6, -90], [10, -110]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="11" fill="#FFF4D8" stroke={K} strokeWidth="3" />)}
          </g>
        </g>
        {/* la porta della cella in primo piano a sinistra: socchiusa, poi si richiude */}
        <g transform={L(0.95)}>
          <path d="M-200 400 H180 V1500 H-200 Z" fill="#0A0E0A" />
          <g transform={`translate(180 0) skewY(${(1 - shut) * 12}) scale(${0.45 + 0.55 * shut} 1)`}>
            <rect x="-380" y="400" width="380" height="1100" fill="none" stroke="#5A6058" strokeWidth="18" />
            {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${-356 + i * 54} 400 V1500`} stroke="#6A7066" strokeWidth="16" strokeLinecap="round" />)}
            <path d="M-380 820 H0" stroke="#6A7066" strokeWidth="18" />
          </g>
          <path d="M180 400 V1500" stroke={K} strokeWidth="26" />
          {shut > 0.9 && t < griglia(cues[0] + 1.2) + 0.8 && <path d="M200 760 l40 -20 M200 820 l50 0 M200 880 l40 20" stroke="#E8E0D0" strokeWidth="6" strokeLinecap="round" opacity={1 - seg(t, griglia(cues[0] + 1.2) + 0.4, griglia(cues[0] + 1.2) + 0.8)} />}
        </g>
        {/* il proiettore in primo piano a destra, con le bobine che girano e il fascio */}
        <g transform={L(1.15)}>
          {on > 0 && <path d="M870 1270 L320 620 L760 620 L900 1240 Z" fill="url(#fm-beam)" opacity={on * flick} />}
          <path d="M820 1500 L860 1340 M980 1500 L940 1340 M900 1500 V1340" stroke="#2A2A24" strokeWidth="12" />
          <rect x="800" y="1240" width="200" height="110" rx="12" fill="#3A3E3A" stroke={K} strokeWidth="8" />
          <path d="M800 1290 L760 1270 V1320 L800 1300 Z" fill="#2A2E2A" stroke={K} strokeWidth="6" />
          {[[850, 1170], [960, 1150]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${on * t * 200 * (i ? 1 : -1)})`}>
              <circle r="70" fill="#2A2E2A" stroke={K} strokeWidth="7" />
              {[0, 120, 240].map((a) => <circle key={a} cx={38 * Math.cos((a * Math.PI) / 180)} cy={38 * Math.sin((a * Math.PI) / 180)} r="16" fill="#0E120E" />)}
              <circle r="10" fill="#8A8A7A" />
            </g>
          ))}
          <Glow id="fm-lens" x={770} y={1295} r={120} t={t} color="#FFF4D0" amp={0.1} rate={24} opacity={0.7 * on} />
          <circle cx="770" cy="1295" r="18" fill={on > 0.3 ? '#FFF4D0' : '#4A4A40'} />
          <path d="M-200 1700 H1280 V2200 H-200 Z" fill="#060806" opacity=".5" />
        </g>
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 620, x0: 320, x1: 760 }} bottom={{ y: 1290, x0: 760, x1: 900 }} seed={71} n={34} color="#FFF4D0" boost={0.5 * on} />
          <NearMotes id="fm-near" t={t} color={GOLD} n={5} y0={1200} opacity={0.07} />
        </g>
      </g>
      <Finish id="fm" tint="#1E2A22" tintOpacity={0.12} />
    </svg>
  );
};
