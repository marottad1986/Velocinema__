import React from 'react';
import { camera, eio, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { DISPLAY, SANS, STENCIL } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Fog, Glow, NearMotes, Smoke } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { K, Raincoat, TINT, Tower } from '../dark-stagione-1/Winden';

// Copertina e finale di Dark, stagione 2 (senza sigla: la copertina dura tutti i 4 s e porta «SPIEGATO SEMPLICE» in alto).
// Locandina originale: niente logo ufficiale, niente simbolo dei tre archi intrecciati, niente volti.
// Copertina: Winden distrutta nel 2053 sotto un cielo color cenere, le torri della centrale spezzate, cenere che cade;
// in primo piano su una roccia la clessidra d'ottone (Adam) accanto all'impermeabile giallo coperto di polvere (Jonas).
// Finale: gli anni della stagione che si chiudono ad anello sopra le rovine, con la clessidra al centro.
// Piani: cielo di cenere (0,2) · torri spezzate e rovine lontane (0,4) · rovine vicine (0,7) · roccia con gli oggetti (1,1) · cenere (1,6)

const r = rng(2053);
const ASH = Array.from({ length: 40 }, () => ({ x: r() * 1280 - 100, y: r() * 2000, s: 2 + r() * 4, v: 20 + r() * 40, ph: r() * 6 }));

const Clessidra: React.FC<{ t: number; scale?: number }> = ({ t, scale = 1 }) => {
  const sand = mod(t * 0.2, 1);
  return (
    <g transform={`scale(${scale})`}>
      <rect x="-70" y="-110" width="140" height="22" rx="6" fill="#C9A458" stroke={K} strokeWidth="7" />
      <rect x="-70" y="88" width="140" height="22" rx="6" fill="#C9A458" stroke={K} strokeWidth="7" />
      {[-60, 60].map((x) => <rect key={x} x={x - 6} y="-90" width="12" height="180" fill="#A88440" stroke={K} strokeWidth="5" />)}
      <path d="M-50 -88 Q-50 -16 -8 0 Q-50 16 -50 88 H50 Q50 16 8 0 Q50 -16 50 -88 Z" fill="#CFE6EE" fillOpacity=".3" stroke="#E8E2D2" strokeWidth="5" />
      <path d={`M-40 ${-78 + 60 * sand} Q0 ${-50 + 60 * sand} 40 ${-78 + 60 * sand} L8 -6 H-8 Z`} fill="#E8C878" />
      <path d={`M-44 86 Q0 ${86 - 56 * sand} 44 86 Z`} fill="#E8C878" />
      <path d="M0 -4 V80" stroke="#E8C878" strokeWidth="3" />
      <path d="M-40 -80 Q-46 -20 -14 -4" stroke="#FFFFFF" strokeWidth="6" fill="none" opacity=".5" />
    </g>
  );
};

