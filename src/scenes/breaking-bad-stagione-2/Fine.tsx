import React from 'react';
import { camera, eo, lerp, mod, seg } from '../../lib/anim';
import { Glow, NearMotes, Smoke } from '../../lib/elements';
import { SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin, Mono, MonoDefs } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { BBDefs } from '../breaking-bad-stagione-1/Comuni';
import { BB2Defs, K, Occhio, Ombra, Orsacchiotto, Piscina } from './Comuni';
import { Colonna } from './Locandina';

// L'orsacchiotto in piscina: il giardino di casa White dopo lo scontro. Il passo avanti della stagione: la scena parte
// in bianco e nero argentato, come gli anticipi che aprivano gli episodi, con un solo colore, il rosa dell'orsacchiotto
// bruciato che galleggia a faccia in giù; quando la voce passa al presente (seconda frase) il colore torna a poco a poco.
// Persone mai: Skyler è la portafinestra illuminata e il secondo cellulare sul tavolo del patio (la bugia scoperta),
// Walter è la piscina. Eventi: prima frase l'orsacchiotto dondola, l'occhio di vetro brilla sul fondo; seconda frase il
// colore torna e sul tavolo si illumina il secondo cellulare; terza frase le luci della casa si spengono una dopo
// l'altra e resta accesa solo la luce della piscina: Walter è solo.
// Piani: cielo con le colonne di fumo (0,2) · tetti e montagne (0,35) · casa con la portafinestra e il patio (0,55)
//        · piscina con l'orsacchiotto (0,75) · tavolino e vaso in primo piano (1,2) · cenere vicina (1,6)

