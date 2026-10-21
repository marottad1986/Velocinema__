import React from 'react';
import { camera, eio, eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, NearMotes, Stars } from '../../lib/elements';
import type { SceneProps } from '../../types';
import { BlackHole, GOLD, Ring } from './Spazio';

// Dentro il buco nero: prima il buco nero enorme, l'astronave che si allontana verso l'ultimo pianeta e la navetta che si
// stacca e cade nel disco dorato; poi la «stanza fuori dal tempo»: un tunnel infinito di librerie attraversato da fili di
// luce, con al centro la libreria di Murph, da cui cade un libro. Nessuna persona.
// Eventi: la navetta si stacca (cue 1) · l'astronave si allontana verso un pianeta lontano (cue 2) · caduta e passaggio alla
//         stanza fuori dal tempo (cue 3) · un libro cade dalla libreria di Murph: il fantasma era lui (cue 4).
// Piani: stelle (0,15) · buco nero (0,35) · astronave e navetta (0,6) · tunnel di librerie (0,5–0,9) · fili di luce (1,2)
//        · particelle (1,5–1,8)

const K = '#0A0F18';
const r = rng(5);
const THREADS = Array.from({ length: 22 }, () => ({ a: r() * Math.PI * 2, w: 1 + r() * 3, sp: 0.2 + r() * 0.6, ph: r() }));
const SPINES = Array.from({ length: 10 }, () => ({ h: 0.55 + r() * 0.4, c: ['#7A5A3E', '#4E5A6A', '#8A6A4A', '#5A4A3A', '#3E4E5E'][Math.floor(r() * 5)] }));

/** Cornice di libreria (un anello del tunnel): rettangolo con mensole e dorsi dei libri. */
const ShelfFrame: React.FC<{ s: number; cx: number; cy: number; o: number }> = ({ s, cx, cy, o }) => {
  const w = 560 * s, h = 760 * s;
  return (
    <g opacity={o}>
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} fill="none" stroke="#3A2E24" strokeWidth={Math.max(2, 60 * s)} />
      {[0.25, 0.5, 0.75].map((k) => <path key={k} d={`M${cx - w / 2} ${cy - h / 2 + h * k} H${cx + w / 2}`} stroke="#5A4632" strokeWidth={Math.max(1, 10 * s)} />)}
      {SPINES.map((b, i) => (
        <rect key={i} x={cx - w / 2 + (i / SPINES.length) * w} y={cy - h / 2 - 30 * s} width={w / SPINES.length - 3 * s} height={26 * s * b.h} fill={b.c} opacity=".9" />
      ))}
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} fill="none" stroke={GOLD} strokeWidth={Math.max(1, 3 * s)} opacity=".5" />
    </g>
  );
};

