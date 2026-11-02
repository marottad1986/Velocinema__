import React from 'react';
import { camera, eo, lerp, rng, seg } from '../../lib/anim';
import { Beam, Dust, Glow, NearMotes, flashAt } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { HAND } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { K, Ombra, StDefs, VELATURA } from './Comuni';

// Undici contro il mostro: un'aula di scienze devastata, di notte. Eventi: prima frase i fasci delle torce degli uomini
// del laboratorio entrano dalla porta e frugano l'aula, poi le torce cadono a terra e restano accese (Undici li ha
// fermati, mai disegnata); seconda frase la luce del corridoio si spegne, sulla soglia cola una bava scura e i banchi
// tremano (arriva il mostro, solo come traccia); terza frase dalla lavagna partono crepe a raggiera (lo inchioda al
// muro), poi un lampo e una nuvola di cenere che sale e ricade lenta: sulla lavagna resta solo una bruciatura informe.
// Piani: parete con la lavagna, la finestra, la porta (0,3) · pavimento (0,45) · banchi rovesciati e cattedra (0,68)
//        · banco vicino, fogli, beuta rotta, torcia a terra (1,15) · cenere (1,0–1,5) · velo (1,8)

const r = rng(1010);
const ASH = Array.from({ length: 60 }, () => ({ a: r() * Math.PI * 2, v: 120 + r() * 380, s: 4 + r() * 9, fall: 40 + r() * 80, ph: r() * 6 }));
const CRACKS = Array.from({ length: 9 }, (_, i) => {
  const a = (i / 9) * Math.PI * 2 + 0.2;
  let d = 'M540 830', x = 540, y = 830;
  for (let k = 0; k < 4; k++) { x += Math.cos(a + (r() - 0.5) * 0.8) * 50; y += Math.sin(a + (r() - 0.5) * 0.8) * 34; d += ` L${x.toFixed(0)} ${y.toFixed(0)}`; }
  return d;
});
const DESKS = [
  { x: 180, y: 1130, a: 0, up: true }, { x: 420, y: 1150, a: -14, up: false }, { x: 700, y: 1130, a: 8, up: true }, { x: 900, y: 1170, a: 80, up: false },
];

