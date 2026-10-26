import React from 'react';
import { camera, eio, eo, lerp, rng, seg } from '../../lib/anim';
import { DISPLAY } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Dust, Fog, Glow, NearMotes } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { GOLD } from './Spazio';

// Il fantasma: cameretta con libreria; alcuni libri cadono da soli; dalla finestra aperta entra la tempesta di polvere,
// che si deposita sul pavimento in strisce regolari (un codice binario); un modellino di astronave pende dal soffitto.
// Nessuna persona.
// Eventi: libri che cadono uno alla volta (cue 1) · la polvere si posa in strisce (cue 2) · le strisce si illuminano
//         d'oro e diventano cifre: sono coordinate (cue 3).
// Piani: parete e finestra con la tempesta (0,25) · libreria e modellino (0,55) · pavimento con le strisce (0,75)
//        · letto e sedia in primo piano (1,2) · polvere che entra e particelle (1,5–1,8)

const K = '#16120C';
const r = rng(1010);
const BOOKS = Array.from({ length: 4 }, (_, row) => {
  const out: { x: number; w: number; h: number; c: string }[] = [];
  let x = 0;
  while (x < 300) {
    const w = 20 + r() * 22;
    if (x + w > 300) break;
    out.push({ x, w, h: 70 + r() * 40, c: ['#7A5A3E', '#4E5A6A', '#8A6A4A', '#5A4A3A', '#6E5E4E', '#3E4E5E'][Math.floor(r() * 6)] });
    x += w + 2;
  }
  return out;
});
// strisce del codice: spessa = 1, sottile = 0
const CODE = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1];
const FALL = [[1, 3, 0], [2, 5, 5 / 12], [0, 6, 5 / 6]] as const; // [riga, indice libro, ritardo]: a mezzo tempo (72 bpm), come nello spartito

