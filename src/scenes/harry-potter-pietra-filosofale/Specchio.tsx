import React from 'react';
import { camera, eio, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes, Stars } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { FloatingCandle, K, MirrorFrame } from './Comuni';

// Lo specchio: stanza buia e polverosa, fuori nevica; un grande specchio antico con la cornice d'oro intagliata che invece
// di riflettere la stanza si riempie di una luce calda (il desiderio, senza figure); candele, drappi, banchi accatastati.
// Piani: finestra con la neve (0,25) · parete e drappi (0,45) · specchio (0,65) · banchi accatastati (0,9) · drappo in primo piano (1,25) · polvere (1,6)

const r = rng(2412);
const SNOW = Array.from({ length: 40 }, () => ({ x: r() * 280, y: r() * 360, s: 2 + r() * 3, v: 20 + r() * 30 }));
const SPARK = Array.from({ length: 24 }, () => ({ x: (r() - 0.5) * 300, y: (r() - 0.5) * 480, ph: r() * 6 }));

export const Specchio: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const warm = eio(seg(t, cues[1] - 0.4, cues[1] + 1.2)); // «vede i suoi genitori»: lo specchio si accende
  const cool = eio(seg(t, cues[4], cues[4] + 1.6)); // «non bisogna perdersi nei sogni»: la luce si calma
  const glow = warm * (1 - 0.6 * cool);
  const drape = eio(seg(t, cues[4] + 0.6, dur)); // un drappo comincia a coprire lo specchio

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sp" />
        <Lin id="sp-wall" stops={[[0, '#14122A'], [0.5, '#221E3A'], [1, '#100E1E']]} />
        <Lin id="sp-glass" stops={[[0, '#2A2A44'], [1, '#14142A']]} />
        <radialGradient id="sp-wish" cx=".5" cy=".55" r=".6">
          <stop offset="0" stopColor="#FFF0C8" stopOpacity="1" />
          <stop offset=".5" stopColor="#F2B860" stopOpacity=".7" />
          <stop offset="1" stopColor="#7A3A20" stopOpacity="0" />
        </radialGradient>
        <Lin id="sp-floor" stops={[[0, '#2A2234'], [1, '#0E0A14']]} />
      </defs>
      <g transform={cam.transform}>
        {/* finestra alta con la neve */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#sp-wall)" />
          <g transform="translate(-60 560)">
            <path d="M0 360 V60 Q140 -60 280 60 V360 Z" fill="#1E2A4A" stroke={K} strokeWidth="10" />
            <Stars t={t} seed={3} n={10} x={10} y={30} w={260} h={200} />
            {SNOW.map((s, i) => <circle key={i} cx={s.x} cy={mod(s.y + t * s.v, 360)} r={s.s} fill="#F4F4FF" opacity=".8" />)}
            <path d="M140 0 V360 M0 200 H280" stroke={K} strokeWidth="8" />
          </g>
        </g>
        {/* drappi rossi alle pareti */}
        <g transform={L(0.45)}>
          <path d="M840 520 Q900 800 860 1200 H1000 Q1040 800 1000 520 Z" fill={P.principale} stroke={K} strokeWidth="7" />
          <path d="M880 560 Q930 860 900 1180" stroke="#9A3040" strokeWidth="10" fill="none" />
          {[180, 900].map((x, i) => <FloatingCandle key={x} x={x} y={1000 - i * 260} s={1.2} t={t} ph={i * 2} />)}
        </g>
        {/* lo specchio d'oro: si riempie di luce calda (accento sulla cornice) */}
        <g transform={L(0.65)}>
          <Glow id="sp-room" x={540} y={900} r={620} t={t} color="#F2B860" amp={0.05} rate={1.2} opacity={0.5 * glow} />
          <rect x="360" y="660" width="360" height="520" fill="url(#sp-glass)" />
          <rect x="360" y="660" width="360" height="520" fill="url(#sp-wish)" opacity={glow} />
          {SPARK.map((s, i) => <circle key={i} cx={540 + s.x * 0.9} cy={920 + s.y * 0.9 - mod(t * 30 + i * 13, 60)} r="3" fill="#FFF4D0" opacity={glow * (0.3 + 0.7 * Math.max(0, Math.sin(t * 3 + s.ph)))} />)}
          <path d="M400 700 L480 680 L420 860 Z" fill="#FFFFFF" opacity={0.08 + 0.1 * (1 - glow)} />
          <MirrorFrame x={540} y={920} w={360} h={520} gold={P.accento} />
          {/* il drappo che scende a coprirlo */}
          <path d={`M330 ${560 + 0} H750 V${560 + 640 * drape} Q540 ${600 + 660 * drape} 330 ${560 + 640 * drape} Z`} fill="#3A2A44" stroke={K} strokeWidth="6" opacity={drape > 0.02 ? 0.95 : 0} />
        </g>
        {/* banchi accatastati e pavimento */}
        <g transform={L(0.9)}>
          <path d="M-200 1260 H1280 V2200 H-200 Z" fill="url(#sp-floor)" />
          <g transform="translate(140 1280)">
            <path d="M-120 -120 H120 V-90 H-120 Z M-100 -90 V0 M100 -90 V0" stroke={K} strokeWidth="10" fill="#5A4030" />
            <path d="M-80 -220 H140 V-190 H-80 Z M-60 -190 V-120 M120 -190 V-120" stroke={K} strokeWidth="9" fill="#4A3426" transform="rotate(8 30 -200)" />
          </g>
          <path d="M760 1300 L1100 1280 V1340 L760 1360 Z" fill="#4A3426" stroke={K} strokeWidth="8" />
        </g>
        {/* drappo pesante in primo piano */}
        <g transform={L(1.25)}>
          <path d="M-200 -200 H140 Q180 600 100 1300 Q60 1700 120 1940 H-200 Z" fill="#5A1A24" stroke={K} strokeWidth="10" />
          <path d="M40 -200 Q90 600 20 1300 Q-10 1700 40 1940" stroke="#7A2A34" strokeWidth="14" fill="none" />
          <path d="M1280 1500 Q1080 1560 1040 1940 H1280 Z" fill="#3A2A44" stroke={K} strokeWidth="9" />
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 660, x0: 380, x1: 700 }} bottom={{ y: 1300, x0: 200, x1: 880 }} seed={9} n={26} color="#FFE8B8" boost={glow * 0.4} />
          <NearMotes id="sp-near" t={t} color="#FFE8B8" n={5} y0={1300} opacity={0.08} />
        </g>
      </g>
      <Finish id="sp" tint="#1E1A3A" tintOpacity={0.12} />
    </svg>
  );
};
