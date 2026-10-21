import React from 'react';
import { camera, eio, eo, lerp, seg } from '../../lib/anim';
import { DISPLAY } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Flyers, Fog, Glow, NearMotes, Stars, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Cards, K, Pines, Raincoat, TINT, YELLOW, Yarn } from './Winden';

// Un bambino sparisce: bosco di notte; l'ingresso della grotta dietro una rete con il cartello di divieto; torce
// elettriche abbandonate a terra che illuminano i tronchi; sul sentiero il mazzo di carte di Mikkel e il gomitolo rosso
// di Martha; l'impermeabile giallo di Jonas appeso a un ramo. Nessuna persona.
// Eventi: carte e gomitolo si illuminano (cue 1) · rombo: le torce sfarfallano e la grotta si accende (cue 3)
//         · le carte si alzano a ventaglio e vengono risucchiate nella grotta: sparite (cue 4).
// Piani: cielo e stelle (0,2) · bosco lontano (0,4) · roccia e grotta con la rete (0,6) · sentiero con oggetti (0,85)
//        · tronchi e felci ai bordi (1,25) · foglie e particelle (1,5–1,8)

const CAVE = { x: 540, y: 960 };

export const Bosco: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const intro = eo(seg(t, cues[1], cues[1] + 0.6));
  const quake = seg(t, cues[3], cues[3] + 0.3) * (1 - seg(t, cues[4] + 1.2, cues[4] + 2));
  // torce che sfarfallano durante il rombo (meno di 3 cambi al secondo)
  const flick = quake > 0 ? (Math.sin(t * 9) > -0.2 ? 1 : 0.25) : 1;
  const cave = Math.max(0.25, quake * 0.9);
  const flash = flashAt(t, [cues[4] + 0.3]);
  const gone = eio(seg(t, cues[4], cues[4] + 0.9));
  const shake = quake * Math.sin(t * 40) * 4;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="bo" />
        <Lin id="bo-sky" stops={[[0, '#05080A'], [0.4, '#0E1716'], [0.6, '#1A2A26'], [1, '#22342E']]} />
        <Lin id="bo-rock" x2={1} y2={0} stops={[[0, '#2A3430'], [0.5, '#3E4A44'], [1, '#1E2622']]} />
        <Lin id="bo-ground" stops={[[0, '#26302A'], [1, '#0A0E0C']]} />
        <Lin id="bo-trunk" x2={1} y2={0} stops={[[0, '#1A1612'], [0.6, '#3A3028'], [1, '#14100C']]} />
        <radialGradient id="bo-mouth">
          <stop offset="0" stopColor="#FFF4D0" stopOpacity={cave} />
          <stop offset=".35" stopColor="#E8C878" stopOpacity={cave * 0.7} />
          <stop offset="1" stopColor="#000" stopOpacity="1" />
        </radialGradient>
      </defs>

      <g transform={`translate(${shake} 0)`}>
        <g transform={cam.transform}>
          {/* PIANO 0 — cielo notturno con stelle (0,2) */}
          <g transform={L(0.2)}>
            <rect x="-200" y="-200" width="1480" height="2320" fill="url(#bo-sky)" />
            <Stars t={t} seed={33} n={50} y={-100} h={800} color="#DDE6E0" size={0.8} />
          </g>

          {/* PIANO 1 — bosco lontano nella nebbia (0,4) */}
          <g transform={L(0.4)}>
            <Pines t={t} y={940} n={13} h={420} seed={11} color="#16211D" sway={2} />
            <Fog id="bo-f1" t={t} y={930} x={540} rx={850} ry={90} color="#5E746A" opacity={0.35} speed={0.25} />
            <Pines t={t} y={1010} n={10} h={360} seed={19} color="#0F1714" sway={3} />
          </g>

          {/* PIANO 2 — roccia con l'ingresso della grotta, rete e cartello (0,6) */}
          <g transform={L(0.6)}>
            <path d="M120 1160 Q160 900 300 800 Q420 720 540 730 Q700 720 820 820 Q940 920 980 1160 Z" fill="url(#bo-rock)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
            <path d="M300 820 Q360 780 420 790 M760 830 Q820 860 860 930 M240 1000 Q270 960 300 950" fill="none" stroke="#56645C" strokeWidth="5" opacity=".7" />
            <path d="M400 1160 Q400 900 540 880 Q680 900 680 1160 Z" fill="url(#bo-mouth)" stroke={K} strokeWidth="9" />
            <Glow id="bo-cg" x={CAVE.x} y={1040} r={360} t={t} color="#FFE6A0" amp={0.15} rate={5} opacity={0.6 * cave + flash * 0.4} />
            {/* rete metallica con paletti */}
            <g stroke="#9AA8A0" strokeWidth="3" opacity=".75">
              {Array.from({ length: 12 }, (_, i) => <path key={`a${i}`} d={`M${370 + i * 30} 980 l60 180`} />)}
              {Array.from({ length: 12 }, (_, i) => <path key={`b${i}`} d={`M${430 + i * 30} 980 l-60 180`} />)}
            </g>
            <path d="M370 970 V1170 M710 970 V1170" stroke={K} strokeWidth="12" />
            <path d="M370 980 H710" stroke={K} strokeWidth="6" />
            <g transform="translate(540 1010)">
              <rect x="-90" y="-30" width="180" height="60" rx="6" fill="#E8E2D2" stroke={K} strokeWidth="6" />
              <text y="-4" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="20" fill="#B8443A">VIETATO</text>
              <text y="20" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="17" fill={K}>L'ACCESSO</text>
            </g>
          </g>

          {/* PIANO 3 — sentiero con torce, carte, gomitolo e impermeabile (0,85) */}
          <g transform={L(0.85)}>
            <path d="M-200 1140 Q540 1100 1280 1140 V2200 H-200 Z" fill="url(#bo-ground)" />
            <path d="M380 1160 Q540 1400 300 2000 H820 Q640 1400 700 1160 Z" fill="#2E3830" opacity=".7" />
            {/* torce elettriche a terra con il fascio */}
            <g opacity={flick}>
              <Beam id="bo-b1" x={150} y={1230} t={t} length={520} spread={190} color="#FFF0C0" angle={-18} opacity={0.5} />
              <Beam id="bo-b2" x={990} y={1330} t={t} length={560} spread={210} color="#FFF0C0" angle={200} opacity={0.45} />
            </g>
            <g transform="translate(150 1230) rotate(-18)">
              <rect x="-70" y="-16" width="70" height="32" rx="8" fill="#3A4A6A" stroke={K} strokeWidth="6" />
              <circle cx="2" r="12" fill="#FFF0C0" opacity={flick} />
            </g>
            <g transform="translate(990 1330) rotate(20)">
              <rect x="0" y="-16" width="70" height="32" rx="8" fill="#8A3A2A" stroke={K} strokeWidth="6" />
              <circle cx="-2" r="12" fill="#FFF0C0" opacity={flick} />
            </g>
            {/* gomitolo rosso di Martha */}
            <g transform="translate(975 1215)">
              <Glow id="bo-yg" x={0} y={0} r={130} t={t} color="#FF8A70" amp={0.1} rate={2} opacity={0.4 * intro} />
              <Yarn r={38} />
            </g>
            <path d="M940 1215 Q860 1250 760 1236 Q700 1226 660 1250" fill="none" stroke="#B8443A" strokeWidth="4" />
            {/* carte di Mikkel: si alzano a ventaglio e vengono risucchiate nella grotta */}
            <g transform={`translate(${lerp(830, CAVE.x, gone)} ${lerp(1150, CAVE.y + 60, gone) - Math.sin(gone * Math.PI) * 120}) scale(${lerp(0.8, 0.1, gone)}) rotate(${gone * 200})`} opacity={1 - seg(gone, 0.7, 1)}>
              <Glow id="bo-kg" x={0} y={0} r={200} t={t} color={YELLOW} amp={0.1} rate={2.4} opacity={0.5 * intro} />
              <Cards fan={0.3 + 0.7 * seg(t, cues[3], cues[4])} lift={gone * 40} />
            </g>
          </g>

          {/* PIANO 4 — tronchi e felci ai bordi, impermeabile su un ramo (1,25) */}
          <g transform={L(1.25)}>
            <path d="M-200 -200 H60 Q90 600 70 1100 Q60 1600 110 2200 H-200 Z" fill="url(#bo-trunk)" stroke={K} strokeWidth="10" />
            <path d="M1280 -200 H1010 Q980 700 1000 1300 Q1010 1700 980 2200 H1280 Z" fill="url(#bo-trunk)" stroke={K} strokeWidth="10" />
            <path d="M60 640 Q180 610 260 650" fill="none" stroke={K} strokeWidth="18" strokeLinecap="round" />
            <g transform="translate(210 636)">
              <Raincoat id="bo-rc" t={t} scale={0.55} wind={1} glow={0.25} />
            </g>
            {Array.from({ length: 7 }, (_, i) => {
              const x = [-60, 80, 220, 760, 900, 1040, 420][i], y = [1600, 1700, 1760, 1740, 1640, 1560, 1840][i];
              return (
                <g key={i} transform={`translate(${x} ${y}) rotate(${Math.sin(t * 1.2 + i) * 3})`}>
                  {[-50, -25, 0, 25, 50].map((a) => <path key={a} d="M0 0 Q30 -120 0 -240" fill="none" stroke="#1E3A2C" strokeWidth="26" strokeLinecap="round" transform={`rotate(${a})`} />)}
                </g>
              );
            })}
          </g>

          {/* PIANO 5 — foglie che cadono e particelle vicine (1,5–1,8) */}
          <g transform={L(1.5)}>
            <Flyers t={t} seed={8} n={7} shape="leaf" color="#5A6A3A" outline={K} speed={0.1 + quake * 0.15} />
          </g>
          <g transform={L(1.8)}>
            <NearMotes id="bo-near" t={t} color="#C9D8CC" n={6} vx={-30} vy={-6} opacity={0.08} />
          </g>
        </g>
      </g>

      <rect width="1080" height="1920" fill="#FFF6DA" opacity={flash * 0.35} />
      <Finish id="bo" tint={TINT} tintOpacity={0.12} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): oggetti illuminati cue1 · rombo, torce e grotta da cue3 · carte risucchiate cue4,
// lampo a cue4 + 0,3.
