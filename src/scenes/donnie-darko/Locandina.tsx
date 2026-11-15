import React from 'react';
import { eo, eob, mod, seg } from '../../lib/anim';
import { BEBAS, DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Flyers, Glow, Stars } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { ArtCasa, ENGINE, INK, RED } from './Copia';

// Copertina e finale di Donnie Darko (formato "spiegato", senza sigla: la copertina dura tutti i 4 s ed è anche la miniatura).
// Locandina originale: niente persone, niente costume del coniglio, niente locandine ufficiali. La casa di periferia di
// notte con il motore d'aereo piantato nel tetto (l'unico colore acceso) e il fumo che sale; sopra, un vortice di nuvole
// che gira; sotto il titolo il contatore che scende da 28:06:42:12. In primo piano il prato con le foglie secche.
// Il fotogramma 0 è già completo: titolo, contatore, casa e motore (niente dissolvenze dal nero).

const DARK = '#0A0C1A';
const FULL = 28 * 86400 + 6 * 3600 + 42 * 60 + 12;
const fmt = (s: number) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 86400))}:${p(Math.floor((s % 86400) / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
};

const Vortex: React.FC<{ t: number; x: number; y: number; k: number; id: string }> = ({ t, x, y, k, id }) => (
  <g>
    <Glow id={`${id}-vg`} x={x} y={y} r={420 * k} t={t} color="#B8A8F0" amp={0.1} rate={2.5} opacity={0.45} />
    {Array.from({ length: 9 }, (_, i) => {
      const rad = (60 + i * 42) * k;
      const rot = t * (70 - i * 6) + i * 41;
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(1 .5)`}>
          <path d={`M${rad} 0 A${rad} ${rad} 0 0 1 ${-rad * 0.7} ${rad * 0.7}`} fill="none" stroke={i % 2 ? '#7E6EC0' : '#C8BCF2'} strokeWidth={30 - i * 2.4} strokeLinecap="round" opacity={0.95 - i * 0.05} />
          <path d={`M${-rad} 0 A${rad} ${rad} 0 0 1 ${rad * 0.7} ${-rad * 0.7}`} fill="none" stroke="#5A4A98" strokeWidth={20 - i * 1.6} strokeLinecap="round" opacity={0.75 - i * 0.06} />
        </g>
      );
    })}
    <ellipse cx={x} cy={y} rx={40 * k} ry={20 * k} fill="#F4F0FF" opacity={0.55 + 0.3 * Math.sin(t * 5)} />
  </g>
);

const Art: React.FC<{ t: number; id: string; calm?: number }> = ({ t, id, calm = 0 }) => (
  <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <FxDefs id={id} />
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#07081A" />
        <stop offset=".35" stopColor="#141838" />
        <stop offset=".6" stopColor="#262A58" />
        <stop offset="1" stopColor="#3A3466" />
      </linearGradient>
      <linearGradient id="dd-house" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#4A5282" />
        <stop offset="1" stopColor="#30365E" />
      </linearGradient>
      <linearGradient id={`${id}-lawn`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1A2138" />
        <stop offset="1" stopColor="#0C0F20" />
      </linearGradient>
    </defs>
    <rect width="1080" height="1920" fill={`url(#${id}-sky)`} />
    <Stars t={t} seed={19} n={50} x={0} y={60} w={1080} h={900} size={1.2} color="#DDE2F5" />
    {/* il vortice sopra la casa */}
    <Vortex t={t} x={540} y={760} k={1.25 - 0.55 * calm} id={id} />
    {/* la casa con il motore nel tetto, ingrandita */}
    <g transform="translate(-486 -120) scale(1.71)">
      <ArtCasa T={t} engine={1} crash={1} sky={false} golf={false} />
    </g>
    {/* il prato in primo piano fino al bordo basso, con le foglie */}
    <rect x="0" y="1452" width="1080" height="468" fill={`url(#${id}-lawn)`} />
    <path d="M0 1452 H1080" stroke="#3A4870" strokeWidth="3" />
    {Array.from({ length: 34 }, (_, i) => <path key={i} d={`M${i * 33 + (i % 3) * 7} ${1500 + (i % 5) * 70} l6 -16 l6 16`} stroke="#3A4870" strokeWidth="3" fill="none" />)}
    {Array.from({ length: 14 }, (_, i) => (
      <path key={`l${i}`} d="M0 -12 Q10 0 0 12 Q-10 0 0 -12 Z" fill={i % 3 ? '#7A4030' : '#A65A3A'} stroke={DARK} strokeWidth="2.5"
        transform={`translate(${(i * 173) % 1080} ${1560 + ((i * 97) % 300)}) rotate(${i * 47}) scale(${1.4 + (i % 3) * 0.3})`} />
    ))}
    <Flyers t={t} seed={77} n={6} color="#A65A3A" outline={DARK} w={22} h={30} y0={900} y1={1700} speed={0.07} shape="leaf" />
    {/* la riga gialla del tempo che gira attorno al vortice */}
    <path d={`M140 ${980} Q540 ${600 + Math.sin(t) * 10} 940 980`} fill="none" stroke="#F5D04A" strokeWidth="6" strokeDasharray="24 16" strokeDashoffset={-t * 60} opacity={0.55 * (1 - calm)} />
    <Finish id={id} tint="#161A3A" tintOpacity={0.12} />
  </svg>
);

const TitleBlock: React.FC<{ film: PosterProps['film']; t: number; zero?: boolean }> = ({ film, t, zero }) => {
  const P = film.palette;
  const left = zero ? 0 : Math.max(0, FULL - Math.floor(t));
  return (
    <div style={{ position: 'absolute', left: 120, top: 270, width: 840, fontFamily: SANS, textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.accento }}>SPIEGATO SEMPLICE · FILM</p>
      <h1 style={{ margin: '6px 0 0', fontFamily: BEBAS, fontWeight: 400, fontSize: 176, lineHeight: 0.95, letterSpacing: '0.06em', color: P.chiaro, textShadow: `0 8px 0 ${P.scuro}` }}>DONNIE DARKO</h1>
      <p style={{ margin: '8px auto 0', width: 'fit-content', padding: '4px 22px 6px', borderRadius: 14, background: `${P.scuro}D0`, border: `3px solid ${zero ? RED : ENGINE}`,
        fontSize: 64, fontWeight: 800, letterSpacing: '0.06em', color: zero ? RED : ENGINE, fontVariantNumeric: 'tabular-nums' }}>{fmt(left)}</p>
    </div>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, film }) => {
  const P = film.palette;
  const line = eo(seg(t, 0.4, 0.7));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Art t={t} id="dc" />
      <TitleBlock film={film} t={t} />
      <p style={{ position: 'absolute', left: 120, width: 840, top: 1318, margin: 0, textAlign: 'center', fontFamily: SANS, fontSize: 30, fontWeight: 800, color: '#C9CEE6', textShadow: `0 2px 6px ${P.scuro}` }}>un film di {film.regista} · {film.anno}</p>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1440, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}E0`, color: P.chiaro, fontFamily: SANS, fontSize: 44, fontWeight: 800, textAlign: 'center', lineHeight: 1.2,
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
      <Art t={t + 3} id="de" calm={1} />
      <div style={{ position: 'absolute', left: 120, top: 300, width: 840, boxSizing: 'border-box', padding: '34px 40px 30px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 68, lineHeight: 1 }}>Ti è servito?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 28 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 40, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 40, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '24px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con la spiegazione che vorresti.</p>
      </div>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1440, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, fontSize: 44, fontWeight: 800, textAlign: 'center', lineHeight: 1.25,
        opacity: line, transform: `translateY(${(1 - line) * 14}px)` }}>
        {film.finale.voce}
      </p>
      <p style={{ position: 'absolute', left: 120, width: 840, top: 640, margin: 0, textAlign: 'center', fontFamily: SANS, fontSize: 60, fontWeight: 800, letterSpacing: '0.06em',
        color: RED, fontVariantNumeric: 'tabular-nums', opacity: seg(t, 0.6, 1.0) * (0.75 + 0.25 * Math.abs(Math.sin(mod(t, 2) * Math.PI))), textShadow: `0 3px 0 ${P.scuro}` }}>00:00:00:00</p>
    </div>
  );
};

export { INK };
