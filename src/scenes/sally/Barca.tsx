import React from 'react';
import { camera, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Clouds, Glow, Moon, NearMotes, Notes, Reflection, Stars, StringLights, WaveLines } from '../../lib/elements';
import { HAND } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { AMBER, CREAM, K, RED, TINT_NIGHT } from './Comune';

// Scritta d'un fiato in vacanza: il porto di Saint-Tropez di notte. Case colorate e campanile sul lungomare, un locale
// con le lucine e la musica, barche ormeggiate che dondolano; in primo piano il ponte di una barca con un tavolino,
// una lampada a olio, un foglio, una penna e un bicchiere; la luna dietro le nuvole.
// Piani: cielo, luna, nuvole (0,2) · lungomare con case, campanile e locale (0,35) · acqua e barche ormeggiate (0,5)
//        · ponte della barca con il tavolino (1,0) · cime, parapetto e bitta che incorniciano (1,3) · particelle (1,7)
// Eventi: cues[1] «sta su una barca»: la lampada a olio si accende · cues[2] «un locale pieno di donne bellissime»:
//         le lucine del locale si accendono, escono le note, i riflessi colorati sull'acqua
//         · cues[3] «la scrive tutta d'un fiato»: il locale si spegne, la luna esce dalle nuvole, sul foglio si scrive
//           «Sally» e le righe si riempiono di corsa.

const r = rng(1996);
const HOUSES = [
  { x: 470, w: 96, h: 150, c: '#D8A060' }, { x: 566, w: 80, h: 120, c: '#C87A6A' }, { x: 646, w: 110, h: 170, c: '#E0C080' },
  { x: 756, w: 84, h: 130, c: '#B8806A' }, { x: 840, w: 100, h: 160, c: '#D89A7A' }, { x: 940, w: 90, h: 120, c: '#E8C890' },
  { x: 1030, w: 110, h: 150, c: '#C88A5A' }, { x: 1140, w: 100, h: 130, c: '#D8A878' },
];
const WIN = HOUSES.flatMap((h, i) => Array.from({ length: 4 }, (_, k) => ({ x: h.x + 14 + (k % 2) * (h.w / 2), y: 1000 - h.h + 26 + Math.floor(k / 2) * 46, on: r() > 0.35, ph: r() * 6, i })));
const BOATS = [{ x: 150, s: 0.9, m: 300 }, { x: 330, s: 0.75, m: 250 }, { x: 760, s: 0.85, m: 290 }, { x: 960, s: 0.7, m: 230 }];
const LINES = Array.from({ length: 6 }, (_, i) => ({ y: 1122 + i * 19, w: 180 - (i % 3) * 30, d: 0.12 + i * 0.13 }));

