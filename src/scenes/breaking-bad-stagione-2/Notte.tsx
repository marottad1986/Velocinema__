import React from 'react';
import { camera, eio, eo, lerp, mod, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import { SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { BBDefs } from '../breaking-bad-stagione-1/Comuni';
import { BB2Defs, K, Ombra } from './Comuni';

// Walter lascia morire Jane: il corridoio buio dell'appartamento di notte e la porta della camera. Persone mai, nemmeno
// forme sotto le lenzuola: si vedono solo la luce che esce dalla porta, la sponda del letto disfatto, il comodino con la
// lampada, la sveglia e il bicchiere. Eventi: prima frase la porta si apre piano e la lama di luce si allarga sul
// pavimento del corridoio; seconda frase il bicchiere sul comodino si rovescia e la lampada sfarfalla; terza frase la
// luce della stanza cala lentamente fino a spegnersi, resta solo la sveglia rossa che segna l'ora, e la porta si richiude.
// Piani: parete del corridoio e quadro (0,25) · stanza vista dalla porta (0,45) · porta e stipite (0,6)
//        · pavimento del corridoio con la lama di luce (0,8) · mobiletto e scarpa in primo piano (1,2) · pulviscolo (1,6)

export const Notte: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tOpen = griglia(cues[0] + 0.6);
  const tGlass = griglia(cues[1] + 1.4);
  const tDim = griglia(cues[2] + 0.8);
  const open = eio(seg(t, tOpen, tOpen + 2.2)) * (1 - eio(seg(t, tDim + 1.6, dur - 0.1)) * 0.75);
  const gap = lerp(70, 300, open);
  const flick = t > tGlass && t < tGlass + 1.2 ? (Math.sin(t * 50) > 0.3 ? 0.55 : 1) : 1;
  const dim = 1 - eo(seg(t, tDim, tDim + 1.8));
  const lamp = flick * lerp(0.08, 1, dim);
  const tip = eo(seg(t, tGlass, tGlass + 0.35));
  const spill = seg(t, tGlass + 0.3, tGlass + 1.5);
  const DX = 400; // stipite sinistro della porta

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="no" />
        <BBDefs id="no" />
        <BB2Defs id="no" />
        <Lin id="no-wall" x2={1} y2={0} stops={[[0, '#0A0E1A'], [0.5, '#141A2C'], [1, '#0A0C16']]} />
        <Lin id="no-room" stops={[[0, '#6A4A2E'], [0.6, '#A8784A'], [1, '#5A3A22']]} />
        <Lin id="no-sheet" stops={[[0, '#F2EEE6'], [1, '#B8B0A4']]} />
        <Lin id="no-floor" stops={[[0, '#1A1A24'], [1, '#08080C']]} />
        <linearGradient id="no-blade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFD890" stopOpacity=".75" /><stop offset="1" stopColor="#FFD890" stopOpacity="0" /></linearGradient>
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — parete del corridoio, buia, con un quadro e un interruttore (0,25) */}
        <g transform={`${L(0.25)} translate(0 70)`}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#no-wall)" />
          <rect x="80" y="760" width="160" height="200" fill="#1E2436" stroke={K} strokeWidth="7" />
          <path d="M100 930 L150 850 L190 900 L220 860" stroke="#3A4466" strokeWidth="6" fill="none" />
          <rect x="300" y="900" width="30" height="46" rx="4" fill="#2A3044" stroke={K} strokeWidth="3" />
          <path d="M-200 1220 H1280" stroke="#05060A" strokeWidth="18" />
        </g>

        {/* PIANO 1 — la camera vista dalla porta: parete calda, comodino con lampada, sveglia e bicchiere, sponda del letto (0,45) */}
        <g transform={`${L(0.45)} translate(0 70)`}>
          <clipPath id="no-clip"><rect x={DX} y={600} width={gap} height={620} /></clipPath>
          <g clipPath="url(#no-clip)">
            <rect x={DX - 100} y="580" width="600" height="660" fill="url(#no-room)" />
            <rect x={DX - 100} y="580" width="600" height="660" fill="#05060A" opacity={1 - lamp * 0.95} />
            {/* comodino */}
            <g transform={`translate(${DX + 120} 1100)`}>
              <rect x="-80" y="-120" width="160" height="120" fill="#6A4428" stroke={K} strokeWidth="7" />
              <path d="M-70 -70 H70" stroke={K} strokeWidth="4" />
              {/* lampada da comodino */}
              <path d="M0 -120 V-200" stroke="#3A2A1A" strokeWidth="8" />
              <path d="M-50 -200 L-34 -270 H34 L50 -200 Z" fill="#F2D8A0" stroke={K} strokeWidth="6" opacity={0.4 + 0.6 * lamp} />
              <Glow id="no-lampg" x={0} y={-230} r={300} t={t} color="#FFC870" amp={0.04} rate={2} opacity={0.75 * lamp} />
              {/* sveglia digitale */}
              <rect x="-74" y="-160" width="62" height="40" rx="6" fill="#1A1A1A" stroke={K} strokeWidth="4" />
              <text x="-43" y="-131" textAnchor="middle" fontFamily={SANS} fontWeight="800" fontSize="24" fill="#FF3A2A">3:12</text>
              <Glow id="no-clock" x={-43} y={-140} r={60} t={t} color="#FF3A2A" amp={0.05} rate={1} opacity={0.5} />
              {/* bicchiere che si rovescia */}
              <g transform={`translate(44 -120) rotate(${tip * 88})`}>
                <path d="M-14 0 L-18 -50 H18 L14 0 Z" fill="#C8DCE4" fillOpacity=".45" stroke={K} strokeWidth="4" />
              </g>
              {spill > 0 && <ellipse cx={90} cy={-118} rx={20 + 50 * spill} ry="6" fill="#9AC8E0" opacity=".7" />}
              {spill > 0.3 && Array.from({ length: 3 }, (_, k) => { const p = mod(t * 1.5 + k / 3, 1); return <circle key={k} cx={84} cy={-110 + p * 110} r="4" fill="#9AC8E0" opacity={1 - p} />; })}
            </g>
            {/* sponda del letto disfatto (solo lenzuola e coperta, nessuna forma) */}
            <g transform={`translate(${DX + 200} 1160)`}>
              <rect x="0" y="-160" width="420" height="160" fill="#4A3020" stroke={K} strokeWidth="7" />
              <path d="M-10 -170 Q60 -230 140 -200 Q220 -240 300 -196 Q380 -220 440 -180 V-60 Q300 -40 160 -70 Q60 -50 -10 -80 Z" fill="url(#no-sheet)" stroke={K} strokeWidth="6" />
              <path d="M40 -170 Q120 -150 200 -180 M80 -110 Q200 -90 300 -120" stroke="#9A928A" strokeWidth="4" fill="none" />
              <path d="M200 -70 Q260 -10 330 0" stroke="url(#no-sheet)" strokeWidth="30" fill="none" />
              <rect x="0" y="-160" width="420" height="160" fill="#05060A" opacity={1 - lamp * 0.9} />
            </g>
          </g>
        </g>

        {/* PIANO 2 — la porta che si apre verso l'interno e lo stipite (0,6) */}
        <g transform={`${L(0.6)} translate(0 70)`}>
          <rect x={DX - 30} y="580" width="30" height="660" fill="#1E2232" stroke={K} strokeWidth="6" />
          <rect x={DX + 380} y="580" width="30" height="660" fill="#1E2232" stroke={K} strokeWidth="6" />
          <rect x={DX - 30} y="560" width="440" height="30" fill="#1E2232" stroke={K} strokeWidth="6" />
          {/* anta: da gap in poi, in prospettiva */}
          <path d={`M${DX + gap} 600 L${DX + 380} ${600 + (1 - open) * 0 - 30 * open} V${1220 + 30 * open} L${DX + gap} 1220 Z`} fill="#2A2E40" stroke={K} strokeWidth="7" />
          <circle cx={DX + gap + 26} cy="920" r="10" fill="#8A7A5A" />
          <path d={`M${DX + gap} 600 V1220`} stroke="#FFD890" strokeWidth="4" opacity={0.6 * lamp} />
        </g>

        {/* PIANO 3 — pavimento del corridoio con la lama di luce che esce dalla porta (0,8) */}
        <g transform={`${L(0.8)} translate(0 70)`}>
          <rect x="-200" y="1220" width="1480" height="900" fill="url(#no-floor)" />
          {Array.from({ length: 8 }, (_, k) => <path key={k} d={`M${-200 + k * 190} 1220 L${-500 + k * 260} 2000`} stroke="#14141E" strokeWidth="4" />)}
          <path d={`M${DX} 1220 L${DX + gap} 1220 L${DX + gap * 2.4 + 300} 1900 L${DX - 160} 1900 Z`} fill="url(#no-blade)" opacity={lamp} />
          <Ombra id="no" x={DX + 190} y={1226} rx={260} ry={12} opacity={0.5} />
        </g>

        {/* PIANO 4 — mobiletto dell'ingresso e una scarpa da ginnastica in primo piano (1,2) */}
        <g transform={L(1.2)}>
          {/* mobiletto dell'ingresso con un vaso e un mazzo di chiavi */}
          <g transform="translate(60 1900)">
            <rect x="-260" y="-300" width="420" height="300" fill="#1E1A22" stroke={K} strokeWidth="9" />
            <path d="M-250 -180 H150 M-50 -300 V0" stroke="#100C12" strokeWidth="6" />
            <path d="M40 -300 Q20 -380 60 -420 Q100 -380 80 -300 Z" fill="#3A4A6A" stroke={K} strokeWidth="6" />
            <path d="M60 -420 Q50 -500 30 -540 M60 -420 Q80 -490 110 -520" stroke="#3A5A3A" strokeWidth="6" fill="none" />
            <circle cx="-120" cy="-310" r="16" fill="none" stroke="#8A8A7A" strokeWidth="5" />
            <path d="M-120 -296 l20 14 m-8 -24 l24 6" stroke="#8A8A7A" strokeWidth="5" />
          </g>
          <g transform="translate(860 1860) rotate(-8)">
            <path d="M-90 0 Q-90 -50 -40 -56 L40 -60 Q100 -40 100 0 Z" fill="#E8E8E0" stroke={K} strokeWidth="7" />
            <path d="M-90 0 H100" stroke="#C83A2A" strokeWidth="10" />
            <path d="M-20 -54 l20 30 m10 -32 l16 28" stroke="#9A9A92" strokeWidth="4" />
          </g>
        </g>

        {/* PIANO 5 — pulviscolo nella lama di luce e particelle vicine (1,6) */}
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 700, x0: DX, x1: DX + gap }} bottom={{ y: 1500, x0: DX - 100, x1: DX + gap * 2 }} seed={29} n={22} color="#FFE8C0" />
          <NearMotes id="no-near" t={t} color="#8A9AC8" n={6} r0={70} r1={150} opacity={0.08} />
        </g>
      </g>
      <Finish id="no" tint="#142235" tintOpacity={0.14} />
    </svg>
  );
};
