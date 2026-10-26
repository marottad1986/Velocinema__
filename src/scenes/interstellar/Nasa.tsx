import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { HAND } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Dust, Embers, Glow, NearMotes, Stars } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { GOLD, Ring, Saturn } from './Spazio';

// La base segreta: hangar sotterraneo della NASA con l'astronave ad anello in costruzione, impalcature e scintille di
// saldatura; a sinistra lavagne piene di equazioni; a destra un grande schermo che mostra il piano. Nessuna persona.
// Eventi: lo schermo si accende su Saturno (cue 1) · accanto a Saturno appare il varco, una sfera che deforma le stelle
//         (cue 2) · il tunnel si apre verso un'altra galassia (cue 3) · compaiono tre pianeti candidati (cue 4).
// Piani: parete di cemento e fari (0,2) · astronave e impalcature (0,45) · schermo e lavagne (0,65)
//        · ringhiera e cavi in primo piano (1,2) · scintille, pulviscolo, particelle (1,5–1,8)

const K = '#0A0F18';
const r = rng(48);
const EQ = ['∇²Φ = 4πGρ', 'g_μν', 'Δt = t₀ / √(1 − 2GM/rc²)', 'Rμν − ½Rgμν', '∮ E·dA', 'G = ?'];

export const Nasa: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const screen = seg(t, cues[1] - 0.2, cues[1] + 0.3);
  const hole = eob(seg(t, cues[2], cues[2] + 0.7));
  const tunnel = eo(seg(t, cues[3], cues[3] + 1.2));
  const planets = (i: number) => eob(seg(t, cues[4] + i * 0.25, cues[4] + 0.5 + i * 0.25));
  const sx = 790, sy = 760; // centro dello schermo

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="na" />
        <Lin id="na-wall" stops={[[0, '#05080E'], [0.4, '#121A26'], [0.75, '#1E2A38'], [1, '#121A24']]} />
        <Lin id="na-floor" stops={[[0, '#2A3442'], [1, '#0C1118']]} />
        <Lin id="na-board" stops={[[0, '#2E3A34'], [1, '#1E2824']]} />
        <Lin id="na-screen" stops={[[0, '#04070C'], [1, '#0E1622']]} />
        <Lin id="na-steel" x2={1} y2={0} stops={[[0, '#3A4654'], [0.5, '#7A8A9A'], [1, '#3A4654']]} />
        <Lin id="na-front" stops={[[0, '#141C26'], [1, '#05080C']]} />
        <radialGradient id="na-hole">
          <stop offset="0" stopColor="#F2E8D0" />
          <stop offset=".35" stopColor="#8EB8D8" />
          <stop offset=".75" stopColor="#3E6A8A" stopOpacity=".6" />
          <stop offset="1" stopColor="#0A0F18" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete di cemento con fari dall'alto (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#na-wall)" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-160 + i * 180} -200 V1100`} stroke="#0A0F18" strokeWidth="10" opacity=".6" />)}
          {[200, 540, 880].map((x, i) => (
            <g key={x}>
              <rect x={x - 30} y="160" width="60" height="26" fill="#3A4654" stroke={K} strokeWidth="5" />
              <Beam id={`na-fl${i}`} x={x} y={186} t={t} length={900} spread={420} color="#DCE8F2" angle={90} sweep={2} sweepRate={0.4 + i * 0.1} opacity={0.18} />
            </g>
          ))}
        </g>

        {/* PIANO 1 — astronave ad anello in costruzione con impalcature (0,45) */}
        <g transform={L(0.45)}>
          <path d="M-200 1060 H1280 V1300 H-200 Z" fill="url(#na-floor)" />
          <g opacity=".95">
            <Ring x={380} y={900} r={300} t={t} spin={0.03} tiltY={0.36} outline={K} lit="#C9D3DB" />
          </g>
          {[120, 300, 460, 640].map((x) => (
            <g key={x} stroke="#5A6A7A" strokeWidth="6">
              <path d={`M${x} 1060 V700 M${x + 60} 1060 V700`} />
              {[760, 840, 920, 1000].map((y) => <path key={y} d={`M${x} ${y} H${x + 60} M${x} ${y} L${x + 60} ${y + 80}`} />)}
            </g>
          ))}
          <Glow id="na-weld" x={250} y={880} r={60} t={t} color="#FFE6A8" amp={0.5} rate={23} opacity={0.8} />
        </g>

        {/* PIANO 2 — grande schermo con il piano e lavagne con equazioni (0,65) */}
        <g transform={L(0.65)}>
          <rect x={sx - 230} y={sy - 200} width="460" height="400" rx="12" fill="url(#na-screen)" stroke="#3A4654" strokeWidth="14" />
          <rect x={sx - 230} y={sy - 200} width="460" height="400" rx="12" fill="none" stroke={K} strokeWidth="5" />
          <clipPath id="na-scr"><rect x={sx - 222} y={sy - 192} width="444" height="384" rx="8" /></clipPath>
          <g clipPath="url(#na-scr)" opacity={screen}>
            <Stars t={t} seed={9} n={40} x={sx - 230} y={sy - 200} w={460} h={400} color="#DCE8F2" />
            <g transform={`translate(${lerp(0, -70, hole)} 0)`}>
              <Saturn id="na-sat" x={sx - 60} y={sy + 40} r={lerp(70, 50, hole)} outline={K} />
            </g>
            {/* il varco: sfera che deforma le stelle */}
            {hole > 0 && (
              <g transform={`translate(${sx + 110} ${sy - 50}) scale(${hole})`}>
                <circle r="90" fill="url(#na-hole)" />
                <circle r="56" fill="none" stroke="#F2E8D0" strokeWidth="3" opacity=".8" />
                {[0, 1, 2, 3].map((k) => <ellipse key={k} rx={70 - k * 10} ry={(70 - k * 10) * 0.35} fill="none" stroke="#DCE8F2" strokeWidth="2" opacity={0.6 - k * 0.1} transform={`rotate(${t * 30 + k * 45})`} />)}
              </g>
            )}
            {/* tunnel verso l'altra galassia */}
            {tunnel > 0 && [0, 1, 2, 3, 4].map((k) => (
              <ellipse key={k} cx={sx + 110 + 80 * tunnel * (k / 4)} cy={sy - 50 - 40 * tunnel * (k / 4)} rx={lerp(56, 14, k / 4)} ry={lerp(56, 14, k / 4)} fill="none" stroke={GOLD} strokeWidth="3" opacity={tunnel * (1 - k * 0.15)} />
            ))}
            {/* tre pianeti candidati */}
            {[[sx + 150, sy - 140, '#5A8AAA'], [sx + 196, sy - 100, '#C9D3DB'], [sx + 170, sy - 160, '#B88A5A']].map(([x, y, c], i) => (
              <g key={i} transform={`translate(${x} ${y}) scale(${planets(i)})`}>
                <circle r="14" fill={c as string} stroke="#DCE8F2" strokeWidth="3" />
                <circle r="24" fill="none" stroke={GOLD} strokeWidth="2" strokeDasharray="5 4" />
              </g>
            ))}
          </g>
          <Glow id="na-scrg" x={sx} y={sy} r={360} t={t} color="#8EB8D8" amp={0.06} rate={2} opacity={0.3 * screen} />
          <path d={`M${sx} ${sy + 200} V1060`} stroke="#3A4654" strokeWidth="18" />
          {/* lavagne con equazioni a sinistra */}
          {[0, 1].map((k) => (
            <g key={k} transform={`translate(${-20 + k * 250} ${1000 - k * 30}) rotate(${k ? 3 : -2})`}>
              <rect x="0" y="0" width="230" height="170" fill="url(#na-board)" stroke="#5A4A38" strokeWidth="10" />
              {EQ.slice(k * 3, k * 3 + 3).map((e, j) => <text key={j} x="16" y={44 + j * 46} fontFamily={HAND} fontSize="30" fill="#E8EEF0" opacity=".9">{e}</text>)}
              <path d="M40 166 V250 M190 166 V250" stroke="#3A4654" strokeWidth="8" />
            </g>
          ))}
        </g>

        {/* PIANO 3 — ringhiera e cavi in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1600 H1280 V2200 H-200 Z" fill="url(#na-front)" stroke={K} strokeWidth="9" />
          {/* ringhiera d'acciaio: colori pieni (un gradiente su una linea dritta non si disegna) */}
          {[-60, 180, 420, 660, 900, 1140].map((x) => (
            <g key={x}>
              <path d={`M${x} 1420 V2000`} stroke={K} strokeWidth="24" />
              <path d={`M${x} 1420 V2000`} stroke="#6A7A8A" strokeWidth="14" />
              <path d={`M${x - 3} 1430 V2000`} stroke="#B8C8D8" strokeWidth="3" opacity=".6" />
            </g>
          ))}
          <path d="M-200 1420 H1280" stroke={K} strokeWidth="28" />
          <path d="M-200 1420 H1280" stroke="#7A8A9A" strokeWidth="18" />
          <path d="M-200 1414 H1280" stroke="#C8D8E8" strokeWidth="3" opacity=".7" />
          <path d="M-200 1640 H1280" stroke={K} strokeWidth="20" />
          <path d="M-200 1640 H1280" stroke="#5A6A7A" strokeWidth="12" />
          <path d="M-200 1520 H1280" stroke="#3A4654" strokeWidth="8" />
          <path d="M-200 1700 Q300 1640 700 1720 Q1000 1780 1280 1700" fill="none" stroke="#1A2230" strokeWidth="30" />
          <path d="M-200 1780 Q400 1720 800 1800 Q1100 1850 1280 1780" fill="none" stroke="#24303E" strokeWidth="24" />
          {[0, 1, 2].map((i) => <rect key={i} x={60 + i * 340} y="1640" width="120" height="16" fill={GOLD} opacity={0.4 + 0.4 * Math.sin(t * 3 + i)} />)}
        </g>

        {/* PIANO 4 — scintille di saldatura, pulviscolo nei fari, particelle (1,5–1,8) */}
        <g transform={L(0.45)}>
          <Embers t={t * 1.5} x={250} y={880} w={30} h={-260} n={18} seed={21} hot="#FFF4D6" warm="#E8B04A" drift={120} />
        </g>
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 200, x0: 140, x1: 940 }} bottom={{ y: 1100, x0: -100, x1: 1180 }} n={40} color="#DCE8F2" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="na-near" t={t + r()} color="#DCE8F2" n={6} vx={-20} vy={-6} opacity={0.07} />
        </g>
      </g>

      <Finish id="na" tint="#3E6A8A" tintOpacity={0.1} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): schermo su Saturno cue1 · varco cue2 · tunnel cue3 · tre pianeti da cue4.
