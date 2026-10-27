import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes, SunRays } from '../../lib/elements';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { K, ORANGE, TINT_DAY } from './Comune';

// Nostalgia all'età sbagliata: cameretta di un ragazzo all'alba. Una clessidra sulla scrivania, due torte con le
// candeline 14 e 17, fotografie appese a un filo che sbiadiscono, una finestra da cui entra il sole; un aeroplanino
// di carta che vola fuori.
// Piani: muro e finestra con l'alba (0,25) · filo con le foto, poster (0,45) · scrivania con clessidra e torte (0,7)
//        · letto e scarpe da ginnastica in primo piano (1,2) · pulviscolo nel raggio di sole, aeroplanino (1,6)
// Eventi: cues[1] la clessidra si gira e la sabbia scende · cues[2] si accendono le candeline del 17 mentre il 14
//         brilla di arancione (il rimpianto) · cues[3] le foto sul filo sbiadiscono · cues[4] il sole entra dalla finestra
//         e l'aeroplanino vola fuori (incoscienza e fiducia).

const PHOTOS = [0, 1, 2, 3, 4];

export const Significato: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c1 = cues[1] ?? 1.9, c2 = cues[2] ?? 5, c3 = cues[3] ?? 7.9, c4 = cues[4] ?? 10.2;
  const turn = eo(seg(t, c1, c1 + 0.8));
  const sand = seg(t, c1 + 0.8, dur);
  const c17 = seg(t, c2, c2 + 0.3);
  const c14 = eob(seg(t, c2 + 1, c2 + 1.5));
  const fade = eo(seg(t, c3, c3 + 2));
  const sun = eo(seg(t, c4, c4 + 1.5));
  const fly = seg(t, c4 + 0.4, c4 + 3.4);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sg" />
        <Lin id="sg-wall" stops={[[0, '#2A2A40'], [0.45, '#4A4058'], [0.8, '#5A4A58'], [1, '#3A3040']]} />
        <Lin id="sg-dawn" stops={[[0, '#3A4A8A'], [0.5, '#E8A0A0'], [1, '#FFD890']]} />
        <clipPath id="sg-win"><rect x="640" y="620" width="300" height="360" /></clipPath>
        <Lin id="sg-desk" stops={[[0, '#8A6A4A'], [1, '#3A2A1C']]} />
        <Lin id="sg-floor" stops={[[0, '#5A4A44'], [1, '#1E1816']]} />
        <Lin id="sg-glass" x2={1} y2={0} stops={[[0, '#C8D8E8', 0.5], [0.5, '#FFFFFF', 0.8], [1, '#A8B8C8', 0.5]]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — muro e finestra con l'alba (calmo in alto per il titolo) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1600" fill="url(#sg-wall)" />
          <rect x="640" y="620" width="300" height="360" fill="url(#sg-dawn)" />
          <g clipPath="url(#sg-win)"><circle cx="790" cy={lerp(990, 900, sun)} r="56" fill="#FFF0C0" opacity={0.4 + 0.6 * sun} />
          <Glow id="sg-sun" x={790} y={900} r={lerp(200, 420, sun)} t={t} color="#FFE0A0" amp={0.03} rate={1} opacity={0.3 + 0.5 * sun} />
          <path d="M640 900 Q720 860 790 890 T940 880 V980 H640 Z" fill="#3A3A5A" opacity=".8" /></g>
          <rect x="640" y="620" width="300" height="360" fill="none" stroke={K} strokeWidth="12" />
          <path d="M790 620 V980 M640 800 H940" stroke={K} strokeWidth="8" />
          <path d="M600 604 H980" stroke={K} strokeWidth="10" strokeLinecap="round" />
          <path d={`M600 610 H660 Q${650 + Math.sin(t) * 6} 800 ${662 + Math.sin(t) * 8} 1010 H594 Q588 800 600 610 Z`} fill="#6A8AB0" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          <path d={`M618 620 Q${614 + Math.sin(t) * 4} 800 ${620 + Math.sin(t) * 6} 1000 M640 620 Q${636 + Math.sin(t) * 4} 800 ${644 + Math.sin(t) * 6} 1000`} stroke="#4A6A90" strokeWidth="4" fill="none" />
        </g>

        {/* PIANO 1 — filo con le fotografie che sbiadiscono, poster */}
        <g transform={L(0.45)}>
          <path d="M60 640 Q320 700 580 640" stroke="#2A2030" strokeWidth="4" fill="none" />
          {PHOTOS.map((i) => {
            const x = 110 + i * 100, y = 650 + Math.sin((i / 4) * Math.PI) * 40;
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${Math.sin(t * 0.8 + i) * 4})`}>
                <rect x="-36" y="0" width="72" height="84" fill="#F4ECDD" stroke={K} strokeWidth="4" />
                <rect x="-28" y="8" width="56" height="54" fill={['#7AB0D8', '#F2A23A', '#7AD06A', '#E86A8A', '#C8A0E0'][i]} opacity={1 - 0.75 * fade} />
                <path d="M-28 50 Q-8 30 10 46 T28 40" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity={0.6 * (1 - fade)} />
                <rect x="-6" y="-8" width="12" height="16" fill="#C89A5A" stroke={K} strokeWidth="3" />
              </g>
            );
          })}
          <g transform="translate(140 860) rotate(-4)">
            <rect x="-80" y="-60" width="160" height="120" fill="#2F6EA6" stroke={K} strokeWidth="6" />
            <circle cx="-20" cy="0" r="30" fill="#F4ECDD" opacity=".7" />
            <path d="M20 -30 L60 40 M20 40 L60 -30" stroke="#F4ECDD" strokeWidth="8" />
          </g>
        </g>

        {/* PIANO 2 — scrivania con la clessidra e le due torte */}
        <g transform={L(0.7)}>
          <rect x="-200" y="1200" width="1480" height="900" fill="url(#sg-floor)" />
          <path d="M80 1080 H1000 L1020 1130 H60 Z" fill="url(#sg-desk)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M100 1130 V1300 M980 1130 V1300" stroke={K} strokeWidth="16" />
          {/* clessidra che si gira */}
          <g transform={`translate(540 980) rotate(${180 * turn})`}>
            <Glow id="sg-hour" x={0} y={0} r={140} t={t} color="#FFE7A0" amp={0.05} rate={2} opacity={0.4} />
            <rect x="-60" y="-104" width="120" height="16" rx="4" fill="#8A6A44" stroke={K} strokeWidth="5" />
            <rect x="-60" y="88" width="120" height="16" rx="4" fill="#8A6A44" stroke={K} strokeWidth="5" />
            <path d="M-46 -88 Q-46 -20 0 0 Q-46 20 -46 88 H46 Q46 20 0 0 Q46 -20 46 -88 Z" fill="url(#sg-glass)" stroke={K} strokeWidth="5" />
            {/* sabbia: dopo la rotazione cade dall'alto in basso */}
            <path d={`M${-36 * (1 - sand)} ${-80 + 70 * sand} Q0 ${-10} ${36 * (1 - sand)} ${-80 + 70 * sand} V-80 H${-36 * (1 - sand)} Z`} fill={ORANGE} opacity={turn > 0.95 ? 1 : 0} transform="rotate(180)" />
            <path d={`M-40 ${84 - 40 * sand} L0 ${84 - 60 * sand} L40 ${84 - 40 * sand} V84 H-40 Z`} fill={ORANGE} transform={turn > 0.95 ? 'rotate(180)' : ''} opacity={turn > 0.95 ? 1 : 0.9} />
            {turn > 0.95 && sand < 1 && <path d="M0 -6 V60" stroke={ORANGE} strokeWidth="3" transform="rotate(180)" />}
          </g>
          {/* torte con le candeline 14 e 17 */}
          {[[260, '14', c14, true], [820, '17', c17, false]].map(([x, n, k, gold], i) => (
            <g key={i} transform={`translate(${x} 1080)`}>
              <Glow id={`sg-cake${i}`} x={0} y={-100} r={170} t={t} color={gold ? ORANGE : '#FFE7A0'} amp={0.12} rate={6} opacity={0.6 * (k as number)} />
              <rect x="-90" y="-60" width="180" height="60" rx="10" fill={gold ? '#F4D8A8' : '#D8E8F4'} stroke={K} strokeWidth="6" />
              <path d="M-90 -44 q22 14 45 0 t45 0 t45 0 t45 0" fill="none" stroke={gold ? '#E8903A' : '#6AA0D8'} strokeWidth="6" />
              <text x="0" y="-68" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="64" fill={gold ? ORANGE : '#F4ECDD'} stroke={K} strokeWidth="3">{n as string}</text>
              {[-18, 18].map((dx, j) => (
                <path key={j} d={`M${dx} -112 q${6 + Math.sin(t * 9 + j + i) * 3} -12 0 -24 q-6 12 0 24 Z`} fill="#FFE070" stroke={K} strokeWidth="2" opacity={k as number} />
              ))}
            </g>
          ))}
        </g>

        {/* PIANO 3 — letto e scarpe da ginnastica in primo piano */}
        <g transform={L(1.2)}>
          <path d="M-200 1480 H360 Q400 1480 400 1520 V2200 H-200 Z" fill="#3A5A8A" stroke={K} strokeWidth="10" />
          <path d="M-200 1540 H380" stroke="#5A7AB0" strokeWidth="8" />
          <path d="M120 1500 Q240 1470 340 1500 Q350 1560 320 1590 Q220 1600 130 1580 Q110 1540 120 1500 Z" fill="#E8E4EC" stroke={K} strokeWidth="7" />
          <path d="M-200 1600 Q100 1640 380 1600" stroke="#2A4A70" strokeWidth="6" fill="none" />
          {[720, 880].map((x, i) => (
            <g key={i} transform={`translate(${x} 1720) rotate(${i ? 8 : -6})`}>
              <path d="M-90 0 Q-90 -50 -40 -60 L20 -60 Q60 -40 90 -20 Q100 0 90 10 H-90 Z" fill="#F4ECDD" stroke={K} strokeWidth="7" strokeLinejoin="round" />
              <path d="M-90 4 H92" stroke="#C8303A" strokeWidth="10" />
              <path d="M-30 -50 L10 -30 M-20 -58 L20 -38" stroke={K} strokeWidth="4" />
            </g>
          ))}
        </g>

        {/* PIANO 4 — raggi di sole, pulviscolo, aeroplanino che vola fuori */}
        <g transform={L(1.6)}>
          <g opacity={sun}>
            <SunRays id="sg-rays" x={790} y={880} t={t} color="#FFE7A0" n={6} length={900} width={140} from={150} to={230} opacity={0.4} />
          </g>
          <Dust t={t} top={{ y: 800, x0: 680, x1: 900 }} bottom={{ y: 1300, x0: 200, x1: 700 }} n={22} color="#FFF0C8" boost={-0.4 + 0.5 * sun} />
          {fly > 0 && fly < 1 && (
            <g transform={`translate(${lerp(300, 820, fly)} ${lerp(1040, 760, fly) - Math.sin(fly * Math.PI) * 80}) rotate(${-20 + fly * 10}) scale(${1 - 0.5 * fly})`}>
              <path d="M-50 10 L50 -10 L-20 -30 Z" fill="#F4ECDD" stroke={K} strokeWidth="5" strokeLinejoin="round" />
              <path d="M-50 10 L50 -10 L-10 20 Z" fill="#E8DCC8" stroke={K} strokeWidth="5" strokeLinejoin="round" />
            </g>
          )}
          <NearMotes id="sg-near" t={t} color="#FFE8C8" opacity={0.07} />
        </g>
      </g>

      <Finish id="sg" tint={TINT_DAY} tintOpacity={0.08} />
    </svg>
  );
};
