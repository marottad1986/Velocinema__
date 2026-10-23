import React from 'react';
import { camera, eio, mod, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Clouds, Glow, NearMotes, SunRays } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Broom, GoldBall, K } from './Comuni';

// Il Quidditch: campo da gioco nel cielo; altissimi anelli sui pali, torri con gli spalti e gli stendardi; una scopa che
// sfreccia lasciando una scia; la pallina d'oro con le ali che zigzaga brillando.
// Piani: cielo (0,2) · nuvole (0,3) · torri e spalti (0,45) · anelli (0,6) · scopa (0,85) · prato (1,0) · scia (1,6)

export const Quidditch: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  // la scopa: prima tremolante a terra, poi sfreccia in cielo
  const lift = eio(seg(t, 0.4, cues[1]));
  const fly = t > cues[1] ? (t - cues[1]) : 0;
  const bx = lift < 1 ? 300 : 300 + Math.sin(fly * 1.4) * 360;
  const by = 1200 - 420 * lift - (lift >= 1 ? Math.sin(fly * 2.1) * 60 : 0); // resta sotto il titolo
  const brot = lift < 1 ? -10 * lift + Math.sin(t * 20) * 2 * (1 - lift) : Math.cos(fly * 1.4) * 18;
  // la pallina d'oro compare su «acchiappare una pallina d'oro»
  const ball = seg(t, cues[3] - 0.2, cues[3] + 0.4);
  const gx = 700 + Math.sin(t * 3.1) * 200 + Math.sin(t * 7) * 40, gy = 820 + Math.cos(t * 2.3) * 140;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="qd" />
        <Lin id="qd-sky" stops={[[0, '#5A8AC8'], [0.5, '#A8C8E8'], [1, '#E8EEF0']]} />
        <Lin id="qd-tower" x2={1} y2={0} stops={[[0, '#7A5A3A'], [0.5, '#A8805A'], [1, '#6A4A2A']]} />
        <Lin id="qd-grass" stops={[[0, '#6AA84A'], [1, '#2E5A24']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#qd-sky)" />
          {/* sole con raggi, lontano dal titolo */}
          <SunRays id="qd-rays" x={930} y={600} t={t} color="#FFF4D0" n={9} length={700} from={100} to={260} opacity={0.25} />
          <Glow id="qd-sun" x={930} y={600} r={260} t={t} color="#FFF4C8" amp={0.04} rate={1} opacity={0.8} />
          <circle cx="930" cy="600" r="60" fill="#FFF8E0" />
        </g>
        <g transform={L(0.3)}><Clouds id="qd-cl" t={t} color="#FFFFFF" seed={9} n={4} y={560} h={300} speed={0.6} opacity={0.9} /></g>
        {/* torri con gli spalti e gli stendardi */}
        <g transform={L(0.45)}>
          {[-60, 150, 860, 1080].map((x, i) => (
            <g key={x}>
              <rect x={x - 60} y={840 - (i % 2) * 60} width="120" height={400 + (i % 2) * 60} fill="url(#qd-tower)" stroke={K} strokeWidth="6" />
              <rect x={x - 70} y={840 - (i % 2) * 60} width="140" height="60" fill={i % 2 ? '#2A4A7A' : P.principale} stroke={K} strokeWidth="6" />
              {/* gradinate degli spalti e stendardo appeso che ondeggia */}
              {[0, 1, 2].map((k) => <path key={k} d={`M${x - 60} ${900 - (i % 2) * 60 + k * 26} H${x + 60}`} stroke="#5A3A20" strokeWidth="6" />)}
              <path d={`M${x - 34} ${980 - (i % 2) * 60} H${x + 34} V${1120 - (i % 2) * 60 + Math.sin(t * 3 + i) * 6} L${x} ${1090 - (i % 2) * 60 + Math.sin(t * 3 + i) * 6} L${x - 34} ${1120 - (i % 2) * 60 + Math.sin(t * 3 + i + 1) * 6} Z`} fill={i % 2 ? '#2A4A7A' : P.principale} stroke={K} strokeWidth="5" />
              <circle cx={x} cy={1030 - (i % 2) * 60} r="12" fill={P.accento} stroke={K} strokeWidth="3" />
              <path d={`M${x} ${840 - (i % 2) * 60} V${700 - (i % 2) * 60}`} stroke={K} strokeWidth="5" />
              <path d={`M${x} ${700 - (i % 2) * 60} l${60 + Math.sin(t * 6 + i) * 8} 14 l${-60 - Math.sin(t * 6 + i) * 8} 14 Z`} fill={i % 2 ? '#F4E8C8' : P.accento} stroke={K} strokeWidth="3" />
            </g>
          ))}
        </g>
        {/* altissimi anelli sui pali */}
        <g transform={L(0.6)}>
          {[[420, 730, 70], [560, 680, 80], [700, 750, 66]].map(([x, y, rr], i) => (
            <g key={i}>
              <path d={`M${x} ${y + rr} V1240`} stroke={K} strokeWidth="16" />
              <path d={`M${x} ${y + rr} V1240`} stroke="#C9A24A" strokeWidth="8" />
              <circle cx={x} cy={y} r={rr} fill="none" stroke={K} strokeWidth="18" />
              <circle cx={x} cy={y} r={rr} fill="none" stroke="#E8C060" strokeWidth="10" />
            </g>
          ))}
        </g>
        {/* la scopa che sfreccia con la scia */}
        <g transform={L(0.85)}>
          {/* scia della scopa: segue la saggina lungo il percorso appena fatto */}
          {lift >= 1 && Array.from({ length: 16 }, (_, k) => {
            const tt = fly - k * 0.045;
            const x = 300 + Math.sin(tt * 1.4) * 360, y = 780 - Math.sin(tt * 2.1) * 60;
            return <circle key={k} cx={x + 200 * Math.cos((Math.cos(tt * 1.4) * 18 * Math.PI) / 180)} cy={y} r={22 - k} fill={k < 5 ? '#FFF4D0' : '#FFFFFF'} opacity={0.8 - k * 0.045} />;
          })}
          <Broom x={bx} y={by} s={1.1} rot={brot} />
        </g>
        {/* la pallina d'oro (accento) */}
        <g transform={L(0.9)} opacity={ball}>
          <Glow id="qd-ballg" x={gx} y={gy} r={140} t={t} color="#FFE08A" amp={0.2} rate={8} opacity={0.7} />
          <GoldBall x={gx} y={gy} s={1.1} t={t} color={P.accento} />
          {Array.from({ length: 6 }, (_, k) => {
            const tt = t - k * 0.03;
            return <circle key={k} cx={700 + Math.sin(tt * 3.1) * 200 + Math.sin(tt * 7) * 40} cy={820 + Math.cos(tt * 2.3) * 140} r={6 - k * 0.8} fill="#FFE08A" opacity={0.6 - k * 0.1} />;
          })}
        </g>
        {/* prato del campo */}
        <g transform={L(1.0)}>
          <path d="M-200 1240 Q540 1200 1280 1240 V2200 H-200 Z" fill="url(#qd-grass)" stroke={K} strokeWidth="6" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-200 + i * 220} 1260 L${-500 + i * 300} 1920`} stroke="#5A9A40" strokeWidth="40" opacity=".35" />)}
        </g>
        {/* primo piano: palo con la bandiera del campo, ciuffi d'erba agitati dal vento */}
        <g transform={L(1.2)}>
          <path d="M120 1960 V1180" stroke={K} strokeWidth="26" />
          <path d="M120 1960 V1180" stroke="#C9A24A" strokeWidth="14" />
          <path d={`M132 1190 Q${260 + Math.sin(t * 4) * 20} ${1170 + Math.sin(t * 3) * 14} ${400 + Math.sin(t * 4.4) * 18} ${1210 + Math.sin(t * 5) * 18} Q${270 + Math.sin(t * 4.2) * 16} ${1290 + Math.sin(t * 3.4) * 14} 132 1330 Z`} fill={P.principale} stroke={K} strokeWidth="7" />
          <circle cx="120" cy="1172" r="18" fill={P.accento} stroke={K} strokeWidth="5" />
          {Array.from({ length: 14 }, (_, i) => {
            const x = -40 + i * 86, h = 200 + (i % 3) * 70, sway = Math.sin(t * 3 + i) * 24;
            return <path key={i} d={`M${x - 50} 1960 Q${x - 20 + sway * 0.5} ${1960 - h * 0.6} ${x + sway} ${1960 - h} Q${x + 20 + sway * 0.4} ${1960 - h * 0.5} ${x + 50} 1960 Z`} fill={i % 2 ? '#3E7A2C' : '#4E8A36'} stroke={K} strokeWidth="5" />;
          })}
        </g>
        <g transform={L(1.6)}>
          {/* foglie e polvere portate dal vento */}
          {Array.from({ length: 10 }, (_, i) => {
            const p = mod(t * 0.18 + i / 10, 1);
            return <path key={`f${i}`} d="M0 0 q10 -8 20 0 q-10 8 -20 0 Z" transform={`translate(${1200 - p * 1500} ${1300 + (i % 5) * 110 + Math.sin(t * 2 + i) * 30}) rotate(${t * 120 + i * 40})`} fill={i % 2 ? '#C9A24A' : '#8AB848'} opacity={0.8 * Math.sin(p * Math.PI)} />;
          })}
          {Array.from({ length: 6 }, (_, i) => {
            const p = mod(t * 0.5 + i / 6, 1);
            return <path key={i} d={`M${1200 - p * 1500} ${1350 + i * 90} h${120 + i * 20}`} stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity={0.25 * Math.sin(p * Math.PI)} />;
          })}
          <NearMotes id="qd-near" t={t} color="#FFFFFF" n={5} y0={1300} opacity={0.1} />
        </g>
      </g>
      <Finish id="qd" tint="#E8B04A" tintOpacity={0.08} />
    </svg>
  );
};
