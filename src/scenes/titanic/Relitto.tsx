import React from 'react';
import { camera, eo, mod, rng, seg } from '../../lib/anim';
import { Beam, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { K, SAPPHIRE } from './Comuni';

// Il tesoro nel relitto: buio profondo; la prua del relitto arrugginita, coperta di concrezioni, illuminata dai fari di un
// piccolo sottomarino che entra da destra; neve marina che scende; su «trova solo il disegno» una cassaforte aperta sul
// fondale lascia uscire un foglio arrotolato che si illumina (accento). Nessuna persona.
// Piani: acqua profonda (0,2) · relitto (0,45) · fondale e cassaforte (0,7) · sottomarino e fasci (0,9) · bolle (1,2) · neve marina (1,6)

const r = rng(1912);
const SNOW = Array.from({ length: 70 }, () => ({ x: r() * 1300 - 110, y: r() * 2000, s: 1.5 + r() * 3, v: 20 + r() * 40 }));
const RUST = Array.from({ length: 22 }, () => ({ x: -320 + r() * 640, l: 20 + r() * 70 }));

export const Relitto: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const sub = eo(seg(t, 0, cues[1])); // il sottomarino arriva
  const safe = eo(seg(t, cues[2], cues[2] + 0.8)); // la cassaforte si apre
  const paper = eo(seg(t, cues[2] + 0.5, cues[2] + 1.8)); // il disegno esce e si illumina
  const sweep = Math.sin(t * 0.6) * 12;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="rl" />
        <Lin id="rl-sea" stops={[[0, '#0E2A3E'], [0.5, '#071826'], [1, '#03080E']]} />
        <Lin id="rl-hull" x2={1} y2={0} stops={[[0, '#3A2A22'], [0.5, '#6A3E26'], [1, '#2A1E18']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#rl-sea)" />
          <Glow id="rl-top" x={540} y={-100} r={900} t={t} color="#2E6A8A" amp={0.04} rate={0.6} opacity={0.35} />
        </g>
        {/* la prua del relitto vista di tre quarti, inclinata nel fango */}
        <g transform={L(0.45)}>
          <path d="M-200 1150 L180 1120 L760 820 L900 840 L700 1180 L-200 1260 Z" fill="url(#rl-hull)" stroke={K} strokeWidth="8" />
          <path d="M180 1120 L760 820 L780 760 L230 1040 Z" fill="#4A3426" stroke={K} strokeWidth="6" />
          <path d="M760 820 L780 760 L860 700 L900 840 Z" fill="#5A3A28" stroke={K} strokeWidth="6" />
          {/* parapetto e argano */}
          <path d="M230 1040 L780 760" stroke="#2A1E18" strokeWidth="5" strokeDasharray="4 18" />
          <path d="M240 1030 L780 750" stroke="#8A5A3A" strokeWidth="4" />
          <rect x="430" y="930" width="70" height="40" rx="8" fill="#3A2A20" stroke={K} strokeWidth="5" />
          {/* concrezioni di ruggine che pendono */}
          {RUST.map((d, i) => {
            const x = 200 + (i / RUST.length) * 560, y = 1110 - (i / RUST.length) * 290;
            return <path key={i} d={`M${x} ${y} q4 ${d.l / 2} 0 ${d.l}`} stroke="#A2582E" strokeWidth={4 + (i % 3) * 2} strokeLinecap="round" fill="none" opacity=".85" />;
          })}
          {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={300 + i * 95} cy={1105 - i * 50} r="12" fill="#1A120E" stroke="#6A4A30" strokeWidth="4" />)}
        </g>
        {/* fondale e cassaforte */}
        <g transform={L(0.7)}>
          <path d="M-200 1220 Q300 1180 600 1230 Q900 1270 1280 1220 V2200 H-200 Z" fill="#1A2228" />
          <path d="M-200 1260 Q300 1230 600 1270" stroke="#2E3A40" strokeWidth="6" fill="none" />
          <g transform="translate(330 1210) rotate(-6)">
            <rect x="-90" y="-120" width="180" height="140" rx="8" fill="#4A4E50" stroke={K} strokeWidth="7" />
            <circle cx="40" cy="-50" r="16" fill="#2A2E30" stroke="#8A9094" strokeWidth="4" />
            {/* sportello che si apre */}
            <g transform={`translate(-90 -120) scale(${1 - 0.85 * safe} 1)`}>
              <rect x="0" y="0" width="180" height="140" rx="8" fill="#5A5E60" stroke={K} strokeWidth="6" />
              <circle cx="130" cy="70" r="14" fill="#2A2E30" stroke="#8A9094" strokeWidth="4" />
            </g>
            {safe > 0 && <rect x="-78" y="-108" width="156" height="116" fill="#0A0E10" opacity={safe} />}
            {/* il foglio arrotolato che esce e si illumina */}
            {paper > 0 && (
              <g transform={`translate(${-10 + 30 * paper} ${-60 - 90 * paper}) rotate(${-20 + 10 * paper})`}>
                <Glow id="rl-paper" x={0} y={0} r={220} t={t} color="#CFE8FF" amp={0.1} rate={3} opacity={0.6 * paper} />
                <rect x="-70" y="-22" width="140" height="44" rx="20" fill="#E8DCC0" stroke={K} strokeWidth="5" />
                <path d="M-50 0 H50" stroke={SAPPHIRE} strokeWidth="6" opacity={paper} />
              </g>
            )}
          </g>
        </g>
        {/* rocce e coralli del fondale in primo piano */}
        <g transform={L(1.15)}>
          <path d="M-200 1560 Q60 1480 260 1560 Q420 1620 520 1700 Q760 1600 1000 1640 Q1180 1600 1280 1650 V2200 H-200 Z" fill="#141A1E" stroke={K} strokeWidth="8" />
          {[[60, 1530], [240, 1545], [880, 1625], [1040, 1630]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${Math.sin(t * 0.8 + i) * 4})`}>
              <path d="M0 0 V-90 M0 -40 L-30 -80 M0 -60 L28 -110" stroke={['#A2582E', '#6A8A6A', '#A2582E', '#C89A6A'][i]} strokeWidth="9" strokeLinecap="round" fill="none" />
            </g>
          ))}
        </g>
        {/* il sottomarino con i fari */}
        <g transform={`${L(0.9)} translate(${1250 - 450 * sub} ${700 + 30 * Math.sin(t * 0.8)})`}>
          <Beam id="rl-b1" x={-90} y={20} t={t} length={900} spread={220} color="#DDEFFF" angle={160 + sweep} opacity={0.35} />
          <Beam id="rl-b2" x={-90} y={50} t={t} length={700} spread={160} color="#DDEFFF" angle={200 + sweep} opacity={0.25} />
          <ellipse cx="0" cy="30" rx="120" ry="70" fill="#E8C030" stroke={K} strokeWidth="7" />
          <circle cx="-60" cy="20" r="26" fill="#9ED8F0" stroke={K} strokeWidth="6" />
          <rect x="-20" y="-50" width="60" height="34" rx="8" fill="#D8A820" stroke={K} strokeWidth="6" />
          <path d="M110 30 L150 0 V60 Z" fill="#3A3A3A" stroke={K} strokeWidth="5" />
          <circle cx="-110" cy="30" r="9" fill="#FFF8D8" />
        </g>
        {/* bolle */}
        <g transform={L(1.2)}>
          {Array.from({ length: 12 }, (_, i) => {
            const p = mod(t * 0.25 + i / 12, 1);
            return <circle key={i} cx={1250 - 450 * sub + 120 + Math.sin(p * 8 + i) * 18} cy={700 - p * 600} r={4 + (i % 3) * 3} fill="none" stroke="#BFE4F4" strokeWidth="3" opacity={(1 - p) * 0.7} />;
          })}
        </g>
        <g transform={L(1.6)}>
          {SNOW.map((f, i) => <circle key={i} cx={f.x + Math.sin(t * 0.5 + i) * 14} cy={mod(f.y + t * f.v, 2000)} r={f.s} fill="#C8DCE4" opacity=".45" />)}
          <NearMotes id="rl-near" t={t} color="#C8DCE4" n={6} opacity={0.08} />
        </g>
      </g>
      <Finish id="rl" tint="#0A2A3E" tintOpacity={0.14} />
    </svg>
  );
};
