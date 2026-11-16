import React from 'react';
import { camera, eo, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes, Smoke, flashAt } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { GOLD, K, Mouse, Spool } from './Comuni';

// Un'esecuzione crudele: la stanza delle esecuzioni nella penombra. Su «John lo guarisce» nell'angolo il topolino, con il
// suo rocchetto, si rialza in un alone dorato; su «non bagna apposta la spugna» la luce cade sul vassoio: la spugna secca e
// screpolata accanto al secchio d'acqua intatto; su «muore bruciato» la lampadina sfarfalla, due lampi, scintille dai cavi
// del casco e fumo. La sedia è vuota e vista di lato, mai in primo piano. Nessuna persona.
// Piani: muro con la finestrella dei testimoni (0,25) · sedia e casco (0,55) · tavolino con spugna e secchio (0,85) ·
// topolino nell'angolo (1,0) · catena e lampadina in primo piano (1,25) · fumo e pulviscolo (1,6)

export const Spugna: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const heal = eo(seg(t, griglia(cues[0] + 1.2), griglia(cues[0] + 1.2) + 1.0));
  const dry = eo(seg(t, griglia(cues[1] + 0.4), griglia(cues[1] + 0.4) + 0.8));
  const s0 = griglia(cues[2] + 0.4);
  const burn = seg(t, s0, s0 + 0.2) * (1 - seg(t, dur - 1.2, dur));
  const flash = flashAt(t, [s0, s0 + 1.25]);
  const flick = burn > 0 ? 0.4 + 0.6 * Math.abs(Math.sin(t * 29) * Math.sin(t * 11)) : 1;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sp" />
        <Lin id="sp-wall" stops={[[0, '#1A1E18'], [0.6, '#2A2E26'], [1, '#141812']]} />
        <Lin id="sp-floor" stops={[[0, '#2E5A3A'], [1, '#14281A']]} />
        <Lin id="sp-wood" x2={1} y2={0} stops={[[0, '#6A4A2A'], [1, '#3A2614']]} />
        <linearGradient id="sp-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE6A8" stopOpacity=".5" />
          <stop offset="1" stopColor="#FFE6A8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#sp-wall)" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M-200 ${560 + i * 100} H1280`} stroke="#10140E" strokeWidth="4" />)}
          {/* la finestrella dei testimoni, con la tendina tirata */}
          <rect x="660" y="600" width="300" height="180" fill="#0E120C" stroke={K} strokeWidth="8" />
          <path d="M670 610 Q740 700 700 770 M950 610 Q880 700 920 770" stroke="#4A3A2A" strokeWidth="14" fill="none" />
          <path d="M670 610 H950" stroke="#5A4630" strokeWidth="18" />
          <rect x="-200" y="1300" width="1480" height="900" fill="url(#sp-floor)" />
          <path d="M-200 1300 H1280" stroke={K} strokeWidth="8" />
        </g>
        {/* la sedia vuota, di lato, sulla pedana, con il casco e i cavi appesi */}
        <g transform={L(0.55, 0, 150)}>
          <rect x="140" y="1240" width="460" height="60" fill="#3A2E20" stroke={K} strokeWidth="7" />
          <path d="M220 640 V1240 M250 640 V1240" stroke="url(#sp-wood)" strokeWidth="40" />
          <rect x="200" y="620" width="70" height="640" fill="url(#sp-wood)" stroke={K} strokeWidth="8" />
          <rect x="230" y="960" width="300" height="60" fill="url(#sp-wood)" stroke={K} strokeWidth="8" />
          <path d="M500 1020 V1240 M260 1020 V1240" stroke="#4A321C" strokeWidth="34" />
          <rect x="300" y="860" width="230" height="36" fill="url(#sp-wood)" stroke={K} strokeWidth="7" />
          <path d="M520 896 V960" stroke="#4A321C" strokeWidth="26" />
          {[700, 820].map((y) => <rect key={y} x="196" y={y} width="78" height="22" fill="#2A1E12" stroke={K} strokeWidth="4" />)}
          {/* il casco appeso con i cavi */}
          <path d="M370 380 V560" stroke="#2A2A24" strokeWidth="8" />
          <g transform="translate(370 600)">
            <path d="M-70 10 Q-70 -60 0 -64 Q70 -60 70 10 Z" fill="#5A5A50" stroke={K} strokeWidth="7" />
            <rect x="-76" y="6" width="152" height="18" rx="6" fill="#3A3A32" stroke={K} strokeWidth="5" />
            <circle cx="0" cy="-64" r="14" fill="#8A8A7A" stroke={K} strokeWidth="5" />
          </g>
          <path d="M384 540 Q600 480 700 600 Q760 700 720 1240" stroke="#1A1A16" strokeWidth="10" fill="none" />
          {burn > 0 && (
            <g opacity={burn}>
              <Glow id="sp-arc" x={370} y={600} r={240} t={t} color="#CFE8FF" amp={0.3} rate={23} opacity={0.6 * flick} />
              {Array.from({ length: 10 }, (_, i) => {
                const a = (i / 10) * Math.PI * 2 + t * 6;
                const r = 50 + 60 * Math.abs(Math.sin(t * 17 + i));
                return <path key={i} d={`M${370 + Math.cos(a) * 30} ${600 + Math.sin(a) * 20} L${370 + Math.cos(a) * r} ${600 + Math.sin(a) * r * 0.8}`} stroke="#E8F4FF" strokeWidth="4" strokeLinecap="round" opacity={Math.abs(Math.sin(t * 40 + i))} />;
              })}
            </g>
          )}
        </g>
        {/* il tavolino con la spugna secca e il secchio d'acqua intatto */}
        <g transform={L(0.85)}>
          <rect x="640" y="1080" width="340" height="30" fill="#5A4630" stroke={K} strokeWidth="7" />
          <path d="M670 1110 V1300 M950 1110 V1300" stroke={K} strokeWidth="14" />
          <rect x="680" y="1040" width="170" height="40" rx="6" fill="#8A8A80" stroke={K} strokeWidth="5" />
          <g transform="translate(765 1030)">
            <Glow id="sp-dry" x={0} y={0} r={160} t={t} color={GOLD} amp={0.08} rate={3} opacity={0.5 * dry} />
            <path d="M-60 0 Q-64 -40 -30 -46 H34 Q64 -40 60 0 Z" fill="#D8B860" stroke={K} strokeWidth="6" />
            {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={-40 + (i % 5) * 20} cy={-30 + Math.floor(i / 5) * 18} r="4" fill="#A8883A" />)}
            {dry > 0 && <path d="M-30 -40 l10 14 l-6 12 M20 -42 l-8 12 l10 10" stroke="#7A5A20" strokeWidth="4" fill="none" opacity={dry} />}
          </g>
          <g transform="translate(910 1080)">
            <path d="M-60 0 L-50 -110 H50 L60 0 Z" fill="#8A9090" stroke={K} strokeWidth="6" />
            <ellipse cx="0" cy="-110" rx="50" ry="12" fill="#4A7A9A" stroke={K} strokeWidth="5" />
            <path d="M-50 -110 Q0 -170 50 -110" stroke={K} strokeWidth="5" fill="none" />
            <ellipse cx="-14" cy="-112" rx="16" ry="4" fill="#BFE0F0" opacity={0.5 + 0.3 * Math.sin(t * 2)} />
          </g>
        </g>
        {/* nell'angolo, il topolino guarito con il suo rocchetto */}
        <g transform={L(1.0)}>
          <path d="M-200 1310 H1280 V2200 H-200 Z" fill="#245236" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M-200 ${1380 + i * 120} H1280`} stroke="#14281A" strokeWidth="4" opacity=".6" />)}
          <Glow id="sp-mouse" x={300} y={1200} r={200} t={t} color={GOLD} amp={0.1} rate={2} opacity={0.6 * heal * (1 - 0.6 * burn)} />
          <Spool x={400} y={1230} s={1.1} roll={0} />
          <g opacity={0.35 + 0.65 * heal}>
            <Mouse x={250} y={1236 - 30 * heal + 30} s={1.1} t={t} />
          </g>
        </g>
        {/* la lampadina che pende in primo piano, con il suo cono */}
        <g transform={L(1.25)}>
          <path d="M880 -200 V340" stroke="#1A1A14" strokeWidth="8" />
          <path d="M820 380 Q880 320 940 380 Z" fill="#2E3A30" stroke={K} strokeWidth="7" />
          <circle cx="880" cy="392" r="22" fill={flick > 0.6 ? '#FFF0C0' : '#7A7A60'} />
          <path d="M860 392 L520 1300 H1260 L900 392 Z" fill="url(#sp-cone)" opacity={0.6 * flick} />
          <Glow id="sp-bulb" x={880} y={392} r={260} t={t} color="#FFE6A8" amp={0.06} rate={2} opacity={0.55 * flick} />
          <path d="M-200 1700 H1280 V2200 H-200 Z" fill="#060806" opacity=".5" />
        </g>
        <g transform={L(1.6)}>
          {burn > 0 && <Smoke id="sp-smoke" t={t - s0} x={370} y={700} color="#9AA090" n={8} rise={260} wind={140} r0={24} r1={90} speed={0.35} opacity={0.6 * burn} />}
          <Dust t={t} top={{ y: 420, x0: 820, x1: 940 }} bottom={{ y: 1300, x0: 520, x1: 1200 }} seed={41} n={20} color="#FFE6A8" boost={0.2} />
          <NearMotes id="sp-near" t={t} color="#FFE6A8" n={5} y0={1300} opacity={0.07} />
        </g>
      </g>
      {flash > 0 && <rect width="1080" height="1920" fill="#E8F4FF" opacity={flash * 0.55} />}
      <Finish id="sp" tint="#1E3A28" tintOpacity={0.12} />
    </svg>
  );
};
