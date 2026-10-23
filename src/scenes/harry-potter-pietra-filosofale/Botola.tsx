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
const KEYS = Array.from({ length: 18 }, () => ({ x: r() * 1000 + 40, y: 660 + r() * 260, ph: r() * 6, s: 0.6 + r() * 0.5 }));
const SHARDS = Array.from({ length: 16 }, () => ({ vx: (r() - 0.5) * 520, vy: 140 + r() * 240, rot: (r() - 0.5) * 300, s: 24 + r() * 34, k: r() }));
const BLOCKS = Array.from({ length: 60 }, () => ({ c: r() }));
/** Scacchiera in prospettiva: righe dal fondo (0) al davanti (5), colonne che convergono al centro. */
const ROW_Y = (k: number) => 1000 + 56 * k + 6 * k * k;
const ROW_W = (k: number) => 560 + 150 * k; // metà larghezza della scacchiera alla riga k

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
          {/* volta di pietra: blocchi e grandi archi pieni */}
          {BLOCKS.map((b, i) => {
            const row = Math.floor(i / 6), col = i % 6;
            return <rect key={i} x={-200 + col * 250 + (row % 2) * 125} y={420 + row * 70} width="240" height="64" fill={b.c > 0.5 ? '#221E2E' : '#1A1724'} stroke="#0E0C16" strokeWidth="4" />;
          })}
          {[-140, 540, 1220].map((cx) => (
            <path key={cx} d={`M${cx - 300} 1100 V760 A300 300 0 0 1 ${cx + 300} 760 V1100 H${cx + 230} V770 A230 230 0 0 0 ${cx - 230} 770 V1100 Z`} fill="#2E2A3A" stroke={K} strokeWidth="8" />
          ))}
          <Beam id="bt-trap" x={780} y={560} t={t} length={900} spread={380} color="#FFE8B8" angle={100} opacity={0.2} />
          <Glow id="bt-trapg" x={780} y={560} r={160} t={t} color="#FFE8B8" amp={0.05} rate={1} opacity={0.5} />
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
          {Array.from({ length: 64 }, (_, i) => {
            const k = Math.floor(i / 8), c = i % 8;
            const x = (kk: number, cc: number) => 540 + ((cc - 4) / 4) * ROW_W(kk);
            return <path key={i} d={`M${x(k, c)} ${ROW_Y(k)} H${x(k, c + 1)} L${x(k + 1, c + 1)} ${ROW_Y(k + 1)} H${x(k + 1, c)} Z`} fill={(k + c) % 2 ? '#2A2634' : '#8A8478'} stroke="#14121C" strokeWidth="2" />;
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
          {/* i pezzi di pietra volano e restano a terra (sopra la fascia dei sottotitoli), con una nube di polvere */}
          {crash > 0 && SHARDS.map((s, i) => {
            const e = Math.min(1, crash * 1.3);
            const x = 620 + s.vx * e;
            const y = Math.min(1240 - s.k * 30, 1160 - s.vy * e + 520 * e * e);
            return <path key={i} d={`M0 0 L${s.s} ${s.s * 0.2} L${s.s * 0.8} ${s.s * 0.8} L${s.s * 0.1} ${s.s * 0.6} Z`} transform={`translate(${x} ${y}) rotate(${s.rot * e})`} fill={i % 3 ? '#C9C2B0' : '#A8A090'} stroke={K} strokeWidth="4" />;
          })}
          {crash > 0 && <Glow id="bt-dust" x={620} y={1180} r={260 + 200 * crash} t={t} color="#D8D0C0" amp={0} opacity={0.55 * (1 - 0.6 * crash)} />}
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
          <Dust t={t} top={{ y: 560, x0: 680, x1: 880 }} bottom={{ y: 1300, x0: 200, x1: 880 }} seed={6} n={24} color="#FFE8B8" boost={crash} />
          <NearMotes id="bt-near" t={t} color="#E8E2D0" n={5} y0={1300} opacity={0.07 + 0.03 * mod(t, 1)} />
        </g>
      </g>
      <Finish id="bt" tint="#1E1A3A" tintOpacity={0.12} />
    </svg>
  );
};
