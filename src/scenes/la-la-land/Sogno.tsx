import React from 'react';
import { camera, eo, lerp, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import { Flyers, Glow, NearMotes, Notes, Stars, Wisps } from '../../lib/elements';
import { DISPLAY } from '../../lib/fonts';
import type { SceneProps } from '../../types';

// I sogni: appartamento di notte, macchina da scrivere, pianoforte verticale, bozzetto "SEB'S" su un tovagliolo.
// Piani: parete e finestra con la città (0,25) · pianoforte verticale e lampada (0,45) ·
//        scrivania con macchina da scrivere e tovagliolo (0,65) · tenda e pianta in primo piano (1,2) ·
//        fogli che volano e particelle vicine (1,5–1,7)

const K = '#1B1530';
const WIN = { x: 600, y: 560, w: 400, h: 400 };
const DESK_Y = 1150;
const r = rng(5150);
const CITY = Array.from({ length: 34 }, () => ({ x: WIN.x + r() * WIN.w, y: WIN.y + 240 + r() * 150, w: 6 + r() * 8, ph: r() * 6, warm: r() > 0.4 }));
const TOWERS = Array.from({ length: 9 }, (_, i) => ({ x: WIN.x - 10 + i * 48, h: 60 + r() * 140, w: 36 + r() * 20 }));

export const Sogno: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  // la macchina da scrivere batte righe dalla 2ª frase (lo spettacolo di Mia)
  const typed = seg(t, cues[1], cues[1] + 3.2);
  const lines = Math.floor(typed * 6);
  const lineP = (typed * 6) % 1;
  const carriage = lines >= 6 ? 0 : -lerp(0, 120, lineP);
  // il bozzetto SEB'S si disegna sul tovagliolo alla 3ª frase (il locale di Sebastian)
  const sketch = eo(seg(t, cues[2], cues[2] + 1.4));
  const metro = Math.sin(t * 3.4) * 24;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sg" />
        <Lin id="sg-wall" stops={[[0, '#120E26'], [0.35, '#221A40'], [0.65, '#2E2350'], [1, '#231A3A']]} />
        <Lin id="sg-night" stops={[[0, '#0E0C28'], [0.55, '#2A2060'], [0.85, '#6B4FA0'], [1, '#C07AA0']]} />
        <Lin id="sg-piano" x2={1} y2={0} stops={[[0, '#2A1A1A'], [0.4, '#4A2C26'], [1, '#1E1212']]} />
        <Lin id="sg-desk" stops={[[0, '#6A4A3A'], [0.5, '#523628'], [1, '#2E1E16']]} />
        <Lin id="sg-front" x2={1} y2={0} stops={[[0, '#4A3024'], [0.4, '#3A251C'], [1, '#1E120E']]} />
        <Lin id="sg-type" stops={[[0, '#4E8A86'], [0.6, '#2E5E5C'], [1, '#1A3A3A']]} />
        <Lin id="sg-curtain" x2={1} y2={0} stops={[[0, '#2A1E4E'], [0.5, '#4A3A7A'], [1, '#22183E']]} />
        <Lin id="sg-shade" stops={[[0, '#F2D49A'], [1, '#C8904A']]} />
        <Lin id="sg-cone" stops={[[0, '#FFD98A', 0.4], [1, '#FFD98A', 0]]} />
        <GlowGradient id="sg-pool" color="#FFC76A" core={0.55} mid={0.2} />
        <clipPath id="sg-win">
          <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} />
        </clipPath>
        <clipPath id="sg-sk">
          <rect x="0" y="1100" width={380 + sketch * 300} height="200" />
        </clipPath>
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete e finestra sulla città di notte (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#sg-wall)" />
          {/* carta da parati a righe molto tenui sotto la zona del titolo */}
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d={`M${-160 + i * 90} 560 V1160`} stroke="#3A2E60" strokeWidth="14" opacity=".35" />
          ))}
          <g clipPath="url(#sg-win)">
            <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} fill="url(#sg-night)" />
            <Stars t={t} seed={515} n={16} x={WIN.x} y={WIN.y} w={WIN.w} h={180} color="#F0E8FF" size={0.8} />
            {/* torri della città e luci che brillano */}
            {TOWERS.map((b, i) => (
              <rect key={i} x={b.x} y={WIN.y + WIN.h - b.h} width={b.w} height={b.h} fill="#140F2E" />
            ))}
            <path d={`M${WIN.x} ${WIN.y + WIN.h - 40} Q${WIN.x + 200} ${WIN.y + WIN.h - 70} ${WIN.x + WIN.w} ${WIN.y + WIN.h - 50} V${WIN.y + WIN.h} H${WIN.x} Z`} fill="#0E0A22" />
            {CITY.map((c, i) => (
              <rect key={i} x={c.x} y={c.y} width={c.w} height={c.w * 0.8} fill={c.warm ? '#FFD28A' : '#C8E0FF'} opacity={0.45 + 0.45 * Math.sin(t * (1 + (i % 3) * 0.6) + c.ph)} />
            ))}
            {/* palma */}
            <g transform={`rotate(${Math.sin(t * 0.9) * 2} ${WIN.x + 330} ${WIN.y + WIN.h})`}>
              <path d={`M${WIN.x + 330} ${WIN.y + WIN.h} Q${WIN.x + 320} ${WIN.y + 220} ${WIN.x + 340} ${WIN.y + 120}`} fill="none" stroke="#0E0A22" strokeWidth="12" />
              {[-60, -20, 20, 60, 110, 160].map((a, i) => (
                <path key={i} d={`M0 0 q40 -20 90 10`} transform={`translate(${WIN.x + 340} ${WIN.y + 120}) rotate(${a + 180 * (i % 2)})`} fill="none" stroke="#0E0A22" strokeWidth="14" strokeLinecap="round" />
              ))}
            </g>
          </g>
          <rect x={WIN.x - 18} y={WIN.y - 18} width={WIN.w + 36} height={WIN.h + 36} rx="6" fill="none" stroke="#3A2A4A" strokeWidth="22" />
          <rect x={WIN.x - 18} y={WIN.y - 18} width={WIN.w + 36} height={WIN.h + 36} rx="6" fill="none" stroke={K} strokeWidth="8" />
          <path d={`M${WIN.x + WIN.w / 2} ${WIN.y} V${WIN.y + WIN.h} M${WIN.x} ${WIN.y + 170} H${WIN.x + WIN.w}`} stroke={K} strokeWidth="12" />
          <rect x={WIN.x - 40} y={WIN.y + WIN.h + 16} width={WIN.w + 80} height="22" fill="#4A3A5A" stroke={K} strokeWidth="7" />
          <Glow id="sg-wglow" x={WIN.x + WIN.w / 2} y={WIN.y + WIN.h - 60} r={300} t={t} color="#9A7AE0" amp={0.03} rate={0.8} opacity={0.3} />
          {/* quadro con locandina di un vecchio film (forme astratte) */}
          <rect x="110" y="610" width="200" height="270" fill="#E8D8C0" stroke={K} strokeWidth="9" />
          <rect x="130" y="630" width="160" height="230" fill="#6B4FA0" />
          <circle cx="210" cy="720" r="44" fill="#F6F1E9" opacity=".8" />
          <path d="M140 840 L210 760 L280 840 Z" fill="#2A1E4E" />
        </g>

        {/* PIANO 1 — pianoforte verticale con lampada e metronomo (0,45) */}
        <g transform={L(0.45)}>
          <rect x="560" y="860" width="500" height="700" rx="10" fill="url(#sg-piano)" stroke={K} strokeWidth="9" />
          {/* pannello inferiore, zoccolo e pedali: il pianoforte poggia a terra */}
          <rect x="600" y="1200" width="420" height="250" rx="8" fill="none" stroke={K} strokeWidth="6" opacity=".7" />
          <path d="M616 1214 H1004" stroke="#9C6A50" strokeWidth="3" opacity=".5" />
          <rect x="545" y="1540" width="530" height="40" rx="6" fill="#3A2420" stroke={K} strokeWidth="8" />
          {[770, 810, 850].map((x) => <rect key={x} x={x - 12} y="1478" width="24" height="44" rx="6" fill="#C8A050" stroke={K} strokeWidth="5" />)}
          <ellipse cx="810" cy="1584" rx="300" ry="18" fill="#000" opacity=".25" />
          <rect x="540" y="840" width="540" height="34" rx="8" fill="#3A2420" stroke={K} strokeWidth="8" />
          <rect x="590" y="900" width="440" height="110" rx="6" fill="#24161A" stroke={K} strokeWidth="6" />
          {/* spartito sul leggio */}
          <rect x="690" y="912" width="120" height="90" fill="#F2EADA" stroke={K} strokeWidth="5" transform="rotate(-4 750 957)" />
          <rect x="814" y="912" width="120" height="90" fill="#F2EADA" stroke={K} strokeWidth="5" transform="rotate(3 874 957)" />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M700 ${930 + i * 18} h100 M824 ${930 + i * 18} h100`} stroke="#8A7AA0" strokeWidth="2.5" />
          ))}
          {/* tastiera */}
          <rect x="560" y="1020" width="500" height="44" fill="#F6F1E9" stroke={K} strokeWidth="7" />
          {Array.from({ length: 20 }, (_, i) => (
            <path key={i} d={`M${585 + i * 24} 1020 V1064`} stroke="#6A6080" strokeWidth="2" />
          ))}
          {Array.from({ length: 20 }, (_, i) => ([1, 2, 4, 5, 6].includes(i % 7) ? <rect key={i} x={579 + i * 24} y="1020" width="12" height="26" fill={K} /> : null))}
          <path d="M560 1064 H1060" stroke={K} strokeWidth="8" />
          <path d="M580 1100 h460" stroke="#6A3E34" strokeWidth="4" opacity=".6" />
          {/* metronomo */}
          <path d="M610 840 L630 740 H666 L686 840 Z" fill="#6A4030" stroke={K} strokeWidth="6" strokeLinejoin="round" />
          <path d={`M648 830 L${648 + Math.sin((metro * Math.PI) / 180) * 80} ${830 - Math.cos((metro * Math.PI) / 180) * 80}`} stroke="#E8D8B0" strokeWidth="5" strokeLinecap="round" />
          {/* lampada sul pianoforte */}
          <path d="M970 840 V760" stroke={K} strokeWidth="10" />
          <ellipse cx="970" cy="838" rx="36" ry="8" fill="#C8904A" stroke={K} strokeWidth="5" />
          <Glow id="sg-lamp" x={970} y={720} r={260} t={t} color="#FFC76A" amp={0.05} rate={1.6} opacity={0.65} />
          <path d="M920 760 L940 690 H1000 L1020 760 Z" fill="url(#sg-shade)" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          <path d="M924 760 H1016" stroke="#FFF0C0" strokeWidth="5" />
          <ellipse cx="900" cy="842" rx="160" ry="16" fill="url(#sg-pool)" opacity=".8" />
          <Notes t={t} x={800} y={880} seed={516} n={3} color={P.chiaro} outline={K} rise={260} spread={200} size={0.7} speed={0.16} />
        </g>

        {/* PIANO 2 — scrivania: macchina da scrivere, tazza e tovagliolo con il bozzetto (0,65) */}
        <g transform={L(0.65)}>
          <path d={`M-200 ${DESK_Y} H900 L930 1270 H-220 Z`} fill="url(#sg-desk)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M-150 1190 Q200 1180 500 1196 T880 1190" fill="none" stroke="#3A271A" strokeWidth="3" opacity=".6" />
          <rect x="-220" y="1268" width="1160" height="700" fill="url(#sg-front)" stroke={K} strokeWidth="9" />
          <path d="M-220 1276 H940" stroke="#9C7A58" strokeWidth="4" opacity=".5" />
          {[[150, 1320], [540, 1320], [150, 1560], [540, 1560]].map(([x, y], i) => (
            <g key={i}>
              <rect x={x} y={y} width="330" height="200" rx="8" fill="none" stroke={K} strokeWidth="7" opacity=".75" />
              <path d={`M${x + 6} ${y + 8} H${x + 324}`} stroke="#9C7A58" strokeWidth="3" opacity=".4" />
              <rect x={x + 135} y={y + 86} width="60" height="18" rx="9" fill="#C8904A" stroke={K} strokeWidth="5" />
            </g>
          ))}
          <ellipse cx="160" cy="1300" rx="300" ry="60" fill="url(#sg-pool)" opacity=".5" />
          {/* lampada da tavolo a sinistra */}
          <path d="M70 1170 V980" stroke={K} strokeWidth="12" />
          <ellipse cx="70" cy="1170" rx="50" ry="12" fill="#2E2850" stroke={K} strokeWidth="6" />
          <path d="M70 990 L-10 1170 H330 Z" fill="url(#sg-cone)" />
          <Glow id="sg-dl" x={80} y={1000} r={230} t={t} color="#FFD08A" amp={0.06} rate={2} ph={1} opacity={0.6} />
          <path d="M10 1000 Q20 930 80 926 Q140 930 150 1000 Z" fill="url(#sg-shade)" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          <path d="M14 1000 H146" stroke="#FFF0C0" strokeWidth="5" />
          {/* macchina da scrivere */}
          <g transform="translate(270 1000)">
            {/* foglio che sale riga dopo riga */}
            <g transform={`translate(${carriage} 0)`}>
              <rect x="-10" y={-110 - typed * 60} width="190" height={140 + typed * 60} fill="#F6F1E9" stroke={K} strokeWidth="6" />
              {Array.from({ length: 6 }, (_, i) => {
                const w = i < lines ? 150 : i === lines ? 150 * lineP : 0;
                return w > 0 ? <path key={i} d={`M10 ${-90 - typed * 60 + i * 18} h${w * (i % 2 ? 0.8 : 1)}`} stroke="#3A3060" strokeWidth="5" strokeLinecap="round" /> : null;
              })}
              <rect x="-40" y="10" width="250" height="34" rx="16" fill="#2A2440" stroke={K} strokeWidth="7" />
              <circle cx="-48" cy="27" r="16" fill="#C8C0D8" stroke={K} strokeWidth="6" />
            </g>
            <path d="M-30 40 H200 L230 150 H-60 Z" fill="url(#sg-type)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
            <path d="M-20 60 H190" stroke="#8ACAC4" strokeWidth="4" opacity=".6" />
            {Array.from({ length: 3 }, (_, row) => Array.from({ length: 8 }, (_, i) => {
              const hit = (Math.floor(t * 9) + i * 3 + row * 5) % 11 === 0 && typed > 0 && typed < 1;
              return <circle key={`${row}-${i}`} cx={-22 + row * 8 + i * 30} cy={84 + row * 22 - (hit ? 3 : 0)} r="9" fill={hit ? '#FFFFFF' : '#E8E0D0'} stroke={K} strokeWidth="3" />;
            }))}
            <rect x="10" y="146" width="180" height="16" rx="6" fill="#1A3A3A" stroke={K} strokeWidth="5" />
          </g>
          {/* tazza con vapore */}
          <path d="M610 1130 V1186 Q610 1200 626 1200 H674 Q690 1200 690 1186 V1130 Z" fill="#E8D8C0" stroke={K} strokeWidth="7" strokeLinejoin="round" />
          <path d="M690 1146 q26 0 26 22 q0 18 -26 18" fill="none" stroke={K} strokeWidth="7" />
          <ellipse cx="650" cy="1130" rx="40" ry="8" fill="#5A3020" stroke={K} strokeWidth="5" />
          <Wisps t={t} x={650} y={1120} color="#E8E0F0" n={3} h={150} width={5} opacity={0.6} />
          {/* tovagliolo con il bozzetto SEB'S: l'oggetto chiave */}
          <Glow id="sg-nap" x={530} y={1215} r={190} t={t} color={P.accento} amp={0.06} rate={2.2} opacity={0.2 + 0.45 * sketch} />
          <g transform="rotate(-7 530 1215)">
            <path d="M420 1170 L640 1166 L646 1258 L414 1264 Z" fill="#FBF6EC" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            <path d="M424 1180 h214 M424 1252 h214" stroke="#E0D4C0" strokeWidth="3" />
            <g clipPath="url(#sg-sk)">
              <text x="530" y="1232" textAnchor="middle" fontFamily={DISPLAY} fontSize="54" fill="none" stroke={P.accento} strokeWidth="4" strokeLinejoin="round">SEB'S</text>
              <text x="530" y="1232" textAnchor="middle" fontFamily={DISPLAY} fontSize="54" fill="none" stroke="#3A2A20" strokeWidth="1.5">SEB'S</text>
              <path d="M444 1196 l12 -16 l12 16 M598 1196 l12 -16 l12 16" fill="none" stroke={P.accento} strokeWidth="4" strokeLinecap="round" />
            </g>
          </g>
          {/* matita che segue il tratto */}
          <g transform={`translate(${lerp(450, 630, sketch)} ${1214 - Math.sin(t * 18) * 6 * (sketch > 0 && sketch < 1 ? 1 : 0)}) rotate(-35)`} opacity={sketch > 0 ? 1 : 0.9}>
            <rect x="-6" y="-110" width="14" height="96" fill="#F2C14E" stroke={K} strokeWidth="5" />
            <path d="M-6 -14 L1 6 L8 -14 Z" fill="#E8C8A0" stroke={K} strokeWidth="4" strokeLinejoin="round" />
            <rect x="-6" y="-122" width="14" height="14" fill="#E87A8A" stroke={K} strokeWidth="4" />
          </g>
        </g>

        {/* PIANO 3 — tenda a sinistra e pianta a destra, in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <path d={`M-200 400 H150 Q${100 + Math.sin(t * 0.8) * 10} 1000 ${170 + Math.sin(t * 0.8) * 16} 1960 H-200 Z`} fill="url(#sg-curtain)" stroke={K} strokeWidth="10" />
          <path d={`M60 420 Q${30 + Math.sin(t * 0.8) * 6} 1000 ${70 + Math.sin(t * 0.8) * 10} 1960`} fill="none" stroke="#6A5AA0" strokeWidth="6" opacity=".55" />
          {/* pianta in vaso */}
          <path d="M890 1980 L870 1700 H1110 L1090 1980 Z" fill="#B0603A" stroke={K} strokeWidth="10" strokeLinejoin="round" />
          <rect x="860" y="1680" width="260" height="40" rx="8" fill="#C8744A" stroke={K} strokeWidth="9" />
          {[-50, -25, 0, 25, 50, 75].map((a, i) => (
            <path key={i} d="M0 0 Q30 -120 10 -260 Q-30 -130 0 0 Z" transform={`translate(${980 + i * 14} 1690) rotate(${a + Math.sin(t * 0.9 + i) * 3})`} fill={i % 2 ? '#3E7A5A' : '#2E5E46'} stroke={K} strokeWidth="6" strokeLinejoin="round" />
          ))}
          {/* fogli accartocciati */}
          {[{ x: 300, y: 1760, s: 1 }, { x: 560, y: 1840, s: 0.82 }].map((b, i) => (
            <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.s}) rotate(${i * 40})`}>
              <ellipse cx="6" cy="40" rx="50" ry="10" fill="#000" opacity=".3" />
              <path d="M-46 -6 L-30 -38 L-4 -30 L14 -46 L40 -26 L48 4 L34 34 L4 44 L-24 38 L-44 20 Z" fill="#E8E0D0" stroke={K} strokeWidth="7" strokeLinejoin="round" />
              <path d="M-30 -38 L-6 -8 L14 -46 M-6 -8 L40 -26 M-6 -8 L4 44 M-6 -8 L-44 20 M-6 -8 L34 34" fill="none" stroke="#A89AB0" strokeWidth="4" strokeLinejoin="round" />
              <path d="M-6 -8 L34 34 L48 4 L40 -26 Z" fill="#B8AEB8" opacity=".45" />
            </g>
          ))}
        </g>

        {/* PIANO 4 — fogli che volano e particelle vicine (1,5–1,7) */}
        <g transform={L(1.5)}>
          <Flyers t={t} seed={517} n={6} color="#F6F1E9" outline={K} w={46} h={60} y0={680} y1={1080} speed={0.1} />
        </g>
        <g transform={L(1.7)}>
          <NearMotes id="sg-near" t={t} seed={518} color="#FFE0B0" opacity={0.08} />
        </g>
      </g>

      <Finish id="sg" tint="#2C2456" tintOpacity={0.13} />
    </svg>
  );
};
