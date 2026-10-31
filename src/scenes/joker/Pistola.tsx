import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { Dust, Glow, NearMotes } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { HAND, SANS } from '../../lib/fonts';
import type { SceneProps } from '../../types';
import { JokerDefs, K, Ombra, Parrucca, Pistola as Rivoltella, Scarpa } from './Comuni';

// La pistola sbagliata: il corridoio colorato di un ospedale per bambini, visto di fronte: disegni dei bambini appesi,
// palloncini legati al termosifone, la porta del reparto con l'oblò, una fascia di cerchi colorati. A sinistra, appesa
// a un gancio, la borsa del clown con la parrucca che spunta; per terra l'ukulele e una scarpa da clown; a destra la
// cartellina con il foglio dello spettacolo.
// Eventi: prima frase un sacchetto di carta con la pistola scivola dentro la borsa (il regalo di Randall); seconda frase
// la pistola cade dalla borsa e tocca terra a cue 1 + 1,775 (metallo e timpano dello spartito), i palloncini sobbalzano;
// terza frase sul foglio dello spettacolo cala il timbro rosso «LICENZIATO» (cue 2 + 0,18, lo scatto dello spartito).
// Piani: parete e luci (0,3) · porta, disegni, palloncini (0,55) · pavimento, borsa, oggetti a terra (0,8)
//        · cartellina (0,9) · seggioline e cesta dei giochi in primo piano (1,2) · pulviscolo (1,5–1,8)

const r = rng(4);
const DRAW = [[130, 770, -4, 0], [310, 790, 3, 1], [770, 730, -3, 2], [930, 740, 4, 3]];
const BALLOONS = [[610, 760, '#E85A4A'], [660, 730, '#F2C230'], [710, 770, '#4AA0E0'], [650, 800, '#6AC86A']] as const;

