import React from 'react';
import { eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { Glow } from '../../lib/elements';
import { ANTON, DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import type { PosterProps } from '../../types';
import { Disco, Jukebox, Stella } from '../talent/SchemaLive';
import { GIUDICI, giudice, CONCORRENTI } from '../talent/x-factor-2026';

// Copertina e finale del riepilogo del Live 3 (TALENT.md): stessa lavagna dello schema, niente logo del programma,
// niente persone né microfoni. Copertina (è anche la miniatura, completa al fotogramma 0): il jukebox della serata con i
// dischi dei concorrenti a ventaglio nei colori delle squadre, uno incrinato e grigio (l'eliminato), due stelle d'oro (gli
// applausi in piedi); i dischi girano e il jukebox lampeggia. Finale: lo stesso jukebox più piccolo, i dieci dischi rimasti.

const rr = rng(4410);
const MOTES = Array.from({ length: 30 }, () => ({ x: rr() * 1080, y: rr() * 1920, s: 1.2 + rr() * 2.4, v: 8 + rr() * 20, ph: rr() * 6 }));
const IN_GARA = ['giacomo', 'camilla', 'alia', 'patrizia', 'teo', 'manu', 'alex', 'distanze', 'scraffs', 'maddog'];
const col = (id: string) => giudice(CONCORRENTI.find((c) => c.id === id)!.squadra).colore;

const Fondo: React.FC<{ id: string; t: number; finale?: boolean }> = ({ id, t, finale }) => {
  const zoom = lerp(1.0, 1.05, seg(t, 0, 4));
  // ventaglio di dischi sopra il jukebox
  const fan = IN_GARA.map((cid, i) => {
    const a = lerp(-150, -30, i / (IN_GARA.length - 1)) * (Math.PI / 180);
    const R = i % 2 ? 330 : 420;
    return { cid, x: 540 + Math.cos(a) * R, y: 1300 + Math.sin(a) * R * 0.95, r: i % 2 ? 58 : 66 };
  });
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <radialGradient id={`${id}-bg`} cx=".5" cy=".62" r=".8">
          <stop offset="0" stopColor="#2A1E48" />
          <stop offset=".6" stopColor="#140F24" />
          <stop offset="1" stopColor="#09070F" />
        </radialGradient>
        <pattern id={`${id}-grid`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0 H0 V40" fill="none" stroke="#2A2240" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1080" height="1920" fill={`url(#${id}-bg)`} />
      <rect width="1080" height="1920" fill={`url(#${id}-grid)`} opacity=".5" />
      {GIUDICI.map((g, i) => (
        <Glow key={g.id} id={`${id}-gl${i}`} x={540 + Math.sin(t * 0.4 + i * 1.7) * 380} y={1300 + Math.cos(t * 0.35 + i * 2.1) * 360} r={480} t={t} color={g.colore} amp={0.05} rate={0.8} ph={i} opacity={0.16} />
      ))}
      <g transform={`translate(540 1500) scale(${zoom}) translate(-540 -1500)`}>
        {!finale && fan.map((d, i) => (
          <g key={d.cid} transform={`translate(0 ${Math.sin(t * 1.6 + i) * 6})`}>
            <Disco T={t} x={d.x} y={d.y} r={d.r} label={col(d.cid)} gira={1} />
          </g>
        ))}
        {!finale && (
          <>
            {/* l'eliminato della serata: disco grigio incrinato, a terra */}
            <g transform="rotate(-18 220 1600)"><Disco T={t} x={220} y={1600} r={70} label={col('lenanie')} fuori={1} /></g>
            <Stella T={t} t0={-1} x={250} y={990} s={0.95} />
            <Stella T={t} t0={-1} x={850} y={1010} s={0.95} />
          </>
        )}
        <Jukebox T={t} x={540} y={finale ? 1520 : 1700} s={finale ? 0.85 : 1.15} on={1} />
        {finale && IN_GARA.map((cid, i) => (
          <Disco key={cid} T={t} x={140 + (i % 5) * 200} y={1630 + Math.floor(i / 5) * 140} r={52} label={col(cid)} gira={0.6} />
        ))}
      </g>
      {MOTES.map((m, i) => (
        <circle key={i} cx={mod(m.x + Math.sin(t * 0.5 + m.ph) * 30, 1080)} cy={mod(m.y - t * m.v, 1920)} r={m.s} fill="#F1EDF7" opacity={0.08 + 0.06 * Math.sin(t * 2 + m.ph)} />
      ))}
      <Finish id={id} tint="#2A1E4A" tintOpacity={0.1} />
    </svg>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, film }) => {
  const P = film.palette;
  // completa dal fotogramma 0 (è la miniatura); la fascia della frase di lancio entra da 0,4 s (CLAUDE.md, «Formato»)
  const line = eo(seg(t, 0.4, 0.7));
  const breath = 1 + 0.008 * Math.sin(t * 1.6);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Fondo id="xc" t={t} />
      <div style={{ position: 'absolute', left: 120, top: 280, width: 840, fontFamily: SANS, color: P.chiaro }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.chiaro, textShadow: `0 2px 0 ${P.scuro}` }}>TALENT SPIEGATI</p>
        <h1 style={{ margin: '4px 0 0', fontFamily: ANTON, fontWeight: 400, fontSize: 146, lineHeight: 0.95, color: P.chiaro, whiteSpace: 'nowrap',
          textShadow: `0 7px 0 ${P.scuro}, 0 0 50px ${P.scuro}`, transform: `scale(${breath})`, transformOrigin: 'left center' }}>
          X FACTOR <span style={{ color: P.accento }}>2026</span>
        </h1>
        <p style={{ margin: '14px 0 0', fontFamily: DISPLAY, fontWeight: 800, fontSize: 70, lineHeight: 1, color: P.chiaro, textShadow: `0 5px 0 ${P.scuro}` }}>
          Com'è andato il Live 3
        </p>
        <span style={{ display: 'inline-block', marginTop: 22, padding: '10px 22px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 32, fontWeight: 800, letterSpacing: '0.12em' }}>
          PRIMA DEL LIVE 4
        </span>
      </div>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}E0`, color: P.chiaro, fontFamily: SANS, fontSize: 40, fontWeight: 800, textAlign: 'center',
        opacity: line, visibility: line > 0 ? 'visible' : 'hidden', transform: `translateY(${(1 - line) * 14}px)` }}>
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
  const end = eob(seg(t, 0.3, 0.9), 1.3);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Fondo id="xf" t={t} finale />
      <div style={{ position: 'absolute', left: 120, top: 300, width: 840, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è servito?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 0.6, 1.0) }}>Commenta con chi vorresti in finale.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 120, width: 840, top: 700, margin: 0, textAlign: 'center', fontFamily: ANTON, fontWeight: 400, fontSize: 100, lineHeight: 1, whiteSpace: 'nowrap',
        color: P.accento, textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        10 ANCORA IN GARA
      </h1>
    </div>
  );
};
