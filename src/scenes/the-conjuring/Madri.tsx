import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { HAND } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { Carillon, ConjDefs, GOLD, K, TINT_NOTTE } from './Comuni';

// La maledizione delle madri: la bacheca di sughero nello studio dei Warren, sotto la lampada. Al centro la vecchia mappa
// della terra di Bathsheba con l'albero e le case costruite negli anni. Su «omicidi e suicidi» si appuntano uno dopo
// l'altro i ritagli di giornale ingialliti, e i fili rossi li legano alle case della mappa; su «anche Rory fu ucciso da
// sua madre» il ritaglio con il disegno del carillon si accende d'oro; su «ora Bathsheba vuole che Carolyn uccida le
// sue figlie» l'ultimo spillo rosso si pianta sulla fattoria dei Perron e tutti i fili si tendono verso di lei. Nessuna
// persona: i ritagli hanno solo titoli e disegni di case e oggetti.
// Piani: parete (0,25) · bacheca e mappa (0,55) · ritagli e fili (0,62) · spilli (0,7) · lampada e tazza in primo piano (1,2) · polvere (1,6)

const CASE = [
  { x: 330, y: 820, anno: '1885' },
  { x: 720, y: 790, anno: '1921' },
  { x: 380, y: 1080, anno: '1937' },
  { x: 780, y: 1060, anno: '1971' }, // la fattoria dei Perron
];
const RITAGLI = [
  { x: 190, y: 720, r: -6, casa: 0 },
  { x: 900, y: 730, r: 5, casa: 1 },
  { x: 200, y: 1020, r: 4, casa: 2, rory: true },
];

const Casetta: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = '#5A3A2A' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-30 0 V-34 L0 -58 L30 -34 V0 Z" fill="#E8DCC0" stroke={c} strokeWidth="5" strokeLinejoin="round" />
    <rect x="-8" y="-20" width="16" height="20" fill={c} />
  </g>
);

