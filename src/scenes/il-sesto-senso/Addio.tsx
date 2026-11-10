import React from 'react';
import { camera, eio, eo, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes, SunRays } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Brina, K, Ombra, Porta, SestoDefs } from './Comuni';

// La verità su Malcolm: il corridoio di casa Crowe all'alba. A sinistra la porta della cantina (lo studio di Malcolm)
// con la maniglia rossa, ancora velata di brina; a destra la finestra da cui entra il primo sole; l'attaccapanni con il
// cappotto di Malcolm e la sciarpa, il tavolino con le chiavi; in primo piano la ringhiera della scala.
// Eventi: 1ª frase la luce dell'alba entra a fasci dalla finestra e la brina sulla porta comincia a sciogliersi;
// 2ª frase la maniglia rossa perde il suo alone (Anna non lo ignorava: il gelo se ne va); 3ª frase la porta si apre
// da sola su una luce bianca e calda che riempie il corridoio (Malcolm se ne va in pace, in un lampo di luce).
// Nessuna persona.
// Piani: parete e finestra (0,3) · porta della cantina (0,45) · attaccapanni e tavolino (0,7)
//        · ringhiera in primo piano (1,2) · pulviscolo nei fasci di sole (1,5–1,8)

export const Addio: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const dawn = eo(seg(t, griglia(cues[0] + 0.2), griglia(cues[0] + 0.2) + 2.5));
  const melt = 1 - eio(seg(t, griglia(cues[0] + 1), griglia(cues[1] + 2)));
  const redOff = 1 - eo(seg(t, griglia(cues[1] + 0.8), griglia(cues[1] + 0.8) + 1.4));
  const open = eio(seg(t, griglia(cues[2] + 1.2), griglia(cues[2] + 1.2) + 1.4));
  const white = seg(t, griglia(cues[2] + 1.8), griglia(cues[2] + 1.8) + 1.4);
  const DX = 200, DY = 1250, DW = 310, DH = 560;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ad" />
        <SestoDefs id="ad" />
        <Lin id="ad-wall" stops={[[0, '#1A1E26'], [0.4, '#3A3E46'], [0.75, '#5A564E'], [1, '#2A2620']]} />
        <Lin id="ad-dawn" stops={[[0, '#5A6A88'], [0.5, '#E8B888'], [1, '#FFE2B0']]} />
        <Lin id="ad-floor" stops={[[0, '#5A4230'], [0.5, '#30221A'], [1, '#0A0604']]} />
        <Lin id="ad-coat" x2={1} y2={0} stops={[[0, '#1E222A'], [0.5, '#3E4450'], [1, '#14181E']]} />
        <Lin id="ad-rail" x2={1} y2={0} stops={[[0, '#1A100A'], [0.45, '#6A4A30'], [0.6, '#3A2414'], [1, '#120A06']]} />
        <linearGradient id="ad-whiteg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFBF0" stopOpacity="0" />
          <stop offset=".3" stopColor="#FFFBF0" stopOpacity="0" />
          <stop offset=".5" stopColor="#FFFBF0" stopOpacity=".5" />
          <stop offset="1" stopColor="#FFFBF0" stopOpacity=".6" />
        </linearGradient>
        <linearGradient id="ad-beam" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE6B8" stopOpacity=".6" />
          <stop offset="1" stopColor="#FFE6B8" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete e finestra con l'alba (0,3) */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ad-wall)" />
          <rect x="-200" y="-200" width="1480" height="2400" fill="#E8B888" opacity={0.18 * dawn} />
          {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${-160 + i * 104} 620 V1060`} stroke="#5A5E66" strokeWidth="10" opacity=".22" />)}
          <path d="M-200 1060 H1280" stroke="#6A5E50" strokeWidth="14" />
          <rect x="700" y="660" width="260" height="380" fill="#3A4660" stroke={K} strokeWidth="9" />
          <rect x="700" y="660" width="260" height="380" fill="url(#ad-dawn)" opacity={0.3 + 0.7 * dawn} />
          <path d="M700 960 Q760 920 830 950 T960 930 V1040 H700 Z" fill="#2A2A30" opacity=".8" />
          <path d="M830 660 V1040 M700 850 H960" stroke="#5A5650" strokeWidth="10" />
          <rect x="700" y="660" width="260" height="380" fill="url(#ad-glass)" />
          <rect x="680" y="1036" width="300" height="20" fill="#7A7062" stroke={K} strokeWidth="5" />
          <Glow id="ad-sun" x={830} y={900} r={340} t={t} color="#FFE2B0" amp={0.04} rate={1} opacity={0.2 + 0.5 * dawn} />
        </g>

        {/* PIANO 1 — la porta della cantina con la maniglia rossa (0,45) */}
        <g transform={L(0.45)}>
          <path d="M-200 1250 H1280 V2200 H-200 Z" fill="url(#ad-floor)" />
          {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${-200 + i * 160} 1250 L${-440 + i * 220} 2200`} stroke="#000" strokeWidth="4" opacity=".3" />)}
          {/* fasci di sole dalla finestra sul pavimento */}
          <path d="M700 1040 L960 1040 L700 1800 L240 1800 Z" fill="url(#ad-beam)" opacity={dawn} />
          <Glow id="ad-white" x={DX + DW / 2} y={DY - DH / 2 + 80} r={560} t={t} color="#FFFFFF" amp={0.04} rate={1.2} opacity={0.8 * open} />
          <Porta id="ad" x={DX} y={DY} w={DW} h={DH} turn={0} open={open} behind="#FFFBF0" knob={30} spento={1 - redOff} />
          <Brina id="ad" x={DX} y={DY - 6} w={DW} p={0.9 * melt} />
          <Glow id="ad-knob" x={DX + DW - 52} y={DY - DH + DH * 0.54} r={120} t={t} color="#FF5A48" amp={0.1} rate={2.4} opacity={0.7 * redOff * (1 - open)} />
          {open > 0 && <path d={`M${DX} ${DY} H${DX + DW} L${DX + DW + 300} 1800 H${DX - 200} Z`} fill="#FFFBF0" opacity={0.5 * open} />}
        </g>

        {/* PIANO 2 — attaccapanni con il cappotto e la sciarpa, tavolino con le chiavi (0,7) */}
        <g transform={L(0.7)} strokeLinejoin="round">
          <Ombra id="ad" x={650} y={1300} rx={110} ry={14} />
          <path d="M650 1300 V720" stroke={K} strokeWidth="18" />
          <path d="M650 1300 V720" stroke="url(#ad-rail)" strokeWidth="10" />
          <path d="M600 1300 L650 1240 L700 1300" stroke={K} strokeWidth="12" fill="none" />
          <path d="M610 740 L650 720 L690 740" stroke={K} strokeWidth="10" fill="none" strokeLinecap="round" />
          {/* cappotto appeso al gancio */}
          <path d="M650 740 Q600 760 590 820 L570 1080 Q610 1100 650 1094 Q690 1100 730 1080 L710 820 Q700 760 650 740 Z" fill="url(#ad-coat)" stroke={K} strokeWidth="8" />
          <path d="M650 760 V1090 M626 780 L650 840 L674 780" stroke="#0A0C10" strokeWidth="5" fill="none" />
          {[880, 940, 1000].map((y) => <circle key={y} cx="662" cy={y} r="6" fill="#5A606A" stroke={K} strokeWidth="2" />)}
          <path d="M596 830 L580 1060" stroke="#7A8494" strokeWidth="4" opacity=".5" />
          {/* sciarpa rossa scura */}
          <path d="M630 760 Q650 780 670 760 L676 900 L660 902 L654 790 L646 900 L630 898 Z" fill="#7A2A2A" stroke={K} strokeWidth="5" />
          {/* tavolino con le chiavi */}
          <rect x="820" y="1120" width="220" height="24" fill="url(#ad-wood)" stroke={K} strokeWidth="6" />
          <path d="M840 1144 V1290 M1020 1144 V1290" stroke={K} strokeWidth="14" />
          <g transform="translate(900 1112)">
            <circle r="14" fill="none" stroke={K} strokeWidth="7" />
            <circle r="14" fill="none" stroke="#D8B868" strokeWidth="3" />
            <path d="M10 6 L40 10 L40 4 M24 8 V2" stroke="#C8CCD0" strokeWidth="5" />
          </g>
        </g>

        {/* PIANO 3 — ringhiera della scala in primo piano a destra (1,2) */}
        <g transform={L(1.2)}>
          <path d="M1300 1300 L760 1960 H1300 Z" fill="#0A0604" />
          <path d="M1320 1260 L740 1940" stroke={K} strokeWidth="58" strokeLinecap="round" />
          <path d="M1320 1260 L740 1940" stroke="url(#ad-rail)" strokeWidth="40" strokeLinecap="round" />
          {Array.from({ length: 5 }, (_, i) => {
            const x = 1190 - i * 90, y = 1420 + i * 105;
            return <rect key={i} x={x - 13} y={y} width="26" height="520" fill="url(#ad-rail)" stroke={K} strokeWidth="6" />;
          })}
        </g>

        {/* PIANO 4 — pulviscolo nei fasci di sole (1,5) e particelle vicine (1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 1000, x0: 700, x1: 960 }} bottom={{ y: 1700, x0: 300, x1: 800 }} seed={17} n={22} color="#FFF0D0" boost={0.2 * dawn} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="ad-near" t={t} color="#FFF0D8" n={6} opacity={0.08} />
        </g>
        <g opacity={dawn * 0.6}><SunRays id="ad-rays" x={830} y={850} t={t} color="#FFF0D0" n={7} length={700} opacity={0.18} from={100} to={170} /></g>
      </g>
      <rect width="1080" height="1920" fill="url(#ad-whiteg)" opacity={white} />
      <Finish id="ad" tint="#3A3428" tintOpacity={0.1} />
    </svg>
  );
};
