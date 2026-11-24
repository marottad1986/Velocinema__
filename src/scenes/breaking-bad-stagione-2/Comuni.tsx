import React from 'react';
import { mod } from '../../lib/anim';
import { Glow } from '../../lib/elements';
import { K, ORO, Ombra } from '../breaking-bad-stagione-1/Comuni';

// Elementi comuni di Breaking Bad, stagione 2 (oltre a quelli della stagione 1 in ../breaking-bad-stagione-1/Comuni):
// l'orsacchiotto rosa bruciato che cade nella piscina di Walter (visto dall'alto, a faccia in giù: niente volto),
// il suo occhio di vetro, la piscina del giardino, un'auto berlina generica, le mazzette di banconote, il cellulare.
// Mai persone. L'accento giallo-oro solo sugli oggetti chiave; il rosa (#EE8FB4) solo sull'orsacchiotto.

export { K, ORO, Ombra };
export const ROSA = '#EE8FB4';

/** Gradienti degli elementi di questa stagione (una volta per scena, dentro <defs>, accanto a BBDefs). */
export const BB2Defs: React.FC<{ id: string }> = ({ id }) => (
  <>
    <radialGradient id={`${id}-bear`} cx=".4" cy=".35" r=".75"><stop offset="0" stopColor="#FFC2D8" /><stop offset=".55" stopColor={ROSA} /><stop offset="1" stopColor="#B85A84" /></radialGradient>
    <radialGradient id={`${id}-burn`} cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#1A1010" /><stop offset=".6" stopColor="#3A2420" /><stop offset="1" stopColor="#6A3A3A" stopOpacity="0" /></radialGradient>
    <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5AA8C8" /><stop offset=".5" stopColor="#3A88B0" /><stop offset="1" stopColor="#1E5A86" /></linearGradient>
    <linearGradient id={`${id}-tile`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2EEE4" /><stop offset="1" stopColor="#C8C0B0" /></linearGradient>
    <radialGradient id={`${id}-eye`} cx=".38" cy=".35" r=".7"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".6" stopColor="#E8E4DC" /><stop offset="1" stopColor="#A8A098" /></radialGradient>
    <linearGradient id={`${id}-car`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A4E58" /><stop offset=".5" stopColor="#2A2E36" /><stop offset="1" stopColor="#14161C" /></linearGradient>
    <linearGradient id={`${id}-cash`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C8DCA8" /><stop offset="1" stopColor="#8AA870" /></linearGradient>
  </>
);

/**
 * L'orsacchiotto di peluche rosa visto dall'alto, a faccia in giù nell'acqua (si vedono nuca, orecchie, schiena, zampe):
 * macchie bruciate, una cucitura sulla schiena, l'imbottitura che esce da uno strappo. Origine al centro del corpo;
 * alto ~420 a s=1. `bob` lo fa dondolare sull'acqua, `burn` 0–1 quanto è bruciato.
 */
export const Orsacchiotto: React.FC<{ id: string; x: number; y: number; s?: number; rot?: number; t?: number; bob?: number; burn?: number; wet?: number }> = ({
  id, x, y, s = 1, rot = 0, t = 0, bob = 1, burn = 1, wet = 1,
}) => {
  const dy = Math.sin(t * 1.3) * 4 * bob, dr = Math.sin(t * 0.9 + 1) * 2.5 * bob;
  const fill = `url(#${id}-bear)`;
  const limb = (d: string) => <path d={d} fill={fill} stroke={K} strokeWidth="9" strokeLinejoin="round" />;
  return (
    <g transform={`translate(${x} ${y + dy}) rotate(${rot + dr}) scale(${s})`} strokeLinecap="round">
      {/* zampe davanti e dietro, aperte */}
      {limb('M-70 -60 Q-150 -90 -190 -40 Q-210 0 -170 18 Q-120 30 -66 -6 Z')}
      {limb('M70 -60 Q150 -96 196 -54 Q220 -14 182 8 Q130 26 66 -8 Z')}
      {limb('M-60 110 Q-120 150 -126 210 Q-124 250 -84 246 Q-40 236 -20 150 Z')}
      {limb('M60 110 Q118 156 120 214 Q118 254 80 248 Q38 236 18 152 Z')}
      {/* polpastrelli cuciti sotto le zampe dietro (si vedono di sbieco) */}
      <ellipse cx="-96" cy="226" rx="22" ry="14" fill="#F6D2C8" stroke={K} strokeWidth="5" />
      <ellipse cx="94" cy="228" rx="22" ry="14" fill="#F6D2C8" stroke={K} strokeWidth="5" />
      {/* corpo */}
      <ellipse cx="0" cy="40" rx="118" ry="150" fill={fill} stroke={K} strokeWidth="10" />
      {/* testa (nuca) con le orecchie */}
      <circle cx="-74" cy="-200" r="40" fill={fill} stroke={K} strokeWidth="9" />
      <circle cx="74" cy="-200" r="40" fill={fill} stroke={K} strokeWidth="9" />
      <circle cx="-74" cy="-200" r="18" fill="#C86890" />
      <circle cx="74" cy="-200" r="18" fill="#C86890" />
      <ellipse cx="0" cy="-140" rx="104" ry="92" fill={fill} stroke={K} strokeWidth="10" />
      {/* pelo: piccoli tratti */}
      {Array.from({ length: 22 }, (_, i) => {
        const a = i * 2.39, rr = 30 + (i * 37) % 80;
        return <path key={i} d={`M${Math.cos(a) * rr} ${40 + Math.sin(a) * rr * 1.2} l6 -8`} stroke="#B85A84" strokeWidth="3" opacity=".6" />;
      })}
      {/* cucitura sulla schiena e sulla nuca */}
      <path d="M0 -200 V170" stroke="#9A4A70" strokeWidth="4" strokeDasharray="10 10" opacity=".8" />
      {/* bruciature */}
      <g opacity={burn}>
        <ellipse cx="54" cy="70" rx="70" ry="58" fill={`url(#${id}-burn)`} />
        <ellipse cx="-58" cy="-150" rx="58" ry="44" fill={`url(#${id}-burn)`} />
        <ellipse cx="-150" cy="-20" rx="44" ry="30" fill={`url(#${id}-burn)`} />
        <ellipse cx="96" cy="210" rx="36" ry="30" fill={`url(#${id}-burn)`} />
        <path d="M24 30 Q40 18 60 28 Q84 36 92 64 Q96 92 74 108 Q50 116 34 98 Q18 80 24 30 Z" fill="#20140F" stroke={K} strokeWidth="4" />
        {/* strappo con l'imbottitura */}
        <path d="M38 44 Q56 36 70 52 Q80 70 66 88 Q50 96 42 80 Q32 62 38 44 Z" fill="#F2ECE2" stroke={K} strokeWidth="3" />
        <path d="M46 56 q8 -4 14 4 M50 74 q8 2 10 -6" stroke="#C8C0B0" strokeWidth="3" fill="none" />
        {/* bordi bruciacchiati che brillano ancora */}
        <path d="M24 30 Q40 18 60 28" stroke="#F28A3A" strokeWidth="3" opacity={0.45 + 0.3 * Math.sin(t * 5)} fill="none" />
      </g>
      {/* lucido del bagnato */}
      <path d="M-70 -60 Q-90 0 -70 80" stroke="#FFFFFF" strokeWidth="6" opacity={0.35 * wet} fill="none" />
      <path d="M-40 -200 Q-60 -170 -56 -130" stroke="#FFFFFF" strokeWidth="5" opacity={0.3 * wet} fill="none" />
    </g>
  );
};

/** L'occhio di vetro dell'orsacchiotto (bianco, iride scura, riflesso). Origine al centro; `look` ruota la pupilla. */
export const Occhio: React.FC<{ id: string; x: number; y: number; r?: number; t?: number; glint?: number; look?: number }> = ({ id, x, y, r = 22, t = 0, glint = 1, look = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={r * 0.2} cy={r * 0.9} rx={r * 1.1} ry={r * 0.3} fill="#000" opacity=".3" />
    <circle r={r} fill={`url(#${id}-eye)`} stroke={K} strokeWidth={Math.max(3, r * 0.16)} />
    <circle cx={Math.cos(look) * r * 0.25} cy={Math.sin(look) * r * 0.25} r={r * 0.55} fill="#2A1E14" />
    <circle cx={Math.cos(look) * r * 0.25} cy={Math.sin(look) * r * 0.25} r={r * 0.3} fill="#050404" />
    <circle cx={-r * 0.3} cy={-r * 0.35} r={r * 0.2} fill="#FFFFFF" opacity={0.6 + 0.4 * glint} />
    {glint > 0 && <path d={`M${-r * 0.3} ${-r * 1.3} L${-r * 0.2} ${-r * 0.45} L${r * 0.6} ${-r * 0.35} L${-r * 0.2} ${-r * 0.25} L${-r * 0.3} ${r * 0.6} L${-r * 0.4} ${-r * 0.25} L${-r * 1.2} ${-r * 0.35} L${-r * 0.4} ${-r * 0.45} Z`}
      fill="#FFFFFF" opacity={glint * (0.5 + 0.5 * Math.sin(t * 3))} />}
  </g>
);

/**
 * Piscina del giardino in prospettiva (vista da un lato, dall'alto): bordo di piastrelle, acqua con le onde di luce
 * sul fondo, scaletta cromata a destra. `top` e `bot` sono le quote dei bordi lontano e vicino.
 */
export const Piscina: React.FC<{ id: string; t: number; top?: number; bot?: number; children?: React.ReactNode; bottom?: React.ReactNode }> = ({
  id, t, top = 1060, bot = 1780, children, bottom,
}) => {
  const xl0 = 170, xr0 = 910, xl1 = -80, xr1 = 1160;
  const inner = `M${xl0 + 20} ${top + 16} H${xr0 - 20} L${xr1 - 60} ${bot - 30} H${xl1 + 60} Z`;
  return (
    <g strokeLinejoin="round">
      {/* bordo di piastrelle */}
      <path d={`M${xl0 - 30} ${top - 26} H${xr0 + 30} L${xr1 + 40} ${bot + 40} H${xl1 - 40} Z`} fill={`url(#${id}-tile)`} stroke={K} strokeWidth="10" />
      {Array.from({ length: 14 }, (_, i) => {
        const f = i / 13;
        return <path key={i} d={`M${xl0 - 30 + (xr0 - xl0 + 60) * f} ${top - 26} L${xl0 + 20 + (xr0 - xl0 - 40) * f} ${top + 16}`} stroke="#A8A090" strokeWidth="3" />;
      })}
      {/* acqua */}
      <path d={inner} fill={`url(#${id}-water)`} stroke={K} strokeWidth="8" />
      {/* parete interna lontana (più scura) */}
      <path d={`M${xl0 + 20} ${top + 16} H${xr0 - 20} L${xr0 - 34} ${top + 70} H${xl0 + 34} Z`} fill="#1E4A6A" opacity=".55" />
      <path d={`M${xl0 + 34} ${top + 70} H${xr0 - 34}`} stroke="#9AD0E8" strokeWidth="4" opacity=".5" />
      {/* fondo (cose posate sul fondo, viste attraverso l'acqua) */}
      {bottom}
      {/* reticolo di luce sul fondo che si muove */}
      {Array.from({ length: 9 }, (_, j) => {
        const yy = top + 110 + j * ((bot - top - 160) / 8);
        const f = (yy - top) / (bot - top);
        const xa = xl0 + (xl1 - xl0) * f + 70, xb = xr0 + (xr1 - xr0) * f - 70;
        let d = `M${xa} ${yy}`;
        for (let k = 1; k <= 10; k++) {
          const xx = xa + ((xb - xa) * k) / 10;
          d += ` Q${xx - (xb - xa) / 20} ${yy + Math.sin(t * 1.6 + k * 1.3 + j) * (8 + 10 * f)} ${xx} ${yy + Math.sin(t * 1.2 + k + j * 0.7) * 4}`;
        }
        return <path key={j} d={d} stroke="#CFF0FA" strokeWidth={3 + 3 * f} fill="none" opacity={0.2 + 0.15 * f} />;
      })}
      {/* riflessi di cielo sulla superficie */}
      {Array.from({ length: 7 }, (_, i) => {
        const yy = top + 160 + i * 80, x0 = mod(i * 173 + t * 18, 900) + 60;
        return <path key={i} d={`M${x0} ${yy} q40 -8 80 0`} stroke="#FFFFFF" strokeWidth="5" opacity=".45" fill="none" />;
      })}
      {children}
      {/* scaletta cromata */}
      <g transform={`translate(${xr0 + 40} ${top + 40})`}>
        <path d="M0 -70 Q0 -110 40 -110 Q70 -110 70 -80 V60 M70 -70 Q70 -110 110 -110 Q140 -110 140 -80 V60" stroke="#E8ECEE" strokeWidth="12" fill="none" />
        <path d="M0 -70 Q0 -110 40 -110 Q70 -110 70 -80 V60 M70 -70 Q70 -110 110 -110 Q140 -110 140 -80 V60" stroke={K} strokeWidth="3" fill="none" opacity=".6" />
        {[0, 40].map((yy) => <path key={yy} d={`M70 ${yy} H140`} stroke="#C8D0D4" strokeWidth="8" />)}
      </g>
    </g>
  );
};

/** Berlina scura generica vista di lato (muso a destra). Origine a terra, al centro; larga ~760 a s=1. */
export const Auto: React.FC<{ id: string; x: number; y: number; s?: number; flip?: boolean; body?: string; lights?: number; t?: number; trunk?: number; spin?: number }> = ({
  id, x, y, s = 1, flip, body, lights = 0, t = 0, trunk = 0, spin = 0,
}) => {
  const ruota = (wx: number) => (
    <g transform={`translate(${wx} -58)`}>
      <circle r="62" fill="#121414" stroke={K} strokeWidth="8" />
      <circle r="30" fill={`url(#${id}-metal)`} stroke={K} strokeWidth="5" />
      <g transform={`rotate(${spin})`}>{[0, 72, 144, 216, 288].map((a) => <path key={a} d="M0 0 L0 -26" transform={`rotate(${a})`} stroke="#3A3E40" strokeWidth="5" />)}</g>
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} strokeLinejoin="round">
      <Ombra id={id} x={0} y={2} rx={430} ry={30} />
      <path d="M-380 -60 V-150 Q-380 -184 -346 -190 L-210 -204 L-110 -300 Q-90 -318 -60 -318 H130 Q160 -318 180 -298 L270 -206 L360 -194 Q392 -188 392 -156 V-60 Z" fill={body ?? `url(#${id}-car)`} stroke={K} strokeWidth="9" />
      <path d="M-90 -296 L-180 -208 H10 V-296 Z M30 -296 V-208 H240 L170 -284 Q160 -296 140 -296 Z" fill="#1A2430" stroke={K} strokeWidth="5" />
      <path d="M50 -280 L110 -220 M-60 -286 L-10 -230" stroke="#FFFFFF" strokeWidth="6" opacity=".22" />
      <path d="M-370 -150 H384" stroke="#8A94A4" strokeWidth="4" opacity=".55" />
      <path d="M20 -200 V-70 M-200 -196 V-70" stroke={K} strokeWidth="4" opacity=".7" />
      <rect x="-12" y="-170" width="30" height="8" rx="3" fill="#B8C0C8" />
      {/* bagagliaio che si apre (a sinistra) */}
      {trunk > 0 && <path d={`M-380 -190 L-380 ${-190 - 120 * trunk} L-230 ${-206 - 40 * trunk} L-210 -204 Z`} fill="#1E2228" stroke={K} strokeWidth="6" />}
      <rect x="370" y="-166" width="24" height="30" rx="5" fill={lights > 0.5 ? '#FFF6D8' : '#C8C0A8'} stroke={K} strokeWidth="4" />
      <rect x="-388" y="-170" width="16" height="34" rx="4" fill="#C8382A" stroke={K} strokeWidth="4" />
      {lights > 0 && <Glow id={`${id}-hl`} x={392} y={-150} r={260} t={t} color="#FFF0C0" amp={0.03} rate={4} opacity={0.75 * lights} />}
      <path d="M-300 -60 A80 80 0 0 1 -140 -60 M140 -60 A80 80 0 0 1 300 -60" fill="#0E1012" />
      {ruota(-220)}
      {ruota(220)}
    </g>
  );
};

/** Mazzetta di banconote con la fascetta dorata. Origine al centro. */
export const Mazzetta: React.FC<{ id: string; x: number; y: number; s?: number; rot?: number }> = ({ id, x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} strokeLinejoin="round">
    <rect x="-70" y="-22" width="140" height="44" rx="5" fill={`url(#${id}-cash)`} stroke={K} strokeWidth="5" />
    <path d="M-62 -10 H62 M-62 2 H62 M-62 14 H62" stroke="#6A8A58" strokeWidth="2" opacity=".7" />
    <ellipse cx="-36" cy="0" rx="14" ry="12" fill="none" stroke="#5A7A48" strokeWidth="3" />
    <rect x="-10" y="-23" width="22" height="46" fill={ORO} stroke={K} strokeWidth="4" />
  </g>
);
