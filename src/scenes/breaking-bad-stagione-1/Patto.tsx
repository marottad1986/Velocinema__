import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Beam, Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { HAND } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { BBDefs, Beuta, Cristalli, K, Ombra, ORO, Pallone } from './Comuni';

// Il patto con l'ex studente: il magazzino del laboratorio di chimica della scuola, di notte. Walter prende di nascosto
// la vetreria per il nuovo lavoro. Eventi: prima frase la torcia appoggiata sullo scaffale si accende e il fascio
// scopre lo scatolone pieno di beute e un pugno di cristalli che brillano (la droga purissima che sa fare); seconda frase
// dalla busta escono a ventaglio le banconote (i soldi che Jesse porterà vendendo); terza frase sulla busta compare a
// mano «per la famiglia» e accanto una scarpina da neonato e un portachiavi (la moglie incinta e il figlio).
// Piani: parete con finestrella e luna (0,25) · scaffali di reagenti (0,45) · scaffale metallico con vetreria (0,65)
//        · cassa con scatolone, busta e torcia (0,9) · montanti in primo piano e porta socchiusa (1,25) · pulviscolo (1,6–1,8)

const r = rng(3303);
const BOTTLES = Array.from({ length: 3 }, (_, row) => Array.from({ length: 9 }, (_, i) => ({
  x: -60 + i * 132 + r() * 24, w: 46 + r() * 30, h: 80 + r() * 50, c: ['#6A4A2A', '#3A5A6A', '#E8E0D0', '#5A6A3A', '#2A2A30'][Math.floor(r() * 5)], row,
})));

