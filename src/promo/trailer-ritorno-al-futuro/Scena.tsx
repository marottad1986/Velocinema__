import React from 'react';
import { eio, eo, eob, lerp, seg } from '../../lib/anim';
import { RIGHTEOUS, SANS } from '../../lib/fonts';
import { Art as Art1 } from '../../scenes/ritorno-al-futuro/Locandina';
import { Art as Art2 } from '../../scenes/ritorno-al-futuro-parte-2/Locandina';
import { Art as Art3 } from '../../scenes/ritorno-al-futuro-parte-3/Locandina';
import type { ScenaPromoProps } from '../registro';

// Trailer verticale del video lungo di Ritorno al futuro (promo/trailer-ritorno-al-futuro.json).
// Un'immagine per film, le tre locandine già disegnate (src/scenes/ritorno-al-futuro*/Locandina.tsx): torre e fulmine
// (Parte I), l'almanacco su Hill Valley spaccata (Parte II), la locomotiva sul ponte (Parte III). Tra un film e l'altro uno
// stacco da trailer: due scie gialle tratteggiate (il viaggio nel tempo, come negli schemi) attraversano lo schermo,
// lampo bianco e la nuova immagine entra con un piccolo colpo di zoom.
// In alto un contatore d'anni al neon (generico, non il cruscotto del film) che scorre fino all'anno di cui parla la voce.
// Fotogramma 0 = miniatura: bollino «NUOVO SU YOUTUBE», «SPIEGATO SEMPLICE · TRILOGIA», «RITORNO AL FUTURO», la riga
// del regista; nessun sottotitolo. Chiusura: lettore video generico (senza logo) con la miniatura del lungo e la barra
// divisa nei tre film, «Metti like», «Iscriviti al canale» che si preme, «Commenta con il film che vorresti.»
// Niente persone, niente auto del film né logo ufficiale (le locandine rispettano già queste regole).

const INK = '#F4EEE2';
const YEL = '#F5C23A';
const DARK = '#0E0A22';
const PINK = '#FF4FB0';
const CYAN = '#5CF0FF';
const RED = '#E8553F';
const CROMA = 60 / 72 / 2;
const g = (s: number) => Math.round(s / CROMA) * CROMA;
const pop = (t: number, t0: number) => (t < t0 ? 0 : eob(seg(t, t0, t0 + 0.45), 1.7));

/** Istanti degli eventi, uguali nello spartito (scripts/audio/trailer-ritorno-al-futuro.mjs). */
export const eventi = (inizio: Record<string, number>, cue: (id: string, n: number) => number) => ({
  c2: g(inizio.secondo),
  c3: g(inizio.terzo),
  c4: g(inizio.chiusura),
  y1: g(cue('primo', 0) + 2.1), // «… nel 1955»
  y2: g(cue('secondo', 0) + 1.2), // «… nel 2015»
  y2b: g(cue('secondo', 1) + 1.9), // «il loro 1985 diventa un incubo»
  y3: g(cue('terzo', 0) + 2.4), // «… del 1885»
  like: g(cue('chiusura', 0) + 2.4),
  iscr: g(cue('chiusura', 0) + 3.7),
  comm: g(cue('chiusura', 1) + 0.1),
});

/** Contatore d'anni: le cifre scorrono da `da` ad `a` tra t0 e t0 + 0,8 s. */
const anno = (t: number, t0: number, da: number, a: number) => Math.round(lerp(da, a, eio(seg(t, t0, t0 + 0.8))));

