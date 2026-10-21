import React from 'react';
import { camera, eo, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes, Notes, Wisps } from '../../lib/elements';
import { HAND } from '../../lib/fonts';
import type { SceneProps } from '../../types';

// Il provino: sala provini di giorno, sgabello sotto la luce su una X di nastro; arriva una cartolina di Parigi.
// Piani: parete, finestra con colline e palme (0,25) · pavimento, macchia di sole, X di nastro (0,45)
//        · pianoforte verticale, sgabello e ombra lunga (0,6) · cartolina (0,85) · tavolo della giuria (1,25) · pulviscolo (1,7)
// Eventi: cues[3] la luce si fa più intensa e salgono le note · cues[4] entra la cartolina di Parigi.

const K = '#1B1530';
const FLOOR = 1080;
const STOOL = { x: 400, y: 1180 };
const WIN = { x: 640, y: 560, w: 300, h: 420 };
const r = rng(8123);
const PALMS = Array.from({ length: 3 }, (_, i) => ({ x: WIN.x + 50 + i * 100 + r() * 30, h: 160 + r() * 90, ph: r() * 6 }));

const palm = (x: number, h: number, t: number, ph: number) => {
  const top = { x: x + Math.sin(t * 0.8 + ph) * 6, y: WIN.y + WIN.h - h };
  const leaves = [-150, -110, -60, -20, 20].map((a) => {
    const rad = ((a + Math.sin(t * 1.2 + ph) * 6) * Math.PI) / 180;
    const lx = top.x + Math.cos(rad) * 60, ly = top.y + Math.sin(rad) * 30 + 26;
    return `M${top.x} ${top.y} Q${(top.x + lx) / 2} ${top.y - 22} ${lx} ${ly}`;
  });
  return { trunk: `M${x} ${WIN.y + WIN.h} Q${x + 6} ${top.y + h / 2} ${top.x} ${top.y}`, leaves: leaves.join(' ') };
};

