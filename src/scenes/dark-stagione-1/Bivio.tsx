import React from 'react';
import { camera, eio, eo, eob, lerp, seg } from '../../lib/anim';
import { DISPLAY } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Drips, Flyers, Glow, NearMotes, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Badge, Cards, K, RED, Raincoat, TINT, YELLOW } from './Winden';

// La scelta di Jonas: bivio nel cunicolo della grotta. A sinistra la porta del 1986, socchiusa, con luce calda e il mazzo
// di carte di Mikkel sulla soglia; a destra la porta del 1953, da cui escono foglie secche. Al centro, su uno sperone di
// roccia, l'impermeabile di Jonas. A terra il distintivo e la torcia di Ulrich. Nessuna persona.
// Eventi: la porta del 1986 si apre (cue 0) · freccia tratteggiata «a casa» dalle carte verso di noi (cue 1)
//         · l'impermeabile sbiadisce: se lo riporta, Jonas non esiste; la freccia si cancella e l'impermeabile torna (cue 2)
//         · la torcia rotola verso la porta del 1953, che si accende fredda (cue 3) · scendono le sbarre (cue 4).
// Piani: fondo della grotta (0,25) · pareti e due porte (0,5) · sperone con l'impermeabile, soglie (0,7)
//        · rocce ai bordi (1,2) · gocce, foglie e particelle (1,5–1,8)

const LEFT = 300, RIGHT = 790;

