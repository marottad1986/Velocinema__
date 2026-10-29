import React from 'react';
import { camera, eio, eo, lerp, mod, rng, seg, wavePath } from '../../lib/anim';
import { Finish, FxDefs, GlowGradient, Lin } from '../../lib/fx';
import { Glow, NearMotes, Smoke, SunRays } from '../../lib/elements';
import type { SceneProps } from '../../types';

// L'ingorgo: autostrada bloccata sotto il sole, palme, auto colorate in coda, onde di clacson.
// Piani: cielo col sole (0,2) · colline e skyline nella foschia (0,35) · palme alte e cartello (0,5)
//        · carreggiata con le auto in coda (0,65–0,8) · guardrail, aiuola e palma in primo piano (1,15–1,3)
//        · pulviscolo caldo davanti alla camera (1,7)
// Evento: il clacson dell'auto gialla con «Litigano a colpi di clacson» (cue 4), risposta ≈ 0,8 s dopo.

const K = '#1B1530';
const r = rng(1608);

const PALMS = [
  { x: 130, top: 760, h: 300, ph: 0.3, s: 0.85 },
  { x: 380, top: 800, h: 260, ph: 1.7, s: 0.75 },
  { x: 690, top: 690, h: 370, ph: 2.6, s: 1 },
  { x: 920, top: 740, h: 320, ph: 4.1, s: 0.85 },
];
const SKY_BLOCKS = Array.from({ length: 16 }, (_, i) => ({ x: 520 + i * 34 + r() * 10, w: 22 + r() * 26, h: 30 + r() * (i > 5 && i < 11 ? 120 : 50) }));
const FLOWERS = Array.from({ length: 34 }, () => ({ x: -160 + r() * 1400, y: 1560 + r() * 320, s: 5 + r() * 6 }));

/** Fronda di palma: arco con foglioline, che oscilla. */
const frond = (len: number, ang: number, sway: number) => {
  const a = ((ang + sway) * Math.PI) / 180;
  const ex = Math.cos(a) * len, ey = Math.sin(a) * len;
  const cx = Math.cos(a) * len * 0.5, cy = Math.sin(a) * len * 0.5 - len * 0.28;
  return { main: `M0 0 Q${cx} ${cy} ${ex} ${ey + len * 0.15}`, ex, ey: ey + len * 0.15, cx, cy };
};

const Palm: React.FC<{ x: number; top: number; h: number; t: number; ph: number; s?: number; color: string; line?: boolean }> = ({ x, top, h, t, ph, s = 1, color, line }) => {
  const sway = Math.sin(t * 1.1 + ph) * 6;
  const tx = x + sway * 1.5;
  return (
    <g>
      <path d={`M${x - 10 * s} ${top + h} Q${x - 4} ${top + h * 0.5} ${tx} ${top}`} fill="none" stroke={color} strokeWidth={16 * s} strokeLinecap="round" />
      <g transform={`translate(${tx} ${top}) scale(${s})`} stroke={color} fill="none" strokeLinecap="round">
        {[-170, -140, -110, -70, -40, -10, 20, 160].map((a, i) => {
          const f = frond(130 + (i % 3) * 20, a, sway * (1 + (i % 2) * 0.6));
          return (
            <g key={i}>
              <path d={`M0 0 Q${f.cx} ${f.cy - 26} ${f.ex} ${f.ey} Q${f.cx} ${f.cy + 18} 0 0 Z`} fill={color} stroke="none" />
              <path d={f.main} strokeWidth={line ? 10 : 7} strokeDasharray="4 10" />
            </g>
          );
        })}
        <circle cx="0" cy="6" r="14" fill={color} stroke="none" />
      </g>
    </g>
  );
};

