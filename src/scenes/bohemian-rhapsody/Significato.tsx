import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Dust, Glow, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { GOLD, K, TINT } from './Comune';

// Che cosa vuol dire? Camerino vuoto dopo il concerto: specchio con le lampadine intorno, un foglio con il testo pieno
// di cancellature, un punto interrogativo disegnato sullo specchio, un mazzo di fiori; dalla porta la luce del palco
// che si spegne; una giacca di scena appesa.
// Piani: parete (0,25) · porta e appendiabiti (0,45) · specchio con lampadine (0,55) · tavolo con foglio, fiori, matita (0,8)
//        · sedia e oggetti in primo piano (1,2) · pulviscolo (1,7)
// Eventi: cues[0] il punto interrogativo si disegna sullo specchio · cues[2] la giacca sull'appendiabiti oscilla
//         (l'addio a chi era) · cues[3] il cassetto si chiude piano · cues[4] le lampadine si spengono una a una,
//         resta acceso solo il punto interrogativo.

const r = rng(6161);
const BULBS = [
  ...Array.from({ length: 6 }, (_, i) => ({ x: 340 + i * 80, y: 610 })),
  ...Array.from({ length: 4 }, (_, i) => ({ x: 300, y: 680 + i * 100 })),
  ...Array.from({ length: 4 }, (_, i) => ({ x: 780, y: 680 + i * 100 })),
].map((b) => ({ ...b, ph: r() * 6, off: r() }));
const QMARK = 'M470 760 C470 690 610 680 610 760 C610 820 540 820 540 880 V910';

