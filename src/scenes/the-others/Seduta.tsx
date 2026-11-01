import React from 'react';
import { camera, eo, rng, seg } from '../../lib/anim';
import { Flyers, Glow, NearMotes, Wisps } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Fiamma, K, OthersDefs, Ombra, Tenda } from './Comuni';

// La seduta spiritica: la camera di Anne di notte. Al centro il tavolino rotondo con la tovaglia bianca, il candelabro a
// tre bracci e i fogli; intorno le sedie vuote (la medium e i genitori di Victor non si disegnano).
// Eventi: prima frase le tre candele si accendono una dopo l'altra; seconda frase il tavolo trema, i bicchieri
// tintinnano e le sedie si spostano appena; terza frase la matita scrive da sola sul foglio (righe che si allungano),
// le fiamme si piegano tutte insieme e i fogli si sollevano. Nessuna persona.
// Piani: parete e finestra notturna (0,3) · letto di Anne e sedie dietro (0,55) · tavolo, candelabro, fogli (0,75)
//        · sedia di spalle in primo piano (1,15) · fogli in volo e pulviscolo (1,5–1,8)

const r = rng(909);
const LINES = Array.from({ length: 6 }, (_, i) => ({ y: -56 + i * 22, w: 140 + r() * 70, wob: r() * 6 }));

