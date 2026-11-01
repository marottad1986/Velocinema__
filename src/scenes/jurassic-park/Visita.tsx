import React from 'react';
import { camera, eio, eo, lerp, mod, seg } from '../../lib/anim';
import { Clouds, Flyers, Fog, Glow, Lightning, NearMotes, Rain, SunRays, flashAt } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Fence, Fern, JPDefs, Jeep, JungleTree, K, Ombra } from './Comuni';

// La visita: la strada del parco nella giungla, con il binario guidato in mezzo; dietro la recinzione altissima con il
// cartello di pericolo; in primo piano una jeep elettrica grande (oggetto chiave), con le fasce accento.
// Eventi: prima frase sul sedile della jeep compaiono due zainetti da bambini (i nipoti); seconda e terza frase la jeep
// parte da sola e le luci del binario scorrono sotto (vanno da sole su un binario); quarta frase il cielo si chiude,
// comincia la pioggia e a cue 3 + 0,6 arriva un lampo (il tuono dello spartito).
// Piani: cielo che si scurisce (0,2) · nuvole (0,3) · giungla lontana (0,45) · recinzione (0,6) · strada, binario e jeep (0,8)
//        · felci in primo piano (1,25) · foglie, pioggia vicina e particelle (1,5–1,8)

export const Visita: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const packs = eo(seg(t, cues[0] + 0.4, cues[0] + 1.2));
  const roll = eio(seg(t, cues[1], cues[3]));
  const railRun = cues[1] < t ? (t - cues[1]) * 220 * Math.min(1, (t - cues[1]) / 0.8) : 0;
  const storm = eio(seg(t, cues[3] - 0.6, dur));
  const flash = flashAt(t, [cues[3] + 0.6]);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="vs" />
        <JPDefs id="vs" />
        <Lin id="vs-sky" stops={[[0, '#6A9AB4'], [0.5, '#A8CCD4'], [1, '#D8E8D4']]} />
        <Lin id="vs-storm" stops={[[0, '#1A2228'], [0.5, '#3A4A50'], [1, '#5A6A68']]} />
        <Lin id="vs-road" stops={[[0, '#8A7A5A'], [1, '#4A3E2A']]} />
        <Lin id="vs-rail" x2={1} y2={0} stops={[[0, '#3A3E3A'], [0.5, '#8A928A'], [1, '#3A3E3A']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — il cielo che passa dal sereno alla tempesta, con il lampo (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#vs-sky)" />
          <SunRays id="vs-rays" x={900} y={300} t={t} color="#FFF8E0" n={8} length={800} opacity={0.18 * (1 - storm)} />
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#vs-storm)" opacity={0.9 * storm} />
          <rect x="-200" y="-200" width="1480" height="2400" fill="#E8F4FF" opacity={0.45 * flash} />
          <Lightning x={820} y={500} h={420} flash={flash} seed={3} width={8} />
        </g>
        <g transform={L(0.3)}>
          <Clouds id="vs-cl" t={t} color={storm > 0.5 ? '#2A3238' : '#F2F6F2'} seed={7} n={5} y={600} h={160} speed={10 + 30 * storm} opacity={0.6 + 0.3 * storm} />
        </g>

        {/* PIANO 1 — giungla lontana (0,45) */}
        <g transform={L(0.45)}>
          {Array.from({ length: 9 }, (_, i) => <JungleTree key={i} x={-120 + i * 170} y={1060} h={100 + (i % 3) * 40} t={t * (1 + storm)} ph={i} leaf={['#2E6A44', '#245F3C', '#3A7A50'][i % 3]} trunk="url(#vs-trunk)" outline={false} />)}
          <Fog id="vs-fog" t={t} y={1000} rx={800} ry={60} color="#C8D8C8" opacity={0.3 + 0.2 * storm} />
        </g>

        {/* PIANO 2 — la recinzione altissima con il cartello (0,6) */}
        <g transform={L(0.6)}>
          <Fence id="vs" x0={-80} x1={1160} y={1100} h={500} posts={5} accent={P.accento} />
        </g>

        {/* PIANO 3 — strada con il binario guidato e la jeep (0,8) */}
        <g transform={L(0.8)}>
          <path d="M-200 1080 H1280 V2200 H-200 Z" fill="url(#vs-road)" />
          <path d="M-200 1082 H1280" stroke="#B8A880" strokeWidth="5" opacity=".6" />
          <rect x="-200" y="1196" width="1480" height="24" fill="url(#vs-rail)" stroke={K} strokeWidth="5" />
          {Array.from({ length: 14 }, (_, i) => {
            const x = mod(i * 110 - railRun, 1540) - 200;
            return <rect key={i} x={x} y="1202" width="44" height="12" rx="4" fill={P.accento} opacity={0.4 + 0.6 * Math.min(1, railRun / 100)} />;
          })}
          {/* solchi delle ruote, sassi e pozzanghere sulla strada */}
          {[1300, 1420, 1580, 1780].map((y, i) => <path key={y} d={`M-200 ${y} Q540 ${y - 20 - i * 6} 1280 ${y}`} stroke="#3A2E1E" strokeWidth={6 + i * 3} fill="none" opacity=".45" />)}
          {Array.from({ length: 22 }, (_, i) => <ellipse key={i} cx={(i * 197) % 1400 - 160} cy={1290 + ((i * 131) % 700)} rx={8 + (i % 4) * 6} ry={5 + (i % 3) * 3} fill="#6A5A40" stroke={K} strokeWidth="3" />)}
          {[[240, 1500, 160], [820, 1680, 200]].map(([x, y, w], i) => <g key={i}><ellipse cx={x} cy={y} rx={w} ry={w * 0.16} fill="#7A9AA8" opacity={0.35 + 0.3 * storm} /><path d={`M${x - w * 0.5} ${y - 4} H${x + w * 0.2}`} stroke="#E8F4FF" strokeWidth="4" opacity=".5" /></g>)}
          {storm > 0.3 && Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={100 + i * 180} cy={1260 + (i % 2) * 20} rx="70" ry="10" fill="#9AB0B8" opacity={0.3 * storm} />)}
          <g transform={`translate(${lerp(500, 760, roll)} 1180)`}>
            <Ombra id="vs" x={0} y={50} rx={260} ry={22} />
            <Jeep id="vs" x={0} y={0} s={1.35} accent={P.accento} lights={storm} />
            {/* due zainetti da bambini sul sedile */}
            <g opacity={packs} transform={`translate(0 ${-20 * (1 - packs)})`}>
              {[[-90, '#E85A4A'], [-30, '#4AA0E0']].map(([x, c], i) => (
                <g key={i} transform={`translate(${x} -150) rotate(${i ? 8 : -6})`}>
                  <path d="M-28 40 V-10 Q-28 -40 0 -40 Q28 -40 28 -10 V40 Z" fill={String(c)} stroke={K} strokeWidth="6" />
                  <rect x="-18" y="6" width="36" height="24" rx="6" fill="#F2EEE4" opacity=".8" stroke={K} strokeWidth="4" />
                  <path d="M-12 -36 Q0 -52 12 -36" stroke={K} strokeWidth="5" fill="none" />
                </g>
              ))}
            </g>
          </g>
        </g>

        {/* PIANO 4 — felci in primo piano che si piegano col vento (1,25) */}
        <g transform={L(1.25)}>
          <Fern x={-60} y={2000} s={2.4} t={t * (1 + 2 * storm)} ph={0} color="#2E7D4F" />
          <Fern x={1140} y={2000} s={2.3} t={t * (1 + 2 * storm)} ph={1} color="#276B44" flip />
          <Fern x={520} y={2140} s={1.7} t={t * (1 + 2 * storm)} ph={2} color="#3A8A58" />
        </g>

        {/* PIANO 5 — foglie nel vento, pioggia vicina, particelle (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Flyers t={t} seed={3} n={Math.round(3 + 6 * storm)} color="#5FA672" outline={K} y0={700} y1={1500} speed={0.5 + storm} shape="leaf" />
          <g opacity={storm}><Rain t={t} level="near" seed={6} color="#B8C8D0" opacity={0.4} /></g>
          <g opacity={storm}><Rain t={t} level="far" seed={2} color="#8AA0A8" opacity={0.4} /></g>
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="vs-near" t={t} color="#E8F8E0" n={6} opacity={0.08} />
        </g>
        <rect x="-200" y="-200" width="1480" height="2400" fill="#0A1418" opacity={0.25 * storm} />
        <Glow id="vs-flash" x={820} y={600} r={900} t={t} color="#E8F4FF" amp={0} opacity={0.4 * flash} />
      </g>
      <Finish id="vs" tint={storm > 0.5 ? '#0F1F17' : '#1E4A30'} tintOpacity={0.1} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): zainetti cue0 + 0,4 · jeep e binario da cue1 · tempesta cue3 − 0,6 · lampo cue3 + 0,6.
