import React from 'react';
import { camera, eo, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, NearMotes, Neon, Notes, Rain, Reflection, ShootingStar, Stars } from '../../lib/elements';
import { DISPLAY } from '../../lib/fonts';
import type { SceneProps } from '../../types';

// Cinque anni dopo: muro di mattoni di notte, insegna al neon SEB'S che si accende, pianoforte alla finestra, note.
// Piani: cielo e skyline (0,25–0,3) · facciata in mattoni, insegna, finestra, porta (0,5) · marciapiede (0,65)
//        · strada bagnata con pozzanghere (0,85) · lampione e pilastro ai bordi, pioggia vicina (1,25) · gocce e foschia (1,7)
// Eventi: cues[2] si accende SEB'S · cues[3] salgono le note dalla finestra · cues[4] stella cadente e luce che si scalda.

const K = '#1B1530';
const ROOF = 620;
const WALK = 1190;
const WIN = { x: 100, y: 880, w: 360, h: 250 };
const r = rng(5150);
const SKY = Array.from({ length: 9 }, (_, i) => ({ x: -160 + i * 160, w: 120 + r() * 70, h: 60 + r() * 110, lit: Array.from({ length: 4 }, () => r() > 0.55) }));

const bricks = (() => {
  let d = '';
  for (let row = 0; row < 12; row++) {
    const y = ROOF + 40 + row * 46;
    d += `M-200 ${y} H1280 `;
    for (let c = -2; c < 14; c++) {
      const x = c * 110 + (row % 2) * 55;
      d += `M${x} ${y} V${y + 46} `;
    }
  }
  return d;
})();

