import React from 'react';
import { eio, eo, eob, lerp, mod, seg } from '../../lib/anim';
import { ANTON, DISPLAY, SANS } from '../../lib/fonts';
import { Finish, FxDefs } from '../../lib/fx';
import { Glow } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { BLUE, Bullet, INK, RED } from './Tempo';

// Copertina e finale di Tenet (formato "spiegato", senza sigla: la copertina dura tutti i 4 s ed è anche la miniatura).
// Locandina originale: niente persone, maschere indossate o locandine ufficiali. Un grande orologio con due lancette che
// girano in versi opposti (rossa avanti, blu all'indietro) sopra un muro di cemento; un proiettile blu esce dal foro nel
// muro e torna nella pistola posata sul tavolo, con la scia che si riavvolge. Sullo sfondo il quadrato del Sator.
// Il fotogramma 0 è già completo: titolo, orologio, pistola e proiettile a metà volo (niente dissolvenze dal nero).

const DARK = '#0B0E13';
const WARM = '#F2C46A';
const SATOR = ['SATOR', 'AREPO', 'TENET', 'OPERA', 'ROTAS'];

const Art: React.FC<{ t: number; id: string; calm?: number }> = ({ t, id, calm = 0 }) => {
  // il proiettile torna nella pistola: ciclo di 3 s, al fotogramma 0 è già a metà strada
  const u = mod(t / 3 + 0.45, 1);
  const fly = eio(seg(u, 0.05, 0.75));
  const from = [850, 1095] as const, to = [478, 1172] as const;
  const bx = lerp(from[0], to[0], fly), by = lerp(from[1], to[1], fly);
  const vis = 1 - seg(u, 0.75, 0.8) * (1 - seg(u, 0.98, 1));
  const ang = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI + 180;
  const recoil = seg(u, 0.75, 0.78) * (1 - seg(u, 0.78, 0.9));
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <radialGradient id={`${id}-bg`} cx=".5" cy=".46" r=".8">
          <stop offset="0" stopColor="#222C38" />
          <stop offset=".6" stopColor="#141B24" />
          <stop offset="1" stopColor="#090C10" />
        </radialGradient>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2C3642" />
          <stop offset="1" stopColor="#1C242E" />
        </linearGradient>
        <linearGradient id={`${id}-trail`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={BLUE} stopOpacity="0" />
          <stop offset="1" stopColor={BLUE} stopOpacity=".9" />
        </linearGradient>
        <pattern id={`${id}-grid`} width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0 H0 V40" fill="none" stroke="#232D39" strokeWidth="1" /></pattern>
      </defs>
      <rect width="1080" height="1920" fill={`url(#${id}-bg)`} />
      <rect width="1080" height="1920" fill={`url(#${id}-grid)`} opacity=".6" />
      {/* il quadrato del Sator inciso nella pietra, dietro l'orologio */}
      <g opacity=".1">
        {SATOR.map((w, i) => <text key={i} x="540" y={700 + i * 150} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize="150" letterSpacing="40" fill={INK}>{w}</text>)}
      </g>
      {/* l'orologio: lancetta rossa in avanti, lancetta blu all'indietro */}
      <g transform="translate(540 830) scale(.94)">
        <Glow id={`${id}-cg`} x={0} y={0} r={360} t={t} color={BLUE} amp={0.06} rate={2} opacity={0.3} />
        <circle r="250" fill="#18212C" stroke={INK} strokeWidth="10" />
        <circle r="226" fill="none" stroke="#3A4656" strokeWidth="3" />
        {Array.from({ length: 60 }, (_, i) => <path key={i} d={`M0 -226 V${i % 5 ? -214 : -196}`} stroke={INK} strokeWidth={i % 5 ? 2 : 6} transform={`rotate(${i * 6})`} />)}
        <path d="M-150 0 A150 150 0 0 1 150 0" fill="none" stroke={RED} strokeWidth="5" strokeDasharray="14 12" opacity=".7" />
        <path d="M150 0 A150 150 0 0 1 -150 0" fill="none" stroke={BLUE} strokeWidth="5" strokeDasharray="14 12" opacity=".7" />
        <path d="M0 18 V-190" stroke={RED} strokeWidth="12" strokeLinecap="round" transform={`rotate(${40 + t * 50})`} />
        <path d="M0 18 V-150" stroke={BLUE} strokeWidth="14" strokeLinecap="round" transform={`rotate(${-40 - t * 50})`} />
        <circle r="18" fill={INK} stroke={DARK} strokeWidth="4" />
      </g>
      {/* il muro con il foro, a destra */}
      <rect x="800" y="960" width="300" height="420" fill={`url(#${id}-wall)`} stroke={INK} strokeWidth="6" />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M800 ${960 + i * 52} H1100`} stroke="#3E4A58" strokeWidth="2" />)}
      {Array.from({ length: 16 }, (_, i) => <path key={`v${i}`} d={`M${800 + ((i % 2) ? 70 : 140) + (i % 4 > 1 ? 70 : 0)} ${960 + Math.floor(i / 2) * 52} v52`} stroke="#3E4A58" strokeWidth="2" />)}
      <circle cx={from[0]} cy={from[1]} r="12" fill={DARK} stroke={INK} strokeWidth="3" />
      {/* le crepe si richiudono man mano che il proiettile esce */}
      <g opacity={1 - fly}>
        {[[26, -18], [-20, -22], [18, 24], [-26, 12], [34, 6]].map(([dx, dy], i) => <path key={i} d={`M${from[0]} ${from[1]} l${dx} ${dy} l${dx * 0.4} ${-dy * 0.3}`} stroke={INK} strokeWidth="3" fill="none" />)}
      </g>
      {/* il pavimento in prospettiva fino al bordo basso, con il nastro di pericolo e la polvere */}
      <rect x="0" y="1380" width="1080" height="540" fill="#10151C" />
      <path d="M0 1380 H1080" stroke={INK} strokeWidth="6" />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${540 + (i - 5.5) * 90} 1380 L${540 + (i - 5.5) * 260} 1920`} stroke="#3A4656" strokeWidth="2.5" />)}
      {[1450, 1560, 1720].map((y) => <path key={y} d={`M0 ${y} H1080`} stroke="#3A4656" strokeWidth="2" opacity=".7" />)}
      {Array.from({ length: 22 }, (_, i) => <path key={`h${i}`} d={`M${i * 52} 1412 l30 -24`} stroke={WARM} strokeWidth="8" opacity=".5" />)}
      {Array.from({ length: 24 }, (_, i) => <circle key={`d${i}`} cx={(i * 211 + t * (12 + (i % 5) * 4)) % 1080} cy={1460 + ((i * 137) % 440) - ((t * (8 + (i % 3) * 5)) % 60)} r={2 + (i % 3)} fill="#C8D2DC" opacity={0.25 + 0.1 * Math.sin(t * 2 + i)} />)}
      {/* il tavolo con la pistola posata */}
      <path d="M120 1220 H760" stroke={INK} strokeWidth="10" strokeLinecap="round" />
      <path d="M160 1226 V1380 M720 1226 V1380" stroke={INK} strokeWidth="7" />
      <path d="M120 1213 H760" stroke="#FFFFFF" strokeWidth="2.5" opacity=".3" />
      <g transform={`translate(${380 - recoil * 10} 1180)`}>
        <path d="M-110 -26 H80 V8 H-40 L-52 50 H-92 L-80 8 H-110 Z" fill="#3A4656" stroke={INK} strokeWidth="7" strokeLinejoin="round" />
        <path d="M-100 -15 H66" stroke="#FFFFFF" strokeWidth="3.5" opacity=".4" />
        <path d="M-60 8 Q-48 28 -28 8" fill="none" stroke={INK} strokeWidth="5" />
        <rect x="80" y="-20" width="18" height="22" fill="#222C36" stroke={INK} strokeWidth="4" />
        {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${-90 + i * 14} -26 V-8`} stroke={INK} strokeWidth="2" opacity=".6" />)}
      </g>
      {[170, 205, 240].map((x, i) => <g key={x} transform={`translate(${x} 1196) rotate(-90) scale(.9)`}><Bullet color={i === 1 ? BLUE : '#C9A24E'} /></g>)}
      {/* la scia blu e il proiettile che vola all'indietro, verso la canna */}
      <path d={`M${from[0]} ${from[1]} L${bx} ${by}`} stroke={`url(#${id}-trail)`} strokeWidth="16" strokeLinecap="round" opacity={vis * (1 - calm * 0.5)} transform="" />
      <Glow id={`${id}-bl`} x={bx} y={by} r={110} t={t} color={BLUE} amp={0.1} rate={6} opacity={0.75 * vis} />
      <g transform={`translate(${bx} ${by}) rotate(${ang})`} opacity={vis}><Bullet s={3.2} /></g>
      {/* frecce del riavvolgimento sopra la traiettoria */}
      {[0, 1, 2].map((k) => {
        const x = lerp(780, 520, mod(t * 0.6 + k / 3, 1));
        return <path key={k} d={`M${x + 18} 1080 L${x} 1094 L${x + 18} 1108 M${x + 40} 1080 L${x + 22} 1094 L${x + 40} 1108`} fill="none" stroke={BLUE} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity={0.75} />;
      })}
      <Finish id={id} tint="#1E2A3A" tintOpacity={0.1} />
    </svg>
  );
};

