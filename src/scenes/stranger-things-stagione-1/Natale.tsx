import React from 'react';
import { camera, eo, lerp, rng, seg } from '../../lib/anim';
import { Glow, NearMotes, Stars, StringLights } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Abete, CROMA, GIALLO, K, Ombra, SOTTO, StDefs, VELATURA } from './Comuni';

// Natale, ma non è finita: il bosco innevato vicino a casa Byers, la notte di Natale. Eventi: prima frase le finestre
// di casa si accendono una dopo l'altra e le lucine sul tetto prendono vita (Will è tornato a casa); seconda frase la
// finestrella del bagno si accende per un attimo di luce fredda azzurra e ne escono spore (Will rivede il Sottosopra);
// terza frase accanto alla scatola di legno con i waffle si accende una lanterna e compaiono, una alla volta, le
// impronte degli stivali di Hopper che se ne vanno (forse Undici è viva).
// Piani: cielo e stelle (0,2) · bosco lontano innevato (0,35) · casa con le lucine (0,5) · prato innevato (0,7)
//        · abete con la scatola dei waffle e la lanterna (1,1) · cespugli e slittino (1,25) · neve vicina (1,5) · velo (1,8)

const r = rng(1111);
const FAR = Array.from({ length: 14 }, (_, i) => ({ x: -180 + i * 104 + r() * 40, h: 260 + r() * 200, w: 130 + r() * 50 }));
const SNOW = Array.from({ length: 70 }, () => ({ x: r() * 1300 - 110, y: r() * 1300, s: 2 + r() * 4, v: 30 + r() * 50, ph: r() * 6 }));
const SNOW_NEAR = Array.from({ length: 22 }, () => ({ x: r() * 1300 - 110, y: r() * 1300, s: 7 + r() * 8, v: 90 + r() * 80, ph: r() * 6 }));
const BOOTS = Array.from({ length: 7 }, (_, i) => ({ x: 560 + i * 70 + (i % 2 ? 16 : -16), y: 1230 - i * 22, s: 1 - i * 0.08 }));

const Neve: React.FC<{ t: number; flakes: typeof SNOW; color: string; y0: number }> = ({ t, flakes, color, y0 }) => (
  <g>
    {flakes.map((f, i) => {
      const y = y0 + ((f.y + t * f.v) % 1300);
      return <circle key={i} cx={f.x + Math.sin(t * 0.8 + f.ph) * 18} cy={y} r={f.s} fill={color} opacity=".85" />;
    })}
  </g>
);

