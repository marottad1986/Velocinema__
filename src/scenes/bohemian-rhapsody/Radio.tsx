import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Flyers, Glow, NearMotes, Neon } from '../../lib/elements';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { GOLD, K, TINT } from './Comune';

// Troppo lunga per la radio: studio radiofonico anni '70. Insegna ON AIR che si accende, giradischi, microfono a braccio,
// telefono con le linee che lampeggiano, bacheca con i passaggi segnati a gessetto, orologio, lettere degli ascoltatori.
// Piani: parete con pannelli (0,25) · insegna, orologio, bacheca, classifica (0,45) · banco con giradischi, bobine,
//        telefono (0,7) · microfono a braccio (0,9) · lettere in primo piano (1,25) · lettere che volano e pulviscolo (1,7)
// Eventi: cues[1] la bobina con la canzone si illumina sul banco · cues[3] ON AIR si accende, le bobine girano,
//         l'orologio corre (due giorni), sulla bacheca compaiono 14 tacche, il telefono lampeggia, arrivano le lettere
//         · cues[4] sulla classifica la canzone sale al primo posto.

const r = rng(7171);
const PANELS = Array.from({ length: 10 }, (_, i) => ({ x: -140 + (i % 5) * 300, y: 60 + Math.floor(i / 5) * 260, c: r() }));

