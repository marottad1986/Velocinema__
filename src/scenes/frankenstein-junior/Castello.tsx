import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Fire, Fog, Glow, Gulls, Lightning, NearMotes, Notes, Rain, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';

// Frau Blücher: enorme portone del castello con due batacchi giganti, torce accese, finestra della stalla
// dove i cavalli si impennano a ogni lampo; in alto una finestrella con un violino che suona da solo. Nessuna persona.
// Eventi: i batacchi battono (inizio) · lampo e cavalli che si impennano al nome (cue 1) e di nuovo (cue 3)
//         · note del violino dalla finestrella (cue 4).
// Piani: cielo, luna, pipistrelli (0,2) · facciata, portone, finestre (0,55) · gradini e ciottoli (0,85)
//        · cancellata e balaustra in primo piano (1,2) · pioggia vicina e particelle (1,5–1,8)

const K = '#0C0D10';
const ACC = '#8EF0C8';
const r = rng(1897);
const BRICKS = Array.from({ length: 40 }, (_, i) => ({ x: -160 + (i % 8) * 190 + (Math.floor(i / 8) % 2) * 95, y: 560 + Math.floor(i / 8) * 150, w: 170 + r() * 20 }));

/** Testa di cavallo che si impenna (silhouette verso sinistra). */
const Horse: React.FC<{ x: number; y: number; up: number; flip?: boolean }> = ({ x, y, up, flip }) => (
  <g transform={`translate(${x} ${y - up * 70}) scale(${flip ? -1 : 1} 1) rotate(${-up * 25})`} fill="#1A1C20">
    <path d="M30 120 L20 20 Q14 -30 -30 -56 L-70 -50 Q-88 -44 -82 -28 L-50 -14 Q-28 0 -20 40 L-14 120 Z" />
    <path d="M-30 -56 L-24 -84 L-12 -58 Z" />
    <path d="M10 -10 l20 6 l-14 12 l22 8 l-16 12 l20 10 l-18 10" fill="none" stroke="#1A1C20" strokeWidth="10" strokeLinejoin="round" />
    <circle cx="-44" cy="-36" r="4" fill="#DDE2E6" />
  </g>
);

