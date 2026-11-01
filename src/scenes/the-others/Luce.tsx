import React from 'react';
import { camera, eio, eo, lerp, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Chiavi, K, Lampada, OthersDefs, Ombra, Porta, Tenda } from './Comuni';

// I bambini e la luce: un corridoio della villa in penombra. A sinistra l'alta finestra con le tende di velluto
// socchiuse: una lama di sole entra e cade sul pavimento (il pericolo). Al centro la consolle con la lampada a petrolio
// accesa, unica luce sicura; a destra la porta con la chiave nella serratura e il mazzo di chiavi appeso.
// Eventi: prima frase la lama di sole brilla con il pulviscolo; seconda frase le tende si chiudono e la luce sparisce,
// resta solo la lampada; terza frase la chiave gira nella serratura (un quarto di giro) e il mazzo appeso oscilla.
// Piani: parete e quadro (0,3) · finestra con le tende e porta (0,6) · lama di sole (0,7) · consolle con lampada (1,0)
//        · soldatino e bordo della tenda in primo piano (1,25) · pulviscolo (1,5–1,8)

export const Luce: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const close = eio(seg(t, cues[1] + 0.1, cues[1] + 1.4));
  const gap = lerp(70, 0, close);
  const sun = (1 - close) * (0.85 + 0.15 * eo(seg(t, 0, cues[0] + 1)));
  const turn = eio(seg(t, cues[2] + 0.4, cues[2] + 0.9));
  const swing = seg(t, cues[2] + 0.5, cues[2] + 0.7) * Math.exp(-Math.max(0, t - cues[2] - 0.6) * 1.2);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="lu" />
        <OthersDefs id="lu" />
        <Lin id="lu-wall" stops={[[0, '#141A18'], [0.35, '#24302A'], [0.65, '#2E3A32'], [1, '#1A221E']]} />
        <Lin id="lu-floor" stops={[[0, '#3A2A1C'], [0.5, '#24180E'], [1, '#100A06']]} />
        <Lin id="lu-sky" stops={[[0, '#FFFBE8'], [1, '#F2E2B0']]} />
        <linearGradient id="lu-beam" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF6D8" stopOpacity=".85" />
          <stop offset=".6" stopColor="#FFE8A8" stopOpacity=".3" />
          <stop offset="1" stopColor="#FFE8A8" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="lu-patch"><stop offset="0" stopColor="#FFF0C0" stopOpacity=".8" /><stop offset="1" stopColor="#FFF0C0" stopOpacity="0" /></radialGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete con la carta da parati, la boiserie e un paesaggio di mare incorniciato (0,3) */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#lu-wall)" />
          {Array.from({ length: 70 }, (_, i) => {
            const x = -160 + (i % 10) * 150 + (Math.floor(i / 10) % 2) * 75, y = 560 + Math.floor(i / 10) * 100;
            return y < 1060 && <path key={i} d={`M${x} ${y - 22} q16 22 0 44 q-16 -22 0 -44 Z M${x - 20} ${y} h40`} fill="#3E4E44" stroke="#3E4E44" strokeWidth="2" opacity=".5" />;
          })}
          <rect x="-200" y="1060" width="1480" height="200" fill="url(#lu-wood)" stroke={K} strokeWidth="6" />
          <path d="M-200 1064 H1280" stroke="#A07850" strokeWidth="4" opacity=".5" />
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-170 + i * 170} y="1090" width="130" height="140" fill="none" stroke="#1E140C" strokeWidth="5" />)}
          {/* quadro: mare in tempesta, nessuna persona */}
          <g transform="translate(525 800) scale(.55)">
            <rect x="-90" y="-70" width="180" height="140" fill={`url(#lu-brass)`} stroke={K} strokeWidth="6" />
            <rect x="-74" y="-54" width="148" height="108" fill="#4A5A5A" stroke={K} strokeWidth="3" />
            <path d="M-74 10 q20 -16 40 0 q20 -16 40 0 q20 -16 40 0 q12 -10 28 0 V54 H-74 Z" fill="#2A3A3E" />
            <path d="M-20 -8 l10 -30 l8 30 Z" fill="#E8E2D2" opacity=".8" />
          </g>
        </g>

        {/* PIANO 1 — finestra con il sole dietro, tende di velluto; la porta con la chiave (0,6) */}
        <g transform={L(0.6)}>
          {/* finestra */}
          <rect x="40" y="690" width="380" height="550" fill="url(#lu-sky)" />
          <path d="M230 690 V1240 M40 870 H420 M40 1060 H420" stroke="#6A6A5A" strokeWidth="10" />
          <rect x="40" y="690" width="380" height="550" fill="none" stroke="#5A4A3A" strokeWidth="26" />
          <rect x="40" y="690" width="380" height="550" fill="none" stroke={K} strokeWidth="6" />
          <rect x="16" y="1236" width="428" height="26" fill="#6A4A30" stroke={K} strokeWidth="6" />
          <rect x="20" y="670" width="420" height="570" fill="#000" opacity={0.5 * close} />
          {/* tende: si chiudono fino a toccarsi */}
          <Tenda id="lu" x={10} y={660} w={230 - gap / 2 - 10 + 12} h={620} t={t} side="left" sway={2} folds={5} />
          <Tenda id="lu" x={230 + gap / 2 - 12} y={660} w={460 - 230 - gap / 2 + 12} h={620} t={t} side="right" sway={2} folds={5} />
          {/* bastone e anelli */}
          <rect x="-10" y="646" width="480" height="18" rx="9" fill={`url(#lu-brass)`} stroke={K} strokeWidth="5" />
          {[-14, 474].map((x) => <circle key={x} cx={x} cy={655} r="18" fill={`url(#lu-brass)`} stroke={K} strokeWidth="5" />)}
          {/* porta */}
          <Porta id="lu" x={620} y={1250} w={300} h={560} turn={turn} />
          <Glow id="lu-key" x={874} y={1005} r={110} t={t} color="#FFD878" amp={0.1} rate={4} opacity={0.7 * seg(t, cues[2] + 0.3, cues[2] + 0.6) * (1 - 0.6 * seg(t, cues[2] + 1.6, cues[2] + 3))} />
          {/* gancio e mazzo di chiavi */}
          <circle cx="1000" cy="830" r="8" fill={`url(#lu-brass)`} stroke={K} strokeWidth="4" />
          <Chiavi id="lu" x={1000} y={860} s={0.8} swing={18 * swing} t={t * 3} />
        </g>

        {/* PIANO 2 — la lama di sole sul pavimento (0,7) */}
        <g transform={L(0.7)}>
          <path d="M-200 1250 H1280 V2200 H-200 Z" fill="url(#lu-floor)" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-200 + i * 140} 1250 L${-900 + i * 280} 2200`} stroke="#000" strokeWidth="4" opacity=".3" />)}
          {/* tappeto */}
          <path d="M260 1330 H900 L1040 1640 H120 Z" fill="#4A1E1A" stroke={K} strokeWidth="6" />
          <path d="M290 1350 H870 L990 1620 H170 Z" fill="none" stroke="#B08838" strokeWidth="5" opacity=".6" />
          <path d="M330 1380 H830 L930 1590 H230 Z" fill="none" stroke="#6A2A22" strokeWidth="10" />
          <g opacity={sun}>
            <path d={`M${230 - gap / 2} 700 L${230 + gap / 2} 700 L${560 + gap * 4} 1560 L${380 - gap} 1600 Z`} fill="url(#lu-beam)" />
            <ellipse cx={470} cy={1570} rx={60 + gap * 2.6} ry={40} fill="url(#lu-patch)" />
          </g>
        </g>

        {/* PIANO 3 — consolle con la lampada a petrolio accesa (1,0) */}
        <g transform={L(1.0)}>
          <Ombra id="lu" x={430} y={1300} rx={240} ry={22} />
          <rect x="230" y="1150" width="400" height="34" fill={`url(#lu-wood)`} stroke={K} strokeWidth="7" />
          <path d="M240 1154 H620" stroke="#B08860" strokeWidth="4" opacity=".6" />
          <path d="M250 1184 H610 V1220 Q430 1250 250 1220 Z" fill={`url(#lu-wood)`} stroke={K} strokeWidth="6" />
          {[270, 590].map((x) => <path key={x} d={`M${x} 1210 Q${x + (x < 400 ? -16 : 16)} 1260 ${x} 1310`} stroke={K} strokeWidth="16" fill="none" strokeLinecap="round" />)}
          <Lampada id="lu" x={500} y={1152} t={t} s={0.82} lit={1} glow={0.75 + 0.35 * close} ph={1.3} />
          {/* libro e occhiali sulla consolle */}
          <g transform="translate(330 1150)">
            <rect x="-56" y="-22" width="112" height="22" fill="#3A2A4A" stroke={K} strokeWidth="5" />
            <path d="M-50 -12 H50" stroke="#E8E2D2" strokeWidth="3" opacity=".6" />
            <rect x="-48" y="-40" width="100" height="18" fill="#5A2A22" stroke={K} strokeWidth="5" />
          </g>
        </g>

        {/* PIANO 4 — soldatino di legno a terra e bordo di una tenda in primo piano (1,25) */}
        <g transform={L(1.25)}>
          <g transform="translate(170 1700) rotate(-8)">
            <Ombra id="lu" x={0} y={6} rx={60} ry={10} />
            <rect x="-20" y="-90" width="40" height="60" fill="#B83A2E" stroke={K} strokeWidth="5" />
            <rect x="-18" y="-30" width="16" height="30" fill="#1E2A44" stroke={K} strokeWidth="4" />
            <rect x="2" y="-30" width="16" height="30" fill="#1E2A44" stroke={K} strokeWidth="4" />
            <circle cx="0" cy="-108" r="18" fill="#E8C8A0" stroke={K} strokeWidth="4" />
            <rect x="-16" y="-160" width="32" height="40" fill="#141414" stroke={K} strokeWidth="4" />
            <path d="M-20 -70 H20" stroke="#E8C878" strokeWidth="5" />
          </g>
          <Tenda id="lu" x={980} y={-100} w={200} h={2300} t={t} side="right" sway={6} folds={3} />
        </g>

        {/* PIANO 5 — pulviscolo nel sole e vicino alla camera (1,5–1,8) */}
        <g transform={L(1.1)} opacity={sun}>
          <Dust t={t} top={{ y: 720, x0: 200, x1: 270 }} bottom={{ y: 1500, x0: 380, x1: 600 }} seed={4} n={34} color="#FFF4D0" boost={0.3} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="lu-near" t={t} color="#E8D8B0" n={6} opacity={0.08} />
        </g>
      </g>
      <Finish id="lu" tint="#2A1E14" tintOpacity={0.13} />
    </svg>
  );
};
