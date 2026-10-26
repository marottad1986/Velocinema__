import React from 'react';
import { camera, eio, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Embers, Fog, Glow, NearMotes, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { GOLD, Ring } from './Spazio';

// Il pianeta di ghiaccio: distesa di ghiaccio sotto nuvole congelate sospese nel cielo; il rifugio di Mann con la luce
// accesa; in alto, piccola, l'astronave ad anello in orbita. Nessuna persona.
// Eventi: il faro del rifugio lampeggia: qualcuno aspetta (cue 1) · il faro diventa rosso e il ghiaccio si spacca: la
//         bugia (cue 2) · una navetta decolla di nascosto verso l'astronave (cue 3) · esplosione accanto all'astronave,
//         che perde pezzi (cue 4).
// Piani: cielo e astronave in orbita (0,2) · nuvole congelate (0,35) · ghiacciai lontani (0,5)
//        · distesa con rifugio e navetta (0,7) · blocchi di ghiaccio in primo piano (1,2) · neve e particelle (1,5–1,8)

const K = '#0A0F18';
const r = rng(1984);
const CLOUDS = Array.from({ length: 5 }, (_, i) => ({ x: -60 + i * 260 + r() * 60, y: 640 + r() * 220, s: 0.7 + r() * 0.5 }));
const SNOW = Array.from({ length: 50 }, () => ({ x: r() * 1500, y: r() * 1900, s: 2 + r() * 4, v: 60 + r() * 120 }));

/** Nuvola di ghiaccio: forma solida e sfaccettata, sospesa. */
const IceCloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-150 30 L-120 -20 L-70 -40 L-30 -80 L30 -70 L80 -40 L140 -30 L170 20 L120 50 L-90 56 Z" fill="#E8EEF2" stroke="#7E92A4" strokeWidth="5" strokeLinejoin="round" />
    <path d="M-70 -40 L-40 20 L30 -70 M80 -40 L60 30 M-120 -20 L-90 40" fill="none" stroke="#B8C8D4" strokeWidth="4" />
    <path d="M-90 56 L120 50 L100 70 L-70 74 Z" fill="#9AB0C0" stroke="#7E92A4" strokeWidth="4" />
  </g>
);

