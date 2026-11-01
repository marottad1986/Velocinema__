import React from 'react';
import { camera, eio, eo, eob, lerp, seg } from '../../lib/anim';
import { Clouds, Fog, Gulls, NearMotes, Smoke, SunRays } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { Brachio, Fern, Helicopter, JPDefs, JungleTree, K, Ombra } from './Comuni';

// Gli esperti: l'isola di giorno, montagne verdi con la cascata, la giungla; un brachiosauro enorme mangia dalle cime
// degli alberi a destra; l'elicottero scende sulla piazzola in primo piano e scarica le borse dei tre esperti, ognuna con
// un cartellino grande che dice chi sono (nessuna persona).
// Eventi: l'elicottero scende dall'inizio e tocca terra poco prima della seconda frase (l'erba si piega); seconda frase
// escono le borse «PALEONTOLOGO» e «PALEOBOTANICA»; terza frase la borsa «MATEMATICO», e sopra la montagna arriva una
// nuvola scura (sicuro che finirà male). Il vento delle pale cala dopo cue 2 + 1 (come nello spartito).
// Piani: cielo e montagne con la cascata (0,2) · giungla lontana (0,4) · brachiosauro e alberi (0,55) · piazzola ed elicottero (0,75)
//        · borse con i cartellini (0,85) · felci in primo piano (1,25) · spruzzi e particelle (1,5–1,8)

const Borsa: React.FC<{ id: string; x: number; y: number; color: string; p: number }> = ({ id, x, y, color, p }) => (
  <g transform={`translate(${x} ${y - 60 * (1 - p)}) scale(${0.42 + 0.28 * p})`} opacity={seg(p, 0, 0.2)}>
    <Ombra id={id} x={0} y={4} rx={110} ry={14} />
    <path d="M-100 0 V-90 Q-100 -120 -70 -120 H70 Q100 -120 100 -90 V0 Z" fill={color} stroke={K} strokeWidth="7" />
    <path d="M-40 -120 Q-40 -160 0 -160 Q40 -160 40 -120" stroke={K} strokeWidth="9" fill="none" />
    <path d="M-100 -70 H100" stroke={K} strokeWidth="4" opacity=".6" />
    <path d="M-86 -108 Q-60 -114 -20 -114" stroke="#FFFFFF" strokeWidth="5" opacity=".4" fill="none" />
  </g>
);

