import React from 'react';
import { camera, eio, eo, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, NearMotes, Reflection, Smoke, SunRays, WaveBand, WaveLines } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Ball, K, Raft } from './Comuni';

// Perso in mare: oceano aperto sotto un cielo enorme; la zattera malandata con la vela strappata; il pallone con la faccia
// che si allontana galleggiando; una corda che pende in acqua; all'orizzonte, la sagoma di una nave portacontainer.
// Piani: cielo e sole (0,2) · orizzonte e nave (0,35) · mare lontano (0,5) · pallone (0,7) · zattera (0,9) · onde vicine (1,2) · riflessi (1,6)

const r = rng(1100);
const GLINT = Array.from({ length: 30 }, () => ({ x: r() * 1300 - 110, y: 1040 + r() * 800, ph: r() * 6, s: 3 + r() * 5 }));

export const Wilson: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  // Wilson scivola in acqua mentre la zattera dorme, poi la corrente lo porta via
  const slip = eo(seg(t, cues[1], cues[1] + 1.2));
  const away = eio(seg(t, cues[2], cues[5]));
  const bx = 600 + 60 * slip + 300 * away, by = 1090 - 20 * slip - 70 * away + Math.sin(t * 1.8) * 6;
  const bs = 0.9 - 0.62 * away;
  // la corda tesa verso il pallone si allenta e cade: lo lascia andare
  const letGo = seg(t, cues[4] - 0.3, cues[4] + 0.6);
  const ship = eo(seg(t, cues[5], cues[5] + 1.4)); // una nave all'orizzonte

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="wi" />
        <Lin id="wi-sky" stops={[[0, '#2F78B0'], [0.3, '#6FB2DA'], [0.5, '#BFE2EE'], [0.54, '#E8F4F0']]} />
        <Lin id="wi-sea" stops={[[0, '#2A8A9E'], [0.4, '#1E6E86'], [1, '#0E3A50']]} />
        <Lin id="wi-near" stops={[[0, '#2C8AA0'], [1, '#0E3A50']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo enorme e sole alto */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1400" fill="url(#wi-sky)" />
          <SunRays id="wi-rays" x={820} y={560} t={t} color="#FFFFFF" n={12} length={900} opacity={0.22} />
          <Glow id="wi-sun" x={820} y={560} r={280} t={t} color="#FFFDF2" amp={0.04} rate={1} opacity={0.8} />
          <circle cx="820" cy="560" r="54" fill="#FFFDF2" />
        </g>

        {/* PIANO 1 — orizzonte vuoto, poi la nave portacontainer */}
        <g transform={L(0.35)}>
          <rect x="-200" y="1000" width="1480" height="300" fill="url(#wi-sea)" />
          <Reflection t={t} x={820 - cam.pan * 0.3} y={1010} color="#FFFDF2" n={10} w={110} opacity={0.5} />
          {ship > 0 && (
            <g opacity={ship} transform={`translate(${170 + 20 * ship} 1000)`}>
              <Smoke id="wi-smoke" t={t} x={70} y={-70} color="#D8E0E4" n={6} rise={140} wind={-160} r0={8} r1={34} speed={0.3} opacity={0.6} />
              <path d="M-110 0 L-96 -26 H120 L132 0 Z" fill="#4A5A66" />
              {[-90, -60, -30, 0, 30, 60].map((x, i) => <rect key={x} x={x} y={-44 - (i % 2) * 10} width="28" height={18 + (i % 2) * 10} fill={['#B5543C', '#3E7DA0', '#C9A24A'][i % 3]} opacity=".9" />)}
              <rect x="80" y="-62" width="26" height="36" fill="#E6ECEF" />
              <rect x="64" y="-80" width="10" height="20" fill="#4A5A66" />
            </g>
          )}
        </g>

        {/* PIANO 2 — mare lontano con creste */}
        <g transform={L(0.5)}>
          <WaveLines t={t} ys={[1040, 1070, 1110, 1160]} color="#BFE6EE" amp={6} w={180} speed={22} width={3} opacity={0.6} />
        </g>

        {/* PIANO 3 — il pallone che si allontana (accento dell'impronta) */}
        <g transform={L(0.7)}>
          {slip > 0 && (
            <g>
              <ellipse cx={bx} cy={by + 40 * bs} rx={110 * bs} ry={14 * bs} fill="#FFFFFF" opacity=".35" />
              <Glow id="wi-ballg" x={bx} y={by} r={180 * bs} t={t} color="#FFD3B8" amp={0.06} rate={1.5} opacity={0.4} />
              <Ball x={bx} y={by} r={70 * bs} rot={Math.sin(t * 1.3) * 14 + away * 60} face={1} dirty={0.5} />
            </g>
          )}
        </g>

        {/* PIANO 4 — la zattera malandata con la vela strappata e la corda */}
        <g transform={L(0.9)}>
          <WaveBand t={t} y={1180} fill="url(#wi-sea)" foam="#DDF2F4" amp={30} w={300} speed={50} bob={8} foamWidth={5} foamOpacity={0.7} />
          <g transform={`translate(380 ${1210 + Math.sin(t * 1.6) * 10}) rotate(${Math.sin(t * 1.2) * 5}) scale(.95)`}>
            <Raft t={t} sail={1} torn={1} ball={false} />
          </g>
          {/* corda: tesa verso il pallone, poi lasciata cadere in acqua */}
          {slip > 0 && (
            <path d={letGo < 1
              ? `M${520} ${1170} Q${(520 + bx) / 2} ${1150 + 60 * letGo + 40 * away} ${520 + (bx - 520) * (1 - letGo)} ${by + (1210 - by) * letGo}`
              : `M520 1170 q30 30 20 70 q-10 30 30 60`}
              fill="none" stroke="#E6D3A8" strokeWidth="6" strokeLinecap="round" />
          )}
          <path d="M260 1240 q-20 40 10 70" fill="none" stroke="#E6D3A8" strokeWidth="5" />
        </g>

        {/* PIANO 5 — onde vicine che incorniciano */}
        <g transform={L(1.2)}>
          <WaveBand t={t} y={1420} fill="url(#wi-near)" foam="#E8F6F8" amp={60} w={460} speed={70} bob={14} ph={2} foamWidth={8} foamOpacity={0.75} />
          <WaveLines t={t} ys={[1520, 1640, 1780]} color="#62A8BC" amp={10} w={320} speed={50} width={5} opacity={0.5} />
        </g>

        {/* PIANO 6 — riflessi di sole sull'acqua davanti alla camera */}
        <g transform={L(1.6)}>
          {GLINT.map((g, i) => (
            <path key={i} d={`M${g.x - g.s * 3} ${g.y} H${g.x + g.s * 3}`} stroke="#FFFFFF" strokeWidth={g.s * 0.8} strokeLinecap="round" opacity={0.25 + 0.5 * Math.max(0, Math.sin(t * 3 + g.ph))} />
          ))}
          <NearMotes id="wi-near" t={t} color="#FFFFFF" n={4} y0={1300} opacity={0.08} />
        </g>
      </g>
      <Finish id="wi" tint="#2A9D8F" tintOpacity={0.08} />
    </svg>
  );
};
