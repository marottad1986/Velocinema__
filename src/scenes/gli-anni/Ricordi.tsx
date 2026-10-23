import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Fireflies, Glow, NearMotes, ShootingStar, Smoke, Stars } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K, Motorino, ORANGE, TINT_DAY } from './Comune';

// Quando eravamo ragazzi: garage aperto su un cortile d'estate al tramonto. Un motorino con il casco, una vecchia
// televisione accesa (solo colori e righe, nessun personaggio), poster generici, un salvadanaio, lucciole nel cortile.
// Piani: cielo e cortile (0,25) · case di fronte (0,35) · garage: pareti, poster, scaffale (0,55) · motorino e televisione
//        (0,75) · cornice della porta del garage e attrezzi (1,2) · lucciole e pulviscolo (1,6)
// Eventi: cues[1] il motorino accende il faro e sbuffa · cues[2] la televisione si accende · cues[3] il salvadanaio
//         si illumina, poche monete · cues[4] il cielo si apre di stelle (il futuro enorme).

const r = rng(1980);
const COINS = Array.from({ length: 5 }, () => ({ dx: (r() - 0.5) * 60, ph: r() }));

export const Ricordi: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c1 = cues[1] ?? 3.8, c2 = cues[2] ?? 5.7, c3 = cues[3] ?? 8.7, c4 = cues[4] ?? 11.4;
  const lamp = eo(seg(t, c1, c1 + 0.4));
  const tv = seg(t, c2, c2 + 0.25);
  const piggy = eob(seg(t, c3, c3 + 0.5));
  const sky = eo(seg(t, c4, c4 + 2));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ri" />
        <Lin id="ri-sky" stops={[[0, '#2A2458'], [0.45, '#8A4A7A'], [0.75, '#F2906A'], [1, '#FFC880']]} />
        <Lin id="ri-wall" stops={[[0, '#2A2024'], [0.5, '#3E2E2E'], [1, '#2A1E1C']]} />
        <Lin id="ri-floor" stops={[[0, '#5A4A40'], [1, '#1E1814']]} />
        <Lin id="ri-yard" stops={[[0, '#6A6A3A'], [1, '#3A3A22']]} />
        <Lin id="ri-night" stops={[[0, '#0E1030'], [0.6, '#1E2250'], [1, '#3A2A5A']]} />
        <Lin id="ri-tv" stops={[[0, '#7AD0FF'], [0.3, '#F2A23A'], [0.6, '#E86A8A'], [1, '#7AD06A']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo al tramonto che alla fine si apre di stelle (calmo in alto per il titolo) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#ri-sky)" />
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#ri-night)" opacity={0.9 * sky} />
          <g opacity={sky}>
            <Stars t={t} seed={44} n={40} x={160} y={600} w={760} h={330} color="#FFF3E0" size={1.8} />
            <ShootingStar id="ri-shoot" t={t} at={c4 + 1} from={{ x: 860, y: 620 }} to={{ x: 300, y: 820 }} color="#FFF3E0" />
          </g>
          <Glow id="ri-sun" x={540} y={1000} r={lerp(380, 520, sky)} t={t} color="#FFD890" amp={0.03} rate={1} opacity={0.6} />
          <rect x="-200" y="1010" width="1480" height="300" fill="url(#ri-yard)" />
        </g>
        {/* PIANO 1 — case di fronte con un'antenna e i panni stesi */}
        <g transform={L(0.35)}>
          <path d="M80 1010 V820 L200 760 L320 820 V1010 Z M640 1010 V800 H900 V1010 Z" fill="#4A3048" />
          {[[120, 860], [250, 860], [690, 840], [790, 840], [690, 920], [790, 920]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="36" height="40" fill="#FFD27A" opacity={0.3 + 0.5 * seg(t, 2 + i, 2.3 + i)} />
          ))}
          <path d="M840 800 V740 M820 750 H860 M826 762 H854" stroke="#4A3048" strokeWidth="5" />
          <path d={`M320 880 Q480 ${910 + Math.sin(t) * 4} 640 880`} stroke="#2A1E2A" strokeWidth="3" fill="none" />
          {[380, 450, 540].map((x, i) => (
            <rect key={i} x={x} y={896 + Math.sin(t * 1.5 + i) * 3} width={40} height={50} fill={['#E8E0D8', '#7AB0E0', '#F2A23A'][i]} opacity=".8" transform={`rotate(${Math.sin(t * 1.2 + i) * 4} ${x + 20} 896)`} />
          ))}
        </g>

        {/* PIANO 2 — interno del garage: pareti laterali, poster, scaffale con salvadanaio */}
        <g transform={L(0.55)}>
          <path d="M-200 560 H160 L160 1180 L-200 1300 Z" fill="url(#ri-wall)" stroke={K} strokeWidth="8" />
          <path d="M1280 560 H920 L920 1180 L1280 1300 Z" fill="url(#ri-wall)" stroke={K} strokeWidth="8" />
          <path d="M-200 1300 L160 1180 H920 L1280 1300 V2200 H-200 Z" fill="url(#ri-floor)" stroke={K} strokeWidth="8" />
          {/* poster generici */}
          <g transform="translate(40 760) rotate(-3)">
            <rect x="-70" y="-90" width="140" height="180" fill="#2F6EA6" stroke={K} strokeWidth="6" />
            <circle cx="0" cy="-20" r="40" fill="#F2A23A" />
            <path d="M-50 60 H50" stroke="#F4ECDD" strokeWidth="10" />
          </g>
          <g transform="translate(1010 740) rotate(4)">
            <rect x="-70" y="-90" width="140" height="180" fill="#C8303A" stroke={K} strokeWidth="6" />
            <path d="M-40 40 L0 -60 L40 40 Z" fill="#F4ECDD" opacity=".85" />
          </g>
          {/* scaffale con il salvadanaio */}
          <path d="M860 960 H1100" stroke="#6A4A32" strokeWidth="12" />
          <g transform="translate(930 950)">
            <Glow id="ri-pig" x={0} y={-30} r={130} t={t} color={ORANGE} amp={0.1} rate={3} opacity={0.6 * piggy} />
            <ellipse cx="0" cy="-34" rx="48" ry="34" fill="#F2A0B8" stroke={K} strokeWidth="6" />
            <path d="M-20 -66 h24" stroke={K} strokeWidth="5" />
            <circle cx="38" cy="-36" r="10" fill="#E88AA8" stroke={K} strokeWidth="4" />
            <path d="M-30 0 V-6 M24 0 V-6" stroke={K} strokeWidth="7" />
            {COINS.map((c, i) => {
              const p = mod((t - c3) * 0.6 + c.ph, 1);
              return t > c3 ? <circle key={i} cx={c.dx} cy={-80 - p * 120} r="9" fill={ORANGE} stroke={K} strokeWidth="3" opacity={(1 - p) * piggy} /> : null;
            })}
          </g>
        </g>

        {/* PIANO 3 — motorino e televisione su una cassetta */}
        <g transform={L(0.75)}>
          <Motorino id="ri-moto" x={420} y={1250} s={1.0} t={t} light={lamp} />
          <g opacity={lamp}><Smoke id="ri-smoke" t={t} x={200} y={1170} color="#D8D0C8" n={6} rise={140} wind={-200} r0={20} r1={70} speed={0.5} opacity={0.6} /></g>
          <g transform="translate(790 1170)">
            <rect x="-90" y="0" width="180" height="90" fill="#8A6A44" stroke={K} strokeWidth="7" />
            <rect x="-120" y="-200" width="240" height="200" rx="18" fill="#4A3A34" stroke={K} strokeWidth="8" />
            <rect x="-100" y="-180" width="170" height="150" rx="20" fill="#1A1A22" stroke={K} strokeWidth="5" />
            <g opacity={tv}>
              <rect x="-100" y="-180" width="170" height="150" rx="20" fill="url(#ri-tv)" opacity=".85" />
              {[0, 1, 2, 3].map((i) => <rect key={i} x={-100} y={-170 + ((i * 38 + t * 30) % 150)} width="170" height="6" fill="#FFFFFF" opacity=".25" />)}
              <circle cx="-15" cy="-105" r="26" fill="#F4ECDD" opacity=".6" />
            </g>
            <Glow id="ri-tvg" x={-15} y={-105} r={230} t={t} color="#9AD8FF" amp={0.2} rate={6} opacity={0.5 * tv} />
            <circle cx="96" cy="-150" r="10" fill="#C8B8A8" stroke={K} strokeWidth="4" />
            <circle cx="96" cy="-110" r="10" fill="#C8B8A8" stroke={K} strokeWidth="4" />
            <path d="M-40 -200 L-80 -280 M40 -200 L80 -280" stroke={K} strokeWidth="5" />
          </g>
        </g>

        {/* PIANO 4 — cornice della porta del garage (saracinesca alzata) e attrezzi */}
        <g transform={L(1.2)}>
          <path d="M-200 -200 H1280 V620 H-200 Z" fill="#1E1618" stroke={K} strokeWidth="10" />
          <path d="M-200 620 H1280" stroke="#6A5A50" strokeWidth="6" />
          <path d="M-200 600 H-40 V2200 H-200 Z M1280 600 H1120 V2200 H1280 Z" fill="#1E1618" stroke={K} strokeWidth="10" />
          <ellipse cx="560" cy="1640" rx="160" ry="26" fill="#0E0A0A" opacity=".5" />
          <ellipse cx="300" cy="1760" rx="90" ry="16" fill="#0E0A0A" opacity=".45" />
          <ellipse cx="560" cy="1636" rx="60" ry="8" fill="#9AD8FF" opacity={0.12 + 0.1 * tv} />
          <g transform="translate(960 1720)">
            <rect x="-150" y="-150" width="300" height="160" fill="#8A3A2A" stroke={K} strokeWidth="9" />
            <path d="M-150 -100 H150 M-50 -150 V10 M50 -150 V10" stroke="#5A2218" strokeWidth="6" />
            {[-100, 0, 100].map((x) => <g key={x}><rect x={x - 16} y="-240" width="32" height="100" rx="8" fill="#3A7A4A" stroke={K} strokeWidth="5" /><rect x={x - 8} y="-262" width="16" height="26" fill="#3A7A4A" stroke={K} strokeWidth="4" /></g>)}
          </g>
          <g transform="translate(150 1820)">
            <path d="M-90 0 V-150 Q-90 -170 -70 -170 H70 Q90 -170 90 -150 V0 Z" fill="#C8303A" stroke={K} strokeWidth="9" />
            <path d="M-30 -170 V-210 H30 V-170" fill="none" stroke={K} strokeWidth="10" />
            <path d="M-60 -130 L60 -40" stroke="#E86A6A" strokeWidth="8" opacity=".6" />
          </g>
          <g transform="translate(-60 1500) rotate(-20)">
            <path d="M0 0 V300" stroke="#6A4A32" strokeWidth="14" />
            <path d="M-30 300 H30 L20 360 H-20 Z" fill="#8A8692" stroke={K} strokeWidth="5" />
          </g>
        </g>
        <g transform={L(1.6)}>
          <Fireflies id="ri-ff" t={t} n={14} x={160} y={900} w={760} h={300} color="#FFF08A" />
          <NearMotes id="ri-near" t={t} color="#FFE0B0" opacity={0.08} />
        </g>
      </g>

      <Finish id="ri" tint={TINT_DAY} tintOpacity={0.1} />
    </svg>
  );
};
