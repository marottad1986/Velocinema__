import React from 'react';
import { camera, eo, eob, lerp, mod, seg } from '../../lib/anim';
import { DISPLAY, SANS, STENCIL } from '../../lib/fonts';
import { Finish, FxDefs, Lin, Mono, MonoDefs } from '../../lib/fx';
import { Glow, NearMotes, Smoke, Stars } from '../../lib/elements';
import { Speciale } from '../../components/Speciale';
import type { PosterProps } from '../../types';
import { BBDefs } from '../breaking-bad-stagione-1/Comuni';
import { BB2Defs, K, Occhio, Orsacchiotto, Piscina } from './Comuni';

// Copertina e finale di Breaking Bad, stagione 2. Locandina originale: niente persone, niente logo con i simboli della
// tavola periodica, niente locandina ufficiale. Copertina: il giardino di Walter in bianco e nero argentato, come gli
// anticipi della stagione (piscina, steccato, palma, rottami fumanti, colonne di fumo nel cielo); l'unico colore è il rosa
// dell'orsacchiotto bruciato che galleggia a faccia in giù, con il suo occhio di vetro sul fondo. Finale: la stessa piscina
// di notte, a colori, con l'acqua illuminata e l'occhio che brilla sul bordo.

/** Rottame contorto (lamiera d'aereo) che fuma sul prato. */
const Rottame: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeLinejoin="round">
    <path d="M-90 0 L-70 -60 Q-20 -90 40 -70 L96 -40 L80 0 Z" fill="#C8CCD0" stroke={K} strokeWidth="7" />
    <path d="M-70 -60 L-40 -10 M40 -70 L20 -4" stroke="#7A8088" strokeWidth="4" />
    {[-56, -24, 10, 44].map((rx) => <circle key={rx} cx={rx} cy={-40 + (rx % 3) * 4} r="4" fill="#5A6068" />)}
    <path d="M-90 0 L-70 -60" stroke="#FFFFFF" strokeWidth="3" opacity=".5" />
    <path d="M20 -66 Q50 -60 70 -34" stroke="#2A2A2A" strokeWidth="10" opacity=".55" />
  </g>
);

/** Colonna di fumo nero che sale dai rottami: sbuffi morbidi (gradiente radiale) sparsi lungo una curva, sempre più
 *  larghi verso l'alto, che salgono lentamente. Posizioni da un seme fisso. */
export const PUFFS = Array.from({ length: 44 }, (_, i) => ({ f: i / 44, dx: Math.sin(i * 12.9898) * 0.5, dr: 0.7 + 0.6 * Math.abs(Math.sin(i * 78.233)), tone: i % 3 }));
export const Colonna: React.FC<{ id: string; x: number; y: number; h: number; t: number; w?: number }> = ({ id, x, y, h, t, w = 1 }) => (
  <g>
    {PUFFS.map((p, i) => {
      const ph = mod(t * 0.05 + p.f, 1);
      const yy = y - ph * h, r = (36 + 130 * ph) * w * p.dr;
      const xx = x + Math.sin(ph * 3.2 + 0.5) * 50 * w + ph * ph * 110 * w + p.dx * r;
      return <circle key={i} cx={xx} cy={yy} r={r} fill={`url(#${id}-puff${p.tone})`} opacity={Math.min(1, (1 - ph) * 2.5)} />;
    })}
  </g>
);

