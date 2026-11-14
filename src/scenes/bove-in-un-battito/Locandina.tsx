import React from 'react';
import { Img, staticFile } from 'remotion';
import { camera, eo, eob, lerp, seg } from '../../lib/anim';
import { ANTON, DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Beam, Glow, NearMotes } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { Ball, Crowd, FloodTower, GIALLO, GIALLOROSSO, HeartLine, K, Pitch, VIOLA, WATFORD, heartPath } from './Comuni';
import { Battito } from './Battito';

// Copertina e finale della storia di Edoardo Bove (speciale con Mr.goal). Locandina originale: niente locandina del
// documentario, niente foto, nessuna persona riconoscibile. Copertina (è anche la miniatura: completa dal fotogramma 0):
// uno stadio di notte pieno di tifosi nei colori delle sue tre squadre, il pallone sul dischetto e, sopra il campo, una
// grande linea gialla di battito che pulsa; etichetta «LA STORIA IN 2 MINUTI», bollino «In 2 minuti × Mr.goal» (campo
// `copertina.collab`), titolo «EDOARDO BOVE». Finale: lo stadio all'alba con la linea del battito, «Segui le due pagine».

/** Il nostro segno: cronometro con «2'». */
const Cronometro: React.FC<{ size: number; color?: string; ink?: string }> = ({ size, color = GIALLO, ink = '#14100C' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
    <rect x="42" y="2" width="16" height="12" rx="3" fill={color} stroke={ink} strokeWidth="5" />
    <path d="M76 18 l8 -8" stroke={ink} strokeWidth="7" strokeLinecap="round" />
    <circle cx="50" cy="56" r="38" fill={color} stroke={ink} strokeWidth="7" />
    <text x="50" y="72" textAnchor="middle" fontFamily={ANTON} fontSize="44" fill={ink}>2'</text>
  </svg>
);

/** Bollino della collaborazione: cronometro + «In 2 minuti» × logo di Mr.goal (usato così com'è, alla pari). */
export const Collab: React.FC<{ nome?: string; scale?: number; opacity?: number }> = ({ nome, scale = 1, opacity = 1 }) =>
  nome ? (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, padding: '10px 22px 10px 14px', borderRadius: 999, background: '#F2EEE6',
      boxShadow: '0 4px 0 #0A0B12, 0 0 0 3px #0A0B12', transform: `scale(${scale})`, transformOrigin: 'left center', opacity }}>
      <Cronometro size={58} />
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: '#14100C', letterSpacing: '0.01em' }}>In 2 minuti</span>
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: '#5A5650' }}>×</span>
      <Img src={staticFile('collab/mrgoal-scritta.png')} style={{ height: 62, width: 'auto', display: 'block' }} />
    </div>
  ) : null;