const Contatore: React.FC<{ parte: string; y: number; k: number; colore?: string; nota?: string; tremo?: number }> = ({ parte, y, k, colore = YEL, nota, tremo = 0 }) => (
  <div style={{ position: 'absolute', left: 120, top: 290, width: 840, textAlign: 'center', fontFamily: SANS, opacity: k, transform: `translateY(${(1 - k) * -30}px)` }}>
    <span style={{ display: 'inline-block', padding: '10px 26px', borderRadius: 999, background: YEL, color: DARK, fontSize: 32, fontWeight: 800, letterSpacing: '0.18em' }}>{parte}</span>
    <div style={{ margin: '18px auto 0', width: 'fit-content', padding: '6px 40px 14px', borderRadius: 26, background: `${DARK}D0`, border: `4px solid ${colore}`,
      boxShadow: `0 0 40px ${colore}88, inset 0 0 30px ${colore}33`, transform: `translateX(${tremo}px)` }}>
      <span style={{ fontFamily: RIGHTEOUS, fontSize: 190, lineHeight: 1, color: colore, letterSpacing: '0.06em', textShadow: `0 0 24px ${colore}, 0 6px 0 ${DARK}` }}>{y}</span>
    </div>
    {nota && <p style={{ margin: '14px 0 0', fontSize: 34, fontWeight: 800, color: colore, letterSpacing: '0.2em', textShadow: `0 3px 0 ${DARK}` }}>{nota}</p>}
  </div>
);

/** Le due scie gialle tratteggiate che attraversano lo schermo prima dello stacco (da t0 - 0,5 a t0 + 0,15). */
const Scie: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const p = seg(t, t0 - 0.5, t0 + 0.15);
  if (p <= 0 || p >= 1) return null;
  const x = lerp(-1400, 1500, eio(p));
  return (
    <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
      {[860, 1010].map((y, i) => (
        <g key={y} transform={`translate(${x + i * 120} ${y})`}>
          <path d="M-1200 0 H0" stroke={YEL} strokeWidth="60" opacity=".18" strokeLinecap="round" />
          <path d="M-1200 0 H0" stroke={YEL} strokeWidth="18" strokeDasharray="70 34" strokeDashoffset={-t * 900} strokeLinecap="round" />
          <circle r="34" fill="#FFF6B0" opacity=".9" />
        </g>
      ))}
    </svg>
  );
};

/** Una delle tre locandine, con il colpo di zoom all'ingresso e la lenta spinta della camera. */
const Quadro: React.FC<{ t0: number; t: number; dur: number; children: React.ReactNode }> = ({ t0, t, dur, children }) => {
  const u = t - t0;
  const s = 1 + 0.07 * (1 - eo(seg(u, 0, 0.5))) + 0.05 * seg(u, 0, dur);
  return <div style={{ position: 'absolute', inset: 0, transform: `scale(${s})`, transformOrigin: '540px 1000px' }}>{children}</div>;
};

