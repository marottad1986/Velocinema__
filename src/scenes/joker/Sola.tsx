import React from 'react';
import { camera, eio, eo, lerp, seg } from '../../lib/anim';
import { Drips, Dust, Glow, NearMotes, Rain } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { JokerDefs, K, Ombra } from './Comuni';

// Da solo: la stanza d'ospedale della madre, di notte. Pareti verde pallido, la tenda divisoria, l'asta della flebo che
// gocciola, il letto con le lenzuola bianche e il cuscino, il monitor con la linea verde (oggetto chiave). Dalla grande
// finestra si vede il palazzo di fronte sotto la pioggia, con una sola finestra calda: la casa della vicina.
// Eventi: prima frase nella finestra di fronte si accende la luce calda, con due tazze e una rosa sul davanzale (l'amore
// che Arthur credeva vero); seconda frase quella luce si spegne e tazze e rosa svaniscono; terza frase il monitor batte
// a tempo con i bip dello spartito (griglia a 96 bpm), poi a cue 2 + 1,6 la linea si appiattisce in rosso (accento) e il
// cuscino scivola a terra. Nessuna persona.
// Piani: palazzo di fronte con la pioggia (0,25) · parete, finestra, tenda (0,5) · monitor e flebo (0,7) · letto (0,9)
//        · sponda del letto e sedia in primo piano (1,2) · pulviscolo e particelle vicine (1,5–1,8)

const BEAT = 60 / 96;
const OFFSET = 64 % BEAT; // il capitolo comincia a 64 s: i battiti cadono sulla griglia della musica

