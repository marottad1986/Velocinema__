import React from 'react';
import { Glow } from '../../lib/elements';

// Elementi comuni di Stranger Things, stagione 1: Hawkins nel novembre 1983, case di legno, bosco di abeti e querce
// spoglie, lampadine e lucine di Natale (l'unica luce calda: il giallo dell'accento va solo su lampadine, lucine e
// oggetti chiave), il Sottosopra come luce fredda azzurra con spore che fluttuano. Mai persone né il mostro intero:
// della creatura solo tracce (pareti che si gonfiano, bava, cenere, al massimo un artiglio non umano).
// Ogni oggetto ha materiale (gradiente con lato in luce e lato in ombra), bordo illuminato e dettagli da 4–6 px:
// chi lo usa passa un `id` unico per i gradienti e mette <StDefs id> nei <defs>.

export const K = '#0A0E18'; // contorni
export const GIALLO = '#F5B83D'; // accento: lampadine e lucine
export const SOTTO = '#7FB8D8'; // luce fredda del Sottosopra
export const VELATURA = '#142036';

/** Gradienti dei materiali comuni (una volta per scena, dentro <defs>). */
export const StDefs: React.FC<{ id: string }> = ({ id }) => (
  <>
    <linearGradient id={`${id}-plank`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5A4430" /><stop offset=".5" stopColor="#4A3826" /><stop offset="1" stopColor="#33261A" /></linearGradient>
    <linearGradient id={`${id}-plankside`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2E2318" /><stop offset="1" stopColor="#1E170F" /></linearGradient>
    <linearGradient id={`${id}-redwood`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5E2420" /><stop offset=".5" stopColor="#7A2E28" /><stop offset="1" stopColor="#42181A" /></linearGradient>
    <linearGradient id={`${id}-roof`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A2E38" /><stop offset="1" stopColor="#161A22" /></linearGradient>
    <linearGradient id={`${id}-siding`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#4E5A66" /><stop offset=".6" stopColor="#3C4652" /><stop offset="1" stopColor="#2A323C" /></linearGradient>
    <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3A4048" /><stop offset=".35" stopColor="#9AA2AA" /><stop offset=".55" stopColor="#5E666E" /><stop offset="1" stopColor="#262A30" /></linearGradient>
    <linearGradient id={`${id}-bark`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#141210" /><stop offset=".6" stopColor="#2A241E" /><stop offset="1" stopColor="#3A3228" /></linearGradient>
    <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity=".32" /><stop offset=".35" stopColor="#FFFFFF" stopOpacity="0" /><stop offset=".7" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="1" stopColor="#FFFFFF" stopOpacity=".12" /></linearGradient>
    <radialGradient id={`${id}-shadow`}><stop offset="0" stopColor="#000" stopOpacity=".55" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
    <radialGradient id={`${id}-bulb`} cx=".45" cy=".4" r=".6"><stop offset="0" stopColor="#FFFBEA" /><stop offset=".5" stopColor="#FFE29A" /><stop offset="1" stopColor={GIALLO} /></radialGradient>
  </>
);

/** Ombra morbida a terra sotto un oggetto. */
export const Ombra: React.FC<{ id: string; x: number; y: number; rx: number; ry?: number; opacity?: number }> = ({ id, x, y, rx, ry = rx * 0.18, opacity = 1 }) => (
  <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${id}-shadow)`} opacity={opacity} />
);

/**
 * Lampadina nuda appesa al filo: portalampada di bachelite, vetro a pera, filamento. `lit` 0..1 (0 = spenta, vetro
 * grigio), `swing` in gradi. Origine nel punto in cui il filo è attaccato al soffitto; `len` = lunghezza del filo.
 */
export const Lampadina: React.FC<{ id: string; x: number; y: number; len: number; t: number; lit: number; s?: number; swing?: number }> = ({ id, x, y, len, t, lit, s = 1, swing = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${swing}) scale(${s})`}>
    <path d={`M0 0 L0 ${len}`} stroke={K} strokeWidth="5" />
    <path d={`M1.5 0 L1.5 ${len}`} stroke="#5A5048" strokeWidth="1.5" opacity=".6" />
    <g transform={`translate(0 ${len})`}>
      <rect x="-13" y="0" width="26" height="30" rx="4" fill="#2A2420" stroke={K} strokeWidth="5" />
      <path d="M-9 6 H9 M-9 14 H9 M-9 22 H9" stroke="#5A4E44" strokeWidth="2.5" />
      <path d="M-11 30 H11 L9 38 H-9 Z" fill="#8A8478" stroke={K} strokeWidth="4" />
      <path d="M-9 38 C-26 46 -30 66 -24 80 C-18 94 -8 100 0 100 C8 100 18 94 24 80 C30 66 26 46 9 38 Z"
        fill={lit > 0.05 ? `url(#${id}-bulb)` : '#4A4E56'} stroke={K} strokeWidth="5" />
      {lit <= 0.05 && <path d="M-9 38 C-26 46 -30 66 -24 80 C-18 94 -8 100 0 100" fill="none" stroke="#8A929E" strokeWidth="3" opacity=".5" />}
      <path d="M-5 40 L-6 62 Q-3 70 0 62 Q3 70 6 62 L5 40" fill="none" stroke={lit > 0.05 ? '#FFF6D0' : '#2A2C30'} strokeWidth="2.5" />
      <path d="M-16 54 Q-20 68 -14 80" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity={0.35 + 0.4 * lit} />
      <Glow id={`${id}-bcore`} x={0} y={70} r={70} t={t} color="#FFF2C4" amp={0.05} rate={9} opacity={0.85 * lit} />
    </g>
  </g>
);

/** Abete scuro senza contorni (sfondo): tronco sottile e palchi di rami a punta. Base in (x, y). */
export const Abete: React.FC<{ x: number; y: number; h: number; w: number; color: string; seed?: number }> = ({ x, y, h, w, color, seed = 1 }) => {
  const tiers = 7;
  let d = `M${x} ${y - h}`;
  for (let i = 1; i <= tiers; i++) {
    const yy = y - h + (h * 0.9 * i) / tiers;
    const half = (w / 2) * (0.25 + 0.75 * (i / tiers));
    const j = ((seed * 31 + i * 17) % 10) / 10 - 0.5;
    d += ` L${(x + half + j * 10).toFixed(1)} ${yy.toFixed(1)} L${(x + half * 0.45).toFixed(1)} ${(yy - h * 0.03).toFixed(1)}`;
  }
  for (let i = tiers; i >= 1; i--) {
    const yy = y - h + (h * 0.9 * i) / tiers;
    const half = (w / 2) * (0.25 + 0.75 * (i / tiers));
    const j = ((seed * 13 + i * 7) % 10) / 10 - 0.5;
    d += ` L${(x - half * 0.45).toFixed(1)} ${(yy - h * 0.03).toFixed(1)} L${(x - half + j * 10).toFixed(1)} ${yy.toFixed(1)}`;
  }
  d += ' Z';
  return (
    <g>
      <rect x={x - w * 0.03} y={y - h * 0.12} width={w * 0.06} height={h * 0.12} fill={color} />
      <path d={d} fill={color} />
    </g>
  );
};
