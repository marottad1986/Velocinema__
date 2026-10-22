import React from 'react';
import { clamp01, eo, seg } from './anim';
import { SANS } from './fonts';

// Annotazioni in stile editoriale sopra le opere (QUADRI.md): linee sottili con un punto sul dettaglio,
// etichette tipografiche (maiuscoletto nel colore accento + riga descrittiva), anelli e spirali tratteggiati,
// riquadri scuri con piccoli disegni a linea bianca. Tutto nello spazio dello schermo (1080×1920) dentro
// <Annotazioni>; i punti dell'opera si portano sullo schermo con `proietta` (src/lib/quadro.tsx).

export type Pt = { x: number; y: number };

export const BIANCO = '#FFFFFF';
export const VETRO = '#0A1020';

/** Entrata (0→1) e uscita (1→0) morbide. */
const vita = (t: number, da: number, a?: number, entrata = 0.6) =>
  eo(seg(t, da, da + entrata)) * (a === undefined ? 1 : 1 - eo(seg(t, a, a + 0.4)));

/** Etichetta: occhiello in maiuscoletto (colore accento) e riga descrittiva. */
const Etichetta: React.FC<{ x: number; y: number; kicker: string; sub?: string; accento: string; dx: number; o: number; destra: boolean }> = ({ x, y, kicker, sub, accento, dx, o, destra }) => {
  // Fascia scura dietro il testo (larghezza stimata dai caratteri): leggibile anche sulle opere chiare
  const w = Math.max(kicker.length * 21, (sub?.length ?? 0) * 16.5) + 28;
  const x0 = destra ? x - 14 : x - w + 14;
  return (
    <g opacity={o} transform={`translate(${dx} 0)`}>
      <rect x={x0} y={y - 44} width={w} height={sub ? 94 : 56} rx="12" fill={VETRO} fillOpacity=".72" />
      <text x={x} y={y - 6} textAnchor={destra ? 'start' : 'end'} fontFamily={SANS} fontWeight={800} fontSize="30" letterSpacing="4" fill={accento}>
        {kicker.toUpperCase()}
      </text>
      {sub && (
        <text x={x} y={y + 34} textAnchor={destra ? 'start' : 'end'} fontFamily={SANS} fontSize="32" fill={BIANCO}>
          {sub}
        </text>
      )}
    </g>
  );
};

/**
 * Richiamo: punto sul dettaglio `to`, linea fino a `lab`, breve tratto orizzontale ed etichetta.
 * L'etichetta va a destra se `lab` sta nella metà sinistra dello schermo, altrimenti a sinistra.
 */
export const Richiamo: React.FC<{ t: number; da: number; a?: number; to: Pt; lab: Pt; kicker: string; sub?: string; accento: string; punto?: boolean }> = ({
  t, da, a, to, lab, kicker, sub, accento, punto = true,
}) => {
  if (t < da) return null;
  const v = vita(t, da, a, 0.7);
  const linea = eo(seg(t, da, da + 0.5));
  const destra = lab.x < 540;
  const end = { x: lab.x + (destra ? 40 : -40), y: lab.y };
  const o = a === undefined ? 1 : 1 - eo(seg(t, a, a + 0.4));
  const testo = eo(seg(t, da + 0.35, da + 0.8));
  return (
    <g opacity={o}>
      <path d={`M${to.x} ${to.y} L${lab.x} ${lab.y} L${end.x} ${end.y}`} fill="none" stroke={BIANCO} strokeWidth="3" pathLength={1} strokeDasharray={`${linea} 2`} />
      {punto && <circle cx={to.x} cy={to.y} r={9 * Math.min(1, v * 1.4)} fill={BIANCO} stroke="#000" strokeOpacity=".4" strokeWidth="3" />}
      <Etichetta x={end.x + (destra ? 14 : -14)} y={lab.y} kicker={kicker} sub={sub} accento={accento} dx={(1 - testo) * (destra ? -16 : 16)} o={testo} destra={destra} />
    </g>
  );
};

/** Anello tratteggiato intorno a un dettaglio. */
export const Anello: React.FC<{ t: number; da: number; a?: number; c: Pt; r: number }> = ({ t, da, a, c, r }) => {
  if (t < da) return null;
  const p = eo(seg(t, da, da + 0.7));
  const o = a === undefined ? 1 : 1 - eo(seg(t, a, a + 0.4));
  return (
    <g opacity={o} fill="none" stroke={BIANCO}>
      <circle cx={c.x} cy={c.y} r={r} strokeWidth="5" strokeOpacity=".25" stroke="#000" />
      <circle cx={c.x} cy={c.y} r={r} strokeWidth="3" strokeDasharray="10 8" opacity={p} transform={`rotate(${-90 + (1 - p) * -60} ${c.x} ${c.y})`} />
    </g>
  );
};

