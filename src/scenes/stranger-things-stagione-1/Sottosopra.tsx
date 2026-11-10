import React from 'react';
import { camera, eo, lerp, rng, seg } from '../../lib/anim';
import { Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { CROMA, GIALLO, K, SOTTO, StDefs, VELATURA } from './Comuni';

// Il mondo capovolto: il tavolo da gioco nello scantinato. Il piano del tavolo fa da specchio: sopra la stanza calda,
// sotto la stessa stanza capovolta, fredda e marcia (il Sottosopra). Eventi: prima frase il tabellone si rovescia e i
// dadi saltano; seconda frase sotto il tavolo si accende il mondo gemello (luce azzurra, radici, spore) e l'ago della
// bussola comincia a girare impazzito; terza frase nel mondo di sotto la parete si gonfia come una membrana (il mostro,
// solo come traccia) e in un angolo si accende piano una lucina calda (Will, nascosto).
// Piani: parete con scaffale e lampada, riflessa sotto (0,3) · tavolo, tabellone, bussola, dadi (0,7)
//        · radici in primo piano nel mondo di sotto (1,15) · spore (1,4) · velo vicino (1,8)

const MIRROR = 1000;
const r = rng(707);
const SPORES = Array.from({ length: 34 }, () => ({ x: -100 + r() * 1280, y: 1020 + r() * 900, s: 3 + r() * 7, v: 6 + r() * 16, ph: r() * 6 }));
const ROOTS = Array.from({ length: 9 }, (_, i) => ({ x: -60 + i * 140 + r() * 60, len: 160 + r() * 260, bend: (r() - 0.5) * 120, w: 10 + r() * 14 }));
/** Viticci che salgono dal bordo basso (il pavimento capovolto del Sottosopra). */
const VINES = Array.from({ length: 8 }, (_, i) => ({ x: -40 + i * 160 + r() * 60, h: 260 + r() * 260, bend: (r() - 0.5) * 160, w: 16 + r() * 18 }));
const BIG = Array.from({ length: 8 }, () => ({ x: r() * 1200 - 60, y: 1500 + r() * 400, s: 14 + r() * 14, ph: r() * 6 }));

export const Sottosopra: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;

  const tFlip = griglia(cues[0] + 2.5);
  const flip = eo(seg(t, tFlip, tFlip + 0.5));
  const boardScale = Math.cos(flip * Math.PI);
  const hop = (k: number) => Math.max(0, Math.sin(seg(t, tFlip + 0.25 + k * 0.05, tFlip + 0.75 + k * 0.05) * Math.PI)) * 40;
  const tWorld = griglia(cues[1] + 0.4);
  const world = eo(seg(t, tWorld, tWorld + 1.2));
  const needle = t < tWorld ? -20 : -20 + (t - tWorld) * 900 * (1 - 0.6 * seg(t, tWorld + 1.5, tWorld + 3)) + Math.sin(t * 7) * 20;
  const tBulge = griglia(cues[2] + 0.2);
  const bulge = eo(seg(t, tBulge, tBulge + 0.8)) * (0.85 + 0.15 * Math.sin(t * 3.5));
  const tWill = tBulge + 4 * CROMA;
  const will = eo(seg(t, tWill, tWill + 0.6)) * (0.75 + 0.25 * Math.sin(t * 2.6));

  const Stanza = (
    <g>
      <rect x="-200" y="300" width="1480" height="700" fill="url(#ss-wall)" />
      {Array.from({ length: 24 }, (_, i) => <path key={i} d={`M${-200 + i * 62} 300 V1000`} stroke="#0E0A06" strokeWidth="3" opacity=".6" />)}
      {/* scaffale con i giochi */}
      <rect x="100" y="760" width="300" height="14" fill="#5A3E26" stroke={K} strokeWidth="5" />
      {[[108, 54, '#B8352F'], [166, 40, '#2E5A8A'], [210, 60, '#E8C860'], [276, 46, '#4A7A4A'], [326, 34, '#8A4A8A']].map(([x, h, c], i) => (
        <rect key={i} x={x as number} y={760 - (h as number)} width="52" height={h as number} fill={c as string} stroke={K} strokeWidth="4" />
      ))}
      {/* applique a muro */}
      <path d="M790 740 h40 l14 -60 h-68 Z" fill="#E8D8A8" stroke={K} strokeWidth="6" />
      <rect x="802" y="740" width="16" height="30" fill="#5A5048" stroke={K} strokeWidth="4" />
      {/* orologio da parete */}
      <circle cx="560" cy="760" r="44" fill="#E8E2D2" stroke={K} strokeWidth="7" />
      <path d="M560 760 V730 M560 760 L582 772" stroke={K} strokeWidth="5" strokeLinecap="round" />
      <path d="M-200 990 H1280" stroke="#120C08" strokeWidth="14" />
    </g>
  );

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ss" />
        <StDefs id="ss" />
        <Lin id="ss-wall" stops={[[0, '#120E0A'], [0.4, '#2E2216'], [1, '#4A3620']]} />
        <Lin id="ss-cold" stops={[[0, '#0E2236', 0.4], [0.35, '#081626', 0.62], [1, '#020408', 0.92]]} />
        <Lin id="ss-tabletop" stops={[[0, '#8A6440'], [1, '#5A3E26']]} />
        <Lin id="ss-edge" x2={1} y2={0} stops={[[0, '#3A2818'], [0.5, '#7A5432'], [1, '#2A1C10']]} />
        <radialGradient id="ss-spore"><stop offset="0" stopColor="#E8F4FA" stopOpacity=".95" /><stop offset="1" stopColor="#E8F4FA" stopOpacity="0" /></radialGradient>
        <radialGradient id="ss-bulge" cx=".5" cy=".45" r=".55"><stop offset="0" stopColor="#4A2A38" /><stop offset=".6" stopColor="#2A1824" /><stop offset="1" stopColor="#120A12" stopOpacity="0" /></radialGradient>
        <pattern id="ss-board" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill="#2E6A4A" />
          <rect width="30" height="30" fill="#3A7A56" /><rect x="30" y="30" width="30" height="30" fill="#3A7A56" />
          <path d="M0 0 H60 V60" stroke="#1E4A34" strokeWidth="2" fill="none" />
        </pattern>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — la stanza sopra e il suo doppio capovolto sotto (0,3) */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="520" fill="#120E0A" />
          {Stanza}
          <Glow id="ss-lamp" x={810} y={720} r={320} t={t} color="#FFC870" amp={0.04} rate={2} opacity={0.5} />
          {/* il mondo gemello: stessa stanza ribaltata, buia, con luce fredda */}
          <g transform={`translate(0 ${2 * MIRROR}) scale(1 -1)`}>{Stanza}</g>
          <rect x="-200" y={MIRROR} width="1480" height="1000" fill="url(#ss-cold)" />
          <rect x="-200" y={MIRROR} width="1480" height="1000" fill="#000" opacity={0.75 * (1 - world)} />
          <Glow id="ss-coldglow" x={810} y={1280} r={420} t={t} color={SOTTO} amp={0.05} rate={1.2} opacity={0.55 * world} />
          {/* la parete di sotto si gonfia come una membrana: il mostro, solo come traccia */}
          <g opacity={bulge}>
            <ellipse cx="300" cy={1140} rx={150 + 20 * bulge} ry={90 + 14 * bulge} fill="url(#ss-bulge)" />
            {[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M${300 + Math.cos(k * 1.3) * 40} ${1140 + Math.sin(k * 1.3) * 20} q${Math.cos(k * 1.3) * 70} ${Math.sin(k * 1.3) * 40} ${Math.cos(k * 1.3 + 0.3) * 140} ${Math.sin(k * 1.3 + 0.3) * 80}`} stroke="#6A3A4A" strokeWidth="4" fill="none" />)}
            <path d="M200 1110 Q300 1060 400 1110" stroke="#8A5A6A" strokeWidth="3" fill="none" opacity=".7" />
          </g>
          {/* la lucina calda di Will, nascosto in un angolo del mondo di sotto */}
          <Glow id="ss-will" x={900} y={1160} r={120} t={t} color={GIALLO} amp={0.1} rate={2.6} opacity={0.9 * will} />
          <path d="M890 1150 Q886 1170 900 1176 Q914 1170 910 1150 Z" fill={will > 0.1 ? GIALLO : '#3A3A30'} stroke={K} strokeWidth="3" opacity={0.4 + 0.6 * will} />
          <path d="M900 1150 V1100 Q930 1090 960 1110" stroke="#1A2A1A" strokeWidth="4" fill="none" />
        </g>

        {/* PIANO 1 — il tavolo da gioco: piano di legno, tabellone che si ribalta, dadi, bussola (0,7) */}
        <g transform={`${L(0.7)} translate(540 1000) scale(1.12) translate(-540 -1000)`}>
          <path d="M60 940 H1020 L1060 990 H20 Z" fill="url(#ss-tabletop)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M70 944 H1010" stroke="#D8B080" strokeWidth="3" opacity=".6" />
          <rect x="10" y="990" width="1060" height="26" fill="url(#ss-edge)" stroke={K} strokeWidth="7" />
          {/* gambe: sopra e riflesse sotto */}
          {[80, 1000].map((x) => <rect key={x} x={x - 14} y="1016" width="28" height="260" fill="#3A2818" stroke={K} strokeWidth="5" opacity=".9" />)}
          {/* tabellone che gira sul suo asse lungo */}
          <g transform={`translate(540 950) scale(1 ${boardScale})`}>
            <path d="M-220 -32 H220 L240 26 H-240 Z" fill={boardScale > 0 ? 'url(#ss-board)' : '#1A1E2A'} stroke={K} strokeWidth="7" strokeLinejoin="round" />
            {boardScale > 0 ? (
              <g>
                <path d="M-140 -10 Q-60 -30 20 -6 Q100 16 170 -12" stroke="#E8C860" strokeWidth="6" fill="none" strokeDasharray="14 10" />
                <circle cx="-150" cy="-8" r="12" fill="#B8352F" stroke={K} strokeWidth="4" />
                <path d="M170 -24 l12 -8 l12 8 v16 h-24 Z" fill="#8A8A9A" stroke={K} strokeWidth="4" />
              </g>
            ) : (
              <path d="M-200 -14 L200 14 M-200 14 L200 -14" stroke="#3A4258" strokeWidth="4" />
            )}
          </g>
          {/* dadi che saltano */}
          <path d={`M300 ${930 - hop(0)} l20 -18 l22 8 l-4 26 l-22 6 Z`} fill="#E8E2D2" stroke={K} strokeWidth="5" strokeLinejoin="round" />
          <path d={`M360 ${936 - hop(1)} l16 -26 l18 26 l-18 10 Z`} fill="#B8352F" stroke={K} strokeWidth="5" strokeLinejoin="round" />
          <path d={`M780 ${934 - hop(2)} l22 -14 l22 14 l-22 14 Z`} fill="#4A7AB8" stroke={K} strokeWidth="5" strokeLinejoin="round" />
          {/* dado a venti facce grande e torre del castello */}
          <g transform={`translate(176 ${928 - hop(3)})`}>
            <path d="M0 -40 L34 -20 L34 20 L0 40 L-34 20 L-34 -20 Z" fill="#7A4AB8" stroke={K} strokeWidth="5" strokeLinejoin="round" />
            <path d="M0 -40 L-20 8 L20 8 Z M-34 -20 L-20 8 M34 -20 L20 8 M-20 8 L0 40 L20 8 M-34 20 L-20 8 M34 20 L20 8" fill="none" stroke={K} strokeWidth="3" />
            <path d="M-4 -30 L4 -30" stroke="#C8A8F0" strokeWidth="3" />
            <text x="0" y="0" textAnchor="middle" fontFamily="Figtree, sans-serif" fontWeight="800" fontSize="16" fill="#F2E3C6">20</text>
          </g>
          <path d="M860 936 V880 h12 v-10 h12 v10 h12 v-10 h12 v10 h12 v56 Z" fill="#9A9A9A" stroke={K} strokeWidth="5" />
          {/* bussola con l'ago che impazzisce */}
          <g transform="translate(680 922)">
            <ellipse cx="0" cy="10" rx="56" ry="18" fill="#000" opacity=".35" />
            <ellipse cx="0" cy="0" rx="54" ry="22" fill="#C8A060" stroke={K} strokeWidth="6" />
            <ellipse cx="0" cy="-2" rx="44" ry="16" fill="#F2EEE0" stroke={K} strokeWidth="3" />
            <g transform={`scale(1 0.36) rotate(${needle})`}>
              <path d="M0 -38 L7 0 L0 6 L-7 0 Z" fill="#B8352F" stroke={K} strokeWidth="2" />
              <path d="M0 38 L7 0 L-7 0 Z" fill="#3A4048" stroke={K} strokeWidth="2" />
            </g>
            <circle cx="0" cy="-2" r="3.5" fill={K} />
          </g>
          {/* fogli dei personaggi e matita */}
          <path d="M880 960 l70 -6 l8 24 l-70 6 Z" fill="#F2EEE0" stroke={K} strokeWidth="4" />
          <path d="M890 966 h50 M892 974 h40" stroke="#8A8A8A" strokeWidth="2" />
          <Glow id="ss-tablewarm" x={540} y={930} r={420} t={t} color="#FFC870" amp={0.03} rate={2} opacity={0.18} />
        </g>

        {/* PIANO 2 — radici e filamenti che pendono nel mondo di sotto (1,15) */}
        <g transform={L(1.15)} opacity={0.3 + 0.7 * world}>
          {ROOTS.map((rt, i) => {
            const sway = Math.sin(t * 0.8 + i) * 8;
            return (
              <g key={i}>
                <path d={`M${rt.x} 1030 Q${rt.x + rt.bend + sway} ${1030 + rt.len * 0.6} ${rt.x + rt.bend * 0.6} ${1030 + rt.len}`} stroke="#0A0E14" strokeWidth={rt.w * 0.7 + 6} fill="none" strokeLinecap="round" />
                <path d={`M${rt.x} 1030 Q${rt.x + rt.bend + sway} ${1030 + rt.len * 0.6} ${rt.x + rt.bend * 0.6} ${1030 + rt.len}`} stroke="#222C3E" strokeWidth={rt.w * 0.7} fill="none" strokeLinecap="round" />
                <path d={`M${rt.x - 3} 1040 Q${rt.x + rt.bend + sway - 3} ${1030 + rt.len * 0.6} ${rt.x + rt.bend * 0.6 - 3} ${1020 + rt.len}`} stroke="#6A8AB0" strokeWidth="2.5" fill="none" opacity=".5" />
                {[0.35, 0.6, 0.85].map((q, k) => {
                  const px = rt.x + (rt.bend + sway) * q * 1.1, py = 1030 + rt.len * q, dir = (i + k) % 2 ? 1 : -1;
                  return <path key={k} d={`M${px} ${py} q${dir * 30} ${10 + k * 6} ${dir * 50} ${40 + k * 10} q${dir * 6} 16 ${-dir * 4} 30`} stroke="#2A3448" strokeWidth={Math.max(3, rt.w * 0.4)} fill="none" strokeLinecap="round" />;
                })}
              </g>
            );
          })}
          <path d="M-200 1700 Q200 1640 540 1700 Q860 1760 1280 1680 V2200 H-200 Z" fill="#0A1018" stroke={K} strokeWidth="8" />
          <path d="M-200 1706 Q200 1646 540 1706 Q860 1766 1280 1686" stroke="#3A5A7A" strokeWidth="4" fill="none" opacity=".6" />
          {VINES.map((v, i) => {
            const sway = Math.sin(t * 0.7 + i * 1.3) * 10;
            const d = `M${v.x} 1960 Q${v.x + v.bend * 0.5 + sway} ${1960 - v.h * 0.6} ${v.x + v.bend + sway} ${1960 - v.h}`;
            return (
              <g key={i}>
                <path d={d} stroke="#0A0E14" strokeWidth={v.w + 8} fill="none" strokeLinecap="round" />
                <path d={d} stroke="#222C3E" strokeWidth={v.w} fill="none" strokeLinecap="round" />
                <path d={`M${v.x + v.bend * 0.3 + sway} ${1960 - v.h * 0.45} q${(i % 2 ? 1 : -1) * 40} -20 ${(i % 2 ? 1 : -1) * 60} -70`} stroke="#222C3E" strokeWidth={v.w * 0.45} fill="none" strokeLinecap="round" />
                <path d={d} stroke="#6A8AB0" strokeWidth="2.5" fill="none" opacity=".45" transform="translate(-4 0)" />
              </g>
            );
          })}
        </g>

        {/* PIANO 3 — spore che fluttuano verso l'alto nel mondo di sotto (1,4) */}
        <g transform={L(1.4)} opacity={world}>
          {SPORES.map((sp, i) => {
            const y = 1020 + ((sp.y - 1020 - t * sp.v) % 900 + 900) % 900;
            return <circle key={i} cx={sp.x + Math.sin(t * 0.7 + sp.ph) * 16} cy={y} r={sp.s} fill="url(#ss-spore)" opacity={0.75 * seg(y, 1020, 1080)} />;
          })}
        </g>
        <g transform={L(1.6)} opacity={world}>
          {BIG.map((b, i) => <circle key={i} cx={b.x + Math.sin(t * 0.5 + b.ph) * 20} cy={b.y - ((t * 14 + i * 40) % 220)} r={b.s} fill="url(#ss-spore)" opacity=".55" />)}
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="ss-near" t={t} color={SOTTO} n={6} r0={90} r1={170} opacity={0.08 * world} y0={1040} />
        </g>
        {/* filo luminoso del confine tra i due mondi */}
        <path d={`M-200 ${MIRROR + 16} H1280`} stroke={SOTTO} strokeWidth="3" opacity={0.35 * world * (0.7 + 0.3 * Math.sin(t * 2))} transform={L(0.7)} />
      </g>
      <Finish id="ss" tint={VELATURA} tintOpacity={0.12} />
    </svg>
  );
};
