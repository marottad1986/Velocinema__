import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes, Notes, Stars } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K, Mangianastri, ORANGE, TINT_NIGHT } from './Comune';

// L'ultima canzone insieme: cantina di sera con una tastiera, un registratore a cassette, due sedie, una valigia pronta,
// una cartolina di Hollywood (palme al tramonto) appesa; da una finestrella alta passa un aereo.
// Piani: muro di mattoni e finestrella (0,25) · scaffali, cartolina, bicicletta (0,45) · tavolo con tastiera e
//        registratore, sedie, valigia (0,7) · scala e cavi in primo piano (1,2) · pulviscolo nella luce (1,7)
// Eventi: cues[1] un aereo attraversa la finestrella e la cartolina si illumina · cues[2] il registratore va in REC
//         e salgono le note · cues[3] il foglio con la riga della firma resta vuoto; una sedia si allontana dal tavolo
//         · cues[4] sul foglio si accende soltanto un nome.

const r = rng(883);
const BRICKS = Array.from({ length: 120 }, (_, i) => ({ x: (i % 12) * 110 - 200 + (Math.floor(i / 12) % 2) * 55, y: 120 + Math.floor(i / 12) * 60, c: r() }));

export const Cantina: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c1 = cues[1] ?? 3.4, c2 = cues[2] ?? 5.9, c3 = cues[3] ?? 9.8, c4 = cues[4] ?? 11.4;
  const plane = seg(t, c1, c1 + 3);
  const card = eob(seg(t, c1 + 0.6, c1 + 1.1));
  const rec = seg(t, c2, c2 + 0.2);
  const sheet = eo(seg(t, c3, c3 + 0.6));
  const chair = eo(seg(t, c3 + 0.4, c3 + 1.6));
  const name = eob(seg(t, c4 + 0.2, c4 + 0.7));
  const sway = Math.sin(t * 1.3) * 3;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ct" />
        <Lin id="ct-wall" stops={[[0, '#1A1418'], [0.4, '#2E2226'], [0.75, '#3A2A2A'], [1, '#221A1A']]} />
        <Lin id="ct-floor" stops={[[0, '#3A3030'], [0.5, '#2A2222'], [1, '#141012']]} />
        <Lin id="ct-table" stops={[[0, '#7A5A3E'], [1, '#3A2818']]} />
        <Lin id="ct-night" stops={[[0, '#0E1230'], [1, '#2A2A5A']]} />
        <Lin id="ct-card" stops={[[0, '#F2A23A'], [0.6, '#E8606A'], [1, '#6A3A7A']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — muro di mattoni e finestrella alta con il cielo di notte */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1600" fill="url(#ct-wall)" />
          <g opacity=".35">
            {BRICKS.map((b, i) => <rect key={i} x={b.x} y={b.y + 500} width="100" height="50" rx="4" fill={b.c > 0.5 ? '#4A3030' : '#3A2626'} />)}
          </g>
          <rect x="700" y="620" width="240" height="120" fill="url(#ct-night)" />
          <Stars t={t} seed={3} n={10} x={705} y={625} w={230} h={110} color="#E8E0F0" size={0.7} />
          {plane > 0 && plane < 1 && (
            <g transform={`translate(${lerp(960, 680, plane)} ${lerp(700, 650, plane)})`}>
              <path d="M-20 0 H20 M0 -6 L-8 8 M0 6 L-8 -8" stroke="#E8E0F0" strokeWidth="3" />
              <circle cx="20" cy="0" r="3" fill="#FF4A4A" opacity={Math.sin(t * 12) > 0 ? 1 : 0.2} />
            </g>
          )}
          <rect x="700" y="620" width="240" height="120" fill="none" stroke={K} strokeWidth="10" />
          <path d="M820 620 V740 M700 680 H940" stroke={K} strokeWidth="6" />
        </g>

        {/* PIANO 1 — scaffale con scatoloni, cartolina appesa, bicicletta */}
        <g transform={L(0.45)}>
          <path d="M60 700 H400 M60 820 H400" stroke="#5A4232" strokeWidth="12" />
          {[[80, 640, 90, 60, '#8A6A4A'], [190, 660, 70, 40, '#6A5A4A'], [280, 630, 100, 70, '#9A7A54'], [100, 760, 120, 60, '#7A5A3E']].map(([x, y, w, h, c], i) => (
            <rect key={i} x={x as number} y={y as number} width={w as number} height={h as number} fill={c as string} stroke={K} strokeWidth="5" />
          ))}
          {/* cartolina con le palme al tramonto */}
          <g transform="translate(420 940) rotate(-5)">
            <Glow id="ct-cardg" x={0} y={0} r={140} t={t} color={ORANGE} amp={0.1} rate={3} opacity={0.5 * card} />
            <rect x="-80" y="-56" width="160" height="112" rx="4" fill="url(#ct-card)" stroke={K} strokeWidth="6" />
            <circle cx="20" cy="10" r="24" fill="#FFE8B0" opacity=".9" />
            <path d="M-50 56 Q-46 0 -40 -20 M50 56 Q46 0 40 -24" stroke={K} strokeWidth="6" fill="none" />
            <path d="M-40 -20 q-30 -6 -36 10 M-40 -20 q30 -10 30 8 M-40 -20 q-6 -24 -24 -24 M40 -24 q-30 -6 -36 10 M40 -24 q30 -10 30 8 M40 -24 q6 -24 24 -24" stroke={K} strokeWidth="5" fill="none" />
            <circle cx="0" cy="-48" r="6" fill="#C8303A" stroke={K} strokeWidth="3" />
          </g>
          {/* bicicletta appoggiata al muro */}
          <g transform="translate(920 1010)" opacity=".9">
            <circle cx="-70" cy="0" r="56" fill="none" stroke={K} strokeWidth="8" />
            <circle cx="70" cy="0" r="56" fill="none" stroke={K} strokeWidth="8" />
            <path d="M-70 0 L-20 -80 H50 L70 0 M-20 -80 L0 0 L50 -80 M-30 -96 H0 M50 -80 L44 -110 H70" stroke="#3A6A8A" strokeWidth="8" fill="none" strokeLinejoin="round" />
          </g>
        </g>

        {/* PIANO 2 — pavimento, tavolo con tastiera, registratore, foglio; sedie; valigia */}
        <g transform={L(0.7)}>
          <rect x="-200" y="1080" width="1480" height="900" fill="url(#ct-floor)" />
          <path d="M-200 1080 H1280" stroke={K} strokeWidth="8" />
          {/* lampadina appesa */}
          <g transform={`rotate(${sway} 540 520)`}>
            <path d="M540 520 V830" stroke={K} strokeWidth="4" />
            <Glow id="ct-bulb" x={540} y={850} r={420} t={t} color="#FFD98A" amp={0.04} rate={2} opacity={0.55} />
            <circle cx="540" cy="850" r="20" fill="#FFF3CF" stroke={K} strokeWidth="4" />
          </g>
          {/* tavolo */}
          <path d="M150 1170 L140 1290 M930 1170 L940 1290" stroke={K} strokeWidth="16" strokeLinecap="round" />
          <path d="M100 1110 H980 L1000 1170 H80 Z" fill="url(#ct-table)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M110 1118 H970" stroke="#C89A6A" strokeWidth="4" opacity=".6" />
          {/* tastiera */}
          <g transform="translate(330 1105)">
            <rect x="-200" y="-60" width="400" height="60" rx="8" fill="#2A2630" stroke={K} strokeWidth="7" />
            <rect x="-186" y="-34" width="372" height="28" fill="#F4ECDD" stroke={K} strokeWidth="3" />
            {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M${-186 + (i + 1) * 16.9} -34 V-6`} stroke="#8A7A70" strokeWidth="2" />)}
            {Array.from({ length: 22 }, (_, i) => ([1, 2, 4, 5, 6].includes(i % 7) ? <rect key={i} x={-186 + i * 16.9 - 5} y="-34" width="10" height="16" fill={K} /> : null))}
            {[0, 1, 2, 3].map((i) => <circle key={i} cx={-160 + i * 26} cy="-48" r="6" fill={i === 1 ? ORANGE : '#8A8692'} />)}
          </g>
          {/* registratore a cassette */}
          <g transform="translate(700 1060)">
            <Glow id="ct-rec" x={104} y={-62} r={60} t={t} color="#FF4A3A" amp={0.2} rate={5} opacity={0.6 * rec} />
            <Mangianastri x={0} y={0} s={0.55} t={t} play={rec} />
          </g>
          {/* foglio con la riga della firma */}
          <g transform="translate(560 1140) rotate(-3)">
            <Glow id="ct-sheet" x={0} y={0} r={130} t={t} color="#FFE7A0" amp={0.05} rate={2} opacity={0.4 * sheet} />
            <path d="M-80 -18 H80 L70 18 H-90 Z" fill="#F4ECDD" stroke={K} strokeWidth="4" strokeLinejoin="round" />
            <path d="M-66 -8 H50" stroke="#6A5A5A" strokeWidth="3" />
            <path d="M-70 8 H-10 M6 8 H62" stroke={K} strokeWidth="2" strokeDasharray="5 4" opacity={0.4 + 0.6 * sheet} />
            <path d="M-66 4 q10 -10 18 0 t18 -2 t16 2" stroke={ORANGE} strokeWidth="3" fill="none" opacity={name} />
          </g>
          {/* sedie: una resta, l'altra si allontana */}
          {[[200, 0], [640, chair]].map(([x, k], i) => (
            <g key={i} transform={`translate(${(x as number) + (k as number) * 120} 1300)`}>
              <path d="M-50 0 V-150 M50 0 V-90 M-50 -90 H50 M-50 -150 H-40" stroke={K} strokeWidth="12" strokeLinecap="round" />
              <path d="M-56 -96 H56" stroke="#7A5A3E" strokeWidth="14" strokeLinecap="round" />
            </g>
          ))}
          {/* valigia pronta */}
          <g transform="translate(980 1260)">
            <rect x="-90" y="-140" width="180" height="140" rx="14" fill="#8A3A2A" stroke={K} strokeWidth="8" />
            <path d="M-30 -140 V-164 H30 V-140" fill="none" stroke={K} strokeWidth="8" />
            <path d="M-90 -80 H90" stroke="#5A2218" strokeWidth="6" />
            <rect x="-60" y="-120" width="40" height="28" rx="4" fill="#F4ECDD" stroke={K} strokeWidth="3" transform="rotate(-8 -40 -106)" />
          </g>
          <Notes t={t - c2} x={700} y={1000} n={6} spread={300} rise={340} color={ORANGE} outline={K} size={0.85 * rec} speed={0.24} />
        </g>

        {/* PIANO 3 — scala di legno e cavi in primo piano */}
        <g transform={L(1.2)}>
          <path d="M-200 1420 L180 2200 H-200 Z" fill="#2A1E16" stroke={K} strokeWidth="10" />
          {[1500, 1620, 1740, 1860].map((y, i) => <path key={i} d={`M-200 ${y} L${-200 + (y - 1420) * 0.49} ${y}`} stroke="#5A4232" strokeWidth="10" />)}
          <path d="M480 1500 C600 1580 700 1480 900 1600 S1100 1700 1300 1640" stroke={K} strokeWidth="12" fill="none" />
          <path d="M480 1500 C600 1580 700 1480 900 1600 S1100 1700 1300 1640" stroke="#3A3036" strokeWidth="5" fill="none" />
        </g>
        <g transform={L(1.7)}>
          <Dust t={t} top={{ y: 860, x0: 500, x1: 580 }} bottom={{ y: 1300, x0: 250, x1: 830 }} n={22} color="#FFF0C8" boost={-0.2} />
          <NearMotes id="ct-near" t={t} color="#FFE2B0" opacity={0.07} />
        </g>
      </g>

      <Finish id="ct" tint={TINT_NIGHT} tintOpacity={0.12} />
    </svg>
  );
};
