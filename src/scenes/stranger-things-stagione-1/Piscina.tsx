import React from 'react';
import { camera, eo, lerp, rng, seg } from '../../lib/anim';
import { Flyers, Fog, Glow, NearMotes, Smoke, Stars, StringLights, flashAt } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Abete, K, Ombra, StDefs, VELATURA } from './Comuni';

// Barb sparisce in piscina: il giardino di una villetta dopo la festa, con la piscina illuminata da sotto.
// Eventi: prima frase la festa è ancora accesa dentro casa (finestre calde, lucine sul portico, mangianastri);
// seconda frase la luce della piscina sfarfalla e si spegne, l'acqua si increspa da sola in cerchi, gli occhiali tondi
// di Barb restano sul bordo; terza frase sulla sdraio la macchina fotografica di Jonathan scatta un solo lampo
// (lui e Nancy cominciano a cercare): per un attimo si vede tutto il giardino.
// Piani: cielo e abeti (0,22) · casa con le finestre accese e la staccionata (0,4) · piscina, trampolino, scaletta
//        (0,66) · bordo vicino con gli occhiali, sdraio, bicchieri (1,1) · foglie (1,5) · vapore vicino (1,8)

const r = rng(606);
const TREES = Array.from({ length: 12 }, (_, i) => ({ x: -160 + i * 120 + r() * 40, h: 300 + r() * 200, w: 140 + r() * 60 }));
const CUPS = [[150, 1290, -10], [210, 1310, 70], [900, 1300, 0], [960, 1320, -80]];

