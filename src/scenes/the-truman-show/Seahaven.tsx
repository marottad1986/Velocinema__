import React from 'react';
import { camera, eio, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import { Glow, Gulls, NearMotes, SunRays, WaveLines } from '../../lib/elements';
import type { SceneProps } from '../../types';

// Seahaven: cittadina sul mare perfetta, villette bianche con staccionate, prati tagliati, cielo azzurro,
// lampioni identici, una telecamera nascosta in una casetta per uccelli.
// Piani: cielo con nuvole tutte uguali e giunture (0,25) · mare e villette lontane (0,45) · villette, prati,
//        lampioni e irrigatori (0,65) · auto parcheggiata (0,8) · casetta per uccelli con telecamera (0,9)
//        · siepe e staccionata bianca (1,05–1,2) · cassetta delle lettere (1,3) · riflessi vicini (1,7)

const K = '#142235';
const W = '#FBF9F1';
const RED = '#E5484D';
const ROOFS = ['#4FA3D1', '#8CC9E8', '#9ED8C4'];
const r = rng(1998);
const FLOWERS = Array.from({ length: 34 }, (_, i) => ({ x: -180 + i * 44 + r() * 20, y: 1590 + r() * 26, c: i % 3 === 0 ? '#F7E08A' : i % 3 === 1 ? '#F4A7B9' : '#FFFFFF', s: 7 + r() * 4 }));
const SPRINKLERS = [{ x: 260, y: 1262 }, { x: 650, y: 1270 }, { x: 1040, y: 1262 }];
const DROPS = Array.from({ length: 16 }, () => ({ ph: r(), v: 0.8 + r() * 0.4, s: 5 + r() * 4 }));

/** Villetta tutta uguale alle altre (origine al centro della base). */
const House: React.FC<{ x: number; y: number; s: number; roof: string; line: number; shade?: boolean }> = ({ x, y, s, roof, line, shade = true }) => {
  const sw = line / s;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={K} strokeWidth={sw} strokeLinejoin="round">
      <rect x="62" y="-312" width="40" height="80" fill={W} />
      <rect x="-150" y="-192" width="300" height="192" fill={W} />
      {shade && <rect x="70" y="-192" width="80" height="192" fill={K} opacity=".07" stroke="none" />}
      <path d="M-178 -184 L0 -316 L178 -184 Z" fill={roof} />
      <path d="M-140 -192 H140" stroke={K} strokeWidth={sw * 0.6} opacity=".25" />
      {[-95, 95].map((wx) => (
        <g key={wx}>
          <rect x={wx - 50} y="-150" width="16" height="66" fill={roof} />
          <rect x={wx + 34} y="-150" width="16" height="66" fill={roof} />
          <rect x={wx - 32} y="-150" width="64" height="66" fill="#CDEBF8" />
          <path d={`M${wx} -150 V-84 M${wx - 32} -117 H${wx + 32}`} strokeWidth={sw * 0.6} />
          <path d={`M${wx - 24} -96 L${wx - 6} -142`} stroke="#FFFFFF" strokeWidth={sw * 0.8} opacity=".8" />
        </g>
      ))}
      <rect x="-26" y="-112" width="52" height="112" fill={roof} />
      <circle cx="14" cy="-56" r="4" fill={K} stroke="none" />
      <path d="M-46 0 H46" strokeWidth={sw * 1.2} />
    </g>
  );
};

/** Nuvola "da set": tutte identiche. */
const cloud = (x: number, y: number) =>
  `M${x - 120} ${y} a46 46 0 0 1 40 -52 a62 62 0 0 1 104 -22 a52 52 0 0 1 90 34 a40 40 0 0 1 6 40 Z`;

