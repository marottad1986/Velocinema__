import React from 'react';
import { camera, eio, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Clouds, Fog, Glow, Gulls, NearMotes, Rain } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Brachio, Fern, Helicopter, JungleTree, K } from './Comuni';

// Gli esperti: piazzola d'atterraggio in mezzo alla giungla accanto a una cascata; un elicottero che scende con le pale
// che girano, l'erba piegata dal vento, nuvole basse sulle montagne; un brachiosauro mangia dalle cime degli alberi.
// Piani: cielo e montagne (0,2) · cascata (0,4) · giungla lontana (0,5) · piazzola ed elicottero (0,7) · felci in primo piano (1,25) · spruzzi (1,6)

const r = rng(77);
const GRASS = Array.from({ length: 50 }, () => ({ x: r() * 1300 - 110, y: 1180 + r() * 120, h: 20 + r() * 40, ph: r() * 6 }));

export const Esperti: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const land = eio(seg(t, 0, cues[2] + 0.6)); // l'elicottero scende fino alla piazzola
  const hy = 640 + 460 * land;
  const wash = 1 - seg(t, cues[2] + 1, dur); // il vento delle pale cala dopo l'atterraggio
  const near = seg(hy, 800, 1100) * wash;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="es" />
        <Lin id="es-sky" stops={[[0, '#7FA9B8'], [0.35, '#B8D2CC'], [0.55, '#E2E8D6']]} />
        <Lin id="es-mount" stops={[[0, '#4E7A64'], [1, '#2C5240']]} />
        <Lin id="es-fall" stops={[[0, '#E6F4F2'], [1, '#A8D4D0']]} />
        <Lin id="es-pad" stops={[[0, '#8A8E84'], [1, '#5A5E56']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo coperto e montagne con nuvole basse */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#es-sky)" />
          <path d="M-200 1000 L-40 700 L120 820 L300 560 L500 820 L700 620 L900 840 L1080 660 L1280 900 V1100 H-200 Z" fill="url(#es-mount)" />
          <Clouds id="es-cl" t={t} color="#F2F4EC" seed={12} n={4} y={760} h={140} speed={0.4} opacity={0.8} />
          <Fog id="es-fog" t={t} y={880} color="#EEF2EA" rx={900} ry={60} opacity={0.5} />
        </g>

        {/* PIANO 1 — la cascata */}
        <g transform={L(0.4)}>
          <path d="M760 760 Q800 740 840 760 L860 1120 H740 Z" fill="#3E6B54" stroke={K} strokeWidth="6" />
          <rect x="770" y="770" width="64" height="360" fill="url(#es-fall)" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${778 + i * 10} ${770 + mod(t * 300 + i * 50, 300)} v40`} stroke="#FFFFFF" strokeWidth="4" opacity=".8" />)}
          <Fog id="es-mist" t={t} x={800} y={1120} color="#FFFFFF" rx={180} ry={50} drift={20} opacity={0.6} />
        </g>

        {/* PIANO 2 — giungla lontana con il brachiosauro che mangia dalle cime (la meraviglia dell'arrivo) */}
        <g transform={L(0.5)}>
          {[-60, 140, 360, 980, 1160].map((x, i) => <JungleTree key={x} x={x} y={1180} h={190 + (i % 2) * 50} t={t} ph={i} outline={false} leaf="#2C5E40" trunk="#3A3020" />)}
          <Brachio x={680} y={1170} s={0.78} t={t} reach={eio(seg(t, cues[0] + 0.5, cues[1]))} />
        </g>

        {/* PIANO 3 — piazzola e l'elicottero che atterra (accento sul cerchio della piazzola) */}
        <g transform={L(0.7)}>
          <path d="M-200 1160 Q540 1120 1280 1160 V1500 H-200 Z" fill="#3E6B48" stroke={K} strokeWidth="6" />
          <ellipse cx="540" cy="1190" rx="300" ry="60" fill="url(#es-pad)" stroke={K} strokeWidth="7" />
          <ellipse cx="540" cy="1190" rx="200" ry="38" fill="none" stroke={P.accento} strokeWidth="10" />
          <text x="540" y="1206" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="44" fill={P.chiaro}>H</text>
          {GRASS.map((g, i) => {
            const bend = (Math.sin(t * 2 + g.ph) * 6 + (g.x < 540 ? -1 : 1) * 30 * near);
            return <path key={i} d={`M${g.x} ${g.y} q${bend * 0.5} ${-g.h * 0.6} ${bend} ${-g.h}`} fill="none" stroke="#5FA672" strokeWidth="5" strokeLinecap="round" />;
          })}
          <ellipse cx="540" cy="1196" rx={160 * (0.4 + 0.6 * land)} ry="18" fill={K} opacity={0.15 + 0.25 * land} />
          <Helicopter x={540} y={hy - 20} s={1.1} t={t} tilt={-6 * (1 - land) + Math.sin(t * 2) * 1.5 * (1 - land)} />
          {/* polvere e foglie sollevate dalle pale */}
          {Array.from({ length: 10 }, (_, i) => {
            const p = mod(t * 0.9 + i / 10, 1);
            const side = i % 2 ? 1 : -1;
            return <circle key={i} cx={540 + side * (120 + p * 420)} cy={1180 - p * 80} r={10 + p * 30} fill="#E2E8D6" opacity={(1 - p) * 0.5 * near} />;
          })}
        </g>

        {/* PIANO 4 — felci e foglie giganti che incorniciano */}
        <g transform={L(1.25)}>
          <Fern x={60} y={1900} s={2.6} t={t} ph={0.5} />
          <Fern x={1020} y={1880} s={2.4} t={t} ph={2} flip />
          <Fern x={540} y={1980} s={1.6} t={t} ph={1} color="#24683F" />
        </g>
        <g transform={L(0.6)}><Gulls t={t} y={700} h={140} color={K} n={2} /></g>
        <g transform={L(1.6)}>
          <Rain t={t} level="far" seed={8} color="#FFFFFF" opacity={0.15} angle={10} />
          <NearMotes id="es-near" t={t} color="#FFFFFF" n={6} y0={1300} opacity={0.1} />
        </g>
        <Glow id="es-light" x={540} y={600} r={500} t={t} color="#FFF6D8" amp={0.03} rate={0.8} opacity={0.18} />
      </g>
      <Finish id="es" tint="#1E4A30" tintOpacity={0.1} />
    </svg>
  );
};