export const Patto: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const torch = eo(seg(t, griglia(cues[0] + 0.1), griglia(cues[0] + 0.1) + 0.25));
  const sweep = eo(seg(t, griglia(cues[0] + 0.3), griglia(cues[0] + 0.3) + 1.6));
  const cash = eob(seg(t, griglia(cues[1] + 0.2), griglia(cues[1] + 0.2) + 0.8), 1.5);
  const write = seg(t, griglia(cues[2] + 0.2), griglia(cues[2] + 0.2) + 1.6);
  const fam = eo(seg(t, griglia(cues[2] + 1.0), griglia(cues[2] + 1.0) + 0.6));
  const scritta = 'per la famiglia';
  const beamAngle = lerp(150, 168, sweep) + 2 * Math.sin(t * 0.7);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pt" />
        <BBDefs id="pt" />
        <Lin id="pt-wall" stops={[[0, '#0A1016'], [0.4, '#16222C'], [0.75, '#1E2C34'], [1, '#10181C']]} />
        <Lin id="pt-shelf" stops={[[0, '#5A6064'], [1, '#2E3236']]} />
        <Lin id="pt-crate" x2={1} y2={0} stops={[[0, '#7A5A34'], [0.5, '#9A7444'], [1, '#4A3420']]} />
        <Lin id="pt-box" x2={1} y2={0} stops={[[0, '#B8945E'], [0.6, '#A0804C'], [1, '#6A5232']]} />
        <Lin id="pt-floor" stops={[[0, '#1A2024'], [1, '#080A0C']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete di blocchi di cemento, finestrella alta con la luna (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#pt-wall)" />
          {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M-200 ${200 + i * 60} H1280`} stroke="#000" strokeWidth="3" opacity=".22" />)}
          {Array.from({ length: 30 }, (_, i) => Array.from({ length: 8 }, (_, k) => (
            <path key={`${i}-${k}`} d={`M${-160 + k * 200 + (i % 2) * 100} ${200 + i * 60} v60`} stroke="#000" strokeWidth="3" opacity=".18" />
          )))}
          <rect x="760" y="640" width="240" height="120" fill="#2A4058" stroke={K} strokeWidth="8" />
          <circle cx="930" cy="690" r="26" fill="#DDE6F0" />
          <Glow id="pt-moon" x={930} y={690} r={160} t={t} color="#AFC4E8" amp={0.03} rate={0.8} opacity={0.5} />
          {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M${790 + i * 60} 640 V760`} stroke={K} strokeWidth="5" />)}
          <path d="M760 760 L540 1500 L280 1500 L1000 760 Z" fill="#AFC4E8" opacity=".07" />
        </g>

        {/* PIANO 1 — scaffali di legno con bottiglie di reagenti (0,45) */}
        <g transform={L(0.45)}>
          {[860, 1010, 1160].map((sy, row) => (
            <g key={row}>
              {BOTTLES[row].map((b, i) => (
                <g key={i} opacity=".85">
                  <rect x={b.x} y={sy - b.h} width={b.w} height={b.h} rx="8" fill={b.c} stroke="#05080A" strokeWidth="4" />
                  <rect x={b.x + b.w * 0.3} y={sy - b.h - 18} width={b.w * 0.4} height="20" fill="#1A1A1A" stroke="#05080A" strokeWidth="3" />
                  <rect x={b.x + 6} y={sy - b.h * 0.65} width={b.w - 12} height={b.h * 0.35} fill="#E8E0C8" opacity=".8" />
                  <path d={`M${b.x + 8} ${sy - b.h * 0.55} h${b.w * 0.5} M${b.x + 8} ${sy - b.h * 0.45} h${b.w * 0.35}`} stroke="#5A5040" strokeWidth="3" />
                </g>
              ))}
              <rect x="-200" y={sy} width="1480" height="18" fill="#3A2A1C" stroke="#05080A" strokeWidth="4" />
            </g>
          ))}
          {/* cartello di pericolo sulla parete */}
          <g transform="translate(560 720) rotate(45)">
            <rect x="-46" y="-46" width="92" height="92" fill={ORO} stroke={K} strokeWidth="6" opacity=".9" />
          </g>
          <text x="560" y="740" textAnchor="middle" fontFamily="sans-serif" fontWeight="900" fontSize="54" fill={K}>!</text>
        </g>

        {/* PIANO 2 — scaffale metallico con la vetreria (0,65) */}
        <g transform={L(0.65)}>
          {[960, 1160].map((sy) => (
            <g key={sy}>
              <rect x="-60" y={sy} width="620" height="20" fill="url(#pt-shelf)" stroke={K} strokeWidth="6" />
            </g>
          ))}
          <path d="M-40 760 V1260 M540 760 V1260" stroke="url(#pt-shelf)" strokeWidth="22" />
          <path d="M-40 760 V1260 M540 760 V1260" stroke={K} strokeWidth="4" opacity=".7" />
          <Beuta id="pt" x={60} y={960} t={t} s={0.6} liquid="#7AC8D0" level={0.2} bubbles={0} />
          <Beuta id="pt" x={170} y={960} t={t} s={0.55} liquid="#E8E0D0" level={0} bubbles={0} />
          <Pallone id="pt" x={290} y={960} t={t} s={0.6} liquid="#F2E4C4" />
          <Beuta id="pt" x={420} y={960} t={t} s={0.65} liquid="#9AD08A" level={0.15} bubbles={0} />
          {/* storta e cilindri in basso */}
          {[40, 110, 180].map((cx) => (
            <g key={cx}>
              <rect x={cx - 18} y="1020" width="36" height="140" fill="url(#pt-glass)" stroke={K} strokeWidth="4" />
              <path d={`M${cx - 10} 1030 V1150`} stroke="#FFFFFF" strokeWidth="4" opacity=".4" />
            </g>
          ))}
          <g transform="translate(360 1160)">
            <path d="M-60 0 Q-80 -70 -20 -90 Q40 -100 60 -50 L180 -110" fill="none" stroke={K} strokeWidth="8" />
            <path d="M-60 0 Q-80 -70 -20 -90 Q40 -100 60 -50 Q40 0 -60 0 Z" fill="url(#pt-glass)" stroke={K} strokeWidth="6" />
          </g>
        </g>

        {/* PIANO 3 — la cassa con lo scatolone di vetreria, la busta dei soldi, la torcia (0,9) */}
        <g transform={L(0.9)}>
          <rect x="-200" y="1250" width="1480" height="900" fill="url(#pt-floor)" />
          <path d="M-200 1250 H1280" stroke="#2A343A" strokeWidth="6" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${540 + (i - 6) * 120} 1250 L${540 + (i - 6) * 420} 2100`} stroke="#2A343A" strokeWidth="4" opacity=".7" />)}
          {[1330, 1450, 1620, 1860].map((y) => <path key={y} d={`M-200 ${y} H1280`} stroke="#2A343A" strokeWidth="4" opacity=".7" />)}
          <ellipse cx="400" cy="1500" rx="380" ry="90" fill="#FFF0C8" opacity={0.08 * torch} />
          {/* torcia sullo scaffale di destra */}
          <g transform="translate(930 1000)">
            <rect x="-10" y="0" width="230" height="22" fill="url(#pt-shelf)" stroke={K} strokeWidth="5" />
            <g transform="rotate(-12)">
              <rect x="0" y="-46" width="110" height="36" rx="8" fill="#2A2E32" stroke={K} strokeWidth="5" />
              <path d="M-26 -60 L0 -46 V-10 L-26 4 Z" fill="url(#pt-metal)" stroke={K} strokeWidth="5" />
              <rect x="40" y="-52" width="18" height="8" fill="#C83A2A" />
              <ellipse cx="-26" cy="-28" rx="6" ry="32" fill="#FFF6D8" opacity={0.3 + 0.7 * torch} />
            </g>
          </g>
          <Beam id="pt-torch" x={906} y={968} t={t} length={980} spread={300} color="#FFF0C8" angle={beamAngle} opacity={0.55 * torch} />
          <Glow id="pt-tg" x={906} y={970} r={90} t={t} color="#FFF0C8" amp={0.05} rate={7} opacity={0.7 * torch} />

          {/* cassa di legno */}
          <Ombra id="pt" x={580} y={1262} rx={460} ry={26} />
          <rect x="200" y="1110" width="760" height="150" fill="url(#pt-crate)" stroke={K} strokeWidth="9" />
          {[1150, 1200].map((y) => <path key={y} d={`M210 ${y} H950`} stroke="#3A2A18" strokeWidth="4" />)}
          <path d="M200 1110 L960 1260 M960 1110 L200 1260" stroke="#5A4228" strokeWidth="10" opacity=".7" />
          <path d="M206 1116 H954" stroke="#C8A070" strokeWidth="4" opacity=".7" />
          {/* scatolone pieno di vetreria rubata */}
          <g transform="translate(240 1110)">
            <path d="M0 0 V-170 H260 V0 Z" fill="url(#pt-box)" stroke={K} strokeWidth="7" />
            <path d="M0 -170 L-40 -230 L50 -200 Z M260 -170 L300 -228 L210 -200 Z" fill="#C8A46E" stroke={K} strokeWidth="5" />
            <Pallone id="pt" x={70} y={-150} t={t} s={0.55} liquid="#F2E4C4" />
            <Beuta id="pt" x={150} y={-150} t={t} s={0.6} liquid="#7AC8D0" level={0} bubbles={0} />
            <rect x="196" y="-260" width="26" height="110" fill="url(#pt-glass)" stroke={K} strokeWidth="4" />
            <rect x="0" y="-170" width="260" height="60" fill="url(#pt-box)" stroke={K} strokeWidth="6" />
            <text x="130" y="-128" textAnchor="middle" fontFamily="sans-serif" fontWeight="800" fontSize="24" fill="#4A3418">FRAGILE</text>
            <text x="130" y="-50" textAnchor="middle" fontFamily="sans-serif" fontWeight="800" fontSize="22" fill="#4A3418" opacity=".8">LAB. CHIMICA</text>
          </g>
          {/* cristalli in un piattino di vetro accanto allo scatolone */}
          <g>
            <ellipse cx="560" cy="1108" rx="80" ry="16" fill="url(#pt-glass)" stroke={K} strokeWidth="4" />
            <Cristalli id="pt" x={560} y={1104} t={t} s={0.75} n={11} seed={4} glint={0.3 + 0.7 * sweep} />
          </g>
          {/* busta con i soldi */}
          <g transform="translate(640 1108) rotate(-4)">
            <Ombra id="pt" x={60} y={2} rx={130} ry={10} />
            {[0, 1, 2, 3, 4].map((k) => (
              <g key={k} transform={`rotate(${-cash * (30 - k * 14)} -10 -10) translate(${cash * 10} ${-cash * 20})`} opacity={cash > 0.02 ? 1 : 0}>
                <rect x="-10" y="-100" width="170" height="80" rx="4" fill="#A8C08A" stroke={K} strokeWidth="4" />
                <circle cx="75" cy="-60" r="20" fill="none" stroke="#5A7A4A" strokeWidth="4" />
                <text x="10" y="-76" fontFamily="sans-serif" fontWeight="800" fontSize="18" fill="#3A5A2A">100</text>
              </g>
            ))}
            <rect x="-20" y="-96" width="190" height="96" fill="#E8DCC0" stroke={K} strokeWidth="6" />
            <path d="M-20 -96 L75 -40 L170 -96" fill="none" stroke="#B8A888" strokeWidth="4" />
            <text x="-6" y="-12" fontFamily={HAND} fontSize="30" fill="#2A2A6A">{scritta.slice(0, Math.floor(write * scritta.length))}</text>
          </g>
          {/* scarpina da neonato e portachiavi di casa */}
          <g opacity={fam} transform={`translate(0 ${(1 - fam) * 20})`}>
            <Glow id="pt-fam" x={890} y={1080} r={140} t={t} color={ORO} amp={0.05} rate={2} opacity={0.3 * fam} />
            <g transform="translate(860 1108) scale(1.3)">
              <path d="M-40 0 Q-46 -30 -20 -40 Q0 -46 10 -30 Q40 -24 46 -6 Q48 4 36 4 H-34 Q-42 4 -40 0 Z" fill="#F2E8C8" stroke={K} strokeWidth="5" />
              <path d="M-14 -36 Q-4 -20 14 -26" stroke="#E8B860" strokeWidth="4" fill="none" />
            </g>
            <g transform="translate(902 1104) scale(1.2)">
              <circle cx="0" cy="-10" r="16" fill="none" stroke="url(#pt-metal)" strokeWidth="6" />
              <path d="M10 -2 L50 8 L52 0 L44 -2 L46 -8 L14 -14" fill="url(#pt-metal)" stroke={K} strokeWidth="3" />
            </g>
          </g>
        </g>

        {/* PIANO 4 — montanti dello scaffale e stipite della porta socchiusa che incorniciano (1,25) */}
        <g transform={L(1.25)}>
          <rect x="-120" y="-200" width="150" height="2400" fill="#14181C" stroke={K} strokeWidth="10" />
          <rect x="-120" y="-200" width="150" height="2400" fill="#FFF0C8" opacity={0.05 * torch} />
          <path d="M20 -200 V2200" stroke="#3A4248" strokeWidth="6" />
          <rect x="1030" y="-200" width="220" height="2400" fill="#0E1216" stroke={K} strokeWidth="10" />
          <path d="M1040 -200 V2200" stroke="#5A6A74" strokeWidth="6" />
          <rect x="1052" y="1000" width="30" height="80" rx="6" fill="url(#pt-metal)" stroke={K} strokeWidth="4" />
          {/* pila di scatoloni a destra e mocio nel bidone a sinistra */}
          <g transform="translate(840 1900)">
            {[[0, 0, 300, 200], [30, -200, 240, 170]].map(([bx, by, bw, bh], k) => (
              <g key={k}>
                <rect x={bx - bw / 2} y={by - bh} width={bw} height={bh} fill="url(#pt-box)" stroke={K} strokeWidth="9" />
                <path d={`M${bx - bw / 2} ${by - bh + 30} H${bx + bw / 2}`} stroke="#6A5232" strokeWidth="5" />
                <rect x={bx - 40} y={by - bh + 50} width="80" height="40" fill="#E8DCC0" stroke={K} strokeWidth="4" />
              </g>
            ))}
          </g>
          <path d="M210 1880 L330 1300" stroke="#8A6A44" strokeWidth="16" strokeLinecap="round" />
          <path d="M210 1880 L330 1300" stroke={K} strokeWidth="4" opacity=".5" />
          {/* bidone e mocio a terra in primo piano */}
          <g transform="translate(160 1880)">
            <path d="M-120 0 V-240 H120 V0 Z" fill="#3A5A4A" stroke={K} strokeWidth="9" />
            <path d="M-120 -200 H120 M-120 -60 H120" stroke={K} strokeWidth="6" />
            <path d="M-108 -230 V-10" stroke="#7A9A8A" strokeWidth="6" opacity=".6" />
          </g>
        </g>

        {/* PIANO 5 — pulviscolo nel fascio della torcia (1,6–1,8) */}
        <g transform={L(1.6)}>
          <g opacity={torch}>
            <Dust t={t} top={{ y: 940, x0: 860, x1: 920 }} bottom={{ y: 1300, x0: 120, x1: 520 }} n={34} color="#FFF0C8" seed={9} />
          </g>
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="pt-near" t={t} color="#C8D8E8" n={6} r0={60} r1={150} opacity={0.1} />
        </g>
      </g>
      <Finish id="pt" tint="#142235" tintOpacity={0.12} />
    </svg>
  );
};
