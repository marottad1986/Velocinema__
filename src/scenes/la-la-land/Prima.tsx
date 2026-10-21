import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Dust, Glow, NearMotes, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';

// La prima: piccolo teatro con sipario rosso, sgabello vuoto sotto il faro, poltrone vuote.
// Piani: parete e mantovana (0,25) · fondale e palco (0,45) · quinte, sgabello, faro (0,6)
//        · prime file di poltrone (0,85–1,0) · poltrone in primo piano e drappi ai bordi (1,25) · pulviscolo (1,7)
// Eventi: cues[1] il faro si accende · cues[2] il posto riservato resta vuoto · cues[3] il faro cala e le quinte si chiudono.

const K = '#1B1530';
const FLOOR = 1040;
const r = rng(4417);
const BATTENS = Array.from({ length: 7 }, (_, i) => ({ x: 230 + i * 104, ph: r() * 6 }));

const curtainPath = (x0: number, x1: number, y0: number, y1: number, t: number, ph: number, folds = 4) => {
  // drappo con bordo inferiore ondulato e lati che ondeggiano
  const sway = Math.sin(t * 0.9 + ph) * 10;
  let d = `M${x0} ${y0} H${x1} L${x1 + sway} ${y1}`;
  const w = (x1 - x0) / folds;
  for (let i = folds; i > 0; i--) d += ` q${-w / 2} ${18 + Math.sin(t * 1.3 + i + ph) * 4} ${-w} 0`;
  return d + ` L${x0} ${y0} Z`;
};

const SeatRow: React.FC<{ y: number; w: number; sw: number; t: number; seed: number; skip?: number }> = ({ y, w, sw, t, seed, skip = -1 }) => {
  const h = w * 0.95;
  const step = w * 1.12;
  const n = Math.ceil(1400 / step);
  const off = (seed * 37) % step;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = -160 + off + i * step;
        const shimmer = 0.22 + 0.22 * Math.sin(t * 1.1 + x * 0.012 + seed);
        return (
          <g key={i}>
            <rect x={x - w / 2} y={y - h} width={w} height={h} rx={w * 0.28} fill="url(#pr-velvet)" stroke={K} strokeWidth={sw} />
            <path d={`M${x - w * 0.3} ${y - h + w * 0.2} Q${x} ${y - h + w * 0.06} ${x + w * 0.3} ${y - h + w * 0.2}`} fill="none" stroke="#C9B2F0" strokeWidth={sw * 0.7} strokeLinecap="round" opacity={shimmer} />
            <path d={`M${x - w * 0.36} ${y - h * 0.45} V${y - h * 0.12}`} stroke="#3A2A62" strokeWidth={sw * 0.6} strokeLinecap="round" opacity=".7" />
            {i !== skip && <rect x={x + w * 0.5} y={y - h * 0.5} width={step - w} height={h * 0.5} fill="#241C44" stroke={K} strokeWidth={sw * 0.6} />}
          </g>
        );
      })}
    </g>
  );
};

