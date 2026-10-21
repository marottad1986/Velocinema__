import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { DISPLAY, HAND } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Dust, Glow, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';

// Frankenstin: aula di anatomia a gradoni, lavagna con il disegno di un cervello e la scritta «FRANKENSTIN»
// sottolineata due volte; sulla cattedra un bisturi e la lettera con sigillo di ceralacca. Nessuna persona.
// Eventi: la scritta compare col gesso (cue 2) · il ritratto del nonno si gira verso il muro (cue 3)
//         · la lettera del testamento scivola sulla cattedra, sigillo verde-acqua (cue 4).
// Piani: parete e finestre (0,2) · gradoni con banchi (0,4) · lavagna e ritratto (0,6) · cattedra (0,85)
//        · libri e bacchetta in primo piano (1,2) · polvere di gesso nei fasci e particelle (1,5–1,8)

const K = '#0E0F11';
const ACC = '#8EF0C8';
const r = rng(1930);
const CHALK = Array.from({ length: 14 }, () => ({ dx: (r() - 0.5) * 60, dy: r() * 80, s: 2 + r() * 4, ph: r() }));

export const Lezione: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const write = seg(t, cues[2] - 0.2, cues[2] + 1.2);
  const under1 = eo(seg(t, cues[2] + 1.3, cues[2] + 1.6));
  const under2 = eo(seg(t, cues[2] + 1.7, cues[2] + 2.0));
  // il ritratto del nonno ruota e mostra il retro
  const flip = eo(seg(t, cues[3] + 0.3, cues[3] + 1.0));
  const sx = Math.cos(flip * Math.PI);
  // lettera
  const letter = eob(seg(t, cues[4], cues[4] + 0.8), 1.3);
  const seal = seg(t, cues[4] + 0.6, cues[4] + 1.0);
  const chalkX = 430 + 450 * write;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="le" />
        <Lin id="le-wall" stops={[[0, '#1C1D1F'], [0.35, '#3A3A38'], [0.7, '#4E4C48'], [1, '#2E2D2B']]} />
        <Lin id="le-win" stops={[[0, '#C9D0D6'], [1, '#8E979F']]} />
        <Lin id="le-bench" stops={[[0, '#5A4E40'], [1, '#2C251E']]} />
        <Lin id="le-board" stops={[[0, '#2A302C'], [0.5, '#232825'], [1, '#1A1E1B']]} />
        <Lin id="le-frame" x2={1} y2={0} stops={[[0, '#5A4A34'], [0.5, '#8C7454'], [1, '#4E402E']]} />
        <Lin id="le-desk" stops={[[0, '#6B5A46'], [0.3, '#4E4132'], [1, '#2A231B']]} />
        <Lin id="le-paper" x2={1} y2={1} stops={[[0, '#F4F0E4'], [1, '#CFC8B4']]} />
        <Lin id="le-front" stops={[[0, '#2A2420'], [1, '#0E0C0A']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete con finestre alte e fasci di luce (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#le-wall)" />
          {[760, 1000].map((x) => (
            <g key={x}>
              <path d={`M${x} 560 V200 Q${x + 80} 120 ${x + 160} 200 V560 Z`} fill="url(#le-win)" stroke={K} strokeWidth="9" />
              <path d={`M${x + 80} 150 V560 M${x} 360 H${x + 160}`} stroke={K} strokeWidth="7" />
            </g>
          ))}
          <Glow id="le-wg" x={920} y={380} r={360} t={t} color="#E8EEF2" amp={0.04} rate={0.8} opacity={0.35} />
          <Beam id="le-b1" x={840} y={420} t={t} length={1000} spread={300} color="#E8EEF2" angle={128} opacity={0.22} />
          <Beam id="le-b2" x={1080} y={420} t={t} length={1100} spread={300} color="#E8EEF2" angle={124} opacity={0.18} />
        </g>

        {/* PIANO 1 — gradoni con i banchi vuoti (0,4) */}
        <g transform={L(0.4)}>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <path d={`M-200 ${600 + i * 90} Q540 ${560 + i * 90} 1280 ${600 + i * 90} V${640 + i * 90} Q540 ${600 + i * 90} -200 ${640 + i * 90} Z`} fill="url(#le-bench)" opacity={0.55 + i * 0.12} />
              <path d={`M-200 ${600 + i * 90} Q540 ${560 + i * 90} 1280 ${600 + i * 90}`} fill="none" stroke="#8A7A64" strokeWidth="3" opacity=".5" />
            </g>
          ))}
        </g>

        {/* PIANO 2 — lavagna e ritratto del nonno (0,6) */}
        <g transform={L(0.6)}>
          <rect x="70" y="640" width="900" height="440" rx="10" fill="url(#le-board)" stroke="#3E3226" strokeWidth="22" />
          <rect x="70" y="640" width="900" height="440" rx="10" fill="none" stroke={K} strokeWidth="6" />
          <path d="M60 1092 H980" stroke="#3E3226" strokeWidth="14" />
          <rect x="300" y="1080" width="70" height="14" rx="4" fill="#E9E6DC" />
          {/* disegno del cervello a gesso */}
          <g fill="none" stroke="#E9E6DC" strokeWidth="5" strokeLinecap="round" opacity=".85">
            <path d="M120 830 q0 -90 90 -100 q60 -40 110 10 q60 10 50 80 q20 60 -40 80 q-40 40 -100 10 q-110 10 -110 -80 Z" />
            <path d="M160 800 q30 -30 60 0 q30 30 60 -10 M150 850 q40 20 70 -10 q40 -30 80 10 M200 900 q30 -20 60 0" />
            <path d="M310 920 q10 30 -10 60" />
            <path d="M380 760 l60 -20 M380 860 l60 20" />
          </g>
          <text x="455" y="762" fontFamily={HAND} fontSize="40" fill="#E9E6DC" opacity=".8">cervello</text>
          <text x="455" y="900" fontFamily={HAND} fontSize="40" fill="#E9E6DC" opacity=".8">cervelletto</text>
          <text x="150" y="1052" fontFamily={HAND} fontSize="34" fill="#E9E6DC" opacity={0.7 * seg(t, cues[2] - 0.6, cues[2] - 0.2)}>si pronuncia:</text>
          {/* FRANKENSTIN scritto lettera per lettera */}
          <clipPath id="le-clip"><rect x="420" y="980" width={500 * write} height="110" /></clipPath>
          <text x="430" y="1060" fontFamily={HAND} fontSize="70" fill="#F4F2EA" clipPath="url(#le-clip)" letterSpacing="2">FRANKENSTIN</text>
          <path d={`M430 1072 H${lerp(430, 880, under1)}`} stroke="#F4F2EA" strokeWidth="6" strokeLinecap="round" opacity={under1 > 0 ? 1 : 0} />
          <path d={`M436 1084 H${lerp(436, 870, under2)}`} stroke="#F4F2EA" strokeWidth="5" strokeLinecap="round" opacity={under2 > 0 ? 1 : 0} />
          {/* polvere di gesso mentre scrive */}
          {write > 0 && write < 1 && CHALK.map((c, i) => <circle key={i} cx={chalkX + c.dx} cy={1050 + c.dy * ((t * 1.5 + c.ph) % 1)} r={c.s} fill="#F4F2EA" opacity={0.6 * (1 - ((t * 1.5 + c.ph) % 1))} />)}
          {/* ritratto del nonno (solo cornice e targhetta): ruota verso il muro */}
          <g transform={`translate(880 540) scale(${sx * 0.8} 0.8)`}>
            <rect x="-100" y="-130" width="200" height="250" rx="8" fill={sx > 0 ? '#3A3833' : '#6B5A46'} stroke="url(#le-frame)" strokeWidth="20" />
            <rect x="-100" y="-130" width="200" height="250" rx="8" fill="none" stroke={K} strokeWidth="5" />
            {sx > 0 ? (
              <>
                <path d="M-70 90 L-20 10 L20 50 L50 0 L76 90 Z" fill="#4E4B44" />
                <circle cx="40" cy="-60" r="24" fill="#5A574F" />
                <rect x="-56" y="132" width="112" height="28" rx="4" fill="#B9A27A" stroke={K} strokeWidth="4" />
                <text x="0" y="152" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="16" fill={K}>V. FRANKENSTEIN</text>
              </>
            ) : (
              <path d="M-70 -100 L70 90 M70 -100 L-70 90" stroke="#4E4132" strokeWidth="8" />
            )}
          </g>
          <path d="M880 420 V436" stroke={K} strokeWidth="4" />
        </g>

        {/* PIANO 3 — cattedra con bisturi, modello di cervello e lettera (0,85) */}
        <g transform={L(0.85)}>
          <path d="M-200 1160 H1280 V2200 H-200 Z" fill="#1E1C1A" />
          <path d="M-100 1150 H1180 V1240 H-100 Z" fill="url(#le-desk)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M-100 1158 H1180" stroke="#9A8670" strokeWidth="4" />
          <path d="M-60 1240 V1500 M1140 1240 V1500" stroke={K} strokeWidth="30" />
          {/* bisturi */}
          <g transform="translate(240 1146) rotate(-8)">
            <rect x="0" y="-6" width="110" height="12" rx="4" fill="#3A3833" stroke={K} strokeWidth="4" />
            <path d="M110 -6 L170 -2 Q176 0 170 4 L110 6 Z" fill="#D8DEE3" stroke={K} strokeWidth="4" />
          </g>
          {/* barattolo con cervello */}
          <g transform="translate(930 1150)">
            <Glow id="le-jar" x={0} y={-80} r={120} t={t} color="#DDE6E0" amp={0.05} rate={1.4} opacity={0.25} />
            <rect x="-60" y="-160" width="120" height="160" rx="14" fill="#9FB0A6" opacity=".35" stroke={K} strokeWidth="7" />
            <path d="M-36 -60 q0 -50 40 -50 q40 0 36 40 q0 30 -36 30 q-40 6 -40 -20 Z" fill="#C9B6AE" stroke={K} strokeWidth="5" />
            <path d="M-20 -80 q14 -10 26 0 q12 10 22 -4" fill="none" stroke={K} strokeWidth="3" />
            <rect x="-66" y="-176" width="132" height="22" rx="4" fill="#3A3833" stroke={K} strokeWidth="6" />
            <path d="M-44 -140 v100" stroke="#FFFFFF" strokeWidth="5" opacity=".35" />
          </g>
          {/* lettera del testamento */}
          <g transform={`translate(${lerp(1400, 600, letter)} ${1196 - 10 * Math.sin(letter * Math.PI)}) rotate(${lerp(30, -4, letter)})`}>
            <path d="M-170 -70 H170 V70 H-170 Z" fill="url(#le-paper)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d="M-170 -70 L0 20 L170 -70" fill="none" stroke="#9A9280" strokeWidth="5" />
            <text x="0" y="58" textAnchor="middle" fontFamily={HAND} fontSize="28" fill="#3A3833">Testamento – Transilvania</text>
            <Glow id="le-seal" x={0} y={-6} r={90} t={t} color={ACC} amp={0.15} rate={3} opacity={0.6 * seal} />
            <circle cx="0" cy="-6" r="28" fill={ACC} stroke={K} strokeWidth="6" />
            <text x="0" y="5" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="30" fill={K}>F</text>
          </g>
        </g>

        {/* PIANO 4 — libri e bacchetta in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1560 H1280 V2200 H-200 Z" fill="url(#le-front)" stroke={K} strokeWidth="9" />
          {[['#5A3A2E', 70], ['#3A4A3E', 56], ['#4E4A42', 64], ['#6B5338', 48]].map(([c, h], i) => (
            <g key={i} transform={`translate(${-40 + i * 6} ${1560 - [70, 56, 64, 48].slice(0, i + 1).reduce((a, b) => a + b, 0)}) rotate(${(i % 2 ? 1 : -1) * 2})`}>
              <rect x="0" y="0" width="380" height={h as number} rx="6" fill={c as string} stroke={K} strokeWidth="7" />
              <path d={`M20 ${(h as number) / 2} H340`} stroke="#C9B48A" strokeWidth="4" opacity=".6" />
            </g>
          ))}
          <path d="M760 1980 L1180 1360" stroke="#5A4A38" strokeWidth="22" strokeLinecap="round" />
          <path d="M760 1980 L1180 1360" stroke={K} strokeWidth="30" strokeLinecap="round" opacity=".3" />
          <path d="M1150 1404 L1180 1360" stroke="#E9E6DC" strokeWidth="22" strokeLinecap="round" />
        </g>

        {/* PIANO 5 — polvere nei fasci di luce e particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 420, x0: 760, x1: 1080 }} bottom={{ y: 1300, x0: 200, x1: 700 }} n={30} color="#EEF2F4" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="le-near" t={t} color="#E9EEF2" n={6} vx={-25} vy={-8} opacity={0.08} />
        </g>
      </g>

      <Finish id="le" tint="#5E6B75" tintOpacity={0.12} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): scritta FRANKENSTIN cue2 − 0,2 → +1,2 · sottolineature cue2 + 1,3 / + 1,7
// · ritratto che si gira cue3 + 0,3 · lettera cue4 (sigillo + 0,6).
