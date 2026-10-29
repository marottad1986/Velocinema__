import React from 'react';
import { camera, eio, eo, seg } from '../../lib/anim';
import { Confetti, Dust, Glow, NearMotes, Notes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { K } from './Comuni';

// La festa in terza classe: sulla prima frase («a cena i ricchi lo prendono in giro») lo scalone di prima classe con la
// cupola di vetro e la tavola apparecchiata, freddo e dorato; su «ma Jack porta Rose alla festa» si passa alla sala di
// terza classe: violino, fisarmonica e tamburo appoggiati, boccali che tintinnano, lanterne che dondolano; su «non si è
// mai sentita così libera» coriandoli e note. Nessuna persona.
// Piani: parete e cupola / travi (0,25) · scalone / lanterne (0,5) · tavola / strumenti (0,8) · bicchieri e boccali (1,1) · coriandoli (1,6)

export const Festa: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const party = eio(seg(t, cues[1] - 0.2, cues[1] + 0.8)); // dalla prima classe alla festa
  const free = eo(seg(t, cues[2], cues[2] + 1)); // «così libera»
  const swing = Math.sin(t * 3) * 8 * (1 + free);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fe" />
        <Lin id="fe-gold" stops={[[0, '#2A2418'], [0.5, '#5A4A2A'], [1, '#2A2014']]} />
        <Lin id="fe-pub" stops={[[0, '#3A2414'], [0.5, '#6A4428'], [1, '#2A180E']]} />
      </defs>
      <g transform={cam.transform}>
        {/* prima classe: lo scalone sotto la cupola */}
        <g opacity={1 - party}>
          <g transform={L(0.25)}>
            <rect x="-200" y="-200" width="1480" height="2400" fill="url(#fe-gold)" />
            <path d="M240 700 Q540 420 840 700 Z" fill="#CFE0E8" stroke="#C9A24A" strokeWidth="10" />
            {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M540 470 L${240 + i * 100} 700`} stroke="#C9A24A" strokeWidth="5" />)}
            <Glow id="fe-dome" x={540} y={620} r={420} t={t} color="#F4EAD2" amp={0.03} rate={1} opacity={0.4} />
          </g>
          <g transform={L(0.5)}>
            <path d="M300 1240 L420 860 H660 L780 1240 Z" fill="#6A4428" stroke={K} strokeWidth="8" />
            {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${420 - i * 13} ${860 + i * 42} H${660 + i * 13}`} stroke="#3A2414" strokeWidth="5" />)}
            <path d="M420 860 L300 1240 M660 860 L780 1240" stroke="#C9A24A" strokeWidth="10" />
            <g transform="translate(540 820)"><circle r="44" fill="#F4EAD2" stroke="#C9A24A" strokeWidth="8" /><path d="M0 0 V-28 M0 0 L20 10" stroke={K} strokeWidth="5" /></g>
          </g>
          <g transform={L(0.8)}>
            <rect x="-100" y="1180" width="1280" height="70" fill="#F4EEE2" stroke={K} strokeWidth="7" />
            {[120, 360, 720, 960].map((x) => <g key={x}><path d={`M${x - 20} 1180 L${x} 1110 L${x + 20} 1180`} fill="none" stroke="#C9D8E0" strokeWidth="5" /><ellipse cx={x} cy="1180" rx="40" ry="8" fill="#E8E0D0" stroke={K} strokeWidth="3" /></g>)}
            {[240, 840].map((x) => <g key={x}><path d={`M${x} 1180 V1080`} stroke="#C9A24A" strokeWidth="8" /><Glow id={`fe-c${x}`} x={x} y={1070} r={90} t={t} color="#FFE2A0" amp={0.12} rate={6} opacity={0.6} /><ellipse cx={x} cy="1068" rx="8" ry="14" fill="#FFE8B0" /></g>)}
          </g>
        </g>
        {/* terza classe: la festa */}
        <g opacity={party}>
          <g transform={L(0.25)}>
            <rect x="-200" y="-200" width="1480" height="2400" fill="url(#fe-pub)" />
            {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-200} y={560 + i * 6} width="1480" height="2" fill="#2A180E" />)}
            {[-100, 260, 620, 980].map((x) => <rect key={x} x={x} y="540" width="60" height="1400" fill="#2A180E" opacity=".6" />)}
            <rect x="-200" y="520" width="1480" height="50" fill="#2A180E" stroke={K} strokeWidth="6" />
          </g>
          <g transform={L(0.5)}>
            {[200, 540, 880].map((x, i) => (
              <g key={x} transform={`rotate(${swing * (i % 2 ? -1 : 1)} ${x} 570)`}>
                <path d={`M${x} 570 V650`} stroke={K} strokeWidth="4" />
                <path d={`M${x - 26} 650 H${x + 26} L${x + 20} 710 H${x - 20} Z`} fill="#FFD890" stroke={K} strokeWidth="5" />
                <Glow id={`fe-l${i}`} x={x} y={680} r={240} t={t} color="#FFC870" amp={0.1} rate={4 + i} opacity={0.55} />
              </g>
            ))}
          </g>
          <g transform={L(0.8)}>
            {/* tamburo, fisarmonica, violino */}
            <g transform="translate(240 1110)"><ellipse cx="0" cy="0" rx="110" ry="36" fill="#E8D8B0" stroke={K} strokeWidth="6" /><path d="M-110 0 V90 Q0 130 110 90 V0" fill="#A8402A" stroke={K} strokeWidth="6" /><path d="M-100 30 L-40 110 L20 30 L80 110" stroke="#E8C030" strokeWidth="5" fill="none" /></g>
            <g transform={`translate(560 1140) scale(${1 + 0.06 * Math.sin(t * 6) * free} 1)`}>
              <rect x="-50" y="-80" width="30" height="140" fill="#2A2A2A" stroke={K} strokeWidth="5" />
              {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${-20 + i * 14} -80 L${-20 + i * 14 + 7} 60`} stroke="#C8402A" strokeWidth="10" />)}
              <rect x="64" y="-80" width="30" height="140" fill="#2A2A2A" stroke={K} strokeWidth="5" />
            </g>
            <g transform="translate(850 1090) rotate(-30)">
              <path d="M-40 -90 Q-60 -60 -40 -30 Q-64 0 -40 40 Q0 60 40 40 Q64 0 40 -30 Q60 -60 40 -90 Q0 -110 -40 -90 Z" fill="#B8642A" stroke={K} strokeWidth="5" />
              <rect x="-8" y="-210" width="16" height="130" fill="#3A2414" stroke={K} strokeWidth="4" />
              <path d="M-16 -20 Q0 -14 16 -20 M-16 10 Q0 16 16 10" stroke={K} strokeWidth="4" fill="none" />
            </g>
            <path d="M720 1000 L1000 1200" stroke="#E8D8B0" strokeWidth="5" />
          </g>
          <g transform={L(1.1)}>
            <path d="M-200 1250 H1280 V2200 H-200 Z" fill="#4A2E1A" />
            <rect x="-100" y="1250" width="1280" height="40" fill="#6A4428" stroke={K} strokeWidth="6" />
            {[120, 330, 760, 960].map((x, i) => {
              const clink = i < 2 ? Math.max(0, Math.sin(t * 4)) * 14 : -Math.max(0, Math.sin(t * 4)) * 14;
              return (
                <g key={x} transform={`translate(${x + clink} 1250) rotate(${clink * 0.6})`}>
                  <rect x="-40" y="-130" width="80" height="130" rx="8" fill="#E8B040" stroke={K} strokeWidth="5" opacity=".9" />
                  <path d="M-40 -130 Q0 -170 40 -130" fill="#F4EEE2" stroke={K} strokeWidth="4" />
                  <path d="M40 -100 Q80 -100 76 -60 Q72 -30 40 -34" stroke={K} strokeWidth="7" fill="none" />
                </g>
              );
            })}
          </g>
        </g>
        <g transform={L(1.6)}>
          {free > 0 && <g opacity={free}><Confetti t={t} n={40} colors={['#E8C030', '#C8402A', P.accento, '#F4EEE2']} /></g>}
          {party > 0 && <g opacity={party}><Notes t={t} x={560} y={1000} n={6} color="#F4EAD2" /></g>}
          <Dust t={t} top={{ y: 600, x0: 200, x1: 880 }} bottom={{ y: 1260, x0: 200, x1: 880 }} seed={3} n={22} color="#FFE2B0" />
          <NearMotes id="fe-near" t={t} color="#FFE2B0" n={5} y0={1300} opacity={0.07} />
        </g>
      </g>
      <Finish id="fe" tint="#3A1E10" tintOpacity={0.1} />
    </svg>
  );
};
