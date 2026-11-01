import React from 'react';
import { camera, eio, eo, lerp, seg } from '../../lib/anim';
import { Dust, Fog, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { HAND } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { K, Lampada, OthersDefs, Ombra } from './Comuni';

// L'album dei morti: la soffitta della villa. Parete di intonaco scrostato (zona calma dietro il titolo), a destra il
// soffitto spiovente con l'abbaino nella nebbia; mobili coperti da lenzuoli bianchi; al centro, sopra un baule, il grande
// album di pelle con le fotografie color seppia (letti con fiori, una sedia con i gigli, nastri neri: nessuna persona),
// illuminato dalla lampada a petrolio.
// Eventi: prima frase il lenzuolo della poltrona scivola via (Grace cerca gli intrusi); seconda frase l'album si apre;
// terza frase le foto si accendono una dopo l'altra sotto la lampada e la fiamma trema.
// Piani: parete e abbaino (0,3) · mobili coperti (0,5) · baule e album (0,85) · trave e ragnatela in primo piano (1,25)
//        · pulviscolo (1,5–1,8)

const Foto: React.FC<{ x: number; y: number; w: number; h: number; rot: number; kind: number; lit: number; label: string }> = ({ x, y, w, h, rot, kind, lit, label }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2 - 8} y={-h / 2 - 8} width={w + 16} height={h + 34} fill="#F2EAD4" stroke={K} strokeWidth="4" />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#8A6A44" />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#C8A878" opacity={0.25 + 0.5 * lit} />
    {kind === 0 && (
      <g>
        {/* letto con il cuscino e i fiori */}
        <rect x={-w * 0.4} y={h * 0.05} width={w * 0.8} height={h * 0.28} fill="#E8D8B8" stroke="#3A2414" strokeWidth="3" />
        <rect x={-w * 0.42} y={-h * 0.3} width={w * 0.1} height={h * 0.63} fill="#4A2E18" />
        <ellipse cx={-w * 0.18} cy={h * 0.04} rx={w * 0.14} ry={h * 0.07} fill="#F2E8D0" stroke="#3A2414" strokeWidth="2" />
        {[0, 1, 2].map((i) => <circle key={i} cx={w * 0.12 + i * 10} cy={h * 0.02} r="5" fill="#5A3A20" />)}
      </g>
    )}
    {kind === 1 && (
      <g>
        {/* sedia vuota con un mazzo di gigli */}
        <path d={`M${-w * 0.15} ${-h * 0.32} V${h * 0.36} M${w * 0.15} ${-h * 0.32} V${h * 0.36} M${-w * 0.15} ${h * 0.05} H${w * 0.15} M${-w * 0.15} ${-h * 0.32} H${w * 0.15}`} stroke="#3A2414" strokeWidth="5" />
        {[-8, 0, 8].map((dx, i) => <path key={i} d={`M${dx} ${h * 0.05} q${dx} -20 ${dx * 2} -30`} stroke="#3A4A2A" strokeWidth="3" fill="none" />)}
        {[-16, 0, 16].map((dx, i) => <circle key={`f${i}`} cx={dx} cy={-h * 0.08} r="6" fill="#F2EAD4" />)}
      </g>
    )}
    {kind === 2 && (
      <g>
        {/* finestra con le tende tirate e un vaso */}
        <rect x={-w * 0.25} y={-h * 0.35} width={w * 0.5} height={h * 0.55} fill="#E8D8B8" stroke="#3A2414" strokeWidth="3" />
        <path d={`M${-w * 0.25} ${-h * 0.35} h${w * 0.18} v${h * 0.55} h${-w * 0.18} Z M${w * 0.25} ${-h * 0.35} h${-w * 0.18} v${h * 0.55} h${w * 0.18} Z`} fill="#4A2E18" />
        <path d={`M-8 ${h * 0.36} h16 l-4 -20 h-8 Z`} fill="#3A2414" />
      </g>
    )}
    {kind === 3 && (
      <g>
        {/* culla vuota con il nastro */}
        <path d={`M${-w * 0.32} ${-h * 0.05} Q0 ${h * 0.35} ${w * 0.32} ${-h * 0.05} Z`} fill="#E8D8B8" stroke="#3A2414" strokeWidth="3" />
        <path d={`M${-w * 0.3} ${h * 0.3} Q0 ${h * 0.1} ${w * 0.3} ${h * 0.3}`} stroke="#3A2414" strokeWidth="5" fill="none" />
        <path d={`M${-w * 0.32} ${-h * 0.05} Q${-w * 0.36} ${-h * 0.35} ${-w * 0.1} ${-h * 0.3}`} stroke="#3A2414" strokeWidth="4" fill="none" />
      </g>
    )}
    {/* angolo di nastro nero del lutto */}
    <path d={`M${w / 2 + 8} ${-h / 2 - 8} h-30 l30 30 Z`} fill="#141414" />
    <text x="0" y={h / 2 + 22} textAnchor="middle" fontFamily={HAND} fontSize="22" fill="#4A3A2A">{label}</text>
  </g>
);

