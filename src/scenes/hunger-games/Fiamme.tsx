import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { Confetti, Embers, Glow, NearMotes, flamePath } from '../../lib/elements';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import type { SceneProps } from '../../types';
import { EMBER, HGDefs, K } from './Comuni';

// La ragazza in fiamme: la sfilata dei carri sul grande viale di Capitol City, di sera. Il carro nero del Distretto 12
// tirato da due cavalli neri, con due mantelli neri appoggiati sul parapetto; ai lati le tribune piene di luci, i
// palazzi colorati, coriandoli. Eventi: 1ª frase le tribune si riempiono di flash (il pubblico da conquistare);
// 2ª frase i mantelli prendono fuoco (le fiamme finte dello stilista Cinna) e il carro si illumina d'arancione;
// 3ª frase sul maxischermo, che riprende le fiamme, compare un grande cuore (la dichiarazione d'amore in TV).
// Piani: cielo e palazzi (0,25) · tribune e maxischermo (0,45) · viale, cavalli e carro (0,7)
//        · lampioni e bandiere che incorniciano (1,2) · coriandoli e scintille vicine (1,6)

const r = rng(4040);
const BUILD = Array.from({ length: 10 }, (_, i) => ({ x: -140 + i * 150, w: 110 + r() * 50, h: 170 + r() * 170, c: ['#E86A9A', '#6AC8E8', '#E8C060', '#9A7AE8', '#7AE8B0'][i % 5] }));
const FLASH = Array.from({ length: 36 }, () => ({ x: r() * 1300 - 110, y: 900 + r() * 170, ph: r() * 10, sp: 1 + r() * 2 }));

