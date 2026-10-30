import React from 'react';
import { camera, eo, rng, seg } from '../../lib/anim';
import { Glow, NearMotes, Rain } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { TYPEWRITER } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { K } from './Comuni';

// La verità sulla madre: l'archivio di un vecchio manicomio, scaffali di cartelle, una lampada che oscilla; sulla prima
// frase una cartella viene tirata fuori; su «si era inventata tutto: lo aveva adottato» si apre e compare il timbro rosso
// «ADOZIONE» (accento); su «lo aveva lasciato picchiare» le vecchie fotografie si girano e la lampada sfarfalla. Dalla
// finestra con le sbarre, la pioggia. Nessuna persona.
// Piani: finestra con la pioggia (0,2) · scaffali (0,5) · tavolo (0,8) · cartella aperta (1,05) · sbarre in primo piano (1,3) · pulviscolo (1,6)

const r = rng(9);
const FOLDERS = Array.from({ length: 60 }, (_, i) => ({ x: (i % 15) * 74, y: Math.floor(i / 15), c: ['#C8B080', '#B89A68', '#D8C090', '#A88A58'][Math.floor(r() * 4)] }));

export const Verita: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const pull = eo(seg(t, cues[0] + 0.6, cues[0] + 1.6)); // la cartella esce
  const stamp = seg(t, cues[1] + 0.8, cues[1] + 1.0); // il timbro ADOZIONE
  const flip = eo(seg(t, cues[2] + 0.2, cues[2] + 1.2)); // le foto si girano
  const swing = Math.sin(t * 1.6) * 12;
  const flick = t > cues[2] && Math.sin(t * 19) > 0.6 ? 0.4 : 1;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="vr" />
        <Lin id="vr-wall" stops={[[0, '#3A4A44'], [1, '#1E2622']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#vr-wall)" />
          <rect x="740" y="560" width="260" height="300" fill="#1A2430" stroke={K} strokeWidth="8" />
          <svg x="740" y="560" width="260" height="300" viewBox="0 0 260 300"><Rain t={t} level="far" color="#9AB0C0" opacity={0.6} /></svg>
        </g>
        <g transform={L(0.5)}>
          {[0, 1, 2, 3].map((row) => <rect key={row} x="-200" y={600 + row * 150} width="900" height="14" fill="#5A4A38" stroke={K} strokeWidth="4" />)}
          {FOLDERS.map((f, i) => <rect key={i} x={-180 + f.x} y={600 + f.y * 150 - 110} width="54" height="110" fill={f.c} stroke={K} strokeWidth="3" opacity={i === 22 ? 1 - pull : 1} />)}
          <g transform={`rotate(${swing} 420 500)`}>
            <path d="M420 300 V560" stroke="#2A2A2A" strokeWidth="4" />
            <path d="M380 560 H460 L440 600 H400 Z" fill="#3A4A3A" stroke={K} strokeWidth="5" />
            <Glow id="vr-lamp" x={420} y={620} r={480} t={t} color="#F4E8B0" amp={0.05} rate={3} opacity={0.5 * flick} />
          </g>
        </g>
        <g transform={L(0.8)}>
          <path d="M-200 1200 H1280 V2200 H-200 Z" fill="#2A2420" />
          <rect x="100" y="1160" width="880" height="40" fill="#6A5038" stroke={K} strokeWidth="7" />
        </g>
        {/* la cartella aperta con il timbro e le fotografie */}
        <g transform={L(1.05)} opacity={pull}>
          <g transform={`translate(540 ${1110 - 60 * (1 - pull)})`}>
            <path d="M-300 -10 L-10 -30 L-10 60 L-300 70 Z" fill="#D8C090" stroke={K} strokeWidth="5" />
            <path d="M10 -30 L300 -10 L300 70 L10 60 Z" fill="#E8D8B0" stroke={K} strokeWidth="5" />
            {[-6, 10, 26].map((y) => <path key={y} d={`M-270 ${y} H-60`} stroke="#5A4A3A" strokeWidth="5" />)}
            {stamp > 0 && (
              <g transform={`translate(150 20) rotate(-12) scale(${1.6 - 0.6 * stamp})`} opacity={stamp}>
                <rect x="-110" y="-26" width="220" height="52" fill="none" stroke={P.accento} strokeWidth="6" />
                <text x="0" y="12" textAnchor="middle" fontFamily={TYPEWRITER} fontSize="34" fill={P.accento}>ADOZIONE</text>
              </g>
            )}
            {[-200, -80].map((x, i) => (
              <g key={x} transform={`translate(${x} -110) rotate(${(i ? 8 : -6)}) scale(${1 - 2 * Math.min(flip, 0.5)} 1)`}>
                <rect x="-50" y="-60" width="100" height="120" fill={flip > 0.5 ? '#E8E0D0' : '#C8B088'} stroke={K} strokeWidth="5" />
                {flip > 0.5 ? <path d="M-30 -30 H30 M-30 0 H20" stroke="#8A7A60" strokeWidth="4" /> : <rect x="-40" y="-50" width="80" height="80" fill="#7A6040" />}
              </g>
            ))}
          </g>
        </g>
        <g transform={L(1.3)}>
          {[-60, 160, 920, 1140].map((x) => <path key={x} d={`M${x} -200 V2200`} stroke="#1A1A1A" strokeWidth="26" />)}
          <path d="M-200 1600 H1280 V2200 H-200 Z" fill="#141210" opacity=".7" />
        </g>
        <g transform={L(1.6)}>
          <NearMotes id="vr-near" t={t} color="#F4E8B0" n={6} opacity={0.08} />
        </g>
      </g>
      <Finish id="vr" tint="#1E2A26" tintOpacity={0.16} />
    </svg>
  );
};
