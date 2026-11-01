import React from 'react';
import { camera, eo, rng, seg } from '../../lib/anim';
import { Dust, Glow, Moon, NearMotes, Stars, WaveLines } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { Amber, JPDefs, K, Ombra } from './Comuni';

// Dinosauri di nuovo vivi: il laboratorio di notte. Al centro, grande, la goccia d'ambra con la zanzara su un piedistallo
// di vetro illuminato da sotto (oggetto chiave, accento); a destra il microscopio, a sinistra il monitor con il DNA;
// dalla grande finestra l'isola nel mare sotto la luna.
// Eventi: prima frase sull'isola si accendono le luci del parco; seconda frase tra le palme spunta la sagoma lontana di un
// brachiosauro; terza frase sul monitor gira la doppia elica del DNA; quarta frase (cue 3 − 0,3) si accende la luce
// sotto l'ambra, con il glockenspiel dello spartito. Nessuna persona.
// Piani: cielo, mare e isola (0,25) · parete, finestra, monitor (0,5) · banco e microscopio (0,75) · ambra sul piedistallo (0,85)
//        · provette e quaderno in primo piano (1,2) · pulviscolo nel fascio (1,5–1,8)

const r = rng(65);
const ISLE_LIGHTS = Array.from({ length: 9 }, () => ({ x: 660 + r() * 300, y: 860 + r() * 40 }));

