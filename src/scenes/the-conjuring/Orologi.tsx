import React from 'react';
import { camera, eo, lerp, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { ConjDefs, GOLD, K, Ombra, Quadrante, TINT_NOTTE, oraVerso307 } from './Comuni';

// Le tre e sette: il soggiorno della fattoria di notte, con la luna dalla finestra. Su «tutti gli orologi si fermano» le
// lancette della pendola, dell'orologio da muro, di quello sul camino e della sveglia corrono e si bloccano tutte nello
// stesso istante alle 3:07, accendendosi d'oro (l'accento del film), e il pendolo resta fermo storto; su «si sveglia con
// strani lividi» la luce della finestra passa dalla luna all'alba grigia; su «il cane Sadie è morto» fuori dalla finestra
// la cuccia vuota con il collare a terra, la catena allentata. Nessuna persona.
// Piani: parete e finestra con il cortile (0,3) · pendola e mobili (0,6) · orologio da muro (0,55) · tenda e poltrona (1,2) · pulviscolo (1,6)

export const Orologi: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tStop = griglia(cues[0] + 2.4);
  const run = seg(t, 0, tStop);
  const stopped = t >= tStop ? 1 : 0;
  const h = (k: number) => (stopped ? 3 + 7 / 60 : oraVerso307(run, 1 + (50 - k * 6) / 60));
  const goldOn = eo(seg(t, tStop, tStop + 0.3));
  const tDawn = griglia(cues[1] + 0.3);
  const dawn = eo(seg(t, tDawn, tDawn + 2.4));
  const tDog = griglia(cues[2] + 0.4);
  const yard = eo(seg(t, tDog, tDog + 1.2));
  // pendolo: oscilla finché corre, poi resta fermo storto
  const swing = stopped ? 7 : Math.sin(t * Math.PI * 1.2) * 8;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="or" />
        <ConjDefs id="or" />
        <Lin id="or-wall" stops={[[0, '#1A2228'], [0.5, '#2A363A'], [1, '#141A1E']]} x2={1} y2={0} />
        <Lin id="or-sky" stops={[[0, lerpC('#0A1428', '#5A6470', dawn)], [1, lerpC('#2A3A5A', '#C8B8A0', dawn)]]} />
        <Lin id="or-floor" stops={[[0, '#3A2A1E'], [1, '#140E0A']]} />
        <pattern id="or-wp" width="90" height="120" patternUnits="userSpaceOnUse">
          <path d="M45 10 L55 30 L45 50 L35 30 Z" fill="#3E4A4A" opacity=".55" />
          <path d="M0 70 L10 90 L0 110 L-10 90 Z M90 70 L100 90 L90 110 L80 90 Z" fill="#3E4A4A" opacity=".55" />
        </pattern>
      </defs>
      <g transform={cam.transform}>
        {/* parete con la carta da parati e la finestra sul cortile */}
        <g transform={L(0.3)}>
          <rect x="-300" y="-200" width="1700" height="1500" fill="url(#or-wall)" />
          <rect x="-300" y="-200" width="1700" height="1500" fill="url(#or-wp)" />
          {/* la finestra: il cortile con la cuccia vuota */}
          <g>
            <rect x="620" y="640" width="340" height="440" fill="url(#or-sky)" />
            {dawn < 1 && <circle cx="880" cy="720" r="34" fill="#E8EEF2" opacity={1 - dawn} />}
            {dawn < 1 && <Glow id="or-moon" x={880} y={720} r={160} t={t} color="#C8D8E8" amp={0.04} rate={1} opacity={0.5 * (1 - dawn)} />}
            <path d="M620 960 Q760 930 960 950 V1080 H620 Z" fill={lerpC('#141C22', '#4A4E44', dawn)} />
            {/* la cuccia di legno e il collare a terra */}
            <g transform="translate(760 1010)">
              <path d="M-70 0 V-70 L0 -120 L70 -70 V0 Z" fill={lerpC('#2A2018', '#6A5038', dawn)} stroke={K} strokeWidth="6" />
              <path d="M-28 0 V-44 Q0 -70 28 -44 V0 Z" fill="#050505" />
              <path d="M-80 -66 L0 -128 L80 -66" stroke={K} strokeWidth="10" fill="none" />
              <path d={`M60 -30 Q110 ${-10 + 10 * yard} 150 20`} stroke="#8A8A86" strokeWidth="4" fill="none" strokeDasharray="8 5" />
              <ellipse cx="160" cy="24" rx="22" ry="9" fill="none" stroke="#8A2A22" strokeWidth="7" />
              <circle cx="176" cy="28" r="5" fill={GOLD} opacity={0.4 + 0.6 * yard} />
              {yard > 0 && <Glow id="or-col" x={160} y={24} r={60} t={t} color={GOLD} amp={0.1} rate={2} opacity={0.6 * yard} />}
            </g>
            <path d="M790 640 V1080 M620 860 H960" stroke="#E8E2D2" strokeWidth="12" />
            <rect x="620" y="640" width="340" height="440" fill="url(#or-glass)" />
            <rect x="606" y="626" width="368" height="468" fill="none" stroke="#C8C2B2" strokeWidth="16" />
            <rect x="598" y="618" width="384" height="484" fill="none" stroke={K} strokeWidth="6" />
            <path d="M590 1104 H990" stroke="#C8C2B2" strokeWidth="18" />
          </g>
          {/* la luce che entra dalla finestra e cade sul pavimento */}
          <path d="M620 1080 L960 1080 L800 1500 L300 1500 Z" fill={dawn > 0.5 ? '#E8D8C0' : '#B8C8E0'} opacity={0.08 + 0.05 * dawn} />
        </g>
        {/* l'orologio da muro sopra la credenza */}
        <g transform={L(0.55)}>
          <path d="M470 640 V660" stroke={K} strokeWidth="6" />
          <Quadrante id="or" x={470} y={760} r={92} h={h(1)} stopped={goldOn} roman />
        </g>
        {/* la pendola, la credenza con l'orologio da camino, la sveglia */}
        <g transform={L(0.6)}>
          <path d="M-300 1250 H1400 V1600 H-300 Z" fill="url(#or-floor)" />
          {/* pendola alta a sinistra */}
          <g transform="translate(210 1250) scale(.94)">
            <Ombra id="or" x={0} y={4} rx={150} ry={18} />
            <path d="M-100 0 V-480 H100 V0 Z" fill="url(#or-wood)" stroke={K} strokeWidth="9" />
            <path d="M-120 -480 H120 V-700 Q0 -760 -120 -700 Z" fill="url(#or-wood)" stroke={K} strokeWidth="9" />
            <rect x={-60} y={-440} width={120} height={360} fill="#140E0A" stroke={K} strokeWidth="6" />
            <rect x={-60} y={-440} width={120} height={360} fill="url(#or-glass)" />
            {/* pendolo */}
            <g transform={`translate(0 -440) rotate(${swing})`}>
              <path d="M0 0 V250" stroke="url(#or-brass)" strokeWidth="6" />
              <circle cx={0} cy={268} r={28} fill="url(#or-brass)" stroke={K} strokeWidth="5" />
            </g>
            <Quadrante id="or" x={0} y={-600} r={84} h={h(0)} stopped={goldOn} roman={false} />
            <path d="M-92 -470 V-10" stroke="#C89A5A" strokeWidth="4" opacity=".5" />
          </g>
          {/* credenza con l'orologio da camino */}
          <g transform="translate(470 1250)">
            <Ombra id="or" x={0} y={4} rx={200} ry={18} />
            <rect x={-170} y={-150} width={340} height={150} fill="url(#or-wood)" stroke={K} strokeWidth="8" />
            <path d="M-184 -150 H184" stroke={K} strokeWidth="14" />
            <rect x={-150} y={-130} width={140} height={110} fill="none" stroke={K} strokeWidth="4" opacity=".6" />
            <rect x={10} y={-130} width={140} height={110} fill="none" stroke={K} strokeWidth="4" opacity=".6" />
            <path d="M-90 -160 Q-90 -260 0 -270 Q90 -260 90 -160 Z" fill="url(#or-wood)" stroke={K} strokeWidth="7" />
            <Quadrante id="or" x={0} y={-205} r={50} h={h(2)} stopped={goldOn} />
            {/* una candela spenta e una cornice rovesciata */}
            <rect x={110} y={-220} width={20} height={64} fill="#E8E0C8" stroke={K} strokeWidth="4" />
            <path d="M120 -220 Q126 -236 120 -246" stroke="#8A8A86" strokeWidth="3" fill="none" />
            <path d="M-150 -158 L-100 -176 L-96 -160 Z" fill="#5A3E24" stroke={K} strokeWidth="4" />
          </g>
          {/* la sveglia sul davanzale */}
          <g transform="translate(870 1104)">
            <path d="M-34 0 L-44 16 M34 0 L44 16" stroke={K} strokeWidth="7" />
            <circle cx={-34} cy={-74} r={16} fill="url(#or-brass)" stroke={K} strokeWidth="4" />
            <circle cx={34} cy={-74} r={16} fill="url(#or-brass)" stroke={K} strokeWidth="4" />
            <Quadrante id="or" x={0} y={-36} r={44} h={h(3)} stopped={goldOn} face="#F2EEDC" />
          </g>
        </g>
        {/* primo piano: la tenda a destra, lo schienale di una poltrona e il tappeto */}
        <g transform={L(1.2)}>
          <path d="M1000 300 Q1060 800 1020 1500 H1300 V300 Z" fill="#3A2028" stroke={K} strokeWidth="10" />
          <path d="M1040 340 Q1090 800 1060 1480" stroke="#5A3038" strokeWidth="14" fill="none" />
          <path d="M-200 1300 Q-40 1220 120 1290 Q160 1450 120 1700 H-200 Z" fill="#4A3A2A" stroke={K} strokeWidth="10" />
          <path d="M-160 1310 Q-30 1250 90 1300" stroke="#7A6448" strokeWidth="6" fill="none" />
          <path d="M-300 1560 H1400 V2200 H-300 Z" fill="#1E140E" />
          <ellipse cx="560" cy="1700" rx="460" ry="90" fill="#5A2A22" stroke={K} strokeWidth="8" />
          <ellipse cx="560" cy="1700" rx="380" ry="66" fill="none" stroke="#C8A060" strokeWidth="5" opacity=".5" />
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 1080, x0: 640, x1: 940 }} bottom={{ y: 1480, x0: 320, x1: 780 }} seed={307} n={22} color={dawn > 0.5 ? '#F2E4C8' : '#C8D8E8'} boost={0.1} />
          <NearMotes id="or-near" t={t} color="#C8D8E8" n={5} y0={1100} opacity={0.06} />
        </g>
      </g>
      <Finish id="or" tint={TINT_NOTTE} tintOpacity={0.12} />
    </svg>
  );
};

/** Mescola due colori #RRGGBB. */
const lerpC = (a: string, b: string, p: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(lerp(v, pb[i], p)).toString(16).padStart(2, '0')).join('')}`;
};