export const Esperti: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const landT = cues[1] - 0.2;
  const land = eio(seg(t, 0, landT));
  const wash = 1 - seg(t, cues[2] + 1, dur);
  const b1 = eob(seg(t, cues[1] + 0.3, cues[1] + 0.9));
  const b2 = eob(seg(t, cues[1] + 0.8, cues[1] + 1.4));
  const b3 = eob(seg(t, cues[2] + 0.3, cues[2] + 0.9));
  const gloom = eo(seg(t, cues[2] + 0.4, cues[2] + 2));
  const bend = wash * (0.4 + 0.6 * land);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ex" />
        <JPDefs id="ex" />
        <Lin id="ex-sky" stops={[[0, '#5A8AA8'], [0.4, '#9AC4D4'], [0.7, '#D8EAE0'], [1, '#E8F0D8']]} />
        <Lin id="ex-mount" stops={[[0, '#4A7A5A'], [1, '#2A4A36']]} />
        <Lin id="ex-mount2" stops={[[0, '#6A9A78'], [1, '#3E6A4E']]} />
        <Lin id="ex-pad" stops={[[0, '#6A6E66'], [1, '#3A3E38']]} />
        <Lin id="ex-water" x2={1} y2={0} stops={[[0, '#C8E8F0'], [0.5, '#FFFFFF'], [1, '#A8D0DC']]} />
        <Lin id="ex-heli" stops={[[0, '#FFFAEC'], [0.6, '#E2D9C2'], [1, '#A89E86']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo, montagne, cascata (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ex-sky)" />
          <SunRays id="ex-rays" x={160} y={300} t={t} color="#FFF8E0" n={8} length={900} opacity={0.18} />
          <Clouds id="ex-cl" t={t} color="#F4F8F4" seed={3} n={4} y={560} h={120} speed={8} opacity={0.7} />
          <path d="M-200 900 L60 640 L240 760 L420 600 L620 780 L860 560 L1080 720 L1280 680 V1000 H-200 Z" fill="url(#ex-mount2)" />
          <path d="M-200 960 L140 760 L360 880 L560 720 L780 900 L980 760 L1280 860 V1100 H-200 Z" fill="url(#ex-mount)" />
          {/* nuvola scura che arriva: Malcolm sicuro che finirà male */}
          <g opacity={gloom} transform={`translate(${lerp(300, 0, gloom)} 0)`}>
            <ellipse cx="820" cy="610" rx="230" ry="70" fill="#4A5258" />
            <ellipse cx="720" cy="640" rx="160" ry="56" fill="#3A4248" />
            <ellipse cx="940" cy="650" rx="170" ry="54" fill="#3A4248" />
          </g>
          {/* cascata */}
          <path d="M556 726 Q548 860 560 990 H596 Q606 860 590 726 Z" fill="url(#ex-water)" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${560 + i * 6} ${740 + ((t * 300 + i * 50) % 240)} v40`} stroke="#FFFFFF" strokeWidth="3" opacity=".7" />)}
          <Fog id="ex-spray" t={t} y={990} x={576} rx={120} ry={30} color="#FFFFFF" opacity={0.6} drift={10} speed={1} />
          <Gulls t={t} seed={5} n={3} y={600} h={120} color="#2A3A30" size={0.6} period={6} />
        </g>

        {/* PIANO 1 — giungla lontana (0,4) */}
        <g transform={L(0.4)}>
          {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={-150 + i * 150} cy={1010 + (i % 2) * 20} r={110 + (i % 3) * 20} fill="#2E5A3E" />)}
          <path d="M-200 1040 H1280 V1300 H-200 Z" fill="#2E5A3E" />
        </g>

        {/* PIANO 2 — il brachiosauro che mangia dalle cime degli alberi (0,55) */}
        <g transform={L(0.55)}>
          <JungleTree x={1060} y={1120} h={330} t={t} ph={1} leaf="#2E6A44" trunk="url(#ex-trunk)" />
          <Brachio id="ex" x={780} y={1110} s={0.62} t={t} reach={0.5 + 0.5 * Math.sin(t * 0.6)} />
          <JungleTree x={60} y={1130} h={300} t={t} ph={2} leaf="#2A5E3C" trunk="url(#ex-trunk)" />
        </g>

        {/* PIANO 3 — la piazzola e l'elicottero che scende (0,75) */}
        <g transform={L(0.75)}>
          <path d="M-200 1120 H1280 V2200 H-200 Z" fill="#3E7A4E" />
          {Array.from({ length: 40 }, (_, i) => {
            const x = -180 + i * 38, d = (x - 560) / 600;
            return <path key={i} d={`M${x} 1170 q${8 + bend * 30 * Math.sign(d || 1)} -20 ${6 + bend * 40 * d} -40`} stroke="#5FA672" strokeWidth="5" fill="none" />;
          })}
          <ellipse cx="660" cy="1210" rx="360" ry="60" fill="url(#ex-pad)" stroke={K} strokeWidth="7" />
          <ellipse cx="660" cy="1210" rx="290" ry="44" fill="none" stroke={P.accento} strokeWidth="8" strokeDasharray="30 20" />
          <text x="660" y="1230" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="54" fill="#F2EEE4" opacity=".85">H</text>
          <Ombra id="ex" x={700} y={1212} rx={260 * (0.5 + 0.5 * land)} ry={30} opacity={0.4 + 0.6 * land} />
          <Smoke id="ex-dust" t={t} x={700} y={1200} color="#C8D8B8" n={8} rise={60} wind={300} r0={40} r1={150} speed={0.5} opacity={0.4 * wash * land} />
          <Helicopter x={720} y={lerp(560, 1140, land)} s={1.1} t={t} tilt={lerp(-6, 0, land)} color="url(#ex-heli)" />
        </g>

        {/* PIANO 4 — le borse dei tre esperti con i cartellini (0,85) */}
        <g transform={L(0.85)}>
          <Borsa id="ex" x={130} y={1250} color="#8A6A44" p={b1} />
          <Borsa id="ex" x={300} y={1262} color="#4A7A5A" p={b2} />
          <Borsa id="ex" x={470} y={1254} color="#2A2A2E" p={b3} />
          {/* i cartellini: chi sono i tre esperti */}
          {([['PALEONTOLOGO', 130, 1250, 860, b1], ['PALEOBOTANICA', 300, 1262, 960, b2], ['MATEMATICO', 470, 1254, 1060, b3]] as const).map(([label, bx, by, ty, p], i) => (
            <g key={i} opacity={seg(p, 0, 0.3)}>
              <path d={`M${bx} ${by - 100} L${90 + i * 20} ${ty + 30}`} stroke={K} strokeWidth="4" strokeDasharray="8 8" />
              <g transform={`translate(${70 + i * 20} ${ty - 30 * (1 - p)}) rotate(-3)`}>
                <rect x="0" y="-38" width={label.length * 26 + 60} height="76" rx="10" fill="#FFF8E6" stroke={K} strokeWidth="6" />
                <circle cx="22" cy="0" r="8" fill={K} />
                <text x="42" y="13" fontFamily={SANS} fontWeight={800} fontSize="36" fill={K}>{label}</text>
              </g>
            </g>
          ))}
        </g>

        {/* PIANO 5 — felci in primo piano (1,25) */}
        <g transform={L(1.25)}>
          <Fern x={-40} y={1980} s={2.2} t={t + bend * 2} ph={0} color="#2E7D4F" />
          <Fern x={1120} y={2000} s={2.4} t={t + bend * 2} ph={1} color="#276B44" flip />
          <Fern x={540} y={2120} s={1.6} t={t} ph={2} color="#3A8A58" />
        </g>

        {/* PIANO 6 — spruzzi e foglie sollevate dal vento delle pale (1,5–1,8) */}
        <g transform={L(1.6)}>
          <NearMotes id="ex-near" t={t * (1 + 2 * wash)} color="#E8F8E0" n={8} vx={-80 * wash} opacity={0.1} />
        </g>
      </g>
      <Finish id="ex" tint="#1E4A30" tintOpacity={0.1} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): atterraggio cue1 − 0,2 · borse cue1 + 0,3 / + 0,8 · MATEMATICO cue2 + 0,3 · nuvola scura cue2 + 0,4 · vento che cala cue2 + 1.