const Stadio: React.FC<{ id: string; t: number; dur: number }> = ({ id, t, dur }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  // un battito ogni 0,83 s (72 bpm): il picco della linea si alza e l'alone pulsa
  const BT = 60 / 72; const ph = ((((t - 4 + 0.15 * BT) % BT) + BT) % BT) / BT; // in fase con i colpi dello spartito (T.roma - k battiti)
  const beat = Math.exp(-((ph - 0.15) ** 2) * 60);
  const run = (t * 0.45) % 1; // la luce che corre lungo la linea
  const shirts = [VIOLA, GIALLOROSSO.rosso, WATFORD.giallo, '#F2EEE6', '#2A2A34', VIOLA, WATFORD.giallo];
  const scarves = [[VIOLA, '#F2EEF8'], [GIALLOROSSO.rosso, GIALLOROSSO.giallo], [WATFORD.giallo, WATFORD.nero, WATFORD.rosso]];
  const HY = 1000;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <Lin id={`${id}-sky`} stops={[[0, '#05060C'], [0.5, '#0E0E1E'], [1, '#1E1A34']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill={`url(#${id}-sky)`} />
          <path d="M-200 790 Q540 830 1280 790 V850 H-200 Z" fill="#06060C" />
          {Array.from({ length: 9 }, (_, i) => {
            const x = -80 + i * 155, y = 846 + Math.sin((i / 8) * Math.PI) * 14;
            return (
              <g key={i}>
                <Glow id={`${id}-l${i}`} x={x} y={y} r={90} t={t} color="#FFF6DC" amp={0.04} rate={2.4} ph={i} opacity={0.75} />
                <rect x={x - 26} y={y - 10} width="52" height="20" rx="5" fill="#FFFBEA" stroke={K} strokeWidth="4" />
              </g>
            );
          })}
        </g>
        <g transform={L(0.4)}>
          <rect x="-200" y="856" width="1480" height="330" fill="#14121C" />
          <Crowd t={t} y1={890} y0={1150} rows={11} shirts={shirts} scarves={scarves} seed={99} size0={8} size1={14} scarfUp={1} flashes={0.8} bounce={0.15} backdrop="#14121C" />
          <rect x="-200" y="1176" width="1480" height="30" fill="#1E1A2A" />
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-190 + i * 190} y="1180" width="182" height="22" fill={[VIOLA, GIALLOROSSO.rosso, '#C8A814'][i % 3]} opacity=".85" />)}
        </g>
        <g transform={L(0.55)}>
          {[[30, 1200], [1050, 1200]].map(([x, y], i) => (
            <g key={i}>
              <Glow id={`${id}-fl${i}`} x={x} y={y - 470} r={200} t={t} color="#FFF6D8" amp={0.04} rate={2.5} ph={i} opacity={0.8} />
              <FloodTower x={x} y={y} h={500} s={0.75} />
            </g>
          ))}
          <Beam id={`${id}-b1`} x={60} y={760} t={t} length={900} spread={400} color="#FFF6DC" angle={62} sweep={1.5} opacity={0.16} />
          <Beam id={`${id}-b2`} x={1020} y={760} t={t} length={900} spread={400} color="#FFF6DC" angle={118} sweep={1.5} opacity={0.16} />
        </g>
        <g transform={L(0.7)}>
          <Pitch id={`${id}-p`} y0={1206} light="#3E8A3A" dark="#317632" x0={-300} x1={1380} lineOpacity={0.7} />
          <Glow id={`${id}-bg`} x={540} y={1380} r={200} t={t} color="#FFF6DC" amp={0.04} rate={1.5} opacity={0.45} />
          <Ball x={540} y={1388} r={44} rot={10} />
        </g>
        {/* la linea del battito sopra il campo, davanti alla tribuna: completa dal fotogramma 0 */}
        <g transform={L(0.85)}>
          <Glow id={`${id}-hb`} x={540} y={HY - 80} r={360} t={t} color="#FFD84A" amp={0} opacity={0.25 + 0.35 * beat} />
          <HeartLine d={heartPath(-260, 1340, HY, [540], 230 + 40 * beat, 170)} width={14} glow={0.45 + 0.4 * beat} />
          {(() => {
            const x = lerp(-200, 1280, run);
            return <Glow id={`${id}-run`} x={x} y={HY} r={90} t={t} color="#FFF6C8" amp={0} opacity={0.7 * Math.sin(run * Math.PI)} />;
          })()}
        </g>
        <g transform={L(1.6)}>
          <NearMotes id={`${id}-near`} t={t} color="#FFF0C8" n={6} r0={50} r1={140} y0={1100} y1={1900} opacity={0.1} />
        </g>
      </g>
      <Finish id={id} tint="#1A1830" tintOpacity={0.12} />
    </svg>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const breath = 1 + 0.01 * Math.sin(t * 1.6);
  // frase di lancio: assente nel fotogramma 0 (miniatura), entra da 0,4 s in 0,3 s e poi resta
  const line = eo(seg(t, 0.4, 0.7));
  return (
    <div style={{ position: 'absolute', inset: 0, background: P.scuro }}>
      <Stadio id="bc" t={t} dur={dur} />
      <div style={{ position: 'absolute', left: 120, top: 270, width: 840, fontFamily: SANS, color: P.chiaro }}>
        <p style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '0.3em', textShadow: `0 2px 0 ${P.scuro}` }}>LA STORIA IN 2 MINUTI</p>
        <div style={{ marginTop: 18 }}><Collab nome={film.copertina.collab} /></div>
        <h1 style={{ margin: '22px 0 0', fontFamily: ANTON, fontWeight: 400, fontSize: 210, lineHeight: 0.92, letterSpacing: '0.02em', color: P.chiaro,
          textShadow: `0 8px 0 ${P.scuro}, 0 0 60px ${P.scuro}`, transform: `scale(${breath})`, transformOrigin: 'left center' }}>
          EDOARDO<br /><span style={{ color: P.accento }}>BOVE</span>
        </h1>
        <p style={{ margin: '14px 0 0', fontSize: 29, fontWeight: 800, color: P.chiaro, whiteSpace: 'nowrap', textShadow: `0 3px 0 ${P.scuro}, 0 0 18px ${P.scuro}, 0 0 8px ${P.scuro}` }}>
          dal documentario <i>In un battito</i> · di {film.regista} · {film.anno}
        </p>
      </div>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1500, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}E0`, color: P.chiaro, fontFamily: SANS, fontSize: 42, fontWeight: 800, textAlign: 'center',
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
  const collab = film.copertina.collab;
  const noop = (s: number) => s;
  return (
    <div style={{ position: 'absolute', inset: 0, background: P.scuro }}>
      <Battito t={8.5 + t * 0.2} dur={9} palette={P} cues={[0, 4.2]} griglia={noop} />
      <div style={{ position: 'absolute', left: 120, top: 300, width: 840, boxSizing: 'border-box', padding: '40px 36px 36px', borderRadius: 32,
        background: `${P.scuro}DE`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 22, justifyContent: 'center', marginTop: 32 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>{collab ? 'Segui le due pagine' : 'Segui la pagina'}</span>
        </div>
        {collab && (
          <div style={{ marginTop: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, opacity: seg(t, 0.9, 1.3) }}>
            <Cronometro size={54} />
            <span style={{ fontSize: 36, fontWeight: 800 }}>@in.2.minuti</span>
            <span style={{ fontSize: 36, fontWeight: 800, color: '#A8A49C' }}>×</span>
            <Img src={staticFile('collab/mrgoal-scritta.png')} style={{ height: 50, width: 'auto' }} />
            <span style={{ fontSize: 36, fontWeight: 800 }}>@mr.goal00</span>
          </div>
        )}
        <p style={{ margin: '28px 0 0', fontSize: 38, fontWeight: 800, color: P.accento, opacity: seg(t, 1.1, 1.5) }}>
          {collab ? 'Commenta: lo vedrai al cinema?' : 'Commenta con il film che vorresti.'}
        </p>
      </div>
    </div>
  );
};
