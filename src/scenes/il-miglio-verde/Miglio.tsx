import React from 'react';
import { camera, eo, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Corridor, GOLD, K, pj } from './Comuni';

// Il corridoio verde: il braccio della morte di Cold Mountain nel 1935, in prospettiva. Su «Paul comanda le guardie» le
// lampade si accendono una dopo l'altra; su «miglio verde» una striscia di luce corre sul pavimento verde fino alla porta;
// su «arriva un nuovo condannato» la porta in fondo si spalanca, la luce calda invade il corridoio e la cella vuota in
// primo piano si apre ad aspettarlo. Le guardie si raccontano con il berretto e il mazzo di chiavi appesi. Nessuna persona.
// Piani: corridoio (0,35) · cella aperta a destra (0,9) · gancio con berretto e chiavi (1,2) · pulviscolo (1,6)

export const Miglio: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  // le lampade si accendono una alla volta, una per croma (72 bpm), con lo scatto dell'interruttore nello spartito
  const l0 = griglia(cues[0] + 0.2);
  const lampOn = [0, 1, 2, 3].map((i) => 0.15 + 0.85 * seg(t, l0 + (i * 60) / 72 / 2, l0 + (i * 60) / 72 / 2 + 0.12));
  const sweep = seg(t, griglia(cues[1] + 0.2), griglia(cues[1] + 0.2) + 1.8); // la luce corre sul pavimento verde
  const arrive = eo(seg(t, griglia(cues[2] + 0.3), griglia(cues[2] + 0.3) + 1.2)); // la porta si spalanca
  const cell = eo(seg(t, griglia(cues[2] + 1.2), griglia(cues[2] + 1.2) + 1.0)); // la cella si apre
  const keys = Math.sin(t * 2.2) * 6 + (t > cues[0] && t < cues[0] + 1 ? Math.sin(t * 30) * 8 * (1 - (t - cues[0])) : 0);
  // la striscia di luce sul pavimento, da vicino a lontano
  const d = 1.1 + 7 * sweep;
  const [sx, sy] = pj(0, 1100, d);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="mg" />
        <radialGradient id="mg-sweep">
          <stop offset="0" stopColor="#B8FFC8" stopOpacity=".7" />
          <stop offset="1" stopColor="#B8FFC8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.35)}>
          <Corridor t={t} id="mg" door={0.35 + 0.65 * arrive} lampOn={lampOn} />
          {sweep > 0 && sweep < 1 && <ellipse cx={sx} cy={sy} rx={700 / d} ry={120 / d} fill="url(#mg-sweep)" opacity={Math.sin(sweep * Math.PI)} />}
          {/* la luce della porta spalancata che entra nel corridoio */}
          {arrive > 0 && (
            <g opacity={arrive}>
              <path d={`M${pj(-120, -170, 8).join(' ')} L${pj(-700, 1100, 1.4).join(' ')} L${pj(700, 1100, 1.4).join(' ')} L${pj(120, -170, 8).join(' ')} Z`} fill={GOLD} opacity=".12" />
              <Glow id="mg-arr" x={540} y={900} r={420} t={t} color={GOLD} amp={0.08} rate={2} opacity={0.4} />
            </g>
          )}
        </g>
        {/* la cella vuota in primo piano a destra: la porta a sbarre che si apre */}
        <g transform={L(0.9)}>
          <path d="M860 380 H1300 V1800 H860 Z" fill="#141810" />
          <path d="M880 1500 H1280" stroke="#3A4A3A" strokeWidth="40" />
          <g transform={`translate(860 0) skewY(${cell * -8}) scale(${1 - cell * 0.35} 1)`}>
            <rect x="0" y="380" width="300" height="1420" fill="none" stroke="#5A6058" strokeWidth="18" />
            {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${24 + i * 50} 380 V1800`} stroke="#6A7066" strokeWidth="16" strokeLinecap="round" />)}
            {[620, 1100].map((y) => <path key={y} d={`M0 ${y} H300`} stroke="#6A7066" strokeWidth="18" />)}
            <rect x="10" y="1060" width="60" height="90" fill="#4A4A40" stroke={K} strokeWidth="5" />
            <path d="M24 380 V1800" stroke="#C8D0C0" strokeWidth="4" opacity=".4" />
          </g>
          <path d="M860 380 V1800" stroke={K} strokeWidth="26" />
        </g>
        {/* il gancio sul muro a sinistra, con il berretto da guardia e il mazzo di chiavi */}
        <g transform={L(1.2)}>
          <path d="M-200 600 H230 V1900 H-200 Z" fill="#2A2C24" stroke={K} strokeWidth="10" />
          <path d="M-200 600 H230" stroke="#5A5C4C" strokeWidth="6" />
          <rect x="60" y="760" width="120" height="26" rx="6" fill="#5A4A30" stroke={K} strokeWidth="5" />
          <path d="M120 786 V820" stroke="#8A8A7A" strokeWidth="8" />
          {/* il berretto */}
          <g transform="translate(110 870) rotate(-6)">
            <path d="M-80 0 Q-80 -60 0 -64 Q80 -60 80 0 Z" fill="#2E3A48" stroke={K} strokeWidth="6" />
            <path d="M-86 0 H86 Q60 30 -60 20 Z" fill="#1A1E24" stroke={K} strokeWidth="6" />
            <rect x="-16" y="-44" width="32" height="22" rx="4" fill="#C8A85A" stroke={K} strokeWidth="3" />
          </g>
          {/* le chiavi che dondolano */}
          <g transform={`translate(150 980) rotate(${keys})`}>
            <path d="M0 -60 V0" stroke="#8A8A7A" strokeWidth="5" />
            <circle cx="0" cy="22" r="26" fill="none" stroke="#B8A870" strokeWidth="7" />
            {[-30, -5, 20, 45].map((a, i) => (
              <g key={i} transform={`translate(0 22) rotate(${a + 90})`}>
                <path d="M26 0 H96 M80 0 V12 M90 0 V10" stroke="#C8B880" strokeWidth="7" strokeLinecap="round" />
                <circle cx="20" cy="0" r="9" fill="none" stroke="#C8B880" strokeWidth="5" />
              </g>
            ))}
          </g>
          <path d="M-200 1600 H1280 V2200 H-200 Z" fill="#0A0E0A" opacity=".45" />
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 600, x0: 400, x1: 680 }} bottom={{ y: 1400, x0: 240, x1: 840 }} seed={11} n={26} color="#FFE6A8" boost={0.15 + 0.4 * arrive} />
          <NearMotes id="mg-near" t={t} color="#FFE6A8" n={6} y0={1200} opacity={0.08} />
        </g>
      </g>
      <Finish id="mg" tint="#1E3A28" tintOpacity={0.12} />
    </svg>
  );
};
