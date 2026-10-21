import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { DISPLAY } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Confetti, Dust, Glow, NearMotes, SunRays, Wisps } from '../../lib/elements';
import type { SceneProps } from '../../types';

// Lieto fine: mattina luminosa nello studio del castello. Finestra sul giardino con festoni e coriandoli, poltrona con
// il Wall Street Journal, tavolino con occhiali e tazza fumante; sul davanzale due fedi. Nessuna persona.
// Eventi: raggi del sole (cue 0) · coriandoli (cue 1) · la pagina del giornale si gira (cue 2)
//         · le fedi brillano (cue 3) · il vapore della tazza disegna un cuore (cue 4).
// Piani: cielo e giardino oltre la finestra (0,2) · parete e finestra (0,4) · poltrona, tavolino, davanzale (0,7)
//        · tappeto e fiori in primo piano (1,2) · coriandoli, pulviscolo e particelle (1,5–1,8)

const K = '#16130F';
const ACC = '#8EF0C8';
const r = rng(1975);
const FLAGS = Array.from({ length: 9 }, (_, i) => ({ x: 560 + i * 54, c: i % 2 ? '#F4EEDD' : '#C9D3DB' }));
const BLOOMS = Array.from({ length: 7 }, () => ({ x: r() * 1080, y: 1680 + r() * 220, s: 0.7 + r() * 0.6 }));

