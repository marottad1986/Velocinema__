import React from 'react';
import { camera, eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { DISPLAY } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Fog, Glow, Moon, NearMotes, Stars } from '../../lib/elements';
import type { SceneProps } from '../../types';

// Lupo ululà: stazioncina di montagna di notte, lanterna sul binario, carro di fieno; luna piena,
// lupo che ulula sul crinale, il castello lontano in cima alla collina. Nessuna persona.
// Gag visive: la «gobba» del mucchio di fieno cambia lato (cue 2); il fieno sobbalza e vola qualche filo (cue 3);
// il lupo alza il muso e ulula, poi la finestra del castello «risponde» (cue 4).
// Piani: cielo, luna, stelle (0,2) · monti e castello (0,4) · crinale con lupo e abeti (0,55)
//        · stazione, binari, carro (0,75) · banchina con valigie e palo (1,2) · nebbia e particelle (1,5–1,8)

const K = '#0C0E12';
const HAY = '#C9BE9C';
const r = rng(1974);
const PINES = Array.from({ length: 9 }, (_, i) => ({ x: -60 + i * 150 + r() * 60, h: 120 + r() * 90, y: 1010 + r() * 30 }));
const STRAWS = Array.from({ length: 16 }, () => ({ dx: (r() - 0.5) * 300, vy: 160 + r() * 220, vx: (r() - 0.5) * 260, rot: r() * 360, spin: (r() - 0.5) * 720, len: 18 + r() * 22 }));

/** Mucchio di fieno con una «gobba» centrata in hx (−1 sinistra, +1 destra). */
const hayPath = (hx: number, t: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const x = -200 + i * 10;
    const hump = 95 * Math.exp(-(((x - hx * 95) / 72) ** 2));
    const y = -48 - 34 * Math.cos((x / 200) * (Math.PI / 2)) - hump - 5 * Math.sin(x * 0.11 + t * 1.5);
    pts.push(`${x} ${y.toFixed(1)}`);
  }
  return `M-210 0 L${pts.join(' L')} L210 0 Z`;
};

/** Lupo seduto di profilo (silhouette), muso girato di `head` gradi verso l'alto. */
const Wolf: React.FC<{ head: number }> = ({ head }) => (
  <g fill={K}>
    <path d="M-46 0 Q-58 -44 -34 -78 Q-18 -104 6 -116 L30 -112 Q38 -70 34 -30 L44 0 Z" />
    <path d="M-46 -4 Q-96 -6 -110 -40" fill="none" stroke={K} strokeWidth="16" strokeLinecap="round" />
    <g transform={`rotate(${-head} 14 -112)`}>
      <path d="M-6 -108 Q-8 -140 4 -152 L2 -182 L22 -160 Q34 -160 44 -154 L76 -150 Q80 -140 72 -136 L40 -130 Q28 -110 20 -102 Z" />
    </g>
  </g>
);