export const Madri: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const beat = 60 / 72;
  const t0 = griglia(cues[0] + 0.8);
  const clip = RITAGLI.map((_, i) => eob(seg(t, t0 + i * beat, t0 + i * beat + 0.4), 1.4));
  const thread = RITAGLI.map((_, i) => eo(seg(t, t0 + i * beat + 0.3, t0 + i * beat + 0.9)));
  const tRory = griglia(cues[1] + 1.2);
  const rory = eo(seg(t, tRory, tRory + 0.6));
  const tPin = griglia(cues[2] + 1.0);
  const pin = eob(seg(t, tPin, tPin + 0.35), 2);
  const pull = eo(seg(t, tPin + 0.2, tPin + 1.0));
  const P = CASE[3];

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="md" />
        <ConjDefs id="md" />
        <Lin id="md-wall" stops={[[0, '#1E1A16'], [0.5, '#2E2620'], [1, '#14100C']]} x2={1} y2={0} />
        <Lin id="md-cork" stops={[[0, '#A07A4A'], [0.5, '#8A6438'], [1, '#6A4A28']]} x2={1} y2={1} />
        <Lin id="md-map" stops={[[0, '#E8D8B0'], [1, '#C8B488']]} />
        <pattern id="md-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="4" r="1.6" fill="#5A3A1A" opacity=".35" />
          <circle cx="10" cy="11" r="1.3" fill="#C8A070" opacity=".35" />
        </pattern>
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.25)}>
          <rect x="-300" y="-200" width="1700" height="1600" fill="url(#md-wall)" />
        </g>
        {/* la bacheca di sughero con la mappa della terra di Bathsheba */}
        <g transform={L(0.55)}>
          <rect x="60" y="620" width="960" height="700" rx="10" fill="#3A2414" stroke={K} strokeWidth="10" />
          <rect x="84" y="644" width="912" height="652" fill="url(#md-cork)" />
          <rect x="84" y="644" width="912" height="652" fill="url(#md-dots)" />
          <g transform="translate(0 20) rotate(-1.5 540 940)">
            <rect x="230" y="700" width="640" height="460" fill="url(#md-map)" stroke="#6A4A28" strokeWidth="5" />
            {/* confine della terra, ruscello, sentieri */}
            <path d="M270 740 L830 730 L840 1120 L260 1130 Z" fill="none" stroke="#8A2A22" strokeWidth="5" strokeDasharray="16 10" />
            <path d="M240 960 Q400 920 520 980 Q640 1040 860 990" stroke="#6A8AA8" strokeWidth="8" fill="none" opacity=".7" />
            <path d="M560 760 Q540 900 600 1120" stroke="#8A6A4A" strokeWidth="5" fill="none" strokeDasharray="4 10" strokeLinecap="round" />
            {/* l'albero della strega al centro */}
            <g transform="translate(560 900)">
              <path d="M-6 0 V-40 M0 -30 L-26 -56 M0 -36 L22 -64 M-12 -46 L-30 -44 M10 -50 L30 -52" stroke="#2A1A10" strokeWidth="6" strokeLinecap="round" />
              <circle cx="0" cy="-40" r="44" fill="none" stroke="#8A2A22" strokeWidth="3" opacity=".6" />
            </g>
            {CASE.map((c, i) => (
              <g key={i}>
                <Casetta x={c.x} y={c.y} s={1} c={i === 3 ? '#8A2A22' : '#5A3A2A'} />
                <text x={c.x} y={c.y + 40} fontSize="32" textAnchor="middle" fontFamily={HAND} fill="#3A2414">{c.anno}</text>
              </g>
            ))}
          </g>
        </g>
        {/* i ritagli di giornale e i fili rossi */}
        <g transform={L(0.62)}>
          {RITAGLI.map((r, i) => {
            const c = CASE[r.casa];
            const end = pull > 0 ? { x: lerp(c.x, P.x, pull * 0.35), y: lerp(c.y - 30, P.y - 30, pull * 0.35) } : { x: c.x, y: c.y - 30 };
            const p = thread[i];
            return (
              <path key={`f${i}`} d={`M${r.x} ${r.y + 40} Q${(r.x + end.x) / 2} ${(r.y + end.y) / 2 + 60 * (1 - pull)} ${lerp(r.x, end.x, p)} ${lerp(r.y + 40, end.y, p)}`}
                stroke="#C8302A" strokeWidth="5" fill="none" />
            );
          })}
          {pull > 0 && CASE.slice(0, 3).map((c, i) => (
            <path key={`p${i}`} d={`M${c.x} ${c.y - 30} L${lerp(c.x, P.x, pull)} ${lerp(c.y - 30, P.y - 30, pull)}`} stroke="#C8302A" strokeWidth="5" />
          ))}
          {RITAGLI.map((r, i) => {
            const s = clip[i];
            return (
              <g key={i} transform={`translate(${r.x} ${r.y}) rotate(${r.r}) scale(${s})`} opacity={seg(s, 0, 0.2)}>
                {r.rory && rory > 0 && <Glow id="md-rg" x={0} y={40} r={220} t={t} color={GOLD} amp={0.08} rate={3} opacity={0.85 * rory} />}
                <rect x="-120" y="-70" width="240" height="230" fill="#E8DCB8" stroke={r.rory && rory > 0.5 ? GOLD : '#8A7A5A'} strokeWidth={r.rory && rory > 0.5 ? 8 : 3} />
                <rect x="-108" y="-58" width="216" height="34" fill="#2A2420" opacity=".85" />
                {[0, 1, 2, 3].map((j) => <path key={j} d={`M-104 ${110 + j * 12} H${j === 3 ? 40 : 104}`} stroke="#6A5A4A" strokeWidth="4" opacity=".6" />)}
                <rect x="-104" y="-14" width="208" height="110" fill="#B8A888" stroke="#6A5A4A" strokeWidth="3" />
                {r.rory ? (
                  <g transform="translate(0 70) scale(.42)">
                    <Carillon id="md" x={0} y={0} t={t} open={1} glow={rory} />
                  </g>
                ) : (
                  <Casetta x={0} y={80} s={1.3} c="#3A2A20" />
                )}
                <circle cx="0" cy="-74" r="11" fill="#C8302A" stroke={K} strokeWidth="3" />
              </g>
            );
          })}
        </g>
        {/* l'ultimo spillo che si pianta sulla fattoria dei Perron */}
        <g transform={L(0.7)}>
          {pin > 0 && (
            <g transform={`translate(${P.x - 6} ${lerp(P.y - 260, P.y - 40, Math.min(1, pin))}) rotate(-1.5)`}>
              <Glow id="md-pin" x={0} y={0} r={140} t={t} color="#E8302A" amp={0.1} rate={3} opacity={0.5 * seg(pin, 0.8, 1)} />
              <path d="M0 0 V38" stroke="#C8C8C0" strokeWidth="4" />
              <circle cx="0" cy="-4" r="20" fill="#E8302A" stroke={K} strokeWidth="5" />
              <circle cx="-6" cy="-10" r="6" fill="#FFFFFF" opacity=".6" />
            </g>
          )}
        </g>
        {/* primo piano: la lampada da tavolo a destra e una tazza con il cucchiaino */}
        <g transform={L(1.2)}>
          <path d="M-300 1340 H1400 V2200 H-300 Z" fill="#1A120C" />
          <path d="M-300 1340 H1400" stroke="#5A3E24" strokeWidth="16" />
          <g transform="translate(1110 1340)">
            <path d="M-60 0 Q-60 -20 0 -24 Q60 -20 60 0 Z" fill="url(#md-brass)" stroke={K} strokeWidth="6" />
            <path d="M0 -24 L-60 -400" stroke="url(#md-brass)" strokeWidth="12" />
            <path d="M-200 -400 Q-190 -470 -60 -480 Q60 -470 70 -400 Z" fill="#2A4A3A" stroke={K} strokeWidth="8" />
            <path d="M-200 -400 H70" stroke="#FFE8B0" strokeWidth="8" />
          </g>
          <Glow id="md-lamp" x={960} y={980} r={600} t={t} color="#FFD890" amp={0.04} rate={2} opacity={0.32} />
          <g transform="translate(60 1340)">
            <path d="M-70 0 H70 L60 -110 H-60 Z" fill="#E8E2D2" stroke={K} strokeWidth="7" />
            <path d="M60 -90 Q110 -80 100 -40 Q90 -20 64 -26" stroke={K} strokeWidth="8" fill="none" />
            <path d="M30 -110 L60 -180" stroke="#B8B8B0" strokeWidth="8" strokeLinecap="round" />
          </g>
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 900, x0: 700, x1: 900 }} bottom={{ y: 1300, x0: 400, x1: 1000 }} seed={88} n={20} color="#FFE6B0" boost={0.1} />
          <NearMotes id="md-near" t={t} color="#FFE6B0" n={5} y0={1100} opacity={0.06} />
        </g>
      </g>
      <Finish id="md" tint={TINT_NOTTE} tintOpacity={0.1} />
    </svg>
  );
};
