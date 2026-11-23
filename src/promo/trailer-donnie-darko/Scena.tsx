import React from 'react';
import { eio, eo, eob, lerp, seg } from '../../lib/anim';
import { ANTON, SANS } from '../../lib/fonts';
import type { ScenaPromoProps } from '../registro';
import { COPY_DY, GROUND, HIT, Mondo, STARTS, VORTEX, X, ev } from '../../lunghi/donnie-darko-spiegato/Paese';

// Trailer verticale del video lungo «Donnie Darko spiegato» (promo/trailer-donnie-darko.json, TRAILER.md), montato come
// un trailer di cinema: fotogramma 0 = miniatura (la casa di notte, il motore che sta per sfondare il tetto, il titolo),
// poi il colpo, un lampo e il nero.
//  · cold open con le bande nere: cartello «2 OTTOBRE · 1988», la casa con la finestra accesa, il prato e il golf nella nebbia;
//  · tre cartelli che salgono (28 GIORNI · IL FUOCO · IL VORTICE), ognuno con un colpo di ottoni, poi un'inquadratura nuova
//    del mondo del lungo ricomposta per il 9:16: la scuola allagata, la casa che brucia, il vortice all'alba;
//  · montaggio a un'inquadratura per battito (il motore nel tetto, la copia azzurra nel cielo, il fuoco, il vortice);
//  · nero e silenzio: il contatore rosso che pulsa nel buio sotto la battuta; poi il colpo e il titolo sul paese con il
//    vortice e la copia; poi la chiusura con il lettore e i pulsanti.
// Il mondo è quello del lungo (src/lunghi/donnie-darko-spiegato/Paese.tsx) in modalità «pulito» (senza scritte e nodi):
// ogni inquadratura sceglie un istante del racconto (lo stato del paese) e una camera propria.

const INK = '#EEF0F7';
const DARK = '#0A0C1A';
const ENGINE = '#F2A03A';
const RED = '#E8553F';
const COPY = '#7FA6FF';
const BEAT = 1;
const CROMA = 0.5;
const g = (s: number) => Math.round(s / CROMA) * CROMA;
/** I cartelli restano 2 s, poi sfumano nel nero e la scena entra dal nero. */
const CARTELLO = 2;
const pop = (t: number, t0: number) => (t < t0 ? 0 : eob(seg(t, t0, t0 + 0.45), 1.7));

/** Istanti degli eventi (s dall'inizio), uguali nello spartito (scripts/audio/trailer-donnie-darko.mjs). */
export const eventi = (S: Record<string, number>, cue: (id: string, n: number) => number) => ({
  colpo: 3.5, // il motore sfonda il tetto della miniatura
  nero: S.inizio,
  casa: S.inizio + CARTELLO,
  golf: g(S.inizio + 5),
  b1: S.giorni, scuola: S.giorni + CARTELLO,
  b2: S.fuoco, casaFuoco: S.fuoco + CARTELLO,
  b3: S.vortice, cielo: S.vortice + CARTELLO,
  corsa: S.corsa, buio: g(S.corsa + 4 * BEAT),
  hit: g(S.titolo + 2.5),
  fine: S.chiusura,
  like: g(cue('chiusura', 0) + 1.6),
  iscr: g(cue('chiusura', 0) + 2.2),
  press: g(cue('chiusura', 0) + 5.0),
  comm: g(cue('chiusura', 1) + 0.1),
});

/** Un'inquadratura: il mondo all'istante W0 (+ il tempo che passa), camera da c0 a c1. */
type Shot = { a: number; b: number; W0: number; c0: [number, number, number]; c1: [number, number, number]; speed?: number };
type Card = { a: number; b: number; top: string; big: string; color?: string };

const Inquadratura: React.FC<{ s: Shot; t: number }> = ({ s, t }) => {
  const p = eio(seg(t, s.a, s.b));
  const cam = { x: lerp(s.c0[0], s.c1[0], p), y: lerp(s.c0[1], s.c1[1], p), z: Math.exp(lerp(Math.log(s.c0[2]), Math.log(s.c1[2]), p)) };
  return <Mondo T={s.W0 + (t - s.a) * (s.speed ?? 1)} cam={cam} w={1080} h={1920} pulito />;
};

