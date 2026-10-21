import React from 'react';
import { camera, eio, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import { Glow, NearMotes, Notes } from '../../lib/elements';
import type { SceneProps } from '../../types';

// La radio: interno di un'auto anni '50, cruscotto con autoradio che sfrigola, lancetta della frequenza che salta,
// cerchietto del tracciato sulla mappa ritagliata.
// Piani: strada di Seahaven oltre il parabrezza, con un palo-telecamera (0,25–0,4) · riflessi sul vetro (0,5)
//        · tetto, montanti e specchietto (0,6) · cruscotto con autoradio, mappa e onde sonore (0,75)
//        · volante (1,1) · sedile in primo piano (1,3) · pulviscolo vicino (1,7)

const K = '#142235';
const RED = '#E5484D';
const ACC = '#F2994A';
const r = rng(5512);
const STATIC = Array.from({ length: 40 }, () => ({ u: r(), v: r(), w: 3 + r() * 10 }));
const ROUTE: [number, number][] = [[24, 172], [24, 120], [86, 120], [86, 62], [150, 62], [150, 24], [190, 24]];
const hash = (k: number) => {
  const x = Math.sin(k * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const routeAt = (p: number): [number, number] => {
  const lens = ROUTE.slice(1).map(([x, y], i) => Math.hypot(x - ROUTE[i][0], y - ROUTE[i][1]));
  const tot = lens.reduce((a, b) => a + b, 0);
  let d = p * tot;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i]) {
      const q = d / lens[i];
      return [lerp(ROUTE[i][0], ROUTE[i + 1][0], q), lerp(ROUTE[i][1], ROUTE[i + 1][1], q)];
    }
    d -= lens[i];
  }
  return ROUTE[ROUTE.length - 1];
};

const WS = 'M70 330 Q540 280 1010 330 L1150 1060 H-70 Z'; // parabrezza
const VX = 540, VY = 760; // punto di fuga

