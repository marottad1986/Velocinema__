import React from 'react';
import { eio, eo, eob, lerp, seg } from '../lib/anim';
import { DISPLAY, SANS } from '../lib/fonts';

// Sigla del formato "Spiegato semplice" (CLAUDE.md): 1,5 s all'inizio della copertina, uguale per tutti gli episodi.
// Un filo aggrovigliato si scioglie in una linea dritta (la trama complicata diventa semplice), poi il nome e il badge
// FILM o SERIE. Colori fissi del formato, non quelli del film.

export const SIGLA = 1.5;

const BG = '#101418';
const INK = '#F4F1EA';
const LIME = '#D7FF5A';
const BADGE = { film: '#FF8A5B', serie: '#6FD3FF' } as const;

const N = 48;
// filo aggrovigliato (curva chiusa con nodi) → linea dritta
const KNOT = Array.from({ length: N }, (_, i) => {
  const a = (i / (N - 1)) * Math.PI * 2;
  return [540 + 250 * Math.sin(3 * a + 0.4) + 60 * Math.cos(7 * a), 960 + 150 * Math.sin(4 * a + 1.1) + 40 * Math.sin(9 * a)];
});
const LINE = Array.from({ length: N }, (_, i) => [230 + (620 * i) / (N - 1), 960]);

const pathOf = (pts: number[][]) => {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const z = pts[pts.length - 1];
  return `${d} L${z[0].toFixed(1)} ${z[1].toFixed(1)}`;
};

export const Sigla: React.FC<{ t: number; tipo: 'film' | 'serie' }> = ({ t, tipo }) => {
  const draw = eo(seg(t, 0, 0.3));
  // ogni punto si raddrizza con un piccolo ritardo da sinistra a destra
  const pts = KNOT.map((k, i) => {
    const p = eio(seg(t, 0.2 + (i / N) * 0.2, 0.55 + (i / N) * 0.2));
    return [lerp(k[0], LINE[i][0], p), lerp(k[1], LINE[i][1], p)];
  });
  const w1 = eob(seg(t, 0.5, 0.8), 1.6);
  const w2 = eob(seg(t, 0.62, 0.92), 1.6);
  const badge = eob(seg(t, 0.8, 1.05), 2);
  const out = eio(seg(t, SIGLA - 0.25, SIGLA));
  if (t >= SIGLA) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, background: BG, opacity: 1 - out, transform: `scale(${1 + out * 0.06})` }}>
      <svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="sg-glow">
            <stop offset="0" stopColor={LIME} stopOpacity=".22" />
            <stop offset="1" stopColor={LIME} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="540" cy="960" r={lerp(300, 520, eo(seg(t, 0.3, 1)))} fill="url(#sg-glow)" />
        <path d={pathOf(pts)} fill="none" stroke={LIME} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${draw} 1`} />
        <circle cx={pts[N - 1][0]} cy={pts[N - 1][1]} r={lerp(0, 18, seg(t, 0.6, 0.8))} fill={LIME} />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 800, color: INK, fontSize: 132, lineHeight: 1 }}>
        <div style={{ opacity: seg(t, 0.5, 0.6), transform: `translateY(${(1 - w1) * 40}px)` }}>Spiegato</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 800, color: LIME, fontSize: 132, lineHeight: 1 }}>
        <div style={{ opacity: seg(t, 0.62, 0.72), transform: `translateY(${(1 - w2) * -40}px)` }}>semplice</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1190, display: 'flex', justifyContent: 'center' }}>
        <span style={{ padding: '12px 30px', borderRadius: 999, background: BADGE[tipo], color: BG, fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: '0.2em', transform: `scale(${badge})` }}>
          {tipo.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
