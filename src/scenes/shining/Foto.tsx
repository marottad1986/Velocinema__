import React from 'react';
import { camera, eio, eo, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes, SunRays } from '../../lib/elements';
import { TYPEWRITER } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { K, Maze } from './Comuni';

// La foto del 1921: dalla finestra del salone, all'alba, il labirinto sepolto dalla neve e silenzioso (Jack si è perso);
// le tracce del mezzo per la neve che si allontanano (Danny e Wendy fuggono); sulla parete tante vecchie foto in cornice:
// una, con la data 4 luglio 1921, si stacca dalle altre, si avvicina e si illumina (solo bagliore e data, nessuna figura).
// Piani: alba e labirinto oltre la finestra (0,25) · parete con le cornici (0,5) · la foto del 1921 (0,7) · lampade (1,0) · cornice in primo piano (1,25) · pulviscolo (1,6)

const r = rng(1921);
const FRAMES = Array.from({ length: 10 }, (_, i) => ({ x: 120 + (i % 5) * 210, y: i < 5 ? 1060 : 1220, w: 150 + r() * 30, h: 110 + r() * 30 }));

export const Foto: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tracks = eo(seg(t, cues[1], cues[1] + 1.5)); // «Danny e Wendy fuggono via»
  const come = eio(seg(t, cues[2], cues[2] + 2)); // la foto si avvicina
  const glow = seg(t, cues[3] - 0.5, cues[3] + 0.8); // «come se fosse sempre stato lì»

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ft" />
        <Lin id="ft-dawn" stops={[[0, '#5A6A8A'], [0.5, '#D8B8A8'], [1, '#F4E8DC']]} />
        <Lin id="ft-wall" stops={[[0, '#3A2E22'], [0.5, '#5A4A36'], [1, '#2A2018']]} />
        <radialGradient id="ft-halo" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#FFF4D8" stopOpacity=".9" /><stop offset="1" stopColor="#FFF4D8" stopOpacity="0" /></radialGradient>
        <Lin id="ft-sepia" stops={[[0, '#C8A878'], [1, '#7A5A38']]} />
      </defs>
      <g transform={cam.transform}>
        {/* la finestra sull'alba: il labirinto sepolto e le tracce che se ne vanno */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ft-wall)" />
          <g>
            <rect x="160" y="540" width="760" height="420" fill="url(#ft-dawn)" />
            <SunRays id="ft-rays" x={760} y={640} t={t} color="#FFE8C8" n={8} length={700} opacity={0.3} />
            <path d="M160 800 Q540 790 920 800 V960 H160 Z" fill="#E4E2E4" /> {/* piano di neve fino all'orizzonte */}
            <Maze x={540} y={862} w={560} h={110} persp={0.6} snow={1} hedge="#5A6A6A" />
            {[0, 9].map((d) => <path key={d} d={`M920 ${934 + d} Q${720} ${940 + d} ${920 - 760 * tracks} ${938 + d}`} stroke="#8A96A8" strokeWidth="5" strokeDasharray="5 4" fill="none" opacity={tracks} />)} {/* tracce doppie davanti al labirinto */}
            <path d="M160 540 H920 V960 H160 Z M540 540 V960 M160 750 H920" fill="none" stroke={K} strokeWidth="14" />
          </g>
        </g>
        {/* parete con tante vecchie foto in cornice */}
        <g transform={L(0.5)}>
          {FRAMES.map((f, i) => (
            <g key={i} opacity={1 - 0.5 * come}>
              <rect x={f.x - f.w / 2} y={f.y - f.h / 2} width={f.w} height={f.h} fill="#2A2018" stroke="#8A6A3A" strokeWidth="10" />
              <rect x={f.x - f.w / 2 + 12} y={f.y - f.h / 2 + 12} width={f.w - 24} height={f.h - 24} fill="url(#ft-sepia)" opacity=".6" />
              <path d={`M${f.x - f.w / 2 + 20} ${f.y + f.h / 2 - 24} Q${f.x} ${f.y - 10} ${f.x + f.w / 2 - 20} ${f.y + f.h / 2 - 28}`} stroke="#5A4028" strokeWidth="5" fill="none" opacity=".5" />
            </g>
          ))}
        </g>
        {/* la foto del 1921 che si avvicina e si illumina (accento sulla data) */}
        <g transform={L(0.7)}>
          <g transform={`translate(${540} ${1140 - 80 * come}) scale(${0.6 + 0.9 * come})`}>
            <Glow id="ft-photo" x={0} y={0} r={360} t={t} color="#FFE8B0" amp={0.08} rate={2} opacity={0.2 + 0.5 * glow} />
            <rect x="-220" y="-160" width="440" height="320" fill="#2A1E14" stroke="#C9A24A" strokeWidth="14" />
            <rect x="-196" y="-136" width="392" height="240" fill="url(#ft-sepia)" />
            {/* la sala da ballo nella foto: lampadari e luci, nessuna figura */}
            {[-120, 0, 120].map((x) => <g key={x}><path d={`M${x - 30} -100 Q${x} -76 ${x + 30} -100`} stroke="#4A3018" strokeWidth="4" fill="none" /><circle cx={x} cy="-86" r="6" fill="#FFF4D8" opacity=".8" /></g>)}
            <path d="M-196 40 Q0 10 196 40 V104 H-196 Z" fill="#5A3E24" opacity=".5" />
            <ellipse cx="0" cy="-20" rx={190} ry={110} fill="url(#ft-halo)" opacity={0.25 + 0.75 * glow} />
            <rect x="-196" y="110" width="392" height="44" fill="#E8D8B8" />
            <text x="0" y="142" textAnchor="middle" fontFamily={TYPEWRITER} fontSize="26" fill={P.accento} opacity={0.5 + 0.5 * glow}>4 luglio 1921</text>
          </g>
        </g>
        {/* applique */}
        <g transform={L(1.0)}>
          {[60, 1020].map((x, i) => (
            <g key={x}>
              <Glow id={`ft-ap${i}`} x={x} y={1000} r={200} t={t} color="#FFD8A0" amp={0.05} rate={2 + i} opacity={0.5} />
              <path d={`M${x - 24} 1000 H${x + 24} L${x + 16} 1050 H${x - 16} Z`} fill="#F4E2B0" stroke={K} strokeWidth="4" />
            </g>
          ))}
        </g>
        <g transform={L(1.25)}>
          <path d="M-200 1500 H1280 V2200 H-200 Z" fill="#1A140E" />
          <rect x="-80" y="1640" width="260" height="200" fill="#2A1E14" stroke="#8A6A3A" strokeWidth="12" transform="rotate(-8 50 1740)" />
          <rect x="300" y="1760" width="200" height="150" fill="#2A1E14" stroke="#8A6A3A" strokeWidth="10" transform="rotate(14 400 1835)" />
          {[[560, 1640, -12], [640, 1700, 20], [480, 1600, 6]].map(([x, y, a], i) => <g key={i} transform={`rotate(${a} ${x} ${y})`}><rect x={x - 60} y={y - 40} width="120" height="80" fill="#E8DCC4" stroke={K} strokeWidth="3" /></g>)}
          {/* poltrona del salone, vuota */}
          <g transform="translate(900 1600)">
            <path d="M-170 -160 Q-170 -230 -100 -230 H100 Q170 -230 170 -160 V40 H-170 Z" fill="#6A2A24" stroke={K} strokeWidth="9" />
            <rect x="-210" y="-60" width="80" height="200" rx="30" fill="#7A3A2E" stroke={K} strokeWidth="8" />
            <rect x="130" y="-60" width="80" height="200" rx="30" fill="#7A3A2E" stroke={K} strokeWidth="8" />
            <rect x="-140" y="20" width="280" height="90" rx="16" fill="#8A4A3A" stroke={K} strokeWidth="8" />
            <path d="M-170 140 V320 M170 140 V320" stroke={K} strokeWidth="14" />
          </g>
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 640, x0: 600, x1: 900 }} bottom={{ y: 1300, x0: 200, x1: 900 }} seed={9} n={24} color="#FFE8C8" boost={glow * 0.4} />
          <NearMotes id="ft-near" t={t} color="#FFE8C8" n={5} y0={1300} opacity={0.07 + 0.03 * mod(t, 1)} />
        </g>
      </g>
      <Finish id="ft" tint="#3A1A14" tintOpacity={0.1} />
    </svg>
  );
};
