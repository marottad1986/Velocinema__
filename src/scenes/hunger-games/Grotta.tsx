import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Drips, Embers, Fire, Glow, NearMotes, Rain, Reflection, Moon } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Backpack, HGDefs, K, Pine } from './Comuni';

// La medicina per Peeta: di notte, dentro una grotta sulla riva del fiume. Dalla bocca della grotta si vedono la
// pioggia, il fiume e la luna. Dentro un letto di muschio con una coperta e la pagnotta (Peeta, ferito, mai disegnato),
// la borraccia. Eventi: 1ª frase si accende il piccolo fuoco (il rifugio); 2ª frase fuori, su una pietra alla luce
// della luna, compare lo zaino col 12 (la medicina offerta alla Cornucopia), poi un coltello si pianta nella roccia
// accanto (la Favorita che l'aggredisce); 3ª frase il coltello cade (Thresh la ferma) e lo zaino col 12 è dentro,
// accanto al letto, illuminato dal fuoco: Katniss è tornata con la medicina.
// Piani: cielo, bosco e fiume fuori (0,25–0,45) · pioggia lontana (0,5) · pareti e fondo della grotta (0,8)
//        · letto, fuoco, zaino (0,9) · roccia in primo piano (1,2) · gocce e particelle vicine (1,6)

const r = rng(9191);
const STONES = Array.from({ length: 10 }, () => ({ x: 120 + r() * 840, y: 1300 + r() * 160, rx: 30 + r() * 40 }));

