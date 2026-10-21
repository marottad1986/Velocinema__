import React from 'react';
import { camera, eio, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, NearMotes, Stars, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { GOLD, Ring, Saturn } from './Spazio';

// Il varco: nello spazio, Saturno con gli anelli; l'astronave ad anello che ruota lentamente; il varco, una sfera che
// deforma le stelle come una lente e mostra dentro un'altra galassia. Nessuna persona.
// Eventi: l'astronave si avvicina (cue 2) · entra nel varco: si rimpicciolisce dentro la sfera, lampo e stelle che si
//         allungano (cue 3).
// Piani: stelle lontane (0,15) · Saturno (0,3) · varco (0,45) · astronave (0,7) · frammenti degli anelli in primo piano (1,3)
//        · particelle (1,8)

const K = '#0A0F18';
const r = rng(48);
const ICE = Array.from({ length: 16 }, () => ({ x: r() * 1500 - 200, y: 1420 + r() * 480, s: 10 + r() * 34, ph: r() * 6, sp: 20 + r() * 40 }));
const STREAKS = Array.from({ length: 40 }, () => ({ a: r() * Math.PI * 2, d: 60 + r() * 700, l: 40 + r() * 120 }));

export const Varco: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const approach = eio(seg(t, 0.5, cues[3]));
  const enter = eio(seg(t, cues[3], cues[3] + 1.2));
  const flash = flashAt(t, [cues[3] + 1.1], [0.8]);
  const streak = seg(t, cues[3] + 0.8, dur);
  const hx = 740, hy = 760; // centro del varco
  const shipX = lerp(lerp(300, 560, approach), hx, enter);
  const shipY = lerp(lerp(1130, 980, approach), hy, enter);
  const shipR = lerp(lerp(150, 110, approach), 6, enter);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="va" />
        <Lin id="va-space" stops={[[0, '#02040A'], [0.5, '#081020'], [1, '#04070E']]} />
        <radialGradient id="va-lens">
          <stop offset="0" stopColor="#2A1E48" />
          <stop offset=".55" stopColor="#4A3A7A" />
          <stop offset=".8" stopColor="#8EB8D8" />
          <stop offset=".93" stopColor="#F2E8D0" />
          <stop offset="1" stopColor="#F2E8D0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="va-gal">
          <stop offset="0" stopColor="#FFF0D8" />
          <stop offset=".3" stopColor="#C9A8E8" stopOpacity=".7" />
          <stop offset="1" stopColor="#4A3A7A" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — stelle lontane (0,15) */}
        <g transform={L(0.15)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#va-space)" />
          <Stars t={t} seed={3} n={90} y={-100} h={2000} color="#DCE8F2" size={0.7} />
          <Stars t={t} seed={8} n={30} y={-100} h={2000} color="#FFF0D8" size={1.1} />
        </g>

        {/* PIANO 1 — Saturno (0,3) */}
        <g transform={L(0.3)}>
          <Glow id="va-satg" x={220} y={1240} r={420} t={t} color="#F2DDB0" amp={0.03} rate={0.6} opacity={0.25} />
          <Saturn id="va-sat" x={200} y={1250} r={210} outline={K} />
        </g>

        {/* PIANO 2 — il varco: sfera-lente con un'altra galassia dentro (0,45) */}
        <g transform={L(0.45)}>
          <Glow id="va-hg" x={hx} y={hy} r={460} t={t} color="#8EB8D8" amp={0.06} rate={1.4} opacity={0.35 + 0.3 * enter} />
          <circle cx={hx} cy={hy} r={210} fill="url(#va-lens)" />
          <g transform={`translate(${hx} ${hy}) rotate(${t * 12})`}>
            <ellipse rx="110" ry="40" fill="url(#va-gal)" />
            {[0, 1, 2].map((k) => <ellipse key={k} rx={70 + k * 28} ry={(70 + k * 28) * 0.32} fill="none" stroke="#E8D8F8" strokeWidth="3" opacity={0.5 - k * 0.12} transform={`rotate(${k * 30})`} />)}
          </g>
          {/* stelle deformate intorno al bordo (anelli di Einstein) */}
          {[0, 1, 2].map((k) => <circle key={k} cx={hx} cy={hy} r={196 - k * 22} fill="none" stroke="#F2E8D0" strokeWidth={3 - k * 0.6} strokeDasharray={`${4 + k * 6} ${18 + k * 10}`} strokeDashoffset={-t * (20 + k * 12)} opacity={0.75 - k * 0.15} />)}
          <circle cx={hx} cy={hy} r="212" fill="none" stroke={GOLD} strokeWidth="2" opacity=".5" />
        </g>

        {/* PIANO 3 — l'astronave che si avvicina ed entra (0,7) */}
        <g transform={L(0.7)}>
          {shipR > 8 && <Ring x={shipX} y={shipY} r={shipR} t={t} spin={0.35} tiltY={0.4} outline={K} lit="#DCE4EA" />}
          {shipR > 8 && <Glow id="va-eng" x={shipX - shipR * 0.2} y={shipY + shipR * 0.15} r={shipR * 0.5} t={t} color="#8EB8D8" amp={0.2} rate={9} opacity={0.6} />}
          {enter > 0.85 && <circle cx={hx} cy={hy} r={20 + 120 * seg(enter, 0.85, 1)} fill="#F2E8D0" opacity={1 - seg(enter, 0.9, 1)} />}
        </g>

        {/* stelle che si allungano verso il centro dopo l'ingresso */}
        {streak > 0 && (
          <g opacity={streak}>
            {STREAKS.map((s, i) => {
              const d = mod(s.d - t * 500, 760) + 40;
              const x = hx + Math.cos(s.a) * d, y = hy + Math.sin(s.a) * d;
              return <path key={i} d={`M${x} ${y} L${x + Math.cos(s.a) * s.l * streak} ${y + Math.sin(s.a) * s.l * streak}`} stroke="#DCE8F2" strokeWidth="3" strokeLinecap="round" opacity=".7" />;
            })}
          </g>
        )}
        <rect x="-200" y="-200" width="1480" height="2320" fill="#F2E8D0" opacity={flash * 0.4} />

        {/* PIANO 4 — frammenti di ghiaccio degli anelli in primo piano (1,3) */}
        <g transform={L(1.3)}>
          {ICE.map((c, i) => {
            const x = mod(c.x - t * c.sp, 1500) - 200;
            return (
              <g key={i} transform={`translate(${x} ${c.y + Math.sin(t * 0.6 + c.ph) * 10}) rotate(${t * 20 + c.ph * 50})`}>
                <path d={`M${-c.s} 0 L${-c.s * 0.3} ${-c.s * 0.8} L${c.s * 0.7} ${-c.s * 0.5} L${c.s} ${c.s * 0.2} L${c.s * 0.1} ${c.s * 0.8} Z`} fill="#C9D3DB" stroke={K} strokeWidth="4" />
                <path d={`M${-c.s * 0.5} ${-c.s * 0.3} L${c.s * 0.3} ${-c.s * 0.45}`} stroke="#FFFFFF" strokeWidth="3" opacity=".7" />
              </g>
            );
          })}
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="va-near" t={t} color="#DCE8F2" n={6} vx={-40} vy={-4} opacity={0.06} />
        </g>
      </g>

      <Finish id="va" tint="#3E6A8A" tintOpacity={0.1} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): avvicinamento da 0,5 a cue3 · ingresso nel varco cue3 → +1,2, lampo + 1,1 · stelle allungate dopo.
