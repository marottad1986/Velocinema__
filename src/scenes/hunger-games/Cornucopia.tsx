import React from 'react';
import { camera, eo, lerp, rng, seg } from '../../lib/anim';
import { ANTON } from '../../lib/fonts';
import { Fog, Glow, Gulls, NearMotes, Smoke, SunRays, flashAt } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Backpack, Cornucopia as Corno, Dome, HGDefs, K, Pine, PineRow, Sottobosco } from './Comuni';

// La corsa alla Cornucopia: l'alba nella radura dell'arena. Il grande corno dorato pieno di armi e zaini, attorno il
// cerchio delle piattaforme di partenza, in cielo il conto alla rovescia proiettato sulla cupola. Eventi: 1ª frase il
// conto arriva a zero, la cupola lampeggia e il corno si illumina (la corsa comincia); 2ª frase due colpi di cannone
// dal bosco e sbuffi di fumo (metà dei ragazzi muore subito), poi lo zaino arancione davanti al corno sparisce in una
// nuvola di polvere e una fila di impronte corre verso il bosco (Katniss che fugge).
// Piani: cielo dell'alba e cupola (0,2) · bosco lontano (0,4) · radura e Cornucopia (0,65)
//        · pini e cespugli che incorniciano (1,15) · polline e particelle vicine (1,6)

const r = rng(5151);
const WEAPONS = Array.from({ length: 7 }, () => ({ x: 380 + r() * 560, y: 1200 + r() * 60, a: -60 + r() * 120, l: 70 + r() * 60 }));