const TitleBlock: React.FC<{ film: PosterProps['film'] }> = ({ film }) => {
  const P = film.palette;
  return (
    <div style={{ position: 'absolute', left: 120, top: 270, width: 840, fontFamily: SANS, textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.accento }}>SPIEGATO SEMPLICE · FILM</p>
      <h1 style={{ margin: '4px 0 0', fontFamily: ANTON, fontWeight: 400, fontSize: 210, lineHeight: 1, letterSpacing: '0.12em', color: P.chiaro, textShadow: `0 8px 0 ${P.scuro}` }}>TENET</h1>
    </div>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, film }) => {
  const P = film.palette;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Art t={t} id="tc" />
      <TitleBlock film={film} />
      {/* il riflesso blu del titolo: TENET si legge uguale anche al contrario */}
      <div style={{ position: 'absolute', left: 120, top: 548, width: 840, textAlign: 'center', fontFamily: ANTON, fontSize: 210, lineHeight: 1, letterSpacing: '0.12em',
        color: BLUE, opacity: 0.28, transform: 'scaleY(-0.45)', transformOrigin: 'top' }}>TENET</div>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1460, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}E0`, color: P.chiaro, fontFamily: SANS, fontSize: 44, fontWeight: 800, textAlign: 'center' }}>
        {film.copertina.frase_lancio}
      </p>
      <p style={{ position: 'absolute', left: 120, width: 840, top: 1318, margin: 0, textAlign: 'center', fontFamily: SANS, fontSize: 30, fontWeight: 800, color: '#AEB8C4' }}>un film di {film.regista} · {film.anno}</p>
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
      <Art t={t + 3} id="te" calm={1} />
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
