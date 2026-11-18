import React from 'react';
import { eio, eob, seg } from './anim';

// Binari del tempo (Ritorno al futuro, la trilogia, 18 nov 2026): la linea del tempo disegnata come una ferrovia vera,
// con le traversine di legno e due rotaie parallele anche in curva, che si posa da sola (`p`), e uno scambio con la leva e
// la lanterna che devia il tempo su un altro binario e lo rimette su quello giusto. Riutilizzabile per qualsiasi storia di
// linee del tempo, deviazioni e ritorni (multiverso, scelte, «e se…»).
// Tecnica delle due rotaie su un percorso qualsiasi: in una maschera il percorso tracciato largo in bianco e sopra, più
// stretto, in nero; riempiendo con il colore della rotaia restano due linee parallele, che seguono anche le curve.

export type BinarioProps = {
  id: string;
  d: string;
  /** 0–1: quanto del binario è posato (dall'inizio del percorso) */ p?: number;
  rail?: string; sleeper?: string; glow?: string;
  /** distanza tra le rotaie */ gauge?: number;
  opacity?: number;
  /** 0–1: luce che scorre sulle rotaie (il tempo che passa di lì) */ lit?: number;
  t?: number;
};

export const Binario: React.FC<BinarioProps> = ({ id, d, p = 1, rail = '#E8E2D2', sleeper = '#8A6A48', glow, gauge = 22, opacity = 1, lit = 0, t = 0 }) => {
  if (p <= 0 || opacity <= 0) return null;
  const big = 6000;
  return (
    <g opacity={opacity}>
      <defs>
        <mask id={`${id}-posa`} maskUnits="userSpaceOnUse" x={-big} y={-big} width={big * 3} height={big * 3}>
          <path d={d} fill="none" stroke="#fff" strokeWidth={gauge * 3} pathLength={1} strokeDasharray={`${p} 1`} />
        </mask>
        <mask id={`${id}-rot`} maskUnits="userSpaceOnUse" x={-big} y={-big} width={big * 3} height={big * 3}>
          <path d={d} fill="none" stroke="#fff" strokeWidth={gauge + 7} />
          <path d={d} fill="none" stroke="#000" strokeWidth={gauge - 5} />
        </mask>
      </defs>
      <g mask={`url(#${id}-posa)`}>
        {/* ombra della massicciata */}
        <path d={d} fill="none" stroke="#000" strokeWidth={gauge * 2.3} opacity=".22" strokeLinecap="round" />
        {/* traversine */}
        <path d={d} fill="none" stroke={sleeper} strokeWidth={gauge * 2} strokeDasharray="9 17" />
        <path d={d} fill="none" stroke="#000" strokeWidth={gauge * 2} strokeDasharray="2 24" strokeDashoffset="-7" opacity=".25" />
        {/* rotaie */}
        <g mask={`url(#${id}-rot)`}>
          <path d={d} fill="none" stroke="#0B0820" strokeWidth={gauge + 12} />
          <path d={d} fill="none" stroke={rail} strokeWidth={gauge + 12} opacity=".95" />
          {lit > 0 && glow && <path d={d} fill="none" stroke={glow} strokeWidth={gauge + 12} strokeDasharray="0.08 0.06" pathLength={1} strokeDashoffset={-t * 0.3} opacity={lit} />}
        </g>
      </g>
    </g>
  );
};

/** Lo scambio: la leva con la lanterna. `dev` 0 = dritto (lanterna verde), 1 = deviato (lanterna rossa). */
export const Scambio: React.FC<{ x: number; y: number; dev: number; t: number; ink?: string; s?: number }> = ({ x, y, dev, t, ink = '#F4EEE2', s = 1 }) => {
  const a = -28 + 56 * eio(dev);
  const col = dev > 0.5 ? '#FF5A4A' : '#7CE08A';
  const tremo = dev > 0.02 && dev < 0.98 ? Math.sin(t * 60) * 3 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round" strokeLinecap="round">
      <circle cx="0" cy="-70" r={46 + 6 * Math.sin(t * 3)} fill={col} opacity=".22" />
      <rect x="-34" y="-8" width="68" height="22" rx="5" fill="#3A3048" stroke={ink} strokeWidth="4" />
      <g transform={`rotate(${a + tremo} 0 0)`}>
        <path d="M0 0 V-62" stroke={ink} strokeWidth="8" />
        <circle cy="-66" r="9" fill={ink} />
      </g>
      <g transform="translate(26 -40)">
        <rect x="-14" y="-22" width="28" height="34" rx="5" fill="#2A2238" stroke={ink} strokeWidth="4" />
        <circle cy="-5" r="8" fill={col} />
      </g>
    </g>
  );
};

/** Un'onda di luce che corre lungo un tratto dritto di binario, da x0 a x1 (p 0–1), con la scia. */
export const OndaBinario: React.FC<{ x0: number; x1: number; y: number; p: number; color: string; t: number }> = ({ x0, x1, y, p, color, t }) => {
  if (p <= 0 || p >= 1.15) return null;
  const x = x0 + (x1 - x0) * Math.min(1, p);
  const k = 1 - seg(p, 1, 1.15);
  return (
    <g opacity={k}>
      <defs>
        <linearGradient id={`onda-${x0}-${x1}`} x1={x0} x2={x} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="1" stopColor={color} stopOpacity=".85" />
        </linearGradient>
      </defs>
      <rect x={x0} y={y - 9} width={Math.max(0, x - x0)} height="18" rx="9" fill={`url(#onda-${x0}-${x1})`} />
      <circle cx={x} cy={y} r={48 + 6 * Math.sin(t * 9)} fill={color} opacity=".25" />
      <circle cx={x} cy={y} r={eob(Math.min(1, p * 4), 1.6) * 20} fill="#FFF6D0" />
    </g>
  );
};
