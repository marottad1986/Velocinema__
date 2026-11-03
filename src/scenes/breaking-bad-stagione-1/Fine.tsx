import React from 'react';
import { camera, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Glow, NearMotes, Smoke } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { BBDefs, Cristalli, K, Ombra, ORO } from './Comuni';

// Soci di un pazzo: uno sfasciacarrozze al tramonto, il luogo della consegna. Persone mai: la violenza di Tuco si
// racconta con quello che resta. Eventi: prima frase sul cofano dell'auto ci sono il pacco di cristalli e le mazzette
// (la consegna), poi un colpo: l'auto sobbalza, si alza una nuvola di polvere dietro e a terra cadono gli occhiali da
// sole dell'uomo picchiato; seconda frase i corvi si alzano in volo dalle cataste; terza frase il sole scende, la luce
// diventa rossa e il magnete della gru oscilla sopra l'auto mentre i fari si accendono come due occhi.
// Piani: cielo del tramonto (0,22) · monti lontani (0,35) · cataste di auto schiacciate e gru (0,5)
//        · l'auto della consegna con cofano, soldi e cristalli (0,72) · pneumatici e bidone in primo piano (1,25)
//        · polvere e corvi vicini (1,5–1,8)

const r = rng(1111);
const STACKS = [
  { x: -120, n: 5, w: 300 }, { x: 180, n: 3, w: 260 }, { x: 700, n: 4, w: 280 }, { x: 960, n: 6, w: 300 },
];
const COLORS = ['#7A3A2A', '#3A5A6A', '#8A7A4A', '#4A4A52', '#6A2A3A', '#5A6A4A', '#9A5A2A'];
const CROWS = Array.from({ length: 6 }, () => ({ x: 60 + r() * 960, y: 820 + r() * 120, vx: (r() - 0.5) * 500, vy: -200 - r() * 200, ph: r() * 6 }));