export const Scena: React.FC<ScenaPromoProps> = ({ T: t, tempi, cue }) => {
  const E = eventi(tempi.inizio, cue);
  const fine = tempi.fine;
  const lampo = Math.max(...[E.c2, E.c3, E.c4].map((c) => (t >= c ? 1 - seg(t, c, c + 0.4) : 0)));

  // ---- copertina: titolo; esce quando parte la Parte I
  const tit = 1 - eo(seg(t, tempi.inizio.primo, tempi.inizio.primo + 0.5));
  const k1 = eo(seg(t, tempi.inizio.primo + 0.3, tempi.inizio.primo + 0.8)) * (t < E.c2 ? 1 : 0);
  const k2 = eo(seg(t, E.c2 + 0.1, E.c2 + 0.5)) * (t < E.c3 ? 1 : 0);
  const k3 = eo(seg(t, E.c3 + 0.1, E.c3 + 0.5)) * (t < E.c4 ? 1 : 0);
  const incubo = t >= E.y2b;
  const tremo = incubo ? Math.sin(t * 60) * 6 * (1 - seg(t, E.y2b, E.y2b + 0.6)) : 0;

  // ---- chiusura
  const u = t - E.c4;
  const scr = eo(seg(u, 0.15, 0.7));
  const barra = eio(seg(u, 0.6, 3.2));
  const like = pop(t, E.like);
  const iscr = pop(t, E.iscr);
  const premuto = t >= E.iscr + 0.35;
  const cerca = seg(u, 1.4, 2.2);
  const comm = eo(seg(t, E.comm, E.comm + 0.4));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: DARK }}>
      {t < E.c2 && <Quadro t0={-10} t={t} dur={E.c2 + 10}><Art1 t={t} id="tr1" /></Quadro>}
      {t >= E.c2 && t < E.c3 && <Quadro t0={E.c2} t={t} dur={E.c3 - E.c2}><Art2 t={t - E.c2 + 0.6} id="tr2" /></Quadro>}
      {t >= E.c3 && t < E.c4 && <Quadro t0={E.c3} t={t} dur={E.c4 - E.c3}><Art3 t={t - E.c3 + 0.6} id="tr3" /></Quadro>}
      {t >= E.c4 && (
        <>
          <Art1 t={t} id="tr4" calm={1} />
          <div style={{ position: 'absolute', inset: 0, background: DARK, opacity: 0.72 * scr }} />
        </>
      )}

      {/* copertina: bollino, etichetta, titolo, regista (fotogramma 0 completo) */}
      {tit > 0 && (
        <div style={{ position: 'absolute', left: 120, top: 268, width: 840, textAlign: 'center', fontFamily: SANS, opacity: tit, transform: `translateY(${(1 - tit) * -60}px)` }}>
          <span style={{ display: 'inline-block', padding: '8px 22px', borderRadius: 10, background: '#D9302A', color: '#FFF', fontSize: 28, fontWeight: 800, letterSpacing: '0.16em' }}>NUOVO SU YOUTUBE</span>
          <p style={{ margin: '18px 0 0', fontSize: 30, fontWeight: 800, letterSpacing: '0.24em', color: YEL, textShadow: `0 3px 0 ${DARK}` }}>SPIEGATO SEMPLICE · TRILOGIA</p>
          <h1 style={{ margin: '8px 0 0', fontFamily: RIGHTEOUS, fontWeight: 400, fontSize: 138, lineHeight: 0.98, color: INK,
            textShadow: `0 8px 0 ${DARK}, 0 0 34px ${PINK}B0, 0 0 70px ${CYAN}59` }}>RITORNO<br />AL FUTURO</h1>
          <p style={{ margin: '16px 0 0', fontSize: 34, fontWeight: 800, color: INK, letterSpacing: '0.08em', textShadow: `0 3px 0 ${DARK}` }}>I TRE FILM IN UN SOLO RACCONTO</p>
          <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 800, color: '#B5CBE2', textShadow: `0 3px 0 ${DARK}` }}>di Robert Zemeckis · 1985–1990</p>
        </div>
      )}

      {/* i tre film: cartellino e contatore d'anni */}
      {k1 > 0 && <Contatore parte="PARTE I" y={anno(t, E.y1, 1985, 1955)} k={k1} />}
      {k2 > 0 && <Contatore parte="PARTE II" y={incubo ? 1985 : anno(t, E.y2, 1985, 2015)} k={k2} colore={incubo ? RED : YEL}
        nota={incubo ? 'IL 1985 DI BIFF' : undefined} tremo={tremo} />}
      {k3 > 0 && <Contatore parte="PARTE III" y={anno(t, E.y3, 1985, 1885)} k={k3} />}

      {/* chiusura: lettore video generico con la miniatura del lungo, poi i pulsanti */}
      {t >= E.c4 && (
        <div style={{ position: 'absolute', inset: 0, fontFamily: SANS, color: INK }}>
          <p style={{ position: 'absolute', left: 120, width: 840, top: 280, margin: 0, textAlign: 'center', fontSize: 40, fontWeight: 800, letterSpacing: '0.16em', color: YEL,
            opacity: scr, textShadow: `0 3px 0 ${DARK}` }}>ORA SU YOUTUBE</p>
          <div style={{ position: 'absolute', left: 120, top: 350, width: 780, height: 439, borderRadius: 22, overflow: 'hidden', border: `5px solid ${INK}`,
            boxShadow: `0 0 50px ${PINK}66`, opacity: scr, transform: `scale(${0.9 + 0.1 * scr})` }}>
            {/* la miniatura: la torre colpita dal fulmine, ritagliata in 16:9 */}
            <div style={{ position: 'absolute', left: -110, top: -620, width: 1080, height: 1920, transform: 'scale(0.92)', transformOrigin: '0 0' }}>
              <Art1 t={0.1} id="tr5" />
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, padding: '20px 26px', background: `linear-gradient(${DARK}E6, ${DARK}00)` }}>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '0.2em', color: YEL }}>SPIEGATO SEMPLICE · TRILOGIA</p>
              <p style={{ margin: '4px 0 0', fontFamily: RIGHTEOUS, fontSize: 62, lineHeight: 1, color: INK, textShadow: `0 4px 0 ${DARK}, 0 0 20px ${PINK}` }}>RITORNO AL FUTURO</p>
            </div>
            <svg viewBox="-60 -60 120 120" width="120" height="120" style={{ position: 'absolute', left: 330, top: 170 }}>
              <circle r="54" fill="#D9302A" opacity=".92" />
              <path d="M-16 -24 L26 0 L-16 24 Z" fill="#FFF" />
            </svg>
          </div>
          {/* la barra di avanzamento divisa nei tre film */}
          <div style={{ position: 'absolute', left: 120, top: 812, width: 780, opacity: scr }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {['I · 1955', 'II · 2015', 'III · 1885'].map((l, i) => {
                const f = Math.min(1, Math.max(0, barra * 3 - i));
                return (
                  <div key={l} style={{ flex: 1 }}>
                    <div style={{ height: 14, borderRadius: 7, background: `${INK}44`, overflow: 'hidden' }}>
                      <div style={{ width: `${f * 100}%`, height: '100%', background: '#D9302A' }} />
                    </div>
                    <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: 30, fontWeight: 800, color: f > 0.5 ? YEL : INK, textShadow: `0 3px 0 ${DARK}` }}>{l}</p>
                  </div>
                );
              })}
            </div>
          </div>
          {/* pulsanti e scritte su un riquadro scuro, così si leggono sopra la torre */}
          <div style={{ position: 'absolute', left: 120, top: 905, width: 780, height: 270, borderRadius: 28, background: `${DARK}E0`, border: `3px solid ${INK}33`, opacity: scr }} />
          {/* pulsanti */}
          <div style={{ position: 'absolute', left: 120, top: 925, width: 780, display: 'flex', gap: 22, justifyContent: 'center' }}>
            <span style={{ padding: '16px 30px', borderRadius: 999, background: YEL, color: DARK, fontSize: 38, fontWeight: 800, transform: `scale(${like})` }}>♥ Metti like</span>
            <span style={{ padding: '16px 30px', borderRadius: 999, background: premuto ? '#5A5470' : '#D9302A', color: '#FFF', fontSize: 38, fontWeight: 800,
              transform: `scale(${iscr * (premuto ? 1 : 1 - 0.08 * seg(t, E.iscr + 0.2, E.iscr + 0.35))})` }}>
              <span style={{ display: 'inline-block', transform: `rotate(${premuto ? Math.sin((t - E.iscr) * 30) * 18 * (1 - seg(t, E.iscr + 0.35, E.iscr + 1.2)) : 0}deg)` }}>🔔</span>{' '}
              {premuto ? 'Iscritto ✓' : 'Iscriviti al canale'}
            </span>
          </div>
          <p style={{ position: 'absolute', left: 120, width: 780, top: 1048, margin: 0, textAlign: 'center', fontSize: 34, fontWeight: 800, opacity: seg(u, 1.2, 1.5), textShadow: `0 3px 0 ${DARK}` }}>
            Cerca «{'In 2 Minuti'.slice(0, Math.round(cerca * 11))}{cerca < 1 && Math.sin(t * 12) > 0 ? '|' : ''}» su YouTube
          </p>
          <p style={{ position: 'absolute', left: 120, width: 780, top: 1108, margin: 0, textAlign: 'center', fontSize: 38, fontWeight: 800, opacity: comm,
            transform: `translateY(${(1 - comm) * 12}px)`, textShadow: `0 3px 0 ${DARK}` }}>
            Commenta con il film che vorresti.
          </p>
        </div>
      )}

      <Scie t={t} t0={E.c2} />
      <Scie t={t} t0={E.c3} />
      <Scie t={t} t0={E.c4} />
      {lampo > 0 && <div style={{ position: 'absolute', inset: 0, background: '#FFF6D8', opacity: 0.85 * lampo }} />}
      {/* l'ultima mezza battuta sfuma verso lo scuro */}
      <div style={{ position: 'absolute', inset: 0, background: DARK, opacity: 0.4 * seg(t, fine - 0.6, fine) }} />
    </div>
  );
};