export const BucoNero: React.FC<SceneProps> = ({ t, dur, cues }) => {
  const cam = camera(t, dur);
  const L = cam.layer;
  const detach = eio(seg(t, cues[1], cues[3]));
  const away = eio(seg(t, cues[2] - 0.3, cues[3] + 0.4));
  const cross = seg(t, cues[3] - 0.3, cues[3] + 0.6);
  const book = seg(t, cues[4] - 0.1, cues[4] + 0.6);
  const zoom = 1 + 0.25 * seg(t, cues[3], dur);
  const cx = 540, cy = 880;

  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="bn" />
        <Lin id="bn-space" stops={[[0, '#02030A'], [0.5, '#0A1020'], [1, '#03050C']]} />
        <radialGradient id="bn-tess">
          <stop offset="0" stopColor="#3A2E24" />
          <stop offset=".5" stopColor="#1A140E" />
          <stop offset="1" stopColor="#05060A" />
        </radialGradient>
        <Lin id="bn-wall" stops={[[0, '#6E5438'], [1, '#3A2C1E']]} />
      </defs>

      <g transform={cam.transform}>
        {/* ---------- PARTE 1: il buco nero ---------- */}
        <g opacity={1 - cross}>
          <g transform={L(0.15)}>
            <rect x="-200" y="-200" width="1480" height="2320" fill="url(#bn-space)" />
            <Stars t={t} seed={22} n={80} y={-100} h={2000} color="#DCE8F2" size={0.8} />
          </g>
          <g transform={L(0.35)}>
            <BlackHole id="bn-bh" x={cx} y={cy + 40} r={lerp(130, 170, detach)} t={t} tilt={-6} />
          </g>
          <g transform={L(0.6)}>
            {/* l'astronave si allontana verso il pianeta lontano */}
            <circle cx="930" cy="560" r={8 + 6 * away} fill="#9AB4C4" stroke="#DCE8F2" strokeWidth="2" opacity={away} />
            <Glow id="bn-pl" x={930} y={560} r={60} t={t} color="#9AB4C4" amp={0.1} rate={2} opacity={0.5 * away} />
            <Ring x={lerp(250, 900, away)} y={lerp(1180, 600, away)} r={lerp(110, 20, away)} t={t} spin={0.3} tiltY={0.4} outline={K} lit="#DCE4EA" />
            {/* la navetta si stacca e cade nel disco */}
            <g transform={`translate(${lerp(300, cx, detach)} ${lerp(1150, cy + 40, detach)}) scale(${lerp(0.5, 0.05, detach)}) rotate(${detach * 220})`}>
              <path d="M-110 16 L-80 -26 H60 L118 8 L108 26 H-100 Z" fill="#EEF2F4" stroke={K} strokeWidth="8" strokeLinejoin="round" />
              <Glow id="bn-eng" x={-120} y={10} r={70} t={t} color="#8EB8D8" amp={0.3} rate={15} opacity={0.9} />
            </g>
          </g>
        </g>

        {/* ---------- PARTE 2: la stanza fuori dal tempo ---------- */}
        {cross > 0 && (
          <g opacity={cross} transform={`translate(${cx} ${cy}) scale(${zoom}) translate(${-cx} ${-cy})`}>
            <rect x="-200" y="-200" width="1480" height="2320" fill="url(#bn-tess)" />
            {/* tunnel di librerie che si ripete all'infinito */}
            {Array.from({ length: 7 }, (_, i) => {
              const k = mod(i / 7 - t * 0.04, 1);
              const s = 0.12 + k * k * 2.6;
              return <ShelfFrame key={i} s={s} cx={cx} cy={cy} o={Math.min(1, k * 3) * (1 - seg(k, 0.85, 1))} />;
            })}
            {/* fili di luce che attraversano lo spazio */}
            {THREADS.map((th, i) => {
              const len = 900;
              const p = mod(t * th.sp + th.ph, 1);
              return <path key={i} d={`M${cx} ${cy} L${cx + Math.cos(th.a) * len} ${cy + Math.sin(th.a) * len}`} stroke={GOLD} strokeWidth={th.w} opacity={0.15 + 0.35 * Math.sin(p * Math.PI)} />;
            })}
            {/* al centro: la libreria di Murph, da cui cade un libro */}
            <g transform={`translate(${cx} ${cy})`}>
              <Glow id="bn-room" x={0} y={0} r={240} t={t} color="#F3DDA8" amp={0.08} rate={2} opacity={0.6} />
              <rect x="-140" y="-180" width="280" height="360" fill="url(#bn-wall)" stroke={K} strokeWidth="8" />
              {[0, 1, 2].map((row) => (
                <g key={row}>
                  <path d={`M-130 ${-80 + row * 110} H130`} stroke={K} strokeWidth="8" />
                  {Array.from({ length: 9 }, (_, i) => {
                    const falling = row === 1 && i === 4;
                    const h = 60 + ((i * 37 + row * 11) % 30);
                    const x = -120 + i * 27;
                    const y = -80 + row * 110 - h;
                    if (falling && book > 0) {
                      return <rect key={i} x={x + book * 60} y={y + book * book * 260} width="22" height={h} rx="3" fill={GOLD} stroke={K} strokeWidth="4" transform={`rotate(${book * 120} ${x + 11 + book * 60} ${y + h + book * book * 260})`} />;
                    }
                    return <rect key={i} x={x} y={y} width="22" height={h} rx="3" fill={falling ? GOLD : SPINES[i].c} stroke={K} strokeWidth="4" />;
                  })}
                </g>
              ))}
            </g>
          </g>
        )}

        {/* PIANO 5 — particelle vicine (1,8) */}
        <g transform={L(1.8)}>
          <NearMotes id="bn-near" t={t} color={cross > 0.5 ? '#F3DDA8' : '#DCE8F2'} n={7} vx={-20} vy={-10} opacity={0.08} />
        </g>
      </g>

      <Finish id="bn" tint="#3E6A8A" tintOpacity={0.08} />
    </svg>
  );
};
// Tempi evento (s nel capitolo): navetta che si stacca cue1 → cue3 · astronave verso il pianeta cue2 − 0,3 → cue3 + 0,4
// · stanza fuori dal tempo da cue3 − 0,3 · libro che cade cue4 − 0,1.