const Cartello: React.FC<{ c: Card; t: number }> = ({ c, t }) => {
  const u = t - c.a;
  const k = eo(seg(u, 0, 0.18));
  const col = c.color ?? ENGINE;
  const flick = (u < 0.25 ? (Math.sin(u * 90) > -0.3 ? 1 : 0.4) : 1) * (1 - seg(t, c.b - 0.3, c.b));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#04050C', fontFamily: SANS, textAlign: 'center' }}>
      <div style={{ position: 'absolute', left: 120, width: 840, top: 680, transform: `scale(${lerp(1.18, 1, eo(seg(u, 0, 1.2))) - 0.04 * seg(u, 1.2, c.b - c.a)})`, opacity: k * flick }}>
        <p style={{ margin: 0, fontSize: 40, fontWeight: 800, letterSpacing: '0.32em', color: INK }}>{c.top}</p>
        <p style={{ margin: '18px 0 0', fontFamily: ANTON, fontSize: 200, lineHeight: 1, color: col, textShadow: `0 0 30px ${col}, 0 0 90px ${col}88` }}>{c.big}</p>
      </div>
    </div>
  );
};

export const Scena: React.FC<ScenaPromoProps> = ({ T: t, tempi, cue }) => {
  const S = tempi.inizio;
  const E = eventi(S, cue);
  const W = STARTS;
  const notte = W.coniglio + 1;

  const shots: Shot[] = [
    // cold open: la casa di notte (la finestra della camera accesa), poi il prato e il golf nella nebbia
    { a: E.casa, b: E.golf, W0: notte, c0: [X.casa + 60, 470, 1.15], c1: [X.casa - 60, 520, 1.3] },
    { a: E.golf, b: E.b1, W0: notte + 3, c0: [X.casa - 700, 600, 1.0], c1: [X.golf + 120, 560, 1.15] },
    // la scuola allagata
    { a: E.scuola, b: E.b2, W0: ev('ordini', 1, 2), c0: [X.scuola, 600, 1.2], c1: [X.scuola, 700, 1.7] },
    // la casa che brucia
    { a: E.casaFuoco, b: E.b3, W0: W.gretchen + 15, c0: [X.cunn, 380, 1.0], c1: [X.cunn + 60, 330, 1.25] },
    // il vortice all'alba
    { a: E.cielo, b: E.corsa, W0: ev('vortice', 0, 2.5), c0: [VORTEX[0], 200, 0.55], c1: [VORTEX[0], -60, 0.7] },
    // montaggio a un battito
    { a: E.corsa, b: E.corsa + BEAT, W0: W.motore + 12, c0: [HIT[0], HIT[1] + 40, 1.7], c1: [HIT[0], HIT[1] + 40, 2.0] },
    { a: E.corsa + BEAT, b: E.corsa + 2 * BEAT, W0: W.copia + 14, c0: [HIT[0], HIT[1] + COPY_DY - 60, 0.8], c1: [HIT[0], HIT[1] + COPY_DY - 60, 0.92] },
    { a: E.corsa + 2 * BEAT, b: E.corsa + 3 * BEAT, W0: W.gretchen + 17, c0: [X.cunn, 300, 1.5], c1: [X.cunn, 280, 1.8] },
    { a: E.corsa + 3 * BEAT, b: E.buio, W0: ev('vortice', 2, 2.5), c0: [VORTEX[0], -170, 0.9], c1: [VORTEX[0], -170, 1.2] },
  ];
  const cards: Card[] = [
    { a: E.nero + 0.25, b: E.casa, top: 'UNA CITTADINA AMERICANA', big: '2 OTTOBRE 1988', color: INK },
    { a: E.b1, b: E.scuola, top: 'IL MONDO FINIRÀ TRA', big: '28 GIORNI', color: RED },
    { a: E.b2, b: E.casaFuoco, top: 'POI ARRIVANO GLI ORDINI', big: 'IL FUOCO' },
    { a: E.b3, b: E.cielo, top: 'ALL\'ALBA', big: 'IL VORTICE', color: COPY },
  ];
  const shot = shots.find((s) => t >= s.a && t < s.b);
  const card = cards.find((c) => t >= c.a && t < c.b);
  const lampo = Math.max(...[E.colpo, E.b1, E.b2, E.b3, E.hit].map((c) => (t >= c ? 1 - seg(t, c, c + 0.35) : 0)));
  const bande = t >= E.nero && t < E.fine;
  const thumb = t < E.nero;
  const tit = t >= E.hit && t < E.fine + 0.6;
  const kt = eo(seg(t, E.hit, E.hit + 0.5)) * (1 - seg(t, E.fine, E.fine + 0.5));

  // ---- chiusura
  const u = t - E.fine;
  const scr = eo(seg(u, 0.15, 0.7));
  const barra = eio(seg(u, 0.6, 3.2));
  const like = pop(t, E.like);
  const iscr = pop(t, E.iscr);
  const premuto = t >= E.press;
  const cerca = seg(u, 1.4, 2.2);
  const comm = eo(seg(t, E.comm, E.comm + 0.4));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#04050C' }}>
      {/* miniatura: la casa dal basso, il motore che sta per colpire (nel lungo è il colpo dell'aggancio, a 1,5 s) */}
      {thumb && <Mondo T={Math.min(1.5, (t * 1.5) / 3.5)} cam={{ x: HIT[0] + 40, y: 160, z: 1.05 + 0.02 * t }} w={1080} h={1920} pulito />}
      {shot && <Inquadratura s={shot} t={t} />}
      {card && <Cartello c={card} t={t} />}
      {/* nel buio: il contatore rosso che pulsa a tempo */}
      {t >= E.buio && t < E.hit && (
        <div style={{ position: 'absolute', inset: 0, background: '#04050C' }}>
          {/* l'immagine emerge piano dal buio prima del titolo (TRAILER.md §5): il paese all'alba, i lampioni che si accendono */}
          {t >= E.hit - 1.2 && (
            <div style={{ position: 'absolute', inset: 0, opacity: 0.4 * eo(seg(t, E.hit - 1.2, E.hit)) }}>
              <Mondo T={ev('vortice', 0, 1) + (t - E.hit)} cam={{ x: VORTEX[0], y: -500, z: 0.42 }} w={1080} h={1920} pulito />
            </div>
          )}
          <div style={{ position: 'absolute', left: 120, width: 840, top: 760, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 92, color: RED,
            opacity: 0.25 + 0.75 * Math.max(0, 1 - ((t - E.buio - CROMA + BEAT) % BEAT) / 0.45), textShadow: `0 0 30px ${RED}`, fontVariantNumeric: 'tabular-nums' }}>
            00:00:00:{String(Math.max(0, Math.ceil(E.hit - t))).padStart(2, '0')}
          </div>
        </div>
      )}
      {tit && t < E.fine && (
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${lerp(1.12, 1, eo(seg(t, E.hit, E.hit + 2.5)))})`, transformOrigin: '540px 1000px' }}>
          <Mondo T={W.porta + 4 + (t - E.hit)} cam={{ x: VORTEX[0], y: -500, z: 0.42 }} w={1080} h={1920} pulito />
        </div>
      )}
      {t >= E.fine && (
        <>
          <Mondo T={notte + u} cam={{ x: X.casa + 100, y: 380, z: 0.95 }} w={1080} h={1920} pulito />
          <div style={{ position: 'absolute', inset: 0, background: DARK, opacity: 0.72 * scr }} />
        </>
      )}

      {bande && (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 230, background: '#000' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 360, background: '#000' }} />
        </>
      )}

      {thumb && (
        <div style={{ position: 'absolute', left: 120, top: 268, width: 840, textAlign: 'center', fontFamily: SANS }}>
          <span style={{ display: 'inline-block', padding: '8px 22px', borderRadius: 10, background: '#D9302A', color: '#FFF', fontSize: 28, fontWeight: 800, letterSpacing: '0.16em' }}>NUOVO SU YOUTUBE</span>
          <p style={{ margin: '18px 0 0', fontSize: 30, fontWeight: 800, letterSpacing: '0.24em', color: ENGINE, textShadow: `0 3px 0 ${DARK}` }}>SPIEGATO SEMPLICE</p>
          <h1 style={{ margin: '8px 0 0', fontFamily: ANTON, fontWeight: 400, fontSize: 190, lineHeight: 0.95, color: INK,
            textShadow: `0 8px 0 ${DARK}, 0 0 40px rgba(127,166,255,.5)` }}>DONNIE<br />DARKO</h1>
          <p style={{ margin: '16px 0 0', fontSize: 40, fontWeight: 800, color: ENGINE, letterSpacing: '0.1em', textShadow: `0 3px 0 ${DARK}` }}>IL FINALE SPIEGATO</p>
          <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 800, color: '#B5BEE2', textShadow: `0 3px 0 ${DARK}` }}>di Richard Kelly · 2001</p>
        </div>
      )}

      {tit && (
        <div style={{ position: 'absolute', left: 120, top: 330, width: 840, textAlign: 'center', fontFamily: SANS, opacity: kt }}>
          <h1 style={{ margin: 0, fontFamily: ANTON, fontWeight: 400, fontSize: 200, lineHeight: 0.94, color: INK,
            transform: `scale(${lerp(1.3, 1, eo(seg(t, E.hit, E.hit + 0.6)))})`, textShadow: `0 8px 0 ${DARK}, 0 0 50px ${COPY}AA` }}>DONNIE<br />DARKO</h1>
          <p style={{ margin: '22px 0 0', fontSize: 46, fontWeight: 800, letterSpacing: '0.22em', color: ENGINE, opacity: seg(t, E.hit + 0.8, E.hit + 1.3),
            textShadow: `0 3px 0 ${DARK}, 0 0 24px ${ENGINE}` }}>IL FINALE SPIEGATO</p>
        </div>
      )}

      {t >= E.fine && (
        <div style={{ position: 'absolute', inset: 0, fontFamily: SANS, color: INK }}>
          <p style={{ position: 'absolute', left: 120, width: 780, top: 280, margin: 0, textAlign: 'center', fontSize: 40, fontWeight: 800, letterSpacing: '0.16em', color: ENGINE,
            opacity: scr, textShadow: `0 3px 0 ${DARK}` }}>ORA SU YOUTUBE</p>
          <div style={{ position: 'absolute', left: 120, top: 350, width: 780, height: 439, borderRadius: 22, overflow: 'hidden', border: `5px solid ${INK}`,
            boxShadow: `0 0 50px ${COPY}66`, opacity: scr, transform: `scale(${0.9 + 0.1 * scr})` }}>
            {/* la miniatura del lungo: il fotogramma 0 (la casa, il motore, il titolo), ridotta in 16:9 */}
            <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: 'scale(0.40625)', transformOrigin: '0 0' }}>
              <Mondo T={0} pulito />
              <div style={{ position: 'absolute', left: 96, top: 170, fontFamily: ANTON, fontSize: 236, lineHeight: 0.95, color: INK, textShadow: `0 10px 0 ${DARK}` }}>DONNIE<br />DARKO</div>
            </div>
            <svg viewBox="-60 -60 120 120" width="120" height="120" style={{ position: 'absolute', left: 330, top: 170 }}>
              <circle r="54" fill="#D9302A" opacity=".92" />
              <path d="M-16 -24 L26 0 L-16 24 Z" fill="#FFF" />
            </svg>
          </div>
          <div style={{ position: 'absolute', left: 120, top: 812, width: 780, opacity: scr }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {['LA STORIA', 'LE REGOLE', 'IL FINALE'].map((l, i) => {
                const f = Math.min(1, Math.max(0, barra * 3 - i));
                return (
                  <div key={l} style={{ flex: 1 }}>
                    <div style={{ height: 14, borderRadius: 7, background: `${INK}44`, overflow: 'hidden' }}>
                      <div style={{ width: `${f * 100}%`, height: '100%', background: '#D9302A' }} />
                    </div>
                    <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: 28, fontWeight: 800, color: f > 0.5 ? ENGINE : INK, textShadow: `0 3px 0 ${DARK}` }}>{l}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ position: 'absolute', left: 120, top: 905, width: 780, height: 270, borderRadius: 28, background: `${DARK}E0`, border: `3px solid ${INK}33`, opacity: scr }} />
          <div style={{ position: 'absolute', left: 120, top: 925, width: 780, display: 'flex', gap: 22, justifyContent: 'center' }}>
            <span style={{ padding: '16px 30px', borderRadius: 999, background: ENGINE, color: DARK, fontSize: 38, fontWeight: 800, transform: `scale(${like})` }}>♥ Metti like</span>
            <span style={{ padding: '16px 30px', borderRadius: 999, background: premuto ? '#5A5470' : '#D9302A', color: '#FFF', fontSize: 38, fontWeight: 800,
              transform: `scale(${iscr * (premuto ? 1 : 1 - 0.08 * seg(t, E.press - 0.15, E.press))})` }}>
              <span style={{ display: 'inline-block', transform: `rotate(${premuto ? Math.sin((t - E.press) * 30) * 18 * (1 - seg(t, E.press, E.press + 0.85)) : 0}deg)` }}>🔔</span>{' '}
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

      {cards.map((c) => (t >= c.b && t < c.b + 0.35 ? <div key={c.a} style={{ position: 'absolute', inset: 0, background: '#04050C', opacity: 1 - seg(t, c.b, c.b + 0.35) }} /> : null))}
      {lampo > 0 && <div style={{ position: 'absolute', inset: 0, background: '#FFF3DA', opacity: 0.9 * lampo }} />}
      <div style={{ position: 'absolute', inset: 0, background: DARK, opacity: 0.4 * seg(t, tempi.fine - 0.6, tempi.fine) }} />
    </div>
  );
};