export const Ghiaccio: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const beacon = seg(t, cues[1] - 0.2, cues[1] + 0.2);
  const lie = seg(t, cues[2] + 0.2, cues[2] + 0.5);
  const crack = eo(seg(t, cues[2] + 0.3, cues[2] + 1.4));
  const blink = Math.floor(t * 2.5) % 2 === 0 ? 1 : 0.35;
  const take = eio(seg(t, cues[3] - 0.2, cues[4] + 0.2));
  const boom = seg(t, cues[4] + 0.1, cues[4] + 1.0);
  const flash = flashAt(t, [cues[4] + 0.1], [0.7]);
  const shX = lerp(640, 820, take), shY = lerp(1150, 680, take), shS = lerp(1, 0.15, take);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="gh" />
        <Lin id="gh-sky" stops={[[0, '#5A6E82'], [0.4, '#9AB0C2'], [0.6, '#C9D6E0'], [0.66, '#DCE6EE']]} />
        <Lin id="gh-glacier" x2={1} y2={0} stops={[[0, '#9AB0C2'], [0.6, '#C9D8E4'], [1, '#8EA4B8']]} />
        <Lin id="gh-ice" stops={[[0, '#DCE6EE'], [0.5, '#B8C8D6'], [1, '#7E92A4']]} />
        <Lin id="gh-hut" x2={1} y2={0} stops={[[0, '#8A98A6'], [0.5, '#DCE4EA'], [1, '#7A8896']]} />
        <Lin id="gh-front" stops={[[0, '#C9D8E4'], [1, '#6E8296']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo freddo e l'astronave in orbita, che esplode (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#gh-sky)" />
          <Ring x={820} y={640} r={84} t={t} spin={0.3 + boom * 2} tiltY={0.4} outline={K} lit="#EEF2F4" debris={boom} />
          {boom > 0 && boom < 1 && (
            <g>
              <Glow id="gh-boom" x={860} y={640} r={360 * boom + 80} t={t} color="#FFE6A8" amp={0.2} rate={20} opacity={0.95 * (1 - boom)} />
              <circle cx="860" cy="640" r={30 + 110 * boom} fill="#FFF4D6" opacity={1 - boom} />
              <circle cx="860" cy="640" r={60 + 200 * boom} fill="none" stroke="#FFE6A8" strokeWidth={14 * (1 - boom)} opacity={0.8 * (1 - boom)} />
              {/* frammenti dell'anello che volano via */}
              {Array.from({ length: 12 }, (_, i) => {
                const a = (i / 12) * Math.PI * 2 + 0.3, d = 40 + 260 * boom * (0.7 + (i % 3) * 0.2);
                const x = 860 + Math.cos(a) * d, y = 640 + Math.sin(a) * d * 0.8;
                return <rect key={i} x={x - 9} y={y - 5} width={18 + (i % 3) * 6} height="10" fill="#C9D3DB" stroke={K} strokeWidth="3" opacity={1 - seg(boom, 0.7, 1)} transform={`rotate(${i * 40 + boom * 300} ${x} ${y})`} />;
              })}
            </g>
          )}
          <rect x="-200" y="-200" width="1480" height="2320" fill="#FFF4E0" opacity={flash * 0.3} />
        </g>

        {/* PIANO 1 — nuvole congelate sospese (0,35) */}
        <g transform={L(0.35)}>
          {CLOUDS.map((c, i) => <IceCloud key={i} x={c.x} y={c.y + Math.sin(t * 0.3 + i) * 4} s={c.s} />)}
        </g>

        {/* PIANO 2 — ghiacciai lontani (0,5) */}
        <g transform={L(0.5)}>
          <path d="M-200 1060 L-40 900 L80 980 L240 860 L400 990 L560 920 L700 1000 L880 880 L1040 980 L1280 920 V1200 H-200 Z" fill="url(#gh-glacier)" stroke="#7E92A4" strokeWidth="5" strokeLinejoin="round" />
          <path d="M240 860 L280 930 L240 990 M880 880 L920 940" fill="none" stroke="#EEF4F8" strokeWidth="5" />
          <Fog id="gh-f1" t={t} y={1040} x={540} rx={900} ry={60} color="#EEF4F8" opacity={0.6} speed={0.3} drift={80} />
        </g>

        {/* PIANO 3 — distesa di ghiaccio, rifugio con il faro, navetta che decolla (0,7) */}
        <g transform={L(0.7)}>
          <path d="M-200 1080 Q540 1060 1280 1080 V2200 H-200 Z" fill="url(#gh-ice)" />
          {/* crepa che si apre nel ghiaccio */}
          <path d={`M-100 1250 L${lerp(-100, 120, crack)} ${lerp(1250, 1200, crack)} L${lerp(-100, 300, crack)} ${lerp(1250, 1230, crack)} L${lerp(-100, 460, crack)} ${lerp(1250, 1170, crack)} L${lerp(-100, 620, crack)} ${lerp(1250, 1210, crack)}`} fill="none" stroke="#2A3A4E" strokeWidth="8" strokeLinejoin="round" opacity={crack > 0 ? 1 : 0} />
          {/* rifugio */}
          <g transform="translate(250 1120)">
            <path d="M-120 0 V-80 Q-120 -130 -60 -130 H60 Q120 -130 120 -80 V0 Z" fill="url(#gh-hut)" stroke={K} strokeWidth="8" />
            <rect x="-30" y="-80" width="60" height="44" rx="8" fill="#FFE6A8" stroke={K} strokeWidth="6" />
            <Glow id="gh-win" x={0} y={-58} r={110} t={t} color="#FFE6A8" amp={0.1} rate={2} opacity={0.5} />
            <path d="M80 -130 V-200" stroke={K} strokeWidth="6" />
            <circle cx="80" cy="-206" r="12" fill={lie > 0.5 ? '#E25A4A' : GOLD} stroke={K} strokeWidth="4" />
            <Glow id="gh-beacon" x={80} y={-206} r={90} t={t} color={lie > 0.5 ? '#E25A4A' : GOLD} amp={0.2} rate={6} opacity={0.8 * beacon * blink} />
            <path d="M-160 4 H160" stroke="#7E92A4" strokeWidth="6" />
          </g>
          {/* navetta che decolla verso l'astronave */}
          <g transform={`translate(${shX} ${shY}) scale(${shS}) rotate(${-20 * take})`}>
            <path d="M-110 16 L-80 -26 H60 L118 8 L108 26 H-100 Z" fill="#EEF2F4" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d="M36 -22 L72 -8 V6 H36 Z" fill="#2A3A4E" stroke={K} strokeWidth="5" />
            {take > 0 && <Glow id="gh-eng" x={-120} y={10} r={80} t={t} color="#8EB8D8" amp={0.3} rate={15} opacity={0.9} />}
          </g>
          <ellipse cx="640" cy="1180" rx={130 * (1 - take)} ry="12" fill="#5A6E82" opacity={0.4 * (1 - take)} />
        </g>

        {/* PIANO 4 — blocchi di ghiaccio in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1980 V1540 L-60 1460 L80 1520 L160 1620 L120 1980 Z" fill="url(#gh-front)" stroke="#5A6E82" strokeWidth="8" strokeLinejoin="round" />
          <path d="M-60 1460 L0 1560 L80 1520" fill="none" stroke="#EEF4F8" strokeWidth="6" />
          <path d="M1280 1980 V1480 L1120 1420 L980 1500 L900 1640 L960 1980 Z" fill="url(#gh-front)" stroke="#5A6E82" strokeWidth="8" strokeLinejoin="round" />
          <path d="M1120 1420 L1060 1540 L980 1500" fill="none" stroke="#EEF4F8" strokeWidth="6" />
          {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={420 + i * 80} cy={1700 - i * 50} rx="22" ry="10" fill="#7E92A4" opacity=".6" />)}
        </g>

        {/* PIANO 5 — neve trasportata dal vento, schegge dell'esplosione, particelle (1,5–1,8) */}
        <g transform={L(1.5)}>
          {SNOW.map((f, i) => <circle key={i} cx={mod(f.x - t * f.v * 2, 1500) - 200} cy={mod(f.y + t * f.v * 0.4, 1900)} r={f.s} fill="#FFFFFF" opacity=".75" />)}
        </g>
        <g transform={L(0.2)} opacity={boom > 0 ? 1 - boom : 0}>
          <Embers t={t * 2} x={860} y={640} w={60} h={-200} n={14} seed={7} hot="#FFF4D6" warm={GOLD} drift={200} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="gh-near" t={t} color="#FFFFFF" n={7} vx={-60} vy={8} opacity={0.12} />
        </g>
      </g>

      <Finish id="gh" tint="#3E6A8A" tintOpacity={0.08} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): faro che lampeggia cue1 · faro rosso e crepa cue2 + 0,2 · navetta che decolla cue3 − 0,2
// · esplosione accanto all'astronave cue4 + 0,1.
