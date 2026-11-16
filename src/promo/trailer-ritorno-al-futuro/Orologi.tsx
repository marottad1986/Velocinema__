import React from 'react';
import { mod, rng } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Dust, Glow, NearMotes } from '../../lib/elements';
import { K, MAG, TINT, YEL, cam, type ShotProps } from './comune';

// Cold open: il muro di orologi nel laboratorio di Doc, di notte. Una dozzina di orologi diversi (da parete tondi e
// quadrati, a cucù generico senza uccello, sveglie con le campane sullo scaffale, una pendola che entra dal bordo destro),
// tutti alla stessa ora; le lancette dei secondi scattano insieme, una volta per battito (72 bpm, come la musica).
// Luce: la lampada da tavolo in basso a sinistra con il fascio e il pulviscolo; una finestra alta con il riflesso magenta
// dell'insegna fuori. Piani: parete (0,2) · orologi lontani (0,45) · orologi vicini (0,7) · scaffale e lampada (1,1) ·
// pendola e cavo in primo piano (1,4) · particelle (1,8).

const BEAT = 60 / 72;
const r = rng(1985);
const CLOCKS = [
  { x: 270, y: 520, r: 92, shape: 'round', face: '#F3E6C8', rim: '#7A5A3A' },
  { x: 560, y: 470, r: 130, shape: 'round', face: '#F6EDD8', rim: '#3E4A66' },
  { x: 830, y: 560, r: 80, shape: 'square', face: '#E9DCC0', rim: '#6A3A2A' },
  { x: 170, y: 790, r: 70, shape: 'square', face: '#EADFC8', rim: '#2E5A5A' },
  { x: 420, y: 760, r: 100, shape: 'house', face: '#F3E6C8', rim: '#6B4428' },
  { x: 700, y: 800, r: 110, shape: 'round', face: '#FFF4DC', rim: '#8A2E4A' },
  { x: 930, y: 860, r: 64, shape: 'round', face: '#E6DCC6', rim: '#4A3A6A' },
  { x: 190, y: 1030, r: 74, shape: 'round', face: '#F0E4CC', rim: '#3A5A7A' },
  { x: 560, y: 1050, r: 90, shape: 'square', face: '#F6EDD8', rim: '#5A3A2A' },
];

const Face: React.FC<{ R: number; sec: number; face: string }> = ({ R, sec, face }) => (
  <g>
    <circle r={R} fill={face} />
    {Array.from({ length: 12 }, (_, i) => (
      <path key={i} d={`M0 ${-R * 0.88} V${-R * (i % 3 ? 0.8 : 0.72)}`} stroke={K} strokeWidth={i % 3 ? R * 0.03 : R * 0.06} strokeLinecap="round" transform={`rotate(${i * 30})`} />
    ))}
    {/* tutti alla stessa ora: le 10:04 */}
    <path d={`M0 ${R * 0.1} V${-R * 0.45}`} stroke={K} strokeWidth={R * 0.09} strokeLinecap="round" transform="rotate(302)" />
    <path d={`M0 ${R * 0.1} V${-R * 0.7}`} stroke={K} strokeWidth={R * 0.06} strokeLinecap="round" transform="rotate(24)" />
    <path d={`M0 ${R * 0.18} V${-R * 0.78}`} stroke="#C8352B" strokeWidth={Math.max(2, R * 0.025)} strokeLinecap="round" transform={`rotate(${sec * 6})`} />
    <circle r={R * 0.06} fill="#C8352B" stroke={K} strokeWidth="2" />
    {/* riflesso sul vetro */}
    <path d={`M${-R * 0.62} ${-R * 0.3} A${R * 0.7} ${R * 0.7} 0 0 1 ${-R * 0.2} ${-R * 0.68}`} fill="none" stroke="#FFFFFF" strokeWidth={R * 0.06} opacity=".45" strokeLinecap="round" />
  </g>
);

