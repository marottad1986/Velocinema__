import React from 'react';
import { eio, eo, eob, lerp, seg } from '../../lib/anim';
import { ANTON, HAND, SANS } from '../../lib/fonts';
import { Corridoio } from '../../lib/liminale';
import type { ScenaPromoProps } from '../registro';
import { Mondo } from '../../lunghi/backrooms-spiegato/Mondo';
import { STARTS, ev } from '../../lunghi/backrooms-spiegato/Tempi';
import { PirataPov, PortaInFondo, SulMuro } from '../../lunghi/backrooms-spiegato/Pov';
import { L0, X } from '../../lunghi/backrooms-spiegato/Luoghi';

// Trailer verticale del video lungo «Backrooms spiegato» (promo/trailer-backrooms.json, TRAILER.md), montato come un
// trailer di cinema: fotogramma 0 = miniatura (il corridoio giallo infinito in verticale, la porta socchiusa in fondo con
// l'anello rosso, «DOVE SEI?» sul muro, il titolo), poi i neon si spengono dal fondo verso di noi e resta il nero.
//  · cold open con le bande nere: cartello «12 MAGGIO 2019», la foto della stanza gialla che si allarga fino a diventare
//    il corridoio, che comincia a scorrere;
//  · tre cartelli che salgono (LIVELLO 0 · IL NEGOZIO · LE COPIE), ognuno con un colpo di ottoni, poi un'inquadratura
//    nuova: il corridoio con la scritta sul muro, il negozio con la fessura nel seminterrato, la sala da pranzo copiata;
//  · montaggio a un'inquadratura per battito (la fessura, il cappello gigante, l'anello di Async, la stanzetta copiata);
//  · nero: un solo neon che sfarfalla a tempo; poi i neon si riaccendono uno alla volta verso il fondo, il colpo e il
//    titolo sul corridoio pieno di luce; poi la chiusura con il lettore e i pulsanti.
// Inquadrature: il mondo del lungo in modalità «pulito» (senza scritte) e il corridoio di src/lib/liminale.tsx in 9:16.

const INK = '#F4E9B8';
const DARK = '#0C0B06';
const YEL = '#E8D36A';
const RED = '#E0443A';
const BEAT = 0.8;
const CROMA = 0.4;
const g = (s: number) => Math.round(s / CROMA) * CROMA;
/** I cartelli restano circa 2 s (5 crome), poi sfumano nel nero e la scena entra dal nero. */
const CARTELLO = 5 * CROMA;
const pop = (t: number, t0: number) => (t < t0 ? 0 : eob(seg(t, t0, t0 + 0.45), 1.7));

/** Istanti degli eventi (s dall'inizio), uguali nello spartito (scripts/audio/trailer-backrooms.mjs). */
export const eventi = (S: Record<string, number>, cue: (id: string, n: number) => number) => ({
  spegni: 3.2, // i neon della miniatura si spengono
  nero: S.inizio,
  foto: S.inizio + CARTELLO,
  b1: S.livello, l0: S.livello + CARTELLO,
  b2: S.negozio, neg: S.negozio + CARTELLO,
  b3: S.copie, cop: S.copie + CARTELLO,
  corsa: S.corsa, buio: S.corsa + 5 * BEAT,
  hit: S.titolo + 3 * BEAT,
  fine: S.chiusura,
  like: g(cue('chiusura', 0) + 1.6),
  iscr: g(cue('chiusura', 0) + 2.4),
  press: g(cue('chiusura', 0) + 5.2),
  comm: g(cue('chiusura', 1) + 0.0),
});

const V = { w: 1080, h: 1920 };
/** Il corridoio in verticale. */
const Cor: React.FC<{ T: number; z: number; spenti?: (i: number) => number; children?: React.ReactNode; oggetti?: React.ComponentProps<typeof Corridoio>['oggetti']; rotto?: number; luce?: number; id: string; x?: number }> = (p) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
    <Corridoio T={p.T} z={p.z} w={1080} h={1920} id={p.id} seed={3} spenti={p.spenti} oggetti={p.oggetti} rotto={p.rotto} luce={p.luce} x={p.x ?? 0} />
    {p.children}
  </svg>
);
/** Converte «neon i spento» (i dal tratto della camera) per Corridoio. */
const rel = (f: (i: number) => number, z: number) => (i: number) => f(i - Math.floor(z / 3));

