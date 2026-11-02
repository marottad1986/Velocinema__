import React from 'react';
import { camera, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Glow, Gulls, NearMotes, Smoke } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { BBDefs, Beuta, Cactus, Camper, Cespuglio, Cristalli, K, Ombra, ORO } from './Comuni';

// Un laboratorio nel deserto: il deserto del New Mexico a mezzogiorno. Eventi: prima frase il vecchio camper (comprato
// con i risparmi di Walter) arriva da destra sollevando polvere e si ferma; seconda frase la porta si apre, dentro si
// vede la vetreria e dallo sfiato del tetto comincia a uscire il fumo del laboratorio; terza frase sul tavolino
// pieghevole il vassoio di cristalli si accende al sole: la droga più pura della città.
// Piani: cielo e sole (0,22) · mesa rosse (0,35) · cactus lontani e piana (0,5) · camper (0,68)
//        · tavolino col vassoio, sedia, secchio (0,9) · rocce, cactus e cespuglio rotolante in primo piano (1,25) · polvere (1,5–1,8)

const r = rng(4404);
const FARC = Array.from({ length: 9 }, (_, i) => ({ x: -120 + i * 160 + r() * 60, y: 1150 + r() * 30, s: 0.18 + r() * 0.1 }));
const PEBBLES = Array.from({ length: 50 }, () => ({ x: -200 + r() * 1480, y: 1240 + r() * 700, r: 3 + r() * 7 }));