export const Radio: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c1 = cues[1] ?? 3.2, c3 = cues[3] ?? 8.2, c4 = cues[4] ?? 10.3;
  const copy = eob(seg(t, c1, c1 + 0.5));
  const air = seg(t, c3, c3 + 0.3);
  const play = eo(seg(t, c3, c3 + 0.6));
  const marks = Math.floor(lerp(0, 14, seg(t, c3 + 0.2, c4 + 0.4)));
  const clock = t * 6 + 720 * eo(seg(t, c3, c4 + 0.6));
  const ring = air * (Math.sin(t * 18) > 0 ? 1 : 0.2);
  const top = eob(seg(t, c4 + 0.3, c4 + 1.3));
  const spin = t * 40 + play * t * 160;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ra" />
        <Lin id="ra-wall" stops={[[0, '#0E0A10'], [0.4, '#1E1620'], [0.75, '#2C2028'], [1, '#18101A']]} />
        <Lin id="ra-desk" stops={[[0, '#7A5A3E'], [0.3, '#4E3424'], [1, '#22140C']]} />
        <Lin id="ra-cork" stops={[[0, '#A8784A'], [1, '#7A5232']]} />
        <Lin id="ra-tt" x2={1} y2={0} stops={[[0, '#4A4448'], [0.5, '#8A8288'], [1, '#3A3438']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete con pannelli (calma in alto per il titolo) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1600" fill="url(#ra-wall)" />
          {PANELS.map((p, i) => (
            <rect key={i} x={p.x} y={p.y} width="270" height="230" rx="12" fill={p.c > 0.5 ? '#241A22' : '#20161E'} opacity=".8" />
          ))}
        </g>

        {/* PIANO 1 — insegna ON AIR, orologio, bacheca con le tacche, classifica */}
        <g transform={L(0.45)}>
          <rect x="590" y="600" width="400" height="130" rx="14" fill="#1A0A0E" stroke={K} strokeWidth="8" />
          <Neon id="ra-onair" t={t} x={790} y={698} text="ON AIR" color="#FF3A4A" font={SANS} size={84} onAt={c3} />
          {/* orologio che corre */}
          <g transform="translate(220 700)">
            <Glow id="ra-clk" x={0} y={0} r={130} t={t} color="#F2E2B8" amp={0.04} rate={1.5} opacity={0.3} />
            <circle r="80" fill="#F4ECDD" stroke={K} strokeWidth="8" />
            {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 -68 V-58" stroke={K} strokeWidth="5" transform={`rotate(${i * 30})`} />)}
            <path d="M0 0 V-44" stroke={K} strokeWidth="8" strokeLinecap="round" transform={`rotate(${clock / 12})`} />
            <path d="M0 0 V-62" stroke={K} strokeWidth="5" strokeLinecap="round" transform={`rotate(${clock})`} />
            <circle r="6" fill="#C8303A" />
          </g>
          {/* bacheca di sughero con le 14 tacche */}
          <g transform="translate(140 820)">
            <rect x="0" y="0" width="330" height="220" rx="8" fill="url(#ra-cork)" stroke={K} strokeWidth="8" />
            <rect x="24" y="22" width="282" height="176" fill="#F4ECDD" stroke={K} strokeWidth="5" transform="rotate(-2 165 110)" />
            {Array.from({ length: marks }, (_, i) => {
              const g = Math.floor(i / 5), k = i % 5;
              const x = 54 + g * 84 + k * 14;
              return k === 4
                ? <path key={i} d={`M${x - 64} 140 L${x + 6} 70`} stroke="#8A1E3C" strokeWidth="7" strokeLinecap="round" />
                : <path key={i} d={`M${x} 64 V146`} stroke="#8A1E3C" strokeWidth="7" strokeLinecap="round" />;
            })}
            <circle cx="165" cy="18" r="10" fill="#C8303A" stroke={K} strokeWidth="4" />
          </g>
          {/* classifica: la barra d'oro sale al primo posto */}
          <g transform="translate(620 800)">
            <rect x="0" y="0" width="360" height="240" rx="8" fill="#F4ECDD" stroke={K} strokeWidth="8" />
            {[0, 1, 2, 3].map((i) => {
              const gold = i === 3;
              const y = gold ? lerp(186, 24, top) : 24 + (i + (top > 0.5 ? 1 : 0)) * 54;
              return (
                <g key={i} transform={`translate(0 ${Math.min(y, 186)})`}>
                  <rect x="70" y="0" width={gold ? lerp(150, 260, top) : 230 - i * 40} height="34" rx="6" fill={gold ? GOLD : '#C8B8A8'} stroke={K} strokeWidth="4" />
                </g>
              );
            })}
            <text x="38" y="52" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="38" fill="#8A1E3C">1</text>
            <Glow id="ra-top" x={200} y={40} r={180} t={t} color={GOLD} amp={0.1} rate={3} opacity={0.5 * top} />
          </g>
        </g>

        {/* PIANO 2 — banco con giradischi, registratore a bobine e telefono */}
        <g transform={L(0.7)}>
          <rect x="-200" y="1300" width="1480" height="800" fill="#100A0C" />
          <path d="M-200 1160 L-150 1100 H1230 L1280 1160 V1320 H-200 Z" fill="url(#ra-desk)" stroke={K} strokeWidth="10" strokeLinejoin="round" />
          <path d="M-146 1108 H1226" stroke="#C89A6A" strokeWidth="4" opacity=".6" />
          {/* giradischi */}
          <g transform="translate(250 1110)">
            <path d="M-170 0 L-150 -60 H150 L170 0 Z" fill="url(#ra-tt)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <ellipse cx="-10" cy="-62" rx="120" ry="30" fill="#141014" stroke={K} strokeWidth="6" />
            <ellipse cx="-10" cy="-62" rx="40" ry="10" fill="#C8303A" />
            <path d={`M${-10 + Math.cos(spin / 20) * 90} ${-62 + Math.sin(spin / 20) * 22} L${-10 + Math.cos(spin / 20 + 0.4) * 95} ${-62 + Math.sin(spin / 20 + 0.4) * 23}`} stroke="#8A8288" strokeWidth="4" />
            <path d="M120 -80 L60 -60" stroke={K} strokeWidth="8" strokeLinecap="round" />
          </g>
          {/* registratore a bobine con la copia della canzone */}
          <g transform="translate(560 1100)">
            <Glow id="ra-copy" x={0} y={-90} r={200} t={t} color={GOLD} amp={0.1} rate={3} opacity={0.15 + 0.5 * copy} />
            <rect x="-120" y="-180" width="240" height="180" rx="12" fill="#5A5458" stroke={K} strokeWidth="8" />
            {[-55, 55].map((dx, i) => (
              <g key={i} transform={`translate(${dx} -110) rotate(${spin * (i ? 1.1 : 1)})`}>
                <circle r="44" fill="#2A2228" stroke={K} strokeWidth="6" />
                <circle r="34" fill={copy > 0.3 ? '#8A6A2A' : '#5A3A2A'} />
                <circle r="12" fill="#C8C0B8" stroke={K} strokeWidth="4" />
                <path d="M0 -30 V-18 M26 15 L16 9 M-26 15 L-16 9" stroke={K} strokeWidth="6" />
              </g>
            ))}
            <path d="M-100 -40 H100" stroke="#6A3A22" strokeWidth="6" />
          </g>
          {/* telefono con le linee che lampeggiano */}
          <g transform="translate(870 1110)">
            <path d="M-110 0 L-90 -90 H90 L110 0 Z" fill="#C8303A" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d="M-120 -96 Q0 -150 120 -96 L100 -80 Q0 -120 -100 -80 Z" fill="#A8203A" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <Glow id={`ra-ln${i}`} x={-60 + i * 30} y={-30} r={30} t={t} color="#FFE7A0" amp={0} opacity={ring * (i % 2 ? 0.8 : 0.5)} />
                <rect x={-72 + i * 30} y="-40" width="24" height="18" rx="4" fill={ring * (i % 2 ? 1 : 0.6) > 0.5 ? '#FFE7A0' : '#5A3A3A'} stroke={K} strokeWidth="3" />
              </g>
            ))}
          </g>
        </g>

        {/* PIANO 3 — microfono da tavolo */}
        <g transform={L(0.9)}>
          <Glow id="ra-micg" x={730} y={1000} r={150} t={t} color="#FF3A4A" amp={0.1} rate={4} opacity={0.3 * air} />
          <ellipse cx="730" cy="1176" rx="70" ry="16" fill="#2A2228" stroke={K} strokeWidth="7" />
          <path d="M730 1170 V1060" stroke={K} strokeWidth="14" strokeLinecap="round" />
          <path d="M730 1170 V1060" stroke="#8A8288" strokeWidth="5" strokeLinecap="round" />
          <g transform="translate(730 1010) rotate(-12)">
            <rect x="-38" y="-70" width="76" height="120" rx="34" fill="#3A3438" stroke={K} strokeWidth="8" />
            <path d="M-26 -40 H26 M-26 -18 H26 M-26 4 H26" stroke="#8A8288" strokeWidth="4" />
            <path d="M-30 -60 Q-34 -10 -26 30" stroke="#C8C0C4" strokeWidth="4" fill="none" opacity=".5" />
          </g>
        </g>

        {/* PIANO 4 — pila di lettere degli ascoltatori */}
        <g transform={L(1.25)}>
          {Array.from({ length: 7 }, (_, i) => (
            <g key={i} transform={`translate(${180 + (i % 3) * 30} ${1640 - i * 26}) rotate(${(i % 2 ? 1 : -1) * (4 + i)})`}>
              <rect x="-110" y="-40" width="220" height="80" rx="4" fill={i % 2 ? '#F4ECDD' : '#E8D8C0'} stroke={K} strokeWidth="6" />
              <path d="M-110 -40 L0 10 L110 -40" fill="none" stroke="#8A7A6A" strokeWidth="4" />
              <rect x="64" y="-30" width="30" height="22" fill={i % 3 ? '#8A1E3C' : '#3A6A8A'} />
            </g>
          ))}
          <path d="M1280 1500 H860 Q820 1500 820 1540 V2200 H1280 Z" fill="#2A1A14" stroke={K} strokeWidth="10" />
        </g>

        {/* PIANO 5 — lettere che volano dopo la messa in onda, pulviscolo */}
        <g transform={L(1.7)}>
          <g opacity={air}>
            <Flyers t={t - c3} seed={23} n={7} color="#F4ECDD" outline={K} y0={800} y1={1500} speed={0.2} shape="paper" />
          </g>
          <Dust t={t} top={{ y: 600, x0: 680, x1: 900 }} bottom={{ y: 1100, x0: 500, x1: 1000 }} n={18} color="#FFE0D0" boost={-0.3 + 0.3 * air} />
          <NearMotes id="ra-near" t={t} color="#FFE2C0" opacity={0.07} />
          {Array.from({ length: 8 }, (_, i) => {
            const p = mod(t * 0.35 + i / 8, 1);
            return <circle key={i} cx={250 + Math.sin(i * 1.9) * 120} cy={1040 - p * 260} r={4} fill={GOLD} opacity={play * (1 - p) * 0.6} />;
          })}
        </g>
      </g>

      <Finish id="ra" tint={TINT} tintOpacity={0.12} />
    </svg>
  );
};
