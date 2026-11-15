import React from 'react';
import { eo, eob, mod, rng, seg } from '../../lib/anim';
import { DISPLAY, RIGHTEOUS, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Fire, Glow, Stars } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { INK, P55, P85, YEL } from '../ritorno-al-futuro/Linee';
import { Almanac, PALT } from './Linee2';

// Copertina e finale di Ritorno al futuro – Parte II (formato "spiegato", senza sigla; la copertina è anche la miniatura).
// Stesso stile della Parte 1 (notte al neon anni '80, 1955 come cartolina anni '50) e lo stesso cartellino «PARTE N».
// Al centro l'almanacco sportivo, dorato, che fluttua e brilla; dietro, Hill Valley divisa in due da una crepa: a sinistra la
// piazza con la torre dell'orologio stampata come una cartolina, a destra il casinò di Biff al neon rosso nello stesso
// punto (il 1985 alternativo). Due scie gialle tratteggiate escono dal libro. Niente persone, l'auto del film o loghi.
// Il fotogramma 0 è già completo; le pagine si sfogliano e a 2,5 s il casinò lampeggia.
// Finale: la crepa si richiude, l'almanacco è cenere su un piccolo fuoco, resta solo la torre.

const DARK = '#0E0A22';
const SEP = P55.ink;
const r = rng(1989);
const SPARKS = Array.from({ length: 24 }, () => ({ x: r() * 1080, y: 700 + r() * 900, v: 20 + r() * 40, s: 2 + r() * 3, ph: r() }));

