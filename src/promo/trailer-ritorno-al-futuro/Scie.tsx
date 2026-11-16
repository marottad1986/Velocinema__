import React from 'react';
import { eo, lerp, mod, rng, seg } from '../../lib/anim';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Glow, NearMotes, Smoke, Stars, flamePath } from '../../lib/elements';
import { CYAN, K, MAG, TINT, YEL, cam, type ShotProps } from './comune';

// Il titolo: l'auto ha appena toccato le 88 miglia ed è sparita. Sulla strada di Hill Valley, di notte, restano due scie
// di fuoco parallele che corrono in prospettiva fino al punto in cui l'auto è svanita, dove si spegne un lampo bianco.
// Scie di fuoco ammesse dall'editore per il trailer (16 novembre 2026, qualita/ritorno-al-futuro.md), nel nostro stile:
// lingue di fuoco a tre colori con il contorno scuro, solco bruciato sull'asfalto, fumo e scintille.
// Il cielo in alto resta calmo e scuro: lì sta il titolo (Scena.tsx).
// Piani: cielo e stelle (0,15) · città e torre lontane (0,3) · strada (0,6) · scie di fuoco (0,6) · fumo e scintille (1,3).

const VP = { x: 540, y: 1000 }; // dove l'auto è sparita
const r = rng(1021);
const SPARKS = Array.from({ length: 40 }, () => ({ k: r(), side: r() > 0.5 ? 1 : -1, ph: r(), up: 120 + r() * 260, s: 2 + r() * 4 }));
const N = 16; // fiamme per scia

/** Punto della scia (k = 0 vicino alla camera, 1 al punto di fuga), per la scia a sinistra (-1) o a destra (+1). */
const along = (k: number, side: number) => {
  const x0 = 540 + side * 330, y0 = 1580; // il punto vicino sta sopra la banda nera in basso
  const e = k ** 0.55; // prospettiva: le fiamme si addensano verso l'orizzonte
  return { x: lerp(x0, VP.x + side * 14, e), y: lerp(y0, VP.y, e), s: lerp(1, 0.08, e) };
};

