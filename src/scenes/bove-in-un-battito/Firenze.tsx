import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Confetti, Glow, NearMotes, Stars, flashAt } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { Ball, FloodTower, K, Pitch, Scoreboard, Stand, VIOLA } from './Comuni';

// In prestito a Firenze: sera su Firenze vista dall'alto di una tribuna inventata. Sullo sfondo la cupola del Duomo,
// il campanile e la torre di Palazzo Vecchio contro il cielo viola; sotto, il campo illuminato con la porta a destra.
// In primo piano la balaustra con una sciarpa viola che sventola (f1, il prestito). f2 «il 27 ottobre… cinque a uno»:
// il pallone gonfia la rete, il tabellone si accende «FIORENTINA 5 – 1 ROMA», coriandoli viola. Nessuna persona.
// Piani: cielo (0,2) · Firenze (0,35) · tribuna di fronte e fari (0,5) · campo e porta (0,65) · balaustra e sciarpa (1,15) · particelle (1,6)

const r0 = rng(527);

export const Firenze: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1050);
  const L = cam.layer;
  const tGol = griglia(cues[1] + 2.4);
  const shot = seg(t, tGol - 0.7, tGol); // il pallone vola verso la porta
  const bulge = eob(seg(t, tGol, tGol + 0.35), 2) * (1 - 0.6 * seg(t, tGol + 0.6, tGol + 1.6));
  const sb = eo(seg(t, tGol + 0.1, tGol + 0.5));
  const flash = flashAt(t, [tGol + 0.05]);
  const conf = seg(t, tGol, tGol + 0.4);

  // traiettoria del pallone: dal centro del campo alla rete (in alto a destra della porta)
  const bx = lerp(300, 712, eo(shot)) + 16 * bulge;
  const by = lerp(1250, 1086, eo(shot)) - Math.sin(shot * Math.PI) * 60;
  const br = lerp(30, 22, shot);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fi" />
        <Lin id="fi-sky" stops={[[0, '#120E26'], [0.3, '#2E1E52'], [0.5, '#6A3A7A'], [0.6, '#B0607A']]} />
        <Lin id="fi-dome" x2={1} y2={0} stops={[[0, '#D8785A'], [0.45, '#B8503E'], [1, '#6A2A2A']]} />
        <Lin id="fi-scarf" x2={1} y2={0} stops={[[0, '#8A62C8'], [0.5, VIOLA], [1, '#3E2470']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo viola della sera (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#fi-sky)" />
          <Stars t={t} seed={27} n={36} y={60} h={520} color="#E8E0FF" size={0.8} />
          <Glow id="fi-hz" x={500} y={1000} r={620} t={t} color="#E8909A" amp={0.03} rate={0.8} opacity={0.45} />
        </g>
        {/* PIANO 1 — Firenze: colline, tetti, Duomo, campanile, Palazzo Vecchio (0,35) */}
        <g transform={L(0.35)}>
          <path d="M-200 1000 Q100 930 380 970 T900 950 T1300 980 V1120 H-200 Z" fill="#3A2550" />
          {/* tetti con finestre accese */}
          <path d="M-200 1050 L-100 1030 L-40 1046 L60 1020 L140 1040 L240 1016 L330 1040 L460 1024 L600 1046 L700 1020 L820 1044 L940 1022 L1060 1040 L1280 1030 V1140 H-200 Z" fill="#4A2E5A" />
          {Array.from({ length: 30 }, (_, i) => (
            <rect key={i} x={-120 + i * 46 + r0() * 20} y={1056 + r0() * 50} width="9" height="12" fill="#FFD890" opacity={0.4 + 0.5 * Math.abs(Math.sin(t * 0.7 + i))} />
          ))}
          {/* la cupola: costoloni bianchi, lanterna */}
          <g transform="translate(330 1030)">
            <rect x="-150" y="-30" width="300" height="60" fill="#8A5A6A" stroke="#2A1838" strokeWidth="4" />
            <rect x="-110" y="-80" width="220" height="56" fill="#A86A6A" stroke="#2A1838" strokeWidth="4" />
            {[-80, -40, 0, 40, 80].map((x) => <circle key={x} cx={x} cy="-52" r="9" fill="#2A1838" />)}
            <path d="M-110 -80 Q-112 -230 0 -250 Q112 -230 110 -80 Z" fill="url(#fi-dome)" stroke="#2A1838" strokeWidth="5" />
            {[-80, -40, 0, 40, 80].map((x) => <path key={x} d={`M${x} -80 Q${x * 0.7} -200 0 -248`} stroke="#F2E8E0" strokeWidth="6" fill="none" />)}
            <rect x="-20" y="-300" width="40" height="52" fill="#F2E8E0" stroke="#2A1838" strokeWidth="4" />
            <path d="M-22 -300 L0 -340 L22 -300 Z" fill="#E8D8D0" stroke="#2A1838" strokeWidth="4" />
            <circle cx="0" cy="-348" r="7" fill="#F5C518" />
          </g>
          {/* campanile */}
          <g transform="translate(520 1040)">
            <rect x="-34" y="-280" width="68" height="280" fill="#C8A0A8" stroke="#2A1838" strokeWidth="4" />
            {[-220, -150, -80].map((y) => <rect key={y} x="-20" y={y} width="40" height="44" fill="#4A2A4A" />)}
            <path d="M-34 -280 H34 V-296 H-34 Z" fill="#E8D0D0" stroke="#2A1838" strokeWidth="4" />
          </g>
          {/* torre di Palazzo Vecchio */}
          <g transform="translate(690 1046)">
            <rect x="-70" y="-120" width="140" height="120" fill="#8A6A5A" stroke="#2A1838" strokeWidth="4" />
            <rect x="-24" y="-300" width="48" height="180" fill="#A07A62" stroke="#2A1838" strokeWidth="4" />
            <path d="M-36 -300 H36 V-330 H-36 Z" fill="#B88A6A" stroke="#2A1838" strokeWidth="4" />
            {[-30, -14, 2, 18].map((x) => <rect key={x} x={x} y="-342" width="10" height="14" fill="#B88A6A" />)}
            <rect x="-14" y="-380" width="28" height="40" fill="#A07A62" stroke="#2A1838" strokeWidth="4" />
            <circle cx="0" cy="-250" r="14" fill="#F2E8D0" stroke="#2A1838" strokeWidth="3" />
          </g>
          <path d="M-200 1090 H1280" stroke="#B0607A" strokeWidth="3" opacity=".3" />
        </g>
        {/* PIANO 2 — tribuna di fronte (bassa) e due torri dei fari (0,5) */}
        <g transform={L(0.5)}>
          <Stand id="fi-st" y0={1150} y1={1090} seat="#5A3E8A" alt="#E8E0F4" rows={4} wall="#1E1830" lit={0.7} seed={5} />
          {[[40, 1150], [1040, 1150]].map(([x, y], i) => (
            <g key={i}>
              <Glow id={`fi-fl${i}`} x={x} y={y - 470} r={190} t={t} color="#FFF6D8" amp={0.04} rate={2.5} ph={i} opacity={0.75} />
              <FloodTower x={x} y={y} h={500} s={0.7} />
            </g>
          ))}
        </g>
        {/* PIANO 3 — il campo e la porta a destra; il pallone gonfia la rete (0,65) */}
        <g transform={L(0.65)}>
          <Pitch id="fi-p" y0={1160} light="#3E8A3A" dark="#317632" x0={-100} x1={1180} />
          {/* luce dei fari sul prato */}
          <ellipse cx="540" cy="1300" rx="600" ry="140" fill="#F4FFE0" opacity=".1" />
          {/* porta: rete che si gonfia verso il fondo */}
          <g transform="translate(560 1236) scale(1.25)">
            <path d={`M0 0 L30 -30 L${170 + 30 * bulge} ${-40 - 10 * bulge} L240 -30 L210 0`} fill="#E8EEF0" opacity=".14" />
            <g stroke="#E8EEF0" strokeWidth="2.4" opacity=".6" fill="none">
              {Array.from({ length: 9 }, (_, i) => {
                const x = i * 26;
                const push = 26 * bulge * Math.sin((i / 8) * Math.PI);
                return <path key={i} d={`M${x} -150 Q${x + 20 + push * 0.5} ${-80} ${x + 24} -26`} transform={`translate(${push * 0.6} ${-push * 0.4})`} />;
              })}
              {Array.from({ length: 6 }, (_, i) => <path key={`h${i}`} d={`M0 ${-145 + i * 25} Q${110 + 30 * bulge} ${-160 + i * 25 - 26 * bulge} 214 ${-145 + i * 25}`} />)}
            </g>
            <path d="M0 0 V-160 H214 V0" fill="none" stroke="#F6F4EE" strokeWidth="12" strokeLinejoin="round" />
            <path d="M0 -160 L30 -190 H244 L214 -160 M244 -190 V-26" fill="none" stroke="#C8CCD6" strokeWidth="6" />
          </g>
          {/* pallone: fermo a centrocampo, poi tiro in rete */}
          {t < tGol - 0.7 ? <Ball x={300} y={1250} r={30} rot={0} /> : <Ball x={bx} y={by} r={br} rot={shot * 400} shadow={shot < 0.9} />}
          {shot > 0 && shot < 1 && <path d={`M${bx - 60} ${by + 20} L${bx - 8} ${by + 4}`} stroke="#FFFFFF" strokeWidth="5" opacity=".5" strokeLinecap="round" />}
          <Glow id="fi-gg" x={712} y={1090} r={180} t={t} color="#C8A8FF" amp={0.05} rate={3} opacity={0.6 * sb} />
        </g>
        {/* tabellone in alto a destra, sopra la città */}
        <g transform={L(0.5)}>
          <g opacity={0.45 + 0.55 * sb} transform={`translate(860 960) scale(${lerp(0.94, 1, eob(sb, 1.8))}) translate(-860 -960)`}>
            <Scoreboard id="fi-sb" x={760} y={880} w={220} h={170} t={t} on={sb} legs={60}
              lines={[{ text: '5 – 1', size: 64, color: '#FFD15A' }, { text: 'FIORENTINA · ROMA', size: 20, color: '#E8D8FF' }]} />
          </g>
        </g>
        {/* PIANO 4 — la balaustra della tribuna con la sciarpa viola che sventola (1,15) */}
        <g transform={L(1.15)}>
          <path d="M-200 1560 H1280 V2200 H-200 Z" fill="#14101E" />
          {/* gradoni vuoti, seggiolini viola in primo piano */}
          {[1640, 1760, 1880].map((y, j) => (
            <g key={y}>
              <rect x="-200" y={y + 40} width="1480" height="30" fill="#0A0812" />
              {Array.from({ length: 12 }, (_, i) => (
                <g key={i} transform={`translate(${-120 + i * 110 + j * 30} ${y})`}>
                  <path d="M0 40 V-10 Q0 -30 20 -30 H60 Q80 -30 80 -10 V40 Z" fill="#4A3270" stroke={K} strokeWidth="6" />
                  <path d="M10 -18 H70" stroke="#8A6AC8" strokeWidth="4" opacity=".6" />
                </g>
              ))}
            </g>
          ))}
          {/* balaustra */}
          <rect x="-200" y="1540" width="1480" height="30" fill="#2A2A3A" stroke={K} strokeWidth="7" />
          <path d="M-200 1542 H1280" stroke="#C8C4E0" strokeWidth="4" opacity=".55" />
          {/* sciarpa viola a strisce bianche, annodata alla balaustra, che sventola (nessuna scritta né stemma) */}
          <g transform="translate(140 1555)">
            {(() => {
              const pts = Array.from({ length: 9 }, (_, i) => {
                const u = i / 8;
                return { x: u * 640, y: -40 * u + Math.sin(t * 3.2 - u * 5) * 34 * u - 60 * u * u };
              });
              const top = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
              const bot = [...pts].reverse().map((p) => `L${(p.x + 6).toFixed(1)} ${(p.y + 74).toFixed(1)}`).join(' ');
              return (
                <g>
                  <path d={`${top} ${bot} Z`} fill="url(#fi-scarf)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
                  {[0.3, 0.55, 0.8].map((u) => {
                    const i = Math.round(u * 8), p = pts[i];
                    return <path key={u} d={`M${p.x} ${p.y + 4} L${p.x + 4} ${p.y + 70}`} stroke="#F2EEF8" strokeWidth="14" />;
                  })}
                  <path d={`M${pts[8].x} ${pts[8].y} l8 30 M${pts[8].x + 4} ${pts[8].y + 74} l10 -20`} stroke="#E8E0F4" strokeWidth="5" />
                  <path d={pts.slice(0, 6).map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y + 10}`).join(' ')} stroke="#B8A0E8" strokeWidth="4" fill="none" opacity=".6" />
                </g>
              );
            })()}
            <circle cx="0" cy="10" r="26" fill="#3E2470" stroke={K} strokeWidth="7" />
          </g>
        </g>
        {/* PIANO 5 — coriandoli viola dopo il gol, particelle vicine (1,6) */}
        <g transform={L(1.6)} opacity={conf}>
          <Confetti t={t - tGol} seed={33} n={36} colors={['#8A62C8', '#F2EEF8', '#6A48A8', '#C8B0F0']} y0={600} y1={1900} speed={0.22} />
        </g>
        <g transform={L(1.7)}>
          <NearMotes id="fi-near" t={t} color="#D8C8FF" n={6} r0={50} r1={130} y0={1100} y1={1900} opacity={0.1} />
        </g>
      </g>
      <rect width="1080" height="1920" fill="#F4F0FF" opacity={0.35 * flash} />
      <Finish id="fi" tint="#2C2456" tintOpacity={0.12} />
    </svg>
  );
};
