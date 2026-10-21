import React from 'react';
import { camera, eo, lerp, seg } from '../../lib/anim';
import { DISPLAY } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Dust, Embers, Glow, NearMotes, Smoke, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Collar, K, Pines, TINT } from './Winden';

// Chi rapisce i bambini: bunker di cemento nel bosco. La porta di metallo arrugginita è aperta sulle felci; al centro una
// sedia di ferro piena di cavi e bobine sotto una corona di lampadine; appeso a un gancio il colletto da prete di Noah;
// sul muro i manifesti dei bambini scomparsi (solo «?»). Nessuna persona.
// Eventi: la porta si apre e entra la luce (cue 0) · il colletto si illumina (cue 1) · la sedia si accende: lampadine
//         una dopo l'altra, scintille (cue 2) · le lampadine scoppiano e si spengono, fumo (cue 3).
// Piani: bosco fuori dalla porta (0,25) · pareti di cemento, manifesti (0,45) · sedia e lampadine (0,7)
//        · cavi, casse e tubi (1,2) · scintille, pulviscolo e particelle (1,5–1,8)

const BULBS = Array.from({ length: 9 }, (_, i) => {
  const a = Math.PI * (1.1 + (i / 8) * 0.8);
  return { x: 560 + Math.cos(a) * 230, y: 830 + Math.sin(a) * 190 };
});

