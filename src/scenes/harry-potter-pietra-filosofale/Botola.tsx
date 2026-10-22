import React from 'react';
import { camera, eio, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Dust, Glow, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K } from './Comuni';

// La botola: sotterraneo enorme sotto la botola; liane che si attorcigliano, uno sciame di chiavi con le ali e una
// scacchiera gigante con pezzi di pietra alti come case; un cavallo che cade in frantumi (Ron si sacrifica).
// Piani: volta del sotterraneo (0,2) · chiavi con le ali (0,4) · scacchiera e pezzi (0,6) · cavallo che cade (0,75) · liane in primo piano (1,25) · polvere (1,6)

const r = rng(3030);
const KEYS = Array.from({ length: 18 }, () => ({ x: r() * 1000 + 40, y: 560 + r() * 280, ph: r() * 6, s: 0.6 + r() * 0.5 }));
const SHARDS = Array.from({ length: 14 }, () => ({ vx: (r() - 0.5) * 400, vy: 120 + r() * 220, rot: (r() - 0.5) * 400, s: 14 + r() * 20 }));

/** Pezzo degli scacchi di pietra: re, regina, torre, alfiere, pedone (profili semplici). */
const Piece: React.FC<{ x: number; y: number; s: number; kind: 'king' | 'queen' | 'rook' | 'bishop' | 'pawn'; dark?: boolean }> = ({ x, y, s, kind, dark }) => {
  const fill = dark ? '#3A3644' : '#C9C2B0';
  const top = {
    king: <path d="M-30 -260 H30 L20 -200 H-20 Z M-8 -320 H8 V-260 H-8 Z M-26 -300 H26 V-284 H-26 Z" />,
    queen: <path d="M-40 -270 L-20 -230 L0 -280 L20 -230 L40 -270 L30 -200 H-30 Z" />,
    rook: <path d="M-44 -270 V-240 H-24 V-270 H-8 V-240 H8 V-270 H24 V-240 H44 V-270 H44 V-200 H-44 Z" />,
    bishop: <path d="M0 -300 Q40 -250 24 -200 H-24 Q-40 -250 0 -300 Z" />,
    pawn: <circle cx="0" cy="-200" r="34" />,
  }[kind];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill} stroke={K} strokeWidth="7" strokeLinejoin="round">
      <path d="M-70 0 H70 L56 -40 H-56 Z" />
      <path d={`M-40 -40 Q-30 -140 -26 ${kind === 'pawn' ? -170 : -200} H26 Q30 -140 40 -40 Z`} />
      {top}
    </g>
  );
};

