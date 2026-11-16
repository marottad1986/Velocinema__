import React from 'react';
import { eo, lerp, mod, rng, seg } from '../../lib/anim';
import { RIGHTEOUS, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Fire, Glow, NearMotes, Rain, Reflection } from '../../lib/elements';
import { CYAN, K, MAG, RED, TINT, YEL, cam, type ShotProps } from './comune';

// L'almanacco sportivo (copertina blu e oro, «1950 · 2000», come nello schema della Parte 2) appoggiato al bordo del
// marciapiede, sotto la pioggia, nella piazza di Hill Valley di notte. Dal libro sale una scia gialla tratteggiata che si
// avvolge e va verso il cielo: il viaggio nel tempo (porta i risultati nel passato).
// A `ev` («il loro presente diventa un incubo») un lampo e la piazza cambia: la torre dell'orologio al neon ciano diventa
// il casinò di Biff al neon rosso, il lampione diventa un bidone che brucia, le pozzanghere riflettono rosso.
// Piani: cielo e nuvole (0,2) · torre / casinò (0,4) · palazzi ai lati (0,55) · strada bagnata e lampione / bidone (0,75) ·
// almanacco sul marciapiede (0,95) · tombino e giornale fradicio in primo piano (1,3) · pioggia vicina (1,6).

const r = rng(2015);
const WIN = Array.from({ length: 40 }, () => ({ x: r(), y: r(), on: r() > 0.4 }));

