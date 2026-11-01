import React from 'react';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { Dust, Fog, Glow, NearMotes, SunRays } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { Egg, Fern, JPDefs, JungleTree, K, Ombra } from './Comuni';

// Le uova schiuse: la mattina nella giungla, raggi di sole tra gli alberi e nebbia bassa. Al centro, grande, un nido tra
// le felci con i gusci delle uova schiuse (oggetto chiave); una pietra con una foglia larga dove arriva la rana.
// Eventi: prima frase il sole si posa sul nido; seconda frase piccole impronte escono dal nido una dopo l'altra (cue 1 +
// 0,35·k, i pizzicati dello spartito); terza frase nel raggio di sole compare un nastro di DNA con un pezzo mancante;
// quarta frase arriva la rana sulla foglia e il pezzo mancante si colora di verde (DNA di rana); quinta frase la rana
// salta (cue 4, il contrabbasso) e compaiono i simboli femmina → maschio; sesta frase resta tutto lì, il nido vuoto.
// Piani: luce e alberi lontani (0,2) · nebbia (0,4) · alberi vicini (0,55) · nido e impronte (0,75) · rana e foglia (0,9)
//        · felci in primo piano (1,25) · pulviscolo nei raggi (1,5–1,8)

const PRINTS = Array.from({ length: 7 }, (_, k) => ({ x: 640 + k * 62, y: 1180 + (k % 2) * 22 + k * 6, a: 70 + (k % 2) * 16 }));