export const Deserto: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tStop = griglia(cues[0] + 1.6);
  const drive = eo(seg(t, 0.2, tStop));
  const rvX = lerp(1500, 470, drive);
  const dust = seg(t, 0.2, tStop) * (1 - seg(t, tStop, tStop + 1.5));
  const door = eo(seg(t, griglia(cues[1] + 0.1), griglia(cues[1] + 0.1) + 0.6));
  const smoke = eo(seg(t, griglia(cues[1] + 0.6), griglia(cues[1] + 0.6) + 1.2));
  const shine = eo(seg(t, griglia(cues[2] + 0.2), griglia(cues[2] + 0.2) + 0.6));
  const bob = drive < 1 ? Math.sin(t * 18) * 3 : 0;
  const weed = mod(t * 0.09 + 0.3, 1);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ds" />
        <BBDefs id="ds" />
        <Lin id="ds-sky" stops={[[0, '#2A78C8'], [0.3, '#5AA2DE'], [0.55, '#A8D2EE'], [0.62, '#F2E8D0']]} />
        <Lin id="ds-mesa" x2={1} y2={0} stops={[[0, '#D8885A'], [0.5, '#B8643E'], [1, '#8A4428']]} />
        <Lin id="ds-mesa2" x2={1} y2={0} stops={[[0, '#C89878'], [1, '#9A6A52']]} />
        <Lin id="ds-sand" stops={[[0, '#E8C890'], [0.4, '#D8B078'], [1, '#A87E50']]} />
        <Lin id="ds-table" stops={[[0, '#C8CED2'], [1, '#8A9094']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo azzurro intenso e sole a picco (0,22) */}
        <g transform={L(0.22)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ds-sky)" />
          <Glow id="ds-sun" x={880} y={700} r={380} t={t} color="#FFF6D8" amp={0.03} rate={1} opacity={0.7} />
          <circle cx="880" cy="700" r="60" fill="#FFFBEA" />
          {[0, 1, 2].map((k) => (
            <ellipse key={k} cx={mod(160 + k * 420 + t * 8, 1500) - 200} cy={740 + k * 50} rx={160 - k * 30} ry="18" fill="#FFFFFF" opacity=".55" />
          ))}
          <Gulls t={t} seed={8} n={2} y={760} h={80} color="#2A2420" size={0.9} period={16} />
        </g>

        {/* PIANO 1 — mesa rosse all'orizzonte (0,35) */}
        <g transform={L(0.35)}>
          <path d="M-200 1080 L-120 1000 H120 L160 960 H360 L400 1080 Z" fill="url(#ds-mesa2)" opacity=".8" />
          <path d="M520 1080 L580 900 H820 L860 880 H1000 L1060 1000 H1180 L1240 1080 Z" fill="url(#ds-mesa)" stroke={K} strokeWidth="5" />
          {[930, 960, 990].map((y) => <path key={y} d={`M${590 - (y - 900) * 0.3} ${y} H${1010 + (y - 900) * 0.4}`} stroke="#8A4428" strokeWidth="5" opacity=".6" />)}
          <path d="M582 904 H820" stroke="#F2C8A0" strokeWidth="4" opacity=".7" />
          <path d="M-200 1080 H1280 V1120 H-200 Z" fill="#D8B888" />
        </g>

        {/* PIANO 2 — piana con cactus lontani e tremolio del caldo (0,5) */}
        <g transform={L(0.5)}>
          <rect x="-200" y="1100" width="1480" height="140" fill="#DDBE88" />
          {FARC.map((c, i) => <Cactus key={i} id="ds" x={c.x} y={c.y} s={c.s} flip={i % 2 === 1} />)}
          {[1120, 1150, 1180].map((y, k) => (
            <path key={y} d={`M-200 ${y} q60 ${-4 - 2 * Math.sin(t * 3 + k)} 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0`} stroke="#FFF2D8" strokeWidth="3" fill="none" opacity=".35" />
          ))}
        </g>

        {/* PIANO 3 — il camper che arriva e diventa laboratorio (0,68) */}
        <g transform={L(0.68)}>
          <path d="M-200 1220 H1280 V2200 H-200 Z" fill="url(#ds-sand)" />
          {/* solchi delle ruote */}
          <path d={`M${rvX + 360} 1236 L1400 1236 M${rvX + 300} 1250 L1400 1258`} stroke="#B8905A" strokeWidth="8" opacity=".7" />
          <Smoke id="ds-dust" t={t} x={rvX + 380} y={1200} color="#E8D0A0" n={6} rise={110} wind={260} r0={40} r1={120} speed={0.6} opacity={0.7 * dust} />
          <g transform={`translate(0 ${bob})`}>
            <g opacity={smoke}>
              <Smoke id="ds-sm" t={t} x={rvX - 140} y={1220 - 520 * 0.82} color="#F4F2EC" n={7} rise={150} wind={-110} r0={26} r1={80} speed={0.4} opacity={0.85} />
            </g>
            <Camper id="ds" x={rvX} y={1236} s={0.82} door={door} t={t} />
            {/* dentro la porta: vetreria e luce */}
            {door > 0.1 && (
              <g opacity={door}>
                <Beuta id="ds" x={rvX + 32} y={1236 - 110} t={t} s={0.42} liquid="#7AC8D0" level={0.4} />
                <Glow id="ds-in" x={rvX + 40} y={1236 - 200} r={90} t={t} color="#FFE0A0" amp={0.08} rate={5} opacity={0.5} />
              </g>
            )}
          </g>
        </g>

        {/* PIANO 4 — tavolino pieghevole con il vassoio di cristalli, sedia da campeggio, secchio (0,9) */}
        <g transform={L(0.9)}>
          <g opacity={seg(t, tStop - 0.6, tStop + 0.2)}>
            <Ombra id="ds" x={870} y={1262} rx={170} ry={20} />
            <path d="M760 1260 L840 1180 M980 1260 L900 1180 M760 1180 L980 1260 M980 1180 L760 1260" stroke="#5A6064" strokeWidth="9" />
            <rect x="740" y="1166" width="260" height="22" rx="4" fill="url(#ds-table)" stroke={K} strokeWidth="6" />
            {/* vassoio */}
            <rect x="780" y="1146" width="180" height="22" rx="4" fill="url(#ds-metal)" stroke={K} strokeWidth="5" />
            <Glow id="ds-tray" x={870} y={1120} r={220} t={t} color={ORO} amp={0.1} rate={4} opacity={0.6 * shine} />
            <Cristalli id="ds" x={870} y={1150} t={t} s={1.2} n={18} seed={7} glint={0.2 + 0.8 * shine} />
          </g>
          {/* secchio di plastica e tanica */}
          <g transform="translate(150 1270)">
            <Ombra id="ds" x={20} y={0} rx={110} ry={14} />
            <path d="M-50 0 L-60 -110 H60 L50 0 Z" fill="#E8E2D2" stroke={K} strokeWidth="7" />
            <path d="M-60 -110 Q0 -170 60 -110" stroke={K} strokeWidth="5" fill="none" />
            <rect x="70" y="-130" width="90" height="130" rx="10" fill="#3A6AC8" stroke={K} strokeWidth="7" />
            <rect x="110" y="-150" width="30" height="24" fill="#2A4A8A" stroke={K} strokeWidth="4" />
          </g>
        </g>

        {/* PIANO 5 — rocce, cactus grande e cespuglio rotolante in primo piano (1,25) */}
        <g transform={L(1.25)}>
          <Cactus id="ds" x={70} y={1900} s={1.15} />
          <path d="M760 1960 Q780 1800 900 1760 Q1040 1720 1160 1780 L1260 1960 Z" fill="#9A6A48" stroke={K} strokeWidth="10" />
          <path d="M800 1820 Q860 1770 960 1760" stroke="#D8A47A" strokeWidth="6" fill="none" opacity=".7" />
          <Cespuglio x={560} y={1900} s={1.3} seed={5} color="#8A8A4A" />
          {PEBBLES.slice(0, 20).map((p, i) => <ellipse key={i} cx={p.x} cy={p.y + 200} rx={p.r * 1.6} ry={p.r} fill="#8A6A48" opacity=".7" />)}
          {/* cespuglio secco che rotola */}
          <g transform={`translate(${lerp(1300, -220, weed)} ${1500 - Math.abs(Math.sin(weed * 30)) * 40}) rotate(${-weed * 1400})`}>
            {Array.from({ length: 10 }, (_, i) => (
              <ellipse key={i} cx="0" cy="0" rx="70" ry={20 + (i % 3) * 14} fill="none" stroke="#8A6A3A" strokeWidth="5" transform={`rotate(${i * 36})`} />
            ))}
            <circle cx="0" cy="0" r="70" fill="none" stroke={K} strokeWidth="4" opacity=".6" />
          </g>
        </g>

        {/* PIANO 6 — polvere nel vento (1,5–1,8) */}
        <g transform={L(1.5)}>
          {PEBBLES.slice(20).map((p, i) => {
            const x = mod(p.x - t * (60 + i * 3), 1480) - 200;
            return <circle key={i} cx={x} cy={900 + (p.y - 1240) * 0.9} r={p.r * 0.5} fill="#F2DCB0" opacity=".55" />;
          })}
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="ds-near" t={t} color="#FFF0D0" n={6} r0={60} r1={150} opacity={0.12} vx={-40} />
        </g>
      </g>
      <Finish id="ds" tint="#D8A040" tintOpacity={0.1} />
    </svg>
  );
};