const Banco: React.FC<{ x: number; y: number; a: number; up: boolean; s?: number }> = ({ x, y, a, up, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
    <Ombra id="au" x={0} y={8} rx={110} ry={12} />
    {up ? (
      <g>
        <path d="M-90 -76 H90 L100 -60 H-100 Z" fill="#9A7A52" stroke={K} strokeWidth="6" strokeLinejoin="round" />
        <path d="M-96 -64 H96" stroke="#D8B888" strokeWidth="3" opacity=".6" />
        <rect x="-100" y="-60" width="200" height="12" fill="#6A4E30" stroke={K} strokeWidth="5" />
        <path d="M-84 -48 V0 M84 -48 V0" stroke="#5A6068" strokeWidth="9" />
        <path d="M-84 -20 H84" stroke="#5A6068" strokeWidth="5" />
      </g>
    ) : (
      <g>
        <path d="M-100 -24 H100 V-6 H-100 Z" fill="#6A4E30" stroke={K} strokeWidth="6" />
        <path d="M-84 -24 L-70 -110 M84 -24 L70 -110 M-80 -70 H80" stroke="#5A6068" strokeWidth="8" />
        <circle cx="-70" cy="-112" r="7" fill="#2A2E36" /><circle cx="70" cy="-112" r="7" fill="#2A2E36" />
      </g>
    )}
  </g>
);

export const Aula: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;

  const tDrop = griglia(cues[0] + 2.8);
  const beams = seg(t, cues[0] + 0.3, cues[0] + 0.8) * (1 - seg(t, tDrop - 0.1, tDrop));
  const floorTorch = seg(t, tDrop, tDrop + 0.1);
  const tMon = griglia(cues[1] + 0.4);
  const corridor = 1 - seg(t, tMon, tMon + 0.15);
  const ooze = eo(seg(t, tMon, tMon + 1.6));
  const shake = t > tMon && t < cues[2] ? Math.sin(t * 40) * 2.5 * (1 - seg(t, tMon + 0.8, cues[2])) : 0;
  const tPin = griglia(cues[2] + 0.2);
  const crack = eo(seg(t, tPin, tPin + 0.7));
  const tAsh = griglia(cues[2] + 1.8);
  const flash = flashAt(t, [tAsh], [1]);
  const ashT = t - tAsh;
  const scorch = seg(t, tAsh, tAsh + 0.4);
  const press = crack * (1 - scorch);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="au" />
        <StDefs id="au" />
        <Lin id="au-wall" stops={[[0, '#141A1E'], [0.4, '#2A3634'], [0.75, '#3A4644'], [1, '#26302E']]} />
        <Lin id="au-board" stops={[[0, '#2A4234'], [1, '#1A2E24']]} />
        <Lin id="au-floor" stops={[[0, '#4A4A42'], [0.4, '#2E2E28'], [1, '#0E0E0C']]} />
        <Lin id="au-win" stops={[[0, '#0A1424'], [1, '#1E2E48']]} />
        <radialGradient id="au-press" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#0A0A0E" stopOpacity=".9" /><stop offset="1" stopColor="#0A0A0E" stopOpacity="0" /></radialGradient>
        <radialGradient id="au-scorch" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#060606" /><stop offset=".6" stopColor="#1A1410" stopOpacity=".85" /><stop offset="1" stopColor="#2A2016" stopOpacity="0" /></radialGradient>
        <radialGradient id="au-ash"><stop offset="0" stopColor="#3A3632" /><stop offset="1" stopColor="#3A3632" stopOpacity="0" /></radialGradient>
      </defs>

      <g transform={`${cam.transform} translate(${shake} 0)`}>
        {/* PIANO 0 — parete con la lavagna, la finestra e la porta (0,3) */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="1300" fill="url(#au-wall)" />
          <path d="M-200 1000 H1280" stroke="#1A201E" strokeWidth="8" />
          {/* finestra a sinistra con la notte fuori */}
          <rect x="-120" y="680" width="210" height="260" fill="url(#au-win)" stroke={K} strokeWidth="9" />
          <path d="M-15 680 V940 M-120 810 H90" stroke={K} strokeWidth="6" />
          <path d="M-110 700 L-30 790" stroke="#6A8AB0" strokeWidth="4" opacity=".4" />
          {/* tavola periodica appesa */}
          <rect x="140" y="690" width="120" height="90" fill="#D8D0B8" stroke={K} strokeWidth="5" />
          {Array.from({ length: 24 }, (_, i) => <rect key={i} x={148 + (i % 8) * 13} y={700 + Math.floor(i / 8) * 22} width="10" height="18" fill={['#B8352F', '#2E5A8A', '#E8C860', '#4A7A4A'][i % 4]} opacity=".7" />)}
          {/* lavagna: cornice, formule, crepe, pressione, bruciatura */}
          <rect x="290" y="700" width="520" height="270" fill="url(#au-board)" stroke="#5A3E26" strokeWidth="14" />
          <rect x="290" y="700" width="520" height="270" fill="none" stroke={K} strokeWidth="4" />
          <text x="320" y="760" fontFamily={HAND} fontWeight="700" fontSize="40" fill="#E8E8E0" opacity=".75">E = mc²</text>
          <text x="560" y="780" fontFamily={HAND} fontWeight="700" fontSize="32" fill="#E8E8E0" opacity=".6">H₂O + NaCl</text>
          <path d="M330 900 q40 -40 80 0 t80 0 M620 880 l60 -30 l40 50" stroke="#E8E8E0" strokeWidth="4" fill="none" opacity=".5" />
          <rect x="300" y="966" width="500" height="14" fill="#3A2818" />
          <path d="M360 962 h30 v6 h-30 Z M700 962 h20 v6 h-20 Z" fill="#F2F2EC" />
          <ellipse cx="540" cy="830" rx={60 + 90 * press} ry={50 + 60 * press} fill="url(#au-press)" opacity={press} />
          {CRACKS.map((d, i) => <path key={i} d={d} stroke="#0A0A0A" strokeWidth="5" fill="none" strokeDasharray="400" strokeDashoffset={400 * (1 - crack)} strokeLinejoin="round" />)}
          {CRACKS.map((d, i) => <path key={`h${i}`} d={d} stroke="#6A8A74" strokeWidth="2" fill="none" transform="translate(2 -2)" strokeDasharray="400" strokeDashoffset={400 * (1 - crack)} opacity=".6" />)}
          <path d="M470 780 Q520 750 580 790 Q640 820 610 880 Q570 920 500 900 Q440 870 460 820 Q450 800 470 780 Z" fill="url(#au-scorch)" opacity={scorch} transform="translate(540 830) scale(1.6) translate(-540 -830)" />
          {/* porta sul corridoio: luce che si spegne, bava che cola dallo stipite */}
          <rect x="880" y="700" width="170" height="300" fill="#E8D8A8" opacity={0.2 + 0.8 * corridor} />
          <rect x="880" y="700" width="170" height="300" fill="#08090C" opacity={1 - corridor} />
          <path d="M880 1000 V700 H1050 V1000" fill="none" stroke="#3A2818" strokeWidth="16" />
          <path d="M1050 1000 L1200 960 V660 L1050 700" fill="#5A4430" stroke={K} strokeWidth="7" />
          <g opacity={ooze}>
            {[[900, 0], [930, 1], [1020, 2], [1046, 3]].map(([x, k]) => (
              <path key={k} d={`M${x} 700 q4 ${30 + k * 10} 0 ${(60 + k * 30) * ooze} q-6 10 0 18`} stroke="#1A2418" strokeWidth={10 - k} fill="none" strokeLinecap="round" />
            ))}
            <path d="M884 702 H1046" stroke="#2A3A26" strokeWidth="8" />
          </g>
        </g>

        {/* fasci delle torce dalla porta, che frugano l'aula */}
        <g transform={L(0.4)} opacity={beams}>
          <Beam id="au-b1" x={960} y={860} t={t} length={900} spread={220} color="#F2EED8" angle={160} sweep={14} sweepRate={1.6} opacity={0.45} />
          <Beam id="au-b2" x={980} y={900} t={t + 1} length={900} spread={200} color="#F2EED8" angle={175} sweep={12} sweepRate={1.3} opacity={0.4} />
        </g>

        {/* PIANO 1 — pavimento (0,45) */}
        <g transform={L(0.45)}>
          <path d="M-200 1000 H1280 V2200 H-200 Z" fill="url(#au-floor)" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M-200 ${1040 + i * i * 22} H1280`} stroke="#000" strokeWidth="3" opacity=".3" />)}
          {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${-100 + i * 140} 1000 L${-900 + i * 320} 2200`} stroke="#000" strokeWidth="3" opacity=".3" />)}
          {/* scia di bava sul pavimento dalla porta */}
          <path d={`M960 1010 Q${lerp(960, 700, ooze)} ${lerp(1010, 1080, ooze)} ${lerp(960, 560, ooze)} ${lerp(1010, 1060, ooze)}`} stroke="#1A2418" strokeWidth="18" fill="none" strokeLinecap="round" opacity={0.8 * ooze} />
        </g>

        {/* PIANO 2 — banchi rovesciati e cattedra (0,68) */}
        <g transform={L(0.68)}>
          {DESKS.map((d, i) => <Banco key={i} x={d.x} y={d.y + (i % 2 ? shake : -shake)} a={d.a} up={d.up} />)}
          {/* torcia caduta a terra, accesa */}
          <g opacity={0.3 + 0.7 * floorTorch}>
            <path d="M796 1236 L260 1150 L240 1290 Z" fill="#F2EED8" opacity={0.3 * floorTorch} />
            <g transform="translate(820 1240) rotate(188)">
              <rect x="-80" y="-18" width="84" height="36" rx="7" fill="#2A2E36" stroke={K} strokeWidth="6" />
              <path d="M4 -24 L30 -30 V30 L4 24 Z" fill="#5A606A" stroke={K} strokeWidth="5" />
              <ellipse cx="30" cy="0" rx="7" ry="28" fill="#FFF6D8" />
            </g>
            <Glow id="au-tg" x={796} y={1236} r={90} t={t} color="#FFF0C0" amp={0.05} rate={5} opacity={0.8 * floorTorch} />
          </g>
          {/* cattedra con le provette */}
          <rect x="560" y="1020" width="300" height="20" fill="#7A5A3A" stroke={K} strokeWidth="6" />
          <rect x="580" y="1040" width="260" height="70" fill="#5A4028" stroke={K} strokeWidth="6" />
          {[600, 630, 660].map((x, i) => (
            <g key={x}>
              <rect x={x} y="990" width="16" height="30" rx="6" fill="#B8E0D8" fillOpacity=".5" stroke={K} strokeWidth="3" />
              <rect x={x + 2} y={1004 + i * 3} width="12" height={14 - i * 3} fill={['#7FD18A', '#E8505B', '#5FB8E8'][i]} />
            </g>
          ))}
          <path d="M740 1020 l20 -40 h20 l20 40 Z" fill="#B8E0D8" fillOpacity=".4" stroke={K} strokeWidth="4" />
        </g>

        {/* PIANO 3 — banco vicino, fogli, beuta rotta, torce cadute che restano accese (1,15) */}
        <g transform={L(1.15)}>
          <Banco x={180} y={1560} a={-70} up={false} s={1.6} />
          {[[420, 1520, 10], [560, 1580, -20], [760, 1500, 30], [300, 1680, -8]].map(([x, y, a], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
              <rect x="-50" y="-34" width="100" height="68" fill="#E8E4D8" stroke={K} strokeWidth="4" />
              {[0, 1, 2, 3].map((k) => <path key={k} d={`M-38 ${-20 + k * 12} h70`} stroke="#8A8A9A" strokeWidth="2" />)}
            </g>
          ))}
          <path d="M860 1600 l30 -60 h40 l30 60 Z" fill="#B8E0D8" fillOpacity=".4" stroke={K} strokeWidth="5" />
          <path d="M880 1600 l-30 30 M940 1600 l40 20" stroke="#B8E0D8" strokeWidth="4" />
        </g>

        {/* cenere: esplode dal punto della lavagna e ricade lenta */}
        <Glow id="au-flash" x={540} y={830} r={700} t={t} color="#F4F0FF" amp={0} opacity={0.9 * flash} />
        <g transform={L(1.0)}>
          {ashT > 0 && ASH.map((p, i) => {
            const k = 1 - Math.exp(-ashT * 2.5);
            const x = 540 + Math.cos(p.a) * p.v * k + Math.sin(t * 1.3 + p.ph) * 10;
            const y = 830 + Math.sin(p.a) * p.v * 0.7 * k + ashT * p.fall;
            return <circle key={i} cx={x} cy={Math.max(660, y)} r={p.s} fill={i % 3 ? '#2A2622' : '#5A524A'} opacity={Math.max(0, 1 - ashT / 3.5) * (y < 660 ? 0 : 1)} />;
          })}
          {ashT > 0 && <circle cx="540" cy="830" r={160 + ashT * 80} fill="url(#au-ash)" opacity={0.7 * Math.max(0, 1 - ashT / 2)} />}
        </g>
        <g transform={L(1.4)}>
          <Dust t={t} top={{ y: 700, x0: 880, x1: 1050 }} bottom={{ y: 1300, x0: 300, x1: 1000 }} seed={21} n={14} color="#D8D8C8" boost={0.6 + beams} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="au-near" t={t} color="#A8B0A8" n={6} r0={80} r1={160} opacity={0.08} y0={760} />
        </g>
      </g>
      <Finish id="au" tint={VELATURA} tintOpacity={0.12} />
    </svg>
  );
};
