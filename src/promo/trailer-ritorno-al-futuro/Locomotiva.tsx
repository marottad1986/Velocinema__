import React from 'react';
import { mod, rng } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, NearMotes, Smoke } from '../../lib/elements';
import { TimeCar } from '../../scenes/ritorno-al-futuro/Linee';
import { K, SEPIA, YEL, cam, type ShotProps } from './comune';

// 1885: la locomotiva a vapore (generica, nel nostro stile) spinge l'auto del tempo sul ponte di legno, al tramonto.
// Inquadratura bassa e di lato, la camera corre con il treno: le mese e i piloni del ponte scorrono veloci verso
// sinistra, le ruote motrici girano con la biella, il fumo nero esce dal fumaiolo con le scintille, il vapore sbuffa dai
// cilindri. Davanti, l'auto del tempo (coupé generica dello schema) con le bobine accese e le scie gialle tratteggiate.
// Piani: cielo (0,1) · mese lontane (scorrono lente) · canyon e piloni (scorrono veloci) · locomotiva e auto (fisse con la
// camera) · fumo, vapore e scintille (1,4) · traversine in primo piano (veloci).

const r = rng(1890);
const SPARKS = Array.from({ length: 22 }, () => ({ ph: r(), dx: -200 - r() * 500, dy: -100 - r() * 300, s: 3 + r() * 4 }));
const W = [{ x: 150, r: 112 }, { x: 390, r: 112 }, { x: 610, r: 64 }];