export const Fine: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1200);
  const L = cam.layer;
  const tColor = griglia(cues[1] + 0.2);
  const tPhone = griglia(cues[1] + 1.6);
  const tOff = griglia(cues[2] + 0.4);
  const mono = 1 - eo(seg(t, tColor, tColor + 1.6));
  const phone = seg(t, tPhone, tPhone + 0.2);
  const buzz = t > tPhone && t < tPhone + 1.4 ? Math.sin(t * 60) * 3 : 0;
  const off = (k: number) => 1 - seg(t, tOff + k * 0.625, tOff + k * 0.625 + 0.15);
  const dusk = eo(seg(t, tOff, dur));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fi" />
        <BBDefs id="fi" />
        <BB2Defs id="fi" />
        <MonoDefs id="fi" amount={mono} />
        <Lin id="fi-sky" stops={[[0, '#3A4A6A'], [0.35, '#8A7A8A'], [0.55, '#E8A878'], [0.62, '#F2C890']]} />
        <Lin id="fi-lawn" stops={[[0, '#6A8A4A'], [1, '#2A3E20']]} />
        <Lin id="fi-house" x2={1} y2={0} stops={[[0, '#E8D8B8'], [1, '#B8A080']]} />
        <Lin id="fi-door" stops={[[0, '#FFE0A0'], [1, '#E8A860']]} />
        {['#1E1E22', '#3A3A3E', '#5A5A60'].map((c, k) => (
          <radialGradient key={k} id={`fi-puff${k}`}><stop offset="0" stopColor={c} stopOpacity=".95" /><stop offset=".6" stopColor={c} stopOpacity=".7" /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient>
        ))}
      </defs>
      <g transform={cam.transform}>
        <Mono id="fi" amount={mono}>
          {/* PIANO 0 — cielo del tardo pomeriggio con le colonne di fumo dello schianto (0,2) */}
          <g transform={L(0.2)}>
            <rect x="-200" y="-200" width="1480" height="2400" fill="url(#fi-sky)" />
            <rect x="-200" y="-200" width="1480" height="2400" fill="#0A0E1E" opacity={0.45 * dusk} />
            <Colonna id="fi" x={860} y={1000} h={1000} t={t} w={1} />
            <Colonna id="fi" x={180} y={1010} h={500} t={t + 3} w={0.6} />
          </g>
          {/* PIANO 1 — tetti e montagne (0,35) */}
          <g transform={L(0.35)}>
            <path d="M-200 980 L60 900 L300 950 L560 880 L820 940 L1080 890 L1280 930 V1040 H-200 Z" fill="#7A6A78" />
            {[[-40, 990], [260, 1000], [560, 985], [880, 1000]].map(([hx, hy], i) => <path key={i} d={`M${hx} ${hy + 40} L${hx + 100} ${hy} L${hx + 200} ${hy + 40} Z`} fill="#9A7A6A" />)}
            <Smoke id="fi-sm" t={t} x={900} y={1020} color="#3A3A3E" n={5} rise={240} wind={40} r0={40} r1={120} speed={0.25} opacity={0.6} />
          </g>
          {/* PIANO 2 — la casa a sinistra con la portafinestra, il patio (0,55) */}
          <g transform={L(0.55)}>
            <path d="M-200 1030 H1280 V1300 H-200 Z" fill="url(#fi-lawn)" />
            <g transform="translate(150 1120)">
              <rect x="-360" y="-300" width="560" height="300" fill="url(#fi-house)" stroke={K} strokeWidth="9" />
              <path d="M-380 -300 L-80 -400 L220 -300 Z" fill="#8A5A3A" stroke={K} strokeWidth="9" />
              {/* portafinestra e finestra: si spengono */}
              <rect x="-60" y="-240" width="200" height="240" fill="#2A2420" stroke={K} strokeWidth="7" />
              <rect x="-60" y="-240" width="200" height="240" fill="url(#fi-door)" opacity={0.95 * off(1)} />
              <path d="M40 -240 V0" stroke={K} strokeWidth="6" />
              <rect x="-300" y="-230" width="160" height="120" fill="#2A2420" stroke={K} strokeWidth="7" />
              <rect x="-300" y="-230" width="160" height="120" fill="url(#fi-door)" opacity={0.9 * off(0)} />
              <path d="M-220 -230 V-110 M-300 -170 H-140" stroke={K} strokeWidth="5" />
              <Glow id="fi-doorg" x={40} y={-120} r={300} t={t} color="#FFC870" amp={0.03} rate={1} opacity={0.5 * off(1)} />
              {/* lampada del portico */}
              <rect x="160" y="-250" width="24" height="36" rx="6" fill={off(2) > 0.5 ? '#FFF2C0' : '#5A5A50'} stroke={K} strokeWidth="4" />
              <Glow id="fi-porch" x={172} y={-232} r={140} t={t} color="#FFE0A0" amp={0.05} rate={3} opacity={0.6 * off(2)} />
            </g>
            {/* palma */}
            <path d="M1000 1100 Q980 940 1030 780" stroke="#6A4A2A" strokeWidth="28" fill="none" />
            {[-160, -120, -70, -20, 30, 80].map((a, i) => (
              <path key={i} d={`M1030 780 q${Math.cos((a * Math.PI) / 180) * 110} ${Math.sin((a * Math.PI) / 180) * 110 - 20} ${Math.cos((a * Math.PI) / 180) * 200} ${Math.sin((a * Math.PI) / 180) * 150 + 60}`}
                stroke="#3A5A2A" strokeWidth="30" fill="none" strokeLinecap="round" transform={`rotate(${Math.sin(t * 0.8 + i) * 2} 1030 780)`} />
            ))}
          </g>
          {/* PIANO 3 — la piscina (0,75) */}
          <g transform={L(0.75)}>
            <path d="M-200 1100 H1280 V2200 H-200 Z" fill="url(#fi-lawn)" />
            <Piscina id="fi" t={t} top={1070} bot={1740} bottom={<Occhio id="fi" x={360} y={1560} r={30} t={t} glint={0.8} look={2} />} />
            <Glow id="fi-poolg" x={540} y={1400} r={500} t={t} color="#7AD8F0" amp={0.04} rate={1} opacity={0.35 * dusk} />
          </g>
        </Mono>
        {/* l'orsacchiotto: l'unico colore anche quando tutto è grigio */}
        <g transform={L(0.75)}>
          {[0, 1, 2].map((k) => {
            const p = mod(t * 0.45 + k / 3, 1);
            return <ellipse key={k} cx={600} cy={1180} rx={180 + 240 * p} ry={50 + 70 * p} fill="none" stroke="#E8F4F8" strokeWidth={6 * (1 - p)} opacity={0.6 * (1 - p)} />;
          })}
          <Orsacchiotto id="fi" x={600} y={1140} s={0.62} rot={18} t={t} />
        </g>
        <Mono id="fi" amount={mono}>
          {/* PIANO 4 — tavolino del patio con il secondo cellulare, vaso con l'agave (1,2) */}
          <g transform={L(1.2)}>
            <g transform="translate(860 1720)">
              <Ombra id="fi" x={0} y={10} rx={200} ry={20} />
              <ellipse cx="0" cy="-160" rx="190" ry="44" fill="#E8E2D0" stroke={K} strokeWidth="9" />
              <path d="M-150 -140 L-170 0 M150 -140 L170 0 M0 -120 V0" stroke="#B8B0A0" strokeWidth="12" />
              {/* il secondo cellulare */}
              <g transform={`translate(${-40 + buzz} -176) rotate(-10)`}>
                <rect x="-36" y="-22" width="72" height="44" rx="8" fill="#2A2E34" stroke={K} strokeWidth="5" />
                <rect x="-28" y="-15" width="56" height="30" rx="4" fill={phone > 0 ? '#9AF0C0' : '#1A2420'} />
              </g>
              {phone > 0 && <Glow id="fi-phg" x={-40} y={-180} r={130} t={t} color="#9AF0C0" amp={0.1} rate={8} opacity={0.55 * phone} />}
              <path d="M60 -170 l26 -40 l22 40 Z" fill="#C8DCE4" fillOpacity=".5" stroke={K} strokeWidth="4" />
            </g>
            <g transform="translate(90 1900)">
              <path d="M-100 0 L-80 -170 H80 L100 0 Z" fill="#B8643A" stroke={K} strokeWidth="9" />
              {[-70, -40, -10, 20, 50, 80].map((a, i) => <path key={i} d={`M0 -170 L${a * 2.2} ${-360 - (i % 2) * 50} L${a * 1.4 + 14} -170 Z`} fill="#5A8A6A" stroke={K} strokeWidth="5" />)}
            </g>
          </g>
          {/* PIANO 5 — cenere che scende e particelle vicine (1,6) */}
          <g transform={L(1.6)}>
            {Array.from({ length: 14 }, (_, i) => {
              const y = mod(i * 151 + t * (40 + i * 4), 1400) + 500;
              return <rect key={i} x={mod(i * 211 + Math.sin(t + i) * 30, 1080)} y={y} width="8" height="5" fill="#2A2A2A" opacity=".5" />;
            })}
            <NearMotes id="fi-near" t={t} color="#E8D8C8" n={6} r0={60} r1={150} opacity={0.1} vy={-20} />
          </g>
        </Mono>
      </g>
      <Finish id="fi" tint={mono > 0.5 ? '#3A3A40' : '#8A3A2A'} tintOpacity={0.08} />
    </svg>
  );
};