export const Seahaven: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;

  // La telecamera nella casetta: spia che lampeggia piano; con «è in diretta tv» (cues[5]) si accende fissa e l'obiettivo zooma.
  const REC_ON = cues[5] ?? 7.68;
  const LOOK = cues[4] ?? 6.54;
  const on = seg(t, REC_ON, REC_ON + 0.15);
  const blink = mod(t, 1.2) < 0.6 ? 1 : 0.25;
  const rec = lerp(blink, 1, on);
  const zoom = 1 + 0.32 * eob(seg(t, REC_ON, REC_ON + 0.5));
  const look = eio(seg(t, LOOK, LOOK + 0.6));
  const cloudOff = mod(t * 22, 300);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sh" />
        <Lin id="sh-sky" stops={[[0, '#3F95C8'], [0.3, '#6FBCE6'], [0.6, '#A9DDF5'], [0.85, '#DDF2FA']]} />
        <Lin id="sh-sea" stops={[[0, '#7CC3E6'], [0.5, '#4FA3D1'], [1, '#3D8DBE']]} />
        <Lin id="sh-lawn" stops={[[0, '#A8DCA0'], [0.5, '#86C98A'], [1, '#6DB37A']]} />
        <Lin id="sh-hedge" stops={[[0, '#7FC287'], [1, '#3F7F5E']]} />
        <Lin id="sh-street" stops={[[0, '#C9CDD2'], [1, '#9EA6AF']]} />
        <Lin id="sh-glass" x2={1} y2={1} stops={[[0, '#E6F6FD'], [0.45, '#9FD3EE'], [0.55, '#E9F7FD'], [1, '#6FB4DA']]} />
        <Lin id="sh-post" x2={1} y2={0} stops={[[0, '#F4EEDD'], [0.6, '#E2D9C2'], [1, '#B9AE94']]} />
        <GlowGradient id="sh-cloud" color="#FFFFFF" core={0.9} mid={0.45} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo azzurro troppo perfetto, sole, nuvole identiche e giunture del set (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1300" fill="url(#sh-sky)" />
          <Glow id="sh-sun" x={940} y={300} r={380} t={t} color="#FFF6D0" amp={0.05} rate={1.2} opacity={0.75} />
          <SunRays id="sh-rays" x={940} y={300} t={t} color="#FFF8DA" n={6} length={900} width={90} from={150} to={250} opacity={0.4} />
          <circle cx="940" cy="300" r="70" fill="#FFF7DA" stroke="#F7E6A6" strokeWidth="6" />
          {/* giunture del cielo dipinto: pannelli appena visibili */}
          <g stroke="#2F6E96" strokeWidth="3" opacity=".16">
            <path d="M860 560 H1300 M820 560 V-200 M1120 560 V1000" />
            <path d="M620 860 H1300" />
          </g>
          {[[820, 560], [1120, 560], [1120, 860]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" fill="#2F6E96" opacity=".2" />)}
          {/* nuvole tutte uguali, alla stessa distanza, che scorrono insieme */}
          {Array.from({ length: 6 }, (_, i) => {
            const x = -260 + i * 300 + cloudOff;
            return (
              <g key={i}>
                <ellipse cx={x} cy={630} rx="190" ry="70" fill="url(#sh-cloud)" opacity=".55" />
                <path d={cloud(x, 650)} fill="#FFFFFF" stroke="#BFE3F4" strokeWidth="5" strokeLinejoin="round" />
                <path d={`M${x - 100} 650 H${x + 120}`} stroke="#D9EEF8" strokeWidth="8" strokeLinecap="round" />
              </g>
            );
          })}
        </g>

        {/* PIANO 1 — mare con barchetta e villette lontane (0,45) */}
        <g transform={L(0.45)}>
          <rect x="-200" y="880" width="1480" height="140" fill="url(#sh-sea)" />
          <path d="M-200 880 H1280" stroke="#E9F7FD" strokeWidth="4" opacity=".8" />
          <WaveLines t={t} ys={[905, 935]} color="#E9F7FD" amp={4} w={200} speed={20} width={3} opacity={0.6} />
          <g transform={`translate(${lerp(-60, 1140, mod(t / 40 + 0.35, 1))} 896)`}>
            <path d="M-26 0 H26 L18 12 H-18 Z" fill={W} stroke={K} strokeWidth="3" />
            <path d="M0 -2 V-46 L24 -6 Z" fill={W} stroke={K} strokeWidth="3" strokeLinejoin="round" />
          </g>
          {[-110, 110, 330, 550, 770, 990, 1210].map((x, i) => (
            <House key={x} x={x} y={1010} s={0.4} roof={ROOFS[i % 3]} line={3} shade={false} />
          ))}
          <rect x="-200" y="1008" width="1480" height="220" fill="#9FD49C" />
          {[0, 220, 440, 660, 880, 1100].map((x) => (
            <g key={x}>
              <rect x={x - 4} y="960" width="8" height="50" fill="#8A7A62" />
              <circle cx={x} cy="950" r="26" fill="#7FC287" />
            </g>
          ))}
        </g>

        {/* PIANO 2 — villette identiche, prati tagliati, lampioni uguali, irrigatori (0,65) */}
        <g transform={L(0.65)}>
          <rect x="-200" y="1170" width="1480" height="170" fill="url(#sh-lawn)" />
          {/* righe del tosaerba */}
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={i} x={-200 + i * 110} y="1176" width="55" height="160" fill="#FFFFFF" opacity=".08" />
          ))}
          {[170, 560, 950].map((x, i) => (
            <g key={x}>
              <ellipse cx={x + 20} cy={1184} rx="170" ry="14" fill={K} opacity=".12" />
              <House x={x} y={1180} s={0.9} roof={ROOFS[i]} line={8} />
              {/* vialetto */}
              <path d={`M${x - 22} 1182 L${x + 22} 1182 L${x + 40} 1336 L${x - 40} 1336 Z`} fill="#EDE6D3" stroke={K} strokeWidth="4" />
            </g>
          ))}
          {/* lampioni tutti uguali */}
          {[365, 755, 1145, -25].map((x) => (
            <g key={x} stroke={K} strokeLinejoin="round">
              <rect x={x - 7} y="980" width="14" height="210" fill="#E9E4D6" strokeWidth="5" />
              <path d={`M${x - 26} 980 L${x - 18} 940 H${x + 18} L${x + 26} 980 Z`} fill="#FFF6D8" strokeWidth="5" />
              <path d={`M${x - 30} 940 H${x + 30} L${x} 918 Z`} fill={K} strokeWidth="3" />
            </g>
          ))}
          {/* irrigatori che spruzzano a ventaglio */}
          {SPRINKLERS.map((s, k) => (
            <g key={k}>
              <rect x={s.x - 6} y={s.y - 14} width="12" height="16" fill="#8E99A4" stroke={K} strokeWidth="3" />
              {DROPS.map((d, i) => {
                const p = mod(t * 0.9 * d.v + d.ph, 1);
                const dir = Math.sin(t * 1.4 + k * 2 + d.ph * 0.6);
                return (
                  <circle key={i} cx={s.x + dir * 190 * p} cy={s.y - 16 - 170 * p + 210 * p * p} r={d.s} fill="#F2FBFF" stroke="#7FB8D9" strokeWidth="1.5" opacity={Math.min(1, (1 - p) * 1.4)} />
                );
              })}
            </g>
          ))}
          {/* marciapiede e strada */}
          <rect x="-200" y="1336" width="1480" height="40" fill="#EDE6D3" stroke={K} strokeWidth="4" />
          <rect x="-200" y="1376" width="1480" height="200" fill="url(#sh-street)" />
          <path d="M-200 1470 H1280" stroke="#FFFFFF" strokeWidth="8" strokeDasharray="70 60" opacity=".7" />
        </g>

        {/* PIANO 3 — auto parcheggiata con parabrezza a specchio (0,8) */}
        <g transform={L(0.8)}>
          <ellipse cx="250" cy="1528" rx="230" ry="18" fill={K} opacity=".2" />
          <path d="M40 1520 L50 1460 Q60 1440 110 1436 L170 1392 Q190 1380 240 1380 H330 Q370 1380 390 1400 L430 1436 Q470 1440 470 1470 L466 1520 Z" fill="#9ED8C4" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          <path d="M184 1398 Q196 1390 240 1390 H322 Q352 1390 366 1404 L396 1434 H158 Z" fill="url(#sh-glass)" stroke={K} strokeWidth="5" strokeLinejoin="round" />
          <path d="M214 1430 L250 1394 M262 1430 L290 1400" stroke="#FFFFFF" strokeWidth="6" opacity=".7" />
          <path d="M50 1478 H466" stroke="#E8EEF2" strokeWidth="6" />
          {[130, 380].map((x) => (
            <g key={x}>
              <circle cx={x} cy="1520" r="38" fill={K} />
              <circle cx={x} cy="1520" r="16" fill="#E8EEF2" />
            </g>
          ))}
        </g>

        {/* PIANO 4 — casetta per uccelli con la telecamera nascosta (0,9) */}
        <g transform={L(0.9)}>
          <rect x="764" y="860" width="34" height="840" fill="url(#sh-post)" stroke={K} strokeWidth="8" />
          <ellipse cx="800" cy="880" rx="110" ry="12" fill={K} opacity=".15" />
          <rect x="686" y="700" width="190" height="178" fill={W} stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <rect x="806" y="700" width="70" height="178" fill={K} opacity=".07" />
          <path d="M656 712 L781 596 L906 712 Z" fill="#F2994A" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M690 704 L781 620 L820 656" fill="none" stroke="#FFD2A6" strokeWidth="5" opacity=".8" strokeLinecap="round" />
          <rect x="770" y="840" width="22" height="10" fill="#E2D9C2" stroke={K} strokeWidth="4" />
          <path d="M760 860 H802" stroke={K} strokeWidth="8" strokeLinecap="round" />
          {/* il "foro" è un obiettivo */}
          <circle cx="781" cy="772" r="46" fill={K} />
          <g transform={`translate(${781 + lerp(-8, 0, look)} ${772 + lerp(5, 0, look)}) scale(${zoom})`}>
            <circle r="32" fill="#25415E" stroke="#4E6F8E" strokeWidth="4" />
            <circle r="18" fill="#0B1626" />
            <g transform={`rotate(${t * 20})`}>
              {Array.from({ length: 6 }, (_, i) => (
                <path key={i} d="M0 -18 L6 -9" stroke="#3B5A78" strokeWidth="3" transform={`rotate(${i * 60})`} />
              ))}
            </g>
            <path d="M-18 -12 A22 22 0 0 1 4 -24" fill="none" stroke="#BFE3F4" strokeWidth="4" strokeLinecap="round" opacity=".85" />
            <circle cx="9" cy="-9" r="4" fill="#FFFFFF" opacity=".8" />
          </g>
          {/* spia REC */}
          <Glow id="sh-rec" x={848} y={724} r={lerp(60, 130, on)} t={t} color={RED} amp={0.15 * on} rate={6} opacity={0.8 * rec} />
          <circle cx="848" cy="724" r={lerp(10, 13, on)} fill={RED} stroke={K} strokeWidth="3" opacity={0.4 + 0.6 * rec} />
          <circle cx="846" cy="722" r="3" fill="#FFD0D0" opacity={rec} />
        </g>

        {/* uccellini (0,7) */}
        <g transform={L(0.7)}>
          <Gulls t={t} seed={8} n={3} y={560} h={120} color={K} size={0.55} period={12} />
        </g>

        {/* PIANO 5 — siepe fiorita (1,05) */}
        <g transform={L(1.05)}>
          <path d={`M-200 1640 ${Array.from({ length: 16 }, () => "q50 -70 100 0").join(' ')} V1920 H-200 Z`} fill="url(#sh-hedge)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          {FLOWERS.map((f, i) => (
            <circle key={i} cx={f.x} cy={f.y + Math.sin(t * 2 + i) * 2} r={f.s} fill={f.c} stroke={K} strokeWidth="2.5" />
          ))}
        </g>

        {/* PIANO 6 — staccionata bianca che incornicia il basso (1,2) */}
        <g transform={L(1.2)}>
          <rect x="-260" y="1700" width="1600" height="26" fill={W} stroke={K} strokeWidth="7" />
          <rect x="-260" y="1810" width="1600" height="26" fill={W} stroke={K} strokeWidth="7" />
          {Array.from({ length: 26 }, (_, i) => {
            const x = -250 + i * 62;
            return (
              <g key={i}>
                <path d={`M${x} 1940 V1640 L${x + 21} 1610 L${x + 42} 1640 V1940 Z`} fill={W} stroke={K} strokeWidth="7" strokeLinejoin="round" />
                <path d={`M${x + 30} 1646 V1930`} stroke={K} strokeWidth="4" opacity=".1" />
              </g>
            );
          })}
        </g>

        {/* PIANO 7 — cassetta delle lettere (1,3) */}
        <g transform={L(1.3)}>
          <rect x="70" y="1560" width="30" height="400" fill="url(#sh-post)" stroke={K} strokeWidth="8" />
          <path d="M10 1570 V1500 Q10 1450 85 1450 Q160 1450 160 1500 V1570 Z" fill="#8CC9E8" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M30 1490 Q40 1466 85 1464" fill="none" stroke="#E6F6FD" strokeWidth="6" strokeLinecap="round" opacity=".8" />
          <path d="M160 1520 H186 V1460 H210 V1488 H186" fill="#F4F1E6" stroke={K} strokeWidth="6" strokeLinejoin="round" />
        </g>

        {/* PIANO 8 — riflessi chiari vicini alla camera (1,7) */}
        <g transform={L(1.7)}>
          <NearMotes id="sh-near" t={t} color="#FFFFFF" n={6} opacity={0.1} />
        </g>
      </g>

      <Finish id="sh" tint="#8FD3F4" tintOpacity={0.1} />
    </svg>
  );
};