export const Prima: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c1 = cues[1] ?? 1.6, c2 = cues[2] ?? 4.3, c3 = cues[3] ?? 7.1;

  const on = eob(seg(t, c1, c1 + 0.5));
  const fade = eo(seg(t, c3, c3 + 1.8));
  const spot = Math.max(0.12, Math.min(1.1, on)) * (1 - 0.55 * fade);
  const flash = flashAt(t, [c1], [0.45]);
  const close = eo(seg(t, c3 + 0.2, c3 + 2.6));
  const reserved = seg(t, c2, c2 + 0.5) * (1 - 0.5 * fade);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pr" />
        <Lin id="pr-wall" stops={[[0, '#0E0B20'], [0.35, '#1C1838'], [0.7, '#2A2250'], [1, '#191431']]} />
        <Lin id="pr-valance" stops={[[0, '#3A0F20'], [0.6, '#5C1830'], [1, '#71203A']]} />
        <Lin id="pr-back" stops={[[0, '#151030'], [0.5, '#2C2456'], [1, '#3A2E66']]} />
        <Lin id="pr-floor" stops={[[0, '#5A3E2E'], [0.5, '#3E2A22'], [1, '#22170F']]} />
        <Lin id="pr-curtain" x2={1} y2={0} stops={[[0, '#5A1428'], [0.3, '#A8283A'], [0.55, '#7A1E36'], [0.8, '#B23446'], [1, '#5A1428']]} />
        <Lin id="pr-curtainV" stops={[[0, '#4A1222'], [0.5, '#8E2234'], [1, '#5A1428']]} />
        <Lin id="pr-velvet" stops={[[0, '#7E62B4'], [0.45, '#6B4FA0'], [1, '#3A2A62']]} />
        <Lin id="pr-frame" x2={1} y2={0} stops={[[0, '#4B3D5E'], [0.5, '#8C7A9E'], [1, '#3A2E4E']]} />
        <Lin id="pr-pool" stops={[[0, '#FFE7A0', 0.9], [1, '#F2C14E', 0.5]]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete della sala e mantovana (zona calma per il titolo) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#pr-wall)" />
          {[150, 930].map((x) => (
            <g key={x}>
              <Glow id={`pr-sconce${x}`} x={x} y={160} r={130} t={t} color="#E8A0B0" amp={0.03} rate={1.1} opacity={0.22 * (1 - 0.5 * on)} />
              <path d={`M${x - 16} 160 h32 l-8 30 h-16 z`} fill="#8C7A9E" stroke={K} strokeWidth="5" />
            </g>
          ))}
        </g>

        {/* PIANO 1 — fondale, americane con lampade, palco in legno */}
        <g transform={L(0.45)}>
          <rect x="60" y="520" width="960" height={FLOOR - 520} fill="url(#pr-back)" />
          <path d="M60 760 H1020 M60 900 H1020" stroke="#120E26" strokeWidth="4" opacity=".5" />
          {/* americana con piccoli proiettori spenti */}
          <path d="M120 600 H960" stroke={K} strokeWidth="8" />
          {BATTENS.map((b, i) => (
            <g key={i} transform={`translate(${b.x} 600) rotate(${Math.sin(t * 0.7 + b.ph) * 2})`}>
              <path d="M0 0 V14" stroke={K} strokeWidth="5" />
              <rect x="-14" y="14" width="28" height="30" rx="6" fill="#3A2E4E" stroke={K} strokeWidth="5" />
              <ellipse cx="0" cy="46" rx="9" ry="4" fill="#8C7A9E" opacity=".6" />
            </g>
          ))}
          {/* palco */}
          <rect x="-200" y={FLOOR} width="1480" height="70" fill="url(#pr-floor)" />
          <path d={`M-200 ${FLOOR} H1280`} stroke={K} strokeWidth="8" />
          <g stroke="#22170F" strokeWidth="3" opacity=".7">
            {Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${-100 + i * 100} ${FLOOR} L${-180 + i * 110} ${FLOOR + 70}`} />)}
          </g>
          <rect x="-200" y={FLOOR + 70} width="1480" height="40" fill="#1A1028" stroke={K} strokeWidth="7" />
          {/* luci di ribalta */}
          {Array.from({ length: 9 }, (_, i) => {
            const x = 140 + i * 100;
            const k = 0.5 + 0.5 * Math.sin(t * 2 + i * 1.3);
            return (
              <g key={i}>
                <Glow id={`pr-foot${i}`} x={x} y={FLOOR + 70} r={70} t={t} color="#FFD98A" amp={0} opacity={(0.25 + 0.2 * k) * (0.4 + 0.6 * spot)} />
                <path d={`M${x - 18} ${FLOOR + 74} a18 12 0 0 1 36 0 z`} fill="#FFE7A0" stroke={K} strokeWidth="4" opacity={0.6 + 0.4 * spot} />
              </g>
            );
          })}
        </g>

        {/* PIANO 2 — faro, sgabello, asta del microfono, quinte, boccascena, mantovana */}
        <g transform={L(0.6)}>
          {/* pozza di luce sul palco */}
          <ellipse cx="540" cy={FLOOR + 22} rx={lerp(150, 230, spot)} ry="34" fill="url(#pr-pool)" opacity={0.15 + 0.7 * spot} />
          <Beam id="pr-beam" x={540} y={470} t={t} length={FLOOR - 450} spread={lerp(300, 420, spot)} angle={90} sweep={0.6} color="#FFE7A0" opacity={0.08 + 0.6 * spot + flash * 0.3} />
          <Dust t={t} top={{ y: 580, x0: 500, x1: 580 }} bottom={{ y: FLOOR, x0: 360, x1: 720 }} n={28} color="#FFF3CF" boost={-0.3 + 0.3 * spot} />
          {/* sgabello vuoto */}
          <ellipse cx="540" cy={FLOOR + 14} rx="90" ry="12" fill="#000" opacity=".35" />
          <g stroke={K} strokeLinecap="round">
            <path d={`M505 930 L486 ${FLOOR + 10} M575 930 L594 ${FLOOR + 10} M540 934 V${FLOOR + 14}`} strokeWidth="11" />
            <path d={`M505 930 L486 ${FLOOR + 10} M575 930 L594 ${FLOOR + 10}`} stroke="#8A6A3E" strokeWidth="5" />
            <ellipse cx="540" cy="990" rx="46" ry="9" fill="none" strokeWidth="7" />
          </g>
          <ellipse cx="540" cy="926" rx="66" ry="18" fill="#F2C14E" stroke={K} strokeWidth="8" />
          <path d="M498 920 Q540 910 582 920" stroke="#FFF3CF" strokeWidth="4" fill="none" strokeLinecap="round" opacity={0.4 + 0.5 * spot} />
          {/* asta del microfono */}
          <g stroke={K} strokeLinecap="round">
            <ellipse cx="660" cy={FLOOR + 8} rx="34" ry="8" fill="#2A2238" strokeWidth="5" />
            <path d={`M660 ${FLOOR + 6} V860 L630 830`} strokeWidth="8" fill="none" />
            <rect x="606" y="806" width="30" height="40" rx="14" transform="rotate(-40 621 826)" fill="#3A2E4E" strokeWidth="5" />
            <path d={`M664 ${FLOOR} V870`} stroke="#B8A8C8" strokeWidth="2" opacity=".6" />
          </g>
          {/* quinte laterali (si chiudono alla fine) */}
          <g transform={`translate(${close * 150} 0)`}>
            <path d={curtainPath(40, 300, 520, FLOOR + 30, t, 0)} fill="url(#pr-curtain)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d="M110 540 Q118 800 104 1050 M180 540 Q172 800 190 1052 M245 540 Q252 800 240 1050" stroke="#3E0E1C" strokeWidth="5" fill="none" opacity=".7" />
          </g>
          <g transform={`translate(${-close * 150} 0)`}>
            <path d={curtainPath(780, 1040, 520, FLOOR + 30, t, 2)} fill="url(#pr-curtain)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d="M840 540 Q848 800 834 1050 M905 540 Q898 800 914 1052 M975 540 Q982 800 968 1050" stroke="#3E0E1C" strokeWidth="5" fill="none" opacity=".7" />
          </g>
          {/* boccascena */}
          <rect x="-200" y="260" width="250" height={FLOOR + 110 - 260} fill="url(#pr-frame)" stroke={K} strokeWidth="9" />
          <rect x="1030" y="260" width="250" height={FLOOR + 110 - 260} fill="url(#pr-frame)" stroke={K} strokeWidth="9" />
          <path d="M28 280 V1130 M1052 280 V1130" stroke="#C8B8D8" strokeWidth="3" opacity=".5" />
          {/* mantovana con festoni */}
          <path d={`M-200 250 H1280 V520 ${Array.from({ length: 8 }, () => 'q-92 46 -185 0').join(' ')} Z`} fill="url(#pr-valance)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M-200 510 Q-100 560 -15 515 M170 515 Q262 560 355 515 M540 515 Q632 560 725 515 M910 515 Q1002 560 1095 515" stroke="#B23446" strokeWidth="4" fill="none" opacity=".45" />
          <path d="M-200 268 H1280" stroke="#8E2234" strokeWidth="5" opacity=".6" />
          {/* nappe dorate spente ai lati */}
          {[60, 1020].map((x) => (
            <g key={x} transform={`rotate(${Math.sin(t * 1.1 + x) * 3} ${x} 520)`}>
              <path d={`M${x} 520 V570`} stroke={K} strokeWidth="5" />
              <path d={`M${x - 14} 570 h28 l6 40 h-40 z`} fill="#8C6A3E" stroke={K} strokeWidth="5" />
            </g>
          ))}
        </g>

        {/* lampo dell'accensione del faro */}
        <rect x="-200" y="-200" width="1480" height="2400" fill="#FFF3CF" opacity={flash * 0.12} />

        {/* PIANO 3 — file di poltrone vuote */}
        <g transform={L(0.85)}>
          <rect x="-200" y={FLOOR + 110} width="1480" height="900" fill="#120E24" />
          <SeatRow y={1190} w={96} sw={5} t={t} seed={1} />
          {/* biglietto «RISERVATO» sulla poltrona vuota in prima fila */}
          <g transform="translate(686 1110)">
            <Glow id="pr-res" x={0} y={0} r={120} t={t} color="#FFE7A0" amp={0.05} rate={2} opacity={reserved * 0.6} />
            <rect x="-40" y="-20" width="80" height="40" rx="5" fill="#F6F1E9" stroke={K} strokeWidth="5" transform={`rotate(${-4 + reserved * 2})`} />
            <path d="M-26 -6 H26 M-26 6 H14" stroke="#6B4FA0" strokeWidth="5" strokeLinecap="round" transform={`rotate(${-4 + reserved * 2})`} />
          </g>
        </g>
        <g transform={L(1.0)}>
          <SeatRow y={1340} w={128} sw={6} t={t} seed={2} />
        </g>

        {/* PIANO 4 — poltrone vicinissime e drappi ai bordi */}
        <g transform={L(1.25)}>
          <SeatRow y={1600} w={180} sw={8} t={t} seed={3} />
          <SeatRow y={1960} w={260} sw={10} t={t} seed={5} />
          {/* programma di sala dimenticato su una poltrona */}
          <g transform="translate(330 1760) rotate(-12)">
            <rect x="-60" y="-40" width="120" height="80" rx="4" fill="#F6F1E9" stroke={K} strokeWidth="6" />
            <path d="M-40 -18 H40 M-40 0 H30 M-40 18 H10" stroke="#A8283A" strokeWidth="6" strokeLinecap="round" />
          </g>
          <path d={`M-200 -200 H30 Q${110 + Math.sin(t * 0.8) * 10} 800 70 2200 H-200 Z`} fill="url(#pr-curtainV)" stroke={K} strokeWidth="10" />
          <path d={`M1280 -200 H1010 Q${950 + Math.sin(t * 0.8 + 1) * 10} 800 1020 2200 H1280 Z`} fill="url(#pr-curtainV)" stroke={K} strokeWidth="10" />
        </g>

        {/* PIANO 5 — pulviscolo vicino alla camera */}
        <g transform={L(1.7)}>
          <NearMotes id="pr-near" t={t} color="#FFE7C0" opacity={0.08 + 0.06 * spot} />
        </g>
      </g>

      <Finish id="pr" tint="#2C2456" tintOpacity={0.13} />
    </svg>
  );
};
