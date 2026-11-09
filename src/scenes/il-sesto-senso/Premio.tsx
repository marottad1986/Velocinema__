import React from 'react';
import { camera, eio, eo, lerp, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes, Stars, flashAt } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { K, Ombra, SestoDefs } from './Comuni';

// Lo sparo dopo il premio: la camera da letto dei Crowe di notte, dopo la festa. Sul letto la targa del premio
// (cornice dorata con il sigillo), sul comodino la bottiglia di vino e due bicchieri; a sinistra la porta del bagno,
// a destra la finestra con un vetro rotto, i cocci a terra e la tenda che si gonfia; fuori i tetti di Filadelfia.
// Eventi: 1ª frase un riflesso passa sulla targa del premio; 2ª frase nel bagno si accende una luce fredda che
// trema e la porta si socchiude (Vincent era lì); 3ª frase, sull'ultima parola, un solo lampo (lo sparo, mai mostrato)
// e il bicchiere di Malcolm si rovescia: il vino rosso cola sul comodino. Nessuna persona.
// Piani: parete, finestra e città (0,25) · porta del bagno (0,45) · letto con la targa (0,65)
//        · comodino con vino e bicchieri (0,85) · cocci, tenda e colonna del letto in primo piano (1,2) · pulviscolo (1,5–1,8)

