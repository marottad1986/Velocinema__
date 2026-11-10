import React from 'react';
import { camera, eo, lerp, rng, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes, Wisps } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { HAND } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { CROMA, K, Ombra, StDefs, VELATURA } from './Comuni';

// Una mamma parla con le luci: la parete del soggiorno di casa Byers con l'alfabeto dipinto a mano e una lucina di
// Natale sopra ogni lettera. Eventi: prima frase la stanza in penombra (telefono staccato, posacenere che fuma, vernice
// e pennello ancora a terra); seconda frase le lucine si accendono a onda da sinistra, come quando Joyce parla al
// figlio; terza frase si spengono tutte e si accendono una alla volta S-C-A-P-P-A: ogni lettera resta accesa, così la parola
// si costruisce, e alla fine brilla tutta insieme.
// Piani: parete con la carta da parati, lettere e lucine (0,28) · zoccolo e pavimento (0,4) · lampada a stelo e
//        tavolino con il telefono (0,66) · bracciolo della poltrona, barattolo di vernice (1,15) · pulviscolo (1,5)
//        · velo vicino (1,8)

const ROWS = ['ABCDEFGH', 'IJKLMNOPQ', 'RSTUVWXYZ'];
const ROW_Y = [730, 890, 1050];
type Bulb = { ch: string; x: number; y: number; c: string; idx: number };
const COLORS = ['#F5B83D', '#E8505B', '#5FB8E8', '#7FD18A', '#F4EEDC'];
const r = rng(3303);
const BULBS: Bulb[] = ROWS.flatMap((row, ri) => row.split('').map((ch, i) => {
  const n = row.length, x0 = ri === 0 ? 130 : 90, x1 = ri === 0 ? 840 : 880;
  return { ch, x: lerp(x0, x1, i / (n - 1)) + (r() - 0.5) * 14, y: ROW_Y[ri] + (r() - 0.5) * 10, c: COLORS[(ri * 3 + i) % COLORS.length], idx: ri * 10 + i };
}));
const WORD = ['S', 'C', 'A', 'P', 'P', 'A'];

/** Filo tra le lucine di una fila: curve che pendono tra un portalampada e l'altro. */
const wire = (pts: Bulb[]) => pts.reduce((d, b, i) => {
  if (i === 0) return `M${b.x - 70} ${b.y - 78} Q${b.x - 35} ${b.y - 50} ${b.x} ${b.y - 62}`;
  const a = pts[i - 1];
  return `${d} Q${(a.x + b.x) / 2} ${b.y - 30} ${b.x} ${b.y - 62}`;
}, '') + ` Q${pts[pts.length - 1].x + 40} ${pts[pts.length - 1].y - 50} ${pts[pts.length - 1].x + 80} ${pts[pts.length - 1].y - 82}`;