const Clock: React.FC<{ c: (typeof CLOCKS)[number]; sec: number; i: number; t: number }> = ({ c, sec, i, t }) => {
  const R = c.r;
  const sw = R > 90 ? 9 : 6;
  return (
    <g transform={`translate(${c.x} ${c.y})`}>
      {/* chiodo, filo e ombra sulla parete */}
      <path d={`M0 ${-R - 40} L${-R * 0.4} ${-R * 0.9} M0 ${-R - 40} L${R * 0.4} ${-R * 0.9}`} stroke={K} strokeWidth="3" opacity=".7" />
      <circle cy={-R - 40} r="5" fill="#9A8A7A" stroke={K} strokeWidth="2" />
      {c.shape === 'round' && <circle r={R * 1.12} cx="10" cy="14" fill="#000" opacity=".35" />}
      {c.shape !== 'round' && <rect x={-R * 1.15 + 10} y={-R * 1.15 + 14} width={R * 2.3} height={R * 2.3} rx="10" fill="#000" opacity=".35" />}
      {c.shape === 'round' && <circle r={R * 1.12} fill={c.rim} stroke={K} strokeWidth={sw} />}
      {c.shape === 'square' && <rect x={-R * 1.15} y={-R * 1.15} width={R * 2.3} height={R * 2.3} rx="12" fill={c.rim} stroke={K} strokeWidth={sw} />}
      {c.shape === 'house' && (
        <g>
          <path d={`M${-R * 1.2} ${-R * 0.9} L0 ${-R * 1.9} L${R * 1.2} ${-R * 0.9} V${R * 1.6} H${-R * 1.2} Z`} fill={c.rim} stroke={K} strokeWidth={sw} strokeLinejoin="round" />
          <path d={`M${-R * 1.4} ${-R * 0.8} L0 ${-R * 2.05} L${R * 1.4} ${-R * 0.8}`} fill="none" stroke="#3A2414" strokeWidth={sw * 1.6} strokeLinejoin="round" />
          <rect x={-R * 0.3} y={-R * 1.5} width={R * 0.6} height={R * 0.45} fill="#1A1020" stroke={K} strokeWidth="4" />
          {/* pesi a pigna e pendolo che oscilla */}
          {[-0.5, 0.5].map((k) => <g key={k}><path d={`M${R * k} ${R * 1.6} V${R * 2.5}`} stroke={K} strokeWidth="3" /><path d={`M${R * k - 14} ${R * 2.5} h28 l-6 52 h-16 Z`} fill="#B8862E" stroke={K} strokeWidth="4" /></g>)}
          <g transform={`translate(0 ${R * 1.3}) rotate(${Math.sin((t / BEAT) * Math.PI) * 14})`}>
            <path d={`M0 0 V${R * 1.2}`} stroke="#B8862E" strokeWidth="5" />
            <circle cy={R * 1.25} r={R * 0.22} fill="#E0B04A" stroke={K} strokeWidth="4" />
          </g>
        </g>
      )}
      <path d={`M${-R * 0.9} ${-R * 0.95} Q0 ${-R * 1.2} ${R * 0.9} ${-R * 0.95}`} fill="none" stroke="#FFFFFF" strokeWidth="3" opacity=".25" />
      <Face R={R * 0.92} sec={sec + i * 0} face={c.face} />
    </g>
  );
};

const Alarm: React.FC<{ x: number; y: number; s: number; t: number; sec: number; color: string }> = ({ x, y, s, t, sec, color }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cy="78" rx="60" ry="10" fill="#000" opacity=".35" />
    <path d="M-40 60 L-52 78 M40 60 L52 78" stroke={K} strokeWidth="7" strokeLinecap="round" />
    {[-1, 1].map((k) => (
      <g key={k} transform={`translate(${k * 42} -52) rotate(${k * 20})`}>
        <path d="M-26 6 A26 26 0 0 1 26 6 Z" fill="#D8B24A" stroke={K} strokeWidth="6" />
      </g>
    ))}
    <path d="M0 -60 V-78 M-12 -78 H12" stroke={K} strokeWidth="6" strokeLinecap="round" />
    <circle r="66" fill={color} stroke={K} strokeWidth="8" />
    <Face R={52} sec={sec} face="#FFF6E0" />
    <path d="M-50 -30 A60 60 0 0 1 -10 -60" fill="none" stroke="#FFFFFF" strokeWidth="5" opacity=".5" />
  </g>
);

