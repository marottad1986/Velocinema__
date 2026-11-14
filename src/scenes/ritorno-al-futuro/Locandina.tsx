import React from 'react';
import { eo, eob, mod, rng, seg } from '../../lib/anim';
import { DISPLAY, HAND, RIGHTEOUS, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Glow, Stars } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { INK, Skate, TimeCar, YEL } from './Linee';

// Copertina e finale di Ritorno al futuro (formato "spiegato", senza sigla: la copertina dura 4 s ed è anche la miniatura).
// Locandina originale, niente persone, niente auto del film né logo ufficiale. Di notte, sopra la piazza di una città anni
// '50, la torre dell'orologio viene colpita da un fulmine; dietro, nel cielo, un enorme quadrante con le lancette che
// girano all'indietro. Dal fulmine il cavo scende fino alla strada, dove un'auto generica (la stessa dello schema) parte
// lasciando due scie gialle tratteggiate (il viaggio nel tempo) che salgono e si avvolgono attorno al quadrante.
// In basso a sinistra una foto di famiglia in cui il cerchio di Marty sbiadisce. Il fotogramma 0 è già completo
// (titolo, torre, fulmine acceso, scie): nessuna dissolvenza dal nero. Il fulmine scocca di nuovo a 2,5 s.
// Piani: cielo e quadrante (0,2) · tribunale e torre (0,5) · strada e auto (0,8) · foto e particelle (1,2–1,6)

const DARK = '#081628';
const WARM = '#FFD98A';
const DIM = '#86A3C4';
const r = rng(1955);
const SPARKS = Array.from({ length: 26 }, () => ({ x: r() * 1080, y: 700 + r() * 900, v: 20 + r() * 40, s: 2 + r() * 3, ph: r() }));

const Bolt: React.FC<{ k: number }> = ({ k }) => {
  if (k <= 0.01) return null;
  const d = 'M1010 690 L930 712 L960 724 L830 730 L860 742 L700 744 L726 756 L548 756';
  return (
    <g opacity={k}>
      <path d={d} fill="none" stroke="#BFE6FF" strokeWidth="44" opacity=".35" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#FFFFFF" strokeWidth="14" strokeLinejoin="round" />
      <path d="M830 730 L780 706 L750 722" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinejoin="round" />
    </g>
  );
};

