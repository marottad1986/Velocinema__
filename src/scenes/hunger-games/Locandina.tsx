import React from 'react';
import { camera, eo, eob, lerp, rng, seg } from '../../lib/anim';
import { ANTON, DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Embers, Fog, Glow, NearMotes, Stars } from '../../lib/elements';
import { Speciale } from '../../components/Speciale';
import type { PosterProps } from '../../types';
import { Arrow, Bow, Cornucopia, Dome, EMBER, HGDefs, K, Pine, PineRow } from './Comuni';

// Copertina e finale di Hunger Games. Locandina originale: niente ragazza con l'arco, niente spilla con l'uccello in
// fiamme, niente persone né logo. Copertina (è anche la miniatura: completa dal fotogramma 0): notte nell'arena, la
// Cornucopia dorata nella radura, in cielo un arco di 24 luci (i ventiquattro ragazzi) che si spengono una dopo
// l'altra mentre la voce chiede se ne uscirà vivo uno solo: ne resta accesa una, arancione. In primo piano l'arco e una
// freccia piantata nel terreno, braci che salgono. Finale: la stessa radura all'alba, accese due luci (i due vincitori).

const N = 24;
/** Posizione della luce i sull'arco del cielo. */
const lightPos = (i: number) => {
  const u = i / (N - 1);
  return { x: lerp(150, 930, u), y: 990 - Math.sin(u * Math.PI) * 40 };
};
const r0 = rng(77);
// ordine in cui si spengono (tutte tranne la 15, che resta accesa: è Katniss); in finale restano la 15 e la 14
const ORDER = (() => {
  const ids = Array.from({ length: N }, (_, i) => i).filter((i) => i !== 15);
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(r0() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  return ids;
})();

const Sfondo: React.FC<{ id: string; t: number; dur: number; dawn: boolean }> = ({ id, t, dur, dawn }) => {
  const cam = camera(t, dur, 540, 1150);
  const L = cam.layer;
  // copertina: dal secondo 0,4 al 3,6 si spengono 23 luci; finale: restano accese le due dei vincitori
  const off = (i: number) => {
    if (dawn) return i === 15 || i === 14 ? 0 : 1;
    const k = ORDER.indexOf(i);
    return k < 0 ? 0 : seg(t, 0.4 + k * 0.138, 0.4 + k * 0.138 + 0.18);
  };
  const last = dawn ? 1 : seg(t, 3.4, 3.8);
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <HGDefs id={id} />
        <Lin id={`${id}-sky`} stops={dawn
          ? [[0, '#1E2A3A'], [0.35, '#5A5A6A'], [0.55, '#D88A5A'], [0.68, '#F2C08A']]
          : [[0, '#05080A'], [0.35, '#0C1A1C'], [0.55, '#16302C'], [0.7, '#2A3A2A']]} />
        <Lin id={`${id}-ground`} stops={dawn ? [[0, '#5A6A3A'], [0.4, '#3A4A2A'], [1, '#141A0E']] : [[0, '#2A3A22'], [0.35, '#1A2616'], [1, '#070A06']]} />
        <radialGradient id={`${id}-clear`} cx=".5" cy=".3" r=".6">
          <stop offset="0" stopColor={dawn ? '#9AA05A' : '#4A5A34'} />
          <stop offset="1" stopColor={dawn ? '#5A6A3A' : '#1E2A18'} stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={cam.transform}>
        {/* PIANO 0 — cielo con la cupola a esagoni e l'arco delle 24 luci (0,2) */}
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill={`url(#${id}-sky)`} />
          {!dawn && <Stars t={t} seed={8} n={40} y={80} h={760} color="#DDEFEA" size={0.8} />}
          <Dome y0={40} y1={1150} size={80} color={dawn ? '#FFF0D8' : '#9FE0E0'} opacity={dawn ? 0.1 : 0.09} t={t} />
          {dawn && <Glow id={`${id}-sun`} x={540} y={1180} r={520} t={t} color="#FFD8A0" amp={0.03} rate={1} opacity={0.75} />}
          {Array.from({ length: N }, (_, i) => {
            const p = lightPos(i), o = off(i), win = i === 15 || (dawn && i === 14);
            const c = win ? EMBER : '#F4ECD8';
            const sc = win ? 1 + 0.35 * last : 1;
            return (
              <g key={i}>
                <Glow id={`${id}-l${i}`} x={p.x} y={p.y} r={(win ? 90 : 46) * sc} t={t} color={win ? '#FFB060' : '#FFF4D8'} amp={0.1} rate={3 + (i % 4)} ph={i} opacity={(1 - o) * (win ? 0.9 : 0.6)} />
                <circle cx={p.x} cy={p.y} r={(win ? 13 : 10) * sc * (1 - 0.6 * o)} fill={c} stroke={K} strokeWidth="3" opacity={1 - 0.82 * o} />
                {/* spegnimento: un piccolo anello che si allarga */}
                {o > 0 && o < 1 && <circle cx={p.x} cy={p.y} r={10 + 30 * o} fill="none" stroke="#F4ECD8" strokeWidth="3" opacity={1 - o} />}
              </g>
            );
          })}
        </g>
        {/* PIANO 1 — bosco lontano senza contorni e nebbia (0,4) */}
        <g transform={L(0.4)}>
          <PineRow y={1170} n={20} h0={200} h1={340} fill={dawn ? '#3A4A3E' : '#0E1A16'} seed={4} />
          <PineRow y={1210} n={16} h0={160} h1={260} fill={dawn ? '#2E3E30' : '#0A140F'} seed={9} />
          <Fog id={`${id}-f1`} t={t} y={1190} rx={900} ry={70} color={dawn ? '#F2D8B0' : '#4A6A5A'} opacity={dawn ? 0.5 : 0.35} speed={0.25} />
        </g>
        {/* PIANO 2 — la radura e la Cornucopia (0,62) */}
        <g transform={L(0.62)}>
          <path d="M-200 1220 Q540 1190 1280 1220 V2200 H-200 Z" fill={`url(#${id}-ground)`} />
          <ellipse cx="540" cy="1300" rx="620" ry="120" fill={`url(#${id}-clear)`} />
          <Glow id={`${id}-cg`} x={430} y={1170} r={380} t={t} color={dawn ? '#FFD890' : '#E8C060'} amp={0.04} rate={1.2} opacity={dawn ? 0.35 : 0.3} />
          <Cornucopia id={id} x={330} y={1350} s={0.6} t={t} />
          {/* piastre di partenza attorno alla radura */}
          {Array.from({ length: 9 }, (_, i) => {
            const a = Math.PI * (0.06 + (i / 8) * 0.88);
            const px = 540 - Math.cos(a) * 520, py = 1320 + Math.sin(a) * 70;
            return <ellipse key={i} cx={px} cy={py} rx="34" ry="9" fill="#8A9298" stroke={K} strokeWidth="4" />;
          })}
        </g>
        {/* PIANO 3 — pini scuri che incorniciano (1,0) */}
        <g transform={L(1.0)}>
          <Pine x={-30} y={1560} h={1000} w={420} fill={dawn ? '#1E2A20' : '#050906'} outline={K} lit={dawn ? '#8A9A6A' : '#2A4A3A'} seed={21} />
          <Pine x={1110} y={1580} h={1080} w={440} fill={dawn ? '#1E2A20' : '#050906'} outline={K} lit={dawn ? '#8A9A6A' : '#2A4A3A'} seed={33} />
        </g>
        {/* PIANO 4 — arco e freccia piantata in primo piano (1,25) */}
        <g transform={L(1.25)}>
          <path d="M-200 1700 Q540 1640 1280 1720 V2200 H-200 Z" fill="#050805" />
          {/* roccia a destra con l'arco appoggiato */}
          <path d="M760 1760 Q770 1600 880 1570 Q1000 1540 1120 1600 V1800 Z" fill="#2A322A" stroke={K} strokeWidth="9" />
          <path d="M790 1640 Q840 1590 900 1584" stroke="#5A6A5A" strokeWidth="5" fill="none" opacity=".7" />
          <Bow id={id} x={900} y={1500} s={0.8} rot={18} />
          {/* freccia piantata nel terreno: punta in giù, impennaggio arancione in alto */}
          <Glow id={`${id}-ag`} x={300} y={1560} r={190} t={t} color="#FFB060" amp={0.1} rate={5} opacity={0.5} />
          <Arrow x={244} y={1478} rot={78} len={240} s={0.95} glow={0.6 + 0.4 * Math.sin(t * 4)} />
          <path d="M236 1750 Q318 1630 410 1750 Z" fill="#26301E" stroke={K} strokeWidth="6" />
          <path d="M296 1700 q24 -12 50 -4" stroke="#3A4A2A" strokeWidth="4" fill="none" />
        </g>
        {/* PIANO 5 — braci che salgono (restano sotto il titolo) e particelle vicine (1,5–1,8) */}
        <g transform={L(1.5)}>
          <Embers t={t} x={620} y={1900} w={900} h={760} n={34} seed={5} drift={-160} />
        </g>
        <g transform={L(1.8)}>
          <NearMotes id={`${id}-near`} t={t} color={dawn ? '#FFE8C8' : '#FFB060'} n={6} r0={60} r1={150} y0={1200} y1={1900} opacity={0.1} />
        </g>
      </g>
      <Finish id={id} tint={dawn ? '#C89A3A' : '#0F1A12'} tintOpacity={dawn ? 0.08 : 0.12} />
    </svg>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  // tutto è già al suo posto al fotogramma 0 (miniatura); si muovono solo luci, braci e un leggero respiro del titolo
  const breath = 1 + 0.012 * Math.sin(t * 1.6);
  const underline = 0.55 + 0.45 * eo(seg(t, 0, 0.8));
  // frase di lancio: assente nel fotogramma 0 (miniatura), entra da 0,4 s in 0,3 s e poi resta
  const line = eo(seg(t, 0.4, 0.7));
  return (
    <div style={{ position: 'absolute', inset: 0, background: P.scuro }}>
      <Sfondo id="hc" t={t} dur={dur} dawn={false} />
      <div style={{ position: 'absolute', left: 120, top: 292, width: 840, fontFamily: SANS, color: P.chiaro }}>
        <p style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '0.3em', color: P.chiaro, textShadow: `0 2px 0 ${P.scuro}` }}>IL FILM IN 2 MINUTI<Speciale nome={film.copertina.speciale} scale={1} /></p>
        <h1 style={{ margin: '6px 0 0', fontFamily: ANTON, fontWeight: 400, fontSize: 236, lineHeight: 0.94, letterSpacing: '0.02em', color: P.chiaro,
          textShadow: `0 8px 0 ${P.scuro}, 0 0 60px ${P.scuro}`, transform: `scale(${breath})`, transformOrigin: 'left center' }}>
          HUNGER<br /><span style={{ color: P.accento }}>GAMES</span>
        </h1>
        <div style={{ height: 10, width: 840 * underline, background: P.accento, borderRadius: 5, marginTop: 8, boxShadow: `0 3px 0 ${P.scuro}` }} />
        <p style={{ margin: '18px 0 0', fontSize: 40, fontWeight: 800, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>un film di {film.regista} · {film.anno}</p>
      </div>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
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
  const end = eob(seg(t, 0.3, 0.9), 1.3);
  return (
    <div style={{ position: 'absolute', inset: 0, background: P.scuro }}>
      <Sfondo id="hf" t={t} dur={dur} dawn />
      <div style={{ position: 'absolute', left: 120, top: 300, width: 840, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con il film che vorresti.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 690, margin: 0, textAlign: 'center', fontFamily: ANTON, fontWeight: 400, fontSize: 190, lineHeight: 1,
        letterSpacing: '0.04em', color: P.chiaro, textShadow: `0 8px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        FINE
      </h1>
    </div>
  );
};
