import React from 'react';
import { eio, eo, eob, lerp, seg } from '../../lib/anim';
import { RIGHTEOUS, SANS } from '../../lib/fonts';
import { Art as Art1 } from '../../scenes/ritorno-al-futuro/Locandina';
import type { ScenaPromoProps } from '../registro';
import type { ShotProps } from './comune';
import { Orologi } from './Orologi';
import { Garage } from './Garage';
import { Foto } from './Foto';
import { Almanacco } from './Almanacco';
import { Lapide } from './Lapide';
import { Locomotiva } from './Locomotiva';
import { Tachimetro } from './Tachimetro';
import { Scie } from './Scie';

// Trailer verticale del video lungo di Ritorno al futuro (promo/trailer-ritorno-al-futuro.json), montato come un trailer
// di cinema: fotogramma 0 = miniatura (locandina della Parte I con il titolo), poi un lampo e il nero.
//  · cold open con bande nere da cinema: cartello «HILL VALLEY · 1985», il quadrante della torre, l'auto;
//  · tre salti nel tempo, ognuno annunciato da un cartello sul nero (anno al neon + «UN SALTO NEL …») con un colpo di
//    ottoni, poi inquadrature strette sulle locandine già disegnate: la foto che sbiadisce, l'almanacco, il casinò, la
//    lapide, la locomotiva;
//  · montaggio a un'inquadratura per battito, poi taglio al nero e silenzio: la battuta finale sul nero;
//  · il colpo forte, il fulmine e il titolo rivelato solo alla fine; poi la chiusura con il lettore e i pulsanti.
// Inquadrature = ritagli delle tre locandine (src/scenes/ritorno-al-futuro*/Locandina.tsx), con la camera che spinge piano.
// Niente persone, niente auto del film né logo ufficiale (le locandine rispettano già queste regole).

const INK = '#F4EEE2';
const YEL = '#F5C23A';
const DARK = '#0E0A22';
const PINK = '#FF4FB0';
const CYAN = '#5CF0FF';
const CROMA = 60 / 72 / 2;
const BEAT = 2 * CROMA;
const g = (s: number) => Math.round(s / CROMA) * CROMA;
/** I cartelli degli anni restano 5 crome (circa 2 s), poi sfumano nel nero e la scena entra dal nero. */
const CARTELLO = 5 * CROMA;
const pop = (t: number, t0: number) => (t < t0 ? 0 : eob(seg(t, t0, t0 + 0.45), 1.7));

/** Istanti degli eventi (s dall'inizio), uguali nello spartito (scripts/audio/trailer-ritorno-al-futuro.mjs). */
export const eventi = (S: Record<string, number>, cue: (id: string, n: number) => number) => ({
  nero: g(S.inizio - 0.4), // lampo e taglio al nero dopo la miniatura
  torre: S.inizio + CARTELLO,
  auto: g(S.inizio + 4.17),
  b1: S.passato, foto: S.passato + CARTELLO,
  b2: S.futuro, alm: S.futuro + CARTELLO, casino: g(cue('futuro', 1)),
  b3: S.west, lapide: S.west + CARTELLO, treno: g(S.west + 5),
  corsa: S.corsa, buio: g(S.corsa + 4 * BEAT), cruscotto: g(S.corsa + 5 * BEAT), // un battito di nero, poi il cruscotto emerge dal buio
  hit: g(S.titolo + 2.5),
  fine: S.chiusura,
  like: g(cue('chiusura', 0) + 1.6),
  iscr: g(cue('chiusura', 0) + 2.2), // «Iscriviti al canale» compare…
  press: g(cue('chiusura', 0) + 5.0), // …e resta quasi 3 s prima di essere premuto
  comm: g(cue('chiusura', 1) + 0.1),
});

type Poster = 1;
/** Un'inquadratura: ritaglio della locandina `art` centrato su (cx, cy), zoom z → z2 lungo l'inquadratura. */
type Shot = { a: number; b: number; art?: Poster; C?: React.FC<ShotProps>; ev?: number; cx?: number; cy?: number; z?: number; z2?: number; tArt?: number; drift?: number };
/** Un cartello sul nero: anno grande al neon e riga sopra. */
type Card = { a: number; b: number; top: string; big: string; color?: string };

const Inquadratura: React.FC<{ s: Shot; t: number; k: number }> = ({ s, t, k }) => {
  const p = seg(t, s.a, s.b);
  const z = lerp(s.z ?? 1, s.z2 ?? s.z ?? 1, eio(p));
  const cx = (s.cx ?? 540) + (s.drift ?? 0) * p;
  const cy = s.cy ?? 900;
  const ta = (s.tArt ?? 0.9) + (t - s.a);
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0',
      transform: `translate(${540 - cx * z}px, ${900 - cy * z}px) scale(${z})` }}>
      {s.C && <s.C t={(s.tArt ?? 0) + (t - s.a)} dur={s.b - s.a + (s.tArt ?? 0)} id={`ts${k}`} {...(s.ev !== undefined ? { ev: s.ev - s.a + (s.tArt ?? 0) } : {})} />}
      {s.art === 1 && <Art1 t={ta} id={`ts${k}`} />}
    </div>
  );
};

