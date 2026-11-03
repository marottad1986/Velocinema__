import React from 'react';
import { camera, eio, eo, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, Gulls, NearMotes, SunRays } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K, Parcel, Wings } from './Comuni';

// Il bivio: incrocio di quattro strade sterrate nella pianura del Texas al tramonto; un cartello con le direzioni,
// un furgone con due ali dipinte sul portellone che si allontana; lontano, sulla soglia di un cancello, il pacco consegnato.
// Piani: cielo e sole (0,2) · pianura e cancello (0,4) · strade (0,6) · furgone (0,75) · cartello (1,0) · erba in primo piano (1,25) · polvere (1,6)

const r = rng(2000);
const GRASS = Array.from({ length: 40 }, () => ({ x: r() * 1300 - 110, y: 1500 + r() * 420, h: 30 + r() * 50, ph: r() * 6 }));
const DUST = Array.from({ length: 14 }, () => ({ ph: r(), dy: (r() - 0.5) * 40, s: 0.6 + r() * 0.8 }));

export const Bivio: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const parcel = seg(t, 0.2, 0.9); // il pacco consegnato al cancello
  const note = eo(seg(t, cues[1], cues[1] + 0.6)); // il biglietto sul pacco
  // il furgone arriva da sinistra, si ferma all'incrocio, poi riparte lungo la strada verso l'orizzonte
  const come = eio(seg(t, cues[2] - 0.6, cues[2] + 0.8));
  const leave = eio(seg(t, cues[4] + 1.0, dur + 3));
  const vx = -260 + 730 * come + 900 * leave, vy = 1240, vs = 1;
  const wings = seg(t, cues[3], cues[3] + 0.6); // le ali sul portellone: è lei
  const sun = 1 - 0.3 * seg(t, 0, dur);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="bv" />
        <Lin id="bv-sky" stops={[[0, '#202C58'], [0.46, '#5E4A70'], [0.66, '#D98060'], [0.86, '#FCD58C']]} />
        <Lin id="bv-plain" stops={[[0, '#C99A5C'], [0.4, '#A87A44'], [1, '#6B4A28']]} />
        <Lin id="bv-road" stops={[[0, '#E2B880'], [1, '#C7955A']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo enorme al tramonto */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#bv-sky)" />
          <SunRays id="bv-rays" x={760} y={980 - 60 * sun} t={t} color="#FFE1A8" n={11} length={1200} opacity={0.3} />
          <Glow id="bv-sun" x={760} y={980 - 60 * sun} r={300} t={t} color="#FFE7B8" amp={0.04} rate={1} opacity={0.8} />
          <circle cx="760" cy={980 - 60 * sun} r="66" fill="#FFF0D0" />
          {[[200, 700, 1.2], [700, 620, 0.9], [980, 760, 1]].map(([x, y, s], i) => (
            <ellipse key={i} cx={x + mod(t * 5 + i * 160, 260) - 130} cy={y} rx={180 * s} ry={20 * s} fill="#F6B88A" opacity=".55" />
          ))}
        </g>

        {/* PIANO 1 — pianura piatta, recinto e il cancello lontano con il pacco */}
        <g transform={L(0.4)}>
          <rect x="-200" y="1000" width="1480" height="1200" fill="url(#bv-plain)" />
          <path d="M-200 1000 H1280" stroke="#7A5A34" strokeWidth="4" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-150 + i * 60} 1040 v-28`} stroke="#5A3E22" strokeWidth="5" />)}
          <path d="M-150 1020 H520" stroke="#5A3E22" strokeWidth="3" />
          <g transform="translate(800 1110)">
            {/* cancello di legno con la cassetta delle lettere; sulla soglia il pacco con il biglietto */}
            <path d="M-110 0 V-150 M110 0 V-150" stroke={K} strokeWidth="16" />
            <path d="M-110 0 V-150 M110 0 V-150" stroke="#8B6A43" strokeWidth="9" />
            <path d="M-110 -130 H110 M-110 -70 H110 M-60 -130 L-10 -70 M40 -130 L90 -70" stroke="#6B4E2E" strokeWidth="9" strokeLinecap="round" />
            <rect x="-160" y="-120" width="42" height="30" rx="8" fill="#5D8A5A" stroke={K} strokeWidth="4" />
            <path d="M-139 -90 V0" stroke="#5A3E22" strokeWidth="6" />
            <ellipse cx="0" cy="8" rx="130" ry="12" fill={K} opacity=".2" />
            <g opacity={parcel}>
              <Parcel x={0} y={-48} w={150} h={96} d={40} wings={P.accento} />
              <g transform={`translate(-30 -60) rotate(-8) scale(${note})`}>
                <rect x="-8" y="-26" width="96" height="54" fill="#FFFDF4" stroke={K} strokeWidth="4" />
                <path d="M4 -10 h70 M4 2 h60 M4 14 h66" stroke="#4A4A6A" strokeWidth="3" strokeLinecap="round" />
                <path d="M70 -16 q6 -8 10 0 q4 -8 10 0 q-4 8 -10 12 q-6 -4 -10 -12" fill={P.accento} />
              </g>
            </g>
            <Glow id="bv-parcelg" x={0} y={-50} r={170} t={t} color="#FFE1C8" amp={0.08} rate={2} opacity={0.5 * parcel} />
          </g>
          <path d="M60 1000 l40 -50 l30 50 Z" fill="#5A4A3A" opacity=".6" />
        </g>
        <g transform={L(0.45)}><Gulls t={t} y={800} h={120} color={K} n={2} period={18} /></g>

        {/* PIANO 2 — le quattro strade sterrate che si incrociano */}
        <g transform={L(0.6)}>
          <path d="M500 1000 L580 1000 L900 1920 H180 Z" fill="url(#bv-road)" />
          <path d="M-200 1200 Q540 1160 1280 1210 V1300 Q540 1250 -200 1300 Z" fill="url(#bv-road)" />
          <path d="M540 1000 L540 1920" stroke="#F2D4A0" strokeWidth="6" strokeDasharray="30 40" opacity=".6" />
          <path d="M500 1000 L180 1920 M580 1000 L900 1920" stroke="#8A6236" strokeWidth="4" opacity=".7" />
        </g>

        {/* PIANO 3 — il furgone con le ali sul portellone (accento) e la scia di polvere */}
        <g transform={L(0.75)}>
          {DUST.map((d, i) => {
            const p = mod(t * 0.8 + d.ph, 1);
            const moving = Math.max(seg(t, cues[2] - 0.6, cues[2] + 0.6) * (1 - seg(t, cues[2] + 0.6, cues[2] + 1)), leave > 0 && leave < 1 ? 1 : 0);
            return <circle key={i} cx={vx - 160 * vs - p * 220 * vs} cy={vy - 20 * vs + d.dy * vs - p * 60 * vs} r={(20 + p * 50) * d.s * vs} fill="#E8C896" opacity={(1 - p) * 0.55 * moving} />;
          })}
          <g transform={`translate(${vx} ${vy}) scale(${vs})`}>
            <path d="M-170 0 V-70 Q-170 -84 -150 -84 H40 L70 -150 H150 Q170 -150 170 -130 V0 Z" fill="#E9E2CF" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d="M80 -140 H150 V-96 H62 Z" fill="#3E5A78" stroke={K} strokeWidth="5" />
            {/* portellone posteriore con le due ali dipinte */}
            <g transform="translate(-110 -42)">
              <Glow id="bv-wingg" x={0} y={0} r={110} t={t} color="#FFD3B8" amp={0.08} rate={2.4} opacity={wings} />
              <circle r={60 + 70 * mod(t * 0.8, 1)} fill="none" stroke="#FFE1C8" strokeWidth="6" opacity={wings * (1 - mod(t * 0.8, 1))} />
              <Wings color={P.accento} s={1.2} />
            </g>
            <rect x="-174" y="-30" width="12" height="20" fill="#B5301E" />
            {[-110, 110].map((x) => <g key={x}><circle cx={x} cy="4" r="32" fill="#2A2420" stroke={K} strokeWidth="6" /><circle cx={x} cy="4" r="12" fill="#9A8F80" /></g>)}
            <path d="M-150 -76 H30" stroke="#FFFFFF" strokeWidth="5" opacity=".6" />
          </g>
        </g>

        {/* PIANO 4 — il cartello stradale con le direzioni */}
        <g transform={L(1.0)}>
          <g transform="translate(-40 0)">
          <path d="M300 1330 V880" stroke={K} strokeWidth="18" />
          <path d="M300 1330 V880" stroke="#8B6A43" strokeWidth="10" />
          {[[-1, 920, -6], [1, 990, 5], [-1, 1060, 3]].map(([dir, y, rot], i) => (
            <g key={i} transform={`rotate(${rot + Math.sin(t * 2 + i) * 1.2} 300 ${y})`}>
              <path d={dir > 0 ? `M300 ${y - 26} H470 L500 ${y} L470 ${y + 26} H300 Z` : `M300 ${y - 26} H130 L100 ${y} L130 ${y + 26} H300 Z`} fill="#E9DCC0" stroke={K} strokeWidth="6" strokeLinejoin="round" />
              <path d={dir > 0 ? `M330 ${y} H440` : `M270 ${y} H160`} stroke="#8A7A5C" strokeWidth="6" strokeLinecap="round" />
            </g>
          ))}
          <path d="M290 900 V1300" stroke="#F2D4A0" strokeWidth="3" opacity=".6" />
          </g>
        </g>

        {/* PIANO 5 — erba secca in primo piano che ondeggia */}
        <g transform={L(1.25)}>
          {GRASS.map((g, i) => (
            <path key={i} d={`M${g.x} ${g.y} q${Math.sin(t * 2 + g.ph) * 10} ${-g.h * 0.6} ${Math.sin(t * 2 + g.ph) * 20} ${-g.h}`} fill="none" stroke={i % 3 ? '#8A6A3A' : '#B8925A'} strokeWidth="5" strokeLinecap="round" />
          ))}
          <path d="M-200 1840 Q200 1780 500 1830 V2100 H-200 Z" fill="#5A3E22" />
          <path d="M700 1860 Q960 1800 1280 1840 V2100 H700 Z" fill="#5A3E22" />
        </g>
        <g transform={L(1.6)}><NearMotes id="bv-near" t={t} color="#FFE1A8" n={8} vx={-70} opacity={0.12} /></g>
      </g>
      <Finish id="bv" tint="#F2B85A" tintOpacity={0.1} />
    </svg>
  );
};
