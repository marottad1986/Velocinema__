import React from 'react';
import { camera, eo, eob, lerp, mod, rng, seg } from '../../lib/anim';
import { DISPLAY, SANS, TYPEWRITER } from '../../lib/fonts';
import { Finish, FxDefs, Lin } from '../../lib/fx';
import { Fog, Glow, NearMotes, SunRays } from '../../lib/elements';
import type { PosterProps } from '../../types';
import { Speciale } from '../../components/Speciale';
import { Hotel, K, Maze } from './Comuni';

// Copertina e finale di Shining. Locandina originale: niente volto a puntini né volto dietro la porta, niente persone,
// niente tappeto del film. Copertina: notte di tormenta, l'albergo con poche finestre accese, il labirinto innevato
// visto dall'alto e, in primo piano, la macchina da scrivere con il foglio pieno di righe uguali.
// Finale: l'albergo all'alba sotto la neve, una sola finestra accesa, le tracce del mezzo per la neve che se ne vanno.

const r = rng(237);
const SNOW = Array.from({ length: 60 }, () => ({ x: r() * 1400 - 160, y: r() * 2000, s: 3 + r() * 8, v: 200 + r() * 300 }));

// Macchina da scrivere della copertina, più grande e dettagliata di quella dei capitoli: il foglio è pieno di righe
// tutte uguali (la stessa frase ripetuta, senza scriverla) e fra 1,1 e 2,4 s batte da sola l'ultima riga (stesso istante
// del suono nello spartito): martelletti che scattano, tasti che si abbassano, carrello che scorre.
const WORDS = [32, 14, 24, 12, 28, 18, 22]; // larghezze delle parole: uguali in ogni riga
const ROW = WORDS.reduce((a, w) => a + w + 10, 0);
const TYPE0 = 1.1, TYPE1 = 2.4;

const CoverTypewriter: React.FC<{ x: number; y: number; s: number; t: number; accent: string }> = ({ x, y, s, t, accent }) => {
  const p = seg(t, TYPE0, TYPE1);
  const typing = t >= TYPE0 && t < TYPE1;
  const tick = Math.floor(t * 10);
  const strike = typing ? 1 - mod(t * 10, 1) : 0; // martelletto: scatta a ogni battuta
  const shift = -p * 120; // il carrello scorre verso sinistra mentre si scrive
  const rowWords = (fill: number) => {
    let acc = 0;
    return WORDS.map((w, i) => {
      const x0 = acc; acc += w + 10;
      const vis = Math.max(0, Math.min(w, fill * ROW - x0));
      return vis > 0 ? <rect key={i} x={-110 + x0} y={-2} width={vis} height={6} rx={2} fill="#2E2A26" /> : null;
    });
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
      {/* foglio con il carrello */}
      <g transform={`translate(${shift} 0)`}>
        <path d="M-124 -180 H124 L120 -40 H-120 Z" fill="#F4F0E4" stroke={K} strokeWidth="5" />
        <path d="M-124 -180 H124 L123 -168 H-123 Z" fill="#E4DCC8" opacity=".6" />
        {Array.from({ length: 6 }, (_, i) => <g key={i} transform={`translate(0 ${-160 + i * 16})`}>{rowWords(1)}</g>)}
        <g transform="translate(0 -66)">{rowWords(p)}</g>
        {/* rullo con le manopole */}
        <rect x="-170" y="-58" width="340" height="38" rx="18" fill="#1E1E22" stroke={K} strokeWidth="6" />
        <path d="M-160 -48 H160" stroke="#4A4A52" strokeWidth="4" />
        <circle cx="-182" cy="-39" r="16" fill="#5A5A60" stroke={K} strokeWidth="4" />
        <circle cx="182" cy="-39" r="16" fill="#5A5A60" stroke={K} strokeWidth="4" />
        <path d="M168 -58 l48 -26" stroke={K} strokeWidth="9" strokeLinecap="round" />
        <path d="M168 -58 l48 -26" stroke="#8A8A90" strokeWidth="3" strokeLinecap="round" />
      </g>
      {/* corpo */}
      <path d="M-190 -20 H190 L224 80 H-224 Z" fill="#2E3A34" stroke={K} strokeWidth="8" />
      <path d="M-180 -20 H180 L190 8 H-190 Z" fill="#3E4C44" />
      <path d="M-186 -12 H186" stroke="#7A8A80" strokeWidth="3" opacity=".8" />
      {/* cesto dei martelletti e martelletto che scatta */}
      <path d="M-60 -20 Q0 -44 60 -20" fill="#1A201C" stroke={K} strokeWidth="5" />
      <path d={`M0 -20 L${-14 + 14 * strike} ${-20 - 30 * strike}`} stroke="#C8C8CE" strokeWidth="5" strokeLinecap="round" opacity={typing ? 1 : 0} />
      {/* tasti: si abbassano mentre la macchina batte da sola */}
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 11 }, (_, c) => {
        const k = r * 11 + c;
        const press = typing && (tick * 7) % 44 === k ? 4 : 0;
        return <circle key={k} cx={-160 + c * 30 + r * 7} cy={14 + r * 16 + press} r="7.5" fill="#E8E2D0" stroke={K} strokeWidth="2.5" />;
      }))}
      <rect x="-110" y="76" width="220" height="14" rx="6" fill="#1E1E22" stroke={K} strokeWidth="4" />
      <rect x="-224" y="80" width="448" height="12" rx="4" fill="#1A201C" stroke={K} strokeWidth="5" />
      {/* l'unico punto di rosso: la spia sul frontale */}
      <circle cx="0" cy="-6" r="6" fill={accent} />
    </g>
  );
};