const Giardino: React.FC<{ id: string; t: number; dur: number; night: boolean }> = ({ id, t, dur, night }) => {
  const cam = camera(t, dur, 540, 1250);
  const L = cam.layer;
  const mono = night ? 0 : 1;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <BBDefs id={id} />
        <BB2Defs id={id} />
        <MonoDefs id={id} amount={mono} />
        <Lin id={`${id}-sky`} stops={night ? [[0, '#03050C'], [0.45, '#0C1430'], [0.6, '#1E2A4A'], [0.66, '#2A3456']] : [[0, '#5A6A7A'], [0.35, '#A8B4BC'], [0.55, '#E8E2D4'], [0.62, '#F4EEE0']]} />
        <Lin id={`${id}-lawn`} stops={night ? [[0, '#14221C'], [1, '#08100C']] : [[0, '#6A8A4A'], [1, '#2A3E20']]} />
        <Lin id={`${id}-fence`} x2={1} y2={0} stops={night ? [[0, '#2A2420'], [1, '#14100E']] : [[0, '#B8946A'], [1, '#7A5A3A']]} />
        {['#1E1E22', '#3A3A3E', '#5A5A60'].map((c, k) => (
          <radialGradient key={k} id={`${id}-puff${k}`}><stop offset="0" stopColor={c} stopOpacity=".95" /><stop offset=".6" stopColor={c} stopOpacity=".7" /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient>
        ))}
        <Lin id={`${id}-wnight`} stops={[[0, '#3ACAE8'], [0.5, '#1E90C8'], [1, '#0E4A86']]} />
      </defs>
      <g transform={cam.transform}>
        <Mono id={id} amount={mono}>
          {/* cielo con le colonne di fumo dello schianto (ai lati, lontano dal titolo) */}
          <g transform={L(0.2)}>
            <rect x="-200" y="-200" width="1480" height="2400" fill={`url(#${id}-sky)`} />
            {night ? <Stars t={t} seed={23} n={80} y={0} h={1000} color="#E8EEF8" size={2.6} /> : (
              <>
                <Glow id={`${id}-sun`} x={300} y={820} r={420} t={t} color="#FFFFFF" amp={0.03} rate={0.8} opacity={0.5} />
                <Colonna id={id} x={900} y={980} h={1000} t={t} w={1} />
                <Colonna id={id} x={110} y={1000} h={420} t={t} w={0.6} />
              </>
            )}
          </g>
          {/* tetti e montagne lontane */}
          <g transform={L(0.35)}>
            <path d="M-200 960 L40 880 L260 920 L520 850 L760 900 L1000 860 L1280 910 V1000 H-200 Z" fill={night ? '#10141E' : '#6A6E74'} />
            {[[-60, 940], [200, 950], [420, 935], [700, 950], [960, 940]].map(([hx, hy], i) => (
              <path key={i} d={`M${hx} ${hy + 40} L${hx + 90} ${hy} L${hx + 180} ${hy + 40} Z`} fill={night ? '#181C26' : '#8A8A86'} />
            ))}
            {!night && <Smoke id={`${id}-sm1`} t={t} x={890} y={980} color="#4A4A4E" n={5} rise={260} wind={40} r0={40} r1={120} speed={0.25} opacity={0.6} />}
          </g>
          {/* steccato di legno, palma, sdraio */}
          <g transform={L(0.55)}>
            <path d="M-200 1000 H1280 V1100 H-200 Z" fill={`url(#${id}-lawn)`} />
            {Array.from({ length: 22 }, (_, i) => (
              <g key={i}>
                <path d={`M${-180 + i * 70} 1060 V900 L${-145 + i * 70} 880 L${-110 + i * 70} 900 V1060 Z`} fill={`url(#${id}-fence)`} stroke={K} strokeWidth="4" />
              </g>
            ))}
            <path d="M-200 940 H1280 M-200 1020 H1280" stroke={night ? '#0E0A08' : '#5A3E24'} strokeWidth="10" />
            {/* palma a sinistra */}
            <path d="M60 1060 Q40 880 90 700" stroke={night ? '#1A1410' : '#6A4A2A'} strokeWidth="30" fill="none" />
            {[-150, -110, -60, -10, 40, 90].map((a, i) => (
              <path key={i} d={`M90 700 q${Math.cos((a * Math.PI) / 180) * 120} ${Math.sin((a * Math.PI) / 180) * 120 - 20} ${Math.cos((a * Math.PI) / 180) * 220} ${Math.sin((a * Math.PI) / 180) * 160 + 60}`}
                stroke={night ? '#0E1A12' : '#3A5A2A'} strokeWidth="34" fill="none" strokeLinecap="round" transform={`rotate(${Math.sin(t * 0.8 + i) * 2} 90 700)`} />
            ))}
          </g>
          {/* prato davanti con la piscina */}
          <g transform={L(0.75)}>
            <path d="M-200 1060 H1280 V2200 H-200 Z" fill={`url(#${id}-lawn)`} />
            {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${-150 + (i * 53) % 1400} ${1080 + (i * 97) % 900} l6 -18 l6 18`} stroke={night ? '#1E3226' : '#8AA86A'} strokeWidth="4" fill="none" />)}
            <Rottame x={110} y={1120} s={0.8} rot={-8} />
            <Rottame x={980} y={1840} s={1.3} rot={14} />
            {!night && <Smoke id={`${id}-sm2`} t={t} x={120} y={1080} color="#5A5A5E" n={5} rise={150} wind={-60} r0={20} r1={70} speed={0.35} opacity={0.65} />}
            <Piscina id={id} t={t} top={1070} bot={1800}
              bottom={night ? undefined : <Occhio id={id} x={330} y={1600} r={30} t={t} glint={0.6} look={2} />} />
            {night && <Glow id={`${id}-poolg`} x={540} y={1450} r={560} t={t} color="#7AE0FF" amp={0.05} rate={1} opacity={0.4} />}
          </g>
        </Mono>
        {/* l'unico colore: l'orsacchiotto rosa (copertina) — di notte l'occhio sul bordo */}
        <g transform={L(0.75)}>
          {!night && (
            <>
              {[0, 1, 2].map((k) => {
                const p = mod(t * 0.45 + k / 3, 1);
                return <ellipse key={k} cx={560} cy={1240} rx={200 + 260 * p} ry={60 + 80 * p} fill="none" stroke="#E8F4F8" strokeWidth={6 * (1 - p)} opacity={0.7 * (1 - p)} />;
              })}
              <Orsacchiotto id={id} x={560} y={1210} s={0.78} rot={-24} t={t} />
            </>
          )}
          {night && <Occhio id={id} x={780} y={1170} r={30} t={t} glint={1} look={0.6} />}
        </g>
        <g transform={L(1.6)}>
          <NearMotes id={`${id}-near`} t={t} color={night ? '#C8D4F0' : '#C8C8C8'} n={6} r0={60} r1={150} opacity={0.12} vy={-20} />
          {/* cenere che scende */}
          {!night && Array.from({ length: 14 }, (_, i) => {
            const y = mod(i * 151 + t * (40 + i * 4), 1400) + 500;
            return <rect key={i} x={mod(i * 211 + Math.sin(t + i) * 30, 1080)} y={y} width="8" height="5" fill="#2A2A2A" opacity=".55" transform={`rotate(${t * 60 + i * 30} ${mod(i * 211, 1080)} ${y})`} />;
          })}
        </g>
      </g>
      <Finish id={id} tint={night ? '#142235' : '#3A3A40'} tintOpacity={night ? 0.12 : 0.08} />
    </svg>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  // fotogramma 0 = miniatura: etichetta, titolo e regista già al loro posto; solo la frase di lancio entra dopo
  const line = eo(seg(t, 0.4, 0.7));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Giardino id="bc" t={t} dur={dur} night={false} />
      <div style={{ position: 'absolute', left: 120, top: 290, width: 840, fontFamily: SANS, color: P.chiaro }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: '#FFFFFF', textShadow: `0 2px 0 ${P.scuro}, 0 0 18px ${P.scuro}` }}>STAGIONE {film.stagione} IN 2 MINUTI<Speciale nome={film.copertina.speciale} scale={eob(seg(t, 0.4, 0.8), 1.6)} /></p>
        <h1 style={{ margin: '10px 0 0', fontFamily: STENCIL, fontWeight: 800, fontSize: 220, lineHeight: 0.88, letterSpacing: '0.02em', color: P.accento,
          textShadow: `0 6px 0 ${P.scuro}, 0 0 30px ${P.scuro}99` }}>
          BREAKING<br />BAD
        </h1>
        <p style={{ margin: '20px 0 0', fontSize: 40, fontWeight: 800, color: '#FFFFFF', textShadow: `0 3px 0 ${P.scuro}, 0 0 16px ${P.scuro}` }}>una serie di {film.regista} · stagione {film.stagione}</p>
      </div>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, fontSize: 36, fontWeight: 800, textAlign: 'center',
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
      <Giardino id="bf" t={t} dur={dur} night />
      <div style={{ position: 'absolute', left: 120, top: 300, width: 840, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con la serie che vorresti.</p>
        <p style={{ margin: '14px 0 0', fontSize: 26, fontWeight: 400, opacity: 0.8 * seg(t, 1.2, 1.6) }}>Le spiegazioni complete sono su YouTube</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 760, margin: 0, textAlign: 'center', fontFamily: STENCIL, fontWeight: 800, fontSize: 110, lineHeight: 1,
        color: P.accento, textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        FINE DELLA<br />STAGIONE {film.stagione}
      </h1>
    </div>
  );
};