export const Bunker: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const door = eo(seg(t, cues[0], cues[0] + 1.2));
  const collar = eo(seg(t, cues[1], cues[1] + 0.5));
  const power = seg(t, cues[2], cues[2] + 0.4);
  const bulbOn = (i: number) => seg(t, cues[2] + 0.3 + i * 0.18, cues[2] + 0.4 + i * 0.18);
  const bulbOff = (i: number) => seg(t, cues[3] + 0.2 + i * 0.12, cues[3] + 0.3 + i * 0.12);
  const flash = flashAt(t, [cues[2] + 2.0, cues[3] + 0.15], [0.8, 1]);
  const live = BULBS.reduce((a, _, i) => a + bulbOn(i) * (1 - bulbOff(i)), 0) / BULBS.length;
  const hum = power * (1 - seg(t, cues[3] + 1.2, cues[3] + 1.6));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="bu" />
        <Lin id="bu-out" stops={[[0, '#2A4A3A'], [0.6, '#4E7A5E'], [1, '#2E4A36']]} />
        <Lin id="bu-wall" stops={[[0, '#1A1E1C'], [0.4, '#2E3431'], [0.7, '#3A403C'], [1, '#22262A']]} />
        <Lin id="bu-floor" stops={[[0, '#2A2E2B'], [1, '#0C0E0D']]} />
        <Lin id="bu-door" x2={1} y2={0} stops={[[0, '#6A4A32'], [0.5, '#8A5E3E'], [1, '#4A3222']]} />
        <Lin id="bu-iron" x2={1} y2={0} stops={[[0, '#4A4E4C'], [0.5, '#7A807C'], [1, '#2E3230']]} />
        <Lin id="bu-copper" x2={1} y2={0} stops={[[0, '#B8743A'], [0.5, '#E0A060'], [1, '#7A4A22']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — bosco di giorno oltre la porta (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="#14181A" />
          <rect x="60" y="640" width="260" height="560" fill="url(#bu-out)" />
          <clipPath id="bu-doorway"><rect x="60" y="640" width="260" height="560" /></clipPath>
          <g clipPath="url(#bu-doorway)">
            <Pines t={t} y={1100} n={4} h={360} seed={41} color="#1E3A2C" x0={0} x1={400} sway={3} />
            {[100, 180, 260].map((x, i) => <path key={x} d={`M${x} 1200 q-30 -90 -60 -110 M${x} 1200 q30 -100 60 -120`} stroke="#3E6A4A" strokeWidth="14" fill="none" strokeLinecap="round" transform={`rotate(${Math.sin(t + i) * 3} ${x} 1200)`} />)}
          </g>
        </g>

        {/* PIANO 1 — pareti di cemento, manifesti dei bambini scomparsi (0,45) */}
        <g transform={L(0.45)}>
          <path d="M-200 -200 H1280 V1220 H-200 Z M60 640 V1200 H320 V640 Z" fill="url(#bu-wall)" fillRule="evenodd" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M-200 ${700 + i * 100} H1280`} stroke="#14181A" strokeWidth="4" opacity=".5" />)}
          <rect x="40" y="620" width="300" height="600" fill="none" stroke={K} strokeWidth="14" />
          {/* porta di metallo che si apre */}
          <path d={`M320 640 L${lerp(320, 420, door)} ${lerp(640, 610, door)} L${lerp(320, 420, door)} ${lerp(1200, 1230, door)} L320 1200 Z`} fill="url(#bu-door)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d={`M60 640 H${lerp(320, 60, door) } V1200 H60 Z`} fill="url(#bu-door)" stroke={K} strokeWidth="8" opacity={1 - door} />
          <Beam id="bu-sun" x={190} y={700} t={t} length={700} spread={420} color="#E8F2C8" angle={58} opacity={0.35 * door} />
          {[0, 1, 2].map((k) => (
            <g key={k} transform={`translate(${800 + k * 110} ${1010 + (k % 2) * 30}) rotate(${(k - 1) * 4})`}>
              <rect x="-42" y="-56" width="84" height="112" fill="#D8D2C0" stroke={K} strokeWidth="5" />
              <text y="-34" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="14" fill="#B8443A">SCOMPARSO</text>
              <text y="22" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="46" fill="#4A4438">?</text>
            </g>
          ))}
          {/* gancio con il colletto di Noah */}
          <path d="M900 760 v30" stroke={K} strokeWidth="8" />
          <g transform="translate(900 820)">
            <Glow id="bu-cg" x={0} y={10} r={160} t={t} color="#F2F0EA" amp={0.1} rate={2.4} opacity={0.5 * collar} />
            <Collar scale={0.9} />
          </g>
        </g>

        {/* PIANO 2 — la sedia di ferro con cavi, bobine e la corona di lampadine (0,7) */}
        <g transform={L(0.7)}>
          <path d="M-200 1200 H1280 V2200 H-200 Z" fill="url(#bu-floor)" />
          <Glow id="bu-chair" x={560} y={900} r={460} t={t} color="#DDEBFF" amp={0.12} rate={11} opacity={0.45 * live + 0.2 * flash} />
          <g transform="translate(560 1200)">
            <path d="M-110 0 V-230 M110 0 V-230 M-130 -230 H130" stroke={K} strokeWidth="14" />
            <rect x="-120" y="-250" width="240" height="40" rx="6" fill="url(#bu-iron)" stroke={K} strokeWidth="8" />
            <path d="M-110 -250 V-480 Q0 -520 110 -480 V-250" fill="url(#bu-iron)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
            <path d="M-150 -320 H-110 M110 -320 H150" stroke={K} strokeWidth="18" strokeLinecap="round" />
            {[-70, 0, 70].map((x) => <path key={x} d={`M${x} -470 V-270`} stroke="#2E3230" strokeWidth="6" />)}
            {/* bobine di rame ai lati */}
            {[-190, 190].map((x) => (
              <g key={x} transform={`translate(${x} -120)`}>
                <rect x="-36" y="-110" width="72" height="110" rx="10" fill="url(#bu-copper)" stroke={K} strokeWidth="7" />
                {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M-36 ${-100 + i * 14} H36`} stroke="#7A4A22" strokeWidth="4" />)}
                <circle cy="-120" r="14" fill={hum > 0 ? '#DDEBFF' : '#4A4E4C'} stroke={K} strokeWidth="5" />
              </g>
            ))}
          </g>
          {/* corona di lampadine */}
          {BULBS.map((b, i) => {
            const on = bulbOn(i) * (1 - bulbOff(i));
            const broken = bulbOff(i) > 0.5;
            return (
              <g key={i}>
                <path d={`M${b.x} ${b.y} L560 ${730}`} stroke="#2E3230" strokeWidth="4" />
                <Glow id={`bu-b${i}`} x={b.x} y={b.y} r={80} t={t} color="#FFF4D0" amp={0.2} rate={14} ph={i} opacity={0.8 * on} />
                <circle cx={b.x} cy={b.y} r="20" fill={on > 0.5 ? '#FFF8E0' : broken ? '#2A2E2C' : '#6E7270'} stroke={K} strokeWidth="5" />
                {broken && <path d={`M${b.x - 10} ${b.y - 8} l8 8 l-6 6 l10 4`} fill="none" stroke="#8A8E8C" strokeWidth="3" />}
                {broken && <Smoke id={`bu-s${i}`} t={t + i} x={b.x} y={b.y} color="#8A9490" n={3} rise={140} wind={-40} r0={8} r1={40} speed={0.5} opacity={0.6 * (1 - seg(t, cues[3] + 2.5, dur))} />}
              </g>
            );
          })}
          <circle cx="560" cy="730" r="26" fill="url(#bu-copper)" stroke={K} strokeWidth="6" />
          {/* cavi che serpeggiano sul pavimento */}
          {[[-160, 1300, 0], [1240, 1340, 1], [300, 1700, 2]].map(([x, y, k]) => (
            <path key={k} d={`M${560 + (k - 1) * 80} 1200 C${560 + (k - 1) * 120} 1300 ${(560 + x) / 2} ${y + 60} ${x} ${y}`} fill="none" stroke={k === 1 ? '#5A2A22' : '#1A1E1C'} strokeWidth="9" strokeLinecap="round" />
          ))}
        </g>

        {/* PIANO 3 — tubi in alto, casse e bobina di cavo in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 180 H1280" stroke="url(#bu-iron)" strokeWidth="40" />
          <path d="M-200 180 H1280" stroke={K} strokeWidth="4" opacity=".5" />
          {[120, 480, 860].map((x) => <rect key={x} x={x} y="156" width="24" height="48" fill="#3A3E3C" stroke={K} strokeWidth="5" />)}
          <path d="M1100 180 V560 Q1100 600 1060 600 H1000" fill="none" stroke="url(#bu-iron)" strokeWidth="30" />
          <g transform="translate(-40 1620)">
            <rect x="-120" y="-220" width="300" height="230" fill="#4A3A28" stroke={K} strokeWidth="9" />
            <path d="M-120 -110 H180 M30 -220 V10" stroke={K} strokeWidth="6" />
          </g>
          <g transform="translate(980 1720)">
            <circle r="170" fill="#3A2A1C" stroke={K} strokeWidth="10" />
            {[150, 120, 90].map((rr) => <circle key={rr} r={rr} fill="none" stroke="#7A2A22" strokeWidth="14" />)}
            <circle r="40" fill="#2A2018" stroke={K} strokeWidth="8" />
          </g>
        </g>

        {/* PIANO 4 — scintille dalla sedia, pulviscolo nel fascio della porta, particelle (1,5–1,8) */}
        <g transform={L(0.7)}>
          {hum > 0 && <Embers t={t} x={560} y={760} w={420} h={320} n={22} hot="#FFFFFF" warm="#BFD8FF" drift={60} seed={7} />}
        </g>
        <g transform={L(0.45)}>
          <Dust t={t} top={{ y: 660, x0: 120, x1: 300 }} bottom={{ y: 1300, x0: 300, x1: 760 }} n={36} color="#F2F6DA" boost={0.2 * door - 0.2} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="bu-near" t={t} color="#D8E0D8" n={5} vx={-25} vy={-6} opacity={0.08} />
        </g>
      </g>

      <rect width="1080" height="1920" fill="#E8F2FF" opacity={flash * 0.35} />
      <Finish id="bu" tint={TINT} tintOpacity={0.12} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): porta cue0 · colletto cue1 · sedia e lampadine da cue2+0,3 (0,18 s l'una), lampo a cue2+2
// · lampadine che scoppiano da cue3+0,2 (0,12 s l'una), lampo a cue3+0,15.