export const Pistola: React.FC<SceneProps> = ({ t, dur, palette: P, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const gift = eo(seg(t, cues[0] + 0.5, cues[0] + 1.4)); // il sacchetto entra nella borsa
  const fallT = cues[1] + 1.2, hitT = cues[1] + 1.775;
  const fall = seg(t, fallT, hitT);
  const bounce = t > hitT ? Math.abs(Math.sin((t - hitT) * 14)) * 30 * Math.exp(-(t - hitT) * 6) : 0;
  const gy = lerp(880, 1190, fall * fall) - bounce;
  const grot = t < hitT ? lerp(-30, 365, fall) : 365 + 8 * Math.exp(-(t - hitT) * 5) * Math.sin((t - hitT) * 20); // si posa di piatto
  const shake = t > hitT ? Math.exp(-(t - hitT) * 3) * Math.sin((t - hitT) * 18) * 10 : 0;
  const stamp = seg(t, cues[2] + 0.04, cues[2] + 0.18);
  const stampUp = seg(t, cues[2] + 0.3, cues[2] + 0.6);
  const sway = Math.sin(t * 1.3) * 2;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="ps" />
        <JokerDefs id="ps" />
        <Lin id="ps-wall" stops={[[0, '#2A3A3A'], [0.35, '#4A6A66'], [0.7, '#9AB8A8'], [1, '#7A9A8A']]} />
        <Lin id="ps-low" stops={[[0, '#C8D8B8'], [1, '#9AB098']]} />
        <Lin id="ps-floor" stops={[[0, '#8A9A88'], [1, '#3A4A40']]} />
        <Lin id="ps-door" x2={1} y2={0} stops={[[0, '#D8C8A0'], [0.5, '#F2E6C8'], [1, '#B8A880']]} />
        <Lin id="ps-bag" x2={1} y2={0} stops={[[0, '#3A2A4A'], [0.5, '#5A4A7A'], [1, '#2A1E3A']]} />
        <Lin id="ps-paper" stops={[[0, '#C8A878'], [1, '#9A7A50']]} />
        <Lin id="ps-uke" x2={1} y2={0} stops={[[0, '#A86A30'], [0.5, '#D8944A'], [1, '#8A5424']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete alta e luci al neon del corridoio (0,3) */}
        <g transform={L(0.3)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ps-wall)" />
          {[860].map((x) => (
            <g key={x}>
              <rect x={x - 120} y="540" width="240" height="18" rx="6" fill="#F4F8E8" />
              <Glow id={`ps-n${x}`} x={x} y={560} r={360} t={t} color="#F4F8E8" amp={0.02} rate={2} opacity={0.4} />
            </g>
          ))}
        </g>

        {/* PIANO 1 — fascia colorata, disegni dei bambini, porta del reparto, palloncini (0,55) */}
        <g transform={L(0.55)}>
          <path d="M-200 900 H1280 V1180 H-200 Z" fill="url(#ps-low)" />
          <path d="M-200 900 H1280" stroke={K} strokeWidth="6" />
          {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={-180 + i * 100} cy={940} r="26" fill={['#E85A4A', '#F2C230', '#4AA0E0', '#6AC86A'][i % 4]} stroke={K} strokeWidth="4" />)}
          {/* disegni dei bambini appesi con lo scotch */}
          {DRAW.map(([x, y, a, k]) => (
            <g key={x} transform={`rotate(${a + Math.sin(t * 1.1 + x) * 0.6} ${x} ${y - 70})`}>
              <rect x={x - 70} y={y - 80} width="140" height="160" fill="#FFFDF2" stroke={K} strokeWidth="5" />
              <rect x={x - 20} y={y - 92} width="40" height="16" fill="#E8E0B0" opacity=".85" />
              {k === 0 && <><circle cx={x + 30} cy={y - 40} r="20" fill="#F2C230" stroke="#E89A20" strokeWidth="4" /><path d={`M${x - 50} ${y + 50} L${x - 50} ${y} L${x - 15} ${y - 26} L${x + 20} ${y} V${y + 50} Z`} fill="#E85A4A" stroke={K} strokeWidth="3" /><path d={`M${x - 64} ${y + 56} H${x + 64}`} stroke="#6AC86A" strokeWidth="8" /></>}
              {k === 1 && <>{[0, 1, 2].map((f) => <g key={f}><path d={`M${x - 40 + f * 40} ${y + 60} V${y + 10}`} stroke="#3A8A3A" strokeWidth="5" /><circle cx={x - 40 + f * 40} cy={y} r="16" fill={['#E85A4A', '#F2C230', '#B86AD8'][f]} stroke={K} strokeWidth="3" /></g>)}<path d={`M${x - 60} ${y - 50} q30 -20 60 0 q30 20 60 0`} stroke="#4AA0E0" strokeWidth="6" fill="none" /></>}
              {k === 2 && <><path d={`M${x - 40} ${y + 40} q40 -100 80 0`} stroke="#E85A4A" strokeWidth="8" fill="none" /><path d={`M${x - 30} ${y + 40} q30 -76 60 0`} stroke="#F2C230" strokeWidth="8" fill="none" /><path d={`M${x - 20} ${y + 40} q20 -52 40 0`} stroke="#4AA0E0" strokeWidth="8" fill="none" /></>}
              {k === 3 && <><circle cx={x} cy={y - 30} r="26" fill="#F2C230" stroke="#E89A20" strokeWidth="4" />{Array.from({ length: 8 }, (_, q) => <path key={q} d={`M${x + Math.cos(q * 0.785) * 34} ${y - 30 + Math.sin(q * 0.785) * 34} l${Math.cos(q * 0.785) * 14} ${Math.sin(q * 0.785) * 14}`} stroke="#E89A20" strokeWidth="4" />)}<path d={`M${x - 60} ${y + 56} q30 -30 60 0 q30 -30 60 0`} stroke="#6AC86A" strokeWidth="8" fill="none" /></>}
            </g>
          ))}
          {/* porta del reparto con l'oblò */}
          <rect x="430" y="640" width="220" height="540" fill="url(#ps-door)" stroke={K} strokeWidth="9" />
          <path d="M540 640 V1180" stroke={K} strokeWidth="6" />
          {[485, 595].map((x) => <g key={x}><circle cx={x} cy="790" r="34" fill="#9AC8D8" stroke={K} strokeWidth="7" /><path d={`M${x - 20} 776 q10 -12 26 -10`} stroke="#FFFFFF" strokeWidth="5" fill="none" opacity=".6" /></g>)}
          {[480, 600].map((x) => <rect key={x} x={x - 12} y="880" width="24" height="70" rx="6" fill="url(#ps-steel)" stroke={K} strokeWidth="4" />)}
          <rect x="470" y="660" width="140" height="36" rx="6" fill="#4AA0E0" stroke={K} strokeWidth="4" />
          <text x="540" y="686" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="22" fill="#FFFFFF">PEDIATRIA</text>
          {/* termosifone con i palloncini legati */}
          <rect x="680" y="1000" width="200" height="120" rx="10" fill="#E8ECE8" stroke={K} strokeWidth="6" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${700 + i * 32} 1010 V1110`} stroke="#B8C0B8" strokeWidth="8" />)}
          {BALLOONS.map(([x, y, c], i) => {
            const bob = Math.sin(t * 1.6 + i) * 8 - shake * (i % 2 ? 1 : -1);
            return (
              <g key={i}>
                <path d={`M700 1010 Q${(x + 700) / 2 + 10} ${(y + 1010) / 2} ${x} ${y + bob + 50}`} stroke="#5A5A5A" strokeWidth="3" fill="none" />
                <ellipse cx={x} cy={y + bob} rx="40" ry="48" fill={c} stroke={K} strokeWidth="5" />
                <path d={`M${x - 18} ${y + bob - 22} q10 -12 22 -10`} stroke="#FFFFFF" strokeWidth="6" fill="none" opacity=".55" strokeLinecap="round" />
                <path d={`M${x - 6} ${y + bob + 48} l6 8 l6 -8 Z`} fill={c} stroke={K} strokeWidth="3" />
              </g>
            );
          })}
        </g>

        {/* PIANO 2 — pavimento, la borsa del clown appesa, ukulele, scarpa e la pistola che cade (0,8) */}
        <g transform={L(0.8)}>
          <path d="M-200 1170 H1280 V2200 H-200 Z" fill="url(#ps-floor)" />
          <path d="M-200 1172 H1280" stroke="#3A4A40" strokeWidth="8" />
          {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${-200 + i * 160} 1180 L${-400 + i * 200} 2200`} stroke="#5A6A58" strokeWidth="4" opacity=".6" />)}
          {[1240, 1330].map((y) => <path key={y} d={`M-200 ${y} H1280`} stroke="#5A6A58" strokeWidth="4" opacity=".6" />)}
          <ellipse cx="540" cy="1230" rx="300" ry="30" fill="#E8F0E0" opacity=".18" />
          {/* gancio e borsa del clown */}
          <rect x="150" y="760" width="70" height="20" rx="6" fill="url(#ps-steel)" stroke={K} strokeWidth="5" />
          <path d="M185 780 V820" stroke={K} strokeWidth="8" />
          <g transform={`rotate(${sway + shake * 0.4} 185 820)`}>
            <path d="M150 840 Q185 790 220 840" stroke="#2A1E3A" strokeWidth="14" fill="none" />
            <Parrucca x={185} y={862} s={0.5} rot={10} />
            <path d="M80 870 H290 Q310 870 306 900 L290 1040 Q286 1070 256 1070 H114 Q84 1070 80 1040 L64 900 Q60 870 80 870 Z" fill="url(#ps-bag)" stroke={K} strokeWidth="8" />
            <path d="M90 900 H280" stroke={K} strokeWidth="5" />
            <path d="M100 892 H270" stroke="#C8B8E8" strokeWidth="4" opacity=".5" />
            {[110, 150, 190, 230, 260].map((x) => <circle key={x} cx={x} cy={900} r="5" fill="#C9A24A" />)}
            <circle cx="185" cy="980" r="34" fill="#F2E6D0" stroke={K} strokeWidth="5" />
            <circle cx="185" cy="984" r="12" fill={P.accento} />
            <path d="M163 996 q22 16 44 0" stroke={P.accento} strokeWidth="5" fill="none" />
            {/* il sacchetto di carta che scivola nella borsa */}
            <g transform={`translate(${lerp(420, 230, gift)} ${lerp(760, 872, gift)}) rotate(${lerp(-20, 8, gift)})`} opacity={seg(t, cues[0] + 0.3, cues[0] + 0.6) * (1 - seg(t, fallT - 0.2, fallT))}>
              <path d="M-40 -60 H40 L46 40 H-46 Z" fill="url(#ps-paper)" stroke={K} strokeWidth="5" />
              <path d="M-40 -60 l8 -14 h64 l8 14" fill="#B89868" stroke={K} strokeWidth="4" />
              <path d="M-24 -40 h40 M-24 -22 h30" stroke="#7A5A30" strokeWidth="3" />
            </g>
          </g>
          {/* ukulele e scarpa per terra */}
          <g transform="translate(340 1200) rotate(-14)">
            <Ombra id="ps" x={0} y={14} rx={150} ry={16} />
            <ellipse cx="-60" cy="0" rx="62" ry="44" fill="url(#ps-uke)" stroke={K} strokeWidth="6" />
            <ellipse cx="10" cy="0" rx="48" ry="36" fill="url(#ps-uke)" stroke={K} strokeWidth="6" />
            <circle cx="-30" cy="0" r="14" fill="#3A2210" stroke={K} strokeWidth="4" />
            <rect x="40" y="-9" width="120" height="18" fill="#5A3A20" stroke={K} strokeWidth="5" />
            <rect x="156" y="-16" width="34" height="32" rx="6" fill="#5A3A20" stroke={K} strokeWidth="5" />
            {[-6, -2, 2, 6].map((y) => <path key={y} d={`M-80 ${y} H170`} stroke="#E8E0D0" strokeWidth="1.5" />)}
          </g>
          <Scarpa id="ps" x={920} y={1214} s={0.8} rot={6} />
          <Ombra id="ps" x={920} y={1218} rx={110} ry={14} />
          {/* la pistola che cade e rimbalza */}
          {t > fallT - 0.2 && (
            <g>
              <Ombra id="ps" x={700} y={1222} rx={100 * (0.4 + 0.6 * fall)} ry={12} opacity={fall} />
              <Rivoltella id="ps" x={lerp(230, 620, Math.min(1, fall * 1.3))} y={gy} s={1.1} rot={grot} />
            </g>
          )}
        </g>

        {/* PIANO 3 — la cartellina con il foglio dello spettacolo e il timbro (0,9) */}
        <g transform={L(0.9)}>
          <g transform="translate(900 880) rotate(3)">
            <path d="M0 -150 V-130" stroke={K} strokeWidth="5" />
            <rect x="-110" y="-130" width="220" height="290" rx="12" fill="url(#ps-wood)" stroke={K} strokeWidth="7" />
            <rect x="-90" y="-100" width="180" height="240" fill="#FFFDF2" stroke={K} strokeWidth="4" />
            <rect x="-40" y="-140" width="80" height="34" rx="8" fill="url(#ps-steel)" stroke={K} strokeWidth="5" />
            <text x="0" y="-62" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="22" fill="#2A2A2A">SPETTACOLO</text>
            <text x="0" y="-36" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="22" fill="#2A2A2A">CLOWN</text>
            <text x="0" y="0" textAnchor="middle" fontFamily={HAND} fontSize="30" fill="#2A4A8A">Arthur · ore 15</text>
            {[30, 56, 82, 108].map((y) => <path key={y} d={`M-70 ${y} H${70 - (y % 3) * 10}`} stroke="#8A8A8A" strokeWidth="4" />)}
            {/* il timbro */}
            <g transform={`translate(0 ${lerp(-260, 40, stamp) - 200 * stampUp})`} opacity={stamp * (1 - stampUp)}>
              <rect x="-40" y="-120" width="80" height="70" rx="10" fill="url(#ps-wood)" stroke={K} strokeWidth="6" />
              <rect x="-70" y="-50" width="140" height="44" rx="6" fill="#3A3A3A" stroke={K} strokeWidth="6" />
            </g>
            {t > cues[2] + 0.18 && (
              <g transform="translate(0 50) rotate(-16)" opacity={0.9}>
                <rect x="-104" y="-28" width="208" height="56" fill="none" stroke={P.accento} strokeWidth="7" />
                <text x="0" y="13" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="34" fill={P.accento}>LICENZIATO</text>
              </g>
            )}
          </g>
        </g>

        {/* PIANO 4 — seggioline colorate e cesta dei giochi in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <g transform="translate(-30 1640)">
            <path d="M-120 -200 H120 V-20 H-120 Z" fill="#E85A4A" stroke={K} strokeWidth="10" />
            <path d="M-140 -20 H140 V30 H-140 Z" fill="#C8443A" stroke={K} strokeWidth="9" />
            <path d="M-120 30 V600 M120 30 V600" stroke="#3A3A3A" strokeWidth="22" />
            <path d="M-110 -190 H110" stroke="#F4A098" strokeWidth="6" opacity=".6" />
          </g>
          <g transform="translate(1000 1650)">
            <path d="M-170 0 L-150 -220 H150 L170 0 V600 H-170 Z" fill="#4AA0E0" stroke={K} strokeWidth="10" />
            <path d="M-150 -220 H150" stroke="#AAD8F8" strokeWidth="6" />
            <text x="0" y="-100" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="46" fill="#FFFFFF" stroke={K} strokeWidth="2">GIOCHI</text>
            <circle cx="-80" cy="-250" r="44" fill="#F2C230" stroke={K} strokeWidth="7" />
            <path d="M-110 -250 q30 -20 60 0" stroke={K} strokeWidth="5" fill="none" />
            <rect x="30" y="-290" width="80" height="80" rx="8" fill="#6AC86A" stroke={K} strokeWidth="7" transform="rotate(12 70 -250)" />
            <text x="70" y="-236" textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="44" fill="#FFFFFF" transform="rotate(12 70 -250)">A</text>
          </g>
        </g>

        {/* PIANO 5 — pulviscolo nella luce, particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t} top={{ y: 560, x0: 80, x1: 1000 }} bottom={{ y: 1180, x0: 60, x1: 1020 }} seed={3} n={22} color="#F4F8E8" />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="ps-near" t={t} color="#F4F8E8" n={6} opacity={0.07} />
        </g>
      </g>
      <Finish id="ps" tint="#1E3A30" tintOpacity={0.12} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): sacchetto cue0 + 0,5 · la pistola cade cue1 + 1,2 e tocca terra cue1 + 1,775 · timbro cue2 + 0,18.
