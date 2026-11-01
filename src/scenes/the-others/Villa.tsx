import React from 'react';
import { camera, eo, lerp, rng, seg } from '../../lib/anim';
import { Flyers, Fog, Glow, Gulls, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { K, Lampada, OthersDefs, Ombra, Villa as Casa } from './Comuni';

// Una villa nella nebbia: la grande villa vittoriana di sera, isolata in un parco di alberi spogli, con tutte le tende
// chiuse. Eventi: prima frase la nebbia si apre e la villa emerge (corvi in cielo); seconda frase si accendono due
// finestre del corpo centrale (la famiglia: Grace e i figli, mai disegnati); terza frase in primo piano la lampada sul
// pilastro del cancello si accende, la luce che aspetta Charles, e il viale vuoto si perde nella nebbia.
// Piani: cielo e luna velata (0,25) · alberi lontani e nebbia (0,45) · villa (0,62) · prato, viale, alberi (0,9)
//        · cancello, pilastro con la lampada, rami (1,2) · foglie e nebbia vicina (1,5–1,8)

const r = rng(301);
const FAR = Array.from({ length: 16 }, (_, i) => ({ x: -160 + i * 92 + r() * 30, h: 150 + r() * 160, w: 70 + r() * 50 }));

/** Albero spoglio: tronco e rami che si biforcano (ricorsivo, deterministico). */
const ramo = (x: number, y: number, a: number, len: number, w: number, d: number, seed: number): string[] => {
  const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
  const out = [`M${x.toFixed(1)} ${y.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}|${w.toFixed(1)}`];
  if (d <= 0) return out;
  const k = ((seed * 9301 + 49297) % 233280) / 233280;
  return out.concat(
    ramo(x2, y2, a - 0.38 - k * 0.25, len * 0.74, w * 0.66, d - 1, seed + 7),
    ramo(x2, y2, a + 0.32 + k * 0.3, len * 0.7, w * 0.62, d - 1, seed + 13),
  );
};
const Albero: React.FC<{ x: number; y: number; s: number; seed: number; color: string; stroke?: string }> = ({ x, y, s, seed, color, stroke }) => {
  const segs = ramo(0, 0, -Math.PI / 2 + (seed % 3 - 1) * 0.06, 260, 44, 5, seed);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinecap="round">
      {stroke && segs.map((sg, i) => { const [d, w] = sg.split('|'); return <path key={`o${i}`} d={d} stroke={stroke} strokeWidth={Number(w) + 8} />; })}
      {segs.map((sg, i) => { const [d, w] = sg.split('|'); return <path key={i} d={d} stroke={color} strokeWidth={w} />; })}
    </g>
  );
};