export const Scie: React.FC<ShotProps> = ({ t, dur, id }) => {
  const C = cam(t, dur, { z: 0.08, pan: 0, cx: 540, cy: 1000 });
  const flash = 1 - seg(t, 0, 0.7);
  const ignite = eo(seg(t, 0, 0.35)); // le scie si accendono dalla camera verso l'orizzonte
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <Lin id={`${id}-sky`} stops={[[0, '#06030F'], [0.3, '#140A2E'], [0.48, '#3A1650'], [0.52, '#7A2A5E'], [1, '#2A1440']]} />
        <Lin id={`${id}-road`} stops={[[0, '#2A1A44'], [0.3, '#160E28'], [1, '#06040C']]} />
      </defs>
      <g transform={C.transform}>
        <g transform={C.L(0.15)}>
          <rect x="-200" width="1480" height="1920" fill={`url(#${id}-sky)`} />
          <Stars t={t} seed={3} n={46} x={0} y={240} w={1080} h={650} color="#F4EEE2" />
        </g>
        {/* la città lontana all'orizzonte, con la torre dell'orologio e le insegne */}
        <g transform={C.L(0.3)}>
          <path d="M-200 1000 V930 H60 V890 H180 V940 H300 V900 H420 V1000 Z M660 1000 V910 H760 V870 H880 V930 H1000 V895 H1280 V1000 Z" fill="#1A0E30" />
          <path d="M440 1000 V860 H480 V820 L500 790 L520 820 V860 H560 V1000 Z" fill="#1A0E30" />
          <circle cx="500" cy="850" r="16" fill="#E6F6FF" opacity=".55" />
          {[[100, 915, MAG], [240, 925, CYAN], [820, 900, MAG], [950, 915, CYAN]].map(([x, y, c], i) => (
            <rect key={i} x={Number(x)} y={Number(y)} width="60" height="10" fill={String(c)} opacity={0.6 + 0.3 * Math.sin(t * 5 + i)} />
          ))}
        </g>
        {/* la strada in prospettiva, la riga di mezzo, il solco bruciato */}
        <g transform={C.L(0.6)}>
          <path d={`M-200 1920 L${VP.x - 30} ${VP.y} H${VP.x + 30} L1280 1920 Z`} fill={`url(#${id}-road)`} />
          <path d={`M-200 1000 H1280`} stroke={MAG} strokeWidth="4" opacity=".7" />
          {Array.from({ length: 6 }, (_, i) => {
            const u = i / 6;
            const y = lerp(VP.y, 1920, u ** 2), h = lerp(6, 120, u ** 2), w = lerp(2, 18, u ** 2);
            return <rect key={i} x={540 - w / 2} y={y} width={w} height={h} fill={YEL} opacity=".5" />;
          })}
          {[-1, 1].map((side) => {
            const a = along(0, side), b = along(1, side);
            return <path key={side} d={`M${a.x - 40 * side} ${a.y} L${b.x} ${b.y} L${b.x + 4 * side} ${b.y} L${a.x + 40 * side} ${a.y} Z`} fill="#0A0406" opacity=".85" />;
          })}
          {/* il lampo che si spegne dove l'auto è sparita */}
          <Glow id={`${id}-vp`} x={VP.x} y={VP.y} r={lerp(160, 520, flash)} t={t} color="#FFF6D8" amp={0.05} rate={8} opacity={0.3 + 0.7 * flash} />
        </g>
        {/* le due scie di fuoco */}
        <g transform={C.L(0.6)}>
          {[-1, 1].map((side) => (
            <g key={side}>
              <Glow id={`${id}-g${side}`} x={along(0.15, side).x} y={along(0.15, side).y - 40} r={360} t={t} color="#FF8A2C" amp={0.12} rate={9} opacity={0.5 * ignite} />
              {Array.from({ length: N }, (_, i) => {
                const k = 1 - i / (N - 1); // dalla più lontana alla più vicina, così le vicine coprono le lontane
                if (k > ignite + 0.02 && ignite < 1) return null;
                const p = along(k, side);
                const w = 95 * p.s, h = 360 * p.s * (0.85 + 0.15 * Math.sin(t * 7 + i));
                const ph = i * 1.7 + side;
                return (
                  <g key={i}>
                    <path d={flamePath(p.x, p.y, w, h, t, ph)} fill="#D9481E" stroke={K} strokeWidth={Math.max(1.5, 6 * p.s)} strokeLinejoin="round" />
                    <path d={flamePath(p.x, p.y, w * 0.66, h * 0.7, t, ph + 0.6)} fill="#FF8A2C" />
                    <path d={flamePath(p.x, p.y, w * 0.36, h * 0.42, t, ph + 1.2)} fill="#FFD86B" />
                  </g>
                );
              })}
            </g>
          ))}
        </g>
        {/* fumo e scintille che salgono dalle scie */}
        <g transform={C.L(1.3)}>
          {[-1, 1].map((side) => (
            <Smoke key={side} id={`${id}-sm${side}`} t={t} x={along(0.2, side).x} y={along(0.2, side).y - 200} color="#4A3A4A" n={10} rise={500} wind={side * 120} r0={60} r1={240} speed={0.45} opacity={0.6 * ignite} />
          ))}
          {SPARKS.map((s, i) => {
            const u = mod(t * 0.9 + s.ph, 1);
            const p = along(s.k * 0.7, s.side);
            return <circle key={i} cx={p.x + Math.sin(u * 6 + i) * 30} cy={p.y - 60 * p.s - s.up * u} r={s.s * (1 - u) * (0.4 + p.s)} fill={i % 2 ? '#FFD86B' : '#FF8A2C'} opacity={ignite * (1 - u)} />;
          })}
          <NearMotes id={`${id}-near`} t={t} color="#FFB25C" opacity={0.08} vy={-40} />
        </g>
      </g>
      <rect width="1080" height="1920" fill="#FFF6D8" opacity={0.6 * seg(t, 0, 0.05) * (1 - seg(t, 0.05, 0.5))} />
      <Finish id={id} tint={TINT} tintOpacity={0.1} />
    </svg>
  );
};