export const Botola: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const vines = eio(seg(t, cues[3], cues[3] + 1)); // «una pianta che stritola»
  const keys = seg(t, cues[3] + 0.6, cues[3] + 1.2); // «chiavi che volano»
  const fall = eio(seg(t, cues[4] + 1.2, cues[4] + 2.0)); // «Ron si sacrifica»: il cavallo crolla
  const crash = seg(t, cues[4] + 2.0, cues[4] + 2.8);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="bt" />
        <Lin id="bt-vault" stops={[[0, '#0A0814'], [0.5, '#1A1626'], [1, '#2A2436']]} />
      </defs>
      <g transform={cam.transform}>
        {/* volta del sotterraneo con la luce della botola */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#bt-vault)" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${-200 + i * 300} 1100 Q${-50 + i * 300} 540 ${100 + i * 300} 1100`} fill="none" stroke="#2A2436" strokeWidth="16" />)}
          <Beam id="bt-trap" x={540} y={500} t={t} length={900} spread={380} color="#FFE8B8" angle={90} opacity={0.2} />
        </g>
        {/* chiavi con le ali (accento) */}
        <g transform={L(0.4)} opacity={0.3 + 0.7 * keys}>
          {KEYS.map((k, i) => {
            const x = k.x + Math.sin(t * 1.3 + k.ph) * 60, y = k.y + Math.cos(t * 1.7 + k.ph) * 30;
            const w = Math.abs(Math.sin(t * 18 + k.ph));
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${k.s}) rotate(${Math.sin(t + k.ph) * 20})`}>
                {[-1, 1].map((d) => <path key={d} d={`M0 -6 Q${d * 30} ${-30 * w} ${d * 46} ${-10 * w} Q${d * 26} 0 0 4 Z`} fill="#E8E2D0" stroke={K} strokeWidth="2.5" />)}
                <circle cx="-26" cy="0" r="12" fill="none" stroke={i === 3 ? P.accento : '#B8A880'} strokeWidth="6" />
                <path d="M-14 0 H30 M18 0 v10 M26 0 v8" stroke={i === 3 ? P.accento : '#B8A880'} strokeWidth="6" />
              </g>
            );
          })}
        </g>
        {/* scacchiera gigante con i pezzi di pietra */}
        <g transform={L(0.6)}>
          {Array.from({ length: 40 }, (_, i) => {
            const row = Math.floor(i / 8), col = i % 8;
            const y0 = 1000 + row * 60, w = 140 + row * 30;
            const x0 = 540 - 4 * w + col * w;
            return <path key={i} d={`M${x0} ${y0} H${x0 + w} L${x0 + w + (col - 3.5) * 6} ${y0 + 60} H${x0 + (col - 4.5) * 6} Z`} fill={(row + col) % 2 ? '#2A2634' : '#8A8478'} />;
          })}
          <Piece x={160} y={1060} s={0.75} kind="rook" dark />
          <Piece x={330} y={1040} s={0.7} kind="king" dark />
          <Piece x={760} y={1050} s={0.72} kind="queen" />
          <Piece x={930} y={1070} s={0.78} kind="bishop" />
          <Piece x={470} y={1120} s={0.6} kind="pawn" />
          <Piece x={640} y={1150} s={0.62} kind="pawn" dark />
        </g>
        {/* il cavallo bianco che cade in frantumi */}
        <g transform={L(0.75)}>
          <g transform={`translate(560 1240) rotate(${-80 * fall} 60 0)`} opacity={1 - crash}>
            <g fill="#C9C2B0" stroke={K} strokeWidth="8" strokeLinejoin="round">
              <path d="M-80 0 H80 L64 -44 H-64 Z" />
              <path d="M-50 -44 Q-40 -140 -30 -180 Q-60 -240 -10 -300 Q40 -330 70 -300 L100 -230 L60 -220 L40 -180 Q50 -120 50 -44 Z" />
              <circle cx="20" cy="-270" r="8" fill={K} />
            </g>
          </g>
          {crash > 0 && crash < 1 && SHARDS.map((s, i) => (
            <rect key={i} x={620 + s.vx * crash} y={1180 - s.vy * crash + 400 * crash * crash} width={s.s} height={s.s * 0.7} fill="#C9C2B0" stroke={K} strokeWidth="3" transform={`rotate(${s.rot * crash} ${620 + s.vx * crash} ${1180 - s.vy * crash + 400 * crash * crash})`} opacity={1 - crash * 0.6} />
          ))}
          {crash > 0 && <Glow id="bt-dust" x={620} y={1220} r={300} t={t} color="#C9C2B0" amp={0} opacity={0.4 * (1 - crash)} />}
        </g>
        {/* liane che si attorcigliano in primo piano */}
        <g transform={L(1.25)}>
          {[[-80, 1940, 1], [1160, 1940, -1], [-60, 520, 1]].map(([x, y, d], i) => (
            <g key={i}>
              {[0, 1, 2].map((k) => {
                const len = 500 + k * 120 + 200 * vines;
                const sw = Math.sin(t * 1.5 + k + i) * 30;
                return <path key={k} d={`M${x} ${y} C${x + d * 200} ${y - len * 0.3 * (i === 2 ? -1 : 1)} ${x + d * (60 + sw)} ${y - len * 0.6 * (i === 2 ? -1 : 1)} ${x + d * (260 + k * 60 + sw)} ${y - len * (i === 2 ? -0.5 : 1)}`} stroke={k % 2 ? '#2E4A24' : '#3E5E2E'} strokeWidth={34 - k * 8} fill="none" strokeLinecap="round" />;
              })}
            </g>
          ))}
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 500, x0: 440, x1: 640 }} bottom={{ y: 1300, x0: 200, x1: 880 }} seed={6} n={24} color="#FFE8B8" boost={crash} />
          <NearMotes id="bt-near" t={t} color="#E8E2D0" n={5} y0={1300} opacity={0.07 + 0.03 * mod(t, 1)} />
        </g>
      </g>
      <Finish id="bt" tint="#1E1A3A" tintOpacity={0.12} />
    </svg>
  );
};