/** Auto vista di lato, rivolta a destra; origine al centro sul suolo. Vetri oscurati con riflessi. */
const Car: React.FC<{ id: string; t: number; x: number; y: number; s: number; color: string; shade: string; ph: number; bounce?: number; kind?: 'sedan' | 'van' }> = ({
  id, t, x, y, s, color, shade, ph, bounce = 0, kind = 'sedan',
}) => {
  const idle = Math.sin(t * 22 + ph * 7) * 1.2; // motore al minimo
  const body = kind === 'van'
    ? 'M-192 -36 Q-194 -150 -170 -158 L72 -160 Q92 -160 104 -146 L140 -96 L178 -88 Q196 -84 196 -58 L196 -34 Q196 -22 182 -22 L-180 -22 Q-192 -22 -192 -36 Z'
    : 'M-190 -40 Q-192 -80 -170 -86 L-112 -92 L-72 -142 Q-62 -152 -42 -152 L58 -152 Q78 -152 90 -142 L132 -96 L178 -88 Q196 -84 196 -58 L196 -34 Q196 -22 182 -22 L-180 -22 Q-192 -22 -190 -40 Z';
  const winA = kind === 'van' ? 'M-170 -146 L-170 -100 L-60 -100 L-60 -148 Z' : 'M-60 -140 L-98 -96 L-10 -96 L-10 -142 Z';
  const winB = kind === 'van' ? 'M-44 -148 L-44 -100 L126 -100 L98 -142 Q92 -148 84 -148 Z' : 'M2 -142 L2 -96 L118 -96 L86 -136 Q80 -142 70 -142 Z';
  const g1 = -170 + mod(t * 34 + ph * 90, 360);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="4" cy="2" rx="210" ry="16" fill="#000" opacity=".28" />
      <g transform={`translate(0 ${idle - bounce * 9})`}>
        <path d={body} fill={color} stroke={K} strokeWidth="8" strokeLinejoin="round" />
        {/* fiancata in ombra e luce sul tetto */}
        <path d="M-186 -50 H192 V-34 Q192 -26 182 -26 H-180 Q-188 -26 -186 -40 Z" fill={shade} />
        <path d={kind === 'van' ? 'M-166 -152 L70 -154' : 'M-66 -146 Q-56 -148 -40 -148 L56 -148'} stroke="#FFF6DC" strokeWidth="5" strokeLinecap="round" opacity=".7" />
        <defs>
          <clipPath id={`${id}-cl`}>
            <path d={winA} />
            <path d={winB} />
          </clipPath>
        </defs>
        <path d={winA} fill="#2A2350" />
        <path d={winB} fill="#2A2350" />
        <g clipPath={`url(#${id}-cl)`}>
          <rect x="-200" y="-160" width="400" height="22" fill="#6E63A8" opacity=".55" />
          <path d={`M${g1} -160 h46 l-44 70 h-46 Z M${g1 + 64} -160 h16 l-44 70 h-16 Z`} fill="#FFF3D6" opacity=".7" />
        </g>
        <path d={winA} fill="none" stroke={K} strokeWidth="6" strokeLinejoin="round" />
        <path d={winB} fill="none" stroke={K} strokeWidth="6" strokeLinejoin="round" />
        {/* porte, maniglie, fari, paraurti */}
        <path d="M-8 -92 V-30" stroke={K} strokeWidth="4" opacity=".6" />
        <path d="M-40 -78 h22 M30 -78 h22" stroke={K} strokeWidth="5" strokeLinecap="round" />
        <path d="M184 -76 Q196 -70 194 -58 L178 -60 Z" fill="#FFF6DC" stroke={K} strokeWidth="4" />
        <rect x="-194" y="-78" width="14" height="20" rx="4" fill="#E0484A" stroke={K} strokeWidth="4" />
        <path d="M-192 -32 H-150 M150 -32 H196" stroke="#D9D4E4" strokeWidth="7" strokeLinecap="round" />
      </g>
      {[-118, 118].map((wx) => (
        <g key={wx}>
          <circle cx={wx} cy="-26" r="34" fill="#221C38" stroke={K} strokeWidth="6" />
          <circle cx={wx} cy="-26" r="14" fill="#B9B3C8" />
        </g>
      ))}
    </g>
  );
};