export const Cornucopia: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1050);
  const L = cam.layer;
  const zero = griglia(cues[0] + 2.0);
  const count = Math.max(0, Math.ceil((zero - t) / (60 / 90)));
  const go = eo(seg(t, zero, zero + 0.5));
  const c1 = griglia(cues[1] + 0.4), c2 = griglia(cues[1] + 1.4);
  const flash = flashAt(t, [c1, c2], [0.8, 0.6]);
  const smoke = seg(t, c1, c1 + 0.3);
  const tp = griglia(cues[1] + 2.8);
  const grab = eo(seg(t, tp, tp + 0.35));
  const trail = seg(t, tp + 0.2, tp + 1.6);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="co" />
        <HGDefs id="co" />
        <Lin id="co-sky" stops={[[0, '#1E2A3A'], [0.3, '#5A5A70'], [0.5, '#D8907A'], [0.6, '#F2C890']]} />
        <Lin id="co-ground" stops={[[0, '#6A7A40'], [0.35, '#4A5A2E'], [1, '#18200E']]} />
        <radialGradient id="co-clear" cx=".5" cy=".4" r=".6">
          <stop offset="0" stopColor="#A8A85A" />
          <stop offset="1" stopColor="#6A7A40" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo dell'alba, cupola a esagoni e conto alla rovescia (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#co-sky)" />
          <SunRays id="co-rays" x={540} y={1150} t={t} color="#FFE8B8" n={9} length={700} opacity={0.25} />
          <Glow id="co-sun" x={540} y={1150} r={460} t={t} color="#FFE0A8" amp={0.03} rate={1} opacity={0.6} />
          <Dome y0={40} y1={1150} size={80} color="#FFF4E0" opacity={0.08} t={t} flash={0.35 * go * (1 - seg(t, zero + 0.4, zero + 1.4))} />
          <Gulls t={t} seed={2} n={3} y={700} h={80} color="#3A3A4A" size={0.6} period={10} />
          {/* conto alla rovescia proiettato in cielo */}
          <g opacity={1 - seg(t, zero + 0.5, zero + 1.3)}>
            <Glow id="co-cd" x={850} y={760} r={150} t={t} color="#9FE0FF" amp={0.1} rate={9} opacity={0.5} />
            <text x="850" y="810" textAnchor="middle" fontFamily={ANTON} fontSize="150" fill={go > 0 ? '#FFFFFF' : '#CFF0FF'} stroke="#2A5A7A" strokeWidth="4" opacity=".9">{count}</text>
          </g>
        </g>

        {/* PIANO 1 — bosco lontano con la nebbia del mattino (0,4) */}
        <g transform={L(0.4)}>
          <PineRow y={1150} n={20} h0={170} h1={300} fill="#5A6A5A" seed={6} />
          <PineRow y={1185} n={18} h0={140} h1={240} fill="#3E4E3E" seed={12} />
          <Fog id="co-f1" t={t} y={1160} rx={900} ry={70} color="#F2E0C8" opacity={0.55} speed={0.2} />
          {/* lampi dei cannoni dal bosco e sbuffi di fumo */}
          <Glow id="co-cn1" x={160} y={1110} r={200} t={t} color="#FFF0D0" amp={0} opacity={flash} />
          <Glow id="co-cn2" x={980} y={1100} r={200} t={t} color="#FFF0D0" amp={0} opacity={flash * 0.8} />
          <g opacity={smoke}>
            <Smoke id="co-sm1" t={t} x={160} y={1110} color="#C8C8C0" n={7} rise={220} wind={80} r0={20} r1={80} speed={0.25} opacity={0.7} />
            <Smoke id="co-sm2" t={t + 1} x={980} y={1100} color="#C8C8C0" n={7} rise={220} wind={-80} r0={20} r1={80} speed={0.25} opacity={0.7} />
          </g>
        </g>

        {/* PIANO 2 — la radura, il cerchio delle piattaforme e la Cornucopia (0,65) */}
        <g transform={L(0.65)}>
          <path d="M-200 1150 Q540 1130 1280 1150 V2200 H-200 Z" fill="url(#co-ground)" />
          <ellipse cx="540" cy="1220" rx="700" ry="150" fill="url(#co-clear)" />
          {/* piattaforme di metallo */}
          {Array.from({ length: 11 }, (_, i) => {
            const a = Math.PI * (0.04 + (i / 10) * 0.92);
            const px = 540 - Math.cos(a) * 560, py = 1185 + Math.sin(a) * 100;
            return (
              <g key={i}>
                <ellipse cx={px} cy={py + 6} rx="46" ry="13" fill="#2A2E30" />
                <ellipse cx={px} cy={py} rx="46" ry="13" fill="#A8B0B4" stroke={K} strokeWidth="5" />
                <ellipse cx={px - 8} cy={py - 3} rx="26" ry="5" fill="#E8F0F2" opacity=".6" />
              </g>
            );
          })}
          {/* armi sparse nell'erba */}
          {WEAPONS.map((w, i) => (
            <g key={i} transform={`translate(${w.x} ${w.y}) rotate(${w.a})`}>
              <path d={`M${-w.l / 2} 0 H${w.l / 2}`} stroke={K} strokeWidth="10" strokeLinecap="round" />
              <path d={`M${-w.l / 2} 0 H${w.l / 2}`} stroke={i % 2 ? '#8A6A44' : '#B8C0C4'} strokeWidth="5" strokeLinecap="round" />
            </g>
          ))}
          <Glow id="co-hg" x={480} y={1000} r={420} t={t} color="#FFE0A0" amp={0.05} rate={2} opacity={0.3 + 0.35 * go} />
          <Corno id="co" x={250} y={1180} s={0.85} t={t} pack={0} />
          {/* lo zaino arancione davanti al corno: sparisce in una nuvola di polvere */}
          <g opacity={1 - grab} transform={`translate(${-60 * grab} ${-20 * grab})`}>
            <Glow id="co-pg" x={470} y={1170} r={120} t={t} color="#FFB060" amp={0.1} rate={5} opacity={0.6} />
            <Backpack x={470} y={1235} s={0.72} color="ember" id="co" rot={-6} />
          </g>
          {grab > 0 && trail < 1 && Array.from({ length: 6 }, (_, k) => (
            <circle key={k} cx={460 - k * 26 * trail} cy={1220 - k * 6} r={lerp(14, 60, trail)} fill="#C8B890" opacity={(1 - trail) * 0.6} />
          ))}
          {/* impronte verso il bosco (a destra, lontano dal corno) */}
          {Array.from({ length: 8 }, (_, k) => {
            const u = k / 7;
            const on = seg(trail, u * 0.9, u * 0.9 + 0.1);
            const fx = lerp(450, 1000, u) + (k % 2 ? 10 : -10), fy = lerp(1245, 1175, u);
            return <ellipse key={k} cx={fx} cy={fy} rx={lerp(32, 18, u)} ry={lerp(13, 7, u)} fill="#0C1006" opacity={on * 0.95} />;
          })}
        </g>

        {/* PIANO 3 — pini scuri e cespugli che incorniciano (1,15) */}
        <g transform={L(1.15)}>
          <Pine x={-60} y={1620} h={980} w={440} fill="#18241A" outline={K} lit="#8AA06A" seed={41} />
          <Pine x={1150} y={1640} h={1040} w={460} fill="#18241A" outline={K} lit="#8AA06A" seed={52} />
          <Sottobosco id="co" t={t} y0={1590} ground="#3A4A22" fern="#4E6A2A" stone="#8A8C7A" lit="#E8E0B0" seed={3} />
        </g>

        {/* PIANO 4 — polline nella luce e particelle vicine (1,6) */}
        <g transform={L(1.6)}>
          <NearMotes id="co-near" t={t} color="#FFF0C8" n={9} r0={50} r1={140} y0={700} y1={1900} opacity={0.14} />
        </g>
      </g>
      <Finish id="co" tint="#1E3A2A" tintOpacity={0.1} />
    </svg>
  );
};

