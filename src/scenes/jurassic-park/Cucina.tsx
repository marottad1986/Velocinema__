import React from 'react';
import { camera, eio, eo, mod, seg } from '../../lib/anim';
import { Beam, Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { K, RaptorHead } from './Comuni';

// Raptor in cucina: banconi d'acciaio, mestoli appesi che oscillano, una pentola caduta, la maniglia della porta che si
// abbassa da sola, dietro l'oblò la testa di un raptor piumato; poi un monitor che si accende (Lex al computer) e la spia
// della porta che diventa rossa: bloccata.
// Piani: parete e cappa (0,25) · porta con l'oblò e la maniglia (0,45) · mestoli (0,6) · banconi (0,85) · bancone in primo piano (1,25) · vapore (1,6)

export const Cucina: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const handle = seg(t, cues[0] + 1.2, cues[0] + 1.6) * (1 - seg(t, cues[0] + 2.4, cues[0] + 2.8)); // la maniglia si abbassa
  const swing = Math.sin(t * 3) * 6 + 18 * Math.sin(t * 5) * Math.exp(-Math.max(0, t - cues[1]) * 1.2) * (t > cues[1] ? 1 : 0); // mestoli urtati
  const pot = eio(seg(t, cues[1] + 0.3, cues[1] + 0.8)); // la pentola cade
  const screen = eo(seg(t, cues[2], cues[2] + 0.8)); // il computer si accende
  const locked = seg(t, cues[3], cues[3] + 0.2); // «blocca le porte»: la spia diventa rossa
  const peek = eio(seg(t, cues[0] + 0.5, cues[0] + 1.2)) * (1 - eio(seg(t, cues[2], cues[2] + 0.8))); // il raptor dietro l'oblò

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="cu" />
        <Lin id="cu-wall" stops={[[0, '#1E2A28'], [0.5, '#2E3E3A'], [1, '#1A2422']]} />
        <Lin id="cu-steel" stops={[[0, '#C9D2D0'], [0.4, '#8A9694'], [1, '#4A5654']]} />
        <Lin id="cu-floor" stops={[[0, '#3A4644'], [1, '#121A18']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#cu-wall)" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M-200 ${560 + i * 50} H1280`} stroke="#263432" strokeWidth="3" />)}
          <path d="M-200 520 L100 520 L160 600 H-200 Z M1280 520 L980 520 L920 600 H1280 Z" fill="#4A5654" stroke={K} strokeWidth="6" />
        </g>
        {/* porta della cucina con oblò, maniglia e spia */}
        <g transform={L(0.45)}>
          <rect x="400" y="640" width="280" height="460" fill="url(#cu-steel)" stroke={K} strokeWidth="9" />
          <clipPath id="cu-portclip"><circle cx="540" cy="780" r="56" /></clipPath>
          <circle cx="540" cy="780" r="60" fill="#0E1816" />
          <g clipPath="url(#cu-portclip)">
            <RaptorHead x={420 + 90 * peek} y={790 + Math.sin(t * 2) * 4} s={0.62} t={t} open={peek * Math.max(0, Math.sin(t * 2.5))} />
          </g>
          <circle cx="540" cy="780" r="60" fill="none" stroke={K} strokeWidth="8" />
          <Glow id="cu-port" x={540} y={780} r={90} t={t} color="#6EA89A" amp={0.1} rate={1.2} opacity={0.35} />
          <path d="M500 750 Q520 730 550 734" stroke="#9FC4BA" strokeWidth="5" fill="none" opacity=".6" />
          <g transform={`rotate(${-35 * handle} 640 900)`}>
            <rect x="590" y="890" width="60" height="18" rx="8" fill="#E2E8E6" stroke={K} strokeWidth="5" />
          </g>
          <circle cx="640" cy="900" r="10" fill="#4A5654" stroke={K} strokeWidth="3" />
          <rect x="700" y="760" width="60" height="90" rx="8" fill="#2A3432" stroke={K} strokeWidth="5" />
          <circle cx="730" cy="790" r="14" fill={locked > 0.5 ? '#E8503A' : '#7CFF8A'} />
          <Glow id="cu-lock" x={730} y={790} r={90} t={t} color={locked > 0.5 ? '#E8503A' : '#7CFF8A'} amp={0.1} rate={3} opacity={0.6} />
          <rect x="712" y="814" width="36" height="22" rx="3" fill="#0E1816" />
          <path d="M716 818 h28" stroke={locked > 0.5 ? '#E8503A' : '#7CFF8A'} strokeWidth="3" />
          {/* il monitor sul muro che si accende */}
          <rect x="90" y="700" width="220" height="150" rx="10" fill="#0A1A16" stroke={K} strokeWidth="8" />
          <g opacity={screen}>
            <rect x="104" y="714" width="192" height="122" fill="#0E3A30" />
            {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={116 + (i % 2) * 20} y={726 + i * 20} width={60 + ((i * 47) % 90)} height="10" fill="#8EF0C0" />)}
            <Glow id="cu-scr" x={200} y={775} r={180} t={t} color="#5FE0A0" amp={0.06} rate={3} opacity={0.4} />
          </g>
        </g>
        {/* mestoli appesi che oscillano */}
        <g transform={L(0.6)}>
          <path d="M-60 560 H1140" stroke={K} strokeWidth="12" />
          {[60, 180, 300, 780, 900, 1020].map((x, i) => (
            <g key={x} transform={`rotate(${swing * (i % 2 ? 1 : -0.8)} ${x} 566)`}>
              <path d={`M${x} 566 V${700 + (i % 3) * 30}`} stroke="#C9D2D0" strokeWidth="8" />
              {i % 2 ? <ellipse cx={x} cy={720 + (i % 3) * 30} rx="30" ry="22" fill="url(#cu-steel)" stroke={K} strokeWidth="5" />
                : <path d={`M${x - 26} ${700 + (i % 3) * 30} h52 l-8 60 h-36 Z`} fill="url(#cu-steel)" stroke={K} strokeWidth="5" />}
            </g>
          ))}
          <Beam id="cu-lamp" x={540} y={560} t={t} length={700} spread={420} color="#DDF2EC" angle={90} opacity={0.15} />
        </g>
        {/* banconi d'acciaio e la pentola che cade (accento sul coperchio) */}
        <g transform={L(0.85)}>
          <rect x="-200" y="1100" width="1480" height="1100" fill="url(#cu-floor)" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-200 + i * 200} 1100 L${-400 + i * 260} 1920`} stroke="#2A3634" strokeWidth="4" />)}
          <path d="M-200 1060 H330 V1220 H-200 Z" fill="url(#cu-steel)" stroke={K} strokeWidth="8" />
          <path d="M750 1060 H1280 V1220 H750 Z" fill="url(#cu-steel)" stroke={K} strokeWidth="8" />
          <path d="M-200 1066 H330 M750 1066 H1280" stroke="#F2F6F4" strokeWidth="5" opacity=".7" />
          <g transform={`translate(${880 - 80 * pot} ${1020 + 190 * pot}) rotate(${-100 * pot})`}>
            <path d="M-56 -40 H56 L48 30 H-48 Z" fill="url(#cu-steel)" stroke={K} strokeWidth="6" />
            <path d="M-70 -40 H70" stroke={K} strokeWidth="10" strokeLinecap="round" />
          </g>
          {pot > 0.9 && <ellipse cx="800" cy="1240" rx={60 + 40 * seg(t, cues[1] + 0.8, cues[1] + 1.6)} ry="10" fill="#E8F2EE" opacity={0.4 * (1 - seg(t, cues[1] + 0.8, cues[1] + 1.6))} />}
          <g transform={`translate(${720 - 160 * pot} ${1050 + 200 * pot}) rotate(${300 * pot})`}>
            <ellipse cx="0" cy="0" rx="64" ry="14" fill={P.accento} stroke={K} strokeWidth="5" />
            <circle cx="0" cy="-12" r="8" fill={K} />
          </g>
        </g>
        {/* bancone in primo piano: ci si nasconde dietro */}
        <g transform={L(1.25)}>
          <path d="M-200 1560 H1280 V2200 H-200 Z" fill="url(#cu-steel)" stroke={K} strokeWidth="10" />
          <path d="M-200 1570 H1280" stroke="#F2F6F4" strokeWidth="8" opacity=".6" />
          {[100, 400, 700, 1000].map((x) => <rect key={x} x={x - 90} y="1640" width="180" height="240" rx="8" fill="none" stroke={K} strokeWidth="6" />)}
          {[100, 400, 700, 1000].map((x) => <rect key={x} x={x - 30} y="1700" width="60" height="12" rx="6" fill="#E2E8E6" stroke={K} strokeWidth="3" />)}
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 560, x0: 420, x1: 660 }} bottom={{ y: 1260, x0: 200, x1: 880 }} seed={7} n={20} color="#DDF2EC" />
          <NearMotes id="cu-near" t={t} color="#DDF2EC" n={5} y0={1300} opacity={0.07 + 0.03 * mod(t, 1)} />
        </g>
      </g>
      <Finish id="cu" tint="#0F1F17" tintOpacity={0.12} />
    </svg>
  );
};