const Art: React.FC<{ t: number; id: string; calm?: number }> = ({ t, id, calm = 0 }) => {
  const L = (f: number) => `translate(${Math.sin(t * 0.3) * 10 * f} 0)`;
  const blink = calm ? 0.3 : 0.6 + 0.4 * (Math.sin(t * 5) > -0.2 ? 1 : 0) * (t > 2.5 && t < 2.9 ? 0.3 : 1);
  const crack = calm ? 0 : 1;
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
        <linearGradient id={`${id}-court`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F3E6C8" />
          <stop offset="1" stopColor="#D9BE8C" />
        </linearGradient>
        <linearGradient id={`${id}-road`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24124A" />
          <stop offset="1" stopColor="#0C0820" />
        </linearGradient>
        <clipPath id={`${id}-left`}><path d={calm ? 'M0 0 H1080 V1920 H0 Z' : 'M0 0 H540 L540 780 L560 900 L520 1100 L550 1340 H0 Z'} /></clipPath>
        <clipPath id={`${id}-right`}><path d="M540 0 H1080 V1340 H550 L520 1100 L560 900 L540 780 Z" /></clipPath>
      </defs>
      <rect width="1080" height="1920" fill={`url(#${id}-sky)`} />
      <g transform={L(0.2)}>
        <Stars t={t} seed={19} n={40} x={0} y={600} w={1080} h={500} color={INK} />
      </g>
      {/* a sinistra la piazza del 1955, cartolina crema; a destra il casinò al neon rosso nello stesso posto */}
      <g transform={L(0.5)} strokeLinejoin="round" strokeLinecap="round">
        <g clipPath={`url(#${id}-left)`}>
          <Glow id={`${id}-tw`} x={360} y={880} r={240} t={t} color="#FFD98A" amp={0.06} rate={2} opacity={0.3} />
          <path d="M290 1080 V820 H430 V1080" fill={`url(#${id}-court)`} stroke={SEP} strokeWidth="8" />
          <path d="M276 820 L360 752 L444 820 Z" fill="#E0C796" stroke={SEP} strokeWidth="8" />
          <path d="M360 752 V724" stroke={SEP} strokeWidth="6" />
          <circle cx="360" cy="900" r="52" fill="#F3EBD2" stroke={SEP} strokeWidth="7" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 -44 V-37" stroke={SEP} strokeWidth="4" transform={`translate(360 900) rotate(${i * 30})`} />)}
          <path d="M0 4 V-26" stroke={SEP} strokeWidth="7" strokeLinecap="round" transform="translate(360 900) rotate(302)" />
          <path d="M0 4 V-38" stroke={SEP} strokeWidth="5" strokeLinecap="round" transform="translate(360 900) rotate(24)" />
          <path d="M60 1300 V1100 H700 V1300 Z" fill={`url(#${id}-court)`} stroke={SEP} strokeWidth="8" />
          <path d="M40 1100 L360 1040 L720 1100 Z" fill="#E0C796" stroke={SEP} strokeWidth="8" />
          {[110, 190, 270, 450, 530, 610].map((x) => <path key={x} d={`M${x} 1116 V1288`} stroke={SEP} strokeWidth="10" />)}
          <path d="M300 1290 V1210 Q360 1170 420 1210 V1290" fill="#6B5240" stroke={SEP} strokeWidth="7" />
        </g>
        {!calm && (
          <g clipPath={`url(#${id}-right)`}>
            <Glow id={`${id}-cg`} x={760} y={900} r={360} t={t} color={PALT.ink} amp={0.1} rate={4} opacity={0.45 * blink} />
            <path d="M580 1320 V880 Q580 820 640 810 H880 Q940 820 940 880 V1320 Z" fill={PALT.fill} stroke={PALT.ink} strokeWidth="8" />
            {Array.from({ length: 7 }, (_, r2) => Array.from({ length: 4 }, (_, k) => (
              <rect key={`${r2}${k}`} x={610 + k * 80} y={900 + r2 * 56} width="50" height="32" rx="4" fill={(r2 + k) % 3 ? PALT.win2 : PALT.warm} opacity={(r2 + k) % 3 ? 0.7 : 0.5 + 0.3 * Math.sin(t * 2 + r2 + k)} />
            )))}
            <rect x="620" y="742" width="290" height="60" rx="12" fill={PALT.dark} stroke={PALT.ink} strokeWidth="5" />
            <text x="765" y="786" textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="42" letterSpacing="6" fill={PALT.ink} opacity={blink}>CASINÒ</text>
          </g>
        )}
        {/* la crepa tra le due città */}
        {crack > 0 && <path d="M540 780 L560 900 L520 1100 L550 1340" fill="none" stroke={YEL} strokeWidth="6" strokeDasharray="18 12" strokeDashoffset={-t * 60} />}
      </g>
      {/* la strada al neon */}
      <path d="M0 1340 H1080 V1920 H0 Z" fill={`url(#${id}-road)`} />
      <path d="M0 1340 H1080" stroke={P85.ink} strokeWidth="6" />
      {[1380, 1440, 1530, 1660, 1840].map((y) => <path key={y} d={`M0 ${y} H1080`} stroke={P85.warm} strokeWidth="3" opacity=".45" />)}
      {[-3, -1.6, 1.6, 3].map((k) => <path key={k} d={`M${540 + k * 60} 1342 L${540 + k * 330} 1920`} stroke={P85.warm} strokeWidth="5" opacity=".7" />)}
      {/* l'almanacco che fluttua, con le scie gialle */}
      {!calm && [0, 1].map((k) => {
        const d = k ? 'M600 1200 C800 1120 960 1000 900 860' : 'M480 1200 C280 1140 140 1020 200 880';
        return (
          <g key={k}>
            <path d={d} fill="none" stroke={YEL} strokeWidth="40" opacity=".14" strokeLinecap="round" />
            <path d={d} fill="none" stroke={DARK} strokeWidth="20" opacity=".5" strokeLinecap="round" />
            <path d={d} fill="none" stroke={YEL} strokeWidth="14" strokeDasharray="44 28" strokeDashoffset={-t * 180 - k * 30} strokeLinecap="round" />
          </g>
        );
      })}
      {calm ? (
        <g>
          <Fire id={`${id}-f`} t={t} x={540} y={1330} scale={0.55} outline={SEP} />
          <ellipse cx="540" cy="1336" rx="90" ry="14" fill="#2A1A10" />
        </g>
      ) : (
        <g transform={`translate(540 ${1200 + Math.sin(t * 1.6) * 12}) rotate(${Math.sin(t * 1.1) * 4})`}>
          <Almanac T={t} s={1.6} />
        </g>
      )}
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
        fontFamily: RIGHTEOUS, fontSize: 52, lineHeight: 1, letterSpacing: '0.12em', color: P.accento, boxShadow: '0 0 24px rgba(92,240,255,.55)' }}>PARTE 2</div>
      <p style={{ margin: '14px 0 0', fontSize: 30, fontWeight: 800, color: '#B5CBE2', textShadow: `0 3px 0 ${P.scuro}` }}>un film di {film.regista} · {film.anno}</p>
    </div>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, film }) => {
  const P = film.palette;
  const k = eo(seg(t, 0.4, 0.7));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Art t={t} id="r2c" />
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
      <Art t={t + 4} id="r2e" calm={1} />
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