export const Seduta: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c = (i: number) => eo(seg(t, cues[0] + 0.3 + i * 0.4, cues[0] + 0.6 + i * 0.4));
  const shake = seg(t, cues[1] + 0.3, cues[1] + 0.6) * (1 - seg(t, cues[1] + 1.6, cues[1] + 2.2));
  const jx = shake * 4 * Math.sin(t * 47), jy = shake * 2 * Math.sin(t * 61);
  const write = seg(t, cues[2] + 0.3, dur - 0.5);
  const bendAll = 22 * seg(t, cues[2] + 0.6, cues[2] + 1.2) * (0.7 + 0.3 * Math.sin(t * 5));
  const papers = seg(t, cues[2] + 1.2, cues[2] + 2.0);
  // punta della matita: segue la riga che si sta scrivendo
  const total = LINES.reduce((a, l) => a + l.w, 0);
  let left = write * total, px = -100, py = LINES[0].y;
  for (const l of LINES) { if (left <= l.w) { px = -100 + left; py = l.y; break; } left -= l.w; px = -100 + l.w; py = l.y; }

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="se" />
        <OthersDefs id="se" />
        <Lin id="se-wall" stops={[[0, '#0C1014'], [0.4, '#1A2228'], [0.75, '#24303A'], [1, '#141A20']]} />
        <Lin id="se-night" stops={[[0, '#0A1220'], [1, '#22324A']]} />
        <Lin id="se-floor" stops={[[0, '#2A1E14'], [1, '#0A0604']]} />
        <Lin id="se-cloth" stops={[[0, '#F2F0E8'], [0.6, '#D8D6CC'], [1, '#A8A89E']]} />
        <Lin id="se-top" x2={1} y2={0} stops={[[0, '#C8C6BC'], [0.5, '#F6F4EC'], [1, '#B8B6AC']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete con la carta da parati a righe, finestra con la luna nella nebbia (0,3) */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#se-wall)" />
          {Array.from({ length: 16 }, (_, i) => <rect key={i} x={-200 + i * 100} y="560" width="24" height="660" fill="#3A4A5A" opacity=".14" />)}
          <rect x="760" y="620" width="240" height="360" fill="url(#se-night)" stroke={K} strokeWidth="8" />
          <circle cx="900" cy="700" r="34" fill="#C8D2DA" opacity=".55" />
          <Glow id="se-moon" x={900} y={700} r={120} t={t} color="#C8D2DA" amp={0.03} rate={0.8} opacity={0.4} />
          <path d="M880 620 V980 M760 790 H1000" stroke="#1A222A" strokeWidth="9" />
          <Tenda id="se" x={730} y={590} w={130} h={430} t={t} side="left" sway={3 + 8 * shake} folds={3} />
          <Tenda id="se" x={900} y={590} w={130} h={430} t={t} side="right" sway={3 + 8 * shake} folds={3} />
          <path d="M-200 1220 H1280" stroke="#2A1E14" strokeWidth="20" />
        </g>

        {/* PIANO 1 — pavimento, il letto di Anne a sinistra, due sedie vuote dietro il tavolo (0,55) */}
        <g transform={L(0.55)}>
          <path d="M-200 1220 H1280 V2200 H-200 Z" fill="url(#se-floor)" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M-200 ${1240 + i * i * 10} H1280`} stroke="#000" strokeWidth="3" opacity=".3" />)}
          {/* letto */}
          <g>
            <path d="M-120 1220 V900 Q-40 850 40 900 V1220" stroke={K} strokeWidth="16" fill="none" />
            <path d="M-120 1220 V900 Q-40 850 40 900 V1220" stroke="#6A7276" strokeWidth="7" fill="none" />
            <path d="M-140 1060 H200 V1200 H-140 Z" fill="#E8E6DC" stroke={K} strokeWidth="7" />
            <path d="M-140 1100 H200 V1220 H-140 Z" fill="#4A3A5A" stroke={K} strokeWidth="7" />
            <path d="M-80 1062 Q-40 1030 20 1040 Q60 1050 60 1066 Z" fill="#F6F4EC" stroke={K} strokeWidth="5" />
          </g>
          {/* sedie vuote dietro il tavolo */}
          {[[330, -1], [750, 1]].map(([x, d], i) => (
            <g key={i} transform={`translate(${x + jx * d * 1.5} 0) rotate(${shake * 2 * d * Math.sin(t * 30)} 0 1060)`}>
              <path d={`M-70 1080 V780 Q0 740 70 780 V1080`} fill="#0E0A08" stroke={K} strokeWidth="8" />
              <path d={`M-70 1080 V780 Q0 740 70 780 V1080 M-70 830 H70`} fill="none" stroke="#6A4428" strokeWidth="14" />
              <path d="M-40 1060 V830 M0 1060 V830 M40 1060 V830" stroke="#5A3A20" strokeWidth="9" />
              <path d="M-60 788 Q0 756 60 788" stroke="#B08860" strokeWidth="4" fill="none" opacity=".6" />
            </g>
          ))}
        </g>

        {/* PIANO 2 — il tavolo rotondo con la tovaglia, il candelabro, i bicchieri e i fogli (0,75) */}
        <g transform={`${L(0.75)} translate(${jx} ${jy})`}>
          <Glow id="se-cand" x={540} y={860} r={520} t={t} color="#FFC870" amp={0.07} rate={9} opacity={0.7 * c(1)} />
          <Ombra id="se" x={540} y={1330} rx={460} ry={34} />
          <path d="M150 1050 Q140 1200 170 1320 Q260 1290 330 1326 Q420 1296 500 1330 Q580 1296 660 1330 Q740 1296 820 1326 Q880 1290 910 1320 Q940 1200 930 1050 Z" fill="url(#se-cloth)" stroke={K} strokeWidth="8" />
          {Array.from({ length: 24 }, (_, i) => <circle key={`p${i}`} cx={180 + i * 31} cy={1314 + Math.abs(Math.sin(i * 1.3)) * 10} r="7" fill="none" stroke="#C8C6BC" strokeWidth="3" />)}
          {[260, 400, 540, 680, 820].map((x) => <path key={x} d={`M${x} 1090 Q${x - 10} 1200 ${x + 4} 1310`} stroke="#A8A89E" strokeWidth="5" fill="none" />)}
          <ellipse cx="540" cy="1050" rx="400" ry="110" fill="url(#se-top)" stroke={K} strokeWidth="8" />
          <ellipse cx="540" cy="1050" rx="360" ry="90" fill="none" stroke="#D8C8A0" strokeWidth="3" strokeDasharray="10 8" opacity=".6" />
          {/* candelabro a tre bracci */}
          <g transform="translate(540 1050)">
            <ellipse cx="0" cy="0" rx="60" ry="16" fill="url(#se-brass)" stroke={K} strokeWidth="5" />
            <rect x="-10" y="-130" width="20" height="130" fill="url(#se-brass)" stroke={K} strokeWidth="5" />
            <path d="M-120 -150 Q-120 -100 0 -110 Q120 -100 120 -150" stroke={K} strokeWidth="14" fill="none" />
            <path d="M-120 -150 Q-120 -100 0 -110 Q120 -100 120 -150" stroke="#C8A050" strokeWidth="6" fill="none" />
            {[-120, 0, 120].map((x, i) => (
              <g key={x} transform={`translate(${x} ${i === 1 ? -30 : 0})`}>
                <ellipse cx="0" cy="-150" rx="24" ry="8" fill="url(#se-brass)" stroke={K} strokeWidth="4" />
                <rect x="-11" y="-226" width="22" height="76" fill="#F2EAD4" stroke={K} strokeWidth="4" />
                <path d="M-5 -222 V-160" stroke="#FFFFFF" strokeWidth="3" opacity=".6" />
                <g opacity={c(i)}><Fiamma id="se" x={0} y={-226} t={t} s={1.1} ph={i * 1.7} bend={bendAll * (i - 1 === 0 ? 1 : 0.8)} /></g>
                <g opacity={1 - c(i)}><Wisps t={t} x={0} y={-230} color="#C8CED4" n={2} h={80} width={3} opacity={0.4} /></g>
              </g>
            ))}
          </g>
          {/* bicchieri che tintinnano */}
          {[[300, 1070], [790, 1060]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${shake * 6 * Math.sin(t * 40 + i)})`}>
              <path d="M-22 -70 H22 L14 -20 H-14 Z" fill="#E8F0F2" opacity=".35" stroke={K} strokeWidth="4" />
              <path d="M0 -20 V-4 M-16 0 H16" stroke={K} strokeWidth="5" />
              <path d="M-14 -62 L-10 -30" stroke="#FFFFFF" strokeWidth="3" opacity=".7" />
            </g>
          ))}
          {/* il foglio su cui la matita scrive da sola */}
          <g transform="translate(560 1100) rotate(-4)">
            <path d="M-130 -80 H130 L140 70 H-140 Z" fill="url(#se-paper)" stroke={K} strokeWidth="5" />
            {LINES.map((l, i) => {
              const before = LINES.slice(0, i).reduce((a, x) => a + x.w, 0);
              const len = Math.max(0, Math.min(l.w, write * total - before));
              if (len <= 0) return null;
              const d = Array.from({ length: Math.ceil(len / 8) + 1 }, (_, k) => `${k ? 'L' : 'M'}${(-100 + Math.min(len, k * 8)).toFixed(1)} ${(l.y + Math.sin(k * 1.9 + i) * (4 + l.wob)).toFixed(1)}`).join(' ');
              return <path key={i} d={d} stroke="#2A3A6A" strokeWidth="4" fill="none" strokeLinejoin="round" />;
            })}
            {/* matita */}
            <g transform={`translate(${px} ${py + Math.sin(t * 30) * 3 * (write > 0 && write < 1 ? 1 : 0)}) rotate(-50)`}>
              <rect x="-6" y="-120" width="12" height="104" fill="#C8902E" stroke={K} strokeWidth="3" />
              <path d="M-6 -16 L0 0 L6 -16 Z" fill="#E8D8B0" stroke={K} strokeWidth="3" />
              <rect x="-6" y="-132" width="12" height="14" fill="#C86A6A" stroke={K} strokeWidth="3" />
            </g>
          </g>
          <Glow id="se-paper" x={560} y={1100} r={180} t={t} color="#FFF0C8" amp={0.08} rate={5} opacity={0.4 * seg(t, cues[2] + 0.3, cues[2] + 0.8)} />
        </g>

        {/* PIANO 3 — sedia di spalle in primo piano a sinistra (1,15) */}
        <g transform={L(1.15)}>
          <Ombra id="se" x={190} y={1900} rx={220} ry={24} />
          <path d="M30 1920 V1600 Q190 1540 350 1600 V1920" fill="#0E0A08" stroke={K} strokeWidth="10" />
          <path d="M30 1920 V1600 Q190 1540 350 1600 V1920 M30 1660 H350" fill="none" stroke="#6A4428" strokeWidth="22" />
          <path d="M100 1910 V1670 M190 1910 V1670 M280 1910 V1670" stroke="#5A3A20" strokeWidth="14" />
          <path d="M46 1606 Q190 1556 334 1606" stroke="#B08860" strokeWidth="5" fill="none" opacity=".6" />
        </g>

        {/* PIANO 4 — fogli che si sollevano e pulviscolo (1,5–1,8) */}
        <g transform={L(1.5)} opacity={papers}>
          <Flyers t={t} seed={44} n={5} color="#F2EAD4" outline={K} w={60} h={78} y0={800} y1={1500} speed={0.16} shape="paper" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="se-near" t={t} color="#E8D8B0" n={6} opacity={0.07} />
        </g>
      </g>
      <Finish id="se" tint="#1E2A3A" tintOpacity={0.13} />
    </svg>
  );
};

