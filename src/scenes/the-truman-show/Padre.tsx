import React from 'react';
import { camera, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Clouds, Glow, Lightning, NearMotes, Rain, Reflection, WaveBand, WaveLines, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';

// Il padre: ricordo — barca a vela rovesciata in un mare in tempesta di notte; un ponte sull'acqua con un
// cartello di pericolo; un berretto da marinaio che galleggia. Nessuna figura in acqua.
// Dettaglio da studio: i lampi rivelano una americana di riflettori tra le nubi; sul lampione del ponte
// si accende una spia rossa REC.
// Piani: cielo + nubi (0,2–0,3) · ponte lontano e foschia (0,45) · barca rovesciata e mare medio (0,65–0,8)
//        · onde vicine e berretto (1,0–1,1) · scoglio/pali in primo piano (1,3) · pioggia e spruzzi (1,5–2,0)

const K = '#142235';
const r = rng(5150);
const SPRAY = Array.from({ length: 16 }, () => ({ x: 560 + r() * 320, vx: (r() - 0.5) * 300, vy: 180 + r() * 160, s: 4 + r() * 6, ph: r() }));

export const Padre: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  // due lampi: «durante una tempesta» e «non attraversa nemmeno il ponte»
  const F1 = cues[1] + 0.1, F2 = cues[3] + 0.1;
  const flash = flashAt(t, [F1, F2]);
  const flashA = flashAt(t, [F1]);
  const flashB = flashAt(t, [-9, F2], [0, 0.85]);
  // cartello del ponte che si illumina (accento) dal 2° lampo; spia REC dalla 5ª frase
  const sign = seg(t, F2, F2 + 0.6);
  const rec = t > cues[4] ? (Math.sin((t - cues[4]) * 6) > -0.2 ? 1 : 0.15) : 0;
  // barca e berretto: rollio
  const roll = Math.sin(t * 1.4) * 6;
  const bob = Math.sin(t * 1.8) * 14;
  const capX = 300 + Math.sin(t * 0.5) * 30 + t * 6;
  const capY = 1190 + Math.sin(t * 2.1 + 1) * 18;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pd" />
        <Lin id="pd-sky" stops={[[0, '#0A1424'], [0.35, '#142235'], [0.6, '#22405A'], [1, '#1A3048']]} />
        <Lin id="pd-sea" stops={[[0, '#27527A'], [1, '#0E1C2E']]} />
        <Lin id="pd-hull" x2={1} y2={0} stops={[[0, '#F4F1E6'], [0.6, '#D9DCD6'], [1, '#9AA6AE']]} />
        <Lin id="pd-bridge" stops={[[0, '#3C5670'], [1, '#1D2E44']]} />
        <Lin id="pd-front" stops={[[0, '#2C3E54'], [1, '#0B1422']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo, lampo, americana dei riflettori (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#pd-sky)" />
          <rect x="-200" y="-200" width="1480" height="2320" fill="#CFE7F4" opacity={flash * 0.4} />
          {/* americana: visibile soprattutto quando lampeggia */}
          <g opacity={0.12 + flash * 0.75} stroke="#0A1220" strokeWidth="6">
            <path d="M640 560 H1180 M640 600 H1180" />
            {Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${640 + i * 42} 560 l21 40 l21 -40`} strokeWidth="3" fill="none" />)}
            {[700, 840, 980, 1120].map((x) => (
              <g key={x}>
                <path d={`M${x} 600 v20`} />
                <rect x={x - 22} y={620} width="44" height="36" rx="6" fill="#1A2638" />
                <circle cx={x} cy={658} r="12" fill="#2C3E54" />
              </g>
            ))}
          </g>
        </g>
        <g transform={L(0.25, Math.sin(t * 0.3) * 30)}>
          <Clouds id="pd-cl" t={t} color="#46688A" seed={8} n={4} y={600} h={260} speed={0.25} opacity={0.45} />
        </g>
        <g transform={L(0.3)}>
          <path d="M-200 0 H1280 V330 Q1060 280 880 330 Q700 270 520 320 Q340 280 160 330 Q0 300 -200 330 Z" fill="#0E1A2C" />
          <path d="M-200 330 Q0 300 160 330 Q340 280 520 320 Q700 270 880 330 Q1060 280 1280 330" fill="none" stroke="#4E7A9C" strokeWidth="5" opacity={0.4 + flash * 0.6} />
        </g>
        {/* fulmini */}
        <g transform={L(0.2)}>
          <Lightning x={930} y={330} h={520} flash={flashA} seed={11} />
          <Lightning x={180} y={320} h={480} flash={flashB} seed={23} width={6} />
        </g>

        {/* PIANO 1 — ponte lontano con cartello di pericolo e lampione (0,45) */}
        <g transform={L(0.45)}>
          <Glow id="pd-mist" x={540} y={1060} r={700} t={t} color="#4E7A9C" amp={0.03} opacity={0.25} />
          <path d="M-200 1000 Q220 930 640 1000 L640 1022 Q220 954 -200 1022 Z" fill="url(#pd-bridge)" />
          {[-40, 100, 240, 380, 520].map((x, i) => (
            <path key={i} d={`M${x} ${1010 - Math.sin(((x + 200) / 840) * Math.PI) * 70 + 10} V1080`} stroke="#1A2A40" strokeWidth="18" />
          ))}
          <path d="M-200 988 Q220 918 640 988" fill="none" stroke="#5F86A6" strokeWidth="4" opacity={0.5 + flash * 0.5} />
          {/* lampione con spia REC */}
          <path d="M600 990 V860" stroke="#1A2A40" strokeWidth="8" />
          <path d="M600 864 h26" stroke="#1A2A40" strokeWidth="6" />
          <Glow id="pd-lamp" x={628} y={872} r={70} t={t} color="#FFE7A0" amp={0.1} rate={3} opacity={0.55} />
          <circle cx="628" cy="872" r="8" fill="#FFE7A0" />
          <Glow id="pd-rec" x={598} y={900} r={30} t={t} color="#FF3B30" amp={0} opacity={rec * 0.9} />
          <circle cx="598" cy="900" r="5" fill="#FF3B30" opacity={0.25 + rec * 0.75} />
          {/* cartello di pericolo */}
          <path d="M520 990 V900" stroke="#1A2A40" strokeWidth="6" />
          <Glow id="pd-sign" x={520} y={880} r={120} t={t} color={P.accento} amp={0.08} rate={4} opacity={sign * 0.7} />
          <path d="M520 836 L566 914 H474 Z" fill={sign > 0 ? P.accento : '#B98A5E'} stroke={K} strokeWidth="5" strokeLinejoin="round" opacity={0.75 + sign * 0.25} />
          <path d="M520 860 V890" stroke={K} strokeWidth="7" strokeLinecap="round" />
          <circle cx="520" cy="903" r="4" fill={K} />
        </g>

        {/* PIANO 2 — mare lontano (0,55) e barca rovesciata (0,65) */}
        <g transform={L(0.55)}>
          <WaveBand t={t} y={1060} fill="url(#pd-sea)" foam="#8FB4CF" amp={22} w={200} speed={40} bob={8} foamWidth={4} foamOpacity={0.5} />
          <Reflection t={t} x={930} y={1080} color="#CFE7F4" n={8} w={90} gap={20} opacity={0.25 + flash * 0.5} />
        </g>
        <g transform={L(0.65)}>
          <g transform={`translate(760 ${1110 + bob * 0.6}) rotate(${roll - 8})`}>
            {/* albero spezzato che affonda, vela floscia sott'acqua */}
            <path d="M-40 30 L-210 150" stroke="#C9B48A" strokeWidth="12" strokeLinecap="round" />
            <path d="M-60 40 L-200 140 L-110 170 Z" fill="#E9E3D2" opacity=".45" />
            {/* scafo capovolto: chiglia in alto */}
            <path d="M-170 10 Q-150 -60 0 -70 Q150 -60 175 10 Q0 40 -170 10 Z" fill="url(#pd-hull)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
            <path d="M-150 -6 Q0 18 158 -6" fill="none" stroke={P.principale} strokeWidth="12" />
            <path d="M-10 -70 L0 -128 L16 -70 Z" fill="#9AA6AE" stroke={K} strokeWidth="6" strokeLinejoin="round" />
            <path d="M-120 -40 Q-40 -66 60 -60" fill="none" stroke="#FFFFFF" strokeWidth="5" opacity={0.6 + flash * 0.4} />
            <path d="M168 0 L200 30 L186 46 L160 14 Z" fill="#9AA6AE" stroke={K} strokeWidth="5" strokeLinejoin="round" />
            <path d="M-90 -50 L-96 -2 M-30 -64 L-32 10 M40 -62 L42 10 M100 -46 L106 0" stroke="#9AA6AE" strokeWidth="3" opacity=".7" />
            <path d="M120 -30 q20 6 30 24" fill="none" stroke={K} strokeWidth="4" opacity=".6" />
          </g>
          {SPRAY.map((s, i) => {
            const p = mod(t * 0.8 + s.ph, 1);
            return <circle key={i} cx={s.x + s.vx * p} cy={1110 - s.vy * p + 380 * p * p} r={s.s} fill="#E6F2F8" opacity={Math.sin(p * Math.PI) * 0.75} />;
          })}
        </g>
        <g transform={L(0.8)}>
          <WaveBand t={t} y={1150} fill="#1D3B5A" foam="#CFE3EE" amp={30} w={240} speed={70} bob={12} ph={1} foamWidth={7} foamOpacity={0.75} />
          <WaveLines t={t} ys={[1200, 1250]} color="#4E7A9C" amp={8} speed={50} width={4} opacity={0.5} />
        </g>

        {/* PIANO 3 — onde vicine e berretto da marinaio che galleggia (1,05) */}
        <g transform={L(1.05)}>
          <g transform={`translate(${capX} ${capY}) rotate(${Math.sin(t * 1.7) * 12}) scale(1.3)`}>
            <ellipse cx="0" cy="18" rx="96" ry="14" fill="#0B1422" opacity=".4" />
            {/* berretto bianco da marinaio con visiera blu */}
            <path d="M-80 6 Q-82 -44 0 -52 Q82 -44 80 6 Q0 20 -80 6 Z" fill="#F4F1E6" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d="M-78 -6 Q0 8 78 -6" fill="none" stroke={K} strokeWidth="12" />
            <path d="M-70 4 Q-20 34 50 14" fill="#22405A" stroke={K} strokeWidth="6" strokeLinejoin="round" />
            <circle cx="0" cy="-30" r="9" fill={P.principale} stroke={K} strokeWidth="4" />
            <path d="M-50 -36 Q-10 -50 30 -44" fill="none" stroke="#FFFFFF" strokeWidth="5" opacity=".8" />
          </g>
          <WaveBand t={t} y={1235} fill="#152C46" foam="#DDEBF4" amp={34} w={280} speed={110} bob={16} ph={2} foamWidth={8} foamOpacity={0.85} />
        </g>
        <g transform={L(1.15)}>
          <WaveBand t={t} y={1420} fill="#0E1E33" foam="#9CC0DA" amp={40} w={320} speed={140} bob={18} ph={3} foamWidth={7} foamOpacity={0.6} />
        </g>

        <g transform={L(1.15, 0, Math.sin(t * 1.9 + 2) * 14)}>
          <g transform={`translate(${640 - t * 8} 1520) rotate(${-14 + Math.sin(t * 1.5) * 5})`}>
            <path d="M-170 0 H90" stroke={K} strokeWidth="22" strokeLinecap="round" />
            <path d="M-170 0 H90" stroke="#C9A36E" strokeWidth="12" strokeLinecap="round" />
            <path d="M80 -24 Q190 -28 210 0 Q190 28 80 24 Z" fill="#C9A36E" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          </g>
        </g>
        {/* PIANO 4 — pali del pontile in primo piano che incorniciano (1,3) */}
        <g transform={L(1.3)}>
          <path d="M-40 1990 V1300 Q20 1268 96 1290 L110 1990 Z" fill="url(#pd-front)" stroke="#070D16" strokeWidth="9" strokeLinejoin="round" />
          <path d="M975 1990 L985 1210 Q1050 1186 1120 1206 V1990 Z" fill="url(#pd-front)" stroke="#070D16" strokeWidth="9" strokeLinejoin="round" />
          <path d="M-20 1310 Q30 1286 80 1300 M995 1222 Q1050 1200 1100 1214" fill="none" stroke="#8FB4CF" strokeWidth="5" opacity={0.5 + flash * 0.5} />
          <path d="M985 1400 H1120 M985 1560 H1120 M-40 1500 H105" stroke="#070D16" strokeWidth="6" />
          <path d="M100 1350 C260 1420 420 1430 560 1380 C720 1330 860 1320 985 1260" fill="none" stroke="#5C4A36" strokeWidth="9" strokeLinecap="round" />
        </g>
        <g transform={L(1.2)}>
          <WaveBand t={t} y={1600} fill="#0A1626" foam="#7FA6C4" amp={36} w={300} speed={160} bob={14} ph={4} foamWidth={6} foamOpacity={0.5} />
        </g>

        {/* PIANO 5 — pioggia su due livelli e gocce vicine (0,5 / 1,5–2,0) */}
        <g transform={L(0.5)}>
          <Rain t={t} level="far" seed={7} color="#8FB4CF" opacity={0.3} />
        </g>
        <g transform={L(1.5)}>
          <Rain t={t} level="near" seed={19} color="#CFE3EE" opacity={0.45} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="pd-near" t={t} color="#CFE3EE" n={7} vx={-60} vy={60} opacity={0.14} />
        </g>
      </g>

      <rect width="1080" height="1920" fill="#E8F4FA" opacity={flash * 0.12} />
      <Finish id="pd" tint="#142235" tintOpacity={0.13} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): lampo 1 ≈ 2,5 · lampo 2 + cartello ≈ 5,9 · spia REC da ≈ 7,75.
