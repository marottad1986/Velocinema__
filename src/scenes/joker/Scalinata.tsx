import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Flyers, Glow, NearMotes, Smoke } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Completo, JokerDefs, K } from './Comuni';

// Il ballo sulla scalinata: la lunga scalinata di città tra due muri alti, vista dal basso in un giorno nuvoloso;
// in cima un pianerottolo con la porta di un palazzo, ringhiera di ferro su un lato, cartacce sui gradini.
// Eventi: prima frase la porta in cima sbatte (cue 1 − 0,7, la porta dello spartito: Randall); seconda frase il completo
// rosso cade e resta appeso alla ringhiera; terza frase impronte rosse di scarpe da clown
// scendono i gradini una per battito (griglia a 96 bpm dalla battuta di cue 2, come cassa e ottoni), con un mezzo giro
// come passi di danza; a cue 2 + 1,2 (timpano) le luci della polizia, rosse e blu, si accendono sui muri. Nessuna persona.
// Piani: cielo nuvoloso (0,2) · palazzi in cima (0,4) · muri e scalinata (0,65) · ringhiera, completo, impronte (0,8)
//        · muretti in primo piano (1,2) · cartacce nel vento e particelle (1,5–1,8)

const BEAT = 60 / 96;
const START = 84; // inizio del capitolo nel film (s)
const STEPS = 16; // gradini visibili fino in fondo alla scalinata
const ALL = 32; // compresi quelli vicini alla camera
const r = rng(19);
const CLOUDS = Array.from({ length: 6 }, (_, i) => ({ x: -200 + i * 260 + r() * 60, y: 160 + r() * 260, rx: 200 + r() * 120 }));

// gradino k (0 = in cima): y, mezza larghezza
const step = (k: number) => {
  const p = k / STEPS;
  const p2 = p * p * 0.55 + p * 0.45;
  return { y: 780 + p2 * 500, hw: 120 + p2 * 520, h: 10 + p2 * 34 };
};

