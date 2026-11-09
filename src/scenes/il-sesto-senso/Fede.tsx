import React from 'react';
import { camera, eio, eo, lerp, mod, seg } from '../../lib/anim';
import { Confetti, Dust, Fog, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { K, Ombra, SestoDefs } from './Comuni';

// La fede nella mano di Anna: il soggiorno dei Crowe di notte, illuminato solo dal televisore che manda il video delle
// nozze (la torta, i fiori, i coriandoli, nessuna persona). Sul divano lo scialle rosso di Anna, che dorme (non si vede):
// sul bordo del cuscino brilla la fede d'oro di Malcolm.
// Eventi: 1ª frase sul televisore scorre il video delle nozze, coriandoli sullo schermo; 2ª frase la fede scivola dal
// cuscino, cade e rotola sul pavimento fino a fermarsi nella luce dello schermo; 3ª frase l'aria si fa gelida: un velo
// di nebbia fredda scende sul pavimento e la luce del televisore diventa azzurra (i morti non sanno di esserlo).
// Nessuna persona.
// Piani: parete e finestra con le tende (0,3) · mobile con il televisore (0,5) · divano con lo scialle (0,7)
//        · tavolino basso in primo piano (1,2) · pulviscolo nella luce dello schermo (1,5–1,8)

export const Fede: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const fall = griglia(cues[1] + 1.4);
  const drop = seg(t, fall, fall + 0.45);
  const roll = eo(seg(t, fall + 0.45, fall + 2.4));
  const bounce = Math.abs(Math.sin(seg(t, fall + 0.45, fall + 0.9) * Math.PI * 2)) * 22 * (1 - seg(t, fall + 0.45, fall + 0.9));
  const ringX = lerp(560, 760, roll);
  const ringY = drop < 1 ? lerp(1176, 1330, drop * drop) : 1330 - bounce;
  const ringRot = roll * 540;
  const cold = eio(seg(t, griglia(cues[2] + 0.6), griglia(cues[2] + 0.6) + 2));
  const glint = Math.max(0, Math.sin(t * 2.4)) * (drop < 1 ? 0.6 : 1);
  const SX = 150, SY = 820, SW = 300, SH = 220;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fd" />
        <SestoDefs id="fd" />
        <Lin id="fd-wall" stops={[[0, '#080A10'], [0.4, '#141C28'], [0.75, '#1E2632'], [1, '#0E1218']]} />
        <Lin id="fd-floor" stops={[[0, '#2A2018'], [0.5, '#16100A'], [1, '#050302']]} />
        <Lin id="fd-sofa" stops={[[0, '#4A5A6A'], [0.5, '#34404E'], [1, '#1A2028']]} />
        <Lin id="fd-sofa2" x2={1} y2={0} stops={[[0, '#2A3440'], [0.5, '#4A5868'], [1, '#222A34']]} />
        <Lin id="fd-table" stops={[[0, '#5A3E2A'], [1, '#2A1A0E']]} />
        <radialGradient id="fd-screen" cx=".5" cy=".45" r=".75"><stop offset="0" stopColor="#F2EEE4" /><stop offset="1" stopColor="#8A9AAA" /></radialGradient>
        <linearGradient id="fd-tvlight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#BCD4EC" stopOpacity=".45" />
          <stop offset="1" stopColor="#BCD4EC" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete scura e finestra con le tende chiuse, un filo di luna (0,3) */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#fd-wall)" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-160 + i * 120} 620 V1100`} stroke="#22303E" strokeWidth="14" opacity=".35" />)}
          <rect x="640" y="640" width="320" height="300" fill="#0A1424" stroke={K} strokeWidth="8" />
          <path d="M800 640 V940" stroke="#2A3646" strokeWidth="8" />
          <path d="M620 620 H790 Q770 800 790 960 H620 Z M810 620 H980 V960 H810 Q830 800 810 620 Z" fill="#2A2638" stroke={K} strokeWidth="6" />
          <path d="M790 640 V940" stroke="#9AB4D4" strokeWidth="4" opacity=".6" />
          {/* cornice con la foto delle nozze: solo il bouquet */}
          <g transform="translate(560 760)">
            <rect x="-50" y="-60" width="100" height="120" fill="url(#fd-gold)" stroke={K} strokeWidth="5" />
            <rect x="-38" y="-48" width="76" height="96" fill="#C8C4BC" />
            {[[-12, -6], [10, -10], [0, 10], [-16, 14], [16, 12]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="11" fill={i % 2 ? '#F2F0E8' : '#E8C0C8'} stroke={K} strokeWidth="2" />)}
            <path d="M0 22 L-6 44 M0 22 L6 44" stroke="#3A5A2A" strokeWidth="4" />
          </g>
        </g>

        {/* PIANO 1 — mobile con il televisore che manda il video delle nozze (0,5) */}
        <g transform={L(0.5)} strokeLinejoin="round">
          <path d="M-200 1120 H1280 V2200 H-200 Z" fill="url(#fd-floor)" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-200 + i * 180} 1120 L${-420 + i * 240} 2200`} stroke="#000" strokeWidth="4" opacity=".35" />)}
          {/* luce dello schermo sul pavimento */}
          <path d={`M${SX + SW} ${SY} L1100 1500 V1700 L${SX} 1300 Z`} fill="url(#fd-tvlight)" opacity={0.6} />
          <Ombra id="fd" x={300} y={1180} rx={220} ry={20} />
          <rect x="100" y="1060" width="400" height="120" fill="url(#fd-table)" stroke={K} strokeWidth="8" />
          <rect x="130" y="1080" width="160" height="80" fill="none" stroke="#1A0E06" strokeWidth="5" />
          <rect x="310" y="1080" width="160" height="80" fill="none" stroke="#1A0E06" strokeWidth="5" />
          <rect x="120" y="790" width="360" height="270" rx="20" fill="#1E1A18" stroke={K} strokeWidth="9" />
          <clipPath id="fd-clip"><rect x={SX} y={SY} width={SW} height={SH} rx="20" /></clipPath>
          <g clipPath="url(#fd-clip)">
            <rect x={SX} y={SY} width={SW} height={SH} fill="url(#fd-screen)" />
            {/* video delle nozze: tavolo con la torta a tre piani e i fiori */}
            <rect x={SX} y={SY + 150} width={SW} height="70" fill="#C8BCA8" />
            <g transform={`translate(${SX + 150} ${SY + 160})`}>
              <rect x="-60" y="-34" width="120" height="34" fill="#FFFFFF" stroke="#3A3A3A" strokeWidth="3" />
              <rect x="-44" y="-64" width="88" height="30" fill="#FFFFFF" stroke="#3A3A3A" strokeWidth="3" />
              <rect x="-28" y="-90" width="56" height="26" fill="#FFFFFF" stroke="#3A3A3A" strokeWidth="3" />
              {[-40, 40].map((x) => <circle key={x} cx={x} cy="-44" r="6" fill="#E8B8C0" />)}
            </g>
            {[[SX + 40, SY + 140], [SX + 260, SY + 140]].map(([x, y], i) => (
              <g key={i}>{[[-12, -10], [8, -14], [0, 4]].map(([dx, dy], k) => <circle key={k} cx={x + dx} cy={y + dy} r="10" fill={k % 2 ? '#F2F0E8' : '#E8C0C8'} stroke="#3A3A3A" strokeWidth="2" />)}</g>
            ))}
            <g transform={`translate(${SX} ${SY}) scale(0.28)`}><Confetti t={t} seed={4} n={30} y0={-100} y1={800} speed={0.25} colors={['#F2E8B0', '#E8C0C8', '#FFFFFF', '#B8D0E8']} /></g>
            <rect x={SX} y={SY} width={SW} height={SH} fill="#5A8AC8" opacity={0.35 * cold} />
            {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M${SX} ${SY + i * 10} H${SX + SW}`} stroke="#000" strokeWidth="2" opacity=".12" />)}
            <rect x={SX} y={SY + mod(t * 60, SH)} width={SW} height="6" fill="#FFFFFF" opacity=".12" />
          </g>
          <Glow id="fd-tv" x={SX + SW / 2} y={SY + SH / 2} r={460} t={t} color={cold > 0.5 ? '#9CC4F0' : '#D8E4F0'} amp={0.1} rate={9} opacity={0.55} />
          <rect x="420" y="760" width="16" height="30" fill={K} />
          <path d="M428 760 L400 690 M428 760 L470 700" stroke="#8A9298" strokeWidth="5" strokeLinecap="round" />
          {/* videoregistratore */}
          <rect x="140" y="1020" width="200" height="34" rx="4" fill="#14161A" stroke={K} strokeWidth="4" />
          <circle cx="320" cy="1037" r="5" fill="#5AE88A" />
        </g>

        {/* PIANO 2 — il divano con lo scialle rosso e la fede sul bordo del cuscino (0,7) */}
        <g transform={L(0.7)} strokeLinejoin="round">
          <Ombra id="fd" x={760} y={1300} rx={330} ry={30} />
          <path d="M480 940 Q480 900 520 900 H1000 Q1040 900 1040 940 V1150 H480 Z" fill="url(#fd-sofa)" stroke={K} strokeWidth="9" />
          {[600, 760, 920].map((x) => <path key={x} d={`M${x} 920 V1130`} stroke="#1A2028" strokeWidth="5" opacity=".6" />)}
          <path d="M500 1110 H1030 Q1050 1110 1050 1140 V1230 Q760 1250 470 1230 V1140 Q470 1110 500 1110 Z" fill="url(#fd-sofa2)" stroke={K} strokeWidth="9" />
          <path d="M760 1116 V1236" stroke="#1A2028" strokeWidth="5" />
          <path d="M440 1020 Q440 980 480 980 Q520 980 520 1020 V1280 H440 Z" fill="url(#fd-sofa)" stroke={K} strokeWidth="9" />
          <path d="M1000 1020 Q1000 980 1040 980 Q1080 980 1080 1020 V1280 H1000 Z" fill="url(#fd-sofa)" stroke={K} strokeWidth="9" />
          <path d="M470 1230 Q760 1250 1050 1230 V1280 H470 Z" fill="#141A20" stroke={K} strokeWidth="7" />
          <path d="M490 990 Q480 960 500 950" stroke="#8AA0B8" strokeWidth="5" opacity=".6" fill="none" />
          {/* cuscino e scialle rosso stropicciato */}
          <path d="M840 960 Q900 930 980 960 Q1000 1040 960 1100 Q890 1110 840 1090 Q820 1020 840 960 Z" fill="#C8C4BC" stroke={K} strokeWidth="7" />
          <path d="M600 1000 Q700 960 820 990 Q900 1040 960 1110 Q980 1170 940 1210 Q840 1236 700 1226 Q620 1200 610 1130 Q590 1060 600 1000 Z" fill="url(#fd-redcloth)" stroke={K} strokeWidth="8" />
          {[[640, 1020, 700, 1200], [720, 990, 780, 1220], [820, 1010, 880, 1210]].map(([a, b, c, d], i) => <path key={i} d={`M${a} ${b} Q${(a + c) / 2 + 20} ${(b + d) / 2} ${c} ${d}`} stroke="#4A0C0A" strokeWidth="7" fill="none" opacity=".7" />)}
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${700 + i * 26} 1224 v24`} stroke="#8A1A16" strokeWidth="5" strokeLinecap="round" />)}
          <path d="M610 1010 Q700 974 816 1000" stroke="#F28A7A" strokeWidth="4" fill="none" opacity=".55" />
          <Glow id="fd-shawl" x={760} y={1110} r={240} t={t} color="#E04A3A" amp={0.05} rate={1.5} opacity={0.2} />
        </g>

        {/* la fede d'oro: scivola, cade, rimbalza e rotola (stesso piano del divano) */}
        <g transform={L(0.7)}>
          <Ombra id="fd" x={ringX} y={1342} rx={26 * (drop < 1 ? 0.6 : 1)} ry={6} opacity={drop > 0.6 ? 1 : 0} />
          <g transform={`translate(${ringX} ${ringY}) rotate(${ringRot})`}>
            <ellipse cx="0" cy="0" rx="22" ry="22" fill="none" stroke={K} strokeWidth="14" />
            <ellipse cx="0" cy="0" rx="22" ry="22" fill="none" stroke="url(#fd-gold)" strokeWidth="8" />
            <path d="M-14 -16 A22 22 0 0 1 12 -18" stroke="#FFFBE0" strokeWidth="4" fill="none" />
          </g>
          <Glow id="fd-ring" x={ringX} y={ringY} r={90} t={t} color="#FFE8A0" amp={0.15} rate={4} opacity={0.35 + 0.45 * glint} />
          <path d={`M${ringX - 30} ${ringY - 30} l14 14 M${ringX + 30} ${ringY - 30} l-14 14 M${ringX} ${ringY - 42} v18`} stroke="#FFF6D0" strokeWidth="4" strokeLinecap="round" opacity={glint * (drop >= 1 ? 1 : 0.5)} />
        </g>

        {/* PIANO 3 — nebbia fredda sul pavimento (0,9) */}
        <g transform={L(0.9)}>
          <Fog id="fd-cold" t={t} y={1330} rx={700} ry={90} color="#BCDCF4" opacity={0.55 * cold} speed={0.5} drift={100} />
          <Glow id="fd-coldglow" x={760} y={1200} r={520} t={t} color="#9CC8F0" amp={0.05} rate={1.5} opacity={0.3 * cold} />
        </g>

        {/* PIANO 4 — tavolino basso in primo piano con il telecomando e due bicchieri (1,2) */}
        <g transform={L(1.2)} strokeLinejoin="round">
          <Ombra id="fd" x={540} y={1900} rx={420} ry={30} />
          <path d="M120 1560 H960 L1010 1640 H70 Z" fill="url(#fd-table)" stroke={K} strokeWidth="9" />
          <path d="M70 1640 H1010 V1680 H70 Z" fill="#1E140A" stroke={K} strokeWidth="7" />
          <path d="M130 1566 H950" stroke="#B88A5A" strokeWidth="4" opacity=".6" />
          {[130, 950].map((x) => <rect key={x} x={x - 14} y="1680" width="28" height="220" fill="#1E140A" stroke={K} strokeWidth="6" />)}
          <g transform="translate(360 1590) rotate(-12)">
            <rect x="-70" y="-16" width="140" height="32" rx="10" fill="#1A1C20" stroke={K} strokeWidth="5" />
            {[-40, -16, 8, 32].map((x) => <circle key={x} cx={x} cy="0" r="5" fill="#5A6066" />)}
            <circle cx="56" cy="0" r="6" fill="#C83A30" />
          </g>
          {[700, 790].map((x, i) => (
            <g key={x} transform={`translate(${x} 1600)`}>
              <path d="M-18 0 H18 M0 0 V-40" stroke={K} strokeWidth="6" />
              <path d="M-24 -40 Q-28 -96 -20 -104 H20 Q28 -96 24 -40 Q0 -30 -24 -40 Z" fill="url(#fd-glass)" stroke={K} strokeWidth="5" />
              {i === 0 && <path d="M-25 -62 Q0 -56 25 -62 Q24 -44 0 -38 Q-24 -44 -25 -62 Z" fill="#6A1418" />}
            </g>
          ))}
        </g>

        {/* PIANO 5 — pulviscolo nella luce dello schermo (1,5) e particelle vicine (1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 840, x0: 420, x1: 520 }} bottom={{ y: 1500, x0: 380, x1: 1000 }} seed={21} n={20} color="#D8E6F4" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="fd-near" t={t} color="#C8DCF0" n={6} opacity={0.06 + 0.06 * cold} />
        </g>
      </g>
      <Finish id="fd" tint="#1A2638" tintOpacity={0.14} />
    </svg>
  );
};