const Copertina_: React.FC<{ t: number; dur: number; accent: string }> = ({ t, dur, accent }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  // sul graffio del gong (2,2 s) le finestre si spengono di colpo e si riaccendono; una resta rossa
  const blink = t >= 2.2 && t < 2.42;
  const red = eo(seg(t, 2.42, 2.9));
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sc" />
        <Lin id="sc-sky" stops={[[0, '#05070C'], [0.45, '#141C28'], [0.8, '#2E3A4E'], [1, '#3A475C']]} />
        <Lin id="sc-ground" stops={[[0, '#C8D4E0'], [0.5, '#7A8A9E'], [1, '#3A4656']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="2400" fill="url(#sc-sky)" />
          {/* chiarore della luna dietro le nuvole: stacca la sagoma dell'albergo */}
          <Glow id="sc-moon" x={540} y={800} r={560} t={t} color="#9AB0CC" amp={0.03} rate={0.6} opacity={0.35} />
        </g>
        <g transform={L(0.4)}>
          <Glow id="sc-hg" x={540} y={900} r={460} t={t} color="#FFC870" amp={0.04} rate={1} opacity={blink ? 0.05 : 0.24} />
          <Hotel x={540} y={1010} s={0.8} t={t} lit={blink ? 0 : 0.55} snow={1} />
          {/* la finestra che resta rossa (centro, secondo piano) */}
          <Glow id="sc-red" x={527} y={879} r={100} t={t} color={accent} amp={0.1} rate={2} opacity={0.7 * red} />
          <rect x={516.8} y={866} width={20.8} height={25.6} fill={accent} opacity={red} />
          <Fog id="sc-fog" t={t} y={1005} color="#C8D4E0" rx={900} ry={60} opacity={0.5} />
        </g>
        <g transform={L(0.6)}>
          <path d="M-200 1005 H1280 V2200 H-200 Z" fill="url(#sc-ground)" />
          <Maze x={540} y={1170} w={940} h={240} persp={0.62} snow={1} />
        </g>
        <g transform={L(1.0)}>
          <Glow id="sc-tw" x={540} y={1180} r={360} t={t} color="#FFD8A0" amp={0.06} rate={2} opacity={0.45} />
          <CoverTypewriter x={540} y={1300} s={1.4} t={t} accent={accent} />
        </g>
        <g transform={L(1.6)}>
          {SNOW.map((f, i) => <circle key={i} cx={mod(f.x - t * 220, 1440) - 180} cy={mod(f.y + t * f.v, 2000)} r={f.s} fill="#F4F6FA" opacity=".5" />)}
          <NearMotes id="sc-near" t={t} color="#F4F6FA" n={6} vx={-140} opacity={0.12} />
        </g>
      </g>
      <Finish id="sc" tint="#1A2A3A" tintOpacity={0.12} />
    </svg>
  );
};

const Finale_: React.FC<{ t: number; dur: number }> = ({ t, dur }) => {
  const cam = camera(t, dur, 540, 1100);
  const L = cam.layer;
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <FxDefs id="sf" />
        <Lin id="sf-sky" stops={[[0, '#3A4A6A'], [0.45, '#C8A8A8'], [0.6, '#F4E4D8']]} />
        <Lin id="sf-snow" stops={[[0, '#F4F0EC'], [1, '#A8B4C4']]} />
      </defs>
      <g transform={cam.transform}>
        <g transform={L(0.2)}>
          <rect x="-200" y="-200" width="1480" height="1500" fill="url(#sf-sky)" />
          <SunRays id="sf-rays" x={860} y={1000} t={t} color="#FFE8C8" n={9} length={1000} opacity={0.3} />
        </g>
        <g transform={L(0.4)}>
          <Hotel x={540} y={1020} s={0.75} t={t} one snow={1} litColor="#FFC870" />
        </g>
        <g transform={L(0.7)}>
          <path d="M-200 1020 H1280 V2200 H-200 Z" fill="url(#sf-snow)" />
          <path d="M900 1030 Q960 1160 1040 1260 Q1140 1380 1300 1440" stroke="#8A96A8" strokeWidth="24" strokeDasharray="10 8" fill="none" />
          <path d="M870 1030 Q920 1180 990 1290 Q1080 1420 1260 1520" stroke="#8A96A8" strokeWidth="24" strokeDasharray="10 8" fill="none" />
        </g>
        <g transform={L(1.6)}><NearMotes id="sf-near" t={t} color="#FFFFFF" n={6} y0={1300} opacity={0.1} /></g>
      </g>
      <Finish id="sf" tint="#1A2A3A" tintOpacity={0.08} />
    </svg>
  );
};