export const Audizione: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c3 = cues[3] ?? 7.4, c4 = cues[4] ?? 9.7;

  const sing = eo(seg(t, c3, c3 + 1.2));
  const light = 0.7 + 0.3 * sing + 0.04 * Math.sin(t * 1.3);

  // cartolina: entra da destra girando su se stessa, poi oscilla piano
  const pc = eo(seg(t, c4 - 0.2, c4 + 1.1));
  const pcX = lerp(1320, 700, pc);
  const pcY = lerp(620, 800, pc) + Math.sin(t * 1.7) * 8 * pc;
  const spin = (1 - pc) * 3 * Math.PI + 0.35 * Math.sin(t * 1.5);
  const sx = Math.cos(spin);
  const pcRot = lerp(-34, -7, pc) + Math.sin(t * 1.1) * 2;
  const landed = seg(t, c4 + 0.8, c4 + 1.3);

  const secA = Math.floor(t) * 6;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="au" />
        <Lin id="au-wall" stops={[[0, '#D9C8AE'], [0.3, '#EFE3CF'], [0.6, '#F3EADB'], [1, '#D8C4A6']]} />
        <Lin id="au-sky" stops={[[0, '#A9D3E8'], [0.55, '#E9EEDC'], [1, '#FFE3A6']]} />
        <Lin id="au-hill" stops={[[0, '#B7A2C8'], [1, '#8E7AAE']]} />
        <Lin id="au-floor" stops={[[0, '#B8875A'], [0.4, '#9A6C45'], [1, '#5E3E26']]} />
        <Lin id="au-shaft" x2={-0.6} y2={1} stops={[[0, '#FFF1C4', 0.55], [0.6, '#FFE7A0', 0.18], [1, '#FFE7A0', 0]]} />
        <Lin id="au-piano" x2={1} y2={0} stops={[[0, '#2A1F3E'], [0.5, '#45366A'], [1, '#221A34']]} />
        <Lin id="au-wood" x2={1} y2={0} stops={[[0, '#7A4E2C'], [0.5, '#B07A48'], [1, '#6A4226']]} />
        <Lin id="au-table" stops={[[0, '#6B4FA0'], [1, '#3A2A62']]} />
        <Lin id="au-card" stops={[[0, '#F6D58A'], [0.6, '#F2C14E'], [1, '#E8A23A']]} />
        <clipPath id="au-winclip"><rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} /></clipPath>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete calda, finestra, orologio */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height={FLOOR + 220} fill="url(#au-wall)" />
          <path d="M-200 1000 H1280" stroke="#C4AE8C" strokeWidth="6" />
          <rect x="-200" y="1000" width="1480" height="80" fill="#E2D2B8" />
          {/* finestra con colline, palme e sole */}
          <g clipPath="url(#au-winclip)">
            <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} fill="url(#au-sky)" />
            <Glow id="au-sun" x={WIN.x + 230} y={WIN.y + 90} r={170} t={t} color="#FFF4C8" amp={0.05} rate={1.2} opacity={0.9} />
            <path d={`M${WIN.x} ${WIN.y + 300} Q${WIN.x + 90} ${WIN.y + 240} ${WIN.x + 170} ${WIN.y + 290} T${WIN.x + 320} ${WIN.y + 270} V${WIN.y + WIN.h} H${WIN.x} Z`} fill="url(#au-hill)" />
            <path d={`M${WIN.x} ${WIN.y + 360} H${WIN.x + WIN.w} V${WIN.y + WIN.h} H${WIN.x} Z`} fill="#7B6A96" />
            {PALMS.map((p, i) => {
              const g = palm(p.x, p.h, t, p.ph);
              return (
                <g key={i} fill="none" stroke="#4A3C66" strokeLinecap="round">
                  <path d={g.trunk} strokeWidth="7" />
                  <path d={g.leaves} strokeWidth="9" />
                </g>
              );
            })}
          </g>
          <rect x={WIN.x - 16} y={WIN.y - 16} width={WIN.w + 32} height={WIN.h + 32} fill="none" stroke="#F6F1E9" strokeWidth="20" />
          <rect x={WIN.x - 26} y={WIN.y - 26} width={WIN.w + 52} height={WIN.h + 52} fill="none" stroke={K} strokeWidth="8" />
          <path d={`M${WIN.x + WIN.w / 2} ${WIN.y} V${WIN.y + WIN.h} M${WIN.x} ${WIN.y + 200} H${WIN.x + WIN.w}`} stroke="#F6F1E9" strokeWidth="12" />
          <path d={`M${WIN.x + WIN.w / 2} ${WIN.y} V${WIN.y + WIN.h} M${WIN.x} ${WIN.y + 200} H${WIN.x + WIN.w}`} stroke={K} strokeWidth="3" opacity=".4" />
          <rect x={WIN.x - 40} y={WIN.y + WIN.h + 18} width={WIN.w + 80} height="24" fill="#F6F1E9" stroke={K} strokeWidth="7" />
          {/* termosifone */}
          <rect x={WIN.x + 20} y={WIN.y + WIN.h + 70} width={WIN.w - 40} height="70" rx="8" fill="#E8DCC6" stroke={K} strokeWidth="6" />
          <path d={Array.from({ length: 8 }, (_, i) => `M${WIN.x + 50 + i * 30} ${WIN.y + WIN.h + 80} v50`).join(' ')} stroke="#B8A486" strokeWidth="5" />
          {/* orologio da parete */}
          <g transform="translate(200 650)">
            <circle r="62" fill="#F6F1E9" stroke={K} strokeWidth="9" />
            {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 -50 V-40" stroke={K} strokeWidth="5" transform={`rotate(${i * 30})`} />)}
            <path d="M0 0 L0 -30" stroke={K} strokeWidth="7" strokeLinecap="round" transform="rotate(300)" />
            <path d="M0 0 L0 -44" stroke={K} strokeWidth="5" strokeLinecap="round" transform="rotate(60)" />
            <path d="M0 8 L0 -46" stroke="#A8283A" strokeWidth="3" strokeLinecap="round" transform={`rotate(${secA})`} />
            <circle r="6" fill={K} />
          </g>
        </g>

        {/* PIANO 1 — pavimento, macchia di sole, X di nastro */}
        <g transform={L(0.45)}>
          <rect x="-200" y={FLOOR} width="1480" height="1100" fill="url(#au-floor)" />
          <path d={`M-200 ${FLOOR} H1280`} stroke={K} strokeWidth="8" />
          <g stroke="#5E3E26" strokeWidth="4" opacity=".55">
            {[1130, 1200, 1300, 1440, 1620, 1860].map((y) => <path key={y} d={`M-200 ${y} H1280`} />)}
            {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-60 + i * 110} ${FLOOR} L${-400 + i * 180} 2000`} />)}
          </g>
          <path d="M300 1110 L640 1110 L560 1290 L150 1290 Z" fill="#FFE7A0" opacity={0.28 * light} />
          {/* X di nastro sotto lo sgabello */}
          <g stroke="#F6F1E9" strokeWidth="16" strokeLinecap="butt" opacity=".92">
            <path d={`M${STOOL.x - 90} ${STOOL.y - 28} L${STOOL.x + 90} ${STOOL.y + 28} M${STOOL.x + 90} ${STOOL.y - 28} L${STOOL.x - 90} ${STOOL.y + 28}`} />
          </g>
          <path d={`M${STOOL.x - 90} ${STOOL.y - 28} L${STOOL.x + 90} ${STOOL.y + 28}`} stroke="#CFC2A8" strokeWidth="4" opacity=".7" />
        </g>

        {/* fascio di sole dalla finestra */}
        <g transform={L(0.4)}>
          <path d={`M${WIN.x} ${WIN.y + 40} L${WIN.x + WIN.w} ${WIN.y + 20} L560 1290 L150 1290 Z`} fill="url(#au-shaft)" opacity={0.75 * light} />
          <Dust t={t} top={{ y: WIN.y + 80, x0: WIN.x + 20, x1: WIN.x + WIN.w - 20 }} bottom={{ y: 1270, x0: 170, x1: 550 }} n={32} color="#FFF8E0" boost={0.25 * sing} />
        </g>

        {/* PIANO 2 — pianoforte verticale, leggio, sgabello con ombra lunga */}
        <g transform={L(0.6)}>
          {/* pianoforte verticale a sinistra */}
          <g transform="translate(-40 0)">
            <rect x="0" y="790" width="300" height="300" rx="10" fill="url(#au-piano)" stroke={K} strokeWidth="9" />
            <rect x="-10" y="770" width="320" height="34" rx="8" fill="#3A2E58" stroke={K} strokeWidth="8" />
            <rect x="20" y="930" width="280" height="40" fill="#F6F1E9" stroke={K} strokeWidth="6" />
            <path d={Array.from({ length: 13 }, (_, i) => `M${40 + i * 20} 932 v22`).join(' ')} stroke={K} strokeWidth="9" />
            <rect x="60" y="820" width="150" height="90" fill="#F6F1E9" stroke={K} strokeWidth="5" transform="rotate(-4 135 865)" />
            <path d="M80 842 H190 M80 862 H190 M80 882 H170" stroke="#6B4FA0" strokeWidth="3" transform="rotate(-4 135 865)" />
            <path d="M14 800 V1080" stroke="#8E7AAE" strokeWidth="4" opacity=".6" />
            <g transform="translate(250 770)">
              <path d="M-14 0 l6 -40 h16 l6 40 z" fill="#B07A48" stroke={K} strokeWidth="5" />
              <path d="M0 -36 V-6" stroke={K} strokeWidth="4" transform={`rotate(${Math.sin(t * 3.2) * 18} 0 -4)`} />
            </g>
          </g>
          {/* leggio */}
          <g stroke={K} strokeLinecap="round">
            <path d="M800 1150 L830 1090 L860 1150 M830 1090 V930" strokeWidth="7" fill="none" />
            <path d="M760 930 L900 930 L880 860 L780 860 Z" fill="#3A2E58" strokeWidth="6" strokeLinejoin="round" />
            <rect x="790" y="842" width="90" height="70" fill="#F6F1E9" strokeWidth="4" transform="rotate(4 835 877)" />
          </g>
          {/* ombra lunga dello sgabello verso sinistra */}
          <path d={`M${STOOL.x - 40} ${STOOL.y} L${STOOL.x + 40} ${STOOL.y} L${STOOL.x - 300} ${STOOL.y + 140} L${STOOL.x - 380} ${STOOL.y + 130} Z`} fill="#3A2416" opacity={0.35 + 0.15 * sing} />
          {/* sgabello */}
          <g stroke={K} strokeLinecap="round">
            <path d={`M${STOOL.x - 44} 960 L${STOOL.x - 58} ${STOOL.y} M${STOOL.x + 44} 960 L${STOOL.x + 58} ${STOOL.y} M${STOOL.x - 14} 964 L${STOOL.x - 18} ${STOOL.y - 20} M${STOOL.x + 14} 964 L${STOOL.x + 18} ${STOOL.y - 20}`} strokeWidth="13" />
            <path d={`M${STOOL.x - 44} 960 L${STOOL.x - 58} ${STOOL.y} M${STOOL.x + 44} 960 L${STOOL.x + 58} ${STOOL.y}`} stroke="#B07A48" strokeWidth="6" />
            <path d={`M${STOOL.x - 52} 1090 H${STOOL.x + 52}`} strokeWidth="9" />
          </g>
          <ellipse cx={STOOL.x} cy="954" rx="72" ry="20" fill="url(#au-wood)" stroke={K} strokeWidth="9" />
          <path d={`M${STOOL.x - 44} 946 Q${STOOL.x} 936 ${STOOL.x + 44} 946`} stroke="#FFE7C0" strokeWidth="5" fill="none" strokeLinecap="round" opacity={0.5 + 0.4 * light} />
          <Glow id="au-stool" x={STOOL.x} y={960} r={210} t={t} color="#FFF1C4" amp={0.06} rate={1.6} opacity={0.25 + 0.35 * sing} />
          {/* note che salgono quando canta */}
          <g opacity={sing}>
            <Notes t={t} x={STOOL.x + 30} y={920} n={6} rise={360} spread={260} color="#F6F1E9" outline={K} size={0.9} />
          </g>
        </g>

        {/* PIANO 3 — la cartolina di Parigi */}
        <g transform={L(0.85)}>
          {pc > 0 && (
            <g transform={`translate(${pcX} ${pcY}) rotate(${pcRot}) scale(${sx} 1)`}>
              <Glow id="au-pc" x={0} y={0} r={240} t={t} color="#FFE7A0" amp={0.06} rate={2.2} opacity={0.5 * landed} />
              <rect x="-130" y="-88" width="260" height="176" rx="8" fill="#F6F1E9" stroke={K} strokeWidth="8" />
              {sx >= 0 ? (
                <g>
                  <rect x="-114" y="-72" width="228" height="144" rx="4" fill="url(#au-card)" />
                  <Glow id="au-pcsun" x={56} y={-36} r={46} t={t} color="#FFF4C8" amp={0.05} opacity={0.9} />
                  <path d="M-114 52 Q-60 34 0 48 T114 40 V72 H-114 Z" fill="#B7A2C8" />
                  {/* torre Eiffel */}
                  <g stroke={K} strokeLinejoin="round" strokeLinecap="round" fill="none">
                    <path d="M-60 72 Q-30 20 -14 -60 L-10 -70 L-6 -60 Q10 20 40 72" strokeWidth="6" fill="#6B4FA0" />
                    <path d="M-40 30 H20 M-26 -6 H6 M-18 -36 H-2" strokeWidth="5" />
                    <path d="M-26 72 Q-10 50 6 72" strokeWidth="5" fill="#F2C14E" />
                  </g>
                  <text x="66" y="56" textAnchor="middle" fontFamily={HAND} fontSize="34" fill={K}>Paris</text>
                </g>
              ) : (
                <g>
                  <path d="M10 -70 V70" stroke="#C4AE8C" strokeWidth="3" />
                  <path d="M30 -10 H110 M30 20 H110 M30 50 H100 M-110 -40 H-20 M-110 -14 H-30 M-110 12 H-40" stroke="#6B4FA0" strokeWidth="4" strokeLinecap="round" />
                  <rect x="70" y="-74" width="44" height="52" fill="#A8283A" stroke={K} strokeWidth="4" />
                  <circle cx="64" cy="-40" r="26" fill="none" stroke={K} strokeWidth="3" opacity=".6" />
                </g>
              )}
            </g>
          )}
        </g>

        {/* PIANO 4 — tavolo della giuria in primo piano */}
        <g transform={L(1.25)}>
          <rect x="-200" y="1560" width="1480" height="60" fill="#8E7AAE" stroke={K} strokeWidth="10" />
          <path d="M-200 1572 H1280" stroke="#C9B8E0" strokeWidth="5" opacity=".7" />
          <rect x="-200" y="1620" width="1480" height="500" fill="url(#au-table)" stroke={K} strokeWidth="10" />
          {/* copioni */}
          <g transform="translate(260 1540) rotate(-8)">
            <rect x="-120" y="-30" width="240" height="70" rx="4" fill="#F6F1E9" stroke={K} strokeWidth="7" />
            <path d="M-100 -12 H80 M-100 6 H60 M-100 22 H40" stroke="#6B4FA0" strokeWidth="5" strokeLinecap="round" />
          </g>
          <path d="M120 1590 L330 1520" stroke="#E8A23A" strokeWidth="12" strokeLinecap="round" />
          <path d="M120 1590 L330 1520" stroke={K} strokeWidth="3" />
          {/* bottiglia d'acqua */}
          <g transform="translate(700 1560)">
            <path d="M-34 0 V-150 Q-34 -180 -14 -192 V-220 H14 V-192 Q34 -180 34 -150 V0 Z" fill="#CFE6EE" stroke={K} strokeWidth="8" opacity=".9" />
            <path d="M-34 -80 H34" stroke="#8EC2D4" strokeWidth="5" />
            <rect x="-18" y="-238" width="36" height="20" rx="4" fill="#4EA5D9" stroke={K} strokeWidth="6" />
            <path d="M-20 -150 V-20" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity=".7" />
          </g>
          {/* tazza di caffè con vapore */}
          <g transform="translate(900 1560)">
            <Wisps t={t} x={0} y={-100} color="#FFF8E8" n={3} h={170} width={6} opacity={0.7} />
            <path d="M-54 -100 H54 L44 0 H-44 Z" fill="#F6F1E9" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d="M54 -84 q34 4 28 34 q-6 20 -32 18" fill="none" stroke={K} strokeWidth="8" />
            <path d="M-36 -86 V-14" stroke="#FFFFFF" strokeWidth="5" opacity=".8" />
          </g>
        </g>

        {/* PIANO 5 — pulviscolo dorato vicino alla camera */}
        <g transform={L(1.7)}>
          <NearMotes id="au-near" t={t} color="#FFF1C4" opacity={0.13} />
        </g>
      </g>

      <Finish id="au" tint="#F2C14E" tintOpacity={0.12} />
    </svg>
  );
};
