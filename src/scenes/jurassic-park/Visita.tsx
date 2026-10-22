import React from 'react';
import { camera, eio, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Clouds, Fog, Glow, Lightning, NearMotes, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Fence, Fern, Jeep, JungleTree, K } from './Comuni';

// La visita: due jeep elettriche sul binario guidato in mezzo alla giungla; accanto un'altissima recinzione con il
// cartello di pericolo; nuvole nere di tempesta che arrivano dal mare.
// Piani: cielo che si scurisce (0,2) · nuvole (0,35) · giungla lontana (0,5) · recinzione (0,6) · binario e jeep (0,8) · felci (1,25) · foglie (1,6)

const r = rng(404);
const LEAVES = Array.from({ length: 8 }, () => ({ y: 500 + r() * 900, ph: r(), s: 0.7 + r() * 0.6 }));

export const Visita: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const roll = eio(seg(t, cues[1], cues[3])); // le jeep partono sul binario
  const storm = eio(seg(t, cues[3] - 0.6, dur)); // «ma arriva una tempesta»
  const flash = flashAt(t, [cues[3] + 0.6]);
  const wind = 0.3 + storm;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="vi" />
        <Lin id="vi-sky" stops={[[0, '#6E98A8'], [0.4, '#A8C4BC'], [0.6, '#D8E2CC']]} />
        <Lin id="vi-storm" stops={[[0, '#141E22'], [0.4, '#2E3E40'], [0.6, '#56645C']]} />
        <Lin id="vi-ground" stops={[[0, '#4A6E4A'], [1, '#22382A']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo che passa dal sereno alla tempesta */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#vi-sky)" />
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#vi-storm)" opacity={storm * 0.9} />
          <rect x="-200" y="-200" width="1480" height="1500" fill="#E8F2F4" opacity={flash * 0.3} />
          <Lightning x={900} y={560} h={360} flash={flash} seed={3} />
        </g>
        <g transform={L(0.35)}>
          <Clouds id="vi-cl" t={t} color="#2A3638" seed={5} n={4} y={600 + 0 * storm} h={180} speed={0.4 + wind} opacity={0.25 + 0.7 * storm} />
        </g>

        {/* PIANO 1 — giungla lontana */}
        <g transform={L(0.5)}>
          {[-80, 120, 320, 760, 960, 1160].map((x, i) => <JungleTree key={x} x={x} y={1080} h={170 + (i % 3) * 40} t={t * (1 + storm)} ph={i} outline={false} leaf={i % 2 ? '#2C5E40' : '#24533A'} trunk="#3A3020" />)}
          <Fog id="vi-fog" t={t} y={1060} color="#C9D8CC" rx={800} ry={50} opacity={0.35} />
        </g>

        {/* PIANO 2 — la recinzione altissima con il cartello (accento) */}
        <g transform={L(0.6)}>
          <Fence x0={-120} x1={1200} y={1110} h={500} posts={5} accent={P.accento} />
        </g>

        {/* PIANO 3 — strada col binario e le due jeep */}
        <g transform={L(0.8)}>
          <path d="M-200 1100 Q540 1070 1280 1100 V1500 H-200 Z" fill="url(#vi-ground)" stroke={K} strokeWidth="6" />
          <path d="M-200 1190 Q540 1160 1280 1190" fill="none" stroke="#9A8A6A" strokeWidth="60" />
          <path d="M-200 1190 Q540 1160 1280 1190" fill="none" stroke="#C9B88A" strokeWidth="8" strokeDasharray="40 30" />
          <Jeep x={180 + 200 * roll} y={1160} s={0.8} accent={P.accento} lights={storm} />
          <Jeep x={-220 + 200 * roll} y={1166} s={0.8} accent={P.accento} lights={storm} />
        </g>

        {/* PIANO 4 — felci giganti che incorniciano */}
        <g transform={L(1.25)}>
          <Fern x={40} y={1900} s={2.6} t={t * (1 + storm)} ph={0.5} />
          <Fern x={1040} y={1900} s={2.6} t={t * (1 + storm)} ph={2} flip />
          <Fern x={560} y={2000} s={1.8} t={t * (1 + storm)} ph={1} color="#24683F" />
        </g>
        {/* foglie strappate dal vento */}
        <g transform={L(1.6)}>
          {LEAVES.map((l, i) => {
            const p = mod(t * (0.15 + 0.25 * storm) + l.ph, 1);
            return <path key={i} d="M-20 0 Q0 -14 20 0 Q0 14 -20 0 Z" fill="#3E8A54" stroke={K} strokeWidth="3" transform={`translate(${1200 - p * 1500} ${l.y + Math.sin(p * 9) * 40}) rotate(${p * 720}) scale(${l.s * 1.4})`} opacity={storm} />;
          })}
          <NearMotes id="vi-near" t={t} color="#E8F0E8" n={5} y0={1300} opacity={0.08} />
        </g>
        <Glow id="vi-amb" x={540} y={800} r={600} t={t} color="#FFF6D8" amp={0} opacity={0.15 * (1 - storm)} />
      </g>
      <Finish id="vi" tint="#1E4A30" tintOpacity={0.1} />
    </svg>
  );
};
