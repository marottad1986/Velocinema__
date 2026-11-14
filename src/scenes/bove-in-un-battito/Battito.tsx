import React from 'react';
import { camera, eo, lerp, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes, SunRays } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Ball, GIALLO, HeartLine, K, Stand, heartPath } from './Comuni';

// Dal buio al campo: l'alba dentro uno stadio vuoto. Dal prato, ad altezza d'erba, il pallone sul dischetto di
// centrocampo; dietro, la tribuna con i seggiolini vuoti e il sole che sorge sopra la copertura, raggi e foschia; rugiada
// che brilla. f1 «Dentro c'è più di un anno della sua vita»: la luce cresce. f2 «dal buio di quella sera fino al ritorno
// in campo»: la linea bianca di metà campo si accende di giallo e pulsa come un battito, una volta.
// Piani: cielo (0,2) · tribuna di fronte (0,4) · prato lontano (0,6) · pallone e linea (0,85) · erba vicina (1,2) · pulviscolo (1,5)

export const Battito: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const rise = eo(seg(t, 0, dur));
  const tBeat = griglia(cues[1] + 1.2);
  const draw = eo(seg(t, tBeat - 0.6, tBeat + 0.6));
  const pulse = Math.exp(-((t - tBeat - 0.4) ** 2) * 6);
  const LY = 1290; // linea di metà campo

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ba" />
        <Lin id="ba-sky" stops={[[0, '#2A2C4E'], [0.4, '#8A6A8A'], [0.7, '#F2A878'], [1, '#FFE0A8']]} />
        <Lin id="ba-grass" stops={[[0, '#7AA85A'], [0.3, '#4A8A3A'], [1, '#1E4A1E']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo dell'alba e sole che sorge sopra la copertura (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#ba-sky)" />
          <Glow id="ba-sun" x={540} y={lerp(860, 800, rise)} r={460 + 80 * rise} t={t} color="#FFF0C0" amp={0.02} rate={0.8} opacity={0.85} />
          <circle cx="540" cy={lerp(880, 820, rise)} r="78" fill="#FFF6D8" />
          <SunRays id="ba-rays" x={540} y={lerp(880, 820, rise)} t={t} color="#FFF0C8" n={12} length={900} width={60} opacity={0.18 + 0.12 * rise} />
        </g>
        {/* PIANO 1 — la tribuna di fronte, vuota, con la copertura in controluce (0,4) */}
        <g transform={L(0.4)}>
          <Stand id="ba-st" y0={1160} y1={900} seat="#5A5A7A" alt={GIALLO} rows={8} wall="#2A2438" lit={0.75} seed={9} />
          {/* luce radente dell'alba sui gradoni */}
          <rect x="-200" y="860" width="1480" height="300" fill="#FFC890" opacity={0.12 + 0.1 * rise} />
          {/* torri dei fari spente ai lati */}
          {[60, 1020].map((x, i) => (
            <g key={i}>
              <rect x={x - 12} y="720" width="24" height="440" fill="#2A2438" stroke={K} strokeWidth="5" />
              <rect x={x - 70} y="680" width="140" height="70" rx="6" fill="#2A2438" stroke={K} strokeWidth="6" />
              {Array.from({ length: 8 }, (_, k) => <circle key={k} cx={x - 52 + (k % 4) * 35} cy={700 + Math.floor(k / 4) * 30} r="10" fill="#5A5470" />)}
            </g>
          ))}
          <rect x="-200" y="1160" width="1480" height="30" fill="#2A2438" />
        </g>
        {/* PIANO 2 — il prato con le strisce e la foschia del mattino (0,6) */}
        <g transform={L(0.6)}>
          <rect x="-200" y="1190" width="1480" height="900" fill="url(#ba-grass)" />
          {Array.from({ length: 7 }, (_, i) => <rect key={i} x="-200" y={1190 + i * 40 + i * i * 14} width="1480" height={18 + i * 10} fill="#8ABA6A" opacity=".3" />)}
          <path d="M-200 1190 H1280 L1280 1260 Q540 1230 -200 1260 Z" fill="#FFE8C8" opacity={0.25 + 0.15 * rise} />
          {/* cerchio di centrocampo in prospettiva */}
          <ellipse cx="540" cy={LY + 10} rx="420" ry="90" fill="none" stroke="#F4F6EC" strokeWidth="9" opacity=".8" />
        </g>
        {/* PIANO 3 — la linea di metà campo che diventa battito, il pallone sul dischetto (0,85) */}
        <g transform={L(0.85)}>
          <path d={`M-260 ${LY} H1340`} stroke="#F4F6EC" strokeWidth="12" opacity={0.85 * (1 - draw)} />
          <HeartLine d={heartPath(-260, 1340, LY, [780], 150 + 60 * pulse, 110)} draw={draw} len={2600} width={12} glow={0.4 + 0.5 * pulse} />
          <Glow id="ba-beat" x={780} y={LY - 60} r={220} t={t} color="#FFE07A" amp={0.04} rate={3} opacity={0.7 * pulse} />
          <Glow id="ba-ball" x={540} y={LY - 40} r={180} t={t} color="#FFF0C8" amp={0.04} rate={1.5} opacity={0.4} />
          <Ball x={540} y={LY - 40} r={46} rot={12} />
        </g>
        {/* PIANO 4 — ciuffi d'erba vicini con la rugiada che brilla (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1720 Q540 1690 1280 1720 V2200 H-200 Z" fill="#1A3A18" />
          {Array.from({ length: 34 }, (_, i) => {
            const x = -160 + i * 42, h = 70 + ((i * 53) % 80);
            const sw = Math.sin(t * 1.2 + i) * 6;
            return (
              <g key={i}>
                <path d={`M${x} 1760 q${8 + sw} ${-h * 0.6} ${14 + sw * 1.5} ${-h}`} stroke="#3A6A2A" strokeWidth="10" fill="none" strokeLinecap="round" />
                {i % 3 === 0 && <circle cx={x + 14 + sw * 1.5} cy={1760 - h} r={5} fill="#FFFFFF" opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i))} />}
              </g>
            );
          })}
        </g>
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 820, x0: 340, x1: 740 }} bottom={{ y: 1600, x0: 0, x1: 1080 }} n={40} color="#FFF0C8" seed={41} />
          <NearMotes id="ba-near" t={t} color="#FFE8C0" n={6} r0={50} r1={140} y0={1000} y1={1900} opacity={0.1} />
        </g>
      </g>
      <Finish id="ba" tint="#E8913A" tintOpacity={0.08} />
    </svg>
  );
};
