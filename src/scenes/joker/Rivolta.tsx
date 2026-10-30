import React from 'react';
import { camera, eio, eo, rng, seg } from '../../lib/anim';
import { Embers, Fire, Glow, NearMotes, Smoke } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { K, Palazzo } from './Comuni';

// Gotham brucia: sulla prima frase la strada di notte in rivolta, un'auto della polizia rovesciata con i lampeggianti,
// fuochi, maschere da clown a terra e cartelli; su «uccide i Wayne davanti al figlio Bruce» un vicolo buio sotto un
// lampione con una collana di perle che si spezza e le perle che rotolano sul selciato (accento: nessuna figura); su «ride
// in manicomio» un corridoio bianco con una finestra a sbarre e impronte rosse sul pavimento che si allontanano. Nessuna persona.
// Piani: cielo arancio (0,15) · palazzi (0,35) · strada / vicolo / corridoio (0,7) · auto e oggetti (1,0) · fumo (1,3) · braci (1,6)

const r = rng(1981);
const PEARLS = Array.from({ length: 22 }, () => ({ a: r() * Math.PI * 2, v: 60 + r() * 220, s: 6 + r() * 5 }));

export const Rivolta: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const alley = eio(seg(t, cues[1] - 0.2, cues[1] + 0.6)) * (1 - eio(seg(t, cues[2] - 0.2, cues[2] + 0.6)));
  const ward = eio(seg(t, cues[2] - 0.2, cues[2] + 0.6));
  const riot = 1 - Math.max(alley, ward);
  const snap = seg(t, cues[1] + 1, cues[1] + 2.2); // la collana si spezza
  const steps = eo(seg(t, cues[2] + 0.8, dur)); // le impronte che si allontanano
  const siren = Math.sin(t * 12) > 0;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="rv" />
        <Lin id="rv-sky" stops={[[0, '#14080A'], [0.6, '#5A2014'], [1, '#C8602A']]} />
        <Lin id="rv-ward" stops={[[0, '#3A4440'], [0.35, '#8A928E'], [0.6, '#E8ECE8'], [1, '#A8B0AC']]} />
      </defs>
      <g transform={cam.transform}>
        {/* la rivolta */}
        <g opacity={riot}>
          <g transform={L(0.15)}><rect x="-200" y="-200" width="1480" height="2400" fill="url(#rv-sky)" /></g>
          <g transform={L(0.35)}>
            <Palazzo x={-180} y={1120} w={440} h={560} t={t} color="#3A2018" lit={0.15} seed={6} />
            <Palazzo x={780} y={1120} w={460} h={600} t={t} color="#2E1A14" lit={0.1} seed={8} />
            <rect x="150" y="700" width="100" height="120" fill="#1A0A06" stroke={K} strokeWidth="6" />
            <Fire id="rv-f1" t={t} x={200} y={790} scale={0.7} />
          </g>
          <g transform={L(0.7)}>
            <path d="M-200 1120 H1280 V2200 H-200 Z" fill="#1E1614" />
            <Fire id="rv-f2" t={t} x={820} y={1150} scale={1.4} />
            <Glow id="rv-fg" x={820} y={1080} r={400} t={t} color="#FF8A3A" amp={0.15} rate={7} opacity={0.6} />
          </g>
          <g transform={L(1.0)}>
            {/* auto della polizia rovesciata */}
            <g transform="translate(400 1060) rotate(180) scale(1.1)">
              <path d="M-150 0 V-50 L-100 -56 L-60 -100 H70 L110 -56 L150 -50 V0 Z" fill="#E8E8E4" stroke={K} strokeWidth="6" />
              <rect x="-150" y="-30" width="300" height="20" fill="#2A3A6A" />
              <rect x="-40" y="-120" width="80" height="20" rx="6" fill={siren ? '#3A6AE8' : P.accento} stroke={K} strokeWidth="4" />
              <circle cx="-90" cy="4" r="24" fill={K} /><circle cx="90" cy="4" r="24" fill={K} />
            </g>
            <Glow id="rv-siren" x={400} y={1190} r={260} t={t} color={siren ? '#3A6AE8' : P.accento} amp={0.1} rate={9} opacity={0.5} />
            {[[140, 1100, -20], [700, 1110, 14], [960, 1090, -8]].map(([x, y, a], i) => (
              <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
                <ellipse cx="0" cy="0" rx="46" ry="56" fill="#F2EEE4" stroke={K} strokeWidth="5" />
                <circle cx="0" cy="10" r="11" fill={P.accento} />
                <path d="M-24 28 Q0 46 24 28" stroke={P.accento} strokeWidth="6" fill="none" />
              </g>
            ))}
          </g>
        </g>
        {/* il vicolo e la collana di perle */}
        <g opacity={alley}>
          <g transform={L(0.15)}><rect x="-200" y="-200" width="1480" height="2400" fill="#08080C" /></g>
          <g transform={L(0.7)}>
            <path d="M-200 -200 L340 700 V1220 L-200 1700 Z M1280 -200 L740 700 V1220 L1280 1700 Z" fill="#2A1E1A" stroke={K} strokeWidth="6" />
            <path d="M340 1220 H740 L1280 1700 V2200 H-200 V1700 Z" fill="#3A3430" />
            <path d="M540 560 V720" stroke={K} strokeWidth="8" />
            <path d="M500 720 H580 L560 760 H520 Z" fill="#F4E8B0" stroke={K} strokeWidth="4" />
            <Glow id="rv-lamp" x={540} y={760} r={420} t={t} color="#F4E8B0" amp={0.05} rate={2} opacity={0.55} />
          </g>
          <g transform={L(1.0)}>
            {snap < 0.05 ? (
              <path d="M420 1150 Q540 1250 660 1150" stroke="#F4F0E8" strokeWidth="18" strokeDasharray="2 20" strokeLinecap="round" fill="none" />
            ) : PEARLS.map((p, i) => (
              <circle key={i} cx={540 + Math.cos(p.a) * p.v * 1.3 * snap} cy={1180 + Math.abs(Math.sin(p.a)) * p.v * 0.4 * snap} r={p.s * 1.8} fill="#F4F0E8" stroke="#8A8478" strokeWidth="2" />
            ))}
            <Glow id="rv-pearl" x={540} y={1210} r={160} t={t} color="#FFFFFF" amp={0.1} rate={3} opacity={0.3} />
          </g>
        </g>
        {/* il corridoio del manicomio con le impronte rosse */}
        <g opacity={ward}>
          <g transform={L(0.15)}><rect x="-200" y="-200" width="1480" height="2400" fill="url(#rv-ward)" /></g>
          <g transform={L(0.7)}>
            <path d="M-200 -200 L380 700 V1000 L-200 1500 Z M1280 -200 L700 700 V1000 L1280 1500 Z" fill="url(#rv-ward)" stroke="#8A908C" strokeWidth="5" />
            <rect x="380" y="700" width="320" height="300" fill="#F4F8F4" />
            <rect x="460" y="740" width="160" height="170" fill="#8AB0D0" stroke={K} strokeWidth="6" />
            {[490, 525, 560, 595].map((x) => <path key={x} d={`M${x} 740 V910`} stroke={K} strokeWidth="6" />)}
            <Glow id="rv-win" x={540} y={860} r={300} t={t} color="#FFFFFF" amp={0.04} rate={1} opacity={0.5} />
            <path d="M380 1000 H700 L1280 1500 V2200 H-200 V1500 Z" fill="#C8CCC8" />
            {/* neon a soffitto con alone, porta con lo spioncino sul muro di destra */}
            <rect x="460" y="660" width="160" height="16" rx="6" fill="#F4FFF4" />
            <Glow id="rv-neon" x={540} y={680} r={360} t={t} color="#E8FFF0" amp={0.06} rate={6} opacity={0.6} />
            <path d="M840 860 L960 960 V1230 L840 1110 Z" fill="#A8B0AC" stroke={K} strokeWidth="6" />
            <rect x="880" y="930" width="30" height="20" fill="#2A2E2C" />
          </g>
          {/* in primo piano: il bordo di una branda con la coperta */}
          <g transform={L(1.3)}>
            <rect x="-200" y="1620" width="760" height="60" rx="10" fill="#C8CCD0" stroke={K} strokeWidth="8" />
            <path d="M-200 1680 H560 V2200 H-200 Z" fill="#E8ECEE" stroke={K} strokeWidth="8" />
            <path d="M-160 1760 H520" stroke="#B8C0C4" strokeWidth="10" />
          </g>
          <g transform={L(1.0)}>
            {Array.from({ length: 10 }, (_, i) => {
              const p = i / 10;
              return p < steps ? <ellipse key={i} cx={540 + (i % 2 ? 26 : -26) * (1 - p * 0.7)} cy={1240 - p * 230} rx={22 * (1 - p * 0.6)} ry={30 * (1 - p * 0.6)} fill={P.accento} opacity={0.85 - p * 0.4} /> : null;
            })}
          </g>
        </g>
        {/* primo piano: transenne della polizia nella rivolta, mattoni e bidone nel vicolo */}
        <g transform={L(1.3)} opacity={riot}>
          {[[-120, 1620], [520, 1660]].map(([x, y], i) => <g key={i}><rect x={x} y={y} width="520" height="80" fill="#E8E0D0" stroke={K} strokeWidth="8" /><path d={`M${x + 20} ${y} l60 80 M${x + 140} ${y} l60 80 M${x + 260} ${y} l60 80 M${x + 380} ${y} l60 80`} stroke="#D2382E" strokeWidth="22" /><path d={`M${x + 60} ${y + 80} V${y + 600} M${x + 460} ${y + 80} V${y + 600}`} stroke={K} strokeWidth="16" /></g>)}
        </g>
        <g transform={L(1.3)} opacity={alley}>
          <g transform="translate(160 1640)"><rect x="-180" y="-120" width="360" height="600" rx="16" fill="#2E3A34" stroke={K} strokeWidth="9" /><rect x="-200" y="-150" width="400" height="40" rx="12" fill="#3A4840" stroke={K} strokeWidth="8" /></g>
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={600 + (i % 3) * 160} y={1660 + Math.floor(i / 3) * 80} width="150" height="70" fill="#4A2A20" stroke={K} strokeWidth="6" />)}
        </g>
        <g transform={L(1.3)} opacity={riot}>
          <Smoke id="rv-smoke" t={t} x={820} y={1000} color="#3A2A2A" rise={600} wind={-200} r0={60} r1={240} speed={0.2} opacity={0.6} />
        </g>
        <g transform={L(1.6)}>
          {riot > 0.1 && <Embers t={t} x={540} y={1300} w={1000} h={1200} n={30} />}
          <NearMotes id="rv-near" t={t} color="#FFD8B0" n={6} opacity={0.08} />
        </g>
      </g>
      <Finish id="rv" tint="#2A1410" tintOpacity={0.12} />
    </svg>
  );
};
