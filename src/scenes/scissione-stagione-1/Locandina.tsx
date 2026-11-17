import React from 'react';
import { eo, eob, mod, rng, seg } from '../../lib/anim';
import { DISPLAY, SANS, SYNCOPATE } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Glow, Snow, Stars } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { INK, MINT, RED, WARM } from './Piani';

// Copertina e finale di Scissione – stagione 1 (formato "spiegato", senza sigla: la copertina dura tutti i 4 s ed è
// anche la miniatura). Locandina originale: niente persone, niente logo né edificio della serie, niente locandine ufficiali.
// Uno spaccato verticale: sopra la notte d'inverno con la neve, due case con le finestre accese e un edificio aziendale
// basso e bianco (generico); in mezzo la linea luminosa della scissione che taglia tutto il fotogramma, con il pozzo
// dell'ascensore; sotto un corridoio bianco in prospettiva con la moquette verde, che finisce su una porta illuminata.
// Il fotogramma 0 è già completo (titolo, immagine, riga degli autori): la frase di lancio entra da 0,4 s.

const DARK = '#081417';
const CUTY = 1010;
const VP = { x: 540, y: 1360 }; // il punto di fuga del corridoio

const rr = rng(77);
const TOWN = Array.from({ length: 22 }, (_, i) => ({ x: -20 + i * 52 + rr() * 16, h: 30 + rr() * 60, lit: rr() > 0.5 }));

const Casa: React.FC<{ x: number; w: number; h: number; t: number; id: string; g: number }> = ({ x, w, h, t, id, g }) => {
  const top = g - h;
  return (
    <g strokeLinejoin="round">
      <Glow id={id} x={x + w * 0.32} y={top + h * 0.36} r={150} t={t} color={WARM} amp={0.08} rate={1.4} opacity={0.55} />
      <rect x={x} y={top} width={w} height={h} fill="url(#lc-wall)" stroke={INK} strokeWidth="6" />
      <path d={`M${x - 20} ${top + 4} L${x + w / 2} ${top - h * 0.45} L${x + w + 20} ${top + 4} Z`} fill="#2A3A48" stroke={INK} strokeWidth="6" />
      <path d={`M${x - 20} ${top + 4} L${x + w / 2} ${top - h * 0.45} L${x + w + 20} ${top + 4} L${x + w + 6} ${top - 8} L${x + w / 2} ${top - h * 0.45 + 16} L${x - 6} ${top - 8} Z`} fill="#F2F6F8" />
      <rect x={x + w * 0.16} y={top + h * 0.2} width={w * 0.3} height={h * 0.3} fill="#F6D49A" stroke={INK} strokeWidth="5" />
      <path d={`M${x + w * 0.31} ${top + h * 0.2} V${top + h * 0.5} M${x + w * 0.16} ${top + h * 0.35} H${x + w * 0.46}`} stroke={DARK} strokeWidth="4" />
      <rect x={x + w * 0.56} y={top + h * 0.2} width={w * 0.28} height={h * 0.3} fill="#1E2C38" stroke={INK} strokeWidth="5" />
      <rect x={x + w * 0.4} y={g - h * 0.36} width={w * 0.2} height={h * 0.36} fill="#3A2E2A" stroke={INK} strokeWidth="5" />
    </g>
  );
};