export const Fantasma: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const stripes = (i: number) => eo(seg(t, cues[2] + i * 0.12, cues[2] + 0.6 + i * 0.12));
  const lit = seg(t, cues[3], cues[3] + 0.6);
  const storm = 0.6 + 0.4 * seg(t, cues[2] - 0.8, cues[2]);
  const curtain = Math.sin(t * 2.4) * 30 * storm + 40 * storm;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="fa" />
        <Lin id="fa-wall" stops={[[0, '#2E2A24'], [0.4, '#4A4238'], [0.75, '#5A5044'], [1, '#3A332A']]} />
        <Lin id="fa-storm" stops={[[0, '#6E5A3E'], [0.5, '#A8885A'], [1, '#8A6E48']]} />
        <Lin id="fa-wood" x2={1} y2={0} stops={[[0, '#4A3828'], [0.5, '#6E5438'], [1, '#3E2E20']]} />
        <Lin id="fa-floor" stops={[[0, '#5A4632'], [1, '#2A2018']]} />
        <Lin id="fa-bed" x2={1} y2={0} stops={[[0, '#5A6A7A'], [0.6, '#7A8A9A'], [1, '#4A5A6A']]} />
        <Lin id="fa-front" stops={[[0, '#2A2018'], [1, '#0E0A06']]} />
      </defs>

      <g transform={cam.transform}>
        {/* PIANO 0 — parete e finestra aperta sulla tempesta di polvere (0,25) */}
        <g transform={L(0.25)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill="url(#fa-wall)" />
          {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${-180 + i * 110} -200 V1100`} stroke="#2A2620" strokeWidth="3" opacity=".5" />)}
          <rect x="640" y="600" width="340" height="400" fill="url(#fa-storm)" />
          <clipPath id="fa-win"><rect x="640" y="600" width="340" height="400" /></clipPath>
          <g clipPath="url(#fa-win)">
            <Fog id="fa-s1" t={t} y={720} x={800} rx={300} ry={80} color="#C9A878" opacity={0.8} speed={1.2} drift={140} />
            <Fog id="fa-s2" t={t} y={880} x={760} rx={260} ry={70} color="#7A6040" opacity={0.8} speed={1.6} ph={2} drift={160} />
            <path d="M640 960 H980" stroke="#5A4630" strokeWidth="30" opacity=".6" />
          </g>
          <rect x="640" y="600" width="340" height="400" fill="none" stroke={K} strokeWidth="14" />
          <path d="M810 600 V1000" stroke={K} strokeWidth="9" />
          <Glow id="fa-wg" x={810} y={800} r={340} t={t} color="#E8C894" amp={0.06} rate={1.2} opacity={0.35} />
          {/* tende mosse dal vento */}
          <path d={`M630 580 C${640 - curtain * 0.3} 760 ${600 - curtain} 900 ${590 - curtain} 1040 L${640 - curtain * 0.6} 1040 C${660 - curtain * 0.4} 880 ${660} 740 690 580 Z`} fill="#C9B89A" stroke={K} strokeWidth="6" />
          <path d={`M990 580 C${980 + curtain * 0.2} 760 ${1010 + curtain * 0.6} 900 ${1020 + curtain * 0.7} 1040 L${980 + curtain * 0.3} 1040 C${960} 880 ${950} 740 940 580 Z`} fill="#C9B89A" stroke={K} strokeWidth="6" />
        </g>

        {/* PIANO 1 — libreria con i libri che cadono, modellino di astronave appeso (0,55) */}
        <g transform={L(0.55)}>
          <g transform="translate(70 560)">
            <rect x="-20" y="-20" width="380" height="560" fill="url(#fa-wood)" stroke={K} strokeWidth="9" />
            {BOOKS.map((row, ri) => (
              <g key={ri} transform={`translate(20 ${ri * 130})`}>
                <rect x="-20" y="118" width="340" height="14" fill="#2E2218" />
                {row.map((b, i) => {
                  const f = FALL.find(([rr, ii]) => rr === ri && ii === i);
                  if (f) {
                    const p = seg(t, cues[1] + f[2], cues[1] + f[2] + 0.55);
                    const tip = eio(seg(p, 0, 0.35));
                    const drop = seg(p, 0.35, 1);
                    if (drop > 0) return null; // da qui il libro cade nel piano del pavimento
                    return <rect key={i} x={b.x + tip * 30} y={118 - b.h} width={b.w} height={b.h} rx="3" fill={b.c} stroke={K} strokeWidth="4" transform={`rotate(${tip * 25} ${b.x + b.w / 2} ${118})`} />;
                  }
                  return <rect key={i} x={b.x} y={118 - b.h} width={b.w} height={b.h} rx="3" fill={b.c} stroke={K} strokeWidth="4" />;
                })}
              </g>
            ))}
          </g>
          {/* modellino di astronave appeso */}
          <g transform={`translate(520 ${600 + Math.sin(t * 1.1) * 6}) rotate(${Math.sin(t * 0.9) * 8 * storm})`}>
            <path d="M0 -110 V-40" stroke="#9A9284" strokeWidth="3" />
            <path d="M-30 0 L0 -40 L30 0 L20 30 H-20 Z" fill="#DCE4EA" stroke={K} strokeWidth="5" strokeLinejoin="round" />
            <path d="M-20 30 L-36 50 M20 30 L36 50" stroke={K} strokeWidth="5" />
            <rect x="-8" y="-14" width="16" height="12" fill="#3E6A8A" />
          </g>
        </g>

        {/* PIANO 2 — pavimento: la polvere si posa in strisce, che diventano un codice (0,75) */}
        <g transform={L(0.75)}>
          <path d="M-200 1100 H1280 V2200 H-200 Z" fill="url(#fa-floor)" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M-200 ${1120 + i * 40 + i * i * 6} H1280`} stroke="#1E160E" strokeWidth="4" opacity=".7" />)}
          {/* libri caduti: dalla mensola al pavimento */}
          {FALL.map(([ri, i, d]) => {
            const bk = BOOKS[ri][i];
            const p = seg(t, cues[1] + d, cues[1] + d + 0.55);
            const drop = seg(p, 0.35, 1);
            if (drop <= 0) return null;
            const x0 = 90 + bk.x + 30, y0 = 560 + ri * 130 + 118 - bk.h;
            const y = lerp(y0, 1190 - bk.w - ri * 14, drop * drop);
            return <rect key={`f${ri}${i}`} x={x0 + drop * (90 + ri * 40)} y={y} width={bk.w} height={bk.h} rx="3" fill={bk.c} stroke={K} strokeWidth="4" transform={`rotate(${25 + drop * 65} ${x0 + drop * (90 + ri * 40) + bk.w / 2} ${y + bk.h})`} />;
          })}
          <Glow id="fa-code" x={540} y={1180} r={420} t={t} color={GOLD} amp={0.08} rate={2} opacity={0.5 * lit} />
          {CODE.map((b, i) => {
            const p = stripes(i);
            const x = 140 + i * 66;
            return <path key={i} d={`M${x} 1130 L${x - 30} 1250`} stroke={lit > 0 ? (lit > 0.5 ? GOLD : '#C9A878') : '#C9A878'} strokeWidth={b ? 30 : 10} strokeLinecap="round" opacity={0.85 * p} />;
          })}
          {/* cifre che compaiono sopra le strisce */}
          {CODE.map((b, i) => (
            <text key={i} x={126 + i * 66} y={lerp(1110, 1090, lit)} textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="34" fill={GOLD} opacity={seg(t, cues[3] + i * 0.08, cues[3] + 0.3 + i * 0.08)}>{b}</text>
          ))}
        </g>

        {/* PIANO 3 — letto e sedia in primo piano (1,2) */}
        <g transform={L(1.2)}>
          <path d="M760 1980 V1480 Q760 1440 800 1440 H1280 V1980 Z" fill="url(#fa-bed)" stroke={K} strokeWidth="9" />
          <path d="M760 1520 Q980 1480 1280 1530" fill="none" stroke="#B8C8D8" strokeWidth="8" opacity=".6" />
          <rect x="730" y="1360" width="40" height="620" fill="url(#fa-wood)" stroke={K} strokeWidth="8" />
          <circle cx="750" cy="1350" r="26" fill="#6E5438" stroke={K} strokeWidth="7" />
          <path d="M-200 1980 V1500 H120 V1980" fill="none" stroke="url(#fa-front)" strokeWidth="40" />
          <path d="M-200 1500 H150" stroke="#3A2C20" strokeWidth="30" />
          <path d="M120 1500 V1980" stroke="#3A2C20" strokeWidth="26" />
        </g>

        {/* PIANO 4 — polvere che entra dalla finestra, particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Dust t={t * 1.8} top={{ y: 620, x0: 660, x1: 960 }} bottom={{ y: 1250, x0: 100, x1: 900 }} n={50} color="#E8D4A8" boost={0.2 * storm} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id="fa-near" t={t} color="#E8D4A8" n={8} vx={-70} vy={10} opacity={0.12} />
        </g>
      </g>

      <Finish id="fa" tint="#A8885A" tintOpacity={0.1} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): libri che cadono cue1, +0,35, +0,7 · strisce di polvere da cue2 (0,12 s l'una)
// · strisce d'oro e cifre da cue3.