export const Almanacco: React.FC<ShotProps> = ({ t, dur, id, ev = 3 }) => {
  const C = cam(t, dur, { z: 0.1, pan: 35, cy: 960 });
  const alt = t >= ev ? 1 : 0; // il 1985 di Biff
  const flash = t >= ev ? 1 - seg(t, ev, ev + 0.45) : 0;
  const shake = flash > 0 ? Math.sin(t * 80) * 10 * flash : 0;
  const neon = alt ? RED : CYAN;
  const trail = eo(seg(t, 0.2, 2.2));
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <Lin id={`${id}-sky`} stops={alt ? [[0, '#12040C'], [0.4, '#3A0E1E'], [0.75, '#6A1A2A'], [1, '#2A0A14']] : [[0, '#0B0620'], [0.4, '#24124A'], [0.75, '#52205E'], [1, '#2A1440']]} />
        <Lin id={`${id}-road`} stops={[[0, alt ? '#3A1220' : '#2A1A48'], [1, '#08040E']]} />
        <Lin id={`${id}-cover`} x2={1} y2={0} stops={[[0, '#14244A'], [0.5, '#22407A'], [1, '#14244A']]} />
        <Lin id={`${id}-gold`} stops={[[0, '#FFE9A0'], [0.5, '#E8B23A'], [1, '#A8781E']]} />
      </defs>
      <g transform={`translate(${shake} 0)`}>
      <g transform={C.transform}>
        <g transform={C.L(0.2)}>
          <rect x="-200" width="1480" height="1920" fill={`url(#${id}-sky)`} />
          {[[200, 330, 260], [760, 280, 300], [520, 420, 220]].map(([x, y, w], i) => (
            <ellipse key={i} cx={x + Math.sin(t * 0.2 + i) * 20} cy={y} rx={w} ry={w * 0.32} fill={alt ? '#4A1222' : '#3A2260'} opacity=".7" />
          ))}
        </g>
        {/* la torre dell'orologio (1985) o il casinò di Biff (1985 alternativo) */}
        <g transform={C.L(0.4)}>
          <Glow id={`${id}-tg`} x={540} y={560} r={360} t={t} color={neon} amp={0.08} rate={alt ? 9 : 2} opacity={0.4} />
          {!alt && (
            <g fill="#1C1238" stroke={CYAN} strokeWidth="6" strokeLinejoin="round">
              <path d="M300 900 V700 H780 V900 Z" />
              <path d="M280 700 L540 600 L800 700 Z" />
              <path d="M470 600 V400 H610 V600 Z" />
              <path d="M450 400 L540 320 L630 400 Z" />
              <circle cx="540" cy="490" r="52" fill="#E6F6FF" opacity=".9" />
              <path d="M540 490 V455 M540 490 L566 500" stroke={K} strokeWidth="6" />
              {[340, 420, 500, 580, 660, 740].map((x) => <path key={x} d={`M${x} 720 V900`} />)}
            </g>
          )}
          {alt === 1 && (
            <g strokeLinejoin="round">
              <path d="M330 900 V360 L540 260 L750 360 V900 Z" fill="#2A0A16" stroke={RED} strokeWidth="7" />
              {WIN.map((w, i) => <rect key={i} x={360 + w.x * 340} y={400 + w.y * 460} width="26" height="34" fill={w.on ? '#FF9A6A' : '#4A1424'} opacity={w.on ? 0.6 + 0.4 * Math.sin(t * 6 + i) : 0.8} />)}
              <rect x="430" y="300" width="220" height="70" rx="12" fill="#12040A" stroke={RED} strokeWidth="6" />
              <text x="540" y="350" textAnchor="middle" fontFamily={RIGHTEOUS} fontSize="46" fill="#FF6A5A">CASINÒ</text>
              <path d="M330 900 V360 L540 260 L750 360 V900" fill="none" stroke="#FFB0A0" strokeWidth="2" opacity=".6" />
            </g>
          )}
        </g>
        {/* palazzi ai lati con le insegne */}
        <g transform={C.L(0.55)}>
          <path d="M-200 960 V520 H240 V960 Z" fill="#160C2A" stroke={K} strokeWidth="8" />
          <path d="M840 960 V480 H1280 V960 Z" fill="#160C2A" stroke={K} strokeWidth="8" />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={20 + (i % 2) * 110} y={580 + Math.floor(i / 2) * 140} width="70" height="90" fill={alt ? '#6A1A2A' : '#3A3070'} />)}
          {[0, 1, 2, 3].map((i) => <rect key={i} x={890 + (i % 2) * 110} y={560 + Math.floor(i / 2) * 140} width="70" height="90" fill={alt ? '#6A1A2A' : '#3A3070'} />)}
          <text x="110" y="560" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="44" fill={alt ? '#FF6A5A' : MAG} opacity={alt ? 0.6 + 0.4 * Math.sin(t * 13) : 0.9}>{alt ? 'PEGNI' : 'CINEMA'}</text>
          <text x="970" y="530" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="44" fill={alt ? '#FF6A5A' : CYAN} opacity=".9">{alt ? 'BAR' : 'DINER'}</text>
        </g>
        {/* la strada bagnata, le pozzanghere che riflettono, il lampione o il bidone che brucia */}
        <g transform={C.L(0.75)}>
          <rect x="-200" y="950" width="1480" height="970" fill={`url(#${id}-road)`} />
          <path d="M-200 952 H1280" stroke={neon} strokeWidth="5" opacity=".7" />
          <Reflection t={t} x={540} y={980} color={neon} n={9} w={300} gap={26} opacity={0.4} />
          <Reflection t={t} x={110} y={980} color={alt ? '#FF6A5A' : MAG} n={6} w={120} gap={26} opacity={0.35} />
          {!alt && (
            <g transform="translate(900 950)">
              <path d="M0 0 V-420 Q0 -460 -50 -460" fill="none" stroke={K} strokeWidth="14" />
              <path d="M-90 -470 H-10 L-20 -440 H-80 Z" fill="#2A2040" stroke={K} strokeWidth="6" />
              <Glow id={`${id}-lamp`} x={-50} y={-430} r={150} t={t} color="#FFE7B0" amp={0.05} rate={3} opacity={0.6} />
            </g>
          )}
          {alt === 1 && (
            <g transform="translate(900 960)">
              <Fire id={`${id}-fire`} t={t} x={0} y={-110} scale={1.1} />
              <rect x="-70" y="-110" width="140" height="150" fill="#3A2A2A" stroke={K} strokeWidth="8" />
              <path d="M-70 -70 H70 M-70 -20 H70" stroke={K} strokeWidth="5" />
            </g>
          )}
        </g>
        {/* l'almanacco, appoggiato al bordo del marciapiede */}
        <g transform={C.L(0.95)}>
          <path d="M-200 1250 H1280 V1300 H-200 Z" fill="#3A3054" stroke={K} strokeWidth="8" />
          <path d="M-200 1254 H1280" stroke="#FFFFFF" strokeWidth="3" opacity=".3" />
          <Glow id={`${id}-ag`} x={560} y={1060} r={420} t={t} color={YEL} amp={0.1} rate={3} opacity={0.5} />
          {/* la scia gialla del viaggio nel tempo che sale dal libro e si avvolge verso il cielo */}
          <path d="M420 850 C300 820 180 760 200 660 C220 560 340 580 320 660 C300 740 160 700 150 580 C140 460 220 360 200 160"
            fill="none" stroke={YEL} strokeWidth="16" strokeDasharray="44 26" strokeDashoffset={-t * 160} strokeLinecap="round" opacity={trail} />
          <g transform="translate(560 1060) rotate(-7) scale(0.82)">
            <rect x="-210" y="-280" width="440" height="560" rx="14" fill="#000" opacity=".45" transform="translate(24 26)" />
            {/* spessore delle pagine */}
            <path d="M210 -270 L236 -250 V290 L210 280 Z" fill="#E8DCC0" stroke={K} strokeWidth="7" />
            {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M214 ${-240 + i * 64} L232 ${-226 + i * 64}`} stroke="#B8A888" strokeWidth="3" />)}
            <rect x="-210" y="-280" width="420" height="560" rx="14" fill={`url(#${id}-cover)`} stroke={K} strokeWidth="10" />
            <path d="M-210 -280 V280" stroke={`url(#${id}-gold)`} strokeWidth="26" />
            <rect x="-170" y="-240" width="360" height="140" rx="10" fill={`url(#${id}-gold)`} stroke={K} strokeWidth="6" />
            <text x="10" y="-152" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="48" fill="#14244A">ALMANACCO</text>
            <text x="10" y="-30" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="52" fill="#E8B23A" letterSpacing="8">SPORTIVO</text>
            <text x="10" y="80" textAnchor="middle" fontFamily={RIGHTEOUS} fontSize="86" fill="#F4EEE2">1950</text>
            <text x="10" y="176" textAnchor="middle" fontFamily={RIGHTEOUS} fontSize="86" fill="#F4EEE2">2000</text>
            <path d="M-110 220 H130" stroke="#E8B23A" strokeWidth="6" />
            {/* palla e mazza in rilievo */}
            <circle cx="-120" cy="110" r="26" fill="none" stroke="#E8B23A" strokeWidth="5" />
            <path d="M130 70 L170 170" stroke="#E8B23A" strokeWidth="9" strokeLinecap="round" />
            {/* lucido bagnato e gocce sulla copertina */}
            <path d="M-180 -270 L-100 -270 L-190 -120 Z" fill="#FFFFFF" opacity=".16" />
            {Array.from({ length: 14 }, (_, i) => {
              const x = -170 + ((i * 97) % 360), y = -60 + ((i * 151) % 320);
              const dy = mod(t * 40 + i * 30, 120);
              return <g key={i}><circle cx={x} cy={y + dy * (i % 3 === 0 ? 1 : 0)} r={5 + (i % 3) * 2} fill="#CFE3F8" opacity=".55" /><circle cx={x - 2} cy={y - 2 + dy * (i % 3 === 0 ? 1 : 0)} r="2" fill="#FFFFFF" /></g>;
            })}
          </g>
          {/* gli spruzzi delle gocce sul marciapiede */}
          {Array.from({ length: 10 }, (_, i) => {
            const u = mod(t * 1.7 + i * 0.13, 1);
            const x = 80 + i * 100;
            return <ellipse key={i} cx={x} cy={1262} rx={lerp(4, 40, u)} ry={lerp(2, 9, u)} fill="none" stroke="#CFE3F8" strokeWidth="3" opacity={0.6 * (1 - u)} />;
          })}
        </g>
        {/* primo piano: il tombino e un giornale fradicio */}
        <g transform={C.L(1.3)}>
          <rect x="-200" y="1300" width="1480" height="620" fill="#0C0816" />
          <g transform="translate(160 1420) rotate(8)">
            <rect x="-150" y="-60" width="300" height="130" fill="#D8D0C0" stroke={K} strokeWidth="8" />
            {[0, 1, 2, 3].map((i) => <path key={i} d={`M-120 ${-30 + i * 26} H${i % 2 ? 60 : 120}`} stroke="#6A6458" strokeWidth="7" />)}
            <rect x="-150" y="-60" width="300" height="130" fill="#20304A" opacity=".2" />
          </g>
          <Reflection t={t} x={760} y={1340} color={alt ? RED : YEL} n={6} w={180} gap={24} opacity={0.35} />
        </g>
        <Rain t={t} level="far" seed={5} color={alt ? '#FFB0A0' : '#B8C8F0'} />
        <g transform={C.L(1.6)}>
          <Rain t={t} level="near" seed={9} color={alt ? '#FFC8B8' : '#D8E4FF'} opacity={0.45} />
          <NearMotes id={`${id}-near`} t={t} color={alt ? '#FF9A8A' : '#CFE3F8'} opacity={0.08} />
        </g>
      </g>
      </g>
      <rect width="1080" height="1920" fill="#FFF0F0" opacity={0.75 * flash} />
      <Finish id={id} tint={alt ? '#3A0A18' : TINT} tintOpacity={0.12} />
    </svg>
  );
};