export const Grotta: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1000);
  const L = cam.layer;
  const tf = griglia(cues[0] + 0.8);
  const fire = eo(seg(t, tf, tf + 0.7));
  const tp = griglia(cues[1] + 1.4);
  const pack = eob(seg(t, tp, tp + 0.4), 1.6);
  const tk = griglia(cues[1] + 3.0);
  const knife = seg(t, tk - 0.2, tk);
  const tr = griglia(cues[2] + 1.6);
  const drop = seg(t, tr, tr + 0.4);
  const inside = eo(seg(t, tr + 0.6, tr + 1.2));
  const kq = tk < t && t < tk + 0.5 ? Math.sin((t - tk) * 70) * 5 * (1 - (t - tk) / 0.5) : 0;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="gr" />
        <HGDefs id="gr" />
        <Lin id="gr-sky" stops={[[0, '#0A1218'], [0.5, '#1A2A34'], [1, '#2A3A40']]} />
        <Lin id="gr-river" stops={[[0, '#2A3E4A'], [1, '#0E1A22']]} />
        <Lin id="gr-rock" x2={1} y2={0} stops={[[0, '#2A2018'], [0.5, '#3E3024'], [1, '#1A140E']]} />
        <Lin id="gr-floor" stops={[[0, '#3A2E22'], [0.5, '#2A2018'], [1, '#100C08']]} />
        <Lin id="gr-fg" stops={[[0, '#2E2218'], [1, '#0A0806']]} />
        <radialGradient id="gr-warm" cx=".5" cy=".6" r=".6">
          <stop offset="0" stopColor="#FFB060" stopOpacity=".55" />
          <stop offset="1" stopColor="#FFB060" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — fuori: cielo, luna, bosco e fiume sotto la pioggia (0,25–0,45) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#gr-sky)" />
          <Moon id="gr-moon" x={720} y={740} r={44} t={t} color="#E0EAEE" halo="#B8CCD8" />
        </g>
        <g transform={L(0.4)}>
          {Array.from({ length: 9 }, (_, i) => <Pine key={i} x={140 + i * 100} y={980 - (i % 2) * 20} h={240 + (i % 3) * 50} fill="#101C1C" seed={i + 60} />)}
          <rect x="-200" y="970" width="1480" height="300" fill="url(#gr-river)" />
          <Reflection t={t} x={720} y={990} color="#C8DCE4" n={8} w={60} gap={22} opacity={0.5} />
          {Array.from({ length: 6 }, (_, k) => <path key={k} d={`M${180 + ((k * 137 + t * 60) % 700)} ${1010 + k * 26} h70`} stroke="#8AA8B8" strokeWidth="3" opacity=".4" />)}
          {/* la pietra fuori con lo zaino della medicina */}
          <path d="M640 1090 Q650 1030 720 1022 Q800 1016 830 1060 Q840 1090 830 1100 Z" fill="#4A4A48" stroke={K} strokeWidth="7" />
          <path d="M660 1050 Q700 1030 760 1030" stroke="#9AA8AC" strokeWidth="4" fill="none" />
          <g opacity={pack * (1 - inside)} transform={`translate(740 1032) scale(${pack}) translate(-740 -1032)`}>
            <Glow id="gr-pg" x={740} y={990} r={110} t={t} color="#FFB060" amp={0.1} rate={5} opacity={0.6} />
            <Backpack x={740} y={1036} s={0.5} color="ember" id="gr" label="12" />
          </g>
          {/* il coltello si pianta nella pietra accanto allo zaino; poi cade e resta disteso a terra */}
          {knife > 0 && (
            <g transform={`translate(${lerp(1250, 939, knife) + lerp(0, -150, drop)} ${lerp(800, 958, knife) + lerp(0, 132, drop) + kq}) rotate(${lerp(-35, -4, drop)})`}>
              <path d="M0 0 H-70" stroke={K} strokeWidth="18" strokeLinecap="round" />
              <path d="M0 0 H-70" stroke="#3A2A1A" strokeWidth="10" strokeLinecap="round" />
              <path d="M-70 -12 V12" stroke="#8A8A90" strokeWidth="8" />
              <path d="M-74 -9 L-170 0 L-74 9 Z" fill="#D8E0E4" stroke={K} strokeWidth="5" />
              <path d="M-80 -3 L-150 0" stroke="#FFFFFF" strokeWidth="3" />
            </g>
          )}
          {knife >= 1 && <path d="M790 1046 l-14 12 l10 8 l-12 14" stroke={K} strokeWidth="4" fill="none" opacity={1 - drop} />}
        </g>
        <g transform={L(0.5)}>
          <Rain t={t} level="far" seed={5} color="#9AB8C8" opacity={0.5} y={560} h={700} />
          <Rain t={t} level="near" seed={9} color="#B8D0DC" opacity={0.35} y={560} h={700} />
        </g>

        {/* PIANO 1 — la grotta: pareti di roccia che incorniciano la bocca (0,8) */}
        <g transform={L(0.8)}>
          <path d="M-200 -200 H1280 V2200 H-200 Z M180 1120 Q150 870 300 770 Q420 680 560 690 Q760 700 860 830 Q940 950 900 1120 Z" fill="url(#gr-rock)" fillRule="evenodd" stroke={K} strokeWidth="10" />
          {/* striature e spigoli della roccia */}
          {[[120, 700, 60], [80, 980, 90], [960, 680, 70], [1000, 1000, 80], [300, 560, 50], [760, 560, 60]].map(([x, y, w], i) => (
            <path key={i} d={`M${x - w} ${y} q${w} -30 ${w * 2} 10`} stroke="#5A4634" strokeWidth="6" fill="none" />
          ))}
          <path d="M190 1110 Q160 870 304 776 Q420 692 560 700" stroke="#7A6044" strokeWidth="6" fill="none" opacity=".6" />
          {/* gocce che cadono dalla volta */}
          <Drips t={t} x={420} y0={640} y1={1180} n={2} period={2.6} color="#9AB8C8" />
        </g>

        {/* PIANO 2 — il fondo della grotta: letto di muschio, pagnotta, borraccia, fuoco (0,9) */}
        <g transform={L(0.9)}>
          <path d="M-200 1130 Q540 1090 1280 1130 V2200 H-200 Z" fill="url(#gr-floor)" stroke={K} strokeWidth="8" />
          <ellipse cx="540" cy="1200" rx={420 * (0.6 + 0.4 * fire)} ry="160" fill="url(#gr-warm)" opacity={fire} />
          {/* letto di muschio con la coperta */}
          <path d="M60 1230 Q70 1150 200 1140 Q340 1130 440 1160 Q480 1200 450 1240 Z" fill="#3E5A2A" stroke={K} strokeWidth="8" />
          {Array.from({ length: 8 }, (_, k) => <circle key={k} cx={100 + k * 44} cy={1150 + (k % 2) * 10} r="14" fill="#5A7A3A" stroke={K} strokeWidth="3" />)}
          <path d="M150 1200 Q260 1150 420 1180 L430 1236 Q280 1250 150 1236 Z" fill="#6A5A7A" stroke={K} strokeWidth="6" />
          <path d="M170 1210 Q270 1176 410 1196" stroke="#9A8AAA" strokeWidth="4" fill="none" />
          {/* la pagnotta di Peeta su un panno, accanto al giaciglio */}
          <path d="M470 1236 L600 1222 L612 1250 L478 1262 Z" fill="#D8CCB4" stroke={K} strokeWidth="5" />
          <path d="M490 1236 Q488 1180 540 1172 Q594 1172 596 1226 Q540 1240 490 1236 Z" fill="#C8823A" stroke={K} strokeWidth="6" />
          <path d="M512 1206 l22 -22 M536 1210 l22 -22 M560 1212 l20 -20" stroke="#6A3A10" strokeWidth="5" strokeLinecap="round" />
          <path d="M504 1196 Q512 1180 530 1178" stroke="#F8D8A0" strokeWidth="4" fill="none" />
          {/* borraccia */}
          <g transform="translate(110 1176) rotate(-8) scale(0.85)">
            <rect x="-26" y="-60" width="52" height="66" rx="20" fill="#5A6A5A" stroke={K} strokeWidth="6" />
            <rect x="-10" y="-74" width="20" height="16" fill="#2A2A2A" stroke={K} strokeWidth="4" />
          </g>
          {/* il fuoco */}
          <path d="M600 1210 l90 -14 M610 1192 l80 20" stroke="#2A1A10" strokeWidth="14" strokeLinecap="round" />
          <g opacity={0.15 + 0.85 * fire}>
            <Fire id="gr-fire" t={t} x={645} y={1200} scale={0.32 + 0.22 * fire} outline={K} />
          </g>
          <g opacity={fire}><Embers t={t} x={645} y={1150} w={60} h={360} n={14} seed={3} drift={40} /></g>
          {/* lo zaino col 12 dentro, accanto al letto */}
          <g opacity={inside} transform={`translate(800 1236) scale(${0.6 + 0.4 * inside}) translate(-800 -1236)`}>
            <Glow id="gr-pi" x={800} y={1180} r={150} t={t} color="#FFC070" amp={0.1} rate={4} opacity={0.6} />
            <Backpack x={800} y={1240} s={0.62} color="ember" id="gr" label="12" rot={-6} />
          </g>
          {STONES.map((st, i) => <ellipse key={i} cx={st.x} cy={st.y} rx={st.rx} ry={st.rx * 0.3} fill="#1A140E" opacity=".7" />)}
        </g>

        {/* PIANO 3 — roccia in primo piano che incornicia in basso (1,2) */}
        <g transform={L(1.2)}>
          <path d="M-200 1560 Q100 1480 360 1560 Q600 1620 800 1540 Q1000 1480 1280 1560 V2200 H-200 Z" fill="url(#gr-fg)" stroke={K} strokeWidth="10" />
          <path d="M-100 1530 Q100 1490 300 1544 M600 1600 Q760 1560 900 1546" stroke="#C8783A" strokeWidth="5" fill="none" opacity={0.3 + 0.5 * fire} />
          {/* stalagmiti agli angoli, illuminate dal fuoco sul lato interno */}
          {[[60, 1900, 190, 420], [230, 1890, 120, 260], [1010, 1900, 200, 460], [850, 1920, 120, 240]].map(([sx, sy, w, h], i) => (
            <g key={i}>
              <path d={`M${sx - w / 2} ${sy} Q${sx - w * 0.2} ${sy - h * 0.6} ${sx} ${sy - h} Q${sx + w * 0.2} ${sy - h * 0.6} ${sx + w / 2} ${sy} Z`} fill="#3A2A1E" stroke={K} strokeWidth="8" />
              <path d={`M${sx + (i < 2 ? w * 0.12 : -w * 0.12)} ${sy - h * 0.9} Q${sx + (i < 2 ? w * 0.3 : -w * 0.3)} ${sy - h * 0.4} ${sx + (i < 2 ? w * 0.4 : -w * 0.4)} ${sy - 20}`} stroke="#E89A4A" strokeWidth="6" fill="none" opacity={0.25 + 0.6 * fire} />
            </g>
          ))}
          {/* sassi del pavimento con il riflesso caldo */}
          {[[380, 1700, 70], [560, 1780, 90], [700, 1680, 60], [460, 1860, 80]].map(([x, y, w], i) => (
            <g key={i}>
              <path d={`M${x - w} ${y + w * 0.3} Q${x - w} ${y - w * 0.4} ${x} ${y - w * 0.45} Q${x + w} ${y - w * 0.4} ${x + w} ${y + w * 0.3} Z`} fill="#3A2C20" stroke={K} strokeWidth="7" />
              <path d={`M${x - w * 0.6} ${y - w * 0.15} Q${x - w * 0.2} ${y - w * 0.4} ${x + w * 0.3} ${y - w * 0.32}`} stroke="#F2A860" strokeWidth="5" fill="none" opacity={0.3 + 0.6 * fire} />
            </g>
          ))}
          <path d="M-200 300 Q-40 500 -60 900 Q-80 1200 -200 1400 Z" fill="#140F0A" stroke={K} strokeWidth="10" />
          <path d="M1280 260 Q1120 500 1140 900 Q1160 1200 1280 1380 Z" fill="#140F0A" stroke={K} strokeWidth="10" />
        </g>
        {/* PIANO 4 — particelle vicine calde (1,6) */}
        <g transform={L(1.6)}>
          <NearMotes id="gr-near" t={t} color="#FFB070" n={8} r0={50} r1={130} y0={900} y1={1900} opacity={0.06 + 0.06 * fire} />
          <Embers t={t} x={540} y={1950} w={800} h={500} n={Math.round(16 * fire)} seed={17} drift={60} />
        </g>
      </g>
      <Finish id="gr" tint="#0F1A12" tintOpacity={0.12} />
    </svg>
  );
};