const Wheel: React.FC<{ x: number; R: number; a: number }> = ({ x, R, a }) => (
  <g transform={`translate(${x} ${1150 - R})`}>
    <circle r={R} fill="#8A2A22" stroke={K} strokeWidth="10" />
    <circle r={R * 0.84} fill="#2A1A14" stroke={K} strokeWidth="4" />
    <g transform={`rotate(${a})`}>
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M0 0 L${R * 0.82} 0`} stroke="#B8402E" strokeWidth={R * 0.08} transform={`rotate(${i * 36})`} />)}
      {R > 80 && <path d={`M0 0 L${R * 0.55} 0`} stroke="#C8962E" strokeWidth="18" strokeLinecap="round" />}
    </g>
    <circle r={R * 0.18} fill="#C8962E" stroke={K} strokeWidth="5" />
    <path d={`M${-R * 0.7} ${-R * 0.7} A${R} ${R} 0 0 1 ${R * 0.4} ${-R * 0.92}`} fill="none" stroke="#FFD8A0" strokeWidth="5" opacity=".5" />
  </g>
);

export const Locomotiva: React.FC<ShotProps> = ({ t, dur, id }) => {
  const C = cam(t, dur, { z: 0.06, pan: 20, cy: 950 });
  const a = t * 520; // giri delle ruote motrici
  const crank = (a * Math.PI) / 180;
  const pin = (x: number) => [x + Math.cos(crank) * 62, 1038 + Math.sin(crank) * 62];
  const [p1x, p1y] = pin(W[0].x), [p2x, p2y] = pin(W[1].x);
  const run = (v: number, tile: number) => -mod(t * v, tile);
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <Lin id={`${id}-sky`} stops={[[0, '#1E1028'], [0.22, '#4A1E32'], [0.4, '#B8503A'], [0.5, '#F0A050'], [0.54, '#F6C878'], [1, '#F6C878']]} />
        <Lin id={`${id}-boiler`} stops={[[0, '#4A5A4A'], [0.35, '#2A3A30'], [1, '#121A16']]} />
        <Lin id={`${id}-wood`} stops={[[0, '#6A4428'], [1, '#2A180E']]} />
      </defs>
      <g transform={C.transform}>
        <rect x="-200" width="1480" height="1920" fill={`url(#${id}-sky)`} />
        <Glow id={`${id}-sun`} x={300} y={980} r={380} t={t} color="#FFD27A" amp={0.03} rate={1} opacity={0.6} />
        {/* mese lontane che scorrono piano */}
        <g transform={`translate(${run(80, 1200)} 0)`}>
          {[0, 1].map((k) => (
            <path key={k} transform={`translate(${k * 1200} 0)`} d="M-100 1000 V900 L60 890 L80 840 L300 835 L320 890 L520 900 L540 860 L700 855 L720 905 L900 910 L920 870 L1060 866 L1080 910 L1300 920 V1000 Z" fill="#7A3438" />
          ))}
        </g>
        {/* il canyon sotto il ponte e i piloni di legno che scorrono veloci */}
        <rect x="-200" y="1000" width="1480" height="920" fill="#3A1A1A" />
        <g transform={`translate(${run(900, 300)} 0)`}>
          {Array.from({ length: 6 }, (_, i) => (
            <g key={i} transform={`translate(${i * 300} 0)`}>
              <path d="M0 1170 L-60 1920 M0 1170 L60 1920 M-40 1400 L40 1400 M-50 1650 L50 1650 M-40 1400 L50 1650 M40 1400 L-50 1650" stroke="#2A160C" strokeWidth="16" />
            </g>
          ))}
        </g>
        {/* il binario sul ponte */}
        <rect x="-200" y="1150" width="1480" height="34" fill={`url(#${id}-wood)`} stroke={K} strokeWidth="6" />
        <path d="M-200 1150 H1280" stroke="#C8B8A0" strokeWidth="8" />
        <g transform={`translate(${run(900, 70)} 0)`}>
          {Array.from({ length: 22 }, (_, i) => <rect key={i} x={i * 70 - 40} y="1156" width="26" height="40" fill="#3A2416" stroke={K} strokeWidth="3" />)}
        </g>
        <Glow id={`${id}-tg`} x={1000} y={1100} r={240} t={t} color={YEL} amp={0.15} rate={12} opacity={0.5} />
        {/* l'auto, spinta dalla locomotiva; sotto, le scie gialle del viaggio nel tempo lungo il binario */}
        <g transform={`translate(1010 ${1104 + Math.sin(t * 30) * 2})`}><TimeCar T={t} glow={1} s={2} ink={K} /></g>
        {[1138, 1166].map((y) => (
          <path key={y} d={`M780 ${y} H1300`} stroke={YEL} strokeWidth="14" strokeDasharray="50 30" strokeDashoffset={t * 900} strokeLinecap="round" />
        ))}
        {/* la locomotiva */}
        <g transform={`translate(0 ${Math.sin(t * 24) * 3})`} strokeLinejoin="round">
          {/* cabina che esce dal bordo, con la luce del focolare */}
          <rect x="-200" y="620" width="230" height="380" fill="#3A2A20" stroke={K} strokeWidth="10" />
          <path d="M-210 610 H50 L30 580 H-210 Z" fill="#1E140E" stroke={K} strokeWidth="8" />
          <rect x="-120" y="680" width="110" height="120" fill="#FFB050" stroke={K} strokeWidth="7" />
          <Glow id={`${id}-fire`} x={-65} y={740} r={160} t={t} color="#FF9A3A" amp={0.2} rate={11} opacity={0.6} />
          {/* caldaia con le fasce di ottone */}
          <rect x="20" y="760" width="660" height="210" rx="40" fill={`url(#${id}-boiler)`} stroke={K} strokeWidth="10" />
          {[120, 260, 400, 540].map((x) => <path key={x} d={`M${x} 762 V968`} stroke="#C8962E" strokeWidth="14" />)}
          <path d="M40 778 H660" stroke="#FFE0A8" strokeWidth="5" opacity=".55" />
          {/* duomo, fumaiolo a imbuto, fanale */}
          <path d="M300 760 Q300 700 350 700 Q400 700 400 760 Z" fill="#C8962E" stroke={K} strokeWidth="8" />
          <path d="M540 760 V640 L490 560 H670 L620 640 V760 Z" fill="#1E1A18" stroke={K} strokeWidth="10" />
          <path d="M500 572 H660" stroke="#FFE0A8" strokeWidth="4" opacity=".5" />
          <rect x="640" y="660" width="80" height="80" rx="8" fill="#C8962E" stroke={K} strokeWidth="8" />
          <circle cx="690" cy="700" r="24" fill="#FFF0B0" />
          <Glow id={`${id}-lamp`} x={700} y={700} r={170} t={t} color="#FFE7A0" amp={0.05} rate={4} opacity={0.7} />
          {/* telaio, cilindro con il pistone, biella che collega le ruote */}
          <rect x="20" y="960" width="690" height="40" fill="#2A1A14" stroke={K} strokeWidth="8" />
          <rect x="560" y="990" width="140" height="80" rx="10" fill="#3A3A34" stroke={K} strokeWidth="8" />
          <path d="M700 980 L790 1150 H700 Z" fill="#8A2A22" stroke={K} strokeWidth="8" />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M${712 + i * 18} 1004 L${728 + i * 18} 1146`} stroke={K} strokeWidth="5" />)}
          {W.map((w) => <Wheel key={w.x} x={w.x} R={w.r} a={w.r > 80 ? a : a * 1.75} />)}
          <path d={`M${p1x} ${p1y} L${p2x} ${p2y}`} stroke="#C8C0B0" strokeWidth="18" strokeLinecap="round" />
          <path d={`M${p2x} ${p2y} L620 1030`} stroke="#A8A090" strokeWidth="16" strokeLinecap="round" />
          <circle cx={p1x} cy={p1y} r="12" fill="#C8962E" stroke={K} strokeWidth="4" />
          <circle cx={p2x} cy={p2y} r="12" fill="#C8962E" stroke={K} strokeWidth="4" />
        </g>
        {/* fumo nero dal fumaiolo, vapore bianco dai cilindri, scintille */}
        <g transform={C.L(1.4)}>
          <Smoke id={`${id}-sm`} t={t} x={580} y={540} color="#7A6A6E" n={16} rise={360} wind={-1000} r0={70} r1={260} speed={0.9} opacity={1} />
          <Smoke id={`${id}-sm2`} t={t + 0.4} x={580} y={540} color="#4A3E44" n={10} rise={300} wind={-900} r0={50} r1={200} speed={0.9} opacity={0.9} />
          <Smoke id={`${id}-st`} t={t} x={640} y={1060} color="#F2ECE6" n={8} rise={60} wind={-500} r0={30} r1={130} speed={1.4} opacity={0.75} />
          {SPARKS.map((s, i) => {
            const u = mod(t * 1.6 + s.ph, 1);
            return <circle key={i} cx={580 + s.dx * u} cy={560 + s.dy * u} r={s.s * (1 - u)} fill={i % 2 ? '#FFD27A' : '#FF8A3A'} opacity={1 - u} />;
          })}
          <NearMotes id={`${id}-near`} t={t} color="#F2C890" opacity={0.08} vx={-400} />
        </g>
      </g>
      <Finish id={id} tint={SEPIA} tintOpacity={0.1} />
    </svg>
  );
};
