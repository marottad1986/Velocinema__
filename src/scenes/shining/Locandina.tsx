import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { DISPLAY, SANS, TYPEWRITER } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Fog, Glow, NearMotes, SunRays } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { Hotel, K, Maze, Typewriter } from './Comuni';

// Copertina e finale di Shining. Locandina originale: niente volto a puntini né volto dietro la porta, niente persone,
// niente tappeto del film. Copertina: notte di tormenta, l'albergo con poche finestre accese, il labirinto innevato
// visto dall'alto e, in primo piano, la macchina da scrivere con il foglio pieno di righe uguali.
// Finale: l'albergo all'alba sotto la neve, una sola finestra accesa, le tracce del mezzo per la neve che se ne vanno.

const r = rng(237);
const SNOW = Array.from({ length: 60 }, () => ({ x: r() * 1400 - 160, y: r() * 2000, s: 3 + r() * 8, v: 200 + r() * 300 }));

const Copertina_: React.FC<{ t: number; dur: number; accent: string }> = ({ t, dur, accent }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sc" />
        <Lin id="sc-sky" stops={[[0, '#05070C'], [0.5, '#141C28'], [1, '#2A3444']]} />
        <Lin id="sc-ground" stops={[[0, '#C8D4E0'], [1, '#5A6A7E']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}><rect x="-200" y="-200" width="1480" height="2400" fill="url(#sc-sky)" /></g>
        <g transform={L(0.4)}>
          <Glow id="sc-hg" x={540} y={780} r={420} t={t} color="#FFC870" amp={0.04} rate={1} opacity={0.2} />
          <Hotel x={540} y={900} s={0.8} t={t} lit={0.3} snow={1} />
          <Fog id="sc-fog" t={t} y={900} color="#C8D4E0" rx={900} ry={60} opacity={0.5} />
        </g>
        <g transform={L(0.6)}>
          <path d="M-200 900 H1280 V1600 H-200 Z" fill="url(#sc-ground)" />
          <g transform="translate(540 1040) scale(1 .42) translate(-540 -1040)"><Maze x={540} y={1040} w={760} h={700} snow={1} /></g>
        </g>
        <g transform={L(1.0)}>
          <Glow id="sc-tw" x={540} y={1230} r={320} t={t} color="#FFD8A0" amp={0.06} rate={2} opacity={0.4} />
          <Typewriter x={540} y={1260} s={1.3} t={t} lines={8} accent={accent} />
        </g>
        <g transform={L(1.6)}>
          {SNOW.map((f, i) => <circle key={i} cx={mod(f.x - t * 220, 1440) - 180} cy={mod(f.y + t * f.v, 2000)} r={f.s} fill="#F4F6FA" opacity=".5" />)}
          <NearMotes id="sc-near" t={t} color="#F4F6FA" n={6} vx={-140} opacity={0.12} />
        </g>
      </g>
      <Finish id="sc" tint="#1A2A3A" tintOpacity={0.12} />
    </svg>
  );
};

const Finale_: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sf" />
        <Lin id="sf-sky" stops={[[0, '#3A4A6A'], [0.45, '#C8A8A8'], [0.6, '#F4E4D8']]} />
        <Lin id="sf-snow" stops={[[0, '#F4F0EC'], [1, '#A8B4C4']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#sf-sky)" />
          <SunRays id="sf-rays" x={860} y={1000} t={t} color="#FFE8C8" n={9} length={1000} opacity={0.3} />
        </g>
        <g transform={L(0.4)}>
          <Hotel x={540} y={1020} s={0.75} t={t} lit={0.06} snow={1} litColor="#FFC870" />
        </g>
        <g transform={L(0.7)}>
          <path d="M-200 1020 H1280 V2200 H-200 Z" fill="url(#sf-snow)" />
          <path d="M560 1030 Q600 1300 900 1500 Q1060 1600 1300 1680" stroke="#8A96A8" strokeWidth="26" strokeDasharray="10 8" fill="none" />
          <path d="M520 1030 Q540 1300 820 1520 Q980 1640 1240 1740" stroke="#8A96A8" strokeWidth="26" strokeDasharray="10 8" fill="none" />
        </g>
        <g transform={L(1.6)}><NearMotes id="sf-near" t={t} color="#FFFFFF" n={6} y0={1300} opacity={0.1} /></g>
      </g>
      <Finish id="sf" tint="#1A2A3A" tintOpacity={0.08} />
    </svg>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const tag = eo(seg(t, 0.05, 0.45));
  const l1 = eob(seg(t, 0.15, 0.7), 1.4);
  const dir = eo(seg(t, 0.6, 1.0));
  const line = eo(seg(t, 1.1, 1.6));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Copertina_ t={t} dur={dur} accent={P.accento} />
      <div style={{ position: 'absolute', left: 80, top: 290, width: 920, fontFamily: SANS, color: P.chiaro }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.chiaro, opacity: tag, textShadow: `0 2px 0 ${P.scuro}` }}>IL FILM IN 2 MINUTI</p>
        <h1 style={{ margin: '14px 0 0', fontFamily: TYPEWRITER, fontWeight: 400, fontSize: 200, lineHeight: 0.95, letterSpacing: '0.04em', color: P.accento,
          textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.15, 0.4), transform: `translateY(${(1 - l1) * 50}px)` }}>
          SHINING
        </h1>
        <p style={{ margin: '20px 0 0', fontSize: 40, fontWeight: 800, opacity: dir, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>un film di {film.regista} · {film.anno}</p>
      </div>
      <p style={{ position: 'absolute', left: 60, right: 60, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 960, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, fontSize: 40, fontWeight: 800, textAlign: 'center',
        opacity: line, transform: `translateY(${(1 - line) * 14}px)` }}>
        {film.copertina.frase_lancio}
      </p>
    </div>
  );
};

export const Finale: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const card = eo(seg(t, 0.1, 0.5));
  const b1 = eob(seg(t, 0.5, 0.9), 1.8);
  const b2 = eob(seg(t, 0.7, 1.1), 1.8);
  const end = eob(seg(t, 0.3, 0.9), 1.3);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Finale_ t={t} dur={dur} />
      <div style={{ position: 'absolute', left: 90, top: 300, width: 900, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.chiaro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con il film che vorresti.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 1110, margin: 0, textAlign: 'center', fontFamily: TYPEWRITER, fontWeight: 400, fontSize: 170, lineHeight: 1,
        color: P.accento, textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        THE END
      </h1>
    </div>
  );
};
