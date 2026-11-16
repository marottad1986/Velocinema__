import React from 'react';
import { camera, eo, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { GOLD, K, Swarm } from './Comuni';

// Il primo miracolo: la notte davanti alla cella di John, vista dal corridoio. Su «John lo tocca» tra le sbarre si accende
// una luce dorata e le lampade sfarfallano; su «una nuvola di moscerini» lo sciame nero esce dalle sbarre, sale e si
// dissolve in scintille dorate; su «il dono di guarire» resta un alone caldo e calmo. Sul pavimento verde il berretto
// caduto di Paul e la borsa dell'acqua calda che gli serviva per il dolore. Nessuna persona.
// Piani: muro della cella (0,25) · sbarre (0,6) · luce e sciame (0,7) · pavimento con berretto e borsa (1,0) · pulviscolo (1,6)

export const Guarigione: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const touch = eo(seg(t, griglia(cues[0] + 1.4), griglia(cues[0] + 1.4) + 0.8));
  const swarmP = seg(t, griglia(cues[1] + 0.6), griglia(cues[1] + 0.6) + 3.2);
  const calm = eo(seg(t, griglia(cues[2]), griglia(cues[2]) + 1.5));
  const flick = touch > 0 && calm < 1 ? 0.6 + 0.4 * Math.sin(t * 31) * Math.sin(t * 7) : 1;
  const glow = touch * (1 - 0.5 * calm) + 0.3 * calm;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="gu" />
        <Lin id="gu-wall" stops={[[0, '#141810'], [0.6, '#22281C'], [1, '#14180F']]} />
        <Lin id="gu-floor" stops={[[0, '#3E7A4E'], [1, '#183420']]} />
        <radialGradient id="gu-core">
          <stop offset="0" stopColor="#FFF4C8" stopOpacity=".95" />
          <stop offset=".4" stopColor={GOLD} stopOpacity=".55" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={cam.transform}>
        {/* il buio della cella, il muro di pietra e la branda appena visibile */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#gu-wall)" />
          {Array.from({ length: 10 }, (_, r) => Array.from({ length: 8 }, (_, c) => (
            <rect key={`${r}-${c}`} x={-180 + c * 190 + (r % 2) * 95} y={420 + r * 90} width="180" height="80" rx="8" fill="none" stroke="#0E120B" strokeWidth="4" />
          )))}
          <rect x="560" y="900" width="460" height="60" fill="#3A3428" stroke={K} strokeWidth="6" />
          <path d="M560 900 Q790 870 1020 900 L1030 990 H560 Z" fill="#2E3A4A" stroke={K} strokeWidth="5" />
          {/* la lampada sul soffitto del corridoio che sfarfalla */}
          <g transform="translate(300 700)">
            <path d="M0 -360 V-20" stroke="#1A1A14" strokeWidth="6" />
            <path d="M-60 10 Q0 -40 60 10 Z" fill="#2E3A30" stroke={K} strokeWidth="6" />
            <circle cx="0" cy="16" r="16" fill={flick > 0.8 ? '#FFF0C0' : '#8A8A70'} />
            <Glow id="gu-lamp" x={0} y={16} r={220} t={t} color="#FFE6A8" amp={0.05} rate={2} opacity={0.45 * flick} />
          </g>
          <rect x="-200" y="1300" width="1480" height="900" fill="url(#gu-floor)" />
          <path d="M-200 1300 H1280" stroke={K} strokeWidth="8" />
        </g>
        {/* la luce del dono tra le sbarre */}
        <g transform={L(0.7)}>
          {glow > 0 && (
            <g opacity={glow}>
              <circle cx="540" cy="1000" r={260 + 40 * Math.sin(t * 3)} fill="url(#gu-core)" />
              <Glow id="gu-gift" x={540} y={1000} r={560} t={t} color={GOLD} amp={0.1} rate={2.6} opacity={0.5} />
              <path d="M540 1000 L380 1400 H700 Z" fill={GOLD} opacity=".08" />
            </g>
          )}
        </g>
        {/* le sbarre della cella */}
        <g transform={L(0.6)}>
          <rect x="-200" y="560" width="1480" height="40" fill="#3A4038" stroke={K} strokeWidth="6" />
          <rect x="-200" y="1270" width="1480" height="40" fill="#3A4038" stroke={K} strokeWidth="6" />
          {Array.from({ length: 11 }, (_, i) => {
            const x = -120 + i * 130;
            const lit = Math.max(0, 1 - Math.abs(x - 540) / 360) * glow;
            return (
              <g key={i}>
                <path d={`M${x} 560 V1310`} stroke="#4A524A" strokeWidth="26" strokeLinecap="round" />
                <path d={`M${x - 6} 560 V1310`} stroke={lit > 0.05 ? '#FFE6A8' : '#8A9488'} strokeWidth="5" opacity={0.4 + 0.6 * lit} />
              </g>
            );
          })}
          <rect x="420" y="840" width="70" height="110" rx="6" fill="#3A3A30" stroke={K} strokeWidth="5" />
          <circle cx="455" cy="880" r="10" fill={K} />
        </g>
        {/* lo sciame di moscerini che esce e sale, dissolvendosi in oro */}
        <g transform={L(0.75)}>
          <g transform="translate(540 1010) scale(1.7) translate(-540 -1010)"><Swarm x={540} y={1010} t={t} p={swarmP} n={120} spread={200} rise={300} seed={3} /></g>
        </g>
        {/* il pavimento del corridoio: il berretto caduto di Paul e la borsa dell'acqua calda */}
        <g transform={L(1.0)}>
          <path d="M-200 1320 H1280 V2200 H-200 Z" fill="#2E6A42" />
          {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M-200 ${1400 + i * 130} H1280`} stroke="#1A3A24" strokeWidth="4" opacity=".6" />)}
          {Array.from({ length: 9 }, (_, i) => <path key={`v${i}`} d={`M${-100 + i * 160} 1320 L${-280 + i * 210} 2200`} stroke="#1A3A24" strokeWidth="4" opacity=".6" />)}
          <ellipse cx="540" cy="1400" rx="420" ry="70" fill={GOLD} opacity={0.15 * glow} />
          <g transform="translate(250 1235) rotate(-14)">
            <path d="M-80 0 Q-80 -56 0 -60 Q80 -56 80 0 Z" fill="#2E3A48" stroke={K} strokeWidth="6" />
            <path d="M-86 0 H86 Q60 30 -60 20 Z" fill="#1A1E24" stroke={K} strokeWidth="6" />
            <rect x="-16" y="-42" width="32" height="20" rx="4" fill="#C8A85A" stroke={K} strokeWidth="3" />
          </g>
          <g transform="translate(830 1230) rotate(10)">
            <path d="M-70 -46 Q-80 0 -60 40 Q0 60 60 40 Q80 0 70 -46 Q0 -60 -70 -46 Z" fill="#A83A2E" stroke={K} strokeWidth="6" />
            <rect x="-16" y="-70" width="32" height="28" rx="4" fill="#3A2A20" stroke={K} strokeWidth="5" />
            {[-20, 0, 20].map((y) => <path key={y} d={`M-50 ${y} H50`} stroke="#7A2A22" strokeWidth="5" />)}
          </g>
          <path d="M-200 1700 H1280 V2200 H-200 Z" fill="#0A0E0A" opacity=".45" />
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 760, x0: 360, x1: 720 }} bottom={{ y: 1300, x0: 200, x1: 880 }} seed={33} n={26} color={GOLD} boost={0.1 + 0.6 * glow} />
          <NearMotes id="gu-near" t={t} color="#FFE6A8" n={5} y0={1200} opacity={0.08} />
        </g>
      </g>
      <Finish id="gu" tint="#1E3A28" tintOpacity={0.12} />
    </svg>
  );
};
