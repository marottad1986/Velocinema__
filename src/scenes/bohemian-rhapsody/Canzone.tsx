import React from 'react';
import { camera, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Flyers, Glow, NearMotes, Notes, Stars, Wisps } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { GOLD, K, TINT, Upright } from './Comune';

// Una canzone impossibile: soggiorno di sera, pianoforte verticale con lampada accesa, fogli di musica sul leggio e
// sul pavimento, tazza di tè fumante, finestra con le luci di una città inglese, metronomo che oscilla.
// Piani: parete e finestra (0,25) · città fuori (0,35) · pianoforte, lampada, metronomo (0,65) · tappeto, poltrona, fogli (1,15) · pulviscolo (1,7)
// Eventi: cues[2] la lampada si fa più calda e dal pianoforte salgono le note · cues[4] i fogli volano: tre generi in uno
//         (tre spartiti diversi sul leggio: ballata, opera, rock).

const r = rng(3131);
const WINDOWS = Array.from({ length: 22 }, () => ({ x: 640 + r() * 330, y: 640 + r() * 260, on: r() > 0.35, ph: r() * 6 }));

export const Canzone: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const c2 = cues[2] ?? 5, c4 = cues[4] ?? 10.8;
  const warm = eo(seg(t, c2, c2 + 0.8));
  const fly = seg(t, c4, c4 + 0.6);
  const swing = Math.sin(t * Math.PI * 1.2) * 26;
  const sheets = [eo(seg(t, c4 + 0.1, c4 + 0.6)), eo(seg(t, c4 + 0.6, c4 + 1.1)), eo(seg(t, c4 + 1.1, c4 + 1.6))];

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ca" />
        <Lin id="ca-wall" stops={[[0, '#1A0E16'], [0.4, '#3A1E28'], [0.75, '#4E2832'], [1, '#2A141C']]} />
        <Lin id="ca-night" stops={[[0, '#0C1028'], [0.6, '#1E2448'], [1, '#3A3050']]} />
        <Lin id="ca-floor" stops={[[0, '#4A2A1E'], [0.5, '#341C14'], [1, '#1A0C08']]} />
        <Lin id="ca-rug" x2={1} y2={0} stops={[[0, '#5A1428'], [0.5, '#8A1E3C'], [1, '#5A1428']]} />
        <Lin id="ca-chair" stops={[[0, '#6A3A2A'], [1, '#2A140E']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete con carta da parati e finestra (zona calma in alto per il titolo) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="1700" fill="url(#ca-wall)" />
          <g transform="translate(0 150)">
          <g stroke="#5A2E3A" strokeWidth="3" opacity=".35">
            {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${-160 + i * 96} 620 V1180`} />)}
          </g>
          {/* quadretto e applique */}
          <rect x="120" y="680" width="150" height="190" rx="6" fill="#2A1A20" stroke={K} strokeWidth="7" />
          <path d="M140 840 L190 760 L220 800 L250 740 V850 H140 Z" fill="#5A3A40" />
          <Glow id="ca-sconce" x={420} y={700} r={160} t={t} color="#F2B870" amp={0.04} rate={1.2} opacity={0.35} />
          <path d="M404 700 h32 l-6 30 h-20 z" fill="#C89A5A" stroke={K} strokeWidth="5" />
          </g>
        </g>
        <g transform={L(0.35)}><g transform="translate(0 150)">
          <rect x="610" y="610" width="390" height="330" fill="url(#ca-night)" />
          <Stars t={t} seed={7} n={10} x={620} y={620} w={370} h={90} color="#F4ECDD" size={0.7} />
          <path d="M610 870 h40 v-60 h40 v30 h50 v-90 h30 v40 h60 v-20 h50 v60 h40 v-40 h40 v80 h40 V940 H610 Z" fill="#141430" />
          {WINDOWS.map((w, i) => (w.on && w.y > 800 ? <rect key={i} x={w.x} y={w.y} width="8" height="10" fill="#F2C870" opacity={0.5 + 0.4 * Math.sin(t * 0.7 + w.ph)} /> : null))}
        </g></g>
        <g transform={L(0.45)}><g transform="translate(0 150)">
          {/* telaio della finestra e tenda */}
          <rect x="600" y="600" width="410" height="350" fill="none" stroke={K} strokeWidth="12" />
          <path d="M805 600 V950 M600 775 H1010" stroke={K} strokeWidth="8" />
          <path d="M600 600 H1010" stroke="#B88A6A" strokeWidth="4" opacity=".5" />
          <path d={`M960 590 Q${990 + Math.sin(t * 0.8) * 8} 780 ${1000 + Math.sin(t * 0.8) * 10} 990 H1100 V590 Z`} fill="#6A1A30" stroke={K} strokeWidth="7" />
          <rect x="590" y="950" width="430" height="24" fill="#4A2A22" stroke={K} strokeWidth="6" />
        </g></g>

        {/* PIANO 2 — pianoforte, lampada, metronomo, tazza */}
        <g transform={L(0.65)}><g transform="translate(0 150)">
          <rect x="-200" y="1180" width="1480" height="600" fill="url(#ca-floor)" />
          <path d="M-200 1180 H1280" stroke={K} strokeWidth="8" />
          <ellipse cx="460" cy="1186" rx="340" ry="26" fill="#000" opacity=".35" />
          <Upright id="ca-pno" x={460} y={1186} s={1.05} t={t} lit={0.4 + 0.6 * warm} />
          {/* leggio con i tre spartiti */}
          <g transform="translate(460 960)">
            <rect x="-150" y="-110" width="300" height="20" rx="4" fill="#2A1218" stroke={K} strokeWidth="6" />
            {[-1, 0, 1].map((k, i) => (
              <g key={i} transform={`translate(${k * 92} ${-110 - sheets[i] * 16}) rotate(${k * 6 * (1 - sheets[i] * 0.5)})`}>
                <rect x="-48" y="-120" width="96" height="124" rx="3" fill="#F4ECDD" stroke={K} strokeWidth="5" />
                {[0, 1, 2, 3].map((j) => <path key={j} d={`M-36 ${-100 + j * 26} H36`} stroke="#6A5A5A" strokeWidth="2" />)}
                {/* ballata · opera · rock: tre segni diversi, accesi uno dopo l'altro */}
                {i === 0 && <path d="M-26 -60 q14 -24 28 0 t28 0" fill="none" stroke={sheets[0] > 0.1 ? GOLD : '#4A3A3A'} strokeWidth="6" strokeLinecap="round" />}
                {i === 1 && <path d="M-24 -40 V-86 M-6 -40 V-92 M12 -40 V-80 M28 -40 V-96" stroke={sheets[1] > 0.1 ? GOLD : '#4A3A3A'} strokeWidth="6" strokeLinecap="round" />}
                {i === 2 && <path d="M-28 -50 L-8 -90 L6 -54 L26 -96" fill="none" stroke={sheets[2] > 0.1 ? GOLD : '#4A3A3A'} strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />}
              </g>
            ))}
          </g>
          {/* metronomo */}
          <g transform="translate(250 744)">
            <path d="M-34 0 L-14 -110 H14 L34 0 Z" fill="#6A3A22" stroke={K} strokeWidth="6" strokeLinejoin="round" />
            <path d="M0 -6 L0 -104" stroke={K} strokeWidth="5" transform={`rotate(${swing} 0 -6)`} />
            <rect x="-8" y="-80" width="16" height="12" fill={GOLD} stroke={K} strokeWidth="3" transform={`rotate(${swing} 0 -6)`} />
          </g>
          {/* lampada da tavolo sul pianoforte */}
          <g transform="translate(660 744)">
            <Glow id="ca-lamp" x={0} y={-90} r={lerp(240, 330, warm)} t={t} color="#FFD98A" amp={0.05} rate={1.8} opacity={0.45 + 0.35 * warm} />
            <path d="M-10 0 V-80 M-40 0 H40" stroke={K} strokeWidth="9" strokeLinecap="round" />
            <path d="M-64 -76 L-34 -150 H34 L64 -76 Z" fill={warm > 0.3 ? '#F2C870' : '#D8A860'} stroke={K} strokeWidth="7" strokeLinejoin="round" />
            <path d="M-40 -82 H40" stroke="#FFF3CF" strokeWidth="4" opacity=".7" />
          </g>
          {/* tazza di tè */}
          <g transform="translate(140 1290)">
            <Wisps t={t} x={0} y={-60} color="#E8DCD0" n={3} h={150} width={5} opacity={0.6} />
            <ellipse cx="0" cy="8" rx="70" ry="14" fill="#E4D6C4" stroke={K} strokeWidth="6" />
            <path d="M-42 -60 H42 L34 0 H-34 Z" fill="#F4ECDD" stroke={K} strokeWidth="7" strokeLinejoin="round" />
            <path d="M42 -48 q30 4 22 28 q-6 14 -26 8" fill="none" stroke={K} strokeWidth="7" />
            <path d="M-30 -40 H30" stroke="#8A1E3C" strokeWidth="5" />
          </g>
          <Notes t={t + 2} x={460} y={760} n={7} spread={420} rise={230} color={GOLD} outline={K} size={0.9 * warm} speed={0.22} />
        </g></g>

        {/* PIANO 3 — tappeto, poltrona che incornicia a destra, fogli a terra */}
        <g transform={L(1.15)}>
          <path d="M-200 1520 Q540 1460 1280 1520 V2200 H-200 Z" fill="url(#ca-rug)" stroke={K} strokeWidth="10" />
          <path d="M-200 1560 Q540 1500 1280 1560" fill="none" stroke={GOLD} strokeWidth="5" opacity=".45" strokeDasharray="22 16" />
          {[[180, 1640, -14], [420, 1720, 8], [640, 1660, -4]].map(([x, y, a], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
              <rect x="-70" y="-50" width="140" height="100" rx="4" fill="#EDE2CE" stroke={K} strokeWidth="6" />
              {[0, 1, 2].map((j) => <path key={j} d={`M-54 ${-26 + j * 22} H54`} stroke="#6A5A5A" strokeWidth="3" />)}
              <circle cx={-20 + i * 14} cy={-6} r="7" fill={K} />
            </g>
          ))}
          <path d="M880 1440 Q860 1380 920 1360 H1280 V2200 H860 Q820 1800 880 1660 Z" fill="url(#ca-chair)" stroke={K} strokeWidth="10" />
          <path d="M900 1400 Q960 1380 1280 1380" stroke="#9A5A42" strokeWidth="5" fill="none" opacity=".6" />
        </g>

        {/* PIANO 4 — fogli che volano e pulviscolo vicino */}
        <g transform={L(1.6)}>
          <g opacity={fly}>
            <Flyers t={t - c4} seed={17} n={6} color="#F4ECDD" outline={K} y0={500} y1={1500} speed={0.18} shape="paper" />
          </g>
          <NearMotes id="ca-near" t={t} color="#FFE2B0" opacity={0.09} />
          {Array.from({ length: 14 }, (_, i) => {
            const p = mod(t * 0.05 + i / 14, 1);
            return <circle key={i} cx={560 + Math.sin(i * 1.7 + t * 0.3) * 160} cy={700 + p * 400} r={2.5} fill="#FFF0C8" opacity={0.5 * Math.sin(p * Math.PI)} />;
          })}
        </g>
      </g>

      <Finish id="ca" tint={TINT} tintOpacity={0.12} />
    </svg>
  );
};
