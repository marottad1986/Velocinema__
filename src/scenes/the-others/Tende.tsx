import React from 'react';
import { camera, eio, eo, lerp, seg } from '../../lib/anim';
import { Dust, Fog, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Chiavi, K, Lampada, OthersDefs, Ombra, Tenda } from './Comuni';

// Le tende sparite: la camera dei bambini al mattino. Al centro la grande finestra; ai lati i due lettini di ferro.
// Eventi: prima frase le tende di velluto svaniscono, restano il bastone e gli anelli che oscillano, e la luce del
// giorno invade la stanza; seconda frase i fasci di sole si allungano fino ai lettini (i bambini nella luce, che però
// non si fanno niente: le coperte restano in pace); terza frase il mazzo di chiavi della governante cade a terra
// (Grace caccia i domestici). Nessuna persona.
// Piani: giardino nella nebbia oltre la finestra (0,25) · parete e finestra (0,45) · fasci di sole (0,6)
//        · lettini (0,85) · comodino e chiavi a terra (1,15) · pulviscolo (1,5–1,8)

export const Tende: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const gone = eio(seg(t, cues[0] + 0.4, cues[0] + 1.4));
  const reach = eo(seg(t, cues[1] + 0.1, cues[1] + 1.4));
  const ringSwing = seg(t, cues[0] + 0.4, cues[0] + 0.8) * Math.exp(-Math.max(0, t - cues[0] - 0.8) * 0.8);
  const fall = seg(t, cues[2] + 0.4, cues[2] + 0.9);
  const bounce = t > cues[2] + 0.9 ? Math.abs(Math.sin((t - cues[2] - 0.9) * 9)) * 30 * Math.exp(-(t - cues[2] - 0.9) * 5) : 0;
  const keyY = lerp(1300, 1830, fall) - Math.sin(Math.PI * fall) * 260 - bounce;
  const keyX = lerp(1180, 760, fall);
  const light = 0.15 + 0.85 * gone;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="te" />
        <OthersDefs id="te" />
        <Lin id="te-out" stops={[[0, '#E2E8E0'], [0.6, '#C8D2CA'], [1, '#A8B4AC']]} />
        <Lin id="te-wall" stops={[[0, '#2A3430'], [0.4, '#4A5A50'], [0.8, '#5A6A5E'], [1, '#3A463E']]} />
        <Lin id="te-floor" stops={[[0, '#5A4430'], [0.5, '#3A2A1A'], [1, '#160E08']]} />
        <linearGradient id="te-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFBEA" stopOpacity=".7" />
          <stop offset=".7" stopColor="#FFF2C8" stopOpacity=".25" />
          <stop offset="1" stopColor="#FFF2C8" stopOpacity="0" />
        </linearGradient>
        <Lin id="te-sheet" stops={[[0, '#F2F0E6'], [1, '#B8BCB0']]} />
        <Lin id="te-iron" x2={1} y2={0} stops={[[0, '#1A1E20'], [0.5, '#6A7276'], [1, '#1A1E20']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — giardino di nebbia oltre la finestra (0,25) */}
        <g transform={L(0.25)}>
          <rect x="200" y="600" width="680" height="700" fill="url(#te-out)" />
          {[[300, 1000, 0.6], [520, 960, 0.45], [760, 1010, 0.55]].map(([x, y, o], i) => (
            <g key={i} opacity={o} stroke="#6A7670" strokeLinecap="round" fill="none">
              <path d={`M${x} 1260 V${y} l-50 -90 M${x} ${y + 60} l60 -110`} strokeWidth="14" />
            </g>
          ))}
          <Fog id="te-out1" t={t} y={1150} x={540} rx={400} ry={90} color="#FFFFFF" opacity={0.6} speed={0.2} drift={40} />
        </g>

        {/* PIANO 1 — parete, finestra con il bastone vuoto e gli anelli (0,45) */}
        <g transform={L(0.45)}>
          <path d="M-200 -200 H1280 V1300 H-200 Z M240 650 V1250 H840 V650 Z" fill="url(#te-wall)" fillRule="evenodd" />
          {Array.from({ length: 16 }, (_, i) => <rect key={i} x={-200 + i * 100} y="560" width="30" height="740" fill="#6A7A6A" opacity=".12" />)}
          <rect x="-200" y="-200" width="1480" height="1500" fill="#FFF6D8" opacity={0.18 * gone} />
          <path d="M240 950 H840 M440 650 V1250 M640 650 V1250 M240 800 H840 M240 1100 H840" stroke="#E8E2D2" strokeWidth="12" />
          <path d="M240 950 H840 M440 650 V1250 M640 650 V1250 M240 800 H840 M240 1100 H840" stroke={K} strokeWidth="3" opacity=".5" />
          <rect x="240" y="650" width="600" height="600" fill="none" stroke="#E8E2D2" strokeWidth="26" />
          <rect x="240" y="650" width="600" height="600" fill="none" stroke={K} strokeWidth="7" />
          <rect x="216" y="1246" width="648" height="28" fill="#D8D2C2" stroke={K} strokeWidth="6" />
          {/* le tende che svaniscono */}
          <g opacity={1 - gone}>
            <Tenda id="te" x={200} y={630} w={340} h={660} t={t} side="left" folds={5} />
            <Tenda id="te" x={540} y={630} w={340} h={660} t={t} side="right" folds={5} />
          </g>
          <rect x="180" y="610" width="720" height="18" rx="9" fill="url(#te-brass)" stroke={K} strokeWidth="5" />
          {[170, 910].map((x) => <circle key={x} cx={x} cy={619} r="20" fill="url(#te-brass)" stroke={K} strokeWidth="5" />)}
          {Array.from({ length: 14 }, (_, i) => (
            <g key={i} transform={`translate(${210 + i * 50} 619) rotate(${ringSwing * 30 * Math.sin(t * 7 + i)})`}>
              <circle cx="0" cy="10" r="13" fill="none" stroke={K} strokeWidth="8" />
              <circle cx="0" cy="10" r="13" fill="none" stroke="#D8B868" strokeWidth="4" />
            </g>
          ))}
          <Glow id="te-win" x={540} y={950} r={520} t={t} color="#FFF6D8" amp={0.03} rate={1} opacity={0.35 * gone} />
        </g>

        {/* PIANO 2 — pavimento e fasci di sole (0,6) */}
        <g transform={L(0.6)}>
          <path d="M-200 1300 H1280 V2200 H-200 Z" fill="url(#te-floor)" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-200 + i * 140} 1300 L${-1000 + i * 300} 2200`} stroke="#000" strokeWidth="4" opacity=".3" />)}
          <rect x="-200" y="1300" width="1480" height="900" fill="#FFE8B0" opacity={0.12 * gone} />
          <g opacity={gone}>
            <path d={`M250 660 L830 660 L${lerp(900, 1180, reach)} ${lerp(1500, 1900, reach)} L${lerp(180, -100, reach)} ${lerp(1500, 1900, reach)} Z`} fill="url(#te-beam)" />
            {[0, 1, 2].map((k) => (
              <path key={k} d={`M${440 + k * 0} 660 L${450} 660 L${lerp(500, 300 + k * 200, reach) + 30} ${lerp(1500, 1900, reach)} L${lerp(480, 260 + k * 200, reach)} ${lerp(1500, 1900, reach)} Z`} fill="#3A3020" opacity=".12" transform={`translate(${(k - 1) * 200} 0)`} />
            ))}
          </g>
        </g>

        {/* PIANO 3 — i due lettini di ferro con lenzuola e cuscini (0,85) */}
        <g transform={L(0.85)}>
          {[[-60, 1], [760, -1]].map(([bx, dir], i) => (
            <g key={i}>
              <Ombra id="te" x={bx + 190} y={1470} rx={260} ry={26} />
              {/* testiera di ferro */}
              <path d={`M${bx + (dir > 0 ? 40 : 340)} 1460 V1100 Q${bx + 190} ${1040} ${bx + (dir > 0 ? 340 : 40)} 1100 V1460`} stroke={K} strokeWidth="18" fill="none" />
              <path d={`M${bx + (dir > 0 ? 40 : 340)} 1460 V1100 Q${bx + 190} ${1040} ${bx + (dir > 0 ? 340 : 40)} 1100 V1460`} stroke="url(#te-iron)" strokeWidth="9" fill="none" />
              {[100, 160, 220, 280].map((x) => <path key={x} d={`M${bx + x} 1080 V1240`} stroke={K} strokeWidth="7" />)}
              {/* materasso e coperta */}
              <path d={`M${bx + 30} 1240 H${bx + 350} V1380 Q${bx + 190} 1400 ${bx + 30} 1380 Z`} fill="url(#te-sheet)" stroke={K} strokeWidth="8" />
              <path d={`M${bx + 30} 1300 H${bx + 350} V1420 Q${bx + 190} 1440 ${bx + 30} 1420 Z`} fill="#6A3A34" stroke={K} strokeWidth="8" />
              <path d={`M${bx + 40} 1316 H${bx + 340}`} stroke="#C88A7A" strokeWidth="5" opacity=".6" />
              {[0, 1, 2, 3].map((k) => <path key={k} d={`M${bx + 70 + k * 80} 1330 v80`} stroke="#4A2420" strokeWidth="4" />)}
              {/* cuscino */}
              <path d={`M${bx + 90} 1250 Q${bx + 80} 1200 ${bx + 130} 1196 H${bx + 250} Q${bx + 300} 1200 ${bx + 290} 1250 Q${bx + 190} 1262 ${bx + 90} 1250 Z`} fill="#F2F0E6" stroke={K} strokeWidth="6" />
              <path d={`M${bx + 120} 1216 Q${bx + 190} 1206 ${bx + 260} 1216`} stroke="#B8BCB0" strokeWidth="4" fill="none" />
              <rect x={bx + 30} y="1240" width="320" height="200" fill="#FFF2C8" opacity={0.3 * reach} />
            </g>
          ))}
        </g>

        {/* PIANO 4 — il comodino con la lampada spenta e il mazzo di chiavi che cade (1,15) */}
        <g transform={L(1.15)}>
          <g transform="translate(540 1560)">
            <Ombra id="te" x={0} y={250} rx={170} ry={20} />
            <rect x="-120" y="0" width="240" height="250" fill="url(#te-wood)" stroke={K} strokeWidth="8" />
            <rect x="-130" y="-20" width="260" height="30" rx="6" fill="url(#te-wood)" stroke={K} strokeWidth="7" />
            <rect x="-90" y="40" width="180" height="70" fill="none" stroke="#1E140C" strokeWidth="5" />
            <circle cx="0" cy="75" r="8" fill="url(#te-brass)" stroke={K} strokeWidth="3" />
          </g>
          <Lampada id="te" x={430} y={1544} t={t} s={0.5} lit={0} glow={0} />
          <g opacity={fall > 0 ? 1 : 0}><Ombra id="te" x={keyX + 10} y={1900} rx={90} ry={12} opacity={fall} /><Chiavi id="te" x={keyX} y={keyY} s={0.9} rot={lerp(-200, 160, fall)} /></g>
        </g>

        {/* PIANO 5 — pulviscolo nel sole (1,5–1,8) */}
        <g transform={L(1.2)} opacity={gone}>
          <Dust t={t} top={{ y: 680, x0: 260, x1: 820 }} bottom={{ y: 1500, x0: 120, x1: 960 }} seed={8} n={44} color="#FFF8E0" boost={0.2} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="te-near" t={t} color="#FFF4D8" n={7} opacity={0.08 + 0.06 * gone} />
        </g>
      </g>
      <rect width="1080" height="1920" fill="#000" opacity={0.35 * (1 - light)} />
      <Finish id="te" tint="#F2E2B0" tintOpacity={0.08} />
    </svg>
  );
};