export const Ambra: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const island = eo(seg(t, cues[0], cues[1]));
  const dino = eo(seg(t, cues[1], cues[1] + 1.2));
  const dna = seg(t, cues[2], cues[2] + 1.2);
  const lamp = eo(seg(t, cues[3] - 0.3, cues[3] + 0.6));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="am" />
        <JPDefs id="am" />
        <Lin id="am-night" stops={[[0, '#050A10'], [0.6, '#0E1E2A'], [1, '#1A3040']]} />
        <Lin id="am-sea" stops={[[0, '#1E3A4A'], [1, '#0A1820']]} />
        <Lin id="am-wall" stops={[[0, '#0E1A16'], [0.5, '#1A2E26'], [1, '#22382E']]} />
        <Lin id="am-bench" stops={[[0, '#4A5A52'], [0.15, '#2E3A34'], [1, '#141C18']]} />
        <Lin id="am-glass" x2={1} y2={0} stops={[[0, '#A8D8E8', 0.25], [0.5, '#E8F8FF', 0.5], [1, '#A8D8E8', 0.2]]} />
        <Lin id="am-mon" x2={1} y2={0} stops={[[0, '#1A2420'], [0.5, '#2E3A34'], [1, '#141C18']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — cielo stellato, luna, mare e l'isola con le luci del parco (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#am-night)" />
          <Stars t={t} seed={4} n={40} x={560} y={560} w={500} h={260} color="#E8F0F8" size={1} />
          <Moon id="am-moon" x={960} y={620} r={40} t={t} color="#F2F0E0" halo="#C8D8E8" />
          <rect x="540" y="880" width="560" height="200" fill="url(#am-sea)" />
          <WaveLines t={t} ys={[910, 950, 990]} color="#5A8AA0" amp={4} w={120} speed={0.4} width={3} opacity={0.4} />
          <path d="M620 890 Q700 820 760 840 Q800 760 860 790 Q920 800 960 850 Q1010 860 1040 890 Z" fill="#0E1E18" />
          {[[700, 840], [740, 828], [900, 820], [960, 846]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}><path d="M0 0 V-40" stroke="#0E1E18" strokeWidth="5" />{[-60, -20, 20, 60].map((a) => <path key={a} d={`M0 -40 q${a * 0.4} -14 ${a * 0.6} 4`} stroke="#0E1E18" strokeWidth="5" fill="none" />)}</g>
          ))}
          {/* la sagoma lontana di un brachiosauro tra le palme */}
          <g transform={`translate(820 ${850 - 40 * dino})`} opacity={dino}>
            <path d="M-40 0 Q-30 -26 0 -24 Q30 -26 36 0 Z M20 -20 Q28 -60 46 -76 L54 -72 Q40 -50 34 -20 Z" fill="#14281E" />
          </g>
          {ISLE_LIGHTS.map((l, i) => <circle key={i} cx={l.x} cy={l.y} r="4" fill="#F2C46A" opacity={island * (0.6 + 0.4 * Math.sin(t * 2 + i))} />)}
          <Glow id="am-isle" x={820} y={860} r={220} t={t} color="#F2C46A" amp={0.05} rate={1} opacity={0.4 * island} />
        </g>

        {/* PIANO 1 — parete del laboratorio, grande finestra, monitor con il DNA (0,5) */}
        <g transform={L(0.5)}>
          <path d="M-200 -200 H1280 V1200 H-200 Z M560 600 V1000 H1060 V600 Z" fill="url(#am-wall)" fillRule="evenodd" />
          <rect x="550" y="590" width="520" height="420" fill="none" stroke="#3A4A42" strokeWidth="22" />
          <rect x="550" y="590" width="520" height="420" fill="none" stroke={K} strokeWidth="6" />
          <path d="M810 590 V1010" stroke="#3A4A42" strokeWidth="14" />
          <path d="M570 610 L700 990 M620 610 L750 990" stroke="#FFFFFF" strokeWidth="8" opacity=".05" />
          {/* monitor con la doppia elica */}
          <rect x="40" y="640" width="380" height="270" rx="16" fill="url(#am-mon)" stroke={K} strokeWidth="8" />
          <rect x="60" y="660" width="340" height="200" rx="6" fill="#06140E" />
          {Array.from({ length: 16 }, (_, i) => {
            const y = 672 + i * 12, ph = i * 0.6 + t * 3 * (0.3 + dna);
            const a = 230 + Math.sin(ph) * 90, b = 230 - Math.sin(ph) * 90;
            return <g key={i}><path d={`M${a} ${y} H${b}`} stroke="#3A8A5A" strokeWidth="3" opacity={0.3 + 0.6 * dna} /><circle cx={a} cy={y} r="5" fill="#6AF0A0" opacity={0.3 + 0.7 * dna} /><circle cx={b} cy={y} r="5" fill="#F2C14E" opacity={0.3 + 0.7 * dna} /></g>;
          })}
          <text x="80" y="890" fontFamily={SANS} fontWeight={800} fontSize="22" fill="#6AF0A0" opacity={0.4 + 0.6 * dna}>DNA · {dna > 0.9 ? '100%' : `${Math.floor(dna * 100)}%`}</text>
          <Glow id="am-mon" x={230} y={760} r={260} t={t} color="#6AF0A0" amp={0.05} rate={3} opacity={0.15 + 0.3 * dna} />
          <path d="M150 910 V950 M310 910 V950 M120 950 H340" stroke={K} strokeWidth="10" />
        </g>

        {/* PIANO 2 — il banco di lavoro e il microscopio (0,75) */}
        <g transform={L(0.75)}>
          <path d="M-200 1130 H1280 V2200 H-200 Z" fill="url(#am-bench)" />
          <path d="M-200 1132 H1280" stroke="#7A9A8A" strokeWidth="5" opacity=".7" />
          <g transform="translate(880 1130)">
            <Ombra id="am" x={0} y={0} rx={150} ry={18} />
            <path d="M-90 0 H90 V-30 H-90 Z" fill="url(#am-steel)" stroke={K} strokeWidth="7" />
            <path d="M40 -30 V-200 Q40 -250 0 -270" stroke={K} strokeWidth="26" fill="none" strokeLinecap="round" />
            <path d="M40 -30 V-200 Q40 -250 0 -270" stroke="#C8D0CC" strokeWidth="14" fill="none" strokeLinecap="round" />
            <rect x="-60" y="-110" width="120" height="16" fill="url(#am-steel)" stroke={K} strokeWidth="5" />
            <g transform="rotate(-25 0 -270)"><rect x="-22" y="-370" width="44" height="130" rx="8" fill="#E8ECEA" stroke={K} strokeWidth="7" /><rect x="-28" y="-390" width="56" height="30" rx="6" fill="#2E3A34" stroke={K} strokeWidth="5" /></g>
            <rect x="-14" y="-180" width="28" height="70" fill="#2E3A34" stroke={K} strokeWidth="5" />
            <circle cx="50" cy="-150" r="20" fill="#3A4A42" stroke={K} strokeWidth="5" />
          </g>
        </g>

        {/* PIANO 3 — la goccia d'ambra sul piedistallo di vetro, illuminata da sotto (0,85) */}
        <g transform={L(0.85)}>
          <path d="M440 1240 L470 1110 H610 L640 1240 Z" fill="url(#am-glass)" stroke={K} strokeWidth="7" />
          <rect x="420" y="1230" width="240" height="30" rx="6" fill="url(#am-steel)" stroke={K} strokeWidth="6" />
          <rect x="460" y="1096" width="160" height="20" rx="4" fill="#E8F8FF" opacity={0.3 + 0.7 * lamp} stroke={K} strokeWidth="4" />
          <path d="M470 1110 L380 700 H700 L610 1110 Z" fill="#FFD27A" opacity={0.12 * lamp} />
          <Glow id="am-amberglow" x={540} y={930} r={380} t={t} color="#FFB040" amp={0.06} rate={2} opacity={0.25 + 0.5 * lamp} />
          <Amber id="am" x={540} y={950} s={1.55} accent={P.accento} />
          <Glow id="am-core" x={540} y={950} r={120} t={t} color="#FFF0C0" amp={0.1} rate={3} opacity={0.4 * lamp} />
        </g>

        {/* PIANO 4 — provette e quaderno di appunti in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <g transform="translate(-20 1640)">
            <rect x="-120" y="-40" width="420" height="60" rx="8" fill="url(#am-wood)" stroke={K} strokeWidth="9" />
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <rect x={-90 + i * 80} y="-260" width="44" height="260" rx="22" fill="#D8F0E8" opacity=".55" stroke={K} strokeWidth="7" />
                <rect x={-86 + i * 80} y={-120 + (i % 3) * 30} width="36" height={110 - (i % 3) * 30} rx="16" fill={['#F2C14E', '#C2301E', '#6AF0A0', '#F2C14E', '#4AA0E0'][i]} opacity=".85" />
                <path d={`M${-80 + i * 80} -240 V-80`} stroke="#FFFFFF" strokeWidth="5" opacity=".6" />
              </g>
            ))}
          </g>
          <g transform="translate(860 1680) rotate(-8)">
            <rect x="-220" y="-150" width="440" height="300" rx="10" fill="#F2EBD8" stroke={K} strokeWidth="9" />
            <path d="M0 -150 V150" stroke="#C8BEA4" strokeWidth="6" />
            {[-100, -60, -20, 20, 60].map((y) => <path key={y} d={`M-190 ${y} H-30 M30 ${y} H190`} stroke="#B8AE94" strokeWidth="4" />)}
            <path d="M40 -120 q40 -30 80 0 q-20 40 -80 0 Z M60 -100 v40" stroke="#5A4A3A" strokeWidth="4" fill="none" />
          </g>
        </g>

        {/* PIANO 5 — pulviscolo nel fascio sopra l'ambra, particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 720, x0: 400, x1: 680 }} bottom={{ y: 1100, x0: 460, x1: 620 }} seed={6} n={24} color="#FFE0A0" boost={lamp} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="am-near" t={t} color="#FFE0A0" n={6} opacity={0.08} />
        </g>
      </g>
      <Finish id="am" tint="#0F1F17" tintOpacity={0.14} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): isola cue0 → cue1 · brachiosauro cue1 · DNA cue2 → + 1,2 · luce sotto l'ambra cue3 − 0,3.
