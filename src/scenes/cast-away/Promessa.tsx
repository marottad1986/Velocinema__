import React from 'react';
import { camera, eo, eob, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, GlassDrops, NearMotes, StringLights } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K, PocketWatch } from './Comuni';

// La promessa di Natale: interno di un'auto ferma all'aeroporto, sera di Natale con neve leggera;
// sul cruscotto l'orologio da tasca che si apre con la foto e la scatolina regalo; fuori l'aereo cargo in pista.
// Piani: cielo (0,2) · terminal e luci (0,35) · pista e aereo (0,5) · neve lontana (0,6) · parabrezza e cruscotto (1,1) · neve vicina (1,6)

const r = rng(2412);
const SNOW = Array.from({ length: 70 }, () => ({ x: r() * 1300 - 110, y: r() * 1300, s: 2 + r() * 4, v: 30 + r() * 40, ph: r() * 6 }));
const SNOW_NEAR = Array.from({ length: 14 }, () => ({ x: r() * 1300 - 110, y: r() * 1900, s: 9 + r() * 10, v: 90 + r() * 80, ph: r() * 6 }));
const RUNWAY = Array.from({ length: 14 }, (_, i) => i);

export const Promessa: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const watch = eo(seg(t, cues[1] + 0.3, cues[1] + 1.4)); // l'orologio si apre: dentro la foto
  const gift = eob(seg(t, cues[2], cues[2] + 0.6), 2.2); // la scatolina con il fiocco
  const plane = seg(t, cues[3], dur); // l'aereo comincia a muoversi: lui parte

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pm" />
        <Lin id="pm-sky" stops={[[0, '#070F1C'], [0.35, '#122540'], [0.55, '#25405F'], [0.62, '#3A5577']]} />
        <Lin id="pm-ground" stops={[[0, '#2B3E52'], [1, '#121E2B']]} />
        <Lin id="pm-dash" stops={[[0, '#2A2420'], [0.4, '#1B1714'], [1, '#0C0A09']]} />
        <Lin id="pm-glass" stops={[[0, '#FFFFFF', 0.08], [1, '#FFFFFF', 0]]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo notturno */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#pm-sky)" />
          <Glow id="pm-city" x={540} y={1060} r={700} t={t} color="#F2B36B" amp={0.03} rate={0.6} opacity={0.22} />
        </g>

        {/* PIANO 1 — terminal con luci di Natale e torre di controllo */}
        <g transform={L(0.35)}>
          <path d="M840 1000 V720 H880 L900 680 H960 L980 720 H1010 V1000 Z" fill="#1A2B3F" />
          <rect x="890" y="690" width="80" height="26" fill="#FFE2A0" opacity={0.6 + 0.2 * Math.sin(t * 2)} />
          <Glow id="pm-tower" x={930} y={700} r={90} t={t} color="#FFE2A0" amp={0.08} rate={1.5} opacity={0.5} />
          <circle cx="930" cy="672" r="7" fill="#FF5A4A" opacity={mod(t, 1.4) < 0.4 ? 1 : 0.2} />
          <rect x="-200" y="880" width="1080" height="120" fill="#1E3248" />
          {Array.from({ length: 16 }, (_, i) => <rect key={i} x={-180 + i * 64} y="900" width="40" height="44" fill="#F5D38E" opacity={0.35 + 0.35 * ((i * 7) % 3 === 0 ? 1 : 0.5)} />)}
          <StringLights id="pm-xmas" t={t} from={{ x: -200, y: 872 }} to={{ x: 860, y: 872 }} n={18} sag={26} colors={['#F2C14E', '#E4572E', '#7FD1B9', '#F4F1E8']} wire="#0E1A26" r={7} />
        </g>

        {/* PIANO 2 — pista con luci e aereo cargo (luci di posizione) */}
        <g transform={L(0.5)}>
          <rect x="-200" y="1000" width="1480" height="400" fill="url(#pm-ground)" />
          <path d="M-200 1000 H1280" stroke="#3E5670" strokeWidth="4" />
          {RUNWAY.map((i) => (
            <g key={i}>
              <circle cx={-160 + i * 100} cy={1060} r="6" fill="#7FD1FF" />
              <Glow id={`pm-rw${i}`} x={-160 + i * 100} y={1060} r={30} t={t} color="#7FD1FF" amp={0.2} rate={2} ph={i} opacity={0.6} />
            </g>
          ))}
          <g transform={`translate(${380 + plane * 160} 1010)`}>
            {/* fusoliera e ali (aereo cargo, nessun marchio) */}
            <path d="M-260 -10 Q-280 -40 -230 -46 H200 Q260 -44 280 -20 Q260 0 200 4 H-230 Z" fill="#C8D2DC" stroke={K} strokeWidth="6" />
            <path d="M-40 -14 L-150 60 H-100 L40 -10 Z" fill="#AEBBC7" stroke={K} strokeWidth="5" />
            <path d="M-200 -44 L-250 -120 H-210 L-150 -44 Z" fill="#AEBBC7" stroke={K} strokeWidth="5" />
            {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-150 + i * 40} y="-36" width="16" height="12" rx="3" fill="#FFE2A0" />)}
            <rect x="215" y="-36" width="34" height="14" rx="4" fill="#BFE4FF" />
            <circle cx="-240" cy="-118" r="6" fill="#FF5A4A" opacity={mod(t, 1) < 0.3 ? 1 : 0.15} />
            <Glow id="pm-nav" x={-240} y={-118} r={50} t={t} color="#FF5A4A" amp={0} opacity={mod(t, 1) < 0.3 ? 0.7 : 0} />
            <circle cx="-150" cy="58" r="5" fill="#7CFF8A" />
          </g>
        </g>

        {/* PIANO 3 — neve lontana */}
        <g transform={L(0.6)}>
          {SNOW.map((s, i) => (
            <circle key={i} cx={s.x + Math.sin(t + s.ph) * 14} cy={mod(s.y + t * s.v, 1300) - 100} r={s.s} fill="#EAF2F8" opacity=".75" />
          ))}
        </g>

        {/* PIANO 4 — montante del parabrezza, gocce, cruscotto con orologio e regalo */}
        <g transform={L(1.1)}>
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#pm-glass)" />
          <GlassDrops t={t} x={0} y={560} w={1080} h={620} seed={24} n={12} color="#CFE3EE" />
          <path d="M-200 -200 H-40 L120 1200 H-200 Z" fill="#0A0807" />
          <path d="M1280 -200 H1120 L960 1200 H1280 Z" fill="#0A0807" />
          <path d="M-40 -200 L120 1200 M1120 -200 L960 1200" stroke="#3A2E26" strokeWidth="10" />
          {/* cruscotto */}
          <path d="M-200 1090 Q540 1020 1280 1090 V2200 H-200 Z" fill="url(#pm-dash)" stroke={K} strokeWidth="8" />
          <path d="M-200 1096 Q540 1026 1280 1096" fill="none" stroke="#6E5A48" strokeWidth="4" />
          {/* bagliore caldo sul cruscotto */}
          <Glow id="pm-warm" x={360} y={1150} r={300} t={t} color="#FFC57A" amp={0.06} rate={1.6} opacity={0.25 + 0.3 * watch} />
          <PocketWatch x={250} y={1170} s={1.25} open={watch} t={t + 3600 * 9} />
          {/* scatolina regalo con fiocco (accento) */}
          <g transform={`translate(830 ${1160}) scale(${0.3 + 1.0 * gift})`} opacity={seg(t, cues[2], cues[2] + 0.2)}>
            <ellipse cx="0" cy="58" rx="90" ry="14" fill="#000" opacity=".35" />
            <rect x="-70" y="-30" width="140" height="90" rx="8" fill="#F4EFE2" stroke={K} strokeWidth="7" />
            <rect x="-80" y="-56" width="160" height="34" rx="8" fill="#FFFFFF" stroke={K} strokeWidth="7" />
            <path d="M0 -56 V60" stroke={P.accento} strokeWidth="18" />
            <path d="M0 -58 Q-60 -110 -50 -70 Q-40 -50 0 -58 Q60 -110 50 -70 Q40 -50 0 -58" fill={P.accento} stroke={K} strokeWidth="5" />
            <Glow id="pm-gift" x={0} y={-40} r={120} t={t} color="#FFD7B8" amp={0.1} rate={2.4} opacity={0.35} />
          </g>
          {/* rametto di agrifoglio e cartellino */}
          <path d="M560 1250 q30 -40 70 -20 q-10 30 -70 20 Z M600 1240 q40 -10 60 20 q-40 10 -60 -20 Z" fill="#2F6B4A" stroke={K} strokeWidth="4" />
          <circle cx="600" cy="1238" r="9" fill="#C8321F" stroke={K} strokeWidth="3" />
        </g>

        {/* PIANO 5 — fiocchi vicini, grandi e sfumati */}
        <g transform={L(1.6)}>
          {SNOW_NEAR.map((s, i) => (
            <circle key={i} cx={s.x + Math.sin(t * 0.8 + s.ph) * 30} cy={mod(s.y + t * s.v, 1900)} r={s.s} fill="#F4F8FB" opacity=".35" />
          ))}
          <NearMotes id="pm-near" t={t} color="#FFE2B8" n={5} opacity={0.08} />
        </g>
      </g>
      <Finish id="pm" tint="#3B4C66" tintOpacity={0.12} />
    </svg>
  );
};