const Art: React.FC<{ t: number; id: string; calm?: number }> = ({ t, id, calm = 0 }) => {
  // fulmine acceso al fotogramma 0, si spegne in 0,6 s; secondo colpo a 2,5 s (mai più di due lampi)
  const bolt = calm ? 0 : Math.max(1 - seg(t, 0.25, 0.75), seg(t, 2.5, 2.55) * (1 - seg(t, 2.7, 3.2)));
  const flash = calm ? 0 : seg(t, 2.5, 2.55) * (1 - seg(t, 2.6, 3.0));
  const surge = calm ? 0.2 : Math.max(bolt, 0.25);
  const drive = calm ? 0 : Math.sin(t * 1.4) * 6;
  const L = (f: number) => `translate(${Math.sin(t * 0.3) * 10 * f} ${(1 - f) * 0})`;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#061226" />
          <stop offset=".35" stopColor="#0F2C55" />
          <stop offset=".6" stopColor="#1E4A80" />
          <stop offset="1" stopColor="#13335C" />
        </linearGradient>
        <linearGradient id={`${id}-court`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2E5E92" />
          <stop offset="1" stopColor="#1A3E6A" />
        </linearGradient>
        <linearGradient id={`${id}-road`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14304F" />
          <stop offset="1" stopColor="#0A1A30" />
        </linearGradient>
        <pattern id={`${id}-grid`} width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0 H0 V40" fill="none" stroke="#3468A2" strokeWidth="1" /></pattern>
      </defs>
      <rect width="1080" height="1920" fill={`url(#${id}-sky)`} />
      <rect width="1080" height="1920" fill={`url(#${id}-grid)`} opacity=".22" />
      {/* cielo: stelle e il grande quadrante con le lancette che girano all'indietro */}
      <g transform={L(0.2)}>
        <Stars t={t} seed={9} n={40} x={0} y={640} w={1080} h={500} color={INK} />
        <g transform="translate(540 930)" opacity=".85">
          <Glow id={`${id}-dg`} x={0} y={0} r={460} t={t} color="#6FB0FF" amp={0.05} rate={1.5} opacity={0.35} />
          <circle r="380" fill="none" stroke={INK} strokeWidth="5" opacity=".4" />
          <circle r="350" fill="none" stroke={INK} strokeWidth="2" opacity=".3" />
          {Array.from({ length: 60 }, (_, i) => <path key={i} d={`M0 -350 V${i % 5 ? -338 : -316}`} stroke={INK} strokeWidth={i % 5 ? 2 : 6} opacity=".45" transform={`rotate(${i * 6})`} />)}
          {['XII', 'III', 'VI', 'IX'].map((n, i) => <text key={n} x={Math.sin((i * Math.PI) / 2) * 280} y={-Math.cos((i * Math.PI) / 2) * 280 + 18} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize="48" fill={INK} opacity=".35">{n}</text>)}
          <path d="M0 20 V-300" stroke={INK} strokeWidth="10" strokeLinecap="round" opacity=".55" transform={`rotate(${40 - t * 90})`} />
          <path d="M0 20 V-210" stroke={INK} strokeWidth="16" strokeLinecap="round" opacity=".55" transform={`rotate(${-70 - t * 15})`} />
          {/* frecce che girano all'indietro lungo il bordo */}
          <path d="M-262 -262 A370 370 0 0 1 262 -262" fill="none" stroke={YEL} strokeWidth="6" strokeDasharray="20 16" strokeDashoffset={t * 60} opacity=".8" />
          <path d="M-290 -232 L-262 -262 L-232 -238" fill="none" stroke={YEL} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
        </g>
        {[[150, 760], [900, 690], [780, 820]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x + Math.sin(t * 0.3 + i) * 12} ${y})`} opacity=".8">
            <path d="M-130 30 Q-150 -16 -84 -20 Q-66 -66 0 -56 Q50 -84 92 -34 Q150 -34 140 30 Z" fill="#244A78" stroke="#4B78AA" strokeWidth="3" />
          </g>
        ))}
      </g>
      <Bolt k={bolt} />
      {/* il tribunale con la torre dell'orologio */}
      <g transform={L(0.5)} strokeLinejoin="round" strokeLinecap="round">
        <Glow id={`${id}-tw`} x={540} y={910} r={240} t={t} color={bolt > 0.2 ? '#DDF0FF' : WARM} amp={0.06} rate={2} opacity={0.35 + 0.4 * bolt} />
        <g transform="translate(0 50)">
        <path d="M470 1080 V800 H610 V1080" fill={`url(#${id}-court)`} stroke={INK} strokeWidth="8" />
        <path d="M456 800 L540 732 L624 800 Z" fill="#1A3E6A" stroke={INK} strokeWidth="8" />
        <path d="M540 732 V704" stroke={INK} strokeWidth="6" />
        <circle cx="540" cy="880" r="56" fill="#F3EBD2" stroke={INK} strokeWidth="7" />
        {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 -48 V-40" stroke={DARK} strokeWidth="4" transform={`translate(540 880) rotate(${i * 30})`} />)}
        <path d="M0 4 V-28" stroke={DARK} strokeWidth="7" strokeLinecap="round" transform="translate(540 880) rotate(302)" />
        <path d="M0 4 V-42" stroke={DARK} strokeWidth="5" strokeLinecap="round" transform="translate(540 880) rotate(24)" />
        </g>
        <path d="M150 1300 V1100 H930 V1300 Z" fill={`url(#${id}-court)`} stroke={INK} strokeWidth="8" />
        <path d="M130 1100 L540 1030 L950 1100 Z" fill="#1A3E6A" stroke={INK} strokeWidth="8" />
        {[210, 300, 390, 690, 780, 870].map((x) => <path key={x} d={`M${x} 1116 V1288`} stroke={INK} strokeWidth="10" />)}
        <path d="M430 1290 V1210 Q540 1150 650 1210 V1290" fill="#0C2140" stroke={INK} strokeWidth="7" />
        {[1300, 1318, 1336].map((y, i) => <path key={y} d={`M${120 - i * 20} ${y} H${960 + i * 20}`} stroke={INK} strokeWidth="5" />)}
      </g>
      {/* il cavo dalla torre alla strada, con la scarica */}
      <path d="M590 930 Q760 1040 930 1150" fill="none" stroke={surge > 0.5 ? '#FFFFFF' : INK} strokeWidth={surge > 0.5 ? 9 : 5} />
      <path d="M590 930 Q760 1040 930 1150" fill="none" stroke="#BFE6FF" strokeWidth="26" opacity={0.35 * surge} />
      <path d="M930 1150 V1380 M908 1380 H952" stroke={INK} strokeWidth="8" strokeLinecap="round" />
      <path d="M906 1150 H954 L944 1122 H916 Z" fill={WARM} stroke={INK} strokeWidth="4" />
      {/* la strada, le scie gialle del viaggio e l'auto */}
      <path d="M0 1340 H1080 V1920 H0 Z" fill={`url(#${id}-road)`} />
      <path d="M0 1340 H1080" stroke={INK} strokeWidth="6" />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${mod(i * 220 - t * 300 * (1 - calm), 1320) - 120} 1500 h110`} stroke={DIM} strokeWidth="8" />)}
      <g transform={L(0.8)}>
        {[0, 1].map((k) => {
          const d = k ? 'M320 1330 C140 1330 60 1200 130 1070 C200 960 160 860 280 790' : 'M320 1306 C100 1296 -20 1120 70 960 C130 880 130 800 200 730';
          return (
            <g key={k} opacity={calm ? 0.55 : 1}>
              <path d={d} fill="none" stroke={YEL} strokeWidth="40" opacity=".14" strokeLinecap="round" />
              <path d={d} fill="none" stroke={YEL} strokeWidth="14" strokeDasharray="44 28" strokeDashoffset={-t * 180 - k * 30} strokeLinecap="round" />
            </g>
          );
        })}
        <g transform={`translate(${590 + drive} 1305)`}><TimeCar T={t} glow={0.6 + 0.4 * surge} s={2.1} flip pole /></g>
      </g>
      {/* scintille che salgono dall'auto */}
      {SPARKS.map((p, i) => {
        const y = p.y - mod(t * p.v + p.ph * 600, 600);
        return <circle key={i} cx={p.x + Math.sin(t * 2 + i) * 14} cy={y} r={p.s} fill={i % 3 ? YEL : INK} opacity={0.15 + 0.35 * (0.5 + 0.5 * Math.sin(t * 3 + i))} />;
      })}
      {/* la foto di famiglia, in primo piano: il cerchio di Marty sbiadisce */}
      <g transform={`translate(228 1175) rotate(-9) scale(0.6)`}>
        <rect x="-128" y="-108" width="256" height="226" fill="#000" opacity=".4" transform="translate(8 10)" />
        <rect x="-128" y="-108" width="256" height="226" fill="#F4EEDC" stroke={INK} strokeWidth="5" />
        <rect x="-112" y="-92" width="224" height="150" fill="#5D88B4" />
        <path d="M-112 30 Q-40 0 40 24 Q80 34 112 20 V58 H-112 Z" fill="#4C7A4E" />
        {[-70, 0, 70].map((x, i) => (
          <g key={i} transform={`translate(${x} -20)`} opacity={calm ? 1 : i === 2 ? 0.35 + 0.25 * Math.sin(t * 2) : i === 1 ? 0.8 : 1}>
            <circle r="30" fill="#143A66" stroke={INK} strokeWidth="3.5" />
            {i === 0 && <path d="M-18 6 Q-18 -16 0 -16 Q18 -16 18 6 Z M10 6 H28" fill="#D9483A" stroke={INK} strokeWidth="3" />}
            {i === 1 && <path d="M-16 -8 L0 0 L-16 8 Z M16 -8 L0 0 L16 8 Z" fill="#F2C94C" stroke={INK} strokeWidth="3" />}
            {i === 2 && <Skate T={t} s={0.5} />}
          </g>
        ))}
        <text y="94" textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize="30" fill="#2A3A4A">noi tre</text>
      </g>
      {flash > 0 && <rect width="1080" height="1920" fill="#DDEFFF" opacity={0.3 * flash} />}
      <Finish id={id} tint="#142848" tintOpacity={0.1} />
    </svg>
  );
};

const TitleBlock: React.FC<{ film: PosterProps['film'] }> = ({ film }) => {
  const P = film.palette;
  return (
    <div style={{ position: 'absolute', left: 120, top: 268, width: 840, fontFamily: SANS, textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.accento, textShadow: `0 3px 0 ${P.scuro}` }}>SPIEGATO SEMPLICE · FILM</p>
      <h1 style={{ margin: '10px 0 0', fontFamily: RIGHTEOUS, fontWeight: 400, fontSize: 150, lineHeight: 0.98, color: P.chiaro, textShadow: `0 8px 0 ${P.scuro}, 0 0 40px rgba(111,176,255,.45)` }}>
        RITORNO<br />AL FUTURO
      </h1>
      <p style={{ margin: '14px 0 0', fontSize: 30, fontWeight: 800, color: '#B5CBE2', textShadow: `0 3px 0 ${P.scuro}` }}>un film di {film.regista} · {film.anno}</p>
    </div>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, film }) => {
  const P = film.palette;
  const k = eo(seg(t, 0.4, 0.7));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Art t={t} id="rc" />
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
      <Art t={t + 4} id="re" calm={1} />
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