export const Piscina: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;

  const tOut = griglia(cues[1] + 1.4);
  const pf = (c: number) => Math.max(0, 1 - Math.abs(t - c) / 0.1);
  const pool = t < tOut ? 1 - 0.6 * pf(tOut - 0.5) : Math.max(0.08, 1 - seg(t, tOut, tOut + 0.1));
  const ripple = seg(t, tOut + 0.2, dur);
  const tFlash = griglia(cues[2] + 1.0);
  const flash = flashAt(t, [tFlash], [1]);

  const water = (a: string, b: string) => `rgb(${[0, 2, 4].map((k) => Math.round(lerp(parseInt(b.slice(1 + k, 3 + k), 16), parseInt(a.slice(1 + k, 3 + k), 16), pool))).join(',')})`;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pi" />
        <StDefs id="pi" />
        <Lin id="pi-sky" stops={[[0, '#05070E'], [0.3, '#0C1424'], [0.55, '#18243A'], [0.65, '#22304A']]} />
        <linearGradient id="pi-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={water('#1E7A8A', '#0A1420')} />
          <stop offset=".6" stopColor={water('#3EC0C8', '#0E1C2C')} />
          <stop offset="1" stopColor={water('#7AE0E0', '#122434')} />
        </linearGradient>
        <Lin id="pi-tile" stops={[[0, '#C8C4B4'], [1, '#8A8678']]} />
        <Lin id="pi-lawn" stops={[[0, '#1A2620'], [1, '#080C0A']]} />
        <Lin id="pi-wall" x2={1} y2={0} stops={[[0, '#5A5048'], [0.6, '#463E38'], [1, '#2E2824']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo e abeti (0,22) */}
        <g transform={L(0.22)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#pi-sky)" />
          <Stars t={t} seed={66} n={70} x={-100} y={60} w={1280} h={560} color="#DDE6F5" size={0.7} />
          {TREES.map((f, i) => <Abete key={i} x={f.x} y={900} h={f.h} w={f.w} color="#18243A" seed={i + 60} />)}
        </g>

        {/* PIANO 1 — casa della festa con le finestre accese, portico con le lucine, staccionata (0,4) */}
        <g transform={L(0.4)}>
          <path d="M560 760 L760 680 L1040 760 V940 H560 Z" fill="url(#pi-wall)" stroke={K} strokeWidth="7" />
          <path d="M540 768 L760 676 L1060 768" fill="none" stroke="#1A1C22" strokeWidth="22" strokeLinejoin="round" />
          {[[600, 790], [700, 790], [880, 790], [960, 790]].map(([wx, wy], i) => (
            <g key={i}>
              <rect x={wx} y={wy} width="56" height="56" fill="#FFC870" stroke={K} strokeWidth="5" />
              <path d={`M${wx + 28} ${wy} V${wy + 56}`} stroke={K} strokeWidth="3" />
            </g>
          ))}
          <Glow id="pi-house" x={800} y={820} r={300} t={t} color="#FFC870" amp={0.05} rate={2.6} opacity={0.4} />
          {/* porta a vetri sul retro con la luce della festa */}
          <rect x="760" y="860" width="100" height="80" fill="#FFD890" stroke={K} strokeWidth="5" />
          <path d="M810 860 V940" stroke={K} strokeWidth="4" />
          <StringLights id="pi-sl" t={t} from={{ x: 560, y: 852 }} to={{ x: 1040, y: 852 }} n={12} sag={18} r={6} wire="#141018" />
          {/* staccionata di legno */}
          <rect x="-200" y="890" width="1480" height="70" fill="#3A3026" />
          {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${-200 + i * 52} 890 V960`} stroke="#1A140E" strokeWidth="4" />)}
          <path d="M-200 892 H1280" stroke="#7A6A56" strokeWidth="3" opacity=".5" />
          <rect x="-200" y="958" width="1480" height="40" fill="#141C18" />
        </g>

        {/* PIANO 2 — la piscina vista dal bordo, con il trampolino e la scaletta (0,66) */}
        <g transform={L(0.66)}>
          <path d="M-200 960 H1280 V1400 H-200 Z" fill="url(#pi-lawn)" />
          {/* bordo di piastrelle */}
          <path d="M180 970 H900 L1060 1250 H20 Z" fill="url(#pi-tile)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          {/* acqua */}
          <path d="M214 990 H866 L1004 1230 H76 Z" fill="url(#pi-water)" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          {/* riflessi dell'acqua illuminata (caustiche) */}
          {Array.from({ length: 7 }, (_, i) => {
            const y = 1010 + i * 32, half = lerp(326, 464, (y - 990) / 240);
            const d = Array.from({ length: 9 }, (_, k) => {
              const x = 540 - half + (k + 0.5) * (half * 2) / 9 + Math.sin(t * 1.6 + k + i) * 10;
              return `M${x - 22} ${y + Math.sin(t * 2 + k * 1.3 + i) * 4} q11 -8 22 0 q11 8 22 0`;
            }).join(' ');
            return <path key={i} d={d} stroke="#D8FFFA" strokeWidth="3.5" fill="none" opacity={0.5 * pool} />;
          })}
          {/* faro subacqueo sulla parete vicina */}
          <Glow id="pi-uw" x={540} y={1180} r={360} t={t} color="#9AF0F0" amp={0.03} rate={3} opacity={0.75 * pool} />
          <ellipse cx="540" cy="1214" rx="26" ry="10" fill={pool > 0.2 ? '#F2FFFF' : '#3A4A58'} stroke={K} strokeWidth="4" />
          {/* cerchi che si allargano da soli sull'acqua spenta */}
          {[0, 1, 2].map((k) => {
            const p = ((t - tOut) * 0.45 + k / 3) % 1;
            return t > tOut + 0.2 && <ellipse key={k} cx={560} cy={1090} rx={20 + p * 300} ry={(20 + p * 300) * 0.22} fill="none" stroke="#8AB8D8" strokeWidth={4 - p * 3} opacity={(1 - p) * 0.8 * eo(ripple * 3 > 1 ? 1 : ripple * 3)} />;
          })}
          {/* foglie sull'acqua */}
          {[[300, 1040], [740, 1110], [420, 1170]].map(([x, y], i) => <ellipse key={i} cx={x + Math.sin(t * 0.6 + i) * 8} cy={y} rx="14" ry="6" fill="#7A4A22" stroke={K} strokeWidth="3" />)}
          {/* trampolino a sinistra */}
          <path d="M120 1000 L360 1020 L356 1036 L116 1016 Z" fill="#E8E2D2" stroke={K} strokeWidth="6" />
          <rect x="110" y="1012" width="40" height="70" fill="#5A6068" stroke={K} strokeWidth="5" />
          {/* scaletta cromata a destra */}
          {[800, 850].map((x) => <path key={x} d={`M${x} 1060 V990 Q${x} 960 ${x + 26} 960`} stroke="#C8D0D8" strokeWidth="9" fill="none" />)}
          {[800, 850].map((x) => <path key={x} d={`M${x} 1060 V990 Q${x} 960 ${x + 26} 960`} stroke={K} strokeWidth="2" fill="none" />)}
          {/* sdraio rovesciata sul prato */}
          <path d="M920 1000 L1060 980 L1070 1000 L930 1020 Z" fill="#E8C860" stroke={K} strokeWidth="5" />
          <path d="M940 1020 L960 1060 M1050 1004 L1066 1050" stroke="#8A929A" strokeWidth="6" />
          <Fog id="pi-steam" t={t} y={1000} rx={500} ry={40} color="#B8E8F0" opacity={0.25 * pool + 0.1} speed={0.3} drift={60} />
        </g>

        {/* PIANO 3 — bordo vicino: occhiali di Barb, bicchieri, sdraio con la macchina fotografica (1,1) */}
        <g transform={L(1.1)}>
          <path d="M-200 1250 H1280 V2200 H-200 Z" fill="#1A2420" />
          <path d="M-200 1250 H1280 V1300 H-200 Z" fill="url(#pi-tile)" stroke={K} strokeWidth="8" />
          {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${-200 + i * 96} 1252 V1300`} stroke="#5A564C" strokeWidth="3" />)}
          {/* occhiali tondi posati sul bordo */}
          <Ombra id="pi" x={540} y={1262} rx={80} ry={8} />
          <g transform="translate(540 1240)">
            <circle cx="-34" cy="0" r="26" fill="#A8D8E8" fillOpacity=".25" stroke="#8A3A2A" strokeWidth="7" />
            <circle cx="34" cy="0" r="26" fill="#A8D8E8" fillOpacity=".25" stroke="#8A3A2A" strokeWidth="7" />
            <path d="M-8 -2 Q0 -10 8 -2 M-60 -6 l-30 10 M60 -6 l30 10" stroke="#8A3A2A" strokeWidth="6" fill="none" />
            <path d="M-46 -12 q8 -6 16 -2 M22 -12 q8 -6 16 -2" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity=".8" />
          </g>
          {/* bicchieri di plastica e lattine */}
          {CUPS.map(([x, y, a], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
              <path d="M-18 -40 H18 L13 0 H-13 Z" fill={i % 2 ? '#B8352F' : '#C8D0D8'} stroke={K} strokeWidth="5" />
              <path d="M-16 -32 H16" stroke="#F2E3C6" strokeWidth="3" opacity=".6" />
            </g>
          ))}
          {/* sdraio in primo piano a destra con la macchina fotografica di Jonathan */}
          <path d="M760 1520 L1120 1440 L1140 1490 L790 1580 Z" fill="#5A7A8A" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${800 + i * 56} ${1520 - i * 13} l14 48`} stroke="#3A5A6A" strokeWidth="5" />)}
          <path d="M800 1580 V1700 M1100 1500 V1640" stroke="#8A929A" strokeWidth="10" />
          <Ombra id="pi" x={850} y={1256} rx={90} ry={9} />
          <g transform="translate(850 1226) scale(0.78) rotate(-6)">
            <rect x="-70" y="-50" width="140" height="84" rx="10" fill="#1E2026" stroke={K} strokeWidth="7" />
            <rect x="-70" y="-50" width="140" height="22" rx="6" fill="#B8B8B0" stroke={K} strokeWidth="5" />
            <circle cx="0" cy="0" r="30" fill="#2A2E36" stroke={K} strokeWidth="6" />
            <circle cx="0" cy="0" r="17" fill="#3A5A7A" stroke={K} strokeWidth="4" />
            <circle cx="-6" cy="-6" r="5" fill="#FFFFFF" opacity=".7" />
            <rect x="34" y="-72" width="34" height="24" rx="3" fill="#E8E8E0" stroke={K} strokeWidth="4" />
            <path d="M-70 -10 Q-110 30 -70 40" stroke="#3A3026" strokeWidth="6" fill="none" />
          </g>
          <Glow id="pi-camflash" x={872} y={1176} r={260} t={t} color="#FFFFFF" amp={0} opacity={0.95 * flash} />
          {/* bordo sinistro: tavolino con il mangianastri */}
          <path d="M-60 1480 H260 L250 1510 H-50 Z" fill="#E8E2D2" stroke={K} strokeWidth="8" />
          <path d="M-30 1510 V1680 M230 1510 V1680" stroke="#8A929A" strokeWidth="10" />
          <rect x="0" y="1400" width="200" height="80" rx="10" fill="#2A2C32" stroke={K} strokeWidth="7" />
          <circle cx="44" cy="1440" r="26" fill="#14161A" stroke="#5A5E66" strokeWidth="4" />
          <circle cx="156" cy="1440" r="26" fill="#14161A" stroke="#5A5E66" strokeWidth="4" />
          <rect x="80" y="1424" width="40" height="22" fill="#5A6070" stroke={K} strokeWidth="3" />
          <path d="M60 1400 Q100 1350 140 1400" stroke="#8A929A" strokeWidth="6" fill="none" />
        </g>

        {/* lampo bianco su tutto il giardino (un solo lampo) */}
        <rect x="-200" y="-200" width="1480" height="2400" fill="#F4F8FF" opacity={0.35 * flash} />

        <g transform={L(1.5)}>
          <Flyers t={t} seed={41} n={5} color="#8A5A2A" outline={K} w={28} h={36} y0={760} y1={1800} speed={0.08} shape="leaf" />
        </g>
        <g transform={L(1.8)}>
          <Smoke id="pi-vap" t={t} x={540} y={1150} color="#B8E8F0" n={6} rise={260} wind={-120} r0={60} r1={170} speed={0.12} opacity={0.18 * pool + 0.06} />
          <NearMotes id="pi-near" t={t} color="#9AC8D8" n={6} r0={90} r1={180} opacity={0.08} y0={760} />
        </g>
      </g>
      <Finish id="pi" tint={VELATURA} tintOpacity={0.12} />
    </svg>
  );
};