type Card = { a: number; b: number; top: string; big: string; color?: string };
const Cartello: React.FC<{ c: Card; t: number }> = ({ c, t }) => {
  const u = t - c.a;
  const k = eo(seg(u, 0, 0.18));
  const col = c.color ?? YEL;
  const flick = (u < 0.25 ? (Math.sin(u * 90) > -0.3 ? 1 : 0.4) : 1) * (1 - seg(t, c.b - 0.3, c.b));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#050402', fontFamily: SANS, textAlign: 'center' }}>
      <div style={{ position: 'absolute', left: 120, width: 840, top: 680, transform: `scale(${lerp(1.18, 1, eo(seg(u, 0, 1.2))) - 0.04 * seg(u, 1.2, c.b - c.a)})`, opacity: k * flick }}>
        <p style={{ margin: 0, fontSize: 40, fontWeight: 800, letterSpacing: '0.3em', color: INK }}>{c.top}</p>
        <p style={{ margin: '18px 0 0', fontFamily: ANTON, fontSize: 190, lineHeight: 1, color: col, textShadow: `0 0 30px ${col}, 0 0 90px ${col}88` }}>{c.big}</p>
      </div>
    </div>
  );
};

export const Scena: React.FC<ScenaPromoProps> = ({ T: t, tempi, cue }) => {
  const S = tempi.inizio;
  const E = eventi(S, cue);
  const Y0 = (L0.top + L0.bot) / 2;
  const cards: Card[] = [
    { a: E.nero + 0.25, b: E.foto, top: 'UNA FOTO SU INTERNET', big: '12 MAGGIO 2019', color: INK },
    { a: E.b1, b: E.l0, top: 'IL PRIMO LIVELLO', big: 'LIVELLO 0' },
    { a: E.b2, b: E.neg, top: 'UN UOMO, UNA FESSURA', big: 'IL NEGOZIO', color: '#F2B04A' },
    { a: E.b3, b: E.cop, top: 'QUALCOSA COPIA TUTTO', big: 'LE COPIE', color: '#C8C2B0' },
  ];
  const card = cards.find((c) => t >= c.a && t < c.b);
  const lampo = Math.max(...[E.b1, E.b2, E.b3, E.hit].map((c) => (t >= c ? 1 - seg(t, c, c + 0.35) : 0)));
  const bande = t >= E.nero && t < E.fine;
  const thumb = t < E.nero;
  const tit = t >= E.hit && t < E.fine + 0.6;
  const kt = eo(seg(t, E.hit, E.hit + 0.5)) * (1 - seg(t, E.fine, E.fine + 0.5));
  const cor = S.corsa;

  // ---- chiusura
  const u = t - E.fine;
  const scr = eo(seg(u, 0.15, 0.7));
  const barra = eio(seg(u, 0.6, 3.2));
  const like = pop(t, E.like);
  const iscr = pop(t, E.iscr);
  const premuto = t >= E.press;
  const cerca = seg(u, 1.4, 2.2);
  const comm = eo(seg(t, E.comm, E.comm + 0.4));

  const anelloPorta = (k: number) => (p: (x: number, y: number, z: number) => { x: number; y: number; s: number } | null) => {
    const c = p(0, 1.1, 22);
    return c && k > 0 ? <circle cx={c.x} cy={c.y} r={c.s * 1.35} fill="none" stroke={RED} strokeWidth={10} strokeDasharray={`${c.s * 0.7} ${c.s * 0.25}`} strokeDashoffset={-t * 40} opacity={k} /> : null;
  };

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#050402' }}>
      {/* miniatura: il corridoio in verticale, la porta socchiusa in fondo; poi i neon si spengono dal fondo */}
      {thumb && (
        <Cor T={t} z={t * 0.5} id="tr-thumb" spenti={rel((i) => seg(t, E.spegni + (14 - i) * 0.03, E.spegni + (14 - i) * 0.03 + 0.08), t * 0.5)}
          oggetti={(p) => (
            <g>
              <PortaInFondo p={p} z={22} T={t} apre={0.3} />
              <SulMuro p={p} side={1} z={18} y={1.35} text="DOVE SEI?" size={150} color="#7A1A10" />
              {anelloPorta(1 - seg(t, E.spegni - 0.4, E.spegni))(p)}
            </g>
          )}>
          <rect width={1080} height={1920} fill="#000" opacity={seg(t, E.spegni + 0.3, E.nero)} />
        </Cor>
      )}
      {/* cold open: la foto della stanza gialla che si allarga fino a diventare il corridoio */}
      {t >= E.foto && t < E.b1 && (() => {
        const k = eio(seg(t, E.foto + 1.2, E.b1 - 0.4));
        const s = lerp(0.62, 3.2, k);
        return (
          <Cor T={t} z={10 + Math.max(0, t - E.foto - 2) * 0.9} id="tr-foto">
            <g transform={`translate(540 810) scale(${s}) translate(-540 -960)`}>
              <path fillRule="evenodd" d="M-3000 -3000 H4080 V4920 H-3000 Z M150 520 H930 V1400 H150 Z" fill="#050402" />
              <path fillRule="evenodd" d="M110 480 H970 V1560 H110 Z M150 520 H930 V1400 H150 Z" fill="#F4F0E4" stroke="#1C170C" strokeWidth={6} />
              <text x={540} y={1490} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={56} fill="#3A3020">12/05/2019</text>
            </g>
          </Cor>
        );
      })()}
      {/* LIVELLO 0: il corridoio con la scritta sul muro */}
      {t >= E.l0 && t < E.b2 && (
        <Cor T={t} z={30 + (t - E.l0) * 1.3} id="tr-l0" x={-0.3} rotto={0.5}
          oggetti={(p) => <SulMuro p={p} side={-1} z={46} y={1.9} text="LIVELLO 0" size={105} color="#3A2A10" font={SANS} />} />
      )}
      {/* il negozio di mobili con la fessura nel seminterrato */}
      {t >= E.neg && t < E.b3 && (
        <Mondo T={ev('fessura', 1, 1.5) + (t - E.neg)} cam={{ x: X.fessura - 180 + (t - E.neg) * 20, y: 60 + (t - E.neg) * 14, z: 1.3 + (t - E.neg) * 0.05 }} w={1080} h={1920} pulito />
      )}
      {/* la sala da pranzo copiata */}
      {t >= E.cop && t < cor && (
        <Mondo T={ev('tavola', 2, 2.5) + (t - E.cop)} cam={{ x: X.tavola + 20, y: Y0 - 30, z: 2.1 + (t - E.cop) * 0.06 }} w={1080} h={1920} pulito />
      )}
      {/* montaggio a un battito */}
      {t >= cor && t < cor + BEAT && <Mondo T={ev('fessura', 1, 2)} cam={{ x: X.fessura, y: 120, z: 2.6 + (t - cor) * 0.3 }} w={1080} h={1920} pulito />}
      {t >= cor + BEAT && t < cor + 2 * BEAT && (
        <Cor T={t} z={400 - (t - cor) * 3} id="tr-pir" rotto={1} x={0.5} oggetti={(p) => <PirataPov p={p} z={400 - (t - cor) * 3 + 7} T={t} rotto={0} />} />
      )}
      {t >= cor + 2 * BEAT && t < cor + 3 * BEAT && <Mondo T={ev('async', 1, 1.5)} cam={{ x: X.anello, y: 160, z: 2.0 + (t - cor) * 0.2 }} w={1080} h={1920} pulito />}
      {t >= cor + 3 * BEAT && t < E.buio && <Mondo T={STARTS.montaggio + 15} cam={{ x: X.copiaStanza, y: Y0 + 10, z: 2.4 + (t - cor) * 0.2 }} w={1080} h={1920} pulito />}
      {card && <Cartello c={card} t={t} />}
      {/* nel buio: un solo neon che sfarfalla a tempo; poi i neon si riaccendono uno alla volta verso il fondo */}
      {t >= E.buio && t < E.hit && (() => {
        // nel buio un solo neon sfarfalla a tempo (TRAILER.md §5), poi i neon si riaccendono a scatti verso il fondo
        const lampo = Math.max(0, 1 - ((t - E.buio) % BEAT) / 0.35) * (t < E.hit - 0.4 ? 1 : 0);
        const scatti = Math.floor(seg(t, E.hit - 1.6, E.hit) * 6) / 6;
        return (
          <div style={{ position: 'absolute', inset: 0, background: '#050402' }}>
            <Cor T={t} z={50} id="tr-buio" />
            <div style={{ position: 'absolute', inset: 0, background: '#050402', opacity: 0.95 * (1 - scatti) }} />
            <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
              <defs>
                <radialGradient id="tr-neon-luce"><stop offset="0" stopColor="#FFF4B8" stopOpacity=".9" /><stop offset=".4" stopColor="#FFF4B8" stopOpacity=".3" /><stop offset="1" stopColor="#FFF4B8" stopOpacity="0" /></radialGradient>
              </defs>
              <ellipse cx={540} cy={660} rx={420} ry={260} fill="url(#tr-neon-luce)" opacity={0.85 * lampo} />
              <rect x={430} y={640} width={220} height={26} rx={6} fill="#FFFBE6" opacity={0.25 + 0.75 * lampo} />
            </svg>
          </div>
        );
      })()}
      {tit && t < E.fine && (
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${lerp(1.12, 1, eo(seg(t, E.hit, E.hit + 2.5)))})`, transformOrigin: '540px 1000px' }}>
          <Cor T={t} z={50 + (t - E.hit) * 0.8} id="tr-tit" oggetti={(p) => <PortaInFondo p={p} z={72} T={t} apre={0.45} />} />
        </div>
      )}
      {t >= E.fine && (
        <>
          <Cor T={t} z={60 + u * 0.4} id="tr-fine" luce={0.6} />
          <div style={{ position: 'absolute', inset: 0, background: DARK, opacity: 0.72 * scr }} />
        </>
      )}

      {bande && (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 230, background: '#000' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 360, background: '#000' }} />
        </>
      )}

      {(thumb || tit) && t < E.fine && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 980, background: 'linear-gradient(180deg, rgba(12,11,6,.82) 0%, rgba(12,11,6,.62) 55%, rgba(12,11,6,0) 100%)',
          opacity: thumb ? 1 - seg(t, E.spegni + 0.2, E.nero) : kt }} />
      )}
      {thumb && (
        <div style={{ position: 'absolute', left: 120, top: 268, width: 840, textAlign: 'center', fontFamily: SANS, opacity: 1 - seg(t, E.spegni + 0.2, E.nero) }}>
          <span style={{ display: 'inline-block', padding: '8px 22px', borderRadius: 10, background: '#D9302A', color: '#FFF', fontSize: 28, fontWeight: 800, letterSpacing: '0.16em' }}>NUOVO SU YOUTUBE</span>
          <p style={{ margin: '18px 0 0', fontSize: 30, fontWeight: 800, letterSpacing: '0.24em', color: YEL, textShadow: `0 3px 0 ${DARK}` }}>SPIEGATO SEMPLICE</p>
          <h1 style={{ margin: '8px 0 0', fontFamily: ANTON, fontWeight: 400, fontSize: 178, lineHeight: 0.95, color: INK,
            textShadow: `0 8px 0 ${DARK}, 0 0 40px rgba(255,236,150,.5)` }}>BACKROOMS</h1>
          <p style={{ margin: '16px 0 0', fontSize: 40, fontWeight: 800, color: YEL, letterSpacing: '0.1em', textShadow: `0 3px 0 ${DARK}` }}>IL FINALE SPIEGATO</p>
          <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 800, color: '#E8DCB0', textShadow: `0 3px 0 ${DARK}` }}>di Kane Parsons · 2026</p>
        </div>
      )}

      {tit && (
        <div style={{ position: 'absolute', left: 120, top: 330, width: 840, textAlign: 'center', fontFamily: SANS, opacity: kt }}>
          <h1 style={{ margin: 0, fontFamily: ANTON, fontWeight: 400, fontSize: 186, lineHeight: 0.94, color: INK,
            transform: `scale(${lerp(1.3, 1, eo(seg(t, E.hit, E.hit + 0.6)))})`, textShadow: `0 8px 0 ${DARK}, 0 0 50px ${YEL}AA` }}>BACKROOMS</h1>
          <p style={{ margin: '22px 0 0', fontSize: 46, fontWeight: 800, letterSpacing: '0.2em', color: YEL, opacity: seg(t, E.hit + 0.8, E.hit + 1.3),
            textShadow: `0 3px 0 ${DARK}, 0 0 24px ${YEL}` }}>IL FINALE SPIEGATO</p>
        </div>
      )}

      {t >= E.fine && (
        <div style={{ position: 'absolute', inset: 0, fontFamily: SANS, color: INK }}>
          <p style={{ position: 'absolute', left: 120, width: 780, top: 280, margin: 0, textAlign: 'center', fontSize: 40, fontWeight: 800, letterSpacing: '0.16em', color: YEL,
            opacity: scr, textShadow: `0 3px 0 ${DARK}` }}>ORA SU YOUTUBE</p>
          <div style={{ position: 'absolute', left: 120, top: 350, width: 780, height: 439, borderRadius: 22, overflow: 'hidden', border: `5px solid ${INK}`,
            boxShadow: `0 0 50px ${YEL}55`, opacity: scr, transform: `scale(${0.9 + 0.1 * scr})` }}>
            {/* la miniatura del lungo: il fotogramma 0 (il corridoio, la porta, il titolo), ridotta in 16:9 */}
            <div style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: 'scale(0.40625)', transformOrigin: '0 0' }}>
              <Mondo T={0} pulito />
              <div style={{ position: 'absolute', left: 96, top: 170, fontFamily: ANTON, fontSize: 250, lineHeight: 0.95, color: INK, textShadow: `0 10px 0 ${DARK}` }}>BACK<br />ROOMS</div>
            </div>
            <svg viewBox="-60 -60 120 120" width="120" height="120" style={{ position: 'absolute', left: 520, top: 260 }}>
              <circle r="54" fill="#D9302A" opacity=".92" />
              <path d="M-16 -24 L26 0 L-16 24 Z" fill="#FFF" />
            </svg>
          </div>
          <div style={{ position: 'absolute', left: 120, top: 812, width: 780, opacity: scr }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {['COSA SONO', 'IL FILM', 'IL FINALE'].map((l, i) => {
                const f = Math.min(1, Math.max(0, barra * 3 - i));
                return (
                  <div key={l} style={{ flex: 1 }}>
                    <div style={{ height: 14, borderRadius: 7, background: `${INK}44`, overflow: 'hidden' }}>
                      <div style={{ width: `${f * 100}%`, height: '100%', background: '#D9302A' }} />
                    </div>
                    <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: 28, fontWeight: 800, color: f > 0.5 ? YEL : INK, textShadow: `0 3px 0 ${DARK}` }}>{l}</p>
                  </div>
                );
              })}
            </div>
          </div>
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

      {cards.map((c) => (t >= c.b && t < c.b + 0.35 ? <div key={c.a} style={{ position: 'absolute', inset: 0, background: '#050402', opacity: 1 - seg(t, c.b, c.b + 0.35) }} /> : null))}
      {lampo > 0 && <div style={{ position: 'absolute', inset: 0, background: '#FFF6DA', opacity: 0.9 * lampo }} />}
      <div style={{ position: 'absolute', inset: 0, background: DARK, opacity: 0.4 * seg(t, tempi.fine - 0.6, tempi.fine) }} />
    </div>
  );
};