/** Cavallo nero di profilo verso sinistra, al trotto, con il pennacchio. Origine al suolo sotto il centro del corpo. */
const Cavallo: React.FC<{ x: number; y: number; t: number; s?: number; ph?: number; tone?: string }> = ({ x, y, t, s = 1, ph = 0, tone = '#1C1C22' }) => {
  const g = t * 8 + ph;
  const bob = -Math.abs(Math.sin(g)) * 8;
  // zampa: anca → ginocchio → zoccolo; al trotto le diagonali vanno insieme
  const leg = (hx: number, a: number, front: boolean) => {
    const sw = Math.sin(g + a);
    const lift = Math.max(0, sw) * 34;
    const kx = hx + (front ? -14 : 10) + sw * 18, ky = -64 - lift * 0.5;
    const fx = hx + sw * 26 + (front ? -6 : 0), fy = -lift * 0.35;
    return { d: `M${hx} -128 L${kx} ${ky} L${fx} ${fy}`, fx, fy };
  };
  const legs = [leg(-196, 0, true), leg(-164, Math.PI, true), leg(36, Math.PI, false), leg(66, 0, false)];
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(0 ${bob})`} strokeLinejoin="round" strokeLinecap="round">
      {legs.map((l, i) => (
        <g key={i} opacity={i % 2 ? 0.85 : 1}>
          <path d={l.d} stroke={K} strokeWidth="27" fill="none" />
          <path d={l.d} stroke={tone} strokeWidth="17" fill="none" />
          <path d={`M${l.fx - 13} ${l.fy - 6} h26 l3 10 h-32 Z`} fill="#C8A050" stroke={K} strokeWidth="4" />
        </g>
      ))}
      {/* coda */}
      <path d={`M88 -190 Q${126 + Math.sin(g) * 6} -160 ${112 + Math.sin(g * 0.7) * 10} -78`} stroke={K} strokeWidth="26" fill="none" />
      <path d={`M88 -190 Q${126 + Math.sin(g) * 6} -160 ${112 + Math.sin(g * 0.7) * 10} -78`} stroke="#08080A" strokeWidth="16" fill="none" />
      {/* corpo, collo e testa */}
      <path d="M-200 -120 C-232 -150 -250 -190 -246 -232 L-268 -300 Q-284 -336 -300 -350 L-352 -322 Q-374 -312 -370 -332 L-332 -386 Q-318 -402 -300 -398 L-292 -424 L-280 -396 Q-248 -370 -220 -300 Q-190 -240 -140 -228 Q-40 -222 30 -230 Q82 -234 92 -190 Q98 -150 70 -120 Q40 -100 0 -110 Q-100 -96 -200 -120 Z" fill={tone} stroke={K} strokeWidth="9" />
      {/* criniera intrecciata */}
      {Array.from({ length: 6 }, (_, k) => <circle key={k} cx={-282 + k * 12} cy={-384 + k * 26} r="11" fill="#060608" stroke={K} strokeWidth="4" />)}
      {/* riflessi lucidi */}
      <path d="M-150 -218 Q-40 -214 40 -220" stroke="#8A8AA0" strokeWidth="6" fill="none" opacity=".55" />
      <path d="M-236 -240 Q-250 -280 -262 -300" stroke="#8A8AA0" strokeWidth="5" fill="none" opacity=".5" />
      <path d="M-330 -378 L-356 -334" stroke="#8A8AA0" strokeWidth="4" fill="none" opacity=".5" />
      {/* occhio e narice */}
      <circle cx="-318" cy="-368" r="6" fill="#E8E0D0" />
      <circle cx="-356" cy="-326" r="4" fill="#000" />
      {/* finimenti dorati */}
      <path d="M-364 -322 L-318 -352 L-300 -396 M-318 -352 L-290 -346 M-246 -232 Q-200 -200 -150 -224 M-150 -226 V-120" stroke="#C8A050" strokeWidth="7" fill="none" />
      {/* pennacchio nero sulla testa, con il fermaglio dorato */}
      <circle cx="-300" cy="-404" r="9" fill="#E8C060" stroke={K} strokeWidth="4" />
      <path d={`M-300 -410 Q${-290 + Math.sin(g * 0.6) * 6} -452 ${-266 + Math.sin(g * 0.6) * 10} -470 Q-276 -436 -294 -406 Z`} fill="#060608" stroke={K} strokeWidth="5" />
    </g>
  );
};

export const Fiamme: React.FC<SceneProps> = ({ t, dur, cues, griglia }) => {
  const cam = camera(t, dur, 540, 1050);
  const L = cam.layer;
  const crowd = eo(seg(t, griglia(cues[0] + 0.6), griglia(cues[0] + 0.6) + 1));
  const tf = griglia(cues[1] + 1.4);
  const fire = eob(seg(t, tf, tf + 0.6), 1.3);
  const th = griglia(cues[2] + 1.0);
  const heart = eob(seg(t, th, th + 0.5), 1.8);
  const beat = 1 + 0.06 * Math.max(0, Math.sin(t * 7)) * heart;
  const roll = t * 160; // il viale scorre: il carro avanza verso sinistra

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fi" />
        <HGDefs id="fi" />
        <Lin id="fi-sky" stops={[[0, '#120A24'], [0.35, '#3A1A4A'], [0.55, '#8A3A5A'], [0.62, '#C86A5A']]} />
        <Lin id="fi-road" stops={[[0, '#4A3A40'], [0.5, '#2A2026'], [1, '#0E0A0C']]} />
        <Lin id="fi-stand" stops={[[0, '#3A2A3A'], [1, '#1A1218']]} />
        <Lin id="fi-cart" x2={1} y2={0} stops={[[0, '#2A2A30'], [0.4, '#141418'], [1, '#050506']]} />
        <Lin id="fi-cape" stops={[[0, '#1A1A20'], [1, '#050508']]} />
        <Lin id="fi-pole" x2={1} y2={0} stops={[[0, '#E8C060'], [0.5, '#A87A2A'], [1, '#5A3A10']]} />
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo serale e palazzi colorati di Capitol City (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#fi-sky)" />
          {BUILD.map((b, i) => (
            <g key={i}>
              <path d={`M${b.x} 1000 V${1000 - b.h} Q${b.x + b.w / 2} ${1000 - b.h - 60} ${b.x + b.w} ${1000 - b.h} V1000 Z`} fill={b.c} opacity=".45" />
              {Array.from({ length: Math.floor(b.h / 50) }, (_, k) => (
                <rect key={k} x={b.x + 16} y={1000 - b.h + 30 + k * 50} width={b.w - 32} height="10" rx="5" fill="#FFF4E0" opacity={0.25 + 0.35 * Math.abs(Math.sin(t + k + i))} />
              ))}
            </g>
          ))}
        </g>

        {/* PIANO 1 — tribune piene di luci e flash, maxischermo (0,45) */}
        <g transform={L(0.45)}>
          <path d="M-200 900 L1280 880 V1080 H-200 Z" fill="url(#fi-stand)" stroke={K} strokeWidth="6" />
          {[930, 970, 1010, 1050].map((sy, k) => <path key={k} d={`M-200 ${sy} L1280 ${sy - 14}`} stroke="#5A3A5A" strokeWidth="4" />)}
          {FLASH.map((f, i) => {
            const on = Math.max(0, Math.sin(t * f.sp * 3 + f.ph)) ** 12;
            return <g key={i}>
              <circle cx={f.x} cy={f.y} r={3} fill="#E8D8F0" opacity=".5" />
              <circle cx={f.x} cy={f.y} r={10 + 14 * on} fill="#FFFFFF" opacity={crowd * on * 0.9} />
            </g>;
          })}
          {/* maxischermo */}
          <rect x="640" y="640" width="330" height="220" rx="10" fill="#0C0A10" stroke={K} strokeWidth="10" />
          <rect x="654" y="654" width="302" height="192" fill="#2A1020" />
          <Glow id="fi-scg" x={805} y={750} r={260} t={t} color="#FF9A50" amp={0.06} rate={6} opacity={0.15 + 0.4 * fire} />
          <g opacity={fire * (1 - heart)}>
            {[-60, 0, 60].map((dx, k) => <path key={k} d={flamePath(805 + dx, 840, 26, 120, t, k * 1.3)} fill={EMBER} />)}
            {[-60, 0, 60].map((dx, k) => <path key={`c${k}`} d={flamePath(805 + dx, 840, 12, 70, t, k * 1.3 + 0.5)} fill="#FFD86B" />)}
          </g>
          <g opacity={heart} transform={`translate(805 750) scale(${heart * beat}) translate(-805 -750)`}>
            <path d="M805 820 C730 770 720 710 760 690 C785 678 800 694 805 708 C810 694 825 678 850 690 C890 710 880 770 805 820 Z" fill="#E84A5A" stroke={K} strokeWidth="6" />
            <path d="M762 708 Q770 696 784 698" stroke="#FFFFFF" strokeWidth="6" fill="none" strokeLinecap="round" />
          </g>
          <path d="M700 860 V1000 M910 860 V1000" stroke="#2A2026" strokeWidth="14" />
        </g>

        {/* PIANO 2 — il viale, i cavalli e il carro (0,7) */}
        <g transform={L(0.7)}>
          <path d="M-200 1080 H1280 V2200 H-200 Z" fill="url(#fi-road)" />
          {/* lastre del viale che scorrono */}
          {Array.from({ length: 10 }, (_, k) => {
            const x = mod(k * 180 + roll, 1800) - 360;
            return <path key={k} d={`M${x} 1090 L${x - 140} 1420`} stroke="#5A4048" strokeWidth="4" opacity=".6" />;
          })}
          <path d="M-200 1110 H1280 M-200 1300 H1280" stroke="#C8A050" strokeWidth="5" opacity=".5" />
          {/* riflesso arancione sul selciato */}
          <ellipse cx="700" cy="1290" rx={260 + 120 * fire} ry="40" fill="#FF9A50" opacity={0.35 * fire} />
          {/* cavalli */}
          <Cavallo x={500} y={1236} t={t} s={0.7} ph={1.6} tone="#2A2A34" />
          <Cavallo x={470} y={1262} t={t} s={0.74} ph={0} />
          {/* timone che unisce i cavalli al carro */}
          <path d="M360 1150 Q500 1172 640 1214" stroke={K} strokeWidth="16" fill="none" />
          <path d="M360 1150 Q500 1172 640 1214" stroke="#C8A050" strokeWidth="8" fill="none" />
          {/* il carro, di profilo verso sinistra */}
          <g transform="translate(770 1280) scale(0.86)">
            <ellipse cx="20" cy="2" rx="200" ry="20" fill="#000" opacity=".4" />
            {/* ruota dietro */}
            <circle cx="70" cy="-90" r="90" fill="none" stroke="#141418" strokeWidth="14" />
            {/* cassa: parapetto curvo alto davanti, più basso dietro */}
            <path d="M-150 -60 Q-200 -230 -120 -290 Q-100 -300 -80 -280 L150 -220 Q170 -214 170 -190 L160 -60 Z" fill="url(#fi-cart)" stroke={K} strokeWidth="10" />
            <path d="M-136 -80 Q-176 -220 -112 -274" stroke="#C8A050" strokeWidth="8" fill="none" />
            <path d="M-80 -280 L150 -220" stroke="#E8C060" strokeWidth="8" />
            <path d="M-60 -110 Q-40 -170 0 -150 Q12 -196 50 -166 Q80 -200 104 -146 Q134 -156 150 -104" stroke="#C8A050" strokeWidth="6" fill="none" />
            {/* due mantelli neri drappeggiati sul parapetto, con le pieghe */}
            {[[-76, 20], [36, 128]].map(([x0, x1], k) => {
              const y0 = -276 + (x0 + 80) * 0.26, y1 = -276 + (x1 + 80) * 0.26;
              const w = Math.sin(t * 2.2 + k) * 4;
              return (
                <g key={k}>
                  <path d={`M${x0} ${y0} L${x1} ${y1} Q${x1 + 8} ${y1 + 80} ${x1 - 4 + w} ${y1 + 140} Q${(x0 + x1) / 2} ${y1 + 120 + w} ${x0 + 4 - w} ${y0 + 150} Q${x0 - 10} ${y0 + 80} ${x0} ${y0} Z`} fill="url(#fi-cape)" stroke={K} strokeWidth="7" />
                  {[0.3, 0.55, 0.8].map((u) => <path key={u} d={`M${lerp(x0, x1, u)} ${lerp(y0, y1, u) + 8} Q${lerp(x0, x1, u) - 6} ${lerp(y0, y1, u) + 70} ${lerp(x0, x1, u) + w} ${lerp(y0, y1, u) + 128}`} stroke="#3A3A48" strokeWidth="5" fill="none" />)}
                  {/* fodera arancione che si vede all'orlo quando prendono fuoco */}
                  <path d={`M${x1 - 4 + w} ${y1 + 140} Q${(x0 + x1) / 2} ${y1 + 120 + w} ${x0 + 4 - w} ${y0 + 150}`} stroke={EMBER} strokeWidth="7" fill="none" opacity={fire} />
                </g>
              );
            })}
            {/* fiamme lungo le spalle dei mantelli */}
            <g opacity={fire}>
              <Glow id="fi-fg" x={30} y={-300} r={300} t={t} color="#FFB060" amp={0.12} rate={7} opacity={0.75} />
              {Array.from({ length: 9 }, (_, k) => {
                const fx = -70 + k * 24, fy = -276 + (fx + 80) * 0.26;
                return <path key={k} d={flamePath(fx, fy + 4, 16 + (k % 2) * 5, (60 + (k % 3) * 26) * fire, t, k * 1.1)} fill={k % 2 ? '#E8501E' : EMBER} stroke={K} strokeWidth="3.5" />;
              })}
              {Array.from({ length: 9 }, (_, k) => {
                const fx = -70 + k * 24, fy = -276 + (fx + 80) * 0.26;
                return <path key={`m${k}`} d={flamePath(fx, fy + 4, 8, (36 + (k % 3) * 14) * fire, t, k * 1.1 + 0.6)} fill="#FFD86B" />;
              })}
            </g>
            {/* ruota davanti con i raggi che girano */}
            <circle cx="-40" cy="-90" r="96" fill="none" stroke={K} strokeWidth="20" />
            <circle cx="-40" cy="-90" r="96" fill="none" stroke="#C8A050" strokeWidth="9" />
            {Array.from({ length: 10 }, (_, k) => {
              const a = (k / 10) * Math.PI * 2 - t * 4;
              return <path key={k} d={`M-40 -90 l${Math.cos(a) * 92} ${Math.sin(a) * 92}`} stroke="#C8A050" strokeWidth="6" />;
            })}
            <circle cx="-40" cy="-90" r="18" fill="#E8C060" stroke={K} strokeWidth="5" />
            <path d="M-40 -90 l-60 -10" stroke="#E8C060" strokeWidth="4" opacity=".6" />
          </g>
          <Embers t={t} x={750} y={1000} w={260} h={420} n={Math.round(24 * fire)} seed={13} drift={160} />
        </g>

        {/* PIANO 3 — lampioni dorati e stendardi ai lati (1,2) */}
        <g transform={L(1.2)}>
          {[40, 1040].map((px, i) => (
            <g key={i}>
              <rect x={px - 18} y={760} width="36" height="1300" fill="url(#fi-pole)" stroke={K} strokeWidth="8" />
              <path d={`M${px - 50} 760 h100 l-20 -60 h-60 Z`} fill="#E8C060" stroke={K} strokeWidth="8" />
              <Glow id={`fi-l${i}`} x={px} y={730} r={160} t={t} color="#FFE0A0" amp={0.06} rate={4} ph={i} opacity={0.6} />
              <path d={`M${px + (i ? -18 : 18)} 820 h${i ? -120 : 120} v${220 + Math.sin(t * 2 + i) * 8} l${i ? 60 : -60} -40 l${i ? 60 : -60} 40 Z`} fill={i ? '#9A3AE8' : '#E83A8A'} stroke={K} strokeWidth="7" />
            </g>
          ))}
          <path d="M-200 1560 Q540 1530 1280 1560 V2200 H-200 Z" fill="#0E0A0C" />
          <path d="M-200 1560 Q540 1530 1280 1560" stroke="#C8A050" strokeWidth="6" fill="none" />
          {/* balaustra dorata delle tribune basse */}
          <path d="M-200 1600 H1280" stroke={K} strokeWidth="26" />
          <path d="M-200 1600 H1280" stroke="url(#fi-pole)" strokeWidth="14" />
          {Array.from({ length: 16 }, (_, k) => (
            <g key={k} transform={`translate(${-60 + k * 80} 1612)`}>
              <path d="M-14 0 Q-26 40 -10 70 Q-24 100 -14 150 H14 Q24 100 10 70 Q26 40 14 0 Z" fill="#B88A3A" stroke={K} strokeWidth="6" />
              <path d="M-6 10 Q-14 40 -4 66" stroke="#FFE8A0" strokeWidth="4" fill="none" opacity=".6" />
            </g>
          ))}
          <path d="M-200 1770 H1280" stroke={K} strokeWidth="24" />
          <path d="M-200 1770 H1280" stroke="#8A6420" strokeWidth="12" />
        </g>

        {/* PIANO 4 — coriandoli e particelle vicine (1,6) */}
        <g transform={L(1.6)}>
          <g opacity={0.5 + 0.5 * crowd}>
            <Confetti t={t} seed={9} n={34} colors={['#E83A8A', '#6AC8E8', '#E8C060', '#F4F1E8', '#9A3AE8']} y0={660} y1={1950} speed={0.12} />
          </g>
          <NearMotes id="fi-near" t={t} color="#FFC090" n={6} r0={60} r1={150} opacity={0.1} />
        </g>
      </g>
      <Finish id="fi" tint="#C89A3A" tintOpacity={0.08} />
    </svg>
  );
};

