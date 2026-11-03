import React from 'react';
import { camera, eio, eo, eob, lerp, seg } from '../../lib/anim';
import { DISPLAY, SANS, STENCIL } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Fog, Glow, NearMotes, Rain, Stars } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { K, Pines, Raincoat, TINT, Tower } from './Winden';

// Copertina e finale di Dark, stagione 1 (formato "spiegato": la copertina parte dopo la sigla e dura 2,5 s).
// Locandina originale: niente logo ufficiale, niente simbolo dei tre archi intrecciati, niente volti.
// Copertina: bosco di abeti di notte sotto la pioggia, le torri della centrale che fumano, al centro l'ingresso della
// grotta con una luce calda che pulsa, su un ramo in primo piano l'impermeabile giallo bagnato.
// Finale: la linea del tempo che si chiude ad anello sopra il bosco, con l'impermeabile al centro.
// Piani: cielo (0,2) · torri e bosco lontano (0,4) · grotta (0,6) · ramo con l'impermeabile (1,2) · pioggia (1,6)

const Bosco_: React.FC<{ t: number; dur: number; id: string; cave?: number; coat?: boolean }> = ({ t, dur, id, cave = 1, coat = true }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <Lin id={`${id}-sky`} stops={[[0, '#05080A'], [0.45, '#14201C'], [0.62, '#26362F'], [1, '#14201C']]} />
        <Lin id={`${id}-tower`} x2={1} y2={0} stops={[[0, '#5E6A64'], [1, '#2E3834']]} />
        <Lin id={`${id}-rock`} x2={1} y2={0} stops={[[0, '#1E2622'], [0.5, '#34403A'], [1, '#141A17']]} />
        <Lin id={`${id}-ground`} stops={[[0, '#1E2824'], [1, '#070A09']]} />
        <radialGradient id={`${id}-mouth`}>
          <stop offset="0" stopColor="#FFF4D0" />
          <stop offset=".4" stopColor="#E8B860" />
          <stop offset="1" stopColor="#120E08" />
        </radialGradient>
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill={`url(#${id}-sky)`} />
          <Stars t={t} seed={71} n={40} y={-100} h={700} color="#DDE6E0" size={0.7} />
        </g>
        <g transform={L(0.4)}>
          <g transform="translate(250 1080)"><Tower id={`${id}-t1`} t={t} w={230} h={360} fill={`url(#${id}-tower)`} steamOpacity={0.55} /></g>
          <g transform="translate(420 1090)"><Tower id={`${id}-t2`} t={t + 2} w={180} h={290} fill={`url(#${id}-tower)`} steamOpacity={0.5} /></g>
          <circle cx="250" cy="726" r="7" fill="#FF5A4A" opacity={Math.sin(t * 3) > 0 ? 1 : 0.3} />
          <Pines t={t} y={1110} n={13} h={360} seed={13} color="#0F1714" sway={2} />
          <Fog id={`${id}-f1`} t={t} y={1090} x={540} rx={850} ry={80} color="#5E746A" opacity={0.35} speed={0.25} />
        </g>
        <g transform={L(0.6)}>
          <path d="M180 1300 Q240 1060 420 980 Q540 940 660 980 Q860 1060 920 1300 Z" fill={`url(#${id}-rock)`} stroke={K} strokeWidth="9" strokeLinejoin="round" />
          <path d="M440 1300 Q440 1120 550 1100 Q660 1120 660 1300 Z" fill={`url(#${id}-mouth)`} stroke={K} strokeWidth="9" opacity={0.4 + 0.6 * cave} />
          <Glow id={`${id}-cg`} x={550} y={1200} r={340} t={t} color="#FFD27A" amp={0.15} rate={3} opacity={0.6 * cave} />
          <path d="M-200 1290 Q540 1260 1280 1290 V2200 H-200 Z" fill={`url(#${id}-ground)`} />
          <ellipse cx="550" cy="1330" rx="200" ry="22" fill="#FFD27A" opacity={0.18 * cave} />
        </g>
        <g transform={L(1.2)}>
          <path d="M1280 -200 H990 Q960 700 990 1300 Q1000 1700 960 2200 H1280 Z" fill="#100C0A" stroke={K} strokeWidth="10" />
          <path d="M1000 760 Q880 730 780 770" fill="none" stroke={K} strokeWidth="20" strokeLinecap="round" />
          {coat && <g transform="translate(830 760)"><Raincoat id={`${id}-rc`} t={t} scale={0.75} wind={1} glow={0.6} /></g>}
          {Array.from({ length: 5 }, (_, i) => (
            <g key={i} transform={`translate(${[-40, 140, 340, 600, 860][i]} ${[1700, 1800, 1880, 1820, 1720][i]}) rotate(${Math.sin(t * 1.2 + i) * 3})`}>
              {[-50, -25, 0, 25, 50].map((a) => <path key={a} d="M0 0 Q30 -120 0 -240" fill="none" stroke="#1A3226" strokeWidth="24" strokeLinecap="round" transform={`rotate(${a})`} />)}
            </g>
          ))}
        </g>
        <g transform={L(1.6)}>
          <Rain t={t} level="far" seed={3} color="#A8BDB4" opacity={0.3} />
          <Rain t={t} level="near" seed={8} color="#C9D9D2" opacity={0.35} />
        </g>
        <g transform={L(1.8)}><NearMotes id={`${id}-near`} t={t} color="#C9D9D2" n={6} vx={-30} vy={8} opacity={0.08} /></g>
      </g>
      <Finish id={id} tint={TINT} tintOpacity={0.12} />
    </svg>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const tag = eo(seg(t, 0.05, 0.4));
  const l1 = eob(seg(t, 0.1, 0.6), 1.3);
  const sub = eo(seg(t, 0.45, 0.85));
  const line = eo(seg(t, 0.9, 1.3));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Bosco_ t={t} dur={dur} id="dc" />
      <div style={{ position: 'absolute', left: 80, top: 290, width: 920, fontFamily: SANS }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.accento, opacity: tag, textShadow: `0 2px 0 ${P.scuro}` }}>SPIEGATO SEMPLICE · SERIE</p>
        <h1 style={{ margin: '10px 0 0', fontFamily: STENCIL, fontWeight: 800, fontSize: 250, lineHeight: 0.9, letterSpacing: '0.12em', color: P.chiaro,
          textShadow: `0 8px 0 ${P.scuro}`, opacity: seg(t, 0.1, 0.3), transform: `translateY(${(1 - l1) * 50}px)` }}>
          DARK
        </h1>
        <p style={{ margin: '14px 0 0', fontFamily: STENCIL, fontWeight: 800, fontSize: 64, letterSpacing: '0.3em', color: P.accento, opacity: sub, textShadow: `0 4px 0 ${P.scuro}` }}>STAGIONE {film.stagione}</p>
        <p style={{ margin: '14px 0 0', fontSize: 34, fontWeight: 800, opacity: sub, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>una serie di {film.regista} · {film.anno}</p>
      </div>
      <p style={{ position: 'absolute', left: 60, right: 180, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 840, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, fontSize: 40, fontWeight: 800, textAlign: 'center',
        opacity: line, transform: `translateY(${(1 - line) * 14}px)` }}>
        {film.copertina.frase_lancio}
      </p>
    </div>
  );
};

