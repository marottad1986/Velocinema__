import React from 'react';
import { eo, fmtTime, seg } from '../lib/anim';
import { DISPLAY, SANS } from '../lib/fonts';
import { subtitleTimes } from '../components/ChapterOverlay';
import type { Palette } from '../types';

// Elementi fissi del 16:9 (VIDEO-LUNGO.md): etichetta e titolo in alto a sinistra, sottotitoli in basso al centro.
// Zona sicura: x 96–1824, y 54–1026; sottotitoli con la base a y 1000 (sopra la barra del lettore di YouTube).

const alpha = (hex: string, a: number) => hex + Math.round(a * 255).toString(16).padStart(2, '0');

export const Overlay16: React.FC<{
  P: Palette; t: number; dur: number; T: number; total: number;
  etichetta?: string; titolo?: string; righe?: string[];
  /** secondo da cui partono i sottotitoli (copertina: niente testo nella miniatura) */ inizio?: number;
}> = ({ P, t, dur, T, total, etichetta, titolo, righe, inizio = 0 }) => {
  const pt = eo(seg(t, 0.1, 0.55));
  const times = righe ? subtitleTimes(righe, dur - inizio).map(([a, b]) => [a + inizio, b + inizio] as const) : [];
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: SANS }}>
      {etichetta && (
        <div style={{
          position: 'absolute', left: 96, top: 56, display: 'flex', alignItems: 'center', gap: 14,
          padding: '9px 22px', borderRadius: 999, background: alpha(P.scuro, 0.72), color: P.chiaro,
          fontSize: 24, fontWeight: 800, letterSpacing: '0.12em',
        }}>
          <span>{etichetta}</span>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: P.accento }} />
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtTime(T)} / {fmtTime(total)}</span>
        </div>
      )}
      {titolo && (
        <h2 style={{
          position: 'absolute', left: 96, top: 116, margin: 0, maxWidth: 1500,
          fontFamily: DISPLAY, fontWeight: 800, fontSize: 60, lineHeight: 1.05, color: P.chiaro,
          textShadow: `0 4px 0 ${P.scuro}`, opacity: pt, transform: `translateX(${(1 - pt) * 30}px)`,
        }}>{titolo}</h2>
      )}
      {righe && (
        <div style={{ position: 'absolute', left: 260, width: 1400, top: 800, height: 200 }}>
          {righe.map((line, i) => {
            const [a, b] = times[i];
            const p = seg(t, a, a + 0.12);
            const q = seg(t, b - 0.08, b);
            const o = p * (1 - q);
            return (
              <p key={i} style={{
                position: 'absolute', left: 0, right: 0, bottom: 0, margin: '0 auto', width: 'fit-content', maxWidth: 1400,
                boxSizing: 'border-box', padding: '10px 28px 12px', borderRadius: 16, background: alpha(P.scuro, 0.82),
                color: P.chiaro, fontSize: 46, lineHeight: 1.22, fontWeight: 800, textAlign: 'center', textWrap: 'balance',
                opacity: o, visibility: o > 0 ? 'visible' : 'hidden', transform: `translateY(${(1 - p) * 10}px)`,
              }}>{line}</p>
            );
          })}
        </div>
      )}
    </div>
  );
};
