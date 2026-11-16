import React from 'react';
import { eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { DISPLAY, RIGHTEOUS, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Glow, Smoke, Stars } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { INK, P85, TimeCar, YEL } from '../ritorno-al-futuro/Linee';
import { P1885 } from '../ritorno-al-futuro-parte-2/Linee2';
import { Loco, Tomb } from './Linee3';

// Copertina e finale di Ritorno al futuro – Parte III (formato "spiegato", senza sigla; la copertina è anche la miniatura).
// Stesso stile delle Parti 1 e 2 (notte al neon anni '80; il 1885 come fotografia seppia) e lo stesso cartellino «PARTE N».
// Una locomotiva a vapore (generica) spinge una piccola auto argentata su un ponte di legno interrotto sopra un burrone; il
// fumo sale, davanti all'auto le scie gialle del viaggio nel tempo. In primo piano a sinistra la lapide di Doc.
// Il fotogramma 0 è già completo; le ruote girano, il fumo sale, le scie scorrono. Finale: il fumo si dirada e la lapide
// è liscia, senza nome (Doc è salvo).

const DARK = '#0E0A22';
const SEP = P1885.ink;
const r = rng(1990);
const SPARKS = Array.from({ length: 24 }, () => ({ x: r() * 1080, y: 700 + r() * 900, v: 20 + r() * 40, s: 2 + r() * 3, ph: r() }));

/** avanza (facoltativo): spinta in px decisa da fuori, senza il ciclo che riparte (trailer); senza, come prima. */
export const Art: React.FC<{ t: number; id: string; calm?: number; avanza?: number }> = ({ t, id, calm = 0, avanza }) => {
  const L = (f: number) => `translate(${Math.sin(t * 0.3) * 10 * f} 0)`;
  const push = calm ? 0 : avanza ?? mod(t * 14, 30);
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0B0620" />
          <stop offset=".35" stopColor="#24124A" />
          <stop offset=".62" stopColor="#52205E" />
          <stop offset="1" stopColor="#8A2E66" />
        </linearGradient>
        <linearGradient id={`${id}-cliff`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E3CFA4" />
          <stop offset="1" stopColor="#B8996A" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill={`url(#${id}-sky)`} />
      <g transform={L(0.2)}><Stars t={t} seed={23} n={40} x={0} y={600} w={1080} h={500} color={INK} /></g>
      {/* il burrone: le due rupi color seppia e il buio in mezzo */}
      <g transform={L(0.5)}>
        <path d="M0 1120 H700 L640 1920 H0 Z" fill={`url(#${id}-cliff)`} stroke={SEP} strokeWidth="8" />
        <path d="M940 1160 H1080 V1920 H990 Z" fill={`url(#${id}-cliff)`} stroke={SEP} strokeWidth="8" />
        <path d="M700 1120 L640 1920 H990 L940 1160 Z" fill="#0C0820" />
        {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${60 + i * 110} ${1160 + (i % 2) * 40} l40 30 M${80 + i * 100} ${1300 + (i % 3) * 60} l-30 40`} stroke={SEP} strokeWidth="4" opacity=".5" />)}
        {/* il ponte di legno interrotto */}
        <path d="M120 1100 H820" stroke={SEP} strokeWidth="14" strokeLinecap="round" />
        {[520, 600, 680, 760].map((x) => <path key={x} d={`M${x} 1100 V${x > 700 ? 1260 : 1160} M${x - 30} 1160 L${x + 30} 1100`} stroke={SEP} strokeWidth="8" strokeLinecap="round" />)}
        <path d="M820 1100 l26 -10 l-8 22" fill="none" stroke="#E8553F" strokeWidth="7" strokeLinecap="round" />
        {Array.from({ length: 18 }, (_, i) => <path key={i} d={`M${130 + i * 38} 1090 v20`} stroke={SEP} strokeWidth="6" />)}
      </g>
      {/* la locomotiva che spinge l'auto, il fumo, le scie */}
      <g transform={L(0.8)}>
        <g transform={`translate(${300 + push} 1050) scale(1.6)`}>
          {!calm && <Smoke id={`${id}-sm`} t={t} x={-100} y={-140} color="#D9CCB4" n={8} rise={260} wind={-220} r0={22} r1={80} opacity={0.8} />}
          <Loco T={t} glow={calm ? 0.3 : 1} />
        </g>
        {!calm && [0, 1].map((k) => {
          const d = k ? 'M780 1000 C880 940 940 860 900 760' : 'M790 1040 C900 1030 990 960 1000 860';
          return (
            <g key={k}>
              <path d={d} fill="none" stroke={YEL} strokeWidth="40" opacity=".14" strokeLinecap="round" />
              <path d={d} fill="none" stroke={DARK} strokeWidth="20" opacity=".5" strokeLinecap="round" />
              <path d={d} fill="none" stroke={YEL} strokeWidth="14" strokeDasharray="44 28" strokeDashoffset={-t * 180 - k * 30} strokeLinecap="round" />
            </g>
          );
        })}
        <g transform={`translate(${650 + push} 1046) scale(1.15)`}><TimeCar T={t} glow={calm ? 0.2 : 0.9} s={1} ink={SEP} /></g>
      </g>
      {/* la lapide in primo piano */}
      <g transform={`translate(250 1320) scale(1.3) rotate(-3)`}><Tomb T={t} lit={calm ? 0 : 1} gone={calm ? 1 : 0} /></g>
      {SPARKS.map((p, i) => {
        const y = p.y - mod(t * p.v + p.ph * 600, 600);
        return <circle key={i} cx={p.x + Math.sin(t * 2 + i) * 14} cy={y} r={p.s} fill={i % 3 ? YEL : INK} opacity={0.15 + 0.35 * (0.5 + 0.5 * Math.sin(t * 3 + i))} />;
      })}
      <Finish id={id} tint="#1A1238" tintOpacity={0.1} />
    </svg>
  );
};

const TitleBlock: React.FC<{ film: PosterProps['film'] }> = ({ film }) => {
  const P = film.palette;
  return (
    <div style={{ position: 'absolute', left: 120, top: 268, width: 840, fontFamily: SANS, textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.accento, textShadow: `0 3px 0 ${P.scuro}` }}>SPIEGATO SEMPLICE · FILM</p>
      <h1 style={{ margin: '10px 0 0', fontFamily: RIGHTEOUS, fontWeight: 400, fontSize: 150, lineHeight: 0.98, color: P.chiaro, textShadow: `0 8px 0 ${P.scuro}, 0 0 34px rgba(255,79,176,.7), 0 0 70px rgba(92,240,255,.35)` }}>
        RITORNO<br />AL FUTURO
      </h1>
      <div style={{ display: 'inline-block', marginTop: 14, padding: '6px 26px 8px', borderRadius: 14, border: `4px solid #5CF0FF`, background: `${P.scuro}CC`,
        fontFamily: RIGHTEOUS, fontSize: 52, lineHeight: 1, letterSpacing: '0.12em', color: P.accento, boxShadow: '0 0 24px rgba(92,240,255,.55)' }}>PARTE 3</div>
      <p style={{ margin: '14px 0 0', fontSize: 30, fontWeight: 800, color: '#B5CBE2', textShadow: `0 3px 0 ${P.scuro}` }}>un film di {film.regista} · {film.anno}</p>
    </div>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, film }) => {
  const P = film.palette;
  const k = eo(seg(t, 0.4, 0.7));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Art t={t} id="r3c" />
      <TitleBlock film={film} />
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}E0`, color: P.chiaro, fontFamily: SANS, fontSize: 44, fontWeight: 800, textAlign: 'center',
        opacity: k, transform: `translateY(${(1 - k) * 16}px)` }}>
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
      <Art t={t + 4} id="r3e" calm={1} />
      <div style={{ position: 'absolute', left: 120, top: 300, width: 840, boxSizing: 'border-box', padding: '34px 40px 30px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 68, lineHeight: 1 }}>Ti è servito?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 28 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 40, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 40, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '24px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con la spiegazione che vorresti.</p>
      </div>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, fontSize: 44, fontWeight: 800, textAlign: 'center', lineHeight: 1.25,
        opacity: line, transform: `translateY(${(1 - line) * 14}px)` }}>
        {film.finale.voce}
      </p>
    </div>
  );
};
