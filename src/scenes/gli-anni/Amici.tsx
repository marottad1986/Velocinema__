import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Confetti, Glow, Gulls, NearMotes, StringLights } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K, Motorino, ORANGE, TINT_DAY } from './Comune';

// Gli amici cresciuti: piazza di provincia di sera. Un'auto da sposi con i nastri, chicchi di riso che volano,
// un passeggino accanto a una panchina, la torre con l'orologio, un cartello con due frecce; in un angolo il motorino
// da solo sotto un lampione.
// Piani: cielo (0,2) · palazzi con i portici e la torre (0,35) · auto da sposi, panchina, passeggino (0,6)
//        · motorino e lampione (0,9) · lastricato e vasi di fiori (1,2) · riso e pulviscolo (1,6)
// Eventi: cues[1] volano i chicchi di riso sull'auto degli sposi · cues[2] le lancette della torre corrono
//         (quanto tempo è passato) · cues[3] il lampione sul motorino si accende tremolando · cues[4] il cartello
//         con le due frecce si illumina (chi ha trovato la sua strada).

const r = rng(606);
const ARCHES = Array.from({ length: 9 }, (_, i) => ({ x: -160 + i * 160, w: r() }));

export const Amici: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c1 = cues[1] ?? 2.9, c2 = cues[2] ?? 5.7, c3 = cues[3] ?? 8.7, c4 = cues[4] ?? 11.7;
  const rice = seg(t, c1, c1 + 0.3) * (1 - seg(t, c1 + 4, c1 + 5));
  const run = eo(seg(t, c2, c2 + 2.5));
  const clockMin = t * 10 + run * 2160;
  const lamp = seg(t, c3, c3 + 0.6) * (Math.sin(t * 30) > -0.6 || t > c3 + 0.8 ? 1 : 0.3);
  const sign = eob(seg(t, c4, c4 + 0.5));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="am" />
        <Lin id="am-sky" stops={[[0, '#1E2050'], [0.45, '#5A3A70'], [0.75, '#D8786A'], [1, '#F2B070']]} />
        <Lin id="am-bld" x2={1} y2={0} stops={[[0, '#C8805A'], [0.5, '#E8A070'], [1, '#A8603E']]} />
        <Lin id="am-tower" x2={1} y2={0} stops={[[0, '#A85A3A'], [0.5, '#D8805A'], [1, '#8A4A2E']]} />
        <Lin id="am-pave" stops={[[0, '#8A7A6A'], [0.4, '#5A4E44'], [1, '#2A2420']]} />
        <Lin id="am-car" x2={1} y2={0} stops={[[0, '#D8D4CC'], [0.5, '#FFFFFF'], [1, '#B8B4AC']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo della sera (calmo in alto per il titolo) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#am-sky)" />
          <Gulls t={t} seed={11} n={3} y={620} h={100} color="#2A1E2A" size={0.6} period={9} />
        </g>

        {/* PIANO 1 — palazzi con i portici e la torre dell'orologio */}
        <g transform={L(0.35)}>
          <rect x="-200" y="760" width="1480" height="330" fill="url(#am-bld)" stroke={K} strokeWidth="7" />
          <path d="M-200 760 H1280" stroke="#6A3A2A" strokeWidth="14" />
          {ARCHES.map((a, i) => (
            <g key={i}>
              <path d={`M${a.x} 1090 V990 Q${a.x + 60} 920 ${a.x + 120} 990 V1090 Z`} fill="#3A2420" stroke={K} strokeWidth="6" />
              <rect x={a.x + 30} y="800" width="60" height="80" fill={a.w > 0.4 ? '#FFD27A' : '#4A3030'} stroke={K} strokeWidth="5" opacity=".9" />
            </g>
          ))}
          <StringLights id="am-lights" t={t} from={{ x: -100, y: 900 }} to={{ x: 1180, y: 900 }} n={18} sag={60} />
          {/* torre con l'orologio */}
          <rect x="440" y="630" width="200" height="460" fill="url(#am-tower)" stroke={K} strokeWidth="8" />
          <path d="M420 630 L540 560 L660 630 Z" fill="#6A3A2A" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <g transform="translate(540 715)">
            <Glow id="am-clk" x={0} y={0} r={110} t={t} color="#FFF0C8" amp={0.04} rate={1.4} opacity={0.4 + 0.3 * run} />
            <circle r="58" fill="#F4ECDD" stroke={K} strokeWidth="7" />
            {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 -50 V-42" stroke={K} strokeWidth="5" transform={`rotate(${i * 30})`} />)}
            <path d="M0 0 V-30" stroke={K} strokeWidth="7" strokeLinecap="round" transform={`rotate(${clockMin / 12})`} />
            <path d="M0 0 V-44" stroke={run > 0.02 && run < 0.98 ? ORANGE : K} strokeWidth="5" strokeLinecap="round" transform={`rotate(${clockMin})`} />
          </g>
          <path d="M490 820 Q540 790 590 820 V880 H490 Z" fill="#3A2420" stroke={K} strokeWidth="6" />
        </g>

        {/* PIANO 2 — auto da sposi con i nastri, panchina e passeggino */}
        <g transform={L(0.6)}>
          <rect x="-200" y="1090" width="1480" height="900" fill="url(#am-pave)" />
          <g transform="translate(230 1110)">
            <path d="M0 0 V-340" stroke={K} strokeWidth="12" />
            <Glow id="am-sign" x={0} y={-300} r={170} t={t} color={ORANGE} amp={0.1} rate={3} opacity={0.6 * sign} />
            <path d="M0 -340 H130 L160 -310 L130 -280 H0 Z" fill={sign > 0.3 ? ORANGE : '#C8B8A8'} stroke={K} strokeWidth="6" strokeLinejoin="round" />
            <path d="M0 -270 H-130 L-160 -240 L-130 -210 H0 Z" fill="#C8B8A8" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          </g>
          <g transform="translate(250 1220)">
            <ellipse cx="0" cy="6" rx="230" ry="20" fill="#000" opacity=".35" />
            <path d="M-210 -20 Q-210 -70 -160 -76 L-100 -80 Q-60 -150 20 -150 Q90 -150 120 -84 L190 -76 Q220 -70 220 -20 Z" fill="url(#am-car)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d="M-80 -86 Q-50 -136 10 -138 Q70 -138 96 -86 Z" fill="#7AB0D8" stroke={K} strokeWidth="6" />
            <path d="M10 -138 V-86" stroke={K} strokeWidth="5" />
            {[-140, 140].map((x) => (
              <g key={x}>
                <circle cx={x} cy="-16" r="38" fill="#1E1A24" stroke={K} strokeWidth="7" />
                <circle cx={x} cy="-16" r="16" fill="#C8C4CC" />
              </g>
            ))}
            {/* nastri bianchi dal cofano allo specchietto */}
            <path d="M210 -60 Q150 -110 100 -90 M210 -60 Q160 -40 120 -80" stroke="#F4ECDD" strokeWidth="6" fill="none" />
            <circle cx="208" cy="-60" r="14" fill="#F4ECDD" stroke={K} strokeWidth="4" />
            {/* grande fiocco sul cofano, nastri sulle portiere, barattoli dietro */}
            <g transform="translate(150 -92)">
              <path d="M0 0 L-46 -30 L-46 30 Z M0 0 L46 -30 L46 30 Z" fill="#F4D8E0" stroke={K} strokeWidth="5" strokeLinejoin="round" />
              <circle r="12" fill="#E86A8A" stroke={K} strokeWidth="4" />
            </g>
            <path d="M-100 -60 Q0 -40 110 -66" stroke="#F4D8E0" strokeWidth="8" fill="none" />
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${-300 - i * 40 + Math.sin(t * 6 + i) * 4} ${-6 + (i % 2) * 8})`}>
                <path d={`M${i * 40 + 90} -24 L30 -4`} stroke="#C8C4CC" strokeWidth="2" />
                <rect x="14" y="-18" width="26" height="30" rx="3" fill="#B8B4BC" stroke={K} strokeWidth="4" />
              </g>
            ))}
            <path d={`M-210 -40 q-30 ${20 + Math.sin(t * 3) * 6} -60 ${30 + Math.sin(t * 3 + 1) * 8} M-210 -30 q-24 ${30 + Math.sin(t * 3 + 2) * 6} -40 ${50}`} stroke="#F4ECDD" strokeWidth="4" fill="none" />
          </g>
          {/* panchina e passeggino */}
          <g transform="translate(760 1210)">
            <path d="M-120 -40 H120 M-120 -70 H120 M-110 -40 V0 M110 -40 V0" stroke="#6A4A32" strokeWidth="14" strokeLinecap="round" />
            <path d="M-120 -40 H120" stroke={K} strokeWidth="4" />
          </g>
          <g transform="translate(900 1236)">
            <path d="M-60 -120 Q-60 -40 0 -40 H60 V-90 Q60 -130 0 -130 Z" fill="#4A7AB0" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            <path d="M-60 -120 Q-20 -170 50 -130" fill="#2F5A8A" stroke={K} strokeWidth="7" />
            <path d="M60 -90 L100 -150 H120" stroke={K} strokeWidth="7" fill="none" />
            {[-40, 40].map((x) => <circle key={x} cx={x} cy="-16" r="20" fill="#2A2630" stroke={K} strokeWidth="6" />)}
          </g>
        </g>

        {/* PIANO 3 — il motorino da solo sotto il lampione; cartello con due frecce */}
        <g transform={L(0.9)}>
          <g transform="translate(860 1300)">
            <path d="M0 0 V-560 Q0 -600 -50 -600" stroke={K} strokeWidth="14" fill="none" />
            <path d="M-80 -604 H-20 L-30 -580 H-70 Z" fill="#3A3448" stroke={K} strokeWidth="5" />
            <Glow id="am-lamp" x={-50} y={-580} r={140} t={t} color="#FFE7A0" amp={0.05} rate={2} opacity={0.8 * lamp} />
            <Beam id="am-beam" x={-50} y={-580} t={t} length={560} spread={260} angle={92} color="#FFE7A0" opacity={0.35 * lamp} />
          </g>
          <Motorino id="am-moto" x={760} y={1300} s={0.7} t={t} light={0} helmet flip />
        </g>

        {/* PIANO 4 — lastricato vicino e vasi di fiori */}
        <g transform={L(1.2)}>
          <path d="M-200 1560 H1280 V2200 H-200 Z" fill="#2A2420" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-200 + i * 180} 1560 L${-320 + i * 200} 2200`} stroke="#3A322C" strokeWidth="6" />)}
          {[60, 1020].map((x, i) => (
            <g key={i} transform={`translate(${x} 1620)`}>
              <path d="M-90 0 L-70 140 H70 L90 0 Z" fill="#8A5A3A" stroke={K} strokeWidth="8" />
              {[-50, 0, 50].map((dx, j) => <circle key={j} cx={dx} cy={-20 + Math.sin(t + j) * 3} r="30" fill={['#E0303A', '#F2A23A', '#E86A8A'][j]} stroke={K} strokeWidth="5" />)}
            </g>
          ))}
        </g>
        <g transform={L(1.6)}>
          <g opacity={rice}>
            <Confetti t={t - c1} seed={17} n={40} colors={['#FFFFFF', '#F4ECDD', '#FFF8E8']} y0={700} y1={1300} speed={0.5} />
          </g>
          <NearMotes id="am-near" t={t} color="#FFE2C0" opacity={0.07} />
        </g>
      </g>

      <Finish id="am" tint={TINT_DAY} tintOpacity={0.1} />
    </svg>
  );
};