export const Radio: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;

  // Fruscio fino a «si sente una voce» (cues[1]); la mappa segue «svolta dopo svolta» (cues[2]); la musica torna (cues[3]).
  const VOICE = cues[1] ?? 1.87;
  const TURNS = cues[2] ?? 3.59;
  const MUSIC = cues[3] ?? 5.55;
  const isStatic = t < VOICE;
  const music = seg(t, MUSIC, MUSIC + 0.6);
  const k = Math.floor(t * 7);
  const jump = lerp(0.12, 0.9, hash(k));
  const needle = t < VOICE ? jump : t < MUSIC ? 0.44 + Math.sin(t * 50) * 0.008 : lerp(0.44, 0.7, eio(seg(t, MUSIC, MUSIC + 0.5))) + Math.sin(t * 30) * 0.003;
  const noise = isStatic ? 1 : 0.45 * (1 - music);
  const fk = Math.floor(t * 20);
  const mapP = eio(seg(t, TURNS, MUSIC + 1.2));
  const [mx, my] = routeAt(mapP);
  const drive = t * 0.55;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="rd" />
        <Lin id="rd-sky" stops={[[0, '#5AAAD8'], [0.5, '#9AD6F2'], [1, '#E2F4FA']]} />
        <Lin id="rd-road" stops={[[0, '#B5BCC4'], [1, '#7F8A96']]} />
        <Lin id="rd-roof" stops={[[0, '#0F1A29'], [1, '#22344A']]} />
        <Lin id="rd-dash" stops={[[0, '#7CC2E6'], [0.15, '#4FA3D1'], [0.6, '#3A86B4'], [1, '#24577A']]} />
        <Lin id="rd-chrome" stops={[[0, '#FFFFFF'], [0.35, '#C9D3DC'], [0.55, '#8996A3'], [0.75, '#D9E1E8'], [1, '#9AA6B2']]} />
        <Lin id="rd-dial" stops={[[0, '#FFF6DA'], [1, '#F1E2B6']]} />
        <Lin id="rd-seat" stops={[[0, '#F4F1E6'], [1, '#C9C0A8']]} />
        <Lin id="rd-wheel" x2={1} y2={1} stops={[[0, '#FBF6E8'], [0.6, '#E8DDC2'], [1, '#B8AA8A']]} />
        <Lin id="rd-mirror" stops={[[0, '#9AD6F2'], [0.55, '#E2F4FA'], [0.56, '#B5BCC4'], [1, '#8E99A4']]} />
        <GlowGradient id="rd-refl" color="#FFFFFF" core={0.5} mid={0.18} />
        <clipPath id="rd-ws">
          <path d={WS} />
        </clipPath>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — Seahaven oltre il parabrezza (0,25–0,4) */}
        <g clipPath="url(#rd-ws)">
          <g transform={L(0.25)}>
            <rect x="-200" y="200" width="1480" height={VY - 180} fill="url(#rd-sky)" />
            <Glow id="rd-sun" x={860} y={480} r={300} t={t} color="#FFF6D0" amp={0.05} rate={1} opacity={0.6} />
            {/* nuvole uguali */}
            {[0, 1, 2, 3].map((i) => {
              const x = -150 + i * 340 + mod(t * 14, 340);
              return <path key={i} d={`M${x - 90} 600 a36 36 0 0 1 30 -40 a48 48 0 0 1 80 -18 a40 40 0 0 1 70 26 a30 30 0 0 1 4 32 Z`} fill="#FFFFFF" opacity=".9" />;
            })}
          </g>
          <g transform={L(0.4)}>
            {/* villette e alberi ai lati della strada */}
            {[[150, 0.8, '#8CC9E8'], [330, 0.55, '#9ED8C4'], [760, 0.55, '#4FA3D1'], [940, 0.8, '#9ED8C4']].map(([x, s, c], i) => {
              const xx = x as number, ss = s as number;
              return (
                <g key={i} transform={`translate(${xx} ${VY}) scale(${ss})`} stroke={K} strokeWidth={3 / ss} strokeLinejoin="round">
                  <rect x="-90" y="-110" width="180" height="110" fill="#FBF9F1" />
                  <path d="M-106 -104 L0 -180 L106 -104 Z" fill={c as string} />
                  <rect x="-60" y="-80" width="36" height="36" fill="#CDEBF8" />
                  <rect x="24" y="-80" width="36" height="36" fill="#CDEBF8" />
                </g>
              );
            })}
            <rect x="-200" y={VY - 4} width="1480" height="320" fill="#9FD49C" />
            <path d={`M${VX - 30} ${VY} H${VX + 30} L1000 1080 H80 Z`} fill="url(#rd-road)" />
            {/* tratteggio che scorre verso di noi */}
            {Array.from({ length: 6 }, (_, i) => {
              const z = mod(i / 6 + drive, 1), z2 = Math.min(1, z + 0.05);
              const y0 = VY + z * z * 320, y1 = VY + z2 * z2 * 320;
              return <path key={i} d={`M${VX - 2 - z * 12} ${y0} L${VX + 2 + z * 12} ${y0} L${VX + 2 + z2 * 12} ${y1} L${VX - 2 - z2 * 12} ${y1} Z`} fill="#F4F1E6" opacity={0.9} />;
            })}
            {/* palo con telecamera e spia rossa */}
            <g stroke={K} strokeLinejoin="round">
              <rect x="842" y="600" width="10" height="170" fill="#E9E4D6" strokeWidth="3" />
              <path d="M852 612 H884" strokeWidth="5" />
              <rect x="872" y="594" width="48" height="30" rx="4" fill="#3B4A5E" strokeWidth="3" />
              <circle cx="872" cy="609" r="9" fill="#0B1626" strokeWidth="3" />
            </g>
            <Glow id="rd-rec" x={912} y={600} r={30} t={t} color={RED} amp={0} opacity={mod(t, 1) < 0.5 ? 0.9 : 0.3} />
            <circle cx="912" cy="600" r="4" fill={RED} opacity={mod(t, 1) < 0.5 ? 1 : 0.4} />
          </g>
          {/* PIANO 1 — riflessi della strada sul vetro (0,5) */}
          <g transform={L(0.5)}>
            {[0, 1].map((i) => {
              const x = -400 + mod(t * 60 + i * 700, 1400);
              return <path key={i} d={`M${x} 300 L${x + 160} 300 L${x - 120} 1060 L${x - 280} 1060 Z`} fill="#FFFFFF" opacity={0.13 + 0.05 * i} />;
            })}
            <ellipse cx={300 + Math.sin(t * 0.7) * 60} cy={900} rx={320} ry={60} fill="url(#rd-refl)" opacity=".35" />
          </g>
        </g>

        {/* PIANO 2 — tetto, montanti e specchietto retrovisore (0,6) */}
        <g transform={L(0.6)}>
          <path d="M-200 -200 H1280 V360 Q1010 330 1010 330 Q540 280 70 330 Q-200 360 -200 360 Z" fill="url(#rd-roof)" />
          <path d="M70 330 Q540 280 1010 330" fill="none" stroke="#5C6C80" strokeWidth="8" />
          <path d="M-200 300 L70 330 L-70 1060 H-200 Z" fill="url(#rd-roof)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M1280 300 L1010 330 L1150 1060 H1280 Z" fill="url(#rd-roof)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M60 360 L-60 980" stroke="#8C9BAD" strokeWidth="5" opacity=".6" />
          {/* specchietto: riflette la strada dietro, con un'auto che segue */}
          <rect x="700" y="306" width="14" height="40" fill="#5C6C80" stroke={K} strokeWidth="4" />
          <rect x="600" y="340" width="230" height="78" rx="30" fill="url(#rd-mirror)" stroke={K} strokeWidth="8" />
          <g transform={`translate(${720 + Math.sin(t * 0.8) * 8} 398)`}>
            <path d="M-26 0 V-12 Q-24 -24 -12 -26 H12 Q24 -24 26 -12 V0 Z" fill="#9ED8C4" stroke={K} strokeWidth="3" />
            <path d="M-16 -14 L-10 -22 H10 L16 -14 Z" fill="#E6F6FD" stroke={K} strokeWidth="2" />
          </g>
          <path d="M620 360 Q640 350 680 350" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity=".8" />
        </g>

        {/* PIANO 3 — cruscotto (0,75) */}
        <g transform={L(0.75)}>
          <path d="M-200 1070 Q540 990 1280 1070 V2000 H-200 Z" fill="url(#rd-dash)" stroke={K} strokeWidth="10" strokeLinejoin="round" />
          <path d="M-200 1130 Q540 1056 1280 1130" fill="none" stroke="url(#rd-chrome)" strokeWidth="14" />
          <path d="M-200 1130 Q540 1056 1280 1130" fill="none" stroke={K} strokeWidth="3" opacity=".4" />
          <path d="M-100 1060 Q540 990 1180 1060" fill="none" stroke="#B7E1F5" strokeWidth="5" opacity=".6" />

          {/* altoparlante sul cruscotto con onde sonore */}
          <rect x="430" y="1022" width="220" height="40" rx="14" fill="url(#rd-chrome)" stroke={K} strokeWidth="6" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${452 + i * 22} 1030 V1054`} stroke={K} strokeWidth="5" strokeLinecap="round" />)}
          {Array.from({ length: 4 }, (_, i) => {
            const p = mod(t * (isStatic ? 1.1 : 0.7) + i / 4, 1);
            const R = 50 + p * 300;
            const pts = Array.from({ length: 25 }, (_, j) => {
              const a = Math.PI + (j / 24) * Math.PI;
              const jit = isStatic ? (hash(fk * 31 + j * 7 + i) - 0.5) * 30 : t < MUSIC ? Math.sin(j * 1.3 + t * 12) * 6 : 0;
              return `${(540 + Math.cos(a) * (R + jit)).toFixed(1)} ${(1030 + Math.sin(a) * (R + jit) * 0.6).toFixed(1)}`;
            });
            return <path key={i} d={`M${pts.join(' L')}`} fill="none" stroke={t >= VOICE && t < MUSIC ? ACC : '#F4F1E6'} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={Math.sin(p * Math.PI) * 0.95} />;
          })}

          {/* contachilometri dietro il volante */}
          <Glow id="rd-gauge" x={170} y={1220} r={130} t={t} color="#C8F2D8" amp={0.05} rate={3} opacity={0.5} />
          <path d="M70 1240 A100 100 0 0 1 270 1240 Z" fill="#F4F1E6" stroke={K} strokeWidth="8" />
          {Array.from({ length: 7 }, (_, i) => {
            const a = Math.PI + (i / 6) * Math.PI;
            return <path key={i} d={`M${170 + Math.cos(a) * 80} ${1240 + Math.sin(a) * 80} L${170 + Math.cos(a) * 92} ${1240 + Math.sin(a) * 92}`} stroke={K} strokeWidth="4" />;
          })}
          <path d={`M170 1240 L${170 + Math.cos(Math.PI * 1.35 + Math.sin(t * 3) * 0.03) * 78} ${1240 + Math.sin(Math.PI * 1.35 + Math.sin(t * 3) * 0.03) * 78}`} stroke={RED} strokeWidth="5" strokeLinecap="round" />

          {/* AUTORADIO (oggetto chiave) */}
          <Glow id="rd-dialglow" x={580} y={1196} r={260} t={t} color={ACC} amp={0.08} rate={isStatic ? 14 : 3} opacity={0.4 + 0.25 * music} />
          <rect x="380" y="1140" width="400" height="210" rx="22" fill="url(#rd-chrome)" stroke={K} strokeWidth="9" />
          <rect x="406" y="1162" width="348" height="78" rx="10" fill="url(#rd-dial)" stroke={K} strokeWidth="6" />
          {[55, 60, 70, 80, 100, 120, 140, 160].map((f, i) => (
            <g key={f}>
              <path d={`M${424 + i * 44} 1172 V${i % 2 ? 1184 : 1190}`} stroke={K} strokeWidth="3" />
              <text x={424 + i * 44} y="1212" textAnchor="middle" fontFamily="Figtree, sans-serif" fontWeight="700" fontSize="17" fill={K}>{f}</text>
            </g>
          ))}
          {/* fruscio sul quadrante */}
          {STATIC.map((s, i) => (
            <rect key={i} x={410 + mod(s.u + hash(fk + i) * 0.7, 1) * 330} y={1166 + s.v * 66} width={s.w} height="3" fill={K} opacity={noise * 0.5 * hash(fk * 3 + i)} />
          ))}
          <rect x={lerp(420, 740, needle) - 3} y="1166" width="6" height="70" fill={ACC} stroke={K} strokeWidth="2" />
          <circle cx={lerp(420, 740, needle)} cy="1166" r="5" fill={ACC} />
          <path d="M416 1170 Q500 1164 600 1168" stroke="#FFFFFF" strokeWidth="4" opacity=".6" strokeLinecap="round" />
          {/* pulsanti e manopole */}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={466 + i * 48} y={1270 + (i === 2 && t >= MUSIC ? 6 : 0)} width="36" height="40" rx="6" fill="#F4F1E6" stroke={K} strokeWidth="5" />
          ))}
          {[420, 740].map((x, i) => (
            <g key={x} transform={`translate(${x} 1292) rotate(${i ? needle * 300 : 20})`}>
              <circle r="34" fill="#F4F1E6" stroke={K} strokeWidth="6" />
              <circle r="18" fill="url(#rd-chrome)" stroke={K} strokeWidth="4" />
              <path d="M0 -30 V-20" stroke={K} strokeWidth="5" strokeLinecap="round" />
            </g>
          ))}
          <g opacity={music}><Notes t={Math.max(0, t - MUSIC)} x={540} y={1010} n={5} color="#F4F1E6" outline={K} rise={420} spread={300} size={1.1} speed={0.5} /></g>

          {/* mappa ritagliata con il cerchietto del tracciato */}
          <g transform="translate(822 1150) rotate(4)">
            <rect x="0" y="0" width="214" height="196" fill="#F4ECD2" stroke={K} strokeWidth="6" />
            <path d="M140 196 Q150 150 214 140 V196 Z" fill="#8FD3F4" />
            <path d="M0 120 H214 M86 0 V196 M0 62 H214 M150 0 V140" stroke="#C9B994" strokeWidth="5" />
            <path d={`M${ROUTE.map(([x, y]) => `${x} ${y}`).join(' L')}`} fill="none" stroke={K} strokeWidth="4" strokeDasharray="10 8" />
            <circle cx={mx} cy={my} r={22 + Math.sin(t * 6) * 4} fill="none" stroke={RED} strokeWidth="7" />
            <circle cx={mx} cy={my} r="8" fill={RED} />
            <rect x="70" y="-14" width="70" height="26" fill="#FFFFFF" opacity=".55" transform="rotate(-6 105 0)" />
          </g>

          {/* modanatura cromata e chiave nel quadro */}
          <path d="M-200 1420 Q540 1380 1280 1420" fill="none" stroke="url(#rd-chrome)" strokeWidth="10" />
          <path d="M-200 1420 Q540 1380 1280 1420" fill="none" stroke={K} strokeWidth="2" opacity=".4" />
          <g transform="translate(600 1500)" stroke={K} strokeLinejoin="round">
            <circle r="30" fill="url(#rd-chrome)" strokeWidth="6" />
            <g transform={`rotate(${Math.sin(t * 2.5) * 4})`}>
              <rect x="-6" y="-4" width="12" height="70" rx="3" fill="#C9D3DC" strokeWidth="4" />
              <circle cx="0" cy="84" r="22" fill="#9ED8C4" strokeWidth="5" />
            </g>
          </g>
          {/* cassetto portaoggetti */}
          <rect x="760" y="1450" width="340" height="170" rx="16" fill="#3A86B4" stroke={K} strokeWidth="8" />
          <rect x="900" y="1490" width="60" height="16" rx="8" fill="url(#rd-chrome)" stroke={K} strokeWidth="4" />
          <path d="M780 1466 H1080" stroke="#7CC2E6" strokeWidth="5" opacity=".6" />
        </g>

        {/* PIANO 4 — volante che esce dal bordo sinistro (1,1) */}
        <g transform={L(1.1)}>
          <circle cx="110" cy="1560" r="340" fill="none" stroke={K} strokeWidth="56" />
          <circle cx="110" cy="1560" r="340" fill="none" stroke="url(#rd-wheel)" strokeWidth="38" />
          <path d="M-160 1350 A340 340 0 0 1 300 1280" fill="none" stroke="#FFFFFF" strokeWidth="6" opacity=".55" strokeLinecap="round" />
          {[-30, 90, 210].map((a) => (
            <path key={a} d={`M110 1560 L${110 + Math.cos((a * Math.PI) / 180) * 330} ${1560 + Math.sin((a * Math.PI) / 180) * 330}`} stroke={K} strokeWidth="34" />
          ))}
          {[-30, 90, 210].map((a) => (
            <path key={a} d={`M110 1560 L${110 + Math.cos((a * Math.PI) / 180) * 330} ${1560 + Math.sin((a * Math.PI) / 180) * 330}`} stroke="url(#rd-chrome)" strokeWidth="20" />
          ))}
          <circle cx="110" cy="1560" r="200" fill="none" stroke="url(#rd-chrome)" strokeWidth="12" />
          <circle cx="110" cy="1560" r="200" fill="none" stroke={K} strokeWidth="3" opacity=".5" />
          <circle cx="110" cy="1560" r="70" fill="#F4F1E6" stroke={K} strokeWidth="8" />
          <circle cx="110" cy="1560" r="34" fill="#4FA3D1" stroke={K} strokeWidth="5" />
        </g>

        {/* PIANO 5 — schienale del sedile in primo piano (1,3) */}
        <g transform={L(1.3)}>
          <path d="M-200 1790 Q540 1730 1280 1790 V2000 H-200 Z" fill="url(#rd-seat)" stroke={K} strokeWidth="10" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-120 + i * 120} ${1780 - Math.sin((i / 11) * Math.PI) * 40} V2000`} stroke={K} strokeWidth="4" opacity=".25" />)}
          <path d="M-200 1810 Q540 1752 1280 1810" fill="none" stroke="#FFFFFF" strokeWidth="6" opacity=".6" />
        </g>

        {/* PIANO 6 — pulviscolo nell'abitacolo (1,7) */}
        <g transform={L(1.7)}>
          <NearMotes id="rd-near" t={t} color="#FFF6D8" n={7} opacity={0.12} />
        </g>
      </g>

      <Finish id="rd" tint="#8FD3F4" tintOpacity={0.1} />
    </svg>
  );
};