/** Spirale tratteggiata che segue un vortice dipinto; ruota lentamente. */
export const Spirale: React.FC<{ t: number; da: number; a?: number; c: Pt; r: number; verso?: 1 | -1 }> = ({ t, da, a, c, r, verso = 1 }) => {
  if (t < da) return null;
  const p = eo(seg(t, da, da + 1));
  const o = a === undefined ? 1 : 1 - eo(seg(t, a, a + 0.4));
  let d = '';
  for (let i = 0; i <= 50; i++) {
    const u = i / 50, ang = ((-90 + verso * 320 * u) * Math.PI) / 180, rr = r * (1 - 0.35 * u);
    d += `${i ? 'L' : 'M'}${(c.x + rr * Math.cos(ang)).toFixed(1)} ${(c.y + rr * Math.sin(ang)).toFixed(1)} `;
  }
  return (
    <g opacity={o} transform={`rotate(${verso * (t - da) * 6} ${c.x} ${c.y})`}>
      <path d={d} fill="none" stroke="#000" strokeOpacity=".3" strokeWidth="6" pathLength={1} strokeDasharray={`${p} 2`} />
      <path d={d} fill="none" stroke={BIANCO} strokeWidth="3" strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 2`} />
    </g>
  );
};

/** Traccia sottile lungo una serie di punti, con una piccola punta finale. */
export const Traccia: React.FC<{ t: number; da: number; a?: number; punti: Pt[]; dur?: number }> = ({ t, da, a, punti, dur = 1.4 }) => {
  if (t < da || punti.length < 2) return null;
  const p = eo(seg(t, da, da + dur));
  const o = a === undefined ? 1 : 1 - eo(seg(t, a, a + 0.4));
  let d = `M${punti[0].x} ${punti[0].y}`;
  for (let i = 1; i < punti.length - 1; i++) d += ` Q${punti[i].x} ${punti[i].y} ${(punti[i].x + punti[i + 1].x) / 2} ${(punti[i].y + punti[i + 1].y) / 2}`;
  const last = punti[punti.length - 1], prev = punti[punti.length - 2];
  d += ` L${last.x} ${last.y}`;
  const ang = Math.atan2(last.y - prev.y, last.x - prev.x);
  const head = (k: number) => `M${last.x - 22 * Math.cos(ang - k * 0.5)} ${last.y - 22 * Math.sin(ang - k * 0.5)} L${last.x} ${last.y}`;
  return (
    <g opacity={o} fill="none" strokeLinecap="round">
      <path d={d} stroke="#000" strokeOpacity=".3" strokeWidth="6" pathLength={1} strokeDasharray={`${p} 2`} />
      <path d={d} stroke={BIANCO} strokeWidth="3" pathLength={1} strokeDasharray={`${p} 2`} />
      <path d={`${head(1)} ${head(-1)}`} stroke={BIANCO} strokeWidth="3" opacity={clamp01((p - 0.9) * 10)} />
    </g>
  );
};

/** Riquadro scuro con titolo (maiuscoletto accento), disegno a linea bianca (coordinate locali 0..w-60) e nota. */
export const Riquadro: React.FC<{ t: number; da: number; a?: number; at: Pt; w?: number; h?: number; titolo: string; nota?: string; accento: string; children: React.ReactNode }> = ({
  t, da, a, at, w = 400, h = 340, titolo, nota, accento, children,
}) => {
  if (t < da) return null;
  const v = vita(t, da, a, 0.6);
  // Si allarga da solo se titolo o nota non ci stanno (larghezza stimata dai caratteri); il disegno resta centrato
  const W = Math.max(w, titolo.length * 21 + 56, (nota?.length ?? 0) * 15 + 56);
  return (
    <g opacity={v} transform={`translate(${at.x - W / 2} ${at.y - h / 2 + (1 - v) * 24})`}>
      <rect width={W} height={h} rx="22" fill={VETRO} fillOpacity=".84" stroke={BIANCO} strokeOpacity=".25" strokeWidth="2" />
      <text x="28" y="50" fontFamily={SANS} fontWeight={800} fontSize="26" letterSpacing="4" fill={accento}>{titolo.toUpperCase()}</text>
      <g transform={`translate(${30 + (W - w) / 2} 70)`}>{children}</g>
      {nota && <text x="28" y={h - 26} fontFamily={SANS} fontSize="28" fill={BIANCO} opacity=".9">{nota}</text>}
    </g>
  );
};

/** Contenitore SVG a tutto schermo per le annotazioni. */
export const Annotazioni: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
    {children}
  </svg>
);

/** Stile del tratto per i disegni a linea dentro i riquadri. */
export const LINEA = { stroke: BIANCO, strokeWidth: 3, fill: 'none', strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