/** Il corridoio in prospettiva: soffitto con i pannelli luminosi, pareti bianche, moquette verde, porta in fondo. */
const Corridoio: React.FC<{ t: number; calm: number }> = ({ t, calm }) => {
  const y0 = CUTY + 70, y1 = 1920;
  const back = { x0: VP.x - 70, x1: VP.x + 70, y0: VP.y - 90, y1: VP.y + 80 };
  const L = 'round' as const;
  // linee che scorrono verso il punto di fuga (lento avanzare nel corridoio)
  const rows = Array.from({ length: 7 }, (_, i) => mod(i / 7 + t * 0.06, 1));
  const at = (k: number) => {
    // k 0 = vicino (bordi del fotogramma), 1 = in fondo
    const e = Math.pow(k, 0.55);
    return { xl: -60 + (back.x0 + 60) * e, xr: 1140 - (1140 - back.x1) * e, yt: y0 + (back.y0 - y0) * e, yb: y1 + 160 + (back.y1 - y1 - 160) * e };
  };
  return (
    <g strokeLinejoin={L}>
      {/* soffitto, pareti, pavimento */}
      <path d={`M-60 ${y0} H1140 L${back.x1} ${back.y0} H${back.x0} Z`} fill="url(#lc-ceil)" />
      <path d={`M-60 ${y0} L${back.x0} ${back.y0} V${back.y1} L-60 ${y1 + 160} Z`} fill="url(#lc-wl)" />
      <path d={`M1140 ${y0} L${back.x1} ${back.y0} V${back.y1} L1140 ${y1 + 160} Z`} fill="url(#lc-wr)" />
      <path d={`M-60 ${y1 + 160} L${back.x0} ${back.y1} H${back.x1} L1140 ${y1 + 160} Z`} fill="url(#lc-floor)" />
      {/* le giunture che scorrono: pannelli del soffitto accesi e righe della moquette */}
      {rows.map((k, i) => {
        const a = at(k), b = at(Math.min(1, k + 0.035));
        const op = Math.min(1, (1 - k) * 3) * Math.min(1, k * 8);
        return (
          <g key={i} opacity={op}>
            <path d={`M${a.xl + (a.xr - a.xl) * 0.3} ${a.yt + (b.yt - a.yt) * 0.2} H${a.xl + (a.xr - a.xl) * 0.7} L${b.xl + (b.xr - b.xl) * 0.68} ${b.yt + 6} H${b.xl + (b.xr - b.xl) * 0.32} Z`} fill="#F4FFFB" opacity={0.85} />
            <path d={`M${a.xl} ${a.yb} H${a.xr}`} stroke="#1E5A40" strokeWidth={Math.max(1, 6 * (1 - k))} />
            <path d={`M${a.xl} ${a.yt} V${a.yb} M${a.xr} ${a.yt} V${a.yb}`} stroke="#B8CAC6" strokeWidth={Math.max(1, 5 * (1 - k))} />
          </g>
        );
      })}
      {/* spigoli */}
      <path d={`M-60 ${y0} L${back.x0} ${back.y0} M1140 ${y0} L${back.x1} ${back.y0} M-60 ${y1 + 160} L${back.x0} ${back.y1} M1140 ${y1 + 160} L${back.x1} ${back.y1}`} stroke={DARK} strokeWidth="5" opacity=".7" />
      {/* lo zoccolo verde lungo le pareti */}
      <path d={`M-60 ${y1 + 60} L${back.x0} ${back.y1 - 12} M1140 ${y1 + 60} L${back.x1} ${back.y1 - 12}`} stroke="#2F6B4A" strokeWidth="10" />
      {/* la porta in fondo, illuminata */}
      <Glow id="lc-door" x={VP.x} y={VP.y} r={260} t={t} color={calm ? RED : MINT} amp={0.12} rate={2.2} opacity={0.7} />
      <rect x={back.x0} y={back.y0} width={back.x1 - back.x0} height={back.y1 - back.y0} fill="#0E2E33" stroke={DARK} strokeWidth="5" />
      <rect x={VP.x - 34} y={VP.y - 70} width="68" height="150" fill={calm ? '#F0B0A0' : '#C8FFF0'} stroke={DARK} strokeWidth="5" />
      <path d={`M${VP.x} ${VP.y - 70} V${VP.y + 80}`} stroke={DARK} strokeWidth="3" />
      {calm > 0 && <circle cx={VP.x} cy={VP.y + 5} r={120 + 6 * Math.sin(t * 3)} fill="none" stroke={RED} strokeWidth="10" strokeDasharray="60 22" strokeDashoffset={-t * 40} opacity={calm} />}
      {/* porte laterali che passano */}
      {rows.slice(0, 3).map((k0, i) => {
        const k = mod(k0 + 0.07, 1), a = at(k), b = at(Math.min(1, k + 0.06));
        const op = Math.min(1, (1 - k) * 3) * Math.min(1, k * 6);
        const left = i % 2 === 0;
        const xa = left ? a.xl : a.xr, xb = left ? b.xl : b.xr;
        const hA = (a.yb - a.yt) * 0.55, hB = (b.yb - b.yt) * 0.55;
        return <path key={`d${i}`} d={`M${xa} ${a.yb} V${a.yb - hA} L${xb} ${b.yb - hB} V${b.yb} Z`} fill="#2A4A50" stroke={DARK} strokeWidth="3" opacity={op} />;
      })}
    </g>
  );
};