export const Orologi: React.FC<ShotProps> = ({ t, dur, id }) => {
  const C = cam(t, dur, { z: 0.1, pan: 40, cy: 820 });
  const sec = Math.floor(t / BEAT); // scattano tutte insieme, una volta per battito
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <Lin id={`${id}-wall`} stops={[[0, '#1A1430'], [0.4, '#2B2044'], [0.75, '#3A2A48'], [1, '#1E1428']]} />
        <Lin id={`${id}-wood`} stops={[[0, '#6B4428'], [1, '#3A2414']]} />
        <pattern id={`${id}-pl`} width="120" height="1920" patternUnits="userSpaceOnUse">
          <path d="M0 0 V1920" stroke="#140E22" strokeWidth="4" opacity=".55" />
        </pattern>
      </defs>
      <g transform={C.transform}>
        {/* parete a doghe, la finestra alta con l'insegna magenta che pulsa */}
        <g transform={C.L(0.2)}>
          <rect x="-200" y="0" width="1480" height="1920" fill={`url(#${id}-wall)`} />
          <rect x="-200" y="0" width="1480" height="1920" fill={`url(#${id}-pl)`} />
          <g transform="translate(880 250)">
            <rect x="-120" y="-100" width="240" height="170" fill="#0C0820" stroke={K} strokeWidth="8" />
            <Glow id={`${id}-win`} x={0} y={-20} r={150} t={t} color={MAG} amp={0.2} rate={7} opacity={0.55} />
            <path d="M-120 -15 H120 M0 -100 V70" stroke={K} strokeWidth="7" />
            <path d="M-110 -90 L-60 -90 L-110 -40 Z" fill="#FFFFFF" opacity=".12" />
          </g>
          {/* macchie e crepe sull'intonaco */}
          {Array.from({ length: 10 }, (_, i) => <ellipse key={i} cx={r() * 1080} cy={300 + r() * 900} rx={40 + r() * 80} ry={20 + r() * 40} fill="#000" opacity={0.06 + r() * 0.06} />)}
          <path d="M60 300 L90 360 L76 420 L110 470" fill="none" stroke="#120C20" strokeWidth="4" opacity=".6" />
        </g>
        {/* orologi lontani, piccoli e scuri */}
        <g transform={C.L(0.45)} opacity=".55">
          {[[80, 420, 40], [700, 250, 46], [420, 250, 38], [1000, 620, 36]].map(([x, y, R], i) => (
            <g key={i} transform={`translate(${x} ${y})`}><circle r={R} fill="#5A4A6A" stroke={K} strokeWidth="5" /><Face R={R * 0.86} sec={sec} face="#CFC2B0" /></g>
          ))}
        </g>
        {/* gli orologi principali */}
        <g transform={C.L(0.7)}>
          {CLOCKS.map((c, i) => <Clock key={i} c={c} sec={sec} i={i} t={t} />)}
        </g>
        {/* lo scaffale con le sveglie, i barattoli e la lampada che illumina il muro */}
        <g transform={C.L(1.1)}>
          <Beam id={`${id}-beam`} x={160} y={1150} t={t} length={900} spread={520} color="#FFD98A" angle={-62} opacity={0.32} />
          <Dust t={t} top={{ y: 450, x0: 300, x1: 800 }} bottom={{ y: 1150, x0: 120, x1: 260 }} n={30} color="#FFE7B0" />
          <rect x="-100" y="1190" width="1280" height="40" fill={`url(#${id}-wood)`} stroke={K} strokeWidth="8" />
          <rect x="-100" y="1230" width="1280" height="500" fill="#120C1E" />
          <path d="M-100 1196 H1180" stroke="#E9C590" strokeWidth="3" opacity=".6" />
          <Alarm x={470} y={1110} s={0.9} t={t} sec={sec} color="#4F8AA8" />
          <Alarm x={760} y={1120} s={0.75} t={t} sec={sec} color="#C24A3A" />
          {[[600, 1135, '#6FA88A'], [640, 1145, '#C9A24A'], [900, 1130, '#7A6AA8']].map(([x, y, c], i) => (
            <g key={i}><rect x={Number(x) - 22} y={Number(y) - 40} width="44" height="96" rx="8" fill={String(c)} opacity=".85" stroke={K} strokeWidth="5" /><rect x={Number(x) - 24} y={Number(y) - 50} width="48" height="14" fill="#8A7A6A" stroke={K} strokeWidth="4" /></g>
          ))}
          {/* la lampada da tavolo */}
          <g transform="translate(170 1150)">
            <Glow id={`${id}-lamp`} x={10} y={10} r={220} t={t} color="#FFD98A" amp={0.06} rate={3} opacity={0.75} />
            <path d="M-40 40 H40 M0 40 L-30 -60 L20 -110" fill="none" stroke={K} strokeWidth="10" strokeLinecap="round" />
            <path d="M-10 -130 L70 -170 L90 -80 Z" fill="#2E5A5A" stroke={K} strokeWidth="8" strokeLinejoin="round" />
            <ellipse cx="80" cy="-122" rx="16" ry="44" transform="rotate(-25 80 -122)" fill="#FFF0C0" />
          </g>
        </g>
        {/* primo piano: la pendola che entra dal bordo destro e il cavo che pende a sinistra */}
        <g transform={C.L(1.4)}>
          <g transform="translate(1020 330)">
            <rect x="-80" y="-60" width="200" height="1300" fill="#3A2414" stroke={K} strokeWidth="10" />
            {/* cornici intagliate e il quadrante della pendola */}
            <path d="M-80 -60 H120 M-80 300 H120 M-80 340 H120" stroke="#1E120A" strokeWidth="6" />
            <path d="M-60 -40 H100 V280 H-60 Z" fill="#4A2E1A" stroke={K} strokeWidth="6" />
            <g transform="translate(20 120)">
              <circle r="92" fill="#C8962E" stroke={K} strokeWidth="8" />
              <Face R={78} sec={sec} face="#F6EDD8" />
            </g>
            <rect x="-50" y="380" width="140" height="560" fill="#140A08" stroke={K} strokeWidth="6" />
            <path d="M-44 386 L20 386 L-44 470 Z" fill="#FFFFFF" opacity=".07" />
            <g transform={`translate(20 400) rotate(${Math.sin((t / BEAT) * Math.PI) * 9})`}>
              <path d="M0 0 V420" stroke="#C8962E" strokeWidth="8" />
              <circle cy="440" r="48" fill="#E0B04A" stroke={K} strokeWidth="7" />
              <circle cx="-14" cy="426" r="12" fill="#FFF0C0" opacity=".7" />
            </g>
            <path d="M-80 -60 V1240" stroke="#E9C590" strokeWidth="4" opacity=".5" />
          </g>
          <path d="M40 -20 Q20 300 70 520 Q110 700 50 900" fill="none" stroke="#0A0612" strokeWidth="14" />
          <path d="M40 -20 Q20 300 70 520 Q110 700 50 900" fill="none" stroke={YEL} strokeWidth="2" opacity=".25" />
        </g>
        <g transform={C.L(1.8)}><NearMotes id={`${id}-near`} t={t} color="#FFE7B0" opacity={0.1} /></g>
        {Array.from({ length: 14 }, (_, i) => {
          const y = mod(i * 140 - t * 30, 1400) + 300;
          return <circle key={i} cx={(i * 197) % 1080} cy={y} r={2 + (i % 3)} fill="#FFE7B0" opacity={0.25} />;
        })}
      </g>
      <Finish id={id} tint={TINT} tintOpacity={0.1} />
    </svg>
  );
};
