import React from 'react';
import { camera, eio, eo, mod, seg } from '../../lib/anim';
import { Glow, NearMotes, Reflection, Stars, WaveLines } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Diamond, Door, K } from './Comuni';

// Il Cuore dell'Oceano: sulla prima frase l'alba sull'oceano e, lontano, la nave dei soccorsi (Rose si salva); su «oggi,
// da anziana, getta in mare il diamante» la notte calma sulla poppa della nave di ricerca, con le luci della gru: il
// diamante cade dalla ringhiera e scende nell'acqua scura con una scia di bolle e di luce (accento); su «ma su quella
// porta» il diamante sparisce in basso e in superficie torna, lontana, la sagoma della porta che galleggia. Nessuna persona.
// Piani: cielo (0,15) · mare (0,35) · nave / poppa (0,6) · acqua e diamante (0,85) · porta (1,0) · bolle (1,6)

export const Cuore: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const night = eio(seg(t, cues[1] - 0.4, cues[1] + 0.4)); // dall'alba del 1912 alla notte di oggi
  const fall = seg(t, cues[1] + 1.4, cues[2] + 0.6); // il diamante cade e affonda
  const door = eo(seg(t, cues[2], cues[2] + 1.5)); // la porta torna

  const dy = fall < 0.25 ? (fall / 0.25) ** 2 * 300 : 300 + (fall - 0.25) / 0.75 * 900;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="cu" />
        <Lin id="cu-dawn" stops={[[0, '#3A4A7A'], [0.5, '#E8A0A0'], [0.62, '#FFE0C0']]} />
        <Lin id="cu-night" stops={[[0, '#02040A'], [0.6, '#0A1424'], [1, '#14223A']]} />
        <Lin id="cu-sea" stops={[[0, '#1A3048'], [1, '#02060C']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.15)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#cu-dawn)" />
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#cu-night)" opacity={night} />
          <g opacity={night}><Stars t={t} n={70} y={-100} h={800} seed={33} /></g>
        </g>
        <g transform={L(0.35)}>
          <path d="M-200 880 H1280 V2200 H-200 Z" fill="url(#cu-sea)" />
          <WaveLines t={t} ys={[910, 980, 1080]} color={night > 0.5 ? '#3A5A7A' : '#E8B0A0'} amp={4} speed={14} opacity={0.4} />
          {/* all'alba la nave dei soccorsi lontana */}
          <g opacity={1 - night} transform="translate(820 880)">
            <path d="M-90 0 H90 L70 24 H-70 Z" fill="#141820" />
            <rect x="-40" y="-40" width="70" height="40" fill="#E8E0D0" />
            <rect x="-10" y="-80" width="20" height="40" fill="#C8402A" />
            <path d="M-10 -80 q-30 -30 -60 -20" stroke="#8A8A8A" strokeWidth="14" fill="none" opacity=".6" />
          </g>
        </g>
        {/* la poppa della nave di ricerca, di notte, con la gru e i fari */}
        <g transform={L(0.6)} opacity={night}>
          <path d="M-200 760 H560 L520 900 H-200 Z" fill="#E8E4DC" stroke={K} strokeWidth="8" />
          <path d="M-200 740 H560" stroke="#C8402A" strokeWidth="10" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-160 + i * 90} 740 V690`} stroke="#E8E4DC" strokeWidth="6" />)}
          <path d="M-200 690 H560" stroke="#E8E4DC" strokeWidth="8" />
          <path d="M60 690 L260 640 L420 646" stroke="#E8C030" strokeWidth="16" fill="none" />
          <path d="M420 646 V690" stroke={K} strokeWidth="4" />
          <Glow id="cu-crane" x={420} y={660} r={170} t={t} color="#FFF2C8" amp={0.06} rate={2} opacity={0.6} />
          <Reflection t={t} x={420} y={910} color="#FFF2C8" n={8} opacity={0.4} />
        </g>
        {/* il diamante che cade e affonda, con la scia di luce */}
        <g transform={L(0.85)}>
          {fall > 0 && (
            <g transform={`translate(${540 + Math.sin(fall * 9) * 20 * fall} ${700 + dy}) rotate(${fall * 300})`} opacity={1 - Math.max(0, (fall - 0.85) / 0.15)}>
              <Glow id="cu-dia" x={0} y={0} r={200} t={t} color={P.accento} amp={0.1} rate={4} opacity={0.7} />
              <Diamond x={0} y={0} s={0.55} t={t} />
            </g>
          )}
          {fall > 0.25 && <path d={`M540 900 Q${560} ${900 + (dy - 200) / 2} ${540 + Math.sin(fall * 9) * 20 * fall} ${700 + dy}`} stroke={P.accento} strokeWidth="6" fill="none" opacity={0.5 * (1 - fall * 0.6) * (1 - Math.max(0, (fall - 0.85) / 0.15))} />}
          {fall > 0.2 && [0, 1, 2].map((i) => <circle key={i} cx={540} cy={890} r={20 + i * 30 + 60 * Math.min(1, (fall - 0.2) * 3)} fill="none" stroke="#CFE8F0" strokeWidth="4" opacity={Math.max(0, 0.7 - (fall - 0.2) * 2)} />)}
        </g>
        {/* la porta che galleggia, lontana */}
        <g transform={L(1.0)} opacity={door * 0.9}>
          <Door x={780} y={1180} s={0.55} rot={14} frost={0.3} />
          <Glow id="cu-door" x={780} y={1180} r={220} t={t} color="#CFE8F0" amp={0.05} rate={1.5} opacity={0.35 * door} />
        </g>
        {/* ringhiera della nave di ricerca in primo piano */}
        <g transform={L(1.25)} opacity={0.3 + 0.7 * night}>
          <path d="M-200 1600 Q540 1560 1280 1600" stroke="#E8E4DC" strokeWidth="16" fill="none" />
          <path d="M-200 1680 Q540 1640 1280 1680" stroke="#C8C4BC" strokeWidth="8" fill="none" />
          {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${-160 + i * 100} ${1590 - Math.sin((i / 13) * Math.PI) * 30} V2200`} stroke="#C8C4BC" strokeWidth="9" />)}
          <path d="M-200 1760 H1280 V2200 H-200 Z" fill="#2A2E36" />
        </g>
        <g transform={L(1.6)}>
          {fall > 0.25 && Array.from({ length: 12 }, (_, i) => {
            const p = mod(t * 0.4 + i / 12, 1);
            return <circle key={i} cx={540 + Math.sin(p * 7 + i) * 30} cy={700 + dy - p * 400} r={3 + (i % 3) * 2} fill="none" stroke="#CFE8F0" strokeWidth="2.5" opacity={(1 - p) * 0.7 * (1 - fall * 0.5)} />;
          })}
          <NearMotes id="cu-near" t={t} color="#DDEFFF" n={6} opacity={0.08} />
        </g>
      </g>
      <Finish id="cu" tint="#0A1A2E" tintOpacity={0.12} />
    </svg>
  );
};
