import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { DISPLAY, HAND } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Glow, NearMotes, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Cards, K, RED, Raincoat, TINT, Tower, YELLOW } from './Winden';

// Mikkel nel 1986: stanza d'ospedale anni '80 di notte. Piastrelle verdi, neon che sfarfalla, un letto vuoto con la
// coperta ripiegata; sul comodino il mazzo di carte e la cartella clinica «bambino sconosciuto»; sul cuscino la cuffietta
// da infermiera di Ines. Dalla finestra le torri della centrale. Nessuna persona.
// Eventi: il neon sfarfalla (cue 1) · la cuffietta si illumina (cue 2) · sulla cartella «sconosciuto» viene barrato e
//         scritto a mano «Michael» (cue 3) · sullo stipite compaiono i segni dell'altezza e poi, appeso, un piccolo
//         impermeabile giallo: il figlio (cue 4).
// Piani: parete di fondo e finestra (0,3) · letto e comodino (0,65) · pavimento a piastrelle (0,8) · stipite e tenda (1,2)
//        · pulviscolo e particelle (1,5–1,8)

export const Ospedale: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const flick = flashAt(t, [cues[1] + 0.2, cues[1] + 0.9], [1, 1]);
  const neon = 1 - 0.8 * flick;
  const cap = eo(seg(t, cues[2], cues[2] + 0.5));
  const strike = seg(t, cues[3], cues[3] + 0.4);
  const write = seg(t, cues[3] + 0.4, cues[3] + 1.4);
  const marks = [0, 1, 2, 3].map((k) => eo(seg(t, cues[4] + k * 0.3, cues[4] + 0.3 + k * 0.3)));
  const coat = eob(seg(t, cues[4] + 1.3, cues[4] + 1.9));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="os" />
        <Lin id="os-wall" stops={[[0, '#1E2A26'], [0.45, '#3A4E46'], [0.62, '#4E665C'], [1, '#2E3E38']]} />
        <Lin id="os-night" stops={[[0, '#0A1014'], [1, '#1E2A30']]} />
        <Lin id="os-tower" x2={1} y2={0} stops={[[0, '#5E6A66'], [1, '#2E3A36']]} />
        <Lin id="os-floor" stops={[[0, '#3A4640'], [1, '#141A18']]} />
        <Lin id="os-bed" x2={1} y2={0} stops={[[0, '#C9D0CC'], [0.6, '#E8ECE8'], [1, '#A8B0AC']]} />
        <Lin id="os-metal" x2={1} y2={0} stops={[[0, '#8A9490'], [0.5, '#C0C8C4'], [1, '#5E6864']]} />
        <Lin id="os-wood" x2={1} y2={0} stops={[[0, '#5A4632'], [0.5, '#7A6046'], [1, '#3E3022']]} />
        <Lin id="os-curtain" x2={1} y2={0} stops={[[0, '#6E8A7E'], [0.5, '#8EAA9C'], [1, '#4E6A5E']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete a piastrelle, finestra con la notte e le torri, neon (0,3) */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#os-wall)" />
          {Array.from({ length: 18 }, (_, i) => <path key={`h${i}`} d={`M-200 ${640 + i * 34} H1280`} stroke="#22302A" strokeWidth="2" opacity=".6" />)}
          {Array.from({ length: 26 }, (_, i) => <path key={`v${i}`} d={`M${-200 + i * 60} 640 V1250`} stroke="#22302A" strokeWidth="2" opacity=".6" />)}
          <path d="M-200 640 H1280" stroke="#5E7A6E" strokeWidth="10" />
          <rect x="560" y="660" width="300" height="260" fill="url(#os-night)" />
          <g transform="translate(680 900)"><Tower id="os-t1" t={t} w={130} h={200} fill="url(#os-tower)" steamOpacity={0.5} /></g>
          <g transform="translate(790 910)"><Tower id="os-t2" t={t + 2} w={100} h={150} fill="url(#os-tower)" steamOpacity={0.45} /></g>
          <rect x="560" y="660" width="300" height="260" fill="none" stroke={K} strokeWidth="12" />
          <path d="M710 660 V920 M560 790 H860" stroke={K} strokeWidth="8" />
          {/* neon a soffitto */}
          <rect x="260" y="610" width="320" height="22" rx="10" fill="#EAF6F0" opacity={0.4 + 0.6 * neon} stroke={K} strokeWidth="5" />
          <Glow id="os-neon" x={420} y={640} r={420} t={t} color="#DFF4EA" amp={0.03} rate={9} opacity={0.4 * neon} />
          {/* gancio per i cappotti, dove compare l'impermeabile del figlio */}
          <path d="M880 700 h40" stroke={K} strokeWidth="10" strokeLinecap="round" />
          <g transform={`translate(900 706) scale(${coat})`} opacity={seg(t, cues[4] + 1.3, cues[4] + 1.5)}>
            <Raincoat id="os-rc" t={t} scale={0.5} wind={0.3} glow={0.8} wet={false} />
          </g>
        </g>

        {/* PIANO 1 — letto vuoto con la cuffietta, comodino con carte e cartella (0,65) */}
        <g transform={L(0.65)}>
          <path d="M80 760 V1170 M80 900 H480" stroke="url(#os-metal)" strokeWidth="18" strokeLinecap="round" />
          <path d="M80 1000 H560 V1090 H80 Z" fill="url(#os-bed)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M90 960 Q100 920 180 920 H300 Q330 940 320 990 H96 Z" fill="#F4F6F2" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          <path d="M330 1000 Q360 960 560 970 V1000 Z" fill="#7E9A8E" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          <path d="M560 1000 V1170 M100 1090 V1170" stroke="url(#os-metal)" strokeWidth="14" />
          {/* cuffietta da infermiera sul cuscino */}
          <g transform="translate(210 925)">
            <Glow id="os-cg" x={0} y={0} r={150} t={t} color={YELLOW} amp={0.1} rate={2.4} opacity={0.5 * cap} />
            <path d="M-60 6 Q-50 -36 0 -40 Q50 -36 60 6 Q0 20 -60 6 Z" fill="#FFFFFF" stroke={K} strokeWidth="6" strokeLinejoin="round" />
            <path d="M-12 -22 h24 M0 -34 v24" stroke={RED} strokeWidth="7" />
          </g>
          {/* comodino */}
          <g transform="translate(800 1020)">
            <rect x="-120" y="0" width="240" height="190" fill="url(#os-wood)" stroke={K} strokeWidth="9" />
            <path d="M-120 70 H120" stroke={K} strokeWidth="6" />
            <circle cx="0" cy="40" r="8" fill={K} />
            {/* carte di Mikkel */}
            <g transform="translate(-60 -40) scale(.5)"><Cards fan={0.4} /></g>
            {/* cartella clinica: «bambino sconosciuto» barrato, poi «Michael» scritto a mano */}
            <g transform="translate(50 -70) rotate(4)">
              <path d="M-80 -20 V60 H80 V-20 Z" fill="#E9E3CC" stroke={K} strokeWidth="6" />
              <rect x="-80" y="-40" width="160" height="34" fill="#C9B88A" stroke={K} strokeWidth="5" />
              <path d="M-22 -48 h44 v14 h-44 Z" fill="#8A9490" stroke={K} strokeWidth="4" />
              <text x="-66" y="6" fontFamily={DISPLAY} fontWeight={800} fontSize="15" fill="#4A4438">BAMBINO</text>
              <text x="-66" y="26" fontFamily={DISPLAY} fontWeight={800} fontSize="15" fill="#4A4438">SCONOSCIUTO</text>
              <path d={`M-70 14 H${lerp(-70, 50, strike)}`} stroke={RED} strokeWidth="5" />
              <clipPath id="os-write"><rect x="-80" y="24" width={160 * write} height="40" /></clipPath>
              <text x="-64" y="56" fontFamily={HAND} fontWeight={700} fontSize="34" fill="#1E3A6E" clipPath="url(#os-write)">Michael</text>
            </g>
          </g>
        </g>

        {/* PIANO 2 — pavimento a piastrelle lucide con il riflesso del neon (0,8) */}
        <g transform={L(0.8)}>
          <path d="M-200 1200 H1280 V2200 H-200 Z" fill="url(#os-floor)" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-200 + i * 190} 1200 L${-600 + i * 290} 2200`} stroke="#22302A" strokeWidth="3" />)}
          {Array.from({ length: 6 }, (_, i) => <path key={`r${i}`} d={`M-200 ${1240 + i * i * 22 + i * 40} H1280`} stroke="#22302A" strokeWidth="3" />)}
          <ellipse cx="420" cy="1320" rx="260" ry="34" fill="#DFF4EA" opacity={0.12 * neon} />
          {/* asta della flebo e carrello dei medicinali */}
          <g transform="translate(640 1640)">
            <path d="M0 0 V-520 M-50 -500 H50" stroke="url(#os-metal)" strokeWidth="12" strokeLinecap="round" />
            <path d="M-34 -496 Q-50 -400 -20 -380 H10 Q30 -400 22 -496 Z" fill="#DCEFE8" opacity=".75" stroke={K} strokeWidth="5" />
            <path d="M-6 -380 Q-20 -200 40 -80" fill="none" stroke="#C9D8D2" strokeWidth="4" />
            <path d="M-70 0 L70 0 M-60 0 l-14 20 M60 0 l14 20" stroke={K} strokeWidth="9" strokeLinecap="round" />
          </g>
          <g transform="translate(250 1560)">
            <rect x="-170" y="-150" width="340" height="24" rx="6" fill="url(#os-metal)" stroke={K} strokeWidth="7" />
            <rect x="-170" y="-20" width="340" height="24" rx="6" fill="url(#os-metal)" stroke={K} strokeWidth="7" />
            <path d="M-160 -126 V60 M160 -126 V60" stroke={K} strokeWidth="9" />
            <circle cx="-150" cy="76" r="18" fill="#2A2E2C" stroke={K} strokeWidth="6" />
            <circle cx="150" cy="76" r="18" fill="#2A2E2C" stroke={K} strokeWidth="6" />
            {[-110, -40, 30].map((x, i) => <rect key={x} x={x} y={-200 + i * 6} width="40" height={50 - i * 6} rx="6" fill={['#C9D8E8', '#E8D8B0', '#D8E8D0'][i]} stroke={K} strokeWidth="5" />)}
            <path d="M60 -170 h70 v20 h-70 Z" fill="#E8E2D0" stroke={K} strokeWidth="5" />
          </g>
        </g>

        {/* PIANO 3 — stipite della porta con i segni dell'altezza, tenda divisoria (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 -200 H40 Q20 600 50 1300 L30 2200 H-200 Z" fill="url(#os-curtain)" stroke={K} strokeWidth="9" />
          {[-120, -40].map((x) => <path key={x} d={`M${x} -200 Q${x + 20 + Math.sin(t * 0.8) * 6} 900 ${x} 2200`} fill="none" stroke="#3E5A4E" strokeWidth="6" />)}
          <rect x="980" y="-200" width="300" height="2400" fill="url(#os-wood)" stroke={K} strokeWidth="10" />
          {marks.map((m, k) => (
            <g key={k} opacity={m} transform={`translate(${980 + (1 - m) * 10} ${1180 - k * 120})`}>
              <path d="M0 0 H50" stroke="#1E1A14" strokeWidth="6" />
              <text x="56" y="8" fontFamily={HAND} fontWeight={700} fontSize="28" fill="#F2E8D0">{['6', '10', '15', '20'][k]}</text>
            </g>
          ))}
        </g>

        {/* PIANO 4 — pulviscolo sotto il neon e particelle vicine (1,5–1,8) */}
        <g transform={L(0.5)}>
          <Dust t={t} top={{ y: 640, x0: 290, x1: 550 }} bottom={{ y: 1220, x0: 120, x1: 720 }} n={30} color="#DFF4EA" boost={0} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="os-near" t={t} color="#DFF4EA" n={5} vx={-20} vy={-6} opacity={0.07} />
        </g>
      </g>

      <Finish id="os" tint={TINT} tintOpacity={0.12} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): neon cue1+0,2 e +0,9 · cuffietta cue2 · cartella cue3 (barra) e cue3+0,4 (scritta)
// · segni dell'altezza da cue4 (0,3 s l'uno) · impermeabile cue4+1,3.