export const Barca: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c1 = griglia(cues[1] ?? 3), c2 = griglia(cues[2] ?? 6.5), c3 = griglia(cues[3] ?? 10.1);
  const lamp = eo(seg(t, c1, c1 + 0.6));
  const club = eo(seg(t, c2, c2 + 0.5)) * (1 - 0.75 * eo(seg(t, c3, c3 + 1.2)));
  const moon = eo(seg(t, c3, c3 + 2));
  const write = seg(t, c3 + 0.2, c3 + 1.1);
  const bob = (ph: number) => Math.sin(t * 1.1 + ph) * 4;
  const flick = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 3.7);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sb" />
        <Lin id="sb-sky" stops={[[0, '#070A18'], [0.35, '#121A38'], [0.6, '#22305A'], [1, '#3A4070']]} />
        <Lin id="sb-sea" stops={[[0, '#2A3460'], [0.4, '#18204A'], [1, '#0A0E22']]} />
        <Lin id="sb-deck" stops={[[0, '#8A5A34'], [0.5, '#6A4226'], [1, '#3A2414']]} />
        <Lin id="sb-table" x2={1} y2={0} stops={[[0, '#5A3A22'], [0.5, '#8A5E3A'], [1, '#4A2E1A']]} />
        <Lin id="sb-paper" stops={[[0, CREAM], [1, '#DCCCB0']]} />
        <Lin id="sb-tower" x2={1} y2={0} stops={[[0, '#E8B878'], [0.6, '#C8884A'], [1, '#8A5A30']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo notturno (calmo dietro il titolo), stelle, luna che esce dalle nuvole */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1300" fill="url(#sb-sky)" />
          <Stars t={t} seed={11} n={38} x={-100} y={-100} w={1280} h={820} color="#E8ECF8" size={0.8} />
          <Moon id="sb-moon" x={820} y={720} r={56} t={t} color="#F3EEDC" halo="#C8D0F0" />
          <g opacity={1 - 0.8 * moon}>
            <path d={`M${660 + moon * 120} 700 q40 -50 100 -30 q30 -50 90 -20 q60 -10 70 40 q40 10 20 50 H${650 + moon * 120} q-30 -20 -10 -40 Z`} fill="#2A3058" />
            <path d={`M${700 + moon * 120} 762 q60 -30 120 -8 q40 -20 80 6`} fill="none" stroke="#4A5288" strokeWidth="6" strokeLinecap="round" />
          </g>
          <Clouds id="sb-cl" t={t} color="#1E2650" seed={5} n={3} y={640} h={120} speed={0.25} opacity={0.6} />
        </g>

        {/* PIANO 1 — lungomare: il locale con le lucine a sinistra, case colorate e campanile */}
        <g transform={L(0.35)}>
          <path d="M-200 960 Q200 900 600 930 Q900 950 1280 900 V1010 H-200 Z" fill="#141A34" />
          {/* campanile con la cupola a cipolla */}
          <rect x="580" y="760" width="64" height="200" fill="url(#sb-tower)" stroke={K} strokeWidth="6" />
          <path d="M572 760 H652 M580 800 H644" stroke={K} strokeWidth="5" />
          <rect x="598" y="810" width="28" height="40" rx="14" fill="#2A1A10" />
          <circle cx="612" cy="880" r="16" fill="#F3E9DC" stroke={K} strokeWidth="4" />
          <path d="M612 880 V870 M612 880 l7 4" stroke={K} strokeWidth="3" />
          <path d="M584 760 Q584 720 612 700 Q640 720 640 760 Z" fill="#B85A3A" stroke={K} strokeWidth="6" />
          <path d="M612 700 V676" stroke={K} strokeWidth="5" />
          {HOUSES.map((h, i) => (
            <g key={i}>
              <rect x={h.x} y={1000 - h.h} width={h.w} height={h.h} fill={h.c} stroke={K} strokeWidth="5" />
              <path d={`M${h.x - 6} ${1000 - h.h} H${h.x + h.w + 6}`} stroke="#7A3A26" strokeWidth="10" />
              <rect x={h.x + h.w * 0.62} y={1000 - h.h} width={h.w * 0.38} height={h.h} fill="#000" opacity=".22" />
            </g>
          ))}
          {WIN.map((w, i) => (
            <rect key={i} x={w.x} y={w.y} width="16" height="26" fill={w.on ? '#FFD890' : '#3A2A30'} stroke={K} strokeWidth="2.5"
              opacity={w.on ? 0.75 + 0.25 * Math.sin(t * 0.8 + w.ph) : 1} />
          ))}
          {/* il locale: tettoia a strisce, porta illuminata, lucine */}
          <rect x="40" y="860" width="400" height="140" fill="#3A2440" stroke={K} strokeWidth="6" />
          <path d="M20 860 L60 820 H420 L460 860 Z" fill="#E8DCC8" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${66 + i * 36} 822 L${44 + i * 40} 858 H${64 + i * 40} L${84 + i * 36} 822 Z`} fill={RED} opacity=".8" />)}
          <Glow id="sb-club" x={240} y={930} r={lerp(120, 300, club)} t={t} color="#FF8AC8" amp={0.12} rate={6} opacity={0.15 + 0.55 * club} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={70 + i * 94} y="884" width="62" height="70" rx="4"
              fill={club > 0.2 ? ['#FF7AB0', '#FFD25C', '#7FD1F0', '#C890FF'][(i + Math.floor(t * 2.4)) % 4] : '#2A1A30'} stroke={K} strokeWidth="4" opacity={0.4 + 0.6 * club} />
          ))}
          <StringLights id="sb-lights" t={t} from={{ x: 20, y: 862 }} to={{ x: 460, y: 862 }} n={14} sag={22} r={7} colors={club > 0.1 ? undefined : ['#3A3040']} />
          <g opacity={club}>
            <Notes t={t - c2} x={240} y={840} n={5} spread={300} rise={150} color="#FFB8D8" outline={K} size={0.6} speed={0.3} />
          </g>
        </g>

        {/* PIANO 2 — acqua del porto con i riflessi e le barche ormeggiate */}
        <g transform={L(0.5)}>
          <rect x="-200" y="1000" width="1480" height="500" fill="url(#sb-sea)" />
          <Reflection t={t} x={240} y={1012} color={club > 0.2 ? '#FF9AD0' : '#6A5A8A'} n={8} w={160} gap={20} opacity={0.25 + 0.4 * club} />
          <Reflection t={t + 2} x={760} y={1012} color="#FFD890" n={7} w={110} gap={22} opacity={0.45} />
          <Reflection t={t + 4} x={moon > 0 ? 820 : 820} y={1060} color="#E8ECF8" n={6} w={70} gap={24} opacity={0.15 + 0.4 * moon} />
          <WaveLines t={t} ys={[1030, 1070, 1120, 1170]} color="#6A78B8" amp={5} w={120} speed={0.5} opacity={0.35} />
          {BOATS.map((b, i) => (
            <g key={i} transform={`translate(${b.x} ${1040 + bob(i * 1.7)}) rotate(${Math.sin(t * 0.9 + i) * 2}) scale(${b.s})`}>
              <path d={`M0 ${-b.m} V-20`} stroke="#0E1226" strokeWidth="7" />
              <path d={`M0 ${-b.m + 20} L-${b.m * 0.35} -30 M0 ${-b.m + 20} L${b.m * 0.3} -30`} stroke="#0E1226" strokeWidth="2.5" opacity=".7" />
              <circle cx="0" cy={-b.m} r="5" fill={i % 2 ? '#FF6A6A' : '#7AF07A'} opacity={0.6 + 0.4 * Math.sin(t * 2 + i)} />
              <path d="M-110 -26 H120 L90 12 H-90 Z" fill="#E8E4DA" stroke={K} strokeWidth="6" strokeLinejoin="round" />
              <path d="M-100 -12 H110" stroke="#3A4A8A" strokeWidth="6" />
              <rect x="-40" y="-52" width="70" height="26" rx="6" fill="#C8C0B0" stroke={K} strokeWidth="5" />
              <path d="M-90 16 H90" stroke="#E8ECF8" strokeWidth="3" opacity=".25" />
            </g>
          ))}
        </g>

        {/* PIANO 3 — il ponte della barca con il tavolino: lampada a olio, foglio, penna, bicchiere */}
        <g transform={L(1.0)}>
          <g transform={`translate(0 ${bob(0.4) * 0.6}) rotate(${Math.sin(t * 0.9) * 0.6} 540 1300)`}>
            {/* parapetto con candelieri e cavo */}
            {[-60, 240, 540, 840, 1140].map((x) => (
              <g key={x}>
                <path d={`M${x} 1200 V1060`} stroke="#C8C8D4" strokeWidth="10" strokeLinecap="round" />
                <path d={`M${x} 1200 V1060`} stroke={K} strokeWidth="2" opacity=".4" />
              </g>
            ))}
            <path d="M-200 1072 Q300 1090 1280 1072 M-200 1122 Q300 1140 1280 1122" fill="none" stroke="#B8B8C8" strokeWidth="4" />
            <path d="M-200 1190 Q540 1160 1280 1190 V2200 H-200 Z" fill="url(#sb-deck)" stroke={K} strokeWidth="9" />
            <g stroke="#2A180C" strokeWidth="5" opacity=".7">
              {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${540 + (i - 7) * 70} 1178 L${540 + (i - 7) * 210} 2000`} />)}
            </g>
            <path d="M-200 1196 Q540 1166 1280 1196" fill="none" stroke="#C88A5A" strokeWidth="4" opacity=".6" />
            {/* tavolino */}
            <path d="M540 1260 V1460 M480 1460 H600" stroke="#2A180C" strokeWidth="18" strokeLinecap="round" />
            <ellipse cx="540" cy="1262" rx="330" ry="58" fill="#2A180C" />
            <ellipse cx="540" cy="1238" rx="330" ry="58" fill="url(#sb-table)" stroke={K} strokeWidth="8" />
            <path d="M240 1222 Q540 1186 840 1222" fill="none" stroke="#C89A6A" strokeWidth="4" opacity=".6" />
            {/* foglio */}
            <g transform="rotate(-4 560 1180)">
              <path d="M440 1088 L690 1084 L716 1232 L420 1238 Z" fill="url(#sb-paper)" stroke={K} strokeWidth="6" strokeLinejoin="round" />
              <clipPath id="sb-title"><rect x="440" y="1080" width={160 * seg(write, 0, 0.35)} height="50" /></clipPath>
              <text x="456" y="1122" fontFamily={HAND} fontSize="42" fill={RED} clipPath="url(#sb-title)">Sally</text>
              {LINES.map((l, i) => {
                const p = seg(write, l.d + 0.2, l.d + 0.45);
                return (
                  <path key={i} d={`M${452 - i * 3} ${l.y + 22} q12 -8 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0`}
                    fill="none" stroke="#2A3050" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${l.w * p} 400`} />
                );
              })}
            </g>
            {/* penna che corre */}
            <g transform={`translate(${write > 0 && write < 1 ? lerp(460, 640, mod(write * 4.6, 1)) : 680} ${write > 0 && write < 1 ? 1130 + write * 110 : 1214}) rotate(-38)`}>
              <rect x="-6" y="-110" width="13" height="108" rx="5" fill="#1E2A4A" stroke={K} strokeWidth="4" />
              <path d="M-6 -2 L0 12 L7 -2 Z" fill="#C8C8D0" stroke={K} strokeWidth="3" />
            </g>
            {/* lampada a olio */}
            <g transform="translate(300 1220)">
              <Glow id="sb-lamp" x={0} y={-90} r={lerp(60, 380, lamp)} t={t} color="#FFD08A" amp={0.06} rate={7} opacity={(0.25 + 0.75 * lamp) * flick} />
              <ellipse cx="0" cy="6" rx="62" ry="14" fill="#000" opacity=".3" />
              <path d="M-44 0 Q-50 -36 -26 -46 H26 Q50 -36 44 0 Z" fill={AMBER} stroke={K} strokeWidth="7" strokeLinejoin="round" />
              <path d="M-34 -46 Q-44 -100 -20 -150 H20 Q44 -100 34 -46 Z" fill="#FFF0C8" opacity={0.25 + 0.5 * lamp} stroke={K} strokeWidth="6" />
              <path d={`M0 -60 q${-8 + Math.sin(t * 11) * 3} -24 0 -${28 + 10 * lamp} q${8 + Math.sin(t * 7) * 3} 20 0 ${28 + 10 * lamp}`} fill="#FFB84A" opacity={0.2 + 0.8 * lamp} />
              <path d="M-26 -150 H26 L18 -170 H-18 Z" fill="#6A5030" stroke={K} strokeWidth="6" strokeLinejoin="round" />
              <path d="M0 -170 Q-30 -200 0 -214 Q30 -200 0 -170" fill="none" stroke={K} strokeWidth="6" />
              <path d="M-24 -130 Q-30 -90 -24 -56" fill="none" stroke="#FFFFFF" strokeWidth="5" opacity=".5" strokeLinecap="round" />
            </g>
            {/* bicchiere */}
            <g transform="translate(790 1222)">
              <ellipse cx="0" cy="4" rx="40" ry="10" fill="#000" opacity=".3" />
              <path d="M-30 -110 H30 L22 0 H-22 Z" fill="#C8D8F0" opacity=".35" stroke={K} strokeWidth="6" strokeLinejoin="round" />
              <path d="M-27 -60 H27 L22 0 H-22 Z" fill="#E8C878" opacity=".55" />
              <path d="M-20 -100 V-20" stroke="#FFFFFF" strokeWidth="5" opacity=".6" strokeLinecap="round" />
              <ellipse cx="0" cy="-110" rx="30" ry="7" fill="none" stroke={K} strokeWidth="4" />
            </g>
          </g>
        </g>

        {/* PIANO 4 — cima avvolta e bitta che incorniciano, falene intorno alla lampada */}
        <g transform={L(1.3)}>
          <g transform="translate(120 1660)">
            {[0, 1, 2, 3].map((i) => <ellipse key={i} cx="0" cy={-i * 18} rx={150 - i * 18} ry={44 - i * 4} fill="none" stroke="#C8B48A" strokeWidth="22" />)}
            {[0, 1, 2, 3].map((i) => <ellipse key={`k${i}`} cx="0" cy={-i * 18} rx={150 - i * 18} ry={44 - i * 4} fill="none" stroke={K} strokeWidth="4" strokeDasharray="10 14" />)}
            <path d="M120 -40 Q300 -120 420 -60" fill="none" stroke="#C8B48A" strokeWidth="20" strokeLinecap="round" />
          </g>
          <g transform="translate(1000 1620)">
            <rect x="-50" y="-90" width="100" height="120" rx="14" fill="#9A9AA8" stroke={K} strokeWidth="9" />
            <rect x="-90" y="-110" width="180" height="34" rx="14" fill="#B8B8C4" stroke={K} strokeWidth="8" />
            <path d="M-80 -104 H70" stroke="#FFFFFF" strokeWidth="4" opacity=".5" />
          </g>
          <path d="M1280 1420 Q1060 1500 960 1530" fill="none" stroke="#C8B48A" strokeWidth="20" strokeLinecap="round" />
          {Array.from({ length: 5 }, (_, i) => (
            <circle key={i} cx={300 + Math.sin(t * (2 + i * 0.4) + i) * (40 + i * 10)} cy={1060 + Math.cos(t * (2.5 + i * 0.3) + i * 2) * (30 + i * 6)} r="3.5" fill="#FFF0C8" opacity={0.7 * lamp} />
          ))}
        </g>
        <g transform={L(1.7)}>
          <NearMotes id="sb-near" t={t} color="#C8D4F8" opacity={0.08} />
        </g>
      </g>

      <Finish id="sb" tint={TINT_NIGHT} tintOpacity={0.12} />
    </svg>
  );
};
