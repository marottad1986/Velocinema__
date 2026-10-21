import React from 'react';
import { camera, eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, Lightning, NearMotes, Notes, Rain, Smoke, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';

// Elizabeth: stanza della sposa nel castello. Valigie e cappelliere appena arrivate, toeletta con piumino e cipria,
// una parrucca bianca e cotonata sul suo sostegno; la finestra si spalanca nel temporale, le tende volano, le catene
// spezzate cadono a terra. Poi dalla finestra escono note verde-acqua. Nessuna persona.
// Eventi: bagagli che piombano a terra (cue 0) · nuvola di cipria (cue 1) · lampo, finestra spalancata, catene (cue 2)
//         · note che volano fuori dalla finestra (cue 3–4).
// Piani: parete tappezzata (0,2) · finestra con temporale (0,35) · toeletta e parrucca (0,55)
//        · bagagli e catene sul pavimento (0,8) · colonna del letto a baldacchino (1,2) · pioggia e particelle (1,5–1,8)

const K = '#0E0C0E';
const ACC = '#8EF0C8';
const r = rng(1974);
const CASES = [
  { x: 140, y: 1250, w: 280, h: 120, c: '#6B5546', d: 0 },
  { x: 160, y: 1130, w: 230, h: 100, c: '#4E4250', d: 0.18 },
  { x: 430, y: 1250, w: 150, h: 120, c: '#E2D8C8', d: 0.32, round: true },
  { x: 440, y: 1130, w: 120, h: 96, c: '#C9B6C0', d: 0.46, round: true },
];
const DAMASK = Array.from({ length: 28 }, (_, i) => ({ x: -140 + (i % 7) * 200 + (Math.floor(i / 7) % 2) * 100, y: 80 + Math.floor(i / 7) * 220 }));

export const Elizabeth: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const drop = (d: number) => eob(seg(t, cues[0] + d, cues[0] + d + 0.45), 1.2);
  const puff = seg(t, cues[1] + 0.2, cues[1] + 2.4);
  const flash = flashAt(t, [cues[2], cues[2] + 0.9], [1, 0.6]);
  const burst = eo(seg(t, cues[2], cues[2] + 0.35));
  const wind = burst * (0.7 + 0.3 * Math.sin(t * 3.1));
  const chainFall = eo(seg(t, cues[2] + 0.2, cues[2] + 0.8));
  const song = seg(t, cues[3] + 0.3, cues[4]);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="el" />
        <Lin id="el-wall" stops={[[0, '#1A1719'], [0.35, '#332D31'], [0.7, '#433A3F'], [1, '#2A2427']]} />
        <Lin id="el-storm" stops={[[0, '#07080B'], [0.6, '#1E242C'], [1, '#2E3640']]} />
        <Lin id="el-drape" x2={1} y2={0} stops={[[0, '#C9C2C6'], [0.5, '#EDE8EA'], [1, '#B0A8AC']]} />
        <Lin id="el-wood" stops={[[0, '#5A4636'], [1, '#2E2219']]} />
        <Lin id="el-floor" stops={[[0, '#3A2E2A'], [1, '#120E0C']]} />
        <Lin id="el-mirror" x2={1} y2={1} stops={[[0, '#AEB8C0'], [0.5, '#DCE4EA'], [1, '#7E8890']]} />
        <Lin id="el-chain" x2={1} y2={0} stops={[[0, '#4A5056'], [0.5, '#B7BEC6'], [1, '#4A5056']]} />
        <Lin id="el-post" x2={1} y2={0} stops={[[0, '#2A1E16'], [0.5, '#5A4430'], [1, '#2A1E16']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete con tappezzeria a motivi (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#el-wall)" />
          {DAMASK.map((d, i) => (
            <path key={i} d={`M${d.x} ${d.y - 40} q24 20 0 40 q-24 20 0 40 q24 -20 0 -40 q-24 -20 0 -40 M${d.x - 30} ${d.y} h60`} fill="none" stroke="#4E454A" strokeWidth="4" opacity=".55" />
          ))}
          <rect x="-200" y="1000" width="1480" height="16" fill="#2A2427" />
        </g>

        {/* PIANO 1 — finestra: imposte che si spalancano sul temporale (0,35) */}
        <g transform={L(0.35)}>
          <rect x="640" y="560" width="360" height="600" fill="url(#el-storm)" />
          <rect x="640" y="560" width="360" height="600" fill="#DCE4EA" opacity={flash * 0.55} />
          <clipPath id="el-win"><rect x="640" y="560" width="360" height="600" /></clipPath>
          <g clipPath="url(#el-win)">
            <Glow id="el-moon" x={900} y={660} r={120} t={t} color="#C9D3DB" amp={0.04} rate={1} opacity={0.5} />
            <circle cx="900" cy="660" r="40" fill="#DAD9D2" />
            <path d="M640 1080 L720 1000 L790 1050 L880 960 L1000 1040 V1160 H640 Z" fill="#0E1114" />
            <Lightning x={760} y={540} h={420} flash={flash} seed={5} width={7} />
            <Rain t={t} level="far" seed={2} x={600} w={440} y={400} h={900} color="#8A98A6" opacity={0.5} />
          </g>
          {/* imposte: chiuse, poi spalancate */}
          {[-1, 1].map((d) => {
            const hx = d < 0 ? 640 : 1000;
            const sx = lerp(1, 0.18, burst);
            return (
              <g key={d} transform={`translate(${hx} 0) scale(${sx} 1) translate(${-hx} 0)`}>
                <rect x={d < 0 ? 640 : 820} y="560" width="180" height="600" fill="#5A6672" opacity=".35" stroke={K} strokeWidth="9" />
                {[0, 1, 2].map((k) => <path key={k} d={`M${d < 0 ? 640 : 820} ${560 + (k + 1) * 150} h180`} stroke={K} strokeWidth="7" />)}
                <path d={`M${d < 0 ? 730 : 910} 560 V1160`} stroke={K} strokeWidth="7" />
                <path d={`M${d < 0 ? 650 : 830} 580 l40 120`} stroke="#E8EEF2" strokeWidth="5" opacity=".5" />
              </g>
            );
          })}
          <rect x="630" y="550" width="380" height="620" fill="none" stroke="#2A2022" strokeWidth="22" />
          <rect x="610" y="1160" width="420" height="24" fill="#3A2E30" stroke={K} strokeWidth="7" />
          {/* tende che volano verso l'interno */}
          {[-1, 1].map((d) => {
            const x0 = d < 0 ? 600 : 1040;
            const bil = wind * 140 * (d < 0 ? 1 : -1) * -1;
            return (
              <path key={d} d={`M${x0 - d * 0} 520 C${x0 + d * -20} 760 ${x0 - d * 30 + bil} 940 ${x0 - d * 40 + bil * 1.4} 1180 L${x0 + d * 70 + bil * 1.2} 1190 C${x0 + d * 80 + bil * 0.6} 920 ${x0 + d * 60} 760 ${x0 + d * 70} 520 Z`} fill="url(#el-drape)" stroke={K} strokeWidth="8" strokeLinejoin="round" opacity=".95" />
            );
          })}
          <path d="M560 520 H1080" stroke="#2A2022" strokeWidth="16" strokeLinecap="round" />
        </g>

        {/* PIANO 2 — toeletta con specchio, piumino e parrucca (0,55) */}
        <g transform={L(0.55)}>
          <g transform="translate(260 900)">
            <ellipse cx="0" cy="-150" rx="130" ry="170" fill="url(#el-mirror)" stroke="#8C7454" strokeWidth="18" />
            <ellipse cx="0" cy="-150" rx="130" ry="170" fill="none" stroke={K} strokeWidth="5" />
            <path d="M-70 -260 q30 -30 70 -36" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" opacity=".6" />
            <rect x="-210" y="20" width="420" height="40" rx="6" fill="url(#el-wood)" stroke={K} strokeWidth="8" />
            <path d="M-190 60 V220 M190 60 V220" stroke={K} strokeWidth="18" />
            {/* scatola della cipria e piumino */}
            <ellipse cx="-110" cy="12" rx="56" ry="16" fill="#E2D8C8" stroke={K} strokeWidth="6" />
            <circle cx="-110" cy={-6 - 26 * Math.sin(seg(t, cues[1], cues[1] + 0.5) * Math.PI)} r="26" fill="#F4EEF0" stroke={K} strokeWidth="6" />
            {/* sostegno con parrucca bianca e cotonata */}
            <g transform="translate(90 20)">
              <path d="M-10 0 V-80 M-36 0 H16" stroke={K} strokeWidth="10" />
              <ellipse cx="-10" cy="-120" rx="40" ry="48" fill="#8C8288" stroke={K} strokeWidth="6" />
              <path d="M-56 -118 Q-74 -262 -10 -268 Q54 -262 36 -118 Q14 -150 -10 -150 Q-34 -150 -56 -118 Z" fill="#F2EEE8" stroke={K} strokeWidth="7" strokeLinejoin="round" />
              <path d="M-46 -200 q20 -30 50 -30 M-40 -170 q24 -22 56 -12 M-60 -130 q-14 10 -6 26 M40 -130 q14 10 6 26" fill="none" stroke="#C9C2BC" strokeWidth="5" />
            </g>
          </g>
          <Smoke id="el-powder" t={t} x={150} y={880} n={8} rise={260} wind={140} r0={30} r1={130} speed={0.5} color="#F4EEF0" opacity={0.85 * Math.sin(puff * Math.PI)} />
        </g>

        {/* PIANO 3 — pavimento, bagagli che piombano a terra, catene spezzate (0,8) */}
        <g transform={L(0.8)}>
          <path d="M-200 1260 H1280 V2200 H-200 Z" fill="url(#el-floor)" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M-200 ${1290 + i * 50 + i * i * 4} H1280`} stroke="#0A0807" strokeWidth="4" opacity=".7" />)}
          <ellipse cx="380" cy="1262" rx="300" ry="20" fill="#000" opacity=".3" />
          {CASES.map((c, i) => {
            const p = drop(c.d);
            const y = lerp(c.y - 700, c.y, p);
            return c.round ? (
              <g key={i} opacity={p > 0 ? 1 : 0}>
                <path d={`M${c.x} ${y} V${y - c.h} H${c.x + c.w} V${y} Z`} fill={c.c} stroke={K} strokeWidth="8" />
                <ellipse cx={c.x + c.w / 2} cy={y - c.h} rx={c.w / 2} ry="16" fill={c.c} stroke={K} strokeWidth="7" />
                <path d={`M${c.x} ${y - c.h * 0.45} H${c.x + c.w}`} stroke="#8C6A78" strokeWidth="10" />
                <path d={`M${c.x + c.w / 2 - 20} ${y - c.h * 0.45} q20 -26 40 0`} fill="none" stroke="#8C6A78" strokeWidth="6" />
              </g>
            ) : (
              <g key={i} opacity={p > 0 ? 1 : 0}>
                <rect x={c.x} y={y - c.h} width={c.w} height={c.h} rx="14" fill={c.c} stroke={K} strokeWidth="8" />
                <path d={`M${c.x + c.w / 2 - 30} ${y - c.h} v-18 h60 v18`} fill="none" stroke={K} strokeWidth="8" />
                <path d={`M${c.x + 40} ${y - c.h} V${y} M${c.x + c.w - 40} ${y - c.h} V${y}`} stroke={K} strokeWidth="5" opacity=".6" />
                <path d={`M${c.x + 10} ${y - c.h + 10} H${c.x + c.w - 10}`} stroke="#FFFFFF" strokeWidth="4" opacity=".25" />
              </g>
            );
          })}
          {/* catene spezzate che cadono sotto la finestra */}
          <g opacity={chainFall > 0 ? 1 : 0} transform={`translate(0 ${(1 - chainFall) * -300})`}>
            {Array.from({ length: 9 }, (_, i) => (
              <ellipse key={i} cx={720 + i * 26} cy={1236 + Math.sin(i * 1.1) * 10} rx={i % 2 ? 6 : 15} ry={i % 2 ? 13 : 9} fill="none" stroke="url(#el-chain)" strokeWidth="7" />
            ))}
            <path d="M960 1240 q20 -30 40 -6" fill="none" stroke="url(#el-chain)" strokeWidth="9" />
            <path d="M700 1236 l-14 -16 M700 1236 l-18 4" stroke="#DCE4EA" strokeWidth="5" strokeLinecap="round" />
          </g>
        </g>

        {/* PIANO 4 — colonna del letto a baldacchino e drappo in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <rect x="1030" y="-200" width="60" height="2200" fill="url(#el-post)" stroke={K} strokeWidth="9" />
          {[600, 1400].map((y) => <ellipse key={y} cx="1060" cy={y} rx="48" ry="24" fill="#5A4430" stroke={K} strokeWidth="7" />)}
          <path d={`M1090 -200 Q${1120 + wind * 20} 600 ${1110 + wind * 30} 1300 Q1140 1700 1130 2000 H1280 V-200 Z`} fill="#E8E2E4" stroke={K} strokeWidth="8" opacity=".9" />
          <path d="M-200 1560 Q300 1500 760 1580 Q900 1600 980 1580 V2200 H-200 Z" fill="#4A3A40" stroke={K} strokeWidth="9" />
          <path d="M-200 1600 Q300 1540 760 1620" fill="none" stroke="#8C6A78" strokeWidth="8" strokeDasharray="30 16" />
        </g>

        {/* PIANO 5 — note che volano fuori dalla finestra, pioggia vicina, particelle (1,5–1,8) */}
        <g transform={L(1.4)} opacity={song}>
          <Notes t={t} x={820} y={1000} n={7} color={ACC} outline={K} rise={420} spread={300} speed={0.32} size={1} />
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 600, x0: 660, x1: 980 }} bottom={{ y: 1240, x0: 400, x1: 900 }} n={16} color="#E8EEF2" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="el-near" t={t + mod(0, 1)} color="#E8E2E4" n={6} vx={-25} vy={-8} opacity={0.07} />
        </g>
      </g>

      <Finish id="el" tint="#5E6B75" tintOpacity={0.12} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): bagagli cue0 → +0,9 · cipria cue1 + 0,2 · lampi cue2 e cue2 + 0,9, finestra spalancata,
// catene + 0,2 · note verde-acqua da cue3 + 0,3.
