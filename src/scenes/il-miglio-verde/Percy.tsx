import React from 'react';
import { camera, eio, eo, lerp, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes, Wisps } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { Corridor, GOLD, K, Mouse, Spool } from './Comuni';

// La guardia cattiva e il topolino: la scrivania delle guardie all'inizio del corridoio verde. Percy si racconta con i suoi
// oggetti: il manganello lucido, il pettine, il berretto storto. Su «crudele con i detenuti» il manganello batte sul
// tavolo e rotola; su «parente della moglie del governatore» compare la lettera con il sigillo rosso, che lo protegge;
// su «Del addestra un topolino» un topolino attraversa il pavimento verde spingendo un rocchetto colorato verso una
// cella. Nessuna persona.
// Piani: corridoio (0,3) · scrivania (0,75) · topolino sul pavimento e cella di Del (0,95) · ombra in primo piano (1,25) · pulviscolo (1,6)

export const Percy: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const hit = griglia(cues[0] + 0.8);
  const bang = seg(t, hit - 0.25, hit) * (1 - seg(t, hit, hit + 0.12)); // il manganello si alza e batte
  const roll = eo(seg(t, hit + 0.1, hit + 1.2));
  const letter = eo(seg(t, griglia(cues[1] + 0.4), griglia(cues[1] + 0.4) + 0.6));
  const seal = seg(t, griglia(cues[1] + 1.4), griglia(cues[1] + 1.4) + 0.25);
  const walk = eio(seg(t, griglia(cues[2] + 0.2), dur - 0.4)); // il topolino spinge il rocchetto
  const mx = lerp(-260, 640, walk);
  const step = Math.abs(Math.sin(t * 14)) * 4 * (walk > 0 && walk < 1 ? 1 : 0);

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="pc" />
        <Lin id="pc-desk" x2={1} y2={0} stops={[[0, '#7A5432'], [1, '#4A321C']]} />
        <Lin id="pc-paper" stops={[[0, '#F2EAD4'], [1, '#D8CCAA']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.3)}>
          <Corridor t={t} id="pc" door={0.4} lamps={0.8} dark={0.2} />
        </g>
        {/* la scrivania delle guardie: manganello, pettine, berretto, caffè, la lettera del governatore */}
        <g transform={L(0.75)}>
          <path d="M-200 900 H640 L700 1000 H-200 Z" fill="url(#pc-desk)" stroke={K} strokeWidth="9" />
          <path d="M-200 1000 H700 V1060 H-200 Z" fill="#3A2614" stroke={K} strokeWidth="8" />
          <path d="M600 1060 V1300 M40 1060 V1300" stroke={K} strokeWidth="22" />
          <path d="M-180 915 H630" stroke="#B88A5A" strokeWidth="4" opacity=".5" />
          {/* lampada da tavolo */}
          <g transform="translate(60 900)">
            <path d="M0 0 V-160 L60 -220" stroke="#2A3A30" strokeWidth="12" fill="none" />
            <path d="M30 -250 L120 -200 L80 -150 Z" fill="#2E5A3E" stroke={K} strokeWidth="6" />
            <Glow id="pc-lamp" x={100} y={-150} r={230} t={t} color="#FFE6A8" amp={0.05} rate={1.5} opacity={0.5} />
            <path d="M80 -150 L-60 0 H320 Z" fill="#FFE6A8" opacity=".12" />
          </g>
          {/* il berretto storto */}
          <g transform="translate(250 900) rotate(12)">
            <path d="M-70 0 Q-70 -54 0 -58 Q70 -54 70 0 Z" fill="#2E3A48" stroke={K} strokeWidth="6" />
            <path d="M-76 0 H76 Q50 26 -54 18 Z" fill="#1A1E24" stroke={K} strokeWidth="6" />
          </g>
          {/* il pettine, sempre in tasca di Percy */}
          <g transform="translate(400 925) rotate(-8)">
            <rect x="-60" y="-10" width="120" height="16" rx="4" fill="#1A1A1A" stroke={K} strokeWidth="3" />
            {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${-54 + i * 8} 6 v12`} stroke="#1A1A1A" strokeWidth="3" />)}
          </g>
          {/* la tazza di caffè che fuma */}
          <g transform="translate(560 912)">
            <path d="M-26 0 V-40 H26 V0 Q0 10 -26 0 Z" fill="#E8E0D0" stroke={K} strokeWidth="5" />
            <path d="M26 -30 Q44 -30 42 -16 Q40 -4 26 -6" stroke={K} strokeWidth="5" fill="none" />
            <Wisps t={t} x={0} y={-46} color="#E8E0D0" n={3} h={110} width={20} />
          </g>
          {/* la lettera con il sigillo rosso del governatore */}
          {letter > 0 && (
            <g transform={`translate(460 ${880 - 30 * letter}) rotate(${-10 + 6 * letter}) scale(${0.8 + 0.2 * letter})`} opacity={letter}>
              <rect x="-90" y="-60" width="180" height="120" fill="url(#pc-paper)" stroke={K} strokeWidth="5" />
              {[-34, -14, 6, 26].map((y) => <path key={y} d={`M-66 ${y} H${y > 10 ? 30 : 66}`} stroke="#8A7A5A" strokeWidth="4" />)}
              <g transform={`translate(52 34) scale(${1 + 0.6 * (1 - seal) * (seal > 0 ? 1 : 0)})`}>
                <circle r="20" fill="#B8282A" stroke={K} strokeWidth="4" />
                <path d="M-8 -6 L0 -14 L8 -6 L6 8 H-6 Z" fill="#E86A5A" />
              </g>
            </g>
          )}
          {/* il manganello: si alza, batte e rotola */}
          <g transform={`translate(${200 + 120 * roll} ${890 - 120 * bang}) rotate(${-20 - 40 * bang + 360 * roll * 0.5})`}>
            <rect x="-120" y="-14" width="240" height="28" rx="14" fill="#2A1A10" stroke={K} strokeWidth="5" />
            <rect x="-110" y="-10" width="200" height="6" rx="3" fill="#8A6A4A" opacity=".6" />
            <path d="M-120 -14 V14 M-90 -14 V14" stroke="#5A4A30" strokeWidth="4" />
          </g>
          {seg(t, hit, hit + 0.3) > 0 && seg(t, hit, hit + 0.3) < 1 && (
            <g opacity={1 - seg(t, hit, hit + 0.3)}>
              {[-50, -20, 20, 50].map((a) => <path key={a} d={`M${200 + a * 2} 860 l${a / 2} -40`} stroke="#F2EEDC" strokeWidth="6" strokeLinecap="round" />)}
            </g>
          )}
        </g>
        {/* il pavimento verde in primo piano con il topolino che spinge il rocchetto */}
        <g transform={L(0.95)}>
          <path d="M-200 1100 H1280 V2200 H-200 Z" fill="#2E6A42" />
          <path d="M-200 1100 H1280" stroke="#1A3A24" strokeWidth="6" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M-200 ${1180 + i * 120} H1280`} stroke="#1A3A24" strokeWidth="4" opacity=".6" />)}
          {Array.from({ length: 9 }, (_, i) => <path key={`v${i}`} d={`M${-100 + i * 160} 1100 L${-260 + i * 200} 2200`} stroke="#1A3A24" strokeWidth="4" opacity=".6" />)}
          <ellipse cx={mx + 60} cy="1236" rx="190" ry="22" fill="#000" opacity=".25" />
          <Spool x={mx + 190} y={1180} s={1.5} roll={walk * 1400} />
          <Mouse x={mx} y={1194 - step} s={1.35} t={t} />
          {walk > 0 && <Glow id="pc-mouse" x={mx + 90} y={1180} r={240} t={t} color={GOLD} amp={0.08} rate={2} opacity={0.25} />}
          {/* la cella di Del a destra, dove arriva il topolino */}
          <g>
            {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M${900 + i * 60} 700 V1240`} stroke="#5A6058" strokeWidth="18" strokeLinecap="round" />)}
            <path d="M880 700 H1280 M880 960 H1280" stroke="#5A6058" strokeWidth="16" />
            <path d="M880 1240 H1280" stroke={K} strokeWidth="10" />
          </g>
        </g>
        <g transform={L(1.25)}><path d="M-200 1680 H1280 V2200 H-200 Z" fill="#0A0E0A" opacity=".45" /></g>
        <g transform={L(1.6)}>
          <Dust t={t} top={{ y: 700, x0: 120, x1: 420 }} bottom={{ y: 1100, x0: 0, x1: 640 }} seed={21} n={20} color="#FFE6A8" boost={0.15} />
          <NearMotes id="pc-near" t={t} color="#FFE6A8" n={5} y0={1300} opacity={0.07} />
        </g>
      </g>
      <Finish id="pc" tint="#1E3A28" tintOpacity={0.12} />
    </svg>
  );
};
