import React from 'react';
import { AbsoluteFill, Img, getStaticFiles, staticFile } from 'remotion';
import { clamp01, eio, lerp, seg } from './anim';
import { SANS } from './fonts';

// Scene dei quadri (QUADRI.md): l'immagine originale dell'opera, inquadrata da una camera lenta,
// con animazioni discrete sopra. Ogni fotogramma dipende solo da t.
//
// Coordinate: tutto ciò che sta sul quadro si esprime in frazioni dell'opera (x, y da 0 a 1,
// da sinistra/alto), così non dipende dalla risoluzione della scansione.
// Dentro lo "spazio quadro" i px valgono unità: l'opera è larga 1000·aspect e alta 1000.

export type Opera = {
  /** File in public/, es. 'quadri/notte-stellata/originale.jpg' (lato lungo ~8000 px). */
  src: string;
  /** Larghezza / altezza dell'immagine. */
  aspect: number;
  /** Piani ritagliati (PNG trasparenti delle stesse dimensioni) per la parallasse: f > 1 = più vicino. */
  piani?: { src: string; f: number }[];
};

/** Inquadratura: centro (x, y) in frazioni dell'opera, h = frazione dell'altezza visibile (>1: opera intera con margine). */
export type Vista = { x: number; y: number; h: number };
/** Fotogramma chiave della camera: a t secondi la vista è v. */
export type Chiave = { t: number; v: Vista };

const H = 1000;
/** Punto del fotogramma su cui cade il centro della vista: sopra i sottotitoli, sotto il titolo. */
const FOCUS = { x: 540, y: 900 };

/** Vista al tempo t, interpolata tra i fotogrammi chiave (zoom in scala logaritmica, movimento morbido). */
export const vistaAt = (chiavi: Chiave[], t: number): Vista => {
  if (t <= chiavi[0].t) return chiavi[0].v;
  for (let i = 1; i < chiavi.length; i++) {
    const a = chiavi[i - 1];
    const b = chiavi[i];
    if (t <= b.t) {
      const p = eio(seg(t, a.t, b.t));
      return { x: lerp(a.v.x, b.v.x, p), y: lerp(a.v.y, b.v.y, p), h: Math.exp(lerp(Math.log(a.v.h), Math.log(b.v.h), p)) };
    }
  }
  return chiavi[chiavi.length - 1].v;
};

const exists = (src: string) => getStaticFiles().some((f) => f.name === src);

/** Avviso al posto dell'opera se l'immagine non è ancora in public/. */
const Mancante: React.FC<{ src: string }> = ({ src }) => (
  <AbsoluteFill style={{ background: '#1A1A1A', alignItems: 'center', justifyContent: 'center' }}>
    <p style={{ fontFamily: SANS, fontSize: 38, color: '#EEE', opacity: 0.7, width: 820, textAlign: 'center', marginTop: 200 }}>
      [immagine mancante]
      <br />
      public/{src}
    </p>
  </AbsoluteFill>
);

type QuadroProps = {
  opera: Opera;
  t: number;
  chiavi: Chiave[];
  /** Effetti nello spazio quadro (si muovono con l'opera): <Alone>, <Riflettore>, <LuceRadente>, <Vortice>… */
  children?: React.ReactNode;
  /** Effetti nello spazio del fotogramma (fermi rispetto allo schermo), sopra l'opera. */
  sopra?: React.ReactNode;
  /** Oscuramento del fondo sfocato quando l'opera non riempie il fotogramma. */
  fondo?: number;
};

/** Opera inquadrata dalla camera, con fondo sfocato, effetti e sfumature per la leggibilità dei testi. */
export const Quadro: React.FC<QuadroProps> = ({ opera, t, chiavi, children, sopra, fondo = 0.55 }) => {
  if (!exists(opera.src)) return <Mancante src={opera.src} />;
  const W = H * opera.aspect;
  const v = vistaAt(chiavi, t);
  const s = 1920 / (v.h * H);
  const tx = FOCUS.x - v.x * W * s;
  const ty = FOCUS.y - v.y * H * s;
  // Spostamento della camera rispetto all'inizio, per la parallasse dei piani
  const v0 = chiavi[0].v;
  const dx = (v.x - v0.x) * W;
  const dy = (v.y - v0.y) * H;
  const img: React.CSSProperties = { position: 'absolute', left: 0, top: 0, width: W, height: H, objectFit: 'cover' };
  return (
    <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
      {/* Fondo: l'opera piccola, sfocata e ingrandita (costa poco), visibile solo se l'opera non copre tutto */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 270, height: 480, transform: 'scale(4)', transformOrigin: '0 0', overflow: 'hidden' }}>
        <Img src={staticFile(opera.src)} style={{ width: 480 * opera.aspect, height: 480, marginLeft: (270 - 480 * opera.aspect) / 2, objectFit: 'cover', filter: 'blur(6px)' }} />
      </div>
      <AbsoluteFill style={{ background: '#000', opacity: fondo }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
        <Img src={staticFile(opera.src)} style={img} />
        {opera.piani?.map((p) => (
          <Img key={p.src} src={staticFile(p.src)} style={{ ...img, transform: `translate(${-dx * (p.f - 1)}px, ${-dy * (p.f - 1)}px)` }} />
        ))}
        {children}
      </div>
      {sopra}
      {/* Sfumature per titolo (alto) e sottotitoli (basso): non cambiano i colori dell'opera al centro */}
      <AbsoluteFill style={{ background: 'linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,0) 32%, rgba(0,0,0,0) 62%, rgba(0,0,0,.5) 80%, rgba(0,0,0,.6))' }} />
    </AbsoluteFill>
  );
};

