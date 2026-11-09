import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Dust, Fire, GlassDrops, Glow, NearMotes, Notes, Rain, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { GOLD, K, TINT, Upright } from './Comune';

// Prima parte: la confessione. Stanza povera di notte: pioggia sulla finestra, una lettera sul tavolo accanto a una
// candela, una porta socchiusa con la luce del corridoio, una valigia pronta; in fondo un pianoforte; a fine scena una
// chitarra elettrica appoggiata che si illumina.
// Piani: parete, finestra con pioggia (0,25) · porta e pianoforte (0,45) · tavolo, candela, lettera, valigia (0,7)
//        · sedia e chitarra in primo piano (1,15) · pioggia vicina e pulviscolo (1,7)
// Eventi: cues[1] riflesso sognante sul vetro (dubbio tra realtà e immaginazione) · cues[2] il pianoforte si illumina
//         · cues[3] la lettera si accende, la porta si apre del tutto (deve andarsene) · cues[4] la chitarra si accende.

export const Confessione: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c1 = cues[1] ?? 3, c2 = cues[2] ?? 6, c3 = cues[3] ?? 9.1, c4 = cues[4] ?? 12.8;
  const dream = seg(t, c1, c1 + 0.8) * (1 - seg(t, c2, c2 + 1));
  const pno = eo(seg(t, c2, c2 + 0.8));
  const letter = eob(seg(t, c3, c3 + 0.5));
  const door = eo(seg(t, c3 + 0.6, c3 + 2.2));
  const gtr = eob(seg(t, c4, c4 + 0.5));
  const flash = flashAt(t, [c4], [0.5]);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="co" />
        <Lin id="co-wall" stops={[[0, '#100A12'], [0.4, '#22161E'], [0.75, '#2E1E24'], [1, '#18100E']]} />
        <Lin id="co-night" stops={[[0, '#060814'], [0.6, '#141A30'], [1, '#22263C']]} />
        <Lin id="co-floor" stops={[[0, '#3A2618'], [0.5, '#2A1A10'], [1, '#120A06']]} />
        <Lin id="co-table" stops={[[0, '#6A4A30'], [1, '#3A2414']]} />
        <Lin id="co-door" x2={1} y2={0} stops={[[0, '#3A2418'], [1, '#22140E']]} />
        <clipPath id="co-win"><rect x="70" y="640" width="330" height="400" /></clipPath>
        <Lin id="co-gtr" x2={1} y2={0} stops={[[0, '#6A0E22'], [0.5, '#B8203A'], [1, '#5A0A1C']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete scrostata e finestra con la pioggia (calma in alto per il titolo) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1600" fill="url(#co-wall)" />
          <path d="M140 300 q30 40 10 90 q-20 40 20 80 M900 240 q-20 50 10 100" stroke="#3A2A2E" strokeWidth="5" fill="none" opacity=".6" />
          <rect x="70" y="640" width="330" height="400" fill="url(#co-night)" />
          <g clipPath="url(#co-win)"><Rain t={t} level="far" x={70} y={640} w={330} h={400} color="#8A9AB8" opacity={0.5} /></g>
          <circle cx="320" cy="720" r="30" fill="#D8DCE8" opacity={0.3 + 0.5 * dream} />
          <Glow id="co-dream" x={235} y={840} r={260} t={t} color="#B8C8FF" amp={0.12} rate={2} opacity={0.5 * dream} />
          <GlassDrops t={t} x={70} y={640} w={330} h={400} color="#C8D4E8" />
          <rect x="70" y="640" width="330" height="400" fill="none" stroke={K} strokeWidth="12" />
          <path d="M235 640 V1040 M70 840 H400" stroke={K} strokeWidth="8" />
          <rect x="54" y="1040" width="362" height="22" fill="#3A2418" stroke={K} strokeWidth="6" />
        </g>

        {/* PIANO 1 — porta con la luce del corridoio, pianoforte in fondo */}
        <g transform={L(0.45)}>
          <rect x="760" y="640" width="250" height="520" fill="#F2C870" opacity={0.25 + 0.55 * door} />
          <Glow id="co-hall" x={885} y={900} r={lerp(180, 320, door)} t={t} color="#FFD98A" amp={0.04} rate={1.3} opacity={0.35 + 0.4 * door} />
          <g transform={`translate(760 640) scale(${lerp(0.8, 0.25, door)} 1)`}>
            <rect x="0" y="0" width="250" height="520" fill="url(#co-door)" stroke={K} strokeWidth="8" />
            <rect x="30" y="40" width="190" height="180" rx="6" fill="none" stroke="#120A08" strokeWidth="6" />
            <rect x="30" y="270" width="190" height="200" rx="6" fill="none" stroke="#120A08" strokeWidth="6" />
          </g>
          <rect x="752" y="630" width="266" height="530" fill="none" stroke={K} strokeWidth="10" />
          <Beam id="co-beam" x={880} y={1150} t={t} length={520} spread={lerp(120, 380, door)} angle={160} color="#FFD98A" opacity={0.15 + 0.4 * door} />
          <Upright id="co-pno" x={560} y={1160} s={0.5} t={t} lit={pno} />
          <Glow id="co-pnog" x={560} y={1020} r={220} t={t} color="#FFE7A0" amp={0.05} rate={1.4} opacity={0.4 * pno} />
        </g>

        {/* PIANO 2 — pavimento, tavolo con candela e lettera, valigia */}
        <g transform={L(0.7)}>
          <rect x="-200" y="1160" width="1480" height="900" fill="url(#co-floor)" />
          <path d="M-200 1160 H1280" stroke={K} strokeWidth="8" />
          <g stroke="#1A0E08" strokeWidth="3" opacity=".7">
            {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M-200 ${1200 + i * 60} H1280`} />)}
          </g>
          {/* tavolo */}
          <ellipse cx="400" cy="1440" rx="260" ry="26" fill="#000" opacity=".4" />
          <path d="M210 1270 L190 1440 M590 1270 L610 1440 M260 1290 L250 1430 M540 1290 L550 1430" stroke={K} strokeWidth="14" strokeLinecap="round" />
          <path d="M150 1230 H650 L670 1280 H130 Z" fill="url(#co-table)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M160 1238 H640" stroke="#B88A5A" strokeWidth="4" opacity=".6" />
          {/* lettera */}
          <g transform="translate(470 1240) rotate(-8)">
            <Glow id="co-let" x={0} y={-6} r={140} t={t} color={GOLD} amp={0.1} rate={3} opacity={0.6 * letter} />
            <path d="M-70 -20 H70 L60 10 H-80 Z" fill="#F4ECDD" stroke={K} strokeWidth="5" strokeLinejoin="round" />
            <path d="M-56 -10 H40 M-60 0 H30" stroke={letter > 0.3 ? GOLD : '#6A5A5A'} strokeWidth="3" />
          </g>
          {/* candela */}
          <g transform="translate(290 1232)">
            <Glow id="co-cand" x={0} y={-90} r={260} t={t} color="#FFC870" amp={0.08 + 0.1 * letter} rate={7} opacity={0.6} />
            <rect x="-16" y="-70" width="32" height="70" rx="4" fill="#F4ECDD" stroke={K} strokeWidth="5" />
            <path d="M-16 -66 q8 10 0 20" stroke="#E0D4C4" strokeWidth="4" fill="none" />
            <ellipse cx="0" cy="0" rx="34" ry="8" fill="#8A6A3E" stroke={K} strokeWidth="5" />
            <Fire id="co-fire" t={t} x={0} y={-70} scale={0.28} />
          </g>
          {/* valigia pronta */}
          <g transform="translate(760 1430)">
            <rect x="-120" y="-150" width="240" height="160" rx="16" fill="#6A3A22" stroke={K} strokeWidth="9" />
            <path d="M-40 -150 V-176 H40 V-150" fill="none" stroke={K} strokeWidth="9" />
            <path d="M-120 -90 H120" stroke="#3A1E10" strokeWidth="6" />
            <path d="M-110 -140 H110" stroke="#B87A4A" strokeWidth="4" opacity=".6" />
            <rect x="-90" y="-100" width="18" height="24" fill="#C89A4A" stroke={K} strokeWidth="3" />
            <rect x="72" y="-100" width="18" height="24" fill="#C89A4A" stroke={K} strokeWidth="3" />
          </g>
        </g>

        {/* PIANO 3 — schienale di sedia a sinistra, chitarra elettrica appoggiata a destra */}
        <g transform={L(1.15)}>
          <path d="M-200 1500 H120 Q150 1500 150 1540 V2200 H-200 Z" fill="#2A1810" stroke={K} strokeWidth="10" />
          <path d="M-200 1580 H110 M-200 1680 H110" stroke="#4A2A1A" strokeWidth="10" />
          <g transform={`translate(940 1720) rotate(-16)`}>
            <Glow id="co-gtrg" x={0} y={-300} r={340} t={t} color={GOLD} amp={0.1} rate={3} opacity={0.6 * gtr} />
            <rect x="-14" y="-760" width="28" height="520" fill="#4A2A18" stroke={K} strokeWidth="7" />
            {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M-14 ${-700 + i * 56} H14`} stroke="#C8B89A" strokeWidth="3" />)}
            <rect x="-30" y="-820" width="60" height="70" rx="10" fill="url(#co-gtr)" stroke={K} strokeWidth="7" />
            <path d="M-150 -260 Q-180 -160 -120 -60 Q-160 60 -60 90 Q0 110 60 90 Q160 60 120 -60 Q180 -160 150 -260 Q90 -300 40 -250 H-40 Q-90 -300 -150 -260 Z" fill="url(#co-gtr)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
            <rect x="-60" y="-170" width="120" height="30" rx="6" fill="#1A0A10" stroke={K} strokeWidth="5" />
            <rect x="-60" y="-110" width="120" height="30" rx="6" fill="#1A0A10" stroke={K} strokeWidth="5" />
            <path d="M-6 -760 V20 M6 -760 V20" stroke="#E8E0D0" strokeWidth="2" opacity=".7" />
            <path d="M-130 -240 Q-150 -170 -110 -90" stroke={gtr > 0.3 ? '#FFE7A0' : '#E06A7A'} strokeWidth="5" fill="none" opacity=".7" />
            <circle cx="90" cy="20" r="12" fill={GOLD} stroke={K} strokeWidth="4" />
          </g>
          <Notes t={t - c4} x={820} y={1330} n={5} spread={300} rise={420} color={GOLD} outline={K} size={gtr} speed={0.35} />
        </g>

        {/* lampo dell'assolo */}
        <rect x="-200" y="-200" width="1480" height="2400" fill="#FFE7A0" opacity={flash * 0.12} />

        {/* PIANO 4 — pioggia vicina sul vetro e pulviscolo nel fascio della porta */}
        <g transform={L(1.7)}>
          <Dust t={t} top={{ y: 1000, x0: 820, x1: 940 }} bottom={{ y: 1500, x0: 300, x1: 760 }} n={20} color="#FFE8C0" boost={-0.4 + 0.5 * door} />
          <NearMotes id="co-near" t={t} color="#C8D0E8" opacity={0.07} />
        </g>
      </g>

      <Finish id="co" tint={TINT} tintOpacity={0.12} />
    </svg>
  );
};