export const Sola: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const warm = eo(seg(t, cues[0] + 0.4, cues[0] + 1.2)) * (1 - eio(seg(t, cues[1] + 0.6, cues[1] + 1.8)));
  const flatT = cues[2] + 1.6;
  const flat = t > flatT;
  const ph = ((t + OFFSET) % BEAT) / BEAT;
  const beat = flat ? 0 : Math.max(0, 1 - ph * 5);
  const fall = eio(seg(t, flatT + 0.3, flatT + 0.9));
  const scroll = (t * 120) % 280;

  // la traccia del monitor: un picco a ogni battito, piatta dopo cue 2 + 1,6
  const trace = Array.from({ length: 28 }, (_, i) => {
    const x = -130 + i * 10;
    const local = ((i * 10 + scroll) % 140) / 140;
    const y = flat ? 0 : local > 0.42 && local < 0.48 ? -60 : local > 0.48 && local < 0.54 ? 30 : 0;
    return `${i ? 'L' : 'M'}${x} ${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="so" />
        <JokerDefs id="so" />
        <Lin id="so-night" stops={[[0, '#0A0E16'], [1, '#1A2230']]} />
        <Lin id="so-wall" stops={[[0, '#26302E'], [0.4, '#4A5A56'], [0.75, '#7A8A84'], [1, '#5A6A64']]} />
        <Lin id="so-sheet" stops={[[0, '#F4F6F4'], [1, '#B8C4C4']]} />
        <Lin id="so-curtain" x2={1} y2={0} stops={[[0, '#6A8A84'], [0.5, '#9AB8B0'], [1, '#5A7A74']]} />
        <Lin id="so-floor" stops={[[0, '#6A7672'], [1, '#2A3230']]} />
        <Lin id="so-mon" x2={1} y2={0} stops={[[0, '#2A2E30'], [0.5, '#4A5054'], [1, '#202426']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — il palazzo di fronte sotto la pioggia, con la finestra della vicina (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#so-night)" />
          <rect x="560" y="560" width="520" height="560" fill="url(#so-brick2)" />
          {Array.from({ length: 24 }, (_, i) => <path key={i} d={`M560 ${570 + i * 22} H1080`} stroke="#000" strokeWidth="2" opacity=".2" />)}
          {[[700, 720], [930, 740], [700, 980], [930, 1000]].map(([x, y], i) => (
            <g key={i}>
              <rect x={x - 80} y={y - 100} width="160" height="200" fill="#14181E" stroke={K} strokeWidth="5" />
              <path d={`M${x} ${y - 100} V${y + 100} M${x - 80} ${y} H${x + 80}`} stroke={K} strokeWidth="4" />
              <rect x={x - 90} y={y + 100} width="180" height="12" fill="#5A4A40" stroke={K} strokeWidth="3" />
            </g>
          ))}
          {/* la finestra della vicina: luce calda, tende, due tazze e una rosa sul davanzale */}
          <g opacity={warm}>
            <rect x="850" y="640" width="160" height="200" fill="#F2B860" />
            <path d="M850 640 h56 q-14 100 0 200 h-56 Z M1010 640 h-56 q14 100 0 200 h56 Z" fill="#C8743A" opacity=".75" />
            <path d="M930 640 V840 M850 740 H1010" stroke={K} strokeWidth="4" />
            {[885, 920].map((x) => <path key={x} d={`M${x - 13} 838 V816 H${x + 13} V838 Z`} fill="#F2E6D0" stroke={K} strokeWidth="3" />)}
            <path d="M972 838 V804" stroke="#3A6A3A" strokeWidth="4" />
            <circle cx="972" cy="798" r="10" fill={P.accento} stroke={K} strokeWidth="2" />
            <Glow id="so-warm" x={930} y={740} r={260} t={t} color="#FFC870" amp={0.06} rate={2} opacity={0.75} />
          </g>
          <svg x="560" y="560" width="520" height="560" viewBox="0 0 520 560"><Rain t={t} level="far" color="#8AA0B8" opacity={0.6} /></svg>
        </g>

        {/* PIANO 1 — parete della stanza con la finestra, la tenda divisoria (0,5) */}
        <g transform={L(0.5)}>
          <path d="M-200 -200 H1280 V1300 H-200 Z M600 600 V1060 H1040 V600 Z" fill="url(#so-wall)" fillRule="evenodd" />
          <rect x="590" y="590" width="460" height="480" fill="none" stroke="#C8D0CC" strokeWidth="22" />
          <rect x="590" y="590" width="460" height="480" fill="none" stroke={K} strokeWidth="6" />
          <path d="M820 590 V1070" stroke="#C8D0CC" strokeWidth="14" />
          <path d="M820 590 V1070" stroke={K} strokeWidth="3" />
          <rect x="570" y="1060" width="500" height="26" fill="#B8C4C0" stroke={K} strokeWidth="6" />
          <path d="M600 610 L700 1050 M640 610 L740 1050" stroke="#FFFFFF" strokeWidth="8" opacity=".05" />
          {/* binario e tenda divisoria a sinistra */}
          <rect x="-200" y="555" width="720" height="10" fill="url(#so-steel)" />
          <path d={`M-200 566 H${330 + Math.sin(t * 0.7) * 6} Q${310 + Math.sin(t * 0.9) * 8} 900 ${340 + Math.sin(t * 0.7) * 10} 1240 H-200 Z`} fill="url(#so-curtain)" stroke={K} strokeWidth="7" />
          {[-100, 20, 140, 250].map((x, i) => <path key={x} d={`M${x} 566 Q${x - 20 + Math.sin(t * 0.8 + i) * 6} 900 ${x + 10} 1240`} stroke="#4A6A64" strokeWidth="6" fill="none" />)}
          {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={-180 + i * 52} cy={562} r="7" fill="#C8D0CC" stroke={K} strokeWidth="3" />)}
          <Glow id="so-ceil" x={300} y={600} r={460} t={t} color="#D8F0E8" amp={0.02} rate={1} opacity={0.18} />
        </g>

        {/* PIANO 2 — monitor su braccio e asta della flebo (0,7) */}
        <g transform={L(0.7)}>
          <path d="M-200 1180 H1280 V2200 H-200 Z" fill="url(#so-floor)" />
          <path d="M-200 1182 H1280" stroke="#9AA6A2" strokeWidth="4" opacity=".6" />
          {/* flebo */}
          <rect x="515" y="640" width="10" height="590" fill="url(#so-steel)" />
          <path d="M470 1230 h100 M490 640 h60" stroke={K} strokeWidth="8" strokeLinecap="round" />
          <path d="M490 650 q-8 60 6 120 h48 q14 -60 6 -120 Z" fill="#D8ECF0" opacity=".85" stroke={K} strokeWidth="5" />
          <rect x="500" y="700" width="40" height="50" fill="#F2F8F8" opacity=".7" />
          <path d="M520 770 V800" stroke="#C8D8DC" strokeWidth="5" />
          <rect x="512" y="800" width="16" height="30" rx="4" fill="#E8F2F4" stroke={K} strokeWidth="3" />
          <Drips t={t} x={520} y0={830} y1={846} n={1} period={1.4} color="#CFE3E8" ripple={0} />
          <path d="M520 846 Q500 960 420 1010" stroke="#C8D8DC" strokeWidth="4" fill="none" />
          {/* monitor */}
          <g transform="translate(250 820)">
            <rect x="-7" y="110" width="14" height="310" fill="url(#so-steel)" /><rect x="-70" y="413" width="140" height="14" rx="7" fill="#5A6168" />
            <rect x="-180" y="-130" width="360" height="240" rx="18" fill="url(#so-mon)" stroke={K} strokeWidth="9" />
            <rect x="-158" y="-110" width="316" height="190" rx="8" fill="#08100C" stroke={K} strokeWidth="4" />
            <Glow id="so-mon" x={0} y={-15} r={300} t={t} color={flat ? P.accento : '#6AE08A'} amp={0.06} rate={6} opacity={flat ? 0.6 : 0.25 + 0.35 * beat} />
            <path d={trace} transform="translate(0 -10)" stroke={flat ? P.accento : '#6AE08A'} strokeWidth="6" fill="none" strokeLinejoin="round" />
            <text x="120" y="-70" textAnchor="end" fontFamily="monospace" fontWeight={700} fontSize="34" fill={flat ? P.accento : '#6AE08A'}>{flat ? '0' : '72'}</text>
            <circle cx="136" cy="-82" r="8" fill={flat ? P.accento : '#6AE08A'} opacity={flat ? 1 : beat} />
            {[-120, -80, -40].map((x) => <circle key={x} cx={x} cy={96} r="8" fill="#5A6064" stroke={K} strokeWidth="3" />)}
            <path d="M-170 -120 H120" stroke="#9AA2A8" strokeWidth="4" opacity=".5" />
          </g>
        </g>

        {/* PIANO 3 — il letto con le lenzuola e il cuscino (0,9) */}
        <g transform={L(0.9)}>
          <Ombra id="so" x={720} y={1250} rx={420} ry={30} />
          <rect x="351" y="1000" width="18" height="240" fill="url(#so-steel)" /><rect x="1091" y="1000" width="18" height="240" fill="url(#so-steel)" />
          <path d="M350 980 Q350 920 400 920 H420 V1000 H350 Z" fill="#C8D0CC" stroke={K} strokeWidth="7" />
          <rect x="380" y="1000" width="740" height="110" rx="20" fill="url(#so-sheet)" stroke={K} strokeWidth="8" />
          <path d="M560 1004 Q700 1040 900 1006 Q1000 1000 1110 1020" stroke="#9AAAAA" strokeWidth="5" fill="none" />
          <path d="M600 1060 q80 20 160 0 M820 1070 q80 16 160 0" stroke="#9AAAAA" strokeWidth="4" fill="none" />
          <path d="M392 1010 H1100" stroke="#FFFFFF" strokeWidth="5" opacity=".7" />
          <rect x="380" y="1110" width="740" height="40" fill="#8A9696" stroke={K} strokeWidth="6" />
          {[420, 1080].map((x) => <circle key={x} cx={x} cy={1230} r="14" fill={K} />)}
          {/* il cuscino: sul letto, poi scivola a terra dopo la linea piatta */}
          <g transform={`translate(${lerp(500, 340, fall)} ${lerp(980, 1210, fall)}) rotate(${lerp(-6, -28, fall)})`}>
            <path d="M-110 -34 Q-120 0 -110 34 Q0 50 110 34 Q120 0 110 -34 Q0 -50 -110 -34 Z" fill="url(#so-sheet)" stroke={K} strokeWidth="7" />
            <path d="M-70 -6 Q0 12 70 -6" stroke="#9AAAAA" strokeWidth="5" fill="none" />
            <path d="M-96 -26 Q-40 -40 20 -36" stroke="#FFFFFF" strokeWidth="5" fill="none" opacity=".8" />
          </g>
        </g>

        {/* PIANO 4 — sponda del letto e sedia in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <rect x="-200" y="1546" width="1480" height="28" fill="url(#so-steel)" />
          <path d="M-200 1560 H1280" stroke={K} strokeWidth="4" transform="translate(0 16)" />
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-128 + i * 160} y="1574" width="16" height="626" fill="url(#so-steel)" />)}
          <path d="M760 1440 h280 v-300 q0 -30 -30 -30 h-220 q-30 0 -30 30 Z" fill="#5A6A80" stroke={K} strokeWidth="9" opacity=".95" />
          <path d="M780 1150 h240" stroke="#9AAAC0" strokeWidth="5" opacity=".6" />
        </g>

        {/* PIANO 5 — pulviscolo nella luce della finestra, particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 640, x0: 620, x1: 1020 }} bottom={{ y: 1200, x0: 380, x1: 1000 }} seed={7} n={20} color="#D8E8F0" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="so-near" t={t} color="#D8E8F0" n={5} opacity={0.07} />
        </g>
      </g>
      <Finish id="so" tint="#1E2A30" tintOpacity={0.15} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): finestra calda cue0 + 0,4 · si spegne cue1 + 0,6 → 1,8 · bip a 96 bpm · linea piatta cue2 + 1,6 · cuscino + 0,3.
