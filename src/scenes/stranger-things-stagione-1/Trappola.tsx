import React from 'react';
import { camera, eo, lerp, seg } from '../../lib/anim';
import { Embers, Fire, Glow, NearMotes, Smoke, StringLights, flashAt } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { CROMA, K, Ombra, StDefs, VELATURA } from './Comuni';

// Una trappola per il mostro: il soggiorno di casa Byers preparato per la notte. Al centro la tagliola aperta sul
// tappeto, la tanica di benzina, la mazza piena di chiodi, le lucine lungo le pareti. Eventi: prima frase la stanza è
// pronta e silenziosa; seconda frase cadono tre gocce di sangue sul tappeto vicino alla tagliola e le lucine iniziano a
// sfarfallare (il mostro sente il sangue); terza frase la parete si gonfia come una membrana e ne esce un artiglio
// nero, non umano: la tagliola scatta, una fiammata, poi solo fuoco sul tappeto, la parete strappata e vuota (è scappato).
// Piani: parete con la carta da parati, lucine e la membrana (0,3) · pavimento e tappeto (0,5) · tagliola, tanica,
//        poltrona con la mazza (0,72) · coperta e cassapanca in primo piano (1,15) · braci e fumo (1,4) · velo (1,8)

const BX = 540, BY = 900; // centro della membrana sulla parete