export const Epilogo: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c2 = cues[2] ?? 3.2, c3 = cues[3] ?? 5.8, c4 = cues[4] ?? 7.3;

  const neonOn = t < c2 ? 0 : t < c2 + 0.5 ? (Math.sin((t - c2) * 40) > 0 ? 1 : 0.15) : 1;
  const play = eo(seg(t, c3, c3 + 1));
  const warm = eo(seg(t, c4, c4 + 1.5));
  const winLight = 0.6 + 0.25 * warm + 0.05 * Math.sin(t * 2.3);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ep" />
        <Lin id="ep-sky" stops={[[0, '#0C0A1E'], [0.3, '#1C1838'], [0.6, '#2C2456'], [1, '#4A3A78']]} />
        <Lin id="ep-wall" stops={[[0, '#4A2A3A'], [0.5, '#5E3444'], [1, '#3A2030']]} />
        <Lin id="ep-room" stops={[[0, '#4A3466'], [0.55, '#B07A5A'], [1, '#E2A872']]} />
        <Lin id="ep-walk" stops={[[0, '#3A3150'], [1, '#221C36']]} />
        <Lin id="ep-street" stops={[[0, '#1E1932'], [0.5, '#16122A'], [1, '#0C0A1A']]} />
        <Lin id="ep-door" x2={1} y2={0} stops={[[0, '#2A1F3E'], [0.5, '#45366A'], [1, '#221A34']]} />
        <Lin id="ep-post" x2={1} y2={0} stops={[[0, '#120E22'], [0.4, '#3A2E58'], [1, '#0C0A18']]} />
        <clipPath id="ep-winclip"><rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} /></clipPath>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo notturno (zona calma per il titolo) con stelle */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1000" fill="url(#ep-sky)" />
          <Stars t={t} seed={12} n={34} y={120} h={480} color="#E9E4F6" />
          <ShootingStar id="ep-shoot" t={t} at={c4 + 0.2} from={{ x: 1040, y: 520 }} to={{ x: 700, y: 600 }} color="#FFF4D0" />
        </g>
        {/* skyline lontano */}
        <g transform={L(0.3)}>
          {SKY.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={ROOF - b.h} width={b.w} height={b.h + 40} fill="#241D44" />
              {b.lit.map((l, j) => l && <rect key={j} x={b.x + 16 + (j % 2) * 46} y={ROOF - b.h + 18 + Math.floor(j / 2) * 34} width="18" height="14" fill="#E2A872" opacity={0.5 + 0.3 * Math.sin(t * 0.8 + i + j)} />)}
            </g>
          ))}
        </g>

        {/* PIANO 1 — facciata in mattoni con insegna, finestra e porta */}
        <g transform={L(0.5)}>
          <rect x="-200" y={ROOF} width="1480" height={WALK - ROOF} fill="url(#ep-wall)" />
          <path d={bricks} stroke="#2A1622" strokeWidth="4" opacity=".55" fill="none" />
          <rect x="-200" y={ROOF - 10} width="1480" height="40" fill="#3A2E58" stroke={K} strokeWidth="8" />
          <path d={`M-200 ${ROOF - 2} H1280`} stroke="#8E7AAE" strokeWidth="4" opacity=".6" />
          {/* bagliore dell'insegna sui mattoni */}
          <Glow id="ep-wallglow" x={540} y={790} r={380} t={t} color="#F2C14E" amp={0.03} rate={2.5} opacity={0.35 * neonOn} />
          {/* pannello e staffe dell'insegna */}
          <rect x="250" y="690" width="580" height="200" rx="16" fill="#1E1632" stroke={K} strokeWidth="9" />
          <path d="M290 690 V660 M790 690 V660" stroke={K} strokeWidth="8" />
          <Neon id="ep-neon" t={t} x={540} y={850} text="SEB'S" color="#F2C14E" font={DISPLAY} size={150} onAt={c2} />
          {/* finestra con il pianoforte */}
          <g clipPath="url(#ep-winclip)">
            <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} fill="url(#ep-room)" opacity={0.75 + 0.25 * winLight} />
            <Glow id="ep-lamp" x={WIN.x + 280} y={WIN.y + 70} r={160} t={t} color="#FFD9A0" amp={0.06} rate={1.8} opacity={0.6 * winLight} />
            <path d={`M${WIN.x + 280} ${WIN.y} V${WIN.y + 40}`} stroke={K} strokeWidth="4" />
            <path d={`M${WIN.x + 256} ${WIN.y + 60} h48 l-10 -22 h-28 z`} fill="#F6E2B8" stroke={K} strokeWidth="4" />
            {/* pianoforte a coda in controluce */}
            <g fill={K}>
              <path d={`M${WIN.x + 40} ${WIN.y + 190} H${WIN.x + 250} Q${WIN.x + 310} ${WIN.y + 190} ${WIN.x + 300} ${WIN.y + 150} Q${WIN.x + 280} ${WIN.y + 120} ${WIN.x + 210} ${WIN.y + 140} L${WIN.x + 40} ${WIN.y + 150} Z`} />
              <path d={`M${WIN.x + 60} ${WIN.y + 150} L${WIN.x + 230} ${WIN.y + 60} L${WIN.x + 240} ${WIN.y + 70} L${WIN.x + 90} ${WIN.y + 150} Z`} />
              <rect x={WIN.x + 60} y={WIN.y + 190} width="12" height="60" />
              <rect x={WIN.x + 260} y={WIN.y + 190} width="12" height="60" />
            </g>
            <path d={`M${WIN.x + 44} ${WIN.y + 156} H${WIN.x + 120}`} stroke="#F6F1E9" strokeWidth="5" opacity=".7" />
          </g>
          <rect x={WIN.x - 14} y={WIN.y - 14} width={WIN.w + 28} height={WIN.h + 28} fill="none" stroke={K} strokeWidth="12" />
          <path d={`M${WIN.x + WIN.w / 2} ${WIN.y} V${WIN.y + WIN.h} M${WIN.x} ${WIN.y + 100} H${WIN.x + WIN.w}`} stroke={K} strokeWidth="8" />
          <rect x={WIN.x - 30} y={WIN.y + WIN.h + 12} width={WIN.w + 60} height="22" fill="#3A2E58" stroke={K} strokeWidth="7" />
          {/* porta del locale con lunetta illuminata */}
          <rect x="640" y="930" width="230" height={WALK - 930} fill="url(#ep-door)" stroke={K} strokeWidth="10" />
          <rect x="650" y="940" width="210" height="50" fill="#E2A872" opacity={0.55 + 0.3 * winLight} />
          <path d="M650 990 H860 M755 990 V1190" stroke={K} strokeWidth="8" />
          <circle cx="736" cy="1080" r="8" fill="#B8A8C8" stroke={K} strokeWidth="3" />
          <path d="M620 920 H890 L870 900 H640 Z" fill="#3A2E58" stroke={K} strokeWidth="7" />
          {/* manifesto jazz sul muro */}
          <g transform="translate(965 1000) rotate(3)">
            <rect x="-60" y="-80" width="120" height="160" fill="#E9E2D2" stroke={K} strokeWidth="6" />
            <circle cx="0" cy="-20" r="34" fill="#6B4FA0" />
            <path d="M-40 40 H40 M-40 58 H20" stroke={K} strokeWidth="6" strokeLinecap="round" />
          </g>
          {/* note dalla finestra */}
          <g opacity={play}>
            <Notes t={t} x={WIN.x + WIN.w / 2} y={WIN.y + 10} n={7} rise={300} spread={300} color="#F6F1E9" outline={K} size={0.85} speed={0.25} />
          </g>
          <Rain t={t} level="far" seed={23} color="#B8A8D8" opacity={0.3} />
        </g>

        {/* PIANO 2 — marciapiede bagnato */}
        <g transform={L(0.65)}>
          <rect x="-200" y={WALK} width="1480" height="110" fill="url(#ep-walk)" />
          <path d={`M-200 ${WALK} H1280`} stroke={K} strokeWidth="8" />
          <path d={`M-200 ${WALK + 110} H1280`} stroke="#8E7AAE" strokeWidth="5" opacity=".5" />
          <Reflection t={t} x={540} y={WALK + 20} color="#F2C14E" n={4} w={260} gap={20} opacity={0.5 * neonOn} />
          <Reflection t={t} x={WIN.x + WIN.w / 2} y={WALK + 20} color="#E2A872" n={4} w={140} gap={20} opacity={0.35} />
        </g>

        {/* PIANO 3 — strada con pozzanghere che riflettono l'insegna */}
        <g transform={L(0.85)}>
          <rect x="-200" y={WALK + 110} width="1480" height="800" fill="url(#ep-street)" />
          <ellipse cx="600" cy="1690" rx="360" ry="76" fill="#0A0818" />
          <ellipse cx="600" cy="1690" rx="360" ry="76" fill="none" stroke="#4A3A78" strokeWidth="4" opacity=".7" />
          <Reflection t={t} x={600} y={1636} color="#F2C14E" n={5} w={260} gap={20} opacity={0.75 * neonOn} />
          <ellipse cx="170" cy="1420" rx="190" ry="40" fill="#0A0818" />
          <Reflection t={t} x={170} y={1402} color="#E2A872" n={3} w={120} gap={16} opacity={0.4} />
          {/* increspature della pioggia nelle pozzanghere */}
          {Array.from({ length: 6 }, (_, i) => {
            const p = ((t * 0.9 + i * 0.37) % 1);
            const cx = [460, 680, 800, 540, 120, 230][i], cy = [1670, 1710, 1680, 1720, 1420, 1430][i];
            return <ellipse key={i} cx={cx} cy={cy} rx={6 + p * 50} ry={2 + p * 10} fill="none" stroke="#C9B8E0" strokeWidth="3" opacity={(1 - p) * 0.6} />;
          })}
        </g>

        {/* PIANO 4 — lampione a sinistra, pilastro a destra, pioggia vicina */}
        <g transform={L(1.25)}>
          <rect x="10" y="660" width="76" height="1500" fill="url(#ep-post)" stroke={K} strokeWidth="10" />
          <path d="M80 710 Q170 680 200 740" fill="none" stroke={K} strokeWidth="16" />
          <path d="M160 740 h80 l-14 50 h-52 z" fill="#3A2E58" stroke={K} strokeWidth="8" />
          <Glow id="ep-lamp2" x={200} y={800} r={220} t={t} color="#FFE2B0" amp={0.04} rate={1.4} opacity={0.55} />
          <ellipse cx="200" cy="796" rx="24" ry="10" fill="#FFF2D6" />
          <rect x="975" y="-200" width="340" height="2400" fill="#3A2030" stroke={K} strokeWidth="10" />
          <path d={Array.from({ length: 40 }, (_, i) => `M975 ${-200 + i * 60} H1300 M${1030 + (i % 2) * 60} ${-200 + i * 60} v60`).join(' ')} stroke="#22121C" strokeWidth="5" opacity=".7" />
          <path d="M990 -200 V2200" stroke="#7A4A5E" strokeWidth="4" opacity=".5" />
          {/* idrante sul marciapiede in primo piano */}
          <g transform="translate(880 1820)">
            <path d="M-50 0 V-150 Q-50 -200 0 -200 Q50 -200 50 -150 V0 Z" fill="#6B4FA0" stroke={K} strokeWidth="10" />
            <rect x="-80" y="-130" width="160" height="34" rx="12" fill="#5A3E8E" stroke={K} strokeWidth="8" />
            <path d="M-30 -180 V-20" stroke="#B79AE0" strokeWidth="8" strokeLinecap="round" opacity=".6" />
          </g>
          <Rain t={t} level="near" seed={31} color="#D8CCF0" opacity={0.28} />
        </g>

        {/* PIANO 5 — foschia calda vicino alla camera */}
        <g transform={L(1.7)}>
          <NearMotes id="ep-near" t={t} color="#E9D8FF" opacity={0.09 + 0.04 * lerp(0, 1, neonOn)} />
        </g>
      </g>

      <Finish id="ep" tint="#2C2456" tintOpacity={0.13} />
    </svg>
  );
};