const Cartello: React.FC<{ c: Card; t: number }> = ({ c, t }) => {
  const u = t - c.a;
  const k = eo(seg(u, 0, 0.18));
  const col = c.color ?? YEL;
  const flick = (u < 0.25 ? (Math.sin(u * 90) > -0.3 ? 1 : 0.4) : 1) * (1 - seg(t, c.b - 0.3, c.b));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#05030E', fontFamily: SANS, textAlign: 'center' }}>
      <div style={{ position: 'absolute', left: 120, width: 840, top: 640, transform: `scale(${lerp(1.18, 1, eo(seg(u, 0, 1.2))) - 0.04 * seg(u, 1.2, c.b - c.a)})`, opacity: k * flick }}>
        <p style={{ margin: 0, fontSize: 40, fontWeight: 800, letterSpacing: '0.32em', color: INK }}>{c.top}</p>
        <p style={{ margin: '18px 0 0', fontFamily: RIGHTEOUS, fontSize: 270, lineHeight: 1, color: col, textShadow: `0 0 30px ${col}, 0 0 90px ${col}88` }}>{c.big}</p>
      </div>
    </div>
  );
};

export const Scena: React.FC<ScenaPromoProps> = ({ T: t, tempi, cue }) => {
  const S = tempi.inizio;
  const E = eventi(S, cue);

  // ---- l'elenco delle inquadrature e dei cartelli, in ordine
  const shots: Shot[] = [
    { a: E.torre, b: E.auto, C: Orologi }, // il muro di orologi di Doc
    { a: E.auto, b: E.b1, C: Garage }, // l'auto nel garage, le bobine si accendono
    { a: E.foto, b: E.b2, C: Foto, ev: g(cue('passato', 1) + 1.6) }, // la foto che sbiadisce («sparisce»)
    { a: E.alm, b: E.b3, C: Almanacco, ev: E.casino }, // l'almanacco sotto la pioggia; la torre diventa il casinò
    { a: E.lapide, b: E.treno, C: Lapide, ev: g(S.west + 2.9) }, // la lapide: il vento scopre «DOC» («sta per morire»)
    { a: E.treno, b: E.corsa, C: Locomotiva }, // la locomotiva che spinge l'auto sul ponte
    // montaggio a un battito
    { a: E.corsa, b: E.corsa + BEAT, C: Garage, ev: E.corsa - 2, tArt: 2, cx: 300, cy: 980, z: 1.9, z2: 2.2 }, // le bobine accese
    { a: E.corsa + BEAT, b: E.corsa + 2 * BEAT, C: Almanacco, ev: E.corsa - 2, tArt: 3, cx: 560, cy: 1020, z: 1.7, z2: 2.0 }, // l'almanacco nel 1985 di Biff
    { a: E.corsa + 2 * BEAT, b: E.corsa + 3 * BEAT, C: Lapide, ev: E.corsa - 2, tArt: 3, cx: 520, cy: 990, z: 1.6, z2: 1.9 }, // «DOC» nell'anello rosso
    { a: E.corsa + 3 * BEAT, b: E.buio, C: Locomotiva, tArt: 1, cx: 300, cy: 1000, z: 1.6, z2: 2.0 }, // le ruote della locomotiva
    // nel silenzio, sotto la battuta: il tachimetro che sale fino a 88 sul colpo del titolo
    { a: E.cruscotto, b: E.hit, C: Tachimetro },
  ];
  const cards: Card[] = [
    { a: E.nero + 0.25, b: E.torre, top: 'HILL VALLEY', big: '1985', color: INK },
    { a: E.b1, b: E.foto, top: 'UN SALTO NEL PASSATO', big: '1955' },
    { a: E.b2, b: E.alm, top: 'UN SALTO NEL FUTURO', big: '2015', color: CYAN },
    { a: E.b3, b: E.lapide, top: 'UN SALTO NEL FAR WEST', big: '1885', color: '#F2A65A' },
  ];
  const shot = shots.findIndex((s) => t >= s.a && t < s.b);
  const card = cards.find((c) => t >= c.a && t < c.b);
  const lampo = Math.max(...[E.nero, E.b1, E.b2, E.b3, E.hit].map((c) => (t >= c ? 1 - seg(t, c, c + 0.35) : 0)));
  const bande = t >= E.nero && t < E.fine;

  // ---- miniatura (0 → nero) e titolo rivelato alla fine
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
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#05030E' }}>
      {thumb && <Art1 t={t} id="tr0" />}
      {shot >= 0 && <Inquadratura s={shots[shot]} t={t} k={shot} />}
      {card && <Cartello c={card} t={t} />}
      {tit && t < E.fine && (
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${lerp(1.12, 1, eo(seg(t, E.hit, E.hit + 2.5)))})`, transformOrigin: '540px 1000px' }}>
          <Scie t={t - E.hit} dur={E.fine - E.hit} id="tr9" />
        </div>
      )}
      {t >= E.fine && (
        <>
          <Art1 t={t} id="tr4" calm={1} />
          <div style={{ position: 'absolute', inset: 0, background: DARK, opacity: 0.72 * scr }} />
        </>
      )}

      {/* bande nere da cinema (coprono solo le zone già occupate dalle app) */}
      {bande && (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 230, background: '#000' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 360, background: '#000' }} />
        </>
      )}

      {/* miniatura: bollino, etichetta, titolo, regista (fotogramma 0 completo) */}
      {thumb && (
        <div style={{ position: 'absolute', left: 120, top: 268, width: 840, textAlign: 'center', fontFamily: SANS }}>
          <span style={{ display: 'inline-block', padding: '8px 22px', borderRadius: 10, background: '#D9302A', color: '#FFF', fontSize: 28, fontWeight: 800, letterSpacing: '0.16em' }}>NUOVO SU YOUTUBE</span>
          <p style={{ margin: '18px 0 0', fontSize: 30, fontWeight: 800, letterSpacing: '0.24em', color: YEL, textShadow: `0 3px 0 ${DARK}` }}>SPIEGATO SEMPLICE · TRILOGIA</p>
          <h1 style={{ margin: '8px 0 0', fontFamily: RIGHTEOUS, fontWeight: 400, fontSize: 138, lineHeight: 0.98, color: INK,
            textShadow: `0 8px 0 ${DARK}, 0 0 34px ${PINK}B0, 0 0 70px ${CYAN}59` }}>RITORNO<br />AL FUTURO</h1>
          <p style={{ margin: '16px 0 0', fontSize: 34, fontWeight: 800, color: INK, letterSpacing: '0.08em', textShadow: `0 3px 0 ${DARK}` }}>I TRE FILM IN UN SOLO RACCONTO</p>
          <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 800, color: '#B5CBE2', textShadow: `0 3px 0 ${DARK}` }}>di Robert Zemeckis · 1985–1990</p>
        </div>
      )}

      {/* il titolo rivelato alla fine */}
      {tit && (
        <div style={{ position: 'absolute', left: 120, top: 330, width: 840, textAlign: 'center', fontFamily: SANS, opacity: kt }}>
          <h1 style={{ margin: 0, fontFamily: RIGHTEOUS, fontWeight: 400, fontSize: 150, lineHeight: 0.96, color: INK,
            transform: `scale(${lerp(1.3, 1, eo(seg(t, E.hit, E.hit + 0.6)))})`,
            textShadow: `0 8px 0 ${DARK}, 0 0 40px ${PINK}C0, 0 0 90px ${CYAN}66` }}>RITORNO<br />AL FUTURO</h1>
          <p style={{ margin: '22px 0 0', fontSize: 44, fontWeight: 800, letterSpacing: '0.42em', color: YEL, opacity: seg(t, E.hit + 0.8, E.hit + 1.3),
            textShadow: `0 3px 0 ${DARK}, 0 0 24px ${YEL}` }}>LA TRILOGIA</p>
        </div>
      )}

      {/* chiusura: lettore video generico con la miniatura del lungo, poi i pulsanti */}
      {t >= E.fine && (
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
          <div style={{ position: 'absolute', left: 120, top: 925, width: 780, display: 'flex', gap: 22, justifyContent: 'center' }}>
            <span style={{ padding: '16px 30px', borderRadius: 999, background: YEL, color: DARK, fontSize: 38, fontWeight: 800, transform: `scale(${like})` }}>♥ Metti like</span>
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

      {/* dopo ogni cartello la scena entra dal nero */}
      {cards.map((c) => (t >= c.b && t < c.b + 0.35 ? <div key={c.a} style={{ position: 'absolute', inset: 0, background: '#05030E', opacity: 1 - seg(t, c.b, c.b + 0.35) }} /> : null))}
      {/* il battito di nero prima del cruscotto: una spia gialla che lampeggia a tempo con il ticchettio */}
      {t >= E.buio && t < E.cruscotto + 0.6 && (
        <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0, opacity: 1 - seg(t, E.cruscotto, E.cruscotto + 0.6) }}>
          <defs><radialGradient id="tr-spia"><stop offset="0" stopColor="#FFF0B0" /><stop offset=".3" stopColor={YEL} stopOpacity=".6" /><stop offset="1" stopColor={YEL} stopOpacity="0" /></radialGradient></defs>
          <circle cx="540" cy="860" r={150} fill="url(#tr-spia)" opacity={Math.max(0, 1 - ((t - E.buio - CROMA) % BEAT) / 0.35) * (t > E.buio + CROMA ? 1 : 0)} />
          <circle cx="540" cy="860" r="16" fill={YEL} opacity={0.3 + 0.7 * Math.max(0, 1 - ((t - E.buio - CROMA) % BEAT) / 0.35) * (t > E.buio + CROMA ? 1 : 0)} />
        </svg>
      )}
      {lampo > 0 && <div style={{ position: 'absolute', inset: 0, background: '#FFF6D8', opacity: 0.9 * lampo }} />}
      <div style={{ position: 'absolute', inset: 0, background: DARK, opacity: 0.4 * seg(t, tempi.fine - 0.6, tempi.fine) }} />
    </div>
  );
};
