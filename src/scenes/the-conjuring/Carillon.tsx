import React from 'react';
import { camera, eo, seg } from '../../lib/anim';
import { Fireflies, Fog, Glow, NearMotes, Notes, Stars } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Carillon as Scatola, ConjDefs, Fattoria, GOLD, K, TINT_NOTTE } from './Comuni';

// Il carillon: al crepuscolo, tra le radici del grande albero davanti alla fattoria, un vecchio carillon di legno mezzo
// sepolto. Su «trova sotto un albero un vecchio carillon» la terra si scosta, il coperchio si apre, la stellina gira e le
// note salgono (il motivo da carillon dello spartito); su «diventa amica di Rory» nell'erba bagnata compaiono da sole, una
// alla volta, le piccole impronte di due piedi nudi che vengono verso il carillon; su «uno spirito che gli altri non vedono»
// accanto alle impronte si accende un respiro di luce fredda e la trottola a terra si mette a girare da sola. Nessuna
// persona né figura: Rory è solo impronte, freddo e un giocattolo che si muove.
// Piani: cielo (0,2) · fattoria lontana (0,4) · radici e prato (0,7) · carillon e impronte (0,85) · erba alta (1,25) · lucciole (1,6)

export const Carillon: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tOpen = griglia(cues[0] + 2.6);
  const open = eo(seg(t, tOpen, tOpen + 0.9));
  const dirt = 1 - eo(seg(t, tOpen - 1.2, tOpen));
  const tSteps = griglia(cues[1] + 0.2);
  const beat = 60 / 72;
  const tSpirit = griglia(cues[2] + 0.4);
  const spirit = eo(seg(t, tSpirit, tSpirit + 1.2));
  const top = t > tSpirit + 0.3 ? (t - tSpirit - 0.3) * 900 : 0;
  // sei impronte che si avvicinano al carillon, una per battito
  const steps = [
    [90, 1236, -14], [170, 1196, -10], [230, 1250, -10], [310, 1206, -6], [370, 1256, -8], [450, 1216, -4],
  ];

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="cr" />
        <ConjDefs id="cr" />
        <Lin id="cr-sky" stops={[[0, '#0E1230'], [0.45, '#2A2450'], [0.75, '#6A4A6A'], [0.9, '#A86A6A']]} />
        <Lin id="cr-grass" stops={[[0, '#2A3A2A'], [0.5, '#1E2A1E'], [1, '#0E140E']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-300" y="-200" width="1700" height="1500" fill="url(#cr-sky)" />
          <Stars t={t} seed={5} n={40} y={0} h={700} color="#E8E8F2" />
          <path d="M-300 1040 Q200 990 600 1030 Q900 1060 1400 1000 V1300 H-300 Z" fill="#1E1E30" />
        </g>
        {/* la fattoria lontana con due finestre accese */}
        <g transform={L(0.4)}>
          <Fattoria id="cr-f" x={820} y={1080} s={0.36} t={t} lit={[0.8, 0, 0.6, 0, 0, 0]} night={1} wall={['#5A5A66', '#34343E']} />
          <Fog id="cr-fog" t={t} y={1070} rx={900} ry={50} color="#8A8AA8" opacity={0.25} />
        </g>
        {/* il prato e le radici del grande albero */}
        <g transform={L(0.7)}>
          <path d="M-300 1060 Q300 1040 1400 1080 V1600 H-300 Z" fill="url(#cr-grass)" />
          {/* il tronco che esce dal bordo sinistro, con le radici che abbracciano il carillon */}
          <path d="M-300 -200 H60 Q90 400 120 800 Q150 1000 260 1120 L-300 1200 Z" fill="url(#cr-bark)" stroke={K} strokeWidth="12" />
          <path d="M40 0 Q60 400 90 780" stroke="#8A8AA8" strokeWidth="6" fill="none" opacity=".35" />
          <path d="M-10 300 Q20 380 0 460 M30 620 Q60 700 40 780" stroke="#000" strokeWidth="6" fill="none" opacity=".4" />
          {[
            'M150 1000 Q420 980 620 1110',
            'M200 1080 Q500 1120 760 1170',
            'M80 1120 Q300 1200 460 1290',
          ].map((d, i) => (
            <g key={i}>
              <path d={d} stroke={K} strokeWidth={60 - i * 12} fill="none" strokeLinecap="round" />
              <path d={d} stroke="#3E3832" strokeWidth={44 - i * 10} fill="none" strokeLinecap="round" />
              <path d={d} stroke="#8A8AA8" strokeWidth="4" fill="none" opacity=".3" transform="translate(0 -14)" />
            </g>
          ))}
        </g>
        {/* il carillon tra le radici, le impronte nella rugiada, la trottola */}
        <g transform={L(0.85)}>
          <path d="M470 1180 Q640 1130 810 1180 Q760 1210 480 1200 Z" fill="#1A120C" />
          <Scatola id="cr" x={640} y={1180} s={1.4} t={t} open={open} glow={open} dirt={dirt} />
          {open > 0.3 && <Notes t={t - tOpen} x={640} y={960} n={6} color={GOLD} outline={K} rise={330} spread={300} size={1.2} speed={0.25} />}
          {/* impronte di piedi nudi da bambino che compaiono una alla volta */}
          {steps.map(([x, y, a], i) => {
            const p = eo(seg(t, tSteps + i * beat * 0.5, tSteps + i * beat * 0.5 + 0.3));
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${a + 90}) scale(${i % 2 ? -1.7 : 1.7} 1.7)`} opacity={p * 0.9}>
                <ellipse cx="0" cy="0" rx="15" ry="27" fill="#9FC0D8" opacity=".25" />
                <path d="M-8 10 Q-10 -14 0 -18 Q10 -14 9 4 Q6 16 -2 16 Q-8 16 -8 10 Z" fill="#0E1A14" />
                {[-8, -3, 2, 7].map((dx, j) => <circle key={j} cx={dx} cy={-24 - (j === 0 ? 2 : 0)} r={3.5 - j * 0.4} fill="#0E1A14" />)}
              </g>
            );
          })}
          {/* il respiro di freddo accanto alle impronte */}
          {spirit > 0 && (
            <g>
              <Glow id="cr-sp" x={420} y={1170} r={200} t={t} color="#9FC0D8" amp={0.15} rate={2.5} opacity={0.5 * spirit} />
              {Array.from({ length: 5 }, (_, i) => {
                const p = ((t - tSpirit) * 0.35 + i * 0.2) % 1;
                return <ellipse key={i} cx={420 + Math.sin(i * 2 + t) * 30} cy={1190 - p * 260} rx={30 + p * 50} ry={16 + p * 20} fill="#C8E0F0" opacity={0.25 * spirit * Math.sin(p * Math.PI)} />;
              })}
            </g>
          )}
          {/* la trottola a terra che si mette a girare da sola */}
          <g transform={`translate(900 1250) scale(1.3) rotate(${spirit > 0 ? Math.sin(top / 140) * 6 : 24})`}>
            <g transform={`scale(${spirit > 0 ? Math.cos(top / 60) * 0.3 + 0.7 : 1} 1)`}>
              <path d="M-40 -50 Q0 -76 40 -50 L0 0 Z" fill="#3A6A9A" stroke={K} strokeWidth="6" />
              <path d="M-34 -54 Q0 -64 34 -54" stroke="#F2E8D0" strokeWidth="6" fill="none" />
            </g>
            <path d="M0 -70 V-92" stroke={K} strokeWidth="8" />
          </g>
          {/* gocce di rugiada che brillano */}
          {Array.from({ length: 16 }, (_, i) => (
            <circle key={i} cx={120 + ((i * 131) % 860)} cy={1180 + ((i * 47) % 90)} r={3} fill="#E8F0F8" opacity={0.3 + 0.4 * Math.abs(Math.sin(t * 1.5 + i))} />
          ))}
        </g>
        {/* erba alta in primo piano */}
        <g transform={L(1.25)}>
          <path d="M-300 1300 Q400 1280 1400 1310 V2200 H-300 Z" fill="#0A100A" />
          {Array.from({ length: 46 }, (_, i) => {
            const x = -200 + i * 32;
            const h = 120 + ((i * 61) % 160);
            const w = Math.sin(t * 1.2 + i * 0.6) * 14;
            return <path key={i} d={`M${x} 1700 Q${x + 8} ${1700 - h / 2} ${x + w} ${1700 - h - (i % 4 === 0 ? 120 : 0)}`} stroke={i % 3 ? '#1E2E1E' : '#2E3E2A'} strokeWidth="10" fill="none" strokeLinecap="round" />;
          })}
        </g>
        <g transform={L(1.6)}>
          <Fireflies id="cr-ff" t={t} seed={7} n={10} y={900} h={500} color="#FFE6A0" />
          <NearMotes id="cr-near" t={t} color="#C8D8E8" n={5} y0={1100} opacity={0.06} />
        </g>
      </g>
      <Finish id="cr" tint={TINT_NOTTE} tintOpacity={0.12} />
    </svg>
  );
};