export const Uova: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const glow = seg(t, cues[0] + 0.4, cues[0] + 1.4);
  const print = (k: number) => seg(t, cues[1] + k * 0.35, cues[1] + k * 0.35 + 0.3);
  const dna = eo(seg(t, cues[2], cues[2] + 0.8));
  const frog = eo(seg(t, cues[3], cues[3] + 0.8));
  const fill = eo(seg(t, cues[3] + 0.4, cues[3] + 1.2));
  const hop = seg(t, cues[4], cues[4] + 0.6);
  const sex = eob(seg(t, cues[4] + 0.4, cues[4] + 1.0));

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="uo" />
        <JPDefs id="uo" />
        <Lin id="uo-sky" stops={[[0, '#C8E0C8'], [0.5, '#E8F0D0'], [1, '#B8D0A8']]} />
        <Lin id="uo-ground" stops={[[0, '#6A5A3A'], [1, '#2A2014']]} />
        <Lin id="uo-nest" stops={[[0, '#A88A58'], [1, '#5A4428']]} />
        <Lin id="uo-stone" x2={1} y2={0} stops={[[0, '#9AA49A'], [0.5, '#7A847A'], [1, '#4A544A']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — luce del mattino e alberi lontani (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#uo-sky)" />
          <SunRays id="uo-rays" x={880} y={360} t={t} color="#FFF8D0" n={9} length={1400} width={60} opacity={0.3} />
          {Array.from({ length: 7 }, (_, i) => <rect key={i} x={-160 + i * 200} y="540" width={30 + (i % 3) * 12} height="700" fill="#7A9A78" opacity=".55" />)}
        </g>
        <g transform={L(0.4)}>
          <Fog id="uo-fog" t={t} y={1040} rx={900} ry={90} color="#F2F6E8" opacity={0.55} />
        </g>
        {/* PIANO 1 — alberi vicini ai lati (0,55) */}
        <g transform={L(0.55)}>
          <JungleTree x={-40} y={1140} h={520} t={t} ph={0} leaf="#3A7A50" trunk="url(#uo-trunk)" />
          <JungleTree x={1140} y={1140} h={560} t={t} ph={2} leaf="#2E6A44" trunk="url(#uo-trunk)" />
        </g>

        {/* PIANO 2 — il terreno, il nido con i gusci, le impronte (0,75) */}
        <g transform={L(0.75)}>
          <path d="M-200 1080 H1280 V2200 H-200 Z" fill="url(#uo-ground)" />
          <ellipse cx="420" cy="1160" rx="460" ry="60" fill="#FFF0B0" opacity={0.12 + 0.25 * glow} />
          <Ombra id="uo" x={420} y={1196} rx={300} ry={34} />
          {/* il nido: anello di rami e foglie secche */}
          <ellipse cx="420" cy="1160" rx="280" ry="70" fill="url(#uo-nest)" stroke={K} strokeWidth="8" />
          <ellipse cx="420" cy="1150" rx="210" ry="44" fill="#4A3820" />
          {Array.from({ length: 18 }, (_, i) => { const a = (i / 18) * Math.PI * 2; return <path key={i} d={`M${420 + Math.cos(a) * 230} ${1160 + Math.sin(a) * 56} l${Math.cos(a + 1) * 60} ${Math.sin(a + 1) * 14}`} stroke="#7A5A34" strokeWidth="8" strokeLinecap="round" />; })}
          {/* gusci schiusi */}
          {[[300, 1110, 1, -10], [420, 1100, 1.1, 6], [540, 1116, 0.95, 12], [360, 1150, 0.8, -20]].map(([x, y, sc, a], i) => (
            <g key={i} transform={`rotate(${a} ${x} ${y})`}><Egg x={x} y={y} s={sc} open={1} /></g>
          ))}
          <Glow id="uo-nestglow" x={420} y={1110} r={260} t={t} color="#FFF0B0" amp={0.05} rate={2} opacity={0.35 * glow} />
          {/* piccole impronte che si allontanano dal nido */}
          {PRINTS.map((p, k) => (
            <g key={k} transform={`translate(${p.x} ${p.y}) rotate(${p.a}) scale(1 0.6)`} opacity={print(k)}>
              {[-14, 0, 14].map((dx) => <path key={dx} d={`M0 0 L${dx} -26`} stroke="#2A1E10" strokeWidth="7" strokeLinecap="round" />)}
              <circle cx="0" cy="4" r="8" fill="#2A1E10" />
            </g>
          ))}
        </g>

        {/* PIANO 3 — il nastro di DNA nel raggio di sole, la pietra e la rana (0,9) */}
        <g transform={L(0.9)}>
          <g transform="translate(540 740)" opacity={dna}>
            {Array.from({ length: 13 }, (_, i) => {
              const x = -300 + i * 50, a = Math.sin(i * 0.8 + t * 1.2) * 50;
              const gap = i >= 5 && i <= 7;
              const c = gap ? (fill > 0.5 ? '#5AC85A' : '#F2EEE4') : '#F2C14E';
              return (
                <g key={i}>
                  <path d={`M${x} ${-a} V${a}`} stroke={c} strokeWidth="8" strokeDasharray={gap && fill < 0.5 ? '6 8' : undefined} opacity={gap ? 0.4 + 0.6 * Math.max(fill, 0.3) : 0.9} />
                  <circle cx={x} cy={-a} r="11" fill={gap ? c : '#E89A30'} stroke={K} strokeWidth="3" opacity={gap && fill < 0.5 ? 0.4 : 1} />
                  <circle cx={x} cy={a} r="11" fill={gap ? c : '#4AA0E0'} stroke={K} strokeWidth="3" opacity={gap && fill < 0.5 ? 0.4 : 1} />
                </g>
              );
            })}
            <Glow id="uo-dna" x={0} y={0} r={360} t={t} color="#FFF8D0" amp={0.05} rate={2} opacity={0.3} />
          </g>
          <path d="M760 1250 Q770 1110 880 1100 Q1000 1104 1010 1250 Z" fill="url(#uo-stone)" stroke={K} strokeWidth="8" />
          <path d="M700 1110 Q860 1040 1040 1110 Q860 1150 700 1110 Z" fill="#3E8A50" stroke={K} strokeWidth="6" />
          <path d="M720 1110 Q860 1090 1020 1110" stroke="#9AD8A0" strokeWidth="4" fill="none" />
          {/* la rana */}
          <g transform={`translate(${lerp(1200, 870, frog) + 120 * hop} ${1090 - Math.sin(hop * Math.PI) * 180})`} opacity={seg(frog, 0, 0.2) * (1 - seg(hop, 0.8, 1))}>
            <ellipse cx="0" cy="-26" rx="54" ry="34" fill="#5AC85A" stroke={K} strokeWidth="6" />
            <circle cx="-26" cy="-58" r="16" fill="#5AC85A" stroke={K} strokeWidth="5" />
            <circle cx="22" cy="-58" r="16" fill="#5AC85A" stroke={K} strokeWidth="5" />
            <circle cx="-24" cy="-60" r="7" fill={K} /><circle cx="24" cy="-60" r="7" fill={K} />
            <path d="M-30 -20 q30 16 60 0" stroke={K} strokeWidth="4" fill="none" />
            <path d="M-54 -6 q-26 10 -10 14 M54 -6 q26 10 10 14" stroke={K} strokeWidth="8" fill="none" />
            <ellipse cx="-10" cy="-38" rx="16" ry="8" fill="#9AF0A0" opacity=".6" />
          </g>
          {/* i simboli: femmina che diventa maschio */}
          <g transform={`translate(880 920) scale(${sex})`} opacity={seg(sex, 0, 0.2)}>
            <rect x="-150" y="-60" width="300" height="120" rx="18" fill="#FFF8E6" stroke={K} strokeWidth="6" />
            <text x="-80" y="28" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="76" fill="#E85A8A">♀</text>
            <text x="0" y="22" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="54" fill={K}>→</text>
            <text x="80" y="28" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="76" fill="#4A8AE0">♂</text>
          </g>
        </g>

        {/* PIANO 4 — felci in primo piano (1,25) */}
        <g transform={L(1.25)}>
          <Fern x={-60} y={2000} s={2.5} t={t} ph={0} color="#3A8A58" />
          <Fern x={1140} y={2000} s={2.4} t={t} ph={1} color="#2E7D4F" flip />
          <Fern x={520} y={2140} s={1.8} t={t} ph={2} color="#46985E" />
        </g>

        {/* PIANO 5 — pulviscolo nei raggi, particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 560, x0: 700, x1: 1000 }} bottom={{ y: 1150, x0: 240, x1: 700 }} seed={8} n={28} color="#FFF8D0" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="uo-near" t={t} color="#FFF8E0" n={6} opacity={0.08} />
        </g>
      </g>
      <Finish id="uo" tint="#1E4A30" tintOpacity={0.1} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): sole sul nido cue0 + 0,4 · impronte cue1 + 0,35·k · DNA cue2 · rana e pezzo verde cue3 · salto cue4 · ♀→♂ cue4 + 0,4.
