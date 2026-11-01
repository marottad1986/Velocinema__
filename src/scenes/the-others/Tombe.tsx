import React from 'react';
import { camera, eio, eo, lerp, rng, seg } from '../../lib/anim';
import { Flyers, Fog, Glow, Gulls, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { HAND, SERIF } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { AMBRA, K, OthersDefs, Ombra, Villa as Casa } from './Comuni';

// Le tombe sotto le foglie: il giardino della villa al crepuscolo, la villa lontana nella nebbia. Al centro tre lapidi
// coperte da mucchi di foglie secche.
// Eventi: prima frase la vecchia fotografia (vista dal retro, con i nomi a mano e la data) si illumina appoggiata alla
// lapide centrale; seconda frase il vento spazza via le foglie da una lapide alla volta e compaiono i nomi dei tre
// domestici; terza frase si accende l'anno 1891 inciso sulle tre lapidi e la nebbia sale. Nessuna persona.
// Piani: cielo e corvi (0,2) · villa nella nebbia (0,35) · prato e alberi (0,5) · lapidi (0,72)
//        · cancellata del piccolo cimitero (1,15) · foglie e nebbia vicina (1,5–1,8)

const STONES = [
  { x: 230, w: 230, h: 330, name: ['BERTHA', 'MILLS'], rot: -3 },
  { x: 540, w: 250, h: 390, name: ['EDMUND', 'TUTTLE'], rot: 1 },
  { x: 850, w: 220, h: 310, name: ['LYDIA'], rot: 4 },
];
const r = rng(808);
const LEAVES = STONES.map(() => Array.from({ length: 44 }, () => ({ dx: (r() - 0.5) * 1.1, dy: r(), a: r() * 360, c: r() })));

export const Tombe: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const photo = eo(seg(t, cues[0] + 0.2, cues[0] + 1.0));
  const blow = (i: number) => eio(seg(t, cues[1] + 0.2 + i * 0.7, cues[1] + 1.2 + i * 0.7));
  const year = eo(seg(t, cues[2] + 1.0, cues[2] + 1.8));
  const fogUp = seg(t, cues[2], dur);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="to" />
        <OthersDefs id="to" />
        <Lin id="to-sky" stops={[[0, '#141A1E'], [0.35, '#2E3A3E'], [0.6, '#5A5A50'], [0.75, '#7A6A54']]} />
        <Lin id="to-grass" stops={[[0, '#2E3628'], [0.5, '#1E2418'], [1, '#0C100A']]} />
        <Lin id="to-grave" x2={1} y2={0} stops={[[0, '#8A9088'], [0.45, '#6A706A'], [1, '#3A403C']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo al crepuscolo con i corvi (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#to-sky)" />
          <Glow id="to-sun" x={300} y={1000} r={420} t={t} color="#C8A070" amp={0.02} rate={0.6} opacity={0.35} />
          <Gulls t={t} seed={9} n={5} y={600} h={160} color="#0A0D0E" size={0.75} period={12} />
        </g>

        {/* PIANO 1 — la villa lontana nella nebbia, una finestra accesa (0,35) */}
        <g transform={L(0.35)} opacity=".55">
          <Casa id="to" x={700} y={1020} t={t} s={0.42} lit={[0, 0, 0, 0, 0, 0, 0, 0, 0.9]} />
          <Fog id="to-f0" t={t} y={990} rx={800} ry={90} color="#8A928A" opacity={0.7} speed={0.15} />
        </g>

        {/* PIANO 2 — prato e alberi spogli ai lati (0,5) */}
        <g transform={L(0.5)}>
          <path d="M-200 1010 Q540 990 1280 1010 V2200 H-200 Z" fill="url(#to-grass)" />
          {[[-40, 1030, 1], [1110, 1020, -1]].map(([x, y, d], i) => (
            <g key={i} stroke="#141A16" strokeLinecap="round" fill="none">
              <path d={`M${x} ${y} Q${x + 10 * d} 860 ${x - 6 * d} 640`} strokeWidth="44" />
              <path d={`M${x} 820 Q${x + 120 * d} 760 ${x + 200 * d} 640 M${x - 2 * d} 720 Q${x + 80 * d} 680 ${x + 110 * d} 600 M${x + 120 * d} 760 l50 -30`} strokeWidth="16" />
            </g>
          ))}
          <Fog id="to-f1" t={t} y={1060} rx={900} ry={80} color="#9AA29A" opacity={0.45} speed={0.2} ph={1} />
        </g>

        {/* PIANO 3 — le tre lapidi con le foglie (0,72) */}
        <g transform={L(0.72)}>
          {STONES.map((st, i) => {
            const b = blow(i);
            return (
              <g key={i} transform={`rotate(${st.rot} ${st.x} 1260)`}>
                <Ombra id="to" x={st.x} y={1262} rx={st.w * 0.75} ry={16} />
                <path d={`M${st.x - st.w / 2} 1262 V${1262 - st.h + st.w / 2} A${st.w / 2} ${st.w / 2} 0 0 1 ${st.x + st.w / 2} ${1262 - st.h + st.w / 2} V1262 Z`} fill="url(#to-grave)" stroke={K} strokeWidth="9" />
                <path d={`M${st.x - st.w / 2 + 10} 1250 V${1262 - st.h + st.w / 2} A${st.w / 2 - 10} ${st.w / 2 - 10} 0 0 1 ${st.x - 10} ${1262 - st.h + 12}`} stroke="#C8CEC6" strokeWidth="5" fill="none" opacity=".5" />
                {/* croce incisa, muschio, crepa */}
                <path d={`M${st.x} ${1262 - st.h + 40} v60 M${st.x - 22} ${1262 - st.h + 62} h44`} stroke="#3A403C" strokeWidth="8" strokeLinecap="round" />
                <path d={`M${st.x + st.w / 2 - 30} ${1262 - st.h + 120} l-20 40 l10 30 l-16 30`} stroke="#2A302C" strokeWidth="4" fill="none" />
                {[0, 1, 2, 3].map((k) => <circle key={k} cx={st.x - st.w / 2 + 20 + k * 22} cy={1250 - (k % 2) * 12} r={14} fill="#3A5032" opacity=".8" />)}
                {/* nomi */}
                {st.name.map((n, k) => (
                  <text key={k} x={st.x} y={1262 - st.h + 150 + k * 46} textAnchor="middle" fontFamily={SERIF} fontSize={st.name.length > 1 ? 40 : 46} fill="#1E2420" opacity={0.1 + 0.9 * b} letterSpacing="2">{n}</text>
                ))}
                <text x={st.x} y={1262 - st.h + 150 + st.name.length * 46 + 20} textAnchor="middle" fontFamily={SERIF} fontSize="40" fill={year > 0 ? AMBRA : '#1E2420'} opacity={0.1 + 0.9 * b}>1891</text>
                <Glow id={`to-y${i}`} x={st.x} y={1262 - st.h + 150 + st.name.length * 46 + 6} r={110} t={t} color={AMBRA} amp={0.08} rate={3} ph={i} opacity={0.6 * year} />
                {/* mucchio di foglie che il vento porta via */}
                {LEAVES[i].map((lf, k) => {
                  const lx = st.x + lf.dx * st.w + b * (300 + lf.c * 500);
                  const ly = 1262 - lf.dy * st.h * 0.92 - b * (120 + lf.c * 260) + b * b * 60;
                  return (
                    <path key={k} d="M0 -18 Q14 0 0 18 Q-14 0 0 -18 Z" fill={lf.c > 0.6 ? '#8A5A2A' : lf.c > 0.3 ? '#6A4A24' : '#A07030'} stroke={K} strokeWidth="3"
                      transform={`translate(${lx} ${ly}) rotate(${lf.a + b * 400}) scale(${1.4 + lf.c})`} opacity={1 - seg(b, 0.6, 1)} />
                  );
                })}
              </g>
            );
          })}
          {/* la fotografia vista dal retro, appoggiata alla lapide centrale */}
          <g transform={`translate(${lerp(640, 560, photo)} ${lerp(1180, 1236, photo)}) rotate(${lerp(30, -8, photo)})`} opacity={photo}>
            <Glow id="to-ph" x={0} y={-20} r={150} t={t} color="#FFE0A0" amp={0.08} rate={3} opacity={0.5 * (1 - 0.6 * seg(t, cues[1] + 1, cues[1] + 2))} />
            <rect x="-110" y="-70" width="220" height="130" fill="url(#to-paper)" stroke={K} strokeWidth="5" />
            <text x="0" y="-30" textAnchor="middle" fontFamily={HAND} fontSize="21" fill="#4A3A2A">Bertha · Edmund · Lydia</text>
            <text x="0" y="12" textAnchor="middle" fontFamily={HAND} fontSize="32" fill="#7A2A1E">1891</text>
            <path d="M-70 36 H70" stroke="#8A7A5A" strokeWidth="3" />
          </g>
          <Fog id="to-f2" t={t} y={lerp(1300, 1180, fogUp)} rx={900} ry={110} color="#A8B0A8" opacity={0.35 + 0.25 * fogUp} speed={0.25} ph={2} />
        </g>

        {/* PIANO 4 — cancellata bassa di ferro del piccolo cimitero (1,15) */}
        <g transform={L(1.15)}>
          <path d="M-200 1520 H1280" stroke={K} strokeWidth="18" />
          <path d="M-200 1700 H1280" stroke={K} strokeWidth="18" />
          <path d="M-200 1514 H1280" stroke="#5A6260" strokeWidth="4" opacity=".6" />
          {Array.from({ length: 16 }, (_, i) => (
            <g key={i}>
              <rect x={-180 + i * 90} y="1440" width="14" height="560" fill="#1A1E20" stroke={K} strokeWidth="4" />
              <path d={`M${-173 + i * 90} 1400 l-16 44 h32 Z`} fill="#2A2E30" stroke={K} strokeWidth="4" />
            </g>
          ))}
          {Array.from({ length: 14 }, (_, i) => <path key={`l${i}`} d={`M${-150 + i * 95} 1920 q${10 + (i % 3) * 10} -60 ${-10} -110`} stroke="#2A3624" strokeWidth="10" fill="none" />)}
        </g>

        {/* PIANO 5 — foglie nel vento e nebbia vicina (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Flyers t={t} seed={33} n={8} color="#8A5A2A" outline={K} w={30} h={42} y0={700} y1={1700} speed={0.12} shape="leaf" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="to-near" t={t} color="#C8D0C8" n={7} r0={80} r1={190} opacity={0.12} />
        </g>
      </g>
      <Finish id="to" tint="#3A4744" tintOpacity={0.12} />
    </svg>
  );
};