export const Stazione: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  // la gobba del fieno cambia lato quando la voce lo dice
  const hx = lerp(-1, 1, eio(seg(t, cues[2] + 0.3, cues[2] + 1.1)));
  // il carro sobbalza: Inga «sul carro del fieno»
  const bump = seg(t, cues[3], cues[3] + 0.9);
  const jolt = Math.sin(bump * Math.PI * 3) * (1 - bump) * 14;
  // lupo: alza il muso e ulula
  const howl = eob(seg(t, cues[4] - 0.2, cues[4] + 0.4)) * (1 - 0.6 * seg(t, dur - 0.6, dur));
  const howlP = seg(t, cues[4], dur);
  // la finestra del castello risponde all'ululato
  const castle = seg(t, cues[4] + 0.8, cues[4] + 1.0);
  // lanterna che oscilla appena
  const swing = Math.sin(t * 1.7) * 6;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="lu" />
        <Lin id="lu-sky" stops={[[0, '#07080B'], [0.3, '#13171D'], [0.5, '#2A3039'], [0.62, '#46505B']]} />
        <Lin id="lu-mtn" stops={[[0, '#2B323B'], [1, '#1A1F26']]} />
        <Lin id="lu-hill" x2={1} y2={0} stops={[[0, '#262C34'], [0.6, '#3A424C'], [1, '#4E5761']]} />
        <Lin id="lu-wall" x2={1} y2={0} stops={[[0, '#2A2C2E'], [0.6, '#4A4B4C'], [1, '#5E5F60']]} />
        <Lin id="lu-roof" stops={[[0, '#30353C'], [1, '#1A1D22']]} />
        <Lin id="lu-ground" stops={[[0, '#3A3F46'], [0.4, '#2A2E34'], [1, '#15181C']]} />
        <Lin id="lu-plank" stops={[[0, '#4C4842'], [1, '#2A2723']]} />
        <Lin id="lu-hay" x2={1} y2={0} stops={[[0, '#8F876C'], [0.6, HAY], [1, '#E2DBC0']]} />
        <Lin id="lu-wood" x2={1} y2={0} stops={[[0, '#3A332B'], [0.6, '#5A5045'], [1, '#6E6355']]} />
        <Lin id="lu-case" x2={1} y2={0} stops={[[0, '#4B3D31'], [0.6, '#6B5848'], [1, '#7D6A58']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo, stelle e luna piena bassa sull'orizzonte (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#lu-sky)" />
          <Stars t={t} seed={74} n={44} y={80} h={760} color="#E8ECEF" />
          <Stars t={t} seed={19} n={10} y={500} h={360} color="#F4EEDD" size={1.4} />
          <Moon id="lu-moon" x={790} y={810} r={118} t={t} color="#EEEDE6" halo="#D8DCDF" />
          <Fog id="lu-cloud" t={t} y={700} x={420} rx={520} ry={34} color="#3A424C" opacity={0.7} speed={0.25} drift={60} />
        </g>

        {/* PIANO 1 — monti lontani e castello sulla rupe (0,4) */}
        <g transform={L(0.4)}>
          <path d="M-200 1000 L-40 860 L80 930 L200 820 L330 940 L470 880 L620 960 L760 900 L900 980 L1060 890 L1280 980 V1100 H-200 Z" fill="url(#lu-mtn)" />
          <path d="M-40 860 L10 900 M200 820 L250 870 M1060 890 L1100 920" stroke="#5A646F" strokeWidth="5" fill="none" opacity=".6" />
          {/* rupe e castello */}
          <path d="M60 1040 Q110 900 170 860 L200 790 L250 770 L330 780 L360 850 Q420 930 460 1040 Z" fill="url(#lu-hill)" stroke="#11141A" strokeWidth="5" strokeLinejoin="round" />
          <path d="M330 780 L360 850 Q420 930 460 1040" fill="none" stroke="#8A949E" strokeWidth="5" opacity=".75" />
          <path d="M140 960 l40 -20 M220 900 l30 10 M300 960 l50 -30" stroke="#11141A" strokeWidth="5" opacity=".7" />
          <g stroke={K} strokeWidth="5" strokeLinejoin="round">
            <path d="M190 790 V660 H236 V790 Z" fill="#2E343C" />
            <path d="M184 662 L213 590 L242 662 Z" fill="#1C2026" />
            <path d="M236 790 V700 H312 V790 Z" fill="#363D46" />
            <path d="M236 700 h12 v-14 h14 v14 h12 v-14 h14 v14 h12 v-14 h12 v14" fill="none" />
            <path d="M300 790 V620 H340 V790 Z" fill="#2E343C" />
            <path d="M294 622 L320 556 L346 622 Z" fill="#1C2026" />
          </g>
          <path d="M213 590 V572 M320 556 V536" stroke={K} strokeWidth="4" />
          {/* finestre accese (una risponde all'ululato) */}
          <Glow id="lu-cw1" x={320} y={652} r={40 + castle * 40} t={t} color="#F3DDA8" amp={0.15} rate={3} opacity={0.5 + castle * 0.4} />
          <rect x="313" y="640" width="14" height="22" rx="7" fill="#F6E4B4" opacity={0.6 + 0.4 * castle} />
          <rect x="206" y="700" width="12" height="18" rx="6" fill="#F6E4B4" opacity=".7" />
          <rect x="266" y="730" width="12" height="18" rx="6" fill="#F6E4B4" opacity=".55" />
          <Glow id="lu-cw2" x={212} y={708} r={30} t={t} color="#F3DDA8" amp={0.2} rate={2.2} ph={1} opacity={0.45} />
        </g>

        {/* PIANO 2 — crinale con il lupo davanti alla luna, abeti (0,55) */}
        <g transform={L(0.55)}>
          <path d="M-200 1060 Q200 1020 520 1000 Q700 978 820 958 Q930 950 1040 990 Q1160 1020 1280 1010 V1200 H-200 Z" fill="#171A1F" />
          <path d="M520 1000 Q700 978 820 958 Q930 950 1040 990" fill="none" stroke="#5E6873" strokeWidth="4" opacity=".7" />
          <g transform="translate(800 962) scale(1.05)">
            <Wolf head={lerp(8, 42, howl)} />
          </g>
          {/* ululato: archi che escono dal muso (accento) */}
          {[0, 1, 2].map((i) => {
            const p = mod(howlP * 2.2 - i * 0.28, 1);
            const on = howlP > 0 && howlP * 2.2 > i * 0.28 ? 1 : 0;
            return (
              <path key={i} d={`M${880 + p * 90} ${770 - p * 70} q${30 + p * 30} ${20 + p * 20} ${12 + p * 20} ${70 + p * 50}`} fill="none" stroke="#8EF0C8" strokeWidth={7 - p * 3} strokeLinecap="round" opacity={on * Math.sin(p * Math.PI) * 0.9} transform={`rotate(-30 ${880 + p * 90} ${770 - p * 70})`} />
            );
          })}
          {PINES.map((p, i) => (
            <path key={i} d={`M${p.x} ${p.y} l-44 0 l30 -${p.h * 0.35} l-20 0 l26 -${p.h * 0.35} l-14 0 l22 -${p.h * 0.3} l22 ${p.h * 0.3} l-14 0 l26 ${p.h * 0.35} l-20 0 l30 ${p.h * 0.35} Z`} fill="#11141A" transform={`translate(${i === 5 || i === 6 ? 2000 : 0} 40)`} />
          ))}
        </g>

        <g transform={L(0.6)}>
          <Fog id="lu-fog1" t={t} y={1080} x={540} rx={900} ry={60} color="#56606B" opacity={0.45} speed={0.2} drift={80} />
        </g>

        {/* PIANO 3 — stazione, binari e carro di fieno (0,75) */}
        <g transform={L(0.75)}>
          <rect x="-200" y="1090" width="1480" height="900" fill="url(#lu-ground)" />
          {/* binari */}
          {Array.from({ length: 16 }, (_, i) => <rect key={i} x={-180 + i * 90} y="1238" width="40" height="40" rx="4" fill="#2A2621" transform={`skewX(-20)`} />)}
          <path d="M-200 1244 H1280 M-200 1272 H1280" stroke="#6D747C" strokeWidth="8" />
          <path d="M-200 1240 H1280" stroke="#B9C0C6" strokeWidth="3" opacity=".7" />
          {/* edificio della stazione */}
          <g stroke={K} strokeLinejoin="round">
            <path d="M-60 1200 V1030 H370 V1200 Z" fill="url(#lu-wall)" strokeWidth="9" />
            <path d="M-100 1040 L-40 960 H350 L410 1040 Z" fill="url(#lu-roof)" strokeWidth="9" />
            <path d="M-40 960 H350" stroke="#7A848E" strokeWidth="4" />
            <path d="M40 1200 V1100 Q70 1074 100 1100 V1200" fill="#1E2126" strokeWidth="7" />
            <rect x="180" y="1090" width="110" height="74" fill="#F2DFAE" strokeWidth="7" />
            <path d="M235 1090 V1164 M180 1127 H290" strokeWidth="6" />
          </g>
          <Glow id="lu-win" x={235} y={1127} r={120} t={t} color="#F3DDA8" amp={0.08} rate={2.6} opacity={0.4} />
          {/* insegna appesa */}
          <g transform="translate(155 1000)">
            <path d="M-120 -20 V8 M120 -20 V8" stroke={K} strokeWidth="4" />
            <rect x="-150" y="8" width="300" height="56" rx="6" fill="#D8D4C6" stroke={K} strokeWidth="7" />
            <text x="0" y="48" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="32" fill={K} letterSpacing="2">TRANSILVANIA</text>
          </g>
          {/* lanterna su palo */}
          <g>
            <path d="M470 1236 V960 M470 972 H520" stroke={K} strokeWidth="10" strokeLinecap="round" />
            <g transform={`rotate(${swing} 516 972)`}>
              <Glow id="lu-lamp" x={516} y={1012} r={190} t={t} color="#F3DDA8" amp={0.06} rate={6} opacity={0.65} />
              <path d="M516 972 V984" stroke={K} strokeWidth="4" />
              <path d="M496 986 H536 L530 1036 H502 Z" fill="#F7E7BC" stroke={K} strokeWidth="6" strokeLinejoin="round" />
              <path d="M492 986 L516 970 L540 986 Z M500 1036 H532 V1044 H500 Z" fill={K} />
              <path d="M516 1004 q-6 10 0 20 q6 -10 0 -20" fill="#FFFFFF" />
            </g>
          </g>
          {/* carro di fieno */}
          <g transform={`translate(720 ${1180 - jolt})`}>
            <ellipse cx="0" cy="62" rx="250" ry="16" fill="#0A0B0E" opacity=".45" />
            <path d="M-240 -6 L-300 40" stroke={K} strokeWidth="14" strokeLinecap="round" />
            <path d="M-240 -6 L-300 40" stroke="#5A5045" strokeWidth="6" strokeLinecap="round" />
            <path d={hayPath(hx, t)} transform="translate(0 -26)" fill="url(#lu-hay)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            {Array.from({ length: 12 }, (_, i) => {
              const x = -170 + i * 30;
              return <path key={i} d={`M${x} -60 l${10 + (i % 3) * 6} ${-22 - (i % 4) * 6}`} stroke="#EFE8CF" strokeWidth="4" strokeLinecap="round" opacity=".8" transform={`translate(0 ${-34 * Math.cos((x / 200) * (Math.PI / 2)) - 70 * Math.exp(-(((x - hx * 95) / 72) ** 2))})`} />;
            })}
            <path d="M-240 -40 H240 V10 H-240 Z" fill="url(#lu-wood)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <path d="M-240 -16 H240 M-150 -40 V10 M-50 -40 V10 M50 -40 V10 M150 -40 V10" stroke={K} strokeWidth="4" opacity=".7" />
            <path d="M-240 -38 H240" stroke="#9A8C78" strokeWidth="3" opacity=".7" />
            {[-150, 150].map((x) => (
              <g key={x} transform={`translate(${x} 22) rotate(${(-t * 10) % 360})`}>
                <circle r="44" fill="none" stroke={K} strokeWidth="16" />
                <circle r="44" fill="none" stroke="#6E6355" strokeWidth="6" />
                {[0, 45, 90, 135].map((a) => <path key={a} d="M-40 0 H40" stroke={K} strokeWidth="6" transform={`rotate(${a})`} />)}
                <circle r="9" fill={K} />
              </g>
            ))}
          </g>
          {/* fili di fieno che volano al sobbalzo */}
          {bump > 0 && bump < 1 && STRAWS.map((s, i) => {
            const p = eo(bump);
            return <path key={i} d={`M0 0 h${s.len}`} stroke="#E6DDBF" strokeWidth="4" strokeLinecap="round" transform={`translate(${720 + s.dx + s.vx * p} ${1060 - s.vy * p + 180 * bump * bump}) rotate(${s.rot + s.spin * bump})`} opacity={1 - bump} />;
          })}
        </g>

        <g transform={L(0.9)}>
          <Fog id="lu-fog2" t={t} y={1250} x={300} rx={700} ry={50} color="#6A747F" opacity={0.3} speed={0.3} ph={2} drift={100} />
        </g>

        {/* PIANO 4 — banchina in primo piano: assi, valigia e borsa da dottore, palo con orario (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1400 H1280 V2100 H-200 Z" fill="url(#lu-plank)" stroke={K} strokeWidth="9" />
          <path d="M-200 1400 H1280" stroke="#8A8276" strokeWidth="5" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M-200 ${1470 + i * 80} H1280`} stroke={K} strokeWidth="5" opacity=".6" />)}
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-120 + i * 190 + (i % 2) * 60} ${1470 + (i % 6) * 80} v80`} stroke={K} strokeWidth="5" opacity=".5" />)}
          {/* valigia */}
          <g transform="translate(70 1560) rotate(-3)">
            <rect x="0" y="0" width="300" height="190" rx="16" fill="url(#lu-case)" stroke={K} strokeWidth="9" />
            <path d="M110 0 V-26 Q150 -44 190 -26 V0" fill="none" stroke={K} strokeWidth="10" />
            <path d="M0 40 H300 M60 0 V190 M240 0 V190" stroke={K} strokeWidth="5" opacity=".7" />
            <rect x="130" y="80" width="60" height="40" rx="4" fill="#D8D4C6" stroke={K} strokeWidth="5" />
            <text x="160" y="108" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="20" fill={K}>F.F.</text>
            <path d="M14 12 H290" stroke="#A89480" strokeWidth="4" opacity=".7" />
          </g>
          {/* borsa da dottore */}
          <g transform="translate(400 1610)">
            <path d="M0 140 L20 20 Q100 -10 180 20 L200 140 Z" fill="#242222" stroke={K} strokeWidth="9" strokeLinejoin="round" />
            <path d="M60 10 Q100 -40 140 10" fill="none" stroke={K} strokeWidth="10" />
            <path d="M14 40 H186" stroke="#9AA2A9" strokeWidth="7" />
            <path d="M30 26 Q100 4 170 26" fill="none" stroke="#6A6E73" strokeWidth="4" />
          </g>
          {/* palo con orario che incornicia a destra */}
          <g>
            <rect x="1010" y="760" width="60" height="1260" fill="#2E2A25" stroke={K} strokeWidth="9" />
            <path d="M1024 770 V2000" stroke="#6E6355" strokeWidth="4" opacity=".7" />
            <g transform="translate(940 1520) rotate(2) scale(0.9)">
              <rect x="0" y="0" width="200" height="250" rx="6" fill="#D8D4C6" stroke={K} strokeWidth="8" />
              <text x="100" y="44" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="28" fill={K}>ORARIO</text>
              {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M24 ${80 + i * 28} H${150 - (i % 3) * 20} M${160 - (i % 3) * 10} ${80 + i * 28} H176`} stroke="#5A5E63" strokeWidth="6" strokeLinecap="round" />)}
            </g>
          </g>
        </g>

        {/* PIANO 5 — nebbia bassa e particelle vicine alla camera (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Fog id="lu-fog3" t={t} y={1520} x={540} rx={900} ry={80} color="#7D8790" opacity={0.22} speed={0.35} ph={4} drift={120} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="lu-near" t={t} color="#DDE2E6" n={7} vx={-30} vy={-6} opacity={0.1} />
        </g>
      </g>

      <Finish id="lu" tint="#5E6B75" tintOpacity={0.12} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): gobba che cambia lato ≈ cue2 + 0,3 · sobbalzo del carro = cue3 · ululato = cue4
// · finestra del castello che risponde ≈ cue4 + 0,8.