export const Villa: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const reveal = eo(seg(t, 0, cues[0] + 1.6));
  const w1 = eo(seg(t, cues[1] + 0.3, cues[1] + 0.9));
  const w2 = eo(seg(t, cues[1] + 1.3, cues[1] + 1.9));
  const lamp = eo(seg(t, cues[2] + 0.2, cues[2] + 1.0));
  const lit = [0, 0, 0, 0, 0, 0, 0, 0, w1, 0, 0, w2 * 0.9, 0];

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="vi" />
        <OthersDefs id="vi" />
        <Lin id="vi-sky" stops={[[0, '#121A1E'], [0.3, '#26343A'], [0.55, '#4A5A5A'], [0.75, '#6E7C76']]} />
        <Lin id="vi-lawn" stops={[[0, '#2E3A34'], [0.4, '#1E2A24'], [1, '#0E1612']]} />
        <Lin id="vi-drive" stops={[[0, '#6A6E66'], [1, '#2A2C28']]} />
        <Lin id="vi-pillar" x2={1} y2={0} stops={[[0, '#7A807A'], [0.5, '#5A605C'], [1, '#2E3331']]} />
        <Lin id="vi-iron" x2={1} y2={0} stops={[[0, '#1A1E20'], [0.5, '#4A5054'], [1, '#141618']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo crepuscolare e luna velata (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#vi-sky)" />
          <Glow id="vi-moon" x={840} y={640} r={260} t={t} color="#DDE6E0" amp={0.03} rate={0.8} opacity={0.45} />
          <circle cx="840" cy="640" r="46" fill="#D8E0DA" opacity=".55" />
          <Fog id="vi-cl1" t={t} y={620} x={700} rx={520} ry={40} color="#8A9894" opacity={0.35} speed={0.12} drift={60} />
          <Gulls t={t} seed={5} n={4} y={560} h={120} color="#0E1214" size={0.8} period={14} />
        </g>

        {/* PIANO 1 — bosco lontano senza contorni e primo banco di nebbia (0,45) */}
        <g transform={L(0.45)}>
          {FAR.map((f, i) => (
            <g key={i} opacity=".55">
              <rect x={f.x + f.w / 2 - 6} y={1100 - f.h * 0.4} width="12" height={f.h * 0.4} fill="#3A4644" />
              <ellipse cx={f.x + f.w / 2} cy={1100 - f.h * 0.55} rx={f.w / 2} ry={f.h / 2} fill="#3E4A48" />
            </g>
          ))}
          <rect x="-200" y="1080" width="1480" height="200" fill="#4A5654" />
          <Fog id="vi-f1" t={t} y={1090} rx={900} ry={90} color="#9AA8A2" opacity={0.6} speed={0.2} drift={80} />
        </g>

        {/* PIANO 2 — la villa che emerge dalla nebbia (0,62) */}
        <g transform={L(0.62)}>
          <Casa id="vi" x={540} y={1200} t={t} s={0.9} lit={lit} />
          {/* finestre accese: alone caldo fuori dai vetri */}
          <Glow id="vi-w1" x={540 - 106 * 0.9} y={1200 - 350 * 0.9} r={150} t={t} color="#FFC870" amp={0.06} rate={6} opacity={0.6 * w1} />
          <Glow id="vi-w2" x={540 - 106 * 0.9} y={1200 - 220 * 0.9} r={130} t={t} color="#FFC870" amp={0.06} rate={6} ph={2} opacity={0.5 * w2} />
          {/* velo di nebbia che si apre */}
          <rect x="-200" y="500" width="1480" height="700" fill="#7E8C86" opacity={0.75 * (1 - reveal)} />
          <Fog id="vi-f2" t={t} y={1180} rx={720} ry={70} color="#A8B4AE" opacity={0.55} speed={0.25} ph={1} drift={120} />
        </g>

        {/* PIANO 3 — prato, viale di ghiaia, alberi spogli ai lati (0,9) */}
        <g transform={L(0.9)}>
          <path d="M-200 1215 Q540 1195 1280 1215 V2200 H-200 Z" fill="url(#vi-lawn)" />
          <path d="M492 1210 H588 L860 2200 H220 Z" fill="url(#vi-drive)" stroke={K} strokeWidth="6" />
          {Array.from({ length: 40 }, (_, i) => {
            const v = (i * 0.618) % 1, yy = 1230 + v * v * 860, half = lerp(50, 320, (yy - 1210) / 990);
            return <circle key={i} cx={540 + (((i * 37) % 100) / 50 - 1) * half * 0.9} cy={yy} r={2 + v * 4} fill="#9A9C92" opacity=".5" />;
          })}
          <path d="M490 1210 L218 2200 M590 1210 L862 2200" stroke="#3A3E38" strokeWidth="8" />
          {/* siepi basse */}
          {[[-60, 1260, 260], [880, 1260, 280]].map(([hx, hy, hw], i) => (
            <g key={i}>
              <path d={`M${hx} ${hy} q${hw * 0.25} -50 ${hw * 0.5} -10 q${hw * 0.25} -50 ${hw * 0.5} 10 v60 h${-hw} Z`} fill="#1E2C24" stroke={K} strokeWidth="6" />
              <path d={`M${hx + 20} ${hy - 6} q${hw * 0.2} -30 ${hw * 0.4} -6`} stroke="#4A6252" strokeWidth="5" fill="none" opacity=".6" />
            </g>
          ))}
          <Albero x={60} y={1330} s={0.86} seed={3} color="#141A1A" stroke={K} />
          <Albero x={1030} y={1320} s={0.8} seed={8} color="#141A1A" stroke={K} />
          <Fog id="vi-f3" t={t} y={1320} rx={820} ry={80} color="#B0BCB6" opacity={0.42} speed={0.18} ph={2.5} drift={100} />
        </g>

        {/* PIANO 4 — il cancello di ferro e il pilastro con la lampada che aspetta Charles (1,2) */}
        <g transform={L(1.2)}>
          {/* anta del cancello aperta a sinistra */}
          <g>
            {Array.from({ length: 9 }, (_, i) => {
              const bx = 40 + i * 30, top = 1420 + Math.abs(i - 4) * -12 + 40;
              return (
                <g key={i}>
                  <rect x={bx} y={top} width="10" height={1920 - top} fill="url(#vi-iron)" stroke={K} strokeWidth="3" />
                  <path d={`M${bx + 5} ${top - 30} l-12 30 h24 Z`} fill="#2A2E30" stroke={K} strokeWidth="3" />
                </g>
              );
            })}
            {[1560, 1760].map((by) => <rect key={by} x="30" y={by} width="290" height="14" fill="url(#vi-iron)" stroke={K} strokeWidth="4" />)}
            <path d="M60 1640 q40 -60 80 0 q40 -60 80 0 q40 -60 80 0" stroke="#2A2E30" strokeWidth="8" fill="none" />
          </g>
          {/* pilastri di pietra */}
          {[[-60, 1360], [830, 1300]].map(([px, py], i) => (
            <g key={i}>
              <rect x={px} y={py} width="190" height={2000 - py} fill="url(#vi-pillar)" stroke={K} strokeWidth="9" />
              {Array.from({ length: 7 }, (_, k) => <path key={k} d={`M${px} ${py + 70 + k * 80} H${px + 190}`} stroke="#000" strokeWidth="3" opacity=".25" />)}
              <rect x={px - 18} y={py - 30} width="226" height="36" fill="#8A908A" stroke={K} strokeWidth="7" />
              <path d={`M${px - 14} ${py - 26} H${px + 204}`} stroke="#C8CEC6" strokeWidth="4" opacity=".6" />
              <path d={`M${px + 30} ${py + 120} q20 40 0 80 q-14 30 10 70`} stroke="#1E3226" strokeWidth="14" fill="none" strokeLinecap="round" />
            </g>
          ))}
          <Glow id="vi-lampbig" x={925} y={1140} r={420} t={t} color="#FFC870" amp={0.06} rate={7} opacity={0.55 * lamp} />
          <Ombra id="vi" x={925} y={1272} rx={90} ry={10} />
          <Lampada id="vi" x={925} y={1270} t={t} s={0.66} lit={0.12 + 0.88 * lamp} glow={lamp} ph={0.7} />
          {/* rami in primo piano che entrano dall'alto a sinistra */}
          <g strokeLinecap="round" fill="none">
            <path d="M-80 520 Q120 560 260 640 Q330 680 380 700" stroke={K} strokeWidth="26" />
            <path d="M120 580 Q170 520 240 500 M260 640 Q300 600 360 600" stroke={K} strokeWidth="12" />
            <path d="M-80 514 Q120 552 260 632" stroke="#4A5654" strokeWidth="4" opacity=".6" />
          </g>
        </g>

        {/* PIANO 5 — foglie secche e nebbia vicina alla camera (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Flyers t={t} seed={11} n={5} color="#6A5A3A" outline={K} w={30} h={40} y0={700} y1={1700} speed={0.08} shape="leaf" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="vi-near" t={t} color="#C8D4CE" n={7} r0={80} r1={180} opacity={0.12} />
        </g>
      </g>
      <Finish id="vi" tint="#3A4744" tintOpacity={0.12} />
    </svg>
  );
};
