import React from 'react';
import { camera, eo, eob, mod, rng, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes, Stars } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { K, Ombra, SestoDefs } from './Comuni';

// Un bambino senza paura: il palco della recita scolastica. Sul fondale un castello di cartone dipinto e una luna di
// cartone; ai lati il sipario di velluto bordeaux aperto; al centro, nel cerchio del riflettore, una corona di
// cartone dorato su uno sgabello e una spada di legno appoggiata (il protagonista); in primo piano le file di sedie
// pieghevoli della platea, vuote.
// Eventi: 1ª frase il riflettore si accende sulla corona e cadono i coriandoli (l'applauso); 2ª frase il riflettore si
// stringe e si abbassa, resta la luce di sala (il saluto a Malcolm); 3ª frase la luna di cartone si accende e compaiono
// le stelle sul fondale: la notte, il consiglio di parlare ad Anna mentre dorme. Nessuna persona.
// Piani: fondale con il castello e la luna (0,3) · palco di legno, corona e sgabello (0,55) · sipario (0,7)
//        · file di sedie in primo piano (1,2) · coriandoli e pulviscolo (1,4–1,8)

const conf = (() => {
  const r = rng(321);
  return Array.from({ length: 46 }, () => ({ x: 220 + r() * 640, ph: r(), sp: 0.25 + r() * 0.2, c: Math.floor(r() * 4), rot: r() * 360 }));
})();

