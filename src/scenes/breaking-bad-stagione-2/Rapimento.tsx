import React from 'react';
import { camera, eio, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Glow, NearMotes, Smoke } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { BBDefs, Cactus, Cespuglio, Cristalli } from '../breaking-bad-stagione-1/Comuni';
import { Auto, BB2Defs, K, Ombra } from './Comuni';

// Rapiti nel deserto: una strada sterrata nel deserto al tramonto e, a sinistra, la casupola isolata dove Tuco si
// nasconde (mulino a vento, cisterna, una sola finestra). Persone mai: Walter e Jesse sono gli occhiali da vista caduti
// sulla ghiaia e la busta di cristalli strappata in primo piano. Eventi: prima frase l'auto scura di Tuco entra da destra
// sollevando un nuvolone di polvere (la busta di cristalli brilla: la droga che gli vendono); seconda frase all'orizzonte
// lampeggiano le luci rosse e blu della polizia che lo cerca; terza frase l'auto arriva alla casa e si ferma, i fari si
// spengono e si accende la finestra: si nascondono lì.
// Piani: cielo del tramonto (0,22) · mesa e luci lontane (0,35) · casa, mulino e pali (0,55) · strada e auto (0,7)
//        · ghiaia, occhiali e cristalli in primo piano (1,2) · polvere vicina (1,6)

const r = rng(2201);
const POLES = [140, 470, 800, 1130].map((x, i) => ({ x, h: 210 - i * 10, tilt: (r() - 0.5) * 6 }));
const STONES = Array.from({ length: 26 }, () => ({ x: r() * 1300 - 100, y: 1520 + r() * 420, rx: 10 + r() * 26, ry: 6 + r() * 12 }));