export const Premio: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const gleam = seg(t, griglia(cues[0] + 0.6), griglia(cues[0] + 0.6) + 1.4);
  const bath = eo(seg(t, griglia(cues[1] + 0.3), griglia(cues[1] + 0.3) + 0.8));
  const bathFlick = bath * (0.8 + 0.2 * Math.sin(t * 31) * Math.sin(t * 7));
  const shot = griglia(cues[2] + 1.9);
  const flash = flashAt(t, [shot], [1]);
  const tip = eio(seg(t, shot + 0.05, shot + 0.45));
  const spill = eo(seg(t, shot + 0.35, shot + 2.2));
  const after = seg(t, shot, shot + 0.2); // dopo lo sparo la stanza si raffredda
  const sway = Math.sin(t * 1.3) * 18 + Math.sin(t * 2.9) * 8;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pr" />
        <SestoDefs id="pr" />
        <Lin id="pr-wall" stops={[[0, '#0A0E14'], [0.4, '#1A2430'], [0.7, '#24303C'], [1, '#141A22']]} />
        <Lin id="pr-sky" stops={[[0, '#0A1424'], [0.6, '#1E2E48'], [1, '#3A4A64']]} />
        <Lin id="pr-floor" stops={[[0, '#3A2A1E'], [0.5, '#22180F'], [1, '#080504']]} />
        <Lin id="pr-sheet" stops={[[0, '#E4E6E6'], [0.6, '#B8BEC4'], [1, '#7A8490']]} />
        <Lin id="pr-head" x2={1} y2={0} stops={[[0, '#2A1A10'], [0.45, '#6A462C'], [1, '#22140A']]} />
        <Lin id="pr-bottle" x2={1} y2={0} stops={[[0, '#0E1A12'], [0.35, '#3A5A44'], [0.55, '#1A2A20'], [1, '#081008']]} />
        <Lin id="pr-doorD" x2={1} y2={0} stops={[[0, '#6A7884'], [0.5, '#3E4852'], [1, '#222A32']]} />
        <Lin id="pr-curt" x2={1} y2={0} stops={[[0, '#2A3440'], [0.4, '#5A6A7A'], [0.7, '#3A4654'], [1, '#1A222C']]} />
        <linearGradient id="pr-bathlight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#CDE8FF" stopOpacity=".8" />
          <stop offset=".6" stopColor="#CDE8FF" stopOpacity=".2" />
          <stop offset="1" stopColor="#CDE8FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="pr-gleam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset=".5" stopColor="#FFFFFF" stopOpacity=".85" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete con la carta a righe, la finestra con il vetro rotto e i tetti di Filadelfia (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#pr-wall)" />
          {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${-160 + i * 96} 640 V1100`} stroke="#2E3C4A" strokeWidth="16" opacity=".3" />)}
          <path d="M-200 1100 H1280" stroke="#3A2A1E" strokeWidth="22" />
          <g>
            <rect x="660" y="620" width="300" height="400" fill="url(#pr-sky)" stroke={K} strokeWidth="9" />
            <Stars t={t} seed={5} n={12} x={670} y={630} w={280} h={160} color="#DDE8F4" size={0.8} />
            {/* tetti e comignoli lontani con qualche finestra accesa */}
            <path d="M660 900 V840 H720 V800 H780 V860 H840 V820 L880 790 L920 820 V870 H960 V1020 H660 Z" fill="#0C121C" />
            {[[690, 860], [740, 830], [800, 880], [900, 850], [930, 900]].map(([x, y], i) => (
              <rect key={i} x={x} y={y} width="12" height="16" fill="#FFD890" opacity={0.6 + 0.3 * Math.sin(t * 2 + i)} />
            ))}
            {/* telaio a ghigliottina; il vetro in basso a destra è rotto */}
            <path d="M810 620 V1020 M660 820 H960" stroke="#6A7480" strokeWidth="10" />
            <rect x="660" y="620" width="300" height="400" fill="url(#pr-glass)" />
            <path d="M960 830 L900 870 L930 930 L880 960 L900 1020 H960 Z" fill="#05080C" opacity=".9" />
            <path d="M960 830 L900 870 L930 930 L880 960 L900 1020" stroke="#C8DCEC" strokeWidth="4" fill="none" />
            <path d="M900 870 L870 860 M930 930 L960 920 M880 960 L850 980" stroke="#C8DCEC" strokeWidth="3" />
            <rect x="660" y="620" width="300" height="400" fill="none" stroke={K} strokeWidth="9" />
            <rect x="640" y="1016" width="340" height="20" fill="#5A6470" stroke={K} strokeWidth="5" />
          </g>
          <Glow id="pr-moon" x={810} y={760} r={300} t={t} color="#9AB8DC" amp={0.03} rate={0.8} opacity={0.35} />
        </g>

        {/* PIANO 1 — porta del bagno socchiusa a sinistra, con la luce fredda (0,45) */}
        <g transform={L(0.45, -50, 50)}>
          <rect x="80" y="600" width="300" height="560" fill="#05070A" stroke={K} strokeWidth="8" />
          <rect x="80" y="600" width="300" height="560" fill="#BFE0FF" opacity={0.75 * bathFlick} />
          {/* piastrelle del bagno nella luce */}
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M80 ${640 + i * 70} H${380}`} stroke="#6A8AA8" strokeWidth="3" opacity={0.6 * bath} />)}
          <path d={`M80 1160 L${380 + 260 * bath} 1300 L-60 1300 Z`} fill="url(#pr-bathlight)" opacity={bathFlick} />
          <Glow id="pr-bath" x={220} y={880} r={360} t={t} color="#BFE0FF" amp={0.1} rate={9} opacity={0.5 * bathFlick} />
          {/* il battente: ruota verso l'interno e lascia una fessura sempre più larga */}
          <g transform={`translate(380 600) scale(${lerp(0.82, 0.55, bath)} 1) translate(-300 0)`}>
            <rect x="0" y="0" width="300" height="560" fill="url(#pr-doorD)" stroke={K} strokeWidth="8" />
            {[[26, 30, 108, 220], [166, 30, 108, 220], [26, 290, 108, 240], [166, 290, 108, 240]].map(([x, y, w, h], i) => (
              <rect key={i} x={x} y={y} width={w} height={h} fill="#000" opacity=".12" stroke="#4A5050" strokeWidth="5" />
            ))}
            <circle cx="40" cy="300" r="14" fill="url(#pr-brass)" stroke={K} strokeWidth="4" />
          </g>
          <rect x="62" y="584" width="336" height="18" fill="#3A281C" stroke={K} strokeWidth="5" />
        </g>

        {/* PIANO 2 — il letto con la targa del premio (0,65) */}
        <g transform={L(0.65)}>
          <path d="M-200 1160 H1280 V2200 H-200 Z" fill="url(#pr-floor)" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-200 + i * 140} 1160 L${-400 + i * 190} 2200`} stroke="#000" strokeWidth="4" opacity=".3" />)}
          <g transform="translate(650 1190) scale(.84) translate(-470 -1160)">
          <Ombra id="pr" x={470} y={1320} rx={440} ry={40} />
          {/* testiera */}
          <path d="M150 1010 V860 Q470 780 790 860 V1010 Z" fill="url(#pr-head)" stroke={K} strokeWidth="9" />
          <path d="M190 990 V880 Q470 816 750 880 V990" fill="none" stroke="#1A0E06" strokeWidth="6" />
          <path d="M160 862 Q470 786 780 862" stroke="#B88A5A" strokeWidth="4" fill="none" opacity=".55" />
          {/* materasso, coperta e cuscini */}
          <path d="M120 1010 H820 L880 1240 Q470 1290 60 1240 Z" fill="url(#pr-sheet)" stroke={K} strokeWidth="9" />
          <path d="M100 1120 Q470 1160 850 1120" stroke="#8A94A0" strokeWidth="5" fill="none" />
          <path d="M70 1236 Q470 1284 870 1236 L880 1300 Q470 1350 60 1300 Z" fill="#5A6878" stroke={K} strokeWidth="7" />
          {[[260, 990], [640, 990]].map(([x, y], i) => (
            <g key={i}>
              <path d={`M${x - 120} ${y} Q${x - 130} ${y - 70} ${x - 80} ${y - 74} H${x + 80} Q${x + 130} ${y - 70} ${x + 120} ${y} Q${x} ${y + 18} ${x - 120} ${y} Z`} fill="#EEF0F0" stroke={K} strokeWidth="7" />
              <path d={`M${x - 90} ${y - 50} Q${x} ${y - 64} ${x + 90} ${y - 50}`} stroke="#FFFFFF" strokeWidth="5" fill="none" opacity=".7" />
            </g>
          ))}
          {/* la targa del premio: cornice dorata, pergamena con le righe e il sigillo */}
          <g transform="translate(470 1110) rotate(-6)">
            <Ombra id="pr" x={6} y={86} rx={190} ry={22} />
            <rect x="-170" y="-110" width="340" height="200" rx="6" fill="url(#pr-gold)" stroke={K} strokeWidth="8" />
            <rect x="-146" y="-88" width="292" height="156" fill="url(#pr-paper)" stroke={K} strokeWidth="4" />
            <path d="M-110 -56 H110" stroke="#3A3020" strokeWidth="8" strokeLinecap="round" />
            {[-26, -4, 18].map((y, i) => <path key={i} d={`M${-118 + i * 8} ${y} H${118 - i * 14}`} stroke="#6A604C" strokeWidth="4" strokeLinecap="round" />)}
            <circle cx="88" cy="44" r="22" fill="#B8862A" stroke={K} strokeWidth="4" />
            <path d="M76 62 L70 92 L84 82 L90 94 L96 64" fill="#8A2A22" stroke={K} strokeWidth="3" />
            <circle cx="88" cy="44" r="12" fill="none" stroke="#FFE8A8" strokeWidth="3" />
            <path d="M-120 44 Q-90 30 -60 46" stroke="#2A2418" strokeWidth="3" fill="none" />
            {/* riflesso che passa sul vetro */}
            <clipPath id="pr-clip"><rect x="-146" y="-88" width="292" height="156" /></clipPath>
            <g clipPath="url(#pr-clip)">
              <rect x={lerp(-360, 260, gleam)} y="-100" width="90" height="190" fill="url(#pr-gleam)" transform="skewX(-20)" opacity={Math.sin(Math.PI * gleam)} />
            </g>
            <rect x="-146" y="-88" width="292" height="156" fill="url(#pr-glass)" />
          </g>
          <Glow id="pr-award" x={470} y={1100} r={260} t={t} color="#FFE2A0" amp={0.05} rate={2} opacity={0.18 + 0.4 * Math.sin(Math.PI * gleam)} />
          </g>
        </g>

        {/* PIANO 3 — comodino con la bottiglia e i due bicchieri (0,85) */}
        <g transform={L(0.85, -580, 60)}>
          <Ombra id="pr" x={900} y={1420} rx={170} ry={22} />
          <path d="M760 1150 H1040 V1410 H760 Z" fill="url(#pr-wood)" stroke={K} strokeWidth="9" />
          <rect x="744" y="1130" width="312" height="28" fill="#5A3E2A" stroke={K} strokeWidth="7" />
          <path d="M752 1136 H1048" stroke="#C89A6A" strokeWidth="4" opacity=".6" />
          <rect x="790" y="1190" width="220" height="80" fill="none" stroke="#24160C" strokeWidth="6" />
          <circle cx="900" cy="1230" r="9" fill="url(#pr-brass)" stroke={K} strokeWidth="3" />
          {/* bottiglia */}
          <g transform="translate(1010 1130)">
            <path d="M-34 0 V-150 Q-34 -186 -12 -200 V-260 H12 V-200 Q34 -186 34 -150 V0 Z" fill="url(#pr-bottle)" stroke={K} strokeWidth="7" />
            <rect x="-14" y="-276" width="28" height="22" fill="#6A1A16" stroke={K} strokeWidth="4" />
            <rect x="-30" y="-120" width="60" height="70" fill="#E8DCC0" stroke={K} strokeWidth="4" />
            <path d="M-18 -100 H18 M-14 -84 H14" stroke="#5A4A30" strokeWidth="4" />
            <path d="M-22 -160 V-20" stroke="#FFFFFF" strokeWidth="5" opacity=".35" strokeLinecap="round" />
          </g>
          {/* bicchiere di Anna, in piedi */}
          <g transform="translate(770 1130)">
            <path d="M-24 0 H24 M0 0 V-50" stroke={K} strokeWidth="7" />
            <path d="M-30 -50 Q-34 -120 -26 -130 H26 Q34 -120 30 -50 Q0 -36 -30 -50 Z" fill="url(#pr-glass)" stroke={K} strokeWidth="6" />
            <path d="M-31 -80 Q0 -70 31 -80 Q30 -54 0 -46 Q-30 -54 -31 -80 Z" fill="#8A1A1E" />
          </g>
          {/* bicchiere di Malcolm: si rovescia allo sparo */}
          <g transform={`translate(860 1130) rotate(${82 * tip} 24 0)`}>
            <path d="M-24 0 H24 M0 0 V-50" stroke={K} strokeWidth="7" />
            <path d="M-30 -50 Q-34 -120 -26 -130 H26 Q34 -120 30 -50 Q0 -36 -30 -50 Z" fill="url(#pr-glass)" stroke={K} strokeWidth="6" />
            <path d="M-31 -80 Q0 -70 31 -80 Q30 -54 0 -46 Q-30 -54 -31 -80 Z" fill="#8A1A1E" opacity={1 - spill} />
          </g>
          {/* il vino che si allarga e cola dal bordo */}
          <ellipse cx={985 + 20 * spill} cy="1138" rx={70 * spill} ry={10 * spill} fill="#7A1418" opacity={spill > 0 ? 0.95 : 0} />
          <path d={`M1046 1150 Q1048 ${1160 + 80 * spill} 1042 ${1170 + 110 * spill}`} stroke="#7A1418" strokeWidth={10 * Math.min(1, spill * 3)} fill="none" strokeLinecap="round" opacity={spill > 0 ? 1 : 0} />
          <circle cx="1042" cy={1190 + 260 * seg(t, shot + 1.2, shot + 1.8)} r="7" fill="#7A1418" opacity={seg(t, shot + 1.2, shot + 1.25) * (1 - seg(t, shot + 1.75, shot + 1.8))} />
        </g>

        {/* PIANO 4 — tenda che si gonfia, cocci di vetro a terra e colonna del letto in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <path d={`M1000 560 H1180 V1500 Q${1080 + sway} 1520 ${1000 + sway * 1.6} 1480 Q${960 + sway} 1100 1000 560 Z`} fill="url(#pr-curt)" stroke={K} strokeWidth="9" />
          {[1040, 1090, 1130].map((x, i) => <path key={i} d={`M${x} 580 Q${x - 20 + sway * 0.6} 1000 ${x + sway * (1.2 - i * 0.2)} 1470`} stroke="#141A22" strokeWidth="6" fill="none" opacity=".7" />)}
          {[[640, 1560, 20], [700, 1600, -30], [600, 1640, 50], [760, 1660, 10], [540, 1600, -60], [820, 1720, 35]].map(([x, y, r], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
              <path d="M-22 6 L-4 -16 L26 0 L4 12 Z" fill="#A8C4DC" stroke={K} strokeWidth="4" opacity=".9" />
              <path d="M-8 -6 L12 -2" stroke="#FFFFFF" strokeWidth="3" opacity={0.4 + 0.5 * Math.max(0, Math.sin(t * 2.2 + i * 1.7))} />
            </g>
          ))}
          <Ombra id="pr" x={60} y={1900} rx={120} ry={18} />
          <rect x="-20" y="1150" width="70" height="760" fill="url(#pr-head)" stroke={K} strokeWidth="9" />
          <ellipse cx="15" cy="1140" rx="52" ry="30" fill="#6A462C" stroke={K} strokeWidth="8" />
          <circle cx="15" cy="1090" r="34" fill="url(#pr-head)" stroke={K} strokeWidth="8" />
          <path d="M-4 1166 V1880" stroke="#B88A5A" strokeWidth="5" opacity=".5" />
        </g>

        {/* PIANO 5 — pulviscolo nella luce della luna e particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 820, x0: 640, x1: 960 }} bottom={{ y: 1500, x0: 380, x1: 960 }} seed={3} n={22} color="#D8E6F4" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="pr-near" t={t} color="#C8D8E8" n={6} opacity={0.08} />
        </g>
      </g>
      <rect width="1080" height="1920" fill="#F4F8FF" opacity={flash * 0.85} />
      <rect width="1080" height="1920" fill="#0A1A30" opacity={0.18 * after} />
      <Finish id="pr" tint="#22303E" tintOpacity={0.13} />
    </svg>
  );
};
