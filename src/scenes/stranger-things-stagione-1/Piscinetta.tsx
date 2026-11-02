import React from 'react';
import { camera, eo, rng, seg } from '../../lib/anim';
import { Beam, Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { GIALLO, K, Ombra, SOTTO, StDefs, VELATURA } from './Comuni';

// Will è ancora vivo: la palestra della scuola di notte, con la piscinetta gonfiabile piena d'acqua e sale.
// Eventi: prima frase l'acqua fa cerchi concentrici sotto l'unica lampada (Undici che galleggia, mai disegnata);
// seconda frase l'acqua diventa una finestra sul Sottosopra: dentro si vede il rifugio di legno di Will con una luce
// calda che resiste a fatica, e la radio gracchia; terza frase nell'acqua compare lo squarcio luminoso del passaggio,
// aperto da lei in un esperimento del laboratorio.
// Piani: parete con le gradinate e il canestro (0,28) · parquet con le linee del campo (0,45) · piscinetta, lampada
//        (0,68) · sacchi di sale, radio sulla sedia (1,15) · pulviscolo nel fascio (1,4) · velo vicino (1,8)

const r = rng(808);
const SPORES = Array.from({ length: 14 }, () => ({ x: 300 + r() * 480, y: 1000 + r() * 200, s: 2 + r() * 4, ph: r() * 6 }));

export const Piscinetta: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;

  const tVision = griglia(cues[1] + 0.3);
  const vision = eo(seg(t, tVision, tVision + 1.0));
  const willLight = vision * (0.55 + 0.25 * Math.sin(t * 3.1) + 0.2 * Math.sin(t * 7.7));
  const tGate = griglia(cues[2] + 0.9);
  const gate = eo(seg(t, tGate, tGate + 0.8));
  const hut = 1 - 0.75 * gate;
  const radio = seg(t, tVision, tVision + 0.2);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pt" />
        <StDefs id="pt" />
        <Lin id="pt-wall" stops={[[0, '#0E1018'], [0.4, '#1E222C'], [1, '#2E2A26']]} />
        <Lin id="pt-floor" stops={[[0, '#7A5A34'], [0.5, '#5A4024'], [1, '#2A1C10']]} />
        <Lin id="pt-pool" x2={1} y2={0} stops={[[0, '#2A5A9A'], [0.45, '#5A9AD8'], [1, '#1E4A82']]} />
        <Lin id="pt-water" stops={[[0, '#1A3A5A'], [1, '#0A1A2A']]} />
        <Lin id="pt-ud" stops={[[0, '#3A6A92'], [0.55, '#1E3A58'], [1, '#0A1420']]} />
        <Lin id="pt-sack" x2={1} y2={0} stops={[[0, '#C8BCA0'], [0.5, '#E8DEC4'], [1, '#A89C80']]} />
        <clipPath id="pt-clip"><ellipse cx="540" cy="1098" rx="318" ry="86" /></clipPath>
        <radialGradient id="pt-gate" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#FFE0B0" /><stop offset=".35" stopColor="#F07A3A" /><stop offset=".75" stopColor="#8A2A2A" /><stop offset="1" stopColor="#3A1018" stopOpacity="0" /></radialGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete della palestra con le gradinate e il canestro (0,28) */}
        <g transform={L(0.28)}>
          <rect x="-200" y="-200" width="1480" height="1200" fill="url(#pt-wall)" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M-200 ${120 + i * 110} H1280`} stroke="#000" strokeWidth="3" opacity=".25" />)}
          {/* gradinate di legno a sinistra */}
          {Array.from({ length: 5 }, (_, i) => (
            <g key={i}>
              <rect x={-200} y={780 + i * 44} width={620 - i * 40} height="44" fill={i % 2 ? '#5A4428' : '#6A5030'} stroke={K} strokeWidth="5" />
              <path d={`M-200 ${782 + i * 44} H${420 - i * 40}`} stroke="#B08A58" strokeWidth="3" opacity=".5" />
            </g>
          ))}
          {/* tabellone del canestro */}
          <rect x="740" y="680" width="230" height="150" fill="#E8E8E2" fillOpacity=".85" stroke={K} strokeWidth="8" />
          <rect x="810" y="740" width="90" height="64" fill="none" stroke="#B8352F" strokeWidth="6" />
          <path d="M800 830 h110" stroke="#E86A2A" strokeWidth="10" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${806 + i * 20} 836 l8 60`} stroke="#E8E8E2" strokeWidth="3" opacity=".8" />)}
          <path d="M855 680 V640" stroke={K} strokeWidth="12" />
          {/* orologio della palestra */}
          <rect x="150" y="680" width="120" height="70" rx="8" fill="#1A1C22" stroke={K} strokeWidth="6" />
          <text x="210" y="730" textAnchor="middle" fontFamily="Figtree, sans-serif" fontWeight="800" fontSize="38" fill="#FF5A3A" opacity=".8">00:00</text>
        </g>

        {/* PIANO 1 — parquet con le linee del campo (0,45) */}
        <g transform={L(0.45)}>
          <path d="M-200 1000 H1280 V2200 H-200 Z" fill="url(#pt-floor)" />
          {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${-200 + i * 110} 1000 L${-1000 + i * 260} 2200`} stroke="#3A2814" strokeWidth="3" opacity=".5" />)}
          <ellipse cx="540" cy="1110" rx="460" ry="120" fill="none" stroke="#E8E2D2" strokeWidth="8" opacity=".55" />
          <path d="M-200 1050 H1280" stroke="#E8E2D2" strokeWidth="8" opacity=".5" />
          <path d="M-200 1004 H1280" stroke="#000" strokeWidth="8" opacity=".5" />
          {/* riflesso della lampada sul parquet lucido */}
          <ellipse cx="540" cy="1300" rx="300" ry="60" fill="#FFE8B0" opacity=".12" />
        </g>

        {/* lampada a sospensione e il suo cono di luce */}
        <g transform={L(0.6)}>
          <path d="M540 640 V760" stroke={K} strokeWidth="5" />
          <path d="M490 800 L520 756 H560 L590 800 Z" fill="#3A4048" stroke={K} strokeWidth="6" />
          <ellipse cx="540" cy="800" rx="50" ry="10" fill="#FFF2C8" />
          <Beam id="pt-cone" x={540} y={800} t={t} length={360} spread={680} color="#FFE8B0" angle={90} opacity={0.35} />
          <Glow id="pt-lamp" x={540} y={800} r={140} t={t} color="#FFE8B0" amp={0.04} rate={3} opacity={0.7} />
        </g>

        {/* PIANO 2 — la piscinetta gonfiabile: l'acqua diventa una finestra sul Sottosopra (0,68) */}
        <g transform={L(0.68)}>
          <Ombra id="pt" x={540} y={1190} rx={420} ry={40} />
          {/* bordo gonfio a tre anelli */}
          <ellipse cx="540" cy="1140" rx="380" ry="96" fill="url(#pt-pool)" stroke={K} strokeWidth="9" />
          <ellipse cx="540" cy="1118" rx="372" ry="94" fill="#3A7AC0" stroke={K} strokeWidth="6" />
          <ellipse cx="540" cy="1100" rx="360" ry="98" fill="url(#pt-pool)" stroke={K} strokeWidth="8" />
          <path d="M200 1080 Q540 990 880 1080" stroke="#BCE0FF" strokeWidth="6" fill="none" opacity=".7" />
          {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={240 + i * 120} cy={1150 + Math.sin(i) * 6} r="10" fill="#F2E3C6" opacity=".5" />)}
          {/* acqua */}
          <ellipse cx="540" cy="1098" rx="318" ry="86" fill="url(#pt-water)" stroke={K} strokeWidth="5" />
          <g clipPath="url(#pt-clip)">
            {/* la visione: il Sottosopra con il rifugio di legno di Will */}
            <g opacity={vision}>
              <rect x="200" y="1000" width="700" height="200" fill="url(#pt-ud)" />
              <path d="M200 1150 Q400 1120 540 1140 Q700 1160 900 1130 V1200 H200 Z" fill="#06090E" />
              {[260, 330, 760, 840].map((x, i) => <path key={x} d={`M${x} 1150 V${1010 + i * 6} M${x} ${1060 + i * 4} l-26 -20 M${x} ${1080} l22 -24`} stroke="#1A2434" strokeWidth="8" strokeLinecap="round" />)}
              <g opacity={hut} transform="translate(540 1140) scale(1.35) translate(-540 -1140)">
                <path d="M470 1140 V1070 L540 1030 L610 1070 V1140 Z" fill="#120E0C" stroke={K} strokeWidth="5" />
                {[490, 520, 550, 580].map((x) => <path key={x} d={`M${x} 1060 V1140`} stroke="#3A2A1C" strokeWidth="3" />)}
                <path d="M460 1074 L540 1026 L620 1074" stroke="#2A1E14" strokeWidth="10" fill="none" />
                <rect x="522" y="1092" width="36" height="48" fill={GIALLO} opacity={0.5 + 0.5 * willLight} stroke={K} strokeWidth="4" />
                <Glow id="pt-will" x={540} y={1114} r={90} t={t} color={GIALLO} amp={0} opacity={willLight} />
              </g>
              {SPORES.map((sp, i) => <circle key={i} cx={sp.x + Math.sin(t + sp.ph) * 10} cy={sp.y - ((t * 8 + i * 13) % 60)} r={sp.s} fill="#D8EEF8" opacity=".6" />)}
              {/* lo squarcio del passaggio, aperto nel laboratorio */}
              <g opacity={gate}>
                <ellipse cx="540" cy="1090" rx={150 + 10 * Math.sin(t * 2.4)} ry={60 + 6 * Math.sin(t * 2.4)} fill="url(#pt-gate)" />
                <path d="M420 1090 Q470 1060 540 1066 Q610 1060 660 1090 Q610 1118 540 1112 Q470 1118 420 1090 Z" fill="none" stroke="#3A1018" strokeWidth="6" />
                {[0, 1, 2, 3, 4, 5].map((k) => <path key={k} d={`M${470 + k * 28} 1076 q${(k % 2 ? 1 : -1) * 10} 14 ${(k % 2 ? -1 : 1) * 4} 30`} stroke="#FFD0A0" strokeWidth="3" fill="none" opacity=".8" />)}
              </g>
            </g>
            {/* cerchi concentrici sull'acqua */}
            {[0, 1, 2].map((k) => {
              const p = ((t * 0.35 + k / 3) % 1);
              return <ellipse key={k} cx="540" cy="1098" rx={30 + p * 300} ry={(30 + p * 300) * 0.27} fill="none" stroke="#CFE8FF" strokeWidth={4 - p * 3} opacity={(1 - p) * (0.7 - 0.45 * vision)} />;
            })}
            <path d="M260 1060 Q540 1020 820 1060" stroke="#FFFFFF" strokeWidth="4" fill="none" opacity=".35" />
          </g>
          <Glow id="pt-visionglow" x={540} y={1098} r={380} t={t} color={gate > 0.1 ? '#F07A3A' : SOTTO} amp={0.05} rate={2} opacity={0.35 * vision} />
        </g>

        {/* PIANO 3 — sacchi di sale a sinistra, radio sulla sedia a destra (1,15) */}
        <g transform={L(1.15)}>
          {[[-40, 1180, -4], [120, 1196, 6], [30, 1110, -2]].map(([x, y, a], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
              <Ombra id="pt" x={90} y={116} rx={110} ry={14} />
              <path d="M0 20 Q-6 0 10 -6 H170 Q186 0 180 20 V100 Q186 116 170 118 H10 Q-6 116 0 100 Z" fill="url(#pt-sack)" stroke={K} strokeWidth="7" />
              <text x="90" y="72" textAnchor="middle" fontFamily="Figtree, sans-serif" fontWeight="800" fontSize="32" fill="#2E5A8A">SALE</text>
              <path d="M10 -2 l10 -10 l10 10 l10 -10 l10 10" stroke="#8A7E62" strokeWidth="3" fill="none" />
            </g>
          ))}
          {/* sacco aperto con il sale versato */}
          <path d="M210 1290 Q260 1270 330 1300 Q290 1320 210 1310 Z" fill="#F2EEE4" stroke="#B8B0A0" strokeWidth="3" />
          {/* sedia pieghevole con la radio */}
          <path d="M830 1200 H1020 L1030 1226 H820 Z" fill="#8A929A" stroke={K} strokeWidth="7" />
          <path d="M840 1226 L800 1960 M1010 1226 L1060 1960 M1020 1200 L1036 1030 M812 1700 H1050" stroke="#6A727A" strokeWidth="12" />
          <rect x="850" y="1100" width="170" height="100" rx="12" fill="#3A3026" stroke={K} strokeWidth="7" />
          <rect x="866" y="1116" width="80" height="68" rx="6" fill="#1A1C22" stroke={K} strokeWidth="4" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M872 ${1124 + i * 10} H940`} stroke="#3A3E46" strokeWidth="3" />)}
          <rect x="956" y="1120" width="50" height="16" fill="#C8B888" stroke={K} strokeWidth="3" />
          <circle cx="970" cy="1166" r="10" fill="#8A7A5A" stroke={K} strokeWidth="3" /><circle cx="996" cy="1166" r="10" fill="#8A7A5A" stroke={K} strokeWidth="3" />
          <path d="M1000 1100 L1060 990" stroke="#9AA2AA" strokeWidth="5" />
          {/* gracchiare della radio: onde */}
          {[0, 1, 2].map((k) => {
            const p = ((t * 1.2 + k / 3) % 1);
            return <path key={k} d={`M${900 - p * 40} ${1090 - p * 50} q${-20 - p * 30} ${30 + p * 20} 0 ${60 + p * 40}`} stroke="#F2E3C6" strokeWidth="4" fill="none" opacity={radio * (1 - p) * 0.8} />;
          })}
          {/* carrello dei palloni in primo piano a sinistra */}
          <path d="M-60 1640 H330 L310 1960 H-40 Z" fill="#3A4048" stroke={K} strokeWidth="9" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${-20 + i * 60} 1650 V1950`} stroke="#5A626C" strokeWidth="6" />)}
          {[[30, 1610], [120, 1600], [210, 1614], [80, 1560], [170, 1556]].map(([x, y], i) => (
            <g key={i}><circle cx={x} cy={y} r="50" fill="#D8642A" stroke={K} strokeWidth="6" /><path d={`M${x - 50} ${y} H${x + 50} M${x} ${y - 50} V${y + 50}`} stroke={K} strokeWidth="4" /></g>
          ))}
          {/* pallone a terra */}
          <circle cx="720" cy="1380" r="56" fill="#D8642A" stroke={K} strokeWidth="7" />
          <path d="M664 1380 H776 M720 1324 V1436 M684 1336 Q720 1380 684 1424 M756 1336 Q720 1380 756 1424" stroke={K} strokeWidth="4" fill="none" />
        </g>

        <g transform={L(1.4)}>
          <Dust t={t} top={{ y: 820, x0: 480, x1: 600 }} bottom={{ y: 1160, x0: 260, x1: 820 }} seed={18} n={18} color="#FFE8C0" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="pt-near" t={t} color="#C8C0A8" n={6} r0={80} r1={160} opacity={0.08} y0={760} />
        </g>
      </g>
      <Finish id="pt" tint={VELATURA} tintOpacity={0.12} />
    </svg>
  );
};