export const Bivio: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const open86 = eo(seg(t, cues[0], cues[0] + 0.8));
  const home = eo(seg(t, cues[1] + 0.3, cues[1] + 1.2)) * (1 - eo(seg(t, cues[2] + 1.2, cues[2] + 1.8)));
  const fade = seg(t, cues[2], cues[2] + 0.5) * (1 - seg(t, cues[2] + 1.3, cues[2] + 1.8));
  const roll = eio(seg(t, cues[3] + 0.3, cues[3] + 1.6));
  const open53 = eo(seg(t, cues[3] + 1.0, cues[3] + 1.6));
  const bars = eob(seg(t, cues[4] + 0.6, cues[4] + 0.9), 1);
  const slam = flashAt(t, [cues[4] + 0.85], [0.6]);

  const Door: React.FC<{ x: number; open: number; light: string; year: number; id: string }> = ({ x, open, light, year, id }) => (
    <g transform={`translate(${x} 0)`}>
      <path d="M-150 1170 V840 Q-150 700 0 700 Q150 700 150 840 V1170 Z" fill="#0A0C0B" stroke={K} strokeWidth="10" />
      <path d="M-110 1170 V860 Q-110 760 0 760 Q110 760 110 860 V1170 Z" fill={light} opacity={0.15 + 0.85 * open} />
      <Glow id={`${id}-g`} x={0} y={980} r={300} t={t} color={light} amp={0.08} rate={2} opacity={0.65 * open} />
      <path d={`M-110 1170 V860 Q-110 760 0 760 V1170 Z`} fill="#5A5E5C" stroke={K} strokeWidth="7" transform={`translate(-110 0) scale(${1 - open * 0.75} 1) translate(110 0)`} />
      <path d={`M110 1170 V860 Q110 760 0 760 V1170 Z`} fill="#4A4E4C" stroke={K} strokeWidth="7" transform={`translate(110 0) scale(${1 - open * 0.75} 1) translate(-110 0)`} />
      <g transform="translate(0 660)">
        <rect x="-86" y="-34" width="172" height="68" rx="10" fill={open > 0.5 ? YELLOW : '#2A2A24'} stroke={K} strokeWidth="7" />
        <text y="18" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="50" fill={open > 0.5 ? K : '#8A8A78'}>{year}</text>
      </g>
    </g>
  );

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="bv" />
        <Lin id="bv-back" stops={[[0, '#0A0C0B'], [0.5, '#1E2420'], [1, '#2A2E28']]} />
        <Lin id="bv-rock" x2={1} y2={0} stops={[[0, '#2A2E28'], [0.5, '#3E443C'], [1, '#1E221E']]} />
        <Lin id="bv-floor" stops={[[0, '#2E322C'], [1, '#0C0E0C']]} />
        <Lin id="bv-edge" x2={1} y2={0} stops={[[0, '#0C0E0C'], [1, '#24281F']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — fondo della grotta (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#bv-back)" />
        </g>

        {/* PIANO 1 — parete di roccia con le due porte (0,5) */}
        <g transform={L(0.5)}>
          <path d="M-200 600 Q300 560 540 600 Q800 640 1280 590 V1240 H-200 Z" fill="url(#bv-rock)" />
          {[[160, 640], [540, 640], [920, 640], [540, 1000]].map(([x, y], i) => <path key={i} d={`M${x - 40} ${y} q30 40 10 90 q-20 40 20 80`} fill="none" stroke="#14160F" strokeWidth="5" opacity=".7" />)}
          <Door x={LEFT} open={open86} light="#FFD99A" year={1986} id="bv-l" />
          <Door x={RIGHT} open={open53} light="#B8D4E8" year={1953} id="bv-r" />
          {/* foglie secche che escono dal 1953 */}
          <g opacity={0.4 + 0.6 * open53}>
            {[0, 1, 2, 3].map((k) => <path key={k} d={`M${RIGHT - 80 + k * 50} ${1150 - (k % 2) * 10} q10 -14 22 0 q-10 14 -22 0`} fill="#8A6A3A" stroke={K} strokeWidth="3" />)}
          </g>
          {/* sbarre di una vecchia cella che scendono sulla porta del 1953 */}
          <g transform={`translate(${RIGHT} ${lerp(-520, 0, bars)})`} opacity={seg(t, cues[4] + 0.5, cues[4] + 0.6)}>
            <path d="M-130 700 H130 M-130 1080 H130" stroke="#3A3E3C" strokeWidth="18" />
            {[-100, -50, 0, 50, 100].map((x) => <path key={x} d={`M${x} 700 V1170`} stroke="#5A5E5C" strokeWidth="14" />)}
            {[-100, -50, 0, 50, 100].map((x) => <path key={`k${x}`} d={`M${x - 4} 700 V1170`} stroke="#9AA0A0" strokeWidth="3" />)}
          </g>
        </g>

        {/* PIANO 2 — pavimento, carte sulla soglia, sperone con l'impermeabile, distintivo e torcia (0,7) */}
        <g transform={L(0.7)}>
          <path d="M-200 1170 Q540 1150 1280 1170 V2200 H-200 Z" fill="url(#bv-floor)" />
          <path d="M300 1170 Q420 1500 340 2200 M790 1170 Q680 1500 760 2200" fill="none" stroke="#3E443C" strokeWidth="6" opacity=".6" />
          <g transform={`translate(${LEFT} 1080)`}>
            <Glow id="bv-kg" x={0} y={0} r={160} t={t} color={YELLOW} amp={0.1} rate={2.4} opacity={0.5 * open86} />
            <Cards fan={0.3} scale={0.5} />
          </g>
          {/* freccia «a casa?» dalle carte verso di noi */}
          <path d={`M${LEFT} 1140 Q${LEFT + 40} 1340 ${LEFT + 160} 1520`} fill="none" stroke={YELLOW} strokeWidth="8" strokeDasharray="18 16" strokeLinecap="round" opacity={home} />
          <path d={`M${LEFT + 130} 1500 l34 24 l6 -40`} fill="none" stroke={YELLOW} strokeWidth="8" strokeLinecap="round" opacity={home} />
          <text x={LEFT + 200} y={1470} fontFamily={DISPLAY} fontWeight={800} fontSize="40" fill={YELLOW} opacity={home}>a casa?</text>
          {/* sperone con l'impermeabile: sbiadisce se Mikkel torna a casa */}
          <path d="M440 1180 L500 760 Q540 730 580 760 L640 1180 Z" fill="url(#bv-rock)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <g transform="translate(545 790)" opacity={1 - 0.8 * fade}>
            <Raincoat id="bv-rc" t={t} scale={0.55} wind={0.6} glow={0.4 * (1 - fade)} wet={false} />
          </g>
          {fade > 0.3 && <path d="M470 820 L620 1010 M620 820 L470 1010" stroke={RED} strokeWidth="10" strokeLinecap="round" opacity={fade} />}
          {/* torcia di Ulrich che rotola verso il 1953, distintivo a terra */}
          <Beam id="bv-tb" x={lerp(620, 760, roll)} y={1290 - roll * 80} t={t} length={420} spread={170} color="#FFF0C0" angle={lerp(10, -70, roll)} opacity={0.45 * seg(t, cues[3], cues[3] + 0.3)} />
          <g transform={`translate(${lerp(620, 760, roll)} ${1290 - roll * 80}) rotate(${roll * 300 - 20})`} opacity={seg(t, cues[3], cues[3] + 0.3)}>
            <rect x="-60" y="-16" width="60" height="32" rx="8" fill="#2E2E3A" stroke={K} strokeWidth="6" />
            <circle cx="2" r="12" fill="#FFF0C0" />
          </g>
          <g transform="translate(870 1290) rotate(-12)" opacity={seg(t, cues[3], cues[3] + 0.3)}>
            <Glow id="bv-bg" x={0} y={0} r={130} t={t} color="#DDE8F0" amp={0.1} rate={2.4} opacity={0.5} />
            <Badge scale={0.85} shine={seg(t, cues[3] + 0.2, cues[3] + 1)} />
          </g>
        </g>

        {/* PIANO 3 — rocce ai bordi e in basso (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 500 H40 Q100 800 60 1100 Q30 1400 120 1700 L80 2200 H-200 Z" fill="url(#bv-edge)" stroke={K} strokeWidth="10" />
          <path d="M1280 500 H1030 Q980 800 1030 1100 Q1060 1400 980 1700 L1020 2200 H1280 Z" fill="url(#bv-edge)" stroke={K} strokeWidth="10" />
          {[[200, 1800, 120], [520, 1900, 90], [860, 1820, 130]].map(([x, y, rr], i) => <ellipse key={i} cx={x} cy={y} rx={rr} ry={rr * 0.5} fill="#1A1E1A" stroke={K} strokeWidth="9" />)}
          <ellipse cx="560" cy="1620" rx="200" ry="34" fill="#1E2A26" stroke={K} strokeWidth="6" />
          <ellipse cx="560" cy="1616" rx="90" ry="10" fill="#FFD99A" opacity={0.2 * open86} />
        </g>

        {/* PIANO 4 — gocce, foglie secche che volano, particelle (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Drips t={t} x={150} y0={560} y1={1620} n={2} period={2.9} color="#9AB8B0" ripple={60} />
          <g opacity={open53}><Flyers t={t} seed={19} n={5} shape="leaf" color="#8A6A3A" outline={K} speed={0.12} y0={700} y1={1500} /></g>
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="bv-near" t={t} color="#D8D0B0" n={5} vx={-20} vy={-6} opacity={0.07} />
        </g>
      </g>

      <rect width="1080" height="1920" fill="#DDE8F0" opacity={slam * 0.3} />
      <Finish id="bv" tint={TINT} tintOpacity={0.12} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): porta del 1986 cue0 · freccia «a casa?» cue1+0,3 · impermeabile che sbiadisce cue2 (torna
// a cue2+1,3) · torcia e porta del 1953 da cue3 · sbarre che scendono cue4+0,6 (colpo a cue4+0,85).