export const Trappola: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;

  const drop = (k: number) => griglia(cues[1] + 0.5, 2) + k * CROMA;
  const fl0 = griglia(cues[1] + 1.4), fl1 = griglia(cues[2] + 1.6);
  const flick = t > fl0 && t < fl1 ? 0.55 + 0.45 * Math.abs(Math.sin(t * 7.5)) : 1;
  const tBulge = griglia(cues[2] + 0.1);
  const bulge = eo(seg(t, tBulge, tBulge + 0.9));
  const tFire = griglia(cues[2] + 1.5);
  const fired = seg(t, tFire, tFire + 0.05);
  const flash = flashAt(t, [tFire], [1]);
  const claw = eo(seg(t, tBulge + 0.6, tBulge + 1.1)) * (1 - eo(seg(t, tFire + 0.1, tFire + 0.5)));
  const torn = seg(t, tFire, tFire + 0.3);
  const swell = bulge * (1 - 0.6 * torn);
  const fire = eo(seg(t, tFire, tFire + 0.3)) * (1 - 0.35 * seg(t, tFire + 1.2, dur));
  const jaws = t < tFire ? 0 : eo(seg(t, tFire, tFire + 0.08));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="tr" />
        <StDefs id="tr" />
        <Lin id="tr-wall" stops={[[0, '#1A1612'], [0.35, '#342A1E'], [0.7, '#463826'], [1, '#2A2016']]} />
        <pattern id="tr-paper" width="120" height="140" patternUnits="userSpaceOnUse">
          <path d="M60 0 V140" stroke="#5A4A32" strokeWidth="3" opacity=".35" />
          <g transform="translate(30 40)" opacity=".38"><circle r="9" fill="#7A4A30" /><circle cx="-10" cy="8" r="6" fill="#5A6A3A" /><circle cx="10" cy="8" r="6" fill="#5A6A3A" /></g>
          <g transform="translate(90 110)" opacity=".38"><circle r="9" fill="#7A4A30" /><circle cx="-10" cy="8" r="6" fill="#5A6A3A" /><circle cx="10" cy="8" r="6" fill="#5A6A3A" /></g>
        </pattern>
        <radialGradient id="tr-membrane" cx=".5" cy=".45" r=".55">
          <stop offset="0" stopColor="#6A4A3A" /><stop offset=".55" stopColor="#4A3426" /><stop offset="1" stopColor="#342A1E" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="tr-hole" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#020306" /><stop offset=".7" stopColor="#0A1420" /><stop offset="1" stopColor="#1A2A3A" stopOpacity="0" /></radialGradient>
        <Lin id="tr-floor" stops={[[0, '#3A2A1C'], [1, '#0E0A06']]} />
        <Lin id="tr-steel" x2={1} y2={0} stops={[[0, '#4A5058'], [0.4, '#B8C0C8'], [0.6, '#7A828A'], [1, '#3A4048']]} />
        <Lin id="tr-can" x2={1} y2={0} stops={[[0, '#7A1C18'], [0.4, '#C8342A'], [1, '#5A1410']]} />
        <Lin id="tr-chair" x2={1} y2={0} stops={[[0, '#3A4A2A'], [0.5, '#5A6A3E'], [1, '#2A3420']]} />
      </defs>

      <g transform={`${cam.transform} translate(${flash * 6 * Math.sin(t * 60)} 0)`}>
        {/* PIANO 0 — parete con carta da parati, lucine, la membrana che si gonfia (0,3) */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="1360" fill="url(#tr-wall)" />
          <rect x="-200" y="-200" width="1480" height="1360" fill="url(#tr-paper)" />
          {/* vano della porta del corridoio, buio */}
          <rect x="830" y="700" width="170" height="420" fill="#0A0806" stroke={K} strokeWidth="9" />
          <path d="M820 694 H1010" stroke="#5A3E26" strokeWidth="14" />
          {/* la parete che si gonfia: membrana con vene, poi lo strappo vuoto */}
          <ellipse cx={BX} cy={BY} rx={180 + 50 * swell} ry={150 + 40 * swell} fill="url(#tr-membrane)" opacity={swell} />
          {Array.from({ length: 7 }, (_, k) => {
            const a = (k / 7) * Math.PI * 2;
            return <path key={k} d={`M${BX + Math.cos(a) * 30} ${BY + Math.sin(a) * 26} Q${BX + Math.cos(a + 0.3) * 110} ${BY + Math.sin(a + 0.3) * 90} ${BX + Math.cos(a) * (170 + 40 * swell)} ${BY + Math.sin(a) * (140 + 34 * swell)}`} stroke="#8A4A4A" strokeWidth="4" fill="none" opacity={0.8 * swell} />;
          })}
          <path d={`M${BX - 140} ${BY - 70} Q${BX} ${BY - 150 - 40 * swell} ${BX + 140} ${BY - 70}`} stroke="#C89A7A" strokeWidth="4" fill="none" opacity={0.6 * swell} />
          <g opacity={torn}>
            {(() => {
              const pts = Array.from({ length: 22 }, (_, i) => {
                const a = (i / 22) * Math.PI * 2, rr = (i % 2 ? 0.62 : 1) * (1 + 0.18 * Math.sin(i * 2.7));
                return `${(BX + Math.cos(a) * 130 * rr).toFixed(0)} ${(BY + Math.sin(a) * 110 * rr).toFixed(0)}`;
              });
              return <path d={`M${pts.join(' L')} Z`} fill="url(#tr-hole)" stroke={K} strokeWidth="7" strokeLinejoin="miter" />;
            })()}
            {[[-120, -30, 18], [-70, 70, -10], [10, 96, 6], [90, 60, 14], [120, -50, -16]].map(([dx, dy, a], i) => (
              <path key={i} d={`M${BX + dx - 18} ${BY + dy} l36 0 l-6 ${50 + i * 8} l-12 -14 l-10 18 Z`} fill="#4A3A2A" stroke={K} strokeWidth="4" transform={`rotate(${a} ${BX + dx} ${BY + dy})`} />
            ))}
          </g>
          {/* artiglio nero non umano: tre lame ricurve che spingono dalla membrana */}
          <g opacity={claw} transform={`translate(${BX} ${BY}) scale(${0.6 + 0.4 * claw})`}>
            {[-40, 0, 40].map((dx, i) => (
              <path key={i} d={`M${dx - 14} 30 Q${dx - 20} -40 ${dx + (i - 1) * 20} -120 Q${dx + 6} -50 ${dx + 14} 30 Z`} fill="#0C0A0E" stroke="#3A2A34" strokeWidth="4" />
            ))}
            <path d="M-70 40 Q0 10 70 40 Q0 70 -70 40 Z" fill="#1A1218" />
          </g>
          {/* lucine lungo la parete: due file */}
          <g opacity={flick}>
            <StringLights id="tr-sl1" t={t} from={{ x: -150, y: 700 }} to={{ x: 810, y: 700 }} n={14} sag={40} r={8} wire="#1A2A1A" />
            <StringLights id="tr-sl2" t={t + 3} from={{ x: -150, y: 1090 }} to={{ x: 810, y: 1090 }} n={14} sag={30} r={8} wire="#1A2A1A" />
          </g>
          <path d="M-200 1150 H1280" stroke="#2A1C10" strokeWidth="20" />
        </g>

        {/* PIANO 1 — pavimento di legno e tappeto (0,5) */}
        <g transform={L(0.5)}>
          <path d="M-200 1160 H1280 V2200 H-200 Z" fill="url(#tr-floor)" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-200 + i * 140} 1160 L${-700 + i * 260} 2200`} stroke="#000" strokeWidth="3" opacity=".35" />)}
          <ellipse cx="540" cy="1230" rx="440" ry="70" fill="#5A2A22" stroke={K} strokeWidth="6" />
          <ellipse cx="540" cy="1230" rx="380" ry="54" fill="none" stroke="#C88A4A" strokeWidth="4" opacity=".5" />
          <ellipse cx="540" cy="1232" rx="300" ry="40" fill="#1A0E0A" opacity={0.6 * torn} />
        </g>

        {/* PIANO 2 — tagliola, gocce di sangue, tanica di benzina, poltrona con la mazza chiodata (0,72) */}
        <g transform={L(0.72)}>
          {/* poltrona a sinistra con la mazza appoggiata */}
          <path d="M-60 1000 Q-60 950 0 950 H180 Q230 950 230 1000 V1250 H-60 Z" fill="url(#tr-chair)" stroke={K} strokeWidth="9" />
          <path d="M-40 1100 H220 V1250 H-40 Z" fill="#4A5A34" stroke={K} strokeWidth="7" />
          <g transform="translate(250 1250) rotate(-24)">
            <rect x="-10" y="-300" width="22" height="300" rx="8" fill="#B88A50" stroke={K} strokeWidth="6" />
            <path d="M-4 -296 V-10" stroke="#E8C890" strokeWidth="3" opacity=".6" />
            {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${i % 2 ? -10 : 12} ${-290 + i * 18} l${i % 2 ? -18 : 18} -4`} stroke="#C8D0D8" strokeWidth="4" strokeLinecap="round" />)}
          </g>
          {/* tanica di benzina a destra */}
          <Ombra id="tr" x={860} y={1250} rx={90} ry={12} />
          <path d="M790 1100 H930 V1246 H790 Z" fill="url(#tr-can)" stroke={K} strokeWidth="8" />
          <path d="M810 1100 Q860 1060 910 1100" stroke={K} strokeWidth="12" fill="none" />
          <path d="M900 1100 l20 -40 h16 l-6 40" fill="#C8342A" stroke={K} strokeWidth="6" />
          <path d="M810 1140 L910 1220 M910 1140 L810 1220" stroke="#5A1410" strokeWidth="6" />
          <path d="M798 1110 V1236" stroke="#F08A7A" strokeWidth="4" opacity=".5" />
          {/* la tagliola aperta, ancorata con la catena */}
          <Ombra id="tr" x={540} y={1236} rx={170} ry={16} />
          <path d="M680 1236 q30 10 60 0 q30 -10 60 0" stroke="#5A6068" strokeWidth="8" fill="none" strokeDasharray="14 6" />
          <ellipse cx="540" cy="1226" rx="150" ry="26" fill="none" stroke="url(#tr-steel)" strokeWidth="12" />
          <ellipse cx="540" cy="1226" rx="150" ry="26" fill="none" stroke={K} strokeWidth="2" />
          <rect x="510" y="1214" width="60" height="18" fill="#7A828A" stroke={K} strokeWidth="4" />
          {/* aperta: ganasce stese a terra con i denti all'insù; chiusa: due archi che si alzano e si incastrano */}
          {jaws < 0.5 ? (
            <g>
              {Array.from({ length: 22 }, (_, i) => {
                const a = (i / 22) * Math.PI * 2, x = 540 + Math.cos(a) * 140, y = 1226 + Math.sin(a) * 22;
                return <path key={i} d={`M${x - 7} ${y} L${x} ${y - 20} L${x + 7} ${y} Z`} fill="#D8E0E8" stroke={K} strokeWidth="3" strokeLinejoin="round" />;
              })}
              <path d="M390 1226 h-30 M690 1226 h30" stroke="url(#tr-steel)" strokeWidth="14" strokeLinecap="round" />
            </g>
          ) : (
            <g transform={`translate(540 1226) scale(1 ${jaws})`}>
              {[-1, 1].map((side) => (
                <g key={side}>
                  <path d={`M-140 ${side * 4} Q-130 -110 0 -112 Q130 -110 140 ${side * 4}`} fill="none" stroke="url(#tr-steel)" strokeWidth="14" />
                  <path d={`M-140 ${side * 4} Q-130 -110 0 -112 Q130 -110 140 ${side * 4}`} fill="none" stroke={K} strokeWidth="2" />
                </g>
              ))}
              <path d={Array.from({ length: 10 }, (_, i) => `M${-108 + i * 24} ${-92 - Math.sin((i / 9) * Math.PI) * 16} l12 18 l12 -18`).join(' ')} fill="#D8E0E8" stroke={K} strokeWidth="3" />
            </g>
          )}
          {/* gocce di sangue */}
          {[0, 1, 2].map((k) => {
            const a = drop(k), p = seg(t, a - 0.32, a);
            return t > a - 0.32 && p < 1 && (
              <g key={k}>
                <path d={`M${330 + k * 8} ${lerp(700, 1240, p * p) - 20} q-14 20 0 30 q14 -10 0 -30 Z`} fill="#B01E1E" stroke={K} strokeWidth="3" />
              </g>
            );
          })}
          {/* pozza che si allarga sul tappeto, a ogni goccia */}
          {t > drop(0) && (() => {
            const g = Math.min(1, seg(t, drop(0), drop(0) + 0.2) * 0.45 + seg(t, drop(1), drop(1) + 0.2) * 0.3 + seg(t, drop(2), drop(2) + 0.2) * 0.25 + 0.15 * seg(t, drop(2), drop(2) + 2));
            return (
              <g>
                <ellipse cx={338} cy={1250} rx={22 + 40 * g} ry={6 + 10 * g} fill="#8A1414" stroke={K} strokeWidth="3" />
                <ellipse cx={330} cy={1246} rx={8 + 14 * g} ry={2 + 3 * g} fill="#E85A4A" opacity=".7" />
                {[0, 1, 2].map((k) => { const q = seg(t, drop(k), drop(k) + 0.35); return q > 0 && q < 1 && <ellipse key={k} cx={338} cy={1250} rx={10 + 70 * q} ry={3 + 16 * q} fill="none" stroke="#C83A2A" strokeWidth="3" opacity={1 - q} />; })}
              </g>
            );
          })()}
          {/* fuoco sul tappeto dopo la fiammata */}
          {fire > 0 && (
            <g opacity={fire}>
              <Fire id="tr-f1" t={t} x={470} y={1240} scale={0.9 * fire} />
              <Fire id="tr-f2" t={t + 1.3} x={620} y={1244} scale={0.75 * fire} />
            </g>
          )}
        </g>

        {/* PIANO 3 — coperta a sinistra e cassapanca a destra in primo piano (1,15) */}
        <g transform={L(1.15)}>
          <path d="M820 1700 Q900 1560 1080 1580 Q1200 1590 1280 1660 V2200 H820 Z" fill="#3A2A1C" stroke={K} strokeWidth="10" />
          <path d="M840 1690 Q910 1570 1080 1590" stroke="#8A6A48" strokeWidth="5" fill="none" opacity=".5" />
          <path d="M-120 1500 Q120 1440 300 1560 Q380 1640 300 1760 H-120 Z" fill="#2E4A6A" stroke={K} strokeWidth="10" />
          <path d="M-100 1510 Q120 1452 290 1566" stroke="#7A9AC0" strokeWidth="5" fill="none" opacity=".6" />
          {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M${-60 + i * 80} 1530 q20 100 -10 220`} stroke="#1A2A40" strokeWidth="5" fill="none" />)}
        </g>

        {/* lampo della fiammata */}
        <Glow id="tr-flash" x={540} y={1150} r={900} t={t} color="#FFB25C" amp={0} opacity={0.8 * flash} />
        <g transform={L(1.4)}>
          {fired > 0 && <Embers t={t - tFire} x={540} y={1240} w={260} h={560} seed={9} n={24} />}
          {fired > 0 && <Smoke id="tr-smoke" t={t} x={540} y={1150} color="#3A3430" n={8} rise={380} wind={120} r0={50} r1={180} speed={0.25} opacity={0.6 * fire} />}
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="tr-near" t={t} color="#E8C890" n={6} r0={80} r1={160} opacity={0.07} y0={760} />
        </g>
      </g>
      <Finish id="tr" tint={VELATURA} tintOpacity={0.1} />
    </svg>
  );
};
