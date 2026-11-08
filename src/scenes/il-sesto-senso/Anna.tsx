import React from 'react';
import { camera, eo, seg } from '../../lib/anim';
import { Dust, GlassDrops, Glow, NearMotes, Rain, Wisps } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Candela, K, Ombra, SestoDefs } from './Comuni';

// Una moglie lontana: la sala da pranzo dei Crowe la sera, con la pioggia sulla finestra. Il tavolo apparecchiato per
// due con le candele: un piatto servito e intatto, l'altro vuoto; sul mobile la foto incorniciata della chiesa delle
// nozze e una lampada; in un vaso un mazzo di fiori nuovi con un biglietto (l'altro uomo).
// Eventi: 1ª frase la pioggia si fa più fitta e la foto delle nozze resta in ombra; 2ª frase un riflesso fa brillare
// il biglietto tra i fiori; 3ª frase la candela dalla parte di Malcolm si spegne con un filo di fumo. Nessuna persona.
// Piani: parete e finestra con la pioggia (0,3) · mobile con la foto (0,5) · tavolo apparecchiato (0,7)
//        · schienali delle sedie in primo piano (1,2) · pulviscolo e gocce vicine (1,5–1,8)

export const Anna: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const rain = 0.55 + 0.45 * eo(seg(t, griglia(cues[0] + 0.3), griglia(cues[0] + 0.3) + 1.5));
  const card = seg(t, griglia(cues[1] + 0.8), griglia(cues[1] + 0.8) + 1.4);
  const out = griglia(cues[2] + 1.6);
  const lit2 = 1 - seg(t, out, out + 0.25);
  const smoke = seg(t, out, out + 0.3) * (1 - seg(t, out + 2.2, out + 3));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="an" />
        <SestoDefs id="an" />
        <Lin id="an-wall" stops={[[0, '#141A20'], [0.4, '#2A3036'], [0.7, '#3A3A38'], [1, '#22201C']]} />
        <Lin id="an-night" stops={[[0, '#0E1824'], [0.6, '#1E3044'], [1, '#2E4258']]} />
        <Lin id="an-floor" stops={[[0, '#2A1E16'], [1, '#080604']]} />
        <Lin id="an-cloth" stops={[[0, '#F0ECE2'], [0.5, '#D8D0C0'], [1, '#9A9282']]} />
        <Lin id="an-chair" x2={1} y2={0} stops={[[0, '#2A1A10'], [0.5, '#7A4E30'], [1, '#22140A']]} />
        <radialGradient id="an-plate" cx=".45" cy=".4" r=".7"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".7" stopColor="#E2E2DC" /><stop offset="1" stopColor="#A8A8A0" /></radialGradient>
        <linearGradient id="an-gleam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFF" stopOpacity="0" /><stop offset=".5" stopColor="#FFF" stopOpacity=".9" /><stop offset="1" stopColor="#FFF" stopOpacity="0" /></linearGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete con la boiserie e la finestra sulla strada bagnata (0,3) */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#an-wall)" />
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-160 + i * 170} y="1040" width="130" height="170" fill="none" stroke="#1A1814" strokeWidth="6" opacity=".6" />)}
          <path d="M-200 1010 H1280" stroke="#4A4238" strokeWidth="14" />
          <g>
            <rect x="590" y="620" width="360" height="400" fill="url(#an-night)" stroke={K} strokeWidth="9" />
            {/* lampioni e case di fronte, sfocati dalla pioggia */}
            <circle cx="680" cy="780" r="10" fill="#F2D490" />
            <Glow id="an-lamp1" x={680} y={780} r={70} t={t} color="#F2D490" amp={0.05} rate={3} opacity={0.6} />
            <path d="M590 900 H950 V1020 H590 Z" fill="#0A1018" />
            {[[620, 930], [700, 950], [820, 930], [890, 960]].map(([x, y], i) => <rect key={i} x={x} y={y} width="18" height="24" fill="#E8C878" opacity=".7" />)}
            <clipPath id="an-win"><rect x="590" y="620" width="360" height="400" /></clipPath>
            <g clipPath="url(#an-win)">
              <Rain t={t} level="far" seed={4} color="#9AB4CC" opacity={0.6 * rain} />
              <GlassDrops t={t} x={600} y={630} w={340} h={380} seed={9} n={Math.round(8 + 8 * rain)} color="#C8DCEC" />
            </g>
            <path d="M770 620 V1020 M590 820 H950" stroke="#3A3430" strokeWidth="12" />
            <rect x="590" y="620" width="360" height="400" fill="url(#an-glass)" />
            <rect x="590" y="620" width="360" height="400" fill="none" stroke={K} strokeWidth="9" />
            <rect x="570" y="1016" width="400" height="22" fill="#4A4238" stroke={K} strokeWidth="5" />
            {/* tende ai lati */}
            <path d="M560 600 H610 Q600 820 620 1040 H550 Q560 820 560 600 Z" fill="#5A4636" stroke={K} strokeWidth="6" />
            <path d="M930 600 H980 Q982 820 990 1040 H920 Q940 820 930 600 Z" fill="#5A4636" stroke={K} strokeWidth="6" />
          </g>
        </g>

        {/* PIANO 1 — il mobile con la lampada e la foto delle nozze (0,5) */}
        <g transform={L(0.5)}>
          <Glow id="an-lamp" x={140} y={820} r={300} t={t} color="#FFD08A" amp={0.04} rate={2} opacity={0.55} />
          <Ombra id="an" x={250} y={1200} rx={220} ry={20} />
          <rect x="40" y="980" width="420" height="220" fill="url(#an-wood)" stroke={K} strokeWidth="8" />
          <rect x="26" y="962" width="448" height="24" fill="#5A3E2A" stroke={K} strokeWidth="6" />
          <path d="M34 968 H466" stroke="#C89A6A" strokeWidth="4" opacity=".6" />
          {[60, 250].map((x) => <rect key={x} x={x} y="1010" width="180" height="160" fill="none" stroke="#24160C" strokeWidth="6" />)}
          {/* lampada con il paralume */}
          <path d="M140 962 V880" stroke={K} strokeWidth="10" />
          <path d="M100 962 H180 L170 940 H110 Z" fill="url(#an-brass)" stroke={K} strokeWidth="5" />
          <path d="M80 880 L110 790 H170 L200 880 Z" fill="#E8C888" stroke={K} strokeWidth="7" />
          <path d="M92 870 L116 800" stroke="#FFF2C8" strokeWidth="5" opacity=".7" />
          {/* la foto incorniciata della chiesa delle nozze (solo l'edificio e i fiori, nessuna persona) */}
          <g transform="translate(330 870) rotate(4)">
            <rect x="-80" y="-100" width="160" height="200" fill="url(#an-gold)" stroke={K} strokeWidth="6" />
            <rect x="-62" y="-82" width="124" height="164" fill="#C8C0AC" stroke={K} strokeWidth="3" />
            <path d="M-36 60 V-10 L0 -40 L36 -10 V60 Z" fill="#8A8478" stroke="#3A3428" strokeWidth="3" />
            <path d="M0 -40 V-62 M-8 -54 H8" stroke="#3A3428" strokeWidth="3" />
            <path d="M-10 60 V30 Q0 18 10 30 V60" fill="#5A2A22" />
            {[-40, -20, 20, 40].map((x, i) => <circle key={i} cx={x} cy={70} r="8" fill={['#F2F0E8', '#E8C0C8'][i % 2]} />)}
            <rect x="-62" y="-82" width="124" height="164" fill="#1A1E22" opacity=".25" />
            <rect x="-62" y="-82" width="124" height="164" fill="url(#an-glass)" />
            <path d="M-6 100 L-30 140 M6 100 L30 140" stroke={K} strokeWidth="5" />
          </g>
        </g>

        {/* PIANO 2 — il tavolo apparecchiato per due (0,7) */}
        <g transform={L(0.7)}>
          <path d="M-200 1210 H1280 V2200 H-200 Z" fill="url(#an-floor)" />
          <Ombra id="an" x={540} y={1420} rx={480} ry={40} />
          {/* gambe */}
          {[200, 880].map((x) => <path key={x} d={`M${x} 1300 L${x + (x < 500 ? -20 : 20)} 1440`} stroke={K} strokeWidth="26" strokeLinecap="round" />)}
          {/* tovaglia */}
          <path d="M110 1150 Q540 1100 970 1150 L1010 1310 Q540 1350 70 1310 Z" fill="url(#an-cloth)" stroke={K} strokeWidth="9" />
          <path d="M70 1310 Q540 1350 1010 1310 L1000 1340 Q540 1380 80 1340 Z" fill="#B8B0A0" stroke={K} strokeWidth="6" />
          {[200, 360, 720, 880].map((x) => <path key={x} d={`M${x} 1320 Q${x + 6} 1340 ${x} 1360`} stroke="#8A8272" strokeWidth="4" fill="none" />)}
          {/* posto di Anna (sinistra): piatto servito, intatto, posate allineate */}
          <ellipse cx="330" cy="1230" rx="110" ry="36" fill="url(#an-plate)" stroke={K} strokeWidth="6" />
          <ellipse cx="330" cy="1226" rx="62" ry="18" fill="#7A5A3A" stroke={K} strokeWidth="4" />
          <path d="M296 1222 q14 -10 30 0 M336 1220 q12 -8 24 2" stroke="#3A6A2A" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M200 1214 L190 1262 M462 1214 L472 1262" stroke="#C8CCD0" strokeWidth="6" strokeLinecap="round" />
          {/* posto di Malcolm (destra): piatto vuoto */}
          <ellipse cx="760" cy="1230" rx="110" ry="36" fill="url(#an-plate)" stroke={K} strokeWidth="6" />
          <ellipse cx="760" cy="1226" rx="62" ry="18" fill="none" stroke="#C8C8C0" strokeWidth="4" />
          <path d="M630 1214 L620 1262 M892 1214 L902 1262" stroke="#C8CCD0" strokeWidth="6" strokeLinecap="round" />
          {/* bicchieri */}
          {[[430, 1.0], [660, 0]].map(([x, full], i) => (
            <g key={i} transform={`translate(${x} 1200)`}>
              <path d="M-20 0 H20 M0 0 V-40" stroke={K} strokeWidth="6" />
              <path d="M-26 -40 Q-30 -100 -22 -110 H22 Q30 -100 26 -40 Q0 -28 -26 -40 Z" fill="url(#an-glass)" stroke={K} strokeWidth="5" />
              {full > 0 && <path d="M-27 -66 Q0 -58 27 -66 Q26 -44 0 -38 Q-26 -44 -27 -66 Z" fill="#8A1A1E" />}
              <path d="M-16 -96 V-56" stroke="#FFF" strokeWidth="4" opacity=".5" />
            </g>
          ))}
          {/* due candele al centro: quella dalla parte di Malcolm si spegne */}
          <Glow id="an-c1" x={500} y={1010} r={280} t={t} color="#FFD08A" amp={0.08} rate={8} opacity={0.7} />
          <Glow id="an-c2" x={590} y={1010} r={280} t={t} color="#FFD08A" amp={0.08} rate={8} ph={2} opacity={0.7 * lit2} />
          <Candela id="an" x={500} y={1186} t={t} h={150} ph={0.4} />
          <Candela id="an" x={590} y={1186} t={t} h={150} ph={2.1} lit={lit2} />
          {[500, 590].map((x) => <ellipse key={x} cx={x} cy="1190" rx="34" ry="10" fill="url(#an-brass)" stroke={K} strokeWidth="5" />)}
          <g opacity={smoke}><Wisps t={t - out} x={590} y={1020} color="#C8CCD0" n={2} h={220} width={5} opacity={0.75} /></g>
          {/* vaso con i fiori nuovi e il biglietto */}
          <g transform="translate(150 1180)">
            <Ombra id="an" x={0} y={8} rx={60} ry={10} />
            <path d="M-34 0 Q-48 -60 -26 -100 H26 Q48 -60 34 0 Z" fill="#3A5A6A" stroke={K} strokeWidth="6" />
            <path d="M-22 -86 Q-32 -50 -22 -16" stroke="#FFF" strokeWidth="4" opacity=".45" fill="none" />
            {[[-60, -190], [-20, -220], [24, -210], [60, -180], [-40, -150], [40, -150], [0, -170]].map(([x, y], i) => (
              <g key={i}>
                <path d={`M0 -100 Q${x * 0.5} ${(y - 100) / 2} ${x} ${y}`} stroke="#2A4A22" strokeWidth="5" fill="none" />
                <circle cx={x} cy={y} r="22" fill={i % 3 === 0 ? '#F2EEE4' : i % 3 === 1 ? '#E8B8C0' : '#F2D890'} stroke={K} strokeWidth="5" />
                <circle cx={x} cy={y} r="7" fill="#C89A3A" />
              </g>
            ))}
            {/* biglietto infilato tra i gambi */}
            <g transform="translate(46 -120) rotate(14)">
              <path d="M0 0 L-6 40" stroke="#2A4A22" strokeWidth="4" />
              <rect x="-30" y="-46" width="64" height="44" fill="url(#an-paper)" stroke={K} strokeWidth="4" />
              <path d="M-20 -32 H22 M-20 -20 H14" stroke="#5A5040" strokeWidth="3" />
              <clipPath id="an-cardclip"><rect x="-30" y="-46" width="64" height="44" /></clipPath>
              <g clipPath="url(#an-cardclip)"><rect x={-80 + 160 * card} y="-60" width="30" height="80" fill="url(#an-gleam)" transform="skewX(-20)" opacity={Math.sin(Math.PI * card)} /></g>
            </g>
          </g>
          <Glow id="an-card" x={190} y={1290} r={90} t={t} color="#FFF4D8" amp={0.05} rate={3} opacity={0.6 * Math.sin(Math.PI * card)} />
        </g>

        {/* PIANO 3 — schienali delle due sedie in primo piano (1,2) */}
        <g transform={L(1.2)}>
          {[[-60, 1440], [880, 1460]].map(([x, y], i) => (
            <g key={i}>
              <path d={`M${x} ${y} V2000 M${x + 240} ${y} V2000`} stroke={K} strokeWidth="40" />
              <path d={`M${x} ${y} V2000 M${x + 240} ${y} V2000`} stroke="url(#an-chair)" strokeWidth="26" />
              <path d={`M${x - 20} ${y} Q${x + 120} ${y - 60} ${x + 260} ${y}`} stroke={K} strokeWidth="48" fill="none" strokeLinecap="round" />
              <path d={`M${x - 20} ${y} Q${x + 120} ${y - 60} ${x + 260} ${y}`} stroke="url(#an-chair)" strokeWidth="34" fill="none" strokeLinecap="round" />
              {[0.33, 0.66].map((k) => <path key={k} d={`M${x + 240 * k} ${y - 20} V1900`} stroke="#2A1A10" strokeWidth="16" />)}
              <path d={`M${x - 10} ${y - 10} Q${x + 120} ${y - 64} ${x + 250} ${y - 10}`} stroke="#D8A070" strokeWidth="5" fill="none" opacity=".8" />
            </g>
          ))}
        </g>

        {/* PIANO 4 — pulviscolo nella luce delle candele e gocce vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 950, x0: 380, x1: 720 }} bottom={{ y: 1400, x0: 200, x1: 900 }} seed={6} n={18} color="#FFE0A8" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="an-near" t={t} color="#E8D8C0" n={5} opacity={0.08} />
        </g>
      </g>
      <Finish id="an" tint="#2E3640" tintOpacity={0.12} />
    </svg>
  );
};
