import React from 'react';
import { camera, eio, eo, lerp, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes, Smoke } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Corn, GOLD } from './Spazio';

// La partenza: la cameretta di Murph al tramonto. Sul letto un orologio da polso lasciato in regalo; la porta si chiude
// sbattendo; dalla finestra, oltre il campo di mais, la scia del razzo che sale. Nessuna persona.
// Eventi: la porta sbatte (cue 1, «non lo saluta») · l'orologio sul letto brilla (cue 2) · la lancetta ticchetta (cue 3)
//         · il razzo parte con la scia e la stanza vibra (cue 4).
// Piani: cielo del tramonto (0,2) · campo di mais e orizzonte (0,35) · parete con finestra e porta (0,55)
//        · letto con l'orologio (0,8) · comodino e lampada in primo piano (1,2) · pulviscolo e particelle (1,5–1,8)

const K = '#140E0A';

export const Partenza: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const slam = eio(seg(t, cues[1] + 0.2, cues[1] + 0.55));
  const bang = seg(t, cues[1] + 0.55, cues[1] + 0.6) * (1 - seg(t, cues[1] + 0.6, cues[1] + 0.9));
  const watch = seg(t, cues[2] - 0.2, cues[2] + 0.4);
  const tick = Math.floor(t * 1) * 6;
  const launch = seg(t, cues[4] - 0.3, dur);
  const rise = eo(launch);
  const shake = launch > 0 ? Math.sin(t * 60) * 3 * (1 - launch * 0.5) : 0;
  const rx = 760, ry = lerp(1010, 650, rise);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pa" />
        <Lin id="pa-sky" stops={[[0, '#3A4A6A'], [0.45, '#C9846A'], [0.75, '#F2B87A'], [1, '#F6D49A']]} />
        <Lin id="pa-wall" stops={[[0, '#2A2420'], [0.45, '#4A3C30'], [0.8, '#5A4A3A'], [1, '#3A2E24']]} />
        <Lin id="pa-door" x2={1} y2={0} stops={[[0, '#5A4430'], [0.5, '#7A5E42'], [1, '#4A3626']]} />
        <Lin id="pa-blanket" x2={1} y2={1} stops={[[0, '#6A7A8E'], [0.6, '#4E5E72'], [1, '#3A4858']]} />
        <Lin id="pa-floor" stops={[[0, '#4A3828'], [1, '#1E160E']]} />
        <Lin id="pa-trail" stops={[[0, '#FFF6DC', 0.9], [1, '#E8B04A', 0]]} />
      </defs>

      <g transform={`${cam.transform} translate(${shake} 0)`}>
        {/* PIANO 0 — cielo del tramonto con la scia del razzo (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#pa-sky)" />
          {launch > 0 && (
            <g>
              <path d={`M${rx - 16} 1010 L${rx - 5} ${ry + 30} L${rx + 5} ${ry + 30} L${rx + 16} 1010 Z`} fill="url(#pa-trail)" />
              <Smoke id="pa-smk" t={t} x={rx} y={980} n={8} rise={120} wind={-200} r0={30} r1={110} speed={0.5} color="#E8DCC8" opacity={0.8} />
              <Glow id="pa-flame" x={rx} y={ry + 40} r={70} t={t} color="#FFE6A8" amp={0.3} rate={18} opacity={0.9} />
              <path d={`M${rx - 7} ${ry} L${rx} ${ry - 34} L${rx + 7} ${ry} V${ry + 28} H${rx - 7} Z`} fill="#F4F2EA" stroke={K} strokeWidth="3" />
            </g>
          )}
        </g>

        {/* PIANO 1 — campo di mais all'orizzonte (0,35) */}
        <g transform={L(0.35)}>
          <path d="M-200 1000 Q540 980 1280 1000 V1300 H-200 Z" fill="#6E6A3A" />
          <Corn t={t} y={1040} n={24} h={70} seed={11} color="#7A7A3A" outline="#3A3418" />
        </g>

        {/* PIANO 2 — parete con la finestra e la porta che sbatte (0,55) */}
        <g transform={L(0.55)}>
          <path d="M-200 -200 H1280 V1260 H-200 Z M620 600 V1060 H960 V600 Z" fill="url(#pa-wall)" fillRule="evenodd" />
          <rect x="620" y="600" width="340" height="460" fill="none" stroke={K} strokeWidth="16" />
          <path d="M790 600 V1060 M620 830 H960" stroke={K} strokeWidth="10" />
          <Glow id="pa-win" x={790} y={830} r={420} t={t} color="#F6C88A" amp={0.04} rate={1} opacity={0.4 + 0.3 * launch} />
          {/* porta che si chiude sbattendo */}
          <rect x="40" y="620" width="300" height="640" fill="#120E0A" />
          <g transform={`translate(40 0) scale(${lerp(0.25, 1, slam)} 1) translate(-40 0)`}>
            <rect x="40" y="620" width="300" height="640" fill="url(#pa-door)" stroke={K} strokeWidth="9" />
            <rect x="80" y="670" width="220" height="230" fill="none" stroke={K} strokeWidth="5" opacity=".6" />
            <rect x="80" y="960" width="220" height="250" fill="none" stroke={K} strokeWidth="5" opacity=".6" />
            <circle cx="300" cy="950" r="12" fill={GOLD} stroke={K} strokeWidth="4" />
          </g>
          {bang > 0 && [0, 1, 2].map((i) => <path key={i} d={`M${350 + i * 16} ${760 + i * 120} l30 ${-10 + i * 10}`} stroke="#F4F2EA" strokeWidth="6" strokeLinecap="round" opacity={bang} />)}
        </g>

        {/* PIANO 3 — pavimento e letto con l'orologio (0,8) */}
        <g transform={L(0.8)}>
          <path d="M-200 1260 H1280 V2200 H-200 Z" fill="url(#pa-floor)" />
          <path d="M380 1260 V1120 H1000 V1260 Z" fill="#3A2C20" stroke={K} strokeWidth="8" />
          <path d="M360 1140 Q680 1080 1020 1130 L1040 1270 H340 Z" fill="url(#pa-blanket)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M380 1150 Q680 1096 1000 1140" fill="none" stroke="#9AAABE" strokeWidth="6" opacity=".6" />
          <rect x="860" y="1080" width="140" height="60" rx="26" fill="#E8E2D6" stroke={K} strokeWidth="7" />
          {/* orologio da polso */}
          <g transform="translate(620 1150) rotate(-12)">
            <Glow id="pa-watch" x={0} y={0} r={130} t={t} color={GOLD} amp={0.12} rate={3} opacity={0.7 * watch} />
            <path d="M-80 -8 H-36 M36 -8 H80 M-80 8 H-36 M36 8 H80" stroke="#3A2C20" strokeWidth="14" strokeLinecap="round" />
            <circle r="38" fill="#E8E2D6" stroke={K} strokeWidth="7" />
            <circle r="38" fill="none" stroke={GOLD} strokeWidth="4" />
            {[0, 90, 180, 270].map((a) => <path key={a} d="M0 -30 V-24" stroke={K} strokeWidth="4" transform={`rotate(${a})`} />)}
            <path d="M0 0 V-22" stroke={K} strokeWidth="5" strokeLinecap="round" transform="rotate(40)" />
            <path d="M0 0 V-16" stroke={K} strokeWidth="5" strokeLinecap="round" transform="rotate(200)" />
            <path d="M0 4 V-30" stroke="#C0392B" strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${tick})`} />
            <circle r="4" fill={K} />
          </g>
        </g>

        {/* PIANO 4 — comodino con lampada e modellino di razzo in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <rect x="-120" y="1380" width="360" height="560" fill="#3A2C20" stroke={K} strokeWidth="10" />
          <path d="M-120 1440 H240" stroke={K} strokeWidth="6" />
          <circle cx="60" cy="1530" r="12" fill={GOLD} />
          <path d="M40 1380 V1180 M-30 1180 L10 1080 H70 L110 1180 Z" fill="#C9A878" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <Glow id="pa-lamp" x={40} y={1140} r={180} t={t} color="#FFE6A8" amp={0.06} rate={2} opacity={0.5} />
          <g transform="translate(180 1380)">
            <path d="M-20 0 L-14 -120 L0 -170 L14 -120 L20 0 Z" fill="#E8E2D6" stroke={K} strokeWidth="6" strokeLinejoin="round" />
            <path d="M-20 0 L-40 20 V-40 Z M20 0 L40 20 V-40 Z" fill="#3E6A8A" stroke={K} strokeWidth="5" />
          </g>
        </g>

        {/* PIANO 5 — pulviscolo nella luce del tramonto, particelle (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 620, x0: 630, x1: 950 }} bottom={{ y: 1260, x0: 300, x1: 1000 }} n={30} color="#FFE6C0" boost={0.2 * launch} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="pa-near" t={t} color="#FFE6C0" n={6} vx={-20} vy={-8} opacity={0.08} />
        </g>
      </g>

      <Finish id="pa" tint="#C9846A" tintOpacity={0.08} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): porta che sbatte cue1 + 0,55 · orologio che brilla cue2 · razzo da cue4 − 0,3, stanza che vibra.