/** Onde del clacson: archi concentrici che si allargano davanti all'auto. */
const Honk: React.FC<{ t: number; at: number; x: number; y: number; size?: number; n?: number }> = ({ t, at, x, y, size = 1, n = 3 }) => (
  <g fill="none" strokeLinecap="round">
    {Array.from({ length: n }, (_, k) => {
      const p = seg(t, at + k * 0.16, at + k * 0.16 + 0.85);
      if (p <= 0 || p >= 1) return null;
      const R = lerp(24, 210, eo(p)) * size;
      const a = (52 * Math.PI) / 180;
      const d = `M${x + Math.cos(-a) * R} ${y + Math.sin(-a) * R} A${R} ${R} 0 0 1 ${x + Math.cos(a) * R} ${y + Math.sin(a) * R}`;
      return (
        <g key={k} opacity={1 - p}>
          <path d={d} stroke={K} strokeWidth={20 * size} />
          <path d={d} stroke="#FFF6DC" strokeWidth={11 * size} />
        </g>
      );
    })}
  </g>
);

export const Ingorgo: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  const HONK = cues[4] ?? 5.38;
  const bounce = Math.sin(seg(t, HONK, HONK + 0.35) * Math.PI) + 0.5 * Math.sin(seg(t, HONK + 0.35, HONK + 0.6) * Math.PI);
  // la coda avanza di un'auto... di pochi centimetri
  const creep = 34 * eio(seg(t, 2.4, 3.8));
  const creepFar = 22 * eio(seg(t, 1.2, 2.6));
  const heat = (k: number) => Math.sin(t * 2.4 + k) * 0.5 + 0.5;

  const NEAR_Y = 1238;
  const FAR_Y = 1048;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ig" />
        <Lin id="ig-sky" stops={[[0, '#8D7BC4'], [0.3, '#B5A6DA'], [0.55, '#EBCFC8'], [0.72, '#F8DFA8'], [1, '#FBE9BE']]} />
        <Lin id="ig-hill" stops={[[0, '#C7A9C9'], [1, '#D8BFC4']]} />
        <Lin id="ig-road" stops={[[0, '#8E86A0'], [0.35, '#6E6684'], [1, '#4E4766']]} />
        <Lin id="ig-wall" stops={[[0, '#EFE6D8'], [0.5, '#D3C6B6'], [1, '#9E8E84']]} />
        <Lin id="ig-bank" stops={[[0, '#9DA35C'], [1, '#4F5A34']]} />
        <Lin id="ig-trunk" x2={1} y2={0} stops={[[0, '#5A4232'], [0.6, '#8A6A4E'], [1, '#B48C64']]} />
        <GlowGradient id="ig-mir" color="#E9E2FF" core={0.8} mid={0.35} />
        <GlowGradient id="ig-haze" color="#FFF0D2" core={0.7} mid={0.3} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo caldo con il sole e i raggi (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1300" fill="url(#ig-sky)" />
          <SunRays id="ig-rays" x={860} y={600} t={t} color="#FFF0C0" n={11} from={-150} to={150} length={1100} width={90} opacity={0.6} />
          <Glow id="ig-sunhalo" x={860} y={600} r={430} t={t} color="#FFE6A8" amp={0.05} rate={1.4} opacity={0.75} />
          <circle cx="860" cy="600" r="86" fill="#FFF3CC" />
          <circle cx="860" cy="600" r="86" fill="none" stroke="#F7C878" strokeWidth="6" />
          {/* scia di un aereo */}
          <path d={`M${lerp(-80, 260, seg(t, 0, dur))} 700 L${lerp(140, 480, seg(t, 0, dur))} 650`} stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity=".6" />
        </g>

        {/* PIANO 1 — colline e grattacieli nella foschia (0,35) */}
        <g transform={L(0.35)}>
          <path d="M-200 960 L-200 900 Q-60 840 80 870 Q200 820 320 860 Q420 800 560 850 Q700 830 820 870 Q960 820 1280 880 V960 Z" fill="url(#ig-hill)" />
          {SKY_BLOCKS.map((b, i) => <rect key={i} x={b.x} y={930 - b.h} width={b.w} height={b.h + 30} fill="#B79CC0" opacity=".85" />)}
          <path d="M120 862 L128 852 M160 858 l6 -9" stroke="#A88CB4" strokeWidth="4" />
          <ellipse cx="540" cy="945" rx="900" ry="50" fill="url(#ig-haze)" opacity=".8" />
        </g>

        {/* PIANO 2 — palme alte e cartello autostradale (0,5) */}
        <g transform={L(0.5)}>
          {PALMS.map((p, i) => <Palm key={i} x={p.x} top={p.top} h={p.h} t={t} ph={p.ph} s={p.s} color="#5B4C7E" />)}
          {/* portale con cartello verde */}
          <path d="M610 980 V760 M1010 980 V760" stroke="#6E6684" strokeWidth="14" />
          <path d="M600 770 H1040" stroke="#6E6684" strokeWidth="10" />
          <rect x="680" y="772" width="300" height="118" rx="10" fill="#2F7A5A" stroke={K} strokeWidth="6" />
          <rect x="690" y="782" width="280" height="98" rx="6" fill="none" stroke="#F6F1E9" strokeWidth="3" />
          <path d="M722 808 l18 -14 l18 14 v26 h-36 Z" fill="#F6F1E9" stroke={K} strokeWidth="3" />
          <text x="740" y="830" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="20" fill="#2F7A5A">101</text>
          <text x="868" y="822" textAnchor="middle" fontFamily="Figtree" fontWeight={800} fontSize="30" fill="#F6F1E9">HOLLYWOOD</text>
          <path d="M840 846 v22 M830 856 l10 -12 l10 12" stroke="#F6F1E9" strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>

        {/* PIANO 3 — carreggiata con miraggio di calore (0,65) */}
        <g transform={L(0.65)}>
          <path d="M-200 958 H1280 V1330 H-200 Z" fill="url(#ig-road)" />
          <path d="M-200 960 H1280" stroke="#DCD4E4" strokeWidth="5" />
          {/* miraggi: pozze chiare che tremolano sull'asfalto */}
          <ellipse cx={300 + Math.sin(t * 0.8) * 20} cy="1000" rx="260" ry="12" fill="url(#ig-mir)" opacity={0.45 + 0.3 * heat(0)} />
          <ellipse cx={860 + Math.sin(t * 0.7 + 2) * 20} cy="1010" rx="220" ry="10" fill="url(#ig-mir)" opacity={0.4 + 0.3 * heat(2)} />
          <ellipse cx={540 + Math.sin(t * 0.9 + 1) * 24} cy="1272" rx="420" ry="16" fill="url(#ig-mir)" opacity={0.35 + 0.25 * heat(1)} />
          {/* tratteggio di corsia */}
          <path d="M-200 1130 H1280" stroke="#F6F1E9" strokeWidth="7" strokeDasharray="70 60" opacity=".85" />
          <path d="M-200 1300 H1280" stroke="#F2E6B0" strokeWidth="6" opacity=".7" />
          {/* onde di calore che salgono dall'asfalto */}
          <g fill="none" stroke="#F4ECFF" strokeLinecap="round">
            {[0, 1, 2, 3].map((k) => (
              <path key={k} d={wavePath(990 + k * 70 - mod(t * 28 + k * 18, 70) * 0.6, 3 + k, 120 + k * 20)} transform={`translate(${-mod(t * (30 + k * 8), 120 + k * 20)} 0)`} strokeWidth="3" opacity={0.18 + 0.14 * heat(k * 1.3)} />
            ))}
          </g>
        </g>

        {/* corsia lontana (0,72) */}
        <g transform={L(0.72, creepFar)}>
          <Car id="ig-f1" t={t} x={30} y={FAR_Y} s={0.6} color="#6B4FA0" shade="#54397E" ph={0.2} kind="van" />
          <Car id="ig-f2" t={t} x={300} y={FAR_Y} s={0.6} color="#8FCFB5" shade="#6EAE95" ph={1.1} />
          <Car id="ig-f3" t={t} x={565} y={FAR_Y} s={0.6} color="#E79AB0" shade="#C67890" ph={2.3} />
          <Car id="ig-f4" t={t} x={830} y={FAR_Y} s={0.6} color="#6FA8DC" shade="#5288BC" ph={3.1} />
          <Car id="ig-f5" t={t} x={1095} y={FAR_Y} s={0.6} color="#F6F1E9" shade="#D6CCC0" ph={4.4} kind="van" />
          <Honk t={t} at={1.0} x={30 + 0.6 * 196} y={FAR_Y - 0.6 * 70} size={0.55} n={2} />
          <Honk t={t} at={2.5} x={830 + 0.6 * 196} y={FAR_Y - 0.6 * 70} size={0.55} n={2} />
          <Honk t={t} at={HONK + 0.85} x={565 + 0.6 * 196} y={FAR_Y - 0.6 * 70} size={0.7} n={3} />
        </g>

        {/* PIANO 4 — corsia vicina con l'auto gialla (0,8) */}
        <g transform={L(0.8, creep)}>
          <Smoke id="ig-ex1" t={t} x={-80} y={NEAR_Y - 30} color="#EFE8F6" n={7} rise={70} wind={-150} r0={10} r1={46} speed={0.5} opacity={0.75} />
          <Smoke id="ig-ex2" t={t + 0.7} x={352} y={NEAR_Y - 30} color="#EFE8F6" n={7} rise={70} wind={-150} r0={10} r1={46} speed={0.5} opacity={0.75} />
          <Car id="ig-n1" t={t} x={110} y={NEAR_Y} s={1} color="#E8735A" shade="#C4563F" ph={0.6} />
          <Car id="ig-n2" t={t} x={545} y={NEAR_Y} s={1} color={P.accento} shade="#D29E2E" ph={1.9} bounce={bounce} />
          <Car id="ig-n3" t={t} x={1050} y={NEAR_Y} s={1} color="#3E9C9A" shade="#2C7B7A" ph={3.3} kind="van" />
          <Honk t={t} at={HONK} x={545 + 196} y={NEAR_Y - 74} size={1.05} n={4} />
        </g>

        {/* PIANO 5 — guardrail di cemento e scarpata fiorita (1,15) */}
        <g transform={L(1.15)}>
          <path d="M-200 1330 H1280 L1280 1352 Q1250 1372 1250 1400 V1490 H-200 V1400 Q-170 1372 -200 1352 Z" fill="url(#ig-wall)" stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M-200 1342 H1280" stroke="#FFF8EA" strokeWidth="5" opacity=".8" />
          {[-60, 220, 500, 780, 1060].map((x) => <path key={x} d={`M${x} 1360 V1486`} stroke={K} strokeWidth="5" opacity=".45" />)}
          <path d="M80 1420 l12 18 l-6 16 M640 1400 l-10 20 l8 14" fill="none" stroke={K} strokeWidth="4" opacity=".5" />
          <path d="M-200 1486 Q300 1470 700 1490 Q1000 1500 1280 1480 V2000 H-200 Z" fill="url(#ig-bank)" stroke={K} strokeWidth="8" strokeLinejoin="round" />
          {FLOWERS.map((f, i) => <circle key={i} cx={f.x} cy={f.y} r={f.s} fill={i % 3 ? '#E79AB0' : '#F6F1E9'} stroke={K} strokeWidth="2.5" />)}
          <path d="M-200 1640 Q200 1610 600 1650 Q900 1680 1280 1640" fill="none" stroke="#7A8448" strokeWidth="6" opacity=".7" />
          {/* cespugli di oleandro, ciuffi d'erba secca, cono e fronda caduta */}
          {[[-40, 1600, 1.2], [300, 1720, 0.9], [760, 1620, 1]].map(([x, y, k], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${k})`}>
              <path d="M-150 60 Q-170 -30 -90 -60 Q-40 -120 30 -80 Q110 -100 140 -20 Q180 30 150 60 Z" fill="#4E6A3E" stroke={K} strokeWidth="8" strokeLinejoin="round" />
              <path d="M-90 -40 Q-40 -80 20 -56" fill="none" stroke="#7E9A5A" strokeWidth="6" strokeLinecap="round" />
              {[[-80, -20], [-20, -60], [50, -40], [100, 0], [-40, 20], [30, 10]].map(([fx, fy], j) => (
                <circle key={j} cx={fx} cy={fy} r="11" fill={j % 2 ? '#F6F1E9' : '#E79AB0'} stroke={K} strokeWidth="3" />
              ))}
            </g>
          ))}
          {[[180, 1560], [560, 1600], [980, 1700], [460, 1820]].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y} l-22 -60 M${x + 8} ${y} l4 -74 M${x + 16} ${y} l26 -56 M${x - 6} ${y} l-40 -34`} stroke="#C2B070" strokeWidth="6" strokeLinecap="round" transform={`rotate(${Math.sin(t * 1.4 + i) * 4} ${x} ${y})`} />
          ))}
          <g transform="translate(560 1540)">
            <path d="M-40 0 L-12 -110 H12 L40 0 Z" fill="#F08A4B" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            <path d="M-24 -50 H24 M-30 -26 H30" stroke="#F6F1E9" strokeWidth="10" />
            <rect x="-56" y="-6" width="112" height="16" rx="4" fill="#C46A34" stroke={K} strokeWidth="6" />
          </g>
          <path d="M840 1820 Q940 1780 1060 1800" fill="none" stroke={K} strokeWidth="14" strokeLinecap="round" />
          <path d="M840 1820 Q940 1780 1060 1800" fill="none" stroke="#B8A060" strokeWidth="7" strokeLinecap="round" strokeDasharray="10 8" />
        </g>

        {/* PIANO 6 — palma in primo piano che incornicia a destra (1,3) */}
        <g transform={L(1.3)}>
          <path d={`M1110 2000 Q1060 1400 ${1010 + Math.sin(t * 1.1) * 8} 300`} fill="none" stroke={K} strokeWidth="58" strokeLinecap="round" />
          <path d={`M1110 2000 Q1060 1400 ${1010 + Math.sin(t * 1.1) * 8} 300`} fill="none" stroke="url(#ig-trunk)" strokeWidth="44" strokeLinecap="round" />
          {Array.from({ length: 22 }, (_, i) => {
            const y = 400 + i * 72;
            const x = 1010 + ((y - 300) / 1700) ** 1.6 * 100 - 6;
            return <path key={i} d={`M${x - 20} ${y} q20 10 42 0`} fill="none" stroke={K} strokeWidth="5" opacity=".55" />;
          })}
          <g transform={`translate(${1010 + Math.sin(t * 1.1) * 8} 300) scale(2.1)`} stroke={K} strokeLinecap="round" fill="none">
            {[-178, -158, -136, -112, 170, 150, 120, 95].map((a, i) => {
              const f = frond(150, a, Math.sin(t * 1.3 + i) * 5);
              return (
                <g key={i}>
                  <path d={f.main} strokeWidth="16" />
                  <path d={f.main} stroke="#4E6A3E" strokeWidth="9" />
                </g>
              );
            })}
          </g>
        </g>

        {/* PIANO 7 — pulviscolo caldo davanti alla camera (1,7) */}
        <g transform={L(1.7)}>
          <NearMotes id="ig-near" t={t} color="#FFF0C8" n={8} opacity={0.3} vx={-25} vy={-14} />
        </g>
      </g>

      <Finish id="ig" tint="#F2C14E" tintOpacity={0.12} />
    </svg>
  );
};