/** Anello della linea del tempo: gli anni si dispongono in cerchio e la linea si chiude. */
const Anello: React.FC<{ t: number; years: number[]; accent: string; ink: string; dark: string }> = ({ t, years, accent, ink, dark }) => {
  const close = eio(seg(t, 0.2, 1.4));
  const R = 250, cx = 540, cy = 1020;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <g transform={`translate(${cx} ${cy - 150}) scale(${eob(seg(t, 1.1, 1.6), 1.6)})`}>
        <Raincoat id="de-rc2" t={t} scale={0.62} wind={0.5} glow={1} wet={false} />
      </g>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={accent} strokeWidth="10" strokeLinecap="round" pathLength={1} strokeDasharray={`${close} 1`} transform={`rotate(-90 ${cx} ${cy})`} />
      {years.map((y, i) => {
        const a = -Math.PI / 2 + (i / years.length) * Math.PI * 2;
        // gli anni partono in fila (come la linea del tempo) e si spostano sul cerchio
        const k = eio(seg(t, 0.1 + i * 0.1, 1.1 + i * 0.1));
        const x = lerp(240 + i * 200, cx + Math.cos(a) * R, k), yy = lerp(700, cy + Math.sin(a) * R, k);
        return (
          <g key={y} transform={`translate(${x} ${yy})`}>
            <rect x="-80" y="-32" width="160" height="64" rx="32" fill={i === years.length - 1 ? accent : dark} stroke={accent} strokeWidth="5" />
            <text y="14" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="38" fill={i === years.length - 1 ? dark : ink}>{y}</text>
          </g>
        );
      })}
    </svg>
  );
};

export const Finale: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  const card = eo(seg(t, 0.1, 0.5));
  const b1 = eob(seg(t, 0.5, 0.9), 1.8);
  const b2 = eob(seg(t, 0.7, 1.1), 1.8);
  const line = eo(seg(t, 0.4, 0.8));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Bosco_ t={t + 4} dur={dur} id="de" cave={0.5} coat={false} />
      <div style={{ position: 'absolute', inset: 0, background: `${P.scuro}66` }} />
      <Anello t={t} years={film.linea_tempo ?? []} accent={P.accento} ink={P.chiaro} dark={P.scuro} />
      <div style={{ position: 'absolute', left: 90, top: 300, width: 900, boxSizing: 'border-box', padding: '34px 40px 30px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 68, lineHeight: 1 }}>Ti è servito?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 28 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.scuro, fontSize: 40, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 40, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '24px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con la spiegazione che vorresti.</p>
      </div>
      <p style={{ position: 'absolute', left: 60, right: 180, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 840, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, fontSize: 44, fontWeight: 800, textAlign: 'center', lineHeight: 1.25,
        opacity: line, transform: `translateY(${(1 - line) * 14}px)` }}>
        {film.finale.voce}
      </p>
    </div>
  );
};
