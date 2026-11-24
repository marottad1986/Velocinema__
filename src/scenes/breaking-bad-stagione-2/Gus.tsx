import React from 'react';
import { camera, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Glow, NearMotes, Reflection, Stars } from '../../lib/elements';
import { DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { BBDefs } from '../breaking-bad-stagione-1/Comuni';
import { Auto, BB2Defs, K, ORO, Ombra } from './Comuni';

// La consegna e la nascita: il parcheggio di una stazione di servizio per camion di notte. Persone mai: Gus è l'insegna
// del suo fast food di pollo sul palo, Jesse è la chiamata senza risposta, Walter è la sua auto con il bagagliaio, la
// figlia che nasce sono le chiamate perse di Skyler. Eventi: prima frase si accende l'insegna gialla e rossa con la
// coscia di pollo; seconda frase sul cellulare appoggiato sul tetto dell'auto compare «JESSE · nessuna risposta»; terza
// frase il bagagliaio si apre sui pacchi di cristalli (la consegna) e il cellulare si riempie: «SKYLER · 12 chiamate perse».
// Piani: cielo e stelle (0,2) · insegna sul palo e colline (0,35) · pensilina con le pompe e il camion (0,5)
//        · auto con il bagagliaio e il cellulare (0,72) · asfalto, coni e bidone in primo piano (1,2) · insetti nel neon (1,6)

const r = rng(2207);
const BUGS = Array.from({ length: 12 }, () => ({ a: r() * 6.28, rr: 30 + r() * 90, sp: 1 + r() * 2 }));

export const Gus: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const tSign = griglia(cues[0] + 1.4);
  const tJesse = griglia(cues[1] + 0.8);
  const tTrunk = griglia(cues[2] + 0.4);
  const tCalls = griglia(cues[2] + 1.6);
  const sign = t < tSign ? 0.08 : t < tSign + 0.45 ? (Math.sin((t - tSign) * 40) > 0 ? 1 : 0.2) : 1;
  const trunk = eo(seg(t, tTrunk, tTrunk + 0.5));
  const jesse = seg(t, tJesse, tJesse + 0.2);
  const calls = seg(t, tCalls, tCalls + 0.2);
  const buzz = t > tCalls ? Math.sin(t * 60) * 3 * (Math.sin(t * 4) > 0 ? 1 : 0) : t > tJesse && t < tJesse + 1.2 ? Math.sin(t * 60) * 2 : 0;
  const n = t < tCalls ? 0 : Math.min(12, 1 + Math.floor((t - tCalls) * 10));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="gu" />
        <BBDefs id="gu" />
        <BB2Defs id="gu" />
        <Lin id="gu-sky" stops={[[0, '#040612'], [0.45, '#0E1630'], [0.62, '#1E2A48'], [0.7, '#3A3850']]} />
        <Lin id="gu-asph" stops={[[0, '#3A3A40'], [0.5, '#22222A'], [1, '#0C0C10']]} />
        <Lin id="gu-canopy" stops={[[0, '#E8E8E0'], [1, '#A8A8A0']]} />
        <Lin id="gu-truck" x2={1} y2={0} stops={[[0, '#8A2A22'], [0.5, '#C83A2A'], [1, '#6A1A14']]} />
        <Lin id="gu-pole" stops={[[0, '#FFE04A'], [1, '#F2A020']]} />
        <radialGradient id="gu-pool"><stop offset="0" stopColor="#FFF6D8" stopOpacity=".55" /><stop offset="1" stopColor="#FFF6D8" stopOpacity="0" /></radialGradient>
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo notturno con le stelle (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#gu-sky)" />
          <Stars t={t} seed={27} n={70} y={0} h={900} color="#E8EEF8" size={2.4} />
        </g>

        {/* PIANO 1 — colline buie e l'insegna del fast food di pollo sul palo alto (0,35) */}
        <g transform={L(0.35)}>
          <path d="M-200 1000 Q100 930 380 970 T900 950 T1280 980 V1100 H-200 Z" fill="#14141E" />
          <g transform="translate(300 850) scale(0.9)">
            <path d="M-10 0 V300 M10 0 V300" stroke="#4A4A50" strokeWidth="14" />
            <rect x="-170" y="-150" width="340" height="190" rx="24" fill="#2A1A14" stroke={K} strokeWidth="8" />
            <rect x="-160" y="-140" width="320" height="170" rx="20" fill="url(#gu-pole)" opacity={0.25 + 0.75 * sign} />
            {/* coscia di pollo */}
            <g transform="translate(-112 -64) rotate(-30) scale(0.8)" opacity={0.4 + 0.6 * sign}>
              <ellipse cx="0" cy="-12" rx="40" ry="30" fill="#C8642A" stroke={K} strokeWidth="5" />
              <path d="M26 6 L58 30" stroke="#F2EEE4" strokeWidth="12" strokeLinecap="round" />
              <circle cx="62" cy="26" r="9" fill="#F2EEE4" stroke={K} strokeWidth="3" /><circle cx="56" cy="36" r="9" fill="#F2EEE4" stroke={K} strokeWidth="3" />
            </g>
            <text x="56" y="-48" textAnchor="middle" fontFamily={DISPLAY} fontWeight="800" fontSize="58" fill="#C8281E" opacity={0.4 + 0.6 * sign}>POLLO</text>
            <text x="40" y="4" textAnchor="middle" fontFamily={SANS} fontWeight="800" fontSize="30" fill="#7A1A12" opacity={0.4 + 0.6 * sign}>FRITTO · 24 ORE</text>
            <Glow id="gu-sign" x={0} y={-56} r={330} t={t} color="#FFC83A" amp={0.04} rate={3} opacity={0.55 * sign} />
            {BUGS.map((b, i) => <circle key={i} cx={Math.cos(b.a + t * b.sp) * b.rr * 1.6} cy={-56 + Math.sin(b.a * 2 + t * b.sp * 1.3) * b.rr * 0.7} r="2.5" fill="#FFF2C0" opacity={0.7 * sign} />)}
          </g>
        </g>

        {/* PIANO 2 — pensilina con le pompe accese e il camion fermo (0,5) */}
        <g transform={L(0.5)}>
          <rect x="-200" y="1080" width="1480" height="900" fill="url(#gu-asph)" />
          <g transform="translate(760 1090)">
            <rect x="-360" y="-280" width="720" height="60" fill="url(#gu-canopy)" stroke={K} strokeWidth="8" />
            <path d="M-360 -240 H360" stroke="#C8281E" strokeWidth="12" />
            <path d="M-280 -220 V0 M280 -220 V0" stroke="#C8C8C0" strokeWidth="18" />
            {[-120, 120].map((px) => (
              <g key={px}>
                <rect x={px - 34} y="-130" width="68" height="130" rx="6" fill="#E8E2D0" stroke={K} strokeWidth="6" />
                <rect x={px - 24} y="-118" width="48" height="30" fill="#3AF07A" opacity=".7" />
                <path d={`M${px + 34} -80 q30 10 24 60`} stroke={K} strokeWidth="5" fill="none" />
              </g>
            ))}
            {[-200, 0, 200].map((lx) => <rect key={lx} x={lx - 40} y="-222" width="80" height="10" fill="#FFFFFF" />)}
            <ellipse cx="0" cy="10" rx="420" ry="50" fill="url(#gu-pool)" />
            <Glow id="gu-can" x={0} y={-200} r={460} t={t} color="#F2F6FF" amp={0.02} rate={20} opacity={0.35} />
          </g>
          {/* camion a destra, mezzo fuori */}
          <g transform="translate(1180 1100) scale(0.7)">
            <Ombra id="gu" x={-150} y={6} rx={400} ry={30} />
            <rect x="-560" y="-420" width="520" height="340" fill="#D8D8D0" stroke={K} strokeWidth="9" />
            <path d="M-40 -380 H120 L200 -260 V-80 H-40 Z" fill="url(#gu-truck)" stroke={K} strokeWidth="9" />
            <path d="M0 -360 H110 L170 -270 H0 Z" fill="#1A2430" stroke={K} strokeWidth="5" />
            {[-480, -380, 120].map((wx) => <circle key={wx} cx={wx} cy="-60" r="56" fill="#121414" stroke={K} strokeWidth="8" />)}
            <rect x="180" y="-180" width="30" height="40" rx="6" fill="#FFF2C0" />
          </g>
        </g>

        {/* PIANO 3 — l'auto di Walter: bagagliaio con i pacchi, il cellulare sul tetto (0,72) */}
        <g transform={L(0.72)}>
          <Reflection t={t} x={760} y={1120} color="#F2F6FF" n={6} w={260} gap={22} opacity={0.3} />
          <g transform="translate(560 1290)">
            <Auto id="gu" x={0} y={0} s={0.82} t={t} trunk={trunk} />
            {/* i pacchi di cristalli nel bagagliaio aperto */}
            {trunk > 0 && (
              <g transform="translate(-250 -160)" opacity={trunk}>
                {[[-40, 0], [20, -4], [80, 0], [-10, -34], [50, -38]].map(([px, py], i) => (
                  <g key={i} transform={`translate(${px} ${py})`}>
                    <rect x="-30" y="-30" width="60" height="34" rx="6" fill="#E8F2F4" stroke={K} strokeWidth="4" />
                    <path d="M-30 -14 H30" stroke={ORO} strokeWidth="5" />
                  </g>
                ))}
                <Glow id="gu-load" x={20} y={-30} r={200} t={t} color={ORO} amp={0.06} rate={3} opacity={0.6} />
              </g>
            )}
            {/* cellulare a conchiglia sul tetto dell'auto */}
            <g transform={`translate(${200 + buzz} -250) scale(0.8)`}>
              <Glow id="gu-ph" x={0} y={-70} r={170} t={t} color={calls > 0 ? '#FFB0C8' : '#9AF0C0'} amp={0.1} rate={8} opacity={0.5 * Math.max(jesse, calls)} />
              <rect x="-80" y="-150" width="160" height="150" rx="14" fill="#2A2E34" stroke={K} strokeWidth="7" />
              <rect x="-66" y="-136" width="132" height="110" rx="6" fill={jesse > 0 || calls > 0 ? '#E8F6EE' : '#1A2420'} />
              {calls > 0 ? (
                <>
                  <text x="0" y="-104" textAnchor="middle" fontFamily={SANS} fontWeight="900" fontSize="24" fill="#C8281E">SKYLER</text>
                  <text x="0" y="-70" textAnchor="middle" fontFamily={SANS} fontWeight="900" fontSize="34" fill="#1A2A3A">{n}</text>
                  <text x="0" y="-40" textAnchor="middle" fontFamily={SANS} fontWeight="800" fontSize="17" fill="#1A2A3A">chiamate perse</text>
                </>
              ) : jesse > 0 ? (
                <>
                  <text x="0" y="-96" textAnchor="middle" fontFamily={SANS} fontWeight="900" fontSize="26" fill="#1A2A3A">JESSE</text>
                  <text x="0" y="-62" textAnchor="middle" fontFamily={SANS} fontWeight="800" fontSize="18" fill="#C8281E">nessuna</text>
                  <text x="0" y="-40" textAnchor="middle" fontFamily={SANS} fontWeight="800" fontSize="18" fill="#C8281E">risposta</text>
                </>
              ) : null}
              <path d="M-80 -10 H80" stroke="#4A4E54" strokeWidth="6" />
            </g>
          </g>
        </g>

        {/* PIANO 4 — asfalto vicino, coni e un bidone in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1480 H1280 V2200 H-200 Z" fill="#141418" />
          <path d="M-200 1480 H1280" stroke="#3A3A44" strokeWidth="5" />
          {[0, 1, 2].map((k) => <path key={k} d={`M${100 + k * 340} 1600 l120 0`} stroke="#E8D23A" strokeWidth="14" opacity=".6" />)}
          <g transform="translate(110 1900)">
            <path d="M-110 0 L-80 -300 H80 L110 0 Z" fill="#3A5A3A" stroke={K} strokeWidth="9" />
            {[-220, -110].map((y) => <path key={y} d={`M-100 ${y} H100`} stroke="#1E3A1E" strokeWidth="10" />)}
            <ellipse cx="0" cy="-300" rx="84" ry="16" fill="#2A4A2A" stroke={K} strokeWidth="6" />
          </g>
          {[880, 990].map((cx, i) => (
            <g key={i} transform={`translate(${cx} ${1900 - i * 20})`}>
              <path d="M-60 0 L-14 -200 H14 L60 0 Z" fill="#F27A2A" stroke={K} strokeWidth="7" />
              <path d="M-40 -80 H40 M-30 -130 H30" stroke="#FFFFFF" strokeWidth="14" />
              <rect x="-80" y="-10" width="160" height="20" fill="#F27A2A" stroke={K} strokeWidth="6" />
            </g>
          ))}
        </g>

        {/* PIANO 5 — particelle vicine (1,6) */}
        <g transform={L(1.6)}>
          <NearMotes id="gu-near" t={t} color="#FFE8C0" n={6} r0={70} r1={150} opacity={0.1} />
          {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={mod(i * 151 + t * 18, 1080)} cy={mod(i * 211 - t * 10, 800) + 700} r="2.5" fill="#FFF2C0" opacity=".35" />)}
        </g>
      </g>
      <Finish id="gu" tint="#142235" tintOpacity={0.12} />
    </svg>
  );
};