const Art: React.FC<{ t: number; id: string; calm?: number }> = ({ t, id, calm = 0 }) => {
  const G = 900;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <linearGradient id="lc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#050C14" />
          <stop offset=".45" stopColor="#0E1C2C" />
          <stop offset=".8" stopColor="#24384C" />
          <stop offset="1" stopColor="#3A5468" />
        </linearGradient>
        <linearGradient id="lc-wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5A6E7E" /><stop offset="1" stopColor="#3A4A5A" /></linearGradient>
        <linearGradient id="lc-lumon" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#EEF4F2" /><stop offset=".6" stopColor="#C2CECC" /><stop offset="1" stopColor="#8EA0A2" /></linearGradient>
        <linearGradient id="lc-snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E8F0F4" /><stop offset="1" stopColor="#8AA0B0" /></linearGradient>
        <linearGradient id="lc-earth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1E2A26" /><stop offset="1" stopColor="#0C1412" /></linearGradient>
        <linearGradient id="lc-ceil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#DCE8E4" /><stop offset="1" stopColor="#F4FAF8" /></linearGradient>
        <linearGradient id="lc-wl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#B8C8C4" /><stop offset="1" stopColor="#E8F0EE" /></linearGradient>
        <linearGradient id="lc-wr" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#98AAA6" /><stop offset="1" stopColor="#DCE6E4" /></linearGradient>
        <linearGradient id="lc-floor" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#14402E" /><stop offset=".6" stopColor="#2A6E50" /><stop offset="1" stopColor="#4A8A6A" /></linearGradient>
        <linearGradient id="lc-cut" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={MINT} stopOpacity="0" /><stop offset=".5" stopColor={MINT} stopOpacity=".55" /><stop offset="1" stopColor={MINT} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* FUORI: la notte d'inverno */}
      <rect width="1080" height={G + 20} fill="url(#lc-sky)" />
      <Stars t={t} seed={5} n={40} x={0} y={40} w={1080} h={500} size={1.2} color="#DCE8F0" />
      <path d={`M0 ${G - 150} Q260 ${G - 240} 520 ${G - 170} Q800 ${G - 110} 1080 ${G - 200} V${G} H0 Z`} fill="#1A2C3A" />
      {TOWN.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={G - 140 - b.h} width="34" height={b.h + 60} fill="#22384A" />
          {b.lit && <rect x={b.x + 12} y={G - 126 - b.h} width="9" height="9" fill={WARM} opacity={0.55 * (1 - 0.5 * calm)} />}
        </g>
      ))}
      <Casa x={60} w={170} h={170} t={t} id={`${id}-c1`} g={G} />
      <Casa x={262} w={140} h={140} t={t} id={`${id}-c2`} g={G} />
      {/* l'edificio aziendale: basso, lungo e bianco (generico) */}
      <g strokeLinejoin="round">
        <rect x="450" y={G - 150} width="660" height="150" fill="url(#lc-lumon)" stroke={INK} strokeWidth="6" />
        <rect x="462" y={G - 176} width="636" height="26" fill="#C8D2D0" stroke={INK} strokeWidth="5" />
        <rect x="474" y={G - 110} width="612" height="54" fill="#14262C" stroke={INK} strokeWidth="4" />
        {Array.from({ length: 13 }, (_, i) => <rect key={i} x={480 + i * 47} y={G - 104} width="38" height="42" fill={MINT} opacity={(1 - calm) * (0.08 + 0.1 * ((i * 5) % 3))} />)}
        <rect x="500" y={G - 92} width="80" height="92" fill="#BFD8D4" opacity=".4" stroke={INK} strokeWidth="5" />
        <path d={`M540 ${G - 92} V${G} M460 ${G - 104} H620`} stroke={INK} strokeWidth="5" />
      </g>
      <path d={`M0 ${G} Q200 ${G - 18} 420 ${G - 4} Q700 ${G + 12} 1080 ${G - 10} V${G + 40} H0 Z`} fill="url(#lc-snow)" stroke={INK} strokeWidth="4" />
      <Snow t={t} x={0} y={0} w={1080} h={G} seed={3} n={110} />
      <Snow t={t} level="near" x={0} y={0} w={1080} h={G} seed={4} n={14} />
      {/* la terra con il pozzo dell'ascensore */}
      <rect y={G + 30} width="1080" height={CUTY + 80 - G - 30} fill="url(#lc-earth)" />
      <rect x="500" y={G + 30} width="80" height={CUTY + 50 - G} fill="#0A1A1E" stroke={INK} strokeWidth="5" />
      {/* SOTTO: il corridoio */}
      <Corridoio t={t} calm={calm} />
      {/* la linea della scissione che taglia tutto */}
      <rect x="0" y={CUTY - 60} width="1080" height="120" fill="url(#lc-cut)" opacity={0.85 * (1 - 0.5 * calm)} />
      <path d={`M0 ${CUTY} H1080`} stroke={MINT} strokeWidth="10" strokeDasharray="44 16" strokeDashoffset={-t * 40} opacity={1 - 0.4 * calm} />
      <path d={`M0 ${CUTY} H1080`} stroke="#E8FFF8" strokeWidth="3" opacity={0.9 * (1 - 0.5 * calm)} />
      <g transform={`translate(${170 + 30 * Math.sin(t * 1.4)} ${CUTY}) rotate(${Math.sin(t * 16) * 10})`} strokeLinecap="round" opacity={1 - calm}>
        <circle cx="-34" cy="-18" r="15" fill="none" stroke={INK} strokeWidth="7" />
        <circle cx="-34" cy="18" r="15" fill="none" stroke={INK} strokeWidth="7" />
        <path d="M-20 -10 L34 8 M-20 10 L34 -8" stroke={INK} strokeWidth="8" />
      </g>
      <Finish id={id} tint="#0E2A30" tintOpacity={0.12} />
    </svg>
  );
};

