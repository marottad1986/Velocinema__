import React from 'react';
import { camera, eio, lerp, mod, rainPath, seg, wavePath } from '../../lib/anim';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';

// L'uragano: faro nella tempesta con fascio rotante, onde e spruzzi; un cappello vola via dagli scogli.
// Porting della versione "dopo" (reference/prova-qualita-uragano/scene-dopo.js).
// Piani: cielo + lampi (0,2) · nubi (0,25–0,4) · foschia e pioggia lontana (0,5) · isolotto con faro (0,6)
//        · mare su tre fasce (0,7–1,0) · scoglio in primo piano e cappello (1,2–1,3) · pioggia e gocce vicine (1,4–2,0)

const K = '#0B1214';
const LAMP = { x: 540, y: 592 };
// isolotto spostato a destra rispetto all'originale per lasciare libera la zona del titolo
const ISLE_DX = 150;

// pioggia a mattonelle verticali (periodo H): scorre senza salti
const RAIN_H = 700;
const RAIN_FAR = rainPath(22, 5, 70, 22, 1400, RAIN_H);
const RAIN_NEAR = rainPath(12, 17, 150, 46, 1400, RAIN_H);
const Rain: React.FC<{ d: string; y: number; stroke: string; width: number; opacity: number }> = ({ d, y, stroke, width, opacity }) => (
  <g stroke={stroke} strokeWidth={width} strokeLinecap="round" opacity={opacity}>
    {[-1, 0, 1, 2].map((k) => (
      <path key={k} d={d} transform={`translate(-80 ${y + k * RAIN_H})`} />
    ))}
  </g>
);

const SPRAY = Array.from({ length: 22 }, (_, i) => ({ r: 5 + (i % 4) * 3, bx: (i % 2 ? 420 : 720) + ISLE_DX, vx: (((i * 37) % 9) - 4) * 26, vy: 260 + (i % 5) * 40, ph: i * 0.137 }));
const DROPS = Array.from({ length: 7 }, (_, i) => ({ r: 14 + (i % 3) * 8, x: (i * 173) % 1080, ph: i * 0.29 }));

/** Cappello (nero, nastro in accento): base a y 0, larghezza 220. */
const Hat: React.FC<{ accent: string }> = ({ accent }) => (
  <>
    <path d="M-110 0 Q0 -20 110 0 Q80 16 0 18 Q-80 16 -110 0 Z" fill="#0F1820" stroke={K} strokeWidth="5" strokeLinejoin="round" />
    <path d="M-66 -6 L-56 -78 Q0 -100 56 -78 L66 -6 Z" fill="#16222C" stroke={K} strokeWidth="5" strokeLinejoin="round" />
    <path d="M-62 -26 H62" stroke={accent} strokeWidth="14" />
    <path d="M-40 -70 Q0 -88 40 -70" fill="none" stroke="#3E6A75" strokeWidth="5" opacity=".7" />
    <path d="M-100 -2 Q0 -18 100 -2" fill="none" stroke="#4E7C86" strokeWidth="3" opacity=".6" />
  </>
);