const Corvo: React.FC<{ x: number; y: number; flap: number; s?: number }> = ({ x, y, flap, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M0 0 Q-20 ${-16 * flap} -40 ${-6 * flap} Q-20 ${-4} 0 4 Q20 -4 40 ${-6 * flap} Q20 ${-16 * flap} 0 0 Z`} fill="#141012" stroke={K} strokeWidth="2" />
    <ellipse cx="0" cy="2" rx="10" ry="6" fill="#141012" />
    <path d="M8 0 l8 -2 l-6 4 Z" fill="#3A3A3A" />
  </g>
);

export const Fine: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tHit = griglia(cues[0] + 1.6);
  const hit = t >= tHit;
  const jolt = hit && t < tHit + 0.35 ? Math.sin(t * 60) * 8 * (1 - seg(t, tHit, tHit + 0.35)) : 0;
  const puff = seg(t, tHit, tHit + 1.6);
  const glassFall = seg(t, tHit + 0.05, tHit + 0.5);
  const tCrows = griglia(cues[1] + 0.2);
  const fly = seg(t, tCrows, tCrows + 2.4);
  const dusk = eo(seg(t, griglia(cues[2]), dur));
  const eyes = eo(seg(t, griglia(cues[2] + 1.0), griglia(cues[2] + 1.0) + 0.4));
  const sway = Math.sin(t * 0.9) * (6 + 10 * dusk);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fn" />
        <BBDefs id="fn" />
        <Lin id="fn-sky" stops={[[0, '#2A1E3A'], [0.32, '#8A3A3A'], [0.5, '#E87A3A'], [0.6, '#F2C068']]} />
        <Lin id="fn-ground" stops={[[0, '#8A6448'], [0.4, '#5A3E2A'], [1, '#1E140C']]} />
        <Lin id="fn-car" stops={[[0, '#3A4A5A'], [0.5, '#2A3644'], [1, '#141C24']]} />
        <Lin id="fn-rust" x2={1} y2={0} stops={[[0, '#8A4A2A'], [1, '#4A2414']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo del tramonto, sole che scende (0,22) */}
        <g transform={L(0.22)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#fn-sky)" />
          <rect x="-200" y="-200" width="1480" height="2400" fill="#2A0E1A" opacity={0.35 * dusk} />
          <Glow id="fn-sun" x={760} y={lerp(980, 1060, dusk)} r={460} t={t} color="#FFB060" amp={0.03} rate={0.8} opacity={0.8 - 0.3 * dusk} />
          <circle cx="760" cy={lerp(980, 1060, dusk)} r="74" fill="#FFE0A0" />
          {[0, 1, 2].map((k) => <ellipse key={k} cx={mod(200 + k * 380 + t * 6, 1400) - 160} cy={760 + k * 50} rx={180 - k * 30} ry="14" fill="#C85A4A" opacity=".6" />)}
        </g>

        {/* PIANO 1 — monti lontani (0,35) */}
        <g transform={L(0.35)}>
          <path d="M-200 1060 L60 960 L260 1010 L480 920 L700 990 L900 930 L1280 1010 V1100 H-200 Z" fill="#4A2A3A" />
          <path d="M480 920 L540 950 M900 930 L950 960" stroke="#C86A5A" strokeWidth="4" opacity=".6" />
        </g>

        {/* PIANO 2 — cataste di auto schiacciate, gru con il magnete, corvi (0,5) */}
        <g transform={L(0.5)}>
          <rect x="-200" y="1060" width="1480" height="200" fill="#6A4A34" />
          {STACKS.map((st, i) => (
            <g key={i}>
              {Array.from({ length: st.n }, (_, k) => {
                const y = 1180 - k * 52, c = COLORS[(i * 3 + k) % COLORS.length], dx = ((k * 37 + i * 11) % 30) - 15;
                return (
                  <g key={k}>
                    <rect x={st.x + dx} y={y - 50} width={st.w} height="50" rx="8" fill={c} stroke={K} strokeWidth="5" />
                    <rect x={st.x + dx + 30} y={y - 40} width="60" height="20" fill="#1E2A34" stroke={K} strokeWidth="3" />
                    <circle cx={st.x + dx + st.w - 40} cy={y - 10} r="14" fill="#1A1A1A" stroke={K} strokeWidth="3" />
                    <path d={`M${st.x + dx + 4} ${y - 46} H${st.x + dx + st.w - 4}`} stroke="#FFFFFF" strokeWidth="3" opacity=".2" />
                  </g>
                );
              })}
            </g>
          ))}
          {/* gru: torre a destra, braccio sotto la zona del titolo */}
          <g>
            <path d="M1000 1240 V700 M1060 1240 V700" stroke="#C8962E" strokeWidth="14" />
            {Array.from({ length: 10 }, (_, k) => <path key={k} d={`M1000 ${1240 - k * 54} L1060 ${1186 - k * 54}`} stroke="#C8962E" strokeWidth="6" />)}
            <path d="M1060 700 L460 700 L460 720 L1060 730 Z" fill="#C8962E" stroke={K} strokeWidth="6" />
            {Array.from({ length: 12 }, (_, k) => <path key={k} d={`M${480 + k * 50} 702 l25 24`} stroke={K} strokeWidth="3" />)}
            <rect x="980" y="660" width="100" height="70" fill="#8A6A2A" stroke={K} strokeWidth="6" />
            <g transform={`rotate(${sway * 0.3} 560 720)`}>
              <path d="M560 720 V880" stroke="#2A2A2A" strokeWidth="5" />
              <ellipse cx="560" cy="900" rx="90" ry="26" fill="#3A3E44" stroke={K} strokeWidth="7" />
              <path d="M470 900 V930 Q560 960 650 930 V900" fill="#2A2E34" stroke={K} strokeWidth="6" />
            </g>
          </g>
          {/* corvi posati, poi in volo */}
          {CROWS.map((c, i) => {
            const p = seg(t, tCrows + i * 0.12, tCrows + i * 0.12 + 2.2);
            const x = c.x + c.vx * p, y = c.y + c.vy * p * 1.2;
            const flap = p > 0 ? Math.sin(t * 14 + c.ph) : 0.15;
            return y > 680 ? <Corvo key={i} x={x} y={y} flap={flap} s={1.1} /> : null;
          })}
        </g>

        {/* PIANO 3 — l'auto della consegna con soldi e cristalli sul cofano (0,72) */}
        <g transform={L(0.72)}>
          <path d="M-200 1240 H1280 V2200 H-200 Z" fill="url(#fn-ground)" />
          {Array.from({ length: 14 }, (_, k) => <path key={k} d={`M${-100 + k * 100} ${1300 + (k % 3) * 60} q30 -6 60 0`} stroke="#3A2618" strokeWidth="4" fill="none" opacity=".6" />)}
          {/* polvere del colpo dietro l'auto */}
          {hit && <Smoke id="fn-puff" t={t - tHit} x={300} y={1200} color="#C8946A" n={6} rise={150} wind={-120} r0={50} r1={150} speed={0.7} opacity={0.85 * (1 - puff)} />}
          <g transform={`translate(${jolt} ${Math.abs(jolt) * 0.5})`}>
            <Ombra id="fn" x={560} y={1262} rx={420} ry={30} />
            <path d="M160 1250 V1170 Q160 1140 190 1136 L330 1126 L420 1040 Q440 1024 470 1024 H700 Q730 1024 750 1044 L830 1126 L930 1136 Q960 1140 960 1170 V1250 Z" fill="url(#fn-car)" stroke={K} strokeWidth="9" />
            <path d="M440 1046 L380 1120 H560 V1046 Z M580 1046 V1120 H780 L720 1056 Q710 1046 696 1046 Z" fill="#1A2430" stroke={K} strokeWidth="5" />
            <path d="M600 1060 L640 1110" stroke="#FFFFFF" strokeWidth="5" opacity=".25" />
            <path d="M170 1170 H950" stroke="#8AA0B4" strokeWidth="4" opacity=".6" />
            {/* ammaccatura sul fianco dopo il colpo */}
            {hit && <path d="M240 1180 q30 26 60 0 q-30 10 -60 0 Z" fill="#141C24" stroke={K} strokeWidth="4" />}
            {/* fari: si accendono come due occhi */}
            {[[950, 1160]].map(([fx, fy], i) => (
              <g key={i}>
                <rect x={fx - 14} y={fy - 14} width="22" height="26" rx="4" fill={eyes > 0.5 ? '#FFF6D8' : '#C8C0A8'} stroke={K} strokeWidth="3" />
                <Glow id={`fn-eye${i}`} x={fx} y={fy} r={200} t={t} color="#FFF0C0" amp={0.03} rate={4} opacity={0.7 * eyes} />
              </g>
            ))}
            {[300, 820].map((wx) => (
              <g key={wx}>
                <circle cx={wx} cy={1250} r="54" fill="#121414" stroke={K} strokeWidth="8" />
                <circle cx={wx} cy={1250} r="24" fill="url(#fn-metal)" stroke={K} strokeWidth="4" />
              </g>
            ))}
            {/* sul cofano/bagagliaio: mazzette e pacco di cristalli */}
            <g transform="translate(250 1132)">
              {[0, 1, 2, 3].map((k) => (
                <g key={k} transform={`translate(${(k % 2) * 60} ${-Math.floor(k / 2) * 26})`}>
                  <rect x="-30" y="-24" width="64" height="26" rx="4" fill="#A8C08A" stroke={K} strokeWidth="4" />
                  <rect x="-6" y="-24" width="14" height="26" fill={ORO} stroke={K} strokeWidth="3" />
                </g>
              ))}
            </g>
            <g transform="translate(870 1132)">
              <path d="M-50 0 Q-56 -40 -30 -50 H30 Q56 -40 50 0 Z" fill="#E8F2F4" stroke={K} strokeWidth="5" opacity=".9" />
              <Cristalli id="fn" x={0} y={-4} t={t} s={0.45} n={10} seed={6} glint={0.7} />
            </g>
          </g>
          {/* occhiali da sole caduti nella polvere */}
          {hit && (
            <g transform={`translate(${lerp(420, 470, glassFall)} ${lerp(1180, 1290, glassFall * glassFall)}) rotate(${lerp(0, 170, glassFall)})`}>
              <circle cx="-22" cy="0" r="17" fill="#1A1A1A" stroke={K} strokeWidth="4" />
              <circle cx="22" cy="0" r="17" fill="#1A1A1A" stroke={K} strokeWidth="4" />
              <path d="M-5 0 H5 M-39 0 L-60 -6 M39 0 L60 -8" stroke={K} strokeWidth="5" />
              <path d="M14 -10 L30 10" stroke="#9A9A9A" strokeWidth="2" />
            </g>
          )}
        </g>

        {/* PIANO 4 — pneumatici impilati e bidone arrugginito in primo piano (1,25) */}
        <g transform={L(1.25)}>
          {[0, 1, 2, 3].map((k) => (
            <g key={k}>
              <ellipse cx="80" cy={1900 - k * 80} rx="170" ry="54" fill="#1A1A1A" stroke={K} strokeWidth="9" />
              <ellipse cx="80" cy={1900 - k * 80 - 6} rx="80" ry="22" fill="#0A0A0A" />
              <path d={`M-70 ${1890 - k * 80} Q80 ${1850 - k * 80} 230 ${1890 - k * 80}`} stroke="#3A3A3A" strokeWidth="5" fill="none" />
            </g>
          ))}
          <g transform="translate(1000 1960)">
            <path d="M-120 0 V-330 H120 V0 Z" fill="url(#fn-rust)" stroke={K} strokeWidth="9" />
            {[-260, -130].map((y) => <path key={y} d={`M-120 ${y} H120`} stroke="#3A1A0C" strokeWidth="10" />)}
            <ellipse cx="0" cy="-330" rx="120" ry="22" fill="#5A2E18" stroke={K} strokeWidth="7" />
            <path d="M-100 -310 V-20" stroke="#C87A4A" strokeWidth="6" opacity=".5" />
          </g>
        </g>

        {/* PIANO 5 — polvere nel vento e particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          {Array.from({ length: 16 }, (_, i) => {
            const x = mod(i * 97 - t * (50 + i * 3), 1480) - 200;
            return <circle key={i} cx={x} cy={900 + ((i * 131) % 600)} r={2 + (i % 3)} fill="#F2C8A0" opacity=".5" />;
          })}
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="fn-near" t={t} color="#F2B890" n={6} r0={70} r1={160} opacity={0.12} vx={-30} />
        </g>
      </g>
      <Finish id="fn" tint="#8A3A2A" tintOpacity={0.1} />
    </svg>
  );
};