export const Natale: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;

  const tHome = griglia(cues[0] + 1.0);
  const win = (k: number) => eo(seg(t, tHome + k * CROMA, tHome + k * CROMA + 0.25));
  const tBath = griglia(cues[1] + 1.6);
  const bath = eo(seg(t, tBath, tBath + 0.2)) * (1 - eo(seg(t, tBath + 1.2, tBath + 1.7)));
  const bathSpores = seg(t, tBath, tBath + 0.3);
  const tLamp = griglia(cues[2] + 0.4);
  const lamp = eo(seg(t, tLamp, tLamp + 0.3));
  const boot = (k: number) => eo(seg(t, tLamp + 2 * CROMA + k * CROMA, tLamp + 2 * CROMA + 0.2 + k * CROMA));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="na" />
        <StDefs id="na" />
        <Lin id="na-sky" stops={[[0, '#05070E'], [0.3, '#0E1628'], [0.55, '#1C2A44'], [0.65, '#2A3A58']]} />
        <Lin id="na-snow" stops={[[0, '#C8D4E4'], [0.5, '#9AAAC2'], [1, '#5A6A84']]} />
        <Lin id="na-crate" x2={1} y2={0} stops={[[0, '#8A6A44'], [0.5, '#B08A5A'], [1, '#6A4E30']]} />
        <radialGradient id="na-spore"><stop offset="0" stopColor="#D8EEF8" stopOpacity=".95" /><stop offset="1" stopColor="#D8EEF8" stopOpacity="0" /></radialGradient>
        <pattern id="na-waffle" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="#D89A44" /><rect x="3" y="3" width="10" height="10" fill="#B87A2A" />
        </pattern>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo con le stelle (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#na-sky)" />
          <Stars t={t} seed={25} n={70} x={-100} y={60} w={1280} h={560} color="#E8EEF8" size={0.7} />
        </g>

        {/* PIANO 1 — bosco lontano con la neve sui rami (0,35) */}
        <g transform={L(0.35)}>
          {FAR.map((f, i) => (
            <g key={i}>
              <Abete x={f.x} y={1060} h={f.h} w={f.w} color="#16223A" seed={i + 80} />
              <path d={`M${f.x - f.w * 0.2} ${1060 - f.h * 0.6} l${f.w * 0.2} -${f.h * 0.12} l${f.w * 0.2} ${f.h * 0.12}`} stroke="#8A9AB8" strokeWidth="6" fill="none" opacity=".5" />
            </g>
          ))}
          <rect x="-200" y="1040" width="1480" height="200" fill="#6A7A94" />
        </g>

        {/* PIANO 2 — casa Byers con le lucine e le finestre (0,5) */}
        <g transform={L(0.5)}>
          <Glow id="na-houseglow" x={680} y={930} r={420} t={t} color="#FFC870" amp={0.03} rate={1.5} opacity={0.35 * win(2)} />
          <path d="M440 820 L680 720 L920 820 V1080 H440 Z" fill="url(#na-siding)" stroke={K} strokeWidth="8" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M440 ${850 + i * 28} H920`} stroke="#000" strokeWidth="3" opacity=".22" />)}
          <path d="M410 834 L680 708 L950 834" fill="none" stroke="#1C2028" strokeWidth="28" strokeLinejoin="round" />
          <path d="M414 822 L680 698 L946 822" fill="none" stroke="#E8EEF8" strokeWidth="14" strokeLinejoin="round" />
          <g opacity={0.35 + 0.65 * win(0)}>
            <StringLights id="na-sl1" t={t} from={{ x: 430, y: 838 }} to={{ x: 680, y: 722 }} n={8} sag={10} r={7} wire="#141018" />
            <StringLights id="na-sl2" t={t + 2} from={{ x: 680, y: 722 }} to={{ x: 930, y: 838 }} n={8} sag={10} r={7} wire="#141018" />
          </g>
          {/* finestre: soggiorno, cucina, camera di Will */}
          {[[480, 900, 0], [580, 900, 1], [790, 900, 2]].map(([wx, wy, k]) => (
            <g key={k}>
              <rect x={wx} y={wy} width="76" height="86" fill={win(k) > 0.1 ? '#FFC870' : '#1C2430'} stroke={K} strokeWidth="6" />
              <rect x={wx} y={wy} width="76" height="86" fill="#1C2430" opacity={1 - win(k)} />
              <path d={`M${wx + 38} ${wy} V${wy + 86} M${wx} ${wy + 43} H${wx + 76}`} stroke={K} strokeWidth="4" />
              <path d={`M${wx} ${wy + 86} H${wx + 76}`} stroke="#E8EEF8" strokeWidth="8" />
            </g>
          ))}
          {/* finestrella del bagno: un attimo di luce fredda */}
          <rect x="700" y="760" width="50" height="46" fill={bath > 0.1 ? SOTTO : '#FFD890'} stroke={K} strokeWidth="5" opacity={0.4 + 0.6 * Math.max(win(2), bath)} />
          <Glow id="na-bath" x={725} y={783} r={200} t={t} color={SOTTO} amp={0.1} rate={9} opacity={0.9 * bath} />
          {/* porta con la ghirlanda */}
          <rect x="680" y="960" width="80" height="120" fill="#5A2A22" stroke={K} strokeWidth="6" />
          <circle cx="720" cy="1000" r="22" fill="none" stroke="#2E5A34" strokeWidth="10" />
          <circle cx="720" cy="1022" r="5" fill="#B8352F" />
          {/* spore che escono dal bagno */}
          {bathSpores > 0 && Array.from({ length: 12 }, (_, i) => {
            const p = seg(t, tBath + i * 0.05, tBath + 2.2 + i * 0.05);
            return <circle key={i} cx={725 + (i % 2 ? 1 : -1) * p * (30 + i * 8)} cy={783 - p * (40 + (i % 4) * 20) + Math.sin(t * 2 + i) * 6} r={4 + (i % 3) * 2} fill="url(#na-spore)" opacity={(1 - p) * 0.9} />;
          })}
        </g>

        {/* PIANO 3 — prato innevato con le impronte degli stivali (0,7) */}
        <g transform={L(0.7)}>
          <path d="M-200 1090 Q300 1070 600 1090 Q900 1110 1280 1080 V2200 H-200 Z" fill="url(#na-snow)" stroke="#3A4A64" strokeWidth="5" />
          <path d="M-200 1094 Q300 1074 600 1094 Q900 1114 1280 1084" stroke="#F2F6FC" strokeWidth="5" fill="none" opacity=".7" />
          {/* staccionata sepolta nella neve */}
          {Array.from({ length: 6 }, (_, i) => (
            <g key={i}>
              <rect x={-40 + i * 80} y={1050 - i * 4} width="16" height="60" fill="#3A3026" stroke={K} strokeWidth="4" />
              <path d={`M${-44 + i * 80} ${1050 - i * 4} h24`} stroke="#F2F6FC" strokeWidth="6" />
            </g>
          ))}
          <path d="M-40 1066 L420 1046" stroke="#3A3026" strokeWidth="10" />
          {/* impronte di stivali che dalla scatola vanno verso destra */}
          {BOOTS.map((b, k) => (
            <g key={k} transform={`translate(${b.x} ${b.y}) scale(${b.s})`} opacity={boot(k)}>
              <path d="M-14 -10 Q-16 -30 0 -32 Q16 -30 14 -10 Q14 4 6 10 H-6 Q-14 4 -14 -10 Z" fill="#5A6A84" stroke="#3A4A64" strokeWidth="3" transform="scale(1.4 0.6)" />
              <rect x="-10" y="6" width="20" height="10" rx="3" fill="#5A6A84" transform="scale(1.4 0.6)" />
            </g>
          ))}
        </g>

        {/* PIANO 4 — abete grande a sinistra con la scatola dei waffle e la lanterna (1,1) */}
        <g transform={L(1.1)}>
          <Abete x={40} y={1380} h={720} w={440} color="#0E1A28" seed={3} />
          {Array.from({ length: 6 }, (_, i) => {
            const yy = 1380 - 720 + (720 * 0.9 * (i + 1)) / 7, half = 220 * (0.25 + 0.75 * ((i + 1) / 7));
            return <path key={i} d={`M${40 - half * 0.9} ${yy - 6} Q${40} ${yy - 30} ${40 + half * 0.9} ${yy - 6}`} stroke="#E8EEF8" strokeWidth="10" fill="none" strokeLinecap="round" opacity=".85" />;
          })}
          <Abete x={1110} y={1420} h={740} w={400} color="#0E1A28" seed={9} />
          {/* la scatola di legno con i waffle, sulla neve */}
          <Ombra id="na" x={370} y={1250} rx={150} ry={14} />
          <path d="M250 1150 H490 V1246 H250 Z" fill="url(#na-crate)" stroke={K} strokeWidth="8" />
          <path d="M250 1182 H490 M250 1214 H490" stroke="#5A3E24" strokeWidth="4" />
          <path d="M250 1150 L230 1130 H470 L490 1150" fill="#9A7A4E" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          {/* waffle impilati */}
          {[[296, 1126, -6], [356, 1120, 4], [416, 1128, -2], [326, 1108, 8]].map(([wx, wy, a], i) => (
            <g key={i} transform={`translate(${wx} ${wy}) rotate(${a})`}>
              <rect x="-34" y="-14" width="68" height="28" rx="6" fill="url(#na-waffle)" stroke={K} strokeWidth="4" />
              <path d="M-30 -10 H30" stroke="#F2C878" strokeWidth="3" opacity=".7" />
            </g>
          ))}
          <path d="M240 1150 Q300 1140 360 1150 Q420 1160 490 1148" stroke="#F2F6FC" strokeWidth="8" fill="none" />
          {/* lanterna che si accende accanto alla scatola */}
          <Glow id="na-lamp" x={540} y={1200} r={260} t={t} color={GIALLO} amp={0.06} rate={5} opacity={0.75 * lamp} />
          <g transform="translate(540 1246)">
            <path d="M-22 0 H22 L18 -60 H-18 Z" fill="#2A2E36" stroke={K} strokeWidth="5" />
            <rect x="-14" y="-54" width="28" height="46" fill={lamp > 0.1 ? '#FFE8A0' : '#3A3E46'} stroke={K} strokeWidth="3" />
            <path d="M-18 -60 Q0 -86 18 -60" stroke={K} strokeWidth="5" fill="none" />
            <path d="M-6 -20 Q0 -36 6 -20 Q0 -14 -6 -20 Z" fill={GIALLO} opacity={lamp} />
          </g>
        </g>

        {/* PIANO 5 — cespugli innevati e slittino rosso in primo piano (1,25) */}
        <g transform={L(1.25)}>
          {[[-60, 1720, 260], [880, 1760, 300], [380, 1900, 220]].map(([x, y, w], i) => (
            <g key={i}>
              <path d={`M${x - w / 2} ${y} Q${x - w / 3} ${y - w * 0.5} ${x} ${y - w * 0.45} Q${x + w / 3} ${y - w * 0.55} ${x + w / 2} ${y} Z`} fill="#1A2A34" stroke={K} strokeWidth="8" />
              <path d={`M${x - w / 2 + 10} ${y - 20} Q${x - w / 3} ${y - w * 0.52} ${x} ${y - w * 0.47} Q${x + w / 3} ${y - w * 0.57} ${x + w / 2 - 10} ${y - 20}`} stroke="#E8EEF8" strokeWidth="18" fill="none" strokeLinecap="round" />
            </g>
          ))}
          <g transform="translate(620 1640) rotate(-6)">
            <rect x="-150" y="-40" width="300" height="40" rx="10" fill="#B8352F" stroke={K} strokeWidth="8" />
            {[-100, -40, 20, 80].map((x) => <path key={x} d={`M${x} -40 V0`} stroke="#7A1C18" strokeWidth="5" />)}
            <path d="M-170 20 H150 Q190 20 190 -20" stroke="#8A929A" strokeWidth="10" fill="none" strokeLinecap="round" />
            <path d="M-120 0 V20 M120 0 V20" stroke="#8A929A" strokeWidth="8" />
            <path d="M-150 -42 H150" stroke="#F2F6FC" strokeWidth="10" strokeLinecap="round" />
          </g>
        </g>

        {/* neve che cade su due livelli */}
        <g transform={L(0.6)}>
          <Neve t={t} flakes={SNOW} color="#E8EEF8" y0={660} />
        </g>
        <g transform={L(1.5)}>
          <Neve t={t} flakes={SNOW_NEAR} color="#F2F6FC" y0={660} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="na-near" t={t} color="#C8D4E8" n={6} r0={90} r1={170} opacity={0.08} y0={760} />
        </g>
      </g>
      <Finish id="na" tint={VELATURA} tintOpacity={0.1} />
    </svg>
  );
};
