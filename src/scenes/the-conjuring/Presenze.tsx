import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { Buio, Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { ConjDefs, GOLD, K, Ombra, TINT_NOTTE } from './Comuni';

// Qualcosa nel buio: una cameretta delle bambine di notte, illuminata solo dal lume sul comodino (il `Buio` con la fiamma
// che trema). Su «tirata per i piedi nel letto» la coperta scivola giù dal fondo del letto, tirata da nulla, e il letto
// sobbalza; su «attirata da qualcosa che non vede» in fondo al corridoio, oltre la porta aperta, la porta della cantina si
// socchiude da sola con una lama di luce; su «resta chiusa al buio in cantina» la porta sbatte, la luce del corridoio si
// spegne e il lume quasi si spegne. Nessuna persona: le bambine si raccontano con le scarpine e il cuscino.
// Piani: parete e finestra (0,3) · corridoio oltre la porta (0,45) · letto, comodino, porta (0,7) · baule e tappeto (1,15) · polvere (1,6)

export const Presenze: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tPull = griglia(cues[0] + 2.2);
  const pull = eob(seg(t, tPull, tPull + 0.7), 0.8); // la coperta tirata giù
  const jolt = t > tPull && t < tPull + 0.6 ? Math.sin((t - tPull) * 40) * 6 * (1 - (t - tPull) / 0.6) : 0;
  const tLure = griglia(cues[1] + 0.4);
  const lure = eo(seg(t, tLure, tLure + 1.6)); // la porta della cantina si socchiude
  const tSlam = griglia(cues[2] + 0.5);
  const slam = seg(t, tSlam, tSlam + 0.15);
  const cellar = t < tSlam ? lure : 1 - slam;
  const hallOff = eo(seg(t, tSlam + 0.1, tSlam + 0.5));
  const lampDip = t > tSlam ? 1 - 0.55 * Math.sin(Math.PI * seg(t, tSlam, tSlam + 1.4)) : 1;
  const shake = t > tSlam && t < tSlam + 0.4 ? Math.sin(t * 70) * 3 : 0;
  // il lume sul comodino
  const LX = 170, LY = 960;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pr" />
        <ConjDefs id="pr" />
        <Lin id="pr-wall" stops={[[0, '#5A4048'], [0.6, '#6E5458'], [1, '#3A2A30']]} x2={1} y2={0} />
        <Lin id="pr-hall" stops={[[0, '#2A2420'], [1, '#4A3E30']]} />
        <Lin id="pr-quilt" stops={[[0, '#C86A5A'], [1, '#8A3A32']]} />
        <pattern id="pr-wp" width="80" height="100" patternUnits="userSpaceOnUse">
          <circle cx="40" cy="30" r="9" fill="#8A6A6E" opacity=".6" />
          <circle cx="0" cy="80" r="9" fill="#8A6A6E" opacity=".6" />
          <circle cx="80" cy="80" r="9" fill="#8A6A6E" opacity=".6" />
          <path d="M40 39 V60 M0 89 V100" stroke="#6A7A5A" strokeWidth="3" opacity=".6" />
        </pattern>
        <pattern id="pr-check" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="30" height="30" fill="#000" opacity=".12" />
          <rect x="30" y="30" width="30" height="30" fill="#000" opacity=".12" />
        </pattern>
      </defs>
      <g transform={`${cam.transform} translate(${shake} 0)`}>
        <g transform={L(0.3)}>
          <rect x="-300" y="-200" width="1700" height="1500" fill="url(#pr-wall)" />
          <rect x="-300" y="-200" width="1700" height="1500" fill="url(#pr-wp)" />
          <path d="M-300 1200 H1400" stroke="#2A1E1A" strokeWidth="30" />
          {/* un disegno di bambina appeso storto: una casa e un sole */}
          <g transform="translate(470 720) rotate(-5)">
            <rect x="-80" y="-60" width="160" height="120" fill="#F2EAD4" stroke={K} strokeWidth="5" />
            <path d="M-40 40 V0 L0 -30 L40 0 V40 Z" fill="none" stroke="#C83A2A" strokeWidth="5" />
            <circle cx="50" cy="-30" r="14" fill="none" stroke="#E8B030" strokeWidth="5" />
            <circle cx="0" cy="-60" r="5" fill="#8A8A86" />
          </g>
        </g>
        {/* il corridoio oltre la porta, fino alla porta della cantina in fondo */}
        <g transform={L(0.45)}>
          <rect x="720" y="600" width="250" height="600" fill="url(#pr-hall)" />
          <path d="M720 600 L800 700 V1080 L720 1200 Z" fill="#1E1A16" />
          <path d="M970 600 L890 700 V1080 L970 1200 Z" fill="#2A241E" />
          <path d="M720 1200 L800 1080 H890 L970 1200 Z" fill="#3A2E22" />
          {/* la porta della cantina in fondo: si socchiude con una lama di luce fredda, poi sbatte */}
          <rect x="806" y="760" width="78" height="320" fill="#050607" />
          {cellar > 0.02 && <rect x="806" y="760" width={78 * cellar * 0.6} height="320" fill="#9FC0D8" opacity={0.5 * (1 - hallOff * 0.3)} />}
          <g transform={`translate(884 760) scale(${-(1 - cellar * 0.6)} 1)`}>
            <rect x="0" y="0" width="78" height="320" fill="#5A4636" stroke={K} strokeWidth="5" />
            <circle cx="66" cy="170" r="5" fill="#B8A070" />
          </g>
          {/* la lampadina del corridoio */}
          <circle cx="845" cy="690" r="9" fill={hallOff > 0.5 ? '#3A3A36' : '#FFE8B0'} />
          <Glow id="pr-hl" x={845} y={700} r={170} t={t} color="#FFD890" amp={0.04} rate={4} opacity={0.5 * (1 - hallOff)} />
        </g>
        {/* letto, comodino con il lume, la porta della camera */}
        <g transform={L(0.7)}>
          {/* stipite e anta della porta della camera, aperta verso l'interno */}
          <path d="M700 590 H990 V1210 H700 Z" fill="none" stroke="#C8B8A0" strokeWidth="22" />
          <path d="M700 590 H990 V1210 H700 Z" fill="none" stroke={K} strokeWidth="6" />
          <path d="M700 600 L610 640 V1240 L700 1200 Z" fill="url(#pr-wood)" stroke={K} strokeWidth="7" />
          <circle cx="628" cy="930" r="9" fill="#C8A060" stroke={K} strokeWidth="3" />
          {/* il letto in ferro con la coperta */}
          <g transform={`translate(0 ${jolt})`}>
            <Ombra id="pr" x={350} y={1260} rx={300} ry={26} />
            <path d="M80 860 V1250 M100 860 V1250" stroke="#D8D0C0" strokeWidth="10" />
            <path d="M80 860 Q90 800 140 820 H140 V1100" stroke="#D8D0C0" strokeWidth="10" fill="none" />
            {/* materasso e cuscino */}
            <path d="M100 1100 H600 V1170 H100 Z" fill="#E8E2D2" stroke={K} strokeWidth="7" />
            <path d="M110 1040 Q140 1010 220 1020 Q250 1050 230 1090 H120 Q100 1070 110 1040 Z" fill="#F2EEE2" stroke={K} strokeWidth="6" />
            {/* la coperta: tirata giù dal fondo del letto */}
            <g transform={`translate(${lerp(0, 120, pull)} ${lerp(0, 150, pull)}) rotate(${lerp(0, 22, pull)} 560 1110)`}>
              <path d="M220 1090 Q380 1060 590 1080 Q620 1130 600 1200 Q420 1230 230 1190 Q210 1140 220 1090 Z" fill="url(#pr-quilt)" stroke={K} strokeWidth="7" />
              <rect x="230" y="1086" width="370" height="110" fill="url(#pr-check)" />
              <path d="M240 1100 Q400 1074 580 1092" stroke="#F2B8A8" strokeWidth="5" fill="none" opacity=".6" />
            </g>
            {/* pediera del letto */}
            <path d="M600 980 V1250 M620 980 V1250" stroke="#D8D0C0" strokeWidth="10" />
            <path d="M600 990 H620 M600 1060 H620" stroke="#D8D0C0" strokeWidth="8" />
            <circle cx="610" cy="975" r="12" fill="url(#pr-brass)" stroke={K} strokeWidth="4" />
          </g>
          {/* le scarpine sotto il letto */}
          <g transform="translate(330 1230)">
            <path d="M-60 0 Q-60 -26 -30 -28 H0 Q10 -14 6 0 Z M10 0 Q10 -26 40 -28 H70 Q80 -14 76 0 Z" fill="#C83A3A" stroke={K} strokeWidth="5" />
            <path d="M-46 -18 H-10 M24 -18 H60" stroke={K} strokeWidth="4" />
          </g>
          {/* comodino e lume a petrolio */}
          <g transform="translate(170 1250)">
            <rect x="-70" y="-230" width="140" height="230" fill="url(#pr-wood)" stroke={K} strokeWidth="7" />
            <path d="M-80 -230 H80" stroke={K} strokeWidth="12" />
            <rect x="-50" y="-190" width="100" height="70" fill="none" stroke={K} strokeWidth="4" opacity=".6" />
          </g>
          <g transform={`translate(${LX} 1020)`}>
            <path d="M-30 0 Q-40 -30 -20 -50 H20 Q40 -30 30 0 Z" fill="#7A5A2A" stroke={K} strokeWidth="5" />
            <path d="M-14 -50 Q-30 -80 -12 -110 V-130 H12 V-110 Q30 -80 14 -50 Z" fill="#FFFFFF" opacity=".25" stroke={K} strokeWidth="4" />
            <path d={`M-7 -62 Q-7 -80 ${Math.sin(t * 7) * 2} ${-92 - 4 * Math.sin(t * 11)} Q7 -80 7 -62 Z`} fill="url(#pr-flame)" opacity={lampDip} />
          </g>
          <Glow id="pr-lamp" x={LX} y={LY} r={300} t={t} color={GOLD} amp={0.06} rate={9} opacity={0.5 * lampDip} />
        </g>
        {/* primo piano: un baule di giocattoli e il bordo del tappeto */}
        <g transform={L(1.15)}>
          <path d="M-300 1260 H1400 V2200 H-300 Z" fill="#2A1E16" />
          {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M-300 ${1300 + i * 70} H1400`} stroke="#1A120C" strokeWidth="4" />)}
          <ellipse cx="560" cy="1640" rx="520" ry="110" fill="#3A4A5A" stroke={K} strokeWidth="8" />
          <ellipse cx="560" cy="1640" rx="440" ry="84" fill="none" stroke="#C8B890" strokeWidth="5" opacity=".4" />
          <g transform="translate(900 1420)">
            <rect x="-180" y="-150" width="360" height="200" fill="url(#pr-wood)" stroke={K} strokeWidth="9" />
            <path d="M-190 -150 Q0 -210 190 -150" fill="#5A3E24" stroke={K} strokeWidth="8" />
            <rect x="-24" y="-130" width="48" height="40" fill="url(#pr-brass)" stroke={K} strokeWidth="4" />
          </g>
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 900, x0: 120, x1: 220 }} bottom={{ y: 1300, x0: 40, x1: 420 }} seed={34} n={18} color="#FFE6B0" boost={0.15} />
        </g>
        {/* il buio della notte: si vede solo intorno al lume, nel corridoio e nella lama della cantina */}
        <Buio id="pr-b" t={t} darkness={0.86} flicker={0.18} tint="#FFC870" tintOpacity={0.08}
          lights={[
            { x: LX + 120, y: LY + 120, r: 620, power: 0.95 * lampDip },
            { x: 845, y: 900, r: 380, power: 0.85 * (1 - hallOff) },
            { x: 845, y: 920, r: 200, power: 0.6 * cellar },
          ]} />
        <g transform={L(1.6)}>
          <NearMotes id="pr-near" t={t} color="#C8D8E8" n={5} y0={1100} opacity={0.06} />
        </g>
      </g>
      <Finish id="pr" tint={TINT_NOTTE} tintOpacity={0.1} />
    </svg>
  );
};