export const Lucine: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;

  // seconda frase: onda di accensione da sinistra a destra
  const tWave = griglia(cues[1] + 0.3);
  // terza frase: tutto spento, poi la parola lettera per lettera (una croma ciascuna) e alla fine tutta insieme
  const tDark = griglia(cues[2] + 0.4);
  const tSpell = griglia(cues[2] + 1.4);
  const step = CROMA;
  const tWord = tSpell + WORD.length * step + 0.15;
  const wordAll = eo(seg(t, tWord, tWord + 0.3));

  // per ogni lettera della parola, l'indice della lampadina (le due P sono la stessa lettera)
  const spellOf = (ch: string) => WORD.map((w, k) => (w === ch ? k : -1)).filter((k) => k >= 0);

  const level = (b: Bulb) => {
    const wave = eo(seg(t, tWave + (b.x / 1080) * 0.9 + (b.y - 730) / 1800, tWave + (b.x / 1080) * 0.9 + 0.35 + (b.y - 730) / 1800));
    const breathe = 0.75 + 0.25 * Math.sin(t * 2.2 + b.idx * 0.9);
    const before = wave * breathe * (1 - eo(seg(t, tDark, tDark + 0.25)));
    let spell = 0;
    for (const k of spellOf(b.ch)) {
      const a = tSpell + k * step;
      spell = Math.max(spell, seg(t, a, a + 0.06) * (1 - 0.3 * seg(t, a + step * 0.75, a + step * 0.95)));
    }
    const inWord = WORD.includes(b.ch) ? 1 : 0;
    return Math.max(before, spell, inWord * wordAll * (0.85 + 0.15 * Math.sin(t * 6)));
  };

  const rowsBulbs = ROWS.map((_, ri) => BULBS.filter((b) => Math.floor(b.idx / 10) === ri));
  const roomLight = 0.35 + 0.65 * Math.max(...BULBS.map(level)) * 0.6;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="lu" />
        <StDefs id="lu" />
        <Lin id="lu-wall" stops={[[0, '#1E1A16'], [0.3, '#3A3024'], [0.6, '#4A3C2A'], [1, '#2A2218']]} />
        <pattern id="lu-paper" width="120" height="140" patternUnits="userSpaceOnUse">
          <path d="M60 0 V140" stroke="#5A4A32" strokeWidth="3" opacity=".35" />
          <g transform="translate(30 40)" opacity=".38">
            <circle r="9" fill="#7A4A30" /><circle cx="-10" cy="8" r="6" fill="#5A6A3A" /><circle cx="10" cy="8" r="6" fill="#5A6A3A" />
            <path d="M0 9 Q4 26 -2 40" stroke="#5A6A3A" strokeWidth="3" fill="none" />
          </g>
          <g transform="translate(90 110)" opacity=".38">
            <circle r="9" fill="#7A4A30" /><circle cx="-10" cy="8" r="6" fill="#5A6A3A" /><circle cx="10" cy="8" r="6" fill="#5A6A3A" />
          </g>
        </pattern>
        <Lin id="lu-floor" stops={[[0, '#2A1E14'], [1, '#0C0806']]} />
        <Lin id="lu-shade" x2={1} y2={0} stops={[[0, '#C8A878'], [0.5, '#F2DCA8'], [1, '#A88858']]} />
        <Lin id="lu-chair" x2={1} y2={0} stops={[[0, '#3A2A1E'], [0.5, '#6A4A30'], [1, '#2A1E14']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete con carta da parati, alfabeto dipinto, lucine (0,28) */}
        <g transform={L(0.28)}>
          <rect x="-200" y="-200" width="1480" height="1700" fill="url(#lu-wall)" />
          <rect x="-200" y="-200" width="1480" height="1700" fill="url(#lu-paper)" />
          {/* alone caldo della stanza quando le luci sono accese */}
          <Glow id="lu-room" x={540} y={950} r={700} t={t} color="#F5B83D" amp={0.02} rate={1.5} opacity={0.22 * roomLight} />
          {/* lettere dipinte con la vernice nera che cola */}
          {BULBS.map((b) => (
            <g key={b.idx}>
              <text x={b.x} y={b.y + 76} textAnchor="middle" fontFamily={HAND} fontWeight="700" fontSize="104" fill="none" stroke={b.c} strokeWidth="14" strokeLinejoin="round" opacity={0.75 * level(b) * level(b)}>{b.ch}</text>
              <text x={b.x} y={b.y + 76} textAnchor="middle" fontFamily={HAND} fontWeight="700" fontSize="104" fill="#0C0A08">{b.ch}</text>
              <path d={`M${b.x + ((b.idx * 13) % 20) - 10} ${b.y + 70} v${10 + ((b.idx * 7) % 22)}`} stroke="#0C0A08" strokeWidth="4" strokeLinecap="round" />
            </g>
          ))}
          {/* fili e lucine */}
          {rowsBulbs.map((row, ri) => <path key={ri} d={wire(row)} fill="none" stroke="#1A2A1A" strokeWidth="5" />)}
          {BULBS.map((b) => {
            const lv = level(b);
            return (
              <g key={b.idx}>
                <Glow id={`lu-g${b.idx}`} x={b.x} y={b.y - 34} r={70 + 100 * lv} t={t} color={b.c} amp={0} opacity={0.85 * lv} />
                <rect x={b.x - 7} y={b.y - 64} width="14" height="14" rx="3" fill="#1E3020" stroke={K} strokeWidth="3" />
                <path d={`M${b.x - 9} ${b.y - 50} Q${b.x - 12} ${b.y - 24} ${b.x} ${b.y - 18} Q${b.x + 12} ${b.y - 24} ${b.x + 9} ${b.y - 50} Z`}
                  fill={b.c} stroke={K} strokeWidth="3.5" opacity={0.3 + 0.7 * lv} />
                <path d={`M${b.x - 4} ${b.y - 46} Q${b.x - 6} ${b.y - 34} ${b.x - 2} ${b.y - 26}`} stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity={0.2 + 0.6 * lv} />
              </g>
            );
          })}
          {/* filo di lucine lungo il soffitto, sempre acceso piano */}
          <path d="M-150 660 Q100 700 340 668 Q590 706 840 670 Q1020 700 1230 664" fill="none" stroke="#1A2A1A" strokeWidth="5" />
        </g>

        {/* PIANO 1 — zoccolo di legno e pavimento (0,4) */}
        <g transform={L(0.4)}>
          <rect x="-200" y="1290" width="1480" height="70" fill="#3A2A1C" stroke={K} strokeWidth="6" />
          <path d="M-200 1296 H1280" stroke="#8A6A48" strokeWidth="3" opacity=".5" />
          <path d="M-200 1360 H1280 V2200 H-200 Z" fill="url(#lu-floor)" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-200 + i * 190} 1360 L${-600 + i * 300} 2200`} stroke="#000" strokeWidth="3" opacity=".3" />)}
          {/* tappeto ovale */}
          <ellipse cx="560" cy="1560" rx="420" ry="80" fill="#5A2A22" stroke={K} strokeWidth="6" />
          <ellipse cx="560" cy="1560" rx="360" ry="62" fill="none" stroke="#C88A4A" strokeWidth="4" opacity=".5" />
        </g>

        {/* PIANO 2 — lampada a stelo a destra, tavolino con il telefono e il posacenere a sinistra (0,66) */}
        <g transform={L(0.66)}>
          {/* lampada a stelo */}
          <Ombra id="lu" x={1010} y={1420} rx={90} ry={14} />
          <path d="M1010 1416 V880" stroke={K} strokeWidth="14" />
          <path d="M1010 1416 V880" stroke="#8A7A5A" strokeWidth="6" />
          <ellipse cx="1010" cy="1416" rx="56" ry="12" fill="#3A3226" stroke={K} strokeWidth="6" />
          <Glow id="lu-lamp" x={1010} y={900} r={260} t={t} color="#FFD8A0" amp={0.04} rate={3} opacity={0.55} />
          <path d="M940 900 L965 800 H1055 L1080 900 Z" fill="url(#lu-shade)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M946 892 H1074" stroke="#FFF2D0" strokeWidth="4" opacity=".7" />
          <g transform="translate(0 34)">
          {/* tavolino con telefono a muro staccato, posacenere, sigaretta */}
          <Ombra id="lu" x={210} y={1420} rx={170} ry={16} />
          <path d="M70 1210 H350 L340 1236 H80 Z" fill="#5A3E26" stroke={K} strokeWidth="8" />
          <path d="M100 1236 L92 1416 M320 1236 L328 1416 M110 1330 H310" stroke="#3A2818" strokeWidth="12" />
          <path d="M80 1214 H340" stroke="#C8A070" strokeWidth="3" opacity=".5" />
          {/* telefono beige con la cornetta posata accanto */}
          <path d="M120 1210 Q118 1162 150 1158 H226 Q252 1162 250 1210 Z" fill="#D8C8A0" stroke={K} strokeWidth="6" />
          <circle cx="186" cy="1184" r="18" fill="#B8A880" stroke={K} strokeWidth="4" />
          {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={186 + Math.cos(i * 0.8 - 2.6) * 11} cy={1184 + Math.sin(i * 0.8 - 2.6) * 11} r="2.4" fill={K} />)}
          <path d="M262 1206 q10 -26 40 -26 h18 q12 0 12 14 v6 h-14 q-6 -8 -18 -6 q-14 2 -18 18 Z" fill="#D8C8A0" stroke={K} strokeWidth="5" />
          <path d="M240 1196 q20 20 10 40 q-10 20 6 40 q16 20 0 44 q-14 22 6 48" fill="none" stroke="#C8B890" strokeWidth="5" />
          {/* posacenere con la sigaretta che fuma */}
          <ellipse cx="300" cy="1206" rx="26" ry="8" fill="#8AA0A8" stroke={K} strokeWidth="4" />
          <path d="M296 1202 l30 -8" stroke="#F2EEE4" strokeWidth="5" strokeLinecap="round" />
          <circle cx="327" cy="1194" r="3" fill="#FF8A4A" />
          <Wisps t={t} x={327} y={1190} color="#C8C8D0" n={3} h={170} width={4} opacity={0.5} />
          </g>
        </g>

        {/* PIANO 3 — bracciolo della poltrona a sinistra, barattolo di vernice e pennello a destra (1,15) */}
        <g transform={L(1.15)}>
          <path d="M-120 1480 Q60 1440 200 1500 Q260 1530 250 1620 V2100 H-120 Z" fill="url(#lu-chair)" stroke={K} strokeWidth="10" />
          <path d="M-100 1490 Q60 1456 190 1510" stroke="#9A7050" strokeWidth="5" fill="none" opacity=".6" />
          {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${-60 + i * 60} 1560 q10 120 0 300`} stroke="#000" strokeWidth="3" opacity=".25" fill="none" />)}
          {/* barattolo di vernice nera aperto e pennello */}
          <Ombra id="lu" x={860} y={1700} rx={120} ry={16} />
          <path d="M780 1580 H930 V1700 Q855 1716 780 1700 Z" fill="url(#lu-metal)" stroke={K} strokeWidth="8" />
          <ellipse cx="855" cy="1580" rx="75" ry="16" fill="#0C0A08" stroke={K} strokeWidth="7" />
          <path d="M790 1590 q4 30 -2 60 M920 1592 q-4 20 2 44" stroke="#0C0A08" strokeWidth="6" fill="none" />
          <rect x="800" y="1620" width="110" height="44" fill="#E8E0CC" stroke={K} strokeWidth="4" />
          <path d="M812 1642 h86" stroke="#B8352F" strokeWidth="8" />
          <g transform="translate(960 1700) rotate(-18)">
            <rect x="0" y="-8" width="150" height="16" rx="6" fill="#B8352F" stroke={K} strokeWidth="5" />
            <rect x="-34" y="-12" width="36" height="24" fill="#9AA0A8" stroke={K} strokeWidth="4" />
            <path d="M-34 -12 h-30 q-6 12 0 24 h30 Z" fill="#0C0A08" stroke={K} strokeWidth="4" />
          </g>
        </g>

        {/* PIANO 4 — pulviscolo nella luce della lampada (1,5) e velo vicino (1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 900, x0: 940, x1: 1080 }} bottom={{ y: 1400, x0: 840, x1: 1160 }} seed={9} n={16} color="#FFE8C0" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="lu-near" t={t} color="#E8C890" n={6} r0={80} r1={160} opacity={0.08} y0={760} />
        </g>
      </g>
      <Finish id="lu" tint={VELATURA} tintOpacity={0.1} />
    </svg>
  );
};