export const Uragano: React.FC<SceneProps> = ({ t, dur, palette: P }) => {
  const cam = camera(t, dur);
  const L = cam.layer;

  // Faro: fascio che ruota (scala orizzontale con il coseno) e alone che pulsa al passaggio
  const a = t * 1.0;
  const sweep = Math.cos(a);
  const pulse = Math.abs(sweep);
  // verso sinistra il fascio passerebbe dietro il titolo: lì si attenua
  const leftDim = 0.25 + 0.75 * Math.min(1, Math.max(0, (sweep + 0.2) / 0.4));

  // Due soli lampi (QUALITA §2): a 3,0 s e a 7,2 s
  const flash = seg(t, 3, 3.06) * (1 - seg(t, 3.15, 3.6)) + 0.7 * seg(t, 7.2, 7.26) * (1 - seg(t, 7.35, 7.8));

  // Onde: dondolio verticale comune
  const sw = Math.sin(t * 2.2) * 12;

  // Cappello: trema col vento sempre più forte, poi vola via (5–8 s, «Corre con Chuck sulla scogliera»)
  const fly = eio(seg(t, 5, 8));
  const hatX = lerp(196, 1250, fly);
  const hatY = lerp(1236, 700, fly) - Math.sin(fly * Math.PI) * 220;
  const hatRot = Math.sin(t * 5) * (1 + 4 * seg(t, 1.5, 4.8)) * (1 - seg(t, 4.8, 5)) + fly * 320;
  const hatHop = -Math.abs(Math.sin(t * 7)) * 6 * seg(t, 3.5, 4.8) * (1 - seg(t, 4.8, 5));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ur" />
        <Lin id="ur-sky" stops={[[0, '#081118'], [0.45, '#16303B'], [0.65, '#2A5059'], [1, '#1A3640']]} />
        <GlowGradient id="ur-veil" color="#04090B" core={0.7} mid={0.35} />
        <Lin id="ur-beam" x2={1} y2={0} stops={[[0, '#FFE7A0', 0.75], [1, '#FFE7A0', 0]]} />
        <Lin id="ur-tower" x2={1} y2={0} stops={[[0, '#FFFFFF'], [0.55, '#DCE6E9'], [1, '#8FA4AA']]} />
        <Lin id="ur-sea" stops={[[0, '#2F6B73'], [1, '#0E2730']]} />
        <Lin id="ur-sea2" stops={[[0, '#3E7C87'], [1, '#163A44']]} />
        <Lin id="ur-rock" stops={[[0, '#56706B'], [1, '#22302F']]} />
        <Lin id="ur-front" stops={[[0, '#4A5B58'], [0.5, '#24302F'], [1, '#121A1C']]} />
        <GlowGradient id="ur-glow" color="#FFD98A" />
        <GlowGradient id="ur-mist" color="#9CC3CA" core={1} mid={0.5} />
        <GlowGradient id="ur-cloud" color="#24404C" core={1} mid={0.7} />
        <GlowGradient id="ur-drop" color="#CFE3E8" core={0.8} mid={0.35} />
        <clipPath id="ur-towerclip">
          <path d="M444 1150 L474 644 H606 L636 1150 Z" />
        </clipPath>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo, lampo e saetta (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#ur-sky)" />
          <rect x="-200" y="-200" width="1480" height="2320" fill="#CFE7F0" opacity={flash * 0.45} />
        </g>

        {/* PIANO 1 — nubi gonfie (0,25) e fascia di nubi scure in alto (0,4) */}
        <g transform={L(0.25, Math.sin(t * 0.3) * 40)} opacity=".95">
          <ellipse cx="160" cy="200" rx="380" ry="150" fill="url(#ur-cloud)" />
          <ellipse cx="620" cy="150" rx="420" ry="160" fill="url(#ur-cloud)" />
          <ellipse cx="1000" cy="240" rx="360" ry="140" fill="url(#ur-cloud)" />
        </g>
        <g transform={L(0.4, Math.sin(t * 0.4 + 1) * -30)}>
          <path d="M-200 0 H1280 V380 Q1080 320 900 370 Q720 300 540 360 Q360 310 180 370 Q0 330 -200 370 Z" fill="#13232D" />
          <path d="M-200 370 Q0 330 180 370 Q360 310 540 360 Q720 300 900 370 Q1080 320 1280 380" fill="none" stroke="#3E6A75" strokeWidth="6" opacity={0.6 + flash * 0.4} />
        </g>

        {/* saetta che esce dalle nubi (0,2) */}
        <g transform={L(0.2)} fill="none" stroke="#F4FBFF" strokeLinejoin="round" strokeLinecap="round">
          <path d="M990 340 L956 470 L992 464 L934 640 L972 632 L912 800" strokeWidth="7" opacity={flash} />
          <path d="M956 470 L1010 540 M934 640 L880 700" strokeWidth="4" opacity={flash * 0.7} />
        </g>

        {/* PIANO 2 — foschia lontana e pioggia sottile e lenta (0,5) */}
        <g transform={L(0.5, Math.sin(t * 0.5) * 60)}>
          <ellipse cx="540" cy="1120" rx="1000" ry="150" fill="url(#ur-mist)" opacity=".2" />
        </g>
        <g transform={L(0.5)}>
          <Rain d={RAIN_FAR} y={mod(t * 420, RAIN_H) - RAIN_H} stroke="#9CC3CA" width={3} opacity={0.3} />
        </g>

        {/* PIANO 3 — isolotto con il faro e fascio rotante (0,6) */}
        <g transform={L(0.6, ISLE_DX)}>
          <g transform={`translate(${LAMP.x} ${LAMP.y}) scale(${sweep} 1) translate(${-LAMP.x} ${-LAMP.y})`} opacity={(0.55 + 0.45 * pulse) * leftDim}>
            <path d={`M${LAMP.x} ${LAMP.y - 8} L1500 476 L1500 860 L${LAMP.x} ${LAMP.y + 8} Z`} fill="url(#ur-beam)" />
          </g>
          <path d="M260 1270 Q350 1070 480 1100 Q560 1030 660 1070 Q800 1080 860 1270 Z" fill="url(#ur-rock)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M380 1120 Q430 1090 480 1100 M640 1080 Q700 1076 750 1110" fill="none" stroke="#8FA6A0" strokeWidth="6" strokeLinecap="round" opacity=".7" />
          <path d="M300 1200 q30 -10 50 6 M760 1190 q30 0 44 20" fill="none" stroke="#CFE3E8" strokeWidth="4" strokeLinecap="round" opacity=".45" />
          {/* torre: gradiente laterale, fasce rosse, finestre */}
          <path d="M440 1150 L470 640 H610 L640 1150 Z" fill="url(#ur-tower)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <g clipPath="url(#ur-towerclip)">
            <path d="M440 845 H640 M440 1005 H640" stroke="#B5562F" strokeWidth="42" />
            <path d="M592 845 H640 M600 1005 H640" stroke="#6E2E16" strokeWidth="42" opacity=".5" />
          </g>
          <path d="M474 650 L446 1146" stroke="#FFFFFF" strokeWidth="4" opacity={0.6 + flash * 0.4} />
          <rect x="528" y="760" width="24" height="34" rx="4" fill="#FFD25C" stroke={K} strokeWidth="4" />
          <rect x="528" y="930" width="24" height="34" rx="4" fill="#3A4A55" stroke={K} strokeWidth="4" />
          <path d="M522 1080 H558 V1150 H522 Z" fill="#FFD25C" opacity=".85" stroke={K} strokeWidth="4" />
          <circle cx="540" cy="1110" r="60" fill="url(#ur-glow)" opacity=".35" />
          {/* ballatoio */}
          <path d="M445 644 H635 M452 664 H628 M465 644 V686 M495 644 V686 M525 644 V686 M555 644 V686 M585 644 V686 M615 644 V686" stroke={K} strokeWidth="6" />
          {/* lanterna e alone che pulsa */}
          <circle cx={LAMP.x} cy={LAMP.y} r={110 + pulse * 70} fill="url(#ur-glow)" opacity={0.35 + pulse * 0.3} />
          <rect x="472" y="540" width="136" height="104" fill="#FFE7A0" stroke={K} strokeWidth="8" />
          <path d="M507 540 V644 M573 540 V644" stroke={K} strokeWidth="6" />
          <circle cx={LAMP.x} cy={LAMP.y} r={22 + pulse * 10} fill="#FFFFFF" />
          <path d="M450 540 L540 466 L630 540 Z" fill="#0F1820" stroke={K} strokeWidth="4" strokeLinejoin="round" />
          <path d="M540 466 V440" stroke="#0F1820" strokeWidth="8" />
          <circle cx="540" cy="436" r="8" fill="#0F1820" />
          <path d="M470 532 L540 474" stroke="#5E8A94" strokeWidth="3" opacity=".6" />
        </g>

        {/* PIANO 4 — mare lontano (0,7) */}
        <g transform={L(0.7, -mod(t * 50, 160), sw * 0.5)}>
          <path d={wavePath(1250, 45, 160, -400, 1600, 2200)} fill="url(#ur-sea)" />
        </g>
        {/* mare medio con cresta di schiuma e spruzzi contro l'isolotto (0,85) */}
        <g transform={L(0.85, -mod(t * 85, 160), sw)}>
          <path d={wavePath(1340, 50, 160, -400, 1600, 2200)} fill="url(#ur-sea2)" />
          <path d={wavePath(1340, 50, 160, -400, 1600)} fill="none" stroke="#D7ECEF" strokeWidth="7" strokeLinecap="round" opacity=".8" />
        </g>
        <g transform={L(0.85)}>
          {SPRAY.map((s, i) => {
            const p = mod(t * 0.7 + s.ph, 1);
            return <circle key={i} cx={s.bx + s.vx * p} cy={1290 - s.vy * p + 420 * p * p} r={s.r} fill="#E9F0F2" opacity={Math.sin(p * Math.PI) * 0.8} />;
          })}
        </g>
        {/* mare vicino (1,0) */}
        <g transform={L(1.0, -mod(t * 120, 160), Math.sin(t * 2.2 + 1) * 16)}>
          <path d={wavePath(1470, 40, 160, -400, 1600, 2200)} fill="#123039" />
          <path d={wavePath(1470, 40, 160, -400, 1600)} fill="none" stroke="#9CC3CA" strokeWidth="6" strokeLinecap="round" opacity=".7" />
        </g>

        {/* PIANO 5 — scoglio in primo piano con la sporgenza del cappello (1,3) */}
        <g transform={L(1.3)}>
          <path d="M-170 1990 L-130 1300 Q-50 1222 110 1240 Q230 1228 320 1262 Q420 1320 470 1470 Q560 1540 700 1640 L800 1990 Z" fill="url(#ur-front)" stroke="#070B0C" strokeWidth="9" strokeLinejoin="round" />
          {/* bordi bagnati e lucidi */}
          <path d="M-60 1250 Q40 1230 110 1244 Q230 1232 300 1258 M440 1420 Q470 1460 520 1500" fill="none" stroke="#9CB4B0" strokeWidth="7" strokeLinecap="round" opacity=".6" />
          <path d="M20 1330 Q60 1310 100 1330 M220 1300 Q260 1292 290 1310 M520 1560 Q560 1550 600 1570" fill="none" stroke="#CFE3E8" strokeWidth="4" strokeLinecap="round" opacity={0.5 + flash * 0.4} />
          {/* crepe */}
          <path d="M60 1400 l40 60 l-10 50 M260 1360 l-20 70 l30 40" fill="none" stroke="#070B0C" strokeWidth="5" strokeLinecap="round" />
          {/* anello d'ormeggio arrugginito */}
          <path d="M330 1300 v-16" stroke="#070B0C" strokeWidth="8" />
          <circle cx="330" cy="1302" r="16" fill="none" stroke="#3A2A22" strokeWidth="7" />
          <circle cx="330" cy="1302" r="16" fill="none" stroke="#9C7A5A" strokeWidth="2" opacity=".6" />
        </g>

        {/* il cappello che vola via (1,2) */}
        <g transform={L(1.2)}>
          <ellipse cx="196" cy="1240" rx={110 * (1 - seg(t, 5, 5.8))} ry="10" fill="#000" opacity=".35" />
          <g transform={`translate(${hatX} ${hatY + hatHop}) rotate(${hatRot}) scale(.86)`}>
            <Hat accent={P.accento} />
          </g>
        </g>

        {/* PIANO 6 — pioggia vicina spessa e veloce (1,4), gocce sulla lente (2,0), foschia bassa (1,5) */}
        <g transform={L(1.4)}>
          <Rain d={RAIN_NEAR} y={mod(t * 1100, RAIN_H) - RAIN_H} stroke="#CFE3E8" width={6} opacity={0.55} />
        </g>
        <g transform={L(2.0)}>
          {DROPS.map((d, i) => {
            const p = mod(t * 0.25 + d.ph, 1);
            return <circle key={i} cx={d.x} cy={lerp(400, 1900, p)} r={d.r} fill="url(#ur-drop)" opacity={Math.sin(p * Math.PI) * 0.35} />;
          })}
        </g>
        <g transform={L(1.5, Math.sin(t * 0.6) * 80)}>
          <ellipse cx="540" cy="1900" rx="1000" ry="220" fill="url(#ur-mist)" opacity=".25" />
        </g>
      </g>

      {/* velo scuro dietro il titolo: resta leggibile anche quando il lampo schiarisce il cielo */}
      <ellipse cx="400" cy="470" rx="560" ry="210" fill="url(#ur-veil)" opacity={0.35 + 0.55 * flash} />
      <Finish id="ur" tint="#0E3A40" />
    </svg>
  );
};