const Rovine_: React.FC<{ t: number; dur: number; id: string; objects?: boolean }> = ({ t, dur, id, objects = true }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id={id} />
        <Lin id={`${id}-sky`} stops={[[0, '#141210'], [0.45, '#4A4236'], [0.65, '#7A6A52'], [1, '#3A3228']]} />
        <Lin id={`${id}-tower`} x2={1} y2={0} stops={[[0, '#6A645A'], [1, '#3A3630']]} />
        <Lin id={`${id}-rock`} x2={1} y2={0} stops={[[0, '#3A342C'], [0.5, '#5A5244'], [1, '#2A2620']]} />
        <Lin id={`${id}-ground`} stops={[[0, '#4A4236'], [1, '#14120E']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2320" fill={`url(#${id}-sky)`} />
          <Glow id={`${id}-sun`} x={760} y={900} r={420} t={t} color="#E8C890" amp={0.04} rate={1} opacity={0.35} />
          <circle cx="760" cy="900" r="70" fill="#E8D8B0" opacity=".45" />
        </g>
        <g transform={L(0.4)}>
          {/* le torri della centrale, spezzate */}
          <g transform="translate(260 1100)"><Tower id={`${id}-t1`} t={t} w={230} h={300} fill={`url(#${id}-tower)`} steamOpacity={0} /></g>
          <path d="M150 800 L200 770 L240 800 L290 760 L330 800 L370 790 L380 820 H140 Z" fill="#14120E" />
          <g transform="translate(470 1110)"><Tower id={`${id}-t2`} t={t + 2} w={180} h={230} fill={`url(#${id}-tower)`} steamOpacity={0} /></g>
          <path d="M386 884 L420 860 L470 888 L520 852 L556 884 H386 Z" fill="#14120E" />
          <Smoke id={`${id}-sm`} t={t} x={260} y={800} color="#5A5248" n={8} rise={400} wind={200} r0={40} r1={160} speed={0.1} opacity={0.6} />
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${560 + i * 80} 1110 V${980 - (i % 3) * 50} l20 -20 l14 30 l10 -16 V1110 Z`} fill="#24201A" />)}
          <Fog id={`${id}-f1`} t={t} y={1090} x={540} rx={850} ry={80} color="#8A7A62" opacity={0.4} speed={0.2} />
        </g>
        <g transform={L(0.7)}>
          <path d="M-200 1110 H1280 V2200 H-200 Z" fill={`url(#${id}-ground)`} />
          {[[-60, 1180, 260], [820, 1170, 300]].map(([x, y, w], i) => (
            <g key={i}>
              <path d={`M${x} ${y} l${w * 0.2} -${w * 0.5} l${w * 0.25} ${w * 0.15} l${w * 0.2} -${w * 0.3} l${w * 0.35} ${w * 0.65} Z`} fill="#2E2A22" stroke={K} strokeWidth="7" />
              {[0.3, 0.5, 0.7].map((k) => <rect key={k} x={x + w * k} y={y - w * 0.3} width="18" height="26" fill="#0E0C0A" />)}
            </g>
          ))}
        </g>
        {objects && (
          <g transform={L(1.1)}>
            <path d="M180 1330 Q260 1170 540 1160 Q820 1170 900 1330 Z" fill={`url(#${id}-rock)`} stroke={K} strokeWidth="10" />
            <path d="M240 1250 Q540 1190 840 1250" stroke="#8A8270" strokeWidth="6" fill="none" opacity=".5" />
            <g transform="translate(420 1160) rotate(-14)"><Raincoat id={`${id}-rc`} t={t} scale={0.55} wind={0.2} wet={false} /></g>
            <rect x="320" y="1060" width="200" height="120" fill="#7A6E58" opacity=".35" />
            <g transform="translate(680 1062)"><Clessidra t={t} scale={0.9} /></g>
            <Glow id={`${id}-cl`} x={680} y={1060} r={220} t={t} color="#E8C878" amp={0.08} rate={2} opacity={0.4} />
          </g>
        )}
        <g transform={L(1.6)}>
          {ASH.map((a, i) => <circle key={i} cx={a.x + Math.sin(t + a.ph) * 20} cy={mod(a.y + t * a.v, 2000) - 40} r={a.s} fill="#D8D0C0" opacity=".45" />)}
        </g>
        <g transform={L(1.8)}><NearMotes id={`${id}-near`} t={t} color="#D8D0C0" n={6} vx={-20} vy={20} opacity={0.08} /></g>
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
      <Rovine_ t={t} dur={dur} id="dc2" />
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

/** Gli anni della stagione che si dispongono in cerchio, con la clessidra al centro. */
const Anello: React.FC<{ t: number; years: number[]; accent: string; ink: string; dark: string }> = ({ t, years, accent, ink, dark }) => {
  const close = eio(seg(t, 0.2, 1.4));
  const R = 260, cx = 540, cy = 1020;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <g transform={`translate(${cx} ${cy}) scale(${eob(seg(t, 1.1, 1.6), 1.6)})`}><Clessidra t={t} scale={0.9} /></g>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={accent} strokeWidth="10" strokeLinecap="round" pathLength={1} strokeDasharray={`${close} 1`} transform={`rotate(-90 ${cx} ${cy})`} />
      {years.map((y, i) => {
        const a = -Math.PI / 2 + (i / years.length) * Math.PI * 2;
        const k = eio(seg(t, 0.1 + i * 0.1, 1.1 + i * 0.1));
        const x = lerp(160 + i * 190, cx + Math.cos(a) * R, k), yy = lerp(700, cy + Math.sin(a) * R, k);
        return (
          <g key={y} transform={`translate(${x} ${yy})`}>
            <rect x="-76" y="-30" width="152" height="60" rx="30" fill={i === years.length - 1 ? accent : dark} stroke={accent} strokeWidth="5" />
            <text y="13" textAnchor="middle" fontFamily={DISPLAY} fontWeight={800} fontSize="36" fill={i === years.length - 1 ? dark : ink}>{y}</text>
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
      <Rovine_ t={t + 4} dur={dur} id="de2" objects={false} />
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
