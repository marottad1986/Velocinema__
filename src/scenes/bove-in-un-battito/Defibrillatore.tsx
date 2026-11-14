import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { GIALLO, HeartLine, K, VIOLA, heartPath } from './Comuni';

// Un apparecchio per il cuore: una camera d'ospedale di giorno. Dalla finestra i tetti di Firenze; accanto al letto il
// monitor con la linea del battito regolare (l'accento giallo); sul comodino, in una scatolina aperta su un panno, il
// piccolo defibrillatore sottocutaneo (placchetta metallica con il filo). f1 «…un piccolo defibrillatore»: la scatolina
// si illumina. f2 «…tre giorni dopo torna a casa»: sul letto rifatto compare la borsa pronta con la sciarpa viola, la
// porta si apre su un corridoio luminoso. Nessuna persona.
// Piani: finestra e città (0,25) · parete e porta (0,5) · letto e monitor (0,7) · comodino (0,95) · tenda in primo piano (1,2) · pulviscolo (1,5)

export const Defibrillatore: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1050);
  const L = cam.layer;
  const tDev = griglia(cues[0] + 3.2);
  const dev = eo(seg(t, tDev, tDev + 0.5));
  const tHome = griglia(cues[1] + 2.6);
  const home = eo(seg(t, tHome, tHome + 0.7));
  const bag = eob(seg(t, tHome, tHome + 0.6), 1.6);
  // linea del battito che scorre sul monitor (un battito al secondo circa)
  const scroll = (t * 160) % 200;
  const beats = Array.from({ length: 4 }, (_, i) => 760 + i * 200 - scroll).filter((x) => x > 690 && x < 1010);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="de" />
        <Lin id="de-sky" stops={[[0, '#9AC8E8'], [0.6, '#D8E8F0'], [1, '#F2E8D8']]} />
        <linearGradient id="de-wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#D8DCD4" /><stop offset=".55" stopColor="#C4CAC2" /><stop offset="1" stopColor="#9AA29A" /></linearGradient>
        <Lin id="de-floor" stops={[[0, '#A8B0A8'], [1, '#6A726C']]} />
        <linearGradient id="de-sheet" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F6F8F6" /><stop offset="1" stopColor="#C8D0CC" /></linearGradient>
        <linearGradient id="de-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F2F4F8" /><stop offset=".5" stopColor="#A8B0BC" /><stop offset="1" stopColor="#6A7280" /></linearGradient>
        <clipPath id="de-win"><rect x="110" y="640" width="420" height="380" /></clipPath>
        <clipPath id="de-mon"><rect x="690" y="700" width="320" height="170" rx="8" /></clipPath>
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — dalla finestra: cielo del mattino e tetti di Firenze con la cupola (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#de-wall)" />
          <g transform="translate(0 70)"><g clipPath="url(#de-win)">
            <rect x="100" y="620" width="440" height="420" fill="url(#de-sky)" />
            <Glow id="de-sun" x={200} y={700} r={260} t={t} color="#FFF4D8" amp={0.03} rate={1} opacity={0.8} />
            <path d="M100 930 L160 912 L200 924 L260 900 L320 918 L380 896 L440 916 L540 900 V1040 H100 Z" fill="#C88A6A" />
            {Array.from({ length: 9 }, (_, i) => <rect key={i} x={120 + i * 46} y={940 + (i % 3) * 16} width="10" height="14" fill="#7A4A3A" />)}
            <g transform="translate(400 920)">
              <path d="M-60 0 Q-62 -86 0 -96 Q62 -86 60 0 Z" fill="#C8604A" stroke="#7A3A30" strokeWidth="4" />
              {[-40, -14, 14, 40].map((x) => <path key={x} d={`M${x} 0 Q${x * 0.7} -70 0 -94`} stroke="#F2E8E0" strokeWidth="4" fill="none" />)}
              <rect x="-10" y="-122" width="20" height="28" fill="#F2E8E0" />
            </g>
          </g></g>
        </g>
        {/* PIANO 1 — la parete: cornice della finestra, la porta a destra che si apre sul corridoio (0,5) */}
        <g transform={`${L(0.5)} translate(0 70)`}>
          <rect x="96" y="626" width="448" height="408" fill="none" stroke="#F2F4F0" strokeWidth="22" />
          <rect x="96" y="626" width="448" height="408" fill="none" stroke={K} strokeWidth="6" />
          <path d="M320 630 V1030 M100 830 H540" stroke="#F2F4F0" strokeWidth="12" />
          {/* luce della finestra che cade nella stanza */}
          <path d="M120 1030 L540 1030 L760 1500 L60 1500 Z" fill="#FFF6E0" opacity=".25" />
          {/* porta: il corridoio luminoso appare quando si apre */}
          <rect x="840" y="560" width="230" height="560" fill="#F8F6EC" />
          <Glow id="de-cor" x={955} y={840} r={260} t={t} color="#FFFDF0" amp={0.03} rate={1.2} opacity={0.6 * home} />
          <path d={`M840 560 L${lerp(1070, 900, home)} ${lerp(560, 600, home)} L${lerp(1070, 900, home)} ${lerp(1120, 1090, home)} L840 1120 Z`} fill="#8A9A9A" stroke={K} strokeWidth="7" />
          <circle cx={lerp(1040, 890, home)} cy="850" r="9" fill="#D8DCE0" stroke={K} strokeWidth="3" />
          <rect x="830" y="550" width="250" height="580" fill="none" stroke={K} strokeWidth="9" />
          {/* prese e gas medicali sulla parete sopra il letto */}
          <rect x="560" y="660" width="100" height="44" rx="6" fill="#E8ECE8" stroke={K} strokeWidth="5" />
          {[580, 610, 640].map((x) => <circle key={x} cx={x} cy="682" r="8" fill={x === 610 ? '#5A9A6A' : '#5A7AA8'} stroke={K} strokeWidth="3" />)}
        </g>
        {/* PIANO 2 — il letto rifatto e il monitor del battito (0,7) */}
        <g transform={L(0.7)}>
          <rect x="-200" y="1250" width="1480" height="900" fill="url(#de-floor)" />
          {/* piastrelle in prospettiva e riflesso della finestra sul pavimento lucido */}
          {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${-100 + i * 100} 1250 L${-700 + i * 200} 2100`} stroke="#5A625C" strokeWidth="3" opacity=".5" />)}
          {[1300, 1380, 1490, 1640, 1840].map((y) => <path key={y} d={`M-200 ${y} H1280`} stroke="#5A625C" strokeWidth="3" opacity=".5" />)}
          <path d="M140 1260 L460 1260 L560 1700 L40 1700 Z" fill="#FFF6E0" opacity=".18" />
        </g>
        <g transform={`${L(0.7)} translate(0 80) translate(440 1200) scale(1.12) translate(-440 -1200)`}>
          <g transform="translate(-150 -10)">
          {/* monitor su braccio */}
          <path d="M850 900 V1000 L880 1180" stroke="#5A6068" strokeWidth="14" fill="none" />
          <rect x="676" y="688" width="348" height="196" rx="14" fill="#1A1E26" stroke={K} strokeWidth="9" />
          <rect x="690" y="700" width="320" height="170" rx="8" fill="#06100C" />
          <g clipPath="url(#de-mon)">
            {[730, 770, 810, 850].map((y) => <path key={y} d={`M690 ${y} H1010`} stroke="#1A3A2A" strokeWidth="2" />)}
            <HeartLine d={heartPath(690, 1010, 800, beats, 60, 60)} width={5} glow={0.5} />
          </g>
          <text x="1000" y="730" textAnchor="end" fontFamily="sans-serif" fontWeight="800" fontSize="30" fill={GIALLO}>72</text>
          <Glow id="de-mg" x={850} y={790} r={220} t={t} color="#F5E08A" amp={0.08} rate={6.3} opacity={0.3} />
          </g>
          {/* letto: testiera, materasso, lenzuolo, cuscino */}
          <rect x="140" y="1010" width="40" height="230" rx="10" fill="#B8C0C8" stroke={K} strokeWidth="7" />
          <path d="M160 1110 H720 Q740 1110 740 1130 V1200 H160 Z" fill="url(#de-sheet)" stroke={K} strokeWidth="8" />
          <path d="M180 1080 Q260 1052 340 1084 Q330 1112 190 1112 Z" fill="#FFFFFF" stroke={K} strokeWidth="7" />
          <path d="M360 1112 H720 V1160 H360 Z" fill="#9AB8C8" stroke={K} strokeWidth="6" />
          <path d="M360 1120 H720" stroke="#C8DCE8" strokeWidth="5" />
          <rect x="160" y="1200" width="580" height="40" fill="#8A929A" stroke={K} strokeWidth="7" />
          {[200, 700].map((x) => <g key={x}><rect x={x - 8} y="1240" width="16" height="60" fill="#5A6068" /><circle cx={x} cy="1306" r="12" fill="#2A2E36" /></g>)}
          {/* la borsa pronta con la sciarpa viola, quando torna a casa */}
          <g transform={`translate(260 1104) scale(${lerp(0.6, 1, bag)}) translate(-560 -1104)`} opacity={home}>
            <path d="M440 1110 Q430 1030 480 1020 H640 Q690 1030 680 1110 Z" fill="#2A2C38" stroke={K} strokeWidth="8" />
            <path d="M500 1020 Q560 970 620 1020" stroke="#14141C" strokeWidth="10" fill="none" />
            <path d="M450 1060 H672" stroke="#4A4E5E" strokeWidth="6" />
            <path d="M470 1030 Q530 1050 560 1100 L590 1100 Q560 1040 500 1024 Z" fill={VIOLA} stroke={K} strokeWidth="5" />
            <path d="M520 1040 l14 12 M546 1064 l12 14" stroke="#F2EEF8" strokeWidth="8" />
          </g>
        </g>
        {/* PIANO 3 — il comodino con la scatolina aperta e il defibrillatore (0,95) */}
        <g transform={`${L(0.95)} translate(0 110) translate(740 1300) scale(1.25) translate(-740 -1300)`}>
          <rect x="560" y="1180" width="360" height="300" fill="#C8B89A" stroke={K} strokeWidth="9" />
          <rect x="580" y="1250" width="320" height="90" fill="#B8A88A" stroke={K} strokeWidth="5" />
          <circle cx="740" cy="1295" r="8" fill="#6A5A4A" />
          <rect x="548" y="1166" width="384" height="24" fill="#D8C8AA" stroke={K} strokeWidth="7" />
          {/* scatolina blu aperta con il panno bianco */}
          <path d="M630 1166 L650 1080 H830 L850 1166 Z" fill="#2A4A7A" stroke={K} strokeWidth="7" />
          <path d="M650 1080 L640 1000 H820 L830 1080 Z" fill="#3A5A8A" stroke={K} strokeWidth="7" />
          <path d="M660 1150 L672 1094 H808 L820 1150 Z" fill="#F2F2F6" stroke={K} strokeWidth="4" />
          {/* il dispositivo: placchetta metallica arrotondata e il filo arrotolato */}
          <g transform={`translate(712 1122) scale(${1 + 0.06 * dev})`}>
            <path d="M-40 -18 Q-44 -30 -26 -32 H30 Q46 -30 44 -12 Q42 18 10 24 H-24 Q-44 22 -40 -18 Z" fill="url(#de-metal)" stroke={K} strokeWidth="5" />
            <path d="M-26 -22 Q0 -28 30 -20" stroke="#FFFFFF" strokeWidth="4" fill="none" opacity=".8" />
            <rect x="34" y="-14" width="14" height="14" rx="3" fill="#D8DCE4" stroke={K} strokeWidth="3" />
          </g>
          <path d={`M760 1112 q40 -10 50 10 q8 22 -26 24 q-30 2 -20 -16 q10 -18 40 -8`} stroke="#4A5260" strokeWidth="5" fill="none" />
          {/* l'evento: alone sopra la scatolina e la spia gialla a cuore che si accende sul dispositivo */}
          <Glow id="de-dv" x={712} y={1118} r={170} t={t} color="#FFF0A8" amp={0.06} rate={2} opacity={0.9 * dev} />
          <g transform="translate(704 1118)" opacity={0.25 + 0.75 * dev}>
            <path d="M0 6 C-14 -4 -12 -16 -4 -16 C0 -16 0 -12 0 -10 C0 -12 0 -16 4 -16 C12 -16 14 -4 0 6 Z" transform={`scale(${1 + 0.25 * dev * (0.5 + 0.5 * Math.sin(t * 7.5))})`} fill={GIALLO} stroke={K} strokeWidth="2.5" />
          </g>
          {/* bicchiere d'acqua accanto */}
          <path d="M870 1166 L862 1090 H902 L894 1166 Z" fill="#CFE8F0" stroke={K} strokeWidth="5" opacity=".9" />
          <path d="M868 1110 H896" stroke="#9AC8D8" strokeWidth="4" />
        </g>
        {/* PIANO 4 — la tenda divisoria in primo piano a sinistra (1,2) */}
        <g transform={L(1.2)}>
          <path d={`M-200 -300 H${70 + Math.sin(t * 0.8) * 6} Q${60 + Math.sin(t * 0.8) * 10} 1200 ${110 + Math.sin(t * 0.8) * 8} 2100 H-200 Z`} fill="#8AB8B0" stroke={K} strokeWidth="9" />
          {[0, 40, 80].map((x) => <path key={x} d={`M${x} -300 Q${x - 14} 1200 ${x + 6} 2100`} stroke="#6A9890" strokeWidth="8" fill="none" />)}
          <path d="M-200 1700 H1280 V2200 H-200 Z" fill="#5A625C" opacity=".6" />
        </g>
        {/* PIANO 5 — pulviscolo nella luce della finestra (1,5) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 700, x0: 160, x1: 520 }} bottom={{ y: 1500, x0: 80, x1: 760 }} n={36} color="#FFF8E0" seed={12} />
          <NearMotes id="de-near" t={t} color="#FFF8E8" n={5} r0={50} r1={130} y0={900} y1={1900} opacity={0.08} />
        </g>
      </g>
      <Finish id="de" tint="#3A4450" tintOpacity={0.08} />
    </svg>
  );
};
