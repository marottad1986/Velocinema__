import React from 'react';
import { camera, eo, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes, Wisps } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { TYPEWRITER } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { K, Palazzo, Tv } from './Comuni';

// La lettera della madre: un appartamento povero; una poltrona davanti alla televisione accesa, medicine sul tavolino e
// una tazza che fuma; su «scrive lettere a Thomas Wayne» una busta sul tavolo con l'indirizzo a macchina; su «l'uomo
// più ricco di Gotham» dalla finestra si illumina una grande villa lontana con un manifesto elettorale; su «Wayne sarebbe
// suo padre» la lettera si apre e una riga si sottolinea in rosso (accento). Nessuna persona.
// Piani: città dalla finestra (0,2) · parete e finestra (0,45) · poltrona e TV (0,75) · tavolino con la lettera (1,05) · tenda (1,3) · pulviscolo (1,6)

export const Madre: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const villa = eo(seg(t, cues[1], cues[1] + 1)); // la villa dei Wayne si illumina
  const open = eo(seg(t, cues[2], cues[2] + 0.8)); // la lettera si apre
  const line = eo(seg(t, cues[2] + 0.8, cues[2] + 1.8)); // la riga sottolineata

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="md" />
        <Lin id="md-wall" stops={[[0, '#5A6A50'], [1, '#3A4436']]} />
        <Lin id="md-night" stops={[[0, '#14182A'], [1, '#3A3448']]} />
      </defs>
      <g transform={cam.transform}>
        {/* la città dalla finestra e la villa lontana */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#md-night)" />
          <Palazzo x={560} y={1000} w={160} h={300} t={t} color="#2A2430" lit={0.4} fire={false} seed={2} />
          <g transform="translate(860 920)" opacity={0.4 + 0.6 * villa}>
            <path d="M-120 0 V-70 L0 -130 L120 -70 V0 Z" fill="#E8E0D0" stroke={K} strokeWidth="5" />
            {[-80, -40, 0, 40, 80].map((x) => <rect key={x} x={x - 10} y="-60" width="20" height="40" fill="#F2C46A" opacity={villa} />)}
            <Glow id="md-villa" x={0} y={-60} r={220} t={t} color="#F2C46A" amp={0.05} rate={1} opacity={0.5 * villa} />
          </g>
        </g>
        <g transform={L(0.45)}>
          <path d="M-200 -200 H1280 V2200 H-200 Z M540 560 V1000 H1000 V560 Z" fill="url(#md-wall)" fillRule="evenodd" />
          <path d="M540 560 H1000 V1000 H540 Z M770 560 V1000 M540 780 H1000" fill="none" stroke="#C8B898" strokeWidth="14" />
          <rect x="120" y="620" width="200" height="150" fill="#8A7A5A" stroke={K} strokeWidth="6" />
          <path d="M150 740 Q220 660 290 740" stroke="#5A4A30" strokeWidth="6" fill="none" />
        </g>
        {/* poltrona e televisione accesa */}
        <g transform={L(0.75)}>
          <path d="M-200 1140 H1280 V2200 H-200 Z" fill="#4A3A2A" />
          <Tv x={760} y={1060} s={0.75} glow={1}>
            <rect x="-160" y="-110" width="250" height="220" fill="#2A3A5A" />
            <path d="M-120 40 H40 V100 H-120 Z" fill="#5A2A2A" opacity=".8" />
            <circle cx="-40" cy="-30" r="30" fill="#F2C46A" opacity=".6" />
          </Tv>
          <Glow id="md-tv" x={720} y={1060} r={300} t={t} color="#9EC8FF" amp={0.1} rate={7} opacity={0.4} />
          <g transform="translate(200 1240)">
            <path d="M-170 0 V-220 Q-170 -300 -90 -300 H90 Q170 -300 170 -220 V0 Z" fill="#7A5A3A" stroke={K} strokeWidth="8" />
            <rect x="-210" y="-140" width="70" height="160" rx="26" fill="#8A6A44" stroke={K} strokeWidth="7" />
            <rect x="140" y="-140" width="70" height="160" rx="26" fill="#8A6A44" stroke={K} strokeWidth="7" />
            <rect x="-150" y="-90" width="300" height="90" rx="16" fill="#9A7A54" stroke={K} strokeWidth="7" />
            <path d="M-120 -200 Q0 -240 120 -200" stroke="#5A4028" strokeWidth="6" fill="none" />
          </g>
        </g>
        {/* tavolino: medicine, tazza, la lettera per Wayne */}
        <g transform={L(1.05)}>
          <rect x="300" y="1220" width="460" height="30" fill="#6A4A30" stroke={K} strokeWidth="6" />
          <path d="M340 1250 V1360 M720 1250 V1360" stroke={K} strokeWidth="12" />
          {[[340, '#E8E0D0'], [380, '#D2A040']].map(([x, c], i) => <rect key={i} x={x as number} y={1170} width="28" height="50" rx="6" fill={c as string} stroke={K} strokeWidth="4" />)}
          <g transform="translate(700 1220)"><path d="M-30 0 V-46 H30 V0 Z" fill="#F2E6D0" stroke={K} strokeWidth="4" /><Wisps t={t} x={0} y={-50} color="#F2E6D0" n={2} h={90} width={22} /></g>
          <g transform={`translate(540 ${1190 - 40 * open}) rotate(${-6 + 6 * open})`}>
            <rect x="-110" y="-60" width="220" height="120" fill="#F2EAD6" stroke={K} strokeWidth="5" />
            {open < 0.5 ? (
              <>
                <path d="M-110 -60 L0 10 L110 -60" fill="none" stroke={K} strokeWidth="4" />
                <text x="0" y="40" textAnchor="middle" fontFamily={TYPEWRITER} fontSize="20" fill={K}>Mr. Thomas Wayne</text>
              </>
            ) : (
              <>
                {[-36, -12, 12, 36].map((y) => <path key={y} d={`M-90 ${y} H90`} stroke="#8A7A60" strokeWidth="5" />)}
                <path d={`M-90 20 H${-90 + 180 * line}`} stroke={P.accento} strokeWidth="6" />
              </>
            )}
          </g>
          <Glow id="md-letter" x={540} y={1170} r={180} t={t} color="#FFF0D0" amp={0.06} rate={2} opacity={0.3 + 0.3 * line} />
        </g>
        <g transform={L(1.3)}>
          <path d="M1280 -200 H1000 Q1060 700 990 1400 Q1050 1700 1010 2200 H1280 Z" fill="#8A5A3A" stroke={K} strokeWidth="9" />
          <path d="M-200 1560 H1280 V2200 H-200 Z" fill="#2A2018" opacity=".7" />
        </g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 1000, x0: 620, x1: 880 }} bottom={{ y: 1280, x0: 300, x1: 900 }} seed={4} n={18} color="#D8E4FF" />
          <NearMotes id="md-near" t={t} color="#F2E6D0" n={5} opacity={0.07} />
        </g>
      </g>
      <Finish id="md" tint="#2A2A1E" tintOpacity={0.12} />
    </svg>
  );
};
