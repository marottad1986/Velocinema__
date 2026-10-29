import React from 'react';
import { camera, eo, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes, SunRays, Wisps, WaveBand } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Diamond, K } from './Comuni';

// La ragazza del disegno: una casetta sul mare all'alba; un vecchio televisore acceso mostra il disegno ritrovato (solo il
// foglio con il diamante); su «chiama subito la nave» squilla e si alza la cornetta del telefono; su «comincia a
// raccontare» la luce si fa calda e il vapore del tè sale. Accanto un vaso di terracotta e una foto girata. Nessuna persona.
// Piani: parete e finestra sul mare (0,25) · mensola con foto e vaso (0,5) · televisore (0,7) · tavolino con telefono e tè (1,0) · tenda (1,25) · pulviscolo (1,6)

export const Rose: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const ring = t >= cues[1] && t < cues[1] + 0.9 ? Math.sin(t * 60) : 0; // il telefono squilla
  const lift = eo(seg(t, cues[1] + 0.9, cues[1] + 1.4)); // la cornetta si alza
  const warm = eo(seg(t, cues[2], cues[2] + 1.5)); // comincia il racconto

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ro" />
        <Lin id="ro-wall" stops={[[0, '#3A4A5A'], [0.6, '#5A5E66'], [1, '#2A2A30']]} />
        <Lin id="ro-dawn" stops={[[0, '#F2B8A0'], [0.6, '#F8DCC0'], [1, '#B8D0E0']]} />
        <Lin id="ro-screen" stops={[[0, '#2A4058'], [1, '#14202E']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ro-wall)" />
          {/* finestra sul mare all'alba */}
          <g>
            <rect x="580" y="540" width="420" height="380" fill="url(#ro-dawn)" />
            <circle cx="820" cy="780" r="50" fill="#FFE8C0" />
            <SunRays id="ro-rays" x={820} y={780} t={t} color="#FFE8C8" n={8} length={500} opacity={0.25} />
            <svg x="580" y="540" width="420" height="380" viewBox="0 0 420 380"><WaveBand t={t} y={300} fill="#7AA0C0" foam="#F4EEE2" amp={6} w={140} speed={20} bob={2} /></svg>
            <path d="M580 540 H1000 V920 H580 Z M790 540 V920 M580 730 H1000" fill="none" stroke="#E8E0D0" strokeWidth="16" />
          </g>
          <Glow id="ro-warm" x={540} y={900} r={700} t={t} color="#FFC890" amp={0.04} rate={1} opacity={0.15 + 0.25 * warm} />
        </g>
        {/* mensola con foto girata e vaso */}
        <g transform={L(0.5)}>
          <rect x="-120" y="800" width="400" height="20" fill="#6A4A30" stroke={K} strokeWidth="5" />
          <path d="M-60 820 L-20 860 M220 820 L180 860" stroke={K} strokeWidth="6" />
          <g transform="translate(-10 800)"><path d="M-50 0 Q-70 -80 -30 -120 H30 Q70 -80 50 0 Z" fill="#B8603A" stroke={K} strokeWidth="5" /><path d="M-40 -60 H40" stroke="#E8C8A0" strokeWidth="5" /></g>
          <g transform="translate(170 800)"><rect x="-60" y="-130" width="120" height="130" fill="#4A3426" stroke={K} strokeWidth="6" /><path d="M0 -20 L40 -90" stroke={K} strokeWidth="5" /></g>
        </g>
        {/* il vecchio televisore con il disegno ritrovato, sul suo mobile */}
        <g transform={L(1.0)}>
          <path d="M-200 1230 H1280 V2200 H-200 Z" fill="#3A2A20" />
          <rect x="200" y="1200" width="520" height="130" fill="#6A4A30" stroke={K} strokeWidth="7" />
          <path d="M460 1200 V1330 M240 1265 H420 M500 1265 H680" stroke="#4A3220" strokeWidth="6" />
          <rect x="230" y="840" width="460" height="360" rx="30" fill="#5A4430" stroke={K} strokeWidth="9" />
          <rect x="260" y="870" width="320" height="280" rx="40" fill="url(#ro-screen)" stroke={K} strokeWidth="6" />
          <g transform="translate(420 1010)">
            <rect x="-110" y="-110" width="220" height="200" fill="#E8DCC0" opacity=".9" transform="rotate(-3)" />
            <path d="M-80 -80 Q-40 -96 0 -84 M-80 60 Q0 40 80 70" stroke="#8A7A60" strokeWidth="4" fill="none" opacity=".6" />
            <Diamond x={0} y={-6} s={0.6} t={t} chain />
          </g>
          <rect x="260" y="870" width="320" height="280" rx="40" fill="#BFE4FF" opacity={0.08 + 0.04 * Math.sin(t * 25)} />
          <Glow id="ro-tv" x={420} y={1010} r={320} t={t} color="#9ED0FF" amp={0.08} rate={6} opacity={0.4} />
          {[0, 1].map((i) => <circle key={i} cx="635" cy={930 + i * 70} r="18" fill="#2A1E14" stroke={K} strokeWidth="4" />)}
          <path d="M330 840 L280 760 M510 840 L560 760" stroke={K} strokeWidth="6" />
        </g>
        {/* tavolino con il telefono e la tazza di tè (accento: il filo del telefono) */}
        <g transform={L(1.0)}>
          <rect x="740" y="1180" width="380" height="36" fill="#7A5434" stroke={K} strokeWidth="7" />
          <path d="M780 1216 V1330 M1080 1216 V1330" stroke={K} strokeWidth="12" />
          <g transform={`translate(940 1180) rotate(${ring * 4})`}>
            <path d="M-80 0 Q-80 -60 0 -60 Q80 -60 80 0 Z" fill="#1A1A1E" stroke={K} strokeWidth="6" />
            <circle cx="0" cy="-30" r="22" fill="#E8E0D0" stroke={K} strokeWidth="4" />
            <g transform={`translate(${130 * lift} ${-70 + 70 * lift - 90 * Math.sin(Math.PI * lift)}) rotate(${-25 * Math.sin(Math.PI * lift)})`}>
              <path d="M-80 0 Q-90 -24 -64 -26 H64 Q90 -24 80 0 Q60 10 40 0 H-40 Q-60 10 -80 0 Z" fill="#1A1A1E" stroke={K} strokeWidth="6" />
            </g>
            <path d={`M70 -20 Q140 ${20 - 40 * lift} ${130 * lift - 64} ${-70 + 70 * lift - 90 * Math.sin(Math.PI * lift)}`} stroke={P.accento} strokeWidth="5" fill="none" />
            {ring !== 0 && [0, 1, 2].map((i) => <path key={i} d={`M${-110 - i * 20} ${-60 - i * 10} q-10 20 0 40`} stroke="#F4EEE2" strokeWidth="5" fill="none" opacity=".8" />)}
          </g>
          <g transform="translate(800 1180)">
            <path d="M-36 0 V-50 H36 V0 Q0 14 -36 0 Z" fill="#F4EEE2" stroke={K} strokeWidth="5" />
            <path d="M36 -40 Q60 -40 56 -20 Q52 -6 36 -10" stroke={K} strokeWidth="5" fill="none" />
            <Wisps t={t} x={0} y={-56} color="#F4EEE2" n={3} h={120 + 60 * warm} width={30} />
          </g>
        </g>
        {/* tenda in primo piano */}
        <g transform={L(1.25)}>
          <path d="M-200 -200 H140 Q90 700 160 1400 Q100 1700 140 2200 H-200 Z" fill="#C8B8A0" stroke={K} strokeWidth="8" />
          <path d="M40 -200 Q0 700 70 1400" stroke="#A8987E" strokeWidth="12" fill="none" />
          <path d="M-200 1600 H1280 V2200 H-200 Z" fill="#2A1E16" opacity=".6" />
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 560, x0: 600, x1: 980 }} bottom={{ y: 1260, x0: 300, x1: 900 }} seed={8} n={22} color="#FFE2C0" boost={warm * 0.3} />
          <NearMotes id="ro-near" t={t} color="#FFE2C0" n={5} y0={1300} opacity={0.07} />
        </g>
      </g>
      <Finish id="ro" tint="#3A2A1E" tintOpacity={0.08} />
    </svg>
  );
};
