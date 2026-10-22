import React from 'react';
import { camera, eob, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Dust, Glow, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { K, Parcel } from './Comuni';

// Ogni minuto conta: centro di smistamento di notte, nastri trasportatori pieni di pacchi, luci al neon,
// grande orologio da parete con la lancetta dei secondi che scatta, cronometro su una pila di scatole.
// Piani: parete e finestre (0,25) · orologio (0,4) · nastro lontano (0,5) · nastro vicino (0,7) · scatole in primo piano (1,2) · pulviscolo (1,7)

const r = rng(1203);
const FAR = Array.from({ length: 9 }, (_, i) => ({ o: i / 9, w: 70 + r() * 40, h: 46 + r() * 24, c: ['#C69559', '#B8874E', '#D3A469'][i % 3] }));
const NEAR = Array.from({ length: 6 }, (_, i) => ({ o: i / 6, w: 150 + r() * 50, h: 100 + r() * 30 }));

export const Tempo: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  // il nastro accelera quando «ogni pacco deve arrivare in tempo»
  const speed = 1 + 0.8 * seg(t, cues[2], cues[2] + 0.8);
  const run = t * 0.06 * speed + seg(t, cues[2], dur) * 0.05;
  const tick = Math.floor(t); // lancetta che scatta ogni secondo
  const snap = eob(seg(t - tick, 0, 0.18), 3);
  const sec = ((tick - 1 + snap) / 60) * 360 + 200;
  const stop = eob(seg(t, cues[1], cues[1] + 0.4), 2); // il cronometro parte su «l'orologio in mano»

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="tp" />
        <Lin id="tp-wall" stops={[[0, '#0B1824'], [0.35, '#132838'], [0.6, '#1C3546'], [1, '#0F1F2B']]} />
        <Lin id="tp-floor" stops={[[0, '#22394A'], [1, '#0B1620']]} />
        <Lin id="tp-belt" x2={1} y2={0} stops={[[0, '#2E3E4A'], [0.5, '#46596A'], [1, '#2A3844']]} />
        <Lin id="tp-win" stops={[[0, '#1E3B57'], [1, '#33587A']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — parete del capannone con finestre alte (notte e neve di Memphis) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#tp-wall)" />
          {[-60, 260, 580, 900].map((x, i) => (
            <g key={i}>
              <rect x={x} y="560" width="200" height="150" fill="url(#tp-win)" stroke="#07111A" strokeWidth="6" />
              <path d={`M${x + 100} 560 V710 M${x} 635 H${x + 200}`} stroke="#07111A" strokeWidth="5" />
              {Array.from({ length: 6 }, (_, k) => {
                const yy = 560 + mod(t * 30 + k * 27 + i * 13, 150);
                return <circle key={k} cx={x + 18 + ((k * 37 + i * 11) % 170)} cy={yy} r="3" fill="#DDE8F0" opacity=".7" />;
              })}
            </g>
          ))}
          {/* travi */}
          <path d="M-200 520 H1280" stroke="#07111A" strokeWidth="18" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-200 + i * 130} 520 l65 -60 l65 60`} fill="none" stroke="#07111A" strokeWidth="6" opacity=".7" />)}
        </g>

        {/* PIANO 1 — l'orologio da parete (oggetto chiave) con alone */}
        <g transform={L(0.4)}>
          <Glow id="tp-clockg" x={760} y={860} r={230} t={t} color="#FFE2B0" amp={0.05} rate={1} opacity={0.35} />
          <circle cx="760" cy="860" r="150" fill="#F4EFE2" stroke={K} strokeWidth="12" />
          <circle cx="760" cy="860" r="150" fill="none" stroke={P.accento} strokeWidth="6" />
          {Array.from({ length: 60 }, (_, i) => {
            const a = (i / 60) * Math.PI * 2;
            const r0 = i % 5 ? 128 : 112;
            return <path key={i} d={`M${760 + Math.sin(a) * r0} ${860 - Math.cos(a) * r0} L${760 + Math.sin(a) * 138} ${860 - Math.cos(a) * 138}`} stroke={K} strokeWidth={i % 5 ? 3 : 8} />;
          })}
          <path d={`M760 860 L${760 + Math.sin(2.4) * 70} ${860 - Math.cos(2.4) * 70}`} stroke={K} strokeWidth="12" strokeLinecap="round" />
          <path d={`M760 860 L${760 + Math.sin(5.6) * 100} ${860 - Math.cos(5.6) * 100}`} stroke={K} strokeWidth="8" strokeLinecap="round" />
          <g transform={`rotate(${sec} 760 860)`}>
            <path d="M760 890 V732" stroke={P.accento} strokeWidth="5" strokeLinecap="round" />
            <circle cx="760" cy="860" r="10" fill={P.accento} stroke={K} strokeWidth="3" />
          </g>
          <path d="M650 770 Q700 720 770 716" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" opacity=".6" />
          {/* neon */}
          {[180, 540].map((x, i) => (
            <g key={x}>
              <rect x={x - 110} y="740" width="220" height="16" rx="8" fill="#EAF6FF" />
              <Beam id={`tp-beam${i}`} x={x} y={756} t={t} length={720} spread={360} color="#DCEFFF" angle={90} opacity={0.18} />
              <Glow id={`tp-neon${i}`} x={x} y={748} r={170} t={t} color="#DCEFFF" amp={0.04} rate={7 + i * 3} opacity={0.5} />
            </g>
          ))}
          <Dust t={t} top={{ y: 760, x0: 80, x1: 280 }} bottom={{ y: 1400, x0: -80, x1: 440 }} seed={8} n={22} color="#E8F2F8" />
        </g>

        {/* PIANO 2 — nastro lontano, pacchi piccoli */}
        <g transform={L(0.5)}>
          <rect x="-200" y="1040" width="1480" height="400" fill="url(#tp-floor)" />
          <path d="M-200 1010 L1280 1080" stroke="#07111A" strokeWidth="44" />
          <path d="M-200 1000 L1280 1070" stroke="url(#tp-belt)" strokeWidth="26" />
          {Array.from({ length: 30 }, (_, i) => {
            const x = -200 + mod(i * 52 + t * 120 * speed, 1560);
            return <path key={i} d={`M${x} ${1000 + (x + 200) * 0.047 - 10} v20`} stroke="#5D7184" strokeWidth="3" />;
          })}
          {FAR.map((b, i) => {
            const x = -260 + mod(b.o + run, 1) * 1640;
            const y = 990 + (x + 200) * 0.047 - b.h / 2;
            return <rect key={i} x={x - b.w / 2} y={y - b.h / 2} width={b.w} height={b.h} fill={b.c} stroke={K} strokeWidth="5" />;
          })}
        </g>

        {/* PIANO 3 — nastro vicino in diagonale, pacchi grandi */}
        <g transform={L(0.7)}>
          <path d="M-200 1330 L1280 1200 V1260 L-200 1400 Z" fill="#0A141D" />
          <path d="M-200 1300 L1280 1170" stroke="#07111A" strokeWidth="60" />
          <path d="M-200 1290 L1280 1160" stroke="url(#tp-belt)" strokeWidth="38" />
          {Array.from({ length: 26 }, (_, i) => {
            const x = -200 + mod(i * 60 - t * 160 * speed, 1560);
            return <path key={i} d={`M${x} ${1290 - (x + 200) * 0.088 - 16} v32`} stroke="#6B8094" strokeWidth="4" />;
          })}
          {NEAR.map((b, i) => {
            const x = 1360 - mod(b.o + run * 1.3, 1) * 1720;
            const y = 1290 - (x + 200) * 0.088 - b.h / 2 - 22;
            return <Parcel key={i} x={x} y={y} w={b.w} h={b.h} d={44} />;
          })}
        </g>

        {/* PIANO 4 — pile di scatole che incorniciano, cronometro sulla pila di destra */}
        <g transform={L(1.2)}>
          <Parcel x={60} y={1640} w={300} h={220} d={70} />
          <Parcel x={10} y={1430} w={240} h={180} d={60} rot={-3} />
          <Parcel x={1010} y={1660} w={320} h={240} d={70} />
          <Parcel x={1050} y={1440} w={240} h={170} d={60} rot={4} />
          {/* cronometro */}
          <g transform={`translate(960 1300) scale(${0.9 + 0.1 * stop})`}>
            <Glow id="tp-sw" x={0} y={0} r={140} t={t} color="#FFD9A0" amp={0.1} rate={4} opacity={0.3 * stop} />
            <rect x="-14" y="-104" width="28" height="22" rx="6" fill="#C9CED2" stroke={K} strokeWidth="5" />
            <circle r="86" fill="#D4D9DD" stroke={K} strokeWidth="9" />
            <circle r="68" fill="#F7F4EC" stroke="#8A97A2" strokeWidth="4" />
            <path d={`M0 0 L${Math.sin(t * 6.28 * stop) * 56} ${-Math.cos(t * 6.28 * stop) * 56}`} stroke={P.accento} strokeWidth="5" strokeLinecap="round" />
            <circle r="7" fill={K} />
          </g>
        </g>

        {/* PIANO 5 — pulviscolo davanti alla camera */}
        <g transform={L(1.7)}><NearMotes id="tp-near" t={t} color="#E8F2F8" n={7} opacity={0.1} /></g>
      </g>
      <Finish id="tp" tint="#3B4C66" tintOpacity={0.12} />
    </svg>
  );
};