export const Rapimento: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tIn = griglia(cues[0] + 0.2);
  const tCops = griglia(cues[1] + 0.3);
  const tStop = griglia(cues[2] + 1.0);
  // l'auto: entra da destra e frena davanti alla casa
  const drive = eio(seg(t, tIn, tStop));
  const carX = lerp(1400, 690, drive);
  const moving = t > tIn && t < tStop;
  const cops = seg(t, tCops, tCops + 0.4) * (1 - seg(t, tCops + 3.2, tCops + 4));
  const lightsOn = t < tStop + 0.2 ? 1 : 1 - seg(t, tStop + 0.2, tStop + 0.5);
  const window = eo(seg(t, tStop + 0.5, tStop + 0.9));
  const blade = t * 2.2;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ra" />
        <BBDefs id="ra" />
        <BB2Defs id="ra" />
        <Lin id="ra-sky" stops={[[0, '#2A1E3A'], [0.3, '#6A3050'], [0.5, '#D8603A'], [0.62, '#F2B060']]} />
        <Lin id="ra-sand" stops={[[0, '#B87A50'], [0.4, '#7A4A2E'], [1, '#2A1810']]} />
        <Lin id="ra-adobe" x2={1} y2={0} stops={[[0, '#D89A6A'], [0.6, '#B8784A'], [1, '#7A4A2A']]} />
        <Lin id="ra-fg" stops={[[0, '#7A4A2E'], [0.3, '#4A2A18'], [1, '#2A1810']]} />
        <Lin id="ra-road" stops={[[0, '#C89068'], [1, '#8A5A3A']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo del tramonto, sole basso, nuvole sottili (0,22) */}
        <g transform={L(0.22)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ra-sky)" />
          <Glow id="ra-sun" x={820} y={960} r={520} t={t} color="#FFB060" amp={0.03} rate={0.7} opacity={0.85} />
          <circle cx="820" cy="960" r="84" fill="#FFE2A0" />
          {[0, 1, 2, 3].map((k) => <ellipse key={k} cx={mod(100 + k * 330 + t * 8, 1500) - 200} cy={860 + k * 50} rx={200 - k * 25} ry="13" fill="#E87A5A" opacity=".55" />)}
        </g>

        {/* PIANO 1 — mesa lontane e luci della polizia all'orizzonte (0,35) */}
        <g transform={`${L(0.35)} translate(0 -150)`}>
          <path d="M-200 1130 L-120 1040 H120 L160 1010 H300 L360 1130 Z" fill="#7A3A3A" />
          <path d="M600 1130 L660 990 H900 L940 970 H1080 L1140 1080 H1280 V1130 Z" fill="#8A4232" stroke={K} strokeWidth="5" />
          <path d="M662 994 H900" stroke="#F2A878" strokeWidth="4" opacity=".7" />
          <rect x="-200" y="1120" width="1480" height="60" fill="#A8683E" />
          {cops > 0 && [0, 1, 2].map((k) => {
            const on = Math.sin(t * 14 + k * 2) > 0;
            return (
              <g key={k}>
                <Glow id={`ra-cop${k}`} x={720 + k * 70} y={1118} r={120} t={t} color={on ? '#FF3A3A' : '#3A7AFF'} amp={0.1} rate={10} opacity={0.9 * cops} />
                <circle cx={720 + k * 70} cy={1118} r="10" fill={on ? '#FFB0B0' : '#B0C8FF'} opacity={cops} />
              </g>
            );
          })}
        </g>

        {/* PIANO 2 — la casupola, la cisterna, il mulino a vento, i pali della luce (0,55) */}
        <g transform={`${L(0.55)} translate(0 -150)`}>
          <path d="M-200 1170 H1280 V1400 H-200 Z" fill="url(#ra-sand)" />
          {/* pali della luce storti con i fili */}
          {POLES.map((p, i) => (
            <g key={i} transform={`rotate(${p.tilt} ${p.x} 1200)`}>
              <path d={`M${p.x} 1200 V${1200 - p.h}`} stroke="#3A2418" strokeWidth="8" />
              <path d={`M${p.x - 30} ${1214 - p.h} H${p.x + 30}`} stroke="#3A2418" strokeWidth="6" />
            </g>
          ))}
          <path d={`M140 ${1004} Q305 1040 470 1004 Q635 1040 800 1004 Q965 1040 1130 1004`} stroke="#2A1A12" strokeWidth="3" fill="none" />
          {/* mulino a vento */}
          <g transform="translate(470 1220)">
            <path d="M-40 0 L-6 -300 M40 0 L6 -300 M-30 -80 L30 -80 M-20 -170 L20 -170" stroke="#4A3A30" strokeWidth="7" />
            <g transform={`translate(0 -310) rotate(${(blade * 57.3) % 360})`}>
              {Array.from({ length: 12 }, (_, k) => <path key={k} d="M0 0 L-10 -78 L10 -78 Z" transform={`rotate(${k * 30})`} fill="#8A8A86" stroke={K} strokeWidth="3" />)}
              <circle r="12" fill="#5A5A56" stroke={K} strokeWidth="4" />
            </g>
            <path d="M10 -310 L80 -300 L80 -330 Z" fill="#7A3A2A" stroke={K} strokeWidth="4" />
          </g>
          {/* la casa */}
          <g transform="translate(330 1250) scale(1.15)">
            <Ombra id="ra" x={0} y={6} rx={260} ry={22} />
            <path d="M-220 0 V-220 Q-226 -240 -206 -244 H210 Q228 -240 222 -220 V0 Z" fill="url(#ra-adobe)" stroke={K} strokeWidth="9" />
            {Array.from({ length: 6 }, (_, k) => <circle key={k} cx={-180 + k * 70} cy={-232} r="10" fill="#5A3A22" stroke={K} strokeWidth="3" />)}
            <path d="M-200 -180 q30 10 60 0 M80 -60 q30 8 70 -2" stroke="#8A5A36" strokeWidth="4" fill="none" />
            {/* finestra */}
            <rect x="-150" y="-170" width="110" height="90" fill="#1A1410" stroke={K} strokeWidth="7" />
            <rect x="-150" y="-170" width="110" height="90" fill="#FFC870" opacity={window * (0.85 + 0.1 * Math.sin(t * 6))} />
            <path d="M-95 -170 V-80 M-150 -125 H-40" stroke={K} strokeWidth="5" />
            {/* porta con la zanzariera */}
            <rect x="40" y="-180" width="90" height="180" fill="#3A2A20" stroke={K} strokeWidth="7" />
            <path d="M50 -170 H120 V-10 H50 Z" fill="#5A4A40" opacity=".5" />
            <circle cx="118" cy="-90" r="6" fill="#C8A060" />
            {/* parabola e antenna */}
            <path d="M150 -244 V-320 M130 -300 H170 M136 -280 H164" stroke="#3A3A3A" strokeWidth="5" />
            <ellipse cx="-60" cy="-262" rx="34" ry="20" fill="#C8C4BC" stroke={K} strokeWidth="5" transform="rotate(-20 -60 -262)" />
            {/* cisterna sui pali */}
            <g transform="translate(-300 0)">
              <path d="M-40 0 V-200 M40 0 V-200 M-40 -100 L40 -200 M40 -100 L-40 -200" stroke="#4A3A30" strokeWidth="7" />
              <rect x="-60" y="-300" width="120" height="100" rx="14" fill="#8A8A82" stroke={K} strokeWidth="7" />
              <path d="M-60 -270 H60 M-60 -230 H60" stroke="#5A5A56" strokeWidth="4" />
            </g>
            <Glow id="ra-win" x={-95} y={-125} r={240} t={t} color="#FFC870" amp={0.04} rate={4} opacity={0.6 * window} />
          </g>
          <Cactus id="ra" x={720} y={1290} s={0.36} />
          <Cespuglio x={900} y={1300} s={0.7} seed={4} color="#7A7A44" />
        </g>

        {/* PIANO 3 — la strada sterrata e l'auto di Tuco con il nuvolone di polvere (0,7) */}
        <g transform={`${L(0.7)} translate(0 -170)`}>
          <path d="M-200 1330 Q500 1290 1280 1320 V1430 Q500 1400 -200 1440 Z" fill="url(#ra-road)" stroke="#5A3A22" strokeWidth="5" />
          {Array.from({ length: 12 }, (_, k) => <path key={k} d={`M${-150 + k * 120} ${1380 + (k % 2) * 14} q30 -6 60 0`} stroke="#6A4228" strokeWidth="4" fill="none" opacity=".6" />)}
          {t > tIn && (
            <Smoke id="ra-dust" t={t - tIn} x={carX + 180} y={1330} color="#D8A070" n={7} rise={140} wind={moving ? 260 : 60} r0={50} r1={170} speed={0.55}
              opacity={0.8 * (1 - seg(t, tStop + 0.6, tStop + 2.6))} />
          )}
          <Auto id="ra" x={carX} y={1390} s={0.5} t={t} lights={lightsOn} spin={moving ? -t * 900 : 0} flip />
        </g>

        {/* PIANO 4 — primo piano: ghiaia, occhiali da vista caduti, busta di cristalli strappata, filo spinato (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1300 Q400 1270 1280 1310 V2200 H-200 Z" fill="url(#ra-fg)" />
          {STONES.map((s, i) => <ellipse key={i} cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} fill={i % 3 ? '#6A4430' : '#8A5E40'} stroke={K} strokeWidth="3" />)}
          {/* occhiali da vista di Walter, una lente incrinata */}
          <g transform="translate(330 1640) rotate(-12)">
            <ellipse cx="0" cy="8" rx="130" ry="14" fill="#000" opacity=".3" />
            <rect x="-110" y="-34" width="90" height="60" rx="20" fill="#C8DCE4" fillOpacity=".35" stroke={K} strokeWidth="9" />
            <rect x="20" y="-34" width="90" height="60" rx="20" fill="#C8DCE4" fillOpacity=".35" stroke={K} strokeWidth="9" />
            <path d="M-20 -14 Q0 -26 20 -14" stroke={K} strokeWidth="7" fill="none" />
            <path d="M-110 -20 L-170 -40 M110 -20 L170 -34" stroke={K} strokeWidth="7" />
            <path d="M34 -28 L52 -8 L46 6 L62 22 M52 -8 L74 -14 L88 2" stroke="#FFFFFF" strokeWidth="3" fill="none" />
            <path d="M-96 -20 L-70 10" stroke="#FFFFFF" strokeWidth="5" opacity=".6" />
          </g>
          {/* bustina di plastica strappata, i cristalli che escono sulla ghiaia */}
          <g transform="translate(770 1700) rotate(-8)">
            <ellipse cx="0" cy="10" rx="150" ry="18" fill="#000" opacity=".3" />
            <path d="M-120 4 L-110 -150 Q-108 -164 -94 -164 H86 Q100 -164 102 -150 L114 -20 L80 -6 L96 10 Z" fill="#E8F2F4" fillOpacity=".4" stroke={K} strokeWidth="6" />
            <path d="M-110 -136 H100" stroke="#C83A2A" strokeWidth="8" />
            <path d="M-110 -150 H100" stroke={K} strokeWidth="3" />
            <path d="M-96 -120 L-80 -30" stroke="#FFFFFF" strokeWidth="6" opacity=".55" />
            <Cristalli id="ra" x={-10} y={-10} t={t} s={0.75} n={14} seed={4} glint={0.4 + 0.6 * seg(t, tIn, tIn + 0.6)} />
            <Cristalli id="ra" x={150} y={14} t={t} s={0.45} n={7} seed={8} glint={0.5} />
          </g>
          {/* paletto con il filo spinato che incornicia a destra */}
          <path d="M1020 2000 V1440" stroke="#3A2418" strokeWidth="20" />
          <path d="M1280 1520 Q1150 1500 1020 1500 Q900 1505 780 1540" stroke="#2A2A2A" strokeWidth="4" fill="none" />
          {[820, 880, 940, 1080, 1160].map((x) => <path key={x} d={`M${x - 8} ${1520 - (x > 1020 ? 6 : -4)} l16 -10 m-16 0 l16 10`} stroke="#2A2A2A" strokeWidth="3" />)}
          <Cespuglio x={60} y={1900} s={1.5} seed={7} color="#6A6A3A" />
        </g>

        {/* PIANO 5 — polvere vicina che passa (1,6) */}
        <g transform={L(1.6)}>
          {Array.from({ length: 16 }, (_, i) => {
            const x = mod(i * 97 - t * (60 + i * 4), 1480) - 200;
            return <circle key={i} cx={x} cy={900 + ((i * 131) % 700)} r={2 + (i % 3)} fill="#F2C8A0" opacity=".5" />;
          })}
          <NearMotes id="ra-near" t={t} color="#F2B890" n={6} r0={70} r1={160} opacity={0.12} vx={-40} />
        </g>
      </g>
      <Finish id="ra" tint="#8A3A2A" tintOpacity={0.1} />
    </svg>
  );
};