export const Castello: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const flash = flashAt(t, [cues[1] + 0.15, cues[3] + 0.15]);
  const neigh = Math.max(eob(seg(t, cues[1] + 0.2, cues[1] + 0.6)) * (1 - seg(t, cues[1] + 1.2, cues[1] + 1.8)), eob(seg(t, cues[3] + 0.2, cues[3] + 0.6)) * (1 - seg(t, cues[3] + 1.4, cues[3] + 2.0)));
  // batacchi: due colpi all'inizio, poi oscillano piano
  const knock = (ph: number) => {
    const k = seg(t, 0.3 + ph, 0.5 + ph) - seg(t, 0.55 + ph, 0.8 + ph);
    return lerp(0, -28, Math.max(0, k)) + Math.sin(t * 2.2 + ph * 3) * 3;
  };
  const violin = seg(t, cues[4] - 0.3, cues[4] + 0.3);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fb" />
        <Lin id="fb-sky" stops={[[0, '#06070A'], [0.25, '#14181E'], [0.4, '#262C34']]} />
        <Lin id="fb-wall" x2={1} y2={0} stops={[[0, '#2C2F33'], [0.5, '#45484C'], [1, '#2A2D31']]} />
        <Lin id="fb-door" x2={1} y2={0} stops={[[0, '#2E261E'], [0.5, '#4A3D30'], [1, '#2A2219']]} />
        <Lin id="fb-iron" x2={1} y2={0} stops={[[0, '#2A2E33'], [0.5, '#8C949C'], [1, '#30353A']]} />
        <Lin id="fb-step" stops={[[0, '#5A5D61'], [1, '#2A2C30']]} />
        <Lin id="fb-stable" stops={[[0, '#3A3127'], [1, '#1E1914']]} />
        <Lin id="fb-front" stops={[[0, '#1A1C1F'], [1, '#08090B']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo notturno, luna velata, pipistrelli, fulmine (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#fb-sky)" />
          <Glow id="fb-moon" x={880} y={260} r={260} t={t} color="#C9D0D6" amp={0.04} rate={1} opacity={0.35} />
          <circle cx="880" cy="260" r="64" fill="#DAD9D2" />
          <Fog id="fb-cl" t={t} y={290} x={760} rx={420} ry={40} color="#1E232A" opacity={0.9} speed={0.3} drift={80} />
          <Gulls t={t} seed={13} n={4} y={160} h={260} color="#0A0B0D" size={0.7} period={7} />
          <rect x="-200" y="-200" width="1480" height="2320" fill="#DCE4EA" opacity={flash * 0.4} />
          <Lightning x={180} y={-40} h={460} flash={flash} seed={4} width={8} />
          <Rain t={t} level="far" seed={3} color="#7E8A96" opacity={0.3} />
        </g>

        {/* PIANO 1 — facciata con portone, torce, finestre della stalla e del violino (0,55) */}
        <g transform={L(0.55)}>
          <path d="M-200 560 L-200 520 h60 v40 h70 v-40 h60 v40 h70 v-40 h60 v40 h70 v-40 h60 v40 h70 v-40 h60 v40 h70 v-40 h60 v40 h70 v-40 h60 v40 h70 v-40 h60 v40 h80 V1300 H-200 Z" fill="url(#fb-wall)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          {BRICKS.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height="130" rx="10" fill="none" stroke="#1C1E21" strokeWidth="4" opacity=".7" />)}
          {/* edera */}
          <path d="M-40 560 Q20 700 -10 860 Q30 980 10 1100" fill="none" stroke="#1E2A22" strokeWidth="14" strokeLinecap="round" />
          {[620, 700, 790, 880, 960, 1040].map((y, i) => <ellipse key={y} cx={(i % 2 ? 10 : -14) + Math.sin(t * 1.5 + i) * 2} cy={y} rx="22" ry="12" fill="#2E3D32" transform={`rotate(${i % 2 ? 30 : -30} 0 ${y})`} />)}
          {/* portone ad arco */}
          <path d="M280 1250 V820 Q280 610 540 600 Q800 610 800 820 V1250 Z" fill="#141518" stroke={K} strokeWidth="10" />
          <path d="M300 1250 V826 Q300 630 540 622 Q780 630 780 826 V1250 Z" fill="url(#fb-door)" stroke={K} strokeWidth="8" />
          {[380, 460, 540, 620, 700].map((x) => <path key={x} d={`M${x} ${x === 540 ? 624 : 660} V1250`} stroke={K} strokeWidth={x === 540 ? 9 : 4} opacity=".75" />)}
          {[780, 1080].map((y) => <path key={y} d={`M300 ${y} H780`} stroke="url(#fb-iron)" strokeWidth="22" />)}
          {[330, 750].map((x) => [780, 1080].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="8" fill="#B7BEC6" stroke={K} strokeWidth="3" />))}
          <path d="M300 826 Q300 630 540 622 Q780 630 780 826" fill="none" stroke="#7A6A56" strokeWidth="4" opacity=".7" />
          {/* stemma sopra il portone */}
          <path d="M500 540 h80 v40 q0 34 -40 46 q-40 -12 -40 -46 Z" fill="#5A5D61" stroke={K} strokeWidth="6" />
          <path d="M540 552 V612 M512 576 H568" stroke={K} strokeWidth="5" />
          {/* batacchi giganti */}
          {[440, 640].map((x, i) => (
            <g key={x}>
              <circle cx={x} cy="880" r="22" fill="url(#fb-iron)" stroke={K} strokeWidth="7" />
              <g transform={`rotate(${knock(i * 0.35)} ${x} 880)`}>
                <circle cx={x} cy="960" r="70" fill="none" stroke={K} strokeWidth="26" />
                <circle cx={x} cy="960" r="70" fill="none" stroke="url(#fb-iron)" strokeWidth="14" />
                <path d={`M${x - 40} 920 Q${x - 20} 900 ${x + 10} 898`} fill="none" stroke="#E2E6EA" strokeWidth="5" strokeLinecap="round" opacity=".7" />
              </g>
            </g>
          ))}
          {/* torce ai lati */}
          {[200, 860].map((x, i) => (
            <g key={x}>
              <path d={`M${x - 14} 860 h28 l-6 70 h-16 Z`} fill="#2A2C30" stroke={K} strokeWidth="6" strokeLinejoin="round" />
              <Fire id={`fb-fire${i}`} t={t + i * 0.7} x={x} y={862} scale={0.42} outer="#B98A4E" mid="#E8C483" core="#FFF1CC" outline={K} />
            </g>
          ))}
          {/* finestrella del violino in alto a destra */}
          <g>
            <path d="M890 760 V650 Q890 600 940 600 Q990 600 990 650 V760 Z" fill="#3A3428" stroke={K} strokeWidth="8" />
            <Glow id="fb-vw" x={940} y={690} r={110 + 50 * violin} t={t} color="#F0DDB0" amp={0.1} rate={2.5} opacity={0.35 + 0.35 * violin} />
            <g transform="translate(940 700) rotate(-25)">
              <path d="M-14 -50 q-16 0 -16 18 q0 10 6 14 q-8 6 -8 16 q0 22 32 22 q32 0 32 -22 q0 -10 -8 -16 q6 -4 6 -14 q0 -18 -16 -18 q-8 0 -14 6 q-6 -6 -14 -6 Z" fill="#8A5A34" stroke={K} strokeWidth="5" />
              <path d="M0 -50 V-96" stroke={K} strokeWidth="8" />
              <path d="M0 -96 q8 -6 4 -14" fill="none" stroke={K} strokeWidth="6" />
            </g>
            <g transform={`rotate(${Math.sin(t * 9) * 10 * violin} 940 700)`} opacity={violin}>
              <path d="M880 660 L1000 740" stroke="#D8D4C6" strokeWidth="5" strokeLinecap="round" />
            </g>
          </g>
          {/* finestra della stalla con i cavalli */}
          <g>
            <rect x="830" y="950" width="210" height="190" rx="8" fill="url(#fb-stable)" stroke={K} strokeWidth="9" />
            <clipPath id="fb-sw"><rect x="836" y="956" width="198" height="178" /></clipPath>
            <g clipPath="url(#fb-sw)">
              <rect x="830" y="950" width="210" height="190" fill="#C9A874" opacity=".55" />
              <Glow id="fb-lan" x={990} y={990} r={160} t={t} color="#F3DDA8" amp={0.15} rate={6} opacity={0.8} />
              <Horse x={900} y={1080} up={neigh} />
              <Horse x={1000} y={1090} up={neigh * 0.8} flip />
            </g>
            <path d="M830 1045 H1040" stroke={K} strokeWidth="8" />
            <path d="M836 956 H1034" stroke="#6B5A46" strokeWidth="4" opacity=".7" />
          </g>
          {/* nitriti: segni verde-acqua quando i cavalli si impennano */}
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${870 + i * 70} ${930 - neigh * (30 + i * 12)} l${-10 + i * 10} -24`} stroke={ACC} strokeWidth="7" strokeLinecap="round" opacity={neigh} />
          ))}
        </g>

        {/* PIANO 2 — gradini e ciottoli bagnati (0,85) */}
        <g transform={L(0.85)}>
          <path d="M-200 1250 H1280 V2200 H-200 Z" fill="#1E2023" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={240 - i * 60} y={1250 + i * 50} width={600 + i * 120} height="50" fill="url(#fb-step)" stroke={K} strokeWidth="7" />
              <path d={`M${246 - i * 60} ${1256 + i * 50} H${834 + i * 60}`} stroke="#9AA2A9" strokeWidth="3" opacity=".6" />
            </g>
          ))}
          {Array.from({ length: 18 }, (_, i) => <ellipse key={i} cx={-160 + (i % 9) * 170 + (Math.floor(i / 9) % 2) * 80} cy={1430 + Math.floor(i / 9) * 60} rx="70" ry="22" fill="#2A2C30" stroke={K} strokeWidth="5" />)}
          <ellipse cx="540" cy="1520" rx="200" ry="20" fill="#9AA6B0" opacity={0.12 + flash * 0.3} />
        </g>

        {/* PIANO 3 — cancellata e balaustra in primo piano (1,2) */}
        <g transform={L(1.2)}>
          {[-90, -10, 1090, 1170].map((x) => (
            <g key={x}>
              <path d={`M${x} 1980 V1080`} stroke={K} strokeWidth="22" />
              <path d={`M${x - 16} 1100 L${x} 1050 L${x + 16} 1100 Z`} fill={K} />
              <path d={`M${x + 6} 1980 V1100`} stroke="#5A6168" strokeWidth="4" opacity=".6" />
            </g>
          ))}
          <path d="M-200 1200 H40 M1050 1200 H1280" stroke={K} strokeWidth="14" />
          <path d="M-200 1640 H1280 V2200 H-200 Z" fill="url(#fb-front)" stroke={K} strokeWidth="9" />
          {[60, 300, 540, 780, 1020].map((x) => <path key={x} d={`M${x - 40} 1640 q-10 60 0 120 q30 30 80 0 q10 -60 0 -120`} fill="#2A2D31" stroke={K} strokeWidth="7" />)}
          <path d="M-200 1640 H1280" stroke="#6E757C" strokeWidth="5" />
        </g>

        {/* PIANO 4 — note del violino, pioggia vicina, particelle (1,5–1,8) */}
        <g transform={L(1.4)} opacity={violin}>
          <Notes t={t} x={940} y={640} n={6} color="#E8DDBF" outline={K} rise={380} spread={260} speed={0.35} size={0.9} />
        </g>
        <g transform={L(1.6)}>
          <Rain t={t} level="near" seed={8} color="#B9C3CC" opacity={0.35} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="fb-near" t={t} color="#DDE2E6" n={6} vx={-30} vy={-6} opacity={0.08} />
        </g>
      </g>

      <Finish id="fb" tint="#5E6B75" tintOpacity={0.12} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): batacchi 0,3 / 0,65 · lampi e cavalli cue1 + 0,15, cue3 + 0,15 · violino cue4 − 0,3.