export const Copertina: React.FC<PosterProps> = ({ t, dur, film }) => {
  const P = film.palette;
  // Fotogramma 0 = miniatura del post: etichetta, titolo, regista e frase di lancio già a schermo, niente dissolvenze.
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Copertina_ t={t} dur={dur} accent={P.accento} />
      <div style={{ position: 'absolute', left: 120, top: 290, width: 840, fontFamily: SANS, color: P.chiaro }}>
        <p style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '0.3em', color: P.chiaro, textShadow: `0 2px 0 ${P.scuro}` }}>IL FILM IN 2 MINUTI<Speciale nome={film.copertina.speciale} /></p>
        <h1 style={{ margin: '14px 0 0', fontFamily: TYPEWRITER, fontWeight: 400, fontSize: 200, lineHeight: 0.95, letterSpacing: '0.04em', color: P.accento,
          textShadow: `0 6px 0 ${P.scuro}` }}>
          SHINING
        </h1>
        <p style={{ margin: '20px 0 0', fontSize: 40, fontWeight: 800, color: P.chiaro, textShadow: `0 3px 0 ${P.scuro}` }}>un film di {film.regista} · {film.anno}</p>
      </div>
      <p style={{ position: 'absolute', left: 120, right: 180, top: 1384, margin: '0 auto', width: 'fit-content', maxWidth: 780, boxSizing: 'border-box', padding: '12px 26px 14px',
        borderRadius: 16, background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, fontSize: 40, fontWeight: 800, textAlign: 'center' }}>
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
      <Finale_ t={t} dur={dur} />
      <div style={{ position: 'absolute', left: 120, top: 300, width: 840, boxSizing: 'border-box', padding: '40px 40px 36px', borderRadius: 32,
        background: `${P.scuro}D9`, color: P.chiaro, fontFamily: SANS, textAlign: 'center', opacity: card, transform: `translateY(${(1 - card) * 24}px)` }}>
        <p style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 72, lineHeight: 1 }}>Ti è piaciuto?</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 34 }}>
          <span style={{ padding: '18px 34px', borderRadius: 999, background: P.accento, color: P.chiaro, fontSize: 42, fontWeight: 800, transform: `scale(${b1})` }}>♥ Metti like</span>
          <span style={{ padding: '15px 31px', borderRadius: 999, border: `3px solid ${P.chiaro}`, fontSize: 42, fontWeight: 800, transform: `scale(${b2})` }}>Segui la pagina</span>
        </div>
        <p style={{ margin: '30px 0 0', fontSize: 34, fontWeight: 400, opacity: seg(t, 1.0, 1.4) }}>Commenta con il film che vorresti.</p>
      </div>
      <h1 style={{ position: 'absolute', left: 0, right: 0, top: 1110, margin: 0, textAlign: 'center', fontFamily: TYPEWRITER, fontWeight: 400, fontSize: 170, lineHeight: 1,
        color: P.accento, textShadow: `0 6px 0 ${P.scuro}`, opacity: seg(t, 0.3, 0.6), transform: `scale(${lerp(0.9, 1, end)})` }}>
        THE END
      </h1>
    </div>
  );
};
