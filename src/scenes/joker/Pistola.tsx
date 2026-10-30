import React from 'react';
import { camera, eo, seg } from '../../lib/anim';
import { Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { K, Pistola as Gun, Scarpa } from './Comuni';

// La pistola sbagliata: sulla prima frase una pistola su una panchina dello spogliatoio, accanto a un sacchetto di carta
// (il «regalo» del collega); su «a una festa in un ospedale per bambini» il corridoio colorato con disegni e palloncini,
// un ukulele e una scarpa da clown, e la pistola che cade sul pavimento e scivola (accento: l'alone rosso); su «perde il
// lavoro» l'armadietto svuotato con la targhetta strappata. Nessuna persona.
// Piani: parete (0,25) · disegni e palloncini (0,5) · pavimento (0,8) · oggetti (1,05) · cornice della porta (1,3) · pulviscolo (1,6)

export const Pistola: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const ward = eo(seg(t, cues[1] - 0.2, cues[1] + 0.6)); // si passa all'ospedale
  const drop = seg(t, cues[1] + 1.2, cues[1] + 1.8); // la pistola cade
  const slide = eo(seg(t, cues[1] + 1.8, cues[1] + 2.6));
  const fired = eo(seg(t, cues[2] - 0.2, cues[2] + 0.8)); // l'armadietto svuotato

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pi" />
        <Lin id="pi-locker" stops={[[0, '#4A5A5A'], [1, '#2A3232']]} />
        <Lin id="pi-ward" stops={[[0, '#C8E0D8'], [1, '#8AB0A8']]} />
      </defs>
      <g transform={cam.transform}>
        {/* spogliatoio */}
        <g opacity={1 - ward}>
          <g transform={L(0.25)}>
            <rect x="-200" y="-200" width="1480" height="2400" fill="url(#pi-locker)" />
            {Array.from({ length: 6 }, (_, i) => <g key={i}><rect x={-120 + i * 200} y="560" width="180" height="620" fill="#5A6A6A" stroke={K} strokeWidth="6" /><path d={`M${-90 + i * 200} 620 h120 M${-90 + i * 200} 640 h120`} stroke="#3A4444" strokeWidth="5" /></g>)}
            <Glow id="pi-bulb" x={540} y={600} r={500} t={t} color="#F4F0C8" amp={0.06} rate={3} opacity={0.35} />
          </g>
          <g transform={L(1.05)}>
            <rect x="140" y="1180" width="800" height="40" fill="#8A6A44" stroke={K} strokeWidth="6" />
            <path d="M200 1220 V1300 M880 1220 V1300" stroke={K} strokeWidth="12" />
            <path d="M560 1180 L540 1060 H700 L680 1180 Z" fill="#C8A878" stroke={K} strokeWidth="5" />
            <Gun x={330} y={1150} s={1.1} rot={-6} />
          </g>
        </g>
        {/* corridoio dell'ospedale per bambini */}
        <g opacity={ward * (1 - fired)}>
          <g transform={L(0.25)}>
            <rect x="-200" y="-200" width="1480" height="2400" fill="url(#pi-ward)" />
            <path d="M-200 1000 H1280" stroke="#F2E6D0" strokeWidth="10" />
          </g>
          <g transform={L(0.5)}>
            {[[60, 760, '#E8B830'], [320, 720, '#4AA0D0'], [620, 780, '#E86A5A'], [900, 740, '#6AB85A']].map(([x, y, c], i) => (
              <g key={i}>
                <rect x={(x as number) - 90} y={(y as number) - 80} width="180" height="140" fill="#F8F4EC" stroke={K} strokeWidth="5" transform={`rotate(${(i % 2 ? 3 : -3)} ${x} ${y})`} />
                <circle cx={(x as number) - 30} cy={(y as number) - 20} r="26" fill={c as string} />
                <path d={`M${(x as number) - 60} ${(y as number) + 40} Q${x} ${(y as number) + 10} ${(x as number) + 60} ${(y as number) + 40}`} stroke="#3A6A3A" strokeWidth="6" fill="none" />
              </g>
            ))}
            {[[200, '#D2382E'], [260, '#E8B830'], [840, '#4AA0D0']].map(([x, c], i) => (
              <g key={i} transform={`translate(${x} ${650 + Math.sin(t * 1.4 + i) * 10})`}>
                <path d={`M0 40 Q${10 * Math.sin(t + i)} 160 0 320`} stroke="#F2E6D0" strokeWidth="3" fill="none" />
                <ellipse cx="0" cy="0" rx="40" ry="50" fill={c as string} stroke={K} strokeWidth="5" />
              </g>
            ))}
          </g>
          <g transform={L(0.8)}>
            <path d="M-200 1180 H1280 V2200 H-200 Z" fill="#D8D0C0" />
            {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-200 + i * 200} 1180 L${-400 + i * 260} 2200`} stroke="#B8B0A0" strokeWidth="4" />)}
          </g>
          <g transform={L(1.05)}>
            <g transform="translate(250 1160) rotate(-20)">
              <ellipse cx="0" cy="0" rx="70" ry="54" fill="#C88A4A" stroke={K} strokeWidth="5" />
              <circle cx="0" cy="0" r="16" fill="#3A2414" />
              <rect x="60" y="-10" width="160" height="20" fill="#8A5A2A" stroke={K} strokeWidth="4" />
            </g>
            <Scarpa x={820} y={1200} s={0.9} rot={4} />
            {/* la pistola che cade e scivola sul pavimento */}
            {drop > 0 && (
              <g transform={`translate(${520 + 140 * slide} ${900 + 280 * Math.min(1, drop) ** 2}) rotate(${-90 + 90 * Math.min(1, drop) + 200 * slide})`}>
                <Gun x={0} y={0} s={1} />
              </g>
            )}
            <Glow id="pi-alarm" x={600} y={1180} r={260} t={t} color={P.accento} amp={0.1} rate={4} opacity={0.5 * slide} />
          </g>
        </g>
        {/* l'armadietto svuotato */}
        <g opacity={fired}>
          <g transform={L(0.25)}>
            <rect x="-200" y="-200" width="1480" height="2400" fill="url(#pi-locker)" />
          </g>
          <g transform={L(0.8)}>
            <rect x="320" y="560" width="440" height="700" fill="#5A6A6A" stroke={K} strokeWidth="8" />
            <rect x="340" y="580" width="400" height="660" fill="#1A2020" />
            <path d="M360 640 H720" stroke="#8A9494" strokeWidth="8" />
            <path d="M540 640 V700 L520 720" stroke="#8A9494" strokeWidth="4" fill="none" />
            <g transform="translate(760 560) rotate(30) scale(1 1)"><rect x="0" y="0" width="30" height="680" fill="#6A7A7A" stroke={K} strokeWidth="6" /></g>
            <rect x="380" y="520" width="140" height="30" fill="#F2E6D0" stroke={K} strokeWidth="4" transform="rotate(-12 450 535)" />
            <path d="M-200 1260 H1280 V2200 H-200 Z" fill="#2A3232" />
          </g>
        </g>
        <g transform={L(1.3)}>
          <path d="M-200 -200 H60 V2200 H-200 Z M1280 -200 H1020 V2200 H1280 Z" fill="#2A2424" stroke={K} strokeWidth="9" />
        </g>
        <g transform={L(1.6)}>
          <NearMotes id="pi-near" t={t} color="#F4F0D8" n={5} opacity={0.07} />
        </g>
      </g>
      <Finish id="pi" tint="#2A2A1E" tintOpacity={0.1} />
    </svg>
  );
};