export const Recita: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const spot = eo(seg(t, griglia(cues[0] + 0.3), griglia(cues[0] + 0.3) + 0.4));
  const clap = seg(t, griglia(cues[0] + 0.8), griglia(cues[0] + 1.0)) * (1 - seg(t, cues[1] + 0.2, cues[1] + 1.2));
  const dim = eo(seg(t, griglia(cues[1] + 0.6), griglia(cues[1] + 0.6) + 1.2));
  const moon = eob(seg(t, griglia(cues[2] + 0.4), griglia(cues[2] + 0.4) + 0.8), 1.4);
  const sp = spot * (1 - 0.6 * dim);
  const crownBob = Math.sin(t * 1.4) * 2;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="re" />
        <SestoDefs id="re" />
        <Lin id="re-back" stops={[[0, '#141C2C'], [0.5, '#2A3A54'], [1, '#3A4A5E']]} />
        <Lin id="re-stage" stops={[[0, '#8A6440'], [0.4, '#5A3E24'], [1, '#2A1A0C']]} />
        <Lin id="re-velvet" x2={1} y2={0} stops={[[0, '#2A0A10'], [0.25, '#6A1A24'], [0.5, '#3E0E16'], [0.75, '#6A1A24'], [1, '#22080C']]} />
        <Lin id="re-card" stops={[[0, '#B8A890'], [1, '#7A6A54']]} />
        <Lin id="re-seat" x2={1} y2={0} stops={[[0, '#1A1E22'], [0.5, '#4A5056'], [1, '#14181C']]} />
        <linearGradient id="re-spot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF4D8" stopOpacity=".05" />
          <stop offset=".7" stopColor="#FFF4D8" stopOpacity=".35" />
          <stop offset="1" stopColor="#FFF4D8" stopOpacity=".55" />
        </linearGradient>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — fondale dipinto: cielo, castello di cartone e luna (0,3) */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="#0A0C10" />
          <rect x="140" y="660" width="800" height="440" fill="url(#re-back)" stroke={K} strokeWidth="8" />
          <g opacity={moon}><Stars t={t} seed={14} n={16} x={160} y={680} w={760} h={200} color="#FFF4C8" size={1.1} /></g>
          <circle cx="780" cy="760" r="56" fill={moon > 0 ? '#F2E8B0' : '#8A8A7A'} stroke={K} strokeWidth="6" />
          <circle cx="800" cy="748" r="50" fill="url(#re-back)" />
          <Glow id="re-moon" x={770} y={770} r={220} t={t} color="#FFF0B8" amp={0.06} rate={2} opacity={0.7 * Math.min(1, moon)} />
          {/* castello di cartone con le torri e le finestre */}
          <g stroke={K} strokeLinejoin="round">
            <path d="M260 1100 V880 H310 V860 H340 V880 H380 V860 H410 V880 H460 V1100 Z" fill="url(#re-card)" strokeWidth="7" />
            <path d="M440 1100 V820 H480 V800 H510 V820 H550 V800 H580 V820 H620 V1100 Z" fill="url(#re-card)" strokeWidth="7" />
            <path d="M600 1100 V900 H650 V880 H680 V900 H720 V880 H750 V900 H800 V1100 Z" fill="url(#re-card)" strokeWidth="7" />
            <path d="M490 1100 V1010 Q530 960 570 1010 V1100 Z" fill="#3A2A1A" strokeWidth="6" />
            {[[320, 940], [690, 960], [520, 880]].map(([x, y], i) => <path key={i} d={`M${x} ${y + 40} V${y + 10} Q${x + 15} ${y - 8} ${x + 30} ${y + 10} V${y + 40} Z`} fill={moon > 0 ? '#F2D890' : '#2A2A30'} strokeWidth="4" />)}
            <path d="M530 800 V740" strokeWidth="5" />
            <path d="M530 740 L570 752 L530 764 Z" fill="#E8C860" strokeWidth="3" />
          </g>
          {/* i bordi di cartone ritagliato e i nastri adesivi */}
          {[[270, 1040], [770, 940]].map(([x, y], i) => <rect key={i} x={x} y={y} width="40" height="14" fill="#D8CCA8" opacity=".7" transform={`rotate(${i ? 20 : -15} ${x} ${y})`} />)}
        </g>

        {/* PIANO 1 — palco di legno, sgabello con la corona e la spada di legno (0,55) */}
        <g transform={L(0.55)}>
          <path d="M-200 1100 H1280 V1380 H-200 Z" fill="url(#re-stage)" stroke={K} strokeWidth="8" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-200 + i * 140} 1100 L${-320 + i * 160} 1380`} stroke="#000" strokeWidth="4" opacity=".3" />)}
          <path d="M-200 1106 H1280" stroke="#C8946A" strokeWidth="5" opacity=".5" />
          {/* ribalta con le lucine */}
          <rect x="-200" y="1380" width="1480" height="60" fill="#1A0E06" stroke={K} strokeWidth="7" />
          {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={-100 + i * 110} cy="1392" r="8" fill="#FFE2A0" opacity={0.6 + 0.3 * Math.sin(t * 3 + i)} />)}
          {/* riflettore: cono e cerchio di luce sul palco */}
          <path d={`M${540 - 50 + 60 * dim} 680 L${540 - 260 + 120 * dim} 1250 H${540 + 260 - 120 * dim} L${540 + 50 - 60 * dim} 680 Z`} fill="url(#re-spot)" opacity={sp} />
          <ellipse cx="540" cy="1250" rx={260 - 120 * dim} ry={60 - 24 * dim} fill="#FFF4D8" opacity={0.45 * sp} />
          <Ombra id="re" x={560} y={1250} rx={110} ry={16} />
          {/* sgabello */}
          <g stroke={K} strokeLinejoin="round">
            <path d="M480 1250 L500 1120 M600 1250 L580 1120 M540 1250 V1130" strokeWidth="14" />
            <path d="M480 1250 L500 1120 M600 1250 L580 1120" stroke="#8A5A34" strokeWidth="6" />
            <ellipse cx="540" cy="1120" rx="90" ry="22" fill="url(#re-wood)" strokeWidth="7" />
          </g>
          {/* corona di cartone dorato */}
          <g transform={`translate(540 ${1096 + crownBob * 0})`}>
            <path d="M-70 0 V-60 L-40 -30 L-14 -84 L14 -30 L40 -84 L70 -30 V0 Z" fill="url(#re-gold)" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            {[-40, 0, 40].map((x, i) => <circle key={i} cx={x} cy="-16" r="9" fill={['#4A8AC8', '#5AA86A', '#4A8AC8'][i]} stroke={K} strokeWidth="3" />)}
            <path d="M-62 -6 H62" stroke="#FFF2B8" strokeWidth="4" opacity=".7" />
          </g>
          <Glow id="re-crown" x={540} y={1060} r={200} t={t} color="#FFE2A0" amp={0.06} rate={3} opacity={0.6 * sp} />
          {/* spada di legno appoggiata allo sgabello */}
          <g transform="translate(640 1250) rotate(-22)">
            <rect x="-9" y="-200" width="18" height="150" fill="#C8A878" stroke={K} strokeWidth="5" />
            <path d="M-9 -200 L0 -222 L9 -200" fill="#C8A878" stroke={K} strokeWidth="5" />
            <rect x="-36" y="-52" width="72" height="16" rx="4" fill="#8A5A34" stroke={K} strokeWidth="5" />
            <rect x="-8" y="-38" width="16" height="38" fill="#5A3A20" stroke={K} strokeWidth="5" />
          </g>
        </g>

        {/* PIANO 2 — sipario di velluto aperto ai lati e mantovana in alto (0,7) */}
        <g transform={L(0.7)}>
          {[0, 1].map((side) => {
            const x0 = side ? 900 : -200, x1 = side ? 1280 : 180;
            const inner = side ? x0 : x1;
            return (
              <g key={side}>
                <path d={`M${x0} 640 H${x1} Q${inner + (side ? -60 : 60)} 1000 ${inner + (side ? 30 : -30)} 1400 H${side ? 1280 : -200} Z`} fill="url(#re-velvet)" stroke={K} strokeWidth="10" />
                {[0.25, 0.5, 0.75].map((k) => <path key={k} d={`M${x0 + (x1 - x0) * k} 610 Q${x0 + (x1 - x0) * k + (side ? -30 : 30)} 1000 ${x0 + (x1 - x0) * k + (side ? 10 : -10)} 1400`} stroke="#14040A" strokeWidth="8" fill="none" opacity=".7" />)}
                <path d={`M${inner} 610 Q${inner + (side ? -54 : 54)} 1000 ${inner + (side ? 26 : -26)} 1400`} stroke="#C84A5A" strokeWidth="5" fill="none" opacity=".45" />
                {/* cordone dorato */}
                <path d={`M${side ? 930 : 150} 1010 q${side ? -20 : 20} 30 0 60`} stroke="#E8C060" strokeWidth="12" fill="none" strokeLinecap="round" />
              </g>
            );
          })}
          <path d="M-200 630 H1280 V680 Q1080 730 880 680 Q680 730 480 680 Q280 730 80 680 Q-60 720 -200 680 Z" fill="url(#re-velvet)" stroke={K} strokeWidth="9" />
          <path d="M-200 670 Q-60 710 80 670 Q280 720 480 670 Q680 720 880 670 Q1080 720 1280 670" stroke="#E8C060" strokeWidth="6" fill="none" />
        </g>

        {/* PIANO 3 — file di sedie pieghevoli vuote in primo piano (1,2) */}
        <g transform={L(1.2)}>
          {[0, 1].map((row) => Array.from({ length: 6 }, (_, i) => {
            const x = -120 + i * 230 + row * 115, y = 1560 + row * 200;
            return (
              <g key={`${row}-${i}`}>
                <rect x={x} y={y} width="170" height="120" rx="14" fill="url(#re-seat)" stroke={K} strokeWidth="8" />
                <path d={`M${x + 14} ${y + 12} H${x + 156}`} stroke="#8A9298" strokeWidth="5" opacity=".6" />
                <path d={`M${x + 20} ${y + 120} V${y + 400} M${x + 150} ${y + 120} V${y + 400}`} stroke={K} strokeWidth="14" />
              </g>
            );
          }))}
          {/* un programma della recita su una sedia */}
          <g transform="translate(480 1600) rotate(-12)">
            <rect x="-50" y="-34" width="100" height="70" fill="url(#re-paper)" stroke={K} strokeWidth="5" />
            <path d="M-34 -16 H34 M-34 0 H20 M-34 14 H26" stroke="#5A5040" strokeWidth="4" />
          </g>
        </g>

        {/* PIANO 4 — coriandoli sul palco (1,4), pulviscolo nel riflettore e particelle vicine */}
        <g transform={L(1.4)}>
          {clap > 0 && conf.map((c, i) => {
            const p = mod((t - cues[0]) * c.sp + c.ph, 1);
            return <rect key={i} x={c.x + Math.sin(t * 3 + i) * 20} y={700 + p * 600} width="16" height="9" fill={['#E8C860', '#4A8AC8', '#E8A0B8', '#A8D890'][c.c]} opacity={clap * Math.sin(Math.PI * p)} transform={`rotate(${c.rot + t * 200} ${c.x} ${700 + p * 600})`} />;
          })}
        </g>
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 700, x0: 480, x1: 600 }} bottom={{ y: 1250, x0: 300, x1: 780 }} seed={5} n={20} color="#FFF4D8" boost={0.2 * sp} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="re-near" t={t} color="#E8DCC8" n={5} opacity={0.07} />
        </g>
      </g>
      <Finish id="re" tint="#2A2A3A" tintOpacity={0.12} />
    </svg>
  );
};