export const Scalinata: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const slam = seg(t, cues[1] - 0.95, cues[1] - 0.7);
  const doorA = t < cues[1] - 0.95 ? 30 + Math.sin(t * 1.4) * 6 : lerp(36, 0, eo(slam));
  const suitIn = eob(seg(t, cues[1] + 0.2, cues[1] + 0.9));
  const D = Math.round((START + cues[2]) / (4 * BEAT)) * 4 * BEAT - START; // la battuta di cue 2, come nello spartito
  const prints = t < D ? 0 : Math.floor((t - D) / BEAT) + 1;
  const police = seg(t, cues[2] + 1.2, cues[2] + 1.3);
  const siren = Math.sin(t * 9) > 0;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sc" />
        <JokerDefs id="sc" />
        <Lin id="sc-sky" stops={[[0, '#4A5258'], [0.4, '#6A7274'], [0.7, '#8A8E88'], [1, '#9A9888']]} />
        <Lin id="sc-wallL" x2={1} y2={0} stops={[[0, '#3A2E26'], [0.7, '#6A5444'], [1, '#7A6250']]} />
        <Lin id="sc-wallR" x2={1} y2={0} stops={[[0, '#5A463A'], [0.3, '#4A3A30'], [1, '#2A201A']]} />
        <Lin id="sc-step" stops={[[0, '#A8A090'], [1, '#6A6458']]} />
        <Lin id="sc-riser" stops={[[0, '#5A5448'], [1, '#3A362E']]} />
        <Lin id="sc-door" x2={1} y2={0} stops={[[0, '#2A3A30'], [0.5, '#4A6A58'], [1, '#22302A']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo nuvoloso (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#sc-sky)" />
          {CLOUDS.map((c, i) => <ellipse key={i} cx={c.x + ((t * 12 + i * 40) % 300)} cy={c.y} rx={c.rx} ry={60} fill="#9AA0A0" opacity=".5" />)}
        </g>

        {/* PIANO 1 — palazzi in cima alla scalinata (0,4) */}
        <g transform={L(0.4)}>
          {[[300, 640, 200], [480, 610, 160], [620, 650, 180]].map(([x, top, w], i) => (
            <g key={i}>
              <rect x={x} y={top} width={w} height={800 - top} fill={['#7A6A5A', '#6A5A4C', '#8A7A68'][i]} />
              {Array.from({ length: 6 }, (_, k) => <rect key={k} x={x + 20 + (k % 3) * (w / 3)} y={top + 30 + Math.floor(k / 3) * 60} width={w / 3 - 30} height="34" fill="#4A4038" />)}
            </g>
          ))}
          <Smoke id="sc-chim" t={t} x={560} y={660} color="#E8E4D8" n={7} rise={90} wind={160} r0={20} r1={80} speed={0.15} opacity={0.5} />
        </g>

        {/* PIANO 2 — i due muri alti e la scalinata, con la porta sul pianerottolo in cima (0,65) */}
        <g transform={L(0.65)}>
          {/* pianerottolo e porta */}
          <rect x="380" y="640" width="320" height="150" fill="#5A4A3C" stroke={K} strokeWidth="6" />
          <rect x="470" y="660" width="140" height="130" fill="#140E0A" stroke={K} strokeWidth="6" />
          <g transform={`translate(470 660) skewY(${doorA * 0.3}) scale(${Math.cos((doorA * Math.PI) / 180)} 1)`}>
            <rect x="0" y="0" width="140" height="130" fill="url(#sc-door)" stroke={K} strokeWidth="6" />
            <rect x="16" y="14" width="108" height="44" fill="none" stroke={K} strokeWidth="4" />
            <circle cx="120" cy="80" r="6" fill="#C9A24A" />
          </g>
          {slam > 0 && slam < 1 && <path d="M460 650 l-30 -20 M620 650 l30 -20 M540 640 v-30" stroke={K} strokeWidth="6" opacity={1 - slam} />}
          {/* muri */}
          <path d="M-200 -200 H360 L380 790 L-200 1560 Z" fill="url(#sc-wallL)" stroke={K} strokeWidth="8" />
          <path d="M1280 -200 H720 L700 790 L1280 1560 Z" fill="url(#sc-wallR)" stroke={K} strokeWidth="8" />
          {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M-200 ${300 + i * 50} L${360 - i * 2} ${330 + i * 18}`} stroke="#2A201A" strokeWidth="3" opacity=".4" />)}
          {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M1280 ${300 + i * 50} L${720 + i * 2} ${330 + i * 18}`} stroke="#1A140E" strokeWidth="3" opacity=".4" />)}
          {/* scritte sui muri */}
          <path d="M60 820 q30 -40 60 0 q30 40 60 0" stroke="#3A6A9A" strokeWidth="10" fill="none" opacity=".6" />
          <path d="M900 900 l40 -60 l20 60 l40 -60" stroke="#C8A030" strokeWidth="10" fill="none" opacity=".55" />
          {/* gradini */}
          {Array.from({ length: ALL }, (_, k) => {
            const a = step(k), b = step(k + 1);
            return (
              <g key={k}>
                <path d={`M${540 - a.hw} ${a.y} H${540 + a.hw} L${540 + b.hw} ${b.y - b.h} H${540 - b.hw} Z`} fill="url(#sc-step)" stroke={K} strokeWidth="4" />
                <path d={`M${540 - b.hw} ${b.y - b.h} H${540 + b.hw} V${b.y} H${540 - b.hw} Z`} fill="url(#sc-riser)" stroke={K} strokeWidth="4" />
                <path d={`M${540 - a.hw + 6} ${a.y + 3} H${540 + a.hw - 6}`} stroke="#D8D0C0" strokeWidth="3" opacity=".6" />
              </g>
            );
          })}
          {/* luci della polizia sui muri */}
          <g opacity={police}>
            <Glow id="sc-pr" x={140} y={1100} r={520} t={t} color="#E83A3A" amp={0} opacity={siren ? 0.7 : 0.15} />
            <Glow id="sc-pb" x={940} y={1100} r={520} t={t} color="#3A7AE8" amp={0} opacity={siren ? 0.15 : 0.7} />
          </g>
        </g>

        {/* PIANO 3 — ringhiera, il completo rosso, le impronte che scendono (0,8) */}
        <g transform={L(0.8)}>
          {/* ringhiera lungo il lato destro */}
          <path d={`M${540 + step(0).hw - 20} ${step(0).y - 70} L${540 + step(STEPS).hw - 60} ${step(STEPS).y - 160}`} stroke={K} strokeWidth="14" />
          <path d={`M${540 + step(0).hw - 20} ${step(0).y - 74} L${540 + step(STEPS).hw - 60} ${step(STEPS).y - 164}`} stroke="#8A9298" strokeWidth="4" />
          {Array.from({ length: 9 }, (_, i) => {
            const a = step(i * 2);
            return <path key={i} d={`M${540 + a.hw - 20 - i * 4} ${a.y} V${a.y - 70 - i * 10}`} stroke={K} strokeWidth="8" />;
          })}
          {/* il completo rosso che cade sulla ringhiera */}
          <g transform={`translate(${540 + step(7).hw - 40} ${lerp(300, step(7).y - 120, suitIn)})`} opacity={seg(t, cues[1] + 0.2, cues[1] + 0.35)}>
            <Completo id="sc" x={0} y={0} s={0.55} sway={Math.sin(t * 2.4) * 6 + (1 - suitIn) * 30} />
          </g>
          {/* impronte rosse: una per battito, alternate e con un mezzo giro */}
          {Array.from({ length: Math.min(prints, 12) }, (_, k) => {
            const a = step(1 + k * 2);
            const side = k % 2 ? 1 : -1;
            const s = 0.3 + (a.hw / 640) * 1.1;
            const fresh = seg(t, D + k * BEAT, D + k * BEAT + 0.12);
            return (
              <g key={k} transform={`translate(${540 + side * a.hw * 0.25 + Math.sin(k * 1.7) * a.hw * 0.08} ${(a.y + step(2 + k * 2).y - step(2 + k * 2).h) / 2}) scale(${s} ${s * 0.35}) rotate(${side * 25 + (k % 3) * 20})`} opacity={fresh}>
                <path d="M-30 -80 Q0 -104 30 -80 Q42 -40 30 0 Q22 14 -22 14 Q-40 -30 -30 -80 Z" fill={P.accento} stroke={K} strokeWidth="5" />
                <path d="M-22 34 Q0 24 22 34 Q26 64 0 70 Q-26 64 -22 34 Z" fill={P.accento} stroke={K} strokeWidth="5" />
              </g>
            );
          })}
        </g>

        {/* PIANO 4 — muretti in primo piano ai lati, che incorniciano (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1300 L160 1420 V2200 H-200 Z" fill="url(#sc-wallL)" stroke={K} strokeWidth="10" />
          <path d="M1280 1300 L920 1420 V2200 H1280 Z" fill="url(#sc-wallR)" stroke={K} strokeWidth="10" />
          <path d="M-200 1300 L160 1420 M1280 1300 L920 1420" stroke="#B8A890" strokeWidth="6" opacity=".6" />
          <g opacity={police}>
            <Glow id="sc-pr2" x={-40} y={1600} r={500} t={t} color="#E83A3A" amp={0} opacity={siren ? 0.6 : 0.1} />
            <Glow id="sc-pb2" x={1120} y={1600} r={500} t={t} color="#3A7AE8" amp={0} opacity={siren ? 0.1 : 0.6} />
          </g>
        </g>

        {/* PIANO 5 — cartacce e foglie che scendono nel vento, particelle (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Flyers t={t} seed={7} n={8} color="#E8DCC0" outline={K} y0={780} y1={1500} speed={0.6} shape="paper" />
          <Flyers t={t + 3} seed={11} n={6} color="#B88A3A" outline={K} y0={820} y1={1500} speed={0.5} shape="leaf" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="sc-near" t={t} color="#F2EEE4" n={6} opacity={0.09} />
        </g>
      </g>
      <Finish id="sc" tint="#5A5444" tintOpacity={0.12} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): porta che sbatte cue1 − 0,7 · completo cue1 + 0,2 · impronte dalla battuta di cue2, una per battito · polizia cue2 + 1,2.