const TitleBlock: React.FC<{ film: PosterProps['film'] }> = ({ film }) => {
  const P = film.palette;
  return (
    <div style={{ position: 'absolute', left: 120, top: 270, width: 840, fontFamily: SANS, textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.accento }}>SPIEGATO SEMPLICE · SERIE</p>
      <h1 style={{ margin: '14px 0 0', fontFamily: SYNCOPATE, fontWeight: 700, fontSize: 104, lineHeight: 1, letterSpacing: '0.02em', color: P.chiaro, textShadow: `0 7px 0 ${P.scuro}, 0 0 40px ${P.scuro}` }}>SCISSIONE</h1>
      <p style={{ margin: '18px auto 0', width: 'fit-content', padding: '6px 24px 8px', borderRadius: 14, background: `${P.scuro}D0`, border: `3px solid ${P.accento}`,
        fontSize: 44, fontWeight: 800, letterSpacing: '0.12em', color: P.accento }}>STAGIONE 1</p>
    </div>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, film }) => {
  const P = film.palette;
  const line = eo(seg(t, 0.4, 0.7));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Art t={t} id="lc" />
      <TitleBlock film={film} />
      <p style={{ position: 'absolute', left: 120, width: 840, top: 932, margin: 0, textAlign: 'center', fontFamily: SANS, fontSize: 30, fontWeight: 800, color: '#E8F4F0', textShadow: `0 2px 8px ${P.scuro}, 0 0 4px ${P.scuro}` }}>una serie di {film.regista} · {film.anno}</p>
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
      <Art t={t + 3} id="le" calm={1} />
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
    </div>
  );
};
