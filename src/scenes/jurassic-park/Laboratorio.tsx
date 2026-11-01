import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes, Wisps } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { Egg, JPDefs, JungleTree, K, Ombra } from './Comuni';

// Il laboratorio: la sala delle incubatrici, chiara e pulita. Al centro, grande, l'incubatrice di vetro con le uova
// sotto le lampade calde e il braccio meccanico; dalla finestra la giungla; sulla parete gli schermi con i grafici.
// Eventi: prima frase dalla finestra passa la testa di un brachiosauro (restano senza parole); seconda frase l'uovo grande
// si crepa (cue 1 → + 1, gli scatti dello spartito) e si apre (cue 1 + 1, la ceramica), e spunta la testolina di un
// cucciolo generico; terza frase i cartellini delle uova si accendono uno dopo l'altro con la «F» di femmina (accento).
// Piani: parete chiara, finestra con la giungla (0,25) · schermi (0,45) · incubatrice e uova (0,75) · braccio meccanico (0,9)
//        · tubi e banco in primo piano (1,2) · vapore e pulviscolo (1,5–1,8)

const EGGS = [[300, 1110, 0.9], [440, 1130, 0.95], [800, 1120, 0.9], [680, 1140, 0.85]] as const;

export const Laboratorio: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const peek = eo(seg(t, cues[0] + 0.3, cues[0] + 1.2)) * (1 - eo(seg(t, cues[1] - 0.2, cues[1] + 0.6)));
  const crack = seg(t, cues[1], cues[1] + 1.0);
  const open = eo(seg(t, cues[1] + 1.0, cues[1] + 1.8));
  const baby = eob(seg(t, cues[1] + 1.2, cues[1] + 1.8));
  const tag = (i: number) => eo(seg(t, cues[2] + i * 0.2, cues[2] + i * 0.2 + 0.4));
  const shake = crack > 0 && crack < 1 ? Math.sin(t * 40) * 3 * crack : 0;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="lb" />
        <JPDefs id="lb" />
        <Lin id="lb-wall" stops={[[0, '#B8CCC4'], [0.5, '#D8E4DC'], [1, '#C8D8D0']]} />
        <Lin id="lb-sky" stops={[[0, '#8AB8C8'], [1, '#D8ECE0']]} />
        <Lin id="lb-floor" stops={[[0, '#8A9A92'], [1, '#3A4A42']]} />
        <Lin id="lb-tray" stops={[[0, '#F2E6C8'], [1, '#C8B890']]} />
        <Lin id="lb-glass" x2={1} y2={0} stops={[[0, '#DFF4FF', 0.35], [0.3, '#FFFFFF', 0.1], [0.8, '#DFF4FF', 0.05], [1, '#DFF4FF', 0.3]]} />
        <Lin id="lb-scr" x2={1} y2={0} stops={[[0, '#1A2A24'], [0.5, '#24362E'], [1, '#141E1A']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete chiara e finestra sulla giungla con il brachiosauro che passa (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#lb-wall)" />
          <rect x="640" y="580" width="400" height="300" fill="url(#lb-sky)" />
          <clipPath id="lb-win"><rect x="640" y="580" width="400" height="300" /></clipPath>
          <g clipPath="url(#lb-win)">
          <JungleTree x={720} y={900} h={220} t={t} leaf="#3E7A50" trunk="url(#lb-trunk)" outline={false} />
          <JungleTree x={980} y={900} h={260} t={t} ph={2} leaf="#2E6A44" trunk="url(#lb-trunk)" outline={false} />
          <g transform={`translate(${lerp(1120, 860, peek)} ${lerp(700, 660, peek)})`} opacity={seg(peek, 0, 0.2)}>
            <path d="M-20 300 Q-10 120 40 40" stroke="#7E9A8E" strokeWidth="56" fill="none" strokeLinecap="round" />
            <path d="M10 60 Q-20 0 30 -10 Q100 -14 120 20 Q124 40 90 46 Q50 50 10 60 Z" fill="#8AA698" stroke={K} strokeWidth="6" />
            <circle cx="60" cy="10" r="7" fill={K} />
            <path d="M90 30 q14 -6 24 4" stroke="#3E8A54" strokeWidth="6" fill="none" />
          </g>
          </g>
        </g>

        {/* PIANO 1 — cornice della finestra e schermi con i grafici (0,45) */}
        <g transform={L(0.45)}>
          <rect x="630" y="570" width="420" height="320" fill="none" stroke="#E8F0EC" strokeWidth="22" />
          <rect x="630" y="570" width="420" height="320" fill="none" stroke={K} strokeWidth="6" />
          <path d="M840 570 V890" stroke="#E8F0EC" strokeWidth="12" />
          {[[60, 620], [330, 620]].map(([x, y], i) => (
            <g key={i}>
              <rect x={x} y={y} width="240" height="170" rx="12" fill="url(#lb-scr)" stroke={K} strokeWidth="7" />
              <path d={`M${x + 20} ${y + 120} ${Array.from({ length: 11 }, (_, k) => `L${x + 20 + k * 20} ${y + 120 - (i ? 40 + Math.sin(k * 1.3 + t * 2) * 30 : 20 + k * 6 + Math.sin(k + t) * 8)}`).join(' ')}`} stroke={i ? '#F2C14E' : '#6AF0A0'} strokeWidth="5" fill="none" />
              <text x={x + 20} y={y + 36} fontFamily={SANS} fontWeight={800} fontSize="22" fill={i ? '#F2C14E' : '#6AF0A0'}>{i ? 'TEMP 37°' : 'CRESCITA'}</text>
            </g>
          ))}
        </g>

        {/* PIANO 2 — pavimento e incubatrice con le uova sotto le lampade (0,75) */}
        <g transform={L(0.75)}>
          <path d="M-200 1200 H1280 V2200 H-200 Z" fill="url(#lb-floor)" />
          <path d="M-200 1202 H1280" stroke="#C8D8D0" strokeWidth="5" opacity=".7" />
          <Ombra id="lb" x={540} y={1236} rx={480} ry={30} />
          <rect x="140" y="1180" width="800" height="56" rx="10" fill="url(#lb-steel)" stroke={K} strokeWidth="8" />
          <path d="M120 1040 Q120 1000 160 1000 H920 Q960 1000 960 1040 V1180 H120 Z" fill="url(#lb-tray)" stroke={K} strokeWidth="8" />
          <path d="M140 1012 H940" stroke="#FFFAEC" strokeWidth="5" opacity=".8" />
          {/* lampade calde sopra, appese a un braccio da destra */}
          <path d="M1100 840 H180" stroke="url(#lb-steel)" strokeWidth="18" />
          {[280, 440, 600, 760].map((x, i) => (
            <g key={x}>
              <path d={`M${x} 840 V880`} stroke={K} strokeWidth="6" />
              <path d={`M${x - 40} 920 Q${x - 36} 880 ${x} 878 Q${x + 36} 880 ${x + 40} 920 Z`} fill="#3E4A44" stroke={K} strokeWidth="6" />
              <ellipse cx={x} cy={922} rx="30" ry="8" fill="#FFB060" />
              <path d={`M${x - 36} 924 L${x - 90} 1100 H${x + 90} L${x + 36} 924 Z`} fill="#FFB060" opacity=".12" />
              <Glow id={`lb-h${i}`} x={x} y={1000} r={170} t={t + i} color="#FFA850" amp={0.05} rate={2} opacity={0.35} />
            </g>
          ))}
          {/* le altre uova con i cartellini */}
          {EGGS.map(([x, y, sc], i) => (
            <g key={i}>
              <Egg x={x} y={y - 40} s={sc} />
              <g transform={`translate(${x} ${y + 24})`}>
                <rect x="-34" y="-20" width="68" height="40" rx="6" fill={tag(i) > 0.5 ? P.accento : '#F2EEE4'} stroke={K} strokeWidth="5" />
                <text x="0" y="13" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="32" fill={K} opacity={tag(i)}>F</text>
              </g>
            </g>
          ))}
          {/* l'uovo grande al centro che si apre */}
          <g transform={`translate(${560 + shake} 1080)`}>
            <Glow id="lb-big" x={0} y={-40} r={260} t={t} color="#FFE0A0" amp={0.06} rate={3} opacity={0.3 + 0.3 * crack} />
            {baby > 0 && (
              <g transform={`translate(0 ${-20 - 60 * baby}) scale(${0.5 * baby})`}>
                <path d="M-60 90 Q-70 -10 0 -30 Q80 -40 120 0 Q130 20 100 30 Q60 34 20 40 Q-10 60 -20 100 Z" fill="#8A9A5A" stroke={K} strokeWidth="9" />
                <circle cx="40" cy="-6" r="14" fill="#F2E6B0" stroke={K} strokeWidth="5" />
                <circle cx="44" cy="-6" r="7" fill={K} />
                <path d="M80 20 q20 4 30 -4" stroke={K} strokeWidth="6" fill="none" />
                <path d="M-20 -24 q10 -20 30 -14" stroke="#C4CE8E" strokeWidth="8" fill="none" />
              </g>
            )}
            <Egg x={0} y={0} s={1.6} crack={crack} open={open} />
          </g>
          {/* coperchio di vetro */}
          <path d="M150 1000 Q150 930 220 930 H860 Q930 930 930 1000" fill="url(#lb-glass)" stroke={K} strokeWidth="6" />
          <path d="M200 950 Q300 940 420 944" stroke="#FFFFFF" strokeWidth="6" opacity=".7" fill="none" />
        </g>

        {/* PIANO 3 — braccio meccanico che si avvicina all'uovo grande (0,9) */}
        <g transform={L(0.9)}>
          <path d={`M1180 760 L${lerp(900, 820, crack)} ${lerp(880, 920, crack)} L${lerp(720, 680, crack)} ${lerp(940, 960, crack)}`} stroke={K} strokeWidth="34" fill="none" strokeLinejoin="round" />
          <path d={`M1180 760 L${lerp(900, 820, crack)} ${lerp(880, 920, crack)} L${lerp(720, 680, crack)} ${lerp(940, 960, crack)}`} stroke="#C8D0CC" strokeWidth="20" fill="none" strokeLinejoin="round" />
          <circle cx={lerp(900, 820, crack)} cy={lerp(880, 920, crack)} r="22" fill="url(#lb-steel)" stroke={K} strokeWidth="6" />
          <path d={`M${lerp(720, 680, crack)} ${lerp(940, 960, crack)} l-30 20 m30 -20 l-10 34`} stroke={K} strokeWidth="9" />
        </g>

        {/* PIANO 4 — tubi e banco d'acciaio in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <rect x="-200" y="1560" width="1480" height="640" fill="url(#lb-steel)" stroke={K} strokeWidth="10" />
          <path d="M-200 1580 H1280" stroke="#E8F0EC" strokeWidth="6" opacity=".6" />
          {[-100, 260, 620, 980].map((x) => <g key={x}><rect x={x} y="1660" width="300" height="200" rx="8" fill="none" stroke={K} strokeWidth="6" /><rect x={x + 110} y="1690" width="80" height="18" rx="9" fill="#C8D0CC" stroke={K} strokeWidth="4" /></g>)}
          {[-60, 1100].map((x) => <rect key={x} x={x} y="560" width="44" height="1000" fill="url(#lb-steel)" stroke={K} strokeWidth="8" />)}
          <path d="M-200 1500 Q200 1460 300 1560" stroke="#4AA0E0" strokeWidth="22" fill="none" />
          <path d="M1280 1480 Q900 1450 820 1560" stroke="#E8C060" strokeWidth="22" fill="none" />
        </g>

        {/* PIANO 5 — vapore dell'incubatrice e pulviscolo nelle lampade (1,5–1,8) */}
        <g transform={L(0.75)}>
          <Wisps t={t} x={220} y={1000} color="#FFFFFF" n={3} h={140} opacity={0.4} />
          <Wisps t={t + 1} x={880} y={1000} color="#FFFFFF" n={3} h={140} opacity={0.4} />
        </g>
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 930, x0: 240, x1: 800 }} bottom={{ y: 1120, x0: 200, x1: 860 }} seed={3} n={22} color="#FFE0A0" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="lb-near" t={t} color="#FFFFFF" n={6} opacity={0.08} />
        </g>
      </g>
      <Finish id="lb" tint="#1E4A30" tintOpacity={0.1} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): brachiosauro cue0 + 0,3 · crepe cue1 → + 1 · apertura e cucciolo cue1 + 1 → 1,8 · cartellini F cue2 + 0,2 × i.
