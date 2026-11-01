import React from 'react';
import { eo, eob, lerp, seg } from '../../lib/anim';
import { BEBAS, DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Glow } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { ArtLimbo, ArtP1, ArtP2, ArtP3, ArtRealta, INK, ORANGE, ROW, Top } from './Piani';

// Copertina e finale di Inception (formato "spiegato", senza sigla: la copertina dura tutti i 4 s).
// Locandina originale, nello stile della cianografia dello schema: niente città che si piega, niente persone, niente
// locandine ufficiali. Una trottola gigante gira sopra lo spaccato di un edificio a piani che scendono nel buio.

// Lo spaccato usa gli stessi disegni dei piani dello schema (Piani.tsx), ognuno ritagliato nella sua parte centrale e
// più piccolo man mano che si scende, come un edificio visto in prospettiva.
const FLOORS = [
  { key: 'realta', name: 'REALTÀ', band: 110 },
  { key: 'p1', name: 'SOGNO 1', band: 200 },
  { key: 'p2', name: 'SOGNO 2', band: 130 },
  { key: 'p3', name: 'SOGNO 3', band: 60 },
  { key: 'limbo', name: 'LIMBO', band: 190 },
] as const;
const BAND = 300, WIDTHS = [780, 660, 560, 470, 400];

const Blueprint: React.FC<{ t: number; id: string; wobble?: number; build?: number }> = ({ t, id, wobble = 0, build = 1 }) => {
  let y = 940;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <radialGradient id={`${id}-bg`} cx=".5" cy=".5" r=".8">
          <stop offset="0" stopColor="#1E4266" />
          <stop offset=".6" stopColor="#122A44" />
          <stop offset="1" stopColor="#081626" />
        </radialGradient>
        <pattern id={`${id}-grid`} width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0 H0 V40" fill="none" stroke="#2C4C6E" strokeWidth="1" /></pattern>
      </defs>
      <rect width="1080" height="1920" fill={`url(#${id}-bg)`} />
      <rect width="1080" height="1920" fill={`url(#${id}-grid)`} opacity=".6" />
      {FLOORS.map((f, i) => {
        const w = WIDTHS[i], k = w / 940, h = BAND * k, top = y;
        y += h + 14;
        const p = eo(seg(build, i * 0.14, i * 0.14 + 0.4));
        const wy = ROW[f.key].y0 + f.band;
        const red = f.key === 'limbo';
        return (
          <g key={f.key} opacity={p} transform={`translate(0 ${(1 - p) * 40})`}>
            <clipPath id={`${id}-c${i}`}><rect x={540 - w / 2} y={top} width={w} height={h} /></clipPath>
            <rect x={540 - w / 2} y={top} width={w} height={h} fill="#163452" opacity=".8" />
            <g clipPath={`url(#${id}-c${i})`}>
              <g transform={`translate(${540 - w / 2} ${top}) scale(${k}) translate(-70 ${-wy})`}>
                {f.key === 'realta' && <ArtRealta T={t} wake={0} />}
                {f.key === 'p1' && <ArtP1 T={t} van={0} />}
                {f.key === 'p2' && <ArtP2 />}
                {f.key === 'p3' && <ArtP3 T={t} />}
                {f.key === 'limbo' && <ArtLimbo T={t} />}
              </g>
            </g>
            <rect x={540 - w / 2} y={top} width={w} height={h} fill="none" stroke={red ? '#E0605A' : INK} strokeWidth="4" />
            <text x={540 - w / 2 + 14} y={top + 34} fontFamily={SANS} fontWeight={900} fontSize="28" letterSpacing="4" fill={red ? '#E0605A' : ORANGE} stroke="#0B1A2A" strokeWidth="6" paintOrder="stroke">{f.name}</text>
            {i < 4 && <path d={`M${540 - w / 2} ${top + h} L${540 - WIDTHS[i + 1] / 2} ${top + h + 14} M${540 + w / 2} ${top + h} L${540 + WIDTHS[i + 1] / 2} ${top + h + 14}`} stroke={INK} strokeWidth="3" opacity=".7" />}
          </g>
        );
      })}
      <g transform="translate(540 800)">
        <Glow id={`${id}-tg`} x={0} y={0} r={360} t={t} color={ORANGE} amp={0.08} rate={2} opacity={0.5} />
        <ellipse cx="0" cy="128" rx="130" ry="18" fill="#000" opacity=".35" />
        <Top T={t} spin={2.4} wobble={wobble} s={3.2} />
      </g>
      <Finish id={id} tint="#1E3A5A" tintOpacity={0.08} />
    </svg>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const tag = eo(seg(t, 0.05, 0.4));
  const l1 = eob(seg(t, 0.1, 0.6), 1.3);
  const line = eo(seg(t, 0.8, 1.2));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Blueprint t={t} id="ic" build={seg(t, 0, dur * 0.8)} />
      <div style={{ position: 'absolute', left: 80, top: 290, width: 920, fontFamily: SANS }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.accento, opacity: tag }}>SPIEGATO SEMPLICE · FILM</p>
        <h1 style={{ margin: '6px 0 0', fontFamily: BEBAS, fontWeight: 400, fontSize: 220, lineHeight: 0.9, letterSpacing: '0.06em', color: P.chiaro,
          textShadow: `0 8px 0 ${P.scuro}`, opacity: seg(t, 0.1, 0.3), transform: `translateY(${(1 - l1) * 50}px)` }}>
          INCEPTION
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 34, fontWeight: 800, opacity: seg(t, 0.4, 0.8), color: P.chiaro }}>un film di {film.regista} · {film.anno}</p>
      </div>
      <p style={{ position: 'absolute', left: 60, right: 60, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 960, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, fontSize: 40, fontWeight: 800, textAlign: 'center',
        opacity: line, transform: `translateY(${(1 - line) * 14}px)` }}>
        {film.copertina.frase_lancio}
      </p>
    </div>
  );
};

export const Finale: React.FC<PosterProps> = ({ t, film }) => {
  const P = film.palette;
  const card = eo(seg(t, 0.1, 0.5));
  const b1 = eob(seg(t, 0.5, 0.9), 1.8);
  const b2 = eob(seg(t, 0.7, 1.1), 1.8);
  const line = eo(seg(t, 0.4, 0.8));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Blueprint t={t + 3} id="ie" wobble={lerp(0.4, 1, seg(t, 0, 4))} />
      <div style={{ position: 'absolute', left: 90, top: 300, width: 900, boxSizing: 'border-box', padding: '34px 40px 30px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 68, lineHeight: 1 }}>Ti è servito?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 28 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 40, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 40, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '24px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con la spiegazione che vorresti.</p>
      </div>
      <p style={{ position: 'absolute', left: 60, right: 60, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 960, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, fontSize: 44, fontWeight: 800, textAlign: 'center', lineHeight: 1.25,
        opacity: line, transform: `translateY(${(1 - line) * 14}px)` }}>
        {film.finale.voce}
      </p>
    </div>
  );
};