export const Album: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const sheet = eio(seg(t, cues[0] + 0.6, cues[0] + 1.6));
  const open = eio(seg(t, cues[1] + 0.2, cues[1] + 1.2));
  const ph = (i: number) => eo(seg(t, cues[2] + 0.2 + i * 0.45, cues[2] + 0.7 + i * 0.45));
  const flick = seg(t, cues[2] + 0.4, cues[2] + 0.8) * (1 - seg(t, cues[2] + 2.2, cues[2] + 3));
  const bend = 10 * flick * Math.sin(t * 9);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="al" />
        <OthersDefs id="al" />
        <Lin id="al-wall" stops={[[0, '#141614'], [0.4, '#2A2C26'], [0.75, '#3A3A30'], [1, '#22221C']]} />
        <Lin id="al-floor" stops={[[0, '#3A2A1A'], [1, '#0E0A06']]} />
        <Lin id="al-sheet" x2={1} y2={0} stops={[[0, '#C8C8BC'], [0.4, '#E8E6DA'], [1, '#8A8C84']]} />
        <Lin id="al-leather" x2={1} y2={0} stops={[[0, '#2A1210'], [0.5, '#5A2A20'], [1, '#2A1210']]} />
        <Lin id="al-page" x2={1} y2={0} stops={[[0, '#D8CCAA'], [0.12, '#F2EAD4'], [0.88, '#F2EAD4'], [1, '#C8BC9A']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete d'intonaco, soffitto spiovente a destra con l'abbaino (0,3) */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#al-wall)" />
          {[[120, 760, 90], [300, 1000, 60], [820, 1080, 70]].map(([x, y, r], i) => (
            <path key={i} d={`M${x} ${y} q${r * 0.6} ${-r * 0.3} ${r} ${r * 0.2} q${-r * 0.2} ${r * 0.5} ${-r * 0.8} ${r * 0.4} Z`} fill="#4A4A3E" opacity=".5" />
          ))}
          <path d="M1280 420 L640 640 V660 L1280 460 Z" fill="#2A1E14" stroke={K} strokeWidth="6" />
          <path d="M640 660 L1280 460 V1260 H640 Z" fill="#1E1A14" opacity=".55" />
          {/* abbaino */}
          <path d="M800 700 L940 650 V900 L800 930 Z" fill="#6A7A78" stroke={K} strokeWidth="8" />
          <path d="M870 676 V916 M800 815 L940 776" stroke="#2A221A" strokeWidth="7" />
          <Fog id="al-win" t={t} y={790} x={870} rx={80} ry={60} color="#C8D4D0" opacity={0.6} speed={0.4} drift={10} />
          <path d="M806 708 L934 662" stroke="#B8C4C0" strokeWidth="4" opacity=".6" />
          <path d="M-200 1250 H1280" stroke="#2A1E14" strokeWidth="18" />
        </g>

        {/* PIANO 1 — mobili coperti dai lenzuoli (0,5) */}
        <g transform={L(0.5)}>
          <path d="M-200 1250 H1280 V2200 H-200 Z" fill="url(#al-floor)" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M-200 ${1270 + i * i * 10} H1280`} stroke="#000" strokeWidth="3" opacity=".3" />)}
          {/* specchio alto: il lenzuolo scivola via e lo scopre */}
          <g>
            <rect x="60" y="640" width="280" height="560" rx="16" fill="url(#al-wood)" stroke={K} strokeWidth="8" />
            <rect x="86" y="666" width="228" height="508" rx="10" fill="#1A2224" stroke={K} strokeWidth="5" />
            <path d="M110 700 L170 690 L120 1000 Z" fill="#FFFFFF" opacity=".12" />
            <ellipse cx="250" cy="1000" rx="40" ry="56" fill="#FFC870" opacity={0.5 * sheet} />
            <path d="M120 1200 l-20 50 M280 1200 l20 50" stroke={K} strokeWidth="14" strokeLinecap="round" />
          </g>
          <g transform={`translate(0 ${lerp(0, 380, sheet)}) rotate(${lerp(0, -6, sheet)} 200 640)`} opacity={1 - sheet}>
            <path d="M40 1220 Q30 900 50 680 Q60 620 200 612 Q340 620 350 680 Q370 900 360 1220 Q280 1236 200 1222 Q120 1236 40 1220 Z" fill="url(#al-sheet)" stroke={K} strokeWidth="7" />
            {[100, 160, 230, 300].map((x) => <path key={x} d={`M${x} 630 Q${x - 10} 900 ${x + 6} 1222`} stroke="#8A8C84" strokeWidth="4" fill="none" />)}
          </g>
          {/* poltrona coperta a destra */}
          <g transform="translate(830 1230)">
            <path d="M-170 0 Q-180 -170 -130 -250 Q-120 -330 0 -340 Q120 -330 130 -250 Q180 -170 170 0 Q90 16 0 4 Q-90 16 -170 0 Z" fill="url(#al-sheet)" stroke={K} strokeWidth="7" />
            {[-110, -40, 40, 110].map((x) => <path key={x} d={`M${x} -320 Q${x - 10} -160 ${x + 6} 0`} stroke="#8A8C84" strokeWidth="4" fill="none" />)}
            <path d="M-150 -170 Q0 -200 150 -170" stroke="#8A8C84" strokeWidth="5" fill="none" />
          </g>
        </g>

        {/* PIANO 2 — baule con l'album e la lampada (0,85) */}
        <g transform={L(0.85)}>
          <Glow id="al-lamp" x={965} y={1000} r={460} t={t} color="#FFC870" amp={0.06 + 0.1 * flick} rate={11} opacity={0.6} />
          <Ombra id="al" x={540} y={1460} rx={460} ry={30} />
          {/* baule */}
          <rect x="90" y="1240" width="920" height="220" rx="12" fill="url(#al-wood)" stroke={K} strokeWidth="9" />
          <rect x="80" y="1214" width="940" height="40" rx="10" fill="url(#al-wood)" stroke={K} strokeWidth="8" />
          {[150, 950].map((x) => <rect key={x} x={x - 18} y="1214" width="36" height="246" fill="#3A3E40" stroke={K} strokeWidth="5" />)}
          <rect x="516" y="1260" width="48" height="60" rx="6" fill="url(#al-brass)" stroke={K} strokeWidth="5" />
          <path d="M96 1222 H1010" stroke="#B08860" strokeWidth="4" opacity=".55" />
          {/* l'album di pelle */}
          <g transform="translate(510 1216) scale(1.14)">
            <Ombra id="al" x={0} y={-6} rx={360} ry={20} />
            {/* pagine aperte */}
            <path d="M-340 -16 L-326 -300 Q-160 -320 0 -290 Q160 -320 326 -300 L340 -16 Q160 -30 0 -6 Q-160 -30 -340 -16 Z" fill="url(#al-leather)" stroke={K} strokeWidth="8" />
            <g opacity={open}>
              <path d="M-326 -24 L-314 -290 Q-160 -306 0 -280 V-14 Q-160 -40 -326 -24 Z" fill="url(#al-page)" stroke={K} strokeWidth="5" />
              <path d="M326 -24 L314 -290 Q160 -306 0 -280 V-14 Q160 -40 326 -24 Z" fill="url(#al-page)" stroke={K} strokeWidth="5" />
              <path d="M0 -280 V-14" stroke="#8A7A5A" strokeWidth="6" />
              <Foto x={-232} y={-200} w={118} h={86} rot={-3} kind={0} lit={ph(0)} label="1891" />
              <Foto x={-92} y={-176} w={100} h={110} rot={2} kind={1} lit={ph(1)} label="1891" />
              <Foto x={96} y={-194} w={110} h={92} rot={-2} kind={2} lit={ph(2)} label="1888" />
              <Foto x={236} y={-168} w={104} h={88} rot={4} kind={3} lit={ph(3)} label="1891" />
            </g>
            {/* copertina che si apre: ruota sul dorso */}
            <g transform={`scale(${1 - 2 * Math.min(open, 0.5)} 1)`} opacity={open < 0.5 ? 1 : 0}>
              <path d="M0 -6 L0 -292 Q160 -322 330 -302 L344 -16 Q160 -30 0 -6 Z" fill="url(#al-leather)" stroke={K} strokeWidth="8" />
              <rect x="110" y="-210" width="130" height="90" rx="6" fill="none" stroke="#C8A050" strokeWidth="5" />
              <path d="M140 -166 H210" stroke="#C8A050" strokeWidth="5" />
            </g>
          </g>
          <Lampada id="al" x={965} y={1222} t={t} s={0.74} ph={2.1} bend={bend} glow={0.5} />
        </g>

        {/* PIANO 3 — trave verticale e ragnatela in primo piano (1,25) */}
        <g transform={L(1.25)}>
          <rect x="-120" y="-200" width="170" height="2400" fill="url(#al-wood)" stroke={K} strokeWidth="9" />
          {[300, 900, 1500].map((y) => <path key={y} d={`M-110 ${y} q60 -20 150 10`} stroke="#1E140C" strokeWidth="5" fill="none" />)}
          <g stroke="#C8C8BC" strokeWidth="2" fill="none" opacity=".45">
            {[0, 1, 2, 3].map((i) => <path key={i} d={`M50 ${560 + i * 50} Q${110 + i * 20} ${600 + i * 40} ${100 + i * 60} 560`} />)}
            <path d="M50 560 L280 560 M50 560 L230 760 M50 560 L50 780" />
          </g>
        </g>

        {/* PIANO 4 — pulviscolo nella luce della lampada (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 760, x0: 860, x1: 1060 }} bottom={{ y: 1220, x0: 200, x1: 980 }} seed={5} n={30} color="#FFE0A0" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="al-near" t={t} color="#E8D8B0" n={6} opacity={0.08} />
        </g>
      </g>
      <Finish id="al" tint="#2A1E14" tintOpacity={0.13} />
    </svg>
  );
};