// ——— Effetti nello spazio quadro (x, y, r in frazioni: r rispetto all'altezza dell'opera) ———

const at = (aspect: number, x: number, y: number, r: number): React.CSSProperties => ({
  position: 'absolute',
  left: x * H * aspect - r * H,
  top: y * H - r * H,
  width: 2 * r * H,
  height: 2 * r * H,
  borderRadius: '50%',
  pointerEvents: 'none',
});

/** Comparsa morbida da `da` (s) in `entrata` s; 1 se da è omesso. */
const comparsa = (t: number, da?: number, entrata = 0.6) => (da === undefined ? 1 : clamp01((t - da) / entrata));

/** Alone di luce che pulsa (stelle, luna, finestre). */
export const Alone: React.FC<{
  aspect: number; t: number; x: number; y: number; r: number; color?: string;
  forza?: number; periodo?: number; fase?: number; da?: number;
}> = ({ aspect, t, x, y, r, color = '255,236,170', forza = 0.5, periodo = 2.4, fase = 0, da }) => {
  const pulse = 0.75 + 0.25 * Math.sin(((t + fase) / periodo) * Math.PI * 2);
  const o = forza * pulse * comparsa(t, da);
  return (
    <div style={{ ...at(aspect, x, y, r), opacity: o, mixBlendMode: 'screen',
      background: `radial-gradient(circle, rgba(${color},.9) 0%, rgba(${color},.35) 35%, rgba(${color},0) 70%)` }} />
  );
};

/** Riflettore: scurisce tutto tranne un cerchio sul dettaglio. */
export const Riflettore: React.FC<{ aspect: number; t: number; x: number; y: number; r: number; buio?: number; da?: number; a?: number }> = ({
  aspect, t, x, y, r, buio = 0.55, da, a,
}) => {
  const fuori = a === undefined ? 1 : 1 - clamp01((t - a) / 0.8);
  const o = buio * comparsa(t, da, 0.8) * fuori;
  const st = at(aspect, x, y, r);
  // Un cerchio trasparente con un'ombra enorme: copre tutto il resto del fotogramma
  return <div style={{ ...st, boxShadow: `0 0 ${r * H * 0.6}px ${r * H * 0.3}px rgba(0,0,0,${o}), 0 0 0 9999px rgba(0,0,0,${o})` }} />;
};

/** Luce radente: una fascia chiara che attraversa la zona e fa risaltare lo spessore del colore. */
export const LuceRadente: React.FC<{ aspect: number; t: number; x: number; y: number; r: number; da: number; a: number; forza?: number }> = ({
  aspect, t, x, y, r, da, a, forza = 0.35,
}) => {
  const p = eio(seg(t, da, a));
  const st = at(aspect, x, y, r);
  return (
    <div style={{ ...st, borderRadius: 0, overflow: 'hidden', mixBlendMode: 'soft-light',
      maskImage: 'radial-gradient(circle, #000 55%, transparent 72%)', WebkitMaskImage: 'radial-gradient(circle, #000 55%, transparent 72%)' }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, width: '45%', left: `${lerp(-50, 105, p)}%`, opacity: forza * 2,
        background: 'linear-gradient(100deg, transparent, rgba(255,255,255,.95) 50%, transparent)' }} />
    </div>
  );
};

/** Vortice: un riflesso di luce che gira lento lungo una spirale dipinta (senza deformare l'opera). */
export const Vortice: React.FC<{ aspect: number; t: number; x: number; y: number; r: number; giri?: number; forza?: number; da?: number; verso?: 1 | -1 }> = ({
  aspect, t, x, y, r, giri = 0.08, forza = 0.35, da, verso = 1,
}) => {
  const ang = verso * t * giri * 360;
  return (
    <div style={{ ...at(aspect, x, y, r), opacity: forza * comparsa(t, da, 1), mixBlendMode: 'screen', transform: `rotate(${ang}deg)`,
      background: 'conic-gradient(from 0deg, rgba(255,250,215,0), rgba(255,250,215,.55) 12%, rgba(255,250,215,0) 30%, rgba(255,250,215,0) 50%, rgba(255,250,215,.45) 62%, rgba(255,250,215,0) 80%)',
      maskImage: 'radial-gradient(circle, transparent 18%, #000 40%, #000 55%, transparent 70%)',
      WebkitMaskImage: 'radial-gradient(circle, transparent 18%, #000 40%, #000 55%, transparent 70%)' }} />
  );
};

// ——— Effetti nello spazio del fotogramma ———

/** Ombra di sbarre di una finestra che attraversa lo schermo (da → a secondi). */
export const OmbraSbarre: React.FC<{ t: number; da: number; a: number; forza?: number }> = ({ t, da, a, forza = 0.45 }) => {
  if (t < da || t > a) return null;
  const p = seg(t, da, a);
  const o = forza * Math.sin(p * Math.PI);
  const shift = lerp(-260, 260, eio(p));
  return (
    <AbsoluteFill style={{ opacity: o, transform: `translateX(${shift}px) skewX(-8deg)` }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ position: 'absolute', top: -100, bottom: -100, left: 40 + i * 250, width: 38, background: '#000', filter: 'blur(10px)' }} />
      ))}
      <div style={{ position: 'absolute', left: -200, right: -200, top: 820, height: 34, background: '#000', filter: 'blur(10px)' }} />
    </AbsoluteFill>
  );
};