export const Significato: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c0 = cues[0] ?? 0.15, c2 = cues[2] ?? 6.5, c3 = cues[3] ?? 9.3, c4 = cues[4] ?? 12.7;
  const draw = eo(seg(t, c0 + 0.4, c0 + 2.4));
  const dot = eob(seg(t, c0 + 2.4, c0 + 2.7));
  const swingAmp = 10 * Math.exp(-Math.max(0, t - c2) * 0.5) * seg(t, c2, c2 + 0.2);
  const jacket = Math.sin((t - c2) * 3.2) * swingAmp;
  const drawer = eo(seg(t, c3, c3 + 1.2));
  const stage = 1 - 0.7 * eo(seg(t, c3, dur));
  const bulbOn = (i: number) => 1 - seg(t, c4 + BULBS[i].off * 0.9, c4 + BULBS[i].off * 0.9 + 0.1);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="si" />
        <Lin id="si-wall" stops={[[0, '#140C12'], [0.4, '#2A1820'], [0.75, '#3A2228'], [1, '#22121A']]} />
        <Lin id="si-mirror" x2={1} y2={1} stops={[[0, '#3A3446'], [0.45, '#262230'], [0.6, '#34303E'], [1, '#1E1A26']]} />
        <Lin id="si-table" stops={[[0, '#8A5A3E'], [0.3, '#5A3A28'], [1, '#2A1A10']]} />
        <Lin id="si-jacket" x2={1} y2={0} stops={[[0, '#5A0E22'], [0.5, '#A8203A'], [1, '#4A0A1A']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete con locandine sbiadite (calma in alto per il titolo) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1600" fill="url(#si-wall)" />
          <g opacity=".35">
            <rect x="880" y="660" width="140" height="190" rx="4" fill="#5A3A40" transform="rotate(4 950 755)" />
            <rect x="900" y="700" width="100" height="40" fill="#8A6A5A" transform="rotate(4 950 755)" />
          </g>
        </g>

        {/* PIANO 1 — porta socchiusa sul palco e appendiabiti con la giacca di scena */}
        <g transform={L(0.45)}>
          <rect x="-40" y="640" width="200" height="500" fill="#F2C870" opacity={0.25 + 0.45 * stage} />
          <Beam id="si-door" x={70} y={1120} t={t} length={500} spread={260} angle={-12} color="#FFD98A" opacity={0.3 * stage} />
          <rect x="-40" y="640" width="200" height="500" fill="none" stroke={K} strokeWidth="10" />
          <path d="M120 640 L170 660 V1130 L120 1140 Z" fill="#3A2418" stroke={K} strokeWidth="7" />
          {/* appendiabiti */}
          <path d="M960 1150 V620 M900 1150 H1020 M930 640 H990" stroke={K} strokeWidth="12" strokeLinecap="round" />
          <path d="M960 1150 V620" stroke="#6A4A3A" strokeWidth="5" />
          <g transform={`rotate(${jacket} 960 650)`}>
            <path d="M960 650 L960 670 M920 690 Q960 660 1000 690" stroke={K} strokeWidth="6" fill="none" />
            <path d="M905 700 Q960 670 1015 700 L1040 900 H1000 L995 960 H925 L920 900 H880 Z" fill="url(#si-jacket)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d="M960 690 V950" stroke={K} strokeWidth="5" />
            {[0, 1, 2].map((i) => <circle key={i} cx="975" cy={760 + i * 50} r="7" fill={GOLD} stroke={K} strokeWidth="3" />)}
            <path d="M915 720 L940 900 M1005 720 L980 900" stroke="#E06A7A" strokeWidth="3" opacity=".5" />
          </g>
        </g>

        {/* PIANO 2 — specchio con le lampadine e il punto interrogativo */}
        <g transform={L(0.55)}>
          <rect x="270" y="580" width="540" height="470" rx="18" fill="#3A2420" stroke={K} strokeWidth="10" />
          <rect x="320" y="640" width="440" height="370" rx="8" fill="url(#si-mirror)" stroke={K} strokeWidth="6" />
          <path d="M360 680 L440 680 L360 760 Z M700 960 L740 920 L740 960 Z" fill="#FFFFFF" opacity=".06" />
          {/* riflesso della luce della porta nello specchio */}
          <rect x="680" y="660" width="60" height="320" fill="#F2C870" opacity={0.12 * stage} />
          <Glow id="si-qg" x={540} y={800} r={200} t={t} color={GOLD} amp={0.1} rate={2.5} opacity={0.15 + 0.35 * draw} />
          <path d={QMARK} fill="none" stroke={GOLD} strokeWidth="18" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
          <circle cx="540" cy="960" r={13 * dot} fill={GOLD} />
          {BULBS.map((b, i) => {
            const on = bulbOn(i);
            return (
              <g key={i}>
                <Glow id={`si-b${i}`} x={b.x} y={b.y} r={70} t={t} color="#FFE7A0" amp={0.06} rate={2} ph={b.ph} opacity={0.55 * on} />
                <circle cx={b.x} cy={b.y} r="16" fill={on > 0.5 ? '#FFF3CF' : '#5A4A40'} stroke={K} strokeWidth="5" />
              </g>
            );
          })}
        </g>

        {/* PIANO 3 — tavolo con il foglio del testo, matita, fiori, cassetto */}
        <g transform={L(0.8)}>
          <rect x="-200" y="1300" width="1480" height="700" fill="#140A0E" />
          <path d="M100 1100 H980 L1010 1160 H70 Z" fill="url(#si-table)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <rect x="90" y="1160" width="900" height="200" fill="#4A2E1E" stroke={K} strokeWidth="9" />
          <path d="M110 1108 H970" stroke="#C89A6A" strokeWidth="4" opacity=".6" />
          {/* cassetto che si chiude */}
          <g transform={`translate(0 ${lerp(30, 0, drawer)})`}>
            <rect x="420" y="1190" width="240" height="90" rx="6" fill="#5A3A28" stroke={K} strokeWidth="7" />
            <rect x="510" y="1226" width="60" height="14" rx="6" fill={GOLD} stroke={K} strokeWidth="3" />
          </g>
          {/* foglio con il testo cancellato */}
          <g transform="translate(470 1120) rotate(-4)">
            <path d="M-130 -30 H130 L120 30 H-140 Z" fill="#F4ECDD" stroke={K} strokeWidth="5" strokeLinejoin="round" />
            {[0, 1, 2].map((j) => (
              <g key={j}>
                <path d={`M-110 ${-14 + j * 15} H${80 - j * 20}`} stroke="#5A4A4A" strokeWidth="3" />
                <path d={`M${-90 + j * 30} ${-16 + j * 15} H${-20 + j * 30}`} stroke="#8A1E3C" strokeWidth="5" />
              </g>
            ))}
          </g>
          <g transform="translate(680 1100) rotate(-20)">
            <rect x="-6" y="-80" width="12" height="80" fill="#E9B949" stroke={K} strokeWidth="4" />
            <path d="M-6 0 L0 14 L6 0 Z" fill="#E8D0B0" stroke={K} strokeWidth="3" />
          </g>
          {/* fiori nel vaso */}
          <g transform="translate(220 1100)">
            {[-30, -8, 16, 36].map((dx, i) => (
              <g key={i} transform={`rotate(${Math.sin(t * 0.8 + i) * 3} 0 -40)`}>
                <path d={`M0 -40 Q${dx / 2} -120 ${dx} -170`} stroke="#3A5A2E" strokeWidth="6" fill="none" />
                <circle cx={dx} cy={-176} r="20" fill={['#C8303A', '#F4ECDD', '#A8203A', '#E8B0B8'][i]} stroke={K} strokeWidth="5" />
              </g>
            ))}
            <path d="M-40 0 Q-50 -40 -30 -60 H30 Q50 -40 40 0 Z" fill="#6A8AA8" stroke={K} strokeWidth="7" />
          </g>
        </g>

        {/* PIANO 4 — schienale della sedia e boccetta in primo piano */}
        <g transform={L(1.2)}>
          <path d="M300 1500 Q300 1440 360 1440 H720 Q780 1440 780 1500 V2200 H300 Z" fill="#2A1A14" stroke={K} strokeWidth="10" />
          <path d="M340 1480 H740" stroke="#6A4A3A" strokeWidth="6" />
          <path d="M360 1560 H720 M360 1640 H720" stroke="#1A0E0A" strokeWidth="8" />
          <g transform="translate(900 1560)">
            <rect x="-40" y="-120" width="80" height="120" rx="14" fill="#B8C8D8" stroke={K} strokeWidth="7" opacity=".9" />
            <rect x="-20" y="-150" width="40" height="34" rx="4" fill={GOLD} stroke={K} strokeWidth="5" />
          </g>
        </g>

        {/* PIANO 5 — pulviscolo nella luce delle lampadine */}
        <g transform={L(1.7)}>
          <Dust t={t} top={{ y: 600, x0: 300, x1: 780 }} bottom={{ y: 1100, x0: 250, x1: 830 }} n={20} color="#FFF0C8" boost={-0.3 + 0.3 * (1 - seg(t, c4, c4 + 1))} />
          <NearMotes id="si-near" t={t} color="#FFE2C0" opacity={0.07} />
          {Array.from({ length: 5 }, (_, i) => {
            const p = mod(t * 0.1 + i / 5, 1);
            return <circle key={i} cx={540 + Math.sin(i * 2.1 + t * 0.5) * 120} cy={900 - p * 200} r={3} fill={GOLD} opacity={draw * Math.sin(p * Math.PI) * 0.7} />;
          })}
        </g>
      </g>

      <Finish id="si" tint={TINT} tintOpacity={0.12} />
    </svg>
  );
};