export const Nozze: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const sun = seg(t, 0, cues[0] + 1);
  const conf = seg(t, cues[1], cues[1] + 0.4);
  const page = eo(seg(t, cues[2] + 0.2, cues[2] + 1.0));
  const glint = Math.sin(seg(t, cues[3], cues[3] + 0.8) * Math.PI);
  const heart = seg(t, cues[4], cues[4] + 1.2) * (1 - seg(t, dur - 0.6, dur));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="no" />
        <Lin id="no-sky" stops={[[0, '#C9D6E0'], [0.6, '#E8EEF0'], [1, '#F4F2EA']]} />
        <Lin id="no-wall" stops={[[0, '#B9B2A4'], [0.4, '#CFC8BA'], [0.8, '#C2BAAA'], [1, '#A8A090']]} />
        <Lin id="no-garden" stops={[[0, '#9AA898'], [1, '#6E7C6C']]} />
        <Lin id="no-chair" x2={1} y2={0} stops={[[0, '#4A3E36'], [0.5, '#6E5C50'], [1, '#3E342C']]} />
        <Lin id="no-paper" x2={1} y2={0} stops={[[0, '#DCD6C8'], [0.5, '#F4F0E4'], [1, '#D6D0C0']]} />
        <Lin id="no-wood" stops={[[0, '#7A6450'], [1, '#4A3C30']]} />
        <Lin id="no-floor" stops={[[0, '#8A7A66'], [1, '#4A3E32']]} />
        <Lin id="no-rug" x2={1} y2={0} stops={[[0, '#5A4A50'], [0.5, '#7A6670'], [1, '#5A4A50']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo e giardino del castello oltre la finestra (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#no-sky)" />
          <path d="M500 1000 Q700 900 1100 940 V1200 H500 Z" fill="url(#no-garden)" />
          <path d="M760 920 V820 H800 V780 H840 V820 H880 V920 Z" fill="#A8B0B8" stroke="#6E767E" strokeWidth="4" />
          <path d="M796 782 L820 740 L844 782 Z" fill="#8C949C" />
          {[560, 640, 980, 1060].map((x, i) => <ellipse key={x} cx={x} cy={940 - (i % 2) * 10} rx="50" ry="60" fill="#7E8C7C" />)}
        </g>

        {/* PIANO 1 — parete chiara, finestra con festoni (0,4) */}
        <g transform={L(0.4)}>
          <path d="M-200 -200 H1280 V2200 H-200 Z M540 560 V1160 H1040 V560 Z" fill="url(#no-wall)" fillRule="evenodd" />
          <rect x="540" y="560" width="500" height="600" fill="none" stroke="#5A4C40" strokeWidth="18" />
          <path d="M790 560 V1160 M540 860 H1040" stroke="#5A4C40" strokeWidth="10" />
          <Glow id="no-win" x={790} y={800} r={520} t={t} color="#FFF8E6" amp={0.04} rate={1} opacity={0.45 * sun} />
          {/* festone con bandierine */}
          <path d="M540 600 Q790 680 1040 600" fill="none" stroke="#5A4C40" strokeWidth="4" />
          {FLAGS.map((f, i) => {
            const y = 600 + 80 * Math.sin(((f.x - 540) / 500) * Math.PI) * 0.95;
            return <path key={i} d={`M${f.x - 18} ${y} h36 l-18 ${34 + Math.sin(t * 3 + i) * 3} Z`} fill={f.c} stroke={K} strokeWidth="4" />;
          })}
          {/* campanelle nuziali */}
          <g transform={`translate(600 650) rotate(${Math.sin(t * 2.4) * 8})`}>
            <path d="M0 0 V24" stroke={K} strokeWidth="4" />
            <path d="M-24 70 Q-24 24 0 22 Q24 24 24 70 Z" fill="#E8E2D2" stroke={K} strokeWidth="5" />
            <circle cx="0" cy="74" r="7" fill={K} />
          </g>
          {/* cornice con il diploma alla parete */}
          <g transform="translate(250 760)">
            <rect x="-120" y="-90" width="240" height="180" fill="#EDE8DC" stroke="#6B5A46" strokeWidth="14" />
            <text x="0" y="-30" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="22" fill="#3A342C">DIPLOMA</text>
            {[0, 1, 2].map((i) => <path key={i} d={`M-80 ${0 + i * 22} H80`} stroke="#9A9280" strokeWidth="4" />)}
          </g>
        </g>

        {/* PIANO 2 — poltrona con il giornale, tavolino, davanzale con le fedi (0,7) */}
        <g transform={L(0.7)}>
          <path d="M-200 1240 H1280 V2200 H-200 Z" fill="url(#no-floor)" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M-200 ${1270 + i * 46 + i * i * 4} H1280`} stroke="#5A4C3E" strokeWidth="4" opacity=".7" />)}
          {/* davanzale con le due fedi */}
          <rect x="520" y="1150" width="540" height="30" fill="url(#no-wood)" stroke={K} strokeWidth="7" />
          <g transform="translate(860 1150)">
            <Glow id="no-ring" x={10} y={-20} r={70 + 40 * glint} t={t} color={ACC} amp={0.1} rate={4} opacity={0.3 + 0.6 * glint} />
            <ellipse cx="-6" cy="-14" rx="22" ry="14" fill="none" stroke="#D8D4C6" strokeWidth="9" />
            <ellipse cx="-6" cy="-14" rx="22" ry="14" fill="none" stroke={K} strokeWidth="2" />
            <ellipse cx="26" cy="-18" rx="20" ry="16" fill="none" stroke="#E8E2D2" strokeWidth="9" transform="rotate(-20 26 -18)" />
            <path d={`M30 -60 l6 -18 l6 18 l18 6 l-18 6 l-6 18 l-6 -18 l-18 -6 Z`} fill="#F2FFF9" opacity={glint} transform={`rotate(${t * 40} 36 -54)`} />
          </g>
          {/* poltrona */}
          <g transform="translate(260 1260)">
            <path d="M-210 0 V-300 Q-210 -380 -120 -390 H120 Q210 -380 210 -300 V0 Z" fill="url(#no-chair)" stroke={K} strokeWidth="10" />
            <path d="M-250 0 V-170 Q-250 -210 -210 -210 Q-170 -210 -170 -170 V0 Z M250 0 V-170 Q250 -210 210 -210 Q170 -210 170 -170 V0 Z" fill="url(#no-chair)" stroke={K} strokeWidth="10" />
            <rect x="-170" y="-150" width="340" height="80" rx="20" fill="#7A6658" stroke={K} strokeWidth="8" />
            {[-120, -40, 40, 120].map((x) => <circle key={x} cx={x} cy="-300" r="7" fill="#3A302A" />)}
            <path d="M-200 0 v30 M200 0 v30" stroke={K} strokeWidth="18" />
            {/* giornale aperto sul cuscino */}
            <g transform="translate(0 -160) rotate(-4)">
              <path d="M-150 0 L-140 -120 H0 V0 Z" fill="url(#no-paper)" stroke={K} strokeWidth="6" />
              <path d="M150 0 L140 -120 H0 V0 Z" fill="url(#no-paper)" stroke={K} strokeWidth="6" />
              <text x="-70" y="-92" textAnchor="middle" fontFamily="serif" fontWeight={700} fontSize="12" fill="#2A2420">THE WALL STREET</text>
              <text x="-70" y="-74" textAnchor="middle" fontFamily="serif" fontWeight={700} fontSize="12" fill="#2A2420">JOURNAL</text>
              {[0, 1, 2, 3].map((i) => <path key={i} d={`M-128 ${-56 + i * 14} H-18 M18 ${-100 + i * 22} H128`} stroke="#8A847A" strokeWidth="4" />)}
              <path d="M30 -30 l20 -16 l18 8 l26 -26 l20 10" fill="none" stroke="#3A342C" strokeWidth="4" />
              {/* pagina che si gira */}
              {page > 0 && page < 1 && (
                <path d={`M0 0 V-120 L${lerp(140, -140, page)} ${-120 - Math.sin(page * Math.PI) * 50} L${lerp(150, -150, page)} ${-Math.sin(page * Math.PI) * 40} Z`} fill="#F4F0E4" stroke={K} strokeWidth="5" />
              )}
            </g>
          </g>
          {/* tavolino con occhiali e tazza */}
          <g transform="translate(600 1250)">
            <ellipse cx="0" cy="-120" rx="110" ry="24" fill="url(#no-wood)" stroke={K} strokeWidth="8" />
            <path d="M0 -100 V0 M-50 0 H50" stroke={K} strokeWidth="14" />
            <g transform="translate(-40 -132)">
              <circle cx="-16" cy="0" r="16" fill="#DCE4EA" fillOpacity=".5" stroke={K} strokeWidth="5" />
              <circle cx="20" cy="0" r="16" fill="#DCE4EA" fillOpacity=".5" stroke={K} strokeWidth="5" />
              <path d="M0 0 h4" stroke={K} strokeWidth="5" />
            </g>
            <g transform="translate(46 -132)">
              <path d="M-24 0 V-50 H24 V0 Z" fill="#EDE7D8" stroke={K} strokeWidth="6" />
              <path d="M24 -40 q20 0 20 16 q0 14 -20 14" fill="none" stroke={K} strokeWidth="6" />
            </g>
          </g>
          <Wisps t={t} x={646} y={1190} color="#FFFFFF" n={2} h={120} width={5} opacity={0.6 * (1 - heart)} />
          {/* il vapore disegna un cuore */}
          <path d="M646 1150 C646 1120 606 1110 606 1086 C606 1066 630 1058 646 1076 C662 1058 686 1066 686 1086 C686 1110 646 1120 646 1150 Z" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinejoin="round" opacity={0.8 * heart} transform={`translate(0 ${-30 * heart})`} />
        </g>

        {/* PIANO 3 — tappeto e vaso di fiori in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1600 Q540 1540 1280 1600 V2200 H-200 Z" fill="url(#no-rug)" stroke={K} strokeWidth="9" />
          <path d="M-200 1640 Q540 1580 1280 1640" fill="none" stroke="#C9B6C0" strokeWidth="8" strokeDasharray="28 14" />
          <g transform="translate(940 1640)">
            <path d="M-70 0 Q-80 -110 -50 -140 H50 Q80 -110 70 0 Z" fill="#C9D3DB" stroke={K} strokeWidth="9" />
            <path d="M-40 -130 Q-30 -60 -46 -10" fill="none" stroke="#FFFFFF" strokeWidth="6" opacity=".6" />
            {[-60, -20, 20, 60].map((x, i) => (
              <g key={x} transform={`rotate(${Math.sin(t * 1.6 + i) * 4} 0 -140)`}>
                <path d={`M0 -140 Q${x * 0.5} -220 ${x} -280`} fill="none" stroke="#4E5A48" strokeWidth="7" />
                {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={x} cy={-300} rx="14" ry="26" fill="#F4EEDD" stroke={K} strokeWidth="4" transform={`rotate(${a} ${x} -280)`} />)}
                <circle cx={x} cy={-280} r="10" fill="#E8C483" stroke={K} strokeWidth="4" />
              </g>
            ))}
          </g>
          {BLOOMS.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={10 * b.s} fill="#F4EEDD" opacity=".35" />)}
        </g>

        {/* PIANO 4 — raggi del sole, coriandoli, pulviscolo (1,5–1,8) */}
        <g transform={L(0.4)} opacity={sun}>
          <SunRays id="no-rays" x={1000} y={560} t={t} color="#FFF4D6" n={6} length={1300} width={110} from={-140} to={-100} opacity={0.4} />
        </g>
        <g transform={L(1.5)} opacity={conf}>
          <Confetti t={mod(t - cues[1], 100)} n={40} colors={['#F4EEDD', '#C9D3DB', ACC, '#E8C483', '#D8C4CC']} y0={-100} y1={1900} speed={0.25} />
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 600, x0: 560, x1: 1020 }} bottom={{ y: 1500, x0: 100, x1: 700 }} n={26} color="#FFF8E6" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="no-near" t={t} color="#FFF8E6" n={6} vx={-25} vy={-8} opacity={0.08} />
        </g>
      </g>

      <Finish id="no" tint="#5E6B75" tintOpacity={0.1} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): raggi del sole 0 → cue0 + 1 · coriandoli da cue1 · pagina del giornale cue2 + 0,2
// · fedi che brillano cue3 · cuore di vapore cue4.
